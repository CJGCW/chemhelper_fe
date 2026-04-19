import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ELEMENTS, computeConfig, orbitalStates } from './electronConfigUtils'
import type { SubshellFill } from './electronConfigUtils'

// ── Problem pool ──────────────────────────────────────────────────────────────

type Spec = { z: number; charge: number }

const POOL: Spec[] = [
  // Diamagnetic neutral
  { z: 2,  charge: 0 },  // He  — 1s²
  { z: 4,  charge: 0 },  // Be  — [He]2s²
  { z: 10, charge: 0 },  // Ne  — all paired
  { z: 12, charge: 0 },  // Mg  — [Ne]3s²
  { z: 18, charge: 0 },  // Ar  — all paired
  { z: 20, charge: 0 },  // Ca  — [Ar]4s²
  { z: 30, charge: 0 },  // Zn  — [Ar]3d¹⁰4s²
  { z: 36, charge: 0 },  // Kr  — all paired
  // Diamagnetic ions
  { z: 11, charge:  1 }, // Na⁺ — [Ne]
  { z: 12, charge:  2 }, // Mg²⁺ — [Ne]
  { z: 17, charge: -1 }, // Cl⁻ — [Ar]
  { z: 8,  charge: -2 }, // O²⁻ — [Ne]
  { z: 7,  charge: -3 }, // N³⁻ — [Ne]
  { z: 29, charge:  1 }, // Cu⁺ — [Ar]3d¹⁰
  // Paramagnetic neutral
  { z: 1,  charge: 0 },  // H   — 1 unpaired
  { z: 3,  charge: 0 },  // Li  — 1 unpaired
  { z: 5,  charge: 0 },  // B   — 1 unpaired
  { z: 6,  charge: 0 },  // C   — 2 unpaired
  { z: 7,  charge: 0 },  // N   — 3 unpaired
  { z: 8,  charge: 0 },  // O   — 2 unpaired
  { z: 9,  charge: 0 },  // F   — 1 unpaired
  { z: 11, charge: 0 },  // Na  — 1 unpaired
  { z: 13, charge: 0 },  // Al  — 1 unpaired
  { z: 15, charge: 0 },  // P   — 3 unpaired
  { z: 16, charge: 0 },  // S   — 2 unpaired
  { z: 17, charge: 0 },  // Cl  — 1 unpaired
  { z: 22, charge: 0 },  // Ti  — 2 unpaired (3d²)
  { z: 23, charge: 0 },  // V   — 3 unpaired (3d³)
  { z: 24, charge: 0 },  // Cr  — 6 unpaired (exception: 3d⁵4s¹)
  { z: 25, charge: 0 },  // Mn  — 5 unpaired (3d⁵)
  { z: 26, charge: 0 },  // Fe  — 4 unpaired (3d⁶)
  { z: 27, charge: 0 },  // Co  — 3 unpaired (3d⁷)
  { z: 28, charge: 0 },  // Ni  — 2 unpaired (3d⁸)
  { z: 29, charge: 0 },  // Cu  — 1 unpaired (exception: 3d¹⁰4s¹)
  // Paramagnetic ions
  { z: 26, charge: 2 },  // Fe²⁺ — 4 unpaired (3d⁶)
  { z: 26, charge: 3 },  // Fe³⁺ — 5 unpaired (3d⁵)
  { z: 29, charge: 2 },  // Cu²⁺ — 1 unpaired (3d⁹)
  { z: 25, charge: 2 },  // Mn²⁺ — 5 unpaired (3d⁵)
  { z: 24, charge: 3 },  // Cr³⁺ — 3 unpaired (3d³)
]

function pick(): Spec {
  return POOL[Math.floor(Math.random() * POOL.length)]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countUnpaired(electronCount: number): number {
  return computeConfig(electronCount).reduce((sum, sub) => {
    const paired = Math.max(0, sub.electrons - sub.orbitals)
    const up     = sub.electrons - paired
    return sum + (up - paired)
  }, 0)
}

function chargeLabel(charge: number): string {
  if (charge === 0) return ''
  return charge > 0 ? `${charge}+` : `${Math.abs(charge)}−`
}

// ── Orbital box display ───────────────────────────────────────────────────────

function OrbBox({ up, down }: { up: boolean; down: boolean }) {
  const unpaired = up && !down
  return (
    <div className="w-7 h-8 rounded-sm flex items-center justify-center gap-px shrink-0"
      style={{
        border: unpaired ? '1px solid rgba(245,158,11,0.55)' : '1px solid rgba(255,255,255,0.14)',
        background: unpaired ? 'rgba(245,158,11,0.09)' : (up || down) ? 'rgba(255,255,255,0.03)' : 'transparent',
      }}>
      <span className="font-mono text-[11px] leading-none select-none"
        style={{ color: up ? (unpaired ? '#f59e0b' : 'var(--c-halogen)') : 'rgba(255,255,255,0.08)' }}>↑</span>
      <span className="font-mono text-[11px] leading-none select-none"
        style={{ color: down ? 'var(--c-halogen)' : 'rgba(255,255,255,0.08)' }}>↓</span>
    </div>
  )
}

function SubshellRow({ sub }: { sub: SubshellFill }) {
  if (sub.electrons === 0) return null
  const states = orbitalStates(sub.electrons, sub.orbitals)
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-xs text-secondary w-7 shrink-0 text-right">{sub.label}</span>
      <div className="flex gap-1">
        {states.map((s, i) => <OrbBox key={i} up={s.up} down={s.down} />)}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ParaDiaMagneticPractice() {
  const [spec,       setSpec]       = useState<Spec>(pick)
  const [answered,   setAnswered]   = useState(false)
  const [userAnswer, setUserAnswer] = useState<'para' | 'dia' | null>(null)
  const [score,      setScore]      = useState({ right: 0, total: 0 })

  const electronCount = spec.z - spec.charge
  const el            = ELEMENTS[spec.z]
  const unpaired      = countUnpaired(electronCount)
  const isPara        = unpaired > 0
  const config        = computeConfig(electronCount).filter(s => s.electrons > 0)
  const configStr     = config.map(s => `${s.label}${s.electrons}`).join(' ')
  const isCorrect     = userAnswer !== null && (userAnswer === 'para') === isPara

  function handleAnswer(answer: 'para' | 'dia') {
    if (answered) return
    setUserAnswer(answer)
    setAnswered(true)
    setScore(s => ({ right: s.right + ((answer === 'para') === isPara ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setSpec(pick())
    setAnswered(false)
    setUserAnswer(null)
  }

  const cardBorder = answered
    ? isCorrect ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  function paraStyle() {
    if (!answered) return { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.28)', color: '#f59e0b' }
    if (userAnswer === 'para') return isCorrect
      ? { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', color: '#34d399' }
      : { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.45)', color: '#f87171' }
    if (isPara) return { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', opacity: 0.7 }
    return { background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', color: 'rgba(245,158,11,0.4)' }
  }

  function diaStyle() {
    if (!answered) return { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' }
    if (userAnswer === 'dia') return isCorrect
      ? { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.5)', color: '#34d399' }
      : { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.45)', color: '#f87171' }
    if (!isPara) return { background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', opacity: 0.7 }
    return { background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)', color: 'rgba(52,211,153,0.4)' }
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.right}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.right / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={`${spec.z}-${spec.charge}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-5 transition-colors ${cardBorder}`}
      >
        {/* Written configuration */}
        <div className="font-mono text-sm text-primary bg-raised border border-border rounded-sm px-3 py-2 leading-relaxed">
          {configStr}
        </div>

        {/* Orbital box diagram */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Orbital Boxes</span>
          <div className="flex flex-col gap-1.5">
            {config.map(sub => <SubshellRow key={sub.label} sub={sub} />)}
          </div>
        </div>

        {/* Question + buttons */}
        <div className="flex flex-col gap-3">
          <p className="font-sans text-sm text-secondary">
            Is this species paramagnetic or diamagnetic?
          </p>
          <div className="flex gap-3">
            <button onClick={() => handleAnswer('para')} disabled={answered}
              className="flex-1 py-2.5 rounded-sm font-sans font-medium text-sm transition-all disabled:cursor-not-allowed"
              style={paraStyle()}>
              Paramagnetic
            </button>
            <button onClick={() => handleAnswer('dia')} disabled={answered}
              className="flex-1 py-2.5 rounded-sm font-sans font-medium text-sm transition-all disabled:cursor-not-allowed"
              style={diaStyle()}>
              Diamagnetic
            </button>
          </div>
        </div>

        {/* Result explanation */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pt-3 border-t border-border flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-sans text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                  <span className="font-sans text-sm" style={{ color: isPara ? '#f59e0b' : '#34d399' }}>
                    — {isPara ? 'Paramagnetic' : 'Diamagnetic'}
                  </span>
                </div>
                <p className="font-mono text-xs text-dim">
                  {el.name}{spec.charge !== 0 ? ` (${el.symbol}${chargeLabel(spec.charge)})` : ` (${el.symbol})`}
                </p>
                <p className="font-mono text-xs text-secondary">
                  {isPara
                    ? `${unpaired} unpaired electron${unpaired !== 1 ? 's' : ''} (amber boxes) — attracted to a magnetic field`
                    : 'All electrons paired — weakly repelled by a magnetic field'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next */}
      {answered && (
        <motion.button
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          Next →
        </motion.button>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useSpring } from 'framer-motion'
import {
  EQUATIONS, pickEquation, checkBalanced, parseAtoms,
  type BalancingEquation, type Difficulty, type BalSpecies,
} from '../../utils/balancingPractice'

// ── Live atom counter ─────────────────────────────────────────────────────────

function countAtoms(species: BalSpecies[], coeffs: string[]): number {
  return species.reduce((sum, sp, i) => {
    const c = parseInt(coeffs[i]) || 0
    return sum + Object.values(parseAtoms(sp.formula)).reduce((s, n) => s + n * c, 0)
  }, 0)
}

// ── Balance scale visualization ───────────────────────────────────────────────

function BalanceViz({ leftAtoms, rightAtoms }: { leftAtoms: number; rightAtoms: number }) {
  const diff        = rightAtoms - leftAtoms
  const total       = leftAtoms + rightAtoms
  const targetAngle = total > 0 ? Math.max(-20, Math.min(20, (diff / total) * 32)) : 0
  const isBalanced  = total > 0 && diff === 0
  const beamColor   = isBalanced ? '#4ade80' : 'rgba(var(--overlay),0.38)'

  const springAngle = useSpring(0, { stiffness: 180, damping: 26 })
  const gRef        = useRef<SVGGElement>(null)

  useEffect(() => { springAngle.set(targetAngle) }, [targetAngle, springAngle])

  useEffect(() =>
    springAngle.on('change', v => {
      gRef.current?.setAttribute('transform', `rotate(${v} 100 8)`)
    }),
    [springAngle],
  )

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 200 32" style={{ width: 180, height: 29 }} aria-hidden="true">
        {/* Static fulcrum */}
        <polygon points="100,8 93,28 107,28" fill="rgba(var(--overlay),0.18)" />
        {/* Rotating beam + pans */}
        <g ref={gRef}>
          <line x1="10" y1="8" x2="190" y2="8" stroke={beamColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="10"  y1="8" x2="10"  y2="19" stroke="rgba(var(--overlay),0.2)" strokeWidth="1" />
          <line x1="190" y1="8" x2="190" y2="19" stroke="rgba(var(--overlay),0.2)" strokeWidth="1" />
          <rect x="3"   y="19" width="14" height="5" rx="1"
            fill="rgba(var(--overlay),0.06)" stroke={beamColor} strokeWidth="0.8" />
          <rect x="183" y="19" width="14" height="5" rx="1"
            fill="rgba(var(--overlay),0.06)" stroke={beamColor} strokeWidth="0.8" />
        </g>
        {/* Pivot dot */}
        <circle cx="100" cy="8" r="2.5" fill="rgba(var(--overlay),0.5)" />
      </svg>
      <div className="flex justify-between font-mono text-[10px]" style={{ width: 180 }}>
        <span style={{ color: leftAtoms  > 0 ? beamColor : 'rgba(var(--overlay),0.2)' }}>
          {leftAtoms  || '—'} atoms
        </span>
        <span style={{ color: rightAtoms > 0 ? beamColor : 'rgba(var(--overlay),0.2)' }}>
          {rightAtoms || '—'} atoms
        </span>
      </div>
    </div>
  )
}

// ── Difficulty pill selector ──────────────────────────────────────────────────

const DIFFICULTIES: { id: Difficulty | 'all'; label: string }[] = [
  { id: 'all',    label: 'All'    },
  { id: 'easy',   label: 'Easy'   },
  { id: 'medium', label: 'Medium' },
  { id: 'hard',   label: 'Hard'   },
]

const DIFF_COLORS: Record<Difficulty, string> = {
  easy:   '#86efac',
  medium: '#fbbf24',
  hard:   '#f87171',
}

// ── Equation display with inputs ──────────────────────────────────────────────

interface CoeffInputProps {
  value:    string
  onChange: (v: string) => void
  correct?: boolean | null   // null = unchecked
  disabled: boolean
  inputRef?: React.Ref<HTMLInputElement>
  onEnter?: () => void
}

function CoeffInput({ value, onChange, correct, disabled, inputRef, onEnter }: CoeffInputProps) {
  const borderColor =
    correct === true  ? 'rgba(52,211,153,0.7)'  :
    correct === false ? 'rgba(248,113,113,0.7)'  :
                        'rgba(var(--overlay),0.2)'

  return (
    <input
      ref={inputRef}
      type="number"
      min="1"
      step="1"
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      disabled={disabled}
      placeholder="_"
      className="w-10 text-center font-mono text-base bg-raised rounded-sm
                 focus:outline-none disabled:cursor-not-allowed transition-colors
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none"
      style={{
        border: `1px solid ${borderColor}`,
        color: correct === true ? '#6ee7b7' : correct === false ? '#fca5a5' : 'var(--c-bright)',
      }}
    />
  )
}

// ── Equation line ─────────────────────────────────────────────────────────────

interface EquationLineProps {
  eq:              BalancingEquation
  reactantCoeffs:  string[]
  productCoeffs:   string[]
  setReactant:     (i: number, v: string) => void
  setProduct:      (i: number, v: string) => void
  correctMap:      (boolean | null)[]   // one per species in order reactants→products
  disabled:        boolean
  onEnter:         () => void
}

function EquationLine({
  eq, reactantCoeffs, productCoeffs, setReactant, setProduct,
  correctMap, disabled, onEnter,
}: EquationLineProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 font-mono text-base text-bright leading-none">
      {eq.reactants.map((sp, i) => (
        <span key={sp.formula} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-secondary">+</span>}
          <CoeffInput
            value={reactantCoeffs[i]}
            onChange={v => setReactant(i, v)}
            correct={correctMap[i]}
            disabled={disabled}
            inputRef={i === 0 ? firstInputRef : undefined}
            onEnter={onEnter}
          />
          <span>{sp.display}</span>
        </span>
      ))}

      <span className="text-secondary mx-1">→</span>

      {eq.products.map((sp, i) => (
        <span key={sp.formula} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-secondary">+</span>}
          <CoeffInput
            value={productCoeffs[i]}
            onChange={v => setProduct(i, v)}
            correct={correctMap[eq.reactants.length + i]}
            disabled={disabled}
            onEnter={onEnter}
          />
          <span>{sp.display}</span>
        </span>
      ))}
    </div>
  )
}

// ── Atom count table ──────────────────────────────────────────────────────────

function AtomTable({ elements }: { elements: { element: string; left: number; right: number }[] }) {
  return (
    <div className="rounded-sm border border-border overflow-hidden">
      <div className="grid grid-cols-[3rem_4rem_4rem_1.5rem] gap-x-3 px-4 py-2 bg-raised border-b border-border">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Atom</span>
        <span className="font-mono text-xs text-secondary tracking-widest uppercase text-center">Left</span>
        <span className="font-mono text-xs text-secondary tracking-widest uppercase text-center">Right</span>
        <span />
      </div>
      {elements.map(e => {
        const ok = e.left === e.right && e.left > 0
        return (
          <div
            key={e.element}
            className="grid grid-cols-[3rem_4rem_4rem_1.5rem] gap-x-3 px-4 py-2
                       border-b border-border last:border-b-0 bg-surface"
          >
            <span className="font-mono text-sm font-semibold text-bright">{e.element}</span>
            <span className={`font-mono text-sm text-center ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>{e.left}</span>
            <span className={`font-mono text-sm text-center ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>{e.right}</span>
            <span className="font-mono text-sm text-center">{ok ? '✓' : '✗'}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BalancingPractice() {
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [eq,         setEq]         = useState<BalancingEquation>(() => pickEquation())
  const [rCoeffs,    setRCoeffs]    = useState<string[]>(() => eq.reactants.map(() => ''))
  const [pCoeffs,    setPCoeffs]    = useState<string[]>(() => eq.products.map(() => ''))
  const [result,     setResult]     = useState<ReturnType<typeof checkBalanced> | null>(null)
  const [score,      setScore]      = useState({ right: 0, total: 0 })

  function nextEquation(diff: Difficulty | 'all' = difficulty) {
    // avoid repeating the same equation if possible
    const pool = EQUATIONS.filter(e => diff === 'all' || e.difficulty === diff)
    const candidates = pool.length > 1 ? pool.filter(e => e.name !== eq.name) : pool
    const next = candidates[Math.floor(Math.random() * candidates.length)]
    setEq(next)
    setRCoeffs(next.reactants.map(() => ''))
    setPCoeffs(next.products.map(() => ''))
    setResult(null)
  }

  function handleDifficultyChange(d: Difficulty | 'all') {
    setDifficulty(d)
    setScore({ right: 0, total: 0 })
    nextEquation(d)
  }

  function handleCheck() {
    const rNums = rCoeffs.map(v => parseInt(v) || 0)
    const pNums = pCoeffs.map(v => parseInt(v) || 0)
    const r = checkBalanced(eq, rNums, pNums)
    setResult(r)
    setScore(s => ({ right: s.right + (r.balanced ? 1 : 0), total: s.total + 1 }))
  }

  const canCheck = [...rCoeffs, ...pCoeffs].every(v => v.trim() !== '' && parseInt(v) >= 1)

  // correctMap: null until checked, then true/false per coefficient
  const correctMap: (boolean | null)[] = result === null
    ? [...eq.reactants, ...eq.products].map(() => null)
    : [
        ...eq.reactants.map((_, i) => parseInt(rCoeffs[i]) === eq.reactants[i].coeff),
        ...eq.products.map( (_, i) => parseInt(pCoeffs[i]) === eq.products[i].coeff),
      ]

  // But if the equation is balanced but uses a different multiple, all should be green
  // We accept any valid balancing, not just the canonical coefficients
  // Use the result.balanced + per-element check instead
  const atomCorrectMap: (boolean | null)[] = result === null
    ? [...eq.reactants, ...eq.products].map(() => null)
    : result.balanced
      ? [...eq.reactants, ...eq.products].map(() => true as boolean)
      : correctMap

  const borderClass = result === null
    ? 'border-border bg-surface'
    : result.balanced
      ? 'border-emerald-800/50 bg-emerald-950/20'
      : 'border-rose-800/50 bg-rose-950/20'

  // Live atom counts for the balance visualization
  const leftAtoms  = countAtoms(eq.reactants, rCoeffs)
  const rightAtoms = countAtoms(eq.products,  pCoeffs)

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Difficulty selector */}
      <div className="flex flex-wrap gap-1.5">
        {DIFFICULTIES.map(d => {
          const isActive = difficulty === d.id
          const color = d.id !== 'all' ? DIFF_COLORS[d.id as Difficulty] : 'var(--c-halogen)'
          return (
            <button
              key={d.id}
              onClick={() => handleDifficultyChange(d.id)}
              className="px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={isActive ? {
                background: `color-mix(in srgb, ${color} 14%, rgb(var(--color-raised)))`,
                border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
                color,
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.4)',
              }}
            >
              {d.label}
            </button>
          )
        })}
      </div>

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.right}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.right / score.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <motion.div
        key={eq.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-5 transition-colors ${borderClass}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-sans text-sm text-secondary">{eq.name}</span>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded-sm border"
            style={{
              color: DIFF_COLORS[eq.difficulty],
              borderColor: `color-mix(in srgb, ${DIFF_COLORS[eq.difficulty]} 35%, transparent)`,
              background: `color-mix(in srgb, ${DIFF_COLORS[eq.difficulty]} 10%, transparent)`,
            }}
          >
            {eq.difficulty}
          </span>
        </div>

        {/* Equation with inputs */}
        <EquationLine
          eq={eq}
          reactantCoeffs={rCoeffs}
          productCoeffs={pCoeffs}
          setReactant={(i, v) => { setRCoeffs(c => c.map((x, j) => j === i ? v : x)); setResult(null) }}
          setProduct={(i, v) => { setPCoeffs(c => c.map((x, j) => j === i ? v : x)); setResult(null) }}
          correctMap={atomCorrectMap}
          disabled={result?.balanced === true}
          onEnter={canCheck && !result?.balanced ? handleCheck : () => {}}
        />

        {/* Live balance scale */}
        <BalanceViz leftAtoms={leftAtoms} rightAtoms={rightAtoms} />

        {/* Check button / result */}
        <div className="flex items-center gap-3 flex-wrap">
          {!result?.balanced ? (
            <button
              onClick={handleCheck}
              disabled={!canCheck}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              Check
            </button>
          ) : (
            <span className="font-sans text-sm font-medium text-emerald-400">✓ Balanced!</span>
          )}

          {result && !result.balanced && (
            <span className="font-sans text-sm text-rose-400">✗ Not balanced — check the atom counts below</span>
          )}
        </div>

        {/* Atom count table */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-3">
                <AtomTable elements={result.elements} />
                {!result.balanced && (
                  <p className="font-mono text-xs text-dim">
                    Tip: adjust coefficients so every element count matches on both sides.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next button */}
      {result?.balanced && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => nextEquation()}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          Next →
        </motion.button>
      )}
    </div>
  )
}

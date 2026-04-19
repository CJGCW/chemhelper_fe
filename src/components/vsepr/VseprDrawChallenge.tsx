import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LewisStructure } from '../../pages/LewisPage'
import KetcherStructureEditor from './KetcherStructureEditor'
import KetcherGuide from './KetcherGuide'

// ── Editor Guide modal ────────────────────────────────────────────────────────

function EditorGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="guide-backdrop"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-2xl rounded-sm border border-border flex flex-col"
          style={{ background: 'rgb(var(--color-surface))' }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.18 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <span className="font-sans font-medium text-sm text-primary">Editor Guide</span>
            <button
              onClick={onClose}
              className="font-mono text-xs text-dim hover:text-primary transition-colors px-1"
            >
              ✕
            </button>
          </div>
          <div className="p-5 overflow-y-auto">
            <KetcherGuide />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Compound pool ─────────────────────────────────────────────────────────────

const COMPOUNDS = [
  { label: 'water (H₂O)',                       formula: 'H2O',  charge:  0 },
  { label: 'carbon dioxide (CO₂)',               formula: 'CO2',  charge:  0 },
  { label: 'ammonia (NH₃)',                      formula: 'NH3',  charge:  0 },
  { label: 'methane (CH₄)',                      formula: 'CH4',  charge:  0 },
  { label: 'boron trifluoride (BF₃)',            formula: 'BF3',  charge:  0 },
  { label: 'sulfur dioxide (SO₂)',               formula: 'SO2',  charge:  0 },
  { label: 'nitrate (NO₃⁻)',                     formula: 'NO3',  charge: -1 },
  { label: 'ammonium (NH₄⁺)',                    formula: 'NH4',  charge:  1 },
  { label: 'sulfate (SO₄²⁻)',                    formula: 'SO4',  charge: -2 },
  { label: 'phosphorus pentachloride (PCl₅)',    formula: 'PCl5', charge:  0 },
  { label: 'sulfur hexafluoride (SF₆)',          formula: 'SF6',  charge:  0 },
  { label: 'xenon tetrafluoride (XeF₄)',         formula: 'XeF4', charge:  0 },
  { label: 'hydrogen cyanide (HCN)',             formula: 'HCN',  charge:  0 },
  { label: 'oxygen difluoride (OF₂)',            formula: 'OF2',  charge:  0 },
  { label: 'hydrogen sulfide (H₂S)',             formula: 'H2S',  charge:  0 },
  { label: 'formaldehyde (CH₂O)',                formula: 'CH2O', charge:  0 },
]

function pickNext(exclude: number): number {
  let next: number
  do { next = Math.floor(Math.random() * COMPOUNDS.length) } while (next === exclude)
  return next
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VseprDrawChallenge() {
  const [idx, setIdx]               = useState(() => Math.floor(Math.random() * COMPOUNDS.length))
  const [structure, setStructure]   = useState<LewisStructure | null>(null)
  const [fetching, setFetching]     = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<boolean | null>(null)
  const [score, setScore]           = useState({ correct: 0, attempted: 0 })
  const [resetKey, setResetKey]     = useState(0)
  const [guideOpen, setGuideOpen]   = useState(false)

  const compound = COMPOUNDS[idx]

  useEffect(() => {
    let cancelled = false
    setStructure(null)
    setFetchError(null)
    setFetching(true)
    setLastResult(null)

    const body: Record<string, unknown> = { input: compound.formula }
    if (compound.charge !== 0) body.charge = compound.charge

    fetch('/api/structure/lewis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (cancelled) return
        if (ok) setStructure(d as LewisStructure)
        else setFetchError(d.error ?? 'Failed to load problem.')
      })
      .catch(() => { if (!cancelled) setFetchError('Failed to connect to server.') })
      .finally(() => { if (!cancelled) setFetching(false) })

    return () => { cancelled = true }
  }, [idx]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleValidated(passed: boolean) {
    setLastResult(passed)
    setScore(s => ({ correct: s.correct + (passed ? 1 : 0), attempted: s.attempted + 1 }))
  }

  function nextProblem() {
    setIdx(prev => pickNext(prev))
    setResetKey(k => k + 1)
  }

  const pct = score.attempted > 0 ? Math.round((score.correct / score.attempted) * 100) : null

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-2">

        {/* Top row: guide + score */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setGuideOpen(true)}
            className="px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
            style={{
              background: 'rgb(var(--color-raised))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-secondary))',
            }}
          >
            Editor Guide
          </button>

          {score.attempted > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-dim">
                <span className="text-bright">{score.correct}</span>
                <span className="text-dim"> / {score.attempted}</span>
                {pct !== null && (
                  <span className="ml-1.5" style={{ color: pct >= 80 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171' }}>
                    {pct}%
                  </span>
                )}
              </span>
              <button
                onClick={() => setScore({ correct: 0, attempted: 0 })}
                className="font-mono text-[10px] text-dim hover:text-secondary transition-colors"
              >
                reset
              </button>
            </div>
          )}
        </div>

        {/* Prompt row: label + skip inline */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">
            Draw the structure of
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-sans font-semibold text-bright text-2xl">{compound.label}</span>
            {fetching && <span className="font-mono text-xs text-dim animate-pulse">loading…</span>}
            <button
              onClick={nextProblem}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              {lastResult === null ? 'Skip' : 'Next Problem →'}
            </button>
          </div>
          <p className="font-mono text-xs text-dim mt-0.5">
            Use wedge (▶) and dash (– –) bonds to show 3D geometry
          </p>
          {fetchError && <p className="font-mono text-xs text-red-400 mt-1">{fetchError}</p>}
        </div>

      </div>

      {/* Result banner */}
      <AnimatePresence>
        {lastResult !== null && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-4 py-3 rounded-sm border"
            style={{
              borderColor: lastResult
                ? 'color-mix(in srgb, #4ade80 30%, transparent)'
                : 'color-mix(in srgb, #f87171 30%, transparent)',
              background: lastResult ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
            }}
          >
            <span className="font-mono text-base" style={{ color: lastResult ? '#4ade80' : '#f87171' }}>
              {lastResult ? '✓' : '✗'}
            </span>
            <span className="font-sans text-sm" style={{ color: lastResult ? '#4ade80' : '#f87171' }}>
              {lastResult
                ? 'Correct! Hit Next Problem to continue.'
                : 'Not quite — review the check details, then try again or move on.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ketcher editor */}
      <KetcherStructureEditor
        correctStructure={structure}
        onValidated={handleValidated}
        resetKey={resetKey}
      />

      {guideOpen && <EditorGuideModal onClose={() => setGuideOpen(false)} />}
    </div>
  )
}

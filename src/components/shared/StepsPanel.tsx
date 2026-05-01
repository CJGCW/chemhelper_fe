import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExampleData } from './WorkedExample'
import { useShowAnswers } from '../../stores/preferencesStore'

// ── Shared state hook ──────────────────────────────────────────────────────────

export interface StepsPanelState {
  open: boolean
  toggle: () => void
  hasCalcSteps: boolean
  hasContent: boolean
  exampleData: ExampleData | null
  activeSteps: string[]
  revealed: number
}

export function useStepsPanelState(steps: string[], generate?: () => ExampleData): StepsPanelState {
  const [open, setOpen]             = useState(false)
  const [exampleData, setExampleData] = useState<ExampleData | null>(null)
  const [revealed, setRevealed]     = useState(0)

  const hasCalcSteps = steps.length > 0
  const activeSteps  = hasCalcSteps ? steps : (exampleData?.steps ?? [])
  const total        = hasCalcSteps
    ? activeSteps.length
    : exampleData ? exampleData.steps.length + 1 : 0
  const done = total > 0 && revealed >= total

  const stepsKey = steps.join('\u0000')
  useEffect(() => {
    setOpen(false)
    setExampleData(null)
    setRevealed(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsKey])

  useEffect(() => {
    if (!open) {
      setRevealed(0)
      if (!hasCalcSteps) setExampleData(null)
    }
  }, [open, hasCalcSteps])

  useEffect(() => {
    if (!open || done || total === 0) return
    const t = setTimeout(() => setRevealed(r => r + 1), 400)
    return () => clearTimeout(t)
  }, [open, revealed, done, total])

  function toggle() {
    if (open) {
      setOpen(false)
    } else {
      if (!hasCalcSteps && generate) setExampleData(generate())
      setRevealed(0)
      setOpen(true)
    }
  }

  return { open, toggle, hasCalcSteps, hasContent: hasCalcSteps || !!generate, exampleData, activeSteps, revealed }
}

// ── Trigger button (for inline row use) ───────────────────────────────────────

export function StepsTrigger({ open, toggle, hasCalcSteps, hasContent }: Pick<StepsPanelState, 'open' | 'toggle' | 'hasCalcSteps' | 'hasContent'>) {
  if (!hasContent) return null
  const label = hasCalcSteps ? 'Show calculation steps' : 'Show me an example'
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 rounded-sm font-sans text-sm transition-colors border h-full"
      style={{
        color: 'var(--c-halogen)',
        borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)',
        background: 'color-mix(in srgb, var(--c-halogen) 8%, transparent)',
      }}
    >
      <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }} className="font-mono text-xs inline-block">▶</motion.span>
      <span>{label}</span>
    </button>
  )
}

// ── Expanded content ───────────────────────────────────────────────────────────

export function StepsContent({ open, hasCalcSteps, exampleData, activeSteps, revealed }: Omit<StepsPanelState, 'toggle' | 'hasContent'>) {
  const showAnswers = useShowAnswers()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="steps-card"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="rounded-sm border border-border bg-raised px-4 py-3 flex flex-col gap-3">
            {!hasCalcSteps && exampleData && (
              <p className="font-sans text-sm text-secondary leading-relaxed">{exampleData.scenario}</p>
            )}
            {showAnswers ? (
              <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
                {activeSteps.slice(0, revealed).map((step, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="font-mono text-sm text-primary">
                    {step}
                  </motion.p>
                ))}
                {!hasCalcSteps && exampleData && revealed > exampleData.steps.length && (
                  <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="font-mono text-sm font-semibold text-emerald-400 mt-1">
                    ∴ {exampleData.result}
                  </motion.p>
                )}
              </div>
            ) : (
              <p className="font-sans text-sm text-dim italic">Step-by-step solution hidden.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Default: self-managed wrapper (for places that don't need the row layout) ──

interface Props {
  steps: string[]
  generate?: () => ExampleData
}

export default function StepsPanel({ steps, generate }: Props) {
  const state = useStepsPanelState(steps, generate)
  if (!state.hasContent) return null
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={state.toggle}
        className="self-start flex items-center gap-2 px-3 py-1.5 rounded-sm font-sans text-sm transition-colors border"
        style={{
          color: 'var(--c-halogen)',
          borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          background: 'color-mix(in srgb, var(--c-halogen) 8%, transparent)',
        }}
      >
        <motion.span animate={{ rotate: state.open ? 90 : 0 }} transition={{ duration: 0.2 }} className="font-mono text-xs inline-block">▶</motion.span>
        <span>{state.hasCalcSteps ? 'Show calculation steps' : 'Show me an example'}</span>
      </button>
      <StepsContent {...state} />
    </div>
  )
}

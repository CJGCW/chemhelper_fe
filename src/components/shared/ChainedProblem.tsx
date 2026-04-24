import { useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberField from './NumberField'

export interface ChainedStep {
  id:             string
  prompt:         ReactNode
  expectedAnswer: number
  answerUnit:     string
  tolerance?:     number   // relative, default 0.02
  hint?:          ReactNode
  explanation?:   ReactNode
}

export interface ChainedProblemProps {
  scenario:    ReactNode
  steps:       ChainedStep[]
  onComplete?: (allCorrect: boolean) => void
}

interface StepState {
  answer:   string
  verify:   'none' | 'correct' | 'incorrect'
  revealed: boolean
  expanded: boolean
}

function fmtAnswer(n: number): string {
  if (Math.abs(n) >= 100000) return parseFloat(n.toExponential(3)).toString()
  if (Math.abs(n) >= 10)     return parseFloat(n.toPrecision(4)).toString()
  return parseFloat(n.toPrecision(4)).toString()
}

export default function ChainedProblem({ scenario, steps, onComplete }: ChainedProblemProps) {
  const [stepStates, setStepStates] = useState<StepState[]>(() =>
    steps.map(() => ({ answer: '', verify: 'none', revealed: false, expanded: false }))
  )
  const [completionFired, setCompletionFired] = useState(false)

  const activeIdx = stepStates.findIndex(s => s.verify !== 'correct' && !s.revealed)
  const allDone   = activeIdx === -1
  const correctCount = stepStates.filter(s => s.verify === 'correct').length

  if (allDone && !completionFired) {
    setCompletionFired(true)
    onComplete?.(correctCount === steps.length)
  }

  function patch(idx: number, delta: Partial<StepState>) {
    setStepStates(prev => prev.map((s, i) => i === idx ? { ...s, ...delta } : s))
  }

  function handleCheck(idx: number) {
    const step = steps[idx]
    const val  = parseFloat(stepStates[idx].answer)
    if (isNaN(val)) return
    const tol = step.tolerance ?? 0.02
    const ok  = Math.abs(val - step.expectedAnswer) / Math.abs(step.expectedAnswer) <= tol
    patch(idx, { verify: ok ? 'correct' : 'incorrect', expanded: ok ? true : false })
  }

  function handleReveal(idx: number) {
    patch(idx, {
      revealed: true,
      answer:   fmtAnswer(steps[idx].expectedAnswer),
      expanded: true,
    })
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Scenario */}
      <div className="rounded-sm border border-border p-4"
        style={{ background: 'rgb(var(--color-surface))' }}>
        <p className="font-sans text-sm text-primary leading-relaxed">{scenario}</p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step, idx) => {
          const ss         = stepStates[idx]
          const isActive   = idx === activeIdx
          const isDone     = ss.verify === 'correct' || ss.revealed
          const isUpcoming = !isActive && !isDone
          const isCorrect  = ss.verify === 'correct'
          const isRevealed = ss.revealed

          const borderColor = isDone
            ? (isCorrect
                ? 'color-mix(in srgb, #4ade80 38%, rgb(var(--color-border)))'
                : 'color-mix(in srgb, #f87171 28%, rgb(var(--color-border)))')
            : isActive
            ? 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))'
            : 'rgb(var(--color-border))'

          const badgeColor = isDone
            ? (isCorrect ? '#4ade80' : '#f87171')
            : isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)'

          return (
            <motion.div key={step.id} layout transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="rounded-sm border p-4 flex flex-col gap-3"
              style={{
                borderColor,
                background: isUpcoming ? 'rgb(var(--color-base))' : 'rgb(var(--color-surface))',
                opacity: isUpcoming ? 0.42 : 1,
                transition: 'opacity 0.3s, border-color 0.25s, background 0.25s',
              }}>

              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm"
                    style={{
                      color: badgeColor,
                      background: `color-mix(in srgb, ${badgeColor} 13%, transparent)`,
                      border:     `1px solid color-mix(in srgb, ${badgeColor} 28%, transparent)`,
                    }}>
                    Step {idx + 1}
                  </span>
                  {isDone && (
                    <span className="font-mono text-xs"
                      style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
                      {isCorrect ? '✓ correct' : isRevealed ? '→ shown' : '✗'}
                    </span>
                  )}
                </div>
                {isDone && step.explanation && (
                  <button
                    onClick={() => patch(idx, { expanded: !ss.expanded })}
                    className="font-mono text-[10px] text-secondary hover:text-primary transition-colors shrink-0">
                    {ss.expanded ? '▲ hide' : '▼ explain'}
                  </button>
                )}
              </div>

              {/* Prompt */}
              <p className="font-sans text-sm text-primary leading-relaxed">{step.prompt}</p>

              {/* Hint */}
              {isActive && step.hint && (
                <p className="font-mono text-xs text-secondary">{step.hint}</p>
              )}

              {/* Answer row */}
              {(isActive || isDone) && (
                <div className="flex items-end gap-2">
                  <div className="flex-1 max-w-xs">
                    <NumberField
                      label=""
                      value={ss.answer}
                      onChange={v => {
                        if (!isDone) patch(idx, { answer: v, verify: 'none' })
                      }}
                      placeholder="your answer"
                      disabled={isDone || isUpcoming}
                      unit={
                        <span className="font-mono text-sm text-secondary px-2">
                          {step.answerUnit}
                        </span>
                      }
                    />
                  </div>

                  {isActive && (
                    ss.verify === 'incorrect' ? (
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => patch(idx, { verify: 'none' })}
                          className="shrink-0 px-3 py-2 rounded-sm font-sans text-sm font-medium"
                          style={{
                            background: 'color-mix(in srgb, #facc15 11%, rgb(var(--color-raised)))',
                            border:     '1px solid color-mix(in srgb, #facc15 28%, transparent)',
                            color:      '#facc15',
                          }}>
                          Try again
                        </button>
                        <button
                          onClick={() => handleReveal(idx)}
                          className="shrink-0 px-3 py-2 rounded-sm font-sans text-sm font-medium"
                          style={{
                            background: 'color-mix(in srgb, #f87171 9%, rgb(var(--color-raised)))',
                            border:     '1px solid color-mix(in srgb, #f87171 22%, transparent)',
                            color:      '#f87171',
                          }}>
                          Show &amp; continue
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheck(idx)}
                        disabled={!ss.answer.trim()}
                        className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                          border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                          color:      'var(--c-halogen)',
                        }}>
                        Check
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Incorrect feedback */}
              {isActive && ss.verify === 'incorrect' && (
                <p className="font-mono text-xs" style={{ color: '#f87171' }}>
                  Not quite — check your numbers and try again, or show the answer to continue.
                </p>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {isDone && ss.expanded && step.explanation && (
                  <motion.p
                    key="expl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-sans text-xs leading-relaxed overflow-hidden"
                    style={{ color: 'rgba(var(--overlay),0.55)', marginTop: 2 }}>
                    {step.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Completion summary */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-sm border p-4 flex items-center justify-between gap-3"
            style={{
              borderColor: correctCount === steps.length
                ? 'color-mix(in srgb, #4ade80 38%, rgb(var(--color-border)))'
                : 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))',
              background: correctCount === steps.length
                ? 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-surface)))'
                : 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))',
            }}>
            <span className="font-sans text-sm font-semibold"
              style={{ color: correctCount === steps.length ? '#4ade80' : 'var(--c-halogen)' }}>
              {correctCount === steps.length
                ? `All ${steps.length} steps correct!`
                : `${correctCount} of ${steps.length} steps solved correctly`}
            </span>
            <button
              onClick={() => {
                const allExpanded = stepStates.every(s => s.expanded)
                setStepStates(prev => prev.map(s => ({ ...s, expanded: !allExpanded })))
              }}
              className="font-mono text-xs text-secondary hover:text-primary transition-colors shrink-0">
              {stepStates.every(s => s.expanded) ? 'Collapse all' : 'Review all'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

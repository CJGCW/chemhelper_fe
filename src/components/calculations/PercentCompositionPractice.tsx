import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generatePercCompProblem,
  checkPercCompAnswer,
  type PercCompType,
  type PercCompProblem,
} from '../../utils/percentCompositionPractice'
type CheckState = 'idle' | 'correct' | 'wrong'
type Filter = 'all' | PercCompType

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',                 label: 'All'             },
  { value: 'percent_of_element',  label: '% of Element'    },
  { value: 'mass_from_percent',   label: 'Mass from %'     },
]


interface Props { allowCustom?: boolean }

export default function PercentCompositionPractice({ allowCustom = true }: Props) {
  const [filter,     setFilter]     = useState<Filter>('all')
  const [problem,    setProblem]    = useState<PercCompProblem>(() => generatePercCompProblem())
  const [answer,     setAnswer]     = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [showSteps,  setShowSteps]  = useState(false)
  const [score,      setScore]      = useState({ correct: 0, total: 0 })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!allowCustom) newProblem() }, [allowCustom])

  function newProblem(f: Filter = filter) {
    setProblem(generatePercCompProblem(f === 'all' ? undefined : f))
    setAnswer('')
    setCheckState('idle')
    setShowSteps(false)
  }

  function handleFilter(f: Filter) {
    setFilter(f)
    newProblem(f)
  }

  function handleSubmit() {
    if (!answer.trim() || checkState !== 'idle') return
    const correct = checkPercCompAnswer(problem, answer)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Score + filters */}
      {allowCustom && <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => handleFilter(f.value)}
              className="px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
              style={filter === f.value ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.4)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {score.total > 0 && (
          <span className="font-mono text-xs text-secondary">
            {score.correct}/{score.total} correct
          </span>
        )}
      </div>}

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border p-4 flex flex-col gap-4 bg-surface/40">

          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">
              {problem.type === 'percent_of_element' ? '% of element' : 'mass from %'}
            </span>
          </div>

          <p className="font-sans text-sm text-primary leading-relaxed">{problem.question}</p>

          {/* Input row */}
          <div className="flex items-center gap-2">
            <input
              type="number" inputMode="decimal" value={answer}
              onChange={e => { setAnswer(e.target.value); setCheckState('idle') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your answer"
              disabled={checkState !== 'idle'}
              className="w-36 bg-raised border border-border rounded-sm px-3 py-1.5
                         font-mono text-sm text-bright placeholder-dim focus:outline-none
                         focus:border-muted disabled:opacity-50"
            />
            <span className="font-mono text-sm text-secondary">{problem.answerUnit}</span>

            {checkState === 'idle' && (
              <button onClick={handleSubmit} disabled={!answer.trim()}
                className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors
                           disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Check
              </button>
            )}

            {checkState !== 'idle' && (
              <span className={`font-mono text-sm font-semibold ${checkState === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {checkState === 'correct' ? '✓ Correct' : '✗ Incorrect'}
              </span>
            )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {checkState !== 'idle' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                <div className="flex flex-col gap-3">
                  {checkState === 'wrong' && (
                    <p className="font-mono text-xs text-secondary">
                      Correct answer: <span className="text-primary font-semibold">
                        {parseFloat(problem.answer.toPrecision(4))} {problem.answerUnit}
                      </span>
                    </p>
                  )}

                  <button onClick={() => setShowSteps(s => !s)}
                    className="flex items-center gap-1.5 font-mono text-[11px] text-secondary hover:text-primary transition-colors self-start">
                    <motion.span animate={{ rotate: showSteps ? 90 : 0 }} transition={{ duration: 0.15 }}
                      className="text-[9px]">▶</motion.span>
                    {showSteps ? 'Hide' : 'Show'} solution
                  </button>

                  <AnimatePresence initial={false}>
                    {showSteps && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                        <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2">
                          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Solution</span>
                          <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                            {problem.steps.map((s, i) => (
                              <p key={i} className="font-mono text-sm text-primary">{s}</p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => newProblem()}
                      className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                        color: 'var(--c-halogen)',
                      }}>
                      Next problem →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      <p className="font-mono text-xs text-secondary">% = (element mass in 1 mol / molar mass) × 100 · answers accepted within ±0.1%</p>
    </div>
  )
}

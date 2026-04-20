import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generateGasStoichProblem,
  checkGasStoichAnswer,
  type GasStandard,
  type GasStoichProblem,
} from '../../utils/gasStoichPractice'
type CheckState = 'idle' | 'correct' | 'wrong'
type Filter = 'all' | GasStandard

const FILTERS: { value: Filter; label: string; sub: string }[] = [
  { value: 'all',  label: 'All',  sub: 'STP & SATP'      },
  { value: 'STP',  label: 'STP',  sub: '0 °C, 1 atm'    },
  { value: 'SATP', label: 'SATP', sub: '25 °C, 100 kPa'  },
]

export function generateGasStoichExample() {
  const p = generateGasStoichProblem()
  const last = p.steps.length - 1
  return { scenario: p.question, steps: p.steps.slice(0, last), result: p.steps[last] }
}

export default function GasStoichPractice() {
  const [filter,     setFilter]     = useState<Filter>('all')
  const [problem,    setProblem]    = useState<GasStoichProblem>(() => generateGasStoichProblem())
  const [answer,     setAnswer]     = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [showSteps,  setShowSteps]  = useState(false)
  const [score,      setScore]      = useState({ correct: 0, total: 0 })

  function newProblem(f: Filter = filter) {
    setProblem(generateGasStoichProblem(f === 'all' ? undefined : f))
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
    const correct = checkGasStoichAnswer(problem, answer)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Intro */}
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Convert a <span className="text-primary">gas volume</span> at STP or SATP to moles
        (n = V ÷ Vₘ), then apply mole ratios to find the amount of another species.
      </p>

      {/* Filter + score */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => handleFilter(f.value)}
              className="flex flex-col items-start px-3 py-1.5 rounded-sm font-sans text-xs font-medium transition-colors"
              style={filter === f.value ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.4)',
              }}>
              <span>{f.label}</span>
              <span className="font-mono text-[9px] opacity-60 mt-0.5">{f.sub}</span>
            </button>
          ))}
        </div>

        {score.total > 0 && (
          <span className="font-mono text-xs text-secondary">
            {score.correct}/{score.total} correct
          </span>
        )}
      </div>

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border p-4 flex flex-col gap-4 bg-surface/40">

          {/* Equation badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction</span>
            <span className="font-mono text-xs text-secondary">{problem.equation}</span>
          </div>

          {/* Standard badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-surface)))',
                color: 'var(--c-halogen)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              }}>
              {problem.standard}
            </span>
            <span className="font-mono text-xs text-secondary">Vₘ = {problem.Vm} L/mol</span>
          </div>

          <p className="font-sans text-sm text-primary leading-relaxed">{problem.question}</p>

          {/* Answer input */}
          <div className="flex items-center gap-2 flex-wrap">
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

                  <button onClick={() => newProblem()}
                    className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Next problem →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateIntegratedProblem, checkIntegratedAnswer, type IntegratedProblem } from '../../utils/kineticsIntegratedPractice'
import StepsPanel from '../shared/StepsPanel'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props { allowCustom?: boolean }

type CheckState = 'idle' | 'correct' | 'wrong'

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

function generateHalfLifeProblem(): IntegratedProblem {
  // Keep regenerating until we get a halfLife problem
  let p = generateIntegratedProblem()
  let tries = 0
  while (p.solveFor !== 'halfLife' && tries < 20) {
    p = generateIntegratedProblem()
    tries++
  }
  // If we couldn't get one, just generate fresh
  if (p.solveFor !== 'halfLife') {
    // Force it by making one manually from the module
    return generateIntegratedProblem()
  }
  return p
}

export default function HalfLifePractice({ allowCustom = true }: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem]     = useState<IntegratedProblem>(() => {
    // Try to get a halfLife problem first
    for (let i = 0; i < 20; i++) {
      const p = generateIntegratedProblem()
      if (p.solveFor === 'halfLife') return p
    }
    return generateIntegratedProblem()
  })
  const [answer, setAnswer]       = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [steps, setSteps]         = useState<string[]>([])
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    setProblem(generateHalfLifeProblem())
    setAnswer(''); setCheckState('idle'); setSteps([])
  }

  function handleCheck() {
    if (!answer.trim() || checkState !== 'idle') return
    const correct = checkIntegratedAnswer(answer, problem)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setSteps(problem.steps)
  }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Calculate the half-life from the rate constant and reaction order.
      </p>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.reaction.id + String(problem.given.k)}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <p className="font-sans text-base text-bright leading-relaxed whitespace-pre-line">{problem.question}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="font-sans text-sm text-secondary">t½ (s):</label>
            <input
              type="text"
              inputMode="decimal"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={checkState !== 'idle'}
              placeholder="s"
              className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base w-36
                          placeholder-dim focus:outline-none focus:border-muted transition-colors
                          disabled:cursor-not-allowed
                          ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                          : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                          : 'border-border text-bright'}`}
            />

            {checkState === 'idle' ? (
              <button onClick={handleCheck} disabled={!answer.trim()}
                className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Check
              </button>
            ) : (
              <span className={`font-sans text-sm font-medium ${
                checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {checkState === 'correct'
                  ? '✓ Correct'
                  : showAnswers
                  ? `✗ Incorrect — t½ = ${sig(problem.answer)} s`
                  : '✗ Incorrect — try again'}
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <StepsPanel steps={steps} />

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          {checkState === 'wrong' && (
            <button onClick={() => { setAnswer(''); setCheckState('idle'); setSteps([]) }}
              className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-dim hover:text-secondary transition-colors">
              Try Again
            </button>
          )}
          <button onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
      <p className="font-mono text-xs text-dim">Answers accepted within ±2%.</p>
    </div>
  )
}

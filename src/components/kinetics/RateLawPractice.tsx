import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateRateLawProblem, checkRateLawAnswer, type RateLawProblem } from '../../utils/kineticsRateLawPractice'
import StepsPanel from '../shared/StepsPanel'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props { allowCustom?: boolean }

type CheckState = 'idle' | 'correct' | 'wrong'

export default function RateLawPractice({ allowCustom = true }: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem]     = useState<RateLawProblem>(generateRateLawProblem)
  const [orderAnswer, setOrderAnswer] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [steps, setSteps]         = useState<string[]>([])
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    setProblem(generateRateLawProblem())
    setOrderAnswer(''); setCheckState('idle'); setSteps([])
  }

  function handleCheck() {
    if (!orderAnswer.trim() || checkState !== 'idle') return
    const orderNum = parseFloat(orderAnswer)
    const correct = checkRateLawAnswer(orderNum, problem)
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
        Determine the reaction order for the specified species using the method of initial rates.
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
        <motion.div key={problem.reaction.id + problem.speciesOrder}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <p className="font-mono text-sm text-secondary px-3 py-2 rounded-sm"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            rate = k[A]<sup>m</sup>[B]<sup>n</sup>
          </p>

          <p className="font-sans text-base text-bright leading-relaxed whitespace-pre-line">{problem.question}</p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="font-sans text-sm text-secondary w-40">
                Order in {problem.speciesOrder}:
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={orderAnswer}
                onChange={e => setOrderAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                disabled={checkState !== 'idle'}
                placeholder="0, 1, 2, ..."
                className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base w-24
                            placeholder-dim focus:outline-none focus:border-muted transition-colors
                            disabled:cursor-not-allowed
                            ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                            : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                            : 'border-border text-bright'}`}
              />

              {checkState === 'idle' ? (
                <button onClick={handleCheck} disabled={!orderAnswer.trim()}
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
                    ? `✗ Incorrect — order = ${problem.answer}`
                    : '✗ Incorrect — try again'}
                </span>
              )}
            </div>

            {checkState !== 'idle' && (
              <div className="flex items-center gap-3 flex-wrap">
                <label className="font-sans text-sm text-secondary w-40">Rate constant k:</label>
                <span className="font-mono text-sm text-primary">
                  {problem.answerK.toExponential(3)} {problem.answerKUnit}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <StepsPanel steps={steps} />

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          {checkState === 'wrong' && (
            <button onClick={() => { setOrderAnswer(''); setCheckState('idle'); setSteps([]) }}
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
      <p className="font-mono text-xs text-dim">Order must be a whole number (0, 1, 2, 3).</p>
    </div>
  )
}

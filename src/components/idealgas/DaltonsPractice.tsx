import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateDaltonsProblem, checkDaltonsAnswer, type DaltonsProblem } from '../../utils/daltonsPractice'
import StepsPanel from '../calculations/StepsPanel'

type CheckState = 'idle' | 'correct' | 'wrong'


export default function DaltonsPractice() {
  const [problem,    setProblem]    = useState<DaltonsProblem>(generateDaltonsProblem)
  const [answer,     setAnswer]     = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [steps,      setSteps]      = useState<string[]>([])
  const [score,      setScore]      = useState({ correct: 0, total: 0 })

  function nextProblem() {
    setProblem(generateDaltonsProblem())
    setAnswer(''); setCheckState('idle'); setSteps([])
  }

  function handleCheck() {
    if (!answer.trim() || checkState !== 'idle') return
    const correct = checkDaltonsAnswer(answer, problem)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setSteps(problem.steps)
  }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  const placeholder = problem.unit ? `answer in ${problem.unit}` : 'mole fraction (0–1)'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Apply Dalton's Law of Partial Pressures.
        Use <span className="font-mono text-primary">P_total = P₁ + P₂ + … + Pₙ</span> and{' '}
        <span className="font-mono text-primary">Pᵢ = χᵢ × P_total</span>.
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
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <p className="font-mono text-sm text-secondary rounded-sm px-3 py-2"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            P_total = P₁ + P₂ + … + Pₙ &nbsp;·&nbsp; Pᵢ = χᵢ × P_total
          </p>

          <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="number"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={checkState !== 'idle'}
              placeholder={placeholder}
              className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base w-48
                          placeholder-dim focus:outline-none focus:border-muted
                          disabled:cursor-not-allowed transition-colors
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                          ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                          : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                          : 'border-border text-bright'}`}
            />
            {problem.unit && (
              <span className="font-mono text-sm text-secondary">{problem.unit}</span>
            )}

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
                {checkState === 'correct' ? '✓ Correct' : '✗ Incorrect'}
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
    </div>
  )
}

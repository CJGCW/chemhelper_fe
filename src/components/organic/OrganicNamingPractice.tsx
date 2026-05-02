import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { genNamingProblem, checkNamingAnswer } from '../../utils/organicPractice'
import type { OrganicNamingProblem } from '../../data/functionalGroups'

type CheckState = 'idle' | 'correct' | 'wrong'

interface Props { allowCustom?: boolean }

export default function OrganicNamingPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<OrganicNamingProblem>(genNamingProblem)
  const [answer, setAnswer] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [score, setScore] = useState({ correct: 0, total: 0 })

  void allowCustom

  function nextProblem() {
    setProblem(genNamingProblem())
    setAnswer(''); setCheckState('idle')
  }

  function handleCheck() {
    if (!answer.trim() || checkState !== 'idle') return
    const correct = checkNamingAnswer(problem.name, answer)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const FAMILY_LABEL: Record<string, string> = { alkane: 'Alkane', alkene: 'Alkene', alkyne: 'Alkyne' }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Give the IUPAC name for each hydrocarbon formula. Straight-chain only. Use lowercase (e.g. "methane", "1-butene").
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
        <motion.div key={problem.formula + problem.name}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {problem.formula}
            </span>
            <span className="font-sans text-sm text-secondary px-2 py-0.5 rounded"
              style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
              {FAMILY_LABEL[problem.family]}
            </span>
          </div>

          <p className="font-sans text-base text-bright">What is the IUPAC name for this compound?</p>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={checkState !== 'idle'}
              placeholder="e.g. methane"
              className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base w-48
                          placeholder-dim focus:outline-none focus:border-muted
                          disabled:cursor-not-allowed transition-colors
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
              <div className="flex flex-col gap-0.5">
                <span className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {checkState === 'correct' ? '✓ Correct' : '✗ Incorrect'}
                </span>
                {checkState === 'wrong' && (
                  <span className="font-mono text-xs text-dim">
                    Answer: {problem.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          {checkState === 'wrong' && (
            <button onClick={() => { setAnswer(''); setCheckState('idle') }}
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

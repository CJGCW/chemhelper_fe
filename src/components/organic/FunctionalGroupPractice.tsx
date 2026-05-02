import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  genFunctionalGroupProblem, checkFunctionalGroupAnswer, type FunctionalGroupProblem,
} from '../../utils/organicPractice'

type CheckState = 'idle' | 'correct' | 'wrong'

interface Props { allowCustom?: boolean }

export default function FunctionalGroupPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<FunctionalGroupProblem>(genFunctionalGroupProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [score, setScore] = useState({ correct: 0, total: 0 })

  void allowCustom // all problems are generated; allowCustom just signals context

  function nextProblem() {
    setProblem(genFunctionalGroupProblem())
    setSelected(null); setCheckState('idle')
  }

  function handleSelect(option: string) {
    if (checkState !== 'idle') return
    setSelected(option)
    const correct = checkFunctionalGroupAnswer(problem, option)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Identify the functional group from its description, formula, or example compound. Select the correct group name.
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
        <motion.div key={problem.description}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <p className="font-sans text-base text-bright leading-relaxed">{problem.description}</p>

          <div className="grid grid-cols-2 gap-2">
            {problem.options.map(option => {
              const isSelected = selected === option
              const isCorrect = option === problem.correctId
              let optStyle: Record<string, string> = {
                background: 'rgb(var(--color-raised))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.6)',
              }
              if (checkState !== 'idle') {
                if (isCorrect) {
                  optStyle = {
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#34d399',
                  }
                } else if (isSelected && !isCorrect) {
                  optStyle = {
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#f87171',
                  }
                }
              }
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={checkState !== 'idle'}
                  className="px-4 py-2.5 rounded-sm font-sans text-sm font-medium transition-colors text-left disabled:cursor-not-allowed"
                  style={optStyle}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {checkState !== 'idle' && (
            <p className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {checkState === 'correct' ? `✓ Correct — ${problem.correctId}` : `✗ Incorrect — the answer is ${problem.correctId}`}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

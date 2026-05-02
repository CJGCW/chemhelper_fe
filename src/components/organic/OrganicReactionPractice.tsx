import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  genOrganicReactionProblem, checkReactionTypeAnswer, type OrganicReactionProblem,
} from '../../utils/organicPractice'

type CheckState = 'idle' | 'correct' | 'wrong'

interface Props { allowCustom?: boolean }

export default function OrganicReactionPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<OrganicReactionProblem>(genOrganicReactionProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [score, setScore] = useState({ correct: 0, total: 0 })

  void allowCustom

  function nextProblem() {
    setProblem(genOrganicReactionProblem())
    setSelected(null); setCheckState('idle')
  }

  function handleSelect(option: string) {
    if (checkState !== 'idle') return
    setSelected(option)
    const correct = checkReactionTypeAnswer(problem, option)
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
        Identify the type of organic reaction shown. Choose from Addition, Substitution, Elimination, Combustion, or Condensation.
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
        <motion.div key={problem.scenario}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <p className="font-mono text-sm text-primary leading-relaxed">{problem.scenario}</p>

          <p className="font-sans text-sm text-secondary">What type of reaction is this?</p>

          <div className="flex flex-wrap gap-2">
            {problem.options.map(option => {
              const isSelected = selected === option
              const isCorrect = option === problem.correctType
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
                  className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed"
                  style={optStyle}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {checkState !== 'idle' && (
            <div className="flex flex-col gap-1">
              <p className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {checkState === 'correct' ? `✓ Correct — ${problem.correctType}` : `✗ Incorrect — ${problem.correctType}`}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{problem.explanation}</p>
            </div>
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

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generateMechanismProblem,
  checkMechanismAnswer,
  type MechanismProblem,
} from '../../utils/mechanismPractice'

type CheckState = 'idle' | 'correct' | 'wrong'

interface Props { allowCustom?: boolean }

export default function MechanismPractice({ allowCustom = true }: Props) {
  void allowCustom

  const [problem, setProblem] = useState<MechanismProblem>(generateMechanismProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function nextProblem() {
    setProblem(generateMechanismProblem())
    setSelected(null)
    setCheckState('idle')
    setShowSteps(false)
  }

  function handleSelect(option: string) {
    if (checkState !== 'idle') return
    setSelected(option)
    const correct = checkMechanismAnswer(problem, option)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Identify the reaction mechanism or predict the stereochemical outcome based on the conditions given.
      </p>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={problem.scenario}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
          style={{ background: 'rgb(var(--color-surface))' }}
        >
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">{problem.scenario}</pre>

          <p className="font-sans text-sm text-secondary font-medium">{problem.question}</p>

          <div className="flex flex-col gap-2">
            {problem.choices.map(option => {
              const isSelected = selected === option
              const isCorrect = option === problem.answer
              let style: Record<string, string> = {
                background: 'rgb(var(--color-raised))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.6)',
              }
              if (checkState !== 'idle') {
                if (isCorrect) {
                  style = {
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#34d399',
                  }
                } else if (isSelected && !isCorrect) {
                  style = {
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#f87171',
                  }
                }
              } else if (isSelected) {
                style = {
                  background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }
              }
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={checkState !== 'idle'}
                  className="px-4 py-2.5 rounded-sm font-sans text-sm text-left transition-colors disabled:cursor-not-allowed leading-snug"
                  style={style}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {checkState !== 'idle' && (
            <div className="flex flex-col gap-1.5">
              <p className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {checkState === 'correct' ? `✓ Correct — ${problem.answer}` : `✗ Incorrect — ${problem.answer}`}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{problem.explanation}</p>
              <button
                onClick={() => setShowSteps(o => !o)}
                className="self-start font-sans text-xs text-dim hover:text-secondary transition-colors mt-1"
              >
                {showSteps ? '▲ Hide solution' : '▼ Show full solution'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="rounded-sm border border-border p-4 flex flex-col gap-2"
              style={{ background: 'rgb(var(--color-base))' }}
            >
              <span className="font-mono text-[10px] text-dim uppercase tracking-wider">Full Solution</span>
              {problem.steps.map((step, i) => (
                <p key={i} className="font-sans text-sm text-secondary leading-relaxed">{step}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

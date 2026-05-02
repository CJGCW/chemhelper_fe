import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { genIsomerProblem, type IsomerProblem } from '../../utils/organicPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props { allowCustom?: boolean }

export default function IsomerPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<IsomerProblem>(() => genIsomerProblem())
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const showAnswers = useShowAnswers()

  function handleSelect(option: string) {
    if (checked) return
    setSelected(option)
  }

  function handleCheck() {
    if (!selected || checked) return
    const answerIsYes = selected === 'Yes'
    const c = problem.areIsomers === answerIsYes
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(genIsomerProblem())
    setSelected(null)
    setChecked(false)
    setCorrect(false)
  }

  const correctAnswer = problem.areIsomers ? 'Yes' : 'No'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.formula1 + problem.formula2 + String(problem.areIsomers)}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-5"
        >
          <p className="font-sans text-base text-primary leading-relaxed">
            Are these two compounds structural isomers?
          </p>
          <div className="flex gap-6 items-center justify-center py-3">
            <span className="font-mono text-xl font-bold text-bright">{problem.formula1}</span>
            <span className="font-sans text-sm text-dim">vs</span>
            <span className="font-mono text-xl font-bold text-bright">{problem.formula2}</span>
          </div>

          <div className="flex gap-3">
            {['Yes', 'No'].map(option => {
              const isSelected = selected === option
              const isCorrect = option === correctAnswer
              return (
                <button key={option}
                  onClick={() => handleSelect(option)}
                  disabled={checked}
                  className={`flex-1 py-3 rounded-sm border font-sans text-sm font-medium capitalize transition-all
                              ${!checked ? 'cursor-pointer' : 'cursor-default'}`}
                  style={
                    checked
                      ? isCorrect
                        ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', color: 'rgb(52,211,153)' }
                        : isSelected
                          ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: 'rgb(248,113,113)' }
                          : { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.4)' }
                      : isSelected
                        ? { background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)', color: 'var(--c-halogen)' }
                        : { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.4)' }
                  }
                >
                  {option}
                </button>
              )
            })}
          </div>

          {!checked && (
            <button
              onClick={handleCheck}
              disabled={!selected}
              className={`px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                ${selected ? 'text-white cursor-pointer' : 'opacity-40 cursor-not-allowed text-secondary'}`}
              style={selected ? { background: 'var(--c-halogen)' } : {}}
            >
              Check Answer
            </button>
          )}

          {checked && (
            <div className={`flex flex-col gap-3 p-4 rounded-sm border ${correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <p className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
                {correct ? 'Correct!' : `Incorrect — the answer is: ${correctAnswer}`}
              </p>
              {showAnswers && (
                <p className="font-sans text-sm text-secondary leading-relaxed">{problem.explanation}</p>
              )}
              <button
                onClick={handleNext}
                className="self-start px-4 py-2 rounded-sm font-sans text-sm font-medium text-white transition-colors"
                style={{ background: 'var(--c-halogen)' }}
              >
                Next Problem
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {allowCustom && (
        <p className="font-sans text-xs text-dim text-center">
          Given two molecular formulas, determine if they could be structural isomers (same formula, different structure).
        </p>
      )}
    </div>
  )
}

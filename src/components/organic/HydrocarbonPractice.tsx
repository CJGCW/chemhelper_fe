import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  genHydrocarbonProblem,
  checkHydrocarbonAnswer,
  hydrocarbonSolutionSteps,
  type HydrocarbonProblem,
} from '../../utils/organicPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props { allowCustom?: boolean }

export default function HydrocarbonPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<HydrocarbonProblem>(() => genHydrocarbonProblem())
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const [stepsOpen, setStepsOpen] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const showAnswers = useShowAnswers()

  function handleSelect(option: string) {
    if (checked) return
    setSelected(option)
  }

  function handleCheck() {
    if (!selected || checked) return
    const c = checkHydrocarbonAnswer(problem, selected)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
    setSteps(hydrocarbonSolutionSteps(problem))
  }

  function handleNext() {
    setProblem(genHydrocarbonProblem())
    setSelected(null)
    setChecked(false)
    setCorrect(false)
    setSteps([])
    setStepsOpen(false)
  }

  const options = problem.options

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
        <motion.div key={problem.formula}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-5"
        >
          <p className="font-sans text-base text-primary leading-relaxed">
            Classify the hydrocarbon with molecular formula:
          </p>
          <div className="text-center py-3">
            <span className="font-mono text-2xl font-bold text-bright">{problem.formula}</span>
          </div>
          <p className="font-sans text-sm text-secondary">
            C = {problem.C}, H = {problem.H}. Which family does this compound belong to?
          </p>

          <div className="flex flex-col gap-2">
            {options.map(option => {
              const isSelected = selected === option
              const isCorrect = option === problem.correctFamily
              let bg = 'bg-raised'
              let border = 'border-border'
              let textCol = 'text-secondary'
              if (checked) {
                if (isCorrect) { bg = 'bg-emerald-500/10'; border = 'border-emerald-500/40'; textCol = 'text-emerald-400' }
                else if (isSelected && !isCorrect) { bg = 'bg-red-500/10'; border = 'border-red-500/40'; textCol = 'text-red-400' }
              } else if (isSelected) {
                bg = 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))'
                border = 'border-accent/40'
                textCol = 'text-primary'
              }
              return (
                <button key={option}
                  onClick={() => handleSelect(option)}
                  disabled={checked}
                  className={`w-full text-left px-4 py-3 rounded-sm border font-sans text-sm capitalize transition-all
                              ${bg} border-${border} ${textCol}
                              ${!checked ? 'hover:border-accent/30 hover:text-primary cursor-pointer' : 'cursor-default'}`}
                  style={isSelected && !checked ? {
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    color: 'var(--c-halogen)',
                  } : {}}
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
                ${selected
                  ? 'text-white cursor-pointer'
                  : 'opacity-40 cursor-not-allowed text-secondary'}`}
              style={selected ? { background: 'var(--c-halogen)' } : {}}
            >
              Check Answer
            </button>
          )}

          {checked && (
            <div className={`flex flex-col gap-3 p-4 rounded-sm border ${correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <p className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
                {correct ? 'Correct!' : `Incorrect — the answer is: ${problem.correctFamily}`}
              </p>

              {(showAnswers || !correct) && steps.length > 0 && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setStepsOpen(o => !o)}
                    className="font-mono text-xs text-secondary hover:text-primary transition-colors text-left"
                  >
                    {stepsOpen ? '▾' : '▸'} Show reasoning
                  </button>
                  <AnimatePresence>
                    {stepsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="flex flex-col gap-1 pt-2">
                          {steps.map((s, i) => (
                            <p key={i} className="font-mono text-xs text-secondary">{s}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
          Problems are randomly generated from alkanes, alkenes, and alkynes (C2–C8).
        </p>
      )}
    </div>
  )
}

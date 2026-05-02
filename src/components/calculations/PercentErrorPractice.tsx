import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generatePercentErrorProblem, generateDynamicPercentErrorProblem, type PercentErrorProblem } from '../../utils/percentErrorPractice'

interface Props { allowCustom?: boolean }

function nextPercentErrorProblem(allowCustom: boolean): PercentErrorProblem {
  // Problems mode → 100% dynamic; Practice mode → 60% dynamic
  const useDynamic = !allowCustom || Math.random() < 0.6
  return useDynamic ? generateDynamicPercentErrorProblem() : generatePercentErrorProblem()
}

export default function PercentErrorPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<PercentErrorProblem>(() => nextPercentErrorProblem(allowCustom))
  const [studentAnswer, setStudentAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  const isCorrect = checked && Math.abs(parseFloat(studentAnswer) - problem.answer) / problem.answer < 0.005

  const nextProblem = useCallback(() => {
    setProblem(nextPercentErrorProblem(allowCustom))
    setStudentAnswer('')
    setChecked(false)
    setShowSteps(false)
  }, [])

  function check() {
    if (!studentAnswer.trim()) return
    setChecked(true)
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <AnimatePresence mode="wait">
        <motion.div key={problem.scenario}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-5"
        >
          {/* Problem */}
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <div className="flex items-center gap-2 mb-2">
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">Problem</p>
              {problem.isDynamic && (
                <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                  style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
                  generated
                </span>
              )}
            </div>
            <p className="font-sans text-sm text-primary leading-relaxed">{problem.scenario}</p>
          </div>

          {/* Answer input */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-sm font-medium text-primary">Your answer (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={studentAnswer}
                onChange={e => { setStudentAnswer(e.target.value); setChecked(false) }}
                onKeyDown={e => e.key === 'Enter' && check()}
                placeholder="e.g. 5.56"
                disabled={checked && isCorrect}
                className="w-36 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-1.5
                           text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors
                           disabled:opacity-50"
              />
              <span className="font-mono text-sm text-secondary">%</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!checked && (
              <button onClick={check}
                className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Check
              </button>
            )}
            {checked && (
              <button onClick={nextProblem}
                className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Next problem →
              </button>
            )}
            {checked && (
              <button onClick={() => setShowSteps(s => !s)}
                className="px-3 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
                {showSteps ? 'Hide steps' : 'Show steps'}
              </button>
            )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {checked && (
              <motion.div key="feedback"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{isCorrect ? '✓' : '✗'}</span>
                  <span className="font-sans text-sm font-medium"
                    style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
                    {isCorrect ? 'Correct!' : `Incorrect — answer is ${problem.answer.toFixed(2)}%`}
                  </span>
                </div>

                <AnimatePresence>
                  {showSteps && (
                    <motion.div key="steps"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
                        {problem.steps.map((s, i) => (
                          <p key={i} className="font-mono text-sm text-primary">{s}</p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

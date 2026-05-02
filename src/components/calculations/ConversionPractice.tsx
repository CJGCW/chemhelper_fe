import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateConversionProblem, generateDynamicConversionProblem, checkConversionAnswer, type ConversionProblem } from '../../utils/conversionPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props { allowCustom?: boolean }

function nextProblemFn(allowCustom: boolean): ConversionProblem {
  // Problems mode (allowCustom=false) → 100% dynamic
  // Practice mode → 60% dynamic, 40% pool
  const useDynamic = !allowCustom || Math.random() < 0.6
  return useDynamic ? generateDynamicConversionProblem() : generateConversionProblem()
}

export default function ConversionPractice({ allowCustom = true }: Props) {
  const [problem, setProblem] = useState<ConversionProblem>(() => nextProblemFn(allowCustom))
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const isCorrect = checked && checkConversionAnswer(input, problem)
  const showAnswers = useShowAnswers()

  const next = useCallback(() => {
    setProblem(nextProblemFn(allowCustom))
    setInput('')
    setChecked(false)
  }, [])

  function check() {
    if (!input.trim() || checked) return
    const ok = checkConversionAnswer(input, problem)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-sm border border-border p-5"
          style={{ background: 'rgb(var(--color-surface))' }}
        >
          <div className="flex items-start gap-2">
            <p className="font-sans text-sm text-primary leading-relaxed flex-1">{problem.question}</p>
            {problem.isDynamic && (
              <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm shrink-0"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
                generated
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={input}
              onChange={e => { setInput(e.target.value); setChecked(false) }}
              onKeyDown={e => e.key === 'Enter' && check()}
              disabled={checked}
              placeholder={`answer in ${problem.answerUnit}`}
              className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                         text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors
                         disabled:opacity-50"
            />
            <span className="font-mono text-sm text-secondary shrink-0">{problem.answerUnit}</span>
          </div>

          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2">
              <span className="font-sans text-sm font-medium"
                style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
                {isCorrect ? '✓ Correct!' : showAnswers ? `✗ Answer: ${problem.answer} ${problem.answerUnit}` : '✗ Incorrect — try again'}
              </span>
              {showAnswers && (
                <div className="flex flex-col gap-0.5 pl-2 border-l-2 border-border">
                  {problem.steps.map((s, i) => (
                    <p key={i} className="font-mono text-xs text-secondary">{s}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        {!checked ? (
          <button onClick={check} disabled={!input.trim()}
            className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color: 'var(--c-halogen)',
            }}>Check →</button>
        ) : (
          <button onClick={next}
            className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color: 'var(--c-halogen)',
            }}>Next →</button>
        )}
      </div>

      <p className="font-mono text-xs text-secondary">Answers accepted within ±1%.</p>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { genHeatTransferProblem, checkHeatTransferAnswer, type HeatTransferProblem } from '../../utils/heatTransferPractice'

export default function HeatTransferPractice() {
  const [problem, setProblem]     = useState<HeatTransferProblem>(() => genHeatTransferProblem())
  const [input, setInput]         = useState('')
  const [checked, setChecked]     = useState(false)
  const [correct, setCorrect]     = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  function handleCheck() {
    if (!input.trim() || checked) return
    const c = checkHeatTransferAnswer(problem, input)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(genHeatTransferProblem())
    setInput('')
    setChecked(false)
    setCorrect(false)
    setShowSteps(false)
  }

  function handleTryAgain() {
    setInput('')
    setChecked(false)
    setCorrect(false)
    setShowSteps(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">
            {score.correct} / {score.total}
          </span>
        </div>
      )}

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-5"
        >
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-dim border border-border px-2 py-0.5 rounded-sm">
              q_gained = −q_lost
            </span>
          </div>

          <p className="font-sans text-base text-primary leading-relaxed">{problem.question}</p>

          {/* Given chips */}
          <div className="flex flex-wrap gap-2">
            {problem.given.map(g => (
              <div key={g.label}
                className="flex items-center gap-1.5 rounded-sm border border-border bg-raised px-2.5 py-1">
                <span className="font-mono text-[11px] text-secondary">{g.label}</span>
                <span className="font-mono text-[11px] text-bright">{g.value}</span>
              </div>
            ))}
          </div>

          {/* Solve-for hint */}
          <p className="font-mono text-xs text-secondary">
            Solve for: <span className="text-primary font-medium">{problem.solveFor}</span>
          </p>

          {/* Answer input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCheck() }}
              placeholder="Enter answer"
              disabled={checked}
              className="flex-1 bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder:text-dim focus:outline-none focus:border-muted
                         disabled:opacity-50"
            />
            <span className="font-mono text-sm text-secondary shrink-0">{problem.answerUnit}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="flex-1 py-2 rounded-sm font-sans text-sm font-medium transition-all disabled:opacity-30"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Check
              </button>
            ) : correct ? (
              <button onClick={handleNext}
                className="flex-1 py-2 rounded-sm font-sans text-sm font-medium"
                style={{
                  background: 'color-mix(in srgb, #34d399 18%, #0e1016)',
                  border: '1px solid color-mix(in srgb, #34d399 40%, transparent)',
                  color: '#34d399',
                }}>
                Next →
              </button>
            ) : (
              <>
                <button onClick={handleTryAgain}
                  className="flex-1 py-2 rounded-sm font-sans text-sm font-medium"
                  style={{
                    background: 'color-mix(in srgb, #f87171 18%, #0e1016)',
                    border: '1px solid color-mix(in srgb, #f87171 40%, transparent)',
                    color: '#f87171',
                  }}>
                  Try Again
                </button>
                <button onClick={handleNext}
                  className="px-4 py-2 rounded-sm font-sans text-sm font-medium border border-border text-secondary hover:text-primary transition-colors">
                  Skip
                </button>
              </>
            )}
          </div>

          {/* Feedback */}
          {checked && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-mono text-sm"
              style={{ color: correct ? '#34d399' : '#f87171' }}>
              {correct
                ? `✓ Correct! ${problem.solveFor} = ${problem.answer} ${problem.answerUnit}`
                : `✗ Incorrect. Answer: ${problem.answer} ${problem.answerUnit}`}
            </motion.p>
          )}

          {/* Solution steps toggle */}
          {checked && (
            <button
              onClick={() => setShowSteps(s => !s)}
              className="self-start font-mono text-xs text-secondary hover:text-primary transition-colors">
              {showSteps ? '▾ Hide steps' : '▸ Show steps'}
            </button>
          )}

          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="rounded-sm border border-border bg-raised p-4">
                  <pre className="font-mono text-xs text-secondary whitespace-pre-wrap leading-relaxed">
                    {problem.solutionSteps.join('\n')}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

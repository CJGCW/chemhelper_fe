import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { genCalorimetryProblem, checkCalorimetryAnswer, type CalorimetryProblem } from '../../utils/calorimetryPractice'

const MODE_LABELS: Record<string, string> = {
  mcdt:   'q = mcΔT',
  cdt:    'q = CΔT',
  coffee: 'Coffee-Cup',
  bomb:   'Bomb Calorimeter',
}

export default function CalorimetryPractice() {
  const [problem, setProblem]     = useState<CalorimetryProblem>(() => genCalorimetryProblem())
  const [input, setInput]         = useState('')
  const [checked, setChecked]     = useState(false)
  const [correct, setCorrect]     = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  function handleCheck() {
    if (!input.trim() || checked) return
    const c = checkCalorimetryAnswer(problem, input)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(genCalorimetryProblem())
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
          {/* Mode badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-secondary border border-border px-2 py-0.5 rounded-sm">
              {MODE_LABELS[problem.mode] ?? problem.mode}
            </span>
          </div>

          <p className="font-sans text-base text-primary leading-relaxed">{problem.question}</p>

          {/* Given chips */}
          <div className="flex flex-wrap gap-2">
            {problem.given.map(g => (
              <div key={g.label}
                className="flex items-baseline gap-1.5 px-3 py-1 rounded-sm border border-border bg-raised">
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {g.label}
                </span>
                <span className="font-mono text-sm text-primary">=</span>
                <span className="font-mono text-sm text-bright">{g.value}</span>
                <span className="font-mono text-xs text-secondary">{g.unit}</span>
              </div>
            ))}
            <div className="flex items-baseline gap-1.5 px-3 py-1 rounded-sm border border-border/40 bg-raised/40">
              <span className="font-mono text-sm font-semibold text-dim">{problem.solveFor}</span>
              <span className="font-mono text-sm text-dim">= ?</span>
              <span className="font-mono text-xs text-dim">({problem.answerUnit})</span>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 items-center">
            <span className="font-mono text-sm text-secondary">{problem.solveFor} =</span>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={checked}
              placeholder={`answer in ${problem.answerUnit}`}
              className="flex-1 bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-bright
                         placeholder:text-dim/50 focus:outline-none focus:border-muted
                         disabled:opacity-60 [appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="font-mono text-sm text-dim">{problem.answerUnit}</span>
          </div>

          {/* Feedback */}
          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-sm border ${
                correct
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              <span className="font-mono text-sm font-semibold">
                {correct
                  ? '✓ Correct!'
                  : `✗ Answer: ${problem.answer.toPrecision(3)} ${problem.answerUnit}`}
              </span>
            </motion.div>
          )}

          {/* Solution steps */}
          {checked && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowSteps(v => !v)}
                className="flex items-center gap-1.5 font-mono text-xs text-secondary hover:text-primary transition-colors self-start"
              >
                <motion.span animate={{ rotate: showSteps ? 90 : 0 }} transition={{ duration: 0.15 }}
                  className="text-[10px]">▶</motion.span>
                Solution steps
              </button>
              <AnimatePresence initial={false}>
                {showSteps && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border mt-1">
                      {problem.steps.map((s, i) => (
                        <p key={i} className={`font-mono text-sm ${
                          i === problem.steps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'
                        }`}>
                          {i === problem.steps.length - 1 ? '∴ ' : ''}{s}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-2">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >Check →</button>
        ) : (
          <>
            {!correct && (
              <button
                onClick={handleTryAgain}
                className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ background: '#141620', border: '1px solid #2a2e42', color: 'rgba(255,255,255,0.55)' }}
              >Try Again</button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >Next →</button>
          </>
        )}
      </div>

      <p className="font-mono text-xs text-secondary">
        Answers accepted within ±2%.
      </p>
    </div>
  )
}

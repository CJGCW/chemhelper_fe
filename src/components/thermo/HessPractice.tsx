import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { genHessProblem, checkHessAnswer, type HessProblem } from '../../utils/hessLawPractice'
import WorkedExample from '../calculations/WorkedExample'

function generateExample() {
  const p = genHessProblem()
  const last = p.solutionSteps.length - 1
  return { scenario: `Find ΔH for: ${p.target}`, steps: p.solutionSteps.slice(0, last), result: p.solutionSteps[last] }
}

export default function HessPractice() {
  const [problem, setProblem]     = useState<HessProblem>(() => genHessProblem())
  const [input, setInput]         = useState('')
  const [checked, setChecked]     = useState(false)
  const [correct, setCorrect]     = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  function handleCheck() {
    if (!input.trim() || checked) return
    const c = checkHessAnswer(problem, input)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(genHessProblem())
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

      <WorkedExample generate={generateExample} />

      {/* Score */}
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

      <AnimatePresence mode="wait">
        <motion.div key={problem.target}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-5"
        >
          {/* Badge */}
          <span className="font-mono text-xs text-secondary border border-border px-2 py-0.5 rounded-sm self-start capitalize">
            {problem.description}
          </span>

          <p className="font-sans text-base text-primary leading-relaxed">
            Use Hess's Law to calculate ΔH for the target reaction.
          </p>

          {/* Target */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Target</span>
            <p className="font-mono text-sm text-bright px-3 py-2 rounded-sm bg-raised border border-border">
              {problem.target}
            </p>
          </div>

          {/* Given reactions */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Given reactions</span>
            <div className="rounded-sm border border-border bg-raised overflow-hidden">
              {problem.steps.map((step, i) => (
                <div key={i}
                  className="grid grid-cols-[1.5rem_1fr_auto] gap-x-4 items-baseline px-3 py-2.5 border-b border-border last:border-b-0">
                  <span className="font-mono text-xs text-dim">({i + 1})</span>
                  <span className="font-mono text-sm text-primary">{step.equation}</span>
                  <span className="font-mono text-sm shrink-0"
                    style={{ color: step.dh < 0 ? '#34d399' : step.dh > 0 ? '#f87171' : 'rgba(var(--overlay),0.5)' }}>
                    ΔH = {step.dh > 0 ? '+' : ''}{step.dh} kJ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 items-center">
            <span className="font-mono text-sm text-secondary">ΔHrxn =</span>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={checked}
              placeholder="answer in kJ"
              className="flex-1 bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-bright
                         placeholder:text-dim/50 focus:outline-none focus:border-muted
                         disabled:opacity-60 [appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="font-mono text-sm text-dim">kJ</span>
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
                {correct ? '✓ Correct!' : `✗ Answer: ${problem.answer > 0 ? '+' : ''}${problem.answer} kJ`}
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
                      {problem.solutionSteps.map((s, i) => (
                        <p key={i} className={`font-mono text-sm ${
                          i === problem.solutionSteps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'
                        }`}>
                          {i === problem.solutionSteps.length - 1 ? '∴ ' : ''}{s}
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
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
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
                style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-muted))', color: 'rgba(var(--overlay),0.55)' }}
              >Try Again</button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >Next →</button>
          </>
        )}
      </div>

      <p className="font-mono text-xs text-secondary">
        Answers accepted within ±2%. Flip reactions and scale by integer or half-integer multipliers as needed.
      </p>
    </div>
  )
}

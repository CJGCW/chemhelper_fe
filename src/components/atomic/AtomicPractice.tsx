import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AtomicSubtopic } from '../../utils/atomicPractice'
import { generateAtomicProblem, checkAtomicAnswer } from '../../utils/atomicPractice'

interface Props { subtopic: AtomicSubtopic }

export default function AtomicPractice({ subtopic }: Props) {
  const [problem,   setProblem]   = useState(() => generateAtomicProblem(subtopic))
  const [answer,    setAnswer]    = useState('')
  const [checked,   setChecked]   = useState(false)
  const [correct,   setCorrect]   = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score,     setScore]     = useState({ right: 0, total: 0 })

  function handleCheck() {
    if (!answer.trim()) return
    const c = checkAtomicAnswer(answer, problem)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ right: s.right + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(generateAtomicProblem(subtopic))
    setAnswer('')
    setChecked(false)
    setShowSteps(false)
  }

  const borderClass = checked
    ? correct ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.right}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.right / score.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={problem.question}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
      >
        <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>

        {problem.hint && !checked && (
          <p className="font-sans text-xs text-dim italic border-l-2 border-border pl-3">
            {problem.hint}
          </p>
        )}

        {/* Input row */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type={problem.isTextAnswer ? 'text' : 'number'}
            inputMode="decimal"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => !checked && e.key === 'Enter' && handleCheck()}
            disabled={checked}
            placeholder={problem.isTextAnswer ? 'e.g. 1s²2s²2p⁶' : 'answer'}
            className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                        placeholder-dim focus:outline-none focus:border-muted
                        disabled:cursor-not-allowed transition-colors
                        ${problem.isTextAnswer ? 'w-44' : 'w-32'}
                        ${checked
                          ? correct
                            ? 'border-emerald-700/60 text-emerald-300'
                            : 'border-rose-700/60 text-rose-300'
                          : 'border-border text-bright'}`}
          />
          {problem.answerUnit && (
            <span className="font-mono text-sm text-secondary">{problem.answerUnit}</span>
          )}

          {!checked ? (
            <button
              onClick={handleCheck}
              disabled={!answer.trim()}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              Check
            </button>
          ) : (
            <>
              <span className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {correct ? '✓ Correct' : '✗ Incorrect'}
              </span>
              <button
                onClick={() => setShowSteps(s => !s)}
                className="font-mono text-xs text-dim hover:text-secondary transition-colors"
              >
                {showSteps ? '▲ hide' : '▼ solution'}
              </button>
            </>
          )}
        </div>

        {/* Solution reveal */}
        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {!correct && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-dim">Answer:</span>
                    <span className="font-mono text-sm text-bright">
                      {problem.answer}{problem.answerUnit ? ` ${problem.answerUnit}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                  {problem.steps.map((step, i) => (
                    <p key={i} className="font-mono text-sm text-primary">{step}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next */}
      {checked && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNext}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          Next →
        </motion.button>
      )}
    </div>
  )
}

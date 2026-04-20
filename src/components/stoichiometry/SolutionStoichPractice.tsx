import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generateSolStoichProblem, checkSolStoichAnswer,
  type SolStoichType, type SolStoichProblem,
} from '../../utils/solutionStoichPractice'
const FILTERS: { id: SolStoichType | 'all'; label: string; subtitle: string }[] = [
  { id: 'all',          label: 'All',         subtitle: 'mixed types'    },
  { id: 'vol_to_mass',  label: 'Vol → Mass',  subtitle: 'V, C → g'      },
  { id: 'mass_to_vol',  label: 'Mass → Vol',  subtitle: 'g → mL'        },
  { id: 'vol_to_vol',   label: 'Titration',   subtitle: 'V₁C₁ → V₂'   },
]


export default function SolutionStoichPractice() {
  const [filter,   setFilter]   = useState<SolStoichType | 'all'>('all')
  const [problem,  setProblem]  = useState<SolStoichProblem>(() => generateSolStoichProblem())
  const [input,    setInput]    = useState('')
  const [checked,  setChecked]  = useState(false)
  const [correct,  setCorrect]  = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [score,    setScore]    = useState({ right: 0, total: 0 })

  function next(f: SolStoichType | 'all' = filter) {
    setProblem(generateSolStoichProblem(f === 'all' ? undefined : f))
    setInput('')
    setChecked(false)
    setCorrect(false)
    setRevealed(false)
  }

  function handleFilter(f: SolStoichType | 'all') {
    setFilter(f)
    setScore({ right: 0, total: 0 })
    next(f)
  }

  function handleCheck() {
    const ok = checkSolStoichAnswer(problem, input)
    setCorrect(ok)
    setChecked(true)
    setScore(s => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
  }

  const canCheck = input.trim() !== '' && !checked

  const borderClass = !checked ? 'border-border bg-surface'
    : correct ? 'border-emerald-800/50 bg-emerald-950/20'
    : 'border-rose-800/50 bg-rose-950/20'

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => {
          const isActive = filter === f.id
          return (
            <button key={f.id} onClick={() => handleFilter(f.id)}
              className="flex flex-col items-center px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 14%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.4)',
              }}>
              <span>{f.label}</span>
              <span className="font-mono text-[9px] opacity-60">{f.subtitle}</span>
            </button>
          )
        })}
      </div>

      {/* Score */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.right}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.right / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={problem.equation + problem.question}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
      >
        {/* Equation badge */}
        <p className="font-mono text-[10px] text-secondary">{problem.equation}</p>

        {/* Question */}
        <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>

        {/* Answer input */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canCheck && handleCheck()}
            disabled={checked}
            placeholder="answer"
            className={`w-36 bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                        placeholder-dim focus:outline-none focus:border-muted
                        disabled:cursor-not-allowed transition-colors
                        ${checked && correct  ? 'border-emerald-700/60 text-emerald-300'
                        : checked && !correct ? 'border-rose-700/60 text-rose-300'
                        : 'border-border text-bright'}`}
          />
          <span className="font-mono text-sm text-secondary">{problem.answerUnit}</span>

          {!checked ? (
            <button onClick={handleCheck} disabled={!canCheck}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check
            </button>
          ) : (
            <span className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
              {correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
          )}

          {checked && (
            <button onClick={() => setRevealed(r => !r)}
              className="font-mono text-xs text-dim hover:text-secondary transition-colors">
              {revealed ? '▲ hide' : '▼ solution'}
            </button>
          )}
        </div>

        {/* Solution reveal */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}>
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-dim">Answer:</span>
                  <span className="font-mono text-sm text-bright">
                    {problem.answer.toPrecision(4)} {problem.answerUnit}
                  </span>
                </div>
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

      {/* Next button */}
      {checked && (
        <motion.button
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => next()}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors">
          Next →
        </motion.button>
      )}
    </div>
  )
}

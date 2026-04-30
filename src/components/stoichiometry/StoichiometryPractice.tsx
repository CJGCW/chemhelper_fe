import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StoichProblemType } from '../../utils/stoichiometryPractice'
import { generateStoichProblem, checkStoichAnswer } from '../../utils/stoichiometryPractice'
const TYPES: { id: StoichProblemType | 'random'; label: string; formula: string }[] = [
  { id: 'random',           label: 'Random',            formula: '?'       },
  { id: 'mole_ratio',       label: 'Mole Ratio',        formula: 'n₁/n₂'  },
  { id: 'mass_to_mass',     label: 'Mass-to-Mass',      formula: 'g→g'     },
  { id: 'limiting_reagent', label: 'Limiting Reagent',  formula: 'LR'      },
  { id: 'theoretical_yield',label: 'Theoretical Yield', formula: 'TY'      },
  { id: 'percent_yield',    label: 'Percent Yield',     formula: '% yield' },
]


interface Props { allowCustom?: boolean }

export default function StoichiometryPractice({ allowCustom = true }: Props) {
  const [selectedType, setSelectedType] = useState<StoichProblemType | 'random'>('random')
  const [problem,   setProblem]   = useState(() => generateStoichProblem())
  const [answer,    setAnswer]    = useState('')
  const [checked,   setChecked]   = useState(false)
  const [correct,   setCorrect]   = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score,     setScore]     = useState({ right: 0, total: 0 })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem(type: StoichProblemType | 'random' = selectedType) {
    const t = type === 'random' ? undefined : type
    setProblem(generateStoichProblem(t))
    setAnswer('')
    setChecked(false)
    setShowSteps(false)
  }

  function handleTryAgain() {
    setAnswer('')
    setChecked(false)
    setCorrect(false)
    setShowSteps(false)
  }

  function handleTypeChange(type: StoichProblemType | 'random') {
    setSelectedType(type)
    const t = type === 'random' ? undefined : type
    setProblem(generateStoichProblem(t))
    setAnswer('')
    setChecked(false)
    setShowSteps(false)
    setScore({ right: 0, total: 0 })
  }

  function handleCheckWith(val: string) {
    if (!val.trim()) return
    const c = checkStoichAnswer(val, problem)
    setAnswer(val)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ right: s.right + (c ? 1 : 0), total: s.total + 1 }))
  }

  function handleCheck() {
    handleCheckWith(answer)
  }

  const borderClass = checked
    ? correct ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  // Problem text may contain newlines (equation + question)
  const lines = problem.question.split('\n')

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Type selector */}
      {allowCustom && <div className="flex flex-wrap gap-1.5">
        {TYPES.map(t => {
          const isActive = selectedType === t.id
          return (
            <button
              key={t.id}
              onClick={() => handleTypeChange(t.id)}
              className="flex flex-col items-start px-3 py-2 rounded-sm font-sans text-sm
                         font-medium transition-colors text-left"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.45)',
              }}
            >
              <span className="text-sm">{t.label}</span>
              <span className="font-mono text-[9px] mt-0.5 opacity-60">{t.formula}</span>
            </button>
          )
        })}
      </div>}

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
        {/* Problem text — first line is often the equation */}
        <div className="flex flex-col gap-2">
          {lines.map((line, i) =>
            i === 0 && line.startsWith('Reaction:') ? (
              <p key={i} className="font-mono text-sm text-secondary">{line}</p>
            ) : (
              <p key={i} className="font-sans text-base text-bright leading-relaxed">{line}</p>
            )
          )}
        </div>

        {/* Input row */}
        {problem.choices ? (
          <div className="flex flex-col gap-3">
            {/* Choice buttons */}
            <div className="flex flex-wrap gap-2">
              {problem.choices.map(c => {
                const isSelected = answer === c.value
                const isCorrectChoice = checked && c.value === problem.answer
                const isWrongChoice   = checked && isSelected && c.value !== problem.answer
                return (
                  <button
                    key={c.value}
                    onClick={() => { if (!checked) { setAnswer(c.value); handleCheckWith(c.value) } }}
                    disabled={checked}
                    className="px-5 py-2 rounded-sm font-mono text-base font-semibold transition-colors disabled:cursor-default"
                    style={
                      isCorrectChoice
                        ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.5)', color: '#6ee7b7' }
                        : isWrongChoice
                        ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }
                        : isSelected && !checked
                        ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 45%, transparent)', color: 'var(--c-halogen)' }
                        : { background: 'transparent', border: '1px solid rgba(var(--overlay),0.15)', color: 'rgba(var(--overlay),0.6)' }
                    }
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>

            {/* Result + solution toggle */}
            {checked && (
              <div className="flex items-center gap-3">
                <span className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <button
                  onClick={() => setShowSteps(s => !s)}
                  className="font-mono text-xs text-dim hover:text-secondary transition-colors"
                >
                  {showSteps ? '▲ hide' : '▼ solution'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type={problem.isTextAnswer ? 'text' : 'number'}
              inputMode="decimal"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => !checked && e.key === 'Enter' && handleCheck()}
              disabled={checked}
              placeholder={problem.isTextAnswer ? 'formula, e.g. H₂' : 'answer'}
              className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                          placeholder-dim focus:outline-none focus:border-muted
                          disabled:cursor-not-allowed transition-colors
                          ${problem.isTextAnswer ? 'w-36' : 'w-32'}
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
        )}

        {/* Solution */}
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

      {/* Next / Try Again buttons */}
      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          {!correct && (
            <button
              onClick={handleTryAgain}
              className="px-4 py-2 rounded-sm font-sans text-sm border border-border
                         text-dim hover:text-secondary transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => nextProblem()}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            Next →
          </button>
        </motion.div>
      )}
      <p className="font-mono text-xs text-secondary">moles = mass / M · use mole ratio from balanced equation · answers accepted within ±1%</p>
    </div>
  )
}

import React from 'react'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { genDilutionProblem, checkDilutionAnswer } from '../../utils/dilutionPractice'
import { genConcProblem, checkConcAnswer } from '../../utils/concentrationPractice'
import type { DilutionSubtype, DilutionProblem } from '../../utils/dilutionPractice'
import type { ConcSubtype, ConcProblem } from '../../utils/concentrationPractice'

// ── Filter type ───────────────────────────────────────────────────────────────

type FilterType = 'all' | 'dilution' | 'percent' | 'ppm' | 'mole-fraction'

const FILTER_OPTIONS: { value: FilterType; label: string; formula: string }[] = [
  { value: 'all',          label: 'All',           formula: '—'     },
  { value: 'dilution',     label: 'Dilution',       formula: 'C₁V₁' },
  { value: 'percent',      label: '% ↔ mol/L',      formula: 'w%'   },
  { value: 'ppm',          label: 'ppm → mol/L',    formula: 'ppm'  },
  { value: 'mole-fraction',label: 'Mole Fraction',  formula: 'χ'    },
]

// ── Problem union ─────────────────────────────────────────────────────────────

type Problem = DilutionProblem | ConcProblem

function pickAndGenerate(filter: FilterType): Problem {
  const dilutionSubtypes: DilutionSubtype[] = ['find_c2', 'find_v2', 'find_v1']
  const percentSubtypes: ConcSubtype[] = ['percent_to_molarity', 'molarity_to_percent']

  switch (filter) {
    case 'dilution':
      return genDilutionProblem(dilutionSubtypes[Math.floor(Math.random() * dilutionSubtypes.length)])
    case 'percent':
      return genConcProblem(percentSubtypes[Math.floor(Math.random() * percentSubtypes.length)])
    case 'ppm':
      return genConcProblem('ppm_to_molarity')
    case 'mole-fraction':
      return genConcProblem('mole_fraction')
    case 'all': {
      const all: Array<() => Problem> = [
        ...dilutionSubtypes.map(s => () => genDilutionProblem(s) as Problem),
        ...percentSubtypes.map(s => () => genConcProblem(s) as Problem),
        () => genConcProblem('ppm_to_molarity'),
        () => genConcProblem('mole_fraction'),
      ]
      return all[Math.floor(Math.random() * all.length)]()
    }
  }
}

function checkAnswer(input: string, problem: Problem): boolean {
  if ('subtype' in problem && (problem.subtype === 'find_c2' || problem.subtype === 'find_v2' || problem.subtype === 'find_v1')) {
    return checkDilutionAnswer(input, problem as DilutionProblem)
  }
  return checkConcAnswer(input, problem as ConcProblem)
}

const SUBTYPE_LABELS: Record<DilutionSubtype | ConcSubtype, string> = {
  find_c2:              'Find C₂',
  find_v2:              'Find V₂',
  find_v1:              'Find V₁',
  percent_to_molarity:  '% → mol/L',
  molarity_to_percent:  'mol/L → %',
  ppm_to_molarity:      'ppm → mol/L',
  mole_fraction:        'Mole Fraction',
}

// ── Main component ────────────────────────────────────────────────────────────


export default function DilutionConcPractice() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [problem, setProblem] = useState<Problem>(() => pickAndGenerate('all'))
  const [answer, setAnswer]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const nextProblem = useCallback((f: FilterType) => {
    setProblem(pickAndGenerate(f))
    setAnswer('')
    setSubmitted(false)
    setShowSteps(false)
  }, [])

  function handleFilter(f: FilterType) {
    setFilter(f)
    nextProblem(f)
  }

  function handleSubmit() {
    if (submitted || answer.trim() === '') return
    const correct = checkAnswer(answer, problem)
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }))
    setSubmitted(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  function handleTryAgain() {
    setAnswer('')
    setSubmitted(false)
    setShowSteps(false)
  }

  const correct = submitted && checkAnswer(answer, problem)
  const subtypeLabel = SUBTYPE_LABELS[problem.subtype as DilutionSubtype | ConcSubtype]

  return (
    <div className="flex flex-col gap-6">

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 p-1 rounded-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {FILTER_OPTIONS.map(opt => {
            const isActive = filter === opt.value
            return (
              <button key={opt.value} onClick={() => handleFilter(opt.value)}
                className="relative px-3 py-1 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
                {isActive && (
                  <motion.div layoutId="dilconc-type-bg" className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className="relative z-10">{opt.label}</span>
                <span className="relative z-10 font-mono text-[10px] ml-1 opacity-50">{opt.formula}</span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto font-mono text-sm text-secondary">
          {score.total > 0 ? (
            <span>
              <span className="text-bright">{score.correct}</span>
              <span className="text-dim"> / {score.total}</span>
            </span>
          ) : (
            <span className="text-dim">0 / 0</span>
          )}
        </div>
      </div>

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={problem.question}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="rounded-sm border border-border bg-surface p-5 lg:p-6 flex flex-col gap-5"
        >
          {/* Subtype badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-widest text-secondary uppercase">
              {subtypeLabel}
            </span>
          </div>

          {/* Question */}
          <p className="font-sans text-base lg:text-lg text-bright leading-relaxed">
            {problem.question}
          </p>

          {/* Given values */}
          {problem.given.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {problem.given.map((g, i) => (
                <div key={i}
                  className="px-3 py-1.5 rounded-sm border border-border bg-raised font-mono text-sm text-primary">
                  <span className="text-secondary">{g.label} = </span>
                  <span className="text-bright">{g.value}</span>
                  <span className="text-secondary ml-1">{g.unit}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hint */}
          {problem.hint && !submitted && (
            <p className="font-mono text-xs text-dim italic">{problem.hint}</p>
          )}

          {/* Answer input */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="font-mono text-base text-secondary whitespace-nowrap">
                {problem.solveFor} =
              </span>
              <input
                type="number"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={submitted}
                placeholder="your answer"
                className="flex-1 bg-raised border border-border rounded-sm px-3 py-2
                           font-mono text-base text-bright placeholder-dim
                           focus:outline-none focus:border-muted
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="font-mono text-sm text-secondary whitespace-nowrap">
                {problem.answerUnit}
              </span>
            </div>

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={answer.trim() === '' || isNaN(parseFloat(answer))}
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
              <div className="flex items-center gap-2">
                {!correct && (
                  <button onClick={handleTryAgain}
                    className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
                    style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-muted))', color: 'rgba(var(--overlay),0.55)' }}>
                    Try Again
                  </button>
                )}
                <button onClick={() => nextProblem(filter)}
                  className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-muted))', color: 'rgba(var(--overlay),0.75)' }}>
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="flex flex-col gap-3">
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-sm border text-base font-sans
                    ${correct
                      ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-300'
                      : 'border-rose-800/50 bg-rose-950/40 text-rose-300'
                    }`}>
                    <span className="font-mono">{correct ? '✓' : '✗'}</span>
                    {correct
                      ? 'Correct!'
                      : <>Incorrect. Answer: <span className="font-mono ml-1">{problem.answer.toPrecision(4)} {problem.answerUnit}</span></>
                    }
                  </div>

                  <button
                    onClick={() => setShowSteps(s => !s)}
                    className="self-start flex items-center gap-1.5 font-mono text-sm text-secondary hover:text-primary transition-colors"
                  >
                    <motion.span animate={{ rotate: showSteps ? 90 : 0 }} transition={{ duration: 0.15 }}>▶</motion.span>
                    {showSteps ? 'Hide solution' : 'Show solution'}
                  </button>

                  <AnimatePresence>
                    {showSteps && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="flex flex-col gap-2 pl-3 border-l border-border">
                          {problem.steps.map((step, i) => (
                            <p key={i} className="font-mono text-sm text-primary">{step}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      <p className="font-mono text-xs text-secondary">C₁V₁ = C₂V₂ · C (mol/L) = n / V · % = (mass_solute / mass_soln) × 100 · answers accepted within ±1%</p>
    </div>
  )
}

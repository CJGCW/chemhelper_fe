import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMolarProblem } from '../../utils/molarPractice'
import type { MolarCalcType, ProblemStyle, MolarProblem } from '../../utils/molarPractice'

// ── Type filter options ───────────────────────────────────────────────────────

type TypeFilter = MolarCalcType | 'all'

const TYPE_OPTIONS: { value: TypeFilter; label: string; formula: string }[] = [
  { value: 'all',      label: 'All',       formula: '—'         },
  { value: 'moles',    label: 'Moles',     formula: 'n=m/M'     },
  { value: 'molarity', label: 'Molarity',  formula: 'C=n/V'     },
  { value: 'molality', label: 'Molality',  formula: 'b=n/m'     },
  { value: 'bpe',      label: 'BPE',       formula: 'ΔTb'       },
  { value: 'fpd',      label: 'FPD',       formula: 'ΔTf'       },
]

const CALC_TYPES: MolarCalcType[] = ['moles', 'molarity', 'molality', 'bpe', 'fpd']

function pickType(filter: TypeFilter): MolarCalcType {
  if (filter !== 'all') return filter
  return CALC_TYPES[Math.floor(Math.random() * CALC_TYPES.length)]
}

// ── Tolerance check ───────────────────────────────────────────────────────────

function isCorrect(userVal: number, answer: number): boolean {
  if (answer === 0) return Math.abs(userVal) < 0.001
  return Math.abs((userVal - answer) / answer) <= 0.01  // ±1%
}

// ── Type label for display ────────────────────────────────────────────────────

const TYPE_LABELS: Record<MolarCalcType, string> = {
  moles:    'Moles',
  molarity: 'Molarity',
  molality: 'Molality',
  bpe:      'Boiling Point Elevation',
  fpd:      'Freezing Point Depression',
}

// ── Score display ─────────────────────────────────────────────────────────────

interface Score { correct: number; total: number }

// ── Main component ────────────────────────────────────────────────────────────

export default function MolarPractice() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [style, setStyle] = useState<ProblemStyle>('word')

  const [problem, setProblem] = useState<MolarProblem>(() =>
    generateMolarProblem(pickType('all'), 'word')
  )

  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 })

  const nextProblem = useCallback((filter: TypeFilter, s: ProblemStyle) => {
    setProblem(generateMolarProblem(pickType(filter), s))
    setAnswer('')
    setSubmitted(false)
    setShowSteps(false)
  }, [])

  function handleTypeFilter(f: TypeFilter) {
    setTypeFilter(f)
    nextProblem(f, style)
  }

  function handleStyle(s: ProblemStyle) {
    setStyle(s)
    nextProblem(typeFilter, s)
  }

  function handleSubmit() {
    if (submitted || answer.trim() === '') return
    const userVal = parseFloat(answer)
    if (isNaN(userVal)) return
    const correct = isCorrect(userVal, problem.answer)
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total:   prev.total + 1,
    }))
    setSubmitted(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  const correct = submitted && isCorrect(parseFloat(answer), problem.answer)

  return (
    <div className="flex flex-col gap-6">

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4">

        {/* Type filter pills */}
        <div className="flex items-center gap-1 p-1 rounded-sm"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {TYPE_OPTIONS.map(opt => {
            const isActive = typeFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleTypeFilter(opt.value)}
                className="relative px-3 py-1 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="practice-type-bg"
                    className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
                <span className="relative z-10 font-mono text-[10px] ml-1 opacity-50">{opt.formula}</span>
              </button>
            )
          })}
        </div>

        {/* Style toggle */}
        <div className="flex items-center gap-1 p-1 rounded-sm"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['word', 'arithmetic'] as ProblemStyle[]).map(s => {
            const isActive = style === s
            return (
              <button
                key={s}
                onClick={() => handleStyle(s)}
                className="relative px-3 py-1 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="practice-style-bg"
                    className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{s === 'word' ? 'Word Problem' : 'Arithmetic'}</span>
              </button>
            )
          })}
        </div>

        {/* Score */}
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
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-widest text-secondary uppercase">
              {TYPE_LABELS[problem.type]}
            </span>
            <span className="font-mono text-xs text-dim opacity-40">·</span>
            <span className="font-mono text-xs tracking-widest text-secondary uppercase opacity-70">
              {problem.style === 'word' ? 'Word Problem' : 'Arithmetic'}
            </span>
          </div>

          {/* Question */}
          <p className="font-sans text-base lg:text-lg text-bright leading-relaxed">
            {problem.question}
          </p>

          {/* Given values (arithmetic mode — already embedded in word problems) */}
          {problem.style === 'arithmetic' && problem.given.length > 0 && (
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
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                Check
              </button>
            ) : (
              <button
                onClick={() => nextProblem(typeFilter, style)}
                className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{
                  background: '#141620',
                  border: '1px solid #2a2e42',
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                Next →
              </button>
            )}
          </div>

          {/* Result feedback */}
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
                  {/* Correct / Incorrect banner */}
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-sm border text-base font-sans
                    ${correct
                      ? 'border-emerald-800/50 bg-emerald-950/40 text-emerald-300'
                      : 'border-rose-800/50 bg-rose-950/40 text-rose-300'
                    }`}>
                    <span className="font-mono">{correct ? '✓' : '✗'}</span>
                    {correct
                      ? 'Correct!'
                      : <>Incorrect. Answer: <span className="font-mono ml-1">{problem.answer} {problem.answerUnit}</span></>
                    }
                  </div>

                  {/* Show solution toggle */}
                  <button
                    onClick={() => setShowSteps(s => !s)}
                    className="self-start flex items-center gap-1.5 font-mono text-sm text-secondary hover:text-primary transition-colors"
                  >
                    <motion.span
                      animate={{ rotate: showSteps ? 90 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      ▶
                    </motion.span>
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
                            <p key={i} className="font-mono text-sm text-primary">
                              {step}
                            </p>
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
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RxnSubtype } from '../../utils/reactionPredictorPractice'
import { genRxnPracticeProblem, checkRxnPracticeAnswer } from '../../utils/reactionPredictorPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

type Selection = RxnSubtype | 'random'

const TYPES: { id: Selection; label: string; formula: string }[] = [
  { id: 'random',               label: 'Random',              formula: '?'   },
  { id: 'predict_occurs',       label: 'Does It React?',      formula: 'y/n' },
  { id: 'name_precipitate',     label: 'Name Precipitate',    formula: '↓'   },
  { id: 'identify_solubility',  label: 'Solubility Rule',     formula: 'S/I' },
]

const SUBTYPES: RxnSubtype[] = ['predict_occurs', 'name_precipitate', 'identify_solubility']

function freshProblem(sel: Selection) {
  const sub: RxnSubtype = sel === 'random' ? SUBTYPES[Math.floor(Math.random() * SUBTYPES.length)] : sel
  return genRxnPracticeProblem(sub)
}

interface Props { allowCustom?: boolean }

export default function ReactionPredictorPractice({ allowCustom = true }: Props) {
  const [selected,   setSelected]   = useState<Selection>('random')
  const [problem,    setProblem]    = useState(() => freshProblem('random'))
  const [chosen,     setChosen]     = useState<string | null>(null)
  const [showSteps,  setShowSteps]  = useState(false)
  const [score,      setScore]      = useState({ right: 0, total: 0 })
  const showAnswers = useShowAnswers()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem(sel: Selection = selected) {
    setProblem(freshProblem(sel))
    setChosen(null); setShowSteps(false)
  }

  function handleTypeChange(sel: Selection) {
    setSelected(sel)
    setProblem(freshProblem(sel))
    setChosen(null); setShowSteps(false)
    setScore({ right: 0, total: 0 })
  }

  function handleChoose(choice: string) {
    if (chosen !== null) return
    const correct = checkRxnPracticeAnswer(choice, problem)
    setChosen(choice)
    setScore(s => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const checked = chosen !== null
  const correct = checked && checkRxnPracticeAnswer(chosen, problem)

  const cardBorder = checked
    ? correct
      ? 'feedback-success'
      : 'feedback-error'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Type selector */}
      {allowCustom && <div className="flex flex-wrap gap-1.5">
        {TYPES.map(t => {
          const isActive = selected === t.id
          return (
            <button key={t.id} onClick={() => handleTypeChange(t.id)}
              className="flex flex-col items-start px-3 py-2 rounded-sm font-sans text-sm font-medium transition-colors text-left"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.45)',
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
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.right / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={problem.question}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${cardBorder}`}
      >
        {/* Context equation */}
        {problem.context && (
          <p className="font-mono text-sm text-secondary rounded-sm px-3 py-2"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {problem.context}
          </p>
        )}

        <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>

        {problem.hint && (
          <p className="font-mono text-xs" style={{ color: 'rgba(255,200,80,0.75)' }}>
            Hint: {problem.hint}
          </p>
        )}

        {/* Choice buttons */}
        <div className="flex flex-col gap-2">
          {problem.choices.map(choice => {
            const isChosen  = chosen === choice
            const isCorrect = choice === problem.answer
            let cls = 'border-border text-secondary hover:border-muted hover:text-primary'
            if (checked && isCorrect)                cls = 'feedback-success text-success-strong'
            if (checked && isChosen && !isCorrect)   cls = 'feedback-error text-error-strong'
            return (
              <button key={choice} disabled={checked} onClick={() => handleChoose(choice)}
                className={`text-left px-4 py-2.5 rounded-sm border font-sans text-sm transition-colors disabled:cursor-default font-mono ${cls}`}>
                {choice}
              </button>
            )
          })}
        </div>

        {/* Feedback row */}
        {checked && (
          <div className="flex items-center gap-3">
            <span className={`font-sans text-sm font-medium ${correct ? 'text-success' : 'text-error'}`}>
              {correct ? '✓ Correct' : '✗ Incorrect'}
            </span>
            <button onClick={() => setShowSteps(s => !s)}
              className="font-mono text-xs text-dim hover:text-secondary transition-colors">
              {showSteps ? '▲ hide' : '▼ solution'}
            </button>
          </div>
        )}

        {/* Solution steps */}
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
                {!correct && showAnswers && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-dim">Answer:</span>
                    <span className="font-mono text-sm text-bright">{problem.answer}</span>
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

      {/* Next / Try Again */}
      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          {!correct && (
            <button onClick={() => { setChosen(null); setShowSteps(false) }}
              className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-dim hover:text-secondary transition-colors">
              Try Again
            </button>
          )}
          <button onClick={() => nextProblem()}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
      <p className="font-mono text-xs text-secondary">precipitation: two soluble ionic compounds exchange ions to form an insoluble product</p>
    </div>
  )
}

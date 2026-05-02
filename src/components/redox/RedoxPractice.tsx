import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { RedoxSubtype } from '../../utils/redoxPractice'
import { generateRedoxProblem, generateDynamicRedoxProblem, checkRedoxAnswer } from '../../utils/redoxPractice'
import { useShowAnswers } from '../../stores/preferencesStore'
import GeneratedBadge from '../shared/GeneratedBadge'
type Selection = RedoxSubtype | 'random'

const TYPES: { id: Selection; label: string; formula: string }[] = [
  { id: 'random',          label: 'Random',                    formula: '?'     },
  { id: 'ox_state',        label: 'Oxidation Numbers',         formula: 'ox. #' },
  { id: 'identify_redox',  label: 'Identify Oxidised/Reduced', formula: 'OA/RA' },
  { id: 'ox_change',       label: 'Oxidation State Change',    formula: 'Δox'   },
  { id: 'charge_balance',  label: 'Charge Balancing',          formula: 'q⁺/q⁻' },
  { id: 'ecell',           label: 'E°cell',                    formula: 'E°'    },
]

const ALL_SUBTYPES: RedoxSubtype[] = ['ox_state', 'identify_redox', 'ox_change', 'charge_balance', 'ecell']

function freshProblem(sel: Selection, forceDynamic = false) {
  const t: RedoxSubtype = sel === 'random'
    ? ALL_SUBTYPES[Math.floor(Math.random() * ALL_SUBTYPES.length)]
    : sel
  if (forceDynamic || Math.random() < 0.6) return generateDynamicRedoxProblem(t)
  return generateRedoxProblem(t)
}

export function generateRedoxExample() {
  const p = freshProblem('random')
  const last = p.steps.length - 1
  return { scenario: p.question, steps: p.steps.slice(0, last), result: p.steps[last] }
}

interface Props { allowCustom?: boolean }

export default function RedoxPractice({ allowCustom = true }: Props) {
  const [selected,  setSelected]  = useState<Selection>('random')
  const [problem,   setProblem]   = useState(() => freshProblem('random'))
  const [answer,    setAnswer]    = useState('')
  const [checked,   setChecked]   = useState(false)
  const [correct,   setCorrect]   = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score,     setScore]     = useState({ correct: 0, total: 0 })
  const showAnswers = useShowAnswers()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem(sel: Selection = selected) {
    setProblem(freshProblem(sel, !allowCustom))
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

  function handleTypeChange(sel: Selection) {
    setSelected(sel)
    setProblem(freshProblem(sel))
    setAnswer('')
    setChecked(false)
    setShowSteps(false)
    setScore({ correct: 0, total: 0 })
  }

  function handleCheck() {
    if (!answer.trim() || checked) return
    const c = checkRedoxAnswer(answer, problem)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
  }

  const borderClass = checked
    ? correct
      ? 'border-emerald-800/50 bg-emerald-950/20'
      : 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  const placeholder = problem.isTextAnswer
    ? 'formula, e.g. Zn'
    : problem.subtype === 'charge_balance'
      ? 'e.g. 2'
      : 'e.g. +6 or −2'

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Type selector */}
      {allowCustom && <div className="flex flex-wrap gap-1.5">
        {TYPES.map(t => {
          const isActive = selected === t.id
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
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={problem.question + problem.reactionEq}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
      >
        {/* Reaction equation context */}
        {problem.reactionEq && (
          <p className="font-mono text-sm text-secondary rounded-sm px-3 py-2"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {problem.reactionEq}
          </p>
        )}

        {/* Question */}
        <div className="flex items-start gap-2 flex-wrap">
          <p className="font-sans text-base text-bright leading-relaxed flex-1">{problem.question}</p>
          {problem.isDynamic && <GeneratedBadge />}
        </div>

        {/* Hint */}
        {problem.hint && (
          <p className="font-mono text-xs" style={{ color: 'rgba(255,200,80,0.75)' }}>
            Note: {problem.hint}
          </p>
        )}

        {/* Input row */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type={problem.isTextAnswer ? 'text' : 'text'}
            inputMode={problem.isTextAnswer ? 'text' : 'numeric'}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => !checked && e.key === 'Enter' && handleCheck()}
            disabled={checked}
            placeholder={placeholder}
            className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base
                        placeholder-dim focus:outline-none focus:border-muted
                        disabled:cursor-not-allowed transition-colors w-40
                        ${checked
                          ? correct
                            ? 'border-emerald-700/60 text-emerald-300'
                            : 'border-rose-700/60 text-rose-300'
                          : 'border-border text-bright'}`}
          />

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
      <p className="font-mono text-xs text-secondary">OIL RIG: oxidation is loss, reduction is gain · balance atoms then balance charge with e⁻</p>
    </div>
  )
}

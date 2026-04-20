import { useState } from 'react'
import { motion } from 'framer-motion'
import type { EcellSubtype } from '../../utils/ecellPractice'
import { genEcellProblem, checkEcellAnswer } from '../../utils/ecellPractice'
import StepsPanel from '../calculations/StepsPanel'

type Selection = EcellSubtype | 'random'

const TYPES: { id: Selection; label: string; formula: string }[] = [
  { id: 'random',      label: 'Random',         formula: '?'  },
  { id: 'calc_e0cell', label: 'Calculate E°cell', formula: 'E°' },
  { id: 'spontaneity', label: 'Spontaneity',     formula: 'ΔG' },
  { id: 'nernst',      label: 'Nernst Equation', formula: 'E'  },
  { id: 'delta_g',     label: 'Calculate ΔG°',   formula: 'ΔG°' },
]

const SUBTYPES: EcellSubtype[] = ['calc_e0cell', 'spontaneity', 'nernst', 'delta_g']

function freshProblem(sel: Selection) {
  const sub: EcellSubtype = sel === 'random' ? SUBTYPES[Math.floor(Math.random() * SUBTYPES.length)] : sel
  return genEcellProblem(sub)
}

export default function EcellPractice() {
  const [selected,  setSelected]  = useState<Selection>('random')
  const [problem,   setProblem]   = useState(() => freshProblem('random'))
  const [answer,    setAnswer]    = useState('')
  const [checked,   setChecked]   = useState(false)
  const [correct,   setCorrect]   = useState(false)
  const [steps,     setSteps]     = useState<string[]>([])
  const [score,     setScore]     = useState({ correct: 0, total: 0 })

  function nextProblem(sel: Selection = selected) {
    setProblem(freshProblem(sel))
    setAnswer(''); setChecked(false); setSteps([])
  }

  function handleTypeChange(sel: Selection) {
    setSelected(sel)
    setProblem(freshProblem(sel))
    setAnswer(''); setChecked(false); setSteps([])
    setScore({ correct: 0, total: 0 })
  }

  function handleCheck() {
    if (!answer.trim() || checked) return
    const c = checkEcellAnswer(answer, problem)
    setCorrect(c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (c ? 1 : 0), total: s.total + 1 }))
    setSteps(problem.steps)
  }

  const borderClass = checked
    ? correct
      ? 'border-emerald-800/50 bg-emerald-950/20'
      : 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  const isNumeric = problem.subtype !== 'spontaneity'
  const placeholder = isNumeric
    ? `e.g. ${problem.subtype === 'delta_g' ? '-213.0' : '+1.104'}`
    : 'yes or no'

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Type selector */}
      <div className="flex flex-wrap gap-1.5">
        {TYPES.map(t => {
          const isActive = selected === t.id
          return (
            <button key={t.id} onClick={() => handleTypeChange(t.id)}
              className="flex flex-col items-start px-3 py-2 rounded-sm font-sans text-sm font-medium transition-colors text-left"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
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
      </div>

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      {/* Problem card */}
      <motion.div
        key={problem.question + problem.context}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
      >
        {/* Context block — half-reactions */}
        <pre
          className="font-mono text-xs text-secondary rounded-sm px-3 py-2.5 overflow-x-auto whitespace-pre-wrap"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}
        >
          {problem.context}
        </pre>

        <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>

        {problem.hint && (
          <p className="font-mono text-xs" style={{ color: 'rgba(255,200,80,0.75)' }}>
            Hint: {problem.hint}
          </p>
        )}

        {/* Input row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-stretch gap-0">
            <input
              type="text"
              inputMode={isNumeric ? 'decimal' : 'text'}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => !checked && e.key === 'Enter' && handleCheck()}
              disabled={checked}
              placeholder={placeholder}
              className={`bg-raised border rounded-l-sm px-3 py-1.5 font-mono text-base
                          placeholder-dim focus:outline-none transition-colors w-36
                          disabled:cursor-not-allowed
                          ${checked
                            ? correct
                              ? 'border-emerald-700/60 text-emerald-300'
                              : 'border-rose-700/60 text-rose-300'
                            : 'border-border text-bright'}`}
            />
            {problem.answerUnit && (
              <span className={`flex items-center px-2 font-mono text-xs rounded-r-sm border border-l-0 shrink-0
                                ${checked
                                  ? correct ? 'border-emerald-700/60 text-emerald-400' : 'border-rose-700/60 text-rose-400'
                                  : 'border-border text-dim'}`}
                style={{ background: 'rgb(var(--color-base))' }}>
                {problem.answerUnit}
              </span>
            )}
          </div>

          {!checked ? (
            <button onClick={handleCheck} disabled={!answer.trim()}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
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
        </div>

      </motion.div>

      <StepsPanel steps={steps} />

      {/* Next / Try Again */}
      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          {!correct && (
            <button onClick={() => { setAnswer(''); setChecked(false); setSteps([]) }}
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
    </div>
  )
}

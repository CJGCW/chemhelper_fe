import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateCrossCouplingProblem, checkCrossCouplingAnswer } from '../../utils/crossCouplingPractice'
import type { CrossCouplingProblem, CrossCouplingProblemType } from '../../utils/crossCouplingPractice'
import CompoundDisplay from '../shared/CompoundDisplay'

interface Props { allowCustom?: boolean }

const SUB_MODES: { id: CrossCouplingProblemType; label: string; formula: string }[] = [
  { id: 'identify-coupling', label: 'Identify Reaction', formula: 'name?' },
  { id: 'predict-product',   label: 'Predict Product',   formula: 'Ar–R?' },
]

function newQuestion(type: CrossCouplingProblemType): CrossCouplingProblem {
  return generateCrossCouplingProblem(type)
}

export default function CrossCouplingPractice({ allowCustom: _allowCustom = true }: Props) {
  const [subMode, setSubMode]     = useState<CrossCouplingProblemType>('identify-coupling')
  const [question, setQuestion]   = useState<CrossCouplingProblem>(() => newQuestion('identify-coupling'))
  const [selected, setSelected]   = useState<string | null>(null)
  const [checked, setChecked]     = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  function changeMode(mode: CrossCouplingProblemType) {
    setSubMode(mode)
    setQuestion(newQuestion(mode))
    setSelected(null)
    setChecked(false)
    setShowSteps(false)
  }

  function handleSelect(opt: string) {
    if (checked) return
    setSelected(opt)
    const correct = checkCrossCouplingAnswer(question, opt)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setQuestion(newQuestion(subMode))
    setSelected(null)
    setChecked(false)
    setShowSteps(false)
  }

  const correct = checked && selected != null ? checkCrossCouplingAnswer(question, selected) : false
  const activeTint = 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))'
  const activeBorder = 'color-mix(in srgb, var(--c-halogen) 40%, transparent)'

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Sub-mode pills */}
      <div className="flex items-center gap-1 flex-wrap print:hidden">
        {SUB_MODES.map(m => {
          const isActive = subMode === m.id
          return (
            <button key={m.id} onClick={() => changeMode(m.id)}
              className="relative px-3 py-1 rounded-sm font-sans text-sm transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}>
              {isActive && (
                <motion.div layoutId="xcoupling-sub-pill" className="absolute inset-0 rounded-sm"
                  style={{ background: activeTint, border: `1px solid ${activeBorder}` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{m.label}</span>
              <span className="relative z-10 font-mono text-[10px] ml-1 opacity-50">{m.formula}</span>
            </button>
          )
        })}
      </div>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={`${subMode}-${question.scenario.slice(0, 30)}`}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
            !checked ? 'border-border' : correct ? 'border-success-border' : 'border-error-border'
          }`}
          style={{ background: checked ? (correct ? 'rgb(var(--color-success-bg) / 0.25)' : 'rgb(var(--color-error-bg) / 0.25)') : 'rgb(var(--color-surface))' }}
        >
          {question.substrateSmiles && (
            <div className="flex items-center gap-3">
              <CompoundDisplay smiles={question.substrateSmiles} label="Electrophile" width={180} height={140} />
            </div>
          )}
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">{question.scenario}</pre>
          <p className="font-sans text-sm text-secondary font-medium">{question.question}</p>

          <div className="flex flex-col gap-2">
            {question.choices.map(opt => {
              const isSelected = selected === opt
              const isCorrect  = opt === question.answer
              let style: React.CSSProperties = { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)' }
              if (checked) {
                if (isCorrect) style = { background: 'rgb(var(--color-success-bg) / 0.35)', border: '1px solid rgb(var(--color-success-border) / 0.5)', color: 'rgb(var(--color-success))' }
                else if (isSelected) style = { background: 'rgb(var(--color-error-bg) / 0.35)', border: '1px solid rgb(var(--color-error-border) / 0.4)', color: 'rgb(var(--color-error))' }
              } else if (isSelected) {
                style = { background: activeTint, border: `1px solid ${activeBorder}`, color: 'var(--c-halogen)' }
              }
              return (
                <button key={opt} onClick={() => handleSelect(opt)} disabled={checked}
                  className="px-4 py-2.5 rounded-sm font-mono text-sm text-left transition-colors disabled:cursor-not-allowed leading-snug"
                  style={style}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {checked && (
            <div className="flex flex-col gap-1.5">
              <p className={`font-sans text-sm font-medium ${correct ? 'text-success' : 'text-error'}`}>
                {correct ? '✓ Correct' : `✗ Incorrect — ${question.answer}`}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{question.explanation}</p>
              <button onClick={() => setShowSteps(o => !o)}
                className="self-start font-sans text-xs text-dim hover:text-secondary transition-colors mt-1">
                {showSteps ? '▲ Hide mechanism' : '▼ Show catalytic cycle steps'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSteps && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-base))' }}>
              <span className="font-mono text-[10px] text-dim uppercase tracking-wider">Catalytic Cycle</span>
              {question.steps.map((s, i) => (
                <p key={i} className="font-sans text-sm text-secondary leading-relaxed">
                  <span className="font-mono text-xs text-dim mr-2">{i + 1}.</span>{s}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={next}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

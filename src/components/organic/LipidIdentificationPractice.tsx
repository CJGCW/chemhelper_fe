import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateLipidProblem, checkLipidAnswer, makeDistractors, LIPID_CLASS_LABELS } from '../../utils/lipidPractice'
import type { LipidClass } from '../../utils/lipidPractice'
import CompoundDisplay from '../shared/CompoundDisplay'

interface Props { allowCustom?: boolean }

function buildQuestion() {
  const p = generateLipidProblem()
  const distractors = makeDistractors(p.lipidClass, 3)
  const choices = [p.lipidClass, ...distractors].sort(() => Math.random() - 0.5)
  return { p, choices }
}

export default function LipidIdentificationPractice({ allowCustom: _allowCustom = true }: Props) {
  const [{ p: problem, choices }, setQuestion] = useState(() => buildQuestion())
  const [selected, setSelected]   = useState<LipidClass | null>(null)
  const [checked, setChecked]     = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  function handleSelect(c: LipidClass) {
    if (checked) return
    setSelected(c)
    const correct = checkLipidAnswer(problem, c)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setQuestion(buildQuestion())
    setSelected(null)
    setChecked(false)
    setShowSteps(false)
  }

  const correct = checked && selected != null ? checkLipidAnswer(problem, selected) : false

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Given a lipid structure description, identify its class.
      </p>

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
        <motion.div key={problem.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
            !checked ? 'border-border' : correct ? 'border-emerald-800/50' : 'border-rose-800/50'
          }`}
          style={{ background: checked ? (correct ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)') : 'rgb(var(--color-surface))' }}
        >
          {problem.commonName && (
            <span className="font-mono text-xs text-dim">{problem.commonName}</span>
          )}
          {problem.smiles && (
            <CompoundDisplay smiles={problem.smiles} label={problem.commonName ?? problem.id} width={280} height={180} />
          )}
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">{problem.scenario}</pre>

          <p className="font-sans text-sm text-secondary font-medium">What class of lipid is this?</p>

          <div className="grid grid-cols-2 gap-2">
            {choices.map(c => {
              const isSelected = selected === c
              const isCorrect  = c === problem.lipidClass
              let style: React.CSSProperties = { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)' }
              if (checked) {
                if (isCorrect) style = { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                else if (isSelected) style = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }
              } else if (isSelected) {
                style = { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }
              }
              return (
                <button key={c} onClick={() => handleSelect(c)} disabled={checked}
                  className="px-3 py-2 rounded-sm font-sans text-sm text-left transition-colors disabled:cursor-not-allowed leading-snug"
                  style={style}
                >
                  {LIPID_CLASS_LABELS[c]}
                </button>
              )
            })}
          </div>

          {checked && (
            <div className="flex flex-col gap-1.5">
              <p className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {correct ? '✓ Correct' : `✗ Incorrect — ${LIPID_CLASS_LABELS[problem.lipidClass]}`}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{problem.explanation}</p>
              <button onClick={() => setShowSteps(o => !o)}
                className="self-start font-sans text-xs text-dim hover:text-secondary transition-colors mt-1">
                {showSteps ? '▲ Hide steps' : '▼ Show classification steps'}
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
              <span className="font-mono text-[10px] text-dim uppercase tracking-wider">Classification Steps</span>
              {problem.steps.map((s, i) => (
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

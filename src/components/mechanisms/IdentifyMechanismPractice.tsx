import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateQuestion, checkMechAnswer, type MechQuestion } from '../../utils/mechanismQuestions'
import type { MechanismCategory } from '../../data/mechanisms/types'

interface Props { category?: MechanismCategory | 'all' }

export default function IdentifyMechanismPractice({ category = 'all' }: Props) {
  const [q, setQ]             = useState<MechQuestion>(() => generateQuestion('identify-mechanism', category)!)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore]     = useState({ correct: 0, total: 0 })

  function next() {
    setQ(generateQuestion('identify-mechanism', category)!)
    setSelected(null)
    setChecked(false)
  }

  function handleSelect(opt: string) {
    if (checked) return
    setSelected(opt)
    const correct = checkMechAnswer(q, opt)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const correct = checked && selected ? checkMechAnswer(q, selected) : false

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Given reactants and products, identify the mechanism type.
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
        <motion.div key={q.reactionId}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
            !checked ? 'border-border' : correct ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-rose-800/50 bg-rose-950/20'
          }`}
          style={{ background: checked ? undefined : 'rgb(var(--color-surface))' }}
        >
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">{q.scenario}</pre>
          <p className="font-sans text-sm text-secondary font-medium">{q.question}</p>

          <div className="flex flex-col gap-2">
            {q.choices.map(opt => {
              const isSelected = selected === opt
              const isCorrect  = opt === q.answer
              let style: React.CSSProperties = { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)' }
              if (checked) {
                if (isCorrect) style = { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                else if (isSelected) style = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }
              } else if (isSelected) {
                style = { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }
              }
              return (
                <button key={opt} onClick={() => handleSelect(opt)} disabled={checked}
                  className="px-4 py-2.5 rounded-sm font-sans text-sm text-left transition-colors disabled:cursor-not-allowed"
                  style={style}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {checked && (
            <div className="flex flex-col gap-1.5">
              <p className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {correct ? '✓ Correct' : `✗ Incorrect — ${q.answer}`}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{q.explanation}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={next} className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

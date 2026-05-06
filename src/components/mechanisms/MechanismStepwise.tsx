import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ALL_REACTIONS } from '../../data/mechanisms/index'
import type { ReactionDef, MechanismCategory } from '../../data/mechanisms/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface StepInfo { label: string; description: string }

function getStepsFromReaction(r: ReactionDef): StepInfo[] {
  if (r.frames && r.frames.length > 0) {
    return r.frames.map(f => ({ label: f.shortLabel, description: f.description }))
  }
  if (r.steps && r.steps.length > 0) {
    return r.steps.map(s => ({ label: s.label, description: s.description }))
  }
  return [
    { label: 'Step 1', description: `${r.reactants} react under ${r.conditions}` },
    { label: 'Step 2', description: r.intermediate ? `Intermediate: ${r.intermediate}` : 'Transition state forms' },
    { label: 'Product', description: `${r.products} formed` },
  ]
}

interface StepOrderQuestion {
  reaction: ReactionDef
  steps: StepInfo[]
  shuffled: StepInfo[]
}

function buildQuestion(category: MechanismCategory | 'all'): StepOrderQuestion {
  const pool = category === 'all' ? ALL_REACTIONS : ALL_REACTIONS.filter(r => r.category === category)
  const r = pick(pool.length > 0 ? pool : ALL_REACTIONS)
  const steps = getStepsFromReaction(r)
  return { reaction: r, steps, shuffled: shuffle(steps) }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { category?: MechanismCategory | 'all' }

export default function MechanismStepwise({ category = 'all' }: Props) {
  const [q, setQ]         = useState<StepOrderQuestion>(() => buildQuestion(category))
  const [order, setOrder] = useState<StepInfo[]>([])
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const remaining = useMemo(
    () => q.shuffled.filter(s => !order.includes(s)),
    [q.shuffled, order],
  )

  function addStep(step: StepInfo) {
    if (checked) return
    setOrder(prev => [...prev, step])
  }

  function removeStep(step: StepInfo) {
    if (checked) return
    setOrder(prev => prev.filter(s => s !== step))
  }

  function checkAnswer() {
    if (order.length !== q.steps.length) return
    setChecked(true)
    const correct = order.every((s, i) => s.label === q.steps[i].label)
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }))
  }

  function next() {
    setQ(buildQuestion(category))
    setOrder([])
    setChecked(false)
  }

  const isCorrect = checked && order.every((s, i) => s.label === q.steps[i].label)

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Put the mechanism steps in the correct order by clicking them in sequence.
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

      <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-surface))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-wider">Reaction</span>
        <span className="font-sans text-sm text-bright font-semibold">{q.reaction.name}</span>
        <span className="font-mono text-sm text-secondary">{q.reaction.reactants} → {q.reaction.products}</span>
        <span className="font-sans text-xs text-secondary">{q.reaction.conditions}</span>
      </div>

      {/* Available steps */}
      {!checked && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-dim uppercase tracking-wider">Available steps — click to add:</span>
          <div className="flex flex-col gap-1.5">
            {remaining.map(step => (
              <button key={step.label} onClick={() => addStep(step)}
                className="px-4 py-2.5 rounded-sm border border-border text-left transition-colors hover:border-muted"
                style={{ background: 'rgb(var(--color-raised))' }}
              >
                <span className="font-mono text-xs text-dim mr-2">{step.label}</span>
                <span className="font-sans text-sm text-secondary">{step.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ordered steps */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-dim uppercase tracking-wider">Your order:</span>
        {order.length === 0 && (
          <p className="font-sans text-sm text-dim italic">Click steps above to build your sequence.</p>
        )}
        <div className="flex flex-col gap-1.5">
          {order.map((step, i) => {
            const isStepCorrect = checked ? q.steps[i]?.label === step.label : null
            return (
              <button key={`${step.label}-${i}`} onClick={() => removeStep(step)} disabled={checked}
                className="px-4 py-2.5 rounded-sm border text-left transition-colors disabled:cursor-default"
                style={{
                  background: checked
                    ? isStepCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
                    : 'rgb(var(--color-raised))',
                  border: checked
                    ? `1px solid ${isStepCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.35)'}`
                    : '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                }}
              >
                <span className="font-mono text-xs mr-2" style={{ color: 'rgba(var(--overlay),0.35)' }}>{i + 1}.</span>
                <span className="font-mono text-xs text-dim mr-2">{step.label}</span>
                <span className="font-sans text-sm text-secondary">{step.description}</span>
                {!checked && <span className="float-right font-mono text-xs text-dim ml-2">✕</span>}
              </button>
            )
          })}
        </div>
      </div>

      {checked && (
        <div className="rounded-sm border p-4 flex flex-col gap-2"
          style={{ background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: isCorrect ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)' }}
        >
          <p className={`font-sans text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCorrect ? '✓ Correct order!' : '✗ Incorrect order'}
          </p>
          {!isCorrect && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="font-mono text-xs text-dim">Correct sequence:</span>
              {q.steps.map((s, i) => (
                <p key={s.label} className="font-sans text-sm text-secondary">
                  <span className="font-mono text-xs text-dim mr-2">{i + 1}.</span>
                  {s.label} — {s.description}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!checked && order.length === q.steps.length && (
          <button onClick={checkAnswer}
            className="px-4 py-2 rounded-sm font-sans text-sm border font-medium transition-colors"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}
          >
            Check Order
          </button>
        )}
        {checked && (
          <button onClick={next} className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

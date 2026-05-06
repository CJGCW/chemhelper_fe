import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SYNTHESIS_PROBLEMS, ORDERING_PROBLEMS } from '../../data/organic/synthesisProblems'
import CompoundDisplay from '../shared/CompoundDisplay'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildProblem() {
  const op = ORDERING_PROBLEMS[Math.floor(Math.random() * ORDERING_PROBLEMS.length)]
  const base = SYNTHESIS_PROBLEMS.find(p => p.id === op.baseProblemId)
  if (!base) return null
  const correctOrder = base.steps.map(s => s.reagents)
  const chips = shuffle([...correctOrder, ...op.distractors])
  return { base, correctOrder, chips }
}

interface Props { allowCustom?: boolean }

export default function SynthesisOrderingPractice({ allowCustom: _allowCustom = true }: Props) {
  const [prob, setProb] = useState(() => buildProblem())
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const usedSet = useMemo(() => new Set(selected), [selected])

  if (!prob) return null
  const { base, correctOrder, chips } = prob

  const results: boolean[] = submitted
    ? selected.map((s, i) => s === correctOrder[i])
    : []
  const allCorrect = submitted && results.every(Boolean) && selected.length === correctOrder.length

  function handleChipClick(chip: string) {
    if (submitted) return
    if (usedSet.has(chip)) {
      // Deselect — remove last occurrence
      const idx = selected.lastIndexOf(chip)
      setSelected(prev => prev.filter((_, i) => i !== idx))
    } else if (selected.length < correctOrder.length) {
      setSelected(prev => [...prev, chip])
    }
  }

  function handleSubmit() {
    if (submitted || selected.length !== correctOrder.length) return
    const correct = selected.filter((s, i) => s === correctOrder[i]).length
    setScore(sc => ({ correct: sc.correct + correct, total: sc.total + correctOrder.length }))
    setSubmitted(true)
  }

  function handleNext() {
    setProb(buildProblem())
    setSelected([])
    setSubmitted(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Score */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Problem */}
      <div className="flex flex-col gap-4">
        <div className="flex items-stretch gap-4">
          <div className="rounded-sm border border-border px-4 py-3 flex-1"
            style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-0.5">Starting material</span>
            {base.startingMaterial.smiles ? (
              <div className="flex flex-col items-start gap-1 mt-1">
                <CompoundDisplay smiles={base.startingMaterial.smiles} label={base.startingMaterial.label} width={150} height={110} />
                <span className="font-sans text-xs text-secondary">{base.startingMaterial.label}</span>
              </div>
            ) : (
              <span className="font-sans text-sm font-medium text-primary">{base.startingMaterial.label}</span>
            )}
          </div>
          <div className="flex items-center text-dim font-mono text-lg">→</div>
          <div className="rounded-sm border border-border px-4 py-3 flex-1"
            style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-0.5">Target</span>
            {base.target.smiles ? (
              <div className="flex flex-col items-start gap-1 mt-1">
                <CompoundDisplay smiles={base.target.smiles} label={base.target.label} width={150} height={110} />
                <span className="font-sans text-xs text-secondary">{base.target.label}</span>
              </div>
            ) : (
              <span className="font-sans text-sm font-medium text-primary">{base.target.label}</span>
            )}
          </div>
        </div>

        {/* Instruction */}
        <p className="font-sans text-xs text-secondary">
          Click reagents in the correct sequence to complete the synthesis ({correctOrder.length} step{correctOrder.length > 1 ? 's' : ''}).
        </p>

        {/* Reagent chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, i) => {
            const isUsed = usedSet.has(chip)
            return (
              <button key={i} onClick={() => handleChipClick(chip)}
                disabled={submitted}
                className="px-3 py-1.5 rounded-sm border text-xs font-mono transition-colors"
                style={isUsed ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                  opacity: 0.6,
                } : {
                  background: 'rgb(var(--color-raised))',
                  borderColor: 'rgba(var(--overlay),0.2)',
                  color: 'rgb(var(--color-primary))',
                }}>
                {chip}
              </button>
            )
          })}
        </div>

        {/* Selected sequence */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Your sequence:</span>
          {selected.length === 0 && (
            <p className="font-sans text-xs text-dim italic">Click reagents above to fill in your sequence…</p>
          )}
          {selected.map((chip, i) => {
            const isCorrect = submitted && results[i]
            const isWrong = submitted && !results[i]
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-dim w-10 shrink-0">Step {i + 1}</span>
                <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-sm border"
                  style={{
                    background: isCorrect ? 'rgb(34 197 94 / 0.06)' : isWrong ? 'rgb(239 68 68 / 0.06)' : 'rgb(var(--color-raised))',
                    borderColor: isCorrect ? 'rgb(34 197 94)' : isWrong ? 'rgb(239 68 68)' : 'rgba(var(--overlay),0.15)',
                  }}>
                  <span className="font-mono text-xs text-primary flex-1">{chip}</span>
                  {isCorrect && <span className="text-emerald-500 text-xs">✓</span>}
                  {isWrong   && <span className="text-red-500 text-xs">✗</span>}
                </div>
                {!submitted && (
                  <button onClick={() => setSelected(prev => prev.filter((_, j) => j !== i))}
                    className="text-dim hover:text-secondary font-mono text-xs">✕</button>
                )}
              </div>
            )
          })}
        </div>

        {/* Correct answer reveal */}
        {submitted && !allCorrect && (
          <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
            style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Correct sequence</span>
            {correctOrder.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-dim w-10">Step {i + 1}</span>
                <span className="font-mono text-xs text-primary">{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted ? (
          <button onClick={handleSubmit}
            disabled={selected.length !== correctOrder.length}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Check sequence
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Next problem →
          </button>
        )}
      </div>
    </div>
  )
}

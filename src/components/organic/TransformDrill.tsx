import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FGI_TABLE, type FunctionalGroup, type FGITransformation } from '../../data/organic/fgiTable'

const FG_LABELS: Record<FunctionalGroup, string> = {
  alkane:          'Alkane',
  alkene:          'Alkene',
  alkyne:          'Alkyne',
  alkyl_halide:    'Alkyl Halide (RX)',
  alcohol:         'Alcohol (ROH)',
  ether:           'Ether (ROR\')',
  epoxide:         'Epoxide',
  aldehyde:        'Aldehyde (RCHO)',
  ketone:          'Ketone (RCOR\')',
  carboxylic_acid: 'Carboxylic Acid (RCOOH)',
  ester:           'Ester (RCOOR\')',
  amide:           'Amide (RCONR₂)',
  amine:           'Amine (RNH₂)',
  nitrile:         'Nitrile (RCN)',
  aromatic:        'Aromatic (Ar)',
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

interface TransformProblem {
  correct: FGITransformation
  options: string[]
}

function generateProblem(): TransformProblem {
  const correct = FGI_TABLE[Math.floor(Math.random() * FGI_TABLE.length)]

  // Distractors: same from-group, different reagents OR different product group
  const sameFromDifferentTo = FGI_TABLE.filter(
    t => t.from === correct.from && t.reagents !== correct.reagents
  )
  const differentFrom = FGI_TABLE.filter(
    t => t.from !== correct.from
  )

  const distractorPool = sameFromDifferentTo.length >= 3
    ? sameFromDifferentTo
    : [...sameFromDifferentTo, ...differentFrom]

  const distractors = pickN(distractorPool, 3)
  const options = [...distractors.map(d => d.reagents), correct.reagents].sort(() => Math.random() - 0.5)

  return { correct, options }
}

interface Props { allowCustom?: boolean }

export default function TransformDrill({ allowCustom: _allowCustom = true }: Props) {
  const [problem, setProblem] = useState<TransformProblem>(generateProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const next = useCallback(() => {
    setProblem(generateProblem())
    setSelected(null)
  }, [])

  function handleSelect(option: string) {
    if (selected !== null) return
    setSelected(option)
    const correct = option === problem.correct.reagents
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const { correct, options } = problem

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* Score */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'rgb(var(--color-success))' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Question */}
      <div className="rounded-sm border border-border p-5 flex flex-col gap-3"
        style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Single-step transformation</span>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-dim">From</span>
            <span className="font-sans text-sm font-semibold text-primary">{FG_LABELS[correct.from]}</span>
          </div>
          <span className="font-mono text-lg text-dim">→</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-dim">To</span>
            <span className="font-sans text-sm font-semibold text-primary">{FG_LABELS[correct.to]}</span>
          </div>
        </div>

        <p className="font-sans text-xs text-secondary">Choose the correct reagent(s) for this one-step conversion:</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isSelected = selected === opt
          const isCorrectOpt = opt === correct.reagents
          let borderColor = 'rgba(var(--overlay),0.15)'
          let bg = 'rgb(var(--color-raised))'
          if (selected !== null) {
            if (isCorrectOpt) { borderColor = 'rgb(var(--color-success))'; bg = 'rgb(var(--color-success-bg) / 0.06)' }
            else if (isSelected) { borderColor = 'rgb(var(--color-error))'; bg = 'rgb(var(--color-error-bg) / 0.06)' }
          } else {
            // hover state hint
          }
          return (
            <button key={i}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
              className="text-left px-4 py-3 rounded-sm border font-mono text-xs text-primary transition-colors"
              style={{ borderColor, background: bg }}>
              {opt}{selected !== null && isCorrectOpt && (
                <span className="ml-2 text-success">✓</span>
              )}
              {isSelected && !isCorrectOpt && (
                <span className="ml-2 text-error">✗</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Notes after selection */}
      {selected && correct.notes && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-sm border border-border px-4 py-3"
          style={{ background: 'rgb(var(--color-raised))' }}>
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Notes</span>
          <p className="font-sans text-xs text-primary">{correct.notes}</p>
        </motion.div>
      )}

      {/* Next */}
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={next}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

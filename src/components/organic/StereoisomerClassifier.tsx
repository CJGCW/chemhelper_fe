import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Relationship = 'Enantiomers' | 'Diastereomers' | 'Meso compound' | 'Identical'

interface Problem {
  molA: string
  molB: string
  relationship: Relationship
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    molA: '(R)-2-bromobutane',
    molB: '(S)-2-bromobutane',
    relationship: 'Enantiomers',
    explanation: 'Same connectivity, opposite configuration at the only stereocenter (C2). Non-superimposable mirror images = enantiomers.',
  },
  {
    molA: '(2R,3R)-2,3-dibromobutane',
    molB: '(2S,3S)-2,3-dibromobutane',
    relationship: 'Enantiomers',
    explanation: 'Both stereocenters are inverted (R,R → S,S) — this is the mirror image relationship = enantiomers.',
  },
  {
    molA: '(2R,3R)-2,3-dibromobutane',
    molB: '(2R,3S)-2,3-dibromobutane',
    relationship: 'Diastereomers',
    explanation: 'They have the same formula and connectivity but differ at C3 (R vs S) while C2 is the same (R). Different configuration at SOME (not all) stereocenters = diastereomers.',
  },
  {
    molA: '(2R,3S)-2,3-dibromobutane',
    molB: '(2S,3R)-2,3-dibromobutane',
    relationship: 'Meso compound',
    explanation: 'Wait — (2R,3S) and (2S,3R) are both descriptions of the same meso compound (it has an internal plane of symmetry). Comparing the meso compound to itself: identical. But comparing (2R,3R) to (2R,3S): they are diastereomers.',
  },
  {
    molA: '(2R,3R)-tartaric acid',
    molB: '(2S,3S)-tartaric acid',
    relationship: 'Enantiomers',
    explanation: 'Mirror images with all stereocenters inverted (R,R → S,S). Same physical properties except opposite optical rotation.',
  },
  {
    molA: '(2R,3S)-tartaric acid (meso)',
    molB: 'its mirror image',
    relationship: 'Identical',
    explanation: 'The meso compound is superimposable on its mirror image due to its internal plane of symmetry. The "mirror image" is identical to the original.',
  },
  {
    molA: '(R)-CHFClBr',
    molB: '(S)-CHFClBr',
    relationship: 'Enantiomers',
    explanation: 'Opposite configuration at the only stereocenter. Classic enantiomers.',
  },
  {
    molA: '(1R,2S)-1-bromo-2-methylcyclohexane',
    molB: '(1S,2R)-1-bromo-2-methylcyclohexane',
    relationship: 'Enantiomers',
    explanation: 'All stereocenters inverted (cis-isomer pair that are mirror images of each other) = enantiomers.',
  },
  {
    molA: '(1R,2R)-1-bromo-2-methylcyclohexane',
    molB: '(1R,2S)-1-bromo-2-methylcyclohexane',
    relationship: 'Diastereomers',
    explanation: 'C1 is R in both, but C2 differs (R vs S). They have the same connectivity and formula, different stereochemistry at one center = diastereomers. The cis/trans pair in a ring are always diastereomers.',
  },
]

const OPTIONS: Relationship[] = ['Enantiomers', 'Diastereomers', 'Meso compound', 'Identical']

function randomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function StereoisomerClassifier({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<Problem>(randomProblem)
  const [selected, setSelected] = useState<Relationship | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function handleSelect(opt: Relationship) {
    if (selected !== null) return
    setSelected(opt)
    setScore(s => ({ correct: s.correct + (opt === problem.relationship ? 1 : 0), total: s.total + 1 }))
  }

  function nextProblem() {
    let next: Problem
    do { next = randomProblem() } while (next.molA === problem.molA && PROBLEMS.length > 1)
    setProblem(next)
    setSelected(null)
  }

  const checked = selected !== null
  const correct = selected === problem.relationship

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-2 text-sm font-sans text-secondary p-3 rounded-sm border border-border bg-surface">
        <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Quick Reference</p>
        <p><span className="text-primary font-semibold">Enantiomers:</span> All stereocenters inverted — non-superimposable mirror images</p>
        <p><span className="text-primary font-semibold">Diastereomers:</span> Some (not all) stereocenters differ — NOT mirror images</p>
        <p><span className="text-primary font-semibold">Meso:</span> Has stereocenters but is achiral (internal mirror plane) — superimposable on mirror image</p>
        <p><span className="text-primary font-semibold">Identical:</span> Same compound — superimposable in all respects</p>
      </div>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span><span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.molA + problem.molB}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-4">
          <p className="font-mono text-xs text-dim uppercase tracking-wider">What is the relationship between these two compounds?</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-sm border border-border bg-surface">
              <p className="font-mono text-[10px] text-dim mb-1">Compound A</p>
              <p className="font-sans text-sm text-primary">{problem.molA}</p>
            </div>
            <div className="p-3 rounded-sm border border-border bg-surface">
              <p className="font-mono text-[10px] text-dim mb-1">Compound B</p>
              <p className="font-sans text-sm text-primary">{problem.molB}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {OPTIONS.map(opt => {
              const isSelected = selected === opt
              const isCorrect = opt === problem.relationship
              let style = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && isCorrect) style = 'border-emerald-700/70 bg-emerald-950/25 text-emerald-400'
              if (checked && isSelected && !isCorrect) style = 'border-rose-700/70 bg-rose-950/25 text-rose-400'
              return (
                <button key={opt} disabled={checked} onClick={() => handleSelect(opt)}
                  className={`text-left px-3 py-2.5 rounded-sm border font-sans text-sm transition-colors ${style}`}>
                  {opt}
                </button>
              )
            })}
          </div>

          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-sm border text-sm font-sans ${correct ? 'border-emerald-700/50 bg-emerald-950/20 text-emerald-300' : 'border-rose-700/50 bg-rose-950/20 text-rose-300'}`}>
              <span className="font-semibold">{correct ? 'Correct. ' : `Incorrect — the answer is ${problem.relationship}. `}</span>
              {problem.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {checked && (
        <button onClick={nextProblem}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Next Problem →
        </button>
      )}
    </div>
  )
}

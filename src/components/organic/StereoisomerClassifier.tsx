import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'

type Relationship = 'Enantiomers' | 'Diastereomers' | 'Meso compound' | 'Identical'

interface Compound {
  label: string
  smiles: string
}

interface Problem {
  molA: Compound
  molB: Compound
  relationship: Relationship
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    molA: { label: '(R)-2-bromobutane', smiles: 'CC[C@H](Br)C' },
    molB: { label: '(S)-2-bromobutane', smiles: 'CC[C@@H](Br)C' },
    relationship: 'Enantiomers',
    explanation: 'Same connectivity, opposite configuration at the only stereocenter (C2). Non-superimposable mirror images = enantiomers.',
  },
  {
    molA: { label: '(2R,3R)-2,3-dibromobutane', smiles: 'C[C@H](Br)[C@H](Br)C' },
    molB: { label: '(2S,3S)-2,3-dibromobutane', smiles: 'C[C@@H](Br)[C@@H](Br)C' },
    relationship: 'Enantiomers',
    explanation: 'Both stereocenters are inverted (R,R → S,S) — this is the mirror image relationship = enantiomers.',
  },
  {
    molA: { label: '(2R,3R)-2,3-dibromobutane', smiles: 'C[C@H](Br)[C@H](Br)C' },
    molB: { label: '(2R,3S)-2,3-dibromobutane', smiles: 'C[C@H](Br)[C@@H](Br)C' },
    relationship: 'Diastereomers',
    explanation: 'They have the same formula and connectivity but differ at C3 (R vs S) while C2 is the same (R). Different configuration at SOME (not all) stereocenters = diastereomers.',
  },
  {
    molA: { label: '(2R,3S)-2,3-dibromobutane (meso)', smiles: 'C[C@H](Br)[C@@H](Br)C' },
    molB: { label: '(2S,3R)-2,3-dibromobutane (meso)', smiles: 'C[C@@H](Br)[C@H](Br)C' },
    relationship: 'Identical',
    explanation: '(2R,3S) and (2S,3R) are both descriptions of the same meso compound — it has an internal plane of symmetry. The two structures are superimposable = identical.',
  },
  {
    molA: { label: '(2R,3R)-tartaric acid', smiles: 'OC(=O)[C@H](O)[C@H](O)C(=O)O' },
    molB: { label: '(2S,3S)-tartaric acid', smiles: 'OC(=O)[C@@H](O)[C@@H](O)C(=O)O' },
    relationship: 'Enantiomers',
    explanation: 'Mirror images with all stereocenters inverted (R,R → S,S). Same physical properties except opposite optical rotation.',
  },
  {
    molA: { label: 'meso-tartaric acid', smiles: 'OC(=O)[C@H](O)[C@@H](O)C(=O)O' },
    molB: { label: 'meso-tartaric acid (mirror image)', smiles: 'OC(=O)[C@@H](O)[C@H](O)C(=O)O' },
    relationship: 'Identical',
    explanation: 'The meso compound is superimposable on its mirror image due to its internal plane of symmetry. The "mirror image" is identical to the original.',
  },
  {
    molA: { label: '(R)-CHFClBr', smiles: '[C@H](F)(Cl)Br' },
    molB: { label: '(S)-CHFClBr', smiles: '[C@@H](F)(Cl)Br' },
    relationship: 'Enantiomers',
    explanation: 'Opposite configuration at the only stereocenter. Classic enantiomers.',
  },
  {
    molA: { label: '(1R,2S)-1-bromo-2-methylcyclohexane', smiles: 'C[C@H]1CCCC[C@@H]1Br' },
    molB: { label: '(1S,2R)-1-bromo-2-methylcyclohexane', smiles: 'C[C@@H]1CCCC[C@H]1Br' },
    relationship: 'Enantiomers',
    explanation: 'All stereocenters inverted (cis-isomer pair that are mirror images of each other) = enantiomers.',
  },
  {
    molA: { label: '(1R,2R)-1-bromo-2-methylcyclohexane', smiles: 'C[C@H]1CCCC[C@H]1Br' },
    molB: { label: '(1R,2S)-1-bromo-2-methylcyclohexane', smiles: 'C[C@H]1CCCC[C@@H]1Br' },
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
    do { next = randomProblem() } while (next.molA.label === problem.molA.label && PROBLEMS.length > 1)
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
        <motion.div key={problem.molA.label + problem.molB.label}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-4">
          <p className="font-mono text-xs text-dim uppercase tracking-wider">What is the relationship between these two compounds?</p>
          <div className="grid grid-cols-2 gap-3">
            {([problem.molA, problem.molB] as const).map((mol, idx) => (
              <div key={idx} className="p-3 rounded-sm border border-border bg-surface flex flex-col items-center gap-2">
                <p className="font-mono text-[10px] text-dim self-start">Compound {idx === 0 ? 'A' : 'B'}</p>
                <CompoundDisplay smiles={mol.smiles} label={mol.label} width={180} height={150} />
              </div>
            ))}
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
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Next Problem →
        </button>
      )}
    </div>
  )
}

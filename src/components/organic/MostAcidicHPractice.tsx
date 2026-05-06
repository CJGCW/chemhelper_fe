import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'

interface Option {
  label: string
  pka: string
  smiles: string
}

interface Problem {
  question: string
  optionA: Option
  optionB: Option
  correctAnswer: 'A' | 'B'
  explanation: string
  factor: string
}

const POOL: Problem[] = [
  {
    question: 'Which compound has the more acidic O–H proton?',
    optionA: { label: 'Ethanol', smiles: 'CCO', pka: '16' },
    optionB: { label: 'Acetic acid', smiles: 'CC(=O)O', pka: '4.8' },
    correctAnswer: 'B',
    factor: 'Resonance',
    explanation: 'Acetic acid (pKₐ 4.8) is far more acidic than ethanol (pKₐ 16). The carboxylate anion RCOO⁻ is stabilized by resonance — the negative charge is delocalized over two oxygens. The ethoxide anion RO⁻ has the charge localized on one oxygen.',
  },
  {
    question: 'Which compound has the more acidic C–H proton?',
    optionA: { label: 'Propane (sp³ C–H)', smiles: 'CCC', pka: '~50' },
    optionB: { label: 'Propyne (terminal alkyne C–H)', smiles: 'CC#C', pka: '~25' },
    correctAnswer: 'B',
    factor: 'Hybridization (s-character)',
    explanation: 'The terminal alkyne C–H (pKₐ ~25) is much more acidic than an alkane C–H (pKₐ ~50). The sp-hybridized carbon has 50% s-character vs 25% for sp³. Higher s-character means the electrons in the C–C≡ bond are held closer to the nucleus, stabilizing the acetylide anion RC≡C⁻.',
  },
  {
    question: 'Which compound is a stronger acid?',
    optionA: { label: 'Chloroacetic acid', smiles: 'ClCC(=O)O', pka: '2.9' },
    optionB: { label: 'Acetic acid', smiles: 'CC(=O)O', pka: '4.8' },
    correctAnswer: 'A',
    factor: 'Inductive effect',
    explanation: 'Chloroacetic acid (pKₐ 2.9) is stronger than acetic acid (pKₐ 4.8). The electronegative Cl atom withdraws electron density inductively from the carboxylate anion, stabilizing the negative charge. This is an inductive electron-withdrawing effect.',
  },
  {
    question: 'Which is more acidic?',
    optionA: { label: 'Ethanol', smiles: 'CCO', pka: '16' },
    optionB: { label: 'Phenol', smiles: 'Oc1ccccc1', pka: '10' },
    correctAnswer: 'B',
    factor: 'Resonance',
    explanation: 'Phenol (pKₐ 10) is more acidic than ethanol (pKₐ 16). The phenoxide ion PhO⁻ is resonance-stabilized — the negative charge is delocalized into the aromatic ring (four resonance contributors). Ethoxide RO⁻ has the charge localized on one oxygen.',
  },
  {
    question: 'Which proton is more acidic?',
    optionA: { label: 'Ammonia N–H', smiles: 'N', pka: '36' },
    optionB: { label: 'Water O–H', smiles: 'O', pka: '15.7' },
    correctAnswer: 'B',
    factor: 'Electronegativity (across period)',
    explanation: 'Water (pKₐ 15.7) is more acidic than ammonia (pKₐ 36). Both are in the same row (period 2). Oxygen (EN = 3.44) is more electronegative than nitrogen (EN = 3.04), so OH⁻ is more stable than NH₂⁻. Greater electronegativity = better charge stabilization.',
  },
  {
    question: 'Which is the stronger acid in water?',
    optionA: { label: 'HF', smiles: 'F', pka: '3.2' },
    optionB: { label: 'HI', smiles: 'I', pka: '~−10' },
    correctAnswer: 'B',
    factor: 'Atomic size (down group)',
    explanation: 'HI (pKₐ ≈ −10) is a much stronger acid than HF (pKₐ 3.2), even though F is more electronegative. I⁻ is a much larger ion — the negative charge is spread over a much larger volume, making it far more stable. Size beats electronegativity when comparing acids within the same group.',
  },
  {
    question: 'Which α–H is more acidic?',
    optionA: { label: 'Ethyl acetate α–H', smiles: 'CCOC(C)=O', pka: '~25' },
    optionB: { label: 'Ethyl acetoacetate α–H (β-keto ester)', smiles: 'CCOC(=O)CC(C)=O', pka: '~11' },
    correctAnswer: 'B',
    factor: 'Double resonance stabilization',
    explanation: 'The β-keto ester α–H (pKₐ ~11) is much more acidic than a simple ester α–H (pKₐ ~25). Removing the α–H of ethyl acetoacetate gives an enolate stabilized by TWO carbonyl groups simultaneously — both the ketone and the ester can delocalize the negative charge through resonance.',
  },
  {
    question: 'Which compound is more acidic?',
    optionA: { label: 'Acetone α–H (simple ketone)', smiles: 'CC(C)=O', pka: '~20' },
    optionB: { label: 'Acetylacetone α–H (1,3-diketone)', smiles: 'CC(=O)CC(C)=O', pka: '~9' },
    correctAnswer: 'B',
    factor: 'Double resonance stabilization',
    explanation: 'Acetylacetone (pKₐ ~9) is more acidic than acetone (pKₐ ~20). The enolate of acetylacetone is stabilized by resonance with BOTH flanking ketones, distributing the charge over more of the molecule. This is the same principle as β-keto esters.',
  },
  {
    question: 'Which alcohol is more acidic?',
    optionA: { label: 'Trifluoroethanol', smiles: 'OCC(F)(F)F', pka: '12.4' },
    optionB: { label: 'Ethanol', smiles: 'CCO', pka: '16' },
    correctAnswer: 'A',
    factor: 'Inductive effect',
    explanation: 'Trifluoroethanol (pKₐ 12.4) is much more acidic than ethanol (pKₐ 16). Three electronegative F atoms withdraw electron density inductively through the C–C bond, partially stabilizing the negative charge on the alkoxide oxygen. This shows that even through σ bonds, EWGs raise acidity.',
  },
  {
    question: 'Which C–H is more acidic?',
    optionA: { label: 'Propene vinyl C–H (sp²)', smiles: 'CC=C', pka: '~44' },
    optionB: { label: 'Propyne terminal C–H (sp)', smiles: 'CC#C', pka: '~25' },
    correctAnswer: 'B',
    factor: 'Hybridization (s-character)',
    explanation: 'The terminal alkyne C–H (pKₐ ~25) is more acidic than the vinyl C–H (pKₐ ~44). sp has 50% s-character vs 33% for sp². The sp carbon holds the electrons from the C–H bond closer to the nucleus when the proton is removed, giving a more stable acetylide anion.',
  },
]

function randomProblem(): Problem {
  return POOL[Math.floor(Math.random() * POOL.length)]
}

interface Props { allowCustom?: boolean }

export default function MostAcidicHPractice({ allowCustom: _allowCustom = true }: Props) {
  const [problem, setProblem] = useState<Problem>(randomProblem)
  const [selected, setSelected] = useState<'A' | 'B' | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [stepsOpen, setStepsOpen] = useState(false)

  const correct = selected === problem.correctAnswer

  function handleCheck() {
    if (!selected || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (selected === problem.correctAnswer ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(randomProblem())
    setSelected(null)
    setChecked(false)
    setStepsOpen(false)
  }

  const optA = problem.optionA
  const optB = problem.optionB

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      <div className="rounded-sm border border-border p-4 flex flex-col gap-3" style={{ background: 'rgb(var(--color-raised))' }}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: 'rgb(var(--color-surface))' }}>pKₐ &amp; Acidity</span>
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: 'rgb(var(--color-surface))' }}>{problem.factor}</span>
        </div>
        <p className="font-sans text-sm text-primary font-medium">{problem.question}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['A', 'B'] as const).map(opt => {
          const data = opt === 'A' ? optA : optB
          const isSelected = selected === opt
          const isCorrect = opt === problem.correctAnswer
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          if (checked) {
            if (isCorrect) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.06)' }
            else if (isSelected && !isCorrect) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.06)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'
            bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))'
          }
          return (
            <button key={opt} onClick={() => !checked && setSelected(opt)}
              disabled={checked}
              className="flex flex-col items-center gap-2 p-4 rounded-sm border text-left transition-colors"
              style={{ borderColor, background: bg }}>
              <div className="flex items-center gap-2 self-start">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: isSelected ? 'color-mix(in srgb, var(--c-halogen) 20%, transparent)' : 'rgb(var(--color-surface))',
                           color: isSelected ? 'var(--c-halogen)' : 'rgb(var(--overlay)/0.5)' }}>{opt}</span>
                <span className="font-sans text-sm font-medium text-primary">{data.label}</span>
              </div>
              <CompoundDisplay smiles={data.smiles} label={data.label} width={160} height={120} />
              {checked && (
                <span className="font-mono text-xs text-secondary self-start">pKₐ ≈ {data.pka}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={!selected}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium transition-colors disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Check Answer
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium transition-colors"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Next Problem
          </button>
        )}
        {checked && (
          <button onClick={() => setStepsOpen(o => !o)}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border border-border text-secondary hover:text-primary transition-colors">
            {stepsOpen ? 'Hide' : 'Explanation'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-2.5 font-sans text-sm font-semibold ${correct ? 'text-success border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            {correct ? '✓ Correct!' : `✗ Incorrect — ${problem.correctAnswer === 'A' ? optA.label : optB.label} (pKₐ ${problem.correctAnswer === 'A' ? optA.pka : optB.pka}) is more acidic.`}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checked && stepsOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-2">Explanation</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

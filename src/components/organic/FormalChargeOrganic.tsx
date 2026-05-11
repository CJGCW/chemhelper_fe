import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'

interface FCProblem {
  species: string
  formula: string
  smiles?: string
  targetAtom: string
  valence: number
  lonePairs: number     // lone pair electrons (count)
  bonds: number         // number of bonds (each counts as 1 regardless of order)
  correct: number       // FC = valence - lonePairs - bonds
  explanation: string
}

function calcFC(valence: number, lonePairs: number, bonds: number) {
  return valence - lonePairs - bonds
}

const PROBLEMS: FCProblem[] = [
  {
    species: 'Carbocation', formula: 'R₃C⁺', smiles: '[CH+](C)(C)C', targetAtom: 'carbon (sp²)',
    valence: 4, lonePairs: 0, bonds: 3,
    correct: calcFC(4, 0, 3),
    explanation: 'Carbon has 4 valence electrons. In R₃C⁺, C has 3 bonds and no lone pairs. FC = 4 − 0 − 3 = +1. This gives the observed positive charge on the carbocation.',
  },
  {
    species: 'Carbanion', formula: 'R₃C⁻', smiles: '[CH-](C)(C)C', targetAtom: 'carbon (with lone pair)',
    valence: 4, lonePairs: 2, bonds: 3,
    correct: calcFC(4, 2, 3),
    explanation: 'Carbon has 4 valence electrons. In R₃C⁻, C has 3 bonds and 1 lone pair (2 electrons). FC = 4 − 2 − 3 = −1. This gives the observed negative charge.',
  },
  {
    species: 'Water', formula: 'H₂O', smiles: 'O', targetAtom: 'oxygen',
    valence: 6, lonePairs: 4, bonds: 2,
    correct: calcFC(6, 4, 2),
    explanation: 'Oxygen has 6 valence electrons. In H₂O, O has 2 bonds and 2 lone pairs (4 electrons). FC = 6 − 4 − 2 = 0. Water oxygen has no formal charge.',
  },
  {
    species: 'Oxocarbenium ion', formula: 'R₂C=O⁺R′', smiles: 'C[O+]=C(C)C', targetAtom: 'oxygen (one lone pair)',
    valence: 6, lonePairs: 2, bonds: 3,
    correct: calcFC(6, 2, 3),
    explanation: 'In the oxocarbenium ion R₂C=O⁺R, the O has one double bond + one single bond = 3 bonds, and one lone pair (2 electrons). FC = 6 − 2 − 3 = +1.',
  },
  {
    species: 'Carboxylate anion (one resonance form)', formula: 'RCOO⁻ (C=O side)', smiles: 'CC(=O)[O-]', targetAtom: 'singly-bonded oxygen (O⁻)',
    valence: 6, lonePairs: 6, bonds: 1,
    correct: calcFC(6, 6, 1),
    explanation: 'In the O⁻ resonance form of carboxylate, the anionic O has 3 lone pairs (6 electrons) and 1 single bond. FC = 6 − 6 − 1 = −1. The other O (C=O) has FC = 6 − 4 − 2 = 0.',
  },
  {
    species: 'Ammonium ion', formula: 'NH₄⁺', smiles: '[NH4+]', targetAtom: 'nitrogen',
    valence: 5, lonePairs: 0, bonds: 4,
    correct: calcFC(5, 0, 4),
    explanation: 'In NH₄⁺, N has 4 bonds to H and no lone pairs. FC = 5 − 0 − 4 = +1. Protonation of NH₃ uses the lone pair to form a fourth N–H bond, giving the +1 charge.',
  },
  {
    species: 'Nitro group (–NO₂)', formula: 'R–N⁺(=O)(O⁻)', smiles: 'C[N+](=O)[O-]', targetAtom: 'nitrogen',
    valence: 5, lonePairs: 0, bonds: 4,
    correct: calcFC(5, 0, 4),
    explanation: 'In the nitro group, N forms a double bond to one O and single bond to the other, plus a bond to R. N has 4 bonds total and no lone pairs. FC = 5 − 0 − 4 = +1.',
  },
  {
    species: 'Acylium ion', formula: 'RC≡O⁺', smiles: 'CC#[O+]', targetAtom: 'oxygen',
    valence: 6, lonePairs: 2, bonds: 3,
    correct: calcFC(6, 2, 3),
    explanation: 'In the acylium ion RC≡O⁺, O has a triple bond (counts as 3 bonds when counting σ+π? No — for FC, count bonds = number of bonds, not bond order. The triple bond counts as 3. O also has 1 lone pair (2 electrons). FC = 6 − 2 − 3 = +1. This gives the ⁺ on O.',
  },
  {
    species: 'Enolate (C-form)', formula: '⁻CH₂–C(=O)–R', smiles: '[CH2-]C(=O)C', targetAtom: 'α-carbon (C⁻)',
    valence: 4, lonePairs: 2, bonds: 3,
    correct: calcFC(4, 2, 3),
    explanation: 'In the C-form of an enolate, the α-carbon has a lone pair (2 electrons) and 3 bonds. FC = 4 − 2 − 3 = −1. This is the reactive carbon that attacks electrophiles in alkylation.',
  },
  {
    species: 'Diazonium ion', formula: 'ArN₂⁺', smiles: '[N+]#Nc1ccccc1', targetAtom: 'terminal nitrogen (≡N)',
    valence: 5, lonePairs: 2, bonds: 3,
    correct: calcFC(5, 2, 3),
    explanation: 'In ArN₂⁺, the terminal N has a triple bond (counting as 3 bonds) and 1 lone pair (2 electrons). FC = 5 − 2 − 3 = 0. The positive charge is on the internal nitrogen (bonded to Ar and N), which has FC = 5 − 0 − 4 = +1.',
  },
]

function pickRandom(): FCProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function FormalChargeOrganic({ allowCustom: _allowCustom = true }: Props) {
  const [problem, setProblem] = useState<FCProblem>(pickRandom)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const parsed = parseInt(answer, 10)
  const isValid = !isNaN(parsed)
  const correct = isValid && parsed === problem.correct

  function handleCheck() {
    if (!isValid || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setAnswer('')
    setChecked(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'rgb(var(--color-success))' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Structure */}
      <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">{problem.species}</span>
        {problem.smiles
          ? <CompoundDisplay smiles={problem.smiles} label={problem.formula} width={200} height={150} />
          : <span className="font-mono text-xl text-primary">{problem.formula}</span>
        }
        <p className="font-sans text-sm text-primary font-medium mt-1">
          What is the formal charge on the <strong>{problem.targetAtom}</strong>?
        </p>
      </div>

      {/* Formula reminder */}
      <div className="rounded-sm border border-border p-3 flex flex-col gap-1" style={{ background: 'rgb(var(--color-surface))' }}>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Formal Charge Formula</p>
        <p className="font-sans text-xs text-secondary">
          FC = (valence e⁻) − (lone pair e⁻) − (# bonds)
        </p>
        {!checked && (
          <div className="flex gap-4 mt-1 text-xs font-mono text-dim">
            <span>Valence e⁻: {problem.valence}</span>
            <span>Lone pair e⁻: {problem.lonePairs}</span>
            <span>Bonds: {problem.bonds}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3">
        <label className="font-sans text-sm text-secondary">FC =</label>
        <input
          type="text"
          inputMode="numeric"
          value={answer}
          onChange={e => !checked && setAnswer(e.target.value)}
          disabled={checked}
          placeholder="e.g. +1, -1, 0"
          className="w-24 px-3 py-1.5 rounded-sm border border-border font-mono text-sm text-primary bg-surface focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={!isValid}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Next
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-3 flex flex-col gap-1.5 ${correct ? 'feedback-success' : 'feedback-error'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-success' : 'text-error'}`}>
              {correct ? `✓ Correct! FC = ${problem.correct > 0 ? '+' : ''}${problem.correct}` : `✗ FC = ${problem.correct > 0 ? '+' : ''}${problem.correct}`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

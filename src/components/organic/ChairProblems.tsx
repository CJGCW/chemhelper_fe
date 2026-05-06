import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChairConformationInline from './ChairConformationInline'
import type { ChairPosition } from './ChairConformationInline'

interface ChairSpec {
  positions: ChairPosition[]
  flipped?: boolean
}

interface Problem {
  question: string
  chair: ChairSpec
  options: string[]
  answer: string
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    question: 'Trans-1-tBu-4-methylcyclohexane. The tBu group locks the ring with tBu equatorial. Where is the CH₃ group in this conformer?',
    chair: {
      positions: [
        { ringC: 1, bond: 'equatorial', substituent: 'tBu' },
        { ringC: 4, bond: 'axial', substituent: 'CH₃' },
      ],
    },
    options: [
      'Axial — trans relationship forces CH₃ axial when tBu is equatorial',
      'Equatorial — both can be equatorial in trans configuration',
      'tBu cannot lock this ring if trans',
      'CH₃ and tBu are on the same face so both must be equatorial',
    ],
    answer: 'Axial — trans relationship forces CH₃ axial when tBu is equatorial',
    explanation: 'In trans-1,4-disubstituted cyclohexane, C1 equatorial and C4 axial (or vice versa). Since tBu locks equatorial at C1, the trans CH₃ at C4 must be axial. The total 1,3-diaxial strain from CH₃ axial is 7.6 kJ/mol — still worth it to keep tBu equatorial (22.8 kJ/mol).',
  },
  {
    question: 'Cis-1,2-dimethylcyclohexane has two possible chairs. In the more stable one, which positions do the methyls occupy?',
    chair: {
      positions: [
        { ringC: 1, bond: 'equatorial', substituent: 'CH₃' },
        { ringC: 2, bond: 'axial', substituent: 'CH₃' },
      ],
    },
    options: [
      'One equatorial, one axial (both chairs are equivalent — equal stability)',
      'Both equatorial (diequatorial conformer dominates)',
      'Both axial (diaxial is preferred for cis)',
      'One equatorial, one axial — but one chair has e/a and the other a/e: they are not equivalent',
    ],
    answer: 'One equatorial, one axial (both chairs are equivalent — equal stability)',
    explanation: 'In cis-1,2-dimethylcyclohexane, neither chair can have both methyls equatorial. The two chairs are mirror images: one has C1-eq/C2-ax and the other C1-ax/C2-eq. Both have the same energy. This compound does NOT have a dominant conformer — unlike trans-1,2-dimethylcyclohexane which has a diequatorial minimum.',
  },
  {
    question: 'The chair shown has an axial CH₃ on C1 and an axial Cl on C3. What is the approximate total 1,3-diaxial interaction energy?',
    chair: {
      positions: [
        { ringC: 1, bond: 'axial', substituent: 'CH₃' },
        { ringC: 3, bond: 'axial', substituent: 'Cl' },
      ],
    },
    options: [
      '~9.6 kJ/mol total (7.6 + 2.0)',
      '~5.6 kJ/mol total (7.6 − 2.0)',
      '~15.2 kJ/mol total (7.6 × 2)',
      '~4.0 kJ/mol total (2.0 × 2)',
    ],
    answer: '~9.6 kJ/mol total (7.6 + 2.0)',
    explanation: 'Each axial substituent has A-value interactions with axial H atoms on both sides (C3 and C5 for a substituent on C1). The total destabilization of the axial conformer relative to equatorial is approximately ΣA-values = 7.6 (CH₃) + 2.0 (Cl) = 9.6 kJ/mol.',
  },
  {
    question: 'Trans-1,3-dimethylcyclohexane: in the lower-energy chair, what positions do the methyls occupy?',
    chair: {
      positions: [
        { ringC: 1, bond: 'axial', substituent: 'CH₃' },
        { ringC: 3, bond: 'axial', substituent: 'CH₃' },
      ],
    },
    options: [
      'Both axial — trans 1,3 means one is axial and the other is also axial in the same face',
      'Both equatorial — trans 1,3 allows diequatorial',
      'One equatorial, one axial (must always be mixed)',
      'Cannot be in the same chair — they must be in different conformers',
    ],
    answer: 'Both equatorial — trans 1,3 allows diequatorial',
    explanation: 'In trans-1,3-disubstituted cyclohexane, the two groups are on opposite faces of the ring. The preferred chair places both methyls equatorial (diequatorial). In the less stable chair (shown), both are axial — note the large 1,3-diaxial strain of 2 × 7.6 = 15.2 kJ/mol.',
  },
  {
    question: 'The chair shown has a Ph group (A-value 12.4 kJ/mol) axially placed. The other conformer has Ph equatorial. Estimate the Keq for the equatorial conformer at 25°C.',
    chair: { positions: [{ ringC: 3, bond: 'axial', substituent: 'Ph' }] },
    options: [
      '~150 (>99% equatorial)',
      '~2 (two-thirds equatorial)',
      '~1 (equal mixture)',
      '~0.007 (mostly axial)',
    ],
    answer: '~150 (>99% equatorial)',
    explanation: 'ΔG° = −12.4 kJ/mol (equatorial is lower). At 25°C, RT = 2.479 kJ/mol. Keq = exp(12.4/2.479) = exp(5.00) ≈ 150. The equatorial conformer represents 150/(1+150) ≈ 99.3% of the population. Ph essentially locks the chair.',
  },
  {
    question: 'For the diaxial chair shown (both substituents axial), what is the stereochemical relationship between the C1 and C3 substituents?',
    chair: {
      positions: [
        { ringC: 1, bond: 'axial', substituent: 'OH' },
        { ringC: 3, bond: 'axial', substituent: 'OH' },
      ],
    },
    options: [
      'cis — both are on the same face of the ring',
      'trans — they are on opposite faces',
      'The relationship cannot be determined from a chair diagram',
      'geminal — both are on the same carbon',
    ],
    answer: 'cis — both are on the same face of the ring',
    explanation: 'Axial bonds on alternating carbons (C1 and C3) point in the same direction (both up or both down). When two substituents are both axial in the same chair, they are on the same face of the ring — that is the cis relationship.',
  },
]

function randomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function ChairProblems({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<Problem>(randomProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function handleSelect(option: string) {
    if (selected !== null) return
    setSelected(option)
    setScore(s => ({ correct: s.correct + (option === problem.answer ? 1 : 0), total: s.total + 1 }))
  }

  function nextProblem() {
    let next: Problem
    do { next = randomProblem() } while (next.question === problem.question && PROBLEMS.length > 1)
    setProblem(next)
    setSelected(null)
  }

  const checked = selected !== null
  const correct = selected === problem.answer

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Multi-step chair analysis: 1,3-diaxial strain, disubstituted cyclohexane stereochemistry, A-value calculations.
      </p>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-4">

          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-3">
            <div className="flex justify-center">
              <ChairConformationInline {...problem.chair} width={280} height={156} />
            </div>
            <p className="font-sans text-sm text-primary leading-relaxed">{problem.question}</p>
          </div>

          <div className="flex flex-col gap-2">
            {problem.options.map(opt => {
              const isSelected = selected === opt
              const isCorrect  = opt === problem.answer
              let style = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && isCorrect)  style = 'border-emerald-700/70 bg-emerald-950/25 text-emerald-400'
              if (checked && isSelected && !isCorrect) style = 'border-rose-700/70 bg-rose-950/25 text-rose-400'
              return (
                <button key={opt} disabled={checked}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2.5 rounded-sm border font-sans text-sm transition-colors ${style}`}>
                  {opt}
                </button>
              )
            })}
          </div>

          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-sm border text-sm font-sans ${correct ? 'border-emerald-700/50 bg-emerald-950/20 text-emerald-300' : 'border-rose-700/50 bg-rose-950/20 text-rose-300'}`}>
              <span className="font-semibold">{correct ? 'Correct. ' : 'Incorrect. '}</span>
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

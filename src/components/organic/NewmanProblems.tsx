import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NewmanProjectionInline from './NewmanProjectionInline'

interface NewmanSpec {
  front: [string, string, string]
  back: [string, string, string]
  dihedral: number
}

interface Problem {
  question: string
  newman: NewmanSpec
  options: string[]
  answer: string
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    question: 'For 2-methylbutane viewed down C2–C3, which back-carbon substituents are present at C3?',
    newman: { front: ['CH₃', 'CH₃', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 180 },
    options: [
      'CH₃, H, H — C3 has one methyl and two hydrogens',
      'CH₃, CH₃, H — C3 has two methyls and one hydrogen',
      'CH₃, CH₃, CH₃ — C3 is a quaternary carbon',
      'H, H, H — C3 has no substituents other than H',
    ],
    answer: 'CH₃, H, H — C3 has one methyl and two hydrogens',
    explanation: '2-Methylbutane is CH₃CH(CH₃)CH₂CH₃. Looking down C2–C3: front carbon (C2) has CH₃, CH₃, H; back carbon (C3) has CH₃ (leading to CH₂CH₃), H, H.',
  },
  {
    question: 'For the butane Newman projection shown, what is the energy difference between this conformation and the anti conformation?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['H', 'H', 'CH₃'], dihedral: 60 },
    options: [
      '~3.8 kJ/mol (gauche is higher in energy)',
      '~19 kJ/mol (eclipsed is higher)',
      '~12 kJ/mol (rotational barrier)',
      '0 kJ/mol (both are staggered, same energy)',
    ],
    answer: '~3.8 kJ/mol (gauche is higher in energy)',
    explanation: 'φ = 60° is the gauche conformer of butane. It is ~3.8 kJ/mol above anti due to steric repulsion between the two CH₃ groups that are 60° apart.',
  },
  {
    question: 'A Newman projection of 1,2-dichloroethane at φ = 180° shows Cl groups anti. How does this compare to gauche?',
    newman: { front: ['Cl', 'H', 'H'], back: ['Cl', 'H', 'H'], dihedral: 180 },
    options: [
      'Anti is more stable — Cl groups far apart minimizes steric repulsion',
      'Gauche is more stable due to the gauche effect from Cl–C–C–Cl hyperconjugation',
      'Both are equally stable — Cl is small',
      'Neither is stable — Cl forces the eclipsed form',
    ],
    answer: 'Anti is more stable — Cl groups far apart minimizes steric repulsion',
    explanation: 'For 1,2-dichloroethane, the anti conformation (Cl groups at 180°) is the global minimum for simple steric/electrostatic reasons. The gauche effect is real but smaller than steric preference for most systems.',
  },
  {
    question: 'The Newman projection shown has the two largest groups eclipsed. By how much is this destabilized relative to the anti conformer of butane?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 0 },
    options: [
      '~19 kJ/mol above anti',
      '~3.8 kJ/mol above anti',
      '~12 kJ/mol above anti',
      '~16 kJ/mol above anti',
    ],
    answer: '~19 kJ/mol above anti',
    explanation: 'The totally eclipsed conformation (CH₃ groups at φ = 0°) is the highest-energy conformer of butane at ~19 kJ/mol above anti. It combines CH₃–CH₃ eclipsing (highest cost) with two H–H eclipsing interactions.',
  },
  {
    question: 'In the Newman projection shown (ethane, φ = 0°), what type of strain is responsible for the energy maximum?',
    newman: { front: ['H', 'H', 'H'], back: ['H', 'H', 'H'], dihedral: 0 },
    options: [
      'Torsional (eclipsing) strain — overlap of C–H bonding orbitals with adjacent C–H antibonding orbitals',
      'Steric strain — Van der Waals repulsion between H atoms that are too close',
      'Angle strain — bond angles are compressed below 109.5°',
      'Ring strain — planar structure resists puckering',
    ],
    answer: 'Torsional (eclipsing) strain — overlap of C–H bonding orbitals with adjacent C–H antibonding orbitals',
    explanation: 'The eclipsing barrier in ethane is primarily torsional strain: the C–H bonding MO on the front carbon overlaps unfavorably with the C–H antibonding MO on the back carbon when the dihedral is 0°. This hyperconjugative destabilization is the main source (not simple steric repulsion, which is minor for small H atoms).',
  },
  {
    question: 'For the gauche conformer of butane shown, how many eclipsed C–H pairs are there (H–C–C–H torsions near 0°)?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['H', 'H', 'CH₃'], dihedral: 60 },
    options: [
      'Zero — gauche is a staggered conformation, all torsions are ~60°',
      'Two — one from each H pair',
      'One — only the C–H directly adjacent to CH₃',
      'Three — all H–C–C–H torsions are eclipsed',
    ],
    answer: 'Zero — gauche is a staggered conformation, all torsions are ~60°',
    explanation: 'Gauche is a staggered conformation (60° between bonds). Staggered means no bond pair is at 0° — all front bonds are offset 60° from back bonds. The ~3.8 kJ/mol destabilization relative to anti comes from steric interaction between the two CH₃ groups at 60°, not from eclipsing.',
  },
  {
    question: 'For n-pentane viewed down C2–C3, the back carbon (C3) has substituents CH₂CH₃, H, H. What is the most stable conformation?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₂CH₃', 'H', 'H'], dihedral: 180 },
    options: [
      'Anti — large groups (CH₃ and CH₂CH₃) maximally separated at 180°',
      'Gauche — small groups get further apart at 60°',
      'Eclipsed — maximizes hyperconjugation',
      'All conformations are equally stable for n-pentane',
    ],
    answer: 'Anti — large groups (CH₃ and CH₂CH₃) maximally separated at 180°',
    explanation: 'The anti conformation places the largest groups (CH₃ at C2 and CH₂CH₃ at C3) on opposite sides at 180°. This maximizes separation of the bulkiest groups and gives the global minimum.',
  },
]

function randomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function NewmanProblems({ allowCustom = true }: Props) {
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
        Multi-step Newman projection analysis: conformer energies, strain types, and substituent effects.
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
              <NewmanProjectionInline {...problem.newman} width={200} height={124} />
            </div>
            <p className="font-sans text-sm text-primary leading-relaxed">{problem.question}</p>
          </div>

          <div className="flex flex-col gap-2">
            {problem.options.map(opt => {
              const isSelected = selected === opt
              const isCorrect  = opt === problem.answer
              let style = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && isCorrect)  style = 'border-emerald-700/70 bg-emerald-950/25 text-success'
              if (checked && isSelected && !isCorrect) style = 'border-rose-700/70 bg-rose-950/25 text-error'
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
              className={`p-3 rounded-sm border text-sm font-sans ${correct ? 'feedback-success text-success-strong' : 'feedback-error text-error-strong'}`}>
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

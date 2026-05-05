import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Problem {
  question: string
  options: string[]
  answer: string
  explanation: string
}

const NEWMAN_PROBLEMS: Problem[] = [
  {
    question: 'A Newman projection of butane (C2–C3) is drawn with CH₃ at the top (front) and CH₃ at the bottom (back). The dihedral angle is 180°. What conformation is this?',
    options: ['Anti', 'Gauche', 'Eclipsed', 'Totally Eclipsed'],
    answer: 'Anti',
    explanation: 'φ = 180° places the two CH₃ groups on opposite sides — this is the anti conformation, the most stable for butane (0 kJ/mol relative energy).',
  },
  {
    question: 'In a Newman projection, the front and back bonds overlap perfectly (φ = 0°). The large group on the front eclipses the large group on the back. What is this conformation called?',
    options: ['Totally Eclipsed', 'Anti', 'Gauche', 'Staggered'],
    answer: 'Totally Eclipsed',
    explanation: 'φ = 0° with large groups overlapping = totally eclipsed. For butane this is the highest-energy conformation (~19 kJ/mol above anti).',
  },
  {
    question: 'Which dihedral angle gives the gauche conformation of butane?',
    options: ['φ = 60°', 'φ = 120°', 'φ = 180°', 'φ = 0°'],
    answer: 'φ = 60°',
    explanation: 'The gauche conformation occurs at φ = 60° (and 300°). It places the two CH₃ groups 60° apart, with ~3.8 kJ/mol of gauche strain.',
  },
  {
    question: 'Rank the following butane conformations from MOST to LEAST stable: anti, gauche, eclipsed (H/CH₃), totally eclipsed (CH₃/CH₃).',
    options: [
      'Anti > Gauche > Eclipsed > Totally Eclipsed',
      'Gauche > Anti > Eclipsed > Totally Eclipsed',
      'Anti > Eclipsed > Gauche > Totally Eclipsed',
      'Totally Eclipsed > Eclipsed > Gauche > Anti',
    ],
    answer: 'Anti > Gauche > Eclipsed > Totally Eclipsed',
    explanation: 'Staggered conformations are always more stable than eclipsed. Among staggered: anti (0) > gauche (3.8 kJ/mol). Among eclipsed: H/CH₃ eclipsed (16) < CH₃/CH₃ eclipsed (19 kJ/mol).',
  },
  {
    question: 'In a Newman projection of ethane, what is the energy difference between the staggered and eclipsed conformations?',
    options: ['~12 kJ/mol', '~3 kJ/mol', '~19 kJ/mol', '~50 kJ/mol'],
    answer: '~12 kJ/mol',
    explanation: 'Ethane has a rotational barrier of ~12 kJ/mol due to torsional (eclipsing) strain between H–H pairs. This is much less than butane\'s totally eclipsed barrier because H is smaller than CH₃.',
  },
]

const CHAIR_PROBLEMS: Problem[] = [
  {
    question: 'A methylcyclohexane has the CH₃ group in the axial position. Which statement is true?',
    options: [
      'The equatorial conformer is more stable by ~7.6 kJ/mol',
      'The axial conformer is more stable because axial bonds are stronger',
      'Both conformers have equal stability',
      'The equatorial conformer is more stable by ~22 kJ/mol',
    ],
    answer: 'The equatorial conformer is more stable by ~7.6 kJ/mol',
    explanation: 'The A-value for CH₃ is 7.6 kJ/mol. This is the free energy difference favoring the equatorial conformer, due to 1,3-diaxial interactions with axial H atoms in the ring.',
  },
  {
    question: 'A tert-butylcyclohexane (tBu group) undergoes ring flip. Which conformer is observed?',
    options: [
      'Overwhelmingly equatorial tBu (~100%)',
      '50% axial, 50% equatorial',
      'Overwhelmingly axial tBu',
      'Cannot ring flip due to steric bulk',
    ],
    answer: 'Overwhelmingly equatorial tBu (~100%)',
    explanation: 'The tBu group has an A-value of 22.8 kJ/mol — far too large to be axial. The equatorial conformer is so much more stable that it represents essentially 100% of the population at room temperature.',
  },
  {
    question: 'In trans-1,4-dimethylcyclohexane, both CH₃ groups are in equatorial positions. What happens after a ring flip?',
    options: [
      'Both CH₃ groups become axial',
      'One CH₃ becomes axial, one stays equatorial',
      'Both CH₃ groups remain equatorial',
      'The ring cannot flip with trans substituents',
    ],
    answer: 'Both CH₃ groups become axial',
    explanation: 'In trans-1,4-dimethylcyclohexane, both methyl groups are in equatorial positions in the more stable conformer. A ring flip converts all axial→equatorial and equatorial→axial, so both methyls become axial. The diequatorial conformer is strongly preferred.',
  },
  {
    question: 'Which relationship between substituents in a 1,2-disubstituted cyclohexane allows BOTH groups to be equatorial?',
    options: ['trans', 'cis', 'geminal', 'Neither — one must always be axial in 1,2-disubstituted'],
    answer: 'trans',
    explanation: 'In trans-1,2-disubstituted cyclohexane, the two groups can both occupy equatorial positions in the more stable chair conformer. In cis-1,2, one group is always axial.',
  },
]

const ALL_PROBLEMS = [...NEWMAN_PROBLEMS, ...CHAIR_PROBLEMS]

function randomProblem(): Problem {
  return ALL_PROBLEMS[Math.floor(Math.random() * ALL_PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function ConformationalPractice({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<Problem>(randomProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function handleSelect(option: string) {
    if (selected !== null) return
    setSelected(option)
    const correct = option === problem.answer
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function nextProblem() {
    let next: Problem
    do { next = randomProblem() } while (next.question === problem.question && ALL_PROBLEMS.length > 1)
    setProblem(next)
    setSelected(null)
  }

  const checked = selected !== null
  const correct = selected === problem.answer

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Identify conformations from Newman projections and chair diagrams. Select the best answer.
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
          <div className="p-4 rounded-sm border border-border bg-surface">
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

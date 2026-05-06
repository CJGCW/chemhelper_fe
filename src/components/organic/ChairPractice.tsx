import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ChairConformationInline from './ChairConformationInline'
import type { ChairPosition } from './ChairConformationInline'
import RenderableChoiceButton from '../shared/RenderableChoiceButton'
import type { RenderableChoice } from '../../data/mechanisms/types'

interface ChairSpec {
  positions: ChairPosition[]
  flipped?: boolean
}

interface Problem {
  question: string
  chair: ChairSpec
  choices: RenderableChoice[]
  answer: string
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    question: 'The chair shown has CH₃ in the axial position. Which statement is true?',
    chair: { positions: [{ ringC: 1, bond: 'axial', substituent: 'CH₃' }] },
    choices: [
      { label: 'The equatorial conformer is more stable by ~7.6 kJ/mol' },
      { label: 'The axial conformer is more stable because axial bonds are stronger' },
      { label: 'Both conformers have equal stability' },
      { label: 'The equatorial conformer is more stable by ~22 kJ/mol' },
    ],
    answer: 'The equatorial conformer is more stable by ~7.6 kJ/mol',
    explanation: 'The A-value for CH₃ is 7.6 kJ/mol. This is the free energy difference favoring the equatorial conformer, due to 1,3-diaxial interactions with axial H atoms in the ring.',
  },
  {
    question: 'The chair shown has a tBu group in equatorial position. After a ring flip, which conformer is observed?',
    chair: { positions: [{ ringC: 1, bond: 'equatorial', substituent: 'tBu' }] },
    choices: [
      { label: 'Overwhelmingly equatorial tBu (~100%)' },
      { label: '50% axial, 50% equatorial' },
      { label: 'Overwhelmingly axial tBu' },
      { label: 'Cannot ring flip due to steric bulk' },
    ],
    answer: 'Overwhelmingly equatorial tBu (~100%)',
    explanation: 'The tBu group has an A-value of 22.8 kJ/mol — far too large to be axial. The equatorial conformer represents essentially 100% of the population at room temperature. The ring CAN flip; it just strongly disfavors the axial product.',
  },
  {
    question: 'The chair shown has both CH₃ groups equatorial. What happens after a ring flip?',
    chair: {
      positions: [
        { ringC: 1, bond: 'equatorial', substituent: 'CH₃' },
        { ringC: 4, bond: 'equatorial', substituent: 'CH₃' },
      ],
    },
    choices: [
      { label: 'Both CH₃ groups become axial' },
      { label: 'One CH₃ becomes axial, one stays equatorial' },
      { label: 'Both CH₃ groups remain equatorial' },
      { label: 'The ring cannot flip with trans substituents' },
    ],
    answer: 'Both CH₃ groups become axial',
    explanation: 'A ring flip converts all axial→equatorial and equatorial→axial simultaneously. Both equatorial methyls become axial. The diequatorial conformer shown is strongly preferred.',
  },
  {
    question: 'The chair shown has two substituents on C1 and C2, both equatorial. What is their stereochemical relationship?',
    chair: {
      positions: [
        { ringC: 1, bond: 'equatorial', substituent: 'R' },
        { ringC: 2, bond: 'equatorial', substituent: 'R' },
      ],
    },
    choices: [
      { label: 'trans' },
      { label: 'cis' },
      { label: 'geminal' },
      { label: 'Neither — one must always be axial in 1,2-disubstituted' },
    ],
    answer: 'trans',
    explanation: 'In trans-1,2-disubstituted cyclohexane, both groups can occupy equatorial positions in the more stable chair. In cis-1,2, one group is always axial.',
  },
  {
    question: 'An OH group (A-value 2.1 kJ/mol) is axial on a cyclohexane ring. What would you observe after the ring flip?',
    chair: { positions: [{ ringC: 2, bond: 'axial', substituent: 'OH' }] },
    choices: [
      { label: 'The OH prefers equatorial — the flipped conformer dominates' },
      { label: 'The OH prefers axial — the original conformer dominates' },
      { label: 'Both conformers are equally populated (A-value is 0)' },
      { label: 'The OH cannot be axial on cyclohexane' },
    ],
    answer: 'The OH prefers equatorial — the flipped conformer dominates',
    explanation: 'Any group with a positive A-value prefers equatorial. OH has A = 2.1 kJ/mol, so the equatorial conformer is favored. After the ring flip, OH moves to equatorial — the new conformer dominates.',
  },
  {
    question: 'In the chair shown, the axial substituents on C1 and C3 are both on the same side of the ring. What kind of interaction does this create?',
    chair: {
      positions: [
        { ringC: 1, bond: 'axial', substituent: 'CH₃' },
        { ringC: 3, bond: 'axial', substituent: 'CH₃' },
      ],
    },
    choices: [
      { label: '1,3-diaxial strain' },
      { label: '1,2-diaxial strain' },
      { label: 'Flagpole interaction' },
      { label: 'Van der Waals attraction' },
    ],
    answer: '1,3-diaxial strain',
    explanation: '1,3-Diaxial strain occurs between axial substituents on alternating ring carbons (C1 and C3, C3 and C5, etc.). The substituents point toward each other in space, creating steric repulsion. This is why equatorial positions are preferred.',
  },
]

function randomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function ChairPractice({ allowCustom = true }: Props) {
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
        Identify axial/equatorial preferences, ring flip outcomes, and stereochemistry from chair diagrams.
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
            {problem.choices.map(choice => (
              <RenderableChoiceButton
                key={choice.label}
                choice={choice}
                isSelected={selected === choice.label}
                isCorrect={choice.label === problem.answer}
                isChecked={checked}
                onSelect={() => handleSelect(choice.label)}
              />
            ))}
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

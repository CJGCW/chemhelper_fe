import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NewmanProjectionInline from './NewmanProjectionInline'
import RenderableChoiceButton from '../shared/RenderableChoiceButton'
import type { RenderableChoice } from '../../data/mechanisms/types'

interface NewmanSpec {
  front: [string, string, string]
  back: [string, string, string]
  dihedral: number
}

interface Problem {
  question: string
  newman: NewmanSpec
  choices: RenderableChoice[]
  answer: string
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    question: 'What conformation is shown?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 180 },
    choices: [
      { label: 'Anti' },
      { label: 'Gauche' },
      { label: 'Eclipsed' },
      { label: 'Totally Eclipsed' },
    ],
    answer: 'Anti',
    explanation: 'φ = 180° places the two CH₃ groups on opposite sides — this is the anti conformation, the most stable for butane (0 kJ/mol relative energy).',
  },
  {
    question: 'What conformation of butane is shown? The large groups on front and back overlap perfectly.',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 0 },
    choices: [
      { label: 'Totally Eclipsed' },
      { label: 'Anti' },
      { label: 'Gauche' },
      { label: 'Staggered' },
    ],
    answer: 'Totally Eclipsed',
    explanation: 'φ = 0° with CH₃ groups overlapping = totally eclipsed. For butane this is the highest-energy conformation (~19 kJ/mol above anti).',
  },
  {
    question: 'What conformation of butane is shown?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 60 },
    choices: [
      { label: 'Gauche' },
      { label: 'Anti' },
      { label: 'Eclipsed (H/CH₃)' },
      { label: 'Totally Eclipsed' },
    ],
    answer: 'Gauche',
    explanation: 'φ = 60° places the two CH₃ groups 60° apart — gauche conformation (~3.8 kJ/mol above anti).',
  },
  {
    question: 'Rank the following butane conformations from MOST to LEAST stable: anti, gauche, eclipsed (H/CH₃), totally eclipsed (CH₃/CH₃).',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 180 },
    choices: [
      { label: 'Anti > Gauche > Eclipsed > Totally Eclipsed' },
      { label: 'Gauche > Anti > Eclipsed > Totally Eclipsed' },
      { label: 'Anti > Eclipsed > Gauche > Totally Eclipsed' },
      { label: 'Totally Eclipsed > Eclipsed > Gauche > Anti' },
    ],
    answer: 'Anti > Gauche > Eclipsed > Totally Eclipsed',
    explanation: 'Staggered conformations are always more stable than eclipsed. Among staggered: anti (0) > gauche (3.8 kJ/mol). Among eclipsed: H/CH₃ eclipsed (16) < CH₃/CH₃ eclipsed (19 kJ/mol).',
  },
  {
    question: 'The Newman projection shown is of ethane in a staggered conformation. What is the approximate rotational barrier to reach the eclipsed form?',
    newman: { front: ['H', 'H', 'H'], back: ['H', 'H', 'H'], dihedral: 60 },
    choices: [
      { label: '~12 kJ/mol' },
      { label: '~3 kJ/mol' },
      { label: '~19 kJ/mol' },
      { label: '~50 kJ/mol' },
    ],
    answer: '~12 kJ/mol',
    explanation: 'Ethane has a rotational barrier of ~12 kJ/mol due to torsional (eclipsing) strain between H–H pairs. This is much less than butane\'s totally eclipsed barrier because H is smaller than CH₃.',
  },
  {
    question: 'What dihedral angle corresponds to a gauche conformation in butane?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['H', 'CH₃', 'H'], dihedral: 60 },
    choices: [
      { label: '60°' },
      { label: '0°' },
      { label: '120°' },
      { label: '180°' },
    ],
    answer: '60°',
    explanation: 'The gauche conformation has a dihedral angle of 60° (or 300°) between the two largest groups. It is a staggered conformation but not the most stable due to steric repulsion.',
  },
  {
    question: 'In a Newman projection looking down the C2–C3 bond of butane, how many gauche conformations exist per full rotation?',
    newman: { front: ['CH₃', 'H', 'H'], back: ['CH₃', 'H', 'H'], dihedral: 60 },
    choices: [
      { label: '2' },
      { label: '1' },
      { label: '3' },
      { label: '4' },
    ],
    answer: '2',
    explanation: 'There are two gauche conformations: CH₃ at +60° and CH₃ at −60° (300°) relative to the front CH₃. Both are identical in energy by symmetry (~3.8 kJ/mol above anti).',
  },
  {
    question: 'Which conformation of propane has all H atoms staggered with respect to each other?',
    newman: { front: ['H', 'H', 'H'], back: ['H', 'H', 'H'], dihedral: 60 },
    choices: [
      { label: 'The staggered conformation (φ = 60°)' },
      { label: 'The eclipsed conformation (φ = 0°)' },
      { label: 'Both are equally stable for propane' },
      { label: 'Propane does not have staggered conformations' },
    ],
    answer: 'The staggered conformation (φ = 60°)',
    explanation: 'When neighboring H atoms are staggered (60° dihedral), torsional strain is minimized. Eclipsed (φ = 0°) brings H atoms into alignment, increasing strain.',
  },
]

function randomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function NewmanPractice({ allowCustom = true }: Props) {
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
        Identify conformations and answer questions from Newman projection diagrams.
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

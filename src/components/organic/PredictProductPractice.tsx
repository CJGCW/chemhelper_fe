import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  generatePredictProductProblem,
  checkPredictProductAnswer,
  shuffleChoices,
  type PredictProductProblem,
} from '../../utils/predictProductPractice'
import CompoundDisplay from '../shared/CompoundDisplay'
import RenderableChoiceButton from '../shared/RenderableChoiceButton'
import type { RenderableChoice } from '../../data/mechanisms/types'

interface Props { allowCustom?: boolean }

type Difficulty = 'easy' | 'medium' | 'hard' | undefined

export default function PredictProductPractice({ allowCustom = true }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>(undefined)
  const [problem, setProblem] = useState<PredictProductProblem>(() =>
    generatePredictProductProblem(undefined),
  )
  const [choices, setChoices] = useState<RenderableChoice[]>(() => shuffleChoices(problem))
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  void allowCustom

  const correct = checked && selected ? checkPredictProductAnswer(problem, selected) : false

  function nextProblem() {
    const next = generatePredictProductProblem(difficulty)
    setProblem(next)
    setChoices(shuffleChoices(next))
    setSelected(null)
    setChecked(false)
    setShowHint(false)
  }

  function handleSelect(choiceLabel: string) {
    if (checked) return
    setSelected(choiceLabel)
    const isCorrect = checkPredictProductAnswer(problem, choiceLabel)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))
  }

  function handleDifficultyChange(d: Difficulty) {
    setDifficulty(d)
    const next = generatePredictProductProblem(d)
    setProblem(next)
    setChoices(shuffleChoices(next))
    setSelected(null)
    setChecked(false)
    setShowHint(false)
  }

  const difficultyOptions: { label: string; value: Difficulty }[] = useMemo(() => [
    { label: 'All',    value: undefined },
    { label: 'Easy',   value: 'easy'    },
    { label: 'Medium', value: 'medium'  },
    { label: 'Hard',   value: 'hard'    },
  ], [])

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Given the substrate and reagent/conditions, predict the major product.
      </p>

      {/* Difficulty filter */}
      <div className="flex items-center gap-1 flex-wrap print:hidden">
        {difficultyOptions.map(opt => {
          const isActive = difficulty === opt.value
          return (
            <button
              key={String(opt.value)}
              onClick={() => handleDifficultyChange(opt.value)}
              className="relative px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="predict-product-difficulty"
                  className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={problem.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
            !checked
              ? 'border-border'
              : correct
              ? 'feedback-success'
              : 'feedback-error'
          }`}
          style={{ background: checked ? undefined : 'rgb(var(--color-surface))' }}
        >
          {/* Difficulty badge */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                background: problem.difficulty === 'hard'
                  ? 'rgb(var(--color-error-bg) / 0.12)'
                  : problem.difficulty === 'medium'
                  ? 'rgba(234,179,8,0.12)'
                  : 'rgb(var(--color-success-bg) / 0.12)',
                color: problem.difficulty === 'hard'
                  ? 'rgb(var(--color-error))'
                  : problem.difficulty === 'medium'
                  ? '#fbbf24'
                  : 'rgb(var(--color-success))',
              }}
            >
              {problem.difficulty}
            </span>
          </div>

          {/* Substrate + reagent display */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-dim uppercase tracking-wider">Substrate</p>
            {problem.substrateSmiles ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <CompoundDisplay smiles={problem.substrateSmiles} label={problem.substrate} width={180} height={140} />
                <p className="font-mono text-xs text-secondary">{problem.substrate}</p>
              </div>
            ) : (
              <p className="font-mono text-sm text-primary">{problem.substrate}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-dim uppercase tracking-wider">Reagent / Conditions</p>
            <p className="font-mono text-sm text-primary">{problem.reagent}</p>
            {problem.conditions && (
              <p className="font-sans text-xs text-secondary">{problem.conditions}</p>
            )}
          </div>

          <p className="font-sans text-sm font-medium text-secondary">What is the major product?</p>

          {/* Answer choices */}
          <div className="flex flex-col gap-2">
            {choices.map(choice => (
              <RenderableChoiceButton
                key={choice.label}
                choice={choice}
                isSelected={selected === choice.label}
                isCorrect={choice.label === problem.correctProduct.label}
                isChecked={checked}
                onSelect={() => handleSelect(choice.label)}
              />
            ))}
          </div>

          {/* Hint toggle (before submit) */}
          {!checked && (
            <button
              onClick={() => setShowHint(h => !h)}
              className="self-start font-sans text-xs text-dim hover:text-secondary transition-colors"
            >
              {showHint ? '▲ Hide hint' : '▼ Hint'}
            </button>
          )}
          {!checked && showHint && (
            <p className="font-sans text-sm text-secondary leading-relaxed bg-raised border border-border rounded-sm px-3 py-2">
              {problem.hint}
            </p>
          )}

          {/* Result + explanation */}
          {checked && (
            <div className="flex flex-col gap-2">
              <p className={`font-sans text-sm font-semibold ${correct ? 'text-success' : 'text-error'}`}>
                {correct ? '✓ Correct' : `✗ Incorrect — ${problem.correctProduct.label}`}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{problem.explanation}</p>

              {/* "View mechanism" link */}
              {problem.reactionId && (
                <Link
                  to={`/mechanisms?mode=reference&reaction=${problem.reactionId}`}
                  className="self-start font-sans text-xs underline underline-offset-2 transition-colors"
                  style={{ color: 'var(--c-halogen)' }}
                >
                  View mechanism →
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

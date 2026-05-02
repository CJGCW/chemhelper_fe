import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateKExpressionProblem } from '../../utils/equilibriumPractice'
import { buildKExpression } from '../../chem/equilibrium'

interface Props { allowCustom?: boolean }

type CheckState = 'idle' | 'correct' | 'wrong'

export default function KExpressionPractice({ allowCustom = true }: Props) {
  const [problem, setProblem]       = useState(() => generateKExpressionProblem())
  const [revealed, setRevealed]     = useState(false)
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [score, setScore]           = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    setProblem(generateKExpressionProblem())
    setRevealed(false)
    setCheckState('idle')
  }

  // Because K expressions have variable formatting, we use a reveal-answer style check.
  // Student self-assesses after seeing the correct answer.
  function handleReveal() {
    setRevealed(true)
  }

  function handleSelfAssess(correct: boolean) {
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const { reaction, answer } = problem
  const { kcExpression } = buildKExpression(reaction.products, reaction.reactants)

  const omitted = [...reaction.products, ...reaction.reactants].filter(s => s.state === 's' || s.state === 'l')

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Write the K<sub>c</sub> expression for each reaction. Remember: products over reactants,
        coefficients become exponents, omit pure solids and liquids.
      </p>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={reaction.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Write K<sub>c</sub> for:</p>
            <p className="font-mono text-base text-primary">{reaction.equation}</p>
            {omitted.length > 0 && (
              <p className="font-sans text-xs text-dim">
                Hint: omit {omitted.map(s => `${s.formula}(${s.state})`).join(', ')}
              </p>
            )}
          </div>

          {!revealed && checkState === 'idle' && (
            <button onClick={handleReveal}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Reveal Answer
            </button>
          )}

          {revealed && checkState === 'idle' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-sm px-4 py-3"
                style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
                <p className="font-mono text-xs text-secondary mb-1">Correct K<sub>c</sub> expression:</p>
                <p className="font-mono text-base text-primary">K<sub>c</sub> = {kcExpression}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="font-sans text-sm text-secondary">Did you get it right?</p>
                <div className="flex gap-2">
                  <button onClick={() => handleSelfAssess(true)}
                    className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium border border-emerald-700/50 text-emerald-400 hover:bg-emerald-950/20 transition-colors">
                    Yes, correct
                  </button>
                  <button onClick={() => handleSelfAssess(false)}
                    className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium border border-rose-700/50 text-rose-400 hover:bg-rose-950/20 transition-colors">
                    No, incorrect
                  </button>
                </div>
              </div>
            </div>
          )}

          {checkState !== 'idle' && (
            <div className="flex flex-col gap-2">
              <div className="rounded-sm px-4 py-3"
                style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
                <p className="font-mono text-base text-primary">K<sub>c</sub> = {answer}</p>
              </div>
              <p className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {checkState === 'correct' ? '\u2713 Marked correct' : '\u2717 Marked incorrect'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {(revealed || checkState !== 'idle') && (
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs text-secondary uppercase tracking-wider">Steps</p>
          {problem.steps.map((step, i) => (
            <p key={i} className="font-sans text-sm text-secondary">{i + 1}. {step}</p>
          ))}
        </div>
      )}

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next &rarr;
          </button>
        </motion.div>
      )}
    </div>
  )
}

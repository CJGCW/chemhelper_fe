import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateKpKcProblem, checkConcentrationAnswer } from '../../utils/equilibriumPractice'
import type { EquilibriumReaction } from '../../data/equilibriumReactions'

interface Props { allowCustom?: boolean }

interface Problem {
  reaction: EquilibriumReaction
  mode: 'Kp' | 'Kc'
  T: number
  answer: number
  steps: string[]
}

function fmt(n: number): string {
  const p = parseFloat(n.toPrecision(4))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) return p.toExponential(3)
  return String(p)
}

export default function KpKcPractice({ allowCustom = true }: Props) {
  const [problem, setProblem]       = useState<Problem>(() => generateKpKcProblem())
  const [answer, setAnswer]         = useState('')
  const [checkState, setCheckState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [score, setScore]           = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    setProblem(generateKpKcProblem())
    setAnswer('')
    setCheckState('idle')
  }

  function handleCheck() {
    if (!answer.trim() || checkState !== 'idle') return
    const correct = checkConcentrationAnswer(answer, problem.answer)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const targetLabel = problem.mode === 'Kc' ? 'Kp' : 'Kc'

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Convert between K<sub>p</sub> and K<sub>c</sub> using K<sub>p</sub> = K<sub>c</sub>(RT)<sup>\u0394n</sup>. Answers accepted within 2%.
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
        <motion.div key={problem.reaction.id + problem.mode}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-sm text-primary">{problem.reaction.equation}</p>
            <div className="flex flex-wrap gap-4 font-mono text-sm text-secondary">
              <span>K<sub>{problem.mode === 'Kc' ? 'c' : 'p'}</sub> = {fmt(problem.reaction.K)}</span>
              <span>T = {problem.T} K</span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-sm text-secondary">
              Calculate K<sub>{targetLabel === 'Kp' ? 'p' : 'c'}</sub>:
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
              disabled={checkState !== 'idle'}
              placeholder={`K${targetLabel}`}
              className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-sm w-36 focus:outline-none focus:border-muted disabled:cursor-not-allowed transition-colors
                ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                : 'border-border text-primary'}`}
            />
            {checkState === 'idle' ? (
              <button onClick={handleCheck} disabled={!answer.trim()}
                className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Check
              </button>
            ) : (
              <span className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {checkState === 'correct' ? '\u2713 Correct' : `\u2717 Answer: ${fmt(problem.answer)}`}
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Steps</p>
            {problem.steps.map((step, i) => (
              <p key={i} className="font-sans text-sm text-secondary">{i + 1}. {step}</p>
            ))}
          </div>
          <button onClick={nextProblem}
            className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next &rarr;
          </button>
        </motion.div>
      )}
    </div>
  )
}

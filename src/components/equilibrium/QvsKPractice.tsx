import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateQvsKProblem } from '../../utils/equilibriumPractice'

interface Props { allowCustom?: boolean }

type CheckState = 'idle' | 'correct' | 'wrong'

function fmt(n: number): string {
  const p = parseFloat(n.toPrecision(3))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) return p.toExponential(2)
  return String(p)
}

export default function QvsKPractice({ allowCustom = true }: Props) {
  const [problem, setProblem]       = useState(() => generateQvsKProblem())
  const [selected, setSelected]     = useState<string>('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [score, setScore]           = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    setProblem(generateQvsKProblem())
    setSelected('')
    setCheckState('idle')
  }

  function handleCheck() {
    if (!selected || checkState !== 'idle') return
    const correct = selected === problem.direction
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const { reaction, concentrations, Q } = problem
  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  const options = [
    { id: 'forward', label: '\u2192 Shifts forward (toward products)' },
    { id: 'reverse', label: '\u2190 Shifts reverse (toward reactants)' },
    { id: 'at-equilibrium', label: '\u21cc At equilibrium (no shift)' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Calculate Q using the given concentrations, then determine which direction the reaction shifts.
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
        <motion.div key={JSON.stringify(concentrations)}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Reaction</p>
            <p className="font-mono text-base text-primary">{reaction.equation}</p>
            <p className="font-mono text-sm text-secondary">K = {fmt(reaction.K)}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Current concentrations</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(concentrations).map(([sp, c]) => (
                <span key={sp} className="font-mono text-sm text-primary">
                  [{sp}] = {fmt(c)} M
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-sans text-sm text-secondary">Which direction does the reaction shift?</p>
            <div className="flex flex-col gap-2">
              {options.map(opt => (
                <button key={opt.id}
                  onClick={() => checkState === 'idle' && setSelected(opt.id)}
                  disabled={checkState !== 'idle'}
                  className="w-full text-left px-4 py-2.5 rounded-sm font-sans text-sm transition-colors disabled:cursor-default"
                  style={{
                    border: selected === opt.id ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgb(var(--color-border))',
                    background: selected === opt.id ? 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))',
                    color: selected === opt.id ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {checkState === 'idle' && (
            <button onClick={handleCheck} disabled={!selected}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check
            </button>
          )}

          {checkState !== 'idle' && (
            <div className="flex flex-col gap-1.5">
              <p className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {checkState === 'correct' ? '\u2713 Correct!' : '\u2717 Incorrect'}
              </p>
              <p className="font-mono text-sm text-secondary">Q = {fmt(Q)} &nbsp; K = {fmt(reaction.K)}</p>
              <p className="font-sans text-sm text-secondary">{problem.steps[problem.steps.length - 1]}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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

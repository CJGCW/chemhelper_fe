import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateICEProblem, generateDynamicICEProblem, checkConcentrationAnswer } from '../../utils/equilibriumPractice'
import ICETable from '../shared/ICETable'
import type { ICESolution } from '../../chem/equilibrium'

interface Props { allowCustom?: boolean }

interface Problem {
  equation: string
  K: number
  kType: 'Kc' | 'Kp'
  initial: Record<string, number>
  solution: ICESolution
  targetSpecies: string
  targetConc: number
  isDynamic: boolean
}

function generateProblem(forcePool = false): Problem {
  // Problems mode (allowCustom=false) always uses dynamic; Practice mode mixes 50/50
  const useDynamic = !forcePool && Math.random() < 0.6
  if (useDynamic) {
    const p = generateDynamicICEProblem()
    const entries = Object.entries(p.solution.equilibriumConcentrations)
    const [species, conc] = entries[Math.floor(Math.random() * entries.length)]
    return { equation: p.equation, K: p.K, kType: p.kType, initial: p.initial, solution: p.solution, targetSpecies: species, targetConc: conc, isDynamic: true }
  }
  const { reaction, initial, solution } = generateICEProblem()
  const entries = Object.entries(solution.equilibriumConcentrations)
  const [species, conc] = entries[Math.floor(Math.random() * entries.length)]
  return { equation: reaction.equation, K: reaction.K, kType: reaction.kType, initial, solution, targetSpecies: species, targetConc: conc, isDynamic: false }
}

function fmt(n: number): string {
  const p = parseFloat(n.toPrecision(4))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) return p.toExponential(3)
  return String(p)
}

export default function ICETablePractice({ allowCustom = true }: Props) {
  // Problems mode (allowCustom=false) forces dynamic generation
  const [problem, setProblem]       = useState<Problem>(() => generateProblem(!allowCustom ? false : false))
  const [answer, setAnswer]         = useState('')
  const [checkState, setCheckState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [score, setScore]           = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    // In Problems mode always use dynamic; in Practice mode mix
    setProblem(generateProblem(false))
    setAnswer('')
    setCheckState('idle')
  }

  function handleCheck() {
    if (!answer.trim() || checkState !== 'idle') return
    const correct = checkConcentrationAnswer(answer, problem.targetConc)
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const { equation, K, kType, initial, solution, targetSpecies, targetConc } = problem
  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Use the ICE table method to find equilibrium concentrations. Answers accepted within 2%.
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
        <motion.div key={equation + JSON.stringify(initial)}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-secondary uppercase tracking-wider">Reaction</p>
              {problem.isDynamic && (
                <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                  style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
                  generated
                </span>
              )}
            </div>
            <p className="font-mono text-sm text-primary">{equation}</p>
            <p className="font-mono text-sm text-secondary">K<sub>{kType === 'Kc' ? 'c' : 'p'}</sub> = {K.toPrecision(3)}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Initial concentrations</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(initial).map(([sp, c]) => (
                <span key={sp} className="font-mono text-sm text-primary">[{sp}]₀ = {fmt(c)} M</span>
              ))}
            </div>
          </div>

          {checkState !== 'idle' && (
            <ICETable rows={solution.rows} />
          )}

          <div className="flex flex-col gap-2">
            <p className="font-sans text-sm text-secondary">
              What is the equilibrium concentration of{' '}
              <span className="font-mono text-primary">[{targetSpecies}]</span> (in M)?
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                inputMode="decimal"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                disabled={checkState !== 'idle'}
                placeholder="e.g. 0.0338"
                className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-sm w-40 focus:outline-none focus:border-muted disabled:cursor-not-allowed transition-colors
                  ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                  : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                  : 'border-border text-primary'}`}
              />
              <span className="font-mono text-sm text-secondary">M</span>
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
                  {checkState === 'correct' ? '✓ Correct' : `✗ Incorrect — answer: ${fmt(targetConc)} M`}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Steps</p>
            {solution.steps.map((step, i) => (
              <p key={i} className="font-sans text-sm text-secondary">{i + 1}. {step}</p>
            ))}
          </div>
          <button onClick={nextProblem}
            className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next &rarr;
          </button>
        </motion.div>
      )}
      <p className="font-mono text-xs text-secondary">Answers within ±2% accepted</p>
    </div>
  )
}

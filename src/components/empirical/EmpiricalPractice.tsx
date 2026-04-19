import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../../stores/elementStore'
import {
  buildMolarMasses,
  solveEmpiricalFormula,
  generateProblem,
  exactFormulaMatch,
  COMPOUND_POOL,
  type GeneratedProblem,
  type Difficulty,
} from '../../utils/empiricalFormula'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, dp = 4): string {
  return parseFloat(n.toPrecision(dp)).toString()
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Solution steps ────────────────────────────────────────────────────────────

function SolutionSteps({
  problem,
  molarMasses,
}: {
  problem: GeneratedProblem
  molarMasses: Record<string, number>
}) {
  const inputs = problem.elements.map(e => ({ symbol: e.symbol, value: e.percent }))
  const result = solveEmpiricalFormula(inputs, molarMasses, problem.molecularMass)
  if (!result) return <p className="font-sans text-xs text-dim">Could not compute solution.</p>

  const minMoles = Math.min(...result.rows.map(r => r.moles))

  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-xs font-medium text-secondary">Step-by-step solution</p>

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs text-secondary uppercase tracking-widest">Step 1 — % → moles (assume 100 g sample)</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {result.rows.map(r => (
            <span key={r.symbol} className="font-mono text-xs text-secondary">
              {r.symbol}: {fmt(r.inputValue, 5)} ÷ {fmt(r.molarMass, 5)} ={' '}
              <span className="text-primary">{fmt(r.moles, 4)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs text-secondary uppercase tracking-widest">
          Step 2 — divide by smallest ({fmt(minMoles, 4)} mol)
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {result.rows.map(r => (
            <span key={r.symbol} className="font-mono text-xs text-secondary">
              {r.symbol}: {fmt(r.moles, 4)} ÷ {fmt(minMoles, 4)} ={' '}
              <span className="text-primary">{fmt(r.ratio, 4)}</span>
            </span>
          ))}
        </div>
      </div>

      {result.multiplier > 1 && (
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs text-secondary uppercase tracking-widest">
            Step 3 — ratios not whole numbers, multiply by {result.multiplier}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {result.rows.map(r => (
              <span key={r.symbol} className="font-mono text-xs text-secondary">
                {r.symbol}: {fmt(r.ratio, 4)} × {result.multiplier} ≈{' '}
                <span className="text-primary">{r.subscript}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formula result(s) */}
      <div className="flex flex-wrap gap-3 items-center pt-1">
        <div className="flex flex-col items-center px-4 py-2 rounded-sm border"
          style={{ background: 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-base)))', borderColor: 'color-mix(in srgb, #4ade80 25%, transparent)' }}>
          <span className="font-mono text-xs text-secondary uppercase tracking-widest">Empirical</span>
          <span className="font-mono text-xl font-bold" style={{ color: '#4ade80' }}>{result.empiricalFormula}</span>
        </div>

        {result.molecularFormula && result.molecularMultiplier && (
          <>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="font-sans text-xs text-secondary">M(emp) = {fmt(result.empiricalMolarMass, 5)} g/mol</span>
              <span className="font-sans text-xs text-secondary">
                n = {fmt(problem.molecularMass!, 5)} ÷ {fmt(result.empiricalMolarMass, 5)} = {result.molecularMultiplier}
              </span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 rounded-sm border"
              style={{ background: 'color-mix(in srgb, #818cf8 6%, rgb(var(--color-base)))', borderColor: 'color-mix(in srgb, #818cf8 25%, transparent)' }}>
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Molecular</span>
              <span className="font-mono text-xl font-bold" style={{ color: '#818cf8' }}>{result.molecularFormula}</span>
            </div>
          </>
        )}
      </div>

      {problem.hint && (
        <p className="font-sans text-xs text-dim italic border-l-2 pl-3" style={{ borderColor: 'rgba(var(--overlay),0.1)' }}>
          {problem.hint}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type CheckState = 'idle' | 'correct' | 'wrong'

export default function EmpiricalPractice() {
  const elements = useElementStore(s => s.elements)
  const molarMasses = useMemo(() => buildMolarMasses(elements), [elements])

  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [genTrigger, setGenTrigger] = useState(0)
  const [problem, setProblem] = useState<GeneratedProblem | null>(null)
  const [empiricalAnswer, setEmpiricalAnswer] = useState('')
  const [molecularAnswer, setMolecularAnswer] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [showSolution, setShowSolution] = useState(false)

  const prevNameRef = useRef<string | undefined>(undefined)

  // Regenerate whenever trigger fires or elements become available
  useEffect(() => {
    if (Object.keys(molarMasses).length === 0) return

    const pool = COMPOUND_POOL.filter(c => difficulty === 'all' || c.difficulty === difficulty)
    if (pool.length === 0) return

    const candidates = pool.filter(c => c.name !== prevNameRef.current)
    const source = candidates.length > 0 ? candidates : pool

    // Try up to 10 times to get a valid generated problem (some elements may be missing)
    for (let attempt = 0; attempt < 10; attempt++) {
      const template = pickRandom(source)
      const generated = generateProblem(template, molarMasses)
      if (generated) {
        prevNameRef.current = generated.compoundName
        setProblem(generated)
        setEmpiricalAnswer('')
        setMolecularAnswer('')
        setCheckState('idle')
        setShowSolution(false)
        break
      }
    }
  }, [genTrigger, molarMasses]) // eslint-disable-line react-hooks/exhaustive-deps
  // Note: `difficulty` is intentionally excluded — changing difficulty updates
  // genTrigger via handleDifficultyChange which already captures the new value

  function handleDifficultyChange(d: Difficulty | 'all') {
    setDifficulty(d)
    setGenTrigger(t => t + 1)
  }

  function nextProblem() {
    setGenTrigger(t => t + 1)
  }

  function checkAnswer() {
    if (!problem) return
    const empOk = exactFormulaMatch(empiricalAnswer, problem.empiricalASCII)
    const molOk = !problem.molecularASCII || exactFormulaMatch(molecularAnswer, problem.molecularASCII)
    const correct = empOk && molOk
    setCheckState(correct ? 'correct' : 'wrong')
    if (correct) setShowSolution(true)
  }

  const feedbackColor = checkState === 'correct' ? '#4ade80' : '#f87171'

  return (
    <div className="flex flex-col gap-5">

      {/* Difficulty filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-sans text-xs text-secondary">Difficulty</span>
        <div className="flex items-center gap-1 p-1 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
            <button key={d}
              onClick={() => handleDifficultyChange(d)}
              className="relative px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors capitalize"
              style={{ color: difficulty === d ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
            >
              {difficulty === d && (
                <motion.div layoutId="practice-diff-bg" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{d}</span>
            </button>
          ))}
        </div>
        <span className="font-mono text-xs text-secondary">
          {COMPOUND_POOL.filter(c => difficulty === 'all' || c.difficulty === difficulty).length} compounds
        </span>
      </div>

      {/* Problem card */}
      <AnimatePresence mode="wait">
        {problem ? (
          <motion.div key={problem.compoundName + genTrigger}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4 p-4 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-base))' }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm border"
                style={{
                  color: problem.difficulty === 'easy' ? '#4ade80' : problem.difficulty === 'medium' ? '#fb923c' : '#f87171',
                  borderColor: problem.difficulty === 'easy' ? 'rgba(74,222,128,0.3)' : problem.difficulty === 'medium' ? 'rgba(251,146,60,0.3)' : 'rgba(248,113,113,0.3)',
                  background: problem.difficulty === 'easy' ? 'rgba(74,222,128,0.05)' : problem.difficulty === 'medium' ? 'rgba(251,146,60,0.05)' : 'rgba(248,113,113,0.05)',
                }}>
                {problem.difficulty}
              </span>
              <button onClick={nextProblem}
                className="font-mono text-[10px] text-dim hover:text-primary transition-colors">
                skip →
              </button>
            </div>

            {/* Percent composition table */}
            <div className="flex flex-col gap-2">
              <p className="font-sans text-xs text-secondary">Find the empirical formula from the percent composition:</p>
              <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgba(var(--overlay),0.02)' }}>
                <table className="border-collapse text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Element</th>
                      <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">% by Mass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problem.elements.map(e => (
                      <tr key={e.symbol} className="border-b border-border last:border-0">
                        <td className="px-4 py-2 font-semibold" style={{ color: 'var(--c-halogen)' }}>{e.symbol}</td>
                        <td className="px-4 py-2 text-primary">{e.percent.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {problem.molecularMass && (
                <p className="font-sans text-xs text-secondary">
                  Molar mass: <span className="font-mono text-primary">{problem.molecularMass} g/mol</span>
                  <span className="text-dim"> — also find the molecular formula.</span>
                </p>
              )}
            </div>

            {/* Answer inputs */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary uppercase">Empirical formula</label>
                <input
                  type="text"
                  value={empiricalAnswer}
                  onChange={e => { setEmpiricalAnswer(e.target.value); setCheckState('idle') }}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                  placeholder="e.g. CH2O"
                  className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 w-48
                             text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
                />
              </div>
              {problem.molecularASCII && (
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-xs text-secondary uppercase">Molecular formula</label>
                  <input
                    type="text"
                    value={molecularAnswer}
                    onChange={e => { setMolecularAnswer(e.target.value); setCheckState('idle') }}
                    onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                    placeholder="e.g. C6H12O6"
                    className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 w-48
                               text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
              )}
              <p className="font-sans text-xs text-secondary">
                Use standard element symbols, e.g. "Fe2O3". Element symbols are case-sensitive.
              </p>
            </div>

            {/* Actions + feedback */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={checkAnswer}
                disabled={!empiricalAnswer.trim()}
                className="font-sans text-sm font-medium px-4 py-1.5 rounded-sm transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                  opacity: empiricalAnswer.trim() ? 1 : 0.4,
                }}
              >
                Check
              </button>
              <button
                onClick={() => setShowSolution(s => !s)}
                className="font-sans text-sm text-secondary hover:text-primary transition-colors"
              >
                {showSolution ? 'Hide solution' : 'Show solution'}
              </button>

              <AnimatePresence>
                {checkState !== 'idle' && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="font-sans text-sm font-medium"
                    style={{ color: feedbackColor }}
                  >
                    {checkState === 'correct' ? '✓ Correct!' : '✗ Not quite — check your ratios.'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Solution */}
            <AnimatePresence>
              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}
                >
                  <div className="border-t border-border pt-4">
                    <p className="font-sans text-xs text-secondary uppercase tracking-widest mb-3">
                      Compound: <span className="font-mono text-primary font-medium normal-case">{problem.compoundName}</span>
                    </p>
                    <SolutionSteps problem={problem} molarMasses={molarMasses} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="font-sans text-xs text-dim">
            {Object.keys(molarMasses).length === 0 ? 'Waiting for element data…' : 'Generating problem…'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

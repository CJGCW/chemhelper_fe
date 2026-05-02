import { useState, useCallback } from 'react'
import { generateCrossoverTProblem, type CrossoverTProblem } from '../../utils/thermodynamicsPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props {
  allowCustom?: boolean
}

export default function GibbsTempPractice(_props: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem] = useState<CrossoverTProblem>(() => generateCrossoverTProblem())
  const [input, setInput]     = useState('')
  const [verify, setVerify]   = useState<'correct' | 'incorrect' | null>(null)
  const [score, setScore]     = useState({ correct: 0, total: 0 })
  const [showSteps, setShowSteps] = useState(false)

  const nextProblem = useCallback(() => {
    setProblem(generateCrossoverTProblem())
    setInput('')
    setVerify(null)
    setShowSteps(false)
  }, [])

  function handleCheck() {
    const val = parseFloat(input)
    if (isNaN(val)) return
    const tolerance = Math.abs(problem.answer) * 0.02 + 1
    const correct = Math.abs(val - problem.answer) <= tolerance
    setVerify(correct ? 'correct' : 'incorrect')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">Score: {score.correct}/{score.total}</span>
        <button onClick={nextProblem} className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors">
          Next problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-secondary mb-3">
          Find the crossover temperature (T in K) at which ΔG° = 0:
        </p>
        <div className="grid grid-cols-2 gap-3 font-mono text-sm">
          <div>
            <span className="text-secondary text-xs">ΔH°</span>
            <p className="text-primary font-semibold mt-0.5">{problem.deltaH_kJ} kJ/mol</p>
          </div>
          <div>
            <span className="text-secondary text-xs">ΔS°</span>
            <p className="text-primary font-semibold mt-0.5">{problem.deltaS_JperK} J/(mol·K)</p>
          </div>
        </div>
        <p className="font-mono text-xs text-dim mt-2">Hint: T<sub>c</sub> = ΔH°(kJ) × 1000 / ΔS°(J/K)</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Crossover Temperature (K)</label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={e => { setInput(e.target.value); setVerify(null) }}
            placeholder="e.g. 500"
            className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40"
          />
          <span className="font-mono text-xs text-secondary">K</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={handleCheck}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}>
          Check
        </button>
        <button onClick={() => setShowSteps(s => !s)} className="px-3 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
          {showSteps ? 'Hide steps' : 'Show steps'}
        </button>
      </div>

      {verify && (
        <p className={`font-mono text-sm font-semibold ${verify === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
          {verify === 'correct' ? '✓ Correct!' : `✗ Incorrect. Answer: ${problem.answer.toFixed(1)} K`}
        </p>
      )}

      {showSteps && showAnswers && (
        <div className="p-3 rounded-sm border border-border bg-raised flex flex-col gap-1">
          {problem.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary">{s}</p>
          ))}
        </div>
      )}
      {showSteps && !showAnswers && <p className="font-sans text-sm text-dim italic">Step-by-step solution hidden.</p>}
    </div>
  )
}

import { useState, useCallback } from 'react'
import { generateEntropyProblem, type EntropyProblem } from '../../utils/thermodynamicsPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props {
  allowCustom?: boolean
}

export default function EntropyPractice(_props: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem]   = useState<EntropyProblem>(() => generateEntropyProblem())
  const [input, setInput]       = useState('')
  const [verify, setVerify]     = useState<'correct' | 'sig_fig_warning' | 'incorrect' | null>(null)
  const [score, setScore]       = useState({ correct: 0, total: 0 })
  const [showSteps, setShowSteps] = useState(false)

  const nextProblem = useCallback(() => {
    setProblem(generateEntropyProblem())
    setInput('')
    setVerify(null)
    setShowSteps(false)
  }, [])

  function handleCheck() {
    const val = parseFloat(input)
    if (isNaN(val)) return
    const tolerance = Math.abs(problem.answer) * 0.02 + 0.5
    const correct = Math.abs(val - problem.answer) <= tolerance
    setVerify(correct ? 'correct' : 'incorrect')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const verifyColor = verify === 'correct'
    ? 'text-emerald-400'
    : verify === 'incorrect' ? 'text-red-400' : ''

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">
          Score: {score.correct}/{score.total}
        </span>
        <button
          onClick={nextProblem}
          className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          Next problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-secondary mb-1">Calculate ΔS°rxn for:</p>
        <p className="font-mono text-sm text-primary font-medium">{problem.label}</p>
        <div className="mt-3 flex flex-col gap-1 text-xs text-dim font-mono">
          <p>Products: {problem.products.map(p => `${p.coefficient} ${p.formula}(${p.state})`).join(' + ')}</p>
          <p>Reactants: {problem.reactants.map(r => `${r.coefficient} ${r.formula}(${r.state})`).join(' + ')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Your answer — ΔS°rxn in J/(mol·K)</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={e => { setInput(e.target.value); setVerify(null) }}
            placeholder="e.g. 160.5"
            className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40"
          />
          <span className="flex items-center font-mono text-xs text-secondary">J/(mol·K)</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCheck}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Check
        </button>
        <button
          onClick={() => setShowSteps(s => !s)}
          className="px-3 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          {showSteps ? 'Hide steps' : 'Show steps'}
        </button>
      </div>

      {verify && (
        <p className={`font-mono text-sm font-semibold ${verifyColor}`}>
          {verify === 'correct' ? '✓ Correct!' : `✗ Incorrect. Answer: ${problem.answer.toFixed(2)} J/(mol·K)`}
        </p>
      )}

      {showSteps && showAnswers && (
        <div className="p-3 rounded-sm border border-border bg-raised flex flex-col gap-1">
          {problem.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary">{s}</p>
          ))}
        </div>
      )}

      {showSteps && !showAnswers && (
        <p className="font-sans text-sm text-dim italic">Step-by-step solution hidden.</p>
      )}
    </div>
  )
}

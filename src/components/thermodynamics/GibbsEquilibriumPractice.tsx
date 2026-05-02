import { useState, useCallback } from 'react'
import { generateGibbsKProblem, type GibbsKProblem } from '../../utils/thermodynamicsPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props {
  allowCustom?: boolean
}

function formatK(K: number): string {
  if (K === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(K)))
  if (Math.abs(exp) < 4) return K.toPrecision(4)
  const mantissa = K / Math.pow(10, exp)
  return `${mantissa.toFixed(2)} × 10^${exp}`
}

export default function GibbsEquilibriumPractice(_props: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem] = useState<GibbsKProblem>(() => generateGibbsKProblem())
  const [input, setInput]     = useState('')
  const [verify, setVerify]   = useState<'correct' | 'incorrect' | null>(null)
  const [score, setScore]     = useState({ correct: 0, total: 0 })
  const [showSteps, setShowSteps] = useState(false)

  const nextProblem = useCallback(() => {
    setProblem(generateGibbsKProblem())
    setInput('')
    setVerify(null)
    setShowSteps(false)
  }, [])

  function handleCheck() {
    const val = parseFloat(input)
    if (isNaN(val)) return

    let tolerance: number
    let correct: boolean

    if (problem.direction === 'K-to-deltaG') {
      // Answer is ΔG°
      tolerance = Math.abs(problem.answer) * 0.02 + 0.5
      correct = Math.abs(val - problem.answer) <= tolerance
    } else {
      // Answer is K — allow log-scale tolerance (within 10%)
      const logDiff = Math.abs(Math.log10(Math.abs(val)) - Math.log10(Math.abs(problem.answer)))
      correct = logDiff < 0.1
    }

    setVerify(correct ? 'correct' : 'incorrect')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const isKtoG = problem.direction === 'K-to-deltaG'
  const answerDisplay = isKtoG
    ? `${problem.answer.toFixed(2)} kJ/mol`
    : formatK(problem.answer)

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">Score: {score.correct}/{score.total}</span>
        <button onClick={nextProblem} className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors">
          Next problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-secondary mb-2">
          {isKtoG
            ? `Given K = ${formatK(problem.K!)} at T = ${problem.T} K, find ΔG° (kJ/mol).`
            : `Given ΔG° = ${problem.deltaG_kJ} kJ/mol at T = ${problem.T} K, find K.`}
        </p>
        <p className="font-mono text-xs text-dim">R = 8.314 J/(mol·K)</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">
          {isKtoG ? 'ΔG° (kJ/mol)' : 'K'}
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={e => { setInput(e.target.value); setVerify(null) }}
            placeholder={isKtoG ? 'e.g. -32.9' : 'e.g. 5.4e5'}
            className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40"
          />
          {isKtoG && <span className="font-mono text-xs text-secondary">kJ/mol</span>}
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
          {verify === 'correct' ? '✓ Correct!' : `✗ Incorrect. Answer: ${answerDisplay}`}
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

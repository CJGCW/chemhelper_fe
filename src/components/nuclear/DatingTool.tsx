import { useState } from 'react'
import { carbonDating } from '../../chem/nuclear'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'

function generateExample() {
  const res = carbonDating(152, 226)
  return {
    scenario: 'A wood artifact has a ¹⁴C activity of 152 dpm. A fresh wood sample gives 226 dpm. Find the age. (t½ = 5730 yr)',
    steps: res.steps,
    result: `Age ≈ ${Math.round(res.age).toLocaleString()} years`,
  }
}

export default function DatingTool() {
  const [currentActivity, setCurrentActivity] = useState('')
  const [originalActivity, setOriginalActivity] = useState('')
  const [halfLife, setHalfLife] = useState('5730')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<ReturnType<typeof carbonDating> | null>(null)
  const [error, setError] = useState('')

  const stepsState = useStepsPanelState(steps, generateExample)

  function handleCalculate() {
    setError(''); setResult(null); setSteps([])
    const A = parseFloat(currentActivity)
    const A0 = parseFloat(originalActivity)
    const t12 = parseFloat(halfLife)

    if (isNaN(A) || isNaN(A0) || isNaN(t12)) {
      setError('Enter valid numbers for all fields.')
      return
    }
    if (A <= 0 || A0 <= 0) { setError('Activities must be positive.'); return }
    if (A > A0) { setError('Current activity cannot exceed original activity.'); return }
    if (t12 <= 0) { setError('Half-life must be positive.'); return }

    try {
      const res = carbonDating(A, A0, t12)
      setSteps(res.steps)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  function handleClear() {
    setCurrentActivity(''); setOriginalActivity(''); setHalfLife('5730')
    setResult(null); setSteps([]); setError('')
  }

  const hasInputs = currentActivity.trim() && originalActivity.trim() && halfLife.trim()

  return (
    <div className="flex flex-col gap-5">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Calculate the age of an artifact using radiometric dating.
        Formula: <span className="font-mono text-primary">t = (t½ / ln 2) × ln(A₀ / A)</span>.
        Default half-life is 5730 yr (¹⁴C). Use different half-life values for other isotopes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
        <NumberField
          label="Current activity (A)"
          value={currentActivity}
          onChange={v => { setCurrentActivity(v); setResult(null) }}
          placeholder="e.g. 152"
        />
        <NumberField
          label="Original activity (A₀)"
          value={originalActivity}
          onChange={v => { setOriginalActivity(v); setResult(null) }}
          placeholder="e.g. 226"
        />
        <NumberField
          label="Half-life (yr)"
          value={halfLife}
          onChange={v => { setHalfLife(v); setResult(null) }}
          placeholder="5730"
        />
      </div>

      <p className="font-sans text-xs text-dim">
        Activities can be in any consistent unit (dpm, Bq, counts/min). The ratio A₀/A is what matters.
      </p>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          disabled={!hasInputs}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        {(currentActivity || originalActivity || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <ResultDisplay
          label="Age of artifact"
          value={Math.round(result.age).toLocaleString()}
          unit="years"
        />
      )}
    </div>
  )
}

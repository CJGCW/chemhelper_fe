import { useState } from 'react'
import { solveHalfLife } from '../../chem/nuclear'
import type { HalfLifeInput } from '../../chem/nuclear'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'

type SolveFor = HalfLifeInput['solveFor']

const SOLVE_OPTIONS: { id: SolveFor; label: string; formula: string }[] = [
  { id: 'N',                label: 'Remaining amount (N)',    formula: 'N = N₀(½)^n' },
  { id: 'N0',               label: 'Initial amount (N₀)',     formula: 'N₀ = N / (½)^n' },
  { id: 't',                label: 'Time elapsed (t)',        formula: 't = t½ × log₂(N₀/N)' },
  { id: 'halfLife',         label: 'Half-life (t½)',          formula: 't½ = t × ln2 / ln(N₀/N)' },
  { id: 'fractionRemaining', label: 'Fraction remaining',     formula: 'N/N₀ = (½)^(t/t½)' },
]

function generateExample() {
  const result = solveHalfLife({ solveFor: 'N', N0: 100, t: 5730, halfLife: 5730 })
  return {
    scenario: 'A 100 g sample of ¹⁴C (t½ = 5730 yr). How much remains after 5730 years?',
    steps: result.steps,
    result: `N = ${result.answer.toFixed(1)} g (50 g — exactly one half-life)`,
  }
}

export default function HalfLifeTool() {
  const [solveFor, setSolveFor] = useState<SolveFor>('N')
  const [n0Val, setN0Val] = useState('')
  const [nVal, setNVal] = useState('')
  const [tVal, setTVal] = useState('')
  const [hlVal, setHlVal] = useState('')
  const [timeUnit, setTimeUnit] = useState('yr')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<ReturnType<typeof solveHalfLife> | null>(null)
  const [error, setError] = useState('')

  const stepsState = useStepsPanelState(steps, generateExample)

  function handleCalculate() {
    setError(''); setResult(null); setSteps([])

    const N0 = n0Val ? parseFloat(n0Val) : undefined
    const N  = nVal  ? parseFloat(nVal)  : undefined
    const t  = tVal  ? parseFloat(tVal)  : undefined
    const hl = hlVal ? parseFloat(hlVal) : undefined

    // Validate required fields per solveFor
    const missing: string[] = []
    if (solveFor === 'N'  && (N0 === undefined || t === undefined || hl === undefined)) missing.push('N₀, t, and t½')
    if (solveFor === 'N0' && (N  === undefined || t === undefined || hl === undefined)) missing.push('N, t, and t½')
    if (solveFor === 't'  && (N0 === undefined || N  === undefined || hl === undefined)) missing.push('N₀, N, and t½')
    if (solveFor === 'halfLife' && (N0 === undefined || N === undefined || t === undefined)) missing.push('N₀, N, and t')
    if (solveFor === 'fractionRemaining' && (t === undefined || hl === undefined)) missing.push('t and t½')
    if (missing.length > 0) { setError(`Please enter ${missing[0]}.`); return }

    try {
      const res = solveHalfLife({ solveFor, N0, N, t, halfLife: hl })
      setSteps(res.steps)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  function handleClear() {
    setN0Val(''); setNVal(''); setTVal(''); setHlVal('')
    setResult(null); setSteps([]); setError('')
  }

  const needsN0  = solveFor !== 'fractionRemaining' && solveFor !== 'N0'
  const needsN   = solveFor === 't' || solveFor === 'halfLife' || solveFor === 'N0'
  const needsT   = solveFor !== 'fractionRemaining' ? (solveFor === 't' ? false : solveFor !== 'halfLife') : true
  const needsHL  = solveFor !== 'halfLife'

  // Which fields are active (not the solve-for)
  const showN0 = solveFor !== 'N0'
  const showN  = solveFor !== 'N' && solveFor !== 'fractionRemaining'
  const showT  = solveFor !== 't'
  const showHL = solveFor !== 'halfLife'

  const fmtAnswer = result ? parseFloat(result.answer.toPrecision(5)).toString() : null
  const answerUnit = result
    ? (solveFor === 't' || solveFor === 'halfLife' ? timeUnit : result.answerUnit)
    : ''

  return (
    <div className="flex flex-col gap-5">
      <p className="font-sans text-sm text-secondary">
        Select which variable to solve for, then enter the remaining values.
        Use consistent time units for t and t½.
      </p>

      {/* Solve-for selector */}
      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-primary">Solve for</span>
        <div className="flex flex-wrap gap-2">
          {SOLVE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => { setSolveFor(opt.id); setResult(null); setSteps([]) }}
              className="px-3 py-1.5 rounded-sm font-sans text-sm transition-colors"
              style={solveFor === opt.id ? {
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                border: '1px solid rgba(var(--overlay),0.15)',
                color: 'rgba(var(--overlay),0.5)',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time unit */}
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm text-secondary">Time unit:</span>
        {['s', 'hr', 'days', 'yr'].map(u => (
          <button key={u} onClick={() => { setTimeUnit(u); setResult(null) }}
            className="px-2.5 py-0.5 rounded-sm font-mono text-xs transition-colors"
            style={timeUnit === u ? {
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            } : {
              border: '1px solid rgba(var(--overlay),0.12)',
              color: 'rgba(var(--overlay),0.35)',
            }}>
            {u}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        {showN0 && (
          <NumberField label="N₀ — Initial amount" value={n0Val}
            onChange={v => { setN0Val(v); setResult(null) }}
            placeholder="e.g. 100" solveFor={!needsN0} />
        )}
        {showN && (
          <NumberField label="N — Remaining amount" value={nVal}
            onChange={v => { setNVal(v); setResult(null) }}
            placeholder="e.g. 25" solveFor={!needsN} />
        )}
        {showT && (
          <NumberField label={`t — Time (${timeUnit})`} value={tVal}
            onChange={v => { setTVal(v); setResult(null) }}
            placeholder="e.g. 5730" solveFor={!needsT} />
        )}
        {showHL && (
          <NumberField label={`t½ — Half-life (${timeUnit})`} value={hlVal}
            onChange={v => { setHlVal(v); setResult(null) }}
            placeholder="e.g. 5730" solveFor={!needsHL} />
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        {(n0Val || nVal || tVal || hlVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />

      {result && fmtAnswer && (
        <ResultDisplay label={result.answerLabel} value={fmtAnswer} unit={answerUnit} />
      )}
    </div>
  )
}

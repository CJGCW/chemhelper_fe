import { useState } from 'react'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { solveIntegratedRate, type IntegratedRateSolution } from '../../chem/kinetics'

type Order = 0 | 1 | 2
type SolveFor = 'At' | 't' | 'halfLife'

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

function buildWorkedExample() {
  const sol = solveIntegratedRate({ order: 1, k: 5.1e-4, A0: 0.0200, solveFor: 'halfLife' })
  return {
    scenario: '2N₂O₅ → 4NO₂ + O₂ (1st order), k = 5.1×10⁻⁴ s⁻¹, [A]₀ = 0.0200 M. Find t½.',
    steps: sol.steps,
    result: `t½ = ${sig(sol.answer)} s`,
  }
}

export default function IntegratedRateTool() {
  const [order, setOrder]       = useState<Order>(1)
  const [solveFor, setSolveFor] = useState<SolveFor>('halfLife')
  const [k, setK]               = useState('')
  const [A0, setA0]             = useState('')
  const [t, setT]               = useState('')
  const [At, setAt]             = useState('')
  const [result, setResult]     = useState<IntegratedRateSolution | null>(null)
  const [steps, setSteps]       = useState<string[]>([])
  const [error, setError]       = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() { setResult(null); setSteps([]); setError(null) }

  function handleSolve() {
    setError(null)
    const kv = parseFloat(k)
    const a0v = parseFloat(A0)
    if (isNaN(kv) || kv <= 0 || isNaN(a0v) || a0v <= 0) {
      setError('Enter valid k (> 0) and [A]₀ (> 0).')
      return
    }
    if (solveFor === 'At' && isNaN(parseFloat(t))) { setError('Enter time t.'); return }
    if (solveFor === 't' && isNaN(parseFloat(At))) { setError('Enter [A].'); return }

    try {
      const sol = solveIntegratedRate({
        order,
        k: kv,
        A0: a0v,
        solveFor,
        t: solveFor === 'At' ? parseFloat(t) : undefined,
        At: solveFor === 't' ? parseFloat(At) : undefined,
      })
      setResult(sol)
      setSteps(sol.steps)
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Solve integrated rate law equations for concentration vs. time.
      </p>

      {/* Order selector */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs text-secondary uppercase tracking-widest">Reaction Order</label>
        <div className="flex gap-2">
          {([0, 1, 2] as Order[]).map(o => (
            <button key={o} onClick={() => { setOrder(o); reset() }}
              className="px-4 py-1.5 rounded-sm font-mono text-sm transition-colors"
              style={order === o ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                border: '1px solid rgba(var(--overlay),0.15)',
                color: 'rgba(var(--overlay),0.5)',
              }}>
              {o === 0 ? 'Zero (0th)' : o === 1 ? 'First (1st)' : 'Second (2nd)'}
            </button>
          ))}
        </div>
      </div>

      {/* Solve-for selector */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs text-secondary uppercase tracking-widest">Solve For</label>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'At', label: '[A] at time t' },
            { id: 't', label: 'Time t' },
            { id: 'halfLife', label: 'Half-life t½' },
          ] as { id: SolveFor; label: string }[]).map(opt => (
            <button key={opt.id} onClick={() => { setSolveFor(opt.id); reset() }}
              className="px-4 py-1.5 rounded-sm font-sans text-sm transition-colors"
              style={solveFor === opt.id ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
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

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <NumberField label="k (rate constant)" value={k} onChange={v => { setK(v); reset() }} placeholder="e.g. 5.1e-4" />
          <NumberField label="[A]₀ (M)" value={A0} onChange={v => { setA0(v); reset() }} placeholder="e.g. 0.0200" />
        </div>
        {solveFor === 'At' && (
          <NumberField label="t (s)" value={t} onChange={v => { setT(v); reset() }} placeholder="e.g. 500" />
        )}
        {solveFor === 't' && (
          <NumberField label="[A] (M)" value={At} onChange={v => { setAt(v); reset() }} placeholder="e.g. 0.0100" />
        )}
      </div>

      {error && <p className="font-sans text-sm text-rose-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleSolve}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <div className="p-4 rounded-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-sans text-sm text-secondary">
            {solveFor === 'At' ? '[A]' : solveFor === 't' ? 'Time' : 'Half-life'} =
          </p>
          <p className="font-mono text-xl font-semibold mt-1" style={{ color: 'var(--c-halogen)' }}>
            {sig(result.answer)} <span className="text-sm font-normal">{result.answerUnit}</span>
          </p>
        </div>
      )}
    </div>
  )
}

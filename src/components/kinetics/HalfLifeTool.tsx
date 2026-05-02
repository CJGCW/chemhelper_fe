import { useState } from 'react'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { solveIntegratedRate } from '../../chem/kinetics'

type Order = 0 | 1 | 2
type Mode = 'find-halflife' | 'find-At-from-nHalflives'

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

function buildWorkedExample() {
  const sol = solveIntegratedRate({ order: 1, k: 5.1e-4, A0: 0.0200, solveFor: 'halfLife' })
  return {
    scenario: '1st-order N₂O₅ decomposition, k = 5.1×10⁻⁴ s⁻¹, [N₂O₅]₀ = 0.0200 M. Find t½ and [A] after 3 half-lives.',
    steps: [...sol.steps, '[A] after 3 half-lives = 0.0200 × (1/2)³ = 0.0200/8 = 0.0025 M'],
    result: `t½ = ${sig(sol.answer)} s  |  [A] after 3 half-lives = 0.0025 M`,
  }
}

export default function HalfLifeTool() {
  const [order, setOrder]   = useState<Order>(1)
  const [mode, setMode]     = useState<Mode>('find-halflife')
  const [k, setK]           = useState('')
  const [A0, setA0]         = useState('')
  const [nHL, setNHL]       = useState('')
  const [result, setResult] = useState<{ answer: number; unit: string; extra?: string } | null>(null)
  const [steps, setSteps]   = useState<string[]>([])
  const [error, setError]   = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() { setResult(null); setSteps([]); setError(null) }

  function handleSolve() {
    setError(null)
    const kv = parseFloat(k)
    const a0v = parseFloat(A0)
    if (isNaN(kv) || kv <= 0 || isNaN(a0v) || a0v <= 0) {
      setError('Enter valid k and [A]₀ (both > 0).')
      return
    }
    const sol = solveIntegratedRate({ order, k: kv, A0: a0v, solveFor: 'halfLife' })
    const t12 = sol.answer

    const stepsOut = [...sol.steps]
    let extra: string | undefined

    if (mode === 'find-At-from-nHalflives') {
      const n = parseFloat(nHL)
      if (isNaN(n) || n < 0) { setError('Enter a valid number of half-lives (≥ 0).'); return }
      const fraction = Math.pow(0.5, n)
      const atN = a0v * fraction
      stepsOut.push(`After ${n} half-lives: [A] = [A]₀ × (1/2)ⁿ = ${sig(a0v)} × ${fraction.toPrecision(3)} = ${sig(atN)} M`)
      extra = `[A] after ${n} t½ = ${sig(atN)} M`
    }

    setResult({ answer: t12, unit: 's', extra })
    setSteps(stepsOut)
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Calculate the half-life for a given order and rate constant, or find concentration after n half-lives.
      </p>

      {/* Order */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs text-secondary uppercase tracking-widest">Reaction Order</label>
        <div className="flex gap-2 flex-wrap">
          {([0, 1, 2] as Order[]).map(o => (
            <button key={o} onClick={() => { setOrder(o); reset() }}
              className="px-4 py-1.5 rounded-sm font-mono text-sm transition-colors"
              style={order === o ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : { border: '1px solid rgba(var(--overlay),0.15)', color: 'rgba(var(--overlay),0.5)' }}>
              {o === 0 ? '0th' : o === 1 ? '1st' : '2nd'}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs text-secondary uppercase tracking-widest">Mode</label>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'find-halflife' as Mode, label: 'Find t½' },
            { id: 'find-At-from-nHalflives' as Mode, label: '[A] after n half-lives' },
          ]).map(opt => (
            <button key={opt.id} onClick={() => { setMode(opt.id); reset() }}
              className="px-4 py-1.5 rounded-sm font-sans text-sm transition-colors"
              style={mode === opt.id ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : { border: '1px solid rgba(var(--overlay),0.15)', color: 'rgba(var(--overlay),0.5)' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <NumberField label="k" value={k} onChange={v => { setK(v); reset() }} placeholder="e.g. 5.1e-4" />
          <NumberField label="[A]₀ (M)" value={A0} onChange={v => { setA0(v); reset() }} placeholder="e.g. 0.0200" />
        </div>
        {mode === 'find-At-from-nHalflives' && (
          <NumberField label="Number of half-lives (n)" value={nHL} onChange={v => { setNHL(v); reset() }} placeholder="e.g. 3" />
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
        <div className="p-4 rounded-sm flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-sans text-sm text-secondary">t½ =</p>
          <p className="font-mono text-xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
            {sig(result.answer)} <span className="text-sm font-normal">s</span>
          </p>
          {result.extra && (
            <p className="font-mono text-sm text-primary mt-1">{result.extra}</p>
          )}
        </div>
      )}
    </div>
  )
}

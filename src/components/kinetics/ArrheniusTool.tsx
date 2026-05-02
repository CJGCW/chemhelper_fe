import { useState } from 'react'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { solveArrhenius, type ArrheniusSolution } from '../../chem/kinetics'

type ArrhMode = 'find-Ea' | 'find-k' | 'find-T'

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

function buildWorkedExample() {
  const sol = solveArrhenius({ mode: 'find-Ea', T1: 298, k1: 1.35e-5, T2: 338, k2: 5.1e-4 })
  return {
    scenario: 'N₂O₅ decomposition: k = 1.35×10⁻⁵ s⁻¹ at 298 K; k = 5.10×10⁻⁴ s⁻¹ at 338 K. Find Ea.',
    steps: sol.steps,
    result: `Ea = ${sig(sol.answer)} kJ/mol`,
  }
}

export default function ArrheniusTool() {
  const [mode, setMode]   = useState<ArrhMode>('find-Ea')
  const [T1, setT1]       = useState('')
  const [k1, setK1]       = useState('')
  const [T2, setT2]       = useState('')
  const [k2, setK2]       = useState('')
  const [Ea, setEa]       = useState('')
  const [result, setResult] = useState<ArrheniusSolution | null>(null)
  const [steps, setSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() { setResult(null); setSteps([]); setError(null) }

  function handleSolve() {
    setError(null)
    const t1 = parseFloat(T1), k1v = parseFloat(k1)
    if (isNaN(t1) || isNaN(k1v) || k1v <= 0 || t1 <= 0) {
      setError('Enter valid T₁ (K > 0) and k₁ (> 0).')
      return
    }

    try {
      let sol: ArrheniusSolution
      if (mode === 'find-Ea') {
        const t2 = parseFloat(T2), k2v = parseFloat(k2)
        if (isNaN(t2) || isNaN(k2v) || t2 <= 0 || k2v <= 0) { setError('Enter valid T₂ and k₂.'); return }
        sol = solveArrhenius({ mode: 'find-Ea', T1: t1, k1: k1v, T2: t2, k2: k2v })
      } else if (mode === 'find-k') {
        const t2 = parseFloat(T2), eaV = parseFloat(Ea)
        if (isNaN(t2) || t2 <= 0) { setError('Enter valid T₂.'); return }
        if (isNaN(eaV) || eaV <= 0) { setError('Enter valid Ea (kJ/mol).'); return }
        sol = solveArrhenius({ mode: 'find-k', T1: t1, k1: k1v, T2: t2, Ea: eaV })
      } else {
        const k2v = parseFloat(k2), eaV = parseFloat(Ea)
        if (isNaN(k2v) || k2v <= 0) { setError('Enter valid k₂.'); return }
        if (isNaN(eaV) || eaV <= 0) { setError('Enter valid Ea (kJ/mol).'); return }
        sol = solveArrhenius({ mode: 'find-T', T1: t1, k1: k1v, k2: k2v, Ea: eaV })
      }
      setResult(sol)
      setSteps(sol.steps)
    } catch (e) {
      setError(String(e))
    }
  }

  const modes: { id: ArrhMode; label: string }[] = [
    { id: 'find-Ea', label: 'Find Ea' },
    { id: 'find-k',  label: 'Find k₂' },
    { id: 'find-T',  label: 'Find T₂' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Use the two-point Arrhenius equation:
        <span className="font-mono text-primary block mt-1">ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁)</span>
      </p>

      {/* Mode selector */}
      <div className="flex gap-1 p-1 rounded-full self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); reset() }}
            className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
            style={{ color: mode === m.id ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
              background: mode === m.id ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'transparent',
              border: mode === m.id ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid transparent',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Always-shown: T₁, k₁ */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <NumberField label="T₁ (K)" value={T1} onChange={v => { setT1(v); reset() }} placeholder="e.g. 298" />
          <NumberField label="k₁" value={k1} onChange={v => { setK1(v); reset() }} placeholder="e.g. 1.35e-5" />
        </div>

        {(mode === 'find-Ea' || mode === 'find-k') && (
          <NumberField label="T₂ (K)" value={T2} onChange={v => { setT2(v); reset() }} placeholder="e.g. 338" />
        )}
        {(mode === 'find-Ea' || mode === 'find-T') && (
          <NumberField label="k₂" value={k2} onChange={v => { setK2(v); reset() }} placeholder="e.g. 5.1e-4" />
        )}
        {(mode === 'find-k' || mode === 'find-T') && (
          <NumberField label="Ea (kJ/mol)" value={Ea} onChange={v => { setEa(v); reset() }} placeholder="e.g. 88" />
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
          <p className="font-sans text-sm text-secondary">{result.answerLabel} =</p>
          <p className="font-mono text-xl font-semibold mt-1" style={{ color: 'var(--c-halogen)' }}>
            {sig(result.answer)} <span className="text-sm font-normal">{result.answerUnit}</span>
          </p>
        </div>
      )}
    </div>
  )
}

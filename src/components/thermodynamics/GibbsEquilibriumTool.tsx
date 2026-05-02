import { useState } from 'react'
import { deltaGtoK, kToDeltaG } from '../../chem/thermodynamics'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

type InputMode = 'deltaG' | 'K' | 'ecell'

const F = 96485  // C/mol

function formatK(K: number): string {
  if (K === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(K)))
  if (Math.abs(exp) < 4) return K.toPrecision(4)
  const mantissa = K / Math.pow(10, exp)
  return `${mantissa.toFixed(3)} × 10^${exp}`
}

export default function GibbsEquilibriumTool() {
  const [mode, setMode] = useState<InputMode>('deltaG')
  const [dGInput, setDGInput] = useState('')
  const [kInput,  setKInput]  = useState('')
  const [eInput,  setEInput]  = useState('')
  const [nInput,  setNInput]  = useState('2')
  const [T, setT] = useState('298')

  const [steps, setSteps]   = useState<string[]>([])
  const [K, setK]           = useState<number | null>(null)
  const [deltaG, setDeltaG] = useState<number | null>(null)
  const [ecell, setEcell]   = useState<number | null>(null)

  function clearResult() { setK(null); setDeltaG(null); setEcell(null); setSteps([]) }

  function handleCalculate() {
    const Tv = parseFloat(T)
    const nv = parseFloat(nInput)
    if (isNaN(Tv) || Tv <= 0) return

    try {
      if (mode === 'deltaG') {
        const dGv = parseFloat(dGInput)
        if (isNaN(dGv)) return
        const { K: Kval, steps: s } = deltaGtoK(dGv, Tv)
        const eVal = -dGv * 1000 / (nv * F)
        setK(Kval)
        setDeltaG(dGv)
        setEcell(eVal)
        setSteps([...s, `E°cell = −ΔG°/(nF) = −(${dGv} × 1000) / (${nv} × ${F}) = ${eVal.toFixed(4)} V`])
      } else if (mode === 'K') {
        const Kv = parseFloat(kInput)
        if (isNaN(Kv) || Kv <= 0) return
        const { deltaG: dGval, steps: s } = kToDeltaG(Kv, Tv)
        const eVal = -dGval * 1000 / (nv * F)
        setK(Kv)
        setDeltaG(dGval)
        setEcell(eVal)
        setSteps([...s, `E°cell = −ΔG°/(nF) = −(${dGval.toFixed(2)} × 1000) / (${nv} × ${F}) = ${eVal.toFixed(4)} V`])
      } else {
        const ev = parseFloat(eInput)
        if (isNaN(ev) || isNaN(nv) || nv <= 0) return
        const dGval = -(nv * F * ev) / 1000
        const { K: Kval, steps: s } = deltaGtoK(dGval, Tv)
        setK(Kval)
        setDeltaG(dGval)
        setEcell(ev)
        setSteps([`ΔG° = −nFE° = −(${nv})(${F})(${ev})/1000 = ${dGval.toFixed(2)} kJ/mol`, ...s])
      }
    } catch (e) {
      console.error(e)
    }
  }

  function generateExample() {
    const { K: Kval, steps: s } = deltaGtoK(-32.9, 298)
    return {
      scenario: 'N₂(g) + 3H₂(g) → 2NH₃(g): ΔG° = −32.9 kJ/mol at 298 K. Find K.',
      steps: s,
      result: `K = ${formatK(Kval)}`,
    }
  }

  const stepsState = useStepsPanelState(steps, generateExample)

  const MODES: { id: InputMode; label: string }[] = [
    { id: 'deltaG', label: 'Given ΔG°' },
    { id: 'K',      label: 'Given K'   },
    { id: 'ecell',  label: 'Given E°cell' },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex gap-2 flex-wrap">
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); clearResult() }}
            className="px-3 py-1.5 rounded-full font-sans text-sm border transition-all"
            style={mode === m.id ? {
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            } : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-secondary))' }}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mode === 'deltaG' && <NumberField label="ΔG° (kJ/mol)" value={dGInput} onChange={v => { setDGInput(v); clearResult() }} placeholder="-32.9" unit={<span className="font-mono text-xs text-secondary ml-2">kJ/mol</span>} />}
        {mode === 'K'      && <NumberField label="K (equilibrium constant)" value={kInput} onChange={v => { setKInput(v); clearResult() }} placeholder="6.0e5" />}
        {mode === 'ecell'  && <NumberField label="E°cell (V)" value={eInput} onChange={v => { setEInput(v); clearResult() }} placeholder="1.10" unit={<span className="font-mono text-xs text-secondary ml-2">V</span>} />}
        <NumberField label="T (K)" value={T} onChange={v => { setT(v); clearResult() }} placeholder="298" unit={<span className="font-mono text-xs text-secondary ml-2">K</span>} />
        <NumberField label="n (mol e⁻, for E°)" value={nInput} onChange={v => { setNInput(v); clearResult() }} placeholder="2" unit={<span className="font-mono text-xs text-secondary ml-2">mol e⁻</span>} />
      </div>

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}>
          Convert
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {deltaG !== null && K !== null && ecell !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'ΔG°', value: `${deltaG.toFixed(2)} kJ/mol` },
            { label: 'K',   value: formatK(K) },
            { label: 'E°cell', value: `${ecell.toFixed(4)} V` },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-sm border"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
                borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              }}>
              <p className="font-mono text-xs text-secondary">{item.label}</p>
              <p className="font-mono text-lg mt-1 font-semibold" style={{ color: 'var(--c-halogen)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

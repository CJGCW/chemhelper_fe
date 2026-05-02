import { useState } from 'react'
import { bufferCapacity } from '../../chem/buffers'
import { WEAK_ACIDS } from '../../data/acidBaseConstants'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

const DEFAULT_ACID = WEAK_ACIDS.find(a => a.formula === 'CH₃COOH') ?? WEAK_ACIDS[0]

function buildWorkedExample() {
  const result = bufferCapacity(0.10, 0.10, 1.0, 4.74)
  return {
    scenario: `Calculate the acid and base capacity of a 1.00 L buffer that is 0.10 M in acetic acid and 0.10 M in acetate (pKa = 4.74).`,
    steps: result.steps,
    result: `Acid capacity ≈ ${result.acidCapacityMol.toFixed(4)} mol;  Base capacity ≈ ${result.baseCapacityMol.toFixed(4)} mol`,
  }
}

export default function BufferCapacityTool() {
  const [selectedAcid, setSelectedAcid] = useState(DEFAULT_ACID)
  const [concAcid, setConcAcid]  = useState('0.10')
  const [concBase, setConcBase]  = useState('0.10')
  const [volumeL,  setVolumeL]   = useState('1.000')
  const [steps,    setSteps]     = useState<string[]>([])
  const [result,   setResult]    = useState<{ acidCapacityMol: number; baseCapacityMol: number } | null>(null)
  const [error,    setError]     = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() {
    setSteps([])
    setResult(null)
    setError(null)
  }

  function handleCalculate() {
    reset()
    const ca = parseFloat(concAcid)
    const cb = parseFloat(concBase)
    const vL = parseFloat(volumeL)

    if (!isFinite(ca) || ca <= 0 || !isFinite(cb) || cb <= 0 || !isFinite(vL) || vL <= 0) {
      setError('Enter positive values for all fields.')
      return
    }

    try {
      const r = bufferCapacity(ca, cb, vL, selectedAcid.pKa)
      setSteps(r.steps)
      setResult({ acidCapacityMol: r.acidCapacityMol, baseCapacityMol: r.baseCapacityMol })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Weak Acid / Conjugate Base Pair</label>
        <select
          value={selectedAcid.formula}
          onChange={e => {
            const a = WEAK_ACIDS.find(x => x.formula === e.target.value)
            if (a) { setSelectedAcid(a); reset() }
          }}
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-accent/40"
        >
          {WEAK_ACIDS.map(a => (
            <option key={a.formula} value={a.formula}>
              {a.formula} / {a.conjugateBase}  (pKa = {a.pKa.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={`[${selectedAcid.formula}]`}
          value={concAcid}
          onChange={v => { setConcAcid(v); reset() }}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.10"
        />
        <NumberField
          label={`[${selectedAcid.conjugateBase}]`}
          value={concBase}
          onChange={v => { setConcBase(v); reset() }}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.10"
        />
      </div>

      <NumberField
        label="Buffer Volume"
        value={volumeL}
        onChange={v => { setVolumeL(v); reset() }}
        unit={<span className="font-mono text-xs text-secondary px-2">L</span>}
        placeholder="1.000"
      />

      <div className="flex items-stretch gap-2">
        <button
          onClick={handleCalculate}
          className="flex-1 py-2 px-4 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Calculate Capacity
        </button>
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-sm border bg-raised flex flex-col gap-2"
            style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' }}>
            <p className="font-sans text-sm text-secondary">Acid capacity (strong acid before pH drops 1 unit):</p>
            <p className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {result.acidCapacityMol.toFixed(4)} mol
            </p>
          </div>
          <div className="p-4 rounded-sm border bg-raised flex flex-col gap-2"
            style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' }}>
            <p className="font-sans text-sm text-secondary">Base capacity (strong base before pH rises 1 unit):</p>
            <p className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {result.baseCapacityMol.toFixed(4)} mol
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

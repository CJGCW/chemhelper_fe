import { useState } from 'react'
import { nuclearDecay } from '../../chem/nuclear'
import type { DecayType } from '../../chem/nuclear'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'

const DECAY_TYPES: { id: DecayType; label: string; description: string }[] = [
  { id: 'alpha',  label: 'Alpha (α)',         description: 'Z−2, A−4' },
  { id: 'beta',   label: 'Beta-minus (β⁻)',   description: 'Z+1, A same' },
  { id: 'beta+',  label: 'Beta-plus (β⁺)',    description: 'Z−1, A same' },
  { id: 'gamma',  label: 'Gamma (γ)',          description: 'Z same, A same' },
  { id: 'ec',     label: 'Electron Capture',   description: 'Z−1, A same' },
]

function generateExample() {
  // U-238 alpha decay: classic textbook example
  const result = nuclearDecay(92, 238, 'alpha')
  return {
    scenario: 'U-238 (Z=92, A=238) undergoes alpha decay. Find the daughter nuclide.',
    steps: result.steps,
    result: result.equation,
  }
}

export default function NuclearDecayTool() {
  const [zVal, setZVal] = useState('')
  const [aVal, setAVal] = useState('')
  const [decayType, setDecayType] = useState<DecayType>('alpha')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<ReturnType<typeof nuclearDecay> | null>(null)
  const [error, setError] = useState('')

  const stepsState = useStepsPanelState(steps, generateExample)

  function handleCalculate() {
    setError(''); setResult(null); setSteps([])
    const Z = parseInt(zVal, 10)
    const A = parseInt(aVal, 10)
    if (isNaN(Z) || isNaN(A)) { setError('Enter valid integer values for Z and A.'); return }
    if (Z < 1 || Z > 118) { setError('Z must be between 1 and 118.'); return }
    if (A < 1 || A > 294) { setError('A must be between 1 and 294.'); return }
    if (A < Z) { setError('A must be ≥ Z (mass number ≥ atomic number).'); return }
    if (decayType === 'alpha' && A < 5) { setError('Alpha decay requires A ≥ 5.'); return }

    try {
      const res = nuclearDecay(Z, A, decayType)
      setSteps(res.steps)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  function handleClear() {
    setZVal(''); setAVal('')
    setResult(null); setSteps([]); setError('')
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Enter the parent nuclide's atomic number (Z) and mass number (A), then select the decay type.
        The tool will identify the daughter nuclide and write the balanced nuclear equation.
      </p>

      {/* Decay type selector */}
      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-primary">Decay Type</span>
        <div className="flex flex-wrap gap-2">
          {DECAY_TYPES.map(dt => (
            <button key={dt.id} onClick={() => { setDecayType(dt.id); setResult(null); setSteps([]) }}
              className="px-3 py-1.5 rounded-sm font-sans text-sm transition-colors flex flex-col items-start"
              style={decayType === dt.id ? {
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                border: '1px solid rgba(var(--overlay),0.15)',
                color: 'rgba(var(--overlay),0.5)',
              }}>
              <span className="font-semibold">{dt.label}</span>
              <span className="font-mono text-[10px] opacity-70">{dt.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <NumberField
          label="Atomic Number (Z)"
          value={zVal}
          onChange={v => { setZVal(v); setResult(null) }}
          placeholder="e.g. 92"
        />
        <NumberField
          label="Mass Number (A)"
          value={aVal}
          onChange={v => { setAVal(v); setResult(null) }}
          placeholder="e.g. 238"
        />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {/* Buttons */}
      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          disabled={!zVal.trim() || !aVal.trim()}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        {(zVal || aVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <div className="flex flex-col gap-3 p-5 rounded-sm border"
          style={{
            borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))',
            background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))',
          }}>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">Balanced Equation</span>
            <span className="font-mono text-xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {result.equation}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">Daughter element</span>
              <span className="font-mono text-lg text-primary">{result.daughter.name}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">Symbol</span>
              <span className="font-mono text-lg text-primary">{result.daughter.symbol}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">Z (daughter)</span>
              <span className="font-mono text-lg text-primary">{result.daughter.Z}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">A (daughter)</span>
              <span className="font-mono text-lg text-primary">{result.daughter.A}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

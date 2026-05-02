import { useState } from 'react'
import { bindingEnergy } from '../../chem/nuclear'
import { COMMON_NUCLIDES } from '../../data/nuclearData'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'

function generateExample() {
  const res = bindingEnergy(2, 4, 4.002602)
  return {
    scenario: 'Calculate the binding energy of ⁴He (Z=2, A=4, m=4.002602 amu).',
    steps: res.steps,
    result: `BE/nucleon = ${res.bePerNucleon.toFixed(3)} MeV/nucleon, Total BE = ${res.totalBE.toFixed(2)} MeV`,
  }
}

export default function BindingEnergyTool() {
  const [zVal, setZVal] = useState('')
  const [aVal, setAVal] = useState('')
  const [massVal, setMassVal] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<ReturnType<typeof bindingEnergy> | null>(null)
  const [error, setError] = useState('')

  const stepsState = useStepsPanelState(steps, generateExample)

  function loadNuclide(n: typeof COMMON_NUCLIDES[0]) {
    setZVal(String(n.Z))
    setAVal(String(n.A))
    setMassVal(String(n.atomicMass))
    setResult(null); setSteps([])
  }

  function handleCalculate() {
    setError(''); setResult(null); setSteps([])
    const Z = parseInt(zVal, 10)
    const A = parseInt(aVal, 10)
    const mass = parseFloat(massVal)
    if (isNaN(Z) || isNaN(A) || isNaN(mass)) { setError('Enter valid values for Z, A, and atomic mass.'); return }
    if (Z < 1 || A < 1 || A < Z) { setError('Z ≥ 1, A ≥ Z required.'); return }
    if (mass <= 0) { setError('Atomic mass must be positive.'); return }

    try {
      const res = bindingEnergy(Z, A, mass)
      setSteps(res.steps)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  function handleClear() {
    setZVal(''); setAVal(''); setMassVal('')
    setResult(null); setSteps([]); setError('')
  }

  const stableNuclides = COMMON_NUCLIDES.filter(n => n.decayMode === 'stable')

  function fmt4(n: number): string { return parseFloat(n.toPrecision(5)).toString() }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Calculate nuclear binding energy from mass defect. Select a nuclide from the list or enter custom values.
        Formula: Δm = Z·m_H + (A−Z)·m_n − m_atom; BE = Δm × 931.5 MeV/amu.
      </p>

      {/* Quick select */}
      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-primary">Quick select nuclide</span>
        <div className="flex flex-wrap gap-1.5">
          {stableNuclides.map(n => (
            <button key={n.symbol} onClick={() => loadNuclide(n)}
              className="px-2.5 py-1 rounded-sm font-mono text-xs transition-colors"
              style={(zVal === String(n.Z) && aVal === String(n.A)) ? {
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                border: '1px solid rgba(var(--overlay),0.12)',
                color: 'rgba(var(--overlay),0.45)',
              }}>
              {n.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
        <NumberField label="Z (atomic number)" value={zVal}
          onChange={v => { setZVal(v); setResult(null) }} placeholder="e.g. 2" />
        <NumberField label="A (mass number)" value={aVal}
          onChange={v => { setAVal(v); setResult(null) }} placeholder="e.g. 4" />
        <NumberField label="Atomic mass (amu)" value={massVal}
          onChange={v => { setMassVal(v); setResult(null) }} placeholder="e.g. 4.002602" />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          disabled={!zVal.trim() || !aVal.trim() || !massVal.trim()}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        {(zVal || aVal || massVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Mass Defect (Δm)', value: result.massDefect.toFixed(6), unit: 'amu' },
            { label: 'Total Binding Energy', value: fmt4(result.totalBE), unit: 'MeV' },
            { label: 'BE per Nucleon', value: result.bePerNucleon.toFixed(3), unit: 'MeV/nucleon' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-1 p-4 rounded-sm border"
              style={{
                borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))',
                background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))',
              }}>
              <span className="font-sans text-xs text-secondary">{item.label}</span>
              <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                {item.value}
              </span>
              <span className="font-mono text-xs text-secondary">{item.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

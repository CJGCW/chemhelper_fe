import { useState } from 'react'
import { solubilityWithCommonIon, kspToSolubility } from '../../chem/solubility'
import { KSP_TABLE } from '../../data/kspValues'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

function buildWorkedExample() {
  const entry = KSP_TABLE.find(e => e.formula === 'AgCl')!
  const r = solubilityWithCommonIon(entry.Ksp, entry.cation.count, entry.anion.count, {
    concentration: 0.10,
    isCation: false,
  })
  const pure = kspToSolubility(entry.Ksp, entry.cation.count, entry.anion.count)
  return {
    scenario: `Calculate the molar solubility of AgCl in 0.10 M NaCl solution. (Ksp = 1.8×10⁻¹⁰)`,
    steps: r.steps,
    result: `s = ${r.solubility.toExponential(3)} M  (vs. ${pure.solubility.toExponential(3)} M in pure water)`,
  }
}

export default function CommonIonTool() {
  const [selectedSalt, setSelectedSalt] = useState(KSP_TABLE.find(e => e.formula === 'AgCl') ?? KSP_TABLE[0])
  const [concStr,      setConcStr]      = useState('0.10')
  const [isCation,     setIsCation]     = useState(false)
  const [steps,        setSteps]        = useState<string[]>([])
  const [result,       setResult]       = useState<{ withCommonIon: number; pure: number } | null>(null)
  const [error,        setError]        = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() { setSteps([]); setResult(null); setError(null) }

  function handleCalculate() {
    reset()
    const C0 = parseFloat(concStr)
    if (!isFinite(C0) || C0 <= 0) { setError('Enter a valid concentration.'); return }

    try {
      const { Ksp, cation, anion } = selectedSalt
      const r = solubilityWithCommonIon(Ksp, cation.count, anion.count, { concentration: C0, isCation })
      const pure = kspToSolubility(Ksp, cation.count, anion.count)
      setSteps(r.steps)
      setResult({ withCommonIon: r.solubility, pure: pure.solubility })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  const ionLabel = isCation ? selectedSalt.cation.formula : selectedSalt.anion.formula

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Select Salt</label>
        <select
          value={selectedSalt.formula}
          onChange={e => {
            const entry = KSP_TABLE.find(x => x.formula === e.target.value)
            if (entry) { setSelectedSalt(entry); reset() }
          }}
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none"
        >
          {KSP_TABLE.map(e => (
            <option key={e.formula} value={e.formula}>
              {e.formula} — Ksp = {e.Ksp.toExponential(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Common ion selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Common Ion</label>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsCation(false); reset() }}
            className="px-3 py-1.5 rounded-sm font-mono text-sm border transition-colors"
            style={!isCation ? {
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            } : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-secondary))' }}
          >
            {selectedSalt.anion.formula} (anion)
          </button>
          <button
            onClick={() => { setIsCation(true); reset() }}
            className="px-3 py-1.5 rounded-sm font-mono text-sm border transition-colors"
            style={isCation ? {
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            } : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-secondary))' }}
          >
            {selectedSalt.cation.formula} (cation)
          </button>
        </div>
      </div>

      <NumberField
        label={`[${ionLabel}] from added salt`}
        value={concStr}
        onChange={v => { setConcStr(v); reset() }}
        unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
        placeholder="0.10"
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
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-sm border bg-raised flex flex-col gap-1"
            style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' }}>
            <p className="font-sans text-sm text-secondary">Solubility with common ion [{ionLabel}] = {concStr} M:</p>
            <p className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {result.withCommonIon.toExponential(3)} M
            </p>
          </div>
          <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-1">
            <p className="font-sans text-sm text-secondary">Solubility in pure water (for comparison):</p>
            <p className="font-mono text-base text-primary">{result.pure.toExponential(3)} M</p>
          </div>
          <p className="font-sans text-xs text-secondary">
            Reduction factor: {(result.pure / result.withCommonIon).toFixed(0)}× less soluble
            with the common ion present.
          </p>
        </div>
      )}
    </div>
  )
}

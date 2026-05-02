import { useState } from 'react'
import { spontaneityAnalysis, calcDeltaG_method1 } from '../../chem/thermodynamics'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

const CLASS_LABEL: Record<string, string> = {
  always:  'Always spontaneous',
  never:   'Never spontaneous',
  'low-T': 'Spontaneous at low T',
  'high-T':'Spontaneous at high T',
}

const CLASS_COLOR: Record<string, string> = {
  always:  'text-emerald-400',
  never:   'text-red-400',
  'low-T': 'text-amber-400',
  'high-T':'text-amber-400',
}

export default function SpontaneityTool() {
  const [dH, setDH] = useState('')
  const [dS, setDS] = useState('')
  const [T,  setT]  = useState('298')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<ReturnType<typeof spontaneityAnalysis> | null>(null)
  const [deltaGAtT, setDeltaGAtT] = useState<number | null>(null)

  function handleCalculate() {
    const dHval = parseFloat(dH)
    const dSval = parseFloat(dS)
    const Tval  = parseFloat(T)
    if (isNaN(dHval) || isNaN(dSval) || isNaN(Tval) || Tval <= 0) return

    const analysis = spontaneityAnalysis(dHval, dSval)
    const { deltaG } = calcDeltaG_method1(dHval, dSval, Tval)
    setResult(analysis)
    setDeltaGAtT(deltaG)
    setSteps(analysis.steps)
  }

  function generateExample() {
    const analysis = spontaneityAnalysis(178, 160)
    const { deltaG } = calcDeltaG_method1(178, 160, 298)
    return {
      scenario: 'CaCO₃ decomposition: ΔH° = +178 kJ/mol, ΔS° = +160 J/(mol·K), T = 298 K',
      steps: [
        ...analysis.steps,
        `ΔG° at 298 K = ${deltaG.toFixed(2)} kJ/mol`,
      ],
      result: `Classification: ${CLASS_LABEL[analysis.classification]}. Crossover T ≈ ${analysis.crossoverT?.toFixed(0)} K`,
    }
  }

  const stepsState = useStepsPanelState(steps, generateExample)

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <p className="font-sans text-sm text-secondary">
        Enter ΔH° and ΔS° to classify spontaneity and find the crossover temperature.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <NumberField label="ΔH° (kJ/mol)" value={dH} onChange={v => { setDH(v); setResult(null) }} placeholder="-100" unit={<span className="font-mono text-xs text-secondary ml-2">kJ/mol</span>} />
        <NumberField label="ΔS° (J/(mol·K))" value={dS} onChange={v => { setDS(v); setResult(null) }} placeholder="200" unit={<span className="font-mono text-xs text-secondary ml-2">J/(mol·K)</span>} />
        <NumberField label="T (K) for ΔG" value={T} onChange={v => { setT(v); setResult(null) }} placeholder="298" unit={<span className="font-mono text-xs text-secondary ml-2">K</span>} />
      </div>

      <div className="flex items-stretch gap-2">
        <button
          onClick={handleCalculate}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Analyse
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <div className="flex flex-col gap-3">
          <div
            className="p-4 rounded-sm border"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
            }}
          >
            <p className="font-mono text-xs text-secondary mb-1">Classification</p>
            <p className={`font-sans text-lg font-semibold ${CLASS_COLOR[result.classification]}`}>
              {CLASS_LABEL[result.classification]}
            </p>
            <p className="font-sans text-xs text-secondary mt-2">{result.explanation}</p>
          </div>

          {result.crossoverT !== undefined && (
            <div className="p-3 rounded-sm border border-border bg-raised">
              <p className="font-mono text-xs text-secondary">Crossover Temperature (T where ΔG° = 0)</p>
              <p className="font-mono text-xl mt-1" style={{ color: 'var(--c-halogen)' }}>
                T<sub>c</sub> = {result.crossoverT.toFixed(1)} K ({(result.crossoverT - 273.15).toFixed(1)} °C)
              </p>
            </div>
          )}

          {deltaGAtT !== null && (
            <div className="p-3 rounded-sm border border-border bg-raised">
              <p className="font-mono text-xs text-secondary">ΔG° at T = {T} K</p>
              <p className={`font-mono text-xl mt-1 ${deltaGAtT < 0 ? 'text-emerald-400' : deltaGAtT > 0 ? 'text-red-400' : 'text-secondary'}`}>
                {deltaGAtT.toFixed(2)} kJ/mol
              </p>
              <p className="font-sans text-xs text-secondary mt-1">
                {deltaGAtT < 0 ? 'Spontaneous at this temperature.' : deltaGAtT > 0 ? 'Non-spontaneous at this temperature.' : 'System at equilibrium.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

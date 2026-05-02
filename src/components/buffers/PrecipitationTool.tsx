import { useState } from 'react'
import { willPrecipitate } from '../../chem/solubility'
import { KSP_TABLE } from '../../data/kspValues'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { AnimatePresence, motion } from 'framer-motion'

function buildWorkedExample() {
  // Chang Ex 17.10: mix 200 mL 0.0400 M Mg²⁺ + 800 mL 0.200 M NaOH
  // [Mg²⁺] after mixing = 0.0400 × 0.200/1.000 = 0.00800 M
  // [OH⁻] = 0.200 × 0.800/1.000 = 0.160 M
  const r = willPrecipitate({ cation: 0.00800, anion: 0.160 }, 1, 2, 1.8e-11)
  return {
    scenario: `200 mL of 0.0400 M Mg²⁺ is mixed with 800 mL of 0.200 M NaOH. Will Mg(OH)₂ precipitate? Ksp = 1.8×10⁻¹¹.`,
    steps: r.steps,
    result: r.precipitates ? 'Yes, Mg(OH)₂ precipitates (Q > Ksp).' : 'No precipitation (Q < Ksp).',
  }
}

export default function PrecipitationTool() {
  const [selectedSalt, setSelectedSalt] = useState(KSP_TABLE.find(e => e.formula === 'Mg(OH)₂') ?? KSP_TABLE[0])
  const [cationConc,   setCationConc]   = useState('0.008')
  const [anionConc,    setAnionConc]    = useState('0.160')
  const [steps,        setSteps]        = useState<string[]>([])
  const [result,       setResult]       = useState<{ Q: number; precipitates: boolean } | null>(null)
  const [error,        setError]        = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() { setSteps([]); setResult(null); setError(null) }

  function handleCalculate() {
    reset()
    const cat = parseFloat(cationConc)
    const an  = parseFloat(anionConc)

    if (!isFinite(cat) || cat < 0 || !isFinite(an) || an < 0) {
      setError('Enter non-negative ion concentrations.')
      return
    }

    try {
      const { Ksp, cation, anion } = selectedSalt
      const r = willPrecipitate({ cation: cat, anion: an }, cation.count, anion.count, Ksp)
      setSteps(r.steps)
      setResult({ Q: r.Q, precipitates: r.precipitates })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

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
        <p className="font-mono text-xs text-dim">
          Ksp = {selectedSalt.Ksp.toExponential(2)} &nbsp;|&nbsp;
          {selectedSalt.cation.count}{selectedSalt.cation.formula} + {selectedSalt.anion.count}{selectedSalt.anion.formula}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={`[${selectedSalt.cation.formula}]`}
          value={cationConc}
          onChange={v => { setCationConc(v); reset() }}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.001"
        />
        <NumberField
          label={`[${selectedSalt.anion.formula}]`}
          value={anionConc}
          onChange={v => { setAnionConc(v); reset() }}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.001"
        />
      </div>

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
          Check Q vs Ksp
        </button>
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div
            key="precip-result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-sm border flex flex-col gap-3"
            style={{
              borderColor: result.precipitates
                ? 'color-mix(in srgb, #f87171 40%, rgb(var(--color-border)))'
                : 'color-mix(in srgb, #4ade80 40%, rgb(var(--color-border)))',
              background: result.precipitates
                ? 'color-mix(in srgb, #f87171 6%, rgb(var(--color-surface)))'
                : 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-surface)))',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.precipitates ? '🧫' : '✓'}</span>
              <div>
                <p className="font-sans font-semibold text-base"
                  style={{ color: result.precipitates ? '#f87171' : '#4ade80' }}>
                  {result.precipitates ? 'Precipitate forms!' : 'No precipitation'}
                </p>
                <p className="font-sans text-sm text-secondary">
                  {result.precipitates
                    ? `Q = ${result.Q.toExponential(3)} > Ksp = ${selectedSalt.Ksp.toExponential(2)}`
                    : `Q = ${result.Q.toExponential(3)} ≤ Ksp = ${selectedSalt.Ksp.toExponential(2)}`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

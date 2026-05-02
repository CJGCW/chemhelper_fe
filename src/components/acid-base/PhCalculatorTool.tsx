import { useState } from 'react'
import NumberField from '../shared/NumberField'
import PhScale from '../shared/PhScale'
import { strongAcidPh, strongBasePh, weakAcidPh, weakBasePh } from '../../chem/acidBase'
import { WEAK_ACIDS, WEAK_BASES } from '../../data/acidBaseConstants'

type AcidBaseMode = 'strong-acid' | 'strong-base' | 'weak-acid' | 'weak-base'

export default function PhCalculatorTool() {
  const [mode, setMode] = useState<AcidBaseMode>('strong-acid')
  const [concentration, setConcentration] = useState('')
  const [kaInput, setKaInput] = useState('')
  const [kbInput, setKbInput] = useState('')
  const [selectedWeakAcid, setSelectedWeakAcid] = useState<string>('')
  const [selectedWeakBase, setSelectedWeakBase] = useState<string>('')
  const [result, setResult] = useState<{ pH: number; steps: string[] } | null>(null)
  const [steps, setSteps] = useState<string[]>([])
  const [stepsOpen, setStepsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setResult(null)
    setSteps([])
    setError(null)
  }

  function handleCalculate() {
    setError(null)
    const C = parseFloat(concentration)
    if (!isFinite(C) || C <= 0) { setError('Enter a valid positive concentration.'); return }

    try {
      if (mode === 'strong-acid') {
        const res = strongAcidPh(C, 1)
        setResult({ pH: res.pH, steps: res.steps })
        setSteps(res.steps)
      } else if (mode === 'strong-base') {
        const res = strongBasePh(C, 1)
        setResult({ pH: res.pH, steps: res.steps })
        setSteps(res.steps)
      } else if (mode === 'weak-acid') {
        let Ka = parseFloat(kaInput)
        if (selectedWeakAcid) {
          const found = WEAK_ACIDS.find(a => a.formula === selectedWeakAcid)
          if (found) Ka = found.Ka
        }
        if (!isFinite(Ka) || Ka <= 0) { setError('Enter a valid Ka value.'); return }
        const res = weakAcidPh(C, Ka)
        setResult({ pH: res.pH, steps: res.steps })
        setSteps(res.steps)
      } else {
        let Kb = parseFloat(kbInput)
        if (selectedWeakBase) {
          const found = WEAK_BASES.find(b => b.formula === selectedWeakBase)
          if (found) Kb = found.Kb
        }
        if (!isFinite(Kb) || Kb <= 0) { setError('Enter a valid Kb value.'); return }
        const res = weakBasePh(C, Kb)
        setResult({ pH: res.pH, steps: res.steps })
        setSteps(res.steps)
      }
    } catch (e) {
      setError('Calculation error. Check inputs.')
    }
  }

  const MODES: { id: AcidBaseMode; label: string }[] = [
    { id: 'strong-acid', label: 'Strong Acid' },
    { id: 'strong-base', label: 'Strong Base' },
    { id: 'weak-acid',   label: 'Weak Acid'   },
    { id: 'weak-base',   label: 'Weak Base'   },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Mode selector */}
      <div className="flex gap-1 flex-wrap">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); reset() }}
            className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
            style={{
              color: mode === m.id ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
              background: mode === m.id ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'transparent',
              border: mode === m.id ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid transparent',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <NumberField
          label="Concentration (M)"
          value={concentration}
          onChange={v => { setConcentration(v); reset() }}
          placeholder="e.g. 0.10"
          unit="M"
        />

        {mode === 'weak-acid' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-secondary">Select from table (optional)</label>
              <select
                value={selectedWeakAcid}
                onChange={e => { setSelectedWeakAcid(e.target.value); setKaInput(''); reset() }}
                className="font-mono text-sm px-3 py-1.5 rounded-sm border border-border bg-raised text-primary focus:outline-none focus:border-accent/40"
              >
                <option value="">-- Enter Ka manually --</option>
                {WEAK_ACIDS.map(a => (
                  <option key={a.formula} value={a.formula}>
                    {a.formula} — {a.name} (Ka = {a.Ka.toExponential(1)})
                  </option>
                ))}
              </select>
            </div>
            {!selectedWeakAcid && (
              <NumberField
                label="Ka"
                value={kaInput}
                onChange={v => { setKaInput(v); reset() }}
                placeholder="e.g. 1.8e-5"
              />
            )}
          </>
        )}

        {mode === 'weak-base' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-secondary">Select from table (optional)</label>
              <select
                value={selectedWeakBase}
                onChange={e => { setSelectedWeakBase(e.target.value); setKbInput(''); reset() }}
                className="font-mono text-sm px-3 py-1.5 rounded-sm border border-border bg-raised text-primary focus:outline-none focus:border-accent/40"
              >
                <option value="">-- Enter Kb manually --</option>
                {WEAK_BASES.map(b => (
                  <option key={b.formula} value={b.formula}>
                    {b.formula} — {b.name} (Kb = {b.Kb.toExponential(1)})
                  </option>
                ))}
              </select>
            </div>
            {!selectedWeakBase && (
              <NumberField
                label="Kb"
                value={kbInput}
                onChange={v => { setKbInput(v); reset() }}
                placeholder="e.g. 1.8e-5"
              />
            )}
          </>
        )}
      </div>

      {/* Calculate + Steps buttons */}
      <div className="flex items-stretch gap-2">
        <button
          onClick={handleCalculate}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Calculate pH
        </button>
        {steps.length > 0 && (
          <button
            onClick={() => setStepsOpen(o => !o)}
            className="px-4 py-2 rounded-sm font-sans text-sm font-medium border border-border text-secondary hover:text-primary transition-colors"
          >
            {stepsOpen ? 'Hide Steps' : 'Show Steps'}
          </button>
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {/* Steps panel */}
      {stepsOpen && steps.length > 0 && (
        <div className="flex flex-col gap-1 p-3 rounded-sm border border-border text-sm font-mono"
          style={{ background: 'rgb(var(--color-surface))' }}>
          {steps.map((s, i) => (
            <p key={i} className="text-secondary text-xs leading-relaxed">{s}</p>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border"
          style={{ background: 'rgb(var(--color-raised))' }}>
          <div className="text-center">
            <p className="font-mono text-4xl font-bold" style={{ color: 'var(--c-halogen)' }}>
              {result.pH.toFixed(2)}
            </p>
            <p className="font-mono text-sm text-secondary mt-1">pH</p>
          </div>
          <PhScale pH={result.pH} />
          <div className="font-mono text-xs text-secondary text-center">
            pOH = {(14 - result.pH).toFixed(2)} &nbsp;|&nbsp;
            [H⁺] = {Math.pow(10, -result.pH).toExponential(2)} M &nbsp;|&nbsp;
            [OH⁻] = {Math.pow(10, -(14 - result.pH)).toExponential(2)} M
          </div>
        </div>
      )}
    </div>
  )
}

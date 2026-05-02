import { useState } from 'react'
import NumberField from '../shared/NumberField'
import PhScale from '../shared/PhScale'
import ICETable from '../shared/ICETable'
import { weakBasePh } from '../../chem/acidBase'
import { solveICETable } from '../../chem/equilibrium'
import { WEAK_BASES } from '../../data/acidBaseConstants'

export default function WeakBaseTool() {
  const [concentration, setConcentration] = useState('')
  const [kbInput, setKbInput] = useState('')
  const [selectedBase, setSelectedBase] = useState<string>('')
  const [result, setResult] = useState<{
    pH: number; OH: number; percentDissociation: number
    approximationValid: boolean; steps: string[]
    iceRows: import('../../chem/equilibrium').ICERow[]
  } | null>(null)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCalculate() {
    setError(null)
    const C = parseFloat(concentration)
    if (!isFinite(C) || C <= 0) { setError('Enter a valid positive concentration.'); return }

    let Kb = parseFloat(kbInput)
    if (selectedBase) {
      const found = WEAK_BASES.find(b => b.formula === selectedBase)
      if (found) Kb = found.Kb
    }
    if (!isFinite(Kb) || Kb <= 0) { setError('Enter a valid Kb value.'); return }

    try {
      const res = weakBasePh(C, Kb)

      const iceResult = solveICETable({
        reactants: [{ formula: 'B', coefficient: 1, state: 'aq' }],
        products:  [{ formula: 'BH⁺', coefficient: 1, state: 'aq' }, { formula: 'OH⁻', coefficient: 1, state: 'aq' }],
        initial:   { 'B': C, 'BH⁺': 0, 'OH⁻': 0 },
        K: Kb, kType: 'Kc',
      })

      setResult({ ...res, iceRows: iceResult.rows })
    } catch {
      setError('Calculation error. Check inputs.')
    }
  }

  function resetResult() {
    setResult(null)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-3">
        <NumberField
          label="Concentration (M)"
          value={concentration}
          onChange={v => { setConcentration(v); resetResult() }}
          placeholder="e.g. 0.10"
          unit="M"
        />
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-secondary">Select weak base (optional)</label>
          <select
            value={selectedBase}
            onChange={e => { setSelectedBase(e.target.value); setKbInput(''); resetResult() }}
            className="font-mono text-sm px-3 py-1.5 rounded-sm border border-border bg-raised text-primary focus:outline-none focus:border-accent/40"
          >
            <option value="">-- Enter Kb manually --</option>
            {WEAK_BASES.map(b => (
              <option key={b.formula} value={b.formula}>
                {b.formula} — Kb = {b.Kb.toExponential(1)}
              </option>
            ))}
          </select>
        </div>
        {!selectedBase && (
          <NumberField
            label="Kb"
            value={kbInput}
            onChange={v => { setKbInput(v); resetResult() }}
            placeholder="e.g. 1.8e-5"
          />
        )}
      </div>

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
        {result && (
          <button
            onClick={() => setStepsOpen(o => !o)}
            className="px-4 py-2 rounded-sm font-sans text-sm font-medium border border-border text-secondary hover:text-primary transition-colors"
          >
            {stepsOpen ? 'Hide Steps' : 'Show Steps'}
          </button>
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {stepsOpen && result && (
        <div className="flex flex-col gap-1 p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          {result.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary leading-relaxed">{s}</p>
          ))}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
          <div className="text-center">
            <p className="font-mono text-4xl font-bold" style={{ color: 'var(--c-halogen)' }}>
              {result.pH.toFixed(2)}
            </p>
            <p className="font-mono text-sm text-secondary mt-1">pH</p>
          </div>

          <PhScale pH={result.pH} />

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-2 rounded-sm border border-border text-center" style={{ background: 'rgb(var(--color-surface))' }}>
              <p className="text-primary font-semibold">{result.OH.toExponential(2)} M</p>
              <p className="text-secondary">[OH⁻]</p>
            </div>
            <div className="p-2 rounded-sm border border-border text-center" style={{ background: 'rgb(var(--color-surface))' }}>
              <p className="text-primary font-semibold">{result.percentDissociation.toFixed(2)}%</p>
              <p className="text-secondary">% ionization</p>
            </div>
          </div>

          <div>
            <p className="font-mono text-xs text-secondary mb-2">ICE Table</p>
            <ICETable rows={result.iceRows} />
          </div>

          {!result.approximationValid && (
            <p className="font-mono text-xs text-yellow-400">
              ⚠ 5% approximation failed — exact ICE table solution used.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

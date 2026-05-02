import { useState } from 'react'
import { THERMO_TABLE } from '../../data/thermoData'
import { calcDeltaS, type ThermochemSpecies } from '../../chem/thermodynamics'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

interface SpeciesRow extends ThermochemSpecies {
  key: number
}

let _key = 0
function newRow(formula: string, state: string, coefficient: number): SpeciesRow {
  return { key: _key++, formula, state, coefficient }
}

function defaultProducts(): SpeciesRow[] {
  return [newRow('CaO', 's', 1), newRow('CO₂', 'g', 1)]
}
function defaultReactants(): SpeciesRow[] {
  return [newRow('CaCO₃', 's', 1)]
}

// Unique formula+state options for dropdown
const OPTIONS = Array.from(
  new Map(THERMO_TABLE.map(e => [`${e.formula}(${e.state})`, e])).values()
).sort((a, b) => a.formula.localeCompare(b.formula))

function SpeciesSelector({
  rows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: SpeciesRow[]
  onChange: (idx: number, field: 'formula' | 'state' | 'coefficient', val: string | number) => void
  onAdd: () => void
  onRemove: (idx: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, idx) => {
        const entry = THERMO_TABLE.find(e => e.formula === row.formula && e.state === row.state)
        return (
          <div key={row.key} className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              inputMode="decimal"
              value={String(row.coefficient)}
              onChange={e => onChange(idx, 'coefficient', parseFloat(e.target.value) || 1)}
              className="w-14 font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5 text-primary focus:outline-none focus:border-accent/40"
            />
            <select
              value={`${row.formula}(${row.state})`}
              onChange={e => {
                const found = OPTIONS.find(o => `${o.formula}(${o.state})` === e.target.value)
                if (found) {
                  onChange(idx, 'formula', found.formula)
                  onChange(idx, 'state', found.state)
                }
              }}
              className="flex-1 min-w-[180px] font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5 text-primary focus:outline-none focus:border-accent/40"
            >
              {OPTIONS.map(o => (
                <option key={`${o.formula}(${o.state})`} value={`${o.formula}(${o.state})`}>
                  {o.formula}({o.state}) — {o.name}
                </option>
              ))}
            </select>
            {entry && (
              <span className="font-mono text-xs text-secondary shrink-0">
                S° = {entry.S} J/(mol·K)
              </span>
            )}
            {rows.length > 1 && (
              <button
                onClick={() => onRemove(idx)}
                className="font-mono text-xs text-dim hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
      <button
        onClick={onAdd}
        className="self-start font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
      >
        + Add species
      </button>
    </div>
  )
}

export default function EntropyTool() {
  const [products, setProducts]   = useState<SpeciesRow[]>(defaultProducts)
  const [reactants, setReactants] = useState<SpeciesRow[]>(defaultReactants)
  const [steps, setSteps]         = useState<string[]>([])
  const [result, setResult]       = useState<number | null>(null)
  const [error, setError]         = useState('')

  function updateRows(
    rows: SpeciesRow[],
    setRows: (r: SpeciesRow[]) => void,
    idx: number,
    field: 'formula' | 'state' | 'coefficient',
    val: string | number,
  ) {
    const next = rows.map((r, i) => i === idx ? { ...r, [field]: val } : r)
    setRows(next)
    setSteps([])
    setResult(null)
    setError('')
  }

  function addRow(rows: SpeciesRow[], setRows: (r: SpeciesRow[]) => void) {
    setRows([...rows, newRow('H₂O', 'l', 1)])
    setSteps([])
    setResult(null)
  }

  function removeRow(rows: SpeciesRow[], setRows: (r: SpeciesRow[]) => void, idx: number) {
    setRows(rows.filter((_, i) => i !== idx))
    setSteps([])
    setResult(null)
  }

  function handleCalculate() {
    try {
      const { deltaS, steps: s } = calcDeltaS(products, reactants)
      setSteps(s)
      setResult(deltaS)
      setError('')
    } catch (e) {
      setError(String(e))
    }
  }

  function generateExample() {
    const { deltaS, steps: s } = calcDeltaS(
      [{ formula: 'CaO', state: 's', coefficient: 1 }, { formula: 'CO₂', state: 'g', coefficient: 1 }],
      [{ formula: 'CaCO₃', state: 's', coefficient: 1 }],
    )
    return {
      scenario: 'CaCO₃(s) → CaO(s) + CO₂(g) — Calculate ΔS°rxn.',
      steps: s,
      result: `ΔS°rxn = ${deltaS.toFixed(2)} J/(mol·K)`,
    }
  }

  const stepsState = useStepsPanelState(steps, generateExample)

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <p className="font-sans text-sm text-secondary">
        Build a balanced equation and calculate ΔS°rxn from standard molar entropy values.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs tracking-widest text-secondary uppercase">Products</span>
          <SpeciesSelector
            rows={products}
            onChange={(i, f, v) => updateRows(products, setProducts, i, f, v)}
            onAdd={() => addRow(products, setProducts)}
            onRemove={i => removeRow(products, setProducts, i)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs tracking-widest text-secondary uppercase">Reactants</span>
          <SpeciesSelector
            rows={reactants}
            onChange={(i, f, v) => updateRows(reactants, setReactants, i, f, v)}
            onAdd={() => addRow(reactants, setReactants)}
            onRemove={i => removeRow(reactants, setReactants, i)}
          />
        </div>
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
          Calculate ΔS°
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {error && <p className="font-mono text-sm text-red-400">{error}</p>}

      {result !== null && (
        <div
          className="p-4 rounded-sm border"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
          }}
        >
          <p className="font-mono text-sm text-secondary">ΔS°rxn</p>
          <p className="font-mono text-2xl font-semibold mt-1" style={{ color: 'var(--c-halogen)' }}>
            {result.toFixed(2)} J/(mol·K)
          </p>
          <p className="font-sans text-xs text-secondary mt-2">
            {result > 0 ? 'Positive ΔS° — entropy increases (more disorder).' : result < 0 ? 'Negative ΔS° — entropy decreases (less disorder).' : 'ΔS° = 0.'}
          </p>
        </div>
      )}
    </div>
  )
}

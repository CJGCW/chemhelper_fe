import { useState } from 'react'
import { THERMO_TABLE } from '../../data/thermoData'
import { calcDeltaG_method1, calcDeltaG_method2, type ThermochemSpecies } from '../../chem/thermodynamics'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

type Method = '1' | '2' | '3'

interface SpeciesRow extends ThermochemSpecies { key: number }
let _key = 0
function newRow(formula: string, state: string, coefficient: number): SpeciesRow {
  return { key: _key++, formula, state, coefficient }
}

const OPTIONS = Array.from(
  new Map(THERMO_TABLE.map(e => [`${e.formula}(${e.state})`, e])).values()
).sort((a, b) => a.formula.localeCompare(b.formula))

const F = 96485  // Faraday constant C/mol

export default function GibbsTool() {
  const [method, setMethod] = useState<Method>('1')

  // Method 1 inputs
  const [dH, setDH] = useState('')
  const [dS, setDS] = useState('')
  const [T,  setT]  = useState('298')

  // Method 2 inputs
  const [products, setProducts]   = useState<SpeciesRow[]>([newRow('NH₃', 'g', 2)])
  const [reactants, setReactants] = useState<SpeciesRow[]>([newRow('N₂', 'g', 1), newRow('H₂', 'g', 3)])

  // Method 3 inputs
  const [ecell, setEcell] = useState('')
  const [n, setN]         = useState('')

  const [steps, setSteps]   = useState<string[]>([])
  const [result, setResult] = useState<number | null>(null)
  const [error, setError]   = useState('')

  function clearResult() { setResult(null); setSteps([]); setError('') }

  function handleCalculate() {
    try {
      if (method === '1') {
        const dHv = parseFloat(dH), dSv = parseFloat(dS), Tv = parseFloat(T)
        if (isNaN(dHv) || isNaN(dSv) || isNaN(Tv)) return
        const { deltaG, steps: s } = calcDeltaG_method1(dHv, dSv, Tv)
        setResult(deltaG); setSteps(s)
      } else if (method === '2') {
        const { deltaG, steps: s } = calcDeltaG_method2(products, reactants)
        setResult(deltaG); setSteps(s)
      } else {
        const ev = parseFloat(ecell), nv = parseFloat(n)
        if (isNaN(ev) || isNaN(nv) || nv <= 0) return
        const deltaG = -(nv * F * ev) / 1000
        const s = [
          'ΔG° = −nFE°cell',
          `n = ${nv} mol e⁻,  F = 96 485 C/mol,  E°cell = ${ev} V`,
          `ΔG° = −(${nv} × 96485 × ${ev}) / 1000`,
          `ΔG° = ${deltaG.toFixed(2)} kJ/mol`,
        ]
        setResult(deltaG); setSteps(s)
      }
      setError('')
    } catch (e) {
      setError(String(e))
    }
  }

  function generateExample() {
    const { deltaG, steps: s } = calcDeltaG_method1(-110.5, -90, 298)
    return {
      scenario: 'Method 1: ΔH° = −110.5 kJ/mol, ΔS° = −90 J/(mol·K), T = 298 K',
      steps: s,
      result: `ΔG° = ${deltaG.toFixed(2)} kJ/mol`,
    }
  }

  const stepsState = useStepsPanelState(steps, generateExample)

  function updateRows(
    rows: SpeciesRow[], setRows: (r: SpeciesRow[]) => void,
    idx: number, field: 'formula' | 'state' | 'coefficient', val: string | number,
  ) {
    setRows(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))
    clearResult()
  }

  const METHODS: { id: Method; label: string }[] = [
    { id: '1', label: 'Method 1: ΔH° − TΔS°' },
    { id: '2', label: 'Method 2: ΔG°f values' },
    { id: '3', label: 'Method 3: −nFE°' },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      {/* Method selector */}
      <div className="flex gap-2 flex-wrap">
        {METHODS.map(m => (
          <button
            key={m.id}
            onClick={() => { setMethod(m.id); clearResult() }}
            className="px-3 py-1.5 rounded-full font-sans text-sm border transition-all"
            style={method === m.id ? {
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            } : {
              borderColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-secondary))',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Method 1 */}
      {method === '1' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField label="ΔH° (kJ/mol)" value={dH} onChange={v => { setDH(v); clearResult() }} placeholder="-110.5" unit={<span className="font-mono text-xs text-secondary ml-2">kJ/mol</span>} />
          <NumberField label="ΔS° (J/(mol·K))" value={dS} onChange={v => { setDS(v); clearResult() }} placeholder="-90" unit={<span className="font-mono text-xs text-secondary ml-2">J/(mol·K)</span>} />
          <NumberField label="T (K)" value={T} onChange={v => { setT(v); clearResult() }} placeholder="298" unit={<span className="font-mono text-xs text-secondary ml-2">K</span>} />
        </div>
      )}

      {/* Method 2 */}
      {method === '2' && (
        <div className="flex flex-col gap-4">
          {[
            { label: 'Products', rows: products, setRows: setProducts },
            { label: 'Reactants', rows: reactants, setRows: setReactants },
          ].map(({ label, rows, setRows }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="font-mono text-xs tracking-widest text-secondary uppercase">{label}</span>
              {rows.map((row, idx) => {
                const entry = THERMO_TABLE.find(e => e.formula === row.formula && e.state === row.state)
                return (
                  <div key={row.key} className="flex items-center gap-2 flex-wrap">
                    <input type="text" inputMode="decimal" value={String(row.coefficient)}
                      onChange={e => updateRows(rows, setRows, idx, 'coefficient', parseFloat(e.target.value) || 1)}
                      className="w-14 font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5 text-primary focus:outline-none" />
                    <select value={`${row.formula}(${row.state})`}
                      onChange={e => {
                        const found = OPTIONS.find(o => `${o.formula}(${o.state})` === e.target.value)
                        if (found) { updateRows(rows, setRows, idx, 'formula', found.formula); updateRows(rows, setRows, idx, 'state', found.state) }
                      }}
                      className="flex-1 min-w-[160px] font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5 text-primary focus:outline-none">
                      {OPTIONS.map(o => (
                        <option key={`${o.formula}(${o.state})`} value={`${o.formula}(${o.state})`}>
                          {o.formula}({o.state}) — ΔG°f={o.deltaGf}
                        </option>
                      ))}
                    </select>
                    {entry && <span className="font-mono text-xs text-secondary">ΔG°f={entry.deltaGf} kJ/mol</span>}
                  </div>
                )
              })}
              <button onClick={() => { setRows([...rows, newRow('CO₂', 'g', 1)]); clearResult() }}
                className="self-start font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors">
                + Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Method 3 */}
      {method === '3' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField label="E°cell (V)" value={ecell} onChange={v => { setEcell(v); clearResult() }} placeholder="1.10" unit={<span className="font-mono text-xs text-secondary ml-2">V</span>} />
          <NumberField label="n (mol e⁻)" value={n} onChange={v => { setN(v); clearResult() }} placeholder="2" unit={<span className="font-mono text-xs text-secondary ml-2">mol e⁻</span>} />
        </div>
      )}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}>
          Calculate ΔG°
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />
      {error && <p className="font-mono text-sm text-red-400">{error}</p>}

      {result !== null && (
        <div className="p-4 rounded-sm border"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
          }}>
          <p className="font-mono text-xs text-secondary">ΔG°</p>
          <p className="font-mono text-2xl font-semibold mt-1" style={{ color: 'var(--c-halogen)' }}>
            {result.toFixed(2)} kJ/mol
          </p>
          <p className={`font-sans text-xs mt-2 ${result < 0 ? 'text-emerald-400' : result > 0 ? 'text-red-400' : 'text-secondary'}`}>
            {result < 0 ? 'Spontaneous (product-favored)' : result > 0 ? 'Non-spontaneous (reactant-favored)' : 'System at equilibrium'}
          </p>
        </div>
      )}
    </div>
  )
}

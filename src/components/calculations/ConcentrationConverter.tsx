import { useState } from 'react'
import WorkedExample, { pick, sig } from './WorkedExample'
import { sanitize, hasValue } from '../../utils/calcHelpers'

type SourceUnit = 'mol/L' | '% (w/w)' | 'ppm' | 'mol/kg'

interface ConversionResult {
  molarity: number | null
  massPercent: number | null
  ppm: number | null
  molality: number | null
  moleFraction: number | null
}

function toMolarity(value: number, unit: SourceUnit, density: number | null, molarMass: number): number | null {
  if (unit === 'mol/L') return value
  if (unit === '% (w/w)') {
    if (density === null) return null
    return (value / 100 * density * 1000) / molarMass
  }
  if (unit === 'ppm') {
    return value / (molarMass * 1000)
  }
  if (unit === 'mol/kg') {
    if (density === null) return null
    return (value * density * 1000) / (1000 + value * molarMass)
  }
  return null
}

function computeAll(C: number, density: number | null, molarMass: number): ConversionResult {
  const massPercent = density !== null
    ? (C * molarMass * 100) / (density * 1000)
    : null

  const ppm = C * molarMass * 1000

  const molality = density !== null
    ? (C * 1000) / (density * 1000 - C * molarMass)
    : null

  const moleFraction = density !== null
    ? C / (C + (density * 1000 - C * molarMass) / 18.015)
    : null

  return { molarity: C, massPercent, ppm, molality, moleFraction }
}

interface ResultRowProps {
  label: string
  value: number | null
  unit: string
  accentColor: string
  note?: string
}

function ResultRow({ label, value, unit, accentColor, note }: ResultRowProps) {
  return (
    <div
      className="flex items-center justify-between rounded-sm px-4 py-3 border"
      style={{
        background: `color-mix(in srgb, ${accentColor} 5%, rgb(var(--color-surface)))`,
        borderColor: `color-mix(in srgb, ${accentColor} 25%, rgb(var(--color-border)))`,
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-sans text-sm font-medium text-primary">{label}</span>
        {note && <span className="font-mono text-xs text-secondary">{note}</span>}
      </div>
      {value !== null ? (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold" style={{ color: accentColor }}>
            {value < 0.001
              ? value.toExponential(3)
              : value >= 10000
              ? value.toExponential(3)
              : value.toPrecision(4)}
          </span>
          <span className="font-mono text-xs text-secondary">{unit}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-muted">—</span>
          <span className="font-mono text-xs text-secondary">needs ρ</span>
        </div>
      )}
    </div>
  )
}

interface FormulaBoxProps {
  title: string
  formula: string
}

function FormulaBox({ title, formula }: FormulaBoxProps) {
  return (
    <div className="rounded-sm border border-border p-3">
      <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1">{title}</p>
      <p className="font-mono text-xs text-secondary">{formula}</p>
    </div>
  )
}

const CONC_SOLUTIONS = [
  { name: 'HCl (conc.)',     C: 12.1,  rho: 1.19, M: 36.46 },
  { name: 'H₂SO₄ (conc.)',  C: 18.0,  rho: 1.84, M: 98.08 },
  { name: 'HNO₃ (conc.)',   C: 16.0,  rho: 1.51, M: 63.01 },
  { name: 'acetic acid',     C: 17.4,  rho: 1.05, M: 60.05 },
  { name: 'NH₃ (aq)',        C: 14.8,  rho: 0.90, M: 17.03 },
  { name: 'NaOH (10 M)',     C: 10.0,  rho: 1.43, M: 40.00 },
  { name: 'HCl (3 M)',       C:  3.0,  rho: 1.05, M: 36.46 },
]

function generateConcExample() {
  const s = pick(CONC_SOLUTIONS)
  const massPerL = s.C * s.M
  const rhoGperL = s.rho * 1000
  const wPct = (massPerL / rhoGperL) * 100
  const mSolvent_kg = (rhoGperL - massPerL) / 1000
  const molal = s.C / (s.rho - s.C * s.M / 1000)
  const ppm = wPct * 10000
  return {
    scenario: `Convert ${s.C} mol/L ${s.name} (ρ = ${s.rho} g/mL, M = ${s.M} g/mol) to w%, ppm, and molality.`,
    steps: [
      `Mass of solute per litre: ${s.C} mol × ${s.M} g/mol = ${sig(massPerL, 4)} g`,
      `Total mass of 1 L solution: ${s.rho} g/mL × 1000 mL = ${rhoGperL} g`,
      `w% = ${sig(massPerL, 4)} g / ${rhoGperL} g × 100 = ${sig(wPct, 4)}%`,
      `ppm = w% × 10 000 = ${sig(ppm, 4)} ppm`,
      `Mass of solvent per litre: ${rhoGperL} − ${sig(massPerL, 4)} = ${sig(rhoGperL - massPerL, 4)} g = ${sig(mSolvent_kg, 4)} kg`,
      `Molality b = ${s.C} mol ÷ ${sig(mSolvent_kg, 4)} kg = ${sig(molal, 4)} mol/kg`,
    ],
    result: `w% = ${sig(wPct, 4)}%   ppm = ${sig(ppm, 4)}   b = ${sig(molal, 4)} mol/kg`,
  }
}

export default function ConcentrationConverter() {
  const [sourceValue, setSourceValue] = useState('')
  const [sourceUnit, setSourceUnit] = useState<SourceUnit>('mol/L')
  const [molarMassValue, setMolarMassValue] = useState('')
  const [densityValue, setDensityValue] = useState('')

  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const SOURCE_UNITS: SourceUnit[] = ['mol/L', '% (w/w)', 'ppm', 'mol/kg']

  const requiresDensity = sourceUnit === '% (w/w)' || sourceUnit === 'mol/kg'

  function convert() {
    setError(null)
    setResult(null)

    if (!hasValue(sourceValue)) {
      setError('Enter a source concentration value.')
      return
    }
    if (!hasValue(molarMassValue)) {
      setError('Enter molar mass.')
      return
    }
    if (requiresDensity && !hasValue(densityValue)) {
      setError(`Density is required when converting from ${sourceUnit}.`)
      return
    }

    const val = parseFloat(sourceValue)
    const Mw = parseFloat(molarMassValue)
    const rho = hasValue(densityValue) ? parseFloat(densityValue) : null

    if (val <= 0 || isNaN(val)) { setError('Concentration must be a positive number.'); return }
    if (Mw <= 0 || isNaN(Mw))   { setError('Molar mass must be a positive number.'); return }

    const C = toMolarity(val, sourceUnit, rho, Mw)
    if (C === null) {
      setError('Could not convert to molarity. Check that density is provided.')
      return
    }
    if (C <= 0 || !isFinite(C)) {
      setError('Computed molarity is invalid. Check your inputs.')
      return
    }

    setResult(computeAll(C, rho, Mw))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <WorkedExample generate={generateConcExample} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-primary">
            Source concentration
          </label>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={sourceValue}
              onChange={e => { setSourceValue(sanitize(e.target.value)); setResult(null) }}
              placeholder="e.g. 12.1"
              className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
            <select
              value={sourceUnit}
              onChange={e => { setSourceUnit(e.target.value as SourceUnit); setResult(null) }}
              className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5 text-primary focus:outline-none focus:border-accent/40 cursor-pointer"
            >
              {SOURCE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-primary">
            Molar mass (Mw)
          </label>
          <div className="flex items-stretch gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={molarMassValue}
              onChange={e => { setMolarMassValue(sanitize(e.target.value)); setResult(null) }}
              placeholder="e.g. 36.46"
              className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
            <span className="font-mono text-sm text-secondary px-2 flex items-center">g/mol</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-sans text-sm font-medium text-primary">
              Solution density (ρ)
            </label>
            <span className="font-mono text-xs text-secondary">required for % and mol/kg conversions</span>
          </div>
          <div className="flex items-stretch gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={densityValue}
              onChange={e => { setDensityValue(sanitize(e.target.value)); setResult(null) }}
              placeholder="e.g. 1.19"
              className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
            <span className="font-mono text-sm text-secondary px-2 flex items-center">g/mL</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-secondary text-xs">Solvent</label>
          <div
            className="font-mono text-xs text-secondary px-3 py-2 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-surface))' }}
          >
            Water, 18.015 g/mol
          </div>
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button
          onClick={convert}
          className="w-full py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Convert
        </button>
      </div>

      {result && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase">Equivalent concentrations</p>
          <ResultRow
            label="Molarity"
            value={result.molarity}
            unit="mol/L"
            accentColor="var(--c-halogen)"
          />
          <ResultRow
            label="Mass percent"
            value={result.massPercent}
            unit="% (w/w)"
            accentColor="#4ade80"
          />
          <ResultRow
            label="ppm (mg/L)"
            value={result.ppm}
            unit="mg/L"
            accentColor="#60a5fa"
            note="valid for dilute aqueous solutions (ρ ≈ 1 g/mL)"
          />
          <ResultRow
            label="Molality"
            value={result.molality}
            unit="mol/kg"
            accentColor="#f97316"
          />
          <ResultRow
            label="Mole fraction (solute)"
            value={result.moleFraction}
            unit=""
            accentColor="#c084fc"
          />
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Conversion formulas</p>
        <div className="grid grid-cols-1 gap-2">
          <FormulaBox
            title="% → mol/L"
            formula="C = (w/100 × ρ × 1000) / Mw"
          />
          <FormulaBox
            title="mol/L → %"
            formula="w% = (C × Mw × 100) / (ρ × 1000)"
          />
          <FormulaBox
            title="ppm → mol/L"
            formula="C = ppm / (Mw × 1000)   [1 ppm = 1 mg/L]"
          />
          <FormulaBox
            title="mol/L → ppm"
            formula="ppm = C × Mw × 1000"
          />
          <FormulaBox
            title="mol/L → molality"
            formula="b = C × 1000 / (ρ × 1000 − C × Mw)"
          />
          <FormulaBox
            title="mol/kg → mol/L"
            formula="C = (b × ρ × 1000) / (1000 + b × Mw)"
          />
          <FormulaBox
            title="mol/L → mole fraction"
            formula="χ = C / (C + (ρ×1000 − C×Mw) / 18.015)"
          />
        </div>
      </div>
    </div>
  )
}

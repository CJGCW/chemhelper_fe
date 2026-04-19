import { useState } from 'react'
import ConversionExamples from './DimensionalAnalysis'

type ConvTab = 'converter' | 'dimensional'

// ── Conversion data ───────────────────────────────────────────────────────────

interface UnitDef { symbol: string; toBase: number }

const MASS: Record<string, UnitDef> = {
  g:  { symbol: 'g',  toBase: 1         },
  kg: { symbol: 'kg', toBase: 1000      },
  mg: { symbol: 'mg', toBase: 0.001     },
  lb: { symbol: 'lb', toBase: 453.592   },
  oz: { symbol: 'oz', toBase: 28.3495   },
}

const VOLUME: Record<string, UnitDef> = {
  L:      { symbol: 'L',      toBase: 1          },
  mL:     { symbol: 'mL',     toBase: 0.001      },
  'fl oz': { symbol: 'fl oz', toBase: 0.0295735  },
  gal:    { symbol: 'gal',    toBase: 3.78541     },
  cup:    { symbol: 'cup',    toBase: 0.236588    },
}

const TEMP_UNITS = ['°C', '°F', 'K'] as const
type TempUnit = typeof TEMP_UNITS[number]

export function toCelsius(v: number, from: TempUnit): number {
  if (from === '°C') return v
  if (from === '°F') return (v - 32) * 5 / 9
  return v - 273.15
}

export function fromCelsius(c: number, to: TempUnit): number {
  if (to === '°C') return c
  if (to === '°F') return c * 9 / 5 + 32
  return c + 273.15
}

export function convertTemp(v: number, from: TempUnit, to: TempUnit): number {
  return fromCelsius(toCelsius(v, from), to)
}

export function convertMass(v: number, from: string, to: string): number {
  return (v * MASS[from].toBase) / MASS[to].toBase
}

export function convertVolume(v: number, from: string, to: string): number {
  return (v * VOLUME[from].toBase) / VOLUME[to].toBase
}

// ── Formatting ────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  if (!isFinite(value)) return '—'
  // Show up to 6 significant digits, strip trailing zeros
  const s = parseFloat(value.toPrecision(6)).toString()
  return s
}

// ── Converter card ────────────────────────────────────────────────────────────

const selectCls = `font-mono text-sm bg-raised border border-border rounded-sm px-2 py-2
                   text-primary focus:outline-none focus:border-accent/40 transition-colors cursor-pointer`

function ConverterCard({
  title,
  unitKeys,
  unitLabels,
  defaultUnit,
  convert,
  formulaHint,
}: {
  title: string
  unitKeys: string[]
  unitLabels: Record<string, string>
  defaultUnit: string
  convert: (value: number, from: string, to: string) => number
  formulaHint?: (from: string, to: string) => string
}) {
  const [input, setInput] = useState('')
  const [fromUnit, setFromUnit] = useState(defaultUnit)

  const num = parseFloat(input)
  const hasValue = input.trim() !== '' && !isNaN(num)
  const outputUnits = unitKeys.filter(u => u !== fromUnit)

  return (
    <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">{title}</p>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter value"
          className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                     text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
        />
        <select
          value={fromUnit}
          onChange={e => setFromUnit(e.target.value)}
          className={selectCls}
        >
          {unitKeys.map(u => <option key={u} value={u}>{unitLabels[u]}</option>)}
        </select>
      </div>

      {/* Results */}
      {hasValue ? (
        <div className="flex flex-col divide-y divide-border">
          {outputUnits.map(to => {
            const raw = convert(num, fromUnit, to)
            const display = fmt(raw)
            const hint = formulaHint?.(fromUnit, to)
            return (
              <div key={to} className="flex items-center justify-between py-2.5 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-primary">{unitLabels[to]}</span>
                  {hint && <span className="font-mono text-xs text-secondary">{hint}</span>}
                </div>
                <span className="font-mono text-lg font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {display}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="font-sans text-xs text-dim">Enter a value above to see conversions.</p>
      )}
    </div>
  )
}

// ── Reference table data ──────────────────────────────────────────────────────

const MASS_TABLE = [
  { unit: 'gram',     symbol: 'g',    equiv: 'base unit (SI)' },
  { unit: 'kilogram', symbol: 'kg',   equiv: '1 kg = 1000 g' },
  { unit: 'milligram',symbol: 'mg',   equiv: '1 mg = 0.001 g' },
  { unit: 'pound',    symbol: 'lb',   equiv: '1 lb = 453.592 g' },
  { unit: 'ounce',    symbol: 'oz',   equiv: '1 oz = 28.3495 g' },
]

const VOLUME_TABLE = [
  { unit: 'liter',        symbol: 'L',      equiv: 'base unit' },
  { unit: 'milliliter',   symbol: 'mL',     equiv: '1 mL = 0.001 L' },
  { unit: 'fluid ounce',  symbol: 'fl oz',  equiv: '1 fl oz = 29.5735 mL' },
  { unit: 'gallon',       symbol: 'gal',    equiv: '1 gal = 3.78541 L' },
  { unit: 'cup',          symbol: 'cup',    equiv: '1 cup = 236.588 mL' },
]

const TEMP_TABLE = [
  { from: '°C', to: '°F', formula: '°F = °C × 9/5 + 32' },
  { from: '°F', to: '°C', formula: '°C = (°F − 32) × 5/9' },
  { from: '°C', to: 'K',  formula: 'K = °C + 273.15' },
  { from: 'K',  to: '°C', formula: '°C = K − 273.15' },
  { from: '°F', to: 'K',  formula: 'K = (°F − 32) × 5/9 + 273.15' },
  { from: 'K',  to: '°F', formula: '°F = (K − 273.15) × 9/5 + 32' },
]

const METRIC_PREFIXES = [
  { prefix: 'peta',  symbol: 'P',  power: '10¹⁵', factor: '1 000 000 000 000 000' },
  { prefix: 'tera',  symbol: 'T',  power: '10¹²', factor: '1 000 000 000 000' },
  { prefix: 'giga',  symbol: 'G',  power: '10⁹',  factor: '1 000 000 000' },
  { prefix: 'mega',  symbol: 'M',  power: '10⁶',  factor: '1 000 000' },
  { prefix: 'kilo',  symbol: 'k',  power: '10³',  factor: '1 000' },
  { prefix: 'hecto', symbol: 'h',  power: '10²',  factor: '100' },
  { prefix: 'deca',  symbol: 'da', power: '10¹',  factor: '10' },
  { prefix: null,    symbol: null, power: '10⁰',  factor: '1' },   // base
  { prefix: 'deci',  symbol: 'd',  power: '10⁻¹', factor: '0.1' },
  { prefix: 'centi', symbol: 'c',  power: '10⁻²', factor: '0.01' },
  { prefix: 'milli', symbol: 'm',  power: '10⁻³', factor: '0.001' },
  { prefix: 'micro', symbol: 'µ',  power: '10⁻⁶', factor: '0.000 001' },
  { prefix: 'nano',  symbol: 'n',  power: '10⁻⁹', factor: '0.000 000 001' },
  { prefix: 'pico',  symbol: 'p',  power: '10⁻¹²', factor: '0.000 000 000 001' },
  { prefix: 'femto', symbol: 'f',  power: '10⁻¹⁵', factor: '0.000 000 000 000 001' },
]

// ── Table sub-components ──────────────────────────────────────────────────────

const TH = ({ children }: { children: React.ReactNode }) => (
  <th className="px-3 py-2 text-left font-mono text-xs tracking-widest text-secondary uppercase border-b border-border">
    {children}
  </th>
)

const TD = ({ children, mono, accent }: { children: React.ReactNode; mono?: boolean; accent?: boolean }) => (
  <td className={`px-3 py-2 border-b border-border text-sm ${mono ? 'font-mono' : 'font-sans'}`}
    style={{ color: accent ? 'var(--c-halogen)' : undefined }}>
    {children}
  </td>
)

// ── Main export ───────────────────────────────────────────────────────────────

export default function UnitConversions({ tab = 'converter' }: { tab?: ConvTab }) {
  if (tab === 'dimensional') return <ConversionExamples />

  return (
    <div className="flex flex-col gap-8">

      {/* Converter cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start print:hidden">
        <ConverterCard
          title="Mass"
          unitKeys={Object.keys(MASS)}
          unitLabels={Object.fromEntries(Object.keys(MASS).map(k => [k, MASS[k].symbol]))}
          defaultUnit="g"
          convert={(v, from, to) => (v * MASS[from].toBase) / MASS[to].toBase}
        />
        <ConverterCard
          title="Volume"
          unitKeys={Object.keys(VOLUME)}
          unitLabels={Object.fromEntries(Object.keys(VOLUME).map(k => [k, VOLUME[k].symbol]))}
          defaultUnit="L"
          convert={(v, from, to) => (v * VOLUME[from].toBase) / VOLUME[to].toBase}
        />
        <ConverterCard
          title="Temperature"
          unitKeys={[...TEMP_UNITS]}
          unitLabels={{ '°C': '°C', '°F': '°F', K: 'K' }}
          defaultUnit="°C"
          convert={(v, from, to) => fromCelsius(toCelsius(v, from as TempUnit), to as TempUnit)}
          formulaHint={(from, to) => {
            const f = from as TempUnit, t = to as TempUnit
            if (f === '°C' && t === 'K')  return 'K = °C + 273.15'
            if (f === 'K'  && t === '°C') return '°C = K − 273.15'
            if (f === '°C' && t === '°F') return '°F = °C × 9/5 + 32'
            if (f === '°F' && t === '°C') return '°C = (°F − 32) × 5/9'
            if (f === '°F' && t === 'K')  return 'K = (°F − 32) × 5/9 + 273.15'
            if (f === 'K'  && t === '°F') return '°F = (K − 273.15) × 9/5 + 32'
            return ''
          }}
        />
      </div>

      {/* Reference tables */}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Conversion Reference</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">

          {/* Mass */}
          <div className="rounded-sm border border-border overflow-hidden" style={{ background: '#0e1016' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <TH>Unit</TH><TH>Symbol</TH><TH>Equivalent</TH>
                </tr>
              </thead>
              <tbody>
                {MASS_TABLE.map((r, i) => (
                  <tr key={i} className="hover:bg-raised transition-colors">
                    <TD>{r.unit}</TD>
                    <TD mono accent>{r.symbol}</TD>
                    <TD mono>{r.equiv}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Volume */}
          <div className="rounded-sm border border-border overflow-hidden" style={{ background: '#0e1016' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <TH>Unit</TH><TH>Symbol</TH><TH>Equivalent</TH>
                </tr>
              </thead>
              <tbody>
                {VOLUME_TABLE.map((r, i) => (
                  <tr key={i} className="hover:bg-raised transition-colors">
                    <TD>{r.unit}</TD>
                    <TD mono accent>{r.symbol}</TD>
                    <TD mono>{r.equiv}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Temperature */}
          <div className="rounded-sm border border-border overflow-hidden" style={{ background: '#0e1016' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <TH>From</TH><TH>To</TH><TH>Formula</TH>
                </tr>
              </thead>
              <tbody>
                {TEMP_TABLE.map((r, i) => (
                  <tr key={i} className="hover:bg-raised transition-colors">
                    <TD mono accent>{r.from}</TD>
                    <TD mono accent>{r.to}</TD>
                    <TD mono>{r.formula}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Metric prefixes */}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Metric Prefixes</p>

        <div className="rounded-sm border border-border overflow-hidden" style={{ background: '#0e1016' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <TH>Prefix</TH>
                <TH>Symbol</TH>
                <TH>Power</TH>
                <TH>Factor</TH>
              </tr>
            </thead>
            <tbody>
              {METRIC_PREFIXES.map((r, i) => {
                const isBase = r.prefix === null
                return (
                  <tr key={i}
                    className="transition-colors"
                    style={{
                      background: isBase ? 'color-mix(in srgb, var(--c-halogen) 6%, transparent)' : undefined,
                    }}
                  >
                    <TD>
                      {isBase
                        ? <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>— base unit —</span>
                        : <span className="font-sans text-sm text-primary">{r.prefix}</span>
                      }
                    </TD>
                    <TD mono accent>{r.symbol ?? '—'}</TD>
                    <TD mono>{r.power}</TD>
                    <TD mono>{r.factor}</TD>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

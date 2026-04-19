import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExampleBox from '../calculations/ExampleBox'
import NumberField from '../calculations/NumberField'
import StepsPanel from '../calculations/StepsPanel'
import ResultDisplay from '../calculations/ResultDisplay'
import { sanitize, hasValue } from '../../utils/calcHelpers'
import { buildSigFigBreakdown, formatSigFigs, lowestSigFigs } from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'mcdt' | 'cdt' | 'coffee' | 'bomb'

// ── Constants ─────────────────────────────────────────────────────────────────

const MODES: { id: Mode; label: string; formula: string }[] = [
  { id: 'mcdt',   label: 'q = mcΔT',        formula: 'mcΔT' },
  { id: 'cdt',    label: 'q = CΔT',         formula: 'CΔT'  },
  { id: 'coffee', label: 'Coffee-Cup',       formula: '☕'    },
  { id: 'bomb',   label: 'Bomb Calorimeter', formula: '⚗'    },
]

const SPECIFIC_HEATS = [
  { label: 'Custom',       c: '' },
  { label: 'Water (l)',    c: '4.184' },
  { label: 'Water (s)',    c: '2.09'  },
  { label: 'Water (g)',    c: '2.01'  },
  { label: 'Aluminum',     c: '0.897' },
  { label: 'Copper',       c: '0.385' },
  { label: 'Iron',         c: '0.449' },
  { label: 'Gold',         c: '0.129' },
  { label: 'Silver',       c: '0.235' },
  { label: 'Ethanol',      c: '2.44'  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  const p = n.toPrecision(8)
  if (p.includes('e') || p.includes('E')) {
    const decimals = Math.max(0, 8 - Math.floor(Math.log10(Math.abs(n))) - 1)
    return parseFloat(n.toFixed(decimals)).toString()
  }
  return p.replace(/\.?0+$/, '')
}

function parse(s: string): number { return parseFloat(s) }
function ok(n: number): boolean   { return isFinite(n) && !isNaN(n) }

// ── Shared sub-components ─────────────────────────────────────────────────────

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm px-4 py-3 font-mono text-xs text-secondary"
      style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
      {children}
    </div>
  )
}

function EnergyUnitSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5
                 text-primary focus:outline-none focus:border-accent/40 cursor-pointer">
      <option>J</option>
      <option>kJ</option>
      <option>cal</option>
      <option>kcal</option>
    </select>
  )
}

function CalcButton({ onClick, label = 'Calculate' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="w-full py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
      style={{
        background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
        color: 'var(--c-halogen)',
      }}>
      {label}
    </button>
  )
}

// Convert q to Joules given user-selected unit
function toJoules(value: string, unit: string): number {
  const n = parse(value)
  if (!ok(n)) return NaN
  const factors: Record<string, number> = { J: 1, kJ: 1000, cal: 4.184, kcal: 4184 }
  return n * (factors[unit] ?? 1)
}

function fromJoules(j: number, unit: string): number {
  const factors: Record<string, number> = { J: 1, kJ: 1000, cal: 4.184, kcal: 4184 }
  return j / (factors[unit] ?? 1)
}

// ── q = mcΔT ──────────────────────────────────────────────────────────────────

function McDeltaT() {
  const [qVal, setQVal]   = useState('')
  const [qUnit, setQUnit] = useState('J')
  const [mVal, setMVal]   = useState('')
  const [cVal, setCVal]   = useState('')
  const [cPreset, setCPreset] = useState('Custom')
  const [tiVal, setTiVal] = useState('')
  const [tfVal, setTfVal] = useState('')
  const [dtVal, setDtVal] = useState('')
  const [useTiTf, setUseTiTf] = useState(false)

  const [result, setResult]     = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [resultLabel, setResultLabel] = useState('Result')
  const [steps, setSteps]       = useState<string[]>([])
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null)
  const [error, setError]       = useState<string | null>(null)

  function reset() { setResult(null); setSteps([]); setBreakdown(null); setError(null) }

  function handlePreset(label: string) {
    setCPreset(label)
    const found = SPECIFIC_HEATS.find(s => s.label === label)
    if (found && found.c) setCVal(found.c)
    reset()
  }

  function computeDT(): { dt: number; dtStr: string } | null {
    if (useTiTf) {
      const ti = parse(tiVal), tf = parse(tfVal)
      if (!ok(ti) || !ok(tf)) return null
      return { dt: tf - ti, dtStr: `(${fmtNum(tf)} − ${fmtNum(ti)})` }
    }
    const dt = parse(dtVal)
    if (!ok(dt)) return null
    return { dt, dtStr: fmtNum(dt) }
  }

  function calculate() {
    reset()
    const hasQ  = hasValue(qVal)
    const hasM  = hasValue(mVal)
    const hasC  = hasValue(cVal)
    const hasDT = useTiTf ? (hasValue(tiVal) && hasValue(tfVal)) : hasValue(dtVal)

    const filled = [hasQ, hasM, hasC, hasDT].filter(Boolean).length
    if (filled < 3) { setError('Fill in three of the four values to solve for the fourth.'); return }

    const m    = hasM  ? parse(mVal)  : NaN
    const c    = hasC  ? parse(cVal)  : NaN
    const dtObj = hasDT ? computeDT() : null
    const dt   = dtObj?.dt ?? NaN
    const dtStr = dtObj?.dtStr ?? ''
    const qJ   = hasQ  ? toJoules(qVal, qUnit) : NaN

    if (filled === 4) {
      // Verify mode
      if (!ok(m) || !ok(c) || !ok(dt) || !ok(qJ)) { setError('One or more values are invalid.'); return }
      const expectedJ = m * c * dt
      const expected  = fromJoules(expectedJ, qUnit)
      const sf  = lowestSigFigs([mVal, cVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      setSteps([
        `q = m × c × ΔT`,
        `q = ${fmtNum(m)} g × ${fmtNum(c)} J/(g·°C) × ${dtStr} °C`,
        `q = ${fmtNum(expectedJ)} J = ${fmtNum(expected)} ${qUnit}`,
        `Rounded to ${sf} sf: ${formatSigFigs(expected, sf)} ${qUnit}`,
      ])
      setResult(formatSigFigs(expected, sf))
      setResultUnit(qUnit)
      setResultLabel(`Expected q`)
      return
    }

    if (!hasQ) {
      if (!ok(m) || !ok(c) || !ok(dt)) { setError('Invalid values.'); return }
      const qJ_ = m * c * dt
      const q_  = fromJoules(qJ_, qUnit)
      const sf  = lowestSigFigs([mVal, cVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      setSteps([
        `q = m × c × ΔT`,
        `q = ${fmtNum(m)} g × ${fmtNum(c)} J/(g·°C) × ${dtStr} °C`,
        `q = ${fmtNum(qJ_)} J`,
        qUnit !== 'J' ? `q = ${fmtNum(qJ_)} J ÷ ${qUnit === 'kJ' ? 1000 : qUnit === 'cal' ? 4.184 : 4184} = ${fmtNum(q_)} ${qUnit}` : '',
        `Rounded to ${sf} sf: ${formatSigFigs(q_, sf)} ${qUnit}`,
      ].filter(Boolean))
      setResult(fmtNum(q_))
      setResultUnit(qUnit)
      setResultLabel('Heat (q)')
      setBreakdown(buildSigFigBreakdown([{ label: 'mass', value: mVal }, { label: 'c', value: cVal }], q_, qUnit))
    } else if (!hasM) {
      if (!ok(qJ) || !ok(c) || !ok(dt) || c === 0 || dt === 0) { setError('Invalid values.'); return }
      const m_ = qJ / (c * dt)
      const sf  = lowestSigFigs([qVal, cVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      setSteps([
        `m = q / (c × ΔT)`,
        `m = ${fmtNum(qJ)} J / (${fmtNum(c)} J/(g·°C) × ${dtStr} °C)`,
        `m = ${fmtNum(m_)} g`,
        `Rounded to ${sf} sf: ${formatSigFigs(m_, sf)} g`,
      ])
      setResult(fmtNum(m_))
      setResultUnit('g')
      setResultLabel('Mass (m)')
      setBreakdown(buildSigFigBreakdown([{ label: 'q', value: qVal }, { label: 'c', value: cVal }], m_, 'g'))
    } else if (!hasC) {
      if (!ok(qJ) || !ok(m) || !ok(dt) || m === 0 || dt === 0) { setError('Invalid values.'); return }
      const c_ = qJ / (m * dt)
      const sf  = lowestSigFigs([qVal, mVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      setSteps([
        `c = q / (m × ΔT)`,
        `c = ${fmtNum(qJ)} J / (${fmtNum(m)} g × ${dtStr} °C)`,
        `c = ${fmtNum(c_)} J/(g·°C)`,
        `Rounded to ${sf} sf: ${formatSigFigs(c_, sf)} J/(g·°C)`,
      ])
      setResult(fmtNum(c_))
      setResultUnit('J/(g·°C)')
      setResultLabel('Specific heat capacity (c)')
      setBreakdown(buildSigFigBreakdown([{ label: 'q', value: qVal }, { label: 'm', value: mVal }], c_, 'J/(g·°C)'))
    } else {
      // solve for ΔT
      if (!ok(qJ) || !ok(m) || !ok(c) || m === 0 || c === 0) { setError('Invalid values.'); return }
      const dt_ = qJ / (m * c)
      const sf  = lowestSigFigs([qVal, mVal, cVal])
      setSteps([
        `ΔT = q / (m × c)`,
        `ΔT = ${fmtNum(qJ)} J / (${fmtNum(m)} g × ${fmtNum(c)} J/(g·°C))`,
        `ΔT = ${fmtNum(dt_)} °C`,
        `Rounded to ${sf} sf: ${formatSigFigs(dt_, sf)} °C`,
      ])
      setResult(fmtNum(dt_))
      setResultUnit('°C')
      setResultLabel('Temperature change (ΔT)')
      setBreakdown(buildSigFigBreakdown([{ label: 'q', value: qVal }, { label: 'm', value: mVal }, { label: 'c', value: cVal }], dt_, '°C'))
    }
  }

  const sfResult = breakdown ? formatSigFigs(breakdown.rawResult, lowestSigFigs(breakdown.inputs.map(i => i.value))) : null

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        q = m × c × ΔT — leave one field empty to solve for it
      </InfoBox>
      <ExampleBox>{`200 g water cools from 75.0 °C to 25.0 °C (c = 4.184 J/g·°C)
q = 200 × 4.184 × (25.0 − 75.0) = −41,840 J`}</ExampleBox>

      {/* q */}
      <NumberField label="Heat (q)" value={qVal}
        onChange={v => { setQVal(sanitize(v)); reset() }}
        placeholder="leave empty to solve"
        unit={<EnergyUnitSelect value={qUnit} onChange={u => { setQUnit(u); reset() }} />}
      />

      {/* m */}
      <NumberField label="Mass (m)" value={mVal}
        onChange={v => { setMVal(sanitize(v)); reset() }}
        placeholder="leave empty to solve"
        unit={<span className="font-mono text-sm text-secondary px-2">g</span>}
      />

      {/* c with preset selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Specific Heat Capacity (c)</label>
        <div className="flex items-stretch gap-1.5 flex-wrap">
          <select value={cPreset} onChange={e => handlePreset(e.target.value)}
            className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5
                       text-primary focus:outline-none cursor-pointer">
            {SPECIFIC_HEATS.map(s => <option key={s.label}>{s.label}</option>)}
          </select>
          <input type="text" inputMode="decimal" value={cVal}
            onChange={e => { setCVal(sanitize(e.target.value)); setCPreset('Custom'); reset() }}
            placeholder="leave empty to solve"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <span className="font-mono text-sm text-secondary px-2 flex items-center">J/(g·°C)</span>
        </div>
      </div>

      {/* ΔT — toggle between direct and T_i/T_f */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-medium text-primary">
            {useTiTf ? 'Initial & Final Temperature' : 'Temperature Change (ΔT)'}
          </label>
          <button onClick={() => { setUseTiTf(u => !u); setDtVal(''); setTiVal(''); setTfVal(''); reset() }}
            className="font-mono text-[10px] text-dim hover:text-secondary transition-colors">
            {useTiTf ? 'use ΔT' : 'use T_i / T_f'}
          </button>
        </div>
        {useTiTf ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <NumberField label="T initial" value={tiVal}
                onChange={v => { setTiVal(sanitize(v)); reset() }}
                placeholder="°C"
                unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
              />
            </div>
            <div className="flex-1">
              <NumberField label="T final" value={tfVal}
                onChange={v => { setTfVal(sanitize(v)); reset() }}
                placeholder="°C"
                unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
              />
            </div>
          </div>
        ) : (
          <NumberField label="" value={dtVal}
            onChange={v => { setDtVal(sanitize(v)); reset() }}
            placeholder="leave empty to solve"
            unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
          />
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <CalcButton onClick={calculate} />

      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <StepsPanel steps={steps} />
          <ResultDisplay label={resultLabel} value={result} unit={resultUnit} sigFigsValue={sfResult} />
        </div>
      )}
    </div>
  )
}

// ── q = CΔT ───────────────────────────────────────────────────────────────────

function CDeltaT() {
  const [qVal, setQVal]   = useState('')
  const [qUnit, setQUnit] = useState('J')
  const [cVal, setCVal]   = useState('')
  const [cUnit, setCUnit] = useState('J/°C')
  const [tiVal, setTiVal] = useState('')
  const [tfVal, setTfVal] = useState('')
  const [dtVal, setDtVal] = useState('')
  const [useTiTf, setUseTiTf] = useState(false)

  const [result, setResult]         = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [resultLabel, setResultLabel] = useState('Result')
  const [steps, setSteps]           = useState<string[]>([])
  const [breakdown, setBreakdown]   = useState<SigFigBreakdown | null>(null)
  const [error, setError]           = useState<string | null>(null)

  function reset() { setResult(null); setSteps([]); setBreakdown(null); setError(null) }

  function computeDT(): { dt: number; dtStr: string } | null {
    if (useTiTf) {
      const ti = parse(tiVal), tf = parse(tfVal)
      if (!ok(ti) || !ok(tf)) return null
      return { dt: tf - ti, dtStr: `(${fmtNum(tf)} − ${fmtNum(ti)})` }
    }
    const dt = parse(dtVal)
    if (!ok(dt)) return null
    return { dt, dtStr: fmtNum(dt) }
  }

  function toJC(val: string, unit: string): number {
    const n = parse(val)
    return unit === 'kJ/°C' ? n * 1000 : n
  }

  function fromJC(j: number, unit: string): number {
    return unit === 'kJ/°C' ? j / 1000 : j
  }

  function calculate() {
    reset()
    const hasQ  = hasValue(qVal)
    const hasC  = hasValue(cVal)
    const hasDT = useTiTf ? (hasValue(tiVal) && hasValue(tfVal)) : hasValue(dtVal)
    const filled = [hasQ, hasC, hasDT].filter(Boolean).length
    if (filled < 2) { setError('Fill in two of the three values.'); return }

    const C   = hasC  ? toJC(cVal, cUnit) : NaN
    const dtObj = hasDT ? computeDT() : null
    const dt  = dtObj?.dt ?? NaN
    const dtStr = dtObj?.dtStr ?? ''
    const qJ  = hasQ  ? toJoules(qVal, qUnit) : NaN

    if (!hasQ) {
      if (!ok(C) || !ok(dt)) { setError('Invalid values.'); return }
      const qJ_ = C * dt
      const q_  = fromJoules(qJ_, qUnit)
      const sf  = lowestSigFigs([cVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      setSteps([
        `q = C × ΔT`,
        `q = ${fmtNum(C)} J/°C × ${dtStr} °C`,
        `q = ${fmtNum(qJ_)} J`,
        qUnit !== 'J' ? `q = ${fmtNum(fromJoules(qJ_, qUnit))} ${qUnit}` : '',
        `Rounded to ${sf} sf: ${formatSigFigs(q_, sf)} ${qUnit}`,
      ].filter(Boolean))
      setResult(fmtNum(q_))
      setResultUnit(qUnit)
      setResultLabel('Heat (q)')
      setBreakdown(buildSigFigBreakdown([{ label: 'C', value: cVal }], q_, qUnit))
    } else if (!hasC) {
      if (!ok(qJ) || !ok(dt) || dt === 0) { setError('Invalid values.'); return }
      const CJ = qJ / dt
      const C_ = fromJC(CJ, cUnit)
      const sf  = lowestSigFigs([qVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      setSteps([
        `C = q / ΔT`,
        `C = ${fmtNum(qJ)} J / (${dtStr} °C)`,
        `C = ${fmtNum(CJ)} J/°C`,
        cUnit !== 'J/°C' ? `C = ${fmtNum(C_)} ${cUnit}` : '',
        `Rounded to ${sf} sf: ${formatSigFigs(C_, sf)} ${cUnit}`,
      ].filter(Boolean))
      setResult(fmtNum(C_))
      setResultUnit(cUnit)
      setResultLabel('Heat Capacity (C)')
      setBreakdown(buildSigFigBreakdown([{ label: 'q', value: qVal }], C_, cUnit))
    } else {
      if (!ok(qJ) || !ok(C) || C === 0) { setError('Invalid values.'); return }
      const dt_ = qJ / C
      const sf  = lowestSigFigs([qVal, cVal])
      setSteps([
        `ΔT = q / C`,
        `ΔT = ${fmtNum(qJ)} J / ${fmtNum(C)} J/°C`,
        `ΔT = ${fmtNum(dt_)} °C`,
        `Rounded to ${sf} sf: ${formatSigFigs(dt_, sf)} °C`,
      ])
      setResult(fmtNum(dt_))
      setResultUnit('°C')
      setResultLabel('Temperature change (ΔT)')
      setBreakdown(buildSigFigBreakdown([{ label: 'q', value: qVal }, { label: 'C', value: cVal }], dt_, '°C'))
    }
  }

  const sfResult = breakdown ? formatSigFigs(breakdown.rawResult, lowestSigFigs(breakdown.inputs.map(i => i.value))) : null

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        q = C × ΔT — where C is the total heat capacity of the system (not per gram)
      </InfoBox>
      <ExampleBox>{`Calorimeter (C = 1850 J/°C) warms by ΔT = 3.48 °C.
q = C × ΔT = 1850 × 3.48 = 6,438 J`}</ExampleBox>

      <NumberField label="Heat (q)" value={qVal}
        onChange={v => { setQVal(sanitize(v)); reset() }}
        placeholder="leave empty to solve"
        unit={<EnergyUnitSelect value={qUnit} onChange={u => { setQUnit(u); reset() }} />}
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Heat Capacity (C)</label>
        <div className="flex items-stretch gap-1.5">
          <input type="text" inputMode="decimal" value={cVal}
            onChange={e => { setCVal(sanitize(e.target.value)); reset() }}
            placeholder="leave empty to solve"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <select value={cUnit} onChange={e => { setCUnit(e.target.value); reset() }}
            className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5
                       text-primary focus:outline-none cursor-pointer">
            <option>J/°C</option>
            <option>kJ/°C</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-medium text-primary">
            {useTiTf ? 'Initial & Final Temperature' : 'Temperature Change (ΔT)'}
          </label>
          <button onClick={() => { setUseTiTf(u => !u); setDtVal(''); setTiVal(''); setTfVal(''); reset() }}
            className="font-mono text-[10px] text-dim hover:text-secondary transition-colors">
            {useTiTf ? 'use ΔT' : 'use T_i / T_f'}
          </button>
        </div>
        {useTiTf ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <NumberField label="T initial" value={tiVal}
                onChange={v => { setTiVal(sanitize(v)); reset() }}
                placeholder="°C"
                unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
              />
            </div>
            <div className="flex-1">
              <NumberField label="T final" value={tfVal}
                onChange={v => { setTfVal(sanitize(v)); reset() }}
                placeholder="°C"
                unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
              />
            </div>
          </div>
        ) : (
          <NumberField label="" value={dtVal}
            onChange={v => { setDtVal(sanitize(v)); reset() }}
            placeholder="leave empty to solve"
            unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
          />
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <CalcButton onClick={calculate} />

      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <StepsPanel steps={steps} />
          <ResultDisplay label={resultLabel} value={result} unit={resultUnit} sigFigsValue={sfResult} />
        </div>
      )}
    </div>
  )
}

// ── Coffee-Cup Calorimeter ────────────────────────────────────────────────────

function CoffeeCup() {
  const [mVal, setMVal]   = useState('')
  const [cVal, setCVal]   = useState('4.184')
  const [cPreset, setCPreset] = useState('Water (l)')
  const [tiVal, setTiVal] = useState('')
  const [tfVal, setTfVal] = useState('')
  const [nVal, setNVal]   = useState('')
  const [qUnit, setQUnit] = useState('J')

  const [result, setResult]           = useState<string | null>(null)
  const [resultLabel, setResultLabel] = useState('Result')
  const [dhResult, setDhResult]       = useState<string | null>(null)
  const [steps, setSteps]             = useState<string[]>([])
  const [error, setError]             = useState<string | null>(null)

  function reset() { setResult(null); setDhResult(null); setSteps([]); setError(null) }

  function handlePreset(label: string) {
    setCPreset(label)
    const found = SPECIFIC_HEATS.find(s => s.label === label)
    if (found && found.c) setCVal(found.c)
    reset()
  }

  function calculate() {
    reset()
    const m  = parse(mVal)
    const c  = parse(cVal)
    const ti = parse(tiVal)
    const tf = parse(tfVal)
    if (!ok(m) || !ok(c) || !ok(ti) || !ok(tf)) {
      setError('Enter mass, specific heat, T_initial, and T_final.')
      return
    }
    const dt    = tf - ti
    const qsol  = m * c * dt         // heat absorbed by solution (J)
    const qrxn  = -qsol              // heat of reaction
    const qOut  = fromJoules(qrxn, qUnit)

    const s: string[] = [
      `Coffee-cup calorimeter (constant pressure)`,
      `q_solution = m × c × ΔT = ${fmtNum(m)} g × ${fmtNum(c)} J/(g·°C) × (${fmtNum(tf)} − ${fmtNum(ti)}) °C`,
      `q_solution = ${fmtNum(qsol)} J`,
      `q_rxn = −q_solution = ${fmtNum(qrxn)} J`,
    ]

    if (qUnit !== 'J') {
      s.push(`q_rxn = ${fmtNum(fromJoules(qrxn, 'kJ'))} kJ`)
    }

    const n = hasValue(nVal) ? parse(nVal) : NaN
    if (ok(n) && n !== 0) {
      const dhJ     = qrxn / n
      const dhkJ    = dhJ / 1000
      s.push(`ΔH = q_rxn / n = ${fmtNum(qrxn)} J / ${fmtNum(n)} mol = ${fmtNum(dhJ)} J/mol`)
      s.push(`ΔH = ${fmtNum(dhkJ)} kJ/mol`)
      setDhResult(fmtNum(dhkJ))
    }

    setSteps(s)
    setResult(fmtNum(qOut))
    setResultLabel('q_rxn (heat of reaction)')
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        Coffee-cup calorimeter (constant pressure): q_rxn = −q_solution = −mcΔT
        <br />Sign: negative q_rxn = exothermic; positive = endothermic
      </InfoBox>
      <ExampleBox>{`100 g solution (c = 4.18 J/g·°C) warms from 22.5 °C to 28.3 °C.
q_soln = 100 × 4.18 × 5.8 = 2,424 J
q_rxn = −q_soln = −2,424 J (exothermic)`}</ExampleBox>

      <NumberField label="Mass of solution (m)" value={mVal}
        onChange={v => { setMVal(sanitize(v)); reset() }}
        placeholder="e.g. 100.0"
        unit={<span className="font-mono text-sm text-secondary px-2">g</span>}
      />

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Specific Heat of solution (c)
        </label>
        <div className="flex items-stretch gap-1.5 flex-wrap">
          <select value={cPreset} onChange={e => handlePreset(e.target.value)}
            className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5
                       text-primary focus:outline-none cursor-pointer">
            {SPECIFIC_HEATS.map(s => <option key={s.label}>{s.label}</option>)}
          </select>
          <input type="text" inputMode="decimal" value={cVal}
            onChange={e => { setCVal(sanitize(e.target.value)); setCPreset('Custom'); reset() }}
            placeholder="4.184"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <span className="font-mono text-sm text-secondary px-2 flex items-center">J/(g·°C)</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <NumberField label="T initial" value={tiVal}
            onChange={v => { setTiVal(sanitize(v)); reset() }}
            placeholder="°C"
            unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
          />
        </div>
        <div className="flex-1">
          <NumberField label="T final" value={tfVal}
            onChange={v => { setTfVal(sanitize(v)); reset() }}
            placeholder="°C"
            unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Moles of reactant (optional — for ΔH)
        </label>
        <div className="flex items-stretch gap-1.5">
          <input type="text" inputMode="decimal" value={nVal}
            onChange={e => { setNVal(sanitize(e.target.value)); reset() }}
            placeholder="optional"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <span className="font-mono text-sm text-secondary px-2 flex items-center">mol</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-medium text-primary">Output unit:</span>
        <EnergyUnitSelect value={qUnit} onChange={u => { setQUnit(u); reset() }} />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <CalcButton onClick={calculate} />

      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <StepsPanel steps={steps} />
          <ResultDisplay label={resultLabel} value={result} unit={qUnit} />
          {dhResult && (
            <ResultDisplay label="Molar enthalpy change (ΔH)" value={dhResult} unit="kJ/mol" />
          )}
        </div>
      )}
    </div>
  )
}

// ── Bomb Calorimeter ──────────────────────────────────────────────────────────

function BombCalorimeter() {
  const [ccalVal, setCcalVal] = useState('')
  const [ccalUnit, setCcalUnit] = useState('kJ/°C')
  const [tiVal, setTiVal]   = useState('')
  const [tfVal, setTfVal]   = useState('')
  const [nVal, setNVal]     = useState('')
  const [qUnit, setQUnit]   = useState('kJ')

  const [result, setResult]           = useState<string | null>(null)
  const [resultLabel, setResultLabel] = useState('Result')
  const [deResult, setDeResult]       = useState<string | null>(null)
  const [steps, setSteps]             = useState<string[]>([])
  const [error, setError]             = useState<string | null>(null)

  function reset() { setResult(null); setDeResult(null); setSteps([]); setError(null) }

  function toCcalJ(val: string, unit: string): number {
    const n = parse(val)
    return unit === 'kJ/°C' ? n * 1000 : n
  }

  function calculate() {
    reset()
    const Ccal_J = toCcalJ(ccalVal, ccalUnit)
    const ti = parse(tiVal)
    const tf = parse(tfVal)

    if (!ok(Ccal_J) || !ok(ti) || !ok(tf)) {
      setError('Enter heat capacity of calorimeter, T_initial, and T_final.')
      return
    }

    const dt     = tf - ti
    const qcal   = Ccal_J * dt       // heat absorbed by calorimeter (J)
    const qrxn   = -qcal             // heat of reaction (J)
    const qOut   = fromJoules(qrxn, qUnit)
    const Ccal_disp = ccalUnit === 'kJ/°C' ? parse(ccalVal) : Ccal_J

    const s: string[] = [
      `Bomb calorimeter (constant volume)`,
      `q_cal = C_cal × ΔT = ${fmtNum(Ccal_disp)} ${ccalUnit} × (${fmtNum(tf)} − ${fmtNum(ti)}) °C`,
      `q_cal = ${fmtNum(Ccal_J / 1000)} kJ`,
      `q_rxn = −q_cal = ${fmtNum(-Ccal_J * dt / 1000)} kJ`,
    ]

    const n = hasValue(nVal) ? parse(nVal) : NaN
    if (ok(n) && n !== 0) {
      const deKJ = qrxn / (1000 * n)
      s.push(`ΔE_rxn = q_rxn / n = ${fmtNum(qrxn / 1000)} kJ / ${fmtNum(n)} mol`)
      s.push(`ΔE_rxn = ${fmtNum(deKJ)} kJ/mol`)
      setDeResult(fmtNum(deKJ))
    }

    setSteps(s)
    setResult(fmtNum(qOut))
    setResultLabel('q_rxn (heat of reaction)')
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        Bomb calorimeter (constant volume): q_rxn = −q_cal = −C_cal × ΔT
        <br />Sign: negative q_rxn = exothermic; positive = endothermic
      </InfoBox>
      <ExampleBox>{`Calorimeter C_cal = 4.25 kJ/°C records ΔT = +3.22 °C.
q_rxn = −C_cal × ΔT = −4.25 × 3.22 = −13.7 kJ (exothermic)`}</ExampleBox>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Heat Capacity of Calorimeter (C_cal)
        </label>
        <div className="flex items-stretch gap-1.5">
          <input type="text" inputMode="decimal" value={ccalVal}
            onChange={e => { setCcalVal(sanitize(e.target.value)); reset() }}
            placeholder="e.g. 5.21"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <select value={ccalUnit} onChange={e => { setCcalUnit(e.target.value); reset() }}
            className="font-mono text-xs bg-raised border border-border rounded-sm px-2 py-1.5
                       text-primary focus:outline-none cursor-pointer">
            <option>kJ/°C</option>
            <option>J/°C</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <NumberField label="T initial" value={tiVal}
            onChange={v => { setTiVal(sanitize(v)); reset() }}
            placeholder="°C"
            unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
          />
        </div>
        <div className="flex-1">
          <NumberField label="T final" value={tfVal}
            onChange={v => { setTfVal(sanitize(v)); reset() }}
            placeholder="°C"
            unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Moles of substance (optional — for ΔE)
        </label>
        <div className="flex items-stretch gap-1.5">
          <input type="text" inputMode="decimal" value={nVal}
            onChange={e => { setNVal(sanitize(e.target.value)); reset() }}
            placeholder="optional"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <span className="font-mono text-sm text-secondary px-2 flex items-center">mol</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-medium text-primary">Output unit:</span>
        <EnergyUnitSelect value={qUnit} onChange={u => { setQUnit(u); reset() }} />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <CalcButton onClick={calculate} />

      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <StepsPanel steps={steps} />
          <ResultDisplay label={resultLabel} value={result} unit={qUnit} />
          {deResult && (
            <ResultDisplay label="Internal energy change (ΔE_rxn)" value={deResult} unit="kJ/mol" />
          )}
        </div>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function CalorimetryCalc() {
  const [mode, setMode] = useState<Mode>('mcdt')

  return (
    <div className="flex flex-col gap-6">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-1.5">
        {MODES.map(m => {
          const active = mode === m.id
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
                background: active ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'rgb(var(--color-surface))',
                border: active
                  ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)'
                  : '1px solid rgb(var(--color-border))',
              }}>
              <span className="font-mono text-[10px] opacity-60">{m.formula}</span>
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={mode}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
          {mode === 'mcdt'   && <McDeltaT />}
          {mode === 'cdt'    && <CDeltaT />}
          {mode === 'coffee' && <CoffeeCup />}
          {mode === 'bomb'   && <BombCalorimeter />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

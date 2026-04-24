import React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pick, randBetween, roundTo, sig } from '../shared/WorkedExample'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../shared/SigFigPanel'
import ResultDisplay from '../shared/ResultDisplay'
import { sanitize, hasValue } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import { buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs } from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'
import { COMMON_SOLUTES } from '../../data/commonSolutes'
import { heatOfSolution, heatOfNeutralization, deltaUtoDeltaH } from '../../chem/thermo'

// ── Example generators ────────────────────────────────────────────────────────

const MC_SUBSTANCES = [
  { name: 'water', c: 4.184 }, { name: 'aluminum', c: 0.897 },
  { name: 'copper', c: 0.385 }, { name: 'iron', c: 0.449 }, { name: 'gold', c: 0.129 },
]

function generateMcDTExample() {
  const sub = pick(MC_SUBSTANCES)
  const m  = roundTo(randBetween(50, 300), 0)
  const ti = roundTo(randBetween(15, 40), 1)
  const tf = roundTo(randBetween(ti + 20, 90), 1)
  const dt = roundTo(tf - ti, 1)
  const q  = m * sub.c * dt
  return {
    scenario: `${m} g of ${sub.name} (c = ${sub.c} J/g·°C) is heated from ${ti} °C to ${tf} °C. Find q.`,
    steps: [
      `q = m × c × ΔT`,
      `ΔT = ${tf} − ${ti} = ${dt} °C`,
      `q = ${m} g × ${sub.c} J/(g·°C) × ${dt} °C`,
      `q = ${sig(q, 4)} J`,
    ],
    result: `q = ${sig(q, 3)} J`,
  }
}

function generateCDTExample() {
  const C  = roundTo(randBetween(400, 2500), 0)
  const dt = roundTo(randBetween(1.0, 12.0), 2)
  const q  = C * dt
  return {
    scenario: `A calorimeter with C = ${C} J/°C warms by ΔT = ${dt} °C. Find q.`,
    steps: [`q = C × ΔT`, `q = ${C} J/°C × ${dt} °C`, `q = ${sig(q, 4)} J`],
    result: `q = ${sig(q, 3)} J`,
  }
}

function generateCoffeeCupExample() {
  const m  = roundTo(randBetween(50, 200), 0)
  const ti = roundTo(randBetween(18, 28), 1)
  const tf = roundTo(randBetween(ti + 3, ti + 15), 1)
  const dt = roundTo(tf - ti, 1)
  const qsol = m * 4.184 * dt
  const qrxn = -qsol
  return {
    scenario: `${m} g solution (c = 4.184 J/g·°C) warms from ${ti} °C to ${tf} °C. Find q_rxn.`,
    steps: [
      `q_solution = m × c × ΔT = ${m} × 4.184 × (${tf} − ${ti}) = ${sig(qsol, 4)} J`,
      `q_rxn = −q_solution = ${sig(qrxn, 4)} J`,
      qrxn < 0 ? `Negative sign → exothermic reaction` : `Positive sign → endothermic reaction`,
    ],
    result: `q_rxn = ${sig(qrxn, 3)} J`,
  }
}

function generateBombCalExample() {
  const Ccal = roundTo(randBetween(2.0, 8.0), 2)
  const dt   = roundTo(randBetween(1.0, 6.0), 2)
  const qcal = Ccal * dt
  const qrxn = -qcal
  return {
    scenario: `Bomb calorimeter (C_cal = ${Ccal} kJ/°C) records ΔT = +${dt} °C. Find q_rxn.`,
    steps: [
      `q_cal = C_cal × ΔT = ${Ccal} kJ/°C × ${dt} °C = ${sig(qcal, 4)} kJ`,
      `q_rxn = −q_cal = ${sig(qrxn, 4)} kJ`,
    ],
    result: `q_rxn = ${sig(qrxn, 3)} kJ`,
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'mcdt' | 'cdt' | 'coffee' | 'bomb' | 'soln' | 'neut' | 'du-dh'

// ── Constants ─────────────────────────────────────────────────────────────────

const MODES: { id: Mode; label: string; formula: string }[] = [
  { id: 'mcdt',   label: 'q = mcΔT',        formula: 'mcΔT'    },
  { id: 'cdt',    label: 'q = CΔT',         formula: 'CΔT'     },
  { id: 'coffee', label: 'Coffee-Cup',       formula: '☕'       },
  { id: 'bomb',   label: 'Bomb Cal.',        formula: '⚗'       },
  { id: 'soln',   label: 'Heat of Solution', formula: 'ΔH_soln' },
  { id: 'neut',   label: 'Neutralization',   formula: 'ΔH_neut' },
  { id: 'du-dh',  label: 'ΔU → ΔH',         formula: 'Δn·RT'   },
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
      className="shrink-0 py-2 px-5 rounded-sm font-sans font-medium text-sm transition-all"
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
  const [verified, setVerified] = useState<VerifyState>(null)
  const [error, setError]       = useState<string | null>(null)

  function reset() { setResult(null); setSteps([]); setBreakdown(null); setVerified(null); setError(null) }

  function handleClear() {
    setQVal(''); setMVal(''); setCVal(''); setCPreset('Custom')
    setDtVal(''); setTiVal(''); setTfVal('')
    reset()
  }

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
      const userSF = countSigFigs(qVal)
      const valueOk = Math.abs(expectedJ - qJ) / Math.abs(expectedJ) <= 0.01
      const sfOk = userSF === sf
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
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
  const stepsState = useStepsPanelState(steps, generateMcDTExample)
  const [sfOpen, setSfOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        q = m × c × ΔT — leave one field empty to solve for it
      </InfoBox>

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
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        {(qVal || mVal || cVal || dtVal || tiVal || tfVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <ResultDisplay label={resultLabel} value={result} unit={resultUnit} sigFigsValue={sfResult} verified={verified} />
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
  const [verified, setVerified]     = useState<VerifyState>(null)
  const [error, setError]           = useState<string | null>(null)

  function reset() { setResult(null); setSteps([]); setBreakdown(null); setVerified(null); setError(null) }

  function handleClear() {
    setQVal(''); setCVal(''); setDtVal(''); setTiVal(''); setTfVal('')
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

    if (filled === 3) {
      if (!ok(C) || !ok(dt) || !ok(qJ)) { setError('One or more values are invalid.'); return }
      const expectedJ = C * dt
      const expected  = fromJoules(expectedJ, qUnit)
      const sf  = lowestSigFigs([cVal, ...(useTiTf ? [tiVal, tfVal] : [dtVal])])
      const userSF = countSigFigs(qVal)
      const valueOk = Math.abs(expectedJ - qJ) / Math.abs(expectedJ) <= 0.01
      const sfOk = userSF === sf
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
      setSteps([
        `q = C × ΔT`,
        `q = ${fmtNum(C)} J/°C × ${dtStr} °C = ${fmtNum(expectedJ)} J`,
        `Rounded to ${sf} sf: ${formatSigFigs(expected, sf)} ${qUnit}`,
      ])
      setResult(formatSigFigs(expected, sf))
      setResultUnit(qUnit)
      setResultLabel('Expected q')
      return
    }

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
  const stepsState = useStepsPanelState(steps, generateCDTExample)
  const [sfOpen, setSfOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        q = C × ΔT — where C is the total heat capacity of the system (not per gram)
      </InfoBox>

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
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        {(qVal || cVal || dtVal || tiVal || tfVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <ResultDisplay label={resultLabel} value={result} unit={resultUnit} sigFigsValue={sfResult} verified={verified} />
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

  const [answerVal, setAnswerVal]     = useState('')
  const [result, setResult]           = useState<string | null>(null)
  const [resultLabel, setResultLabel] = useState('Result')
  const [dhResult, setDhResult]       = useState<string | null>(null)
  const [steps, setSteps]             = useState<string[]>([])
  const [verified, setVerified]       = useState<VerifyState>(null)
  const [error, setError]             = useState<string | null>(null)
  const stepsState = useStepsPanelState(steps, generateCoffeeCupExample)

  function reset() { setResult(null); setDhResult(null); setSteps([]); setVerified(null); setError(null) }

  function handleClear() {
    setMVal(''); setCVal('4.184'); setCPreset('Water (l)')
    setTiVal(''); setTfVal(''); setNVal('')
    setAnswerVal('')
    reset()
  }

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

    if (hasValue(answerVal)) {
      const sf = lowestSigFigs([mVal, cVal, tiVal, tfVal].filter(hasValue))
      const userSF = countSigFigs(answerVal)
      const valueOk = Math.abs(qrxn - toJoules(answerVal, qUnit)) / Math.abs(qrxn) <= 0.01
      const sfOk = userSF === sf
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
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

      <NumberField label="Your q_rxn — optional, enter to check" value={answerVal}
        onChange={v => { setAnswerVal(sanitize(v)); setVerified(null) }}
        placeholder="optional"
        unit={<span className="font-mono text-sm text-secondary px-2">{qUnit}</span>}
      />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(mVal || tiVal || tfVal || nVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <ResultDisplay label={resultLabel} value={result} unit={qUnit} verified={verified} />
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

  const [answerVal, setAnswerVal]     = useState('')
  const [result, setResult]           = useState<string | null>(null)
  const [resultLabel, setResultLabel] = useState('Result')
  const [deResult, setDeResult]       = useState<string | null>(null)
  const [steps, setSteps]             = useState<string[]>([])
  const [verified, setVerified]       = useState<VerifyState>(null)
  const [error, setError]             = useState<string | null>(null)
  const stepsState = useStepsPanelState(steps, generateBombCalExample)

  function reset() { setResult(null); setDeResult(null); setSteps([]); setVerified(null); setError(null) }

  function handleClear() {
    setCcalVal(''); setTiVal(''); setTfVal(''); setNVal('')
    setAnswerVal('')
    reset()
  }

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

    if (hasValue(answerVal)) {
      const userSF = countSigFigs(answerVal)
      const valueOk = Math.abs(qrxn - toJoules(answerVal, qUnit)) / Math.abs(qrxn) <= 0.01
      const sf = lowestSigFigs([ccalVal, tiVal, tfVal].filter(hasValue))
      const sfOk = userSF === sf
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
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

      <NumberField label="Your q_rxn — optional, enter to check" value={answerVal}
        onChange={v => { setAnswerVal(sanitize(v)); setVerified(null) }}
        placeholder="optional"
        unit={<span className="font-mono text-sm text-secondary px-2">{qUnit}</span>}
      />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(ccalVal || tiVal || tfVal || nVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <ResultDisplay label={resultLabel} value={result} unit={qUnit} verified={verified} />
          {deResult && (
            <ResultDisplay label="Internal energy change (ΔE_rxn)" value={deResult} unit="kJ/mol" />
          )}
        </div>
      )}
    </div>
  )
}

// ── Heat of Solution ──────────────────────────────────────────────────────────

function generateHeatOfSolutionExample() {
  const s = pick(COMMON_SOLUTES.filter(x => x.exampleDeltaHsoln !== undefined))
  const massWater  = roundTo(randBetween(50, 150), 0)
  const massSolute = roundTo(randBetween(2, 10), 2)
  const dH         = s.exampleDeltaHsoln!
  // Back-solve: ΔH_soln = q_rxn/n → q_rxn = dH × n; ΔT = -q_rxn / (m_w × 4.184)
  const n          = massSolute / s.molarMass
  const q_rxn      = dH * 1000 * n   // J
  const q_water    = -q_rxn
  const dT         = roundTo(q_water / (massWater * 4.184), 2)
  const ti         = roundTo(randBetween(20, 25), 1)
  const tf         = roundTo(ti + dT, 2)
  const result     = heatOfSolution(massSolute, s.molarMass, massWater, dT)
  return {
    scenario: `${massSolute} g of ${s.displayName} (M = ${s.molarMass} g/mol) is dissolved in ` +
              `${massWater} g of water. Temperature changes from ${ti}°C to ${tf}°C. Find ΔH_soln.`,
    steps: [
      `ΔT = ${sig(tf, 4)} − ${sig(ti, 4)} = ${sig(dT, 4)} °C`,
      `q_water = m × c × ΔT = ${massWater} × 4.184 × (${sig(dT, 4)}) = ${sig(-q_rxn, 4)} J`,
      `q_rxn = −q_water = ${sig(q_rxn, 4)} J`,
      `n(solute) = ${massSolute} g ÷ ${s.molarMass} g/mol = ${sig(n, 4)} mol`,
      `ΔH_soln = q_rxn / n / 1000 = ${sig(result, 4)} kJ/mol`,
      result > 0 ? `Positive ΔH → endothermic (temperature dropped)` : `Negative ΔH → exothermic (temperature rose)`,
    ],
    result: `ΔH_soln = ${sig(result, 3)} kJ/mol`,
  }
}

function HeatOfSolutionMode() {
  const [soluteIdx, setSoluteIdx] = useState(0)
  const [massSolute, setMassSolute] = useState('')
  const [massWater,  setMassWater]  = useState('')
  const [tiVal,      setTiVal]      = useState('')
  const [tfVal,      setTfVal]      = useState('')
  const [answerVal,  setAnswerVal]  = useState('')
  const [steps,      setSteps]      = useState<string[]>([])
  const [result,     setResult]     = useState<string | null>(null)
  const [verified,   setVerified]   = useState<VerifyState>(null)
  const [error,      setError]      = useState<string | null>(null)

  const solute = COMMON_SOLUTES[soluteIdx]
  const stepsState = useStepsPanelState(steps, generateHeatOfSolutionExample)

  function reset() { setSteps([]); setResult(null); setVerified(null); setError(null) }
  function handleClear() { setMassSolute(''); setMassWater(''); setTiVal(''); setTfVal(''); setAnswerVal(''); reset() }

  function calculate() {
    reset()
    const ms = parse(massSolute), mw = parse(massWater), ti = parse(tiVal), tf = parse(tfVal)
    if (!ok(ms) || !ok(mw) || !ok(ti) || !ok(tf)) { setError('Enter all four values.'); return }
    if (ms <= 0 || mw <= 0)  { setError('Masses must be positive.'); return }
    const dT      = tf - ti
    const q_water = mw * 4.184 * dT
    const q_rxn   = -q_water
    const n       = ms / solute.molarMass
    const dH      = heatOfSolution(ms, solute.molarMass, mw, dT)
    const s: string[] = [
      `ΔT = T_f − T_i = ${fmtNum(tf)} − ${fmtNum(ti)} = ${fmtNum(dT)} °C`,
      `q_water = m × c × ΔT = ${fmtNum(mw)} g × 4.184 J/(g·°C) × ${fmtNum(dT)} °C = ${fmtNum(q_water)} J`,
      `q_rxn = −q_water = ${fmtNum(q_rxn)} J`,
      `n(${solute.displayName}) = ${fmtNum(ms)} g ÷ ${solute.molarMass} g/mol = ${fmtNum(n)} mol`,
      `ΔH_soln = q_rxn / n = ${fmtNum(q_rxn)} J ÷ ${fmtNum(n)} mol = ${fmtNum(q_rxn / n)} J/mol`,
      `ΔH_soln = ${fmtNum(dH)} kJ/mol`,
      dH > 0 ? `ΔH > 0 → endothermic dissolution (solution cools)` : `ΔH < 0 → exothermic dissolution (solution warms)`,
    ]
    setSteps(s)
    setResult(fmtNum(dH))
    if (answerVal) {
      const userVal = parse(answerVal)
      setVerified(Math.abs(userVal - dH) / Math.abs(dH) <= 0.02 ? 'correct' : 'incorrect')
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        ΔH_soln = q_rxn / n_solute · q_rxn = −m_water × c × ΔT · c_water = 4.184 J/(g·°C)
      </InfoBox>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Solute</label>
        <select value={soluteIdx} onChange={e => { setSoluteIdx(Number(e.target.value)); reset() }}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary
                     focus:outline-none focus:border-muted transition-colors">
          {COMMON_SOLUTES.map((s, i) => <option key={s.formula} value={i}>{s.displayName} — M = {s.molarMass} g/mol</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Mass of solute" value={massSolute}
          onChange={v => { setMassSolute(sanitize(v)); reset() }} placeholder="g"
          unit={<span className="font-mono text-sm text-secondary px-2">g</span>} />
        <NumberField label="Mass of water" value={massWater}
          onChange={v => { setMassWater(sanitize(v)); reset() }} placeholder="g (= mL × 1.00)"
          unit={<span className="font-mono text-sm text-secondary px-2">g</span>} />
        <NumberField label="T initial" value={tiVal}
          onChange={v => { setTiVal(sanitize(v)); reset() }} placeholder="°C"
          unit={<span className="font-mono text-sm text-secondary px-2">°C</span>} />
        <NumberField label="T final" value={tfVal}
          onChange={v => { setTfVal(sanitize(v)); reset() }} placeholder="°C"
          unit={<span className="font-mono text-sm text-secondary px-2">°C</span>} />
      </div>

      <NumberField label="Your ΔH_soln — optional, enter to check" value={answerVal}
        onChange={v => { setAnswerVal(sanitize(v)); setVerified(null) }} placeholder="kJ/mol"
        unit={<span className="font-mono text-sm text-secondary px-2">kJ/mol</span>} />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(massSolute || massWater || tiVal || tfVal) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {result && <ResultDisplay label="ΔH_soln (heat of solution)" value={result} unit="kJ/mol" verified={verified} />}
    </div>
  )
}

// ── Heat of Neutralization ────────────────────────────────────────────────────

const ACID_BASE_PAIRS = [
  { label: 'HCl + NaOH (1:1)',        acidRatio: 1.0 },
  { label: 'HNO₃ + KOH (1:1)',        acidRatio: 1.0 },
  { label: 'H₂SO₄ + 2 NaOH (1:2)',   acidRatio: 0.5 },
  { label: 'CH₃COOH + NaOH (1:1)',    acidRatio: 1.0 },
]

function generateHeatOfNeutralizationExample() {
  const pair      = pick(ACID_BASE_PAIRS)
  const vAcid     = roundTo(randBetween(50, 200), 0)
  const cAcid     = roundTo(randBetween(0.100, 1.00), 3)
  const vBase     = vAcid
  const cBase     = cAcid
  const dHneut    = -56.2   // kJ/mol, typical strong acid/base
  const n_water   = (vAcid / 1000) * cAcid / pair.acidRatio
  const q_rxn     = dHneut * 1000 * n_water   // J
  const q_soln    = -q_rxn
  const mTotal    = vAcid + vBase
  const dT        = roundTo(q_soln / (mTotal * 4.184), 2)
  const dH        = heatOfNeutralization(vAcid, cAcid, vBase, cBase, pair.acidRatio, dT)
  return {
    scenario: `${vAcid} mL of ${cAcid} M acid mixed with ${vBase} mL of ${cBase} M base (${pair.label}). ` +
              `Temperature rises by ${sig(dT, 3)} °C. Find ΔH_neut.`,
    steps: [
      `m_total = ${vAcid} + ${vBase} = ${mTotal} g`,
      `q_soln = ${mTotal} × 4.184 × ${sig(dT, 3)} = ${sig(q_soln, 4)} J`,
      `q_rxn = −q_soln = ${sig(q_rxn, 4)} J`,
      `n(water) = (${vAcid}/1000) × ${cAcid} / ${pair.acidRatio} = ${sig(n_water, 4)} mol`,
      `ΔH_neut = q_rxn / n / 1000 = ${sig(dH, 4)} kJ/mol`,
    ],
    result: `ΔH_neut = ${sig(dH, 3)} kJ/mol`,
  }
}

function HeatOfNeutralizationMode() {
  const [pairIdx,    setPairIdx]    = useState(0)
  const [vAcid,      setVAcid]      = useState('')
  const [cAcid,      setCacid]      = useState('')
  const [vBase,      setVBase]      = useState('')
  const [cBase,      setCbase]      = useState('')
  const [tiVal,      setTiVal]      = useState('')
  const [tfVal,      setTfVal]      = useState('')
  const [answerVal,  setAnswerVal]  = useState('')
  const [steps,      setSteps]      = useState<string[]>([])
  const [result,     setResult]     = useState<string | null>(null)
  const [verified,   setVerified]   = useState<VerifyState>(null)
  const [error,      setError]      = useState<string | null>(null)

  const pair = ACID_BASE_PAIRS[pairIdx]
  const stepsState = useStepsPanelState(steps, generateHeatOfNeutralizationExample)

  function reset() { setSteps([]); setResult(null); setVerified(null); setError(null) }
  function handleClear() {
    setVAcid(''); setCacid(''); setVBase(''); setCbase('')
    setTiVal(''); setTfVal(''); setAnswerVal(''); reset()
  }

  function calculate() {
    reset()
    const va = parse(vAcid), ca = parse(cAcid), vb = parse(vBase), cb = parse(cBase)
    const ti = parse(tiVal),  tf = parse(tfVal)
    if ([va, ca, vb, cb, ti, tf].some(x => !ok(x))) { setError('Enter all six values.'); return }
    if (va <= 0 || ca <= 0 || vb <= 0 || cb <= 0)   { setError('Volumes and concentrations must be positive.'); return }
    const dT      = tf - ti
    const mTotal  = va + vb
    const q_soln  = mTotal * 4.184 * dT
    const q_rxn   = -q_soln
    const n_water = Math.min(
      (va / 1000) * ca / pair.acidRatio,
      (vb / 1000) * cb,
    )
    const dH = heatOfNeutralization(va, ca, vb, cb, pair.acidRatio, dT)
    const s: string[] = [
      `ΔT = ${fmtNum(tf)} − ${fmtNum(ti)} = ${fmtNum(dT)} °C`,
      `m_solution = ${fmtNum(va)} + ${fmtNum(vb)} = ${fmtNum(mTotal)} g  (assumes 1 g/mL)`,
      `q_solution = m × c × ΔT = ${fmtNum(mTotal)} × 4.184 × ${fmtNum(dT)} = ${fmtNum(q_soln)} J`,
      `q_rxn = −q_solution = ${fmtNum(q_rxn)} J`,
      `n(H₂O formed) = min(n_acid / ${pair.acidRatio}, n_base) = ${fmtNum(n_water)} mol`,
      `ΔH_neut = q_rxn / n / 1000 = ${fmtNum(dH)} kJ/mol`,
      dH < 0 ? `Negative ΔH → exothermic (strong acid + strong base ≈ −56 kJ/mol)` : `Positive ΔH → endothermic`,
    ]
    setSteps(s)
    setResult(fmtNum(dH))
    if (answerVal) {
      const userVal = parse(answerVal)
      setVerified(Math.abs(userVal - dH) / Math.abs(dH) <= 0.02 ? 'correct' : 'incorrect')
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        ΔH_neut = q_rxn / n(H₂O) · q_rxn = −m_soln × c × ΔT · c_soln = 4.184 J/(g·°C)
      </InfoBox>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Acid/base pair</label>
        <select value={pairIdx} onChange={e => { setPairIdx(Number(e.target.value)); reset() }}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary
                     focus:outline-none focus:border-muted transition-colors">
          {ACID_BASE_PAIRS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Volume of acid" value={vAcid}
          onChange={v => { setVAcid(sanitize(v)); reset() }} placeholder="mL"
          unit={<span className="font-mono text-sm text-secondary px-2">mL</span>} />
        <NumberField label="Conc. of acid" value={cAcid}
          onChange={v => { setCacid(sanitize(v)); reset() }} placeholder="M"
          unit={<span className="font-mono text-sm text-secondary px-2">M</span>} />
        <NumberField label="Volume of base" value={vBase}
          onChange={v => { setVBase(sanitize(v)); reset() }} placeholder="mL"
          unit={<span className="font-mono text-sm text-secondary px-2">mL</span>} />
        <NumberField label="Conc. of base" value={cBase}
          onChange={v => { setCbase(sanitize(v)); reset() }} placeholder="M"
          unit={<span className="font-mono text-sm text-secondary px-2">M</span>} />
        <NumberField label="T initial" value={tiVal}
          onChange={v => { setTiVal(sanitize(v)); reset() }} placeholder="°C"
          unit={<span className="font-mono text-sm text-secondary px-2">°C</span>} />
        <NumberField label="T final" value={tfVal}
          onChange={v => { setTfVal(sanitize(v)); reset() }} placeholder="°C"
          unit={<span className="font-mono text-sm text-secondary px-2">°C</span>} />
      </div>

      <NumberField label="Your ΔH_neut — optional, enter to check" value={answerVal}
        onChange={v => { setAnswerVal(sanitize(v)); setVerified(null) }} placeholder="kJ/mol"
        unit={<span className="font-mono text-sm text-secondary px-2">kJ/mol</span>} />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(vAcid || cAcid || vBase || cBase || tiVal || tfVal) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {result && <ResultDisplay label="ΔH_neut (heat of neutralization)" value={result} unit="kJ/mol" verified={verified} />}
    </div>
  )
}

// ── ΔU → ΔH conversion ───────────────────────────────────────────────────────

function generateDeltaUExample() {
  const deltaU = roundTo(randBetween(-600, -100), 1)
  const deltaN = Math.round(randBetween(-3, 3))
  const T      = 298.15
  const dH     = deltaUtoDeltaH(deltaU, deltaN, T)
  return {
    scenario: `For a reaction with ΔU = ${deltaU} kJ, Δn_gas = ${deltaN > 0 ? '+' : ''}${deltaN}, T = ${T} K. Find ΔH.`,
    steps: [
      `ΔH = ΔU + Δn × R × T`,
      `R = 8.314 × 10⁻³ kJ/(mol·K)`,
      `Δn × R × T = ${deltaN} × 0.008314 × ${T} = ${sig(deltaN * 0.008314 * T, 4)} kJ`,
      `ΔH = ${deltaU} + (${sig(deltaN * 0.008314 * T, 4)}) = ${sig(dH, 5)} kJ`,
    ],
    result: `ΔH = ${sig(dH, 4)} kJ`,
  }
}

function DeltaUToDeltaHMode() {
  const [duVal,   setDuVal]   = useState('')
  const [dnVal,   setDnVal]   = useState('')
  const [tVal,    setTVal]    = useState('298.15')
  const [steps,   setSteps]   = useState<string[]>([])
  const [result,  setResult]  = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, generateDeltaUExample)

  function reset() { setSteps([]); setResult(null); setError(null) }
  function handleClear() { setDuVal(''); setDnVal(''); setTVal('298.15'); reset() }

  function calculate() {
    reset()
    const du = parse(duVal), dn = parse(dnVal), T = parse(tVal)
    if (!ok(du) || !ok(dn) || !ok(T)) { setError('Enter all three values.'); return }
    if (T <= 0)   { setError('Temperature must be positive (K).'); return }
    const dH    = deltaUtoDeltaH(du, dn, T)
    const correction = dn * 0.008314 * T
    const s: string[] = [
      `ΔH = ΔU + Δn_gas × R × T`,
      `R = 8.314 × 10⁻³ kJ/(mol·K)`,
      `Δn_gas × R × T = ${fmtNum(dn)} × 0.008314 kJ/(mol·K) × ${fmtNum(T)} K = ${fmtNum(correction)} kJ`,
      `ΔH = ${fmtNum(du)} + (${fmtNum(correction)}) = ${fmtNum(dH)} kJ`,
      Math.abs(correction) < 0.5 ? `Correction is small (<1 kJ) — ΔH ≈ ΔU for this reaction` : '',
    ].filter(Boolean)
    setSteps(s)
    setResult(fmtNum(dH))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <InfoBox>
        ΔH = ΔU + Δn_gas × R × T · Δn_gas = (moles gas products) − (moles gas reactants) · R = 8.314×10⁻³ kJ/(mol·K)
      </InfoBox>

      <NumberField label="ΔU (internal energy change)" value={duVal}
        onChange={v => { setDuVal(sanitize(v)); reset() }} placeholder="kJ"
        unit={<span className="font-mono text-sm text-secondary px-2">kJ</span>} />

      <NumberField label="Δn_gas (moles gas products − reactants)" value={dnVal}
        onChange={v => { setDnVal(sanitize(v)); reset() }} placeholder="integer, e.g. −3"
        unit={<span className="font-mono text-sm text-secondary px-2">mol</span>} />

      <NumberField label="Temperature (T)" value={tVal}
        onChange={v => { setTVal(sanitize(v)); reset() }} placeholder="K"
        unit={<span className="font-mono text-sm text-secondary px-2">K</span>} />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}
      <div className="flex items-stretch gap-2">
        <CalcButton onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(duVal || dnVal) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {result && <ResultDisplay label="ΔH (enthalpy change)" value={result} unit="kJ" />}
      <p className="font-mono text-xs text-secondary">
        ΔH ≈ ΔU when Δn_gas = 0 · bomb calorimetry measures ΔU; constant-P measures ΔH
      </p>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function CalorimetryTool() {
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
          {mode === 'soln'   && <HeatOfSolutionMode />}
          {mode === 'neut'   && <HeatOfNeutralizationMode />}
          {mode === 'du-dh'  && <DeltaUToDeltaHMode />}
        </motion.div>
      </AnimatePresence>
      <p className="font-mono text-xs text-secondary">q = mcΔT · q_system = −q_surroundings · c_water = 4.184 J/(g·°C)</p>
    </div>
  )
}

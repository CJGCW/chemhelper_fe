import { useState } from 'react'
import { pick, randBetween, roundTo, sig } from '../shared/WorkedExample'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import ResultDisplay from '../shared/ResultDisplay'
import { sanitize } from '../../utils/calcHelpers'
import { expansionWork } from '../../chem/thermo'

// ── Unit helpers ──────────────────────────────────────────────────────────────

const P_UNITS = ['atm', 'kPa', 'bar'] as const
type PUnit = typeof P_UNITS[number]

const V_UNITS = ['L', 'mL', 'm³'] as const
type VUnit = typeof V_UNITS[number]

function toAtm(val: number, unit: PUnit): number {
  if (unit === 'atm') return val
  if (unit === 'kPa') return val / 101.325
  return val / 101.325   // 1 bar ≈ 100 kPa = 0.9869 atm
}

function toL(val: number, unit: VUnit): number {
  if (unit === 'L')  return val
  if (unit === 'mL') return val / 1000
  return val * 1000   // m³ → L
}

// ── Example generator ─────────────────────────────────────────────────────────

const GAS_EXAMPLES = [
  { gas: 'N₂', n: 1.0,  T: 298.15 },
  { gas: 'CO₂', n: 2.0, T: 298.15 },
  { gas: 'O₂', n: 0.5,  T: 350    },
  { gas: 'H₂', n: 3.0,  T: 298.15 },
]

function generateExpansionExample() {
  const { gas } = pick(GAS_EXAMPLES)
  const P  = roundTo(randBetween(0.5, 2.0), 2)    // atm
  const viL = roundTo(randBetween(1, 5), 1)
  const vfL = roundTo(viL + roundTo(randBetween(2, 15), 1), 1)
  const wJ  = expansionWork(P, viL, vfL)
  const wkJ = wJ / 1000
  return {
    scenario:
      `${gas} expands against a constant external pressure of ${P} atm. ` +
      `Volume increases from ${viL} L to ${vfL} L. Calculate the work done.`,
    steps: [
      `w = −P_ext × ΔV`,
      `ΔV = V_f − V_i = ${vfL} − ${viL} = ${roundTo(vfL - viL, 2)} L`,
      `Convert to SI: P = ${P} atm × 101325 Pa/atm = ${sig(P * 101325, 5)} Pa`,
      `ΔV = ${roundTo(vfL - viL, 2)} L × 10⁻³ m³/L = ${sig((vfL - viL) / 1000, 4)} m³`,
      `w = −(${sig(P * 101325, 5)} Pa)(${sig((vfL - viL) / 1000, 4)} m³) = ${sig(wJ, 4)} J`,
      wJ < 0 ? `Negative w → system does work on surroundings (expansion)` : `Positive w → surroundings do work on system (compression)`,
    ],
    result: `w = ${sig(wJ, 3)} J = ${sig(wkJ, 3)} kJ`,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n === 0) return '0'
  return parseFloat(n.toPrecision(6)).toString().replace(/\.?0+$/, '')
}

export default function ExpansionWorkTool() {
  const [pVal,   setPVal]   = useState('')
  const [pUnit,  setPUnit]  = useState<PUnit>('atm')
  const [viVal,  setViVal]  = useState('')
  const [vfVal,  setVfVal]  = useState('')
  const [vUnit,  setVUnit]  = useState<VUnit>('L')
  const [wUnit,  setWUnit]  = useState<'J' | 'kJ'>('J')

  const [steps,  setSteps]  = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [error,  setError]  = useState('')

  const stepsState = useStepsPanelState(steps, generateExpansionExample)

  function reset() { setSteps([]); setResult(null); setError('') }

  function handleCalc() {
    reset()
    const p  = parseFloat(pVal)
    const vi = parseFloat(viVal)
    const vf = parseFloat(vfVal)
    if (isNaN(p) || isNaN(vi) || isNaN(vf)) { setError('Enter all three values.'); return }
    if (p <= 0)  { setError('Pressure must be positive.'); return }

    const pAtm  = toAtm(p, pUnit)
    const viL   = toL(vi, vUnit)
    const vfL   = toL(vf, vUnit)
    const wJ    = expansionWork(pAtm, viL, vfL)
    const dVL   = vfL - viL
    const out   = wUnit === 'kJ' ? wJ / 1000 : wJ

    const s: string[] = [
      `w = −P_ext × ΔV   (constant external pressure)`,
      `ΔV = V_f − V_i = ${fmt(vfL)} L − ${fmt(viL)} L = ${fmt(dVL)} L`,
      pUnit !== 'atm' ? `P = ${fmt(p)} ${pUnit} → ${fmt(pAtm)} atm` : '',
      `Convert to SI: P = ${fmt(pAtm * 101325)} Pa;  ΔV = ${fmt(dVL / 1000)} m³`,
      `w = −(${fmt(pAtm * 101325)} Pa)(${fmt(dVL / 1000)} m³) = ${fmt(wJ)} J`,
      wUnit === 'kJ' ? `w = ${fmt(wJ)} J ÷ 1000 = ${fmt(wJ / 1000)} kJ` : '',
      wJ < 0 ? `w < 0: system does work on surroundings (expansion)` : `w > 0: surroundings do work on system (compression)`,
    ].filter(Boolean)

    setSteps(s)
    setResult(fmt(out))
  }

  const UnitBtn = ({ u, cur, set }: { u: string; cur: string; set: (v: string) => void }) => (
    <button onClick={() => { set(u); reset() }}
      className="px-2 py-1 rounded-sm font-mono text-xs font-medium transition-colors"
      style={cur === u ? {
        background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
        color: 'var(--c-halogen)',
      } : {
        background: 'rgb(var(--color-raised))',
        border: '1px solid rgb(var(--color-border))',
        color: 'rgba(var(--overlay),0.45)',
      }}>
      {u}
    </button>
  )

  const canCalc = pVal.trim() !== '' && viVal.trim() !== '' && vfVal.trim() !== ''

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Calculates work for a constant-external-pressure (irreversible) expansion or compression.
        <span className="font-mono"> w = −P_ext × ΔV</span>
      </p>

      {/* Pressure */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">External pressure (P_ext)</label>
        <div className="flex items-stretch gap-1.5">
          <input type="text" inputMode="decimal" value={pVal}
            onChange={e => { setPVal(sanitize(e.target.value)); reset() }}
            placeholder="e.g. 1.00"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40" />
          <div className="flex items-center gap-0.5">
            {P_UNITS.map(u => <UnitBtn key={u} u={u} cur={pUnit} set={v => setPUnit(v as PUnit)} />)}
          </div>
        </div>
      </div>

      {/* Volumes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Volume</label>
        <div className="flex items-center gap-0.5 mb-1">
          {V_UNITS.map(u => <UnitBtn key={u} u={u} cur={vUnit} set={v => setVUnit(v as VUnit)} />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="V initial" value={viVal}
            onChange={v => { setViVal(sanitize(v)); reset() }}
            placeholder={`${vUnit}`}
            unit={<span className="font-mono text-sm text-secondary px-2">{vUnit}</span>} />
          <NumberField label="V final" value={vfVal}
            onChange={v => { setVfVal(sanitize(v)); reset() }}
            placeholder={`${vUnit}`}
            unit={<span className="font-mono text-sm text-secondary px-2">{vUnit}</span>} />
        </div>
      </div>

      {/* Output unit */}
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm font-medium text-primary">Output unit:</span>
        <div className="flex items-center gap-0.5">
          {(['J', 'kJ'] as const).map(u => <UnitBtn key={u} u={u} cur={wUnit} set={v => setWUnit(v as 'J' | 'kJ')} />)}
        </div>
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalc} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color:      'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && <ResultDisplay label="Work (w)" value={result} unit={wUnit} />}

      <p className="font-mono text-xs text-secondary">
        w = −P_ext·ΔV · negative w = expansion (system does work) · positive w = compression
      </p>
    </div>
  )
}

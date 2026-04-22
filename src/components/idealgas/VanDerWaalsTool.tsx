import { useState } from 'react'
import { pick, randBetween, roundTo } from '../calculations/WorkedExample'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../calculations/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../calculations/SigFigPanel'
import NumberField from '../calculations/NumberField'
import { buildSigFigBreakdown } from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'
import { VDW_GASES, type VdWGas } from '../../utils/vanDerWaalsPractice'

const R = 0.082057

function sig(v: number, n = 4) { return parseFloat(v.toPrecision(n)).toString() }

// ── Example generator ─────────────────────────────────────────────────────────

function generateVanDerWaalsExample() {
  const gas = pick(VDW_GASES)
  const n   = roundTo(randBetween(0.5, 3.0), 1)
  const V   = roundTo(randBetween(n * gas.b * 2 + 0.5, 5.0), 1)
  const T   = roundTo(randBetween(250, 500), 0)
  const volumeCorr = V - n * gas.b
  const pressCorr  = gas.a * (n / V) ** 2
  const idealTerm  = (n * R * T) / volumeCorr
  const realP      = idealTerm - pressCorr
  const idealP     = (n * R * T) / V
  return {
    scenario: `Calculate the pressure of ${n} mol ${gas.name} in ${V} L at ${T} K using the van der Waals equation. (a = ${gas.a}, b = ${gas.b})`,
    steps: [
      `P = nRT / (V − nb) − a(n/V)²`,
      `V − nb = ${sig(V, 3)} − (${sig(n, 2)} × ${gas.b}) = ${sig(volumeCorr, 4)} L`,
      `nRT/(V−nb) = ${sig(n, 2)} × ${R} × ${sig(T, 4)} / ${sig(volumeCorr, 4)} = ${sig(idealTerm, 4)} atm`,
      `a(n/V)² = ${gas.a} × (${sig(n, 2)}/${sig(V, 3)})² = ${sig(pressCorr, 4)} atm`,
      `P(real) = ${sig(idealTerm, 4)} − ${sig(pressCorr, 4)} = ${sig(realP, 4)} atm`,
      `P(ideal) = nRT/V = ${sig(idealP, 4)} atm`,
    ],
    result: `P(real) = ${sig(realP, 4)} atm`,
  }
}

// ── Unit pill ─────────────────────────────────────────────────────────────────

function UnitPill({
  options, active, onChange,
}: { options: readonly string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className="px-2 py-0.5 rounded-sm font-mono text-xs transition-colors"
          style={active === o ? {
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          } : {
            border: '1px solid rgba(var(--overlay),0.12)',
            color: 'rgba(var(--overlay),0.35)',
          }}
        >{o}</button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface CalcResult {
  idealP:       number
  realP:        number
  deviationPct: number
}

export default function VanDerWaalsTool() {
  const [gas,    setGas]    = useState<VdWGas>(VDW_GASES[4])
  const [nVal,   setNVal]   = useState('')
  const [vVal,   setVVal]   = useState('')
  const [tVal,   setTVal]   = useState('')
  const [tUnit,  setTUnit]  = useState<'K' | '°C'>('K')
  const [result, setResult] = useState<CalcResult | null>(null)
  const [steps,  setSteps]  = useState<string[]>([])
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null)
  const [sfOpen, setSfOpen] = useState(false)
  const [error,  setError]  = useState('')

  const stepsState = useStepsPanelState(steps, generateVanDerWaalsExample)

  function handleTool() {
    setError(''); setResult(null); setSteps([]); setBreakdown(null)
    const n   = parseFloat(nVal)
    const V   = parseFloat(vVal)
    const Tin = parseFloat(tVal)
    if (isNaN(n) || isNaN(V) || isNaN(Tin)) { setError('Enter values for n, V, and T.'); return }
    if (n <= 0 || V <= 0) { setError('n and V must be positive.'); return }
    const T = tUnit === '°C' ? Tin + 273.15 : Tin
    if (T <= 0) { setError('Temperature must be above 0 K.'); return }
    if (V <= n * gas.b) { setError(`Volume too small for this amount of gas (V must exceed nb = ${sig(n * gas.b)} L).`); return }

    const idealP     = (n * R * T) / V
    const volumeCorr = V - n * gas.b
    const pressCorr  = gas.a * (n / V) ** 2
    const idealTerm  = (n * R * T) / volumeCorr
    const realP      = idealTerm - pressCorr
    if (realP <= 0) { setError('Van der Waals gives non-physical pressure at these conditions. Try lower n or larger V.'); return }

    const deviationPct = ((realP - idealP) / idealP) * 100

    const newSteps = [
      `van der Waals: P = nRT / (V − nb) − a(n/V)²`,
      `For ${gas.name}: a = ${gas.a} L²·atm/mol²,  b = ${gas.b} L/mol`,
      `Volume correction: V − nb = ${sig(V, 4)} − (${sig(n, 3)} × ${gas.b}) = ${sig(volumeCorr, 4)} L`,
      `Ideal-gas term: nRT/(V−nb) = ${sig(n,3)} × ${R} × ${sig(T,4)} / ${sig(volumeCorr,4)} = ${sig(idealTerm,4)} atm`,
      `Pressure correction: a(n/V)² = ${gas.a} × (${sig(n,3)}/${sig(V,3)})² = ${sig(pressCorr,4)} atm`,
      `P(real) = ${sig(idealTerm,4)} − ${sig(pressCorr,4)} = ${sig(realP,4)} atm`,
      `P(ideal) = nRT/V = ${sig(idealP,4)} atm   (deviation: ${deviationPct >= 0 ? '+' : ''}${sig(deviationPct,3)}%)`,
    ]

    setSteps(newSteps)
    setResult({ idealP, realP, deviationPct })
    setBreakdown(buildSigFigBreakdown(
      [{ label: 'Moles (n)', value: nVal }, { label: 'Volume (V)', value: vVal }, { label: 'Temperature (T)', value: tVal }],
      realP, 'atm',
    ))
  }

  function handleClear() {
    setNVal(''); setVVal(''); setTVal('')
    setResult(null); setSteps([]); setBreakdown(null); setError('')
  }

  const devColor = result
    ? Math.abs(result.deviationPct) < 2  ? '#4ade80'
    : Math.abs(result.deviationPct) < 10 ? '#fbbf24'
    : '#f87171'
    : 'var(--c-halogen)'

  return (
    <div className="flex flex-col gap-5">

      {/* Gas selector */}
      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-primary">Select gas</span>
        <div className="flex flex-wrap gap-1.5">
          {VDW_GASES.map(g => (
            <button key={g.formula} onClick={() => { setGas(g); setResult(null) }}
              className="px-2.5 py-1 rounded-sm font-mono text-sm transition-colors"
              style={gas.formula === g.formula ? {
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                border: '1px solid rgba(var(--overlay),0.12)',
                color: 'rgba(var(--overlay),0.45)',
              }}>
              {g.formula}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-dim">
          {gas.name} — a = {gas.a} L²·atm/mol²,  b = {gas.b} L/mol
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NumberField
          label="n — Moles"
          value={nVal}
          onChange={v => { setNVal(v); setResult(null) }}
          placeholder="e.g. 1.00"
          unit={<span className="font-mono text-sm text-secondary px-2">mol</span>}
        />
        <NumberField
          label="V — Volume"
          value={vVal}
          onChange={v => { setVVal(v); setResult(null) }}
          placeholder="e.g. 2.00"
          unit={<span className="font-mono text-sm text-secondary px-2">L</span>}
        />
        <NumberField
          label="T — Temperature"
          value={tVal}
          onChange={v => { setTVal(v); setResult(null) }}
          placeholder="e.g. 300"
          unit={<UnitPill options={['K', '°C']} active={tUnit} onChange={v => { setTUnit(v as 'K' | '°C'); setResult(null) }} />}
        />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {/* Buttons */}
      <div className="flex items-stretch gap-2">
        <button onClick={handleTool}
          disabled={!nVal.trim() || !vVal.trim() || !tVal.trim()}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        {(nVal || vVal || tVal || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />

      {/* Dual result display */}
      {result && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary uppercase tracking-widest">Ideal Gas</span>
              <span className="font-mono text-2xl font-bold text-secondary">
                {sig(result.idealP, 4)} atm
              </span>
              <span className="font-mono text-xs text-dim">PV = nRT</span>
            </div>
            <div className="rounded-sm border p-4 flex flex-col gap-1"
              style={{
                borderColor: `color-mix(in srgb, ${devColor} 40%, transparent)`,
                background: `color-mix(in srgb, ${devColor} 8%, rgb(var(--color-surface)))`,
              }}>
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: devColor, opacity: 0.7 }}>
                Real Gas (vdW)
              </span>
              <span className="font-mono text-2xl font-bold" style={{ color: devColor }}>
                {sig(result.realP, 4)} atm
              </span>
              <span className="font-mono text-xs" style={{ color: devColor, opacity: 0.6 }}>
                {result.deviationPct >= 0 ? '+' : ''}{sig(result.deviationPct, 3)}% vs ideal
              </span>
            </div>
          </div>

          <p className="font-mono text-xs text-secondary">
            {Math.abs(result.deviationPct) < 2
              ? 'Very small deviation — gas behaves nearly ideally at these conditions.'
              : result.deviationPct < 0
              ? 'Real pressure is lower than ideal — intermolecular attraction dominates (high density or polar gas).'
              : 'Real pressure is higher than ideal — molecular volume (repulsion) dominates (very high pressure).'}
          </p>
        </div>
      )}

      <p className="font-mono text-xs text-secondary">
        Van der Waals constants from Atkins' Physical Chemistry.
        Valid for pure gases — not mixtures. Significant deviations expected at high pressure or near the critical point.
      </p>
    </div>
  )
}

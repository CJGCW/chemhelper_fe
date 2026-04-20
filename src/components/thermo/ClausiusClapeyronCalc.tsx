import { useState, useMemo } from 'react'
import WorkedExample from '../calculations/WorkedExample'
import { generateClausiusClapeyronExample } from './ClausiusClapeyronPractice'

const R = 8.314  // J/(mol·K)

type SolveFor = 'P1' | 'P2' | 'T1' | 'T2' | 'dHvap'
type PUnit = 'Pa' | 'kPa' | 'atm' | 'mmHg'
type TUnit = 'K' | '°C'
type HUnit = 'J/mol' | 'kJ/mol'

const P_TO_PA: Record<PUnit, number> = { Pa: 1, kPa: 1e3, atm: 101325, mmHg: 133.322 }
const tToK   = (v: number, u: TUnit) => u === '°C' ? v + 273.15 : v
const hToJ   = (v: number, u: HUnit) => u === 'kJ/mol' ? v * 1e3 : v

// ── Solver ─────────────────────────────────────────────────────────────────────

function computeResult(
  sf: SolveFor,
  P1_Pa: number, P2_Pa: number,
  T1_K:  number, T2_K:  number,
  dH_J:  number,
): number | null {
  const ok = (x: number) => isFinite(x) && x > 0
  switch (sf) {
    case 'P2':
      if (!ok(P1_Pa) || !ok(T1_K) || !ok(T2_K) || !ok(dH_J)) return null
      return P1_Pa * Math.exp((-dH_J / R) * (1 / T2_K - 1 / T1_K))
    case 'P1':
      if (!ok(P2_Pa) || !ok(T1_K) || !ok(T2_K) || !ok(dH_J)) return null
      return P2_Pa / Math.exp((-dH_J / R) * (1 / T2_K - 1 / T1_K))
    case 'T2': {
      if (!ok(P1_Pa) || !ok(P2_Pa) || !ok(T1_K) || !ok(dH_J)) return null
      const inv = 1 / T1_K - (R * Math.log(P2_Pa / P1_Pa)) / dH_J
      return inv > 0 ? 1 / inv : null
    }
    case 'T1': {
      if (!ok(P1_Pa) || !ok(P2_Pa) || !ok(T2_K) || !ok(dH_J)) return null
      const inv = 1 / T2_K + (R * Math.log(P2_Pa / P1_Pa)) / dH_J
      return inv > 0 ? 1 / inv : null
    }
    case 'dHvap': {
      if (!ok(P1_Pa) || !ok(P2_Pa) || !ok(T1_K) || !ok(T2_K)) return null
      const dInvT = 1 / T2_K - 1 / T1_K
      if (Math.abs(dInvT) < 1e-20) return null
      const v = -R * Math.log(P2_Pa / P1_Pa) / dInvT
      return v > 0 ? v : null
    }
  }
}

// ── Step-by-step ───────────────────────────────────────────────────────────────

interface Step { label: string; expr: string }

function sig(n: number, s = 4) {
  if (!isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e5 || (abs < 0.01 && abs > 0)) return n.toExponential(s - 1)
  return n.toPrecision(s)
}

function buildSteps(
  sf: SolveFor,
  P1: number, P2: number, T1: number, T2: number, dH: number,
  result: number,
): Step[] {
  const steps: Step[] = []
  const lnP = Math.log(P2 / P1)
  const dInvT = 1 / T2 - 1 / T1

  steps.push({ label: 'Formula', expr: 'ln(P₂/P₁) = −(ΔH_vap / R) × (1/T₂ − 1/T₁)' })

  switch (sf) {
    case 'P2':
    case 'P1': {
      const rearranged = sf === 'P2'
        ? 'P₂ = P₁ × exp[−(ΔH_vap/R) × (1/T₂ − 1/T₁)]'
        : 'P₁ = P₂ / exp[−(ΔH_vap/R) × (1/T₂ − 1/T₁)]'
      steps.push({ label: 'Rearrange', expr: rearranged })
      steps.push({
        label: '1/T₂ − 1/T₁',
        expr: `1/${T2.toFixed(2)} − 1/${T1.toFixed(2)} = ${dInvT.toExponential(4)} K⁻¹`,
      })
      const exponent = (-dH / R) * dInvT
      steps.push({
        label: 'Exponent',
        expr: `−(${sig(dH)} / 8.314) × ${dInvT.toExponential(4)} = ${exponent.toFixed(4)}`,
      })
      const factor = Math.exp(exponent)
      const P_ref = sf === 'P2' ? P1 : P2
      steps.push({
        label: 'e^(exponent)',
        expr: `e^(${exponent.toFixed(4)}) = ${factor.toFixed(4)}`,
      })
      steps.push({
        label: sf === 'P2' ? 'P₂' : 'P₁',
        expr: `${sig(P_ref)} Pa × ${factor.toFixed(4)} = ${sig(result)} Pa`,
      })
      break
    }
    case 'T2':
    case 'T1': {
      const rearranged = sf === 'T2'
        ? '1/T₂ = 1/T₁ − (R / ΔH_vap) × ln(P₂/P₁)'
        : '1/T₁ = 1/T₂ + (R / ΔH_vap) × ln(P₂/P₁)'
      steps.push({ label: 'Rearrange', expr: rearranged })
      steps.push({
        label: 'ln(P₂/P₁)',
        expr: `ln(${sig(P2)} / ${sig(P1)}) = ${lnP.toFixed(4)}`,
      })
      const correction = (R / dH) * lnP
      const T_ref = sf === 'T2' ? T1 : T2
      const inv_ref = 1 / T_ref
      const inv_result = sf === 'T2' ? inv_ref - correction : inv_ref + correction
      const sign = sf === 'T2' ? '−' : '+'
      steps.push({
        label: `1/${sf === 'T2' ? 'T₂' : 'T₁'}`,
        expr: `1/${T_ref.toFixed(2)} ${sign} (8.314/${sig(dH)}) × ${lnP.toFixed(4)} = ${inv_result.toExponential(5)} K⁻¹`,
      })
      steps.push({
        label: sf === 'T2' ? 'T₂' : 'T₁',
        expr: `1 / ${inv_result.toExponential(5)} = ${sig(result)} K`,
      })
      break
    }
    case 'dHvap':
      steps.push({ label: 'Rearrange', expr: 'ΔH_vap = −R × ln(P₂/P₁) / (1/T₂ − 1/T₁)' })
      steps.push({
        label: 'ln(P₂/P₁)',
        expr: `ln(${sig(P2)} / ${sig(P1)}) = ${lnP.toFixed(4)}`,
      })
      steps.push({
        label: '1/T₂ − 1/T₁',
        expr: `1/${T2.toFixed(2)} − 1/${T1.toFixed(2)} = ${dInvT.toExponential(4)} K⁻¹`,
      })
      steps.push({
        label: 'ΔH_vap',
        expr: `−8.314 × ${lnP.toFixed(4)} / ${dInvT.toExponential(4)} = ${sig(result)} J/mol`,
      })
      break
  }
  return steps
}

// ── Input component ────────────────────────────────────────────────────────────

function FieldInput({
  label, value, onChange, unit, onUnitChange, units, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void
  unit: string; onUnitChange: (u: string) => void; units: string[]
  disabled: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</span>
      <div className="flex">
        <input
          type="number"
          value={disabled ? '' : value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? 'solving…' : ''}
          className="flex-1 min-w-0 h-9 rounded-l-sm border border-border bg-raised px-3 font-mono text-sm
                     text-bright focus:outline-none focus:border-muted placeholder:text-dim
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface"
        />
        <select
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          className="h-9 px-2 rounded-r-sm border border-l-0 border-border bg-surface
                     font-mono text-xs text-secondary focus:outline-none cursor-pointer"
        >
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  )
}

// ── Result display ─────────────────────────────────────────────────────────────

function ResultCard({ sf, result }: { sf: SolveFor; result: number }) {
  const rows: { label: string; value: string }[] = []

  if (sf === 'P1' || sf === 'P2') {
    rows.push({ label: 'Pa',   value: sig(result, 5)   })
    rows.push({ label: 'kPa',  value: sig(result / 1e3, 4)  })
    rows.push({ label: 'atm',  value: sig(result / 101325, 4) })
    rows.push({ label: 'mmHg', value: sig(result / 133.322, 4) })
  } else if (sf === 'T1' || sf === 'T2') {
    rows.push({ label: 'K',  value: sig(result, 5) })
    rows.push({ label: '°C', value: sig(result - 273.15, 4) })
  } else {
    rows.push({ label: 'J/mol',  value: sig(result, 5) })
    rows.push({ label: 'kJ/mol', value: sig(result / 1e3, 4) })
  }

  const varLabel: Record<SolveFor, string> = { P1: 'P₁', P2: 'P₂', T1: 'T₁', T2: 'T₂', dHvap: 'ΔH_vap' }

  return (
    <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-3">
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">Result</span>
      <div className="flex flex-wrap gap-4">
        {rows.map(r => (
          <div key={r.label} className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-secondary">{varLabel[sf]} ({r.label})</span>
            <span className="font-mono text-lg font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

const SOLVE_OPTIONS: { id: SolveFor; label: string; sub: string }[] = [
  { id: 'P1',    label: 'P₁',     sub: 'initial pressure'  },
  { id: 'P2',    label: 'P₂',     sub: 'final pressure'    },
  { id: 'T1',    label: 'T₁',     sub: 'initial temp'      },
  { id: 'T2',    label: 'T₂',     sub: 'final temp'        },
  { id: 'dHvap', label: 'ΔH_vap', sub: 'enthalpy of vap.'  },
]

export default function ClausiusClapeyronCalc() {
  const [sf,    setSf]    = useState<SolveFor>('P2')
  const [p1,    setP1]    = useState('101.325')
  const [p2,    setP2]    = useState('')
  const [t1,    setT1]    = useState('100')
  const [t2,    setT2]    = useState('80')
  const [dh,    setDh]    = useState('40.7')
  const [pu1,   setPu1]   = useState<PUnit>('kPa')
  const [pu2,   setPu2]   = useState<PUnit>('kPa')
  const [tu1,   setTu1]   = useState<TUnit>('°C')
  const [tu2,   setTu2]   = useState<TUnit>('°C')
  const [hu,    setHu]    = useState<HUnit>('kJ/mol')

  const [showSteps, setShowSteps] = useState(false)

  const vals = useMemo(() => {
    const P1_Pa = parseFloat(p1) * P_TO_PA[pu1]
    const P2_Pa = parseFloat(p2) * P_TO_PA[pu2]
    const T1_K  = tToK(parseFloat(t1), tu1)
    const T2_K  = tToK(parseFloat(t2), tu2)
    const dH_J  = hToJ(parseFloat(dh), hu)
    return { P1_Pa, P2_Pa, T1_K, T2_K, dH_J }
  }, [p1, p2, t1, t2, dh, pu1, pu2, tu1, tu2, hu])

  const result = useMemo(
    () => computeResult(sf, vals.P1_Pa, vals.P2_Pa, vals.T1_K, vals.T2_K, vals.dH_J),
    [sf, vals],
  )

  const steps = useMemo(() => {
    if (result === null) return []
    return buildSteps(sf, vals.P1_Pa, vals.P2_Pa, vals.T1_K, vals.T2_K, vals.dH_J, result)
  }, [sf, vals, result])

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      <WorkedExample generate={generateClausiusClapeyronExample} />

      {/* Solve-for selector */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Solve for</span>
        <div className="flex flex-wrap gap-2">
          {SOLVE_OPTIONS.map(o => (
            <button key={o.id} onClick={() => setSf(o.id)}
              className="flex flex-col items-start px-3 py-2 rounded-sm border transition-colors text-left"
              style={sf === o.id ? {
                borderColor: 'color-mix(in srgb, var(--c-halogen) 50%, transparent)',
                background:  'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
                color: 'var(--c-halogen)',
              } : {
                borderColor: 'rgb(var(--color-border))', background: 'rgb(var(--color-surface))',
                color: 'rgba(var(--overlay),0.45)',
              }}>
              <span className="font-mono text-sm font-semibold">{o.label}</span>
              <span className="font-mono text-[9px] opacity-60">{o.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldInput label="P₁ — initial pressure"
          value={p1} onChange={setP1} unit={pu1} onUnitChange={u => setPu1(u as PUnit)}
          units={['Pa','kPa','atm','mmHg']} disabled={sf === 'P1'} />
        <FieldInput label="P₂ — final pressure"
          value={p2} onChange={setP2} unit={pu2} onUnitChange={u => setPu2(u as PUnit)}
          units={['Pa','kPa','atm','mmHg']} disabled={sf === 'P2'} />
        <FieldInput label="T₁ — initial temperature"
          value={t1} onChange={setT1} unit={tu1} onUnitChange={u => setTu1(u as TUnit)}
          units={['K','°C']} disabled={sf === 'T1'} />
        <FieldInput label="T₂ — final temperature"
          value={t2} onChange={setT2} unit={tu2} onUnitChange={u => setTu2(u as TUnit)}
          units={['K','°C']} disabled={sf === 'T2'} />
        <FieldInput label="ΔH_vap — enthalpy of vaporization"
          value={dh} onChange={setDh} unit={hu} onUnitChange={u => setHu(u as HUnit)}
          units={['J/mol','kJ/mol']} disabled={sf === 'dHvap'} />
      </div>

      {/* Note about pressure units */}
      <p className="font-sans text-xs text-secondary -mt-4 px-0.5">
        P₁ and P₂ appear as a ratio — any consistent pressure unit works as long as both use the same unit.
      </p>

      {/* Result */}
      {result !== null ? (
        <ResultCard sf={sf} result={result} />
      ) : (
        <div className="rounded-sm border border-border px-4 py-3 text-secondary font-sans text-sm">
          Enter the four known values above to solve for {SOLVE_OPTIONS.find(o => o.id === sf)?.label}.
        </div>
      )}

      {/* Step-by-step */}
      {steps.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowSteps(s => !s)}
            className="flex items-center gap-2 font-mono text-xs text-secondary tracking-widest uppercase
                       hover:text-secondary transition-colors self-start">
            <span>{showSteps ? '▾' : '▸'}</span>
            <span>Step-by-step working</span>
          </button>
          {showSteps && (
            <div className="rounded-sm border border-border overflow-hidden">
              <table className="w-full text-xs font-mono">
                <tbody>
                  {steps.map((s, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 text-dim whitespace-nowrap w-28 border-r border-border bg-raised">
                        {s.label}
                      </td>
                      <td className="px-3 py-2 text-secondary">{s.expr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

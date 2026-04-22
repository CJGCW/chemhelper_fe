import { useState, useMemo } from 'react'

const R = 8.314

// ── Substance data ─────────────────────────────────────────────────────────────

interface Substance {
  name: string
  formula: string
  dHvap: number   // kJ/mol at normal bp
  bp: number      // °C at 1 atm
}

const SUBSTANCES: Substance[] = [
  { name: 'Water',             formula: 'H₂O',         dHvap: 40.7,  bp: 100.0  },
  { name: 'Ethanol',           formula: 'C₂H₅OH',      dHvap: 38.6,  bp: 78.4   },
  { name: 'Methanol',          formula: 'CH₃OH',        dHvap: 35.3,  bp: 64.7   },
  { name: 'Benzene',           formula: 'C₆H₆',         dHvap: 30.7,  bp: 80.1   },
  { name: 'Diethyl ether',     formula: '(C₂H₅)₂O',    dHvap: 27.1,  bp: 34.6   },
  { name: 'Acetone',           formula: '(CH₃)₂CO',     dHvap: 31.3,  bp: 56.1   },
  { name: 'Chloroform',        formula: 'CHCl₃',        dHvap: 31.4,  bp: 61.2   },
  { name: 'Ammonia',           formula: 'NH₃',          dHvap: 23.35, bp: -33.4  },
  { name: 'Cyclohexane',       formula: 'C₆H₁₂',       dHvap: 29.9,  bp: 80.7   },
  { name: 'Acetic acid',       formula: 'CH₃COOH',      dHvap: 51.6,  bp: 117.9  },
  { name: 'Toluene',           formula: 'C₇H₈',         dHvap: 33.2,  bp: 110.6  },
  { name: 'Hexane',            formula: 'C₆H₁₄',        dHvap: 28.9,  bp: 68.7   },
]

const CUSTOM_ID = '__custom__'

type TUnit = 'K' | '°C'
type PUnit = 'Pa' | 'kPa' | 'atm' | 'mmHg'
const P_LABELS: PUnit[] = ['Pa', 'kPa', 'atm', 'mmHg']
const P_FROM_PA: Record<PUnit, number> = { Pa: 1, kPa: 1e3, atm: 101325, mmHg: 133.322 }

function tToK(v: number, u: TUnit) { return u === '°C' ? v + 273.15 : v }
function sig(n: number, s = 4) {
  if (!isFinite(n) || n <= 0) return '—'
  return n.toPrecision(s)
}
function fmtP(Pa: number, u: PUnit) {
  const v = Pa / P_FROM_PA[u]
  if (u === 'Pa') return `${Math.round(v).toLocaleString()} Pa`
  return `${sig(v, 4)} ${u}`
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function VaporPressureTool() {
  const [substanceId, setSubstanceId] = useState<string>(SUBSTANCES[0].name)
  const [customDh,  setCustomDh]  = useState('40.7')
  const [customT1,  setCustomT1]  = useState('100')
  const [customP1,  setCustomP1]  = useState('101.325')
  const [customPu1, setCustomPu1] = useState<PUnit>('kPa')
  const [t2,        setT2]        = useState('80')
  const [tu2,       setTu2]       = useState<TUnit>('°C')
  const [showSteps, setShowSteps] = useState(false)

  const isCustom = substanceId === CUSTOM_ID
  const substance = SUBSTANCES.find(s => s.name === substanceId) ?? null

  // Derived reference values
  const dH_J = useMemo(() => {
    if (isCustom) return parseFloat(customDh) * 1e3
    return (substance?.dHvap ?? NaN) * 1e3
  }, [isCustom, customDh, substance])

  const P1_Pa = useMemo(() => {
    if (isCustom) return parseFloat(customP1) * P_FROM_PA[customPu1]
    return 101325
  }, [isCustom, customP1, customPu1])

  const T1_K = useMemo(() => {
    if (isCustom) return tToK(parseFloat(customT1), '°C')
    return (substance?.bp ?? NaN) + 273.15
  }, [isCustom, customT1, substance])

  const T2_K = useMemo(() => tToK(parseFloat(t2), tu2), [t2, tu2])

  const P2_Pa = useMemo(() => {
    if (!isFinite(dH_J) || dH_J <= 0) return null
    if (!isFinite(P1_Pa) || P1_Pa <= 0) return null
    if (!isFinite(T1_K) || T1_K <= 0) return null
    if (!isFinite(T2_K) || T2_K <= 0) return null
    const v = P1_Pa * Math.exp((-dH_J / R) * (1 / T2_K - 1 / T1_K))
    return isFinite(v) && v > 0 ? v : null
  }, [dH_J, P1_Pa, T1_K, T2_K])

  // Context note
  const contextNote = useMemo(() => {
    if (P2_Pa === null) return null
    const atm = P2_Pa / 101325
    if (atm > 0.95 && atm < 1.05)
      return 'Vapor pressure ≈ 1 atm — this is approximately the normal boiling point.'
    if (atm < 0.01)
      return 'Very low vapor pressure — substance is mostly liquid at this temperature.'
    if (atm > 5)
      return 'High vapor pressure — above the normal boiling point; substance would be a gas at 1 atm.'
    return null
  }, [P2_Pa])

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* Substance selector */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Substance</span>
        <div className="flex flex-wrap gap-1.5">
          {SUBSTANCES.map(s => (
            <button key={s.name} onClick={() => setSubstanceId(s.name)}
              className="flex flex-col items-start px-3 py-1.5 rounded-sm border transition-colors text-left"
              style={substanceId === s.name ? {
                borderColor: 'color-mix(in srgb, var(--c-halogen) 50%, transparent)',
                background:  'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
                color: 'var(--c-halogen)',
              } : {
                borderColor: 'rgb(var(--color-border))', background: 'rgb(var(--color-surface))',
                color: 'rgba(var(--overlay),0.45)',
              }}>
              <span className="font-mono text-xs font-semibold">{s.name}</span>
              <span className="font-mono text-[9px] opacity-60">{s.formula} · {s.dHvap} kJ/mol</span>
            </button>
          ))}
          <button onClick={() => setSubstanceId(CUSTOM_ID)}
            className="flex flex-col items-start px-3 py-1.5 rounded-sm border transition-colors text-left"
            style={isCustom ? {
              borderColor: 'color-mix(in srgb, var(--c-halogen) 50%, transparent)',
              background:  'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
              color: 'var(--c-halogen)',
            } : {
              borderColor: 'rgb(var(--color-border))', background: 'rgb(var(--color-surface))',
              color: 'rgba(var(--overlay),0.45)',
            }}>
            <span className="font-mono text-xs font-semibold">Custom</span>
            <span className="font-mono text-[9px] opacity-60">enter your own values</span>
          </button>
        </div>
      </div>

      {/* Reference point — locked for presets, editable for custom */}
      <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-4">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Reference Point (T₁, P₁)</span>
        {!isCustom && substance ? (
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">T₁ — normal boiling point</span>
              <span className="font-mono text-sm text-primary">
                {substance.bp.toFixed(1)} °C
                <span className="text-dim text-xs ml-2">= {(substance.bp + 273.15).toFixed(2)} K</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">P₁</span>
              <span className="font-mono text-sm text-primary">
                1.000 atm
                <span className="text-dim text-xs ml-2">= 101,325 Pa</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">ΔH_vap</span>
              <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
                {substance.dHvap} kJ/mol
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Custom T1 */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary">T₁ (°C)</span>
              <input type="number" value={customT1} onChange={e => setCustomT1(e.target.value)}
                className="h-9 rounded-sm border border-border bg-raised px-3 font-mono text-sm
                           text-bright focus:outline-none focus:border-muted" />
            </div>
            {/* Custom P1 */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary">P₁</span>
              <div className="flex">
                <input type="number" value={customP1} onChange={e => setCustomP1(e.target.value)}
                  className="flex-1 min-w-0 h-9 rounded-l-sm border border-border bg-raised px-3 font-mono text-sm
                             text-bright focus:outline-none focus:border-muted" />
                <select value={customPu1} onChange={e => setCustomPu1(e.target.value as PUnit)}
                  className="h-9 px-2 rounded-r-sm border border-l-0 border-border bg-surface
                             font-mono text-xs text-secondary focus:outline-none cursor-pointer">
                  {P_LABELS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            {/* Custom dHvap */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary">ΔH_vap (kJ/mol)</span>
              <input type="number" value={customDh} onChange={e => setCustomDh(e.target.value)}
                className="h-9 rounded-sm border border-border bg-raised px-3 font-mono text-sm
                           text-bright focus:outline-none focus:border-muted" />
            </div>
          </div>
        )}
      </div>

      {/* Target temperature */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Target Temperature (T₂)</span>
        <div className="flex items-center gap-2 max-w-xs">
          <input type="number" value={t2} onChange={e => setT2(e.target.value)}
            className="flex-1 h-9 rounded-l-sm border border-border bg-raised px-3 font-mono text-sm
                       text-bright focus:outline-none focus:border-muted" />
          <select value={tu2} onChange={e => setTu2(e.target.value as TUnit)}
            className="h-9 px-3 rounded-r-sm border border-l-0 border-border bg-surface
                       font-mono text-xs text-secondary focus:outline-none cursor-pointer">
            <option value="°C">°C</option>
            <option value="K">K</option>
          </select>
        </div>
        {isFinite(T2_K) && T2_K > 0 && (
          <span className="font-mono text-xs text-secondary px-0.5">
            = {T2_K.toFixed(2)} K
          </span>
        )}
      </div>

      {/* Result */}
      {P2_Pa !== null ? (
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-4">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">
            Vapor Pressure at {t2} {tu2}
          </span>
          <div className="flex flex-wrap gap-6">
            {P_LABELS.map(u => (
              <div key={u} className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-secondary">P₂ ({u})</span>
                <span className="font-mono text-lg font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {fmtP(P2_Pa, u)}
                </span>
              </div>
            ))}
          </div>
          {contextNote && (
            <p className="font-sans text-xs text-secondary border-t border-border pt-3">{contextNote}</p>
          )}
        </div>
      ) : (
        <div className="rounded-sm border border-border px-4 py-3 text-secondary font-sans text-sm">
          Enter a target temperature above to calculate vapor pressure.
        </div>
      )}

      {/* Step-by-step */}
      {P2_Pa !== null && (
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowSteps(s => !s)}
            className="flex items-center gap-2 font-mono text-xs text-secondary tracking-widest uppercase
                       hover:text-secondary transition-colors self-start">
            <span>{showSteps ? '▾' : '▸'}</span>
            <span>Step-by-step working</span>
          </button>
          {showSteps && (
            <div className="rounded-sm border border-border overflow-hidden">
              <table className="w-full text-xs font-mono">
                <tbody>
                  {[
                    { label: 'Formula',      expr: 'P₂ = P₁ × exp[−(ΔH_vap / R) × (1/T₂ − 1/T₁)]' },
                    { label: 'T₁',           expr: `${T1_K.toFixed(2)} K` },
                    { label: 'T₂',           expr: `${T2_K.toFixed(2)} K` },
                    { label: '1/T₂ − 1/T₁', expr: `1/${T2_K.toFixed(2)} − 1/${T1_K.toFixed(2)} = ${(1/T2_K - 1/T1_K).toExponential(4)} K⁻¹` },
                    { label: 'Exponent',     expr: `−(${(dH_J/1000).toFixed(3)} × 1000 / 8.314) × ${(1/T2_K - 1/T1_K).toExponential(4)} = ${((-dH_J/R)*(1/T2_K-1/T1_K)).toFixed(4)}` },
                    { label: 'e^(exp)',       expr: `e^(${((-dH_J/R)*(1/T2_K-1/T1_K)).toFixed(4)}) = ${Math.exp((-dH_J/R)*(1/T2_K-1/T1_K)).toFixed(5)}` },
                    { label: 'P₂',           expr: `${fmtP(P1_Pa, 'Pa')} × ${Math.exp((-dH_J/R)*(1/T2_K-1/T1_K)).toFixed(5)} = ${fmtP(P2_Pa, 'Pa')} = ${fmtP(P2_Pa, 'kPa')}` },
                  ].map((s, i) => (
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

      <p className="font-mono text-xs text-secondary px-0.5">
        Uses the Clausius-Clapeyron equation with the substance's normal boiling point as the reference (T₁, P₁ = 1 atm).
        ΔH_vap is assumed constant over the temperature range.
      </p>

    </div>
  )
}

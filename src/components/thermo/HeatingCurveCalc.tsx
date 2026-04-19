import { useState, useMemo } from 'react'

// ── Substance data ────────────────────────────────────────────────────────────

interface SubData {
  name: string; formula: string
  M: number     // g/mol
  mp: number    // °C
  bp: number    // °C
  cs: number    // c_solid  J/(g·°C)
  cl: number    // c_liquid J/(g·°C)
  cg: number    // c_gas    J/(g·°C)
  dHfus: number // kJ/mol
  dHvap: number // kJ/mol
}

const SUBSTANCES: SubData[] = [
  { name: 'Water',    formula: 'H₂O',    M: 18.015, mp: 0,      bp: 100,   cs: 2.090, cl: 4.184, cg: 2.010, dHfus: 6.02,  dHvap: 40.7   },
  { name: 'Ethanol',  formula: 'C₂H₅OH', M: 46.07,  mp: -114.1, bp: 78.4,  cs: 2.42,  cl: 2.44,  cg: 1.42,  dHfus: 4.93,  dHvap: 38.6   },
  { name: 'Ammonia',  formula: 'NH₃',    M: 17.03,  mp: -77.7,  bp: -33.4, cs: 1.995, cl: 4.700, cg: 2.175, dHfus: 5.65,  dHvap: 23.35  },
  { name: 'Benzene',  formula: 'C₆H₆',   M: 78.11,  mp: 5.5,    bp: 80.1,  cs: 1.74,  cl: 1.74,  cg: 1.06,  dHfus: 9.87,  dHvap: 30.7   },
  { name: 'Iron',     formula: 'Fe',      M: 55.85,  mp: 1538,   bp: 2862,  cs: 0.449, cl: 0.820, cg: 0.450, dHfus: 13.81, dHvap: 349.6  },
]

// ── Segment types ─────────────────────────────────────────────────────────────

type Phase = 'solid' | 'melting' | 'liquid' | 'vaporization' | 'gas'

interface Seg {
  phase: Phase
  tStart: number
  tEnd: number
  q: number       // J, signed (+absorb / −release)
  equation: string
  detail: string
}

const PHASE: Record<Phase, { color: string; label: string; shortLabel: string }> = {
  solid:        { color: '#60a5fa', label: 'Solid heating/cooling',   shortLabel: 'Solid'   },
  melting:      { color: '#fb923c', label: 'Melting / Freezing',      shortLabel: 'Melt'    },
  liquid:       { color: '#34d399', label: 'Liquid heating/cooling',  shortLabel: 'Liquid'  },
  vaporization: { color: '#f43f5e', label: 'Vaporization / Condensation', shortLabel: 'Vap.' },
  gas:          { color: '#c084fc', label: 'Gas heating/cooling',     shortLabel: 'Gas'     },
}

// ── Segment computation ───────────────────────────────────────────────────────

function computeSegments(sub: SubData, mass: number, t0: number, t1: number): Seg[] {
  if (mass <= 0 || Math.abs(t1 - t0) < 0.01) return []

  const n     = mass / sub.M
  const tLow  = Math.min(t0, t1)
  const tHigh = Math.max(t0, t1)
  const sign  = t1 >= t0 ? 1 : -1
  const segs: Seg[] = []

  // 1. Solid
  if (tLow < sub.mp) {
    const end = Math.min(tHigh, sub.mp)
    if (end > tLow)
      segs.push({ phase: 'solid', tStart: tLow, tEnd: end,
        q: sign * mass * sub.cs * (end - tLow),
        equation: 'q = mc_s∆T',
        detail: `m=${mass} g, c_s=${sub.cs} J/(g·°C), ∆T=${(end - tLow).toFixed(2)}°C` })
  }

  // 2. Melting / freezing
  if (tLow <= sub.mp && tHigh > sub.mp)
    segs.push({ phase: 'melting', tStart: sub.mp, tEnd: sub.mp,
      q: sign * n * sub.dHfus * 1000,
      equation: 'q = n∆H_fus',
      detail: `n=${n.toFixed(4)} mol, ∆H_fus=${sub.dHfus} kJ/mol` })

  // 3. Liquid
  const liqStart = Math.max(tLow, sub.mp)
  const liqEnd   = Math.min(tHigh, sub.bp)
  if (liqStart < liqEnd)
    segs.push({ phase: 'liquid', tStart: liqStart, tEnd: liqEnd,
      q: sign * mass * sub.cl * (liqEnd - liqStart),
      equation: 'q = mc_l∆T',
      detail: `m=${mass} g, c_l=${sub.cl} J/(g·°C), ∆T=${(liqEnd - liqStart).toFixed(2)}°C` })

  // 4. Vaporization / condensation
  if (tLow < sub.bp && tHigh > sub.bp)
    segs.push({ phase: 'vaporization', tStart: sub.bp, tEnd: sub.bp,
      q: sign * n * sub.dHvap * 1000,
      equation: 'q = n∆H_vap',
      detail: `n=${n.toFixed(4)} mol, ∆H_vap=${sub.dHvap} kJ/mol` })

  // 5. Gas
  const gasStart = Math.max(tLow, sub.bp)
  if (tHigh > gasStart)
    segs.push({ phase: 'gas', tStart: gasStart, tEnd: tHigh,
      q: sign * mass * sub.cg * (tHigh - gasStart),
      equation: 'q = mc_g∆T',
      detail: `m=${mass} g, c_g=${sub.cg} J/(g·°C), ∆T=${(tHigh - gasStart).toFixed(2)}°C` })

  // Cooling: reverse order and flip tStart/tEnd
  if (sign === -1) return segs.reverse().map(s => ({ ...s, tStart: s.tEnd, tEnd: s.tStart }))
  return segs
}

// ── Curve SVG ─────────────────────────────────────────────────────────────────

function CurveChart({
  segments, t0, t1, sub,
}: { segments: Seg[]; t0: number; t1: number; sub: SubData }) {
  const W = 580, H = 300
  const ML = 60, MR = 24, MT = 28, MB = 48
  const PW = W - ML - MR
  const PH = H - MT - MB

  // Accumulate |q| for x-axis
  const pts: { x: number; t: number }[] = [{ x: 0, t: t0 }]
  let cumq = 0
  for (const seg of segments) {
    cumq += Math.abs(seg.q)
    pts.push({ x: cumq, t: seg.tEnd })
  }
  const maxQ = cumq || 1

  const tLow  = Math.min(t0, t1)
  const tHigh = Math.max(t0, t1)
  const tRange = tHigh - tLow || 1
  const tPad   = tRange * 0.10

  const xS = (q: number) => ML + (q / maxQ) * PW
  const yS = (t: number) => MT + PH - ((t - (tLow - tPad)) / (tRange + 2 * tPad)) * PH

  // Phase transition reference lines (mp / bp if in view range)
  const inTRange = (t: number) => t > tLow - tPad && t < tHigh + tPad
  const transitionLines: { t: number; label: string }[] = []
  if (inTRange(sub.mp)) transitionLines.push({ t: sub.mp, label: `mp ${sub.mp}°C` })
  if (inTRange(sub.bp)) transitionLines.push({ t: sub.bp, label: `bp ${sub.bp}°C` })

  // Y-axis temperature ticks — only t0/t1; mp/bp are already labelled by transitionLines
  const transitionTemps = new Set(transitionLines.map(l => l.t))
  const yTicks: number[] = [t0, t1]
    .filter(t => !transitionTemps.has(t))
    .sort((a, b) => a - b)

  // X-axis heat ticks (5 evenly spaced)
  const xTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => f * maxQ)
  const kj = (j: number) => (j / 1000).toPrecision(3)

  // Segment path d string (one polyline per segment for coloring)
  const heating = t1 >= t0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Heating/cooling curve">

      {/* Plot area */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="rgba(255,255,255,0.015)" rx="2" />

      {/* Vertical grid at heat ticks */}
      {xTicks.map((q, i) => (
        <line key={i}
          x1={xS(q)} y1={MT} x2={xS(q)} y2={MT + PH}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {/* Horizontal dashes at mp and bp */}
      {transitionLines.map(({ t, label }) => (
        <g key={label}>
          <line
            x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3" />
          <text x={ML - 4} y={yS(t)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="monospace">
            {t}°
          </text>
        </g>
      ))}

      {/* Colored segment lines */}
      {segments.map((seg, i) => (
        <line key={i}
          x1={xS(pts[i].x)} y1={yS(pts[i].t)}
          x2={xS(pts[i + 1].x)} y2={yS(pts[i + 1].t)}
          stroke={PHASE[seg.phase].color}
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />
      ))}


      {/* Start/end dots */}
      <circle cx={xS(0)} cy={yS(t0)} r="3.5" fill={PHASE[segments[0]?.phase ?? 'solid'].color} />
      {pts.length > 1 && (
        <circle cx={xS(maxQ)} cy={yS(t1)} r="3.5" fill={PHASE[segments[segments.length - 1]?.phase ?? 'gas'].color} />
      )}

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 6}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1={ML - 4} y1={MT + PH} x2={ML + PW} y2={MT + PH}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {/* Y-axis ticks + labels */}
      {yTicks.map(t => (
        <g key={t}>
          <line x1={ML - 3} y1={yS(t)} x2={ML} y2={yS(t)}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x={ML - 6} y={yS(t)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="monospace">
            {t.toFixed(t % 1 === 0 ? 0 : 1)}°
          </text>
        </g>
      ))}

      {/* X-axis ticks + labels */}
      {xTicks.filter(q => q > 0).map(q => (
        <g key={q}>
          <line x1={xS(q)} y1={MT + PH} x2={xS(q)} y2={MT + PH + 3}
            stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text x={xS(q)} y={MT + PH + 14} textAnchor="middle"
            fill="rgba(255,255,255,0.45)" fontSize="8.5" fontFamily="monospace">
            {kj(q)}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={ML - 38} y={MT + PH / 2} textAnchor="middle"
        fill="rgba(255,255,255,0.35)" fontSize="9.5" fontFamily="system-ui"
        transform={`rotate(-90, ${ML - 38}, ${MT + PH / 2})`}>
        Temperature (°C)
      </text>
      <text x={ML + PW / 2} y={H - 4} textAnchor="middle"
        fill="rgba(255,255,255,0.35)" fontSize="9.5" fontFamily="system-ui">
        {heating ? 'Heat Added (kJ)' : 'Heat Removed (kJ)'}
      </text>
    </svg>
  )
}

// ── Number input ──────────────────────────────────────────────────────────────

function NumInput({ label, value, onChange, unit, hint }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</span>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-9 rounded-l-sm border border-border bg-raised px-3 font-mono text-sm
                     text-bright focus:outline-none focus:border-muted placeholder:text-dim"
        />
        {unit && (
          <span className="h-9 px-2.5 flex items-center rounded-r-sm border border-l-0 border-border
                           bg-surface font-mono text-xs text-dim whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>
      {hint && <span className="font-sans text-xs text-secondary">{hint}</span>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeatingCurveCalc() {
  const [subIdx,   setSubIdx]   = useState(0)
  const [mass,     setMass]     = useState('100')
  const [tInit,    setTInit]    = useState('-20')
  const [tFinal,   setTFinal]   = useState('120')
  const [isHeating, setIsHeating] = useState(true)

  const sub = SUBSTANCES[subIdx]

  function selectSubstance(idx: number) {
    const s = SUBSTANCES[idx]
    const span = s.bp - s.mp
    const pad  = Math.max(span * 0.25, 20)
    const lo = (s.mp - pad).toFixed(0)
    const hi = (s.bp + pad).toFixed(0)
    setTInit(isHeating ? lo : hi)
    setTFinal(isHeating ? hi : lo)
    setSubIdx(idx)
  }

  function toggleMode(heating: boolean) {
    setIsHeating(heating)
    // Swap the two temperature fields
    setTInit(tFinal)
    setTFinal(tInit)
  }

  const massNum = parseFloat(mass)
  const t0      = parseFloat(tInit)
  const t1      = parseFloat(tFinal)
  const valid   = isFinite(massNum) && massNum > 0 && isFinite(t0) && isFinite(t1) && t0 !== t1

  const segments = useMemo(
    () => valid ? computeSegments(sub, massNum, t0, t1) : [],
    [sub, massNum, t0, t1, valid],
  )

  const totalQ  = segments.reduce((s, seg) => s + seg.q, 0)
  const heating = t1 > t0

  // Cumulative q for table
  let runningQ = 0

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Heating / Cooling toggle */}
      <div className="flex items-center gap-1 p-1 rounded-full self-start"
        style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
        {([true, false] as const).map(h => {
          const active = isHeating === h
          return (
            <button key={String(h)} onClick={() => toggleMode(h)}
              className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
              {active && (
                <span className="absolute inset-0 rounded-full" style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }} />
              )}
              <span className="relative z-10">{h ? 'Heating' : 'Cooling'}</span>
            </button>
          )
        })}
      </div>

      {/* Substance selector */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Substance</span>
        <div className="flex flex-wrap gap-2">
          {SUBSTANCES.map((s, i) => (
            <button key={i} onClick={() => selectSubstance(i)}
              className="flex flex-col items-start px-3 py-2 rounded-sm border transition-colors text-left"
              style={subIdx === i ? {
                borderColor: 'color-mix(in srgb, var(--c-halogen) 50%, transparent)',
                background:  'color-mix(in srgb, var(--c-halogen) 10%, #141620)',
                color: 'var(--c-halogen)',
              } : {
                borderColor: '#1c1f2e', background: '#0e1016',
                color: 'rgba(255,255,255,0.45)',
              }}>
              <span className="font-sans text-sm font-medium">{s.name}</span>
              <span className="font-mono text-[9px] opacity-60">{s.formula}</span>
            </button>
          ))}
        </div>

        {/* Substance constants */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
          {[
            { k: 'M',      v: `${sub.M} g/mol`          },
            { k: 'mp',     v: `${sub.mp} °C`             },
            { k: 'bp',     v: `${sub.bp} °C`             },
            { k: 'c_s',    v: `${sub.cs} J/(g·°C)`       },
            { k: 'c_l',    v: `${sub.cl} J/(g·°C)`       },
            { k: 'c_g',    v: `${sub.cg} J/(g·°C)`       },
            { k: '∆H_fus', v: `${sub.dHfus} kJ/mol`     },
            { k: '∆H_vap', v: `${sub.dHvap} kJ/mol`     },
          ].map(({ k, v }) => (
            <span key={k} className="font-mono text-xs text-secondary">
              <span className="text-secondary">{k}</span> = {v}
            </span>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <NumInput label="Mass" value={mass} onChange={setMass} unit="g"
          hint={isFinite(massNum) && massNum > 0 ? `${(massNum / sub.M).toFixed(4)} mol` : ''} />
        <NumInput label={heating ? 'Initial Temp' : 'Start Temp'} value={tInit} onChange={setTInit} unit="°C" />
        <NumInput label={heating ? 'Final Temp'   : 'End Temp'}   value={tFinal} onChange={setTFinal} unit="°C" />
      </div>

      {/* Curve */}
      {valid && segments.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">
              {heating ? 'Heating' : 'Cooling'} Curve — {sub.name}
            </span>
            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {(Object.keys(PHASE) as Phase[])
                .filter(p => segments.some(s => s.phase === p))
                .map(p => (
                  <div key={p} className="flex items-center gap-1">
                    <div className="w-3 h-0.5 rounded" style={{ background: PHASE[p].color }} />
                    <span className="font-mono text-[9px]" style={{ color: PHASE[p].color }}>
                      {PHASE[p].shortLabel}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-sm border border-border overflow-hidden p-2"
            style={{ background: '#0a0c10' }}>
            <CurveChart segments={segments} t0={t0} t1={t1} sub={sub} />
          </div>
        </div>
      )}

      {valid && segments.length === 0 && (
        <div className="px-4 py-3 rounded-sm border border-border text-secondary font-sans text-sm">
          No temperature change — enter different T_initial and T_final.
        </div>
      )}

      {/* Segment breakdown */}
      {segments.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Segment Breakdown</span>
          <div className="rounded-sm border border-border overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-raised">
                  <th className="px-3 py-2 text-left text-dim font-normal">Phase</th>
                  <th className="px-3 py-2 text-left text-dim font-normal">T range</th>
                  <th className="px-3 py-2 text-left text-dim font-normal">Equation</th>
                  <th className="px-3 py-2 text-right text-dim font-normal">q (J)</th>
                  <th className="px-3 py-2 text-right text-dim font-normal">q (kJ)</th>
                  <th className="px-3 py-2 text-right text-dim font-normal">Cumul. (kJ)</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg, i) => {
                  runningQ += seg.q
                  const isPlat = seg.phase === 'melting' || seg.phase === 'vaporization'
                  return (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: PHASE[seg.phase].color }} />
                          <span className="text-primary">{PHASE[seg.phase].label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-secondary">
                        {isPlat
                          ? `${seg.tStart.toFixed(1)}°C (plateau)`
                          : `${seg.tStart.toFixed(1)} → ${seg.tEnd.toFixed(1)}°C`}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span style={{ color: PHASE[seg.phase].color }}>{seg.equation}</span>
                          <span className="text-dim text-[10px]">{seg.detail}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span style={{ color: seg.q > 0 ? '#fb923c' : '#60a5fa' }}>
                          {seg.q > 0 ? '+' : ''}{seg.q.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span style={{ color: seg.q > 0 ? '#fb923c' : '#60a5fa' }}>
                          {seg.q > 0 ? '+' : ''}{(seg.q / 1000).toPrecision(3)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-secondary">
                        {(runningQ / 1000).toPrecision(3)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-raised">
                  <td colSpan={3} className="px-3 py-2 font-semibold text-bright">Total</td>
                  <td className="px-3 py-2 text-right font-semibold"
                    style={{ color: totalQ > 0 ? '#fb923c' : '#60a5fa' }}>
                    {totalQ > 0 ? '+' : ''}{totalQ.toFixed(1)} J
                  </td>
                  <td className="px-3 py-2 text-right font-semibold"
                    style={{ color: totalQ > 0 ? '#fb923c' : '#60a5fa' }}>
                    {totalQ > 0 ? '+' : ''}{(totalQ / 1000).toPrecision(4)} kJ
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="font-sans text-xs text-secondary px-1">
            {totalQ > 0 ? 'Positive q = heat absorbed by substance (endothermic).' : 'Negative q = heat released by substance (exothermic).'}
          </p>
        </div>
      )}

      {/* Concept reference */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
        <p className="font-sans font-semibold text-bright">Reading a Heating/Cooling Curve</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: 'Slopes — q = mc∆T',
              body:  'Temperature changes while a single phase is heated or cooled. Steeper slope = lower specific heat c. Shallower slope = higher c (more heat needed per °C).',
              color: '#34d399',
            },
            {
              title: 'Plateaus — q = n∆H',
              body:  'Temperature stays constant during a phase transition. All energy goes into breaking/forming intermolecular forces, not raising temperature.',
              color: '#fb923c',
            },
            {
              title: 'Plateau Length',
              body:  'Proportional to ∆H_transition × n. Vaporization plateau is almost always much longer than melting because ∆H_vap >> ∆H_fus.',
              color: '#f43f5e',
            },
            {
              title: 'Slope Comparison',
              body:  'For water: c_l = 4.184 J/(g·°C) > c_s = 2.09 > c_g = 2.01. Liquid slope is shallowest — water absorbs more heat per degree as a liquid.',
              color: '#60a5fa',
            },
          ].map(c => (
            <div key={c.title} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-sans text-sm font-semibold" style={{ color: c.color }}>{c.title}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{c.body}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

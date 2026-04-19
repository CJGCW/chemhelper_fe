import { useState, useRef } from 'react'

// ── Substance data ─────────────────────────────────────────────────────────────

interface PhaseData {
  name: string
  formula: string
  tp: { T: number; P: number }          // triple point °C, Pa
  cp: { T: number; P: number }          // critical point °C, Pa
  sublimation: [number, number][]        // [T°C, Pa] low-T → TP, T increasing
  vaporization: [number, number][]       // [T°C, Pa] TP → CP, T increasing
  fusion: [number, number][]             // [T°C, Pa] TP → high-P, P increasing
  Tmin: number; Tmax: number
  logPmin: number; logPmax: number
  labelSolid: [number, number]           // [T, log10(P)]
  labelLiquid: [number, number]
  labelGas: [number, number]
  labelSupercrit: [number, number]
  notes: string[]
}

const WATER: PhaseData = {
  name: 'Water', formula: 'H₂O',
  tp: { T: 0.01,   P: 611.657   },
  cp: { T: 374.14, P: 22.089e6  },
  sublimation: [
    [-70, 0.26], [-60, 1.08], [-50, 3.94], [-40, 12.84],
    [-30, 37.99], [-20, 103.3], [-10, 259.9], [0.01, 611.7],
  ],
  vaporization: [
    [0.01, 611.7], [10, 1228], [20, 2338], [40, 7384], [60, 19940],
    [80, 47390], [100, 101325], [120, 198600], [150, 476100],
    [200, 1554700], [250, 3977600], [300, 8588000], [350, 16529000],
    [374.14, 22089000],
  ],
  // Water: negative fusion slope — T decreases as P increases
  fusion: [
    [0.01, 611.7], [-0.0074, 101325], [-0.073, 1e6],
    [-0.73, 1e7], [-7.3, 1e8],
  ],
  Tmin: -80, Tmax: 430,
  logPmin: -1, logPmax: 8,
  labelSolid:    [-40,  4.0],
  labelLiquid:   [180,  6.5],
  labelGas:      [200,  1.5],
  labelSupercrit:[395,  7.5],
  notes: [
    'Water has an anomalous negative fusion slope — increasing pressure lowers the melting point.',
    'Triple point: 0.01 °C, 611.7 Pa (≈ 0.006 atm). Below this pressure, ice sublimes directly to vapor.',
    'Critical point: 374.14 °C, 22.089 MPa (≈ 218 atm). Above this, liquid and gas become indistinguishable.',
    'Normal melting point (0 °C) and boiling point (100 °C) both lie on the 1 atm line.',
  ],
}

const CO2: PhaseData = {
  name: 'Carbon Dioxide', formula: 'CO₂',
  tp: { T: -56.6, P: 518000   },
  cp: { T:  31.1, P: 7374000  },
  sublimation: [
    [-100, 13000], [-95, 22600], [-90, 37800], [-85, 61400],
    [-80, 96700], [-75, 148000], [-70, 220000], [-56.6, 518000],
  ],
  vaporization: [
    [-56.6, 518000], [-50, 682000], [-40, 1013000], [-30, 1488000],
    [-20, 2130000], [-10, 2949000], [0, 3486000], [10, 4502000],
    [20, 5720000], [31.1, 7374000],
  ],
  // CO2: positive fusion slope
  fusion: [
    [-56.6, 518000], [-56.5, 1e6], [-56.2, 3e6],
    [-55.5, 8e6], [-54.5, 2e7], [-52, 5e7], [-49, 1e8],
  ],
  Tmin: -110, Tmax: 80,
  logPmin: 4, logPmax: 8,
  labelSolid:    [-85,  7.0],
  labelLiquid:   [-20,  7.0],
  labelGas:      [-20,  4.5],
  labelSupercrit:[ 55,  7.5],
  notes: [
    'CO₂ has no liquid phase at 1 atm — atmospheric pressure (101,325 Pa) is below the triple point (518 kPa).',
    '"Dry ice" sublimes at −78.5 °C at 1 atm, going directly from solid to gas.',
    'Triple point: −56.6 °C, 5.18 atm. Liquid CO₂ only exists above 5.18 atm.',
    'Supercritical CO₂ (above 31.1 °C, 72.8 atm) is used industrially as a non-polar solvent.',
  ],
}

const SUBSTANCES: PhaseData[] = [WATER, CO2]

// ── Utilities ─────────────────────────────────────────────────────────────────

// Interpolate y from [[x, y], ...] assuming x is monotonically increasing
function interp(pts: [number, number][], x: number): number | null {
  if (pts.length < 2) return null
  const asc = pts[pts.length - 1][0] > pts[0][0]
  if (asc ? x < pts[0][0] || x > pts[pts.length - 1][0]
           : x > pts[0][0] || x < pts[pts.length - 1][0]) return null
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]
    const inRange = asc ? x0 <= x && x <= x1 : x1 <= x && x <= x0
    if (inRange) return y0 + (x - x0) / (x1 - x0) * (y1 - y0)
  }
  return null
}

function identifyPhase(data: PhaseData, T: number, P: number): string {
  if (T >= data.cp.T && P >= data.cp.P) return 'Supercritical'

  // Fusion: given as [[T, P], ...] with P increasing — build [P, T] for interp
  const fusionByP = [...data.fusion]
    .map(([t, p]) => [p, t] as [number, number])
    .sort((a, b) => a[0] - b[0])
  const T_fus = interp(fusionByP, P)

  if (T <= data.tp.T) {
    const P_sub = interp(data.sublimation, T)
    if (P_sub !== null && P >= P_sub) return 'Solid'
    return 'Gas'
  }

  if (T_fus !== null && T <= T_fus) return 'Solid'

  if (T <= data.cp.T) {
    const P_vap = interp(data.vaporization, T)
    if (P_vap !== null && P >= P_vap) return 'Liquid'
  }

  return 'Gas'
}

function fmtP(P: number): string {
  if (P >= 1e7) return `${(P / 1e6).toFixed(2)} MPa`
  if (P >= 1e6) return `${(P / 1e6).toPrecision(3)} MPa`
  if (P >= 1e4) return `${(P / 1e3).toPrecision(3)} kPa`
  return `${P.toPrecision(3)} Pa`
}
function fmtAtm(P: number): string {
  return `${(P / 101325).toPrecision(3)} atm`
}

// ── Colours ───────────────────────────────────────────────────────────────────

const PHASE_COLOR: Record<string, string> = {
  Solid:        '#60a5fa',
  Liquid:       '#34d399',
  Gas:          '#c084fc',
  Supercritical:'#fbbf24',
}

const CURVE_COLOR = {
  sublimation:  '#fb923c',
  vaporization: '#f43f5e',
  fusion:       '#60a5fa',
}

// ── SVG diagram ────────────────────────────────────────────────────────────────

interface HoverPt { T: number; P: number; phase: string }

function DiagramSVG({ data, onHover }: {
  data: PhaseData
  onHover: (pt: HoverPt | null) => void
}) {
  const W = 620, H = 390
  const ML = 72, MR = 16, MT = 28, MB = 50
  const PW = W - ML - MR
  const PH = H - MT - MB
  const { Tmin, Tmax, logPmin, logPmax } = data

  const xS = (T: number) => ML + (T - Tmin) / (Tmax - Tmin) * PW
  const yS = (P: number) => {
    const lp = Math.log10(Math.max(P, 10 ** (logPmin - 1)))
    return MT + PH - (lp - logPmin) / (logPmax - logPmin) * PH
  }
  const xI = (sx: number) => Tmin + (sx - ML) / PW * (Tmax - Tmin)
  const yI = (sy: number) => 10 ** (logPmin + (MT + PH - sy) / PH * (logPmax - logPmin))

  const curvePath = (pts: [number, number][]) =>
    pts
      .filter(([, P]) => { const lp = Math.log10(P); return lp >= logPmin - 0.2 && lp <= logPmax + 0.2 })
      .map(([T, P], i) => `${i === 0 ? 'M' : 'L'} ${xS(T).toFixed(1)} ${yS(P).toFixed(1)}`)
      .join(' ')

  // T-axis ticks
  const tRange = Tmax - Tmin
  const tStep = tRange > 300 ? 100 : tRange > 150 ? 50 : 25
  const tTicks: number[] = []
  for (let t = Math.ceil(Tmin / tStep) * tStep; t <= Tmax; t += tStep) tTicks.push(t)

  // P-axis ticks (log)
  const pTicks: number[] = []
  for (let lp = Math.ceil(logPmin); lp <= Math.floor(logPmax); lp++) pTicks.push(lp)

  const pTickLabel = (lp: number) => {
    const P = 10 ** lp
    if (P >= 1e6) return `${(P / 1e6).toFixed(0)} MPa`
    if (P >= 1e3) return `${(P / 1e3).toFixed(0)} kPa`
    return `${P.toFixed(0)} Pa`
  }

  // 1 atm reference line
  const y_atm = yS(101325)
  const showAtm = y_atm >= MT + 2 && y_atm <= MT + PH - 2

  // Intersections of 1 atm line with curves (for bp/mp markers)
  const vapAtm = interp([...data.vaporization].map(([t, p]) => [p, t] as [number, number]).sort((a, b) => a[0] - b[0]), 101325)
  const subAtm = interp([...data.sublimation].map(([t, p]) => [p, t] as [number, number]).sort((a, b) => a[0] - b[0]), 101325)

  // Hover state
  const svgRef = useRef<SVGSVGElement>(null)
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const sx = (e.clientX - rect.left) * W / rect.width
    const sy = (e.clientY - rect.top)  * H / rect.height
    if (sx < ML || sx > ML + PW || sy < MT || sy > MT + PH) {
      setCrosshair(null); onHover(null); return
    }
    const T = xI(sx), P = yI(sy)
    setCrosshair({ x: sx, y: sy })
    onHover({ T, P, phase: identifyPhase(data, T, P) })
  }

  const inPlot = (T: number, P: number) => {
    const lp = Math.log10(P)
    return T >= Tmin && T <= Tmax && lp >= logPmin && lp <= logPmax
  }

  return (
    <svg ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setCrosshair(null); onHover(null) }}>

      <defs>
        <clipPath id="pd-plot">
          <rect x={ML} y={MT} width={PW} height={PH} />
        </clipPath>
      </defs>

      {/* Plot background */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="rgba(255,255,255,0.015)" rx="2" />

      {/* Grid */}
      {tTicks.map(t => (
        <line key={`gt${t}`} x1={xS(t)} y1={MT} x2={xS(t)} y2={MT + PH}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {pTicks.map(lp => (
        <line key={`gp${lp}`} x1={ML} y1={yS(10 ** lp)} x2={ML + PW} y2={yS(10 ** lp)}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {/* 1 atm reference */}
      {showAtm && (
        <g clipPath="url(#pd-plot)">
          <line x1={ML} y1={y_atm} x2={ML + PW} y2={y_atm}
            stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="5 3" />
          <text x={ML + 4} y={y_atm - 4}
            fill="rgba(255,255,255,0.35)" fontSize="8.5" fontFamily="monospace">
            1 atm
          </text>
        </g>
      )}

      {/* Phase curves */}
      <g clipPath="url(#pd-plot)">
        <path d={curvePath(data.sublimation)}  fill="none" stroke={CURVE_COLOR.sublimation}  strokeWidth="2.5" strokeLinecap="round" />
        <path d={curvePath(data.vaporization)} fill="none" stroke={CURVE_COLOR.vaporization} strokeWidth="2.5" strokeLinecap="round" />
        <path d={curvePath(data.fusion)}        fill="none" stroke={CURVE_COLOR.fusion}        strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Normal bp/mp markers on 1 atm line */}
      {showAtm && vapAtm !== null && vapAtm >= Tmin && vapAtm <= Tmax && (
        <g>
          <circle cx={xS(vapAtm)} cy={y_atm} r="4" fill="#f43f5e" stroke="#0a0c10" strokeWidth="1.5" />
          <text x={xS(vapAtm)} y={y_atm + 14} textAnchor="middle"
            fill="rgba(243,63,94,0.8)" fontSize="8.5" fontFamily="monospace">
            bp {vapAtm.toFixed(1)}°C
          </text>
        </g>
      )}
      {showAtm && subAtm !== null && subAtm >= Tmin && subAtm <= Tmax && (
        <g>
          <circle cx={xS(subAtm)} cy={y_atm} r="4" fill="#fb923c" stroke="#0a0c10" strokeWidth="1.5" />
          <text x={xS(subAtm) + 6} y={y_atm - 6}
            fill="rgba(251,146,60,0.8)" fontSize="8.5" fontFamily="monospace">
            sub {subAtm.toFixed(1)}°C
          </text>
        </g>
      )}

      {/* Triple point */}
      {inPlot(data.tp.T, data.tp.P) && (() => {
        const tx = xS(data.tp.T), ty = yS(data.tp.P)
        const labelRight = tx < ML + PW * 0.75
        return (
          <g>
            <circle cx={tx} cy={ty} r="5.5" fill="#fbbf24" stroke="#0a0c10" strokeWidth="1.5" />
            <text x={labelRight ? tx + 9 : tx - 9} y={ty - 6}
              textAnchor={labelRight ? 'start' : 'end'}
              fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="600">
              Triple Point
            </text>
            <text x={labelRight ? tx + 9 : tx - 9} y={ty + 5}
              textAnchor={labelRight ? 'start' : 'end'}
              fill="rgba(251,191,36,0.65)" fontSize="8" fontFamily="monospace">
              {data.tp.T.toFixed(2)}°C · {fmtP(data.tp.P)}
            </text>
          </g>
        )
      })()}

      {/* Critical point */}
      {inPlot(data.cp.T, data.cp.P) && (() => {
        const cx_ = xS(data.cp.T), cy_ = yS(data.cp.P)
        // Near top of plot → label below the dot to avoid crowding the supercritical region label
        const nearTop = cy_ < MT + 60
        const labelRight = cx_ < ML + PW * 0.75
        return (
          <g>
            <circle cx={cx_} cy={cy_} r="5.5" fill="#f43f5e" stroke="#0a0c10" strokeWidth="1.5" />
            {nearTop ? (
              <>
                <text x={cx_} y={cy_ + 15} textAnchor="middle"
                  fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="600">
                  Critical Point
                </text>
                <text x={cx_} y={cy_ + 26} textAnchor="middle"
                  fill="rgba(244,63,94,0.65)" fontSize="8" fontFamily="monospace">
                  {data.cp.T.toFixed(1)}°C · {fmtP(data.cp.P)}
                </text>
              </>
            ) : (
              <>
                <text x={labelRight ? cx_ + 9 : cx_ - 9} y={cy_ - 6}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="600">
                  Critical Point
                </text>
                <text x={labelRight ? cx_ + 9 : cx_ - 9} y={cy_ + 5}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill="rgba(244,63,94,0.65)" fontSize="8" fontFamily="monospace">
                  {data.cp.T.toFixed(1)}°C · {fmtP(data.cp.P)}
                </text>
              </>
            )}
          </g>
        )
      })()}

      {/* Region labels */}
      {([
        { label: 'SOLID',         pos: data.labelSolid,     color: 'rgba(96,165,250,0.45)'  },
        { label: 'LIQUID',        pos: data.labelLiquid,    color: 'rgba(52,211,153,0.45)'  },
        { label: 'GAS',           pos: data.labelGas,       color: 'rgba(192,132,252,0.45)' },
        { label: 'SUPERCRITICAL', pos: data.labelSupercrit, color: 'rgba(251,191,36,0.4)'   },
      ] as const).map(({ label, pos, color }) => {
        const sx = xS(pos[0]), sy = yS(10 ** pos[1])
        if (sx < ML + 4 || sx > ML + PW - 4 || sy < MT + 4 || sy > MT + PH - 4) return null
        return (
          <text key={label} x={sx} y={sy}
            clipPath="url(#pd-plot)"
            textAnchor="middle" dominantBaseline="middle"
            fill={color} fontSize="13" fontFamily="system-ui" fontWeight="700"
            letterSpacing="0.06em">
            {label}
          </text>
        )
      })}

      {/* Hover crosshair */}
      {crosshair && (
        <g clipPath="url(#pd-plot)" pointerEvents="none">
          <line x1={crosshair.x} y1={MT} x2={crosshair.x} y2={MT + PH}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />
          <line x1={ML} y1={crosshair.y} x2={ML + PW} y2={crosshair.y}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />
          <circle cx={crosshair.x} cy={crosshair.y} r="3" fill="white" opacity="0.6" />
        </g>
      )}

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 6}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1={ML - 4} y1={MT + PH} x2={ML + PW} y2={MT + PH}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      {/* T-axis ticks + labels */}
      {tTicks.map(t => (
        <g key={`tt${t}`}>
          <line x1={xS(t)} y1={MT + PH} x2={xS(t)} y2={MT + PH + 4}
            stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <text x={xS(t)} y={MT + PH + 14} textAnchor="middle"
            fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="monospace">
            {t}
          </text>
        </g>
      ))}

      {/* P-axis ticks + labels */}
      {pTicks.map(lp => (
        <g key={`pt${lp}`}>
          <line x1={ML - 3} y1={yS(10 ** lp)} x2={ML} y2={yS(10 ** lp)}
            stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
          <text x={ML - 6} y={yS(10 ** lp)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="monospace">
            {pTickLabel(lp)}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={ML + PW / 2} y={H - 6} textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="system-ui">
        Temperature (°C)
      </text>
      <text x={14} y={MT + PH / 2} textAnchor="middle"
        fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="system-ui"
        transform={`rotate(-90, 14, ${MT + PH / 2})`}>
        Pressure
      </text>

      {/* Curve legend */}
      {[
        { color: CURVE_COLOR.sublimation,  label: 'Sublimation'  },
        { color: CURVE_COLOR.vaporization, label: 'Vaporization' },
        { color: CURVE_COLOR.fusion,       label: 'Fusion'       },
      ].map(({ color, label }, i) => (
        <g key={label} transform={`translate(${ML + 6 + i * 96}, ${MT + 10})`}>
          <line x1={0} y1={0} x2={18} y2={0} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <text x={22} y={0} dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="system-ui">
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PhaseDiagram() {
  const [subIdx, setSubIdx] = useState(0)
  const [hovered, setHovered] = useState<HoverPt | null>(null)
  const data = SUBSTANCES[subIdx]

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Substance selector */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Substance</span>
        <div className="flex gap-2">
          {SUBSTANCES.map((s, i) => (
            <button key={i} onClick={() => setSubIdx(i)}
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
      </div>

      {/* Diagram */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">
            Phase Diagram — {data.name}
          </span>
          <span className="font-mono text-xs text-secondary">Hover to identify phase</span>
        </div>

        <div className="rounded-sm border border-border overflow-hidden p-2" style={{ background: '#0a0c10' }}>
          <DiagramSVG data={data} onHover={setHovered} />
        </div>

        {/* Hover readout */}
        <div className="flex items-center gap-4 px-1 h-7">
          {hovered ? (
            <>
              <span className="font-mono text-xs text-secondary">
                T = <span className="text-bright">{hovered.T.toFixed(1)}°C</span>
              </span>
              <span className="font-mono text-xs text-secondary">
                P = <span className="text-bright">{fmtP(hovered.P)}</span>
                <span className="text-dim ml-1">({fmtAtm(hovered.P)})</span>
              </span>
              <span className="font-mono text-xs font-semibold"
                style={{ color: PHASE_COLOR[hovered.phase] ?? 'var(--c-halogen)' }}>
                {hovered.phase}
              </span>
            </>
          ) : (
            <span className="font-mono text-xs text-secondary italic">Move cursor over diagram</span>
          )}
        </div>
      </div>

      {/* Key points table */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Key Points</span>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal">Point</th>
                <th className="px-3 py-2 text-right text-dim font-normal">Temperature</th>
                <th className="px-3 py-2 text-right text-dim font-normal">Pressure</th>
                <th className="px-3 py-2 text-right text-dim font-normal">Pressure (atm)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-[#fbbf24]" />
                    <span className="text-primary">Triple Point</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-secondary">{data.tp.T.toFixed(2)} °C</td>
                <td className="px-3 py-2 text-right text-secondary">{fmtP(data.tp.P)}</td>
                <td className="px-3 py-2 text-right text-secondary">{fmtAtm(data.tp.P)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-[#f43f5e]" />
                    <span className="text-primary">Critical Point</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-secondary">{data.cp.T.toFixed(2)} °C</td>
                <td className="px-3 py-2 text-right text-secondary">{fmtP(data.cp.P)}</td>
                <td className="px-3 py-2 text-right text-secondary">{fmtAtm(data.cp.P)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-3">
        <span className="font-sans font-semibold text-bright">Reading This Diagram</span>
        <ul className="flex flex-col gap-2">
          {data.notes.map((n, i) => (
            <li key={i} className="flex gap-2 font-sans text-xs text-secondary leading-relaxed">
              <span className="text-dim shrink-0 mt-0.5">▸</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Concept reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { title: 'Sublimation Curve', color: CURVE_COLOR.sublimation,
            body: 'Solid ↔ Gas boundary. Below triple-point pressure, a solid heated at constant P will sublime — skipping the liquid phase entirely.' },
          { title: 'Vaporization Curve', color: CURVE_COLOR.vaporization,
            body: 'Liquid ↔ Gas boundary. Ends at the critical point, where the distinction between liquid and gas disappears.' },
          { title: 'Fusion Curve', color: CURVE_COLOR.fusion,
            body: 'Solid ↔ Liquid boundary. The slope reveals whether pressure raises or lowers the melting point (water: negative; most substances: positive).' },
          { title: 'Supercritical Fluid', color: '#fbbf24',
            body: 'Above the critical point, liquid and gas merge into a single supercritical phase with properties of both — useful in extraction and chromatography.' },
        ].map(c => (
          <div key={c.title} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
            <span className="font-sans text-sm font-semibold" style={{ color: c.color }}>{c.title}</span>
            <span className="font-sans text-xs text-secondary leading-relaxed">{c.body}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

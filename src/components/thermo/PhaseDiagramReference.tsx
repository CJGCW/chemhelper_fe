import { SectionHead } from '../Layout/PageShell'

// ── Static phase diagram SVG ──────────────────────────────────────────────────

function PhaseDiagramSVG() {
  const W = 560, H = 300
  const ML = 56, MR = 20, MT = 20, MB = 44
  const PW = W - ML - MR
  const PH = H - MT - MB

  // Normalised coordinates (T on x, P on y, both 0–1)
  const x = (t: number) => ML + t * PW
  const y = (p: number) => MT + PH - p * PH

  // Triple point and critical point (normalised)
  const tp = { t: 0.28, p: 0.22 }
  const cp = { t: 0.75, p: 0.78 }

  // Boundary curves (array of [t, p] normalised)
  const sublimation: [number, number][] = [[0, 0], [0.12, 0.04], [0.22, 0.12], [tp.t, tp.p]]
  const vaporization: [number, number][] = [[tp.t, tp.p], [0.40, 0.30], [0.55, 0.44], [0.65, 0.58], [cp.t, cp.p]]
  // Normal fusion (positive slope, most substances)
  const fusion: [number, number][]       = [[tp.t, tp.p], [0.33, 0.50], [0.38, 0.72], [0.42, 0.96]]

  function polyline(pts: [number, number][]) {
    return pts.map(([t, p]) => `${x(t)},${y(p)}`).join(' ')
  }

  // 1 atm line (normalised pressure where 1 atm sits — illustrative)
  const atm1 = 0.30

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Generic phase diagram">
      <rect x={ML} y={MT} width={PW} height={PH} fill="rgba(var(--overlay),0.015)" rx="2" />

      {/* Phase region fills */}
      {/* Solid region */}
      <polygon
        points={`${x(0)},${y(1)} ${x(0)},${y(0)} ${x(tp.t)},${y(tp.p)} ${fusion.map(([t,p]) => `${x(t)},${y(p)}`).join(' ')}`}
        fill="rgba(96,165,250,0.08)" />
      {/* Gas region */}
      <polygon
        points={`${x(0)},${y(0)} ${x(1)},${y(0)} ${x(1)},${y(atm1*0.4)} ${x(cp.t)},${y(cp.p)} ${vaporization.map(([t,p]) => `${x(t)},${y(p)}`).reverse().join(' ')} ${x(tp.t)},${y(tp.p)} ${sublimation.map(([t,p]) => `${x(t)},${y(p)}`).reverse().join(' ')}`}
        fill="rgba(52,211,153,0.06)" />
      {/* Liquid region */}
      <polygon
        points={`${x(tp.t)},${y(tp.p)} ${vaporization.map(([t,p]) => `${x(t)},${y(p)}`).join(' ')} ${x(1)},${y(cp.p+0.1)} ${fusion.map(([t,p]) => `${x(t)},${y(p)}`).reverse().join(' ')}`}
        fill="rgba(251,146,60,0.07)" />

      {/* 1 atm dashed line */}
      <line x1={ML} y1={y(atm1)} x2={ML + PW} y2={y(atm1)}
        stroke="rgba(var(--overlay),0.14)" strokeWidth="1" strokeDasharray="5 3" />
      <text x={ML - 4} y={y(atm1)} textAnchor="end" dominantBaseline="middle"
        fill="rgba(var(--overlay),0.3)" fontSize="8.5" fontFamily="monospace">
        1 atm
      </text>

      {/* Boundary curves */}
      <polyline points={polyline(sublimation)}
        fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={polyline(vaporization)}
        fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={polyline(fusion)}
        fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Triple point */}
      <circle cx={x(tp.t)} cy={y(tp.p)} r="4.5" fill="#facc15" />
      <text x={x(tp.t) + 7} y={y(tp.p) + 1} dominantBaseline="middle"
        fill="#facc15" fontSize="9" fontFamily="monospace" fontWeight="600">
        Triple point
      </text>

      {/* Critical point */}
      <circle cx={x(cp.t)} cy={y(cp.p)} r="4.5" fill="#f43f5e" />
      <text x={x(cp.t) + 7} y={y(cp.p) + 1} dominantBaseline="middle"
        fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="600">
        Critical point
      </text>

      {/* Phase region labels */}
      <text x={x(0.10)} y={y(0.68)} textAnchor="middle"
        fill="rgba(96,165,250,0.8)" fontSize="12" fontFamily="system-ui" fontWeight="600">
        SOLID
      </text>
      <text x={x(0.55)} y={y(0.55)} textAnchor="middle"
        fill="rgba(251,146,60,0.8)" fontSize="12" fontFamily="system-ui" fontWeight="600">
        LIQUID
      </text>
      <text x={x(0.65)} y={y(0.12)} textAnchor="middle"
        fill="rgba(52,211,153,0.8)" fontSize="12" fontFamily="system-ui" fontWeight="600">
        GAS
      </text>
      <text x={x(0.90)} y={y(0.90)} textAnchor="middle"
        fill="rgba(244,63,94,0.6)" fontSize="10" fontFamily="system-ui" fontWeight="600">
        SUPER-
      </text>
      <text x={x(0.90)} y={y(0.82)} textAnchor="middle"
        fill="rgba(244,63,94,0.6)" fontSize="10" fontFamily="system-ui" fontWeight="600">
        CRITICAL
      </text>

      {/* Boundary labels */}
      <text x={x(0.10)} y={y(0.10)} textAnchor="middle"
        fill="#60a5fa" fontSize="8.5" fontFamily="monospace">
        Sublimation
      </text>
      <text x={x(0.52)} y={y(0.44)} textAnchor="start"
        fill="#34d399" fontSize="8.5" fontFamily="monospace">
        Vaporization
      </text>
      <text x={x(0.28)} y={y(0.73)} textAnchor="middle"
        fill="#fb923c" fontSize="8.5" fontFamily="monospace">
        Fusion
      </text>

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 5}
        stroke="rgba(var(--overlay),0.3)" strokeWidth="1" />
      <line x1={ML - 4} y1={MT + PH} x2={ML + PW} y2={MT + PH}
        stroke="rgba(var(--overlay),0.3)" strokeWidth="1" />

      {/* Axis labels */}
      <text x={ML - 40} y={MT + PH / 2} textAnchor="middle"
        fill="rgba(var(--overlay),0.35)" fontSize="9.5" fontFamily="system-ui"
        transform={`rotate(-90, ${ML - 40}, ${MT + PH / 2})`}>
        Pressure
      </text>
      <text x={ML + PW / 2} y={H - 4} textAnchor="middle"
        fill="rgba(var(--overlay),0.35)" fontSize="9.5" fontFamily="system-ui">
        Temperature
      </text>

      {/* Arrow tips on axes */}
      <polygon points={`${ML},${MT - 2} ${ML - 3},${MT + 6} ${ML + 3},${MT + 6}`}
        fill="rgba(var(--overlay),0.3)" />
      <polygon points={`${ML + PW + 4},${MT + PH} ${ML + PW - 4},${MT + PH - 3} ${ML + PW - 4},${MT + PH + 3}`}
        fill="rgba(var(--overlay),0.3)" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SUBSTANCE_DATA = [
  {
    name: 'Water', formula: 'H₂O',
    tp: '0.01 °C, 611.7 Pa',
    cp: '374 °C, 22.1 MPa',
    mp1atm: '0 °C',
    bp1atm: '100 °C',
    notes: 'Anomalous negative fusion slope — pressure lowers mp. Unique among common substances.',
  },
  {
    name: 'CO₂', formula: 'CO₂',
    tp: '−56.6 °C, 518 kPa',
    cp: '31.1 °C, 7.37 MPa',
    mp1atm: 'N/A (sublimes)',
    bp1atm: '−78.5 °C (sublimes at 1 atm)',
    notes: 'No liquid phase at 1 atm — triple point pressure (518 kPa) is above atmospheric.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhaseDiagramReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Diagram */}
      <div className="flex flex-col gap-2 print:hidden">
        <SectionHead label="Generic Phase Diagram" />
        <div className="rounded-sm border border-border overflow-hidden p-3"
          style={{ background: 'rgb(var(--color-base))' }}>
          <PhaseDiagramSVG />
        </div>
        <p className="font-sans text-xs text-dim px-1">
          A phase diagram maps which state of matter is stable at a given temperature and pressure.
          Boundary lines show equilibrium between two phases; the triple point is the unique T and P where all three coexist.
        </p>
      </div>

      {/* Regions and boundaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="flex flex-col gap-2">
          <SectionHead label="Phase Regions" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {[
              { label: 'Solid',          color: '#60a5fa', desc: 'Low temperature, high pressure. Particles locked in a rigid lattice.' },
              { label: 'Liquid',         color: '#fb923c', desc: 'Moderate T and P. Particles close together but able to flow.' },
              { label: 'Gas',            color: '#34d399', desc: 'High temperature, low pressure. Particles far apart and moving fast.' },
              { label: 'Supercritical',  color: '#f43f5e', desc: 'Above critical T and P. A single fluid phase — gas and liquid properties merge.' },
            ].map(r => (
              <div key={r.label} className="flex gap-3 items-start px-4 py-3 border-b border-border last:border-b-0">
                <span className="font-sans text-sm font-semibold w-24 shrink-0 pt-px" style={{ color: r.color }}>{r.label}</span>
                <span className="font-sans text-xs text-secondary leading-relaxed">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionHead label="Boundary Lines" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {[
              { label: 'Fusion curve',       color: '#fb923c', desc: 'Solid ↔ Liquid boundary. The melting/freezing line. Most substances have a positive slope (pressure raises mp).' },
              { label: 'Vaporization curve', color: '#34d399', desc: 'Liquid ↔ Gas boundary. Ends at the critical point; beyond it, no sharp phase boundary exists.' },
              { label: 'Sublimation curve',  color: '#60a5fa', desc: 'Solid ↔ Gas boundary. Below the triple point, solid converts directly to vapor (and vice versa).' },
            ].map(r => (
              <div key={r.label} className="flex gap-3 items-start px-4 py-3 border-b border-border last:border-b-0">
                <span className="font-sans text-sm font-semibold w-28 shrink-0 pt-px" style={{ color: r.color }}>{r.label}</span>
                <span className="font-sans text-xs text-secondary leading-relaxed">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special points */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Special Points" />
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            {
              label: 'Triple Point',
              color: '#facc15',
              formula: 'Unique T and P',
              desc: 'The only temperature and pressure at which all three phases (solid, liquid, gas) coexist in equilibrium simultaneously.',
            },
            {
              label: 'Critical Point',
              color: '#f43f5e',
              formula: 'T_c and P_c',
              desc: 'Above the critical temperature, a gas cannot be liquefied by pressure alone. The distinction between liquid and gas disappears — the substance becomes a supercritical fluid.',
            },
            {
              label: 'Normal mp',
              color: '#fb923c',
              formula: 'T where fusion curve crosses 1 atm',
              desc: 'The melting point measured at standard atmospheric pressure (1 atm / 101.325 kPa).',
            },
            {
              label: 'Normal bp',
              color: '#34d399',
              formula: 'T where vaporization curve crosses 1 atm',
              desc: 'The boiling point measured at 1 atm. At higher altitudes (lower P), the boiling point decreases.',
            },
          ].map(r => (
            <div key={r.label}
              className="grid grid-cols-[7rem_10rem_1fr] gap-x-4 items-start px-4 py-3 border-b border-border last:border-b-0">
              <span className="font-sans text-sm font-semibold pt-px" style={{ color: r.color }}>{r.label}</span>
              <span className="font-mono text-xs text-dim pt-px">{r.formula}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Substance-specific data */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Water vs CO₂ — Key Differences" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUBSTANCE_DATA.map(s => (
            <div key={s.name} className="rounded-sm border border-border bg-surface px-5 py-4 flex flex-col gap-3">
              <div>
                <span className="font-sans text-sm font-semibold text-bright">{s.name}</span>
                <span className="font-mono text-xs text-dim ml-2">{s.formula}</span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                {[
                  ['Triple point', s.tp],
                  ['Critical point', s.cp],
                  ['mp at 1 atm', s.mp1atm],
                  ['bp at 1 atm', s.bp1atm],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-dim w-28 shrink-0">{k}</span>
                    <span className="text-secondary">{v}</span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-xs text-secondary leading-relaxed border-t border-border pt-3">
                {s.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reading the diagram */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Reading the Diagram" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Finding the phase',
              color: '#60a5fa',
              body: 'Pick a T and P coordinate. Whichever region the point falls in is the stable phase at those conditions.',
            },
            {
              title: 'Crossing a boundary',
              color: '#fb923c',
              body: 'Moving across a boundary line at constant pressure = heating or cooling induces a phase change. Moving across at constant temperature = pressure-induced phase change.',
            },
            {
              title: 'Negative fusion slope',
              color: '#34d399',
              body: 'Water\'s fusion curve slopes left — higher pressure lowers the melting point. Most substances slope right. This is why ice melts under pressure (e.g., ice skating).',
            },
            {
              title: 'Sublimation at 1 atm',
              color: '#f43f5e',
              body: 'A substance whose triple point is above 1 atm has no liquid phase at atmospheric pressure — it sublimes directly. Dry ice (CO₂) is the classic example.',
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

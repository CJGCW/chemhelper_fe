import { SectionHead } from '../Layout/PageShell'

// ── Static diagram ────────────────────────────────────────────────────────────

function HeatingCurveDiagram() {
  const W = 560, H = 280
  const ML = 52, MR = 20, MT = 24, MB = 44
  const PW = W - ML - MR
  const PH = H - MT - MB

  // Normalised x breakpoints (0–1 range of total heat added)
  const bx = [0, 0.15, 0.28, 0.55, 0.72, 1.0]
  // Normalised y breakpoints (temperature, 0–1)
  const by = [0.05, 0.3, 0.3, 0.65, 0.65, 0.95]

  const x = (f: number) => ML + f * PW
  const y = (f: number) => MT + PH - f * PH

  const pts = bx.map((bxi, i) => ({ x: x(bxi), y: y(by[i]) }))

  const phaseColors = ['#60a5fa', '#fb923c', '#34d399', '#f43f5e', '#c084fc']
  const phaseLabels = [
    { label: 'Solid',   xi: 0.075, yi: 0.17 },
    { label: 'Melting', xi: 0.215, yi: 0.30 },
    { label: 'Liquid',  xi: 0.415, yi: 0.47 },
    { label: 'Vap.',    xi: 0.635, yi: 0.65 },
    { label: 'Gas',     xi: 0.86,  yi: 0.79 },
  ]

  // Annotation positions for equations
  const eqAnnotations = [
    { label: 'q = mc_s∆T', xi: 0.075, yi: 0.17, anchor: 'middle' },
    { label: 'q = n∆H_fus', xi: 0.215, yi: 0.22, anchor: 'middle' },
    { label: 'q = mc_l∆T', xi: 0.415, yi: 0.47, anchor: 'middle' },
    { label: 'q = n∆H_vap', xi: 0.635, yi: 0.57, anchor: 'middle' },
    { label: 'q = mc_g∆T', xi: 0.86,  yi: 0.79, anchor: 'middle' },
  ]

  // mp / bp horizontal dashed lines
  const transitions = [
    { yi: by[1], label: 'mp' },
    { yi: by[3], label: 'bp' },
  ]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Heating curve diagram">
      <rect x={ML} y={MT} width={PW} height={PH} fill="rgba(var(--overlay),0.015)" rx="2" />

      {/* Dashed lines at mp and bp */}
      {transitions.map(({ yi, label }) => (
        <g key={label}>
          <line
            x1={ML} y1={y(yi)} x2={ML + PW} y2={y(yi)}
            stroke="rgba(var(--overlay),0.12)" strokeWidth="1" strokeDasharray="4 3"
          />
          <text x={ML - 5} y={y(yi)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(var(--overlay),0.35)" fontSize="9" fontFamily="monospace">
            {label}
          </text>
        </g>
      ))}

      {/* Segment lines */}
      {pts.slice(0, -1).map((p, i) => (
        <line key={i}
          x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y}
          stroke={phaseColors[i]} strokeWidth="2.5" strokeLinecap="round"
        />
      ))}

      {/* Phase labels */}
      {phaseLabels.map(({ label, xi, yi }, i) => (
        <text key={label}
          x={x(xi)} y={y(yi) - 10}
          textAnchor="middle" fill={phaseColors[i]}
          fontSize="9.5" fontFamily="monospace" fontWeight="600">
          {label}
        </text>
      ))}

      {/* Equation annotations */}
      {eqAnnotations.map(({ label, xi, yi }) => (
        <text key={label}
          x={x(xi)} y={y(yi) + 16}
          textAnchor="middle" fill="rgba(var(--overlay),0.28)"
          fontSize="8" fontFamily="monospace">
          {label}
        </text>
      ))}

      {/* Axes */}
      <line x1={ML} y1={MT} x2={ML} y2={MT + PH + 5}
        stroke="rgba(var(--overlay),0.3)" strokeWidth="1" />
      <line x1={ML - 4} y1={MT + PH} x2={ML + PW} y2={MT + PH}
        stroke="rgba(var(--overlay),0.3)" strokeWidth="1" />

      {/* Axis labels */}
      <text x={ML - 36} y={MT + PH / 2} textAnchor="middle"
        fill="rgba(var(--overlay),0.35)" fontSize="9.5" fontFamily="system-ui"
        transform={`rotate(-90, ${ML - 36}, ${MT + PH / 2})`}>
        Temperature (°C)
      </text>
      <text x={ML + PW / 2} y={H - 4} textAnchor="middle"
        fill="rgba(var(--overlay),0.35)" fontSize="9.5" fontFamily="system-ui">
        Heat Added (kJ)
      </text>
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SUBSTANCES = [
  { name: 'Water',   formula: 'H₂O',    mp: 0,      bp: 100,   cs: 2.090, cl: 4.184, cg: 2.010, dHfus: 6.02,  dHvap: 40.7  },
  { name: 'Ethanol', formula: 'C₂H₅OH', mp: -114.1, bp: 78.4,  cs: 2.42,  cl: 2.44,  cg: 1.42,  dHfus: 4.93,  dHvap: 38.6  },
  { name: 'Ammonia', formula: 'NH₃',    mp: -77.7,  bp: -33.4, cs: 1.995, cl: 4.700, cg: 2.175, dHfus: 5.65,  dHvap: 23.35 },
  { name: 'Benzene', formula: 'C₆H₆',   mp: 5.5,    bp: 80.1,  cs: 1.74,  cl: 1.74,  cg: 1.06,  dHfus: 9.87,  dHvap: 30.7  },
  { name: 'Iron',    formula: 'Fe',      mp: 1538,   bp: 2862,  cs: 0.449, cl: 0.820, cg: 0.450, dHfus: 13.81, dHvap: 349.6 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeatingCurveReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Diagram */}
      <div className="flex flex-col gap-2 print:hidden">
        <SectionHead label="Heating Curve — Shape" />
        <div className="rounded-sm border border-border overflow-hidden p-3"
          style={{ background: 'rgb(var(--color-base))' }}>
          <HeatingCurveDiagram />
        </div>
        <p className="font-sans text-xs text-dim px-1">
          A heating curve for a pure substance shows five segments. Slopes represent single-phase heating;
          flat plateaus represent phase transitions at constant temperature.
        </p>
      </div>

      {/* The five segments */}
      <div className="flex flex-col gap-2">
        <SectionHead label="The Five Segments" />
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            {
              phase: 'Solid heating',
              color: '#60a5fa',
              eq: 'q = mc_s∆T',
              desc: 'Solid absorbs heat; temperature rises. Slope depends on c_s (specific heat of solid).',
            },
            {
              phase: 'Melting (fusion)',
              color: '#fb923c',
              eq: 'q = n∆H_fus',
              desc: 'Temperature constant at the melting point. Energy breaks crystal lattice forces. No temperature change until all solid melts.',
            },
            {
              phase: 'Liquid heating',
              color: '#34d399',
              eq: 'q = mc_l∆T',
              desc: 'Liquid absorbs heat; temperature rises. Uses c_l (specific heat of liquid). For water, c_l = 4.184 J/(g·°C) — the highest of the three phases.',
            },
            {
              phase: 'Vaporization',
              color: '#f43f5e',
              eq: 'q = n∆H_vap',
              desc: 'Temperature constant at the boiling point. Energy overcomes intermolecular attractions. ∆H_vap >> ∆H_fus, so this plateau is much longer.',
            },
            {
              phase: 'Gas heating',
              color: '#c084fc',
              eq: 'q = mc_g∆T',
              desc: 'Gas absorbs heat; temperature rises. Uses c_g (specific heat of gas). Steeper slope than liquid — gases have lower specific heats.',
            },
          ].map(r => (
            <div key={r.phase}
              className="grid grid-cols-[8rem_9rem_1fr] gap-x-4 items-start px-4 py-3 border-b border-border last:border-b-0">
              <span className="font-sans text-sm font-semibold" style={{ color: r.color }}>{r.phase}</span>
              <span className="font-mono text-sm text-bright pt-px">{r.eq}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-sm border border-border bg-raised px-5 py-4 flex flex-col gap-3">
          <p className="font-mono text-2xl font-bold text-bright">q = mc∆T</p>
          <p className="font-sans text-xs text-secondary">Used for sloped segments — single phase heating or cooling.</p>
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            {[
              { sym: 'q', desc: 'heat (J)',             note: '+ absorbed, − released' },
              { sym: 'm', desc: 'mass (g)',              note: '' },
              { sym: 'c', desc: 'specific heat (J/g·°C)', note: 'depends on phase' },
              { sym: '∆T', desc: 'temp change (°C)',    note: 'T_final − T_initial' },
            ].map(r => (
              <div key={r.sym} className="flex items-baseline gap-2">
                <span className="font-mono text-sm w-6 shrink-0" style={{ color: 'var(--c-halogen)' }}>{r.sym}</span>
                <span className="font-mono text-xs text-secondary">{r.desc}</span>
                {r.note && <span className="font-mono text-xs text-secondary">{r.note}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-raised px-5 py-4 flex flex-col gap-3">
          <p className="font-mono text-2xl font-bold text-bright">q = n∆H</p>
          <p className="font-sans text-xs text-secondary">Used for flat plateaus — phase transitions at constant temperature.</p>
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            {[
              { sym: 'q',      desc: 'heat (J)',        note: '' },
              { sym: 'n',      desc: 'moles (mol)',      note: 'n = mass ÷ molar mass' },
              { sym: '∆H_fus', desc: 'enthalpy of fusion (J/mol)',        note: 'melting/freezing' },
              { sym: '∆H_vap', desc: 'enthalpy of vaporization (J/mol)',  note: 'boiling/condensing' },
            ].map(r => (
              <div key={r.sym} className="flex items-baseline gap-2">
                <span className="font-mono text-sm w-14 shrink-0" style={{ color: 'var(--c-halogen)' }}>{r.sym}</span>
                <span className="font-mono text-xs text-secondary">{r.desc}</span>
                {r.note && <span className="font-mono text-xs text-secondary">— {r.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Substance data table */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Substance Constants" />
        <div className="rounded-sm border border-border bg-surface overflow-x-auto">
          <table className="w-full text-xs font-mono whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-raised">
                {['Substance', 'mp (°C)', 'bp (°C)', 'c_s J/(g·°C)', 'c_l J/(g·°C)', 'c_g J/(g·°C)', '∆H_fus kJ/mol', '∆H_vap kJ/mol'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-dim font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBSTANCES.map(s => (
                <tr key={s.name} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2">
                    <span className="font-sans text-sm text-primary">{s.name}</span>
                    <span className="text-dim ml-1.5">{s.formula}</span>
                  </td>
                  <td className="px-3 py-2 text-secondary">{s.mp}</td>
                  <td className="px-3 py-2 text-secondary">{s.bp}</td>
                  <td className="px-3 py-2" style={{ color: '#60a5fa' }}>{s.cs}</td>
                  <td className="px-3 py-2" style={{ color: '#34d399' }}>{s.cl}</td>
                  <td className="px-3 py-2" style={{ color: '#c084fc' }}>{s.cg}</td>
                  <td className="px-3 py-2" style={{ color: '#fb923c' }}>{s.dHfus}</td>
                  <td className="px-3 py-2" style={{ color: '#f43f5e' }}>{s.dHvap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key concepts */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Key Concepts" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Slope steepness',
              color: '#60a5fa',
              body: 'A steeper slope means lower specific heat — less heat is needed to raise the temperature by 1°C. A shallower slope means higher specific heat.',
            },
            {
              title: 'Plateau length',
              color: '#fb923c',
              body: 'A longer plateau means a larger enthalpy of transition. The vaporization plateau is almost always much longer than the melting plateau because ∆H_vap >> ∆H_fus.',
            },
            {
              title: 'Cooling curve',
              color: '#34d399',
              body: 'Reading from right to left gives the cooling curve. All equations and plateaus are the same — heat is released (q negative) instead of absorbed.',
            },
            {
              title: 'Total heat',
              color: '#c084fc',
              body: 'For a multi-segment process, calculate q for each segment separately, then sum. q_total = q_solid + q_melt + q_liquid + q_vap + q_gas.',
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

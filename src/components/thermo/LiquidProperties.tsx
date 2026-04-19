import { useState } from 'react'

// ── SVG: Surface tension molecules ─────────────────────────────────────────────

function SurfaceTensionSVG() {
  const W = 280, H = 180
  const R = 14, cols = 5, rows = 4
  const gx = (W - cols * R * 2.4) / 2
  const gy = 16

  // Arrows from center toward neighbors (dx, dy)
  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7],
  ]

  const molecules: { cx: number; cy: number; row: number }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      molecules.push({
        cx: gx + c * R * 2.4 + R,
        cy: gy + r * R * 2.4 + R,
        row: r,
      })
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" aria-label="Surface tension diagram">
      {/* Surface label */}
      <text x={W / 2} y={gy - 4} textAnchor="middle"
        fill="rgba(251,146,60,0.8)" fontSize="8.5" fontFamily="system-ui" fontWeight="600"
        letterSpacing="0.08em">
        SURFACE
      </text>
      <line x1={gx - 4} y1={gy} x2={W - gx + 4} y2={gy}
        stroke="rgba(251,146,60,0.35)" strokeWidth="1" strokeDasharray="3 2" />

      {/* Bulk label */}
      <text x={W / 2} y={gy + 3.5 * R * 2.4 + R + 16} textAnchor="middle"
        fill="rgba(96,165,250,0.6)" fontSize="8.5" fontFamily="system-ui" fontWeight="600"
        letterSpacing="0.08em">
        BULK
      </text>

      {molecules.map(({ cx, cy, row }, i) => {
        const isSurface = row === 0
        const color = isSurface ? 'rgba(251,146,60,0.9)' : 'rgba(96,165,250,0.9)'
        const arrowColor = isSurface ? 'rgba(251,146,60,0.5)' : 'rgba(96,165,250,0.3)'

        // Surface molecules only have downward/sideways arrows (no upward)
        const activeDirs = dirs.filter(([, dy]) => !isSurface || dy >= 0)

        return (
          <g key={i}>
            {activeDirs.map(([dx, dy], j) => {
              const ex = cx + dx * (R + 3), ey = cy + dy * (R + 3)
              return (
                <line key={j} x1={cx} y1={cy} x2={ex} y2={ey}
                  stroke={arrowColor} strokeWidth="1" markerEnd={`url(#arr-${isSurface ? 's' : 'b'})`} />
              )
            })}
            <circle cx={cx} cy={cy} r={R - 2} fill={isSurface ? 'rgba(251,146,60,0.15)' : 'rgba(96,165,250,0.1)'}
              stroke={color} strokeWidth="1.5" />
          </g>
        )
      })}

      {/* Net force arrow for surface molecule */}
      {(() => {
        const { cx, cy } = molecules[2]  // middle of top row
        return (
          <g>
            <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 20}
              stroke="#fb923c" strokeWidth="2.5" markerEnd="url(#arr-net)" />
            <text x={cx + 6} y={cy + 14} fill="rgba(251,146,60,0.9)" fontSize="7.5" fontFamily="system-ui">
              net force
            </text>
          </g>
        )
      })()}

      <defs>
        <marker id="arr-s" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L4,2 L0,4 Z" fill="rgba(251,146,60,0.5)" />
        </marker>
        <marker id="arr-b" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L4,2 L0,4 Z" fill="rgba(96,165,250,0.3)" />
        </marker>
        <marker id="arr-net" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#fb923c" />
        </marker>
      </defs>
    </svg>
  )
}

// ── SVG: Meniscus ──────────────────────────────────────────────────────────────

function MeniscusSVG() {
  const W = 280, H = 170

  // Tube dimensions
  const tw = 36, th = 110, ty = 30, gap = 60
  const lx = W / 2 - tw - gap / 2
  const rx = W / 2 + gap / 2

  // Water (concave): arc curving UP in the center
  const wBot = ty + th
  const wMid = wBot - 18        // center of meniscus dips down less than edges
  const rMid = wBot - 2         // mercury rises higher in center (convex)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" aria-label="Meniscus diagram">

      {/* Labels */}
      <text x={lx + tw / 2} y={ty - 8} textAnchor="middle"
        fill="rgba(96,165,250,0.8)" fontSize="9" fontFamily="system-ui" fontWeight="600">Water</text>
      <text x={rx + tw / 2} y={ty - 8} textAnchor="middle"
        fill="rgba(156,163,175,0.8)" fontSize="9" fontFamily="system-ui" fontWeight="600">Mercury</text>

      {/* Water tube */}
      <rect x={lx} y={ty} width={tw} height={th} fill="rgba(96,165,250,0.06)"
        stroke="rgba(var(--overlay),0.2)" strokeWidth="1.5" rx="2" />
      {/* Water fill */}
      <rect x={lx + 1.5} y={wMid + 10} width={tw - 3} height={wBot - wMid - 10}
        fill="rgba(96,165,250,0.25)" />
      {/* Concave meniscus arc */}
      <path d={`M ${lx + 1.5} ${wMid + 10} Q ${lx + tw / 2} ${wMid - 4} ${lx + tw - 1.5} ${wMid + 10}`}
        fill="rgba(96,165,250,0.25)" stroke="rgba(96,165,250,0.8)" strokeWidth="1.5" />

      {/* Mercury tube */}
      <rect x={rx} y={ty} width={tw} height={th} fill="rgba(156,163,175,0.06)"
        stroke="rgba(var(--overlay),0.2)" strokeWidth="1.5" rx="2" />
      {/* Mercury fill */}
      <rect x={rx + 1.5} y={rMid + 8} width={tw - 3} height={wBot - rMid - 8}
        fill="rgba(156,163,175,0.25)" />
      {/* Convex meniscus arc */}
      <path d={`M ${rx + 1.5} ${rMid + 8} Q ${rx + tw / 2} ${rMid + 22} ${rx + tw - 1.5} ${rMid + 8}`}
        fill="rgba(156,163,175,0.25)" stroke="rgba(156,163,175,0.7)" strokeWidth="1.5" />

      {/* Adhesion > cohesion label for water */}
      <text x={lx + tw / 2} y={wBot + 18} textAnchor="middle"
        fill="rgba(96,165,250,0.65)" fontSize="7.5" fontFamily="system-ui">adhesion &gt; cohesion</text>
      <text x={lx + tw / 2} y={wBot + 28} textAnchor="middle"
        fill="rgba(96,165,250,0.5)" fontSize="7" fontFamily="system-ui">concave · rises</text>

      {/* Cohesion > adhesion label for mercury */}
      <text x={rx + tw / 2} y={wBot + 18} textAnchor="middle"
        fill="rgba(156,163,175,0.65)" fontSize="7.5" fontFamily="system-ui">cohesion &gt; adhesion</text>
      <text x={rx + tw / 2} y={wBot + 28} textAnchor="middle"
        fill="rgba(156,163,175,0.5)" fontSize="7" fontFamily="system-ui">convex · depressed</text>
    </svg>
  )
}

// ── Data tables ────────────────────────────────────────────────────────────────

const ST_DATA = [
  { name: 'Mercury',      formula: 'Hg',         imf: 'Metallic',        γ: 486,  note: 'Strongest metallic bonds' },
  { name: 'Water',        formula: 'H₂O',         imf: 'H-bonding',       γ: 72.8, note: '2 H-bond donors/acceptors' },
  { name: 'Glycerol',     formula: 'C₃H₈O₃',      imf: 'H-bonding ×3',    γ: 63.4, note: 'Three –OH groups' },
  { name: 'Acetic acid',  formula: 'CH₃COOH',     imf: 'H-bonding',       γ: 27.1, note: 'H-bond donor + acceptor' },
  { name: 'Benzene',      formula: 'C₆H₆',         imf: 'London disp.',    γ: 28.9, note: 'Large polarizable π cloud' },
  { name: 'Ethanol',      formula: 'C₂H₅OH',      imf: 'H-bonding',       γ: 22.1, note: 'Weaker than water (alkyl group)' },
  { name: 'Acetone',      formula: '(CH₃)₂CO',    imf: 'Dipole–dipole',   γ: 23.7, note: 'Polar C=O, no H-bond donor' },
  { name: 'Hexane',       formula: 'C₆H₁₄',       imf: 'London disp.',    γ: 17.9, note: 'Nonpolar, low' },
  { name: 'Diethyl ether',formula: '(C₂H₅)₂O',   imf: 'London + dipole', γ: 17.1, note: 'Weak dipole, large alkyl groups' },
]

const VISC_DATA = [
  { name: 'Glycerol',      formula: 'C₃H₈O₃',     imf: 'H-bonding ×3',    η: 1412,  note: 'Three –OH groups form H-bond network' },
  { name: 'Ethylene glycol',formula: 'C₂H₆O₂',    imf: 'H-bonding ×2',    η: 16.1,  note: 'Two –OH groups' },
  { name: 'Water',          formula: 'H₂O',         imf: 'H-bonding',       η: 1.00,  note: 'Reference (1.00 mPa·s at 20 °C)' },
  { name: 'Ethanol',        formula: 'C₂H₅OH',     imf: 'H-bonding',       η: 1.20,  note: 'H-bonding + larger alkyl chain' },
  { name: 'Benzene',        formula: 'C₆H₆',        imf: 'London disp.',    η: 0.652, note: 'Planar ring, moderate London forces' },
  { name: 'Acetone',        formula: '(CH₃)₂CO',   imf: 'Dipole–dipole',   η: 0.316, note: 'Polar but no H-bond donor' },
  { name: 'Hexane',         formula: 'C₆H₁₄',      imf: 'London disp.',    η: 0.300, note: 'Nonpolar, low viscosity' },
  { name: 'Diethyl ether',  formula: '(C₂H₅)₂O',  imf: 'London + dipole', η: 0.224, note: 'Very low, weak IMFs' },
]

const IMF_COLOR: Record<string, string> = {
  'Metallic':       '#fbbf24',
  'H-bonding ×3':   '#f43f5e',
  'H-bonding ×2':   '#fb7185',
  'H-bonding':      '#fb923c',
  'Dipole–dipole':  '#34d399',
  'London disp.':   '#60a5fa',
  'London + dipole':'#818cf8',
}

// ── Predictor ─────────────────────────────────────────────────────────────────

type IMFType  = 'hbond' | 'hbond_multi' | 'dipole' | 'london'
type SizeType = 'small' | 'medium' | 'large'

interface Prediction {
  st: 'Very high' | 'High' | 'Moderate' | 'Low' | 'Very low'
  stColor: string
  η: 'Very high' | 'High' | 'Moderate' | 'Low' | 'Very low'
  ηColor: string
  stReason: string
  ηReason: string
  examples: string
}

function predict(imf: IMFType, size: SizeType): Prediction {
  const hi = '#f43f5e', med = '#fb923c', mid = '#fbbf24', lo = '#34d399', vlo = '#60a5fa'

  if (imf === 'hbond_multi') return {
    st: 'High',       stColor: hi,
    η:  'Very high',  ηColor:  hi,
    stReason: 'Multiple O–H or N–H groups create a dense H-bond network at the surface, requiring significant energy to expand it.',
    ηReason:  'Each molecule can simultaneously H-bond to several neighbors in multiple directions, strongly resisting flow.',
    examples: 'Glycerol (3 –OH), ethylene glycol (2 –OH), sugars',
  }
  if (imf === 'hbond') {
    const ηLevel = size === 'large' ? 'High' : 'Moderate'
    const ηColor = size === 'large' ? hi : med
    return {
      st: 'High',  stColor: hi,
      η:  ηLevel,  ηColor,
      stReason: "O\u2013H or N\u2013H groups form strong directional H-bonds at the surface. Water's exceptionally high surface tension (72.8 mN/m) comes from this.",
      ηReason:  size === 'large'
        ? 'H-bonding + larger molecular size (more London dispersion contact area) both resist flow.'
        : 'H-bonding resists layer sliding, though single-site donors/acceptors allow some flow.',
      examples: size === 'large' ? 'Ethanol, isopropanol, acetic acid' : 'Water, methanol, ammonia',
    }
  }
  if (imf === 'dipole') {
    const ηLevel = size === 'large' ? 'Moderate' : 'Low'
    const ηColor = size === 'large' ? mid : lo
    return {
      st: 'Moderate',  stColor: mid,
      η:  ηLevel,      ηColor,
      stReason: 'Dipole–dipole attractions are weaker than H-bonds, so less energy is needed to pull surface molecules apart.',
      ηReason:  size === 'large'
        ? 'Larger polar molecules have added London dispersion in addition to dipole–dipole, moderately increasing resistance to flow.'
        : 'Weaker than H-bonding; molecules flow past each other with modest resistance.',
      examples: size === 'large' ? 'DMF, DMSO, nitrobenzene' : 'Acetone, chloromethane, acetonitrile',
    }
  }
  // london
  const stLevel = size === 'large' ? 'Moderate' : 'Low'
  const stColor = size === 'large' ? mid : vlo
  const ηLevel  = size === 'large' ? 'Moderate' : 'Very low'
  const ηColor  = size === 'large' ? mid : vlo
  return {
    st: stLevel, stColor,
    η:  ηLevel,  ηColor,
    stReason: size === 'large'
      ? 'Larger nonpolar molecules have higher polarizability — stronger London forces than small nonpolar molecules, giving a moderate surface tension.'
      : 'Only weak London dispersion forces. Small nonpolar molecules are easily pulled apart at the surface.',
    ηReason: size === 'large'
      ? 'Long or bulky nonpolar molecules (e.g. oils, waxes) entangle and have significant London dispersion contact area, resisting flow.'
      : 'Very weak London forces. Small nonpolar molecules flow with minimal resistance.',
    examples: size === 'large'
      ? 'Mineral oil, hexadecane, long-chain alkanes'
      : 'Hexane, pentane, diethyl ether, CCl₄',
  }
}

const LEVEL_BAR_W: Record<string, number> = {
  'Very high': 100, High: 80, Moderate: 55, Low: 30, 'Very low': 12,
}

function LevelBar({ label, color }: { label: string; color: string }) {
  const w = LEVEL_BAR_W[label] ?? 50
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-2.5 rounded-full bg-raised overflow-hidden border border-border">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LiquidProperties() {
  const [imf,  setImf]  = useState<IMFType>('hbond')
  const [size, setSize] = useState<SizeType>('small')
  const pred = predict(imf, size)

  return (
    <div className="flex flex-col gap-10 max-w-3xl">

      {/* ── Surface Tension ── */}
      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright">Surface Tension</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-3">
            <p className="font-sans text-sm text-secondary leading-relaxed">
              Surface tension (γ) is the energy required to increase a liquid's surface area by one unit.
              It arises because surface molecules experience a <em className="text-primary">net inward force</em> —
              they have fewer neighbors above them than bulk molecules do, leaving their upward-facing IMFs unsatisfied.
            </p>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              <span className="text-primary font-medium">Stronger IMFs → higher γ.</span> More energy is needed
              to bring a molecule to the surface and break those extra bonds.
            </p>
            <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-sm bg-raised border border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Trend (same size)</span>
              <span className="font-sans text-xs text-secondary">
                Metallic &gt; H-bonding &gt; Dipole–dipole &gt; London dispersion
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <SurfaceTensionSVG />
          </div>
        </div>

        {/* ST data table */}
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal">Substance</th>
                <th className="px-3 py-2 text-left text-dim font-normal hidden sm:table-cell">IMF</th>
                <th className="px-3 py-2 text-right text-dim font-normal">γ (mN/m, 20°C)</th>
                <th className="px-3 py-2 text-left text-dim font-normal hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {ST_DATA.map(r => (
                <tr key={r.name} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-primary">
                    {r.name}
                    <span className="text-dim ml-1.5">{r.formula}</span>
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <span className="font-sans text-[10px] px-1.5 py-0.5 rounded-sm"
                      style={{ color: IMF_COLOR[r.imf] ?? '#aaa', background: `${IMF_COLOR[r.imf] ?? '#aaa'}18` }}>
                      {r.imf}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--c-halogen)' }}>{r.γ}</td>
                  <td className="px-3 py-2 text-dim hidden md:table-cell">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Viscosity ── */}
      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright">Viscosity</h3>

        <div className="flex flex-col gap-3">
          <p className="font-sans text-sm text-secondary leading-relaxed">
            Viscosity (η) is a liquid's resistance to flow — the friction between layers of liquid sliding
            past each other. Two molecular factors increase viscosity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Strong IMFs',
                color: '#fb923c',
                body: 'Molecules that strongly attract each other resist being pulled apart as layers flow. H-bonding and metallic interactions give the highest viscosities.',
              },
              {
                title: 'Large / complex molecules',
                color: '#c084fc',
                body: 'Larger molecules have more surface area → stronger London forces. Long chains also become physically entangled, dramatically slowing flow (e.g. motor oil, polymers).',
              },
              {
                title: 'Multiple interaction sites',
                color: '#f43f5e',
                body: 'A molecule with several H-bond donors/acceptors (like glycerol with 3 –OH groups) can cross-link to many neighbors simultaneously, creating an exceptionally viscous network.',
              },
              {
                title: 'Temperature effect',
                color: '#34d399',
                body: 'Higher temperature gives molecules more kinetic energy to overcome IMFs. Liquid viscosity always decreases with increasing T (opposite of gases).',
              },
            ].map(c => (
              <div key={c.title} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
                <span className="font-sans text-sm font-semibold" style={{ color: c.color }}>{c.title}</span>
                <span className="font-sans text-xs text-secondary leading-relaxed">{c.body}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Viscosity data table */}
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal">Substance</th>
                <th className="px-3 py-2 text-left text-dim font-normal hidden sm:table-cell">IMF</th>
                <th className="px-3 py-2 text-right text-dim font-normal">η (mPa·s, 20°C)</th>
                <th className="px-3 py-2 text-left text-dim font-normal hidden md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {VISC_DATA.map(r => (
                <tr key={r.name} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-primary">
                    {r.name}
                    <span className="text-dim ml-1.5">{r.formula}</span>
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <span className="font-sans text-[10px] px-1.5 py-0.5 rounded-sm"
                      style={{ color: IMF_COLOR[r.imf] ?? '#aaa', background: `${IMF_COLOR[r.imf] ?? '#aaa'}18` }}>
                      {r.imf}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--c-halogen)' }}>
                    {r.η >= 100 ? r.η.toLocaleString() : r.η}
                  </td>
                  <td className="px-3 py-2 text-dim hidden md:table-cell">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-secondary px-0.5">
          Note the 6000× difference between glycerol (1412) and diethyl ether (0.224) — entirely explained by IMF type and number of interaction sites.
        </p>
      </section>

      {/* ── Capillary Action ── */}
      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright">Capillary Action</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  term: 'Cohesion',
                  color: '#60a5fa',
                  def: 'IMFs between like molecules (liquid–liquid). Responsible for the liquid pulling itself together.',
                },
                {
                  term: 'Adhesion',
                  color: '#34d399',
                  def: 'IMFs between unlike molecules (liquid–container). Responsible for the liquid climbing the wall.',
                },
              ].map(t => (
                <div key={t.term} className="flex flex-col gap-1 px-3 py-2.5 rounded-sm bg-raised border border-border">
                  <span className="font-mono text-xs font-semibold" style={{ color: t.color }}>{t.term}</span>
                  <span className="font-sans text-xs text-secondary leading-relaxed">{t.def}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-1">
              {[
                { cond: 'Adhesion > cohesion', result: 'Concave meniscus — liquid wets the wall and is drawn upward (water in glass)', color: '#60a5fa' },
                { cond: 'Cohesion > adhesion', result: 'Convex meniscus — liquid is repelled by the wall and is depressed (mercury in glass)', color: '#9ca3af' },
                { cond: 'Narrower tube', result: 'Greater capillary rise — more wall surface area relative to liquid volume', color: '#c084fc' },
              ].map(r => (
                <div key={r.cond} className="flex gap-2 font-sans text-xs text-secondary leading-relaxed">
                  <span className="font-semibold shrink-0 mt-0.5" style={{ color: r.color }}>▸</span>
                  <span><span className="text-primary font-medium">{r.cond}:</span> {r.result}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <MeniscusSVG />
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3 rounded-sm bg-raised border border-border">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Why water rises in glass</span>
          <p className="font-sans text-xs text-secondary leading-relaxed">
            Glass contains Si–OH groups on its surface. Water molecules form H-bonds with these groups
            (adhesion). This adhesive force is stronger than water's cohesive H-bonds, pulling the meniscus
            up. The liquid keeps rising until the weight of the water column balances the adhesive force.
          </p>
        </div>

        <div className="flex flex-col gap-2 px-4 py-3 rounded-sm bg-raised border border-border">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Why mercury is depressed in glass</span>
          <p className="font-sans text-xs text-secondary leading-relaxed">
            Mercury–mercury metallic bonds (cohesion) are far stronger than mercury–glass attractions
            (adhesion). Mercury therefore pulls away from the glass walls rather than spreading up them,
            forming a convex meniscus and sitting lower in the tube than the bulk surface outside.
          </p>
        </div>
      </section>

      {/* ── IMF Predictor ── */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-sans font-semibold text-bright">IMF → Property Predictor</h3>
          <p className="font-sans text-xs text-dim">
            Pick the dominant IMF type and molecule size to predict relative surface tension and viscosity.
          </p>
        </div>

        <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-6">

          {/* IMF selector */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Dominant IMF</span>
            <div className="flex flex-wrap gap-2">
              {([
                { id: 'hbond_multi', label: 'H-bonding (multiple sites)', sub: 'e.g. glycerol, sugars'   },
                { id: 'hbond',       label: 'H-bonding (single site)',     sub: 'e.g. water, ethanol'     },
                { id: 'dipole',      label: 'Dipole–dipole',               sub: 'e.g. acetone, CHCl₃'    },
                { id: 'london',      label: 'London dispersion only',      sub: 'e.g. hexane, benzene'    },
              ] as const).map(o => (
                <button key={o.id} onClick={() => setImf(o.id)}
                  className="flex flex-col items-start px-3 py-2 rounded-sm border transition-colors text-left"
                  style={imf === o.id ? {
                    borderColor: 'color-mix(in srgb, var(--c-halogen) 50%, transparent)',
                    background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
                    color: 'var(--c-halogen)',
                  } : {
                    borderColor: 'rgb(var(--color-border))', background: 'rgb(var(--color-surface))',
                    color: 'rgba(var(--overlay),0.45)',
                  }}>
                  <span className="font-sans text-xs font-medium">{o.label}</span>
                  <span className="font-mono text-[9px] opacity-60">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Molecular Size</span>
            <div className="flex gap-2">
              {([
                { id: 'small',  label: 'Small',  sub: '< 100 g/mol'    },
                { id: 'medium', label: 'Medium', sub: '100–250 g/mol'  },
                { id: 'large',  label: 'Large',  sub: '> 250 g/mol'    },
              ] as const).map(o => (
                <button key={o.id} onClick={() => setSize(o.id)}
                  className="flex flex-col items-start px-3 py-2 rounded-sm border transition-colors text-left"
                  style={size === o.id ? {
                    borderColor: 'color-mix(in srgb, var(--c-halogen) 50%, transparent)',
                    background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
                    color: 'var(--c-halogen)',
                  } : {
                    borderColor: 'rgb(var(--color-border))', background: 'rgb(var(--color-surface))',
                    color: 'rgba(var(--overlay),0.45)',
                  }}>
                  <span className="font-sans text-xs font-medium">{o.label}</span>
                  <span className="font-mono text-[9px] opacity-60">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prediction output */}
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">Surface Tension</span>
                <LevelBar label={pred.st} color={pred.stColor} />
                <p className="font-sans text-xs text-secondary leading-relaxed">{pred.stReason}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">Viscosity</span>
                <LevelBar label={pred.η} color={pred.ηColor} />
                <p className="font-sans text-xs text-secondary leading-relaxed">{pred.ηReason}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start font-sans text-xs text-secondary">
              <span className="text-dim shrink-0">Examples:</span>
              <span>{pred.examples}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

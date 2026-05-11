import { CARBONS, BACK_BOND_INDICES } from './chairGeometry'

// ── Mini-viewers ────────────────────────────────────────────────────────────

const W = 160, H = 110
const STROKE_FRONT = 'rgba(var(--overlay), 0.75)'
const STROKE_BACK  = 'rgba(var(--overlay), 0.45)'

function ringLine(pts: { x: number; y: number }[], a: number, b: number, faint = false) {
  return (
    <line
      x1={pts[a].x} y1={pts[a].y}
      x2={pts[b].x} y2={pts[b].y}
      stroke={faint ? STROKE_BACK : STROKE_FRONT}
      strokeWidth={faint ? 1.5 : 2}
      strokeLinecap="round"
    />
  )
}

function miniSvg(children: React.ReactNode) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block mx-auto">
      {children}
    </svg>
  )
}

// Scale the prompt-63 chair CARBONS (320×260 viewBox) down to 160×110
function scaled(pts: typeof CARBONS): { x: number; y: number }[] {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const pad = 18
  const sx = (W - pad * 2) / (maxX - minX)
  const sy = (H - pad * 2) / (maxY - minY)
  const s  = Math.min(sx, sy)
  const offX = (W - (maxX - minX) * s) / 2
  const offY = (H - (maxY - minY) * s) / 2
  return pts.map(p => ({ x: offX + (p.x - minX) * s, y: offY + (p.y - minY) * s }))
}

function ChairMiniViewer() {
  const pts = scaled(CARBONS)
  return miniSvg(
    [0, 1, 2, 3, 4, 5].map(i => {
      const a = pts[i], b = pts[(i + 1) % 6]
      const faint = BACK_BOND_INDICES.has(i)
      return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke={faint ? STROKE_BACK : STROKE_FRONT}
        strokeWidth={faint ? 1.5 : 2} strokeLinecap="round" />
    })
  )
}

function HalfChairMiniViewer() {
  const raw = [
    { x: 30,  y: 60 },
    { x: 70,  y: 30 },
    { x: 110, y: 30 },
    { x: 130, y: 60 },
    { x: 100, y: 75 },
    { x: 60,  y: 75 },
  ]
  const pts = scaled(raw)
  return miniSvg(<>
    {ringLine(pts, 0, 1, true)}
    {ringLine(pts, 1, 2, true)}
    {ringLine(pts, 2, 3)}
    {ringLine(pts, 3, 4)}
    {ringLine(pts, 4, 5)}
    {ringLine(pts, 5, 0)}
  </>)
}

function TwistBoatMiniViewer() {
  const raw = [
    { x: 30,  y: 50 },
    { x: 70,  y: 35 },
    { x: 110, y: 50 },
    { x: 130, y: 75 },
    { x: 90,  y: 65 },
    { x: 50,  y: 75 },
  ]
  const pts = scaled(raw)
  return miniSvg(<>
    {ringLine(pts, 0, 1, true)}
    {ringLine(pts, 1, 2, true)}
    {ringLine(pts, 2, 3)}
    {ringLine(pts, 3, 4)}
    {ringLine(pts, 4, 5)}
    {ringLine(pts, 5, 0)}
  </>)
}

function BoatMiniViewer() {
  const raw = [
    { x: 40,  y: 35 },
    { x: 80,  y: 70 },
    { x: 120, y: 70 },
    { x: 160, y: 35 },
    { x: 120, y: 80 },
    { x: 80,  y: 80 },
  ]
  const pts = scaled(raw)
  return miniSvg(<>
    {ringLine(pts, 0, 1, true)}
    {ringLine(pts, 1, 2, true)}
    {ringLine(pts, 2, 3)}
    {ringLine(pts, 3, 4)}
    {ringLine(pts, 4, 5)}
    {ringLine(pts, 5, 0)}
  </>)
}

// ── ConformerCard ────────────────────────────────────────────────────────────

interface CardProps {
  name: string
  energy: string
  sublabel: string
  viewer: React.ReactNode
}

function ConformerCard({ name, energy, sublabel, viewer }: CardProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-sm border border-border bg-surface">
      <div className="w-full h-28 flex items-center justify-center">{viewer}</div>
      <div className="font-sans text-sm font-medium text-bright">{name}</div>
      <div className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{energy}</div>
      <div className="font-mono text-[10px] text-dim uppercase tracking-widest">{sublabel}</div>
    </div>
  )
}

// ── ConformerComparisonStrip ─────────────────────────────────────────────────

export function ConformerComparisonStrip() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">
        Cyclohexane Conformers
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ConformerCard name="Chair"      energy="0 kJ/mol"   sublabel="global minimum"  viewer={<ChairMiniViewer />} />
        <ConformerCard name="Half-Chair" energy="~46 kJ/mol" sublabel="transition state" viewer={<HalfChairMiniViewer />} />
        <ConformerCard name="Twist-Boat" energy="~21 kJ/mol" sublabel="local minimum"   viewer={<TwistBoatMiniViewer />} />
        <ConformerCard name="Boat"       energy="~29 kJ/mol" sublabel="local maximum"   viewer={<BoatMiniViewer />} />
      </div>
    </div>
  )
}

// ── ConformerEnergyDiagram ───────────────────────────────────────────────────

const ENERGY_PROFILE = [
  { phi: 0,   energy: 0,  label: 'Chair' },
  { phi: 30,  energy: 46, label: 'Half-chair' },
  { phi: 60,  energy: 21, label: 'Twist-boat' },
  { phi: 90,  energy: 29, label: 'Boat' },
  { phi: 120, energy: 21, label: 'Twist-boat' },
  { phi: 150, energy: 46, label: 'Half-chair' },
  { phi: 180, energy: 0,  label: 'Chair' },
]

export function ConformerEnergyDiagram() {
  const DW = 500, DH = 200
  const pad = { l: 50, r: 30, t: 24, b: 40 }
  const plotW = DW - pad.l - pad.r
  const plotH = DH - pad.t - pad.b

  const xScale = (phi: number) => pad.l + (phi / 180) * plotW
  const yScale = (e: number)   => pad.t + (1 - e / 50) * plotH

  const pathD = ENERGY_PROFILE.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${xScale(pt.phi)} ${yScale(pt.energy)}`
    const prev = arr[i - 1]
    const cx = (xScale(prev.phi) + xScale(pt.phi)) / 2
    return acc + ` Q ${cx} ${yScale(prev.energy)} ${xScale(pt.phi)} ${yScale(pt.energy)}`
  }, '')

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">
        Conformer Interconversion Energy
      </h3>
      <svg width={DW} height={DH} viewBox={`0 0 ${DW} ${DH}`}
        className="block mx-auto border border-border rounded-sm"
        style={{ background: 'rgb(var(--color-surface))' }}>
        {/* Horizontal grid lines */}
        {[0, 10, 20, 30, 40, 50].map(e => (
          <line key={e} x1={pad.l} y1={yScale(e)} x2={DW - pad.r} y2={yScale(e)}
            stroke="rgba(var(--overlay), 0.10)" strokeWidth={1} />
        ))}
        {/* Curve */}
        <path d={pathD} stroke="var(--c-halogen)" strokeWidth={2.5} fill="none" />
        {/* Critical-point markers + labels */}
        {ENERGY_PROFILE.map((pt, i) => (
          <g key={i}>
            <circle cx={xScale(pt.phi)} cy={yScale(pt.energy)} r={4} fill="var(--c-halogen)" />
            <text x={xScale(pt.phi)} y={yScale(pt.energy) - 10}
              textAnchor="middle" fontSize={9} fontFamily="monospace"
              fill="rgba(var(--overlay), 0.85)">
              {pt.label}
            </text>
          </g>
        ))}
        {/* X-axis */}
        <line x1={pad.l} y1={DH - pad.b} x2={DW - pad.r} y2={DH - pad.b}
          stroke="rgba(var(--overlay), 0.55)" strokeWidth={1.5} />
        {[0, 30, 60, 90, 120, 150, 180].map(phi => (
          <g key={phi}>
            <line x1={xScale(phi)} y1={DH - pad.b} x2={xScale(phi)} y2={DH - pad.b + 4}
              stroke="rgba(var(--overlay), 0.55)" strokeWidth={1.5} />
            <text x={xScale(phi)} y={DH - pad.b + 16}
              textAnchor="middle" fontSize={9} fontFamily="monospace"
              fill="rgba(var(--overlay), 0.65)">{phi}°</text>
          </g>
        ))}
        <text x={DW / 2} y={DH - 4} textAnchor="middle" fontSize={10} fontFamily="monospace"
          fill="rgba(var(--overlay), 0.85)">Reaction coordinate (°)</text>
        {/* Y-axis */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={DH - pad.b}
          stroke="rgba(var(--overlay), 0.55)" strokeWidth={1.5} />
        {[0, 10, 20, 30, 40, 50].map(e => (
          <g key={e}>
            <line x1={pad.l - 4} y1={yScale(e)} x2={pad.l} y2={yScale(e)}
              stroke="rgba(var(--overlay), 0.55)" strokeWidth={1.5} />
            <text x={pad.l - 8} y={yScale(e) + 3}
              textAnchor="end" fontSize={9} fontFamily="monospace"
              fill="rgba(var(--overlay), 0.65)">{e}</text>
          </g>
        ))}
        <text x={14} y={DH / 2} textAnchor="middle" fontSize={10} fontFamily="monospace"
          fill="rgba(var(--overlay), 0.85)"
          transform={`rotate(-90, 14, ${DH / 2})`}>Energy (kJ/mol)</text>
      </svg>
      <p className="font-sans text-xs text-secondary">
        The chair → chair ring flip passes through half-chair (transition state, +46 kJ/mol),
        twist-boat (local minimum, +21 kJ/mol), and boat (local maximum, +29 kJ/mol). At room
        temperature, only the chair conformers are significantly populated.
      </p>
    </div>
  )
}

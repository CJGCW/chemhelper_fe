// Compact geometry diagram driven by (central, geometry, bonds, lonePairs) —
// no full LewisStructure required. Used in practice/problems feedback cards.

const W = 220
const H = 190
const CX = W / 2
const CY = H / 2
const BL = 72   // bond length
const CR = 18   // center radius
const TR = 12   // terminal radius

type BondStyle = 'solid' | 'wedge' | 'dash'
type Slot = { x: number; y: number; style: BondStyle }

const LAYOUTS: Record<string, Slot[]> = {
  linear: [
    { x: -BL, y: 0,  style: 'solid' },
    { x:  BL, y: 0,  style: 'solid' },
  ],
  trigonal_planar: [
    { x:   0,  y: -BL,        style: 'solid' },
    { x: -62,  y:  BL * 0.50, style: 'solid' },
    { x:  62,  y:  BL * 0.50, style: 'solid' },
  ],
  bent: [
    { x: -50, y: -52, style: 'solid' },
    { x:  50, y: -52, style: 'solid' },
  ],
  tetrahedral: [
    { x:   0,  y: -BL, style: 'solid' },
    { x: -63,  y:   6, style: 'solid' },
    { x:  50,  y:  38, style: 'wedge' },
    { x:  14,  y:  64, style: 'dash'  },
  ],
  trigonal_pyramidal: [
    { x:   0,  y: -66, style: 'solid' },
    { x: -58,  y:  40, style: 'wedge' },
    { x:  58,  y:  40, style: 'dash'  },
  ],
  trigonal_bipyramidal: [
    { x:   0,  y: -BL,       style: 'solid' },
    { x:   0,  y:  BL,       style: 'solid' },
    { x: -BL,  y:   0,       style: 'solid' },
    { x:  36,  y: -62,       style: 'solid' },
    { x:  36,  y:  62,       style: 'solid' },
  ],
  seesaw: [
    { x:   0,  y: -BL, style: 'solid' },
    { x:   0,  y:  BL, style: 'solid' },
    { x: -62,  y:  20, style: 'solid' },
    { x:  54,  y:  38, style: 'wedge' },
  ],
  t_shaped: [
    { x:   0,  y: -BL, style: 'solid' },
    { x:   0,  y:  BL, style: 'solid' },
    { x: -BL,  y:   0, style: 'solid' },
  ],
  octahedral: [
    { x:   0,  y: -BL, style: 'solid' },
    { x:   0,  y:  BL, style: 'solid' },
    { x: -BL,  y:   0, style: 'solid' },
    { x:  BL,  y:   0, style: 'solid' },
    { x:  30,  y:  30, style: 'wedge' },
    { x: -30,  y: -30, style: 'dash'  },
  ],
  square_planar: [
    { x:   0,  y: -BL, style: 'solid' },
    { x:  BL,  y:   0, style: 'solid' },
    { x:   0,  y:  BL, style: 'solid' },
    { x: -BL,  y:   0, style: 'solid' },
  ],
  square_pyramidal: [
    { x:   0,  y: -BL, style: 'solid' },
    { x: -46,  y:  22, style: 'wedge' },
    { x:  46,  y:  22, style: 'wedge' },
    { x: -46,  y: -18, style: 'dash'  },
    { x:  46,  y: -18, style: 'dash'  },
  ],
}

function geoKey(geometry: string): string {
  return geometry.toLowerCase().replace(/[\s-]/g, '_')
}

function getSlots(geometry: string, n: number): Slot[] {
  const key = geoKey(geometry)
  const base = LAYOUTS[key]
  if (base) return base.slice(0, n)
  return Array.from({ length: n }, (_, i) => {
    const rad = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: Math.cos(rad) * BL, y: Math.sin(rad) * BL, style: 'solid' as const }
  })
}

function WedgeBond({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len, py = dx / len
  const w = 4
  return <path d={`M ${x1} ${y1} L ${x2 + px * w} ${y2 + py * w} L ${x2 - px * w} ${y2 - py * w} Z`} fill="rgba(var(--overlay),0.8)" />
}

function DashBond({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(var(--overlay),0.75)" strokeWidth={2} strokeDasharray="4,3" />
}

function Bond({ x1, y1, x2, y2, style }: { x1: number; y1: number; x2: number; y2: number; style: BondStyle }) {
  if (style === 'wedge') return <WedgeBond x1={x1} y1={y1} x2={x2} y2={y2} />
  if (style === 'dash')  return <DashBond  x1={x1} y1={y1} x2={x2} y2={y2} />
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(var(--overlay),0.75)" strokeWidth={2} />
}

function LonePairCloud({ cx, cy, angle }: { cx: number; cy: number; angle: number }) {
  const rad = angle * (Math.PI / 180)
  const d = 30
  const ox = cx + Math.cos(rad) * d
  const oy = cy + Math.sin(rad) * d
  return (
    <ellipse
      cx={ox} cy={oy} rx={11} ry={7}
      transform={`rotate(${angle + 90}, ${ox}, ${oy})`}
      fill="none"
      stroke="rgba(var(--overlay),0.45)"
      strokeWidth={1.5}
      strokeDasharray="3,2"
    />
  )
}

interface Props {
  central:   string
  geometry:  string
  bonds:     number
  lonePairs: number
}

export default function VseprShapeDiagram({ central, geometry, bonds, lonePairs }: Props) {
  const slots = getSlots(geometry, bonds)

  // Lone pair cloud angles: pick the largest angular gaps between bonds
  const bondDeg = slots.map(s => ((Math.atan2(s.y, s.x) * 180 / Math.PI) + 360) % 360).sort((a, b) => a - b)
  const lpAngles: number[] = []
  if (lonePairs > 0 && bondDeg.length > 0) {
    const gaps = bondDeg.map((a, i) => {
      const next = i === bondDeg.length - 1 ? bondDeg[0] + 360 : bondDeg[i + 1]
      return { mid: (a + (next - a) / 2) % 360, size: next - a }
    })
    gaps.sort((a, b) => b.size - a.size)
    gaps.slice(0, lonePairs).forEach(g => lpAngles.push(g.mid))
  }

  const hasWedgeDash = slots.some(s => s.style !== 'solid')

  return (
    <div className="rounded-md border border-border overflow-hidden" style={{ background: 'rgb(var(--color-surface))' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label={`${geometry} geometry diagram`}>

        {/* Lone pair clouds */}
        {lpAngles.map((a, i) => <LonePairCloud key={i} cx={CX} cy={CY} angle={a} />)}

        {/* Bond lines */}
        {slots.map((slot, i) => {
          const dx = slot.x, dy = slot.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          const x1 = CX + (dx / d) * CR
          const y1 = CY + (dy / d) * CR
          const x2 = CX + slot.x - (dx / d) * TR
          const y2 = CY + slot.y - (dy / d) * TR
          return <Bond key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={slot.style} />
        })}

        {/* Terminal atoms */}
        {slots.map((slot, i) => (
          <circle key={i}
            cx={CX + slot.x} cy={CY + slot.y} r={TR}
            fill="rgb(var(--color-muted))"
            stroke="rgb(var(--color-border))" strokeWidth={1}
          />
        ))}

        {/* Central atom */}
        <circle cx={CX} cy={CY} r={CR} fill="color-mix(in srgb, var(--c-halogen) 55%, rgb(var(--color-surface)))" stroke="color-mix(in srgb, var(--c-halogen) 40%, transparent)" strokeWidth={1.5} />
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
          fill="white" fontWeight="700"
          fontSize={central.length > 2 ? 9 : central.length > 1 ? 11 : 13}
          fontFamily="system-ui, sans-serif">
          {central}
        </text>

        {/* Wedge/dash legend */}
        {hasWedgeDash && (
          <text x={W - 6} y={H - 6} textAnchor="end"
            fontSize={7} fill="rgba(var(--overlay),0.25)" fontFamily="system-ui, sans-serif">
            ▶ toward · – – away
          </text>
        )}
      </svg>
    </div>
  )
}

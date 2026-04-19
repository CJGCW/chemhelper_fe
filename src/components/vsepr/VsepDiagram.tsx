import type { LewisStructure } from '../../pages/LewisPage'

// ── Constants ─────────────────────────────────────────────────────────────────

const SVG_W = 320
const SVG_H = 280
const CX = SVG_W / 2
const CY = SVG_H / 2
const BOND_LEN = 88   // px from center to terminal atom center
const CENTER_R = 24
const TERMINAL_R = 20
const H_R = 15

// ── Element colours (shared with Lewis diagram) ───────────────────────────────

const ELEM_COLORS: Record<string, string> = {
  H: '#9ca3af', C: '#4b5563', N: '#4a7ef5', O: '#e05050',
  F: '#5dcc5d', Cl: '#40b840', Br: '#be4040', I: '#9966cc',
  S: '#d4b84a', P: '#e08030', Na: '#9966ff', K: '#8060e0',
  Ca: '#909090', Mg: '#6ab060', Al: '#a09090', Si: '#b09070',
  Fe: '#c07040', B: '#c87050', Xe: '#6080c0',
}

function elemColor(el: string) { return ELEM_COLORS[el] ?? '#60a5fa' }

// ── 3D positions per geometry ─────────────────────────────────────────────────
// Each entry is a terminal atom position {x, y} relative to (0,0) center
// and a bond style. y increases downward in SVG space.

type BondStyle = 'solid' | 'wedge' | 'dash'
type Slot = { x: number; y: number; style: BondStyle }

const LAYOUTS: Record<string, Slot[]> = {
  linear: [
    { x: -BOND_LEN, y: 0,  style: 'solid' },
    { x:  BOND_LEN, y: 0,  style: 'solid' },
  ],
  diatomic: [
    { x: -BOND_LEN, y: 0,  style: 'solid' },
    { x:  BOND_LEN, y: 0,  style: 'solid' },
  ],
  bent: [
    { x: -64, y: -64, style: 'solid' },
    { x:  64, y: -64, style: 'solid' },
  ],
  trigonal_planar: [
    { x:   0, y: -BOND_LEN,        style: 'solid' },
    { x: -76, y:  BOND_LEN * 0.50, style: 'solid' },
    { x:  76, y:  BOND_LEN * 0.50, style: 'solid' },
  ],
  trigonal_pyramidal: [
    { x:   0, y: -82, style: 'solid' },
    { x: -72, y:  50, style: 'wedge' },
    { x:  72, y:  50, style: 'dash'  },
  ],
  tetrahedral: [
    { x:   0, y: -82, style: 'solid' },
    { x: -78, y:   8, style: 'solid' },
    { x:  62, y:  46, style: 'wedge' },
    { x:  18, y:  78, style: 'dash'  },
  ],
  t_shaped: [
    { x:   0, y: -BOND_LEN, style: 'solid' },
    { x:   0, y:  BOND_LEN, style: 'solid' },
    { x: -BOND_LEN, y: 0,   style: 'solid' },
  ],
  see_saw: [
    { x:   0,  y: -BOND_LEN, style: 'solid' },
    { x:   0,  y:  BOND_LEN, style: 'solid' },
    { x: -76,  y:  26,       style: 'solid' },
    { x:  66,  y:  48,       style: 'wedge' },
  ],
  trigonal_bipyramidal: [
    { x:   0, y: -BOND_LEN,        style: 'solid' },  // axial up
    { x:   0, y:  BOND_LEN,        style: 'solid' },  // axial down
    { x: -BOND_LEN, y: 0,          style: 'solid' },  // equatorial left
    { x:  44, y: -76,              style: 'solid' },  // equatorial up-right
    { x:  44, y:  76,              style: 'solid' },  // equatorial down-right
  ],
  square_planar: [
    { x:   0, y: -BOND_LEN, style: 'solid' },
    { x:  BOND_LEN, y: 0,   style: 'solid' },
    { x:   0, y:  BOND_LEN, style: 'solid' },
    { x: -BOND_LEN, y: 0,   style: 'solid' },
  ],
  square_pyramidal: [
    { x:   0, y: -BOND_LEN, style: 'solid' },  // apex (up)
    { x: -58, y:  28,       style: 'wedge' },
    { x:  58, y:  28,       style: 'wedge' },
    { x: -58, y: -24,       style: 'dash'  },
    { x:  58, y: -24,       style: 'dash'  },
  ],
  octahedral: [
    { x:   0, y: -BOND_LEN, style: 'solid' },
    { x:   0, y:  BOND_LEN, style: 'solid' },
    { x: -BOND_LEN, y: 0,   style: 'solid' },
    { x:  BOND_LEN, y: 0,   style: 'solid' },
    { x:  38, y:  38,       style: 'wedge' },
    { x: -38, y: -38,       style: 'dash'  },
  ],
}

function getSlots(geometry: string, atomCount: number): Slot[] {
  const key = geometry.toLowerCase().replace(/-/g, '_')
  const slots = LAYOUTS[key]
  if (slots) return slots.slice(0, atomCount)

  // Fallback: evenly distribute in plane
  return Array.from({ length: atomCount }, (_, i) => {
    const rad = (-Math.PI / 2) + (2 * Math.PI * i) / atomCount
    return { x: Math.cos(rad) * BOND_LEN, y: Math.sin(rad) * BOND_LEN, style: 'solid' as const }
  })
}

// ── Wedge bond path ───────────────────────────────────────────────────────────

function WedgeBond({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len, py = dx / len
  const w = 5  // half-width at terminal end
  const d = `M ${x1} ${y1} L ${x2 + px * w} ${y2 + py * w} L ${x2 - px * w} ${y2 - py * w} Z`
  return <path d={d} fill="rgba(var(--overlay),0.85)" />
}

function DashBond({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(var(--overlay),0.82)"
      strokeWidth={2.5}
      strokeDasharray="5,4"
    />
  )
}

// ── Lone pair clouds on center ────────────────────────────────────────────────

function LonePairCloud({ cx, cy, angle }: { cx: number; cy: number; angle: number }) {
  const rad = angle * (Math.PI / 180)
  const dist = 38
  const ox = cx + Math.cos(rad) * dist
  const oy = cy + Math.sin(rad) * dist
  return (
    <g opacity={0.45}>
      <ellipse
        cx={ox} cy={oy}
        rx={13} ry={8}
        transform={`rotate(${angle + 90}, ${ox}, ${oy})`}
        fill="none"
        stroke="rgba(var(--overlay),0.6)"
        strokeWidth={1.5}
        strokeDasharray="3,2"
      />
    </g>
  )
}

// ── Bond order lines ──────────────────────────────────────────────────────────

function BondLines({
  x1, y1, x2, y2, order, style,
}: {
  x1: number; y1: number; x2: number; y2: number
  order: number; style: BondStyle
}) {
  if (style === 'wedge') return <WedgeBond x1={x1} y1={y1} x2={x2} y2={y2} />
  if (style === 'dash')  return <DashBond  x1={x1} y1={y1} x2={x2} y2={y2} />

  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len, py = dx / len
  const stroke = 'rgba(var(--overlay),0.82)'
  const sw = 2

  if (order === 2) {
    const o = 4
    return (
      <g>
        <line x1={x1 + px*o} y1={y1 + py*o} x2={x2 + px*o} y2={y2 + py*o} stroke={stroke} strokeWidth={sw} />
        <line x1={x1 - px*o} y1={y1 - py*o} x2={x2 - px*o} y2={y2 - py*o} stroke={stroke} strokeWidth={sw} />
      </g>
    )
  }
  if (order === 3) {
    const o = 5
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={sw} />
        <line x1={x1 + px*o} y1={y1 + py*o} x2={x2 + px*o} y2={y2 + py*o} stroke={stroke} strokeWidth={sw} />
        <line x1={x1 - px*o} y1={y1 - py*o} x2={x2 - px*o} y2={y2 - py*o} stroke={stroke} strokeWidth={sw} />
      </g>
    )
  }
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={sw} />
}

// ── Atom circle ───────────────────────────────────────────────────────────────

function AtomCircle({ x, y, element, r }: { x: number; y: number; element: string; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={elemColor(element)} stroke="rgb(var(--color-border))" strokeWidth={1.5} />
      <text
        x={x} y={y}
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontWeight="700"
        fontSize={element.length > 1 ? 11 : r < 18 ? 11 : 13}
        fontFamily="system-ui, sans-serif"
      >
        {element}
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VsepDiagram({ structure }: { structure: LewisStructure }) {
  if (structure.atoms.length === 0) return null

  // Build adjacency to find center and terminals
  const adj: Record<string, string[]> = {}
  structure.atoms.forEach(a => { adj[a.id] = [] })
  structure.bonds.forEach(b => {
    adj[b.from].push(b.to)
    adj[b.to].push(b.from)
  })

  // Central atom = most bonds; prefer non-H on ties
  const center = structure.atoms.length === 1
    ? structure.atoms[0]
    : structure.atoms.reduce((best, a) => {
        const bc = adj[a.id].length, bb = adj[best.id].length
        if (bc > bb) return a
        if (bc === bb && best.element === 'H' && a.element !== 'H') return a
        return best
      })

  const terminals = (adj[center.id] ?? [])
    .map(id => structure.atoms.find(a => a.id === id)!)
    .filter(Boolean)

  const bondMap: Record<string, number> = {}
  structure.bonds.forEach(b => {
    const key = [b.from, b.to].sort().join('-')
    bondMap[key] = b.order
  })

  const slots = getSlots(structure.geometry, terminals.length)

  // Lone pair angles on center: pick gaps between bond slots
  const centerAtom = structure.atoms.find(a => a.id === center.id)!
  const lonePairs = centerAtom?.lone_pairs ?? 0
  const bondAngles = slots.map(s => Math.atan2(s.y, s.x) * 180 / Math.PI)

  const lpAngles: number[] = []
  if (lonePairs > 0) {
    const sorted = [...bondAngles].map(a => ((a % 360) + 360) % 360).sort((a, b) => a - b)
    const gaps: { mid: number; size: number }[] = sorted.map((a, i) => {
      const next = i === sorted.length - 1 ? sorted[0] + 360 : sorted[i + 1]
      const size = next - a
      return { mid: (a + size / 2) % 360, size }
    })
    if (gaps.length === 0) {
      for (let i = 0; i < lonePairs; i++) lpAngles.push(i * (360 / lonePairs))
    } else {
      gaps.sort((a, b) => b.size - a.size)
      gaps.slice(0, lonePairs).forEach(g => lpAngles.push(g.mid))
    }
  }

  // If only 1 atom total (monoatomic)
  if (terminals.length === 0) {
    return (
      <div className="rounded-md border border-border overflow-hidden" style={{ background: 'rgb(var(--color-surface))' }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%">
          <AtomCircle x={CX} y={CY} element={center.element} r={CENTER_R} />
        </svg>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border overflow-hidden" style={{ background: 'rgb(var(--color-surface))' }}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" aria-label={`VSEPR model of ${structure.name}`}>

        {/* Lone pair clouds drawn behind everything */}
        {lpAngles.map((angle, i) => (
          <LonePairCloud key={i} cx={CX} cy={CY} angle={angle} />
        ))}

        {/* Bond lines — drawn before atoms so atoms sit on top */}
        {slots.map((slot, i) => {
          const term = terminals[i]
          if (!term) return null
          const key = [center.id, term.id].sort().join('-')
          const order = bondMap[key] ?? 1
          const tx = CX + slot.x
          const ty = CY + slot.y
          // Shorten line to atom edges
          const dx = slot.x, dy = slot.y
          const d = Math.sqrt(dx * dx + dy * dy) || 1
          const termR = term.element === 'H' ? H_R : TERMINAL_R
          const x1 = CX + (dx / d) * CENTER_R
          const y1 = CY + (dy / d) * CENTER_R
          const x2 = tx - (dx / d) * termR
          const y2 = ty - (dy / d) * termR
          return (
            <BondLines key={i} x1={x1} y1={y1} x2={x2} y2={y2} order={order} style={slot.style} />
          )
        })}

        {/* Terminal atoms */}
        {slots.map((slot, i) => {
          const term = terminals[i]
          if (!term) return null
          const r = term.element === 'H' ? H_R : TERMINAL_R
          return <AtomCircle key={i} x={CX + slot.x} y={CY + slot.y} element={term.element} r={r} />
        })}

        {/* Center atom on top */}
        <AtomCircle x={CX} y={CY} element={center.element} r={CENTER_R} />

        {/* Bond-style legend (wedge/dash) */}
        {slots.some(s => s.style !== 'solid') && (
          <g transform={`translate(${SVG_W - 8}, ${SVG_H - 8})`}>
            <text x={0} y={0} textAnchor="end"
              fontSize={8} fill="rgba(var(--overlay),0.25)" fontFamily="system-ui, sans-serif">
              ▶ toward · – – away
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

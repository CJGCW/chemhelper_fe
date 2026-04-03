import type { LewisStructure } from '../../pages/LewisPage'

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W = 500
const SVG_H = 340
const BOND_LEN = 82
const ATOM_R = 21
const H_ATOM_R = 16
const LP_OFFSET = 35
const LP_R = 3.5
const LP_DOT_SEP = 5.5

// ── Element colours (dark-theme CPK) ─────────────────────────────────────────

const ELEM_COLORS: Record<string, string> = {
  H:  '#9ca3af',
  C:  '#4b5563',
  N:  '#4a7ef5',
  O:  '#e05050',
  F:  '#5dcc5d',
  Cl: '#40b840',
  Br: '#be4040',
  I:  '#9966cc',
  S:  '#d4b84a',
  P:  '#e08030',
  Na: '#9966ff',
  K:  '#8060e0',
  Li: '#cc88ff',
  Ca: '#909090',
  Mg: '#6ab060',
  Al: '#a09090',
  Si: '#b09070',
  Fe: '#c07040',
  Cu: '#c88050',
  Zn: '#7080b0',
  B:  '#c87050',
  Xe: '#6080c0',
  Kr: '#5570b0',
  Ar: '#4060a0',
  Ne: '#3050a0',
  He: '#2040a0',
}

function getColor(element: string): string {
  return ELEM_COLORS[element] ?? '#60a5fa'
}

// ── Angle helpers ─────────────────────────────────────────────────────────────

function getTerminalAngles(geometry: string, n: number): number[] {
  if (n === 0) return []
  if (n === 1) return [0]

  const g = geometry.toLowerCase().replace(/-/g, '_')

  switch (g) {
    case 'linear':
    case 'diatomic':
      if (n === 2) return [180, 0]
      break
    case 'bent':
      if (n === 2) return [-135, -45]
      break
    case 'trigonal_planar':
    case 'trigonal_pyramidal':
      if (n === 3) return [-90, 30, 150]
      break
    case 'tetrahedral':
    case 'see_saw':
    case 'seesaw':
      if (n === 4) return [-90, 0, 180, 90]
      if (n === 3) return [-90, 30, 150]
      break
    case 'square_planar':
      if (n === 4) return [-90, 0, 90, 180]
      break
    case 't_shaped':
      if (n === 3) return [-90, 0, 180]
      break
    case 'trigonal_bipyramidal':
      if (n === 5) return [-90, 90, 30, 150, 0]
      break
    case 'octahedral':
    case 'square_pyramidal':
      if (n === 6) return [-90, 0, 90, 180, 45, 225]
      if (n === 5) return [-90, 0, 90, 180, 45]
      break
  }

  // Fallback: evenly distribute starting from top
  return Array.from({ length: n }, (_, i) => -90 + (360 * i) / n)
}

function getLonePairAngles(bondAngles: number[], count: number): number[] {
  if (count === 0) return []

  if (bondAngles.length === 0) {
    return Array.from({ length: count }, (_, i) => (360 * i) / count)
  }

  const sorted = [...bondAngles].map(a => ((a % 360) + 360) % 360).sort((a, b) => a - b)

  const gaps: { mid: number; size: number }[] = []
  for (let i = 0; i < sorted.length; i++) {
    const a1 = sorted[i]
    const a2 = i === sorted.length - 1 ? sorted[0] + 360 : sorted[i + 1]
    const size = a2 - a1
    gaps.push({ mid: a1 + size / 2, size })
  }

  gaps.sort((a, b) => b.size - a.size)
  return gaps.slice(0, count).map(g => g.mid % 360)
}

// ── Layout ────────────────────────────────────────────────────────────────────

function computeLayout(
  atoms: LewisStructure['atoms'],
  bonds: LewisStructure['bonds'],
  geometry: string,
): Record<string, { x: number; y: number }> {
  if (atoms.length === 0) return {}

  const cx = SVG_W / 2
  const cy = SVG_H / 2
  const positions: Record<string, { x: number; y: number }> = {}

  if (atoms.length === 1) {
    positions[atoms[0].id] = { x: cx, y: cy }
    return positions
  }

  // Build adjacency
  const adj: Record<string, string[]> = {}
  atoms.forEach(a => { adj[a.id] = [] })
  bonds.forEach(b => {
    adj[b.from].push(b.to)
    adj[b.to].push(b.from)
  })

  // No bonds (ionic compound): lay atoms out in a row
  if (bonds.length === 0) {
    const spacing = BOND_LEN * 1.5
    const totalW = (atoms.length - 1) * spacing
    atoms.forEach((a, i) => {
      positions[a.id] = { x: cx - totalW / 2 + i * spacing, y: cy }
    })
    return positions
  }

  // Central atom = most connections; break ties by preferring non-H
  const central = atoms.reduce((best, a) => {
    const bc = adj[a.id].length
    const bb = adj[best.id].length
    if (bc > bb) return a
    if (bc === bb && best.element === 'H' && a.element !== 'H') return a
    return best
  })

  positions[central.id] = { x: cx, y: cy }

  const directNeighbors = adj[central.id]
  const angles = getTerminalAngles(geometry, directNeighbors.length)

  directNeighbors.forEach((tid, i) => {
    const deg = angles[i] ?? (-90 + (360 * i) / directNeighbors.length)
    const rad = deg * (Math.PI / 180)
    positions[tid] = {
      x: cx + Math.cos(rad) * BOND_LEN,
      y: cy + Math.sin(rad) * BOND_LEN,
    }
  })

  // 2nd-shell atoms (chain molecules)
  atoms.forEach(a => {
    if (positions[a.id]) return
    const positionedNeighbor = adj[a.id].find(nid => positions[nid])
    if (!positionedNeighbor) return
    const npos = positions[positionedNeighbor]
    const dx = npos.x - cx
    const dy = npos.y - cy
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    positions[a.id] = {
      x: npos.x + (dx / len) * BOND_LEN,
      y: npos.y + (dy / len) * BOND_LEN,
    }
  })

  return positions
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BondLines({
  bond,
  positions,
}: {
  bond: LewisStructure['bonds'][0]
  positions: Record<string, { x: number; y: number }>
}) {
  const p1 = positions[bond.from]
  const p2 = positions[bond.to]
  if (!p1 || !p2) return null

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy
  const py = ux

  const fromR = ATOM_R
  const toR = ATOM_R
  const x1 = p1.x + ux * fromR
  const y1 = p1.y + uy * fromR
  const x2 = p2.x - ux * toR
  const y2 = p2.y - uy * toR

  const strokeColor = 'rgba(255,255,255,0.82)'
  const strokeW = 2

  if (bond.order === 2) {
    const o = 4
    return (
      <g>
        <line x1={x1 + px * o} y1={y1 + py * o} x2={x2 + px * o} y2={y2 + py * o} stroke={strokeColor} strokeWidth={strokeW} />
        <line x1={x1 - px * o} y1={y1 - py * o} x2={x2 - px * o} y2={y2 - py * o} stroke={strokeColor} strokeWidth={strokeW} />
      </g>
    )
  }

  if (bond.order === 3) {
    const o = 5
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeW} />
        <line x1={x1 + px * o} y1={y1 + py * o} x2={x2 + px * o} y2={y2 + py * o} stroke={strokeColor} strokeWidth={strokeW} />
        <line x1={x1 - px * o} y1={y1 - py * o} x2={x2 - px * o} y2={y2 - py * o} stroke={strokeColor} strokeWidth={strokeW} />
      </g>
    )
  }

  // Single bond (order 1 or fallback)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeW} />
}

function AtomNode({
  atom,
  pos,
  adj,
  positions,
}: {
  atom: LewisStructure['atoms'][0]
  pos: { x: number; y: number }
  adj: Record<string, string[]>
  positions: Record<string, { x: number; y: number }>
}) {
  const color = getColor(atom.element)
  const r = atom.element === 'H' ? H_ATOM_R : ATOM_R

  const bondAngles = (adj[atom.id] ?? [])
    .map(nid => {
      const npos = positions[nid]
      if (!npos) return 0
      return Math.atan2(npos.y - pos.y, npos.x - pos.x) * (180 / Math.PI)
    })

  const lpAngles = getLonePairAngles(bondAngles, atom.lone_pairs)

  const chargeLabel =
    atom.formal_charge === 0
      ? null
      : atom.formal_charge === 1
        ? '+'
        : atom.formal_charge === -1
          ? '−'
          : atom.formal_charge > 0
            ? `+${atom.formal_charge}`
            : `${atom.formal_charge}`

  return (
    <g>
      {/* Lone pairs */}
      {lpAngles.map((angle, i) => {
        const rad = angle * (Math.PI / 180)
        const lpCx = pos.x + Math.cos(rad) * LP_OFFSET
        const lpCy = pos.y + Math.sin(rad) * LP_OFFSET
        const perpRad = rad + Math.PI / 2
        const dx = Math.cos(perpRad) * LP_DOT_SEP
        const dy = Math.sin(perpRad) * LP_DOT_SEP
        return (
          <g key={i}>
            <circle cx={lpCx + dx} cy={lpCy + dy} r={LP_R} fill="rgba(255,255,255,0.85)" />
            <circle cx={lpCx - dx} cy={lpCy - dy} r={LP_R} fill="rgba(255,255,255,0.85)" />
          </g>
        )
      })}

      {/* Atom circle */}
      <circle cx={pos.x} cy={pos.y} r={r} fill={color} stroke="#1c1f2e" strokeWidth="1.5" />

      {/* Element symbol */}
      <text
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={atom.element.length > 1 ? 11 : r === H_ATOM_R ? 11 : 13}
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {atom.element}
      </text>

      {/* Formal charge */}
      {chargeLabel && (
        <text
          x={pos.x + r}
          y={pos.y - r + 1}
          textAnchor="start"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {chargeLabel}
        </text>
      )}
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LewisStructureDiagram({ structure }: { structure: LewisStructure }) {
  const positions = computeLayout(structure.atoms, structure.bonds, structure.geometry)

  const adj: Record<string, string[]> = {}
  structure.atoms.forEach(a => { adj[a.id] = [] })
  structure.bonds.forEach(b => {
    adj[b.from].push(b.to)
    adj[b.to].push(b.from)
  })

  return (
    <div
      className="rounded-md border border-border overflow-hidden"
      style={{ background: '#0e1016' }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        aria-label={`Lewis structure of ${structure.name}`}
      >
        {/* Bond lines drawn first so atoms render on top */}
        {structure.bonds.map((bond, i) => (
          <BondLines key={i} bond={bond} positions={positions} />
        ))}

        {/* Atoms + lone pairs */}
        {structure.atoms.map(atom => {
          const pos = positions[atom.id]
          if (!pos) return null
          return (
            <AtomNode
              key={atom.id}
              atom={atom}
              pos={pos}
              adj={adj}
              positions={positions}
            />
          )
        })}
      </svg>
    </div>
  )
}

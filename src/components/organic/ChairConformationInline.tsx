import {
  CARBONS, CARBONS_FLIPPED,
  BACK_BOND_INDICES, BACK_BOND_INDICES_FLIPPED,
  axialDir, equatorialDir,
  BOND_LEN, AX_LEN, RING_CX, RING_CY,
} from './chairGeometry'

export interface ChairPosition {
  ringC: 1 | 2 | 3 | 4 | 5 | 6
  bond: 'axial' | 'equatorial'
  substituent: string
}

export interface ChairConformationInlineProps {
  positions: ChairPosition[]
  /** If true, geometry is rendered as the ring-flipped chair. */
  flipped?: boolean
  width?: number
  height?: number
}

// Maps atom index 0-5 (C1-C6) to the geometric slot it occupies.
function slotForAtom(atomIndex: number, flipped: boolean): number {
  return flipped ? (atomIndex + 5) % 6 : atomIndex
}

export default function ChairConformationInline({
  positions,
  flipped = false,
  width = 280,
  height = 220,
}: ChairConformationInlineProps) {
  const activeCarbons   = flipped ? CARBONS_FLIPPED : CARBONS
  const activeBackBonds = flipped ? BACK_BOND_INDICES_FLIPPED : BACK_BOND_INDICES

  // Build lookup: atom index 0-5 → { sub, originalAxial }
  const subMap = new Map<number, { sub: string; originalAxial: boolean }>()
  for (const p of positions) {
    subMap.set(p.ringC - 1, { sub: p.substituent, originalAxial: p.bond === 'axial' })
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 260"
      preserveAspectRatio="xMidYMid meet"
      className="block border border-border rounded-sm"
      style={{ background: 'rgb(var(--color-surface))' }}
    >
      {/* Ring bonds — back bonds fainter for depth */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const a = activeCarbons[i], b = activeCarbons[(i + 1) % 6]
        const isBack = activeBackBonds.has(i)
        return (
          <line key={i}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={isBack ? 'rgba(var(--overlay),0.65)' : 'rgba(var(--overlay),0.75)'}
            strokeWidth={isBack ? 2 : 2.5} strokeLinecap="round"
          />
        )
      })}

      {/* Carbon position labels — each label follows its atom to the current slot */}
      {[0, 1, 2, 3, 4, 5].map(atomIndex => {
        const slot = slotForAtom(atomIndex, flipped)
        const c = activeCarbons[slot]
        const dx = c.x - RING_CX
        const dy = c.y - RING_CY
        const len = Math.hypot(dx, dy)
        const offX = (dx / len) * 14
        const offY = (dy / len) * 14
        return (
          <text key={`label-${atomIndex}`}
            x={c.x + offX} y={c.y + offY + 3}
            textAnchor="middle" fontSize={10} fontFamily="monospace"
            fill="rgba(var(--overlay),0.55)"
          >C{atomIndex + 1}</text>
        )
      })}

      {/* Substituent bonds and labels */}
      {[0, 1, 2, 3, 4, 5].map(atomIndex => {
        const entry = subMap.get(atomIndex)
        if (!entry) return null

        const slot = slotForAtom(atomIndex, flipped)
        const c = activeCarbons[slot]
        // flipped is an external prop — XOR to swap axial↔equatorial
        const isCurrentlyAxial = entry.originalAxial !== flipped
        const dir = isCurrentlyAxial ? axialDir(slot, flipped) : equatorialDir(slot, flipped)
        const len = isCurrentlyAxial ? AX_LEN : BOND_LEN
        const tipX = c.x + dir.dx * len
        const tipY = c.y + dir.dy * len

        return (
          <g key={atomIndex}>
            <line
              x1={c.x} y1={c.y} x2={tipX} y2={tipY}
              stroke="rgba(var(--overlay),0.65)" strokeWidth={2.5}
              strokeDasharray={isCurrentlyAxial ? undefined : '4 2'}
            />
            <text
              x={tipX + dir.dx * 12} y={tipY + dir.dy * 12 + 4}
              textAnchor="middle" fontSize={11} fontFamily="monospace"
              fill="var(--c-halogen)"
            >{entry.sub}</text>
          </g>
        )
      })}
    </svg>
  )
}

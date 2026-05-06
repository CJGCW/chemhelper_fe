import { CARBONS, BACK_BOND_INDICES, axialDir, equatorialDir, BOND_LEN, AX_LEN } from './chairGeometry'

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

export default function ChairConformationInline({
  positions,
  flipped = false,
  width = 280,
  height = 220,
}: ChairConformationInlineProps) {
  // Build lookup: ring index 0-5 → { sub, originalAxial }
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
      {/* Ring bonds — back bonds slightly fainter for depth */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const a = CARBONS[i], b = CARBONS[(i + 1) % 6]
        const isBack = BACK_BOND_INDICES.has(i)
        return (
          <line key={i}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={isBack ? 'rgba(var(--overlay),0.40)' : 'rgba(var(--overlay),0.75)'}
            strokeWidth={isBack ? 2 : 2.5} strokeLinecap="round"
          />
        )
      })}

      {/* Carbon position labels */}
      {CARBONS.map((c, i) => (
        <text key={i}
          x={c.x} y={c.y + 3}
          textAnchor="middle" fontSize={9} fontFamily="monospace"
          fill="rgba(var(--overlay),0.4)"
        >C{i + 1}</text>
      ))}

      {/* Substituent bonds and labels */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const entry = subMap.get(i)
        if (!entry) return null

        const c = CARBONS[i]
        // After a ring flip, axial↔equatorial
        const isCurrentlyAxial = entry.originalAxial !== flipped
        const dir = isCurrentlyAxial ? axialDir(i, flipped) : equatorialDir(i, flipped)
        const len = isCurrentlyAxial ? AX_LEN : BOND_LEN
        const tipX = c.x + dir.dx * len
        const tipY = c.y + dir.dy * len

        return (
          <g key={i}>
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

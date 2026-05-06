// Static Newman projection renderer — no slider, no energy diagram.
// Reuses the same bearing math as NewmanProjectionViewer.

// Geometry constants (in viewBox "0 0 300 185" coordinates)
const CX = 150, CY = 82
const CIRCLE_R = 40
const FRONT_BL = 54    // front bond length from center
const BACK_BL = 40     // back bond length from circle edge
const LABEL_EXTRA = 14 // label offset beyond bond end
const FRONT_ANGLES = [0, 120, 240]  // 0=up, clockwise

function toXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) }
}

export interface NewmanProjectionInlineProps {
  /** Substituents at 12/4/8 o'clock on the front carbon */
  front: [string, string, string]
  /** Substituents at 12/4/8 o'clock on the back carbon (rotated by dihedral) */
  back: [string, string, string]
  /** Dihedral angle φ in degrees. 0 = eclipsed, 60 = gauche, 180 = anti. */
  dihedral: number
  width?: number
  height?: number
}

export default function NewmanProjectionInline({
  front,
  back,
  dihedral,
  width = 220,
  height = 136,
}: NewmanProjectionInlineProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 185"
      preserveAspectRatio="xMidYMid meet"
      className="block border border-border rounded-sm"
      style={{ background: 'rgb(var(--color-surface))' }}
    >
      {/* Back bonds (drawn before circle so circle covers their inner ends) */}
      {back.map((lbl, i) => {
        const angle = FRONT_ANGLES[i] + dihedral
        const start = toXY(angle, CIRCLE_R + 5)
        const end   = toXY(angle, CIRCLE_R + BACK_BL)
        const tip   = toXY(angle, CIRCLE_R + BACK_BL + LABEL_EXTRA)
        return (
          <g key={i}>
            <line
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="rgba(var(--overlay),0.55)" strokeWidth={2.5} strokeLinecap="round"
            />
            <text
              x={tip.x} y={tip.y + 4}
              textAnchor="middle" fontSize={11} fontFamily="monospace"
              fill="rgba(var(--overlay),0.7)"
            >{lbl}</text>
          </g>
        )
      })}

      {/* Back carbon circle — white fill covers inner back bond segments */}
      <circle
        cx={CX} cy={CY} r={CIRCLE_R}
        stroke="rgba(var(--overlay),0.5)" strokeWidth={2}
        fill="rgb(var(--color-surface))"
      />

      {/* Front bonds */}
      {front.map((lbl, i) => {
        const end = toXY(FRONT_ANGLES[i], FRONT_BL)
        const tip = toXY(FRONT_ANGLES[i], FRONT_BL + LABEL_EXTRA)
        return (
          <g key={i}>
            <line
              x1={CX} y1={CY} x2={end.x} y2={end.y}
              stroke="rgba(var(--overlay),0.7)" strokeWidth={2.5} strokeLinecap="round"
            />
            <text
              x={tip.x} y={tip.y + 4}
              textAnchor="middle" fontSize={11} fontFamily="monospace"
              fill="rgba(var(--overlay),0.9)"
            >{lbl}</text>
          </g>
        )
      })}

      {/* Front carbon dot */}
      <circle cx={CX} cy={CY} r={5} fill="rgba(var(--overlay),0.9)" />

      {/* Dihedral label */}
      <text
        x={CX} y={175}
        textAnchor="middle" fontSize={11} fontFamily="sans-serif" fontWeight={600}
        fill="var(--c-halogen)"
      >φ = {dihedral}°</text>
    </svg>
  )
}

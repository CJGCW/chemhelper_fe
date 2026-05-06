import { useState } from 'react'

const SVG_W = 360, SVG_H = 200

// Boat: C1 and C4 are flagpole carbons (both raised), C2/C3 and C5/C6 are sides.
const CARBONS_BOAT = [
  { x: 80,  y: 75  }, // C1 — flagpole, raised
  { x: 130, y: 105 }, // C2 — side
  { x: 220, y: 105 }, // C3 — side
  { x: 270, y: 75  }, // C4 — flagpole, raised
  { x: 220, y: 135 }, // C5 — bottom
  { x: 130, y: 135 }, // C6 — bottom
]

interface Props {
  showLabels?: boolean
}

export default function BoatConformationViewer({ showLabels = true }: Props) {
  const [twist, setTwist] = useState(false)

  // Twist-boat: offset C2 and C5 slightly to relieve flagpole interaction
  const carbons = twist
    ? CARBONS_BOAT.map((c, i) => i === 1 ? { ...c, y: c.y + 8 } : i === 4 ? { ...c, y: c.y - 8 } : c)
    : CARBONS_BOAT

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={SVG_W} height={SVG_H} className="block border border-border rounded-sm"
           style={{ background: 'rgb(var(--color-surface))' }}>
        {/* Ring bonds */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const a = carbons[i], b = carbons[(i + 1) % 6]
          return (
            <line key={`ring-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="rgba(var(--overlay), 0.65)" strokeWidth={2.5} strokeLinecap="round" />
          )
        })}

        {/* Carbon labels */}
        {showLabels && carbons.map((c, i) => (
          <text key={`label-${i}`} x={c.x} y={c.y + 4} textAnchor="middle" fontSize={11}
            fill="rgba(var(--overlay), 0.5)" fontFamily="monospace">
            C{i + 1}
          </text>
        ))}

        {/* Flagpole H atoms on C1 and C4 in boat mode */}
        {!twist && (
          <>
            <line x1={carbons[0].x} y1={carbons[0].y} x2={carbons[0].x} y2={carbons[0].y - 25}
              stroke="var(--c-halogen)" strokeWidth={2} />
            <text x={carbons[0].x} y={carbons[0].y - 32} textAnchor="middle" fontSize={11}
              fill="var(--c-halogen)" fontFamily="monospace">H</text>

            <line x1={carbons[3].x} y1={carbons[3].y} x2={carbons[3].x} y2={carbons[3].y - 25}
              stroke="var(--c-halogen)" strokeWidth={2} />
            <text x={carbons[3].x} y={carbons[3].y - 32} textAnchor="middle" fontSize={11}
              fill="var(--c-halogen)" fontFamily="monospace">H</text>

            {/* Dotted line between the two flagpole H's to show interaction */}
            <line x1={carbons[0].x} y1={carbons[0].y - 28} x2={carbons[3].x} y2={carbons[3].y - 28}
              stroke="var(--c-halogen)" strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
            <text x={(carbons[0].x + carbons[3].x) / 2} y={carbons[0].y - 38}
              textAnchor="middle" fontSize={10} fill="var(--c-halogen)" fontFamily="monospace">
              flagpole strain
            </text>
          </>
        )}

        {/* Mode label */}
        <text x={SVG_W / 2} y={SVG_H - 12} textAnchor="middle" fontSize={12}
          fill="var(--c-halogen)" fontFamily="sans-serif" fontWeight={600}>
          {twist ? 'Twist-Boat' : 'Boat'}
        </text>
      </svg>

      <button
        onClick={() => setTwist(t => !t)}
        className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
          color: 'var(--c-halogen)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
        }}>
        Show {twist ? 'Boat' : 'Twist-Boat'}
      </button>

      <p className="font-sans text-xs text-secondary text-center max-w-md">
        {twist
          ? 'Twist-boat conformation: ~5 kJ/mol above chair. The slight twist relieves flagpole interaction. This is a real local minimum on the energy surface.'
          : 'Boat conformation: ~29 kJ/mol above chair. The two flagpole hydrogens at C1 and C4 are eclipsed (dotted line shows the steric clash). This is a transition state, not a stable form.'
        }
      </p>
    </div>
  )
}

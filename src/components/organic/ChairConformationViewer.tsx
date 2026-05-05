import { useState } from 'react'
import { motion } from 'framer-motion'

// A-values (equatorial preference) in kJ/mol
const A_VALUES: Record<string, number> = {
  'H': 0, 'F': 0.4, 'OH': 2.1, 'Cl': 2.0, 'Br': 2.2,
  'CH₃': 7.6, 'Et': 7.5, 'iPr': 9.4, 'tBu': 22.8,
  'Ph': 12.4, 'COOH': 5.9,
}

const SUBSTITUENTS = Object.keys(A_VALUES)

// Chair SVG geometry for a 6-membered ring
// 6 carbons at positions 0-5; two styles: normal and flipped
// Positions 0,2,4 have axial-up, equatorial-down; 1,3,5 have axial-down, equatorial-up
// After flip: axial↔equatorial

const SVG_W = 360, SVG_H = 180
// Chair carbon positions (approximate)
const CARBONS = [
  { x: 60,  y: 95  }, // C1
  { x: 120, y: 65  }, // C2
  { x: 200, y: 65  }, // C3
  { x: 260, y: 95  }, // C4
  { x: 200, y: 125 }, // C5
  { x: 120, y: 125 }, // C6
]

// Axial bond directions (dx, dy) for each carbon in normal chair
// Even carbons (0,2,4): axial goes up; odd (1,3,5): axial goes down
function axialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  const up = (i % 2 === 0) !== flipped
  return { dx: 0, dy: up ? -1 : 1 }
}

// Equatorial bond directions — approximate 30° from horizontal
function equatorialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  const up = (i % 2 === 0) !== flipped
  const vert = up ? 0.5 : -0.5
  const horiz = i < 3 ? 1 : -1
  const len = Math.sqrt(horiz * horiz + vert * vert)
  return { dx: horiz / len, dy: vert / len }
}

interface Props { showLabels?: boolean }

export default function ChairConformationViewer({ showLabels = true }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [subs, setSubs] = useState<string[]>(['H', 'H', 'H', 'H', 'H', 'H'])
  const [selected, setSelected] = useState<number | null>(null)
  const [placeSub, setPlaceSub] = useState('CH₃')
  const [placeAxial, setPlaceAxial] = useState(true)

  function totalStrain(): number {
    return subs.reduce((sum) => sum, 0)
  }
  void totalStrain

  // Track what each position holds: { sub, isAxial }
  const [positions, setPositions] = useState<{ sub: string; axial: boolean }[]>(
    Array.from({ length: 6 }, () => ({ sub: 'H', axial: true }))
  )

  function placeAt(i: number) {
    if (selected === null) return
    const newPos = [...positions]
    newPos[i] = { sub: placeSub, axial: placeAxial }
    setPositions(newPos)
    setSelected(null)
  }
  void subs; void setSubs; void placeAt; void selected; void setSelected; void placeAxial

  // Compute axial strain contribution
  const totalAxialStrain = positions.reduce((sum, p) => {
    const isCurrentlyAxial = p.axial !== flipped
    return sum + (isCurrentlyAxial ? (A_VALUES[p.sub] ?? 0) : 0)
  }, 0)

  const BOND_LEN = 32
  const AX_LEN = 28

  function renderPosition(i: number) {
    const c = CARBONS[i]
    const ad = axialDir(i, flipped)
    const ed = equatorialDir(i, flipped)
    const p = positions[i]
    const isCurrentlyAxial = p.axial !== flipped

    const bDir = isCurrentlyAxial ? ad : ed
    const len = isCurrentlyAxial ? AX_LEN : BOND_LEN
    const tipX = c.x + bDir.dx * len
    const tipY = c.y + bDir.dy * len

    const aValue = A_VALUES[p.sub] ?? 0
    const isStrained = isCurrentlyAxial && aValue > 0

    return (
      <g key={i}>
        <line x1={c.x} y1={c.y} x2={tipX} y2={tipY}
          stroke={isStrained ? 'rgb(var(--c-halogen,60 160 240)/0.9)' : 'rgb(var(--overlay)/0.55)'}
          strokeWidth={isCurrentlyAxial ? 2.5 : 2} strokeDasharray={isCurrentlyAxial ? undefined : '4 2'} />
        {p.sub !== 'H' && (
          <text x={tipX + bDir.dx * 10} y={tipY + bDir.dy * 10 + 4}
            textAnchor="middle" fontSize={10} fontFamily="monospace"
            fill={isStrained ? 'var(--c-halogen)' : 'rgb(var(--overlay)/0.8)'}>
            {p.sub}
          </text>
        )}
        {showLabels && p.sub === 'H' && (
          <text x={tipX + bDir.dx * 8} y={tipY + bDir.dy * 8 + 3}
            textAnchor="middle" fontSize={8} fontFamily="monospace" fill="rgb(var(--overlay)/0.35)">
            {isCurrentlyAxial ? 'ax' : 'eq'}
          </text>
        )}
      </g>
    )
  }

  // Draw chair backbone
  const backbone = [0, 1, 2, 3, 4, 5, 0].map(i => CARBONS[i])
  const d = backbone.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <div className="flex flex-col gap-3">
      <svg width={SVG_W} height={SVG_H} className="block mx-auto border border-border rounded-sm" style={{ background: 'rgb(var(--color-surface))' }}>
        {/* Chair backbone */}
        <path d={d} fill="none" stroke="rgb(var(--overlay)/0.65)" strokeWidth={2.5} strokeLinejoin="round" />
        {/* Carbon labels */}
        {CARBONS.map((c, i) => (
          <text key={i} x={c.x} y={c.y + 3} textAnchor="middle" fontSize={9} fontFamily="monospace"
            fill="rgb(var(--overlay)/0.4)">C{i + 1}</text>
        ))}
        {/* Substituent bonds */}
        {positions.map((_, i) => renderPosition(i))}
        {/* Axial/equatorial key */}
        {showLabels && (
          <>
            <text x={8} y={16} fontSize={9} fill="rgb(var(--overlay)/0.5)" fontFamily="monospace">— axial</text>
            <text x={8} y={30} fontSize={9} fill="rgb(var(--overlay)/0.5)" fontFamily="monospace">- - equatorial</text>
          </>
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
        <span className="text-secondary">Place:</span>
        <select value={placeSub} onChange={e => setPlaceSub(e.target.value)}
          className="border border-border rounded-sm px-2 py-1 bg-surface text-primary font-mono text-xs">
          {SUBSTITUENTS.filter(s => s !== 'H').map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={placeAxial ? 'axial' : 'equatorial'} onChange={e => setPlaceAxial(e.target.value === 'axial')}
          className="border border-border rounded-sm px-2 py-1 bg-surface text-primary font-mono text-xs">
          <option value="axial">axial</option>
          <option value="equatorial">equatorial</option>
        </select>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <button key={n} onClick={() => {
            const newPos = [...positions]
            const i = n - 1
            newPos[i] = { sub: placeSub, axial: placeAxial }
            setPositions(newPos)
          }}
            className="px-2 py-0.5 border border-border rounded-sm text-secondary hover:text-primary hover:border-muted transition-colors font-mono">
            C{n}
          </button>
        ))}
        <button onClick={() => setPositions(Array.from({ length: 6 }, () => ({ sub: 'H', axial: true })))}
          className="px-2 py-0.5 border border-border rounded-sm text-dim hover:text-secondary transition-colors">
          reset
        </button>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const newPos = positions.map(p => ({ ...p, axial: !p.axial }))
            setPositions(newPos)
            setFlipped(f => !f)
          }}
          className="px-4 py-1.5 rounded-sm border text-sm font-sans font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 25%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Ring Flip
        </motion.button>
        {totalAxialStrain > 0 && (
          <span className="font-mono text-xs text-secondary">
            1,3-diaxial strain ≈ <span className="text-primary">{totalAxialStrain.toFixed(1)} kJ/mol</span>
          </span>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CARBONS, CARBONS_FLIPPED,
  BACK_BOND_INDICES, BACK_BOND_INDICES_FLIPPED,
  axialDir, equatorialDir,
  SVG_W, SVG_H, RING_CX, RING_CY,
} from './chairGeometry'

// A-values (equatorial preference) in kJ/mol
const A_VALUES: Record<string, number> = {
  'H': 0, 'F': 0.4, 'OH': 2.1, 'Cl': 2.0, 'Br': 2.2,
  'CH₃': 7.6, 'Et': 7.5, 'iPr': 9.4, 'tBu': 22.8,
  'Ph': 12.4, 'COOH': 5.9,
}

const SUBSTITUENTS = Object.keys(A_VALUES)

// Maps atom index 0-5 (C1-C6) to the geometric slot it occupies.
// After a ring flip each atom shifts one slot counterclockwise.
function slotForAtom(atomIndex: number, flipped: boolean): number {
  return flipped ? (atomIndex + 5) % 6 : atomIndex
}

interface Props { showLabels?: boolean }

export default function ChairConformationViewer({ showLabels = true }: Props) {
  const [flipped, setFlipped] = useState(false)
  const [positions, setPositions] = useState<{ sub: string; axial: boolean }[]>(
    Array.from({ length: 6 }, () => ({ sub: 'H', axial: true }))
  )
  const [placeSub, setPlaceSub] = useState('CH₃')
  const [placeAxial, setPlaceAxial] = useState(true)

  // Pick the active geometry based on flip state
  const activeCarbons   = flipped ? CARBONS_FLIPPED : CARBONS
  const activeBackBonds = flipped ? BACK_BOND_INDICES_FLIPPED : BACK_BOND_INDICES

  // p.axial is always the current axial/equatorial state — no XOR needed
  const totalAxialStrain = positions.reduce((sum, p) => {
    return sum + (p.axial ? (A_VALUES[p.sub] ?? 0) : 0)
  }, 0)

  const AX_LEN = 30   // axial bond display length
  const EQ_LEN = 28   // equatorial bond display length
  const H_AX_LEN = 26 // axial H bond length
  const H_EQ_LEN = 22 // equatorial H bond length

  function renderSubstituent(atomIndex: number) {
    const slot = slotForAtom(atomIndex, flipped)
    const c = activeCarbons[slot]
    const p = positions[atomIndex]
    const isCurrentlyAxial = p.axial
    const ad = axialDir(slot, flipped)
    const ed = equatorialDir(slot, flipped)

    if (p.sub === 'H') return null

    const bDir = isCurrentlyAxial ? ad : ed
    const len = isCurrentlyAxial ? AX_LEN : EQ_LEN
    const tipX = c.x + bDir.dx * len
    const tipY = c.y + bDir.dy * len
    const aValue = A_VALUES[p.sub] ?? 0
    const isStrained = isCurrentlyAxial && aValue > 0

    return (
      <g key={`sub-${atomIndex}`}>
        <line x1={c.x} y1={c.y} x2={tipX} y2={tipY}
          stroke={isStrained ? 'var(--c-halogen)' : 'rgba(var(--overlay), 0.7)'}
          strokeWidth={isCurrentlyAxial ? 2.5 : 2}
          strokeDasharray={isCurrentlyAxial ? undefined : '4 2'} />
        <text x={tipX + bDir.dx * 11} y={tipY + bDir.dy * 11 + 4}
          textAnchor="middle" fontSize={10} fontFamily="monospace"
          fill={isStrained ? 'var(--c-halogen)' : 'rgba(var(--overlay), 0.9)'}>
          {p.sub}
        </text>
      </g>
    )
  }

  function renderHydrogens(atomIndex: number) {
    const slot = slotForAtom(atomIndex, flipped)
    const c = activeCarbons[slot]
    const p = positions[atomIndex]
    const isCurrentlyAxial = p.axial
    const ad = axialDir(slot, flipped)
    const ed = equatorialDir(slot, flipped)

    const hasSub = p.sub !== 'H'
    const subIsAxial = hasSub && isCurrentlyAxial
    const subIsEq = hasSub && !isCurrentlyAxial

    return (
      <g key={`h-${atomIndex}`}>
        {!subIsAxial && (
          <>
            <line x1={c.x} y1={c.y}
              x2={c.x + ad.dx * H_AX_LEN} y2={c.y + ad.dy * H_AX_LEN}
              stroke="var(--c-halogen)" strokeWidth={1.5} />
            <text x={c.x + ad.dx * (H_AX_LEN + 8)} y={c.y + ad.dy * (H_AX_LEN + 8) + 4}
              textAnchor="middle" fontSize={10} fontFamily="monospace"
              fill="var(--c-halogen)">H</text>
          </>
        )}
        {!subIsEq && (
          <>
            <line x1={c.x} y1={c.y}
              x2={c.x + ed.dx * H_EQ_LEN} y2={c.y + ed.dy * H_EQ_LEN}
              stroke="var(--c-noble)" strokeDasharray="3.5 2" strokeWidth={1.5} />
            <text x={c.x + ed.dx * (H_EQ_LEN + 8)} y={c.y + ed.dy * (H_EQ_LEN + 8) + 4}
              textAnchor="middle" fontSize={10} fontFamily="monospace"
              fill="var(--c-noble)">H</text>
          </>
        )}
      </g>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block mx-auto border border-border rounded-sm"
        style={{ background: 'rgb(var(--color-surface))' }}>
        {/* Ring bonds — back bonds drawn fainter for depth */}
        {[0, 1, 2, 3, 4, 5].map(i => {
          const a = activeCarbons[i], b = activeCarbons[(i + 1) % 6]
          const isBack = activeBackBonds.has(i)
          return (
            <line key={`ring-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isBack ? 'rgba(var(--overlay), 0.65)' : 'rgba(var(--overlay), 0.75)'}
              strokeWidth={isBack ? 2 : 2.5}
              strokeLinecap="round" />
          )
        })}
        {/* Carbon labels — each label follows its atom to the current slot */}
        {[0, 1, 2, 3, 4, 5].map(atomIndex => {
          const slot = slotForAtom(atomIndex, flipped)
          const c = activeCarbons[slot]
          const dx = c.x - RING_CX
          const dy = c.y - RING_CY
          const len = Math.hypot(dx, dy)
          const offX = (dx / len) * 14
          const offY = (dy / len) * 14
          return (
            <text key={`label-${atomIndex}`} x={c.x + offX} y={c.y + offY + 3}
              textAnchor="middle" fontSize={10} fontFamily="monospace"
              fill="rgba(var(--overlay), 0.55)">C{atomIndex + 1}</text>
          )
        })}
        {/* H atoms at all 12 positions */}
        {[0, 1, 2, 3, 4, 5].map(i => renderHydrogens(i))}
        {/* Non-H substituents */}
        {[0, 1, 2, 3, 4, 5].map(i => renderSubstituent(i))}
        {/* Legend */}
        {showLabels && (
          <>
            <line x1={8} y1={12} x2={26} y2={12} stroke="var(--c-halogen)" strokeWidth={1.5} />
            <text x={30} y={16} fontSize={10} fill="rgba(var(--overlay), 0.85)" fontFamily="monospace">axial</text>
            <line x1={8} y1={26} x2={26} y2={26} stroke="var(--c-noble)"
              strokeDasharray="3.5 2" strokeWidth={1.5} />
            <text x={30} y={30} fontSize={10} fill="rgba(var(--overlay), 0.85)" fontFamily="monospace">equatorial</text>
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
            newPos[n - 1] = { sub: placeSub, axial: placeAxial }
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
            setFlipped(f => !f)
            setPositions(positions.map(p => ({ ...p, axial: !p.axial })))
          }}
          className="px-4 py-1.5 rounded-sm border text-sm font-sans font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
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

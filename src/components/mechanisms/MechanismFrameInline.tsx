import type { MechanismFrame, AtomPosition, BondPosition, CurvedArrowOverlay, ArrowAnchor } from '../../data/mechanisms/types'

// ── Bond rendering ─────────────────────────────────────────────────────────────

function WedgeBond({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return null
  const nx = -dy / len, ny = dx / len
  const base = 4
  return (
    <polygon
      points={`${from.x},${from.y} ${to.x + nx * base},${to.y + ny * base} ${to.x - nx * base},${to.y - ny * base}`}
      fill="rgba(var(--overlay),0.5)" stroke="none"
    />
  )
}

function DashWedgeBond({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return null
  const ux = dx / len, uy = dy / len
  const nx = -uy, ny = ux
  const numTicks = 5
  return (
    <>
      {Array.from({ length: numTicks }, (_, i) => {
        const t = (i + 1) / (numTicks + 1)
        const cx = from.x + ux * len * t
        const cy = from.y + uy * len * t
        const hw = 1 + t * 3.5
        return (
          <line key={i}
            x1={cx + nx * hw} y1={cy + ny * hw}
            x2={cx - nx * hw} y2={cy - ny * hw}
            stroke="rgba(var(--overlay),0.5)" strokeWidth={1.5}
          />
        )
      })}
    </>
  )
}

function BondLine({ from, to, order, style }: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  order: 1 | 2 | 3
  style?: string
}) {
  if (style === 'wedge')      return <WedgeBond from={from} to={to} />
  if (style === 'dash-wedge') return <DashWedgeBond from={from} to={to} />

  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = len > 0 ? -dy / len : 0
  const ny = len > 0 ?  dx / len : 0
  const da = style === 'dashed' ? '4 3' : undefined

  if (order === 1) return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(var(--overlay),0.5)" strokeWidth={2} strokeDasharray={da} />
  if (order === 2) {
    const o = 2.5
    return <>
      <line x1={from.x + nx*o} y1={from.y + ny*o} x2={to.x + nx*o} y2={to.y + ny*o} stroke="rgba(var(--overlay),0.5)" strokeWidth={2} strokeDasharray={da} />
      <line x1={from.x - nx*o} y1={from.y - ny*o} x2={to.x - nx*o} y2={to.y - ny*o} stroke="rgba(var(--overlay),0.5)" strokeWidth={2} strokeDasharray={da} />
    </>
  }
  const o = 3
  return <>
    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(var(--overlay),0.5)" strokeWidth={2} strokeDasharray={da} />
    <line x1={from.x + nx*o} y1={from.y + ny*o} x2={to.x + nx*o} y2={to.y + ny*o} stroke="rgba(var(--overlay),0.5)" strokeWidth={1.5} strokeDasharray={da} />
    <line x1={from.x - nx*o} y1={from.y - ny*o} x2={to.x - nx*o} y2={to.y - ny*o} stroke="rgba(var(--overlay),0.5)" strokeWidth={1.5} strokeDasharray={da} />
  </>
}

// ── Arrow rendering ────────────────────────────────────────────────────────────

function resolveAnchor(anchor: ArrowAnchor, atoms: AtomPosition[], bonds: BondPosition[]) {
  if (anchor.kind === 'atom') {
    const a = atoms.find(a => a.id === anchor.id)
    return a ? { x: a.x, y: a.y } : null
  }
  if (anchor.kind === 'bond') {
    const b = bonds.find(b => b.id === anchor.id)
    if (!b) return null
    const fa = atoms.find(a => a.id === b.from)
    const ta = atoms.find(a => a.id === b.to)
    if (!fa || !ta) return null
    return { x: (fa.x + ta.x) / 2, y: (fa.y + ta.y) / 2 }
  }
  if (anchor.kind === 'lonePair') {
    const a = atoms.find(a => a.id === anchor.atomId)
    if (!a) return null
    const rad = anchor.angleDeg * Math.PI / 180
    return { x: a.x + Math.cos(rad) * 22, y: a.y + Math.sin(rad) * 22 }
  }
  return null
}

function FrameArrowSvg({ arrow, atoms, bonds }: {
  arrow: CurvedArrowOverlay
  atoms: AtomPosition[]
  bonds: BondPosition[]
}) {
  const from = resolveAnchor(arrow.from, atoms, bonds)
  const to   = resolveAnchor(arrow.to,   atoms, bonds)
  if (!from || !to) return null

  const color    = arrow.color ?? 'var(--c-alkali)'
  const bowSign  = arrow.bow ?? -1
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = len > 0 ? -dy / len : 0
  const ny = len > 0 ?  dx / len : 0
  const bowDist = Math.min(len * 0.38, 65) * bowSign
  const ctrl = { x: mx + nx * bowDist, y: my + ny * bowDist }

  const OFFSET = 18
  const shorten = (pt: { x: number; y: number }, toward: { x: number; y: number }) => {
    const dx2 = toward.x - pt.x, dy2 = toward.y - pt.y
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
    if (l2 < OFFSET * 2) return pt
    return { x: pt.x + (dx2 / l2) * OFFSET, y: pt.y + (dy2 / l2) * OFFSET }
  }

  const fromS = shorten(from, ctrl)
  const toS   = shorten(to, ctrl)
  const angle = Math.atan2(to.y - ctrl.y, to.x - ctrl.x) * (180 / Math.PI)
  const path  = `M ${fromS.x} ${fromS.y} Q ${ctrl.x} ${ctrl.y} ${toS.x} ${toS.y}`

  if (arrow.style === 'fishhook') {
    return (
      <g>
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <polygon points="0,-3 6,0 0,0" fill={color} transform={`translate(${toS.x},${toS.y}) rotate(${angle})`} />
      </g>
    )
  }

  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <polygon points="0,-4 7,0 0,4" fill={color} transform={`translate(${toS.x},${toS.y}) rotate(${angle})`} />
    </g>
  )
}

// ── Atom rendering ─────────────────────────────────────────────────────────────

function labelOffset(atom: AtomPosition, atoms: AtomPosition[], bonds: BondPosition[]) {
  const DIST = 22
  const neighbors = bonds
    .filter(b => b.from === atom.id || b.to === atom.id)
    .map(b => atoms.find(a => a.id === (b.from === atom.id ? b.to : b.from)))
    .filter((a): a is AtomPosition => !!a)
  if (neighbors.length === 0) return { dx: 0, dy: DIST }
  let sx = 0, sy = 0
  for (const nb of neighbors) {
    const dx = nb.x - atom.x, dy = nb.y - atom.y
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len > 0) { sx += dx / len; sy += dy / len }
  }
  const mag = Math.sqrt(sx * sx + sy * sy)
  if (mag < 0.1) return { dx: 0, dy: DIST }
  return { dx: (-sx / mag) * DIST, dy: (-sy / mag) * DIST }
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  frame: MechanismFrame
  width?: number
  height?: number
  showCaption?: boolean
  showArrows?: boolean
}

export default function MechanismFrameInline({
  frame,
  width = 300,
  height = 200,
  showCaption = false,
  showArrows = true,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 700 320"
        width={width}
        height={height}
        style={{ display: 'block' }}
      >
        {/* Bonds */}
        {frame.bonds.map(bond => {
          const fa = frame.atoms.find(a => a.id === bond.from)
          const ta = frame.atoms.find(a => a.id === bond.to)
          if (!fa || !ta) return null
          return (
            <g key={bond.id}>
              <BondLine from={fa} to={ta} order={bond.order} style={bond.style} />
            </g>
          )
        })}

        {/* Curved arrows */}
        {showArrows && frame.arrows.map((arrow, i) => (
          <FrameArrowSvg key={i} arrow={arrow} atoms={frame.atoms} bonds={frame.bonds} />
        ))}

        {/* Atoms */}
        {frame.atoms.map(atom => {
          const off = atom.label ? labelOffset(atom, frame.atoms, frame.bonds) : { dx: 0, dy: 0 }
          return (
            <g key={atom.id}>
              {atom.glow && (
                <circle cx={atom.x} cy={atom.y} r={22} fill="var(--c-alkali)" opacity={0.35} />
              )}
              <circle
                cx={atom.x} cy={atom.y} r={16}
                fill="rgb(var(--color-surface))"
                stroke="rgba(var(--overlay),0.2)" strokeWidth={1.5}
              />
              <text
                x={atom.x} y={atom.y}
                textAnchor="middle" dominantBaseline="central"
                fill="rgb(var(--color-primary))"
                fontFamily="monospace" fontSize={14} fontWeight={600}
              >
                {atom.symbol}
              </text>
              {atom.charge && (
                <text x={atom.x + 11} y={atom.y - 11} fill="var(--c-halogen)" fontFamily="monospace" fontSize={11}>
                  {atom.charge}
                </text>
              )}
              {atom.label && (
                <text
                  x={atom.x + off.dx} y={atom.y + off.dy}
                  textAnchor="middle"
                  fill="rgb(var(--color-primary))" fillOpacity={0.45}
                  fontFamily="monospace" fontSize={10}
                >
                  {atom.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {showCaption && frame.caption && (
        <p className="font-mono text-[10px] text-secondary text-center leading-tight px-1">
          {frame.caption}
        </p>
      )}
    </div>
  )
}

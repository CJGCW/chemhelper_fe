import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useAnimate } from 'framer-motion'
import type { ReactionDef, AnimPrimitive, AtomPosition } from '../../data/mechanisms/types'

interface Props {
  reaction: ReactionDef
  compact?: boolean
}

// ── Scene state accumulator ────────────────────────────────────────────────────

interface ComputedScene {
  atoms: AtomPosition[]
  bonds: Array<{ id: string; from: string; to: string; order: 1 | 2 | 3; style?: string }>
  newBonds: Array<{ fromId: string; toId: string; order: 1 | 2 | 3; key: string }>
}

type BondStyle = 'solid' | 'dashed' | 'wedge' | 'dash-wedge'

function computeSceneAtStep(reaction: ReactionDef, upToStep: number): ComputedScene {
  const atomMap = new Map<string, AtomPosition>(
    reaction.scene.atoms.map(a => [a.id, { ...a }])
  )
  const brokenBondIds   = new Set<string>()
  const upgradedBonds   = new Map<string, 1 | 2 | 3>()
  const bondStyleOverrides = new Map<string, BondStyle>()
  const newBonds: Array<{ fromId: string; toId: string; order: 1 | 2 | 3; key: string }> = []

  for (let i = 0; i < upToStep; i++) {
    const step = reaction.steps[i]
    if (!step) break
    for (const anim of step.animations) {
      if (anim.type === 'bond_break' && anim.targetId) {
        brokenBondIds.add(anim.targetId)
      }
      // Part 5: ID-based atom_translate, distance fallback for legacy data
      if (anim.type === 'atom_translate' && anim.to) {
        if (anim.targetId) {
          const atom = atomMap.get(anim.targetId)
          if (atom) {
            if (anim.from) {
              const drift = Math.hypot(atom.x - anim.from.x, atom.y - anim.from.y)
              if (drift > 5) {
                console.warn(`[mechanism] atom_translate drift ${drift.toFixed(1)}px on '${anim.targetId}' in '${reaction.id}' — from declared (${anim.from.x},${anim.from.y}) vs actual (${atom.x},${atom.y})`)
              }
            }
            atom.x = anim.to.x
            atom.y = anim.to.y
          }
        } else if (anim.from) {
          let minDist = Infinity, closestAtom: AtomPosition | null = null
          for (const atom of atomMap.values()) {
            const d = Math.hypot(atom.x - anim.from.x, atom.y - anim.from.y)
            if (d < minDist) { minDist = d; closestAtom = atom }
          }
          if (closestAtom && minDist < 50) {
            closestAtom.x = anim.to.x
            closestAtom.y = anim.to.y
          }
        }
      }
      if (anim.type === 'bond_form' && anim.targetId) {
        const isExisting = reaction.scene.bonds.some(b => b.id === anim.targetId)
        if (isExisting) {
          const cur = upgradedBonds.get(anim.targetId) ?? 1
          upgradedBonds.set(anim.targetId, Math.min(3, cur + 1) as 1 | 2 | 3)
        } else {
          const idx = anim.targetId.indexOf('-')
          if (idx > 0 && !newBonds.some(nb => nb.key === anim.targetId)) {
            const id1 = anim.targetId.slice(0, idx)
            const id2 = anim.targetId.slice(idx + 1)
            if (atomMap.has(id1) && atomMap.has(id2)) {
              newBonds.push({ fromId: id1, toId: id2, order: 1, key: anim.targetId })
            }
          }
        }
      }
      if (anim.type === 'charge_appear' && anim.targetId && anim.text) {
        const atom = atomMap.get(anim.targetId)
        if (atom) atom.charge = anim.text
      }
      if (anim.type === 'charge_disappear' && anim.targetId) {
        const atom = atomMap.get(anim.targetId)
        if (atom) atom.charge = undefined
      }
      if (anim.type === 'atom_relabel' && anim.targetId && anim.text !== undefined) {
        const atom = atomMap.get(anim.targetId)
        if (atom) atom.symbol = anim.text
      }
      // Part 2: bond style changes persisted in committed state
      if (anim.type === 'bond_style_change' && anim.targetId && anim.text) {
        bondStyleOverrides.set(anim.targetId, anim.text as BondStyle)
      }
      if (anim.type === 'invert_stereocenter' && anim.targetId) {
        for (const bond of reaction.scene.bonds) {
          if (bond.from !== anim.targetId && bond.to !== anim.targetId) continue
          if (brokenBondIds.has(bond.id)) continue
          const cur = (bondStyleOverrides.get(bond.id) ?? bond.style) as BondStyle | undefined
          if (cur === 'wedge')      bondStyleOverrides.set(bond.id, 'dash-wedge')
          else if (cur === 'dash-wedge') bondStyleOverrides.set(bond.id, 'wedge')
        }
      }
    }
  }

  return {
    atoms: [...atomMap.values()],
    bonds: reaction.scene.bonds
      .filter(b => !brokenBondIds.has(b.id))
      .map(b => ({
        ...b,
        order: (upgradedBonds.get(b.id) ?? b.order) as 1 | 2 | 3,
        style: bondStyleOverrides.get(b.id) ?? b.style,
      })),
    newBonds,
  }
}

// ── Bond / atom renderers ──────────────────────────────────────────────────────

function getAtomById(atoms: AtomPosition[], id: string) {
  return atoms.find(a => a.id === id)
}

// Returns the label offset direction opposite to the atom's net bond direction.
// Prevents the label from rendering on the same side as the bond line.
function labelOffset(
  atom: AtomPosition,
  atoms: AtomPosition[],
  bonds: Array<{ from: string; to: string }>,
): { dx: number; dy: number } {
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
        return <line key={i} x1={cx + nx * hw} y1={cy + ny * hw} x2={cx - nx * hw} y2={cy - ny * hw} stroke="rgba(var(--overlay),0.5)" strokeWidth={1.5} />
      })}
    </>
  )
}

function BondSegments({ from, to, order, style }: {
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
  const ny = len > 0 ? dx / len : 0
  const da = style === 'dashed' ? '4 3' : undefined

  if (order === 1) {
    return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(var(--overlay),0.5)" strokeWidth={2} strokeDasharray={da} />
  }
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

// Animated version — used when one or both endpoint atoms are translating.
// Wedge/dash-wedge bonds render at their final positions (they rarely translate).
function AnimatedBondSegments({ from, fromTarget, to, toTarget, order, style, transition }: {
  from: { x: number; y: number }
  fromTarget?: { x: number; y: number }
  to: { x: number; y: number }
  toTarget?: { x: number; y: number }
  order: 1 | 2 | 3
  style?: string
  transition: object
}) {
  // Wedge/dash-wedge: render statically at final position (these bond types rarely translate)
  if (style === 'wedge') {
    return <WedgeBond from={fromTarget ?? from} to={toTarget ?? to} />
  }
  if (style === 'dash-wedge') {
    return <DashWedgeBond from={fromTarget ?? from} to={toTarget ?? to} />
  }

  const da   = style === 'dashed' ? '4 3' : undefined
  const fx0  = from.x,             fy0  = from.y
  const fx1  = fromTarget?.x ?? from.x, fy1  = fromTarget?.y ?? from.y
  const tx0  = to.x,               ty0  = to.y
  const tx1  = toTarget?.x ?? to.x,   ty1  = toTarget?.y ?? to.y
  const dx   = tx1 - fx1, dy = ty1 - fy1
  const len  = Math.sqrt(dx * dx + dy * dy)
  const nx   = len > 0 ? -dy / len : 0
  const ny   = len > 0 ?  dx / len : 0

  if (order === 1) {
    return (
      <motion.line strokeWidth={2} stroke="rgba(var(--overlay),0.5)" strokeDasharray={da}
        initial={{ x1: fx0, y1: fy0, x2: tx0, y2: ty0 }}
        animate={{ x1: fx1, y1: fy1, x2: tx1, y2: ty1 }}
        transition={transition}
      />
    )
  }
  if (order === 2) {
    const o = 2.5
    return <>
      <motion.line strokeWidth={2} stroke="rgba(var(--overlay),0.5)" strokeDasharray={da}
        initial={{ x1: fx0 + nx*o, y1: fy0 + ny*o, x2: tx0 + nx*o, y2: ty0 + ny*o }}
        animate={{ x1: fx1 + nx*o, y1: fy1 + ny*o, x2: tx1 + nx*o, y2: ty1 + ny*o }}
        transition={transition}
      />
      <motion.line strokeWidth={2} stroke="rgba(var(--overlay),0.5)" strokeDasharray={da}
        initial={{ x1: fx0 - nx*o, y1: fy0 - ny*o, x2: tx0 - nx*o, y2: ty0 - ny*o }}
        animate={{ x1: fx1 - nx*o, y1: fy1 - ny*o, x2: tx1 - nx*o, y2: ty1 - ny*o }}
        transition={transition}
      />
    </>
  }
  const o = 3
  return <>
    <motion.line strokeWidth={2} stroke="rgba(var(--overlay),0.5)" strokeDasharray={da}
      initial={{ x1: fx0, y1: fy0, x2: tx0, y2: ty0 }}
      animate={{ x1: fx1, y1: fy1, x2: tx1, y2: ty1 }}
      transition={transition}
    />
    <motion.line strokeWidth={1.5} stroke="rgba(var(--overlay),0.5)" strokeDasharray={da}
      initial={{ x1: fx0 + nx*o, y1: fy0 + ny*o, x2: tx0 + nx*o, y2: ty0 + ny*o }}
      animate={{ x1: fx1 + nx*o, y1: fy1 + ny*o, x2: tx1 + nx*o, y2: ty1 + ny*o }}
      transition={transition}
    />
    <motion.line strokeWidth={1.5} stroke="rgba(var(--overlay),0.5)" strokeDasharray={da}
      initial={{ x1: fx0 - nx*o, y1: fy0 - ny*o, x2: tx0 - nx*o, y2: ty0 - ny*o }}
      animate={{ x1: fx1 - nx*o, y1: fy1 - ny*o, x2: tx1 - nx*o, y2: ty1 - ny*o }}
      transition={transition}
    />
  </>
}

// ── Animation primitive renderers ──────────────────────────────────────────────

function CurvedArrow({ prim, playing }: { prim: AnimPrimitive; playing: boolean }) {
  const [scope, animate] = useAnimate()
  const from = prim.from ?? { x: 0, y: 0 }
  const to = prim.to ?? { x: 0, y: 0 }
  const control = prim.control ?? { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 20 }
  const color = prim.color ?? 'var(--c-alkali)'
  const dur = prim.duration ?? 0.6
  const delay = prim.delay ?? 0

  useEffect(() => {
    if (!playing || !scope.current) return
    animate(scope.current, { strokeDashoffset: [1, 0] }, { duration: dur, delay, ease: 'easeInOut' })
  }, [playing, animate, dur, delay, scope])

  const angle = Math.atan2(to.y - control.y, to.x - control.x) * (180 / Math.PI)

  return (
    <g>
      <motion.path
        ref={scope}
        d={`M ${from.x} ${from.y} Q ${control.x} ${control.y} ${to.x} ${to.y}`}
        fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={playing ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: dur, delay, ease: 'easeInOut' }}
      />
      <motion.polygon
        points={`0,-4 7,0 0,4`} fill={color}
        transform={`translate(${to.x},${to.y}) rotate(${angle})`}
        initial={{ opacity: 0 }}
        animate={playing ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.1, delay: delay + dur * 0.8 }}
      />
    </g>
  )
}

function SingleArrow({ prim, playing }: { prim: AnimPrimitive; playing: boolean }) {
  const from = prim.from ?? { x: 0, y: 0 }
  const to = prim.to ?? { x: 0, y: 0 }
  const dur = prim.duration ?? 0.5, delay = prim.delay ?? 0
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI)

  return (
    <g>
      <motion.line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke="var(--c-halogen)" strokeWidth={1.5} strokeDasharray="3 2"
        initial={{ pathLength: 0 }}
        animate={playing ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: dur, delay }}
      />
      <motion.polygon
        points="0,-3 6,0 0,3" fill="var(--c-halogen)"
        transform={`translate(${to.x},${to.y}) rotate(${angle})`}
        initial={{ opacity: 0 }}
        animate={playing ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.1, delay: delay + dur * 0.8 }}
      />
    </g>
  )
}

function StepLabelOverlay({ prim, playing }: { prim: AnimPrimitive; playing: boolean }) {
  return (
    <motion.text
      x="50%" y="95%" textAnchor="middle"
      fill="var(--c-halogen)" fontFamily="monospace" fontSize={11}
      initial={{ opacity: 0 }}
      animate={playing ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3, delay: prim.delay ?? 0 }}
    >
      {prim.text}
    </motion.text>
  )
}

function ChargeAppear({ prim, playing, atoms }: { prim: AnimPrimitive; playing: boolean; atoms: AtomPosition[] }) {
  const atom = prim.targetId ? getAtomById(atoms, prim.targetId) : null
  const x = atom?.x ?? prim.from?.x ?? 0
  const y = atom?.y ?? prim.from?.y ?? 0
  return (
    <motion.text
      x={x + 10} y={y - 10} fill="var(--c-halogen)" fontSize={11} fontFamily="monospace"
      initial={{ opacity: 0, scale: 0 }}
      animate={playing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ duration: 0.3, delay: prim.delay ?? 0 }}
      style={{ transformOrigin: `${x + 10}px ${y - 10}px` }}
    >
      {prim.text}
    </motion.text>
  )
}

function ChargeDisappear({ prim, playing, atoms }: { prim: AnimPrimitive; playing: boolean; atoms: AtomPosition[] }) {
  const atom = prim.targetId ? getAtomById(atoms, prim.targetId) : null
  const x = atom?.x ?? prim.from?.x ?? 0
  const y = atom?.y ?? prim.from?.y ?? 0
  return (
    <motion.text
      x={x + 10} y={y - 10} fill="var(--c-halogen)" fontSize={11} fontFamily="monospace"
      initial={{ opacity: 0 }}
      animate={playing ? { opacity: [1, 0] } : { opacity: 0 }}
      transition={{ duration: prim.duration ?? 0.5, delay: prim.delay ?? 0 }}
    >
      {prim.text}
    </motion.text>
  )
}

function IntermediateGlow({ prim, playing, atoms }: { prim: AnimPrimitive; playing: boolean; atoms: AtomPosition[] }) {
  const atom = prim.targetId ? getAtomById(atoms, prim.targetId) : null
  const x = atom?.x ?? prim.from?.x ?? 0
  const y = atom?.y ?? prim.from?.y ?? 0
  return (
    <motion.circle
      cx={x} cy={y} r={22} fill="var(--c-alkali)"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={playing ? { opacity: [0, 0.6, 0.3], scale: [0.5, 1.2, 1] } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: prim.duration ?? 0.8, delay: prim.delay ?? 0, times: [0, 0.5, 1] }}
    />
  )
}

function AnimOverlay({ animations, playing, atoms }: {
  animations: AnimPrimitive[]
  playing: boolean
  atoms: AtomPosition[]
}) {
  return (
    <>
      {animations.map((prim, i) => {
        const key = `${prim.type}-${i}`
        switch (prim.type) {
          case 'curved_arrow':      return <CurvedArrow key={key} prim={prim} playing={playing} />
          case 'single_arrow':      return <SingleArrow key={key} prim={prim} playing={playing} />
          case 'step_label':        return <StepLabelOverlay key={key} prim={prim} playing={playing} />
          case 'charge_appear':     return <ChargeAppear key={key} prim={prim} playing={playing} atoms={atoms} />
          case 'charge_disappear':  return <ChargeDisappear key={key} prim={prim} playing={playing} atoms={atoms} />
          case 'intermediate_glow': return <IntermediateGlow key={key} prim={prim} playing={playing} atoms={atoms} />
          default:                  return null
        }
      })}
    </>
  )
}

// ── Energy diagram ─────────────────────────────────────────────────────────────

function EnergyDiagram({ points }: { points: { label: string; energy: number; isTransitionState?: boolean }[] }) {
  if (points.length < 2) return null
  const W = 280, H = 140
  const pad = { top: 16, right: 16, bottom: 28, left: 36 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const minE = Math.min(...points.map(p => p.energy))
  const maxE = Math.max(...points.map(p => p.energy))
  const range = maxE - minE || 1
  const toX = (i: number) => pad.left + (i / (points.length - 1)) * innerW
  const toY = (e: number) => pad.top + innerH - ((e - minE) / range) * innerH
  const coords = points.map((p, i) => ({ x: toX(i), y: toY(p.energy) }))
  let d = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1], curr = coords[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="rgba(var(--overlay),0.3)" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="rgba(var(--overlay),0.3)" strokeWidth={1} />
      <text transform={`translate(10,${pad.top + innerH / 2}) rotate(-90)`} textAnchor="middle" fontSize={8} fill="rgba(var(--color-primary),0.5)" fontFamily="monospace">Energy</text>
      <text x={pad.left + innerW / 2} y={H - 4} textAnchor="middle" fontSize={8} fill="rgba(var(--color-primary),0.5)" fontFamily="monospace">Reaction coordinate</text>
      <motion.path d={d} fill="none" stroke="rgb(var(--color-primary))" strokeWidth={1.5} strokeOpacity={0.6}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
      {points.map((p, i) => {
        const cx = toX(i), cy = toY(p.energy)
        const dotColor = p.isTransitionState ? 'var(--c-halogen)' : 'var(--c-noble)'
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={4} fill={dotColor} />
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize={7} fill={dotColor} fontFamily="monospace">{p.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MechanismPlayer({ reaction, compact = false }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [allStepsPlayed, setAllStepsPlayed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const steps = reaction.steps
  const step = steps[currentStep]
  const totalSteps = steps.length

  const maxAnimDuration = step
    ? Math.max(0, ...step.animations.map(a => (a.delay ?? 0) + (a.duration ?? 0.6))) * 1000
    : 0

  // Scene state at the START of currentStep (before its animations)
  const preScene = useMemo(
    () => computeSceneAtStep(reaction, currentStep),
    [reaction, currentStep]
  )

  // Scene state AFTER all steps (final product)
  const finalScene = useMemo(
    () => computeSceneAtStep(reaction, totalSteps),
    [reaction, totalSteps]
  )

  // Which scene to display as the committed base
  const baseScene = allStepsPlayed && !playing ? finalScene : preScene

  // Which atoms are translating in the current step — ID-based lookup with distance fallback
  const translateTargets = useMemo(() => {
    const map = new Map<string, { x: number; y: number; duration: number; delay: number }>()
    if (!step) return map
    for (const anim of step.animations) {
      if (anim.type !== 'atom_translate' || !anim.to) continue
      let atomId: string | undefined
      if (anim.targetId) {
        // ID-based: direct lookup
        const atom = preScene.atoms.find(a => a.id === anim.targetId)
        if (atom) {
          if (anim.from) {
            const drift = Math.hypot(atom.x - anim.from.x, atom.y - anim.from.y)
            if (drift > 5) console.warn(`[mechanism] translateTargets drift ${drift.toFixed(1)}px on '${anim.targetId}'`)
          }
          atomId = anim.targetId
        }
      } else if (anim.from) {
        // Distance-based fallback for legacy data without targetId
        let minDist = Infinity, closestId = ''
        for (const atom of preScene.atoms) {
          const d = Math.hypot(atom.x - anim.from.x, atom.y - anim.from.y)
          if (d < minDist) { minDist = d; closestId = atom.id }
        }
        if (minDist < 50 && closestId) atomId = closestId
      }
      if (atomId && !map.has(atomId)) {
        map.set(atomId, { x: anim.to.x, y: anim.to.y, duration: anim.duration ?? 0.8, delay: anim.delay ?? 0 })
      }
    }
    return map
  }, [step, preScene.atoms])

  // Which bonds change style in the current step (bond_style_change / invert_stereocenter)
  const styleChangesInStep = useMemo(() => {
    const map = new Map<string, { newStyle: BondStyle; delay: number; duration: number }>()
    if (!step) return map
    for (const anim of step.animations) {
      if (anim.type === 'bond_style_change' && anim.targetId && anim.text) {
        map.set(anim.targetId, { newStyle: anim.text as BondStyle, delay: anim.delay ?? 0, duration: anim.duration ?? 0.6 })
      }
      if (anim.type === 'invert_stereocenter' && anim.targetId) {
        const delay    = anim.delay ?? 0
        const duration = anim.duration ?? 0.6
        for (const bond of preScene.bonds) {
          if (bond.from !== anim.targetId && bond.to !== anim.targetId) continue
          const cur = bond.style as BondStyle | undefined
          if (cur === 'wedge')           map.set(bond.id, { newStyle: 'dash-wedge', delay, duration })
          else if (cur === 'dash-wedge') map.set(bond.id, { newStyle: 'wedge',      delay, duration })
        }
      }
    }
    return map
  }, [step, preScene.bonds])

  // Atoms whose static charge should be suppressed during animation (charge_disappear handles them)
  const suppressChargeIds = useMemo(() => new Set(
    (step?.animations ?? [])
      .filter(a => a.type === 'charge_disappear' && a.targetId)
      .map(a => a.targetId!)
  ), [step])

  // Which bonds break in the current step
  const breakingBondMap = useMemo(() => {
    const map = new Map<string, { delay: number; duration: number }>()
    if (!step) return map
    for (const anim of step.animations) {
      if (anim.type === 'bond_break' && anim.targetId) {
        map.set(anim.targetId, { delay: anim.delay ?? 0, duration: anim.duration ?? 0.4 })
      }
    }
    return map
  }, [step])

  // Which bonds form in the current step
  const formingBondsInStep = useMemo(() => {
    if (!step) return []
    const result: Array<{
      fromId: string; toId: string; order: 1 | 2 | 3
      delay: number; isUpgrade: boolean; key: string
    }> = []
    for (const anim of step.animations) {
      if (anim.type !== 'bond_form' || !anim.targetId) continue
      const isExistingBond = reaction.scene.bonds.some(b => b.id === anim.targetId)
      if (isExistingBond) {
        const bond = reaction.scene.bonds.find(b => b.id === anim.targetId)!
        result.push({ fromId: bond.from, toId: bond.to, order: 2, delay: anim.delay ?? 0, isUpgrade: true, key: anim.targetId })
      } else {
        const idx = anim.targetId.indexOf('-')
        if (idx > 0) {
          result.push({ fromId: anim.targetId.slice(0, idx), toId: anim.targetId.slice(idx + 1), order: 1, delay: anim.delay ?? 0, isUpgrade: false, key: anim.targetId })
        }
      }
    }
    return result
  }, [step, reaction.scene.bonds])

  useEffect(() => {
    if (!playing) return
    timerRef.current = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(s => s + 1)
      } else {
        setPlaying(false)
        setAllStepsPlayed(true)
      }
    }, maxAnimDuration + 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, currentStep, maxAnimDuration, totalSteps])

  function handlePlay() {
    if (playing) return
    setAllStepsPlayed(false)
    if (currentStep >= totalSteps - 1 && allStepsPlayed) {
      setCurrentStep(0)
      setTimeout(() => setPlaying(true), 50)
    } else {
      setPlaying(true)
    }
  }

  function handleStepClick(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPlaying(false)
    setAllStepsPlayed(false)
    setCurrentStep(i)
  }

  const activeTint  = 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))'
  const activeBorder = 'color-mix(in srgb, var(--c-halogen) 30%, transparent)'
  const playBg      = 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))'

  return (
    <div className="flex flex-col gap-3">
      {/* SVG Canvas */}
      <div className="rounded-sm border border-border overflow-hidden bg-[rgb(var(--color-surface))]">
        <svg viewBox={`0 0 ${reaction.scene.width} ${reaction.scene.height}`} style={{ width: '100%', display: 'block' }}>

          {/* ── Bonds ── */}
          {baseScene.bonds.map(bond => {
            const fromAtom = baseScene.atoms.find(a => a.id === bond.from)
            const toAtom   = baseScene.atoms.find(a => a.id === bond.to)
            if (!fromAtom || !toAtom) return null

            const breakInfo   = breakingBondMap.get(bond.id)
            const styleChange = !allStepsPlayed ? styleChangesInStep.get(bond.id) : undefined
            const upgradeInfo = !allStepsPlayed
              ? formingBondsInStep.find(fb => fb.isUpgrade && fb.fromId === bond.from && fb.toId === bond.to)
              : null

            const fromTr = playing ? translateTargets.get(fromAtom.id) : undefined
            const toTr   = playing ? translateTargets.get(toAtom.id)   : undefined
            const hasTr  = !!(fromTr || toTr)
            const bondMoveTrans = {
              type: 'tween' as const,
              duration: Math.max(fromTr?.duration ?? 0, toTr?.duration ?? 0),
              delay:    Math.min(fromTr?.delay    ?? 0, toTr?.delay    ?? 0),
              ease:     'easeInOut' as const,
            }

            // Style change (invert_stereocenter / bond_style_change): crossfade old→new
            if (styleChange) {
              return (
                <g key={bond.id}>
                  <motion.g
                    initial={false}
                    animate={{ opacity: playing ? 0 : 1 }}
                    transition={{ duration: styleChange.duration, delay: styleChange.delay }}
                  >
                    <BondSegments from={fromAtom} to={toAtom} order={bond.order} style={bond.style} />
                  </motion.g>
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: playing ? 1 : 0 }}
                    transition={{ duration: styleChange.duration, delay: styleChange.delay }}
                  >
                    <BondSegments from={fromAtom} to={toAtom} order={bond.order} style={styleChange.newStyle} />
                  </motion.g>
                </g>
              )
            }

            if (upgradeInfo) {
              return (
                <g key={bond.id}>
                  <motion.g
                    animate={{ opacity: playing ? 0 : 1 }}
                    transition={{ duration: 0.3, delay: upgradeInfo.delay }}
                  >
                    {hasTr
                      ? <AnimatedBondSegments from={fromAtom} fromTarget={fromTr} to={toAtom} toTarget={toTr} order={1} style={bond.style} transition={bondMoveTrans} />
                      : <BondSegments from={fromAtom} to={toAtom} order={1} style={bond.style} />}
                  </motion.g>
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: playing ? 1 : 0 }}
                    transition={{ duration: 0.35, delay: upgradeInfo.delay + 0.1 }}
                  >
                    {hasTr
                      ? <AnimatedBondSegments from={fromAtom} fromTarget={fromTr} to={toAtom} toTarget={toTr} order={2} style={bond.style} transition={bondMoveTrans} />
                      : <BondSegments from={fromAtom} to={toAtom} order={2} style={bond.style} />}
                  </motion.g>
                </g>
              )
            }

            return (
              <motion.g
                key={bond.id}
                initial={false}
                animate={{ opacity: playing && breakInfo ? 0 : 1 }}
                transition={breakInfo ? { duration: breakInfo.duration, delay: breakInfo.delay } : { duration: 0 }}
              >
                {hasTr
                  ? <AnimatedBondSegments from={fromAtom} fromTarget={fromTr} to={toAtom} toTarget={toTr} order={bond.order} style={bond.style} transition={bondMoveTrans} />
                  : <BondSegments from={fromAtom} to={toAtom} order={bond.order} style={bond.style} />}
              </motion.g>
            )
          })}

          {/* Committed new bonds from previous steps */}
          {baseScene.newBonds.map(nb => {
            const fromAtom = baseScene.atoms.find(a => a.id === nb.fromId)
            const toAtom   = baseScene.atoms.find(a => a.id === nb.toId)
            if (!fromAtom || !toAtom) return null
            return (
              <g key={nb.key}>
                <BondSegments from={fromAtom} to={toAtom} order={nb.order} />
              </g>
            )
          })}

          {/* New bonds forming in current step — endpoint follows the moving atom */}
          {!allStepsPlayed && formingBondsInStep.filter(fb => !fb.isUpgrade).map(fb => {
            const fromAtom = preScene.atoms.find(a => a.id === fb.fromId)
            const toAtom   = preScene.atoms.find(a => a.id === fb.toId)
            if (!fromAtom || !toAtom) return null

            const fromTranslate = translateTargets.get(fb.fromId)
            const toTranslate   = translateTargets.get(fb.toId)

            // Endpoint positions: use translate target if the atom is moving, else current
            const endX = fromTranslate?.x ?? fromAtom.x
            const endY = fromTranslate?.y ?? fromAtom.y
            const ancX = toTranslate?.x   ?? toAtom.x
            const ancY = toTranslate?.y   ?? toAtom.y

            if (fromTranslate) {
              // Bond endpoint animates in sync with the nucleophile translate.
              // Opacity fades in during the second half of the move so the bond
              // appears as the nucleophile approaches the carbon.
              const dur = fromTranslate.duration
              const del = fromTranslate.delay
              return (
                <motion.line
                  key={fb.key}
                  x2={ancX} y2={ancY}
                  stroke="rgba(var(--overlay),0.5)" strokeWidth={2}
                  initial={{ x1: fromAtom.x, y1: fromAtom.y, opacity: 0 }}
                  animate={playing
                    ? { x1: endX, y1: endY, opacity: 1 }
                    : { x1: fromAtom.x, y1: fromAtom.y, opacity: 0 }
                  }
                  transition={{
                    x1:      { duration: dur, delay: del, ease: 'easeInOut' },
                    y1:      { duration: dur, delay: del, ease: 'easeInOut' },
                    opacity: { duration: dur * 0.5, delay: del + dur * 0.5 },
                  }}
                />
              )
            }

            // No translate — both atoms stationary, just fade in
            return (
              <motion.g
                key={fb.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: playing ? 1 : 0 }}
                transition={{ duration: 0.4, delay: fb.delay }}
              >
                <BondSegments from={{ x: endX, y: endY }} to={{ x: ancX, y: ancY }} order={fb.order} />
              </motion.g>
            )
          })}

          {/* Arrow-push overlay (curved arrows, charges, labels) */}
          {step && !allStepsPlayed && (
            <AnimOverlay animations={step.animations} playing={playing} atoms={preScene.atoms} />
          )}

          {/* ── Atoms ── */}
          {baseScene.atoms.map(atom => {
            const translate   = !allStepsPlayed ? translateTargets.get(atom.id) : undefined
            const isAnimating = playing && !!translate
            const showCharge  = atom.charge && !(playing && !allStepsPlayed && suppressChargeIds.has(atom.id))
            const moveTrans   = {
              type: 'tween' as const,
              duration: translate?.duration ?? 0.8,
              delay:    translate?.delay    ?? 0,
              ease:     'easeInOut' as const,
            }

            // Label offset: opposite the net bond direction so it never sits on top of a bond line.
            // Combine committed bonds + newly formed bonds from previous steps.
            const allBondsForLabel = [
              ...baseScene.bonds,
              ...baseScene.newBonds.map(nb => ({ from: nb.fromId, to: nb.toId })),
            ]
            const off = atom.label
              ? labelOffset(atom, baseScene.atoms, allBondsForLabel)
              : { dx: 0, dy: 0 }

            return (
              // Compound key prevents cross-reaction drift when reactions share atom IDs (br, c, h1…)
              <g key={`${reaction.id}:${atom.id}`}>
                {isAnimating ? (
                  // Moving atom — mount at current position, animate to translate target
                  <>
                    <motion.circle
                      r={14}
                      fill="rgb(var(--color-surface))"
                      stroke="rgba(var(--overlay),0.2)" strokeWidth={1.5}
                      initial={{ cx: atom.x, cy: atom.y }}
                      animate={{ cx: translate!.x, cy: translate!.y }}
                      transition={moveTrans}
                    />
                    <motion.text
                      textAnchor="middle" dominantBaseline="central"
                      fill="rgb(var(--color-primary))"
                      fontFamily="monospace" fontSize={12} fontWeight={600}
                      initial={{ x: atom.x, y: atom.y }}
                      animate={{ x: translate!.x, y: translate!.y }}
                      transition={moveTrans}
                    >
                      {atom.symbol}
                    </motion.text>
                    {showCharge && (
                      <motion.text
                        fill="var(--c-halogen)" fontFamily="monospace" fontSize={9}
                        initial={{ x: atom.x + 10, y: atom.y - 10 }}
                        animate={{ x: translate!.x + 10, y: translate!.y - 10 }}
                        transition={moveTrans}
                      >
                        {atom.charge}
                      </motion.text>
                    )}
                    {atom.label && (
                      <motion.text
                        textAnchor="middle"
                        fill="rgb(var(--color-primary))" fillOpacity={0.45}
                        fontFamily="monospace" fontSize={8}
                        initial={{ x: atom.x + off.dx, y: atom.y + off.dy }}
                        animate={{ x: translate!.x + off.dx, y: translate!.y + off.dy }}
                        transition={moveTrans}
                      >
                        {atom.label}
                      </motion.text>
                    )}
                  </>
                ) : (
                  // Static atom — plain SVG, cannot animate under any circumstance
                  <>
                    <circle
                      cx={atom.x} cy={atom.y} r={14}
                      fill="rgb(var(--color-surface))"
                      stroke="rgba(var(--overlay),0.2)" strokeWidth={1.5}
                    />
                    <text
                      x={atom.x} y={atom.y}
                      textAnchor="middle" dominantBaseline="central"
                      fill="rgb(var(--color-primary))"
                      fontFamily="monospace" fontSize={12} fontWeight={600}
                    >
                      {atom.symbol}
                    </text>
                    {showCharge && (
                      <text
                        x={atom.x + 10} y={atom.y - 10}
                        fill="var(--c-halogen)" fontFamily="monospace" fontSize={9}
                      >
                        {atom.charge}
                      </text>
                    )}
                    {atom.label && (
                      <text
                        x={atom.x + off.dx} y={atom.y + off.dy}
                        textAnchor="middle"
                        fill="rgb(var(--color-primary))" fillOpacity={0.45}
                        fontFamily="monospace" fontSize={8}
                      >
                        {atom.label}
                      </text>
                    )}
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handlePlay}
          className="rounded-sm border border-border font-sans text-sm px-3 py-1"
          style={{ background: playBg }}
        >
          {allStepsPlayed && !playing ? '↺ Replay' : '▶ Play'}
        </button>
        {steps.map((_, i) => {
          const isActive = i === currentStep
          return (
            <button
              key={i}
              onClick={() => handleStepClick(i)}
              className="w-7 h-7 rounded-sm font-mono text-xs border flex items-center justify-center"
              style={isActive ? { background: activeTint, borderColor: activeBorder, color: 'var(--c-halogen)' } : { borderColor: 'rgb(var(--color-border))' }}
            >
              {i + 1}
            </button>
          )
        })}
        <span className="ml-auto font-mono text-xs opacity-50">
          Step {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Step description */}
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-sm border border-border p-3 bg-[rgb(var(--color-raised))]"
          >
            <div className="font-sans text-sm font-semibold text-bright mb-1">
              Step {step.step}: {step.label}
            </div>
            <div className="font-sans text-sm text-secondary">{step.description}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result panel — appears after full playthrough */}
      <AnimatePresence>
        {allStepsPlayed && !playing && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="rounded-sm border p-3 flex flex-col gap-1"
            style={{
              background: 'color-mix(in srgb, var(--c-noble) 8%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-noble) 30%, transparent)',
            }}
          >
            <span className="font-mono text-[10px] tracking-widest uppercase opacity-50">Result</span>
            <span className="font-mono text-sm text-bright">
              {reaction.reactants} → {reaction.products}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Energy diagram */}
      {!compact && reaction.energyDiagram.length >= 2 && (
        <div className="rounded-sm border border-border p-2 bg-[rgb(var(--color-raised))]">
          <EnergyDiagram points={reaction.energyDiagram} />
        </div>
      )}
    </div>
  )
}

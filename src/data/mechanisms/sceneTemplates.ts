// Chemistry-aware scene builders. Each returns a complete MoleculeScene
// with atoms placed at correct geometric angles — no hand-coded coordinates.

import { SceneBuilder } from './sceneBuilder'
import { polar, BOND_LENGTH } from './geometry'
import type { MoleculeScene, AtomRole } from './types'

type SubstituentDef = {
  id: string
  symbol: string
  slot: 'left' | 'right' | 'top' | 'bottom' | 'wedge' | 'dash'
  charge?: string
  label?: string
  role?: AtomRole
  bondStyle?: 'solid' | 'dashed' | 'wedge' | 'dash-wedge'
}

type ReagentDef = {
  id: string
  symbol: string
  x: number
  y: number
  charge?: string
  label?: string
  role?: AtomRole
}

// SVG angles: 0°=right, 90°=down, 180°=left, 270°=up
const SLOT_ANGLES: Record<string, number> = {
  right:  0,
  bottom: 90,
  left:   180,
  top:    270,
  wedge:  44,   // lower-right, toward viewer
  dash:   136,  // lower-left, away from viewer
}

const SLOT_BOND_STYLE: Record<string, 'solid' | 'dashed' | 'wedge' | 'dash-wedge'> = {
  right:  'solid',
  bottom: 'solid',
  left:   'solid',
  top:    'solid',
  wedge:  'wedge',
  dash:   'dash-wedge',
}

// Tetrahedral sp³ carbon with up to 4 substituents + optional reagents at absolute positions.
// Atom id for the central carbon is 'center'.
export function sp3CarbonScene(opts: {
  centerX?: number
  centerY?: number
  centerSymbol?: string
  centerRole?: AtomRole
  substituents: SubstituentDef[]
  reagents?: ReagentDef[]
  width?: number
  height?: number
}): MoleculeScene {
  const cx = opts.centerX ?? 350
  const cy = opts.centerY ?? 160
  const sb = new SceneBuilder(opts.width ?? 700, opts.height ?? 320)

  sb.atom('center', opts.centerSymbol ?? 'C', cx, cy, { role: opts.centerRole })

  for (const sub of opts.substituents) {
    const angleDeg = SLOT_ANGLES[sub.slot]
    const bStyle   = sub.bondStyle ?? SLOT_BOND_STYLE[sub.slot]
    sb.atomFrom(sub.id, sub.symbol, 'center', angleDeg, BOND_LENGTH, {
      charge: sub.charge, label: sub.label, role: sub.role,
    })
    sb.bond(`center-${sub.id}`, 'center', sub.id, 1, bStyle)
  }

  if (opts.reagents) {
    for (const r of opts.reagents) {
      sb.atom(r.id, r.symbol, r.x, r.y, { charge: r.charge, label: r.label, role: r.role })
    }
  }

  return sb.build()
}

// Trigonal sp² alkene (C=C) with substituents at the four open positions.
// Atom ids: 'c1', 'c2' for the double-bond carbons.
export function alkeneScene(opts: {
  c1X?: number; c1Y?: number
  c2X?: number; c2Y?: number
  c1Top?:    { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }
  c1Bottom?: { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }
  c2Top?:    { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }
  c2Bottom?: { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }
  reagents?: ReagentDef[]
  width?: number; height?: number
}): MoleculeScene {
  const c1x = opts.c1X ?? 250, c1y = opts.c1Y ?? 160
  const c2x = opts.c2X ?? 450, c2y = opts.c2Y ?? 160
  const sb  = new SceneBuilder(opts.width ?? 700, opts.height ?? 320)

  sb.atom('c1', 'C', c1x, c1y)
  sb.atom('c2', 'C', c2x, c2y)
  sb.bond('c1-c2', 'c1', 'c2', 2)

  // sp² substituent angles: 120° spacing (SVG coords)
  // For c1: bond to c2 is at 0°; substituents at 240° (upper-left) and 120° (lower-left)
  // For c2: bond to c1 is at 180°; substituents at 300° (upper-right) and 60° (lower-right)
  if (opts.c1Top)    { sb.atomFrom(opts.c1Top.id,    opts.c1Top.symbol,    'c1', 240, BOND_LENGTH, opts.c1Top);    sb.connect('c1', opts.c1Top.id) }
  if (opts.c1Bottom) { sb.atomFrom(opts.c1Bottom.id, opts.c1Bottom.symbol, 'c1', 120, BOND_LENGTH, opts.c1Bottom); sb.connect('c1', opts.c1Bottom.id) }
  if (opts.c2Top)    { sb.atomFrom(opts.c2Top.id,    opts.c2Top.symbol,    'c2', 300, BOND_LENGTH, opts.c2Top);    sb.connect('c2', opts.c2Top.id) }
  if (opts.c2Bottom) { sb.atomFrom(opts.c2Bottom.id, opts.c2Bottom.symbol, 'c2',  60, BOND_LENGTH, opts.c2Bottom); sb.connect('c2', opts.c2Bottom.id) }

  if (opts.reagents) {
    for (const r of opts.reagents) {
      sb.atom(r.id, r.symbol, r.x, r.y, { charge: r.charge, label: r.label, role: r.role })
    }
  }

  return sb.build()
}

// Linear sp alkyne (C≡C). Same layout as alkeneScene but with order 3.
export function alkyneScene(opts: Parameters<typeof alkeneScene>[0]): MoleculeScene {
  const scene = alkeneScene(opts)
  // Upgrade the c1-c2 bond to triple
  const bond = scene.bonds.find(b => b.id === 'c1-c2')
  if (bond) bond.order = 3
  return scene
}

// Benzene ring at the center, atom ids 'b1'–'b6', substituent slots at each ring position.
export function benzeneScene(opts: {
  centerX?: number; centerY?: number; radius?: number
  substituents?: Partial<Record<'ipso' | 'ortho1' | 'ortho2' | 'meta1' | 'meta2' | 'para',
    { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }>>
  reagents?: ReagentDef[]
  width?: number; height?: number
}): MoleculeScene {
  const cx = opts.centerX ?? 350, cy = opts.centerY ?? 160, r = opts.radius ?? 60
  const subR = 80
  const sb = new SceneBuilder(opts.width ?? 700, opts.height ?? 320)

  // 6 ring carbons, starting at top (270°), going clockwise
  const ringAngles = [270, 330, 30, 90, 150, 210]
  for (let i = 0; i < 6; i++) {
    const p = polar({ x: cx, y: cy }, ringAngles[i], r)
    sb.atom(`b${i + 1}`, 'C', p.x, p.y)
  }
  for (let i = 0; i < 6; i++) {
    sb.bond(`b${i+1}-b${(i+1)%6+1}`, `b${i+1}`, `b${(i+1)%6+1}`, i % 2 === 0 ? 1 : 2)
  }

  // Substituent slot → ring carbon mapping (b1 = ipso at top)
  const slotToCarbon: Record<string, string> = {
    ipso: 'b1', ortho1: 'b2', meta1: 'b3', para: 'b4', meta2: 'b5', ortho2: 'b6',
  }
  if (opts.substituents) {
    for (const [slot, sub] of Object.entries(opts.substituents)) {
      if (!sub) continue
      const bId = slotToCarbon[slot]
      const bAtom = sb.getAtom(bId)
      const angle = Math.atan2(bAtom.y - cy, bAtom.x - cx) * (180 / Math.PI)
      sb.atomFrom(sub.id, sub.symbol, bId, angle, subR, { charge: sub.charge, label: sub.label, role: sub.role })
      sb.connect(bId, sub.id)
    }
  }

  if (opts.reagents) {
    for (const r of opts.reagents) {
      sb.atom(r.id, r.symbol, r.x, r.y, { charge: r.charge, label: r.label, role: r.role })
    }
  }

  return sb.build()
}

// Trigonal carbonyl C=O. Atom ids: 'c_carbonyl', 'o_carbonyl'.
export function carbonylScene(opts: {
  cX?: number; cY?: number
  leftR?:  { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }
  rightR?: { id: string; symbol: string; charge?: string; label?: string; role?: AtomRole }
  reagents?: ReagentDef[]
  width?: number; height?: number
}): MoleculeScene {
  const cx = opts.cX ?? 350, cy = opts.cY ?? 160
  const sb = new SceneBuilder(opts.width ?? 700, opts.height ?? 320)

  sb.atom('c_carbonyl', 'C', cx, cy, { role: 'carbonyl_carbon' })
  sb.atomFrom('o_carbonyl', 'O', 'c_carbonyl', 270, BOND_LENGTH, { role: 'carbonyl_oxygen' })
  sb.bond('c-o', 'c_carbonyl', 'o_carbonyl', 2)

  if (opts.leftR)  { sb.atomFrom(opts.leftR.id,  opts.leftR.symbol,  'c_carbonyl', 210, BOND_LENGTH, opts.leftR);  sb.connect('c_carbonyl', opts.leftR.id) }
  if (opts.rightR) { sb.atomFrom(opts.rightR.id, opts.rightR.symbol, 'c_carbonyl', 330, BOND_LENGTH, opts.rightR); sb.connect('c_carbonyl', opts.rightR.id) }

  if (opts.reagents) {
    for (const r of opts.reagents) {
      sb.atom(r.id, r.symbol, r.x, r.y, { charge: r.charge, label: r.label, role: r.role })
    }
  }

  return sb.build()
}

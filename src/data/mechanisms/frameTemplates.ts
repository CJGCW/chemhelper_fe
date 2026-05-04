// Frame templates for mechanism visualization.
// Each function returns a complete MechanismFrame — pre-positioned atoms, bonds,
// and overlay arrows for one discrete chemical state.
// No runtime mutation; the player crossfades between frames.

import { BOND_LENGTH } from './geometry'
import type { MechanismFrame, CurvedArrowOverlay, AtomPosition, BondPosition, AtomRole } from './types'

// ── Shared types ──────────────────────────────────────────────────────────────

export type SubInfo = {
  id: string
  symbol: string
  charge?: string
  label?: string
  role?: AtomRole
  glow?: boolean
}

export type ReagentInfo = {
  id: string
  symbol: string
  x: number
  y: number
  charge?: string
  label?: string
  glow?: boolean
  role?: AtomRole
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

// Standard alkene carbon positions, centered in 700×320 canvas
export const C1X = 265, C1Y = 175
export const C2X = 435, C2Y = 175

function mk(
  id: string, symbol: string, x: number, y: number,
  extras: Partial<Pick<AtomPosition, 'charge' | 'label' | 'role' | 'glow'>> = {}
): AtomPosition {
  return { id, symbol, x: Math.round(x), y: Math.round(y), ...extras }
}

function bd(
  id: string, from: string, to: string,
  order: 1 | 2 | 3 = 1,
  style: BondPosition['style'] = 'solid'
): BondPosition {
  return { id, from, to, order, style }
}

function p(anchor: { x: number; y: number }, angleDeg: number, dist = BOND_LENGTH): { x: number; y: number } {
  const rad = angleDeg * Math.PI / 180
  return { x: anchor.x + Math.cos(rad) * dist, y: anchor.y + Math.sin(rad) * dist }
}

type SubPlacement = [SubInfo | undefined, { x: number; y: number }, string]

function applySubs(atoms: AtomPosition[], bonds: BondPosition[], placements: SubPlacement[]): void {
  for (const [sub, pos, parentId] of placements) {
    if (!sub) continue
    atoms.push(mk(sub.id, sub.symbol, pos.x, pos.y, sub))
    bonds.push(bd(`${parentId}-${sub.id}`, parentId, sub.id))
  }
}

// ── Alkene reactant frame ─────────────────────────────────────────────────────
// Standard sp² alkene (C=C) with optional approaching reagent atoms.
// sp² angles: c1 subs at 240°/120°, c2 subs at 300°/60°

export function alkeneReactantFrame(opts: {
  c1Top?: SubInfo; c1Bottom?: SubInfo
  c2Top?: SubInfo; c2Bottom?: SubInfo
  reagents?: ReagentInfo[]
  arrows?: CurvedArrowOverlay[]
  description: string
  shortLabel: string
  caption?: string
}): MechanismFrame {
  const c1 = { x: C1X, y: C1Y }
  const c2 = { x: C2X, y: C2Y }
  const atoms: AtomPosition[] = [mk('c1', 'C', c1.x, c1.y), mk('c2', 'C', c2.x, c2.y)]
  const bonds: BondPosition[] = [bd('c1-c2', 'c1', 'c2', 2)]

  applySubs(atoms, bonds, [
    [opts.c1Top,    p(c1, 240), 'c1'],
    [opts.c1Bottom, p(c1, 120), 'c1'],
    [opts.c2Top,    p(c2, 300), 'c2'],
    [opts.c2Bottom, p(c2,  60), 'c2'],
  ])

  if (opts.reagents) {
    for (const r of opts.reagents) atoms.push(mk(r.id, r.symbol, r.x, r.y, r))
  }

  return {
    atoms, bonds, arrows: opts.arrows ?? [],
    description: opts.description, shortLabel: opts.shortLabel,
    ...(opts.caption ? { caption: opts.caption } : {}),
  }
}

// ── Alkyne reactant frame ─────────────────────────────────────────────────────
// Like alkeneReactantFrame but the c1-c2 bond is order 3 (triple).

export function alkyneReactantFrame(opts: Parameters<typeof alkeneReactantFrame>[0]): MechanismFrame {
  const frame = alkeneReactantFrame(opts)
  const bond = frame.bonds.find(b => b.id === 'c1-c2')
  if (bond) bond.order = 3
  return frame
}

// ── Bromonium-like frame ──────────────────────────────────────────────────────
// Cyclic 3-membered ring: c1-bridge-c2. Bridge atom (Br⁺, Hg²⁺, …) floats above
// the c1-c2 axis. c1 and c2 are sp3 with substituents at fixed positions.

export function bromoniumLikeFrame(opts: {
  bridgeId: string
  bridgeSymbol: string
  bridgeCharge?: string
  c1Top?: SubInfo; c1Bottom?: SubInfo
  c2Top?: SubInfo; c2Bottom?: SubInfo
  // Optional nucleophile approaching from below (shown in this frame, attacks next)
  attacker?: ReagentInfo
  arrows?: CurvedArrowOverlay[]
  description: string
  shortLabel: string
  caption?: string
}): MechanismFrame {
  // c1-c2 sit slightly below center to leave room for the bridge above
  const c1 = { x: 270, y: 205 }
  const c2 = { x: 430, y: 205 }
  const bridge = { x: 350, y: 110 }

  const atoms: AtomPosition[] = [
    mk('c1', 'C', c1.x, c1.y),
    mk('c2', 'C', c2.x, c2.y),
    mk(opts.bridgeId, opts.bridgeSymbol, bridge.x, bridge.y, {
      charge: opts.bridgeCharge, glow: true,
    }),
  ]
  const bonds: BondPosition[] = [
    bd('c1-c2', 'c1', 'c2', 1),
    bd(`c1-${opts.bridgeId}`, 'c1', opts.bridgeId),
    bd(`c2-${opts.bridgeId}`, 'c2', opts.bridgeId),
  ]

  // sp3-like subs: c1 upper-left / lower-left, c2 upper-right / lower-right
  applySubs(atoms, bonds, [
    [opts.c1Top,    { x: 188, y: 128 }, 'c1'],
    [opts.c1Bottom, { x: 188, y: 268 }, 'c1'],
    [opts.c2Top,    { x: 512, y: 128 }, 'c2'],
    [opts.c2Bottom, { x: 512, y: 268 }, 'c2'],
  ])

  if (opts.attacker) {
    atoms.push(mk(opts.attacker.id, opts.attacker.symbol, opts.attacker.x, opts.attacker.y, opts.attacker))
  }

  return {
    atoms, bonds, arrows: opts.arrows ?? [],
    description: opts.description, shortLabel: opts.shortLabel,
    ...(opts.caption ? { caption: opts.caption } : {}),
  }
}

// ── Carbocation frame ─────────────────────────────────────────────────────────
// sp² carbocation. The cation C has 3 bonds at sp² angles; the other C is sp3.
// `cationOn: 1 | 2` selects which carbon carries the +.
// `addedH` places an H that was bonded to the non-cation C in this step.

export function carbocationFrame(opts: {
  cationOn: 1 | 2
  c1Top?: SubInfo; c1Bottom?: SubInfo
  c2Top?: SubInfo; c2Bottom?: SubInfo
  // H that just bonded to the non-cation carbon (slot: upper = 315° from c1, or 225° from c2)
  addedH?: { onCarbon: 1 | 2 }
  reagents?: ReagentInfo[]
  arrows?: CurvedArrowOverlay[]
  description: string
  shortLabel: string
  caption?: string
}): MechanismFrame {
  const c1 = { x: C1X, y: C1Y }
  const c2 = { x: C2X, y: C2Y }
  const atoms: AtomPosition[] = [
    mk('c1', 'C', c1.x, c1.y, opts.cationOn === 1 ? { charge: '+', glow: true } : {}),
    mk('c2', 'C', c2.x, c2.y, opts.cationOn === 2 ? { charge: '+', glow: true } : {}),
  ]
  const bonds: BondPosition[] = [bd('c1-c2', 'c1', 'c2', 1)]

  applySubs(atoms, bonds, [
    [opts.c1Top,    p(c1, 240), 'c1'],
    [opts.c1Bottom, p(c1, 120), 'c1'],
    [opts.c2Top,    p(c2, 300), 'c2'],
    [opts.c2Bottom, p(c2,  60), 'c2'],
  ])

  if (opts.addedH) {
    // Place added H in the slot that faces away from the other carbon
    const onC2 = opts.addedH.onCarbon === 2
    const anchor = onC2 ? c2 : c1
    // For c1: H goes at 315° (upper-right, toward c2 side but above)
    // For c2: H goes at 225° (upper-left, toward c1 side but above)
    const angleDeg = onC2 ? 225 : 315
    const pos = p(anchor, angleDeg)
    atoms.push(mk('h_added', 'H', pos.x, pos.y))
    bonds.push(bd(`${onC2 ? 'c2' : 'c1'}-h_added`, onC2 ? 'c2' : 'c1', 'h_added'))
  }

  if (opts.reagents) {
    for (const r of opts.reagents) atoms.push(mk(r.id, r.symbol, r.x, r.y, r))
  }

  return {
    atoms, bonds, arrows: opts.arrows ?? [],
    description: opts.description, shortLabel: opts.shortLabel,
    ...(opts.caption ? { caption: opts.caption } : {}),
  }
}

// ── Addition product frame ────────────────────────────────────────────────────
// sp3 product after addition across C=C or C≡C.
// Bond styles control stereo: 'wedge' = toward viewer, 'dash-wedge' = away.

export function additionProductFrame(opts: {
  c1Top?: SubInfo; c1Bottom?: SubInfo
  c2Top?: SubInfo; c2Bottom?: SubInfo
  c1TopStyle?: BondPosition['style']
  c1BottomStyle?: BondPosition['style']
  c2TopStyle?: BondPosition['style']
  c2BottomStyle?: BondPosition['style']
  arrows?: CurvedArrowOverlay[]
  description: string
  shortLabel: string
  caption?: string
}): MechanismFrame {
  const c1 = { x: C1X, y: C1Y }
  const c2 = { x: C2X, y: C2Y }
  const atoms: AtomPosition[] = [mk('c1', 'C', c1.x, c1.y), mk('c2', 'C', c2.x, c2.y)]
  const bonds: BondPosition[] = [bd('c1-c2', 'c1', 'c2', 1)]

  const placements: Array<[SubInfo | undefined, { x: number; y: number }, string, BondPosition['style']]> = [
    [opts.c1Top,    p(c1, 240), 'c1', opts.c1TopStyle    ?? 'solid'],
    [opts.c1Bottom, p(c1, 120), 'c1', opts.c1BottomStyle ?? 'solid'],
    [opts.c2Top,    p(c2, 300), 'c2', opts.c2TopStyle    ?? 'solid'],
    [opts.c2Bottom, p(c2,  60), 'c2', opts.c2BottomStyle ?? 'solid'],
  ]
  for (const [sub, pos, parentId, style] of placements) {
    if (!sub) continue
    atoms.push(mk(sub.id, sub.symbol, pos.x, pos.y, sub))
    bonds.push(bd(`${parentId}-${sub.id}`, parentId, sub.id, 1, style))
  }

  return {
    atoms, bonds, arrows: opts.arrows ?? [],
    description: opts.description, shortLabel: opts.shortLabel,
    ...(opts.caption ? { caption: opts.caption } : {}),
  }
}

// ── Syn addition product ──────────────────────────────────────────────────────
// Both new groups on the same face (syn delivery). New groups placed in 'bottom'
// slot (120° from c1, 60° from c2) as wedge bonds.

export function synAdditionProductFrame(opts: {
  c1Orig?: SubInfo
  c1New: SubInfo
  c2Orig?: SubInfo
  c2New: SubInfo
  arrows?: CurvedArrowOverlay[]
  description: string
  shortLabel: string
  caption?: string
}): MechanismFrame {
  return additionProductFrame({
    c1Top: opts.c1Orig,
    c1Bottom: opts.c1New,
    c2Top: opts.c2Orig,
    c2Bottom: opts.c2New,
    c1BottomStyle: 'wedge',
    c2BottomStyle: 'wedge',
    arrows: opts.arrows,
    description: opts.description,
    shortLabel: opts.shortLabel,
    caption: opts.caption,
  })
}

// ── Anti addition product ─────────────────────────────────────────────────────
// New groups on opposite faces (anti addition). c1New = wedge, c2New = dash-wedge.

export function antiAdditionProductFrame(opts: {
  c1Orig?: SubInfo
  c1New: SubInfo
  c2Orig?: SubInfo
  c2New: SubInfo
  arrows?: CurvedArrowOverlay[]
  description: string
  shortLabel: string
  caption?: string
}): MechanismFrame {
  return additionProductFrame({
    c1Top: opts.c1Orig,
    c1Bottom: opts.c1New,
    c2Top: opts.c2Orig,
    c2Bottom: opts.c2New,
    c1BottomStyle: 'wedge',
    c2BottomStyle: 'dash-wedge',
    arrows: opts.arrows,
    description: opts.description,
    shortLabel: opts.shortLabel,
    caption: opts.caption,
  })
}

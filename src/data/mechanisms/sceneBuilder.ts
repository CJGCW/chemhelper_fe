// Fluent API for building mechanism scenes and computing animation coordinates from atom IDs.
// No raw pixel coordinates in calling code — positions are derived from atom IDs.

import type { AtomPosition, BondPosition, MoleculeScene, AnimPrimitive, AtomRole } from './types'
import { polar, arcControl, shortenSegment, ATOM_RADIUS, ARROW_OFFSET } from './geometry'

export class SceneBuilder {
  private _atoms: AtomPosition[] = []
  private _bonds: BondPosition[] = []
  private _width: number
  private _height: number

  constructor(width = 700, height = 320) {
    this._width = width
    this._height = height
  }

  atom(id: string, symbol: string, x: number, y: number, opts?: Partial<Omit<AtomPosition, 'id' | 'symbol' | 'x' | 'y'>>): this {
    this._atoms.push({ id, symbol, x, y, ...opts })
    return this
  }

  // Place an atom relative to an anchor atom via polar coordinates
  atomFrom(id: string, symbol: string, anchorId: string, angleDeg: number, distance: number, opts?: Partial<Omit<AtomPosition, 'id' | 'symbol' | 'x' | 'y'>>): this {
    const anchor = this.getAtom(anchorId)
    const { x, y } = polar(anchor, angleDeg, distance)
    this._atoms.push({ id, symbol, x, y, ...opts })
    return this
  }

  bond(id: string, fromId: string, toId: string, order: 1 | 2 | 3, style?: BondPosition['style']): this {
    this._bonds.push({ id, from: fromId, to: toId, order, ...(style ? { style } : {}) })
    return this
  }

  // Auto-id: "fromId-toId"
  connect(fromId: string, toId: string, order: 1 | 2 | 3 = 1, style?: BondPosition['style']): this {
    return this.bond(`${fromId}-${toId}`, fromId, toId, order, style)
  }

  getAtom(id: string): AtomPosition {
    const atom = this._atoms.find(a => a.id === id)
    if (!atom) throw new Error(`SceneBuilder: atom '${id}' not found`)
    return atom
  }

  build(): MoleculeScene {
    return { atoms: [...this._atoms], bonds: [...this._bonds], width: this._width, height: this._height }
  }
}

// Builds animation primitives from atom IDs — no raw coordinates needed at call sites.
export class ArrowBuilder {
  private scene: MoleculeScene

  constructor(scene: MoleculeScene) {
    this.scene = scene
  }

  private getAtom(id: string): AtomPosition {
    const atom = this.scene.atoms.find(a => a.id === id)
    if (!atom) throw new Error(`ArrowBuilder: atom '${id}' not found`)
    return atom
  }

  private getBond(id: string): BondPosition {
    const bond = this.scene.bonds.find(b => b.id === id)
    if (!bond) throw new Error(`ArrowBuilder: bond '${id}' not found`)
    return bond
  }

  // Curved arrow between two atoms, auto-shortened to atom edges
  fromAtomToAtom(fromId: string, toId: string, opts?: {
    side?: 1 | -1; bow?: number; color?: string; delay?: number; duration?: number
  }): AnimPrimitive {
    const from = this.getAtom(fromId)
    const to   = this.getAtom(toId)
    const seg  = shortenSegment(from, to, ATOM_RADIUS + ARROW_OFFSET, ATOM_RADIUS + 4)
    const control = arcControl(seg.from, seg.to, opts?.side ?? -1, opts?.bow ?? 0.4)
    return { type: 'curved_arrow', from: seg.from, to: seg.to, control, ...this.pickOpts(opts) }
  }

  // Curved arrow from a bond's midpoint to an atom
  fromBondToAtom(bondId: string, toAtomId: string, opts?: {
    side?: 1 | -1; bow?: number; color?: string; delay?: number; duration?: number
  }): AnimPrimitive {
    const bond   = this.getBond(bondId)
    const fAtom  = this.getAtom(bond.from)
    const tAtom  = this.getAtom(bond.to)
    const mid    = { x: (fAtom.x + tAtom.x) / 2, y: (fAtom.y + tAtom.y) / 2 }
    const to     = this.getAtom(toAtomId)
    const seg    = shortenSegment(mid, to, 0, ATOM_RADIUS + 4)
    const control = arcControl(seg.from, seg.to, opts?.side ?? -1, opts?.bow ?? 0.4)
    return { type: 'curved_arrow', from: seg.from, to: seg.to, control, ...this.pickOpts(opts) }
  }

  // Curved arrow starting from a lone pair on an atom (lone pair offset at given angle from atom center)
  fromLonePairToAtom(fromAtomId: string, toAtomId: string, lonePairAngleDeg: number, opts?: {
    bow?: number; color?: string; delay?: number; duration?: number
  }): AnimPrimitive {
    const fromAtom  = this.getAtom(fromAtomId)
    const toAtom    = this.getAtom(toAtomId)
    const lonePair  = polar(fromAtom, lonePairAngleDeg, ATOM_RADIUS + 6)
    const seg       = shortenSegment(lonePair, toAtom, 0, ATOM_RADIUS + 4)
    const control   = arcControl(seg.from, seg.to, -1, opts?.bow ?? 0.35)
    return { type: 'curved_arrow', from: seg.from, to: seg.to, control, ...this.pickOpts(opts) }
  }

  // atom_translate using targetId (ID-based, no distance matching)
  translateAtom(atomId: string, toX: number, toY: number, opts?: { duration?: number; delay?: number }): AnimPrimitive {
    const atom = this.getAtom(atomId)
    return {
      type: 'atom_translate',
      targetId: atomId,
      from: { x: atom.x, y: atom.y },
      to: { x: toX, y: toY },
      ...(opts?.duration !== undefined ? { duration: opts.duration } : {}),
      ...(opts?.delay    !== undefined ? { delay:    opts.delay    } : {}),
    }
  }

  // atom_translate relative to current position
  translateAtomBy(atomId: string, dx: number, dy: number, opts?: { duration?: number; delay?: number }): AnimPrimitive {
    const atom = this.getAtom(atomId)
    return this.translateAtom(atomId, atom.x + dx, atom.y + dy, opts)
  }

  private pickOpts(opts?: { color?: string; delay?: number; duration?: number }) {
    return {
      ...(opts?.color    ? { color:    opts.color    } : {}),
      ...(opts?.delay    !== undefined ? { delay:    opts.delay    } : {}),
      ...(opts?.duration !== undefined ? { duration: opts.duration } : {}),
    }
  }
}

// Scene helper functions for role-based atom lookup
export function findByRole(scene: MoleculeScene, role: AtomRole): AtomPosition[] {
  return scene.atoms.filter(a => a.role === role)
}

export function getNucleophile(scene: MoleculeScene): AtomPosition | undefined {
  return scene.atoms.find(a => a.role === 'nucleophile')
}

export function getLeavingGroup(scene: MoleculeScene): AtomPosition | undefined {
  return scene.atoms.find(a => a.role === 'leaving_group')
}

export function getMoreSubstituted(scene: MoleculeScene): AtomPosition | undefined {
  return scene.atoms.find(a => a.role === 'more_substituted')
}

export function getLessSubstituted(scene: MoleculeScene): AtomPosition | undefined {
  return scene.atoms.find(a => a.role === 'less_substituted')
}

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { LewisStructure } from '../../pages/LewisPage'

// ── Exported types ────────────────────────────────────────────────────────────

export interface CanvasAtom {
  id: string
  element: string
  x: number
  y: number
  lonePairs: number
}

export interface CanvasBond {
  id: string
  from: string
  to: string
  order: 1 | 2 | 3
}

export interface LewisEditorHandle {
  submitSilently(): Promise<{ passed: boolean; atoms: CanvasAtom[]; bonds: CanvasBond[] } | null>
}

// ── Visual constants (matching LewisStructureDiagram) ────────────────────────

const CANVAS_BG   = '#0b0e17'
const BOND_COLOR  = 'rgba(226,232,240,0.70)'
const BOND_W      = 1.5
const BOND_OFFSET = 4
const LP_R        = 1.3
const LP_DOT_SEP  = 2.5
const LP_OFFSET   = 15

const ELEM_COLORS: Record<string, string> = {
  H: '#9ca3af', C: '#e2e8f0', N: '#6ea8fe', O: '#f87171',
  F: '#4ade80', Cl: '#4ade80', Br: '#fb923c', I: '#c084fc',
  S: '#fbbf24', P: '#fb923c', Na: '#a78bfa', K: '#818cf8',
  Li: '#c084fc', Ca: '#94a3b8', Mg: '#6ee7b7', Al: '#94a3b8',
  Si: '#a8a29e', B: '#fb923c', Xe: '#60a5fa',
}

const COMMON_ELEMENTS = ['H', 'C', 'N', 'O', 'F', 'Cl', 'S', 'P', 'Br', 'I', 'B']

function atomMetrics(el: string) {
  if (el === 'H')      return { hw: 8,  hh: 10, fs: 13, trim: 10 }
  if (el.length === 1) return { hw: 11, hh: 11, fs: 17, trim: 13 }
  return                      { hw: 15, hh: 11, fs: 14, trim: 17 }
}
function getColor(el: string) { return ELEM_COLORS[el] ?? '#60a5fa' }

// ── Interaction constants ────────────────────────────────────────────────────

const ATOM_HIT    = 16   // hit radius for atoms
const BOND_HIT    = 8    // max perp distance for bond click
const DRAG_THRESH = 5    // px before press becomes drag

// ── Chemistry helpers ────────────────────────────────────────────────────────

const VALENCE: Record<string, number> = {
  H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
  K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
  Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 5, Te: 6, I: 7, Xe: 8,
}

function computeFC(atom: CanvasAtom, bonds: CanvasBond[]): number {
  const degree = bonds
    .filter(b => b.from === atom.id || b.to === atom.id)
    .reduce((s, b) => s + b.order, 0)
  return (VALENCE[atom.element] ?? 4) - atom.lonePairs * 2 - degree
}

// ── LP angle helpers (matching LewisStructureDiagram) ────────────────────────

function getLonePairAngles(bondAngles: number[], count: number): number[] {
  if (count === 0) return []
  if (bondAngles.length === 0)
    return Array.from({ length: count }, (_, i) => (360 * i) / count)
  const total = bondAngles.length + count
  const step  = 360 / total
  const norm  = (a: number) => ((a % 360) + 360) % 360
  const angDiff = (a: number, b: number) => { const d = norm(a - b); return d > 180 ? 360 - d : d }
  const normBonds = bondAngles.map(norm)
  let bestOffset = normBonds[0], bestError = Infinity
  for (const anchor of normBonds) {
    for (let slot = 0; slot < total; slot++) {
      const offset = anchor - slot * step
      let error = 0
      for (const ba of normBonds) {
        const nearest = Math.round(norm(ba - offset) / step)
        error += angDiff(ba, offset + nearest * step) ** 2
      }
      if (error < bestError) { bestError = error; bestOffset = offset }
    }
  }
  const grid     = Array.from({ length: total }, (_, i) => norm(bestOffset + i * step))
  const occupied = new Set<number>()
  for (const ba of normBonds) {
    let best = -1, minD = Infinity
    for (let i = 0; i < grid.length; i++) {
      if (occupied.has(i)) continue
      const d = angDiff(ba, grid[i])
      if (d < minD) { minD = d; best = i }
    }
    if (best >= 0) occupied.add(best)
  }
  return grid.filter((_, i) => !occupied.has(i))
}

function bestChargeAngle(occ: number[]): number {
  if (occ.length === 0) return -45
  const norm = (a: number) => ((a % 360) + 360) % 360
  const diff = (a: number, b: number) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d }
  let best = -45, bestMin = -1
  for (let a = 0; a < 360; a += 10) {
    const m = Math.min(...occ.map(o => diff(a, o)))
    if (m > bestMin) { bestMin = m; best = a }
  }
  return best
}

// ── Hit testing ──────────────────────────────────────────────────────────────

function getAtomAt(atoms: CanvasAtom[], x: number, y: number): CanvasAtom | null {
  for (const a of atoms)
    if (Math.hypot(a.x - x, a.y - y) < ATOM_HIT) return a
  return null
}

// Larger sticky zone that includes the LP/delete overlay above the atom.
// Keeps hover alive when the cursor moves from the atom symbol up to the controls.
function inHoverZone(atom: CanvasAtom, x: number, y: number): boolean {
  if (Math.hypot(atom.x - x, atom.y - y) < ATOM_HIT) return true
  const { hw, hh } = atomMetrics(atom.element)
  // overlay spans: x from (atom.x - 28) to (atom.x + hw + 18), y from (atom.y - hh - 26) to (atom.y + ATOM_HIT)
  return x >= atom.x - 28 && x <= atom.x + hw + 18
      && y >= atom.y - hh - 26 && y <= atom.y + ATOM_HIT
}

function getBondAt(bonds: CanvasBond[], atoms: CanvasAtom[], x: number, y: number): CanvasBond | null {
  const byId = Object.fromEntries(atoms.map(a => [a.id, a]))
  for (const b of bonds) {
    const a1 = byId[b.from], a2 = byId[b.to]
    if (!a1 || !a2) continue
    const dx = a2.x - a1.x, dy = a2.y - a1.y
    const len = Math.hypot(dx, dy); if (len < 1) continue
    const t = ((x - a1.x) * dx + (y - a1.y) * dy) / (len * len)
    if (t < 0.05 || t > 0.95) continue
    if (Math.hypot(a1.x + t * dx - x, a1.y + t * dy - y) < BOND_HIT) return b
  }
  return null
}

function svgCoords(e: React.PointerEvent, el: SVGSVGElement) {
  const r = el.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

// ── Initial layout ────────────────────────────────────────────────────────────

function lineLayout(elems: { element: string }[], cx: number, cy: number): CanvasAtom[] {
  if (elems.length === 0) return []
  if (elems.length === 1) return [{ id: 'a0', element: elems[0].element, x: cx, y: cy, lonePairs: 0 }]
  const spacing = 70
  const totalW = (elems.length - 1) * spacing
  return elems.map((e, i) => ({
    id: `a${i}`, element: e.element,
    x: cx - totalW / 2 + i * spacing,
    y: cy,
    lonePairs: 0,
  }))
}

// ── Validation ────────────────────────────────────────────────────────────────

interface Check  { label: string; passed: boolean; detail: string }
interface VResult { passed: boolean; checks: Check[] }

function countBy<T>(arr: T[], key: (v: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const v of arr) { const k = key(v); out[k] = (out[k] ?? 0) + 1 }
  return out
}
function arrEq<T>(a: T[], b: T[]) { return a.length === b.length && a.every((v, i) => v === b[i]) }
function leByElem(items: { element: string; le: number }[]) {
  const out: Record<string, number[]> = {}
  for (const { element, le } of items) (out[element] ??= []).push(le)
  for (const k of Object.keys(out)) out[k].sort((a, b) => a - b)
  return out
}
function fmtElems(m: Record<string, number>) { return Object.entries(m).sort().map(([e, c]) => `${c}×${e}`).join(', ') }
function fmtSigs(s: string[]) { return s.map(x => x.replace(':', ' ×')).join(', ') || 'none' }

function angleBetween(ax: number, ay: number, bx: number, by: number) {
  const mag = Math.hypot(ax, ay) * Math.hypot(bx, by)
  if (mag < 1) return 0
  return Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / mag))) * (180 / Math.PI)
}

function checkGeometry(atoms: CanvasAtom[], bonds: CanvasBond[], geometry: string): Check {
  const adj: Record<string, string[]> = {}
  atoms.forEach(a => { adj[a.id] = [] })
  bonds.forEach(b => { adj[b.from]?.push(b.to); adj[b.to]?.push(b.from) })
  const center = atoms.reduce((best, a) => {
    const nb = adj[a.id]?.length ?? 0, bb = adj[best.id]?.length ?? 0
    if (nb > bb) return a
    if (nb === bb && best.element === 'H' && a.element !== 'H') return a
    return best
  })
  const termIds = adj[center.id] ?? []
  if (termIds.length < 2) return { label: 'Shape', passed: true, detail: 'Not enough bonds to check shape' }
  const byId = Object.fromEntries(atoms.map(a => [a.id, a]))
  const vecs = termIds.map(id => { const p = byId[id] ?? center; return { x: p.x - center.x, y: p.y - center.y } })
  const angles: number[] = []
  for (let i = 0; i < vecs.length; i++)
    for (let j = i + 1; j < vecs.length; j++)
      angles.push(angleBetween(vecs[i].x, vecs[i].y, vecs[j].x, vecs[j].y))
  const maxA = Math.max(...angles), minA = Math.min(...angles)
  const geo = geometry.toLowerCase().replace(/-/g, '_')

  // Universal: no two bonds should point in nearly the same direction
  if (minA < 25)
    return { label: 'Shape', passed: false, detail: `Two bonds overlap (${minA.toFixed(0)}°) — spread atoms apart` }

  if (geo === 'linear' || geo === 'diatomic') {
    return angles[0] >= 150
      ? { label: 'Shape', passed: true,  detail: `Linear — ${angles[0].toFixed(0)}°` }
      : { label: 'Shape', passed: false, detail: `Linear needs ~180°, got ${angles[0].toFixed(0)}° — place atoms on opposite sides` }
  }
  if (geo === 'bent') {
    return angles[0] < 160
      ? { label: 'Shape', passed: true,  detail: `Bent — ${angles[0].toFixed(0)}°` }
      : { label: 'Shape', passed: false, detail: `Bent needs a visible angle, got ${angles[0].toFixed(0)}° — bend the molecule` }
  }
  if (geo === 'trigonal_planar' || geo === 'trigonal_pyramidal') {
    if (maxA >= 165) return { label: 'Shape', passed: false, detail: `Two bonds appear collinear (${maxA.toFixed(0)}°) — spread all three out` }
    if (minA < 55)   return { label: 'Shape', passed: false, detail: `Bonds too crowded (${minA.toFixed(0)}°) — spread more evenly` }
    return { label: 'Shape', passed: true, detail: `Angles OK (${angles.map(a => a.toFixed(0)).join('°, ')}°)` }
  }
  if (geo === 'tetrahedral') {
    if (minA < 50) return { label: 'Shape', passed: false, detail: `Tetrahedral needs bonds spread out (~90° in 2D), min is ${minA.toFixed(0)}° — spread the atoms` }
    return { label: 'Shape', passed: true, detail: `Tetrahedral — angles OK (min ${minA.toFixed(0)}°)` }
  }
  if (geo === 't_shaped') {
    return maxA >= 155
      ? { label: 'Shape', passed: true,  detail: `T-shaped — axial ${maxA.toFixed(0)}°` }
      : { label: 'Shape', passed: false, detail: `T-shaped needs a near-180° pair, got ${maxA.toFixed(0)}°` }
  }
  if (geo === 'square_planar') {
    const col = angles.filter(a => a >= 155).length
    return col >= 2
      ? { label: 'Shape', passed: true,  detail: 'Square planar confirmed' }
      : { label: 'Shape', passed: false, detail: `Square planar needs two opposite pairs, found ${col}` }
  }
  if (geo === 'trigonal_bipyramidal') {
    const axial = angles.filter(a => a >= 150).length
    if (axial < 1) return { label: 'Shape', passed: false, detail: `Trigonal bipyramidal needs an axial pair (~180°), max angle is ${maxA.toFixed(0)}°` }
    if (minA < 40) return { label: 'Shape', passed: false, detail: `Bonds too crowded (${minA.toFixed(0)}°) — spread more evenly` }
    return { label: 'Shape', passed: true, detail: `Trigonal bipyramidal — OK` }
  }
  if (geo === 'octahedral') {
    const col = angles.filter(a => a >= 155).length
    return col >= 3
      ? { label: 'Shape', passed: true,  detail: 'Octahedral confirmed' }
      : { label: 'Shape', passed: false, detail: `Octahedral needs 3 near-180° pairs, found ${col}` }
  }
  // General fallback: just require bonds aren't all bunched up
  if (minA < 40)
    return { label: 'Shape', passed: false, detail: `Bonds too crowded (${minA.toFixed(0)}°) — spread atoms out` }
  return { label: 'Shape', passed: true, detail: `Shape OK (${geometry})` }
}

function validate(atoms: CanvasAtom[], bonds: CanvasBond[], correct: LewisStructure): VResult {
  const checks: Check[] = []
  const byId  = Object.fromEntries(atoms.map(a => [a.id, a.element]))
  const cById = Object.fromEntries(correct.atoms.map(a => [a.id, a.element]))

  const userElems    = countBy(atoms, a => a.element)
  const correctElems = countBy(correct.atoms, a => a.element)
  const elemPass = JSON.stringify(Object.entries(userElems).sort()) === JSON.stringify(Object.entries(correctElems).sort())
  checks.push({ label: 'Atoms', passed: elemPass,
    detail: elemPass ? `Correct — ${fmtElems(correctElems)}` : `Expected ${fmtElems(correctElems)}, got ${fmtElems(userElems)}` })

  const userSigs = bonds.map(b => `${[byId[b.from] ?? '?', byId[b.to] ?? '?'].sort().join('-')}:${b.order}`).sort()
  const corrSigs = correct.bonds.map(b => `${[cById[b.from] ?? '?', cById[b.to] ?? '?'].sort().join('-')}:${b.order}`).sort()
  const bondsPass = arrEq(userSigs, corrSigs)
  checks.push({ label: 'Bonds', passed: bondsPass,
    detail: bondsPass ? `Correct — ${fmtSigs(corrSigs)}` : `Expected [${fmtSigs(corrSigs)}], got [${fmtSigs(userSigs)}]` })

  const userLE = leByElem(atoms.map(a => ({ element: a.element, le: a.lonePairs * 2 })))
  const corrLE = leByElem(correct.atoms.map(a => ({ element: a.element, le: a.lone_pairs * 2 })))
  const lpPass = JSON.stringify(userLE) === JSON.stringify(corrLE)
  checks.push({ label: 'Lone electrons', passed: lpPass,
    detail: lpPass ? 'All lone electrons correct'
      : Object.entries(corrLE).map(([el, arr]) => {
          const got = userLE[el] ?? []
          return arrEq(arr, got) ? null : `${el}: expected [${arr.join(',')}] e⁻, got [${got.join(',')}]`
        }).filter(Boolean).join('; ') || 'Mismatch' })

  const userFC = countBy(atoms.map(a => `${a.element}:${computeFC(a, bonds)}`), s => s)
  const corrFC = countBy(correct.atoms.map(a => `${a.element}:${a.formal_charge}`), s => s)
  const fcPass = JSON.stringify(Object.entries(userFC).sort()) === JSON.stringify(Object.entries(corrFC).sort())
  checks.push({ label: 'Formal charges', passed: fcPass,
    detail: fcPass ? 'Formal charges correct' : "Formal charges don't match — check lone pairs and bond orders" })

  if (elemPass && bondsPass) checks.push(checkGeometry(atoms, bonds, correct.geometry))

  return { passed: checks.every(c => c.passed), checks }
}

// ── SVG sub-components ────────────────────────────────────────────────────────

function BondSvg({ bond, atoms, hovered, onClick }: {
  bond: CanvasBond; atoms: CanvasAtom[]
  hovered: boolean; onClick: () => void
}) {
  const byId = Object.fromEntries(atoms.map(a => [a.id, a]))
  const a1 = byId[bond.from], a2 = byId[bond.to]
  if (!a1 || !a2) return null
  const dx = a2.x - a1.x, dy = a2.y - a1.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len, px = -uy, py = ux
  const r1 = atomMetrics(a1.element).trim, r2 = atomMetrics(a2.element).trim
  const x1 = a1.x + ux * r1, y1 = a1.y + uy * r1
  const x2 = a2.x - ux * r2, y2 = a2.y - uy * r2
  const col = hovered ? 'color-mix(in srgb, var(--c-halogen) 80%, rgba(226,232,240,0.70))' : BOND_COLOR
  const p = { stroke: col, strokeWidth: BOND_W }
  let lines: React.ReactNode
  if (bond.order === 2) {
    const o = BOND_OFFSET
    lines = <><line x1={x1+px*o} y1={y1+py*o} x2={x2+px*o} y2={y2+py*o} {...p}/>
               <line x1={x1-px*o} y1={y1-py*o} x2={x2-px*o} y2={y2-py*o} {...p}/></>
  } else if (bond.order === 3) {
    const o = BOND_OFFSET + 1
    lines = <><line x1={x1} y1={y1} x2={x2} y2={y2} {...p}/>
               <line x1={x1+px*o} y1={y1+py*o} x2={x2+px*o} y2={y2+py*o} {...p}/>
               <line x1={x1-px*o} y1={y1-py*o} x2={x2-px*o} y2={y2-py*o} {...p}/></>
  } else {
    lines = <line x1={x1} y1={y1} x2={x2} y2={y2} {...p}/>
  }
  return (
    <g onClick={e => { e.stopPropagation(); onClick() }} style={{ cursor: 'pointer' }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={16}/>
      {lines}
    </g>
  )
}

function AtomSvg({ atom, allAtoms, bonds, hovered, onLP, onDelete }: {
  atom: CanvasAtom; allAtoms: CanvasAtom[]; bonds: CanvasBond[]
  hovered: boolean; onLP: (d: number) => void; onDelete: () => void
}) {
  const fc = computeFC(atom, bonds)
  const { hw, hh, fs } = atomMetrics(atom.element)
  const color = getColor(atom.element)
  const byId = Object.fromEntries(allAtoms.map(a => [a.id, a]))
  const bondAngles = bonds
    .filter(b => b.from === atom.id || b.to === atom.id)
    .map(b => {
      const o = byId[b.from === atom.id ? b.to : b.from]
      return o ? Math.atan2(o.y - atom.y, o.x - atom.x) * (180 / Math.PI) : 0
    })
  const lpAngles = getLonePairAngles(bondAngles, atom.lonePairs)
  const fcLabel = fc === 0 ? null : fc === 1 ? '+' : fc === -1 ? '−' : fc > 0 ? `+${fc}` : `${fc}`
  const BADGE_R = 5, BADGE_DIST = Math.max(hw, hh) + BADGE_R + 3
  const cAngle = bestChargeAngle([...bondAngles, ...lpAngles])
  const cRad = cAngle * (Math.PI / 180)
  const cbx = atom.x + Math.cos(cRad) * BADGE_DIST, cby = atom.y + Math.sin(cRad) * BADGE_DIST

  return (
    <g>
      {/* Clearance rect */}
      <rect x={atom.x-hw-2} y={atom.y-hh-1} width={(hw+2)*2} height={(hh+1)*2} fill={CANVAS_BG} rx="1"/>

      {/* Element text */}
      <text x={atom.x} y={atom.y} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={fs} fontWeight="700"
        fontFamily="ui-monospace, 'Cascadia Code', 'Fira Code', monospace"
        letterSpacing="-0.02em" style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {atom.element}
      </text>

      {/* Lone pair dots */}
      {lpAngles.map((angle, i) => {
        const rad = angle * (Math.PI / 180)
        const lpx = atom.x + Math.cos(rad) * LP_OFFSET
        const lpy = atom.y + Math.sin(rad) * LP_OFFSET
        const pr = rad + Math.PI / 2
        const ddx = Math.cos(pr) * LP_DOT_SEP, ddy = Math.sin(pr) * LP_DOT_SEP
        return (
          <g key={i} style={{ pointerEvents: 'none' }}>
            <circle cx={lpx+ddx} cy={lpy+ddy} r={LP_R} fill="rgba(255,255,255,0.80)"/>
            <circle cx={lpx-ddx} cy={lpy-ddy} r={LP_R} fill="rgba(255,255,255,0.80)"/>
          </g>
        )
      })}

      {/* Formal charge badge */}
      {fcLabel && (
        <g>
          <circle cx={cbx} cy={cby} r={BADGE_R} fill={CANVAS_BG} stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
          <text x={cbx} y={cby} textAnchor="middle" dominantBaseline="central" dy="-1"
            fill="rgba(255,255,255,0.9)" fontSize={fcLabel.length > 1 ? 6 : 7}
            fontWeight="bold" fontFamily="system-ui, sans-serif"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>
            {fcLabel}
          </text>
        </g>
      )}

      {/* Hover overlay: LP controls + delete */}
      {hovered && (
        <g>
          <rect x={atom.x-26} y={atom.y-hh-22} width={52} height={17} rx={3}
            fill="#1c2030" stroke="#2d3555" strokeWidth={0.75}/>
          <g onClick={e => { e.stopPropagation(); onLP(-1) }} style={{ cursor: 'pointer' }}>
            <rect x={atom.x-26} y={atom.y-hh-22} width={17} height={17} rx={3} fill="transparent"/>
            <text x={atom.x-17} y={atom.y-hh-13} textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.65)" fontSize={14} fontFamily="system-ui" style={{ userSelect: 'none' }}>−</text>
          </g>
          <text x={atom.x} y={atom.y-hh-13} textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.45)" fontSize={9} fontFamily="system-ui"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>
            {atom.lonePairs} LP
          </text>
          <g onClick={e => { e.stopPropagation(); onLP(+1) }} style={{ cursor: 'pointer' }}>
            <rect x={atom.x+9} y={atom.y-hh-22} width={17} height={17} rx={3} fill="transparent"/>
            <text x={atom.x+17} y={atom.y-hh-13} textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.65)" fontSize={11} fontFamily="system-ui" style={{ userSelect: 'none' }}>+</text>
          </g>
          {/* Delete button */}
          <g onClick={e => { e.stopPropagation(); onDelete() }} style={{ cursor: 'pointer' }}>
            <circle cx={atom.x+hw+9} cy={atom.y-hh} r={7} fill="#1c2030" stroke="#2d3555" strokeWidth={0.75}/>
            <text x={atom.x+hw+9} y={atom.y-hh} textAnchor="middle" dominantBaseline="central"
              fill="rgba(248,113,113,0.85)" fontSize={8} fontFamily="system-ui" style={{ userSelect: 'none' }}>✕</text>
          </g>
        </g>
      )}
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  correctStructure:   LewisStructure | null
  onRequestStructure: () => Promise<LewisStructure | null>
  onValidated?:       (passed: boolean) => void
  initialAtoms?:      CanvasAtom[]
  initialBonds?:      CanvasBond[]
  hideCheck?:         boolean
  canvasHeight?:      number
}

const LewisEditor = forwardRef<LewisEditorHandle, Props>(function LewisEditor(
  { correctStructure, onRequestStructure, onValidated, initialAtoms, initialBonds, hideCheck, canvasHeight = 480 },
  ref,
) {
  const svgRef     = useRef<SVGSVGElement>(null)
  const atomIdRef  = useRef(0)
  const bondIdRef  = useRef(0)

  const [atoms, setAtoms] = useState<CanvasAtom[]>(initialAtoms ?? [])
  const [bonds, setBonds] = useState<CanvasBond[]>(initialBonds ?? [])
  const [tool,  setTool]  = useState<'draw' | 'move'>('draw')
  const [activeEl, setActiveEl] = useState('C')
  const [customEl, setCustomEl] = useState('')

  // Pointer press tracking (ref = no stale closure issues in handlers)
  const pressRef = useRef<{
    startX: number; startY: number; pointerId: number; isDrag: boolean
    hitAtomId: string | null; hitBondId: string | null
    moveOffX: number; moveOffY: number
    hitOverlay: boolean
  } | null>(null)

  // Bond drag preview position (state = triggers re-render for the dashed line)
  const [preview, setPreview] = useState<{ fromId: string; x: number; y: number } | null>(null)

  // Hover (refs for keyboard handler; state for rendering)
  const hovAtomRef = useRef<string | null>(null)
  const hovBondRef = useRef<string | null>(null)
  const [hovAtom, setHovAtom] = useState<string | null>(null)
  const [hovBond, setHovBond] = useState<string | null>(null)

  // Atoms/bonds refs for hit testing in handlers without stale closures
  const atomsRef = useRef(atoms)
  const bondsRef = useRef(bonds)
  atomsRef.current = atoms
  bondsRef.current = bonds

  const [validationResult, setValidationResult] = useState<VResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [localStructure, setLocalStructure] = useState<LewisStructure | null>(null)
  // ── Ref handle ──────────────────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    async submitSilently() {
      if (atomsRef.current.length === 0) return null
      const correct = localStructure ?? correctStructure ?? await onRequestStructure()
      if (!correct) return null
      const result = validate(atomsRef.current, bondsRef.current, correct)
      return { passed: result.passed, atoms: atomsRef.current, bonds: bondsRef.current }
    },
  }), [localStructure, correctStructure, onRequestStructure])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function nextAtomId() { return `a${++atomIdRef.current}` }
  function nextBondId() { return `b${++bondIdRef.current}` }

  function setHover(atomId: string | null, bondId: string | null) {
    hovAtomRef.current = atomId
    hovBondRef.current = bondId
    setHovAtom(atomId)
    setHovBond(bondId)
  }

  function deleteAtom(id: string) {
    setAtoms(p => p.filter(a => a.id !== id))
    setBonds(p => p.filter(b => b.from !== id && b.to !== id))
    setHover(null, null)
  }

  function cycleBond(id: string) {
    setBonds(p => {
      const b = p.find(x => x.id === id)
      if (!b) return p
      if (b.order >= 3) return p.filter(x => x.id !== id)
      return p.map(x => x.id === id ? { ...x, order: (x.order + 1) as 2 | 3 } : x)
    })
  }

  function addOrUpgradeBond(fromId: string, toId: string) {
    if (fromId === toId) return
    setBonds(p => {
      const ex = p.find(b => (b.from === fromId && b.to === toId) || (b.from === toId && b.to === fromId))
      if (ex) {
        if (ex.order >= 3) return p
        return p.map(b => b.id === ex.id ? { ...b, order: (b.order + 1) as 2 | 3 } : b)
      }
      return [...p, { id: nextBondId(), from: fromId, to: toId, order: 1 as const }]
    })
  }

  // ── Pointer events ──────────────────────────────────────────────────────────

  function getCoords(e: React.PointerEvent) {
    return svgRef.current ? svgCoords(e, svgRef.current) : { x: 0, y: 0 }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return
    const { x, y } = getCoords(e)
    const hitAtom = getAtomAt(atomsRef.current, x, y)
    const hitBond = hitAtom ? null : getBondAt(bondsRef.current, atomsRef.current, x, y)

    // Detect clicks in the hover overlay (LP controls / delete button) above the atom.
    // Those clicks should be handled exclusively by the overlay's own onClick — we must
    // not also place an atom or trigger draw-mode logic in handlePointerUp.
    const hovId  = hovAtomRef.current
    const hovAtomObj = hovId ? atomsRef.current.find(a => a.id === hovId) : null
    const hitOverlay = !hitAtom && hovAtomObj != null && inHoverZone(hovAtomObj, x, y)

    pressRef.current = {
      startX: x, startY: y, pointerId: e.pointerId, isDrag: false,
      hitAtomId: hitAtom?.id ?? null,
      hitBondId: hitBond?.id ?? null,
      moveOffX: hitAtom ? x - hitAtom.x : 0,
      moveOffY: hitAtom ? y - hitAtom.y : 0,
      hitOverlay,
    }
    // Don't capture for overlay hits — pointer capture redirects the click event
    // to the SVG root, which prevents child <g> onClick handlers from firing.
    if (!hitOverlay) svgRef.current?.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    const { x, y } = getCoords(e)
    const pr = pressRef.current

    // Update hover (only when not mid-drag)
    if (!pr || !pr.isDrag) {
      const ha = getAtomAt(atomsRef.current, x, y)
      if (ha) {
        setHover(ha.id, null)
      } else {
        // Keep the current atom hovered if cursor is still within its overlay zone
        const curHovId = hovAtomRef.current
        const curHov = curHovId ? atomsRef.current.find(a => a.id === curHovId) : null
        if (curHov && inHoverZone(curHov, x, y)) {
          // stay hovered — no change
        } else {
          const hb = getBondAt(bondsRef.current, atomsRef.current, x, y)
          setHover(null, hb?.id ?? null)
        }
      }
    }

    if (!pr) return

    // Check drag threshold
    if (!pr.isDrag && Math.hypot(x - pr.startX, y - pr.startY) > DRAG_THRESH) {
      pr.isDrag = true
    }
    if (!pr.isDrag) return

    if (tool === 'move' && pr.hitAtomId) {
      const id = pr.hitAtomId
      setAtoms(p => p.map(a => a.id === id ? { ...a, x: x - pr.moveOffX, y: y - pr.moveOffY } : a))
    } else if (tool === 'draw' && pr.hitAtomId) {
      setPreview({ fromId: pr.hitAtomId, x, y })
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    const { x, y } = getCoords(e)
    const pr = pressRef.current
    pressRef.current = null
    setPreview(null)

    if (!pr) return

    // If the press started on the hover overlay, let the overlay's onClick handle it.
    if (pr.hitOverlay) return

    if (!pr.isDrag) {
      // Click
      if (pr.hitAtomId) {
        // no-op on atom click (bond drag handles bonding; LP handled by overlay buttons)
      } else if (pr.hitBondId) {
        cycleBond(pr.hitBondId)
      } else if (tool === 'draw') {
        const id = nextAtomId()
        setAtoms(p => [...p, { id, element: activeEl, x, y, lonePairs: 0 }])
      }
    } else {
      // Drag end
      if (tool === 'draw' && pr.hitAtomId) {
        const target = getAtomAt(atomsRef.current, x, y)
        if (target && target.id !== pr.hitAtomId) {
          addOrUpgradeBond(pr.hitAtomId, target.id)
        } else if (!target) {
          const newId = nextAtomId()
          const bId   = nextBondId()
          setAtoms(p => [...p, { id: newId, element: activeEl, x, y, lonePairs: 0 }])
          setBonds(p => [...p, { id: bId, from: pr.hitAtomId!, to: newId, order: 1 }])
        }
      }
    }
  }

  // ── Auto-load when correctStructure changes (e.g. user picks a new molecule) ─

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (correctStructure) placeAtoms(correctStructure)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctStructure])

  // ── Keyboard delete ─────────────────────────────────────────────────────────

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      const aId = hovAtomRef.current, bId = hovBondRef.current
      if (aId) deleteAtom(aId)
      else if (bId) setBonds(p => p.filter(b => b.id !== bId))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load / scaffold ─────────────────────────────────────────────────────────

  function getCenterXY() {
    const svg = svgRef.current
    return { cx: svg ? svg.clientWidth / 2 : 280, cy: canvasHeight / 2 }
  }

  function placeAtoms(structure: LewisStructure) {
    const { cx, cy } = getCenterXY()
    const placed = lineLayout(structure.atoms, cx, cy)
    atomIdRef.current = placed.length
    bondIdRef.current = 0
    setAtoms(placed)
    setBonds([])
    setValidationResult(null)
  }

  // ── Check ───────────────────────────────────────────────────────────────────

  async function handleCheck() {
    if (atoms.length === 0) return
    setValidating(true); setValidationResult(null)
    try {
      const correct = localStructure ?? correctStructure ?? await onRequestStructure()
      if (!correct) {
        setValidationResult({ passed: false, checks: [{ label: 'No target', passed: false, detail: 'Select a molecule first.' }] })
        return
      }
      const result = validate(atoms, bonds, correct)
      setValidationResult(result)
      onValidated?.(result.passed)
    } finally { setValidating(false) }
  }

  function handleClear() {
    setAtoms([]); setBonds([]); setValidationResult(null); setLocalStructure(null)
    atomIdRef.current = 0; bondIdRef.current = 0
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const btnBase: React.CSSProperties = {
    height: 32, padding: '0 12px', borderRadius: 3, border: '1px solid #1c1f2e',
    fontSize: 12, fontWeight: 600, fontFamily: 'system-ui, sans-serif',
    background: '#141620', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
  }
  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
    border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
    color: 'var(--c-halogen)',
  }

  const previewAtom = preview ? atomsRef.current.find(a => a.id === preview.fromId) : null

  return (
    <div className="flex flex-col gap-3">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-sm border border-border" style={{ background: '#0a0b0f' }}>
        {/* Elements + Other/Load — all in one inline group */}
        <div className="flex items-center gap-1 flex-wrap">
          {COMMON_ELEMENTS.map(el => (
            <button key={el}
              onClick={() => { setActiveEl(el); setTool('draw') }}
              style={{
                ...( activeEl === el && tool === 'draw' ? btnActive : btnBase ),
                width: 32,
                color: activeEl === el && tool === 'draw' ? 'var(--c-halogen)' : (ELEM_COLORS[el] ?? 'rgba(255,255,255,0.6)'),
                fontFamily: "ui-monospace, 'Cascadia Code', monospace",
              }}
            >{el}</button>
          ))}
          <div className="flex items-center gap-1">
            <input type="text" value={customEl} onChange={e => setCustomEl(e.target.value.slice(0, 2))}
              onKeyDown={e => { if (e.key === 'Enter' && customEl.trim()) { setActiveEl(customEl.trim()); setTool('draw') } }}
              placeholder="…"
              className="w-10 h-8 font-mono text-xs bg-raised border border-border rounded-sm px-2 text-primary placeholder-dim focus:outline-none text-center"
            />
            <button onClick={() => { if (customEl.trim()) { setActiveEl(customEl.trim()); setTool('draw') } }}
              disabled={!customEl.trim()}
              style={{ ...btnBase, width: 32 }}>+</button>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: '#1c1f2e', margin: '0 4px' }} />

        {/* Mode */}
        <button onClick={() => setTool('draw')} style={tool === 'draw' ? btnActive : btnBase}>✎ Draw</button>
        <button onClick={() => setTool('move')} style={tool === 'move' ? btnActive : btnBase}>↖ Move</button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={handleClear} style={btnBase}>Clear</button>
          {!hideCheck && (
            <button onClick={handleCheck} disabled={atoms.length === 0 || validating}
              style={{ ...btnActive, opacity: atoms.length === 0 || validating ? 0.4 : 1 }}>
              {validating ? '…' : 'Check'}
            </button>
          )}
        </div>
      </div>

      {/* Hint line */}
      <p className="font-mono text-xs text-secondary leading-relaxed">
        <span style={{ color: 'var(--c-halogen)' }}>Draw:</span> click canvas to place · drag atom→atom to bond · click bond to cycle order (×1→×2→×3→delete) ·{' '}
        <span style={{ color: 'var(--c-halogen)' }}>Move:</span> drag atom to reposition · hover atom for lone pair / delete controls
      </p>

      {/* SVG canvas */}
      <div style={{ height: canvasHeight, borderRadius: 6, overflow: 'hidden', border: '1px solid #1c1f2e' }}>
        <svg ref={svgRef} width="100%" height={canvasHeight}
          style={{ background: CANVAS_BG, display: 'block', cursor: tool === 'draw' ? 'crosshair' : 'default' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => setHover(null, null)}
        >
          <defs>
            <pattern id="lewis-ed-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.025)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lewis-ed-grid)"/>

          {bonds.map(b => (
            <BondSvg key={b.id} bond={b} atoms={atoms} hovered={hovBond === b.id} onClick={() => cycleBond(b.id)}/>
          ))}

          {/* Bond drag preview */}
          {preview && previewAtom && (
            <line x1={previewAtom.x} y1={previewAtom.y} x2={preview.x} y2={preview.y}
              stroke="rgba(226,232,240,0.35)" strokeWidth={1.5} strokeDasharray="5 3"
              style={{ pointerEvents: 'none' }}/>
          )}

          {atoms.map(a => (
            <AtomSvg key={a.id} atom={a} allAtoms={atoms} bonds={bonds}
              hovered={hovAtom === a.id}
              onLP={d => setAtoms(p => p.map(x => x.id === a.id ? { ...x, lonePairs: Math.max(0, Math.min(4, x.lonePairs + d)) } : x))}
              onDelete={() => deleteAtom(a.id)}
            />
          ))}
        </svg>
      </div>

      {/* Validation */}
      {validationResult && (
        <div className="rounded-sm border p-4 flex flex-col gap-3" style={{
          borderColor: validationResult.passed ? 'color-mix(in srgb, #4ade80 30%, #1c1f2e)' : 'color-mix(in srgb, #f87171 30%, #1c1f2e)',
          background: validationResult.passed ? 'color-mix(in srgb, #4ade80 5%, #0e1016)' : 'color-mix(in srgb, #f87171 5%, #0e1016)',
        }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>{validationResult.passed ? '✓' : '✗'}</span>
            <span className="font-sans font-semibold text-sm" style={{ color: validationResult.passed ? '#4ade80' : '#f87171' }}>
              {validationResult.passed ? 'Correct! Great work.' : 'Not quite — see details below.'}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {validationResult.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs shrink-0 w-3 mt-0.5" style={{ color: c.passed ? '#4ade80' : '#f87171' }}>{c.passed ? '✓' : '✗'}</span>
                <div>
                  <span className="font-sans text-xs font-medium text-primary">{c.label}: </span>
                  <span className="font-mono text-xs text-secondary">{c.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default LewisEditor

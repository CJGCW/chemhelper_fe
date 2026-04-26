import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type BondStyle = 'solid' | 'wedge' | 'dash'
interface Slot  { x: number; y: number; style: BondStyle }
interface BondPt { x: number; y: number; z: number; style: BondStyle }
interface LpPt   { x: number; y: number; z: number }

// ── 2D layouts (fallback) ─────────────────────────────────────────────────────

const BL = 82

const LAYOUTS: Record<string, Slot[]> = {
  linear:              [{ x:-BL, y:0, style:'solid'}, { x:BL, y:0, style:'solid'}],
  trigonal_planar:     [{ x:0, y:-BL, style:'solid'}, { x:-72, y:BL*.5, style:'solid'}, { x:72, y:BL*.5, style:'solid'}],
  bent:                [{ x:-58, y:-58, style:'solid'}, { x:58, y:-58, style:'solid'}],
  tetrahedral:         [{ x:0, y:-BL, style:'solid'}, { x:-76, y:8, style:'solid'}, { x:60, y:44, style:'wedge'}, { x:18, y:76, style:'dash'}],
  trigonal_pyramidal:  [{ x:0, y:-80, style:'solid'}, { x:-70, y:48, style:'wedge'}, { x:70, y:48, style:'dash'}],
  trigonal_bipyramidal:[{ x:0, y:-BL, style:'solid'}, { x:0, y:BL, style:'solid'}, { x:-BL, y:0, style:'solid'}, { x:42, y:-74, style:'solid'}, { x:42, y:74, style:'solid'}],
  seesaw:              [{ x:0, y:-BL, style:'solid'}, { x:0, y:BL, style:'solid'}, { x:-74, y:24, style:'solid'}, { x:64, y:46, style:'wedge'}],
  t_shaped:            [{ x:0, y:-BL, style:'solid'}, { x:0, y:BL, style:'solid'}, { x:-BL, y:0, style:'solid'}],
  octahedral:          [{ x:0, y:-BL, style:'solid'}, { x:0, y:BL, style:'solid'}, { x:-BL, y:0, style:'solid'}, { x:BL, y:0, style:'solid'}, { x:34, y:34, style:'wedge'}, { x:-34, y:-34, style:'dash'}],
  square_planar:       [{ x:0, y:-BL, style:'solid'}, { x:BL, y:0, style:'solid'}, { x:0, y:BL, style:'solid'}, { x:-BL, y:0, style:'solid'}],
  square_pyramidal:    [{ x:0, y:-BL, style:'solid'}, { x:-52, y:24, style:'wedge'}, { x:52, y:24, style:'wedge'}, { x:-52, y:-20, style:'dash'}, { x:52, y:-20, style:'dash'}],
}

function geoKey(g: string) { return g.toLowerCase().replace(/[\s-]/g, '_') }

function getSlots(geometry: string, bonds: number): Slot[] {
  const base = LAYOUTS[geoKey(geometry)]
  if (base) return base.slice(0, bonds)
  return Array.from({ length: bonds }, (_, i) => {
    const r = -Math.PI/2 + 2*Math.PI*i/bonds
    return { x: Math.cos(r)*BL, y: Math.sin(r)*BL, style: 'solid' as const }
  })
}

// ── 3D geometry ────────────────────────────────────────────────────────────────
// Keys: "${bonds}_${lonePairs}". First `bonds` entries = bond positions, rest = LP positions.
// All vectors are unit length.

const S3  = Math.sqrt(3) / 2       // ≈ 0.8660
const S23 = Math.sqrt(2 / 3)       // ≈ 0.8165
const S63 = 2 * Math.sqrt(2) / 3   // ≈ 0.9428
const A23 = Math.sqrt(2) / 3       // ≈ 0.4714
const I3  = 1 / 3

const X_TILT    = 22 * (Math.PI / 180)
const ROT_SPEED = 55 * (Math.PI / 180)

type V3 = [number, number, number]

const GEOM_3D: Record<string, V3[]> = {
  // 2 electron domains
  '2_0': [[0,1,0],[0,-1,0]],
  // 3 electron domains
  '3_0': [[0,1,0],[-S3,-0.5,0],[S3,-0.5,0]],
  '2_1': [[-S3,-0.5,0],[S3,-0.5,0],[0,1,0]],
  // 4 electron domains (tetrahedral arrangement)
  '4_0': [[0,1,0],[S63,-I3,0],[-A23,-I3,S23],[-A23,-I3,-S23]],
  '3_1': [[S63,-I3,0],[-A23,-I3,S23],[-A23,-I3,-S23],[0,1,0]],
  '2_2': [[-A23,-I3,S23],[-A23,-I3,-S23],[0,1,0],[S63,-I3,0]],
  // 5 electron domains — LPs prefer equatorial positions
  '5_0': [[0,1,0],[0,-1,0],[1,0,0],[-0.5,0,S3],[-0.5,0,-S3]],
  '4_1': [[0,1,0],[0,-1,0],[-0.5,0,S3],[-0.5,0,-S3],[1,0,0]],
  '3_2': [[0,1,0],[0,-1,0],[1,0,0],[-0.5,0,S3],[-0.5,0,-S3]],
  '2_3': [[0,1,0],[0,-1,0],[1,0,0],[-0.5,0,S3],[-0.5,0,-S3]],
  // 6 electron domains
  '6_0': [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]],
  '5_1': [[0,1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,-1,0]],
  '4_2': [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0],[0,-1,0]],
}

// ── Derived property helpers ──────────────────────────────────────────────────

const GEO_DISPLAY: Record<string, string> = {
  linear:'Linear', trigonal_planar:'Trigonal Planar', bent:'Bent',
  tetrahedral:'Tetrahedral', trigonal_pyramidal:'Trigonal Pyramidal',
  trigonal_bipyramidal:'Trigonal Bipyramidal', seesaw:'See-Saw',
  t_shaped:'T-Shaped', octahedral:'Octahedral',
  square_pyramidal:'Square Pyramidal', square_planar:'Square Planar',
}
function getMolGeo(g: string): string { return GEO_DISPLAY[geoKey(g)] ?? g }
function getElecGeo(d: number): string {
  return (['','Linear','Linear','Trigonal Planar','Tetrahedral','Trigonal Bipyramidal','Octahedral'])[d] ?? '?'
}
function getHybrid(d: number): string {
  return (['','s','sp','sp²','sp³','sp³d','sp³d²'])[d] ?? '?'
}
function getBondAngles(g: string, lp: number): string {
  const k = geoKey(g)
  if (k==='linear')               return '180°'
  if (k==='trigonal_planar')      return '120°'
  if (k==='bent')                 return lp===1 ? '≈120°' : '≈104.5°'
  if (k==='tetrahedral')          return '≈109.5°'
  if (k==='trigonal_pyramidal')   return '≈107°'
  if (k==='trigonal_bipyramidal') return '90°, 120°'
  if (k==='seesaw')               return '≈90°, ≈120°'
  if (k==='t_shaped')             return '90°, 180°'
  if (k==='octahedral')           return '90°'
  if (k==='square_pyramidal')     return '90°'
  if (k==='square_planar')        return '90°'
  return '?'
}

// ── Steps ─────────────────────────────────────────────────────────────────────

type Step = 'mol_geo' | 'elec_geo' | 'bond_angles' | 'bonding_pairs' | 'lone_pairs' | 'hybridization' | 'valence_e'

const ALL_STEPS: Step[] = ['mol_geo','elec_geo','bond_angles','bonding_pairs','lone_pairs','hybridization','valence_e']

const STEP_LABEL: Record<Step, string> = {
  mol_geo:       'Molecular Geometry',
  elec_geo:      'Electron Geometry',
  bond_angles:   'Bond Angles',
  bonding_pairs: 'Bonding Pairs',
  lone_pairs:    'Lone Pairs',
  hybridization: 'Hybridization',
  valence_e:     'Electrons',
}

// ── SVG constants + helpers ───────────────────────────────────────────────────

const W = 320, H = 290, CX = W/2, CY = H/2 + 6
const CR = 22, TR = 17

const ELEM_COLORS: Record<string, string> = {
  H:'#9ca3af', C:'#6b7280', N:'#4a7ef5', O:'#e05050',
  F:'#5dcc5d', Cl:'#40b840', Br:'#be4040', I:'#9966cc',
  S:'#d4b84a', P:'#e08030', B:'#c87050', Si:'#b09070',
  Xe:'#6080c0', Al:'#a09090', Se:'#c0a050', Te:'#a08060',
  Be:'#909090', Hg:'#888888', Sb:'#7080a0',
}
function elemColor(el: string) { return ELEM_COLORS[el] ?? '#60a5fa' }

// Adjacent pairs for 2D projected positions
function outlineEdges(pts: { x: number; y: number }[], thresholdDeg = 145): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j]
      const dot = a.x * b.x + a.y * b.y
      const mA  = Math.sqrt(a.x * a.x + a.y * a.y) || 1
      const mB  = Math.sqrt(b.x * b.x + b.y * b.y) || 1
      const ang = Math.acos(Math.max(-1, Math.min(1, dot / (mA * mB)))) * 180 / Math.PI
      if (ang < thresholdDeg) edges.push([i, j])
    }
  }
  return edges
}

// Adjacent pairs from unit vectors (rotation-invariant — use for 3D mode)
function outlineEdges3D(vecs: V3[], thresholdDeg = 145): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < vecs.length; i++) {
    for (let j = i + 1; j < vecs.length; j++) {
      const dot = vecs[i][0]*vecs[j][0] + vecs[i][1]*vecs[j][1] + vecs[i][2]*vecs[j][2]
      const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 180/Math.PI
      if (ang < thresholdDeg) edges.push([i, j])
    }
  }
  return edges
}

function arcPath(cx: number, cy: number, r: number, a1Deg: number, a2Deg: number): string {
  let delta = ((a2Deg - a1Deg) + 360) % 360
  if (delta > 180) delta -= 360
  const steps = 28
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const a = (a1Deg + delta * i / steps) * Math.PI / 180
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return `M ${pts[0]} L ${pts.slice(1).join(' L ')}`
}

function rotatePoint(p: V3, yAngle: number): { x: number; y: number; z: number } {
  // X-tilt first (fixed 22° tilt for depth perspective)
  const cx = Math.cos(X_TILT), sx = Math.sin(X_TILT)
  const y1 = p[1]*cx - p[2]*sx
  const z1 = p[1]*sx + p[2]*cx
  // Y-axis rotation (animation)
  const cy = Math.cos(yAngle), sy = Math.sin(yAngle)
  const x2 = p[0]*cy + z1*sy
  const z2 = -p[0]*sy + z1*cy
  return { x: x2*BL, y: -y1*BL, z: z2*BL }
}

function bondStyleFrom3D(z: number): BondStyle {
  if (z >  BL * 0.20) return 'wedge'
  if (z < -BL * 0.20) return 'dash'
  return 'solid'
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface VseprVisualizerEntry {
  formula:          string
  central:          string
  bonds:            number
  lonePairs:        number
  geometry:         string
  valenceElectrons?: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VseprVisualizer({
  formula, central, bonds, lonePairs, geometry, valenceElectrons,
}: VseprVisualizerEntry) {
  const elecPairs = bonds + lonePairs
  const totalE    = valenceElectrons ?? 2 * elecPairs
  const molGeo    = getMolGeo(geometry)
  const elecGeo   = getElecGeo(elecPairs)
  const hybrid    = getHybrid(elecPairs)
  const angles    = getBondAngles(geometry, lonePairs)

  const steps = ALL_STEPS.filter(s => s !== 'lone_pairs' || lonePairs > 0)

  const [activeStep, setActiveStep] = useState<Step>('mol_geo')
  const [subCount,   setSubCount]   = useState(bonds)
  const [playing,    setPlaying]    = useState(false)
  const [rotating,   setRotating]   = useState(false)
  const [use3D,      setUse3D]      = useState(false)
  const [,           setTick]       = useState(0)

  const playRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef      = useRef<number | null>(null)
  const angleRef    = useRef(0)
  const lastTimeRef = useRef(0)

  const geom3DKey = `${bonds}_${lonePairs}`
  const raw3D     = GEOM_3D[geom3DKey] as V3[] | undefined
  const has3D     = !!raw3D

  // 2D slot positions (always computed — used as fallback and for arc/LP-angle computation)
  const slots = getSlots(geometry, bonds)

  const slotDegs = slots
    .map(s => ((Math.atan2(s.y, s.x) * 180/Math.PI) + 360) % 360)
    .sort((a, b) => a - b)

  const lpAngles: number[] = []
  if (lonePairs > 0 && slotDegs.length > 0) {
    const gaps = slotDegs.map((a, i) => {
      const next = i === slotDegs.length-1 ? slotDegs[0]+360 : slotDegs[i+1]
      return { mid: (a + (next-a)/2) % 360, size: next - a }
    })
    gaps.sort((a, b) => b.size - a.size)
    gaps.slice(0, lonePairs).forEach(g => lpAngles.push(g.mid))
  }

  // Arc pairs between adjacent 2D bond angles
  const arcPairs: { a1: number; a2: number }[] = []
  for (let i = 0; i < slotDegs.length; i++) {
    const a1  = slotDegs[i]
    const raw = i+1 < slotDegs.length ? slotDegs[i+1] : slotDegs[0]+360
    const gap = raw - a1
    if (gap > 30 && gap < 172) arcPairs.push({ a1, a2: raw > 360 ? raw-360 : raw })
  }

  // ── Sub-count animation ───────────────────────────────────────────────────

  useEffect(() => {
    if (subRef.current) { clearInterval(subRef.current); subRef.current = null }
    if (activeStep === 'bonding_pairs') {
      setSubCount(0)
      let c = 0
      subRef.current = setInterval(() => {
        c++; setSubCount(c)
        if (c >= bonds) { clearInterval(subRef.current!); subRef.current = null }
      }, 560)
    } else if (activeStep === 'lone_pairs') {
      setSubCount(0)
      if (lonePairs === 0) return
      let c = 0
      subRef.current = setInterval(() => {
        c++; setSubCount(c)
        if (c >= lonePairs) { clearInterval(subRef.current!); subRef.current = null }
      }, 620)
    } else {
      setSubCount(lonePairs)
    }
    return () => { if (subRef.current) { clearInterval(subRef.current); subRef.current = null } }
  }, [activeStep, bonds, lonePairs])

  // ── 3D rotation loop ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!rotating) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      return
    }
    lastTimeRef.current = performance.now()
    function frame(now: number) {
      const dt = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now
      angleRef.current = (angleRef.current + dt * ROT_SPEED) % (2 * Math.PI)
      setTick(t => t + 1)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [rotating])

  useEffect(() => () => {
    if (playRef.current) clearTimeout(playRef.current)
    if (subRef.current)  clearInterval(subRef.current)
    if (rafRef.current)  cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Play All ──────────────────────────────────────────────────────────────

  function playAll() {
    if (playRef.current) clearTimeout(playRef.current)
    setPlaying(true)
    go(0)
    function go(idx: number) {
      setActiveStep(steps[idx])
      const extra = steps[idx] === 'bonding_pairs' ? bonds * 580
                  : steps[idx] === 'lone_pairs'    ? lonePairs * 640
                  : 0
      playRef.current = setTimeout(() => {
        if (idx + 1 >= steps.length) { setPlaying(false); return }
        go(idx + 1)
      }, 2400 + extra)
    }
  }

  function stopPlay() {
    setPlaying(false)
    if (playRef.current) { clearTimeout(playRef.current); playRef.current = null }
  }

  function selectStep(s: Step) { stopPlay(); setActiveStep(s) }

  function enter3D() { setUse3D(true); setRotating(true) }
  function exit3D()  { setUse3D(false); setRotating(false); angleRef.current = 0 }

  // ── Unified bond/LP positions ─────────────────────────────────────────────

  const bondPts: BondPt[] = []
  const lpPts3D: LpPt[]   = []

  if (use3D && raw3D) {
    const angle = angleRef.current
    for (let i = 0; i < bonds; i++) {
      const p = rotatePoint(raw3D[i], angle)
      bondPts.push({ x: p.x, y: p.y, z: p.z, style: bondStyleFrom3D(p.z) })
    }
    for (let i = bonds; i < bonds + lonePairs; i++) {
      const p = rotatePoint(raw3D[i], angle)
      lpPts3D.push({ x: p.x, y: p.y, z: p.z })
    }
  } else {
    slots.forEach(s => bondPts.push({ x: s.x, y: s.y, z: 0, style: s.style }))
    lpAngles.forEach(a => {
      const r = a * Math.PI / 180
      lpPts3D.push({ x: Math.cos(r)*BL, y: Math.sin(r)*BL, z: 0 })
    })
  }

  // Depth-sorted indices: back-to-front (lowest z first = drawn first = behind)
  const sortedIndices = [...Array(bonds).keys()].sort((a, b) => bondPts[a].z - bondPts[b].z)

  // ── Render flags ──────────────────────────────────────────────────────────

  const isCounting     = activeStep === 'bonding_pairs' || activeStep === 'lone_pairs'
  const visibleBonds   = activeStep === 'bonding_pairs' ? subCount : bonds
  const visibleLPs     = activeStep === 'lone_pairs' ? subCount
    : ['elec_geo','hybridization','valence_e','lone_pairs'].includes(activeStep) ? lonePairs : 0
  const highlightBonds = ['mol_geo','elec_geo','hybridization','valence_e'].includes(activeStep)
  const showArcs       = activeStep === 'bond_angles' && !use3D
  const showOutline    = activeStep === 'mol_geo' || activeStep === 'elec_geo'

  // ── Outline ───────────────────────────────────────────────────────────────

  const outlinePtsForDraw: { x: number; y: number }[] = showOutline
    ? (activeStep === 'elec_geo' ? [...bondPts, ...lpPts3D] : [...bondPts])
    : []

  let outlineSegs: [number, number][] = []
  if (showOutline) {
    if (use3D && raw3D) {
      const vecCount = activeStep === 'elec_geo' ? bonds + lonePairs : bonds
      outlineSegs = outlineEdges3D(raw3D.slice(0, vecCount))
    } else {
      outlineSegs = outlineEdges(outlinePtsForDraw)
    }
  }

  // ── Step values ───────────────────────────────────────────────────────────

  const stepValues: Record<Step, string> = {
    mol_geo:       molGeo,
    elec_geo:      elecGeo,
    bond_angles:   angles,
    bonding_pairs: String(bonds),
    lone_pairs:    String(lonePairs),
    hybridization: hybrid,
    valence_e:     `${totalE} e⁻`,
  }

  const stepExplain: Record<Step, string> = {
    mol_geo:       `Only the bonded atoms define this shape — lone pairs are invisible in molecular geometry.`,
    elec_geo:      `All ${elecPairs} electron domain${elecPairs!==1?'s':''} (${bonds} bond${bonds!==1?'s':''} + ${lonePairs} lone pair${lonePairs!==1?'s':''}) give this geometry.`,
    bond_angles:   lonePairs > 0
      ? `Lone pair${lonePairs>1?'s':''} compress the bond angles — each lone pair repels bonding pairs more strongly than bonding pairs repel each other.`
      : `All bond angles are equal because there are no lone pairs to distort the geometry.`,
    bonding_pairs: `Each line from the central atom to a terminal atom is one bonding pair (2 electrons).`,
    lone_pairs:    lonePairs === 0
      ? 'No lone pairs on the central atom — all electron domains are bonding pairs.'
      : `Lone pair${lonePairs>1?'s':''} occupy space around the central atom but are not bonded to any atom.`,
    hybridization: `${elecPairs} electron domain${elecPairs!==1?'s':''} → mix ${elecPairs} atomic orbitals → ${hybrid} hybrid orbitals.`,
    valence_e:     `${bonds} bond${bonds!==1?'s':''} × 2 e⁻ + ${lonePairs} lone pair${lonePairs!==1?'s':''} × 2 e⁻ = ${totalE} e⁻ around the central atom.`,
  }

  const displayValue = isCounting ? String(subCount) : stepValues[activeStep]

  const btnBase = 'px-3 py-1.5 rounded-full font-sans text-[13px] font-medium transition-all'

  return (
    <div className="flex flex-col gap-4">

      {/* Formula heading */}
      <div className="flex items-baseline gap-2">
        <span className="font-sans font-bold text-bright text-xl">{formula}</span>
        <span className="font-mono text-xs text-dim">central: {central}</span>
        {use3D && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{ background:'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                     color:'var(--c-halogen)', border:'1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
            3D
          </span>
        )}
      </div>

      {/* Step buttons */}
      <div className="flex flex-wrap gap-1.5 items-center print:hidden">
        {steps.map(s => {
          const active = s === activeStep
          return (
            <button key={s} onClick={() => selectStep(s)}
              className={`relative ${btnBase}`}
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.38)' }}>
              {active && (
                <motion.span layoutId="vsv-step-pill" className="absolute inset-0 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type:'spring', stiffness:400, damping:32 }} />
              )}
              <span className="relative z-10">{STEP_LABEL[s]}</span>
            </button>
          )
        })}

        {/* 3D controls + Play All */}
        <div className="ml-auto flex items-center gap-1.5">
          {has3D && (use3D ? (
            <>
              <button onClick={() => setRotating(r => !r)}
                className={btnBase}
                style={{
                  background: rotating
                    ? 'color-mix(in srgb, #f87171 12%, rgb(var(--color-raised)))'
                    : 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
                  border: `1px solid ${rotating
                    ? 'color-mix(in srgb, #f87171 30%, transparent)'
                    : 'color-mix(in srgb, var(--c-halogen) 22%, transparent)'}`,
                  color: rotating ? '#f87171' : 'var(--c-halogen)',
                }}>
                {rotating ? '❙❙ Pause' : '▶ Resume'}
              </button>
              <button onClick={exit3D}
                className={btnBase}
                style={{
                  background: 'rgb(var(--color-raised))',
                  border: '1px solid rgb(var(--color-border))',
                  color: 'rgba(var(--overlay),0.5)',
                }}>
                2D
              </button>
            </>
          ) : (
            <button onClick={enter3D}
              className={btnBase}
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 22%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              ⟳ 3D
            </button>
          ))}

          <button
            onClick={() => playing ? stopPlay() : playAll()}
            className={btnBase}
            style={{
              background: playing
                ? 'color-mix(in srgb, #f87171 12%, rgb(var(--color-raised)))'
                : 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))',
              border: `1px solid ${playing
                ? 'color-mix(in srgb, #f87171 35%, transparent)'
                : 'color-mix(in srgb, var(--c-halogen) 25%, transparent)'}`,
              color: playing ? '#f87171' : 'var(--c-halogen)',
            }}>
            {playing ? '■ Stop' : '▶ Play All'}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">

        {/* SVG diagram */}
        <div className="rounded-md border border-border overflow-hidden shrink-0"
          style={{ background: 'rgb(var(--color-surface))' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth:'100%', display:'block' }}>

            {/* Geometry outline */}
            {outlineSegs.map(([i, j], idx) => {
              const a = outlinePtsForDraw[i], b = outlinePtsForDraw[j]
              const isLpEdge = i >= bonds || j >= bonds
              return (
                <line key={idx}
                  x1={CX + a.x} y1={CY + a.y}
                  x2={CX + b.x} y2={CY + b.y}
                  stroke={isLpEdge
                    ? 'color-mix(in srgb, #f59e0b 35%, transparent)'
                    : 'color-mix(in srgb, var(--c-halogen) 40%, transparent)'}
                  strokeWidth={1.5} strokeDasharray="5,4"
                />
              )
            })}

            {/* Angle arcs (2D mode only) */}
            {showArcs && arcPairs.map((p, i) => (
              <path key={i}
                d={arcPath(CX, CY, 36, p.a1, p.a2)}
                fill="none"
                stroke="color-mix(in srgb, var(--c-halogen) 65%, transparent)"
                strokeWidth={1.8}
              />
            ))}
            {showArcs && arcPairs.length > 0 && (() => {
              const p = arcPairs[0]
              let delta = ((p.a2 - p.a1) + 360) % 360
              if (delta > 180) delta -= 360
              const midA = (p.a1 + delta/2) * Math.PI / 180
              const lx = CX + 52 * Math.cos(midA)
              const ly = CY + 52 * Math.sin(midA)
              return (
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
                  fontSize={9} fontFamily="system-ui, sans-serif"
                  fill="color-mix(in srgb, var(--c-halogen) 90%, transparent)">
                  {angles.split(',')[0].trim()}
                </text>
              )
            })()}

            {/* Lone pair clouds */}
            {lpPts3D.map((lp, i) => {
              const scale    = 36 / BL
              const ox       = CX + lp.x * scale
              const oy       = CY + lp.y * scale
              const angleDeg = Math.atan2(lp.y, lp.x) * 180 / Math.PI
              const vis      = i < visibleLPs
              const isNew    = activeStep === 'lone_pairs' && i === subCount - 1
              return (
                <g key={i} style={{ transition:'opacity 0.35s' }} opacity={vis ? 1 : 0.06}>
                  {isNew && (
                    <ellipse cx={ox} cy={oy} rx={20} ry={14}
                      transform={`rotate(${angleDeg+90}, ${ox}, ${oy})`}
                      fill="color-mix(in srgb, #f59e0b 15%, transparent)" />
                  )}
                  <ellipse cx={ox} cy={oy} rx={14} ry={9}
                    transform={`rotate(${angleDeg+90}, ${ox}, ${oy})`}
                    fill={isNew ? 'color-mix(in srgb, #f59e0b 12%, transparent)' : 'none'}
                    stroke={isNew ? '#f59e0b' : 'rgba(var(--overlay),0.45)'}
                    strokeWidth={isNew ? 2 : 1.5} strokeDasharray="3,2"
                  />
                  {[-.28, .28].map((off, di) => (
                    <circle key={di}
                      cx={ox + Math.cos((angleDeg+180)*Math.PI/180) * off * 18}
                      cy={oy + Math.sin((angleDeg+180)*Math.PI/180) * off * 18}
                      r={2.2}
                      fill={isNew ? '#f59e0b' : 'rgba(var(--overlay),0.4)'}
                    />
                  ))}
                </g>
              )
            })}

            {/* Bonds + terminals — depth sorted (back to front) */}
            {sortedIndices.map(i => {
              const pt   = bondPts[i]
              const dx   = pt.x, dy = pt.y
              const dist = Math.sqrt(dx*dx + dy*dy) || 1
              const x1   = CX + (dx/dist)*CR,  y1 = CY + (dy/dist)*CR
              const x2   = CX + pt.x - (dx/dist)*TR, y2 = CY + pt.y - (dy/dist)*TR
              const vis        = i < visibleBonds
              const isNew      = activeStep === 'bonding_pairs' && i === subCount - 1
              const highlighted = highlightBonds && vis
              const accent  = isNew
                ? 'var(--c-halogen)'
                : highlighted
                  ? 'color-mix(in srgb, var(--c-halogen) 70%, rgba(var(--overlay),0.55))'
                  : 'rgba(var(--overlay),0.55)'
              const dimColor = 'rgba(var(--overlay),0.09)'
              const px = -dy/dist, py = dx/dist
              const w  = isNew ? 6 : 4.5

              // subtle depth scaling for terminal atoms in 3D
              const depthR = use3D ? TR * Math.max(0.78, Math.min(1.18, 0.88 + 0.30 * (pt.z / BL))) : TR

              return (
                <g key={i}>
                  {/* Bond */}
                  {pt.style === 'wedge' ? (
                    <path
                      d={`M ${x1} ${y1} L ${x2+px*w} ${y2+py*w} L ${x2-px*w} ${y2-py*w} Z`}
                      fill={vis ? accent : dimColor}
                      style={{ transition:'fill 0.3s' }}
                    />
                  ) : pt.style === 'dash' ? (
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={vis ? accent : dimColor}
                      strokeWidth={isNew ? 2.5 : 2} strokeDasharray="5,3"
                      style={{ transition:'stroke 0.3s' }}
                    />
                  ) : (
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={vis ? accent : dimColor}
                      strokeWidth={isNew ? 2.8 : 2}
                      style={{ transition:'stroke 0.3s' }}
                    />
                  )}
                  {/* Terminal atom */}
                  <g style={{ transition:'opacity 0.3s' }} opacity={vis ? 1 : 0.1}>
                    {isNew && (
                      <circle cx={CX+pt.x} cy={CY+pt.y} r={depthR+8}
                        fill="color-mix(in srgb, var(--c-halogen) 12%, transparent)" />
                    )}
                    <circle cx={CX+pt.x} cy={CY+pt.y} r={depthR}
                      fill={highlighted || isNew
                        ? 'color-mix(in srgb, var(--c-halogen) 20%, rgb(var(--color-raised)))'
                        : 'rgb(var(--color-muted))'}
                      stroke={isNew
                        ? 'var(--c-halogen)'
                        : highlighted
                          ? 'color-mix(in srgb, var(--c-halogen) 45%, transparent)'
                          : 'rgb(var(--color-border))'}
                      strokeWidth={isNew ? 2 : 1}
                      style={{ transition:'fill 0.3s, stroke 0.3s' }}
                    />
                  </g>
                </g>
              )
            })}

            {/* Count badge */}
            {isCounting && subCount > 0 && (
              <text x={W-10} y={18} textAnchor="end" dominantBaseline="hanging"
                fontSize={12} fontWeight="700" fontFamily="system-ui, sans-serif"
                fill={activeStep === 'bonding_pairs' ? 'var(--c-halogen)' : '#f59e0b'}>
                {subCount} / {activeStep === 'bonding_pairs' ? bonds : lonePairs}
              </text>
            )}

            {/* Central atom */}
            <circle cx={CX} cy={CY} r={CR}
              fill={elemColor(central)} stroke={elemColor(central)}
              strokeWidth={2} style={{ filter:'brightness(1.1)' }}
            />
            <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
              fill="white" fontWeight="700"
              fontSize={central.length > 2 ? 9 : central.length > 1 ? 11 : 14}
              fontFamily="system-ui, sans-serif">
              {central}
            </text>

            {/* Wedge/dash legend */}
            {(use3D || bondPts.some(p => p.style !== 'solid')) && (
              <text x={W-6} y={H-5} textAnchor="end" fontSize={7}
                fill="rgba(var(--overlay),0.18)" fontFamily="system-ui, sans-serif">
                ▶ toward · – – away
              </text>
            )}
          </svg>
        </div>

        {/* Step info panel */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeStep}
              initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }}
              className="flex flex-col gap-2">

              <span className="font-mono text-[11px] text-secondary tracking-widest uppercase">
                {STEP_LABEL[activeStep]}
              </span>

              <div className="font-sans font-bold leading-none"
                style={{ fontSize:42, color:'var(--c-halogen)' }}>
                {displayValue}
              </div>

              <p className="font-sans text-sm text-secondary leading-relaxed">
                {stepExplain[activeStep]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 pt-2 border-t border-border">
            {steps.map(s => {
              const active = s === activeStep
              return (
                <button key={s} onClick={() => selectStep(s)} className="text-left">
                  <div className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.28)' }}>
                    {STEP_LABEL[s]}
                  </div>
                  <div className="font-sans text-sm font-semibold mt-0.5"
                    style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.5)' }}>
                    {stepValues[s]}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

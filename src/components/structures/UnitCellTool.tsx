import React from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────

const NA = 6.02214076e23

type StructureId = 'sc' | 'bcc' | 'fcc'
type EdgeUnit    = 'pm' | 'Å'  | 'nm'
type AtomKind    = 'corner' | 'body' | 'face'

// ── Structure data ─────────────────────────────────────────────────────────────

interface StructureInfo {
  label: string
  Z: number
  cn: number
  packing: number
  radiusEq: string
  contactDir: string
  calcRadius: (a: number) => number
}

const STRUCTURES: Record<StructureId, StructureInfo> = {
  sc: {
    label: 'Simple Cubic',
    Z: 1, cn: 6,
    packing: Math.PI / 6,
    radiusEq: 'r = a / 2',
    contactDir: 'edge (a = 2r)',
    calcRadius: a => a / 2,
  },
  bcc: {
    label: 'Body-Centered Cubic',
    Z: 2, cn: 8,
    packing: (Math.PI * Math.sqrt(3)) / 8,
    radiusEq: 'r = a√3 / 4',
    contactDir: 'body diagonal (a√3 = 4r)',
    calcRadius: a => (a * Math.sqrt(3)) / 4,
  },
  fcc: {
    label: 'Face-Centered Cubic',
    Z: 4, cn: 12,
    packing: (Math.PI * Math.sqrt(2)) / 6,
    radiusEq: 'r = a√2 / 4',
    contactDir: 'face diagonal (a√2 = 4r)',
    calcRadius: a => (a * Math.sqrt(2)) / 4,
  },
}

// ── Metal presets ──────────────────────────────────────────────────────────────

interface MetalPreset {
  symbol: string; name: string; M: number
  structure: StructureId; a: number
}

const METALS: MetalPreset[] = [
  { symbol: 'Cu', name: 'Copper',     M: 63.546,  structure: 'fcc', a: 361.5 },
  { symbol: 'Al', name: 'Aluminium',  M: 26.982,  structure: 'fcc', a: 404.9 },
  { symbol: 'Au', name: 'Gold',       M: 196.967, structure: 'fcc', a: 407.8 },
  { symbol: 'Ag', name: 'Silver',     M: 107.868, structure: 'fcc', a: 408.5 },
  { symbol: 'Ni', name: 'Nickel',     M: 58.693,  structure: 'fcc', a: 352.4 },
  { symbol: 'Pb', name: 'Lead',       M: 207.2,   structure: 'fcc', a: 495.1 },
  { symbol: 'Fe', name: 'Iron',       M: 55.845,  structure: 'bcc', a: 286.7 },
  { symbol: 'W',  name: 'Tungsten',   M: 183.84,  structure: 'bcc', a: 316.5 },
  { symbol: 'Cr', name: 'Chromium',   M: 51.996,  structure: 'bcc', a: 288.0 },
  { symbol: 'Na', name: 'Sodium',     M: 22.990,  structure: 'bcc', a: 429.0 },
  { symbol: 'Mo', name: 'Molybdenum', M: 95.96,   structure: 'bcc', a: 314.7 },
  { symbol: 'Po', name: 'Polonium',   M: 208.982, structure: 'sc',  a: 335.2 },
]

// ── SVG thumbnail ──────────────────────────────────────────────────────────────
// Oblique cabinet projection, front face 46×46, depth (+21,−12).

const FBL = [5,  61] as const; const FBR = [51, 61] as const
const FTL = [5,  15] as const; const FTR = [51, 15] as const
const BBL = [26, 49] as const; const BBR = [72, 49] as const
const BTL = [26,  3] as const; const BTR = [72,  3] as const
const BODY_C    = [38.5, 32]  as const
const FACE_F    = [28,   38]  as const; const FACE_BK = [49, 26] as const
const FACE_L    = [15.5, 32]  as const; const FACE_R  = [61.5, 32] as const
const FACE_BOT  = [38.5, 55]  as const; const FACE_T  = [38.5, 9] as const

const CLR_CORNER = '#60a5fa'; const CLR_BODY = '#fb923c'; const CLR_FACE = '#34d399'

function seg(a: readonly [number,number], b: readonly [number,number], hidden = false) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
    stroke="rgba(var(--overlay),0.22)" strokeWidth={hidden ? 0.7 : 1.1}
    strokeDasharray={hidden ? '2,2' : undefined} />
}
function dot(p: readonly [number,number], r: number, fill: string, opacity = 1) {
  return <circle cx={p[0]} cy={p[1]} r={r} fill={fill} opacity={opacity} />
}

function UnitCellSVG({ id }: { id: StructureId }) {
  return (
    <svg viewBox="0 0 80 68" width="76" height="64">
      {seg(FBL,BBL,true)}{seg(FTL,BTL,true)}{seg(BBL,BBR,true)}{seg(BBL,BTL,true)}
      {seg(FBL,FBR)}{seg(FBR,FTR)}{seg(FTR,FTL)}{seg(FTL,FBL)}
      {seg(FBR,BBR)}{seg(FTR,BTR)}{seg(BTR,BTL)}{seg(BTR,BBR)}
      {dot(BBL,4.2,CLR_CORNER,0.4)}{dot(BBR,4.2,CLR_CORNER,0.45)}
      {dot(BTL,4.2,CLR_CORNER,0.4)}{dot(BTR,4.2,CLR_CORNER,0.45)}
      {dot(FBL,4.2,CLR_CORNER)}{dot(FBR,4.2,CLR_CORNER)}
      {dot(FTL,4.2,CLR_CORNER)}{dot(FTR,4.2,CLR_CORNER)}
      {id === 'bcc' && dot(BODY_C,5.5,CLR_BODY)}
      {id === 'fcc' && <>
        {dot(FACE_BK,4,CLR_FACE,0.35)}{dot(FACE_L,4,CLR_FACE,0.35)}{dot(FACE_BOT,4,CLR_FACE,0.35)}
        {dot(FACE_F,4,CLR_FACE)}{dot(FACE_R,4,CLR_FACE,0.85)}{dot(FACE_T,4,CLR_FACE,0.85)}
      </>}
    </svg>
  )
}

function Legend({ id }: { id: StructureId }) {
  const items = id === 'bcc'
    ? [{ c: CLR_CORNER, l: 'Corner atoms (×8 × ⅛ = 1)' }, { c: CLR_BODY, l: 'Body-centre atom (×1 = 1)' }]
    : id === 'fcc'
    ? [{ c: CLR_CORNER, l: 'Corner atoms (×8 × ⅛ = 1)' }, { c: CLR_FACE, l: 'Face-centre atoms (×6 × ½ = 3)' }]
    : [{ c: CLR_CORNER, l: 'Corner atoms (×8 × ⅛ = 1)' }]
  return (
    <div className="flex flex-col gap-1 mt-1">
      {items.map(it => (
        <div key={it.l} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: it.c }} />
          <span className="font-mono text-xs text-secondary">{it.l}</span>
        </div>
      ))}
    </div>
  )
}

// ── 3D canvas ──────────────────────────────────────────────────────────────────

interface Atom3D { x: number; y: number; z: number; kind: AtomKind }
interface Edge3D { a: [number,number,number]; b: [number,number,number] }

function corners(): [number,number,number][] {
  const pts: [number,number,number][] = []
  for (let x = 0; x <= 1; x++) for (let y = 0; y <= 1; y++) for (let z = 0; z <= 1; z++)
    pts.push([x, y, z])
  return pts
}

function buildScene(id: StructureId, cells: number): { atoms: Atom3D[]; edges: Edge3D[] } {
  const atoms: Atom3D[] = []
  const edgeSet = new Set<string>()
  const edges: Edge3D[] = []

  function addEdge(a: [number,number,number], b: [number,number,number]) {
    const key = [a,b].map(p=>p.join(',')).sort().join('|')
    if (!edgeSet.has(key)) { edgeSet.add(key); edges.push({ a, b }) }
  }

  for (let cx = 0; cx < cells; cx++) for (let cy = 0; cy < cells; cy++) for (let cz = 0; cz < cells; cz++) {
    for (const [dx,dy,dz] of corners())
      atoms.push({ x: cx+dx, y: cy+dy, z: cz+dz, kind: 'corner' })
    if (id === 'bcc')
      atoms.push({ x: cx+.5, y: cy+.5, z: cz+.5, kind: 'body' })
    if (id === 'fcc') {
      atoms.push({ x: cx+.5, y: cy+.5, z: cz+0,  kind: 'face' })
      atoms.push({ x: cx+.5, y: cy+.5, z: cz+1,  kind: 'face' })
      atoms.push({ x: cx+.5, y: cy+0,  z: cz+.5, kind: 'face' })
      atoms.push({ x: cx+.5, y: cy+1,  z: cz+.5, kind: 'face' })
      atoms.push({ x: cx+0,  y: cy+.5, z: cz+.5, kind: 'face' })
      atoms.push({ x: cx+1,  y: cy+.5, z: cz+.5, kind: 'face' })
    }
    const [x0,y0,z0] = [cx,cy,cz], [x1,y1,z1] = [cx+1,cy+1,cz+1]
    addEdge([x0,y0,z0],[x1,y0,z0]); addEdge([x1,y0,z0],[x1,y1,z0])
    addEdge([x1,y1,z0],[x0,y1,z0]); addEdge([x0,y1,z0],[x0,y0,z0])
    addEdge([x0,y0,z1],[x1,y0,z1]); addEdge([x1,y0,z1],[x1,y1,z1])
    addEdge([x1,y1,z1],[x0,y1,z1]); addEdge([x0,y1,z1],[x0,y0,z1])
    addEdge([x0,y0,z0],[x0,y0,z1]); addEdge([x1,y0,z0],[x1,y0,z1])
    addEdge([x1,y1,z0],[x1,y1,z1]); addEdge([x0,y1,z0],[x0,y1,z1])
  }

  const seen = new Set<string>()
  const unique: Atom3D[] = []
  for (const a of atoms) {
    const k = `${a.x},${a.y},${a.z}`
    if (!seen.has(k)) { seen.add(k); unique.push(a) }
  }
  return { atoms: unique, edges }
}

function rotY(x: number, z: number, a: number): [number,number] {
  return [x*Math.cos(a)-z*Math.sin(a), x*Math.sin(a)+z*Math.cos(a)]
}
function rotX(y: number, z: number, a: number): [number,number] {
  return [y*Math.cos(a)-z*Math.sin(a), y*Math.sin(a)+z*Math.cos(a)]
}

function project3D(
  px: number, py: number, pz: number,
  ay: number, ax: number,
  scale: number, cx: number, cy: number, cells: number,
) {
  const h = cells / 2
  let x = px-h, y = py-h, z = pz-h
  ;[x,z] = rotY(x,z,ay)
  ;[y,z] = rotX(y,z,ax)
  const fov = 4.5, w = fov/(fov+z)
  return { sx: cx+x*scale*w, sy: cy-y*scale*w, depth: z }
}

function hexRgb(hex: string) {
  const n = parseInt(hex.slice(1),16)
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 }
}

const KIND_CLR: Record<AtomKind,string> = { corner: CLR_CORNER, body: CLR_BODY, face: CLR_FACE }
// Atom radius as fraction of cell-width scale — small enough that the cube frame dominates.
const KIND_R: Record<AtomKind,number>   = { corner: 0.09, body: 0.11, face: 0.09 }

function renderCanvas(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  atoms: Atom3D[], edges: Edge3D[],
  ay: number, ax: number, scale: number, cells: number,
) {
  ctx.clearRect(0,0,w,h)
  const cx = w/2, cy = h/2

  const proj = atoms.map(a => ({ ...a, ...project3D(a.x,a.y,a.z,ay,ax,scale,cx,cy,cells) }))

  for (const e of edges) {
    const pa = project3D(e.a[0],e.a[1],e.a[2],ay,ax,scale,cx,cy,cells)
    const pb = project3D(e.b[0],e.b[1],e.b[2],ay,ax,scale,cx,cy,cells)
    const d  = (pa.depth+pb.depth)/2
    const alpha = 0.12 + 0.22*Math.max(0,Math.min(1,1-d/(cells*0.7)))
    ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy)
    ctx.strokeStyle = `rgba(var(--overlay),${alpha.toFixed(3)})`
    ctx.lineWidth = 1; ctx.stroke()
  }

  proj.sort((a,b) => a.depth-b.depth)

  for (const a of proj) {
    const r = KIND_R[a.kind]*scale
    const {r:cr,g:cg,b:cb} = hexRgb(KIND_CLR[a.kind])
    const shade = Math.max(0.55, Math.min(1, 0.8-a.depth/(cells*1.4)))
    const grd = ctx.createRadialGradient(a.sx-r*.3,a.sy-r*.3,r*.05,a.sx,a.sy,r)
    grd.addColorStop(0, `rgba(${Math.min(255,cr+60)},${Math.min(255,cg+60)},${Math.min(255,cb+60)},${shade})`)
    grd.addColorStop(.6, `rgba(${cr},${cg},${cb},${shade})`)
    grd.addColorStop(1,  `rgba(${Math.round(cr*.4)},${Math.round(cg*.4)},${Math.round(cb*.4)},${shade})`)
    ctx.beginPath(); ctx.arc(a.sx,a.sy,r,0,Math.PI*2)
    ctx.fillStyle = grd; ctx.fill()
    ctx.beginPath(); ctx.arc(a.sx,a.sy,r,0,Math.PI*2)
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(shade*.5).toFixed(2)})`
    ctx.lineWidth = .5; ctx.stroke()
  }
}

const INIT_AY = 0.6, INIT_AX = -0.4

function CrystalCanvas({ structureId }: { structureId: StructureId }) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const ay          = useRef(INIT_AY)
  const ax          = useRef(INIT_AX)
  const dragging    = useRef(false)
  const lastPos     = useRef({ x: 0, y: 0 })
  const rafId       = useRef(0)
  const [cells, setCells] = useState(1)
  const sceneRef    = useRef(buildScene(structureId, cells))
  const cellsRef    = useRef(cells)

  useEffect(() => {
    sceneRef.current = buildScene(structureId, cells)
    cellsRef.current = cells
  }, [structureId, cells])

  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const w = canvas.width, h = canvas.height
    const c = cellsRef.current
    const scale = Math.min(w,h) / (c*2.6+1)
    renderCanvas(ctx,w,h,sceneRef.current.atoms,sceneRef.current.edges,ay.current,ax.current,scale,c)
  }, [])

  useEffect(() => { draw() }, [structureId, cells, draw])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ro = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      draw()
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw])

  useEffect(() => {
    let id: number, last = performance.now()
    const tick = (now: number) => {
      if (!dragging.current) { ay.current += (now-last)*0.0004; draw() }
      last = now; id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [draw])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX-lastPos.current.x, dy = e.clientY-lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    ay.current += dx*0.012
    ax.current = Math.max(-Math.PI/2, Math.min(Math.PI/2, ax.current-dy*0.012))
    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(draw)
  }, [draw])

  const onPointerUp = useCallback(() => { dragging.current = false }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-sm border border-border overflow-hidden"
        style={{ background: 'rgb(var(--color-base))' }}>
        <canvas
          ref={canvasRef}
          style={{ width:'100%', height:'340px', cursor:'grab', display:'block' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        <div className="absolute bottom-2 left-3 font-mono text-xs text-secondary opacity-40 select-none">
          drag to rotate
        </div>
        <button
          onClick={() => { ay.current = INIT_AY; ax.current = INIT_AX; draw() }}
          className="absolute bottom-2 right-3 font-mono text-[9px] text-dim hover:text-secondary transition-colors
                     px-2 py-0.5 rounded border border-border"
          style={{ background: 'rgba(14,16,22,0.85)' }}>
          reset
        </button>
      </div>

      {/* Supercell selector */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Supercell</span>
        <div className="flex gap-1 p-1 rounded-sm" style={{ background:'rgb(var(--color-surface))', border:'1px solid rgb(var(--color-border))' }}>
          {([1,2,3] as const).map(n => {
            const active = cells === n
            return (
              <button key={n} onClick={() => setCells(n)}
                className="relative px-3.5 py-1 rounded-sm font-mono text-xs transition-colors"
                style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {active && <span className="absolute inset-0 rounded-sm" style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }} />}
                <span className="relative z-10">{n}×{n}×{n}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function toPm(val: number, unit: EdgeUnit): number {
  if (unit === 'pm') return val
  if (unit === 'Å')  return val * 100
  return val * 1000
}
function fromPm(val: number, unit: EdgeUnit): number {
  if (unit === 'pm') return val
  if (unit === 'Å')  return val / 100
  return val / 1000
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function UnitCellTool() {
  const [structureId, setStructureId] = useState<StructureId>('fcc')
  const [edgeStr,     setEdgeStr]     = useState('361.5')
  const [edgeUnit,    setEdgeUnit]    = useState<EdgeUnit>('pm')
  const [molarStr,    setMolarStr]    = useState('63.546')
  const [showSteps,   setShowSteps]   = useState(false)
  const [show3D,      setShow3D]      = useState(false)

  const s = STRUCTURES[structureId]

  const edgePm = (() => {
    const v = parseFloat(edgeStr); return isNaN(v)||v<=0 ? null : toPm(v,edgeUnit)
  })()
  const molar = (() => {
    const v = parseFloat(molarStr); return isNaN(v)||v<=0 ? null : v
  })()

  const radius  = edgePm !== null ? s.calcRadius(edgePm) : null
  const density = (edgePm !== null && molar !== null)
    ? (s.Z * molar) / (NA * Math.pow(edgePm * 1e-10, 3))
    : null

  function loadPreset(m: MetalPreset) {
    setStructureId(m.structure); setEdgeUnit('pm')
    setEdgeStr(m.a.toString()); setMolarStr(m.M.toString())
  }

  function switchUnit(u: EdgeUnit) {
    const v = parseFloat(edgeStr)
    if (!isNaN(v)) setEdgeStr(parseFloat(fromPm(toPm(v,edgeUnit),u).toPrecision(5)).toString())
    setEdgeUnit(u)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Structure selector */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Crystal Structure</span>
        <div className="flex gap-3 flex-wrap">
          {(Object.keys(STRUCTURES) as StructureId[]).map(id => {
            const active = structureId === id
            return (
              <button key={id} onClick={() => setStructureId(id)}
                className="flex flex-col items-center gap-2 px-5 py-3 rounded-sm border transition-colors"
                style={{
                  borderColor: active ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : 'rgb(var(--color-border))',
                  background:  active ? 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' : 'rgb(var(--color-surface))',
                  color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
                }}>
                <UnitCellSVG id={id} />
                <span className="font-mono text-sm font-bold">{id.toUpperCase()}</span>
                <span className="font-sans text-[10px] opacity-70 text-center leading-tight">
                  {STRUCTURES[id].label}
                </span>
              </button>
            )
          })}
        </div>
        <Legend id={structureId} />
      </div>

      {/* Edge length */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Edge Length (a)</span>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="number" value={edgeStr} onChange={e => setEdgeStr(e.target.value)}
            className="w-36 px-3 py-2 rounded-sm border border-border bg-surface font-mono text-sm text-primary
                       focus:outline-none focus:border-muted"
            placeholder="e.g. 361.5" />
          <div className="flex gap-1">
            {(['pm','Å','nm'] as EdgeUnit[]).map(u => (
              <button key={u} onClick={() => switchUnit(u)}
                className="px-3 py-1.5 rounded-sm font-mono text-xs border transition-colors"
                style={{
                  borderColor: edgeUnit===u ? 'color-mix(in srgb, var(--c-halogen) 35%, transparent)' : 'rgb(var(--color-border))',
                  background:  edgeUnit===u ? 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-surface)))' : 'rgb(var(--color-surface))',
                  color: edgeUnit===u ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
                }}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Element Presets</span>
        <div className="flex flex-wrap gap-1.5">
          {METALS.map(m => (
            <button key={m.symbol} onClick={() => loadPreset(m)}
              className="px-2.5 py-1 rounded-sm font-mono text-xs border border-border text-secondary
                         hover:text-primary hover:border-muted transition-colors">
              {m.symbol}<span className="ml-1 text-xs text-secondary">{m.structure.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Molar mass */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">
          Molar Mass <span className="normal-case tracking-normal opacity-60">(needed for density)</span>
        </span>
        <div className="flex items-center gap-2">
          <input type="number" value={molarStr} onChange={e => setMolarStr(e.target.value)}
            className="w-36 px-3 py-2 rounded-sm border border-border bg-surface font-mono text-sm text-primary
                       focus:outline-none focus:border-muted"
            placeholder="g/mol" />
          <span className="font-mono text-xs text-dim">g/mol</span>
        </div>
      </div>

      {/* Results */}
      {radius !== null && edgePm !== null && (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Results</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Atomic Radius</span>
              <span className="font-mono text-base font-semibold" style={{ color:'var(--c-halogen)' }}>
                {radius.toFixed(1)} pm
              </span>
              <span className="font-mono text-xs text-dim">{(radius/100).toFixed(3)} Å</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Atoms / Cell (Z)</span>
              <span className="font-mono text-base font-semibold text-primary">{s.Z}</span>
              <span className="font-mono text-xs text-dim">{s.label}</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Coord. Number</span>
              <span className="font-mono text-base font-semibold text-primary">{s.cn}</span>
              <span className="font-mono text-xs text-dim">nearest neighbours</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Packing Efficiency</span>
              <span className="font-mono text-base font-semibold text-primary">{(s.packing*100).toFixed(2)}%</span>
              <span className="font-mono text-xs text-dim">of cell volume occupied</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Unit Cell Volume</span>
              <span className="font-mono text-base font-semibold text-primary">
                {(Math.pow(edgePm,3)/1e6).toFixed(3)} Å³
              </span>
              <span className="font-mono text-xs text-dim">{(Math.pow(edgePm,3)*1e-30).toExponential(3)} cm³</span>
            </div>
            {density !== null && (
              <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-raised border border-border">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">Density</span>
                <span className="font-mono text-base font-semibold" style={{ color:'var(--c-halogen)' }}>
                  {density.toFixed(3)} g/cm³
                </span>
                <span className="font-mono text-xs text-dim">ρ = Z·M / (Nₐ·a³)</span>
              </div>
            )}
          </div>

          {/* Step-by-step toggle */}
          <button onClick={() => setShowSteps(v=>!v)}
            className="self-start flex items-center gap-1.5 font-mono text-xs text-dim hover:text-secondary transition-colors mt-1">
            <span>{showSteps ? '▾' : '▸'}</span>
            <span>Step-by-step working</span>
          </button>

          {showSteps && (
            <div className="rounded-sm border border-border overflow-hidden">
              <table className="w-full font-mono text-xs">
                <tbody>
                  {([
                    { n:1,  label:'Given',             val:`a = ${edgePm.toFixed(1)} pm` },
                    { n:2,  label:'Structure',          val:`${s.label} (Z = ${s.Z})` },
                    { n:3,  label:'Contact direction',  val:s.contactDir },
                    { n:4,  label:'Radius formula',     val:s.radiusEq },
                    { n:5,  label:'Atomic radius',      val:`r = ${radius.toFixed(2)} pm  =  ${(radius/100).toFixed(4)} Å` },
                    { n:6,  label:'Coord. number',      val:`CN = ${s.cn}` },
                    { n:7,  label:'Packing efficiency', val:`η = ${(s.packing*100).toFixed(2)}%` },
                    ...(density!==null&&molar!==null ? [
                      { n:8,  label:'Density formula',  val:'ρ = Z·M / (Nₐ · a³)' },
                      { n:9,  label:'a → cm',           val:`${edgePm.toFixed(1)} pm × 10⁻¹⁰ = ${(edgePm*1e-10).toExponential(4)} cm` },
                      { n:10, label:'a³',               val:`${Math.pow(edgePm*1e-10,3).toExponential(4)} cm³` },
                      { n:11, label:'ρ',                val:`(${s.Z} × ${molar}) / (6.022×10²³ × ${Math.pow(edgePm*1e-10,3).toExponential(3)}) = ${density.toFixed(4)} g/cm³` },
                    ] : []),
                  ] as {n:number;label:string;val:string}[]).map(row => (
                    <tr key={row.n} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 text-dim w-5 shrink-0">{row.n}.</td>
                      <td className="px-3 py-2 text-dim w-40">{row.label}</td>
                      <td className="px-3 py-2 text-primary">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3D visualizer toggle */}
      <div className="flex flex-col gap-3">
        <button onClick={() => setShow3D(v=>!v)}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-sm border transition-colors font-mono text-sm"
          style={{
            borderColor: show3D ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : 'rgb(var(--color-border))',
            background:  show3D ? 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' : 'rgb(var(--color-surface))',
            color: show3D ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.5)',
          }}>
          <span>{show3D ? '▾' : '▸'}</span>
          <span>3D View</span>
        </button>

        {show3D && <CrystalCanvas structureId={structureId} />}
      </div>

      <p className="font-mono text-xs text-secondary">ρ = (Z × M) / (a³ × N_A) · fill any three fields and leave one blank to solve · fill all four to verify</p>
    </div>
  )
}

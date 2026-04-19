import { useRef, useEffect, useState } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────

const N   = 22          // particle count
const PR  = 5           // particle radius (px in logical coords)
const LW  = 480         // logical canvas width
const LH  = 260         // logical canvas height
const MAX_BOX_W = LW * 0.88
const MAX_BOX_H = LH * 0.82
const BASE_SPEED = 90   // px/s at temp = 1.0

const COLORS = [
  '#818cf8', '#60a5fa', '#34d399', '#f472b6',
  '#fbbf24', '#a78bfa', '#fb923c', '#4ade80',
  '#38bdf8', '#e879f9', '#f87171', '#2dd4bf',
]

// ── Types ──────────────────────────────────────────────────────────────────────

interface Particle { x: number; y: number; vx: number; vy: number; ci: number }

// ── Helpers ────────────────────────────────────────────────────────────────────

function getBox(vol: number) {
  const w = MAX_BOX_W * vol, h = MAX_BOX_H * vol
  return { x: (LW - w) / 2, y: (LH - h) / 2, w, h }
}

function makeParticles(vol: number, spd: number): Particle[] {
  const { x: bx, y: by, w: bw, h: bh } = getBox(vol)
  return Array.from({ length: N }, (_, i) => {
    const angle = (i / N) * Math.PI * 2 + Math.random()
    const s     = spd * (0.75 + Math.random() * 0.5)
    return {
      x: bx + PR * 2 + Math.random() * (bw - PR * 4),
      y: by + PR * 2 + Math.random() * (bh - PR * 4),
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s,
      ci: i % COLORS.length,
    }
  })
}

// Interpolate wall color from dim gray → bright violet based on glow [0–1]
function wallColor(g: number): string {
  const r = Math.round(42  + g * 125)
  const gg = Math.round(45  + g * 94)
  const b = Math.round(62  + g * 188)
  return `rgb(${r},${gg},${b})`
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function GasSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // All fast-changing sim state in refs (not React state) to avoid re-renders
  const psRef  = useRef<Particle[]>([])
  const wgRef  = useRef([0, 0, 0, 0])   // wall glow: top, right, bottom, left
  const ctRef  = useRef<number[]>([])    // collision timestamps (last 1s window)
  const aidRef = useRef(0)
  const ltRef  = useRef(0)

  // Slider values live in both React state (for the UI) and refs (for the loop)
  const [vol,  setVolState]  = useState(0.70)
  const [temp, setTempState] = useState(1.00)
  const [cps,  setCps]       = useState(0)    // collisions per second
  const volRef  = useRef(0.70)
  const tempRef = useRef(1.00)

  function setVol(v: number) {
    volRef.current = v
    setVolState(v)
    const b = getBox(v)
    for (const p of psRef.current) {
      p.x = Math.max(b.x + PR, Math.min(b.x + b.w - PR, p.x))
      p.y = Math.max(b.y + PR, Math.min(b.y + b.h - PR, p.y))
    }
  }

  function setTemp(t: number) {
    const ratio = t / tempRef.current
    tempRef.current = t
    setTempState(t)
    for (const p of psRef.current) { p.vx *= ratio; p.vy *= ratio }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = LW * dpr
    canvas.height = LH * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    psRef.current = makeParticles(volRef.current, BASE_SPEED * tempRef.current)

    let pressTimer = 0

    function frame(time: number) {
      const dt = Math.min((time - ltRef.current) / 1000, 0.05)
      ltRef.current = time

      const { x: bx, y: by, w: bw, h: bh } = getBox(volRef.current)
      const wg = wgRef.current
      const ps = psRef.current

      // ── Physics ──────────────────────────────────────────────────────────
      for (const p of ps) {
        p.x += p.vx * dt
        p.y += p.vy * dt

        if (p.x - PR < bx)       { p.x = bx + PR;       p.vx =  Math.abs(p.vx); wg[3] = Math.min(1, wg[3] + 0.65); ctRef.current.push(time) }
        if (p.x + PR > bx + bw)  { p.x = bx + bw - PR;  p.vx = -Math.abs(p.vx); wg[1] = Math.min(1, wg[1] + 0.65); ctRef.current.push(time) }
        if (p.y - PR < by)       { p.y = by + PR;        p.vy =  Math.abs(p.vy); wg[0] = Math.min(1, wg[0] + 0.65); ctRef.current.push(time) }
        if (p.y + PR > by + bh)  { p.y = by + bh - PR;   p.vy = -Math.abs(p.vy); wg[2] = Math.min(1, wg[2] + 0.65); ctRef.current.push(time) }
      }

      // Decay wall glow
      for (let i = 0; i < 4; i++) wg[i] = Math.max(0, wg[i] - dt * 4.5)

      // Rolling collision window
      ctRef.current = ctRef.current.filter(t => time - t < 1000)

      // Throttle React state updates (~6× per second)
      pressTimer += dt
      if (pressTimer > 0.16) { pressTimer = 0; setCps(ctRef.current.length) }

      // ── Draw ─────────────────────────────────────────────────────────────
      ctx.fillStyle = '#090c14'
      ctx.fillRect(0, 0, LW, LH)

      // Box walls (each segment coloured independently)
      ctx.lineWidth = 2.5
      ctx.lineCap   = 'square'

      const segs: [number, number, number, number, number][] = [
        [bx,       by,       bx + bw, by,       wg[0]],  // top
        [bx + bw,  by,       bx + bw, by + bh,  wg[1]],  // right
        [bx,       by + bh,  bx + bw, by + bh,  wg[2]],  // bottom
        [bx,       by,       bx,      by + bh,  wg[3]],  // left
      ]
      for (const [x1, y1, x2, y2, g] of segs) {
        ctx.strokeStyle = wallColor(g)
        if (g > 0.05) {
          ctx.save()
          ctx.shadowColor  = `rgba(167,139,250,${g * 0.7})`
          ctx.shadowBlur   = 8 + g * 10
        }
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        if (g > 0.05) ctx.restore()
      }

      // Particles
      for (const p of ps) {
        const col = COLORS[p.ci]
        ctx.beginPath()
        ctx.arc(p.x, p.y, PR, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.fill()
        // soft outer glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, PR + 3, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(p.x, p.y, PR - 1, p.x, p.y, PR + 4)
        grad.addColorStop(0, col + '44')
        grad.addColorStop(1, col + '00')
        ctx.fillStyle = grad
        ctx.fill()
      }

      aidRef.current = requestAnimationFrame(frame)
    }

    aidRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(aidRef.current)
  }, [])

  // ── Derived display values ────────────────────────────────────────────────────

  // Theoretical relative pressure vs reference state (vol=0.7, temp=1.0)
  const relP = (0.7 / vol) * temp
  const barW = Math.min(100, Math.round((relP / 4) * 100))  // 4× reference = full bar
  const pressLabel =
    relP < 0.6  ? 'Very Low'  :
    relP < 0.9  ? 'Low'       :
    relP < 1.3  ? 'Moderate'  :
    relP < 2.0  ? 'High'      : 'Very High'
  const pressColor =
    relP < 0.9  ? '#4ade80' :
    relP < 1.3  ? '#fbbf24' :
    relP < 2.0  ? '#fb923c' : '#f87171'

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">
        Gas Particle Simulation — Kinetic Molecular Theory
      </h3>

      {/* Canvas */}
      <div className="rounded-sm border border-border overflow-hidden bg-[#090c14]">
        <canvas
          ref={canvasRef}
          style={{ width: LW, height: LH, display: 'block', maxWidth: '100%' }}
        />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-secondary">Volume (box size)</span>
            <span className="font-mono text-xs text-dim">{Math.round(vol * 100)}%</span>
          </div>
          <input
            type="range" min="0.28" max="1.0" step="0.01" value={vol}
            onChange={e => setVol(parseFloat(e.target.value))}
            className="w-full accent-violet-400 cursor-pointer"
          />
          <p className="font-mono text-xs text-secondary">Smaller box → higher pressure (Boyle's Law)</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-secondary">Temperature</span>
            <span className="font-mono text-xs text-dim">{Math.round(temp * 100)}%</span>
          </div>
          <input
            type="range" min="0.35" max="2.2" step="0.05" value={temp}
            onChange={e => setTemp(parseFloat(e.target.value))}
            className="w-full accent-violet-400 cursor-pointer"
          />
          <p className="font-mono text-xs text-secondary">Higher temp → faster particles → higher pressure</p>
        </div>
      </div>

      {/* Pressure indicator */}
      <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-secondary">Relative Pressure</span>
          <span className="font-mono text-sm font-semibold" style={{ color: pressColor }}>
            {relP.toFixed(2)}× · {pressLabel}
          </span>
        </div>
        <div className="h-2 rounded-full bg-raised overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-200"
            style={{ width: `${barW}%`, background: pressColor }}
          />
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <p className="font-mono text-xs text-secondary">
            P₁V₁/T₁ = P₂V₂/T₂ &nbsp;·&nbsp; {cps} wall hits/s
          </p>
          <p className="font-mono text-xs text-secondary">
            Walls glow on impact
          </p>
        </div>
      </div>
    </div>
  )
}

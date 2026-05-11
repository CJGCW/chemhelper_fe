import { useState } from 'react'

const SVG_W = 300, SVG_H = 220
const cx = 150, cy = 110
const CIRCLE_R = 46
const FRONT_BL = 66
const BACK_BL = 48
const FRONT_ANGLES = [0, 120, 240]   // 0=up, clockwise

// Bearing math: 0=up, clockwise, y-axis inverted in SVG
function toXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

// Butane energy curve: E(φ)=9.5+2.53cos(φ)+6.97cos(3φ) kJ/mol (relative to 0 at anti)
function butaneEnergy(deg: number): number {
  const r = (deg * Math.PI) / 180
  return 9.5 + 2.53 * Math.cos(r) + 6.97 * Math.cos(3 * r)
}

function conformLabel(φ: number): string {
  const n = ((φ % 360) + 360) % 360
  if (n < 20 || n > 340) return 'Totally Eclipsed'
  if (n >= 45 && n <= 75)   return 'Gauche'
  if (n >= 105 && n <= 135) return 'Eclipsed'
  if (n >= 165 && n <= 195) return 'Anti'
  if (n >= 225 && n <= 255) return 'Eclipsed'
  if (n >= 285 && n <= 315) return 'Gauche'
  return `φ = ${n}°`
}

interface SubLabel { front: string; back: string }

const ETHANE_SUBS:  SubLabel[] = [{ front: 'H', back: 'H' }, { front: 'H', back: 'H' }, { front: 'H', back: 'H' }]
const BUTANE_SUBS:  SubLabel[] = [{ front: 'CH₃', back: 'CH₃' }, { front: 'H', back: 'H' }, { front: 'H', back: 'H' }]

interface Props { mode?: 'ethane' | 'butane' }

export default function NewmanProjectionViewer({ mode = 'butane' }: Props) {
  const [angle, setAngle] = useState(180)
  const subs = mode === 'ethane' ? ETHANE_SUBS : BUTANE_SUBS
  const energy = butaneEnergy(angle)
  const label  = conformLabel(angle)

  // Energy diagram
  const DX = 20, DY = 172, DW = 260, DH = 40, MAX_E = 22
  const pts = Array.from({ length: 361 }, (_, i) => {
    const e = butaneEnergy(i)
    return `${i === 0 ? 'M' : 'L'}${(DX + (i / 360) * DW).toFixed(1)},${(DY + DH - (e / MAX_E) * DH).toFixed(1)}`
  }).join(' ')
  const indicator = { x: DX + (angle / 360) * DW, y: DY + DH - (energy / MAX_E) * DH }

  function FrontBond({ a, label: lbl, i }: { a: number; label: string; i: number }) {
    const end = toXY(a, FRONT_BL)
    const tip = toXY(a, FRONT_BL + 16)
    return (
      <g key={i}>
        <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(var(--overlay), 0.7)" strokeWidth={2.5} strokeLinecap="round" />
        <text x={tip.x} y={tip.y + 4} textAnchor="middle" fontSize={11} fill="rgba(var(--overlay), 0.9)" fontFamily="monospace">{lbl}</text>
      </g>
    )
  }

  function BackBond({ a, label: lbl, i }: { a: number; label: string; i: number }) {
    const start = toXY(a, CIRCLE_R + 5)
    const end   = toXY(a, CIRCLE_R + BACK_BL)
    const tip   = toXY(a, CIRCLE_R + BACK_BL + 16)
    return (
      <g key={i}>
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(var(--overlay), 0.55)" strokeWidth={2.5} strokeLinecap="round" />
        <text x={tip.x} y={tip.y + 4} textAnchor="middle" fontSize={11} fill="rgba(var(--overlay), 0.7)" fontFamily="monospace">{lbl}</text>
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={SVG_W} height={SVG_H} className="block border border-border rounded-sm" style={{ background: 'rgb(var(--color-surface))' }}>
        {/* Back bonds behind circle */}
        {subs.map((s, i) => <BackBond key={i} a={FRONT_ANGLES[i] + angle} label={s.back} i={i} />)}
        {/* Back carbon circle (white fill to cover inner back bonds) */}
        <circle cx={cx} cy={cy} r={CIRCLE_R} stroke="rgba(var(--overlay), 0.5)" strokeWidth={2} fill="rgb(var(--color-surface))" />
        {/* Front bonds over circle */}
        {subs.map((s, i) => <FrontBond key={i} a={FRONT_ANGLES[i]} label={s.front} i={i} />)}
        {/* Front carbon dot */}
        <circle cx={cx} cy={cy} r={5} fill="rgba(var(--overlay), 0.9)" />
        {/* Conformation label */}
        <text x={cx} y={160} textAnchor="middle" fontSize={12} fill="var(--c-halogen)" fontFamily="sans-serif" fontWeight={600}>{label}</text>
        {/* Energy diagram */}
        <path d={pts} fill="none" stroke="color-mix(in srgb, var(--c-halogen) 50%, transparent)" strokeWidth={1.5} />
        <line x1={DX} y1={DY + DH} x2={DX + DW} y2={DY + DH} stroke="rgb(var(--color-border))" strokeWidth={1} />
        <circle cx={indicator.x} cy={indicator.y} r={4} fill="var(--c-halogen)" />
        {[0, 60, 120, 180, 240, 300, 360].map(d => (
          <text key={d} x={DX + (d / 360) * DW} y={DY + DH + 11} textAnchor="middle" fontSize={8} fill="rgba(var(--overlay), 0.4)" fontFamily="monospace">{d}°</text>
        ))}
        <text x={DX} y={DY - 3} fontSize={8} fill="rgba(var(--overlay), 0.4)" fontFamily="monospace">E(kJ/mol)</text>
        <text x={DX + DW} y={DY + DH + 11} textAnchor="end" fontSize={8} fill="rgba(var(--overlay), 0.4)" fontFamily="monospace">φ →</text>
      </svg>

      <div className="flex items-center gap-2 w-full max-w-[300px]">
        <span className="font-mono text-[10px] text-dim shrink-0">0°</span>
        <input type="range" min={0} max={360} step={1} value={angle}
          onChange={e => setAngle(Number(e.target.value))}
          className="flex-1" style={{ accentColor: 'var(--c-halogen)' }} />
        <span className="font-mono text-[10px] text-dim shrink-0">360°</span>
      </div>

      <div className="flex gap-4 font-mono text-xs text-secondary">
        <span>φ = <span className="text-primary">{angle}°</span></span>
        {mode === 'butane' && <span>E ≈ <span className="text-primary">{energy.toFixed(1)} kJ/mol</span></span>}
      </div>
    </div>
  )
}

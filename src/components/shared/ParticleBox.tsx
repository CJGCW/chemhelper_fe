import { useMemo } from 'react'

export interface Particle {
  id: string
  species: string
  label?: string
}

export interface SpeciesColor {
  fill: string
  text: string
}

interface Props {
  particles: Particle[]
  speciesColors: Record<string, SpeciesColor>
  width?: number
  height?: number
  seed?: number
  title?: string
}

// Mulberry32 — fast seeded PRNG for stable layout across re-renders
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s += 0x6D2B79F5
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const R = 15  // particle radius
const FALLBACK_COLOR: SpeciesColor = { fill: '#94a3b8', text: '#1e293b' }

export default function ParticleBox({
  particles,
  speciesColors,
  width = 280,
  height = 180,
  seed = 42,
  title,
}: Props) {
  const n = particles.length

  const positions = useMemo(() => {
    if (n === 0) return []
    const rng = mulberry32(seed)

    const cols = Math.max(1, Math.ceil(Math.sqrt(n * width / height)))
    const rows = Math.max(1, Math.ceil(n / cols))
    const cellW = width  / cols
    const cellH = height / rows

    const cells: { x: number; y: number }[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({ x: cellW * (col + 0.5), y: cellH * (row + 0.5) })
      }
    }

    // Fisher-Yates shuffle
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
    }

    return cells.slice(0, n).map(c => ({
      x: Math.min(Math.max(c.x + (rng() * 2 - 1) * cellW * 0.2, R + 3), width  - R - 3),
      y: Math.min(Math.max(c.y + (rng() * 2 - 1) * cellH * 0.2, R + 3), height - R - 3),
    }))
  }, [n, width, height, seed])

  return (
    <div className="flex flex-col gap-1.5">
      {title && <p className="font-mono text-xs text-secondary">{title}</p>}
      <svg
        width={width} height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'block',
          border: '1px solid rgb(var(--color-border))',
          borderRadius: '6px',
          background: 'rgb(var(--color-base))',
        }}
        aria-label={title}
      >
        {particles.map((p, i) => {
          const pos = positions[i]
          if (!pos) return null
          const color = speciesColors[p.species] ?? FALLBACK_COLOR
          const lbl = p.label ?? p.species
          const fontSize = lbl.length > 2 ? 8 : lbl.length > 1 ? 9 : 11
          return (
            <g key={p.id}>
              <circle cx={pos.x} cy={pos.y} r={R} fill={color.fill} opacity={0.9} />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="central"
                fill={color.text}
                fontSize={fontSize}
                fontWeight="bold"
                fontFamily="'Courier New', monospace"
                style={{ userSelect: 'none' }}
              >
                {lbl}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

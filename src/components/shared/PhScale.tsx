export interface PhScaleProps {
  pH: number | null
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

export default function PhScale({ pH, label, orientation = 'horizontal' }: PhScaleProps) {
  if (orientation === 'vertical') {
    // Vertical not yet needed; render horizontal
  }

  const pct = pH !== null ? Math.max(0, Math.min(100, (pH / 14) * 100)) : null

  // Color stops for the pH gradient
  const gradient = 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1, #8b5cf6)'

  return (
    <div className="flex flex-col gap-1 w-full select-none">
      {/* Bar + marker */}
      <div className="relative w-full h-5 rounded-full overflow-visible">
        {/* Gradient bar */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />
        {/* Marker */}
        {pct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${pct}%` }}
          >
            <div
              className="w-4 h-7 rounded-sm border-2 border-white shadow-lg"
              style={{
                background: interpolatePhColor(pH!),
                filter: 'brightness(0.85)',
              }}
            />
          </div>
        )}
      </div>

      {/* Number scale */}
      <div className="flex items-center justify-between font-mono text-[9px] text-dim px-0.5">
        {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(v => (
          <span key={v}>{v}</span>
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between font-mono text-[9px] px-0.5">
        <span style={{ color: '#ef4444' }}>Acidic</span>
        <span style={{ color: '#22c55e' }}>Neutral</span>
        <span style={{ color: '#6366f1' }}>Basic</span>
      </div>

      {/* pH readout */}
      {pH !== null && (
        <div className="text-center font-mono text-sm font-semibold" style={{ color: interpolatePhColor(pH) }}>
          {label ? `${label}: ` : ''}{pH !== null ? `pH = ${pH.toFixed(2)}` : ''}
        </div>
      )}
    </div>
  )
}

function interpolatePhColor(pH: number): string {
  // Match the gradient stops: red→orange→yellow→green→blue→indigo→violet
  if (pH <= 0)  return '#ef4444'
  if (pH <= 3)  return blendColors('#ef4444', '#f97316', pH / 3)
  if (pH <= 5)  return blendColors('#f97316', '#eab308', (pH - 3) / 2)
  if (pH <= 7)  return blendColors('#eab308', '#22c55e', (pH - 5) / 2)
  if (pH <= 9)  return blendColors('#22c55e', '#3b82f6', (pH - 7) / 2)
  if (pH <= 11) return blendColors('#3b82f6', '#6366f1', (pH - 9) / 2)
  if (pH <= 14) return blendColors('#6366f1', '#8b5cf6', (pH - 11) / 3)
  return '#8b5cf6'
}

function blendColors(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}

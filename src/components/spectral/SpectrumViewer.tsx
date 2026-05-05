import { useState, useRef, useCallback } from 'react'

export interface Peak {
  x: number
  y: number
  label: string
  width: number
  splitting?: string
  integration?: number
}

interface Props {
  type: 'ir' | '1h_nmr' | '13c_nmr' | 'mass_spec'
  peaks: Peak[]
  width?: number
  height?: number
}

const MARGIN = { top: 20, right: 30, bottom: 40, left: 52 }

// Gaussian curve value
function gaussian(x: number, center: number, width: number, amplitude: number): number {
  const sigma = width / 2.355
  return amplitude * Math.exp(-((x - center) ** 2) / (2 * sigma ** 2))
}

function useZoom() {
  const [zoom, setZoom] = useState<{ xMin: number; xMax: number } | null>(null)
  const dragging = useRef<{ startX: number; startPx: number } | null>(null)

  function onMouseDown(e: React.MouseEvent, xMin: number, xMax: number, svgLeft: number, plotW: number) {
    const frac = (e.clientX - svgLeft) / plotW
    const x = xMin + frac * (xMax - xMin)
    dragging.current = { startX: x, startPx: e.clientX }
  }

  function onMouseUp(e: React.MouseEvent, xMin: number, xMax: number, svgLeft: number, plotW: number) {
    if (!dragging.current) return
    const endFrac = (e.clientX - svgLeft) / plotW
    const endX = xMin + endFrac * (xMax - xMin)
    const a = Math.min(dragging.current.startX, endX)
    const b = Math.max(dragging.current.startX, endX)
    if (Math.abs(b - a) > (xMax - xMin) * 0.02) {
      setZoom({ xMin: a, xMax: b })
    }
    dragging.current = null
  }

  function reset() { setZoom(null) }

  return { zoom, onMouseDown, onMouseUp, reset }
}

export default function SpectrumViewer({ type, peaks, width = 560, height = 240 }: Props) {
  const plotW = width - MARGIN.left - MARGIN.right
  const plotH = height - MARGIN.top - MARGIN.bottom

  const [tooltip, setTooltip] = useState<{ x: number; y: number; peak: Peak } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { zoom, onMouseDown, onMouseUp, reset } = useZoom()

  // ── Axis bounds ──────────────────────────────────────────────────────────────

  function axisConfig() {
    if (type === 'ir')
      return { dataXMin: 400, dataXMax: 4000, reversed: true, yLabel: '%T', xLabel: 'Wavenumber (cm⁻¹)' }
    if (type === '1h_nmr')
      return { dataXMin: 0, dataXMax: 12, reversed: true, yLabel: 'Intensity', xLabel: 'δ (ppm)' }
    if (type === '13c_nmr')
      return { dataXMin: 0, dataXMax: 220, reversed: true, yLabel: 'Intensity', xLabel: 'δ (ppm)' }
    return { dataXMin: 0, dataXMax: peaks.length > 0 ? Math.max(...peaks.map(p => p.x)) * 1.1 : 500, reversed: false, yLabel: 'Rel. Abundance (%)', xLabel: 'm/z' }
  }

  const { dataXMin: baseXMin, dataXMax: baseXMax, reversed, yLabel, xLabel } = axisConfig()
  const xMin = zoom ? zoom.xMin : baseXMin
  const xMax = zoom ? zoom.xMax : baseXMax

  // Map data x → pixel x (respects reversed axes)
  const xPx = useCallback((dataX: number): number => {
    const frac = reversed
      ? (dataX - xMax) / (xMin - xMax)
      : (dataX - xMin) / (xMax - xMin)
    return frac * plotW
  }, [xMin, xMax, plotW, reversed])

  // ── Grid lines ───────────────────────────────────────────────────────────────

  function gridTicks(): number[] {
    const span = xMax - xMin
    const rough = span / 6
    const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
    const nice = [1, 2, 2.5, 5, 10].map(f => f * magnitude).find(f => f >= rough) ?? magnitude
    const first = Math.ceil(xMin / nice) * nice
    const ticks: number[] = []
    for (let t = first; t <= xMax + 1e-9; t += nice) ticks.push(Math.round(t * 1000) / 1000)
    return ticks
  }

  const ticks = gridTicks()

  // ── IR rendering ─────────────────────────────────────────────────────────────

  function renderIR() {
    const steps = 400
    const xs = Array.from({ length: steps }, (_, i) => xMin + (i / (steps - 1)) * (xMax - xMin))
    const ys = xs.map(x => {
      let t = 1.0
      for (const p of peaks) {
        const w = Math.max(p.width || 40, 10)
        const dip = gaussian(x, p.x, w, Math.min(p.y, 0.95))
        t -= dip
      }
      return Math.max(0, Math.min(1, t))
    })

    const pts = xs.map((x, i) => `${MARGIN.left + xPx(x)},${MARGIN.top + plotH * (1 - ys[i])}`).join(' ')
    return <polyline points={pts} fill="none" stroke="var(--c-halogen)" strokeWidth={1.5} />
  }

  // ── NMR rendering ────────────────────────────────────────────────────────────

  function renderNMR() {
    const maxY = peaks.length > 0 ? Math.max(...peaks.map(p => p.y)) : 1
    return peaks.map((peak, pi) => {
      const cx = MARGIN.left + xPx(peak.x)
      const peakH = (peak.y / maxY) * plotH * 0.8
      const w = Math.max(peak.width || 0.05, 0.02)
      const steps = 80
      const localMin = peak.x - w * 3
      const localMax = peak.x + w * 3
      const pts = Array.from({ length: steps }, (_, i) => {
        const lx = localMin + (i / (steps - 1)) * (localMax - localMin)
        const ly = gaussian(lx, peak.x, w, peak.y / maxY) * plotH * 0.8
        return `${MARGIN.left + xPx(lx)},${MARGIN.top + plotH - ly}`
      }).join(' ')

      return (
        <g key={pi}>
          <polyline points={pts} fill="none" stroke="var(--c-halogen)" strokeWidth={1.5} />
          {/* Integration step */}
          {peak.integration != null && (
            <line
              x1={cx - 12} y1={MARGIN.top + plotH * 0.05}
              x2={cx + 12} y2={MARGIN.top + plotH * 0.05}
              stroke="rgba(var(--overlay),0.4)" strokeWidth={1.5} />
          )}
          {peak.label && (
            <text x={cx} y={MARGIN.top + plotH - peakH - 6}
              textAnchor="middle" fontSize={9} fontFamily="monospace"
              fill="rgb(var(--overlay)/0.6)">{peak.label}</text>
          )}
        </g>
      )
    })
  }

  // ── MS rendering ─────────────────────────────────────────────────────────────

  function renderMS() {
    if (peaks.length === 0) return null
    const maxY = Math.max(...peaks.map(p => p.y))
    const mPlus = Math.max(...peaks.map(p => p.x))
    return peaks.map((peak, pi) => {
      const px = MARGIN.left + xPx(peak.x)
      const barH = (peak.y / maxY) * plotH * 0.9
      const isBase = peak.y === maxY
      const isMPlus = peak.x === mPlus

      return (
        <g key={pi}>
          <line x1={px} y1={MARGIN.top + plotH} x2={px} y2={MARGIN.top + plotH - barH}
            stroke={isBase ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.5)'}
            strokeWidth={isBase ? 2 : 1.5} />
          {(isBase || isMPlus || peak.label) && (
            <text x={px} y={MARGIN.top + plotH - barH - 4}
              textAnchor="middle" fontSize={9} fontFamily="monospace"
              fill="rgb(var(--overlay)/0.7)">
              {isBase ? 'base' : isMPlus ? 'M⁺' : peak.label}
            </text>
          )}
        </g>
      )
    })
  }

  // ── Tooltip on hover ─────────────────────────────────────────────────────────

  function handleMouseMove(e: React.MouseEvent) {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const svgX = e.clientX - rect.left - MARGIN.left
    const dataX = reversed
      ? xMin + (1 - svgX / plotW) * (xMax - xMin)
      : xMin + (svgX / plotW) * (xMax - xMin)

    const nearest = peaks.reduce<{ dist: number; peak: Peak | null }>((best, p) => {
      const d = Math.abs(p.x - dataX)
      return d < best.dist ? { dist: d, peak: p } : best
    }, { dist: Infinity, peak: null })

    const threshold = (xMax - xMin) * 0.04
    if (nearest.peak && nearest.dist < threshold) {
      setTooltip({ x: MARGIN.left + xPx(nearest.peak.x), y: e.clientY - rect.top, peak: nearest.peak })
    } else {
      setTooltip(null)
    }
  }

  const svgLeft = svgRef.current?.getBoundingClientRect().left ?? 0

  return (
    <div className="relative select-none" style={{ width, height }}>
      <svg
        ref={svgRef}
        width={width} height={height}
        className="block border border-border rounded-sm"
        style={{ background: 'rgb(var(--color-surface))' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        onMouseDown={e => onMouseDown(e, xMin, xMax, svgLeft, plotW)}
        onMouseUp={e => onMouseUp(e, xMin, xMax, svgLeft, plotW)}
        onDoubleClick={reset}
      >
        {/* Grid */}
        {ticks.map(t => {
          const px = MARGIN.left + xPx(t)
          if (px < MARGIN.left - 1 || px > MARGIN.left + plotW + 1) return null
          return (
            <g key={t}>
              <line x1={px} y1={MARGIN.top} x2={px} y2={MARGIN.top + plotH}
                stroke="rgba(var(--overlay),0.1)" strokeWidth={1} />
              <text x={px} y={MARGIN.top + plotH + 14}
                textAnchor="middle" fontSize={9} fontFamily="monospace"
                fill="rgba(var(--overlay),0.45)">{t}</text>
            </g>
          )
        })}
        {/* Y-axis ticks */}
        {[0, 25, 50, 75, 100].map(pct => {
          const py = MARGIN.top + plotH * (1 - pct / 100)
          return (
            <g key={pct}>
              <line x1={MARGIN.left} y1={py} x2={MARGIN.left + plotW} y2={py}
                stroke="rgba(var(--overlay),0.06)" strokeWidth={1} />
              <text x={MARGIN.left - 4} y={py + 3}
                textAnchor="end" fontSize={9} fontFamily="monospace"
                fill="rgba(var(--overlay),0.35)">{pct}</text>
            </g>
          )
        })}

        {/* Axes */}
        <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + plotH}
          stroke="rgba(var(--overlay),0.3)" strokeWidth={1} />
        <line x1={MARGIN.left} y1={MARGIN.top + plotH} x2={MARGIN.left + plotW} y2={MARGIN.top + plotH}
          stroke="rgba(var(--overlay),0.3)" strokeWidth={1} />

        {/* Axis labels */}
        <text x={MARGIN.left + plotW / 2} y={height - 4}
          textAnchor="middle" fontSize={10} fontFamily="monospace"
          fill="rgba(var(--overlay),0.5)">{xLabel}</text>
        <text x={12} y={MARGIN.top + plotH / 2}
          textAnchor="middle" fontSize={10} fontFamily="monospace"
          fill="rgba(var(--overlay),0.5)"
          transform={`rotate(-90, 12, ${MARGIN.top + plotH / 2})`}>{yLabel}</text>

        {/* Spectrum */}
        {type === 'ir' && renderIR()}
        {(type === '1h_nmr' || type === '13c_nmr') && renderNMR()}
        {type === 'mass_spec' && renderMS()}

        {/* Tooltip crosshair */}
        {tooltip && (
          <line x1={tooltip.x} y1={MARGIN.top} x2={tooltip.x} y2={MARGIN.top + plotH}
            stroke="rgba(var(--overlay),0.25)" strokeWidth={1} strokeDasharray="3 2" />
        )}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 px-2 py-1 rounded-sm border border-border text-xs font-mono"
          style={{
            left: tooltip.x + 8, top: tooltip.y - 4,
            background: 'rgb(var(--color-raised))',
            color: 'var(--c-halogen)',
            transform: tooltip.x > plotW * 0.6 ? 'translateX(-100%) translateX(-16px)' : undefined,
          }}>
          <div>{tooltip.peak.x.toFixed(type === 'ir' ? 0 : 2)}</div>
          {tooltip.peak.label && <div className="text-secondary">{tooltip.peak.label}</div>}
          {tooltip.peak.splitting && <div className="text-secondary">{tooltip.peak.splitting}</div>}
        </div>
      )}

      {zoom && (
        <button
          onClick={reset}
          className="absolute top-1 right-1 font-mono text-[9px] px-1.5 py-0.5 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
          style={{ background: 'rgb(var(--color-raised))' }}>
          reset zoom
        </button>
      )}
    </div>
  )
}

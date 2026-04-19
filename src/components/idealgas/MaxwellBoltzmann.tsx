import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const R_J = 8.314  // J/(mol·K)

const PRESETS = [
  { label: 'H₂',  M: 0.002016 },
  { label: 'He',  M: 0.004003 },
  { label: 'CH₄', M: 0.016043 },
  { label: 'N₂',  M: 0.028014 },
  { label: 'O₂',  M: 0.031998 },
  { label: 'CO₂', M: 0.044010 },
  { label: 'Cl₂', M: 0.070906 },
]

function mbf(v: number, T: number, M_kg: number): number {
  if (v <= 0) return 0
  const coeff = 4 * Math.PI * Math.pow(M_kg / (2 * Math.PI * R_J * T), 1.5)
  return coeff * v * v * Math.exp(-M_kg * v * v / (2 * R_J * T))
}

function vMp(T: number, M: number)  { return Math.sqrt(2 * R_J * T / M) }
function vAvg(T: number, M: number) { return Math.sqrt(8 * R_J * T / (Math.PI * M)) }
function vRms(T: number, M: number) { return Math.sqrt(3 * R_J * T / M) }

// ── SVG layout ─────────────────────────────────────────────────────────────────

const SVG_W = 500, SVG_H = 210
const ML = 10, MR = 16, MT = 14, MB = 28
const PW = SVG_W - ML - MR
const PH = SVG_H - MT - MB

const C2 = '#fb923c'    // comparison gas
const C_MP  = '#fbbf24' // v_mp
const C_AVG = '#60a5fa' // v_avg
const C_RMS = '#f472b6' // v_rms

// ── Component ──────────────────────────────────────────────────────────────────

export default function MaxwellBoltzmann() {
  const [T,       setT]          = useState(300)
  const [idx1,    setIdx1]       = useState(3)   // N₂
  const [compare, setCompare]    = useState(false)
  const [idx2,    setIdx2]       = useState(0)   // H₂

  const M1 = PRESETS[idx1].M
  const M2 = PRESETS[idx2].M

  const mp1 = vMp(T, M1),  avg1 = vAvg(T, M1),  rms1 = vRms(T, M1)
  const mp2 = vMp(T, M2),  avg2 = vAvg(T, M2),  rms2 = vRms(T, M2)

  // x-range: floored to N₂'s rms so gases on the same scale look visually different.
  // Heavier gases produce narrower peaks shifted left; lighter gases push the range right.
  const rmsRef = vRms(T, PRESETS[3].M)  // N₂ as reference floor
  const xMax = (compare ? Math.max(rms1, rms2, rmsRef) : Math.max(rms1, rmsRef)) * 4.5

  // y-normalise to the tallest peak
  const fPeak1 = mbf(mp1, T, M1)
  const fPeak2 = mbf(mp2, T, M2)
  const fMax   = compare ? Math.max(fPeak1, fPeak2) : fPeak1

  function toX(v: number) { return ML + (v / xMax) * PW }
  function toY(f: number) { return MT + PH - (f / fMax) * PH * 0.88 }
  const baseY = MT + PH

  const path1 = useMemo(() => {
    const N = 300
    return Array.from({ length: N + 1 }, (_, i) => {
      const v = (i / N) * xMax
      const f = mbf(v, T, M1)
      return `${i === 0 ? 'M' : 'L'}${(ML + (v / xMax) * PW).toFixed(1)},${(MT + PH - (f / fMax) * PH * 0.88).toFixed(1)}`
    }).join('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T, M1, xMax, fMax])

  const path2 = useMemo(() => {
    if (!compare) return ''
    const N = 300
    return Array.from({ length: N + 1 }, (_, i) => {
      const v = (i / N) * xMax
      const f = mbf(v, T, M2)
      return `${i === 0 ? 'M' : 'L'}${(ML + (v / xMax) * PW).toFixed(1)},${(MT + PH - (f / fMax) * PH * 0.88).toFixed(1)}`
    }).join('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T, M2, xMax, fMax, compare])

  // x-axis ticks
  const tickStep = Math.ceil(xMax / 5 / 100) * 100
  const xTicks = Array.from(
    { length: Math.floor(xMax / tickStep) },
    (_, i) => (i + 1) * tickStep
  ).filter(v => v < xMax * 0.97)

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        The Maxwell-Boltzmann distribution describes the range of molecular speeds in an ideal gas.
        Higher T or lower M shifts the peak to higher speeds and broadens the curve.
      </p>

      {/* Gas selector */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-secondary">Gas</span>
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => setIdx1(i)}
                className="px-2.5 py-1 rounded-sm font-mono text-sm transition-colors"
                style={idx1 === i ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                } : {
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.4)',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature slider */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-secondary w-4">T</span>
          <input type="range" min="100" max="1500" step="10" value={T}
            onChange={e => setT(Number(e.target.value))}
            className="flex-1 max-w-xs"
            style={{ accentColor: 'var(--c-halogen)' }} />
          <span className="font-mono text-sm text-bright w-16">{T} K</span>
          <span className="font-mono text-xs text-dim">{(T - 273.15).toFixed(0)} °C</span>
        </div>
      </div>

      {/* SVG Plot */}
      <div className="rounded-sm border border-border overflow-hidden" style={{ background: '#0a0c12' }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: 'block' }}>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => {
            const y = MT + PH * (1 - frac * 0.88)
            return <line key={frac} x1={ML} y1={y} x2={ML + PW} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          })}

          {/* Axes */}
          <line x1={ML} y1={MT} x2={ML} y2={baseY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={ML} y1={baseY} x2={ML + PW} y2={baseY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* X-axis ticks */}
          {xTicks.map(v => {
            const x = toX(v)
            return (
              <g key={v}>
                <line x1={x} y1={baseY} x2={x} y2={baseY + 4} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <text x={x} y={baseY + 13} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle">{v}</text>
              </g>
            )
          })}

          {/* Axis labels */}
          <text x={ML + PW / 2} y={SVG_H - 2} fontSize="9" fill="rgba(255,255,255,0.25)" textAnchor="middle">
            speed (m/s)
          </text>
          <text x={7} y={MT + PH / 2} fontSize="8" fill="rgba(255,255,255,0.2)" textAnchor="middle"
            transform={`rotate(-90, 7, ${MT + PH / 2})`}>
            f(v)
          </text>

          {/* Speed lines (gas 1) */}
          {[
            { v: mp1,  color: C_MP,  label: 'v_mp'  },
            { v: avg1, color: C_AVG, label: 'v_avg' },
            { v: rms1, color: C_RMS, label: 'v_rms' },
          ].map(({ v, color, label }) => {
            if (v > xMax * 0.97) return null
            const x = toX(v)
            return (
              <g key={label}>
                <line x1={x} y1={MT} x2={x} y2={baseY}
                  stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.65" />
                <text x={x + 3} y={MT + 9} fontSize="8" fill={color} opacity="0.8">{label}</text>
              </g>
            )
          })}

          {/* Fill areas */}
          {compare && path2 && (
            <path
              d={`${path2} L${toX(xMax).toFixed(1)},${baseY} L${ML},${baseY} Z`}
              fill={C2} opacity="0.07"
            />
          )}
          <path
            d={`${path1} L${toX(xMax).toFixed(1)},${baseY} L${ML},${baseY} Z`}
            fill="var(--c-halogen)" opacity="0.08"
          />

          {/* Curves */}
          {compare && path2 && (
            <path d={path2} fill="none" stroke={C2} strokeWidth="2" opacity="0.8" />
          )}
          <path d={path1} fill="none" stroke="var(--c-halogen)" strokeWidth="2.5" />

          {/* Gas labels on curve */}
          {compare && path2 && (
            <text
              x={toX(mp2) + 4} y={toY(fPeak2) - 5}
              fontSize="9" fill={C2} opacity="0.85"
            >
              {PRESETS[idx2].label}
            </text>
          )}
          <text
            x={toX(mp1) + 4} y={toY(fPeak1) - 5}
            fontSize="9" fill="var(--c-halogen)" opacity="0.85"
          >
            {PRESETS[idx1].label}
          </text>
        </svg>
      </div>

      {/* Speed statistics */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {[
          { label: 'v_mp',  v: mp1,  color: C_MP,  desc: 'most probable' },
          { label: 'v_avg', v: avg1, color: C_AVG, desc: 'mean speed'     },
          { label: 'v_rms', v: rms1, color: C_RMS, desc: 'rms speed'      },
        ].map(({ label, v, color, desc }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-0.5 rounded-full" style={{ background: color }} />
              <span className="font-mono text-xs" style={{ color }}>{label}</span>
            </div>
            <span className="font-mono text-sm text-bright">{Math.round(v)} m/s</span>
            <span className="font-mono text-xs text-secondary">{desc}</span>
          </div>
        ))}
        <div className="flex flex-col gap-0.5 border-l border-border pl-5 ml-1">
          <span className="font-mono text-xs text-secondary">KE_avg / mol</span>
          <span className="font-mono text-sm text-bright">{(1.5 * R_J * T / 1000).toFixed(3)} kJ/mol</span>
          <span className="font-mono text-xs text-secondary">= ³⁄₂RT</span>
        </div>
      </div>

      {/* Compare toggle */}
      <div className="flex flex-col gap-3">
        <button onClick={() => setCompare(s => !s)}
          className="self-start flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors font-sans text-sm"
          style={compare ? {
            border: '1px solid rgba(251,146,60,0.4)',
            background: 'rgba(251,146,60,0.08)',
            color: C2,
          } : {
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.4)',
          }}>
          {compare ? '▼ hide' : '+ Compare gas'}
        </button>

        <AnimatePresence>
          {compare && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-6 h-0.5 rounded-full" style={{ background: C2 }} />
                  {PRESETS.map((p, i) => (
                    <button key={p.label} onClick={() => setIdx2(i)}
                      className="px-2.5 py-1 rounded-sm font-mono text-sm transition-colors"
                      style={idx2 === i ? {
                        background: 'rgba(251,146,60,0.12)',
                        border: '1px solid rgba(251,146,60,0.4)',
                        color: C2,
                      } : {
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.4)',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {idx2 !== idx1 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-border">
                    {[
                      { label: 'v_mp',  v: mp2,  color: C_MP  },
                      { label: 'v_avg', v: avg2, color: C_AVG },
                      { label: 'v_rms', v: rms2, color: C_RMS },
                    ].map(({ label, v, color }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs" style={{ color }}>{label}</span>
                        <span className="font-mono text-sm" style={{ color: C2 }}>{Math.round(v)} m/s</span>
                        <span className="font-mono text-xs text-secondary">{PRESETS[idx2].label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="font-mono text-xs text-secondary">
        f(v) is the probability density — area under the curve between two speeds equals the fraction of molecules in that range. All curves integrate to 1.
      </p>
    </div>
  )
}

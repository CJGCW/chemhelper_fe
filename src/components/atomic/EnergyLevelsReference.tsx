import { useState } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────────

const E_RYDBERG = 13.6   // eV
const HC        = 1240   // eV·nm

function E(n: number) { return -E_RYDBERG / (n * n) }
function fmt(n: number, dp = 3) { return parseFloat(n.toFixed(dp)).toString() }
function fmtSig(n: number, sf = 3) { return parseFloat(n.toPrecision(sf)).toString() }

const LEVELS = [1, 2, 3, 4, 5, 6]

// Approximate visible wavelength colour
function wavelengthColor(nm: number): string | null {
  if (nm < 380 || nm > 780) return null
  if (nm < 450) return '#8b5cf6'   // violet
  if (nm < 495) return '#3b82f6'   // blue
  if (nm < 570) return 'rgb(var(--color-success))'   // green
  if (nm < 590) return '#fbbf24'   // yellow
  if (nm < 625) return 'rgb(var(--color-warning))'   // orange
  return 'rgb(var(--color-error))'                  // red
}

function wavelengthLabel(nm: number): string {
  if (nm < 10)   return 'X-ray / γ-ray'
  if (nm < 380)  return 'UV'
  if (nm < 780)  return 'Visible light'
  if (nm < 1000) return 'Near IR'
  return 'IR'
}

// Photon color for UV/IR transitions not visible in the spectrum
function arrowFallback(nm: number): string {
  return nm < 380 ? '#a855f7' : 'rgb(var(--color-error))'
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EnergyLevelsReference() {
  const [ni, setNi] = useState(3)   // initial (upper) level
  const [nf, setNf] = useState(1)   // final (lower) level

  const Ei    = E(ni)
  const Ef    = E(nf)
  const dE    = Ef - Ei                       // negative for emission (downward)
  const absdE = Math.abs(dE)
  const lambda = absdE > 0 ? HC / absdE : null
  const isEmission = dE < 0
  const color = lambda ? wavelengthColor(lambda) : null

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">


      {/* Formula card */}
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Bohr Model Formulas</h3>
        <div className="rounded-sm border border-border bg-surface px-4">
          {[
            { label: 'Energy of level n',         formula: 'Eₙ = −13.6 / n²  eV',           note: 'n = 1, 2, 3, …' },
            { label: 'Transition energy',          formula: 'ΔE = E_final − E_initial',        note: '< 0: emission; > 0: absorption' },
            { label: 'Photon wavelength',          formula: 'λ = 1240 eV·nm / |ΔE|',          note: 'λ in nm' },
            { label: 'Ionization from ground',     formula: 'ΔE = 0 − (−13.6) = 13.6 eV',     note: 'minimum energy to free the electron' },
          ].map(r => (
            <div key={r.label}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-border last:border-b-0">
              <span className="font-sans text-sm text-secondary sm:w-52 sm:shrink-0">{r.label}</span>
              <span className="font-mono text-sm text-bright flex-1">{r.formula}</span>
              <span className="font-mono text-xs text-dim sm:text-right sm:w-52">{r.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Energy level table */}
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Hydrogen Energy Levels</h3>
        <div className="rounded-sm border border-border overflow-hidden">
          <div className="grid grid-cols-[3rem_6rem_6rem_1fr] gap-x-4
                          px-4 py-2 bg-raised border-b border-border">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">n</span>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">E (eV)</span>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">|E| / E₁</span>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Level name</span>
          </div>
          {LEVELS.map(n => (
            <div key={n}
              className="grid grid-cols-[3rem_6rem_6rem_1fr] gap-x-4 items-center
                         px-4 py-2.5 border-b border-border last:border-b-0 bg-surface">
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{n}</span>
              <span className="font-mono text-sm text-bright">{fmt(E(n), 3)}</span>
              <span className="font-mono text-sm text-secondary">{fmtSig(1 / (n * n), 3)}</span>
              <span className="font-sans text-sm text-secondary">
                {n === 1 ? 'Ground state' : `${n === 2 ? '1st' : n === 3 ? '2nd' : n === 4 ? '3rd' : `${n-1}th`} excited state`}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[3rem_6rem_6rem_1fr] gap-x-4 items-center
                          px-4 py-2.5 bg-raised">
            <span className="font-mono text-sm text-dim">∞</span>
            <span className="font-mono text-sm text-dim">0</span>
            <span className="font-mono text-sm text-dim">0</span>
            <span className="font-sans text-sm text-dim">Ionization limit</span>
          </div>
        </div>
      </div>

      {/* Energy level SVG diagram — 1/n visual spacing so higher levels are readable */}
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">
          Energy Diagram
          <span className="normal-case text-dim font-normal"> — 1/n visual spacing</span>
        </h3>
        {(() => {
          const W = 340, H = 260
          const ML = 50, MR = 16, MT = 20, MB = 16
          const PW = W - ML - MR
          const PH_svg = H - MT - MB
          const lineEnd = ML + Math.round(PW * 0.68)
          const arrowX = ML + Math.round(PW * 0.50)

          // 1/n vertical scale: n=1 at bottom, n=∞ at top
          const levelY = (n: number) => MT + PH_svg / n
          const infY = MT + 4

          const arrowColor = color ?? (lambda !== null ? arrowFallback(lambda) : '#888')
          const seriesLabel =
            nf === 1 ? 'Lyman (UV)' :
            nf === 2 ? 'Balmer' :
            nf === 3 ? 'Paschen (IR)' : `n=${nf} series`

          return (
            <svg width={W} height={H} className="block border border-border rounded-sm"
              style={{ background: 'rgb(var(--color-surface))' }}>
              {/* n=∞ ionization limit */}
              <line x1={ML} y1={infY} x2={lineEnd} y2={infY}
                stroke="rgba(var(--overlay),0.2)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={ML - 5} y={infY + 3} textAnchor="end" fontSize={9} fontFamily="monospace"
                fill="rgba(var(--overlay),0.4)">∞</text>
              <text x={lineEnd + 4} y={infY + 3} textAnchor="start" fontSize={8} fontFamily="monospace"
                fill="rgba(var(--overlay),0.25)">0 eV</text>

              {/* Energy levels n=6 down to n=1 */}
              {[6, 5, 4, 3, 2, 1].map(n => {
                const y = levelY(n)
                const isActive = n === ni || n === nf
                return (
                  <g key={n}>
                    <line x1={ML} y1={y} x2={lineEnd} y2={y}
                      stroke={isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.3)'}
                      strokeWidth={isActive ? 2 : 1} />
                    <text x={ML - 5} y={y + 3} textAnchor="end" fontSize={9} fontFamily="monospace"
                      fill={isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.5)'}>n={n}</text>
                    <text x={lineEnd + 4} y={y + 3} textAnchor="start" fontSize={7.5} fontFamily="monospace"
                      fill="rgba(var(--overlay),0.25)">{fmt(E(n), 2)}</text>
                  </g>
                )
              })}

              {/* Transition arrow — visible only when ni ≠ nf */}
              {(() => {
                if (ni === nf) return null
                const y1 = levelY(ni)
                const y2 = levelY(nf)
                const isEmit = ni > nf   // electron drops to lower n
                const midY = (y1 + y2) / 2
                const headSize = 6
                return (
                  <g>
                    <line x1={arrowX} y1={y1} x2={arrowX} y2={y2}
                      stroke={arrowColor} strokeWidth={2.5} strokeLinecap="round" />
                    {isEmit ? (
                      // Arrow head points down (toward smaller n = bottom of diagram)
                      <polygon
                        points={`${arrowX},${y2} ${arrowX - 4},${y2 - headSize} ${arrowX + 4},${y2 - headSize}`}
                        fill={arrowColor} />
                    ) : (
                      // Arrow head points up (toward larger n = top of diagram)
                      <polygon
                        points={`${arrowX},${y2} ${arrowX - 4},${y2 + headSize} ${arrowX + 4},${y2 + headSize}`}
                        fill={arrowColor} />
                    )}
                    <text x={arrowX + 12} y={midY - 3} fontSize={9} fontFamily="sans-serif"
                      fill={arrowColor}>{seriesLabel}</text>
                    {lambda !== null && (
                      <text x={arrowX + 12} y={midY + 10} fontSize={8} fontFamily="monospace"
                        fill="rgba(var(--overlay),0.55)">{Math.round(lambda)} nm</text>
                    )}
                  </g>
                )
              })()}
            </svg>
          )
        })()}
      </div>

      {/* Transition calculator */}
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Transition Calculator</h3>

        {/* Level pickers */}
        <div className="flex flex-wrap items-center gap-4">
          {[
            { label: 'Initial level (nᵢ)', val: ni, set: setNi },
            { label: 'Final level (n_f)',  val: nf, set: setNf },
          ].map(({ label, val, set }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary">{label}</span>
              <div className="flex gap-1">
                {LEVELS.map(n => (
                  <button
                    key={n}
                    onClick={() => set(n)}
                    className="w-8 h-8 rounded-sm font-mono text-sm transition-colors"
                    style={val === n ? {
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    } : {
                      border: '1px solid rgba(var(--overlay),0.12)',
                      color: 'rgba(var(--overlay),0.4)',
                    }}
                  >{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        {ni === nf ? (
          <p className="font-mono text-sm text-dim">Select different initial and final levels.</p>
        ) : (
          <div className="rounded-sm border border-border bg-surface px-4 py-1">
            {[
              { label: `E_${ni} (initial)`, value: `${fmt(Ei, 4)} eV` },
              { label: `E_${nf} (final)`,   value: `${fmt(Ef, 4)} eV` },
              { label: 'ΔE  (E_f − E_i)',   value: `${fmt(dE, 4)} eV` },
              { label: 'Type',              value: isEmission ? `Emission (photon released, n=${ni} → n=${nf})` : `Absorption (photon absorbed, n=${ni} → n=${nf})` },
              ...(lambda ? [{ label: 'Wavelength λ', value: `${fmtSig(lambda, 4)} nm  —  ${wavelengthLabel(lambda)}` }] : []),
            ].map(({ label, value }) => (
              <div key={label}
                className="flex items-baseline gap-4 py-2.5 border-b border-border last:border-b-0">
                <span className="font-mono text-sm text-secondary w-40 shrink-0">{label}</span>
                <span className="font-mono text-sm flex-1"
                  style={{ color: label === 'Wavelength λ' && color ? color : 'var(--tw-prose-body, #e2e8f0)' }}>
                  {value}
                </span>
              </div>
            ))}

            {/* Colour swatch for visible light */}
            {lambda && color && (
              <div className="flex items-center gap-3 py-2.5">
                <span className="font-mono text-sm text-secondary w-40 shrink-0">Visible colour</span>
                <div className="w-16 h-4 rounded-sm" style={{ background: color }} />
                <span className="font-mono text-xs text-dim">{Math.round(lambda)} nm</span>
              </div>
            )}
          </div>
        )}

        <p className="font-mono text-xs text-secondary">
          Rydberg formula for hydrogen. Use E = −13.6 / n² eV and λ = 1240 eV·nm / |ΔE|.
        </p>
      </div>

    </div>
  )
}

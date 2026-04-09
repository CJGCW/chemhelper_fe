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
  if (nm < 570) return '#22c55e'   // green
  if (nm < 590) return '#fbbf24'   // yellow
  if (nm < 625) return '#f97316'   // orange
  return '#ef4444'                  // red
}

function wavelengthLabel(nm: number): string {
  if (nm < 10)   return 'X-ray / γ-ray'
  if (nm < 380)  return 'UV'
  if (nm < 780)  return 'Visible light'
  if (nm < 1000) return 'Near IR'
  return 'IR'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LevelBar({ n, active, ni, nf }: { n: number; active: boolean; ni: number; nf: number }) {
  const isTransition = n === ni || n === nf
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-dim w-5 text-right shrink-0">n={n}</span>
      <div
        className="flex-1 h-px transition-colors"
        style={{
          background: isTransition
            ? 'var(--c-halogen)'
            : active
            ? 'rgba(255,255,255,0.3)'
            : 'rgba(255,255,255,0.12)',
        }}
      />
      <span className="font-mono text-xs w-24 text-right shrink-0"
        style={{ color: isTransition ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
        {fmt(E(n), 3)} eV
      </span>
    </div>
  )
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
    <div className="flex flex-col gap-8 max-w-3xl">

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
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase">n</span>
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase">E (eV)</span>
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase">|E| / E₁</span>
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Level name</span>
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

      {/* Energy level diagram */}
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">
          Energy Diagram
          <span className="normal-case text-dim font-normal"> — levels not to scale</span>
        </h3>
        <div className="rounded-sm border border-border bg-surface px-4 py-5 flex flex-col gap-3">
          {/* n=∞ */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-dim w-5 text-right shrink-0">∞</span>
            <div className="flex-1 h-px border-t border-dashed border-border" />
            <span className="font-mono text-xs text-dim w-24 text-right shrink-0">0 eV (ionization)</span>
          </div>

          {/* n=6 down to n=2 — tightly spaced */}
          {[6, 5, 4, 3, 2].map(n => (
            <LevelBar key={n} n={n} active ni={ni} nf={nf} />
          ))}

          {/* Visual gap between n=2 and n=1 */}
          <div className="flex items-center gap-3 my-2">
            <span className="w-5" />
            <div className="flex-1 flex items-center gap-1">
              <div className="w-4 h-px bg-border" />
              <span className="font-mono text-[9px] text-dim">large gap</span>
              <div className="flex-1 h-px border-t border-dashed border-border opacity-30" />
            </div>
          </div>

          <LevelBar n={1} active ni={ni} nf={nf} />

          {/* Transition arrow annotation */}
          {ni !== nf && (
            <p className="font-mono text-[10px] text-dim mt-1">
              {isEmission ? '↓' : '↑'} n={ni} → n={nf} highlighted · {isEmission ? 'emission' : 'absorption'}
            </p>
          )}
        </div>
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
              <span className="font-mono text-[10px] text-dim">{label}</span>
              <div className="flex gap-1">
                {LEVELS.map(n => (
                  <button
                    key={n}
                    onClick={() => set(n)}
                    className="w-8 h-8 rounded-sm font-mono text-sm transition-colors"
                    style={val === n ? {
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    } : {
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.4)',
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

        <p className="font-mono text-[10px] text-dim">
          Rydberg formula for hydrogen. Use E = −13.6 / n² eV and λ = 1240 eV·nm / |ΔE|.
        </p>
      </div>

    </div>
  )
}

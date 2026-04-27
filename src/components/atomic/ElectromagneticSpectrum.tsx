import { useState } from 'react'

// ── Constants ────────────────────────────────────────────────────────────────

const C = 2.998e8   // m/s
const H = 6.626e-34 // J·s
const EV = 1.602e-19 // J per eV

// ── Spectrum regions ──────────────────────────────────────────────────────────

const REGIONS: {
  name: string
  lambdaMin: number  // metres
  lambdaMax: number
  color: string
  textColor: string
  examples: string[]
}[] = [
  {
    name: 'Gamma',
    lambdaMin: 1e-14, lambdaMax: 1e-11,
    color: '#7c3aed', textColor: '#c4b5fd',
    examples: ['Nuclear decay', 'Cancer therapy'],
  },
  {
    name: 'X-ray',
    lambdaMin: 1e-11, lambdaMax: 1e-8,
    color: '#4f46e5', textColor: '#a5b4fc',
    examples: ['Medical imaging', 'Crystallography'],
  },
  {
    name: 'UV',
    lambdaMin: 1e-8, lambdaMax: 4e-7,
    color: '#7c3aed', textColor: '#d8b4fe',
    examples: ['Sunburn', 'Sterilisation', 'Fluorescence'],
  },
  {
    name: 'Visible',
    lambdaMin: 4e-7, lambdaMax: 7e-7,
    color: 'linear-gradient(to right,#6d28d9,#1d4ed8,#0891b2,#15803d,#ca8a04,#ea580c,#dc2626)',
    textColor: '#fff',
    examples: ['Human vision', 'Photosynthesis'],
  },
  {
    name: 'IR',
    lambdaMin: 7e-7, lambdaMax: 1e-3,
    color: '#b45309', textColor: '#fcd34d',
    examples: ['Heat sensing', 'Remote controls', 'Spectroscopy'],
  },
  {
    name: 'Microwave',
    lambdaMin: 1e-3, lambdaMax: 0.1,
    color: '#0369a1', textColor: '#7dd3fc',
    examples: ['Ovens', 'Radar', 'Satellite comms'],
  },
  {
    name: 'Radio',
    lambdaMin: 0.1, lambdaMax: 1e4,
    color: '#047857', textColor: '#6ee7b7',
    examples: ['AM/FM radio', 'MRI', 'WiFi'],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function lambdaToFreq(lambda: number) { return C / lambda }
function lambdaToEnergy(lambda: number) { return H * C / lambda }
function freqToLambda(f: number) { return C / f }
function energyJToLambda(e: number) { return H * C / e }
function energyEVToLambda(eV: number) { return H * C / (eV * EV) }

function regionForLambda(lambda: number) {
  return REGIONS.find(r => lambda >= r.lambdaMin && lambda <= r.lambdaMax) ?? null
}


function fmtLambda(m: number): string {
  if (!isFinite(m) || m <= 0) return '—'
  if (m < 1e-9)  return `${+(m * 1e12).toPrecision(4)} pm`
  if (m < 1e-6)  return `${+(m * 1e9).toPrecision(4)} nm`
  if (m < 1e-3)  return `${+(m * 1e6).toPrecision(4)} µm`
  if (m < 1)     return `${+(m * 1e3).toPrecision(4)} mm`
  return `${+m.toPrecision(4)} m`
}

function fmtFreq(hz: number): string {
  if (!isFinite(hz) || hz <= 0) return '—'
  if (hz >= 1e12) return `${+(hz / 1e12).toPrecision(4)} THz`
  if (hz >= 1e9)  return `${+(hz / 1e9).toPrecision(4)} GHz`
  if (hz >= 1e6)  return `${+(hz / 1e6).toPrecision(4)} MHz`
  if (hz >= 1e3)  return `${+(hz / 1e3).toPrecision(4)} kHz`
  return `${+hz.toPrecision(4)} Hz`
}

function fmtEnergy(j: number): string {
  if (!isFinite(j) || j <= 0) return '—'
  const ev = j / EV
  if (ev >= 1)   return `${+ev.toPrecision(4)} eV`
  if (ev >= 1e-3) return `${+(ev * 1e3).toPrecision(4)} meV`
  const exp = Math.floor(Math.log10(j))
  return `${+(j / 10 ** exp).toPrecision(3)} × 10^${exp} J`
}

type InputField = 'lambda_nm' | 'lambda_m' | 'freq_hz' | 'energy_ev' | 'energy_j'

// ── Visible sub-band colours ──────────────────────────────────────────────────

function wavelengthToRgb(nm: number): string {
  // Approximate visible colour (380–700 nm)
  let r = 0, g = 0, b = 0
  if      (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; g = 0; b = 1 }
  else if (nm >= 440 && nm < 490) { r = 0; g = (nm - 440) / 50; b = 1 }
  else if (nm >= 490 && nm < 510) { r = 0; g = 1; b = -(nm - 510) / 20 }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / 70; g = 1; b = 0 }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / 65; b = 0 }
  else if (nm >= 645 && nm <= 700) { r = 1; g = 0; b = 0 }
  // Intensity rolloff near edges
  let factor = 1
  if      (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / 40
  else if (nm > 680 && nm <= 700) factor = 0.3 + 0.7 * (700 - nm) / 20
  const ri = Math.round(255 * r * factor)
  const gi = Math.round(255 * g * factor)
  const bi = Math.round(255 * b * factor)
  return `rgb(${ri},${gi},${bi})`
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ElectromagneticSpectrum() {
  const [field, setField] = useState<InputField>('lambda_nm')
  const [raw, setRaw] = useState('500')

  // Derive lambda_m from whichever field is active
  function getLambda(): number {
    const v = parseFloat(raw)
    if (isNaN(v) || v <= 0) return NaN
    switch (field) {
      case 'lambda_nm': return v * 1e-9
      case 'lambda_m':  return v
      case 'freq_hz':   return freqToLambda(v)
      case 'energy_ev': return energyEVToLambda(v)
      case 'energy_j':  return energyJToLambda(v)
    }
  }

  const lambda = getLambda()
  const freq   = isFinite(lambda) ? lambdaToFreq(lambda)   : NaN
  const energyJ = isFinite(lambda) ? lambdaToEnergy(lambda) : NaN
  const energyEV = isFinite(energyJ) ? energyJ / EV        : NaN
  const region = isFinite(lambda) ? regionForLambda(lambda) : null

  const isVisible = isFinite(lambda) && lambda >= 4e-7 && lambda <= 7e-7
  const lambdaNm  = isFinite(lambda) ? lambda * 1e9 : NaN

  function inputFor(f: InputField, label: string, placeholder: string) {
    const active = field === f
    return (
      <div
        className="flex flex-col gap-1 cursor-pointer"
        onClick={() => { setField(f); if (field !== f) setRaw('') }}>
        <span className="font-mono text-xs tracking-widest uppercase"
          style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
          {label}
        </span>
        <input
          type="text"
          inputMode="decimal"
          readOnly={!active}
          value={active ? raw : ''}
          placeholder={active ? placeholder : '—'}
          onChange={e => setRaw(e.target.value)}
          onClick={e => { e.stopPropagation(); setField(f) }}
          className="w-full h-9 rounded-sm border px-3 font-mono text-sm bg-raised focus:outline-none transition-colors"
          style={{
            borderColor: active ? 'color-mix(in srgb, var(--c-halogen) 60%, transparent)' : 'rgb(var(--color-border))',
            color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.25)',
            cursor: active ? 'text' : 'pointer',
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Spectrum bar */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Electromagnetic Spectrum</span>
        <div className="relative w-full h-12 rounded-sm overflow-hidden flex">
          {REGIONS.map(r => {
            const logMin = Math.log10(r.lambdaMin)
            const logMax = Math.log10(r.lambdaMax)
            const logTotal = Math.log10(1e4) - Math.log10(1e-14)
            const widthPct = ((logMax - logMin) / logTotal) * 100
            const isGradient = r.color.startsWith('linear')
            const inRegion = isFinite(lambda) && lambda >= r.lambdaMin && lambda <= r.lambdaMax
            return (
              <div key={r.name}
                className="relative flex items-end pb-1 justify-center shrink-0 transition-all"
                style={{
                  width: `${widthPct}%`,
                  background: isGradient ? r.color : r.color,
                  opacity: isFinite(lambda) ? (inRegion ? 1 : 0.45) : 0.7,
                }}>
                <span className="font-mono text-[8px] font-bold truncate px-0.5"
                  style={{ color: r.textColor }}>
                  {r.name}
                </span>
              </div>
            )
          })}

          {/* Indicator line */}
          {isFinite(lambda) && (() => {
            const logMin = Math.log10(1e-14)
            const logMax = Math.log10(1e4)
            const pct = ((Math.log10(lambda) - logMin) / (logMax - logMin)) * 100
            if (pct < 0 || pct > 100) return null
            return (
              <div className="absolute top-0 bottom-0 w-0.5 bg-white/80"
                style={{ left: `${pct}%`, transform: 'translateX(-50%)' }} />
            )
          })()}
        </div>

        {/* Axis labels */}
        <div className="flex justify-between font-mono text-xs text-secondary">
          <span>γ-ray (10⁻¹⁴ m)</span>
          <span className="hidden sm:block">X-ray</span>
          <span>UV | Vis | IR</span>
          <span className="hidden sm:block">Microwave</span>
          <span>Radio (10⁴ m)</span>
        </div>
      </div>

      {/* Convertor */}
      <div className="flex flex-col gap-4">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Interconvert</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {inputFor('lambda_nm', 'Wavelength (nm)',  '500')}
          {inputFor('lambda_m',  'Wavelength (m)',   '5.00e-7')}
          {inputFor('freq_hz',   'Frequency (Hz)',   '6.00e14')}
          {inputFor('energy_ev', 'Energy (eV)',       '2.48')}
          {inputFor('energy_j',  'Energy (J)',        '3.97e-19')}
        </div>
      </div>

      {/* Results panel */}
      {isFinite(lambda) && (
        <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">

          {/* Region badge + colour swatch */}
          <div className="flex items-center gap-3 flex-wrap">
            {region ? (
              <span className="font-mono text-sm font-semibold px-3 py-1 rounded-sm"
                style={{
                  background: `color-mix(in srgb, ${region.textColor} 15%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${region.textColor} 40%, transparent)`,
                  color: region.textColor,
                }}>
                {region.name} region
              </span>
            ) : (
              <span className="font-mono text-xs text-dim">Out of standard range</span>
            )}
            {isVisible && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm border border-border/40"
                  style={{ background: wavelengthToRgb(lambdaNm) }} />
                <span className="font-mono text-xs text-dim">{lambdaNm.toFixed(0)} nm</span>
              </div>
            )}
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'λ',   val: fmtLambda(lambda) },
              { label: 'f',   val: fmtFreq(freq) },
              { label: 'E',   val: fmtEnergy(energyJ) },
              { label: 'eV',  val: isFinite(energyEV) ? `${+energyEV.toPrecision(4)} eV` : '—' },
            ].map(({ label, val }) => (
              <div key={label} className="flex flex-col gap-1 px-3 py-2 rounded-sm bg-raised border border-border">
                <span className="font-mono text-xs text-secondary uppercase">{label}</span>
                <span className="font-mono text-sm text-bright break-all">{val}</span>
              </div>
            ))}
          </div>

          {/* Use cases */}
          {region && (
            <div className="flex flex-wrap gap-2">
              {region.examples.map(ex => (
                <span key={ex} className="font-mono text-[9px] px-2 py-0.5 rounded-sm text-dim"
                  style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
                  {ex}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equations reference */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
        <p className="font-sans font-semibold text-bright">Key Relationships</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { eq: 'c = λf',     desc: 'Wave equation — λ (m), f (Hz)',     detail: `c = ${C.toExponential(3)} m/s` },
            { eq: 'E = hf',     desc: 'Planck–Einstein — h (J·s), f (Hz)', detail: `h = ${H.toExponential(3)} J·s` },
            { eq: 'E = hc / λ', desc: 'Energy from wavelength',            detail: '1 eV = 1.602 × 10⁻¹⁹ J'      },
          ].map(r => (
            <div key={r.eq} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-mono text-sm font-semibold text-bright">{r.eq}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{r.desc}</span>
              <span className="font-mono text-xs text-secondary">{r.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visible band table */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Visible Spectrum</span>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-4 py-2 text-left text-dim font-normal">Colour</th>
                <th className="px-4 py-2 text-left text-dim font-normal">λ range</th>
                <th className="px-4 py-2 text-left text-dim font-normal">f range (THz)</th>
                <th className="px-4 py-2 text-left text-dim font-normal">E range (eV)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Violet', min: 380, max: 450 },
                { name: 'Blue',   min: 450, max: 495 },
                { name: 'Green',  min: 495, max: 570 },
                { name: 'Yellow', min: 570, max: 590 },
                { name: 'Orange', min: 590, max: 625 },
                { name: 'Red',    min: 625, max: 700 },
              ].map(band => {
                const lMin = band.min * 1e-9
                const lMax = band.max * 1e-9
                const fMax = (C / lMin / 1e12).toPrecision(3)
                const fMin = (C / lMax / 1e12).toPrecision(3)
                const eMax = (H * C / lMin / EV).toPrecision(3)
                const eMin = (H * C / lMax / EV).toPrecision(3)
                const midNm = (band.min + band.max) / 2
                const inBand = isFinite(lambdaNm) && lambdaNm >= band.min && lambdaNm <= band.max
                return (
                  <tr key={band.name}
                    className={`border-b border-border last:border-b-0 transition-colors ${inBand ? 'bg-raised' : ''}`}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm border border-border/40"
                          style={{ background: wavelengthToRgb(midNm) }} />
                        <span className="text-primary">{band.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-secondary">{band.min}–{band.max} nm</td>
                    <td className="px-4 py-2 text-secondary">{fMin}–{fMax}</td>
                    <td className="px-4 py-2 text-secondary">{eMin}–{eMax}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

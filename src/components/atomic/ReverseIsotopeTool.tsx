import { useState } from 'react'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { reverseIsotopeAbundance } from '../../chem/isotope'
import type { VerifyState } from '../../utils/calcHelpers'

// ── Two-isotope element data ──────────────────────────────────────────────────
// Elements where exactly two isotopes account for ≥ 99% of natural abundance.
// Masses are exact atomic masses (u); averages match IUPAC standard atomic weights.

interface TwoIsotopeElement {
  symbol:    string
  name:      string
  Z:         number
  avgMass:   number
  iso1:      { A: number; mass: number; abundance: number }  // % for reference
  iso2:      { A: number; mass: number; abundance: number }
}

const TWO_ISOTOPE_ELEMENTS: TwoIsotopeElement[] = [
  {
    symbol: 'H', name: 'Hydrogen', Z: 1, avgMass: 1.008,
    iso1: { A: 1,   mass: 1.007825,  abundance: 99.9885 },
    iso2: { A: 2,   mass: 2.014102,  abundance: 0.0115  },
  },
  {
    symbol: 'Li', name: 'Lithium', Z: 3, avgMass: 6.941,
    iso1: { A: 6,   mass: 6.015123,  abundance: 7.59  },
    iso2: { A: 7,   mass: 7.016003,  abundance: 92.41 },
  },
  {
    symbol: 'B', name: 'Boron', Z: 5, avgMass: 10.811,
    iso1: { A: 10,  mass: 10.012937, abundance: 19.9  },
    iso2: { A: 11,  mass: 11.009305, abundance: 80.1  },
  },
  {
    symbol: 'N', name: 'Nitrogen', Z: 7, avgMass: 14.007,
    iso1: { A: 14,  mass: 14.003074, abundance: 99.632 },
    iso2: { A: 15,  mass: 15.000109, abundance: 0.368  },
  },
  {
    symbol: 'Cl', name: 'Chlorine', Z: 17, avgMass: 35.453,
    iso1: { A: 35,  mass: 34.968853, abundance: 75.77 },
    iso2: { A: 37,  mass: 36.965903, abundance: 24.23 },
  },
  {
    symbol: 'Cu', name: 'Copper', Z: 29, avgMass: 63.546,
    iso1: { A: 63,  mass: 62.929601, abundance: 69.15 },
    iso2: { A: 65,  mass: 64.927794, abundance: 30.85 },
  },
  {
    symbol: 'Ga', name: 'Gallium', Z: 31, avgMass: 69.723,
    iso1: { A: 69,  mass: 68.925581, abundance: 60.11 },
    iso2: { A: 71,  mass: 70.924705, abundance: 39.89 },
  },
  {
    symbol: 'Br', name: 'Bromine', Z: 35, avgMass: 79.904,
    iso1: { A: 79,  mass: 78.918338, abundance: 50.69 },
    iso2: { A: 81,  mass: 80.916291, abundance: 49.31 },
  },
  {
    symbol: 'Ag', name: 'Silver', Z: 47, avgMass: 107.868,
    iso1: { A: 107, mass: 106.905097, abundance: 51.839 },
    iso2: { A: 109, mass: 108.904752, abundance: 48.161 },
  },
  {
    symbol: 'Tl', name: 'Thallium', Z: 81, avgMass: 204.383,
    iso1: { A: 203, mass: 202.972344, abundance: 29.52 },
    iso2: { A: 205, mass: 204.974428, abundance: 70.48 },
  },
]

// ── Example generators ────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateReverseIsotopeExample() {
  const el = pick(TWO_ISOTOPE_ELEMENTS)
  const r  = reverseIsotopeAbundance({
    averageMass: el.avgMass,
    isotopeMasses: [el.iso1.mass, el.iso2.mass],
  })
  return {
    scenario: `${el.name} (${el.symbol}) has average atomic mass ${el.avgMass} amu. ` +
      `Given ⁽${el.iso1.A}⁾${el.symbol} = ${el.iso1.mass} amu and ⁽${el.iso2.A}⁾${el.symbol} = ${el.iso2.mass} amu, ` +
      `find the natural abundances.`,
    steps: r.steps.slice(0, r.steps.length - 1),
    result: `⁽${el.iso1.A}⁾${el.symbol}: ${(r.abundance1 * 100).toPrecision(4)}%  ·  ⁽${el.iso2.A}⁾${el.symbol}: ${(r.abundance2 * 100).toPrecision(4)}%`,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Result {
  label1: string
  pct1:   string
  label2: string
  pct2:   string
}

export default function ReverseIsotopeTool() {
  const [preset,   setPreset]   = useState<number | ''>('')
  const [avgMass,  setAvgMass]  = useState('')
  const [mass1,    setMass1]    = useState('')
  const [mass2,    setMass2]    = useState('')
  const [a1Label,  setA1Label]  = useState('Isotope 1')
  const [a2Label,  setA2Label]  = useState('Isotope 2')

  const [steps,    setSteps]    = useState<string[]>([])
  const [result,   setResult]   = useState<Result | null>(null)
  const [error,    setError]    = useState('')
  const [verified, setVerified] = useState<VerifyState>(null)

  const stepsState = useStepsPanelState(steps, generateReverseIsotopeExample)

  function reset() { setSteps([]); setResult(null); setError(''); setVerified(null) }

  function loadPreset(idx: number | '') {
    setPreset(idx)
    reset()
    if (idx === '') { setAvgMass(''); setMass1(''); setMass2(''); setA1Label('Isotope 1'); setA2Label('Isotope 2'); return }
    const el = TWO_ISOTOPE_ELEMENTS[idx]
    setAvgMass(String(el.avgMass))
    setMass1(String(el.iso1.mass))
    setMass2(String(el.iso2.mass))
    setA1Label(`⁽${el.iso1.A}⁾${el.symbol}`)
    setA2Label(`⁽${el.iso2.A}⁾${el.symbol}`)
  }

  function handleCalculate() {
    reset()
    const avg = parseFloat(avgMass)
    const m1  = parseFloat(mass1)
    const m2  = parseFloat(mass2)
    if (isNaN(avg) || isNaN(m1) || isNaN(m2)) { setError('Enter all three masses.'); return }
    if (m1 <= 0 || m2 <= 0 || avg <= 0)       { setError('All masses must be positive.'); return }

    try {
      const sol = reverseIsotopeAbundance({ averageMass: avg, isotopeMasses: [m1, m2] })
      setSteps(sol.steps)
      setResult({
        label1: a1Label,
        pct1:   (sol.abundance1 * 100).toPrecision(4),
        label2: a2Label,
        pct2:   (sol.abundance2 * 100).toPrecision(4),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error.')
    }
  }

  const canCalc = avgMass.trim() && mass1.trim() && mass2.trim()

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Given the average atomic mass and the masses of two isotopes, find their natural abundances.
        Uses: <span className="font-mono">a = (m̄ − m₂) / (m₁ − m₂)</span>
      </p>

      {/* Preset picker */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Quick-fill a real element
        </label>
        <select
          value={preset}
          onChange={e => loadPreset(e.target.value === '' ? '' : Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary
                     focus:outline-none focus:border-muted transition-colors self-start"
        >
          <option value="">— enter values manually —</option>
          {TWO_ISOTOPE_ELEMENTS.map((el, i) => (
            <option key={el.symbol} value={i}>
              {el.symbol} ({el.name}) — avg {el.avgMass} amu
            </option>
          ))}
        </select>
      </div>

      {/* Input fields */}
      <div className="flex flex-col gap-3">
        <NumberField
          label="Average atomic mass (m̄)"
          value={avgMass}
          onChange={v => { setAvgMass(v); reset(); setPreset('') }}
          placeholder="e.g. 69.72"
          unit={<span className="font-mono text-sm text-secondary px-2">amu</span>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField
            label={`Mass of ${a1Label}`}
            value={mass1}
            onChange={v => { setMass1(v); reset(); setPreset('') }}
            placeholder="e.g. 68.9256"
            unit={<span className="font-mono text-sm text-secondary px-2">amu</span>}
          />
          <NumberField
            label={`Mass of ${a2Label}`}
            value={mass2}
            onChange={v => { setMass2(v); reset(); setPreset('') }}
            placeholder="e.g. 70.9247"
            unit={<span className="font-mono text-sm text-secondary px-2">amu</span>}
          />
        </div>
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <div className="rounded-sm border overflow-hidden"
          style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' }}>
          <div className="grid gap-3 px-4 py-2 border-b border-border"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))', gridTemplateColumns: '1fr auto' }}>
            <span className="font-sans text-sm font-medium text-secondary">Isotope</span>
            <span className="font-sans text-sm font-medium text-secondary text-right">Natural abundance</span>
          </div>
          <div className="grid gap-3 items-center px-4 py-3 border-b border-border"
            style={{ gridTemplateColumns: '1fr auto' }}>
            <span className="font-mono text-sm text-primary">{result.label1}</span>
            <span className="font-mono text-sm font-semibold text-right" style={{ color: 'var(--c-halogen)' }}>
              {result.pct1} %
            </span>
          </div>
          <div className="grid gap-3 items-center px-4 py-3"
            style={{ gridTemplateColumns: '1fr auto' }}>
            <span className="font-mono text-sm text-primary">{result.label2}</span>
            <span className="font-mono text-sm font-semibold text-right" style={{ color: 'var(--c-halogen)' }}>
              {result.pct2} %
            </span>
          </div>
        </div>
      )}

      {result && (
        <ResultDisplay
          label={`${a1Label} abundance`}
          value={result.pct1}
          unit="%"
          verified={verified}
        />
      )}

      <p className="font-mono text-xs text-secondary">
        m̄ = a₁m₁ + a₂m₂ · a₁ + a₂ = 1 · valid for two-isotope elements only
      </p>
    </div>
  )
}

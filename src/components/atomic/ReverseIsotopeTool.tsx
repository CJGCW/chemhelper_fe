import { useState } from 'react'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { reverseIsotopeAbundance } from '../../chem/isotope'
import { TWO_ISOTOPE_ELEMENTS } from '../../data/twoIsotopeElements'
import type { VerifyState } from '../../utils/calcHelpers'

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

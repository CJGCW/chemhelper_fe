import { useState } from 'react'
import CalcLayout from '../../components/calculations/CalcLayout'
import NumberField from '../../components/calculations/NumberField'
import UnitSelect from '../../components/calculations/UnitSelect'
import CompoundInput from '../../components/calculations/CompoundInput'
import ResultDisplay from '../../components/calculations/ResultDisplay'
import StepsPanel from '../../components/calculations/StepsPanel'
import SigFigPanel from '../../components/calculations/SigFigPanel'
import Balance from '../../components/calculations/animations/Balance'
import { MASS_UNITS } from '../../components/calculations/UnitSelect'
import type { UnitOption } from '../../components/calculations/UnitSelect'
import { buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs } from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'
import type { ExplanationContent } from '../../components/calculations/ExplanationModal'

function sanitize(raw: string): string {
  let result = ''
  let hasDot = false
  for (const ch of raw) {
    if (ch === '.' && !hasDot) { hasDot = true; result += ch }
    else if (ch >= '0' && ch <= '9') { result += ch }
  }
  return result
}


const EXPLANATION: ExplanationContent = {
  title: 'Mole Calculations',
  formula: 'n = m / M',
  formulaVars: [
    { symbol: 'n', meaning: 'Amount of substance', unit: 'mol' },
    { symbol: 'm', meaning: 'Mass of substance', unit: 'g' },
    { symbol: 'M', meaning: 'Molar mass of substance', unit: 'g/mol' },
  ],
  description:
    'The mole (mol) is the SI unit for amount of substance. One mole contains exactly ' +
    '6.022 × 10²³ entities (Avogadro\'s number). The molar mass M is numerically equal ' +
    'to the relative molecular mass and can be found by summing atomic masses in the formula. ' +
    'Enter any two of the three values (mass, molar mass, moles) and press Calculate to solve ' +
    'for the third. Enter all three to verify your answer.',
  example: {
    scenario: 'How many moles are in 18.015 g of water (H₂O, M = 18.015 g/mol)?',
    steps: [
      'Identify: m = 18.015 g, M = 18.015 g/mol',
      'Apply: n = m / M = 18.015 g ÷ 18.015 g/mol',
      'n = 1.000 mol',
    ],
    result: 'n = 1.000 mol',
  },
}

function toGrams(value: string, unit: UnitOption): number {
  return parseFloat(value) * unit.toGrams
}
function hasValue(v: string) { return v.trim() !== '' && !isNaN(parseFloat(v)) }

type SolveFor = 'moles' | 'molar_mass' | 'mass'

export default function MolesPage() {
  const [massValue, setMassValue]           = useState('')
  const [massUnit, setMassUnit]             = useState<UnitOption>(MASS_UNITS[2])
  const [molarMassValue, setMolarMassValue] = useState('')
  const [molesValue, setMolesValue]         = useState('')
  const [formula, setFormula]               = useState('')

  const [solvedFor, setSolvedFor]   = useState<SolveFor | null>(null)
  const [result, setResult]         = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [steps, setSteps]           = useState<string[]>([])
  const [breakdown, setBreakdown]   = useState<SigFigBreakdown | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [verified, setVerified]     = useState<'correct' | 'sig_fig_warning' | 'incorrect' | null>(null)

  const [massOnScale, setMassOnScale]           = useState<number | null>(null)
  const [massDisplayValue, setMassDisplayValue] = useState('')
  const [calculating, setCalculating]           = useState(false)

  function handleCompoundResolved(mw: string, fmt: string) {
    setMolarMassValue(mw)
    setFormula(fmt)
  }

  function handleMassBlur() {
    if (!hasValue(massValue)) { setMassOnScale(null); setMassDisplayValue(''); return }
    setMassOnScale(toGrams(massValue, massUnit))
    setMassDisplayValue(massValue)
  }

  function triggerAnimation() {
    setCalculating(false)
    setTimeout(() => setCalculating(true), 80)
  }

  function calculate() {
    setError(null)
    setVerified(null)
    setResult(null)
    setBreakdown(null)
    setSteps([])

    const hasMass      = hasValue(massValue)
    const hasMolarMass = hasValue(molarMassValue)
    const hasMoles     = hasValue(molesValue)
    const count        = [hasMass, hasMolarMass, hasMoles].filter(Boolean).length

    if (count < 2) { setError('Enter at least two values to calculate.'); return }

    try {
      if (count === 3) {
        // Verify mode
        const m = toGrams(massValue, massUnit)
        const M = parseFloat(molarMassValue)
        const n = parseFloat(molesValue)
        if (isNaN(m) || isNaN(M) || isNaN(n) || M === 0) { setError('Invalid values.'); return }
        const expected = m / M
        const limitingSF  = lowestSigFigs([massValue, molarMassValue])
        const userSF      = countSigFigs(molesValue)
        const valueCorrect = Math.abs(expected - n) / expected <= 0.01
        const sfCorrect    = userSF === limitingSF

        let status: 'correct' | 'sig_fig_warning' | 'incorrect'
        if (!valueCorrect) {
          status = 'incorrect'
        } else if (!sfCorrect) {
          status = 'sig_fig_warning'
        } else {
          status = 'correct'
        }
        setVerified(status)

        setSteps([
          `Given: m = ${massValue} ${massUnit.label}, M = ${M} g/mol, n = ${n} mol`,
          `Compute: n = m / M = ${m} g ÷ ${M} g/mol = ${expected} mol`,
          `Rounded to ${limitingSF} sig figs: ${formatSigFigs(expected, limitingSF)} mol`,
          status === 'correct'
            ? `✓ Correct — value and sig figs match.`
            : status === 'sig_fig_warning'
            ? `⚠ Correct value, but ${userSF} sig figs provided — expected ${limitingSF}.`
            : `✗ Expected ≈ ${formatSigFigs(expected, limitingSF)} mol`,
        ])
        setResult(formatSigFigs(expected, limitingSF))
        setResultUnit('mol')
        setSolvedFor('moles')
        return
      }

      if (!hasMoles) {
        const m = toGrams(massValue, massUnit)
        const M = parseFloat(molarMassValue)
        if (isNaN(m) || isNaN(M) || M === 0) { setError('Invalid values.'); return }
        const n = m / M
        const sf = lowestSigFigs([massValue, molarMassValue])
        setSteps([
          `Convert: ${massValue} ${massUnit.label} = ${m} g`,
          `n = m / M = ${m} g ÷ ${M} g/mol`,
          `n = ${n} mol`,
          `Rounded to ${sf} sf: ${formatSigFigs(n, sf)} mol`,
        ])
        setResult(n.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('mol')
        setSolvedFor('moles')
        setBreakdown(buildSigFigBreakdown(
          [{ label: 'Mass', value: massValue }, { label: 'Molar Mass', value: molarMassValue }], n, 'mol'))

      } else if (!hasMolarMass) {
        const m = toGrams(massValue, massUnit)
        const n = parseFloat(molesValue)
        if (isNaN(m) || isNaN(n) || n === 0) { setError('Invalid values.'); return }
        const M = m / n
        const sf = lowestSigFigs([massValue, molesValue])
        setSteps([
          `Convert: ${massValue} ${massUnit.label} = ${m} g`,
          `M = m / n = ${m} g ÷ ${n} mol`,
          `M = ${M} g/mol`,
          `Rounded to ${sf} sf: ${formatSigFigs(M, sf)} g/mol`,
        ])
        setResult(M.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('g/mol')
        setSolvedFor('molar_mass')
        setBreakdown(buildSigFigBreakdown(
          [{ label: 'Mass', value: massValue }, { label: 'Moles', value: molesValue }], M, 'g/mol'))

      } else {
        const n = parseFloat(molesValue)
        const M = parseFloat(molarMassValue)
        if (isNaN(n) || isNaN(M)) { setError('Invalid values.'); return }
        const m = n * M
        const sf = lowestSigFigs([molesValue, molarMassValue])
        setSteps([
          `m = n × M = ${n} mol × ${M} g/mol`,
          `m = ${m} g`,
          `Rounded to ${sf} sf: ${formatSigFigs(m, sf)} g`,
        ])
        setResult(m.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('g')
        setSolvedFor('mass')
        setBreakdown(buildSigFigBreakdown(
          [{ label: 'Moles', value: molesValue }, { label: 'Molar Mass', value: molarMassValue }], m, 'g'))
        setMassOnScale(m)
        setMassDisplayValue(m.toPrecision(6).replace(/\.?0+$/, ''))
        triggerAnimation()
      }
    } catch { setError('An unexpected error occurred.') }
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null
  const resultLabel =
    solvedFor === 'moles'      ? 'Amount of substance (n)' :
    solvedFor === 'molar_mass' ? 'Molar mass (M)' :
    solvedFor === 'mass'       ? 'Mass (m)' : 'Result'

  const hasMass      = hasValue(massValue)
  const hasMolarMass = hasValue(molarMassValue)
  const hasMoles     = hasValue(molesValue)
  const allFilled    = hasMass && hasMolarMass && hasMoles

  const form = (
    <div className="flex flex-col gap-5">

      {/* Mass */}
      <NumberField
        label="Mass (m)"
        value={massValue}
        onChange={v => { setMassValue(v); setResult(null) }}
        onBlur={handleMassBlur}
        placeholder="e.g. 18.015"
        unit={<UnitSelect options={MASS_UNITS} value={massUnit} onChange={u => { setMassUnit(u); setMassOnScale(null) }} />}
      />

      {/* Molar Mass */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Molar Mass (M)</label>
        <CompoundInput onResolved={handleCompoundResolved} />
        <div className="flex items-stretch gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={molarMassValue}
            onChange={e => { setMolarMassValue(sanitize(e.target.value)); setResult(null) }}
            placeholder="e.g. 58.44"
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm
                       px-3 py-2 text-primary placeholder-dim focus:outline-none
                       focus:border-accent/40 transition-colors
"
          />
          <div className="shrink-0 flex items-center">
            <span className="font-mono text-sm text-secondary px-2">g/mol</span>
          </div>
        </div>
      </div>

      {/* Moles */}
      <NumberField
        label="Moles (n)"
        value={molesValue}
        onChange={v => { setMolesValue(v); setResult(null) }}
        placeholder="e.g. 1.000"
        unit={<span className="font-mono text-sm text-secondary px-2">mol</span>}
      />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <button
        onClick={calculate}
        className="w-full py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}
      >
        {allFilled ? 'Verify' : 'Calculate'}
      </button>
    </div>
  )

  return (
    <CalcLayout
      title="Mole Calculations"
      subtitle=""
      explanation={EXPLANATION}
      form={form}
      animation={
        <Balance
          massOnScale={massOnScale}
          massDisplayValue={massDisplayValue}
          massUnitLabel={massUnit.label}
          formula={formula}
          calculating={calculating}
          onCalcComplete={() => setCalculating(false)}
        />
      }
      result={
        <ResultDisplay
          label={resultLabel}
          value={result}
          unit={resultUnit}
          sigFigsValue={sigFigsResult}
          verified={verified === 'correct' ? true : verified === 'incorrect' ? false : verified === 'sig_fig_warning' ? 'sig_fig_warning' : null}
        />
      }
      steps={<StepsPanel steps={steps} />}
      sigfigs={<SigFigPanel breakdown={breakdown} />}
    />
  )
}

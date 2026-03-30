import { useState } from 'react'
import NumberField from './NumberField'
import UnitSelect, { MASS_UNITS } from './UnitSelect'
import type { UnitOption } from './UnitSelect'
import CompoundInput from './CompoundInput'
import ResultDisplay from './ResultDisplay'
import StepsPanel from './StepsPanel'
import SigFigPanel from './SigFigPanel'
import Balance from './animations/Balance'
import { sanitize, hasValue, toStandard, conversionStep } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import {
  buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs,
} from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'

export default function MolesCalc() {
  const [massValue, setMassValue]           = useState('')
  const [massUnit, setMassUnit]             = useState<UnitOption>(MASS_UNITS[2])
  const [molarMassValue, setMolarMassValue] = useState('')
  const [molesValue, setMolesValue]         = useState('')
  const [formula, setFormula]               = useState('')

  const [result, setResult]         = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [resultLabel, setResultLabel] = useState('Result')
  const [steps, setSteps]           = useState<string[]>([])
  const [breakdown, setBreakdown]   = useState<SigFigBreakdown | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [verified, setVerified]     = useState<VerifyState>(null)

  const [massOnScale, setMassOnScale]           = useState<number | null>(null)
  const [massDisplayValue, setMassDisplayValue] = useState('')
  const [calculating, setCalculating]           = useState(false)

  function triggerAnimation() {
    setCalculating(false)
    setTimeout(() => setCalculating(true), 80)
  }

  function handleMassBlur() {
    if (!hasValue(massValue)) { setMassOnScale(null); setMassDisplayValue(''); return }
    setMassOnScale(toStandard(massValue, massUnit))
    setMassDisplayValue(massValue)
  }

  const hasMass      = hasValue(massValue)
  const hasMolarMass = hasValue(molarMassValue)
  const hasMoles     = hasValue(molesValue)
  const filledCount  = [hasMass, hasMolarMass, hasMoles].filter(Boolean).length

  function calculate() {
    setError(null); setVerified(null); setResult(null); setBreakdown(null); setSteps([])
    if (filledCount < 2) { setError('Enter at least two values to calculate.'); return }

    try {
      if (filledCount === 3) {
        const m = toStandard(massValue, massUnit)
        const M = parseFloat(molarMassValue), n = parseFloat(molesValue)
        if (isNaN(m) || isNaN(M) || isNaN(n) || M === 0) { setError('Invalid values.'); return }
        const expected = m / M
        const limSF = lowestSigFigs([massValue, molarMassValue])
        const userSF = countSigFigs(molesValue)
        const valueOk = Math.abs(expected - n) / expected <= 0.01
        const sfOk    = userSF === limSF
        setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
        setSteps([
          `Given: m = ${massValue} ${massUnit.label}, M = ${M} g/mol, n = ${n} mol`,
          `Expected: n = m / M = ${m} g ÷ ${M} g/mol = ${expected} mol`,
          `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)} mol`,
          !valueOk ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)} mol`
            : !sfOk ? `⚠ Correct value — expected ${limSF} sig fig(s), got ${userSF}`
            : `✓ Correct — value and sig figs match`,
        ])
        setResult(formatSigFigs(expected, limSF))
        setResultUnit('mol'); setResultLabel('Amount of substance (n)')
        return
      }

      if (!hasMoles) {
        const m = toStandard(massValue, massUnit), M = parseFloat(molarMassValue)
        if (isNaN(m) || isNaN(M) || M === 0) { setError('Invalid values.'); return }
        const n = m / M, sf = lowestSigFigs([massValue, molarMassValue])
        setSteps([...(conversionStep(massValue, massUnit, 'g', m) ? [conversionStep(massValue, massUnit, 'g', m)!] : []),`n = m / M = ${m} g ÷ ${M} g/mol`,`n = ${n} mol`,`Rounded to ${sf} sf: ${formatSigFigs(n, sf)} mol`])
        setResult(n.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('mol'); setResultLabel('Amount of substance (n)')
        setBreakdown(buildSigFigBreakdown([{ label: 'Mass', value: massValue }, { label: 'Molar Mass', value: molarMassValue }], n, 'mol'))
      } else if (!hasMolarMass) {
        const m = toStandard(massValue, massUnit), n = parseFloat(molesValue)
        if (isNaN(m) || isNaN(n) || n === 0) { setError('Invalid values.'); return }
        const M = m / n, sf = lowestSigFigs([massValue, molesValue])
        setSteps([...(conversionStep(massValue, massUnit, 'g', m) ? [conversionStep(massValue, massUnit, 'g', m)!] : []),`M = m / n = ${m} g ÷ ${n} mol`,`M = ${M} g/mol`,`Rounded to ${sf} sf: ${formatSigFigs(M, sf)} g/mol`])
        setResult(M.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('g/mol'); setResultLabel('Molar mass (M)')
        setBreakdown(buildSigFigBreakdown([{ label: 'Mass', value: massValue }, { label: 'Moles', value: molesValue }], M, 'g/mol'))
      } else {
        const n = parseFloat(molesValue), M = parseFloat(molarMassValue)
        if (isNaN(n) || isNaN(M)) { setError('Invalid values.'); return }
        const m = n * M, sf = lowestSigFigs([molesValue, molarMassValue])
        setSteps([`m = n × M = ${n} mol × ${M} g/mol`,`m = ${m} g`,`Rounded to ${sf} sf: ${formatSigFigs(m, sf)} g`])
        setResult(m.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('g'); setResultLabel('Mass (m)')
        setBreakdown(buildSigFigBreakdown([{ label: 'Moles', value: molesValue }, { label: 'Molar Mass', value: molarMassValue }], m, 'g'))
        setMassOnScale(m); setMassDisplayValue(m.toPrecision(6).replace(/\.?0+$/, ''))
        triggerAnimation()
      }
    } catch { setError('An unexpected error occurred.') }
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Form */}
      <div className="flex flex-col gap-5">
        <NumberField label="Mass (m)" value={massValue}
          onChange={v => { setMassValue(sanitize(v)); setResult(null) }}
          onBlur={handleMassBlur} placeholder="e.g. 18.015"
          unit={<UnitSelect options={MASS_UNITS} value={massUnit} onChange={u => { setMassUnit(u); setMassOnScale(null) }} />}
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-primary">Molar Mass (M)</label>
          <CompoundInput onResolved={(mw, fmt) => { setMolarMassValue(mw); setFormula(fmt) }} />
          <div className="flex items-stretch gap-1.5">
            <input type="text" inputMode="decimal" value={molarMassValue}
              onChange={e => { setMolarMassValue(sanitize(e.target.value)); setResult(null) }}
              placeholder="e.g. 58.44"
              className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
            <span className="font-mono text-sm text-secondary px-2 flex items-center">g/mol</span>
          </div>
        </div>

        <NumberField label="Moles (n)" value={molesValue}
          onChange={v => { setMolesValue(sanitize(v)); setResult(null) }}
          placeholder="e.g. 1.000"
          unit={<span className="font-mono text-sm text-secondary px-2">mol</span>}
        />

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button onClick={calculate} className="w-full py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}>
          {filledCount === 3 ? 'Verify' : 'Calculate'}
        </button>
      </div>

      {/* Balance */}
      <div className="self-start mt-[27px]">
        <Balance massOnScale={massOnScale} massDisplayValue={massDisplayValue}
          massUnitLabel={massUnit.label} formula={formula}
          calculating={calculating} onCalcComplete={() => setCalculating(false)}
        />
      </div>

      {/* Results span full width */}
      {(steps.length > 0 || result) && (
        <div className="lg:col-span-2 flex flex-col gap-4">
          <StepsPanel steps={steps} />
          <SigFigPanel breakdown={breakdown} />
          <ResultDisplay label={resultLabel} value={result} unit={resultUnit}
            sigFigsValue={sigFigsResult}
            verified={verified === 'correct' ? true : verified === 'incorrect' ? false : verified === 'sig_fig_warning' ? 'sig_fig_warning' : null}
          />
        </div>
      )}
    </div>
  )
}

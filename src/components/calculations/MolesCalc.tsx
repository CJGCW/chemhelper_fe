import { useState } from 'react'
import { pick, randBetween, roundTo, sig } from './WorkedExample'
import NumberField from './NumberField'
import UnitSelect, { MASS_UNITS } from './UnitSelect'
import type { UnitOption } from './UnitSelect'
import CompoundInput from './CompoundInput'
import ResultDisplay from './ResultDisplay'
import { useStepsPanelState, StepsTrigger, StepsContent } from './StepsPanel'
import { SigFigTrigger, SigFigContent } from './SigFigPanel'
import { sanitize, hasValue, toStandard, conversionStep } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import {
  buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs,
} from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'

const MOLES_COMPOUNDS = [
  { name: 'NaCl', M: 58.44 },
  { name: 'H₂O', M: 18.015 },
  { name: 'CO₂', M: 44.010 },
  { name: 'glucose (C₆H₁₂O₆)', M: 180.16 },
  { name: 'NaOH', M: 40.000 },
  { name: 'CaCO₃', M: 100.09 },
  { name: 'KCl', M: 74.551 },
  { name: 'H₂SO₄', M: 98.079 },
  { name: 'HCl', M: 36.461 },
  { name: 'NH₃', M: 17.031 },
  { name: 'MgSO₄', M: 120.37 },
  { name: 'Ca(OH)₂', M: 74.093 },
  { name: 'Fe₂O₃', M: 159.69 },
  { name: 'CuSO₄', M: 159.61 },
  { name: 'Al₂O₃', M: 101.96 },
]

function generateMolesExample() {
  const type = pick(['n', 'n', 'n', 'm', 'M'])
  const c = pick(MOLES_COMPOUNDS)

  if (type === 'n') {
    const mass = roundTo(randBetween(5, 120), 1)
    const n = mass / c.M
    return {
      scenario: `How many moles are in ${mass} g of ${c.name}? (M = ${c.M} g/mol)`,
      steps: [
        `n = m / M`,
        `n = ${mass} g ÷ ${c.M} g/mol`,
        `n = ${n.toFixed(5)} mol`,
        `Rounded to 3 sf: ${sig(n, 3)} mol`,
      ],
      result: `n = ${sig(n, 3)} mol`,
    }
  }

  if (type === 'm') {
    const n = roundTo(randBetween(0.2, 4), 3)
    const m = n * c.M
    return {
      scenario: `What mass of ${c.name} (M = ${c.M} g/mol) is needed for ${n} mol?`,
      steps: [
        `m = n × M`,
        `m = ${n} mol × ${c.M} g/mol`,
        `m = ${m.toFixed(4)} g`,
        `Rounded to 3 sf: ${sig(m, 3)} g`,
      ],
      result: `m = ${sig(m, 3)} g`,
    }
  }

  // solve for M
  const n = roundTo(randBetween(0.2, 3), 3)
  const m = roundTo(n * c.M, 1)
  const Mcalc = m / n
  return {
    scenario: `A ${m} g sample of a substance contains ${n} mol. Identify the molar mass.`,
    steps: [
      `M = m / n`,
      `M = ${m} g ÷ ${n} mol`,
      `M = ${Mcalc.toFixed(4)} g/mol`,
      `Rounded to 4 sf: ${sig(Mcalc, 4)} g/mol`,
    ],
    result: `M = ${sig(Mcalc, 4)} g/mol`,
  }
}

export default function MolesCalc() {
  const [massValue, setMassValue]           = useState('')
  const [massUnit, setMassUnit]             = useState<UnitOption>(MASS_UNITS[2])
  const [molarMassValue, setMolarMassValue] = useState('')
  const [molesValue, setMolesValue]         = useState('')
  const [_formula, setFormula]              = useState('')  // used by CompoundInput display

  const [result, setResult]         = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [resultLabel, setResultLabel] = useState('Result')
  const [steps, setSteps]           = useState<string[]>([])
  const [breakdown, setBreakdown]   = useState<SigFigBreakdown | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [verified, setVerified]     = useState<VerifyState>(null)
  const stepsState = useStepsPanelState(steps, generateMolesExample)
  const [sfOpen, setSfOpen]         = useState(false)

  function handleMassBlur() {
    // no-op — kept for future use
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
      }
    } catch { setError('An unexpected error occurred.') }
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-5">
        <NumberField label="Mass (m)" value={massValue}
          onChange={v => { setMassValue(sanitize(v)); setResult(null) }}
          onBlur={handleMassBlur} placeholder="e.g. 18.015"
          unit={<UnitSelect options={MASS_UNITS} value={massUnit} onChange={u => setMassUnit(u)} />}
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

        <div className="flex items-stretch gap-2">
          <button onClick={calculate} className="shrink-0 py-2 px-5 rounded-sm font-sans font-medium text-sm transition-all"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}>
            {filledCount === 3 ? 'Verify' : 'Calculate'}
          </button>
          <StepsTrigger {...stepsState} />
          <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        </div>
      </div>

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <ResultDisplay label={resultLabel} value={result} unit={resultUnit}
            sigFigsValue={sigFigsResult}
            verified={verified}
          />
        </div>
      )}
      <p className="font-mono text-xs text-secondary">n = m / M · m = n × M · M = m / n · fill any two fields to solve for the third · fill all three to verify</p>
    </div>
  )
}


import { useState } from 'react'
import NumberField from './NumberField'
import ResultDisplay from './ResultDisplay'
import StepsPanel from './StepsPanel'
import SigFigPanel from './SigFigPanel'
import { sanitize, hasValue } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import {
  buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs,
} from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'

// ── Constants ─────────────────────────────────────────────────────────────────

type Standard = 'STP' | 'SATP'

const STANDARDS: { id: Standard; label: string; temp: string; pressure: string; Vm: number; Vm_display: string }[] = [
  {
    id: 'STP',
    label: 'STP',
    temp: '0 °C (273.15 K)',
    pressure: '1 atm (101.325 kPa)',
    Vm: 22.414,
    Vm_display: '22.414 L/mol',
  },
  {
    id: 'SATP',
    label: 'SATP',
    temp: '25 °C (298.15 K)',
    pressure: '100 kPa',
    Vm: 24.789,
    Vm_display: '24.789 L/mol',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function MolarVolumeCalc() {
  const [standard, setStandard] = useState<Standard>('STP')
  const [nValue, setNValue]     = useState('')
  const [vValue, setVValue]     = useState('')

  const [result, setResult]         = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [resultLabel, setResultLabel] = useState('Result')
  const [steps, setSteps]           = useState<string[]>([])
  const [breakdown, setBreakdown]   = useState<SigFigBreakdown | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [verified, setVerified]     = useState<VerifyState>(null)

  const std = STANDARDS.find(s => s.id === standard)!
  const Vm  = std.Vm

  const hasN    = hasValue(nValue)
  const hasV    = hasValue(vValue)
  const filledCount = [hasN, hasV].filter(Boolean).length

  function reset() {
    setResult(null); setSteps([]); setBreakdown(null); setError(null); setVerified(null)
  }

  function handleStandardChange(s: Standard) {
    setStandard(s)
    reset()
  }

  function calculate() {
    reset()
    if (filledCount < 1) { setError('Enter at least one value.'); return }

    try {
      if (filledCount === 2) {
        // Verify mode
        const n = parseFloat(nValue), V = parseFloat(vValue)
        if (isNaN(n) || isNaN(V)) { setError('Invalid values.'); return }
        const expected = n * Vm
        const limSF = lowestSigFigs([nValue])
        const userSF = countSigFigs(vValue)
        const valueOk = Math.abs(expected - V) / expected <= 0.01
        const sfOk    = userSF === limSF
        setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
        setSteps([
          `Standard: ${std.label} — Vm = ${Vm} L/mol`,
          `V = n × Vm = ${n} mol × ${Vm} L/mol = ${expected} L`,
          `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)} L`,
          !valueOk
            ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)} L`
            : !sfOk
            ? `⚠ Correct value — expected ${limSF} sig fig(s), got ${userSF}`
            : `✓ Correct — value and sig figs match`,
        ])
        setResult(formatSigFigs(expected, limSF))
        setResultUnit('L'); setResultLabel('Volume (V)')
        return
      }

      if (hasN && !hasV) {
        // Solve for V
        const n = parseFloat(nValue)
        if (isNaN(n)) { setError('Invalid value.'); return }
        const V  = n * Vm
        const sf = lowestSigFigs([nValue])
        setSteps([
          `Standard: ${std.label} — Vm = ${Vm} L/mol`,
          `V = n × Vm = ${n} mol × ${Vm} L/mol`,
          `V = ${V} L`,
          `Rounded to ${sf} sf: ${formatSigFigs(V, sf)} L`,
        ])
        setResult(V.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('L'); setResultLabel('Volume (V)')
        setBreakdown(buildSigFigBreakdown(
          [{ label: 'Moles', value: nValue }], V, 'L'
        ))
      } else {
        // Solve for n
        const V = parseFloat(vValue)
        if (isNaN(V) || V <= 0) { setError('Invalid value.'); return }
        const n  = V / Vm
        const sf = lowestSigFigs([vValue])
        setSteps([
          `Standard: ${std.label} — Vm = ${Vm} L/mol`,
          `n = V / Vm = ${V} L ÷ ${Vm} L/mol`,
          `n = ${n} mol`,
          `Rounded to ${sf} sf: ${formatSigFigs(n, sf)} mol`,
        ])
        setResult(n.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('mol'); setResultLabel('Amount of substance (n)')
        setBreakdown(buildSigFigBreakdown(
          [{ label: 'Volume', value: vValue }], n, 'mol'
        ))
      }
    } catch { setError('An unexpected error occurred.') }
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      {/* Standard toggle */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Conditions</label>
        <div className="flex gap-2">
          {STANDARDS.map(s => {
            const active = standard === s.id
            return (
              <button
                key={s.id}
                onClick={() => handleStandardChange(s.id)}
                className="flex flex-col items-start px-4 py-2.5 rounded-sm font-sans text-sm font-medium transition-colors text-left flex-1"
                style={active ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                } : {
                  background: '#0e1016',
                  border: '1px solid #1c1f2e',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                <span className="font-semibold">{s.label}</span>
                <span className="font-mono text-[10px] mt-0.5 opacity-70">{s.temp}</span>
                <span className="font-mono text-[10px] opacity-70">{s.pressure}</span>
                <span className="font-mono text-[10px] mt-1 opacity-90">Vm = {s.Vm_display}</span>
              </button>
            )
          })}
        </div>
      </div>

      <NumberField
        label="Moles (n)"
        value={nValue}
        onChange={v => { setNValue(sanitize(v)); reset() }}
        placeholder="e.g. 2.500"
        unit={<span className="font-mono text-sm text-secondary px-2">mol</span>}
        solveFor={filledCount === 1 && hasV}
      />

      <NumberField
        label="Volume (V)"
        value={vValue}
        onChange={v => { setVValue(sanitize(v)); reset() }}
        placeholder="e.g. 56.04"
        unit={<span className="font-mono text-sm text-secondary px-2">L</span>}
        solveFor={filledCount === 1 && hasN}
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
        {filledCount === 2 ? 'Verify' : 'Calculate'}
      </button>

      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4">
          <StepsPanel steps={steps} />
          <SigFigPanel breakdown={breakdown} />
          <ResultDisplay
            label={resultLabel}
            value={result}
            unit={resultUnit}
            sigFigsValue={sigFigsResult}
            verified={verified}
          />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { randBetween, roundTo } from '../shared/WorkedExample'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../shared/SigFigPanel'
import ResultDisplay from '../shared/ResultDisplay'
import { R, P_UNITS, type PUnit, type TUnit, type GasVar, toK, fromK, toAtm, fromAtm } from '../../utils/idealGas'
import { buildSigFigBreakdown, lowestSigFigs, countSigFigs, formatSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'
import type { VerifyState } from '../../utils/calcHelpers'

// ── Sub-components ────────────────────────────────────────────────────────────

function UnitPill({
  options, active, onChange,
}: { options: readonly string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className="px-2 py-0.5 rounded-sm font-mono text-xs transition-colors"
          style={active === o ? {
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          } : {
            border: '1px solid rgba(var(--overlay),0.12)',
            color: 'rgba(var(--overlay),0.35)',
          }}
        >{o}</button>
      ))}
    </div>
  )
}

// ── Example generator ─────────────────────────────────────────────────────────

function generateIdealGasExample() {
  const n = roundTo(randBetween(0.5, 3.0), 2)
  const T = roundTo(randBetween(250, 500), 0)
  const V = roundTo(randBetween(1.0, 10.0), 1)
  const P = (n * R * T) / V
  const sf4 = (v: number) => parseFloat(v.toPrecision(4)).toString()
  return {
    scenario: `Find the pressure of ${n} mol of an ideal gas in a ${V} L container at ${T} K.`,
    steps: [
      `PV = nRT  →  P = nRT / V`,
      `P = (${n} mol × ${R} L·atm/(mol·K) × ${T} K) / ${V} L`,
      `P = ${sf4(P)} atm`,
    ],
    result: `P = ${sf4(P)} atm`,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sfDisplay(v: number) {
  return parseFloat(v.toPrecision(6)).toString()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IdealGasTool() {
  const [P, setP]         = useState('')
  const [V, setV]         = useState('')
  const [N, setN]         = useState('')
  const [T, setT]         = useState('')
  const [pUnit, setPUnit] = useState<PUnit>('atm')
  const [tUnit, setTUnit] = useState<TUnit>('K')

  const [result, setResult]       = useState<string | null>(null)
  const [resultVar, setResultVar] = useState<GasVar | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [steps, setSteps]         = useState<string[]>([])
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null)
  const [sfOpen, setSfOpen]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [verified, setVerified]   = useState<VerifyState>(null)

  const stepsState = useStepsPanelState(steps, generateIdealGasExample)

  const filled = [P, V, N, T].map(v => v.trim() !== '')
  const filledCount = filled.filter(Boolean).length

  function reset() {
    setResult(null); setResultVar(null); setSteps([]); setError(null)
    setVerified(null); setBreakdown(null)
  }

  function handleToolulate() {
    reset()
    if (filledCount < 3) { setError('Enter at least three values.'); return }

    const Pv = P.trim() ? parseFloat(P) : null
    const Vv = V.trim() ? parseFloat(V) : null
    const Nv = N.trim() ? parseFloat(N) : null
    const Tv = T.trim() ? parseFloat(T) : null

    if ([Pv, Vv, Nv, Tv].some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }

    const Patm = Pv !== null ? toAtm(Pv, pUnit) : null
    const Tk   = Tv !== null ? toK(Tv, tUnit)   : null
    const stps: string[] = []

    const sf4 = (v: number) => parseFloat(v.toPrecision(4)).toString()

    function pConvStep() {
      if (pUnit !== 'atm' && Pv !== null)
        stps.push(`Convert P: ${Pv} ${pUnit} → ${sf4(Patm!)} atm`)
    }
    function tConvStep() {
      if (tUnit === 'C' && Tv !== null)
        stps.push(`Convert T: ${Tv} °C → ${sf4(Tk!)} K`)
    }

    // ── Verify mode (all 4 filled) ─────────────────────────────────────────────
    if (filledCount === 4) {
      pConvStep(); tConvStep()
      const lhs = Patm! * Vv!
      const rhs = Nv! * R * Tk!
      const expected_P = fromAtm((Nv! * R * Tk!) / Vv!, pUnit)
      const limSF  = lowestSigFigs([P, V, N, T])
      const userSF = countSigFigs(P)

      stps.push('Check: PV = nRT')
      stps.push(`LHS = P × V = ${sf4(Patm!)} × ${sf4(Vv!)} = ${sf4(lhs)}`)
      stps.push(`RHS = nRT = ${sf4(Nv!)} × ${R} × ${sf4(Tk!)} = ${sf4(rhs)}`)

      const valueOk = Math.abs(lhs - rhs) / rhs <= 0.01
      const sfOk    = userSF === limSF

      if (!valueOk) {
        stps.push(`✗ Not consistent — P should be ≈ ${formatSigFigs(expected_P, limSF)} ${pUnit}`)
        setVerified('incorrect')
      } else if (!sfOk) {
        stps.push(`⚠ Values consistent — check sig figs (expected ${limSF}, got ${userSF})`)
        setVerified('sig_fig_warning')
      } else {
        stps.push('✓ Consistent — PV = nRT')
        setVerified('correct')
      }
      setSteps(stps)
      setResult(formatSigFigs(expected_P, limSF))
      setResultVar('P'); setResultUnit(pUnit)
      return
    }

    // ── Solve mode (3 filled, 1 blank) ─────────────────────────────────────────
    const inputVals = [P, V, N, T].filter(v => v.trim() !== '')
    const limSF = lowestSigFigs(inputVals)

    if (Pv === null) {
      pConvStep(); tConvStep()
      const ans = (Nv! * R * Tk!) / Vv!
      const ansOut = fromAtm(ans, pUnit)
      stps.push('P = nRT / V')
      stps.push(`P = (${sf4(Nv!)} mol × ${R} L·atm/(mol·K) × ${sf4(Tk!)} K) / ${sf4(Vv!)} L`)
      stps.push(`P = ${sf4(ans)} atm` + (pUnit !== 'atm' ? ` = ${sfDisplay(ansOut)} ${pUnit}` : ''))
      stps.push(`Rounded to ${limSF} sf: ${formatSigFigs(ansOut, limSF)} ${pUnit}`)
      setResult(sfDisplay(ansOut)); setResultVar('P'); setResultUnit(pUnit)
      setBreakdown(buildSigFigBreakdown(
        [{ label: 'Volume (V)', value: V }, { label: 'Amount (n)', value: N }, { label: 'Temperature (T)', value: T }],
        ansOut, pUnit,
      ))

    } else if (Vv === null) {
      pConvStep(); tConvStep()
      const ans = (Nv! * R * Tk!) / Patm!
      stps.push('V = nRT / P')
      stps.push(`V = (${sf4(Nv!)} mol × ${R} L·atm/(mol·K) × ${sf4(Tk!)} K) / ${sf4(Patm!)} atm`)
      stps.push(`V = ${sfDisplay(ans)} L`)
      stps.push(`Rounded to ${limSF} sf: ${formatSigFigs(ans, limSF)} L`)
      setResult(sfDisplay(ans)); setResultVar('V'); setResultUnit('L')
      setBreakdown(buildSigFigBreakdown(
        [{ label: 'Pressure (P)', value: P }, { label: 'Amount (n)', value: N }, { label: 'Temperature (T)', value: T }],
        ans, 'L',
      ))

    } else if (Nv === null) {
      pConvStep(); tConvStep()
      const ans = (Patm! * Vv!) / (R * Tk!)
      stps.push('n = PV / RT')
      stps.push(`n = (${sf4(Patm!)} atm × ${sf4(Vv!)} L) / (${R} L·atm/(mol·K) × ${sf4(Tk!)} K)`)
      stps.push(`n = ${sfDisplay(ans)} mol`)
      stps.push(`Rounded to ${limSF} sf: ${formatSigFigs(ans, limSF)} mol`)
      setResult(sfDisplay(ans)); setResultVar('n'); setResultUnit('mol')
      setBreakdown(buildSigFigBreakdown(
        [{ label: 'Pressure (P)', value: P }, { label: 'Volume (V)', value: V }, { label: 'Temperature (T)', value: T }],
        ans, 'mol',
      ))

    } else {
      // T is blank
      pConvStep()
      const ans  = (Patm! * Vv!) / (Nv! * R)
      const ansOut = fromK(ans, tUnit)
      stps.push('T = PV / nR')
      stps.push(`T = (${sf4(Patm!)} atm × ${sf4(Vv!)} L) / (${sf4(Nv!)} mol × ${R} L·atm/(mol·K))`)
      stps.push(`T = ${sfDisplay(ans)} K` + (tUnit === 'C' ? ` = ${sfDisplay(ansOut)} °C` : ''))
      const unit = tUnit === 'C' ? '°C' : 'K'
      stps.push(`Rounded to ${limSF} sf: ${formatSigFigs(ansOut, limSF)} ${unit}`)
      setResult(sfDisplay(ansOut)); setResultVar('T'); setResultUnit(unit)
      setBreakdown(buildSigFigBreakdown(
        [{ label: 'Pressure (P)', value: P }, { label: 'Volume (V)', value: V }, { label: 'Amount (n)', value: N }],
        ansOut, unit,
      ))
    }

    setSteps(stps)
  }

  function handleClear() {
    setP(''); setV(''); setN(''); setT('')
    reset()
  }

  const varLabel: Record<GasVar, string> = { P: 'Pressure (P)', V: 'Volume (V)', n: 'Amount (n)', T: 'Temperature (T)' }
  const hasAny = filledCount > 0
  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      <div className="flex flex-col gap-3">

        {/* Pressure */}
        <NumberField label="Pressure (P)" value={P}
          onChange={v => { setP(v); reset() }}
          placeholder="leave blank to solve"
          unit={<UnitPill options={P_UNITS} active={pUnit} onChange={v => { setPUnit(v as PUnit); reset() }} />}
        />

        {/* Volume */}
        <NumberField label="Volume (V)" value={V}
          onChange={v => { setV(v); reset() }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">L</span>}
        />

        {/* Moles */}
        <NumberField label="Amount (n)" value={N}
          onChange={v => { setN(v); reset() }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">mol</span>}
        />

        {/* Temperature */}
        <NumberField label="Temperature (T)" value={T}
          onChange={v => { setT(v); reset() }}
          placeholder="leave blank to solve"
          unit={<div className="flex items-center gap-1">
            <UnitPill options={['K', 'C']} active={tUnit} onChange={v => { setTUnit(v as TUnit); reset() }} />
            <span className="font-mono text-sm text-secondary px-1">{tUnit === 'C' ? '°C' : 'K'}</span>
          </div>}
        />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleToolulate} disabled={filledCount < 3}
          className="shrink-0 px-5 py-2 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          {filledCount === 4 ? 'Verify' : 'Calculate'}
        </button>
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        {hasAny && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />

      {result && resultVar && (
        <ResultDisplay
          label={varLabel[resultVar]}
          value={result}
          unit={resultUnit}
          sigFigsValue={sigFigsResult}
          verified={verified}
        />
      )}

      <p className="font-mono text-xs text-secondary">
        R = {R} L·atm/(mol·K) · fill any three fields and leave one blank to solve · fill all four to verify
      </p>
    </div>
  )
}

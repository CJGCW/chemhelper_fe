import { useState } from 'react'
import { pick, randBetween, roundTo } from '../calculations/WorkedExample'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../calculations/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../calculations/SigFigPanel'
import NumberField from '../calculations/NumberField'
import ResultDisplay from '../calculations/ResultDisplay'
import { hasValue } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import { buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs } from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'
import { R, P_UNITS, type PUnit, type TUnit, toK, fromK, toAtm, fromAtm } from '../../utils/idealGas'

// ── Example generator ─────────────────────────────────────────────────────────

const DENSITY_GAS_DATA = [
  { name: 'CO₂', M: 44.01 }, { name: 'O₂', M: 32.00 }, { name: 'N₂', M: 28.02 },
  { name: 'CH₄', M: 16.04 }, { name: 'Cl₂', M: 70.90 }, { name: 'SO₂', M: 64.07 },
]

function generateGasDensityExample() {
  const gas = pick(DENSITY_GAS_DATA)
  const T   = roundTo(randBetween(250, 400), 0)
  const P   = roundTo(randBetween(0.5, 2.0), 2)
  const sf4 = (v: number) => parseFloat(v.toPrecision(4)).toString()
  const rho = (gas.M * P) / (R * T)
  return {
    scenario: `Find the density of ${gas.name} (M = ${gas.M} g/mol) at ${T} K and ${P} atm.`,
    steps: [
      `ρ = MP / RT`,
      `ρ = (${gas.M} g/mol × ${P} atm) / (${R} L·atm/(mol·K) × ${T} K)`,
      `ρ = ${sf4(rho)} g/L`,
    ],
    result: `ρ = ${sf4(rho)} g/L`,
  }
}

// ── Unit pill ─────────────────────────────────────────────────────────────────

function UnitPill({
  options, active, onChange,
}: { options: readonly string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
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

// ── Component ─────────────────────────────────────────────────────────────────

type SolveFor = 'M' | 'rho' | 'T' | 'P'

interface Result { value: string; unit: string; label: string }

export default function GasDensityTool() {
  const [rho, setRho]     = useState('')
  const [M, setM]         = useState('')
  const [T, setT]         = useState('')
  const [P, setP]         = useState('')
  const [pUnit, setPUnit] = useState<PUnit>('atm')
  const [tUnit, setTUnit] = useState<TUnit>('K')

  const [result,    setResult]    = useState<Result | null>(null)
  const [steps,     setSteps]     = useState<string[]>([])
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null)
  const [verified,  setVerified]  = useState<VerifyState>(null)
  const [sfOpen,    setSfOpen]    = useState(false)
  const [error,     setError]     = useState('')

  const stepsState = useStepsPanelState(steps, generateGasDensityExample)

  const blanks = [rho, M, T, P].filter(v => !hasValue(v)).length
  const isVerify = blanks === 0

  function reset() {
    setRho(''); setM(''); setT(''); setP('')
    setResult(null); setSteps([]); setBreakdown(null); setVerified(null); setError('')
  }

  function handleTool() {
    setError(''); setResult(null); setSteps([]); setBreakdown(null); setVerified(null)

    if (blanks > 1) {
      setError(blanks === 4 ? 'Enter at least three values.' : 'Fill in exactly three fields.')
      return
    }

    const pRho = hasValue(rho) ? parseFloat(rho) : null
    const pM   = hasValue(M)   ? parseFloat(M)   : null
    const pT   = hasValue(T)   ? toK(parseFloat(T), tUnit) : null
    const pP   = hasValue(P)   ? parseFloat(P)   : null

    if ([pRho, pM, pT, pP].some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }

    const Patm = pP !== null ? toAtm(pP, pUnit) : null
    const sf = (v: number) => parseFloat(v.toPrecision(4)).toString()
    const newSteps: string[] = []
    const pConv = pUnit !== 'atm' && Patm !== null && pP !== null
      ? [`Convert P: ${sf(pP)} ${pUnit} = ${sf(Patm)} atm`] : []
    const tConv = tUnit === 'C' && pT !== null
      ? [`Convert T: ${sf(parseFloat(T))} °C = ${sf(pT)} K`] : []

    // ── Verify mode (all 4 filled) ────────────────────────────────────────────
    if (isVerify) {
      const expected = (pM! * Patm!) / (R * pT!)
      const limSF = lowestSigFigs([M, P, T])
      const userSF = countSigFigs(rho)
      const valueOk = Math.abs(expected - pRho!) / expected <= 0.01
      const sfOk = userSF === limSF
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
      newSteps.push('ρ = MP / RT', ...pConv, ...tConv,
        `ρ = (${sf(pM!)} × ${sf(Patm!)}) / (${R} × ${sf(pT!)})`,
        `ρ = ${sf(expected)} g/L`,
        `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)} g/L`,
        !valueOk
          ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)} g/L`
          : !sfOk
          ? `⚠ Correct value — expected ${limSF} sf, got ${userSF}`
          : `✓ Correct`,
      )
      setSteps(newSteps)
      setResult({ value: formatSigFigs(expected, limSF), unit: 'g/L', label: 'Density (ρ)' })
      return
    }

    // ── Solve mode (one blank) ────────────────────────────────────────────────
    let ans: number
    let solveFor: SolveFor
    let unit: string
    let label: string
    let bdInputs: { label: string; value: string }[]

    if (pM === null) {
      ans = (pRho! * R * pT!) / Patm!
      solveFor = 'M'; unit = 'g/mol'; label = 'Molar Mass (M)'
      newSteps.push('M = ρRT / P', ...pConv, ...tConv,
        `M = (${sf(pRho!)} × ${R} × ${sf(pT!)}) / ${sf(Patm!)}`,
        `M = ${sf(ans)} g/mol`)
      bdInputs = [{ label: 'Density (ρ)', value: rho }, { label: 'Pressure (P)', value: P }, { label: 'Temperature (T)', value: T }]

    } else if (pRho === null) {
      ans = (pM * Patm!) / (R * pT!)
      solveFor = 'rho'; unit = 'g/L'; label = 'Density (ρ)'
      newSteps.push('ρ = MP / RT', ...pConv, ...tConv,
        `ρ = (${sf(pM)} × ${sf(Patm!)}) / (${R} × ${sf(pT!)})`,
        `ρ = ${sf(ans)} g/L`)
      bdInputs = [{ label: 'Molar mass (M)', value: M }, { label: 'Pressure (P)', value: P }, { label: 'Temperature (T)', value: T }]

    } else if (pT === null) {
      ans = (pM * Patm!) / (pRho * R)
      const ansOut = fromK(ans, tUnit)
      solveFor = 'T'; unit = tUnit === 'C' ? '°C' : 'K'; label = 'Temperature (T)'
      newSteps.push('T = MP / ρR', ...pConv,
        `T = (${sf(pM)} × ${sf(Patm!)}) / (${sf(pRho)} × ${R})`,
        `T = ${sf(ans)} K` + (tUnit === 'C' ? `  =  ${sf(ansOut)} °C` : ''))
      ans = ansOut
      bdInputs = [{ label: 'Density (ρ)', value: rho }, { label: 'Molar mass (M)', value: M }, { label: 'Pressure (P)', value: P }]

    } else {
      const ansAtm = (pRho * R * pT) / pM
      ans = fromAtm(ansAtm, pUnit)
      solveFor = 'P'; unit = pUnit; label = 'Pressure (P)'
      newSteps.push('P = ρRT / M', ...tConv,
        `P = (${sf(pRho)} × ${R} × ${sf(pT)}) / ${sf(pM)}`,
        `P = ${sf(ansAtm)} atm` + (pUnit !== 'atm' ? `  =  ${sf(ans)} ${pUnit}` : ''))
      bdInputs = [{ label: 'Density (ρ)', value: rho }, { label: 'Molar mass (M)', value: M }, { label: 'Temperature (T)', value: T }]
    }

    void solveFor
    setSteps(newSteps)
    setResult({ value: sf(ans), unit, label })
    setBreakdown(buildSigFigBreakdown(bdInputs, ans, unit))
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null
  const hasAny = rho || M || T || P

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      <p className="font-sans text-sm text-secondary">
        Fill in three fields and leave one blank — it will be solved using{' '}
        <span className="font-mono">ρ = MP / RT</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumberField
          label="ρ — Density"
          value={rho}
          onChange={v => { setRho(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">g/L</span>}
        />
        <NumberField
          label="M — Molar mass"
          value={M}
          onChange={v => { setM(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">g/mol</span>}
        />
        <NumberField
          label="T — Temperature"
          value={T}
          onChange={v => { setT(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<UnitPill options={['K', 'C']} active={tUnit} onChange={v => { setTUnit(v as TUnit); setResult(null) }} />}
        />
        <NumberField
          label="P — Pressure"
          value={P}
          onChange={v => { setP(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<UnitPill options={P_UNITS} active={pUnit} onChange={v => { setPUnit(v as PUnit); setResult(null) }} />}
        />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleTool}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          {isVerify ? 'Verify' : 'Calculate'}
        </button>
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        {(hasAny || result) && (
          <button onClick={reset}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />

      {result && (
        <ResultDisplay
          label={result.label}
          value={result.value}
          unit={result.unit}
          sigFigsValue={sigFigsResult}
          verified={verified}
        />
      )}

      <p className="font-mono text-xs text-secondary">
        R = {R} L·atm/(mol·K). Density in g/L, molar mass in g/mol. T must be above 0 K.
      </p>
    </div>
  )
}

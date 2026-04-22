import { useState } from 'react'
import { motion } from 'framer-motion'
import { pick, randBetween, roundTo } from '../calculations/WorkedExample'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../calculations/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../calculations/SigFigPanel'
import NumberField from '../calculations/NumberField'
import ResultDisplay from '../calculations/ResultDisplay'
import { hasValue } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import { buildSigFigBreakdown, countSigFigs, formatSigFigs, lowestSigFigs } from '../../utils/sigfigs'
import type { SigFigBreakdown } from '../../utils/sigfigs'

// ── Example generator ─────────────────────────────────────────────────────────

const GRAHAM_GAS_PAIRS = [
  { g1: 'H₂', M1: 2.016, g2: 'O₂', M2: 32.00 },
  { g1: 'He', M1: 4.003, g2: 'N₂', M2: 28.02 },
  { g1: 'CH₄', M1: 16.04, g2: 'CO₂', M2: 44.01 },
  { g1: 'NH₃', M1: 17.03, g2: 'HCl', M2: 36.46 },
  { g1: 'N₂', M1: 28.02, g2: 'Cl₂', M2: 70.90 },
]

function generateGrahamsLawExample() {
  const pair = pick(GRAHAM_GAS_PAIRS)
  const rate2 = roundTo(randBetween(1.0, 5.0), 2)
  const ratio = Math.sqrt(pair.M2 / pair.M1)
  const rate1 = rate2 * ratio
  const sf4 = (v: number) => parseFloat(v.toPrecision(4)).toString()
  return {
    scenario: `${pair.g1} (M = ${pair.M1} g/mol) and ${pair.g2} (M = ${pair.M2} g/mol). If ${pair.g2} effuses at ${rate2} mL/s, find the rate for ${pair.g1}.`,
    steps: [
      `rate(${pair.g1}) / rate(${pair.g2}) = √(M(${pair.g2}) / M(${pair.g1}))`,
      `rate(${pair.g1}) = ${rate2} × √(${pair.M2} / ${pair.M1})`,
      `rate(${pair.g1}) = ${rate2} × ${sf4(ratio)}`,
      `rate(${pair.g1}) = ${sf4(rate1)} mL/s`,
    ],
    result: `rate(${pair.g1}) = ${sf4(rate1)} mL/s`,
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type InputMode = 'rate' | 'time'
type SolveFor  = 'val1' | 'val2' | 'M1' | 'M2'

interface Result { value: string; unit: string; label: string }

// ── Component ─────────────────────────────────────────────────────────────────

export default function GrahamsLawTool() {
  const [inputMode, setInputMode] = useState<InputMode>('rate')

  const [gas1, setGas1] = useState('')
  const [gas2, setGas2] = useState('')
  const [M1,   setM1]   = useState('')
  const [M2,   setM2]   = useState('')
  const [val1, setVal1] = useState('')
  const [val2, setVal2] = useState('')

  const [result,    setResult]    = useState<Result | null>(null)
  const [steps,     setSteps]     = useState<string[]>([])
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null)
  const [verified,  setVerified]  = useState<VerifyState>(null)
  const [sfOpen,    setSfOpen]    = useState(false)
  const [error,     setError]     = useState('')

  const stepsState = useStepsPanelState(steps, generateGrahamsLawExample)

  const label1  = gas1.trim() || 'Gas 1'
  const label2  = gas2.trim() || 'Gas 2'
  const rateLbl = inputMode === 'rate' ? 'Rate' : 'Time'

  const blanks   = [M1, M2, val1, val2].filter(v => !hasValue(v)).length
  const isVerify = blanks === 0

  function handleModeChange(m: InputMode) {
    setInputMode(m)
    setVal1(''); setVal2('')
    setResult(null); setSteps([]); setBreakdown(null); setVerified(null); setError('')
  }

  function reset() {
    setM1(''); setM2(''); setVal1(''); setVal2('')
    setResult(null); setSteps([]); setBreakdown(null); setVerified(null); setError('')
  }

  function handleTool() {
    setError(''); setResult(null); setSteps([]); setBreakdown(null); setVerified(null)

    if (blanks > 1) {
      setError(blanks === 4 ? 'Enter at least three values.' : 'Fill in exactly three fields.')
      return
    }

    const pM1   = hasValue(M1)   ? parseFloat(M1)   : null
    const pM2   = hasValue(M2)   ? parseFloat(M2)   : null
    const pVal1 = hasValue(val1) ? parseFloat(val1) : null
    const pVal2 = hasValue(val2) ? parseFloat(val2) : null

    if ([pM1, pM2, pVal1, pVal2].some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }

    const sf = (v: number) => parseFloat(v.toPrecision(4)).toString()
    const newSteps: string[] = []
    const rateUnit = inputMode === 'rate' ? '' : 's'

    // Unified formulas:
    //   rate mode:  r₁/r₂ = √(M₂/M₁)
    //   time mode:  t₁/t₂ = √(M₁/M₂)

    // ── Verify mode (all 4 filled) — always verifies val1 ─────────────────────
    if (isVerify) {
      const expected = inputMode === 'rate'
        ? pVal2! * Math.sqrt(pM2! / pM1!)
        : pVal2! * Math.sqrt(pM1! / pM2!)
      const limSF = lowestSigFigs([M2, M1, M2])
      const userSF = countSigFigs(val1)
      const valueOk = Math.abs(expected - pVal1!) / expected <= 0.01
      const sfOk = userSF === limSF
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')

      if (inputMode === 'rate') {
        newSteps.push(
          `rate₁ / rate₂ = √(M₂ / M₁)`,
          `rate₁ = ${sf(pVal2!)} × √(${sf(pM2!)} / ${sf(pM1!)})`,
          `rate₁ = ${sf(expected)}`,
          `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)}`,
        )
      } else {
        newSteps.push(
          `t₁ / t₂ = √(M₁ / M₂)`,
          `t₁ = ${sf(pVal2!)} × √(${sf(pM1!)} / ${sf(pM2!)})`,
          `t₁ = ${sf(expected)}`,
          `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)}`,
        )
      }
      newSteps.push(
        !valueOk
          ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)}`
          : !sfOk
          ? `⚠ Correct value — expected ${limSF} sf, got ${userSF}`
          : `✓ Correct`,
      )
      setSteps(newSteps)
      setResult({
        value: formatSigFigs(expected, limSF),
        unit: rateUnit,
        label: `${rateLbl} of ${label1}`,
      })
      return
    }

    // ── Solve mode (one blank) ────────────────────────────────────────────────
    let ans: number
    let solveFor: SolveFor
    let unit: string
    let label: string
    let bdInputs: { label: string; value: string }[]

    if (inputMode === 'rate') {
      if (pVal1 === null) {
        ans = pVal2! * Math.sqrt(pM2! / pM1!)
        solveFor = 'val1'; unit = ''; label = `Rate of ${label1}`
        newSteps.push(
          `rate₁ = rate₂ × √(M₂ / M₁)`,
          `rate₁ = ${sf(pVal2!)} × √(${sf(pM2!)} / ${sf(pM1!)})`,
          `rate₁ = ${sf(pVal2!)} × ${sf(Math.sqrt(pM2! / pM1!))}`,
          `rate₁ = ${sf(ans)}`,
        )
        bdInputs = [{ label: 'Rate 2', value: val2 }, { label: 'M₁', value: M1 }, { label: 'M₂', value: M2 }]

      } else if (pVal2 === null) {
        ans = pVal1! * Math.sqrt(pM1! / pM2!)
        solveFor = 'val2'; unit = ''; label = `Rate of ${label2}`
        newSteps.push(
          `rate₂ = rate₁ × √(M₁ / M₂)`,
          `rate₂ = ${sf(pVal1!)} × √(${sf(pM1!)} / ${sf(pM2!)})`,
          `rate₂ = ${sf(pVal1!)} × ${sf(Math.sqrt(pM1! / pM2!))}`,
          `rate₂ = ${sf(ans)}`,
        )
        bdInputs = [{ label: 'Rate 1', value: val1 }, { label: 'M₁', value: M1 }, { label: 'M₂', value: M2 }]

      } else if (pM1 === null) {
        ans = pM2! * Math.pow(pVal2! / pVal1!, 2)
        solveFor = 'M1'; unit = 'g/mol'; label = `Molar mass of ${label1}`
        newSteps.push(
          `M₁ = M₂ × (rate₂ / rate₁)²`,
          `M₁ = ${sf(pM2!)} × (${sf(pVal2!)} / ${sf(pVal1!)})²`,
          `M₁ = ${sf(pM2!)} × ${sf(Math.pow(pVal2! / pVal1!, 2))}`,
          `M₁ = ${sf(ans)} g/mol`,
        )
        bdInputs = [{ label: 'Rate 1', value: val1 }, { label: 'Rate 2', value: val2 }, { label: 'M₂', value: M2 }]

      } else {
        ans = pM1! * Math.pow(pVal1! / pVal2!, 2)
        solveFor = 'M2'; unit = 'g/mol'; label = `Molar mass of ${label2}`
        newSteps.push(
          `M₂ = M₁ × (rate₁ / rate₂)²`,
          `M₂ = ${sf(pM1!)} × (${sf(pVal1!)} / ${sf(pVal2!)})²`,
          `M₂ = ${sf(pM1!)} × ${sf(Math.pow(pVal1! / pVal2!, 2))}`,
          `M₂ = ${sf(ans)} g/mol`,
        )
        bdInputs = [{ label: 'Rate 1', value: val1 }, { label: 'Rate 2', value: val2 }, { label: 'M₁', value: M1 }]
      }
    } else {
      // time mode: t₁/t₂ = √(M₁/M₂)
      if (pVal1 === null) {
        ans = pVal2! * Math.sqrt(pM1! / pM2!)
        solveFor = 'val1'; unit = ''; label = `Time for ${label1}`
        newSteps.push(
          `t₁ = t₂ × √(M₁ / M₂)`,
          `t₁ = ${sf(pVal2!)} × √(${sf(pM1!)} / ${sf(pM2!)})`,
          `t₁ = ${sf(pVal2!)} × ${sf(Math.sqrt(pM1! / pM2!))}`,
          `t₁ = ${sf(ans)}`,
        )
        bdInputs = [{ label: 'Time 2', value: val2 }, { label: 'M₁', value: M1 }, { label: 'M₂', value: M2 }]

      } else if (pVal2 === null) {
        ans = pVal1! * Math.sqrt(pM2! / pM1!)
        solveFor = 'val2'; unit = ''; label = `Time for ${label2}`
        newSteps.push(
          `t₂ = t₁ × √(M₂ / M₁)`,
          `t₂ = ${sf(pVal1!)} × √(${sf(pM2!)} / ${sf(pM1!)})`,
          `t₂ = ${sf(pVal1!)} × ${sf(Math.sqrt(pM2! / pM1!))}`,
          `t₂ = ${sf(ans)}`,
        )
        bdInputs = [{ label: 'Time 1', value: val1 }, { label: 'M₁', value: M1 }, { label: 'M₂', value: M2 }]

      } else if (pM1 === null) {
        ans = pM2! * Math.pow(pVal1! / pVal2!, 2)
        solveFor = 'M1'; unit = 'g/mol'; label = `Molar mass of ${label1}`
        newSteps.push(
          `M₁ = M₂ × (t₁ / t₂)²`,
          `M₁ = ${sf(pM2!)} × (${sf(pVal1!)} / ${sf(pVal2!)})²`,
          `M₁ = ${sf(pM2!)} × ${sf(Math.pow(pVal1! / pVal2!, 2))}`,
          `M₁ = ${sf(ans)} g/mol`,
        )
        bdInputs = [{ label: 'Time 1', value: val1 }, { label: 'Time 2', value: val2 }, { label: 'M₂', value: M2 }]

      } else {
        ans = pM1! * Math.pow(pVal2! / pVal1!, 2)
        solveFor = 'M2'; unit = 'g/mol'; label = `Molar mass of ${label2}`
        newSteps.push(
          `M₂ = M₁ × (t₂ / t₁)²`,
          `M₂ = ${sf(pM1!)} × (${sf(pVal2!)} / ${sf(pVal1!)})²`,
          `M₂ = ${sf(pM1!)} × ${sf(Math.pow(pVal2! / pVal1!, 2))}`,
          `M₂ = ${sf(ans)} g/mol`,
        )
        bdInputs = [{ label: 'Time 1', value: val1 }, { label: 'Time 2', value: val2 }, { label: 'M₁', value: M1 }]
      }
    }

    void solveFor
    setSteps(newSteps)
    setResult({ value: sf(ans), unit, label })
    setBreakdown(buildSigFigBreakdown(bdInputs, ans, unit))
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null
  const hasAny = M1 || M2 || val1 || val2

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Mode toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-sm self-start"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {([
            { id: 'rate', label: 'Effusion Rates' },
            { id: 'time', label: 'Effusion Times'  },
          ] as const).map(m => (
            <button key={m.id} onClick={() => handleModeChange(m.id)}
              className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: inputMode === m.id ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
              {inputMode === m.id && (
                <motion.div layoutId="grahams-mode-pill" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-dim">
          {inputMode === 'rate'
            ? 'rate₁ / rate₂ = √(M₂ / M₁)'
            : 't₁ / t₂ = √(M₁ / M₂)'}
        </p>
      </div>

      <p className="font-sans text-sm text-secondary -mt-1">
        Fill in three fields and leave one blank — it will be solved.
      </p>

      {/* Gas labels */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-sans text-sm font-medium text-primary">Gas 1 name (optional)</label>
          <input type="text" value={gas1} onChange={e => setGas1(e.target.value)}
            placeholder="e.g. H₂"
            className="font-sans text-sm bg-raised border border-border rounded-sm px-3 py-2
                       text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-sans text-sm font-medium text-primary">Gas 2 name (optional)</label>
          <input type="text" value={gas2} onChange={e => setGas2(e.target.value)}
            placeholder="e.g. O₂"
            className="font-sans text-sm bg-raised border border-border rounded-sm px-3 py-2
                       text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
      </div>

      {/* Numeric inputs */}
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={`M₁ — Molar mass of ${label1}`}
          value={M1}
          onChange={v => { setM1(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">g/mol</span>}
        />
        <NumberField
          label={`M₂ — Molar mass of ${label2}`}
          value={M2}
          onChange={v => { setM2(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">g/mol</span>}
        />
        <NumberField
          label={inputMode === 'rate' ? `rate₁ — Rate of ${label1}` : `t₁ — Time for ${label1}`}
          value={val1}
          onChange={v => { setVal1(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">{inputMode === 'rate' ? 'any unit' : 'any unit'}</span>}
        />
        <NumberField
          label={inputMode === 'rate' ? `rate₂ — Rate of ${label2}` : `t₂ — Time for ${label2}`}
          value={val2}
          onChange={v => { setVal2(v); setResult(null); setVerified(null); setBreakdown(null) }}
          placeholder="leave blank to solve"
          unit={<span className="font-mono text-sm text-secondary px-2">same unit</span>}
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
        {inputMode === 'rate'
          ? 'Rate units must be consistent (e.g. both mL/s). Molar masses in g/mol.'
          : 'Time units must be consistent (e.g. both seconds). Molar masses in g/mol.'}
      </p>
    </div>
  )
}

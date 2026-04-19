import { useState } from 'react'
import { motion } from 'framer-motion'
import ExampleBox from './ExampleBox'
import NumberField from './NumberField'
import UnitSelect, { VOLUME_UNITS } from './UnitSelect'
import type { UnitOption } from './UnitSelect'
import ResultDisplay from './ResultDisplay'
import StepsPanel from './StepsPanel'
import { sanitize, hasValue, toStandard, conversionStep } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import { lowestSigFigs, formatSigFigs, countSigFigs } from '../../utils/sigfigs'

function particlePositions(count: number, seed: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const angle = ((i * 137.5 + seed * 41) % 360) * (Math.PI / 180)
    const r = 0.25 + ((i * 31 + seed * 7) % 100) / 200
    positions.push({
      x: 0.5 + r * Math.cos(angle) * 0.7,
      y: 0.5 + r * Math.sin(angle) * 0.7,
    })
  }
  return positions
}

interface MiniBeakerProps {
  label: string
  volumeLabel: string
  concLabel: string
  fillFrac: number
  colorAlpha: number
  particleCount: number
  seed: number
}

function MiniBeaker({ label, volumeLabel, concLabel, fillFrac, colorAlpha, particleCount, seed }: MiniBeakerProps) {
  const W = 80
  const H = 110
  const wall = 4
  const innerW = W - wall * 2
  const liquidH = Math.max(0, Math.min(fillFrac, 1)) * (H - wall * 2)
  const liquidY = H - wall - liquidH
  const alpha = Math.max(0.08, Math.min(colorAlpha, 0.9))
  const liquidColor = `rgba(200,120,40,${alpha.toFixed(3)})`
  const particles = particlePositions(particleCount, seed)

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[10px] text-secondary">{concLabel}</span>
      <svg viewBox={`0 0 ${W} ${H + 4}`} width={W} height={H + 4}>
        <rect x={wall} y={0} width={innerW} height={H} fill="rgb(var(--color-surface))" stroke="rgb(var(--color-border))" strokeWidth="1" />
        <motion.rect
          x={wall}
          y={liquidY}
          width={innerW}
          height={liquidH}
          fill={liquidColor}
          animate={{ y: liquidY, height: liquidH, fill: liquidColor }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
        />
        {particles.map((p, i) => {
          const px = wall + p.x * innerW
          const py = liquidY + p.y * liquidH
          if (liquidH < 6) return null
          return (
            <motion.circle
              key={i}
              cx={px}
              cy={py}
              r={2.5}
              fill="rgba(var(--overlay),0.65)"
              animate={{ cx: px, cy: py }}
              transition={{ type: 'spring', stiffness: 80, damping: 16 }}
            />
          )
        })}
        <rect x={0} y={0} width={wall} height={H} fill="rgb(var(--color-raised))" stroke="rgb(var(--color-border))" strokeWidth="0.5" />
        <rect x={W - wall} y={0} width={wall} height={H} fill="rgb(var(--color-raised))" stroke="rgb(var(--color-border))" strokeWidth="0.5" />
        <rect x={0} y={H} width={W} height={wall} fill="rgb(var(--color-raised))" stroke="rgb(var(--color-border))" strokeWidth="0.5" />
      </svg>
      <span className="font-mono text-xs text-secondary">{volumeLabel}</span>
      <span className="font-mono text-xs text-secondary uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function DilutionCalc() {
  const [c1Value, setC1Value] = useState('')
  const [v1Value, setV1Value] = useState('')
  const [v1Unit, setV1Unit] = useState<UnitOption>(VOLUME_UNITS[1])
  const [c2Value, setC2Value] = useState('')
  const [v2Value, setV2Value] = useState('')
  const [v2Unit, setV2Unit] = useState<UnitOption>(VOLUME_UNITS[1])

  const [result, setResult] = useState<string | null>(null)
  const [resultUnit, setResultUnit] = useState('')
  const [resultLabel, setResultLabel] = useState('Result')
  const [steps, setSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState<VerifyState>(null)

  const hasC1 = hasValue(c1Value)
  const hasV1 = hasValue(v1Value)
  const hasC2 = hasValue(c2Value)
  const hasV2 = hasValue(v2Value)

  const filledCount = [hasC1, hasV1, hasC2, hasV2].filter(Boolean).length
  const blankCount = 4 - filledCount
  const isVerify = filledCount === 4

  function reset() {
    setResult(null)
    setSteps([])
    setError(null)
    setVerified(null)
  }

  function calculate() {
    reset()

    if (blankCount > 1) {
      setError('Leave exactly one field blank to solve, or fill all four to verify.')
      return
    }

    const C1 = hasC1 ? parseFloat(c1Value) : 0
    const V1 = hasV1 ? toStandard(v1Value, v1Unit) : 0
    const C2 = hasC2 ? parseFloat(c2Value) : 0
    const V2 = hasV2 ? toStandard(v2Value, v2Unit) : 0

    try {
      if (isVerify) {
        if (C1 <= 0 || V1 <= 0 || C2 <= 0 || V2 <= 0) { setError('All values must be positive.'); return }
        const lhs = C1 * V1
        const rhs = C2 * V2
        const limSF = lowestSigFigs([c1Value, v1Value, c2Value, v2Value])
        const userC2SF = countSigFigs(c2Value)
        const valueOk = Math.abs(lhs - rhs) / lhs <= 0.01
        const sfOk = userC2SF === limSF
        setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
        setSteps([
          ...(conversionStep(v1Value, v1Unit, 'L', V1) ? [conversionStep(v1Value, v1Unit, 'L', V1)!] : []),
          ...(conversionStep(v2Value, v2Unit, 'L', V2) ? [conversionStep(v2Value, v2Unit, 'L', V2)!] : []),
          `C₁V₁ = ${C1} × ${V1} = ${(C1 * V1).toPrecision(6)} mol`,
          `C₂V₂ = ${C2} × ${V2} = ${(C2 * V2).toPrecision(6)} mol`,
          valueOk
            ? `✓ C₁V₁ ≈ C₂V₂ — dilution equation satisfied`
            : `✗ C₁V₁ ≠ C₂V₂ (${(C1 * V1).toPrecision(4)} ≠ ${(C2 * V2).toPrecision(4)})`,
        ])
        setResult(formatSigFigs(C2, limSF))
        setResultUnit('mol/L')
        setResultLabel('C₂ (expected)')
        return
      }

      if (!hasC2) {
        if (C1 <= 0 || V1 <= 0 || V2 <= 0) { setError('Invalid values.'); return }
        const res = C1 * V1 / V2
        const sf = lowestSigFigs([c1Value, v1Value, v2Value])
        setSteps([
          'C₁V₁ = C₂V₂  →  C₂ = C₁V₁ / V₂',
          ...(conversionStep(v1Value, v1Unit, 'L', V1) ? [conversionStep(v1Value, v1Unit, 'L', V1)!] : []),
          ...(conversionStep(v2Value, v2Unit, 'L', V2) ? [conversionStep(v2Value, v2Unit, 'L', V2)!] : []),
          `C₂ = (${C1} mol/L × ${V1} L) / ${V2} L`,
          `C₂ = ${res} mol/L`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol/L`,
        ])
        setResult(res.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('mol/L')
        setResultLabel('C₂')
      } else if (!hasV2) {
        if (C1 <= 0 || V1 <= 0 || C2 <= 0) { setError('Invalid values.'); return }
        const res = C1 * V1 / C2
        const sf = lowestSigFigs([c1Value, v1Value, c2Value])
        setSteps([
          'C₁V₁ = C₂V₂  →  V₂ = C₁V₁ / C₂',
          ...(conversionStep(v1Value, v1Unit, 'L', V1) ? [conversionStep(v1Value, v1Unit, 'L', V1)!] : []),
          `V₂ = (${C1} mol/L × ${V1} L) / ${C2} mol/L`,
          `V₂ = ${res} L`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} L`,
        ])
        setResult(res.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('L')
        setResultLabel('V₂')
      } else if (!hasC1) {
        if (C2 <= 0 || V1 <= 0 || V2 <= 0) { setError('Invalid values.'); return }
        const res = C2 * V2 / V1
        const sf = lowestSigFigs([c2Value, v1Value, v2Value])
        setSteps([
          'C₁V₁ = C₂V₂  →  C₁ = C₂V₂ / V₁',
          ...(conversionStep(v1Value, v1Unit, 'L', V1) ? [conversionStep(v1Value, v1Unit, 'L', V1)!] : []),
          ...(conversionStep(v2Value, v2Unit, 'L', V2) ? [conversionStep(v2Value, v2Unit, 'L', V2)!] : []),
          `C₁ = (${C2} mol/L × ${V2} L) / ${V1} L`,
          `C₁ = ${res} mol/L`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol/L`,
        ])
        setResult(res.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('mol/L')
        setResultLabel('C₁')
      } else {
        // !hasV1
        if (C1 <= 0 || C2 <= 0 || V2 <= 0) { setError('Invalid values.'); return }
        const res = C2 * V2 / C1
        const sf = lowestSigFigs([c1Value, c2Value, v2Value])
        setSteps([
          'C₁V₁ = C₂V₂  →  V₁ = C₂V₂ / C₁',
          ...(conversionStep(v2Value, v2Unit, 'L', V2) ? [conversionStep(v2Value, v2Unit, 'L', V2)!] : []),
          `V₁ = (${C2} mol/L × ${V2} L) / ${C1} mol/L`,
          `V₁ = ${res} L`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} L`,
        ])
        setResult(res.toPrecision(8).replace(/\.?0+$/, ''))
        setResultUnit('L')
        setResultLabel('V₁')
      }
    } catch {
      setError('An unexpected error occurred.')
    }
  }

  // Visual: need C1, V1, and at least one of C2/V2 known
  const V1_L = hasV1 ? toStandard(v1Value, v1Unit) : null
  const V2_L = hasV2 ? toStandard(v2Value, v2Unit) : null
  const C1_num = hasC1 ? parseFloat(c1Value) : null
  const C2_num = hasC2 ? parseFloat(c2Value) : null

  const showVisual = C1_num !== null && V1_L !== null && (C2_num !== null || V2_L !== null)

  let visualC2 = C2_num
  let visualV2L = V2_L
  if (showVisual && result !== null) {
    if (!hasC2 && resultLabel === 'C₂') visualC2 = parseFloat(result)
    if (!hasV2 && resultLabel === 'V₂') visualV2L = parseFloat(result)
    if (!hasV2 && resultLabel.startsWith('V')) visualV2L = parseFloat(result)
  }

  const maxV = Math.max(V1_L ?? 0, visualV2L ?? 0)
  const maxC = Math.max(C1_num ?? 0, visualC2 ?? 0)
  const fill1 = maxV > 0 && V1_L !== null ? V1_L / maxV : 0
  const fill2 = maxV > 0 && visualV2L !== null ? visualV2L / maxV : 0
  const alpha1 = maxC > 0 && C1_num !== null ? 0.15 + (C1_num / maxC) * 0.7 : 0.5
  const alpha2 = maxC > 0 && visualC2 !== null ? 0.15 + (visualC2 / maxC) * 0.7 : 0.15

  const moles = C1_num !== null && V1_L !== null ? C1_num * V1_L : null
  const particleCount = moles !== null ? Math.min(Math.max(Math.round(moles * 4) + 2, 2), 8) : 4

  function fmtVol(l: number | null): string {
    if (l === null) return '—'
    return l >= 1 ? `${l.toPrecision(3)} L` : `${Math.round(l * 1000)} mL`
  }
  function fmtConc(c: number | null): string {
    if (c === null) return '—'
    return `${c.toPrecision(3)} M`
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <ExampleBox>{`Dilute 50.0 mL of 6.00 M HCl to 300.0 mL. Find C₂.
  C₁V₁ = C₂V₂
  C₂ = (6.00 M × 50.0 mL) / 300.0 mL
  C₂ = 1.00 M`}</ExampleBox>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="C₁ (stock concentration)"
            value={c1Value}
            onChange={v => { setC1Value(sanitize(v)); reset() }}
            placeholder="e.g. 6.00"
            solveFor={!hasC1 && blankCount === 1}
            unit={<span className="font-mono text-sm text-secondary px-2">mol/L</span>}
          />
          <NumberField
            label="V₁ (stock volume)"
            value={v1Value}
            onChange={v => { setV1Value(sanitize(v)); reset() }}
            placeholder="e.g. 50.0"
            solveFor={!hasV1 && blankCount === 1}
            unit={
              <UnitSelect options={VOLUME_UNITS} value={v1Unit} onChange={u => { setV1Unit(u); reset() }} />
            }
          />
          <NumberField
            label="C₂ (final concentration)"
            value={c2Value}
            onChange={v => { setC2Value(sanitize(v)); reset() }}
            placeholder="e.g. 1.00"
            solveFor={!hasC2 && blankCount === 1}
            unit={<span className="font-mono text-sm text-secondary px-2">mol/L</span>}
          />
          <NumberField
            label="V₂ (final volume)"
            value={v2Value}
            onChange={v => { setV2Value(sanitize(v)); reset() }}
            placeholder="e.g. 300.0"
            solveFor={!hasV2 && blankCount === 1}
            unit={
              <UnitSelect options={VOLUME_UNITS} value={v2Unit} onChange={u => { setV2Unit(u); reset() }} />
            }
          />
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button
          onClick={calculate}
          className="w-full py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          {isVerify ? 'Verify' : 'Calculate'}
        </button>
      </div>

      {showVisual && (
        <div
          className="rounded-sm border border-border p-4"
          style={{ background: 'rgb(var(--color-surface))' }}
        >
          <p className="font-mono text-xs text-secondary tracking-widest uppercase mb-3">Dilution visual</p>
          <div className="flex items-center justify-center gap-4">
            <MiniBeaker
              label="Initial (C₁, V₁)"
              volumeLabel={fmtVol(V1_L)}
              concLabel={fmtConc(C1_num)}
              fillFrac={fill1}
              colorAlpha={alpha1}
              particleCount={particleCount}
              seed={1}
            />
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-xs text-secondary">add solvent</span>
              <span className="text-dim text-sm">→</span>
            </div>
            <MiniBeaker
              label="Diluted (C₂, V₂)"
              volumeLabel={fmtVol(visualV2L)}
              concLabel={fmtConc(visualC2)}
              fillFrac={fill2}
              colorAlpha={alpha2}
              particleCount={particleCount}
              seed={2}
            />
          </div>
          <p className="font-mono text-xs text-secondary text-center mt-2">
            Dots represent moles (conserved). Color intensity represents concentration.
          </p>
        </div>
      )}

      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <StepsPanel steps={steps} />
          <ResultDisplay
            label={resultLabel}
            value={result}
            unit={resultUnit}
            verified={verified}
          />
        </div>
      )}
    </div>
  )
}

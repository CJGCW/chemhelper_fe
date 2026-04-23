import { useState } from 'react'
import { generateStoichProblem } from '../../utils/stoichiometryPractice'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../shared/SigFigPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { buildSigFigBreakdown, lowestSigFigs, formatSigFigs, countSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'
import type { VerifyState } from '../../utils/calcHelpers'
import { calcPercentYield } from '../../chem/stoich'

function generatePercentYieldExample() {
  const p = generateStoichProblem('percent_yield')
  return { scenario: p.question, steps: p.steps, result: `${p.answer}%` }
}

export default function PercentYieldTool() {
  const [actualVal,      setActualVal]      = useState('')
  const [theoreticalVal, setTheoreticalVal] = useState('')
  const [result,         setResult]         = useState<string | null>(null)
  const [steps,          setSteps]          = useState<string[]>([])
  const [breakdown,      setBreakdown]      = useState<SigFigBreakdown | null>(null)
  const [sfOpen,         setSfOpen]         = useState(false)
  const [answerVal,      setAnswerVal]      = useState('')
  const [verified,       setVerified]       = useState<VerifyState>(null)

  const stepsState = useStepsPanelState(steps, generatePercentYieldExample)

  function handleTool() {
    const actual      = parseFloat(actualVal)
    const theoretical = parseFloat(theoreticalVal)
    if (isNaN(actual) || isNaN(theoretical) || actual <= 0 || theoretical <= 0) return
    if (actual > theoretical) return
    const res = calcPercentYield(actual, theoretical)
    setSteps(res.steps)
    setResult(String(res.percentYield))

    const sf = lowestSigFigs([actualVal, theoreticalVal])
    if (sf) {
      setBreakdown(buildSigFigBreakdown(
        [{ label: 'Actual yield', value: actualVal }, { label: 'Theoretical yield', value: theoreticalVal }],
        res.rawPct, '%',
      ))
    } else {
      setBreakdown(null)
    }

    if (answerVal) {
      const userSF = countSigFigs(answerVal)
      const valueOk = Math.abs(res.rawPct - parseFloat(answerVal)) / res.rawPct <= 0.01
      const sfOk = sf ? userSF === sf : true
      setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
    }
  }

  const canCalc = (() => {
    const a = parseFloat(actualVal)
    const t = parseFloat(theoreticalVal)
    return !isNaN(a) && !isNaN(t) && a > 0 && t > 0 && a <= t
  })()

  const errorMsg = (() => {
    const a = parseFloat(actualVal)
    const t = parseFloat(theoreticalVal)
    if (actualVal && theoreticalVal && !isNaN(a) && !isNaN(t) && a > t) {
      return 'Actual yield cannot exceed theoretical yield.'
    }
    return null
  })()

  function clearAll() {
    setActualVal(''); setTheoreticalVal('')
    setResult(null); setSteps([]); setBreakdown(null)
    setAnswerVal(''); setVerified(null)
  }

  const sigFigsResult = breakdown ? formatSigFigs(breakdown.rawResult, breakdown.limiting) : null
  const hasAny = actualVal || theoreticalVal

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <p className="font-mono text-sm text-secondary">
        % yield = (actual yield / theoretical yield) × 100
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NumberField
          label="Actual Yield"
          value={actualVal}
          onChange={v => { setActualVal(v); setResult(null); setSteps([]); setBreakdown(null); setVerified(null) }}
          placeholder="e.g. 9.85"
          unit={<span className="font-mono text-sm text-secondary px-2">g</span>}
        />
        <NumberField
          label="Theoretical Yield"
          value={theoreticalVal}
          onChange={v => { setTheoreticalVal(v); setResult(null); setSteps([]); setBreakdown(null); setVerified(null) }}
          placeholder="e.g. 34.06"
          unit={<span className="font-mono text-sm text-secondary px-2">g</span>}
        />
      </div>

      {errorMsg && <p className="font-mono text-xs text-rose-400">{errorMsg}</p>}

      <NumberField
        label="Your answer — optional, enter to check"
        value={answerVal}
        onChange={v => setAnswerVal(v)}
        placeholder="your answer"
        unit={<span className="font-mono text-sm text-secondary px-2">%</span>}
      />

      <div className="flex items-stretch gap-2">
        <button onClick={handleTool} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-semibold
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        {(hasAny || result) && (
          <button onClick={clearAll}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />

      {result && (
        <ResultDisplay
          label="Percent Yield"
          value={result}
          unit="%"
          sigFigsValue={sigFigsResult}
          verified={verified}
        />
      )}

      <p className="font-mono text-xs text-secondary">% yield = (actual / theoretical) × 100 · theoretical assumes limiting reagent fully consumed</p>
    </div>
  )
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import type { VerifyState } from '../../utils/calcHelpers'

// ── Worked examples ───────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    scenario: 'A student measured the density of aluminum as 2.85 g/cm³. The accepted value is 2.70 g/cm³. Calculate the percent error.',
    experimental: 2.85, accepted: 2.70,
    steps: [
      'Error = |2.85 − 2.70| = 0.15',
      '% error = (0.15 / 2.70) × 100',
      '% error = 5.56%',
    ],
    result: '5.56%',
  },
  {
    scenario: 'A student measured the specific heat of iron as 0.385 J/(g·°C). The accepted value is 0.449 J/(g·°C). Calculate the percent error.',
    experimental: 0.385, accepted: 0.449,
    steps: [
      'Error = |0.385 − 0.449| = 0.064',
      '% error = (0.064 / 0.449) × 100',
      '% error = 14.25%',
    ],
    result: '14.25%',
  },
  {
    scenario: 'A student measured the ΔH of NaOH dissolution as −42.0 kJ/mol. The accepted value is −44.5 kJ/mol. Calculate the percent error.',
    experimental: -42.0, accepted: -44.5,
    steps: [
      'Error = |−42.0 − (−44.5)| = |2.5| = 2.5',
      '% error = (2.5 / |−44.5|) × 100 = (2.5 / 44.5) × 100',
      '% error = 5.62%',
    ],
    result: '5.62%',
  },
  {
    scenario: 'A student determined the molar mass of NaCl to be 60.1 g/mol. The accepted value is 58.44 g/mol. Calculate the percent error.',
    experimental: 60.1, accepted: 58.44,
    steps: [
      'Error = |60.1 − 58.44| = 1.66',
      '% error = (1.66 / 58.44) × 100',
      '% error = 2.84%',
    ],
    result: '2.84%',
  },
  {
    scenario: 'A student measured the boiling point of ethanol as 81.2 °C. The accepted value is 78.37 °C. Calculate the percent error.',
    experimental: 81.2, accepted: 78.37,
    steps: [
      'Error = |81.2 − 78.37| = 2.83',
      '% error = (2.83 / 78.37) × 100',
      '% error = 3.61%',
    ],
    result: '3.61%',
  },
]

let _exampleIdx = 0
function nextExample() {
  const ex = EXAMPLES[_exampleIdx % EXAMPLES.length]
  _exampleIdx++
  return { scenario: ex.scenario, steps: ex.steps, result: ex.result }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PercentErrorTool() {
  const [experimental, setExperimental] = useState('')
  const [accepted, setAccepted] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [result, setResult] = useState<number | null>(null)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>(null)
  const [error, setError] = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, nextExample)

  function reset() {
    setSteps([])
    setResult(null)
    setStudentAnswer('')
    setVerifyState(null)
    setError(null)
  }

  function calculate() {
    const exp = parseFloat(experimental)
    const acc = parseFloat(accepted)

    if (isNaN(exp)) { setError('Enter a valid experimental value.'); return }
    if (isNaN(acc)) { setError('Enter a valid accepted value.'); return }
    if (acc === 0)  { setError('Accepted value cannot be zero — division by zero.'); return }

    setError(null)
    const absDiff = Math.abs(exp - acc)
    const pctError = (absDiff / Math.abs(acc)) * 100

    setSteps([
      `Error = |experimental − accepted| = |${exp} − ${acc}| = ${absDiff.toFixed(4)}`,
      `% error = (${absDiff.toFixed(4)} / ${Math.abs(acc)}) × 100`,
      `% error = ${pctError.toFixed(2)}%`,
    ])
    setResult(pctError)
    setStudentAnswer('')
    setVerifyState(null)
  }

  function checkAnswer() {
    if (result === null) return
    const val = parseFloat(studentAnswer)
    if (isNaN(val)) return
    const relDiff = Math.abs(val - result) / result
    setVerifyState(relDiff < 0.005 ? 'correct' : 'incorrect')
  }

  return (
    <div className="flex flex-col gap-5 max-w-sm">

      <p className="font-sans text-sm text-secondary leading-relaxed">
        Percent error measures how close an experimental result is to the accepted (literature) value.
        The result is always positive — we take the absolute value of the difference.
      </p>

      <p className="font-mono text-sm text-primary px-3 py-2 rounded-sm border border-border"
        style={{ background: 'rgb(var(--color-base))' }}>
        % error = |exp − accepted| / |accepted| × 100
      </p>

      <div className="flex items-stretch gap-2">
        <button
          onClick={calculate}
          className="px-4 py-2 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      <NumberField
        label="Experimental value"
        value={experimental}
        onChange={v => { setExperimental(v); reset() }}
        placeholder="e.g. 2.85"
      />
      <NumberField
        label="Accepted (literature) value"
        value={accepted}
        onChange={v => { setAccepted(v); reset() }}
        placeholder="e.g. 2.70"
        hint="Use a negative value for quantities like ΔH (e.g. −44.5)"
      />

      {error && (
        <p className="font-mono text-xs" style={{ color: '#f87171' }}>{error}</p>
      )}

      <AnimatePresence mode="wait">
        {result !== null && (
          <motion.div key="result"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-4"
          >
            <ResultDisplay
              label="Percent Error"
              value={result.toFixed(2)}
              unit="%"
              verified={verifyState}
            />

            {/* Student verify field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-secondary">Your answer — enter to check</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={studentAnswer}
                  onChange={e => { setStudentAnswer(e.target.value); setVerifyState(null) }}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                  placeholder="e.g. 5.56"
                  className="w-32 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-1.5
                             text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
                />
                <span className="font-mono text-sm text-secondary">%</span>
                <button
                  onClick={checkAnswer}
                  className="px-3 py-1.5 rounded-sm font-sans text-xs font-medium transition-colors border border-border
                             text-secondary hover:text-primary hover:border-muted"
                >
                  Check
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

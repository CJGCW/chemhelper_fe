import { useState, useCallback } from 'react'
import { generateRandomKspProblem, generateDynamicRandomKspProblem, type KspProblem } from '../../utils/kspPractice'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import type { VerifyState } from '../../utils/calcHelpers'

interface Props {
  allowCustom?: boolean
}

function nextKsp(allowCustom: boolean): KspProblem {
  return (!allowCustom || Math.random() < 0.6) ? generateDynamicRandomKspProblem() : generateRandomKspProblem()
}

export default function KspPractice({ allowCustom = true }: Props) {
  const [problem, setProblem]   = useState<KspProblem>(() => nextKsp(allowCustom))
  const [userAns, setUserAns]   = useState('')
  const [verified, setVerified] = useState<VerifyState>(null)
  const [score, setScore]       = useState({ correct: 0, total: 0 })

  const newProblem = useCallback(() => {
    setProblem(nextKsp(allowCustom))
    setUserAns('')
    setVerified(null)
  }, [allowCustom])

  function verify() {
    const val = parseFloat(userAns)
    if (!isFinite(val)) return

    // For very small numbers, compare relative error
    const expected = problem.answer
    const relErr = Math.abs(val - expected) / Math.abs(expected)
    const tol = problem.tolerance

    let v: VerifyState
    if (relErr <= tol) {
      v = 'correct'
    } else if (relErr <= tol * 5) {
      v = 'sig_fig_warning'
    } else {
      v = 'incorrect'
    }
    setVerified(v)
    setScore(s => ({
      correct: s.correct + (v === 'correct' ? 1 : 0),
      total: s.total + 1,
    }))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-secondary">
          Score: {score.correct}/{score.total}
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </p>
        <button
          onClick={newProblem}
          className="font-sans text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          New Problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <div className="flex items-center gap-2 mb-1.5">
          {problem.isDynamic && (
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
              style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
              generated
            </span>
          )}
        </div>
        <p className="font-sans text-sm text-primary leading-relaxed">{problem.prompt}</p>
      </div>

      <NumberField
        label={`Your answer: ${problem.answerLabel}`}
        value={userAns}
        onChange={v => { setUserAns(v); setVerified(null) }}
        placeholder="e.g. 1.34e-5"
        hint="Use scientific notation: 1.34e-5 or 0.0000134"
      />

      <div className="flex items-stretch gap-2">
        <button
          onClick={verify}
          disabled={!userAns}
          className="flex-1 py-2 px-4 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Check Answer
        </button>
      </div>

      {verified && (
        <ResultDisplay
          label={problem.answerLabel}
          value={problem.answer.toExponential(3)}
          unit=""
          verified={verified}
        />
      )}

      {allowCustom && <div />}
    </div>
  )
}

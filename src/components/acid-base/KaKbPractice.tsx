import { useState, useCallback } from 'react'
import NumberField from '../shared/NumberField'
import { useShowAnswers } from '../../stores/preferencesStore'
import { generateKaKbProblem } from '../../utils/acidBasePractice'

interface Props {
  allowCustom?: boolean
}

type VerifyState = 'correct' | 'incorrect' | null

export default function KaKbPractice({ allowCustom: _allowCustom = true }: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem] = useState(() => generateKaKbProblem())
  const [answer, setAnswer] = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [revealed, setRevealed] = useState(false)

  const next = useCallback(() => {
    setProblem(generateKaKbProblem())
    setAnswer('')
    setVerifyState(null)
    setRevealed(false)
  }, [])

  function handleVerify() {
    const studentVal = parseFloat(answer)
    if (!isFinite(studentVal)) return

    // For K values: compare with 5% relative tolerance
    // For pK values: compare with 0.05 absolute tolerance
    let isCorrect: boolean
    if (problem.isPkValue) {
      isCorrect = Math.abs(studentVal - problem.correctValue) <= 0.05
    } else {
      const relErr = Math.abs(studentVal - problem.correctValue) / problem.correctValue
      isCorrect = relErr <= 0.05
    }

    setVerifyState(isCorrect ? 'correct' : 'incorrect')
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))
  }

  const verifyColor = verifyState === 'correct' ? '#22c55e' : verifyState === 'incorrect' ? '#ef4444' : undefined

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-secondary">Score: {score.correct} / {score.total}</p>
        <button
          onClick={next}
          className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          New Problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
        <p className="font-sans text-sm text-primary leading-relaxed">{problem.question}</p>
      </div>

      <NumberField
        label={`Your Answer (${problem.answerLabel})`}
        value={answer}
        onChange={v => { setAnswer(v); setVerifyState(null) }}
        placeholder={problem.isPkValue ? 'e.g. 9.26' : 'e.g. 1.8e-5'}
      />

      <div className="flex items-stretch gap-2">
        <button
          onClick={handleVerify}
          disabled={!answer}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Check Answer
        </button>
        {showAnswers && !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors"
          >
            Reveal
          </button>
        )}
      </div>

      {verifyState && (
        <div className="p-3 rounded-sm border" style={{
          borderColor: verifyColor,
          background: `color-mix(in srgb, ${verifyColor} 10%, rgb(var(--color-raised)))`,
        }}>
          <p className="font-mono text-sm font-semibold" style={{ color: verifyColor }}>
            {verifyState === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          {(verifyState === 'incorrect' || revealed) && (
            <p className="font-mono text-xs text-secondary mt-1">
              Correct {problem.answerLabel} = {
                problem.isPkValue
                  ? problem.correctValue.toFixed(2)
                  : problem.correctValue.toExponential(2)
              }
            </p>
          )}
        </div>
      )}

      {revealed && !verifyState && (
        <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-xs text-secondary">
            {problem.answerLabel} = {
              problem.isPkValue
                ? problem.correctValue.toFixed(2)
                : problem.correctValue.toExponential(2)
            }
          </p>
        </div>
      )}
    </div>
  )
}

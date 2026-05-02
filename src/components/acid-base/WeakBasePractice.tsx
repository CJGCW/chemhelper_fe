import { useState, useCallback } from 'react'
import NumberField from '../shared/NumberField'
import PhScale from '../shared/PhScale'
import { useShowAnswers } from '../../stores/preferencesStore'
import { generateWeakBaseProblem, generateDynamicWeakBaseProblem } from '../../utils/acidBasePractice'

interface Props {
  allowCustom?: boolean
}

type VerifyState = 'correct' | 'incorrect' | null

function nextWeakBase(allowCustom: boolean) {
  return (!allowCustom || Math.random() < 0.6) ? generateDynamicWeakBaseProblem() : generateWeakBaseProblem()
}

export default function WeakBasePractice({ allowCustom: _allowCustom = true }: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem] = useState(() => nextWeakBase(_allowCustom))
  const [answer, setAnswer] = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [revealed, setRevealed] = useState(false)

  const next = useCallback(() => {
    setProblem(nextWeakBase(_allowCustom))
    setAnswer('')
    setVerifyState(null)
    setRevealed(false)
  }, [_allowCustom])

  function handleVerify() {
    const studentPh = parseFloat(answer)
    if (!isFinite(studentPh)) return

    const correctH = Math.pow(10, -problem.correctPh)
    const studentH = Math.pow(10, -studentPh)
    const relErr = Math.abs(correctH - studentH) / correctH
    const isCorrect = relErr <= 0.02

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
        <div className="flex items-center gap-2 mb-1.5">
          {problem.isDynamic && (
            <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
              style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
              generated
            </span>
          )}
        </div>
        <p className="font-sans text-sm text-primary leading-relaxed">{problem.question}</p>
      </div>

      <NumberField
        label="Your Answer (pH)"
        value={answer}
        onChange={v => { setAnswer(v); setVerifyState(null) }}
        placeholder="Enter pH"
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
              Correct pH = {problem.correctPh.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {revealed && !verifyState && (
        <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-xs text-secondary">Answer: pH = {problem.correctPh.toFixed(2)}</p>
        </div>
      )}

      {(revealed || verifyState) && <PhScale pH={problem.correctPh} label="Answer" />}

      {(revealed || verifyState === 'incorrect') && problem.steps.length > 0 && (
        <div className="flex flex-col gap-1 p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-xs font-semibold text-secondary mb-1">Solution Steps</p>
          {problem.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary leading-relaxed">{s}</p>
          ))}
        </div>
      )}
    </div>
  )
}

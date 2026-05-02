import { useState, useCallback } from 'react'
import NumberField from '../shared/NumberField'
import { useShowAnswers } from '../../stores/preferencesStore'
import { generateSaltPhProblem } from '../../utils/acidBasePractice'

interface Props {
  allowCustom?: boolean
}

type VerifyState = 'correct' | 'incorrect' | null

export default function SaltPhPractice({ allowCustom: _allowCustom = true }: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem] = useState(() => generateSaltPhProblem())
  const [classAnswer, setClassAnswer] = useState<'' | 'acidic' | 'basic' | 'neutral'>('')
  const [phAnswer, setPhAnswer] = useState('')
  const [verifyState, setVerifyState] = useState<VerifyState>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [revealed, setRevealed] = useState(false)

  const next = useCallback(() => {
    setProblem(generateSaltPhProblem())
    setClassAnswer('')
    setPhAnswer('')
    setVerifyState(null)
    setRevealed(false)
  }, [])

  function handleVerify() {
    const classOk = classAnswer === problem.classification
    const studentPh = parseFloat(phAnswer)
    let phOk = false
    if (isFinite(studentPh)) {
      const correctH = Math.pow(10, -problem.correctPh)
      const studentH = Math.pow(10, -studentPh)
      phOk = Math.abs(correctH - studentH) / correctH <= 0.02
    }
    const isCorrect = classOk && phOk
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

      {/* Part 1: classification */}
      <div className="flex flex-col gap-1">
        <label className="font-mono text-xs text-secondary">Classification</label>
        <div className="flex gap-2">
          {(['acidic', 'neutral', 'basic'] as const).map(c => (
            <button
              key={c}
              onClick={() => { setClassAnswer(c); setVerifyState(null) }}
              className="px-4 py-2 rounded-sm font-mono text-sm capitalize transition-colors border"
              style={{
                borderColor: classAnswer === c ? 'var(--c-halogen)' : 'rgb(var(--color-border))',
                color: classAnswer === c ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))',
                background: classAnswer === c ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'transparent',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Part 2: pH */}
      <NumberField
        label="Your Answer (pH)"
        value={phAnswer}
        onChange={v => { setPhAnswer(v); setVerifyState(null) }}
        placeholder="Enter pH"
      />

      <div className="flex items-stretch gap-2">
        <button
          onClick={handleVerify}
          disabled={!classAnswer || !phAnswer}
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
            <div className="font-mono text-xs text-secondary mt-1 flex flex-col gap-0.5">
              <p>Classification: {problem.classification}</p>
              <p>pH = {problem.correctPh.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {revealed && !verifyState && (
        <div className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-xs text-secondary">Classification: {problem.classification}</p>
          <p className="font-mono text-xs text-secondary">pH = {problem.correctPh.toFixed(2)}</p>
        </div>
      )}
    </div>
  )
}

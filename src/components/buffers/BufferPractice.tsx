import { useState, useCallback } from 'react'
import { generateBufferPhProblem } from '../../utils/bufferPractice'
import { bufferPh } from '../../chem/buffers'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import type { VerifyState } from '../../utils/calcHelpers'

interface Props {
  allowCustom?: boolean
}

export default function BufferPractice({ allowCustom = true }: Props) {
  const [problem, setProblem]     = useState(() => generateBufferPhProblem())
  const [userAnswer, setAnswer]   = useState('')
  const [verified, setVerified]   = useState<VerifyState>(null)
  const [score, setScore]         = useState({ correct: 0, total: 0 })

  const newProblem = useCallback(() => {
    setProblem(generateBufferPhProblem())
    setAnswer('')
    setVerified(null)
  }, [])

  function verify() {
    const val = parseFloat(userAnswer)
    if (!isFinite(val)) return
    const diff = Math.abs(val - problem.answer)
    const tol = problem.tolerance
    let v: VerifyState
    if (diff <= tol) {
      v = 'correct'
    } else if (diff <= tol * 3) {
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

  // Compute the solution for display
  const { pKa, concAcid, concBase } = problem.given
  const solution = bufferPh(pKa, concAcid, concBase)

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Score */}
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

      {/* Problem */}
      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-primary leading-relaxed">{problem.prompt}</p>
      </div>

      {/* Answer input */}
      <NumberField
        label="Your answer: pH"
        value={userAnswer}
        onChange={v => { setAnswer(v); setVerified(null) }}
        placeholder="e.g. 4.74"
      />

      {/* Verify */}
      <div className="flex items-stretch gap-2">
        <button
          onClick={verify}
          disabled={!userAnswer}
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
          label="Expected pH"
          value={problem.answer.toFixed(2)}
          unit=""
          verified={verified}
        />
      )}

      {verified === 'incorrect' && (
        <div className="p-3 rounded-sm border border-border bg-raised">
          <p className="font-mono text-xs text-secondary mb-2">SOLUTION STEPS</p>
          <div className="flex flex-col gap-1">
            {solution.steps.map((step, i) => (
              <p key={i} className="font-mono text-xs text-primary">{step}</p>
            ))}
          </div>
        </div>
      )}

      {allowCustom && <div />}
    </div>
  )
}

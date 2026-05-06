import { useState } from 'react'
import { generateRankingProblem, checkRankingAnswer, getCanonicalOrder, type RankingProblem } from '../../utils/acidityRankingPractice'
import CompoundDisplay from '../shared/CompoundDisplay'

interface Props {
  allowCustom?: boolean
}

export default function AcidityRankingPractice({ allowCustom = true }: Props) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | undefined>(undefined)
  const [problem, setProblem] = useState<RankingProblem>(() => generateRankingProblem())
  const [order, setOrder] = useState<string[]>(() => shuffled(problem.compounds.map(c => c.id)))
  const [submitted, setSubmitted] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [correct, setCorrect] = useState(false)

  function nextProblem() {
    const next = generateRankingProblem(difficulty)
    setProblem(next)
    setOrder(shuffled(next.compounds.map(c => c.id)))
    setSubmitted(false)
    setCorrect(false)
  }

  function changeDifficulty(d: typeof difficulty) {
    if (!allowCustom) return
    setDifficulty(d)
    const next = generateRankingProblem(d)
    setProblem(next)
    setOrder(shuffled(next.compounds.map(c => c.id)))
    setSubmitted(false)
    setCorrect(false)
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setOrder(o => {
      const a = [...o]
      ;[a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]
      return a
    })
  }

  function moveDown(idx: number) {
    if (idx === order.length - 1) return
    setOrder(o => {
      const a = [...o]
      ;[a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]
      return a
    })
  }

  function handleDrop(targetIdx: number) {
    if (!dragId) return
    const fromIdx = order.indexOf(dragId)
    if (fromIdx === -1 || fromIdx === targetIdx) return
    setOrder(o => {
      const a = [...o]
      a.splice(fromIdx, 1)
      a.splice(targetIdx, 0, dragId)
      return a
    })
    setDragId(null)
  }

  function handleSubmit() {
    setCorrect(checkRankingAnswer(problem, order))
    setSubmitted(true)
  }

  function showAnswer() {
    setOrder(getCanonicalOrder(problem))
    setCorrect(true)
    setSubmitted(true)
  }

  const DIFFICULTIES: { value: typeof difficulty; label: string }[] = [
    { value: undefined, label: 'All' },
    { value: 'easy',   label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard',   label: 'Hard' },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {allowCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-dim uppercase tracking-wider">Difficulty:</span>
          {DIFFICULTIES.map(d => (
            <button
              key={String(d.value)}
              onClick={() => changeDifficulty(d.value)}
              className="px-3 py-1 rounded-sm text-xs font-sans font-medium transition-colors"
              style={
                difficulty === d.value
                  ? {
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                      color: 'var(--c-halogen)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                    }
                  : {
                      background: 'transparent',
                      color: 'rgb(var(--color-secondary))',
                      border: '1px solid rgb(var(--color-border))',
                    }
              }
            >
              {d.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] text-dim uppercase px-2 py-0.5 rounded-sm border border-border">
            {problem.difficulty}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm text-primary font-medium">{problem.prompt}</p>
        <p className="font-sans text-xs text-secondary">
          {submitted ? 'Correct positions are highlighted.' : 'Drag rows or use ↑↓ to reorder. Most acidic = top.'}
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {order.map((id, idx) => {
          const compound = problem.compounds.find(c => c.id === id)!
          const isCorrectPos = submitted && compound.correctRank === idx
          const isWrongPos   = submitted && compound.correctRank !== idx

          return (
            <li
              key={id}
              draggable={!submitted}
              onDragStart={() => setDragId(id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => setDragId(null)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm border transition-colors"
              style={{
                borderColor: isCorrectPos
                  ? 'var(--c-noble)'
                  : isWrongPos
                    ? 'var(--c-halogen)'
                    : dragId === id
                      ? 'color-mix(in srgb, var(--c-halogen) 60%, transparent)'
                      : 'rgb(var(--color-border))',
                background: isCorrectPos
                  ? 'color-mix(in srgb, var(--c-noble) 8%, rgb(var(--color-surface)))'
                  : isWrongPos
                    ? 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))'
                    : 'rgb(var(--color-surface))',
                cursor: submitted ? 'default' : 'grab',
                opacity: dragId && dragId !== id ? 0.7 : 1,
              }}
            >
              <span className="font-mono text-sm text-dim shrink-0 w-5 text-center">{idx + 1}.</span>

              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="shrink-0">
                  <CompoundDisplay smiles={compound.smiles} label="" width={100} height={75} />
                </div>
                <p className="font-mono text-sm text-primary">{compound.label}</p>
              </div>

              {submitted && (
                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <span className="font-mono text-xs font-medium" style={{ color: 'var(--c-halogen)' }}>
                    pKa = {compound.pka}
                  </span>
                  {isCorrectPos && <span className="font-mono text-[10px]" style={{ color: 'var(--c-noble)' }}>✓</span>}
                  {isWrongPos && (
                    <span className="font-mono text-[10px] text-dim">
                      should be #{compound.correctRank + 1}
                    </span>
                  )}
                </div>
              )}

              {!submitted && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="px-1.5 py-0.5 text-xs rounded-sm border border-border text-secondary hover:text-primary hover:border-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono"
                  >↑</button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === order.length - 1}
                    className="px-1.5 py-0.5 text-xs rounded-sm border border-border text-secondary hover:text-primary hover:border-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono"
                  >↓</button>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <div className="flex gap-2 flex-wrap">
        {!submitted && (
          <>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                color: 'var(--c-halogen)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              }}
            >
              Check Order
            </button>
            <button
              onClick={showAnswer}
              className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors border border-border text-secondary hover:text-primary hover:border-muted"
            >
              Show Answer
            </button>
          </>
        )}
        {submitted && (
          <button
            onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              color: 'var(--c-halogen)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            }}
          >
            Next Problem
          </button>
        )}
      </div>

      {submitted && (
        <div className="flex flex-col gap-3 p-4 rounded-sm border border-border bg-surface">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-xs font-medium"
              style={{ color: correct ? 'var(--c-noble)' : 'var(--c-halogen)' }}
            >
              {correct ? '✓ Correct!' : '✗ Not quite'}
            </span>
            <span className="font-sans text-xs text-secondary">
              {correct ? 'All compounds in the right order.' : 'Review the reasoning below.'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {problem.factors.map(f => (
              <span
                key={f}
                className="font-mono text-[10px] px-2 py-0.5 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  color: 'var(--c-halogen)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          <p className="font-sans text-sm text-secondary leading-relaxed">{problem.explanation}</p>
        </div>
      )}
    </div>
  )
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

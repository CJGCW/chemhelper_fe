import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SYNTHESIS_PROBLEMS, type SynthesisProblem } from '../../data/organic/synthesisProblems'
import { checkReagent } from '../../utils/synthesisCheck'
import CompoundDisplay from '../shared/CompoundDisplay'

type Difficulty = 'all' | 'easy' | 'medium' | 'hard'

function pickRandom(pool: SynthesisProblem[]): SynthesisProblem {
  return pool[Math.floor(Math.random() * pool.length)]
}

interface Props { allowCustom?: boolean }

export default function SynthesisFillInPractice({ allowCustom: _allowCustom = true }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [problem, setProblem] = useState<SynthesisProblem>(() => pickRandom(SYNTHESIS_PROBLEMS))
  const [inputs, setInputs] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const pool = difficulty === 'all'
    ? SYNTHESIS_PROBLEMS
    : SYNTHESIS_PROBLEMS.filter(p => p.difficulty === difficulty)

  const results = submitted
    ? problem.steps.map((step, i) => checkReagent(inputs[i] ?? '', step.acceptedAnswers))
    : []
  const allCorrect = submitted && results.every(Boolean)

  function handleSubmit() {
    if (submitted) return
    const correct = problem.steps.filter((s, i) => checkReagent(inputs[i] ?? '', s.acceptedAnswers)).length
    setScore(sc => ({ correct: sc.correct + correct, total: sc.total + problem.steps.length }))
    setSubmitted(true)
  }

  function handleNext() {
    const nextProblem = pickRandom(pool)
    setProblem(nextProblem)
    setInputs([])
    setSubmitted(false)
    setShowHint(false)
  }

  function setInput(i: number, val: string) {
    setInputs(prev => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'rgb(var(--color-success))' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total} steps</span>
        </div>
      )}

      {/* Difficulty filter */}
      <div className="flex items-center gap-2 print:hidden">
        {(['all', 'easy', 'medium', 'hard'] as Difficulty[]).map(d => {
          const active = difficulty === d
          return (
            <button key={d} onClick={() => setDifficulty(d)}
              className="px-3 py-1 rounded-full text-xs font-sans capitalize border transition-colors"
              style={active ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : { background: 'transparent', borderColor: 'rgba(var(--overlay),0.15)', color: 'rgb(var(--overlay)/0.5)' }}>
              {d}
            </button>
          )
        })}
      </div>

      {/* Problem display */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest">
            {problem.difficulty} · {problem.exam ?? 'org'}
          </span>
        </div>

        {/* Synthesis pathway */}
        <div className="flex flex-col gap-2">
          {/* Starting material */}
          <div className="rounded-sm border border-border px-4 py-3 self-start"
            style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="font-mono text-xs text-dim block mb-0.5">Starting material</span>
            {problem.startingMaterial.smiles ? (
              <div className="flex flex-col items-start gap-1 mt-1">
                <CompoundDisplay smiles={problem.startingMaterial.smiles} label={problem.startingMaterial.label} width={160} height={120} />
                <span className="font-sans text-xs text-secondary">{problem.startingMaterial.label}</span>
              </div>
            ) : (
              <span className="font-sans text-sm font-medium text-primary">{problem.startingMaterial.label}</span>
            )}
          </div>

          {/* Steps */}
          {problem.steps.map((step, i) => {
            const isCorrect = submitted && results[i]
            const isWrong = submitted && !results[i]
            const inputVal = inputs[i] ?? ''

            return (
              <div key={i} className="flex flex-col gap-2 pl-4 border-l-2"
                style={{ borderColor: isCorrect ? 'rgb(var(--color-success))' : isWrong ? 'rgb(var(--color-error))' : 'rgba(var(--overlay),0.15)' }}>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-dim">Step {i + 1}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={e => setInput(i, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !submitted) handleSubmit() }}
                      disabled={submitted}
                      placeholder="Enter reagents…"
                      className="flex-1 px-3 py-1.5 rounded-sm border font-mono text-xs text-primary outline-none transition-colors"
                      style={{
                        background: 'rgb(var(--color-surface))',
                        borderColor: isCorrect ? 'rgb(var(--color-success))' : isWrong ? 'rgb(var(--color-error))' : 'rgba(var(--overlay),0.2)',
                      }}
                    />
                    {isCorrect && <span className="text-success font-mono text-xs">✓</span>}
                    {isWrong   && <span className="text-error font-mono text-xs">✗</span>}
                  </div>
                </div>

                {isWrong && (
                  <div className="ml-2 rounded-sm border feedback-error px-3 py-2" style={{ background: 'rgb(var(--color-error-bg) / 0.15)' }}>
                    <span className="font-sans text-xs text-secondary">
                      <span className="text-dim">Correct: </span>
                      <span className="font-mono text-primary">{step.reagents}</span>
                    </span>
                  </div>
                )}

                {/* Intermediate label */}
                <div className="rounded-sm border border-border px-3 py-2 self-start ml-2"
                  style={{ background: 'rgb(var(--color-raised))' }}>
                  <span className="font-mono text-[10px] text-dim">→ </span>
                  <span className="font-sans text-xs text-secondary">{step.productLabel}</span>
                </div>
              </div>
            )
          })}

          {/* Target */}
          <div className="rounded-sm border px-4 py-3 self-start"
            style={{
              background: allCorrect ? 'rgb(34 197 94 / 0.06)' : 'rgb(var(--color-raised))',
              borderColor: allCorrect ? 'rgb(var(--color-success))' : 'rgba(var(--overlay),0.15)',
            }}>
            <span className="font-mono text-xs text-dim block mb-0.5">Target</span>
            {problem.target.smiles ? (
              <div className="flex flex-col items-start gap-1 mt-1">
                <CompoundDisplay smiles={problem.target.smiles} label={problem.target.label} width={160} height={120} />
                <span className="font-sans text-xs text-secondary">{problem.target.label}</span>
              </div>
            ) : (
              <span className="font-sans text-sm font-medium text-primary">{problem.target.label}</span>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && problem.hint && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-raised)))' }}>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Hint</span>
            <p className="font-sans text-sm text-primary">{problem.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {!submitted ? (
          <>
            <button onClick={handleSubmit}
              className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check answers
            </button>
            {problem.hint && !showHint && (
              <button onClick={() => setShowHint(true)}
                className="px-4 py-1.5 rounded-sm text-sm font-sans border transition-colors"
                style={{ background: 'transparent', borderColor: 'rgba(var(--overlay),0.15)', color: 'rgb(var(--overlay)/0.5)' }}>
                Hint
              </button>
            )}
          </>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Next problem →
          </button>
        )}
      </div>
    </div>
  )
}

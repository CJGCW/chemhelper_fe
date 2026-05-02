import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShowAnswers } from '../../stores/preferencesStore'

interface Props { allowCustom?: boolean }

interface MechanismProblem {
  id: string
  overall: string
  steps: { label: string; equation: string; speed: 'fast (reversible)' | 'slow' | 'fast' }[]
  intermediate: string
  slowStep: number  // 1-indexed
  rateLaw: string
  explanation: string
}

const MECHANISM_PROBLEMS: MechanismProblem[] = [
  {
    id: 'no-o2',
    overall: '2NO + O₂ → 2NO₂',
    steps: [
      { label: 'Step 1', equation: '2NO ⇌ N₂O₂', speed: 'fast (reversible)' },
      { label: 'Step 2', equation: 'N₂O₂ + O₂ → 2NO₂', speed: 'slow' },
    ],
    intermediate: 'N₂O₂',
    slowStep: 2,
    rateLaw: 'rate = k[NO]²[O₂]',
    explanation: 'Step 2 is slow (rate-determining). Its rate = k₂[N₂O₂][O₂]. From the fast equilibrium: [N₂O₂] = K₁[NO]², so rate = k[NO]²[O₂].',
  },
  {
    id: 'no-cl2',
    overall: '2NO + Cl₂ → 2NOCl',
    steps: [
      { label: 'Step 1', equation: 'NO + Cl₂ ⇌ NOCl₂', speed: 'fast (reversible)' },
      { label: 'Step 2', equation: 'NOCl₂ + NO → 2NOCl', speed: 'slow' },
    ],
    intermediate: 'NOCl₂',
    slowStep: 2,
    rateLaw: 'rate = k[NO]²[Cl₂]',
    explanation: 'Step 2 is rate-determining: rate = k₂[NOCl₂][NO]. Fast equilibrium gives [NOCl₂] = K₁[NO][Cl₂], so rate = k[NO]²[Cl₂].',
  },
  {
    id: 'h2-br2',
    overall: 'H₂ + 2ICl → I₂ + 2HCl',
    steps: [
      { label: 'Step 1', equation: 'H₂ + ICl → HI + HCl', speed: 'slow' },
      { label: 'Step 2', equation: 'HI + ICl → I₂ + HCl', speed: 'fast' },
    ],
    intermediate: 'HI',
    slowStep: 1,
    rateLaw: 'rate = k[H₂][ICl]',
    explanation: 'Step 1 is rate-determining. Rate law comes directly from Step 1: rate = k[H₂][ICl]. HI is an intermediate.',
  },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

type Question = 'slowStep' | 'intermediate' | 'rateLaw'

export default function MechanismPractice({ allowCustom = true }: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem]   = useState<MechanismProblem>(() => pick(MECHANISM_PROBLEMS))
  const [question, setQuestion] = useState<Question>('slowStep')
  const [selected, setSelected] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [checkState, setCheckState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [score, setScore]       = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    setProblem(pick(MECHANISM_PROBLEMS))
    setQuestion(pick<Question>(['slowStep', 'intermediate', 'rateLaw']))
    setSelected(null); setTextAnswer(''); setCheckState('idle')
  }

  function handleCheck() {
    if (checkState !== 'idle') return
    let correct = false
    if (question === 'slowStep') {
      correct = selected === String(problem.slowStep)
    } else if (question === 'intermediate') {
      correct = textAnswer.trim().replace(/\s/g, '') === problem.intermediate.replace(/\s/g, '')
    } else {
      // rate law — loose check
      const normalized = textAnswer.trim().toLowerCase().replace(/\s/g, '')
      const expected = problem.rateLaw.toLowerCase().replace(/\s/g, '')
      correct = normalized === expected || normalized.includes(expected.replace('rate=', ''))
    }
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Analyze a proposed reaction mechanism. Identify the rate-determining step, intermediates, and overall rate law.
      </p>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.id + question}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          {/* Overall */}
          <div>
            <p className="font-sans text-xs text-secondary uppercase tracking-widest mb-1">Overall Reaction</p>
            <p className="font-mono text-sm text-primary">{problem.overall}</p>
          </div>

          {/* Steps */}
          <div>
            <p className="font-sans text-xs text-secondary uppercase tracking-widest mb-2">Mechanism Steps</p>
            <div className="flex flex-col gap-2">
              {problem.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 font-mono text-sm">
                  <span className="text-secondary w-12 shrink-0">{step.label}:</span>
                  <span className="text-primary">{step.equation}</span>
                  <span className="text-dim text-xs">({step.speed})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            {question === 'slowStep' && (
              <>
                <p className="font-sans text-base text-bright">Which step is rate-determining (slow)?</p>
                <div className="flex gap-2">
                  {problem.steps.map((_, i) => (
                    <button key={i}
                      onClick={() => { if (checkState === 'idle') setSelected(String(i + 1)) }}
                      disabled={checkState !== 'idle'}
                      className="px-4 py-2 rounded-sm font-sans text-sm transition-colors"
                      style={selected === String(i + 1) ? {
                        background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                        color: 'var(--c-halogen)',
                      } : { border: '1px solid rgba(var(--overlay),0.15)', color: 'rgba(var(--overlay),0.5)' }}>
                      Step {i + 1}
                    </button>
                  ))}
                </div>
              </>
            )}

            {question === 'intermediate' && (
              <>
                <p className="font-sans text-base text-bright">What is the reaction intermediate?</p>
                <input
                  type="text"
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  disabled={checkState !== 'idle'}
                  placeholder="Chemical formula"
                  className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-base w-48
                              placeholder-dim focus:outline-none focus:border-muted transition-colors
                              disabled:cursor-not-allowed
                              ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                              : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                              : 'border-border text-bright'}`}
                />
              </>
            )}

            {question === 'rateLaw' && (
              <>
                <p className="font-sans text-base text-bright">Write the overall rate law (e.g. rate = k[A][B]²):</p>
                <input
                  type="text"
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheck()}
                  disabled={checkState !== 'idle'}
                  placeholder="rate = k[...][...]"
                  className={`bg-raised border rounded-sm px-3 py-1.5 font-mono text-sm w-64
                              placeholder-dim focus:outline-none focus:border-muted transition-colors
                              disabled:cursor-not-allowed
                              ${checkState === 'correct' ? 'border-emerald-700/60 text-emerald-300'
                              : checkState === 'wrong'   ? 'border-rose-700/60 text-rose-300'
                              : 'border-border text-bright'}`}
                />
              </>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {checkState === 'idle' ? (
                <button onClick={handleCheck}
                  disabled={question === 'slowStep' ? !selected : !textAnswer.trim()}
                  className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                    color: 'var(--c-halogen)',
                  }}>
                  Check
                </button>
              ) : (
                <span className={`font-sans text-sm font-medium ${
                  checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {checkState === 'correct'
                    ? '✓ Correct'
                    : showAnswers
                    ? `✗ Incorrect — ${question === 'slowStep' ? `Step ${problem.slowStep}` : question === 'intermediate' ? problem.intermediate : problem.rateLaw}`
                    : '✗ Incorrect — try again'}
                </span>
              )}
            </div>

            {checkState !== 'idle' && (
              <div className="text-xs font-sans text-secondary p-3 rounded-sm"
                style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
                {problem.explanation}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          {checkState === 'wrong' && (
            <button onClick={() => { setSelected(null); setTextAnswer(''); setCheckState('idle') }}
              className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-dim hover:text-secondary transition-colors">
              Try Again
            </button>
          )}
          <button onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}

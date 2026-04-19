import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  genSciNotationProblems,
  checkSciAnswer,
  type SciNotationProblem,
} from '../../utils/sciNotationPractice'

type Result = 'correct' | 'wrong' | 'format_error' | null

interface ProblemState {
  problem: SciNotationProblem
  input: string
  result: Result
  showHint: boolean
  showAnswer: boolean
}

function makeStates(problems: SciNotationProblem[]): ProblemState[] {
  return problems.map(p => ({ problem: p, input: '', result: null, showHint: false, showAnswer: false }))
}

const TYPE_LABELS: Record<string, string> = {
  to_sci:   '→ sci notation',
  from_sci: '→ standard form',
  multiply: 'multiply',
  divide:   'divide',
}

const resultColor = (r: Result) =>
  r === 'correct' ? '#22c55e' : r === 'wrong' || r === 'format_error' ? '#ef4444' : 'rgba(255,255,255,0.12)'

const resultBg = (r: Result) =>
  r === 'correct' ? 'color-mix(in srgb, #22c55e 10%, transparent)' :
  r === 'wrong' || r === 'format_error' ? 'color-mix(in srgb, #ef4444 10%, transparent)' : 'transparent'

function answerHint(p: SciNotationProblem): string {
  if (p.type === 'to_sci' || p.type === 'multiply' || p.type === 'divide') {
    return 'e.g. 4.56e-3 or 4.56 × 10⁻³'
  }
  return 'e.g. 0.00456'
}

export default function ScientificNotationPractice() {
  const [states, setStates] = useState<ProblemState[]>(() => makeStates(genSciNotationProblems(8)))
  const [submitted, setSubmitted] = useState(false)

  function update(i: number, patch: Partial<ProblemState>) {
    setStates(prev => prev.map((s, j) => j === i ? { ...s, ...patch } : s))
  }

  function check(i: number) {
    const s = states[i]
    const result = checkSciAnswer(s.input, s.problem)
    update(i, { result })
  }

  function checkAll() {
    setStates(prev => prev.map(s => ({
      ...s,
      result: s.result ?? checkSciAnswer(s.input, s.problem),
    })))
    setSubmitted(true)
  }

  function reset() {
    setStates(makeStates(genSciNotationProblems(8)))
    setSubmitted(false)
  }

  const score = states.filter(s => s.result === 'correct').length

  return (
    <div className="flex flex-col gap-6">

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={checkAll}
          className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Check All
        </button>
        <button
          onClick={reset}
          className="px-4 py-1.5 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          New Problems
        </button>
        <AnimatePresence>
          {submitted && (
            <motion.span
              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="font-mono text-sm"
              style={{ color: score === states.length ? '#22c55e' : 'var(--c-halogen)' }}
            >
              {score} / {states.length} correct
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Problem grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {states.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-4 rounded-sm border transition-colors"
            style={{
              background: s.result ? resultBg(s.result) : '#0e1016',
              borderColor: s.result ? resultColor(s.result) : 'rgba(255,255,255,0.1)',
            }}
          >
            {/* Problem header */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                {i + 1}. {TYPE_LABELS[s.problem.type]}
              </span>
              {s.result === 'correct' && <span className="font-mono text-xs text-green-400">✓ correct</span>}
              {(s.result === 'wrong' || s.result === 'format_error') && (
                <span className="font-mono text-xs text-red-400">
                  {s.result === 'format_error' ? 'check format' : '✗ incorrect'}
                </span>
              )}
            </div>

            {/* Prompt + input display */}
            <p className="font-sans text-xs text-secondary">{s.problem.prompt}</p>
            <p className="font-mono text-base text-primary">{s.problem.inputDisplay}</p>

            {/* Answer input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={s.input}
                onChange={e => update(i, { input: e.target.value, result: null })}
                onKeyDown={e => e.key === 'Enter' && check(i)}
                placeholder={answerHint(s.problem)}
                className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-1.5
                           text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
              />
              <button
                onClick={() => check(i)}
                className="px-3 py-1.5 rounded-sm font-mono text-xs border border-border text-secondary
                           hover:text-primary hover:border-muted transition-colors shrink-0"
              >
                Check
              </button>
            </div>

            {/* Hint / answer toggles */}
            <div className="flex gap-3">
              <button
                onClick={() => update(i, { showHint: !s.showHint })}
                className="font-mono text-xs text-secondary hover:text-primary transition-colors"
              >
                {s.showHint ? 'Hide hint' : 'Hint'}
              </button>
              {s.result && s.result !== 'correct' && (
                <button
                  onClick={() => update(i, { showAnswer: !s.showAnswer })}
                  className="font-mono text-xs text-secondary hover:text-primary transition-colors"
                >
                  {s.showAnswer ? 'Hide answer' : 'Show answer'}
                </button>
              )}
            </div>

            <AnimatePresence>
              {s.showHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="font-sans text-xs text-secondary leading-relaxed border-t border-border pt-2"
                >
                  {s.problem.hint}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {s.showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-baseline gap-2 border-t border-border pt-2"
                >
                  <span className="font-mono text-xs text-secondary">Answer:</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
                    {s.problem.correctAnswer}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-secondary">
        Enter answers as e.g. <span className="text-primary">4.56e-3</span> or <span className="text-primary">4.56 × 10⁻³</span> for scientific notation, or a plain decimal for standard form.
      </p>
    </div>
  )
}

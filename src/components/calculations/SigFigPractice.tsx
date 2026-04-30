import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  makeCountProblem, makeArithProblem, checkSigFigAnswer,
  type SigFigProblem, type SigFigCheckResult,
} from '../../utils/sigfigPractice'
import WorkedExample from '../shared/WorkedExample'

const SIGFIG_EXAMPLES = [
  {
    scenario: 'How many significant figures does 0.00420 have?',
    steps: ['Leading zeros are not significant', 'The 4, 2, and trailing 0 are all significant'],
    result: '3 significant figures',
  },
  {
    scenario: 'Calculate 2.54 × 3.2 with correct significant figures.',
    steps: ['Unrounded result: 2.54 × 3.2 = 8.128', '2.54 has 3 sf; 3.2 has 2 sf → limit to 2 sf'],
    result: '8.1',
  },
  {
    scenario: 'Calculate 12.30 + 0.456 with correct significant figures.',
    steps: ['Unrounded sum: 12.30 + 0.456 = 12.756', 'Least decimal places: 12.30 has 2 dp → round to 2 dp'],
    result: '12.76',
  },
  {
    scenario: 'How many significant figures does 3600 have (no decimal point)?',
    steps: ['Trailing zeros without decimal are ambiguous', 'Assumed: 2 sig figs (3 and 6)'],
    result: '2 significant figures (ambiguous without decimal)',
  },
]

function generateSigFigExample() {
  return SIGFIG_EXAMPLES[Math.floor(Math.random() * SIGFIG_EXAMPLES.length)]
}

// ── Local problem type (adds id for component state) ─────────────────────────

interface Problem extends SigFigProblem { id: number }

// ── Problem list generator ────────────────────────────────────────────────────

function generateProblems(
  count: number,
  inclCount: boolean,
  inclMultDiv: boolean,
  inclAddSub: boolean,
): Problem[] {
  type Slot = 'count' | 'multdiv' | 'addsub'
  const enabled: Slot[] = []
  if (inclCount)   enabled.push('count')
  if (inclMultDiv) enabled.push('multdiv')
  if (inclAddSub)  enabled.push('addsub')
  if (enabled.length === 0) return []

  const slots: Slot[] = [...enabled.slice(0, count)]
  while (slots.length < count) slots.push(enabled[slots.length % enabled.length])

  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }

  return slots.map((slot, i): Problem => {
    if (slot === 'count')   return { ...makeCountProblem(),       id: i }
    if (slot === 'multdiv') return { ...makeArithProblem(false),  id: i }
    return                         { ...makeArithProblem(true),   id: i }
  })
}

// ── Result colour helpers ─────────────────────────────────────────────────────

function borderColor(r: SigFigCheckResult | undefined): string {
  if (r === 'correct')    return 'color-mix(in srgb, #22c55e 45%, transparent)'
  if (r === 'wrong_sf')   return 'color-mix(in srgb, #f97316 45%, transparent)'
  if (r === 'wrong_value' || r === 'empty') return 'color-mix(in srgb, #ef4444 45%, transparent)'
  return 'rgba(var(--overlay),0.12)'
}

// ── Component ─────────────────────────────────────────────────────────────────

// Result type for the explicit precision input (sig figs or decimal places)
type PrecResult = 'correct' | 'wrong' | null

interface Props { allowCustom?: boolean }

export default function SigFigPractice({ allowCustom: _allowCustom = true }: Props) {
  const [count, setCount] = useState(5)
  const [inclCount, setInclCount] = useState(true)
  const [inclMultDiv, setInclMultDiv] = useState(true)
  const [inclAddSub, setInclAddSub] = useState(true)

  const [problems, setProblems] = useState<Problem[]>([])
  const [answers, setAnswers]       = useState<Record<number, string>>({})
  const [precAnswers, setPrecAnswers] = useState<Record<number, string>>({})
  const [results, setResults]       = useState<Record<number, SigFigCheckResult> | null>(null)
  const [precResults, setPrecResults] = useState<Record<number, PrecResult> | null>(null)

  function generate() {
    setProblems(generateProblems(count, inclCount, inclMultDiv, inclAddSub))
    setAnswers({})
    setPrecAnswers({})
    setResults(null)
    setPrecResults(null)
  }

  function checkPrecAnswer(p: Problem, raw: string): PrecResult {
    if (p.kind !== 'arith') return null
    const n = parseInt(raw, 10)
    if (isNaN(n)) return null
    const expected = p.isAddSub ? p.limitingDP : p.limitingSF
    if (expected === undefined) return null
    return n === expected ? 'correct' : 'wrong'
  }

  function checkAll() {
    const r: Record<number, SigFigCheckResult> = {}
    const pr: Record<number, PrecResult> = {}
    problems.forEach(p => {
      r[p.id] = checkSigFigAnswer(answers[p.id] ?? '', p)
      pr[p.id] = checkPrecAnswer(p, precAnswers[p.id] ?? '')
    })
    setResults(r)
    setPrecResults(pr)
  }

  const noneSelected = !inclCount && !inclMultDiv && !inclAddSub
  const correct = results ? Object.values(results).filter(r => r === 'correct').length : 0
  const total = problems.length

  const pillStyle = (active: boolean) => ({
    background: active ? 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))' : 'transparent',
    border: active
      ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
      : '1px solid rgba(var(--overlay),0.1)',
    color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
  })

  return (
    <div className="flex flex-col gap-5">

      <WorkedExample generate={generateSigFigExample} />

      {/* Settings */}
      <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Settings</p>

        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-secondary shrink-0">Problems</span>
            <div className="flex gap-1">
              {[5, 10, 15, 20].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className="w-12 h-9 rounded-sm font-mono text-sm transition-colors"
                  style={pillStyle(count === n)}
                >{n}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-secondary shrink-0">Types</span>
            <div className="flex gap-1">
              {([
                ['Counting', inclCount, setInclCount],
                ['× ÷', inclMultDiv, setInclMultDiv],
                ['+ −', inclAddSub, setInclAddSub],
              ] as [string, boolean, (v: boolean) => void][]).map(([label, val, set]) => (
                <button key={label} onClick={() => set(!val)}
                  className="px-4 h-9 rounded-sm font-sans text-sm transition-colors"
                  style={pillStyle(val)}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={noneSelected}
          className="self-start px-6 py-2.5 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          {problems.length > 0 ? 'Regenerate' : 'Generate Problems'}
        </button>
      </div>

      {/* Problems */}
      <AnimatePresence>
        {problems.length > 0 && (
          <motion.div
            key="problems"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Score banner */}
            {results && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-baseline gap-2 p-3 rounded-sm border"
                style={{
                  background: correct === total
                    ? 'color-mix(in srgb, #22c55e 10%, rgb(var(--color-surface)))'
                    : 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-surface)))',
                  border: correct === total
                    ? '1px solid color-mix(in srgb, #22c55e 30%, transparent)'
                    : '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
              >
                <span className="font-mono font-bold text-xl"
                  style={{ color: correct === total ? '#22c55e' : 'var(--c-halogen)' }}>
                  {correct} / {total}
                </span>
                <span className="font-sans text-sm text-secondary">correct</span>
                {correct === total && <span className="font-sans text-sm text-secondary ml-1">— perfect score!</span>}
              </motion.div>
            )}

            {/* Problem list */}
            {problems.map((p, idx) => {
              const result = results?.[p.id]
              return (
                <div key={p.id}
                  className="flex gap-3 p-4 rounded-sm border border-border"
                  style={{ background: 'rgb(var(--color-surface))' }}
                >
                  <span className="font-mono text-xs text-dim shrink-0 pt-0.5">{idx + 1}.</span>
                  <div className="flex flex-col gap-2.5 flex-1 min-w-0">

                    {p.kind === 'count' ? (
                      <p className="font-sans text-sm text-secondary">
                        How many significant figures does{' '}
                        <span className="font-mono text-bright text-base tracking-wide">{p.display}</span>
                        {' '}have?
                      </p>
                    ) : (
                      <p className="font-sans text-sm text-secondary">
                        Evaluate (apply sig fig rules):{' '}
                        <span className="font-mono text-bright text-base tracking-wide">{p.display}</span>
                      </p>
                    )}

                    <div className="flex items-start gap-3 flex-wrap">
                      {/* Answer value input */}
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-dim">
                          {p.kind === 'count' ? 'sig figs' : 'answer'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            inputMode={p.kind === 'count' ? 'numeric' : 'decimal'}
                            value={answers[p.id] ?? ''}
                            onChange={e => {
                              setAnswers(prev => ({ ...prev, [p.id]: e.target.value }))
                              if (results) setResults(prev => prev ? { ...prev, [p.id]: checkSigFigAnswer(e.target.value, p) } : null)
                            }}
                            placeholder={p.kind === 'count' ? '#' : 'e.g. 8.1'}
                            className="w-28 font-mono text-sm bg-raised border rounded-sm px-3 py-1.5 text-primary placeholder-dim focus:outline-none transition-colors"
                            style={{ border: `1px solid ${borderColor(result)}` }}
                          />
                          {result === 'correct' && (
                            <span className="font-mono text-xs" style={{ color: '#22c55e' }}>✓</span>
                          )}
                          {result === 'wrong_sf' && (
                            <span className="font-sans text-xs" style={{ color: '#f97316' }}>right value</span>
                          )}
                          {result === 'wrong_value' && (
                            <span className="font-mono text-xs" style={{ color: '#ef4444' }}>✗</span>
                          )}
                        </div>
                      </div>

                      {/* Precision input — only for arith problems */}
                      {p.kind === 'arith' && (() => {
                        const pr = precResults?.[p.id] ?? null
                        const label = p.isAddSub ? 'decimal places' : 'sig figs'
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] text-dim">{label} in answer</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={precAnswers[p.id] ?? ''}
                                onChange={e => {
                                  setPrecAnswers(prev => ({ ...prev, [p.id]: e.target.value }))
                                  if (precResults) setPrecResults(prev => prev ? { ...prev, [p.id]: checkPrecAnswer(p, e.target.value) } : null)
                                }}
                                placeholder="#"
                                className="w-16 font-mono text-sm bg-raised border rounded-sm px-3 py-1.5 text-primary placeholder-dim focus:outline-none transition-colors"
                                style={{
                                  border: `1px solid ${
                                    pr === 'correct' ? 'color-mix(in srgb, #22c55e 45%, transparent)'
                                    : pr === 'wrong'  ? 'color-mix(in srgb, #ef4444 45%, transparent)'
                                    : 'rgba(var(--overlay),0.12)'
                                  }`
                                }}
                              />
                              {pr === 'correct' && <span className="font-mono text-xs" style={{ color: '#22c55e' }}>✓</span>}
                              {pr === 'wrong'   && (
                                <span className="font-sans text-xs" style={{ color: '#ef4444' }}>
                                  expected {p.isAddSub ? p.limitingDP : p.limitingSF}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    <AnimatePresence>
                      {result && result !== 'correct' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="font-mono text-xs leading-relaxed"
                          style={{ color: 'rgba(var(--overlay),0.4)', overflow: 'hidden' }}
                        >
                          {result === 'empty' ? 'No answer entered.' : p.explanation}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}

            <button onClick={checkAll}
              className="self-start px-6 py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              Check Answers
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="font-mono text-xs text-secondary">×/÷: keep fewest sig figs · +/−: keep fewest decimal places · leading zeros never significant</p>
    </div>
  )
}

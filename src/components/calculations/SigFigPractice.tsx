import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { countSigFigs, formatSigFigs } from '../../utils/sigfigs'

// ── Types ─────────────────────────────────────────────────────────────────────

type CheckResult = 'correct' | 'wrong_sf' | 'wrong_value' | 'empty'

interface Problem {
  id: number
  kind: 'count' | 'arith'
  display: string
  correctAnswer: string
  explanation: string
  limitingSF?: number
  limitingDP?: number
  isAddSub?: boolean
}

// ── Random helpers ────────────────────────────────────────────────────────────

const rnd = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo
const nzd = () => rnd(1, 9)

function countDP(s: string): number {
  const dot = s.indexOf('.')
  if (dot === -1 || dot === s.length - 1) return 0
  return s.length - dot - 1
}

/** d.dd...d format with exactly `sf` sig figs; last decimal digit forced non-zero */
function numWithSF(sf: number): string {
  const int = nzd()
  if (sf === 1) return String(int)
  const dec = Array.from({ length: sf - 1 }, (_, i) =>
    i === sf - 2 ? nzd() : rnd(0, 9),
  ).join('')
  return `${int}.${dec}`
}

// ── Problem generators ────────────────────────────────────────────────────────

function makeCountProblem(id: number): Problem {
  switch (rnd(0, 5)) {
    case 0: {
      const sf = rnd(2, 4)
      const s = numWithSF(sf)
      return { id, kind: 'count', display: s, correctAnswer: String(sf), explanation: `All non-zero digits are significant → ${sf} sf.` }
    }
    case 1: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const s = v === 0 ? `${a}0${b}` : v === 1 ? `${a}.0${b}` : `${a}00${b}`
      const sf = v === 2 ? 4 : 3
      return { id, kind: 'count', display: s, correctAnswer: String(sf), explanation: `Zeros between significant digits count → ${sf} sf.` }
    }
    case 2: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const [s, sf] = v === 0 ? [`0.0${a}${b}`, 2] : v === 1 ? [`0.00${a}`, 1] : [`0.${a}${b}`, 2]
      return { id, kind: 'count', display: s, correctAnswer: String(sf), explanation: `Leading zeros are not significant → ${sf} sf.` }
    }
    case 3: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const [s, sf] = v === 0 ? [`${a}.${b}0`, 3] : v === 1 ? [`${a}.00`, 3] : [`${a}${b}.0`, 3]
      return { id, kind: 'count', display: s, correctAnswer: String(sf), explanation: `Trailing zeros after a decimal are significant → 3 sf.` }
    }
    case 4: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const [s, sf] = v === 0 ? [`${a}0`, 1] : v === 1 ? [`${a}${b}00`, 2] : [`${a}000`, 1]
      return { id, kind: 'count', display: s, correctAnswer: String(sf), explanation: `Trailing zeros without a decimal are ambiguous — not counted → ${sf} sf.` }
    }
    default: {
      const [a, b] = [nzd(), nzd()]
      const s = rnd(0, 1) === 0 ? `${a}00.` : `${a}${b}0.`
      return { id, kind: 'count', display: s, correctAnswer: '3', explanation: `A trailing decimal point makes all digits significant → 3 sf.` }
    }
  }
}

function makeArithProblem(id: number, useAddSub: boolean, useMultDiv: boolean): Problem {
  const doAddSub = useAddSub && useMultDiv ? rnd(0, 1) === 1 : useAddSub

  if (!doAddSub) {
    const op = rnd(0, 1) === 0 ? '×' : '÷'
    const sf1 = rnd(2, 4), sf2 = rnd(2, 3)
    const n1 = numWithSF(sf1), n2 = numWithSF(sf2)
    const a = parseFloat(n1), b = parseFloat(n2)
    const raw = op === '×' ? a * b : a / b
    const lim = Math.min(sf1, sf2)
    const answer = formatSigFigs(raw, lim)
    const rawStr = raw.toPrecision(8).replace(/\.?0+$/, '')
    return {
      id, kind: 'arith', display: `${n1} ${op} ${n2}`,
      correctAnswer: answer, limitingSF: lim, isAddSub: false,
      explanation: `${n1} (${sf1} sf) ${op} ${n2} (${sf2} sf) = ${rawStr} → ${lim} sf → ${answer}`,
    }
  } else {
    const op = rnd(0, 1) === 0 ? '+' : '−'
    // dp1 ∈ [2,3], dp2 ∈ [0,1]; dp2 is always the limiting (fewer dp)
    const dp1 = rnd(2, 3), dp2 = rnd(0, 1)
    const int1 = op === '−' ? rnd(40, 99) : rnd(10, 99)
    const dec1 = Array.from({ length: dp1 }, () => rnd(0, 9)).join('')
    const n1 = `${int1}.${dec1}`
    const int2 = op === '−' ? rnd(1, 25) : rnd(1, 99)
    const n2 = dp2 === 0 ? String(int2) : `${int2}.${nzd()}`
    const a = parseFloat(n1), b = parseFloat(n2)
    const raw = op === '+' ? a + b : a - b
    const answer = raw.toFixed(dp2)
    return {
      id, kind: 'arith', display: `${n1} ${op} ${n2}`,
      correctAnswer: answer, limitingDP: dp2, isAddSub: true,
      explanation: `${n1} (${dp1} d.p.) ${op} ${n2} (${dp2} d.p.) = ${raw} → ${dp2} d.p. → ${answer}`,
    }
  }
}

function generateProblems(
  count: number,
  inclCount: boolean,
  inclMultDiv: boolean,
  inclAddSub: boolean,
): Problem[] {
  type Slot = 'count' | 'multdiv' | 'addsub'
  const enabled: Slot[] = []
  if (inclCount) enabled.push('count')
  if (inclMultDiv) enabled.push('multdiv')
  if (inclAddSub) enabled.push('addsub')
  if (enabled.length === 0) return []

  // Guarantee at least one of each enabled type (up to count), then cycle for the rest
  const slots: Slot[] = [...enabled.slice(0, count)]
  while (slots.length < count) slots.push(enabled[slots.length % enabled.length])

  // Shuffle so the guaranteed ones aren't always first
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }

  return slots.map((slot, i) => {
    if (slot === 'count') return makeCountProblem(i)
    if (slot === 'multdiv') return makeArithProblem(i, false, true)
    return makeArithProblem(i, true, false)
  })
}

// ── Answer checker ────────────────────────────────────────────────────────────

function checkAnswer(input: string, p: Problem): CheckResult {
  const s = input.trim()
  if (!s) return 'empty'

  if (p.kind === 'count') {
    return parseInt(s) === parseInt(p.correctAnswer) ? 'correct' : 'wrong_value'
  }

  const userNum = parseFloat(s)
  const correctNum = parseFloat(p.correctAnswer)
  if (isNaN(userNum)) return 'wrong_value'

  const relErr = correctNum === 0
    ? Math.abs(userNum)
    : Math.abs(userNum - correctNum) / Math.abs(correctNum)
  if (relErr > 0.01) return 'wrong_value'

  if (p.isAddSub) {
    const expected = p.limitingDP ?? countDP(p.correctAnswer)
    return countDP(s) === expected ? 'correct' : 'wrong_sf'
  } else {
    const expected = p.limitingSF ?? countSigFigs(p.correctAnswer)
    return countSigFigs(s) === expected ? 'correct' : 'wrong_sf'
  }
}

// ── Result colour helpers ─────────────────────────────────────────────────────

function borderColor(r: CheckResult | undefined): string {
  if (r === 'correct') return 'color-mix(in srgb, #22c55e 45%, transparent)'
  if (r === 'wrong_sf') return 'color-mix(in srgb, #f97316 45%, transparent)'
  if (r === 'wrong_value' || r === 'empty') return 'color-mix(in srgb, #ef4444 45%, transparent)'
  return 'rgba(255,255,255,0.12)'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SigFigPractice() {
  const [count, setCount] = useState(5)
  const [inclCount, setInclCount] = useState(true)
  const [inclMultDiv, setInclMultDiv] = useState(true)
  const [inclAddSub, setInclAddSub] = useState(true)

  const [problems, setProblems] = useState<Problem[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [results, setResults] = useState<Record<number, CheckResult> | null>(null)

  function generate() {
    setProblems(generateProblems(count, inclCount, inclMultDiv, inclAddSub))
    setAnswers({})
    setResults(null)
  }

  function checkAll() {
    const r: Record<number, CheckResult> = {}
    problems.forEach(p => { r[p.id] = checkAnswer(answers[p.id] ?? '', p) })
    setResults(r)
  }

  const noneSelected = !inclCount && !inclMultDiv && !inclAddSub
  const correct = results ? Object.values(results).filter(r => r === 'correct').length : 0
  const total = problems.length

  const pillStyle = (active: boolean) => ({
    background: active ? 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)' : 'transparent',
    border: active
      ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
      : '1px solid rgba(255,255,255,0.1)',
    color: active ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
  })

  return (
    <div className="flex flex-col gap-5">

      {/* Settings */}
      <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Settings</p>

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
          className="self-start px-6 py-2.5 rounded-sm font-sans font-medium text-base transition-all disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
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
                    ? 'color-mix(in srgb, #22c55e 10%, #0e1016)'
                    : 'color-mix(in srgb, var(--c-halogen) 10%, #0e1016)',
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
                  style={{ background: '#0e1016' }}
                >
                  <span className="font-mono text-xs text-dim shrink-0 pt-0.5">{idx + 1}.</span>
                  <div className="flex flex-col gap-2.5 flex-1 min-w-0">

                    {/* Question */}
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

                    {/* Input row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        inputMode={p.kind === 'count' ? 'numeric' : 'decimal'}
                        value={answers[p.id] ?? ''}
                        onChange={e => {
                          setAnswers(prev => ({ ...prev, [p.id]: e.target.value }))
                          if (results) setResults(prev => prev ? { ...prev, [p.id]: checkAnswer(e.target.value, p) } : null)
                        }}
                        placeholder={p.kind === 'count' ? '# sig figs' : 'answer'}
                        className="w-36 font-mono text-base bg-raised rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none transition-colors"
                        style={{ border: `1px solid ${borderColor(result)}` }}
                      />
                      {result === 'correct' && (
                        <span className="font-mono text-sm" style={{ color: '#22c55e' }}>✓ Correct</span>
                      )}
                      {result === 'wrong_sf' && (
                        <span className="font-sans text-xs" style={{ color: '#f97316' }}>
                          Right value — check sig figs
                          {p.isAddSub
                            ? ` (expected ${p.limitingDP} d.p.)`
                            : ` (expected ${p.limitingSF} sf)`}
                        </span>
                      )}
                      {result === 'wrong_value' && (
                        <span className="font-mono text-sm" style={{ color: '#ef4444' }}>✗</span>
                      )}
                    </div>

                    {/* Explanation shown after a wrong/empty check */}
                    <AnimatePresence>
                      {result && result !== 'correct' && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="font-mono text-xs leading-relaxed"
                          style={{ color: 'rgba(255,255,255,0.4)', overflow: 'hidden' }}
                        >
                          {result === 'empty' ? 'No answer entered.' : p.explanation}
                        </motion.p>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              )
            })}

            {/* Check all button */}
            <button onClick={checkAll}
              className="self-start px-6 py-2.5 rounded-sm font-sans font-medium text-base transition-all"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              Check Answers
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

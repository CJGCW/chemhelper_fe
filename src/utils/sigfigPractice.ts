import { countSigFigs, formatSigFigs } from './sigfigs'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SigFigCheckResult = 'correct' | 'wrong_sf' | 'wrong_value' | 'empty'

export interface SigFigProblem {
  kind:          'count' | 'arith'
  display:       string
  correctAnswer: string
  explanation:   string
  limitingSF?:   number
  limitingDP?:   number
  isAddSub?:     boolean
}

// ── Random helpers ────────────────────────────────────────────────────────────

const rnd = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo
const nzd = () => rnd(1, 9)

function countDP(s: string): number {
  const dot = s.indexOf('.')
  if (dot === -1 || dot === s.length - 1) return 0
  return s.length - dot - 1
}

function numWithSF(sf: number): string {
  const int = nzd()
  if (sf === 1) return String(int)
  const dec = Array.from({ length: sf - 1 }, (_, i) =>
    i === sf - 2 ? nzd() : rnd(0, 9),
  ).join('')
  return `${int}.${dec}`
}

// ── Generators ────────────────────────────────────────────────────────────────

export function makeCountProblem(): SigFigProblem {
  switch (rnd(0, 5)) {
    case 0: {
      const sf = rnd(2, 4)
      const s = numWithSF(sf)
      return { kind: 'count', display: s, correctAnswer: String(sf), explanation: `All non-zero digits are significant → ${sf} sf.` }
    }
    case 1: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const s = v === 0 ? `${a}0${b}` : v === 1 ? `${a}.0${b}` : `${a}00${b}`
      const sf = v === 2 ? 4 : 3
      return { kind: 'count', display: s, correctAnswer: String(sf), explanation: `Zeros between significant digits count → ${sf} sf.` }
    }
    case 2: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const [s, sf] = v === 0 ? [`0.0${a}${b}`, 2] : v === 1 ? [`0.00${a}`, 1] : [`0.${a}${b}`, 2]
      return { kind: 'count', display: s, correctAnswer: String(sf), explanation: `Leading zeros are not significant → ${sf} sf.` }
    }
    case 3: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const [s, sf] = v === 0 ? [`${a}.${b}0`, 3] : v === 1 ? [`${a}.00`, 3] : [`${a}${b}.0`, 3]
      return { kind: 'count', display: s, correctAnswer: String(sf), explanation: `Trailing zeros after a decimal are significant → 3 sf.` }
    }
    case 4: {
      const [a, b] = [nzd(), nzd()]
      const v = rnd(0, 2)
      const [s, sf] = v === 0 ? [`${a}0`, 1] : v === 1 ? [`${a}${b}00`, 2] : [`${a}000`, 1]
      return { kind: 'count', display: s, correctAnswer: String(sf), explanation: `Trailing zeros without a decimal are ambiguous — not counted → ${sf} sf.` }
    }
    default: {
      const [a, b] = [nzd(), nzd()]
      const s = rnd(0, 1) === 0 ? `${a}00.` : `${a}${b}0.`
      return { kind: 'count', display: s, correctAnswer: '3', explanation: `A trailing decimal point makes all digits significant → 3 sf.` }
    }
  }
}

export function makeArithProblem(forceAddSub?: boolean): SigFigProblem {
  const doAddSub = forceAddSub !== undefined ? forceAddSub : rnd(0, 1) === 1

  if (!doAddSub) {
    const op = rnd(0, 1) === 0 ? '×' : '÷'
    // Retry until formatSigFigs produces a string whose countSigFigs matches lim.
    // This avoids ambiguous trailing zeros (e.g. 90 → 1 sf instead of 2).
    for (let attempt = 0; attempt < 20; attempt++) {
      const sf1 = rnd(2, 4), sf2 = rnd(2, 3)
      const n1 = numWithSF(sf1), n2 = numWithSF(sf2)
      const a = parseFloat(n1), b = parseFloat(n2)
      const raw = op === '×' ? a * b : a / b
      const lim = Math.min(sf1, sf2)
      const answer = formatSigFigs(raw, lim)
      if (countSigFigs(answer) !== lim) continue
      const rawStr = raw.toPrecision(8).replace(/\.?0+$/, '')
      return {
        kind: 'arith', display: `${n1} ${op} ${n2}`,
        correctAnswer: answer, limitingSF: lim, isAddSub: false,
        explanation: `${n1} (${sf1} sf) ${op} ${n2} (${sf2} sf) = ${rawStr} → ${lim} sf → ${answer}`,
      }
    }
    // Fallback: simple 2-sf problem that avoids the trailing-zero issue
    const n1 = numWithSF(3), n2 = numWithSF(2)
    const a = parseFloat(n1), b = parseFloat(n2)
    const raw = a * b
    const answer = formatSigFigs(raw, 2)
    return {
      kind: 'arith', display: `${n1} × ${n2}`,
      correctAnswer: answer, limitingSF: 2, isAddSub: false,
      explanation: `${n1} (3 sf) × ${n2} (2 sf) = ${raw.toPrecision(8).replace(/\.?0+$/, '')} → 2 sf → ${answer}`,
    }
  } else {
    const op = rnd(0, 1) === 0 ? '+' : '−'
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
      kind: 'arith', display: `${n1} ${op} ${n2}`,
      correctAnswer: answer, limitingDP: dp2, isAddSub: true,
      explanation: `${n1} (${dp1} d.p.) ${op} ${n2} (${dp2} d.p.) = ${raw} → ${dp2} d.p. → ${answer}`,
    }
  }
}

/** Generate one sig fig problem, randomly choosing count vs arithmetic. */
export function generateSigFigProblem(): SigFigProblem {
  return rnd(0, 1) === 0 ? makeCountProblem() : makeArithProblem()
}

// ── Answer checker ────────────────────────────────────────────────────────────

export function checkSigFigAnswer(input: string, p: SigFigProblem): SigFigCheckResult {
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

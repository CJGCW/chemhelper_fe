import { describe, it, expect } from 'vitest'
import {
  genEcellProblem,
  checkEcellAnswer,
  type EcellProblem,
} from './ecellPractice'
import { HALF_REACTIONS } from '../data/reductionPotentials'

// ── genEcellProblem — shape invariants ────────────────────────────────────────

describe('genEcellProblem — shape invariants', () => {
  const SUBTYPES = ['calc_e0cell', 'spontaneity', 'nernst', 'delta_g'] as const

  for (const subtype of SUBTYPES) {
    it(`${subtype}: returns required fields`, () => {
      for (let i = 0; i < 20; i++) {
        const p = genEcellProblem(subtype)
        expect(p.subtype).toBe(subtype)
        expect(p.question.length).toBeGreaterThan(10)
        expect(p.context.length).toBeGreaterThan(5)
        expect(p.answer.length).toBeGreaterThan(0)
        expect(Array.isArray(p.steps)).toBe(true)
        expect(p.steps.length).toBeGreaterThanOrEqual(2)
      }
    })
  }
})

// ── calc_e0cell ───────────────────────────────────────────────────────────────

describe('calc_e0cell', () => {
  it('answer is always positive (cathode E° > anode E°)', () => {
    for (let i = 0; i < 50; i++) {
      const p = genEcellProblem('calc_e0cell')
      expect(parseFloat(p.answer)).toBeGreaterThan(0)
    }
  })

  it('answer matches E°cathode − E°anode extracted from context', () => {
    for (let i = 0; i < 30; i++) {
      const p = genEcellProblem('calc_e0cell')
      // Extract both E° values from the context string
      const matches = [...p.context.matchAll(/E°red = ([-+][0-9.]+) V/g)]
      expect(matches.length).toBe(2)
      const cE0 = parseFloat(matches[0][1])
      const aE0 = parseFloat(matches[1][1])
      const expected = cE0 - aE0
      expect(parseFloat(p.answer)).toBeCloseTo(expected, 2)
    }
  })

  it('answerUnit is V', () => {
    const p = genEcellProblem('calc_e0cell')
    expect(p.answerUnit).toBe('V')
  })

  it('tolerance is 0.002 V', () => {
    const p = genEcellProblem('calc_e0cell')
    expect(p.tolerance).toBe(0.002)
  })

  it('steps contain "E°cell = E°cathode − E°anode"', () => {
    for (let i = 0; i < 10; i++) {
      const p = genEcellProblem('calc_e0cell')
      expect(p.steps[0]).toContain('E°cell = E°cathode')
    }
  })

  // Spot-check: Zn/Cu Daniell cell
  it('Daniell cell: E° = +0.342 − (−0.762) = +1.104 V', () => {
    const cathode = HALF_REACTIONS.find(r => r.id === 'Cu2a')!
    const anode   = HALF_REACTIONS.find(r => r.id === 'Zn')!
    expect(cathode).toBeDefined()
    expect(anode).toBeDefined()
    const e0 = cathode.e0 - anode.e0
    expect(e0).toBeCloseTo(1.104, 2)
  })

  // Spot-check: Ag+/Fe2+ cell
  it('Ag+/Fe cell: E° = +0.800 − (−0.440) = +1.240 V', () => {
    const cathode = HALF_REACTIONS.find(r => r.id === 'Ag')!
    const anode   = HALF_REACTIONS.find(r => r.id === 'Fe2')!
    const e0 = cathode.e0 - anode.e0
    expect(e0).toBeCloseTo(1.240, 2)
  })
})

// ── spontaneity ───────────────────────────────────────────────────────────────

describe('spontaneity', () => {
  it('answer is always "yes" or "no"', () => {
    for (let i = 0; i < 50; i++) {
      const p = genEcellProblem('spontaneity')
      expect(['yes', 'no']).toContain(p.answer)
    }
  })

  it('produces both "yes" and "no" across 200 runs', () => {
    const answers = new Set<string>()
    for (let i = 0; i < 200; i++) {
      answers.add(genEcellProblem('spontaneity').answer)
    }
    expect(answers.has('yes')).toBe(true)
    expect(answers.has('no')).toBe(true)
  })

  it('steps mention E°cell and ΔG°', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEcellProblem('spontaneity')
      const text = p.steps.join(' ')
      expect(text).toContain('E°cell')
      expect(text).toContain('ΔG°')
    }
  })

  it('spontaneity is consistent with E°cell sign in steps', () => {
    for (let i = 0; i < 30; i++) {
      const p = genEcellProblem('spontaneity')
      const stepText = p.steps[0]
      const match = stepText.match(/= ([-+][0-9.]+) V/)
      if (!match) continue
      const e0 = parseFloat(match[1])
      if (e0 > 0) expect(p.answer).toBe('yes')
      if (e0 < 0) expect(p.answer).toBe('no')
    }
  })
})

// ── nernst ────────────────────────────────────────────────────────────────────

describe('nernst', () => {
  it('answer is a numeric string starting with + or -', () => {
    for (let i = 0; i < 30; i++) {
      const p = genEcellProblem('nernst')
      expect(p.answer).toMatch(/^[-+][0-9]/)
    }
  })

  it('answerUnit is V', () => {
    const p = genEcellProblem('nernst')
    expect(p.answerUnit).toBe('V')
  })

  it('steps contain the Nernst equation formula', () => {
    for (let i = 0; i < 10; i++) {
      const p = genEcellProblem('nernst')
      expect(p.steps[0]).toContain('Nernst')
    }
  })

  it('steps contain log value', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEcellProblem('nernst')
      const text = p.steps.join(' ')
      expect(text).toContain('log')
    }
  })

  // Manual spot-check: E° = +1.104, n=2, Q=0.01 → E = 1.104 - (0.05916/2)*(-2) = 1.104 + 0.05916 = 1.163
  it('manual spot-check: E°=+1.104, n=2, Q=0.01 → E ≈ +1.163 V', () => {
    const e0 = 1.104, n = 2, logQ = -2
    const E = e0 - (0.05916 / n) * logQ
    expect(E).toBeCloseTo(1.163, 2)
  })

  it('manual spot-check: E°=+0.342, n=2, Q=100 → E ≈ +0.283 V', () => {
    const e0 = 0.342, n = 2, logQ = 2
    const E = e0 - (0.05916 / n) * logQ
    expect(E).toBeCloseTo(0.283, 2)
  })
})

// ── delta_g ───────────────────────────────────────────────────────────────────

describe('delta_g', () => {
  it('answer is a numeric string with one decimal place', () => {
    for (let i = 0; i < 30; i++) {
      const p = genEcellProblem('delta_g')
      expect(p.answer).toMatch(/^[-+]?[0-9]+\.[0-9]$/)
    }
  })

  it('answerUnit is kJ/mol', () => {
    const p = genEcellProblem('delta_g')
    expect(p.answerUnit).toBe('kJ/mol')
  })

  it('steps contain ΔG° = −nFE°cell formula', () => {
    for (let i = 0; i < 10; i++) {
      const p = genEcellProblem('delta_g')
      expect(p.steps[0]).toContain('ΔG° = −nFE°cell')
    }
  })

  it('E°cell is positive (cathode chosen correctly) → ΔG° is negative (spontaneous)', () => {
    for (let i = 0; i < 50; i++) {
      const p = genEcellProblem('delta_g')
      // Context has "E°cell = +X.XXX V" — verify it's positive
      const match = p.context.match(/E°cell = ([-+][0-9.]+) V/)
      if (!match) continue
      const e0 = parseFloat(match[1])
      expect(e0).toBeGreaterThan(0)
      expect(parseFloat(p.answer)).toBeLessThan(0)
    }
  })

  // Spot-check: Daniell cell — n=2, E°=+1.104 V → ΔG° = -2*96485*1.104 = -213,039 J ≈ -213.0 kJ/mol
  it('Daniell cell: n=2, E°=+1.104 V → ΔG° ≈ -213.0 kJ/mol', () => {
    const n = 2, e0 = 1.104, F = 96485
    const dg = -(n * F * e0) / 1000
    expect(dg).toBeCloseTo(-213.0, 0)
  })

  it('tolerance is 2 kJ/mol', () => {
    const p = genEcellProblem('delta_g')
    expect(p.tolerance).toBe(2)
  })
})

// ── checkEcellAnswer ──────────────────────────────────────────────────────────

describe('checkEcellAnswer — spontaneity', () => {
  function makeProblem(answer: string): EcellProblem {
    return { subtype:'spontaneity', question:'q', context:'c', answer, answerUnit:'', tolerance:0, steps:[] }
  }
  it('accepts "yes"', ()  => expect(checkEcellAnswer('yes', makeProblem('yes'))).toBe(true))
  it('accepts "YES"', ()  => expect(checkEcellAnswer('YES', makeProblem('yes'))).toBe(true))
  it('accepts "no"',  ()  => expect(checkEcellAnswer('no',  makeProblem('no'))).toBe(true))
  it('rejects "no" for "yes"', () => expect(checkEcellAnswer('no', makeProblem('yes'))).toBe(false))
  it('rejects empty', () => expect(checkEcellAnswer('', makeProblem('yes'))).toBe(false))
})

describe('checkEcellAnswer — numeric (calc_e0cell)', () => {
  function makeProblem(answer: string, tol = 0.002): EcellProblem {
    return { subtype:'calc_e0cell', question:'q', context:'c', answer, answerUnit:'V', tolerance:tol, steps:[] }
  }
  it('exact match passes', () => expect(checkEcellAnswer('+1.104', makeProblem('+1.104'))).toBe(true))
  it('within tolerance passes', () => expect(checkEcellAnswer('+1.105', makeProblem('+1.104'))).toBe(true))
  it('just outside tolerance fails', () => expect(checkEcellAnswer('+1.107', makeProblem('+1.104'))).toBe(false))
  it('accepts without leading +', () => expect(checkEcellAnswer('1.104', makeProblem('+1.104'))).toBe(true))
  it('negative value accepted', () => expect(checkEcellAnswer('-0.342', makeProblem('-0.342'))).toBe(true))
  it('rejects non-numeric', () => expect(checkEcellAnswer('abc', makeProblem('+1.104'))).toBe(false))
})

describe('checkEcellAnswer — delta_g tolerance', () => {
  function makeProblem(answer: string): EcellProblem {
    return { subtype:'delta_g', question:'q', context:'c', answer, answerUnit:'kJ/mol', tolerance:2, steps:[] }
  }
  it('within 2 kJ/mol tolerance passes', () => expect(checkEcellAnswer('-211.0', makeProblem('-213.0'))).toBe(true))
  it('outside 2 kJ/mol tolerance fails', () => expect(checkEcellAnswer('-209.0', makeProblem('-213.0'))).toBe(false))
})

// ── Self-consistency: generated answer always passes ─────────────────────────

describe('self-consistency: generated answer passes checkEcellAnswer', () => {
  const SUBTYPES = ['calc_e0cell', 'spontaneity', 'nernst', 'delta_g'] as const

  for (const subtype of SUBTYPES) {
    it(`${subtype}: canonical answer passes`, () => {
      for (let i = 0; i < 30; i++) {
        const p = genEcellProblem(subtype)
        expect(checkEcellAnswer(p.answer, p)).toBe(true)
      }
    })
  }
})

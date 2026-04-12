import { describe, it, expect } from 'vitest'
import {
  genHessProblem,
  checkHessAnswer,
  HESS_PROBLEMS,
  type HessProblem,
} from './hessLawPractice'

// ── Problem database integrity ────────────────────────────────────────────────

describe('HESS_PROBLEMS database', () => {
  it('contains at least 5 problems', () => {
    expect(HESS_PROBLEMS.length).toBeGreaterThanOrEqual(5)
  })

  it('every problem has required fields', () => {
    for (const p of HESS_PROBLEMS) {
      expect(typeof p.description).toBe('string')
      expect(p.description.length).toBeGreaterThan(3)
      expect(typeof p.target).toBe('string')
      expect(p.target).toContain('→')
      expect(Array.isArray(p.steps)).toBe(true)
      expect(p.steps.length).toBeGreaterThanOrEqual(2)
      expect(typeof p.answer).toBe('number')
      expect(isNaN(p.answer)).toBe(false)
      expect(p.answerUnit).toBe('kJ')
      expect(Array.isArray(p.solutionSteps)).toBe(true)
      expect(p.solutionSteps.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('every step has an equation and a finite dh', () => {
    for (const p of HESS_PROBLEMS) {
      for (const step of p.steps) {
        expect(step.equation.length).toBeGreaterThan(3)
        expect(step.equation).toContain('→')
        expect(typeof step.dh).toBe('number')
        expect(isFinite(step.dh)).toBe(true)
      }
    }
  })

  it('last solution step contains the numeric answer', () => {
    for (const p of HESS_PROBLEMS) {
      const last = p.solutionSteps[p.solutionSteps.length - 1]
      expect(last).toContain('kJ')
    }
  })
})

// ── genHessProblem ────────────────────────────────────────────────────────────

describe('genHessProblem', () => {
  it('returns a valid problem each call', () => {
    for (let i = 0; i < 20; i++) {
      const p = genHessProblem()
      expect(p.steps.length).toBeGreaterThanOrEqual(2)
      expect(p.answerUnit).toBe('kJ')
      expect(isFinite(p.answer)).toBe(true)
    }
  })

  it('returns different problems over many calls (random selection)', () => {
    const targets = new Set<string>()
    for (let i = 0; i < 50; i++) targets.add(genHessProblem().target)
    expect(targets.size).toBeGreaterThan(1)
  })
})

// ── checkHessAnswer ───────────────────────────────────────────────────────────

describe('checkHessAnswer', () => {
  const make = (answer: number): HessProblem => ({
    description: 'test', target: 'A → B', answerUnit: 'kJ', solutionSteps: [],
    steps: [{ equation: 'A → B', dh: answer }],
    answer,
  })

  it('accepts exact answer', () => {
    expect(checkHessAnswer(make(-221.0), '-221.0')).toBe(true)
    expect(checkHessAnswer(make(+66.4),  '+66.4')).toBe(true)
  })

  it('accepts answer within +2% tolerance', () => {
    const p = make(-890.3)
    expect(checkHessAnswer(p, String(-890.3 * 0.985))).toBe(true)
  })

  it('accepts answer within -2% tolerance', () => {
    const p = make(-890.3)
    expect(checkHessAnswer(p, String(-890.3 * 1.015))).toBe(true)
  })

  it('rejects answer more than 2% off', () => {
    const p = make(-890.3)
    expect(checkHessAnswer(p, String(-890.3 * 0.97))).toBe(false)
    expect(checkHessAnswer(p, String(-890.3 * 1.03))).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = make(-221.0)
    expect(checkHessAnswer(p, '')).toBe(false)
    expect(checkHessAnswer(p, 'abc')).toBe(false)
  })

  it('every problem in database passes its own checker', () => {
    for (const p of HESS_PROBLEMS) {
      expect(checkHessAnswer(p, String(p.answer))).toBe(true)
    }
  })
})

// ── Manual answer spot-checks ─────────────────────────────────────────────────

describe('manual spot-checks', () => {
  it('formation of CO: 2C + O2 → 2CO  ≈ −221.0 kJ', () => {
    const p = HESS_PROBLEMS.find(x => x.description === 'formation of carbon monoxide')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(-221.0, 0)
  })

  it('formation of methane: C + 2H2 → CH4  ≈ −74.8 kJ', () => {
    const p = HESS_PROBLEMS.find(x => x.description === 'formation of methane')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(-74.8, 0)
  })

  it('formation of NO2: N2 + 2O2 → 2NO2  ≈ +66.4 kJ', () => {
    const p = HESS_PROBLEMS.find(x => x.description === 'formation of nitrogen dioxide')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(66.4, 0)
  })

  it('formation of SO3: 2S + 3O2 → 2SO3  ≈ −791.4 kJ', () => {
    const p = HESS_PROBLEMS.find(x => x.description === 'formation of sulfur trioxide from sulfur')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(-791.4, 0)
  })

  it('formation of water vapor: 2H2 + O2 → 2H2O(g)  ≈ −483.6 kJ', () => {
    const p = HESS_PROBLEMS.find(x => x.description === 'formation of water vapor from H₂ and O₂')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(-483.6, 0)
  })

  it('combustion of ethane  ≈ −3119.4 kJ', () => {
    const p = HESS_PROBLEMS.find(x => x.description === 'combustion of ethane (from formation data)')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(-3119.4, 0)
  })
})

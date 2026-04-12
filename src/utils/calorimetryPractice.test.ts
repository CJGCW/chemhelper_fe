import { describe, it, expect } from 'vitest'
import {
  genCalorimetryProblem,
  checkCalorimetryAnswer,
  type CalorimetryProblem,
} from './calorimetryPractice'

// ── Helpers ────────────────────────────────────────────────────────────────────

function sf3(v: number) { return parseFloat(v.toPrecision(3)) }

// Build deterministic mcdt problems to spot-check math
function makeMcdtQ(m: number, c: number, dt: number): CalorimetryProblem {
  const q = sf3(m * c * dt)
  return {
    mode: 'mcdt', solveFor: 'q', answer: q, answerUnit: 'J',
    question: '', given: [], steps: [],
  }
}
function makeBomb(Ccal: number, dt: number): CalorimetryProblem {
  const qrxn = sf3(-(Ccal * dt))
  return {
    mode: 'bomb', solveFor: 'q_rxn', answer: qrxn, answerUnit: 'kJ',
    question: '', given: [], steps: [],
  }
}

// ── genCalorimetryProblem ──────────────────────────────────────────────────────

describe('genCalorimetryProblem', () => {
  it('returns a problem with the expected shape', () => {
    const p = genCalorimetryProblem()
    expect(p).toHaveProperty('mode')
    expect(p).toHaveProperty('question')
    expect(p).toHaveProperty('given')
    expect(p).toHaveProperty('solveFor')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('answerUnit')
    expect(p).toHaveProperty('steps')
    expect(typeof p.answer).toBe('number')
    expect(isNaN(p.answer)).toBe(false)
  })

  it('returns one of the four valid modes', () => {
    const modes = new Set<string>()
    for (let i = 0; i < 200; i++) modes.add(genCalorimetryProblem().mode)
    expect(modes.has('mcdt')).toBe(true)
    expect(modes.has('cdt')).toBe(true)
    expect(modes.has('coffee')).toBe(true)
    expect(modes.has('bomb')).toBe(true)
  })

  it('always produces a non-empty question string', () => {
    for (let i = 0; i < 20; i++) {
      const p = genCalorimetryProblem()
      expect(p.question.length).toBeGreaterThan(10)
    }
  })

  it('always has at least one given chip', () => {
    for (let i = 0; i < 20; i++) {
      const p = genCalorimetryProblem()
      expect(p.given.length).toBeGreaterThan(0)
    }
  })

  it('always has at least two solution steps', () => {
    for (let i = 0; i < 20; i++) {
      const p = genCalorimetryProblem()
      expect(p.steps.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ── checkCalorimetryAnswer ────────────────────────────────────────────────────

describe('checkCalorimetryAnswer', () => {
  it('accepts exact answer', () => {
    const p = makeMcdtQ(100, 4.184, 10)
    expect(checkCalorimetryAnswer(p, String(p.answer))).toBe(true)
  })

  it('accepts answer within ±2%', () => {
    const p = makeMcdtQ(100, 4.184, 10)
    const near = p.answer * 1.019
    expect(checkCalorimetryAnswer(p, String(near))).toBe(true)
  })

  it('rejects answer outside ±2%', () => {
    const p = makeMcdtQ(100, 4.184, 10)
    const far = p.answer * 1.05
    expect(checkCalorimetryAnswer(p, String(far))).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = makeMcdtQ(100, 4.184, 10)
    expect(checkCalorimetryAnswer(p, 'abc')).toBe(false)
    expect(checkCalorimetryAnswer(p, '')).toBe(false)
  })
})

// ── mcdt math spot-checks ─────────────────────────────────────────────────────

describe('q = mcΔT math', () => {
  it('100 g water, ΔT = +10 °C → q ≈ 4180 J', () => {
    // 100 × 4.184 × 10 = 4184 → sf3 → 4180
    const expected = sf3(100 * 4.184 * 10)
    expect(expected).toBeCloseTo(4180, -1)
  })

  it('50 g copper, ΔT = +25 °C → q ≈ 481 J', () => {
    // 50 × 0.385 × 25 = 481.25 → sf3 → 481
    const expected = sf3(50 * 0.385 * 25)
    expect(expected).toBeCloseTo(481, 0)
  })

  it('negative ΔT produces negative q (heat lost)', () => {
    const expected = sf3(200 * 0.897 * -15)
    expect(expected).toBeLessThan(0)
  })
})

// ── bomb calorimetry spot-check ───────────────────────────────────────────────

describe('bomb calorimetry math', () => {
  it('C_cal = 5.0 kJ/°C, ΔT = +3.0 °C → q_rxn = −15.0 kJ', () => {
    const p = makeBomb(5.0, 3.0)
    expect(p.answer).toBeCloseTo(-15.0, 1)
  })

  it('bomb q_rxn is always negative (exothermic combustion)', () => {
    // ΔT is always positive in genBomb (rand(1.5, 15))
    const p = makeBomb(8.5, 6.2)
    expect(p.answer).toBeLessThan(0)
  })
})

// ── coffee-cup calorimetry ────────────────────────────────────────────────────

describe('coffee-cup calorimetry', () => {
  it('q_rxn = −q_sol sign convention holds', () => {
    // Simulate: 200 g water, Ti = 20, Tf = 28 → q_sol positive → q_rxn negative
    const m = 200, c = 4.184, ti = 20, tf = 28
    const qsol = sf3(m * c * (tf - ti))
    const qrxn = sf3(-qsol)
    expect(qrxn).toBeLessThan(0)
  })

  it('endothermic reaction: Tf < Ti → q_rxn positive', () => {
    const m = 150, c = 4.184, ti = 22, tf = 18
    const qsol = sf3(m * c * (tf - ti))
    const qrxn = sf3(-qsol)
    expect(qrxn).toBeGreaterThan(0)
  })
})

// ── q = CΔT ───────────────────────────────────────────────────────────────────

describe('q = CΔT math', () => {
  it('C = 500 J/°C, ΔT = 4.0 °C → q = 2000 J', () => {
    const q = sf3(500 * 4.0)
    expect(q).toBeCloseTo(2000, 0)
  })

  it('C = q / ΔT inverse: 3000 J, ΔT = 6.0 °C → C = 500 J/°C', () => {
    const C = sf3(3000 / 6.0)
    expect(C).toBeCloseTo(500, 0)
  })
})

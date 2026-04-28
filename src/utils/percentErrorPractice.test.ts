import { describe, it, expect } from 'vitest'
import { percentError, generatePercentErrorProblem } from './percentErrorPractice'

describe('percentError', () => {
  it('basic calculation — aluminum density', () => {
    // exp = 2.85, accepted = 2.70
    // |2.85 - 2.70| / 2.70 × 100 = 0.15/2.70 × 100 = 5.556%
    expect(percentError(2.85, 2.70)).toBeCloseTo(5.556, 1)
  })

  it('negative accepted value — ΔH', () => {
    // exp = -42.0, accepted = -44.5
    // |-42.0 - (-44.5)| / |-44.5| × 100 = 2.5 / 44.5 × 100 = 5.618%
    expect(percentError(-42.0, -44.5)).toBeCloseTo(5.618, 1)
  })

  it('zero accepted value throws', () => {
    expect(() => percentError(1.0, 0)).toThrow()
  })

  it('perfect measurement = 0% error', () => {
    expect(percentError(8.96, 8.96)).toBe(0)
  })

  it('experimental below accepted — absolute value applied', () => {
    // |2.60 - 2.70| / 2.70 × 100 = 0.10/2.70 × 100 = 3.704%
    expect(percentError(2.60, 2.70)).toBeCloseTo(3.704, 1)
  })

  it('result is always non-negative', () => {
    expect(percentError(1.5, 2.0)).toBeGreaterThanOrEqual(0)
    expect(percentError(2.5, 2.0)).toBeGreaterThanOrEqual(0)
    expect(percentError(-50.0, -44.5)).toBeGreaterThanOrEqual(0)
  })
})

describe('generatePercentErrorProblem — 20 iterations', () => {
  it('every generated problem is self-consistent', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePercentErrorProblem()

      expect(p.answer).toBeGreaterThanOrEqual(0)
      expect(p.answer).toBeLessThan(50)
      expect(p.steps.length).toBeGreaterThanOrEqual(3)
      expect(p.scenario.length).toBeGreaterThan(10)

      const recomputed =
        (Math.abs(p.experimental - p.accepted) / Math.abs(p.accepted)) * 100
      expect(recomputed).toBeCloseTo(p.answer, 0)
    }
  })
})

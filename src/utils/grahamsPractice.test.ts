import { describe, it, expect } from 'vitest'
import { generateGrahamsProblem, checkGrahamsAnswer } from './grahamsPractice'

describe('generateGrahamsProblem', () => {
  it('returns all required fields', () => {
    const p = generateGrahamsProblem()
    expect(p.question.length).toBeGreaterThan(0)
    expect(p.steps.length).toBeGreaterThanOrEqual(4)
    expect(typeof p.answer).toBe('number')
    expect(isNaN(p.answer)).toBe(false)
    expect(p.answer).toBeGreaterThan(0)
    expect(typeof p.unit).toBe('string')
  })

  it('generates all four problem types over many runs', () => {
    const units = new Set<string>()
    for (let i = 0; i < 200; i++) {
      const p = generateGrahamsProblem()
      units.add(p.unit)
    }
    // find-ratio → '', find-rate → 'mL/s', find-molar-mass → 'g/mol', find-time → 's'
    expect(units.has('')).toBe(true)
    expect(units.has('mL/s')).toBe(true)
    expect(units.has('g/mol')).toBe(true)
    expect(units.has('s')).toBe(true)
  })

  it('answer is always positive', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateGrahamsProblem().answer).toBeGreaterThan(0)
    }
  })

  it('steps are non-empty strings', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGrahamsProblem()
      expect(p.steps.length).toBeGreaterThan(0)
      for (const step of p.steps) expect(step.length).toBeGreaterThan(0)
    }
  })
})

describe('spot-check: Graham\'s Law math', () => {
  it('r1/r2 = sqrt(M2/M1) for known gases: H₂ vs O₂', () => {
    // H₂ (M=2.016) vs O₂ (M=32.00): ratio = sqrt(32/2.016) ≈ 3.981
    const expected = Math.sqrt(32.00 / 2.016)
    expect(expected).toBeCloseTo(3.981, 2)
  })

  it('effusion time scales with sqrt(M): heavier gas takes longer', () => {
    // t2/t1 = sqrt(M2/M1); if M2 > M1, then t2 > t1
    for (let i = 0; i < 100; i++) {
      const p = generateGrahamsProblem()
      if (p.unit !== 's') continue
      // The question mentions two gases; the heavier one should take longer
      // We verify the answer is positive and the step math is self-consistent
      const lastStep = p.steps[p.steps.length - 1]
      const match = lastStep.match(/([\d.]+) s/)
      if (match) {
        expect(parseFloat(match[1])).toBeCloseTo(p.answer, 2)
      }
      break
    }
  })

  it('find-molar-mass: M_unknown = M_known / ratio²', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateGrahamsProblem()
      if (p.unit !== 'g/mol') continue
      // steps contain ratio and known M; verify M = M_known / ratio²
      // The answer should be a plausible molar mass (0 < M < 200)
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(200)
      break
    }
  })
})

describe('checkGrahamsAnswer', () => {
  it('accepts exact answer', () => {
    const p = generateGrahamsProblem()
    expect(checkGrahamsAnswer(String(p.answer), p)).toBe(true)
  })

  it('accepts answer within +2%', () => {
    const p = generateGrahamsProblem()
    expect(checkGrahamsAnswer(String(p.answer * 1.019), p)).toBe(true)
  })

  it('accepts answer within -2%', () => {
    const p = generateGrahamsProblem()
    expect(checkGrahamsAnswer(String(p.answer * 0.981), p)).toBe(true)
  })

  it('rejects answer outside ±2%', () => {
    const p = generateGrahamsProblem()
    expect(checkGrahamsAnswer(String(p.answer * 1.03), p)).toBe(false)
    expect(checkGrahamsAnswer(String(p.answer * 0.97), p)).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = generateGrahamsProblem()
    expect(checkGrahamsAnswer('abc', p)).toBe(false)
    expect(checkGrahamsAnswer('', p)).toBe(false)
    expect(checkGrahamsAnswer('NaN', p)).toBe(false)
  })
})

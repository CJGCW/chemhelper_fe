import { describe, it, expect } from 'vitest'
import { generateIsotopeProblem, generateIsotopeProblemOfType, checkIsotopeAnswer } from './isotopePractice'
import { TWO_ISOTOPE_ELEMENTS } from '../data/twoIsotopeElements'

const CL_IDX = TWO_ISOTOPE_ELEMENTS.findIndex(e => e.symbol === 'Cl')

describe('generateIsotopeProblemOfType — forward', () => {
  it('Cl forward: answer ≈ weighted average from given data', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    // 34.968853 × 0.7577 + 36.965903 × 0.2423 ≈ 35.453
    expect(p.answer).toBeCloseTo(35.453, 1)
    expect(p.answerUnit).toBe('amu')
    expect(p.type).toBe('forward')
  })

  it('Cl forward: steps include formula and result', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(p.steps[0]).toMatch(/Ā.*Σ/)
    expect(p.steps[p.steps.length - 1]).toMatch(/amu/)
  })

  it('Cl forward: question includes both isotope symbols', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(p.question).toMatch(/³⁵Cl/)
    expect(p.question).toMatch(/³⁷Cl/)
  })

  it('B forward: answer ≈ 10.811 amu', () => {
    const bIdx = TWO_ISOTOPE_ELEMENTS.findIndex(e => e.symbol === 'B')
    const p = generateIsotopeProblemOfType('forward', bIdx)
    expect(p.answer).toBeCloseTo(10.811, 1)
  })
})

describe('generateIsotopeProblemOfType — reverse', () => {
  it('Cl reverse: ³⁵Cl abundance ≈ 75.77%', () => {
    const p = generateIsotopeProblemOfType('reverse', CL_IDX)
    expect(p.answer).toBeCloseTo(75.77, 0)
    expect(p.answerUnit).toBe('%')
    expect(p.type).toBe('reverse')
  })

  it('Cl reverse: steps include check line', () => {
    const p = generateIsotopeProblemOfType('reverse', CL_IDX)
    expect(p.steps.some(s => s.includes('✓'))).toBe(true)
  })

  it('Li reverse: ⁶Li abundance ≈ 7.59%', () => {
    const liIdx = TWO_ISOTOPE_ELEMENTS.findIndex(e => e.symbol === 'Li')
    const p = generateIsotopeProblemOfType('reverse', liIdx)
    expect(p.answer).toBeCloseTo(7.59, 0)
  })

  it('Br reverse: ⁷⁹Br abundance ≈ 50.69%', () => {
    const brIdx = TWO_ISOTOPE_ELEMENTS.findIndex(e => e.symbol === 'Br')
    const p = generateIsotopeProblemOfType('reverse', brIdx)
    expect(p.answer).toBeCloseTo(50.69, 0)
  })
})

describe('checkIsotopeAnswer', () => {
  it('accepts exact correct answer', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(checkIsotopeAnswer(String(p.answer), p)).toBe(true)
  })

  it('accepts answer within 1% tolerance', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(checkIsotopeAnswer(String(p.answer * 1.009), p)).toBe(true)
  })

  it('rejects answer outside 1% tolerance', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(checkIsotopeAnswer(String(p.answer * 1.05), p)).toBe(false)
  })

  it('rejects NaN input', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(checkIsotopeAnswer('abc', p)).toBe(false)
  })

  it('rejects empty input', () => {
    const p = generateIsotopeProblemOfType('forward', CL_IDX)
    expect(checkIsotopeAnswer('', p)).toBe(false)
  })
})

describe('generateIsotopeProblem — random 25 runs', () => {
  it('correct answer always passes its own checker', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateIsotopeProblem()
      expect(checkIsotopeAnswer(String(p.answer), p)).toBe(true)
    }
  })

  it('all problems have a non-empty steps array', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateIsotopeProblem()
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('forward answers are in reasonable amu range (1–210)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateIsotopeProblemOfType('forward')
      expect(p.answer).toBeGreaterThan(1)
      expect(p.answer).toBeLessThan(210)
    }
  })

  it('reverse answers are valid percentages (0–100)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateIsotopeProblemOfType('reverse')
      expect(p.answer).toBeGreaterThanOrEqual(0)
      expect(p.answer).toBeLessThanOrEqual(100)
    }
  })
})

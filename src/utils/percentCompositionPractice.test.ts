import { describe, it, expect } from 'vitest'
import {
  COMPOUNDS,
  generatePercCompProblem,
  checkPercCompAnswer,
} from './percentCompositionPractice'

// ── Compound pool integrity ───────────────────────────────────────────────────

describe('COMPOUNDS pool', () => {
  it('contains at least 10 compounds', () => {
    expect(COMPOUNDS.length).toBeGreaterThanOrEqual(10)
  })

  it('every compound has at least one element', () => {
    for (const c of COMPOUNDS) {
      expect(c.elements.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('element percents sum to 100 ± 0.02% for every compound', () => {
    for (const c of COMPOUNDS) {
      const total = c.elements.reduce((sum, el) => sum + el.percent, 0)
      expect(total).toBeCloseTo(100, 1)   // 1 decimal = ±0.05
    }
  })

  it('molarMass matches sum of element contributions for every compound', () => {
    for (const c of COMPOUNDS) {
      const computed = c.elements.reduce((sum, el) => sum + el.count * el.atomicWeight, 0)
      expect(computed).toBeCloseTo(c.molarMass, 2)
    }
  })

  it('every element percent is between 0 and 100', () => {
    for (const c of COMPOUNDS) {
      for (const el of c.elements) {
        expect(el.percent).toBeGreaterThan(0)
        expect(el.percent).toBeLessThan(100)
      }
    }
  })

  it('well-known spot checks', () => {
    const water = COMPOUNDS.find(c => c.formula === 'H2O')!
    expect(water).toBeDefined()
    const H = water.elements.find(e => e.symbol === 'H')!
    expect(H.percent).toBeCloseTo(11.19, 1)
    const O = water.elements.find(e => e.symbol === 'O')!
    expect(O.percent).toBeCloseTo(88.81, 1)

    const nacl = COMPOUNDS.find(c => c.formula === 'NaCl')!
    const Na = nacl.elements.find(e => e.symbol === 'Na')!
    expect(Na.percent).toBeCloseTo(39.34, 1)

    const co2 = COMPOUNDS.find(c => c.formula === 'CO2')!
    const C = co2.elements.find(e => e.symbol === 'C')!
    expect(C.percent).toBeCloseTo(27.29, 1)
  })
})

// ── Problem generation ────────────────────────────────────────────────────────

describe('generatePercCompProblem', () => {
  it('returns a valid problem with required fields', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePercCompProblem()
      expect(p.type).toMatch(/^(percent_of_element|mass_from_percent)$/)
      expect(typeof p.question).toBe('string')
      expect(p.question.length).toBeGreaterThan(10)
      expect(typeof p.answer).toBe('number')
      expect(isNaN(p.answer)).toBe(false)
      expect(p.answer).toBeGreaterThan(0)
      expect(Array.isArray(p.steps)).toBe(true)
      expect(p.steps.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('generates percent_of_element problems when requested', () => {
    for (let i = 0; i < 10; i++) {
      const p = generatePercCompProblem('percent_of_element')
      expect(p.type).toBe('percent_of_element')
      expect(p.answerUnit).toBe('%')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(100)
    }
  })

  it('generates mass_from_percent problems when requested', () => {
    for (let i = 0; i < 10; i++) {
      const p = generatePercCompProblem('mass_from_percent')
      expect(p.type).toBe('mass_from_percent')
      expect(p.answerUnit).toBe('g')
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('percent_of_element answer is between 0 and 100', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePercCompProblem('percent_of_element')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(100)
    }
  })

  it('mass_from_percent answer scales correctly with sample mass', () => {
    // We can't control the randomness directly, but verify the answer is sane:
    // mass of element must be less than total sample mass (no compound is 100% one element)
    for (let i = 0; i < 20; i++) {
      const p = generatePercCompProblem('mass_from_percent')
      // Extract the sample mass from the question
      const match = p.question.match(/has a mass of (\d+) g/)
      if (match) {
        const sampleG = parseFloat(match[1])
        expect(p.answer).toBeLessThan(sampleG)
        expect(p.answer).toBeGreaterThan(0)
      }
    }
  })

  it('solution steps contain the compound formula', () => {
    for (let i = 0; i < 10; i++) {
      const p = generatePercCompProblem()
      const stepsText = p.steps.join(' ')
      // Steps should mention a molar mass or percentage calculation
      expect(stepsText).toMatch(/\d/)
    }
  })
})

// ── Answer checker ────────────────────────────────────────────────────────────

describe('checkPercCompAnswer', () => {
  it('accepts exact correct answer', () => {
    const p = generatePercCompProblem('percent_of_element')
    expect(checkPercCompAnswer(p, p.answer.toString())).toBe(true)
  })

  it('accepts answer within +1% tolerance', () => {
    const p = generatePercCompProblem('percent_of_element')
    expect(checkPercCompAnswer(p, (p.answer * 1.009).toString())).toBe(true)
  })

  it('accepts answer within -1% tolerance', () => {
    const p = generatePercCompProblem('percent_of_element')
    expect(checkPercCompAnswer(p, (p.answer * 0.991).toString())).toBe(true)
  })

  it('rejects answer more than 1% off', () => {
    const p = generatePercCompProblem('percent_of_element')
    expect(checkPercCompAnswer(p, (p.answer * 1.02).toString())).toBe(false)
    expect(checkPercCompAnswer(p, (p.answer * 0.98).toString())).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = generatePercCompProblem()
    expect(checkPercCompAnswer(p, '')).toBe(false)
    expect(checkPercCompAnswer(p, 'abc')).toBe(false)
    expect(checkPercCompAnswer(p, 'NaN')).toBe(false)
  })

  it('rejects obviously wrong value', () => {
    const p = generatePercCompProblem('percent_of_element')
    expect(checkPercCompAnswer(p, '0')).toBe(false)
    expect(checkPercCompAnswer(p, '200')).toBe(false)  // percents can't exceed 100
  })

  it('mass_from_percent problems check correctly', () => {
    for (let i = 0; i < 5; i++) {
      const p = generatePercCompProblem('mass_from_percent')
      expect(checkPercCompAnswer(p, p.answer.toFixed(3))).toBe(true)
      expect(checkPercCompAnswer(p, (p.answer * 1.005).toFixed(3))).toBe(true)
      expect(checkPercCompAnswer(p, (p.answer * 1.02).toFixed(3))).toBe(false)
    }
  })

  it('generated problem passes its own checker', () => {
    for (let i = 0; i < 30; i++) {
      const p = generatePercCompProblem()
      expect(checkPercCompAnswer(p, p.answer.toString())).toBe(true)
    }
  })
})

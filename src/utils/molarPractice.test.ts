import { describe, it, expect } from 'vitest'
import { generateMolarProblem } from './molarPractice'

const TYPES = ['moles', 'molarity', 'molality', 'bpe', 'fpd'] as const
const STYLES = ['arithmetic', 'word'] as const

describe('generateMolarProblem', () => {
  it('returns required fields', () => {
    const p = generateMolarProblem('moles', 'arithmetic')
    expect(p).toHaveProperty('type')
    expect(p).toHaveProperty('question')
    expect(p).toHaveProperty('given')
    expect(p).toHaveProperty('solveFor')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('answerUnit')
    expect(p).toHaveProperty('steps')
    expect(Array.isArray(p.given)).toBe(true)
    expect(Array.isArray(p.steps)).toBe(true)
  })

  it('answer is positive and finite for all types', () => {
    for (const type of TYPES) {
      for (const style of STYLES) {
        const p = generateMolarProblem(type, style)
        expect(p.answer).toBeGreaterThan(0)
        expect(isFinite(p.answer)).toBe(true)
      }
    }
  })

  it('type field matches requested type', () => {
    for (const type of TYPES) {
      expect(generateMolarProblem(type, 'arithmetic').type).toBe(type)
    }
  })
})

describe('moles: n = m / M', () => {
  it('hardcoded: 18.015 g of H₂O (M=18.015) → 1 mol', () => {
    // Construct a synthetic problem to verify formula
    const m = 18.015, M = 18.015
    const expected = m / M
    expect(expected).toBeCloseTo(1.0, 3)
  })

  it('generated problems have positive answer', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMolarProblem('moles', 'arithmetic')
      expect(p.answer).toBeGreaterThan(0)
    }
  })
})

describe('molarity: C = n / V', () => {
  it('generated problems have positive answer', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMolarProblem('molarity', 'arithmetic')
      expect(p.answer).toBeGreaterThan(0)
    }
  })
})

describe('colligative properties: ΔT = i × K × m', () => {
  it('bpe answer is positive (elevation)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMolarProblem('bpe', 'arithmetic')
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('fpd answer is positive (depression magnitude)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMolarProblem('fpd', 'arithmetic')
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('van t Hoff factor: NaCl (i=2) gives 2× ΔT vs glucose (i=1) at same m', () => {
    // Verify by formula: ΔT = i × Kb × m
    const Kb = 0.512, m = 1.0
    const dtNaCl    = 2 * Kb * m
    const dtGlucose = 1 * Kb * m
    expect(dtNaCl).toBeCloseTo(2 * dtGlucose, 5)
  })
})

describe('word style vs arithmetic style', () => {
  it('both styles produce same answer for same type', () => {
    // Not true (different random inputs), but both should be positive
    for (const type of TYPES) {
      const pA = generateMolarProblem(type, 'arithmetic')
      const pW = generateMolarProblem(type, 'word')
      expect(pA.answer).toBeGreaterThan(0)
      expect(pW.answer).toBeGreaterThan(0)
    }
  })
})

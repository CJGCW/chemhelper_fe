import { describe, it, expect } from 'vitest'
import {
  genDilutionProblem,
  checkDilutionAnswer,
  type DilutionProblem,
} from './dilutionPractice'

// ── Shape invariants ──────────────────────────────────────────────────────────

describe('genDilutionProblem – shape invariants', () => {
  const subtypes = ['find_c2', 'find_v2', 'find_v1'] as const

  subtypes.forEach(subtype => {
    it(`${subtype}: 20 runs all have required fields`, () => {
      for (let i = 0; i < 20; i++) {
        const p = genDilutionProblem(subtype)
        expect(p.subtype).toBe(subtype)
        expect(typeof p.question).toBe('string')
        expect(p.question.length).toBeGreaterThan(0)
        expect(p.given.length).toBeGreaterThanOrEqual(3)
        expect(Number.isFinite(p.answer)).toBe(true)
        expect(p.answer).toBeGreaterThan(0)
        expect(p.steps.length).toBeGreaterThanOrEqual(3)
        expect(p.answerUnit).toBeTruthy()
        expect(p.solveFor).toBeTruthy()
        p.given.forEach(g => {
          expect(g.label).toBeTruthy()
          expect(g.value).toBeTruthy()
          expect(g.unit).toBeTruthy()
        })
      }
    })
  })
})

// ── C₁V₁ = C₂V₂ mathematical consistency ──────────────────────────────────

describe('genDilutionProblem – C₁V₁ = C₂V₂ consistency', () => {
  it('find_c2: C₁V₁ = C₂V₂ holds within 0.1%', () => {
    for (let i = 0; i < 20; i++) {
      const p = genDilutionProblem('find_c2')
      const c1 = parseFloat(p.given.find(g => g.label === 'C₁')!.value)
      const v1 = parseFloat(p.given.find(g => g.label === 'V₁')!.value)
      const v2 = parseFloat(p.given.find(g => g.label === 'V₂')!.value)
      const c2 = p.answer
      expect(Math.abs(c1 * v1 - c2 * v2) / (c1 * v1)).toBeLessThan(0.001)
    }
  })

  it('find_v2: C₁V₁ = C₂V₂ holds within 0.1%', () => {
    for (let i = 0; i < 20; i++) {
      const p = genDilutionProblem('find_v2')
      const c1 = parseFloat(p.given.find(g => g.label === 'C₁')!.value)
      const v1 = parseFloat(p.given.find(g => g.label === 'V₁')!.value)
      const c2 = parseFloat(p.given.find(g => g.label === 'C₂')!.value)
      const v2 = p.answer
      expect(Math.abs(c1 * v1 - c2 * v2) / (c1 * v1)).toBeLessThan(0.001)
    }
  })

  it('find_v1: C₁V₁ = C₂V₂ holds within 0.1%', () => {
    for (let i = 0; i < 20; i++) {
      const p = genDilutionProblem('find_v1')
      const c1 = parseFloat(p.given.find(g => g.label === 'C₁')!.value)
      const c2 = parseFloat(p.given.find(g => g.label === 'C₂')!.value)
      const v2 = parseFloat(p.given.find(g => g.label === 'V₂')!.value)
      const v1 = p.answer
      expect(Math.abs(c1 * v1 - c2 * v2) / (c2 * v2)).toBeLessThan(0.001)
    }
  })
})

// ── checkDilutionAnswer ──────────────────────────────────────────────────────

function mockProblem(answer: number): DilutionProblem {
  return {
    subtype: 'find_c2',
    question: 'test',
    given: [],
    solveFor: 'C₂',
    answer,
    answerUnit: 'mol/L',
    steps: [],
  }
}

describe('checkDilutionAnswer', () => {
  it('exact answer passes', () => {
    expect(checkDilutionAnswer('1.000', mockProblem(1.000))).toBe(true)
  })

  it('±1.5% passes', () => {
    expect(checkDilutionAnswer('1.015', mockProblem(1.000))).toBe(true)
    expect(checkDilutionAnswer('0.985', mockProblem(1.000))).toBe(true)
  })

  it('±3% fails', () => {
    expect(checkDilutionAnswer('1.031', mockProblem(1.000))).toBe(false)
    expect(checkDilutionAnswer('0.969', mockProblem(1.000))).toBe(false)
  })

  it('non-numeric string fails', () => {
    expect(checkDilutionAnswer('abc', mockProblem(1.000))).toBe(false)
  })

  it('empty string fails', () => {
    expect(checkDilutionAnswer('', mockProblem(1.000))).toBe(false)
  })
})

// ── Self-consistency ──────────────────────────────────────────────────────────

describe('self-consistency: generated answer always passes', () => {
  const subtypes = ['find_c2', 'find_v2', 'find_v1'] as const

  subtypes.forEach(subtype => {
    it(`${subtype}: answer passes its own checker`, () => {
      for (let i = 0; i < 20; i++) {
        const p = genDilutionProblem(subtype)
        expect(checkDilutionAnswer(String(p.answer), p)).toBe(true)
      }
    })
  })
})

// ── Dilution direction ─────────────────────────────────────────────────────

describe('find_c2: concentration always decreases on dilution', () => {
  it('answer (C₂) < C₁ when V₂ > V₁', () => {
    for (let i = 0; i < 20; i++) {
      const p = genDilutionProblem('find_c2')
      const c1 = parseFloat(p.given.find(g => g.label === 'C₁')!.value)
      const v1 = parseFloat(p.given.find(g => g.label === 'V₁')!.value)
      const v2 = parseFloat(p.given.find(g => g.label === 'V₂')!.value)
      if (v2 > v1) {
        expect(p.answer).toBeLessThan(c1)
      }
    }
  })
})

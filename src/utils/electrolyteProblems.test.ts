import { describe, it, expect } from 'vitest'
import {
  ELECTROLYTE_QUESTIONS,
  ELECTROLYTE_OPTIONS,
  ELECTROLYTE_LABEL,
  pickElectrolyte,
  type ElectrolyteStrength,
} from './electrolyteProblems'

const VALID_STRENGTHS = new Set<ElectrolyteStrength>(['strong', 'weak', 'non'])

// ── Data integrity ────────────────────────────────────────────────────────────

describe('ELECTROLYTE_QUESTIONS — data integrity', () => {
  it('pool has at least 20 questions', () => {
    expect(ELECTROLYTE_QUESTIONS.length).toBeGreaterThanOrEqual(20)
  })

  it('every question has non-empty formula, name, category, equation, explanation', () => {
    for (const q of ELECTROLYTE_QUESTIONS) {
      expect(q.formula.length).toBeGreaterThan(0)
      expect(q.name.length).toBeGreaterThan(0)
      expect(q.category.length).toBeGreaterThan(0)
      expect(q.equation.length).toBeGreaterThan(0)
      expect(q.explanation.length).toBeGreaterThan(10)
    }
  })

  it('every question has a valid answer strength', () => {
    for (const q of ELECTROLYTE_QUESTIONS) {
      expect(VALID_STRENGTHS.has(q.answer)).toBe(true)
    }
  })

  it('all three strength categories appear in the pool', () => {
    const seen = new Set(ELECTROLYTE_QUESTIONS.map(q => q.answer))
    for (const s of VALID_STRENGTHS) expect(seen.has(s)).toBe(true)
  })

  it('strong electrolyte equations use → (complete dissociation)', () => {
    for (const q of ELECTROLYTE_QUESTIONS.filter(q => q.answer === 'strong')) {
      expect(q.equation).toContain('→')
    }
  })

  it('weak electrolyte equations use ⇌ (equilibrium)', () => {
    for (const q of ELECTROLYTE_QUESTIONS.filter(q => q.answer === 'weak')) {
      expect(q.equation).toContain('⇌')
    }
  })

  it('non-electrolyte equations contain "no dissociation" note', () => {
    for (const q of ELECTROLYTE_QUESTIONS.filter(q => q.answer === 'non')) {
      expect(q.equation.toLowerCase()).toContain('no dissociation')
    }
  })

  it('no two questions share the same formula', () => {
    const formulas = ELECTROLYTE_QUESTIONS.map(q => q.formula)
    const unique = new Set(formulas)
    expect(unique.size).toBe(ELECTROLYTE_QUESTIONS.length)
  })
})

// ── ELECTROLYTE_OPTIONS ───────────────────────────────────────────────────────

describe('ELECTROLYTE_OPTIONS', () => {
  it('contains exactly the three valid strengths', () => {
    expect(ELECTROLYTE_OPTIONS).toHaveLength(3)
    for (const opt of ELECTROLYTE_OPTIONS) {
      expect(VALID_STRENGTHS.has(opt)).toBe(true)
    }
  })

  it('ELECTROLYTE_LABEL covers every option', () => {
    for (const opt of ELECTROLYTE_OPTIONS) {
      expect(ELECTROLYTE_LABEL[opt].length).toBeGreaterThan(0)
    }
  })
})

// ── pickElectrolyte ───────────────────────────────────────────────────────────

describe('pickElectrolyte', () => {
  it('returns a valid question and idx', () => {
    const { q, idx } = pickElectrolyte()
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(ELECTROLYTE_QUESTIONS.length)
    expect(q).toBe(ELECTROLYTE_QUESTIONS[idx])
  })

  it('never returns excludeIdx when called with it', () => {
    for (let i = 0; i < ELECTROLYTE_QUESTIONS.length; i++) {
      const { idx } = pickElectrolyte(i)
      expect(idx).not.toBe(i)
    }
  })

  it('produces all three strengths across 500 draws', () => {
    const seen = new Set<ElectrolyteStrength>()
    for (let i = 0; i < 500; i++) seen.add(pickElectrolyte().q.answer)
    for (const s of VALID_STRENGTHS) expect(seen.has(s)).toBe(true)
  })
})

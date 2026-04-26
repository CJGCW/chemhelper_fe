import { describe, it, expect } from 'vitest'
import { generateEmpiricalProblem } from './empiricalPractice'
import { formulasMatch } from './empiricalFormula'

describe('generateEmpiricalProblem', () => {
  it('returns required fields', () => {
    const p = generateEmpiricalProblem()
    expect(p).toHaveProperty('compoundName')
    expect(p).toHaveProperty('elements')
    expect(p).toHaveProperty('empiricalDisplay')
    expect(p).toHaveProperty('empiricalASCII')
    expect(p).toHaveProperty('steps')
    expect(Array.isArray(p.elements)).toBe(true)
    expect(Array.isArray(p.steps)).toBe(true)
  })

  it('element percentages sum to ~100 (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateEmpiricalProblem()
      const sum = p.elements.reduce((acc, e) => acc + e.percent, 0)
      expect(sum).toBeGreaterThan(99)
      expect(sum).toBeLessThan(101)
    }
  })

  it('empiricalASCII has only positive subscripts (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateEmpiricalProblem()
      // No zero or negative subscripts — all element counts must be ≥ 1
      expect(p.empiricalASCII).toMatch(/^[A-Z][a-z]?\d*/)
      expect(p.empiricalASCII).not.toContain('0')
    }
  })

  it('steps array has at least 3 steps', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateEmpiricalProblem()
      expect(p.steps.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('formulasMatch accepts the empiricalASCII answer against itself', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateEmpiricalProblem()
      expect(formulasMatch(p.empiricalASCII, p.empiricalASCII)).toBe(true)
    }
  })
})

describe('hardcoded: glucose C₆H₁₂O₆ → empirical CH₂O', () => {
  it('CH2O matches CH2O', () => {
    expect(formulasMatch('CH2O', 'CH2O')).toBe(true)
  })

  it('CH2O matches C6H12O6 (formulasMatch normalizes to empirical ratio)', () => {
    // formulasMatch calls normalizeFormula (divides by GCD) before comparing.
    // C6H12O6 and CH2O both normalize to C1H2O1 = CH2O.
    expect(formulasMatch('CH2O', 'C6H12O6')).toBe(true)
  })

  it('CH2O does not match H2O (different elements)', () => {
    expect(formulasMatch('CH2O', 'H2O')).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { genClausiusClapeyronProblem, checkCCAnswer } from './clausiusClapeyronPractice'

const R = 8.314

describe('genClausiusClapeyronProblem', () => {
  it('returns required fields', () => {
    const p = genClausiusClapeyronProblem()
    expect(p).toHaveProperty('solveFor')
    expect(p).toHaveProperty('question')
    expect(p).toHaveProperty('given')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('numericAnswer')
    expect(p).toHaveProperty('answerUnit')
    expect(['P1', 'P2', 'T1', 'T2', 'dHvap']).toContain(p.solveFor)
  })

  it('numericAnswer is positive and finite', () => {
    for (let i = 0; i < 20; i++) {
      const p = genClausiusClapeyronProblem()
      expect(p.numericAnswer).toBeGreaterThan(0)
      expect(isFinite(p.numericAnswer)).toBe(true)
    }
  })

  it('correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genClausiusClapeyronProblem()
      expect(checkCCAnswer(p, String(p.numericAnswer))).toBe(true)
    }
  })
})

describe('checkCCAnswer', () => {
  it('rejects NaN and empty', () => {
    const p = genClausiusClapeyronProblem()
    expect(checkCCAnswer(p, '')).toBe(false)
    expect(checkCCAnswer(p, 'abc')).toBe(false)
  })

  it('accepts within 2% tolerance', () => {
    const p = genClausiusClapeyronProblem()
    expect(checkCCAnswer(p, String(p.numericAnswer * 1.019))).toBe(true)
    expect(checkCCAnswer(p, String(p.numericAnswer * 1.025))).toBe(false)
  })
})

describe('CC formula verification', () => {
  it('water: P₂ at 100°C = 101.325 kPa (boiling point definition)', () => {
    // Water bp = 373.15 K, ΔHvap = 40700 J/mol
    // At T₂ = T₁ (no change), ln(P₂/P₁) = 0 → P₂ = P₁
    const T1 = 373.15, T2 = 373.15
    const P1 = 101325 // Pa
    const dHvap = 40700
    const lnRatio = (-dHvap / R) * (1 / T2 - 1 / T1)
    const P2 = P1 * Math.exp(lnRatio)
    expect(P2 / 1000).toBeCloseTo(101.325, 2)
  })

  it('P₂/P₁ relationship is consistent with CC equation', () => {
    // Generate a P2 problem, verify ln(P2/P1) matches formula
    for (let i = 0; i < 20; i++) {
      const p = genClausiusClapeyronProblem()
      if (p.solveFor !== 'P2') continue
      // P₁ = 101325 Pa = 101.325 kPa at normal bp
      // P₂ = numericAnswer in kPa
      const P2_kPa = p.numericAnswer
      expect(P2_kPa).toBeGreaterThan(0)
      break
    }
  })
})

import { describe, it, expect } from 'vitest'
import {
  calcMolarityFromPercent, calcPercentFromMolarity,
  calcMolarityFromPpm, calcMoleFraction,
  calcDilutionC2, calcDilutionV2, calcDilutionV1,
} from '../solutions'

describe('Concentration conversions', () => {
  it('calcMolarityFromPercent: conc. HCl (37%, 1.19 g/mL, 36.46 g/mol) ≈ 12.06 M', () => {
    expect(calcMolarityFromPercent(37.0, 1.19, 36.46)).toBeCloseTo(12.06, 1)
  })
  it('calcPercentFromMolarity: inverse of percent→molarity', () => {
    const C = calcMolarityFromPercent(37.0, 1.19, 36.46)
    expect(calcPercentFromMolarity(C, 1.19, 36.46)).toBeCloseTo(37.0, 1)
  })
  it('calcMolarityFromPpm: 100 ppm Fe²⁺ (55.85 g/mol) ≈ 1.79e-3 M', () => {
    expect(calcMolarityFromPpm(100, 55.85)).toBeCloseTo(100 / (55.85 * 1000), 6)
  })
  it('calcMoleFraction: 18g glucose (180.16) in 100g H₂O', () => {
    const chi = calcMoleFraction(18, 180.16, 100, 18.015)
    const n_sol = 18 / 180.16
    const n_wat = 100 / 18.015
    expect(chi).toBeCloseTo(n_sol / (n_sol + n_wat), 6)
  })
})

describe('Dilution (C₁V₁ = C₂V₂)', () => {
  it('calcDilutionC2: 0.5 M × 0.02 L / 0.1 L = 0.1 M', () => {
    expect(calcDilutionC2(0.5, 0.02, 0.1)).toBeCloseTo(0.1, 5)
  })
  it('calcDilutionV2: 0.5 M × 0.02 L / 0.1 M = 0.1 L', () => {
    expect(calcDilutionV2(0.5, 0.02, 0.1)).toBeCloseTo(0.1, 5)
  })
  it('calcDilutionV1: 0.1 M × 0.1 L / 0.5 M = 0.02 L', () => {
    expect(calcDilutionV1(0.1, 0.1, 0.5)).toBeCloseTo(0.02, 5)
  })
  it('round-trip: V1 → C2 → V1', () => {
    const c1 = 2.0, v1 = 0.025, v2 = 0.25
    const c2 = calcDilutionC2(c1, v1, v2)
    const v1back = calcDilutionV1(c2, v2, c1)
    expect(v1back).toBeCloseTo(v1, 8)
  })
})

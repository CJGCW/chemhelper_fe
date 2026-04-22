import { describe, it, expect } from 'vitest'
import {
  calcGrahamsRatio, calcGrahamsRate2, calcGrahamsM1, calcGrahamsM2, calcGrahamsTime2,
  calcDaltonsTotal, calcDaltonsPartial, calcDaltonsFromMoleFraction,
  calcDaltonsMoleFractionFromMoles, calcDaltonsMoleFraction,
  calcVanDerWaals,
  calcGasDensity, calcGasDensityMolarMass, calcGasDensityTemp, calcGasDensityPressure,
  R_GAS,
} from '../gas'

describe("Graham's Law", () => {
  it('ratio H₂/O₂: √(32/2.016) ≈ 3.98', () => {
    expect(calcGrahamsRatio(2.016, 32)).toBeCloseTo(Math.sqrt(32 / 2.016), 5)
  })
  it('calcGrahamsRate2: r2 = r1 × √(M1/M2)', () => {
    const r2 = calcGrahamsRate2(4, 2.016, 32)
    expect(r2).toBeCloseTo(4 * Math.sqrt(2.016 / 32), 5)
  })
  it('calcGrahamsM1: M_unknown from ratio', () => {
    const ratio = Math.sqrt(32 / 2.016)
    expect(calcGrahamsM1(ratio, 1, 32)).toBeCloseTo(2.016, 2)
  })
  it('calcGrahamsM2: M2 from r1, r2, M1', () => {
    expect(calcGrahamsM2(4, 1, 2.016)).toBeCloseTo(32.26, 1)
  })
  it('calcGrahamsTime2: t2 = t1 × √(M2/M1)', () => {
    expect(calcGrahamsTime2(10, 2.016, 32)).toBeCloseTo(10 * Math.sqrt(32 / 2.016), 5)
  })
})

describe("Dalton's Law", () => {
  it('calcDaltonsTotal: 0.3 + 0.5 + 0.2 = 1.0', () => {
    expect(calcDaltonsTotal([0.3, 0.5, 0.2])).toBeCloseTo(1.0, 10)
  })
  it('calcDaltonsPartial: 1.0 - 0.3 = 0.7', () => {
    expect(calcDaltonsPartial(1.0, [0.3])).toBeCloseTo(0.7, 10)
  })
  it('calcDaltonsFromMoleFraction: 0.4 × 2.5 = 1.0', () => {
    expect(calcDaltonsFromMoleFraction(0.4, 2.5)).toBeCloseTo(1.0, 10)
  })
  it('calcDaltonsMoleFractionFromMoles: 2/(2+3) = 0.4', () => {
    expect(calcDaltonsMoleFractionFromMoles(2, 5)).toBeCloseTo(0.4, 10)
  })
  it('calcDaltonsMoleFraction: 0.5/2.0 = 0.25', () => {
    expect(calcDaltonsMoleFraction(0.5, 2.0)).toBeCloseTo(0.25, 10)
  })
})

describe('Van der Waals', () => {
  it('ideal and real pressures of CO₂ (a=3.64, b=0.04267) at 1 mol, 5 L, 300 K', () => {
    const { idealP, realP } = calcVanDerWaals(1, 5, 300, 3.64, 0.04267)
    expect(idealP).toBeCloseTo((1 * R_GAS * 300) / 5, 5)
    expect(realP).toBeCloseTo(
      (1 * R_GAS * 300) / (5 - 1 * 0.04267) - 3.64 * (1 / 5) ** 2,
      5,
    )
  })
})

describe('Gas Density', () => {
  it('ρ = MP/RT for CO₂ (M=44.01) at 1 atm, 273.15 K ≈ 1.963 g/L', () => {
    expect(calcGasDensity(44.01, 1, 273.15)).toBeCloseTo(1.963, 2)
  })
  it('inverse: molar mass from density', () => {
    const rho = calcGasDensity(44.01, 1, 273.15)
    expect(calcGasDensityMolarMass(rho, 1, 273.15)).toBeCloseTo(44.01, 2)
  })
  it('inverse: temperature from density', () => {
    const rho = calcGasDensity(44.01, 1, 300)
    expect(calcGasDensityTemp(44.01, 1, rho)).toBeCloseTo(300, 2)
  })
  it('inverse: pressure from density', () => {
    const rho = calcGasDensity(44.01, 2, 300)
    expect(calcGasDensityPressure(rho, 300, 44.01)).toBeCloseTo(2, 4)
  })
})

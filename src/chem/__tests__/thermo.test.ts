import { describe, it, expect } from 'vitest'
import {
  calcHeatMcdt, calcMassMcdt, calcSHCMcdt, calcDeltaTMcdt,
  calcHeatCdt, calcHeatCapCdt, calcDeltaTCdt,
  calcCoffeeCupQrxn, calcBombQrxn,
  calcMixtureFinalTemp, calcEnthalpyOfReaction,
} from '../thermo'

describe('q = mcΔT', () => {
  it('calcHeatMcdt: q = 100g × 4.184 × 10°C = 4184 J', () => {
    expect(calcHeatMcdt(100, 4.184, 10)).toBeCloseTo(4184, 3)
  })
  it('calcMassMcdt: m = q / (c × ΔT)', () => {
    expect(calcMassMcdt(4184, 4.184, 10)).toBeCloseTo(100, 3)
  })
  it('calcSHCMcdt: c = q / (m × ΔT)', () => {
    expect(calcSHCMcdt(4184, 100, 10)).toBeCloseTo(4.184, 3)
  })
  it('calcDeltaTMcdt: ΔT = q / (m × c)', () => {
    expect(calcDeltaTMcdt(4184, 100, 4.184)).toBeCloseTo(10, 3)
  })
})

describe('q = CΔT', () => {
  it('calcHeatCdt: q = 500 J/°C × 5°C = 2500 J', () => {
    expect(calcHeatCdt(500, 5)).toBeCloseTo(2500, 3)
  })
  it('calcHeatCapCdt: C = q / ΔT', () => {
    expect(calcHeatCapCdt(2500, 5)).toBeCloseTo(500, 3)
  })
  it('calcDeltaTCdt: ΔT = q / C', () => {
    expect(calcDeltaTCdt(2500, 500)).toBeCloseTo(5, 3)
  })
})

describe('Coffee-cup calorimetry', () => {
  it('q_rxn = -(100 × 4.184 × (30 - 20)) = -4184 J', () => {
    expect(calcCoffeeCupQrxn(100, 4.184, 20, 30)).toBeCloseTo(-4184, 3)
  })
  it('endothermic reaction: temperature drops → positive q_rxn', () => {
    expect(calcCoffeeCupQrxn(100, 4.184, 25, 20)).toBeCloseTo(2092, 3)
  })
})

describe('Bomb calorimetry', () => {
  it('q_rxn = -(5 kJ/°C × 3°C) = -15 kJ', () => {
    expect(calcBombQrxn(5, 3)).toBeCloseTo(-15, 3)
  })
})

describe('calcMixtureFinalTemp', () => {
  it('100g Cu (c=0.385) at 95°C + 250g H₂O (c=4.184) at 22°C', () => {
    const Tf = calcMixtureFinalTemp(100, 0.385, 95, 250, 4.184, 22)
    expect(Tf).toBeCloseTo(24.6, 1)
  })
  it('equal masses of same substance: Tf = arithmetic mean', () => {
    const Tf = calcMixtureFinalTemp(100, 1, 80, 100, 1, 20)
    expect(Tf).toBeCloseTo(50, 5)
  })
})

describe('calcEnthalpyOfReaction', () => {
  it('formation of water: 2H₂ + O₂ → 2H₂O(l), ΔHf(H₂O) = -285.8 kJ/mol', () => {
    // ΔHrxn = 2(-285.8) - 0 = -571.6 kJ
    const dH = calcEnthalpyOfReaction(
      [{ coeff: 2, dhf: 0 }, { coeff: 1, dhf: 0 }],
      [{ coeff: 2, dhf: -285.8 }],
    )
    expect(dH).toBeCloseTo(-571.6, 1)
  })
})

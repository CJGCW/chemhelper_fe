import { describe, it, expect } from 'vitest'
import {
  calcHeatMcdt, calcMassMcdt, calcSHCMcdt, calcDeltaTMcdt,
  calcHeatCdt, calcHeatCapCdt, calcDeltaTCdt,
  calcCoffeeCupQrxn, calcBombQrxn,
  calcMixtureFinalTemp, calcEnthalpyOfReaction,
  heatOfSolution, heatOfNeutralization, deltaUtoDeltaH, expansionWork,
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

describe('heatOfSolution', () => {
  // Chang 6.78: 3.53 g NH₄NO₃ dissolved in 80.0 g water, T drops 21.6→18.1°C (ΔT = -3.5°C)
  // q_water = 80.0 × 4.184 × (-3.5) = -1171.52 J; q_rxn = +1171.52 J
  // n = 3.53 / 80.04 = 0.04410 mol; ΔH_soln = 1171.52 / 0.04410 / 1000 ≈ +26.6 kJ/mol
  it('Chang 6.78: NH₄NO₃ dissolution → +26.6 kJ/mol (endothermic)', () => {
    const result = heatOfSolution(3.53, 80.04, 80.0, 18.1 - 21.6)
    expect(result).toBeCloseTo(26.6, 0)
  })

  it('exothermic dissolution: negative ΔH_soln when temperature rises', () => {
    const result = heatOfSolution(2.0, 58.44, 100.0, 2.0)
    expect(result).toBeLessThan(0)
  })

  it('sign: temperature drop → positive ΔH_soln (endothermic)', () => {
    expect(heatOfSolution(1.0, 80.04, 100.0, -1.0)).toBeGreaterThan(0)
  })
})

describe('heatOfNeutralization', () => {
  // HCl + NaOH → H₂O: 50 mL × 0.1 M HCl + 50 mL × 0.1 M NaOH, ΔT = +0.635°C (≈ -56 kJ/mol typical)
  // q_soln = 100g × 4.184 × 0.635 = 265.67 J; q_rxn = -265.67 J
  // n_water = min(0.05×0.1/1, 0.05×0.1) = 0.005 mol
  // ΔH_neut = -265.67 / 0.005 / 1000 = -53.1 kJ/mol
  it('HCl + NaOH (1:1, equal volumes and molarity): negative ΔH_neut', () => {
    const result = heatOfNeutralization(50, 0.1, 50, 0.1, 1, 0.635)
    expect(result).toBeCloseTo(-53.1, 0)
  })

  it('sign: temperature rise from neutralization → negative ΔH_neut (exothermic)', () => {
    expect(heatOfNeutralization(50, 1.0, 50, 1.0, 1, 5.0)).toBeLessThan(0)
  })

  it('limiting reagent: uses min(mol_acid, mol_base)', () => {
    // 100 mL × 0.1 M acid vs 50 mL × 0.1 M base → base limits (0.005 mol)
    const limitedByBase = heatOfNeutralization(100, 0.1, 50, 0.1, 1, 0.5)
    // 150 g × 4.184 × 0.5 = 313.8 J; q_rxn = -313.8; n_water = 0.005 mol → -62.76 kJ/mol
    expect(limitedByBase).toBeCloseTo(-62.76, 0)
  })
})

describe('deltaUtoDeltaH', () => {
  // Chang 6.136: 2H₂(g) + O₂(g) → 2H₂O(l); ΔU = -571.6 kJ, Δn_gas = 0-3 = -3, T = 298.15 K
  // ΔH = -571.6 + (-3)(0.008314)(298.15) = -571.6 + (-7.436) ≈ -579.04 kJ
  it('Chang 6.136: ΔH = ΔU + Δn_gas·RT → -579.04 kJ', () => {
    const result = deltaUtoDeltaH(-571.6, -3, 298.15)
    expect(result).toBeCloseTo(-579.04, 1)
  })

  it('Δn = 0: ΔH = ΔU (no gas correction)', () => {
    expect(deltaUtoDeltaH(-100, 0, 298.15)).toBeCloseTo(-100, 5)
  })

  it('positive Δn_gas: ΔH > ΔU (gas expansion adds enthalpy)', () => {
    expect(deltaUtoDeltaH(-100, 2, 298.15)).toBeGreaterThan(-100)
  })
})

describe('expansionWork', () => {
  // Ethanol vaporisation at 78.3°C (351.45 K): 3.70 mol at 1 atm
  // V_final = nRT/P = 3.70 × 0.08206 × 351.45 / 1 ≈ 106.7 L; V_initial ≈ 0 L (liquid)
  // w = -(1 atm × 101325 Pa/atm)(106.7 L / 1000) ≈ -10,810 J
  it('ethanol vaporisation (3.70 mol, 78.3°C, 1 atm): w ≈ -10810 J', () => {
    const vFinalL = (3.70 * 0.08206 * 351.45)   // nRT/P in L
    const w = expansionWork(1, 0, vFinalL)
    expect(w).toBeCloseTo(-10810, -1)
  })

  it('expansion is negative (system does work)', () => {
    expect(expansionWork(1, 1, 5)).toBeLessThan(0)
  })

  it('compression is positive (surroundings do work on system)', () => {
    expect(expansionWork(1, 5, 1)).toBeGreaterThan(0)
  })

  it('zero ΔV: w = 0', () => {
    expect(expansionWork(2, 3, 3)).toBeCloseTo(0, 10)
  })

  it('unit check: 1 atm × 1 L expansion = -101.325 J', () => {
    expect(expansionWork(1, 0, 1)).toBeCloseTo(-101.325, 2)
  })
})

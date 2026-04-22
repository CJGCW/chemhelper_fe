import { describe, it, expect } from 'vitest'
import { limitingReagent, calcLimitingReagent, type ChemReaction } from '../stoich'

// Chang General Chemistry 10e, Example 3.15:
// 2 NH₃ + CO₂ → (NH₂)₂CO + H₂O
// Given: 637.2 g NH₃ and 1142 g CO₂
// NH₃ M = 17.03 g/mol  →  637.2 / 17.03 = 37.42 mol  →  ratio 37.42/2 = 18.71
// CO₂ M = 44.01 g/mol  →  1142 / 44.01 = 25.95 mol   →  ratio 25.95/1 = 25.95
// Limiting: NH₃ (smaller ratio = 18.71)
// mol urea = 18.71 × (1/1) = 18.71 mol  (urea coeff = 1, limiting coeff = 2)

describe('limitingReagent – Chang example 3.15', () => {
  const NH3_M  = 17.03
  const CO2_M  = 44.01
  const UREA_M = 60.06
  const H2O_M  = 18.02

  const result = limitingReagent(
    [
      { coeff: 2, molarMass: NH3_M,  amount: { value: 637.2, unit: 'g' } },
      { coeff: 1, molarMass: CO2_M,  amount: { value: 1142,  unit: 'g' } },
    ],
    [
      { coeff: 1, molarMass: UREA_M },
      { coeff: 1, molarMass: H2O_M  },
    ],
  )

  it('identifies NH₃ (index 0) as limiting', () => {
    expect(result.limitingIdx).toBe(0)
  })

  it('computes molPerCoeff ≈ 18.71', () => {
    expect(result.molPerCoeff).toBeCloseTo(18.71, 1)
  })

  it('computes mol NH₃ ≈ 37.42', () => {
    expect(result.mols[0]).toBeCloseTo(37.42, 1)
  })

  it('computes mol CO₂ ≈ 25.95', () => {
    expect(result.mols[1]).toBeCloseTo(25.95, 1)
  })

  it('computes excess CO₂ remaining ≈ 7.24 mol', () => {
    const molCO2Used = result.molPerCoeff * 1
    const molCO2Remaining = result.mols[1] - molCO2Used
    expect(result.excessMol[1]).toBeCloseTo(molCO2Remaining, 2)
  })

  it('computes urea yield ≈ 1124 g', () => {
    expect(result.productGrams[0]).toBeCloseTo(1124, 0)
  })

  it('limiting reactant has zero excess', () => {
    expect(result.excessMol[0]).toBe(0)
    expect(result.excessGrams[0]).toBe(0)
  })
})

describe('limitingReagent – mol inputs', () => {
  it('works with mol units', () => {
    // 2 H2 + O2 → 2 H2O; give 4 mol H2 and 3 mol O2
    // ratio H2: 4/2 = 2, ratio O2: 3/1 = 3 → H2 is limiting
    const res = limitingReagent(
      [
        { coeff: 2, molarMass: 2.016, amount: { value: 4, unit: 'mol' } },
        { coeff: 1, molarMass: 32.00, amount: { value: 3, unit: 'mol' } },
      ],
      [{ coeff: 2, molarMass: 18.015 }],
    )
    expect(res.limitingIdx).toBe(0)
    expect(res.molPerCoeff).toBeCloseTo(2, 5)
    expect(res.productMols[0]).toBeCloseTo(4, 5) // 2 × (2/2) = 2 mol/coeff × coeff 2 = 4
    expect(res.excessMol[1]).toBeCloseTo(1, 5)   // 3 - 2×1 = 1 mol O2 remaining
  })
})

describe('limitingReagent – single reactant', () => {
  it('handles decomposition (single reactant)', () => {
    // 2 H2O2 → 2 H2O + O2; 68.0 g H2O2 (M=34.01)
    // mol = 68.0/34.01 = 1.999 ≈ 2 mol; molPerCoeff = 2/2 = 1
    const res = limitingReagent(
      [{ coeff: 2, molarMass: 34.01, amount: { value: 68.0, unit: 'g' } }],
      [
        { coeff: 2, molarMass: 18.015 },
        { coeff: 1, molarMass: 32.00  },
      ],
    )
    expect(res.limitingIdx).toBe(0)
    expect(res.molPerCoeff).toBeCloseTo(1.0, 2)
    expect(res.productMols[0]).toBeCloseTo(2.0, 2) // water
    expect(res.productMols[1]).toBeCloseTo(1.0, 2) // O2
  })
})

describe('calcLimitingReagent – Chang example 3.15', () => {
  const rxn: ChemReaction = {
    equation: '2 NH₃ + CO₂ → (NH₂)₂CO + H₂O',
    reactants: [
      { formula: 'NH3',        coeff: 2, molarMass: 17.03, display: 'NH₃', name: 'ammonia' },
      { formula: 'CO2',        coeff: 1, molarMass: 44.01, display: 'CO₂', name: 'carbon dioxide' },
    ],
    products: [
      { formula: '(NH2)2CO',   coeff: 1, molarMass: 60.06, display: '(NH₂)₂CO', name: 'urea' },
      { formula: 'H2O',        coeff: 1, molarMass: 18.02, display: 'H₂O',      name: 'water' },
    ],
  }

  const sol = calcLimitingReagent(
    rxn,
    [{ val: 637.2, unit: 'g' }, { val: 1142, unit: 'g' }],
  )

  it('identifies NH₃ as limiting', () => {
    expect(sol.limitingSpecies?.display).toBe('NH₃')
  })

  it('produces urea yield ≈ 1124 g', () => {
    expect(sol.products[0].grams).toBeCloseTo(1124, 0)
  })

  it('reports CO₂ excess', () => {
    expect(sol.excess[0].species.display).toBe('CO₂')
    expect(sol.excess[0].remainingMol).toBeGreaterThan(0)
  })

  it('includes equation as first step', () => {
    expect(sol.steps[0]).toContain('NH₃')
  })
})

describe('limitingReagent – error cases', () => {
  it('throws on empty reactants', () => {
    expect(() => limitingReagent([], [])).toThrow()
  })

  it('throws on non-positive amount', () => {
    expect(() => limitingReagent(
      [{ coeff: 1, molarMass: 18.015, amount: { value: 0, unit: 'g' } }],
      [],
    )).toThrow()
  })
})

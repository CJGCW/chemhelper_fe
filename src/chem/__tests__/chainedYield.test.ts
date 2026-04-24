import { describe, it, expect } from 'vitest'
import { buildChainedYieldProblem, type YieldReaction } from '../chainedYield'

const FETIO3_RXN: YieldReaction = {
  name:      'Ilmenite process (Chang 3.91)',
  equation:  'FeTiO₃ + H₂SO₄ → TiO₂ + FeSO₄ + H₂O',
  reactants: [
    { formula: 'FeTiO3',  display: 'FeTiO₃',  coeff: 1, molarMass: 151.71 },
    { formula: 'H2SO4',   display: 'H₂SO₄',   coeff: 1, molarMass: 98.08  },
  ],
  products: [
    { formula: 'TiO2',    display: 'TiO₂',    coeff: 1, molarMass: 79.87  },
    { formula: 'FeSO4',   display: 'FeSO₄',   coeff: 1, molarMass: 151.91 },
    { formula: 'H2O',     display: 'H₂O',     coeff: 1, molarMass: 18.015 },
  ],
}

const LIN_RXN: YieldReaction = {
  name:      'Lithium nitride synthesis (Chang 3.93)',
  equation:  '6 Li + N₂ → 2 Li₃N',
  reactants: [
    { formula: 'Li', display: 'Li', coeff: 6, molarMass: 6.941 },
    { formula: 'N2', display: 'N₂', coeff: 1, molarMass: 28.014 },
  ],
  products: [
    { formula: 'Li3N', display: 'Li₃N', coeff: 2, molarMass: 34.830 },
  ],
}

describe('buildChainedYieldProblem', () => {

  it('Chang 3.91: TiO₂ from FeTiO₃ — 4 steps', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      8.00e3,
      massProductActual: 3.67e3,
      unit:              'kg',
    })
    expect(p.steps).toHaveLength(4)
  })

  it('Chang 3.91 step 1: moles of FeTiO₃ ≈ 52,730 mol', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      8.00e3,
      massProductActual: 3.67e3,
      unit:              'kg',
    })
    // 8,000,000 g / 151.71 g/mol ≈ 52,732 mol
    expect(p.steps[0].expectedAnswer).toBeCloseTo(52732, -2)
  })

  it('Chang 3.91 step 2: moles TiO₂ = moles FeTiO₃ (1:1 ratio)', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      8.00e3,
      massProductActual: 3.67e3,
      unit:              'kg',
    })
    expect(p.steps[1].expectedAnswer).toBeCloseTo(p.steps[0].expectedAnswer, 4)
  })

  it('Chang 3.91 step 3: theoretical mass TiO₂ ≈ 4211 kg', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      8.00e3,
      massProductActual: 3.67e3,
      unit:              'kg',
    })
    expect(p.steps[2].expectedAnswer).toBeCloseTo(4212, 0)   // 4211–4212 kg depending on exact MM
  })

  it('Chang 3.91 step 4: percent yield ≈ 87.2%', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      8.00e3,
      massProductActual: 3.67e3,
      unit:              'kg',
    })
    expect(p.steps[3].expectedAnswer).toBeCloseTo(87.1, 0)   // ≈87.1–87.2% depending on exact MM
  })

  it('percent yield ≤ 100 for realistic inputs', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      500,
      massProductActual: 200,
      unit:              'g',
    })
    expect(p.steps[3].expectedAnswer).toBeLessThanOrEqual(100)
    expect(p.steps[3].expectedAnswer).toBeGreaterThan(0)
  })

  it('round-trip: theoretical mass matches step 1 × molar mass', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      1000,
      massProductActual: 400,
      unit:              'g',
    })
    const moles     = p.steps[0].expectedAnswer
    const theoretical = moles * 79.87
    expect(p.steps[2].expectedAnswer).toBeCloseTo(theoretical, 3)
  })

  it('handles non-1:1 mole ratio (6 Li → 2 Li₃N gives ratio 2/6 = 1/3)', () => {
    const p = buildChainedYieldProblem({
      reaction:          LIN_RXN,
      reactantFormula:   'Li',
      productFormula:    'Li3N',
      massReactant:      100,
      massProductActual: 40,
      unit:              'g',
    })
    const molesLi   = p.steps[0].expectedAnswer
    const molesLi3N = p.steps[1].expectedAnswer
    expect(molesLi3N).toBeCloseTo(molesLi * (2 / 6), 6)
  })

  it('step ids are unique', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      1000,
      massProductActual: 400,
      unit:              'g',
    })
    const ids = p.steps.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('throws for unknown reactant formula', () => {
    expect(() => buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'XYZ',
      productFormula:    'TiO2',
      massReactant:      1000,
      massProductActual: 400,
      unit:              'g',
    })).toThrow(/not found/)
  })

  it('unit g: theoretical mass stays in grams (no /1000)', () => {
    const p = buildChainedYieldProblem({
      reaction:          FETIO3_RXN,
      reactantFormula:   'FeTiO3',
      productFormula:    'TiO2',
      massReactant:      151.71,   // exactly 1 mol FeTiO3
      massProductActual: 50,
      unit:              'g',
    })
    // 1 mol FeTiO3 → 1 mol TiO2 → 79.87 g theoretical
    expect(p.steps[2].expectedAnswer).toBeCloseTo(79.87, 1)
  })

})

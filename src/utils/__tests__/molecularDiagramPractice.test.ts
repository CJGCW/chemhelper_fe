import { describe, it, expect } from 'vitest'
import {
  generateMolecularDiagramProblem,
  REACTION_TYPES,
} from '../molecularDiagramPractice'
import { limitingReagent } from '../../chem/stoich'

// ── Reaction type integrity ───────────────────────────────────────────────────

describe('REACTION_TYPES', () => {
  it('all types have positive integer coefficients', () => {
    for (const t of REACTION_TYPES) {
      expect(t.coeffA).toBeGreaterThan(0)
      expect(t.coeffB).toBeGreaterThan(0)
      expect(t.coeffProduct).toBeGreaterThan(0)
      expect(Number.isInteger(t.coeffA)).toBe(true)
      expect(Number.isInteger(t.coeffB)).toBe(true)
    }
  })

  it('all types have a non-empty product label', () => {
    for (const t of REACTION_TYPES) {
      expect(t.productLabel.length).toBeGreaterThan(0)
    }
  })
})

// ── Problem shape ─────────────────────────────────────────────────────────────

describe('generateMolecularDiagramProblem shape', () => {
  it('returns required fields', () => {
    const p = generateMolecularDiagramProblem()
    expect(typeof p.equation).toBe('string')
    expect(p.reactantA.label).toBe('A')
    expect(p.reactantB.label).toBe('B')
    expect(typeof p.productLabel).toBe('string')
    expect(p.limiting === 'A' || p.limiting === 'B').toBe(true)
    expect(Number.isInteger(p.productCount)).toBe(true)
    expect(Number.isInteger(p.excessA)).toBe(true)
    expect(Number.isInteger(p.excessB)).toBe(true)
    expect(typeof p.layoutSeed).toBe('number')
  })

  it('reactant counts stay within [2, 12]', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      expect(p.reactantA.count).toBeGreaterThanOrEqual(2)
      expect(p.reactantA.count).toBeLessThanOrEqual(12)
      expect(p.reactantB.count).toBeGreaterThanOrEqual(2)
      expect(p.reactantB.count).toBeLessThanOrEqual(12)
    }
  })
})

// ── Limiting reagent correctness ──────────────────────────────────────────────

describe('limiting reagent calculation is correct (50 runs)', () => {
  it('limiting is the reactant with the smaller n/coeff ratio', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      const ratioA = p.reactantA.count / p.coeffs.A
      const ratioB = p.reactantB.count / p.coeffs.B
      const expected: 'A' | 'B' = ratioA < ratioB ? 'A' : 'B'
      expect(p.limiting).toBe(expected)
    }
  })

  it('productCount matches floor(limiting_count / limiting_coeff) × product_coeff', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      const limCount = p.limiting === 'A' ? p.reactantA.count : p.reactantB.count
      const limCoeff = p.limiting === 'A' ? p.coeffs.A       : p.coeffs.B
      const expected = Math.floor(limCount / limCoeff) * p.coeffs.product
      expect(p.productCount).toBe(expected)
    }
  })

  it('excess counts are always non-negative', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      expect(p.excessA).toBeGreaterThanOrEqual(0)
      expect(p.excessB).toBeGreaterThanOrEqual(0)
    }
  })

  it('limiting reactant always has zero excess', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      if (p.limiting === 'A') expect(p.excessA).toBe(0)
      if (p.limiting === 'B') expect(p.excessB).toBe(0)
    }
  })

  it('excess reactant consumption is consistent (exact integer arithmetic)', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      const timesRxn = p.productCount / p.coeffs.product  // exact since productCount = timesRxn*coeff
      if (p.limiting === 'A') {
        const consumedB = timesRxn * p.coeffs.B
        expect(p.excessB).toBe(p.reactantB.count - consumedB)
      } else {
        const consumedA = timesRxn * p.coeffs.A
        expect(p.excessA).toBe(p.reactantA.count - consumedA)
      }
    }
  })
})

// ── Non-trivial generation guarantees ────────────────────────────────────────

describe('generation constraints', () => {
  it('never generates a problem with 0 products', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      expect(p.productCount).toBeGreaterThanOrEqual(1)
    }
  })

  it('never generates perfect stoichiometry (both excess = 0)', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMolecularDiagramProblem()
      // At least one reactant must have excess
      expect(p.excessA + p.excessB).toBeGreaterThan(0)
    }
  })

  it('produces varied equations across 50 runs', () => {
    const equations = new Set(
      Array.from({ length: 50 }, () => generateMolecularDiagramProblem().equation)
    )
    expect(equations.size).toBeGreaterThanOrEqual(2)
  })

  it('produces both A and B as limiting across 40 runs', () => {
    const limiters = new Set(
      Array.from({ length: 40 }, () => generateMolecularDiagramProblem().limiting)
    )
    expect(limiters.has('A')).toBe(true)
    expect(limiters.has('B')).toBe(true)
  })

  it('layoutSeed is always a positive integer', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMolecularDiagramProblem()
      expect(p.layoutSeed).toBeGreaterThan(0)
      expect(Number.isInteger(p.layoutSeed)).toBe(true)
    }
  })
})

// ── Spot-check verbatim cases ────────────────────────────────────────────────

describe('verbatim cases from Chang Ch 3 problem shapes', () => {
  it('2A+B→A₂B: A=6, B=4 — limiting A, product 3, excess B 1', () => {
    // Chang 3.81-style: 6 A + 4 B with 2A+B→A₂B
    // ratioA = 6/2 = 3, ratioB = 4/1 = 4 → A is limiting
    // product = 3*1 = 3; excessB = 4 - 3*1 = 1
    const nums = limitingReagent(
      [
        { coeff: 2, molarMass: 1, amount: { value: 6, unit: 'mol' } },
        { coeff: 1, molarMass: 1, amount: { value: 4, unit: 'mol' } },
      ],
      [{ coeff: 1, molarMass: 1 }],
    )
    expect(nums.limitingIdx).toBe(0)
    expect(Math.round(nums.productMols[0])).toBe(3)
    expect(Math.round(nums.excessMol[0])).toBe(0)
    expect(Math.round(nums.excessMol[1])).toBe(1)
  })

  it('A+2B→AB₂: A=5, B=6 — limiting B, product 3, excess A 2', () => {
    // ratioA = 5/1 = 5, ratioB = 6/2 = 3 → B is limiting
    // product = 3*1 = 3; excessA = 5 - 3*1 = 2
    const nums = limitingReagent(
      [
        { coeff: 1, molarMass: 1, amount: { value: 5, unit: 'mol' } },
        { coeff: 2, molarMass: 1, amount: { value: 6, unit: 'mol' } },
      ],
      [{ coeff: 1, molarMass: 1 }],
    )
    expect(nums.limitingIdx).toBe(1)
    expect(Math.round(nums.productMols[0])).toBe(3)
    expect(Math.round(nums.excessMol[0])).toBe(2)
    expect(Math.round(nums.excessMol[1])).toBe(0)
  })
})

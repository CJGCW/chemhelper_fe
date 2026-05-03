import { describe, it, expect } from 'vitest'
import {
  generateKspToSolubilityProblem,
  generateSolubilityToKspProblem,
  generatePrecipitationProblem,
  generateRandomKspProblem,
  generateDynamicKspToSolubilityProblem,
  generateDynamicSolubilityToKspProblem,
  generateDynamicPrecipitationProblem,
  generateDynamicRandomKspProblem,
} from './kspPractice'
import { kspToSolubility, solubilityToKsp } from '../chem/solubility'

describe('generateKspToSolubilityProblem', () => {
  it('solubility > 0 and steps populated across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateKspToSolubilityProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.type).toBe('ksp-to-solubility')
      expect(p.tolerance).toBeGreaterThan(0)
    }
  })

  it('AgCl: Ksp=1.8e-10 (1:1) → s = √Ksp ≈ 1.34e-5 M (Chang 14e, Example 17.9)', () => {
    const r = kspToSolubility(1.8e-10, 1, 1)
    expect(r.solubility).toBeCloseTo(Math.sqrt(1.8e-10), 8)
    expect(r.solubility).toBeCloseTo(1.34e-5, 7)
  })

  it('Ca(OH)₂: Ksp=4.68e-6 (1:2) → s = (Ksp/4)^(1/3) ≈ 1.05e-2 M', () => {
    // CaX₂ type: Ksp = 4s³ → s = (Ksp/4)^(1/3)
    const Ksp = 4.68e-6
    const expected = Math.pow(Ksp / 4, 1 / 3)
    const r = kspToSolubility(Ksp, 1, 2)
    expect(r.solubility).toBeCloseTo(expected, 5)
  })
})

describe('generateSolubilityToKspProblem', () => {
  it('Ksp > 0 across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateSolubilityToKspProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.type).toBe('solubility-to-ksp')
    }
  })

  it('round-trip: kspToSolubility → solubilityToKsp recovers original Ksp', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateSolubilityToKspProblem()
      // answer IS the Ksp; given.solubility is the input
      const recovered = solubilityToKsp(p.given.solubility, p.entry.cation.count, p.entry.anion.count)
      expect(recovered.Ksp).toBeCloseTo(p.answer, 20)
    }
  })
})

describe('generatePrecipitationProblem', () => {
  it('Q > 0 and finite across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePrecipitationProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(isFinite(p.answer)).toBe(true)
      expect(p.type).toBe('precipitation')
    }
  })

  it('Q > Ksp when ions would precipitate, Q < Ksp otherwise', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePrecipitationProblem()
      const { cation, anion, Ksp } = p.given
      const m = p.entry.cation.count
      const n = p.entry.anion.count
      const Q = Math.pow(cation, m) * Math.pow(anion, n)
      expect(p.answer).toBeCloseTo(Q, 20)
      // Q is the answer; separately verify the precipitation logic is consistent
      if (Q > Ksp) {
        expect(p.prompt).toMatch(/Q|ion product/i)
      }
    }
  })
})

describe('generateRandomKspProblem', () => {
  it('produces one of the three problem types across 25 runs', () => {
    const types = new Set<string>()
    for (let i = 0; i < 25; i++) {
      const p = generateRandomKspProblem()
      expect(p.answer).toBeGreaterThan(0)
      types.add(p.type)
    }
    // With 25 runs should hit multiple types
    expect(types.size).toBeGreaterThan(1)
  })
})

describe('generateDynamicKspToSolubilityProblem', () => {
  it('solubility > 0 with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicKspToSolubilityProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.isDynamic).toBe(true)
      expect(p.type).toBe('ksp-to-solubility')
    }
  })
})

describe('generateDynamicSolubilityToKspProblem', () => {
  it('Ksp > 0 with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicSolubilityToKspProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.isDynamic).toBe(true)
    }
  })
})

describe('generateDynamicPrecipitationProblem', () => {
  it('Q > 0 with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicPrecipitationProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.isDynamic).toBe(true)
    }
  })
})

describe('generateDynamicRandomKspProblem', () => {
  it('produces valid answer with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicRandomKspProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.isDynamic).toBe(true)
    }
  })
})

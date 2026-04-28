import { describe, it, expect } from 'vitest'
import { combustionAnalysis } from '../chem/empirical'
import { generateCombustionProblem } from './combustionAnalysisPractice'

// ── Chang Example 3.9 — Ethanol (C₂H₆O, M = 46.07) ─────────────────────────
// Combustion of 11.5 g ethanol → 22.0 g CO₂ + 13.5 g H₂O

describe('combustionAnalysis — Chang Example 3.9 (ethanol)', () => {
  const sol = combustionAnalysis({ massSample: 11.5, massCO2: 22.0, massH2O: 13.5 })

  it('massC ≈ 6.00 g', () => {
    expect(sol.massC).toBeCloseTo(6.003, 1)
  })

  it('massH ≈ 1.51 g', () => {
    expect(sol.massH).toBeCloseTo(1.511, 1)
  })

  it('massO ≈ 3.99 g (by difference)', () => {
    expect(sol.massO).toBeCloseTo(3.986, 1)
  })

  it('empirical formula = C₂H₆O', () => {
    expect(sol.empiricalFormula).toBe('C₂H₆O')
  })

  it('steps array is non-empty', () => {
    expect(sol.steps.length).toBeGreaterThan(5)
  })
})

describe('combustionAnalysis — Chang Example 3.9 with molar mass (molecular formula)', () => {
  const sol = combustionAnalysis({ massSample: 11.5, massCO2: 22.0, massH2O: 13.5, molarMass: 46.07 })

  it('molecular formula = C₂H₆O', () => {
    expect(sol.molecularFormula).toBe('C₂H₆O')
  })

  it('steps include molecular formula line', () => {
    const last = sol.steps[sol.steps.length - 1]
    expect(last).toContain('C₂H₆O')
  })
})

// ── Hydrocarbon — Methane (CH₄) ───────────────────────────────────────────────
// Combustion of 8.00 g CH₄ → CO₂ = 8.00 × (44.01/16.04) g, H₂O = 8.00 × 2 × (18.02/16.04) g

describe('combustionAnalysis — methane (CH₄, no oxygen)', () => {
  const M_CH4 = 16.04
  const massSample = 8.00
  const massCO2 = massSample * (44.01 / M_CH4)
  const massH2O = massSample * 2 * (18.02 / M_CH4)
  const sol = combustionAnalysis({ massSample, massCO2, massH2O })

  it('massO ≈ 0 (hydrocarbon)', () => {
    expect(sol.massO).toBeCloseTo(0, 2)
  })

  it('empirical formula = CH₄', () => {
    expect(sol.empiricalFormula).toBe('CH₄')
  })

  it('molesO = 0', () => {
    expect(sol.molesO).toBe(0)
  })
})

// ── Glucose (C₆H₁₂O₆) with molecular formula ─────────────────────────────────
// Empirical formula CH₂O, n = 6

describe('combustionAnalysis — glucose (C₆H₁₂O₆)', () => {
  // Use Chang Example 3.9 approach: compute exact masses from stoichiometry
  // M = 180.16, C₆H₁₂O₆ → empirical CH₂O (n=6)
  const M = 180.16
  const ms = 18.0
  const molesSample = ms / M
  const massCO2 = molesSample * 6 * 44.01
  const massH2O = molesSample * 6 * 18.02
  const sol = combustionAnalysis({ massSample: ms, massCO2, massH2O, molarMass: M })

  it('empirical formula = CH₂O', () => {
    expect(sol.empiricalFormula).toBe('CH₂O')
  })

  it('molecular formula = C₆H₁₂O₆', () => {
    expect(sol.molecularFormula).toBe('C₆H₁₂O₆')
  })
})

// ── Error case — C + H exceed sample mass ─────────────────────────────────────

describe('combustionAnalysis — error on impossible inputs', () => {
  it('throws when CO₂ + H₂O masses imply C+H > sample', () => {
    expect(() =>
      combustionAnalysis({ massSample: 1.0, massCO2: 50.0, massH2O: 30.0 })
    ).toThrow()
  })
})

// ── Generator correctness — 20 random problems ───────────────────────────────

describe('generateCombustionProblem — 20-iteration correctness', () => {
  it('every generated problem has valid empiricalFormula', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateCombustionProblem()
      expect(p.answerEmpirical).toMatch(/^[A-Z]/)
      expect(p.massSample).toBeGreaterThan(0)
      expect(p.massCO2).toBeGreaterThan(0)
      expect(p.massH2O).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.scenario.length).toBeGreaterThan(10)
    }
  })

  it('problems with molarMass include molecular formula', () => {
    let found = false
    for (let i = 0; i < 40; i++) {
      const p = generateCombustionProblem()
      if (p.molarMass !== undefined) {
        expect(p.answerMolecular).toBeTruthy()
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })

  it('problems without molarMass have no molecular formula', () => {
    let found = false
    for (let i = 0; i < 40; i++) {
      const p = generateCombustionProblem()
      if (p.molarMass === undefined) {
        expect(p.answerMolecular).toBeUndefined()
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})

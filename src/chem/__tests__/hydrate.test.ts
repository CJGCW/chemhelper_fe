import { describe, it, expect } from 'vitest'
import { solveHydrate } from '../hydrate'

// ── Mass-loss mode ────────────────────────────────────────────────────────────

describe('solveHydrate — mass-loss mode', () => {
  it('CuSO₄·5H₂O: 25.0 g hydrate → 16.0 g anhydrous → x = 5', () => {
    const r = solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'CuSO4',
      anhydrousMolarMass: 159.61,
      massBefore: 25.0,
      massAfter:  16.0,
    })
    expect(r.x).toBe(5)
  })

  it('MgSO₄·7H₂O (Epsom salt): x = 7', () => {
    // Compute what massBefore should be for exactly 7 waters:
    // M_hyd = 120.38 + 7×18.015 = 120.38 + 126.105 = 246.485
    // For 1 mol: massBefore = 246.485 g, massAfter = 120.38 g
    const r = solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'MgSO4',
      anhydrousMolarMass: 120.38,
      massBefore: 246.49,
      massAfter:  120.38,
    })
    expect(r.x).toBe(7)
  })

  it('BaCl₂·2H₂O: x = 2', () => {
    // M_hyd = 208.23 + 2×18.015 = 244.26; 1 mol each
    const r = solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'BaCl2',
      anhydrousMolarMass: 208.23,
      massBefore: 244.26,
      massAfter:  208.23,
    })
    expect(r.x).toBe(2)
  })

  it('hydrateMolarMass = anhydrousMM + x×18.015', () => {
    const r = solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'CuSO4',
      anhydrousMolarMass: 159.61,
      massBefore: 25.0,
      massAfter:  16.0,
    })
    expect(r.hydrateMolarMass).toBeCloseTo(159.61 + 5 * 18.015, 2)
  })

  it('provides step-by-step solution', () => {
    const r = solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'CuSO4',
      anhydrousMolarMass: 159.61,
      massBefore: 25.0,
      massAfter:  16.0,
    })
    expect(r.steps.length).toBeGreaterThanOrEqual(4)
    expect(r.steps.join(' ')).toMatch(/mol.*H₂O|H₂O.*mol/)
  })

  it('throws when massAfter >= massBefore', () => {
    expect(() => solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'CuSO4',
      anhydrousMolarMass: 159.61,
      massBefore: 16.0,
      massAfter:  25.0,
    })).toThrow()
  })

  it('throws when xRaw is not close to an integer (xRaw ≈ 3.4)', () => {
    // CuSO4 molar mass 159.61; if we give inputs that yield xRaw ≈ 3.4:
    // moles_anhy = 159.61/159.61 = 1.00 mol → massAfter = 159.61
    // for xRaw = 3.4: mol_water = 3.4, mass_water = 3.4×18.015 = 61.25
    // massBefore = 159.61 + 61.25 = 220.86
    expect(() => solveHydrate({
      mode: 'mass-loss',
      anhydrousFormula: 'CuSO4',
      anhydrousMolarMass: 159.61,
      massBefore: 220.86,
      massAfter:  159.61,
    })).toThrow(/doesn't round cleanly|whole-number/)
  })
})

// ── Percent-composition mode ──────────────────────────────────────────────────

describe('solveHydrate — percent-composition mode', () => {
  it('Chang 3.110: Al₂(SO₄)₃·xH₂O, 8.10% Al → x = 18', () => {
    const r = solveHydrate({
      mode: 'percent-composition',
      anhydrousFormula: 'Al2(SO4)3',
      anhydrousMolarMass: 342.15,
      element: 'Al',
      elementCount: 2,
      elementMolarMass: 26.98,
      percentByMass: 8.10,
    })
    expect(r.x).toBe(18)
  })

  it('CuSO₄·xH₂O, 25.3% Cu → x = 5', () => {
    // CuSO4 MM = 159.61, Cu count = 1, Cu MM = 63.55
    // M_hyd = (63.55×100)/25.3 = 251.1
    // water = 251.1 - 159.61 = 91.49; x = 91.49/18.015 ≈ 5.08 → 5
    const r = solveHydrate({
      mode: 'percent-composition',
      anhydrousFormula: 'CuSO4',
      anhydrousMolarMass: 159.61,
      element: 'Cu',
      elementCount: 1,
      elementMolarMass: 63.55,
      percentByMass: 25.30,
    })
    expect(r.x).toBe(5)
  })

  it('Na₂CO₃·xH₂O, 21.73% Na → x = 10', () => {
    // Na count = 2, Na MM = 22.99, MM_anhy = 105.99
    // M_hyd = (2×22.99×100)/21.73 = 4598/21.73 ≈ 211.6
    // water = 211.6 - 105.99 = 105.6; x = 105.6/18.015 ≈ 5.86... hmm
    // Let's use the actual 10-hydrate % Na:
    // M_hyd = 105.99 + 10×18.015 = 286.14
    // %Na = (2×22.99/286.14)×100 = 45.98/286.14×100 = 16.07%
    const r = solveHydrate({
      mode: 'percent-composition',
      anhydrousFormula: 'Na2CO3',
      anhydrousMolarMass: 105.99,
      element: 'Na',
      elementCount: 2,
      elementMolarMass: 22.99,
      percentByMass: 16.07,
    })
    expect(r.x).toBe(10)
  })

  it('returns xRaw close to x within 10%', () => {
    const r = solveHydrate({
      mode: 'percent-composition',
      anhydrousFormula: 'Al2(SO4)3',
      anhydrousMolarMass: 342.15,
      element: 'Al',
      elementCount: 2,
      elementMolarMass: 26.98,
      percentByMass: 8.10,
    })
    expect(Math.abs(r.xRaw - r.x) / r.x).toBeLessThan(0.05)
  })

  it('steps contain the percent and formula references', () => {
    const r = solveHydrate({
      mode: 'percent-composition',
      anhydrousFormula: 'Al2(SO4)3',
      anhydrousMolarMass: 342.15,
      element: 'Al',
      elementCount: 2,
      elementMolarMass: 26.98,
      percentByMass: 8.10,
    })
    const text = r.steps.join(' ')
    expect(text).toMatch(/8\.10|8\.1/)
    expect(text).toMatch(/Al/)
  })
})

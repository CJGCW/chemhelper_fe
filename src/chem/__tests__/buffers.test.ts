import { describe, it, expect } from 'vitest'
import { bufferPh, bufferCapacity, bufferAfterAddition } from '../buffers'
import { kspToSolubility, solubilityToKsp, willPrecipitate } from '../solubility'
import { computeTitrationCurve } from '../titrationCurve'

// ── bufferPh ──────────────────────────────────────────────────────────────────

describe('bufferPh', () => {
  it('Chang Ex 16.3: acetic acid buffer — pH = pKa when [A⁻] = [HA]', () => {
    // When [CH₃COO⁻] = [CH₃COOH], pH = pKa = 4.74
    const r = bufferPh(4.74, 0.10, 0.10)
    expect(r.pH).toBeCloseTo(4.74, 2)
    expect(r.steps.length).toBeGreaterThan(3)
  })

  it('buffer pH shifts up when [A⁻] > [HA]', () => {
    const r = bufferPh(4.74, 0.10, 0.20)
    expect(r.pH).toBeGreaterThan(4.74)
    expect(r.pH).toBeCloseTo(4.74 + Math.log10(2), 2)
  })

  it('buffer pH shifts down when [A⁻] < [HA]', () => {
    const r = bufferPh(4.74, 0.20, 0.10)
    expect(r.pH).toBeLessThan(4.74)
    expect(r.pH).toBeCloseTo(4.74 + Math.log10(0.5), 2)
  })

  it('throws on zero acid concentration', () => {
    expect(() => bufferPh(4.74, 0, 0.10)).toThrow()
  })

  it('throws on zero base concentration', () => {
    expect(() => bufferPh(4.74, 0.10, 0)).toThrow()
  })
})

// ── bufferAfterAddition ───────────────────────────────────────────────────────

describe('bufferAfterAddition', () => {
  it('adding strong acid lowers pH', () => {
    // 1 L of 0.10 M HA / 0.10 M A- buffer (pKa = 4.74)
    // Add 0.010 mol HCl: molA goes from 0.10 to 0.090, molHA from 0.10 to 0.110
    // new pH = 4.74 + log(0.090/0.110) = 4.74 - 0.087 = 4.653
    const r = bufferAfterAddition(0.10, 0.10, 1.0, 4.74, { type: 'acid', moles: 0.010 })
    expect(r.newPh).toBeCloseTo(4.65, 1)
    expect(r.newPh).toBeLessThan(4.74)
  })

  it('adding strong base raises pH', () => {
    const r = bufferAfterAddition(0.10, 0.10, 1.0, 4.74, { type: 'base', moles: 0.010 })
    expect(r.newPh).toBeGreaterThan(4.74)
  })

  it('throws when addition exceeds buffer capacity', () => {
    // Adding more moles of acid than there is A- in 1L of 0.10M A-
    expect(() => bufferAfterAddition(0.10, 0.10, 1.0, 4.74, { type: 'acid', moles: 0.15 })).toThrow()
  })
})

// ── bufferCapacity ────────────────────────────────────────────────────────────

describe('bufferCapacity', () => {
  it('returns positive acid and base capacities', () => {
    const r = bufferCapacity(0.10, 0.10, 1.0, 4.74)
    expect(r.acidCapacityMol).toBeGreaterThan(0)
    expect(r.baseCapacityMol).toBeGreaterThan(0)
  })

  it('capacity increases with volume', () => {
    const r1 = bufferCapacity(0.10, 0.10, 1.0, 4.74)
    const r2 = bufferCapacity(0.10, 0.10, 2.0, 4.74)
    expect(r2.acidCapacityMol).toBeGreaterThan(r1.acidCapacityMol)
    expect(r2.baseCapacityMol).toBeGreaterThan(r1.baseCapacityMol)
  })
})

// ── kspToSolubility ───────────────────────────────────────────────────────────

describe('kspToSolubility', () => {
  it('AgCl (1:1): Ksp = 1.8e-10 → s ≈ 1.34e-5 M', () => {
    const r = kspToSolubility(1.8e-10, 1, 1)
    // s = sqrt(1.8e-10) ≈ 1.342e-5
    expect(r.solubility).toBeCloseTo(1.342e-5, 8)
  })

  it('CaF₂ (1:2): Ksp = 3.9e-11 → s = (Ksp/4)^(1/3)', () => {
    const r = kspToSolubility(3.9e-11, 1, 2)
    const expected = Math.pow(3.9e-11 / 4, 1 / 3)
    expect(r.solubility).toBeCloseTo(expected, 10)
    // ≈ 2.14e-4 M (from Chang)
    expect(r.solubility).toBeCloseTo(2.14e-4, 6)
  })

  it('Fe(OH)₃ (1:3): Ksp = 4.0e-38 → s = (Ksp/27)^(1/4)', () => {
    const r = kspToSolubility(4.0e-38, 1, 3)
    const expected = Math.pow(4.0e-38 / 27, 1 / 4)
    expect(r.solubility).toBeCloseTo(expected, 42)
    expect(r.solubility).toBeGreaterThan(0)
  })

  it('Ag₂CrO₄ (2:1): Ksp = 1.2e-12 → s = (Ksp/4)^(1/3)', () => {
    const r = kspToSolubility(1.2e-12, 2, 1)
    const expected = Math.pow(1.2e-12 / 4, 1 / 3)
    expect(r.solubility).toBeCloseTo(expected, 14)
  })

  it('produces steps array with content', () => {
    const r = kspToSolubility(1.8e-10, 1, 1)
    expect(r.steps.length).toBeGreaterThan(3)
  })
})

// ── solubilityToKsp ───────────────────────────────────────────────────────────

describe('solubilityToKsp', () => {
  it('round-trips AgCl: s → Ksp → s', () => {
    const Ksp_in = 1.8e-10
    const { solubility } = kspToSolubility(Ksp_in, 1, 1)
    const { Ksp } = solubilityToKsp(solubility, 1, 1)
    expect(Ksp).toBeCloseTo(Ksp_in, 15)
  })

  it('round-trips CaF₂: s → Ksp → s', () => {
    const Ksp_in = 3.9e-11
    const { solubility } = kspToSolubility(Ksp_in, 1, 2)
    const { Ksp } = solubilityToKsp(solubility, 1, 2)
    expect(Ksp).toBeCloseTo(Ksp_in, 14)
  })
})

// ── willPrecipitate ───────────────────────────────────────────────────────────

describe('willPrecipitate', () => {
  it('Q < Ksp → no precipitate', () => {
    // AgCl: Ksp = 1.8e-10, [Ag+] = 1e-5, [Cl-] = 1e-6 → Q = 1e-11
    const r = willPrecipitate({ cation: 1e-5, anion: 1e-6 }, 1, 1, 1.8e-10)
    expect(r.Q).toBeCloseTo(1e-11, 15)
    expect(r.precipitates).toBe(false)
  })

  it('Q > Ksp → precipitate forms', () => {
    // AgCl: Ksp = 1.8e-10, [Ag+] = 1e-3, [Cl-] = 1e-3 → Q = 1e-6 >> Ksp
    const r = willPrecipitate({ cation: 1e-3, anion: 1e-3 }, 1, 1, 1.8e-10)
    expect(r.Q).toBeCloseTo(1e-6, 10)
    expect(r.precipitates).toBe(true)
  })

  it('Q exactly equals Ksp → no precipitate (boundary)', () => {
    const Ksp = 1.8e-10
    // For 1:1 salt: s = sqrt(Ksp), so Q = s^2 = Ksp → boundary
    const s = Math.sqrt(Ksp)
    const r = willPrecipitate({ cation: s, anion: s }, 1, 1, Ksp)
    expect(r.Q).toBeCloseTo(Ksp, 15)
    expect(r.precipitates).toBe(false)
  })

  it('produces steps with Q and Ksp comparison', () => {
    const r = willPrecipitate({ cation: 1e-3, anion: 1e-3 }, 1, 1, 1.8e-10)
    expect(r.steps.some(s => s.includes('Ksp'))).toBe(true)
  })
})

// ── computeTitrationCurve ─────────────────────────────────────────────────────

describe('computeTitrationCurve', () => {
  it('strong acid + strong base: equivalence pH = 7', () => {
    const r = computeTitrationCurve({
      analyte: { type: 'strong-acid', concentration: 0.100, volume: 25.0 },
      titrant: { type: 'strong-base', concentration: 0.100 },
    })
    expect(r.equivalencePH).toBeCloseTo(7.0, 1)
    expect(r.equivalenceVolume).toBeCloseTo(25.0, 2)
  })

  it('strong acid + strong base: initial pH is acidic', () => {
    const r = computeTitrationCurve({
      analyte: { type: 'strong-acid', concentration: 0.100, volume: 25.0 },
      titrant: { type: 'strong-base', concentration: 0.100 },
    })
    expect(r.initialPH).toBeLessThan(7)
    expect(r.initialPH).toBeCloseTo(1.0, 1)
  })

  it('weak acid + strong base: equivalence pH > 7', () => {
    // Acetic acid Ka = 1.8e-5
    const r = computeTitrationCurve({
      analyte: { type: 'weak-acid', concentration: 0.100, volume: 25.0, Ka: 1.8e-5 },
      titrant: { type: 'strong-base', concentration: 0.100 },
    })
    expect(r.equivalencePH).toBeGreaterThan(7)
    expect(r.equivalenceVolume).toBeCloseTo(25.0, 2)
  })

  it('weak acid + strong base: half-equivalence pH ≈ pKa', () => {
    const Ka = 1.8e-5
    const pKa = -Math.log10(Ka)  // ≈ 4.74 for acetic acid
    const r = computeTitrationCurve({
      analyte: { type: 'weak-acid', concentration: 0.100, volume: 25.0, Ka },
      titrant: { type: 'strong-base', concentration: 0.100 },
    })
    expect(r.halfEquivalencePH).toBeCloseTo(pKa, 2)
  })

  it('produces enough curve points', () => {
    const r = computeTitrationCurve({
      analyte: { type: 'strong-acid', concentration: 0.100, volume: 25.0 },
      titrant: { type: 'strong-base', concentration: 0.100 },
      resolution: 50,
    })
    expect(r.points.length).toBeGreaterThan(40)
  })

  it('strong base + strong acid: equivalence pH = 7', () => {
    const r = computeTitrationCurve({
      analyte: { type: 'strong-base', concentration: 0.100, volume: 25.0 },
      titrant: { type: 'strong-acid', concentration: 0.100 },
    })
    expect(r.equivalencePH).toBeCloseTo(7.0, 1)
  })

  it('weak base + strong acid: equivalence pH < 7', () => {
    // Ammonia Kb = 1.8e-5
    const r = computeTitrationCurve({
      analyte: { type: 'weak-base', concentration: 0.100, volume: 25.0, Kb: 1.8e-5 },
      titrant: { type: 'strong-acid', concentration: 0.100 },
    })
    expect(r.equivalencePH).toBeLessThan(7)
  })

  it('all pH values are in [0, 14]', () => {
    const r = computeTitrationCurve({
      analyte: { type: 'weak-acid', concentration: 0.100, volume: 25.0, Ka: 1.8e-5 },
      titrant: { type: 'strong-base', concentration: 0.100 },
    })
    for (const pt of r.points) {
      expect(pt.pH).toBeGreaterThanOrEqual(0)
      expect(pt.pH).toBeLessThanOrEqual(14)
    }
  })
})

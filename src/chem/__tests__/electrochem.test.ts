import { describe, it, expect } from 'vitest'
import { calcEcell, calcNernstE, calcDeltaGFromEcell, solveTriangle, solveFaraday, concentrationCellEmf } from '../electrochem'

describe('calcEcell', () => {
  it('E°cell = E°cathode − E°anode', () => {
    expect(calcEcell(+0.337, -0.763)).toBeCloseTo(1.100, 3)
  })
})

describe('calcNernstE', () => {
  it('E = E° − (0.05916/n)·log₁₀Q at Q=1 gives E = E°', () => {
    expect(calcNernstE(1.1, 2, 1)).toBeCloseTo(1.1, 5)
  })
  it('E at Q=100, n=2: reduction by (0.05916/2)×2 = 0.05916', () => {
    const E = calcNernstE(1.1, 2, 100)
    expect(E).toBeCloseTo(1.1 - (0.05916 / 2) * 2, 5)
  })
})

describe('calcDeltaGFromEcell', () => {
  it('ΔG° = −nFE° in kJ/mol: n=2, E°=1.1V → −nFE° = −212.3 kJ/mol', () => {
    const dG = calcDeltaGFromEcell(2, 1.1)
    expect(dG).toBeCloseTo(-(2 * 96485 * 1.1) / 1000, 1)
  })
  it('positive E° gives negative ΔG° (spontaneous)', () => {
    expect(calcDeltaGFromEcell(2, 1.1)).toBeLessThan(0)
  })
})

// ── solveTriangle ─────────────────────────────────────────────────────────────

describe('solveTriangle', () => {
  it('Zn/Cu cell: E°=1.10V, n=2 → ΔG°≈-212.3 kJ, log₁₀(K)≈37.2', () => {
    const r = solveTriangle({ type: 'Ecell', value: 1.10 }, 2, 298)
    expect(r.deltaG).toBeCloseTo(-212.3, 0)
    expect(Math.log10(r.K)).toBeCloseTo(37.2, 0)
  })

  it('from ΔG°: ΔG°=-100kJ, n=2 → E°≈0.518 V', () => {
    const r = solveTriangle({ type: 'deltaG', value: -100 }, 2, 298)
    // E° = -ΔG°/(nF) = 100000/(2*96485) ≈ 0.5182 V
    expect(r.Ecell).toBeCloseTo(0.5182, 2)
  })

  it('from K: K=1e10, n=2 → E°≈0.296 V', () => {
    const r = solveTriangle({ type: 'K', value: 1e10 }, 2, 298)
    // ln K = nFE°/RT → E° = RT ln K/(nF) = 8.314*298*ln(1e10)/(2*96485)
    const expected = (8.314 * 298 * Math.log(1e10)) / (2 * 96485)
    expect(r.Ecell).toBeCloseTo(expected, 3)
  })

  it('round-trip: E° → ΔG° → E° gives same E°', () => {
    const r1 = solveTriangle({ type: 'Ecell', value: 0.75 }, 2, 298)
    const r2 = solveTriangle({ type: 'deltaG', value: r1.deltaG }, 2, 298)
    expect(r2.Ecell).toBeCloseTo(0.75, 3)
  })

  it('E°>0 → ΔG°<0, K>1', () => {
    const r = solveTriangle({ type: 'Ecell', value: 1.5 }, 2, 298)
    expect(r.deltaG).toBeLessThan(0)
    expect(r.K).toBeGreaterThan(1)
  })

  it('steps array is populated', () => {
    const r = solveTriangle({ type: 'Ecell', value: 1.1 }, 2, 298)
    expect(r.steps.length).toBeGreaterThan(2)
  })
})

// ── solveFaraday ──────────────────────────────────────────────────────────────

describe('solveFaraday', () => {
  it('Chang Ex 18.8: Cu plating, I=3.00A, t=3600s, n=2 → mass≈3.56g', () => {
    const r = solveFaraday({ solveFor: 'mass', I: 3.00, t: 3600, M: 63.55, n: 2 })
    expect(r.answer).toBeCloseTo(3.56, 1)
    expect(r.unit).toBe('g')
  })

  it('solve for time: mass=5g Cu, I=2A', () => {
    const r = solveFaraday({ solveFor: 'time', mass: 5, I: 2, M: 63.55, n: 2 })
    // t = mass*n*F/(I*M) = 5*2*96485/(2*63.55)
    const expected = (5 * 2 * 96485) / (2 * 63.55)
    expect(r.answer).toBeCloseTo(expected, 0)
    expect(r.unit).toBe('s')
  })

  it('solve for current: mass=1g Ag, t=600s', () => {
    const r = solveFaraday({ solveFor: 'current', mass: 1, t: 600, M: 107.87, n: 1 })
    // I = mass*n*F/(t*M) = 1*1*96485/(600*107.87)
    const expected = (1 * 1 * 96485) / (600 * 107.87)
    expect(r.answer).toBeCloseTo(expected, 2)
    expect(r.unit).toBe('A')
  })

  it('mass=time=current=0 consistency: mass→time→mass round-trip', () => {
    const mass_ref = 2.0
    const I = 3.0
    const M = 63.55
    const n = 2
    const tResult = solveFaraday({ solveFor: 'time', mass: mass_ref, I, M, n })
    const mResult = solveFaraday({ solveFor: 'mass', I, t: tResult.answer, M, n })
    expect(mResult.answer).toBeCloseTo(mass_ref, 3)
  })

  it('steps array is non-empty', () => {
    const r = solveFaraday({ solveFor: 'mass', I: 1, t: 1000, M: 63.55, n: 2 })
    expect(r.steps.length).toBeGreaterThan(0)
  })
})

// ── concentrationCellEmf ──────────────────────────────────────────────────────

describe('concentrationCellEmf', () => {
  it('equal concentrations → E=0', () => {
    const r = concentrationCellEmf(0.10, 0.10, 2)
    expect(r.E).toBeCloseTo(0, 5)
  })

  it('10:1 ratio, n=2, 25°C → E≈0.02958 V', () => {
    const r = concentrationCellEmf(0.10, 0.01, 2)
    // E = (0.05916/2)*log10(0.10/0.01) = 0.02958 * 1 = 0.02958
    expect(r.E).toBeCloseTo(0.02958, 4)
  })

  it('100:1 ratio, n=1, 25°C → E≈0.11832 V', () => {
    const r = concentrationCellEmf(1.0, 0.01, 1)
    // E = (0.05916/1)*log10(100) = 0.05916*2 = 0.11832
    expect(r.E).toBeCloseTo(0.11832, 4)
  })

  it('swapping concentrations gives negative E (non-physical direction)', () => {
    const r = concentrationCellEmf(0.01, 0.10, 2)
    expect(r.E).toBeLessThan(0)
  })

  it('higher T increases EMF', () => {
    const r25  = concentrationCellEmf(1.0, 0.01, 2, 298)
    const r100 = concentrationCellEmf(1.0, 0.01, 2, 373)
    expect(r100.E).toBeGreaterThan(r25.E)
  })

  it('steps array is populated', () => {
    const r = concentrationCellEmf(1.0, 0.01, 2)
    expect(r.steps.length).toBeGreaterThan(2)
  })
})

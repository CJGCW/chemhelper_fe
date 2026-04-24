import { describe, it, expect } from 'vitest'
import { reverseIsotopeAbundance } from '../isotope'

describe('reverseIsotopeAbundance', () => {
  it('Chang 3.97: Ga isotopes from average 69.72', () => {
    const r = reverseIsotopeAbundance({
      averageMass: 69.72,
      isotopeMasses: [68.9256, 70.9247],
    })
    // Check math: a = (69.72 - 70.9247) / (68.9256 - 70.9247)
    const expected = (69.72 - 70.9247) / (68.9256 - 70.9247)
    expect(r.abundance1).toBeCloseTo(expected, 6)
    expect(r.abundance1).toBeCloseTo(0.603, 2)   // ≈ 60% for ⁶⁹Ga
    expect(r.abundance2).toBeCloseTo(1 - expected, 6)
  })

  it('Silver: ¹⁰⁷Ag ≈ 51.8%, ¹⁰⁹Ag ≈ 48.2%', () => {
    const r = reverseIsotopeAbundance({
      averageMass: 107.868,
      isotopeMasses: [106.905, 108.905],
    })
    expect(r.abundance1).toBeCloseTo(0.518, 2)
    expect(r.abundance2).toBeCloseTo(0.482, 2)
  })

  it('Chlorine: ³⁵Cl ≈ 75.77%', () => {
    const r = reverseIsotopeAbundance({
      averageMass: 35.453,
      isotopeMasses: [34.969, 36.966],
    })
    expect(r.abundance1).toBeCloseTo(0.757, 2)
  })

  it('abundances sum to 1.000 (float precision)', () => {
    const cases: [number, [number, number]][] = [
      [69.72,  [68.9256, 70.9247]],
      [107.868, [106.905, 108.905]],
      [35.453,  [34.969,  36.966]],
      [79.904,  [78.918,  80.916]],
    ]
    for (const [avg, masses] of cases) {
      const r = reverseIsotopeAbundance({ averageMass: avg, isotopeMasses: masses })
      expect(r.abundance1 + r.abundance2).toBeCloseTo(1.0, 10)
    }
  })

  it('computed average matches input average (round-trip)', () => {
    const r = reverseIsotopeAbundance({
      averageMass: 69.72,
      isotopeMasses: [68.9256, 70.9247],
    })
    const computed = r.abundance1 * 68.9256 + r.abundance2 * 70.9247
    expect(computed).toBeCloseTo(69.72, 4)
  })

  it('throws when average is outside isotope range', () => {
    expect(() => reverseIsotopeAbundance({
      averageMass: 100,
      isotopeMasses: [68.9, 70.9],
    })).toThrow(RangeError)

    expect(() => reverseIsotopeAbundance({
      averageMass: 60,
      isotopeMasses: [68.9, 70.9],
    })).toThrow(/outside the isotope range/)
  })

  it('throws when isotope masses are identical', () => {
    expect(() => reverseIsotopeAbundance({
      averageMass: 68.9,
      isotopeMasses: [68.9, 68.9],
    })).toThrow()
  })

  it('works regardless of isotope order (m1 > m2)', () => {
    const r1 = reverseIsotopeAbundance({
      averageMass: 69.72,
      isotopeMasses: [68.9256, 70.9247],
    })
    const r2 = reverseIsotopeAbundance({
      averageMass: 69.72,
      isotopeMasses: [70.9247, 68.9256],
    })
    // abundance1 in r2 corresponds to the heavier isotope, so values swap
    expect(r1.abundance1).toBeCloseTo(r2.abundance2, 6)
    expect(r1.abundance2).toBeCloseTo(r2.abundance1, 6)
  })

  it('provides step-by-step solution with check line', () => {
    const r = reverseIsotopeAbundance({
      averageMass: 69.72,
      isotopeMasses: [68.9256, 70.9247],
    })
    expect(r.steps.length).toBeGreaterThanOrEqual(5)
    expect(r.steps.join(' ')).toMatch(/Check|check|✓/)
    expect(r.steps.join(' ')).toMatch(/Abundance/)
  })
})

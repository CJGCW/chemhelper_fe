import { describe, expect, it } from 'vitest'
import {
  PROBLEMS, GEO_DISPLAY,
  molGeo, elecGeo, hybrid, bondAngles,
} from './vseprPractice'

// ── PROBLEMS data ─────────────────────────────────────────────────────────────

describe('PROBLEMS dataset', () => {
  it('contains at least 30 molecules', () => {
    expect(PROBLEMS.length).toBeGreaterThanOrEqual(30)
  })

  it('every entry has required fields', () => {
    for (const e of PROBLEMS) {
      expect(typeof e.formula).toBe('string')
      expect(typeof e.central).toBe('string')
      expect(typeof e.bonds).toBe('number')
      expect(typeof e.lonePairs).toBe('number')
      expect(typeof e.geometry).toBe('string')
      expect(typeof e.charge).toBe('number')
      expect(e.bonds).toBeGreaterThan(0)
      expect(e.lonePairs).toBeGreaterThanOrEqual(0)
    }
  })

  it('every geometry string resolves to a known display label', () => {
    for (const e of PROBLEMS) {
      const label = molGeo(e)
      expect(label).not.toBe(e.geometry) // should resolve to formatted label
      expect(Object.values(GEO_DISPLAY)).toContain(label)
    }
  })

  it('electron pair count is consistent with geometry type', () => {
    for (const e of PROBLEMS) {
      const d = e.bonds + e.lonePairs
      expect(d).toBeGreaterThanOrEqual(2)
      expect(d).toBeLessThanOrEqual(6)
    }
  })
})

// ── Chang-verbatim worked examples ───────────────────────────────────────────

describe('molecular geometry — Chang Table 10.1 examples', () => {
  const get = (formula: string) => PROBLEMS.find(p => p.formula === formula)!

  it('H₂O: bent, tetrahedral electron geo, sp³, ≈104.5°', () => {
    const e = get('H₂O')
    expect(molGeo(e)).toBe('Bent')
    expect(elecGeo(e)).toBe('Tetrahedral')
    expect(hybrid(e)).toBe('sp³')
    expect(bondAngles(e)).toBe('≈104.5°')
    expect(e.bonds).toBe(2)
    expect(e.lonePairs).toBe(2)
  })

  it('NH₃: trigonal pyramidal, tetrahedral electron geo, sp³, ≈107°', () => {
    const e = get('NH₃')
    expect(molGeo(e)).toBe('Trigonal Pyramidal')
    expect(elecGeo(e)).toBe('Tetrahedral')
    expect(hybrid(e)).toBe('sp³')
    expect(bondAngles(e)).toBe('≈107°')
    expect(e.bonds).toBe(3)
    expect(e.lonePairs).toBe(1)
  })

  it('CH₄: tetrahedral, tetrahedral electron geo, sp³, ≈109.5°', () => {
    const e = get('CH₄')
    expect(molGeo(e)).toBe('Tetrahedral')
    expect(elecGeo(e)).toBe('Tetrahedral')
    expect(hybrid(e)).toBe('sp³')
    expect(bondAngles(e)).toBe('≈109.5°')
    expect(e.bonds).toBe(4)
    expect(e.lonePairs).toBe(0)
  })

  it('CO₂: linear, linear electron geo, sp, 180°', () => {
    const e = get('CO₂')
    expect(molGeo(e)).toBe('Linear')
    expect(elecGeo(e)).toBe('Linear')
    expect(hybrid(e)).toBe('sp')
    expect(bondAngles(e)).toBe('180°')
  })

  it('BF₃: trigonal planar, sp²', () => {
    const e = get('BF₃')
    expect(molGeo(e)).toBe('Trigonal Planar')
    expect(elecGeo(e)).toBe('Trigonal Planar')
    expect(hybrid(e)).toBe('sp²')
    expect(bondAngles(e)).toBe('120°')
  })

  it('PCl₅: trigonal bipyramidal, sp³d', () => {
    const e = get('PCl₅')
    expect(molGeo(e)).toBe('Trigonal Bipyramidal')
    expect(elecGeo(e)).toBe('Trigonal Bipyramidal')
    expect(hybrid(e)).toBe('sp³d')
    expect(bondAngles(e)).toBe('90°, 120°')
  })

  it('SF₆: octahedral, sp³d²', () => {
    const e = get('SF₆')
    expect(molGeo(e)).toBe('Octahedral')
    expect(elecGeo(e)).toBe('Octahedral')
    expect(hybrid(e)).toBe('sp³d²')
    expect(bondAngles(e)).toBe('90°')
  })

  it('XeF₄: square planar, octahedral electron geo, sp³d²', () => {
    const e = get('XeF₄')
    expect(molGeo(e)).toBe('Square Planar')
    expect(elecGeo(e)).toBe('Octahedral')
    expect(hybrid(e)).toBe('sp³d²')
    expect(bondAngles(e)).toBe('90°')
    expect(e.lonePairs).toBe(2)
  })

  it('SO₂: bent from trigonal planar, sp², ≈120°', () => {
    const e = get('SO₂')
    expect(molGeo(e)).toBe('Bent')
    expect(elecGeo(e)).toBe('Trigonal Planar')
    expect(hybrid(e)).toBe('sp²')
    expect(bondAngles(e)).toBe('≈120°')
    expect(e.lonePairs).toBe(1)
  })

  it('SF₄: seesaw, trigonal bipyramidal electron geo, sp³d', () => {
    const e = get('SF₄')
    expect(molGeo(e)).toBe('See-Saw')
    expect(elecGeo(e)).toBe('Trigonal Bipyramidal')
    expect(hybrid(e)).toBe('sp³d')
    expect(bondAngles(e)).toBe('≈90°, ≈120°')
  })

  it('ClF₃: t-shaped, trigonal bipyramidal electron geo, sp³d', () => {
    const e = get('ClF₃')
    expect(molGeo(e)).toBe('T-Shaped')
    expect(elecGeo(e)).toBe('Trigonal Bipyramidal')
    expect(hybrid(e)).toBe('sp³d')
    expect(bondAngles(e)).toBe('90°, 180°')
  })

  it('XeF₂: linear from 5 domains, trigonal bipyramidal electron geo, sp³d', () => {
    const e = get('XeF₂')
    expect(molGeo(e)).toBe('Linear')
    expect(elecGeo(e)).toBe('Trigonal Bipyramidal')
    expect(hybrid(e)).toBe('sp³d')
    expect(bondAngles(e)).toBe('180°')
    expect(e.lonePairs).toBe(3)
  })

  it('BrF₅: square pyramidal, octahedral electron geo, sp³d²', () => {
    const e = get('BrF₅')
    expect(molGeo(e)).toBe('Square Pyramidal')
    expect(elecGeo(e)).toBe('Octahedral')
    expect(hybrid(e)).toBe('sp³d²')
    expect(bondAngles(e)).toBe('90°')
  })
})

// ── Combined: all PROBLEMS produce non-"?" answers ────────────────────────────

describe('all PROBLEMS produce valid derived values', () => {
  it('no molecule returns "?" for any property', () => {
    for (const e of PROBLEMS) {
      expect(elecGeo(e)).not.toBe('?')
      expect(hybrid(e)).not.toBe('?')
      expect(bondAngles(e)).not.toBe('?')
    }
  })

  it('lone-pair count matches declared lonePairs', () => {
    // bent with 1 LP has elecGeo Trigonal Planar, with 2 LP has elecGeo Tetrahedral
    const bentLP1 = PROBLEMS.filter(e => e.geometry === 'bent' && e.lonePairs === 1)
    const bentLP2 = PROBLEMS.filter(e => e.geometry === 'bent' && e.lonePairs === 2)
    bentLP1.forEach(e => expect(elecGeo(e)).toBe('Trigonal Planar'))
    bentLP2.forEach(e => expect(elecGeo(e)).toBe('Tetrahedral'))
  })
})

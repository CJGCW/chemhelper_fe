import { describe, it, expect } from 'vitest'
import { CATIONS, ANIONS, solLookup, buildFormula, SOL_LABEL, SOL_COLOR, SOL_BG } from './solubilityData'
import type { Sol } from './solubilityData'

const VALID_SOL: Sol[] = ['S', 'I', 'SS']

describe('CATIONS', () => {
  it('every cation has required string fields', () => {
    for (const c of CATIONS) {
      expect(c.id).toBeTruthy()
      expect(c.formula).toBeTruthy()
      expect(c.base).toBeTruthy()
      expect(c.name).toBeTruthy()
    }
  })

  it('every cation has a positive integer charge', () => {
    for (const c of CATIONS) {
      expect(Number.isInteger(c.charge)).toBe(true)
      expect(c.charge).toBeGreaterThan(0)
    }
  })

  it('cation ids are unique', () => {
    const ids = CATIONS.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('ANIONS', () => {
  it('every anion has required string fields', () => {
    for (const a of ANIONS) {
      expect(a.id).toBeTruthy()
      expect(a.formula).toBeTruthy()
      expect(a.base).toBeTruthy()
      expect(a.name).toBeTruthy()
    }
  })

  it('every anion has a negative integer charge', () => {
    for (const a of ANIONS) {
      expect(Number.isInteger(a.charge)).toBe(true)
      expect(a.charge).toBeLessThan(0)
    }
  })

  it('every anion has a boolean poly field', () => {
    for (const a of ANIONS) {
      expect(typeof a.poly).toBe('boolean')
    }
  })

  it('anion ids are unique', () => {
    const ids = ANIONS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('solLookup', () => {
  it('returns a valid Sol value and non-empty rule for every cation/anion pair', () => {
    for (const c of CATIONS) {
      for (const a of ANIONS) {
        const result = solLookup(c.id, a.id)
        expect(VALID_SOL).toContain(result.sol)
        expect(result.rule.length).toBeGreaterThan(0)
      }
    }
  })

  it('Group I cations are always soluble', () => {
    const g1 = CATIONS.filter(c => ['Li','Na','K'].includes(c.id))
    for (const c of g1) {
      for (const a of ANIONS) {
        expect(solLookup(c.id, a.id).sol).toBe('S')
      }
    }
  })

  it('NH4+ salts are always soluble', () => {
    for (const a of ANIONS) {
      expect(solLookup('NH4', a.id).sol).toBe('S')
    }
  })

  it('all nitrate salts are soluble', () => {
    for (const c of CATIONS) {
      expect(solLookup(c.id, 'NO3').sol).toBe('S')
    }
  })

  it('all perchlorate salts are soluble', () => {
    for (const c of CATIONS) {
      expect(solLookup(c.id, 'ClO4').sol).toBe('S')
    }
  })

  it('AgCl is insoluble', () => {
    expect(solLookup('Ag', 'Cl').sol).toBe('I')
  })

  it('BaSO4 is insoluble', () => {
    expect(solLookup('Ba', 'SO4').sol).toBe('I')
  })

  it('BaCl2 is soluble (not Ag/Pb/Hg2)', () => {
    expect(solLookup('Ba', 'Cl').sol).toBe('S')
  })

  it('most carbonates are insoluble (non-G1/NH4)', () => {
    expect(solLookup('Cu', 'CO3').sol).toBe('I')
    expect(solLookup('Fe2', 'CO3').sol).toBe('I')
  })

  it('handles unknown cation ids gracefully', () => {
    const result = solLookup('Unknown', 'Cl')
    expect(VALID_SOL).toContain(result.sol)
  })
})

describe('buildFormula', () => {
  it('produces a non-empty string for every cation/anion pair', () => {
    for (const c of CATIONS) {
      for (const a of ANIONS) {
        const f = buildFormula(c, a)
        expect(typeof f).toBe('string')
        expect(f.length).toBeGreaterThan(0)
      }
    }
  })

  it('NaCl formula is correct (1:1)', () => {
    const na = CATIONS.find(c => c.id === 'Na')!
    const cl = ANIONS.find(a => a.id === 'Cl')!
    expect(buildFormula(na, cl)).toBe('NaCl')
  })

  it('Ca(OH)2 formula is correct', () => {
    const ca  = CATIONS.find(c => c.id === 'Ca')!
    const oh  = ANIONS.find(a => a.id === 'OH')!
    expect(buildFormula(ca, oh)).toBe('Ca(OH)₂')
  })

  it('AlPO4 formula is correct (3:3 → 1:1)', () => {
    const al  = CATIONS.find(c => c.id === 'Al')!
    const po4 = ANIONS.find(a => a.id === 'PO4')!
    expect(buildFormula(al, po4)).toBe('AlPO₄')
  })
})

describe('SOL_LABEL / SOL_COLOR / SOL_BG', () => {
  it('covers all three Sol values', () => {
    for (const sol of VALID_SOL) {
      expect(SOL_LABEL[sol]).toBeTruthy()
      expect(SOL_COLOR[sol]).toBeTruthy()
      expect(SOL_BG[sol]).toBeTruthy()
    }
  })
})

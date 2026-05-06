import { describe, it, expect } from 'vitest'
import { BOND_DATA, BOND_CATEGORIES, lookupBond } from './bondEnthalpyData'

const BOND_KEY_PATTERN = /^[A-Za-z]+[-=≡][A-Za-z]+$/

describe('BOND_DATA', () => {
  it('has no duplicate bond keys', () => {
    const keys = BOND_DATA.map(b => b.bond)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })

  it('every entry has a positive energy in kJ/mol', () => {
    for (const entry of BOND_DATA) {
      expect(typeof entry.energy).toBe('number')
      expect(entry.energy).toBeGreaterThan(0)
      expect(entry.energy).toBeLessThan(2000)
    }
  })

  it('every bond key matches the X-Y / X=Y / X≡Y pattern', () => {
    for (const entry of BOND_DATA) {
      expect(entry.bond).toMatch(BOND_KEY_PATTERN)
    }
  })

  it('every entry has a non-empty category string', () => {
    for (const entry of BOND_DATA) {
      expect(typeof entry.category).toBe('string')
      expect(entry.category.length).toBeGreaterThan(0)
    }
  })

  it('contains at least one entry per expected element group', () => {
    const bonds = BOND_DATA.map(b => b.bond)
    expect(bonds.some(b => b.startsWith('C-H') || b.startsWith('H-'))).toBe(true)
    expect(bonds.some(b => b.includes('='))).toBe(true)
    expect(bonds.some(b => b.includes('≡'))).toBe(true)
  })

  it('higher-order bonds have higher energies for the same atom pair', () => {
    const cc  = BOND_DATA.find(b => b.bond === 'C-C')!
    const cc2 = BOND_DATA.find(b => b.bond === 'C=C')!
    const cc3 = BOND_DATA.find(b => b.bond === 'C≡C')!
    expect(cc.energy).toBeDefined()
    expect(cc2.energy).toBeGreaterThan(cc.energy)
    expect(cc3.energy).toBeGreaterThan(cc2.energy)
  })
})

describe('BOND_CATEGORIES', () => {
  it('contains only unique categories', () => {
    const unique = new Set(BOND_CATEGORIES)
    expect(unique.size).toBe(BOND_CATEGORIES.length)
  })

  it('every category in BOND_CATEGORIES appears in BOND_DATA', () => {
    const dataCategories = new Set(BOND_DATA.map(b => b.category))
    for (const cat of BOND_CATEGORIES) {
      expect(dataCategories.has(cat)).toBe(true)
    }
  })
})

describe('lookupBond', () => {
  it('returns the correct energy for known bonds', () => {
    expect(lookupBond('C-H')).toBe(413)
    expect(lookupBond('H-H')).toBe(432)
    expect(lookupBond('N≡N')).toBe(945)
    expect(lookupBond('O=O')).toBe(498)
  })

  it('returns undefined for unknown bonds', () => {
    expect(lookupBond('X-Y')).toBeUndefined()
    expect(lookupBond('Xe-Kr')).toBeUndefined()
    expect(lookupBond('')).toBeUndefined()
  })
})

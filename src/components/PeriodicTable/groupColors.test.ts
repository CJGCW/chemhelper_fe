import { describe, it, expect } from 'vitest'
import { getColorCategory, matchesSearch } from './groupColors'
import type { Element } from '../../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function el(overrides: Partial<Element>): Element {
  return {
    atomicNumber: 1,
    symbol: 'X',
    name: 'Unknown',
    atomicWeight: '1',
    electronegativity: 0,
    vanDerWaalsRadiusPm: 0,
    group: 1,
    period: 1,
    groupName: '',
    ...overrides,
  }
}

// ── getColorCategory ──────────────────────────────────────────────────────────

describe('getColorCategory', () => {
  it('hydrogen (Z=1)', () => {
    expect(getColorCategory(el({ atomicNumber: 1 }))).toBe('hydrogen')
  })

  it('alkali metals', () => {
    expect(getColorCategory(el({ atomicNumber: 3,  groupName: 'Alkali Metals' }))).toBe('alkali')
    expect(getColorCategory(el({ atomicNumber: 11, groupName: 'Alkali Metals' }))).toBe('alkali')
  })

  it('alkaline earth metals', () => {
    expect(getColorCategory(el({ atomicNumber: 4,  groupName: 'Alkaline Earth Metals' }))).toBe('alkaline')
    expect(getColorCategory(el({ atomicNumber: 20, groupName: 'Alkaline Earth Metals' }))).toBe('alkaline')
  })

  it('transition metals (groups 3–12)', () => {
    expect(getColorCategory(el({ atomicNumber: 26, group: 8, groupName: 'Metals' }))).toBe('transition')
    expect(getColorCategory(el({ atomicNumber: 29, group: 11, groupName: 'Metals' }))).toBe('transition')
  })

  it('post-transition metals (groups 13+)', () => {
    expect(getColorCategory(el({ atomicNumber: 13, group: 13, groupName: 'Metals' }))).toBe('post-transition')
    expect(getColorCategory(el({ atomicNumber: 82, group: 14, groupName: 'Metals' }))).toBe('post-transition')
  })

  // Metalloids — identified by atomic number, regardless of groupName
  it('boron (Z=5) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 5 }))).toBe('metalloid')
  })
  it('silicon (Z=14) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 14 }))).toBe('metalloid')
  })
  it('germanium (Z=32) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 32 }))).toBe('metalloid')
  })
  it('arsenic (Z=33) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 33 }))).toBe('metalloid')
  })
  it('antimony (Z=51) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 51 }))).toBe('metalloid')
  })
  it('tellurium (Z=52) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 52 }))).toBe('metalloid')
  })
  it('polonium (Z=84) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 84 }))).toBe('metalloid')
  })
  it('astatine (Z=85) is metalloid', () => {
    expect(getColorCategory(el({ atomicNumber: 85 }))).toBe('metalloid')
  })

  it('metalloid classification ignores groupName field', () => {
    // Even if API sends wrong groupName, Z-based lookup wins
    expect(getColorCategory(el({ atomicNumber: 14, groupName: 'Metals' }))).toBe('metalloid')
  })

  it('halogens', () => {
    expect(getColorCategory(el({ atomicNumber: 9,  groupName: 'Halogens' }))).toBe('halogen')
    expect(getColorCategory(el({ atomicNumber: 17, groupName: 'Halogens' }))).toBe('halogen')
    expect(getColorCategory(el({ atomicNumber: 35, groupName: 'Halogens' }))).toBe('halogen')
  })

  it('noble gases', () => {
    expect(getColorCategory(el({ atomicNumber: 2,  groupName: 'Noble Gases' }))).toBe('noble')
    expect(getColorCategory(el({ atomicNumber: 18, groupName: 'Noble Gases' }))).toBe('noble')
  })

  it('chalcogens', () => {
    expect(getColorCategory(el({ atomicNumber: 8,  groupName: 'Chalcogens' }))).toBe('chalcogen')
    expect(getColorCategory(el({ atomicNumber: 16, groupName: 'Chalcogens' }))).toBe('chalcogen')
  })

  it('lanthanides (Z 57–71)', () => {
    expect(getColorCategory(el({ atomicNumber: 57 }))).toBe('lanthanide')
    expect(getColorCategory(el({ atomicNumber: 71 }))).toBe('lanthanide')
  })

  it('actinides (Z 89–103)', () => {
    expect(getColorCategory(el({ atomicNumber: 89  }))).toBe('actinide')
    expect(getColorCategory(el({ atomicNumber: 103 }))).toBe('actinide')
  })

  it('unknown for unrecognised groupName', () => {
    expect(getColorCategory(el({ atomicNumber: 119, groupName: 'Synthetic' }))).toBe('unknown')
  })
})

// ── matchesSearch ─────────────────────────────────────────────────────────────

describe('matchesSearch', () => {
  const oxygen = el({ atomicNumber: 8, symbol: 'O', name: 'Oxygen' })

  it('returns true for empty query', () => {
    expect(matchesSearch(oxygen, '')).toBe(true)
  })

  it('matches by exact symbol (case-insensitive)', () => {
    expect(matchesSearch(oxygen, 'O')).toBe(true)
    expect(matchesSearch(oxygen, 'o')).toBe(true)
  })

  it('matches by symbol prefix', () => {
    const chlorine = el({ atomicNumber: 17, symbol: 'Cl', name: 'Chlorine' })
    expect(matchesSearch(chlorine, 'cl')).toBe(true)
    expect(matchesSearch(chlorine, 'C')).toBe(true) // 'Cl' starts with 'C' (case-insensitive)
    expect(matchesSearch(chlorine, 'clx')).toBe(false) // longer than symbol
  })

  it('matches by name substring', () => {
    expect(matchesSearch(oxygen, 'oxy')).toBe(true)
    expect(matchesSearch(oxygen, 'gen')).toBe(true)
    expect(matchesSearch(oxygen, 'OXYGEN')).toBe(true)
  })

  it('matches by exact atomic number', () => {
    expect(matchesSearch(oxygen, '8')).toBe(true)
  })

  it('does not match wrong atomic number', () => {
    expect(matchesSearch(oxygen, '9')).toBe(false)
  })

  it('does not match unrelated query', () => {
    expect(matchesSearch(oxygen, 'zz')).toBe(false)
  })

  it('matches multi-character symbol prefix', () => {
    const iron = el({ atomicNumber: 26, symbol: 'Fe', name: 'Iron' })
    expect(matchesSearch(iron, 'fe')).toBe(true)
    expect(matchesSearch(iron, 'Fe')).toBe(true)
  })

  it('name match is substring not prefix — "iron" in Einsteinium', () => {
    const es = el({ atomicNumber: 99, symbol: 'Es', name: 'Einsteinium' })
    expect(matchesSearch(es, 'einst')).toBe(true)
    expect(matchesSearch(es, 'ium')).toBe(true)
  })
})

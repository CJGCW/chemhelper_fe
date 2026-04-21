import { describe, it, expect } from 'vitest'
import { parseFormula, calcMolarMass } from '../species'
import { ATOMIC_MASSES } from '../constants'

describe('parseFormula', () => {
  it('parses simple formulas', () => {
    expect(parseFormula('H2O')).toEqual({ H: 2, O: 1 })
    expect(parseFormula('NaCl')).toEqual({ Na: 1, Cl: 1 })
    expect(parseFormula('CO2')).toEqual({ C: 1, O: 2 })
    expect(parseFormula('NH3')).toEqual({ N: 1, H: 3 })
  })

  it('handles single-atom formulas', () => {
    expect(parseFormula('Fe')).toEqual({ Fe: 1 })
    expect(parseFormula('O2')).toEqual({ O: 2 })
  })

  it('parses parentheses groups', () => {
    expect(parseFormula('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 })
    expect(parseFormula('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 })
    expect(parseFormula('Fe2(SO4)3')).toEqual({ Fe: 2, S: 3, O: 12 })
  })

  it('parses nested parentheses', () => {
    expect(parseFormula('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 })
  })

  it('handles multi-letter element symbols', () => {
    expect(parseFormula('C6H12O6')).toEqual({ C: 6, H: 12, O: 6 })
    expect(parseFormula('MgCl2')).toEqual({ Mg: 1, Cl: 2 })
    expect(parseFormula('Fe2O3')).toEqual({ Fe: 2, O: 3 })
  })

  it('normalises Unicode subscripts', () => {
    expect(parseFormula('H₂O')).toEqual({ H: 2, O: 1 })
    expect(parseFormula('CO₂')).toEqual({ C: 1, O: 2 })
  })

  it('throws on empty string', () => {
    expect(() => parseFormula('')).toThrow()
  })

  it('throws on unmatched parenthesis', () => {
    expect(() => parseFormula('Ca(OH2')).toThrow()
  })

  it('throws on unexpected character', () => {
    expect(() => parseFormula('H2O+NaCl')).toThrow()
  })
})

describe('calcMolarMass', () => {
  it('computes water', () => {
    const atoms = parseFormula('H2O')
    const m = calcMolarMass(atoms, ATOMIC_MASSES)
    expect(m).toBeCloseTo(18.015, 2)
  })

  it('computes CO2', () => {
    const atoms = parseFormula('CO2')
    const m = calcMolarMass(atoms, ATOMIC_MASSES)
    expect(m).toBeCloseTo(44.009, 2)
  })

  it('computes NaCl', () => {
    const atoms = parseFormula('NaCl')
    const m = calcMolarMass(atoms, ATOMIC_MASSES)
    expect(m).toBeCloseTo(58.443, 2)
  })

  it('computes Fe2O3', () => {
    const atoms = parseFormula('Fe2O3')
    const m = calcMolarMass(atoms, ATOMIC_MASSES)
    expect(m).toBeCloseTo(159.687, 2)
  })

  it('throws on unknown element', () => {
    expect(() => calcMolarMass({ Xx: 1 }, ATOMIC_MASSES)).toThrow('unknown element: Xx')
  })
})

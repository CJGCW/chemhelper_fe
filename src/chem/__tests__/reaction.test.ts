import { describe, it, expect } from 'vitest'
import { balanceReaction } from '../reaction'

describe('balanceReaction', () => {
  it('synthesis of water: H2 + O2 → H2O', () => {
    const coeffs = balanceReaction(['H2', 'O2'], ['H2O'])
    expect(coeffs).toEqual([2, 1, 2])
  })

  it('synthesis of ammonia: N2 + H2 → NH3', () => {
    const coeffs = balanceReaction(['N2', 'H2'], ['NH3'])
    expect(coeffs).toEqual([1, 3, 2])
  })

  it('combustion of methane: CH4 + O2 → CO2 + H2O', () => {
    const coeffs = balanceReaction(['CH4', 'O2'], ['CO2', 'H2O'])
    expect(coeffs).toEqual([1, 2, 1, 2])
  })

  it('iron rusting: Fe + O2 → Fe2O3', () => {
    const coeffs = balanceReaction(['Fe', 'O2'], ['Fe2O3'])
    expect(coeffs).toEqual([4, 3, 2])
  })

  it('combustion of propane: C3H8 + O2 → CO2 + H2O', () => {
    const coeffs = balanceReaction(['C3H8', 'O2'], ['CO2', 'H2O'])
    expect(coeffs).toEqual([1, 5, 3, 4])
  })

  it('decomposition of potassium chlorate: KClO3 → KCl + O2', () => {
    const coeffs = balanceReaction(['KClO3'], ['KCl', 'O2'])
    expect(coeffs).toEqual([2, 2, 3])
  })

  it('zinc + hydrochloric acid: Zn + HCl → ZnCl2 + H2', () => {
    const coeffs = balanceReaction(['Zn', 'HCl'], ['ZnCl2', 'H2'])
    expect(coeffs).toEqual([1, 2, 1, 1])
  })

  it('aluminum oxide formation: Al + O2 → Al2O3', () => {
    const coeffs = balanceReaction(['Al', 'O2'], ['Al2O3'])
    expect(coeffs).toEqual([4, 3, 2])
  })

  it('combustion of glucose: C6H12O6 + O2 → CO2 + H2O', () => {
    const coeffs = balanceReaction(['C6H12O6', 'O2'], ['CO2', 'H2O'])
    expect(coeffs).toEqual([1, 6, 6, 6])
  })

  it('returns null for impossible equations', () => {
    expect(balanceReaction(['H2'], ['O2'])).toBeNull()
  })

})

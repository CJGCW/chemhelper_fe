import { describe, it, expect } from 'vitest'
import { degreeOfUnsaturation, classifyHydrocarbon, areIsomers, straightChainAlkaneName } from '../organic'

describe('degreeOfUnsaturation', () => {
  it('C₆H₁₄ (hexane) → DoU = 0', () => {
    expect(degreeOfUnsaturation(6, 14).DoU).toBe(0)
  })

  it('C₆H₁₂ → DoU = 1', () => {
    expect(degreeOfUnsaturation(6, 12).DoU).toBe(1)
  })

  it('C₆H₆ (benzene) → DoU = 4', () => {
    expect(degreeOfUnsaturation(6, 6).DoU).toBe(4)
  })

  it('C₂H₃N (acetonitrile) → DoU = 2', () => {
    expect(degreeOfUnsaturation(2, 3, 1).DoU).toBe(2)
  })

  it('C₁H₄ (methane) → DoU = 0', () => {
    expect(degreeOfUnsaturation(1, 4).DoU).toBe(0)
  })

  it('C₂H₂ (ethyne/acetylene) → DoU = 2', () => {
    expect(degreeOfUnsaturation(2, 2).DoU).toBe(2)
  })

  it('C₂H₄ (ethene) → DoU = 1', () => {
    expect(degreeOfUnsaturation(2, 4).DoU).toBe(1)
  })

  it('C₂H₆ (ethane) → DoU = 0', () => {
    expect(degreeOfUnsaturation(2, 6).DoU).toBe(0)
  })

  it('halogens reduce DoU numerator (C₂H₅Cl) → DoU = 0', () => {
    // C2H5Cl: X=1, so (2×2 + 2 + 0 - 5 - 1)/2 = 0
    expect(degreeOfUnsaturation(2, 5, 0, 1).DoU).toBe(0)
  })

  it('provides steps array with multiple entries', () => {
    const result = degreeOfUnsaturation(6, 14)
    expect(result.steps.length).toBeGreaterThan(2)
  })

  it('provides interpretation string', () => {
    const result = degreeOfUnsaturation(6, 14)
    expect(result.interpretation).toContain('0')
  })
})

describe('classifyHydrocarbon', () => {
  it('C₃H₈ → alkane', () => {
    expect(classifyHydrocarbon(3, 8).family).toBe('alkane')
  })

  it('C₃H₆ → alkene', () => {
    expect(classifyHydrocarbon(3, 6).family).toBe('alkene')
  })

  it('C₃H₄ → alkyne', () => {
    expect(classifyHydrocarbon(3, 4).family).toBe('alkyne')
  })

  it('C₆H₆ (benzene) → aromatic', () => {
    expect(classifyHydrocarbon(6, 6).family).toBe('aromatic')
  })

  it('C₁H₄ (methane) → alkane', () => {
    expect(classifyHydrocarbon(1, 4).family).toBe('alkane')
  })

  it('C₂H₄ (ethene) → alkene', () => {
    expect(classifyHydrocarbon(2, 4).family).toBe('alkene')
  })

  it('C₂H₂ (ethyne) → alkyne', () => {
    expect(classifyHydrocarbon(2, 2).family).toBe('alkyne')
  })

  it('C₁₀H₂₂ (decane) → alkane', () => {
    expect(classifyHydrocarbon(10, 22).family).toBe('alkane')
  })

  it('C₄H₈ → alkene', () => {
    expect(classifyHydrocarbon(4, 8).family).toBe('alkene')
  })

  it('C₄H₆ → alkyne', () => {
    expect(classifyHydrocarbon(4, 6).family).toBe('alkyne')
  })

  it('provides reasoning string', () => {
    const result = classifyHydrocarbon(3, 8)
    expect(result.reasoning).toBeTruthy()
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('provides DoU value', () => {
    expect(classifyHydrocarbon(3, 8).DoU).toBe(0)
    expect(classifyHydrocarbon(3, 6).DoU).toBe(1)
    expect(classifyHydrocarbon(3, 4).DoU).toBe(2)
  })
})

describe('areIsomers', () => {
  it('C4H10 and C4H10 → true', () => {
    expect(areIsomers('C4H10', 'C4H10')).toBe(true)
  })

  it('C4H10 and C4H8 → false', () => {
    expect(areIsomers('C4H10', 'C4H8')).toBe(false)
  })

  it('C5H12 and C5H12 → true (pentane and isopentane)', () => {
    expect(areIsomers('C5H12', 'C5H12')).toBe(true)
  })

  it('C2H6 and C3H8 → false', () => {
    expect(areIsomers('C2H6', 'C3H8')).toBe(false)
  })

  it('handles subscript unicode digits', () => {
    expect(areIsomers('C₄H₁₀', 'C₄H₁₀')).toBe(true)
    expect(areIsomers('C₄H₁₀', 'C₄H₈')).toBe(false)
  })

  it('C6H14 and C6H14 → true', () => {
    expect(areIsomers('C6H14', 'C6H14')).toBe(true)
  })

  it('C6H6 and C6H8 → false', () => {
    expect(areIsomers('C6H6', 'C6H8')).toBe(false)
  })
})

describe('straightChainAlkaneName', () => {
  it('1 → methane', () => {
    expect(straightChainAlkaneName(1)).toBe('methane')
  })

  it('2 → ethane', () => {
    expect(straightChainAlkaneName(2)).toBe('ethane')
  })

  it('3 → propane', () => {
    expect(straightChainAlkaneName(3)).toBe('propane')
  })

  it('4 → butane', () => {
    expect(straightChainAlkaneName(4)).toBe('butane')
  })

  it('5 → pentane', () => {
    expect(straightChainAlkaneName(5)).toBe('pentane')
  })

  it('6 → hexane', () => {
    expect(straightChainAlkaneName(6)).toBe('hexane')
  })

  it('7 → heptane', () => {
    expect(straightChainAlkaneName(7)).toBe('heptane')
  })

  it('8 → octane', () => {
    expect(straightChainAlkaneName(8)).toBe('octane')
  })

  it('9 → nonane', () => {
    expect(straightChainAlkaneName(9)).toBe('nonane')
  })

  it('10 → decane', () => {
    expect(straightChainAlkaneName(10)).toBe('decane')
  })

  it('out of range returns empty string', () => {
    expect(straightChainAlkaneName(0)).toBe('')
    expect(straightChainAlkaneName(11)).toBe('')
  })
})

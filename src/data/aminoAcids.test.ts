import { describe, it, expect } from 'vitest'
import { AMINO_ACIDS } from './aminoAcids'

describe('AMINO_ACIDS', () => {
  it('has exactly 20 entries', () => {
    expect(AMINO_ACIDS).toHaveLength(20)
  })

  it('every entry has all required fields populated', () => {
    for (const aa of AMINO_ACIDS) {
      expect(aa.name,      `${aa.name}: name`).toBeTruthy()
      expect(aa.three,     `${aa.name}: three`).toBeTruthy()
      expect(aa.one,       `${aa.name}: one`).toBeTruthy()
      expect(aa.rGroup,    `${aa.name}: rGroup`).toBeTruthy()
      expect(aa.fullSmiles,`${aa.name}: fullSmiles`).toBeTruthy()
      expect(aa.class,     `${aa.name}: class`).toBeTruthy()
      expect(typeof aa.pKa1, `${aa.name}: pKa1`).toBe('number')
      expect(typeof aa.pKa2, `${aa.name}: pKa2`).toBe('number')
      expect(typeof aa.pI,   `${aa.name}: pI`).toBe('number')
    }
  })

  it('fullSmiles is non-empty for every entry', () => {
    for (const aa of AMINO_ACIDS) {
      expect(aa.fullSmiles.length).toBeGreaterThan(0)
    }
  })

  it('pI ≈ (pKa1 + pKa2) / 2 for neutral side chains (no pKaR)', () => {
    const neutral = AMINO_ACIDS.filter(aa => aa.pKaR == null)
    for (const aa of neutral) {
      const expected = (aa.pKa1 + aa.pKa2) / 2
      expect(aa.pI).toBeCloseTo(expected, 1)
    }
  })

  it('all five classes are represented with expected counts', () => {
    const counts: Record<string, number> = {}
    for (const aa of AMINO_ACIDS) {
      counts[aa.class] = (counts[aa.class] ?? 0) + 1
    }
    expect(counts['nonpolar']).toBe(7)
    expect(counts['aromatic']).toBe(3)
    expect(counts['polar']).toBe(5)
    expect(counts['acidic']).toBe(2)
    expect(counts['basic']).toBe(3)
  })

  it('every entry has either rGroupSmiles or rGroupFullStructure', () => {
    for (const aa of AMINO_ACIDS) {
      const hasR = aa.rGroupSmiles != null || aa.rGroupFullStructure != null
      expect(hasR, `${aa.name} has no R-group SMILES`).toBe(true)
    }
  })
})

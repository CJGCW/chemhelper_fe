import { describe, it, expect } from 'vitest'
import {
  countSigmaPi,
  buildExplanation,
  checkSigmaPiAnswer,
  checkSigmaPiCombined,
} from './sigmaPiPractice'
import type { LewisStructure } from '../pages/LewisPage'

// ── Helpers ────────────────────────────────────────────────────────────────────

function mkStructure(bonds: { from: string; to: string; order: number }[], atoms: { id: string; element: string }[]): LewisStructure {
  return {
    name: 'test',
    formula: 'TEST',
    charge: 0,
    total_valence_electrons: 0,
    geometry: 'linear',
    atoms: atoms.map(a => ({ ...a, lone_pairs: 0, formal_charge: 0 })),
    bonds: bonds.map(b => ({ ...b })),
    steps: [],
    notes: '',
  }
}

// ── countSigmaPi ──────────────────────────────────────────────────────────────

describe('countSigmaPi', () => {
  it('all single bonds: sigma = bond count, pi = 0', () => {
    // H₂O: 2 single bonds
    const s = mkStructure(
      [{ from: 'H1', to: 'O', order: 1 }, { from: 'H2', to: 'O', order: 1 }],
      [{ id: 'H1', element: 'H' }, { id: 'H2', element: 'H' }, { id: 'O', element: 'O' }],
    )
    expect(countSigmaPi(s)).toEqual({ sigma: 2, pi: 0 })
  })

  it('one double bond: 1σ, 1π', () => {
    // O₂
    const s = mkStructure(
      [{ from: 'O1', to: 'O2', order: 2 }],
      [{ id: 'O1', element: 'O' }, { id: 'O2', element: 'O' }],
    )
    expect(countSigmaPi(s)).toEqual({ sigma: 1, pi: 1 })
  })

  it('one triple bond: 1σ, 2π', () => {
    // N₂
    const s = mkStructure(
      [{ from: 'N1', to: 'N2', order: 3 }],
      [{ id: 'N1', element: 'N' }, { id: 'N2', element: 'N' }],
    )
    expect(countSigmaPi(s)).toEqual({ sigma: 1, pi: 2 })
  })

  it('CO₂: 2 double bonds → 2σ, 2π', () => {
    const s = mkStructure(
      [{ from: 'O1', to: 'C', order: 2 }, { from: 'C', to: 'O2', order: 2 }],
      [{ id: 'O1', element: 'O' }, { id: 'C', element: 'C' }, { id: 'O2', element: 'O' }],
    )
    expect(countSigmaPi(s)).toEqual({ sigma: 2, pi: 2 })
  })

  it('C₂H₂ (H–C≡C–H): 3σ, 2π', () => {
    const s = mkStructure(
      [
        { from: 'H1', to: 'C1', order: 1 },
        { from: 'C1', to: 'C2', order: 3 },
        { from: 'C2', to: 'H2', order: 1 },
      ],
      [
        { id: 'H1', element: 'H' }, { id: 'C1', element: 'C' },
        { id: 'C2', element: 'C' }, { id: 'H2', element: 'H' },
      ],
    )
    expect(countSigmaPi(s)).toEqual({ sigma: 3, pi: 2 })
  })

  it('pi is never greater than 2 * sigma', () => {
    // Triple bond: 1σ, 2π → pi = 2 * sigma
    const s = mkStructure(
      [{ from: 'N1', to: 'N2', order: 3 }],
      [{ id: 'N1', element: 'N' }, { id: 'N2', element: 'N' }],
    )
    const { sigma, pi } = countSigmaPi(s)
    expect(pi).toBeLessThanOrEqual(2 * sigma)
  })

  it('zero bonds → 0σ, 0π', () => {
    const s = mkStructure([], [{ id: 'He', element: 'He' }])
    expect(countSigmaPi(s)).toEqual({ sigma: 0, pi: 0 })
  })
})

// ── buildExplanation ───────────────────────────────────────────────────────────

describe('buildExplanation', () => {
  it('single-bond-only molecule', () => {
    const s = mkStructure(
      [{ from: 'H1', to: 'O', order: 1 }, { from: 'H2', to: 'O', order: 1 }],
      [{ id: 'H1', element: 'H' }, { id: 'H2', element: 'H' }, { id: 'O', element: 'O' }],
    )
    const result = buildExplanation(s, 2, 0)
    expect(result).toContain('2σ')
    expect(result).toContain('0π')
    expect(result).toContain('single')
  })

  it('double bond molecule', () => {
    const s = mkStructure(
      [{ from: 'O1', to: 'C', order: 2 }, { from: 'C', to: 'O2', order: 2 }],
      [{ id: 'O1', element: 'O' }, { id: 'C', element: 'C' }, { id: 'O2', element: 'O' }],
    )
    const result = buildExplanation(s, 2, 2)
    expect(result).toContain('double')
    expect(result).toContain('→ 2σ, 2π')
  })

  it('triple bond molecule', () => {
    const s = mkStructure(
      [{ from: 'N1', to: 'N2', order: 3 }],
      [{ id: 'N1', element: 'N' }, { id: 'N2', element: 'N' }],
    )
    const result = buildExplanation(s, 1, 2)
    expect(result).toContain('triple')
    expect(result).toContain('→ 1σ, 2π')
  })

  it('ends with → Nσ, Mπ summary', () => {
    const s = mkStructure(
      [{ from: 'O1', to: 'C', order: 2 }, { from: 'C', to: 'O2', order: 2 }],
      [{ id: 'O1', element: 'O' }, { id: 'C', element: 'C' }, { id: 'O2', element: 'O' }],
    )
    expect(buildExplanation(s, 2, 2)).toMatch(/→ 2σ, 2π$/)
  })

  it('mixed bonds (HCN: H–C≡N)', () => {
    const s = mkStructure(
      [{ from: 'H', to: 'C', order: 1 }, { from: 'C', to: 'N', order: 3 }],
      [{ id: 'H', element: 'H' }, { id: 'C', element: 'C' }, { id: 'N', element: 'N' }],
    )
    const result = buildExplanation(s, 2, 2)
    expect(result).toContain('single')
    expect(result).toContain('triple')
    expect(result).toContain('→ 2σ, 2π')
  })
})

// ── checkSigmaPiAnswer ─────────────────────────────────────────────────────────

describe('checkSigmaPiAnswer', () => {
  const h2o = { name: 'water', sigma: 2, pi: 0, explanation: '', structure: mkStructure([], []) }
  const co2 = { name: 'carbon dioxide', sigma: 2, pi: 2, explanation: '', structure: mkStructure([], []) }

  it('returns correct when both are right', () => {
    expect(checkSigmaPiAnswer('2', '0', h2o)).toBe('correct')
    expect(checkSigmaPiAnswer('2', '2', co2)).toBe('correct')
  })

  it('returns wrong-sigma when only sigma is wrong', () => {
    expect(checkSigmaPiAnswer('1', '0', h2o)).toBe('wrong-sigma')
    expect(checkSigmaPiAnswer('3', '2', co2)).toBe('wrong-sigma')
  })

  it('returns wrong-pi when only pi is wrong', () => {
    expect(checkSigmaPiAnswer('2', '1', h2o)).toBe('wrong-pi')
    expect(checkSigmaPiAnswer('2', '1', co2)).toBe('wrong-pi')
  })

  it('returns wrong-both when both are wrong', () => {
    expect(checkSigmaPiAnswer('0', '1', h2o)).toBe('wrong-both')
    expect(checkSigmaPiAnswer('1', '0', co2)).toBe('wrong-both')
  })

  it('returns wrong-both for non-numeric input', () => {
    expect(checkSigmaPiAnswer('abc', '0', h2o)).toBe('wrong-both')
    expect(checkSigmaPiAnswer('2', 'xyz', h2o)).toBe('wrong-both')
    expect(checkSigmaPiAnswer('', '', h2o)).toBe('wrong-both')
  })
})

// ── checkSigmaPiCombined ───────────────────────────────────────────────────────

describe('checkSigmaPiCombined', () => {
  const n2 = { name: 'nitrogen', sigma: 1, pi: 2, explanation: '', structure: mkStructure([], []) }

  it('accepts comma-separated "σ,π"', () => {
    expect(checkSigmaPiCombined('1,2', n2)).toBe(true)
  })

  it('accepts space-separated "σ π"', () => {
    expect(checkSigmaPiCombined('1 2', n2)).toBe(true)
  })

  it('accepts "σ, π" with space after comma', () => {
    expect(checkSigmaPiCombined('1, 2', n2)).toBe(true)
  })

  it('rejects swapped order', () => {
    expect(checkSigmaPiCombined('2,1', n2)).toBe(false)
  })

  it('rejects wrong values', () => {
    expect(checkSigmaPiCombined('3,2', n2)).toBe(false)
  })

  it('rejects non-numeric input', () => {
    expect(checkSigmaPiCombined('a,b', n2)).toBe(false)
    expect(checkSigmaPiCombined('', n2)).toBe(false)
  })

  it('rejects incomplete input', () => {
    expect(checkSigmaPiCombined('1', n2)).toBe(false)
    expect(checkSigmaPiCombined(',2', n2)).toBe(false)
  })
})

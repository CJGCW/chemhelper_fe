import { describe, it, expect } from 'vitest'
import {
  countSigFigs,
  lowestSigFigs,
  roundToSigFigs,
  formatSigFigs,
  buildSigFigBreakdown,
} from './sigfigs'

// ── countSigFigs ─────────────────────────────────────────────────────────────

describe('countSigFigs', () => {
  it('counts digits in a simple integer (no trailing zeros)', () => {
    expect(countSigFigs('123')).toBe(3)
  })

  it('ignores trailing zeros in integers (ambiguous)', () => {
    expect(countSigFigs('1200')).toBe(2)
  })

  it('counts all digits after an explicit decimal', () => {
    expect(countSigFigs('1.200')).toBe(4)
  })

  it('handles a value with a leading zero before decimal', () => {
    expect(countSigFigs('0.0500')).toBe(3)
  })

  it('handles a leading decimal without a leading zero', () => {
    expect(countSigFigs('.7500')).toBe(4)
  })

  it('counts all digits in a molar mass style value', () => {
    expect(countSigFigs('18.015')).toBe(5)
  })

  it('returns 0 for empty string', () => {
    expect(countSigFigs('')).toBe(0)
  })

  it('returns 0 for a bare decimal point', () => {
    expect(countSigFigs('.')).toBe(0)
  })

  it('returns 0 for non-numeric input', () => {
    expect(countSigFigs('abc')).toBe(0)
  })

  it('counts a single digit correctly', () => {
    expect(countSigFigs('5')).toBe(1)
  })

  it('handles exactly two sig figs with decimal', () => {
    expect(countSigFigs('1.0')).toBe(2)
  })
})

// ── lowestSigFigs ─────────────────────────────────────────────────────────────

describe('lowestSigFigs', () => {
  it('returns the minimum across multiple values', () => {
    expect(lowestSigFigs(['18.015', '0.500'])).toBe(3)
  })

  it('returns 3 (default) when all inputs have zero sig figs', () => {
    expect(lowestSigFigs(['', 'abc'])).toBe(3)
  })

  it('returns 3 for an empty array', () => {
    expect(lowestSigFigs([])).toBe(3)
  })

  it('ignores zero-sig-fig entries when others are valid', () => {
    expect(lowestSigFigs(['', '1.00'])).toBe(3)
  })

  it('handles a single value', () => {
    expect(lowestSigFigs(['2.5'])).toBe(2)
  })
})

// ── roundToSigFigs ────────────────────────────────────────────────────────────

describe('roundToSigFigs', () => {
  it('rounds to 3 sig figs', () => {
    expect(roundToSigFigs(3.14159, 3)).toBeCloseTo(3.14)
  })

  it('rounds to 1 sig fig', () => {
    expect(roundToSigFigs(0.0456, 1)).toBeCloseTo(0.05)
  })

  it('handles a large number', () => {
    expect(roundToSigFigs(123456, 3)).toBeCloseTo(123000)
  })

  it('returns value unchanged for zero', () => {
    expect(roundToSigFigs(0, 3)).toBe(0)
  })

  it('returns value unchanged when sigFigs < 1', () => {
    expect(roundToSigFigs(3.14, 0)).toBe(3.14)
  })

  it('handles negative numbers', () => {
    expect(roundToSigFigs(-2.567, 2)).toBeCloseTo(-2.6)
  })
})

// ── formatSigFigs ────────────────────────────────────────────────────────────

describe('formatSigFigs', () => {
  it('returns "0" for zero', () => {
    expect(formatSigFigs(0, 3)).toBe('0')
  })

  it('preserves significant trailing zeros', () => {
    expect(formatSigFigs(1.2, 3)).toBe('1.20')
  })

  it('formats to correct number of sig figs', () => {
    expect(formatSigFigs(3.14159, 3)).toBe('3.14')
  })

  it('handles small numbers without scientific notation', () => {
    const result = formatSigFigs(0.000123, 2)
    expect(result).not.toContain('e')
    expect(result).toBe('0.00012')
  })

  it('handles large numbers without scientific notation', () => {
    const result = formatSigFigs(1234567, 3)
    expect(result).not.toContain('e')
    expect(result).toBe('1230000')
  })

  it('formats a typical molality result', () => {
    expect(formatSigFigs(1.860, 4)).toBe('1.860')
  })

  it('formats a typical moles result', () => {
    expect(formatSigFigs(0.5, 3)).toBe('0.500')
  })
})

// ── buildSigFigBreakdown ─────────────────────────────────────────────────────

describe('buildSigFigBreakdown', () => {
  it('identifies the correct limiting input', () => {
    const result = buildSigFigBreakdown(
      [{ label: 'Mass', value: '18.0' }, { label: 'Molar Mass', value: '58.44' }],
      0.30791,
      'mol',
    )
    expect(result.limiting).toBe(3)
    expect(result.limitingLabel).toBe('Mass')
  })

  it('computes rounded result correctly', () => {
    const result = buildSigFigBreakdown(
      [{ label: 'Moles', value: '0.500' }, { label: 'Volume', value: '0.2500' }],
      2.0,
      'mol/L',
    )
    expect(result.roundedResult).toBeCloseTo(2.0)
    expect(result.limiting).toBe(3)
  })

  it('includes per-input sig fig counts', () => {
    const result = buildSigFigBreakdown(
      [{ label: 'A', value: '1.00' }, { label: 'B', value: '2.0' }],
      0.5,
      'g',
    )
    expect(result.inputs).toHaveLength(2)
    expect(result.inputs[0].count).toBe(3)
    expect(result.inputs[1].count).toBe(2)
  })

  it('filters out blank inputs', () => {
    const result = buildSigFigBreakdown(
      [{ label: 'A', value: '1.00' }, { label: 'B', value: '' }],
      1.0,
      'mol',
    )
    expect(result.inputs).toHaveLength(1)
  })

  it('formats roundedStr with the correct unit', () => {
    const result = buildSigFigBreakdown(
      [{ label: 'X', value: '2.50' }],
      2.5,
      'mol/kg',
    )
    expect(result.roundedStr).toContain('mol/kg')
  })
})

import { describe, it, expect } from 'vitest'
import { sanitize, hasValue, conversionStep, toStandard } from './calcHelpers'
import type { UnitOption } from '../components/calculations/UnitSelect'

// ── Helpers ───────────────────────────────────────────────────────────────────

function unit(label: string, toGrams: number): UnitOption {
  return { label, toGrams, prefix: 'none', unit: 'gram' }
}

const GRAM  = unit('g',  1)
const KG    = unit('kg', 1000)
const MG    = unit('mg', 0.001)
const LITRE = unit('L',  1)
const ML    = unit('mL', 0.001)

// ── sanitize ─────────────────────────────────────────────────────────────────

describe('sanitize', () => {
  it('keeps digits and a single decimal point', () => {
    expect(sanitize('18.015')).toBe('18.015')
  })

  it('strips letters and symbols', () => {
    expect(sanitize('1a2b.3!')).toBe('12.3')
  })

  it('allows only one decimal point', () => {
    expect(sanitize('1.2.3')).toBe('1.23')
  })

  it('returns empty string for non-numeric input', () => {
    expect(sanitize('abc')).toBe('')
  })

  it('handles empty string', () => {
    expect(sanitize('')).toBe('')
  })

  it('rejects leading minus by default', () => {
    expect(sanitize('-5')).toBe('5')
  })

  it('allows leading minus when allowNegative=true', () => {
    expect(sanitize('-5', true)).toBe('-5')
  })

  it('allows only one leading minus', () => {
    expect(sanitize('--5', true)).toBe('-5')
  })

  it('rejects minus that is not at the start', () => {
    expect(sanitize('5-3', true)).toBe('53')
  })

  it('handles leading decimal', () => {
    expect(sanitize('.75')).toBe('.75')
  })
})

// ── hasValue ─────────────────────────────────────────────────────────────────

describe('hasValue', () => {
  it('returns true for a plain positive number', () => {
    expect(hasValue('1.5')).toBe(true)
  })

  it('returns true for an integer string', () => {
    expect(hasValue('42')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(hasValue('')).toBe(false)
  })

  it('returns false for whitespace only', () => {
    expect(hasValue('   ')).toBe(false)
  })

  it('returns false for zero', () => {
    expect(hasValue('0')).toBe(false)
  })

  it('returns false for negative number', () => {
    expect(hasValue('-1')).toBe(false)
  })

  it('returns false for non-numeric string', () => {
    expect(hasValue('abc')).toBe(false)
  })

  it('returns true when value has leading/trailing whitespace', () => {
    expect(hasValue(' 3.14 ')).toBe(true)
  })
})

// ── toStandard ───────────────────────────────────────────────────────────────

describe('toStandard', () => {
  it('returns the same value for grams', () => {
    expect(toStandard('50', GRAM)).toBe(50)
  })

  it('converts kilograms to grams', () => {
    expect(toStandard('2', KG)).toBe(2000)
  })

  it('converts milligrams to grams', () => {
    expect(toStandard('500', MG)).toBeCloseTo(0.5)
  })

  it('works with decimal strings', () => {
    expect(toStandard('0.250', LITRE)).toBeCloseTo(0.25)
  })

  it('converts mL to L', () => {
    expect(toStandard('500', ML)).toBeCloseTo(0.5)
  })
})

// ── conversionStep ───────────────────────────────────────────────────────────

describe('conversionStep', () => {
  it('returns null when unit is already the standard', () => {
    expect(conversionStep('50', GRAM, 'g', 50)).toBeNull()
  })

  it('returns a conversion string when unit differs', () => {
    expect(conversionStep('2', KG, 'g', 2000)).toBe('Convert: 2 kg = 2000 g')
  })

  it('returns null for litres when standard is L', () => {
    expect(conversionStep('0.25', LITRE, 'L', 0.25)).toBeNull()
  })

  it('returns conversion string for mL → L', () => {
    expect(conversionStep('500', ML, 'L', 0.5)).toBe('Convert: 500 mL = 0.5 L')
  })
})

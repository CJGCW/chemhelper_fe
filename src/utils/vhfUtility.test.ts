import { describe, it, expect } from 'vitest'
import { estimateVhf } from './vhfUtility'

// ── exact lookups ─────────────────────────────────────────────────────────────

describe('estimateVhf — exact lookups', () => {
  it('returns i=2 and exact confidence for NaCl', () => {
    const result = estimateVhf('NaCl')
    expect(result.i).toBe(2)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=3 for CaCl2', () => {
    const result = estimateVhf('CaCl2')
    expect(result.i).toBe(3)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=4 for AlCl3', () => {
    const result = estimateVhf('AlCl3')
    expect(result.i).toBe(4)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=5 for Al2(SO4)3', () => {
    const result = estimateVhf('Al2(SO4)3')
    expect(result.i).toBe(5)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=1 for glucose (C6H12O6)', () => {
    const result = estimateVhf('C6H12O6')
    expect(result.i).toBe(1)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=1 for sucrose (C12H22O11)', () => {
    const result = estimateVhf('C12H22O11')
    expect(result.i).toBe(1)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=2 for HCl (strong acid)', () => {
    const result = estimateVhf('HCl')
    expect(result.i).toBe(2)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=3 for H2SO4', () => {
    const result = estimateVhf('H2SO4')
    expect(result.i).toBe(3)
    expect(result.confidence).toBe('exact')
  })

  it('returns i=2 for MgSO4 (exception among divalent salts)', () => {
    const result = estimateVhf('MgSO4')
    expect(result.i).toBe(2)
    expect(result.confidence).toBe('exact')
  })

  it('includes a non-empty note for exact results', () => {
    const result = estimateVhf('KCl')
    expect(result.note.length).toBeGreaterThan(0)
  })
})

// ── default fallback ──────────────────────────────────────────────────────────

describe('estimateVhf — unknown compounds', () => {
  it('returns i=1 for an unknown formula', () => {
    const result = estimateVhf('XYZ')
    expect(result.i).toBe(1)
  })

  it('returns default confidence for an unknown formula', () => {
    const result = estimateVhf('XYZ')
    expect(result.confidence).toBe('default')
  })

  it('returns default for empty string', () => {
    const result = estimateVhf('')
    expect(result.i).toBe(1)
    expect(result.confidence).toBe('default')
  })

  it('is case-sensitive — lowercase nacl is unknown', () => {
    const result = estimateVhf('nacl')
    expect(result.confidence).toBe('default')
  })

  it('includes a note for default results', () => {
    const result = estimateVhf('UNKNOWN')
    expect(result.note.length).toBeGreaterThan(0)
  })
})

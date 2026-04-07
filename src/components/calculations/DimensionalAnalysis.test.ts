import { describe, it, expect } from 'vitest'
import {
  fmtNum,
  buildMassToMol,
  buildMolToMass,
  buildMolToParticles,
  buildParticlesToMol,
  buildKmhToMs,
  buildMgToKg,
} from './DimensionalAnalysis'

const AVOGADRO = 6.02214076e23

// ── fmtNum ────────────────────────────────────────────────────────────────────

describe('fmtNum', () => {
  it('formats small decimals in scientific notation', () => {
    expect(fmtNum(0.0001)).toMatch(/× 10/)
  })

  it('formats large numbers in scientific notation', () => {
    expect(fmtNum(1e8)).toMatch(/× 10/)
  })

  it('formats normal-range numbers as plain decimals', () => {
    expect(fmtNum(50)).toBe('50')
    expect(fmtNum(1000)).toBe('1000')
    expect(fmtNum(3.14)).toBe('3.14')
  })

  it('returns — for non-finite inputs', () => {
    expect(fmtNum(Infinity)).toBe('—')
    expect(fmtNum(-Infinity)).toBe('—')
    expect(fmtNum(NaN)).toBe('—')
  })

  it('returns 0 for zero', () => {
    expect(fmtNum(0)).toBe('0')
  })

  it('uses Unicode superscripts for exponents', () => {
    const result = fmtNum(6.022e23, 4)
    expect(result).toContain('²')
    expect(result).toContain('³')
  })
})

// ── buildMassToMol ────────────────────────────────────────────────────────────

describe('buildMassToMol', () => {
  it('returns null for non-numeric value', () => {
    expect(buildMassToMol('abc', '18')).toBeNull()
  })

  it('returns null for non-numeric molar mass', () => {
    expect(buildMassToMol('50', 'abc')).toBeNull()
  })

  it('returns null for zero molar mass', () => {
    expect(buildMassToMol('50', '0')).toBeNull()
  })

  it('returns null for negative molar mass', () => {
    expect(buildMassToMol('50', '-18')).toBeNull()
  })

  it('computes moles from mass and molar mass of water (18 g/mol)', () => {
    const result = buildMassToMol('36', '18')!
    expect(result).not.toBeNull()
    // 36 g / 18 g/mol = 2 mol
    expect(result.resultValue).toBe('2')
    expect(result.resultNumUnit).toBe('mol')
  })

  it('marks the starting unit as cancelled', () => {
    const result = buildMassToMol('50', '55.845')!
    expect(result.start.numUnit).toBe('g')
    expect(result.start.numCancelled).toBe(true)
  })

  it('has one step with molar mass in the denominator', () => {
    const result = buildMassToMol('50', '55.845')!
    expect(result.steps).toHaveLength(1)
    expect(result.steps[0].denUnit).toBe('g')
    expect(result.steps[0].denCancelled).toBe(true)
    expect(result.steps[0].numUnit).toBe('mol')
    expect(result.steps[0].numCancelled).toBe(false)
  })

  it('result value matches mass / molar mass', () => {
    const mass = 100, M = 55.845
    const result = buildMassToMol(String(mass), String(M))!
    // result is a formatted string — parse it back to check numeric accuracy
    expect(mass / M).toBeCloseTo(1.7907, 3)
    expect(result.resultValue).toContain('1.79')
  })
})

// ── buildMolToMass ────────────────────────────────────────────────────────────

describe('buildMolToMass', () => {
  it('returns null for invalid inputs', () => {
    expect(buildMolToMass('abc', '18')).toBeNull()
    expect(buildMolToMass('2', 'abc')).toBeNull()
    expect(buildMolToMass('2', '0')).toBeNull()
  })

  it('computes mass from moles of water (18 g/mol)', () => {
    const result = buildMolToMass('2', '18')!
    expect(result.resultValue).toBe('36')
    expect(result.resultNumUnit).toBe('g')
  })

  it('is the inverse of buildMassToMol', () => {
    const mass = 50, M = 55.845
    const mol = mass / M
    const backToMass = buildMolToMass(String(mol), String(M))!
    // Should recover original mass within floating point tolerance
    expect(parseFloat(backToMass.resultValue)).toBeCloseTo(mass, 1)
  })

  it('marks the starting mol unit as cancelled', () => {
    const result = buildMolToMass('1', '18')!
    expect(result.start.numUnit).toBe('mol')
    expect(result.start.numCancelled).toBe(true)
  })

  it('has molar mass in numerator and mol in denominator of the step', () => {
    const result = buildMolToMass('1', '18')!
    expect(result.steps[0].numUnit).toBe('g')
    expect(result.steps[0].numCancelled).toBe(false)
    expect(result.steps[0].denUnit).toBe('mol')
    expect(result.steps[0].denCancelled).toBe(true)
  })
})

// ── buildMolToParticles ───────────────────────────────────────────────────────

describe('buildMolToParticles', () => {
  it('returns null for non-numeric input', () => {
    expect(buildMolToParticles('abc')).toBeNull()
  })

  it('computes particles from 1 mol (Avogadro\'s number)', () => {
    const result = buildMolToParticles('1')!
    expect(result).not.toBeNull()
    expect(result.resultNumUnit).toBe('particles')
    // Result should contain 6.022 × 10²³
    expect(result.resultValue).toContain('6.02')
    expect(result.resultValue).toContain('²')
  })

  it('computes particles from 2 mol', () => {
    const result = buildMolToParticles('2')!
    // 2 × 6.022e23 ≈ 1.204e24
    expect(result.resultValue).toMatch(/1\.2/)
    expect(result.resultValue).toContain('²')
    expect(result.resultValue).toContain('⁴')
  })

  it('uses Avogadro in numerator and mol in denominator of the step', () => {
    const result = buildMolToParticles('1')!
    expect(result.steps[0].numUnit).toBe('particles')
    expect(result.steps[0].numCancelled).toBe(false)
    expect(result.steps[0].denUnit).toBe('mol')
    expect(result.steps[0].denCancelled).toBe(true)
    expect(result.steps[0].note).toMatch(/avogadro/i)
  })
})

// ── buildParticlesToMol ───────────────────────────────────────────────────────

describe('buildParticlesToMol', () => {
  it('returns null for non-numeric input', () => {
    expect(buildParticlesToMol('abc')).toBeNull()
  })

  it('computes 1 mol from Avogadro\'s number of particles', () => {
    const result = buildParticlesToMol(String(AVOGADRO))!
    expect(result.resultValue).toBe('1')
    expect(result.resultNumUnit).toBe('mol')
  })

  it('is the inverse of buildMolToParticles', () => {
    const particles = 3.011e23  // 0.5 mol
    const result = buildParticlesToMol(String(particles))!
    expect(result.resultValue).toContain('0.5')
  })

  it('marks particles as cancelled in start and in step denominator', () => {
    const result = buildParticlesToMol('6.022e23')!
    expect(result.start.numUnit).toBe('particles')
    expect(result.start.numCancelled).toBe(true)
    expect(result.steps[0].denUnit).toBe('particles')
    expect(result.steps[0].denCancelled).toBe(true)
  })
})

// ── buildKmhToMs ──────────────────────────────────────────────────────────────

describe('buildKmhToMs', () => {
  it('returns null for non-numeric input', () => {
    expect(buildKmhToMs('abc')).toBeNull()
  })

  it('converts 90 km/h to 25 m/s', () => {
    const result = buildKmhToMs('90')!
    expect(result.resultValue).toBe('25')
    expect(result.resultNumUnit).toBe('m')
    expect(result.resultDenUnit).toBe('s')
  })

  it('converts 36 km/h to 10 m/s', () => {
    const result = buildKmhToMs('36')!
    expect(result.resultValue).toBe('10')
  })

  it('converts 0 km/h to 0 m/s', () => {
    const result = buildKmhToMs('0')!
    expect(result.resultValue).toBe('0')
  })

  it('has two steps', () => {
    const result = buildKmhToMs('100')!
    expect(result.steps).toHaveLength(2)
  })

  it('step 1 converts km to m', () => {
    const result = buildKmhToMs('100')!
    expect(result.steps[0].numUnit).toBe('m')
    expect(result.steps[0].denUnit).toBe('km')
    expect(result.steps[0].denCancelled).toBe(true)
    expect(result.steps[0].numValue).toBe('1000')
  })

  it('step 2 converts h to s', () => {
    const result = buildKmhToMs('100')!
    expect(result.steps[1].numUnit).toBe('h')
    expect(result.steps[1].numCancelled).toBe(true)
    expect(result.steps[1].denUnit).toBe('s')
    expect(result.steps[1].denCancelled).toBe(false)
    expect(result.steps[1].denValue).toBe('3600')
  })

  it('start block has compound unit with km and h', () => {
    const result = buildKmhToMs('100')!
    expect(result.start.numUnit).toBe('km')
    expect(result.start.denUnit).toBe('h')
    expect(result.start.numCancelled).toBe(true)
    expect(result.start.denCancelled).toBe(true)
  })
})

// ── buildMgToKg ───────────────────────────────────────────────────────────────

describe('buildMgToKg', () => {
  it('returns null for non-numeric input', () => {
    expect(buildMgToKg('abc')).toBeNull()
  })

  it('converts 1 000 000 mg to 1 kg', () => {
    const result = buildMgToKg('1000000')!
    expect(result.resultValue).toBe('1')
    expect(result.resultNumUnit).toBe('kg')
  })

  it('converts 500 mg to 5 × 10⁻⁴ kg (scientific notation below 0.001)', () => {
    const result = buildMgToKg('500')!
    // fmtNum formats values < 0.001 as scientific notation
    expect(result.resultValue).toMatch(/5.*10/)
    expect(result.resultValue).toContain('⁻')
  })

  it('has two steps', () => {
    const result = buildMgToKg('500')!
    expect(result.steps).toHaveLength(2)
  })

  it('step 1 converts mg to g', () => {
    const result = buildMgToKg('500')!
    expect(result.steps[0].numUnit).toBe('g')
    expect(result.steps[0].denUnit).toBe('mg')
    expect(result.steps[0].denCancelled).toBe(true)
  })

  it('step 2 converts g to kg', () => {
    const result = buildMgToKg('500')!
    expect(result.steps[1].numUnit).toBe('kg')
    expect(result.steps[1].numCancelled).toBe(false)
    expect(result.steps[1].denUnit).toBe('g')
    expect(result.steps[1].denCancelled).toBe(true)
  })

  it('start unit mg is marked cancelled', () => {
    const result = buildMgToKg('500')!
    expect(result.start.numUnit).toBe('mg')
    expect(result.start.numCancelled).toBe(true)
  })
})

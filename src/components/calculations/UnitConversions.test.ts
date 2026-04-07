import { describe, it, expect } from 'vitest'
import { toCelsius, fromCelsius, convertTemp, convertMass, convertVolume } from './UnitConversions'

// ── toCelsius ─────────────────────────────────────────────────────────────────

describe('toCelsius', () => {
  it('passes Celsius through unchanged', () => {
    expect(toCelsius(100, '°C')).toBe(100)
    expect(toCelsius(0, '°C')).toBe(0)
    expect(toCelsius(-40, '°C')).toBe(-40)
  })

  it('converts Fahrenheit to Celsius', () => {
    expect(toCelsius(32, '°F')).toBeCloseTo(0)
    expect(toCelsius(212, '°F')).toBeCloseTo(100)
    expect(toCelsius(-40, '°F')).toBeCloseTo(-40)
    expect(toCelsius(98.6, '°F')).toBeCloseTo(37)
  })

  it('converts Kelvin to Celsius', () => {
    expect(toCelsius(273.15, 'K')).toBeCloseTo(0)
    expect(toCelsius(373.15, 'K')).toBeCloseTo(100)
    expect(toCelsius(0, 'K')).toBeCloseTo(-273.15)
  })
})

// ── fromCelsius ───────────────────────────────────────────────────────────────

describe('fromCelsius', () => {
  it('passes Celsius through unchanged', () => {
    expect(fromCelsius(0, '°C')).toBe(0)
    expect(fromCelsius(100, '°C')).toBe(100)
  })

  it('converts Celsius to Fahrenheit', () => {
    expect(fromCelsius(0, '°F')).toBeCloseTo(32)
    expect(fromCelsius(100, '°F')).toBeCloseTo(212)
    expect(fromCelsius(-40, '°F')).toBeCloseTo(-40)
  })

  it('converts Celsius to Kelvin', () => {
    expect(fromCelsius(0, 'K')).toBeCloseTo(273.15)
    expect(fromCelsius(100, 'K')).toBeCloseTo(373.15)
    expect(fromCelsius(-273.15, 'K')).toBeCloseTo(0)
  })
})

// ── convertTemp round-trips ───────────────────────────────────────────────────

describe('convertTemp', () => {
  it('°C → °F', () => {
    expect(convertTemp(0, '°C', '°F')).toBeCloseTo(32)
    expect(convertTemp(100, '°C', '°F')).toBeCloseTo(212)
  })

  it('°F → °C', () => {
    expect(convertTemp(32, '°F', '°C')).toBeCloseTo(0)
    expect(convertTemp(212, '°F', '°C')).toBeCloseTo(100)
  })

  it('°C → K', () => {
    expect(convertTemp(0, '°C', 'K')).toBeCloseTo(273.15)
    expect(convertTemp(-273.15, '°C', 'K')).toBeCloseTo(0)
  })

  it('K → °C', () => {
    expect(convertTemp(273.15, 'K', '°C')).toBeCloseTo(0)
    expect(convertTemp(373.15, 'K', '°C')).toBeCloseTo(100)
  })

  it('°F → K', () => {
    expect(convertTemp(32, '°F', 'K')).toBeCloseTo(273.15)
    expect(convertTemp(212, '°F', 'K')).toBeCloseTo(373.15)
  })

  it('K → °F', () => {
    expect(convertTemp(273.15, 'K', '°F')).toBeCloseTo(32)
    expect(convertTemp(373.15, 'K', '°F')).toBeCloseTo(212)
  })

  it('same unit round-trips to itself', () => {
    expect(convertTemp(25, '°C', '°C')).toBeCloseTo(25)
    expect(convertTemp(77, '°F', '°F')).toBeCloseTo(77)
    expect(convertTemp(300, 'K', 'K')).toBeCloseTo(300)
  })

  it('-40 is the crossover point for °C and °F', () => {
    expect(convertTemp(-40, '°C', '°F')).toBeCloseTo(-40)
    expect(convertTemp(-40, '°F', '°C')).toBeCloseTo(-40)
  })
})

// ── convertMass ───────────────────────────────────────────────────────────────

describe('convertMass', () => {
  it('g → kg', () => {
    expect(convertMass(1000, 'g', 'kg')).toBeCloseTo(1)
    expect(convertMass(500, 'g', 'kg')).toBeCloseTo(0.5)
  })

  it('kg → g', () => {
    expect(convertMass(1, 'kg', 'g')).toBeCloseTo(1000)
    expect(convertMass(2.5, 'kg', 'g')).toBeCloseTo(2500)
  })

  it('g → mg', () => {
    expect(convertMass(1, 'g', 'mg')).toBeCloseTo(1000)
    expect(convertMass(0.5, 'g', 'mg')).toBeCloseTo(500)
  })

  it('mg → g', () => {
    expect(convertMass(1000, 'mg', 'g')).toBeCloseTo(1)
    expect(convertMass(250, 'mg', 'g')).toBeCloseTo(0.25)
  })

  it('g → lb', () => {
    expect(convertMass(453.592, 'g', 'lb')).toBeCloseTo(1)
    expect(convertMass(907.184, 'g', 'lb')).toBeCloseTo(2)
  })

  it('lb → g', () => {
    expect(convertMass(1, 'lb', 'g')).toBeCloseTo(453.592)
    expect(convertMass(2, 'lb', 'g')).toBeCloseTo(907.184)
  })

  it('g → oz', () => {
    expect(convertMass(28.3495, 'g', 'oz')).toBeCloseTo(1)
  })

  it('oz → g', () => {
    expect(convertMass(1, 'oz', 'g')).toBeCloseTo(28.3495)
  })

  it('same unit returns identity', () => {
    expect(convertMass(100, 'g', 'g')).toBeCloseTo(100)
    expect(convertMass(5, 'kg', 'kg')).toBeCloseTo(5)
  })

  it('kg → lb', () => {
    expect(convertMass(1, 'kg', 'lb')).toBeCloseTo(1000 / 453.592)
  })
})

// ── convertVolume ─────────────────────────────────────────────────────────────

describe('convertVolume', () => {
  it('L → mL', () => {
    expect(convertVolume(1, 'L', 'mL')).toBeCloseTo(1000)
    expect(convertVolume(0.25, 'L', 'mL')).toBeCloseTo(250)
  })

  it('mL → L', () => {
    expect(convertVolume(1000, 'mL', 'L')).toBeCloseTo(1)
    expect(convertVolume(500, 'mL', 'L')).toBeCloseTo(0.5)
  })

  it('L → gal', () => {
    expect(convertVolume(3.78541, 'L', 'gal')).toBeCloseTo(1)
    expect(convertVolume(1, 'L', 'gal')).toBeCloseTo(1 / 3.78541)
  })

  it('gal → L', () => {
    expect(convertVolume(1, 'gal', 'L')).toBeCloseTo(3.78541)
    expect(convertVolume(2, 'gal', 'L')).toBeCloseTo(7.57082)
  })

  it('L → fl oz', () => {
    expect(convertVolume(1, 'L', 'fl oz')).toBeCloseTo(1 / 0.0295735, 1)
  })

  it('fl oz → mL', () => {
    expect(convertVolume(1, 'fl oz', 'mL')).toBeCloseTo(29.5735)
  })

  it('L → cup', () => {
    expect(convertVolume(0.236588, 'L', 'cup')).toBeCloseTo(1)
  })

  it('cup → mL', () => {
    expect(convertVolume(1, 'cup', 'mL')).toBeCloseTo(236.588)
  })

  it('same unit returns identity', () => {
    expect(convertVolume(2, 'L', 'L')).toBeCloseTo(2)
    expect(convertVolume(500, 'mL', 'mL')).toBeCloseTo(500)
  })
})

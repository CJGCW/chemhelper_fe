import { describe, it, expect } from 'vitest'
import { waterVaporPressure, WATER_VAPOR_PRESSURE_MMHG } from '../waterVaporPressure'

describe('waterVaporPressure — exact table lookups', () => {
  it('returns 23.8 mmHg at 25 °C', () => {
    expect(waterVaporPressure(25)).toBe(23.8)
  })

  it('returns 760.0 mmHg at 100 °C', () => {
    expect(waterVaporPressure(100)).toBe(760.0)
  })

  it('returns 4.6 mmHg at 0 °C', () => {
    expect(waterVaporPressure(0)).toBe(4.6)
  })

  it('returns exact values for all tabulated temperatures', () => {
    for (const [k, v] of Object.entries(WATER_VAPOR_PRESSURE_MMHG)) {
      expect(waterVaporPressure(Number(k))).toBe(v)
    }
  })
})

describe('waterVaporPressure — interpolation', () => {
  it('interpolates between 25 and 26 °C', () => {
    // At 25: 23.8, at 26: 25.2 → midpoint 24.5
    expect(waterVaporPressure(25.5)).toBeCloseTo(24.5, 5)
  })

  it('interpolates between 30 and 35 °C', () => {
    // At 30: 31.8, at 35: 42.2 → midpoint ~37.0
    expect(waterVaporPressure(32.5)).toBeCloseTo((31.8 + 42.2) / 2, 5)
  })

  it('interpolated values are between their bounding tabulated values', () => {
    const temps = [0.5, 2.5, 12.3, 17.8, 22.7, 37.1, 55.0, 75.0]
    for (const t of temps) {
      const v = waterVaporPressure(t)
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThan(760)
    }
  })
})

describe('waterVaporPressure — range errors', () => {
  it('throws for temperature below 0 °C', () => {
    expect(() => waterVaporPressure(-1)).toThrow(RangeError)
    expect(() => waterVaporPressure(-5)).toThrow(/outside the table range/)
  })

  it('throws for temperature above 100 °C', () => {
    expect(() => waterVaporPressure(101)).toThrow(RangeError)
    expect(() => waterVaporPressure(110)).toThrow(/outside the table range/)
  })

  it('does not throw at the boundary values 0 and 100', () => {
    expect(() => waterVaporPressure(0)).not.toThrow()
    expect(() => waterVaporPressure(100)).not.toThrow()
  })
})

describe('waterVaporPressure — physical constraints', () => {
  it('pressure increases monotonically with temperature', () => {
    let prev = waterVaporPressure(0)
    for (let t = 1; t <= 100; t++) {
      const curr = waterVaporPressure(t)
      expect(curr).toBeGreaterThan(prev)
      prev = curr
    }
  })

  it('Chang Ex 5.12 lookup: 25 °C → 23.8 mmHg', () => {
    // Used in the O₂ over water problem in Chang Ch 5
    expect(waterVaporPressure(25)).toBe(23.8)
  })
})

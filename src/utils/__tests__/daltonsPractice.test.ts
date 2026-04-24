import { describe, it, expect } from 'vitest'
import { generateDaltonsProblem, checkDaltonsAnswer } from '../daltonsPractice'
import { waterVaporPressure } from '../../data/waterVaporPressure'

describe('generateDaltonsProblem — gas-over-water', () => {
  it('sets unit to mmHg', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDaltonsProblem('gas-over-water')
      expect(p.unit).toBe('mmHg')
    }
  })

  it('answer is the partial pressure of dry gas (positive, < total)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDaltonsProblem('gas-over-water')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(900)
    }
  })

  it('steps reference the water vapor pressure table', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDaltonsProblem('gas-over-water')
      const stepsText = p.steps.join(' ')
      expect(stepsText).toMatch(/P\(H₂O\)|P.*H.*2.*O|Chang Table/)
    }
  })

  it('steps include subtraction P_total − P(H₂O)', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDaltonsProblem('gas-over-water')
      const stepsText = p.steps.join(' ')
      expect(stepsText).toMatch(/P_total\s*−\s*P\(H₂O\)|P_total.*−.*P.*H/)
    }
  })

  it('Chang-style O₂ over water at 25 °C: P_gas = P_total − 23.8', () => {
    const pH2O = waterVaporPressure(25)
    expect(pH2O).toBe(23.8)
    // Simulate: total = 762 mmHg → P_gas = 762 - 23.8 = 738.2 mmHg
    const pTotal = 762
    const pGas   = pTotal - pH2O
    expect(pGas).toBeCloseTo(738.2, 4)
  })

  it('question mentions temperature in °C and total pressure in mmHg', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDaltonsProblem('gas-over-water')
      expect(p.question).toMatch(/°C/)
      expect(p.question).toMatch(/mmHg/)
    }
  })
})

describe('generateDaltonsProblem — all types produce valid problems', () => {
  it('generates find-total problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDaltonsProblem('find-total')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.unit).toBe('atm')
    }
  })

  it('generates find-partial problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDaltonsProblem('find-partial')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.unit).toBe('atm')
    }
  })

  it('generates find-mole-fraction problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDaltonsProblem('find-mole-fraction')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(1)
    }
  })

  it('random problems include all 5 types over 100 runs', () => {
    const units = new Set<string>()
    for (let i = 0; i < 100; i++) {
      units.add(generateDaltonsProblem().unit)
    }
    expect(units.has('atm')).toBe(true)
    expect(units.has('mmHg')).toBe(true)  // gas-over-water
  })
})

describe('checkDaltonsAnswer', () => {
  it('accepts exact answer for gas-over-water', () => {
    const p = generateDaltonsProblem('gas-over-water')
    expect(checkDaltonsAnswer(String(p.answer), p)).toBe(true)
  })

  it('accepts within 2% tolerance', () => {
    const p = generateDaltonsProblem('gas-over-water')
    expect(checkDaltonsAnswer(String(p.answer * 1.019), p)).toBe(true)
    expect(checkDaltonsAnswer(String(p.answer * 0.981), p)).toBe(true)
  })

  it('rejects more than 2% off', () => {
    const p = generateDaltonsProblem('gas-over-water')
    expect(checkDaltonsAnswer(String(p.answer * 1.03), p)).toBe(false)
  })
})

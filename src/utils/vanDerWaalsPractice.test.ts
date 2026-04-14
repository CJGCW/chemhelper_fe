import { describe, it, expect } from 'vitest'
import {
  VDW_GASES,
  generateVdWProblem,
  checkVdWAnswer,
} from './vanDerWaalsPractice'

const R = 0.082057

describe('VDW_GASES', () => {
  it('has at least 8 gases', () => {
    expect(VDW_GASES.length).toBeGreaterThanOrEqual(8)
  })

  it('every gas has positive a and b constants', () => {
    for (const g of VDW_GASES) {
      expect(g.a).toBeGreaterThan(0)
      expect(g.b).toBeGreaterThan(0)
      expect(g.name.length).toBeGreaterThan(0)
      expect(g.formula.length).toBeGreaterThan(0)
    }
  })

  it('CO₂ has expected a and b values', () => {
    const co2 = VDW_GASES.find(g => g.formula === 'CO₂')!
    expect(co2).toBeDefined()
    expect(co2.a).toBeCloseTo(3.640, 2)
    expect(co2.b).toBeCloseTo(0.04267, 4)
  })

  it('He has the smallest a constant (least intermolecular attraction)', () => {
    const sorted = [...VDW_GASES].sort((x, y) => x.a - y.a)
    expect(sorted[0].formula).toBe('He')
  })
})

describe('generateVdWProblem', () => {
  it('returns all required fields', () => {
    const p = generateVdWProblem()
    expect(p.gas).toBeDefined()
    expect(p.givenN).toBeGreaterThan(0)
    expect(p.givenV).toBeGreaterThan(0)
    expect(p.givenT).toBeGreaterThan(0)
    expect(p.idealP).toBeGreaterThan(0)
    expect(p.realP).toBeGreaterThan(0)
    expect(p.answerUnit).toBe('atm')
    expect(p.question.length).toBeGreaterThan(0)
    expect(p.steps.length).toBeGreaterThanOrEqual(6)
  })

  it('ideal pressure matches PV=nRT', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateVdWProblem()
      const expected = (p.givenN * R * p.givenT) / p.givenV
      expect(p.idealP).toBeCloseTo(expected, 4)
    }
  })

  it('real pressure matches van der Waals formula', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateVdWProblem()
      const { a, b } = p.gas
      const { givenN: n, givenV: V, givenT: T } = p
      const expected = (n * R * T) / (V - n * b) - a * (n / V) ** 2
      expect(p.realP).toBeCloseTo(expected, 4)
    }
  })

  it('real pressure is always positive', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateVdWProblem()
      expect(p.realP).toBeGreaterThan(0)
    }
  })

  it('deviation percent is consistent', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateVdWProblem()
      const expected = ((p.realP - p.idealP) / p.idealP) * 100
      expect(p.deviationPct).toBeCloseTo(expected, 3)
    }
  })
})

describe('manual spot-checks', () => {
  it('CO₂: 1 mol in 1 L at 300 K — real P lower than ideal (attractive forces dominate at moderate density)', () => {
    // P_ideal = nRT/V = 1 × 0.082057 × 300 / 1 = 24.617 atm
    // P_real  = 0.082057×300/(1-0.04267) − 3.640×(1/1)² ≈ 25.759 − 3.640 = 22.12 atm
    const co2 = VDW_GASES.find(g => g.formula === 'CO₂')!
    const n = 1, V = 1, T = 300
    const idealP = (n * R * T) / V
    const realP  = (n * R * T) / (V - n * co2.b) - co2.a * (n / V) ** 2
    expect(idealP).toBeCloseTo(24.617, 1)
    expect(realP).toBeCloseTo(22.12, 1)
    expect(realP).toBeLessThan(idealP)
  })

  it('He: 1 mol in 10 L at 300 K — ideal and real nearly identical (He is near-ideal)', () => {
    const he = VDW_GASES.find(g => g.formula === 'He')!
    const n = 1, V = 10, T = 300
    const idealP = (n * R * T) / V
    const realP  = (n * R * T) / (V - n * he.b) - he.a * (n / V) ** 2
    const devPct = Math.abs((realP - idealP) / idealP * 100)
    expect(devPct).toBeLessThan(1) // less than 1% deviation
  })
})

describe('checkVdWAnswer', () => {
  it('accepts exact answer', () => {
    const p = generateVdWProblem()
    expect(checkVdWAnswer(String(p.realP), p)).toBe(true)
  })

  it('accepts answer within +2%', () => {
    const p = generateVdWProblem()
    expect(checkVdWAnswer(String(p.realP * 1.019), p)).toBe(true)
  })

  it('accepts answer within -2%', () => {
    const p = generateVdWProblem()
    expect(checkVdWAnswer(String(p.realP * 0.981), p)).toBe(true)
  })

  it('rejects answer outside ±2%', () => {
    const p = generateVdWProblem()
    expect(checkVdWAnswer(String(p.realP * 1.03), p)).toBe(false)
    expect(checkVdWAnswer(String(p.realP * 0.97), p)).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = generateVdWProblem()
    expect(checkVdWAnswer('abc', p)).toBe(false)
    expect(checkVdWAnswer('', p)).toBe(false)
  })

  it('rejects zero and negative', () => {
    const p = generateVdWProblem()
    expect(checkVdWAnswer('0', p)).toBe(false)
    expect(checkVdWAnswer('-5', p)).toBe(false)
  })
})

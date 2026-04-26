import { describe, it, expect } from 'vitest'
import { genGasProblem, checkGasAnswer } from './idealGasPractice'
import { R, toAtm } from './idealGas'

describe('genGasProblem', () => {
  it('returns required fields', () => {
    const p = genGasProblem()
    expect(p).toHaveProperty('solveFor')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('answerUnit')
    expect(p).toHaveProperty('question')
    expect(['P', 'V', 'n', 'T']).toContain(p.solveFor)
  })

  it('answer is positive', () => {
    for (let i = 0; i < 30; i++) {
      expect(genGasProblem().answer).toBeGreaterThan(0)
    }
  })

  it('random problems: correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genGasProblem()
      expect(checkGasAnswer(p, String(p.answer))).toBe(true)
    }
  })
})

describe('checkGasAnswer', () => {
  it('rejects NaN and empty string', () => {
    const p = genGasProblem()
    expect(checkGasAnswer(p, 'abc')).toBe(false)
    expect(checkGasAnswer(p, '')).toBe(false)
    expect(checkGasAnswer(p, '0')).toBe(false)
  })

  it('accepts within 2% tolerance', () => {
    const p = genGasProblem()
    const off = p.answer * 1.019
    expect(checkGasAnswer(p, String(off))).toBe(true)
    const tooFar = p.answer * 1.025
    expect(checkGasAnswer(p, String(tooFar))).toBe(false)
  })
})

describe('STP verification: 1 mol at 273.15 K and 1 atm → 22.4 L', () => {
  it('PV=nRT gives 22.4 L at STP', () => {
    const n = 1, T = 273.15, P_atm = 1
    const V = n * R * T / P_atm
    expect(V).toBeCloseTo(22.414, 1)
  })

  it('genGasProblem solveFor=V answer satisfies PV=nRT (within 0.5%)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genGasProblem()
      if (p.solveFor !== 'V') continue
      const P_atm = toAtm(p.givenP!, p.pUnit)
      const expected = (p.givenN! * R * p.givenT!) / P_atm
      // answer is sf3-rounded; allow 0.5% relative error
      expect(Math.abs(p.answer - expected) / expected).toBeLessThan(0.005)
    }
  })

  it('genGasProblem solveFor=T answer satisfies PV=nRT (within 0.5%)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genGasProblem()
      if (p.solveFor !== 'T') continue
      const P_atm = toAtm(p.givenP!, p.pUnit)
      const expected = (P_atm * p.givenV!) / (p.givenN! * R)
      expect(Math.abs(p.answer - expected) / expected).toBeLessThan(0.005)
    }
  })
})

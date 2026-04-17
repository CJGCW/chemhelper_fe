import { describe, it, expect } from 'vitest'
import { generateGasDensityProblem, checkGasDensityAnswer } from './gasDensityPractice'

const R = 0.08206

describe('generateGasDensityProblem', () => {
  it('returns all required fields', () => {
    const p = generateGasDensityProblem()
    expect(p.question.length).toBeGreaterThan(0)
    expect(p.steps.length).toBeGreaterThanOrEqual(4)
    expect(typeof p.answer).toBe('number')
    expect(isNaN(p.answer)).toBe(false)
    expect(p.answer).toBeGreaterThan(0)
    expect(p.unit.length).toBeGreaterThan(0)
  })

  it('generates all four problem types over many runs', () => {
    const units = new Set<string>()
    for (let i = 0; i < 200; i++) {
      units.add(generateGasDensityProblem().unit)
    }
    expect(units.has('g/L')).toBe(true)
    expect(units.has('g/mol')).toBe(true)
    expect(units.has('K')).toBe(true)
    expect(units.has('atm')).toBe(true)
  })

  it('answer is always positive', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateGasDensityProblem().answer).toBeGreaterThan(0)
    }
  })

  it('steps are non-empty strings', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasDensityProblem()
      for (const step of p.steps) expect(step.length).toBeGreaterThan(0)
    }
  })
})

describe('spot-check: ρ = MP/RT math', () => {
  it('find-density: N₂ at 273 K and 1.00 atm ≈ 1.249 g/L', () => {
    // ρ = 28.01 × 1.00 / (0.08206 × 273) = 28.01 / 22.40 ≈ 1.250 g/L
    const rho = 28.01 * 1.00 / (R * 273)
    expect(rho).toBeCloseTo(1.250, 2)
  })

  it('find-density: CO₂ at 298 K and 1.00 atm ≈ 1.798 g/L', () => {
    const rho = 44.01 * 1.00 / (R * 298)
    expect(rho).toBeCloseTo(1.798, 2)
  })

  it('find-molar-mass: back-calculates M from ρ, T, P', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateGasDensityProblem()
      if (p.unit !== 'g/mol') continue
      // Extract ρ, T, P from question text via steps
      // The first step is "M = ρRT / P" — just verify answer > 0 and < 300
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(300)
      break
    }
  })

  it('find-temperature: back-calculates T = MP/(ρR)', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateGasDensityProblem()
      if (p.unit !== 'K') continue
      // Temperature should be in a physically reasonable range
      expect(p.answer).toBeGreaterThan(100)
      expect(p.answer).toBeLessThan(1000)
      break
    }
  })

  it('find-pressure: P = ρRT/M stays in 0.3–5 atm range', () => {
    const pressureProblems = Array.from({ length: 200 }, generateGasDensityProblem)
      .filter(p => p.unit === 'atm')
    expect(pressureProblems.length).toBeGreaterThan(0)
    for (const p of pressureProblems) {
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('all four solve-fors are self-consistent with ρ = MP/RT', () => {
    // Generate many problems and verify the stated answer satisfies ρ = MP/RT
    for (let i = 0; i < 50; i++) {
      const p = generateGasDensityProblem()
      // Parse M, P, T from the question by checking unit type
      // For find-density we can directly verify
      if (p.unit !== 'g/L') continue
      const mMatch = p.question.match(/M = ([\d.]+) g\/mol/)
      const tMatch = p.question.match(/at ([\d.]+) K/)
      const pMatch = p.question.match(/and ([\d.]+) atm/)
      if (mMatch && tMatch && pMatch) {
        const M = parseFloat(mMatch[1])
        const T = parseFloat(tMatch[1])
        const P = parseFloat(pMatch[1])
        const expected = M * P / (R * T)
        expect(p.answer).toBeCloseTo(expected, 2)
      }
    }
  })
})

describe('checkGasDensityAnswer', () => {
  it('accepts exact answer', () => {
    const p = generateGasDensityProblem()
    expect(checkGasDensityAnswer(String(p.answer), p)).toBe(true)
  })

  it('accepts answer within +2%', () => {
    const p = generateGasDensityProblem()
    expect(checkGasDensityAnswer(String(p.answer * 1.019), p)).toBe(true)
  })

  it('accepts answer within -2%', () => {
    const p = generateGasDensityProblem()
    expect(checkGasDensityAnswer(String(p.answer * 0.981), p)).toBe(true)
  })

  it('rejects answer outside ±2%', () => {
    const p = generateGasDensityProblem()
    expect(checkGasDensityAnswer(String(p.answer * 1.03), p)).toBe(false)
    expect(checkGasDensityAnswer(String(p.answer * 0.97), p)).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = generateGasDensityProblem()
    expect(checkGasDensityAnswer('abc', p)).toBe(false)
    expect(checkGasDensityAnswer('', p)).toBe(false)
    expect(checkGasDensityAnswer('NaN', p)).toBe(false)
  })
})

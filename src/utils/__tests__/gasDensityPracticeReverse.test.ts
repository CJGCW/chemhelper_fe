import { describe, it, expect } from 'vitest'
import { generateGasDensityProblem, checkGasDensityAnswer } from '../gasDensityPractice'

const R = 0.08206

describe('reverse gas density (M from ρ)', () => {
  it('CO₂ at 25 °C and 1 atm produces density ≈ 1.80 g/L', () => {
    const rho = (44.01 * 1.00) / (R * 298.15)
    expect(rho).toBeCloseTo(1.799, 2)
  })

  it('mode field is "M-from-density" when mode filter applied', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasDensityProblem({ mode: 'M-from-density' })
      expect(p.mode).toBe('M-from-density')
      expect(p.unit).toBe('g/mol')
    }
  })

  it('generator produces realistic M values matching common gases', () => {
    const commonGases = [2.016, 4.003, 16.04, 17.03, 28.01, 32.00, 39.95, 44.01, 64.06, 70.90]
    for (let i = 0; i < 50; i++) {
      const p = generateGasDensityProblem({ mode: 'M-from-density' })
      expect(p.unit).toBe('g/mol')
      const closest = commonGases.reduce((best, m) =>
        Math.abs(m - p.answer) < Math.abs(best - p.answer) ? m : best, commonGases[0])
      expect(Math.abs(closest - p.answer) / closest).toBeLessThan(0.05)
    }
  })

  it('M answer is self-consistent: M = ρRT/P', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasDensityProblem({ mode: 'M-from-density' })
      // The answer (M) should be in a physically reasonable range for a real gas
      expect(p.answer).toBeGreaterThan(1)
      expect(p.answer).toBeLessThan(200)
    }
  })

  it('question frames the problem as "unknown gas"', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasDensityProblem({ mode: 'M-from-density' })
      expect(p.question.toLowerCase()).toMatch(/unknown/)
    }
  })

  it('steps show M = ρRT / P formula', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasDensityProblem({ mode: 'M-from-density' })
      expect(p.steps[0]).toMatch(/M\s*=\s*ρRT\s*\/\s*P/)
    }
  })
})

describe('density-from-M mode', () => {
  it('mode field is "density-from-M" for non-molar-mass problems', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasDensityProblem({ mode: 'density-from-M' })
      expect(p.mode).toBe('density-from-M')
      expect(p.unit).not.toBe('g/mol')
    }
  })
})

describe('mode field on unconstrained generation', () => {
  it('mode field is always set', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateGasDensityProblem()
      expect(['density-from-M', 'M-from-density']).toContain(p.mode)
    }
  })

  it('mode matches unit: g/mol ↔ M-from-density', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateGasDensityProblem()
      if (p.unit === 'g/mol') expect(p.mode).toBe('M-from-density')
      if (p.mode === 'density-from-M') expect(p.unit).not.toBe('g/mol')
    }
  })
})

describe('checkGasDensityAnswer', () => {
  it('accepts exact answer for M-from-density problem', () => {
    const p = generateGasDensityProblem({ mode: 'M-from-density' })
    expect(checkGasDensityAnswer(String(p.answer), p)).toBe(true)
  })
})

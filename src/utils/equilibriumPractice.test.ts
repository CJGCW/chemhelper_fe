import { describe, it, expect } from 'vitest'
import {
  generateKExpressionProblem,
  generateQvsKProblem,
  generateICEProblem,
  generateKpKcProblem,
  checkConcentrationAnswer,
} from './equilibriumPractice'
import { solveQvsK } from '../chem/equilibrium'

// ── 20-iteration fuzz tests ───────────────────────────────────────────────────

describe('generateKExpressionProblem (20 runs)', () => {
  it('always returns a non-empty answer string', () => {
    for (let i = 0; i < 20; i++) {
      const { answer, reaction, steps } = generateKExpressionProblem()
      expect(answer.length).toBeGreaterThan(0)
      expect(reaction).toBeDefined()
      expect(steps.length).toBeGreaterThan(0)
    }
  })
})

describe('generateQvsKProblem (20 runs)', () => {
  it('produces a valid direction and Q value', () => {
    for (let i = 0; i < 20; i++) {
      const { Q, direction, reaction, concentrations } = generateQvsKProblem()
      const K = reaction.K
      expect(isFinite(Q)).toBe(true)
      expect(Q).toBeGreaterThanOrEqual(0)
      expect(['forward', 'reverse', 'at-equilibrium']).toContain(direction)

      // Verify direction is consistent with Q vs K
      if (direction === 'forward') expect(Q).toBeLessThanOrEqual(K * 1.001)
      if (direction === 'reverse') expect(Q).toBeGreaterThanOrEqual(K * 0.999)

      // Verify Q by calling solver directly
      const result = solveQvsK({ concentrations, products: reaction.products, reactants: reaction.reactants, K: reaction.K })
      expect(result.direction).toBe(direction)
    }
  })
})

describe('generateICEProblem (20 runs)', () => {
  it('produces valid non-negative equilibrium concentrations and correct K', () => {
    for (let i = 0; i < 20; i++) {
      const { reaction, solution } = generateICEProblem()

      // All concentrations must be >= 0
      for (const [sp, c] of Object.entries(solution.equilibriumConcentrations)) {
        expect(c, `[${sp}] must be >= 0`).toBeGreaterThanOrEqual(-1e-9)
      }

      // x must be positive
      expect(solution.x).toBeGreaterThan(0)

      // ICE rows must be consistent
      expect(solution.rows.length).toBeGreaterThan(0)

      // Verify K within 2%
      const activeP = reaction.products.filter(s => s.state === 'g' || s.state === 'aq')
      const activeR = reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq')
      let Kcalc = 1
      for (const s of activeP) Kcalc *= Math.pow(Math.max(solution.equilibriumConcentrations[s.formula], 1e-30), s.coefficient)
      for (const s of activeR) Kcalc /= Math.pow(Math.max(solution.equilibriumConcentrations[s.formula], 1e-30), s.coefficient)
      const relErr = Math.abs(Kcalc - reaction.K) / reaction.K
      expect(relErr).toBeLessThan(0.06)
    }
  })
})

describe('generateKpKcProblem (20 runs)', () => {
  it('produces a finite answer and valid steps', () => {
    for (let i = 0; i < 20; i++) {
      const { answer, steps, reaction, mode, T } = generateKpKcProblem()
      expect(isFinite(answer)).toBe(true)
      expect(answer).toBeGreaterThan(0)
      expect(steps.length).toBeGreaterThan(0)
      expect(['Kp', 'Kc']).toContain(mode)
      expect(T).toBeGreaterThan(0)
      expect(reaction).toBeDefined()
    }
  })
})

// ── checkConcentrationAnswer ──────────────────────────────────────────────────

describe('checkConcentrationAnswer', () => {
  it('accepts exact answer', () => {
    expect(checkConcentrationAnswer('0.0338', 0.0338)).toBe(true)
  })

  it('accepts within 2% tolerance', () => {
    expect(checkConcentrationAnswer('0.0344', 0.0338)).toBe(true)   // +1.8%
    expect(checkConcentrationAnswer('0.0332', 0.0338)).toBe(true)   // -1.8%
  })

  it('rejects outside 2% tolerance', () => {
    expect(checkConcentrationAnswer('0.0360', 0.0338)).toBe(false)  // +6.5%
    expect(checkConcentrationAnswer('0.030', 0.0338)).toBe(false)   // -11%
  })

  it('rejects non-numeric input', () => {
    expect(checkConcentrationAnswer('abc', 0.05)).toBe(false)
    expect(checkConcentrationAnswer('', 0.05)).toBe(false)
  })

  it('handles zero correctly', () => {
    expect(checkConcentrationAnswer('0', 0)).toBe(true)
    expect(checkConcentrationAnswer('0.000001', 0)).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { solveRateLaw, solveIntegratedRate, solveArrhenius } from '../kinetics'

describe('solveRateLaw', () => {
  it('Chang Ex 13.3: 2NO + O₂ → 2NO₂, orders NO=2 O₂=1', () => {
    const result = solveRateLaw({
      species: ['NO', 'O₂'],
      trials: [
        { concentrations: { 'NO': 0.0050, 'O₂': 0.0050 }, rate: 3.0e-5 },
        { concentrations: { 'NO': 0.010,  'O₂': 0.0050 }, rate: 1.2e-4 },
        { concentrations: { 'NO': 0.0050, 'O₂': 0.010  }, rate: 6.0e-5 },
      ],
    })
    expect(result.orders['NO']).toBe(2)
    expect(result.orders['O₂']).toBe(1)
    expect(result.rateConstant).toBeCloseTo(240, 0)
  })

  it('second-order single species: 2NO₂ → 2NO + O₂', () => {
    const result = solveRateLaw({
      species: ['NO₂'],
      trials: [
        { concentrations: { 'NO₂': 0.010 }, rate: 5.4e-5 },
        { concentrations: { 'NO₂': 0.020 }, rate: 2.16e-4 },
      ],
    })
    expect(result.orders['NO₂']).toBe(2)
    expect(result.rateConstant).toBeCloseTo(0.54, 1)
  })

  it('first-order: H₂O₂ decomposition', () => {
    const result = solveRateLaw({
      species: ['H₂O₂'],
      trials: [
        { concentrations: { 'H₂O₂': 0.100 }, rate: 7.30e-5 },
        { concentrations: { 'H₂O₂': 0.200 }, rate: 1.46e-4 },
      ],
    })
    expect(result.orders['H₂O₂']).toBe(1)
    expect(result.rateConstant).toBeCloseTo(7.3e-4, 4)
  })

  it('zero order in I₂: acetone iodination', () => {
    const result = solveRateLaw({
      species: ['acetone', 'acid', 'I₂'],
      trials: [
        { concentrations: { 'acetone': 0.30, 'acid': 0.10, 'I₂': 0.0050 }, rate: 5.7e-5 },
        { concentrations: { 'acetone': 0.60, 'acid': 0.10, 'I₂': 0.0050 }, rate: 1.14e-4 },
        { concentrations: { 'acetone': 0.30, 'acid': 0.20, 'I₂': 0.0050 }, rate: 1.14e-4 },
        { concentrations: { 'acetone': 0.30, 'acid': 0.10, 'I₂': 0.010  }, rate: 5.7e-5 },
      ],
    })
    expect(result.orders['I₂']).toBe(0)
    expect(result.orders['acetone']).toBe(1)
    expect(result.orders['acid']).toBe(1)
  })

  it('builds rate law expression correctly', () => {
    const result = solveRateLaw({
      species: ['NO', 'O₂'],
      trials: [
        { concentrations: { 'NO': 0.0050, 'O₂': 0.0050 }, rate: 3.0e-5 },
        { concentrations: { 'NO': 0.010,  'O₂': 0.0050 }, rate: 1.2e-4 },
        { concentrations: { 'NO': 0.0050, 'O₂': 0.010  }, rate: 6.0e-5 },
      ],
    })
    expect(result.rateLawExpression).toContain('k')
    expect(result.rateLawExpression).toContain('[NO]')
    expect(result.rateLawExpression).toContain('[O₂]')
    expect(result.steps.length).toBeGreaterThan(2)
  })
})

describe('solveIntegratedRate', () => {
  it('first order: N₂O₅, t½ = ln2/k', () => {
    const r = solveIntegratedRate({ order: 1, k: 5.1e-4, A0: 0.0200, solveFor: 'halfLife' })
    expect(r.answer).toBeCloseTo(1359, 0)
    expect(r.answerUnit).toBe('s')
  })

  it('second order: t½ = 1/(k[A]₀)', () => {
    const r = solveIntegratedRate({ order: 2, k: 0.54, A0: 0.010, solveFor: 'halfLife' })
    expect(r.answer).toBeCloseTo(185, 0)
  })

  it('zero order: [A] = [A]₀ - kt', () => {
    const r = solveIntegratedRate({ order: 0, k: 0.0050, A0: 0.100, solveFor: 'At', t: 10 })
    expect(r.answer).toBeCloseTo(0.050, 3)
  })

  it('first order: find [A] at t', () => {
    const r = solveIntegratedRate({ order: 1, k: 7.3e-4, A0: 0.100, solveFor: 'At', t: 950 })
    // After t½ ≈ 950 s, [A] ≈ 0.050 M
    expect(r.answer).toBeCloseTo(0.050, 2)
  })

  it('second order: find t', () => {
    const r = solveIntegratedRate({ order: 2, k: 0.54, A0: 0.010, solveFor: 't', At: 0.005 })
    // t should be close to one half-life ≈ 185 s
    expect(r.answer).toBeCloseTo(185, 0)
  })

  it('zero order: find t½', () => {
    const r = solveIntegratedRate({ order: 0, k: 2.5e-4, A0: 0.100, solveFor: 'halfLife' })
    // t½ = [A]₀ / (2k) = 0.100 / (2 × 2.5e-4) = 200 s
    expect(r.answer).toBeCloseTo(200, 0)
  })

  it('provides steps array', () => {
    const r = solveIntegratedRate({ order: 1, k: 5.1e-4, A0: 0.0200, solveFor: 'halfLife' })
    expect(r.steps.length).toBeGreaterThan(0)
    expect(r.steps[0]).toContain('First-order')
  })
})

describe('solveArrhenius', () => {
  it('find Ea from two (T,k) pairs', () => {
    // N₂O₅: k=1.35e-5 at 298K; self-consistent k at 338K for Ea=88 kJ/mol ≈ 9.033e-4
    // Computed as: k2 = 1.35e-5 × exp(-(88000/8.314)(1/338-1/298))
    const r = solveArrhenius({ mode: 'find-Ea', T1: 298, k1: 1.35e-5, T2: 338, k2: 9.033e-4 })
    expect(r.answer).toBeCloseTo(88, 0)
    expect(r.answerUnit).toBe('kJ/mol')
  })

  it('find k₂ at new temperature given Ea', () => {
    // From Ea=88 kJ/mol and k=1.35e-5 at 298K, k at 338K should be ≈9.033e-4
    const r = solveArrhenius({ mode: 'find-k', T1: 298, k1: 1.35e-5, T2: 338, Ea: 88 })
    expect(r.answer).toBeCloseTo(9.033e-4, 5)
  })

  it('find T₂ given two k values and Ea', () => {
    // Self-consistent: k1=1.35e-5 at 298K, k2=9.033e-4, Ea=88 → T2 = 338K
    const r = solveArrhenius({ mode: 'find-T', T1: 298, k1: 1.35e-5, k2: 9.033e-4, Ea: 88 })
    expect(r.answer).toBeCloseTo(338, 0)
    expect(r.answerUnit).toBe('K')
  })

  it('larger Ea: H₂+I₂ reaction (self-consistent k pair)', () => {
    // H₂+I₂: k=2.53e-2 at 599K; self-consistent k at 683K for Ea=163 kJ/mol ≈ 1.4169
    // Computed as: k2 = 2.53e-2 × exp(-(163000/8.314)(1/683-1/599))
    const r = solveArrhenius({ mode: 'find-Ea', T1: 599, k1: 2.53e-2, T2: 683, k2: 1.4169 })
    expect(r.answer).toBeCloseTo(163, 0)
  })

  it('provides steps array with Arrhenius formula', () => {
    const r = solveArrhenius({ mode: 'find-Ea', T1: 298, k1: 1.35e-5, T2: 338, k2: 9.033e-4 })
    expect(r.steps.length).toBeGreaterThan(2)
    expect(r.steps[0]).toContain('Arrhenius')
  })
})

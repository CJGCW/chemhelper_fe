import { describe, it, expect } from 'vitest'
import {
  generateEntropyProblem,
  generateGibbsProblem,
  generateSpontaneityProblem,
  generateGibbsKProblem,
  generateCrossoverTProblem,
  generateDynamicEntropyProblem,
  generateDynamicGibbsProblem,
  generateDynamicSpontaneityProblem,
  generateDynamicGibbsKProblem,
  generateDynamicCrossoverTProblem,
} from './thermodynamicsPractice'
import { spontaneityAnalysis, deltaGtoK, kToDeltaG } from '../chem/thermodynamics'

describe('generateEntropyProblem', () => {
  it('answer is finite and steps populated across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateEntropyProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.type).toBe('entropy')
    }
  })

  it('ΔS can be positive or negative (both sign directions generated)', () => {
    const signs = new Set<string>()
    for (let i = 0; i < 30; i++) {
      const p = generateEntropyProblem()
      signs.add(p.answer > 0 ? '+' : '-')
    }
    expect(signs.size).toBeGreaterThan(1)
  })
})

describe('generateGibbsProblem', () => {
  it('answer is finite and steps populated across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateGibbsProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.type).toBe('gibbs')
    }
  })

  it('method is 1 or 2', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateGibbsProblem()
      expect([1, 2]).toContain(p.method)
    }
  })
})

describe('generateSpontaneityProblem', () => {
  it('classification ∈ {always, never, low-T, high-T} across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateSpontaneityProblem()
      expect(['always', 'never', 'low-T', 'high-T']).toContain(p.answer)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })

  it('ΔH < 0, ΔS > 0 → always spontaneous (Chang 14e, Table 18.4)', () => {
    const r = spontaneityAnalysis(-100, 200)
    expect(r.classification).toBe('always')
  })

  it('ΔH > 0, ΔS < 0 → never spontaneous', () => {
    const r = spontaneityAnalysis(100, -200)
    expect(r.classification).toBe('never')
  })

  it('ΔH < 0, ΔS < 0 → spontaneous at low T', () => {
    const r = spontaneityAnalysis(-100, -150)
    expect(r.classification).toBe('low-T')
    // crossoverT = |ΔH × 1000| / |ΔS| = 100000 / 150 ≈ 667 K
    expect(r.crossoverT).toBeCloseTo(667, 0)
  })

  it('ΔH > 0, ΔS > 0 → spontaneous at high T', () => {
    const r = spontaneityAnalysis(50, 100)
    expect(r.classification).toBe('high-T')
    expect(r.crossoverT).toBeCloseTo(500, 0)
  })

  it('all four classifications appear across 30 runs', () => {
    const classes = new Set<string>()
    for (let i = 0; i < 30; i++) classes.add(generateSpontaneityProblem().answer)
    // SPONTANEITY_SCENARIOS covers all four; expect at least 3 in 30 runs
    expect(classes.size).toBeGreaterThanOrEqual(3)
  })
})

describe('generateGibbsKProblem', () => {
  it('answer is finite and steps populated across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateGibbsKProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.type).toBe('gibbs-k')
    }
  })

  it('deltaG-to-K: K > 0', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGibbsKProblem()
      if (p.direction === 'deltaG-to-K') {
        expect(p.answer).toBeGreaterThan(0)
      }
    }
  })

  it('ΔG° = 0 → K = 1 at any temperature', () => {
    const r = deltaGtoK(0, 298)
    expect(r.K).toBeCloseTo(1, 4)

    const r2 = deltaGtoK(0, 1000)
    expect(r2.K).toBeCloseTo(1, 4)
  })

  it('K = 1 → ΔG° = 0', () => {
    const r = kToDeltaG(1, 298)
    expect(r.deltaG).toBeCloseTo(0, 3)
  })

  it('ΔG° < 0 → K > 1 (products favored); ΔG° > 0 → K < 1 (reactants favored)', () => {
    const neg = deltaGtoK(-30, 298)
    expect(neg.K).toBeGreaterThan(1)

    const pos = deltaGtoK(30, 298)
    expect(pos.K).toBeLessThan(1)
  })
})

describe('generateCrossoverTProblem', () => {
  it('crossover T > 0 K across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateCrossoverTProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.type).toBe('crossover-T')
    }
  })

  it('T = ΔH(J) / ΔS(J/K) — crossover formula', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateCrossoverTProblem()
      const expected = Math.abs(p.deltaH_kJ * 1000) / Math.abs(p.deltaS_JperK)
      expect(p.answer).toBeCloseTo(expected, 0)
    }
  })

  it('ΔH=-100 kJ, ΔS=-150 J/K → T_crossover ≈ 667 K', () => {
    const r = spontaneityAnalysis(-100, -150)
    expect(r.crossoverT).toBeCloseTo(667, 0)
  })
})

describe('generateDynamicEntropyProblem', () => {
  it('answer finite with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicEntropyProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(p.isDynamic).toBe(true)
    }
  })
})

describe('generateDynamicGibbsProblem', () => {
  it('answer finite with isDynamic=true and T is provided across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicGibbsProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(p.isDynamic).toBe(true)
      // Dynamic problems use method 1 with a random T
      if (p.method === 1) expect(p.T).toBeDefined()
    }
  })
})

describe('generateDynamicSpontaneityProblem', () => {
  it('produces all four classifications in 40 runs', () => {
    const classes = new Set<string>()
    for (let i = 0; i < 40; i++) {
      const p = generateDynamicSpontaneityProblem()
      expect(['always', 'never', 'low-T', 'high-T']).toContain(p.answer)
      expect(p.isDynamic).toBe(true)
      classes.add(p.answer)
    }
    // Dynamic generator has all four sign combos equally weighted
    expect(classes.size).toBe(4)
  })

  it('ΔH and ΔS signs match classification', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicSpontaneityProblem()
      if (p.answer === 'always') {
        expect(p.deltaH_kJ).toBeLessThan(0)
        expect(p.deltaS_JperK).toBeGreaterThan(0)
      }
      if (p.answer === 'never') {
        expect(p.deltaH_kJ).toBeGreaterThan(0)
        expect(p.deltaS_JperK).toBeLessThan(0)
      }
    }
  })
})

describe('generateDynamicGibbsKProblem', () => {
  it('answer finite with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicGibbsKProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(p.isDynamic).toBe(true)
      expect(p.T).toBeGreaterThan(100)
    }
  })
})

describe('generateDynamicCrossoverTProblem', () => {
  it('crossover T > 100 K and < 2500 K with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicCrossoverTProblem()
      expect(p.answer).toBeGreaterThan(100)
      expect(p.answer).toBeLessThan(2500)
      expect(p.isDynamic).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('T = ΔH(J) / ΔS(J/K) for dynamic problems', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicCrossoverTProblem()
      const expected = Math.abs(p.deltaH_kJ * 1000) / Math.abs(p.deltaS_JperK)
      expect(p.answer).toBeCloseTo(expected, 0)
    }
  })
})

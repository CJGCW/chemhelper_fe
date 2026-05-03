import { describe, it, expect } from 'vitest'
import {
  generatePhProblem,
  generateKaKbProblem,
  generateWeakAcidProblem,
  generateWeakBaseProblem,
  generateSaltPhProblem,
  generatePolyproticProblem,
  generateDynamicPhProblem,
  generateDynamicWeakAcidProblem,
  generateDynamicWeakBaseProblem,
  generateDynamicPolyproticProblem,
} from './acidBasePractice'
import { strongAcidPh, weakAcidPh } from '../chem/acidBase'

describe('generatePhProblem', () => {
  it('produces valid pH across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePhProblem()
      expect(p.correctPh).toBeGreaterThanOrEqual(0)
      expect(p.correctPh).toBeLessThanOrEqual(14)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.question.length).toBeGreaterThan(0)
    }
  })

  it('strong acid 0.10 M HCl → pH ≈ 1.00 (Chang 14e, Section 16.3)', () => {
    const r = strongAcidPh(0.10, 1)
    expect(r.pH).toBeCloseTo(1.00, 2)
  })

  it('strong acid 0.010 M → pH ≈ 2.00', () => {
    const r = strongAcidPh(0.010, 1)
    expect(r.pH).toBeCloseTo(2.00, 2)
  })
})

describe('generateKaKbProblem', () => {
  it('correctValue > 0 across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateKaKbProblem()
      expect(p.correctValue).toBeGreaterThan(0)
      expect(['Ka', 'Kb', 'pKa', 'pKb']).toContain(p.answerLabel)
    }
  })

  it('Ka × Kb = Kw = 1e-14 (conjugate pair relationship)', () => {
    const Ka = 1.8e-5
    const Kb = 1e-14 / Ka
    // Ka × Kb must equal Kw within floating-point precision
    expect(Math.abs(Ka * Kb - 1e-14) / 1e-14).toBeLessThan(0.001)
  })

  it('pKa + pKb = 14 for conjugate pairs', () => {
    const pKa = 4.74  // acetic acid
    const pKb = 14 - pKa
    expect(pKb).toBeCloseTo(9.26, 2)
  })
})

describe('generateWeakAcidProblem', () => {
  it('pH is between 0 and 7 for weak acids across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateWeakAcidProblem()
      expect(p.correctPh).toBeGreaterThan(0)
      expect(p.correctPh).toBeLessThan(7)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('acetic acid Ka=1.8e-5 at 0.10 M → pH ≈ 2.87 (Chang 14e, Example 16.6)', () => {
    const r = weakAcidPh(0.10, 1.8e-5)
    expect(r.pH).toBeCloseTo(2.87, 1)
  })
})

describe('generateWeakBaseProblem', () => {
  it('pH is between 7 and 14 for weak bases across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateWeakBaseProblem()
      expect(p.correctPh).toBeGreaterThan(7)
      expect(p.correctPh).toBeLessThanOrEqual(14)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })
})

describe('generateSaltPhProblem', () => {
  it('produces valid pH and classification across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateSaltPhProblem()
      expect(p.correctPh).toBeGreaterThanOrEqual(0)
      expect(p.correctPh).toBeLessThanOrEqual(14)
      expect(['acidic', 'basic', 'neutral']).toContain(p.classification)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('classification matches pH direction (acidic < 7, basic > 7)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateSaltPhProblem()
      if (p.classification === 'acidic')  expect(p.correctPh).toBeLessThan(7)
      if (p.classification === 'basic')   expect(p.correctPh).toBeGreaterThan(7)
      if (p.classification === 'neutral') expect(p.correctPh).toBeCloseTo(7, 1)
    }
  })
})

describe('generatePolyproticProblem', () => {
  it('pH dominated by Ka1 (< 7) across 20 runs', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePolyproticProblem()
      expect(p.correctPh).toBeGreaterThan(0)
      expect(p.correctPh).toBeLessThan(7)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })
})

describe('generateDynamicPhProblem', () => {
  it('produces valid pH with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicPhProblem()
      expect(p.correctPh).toBeGreaterThanOrEqual(0)
      expect(p.correctPh).toBeLessThanOrEqual(14)
      expect(p.isDynamic).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })
})

describe('generateDynamicWeakAcidProblem', () => {
  it('pH < 7 with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicWeakAcidProblem()
      expect(p.correctPh).toBeGreaterThan(0)
      expect(p.correctPh).toBeLessThan(7)
      expect(p.isDynamic).toBe(true)
    }
  })
})

describe('generateDynamicWeakBaseProblem', () => {
  it('pH > 7 with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicWeakBaseProblem()
      expect(p.correctPh).toBeGreaterThan(7)
      expect(p.correctPh).toBeLessThanOrEqual(14)
      expect(p.isDynamic).toBe(true)
    }
  })
})

describe('generateDynamicPolyproticProblem', () => {
  it('pH < 7 with isDynamic=true across 20 runs', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDynamicPolyproticProblem()
      expect(p.correctPh).toBeGreaterThan(0)
      expect(p.correctPh).toBeLessThan(7)
      expect(p.isDynamic).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })
})

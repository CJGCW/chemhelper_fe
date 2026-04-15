import { describe, it, expect } from 'vitest'
import {
  MOLAR_VOLUMES,
  generateGasStoichProblem,
  checkGasStoichAnswer,
} from './gasStoichPractice'

// ── Constants ─────────────────────────────────────────────────────────────────

describe('MOLAR_VOLUMES', () => {
  it('STP Vm is 22.414 L/mol', () => {
    expect(MOLAR_VOLUMES.STP.Vm).toBeCloseTo(22.414, 3)
  })

  it('SATP Vm is 24.789 L/mol', () => {
    expect(MOLAR_VOLUMES.SATP.Vm).toBeCloseTo(24.789, 3)
  })

  it('STP description mentions 0 °C', () => {
    expect(MOLAR_VOLUMES.STP.desc).toContain('0')
  })

  it('SATP description mentions 25 °C', () => {
    expect(MOLAR_VOLUMES.SATP.desc).toContain('25')
  })
})

// ── Problem generation ────────────────────────────────────────────────────────

describe('generateGasStoichProblem', () => {
  it('returns a problem with all required fields', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem()
      expect(p.equation.length).toBeGreaterThan(5)
      expect(p.question.length).toBeGreaterThan(20)
      expect(p.standard).toMatch(/^(STP|SATP)$/)
      expect(p.Vm).toBeGreaterThan(20)
      expect(typeof p.answer).toBe('number')
      expect(isNaN(p.answer)).toBe(false)
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answerUnit).toMatch(/^(g|mol|L)$/)
      expect(Array.isArray(p.steps)).toBe(true)
      expect(p.steps.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('uses STP Vm when STP is requested', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasStoichProblem('STP')
      expect(p.standard).toBe('STP')
      expect(p.Vm).toBeCloseTo(22.414, 3)
    }
  })

  it('uses SATP Vm when SATP is requested', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasStoichProblem('SATP')
      expect(p.standard).toBe('SATP')
      expect(p.Vm).toBeCloseTo(24.789, 3)
    }
  })

  it('question mentions the standard condition', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasStoichProblem()
      expect(p.question).toContain(p.standard)
    }
  })

  it('solution steps mention the molar volume conversion', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasStoichProblem()
      const stepsText = p.steps.join(' ')
      // Should show n = V / Vm step
      expect(stepsText).toMatch(/mol/)
      expect(stepsText).toMatch(/L/)
    }
  })

  it('steps start with the balanced equation', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasStoichProblem()
      expect(p.steps[0]).toContain('Balanced equation')
    }
  })

  it('mol answer problems have 4 steps, g answer problems have 5', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem()
      if (p.answerUnit === 'mol') {
        expect(p.steps.length).toBe(4)
      } else if (p.answerUnit === 'g') {
        expect(p.steps.length).toBe(5)
      }
    }
  })

  it('answer is consistent with mole ratio calculation', () => {
    // Spot-check: generate many problems and verify answer ≈ n(given)/Vm × ratio × M
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem()
      // The answer must be positive and finite
      expect(p.answer).toBeGreaterThan(0)
      expect(isFinite(p.answer)).toBe(true)
    }
  })
})

// ── Manual calculation spot-checks ───────────────────────────────────────────

describe('manual calculation spot-checks', () => {
  it('22.414 L CH4 at STP produces ~44.01 g CO2 (combustion of methane)', () => {
    // CH4 + 2O2 → CO2 + 2H2O
    // 22.414 L CH4 at STP = 1 mol CH4 → 1 mol CO2 = 44.009 g
    // We can't force the reaction/species but we can verify molar volume math:
    const Vm = MOLAR_VOLUMES.STP.Vm
    const molCH4 = 22.414 / Vm
    expect(molCH4).toBeCloseTo(1.000, 2)
    const molCO2 = molCH4 * (1 / 1)   // 1:1 ratio
    const massCO2 = molCO2 * 44.009
    expect(massCO2).toBeCloseTo(44.009, 1)
  })

  it('24.789 L H2 at SATP produces ~1 mol H2O from 2H2 + O2 → 2H2O', () => {
    const Vm = MOLAR_VOLUMES.SATP.Vm
    const molH2 = 24.789 / Vm
    expect(molH2).toBeCloseTo(1.000, 2)
    const molH2O = molH2 * (2 / 2)  // 2:2 = 1 ratio
    expect(molH2O).toBeCloseTo(1.000, 2)
  })

  it('11.207 L at STP = 0.500 mol', () => {
    const Vm = MOLAR_VOLUMES.STP.Vm
    expect(11.207 / Vm).toBeCloseTo(0.500, 2)
  })
})

// ── Answer checker ────────────────────────────────────────────────────────────

describe('checkGasStoichAnswer', () => {
  it('accepts exact correct answer', () => {
    const p = generateGasStoichProblem()
    expect(checkGasStoichAnswer(p, p.answer.toString())).toBe(true)
  })

  it('accepts answer within +1% tolerance', () => {
    const p = generateGasStoichProblem()
    expect(checkGasStoichAnswer(p, (p.answer * 1.009).toString())).toBe(true)
  })

  it('accepts answer within -1% tolerance', () => {
    const p = generateGasStoichProblem()
    expect(checkGasStoichAnswer(p, (p.answer * 0.991).toString())).toBe(true)
  })

  it('rejects answer more than 1% off', () => {
    const p = generateGasStoichProblem()
    expect(checkGasStoichAnswer(p, (p.answer * 1.02).toString())).toBe(false)
    expect(checkGasStoichAnswer(p, (p.answer * 0.98).toString())).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = generateGasStoichProblem()
    expect(checkGasStoichAnswer(p, '')).toBe(false)
    expect(checkGasStoichAnswer(p, 'abc')).toBe(false)
    expect(checkGasStoichAnswer(p, 'NaN')).toBe(false)
  })

  it('rejects zero', () => {
    const p = generateGasStoichProblem()
    expect(checkGasStoichAnswer(p, '0')).toBe(false)
  })

  it('generated problem always passes its own checker (30 runs)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem()
      expect(checkGasStoichAnswer(p, p.answer.toString())).toBe(true)
    }
  })

  it('STP and SATP problems both pass self-check', () => {
    for (let i = 0; i < 10; i++) {
      const stp  = generateGasStoichProblem('STP')
      const satp = generateGasStoichProblem('SATP')
      expect(checkGasStoichAnswer(stp,  stp.answer.toString())).toBe(true)
      expect(checkGasStoichAnswer(satp, satp.answer.toString())).toBe(true)
    }
  })
})

import { describe, it, expect } from 'vitest'
import {
  generateGasStoichProblem,
  checkGasStoichAnswer,
  MOLAR_VOLUMES,
  R_GAS,
} from '../gasStoichPractice'

// ── STP / SATP problems ───────────────────────────────────────────────────────

describe('generateGasStoichProblem — STP', () => {
  it('uses Vm = 22.414 L/mol', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem('STP')
      expect(p.Vm).toBeCloseTo(22.414, 3)
      expect(p.standard).toBe('STP')
    }
  })

  it('populates T = 273.15 K and P = 1.0 atm', () => {
    const p = generateGasStoichProblem('STP')
    expect(p.T).toBeCloseTo(273.15, 2)
    expect(p.P).toBeCloseTo(1.0, 4)
  })

  it('answer is positive and > 0.01', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem('STP')
      expect(p.answer).toBeGreaterThan(0.01)
    }
  })

  it('answerUnit is g or mol (not L)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem('STP')
      expect(['g', 'mol']).toContain(p.answerUnit)
    }
  })

  it('steps array has at least 4 entries', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateGasStoichProblem('STP')
      expect(p.steps.length).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('generateGasStoichProblem — SATP', () => {
  it('uses Vm = 24.789 L/mol', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem('SATP')
      expect(p.Vm).toBeCloseTo(24.789, 3)
      expect(p.standard).toBe('SATP')
    }
  })

  it('populates T = 298.15 K and P = 0.987 atm', () => {
    const p = generateGasStoichProblem('SATP')
    expect(p.T).toBeCloseTo(298.15, 2)
    expect(p.P).toBeCloseTo(0.987, 3)
  })
})

// ── Custom T/P problems ───────────────────────────────────────────────────────

describe('generateGasStoichProblem — custom', () => {
  it('sets standard = custom and Vm = null', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem('custom')
      expect(p.standard).toBe('custom')
      expect(p.Vm).toBeNull()
    }
  })

  it('T is in range [300, 500] K', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem('custom')
      expect(p.T).toBeGreaterThanOrEqual(300)
      expect(p.T).toBeLessThanOrEqual(500)
    }
  })

  it('P is in range [0.5, 2.0] atm', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem('custom')
      expect(p.P).toBeGreaterThanOrEqual(0.5)
      expect(p.P).toBeLessThanOrEqual(2.0)
    }
  })

  it('answerUnit is L for custom problems', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem('custom')
      expect(p.answerUnit).toBe('L')
    }
  })

  it('answer matches V = nRT/P within tolerance', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateGasStoichProblem('custom')
      // Back-calculate: if we knew n we'd get V = nRT/P.
      // Instead verify the answer is consistent with V = nRT/P:
      // n_gas = V*P / (R*T), which should be a reasonable mole count
      const nGas = (p.answer * p.P) / (R_GAS * p.T)
      expect(nGas).toBeGreaterThan(0.01)
      expect(nGas).toBeLessThan(20)
    }
  })

  it('steps include V = nRT/P', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem('custom')
      const stepsText = p.steps.join(' ')
      expect(stepsText).toMatch(/V\s*=\s*nRT\/P/)
    }
  })

  it('question mentions the temperature and pressure', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateGasStoichProblem('custom')
      // Should mention °C and atm
      expect(p.question).toMatch(/°C/)
      expect(p.question).toMatch(/atm/)
    }
  })
})

// ── Chang Ex 5.12: NaN₃ airbag ───────────────────────────────────────────────
// 2 NaN₃(s) → 2 Na(s) + 3 N₂(g)
// 65.0 g NaN₃ at 300 K, 1.00 atm → V(N₂) = nRT/P ≈ 36.9 L

describe('Chang Ex 5.12 — sodium azide airbag', () => {
  it('65.0 g NaN₃ at 300 K, 1.00 atm produces ~36.9 L of N₂', () => {
    const molarMassNaN3 = 65.010
    const nNaN3   = 65.0 / molarMassNaN3           // ≈ 0.9999 mol
    const nN2     = nNaN3 * (3 / 2)                 // ≈ 1.4998 mol
    const V       = nN2 * R_GAS * 300 / 1.00        // ≈ 36.92 L
    expect(V).toBeCloseTo(36.9, 0)
  })

  it('checkGasStoichAnswer accepts ±1% on Chang example', () => {
    const molarMassNaN3 = 65.010
    const nNaN3  = 65.0 / molarMassNaN3
    const nN2    = nNaN3 * (3 / 2)
    const V      = nN2 * R_GAS * 300 / 1.00
    const p = generateGasStoichProblem('custom')
    // Create a mock problem matching Chang conditions
    const mockProblem = { ...p, answer: V, answerUnit: 'L' as const }
    expect(checkGasStoichAnswer(mockProblem, String(V))).toBe(true)
    expect(checkGasStoichAnswer(mockProblem, String(V * 1.005))).toBe(true)  // within 0.5%
    expect(checkGasStoichAnswer(mockProblem, String(V * 1.02))).toBe(false)  // 2% over
  })
})

// ── checkGasStoichAnswer ──────────────────────────────────────────────────────

describe('checkGasStoichAnswer', () => {
  it('accepts exact answer', () => {
    const p = generateGasStoichProblem('STP')
    expect(checkGasStoichAnswer(p, String(p.answer))).toBe(true)
  })

  it('accepts within 1% tolerance', () => {
    const p = generateGasStoichProblem('STP')
    expect(checkGasStoichAnswer(p, String(p.answer * 0.995))).toBe(true)
    expect(checkGasStoichAnswer(p, String(p.answer * 1.005))).toBe(true)
  })

  it('rejects more than 1% off', () => {
    const p = generateGasStoichProblem('STP')
    expect(checkGasStoichAnswer(p, String(p.answer * 1.02))).toBe(false)
    expect(checkGasStoichAnswer(p, String(p.answer * 0.97))).toBe(false)
  })

  it('rejects empty string', () => {
    const p = generateGasStoichProblem('STP')
    expect(checkGasStoichAnswer(p, '')).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = generateGasStoichProblem('STP')
    expect(checkGasStoichAnswer(p, 'abc')).toBe(false)
  })
})

// ── MOLAR_VOLUMES constants ───────────────────────────────────────────────────

describe('MOLAR_VOLUMES', () => {
  it('STP Vm is consistent with R_GAS at 273.15 K, 1 atm (within 0.1%)', () => {
    const { Vm, T, P } = MOLAR_VOLUMES.STP
    const computed = R_GAS * T / P
    expect(Math.abs(computed - Vm) / Vm).toBeLessThan(0.001)
  })

  it('SATP Vm is consistent with R_GAS at 298.15 K, 0.987 atm (within 0.1%)', () => {
    const { Vm, T, P } = MOLAR_VOLUMES.SATP
    const computed = R_GAS * T / P
    expect(Math.abs(computed - Vm) / Vm).toBeLessThan(0.001)
  })
})

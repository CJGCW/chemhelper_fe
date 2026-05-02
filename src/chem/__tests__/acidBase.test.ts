import { describe, it, expect } from 'vitest'
import {
  strongAcidPh,
  strongBasePh,
  weakAcidPh,
  weakBasePh,
  saltPh,
  kaToKb,
  kbToKa,
  phFromH,
  hFromPh,
  polyproticPh,
} from '../acidBase'
import { Kw } from '../../data/acidBaseConstants'

// ── Basic conversions ──────────────────────────────────────────────────────────

describe('phFromH / hFromPh', () => {
  it('pH = -log[H+]', () => {
    expect(phFromH(1e-3)).toBeCloseTo(3.0, 4)
    expect(phFromH(1e-7)).toBeCloseTo(7.0, 4)
  })
  it('hFromPh is inverse of phFromH', () => {
    expect(hFromPh(3.0)).toBeCloseTo(1e-3, 8)
    expect(hFromPh(7.0)).toBeCloseTo(1e-7, 12)
  })
})

// ── Ka / Kb conversion ─────────────────────────────────────────────────────────

describe('kaToKb', () => {
  it('Ka × Kb = Kw for conjugate pair', () => {
    const Ka = 1.8e-5  // acetic acid
    const Kb = kaToKb(Ka)
    expect(Ka * Kb).toBeCloseTo(Kw, 20)
  })

  it('kbToKa returns correct Ka', () => {
    const Kb = 1.8e-5  // ammonia
    const Ka = kbToKa(Kb)
    expect(Kb * Ka).toBeCloseTo(Kw, 20)
  })

  it('pKa + pKb = 14 for conjugate pair', () => {
    const Ka = 1.8e-5
    const Kb = kaToKb(Ka)
    const pKa = -Math.log10(Ka)
    const pKb = -Math.log10(Kb)
    expect(pKa + pKb).toBeCloseTo(14, 10)
  })
})

// ── Strong acid/base ───────────────────────────────────────────────────────────

describe('strongAcidPh', () => {
  it('0.10 M HCl → pH = 1.00', () => {
    const res = strongAcidPh(0.10, 1)
    expect(res.pH).toBeCloseTo(1.00, 2)
  })

  it('0.010 M H₂SO₄ (first dissociation, 1 proton) → pH = 2.00', () => {
    // H2SO4 first proton only
    const res = strongAcidPh(0.010, 1)
    expect(res.pH).toBeCloseTo(2.00, 2)
  })

  it('0.010 M H₂SO₄ with 2 protons → pH ≈ 1.70', () => {
    // Both protons from first dissociation contribute
    const res = strongAcidPh(0.010, 2)
    // [H+] = 0.020 M → pH = -log(0.020) ≈ 1.699
    expect(res.pH).toBeCloseTo(1.699, 2)
  })

  it('steps include H+ concentration', () => {
    const res = strongAcidPh(0.10, 1)
    expect(res.steps.length).toBeGreaterThan(2)
    const joined = res.steps.join(' ')
    expect(joined).toContain('[H⁺]')
  })

  it('pOH + pH = 14', () => {
    const res = strongAcidPh(0.05, 1)
    expect(res.pH + res.pOH).toBeCloseTo(14, 10)
  })
})

describe('strongBasePh', () => {
  it('0.10 M NaOH → pH = 13.00', () => {
    const res = strongBasePh(0.10, 1)
    expect(res.pH).toBeCloseTo(13.00, 2)
  })

  it('Ca(OH)₂: 0.050 M with 2 OH → pH ≈ 13.00', () => {
    const res = strongBasePh(0.050, 2)
    // [OH-] = 0.10, pOH = 1.00, pH = 13.00
    expect(res.pH).toBeCloseTo(13.00, 2)
  })
})

// ── Weak acid ─────────────────────────────────────────────────────────────────

describe('weakAcidPh', () => {
  it('Chang Ex 15.8: 0.10 M acetic acid, Ka=1.8e-5 → pH≈2.87', () => {
    const res = weakAcidPh(0.10, 1.8e-5)
    // Chang answer: pH ≈ 2.87
    expect(res.pH).toBeCloseTo(2.87, 1)
  })

  it('5% approx valid for Ka=1e-5, C=0.10', () => {
    const res = weakAcidPh(0.10, 1e-5)
    expect(res.approximationValid).toBe(true)
  })

  it('5% approx fails for Ka=0.01, C=0.10 → uses exact ICE table', () => {
    const res = weakAcidPh(0.10, 0.01)
    expect(res.approximationValid).toBe(false)
    // x is significant; pH should still be correct
    // Ka = x²/(0.10-x) → x² + 0.01x - 0.001 = 0
    // x = (-0.01 + sqrt(0.0001 + 0.004)) / 2 = (-0.01 + 0.06403) / 2 ≈ 0.02701
    // pH = -log(0.02701) ≈ 1.568
    expect(res.pH).toBeCloseTo(1.57, 1)
  })

  it('result has non-empty steps', () => {
    const res = weakAcidPh(0.10, 1.8e-5)
    expect(res.steps.length).toBeGreaterThan(3)
  })

  it('percent dissociation is positive and < 100', () => {
    const res = weakAcidPh(0.10, 1.8e-5)
    expect(res.percentDissociation).toBeGreaterThan(0)
    expect(res.percentDissociation).toBeLessThan(100)
  })

  it('HF Ka=6.8e-4, C=0.10 → pH≈2.09 (5% rule may or may not be valid)', () => {
    const res = weakAcidPh(0.10, 6.8e-4)
    expect(res.pH).toBeCloseTo(2.09, 1)
  })
})

// ── Weak base ─────────────────────────────────────────────────────────────────

describe('weakBasePh', () => {
  it('0.10 M NH₃, Kb=1.8e-5 → pH≈11.13', () => {
    const res = weakBasePh(0.10, 1.8e-5)
    // pOH = 2.87, pH = 14 - 2.87 = 11.13
    expect(res.pH).toBeCloseTo(11.13, 1)
  })

  it('pH > 7 for weak base', () => {
    const res = weakBasePh(0.10, 1.8e-5)
    expect(res.pH).toBeGreaterThan(7)
  })

  it('OH concentration is positive', () => {
    const res = weakBasePh(0.05, 1.8e-5)
    expect(res.OH).toBeGreaterThan(0)
  })
})

// ── Salt pH ───────────────────────────────────────────────────────────────────

describe('saltPh', () => {
  it('NaCl (strong/strong) → neutral, pH = 7', () => {
    const res = saltPh(0.10, { type: 'strong' }, { type: 'strong' })
    expect(res.pH).toBe(7)
    expect(res.classification).toBe('neutral')
  })

  it('CH₃COONa (weak acid/strong base) → basic', () => {
    const res = saltPh(0.10, { type: 'weak', Ka: 1.8e-5 }, { type: 'strong' })
    expect(res.pH).toBeGreaterThan(7)
    expect(res.classification).toBe('basic')
  })

  it('NH₄Cl (strong acid/weak base) → acidic', () => {
    const res = saltPh(0.10, { type: 'strong' }, { type: 'weak', Kb: 1.8e-5 })
    expect(res.pH).toBeLessThan(7)
    expect(res.classification).toBe('acidic')
  })

  it('NH₄CH₃COO (weak/weak, Ka=Kb) → neutral', () => {
    // Ka = Kb = 1.8e-5 → approximately neutral
    const res = saltPh(0.10, { type: 'weak', Ka: 1.8e-5 }, { type: 'weak', Kb: 1.8e-5 })
    expect(res.pH).toBeCloseTo(7, 0)
    expect(res.classification).toBe('neutral')
  })

  it('steps are non-empty', () => {
    const res = saltPh(0.10, { type: 'weak', Ka: 1.8e-5 }, { type: 'strong' })
    expect(res.steps.length).toBeGreaterThan(0)
  })
})

// ── Polyprotic ────────────────────────────────────────────────────────────────

describe('polyproticPh', () => {
  it('0.10 M H₃PO₄ (Ka1=7.5e-3) → pH ≈ 1.62', () => {
    // Ka1 dominates; approximate answer
    const res = polyproticPh(0.10, 7.5e-3, 6.2e-8, 4.8e-13)
    expect(res.pH).toBeGreaterThan(1.5)
    expect(res.pH).toBeLessThan(2.0)
  })

  it('species record has H⁺ key', () => {
    const res = polyproticPh(0.10, 7.5e-3, 6.2e-8)
    expect(res.species['H⁺']).toBeGreaterThan(0)
  })

  it('0.10 M oxalic acid (Ka1=5.9e-2) → pH < 1.5 (fairly strong first step)', () => {
    const res = polyproticPh(0.10, 5.9e-2, 6.4e-5)
    expect(res.pH).toBeLessThan(1.5)
  })
})

// ── Random generator correctness ──────────────────────────────────────────────

describe('acidBasePractice generators produce correct answers', () => {
  it('generatePhProblem: 20 runs all return valid pH', async () => {
    const { generatePhProblem } = await import('../../utils/acidBasePractice')
    for (let i = 0; i < 20; i++) {
      const p = generatePhProblem()
      expect(p.correctPh).toBeGreaterThan(0)
      expect(p.correctPh).toBeLessThan(14)
    }
  })

  it('generateWeakAcidProblem: 20 runs all acidic (pH < 7)', async () => {
    const { generateWeakAcidProblem } = await import('../../utils/acidBasePractice')
    for (let i = 0; i < 20; i++) {
      const p = generateWeakAcidProblem()
      expect(p.correctPh).toBeLessThan(7)
    }
  })

  it('generateWeakBaseProblem: 20 runs all basic (pH > 7)', async () => {
    const { generateWeakBaseProblem } = await import('../../utils/acidBasePractice')
    for (let i = 0; i < 20; i++) {
      const p = generateWeakBaseProblem()
      expect(p.correctPh).toBeGreaterThan(7)
    }
  })

  it('generateKaKbProblem: 20 runs all positive values', async () => {
    const { generateKaKbProblem } = await import('../../utils/acidBasePractice')
    for (let i = 0; i < 20; i++) {
      const p = generateKaKbProblem()
      expect(p.correctValue).toBeGreaterThan(0)
    }
  })

  it('generateSaltPhProblem: 20 runs all valid classification', async () => {
    const { generateSaltPhProblem } = await import('../../utils/acidBasePractice')
    const valid = ['acidic', 'basic', 'neutral']
    for (let i = 0; i < 20; i++) {
      const p = generateSaltPhProblem()
      expect(valid).toContain(p.classification)
    }
  })

  it('generatePolyproticProblem: 20 runs all pH < 7', async () => {
    const { generatePolyproticProblem } = await import('../../utils/acidBasePractice')
    for (let i = 0; i < 20; i++) {
      const p = generatePolyproticProblem()
      expect(p.correctPh).toBeLessThan(7)
    }
  })
})

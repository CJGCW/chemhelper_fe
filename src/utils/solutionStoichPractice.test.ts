import { describe, it, expect } from 'vitest'
import {
  ACID_SOLID_RXNS, ACID_BASE_RXNS,
  calcVolToMass, calcMassToVol, calcVolToVol,
  generateSolStoichProblem, checkSolStoichAnswer,
} from './solutionStoichPractice'

describe('ACID_SOLID_RXNS', () => {
  it('has 5 reactions', () => {
    expect(ACID_SOLID_RXNS).toHaveLength(5)
  })

  it('each reaction has a positive solid molar mass', () => {
    for (const rxn of ACID_SOLID_RXNS) {
      expect(rxn.solidMolarMass).toBeGreaterThan(0)
    }
  })

  it('each reaction has positive coefficients', () => {
    for (const rxn of ACID_SOLID_RXNS) {
      expect(rxn.solidCoeff).toBeGreaterThan(0)
      expect(rxn.acidCoeff).toBeGreaterThan(0)
    }
  })

  it('each reaction has non-empty equation and display strings', () => {
    for (const rxn of ACID_SOLID_RXNS) {
      expect(rxn.equation.length).toBeGreaterThan(5)
      expect(rxn.solidDisplay.length).toBeGreaterThan(0)
      expect(rxn.acidDisplay.length).toBeGreaterThan(0)
    }
  })
})

describe('ACID_BASE_RXNS', () => {
  it('has 4 reactions', () => {
    expect(ACID_BASE_RXNS).toHaveLength(4)
  })

  it('each reaction has positive coefficients', () => {
    for (const rxn of ACID_BASE_RXNS) {
      expect(rxn.acidCoeff).toBeGreaterThan(0)
      expect(rxn.baseCoeff).toBeGreaterThan(0)
    }
  })
})

describe('calcVolToMass', () => {
  const caco3 = ACID_SOLID_RXNS.find(r => r.solidDisplay === 'CaCO₃')!

  it('spot check: 25.0 mL of 0.500 M HCl + CaCO₃', () => {
    // n(HCl) = 0.500 × 0.025 = 0.01250 mol
    // n(CaCO₃) = 0.01250 × (1/2) = 0.006250 mol
    // m(CaCO₃) = 0.006250 × 100.087 = 0.6255 g
    const { answer } = calcVolToMass(caco3, 25.0, 0.500)
    expect(answer).toBeCloseTo(0.6255, 2)
  })

  it('returns a steps array with 4 entries', () => {
    const { steps } = calcVolToMass(caco3, 25.0, 0.500)
    expect(steps).toHaveLength(4)
  })

  it('steps[0] contains the balanced equation', () => {
    const { steps } = calcVolToMass(caco3, 25.0, 0.500)
    expect(steps[0]).toContain('CaCO₃')
  })

  it('scales linearly with volume', () => {
    const { answer: a1 } = calcVolToMass(caco3, 25.0, 0.500)
    const { answer: a2 } = calcVolToMass(caco3, 50.0, 0.500)
    expect(a2).toBeCloseTo(a1 * 2, 6)
  })
})

describe('calcMassToVol', () => {
  const mg = ACID_SOLID_RXNS.find(r => r.solidDisplay === 'Mg')!

  it('spot check: 5.00 g Mg + 0.500 M HCl', () => {
    // n(Mg) = 5.00 / 24.305 = 0.20573 mol
    // n(HCl) = 0.20573 × 2 = 0.41146 mol
    // V(HCl) = 0.41146 / 0.500 × 1000 = 822.9 mL
    const { answer } = calcMassToVol(mg, 5.00, 0.500)
    expect(answer).toBeCloseTo(822.9, 0)
  })

  it('returns 4 steps', () => {
    const { steps } = calcMassToVol(mg, 5.00, 0.500)
    expect(steps).toHaveLength(4)
  })

  it('doubling concentration halves the required volume', () => {
    const { answer: v1 } = calcMassToVol(mg, 5.00, 0.500)
    const { answer: v2 } = calcMassToVol(mg, 5.00, 1.00)
    expect(v2).toBeCloseTo(v1 / 2, 4)
  })

  it('spot check: 10.0 g Zn + 1.00 M H₂SO₄', () => {
    const zn = ACID_SOLID_RXNS.find(r => r.solidDisplay === 'Zn')!
    // n(Zn) = 10.0 / 65.38 = 0.15296 mol
    // n(H₂SO₄) = 0.15296 × 1 = 0.15296 mol (1:1 ratio)
    // V = 0.15296 / 1.00 × 1000 = 152.96 mL
    const { answer } = calcMassToVol(zn, 10.0, 1.00)
    expect(answer).toBeCloseTo(152.96, 0)
  })
})

describe('calcVolToVol', () => {
  const hclNaoh = ACID_BASE_RXNS.find(r => r.name === 'HCl + NaOH')!
  const h2so4NaOH = ACID_BASE_RXNS.find(r => r.name === 'H₂SO₄ + NaOH')!

  it('spot check HCl/NaOH 1:1 — 20.0 mL 0.500M HCl vs 0.250M NaOH', () => {
    // n(HCl) = 0.500 × 0.020 = 0.01000 mol
    // n(NaOH) = 0.01000 × 1 = 0.01000 mol
    // V(NaOH) = 0.01000 / 0.250 × 1000 = 40.0 mL
    const { answer } = calcVolToVol(hclNaoh, 20.0, 0.500, 0.250)
    expect(answer).toBeCloseTo(40.0, 4)
  })

  it('spot check H₂SO₄/NaOH 1:2 — 10.0 mL 0.500M H₂SO₄ vs 1.00M NaOH', () => {
    // n(H₂SO₄) = 0.500 × 0.010 = 0.005000 mol
    // n(NaOH) = 0.005000 × 2 = 0.01000 mol
    // V(NaOH) = 0.01000 / 1.00 × 1000 = 10.0 mL
    const { answer } = calcVolToVol(h2so4NaOH, 10.0, 0.500, 1.00)
    expect(answer).toBeCloseTo(10.0, 4)
  })

  it('returns 4 steps', () => {
    const { steps } = calcVolToVol(hclNaoh, 20.0, 0.500, 0.250)
    expect(steps).toHaveLength(4)
  })

  it('HCl/Ca(OH)₂ 2:1 — 25.0 mL 1.00M HCl vs 0.500M Ca(OH)₂', () => {
    const rxn = ACID_BASE_RXNS.find(r => r.name === 'HCl + Ca(OH)₂')!
    // n(HCl) = 1.00 × 0.025 = 0.02500 mol
    // n(Ca(OH)₂) = 0.02500 × (1/2) = 0.01250 mol
    // V(Ca(OH)₂) = 0.01250 / 0.500 × 1000 = 25.0 mL
    const { answer } = calcVolToVol(rxn, 25.0, 1.00, 0.500)
    expect(answer).toBeCloseTo(25.0, 4)
  })
})

describe('generateSolStoichProblem', () => {
  it('generates a vol_to_mass problem when requested', () => {
    const p = generateSolStoichProblem('vol_to_mass')
    expect(p.type).toBe('vol_to_mass')
    expect(p.answerUnit).toBe('g')
    expect(p.answer).toBeGreaterThan(0)
  })

  it('generates a mass_to_vol problem when requested', () => {
    const p = generateSolStoichProblem('mass_to_vol')
    expect(p.type).toBe('mass_to_vol')
    expect(p.answerUnit).toBe('mL')
    expect(p.answer).toBeGreaterThan(0)
  })

  it('generates a vol_to_vol problem when requested', () => {
    const p = generateSolStoichProblem('vol_to_vol')
    expect(p.type).toBe('vol_to_vol')
    expect(p.answerUnit).toBe('mL')
    expect(p.answer).toBeGreaterThan(0)
  })

  it('random generation returns one of the three types', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateSolStoichProblem()
      expect(['vol_to_mass', 'mass_to_vol', 'vol_to_vol']).toContain(p.type)
    }
  })

  it('each problem has a question, equation, and steps', () => {
    for (const type of ['vol_to_mass', 'mass_to_vol', 'vol_to_vol'] as const) {
      const p = generateSolStoichProblem(type)
      expect(p.question.length).toBeGreaterThan(20)
      expect(p.equation.length).toBeGreaterThan(5)
      expect(p.steps).toHaveLength(4)
    }
  })
})

describe('checkSolStoichAnswer', () => {
  it('accepts the exact answer', () => {
    const p = generateSolStoichProblem('vol_to_mass')
    expect(checkSolStoichAnswer(p, p.answer.toString())).toBe(true)
  })

  it('accepts an answer within 1%', () => {
    const p = generateSolStoichProblem('mass_to_vol')
    expect(checkSolStoichAnswer(p, (p.answer * 1.009).toString())).toBe(true)
    expect(checkSolStoichAnswer(p, (p.answer * 0.991).toString())).toBe(true)
  })

  it('rejects an answer outside 1%', () => {
    const p = generateSolStoichProblem('vol_to_vol')
    expect(checkSolStoichAnswer(p, (p.answer * 1.02).toString())).toBe(false)
    expect(checkSolStoichAnswer(p, (p.answer * 0.98).toString())).toBe(false)
  })

  it('rejects NaN input', () => {
    const p = generateSolStoichProblem('vol_to_mass')
    expect(checkSolStoichAnswer(p, '')).toBe(false)
    expect(checkSolStoichAnswer(p, 'abc')).toBe(false)
  })
})

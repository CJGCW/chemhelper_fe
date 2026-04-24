import { describe, it, expect } from 'vitest'
import {
  calcMolarityFromPercent, calcPercentFromMolarity,
  calcMolarityFromPpm, calcMoleFraction,
  calcDilutionC2, calcDilutionV2, calcDilutionV1,
  solveAcidBaseTitration, solveRedoxTitration,
} from '../solutions'

describe('Concentration conversions', () => {
  it('calcMolarityFromPercent: conc. HCl (37%, 1.19 g/mL, 36.46 g/mol) ≈ 12.06 M', () => {
    expect(calcMolarityFromPercent(37.0, 1.19, 36.46)).toBeCloseTo(12.06, 1)
  })
  it('calcPercentFromMolarity: inverse of percent→molarity', () => {
    const C = calcMolarityFromPercent(37.0, 1.19, 36.46)
    expect(calcPercentFromMolarity(C, 1.19, 36.46)).toBeCloseTo(37.0, 1)
  })
  it('calcMolarityFromPpm: 100 ppm Fe²⁺ (55.85 g/mol) ≈ 1.79e-3 M', () => {
    expect(calcMolarityFromPpm(100, 55.85)).toBeCloseTo(100 / (55.85 * 1000), 6)
  })
  it('calcMoleFraction: 18g glucose (180.16) in 100g H₂O', () => {
    const chi = calcMoleFraction(18, 180.16, 100, 18.015)
    const n_sol = 18 / 180.16
    const n_wat = 100 / 18.015
    expect(chi).toBeCloseTo(n_sol / (n_sol + n_wat), 6)
  })
})

describe('Dilution (C₁V₁ = C₂V₂)', () => {
  it('calcDilutionC2: 0.5 M × 0.02 L / 0.1 L = 0.1 M', () => {
    expect(calcDilutionC2(0.5, 0.02, 0.1)).toBeCloseTo(0.1, 5)
  })
  it('calcDilutionV2: 0.5 M × 0.02 L / 0.1 M = 0.1 L', () => {
    expect(calcDilutionV2(0.5, 0.02, 0.1)).toBeCloseTo(0.1, 5)
  })
  it('calcDilutionV1: 0.1 M × 0.1 L / 0.5 M = 0.02 L', () => {
    expect(calcDilutionV1(0.1, 0.1, 0.5)).toBeCloseTo(0.02, 5)
  })
  it('round-trip: V1 → C2 → V1', () => {
    const c1 = 2.0, v1 = 0.025, v2 = 0.25
    const c2 = calcDilutionC2(c1, v1, v2)
    const v1back = calcDilutionV1(c2, v2, c1)
    expect(v1back).toBeCloseTo(v1, 8)
  })
})

describe('solveAcidBaseTitration', () => {
  // HCl + NaOH 1:1, acidPerBase = 1
  it('HCl + NaOH 1:1 — find volume of base', () => {
    // 25.0 mL of 0.500 M HCl needs ? mL of 0.250 M NaOH → 50.0 mL
    const r = solveAcidBaseTitration(
      1, 'HCl + NaOH → NaCl + H₂O', 'HCl', 'NaOH',
      { side: 'acid', volumeML: 25.0, molarity: 0.500 },
      { side: 'base', unknown: 'volume', known: 0.250 },
    )
    expect(r.answer).toBeCloseTo(50.0, 1)
    expect(r.answerUnit).toBe('mL')
    expect(r.steps.length).toBeGreaterThan(2)
  })

  // H₂SO₄ + 2 NaOH: acidPerBase = base.equiv/acid.equiv = 1/2 = 0.5
  it('H₂SO₄ + 2 NaOH — find molarity of base', () => {
    // 25.0 mL of 0.500 M H₂SO₄ titrated by 35.0 mL NaOH → [NaOH] = 0.714 M
    // n_H2SO4 = 0.500 × 0.025 = 0.0125 mol; n_NaOH = 0.0125 / 0.5 = 0.025 mol
    // [NaOH] = 0.025 / 0.035 ≈ 0.7143 M
    const r = solveAcidBaseTitration(
      0.5, 'H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O', 'H₂SO₄', 'NaOH',
      { side: 'acid', volumeML: 25.0, molarity: 0.500 },
      { side: 'base', unknown: 'molarity', known: 35.0 },
    )
    expect(r.answer).toBeCloseTo(0.7143, 3)
    expect(r.answerUnit).toBe('M')
  })

  // Chang shape: "What volume of 0.300 M NaOH is needed to neutralize 25.0 mL of 0.500 M H₂SO₄?"
  it('Chang pattern — H₂SO₄ + 2 NaOH, find volume of NaOH', () => {
    // n_H2SO4 = 0.500 × 0.025 = 0.0125 mol; n_NaOH = 0.025 mol; V = 0.025/0.300 × 1000 = 83.3 mL
    const r = solveAcidBaseTitration(
      0.5, 'H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O', 'H₂SO₄', 'NaOH',
      { side: 'acid', volumeML: 25.0, molarity: 0.500 },
      { side: 'base', unknown: 'volume', known: 0.300 },
    )
    expect(r.answer).toBeCloseTo(83.3, 0)
  })

  // 2 HCl + Ba(OH)₂ 2:1 — acidPerBase = base.equiv/acid.equiv = 2/1 = 2
  it('2 HCl + Ba(OH)₂ — find volume of base (2:1 acid:base ratio)', () => {
    // 40.0 mL × 0.300 M HCl = 0.012 mol; n_Ba(OH)2 = 0.012/2 = 0.006 mol; V = 0.006/0.150 × 1000 = 40.0 mL
    const r = solveAcidBaseTitration(
      2, '2 HCl + Ba(OH)₂ → BaCl₂ + 2 H₂O', 'HCl', 'Ba(OH)₂',
      { side: 'acid', volumeML: 40.0, molarity: 0.300 },
      { side: 'base', unknown: 'volume', known: 0.150 },
    )
    expect(r.answer).toBeCloseTo(40.0, 1)
  })

  // Reverse direction: given base, find acid volume
  it('given base side — find volume of acid', () => {
    // 30.0 mL of 0.200 M NaOH needs ? mL 0.200 M HCl (1:1) → 30.0 mL
    const r = solveAcidBaseTitration(
      1, 'HCl + NaOH → NaCl + H₂O', 'HCl', 'NaOH',
      { side: 'base', volumeML: 30.0, molarity: 0.200 },
      { side: 'acid', unknown: 'volume', known: 0.200 },
    )
    expect(r.answer).toBeCloseTo(30.0, 1)
  })

  // H₃PO₄ + 3 NaOH: acidPerBase = 1/3
  it('H₃PO₄ + 3 NaOH — triprotic (acidPerBase = 1/3)', () => {
    // 10.0 mL × 0.100 M H₃PO₄ = 0.001 mol; n_NaOH = 0.001/(1/3) = 0.003 mol; V = 0.003/0.100 × 1000 = 30.0 mL
    const r = solveAcidBaseTitration(
      1 / 3, 'H₃PO₄ + 3 NaOH → Na₃PO₄ + 3 H₂O', 'H₃PO₄', 'NaOH',
      { side: 'acid', volumeML: 10.0, molarity: 0.100 },
      { side: 'base', unknown: 'volume', known: 0.100 },
    )
    expect(r.answer).toBeCloseTo(30.0, 1)
  })

  it('steps array always includes the balanced equation', () => {
    const r = solveAcidBaseTitration(
      1, 'HCl + NaOH → NaCl + H₂O', 'HCl', 'NaOH',
      { side: 'acid', volumeML: 25.0, molarity: 0.500 },
      { side: 'base', unknown: 'volume', known: 0.250 },
    )
    expect(r.steps[0]).toMatch(/Balanced/)
  })
})

describe('solveRedoxTitration', () => {
  // Chang 4.130-style: KMnO4 / Fe2+, 1:5 electron ratio
  it('KMnO₄ / Fe²⁺ — Chang 4.130 pattern', () => {
    // 20.00 mL of 0.100 M FeSO4; 0.0200 M KMnO4 needed
    // n_Fe2+ = 0.002 mol; n_MnO4- = 0.002 × (1/5) = 0.0004 mol; V = 0.0004/0.0200 × 1000 = 20.0 mL
    const r = solveRedoxTitration(
      5, 1,
      'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O',
      'KMnO₄', 'Fe²⁺',
      { side: 'reducer',  volumeML: 20.00, molarity: 0.100  },
      { side: 'oxidizer', unknown: 'volume', known: 0.0200 },
    )
    expect(r.answer).toBeCloseTo(20.0, 1)
    expect(r.answerUnit).toBe('mL')
  })

  it('K₂Cr₂O₇ / Fe²⁺ — 1:6 electron ratio', () => {
    // 15.0 mL of 0.0100 M K₂Cr₂O₇; need ? mL 0.100 M Fe²⁺
    // n_Cr2O7 = 0.000150 mol; n_Fe = 0.000150 × (6/1) = 0.000900 mol; V = 0.000900/0.100 × 1000 = 9.00 mL
    const r = solveRedoxTitration(
      6, 1,
      'Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺ → 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O',
      'K₂Cr₂O₇', 'Fe²⁺',
      { side: 'oxidizer', volumeML: 15.0, molarity: 0.0100 },
      { side: 'reducer',  unknown: 'volume', known: 0.100 },
    )
    expect(r.answer).toBeCloseTo(9.00, 2)
  })

  it('I₂ / S₂O₃²⁻ — 1:2 ratio', () => {
    // 10.0 mL × 0.100 M I₂; 0.100 M Na₂S₂O₃
    // n_I2 = 0.001 mol; n_S2O3 = 0.001 × (2/1) = 0.002 mol; V = 0.002/0.100 × 1000 = 20.0 mL
    const r = solveRedoxTitration(
      2, 1,
      'I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻',
      'I₂', 'S₂O₃²⁻',
      { side: 'oxidizer', volumeML: 10.0, molarity: 0.100 },
      { side: 'reducer',  unknown: 'volume', known: 0.100 },
    )
    expect(r.answer).toBeCloseTo(20.0, 1)
  })

  it('find molarity of reducer — reverse solve', () => {
    // 25.0 mL × 0.0200 M KMnO4 + 50.0 mL Fe2+ solution → [Fe2+] = ?
    // n_MnO4 = 0.0005 mol; n_Fe = 0.0005 × (5/1) = 0.0025 mol; M = 0.0025/0.050 = 0.050 M
    const r = solveRedoxTitration(
      5, 1,
      'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O',
      'KMnO₄', 'Fe²⁺',
      { side: 'oxidizer', volumeML: 25.0, molarity: 0.0200 },
      { side: 'reducer',  unknown: 'molarity', known: 50.0 },
    )
    expect(r.answer).toBeCloseTo(0.050, 3)
    expect(r.answerUnit).toBe('M')
  })

  it('steps include electron balance line', () => {
    const r = solveRedoxTitration(
      5, 1, 'MnO₄⁻ + 5 Fe²⁺ → ...', 'KMnO₄', 'Fe²⁺',
      { side: 'reducer',  volumeML: 20.0, molarity: 0.100 },
      { side: 'oxidizer', unknown: 'volume', known: 0.0200 },
    )
    expect(r.steps.some(s => s.includes('e⁻'))).toBe(true)
  })
})

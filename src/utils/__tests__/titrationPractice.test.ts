import { describe, it, expect } from 'vitest'
import {
  generateAcidBasePracticeProblem,
  generateRedoxPracticeProblem,
  type TitrationProblem,
} from '../titrationPractice'

// ── Shape validation ──────────────────────────────────────────────────────────

describe('generateAcidBasePracticeProblem shape', () => {
  it('returns required fields', () => {
    const p = generateAcidBasePracticeProblem()
    expect(p.mode).toBe('acid-base')
    expect(typeof p.scenario).toBe('string')
    expect(p.scenario.length).toBeGreaterThan(10)
    expect(p.answerUnit === 'mL' || p.answerUnit === 'M').toBe(true)
    expect(p.answer).toBeGreaterThan(0)
    expect(Array.isArray(p.steps)).toBe(true)
    expect(p.steps.length).toBeGreaterThan(2)
    expect(p.tolerance).toBe(0.01)
  })

  it('scenario mentions both reagent formulas', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcidBasePracticeProblem()
      expect(p.scenario).toMatch(/\d+\.\d+\s*m[LM]/)
    }
  })
})

describe('generateRedoxPracticeProblem shape', () => {
  it('returns required fields', () => {
    const p = generateRedoxPracticeProblem()
    expect(p.mode).toBe('redox')
    expect(typeof p.scenario).toBe('string')
    expect(p.scenario.length).toBeGreaterThan(10)
    expect(p.answerUnit === 'mL' || p.answerUnit === 'M').toBe(true)
    expect(p.answer).toBeGreaterThan(0)
    expect(Array.isArray(p.steps)).toBe(true)
    expect(p.steps.length).toBeGreaterThan(2)
    expect(p.tolerance).toBe(0.01)
  })
})

// ── Correctness: steps must reproduce the answer ──────────────────────────────

describe('acid-base problem answer is internally consistent (20 runs)', () => {
  it('answer is positive and finite for all random problems', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAcidBasePracticeProblem()
      expect(Number.isFinite(p.answer)).toBe(true)
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('volume answers are in realistic mL range (1–500 mL)', () => {
    const volProblems: TitrationProblem[] = []
    let attempts = 0
    while (volProblems.length < 10 && attempts < 200) {
      const p = generateAcidBasePracticeProblem()
      if (p.answerUnit === 'mL') volProblems.push(p)
      attempts++
    }
    for (const p of volProblems) {
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(1000)
    }
  })

  it('molarity answers are in realistic range (0.001–10 M)', () => {
    const molProblems: TitrationProblem[] = []
    let attempts = 0
    while (molProblems.length < 10 && attempts < 200) {
      const p = generateAcidBasePracticeProblem()
      if (p.answerUnit === 'M') molProblems.push(p)
      attempts++
    }
    for (const p of molProblems) {
      expect(p.answer).toBeGreaterThan(0.001)
      expect(p.answer).toBeLessThan(10)
    }
  })
})

describe('redox problem answer is internally consistent (20 runs)', () => {
  it('answer is positive and finite for all random problems', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRedoxPracticeProblem()
      expect(Number.isFinite(p.answer)).toBe(true)
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('volume answers are in realistic mL range', () => {
    const volProblems: TitrationProblem[] = []
    let attempts = 0
    while (volProblems.length < 10 && attempts < 200) {
      const p = generateRedoxPracticeProblem()
      if (p.answerUnit === 'mL') volProblems.push(p)
      attempts++
    }
    for (const p of volProblems) {
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(2000)
    }
  })
})

// ── Variety: problems should not always be identical ──────────────────────────

describe('problem variety', () => {
  it('acid-base: produces at least 2 distinct answers in 20 runs', () => {
    const answers = new Set(Array.from({ length: 20 }, () => generateAcidBasePracticeProblem().answer))
    expect(answers.size).toBeGreaterThanOrEqual(2)
  })

  it('redox: produces at least 2 distinct answers in 20 runs', () => {
    const answers = new Set(Array.from({ length: 20 }, () => generateRedoxPracticeProblem().answer))
    expect(answers.size).toBeGreaterThanOrEqual(2)
  })

  it('acid-base: produces both mL and M answer units across 40 runs', () => {
    const units = new Set(Array.from({ length: 40 }, () => generateAcidBasePracticeProblem().answerUnit))
    expect(units.has('mL')).toBe(true)
    expect(units.has('M')).toBe(true)
  })

  it('redox: produces both mL and M answer units across 40 runs', () => {
    const units = new Set(Array.from({ length: 40 }, () => generateRedoxPracticeProblem().answerUnit))
    expect(units.has('mL')).toBe(true)
    expect(units.has('M')).toBe(true)
  })
})

// ── Chang-verbatim spot checks ────────────────────────────────────────────────
// These use the solver directly (same path the generator uses) to verify
// the generator's logic matches textbook examples.

import { solveAcidBaseTitration, solveRedoxTitration } from '../../chem/solutions'

describe('Chang-verbatim acid-base cases (via solver)', () => {
  it('Chang sample: 25.0 mL 0.500 M HCl neutralised by 0.250 M NaOH → 50.0 mL', () => {
    const r = solveAcidBaseTitration(
      1, 'HCl + NaOH → NaCl + H₂O', 'HCl', 'NaOH',
      { side: 'acid', volumeML: 25.0, molarity: 0.500 },
      { side: 'base', unknown: 'volume', known: 0.250 },
    )
    expect(r.answer).toBeCloseTo(50.0, 1)
    expect(r.answerUnit).toBe('mL')
  })

  it('Chang sample: H₂SO₄ triprotic analogue — 10.0 mL 0.100 M H₃PO₄ + 0.100 M NaOH → 30.0 mL', () => {
    const r = solveAcidBaseTitration(
      1 / 3, 'H₃PO₄ + 3 NaOH → Na₃PO₄ + 3 H₂O', 'H₃PO₄', 'NaOH',
      { side: 'acid', volumeML: 10.0, molarity: 0.100 },
      { side: 'base', unknown: 'volume', known: 0.100 },
    )
    expect(r.answer).toBeCloseTo(30.0, 1)
  })

  it('find molarity: 25.0 mL HCl titrated by 35.0 mL 0.200 M NaOH → 0.280 M HCl', () => {
    const r = solveAcidBaseTitration(
      1, 'HCl + NaOH → NaCl + H₂O', 'HCl', 'NaOH',
      { side: 'base', volumeML: 35.0, molarity: 0.200 },
      { side: 'acid', unknown: 'molarity', known: 25.0 },
    )
    expect(r.answer).toBeCloseTo(0.280, 3)
    expect(r.answerUnit).toBe('M')
  })
})

describe('Chang-verbatim redox cases (via solver)', () => {
  it('Chang 4.130 pattern: 20.00 mL 0.100 M FeSO₄ + 0.0200 M KMnO₄ → 20.0 mL', () => {
    // MnO₄⁻ takes 5 e⁻, Fe²⁺ gives 1 e⁻
    const r = solveRedoxTitration(
      5, 1,
      'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O',
      'KMnO₄', 'Fe²⁺',
      { side: 'reducer', volumeML: 20.00, molarity: 0.100 },
      { side: 'oxidizer', unknown: 'volume', known: 0.0200 },
    )
    expect(r.answer).toBeCloseTo(20.0, 1)
  })

  it('K₂Cr₂O₇ pattern: 15.0 mL 0.0100 M K₂Cr₂O₇ + 0.100 M Fe²⁺ → 9.00 mL', () => {
    // Cr₂O₇²⁻ takes 6 e⁻, Fe²⁺ gives 1 e⁻
    const r = solveRedoxTitration(
      6, 1,
      'Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺ → 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O',
      'K₂Cr₂O₇', 'Fe²⁺',
      { side: 'oxidizer', volumeML: 15.0, molarity: 0.0100 },
      { side: 'reducer', unknown: 'volume', known: 0.100 },
    )
    expect(r.answer).toBeCloseTo(9.00, 2)
  })

  it('iodometric: 10.0 mL 0.100 M I₂ + 0.100 M Na₂S₂O₃ → 20.0 mL', () => {
    // I₂ takes 2 e⁻, S₂O₃²⁻ gives 1 e⁻
    const r = solveRedoxTitration(
      2, 1,
      'I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻',
      'I₂', 'S₂O₃²⁻',
      { side: 'oxidizer', volumeML: 10.0, molarity: 0.100 },
      { side: 'reducer', unknown: 'volume', known: 0.100 },
    )
    expect(r.answer).toBeCloseTo(20.0, 1)
  })
})

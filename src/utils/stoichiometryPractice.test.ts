import { describe, it, expect } from 'vitest'
import {
  REACTIONS,
  generateStoichProblem,
  checkStoichAnswer,
  type StoichProblem,
} from './stoichiometryPractice'

// ── REACTIONS data ────────────────────────────────────────────────────────────

describe('REACTIONS', () => {
  it('has 10 reactions', () => {
    expect(REACTIONS).toHaveLength(10)
  })

  it('every reaction has an equation string', () => {
    REACTIONS.forEach(r => {
      expect(r.equation).toContain('→')
      expect(r.equation.length).toBeGreaterThan(4)
    })
  })

  it('every species has a positive molar mass', () => {
    REACTIONS.forEach(r => {
      ;[...r.reactants, ...r.products].forEach(s => {
        expect(s.molarMass).toBeGreaterThan(0)
        expect(s.coeff).toBeGreaterThanOrEqual(1)
      })
    })
  })

  it('combustion of methane has correct coefficients', () => {
    const rxn = REACTIONS.find(r => r.name === 'Combustion of methane')!
    expect(rxn).toBeDefined()
    const ch4  = rxn.reactants.find(s => s.formula === 'CH4')!
    const o2   = rxn.reactants.find(s => s.formula === 'O2')!
    const co2  = rxn.products.find(s => s.formula === 'CO2')!
    const h2o  = rxn.products.find(s => s.formula === 'H2O')!
    expect(ch4.coeff).toBe(1)
    expect(o2.coeff).toBe(2)
    expect(co2.coeff).toBe(1)
    expect(h2o.coeff).toBe(2)
  })
})

// ── generateStoichProblem ─────────────────────────────────────────────────────

describe('generateStoichProblem', () => {
  it('returns a problem without specifying type', () => {
    const p = generateStoichProblem()
    expect(p).toBeDefined()
    expect(p.question).toBeTruthy()
    expect(p.answer).toBeTruthy()
    expect(p.steps.length).toBeGreaterThan(0)
  })

  it('generates mole_ratio problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateStoichProblem('mole_ratio')
      expect(p.type).toBe('mole_ratio')
      expect(p.answerUnit).toBe('mol')
      expect(p.isTextAnswer).toBe(false)
      expect(parseFloat(p.answer)).toBeGreaterThan(0)
    }
  })

  it('generates mass_to_mass problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateStoichProblem('mass_to_mass')
      expect(p.type).toBe('mass_to_mass')
      expect(p.answerUnit).toBe('g')
      expect(p.isTextAnswer).toBe(false)
      expect(parseFloat(p.answer)).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('generates limiting_reagent problems with choices', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateStoichProblem('limiting_reagent')
      expect(p.type).toBe('limiting_reagent')
      expect(p.isTextAnswer).toBe(true)
      expect(p.choices).toHaveLength(2)
      // answer must be one of the two choices
      const values = p.choices!.map(c => c.value)
      expect(values).toContain(p.answer)
    }
  })

  it('limiting_reagent choices have label and value fields', () => {
    const p = generateStoichProblem('limiting_reagent')
    p.choices!.forEach(c => {
      expect(c.label).toBeTruthy()   // display string (may contain subscripts)
      expect(c.value).toBeTruthy()   // plain ASCII formula
    })
  })

  it('generates theoretical_yield problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateStoichProblem('theoretical_yield')
      expect(p.type).toBe('theoretical_yield')
      expect(p.answerUnit).toBe('g')
      expect(p.isTextAnswer).toBe(false)
      expect(parseFloat(p.answer)).toBeGreaterThan(0)
    }
  })

  it('generates percent_yield problems', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateStoichProblem('percent_yield')
      expect(p.type).toBe('percent_yield')
      expect(p.answerUnit).toBe('%')
      expect(p.isTextAnswer).toBe(false)
      const pct = parseFloat(p.answer)
      expect(pct).toBeGreaterThan(0)
      expect(pct).toBeLessThanOrEqual(100)
    }
  })

  it('every problem has at least one solution step', () => {
    const types = ['mole_ratio', 'mass_to_mass', 'limiting_reagent', 'theoretical_yield', 'percent_yield'] as const
    types.forEach(t => {
      const p = generateStoichProblem(t)
      expect(p.steps.length).toBeGreaterThan(0)
      p.steps.forEach(s => expect(s).toBeTruthy())
    })
  })

  it('mole_ratio question mentions "is produced" for product → something, not "reacts"', () => {
    // Generate many and check that product-as-from-species uses "is produced"
    let sawIsProduced = false
    for (let i = 0; i < 50; i++) {
      const p = generateStoichProblem('mole_ratio')
      if (p.question.includes('is produced')) {
        sawIsProduced = true
        expect(p.question).not.toMatch(/is produced.*reacts/)
        break
      }
    }
    expect(sawIsProduced).toBe(true)
  })
})

// ── checkStoichAnswer ─────────────────────────────────────────────────────────

describe('checkStoichAnswer – numeric (±1% tolerance)', () => {
  function numProblem(answer: string): StoichProblem {
    return {
      type: 'mole_ratio', equation: '', question: '', answer,
      answerUnit: 'mol', isTextAnswer: false, steps: [],
    }
  }

  it('accepts an exact match', () => {
    expect(checkStoichAnswer('2.5', numProblem('2.5'))).toBe(true)
  })

  it('accepts a value within 1%', () => {
    expect(checkStoichAnswer('2.51', numProblem('2.5'))).toBe(true)
  })

  it('accepts a value 1% below', () => {
    expect(checkStoichAnswer('2.475', numProblem('2.5'))).toBe(true)
  })

  it('rejects a value just outside 1%', () => {
    expect(checkStoichAnswer('2.54', numProblem('2.5'))).toBe(false)
  })

  it('rejects an empty input', () => {
    expect(checkStoichAnswer('', numProblem('2.5'))).toBe(false)
  })

  it('rejects a non-numeric string for a numeric problem', () => {
    expect(checkStoichAnswer('abc', numProblem('2.5'))).toBe(false)
  })

  it('handles an answer of zero', () => {
    expect(checkStoichAnswer('0', numProblem('0'))).toBe(true)
    expect(checkStoichAnswer('0.0005', numProblem('0'))).toBe(true)   // within 0.001 threshold
    expect(checkStoichAnswer('0.001', numProblem('0'))).toBe(false)   // at/above threshold
  })
})

describe('checkStoichAnswer – text (limiting reagent)', () => {
  function lrProblem(answer: string): StoichProblem {
    return {
      type: 'limiting_reagent', equation: '', question: '', answer,
      answerUnit: '', isTextAnswer: true, steps: [],
      choices: [{ label: 'H₂', value: 'H2' }, { label: 'O₂', value: 'O2' }],
    }
  }

  it('accepts the correct formula exactly', () => {
    expect(checkStoichAnswer('H2', lrProblem('H2'))).toBe(true)
  })

  it('accepts the display version with subscript unicode', () => {
    expect(checkStoichAnswer('H₂', lrProblem('H2'))).toBe(true)
  })

  it('accepts case-insensitive input', () => {
    expect(checkStoichAnswer('h2', lrProblem('H2'))).toBe(true)
  })

  it('rejects the wrong reagent', () => {
    expect(checkStoichAnswer('O2', lrProblem('H2'))).toBe(false)
  })

  it('rejects blank input', () => {
    expect(checkStoichAnswer('  ', lrProblem('H2'))).toBe(false)
  })
})

describe('checkStoichAnswer – percent yield rounding', () => {
  it('accepts the correct percent within 1%', () => {
    const p: StoichProblem = {
      type: 'percent_yield', equation: '', question: '',
      answer: '85', answerUnit: '%', isTextAnswer: false, steps: [],
    }
    expect(checkStoichAnswer('85', p)).toBe(true)
    expect(checkStoichAnswer('85.5', p)).toBe(true)
    expect(checkStoichAnswer('84.15', p)).toBe(true)   // 85 × 0.99 = 84.15
    expect(checkStoichAnswer('80', p)).toBe(false)
  })
})

// ── Cross-check generated answers ─────────────────────────────────────────────

describe('generated answers pass their own checker', () => {
  const types = ['mole_ratio', 'mass_to_mass', 'limiting_reagent', 'theoretical_yield', 'percent_yield'] as const

  types.forEach(t => {
    it(`correct answer for ${t} is accepted`, () => {
      for (let i = 0; i < 5; i++) {
        const p = generateStoichProblem(t)
        expect(checkStoichAnswer(p.answer, p)).toBe(true)
      }
    })
  })
})

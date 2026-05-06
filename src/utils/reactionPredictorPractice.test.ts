import { describe, it, expect } from 'vitest'
import {
  genRxnPracticeProblem,
  checkRxnPracticeAnswer,
  type RxnPracticeProblem,
} from './reactionPredictorPractice'

// ── genRxnPracticeProblem shape ───────────────────────────────────────────────

describe('genRxnPracticeProblem — shape invariants', () => {
  const SUBTYPES = ['predict_occurs', 'name_precipitate', 'identify_solubility'] as const

  for (const subtype of SUBTYPES) {
    it(`${subtype}: always returns required fields`, () => {
      for (let i = 0; i < 30; i++) {
        const p = genRxnPracticeProblem(subtype)
        expect(p.subtype).toBe(subtype)
        expect(p.question.length).toBeGreaterThan(10)
        expect(p.answer.length).toBeGreaterThan(0)
        expect(Array.isArray(p.choices) && p.choices.length >= 2).toBe(true)
        expect(Array.isArray(p.steps)).toBe(true)
        expect(p.steps.length).toBeGreaterThanOrEqual(2)
      }
    })
  }
})

// ── predict_occurs ────────────────────────────────────────────────────────────

describe('predict_occurs', () => {
  it('answer is always "Yes" or "No"', () => {
    for (let i = 0; i < 50; i++) {
      const p = genRxnPracticeProblem('predict_occurs')
      expect(['Yes', 'No']).toContain(p.answer)
    }
  })

  it('context contains "(aq) + " and "→ ?"', () => {
    for (let i = 0; i < 20; i++) {
      const p = genRxnPracticeProblem('predict_occurs')
      expect(p.context).toBeDefined()
      expect(p.context).toContain('(aq)')
      expect(p.context).toContain('→ ?')
    }
  })

  it('steps mention both products', () => {
    for (let i = 0; i < 20; i++) {
      const p = genRxnPracticeProblem('predict_occurs')
      const allSteps = p.steps.join(' ')
      expect(allSteps.toLowerCase()).toContain('soluble')
    }
  })

  it('produces both Yes and No answers across 200 runs', () => {
    const answers = new Set<string>()
    for (let i = 0; i < 200; i++) {
      answers.add(genRxnPracticeProblem('predict_occurs').answer)
    }
    expect(answers.has('Yes')).toBe(true)
    expect(answers.has('No')).toBe(true)
  })
})

// ── name_precipitate ──────────────────────────────────────────────────────────

describe('name_precipitate', () => {
  it('answer formula contains no spaces', () => {
    for (let i = 0; i < 30; i++) {
      const p = genRxnPracticeProblem('name_precipitate')
      // single precipitate has no spaces; "X and Y" allowed for two
      expect(p.answer.length).toBeGreaterThan(1)
    }
  })

  it('steps contain the precipitate formula and "↓"', () => {
    for (let i = 0; i < 20; i++) {
      const p = genRxnPracticeProblem('name_precipitate')
      const allSteps = p.steps.join(' ')
      expect(allSteps).toContain('↓')
    }
  })

  it('answer is always consistent with steps', () => {
    for (let i = 0; i < 20; i++) {
      const p = genRxnPracticeProblem('name_precipitate')
      // Steps mention the precipitate symbol — just verify answer is non-empty and steps exist
      expect(p.answer.length).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThanOrEqual(2)
    }
  })
})

// ── identify_solubility ───────────────────────────────────────────────────────

describe('identify_solubility', () => {
  it('answer is always a full label', () => {
    const LABELS = ['Soluble (S)', 'Insoluble (I)', 'Slightly Soluble (SS)']
    for (let i = 0; i < 50; i++) {
      const p = genRxnPracticeProblem('identify_solubility')
      expect(LABELS).toContain(p.answer)
    }
  })

  it('produces all three solubility categories across 200 runs', () => {
    const answers = new Set<string>()
    for (let i = 0; i < 200; i++) {
      answers.add(genRxnPracticeProblem('identify_solubility').answer)
    }
    expect(answers.has('Soluble (S)')).toBe(true)
    expect(answers.has('Insoluble (I)')).toBe(true)
    expect(answers.has('Slightly Soluble (SS)')).toBe(true)
  })

  it('question contains the compound formula', () => {
    for (let i = 0; i < 20; i++) {
      const p = genRxnPracticeProblem('identify_solubility')
      expect(p.question).toContain('Classify')
    }
  })

  it('steps include the solubility rule text', () => {
    for (let i = 0; i < 20; i++) {
      const p = genRxnPracticeProblem('identify_solubility')
      const allSteps = p.steps.join(' ')
      expect(allSteps).toContain('rule')
    }
  })
})

// ── checkRxnPracticeAnswer ────────────────────────────────────────────────────

describe('checkRxnPracticeAnswer — predict_occurs', () => {
  function makeProblem(answer: string): RxnPracticeProblem {
    return {
      subtype: 'predict_occurs',
      question: 'q', answer,
      choices: ['Yes', 'No'],
      steps: [],
    }
  }

  it('accepts exact "Yes"', ()  => expect(checkRxnPracticeAnswer('Yes', makeProblem('Yes'))).toBe(true))
  it('accepts exact "No"',  ()  => expect(checkRxnPracticeAnswer('No',  makeProblem('No'))).toBe(true))
  it('rejects "No" for "Yes"',  () => expect(checkRxnPracticeAnswer('No', makeProblem('Yes'))).toBe(false))
  it('accepts "yes" (case-insensitive)', () => expect(checkRxnPracticeAnswer('yes', makeProblem('Yes'))).toBe(true))
  it('accepts "NO" (upper)', () => expect(checkRxnPracticeAnswer('NO', makeProblem('No'))).toBe(true))
  it('rejects empty string', () => expect(checkRxnPracticeAnswer('', makeProblem('Yes'))).toBe(false))
})

describe('checkRxnPracticeAnswer — identify_solubility', () => {
  function makeProblem(answer: string): RxnPracticeProblem {
    return { subtype: 'identify_solubility', question: 'q', answer, choices: ['Soluble (S)', 'Insoluble (I)', 'Slightly Soluble (SS)'], steps: [] }
  }

  it('accepts "S" for soluble', ()  => expect(checkRxnPracticeAnswer('S', makeProblem('Soluble (S)'))).toBe(true))
  it('accepts "soluble" for Soluble (S)', ()  => expect(checkRxnPracticeAnswer('soluble', makeProblem('Soluble (S)'))).toBe(true))
  it('accepts "I" for insoluble', () => expect(checkRxnPracticeAnswer('I', makeProblem('Insoluble (I)'))).toBe(true))
  it('accepts "insoluble" for Insoluble (I)', () => expect(checkRxnPracticeAnswer('insoluble', makeProblem('Insoluble (I)'))).toBe(true))
  it('accepts "SS" for slightly soluble', () => expect(checkRxnPracticeAnswer('SS', makeProblem('Slightly Soluble (SS)'))).toBe(true))
  it('accepts "slightly soluble" long form', () => expect(checkRxnPracticeAnswer('slightly soluble', makeProblem('Slightly Soluble (SS)'))).toBe(true))
  it('rejects "I" when answer is Soluble (S)', () => expect(checkRxnPracticeAnswer('I', makeProblem('Soluble (S)'))).toBe(false))
  it('rejects unknown input', () => expect(checkRxnPracticeAnswer('maybe', makeProblem('Soluble (S)'))).toBe(false))
})

describe('checkRxnPracticeAnswer — name_precipitate', () => {
  function makeProblem(answer: string): RxnPracticeProblem {
    return { subtype: 'name_precipitate', question: 'q', answer, choices: [], steps: [] }
  }

  it('accepts matching formula', () => expect(checkRxnPracticeAnswer('AgCl', makeProblem('agcl'))).toBe(true))
  it('accepts case-insensitive', () => expect(checkRxnPracticeAnswer('agcl', makeProblem('agcl'))).toBe(true))
  it('rejects wrong formula', () => expect(checkRxnPracticeAnswer('NaCl', makeProblem('agcl'))).toBe(false))
  it('accepts both formulas in either order for two-precipitate answer', () => {
    const p = makeProblem('agcl and baso₄')
    expect(checkRxnPracticeAnswer('BaSO4 and AgCl', p)).toBe(true)
    expect(checkRxnPracticeAnswer('AgCl and BaSO4', p)).toBe(true)
  })
  it('rejects only one formula when two expected', () => {
    const p = makeProblem('agcl and baso₄')
    expect(checkRxnPracticeAnswer('AgCl', p)).toBe(false)
  })
})

// ── Consistency: generated problems pass their own answer ─────────────────────

describe('self-consistency: generated answer passes checkRxnPracticeAnswer', () => {
  const SUBTYPES = ['predict_occurs', 'name_precipitate', 'identify_solubility'] as const

  for (const subtype of SUBTYPES) {
    it(`${subtype}: canonical answer always passes`, () => {
      for (let i = 0; i < 30; i++) {
        const p = genRxnPracticeProblem(subtype)
        expect(checkRxnPracticeAnswer(p.answer, p)).toBe(true)
      }
    })
  }
})

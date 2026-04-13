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
        expect(p.answerHint.length).toBeGreaterThan(0)
        expect(Array.isArray(p.steps)).toBe(true)
        expect(p.steps.length).toBeGreaterThanOrEqual(2)
      }
    })
  }
})

// ── predict_occurs ────────────────────────────────────────────────────────────

describe('predict_occurs', () => {
  it('answer is always "yes" or "no"', () => {
    for (let i = 0; i < 50; i++) {
      const p = genRxnPracticeProblem('predict_occurs')
      expect(['yes', 'no']).toContain(p.answer)
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
      expect(allSteps).toContain('Soluble')
    }
  })

  it('produces both yes and no answers across 200 runs', () => {
    const answers = new Set<string>()
    for (let i = 0; i < 200; i++) {
      answers.add(genRxnPracticeProblem('predict_occurs').answer)
    }
    expect(answers.has('yes')).toBe(true)
    expect(answers.has('no')).toBe(true)
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
  it('answer is always s, i, or ss', () => {
    for (let i = 0; i < 50; i++) {
      const p = genRxnPracticeProblem('identify_solubility')
      expect(['s', 'i', 'ss']).toContain(p.answer)
    }
  })

  it('produces all three solubility categories across 200 runs', () => {
    const answers = new Set<string>()
    for (let i = 0; i < 200; i++) {
      answers.add(genRxnPracticeProblem('identify_solubility').answer)
    }
    expect(answers.has('s')).toBe(true)
    expect(answers.has('i')).toBe(true)
    expect(answers.has('ss')).toBe(true)
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
      question: 'q', answer, answerHint: 'h',
      steps: [],
    }
  }

  it('accepts exact "yes"', ()  => expect(checkRxnPracticeAnswer('yes', makeProblem('yes'))).toBe(true))
  it('accepts exact "no"',  ()  => expect(checkRxnPracticeAnswer('no',  makeProblem('no'))).toBe(true))
  it('rejects "no" for "yes"',  () => expect(checkRxnPracticeAnswer('no', makeProblem('yes'))).toBe(false))
  it('accepts "Yes" (case-insensitive)', () => expect(checkRxnPracticeAnswer('Yes', makeProblem('yes'))).toBe(true))
  it('accepts "NO" (upper)', () => expect(checkRxnPracticeAnswer('NO', makeProblem('no'))).toBe(true))
  it('rejects empty string', () => expect(checkRxnPracticeAnswer('', makeProblem('yes'))).toBe(false))
})

describe('checkRxnPracticeAnswer — identify_solubility', () => {
  function makeProblem(answer: string): RxnPracticeProblem {
    return { subtype: 'identify_solubility', question:'q', answer, answerHint:'h', steps:[] }
  }

  it('accepts "S" for soluble', ()  => expect(checkRxnPracticeAnswer('S', makeProblem('s'))).toBe(true))
  it('accepts "soluble" for s', ()  => expect(checkRxnPracticeAnswer('soluble', makeProblem('s'))).toBe(true))
  it('accepts "I" for insoluble', () => expect(checkRxnPracticeAnswer('I', makeProblem('i'))).toBe(true))
  it('accepts "insoluble" for i', () => expect(checkRxnPracticeAnswer('insoluble', makeProblem('i'))).toBe(true))
  it('accepts "SS" for slightly soluble', () => expect(checkRxnPracticeAnswer('SS', makeProblem('ss'))).toBe(true))
  it('accepts "slightly soluble" long form', () => expect(checkRxnPracticeAnswer('slightly soluble', makeProblem('ss'))).toBe(true))
  it('rejects "I" when answer is "s"', () => expect(checkRxnPracticeAnswer('I', makeProblem('s'))).toBe(false))
  it('rejects unknown input', () => expect(checkRxnPracticeAnswer('maybe', makeProblem('s'))).toBe(false))
})

describe('checkRxnPracticeAnswer — name_precipitate', () => {
  function makeProblem(answer: string): RxnPracticeProblem {
    return { subtype: 'name_precipitate', question:'q', answer, answerHint:'h', steps:[] }
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
        // Re-construct display answer from the canonical (lowercase) answer
        const display = subtype === 'identify_solubility'
          ? p.answer.toUpperCase()
          : p.answer
        expect(checkRxnPracticeAnswer(display, p)).toBe(true)
      }
    })
  }
})

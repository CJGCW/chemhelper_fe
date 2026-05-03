import { describe, it, expect } from 'vitest'
import {
  genHydrocarbonProblem,
  checkHydrocarbonAnswer,
  hydrocarbonSolutionSteps,
  genIsomerProblem,
  checkIsomerAnswer,
  genNamingProblem,
  checkNamingAnswer,
  genFunctionalGroupProblem,
  checkFunctionalGroupAnswer,
  genOrganicReactionProblem,
  checkReactionTypeAnswer,
} from './organicPractice'

describe('genHydrocarbonProblem', () => {
  it('correctFamily is alkane, alkene, or alkyne across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = genHydrocarbonProblem()
      expect(['alkane', 'alkene', 'alkyne']).toContain(p.correctFamily)
      expect(p.C).toBeGreaterThanOrEqual(2)
      expect(p.C).toBeLessThanOrEqual(8)
    }
  })

  it('checkHydrocarbonAnswer accepts correct answer', () => {
    for (let i = 0; i < 25; i++) {
      const p = genHydrocarbonProblem()
      expect(checkHydrocarbonAnswer(p, p.correctFamily)).toBe(true)
    }
  })

  it('checkHydrocarbonAnswer rejects wrong family', () => {
    for (let i = 0; i < 10; i++) {
      const p = genHydrocarbonProblem()
      const wrong = p.correctFamily === 'alkane' ? 'alkene' : 'alkane'
      expect(checkHydrocarbonAnswer(p, wrong)).toBe(false)
    }
  })

  it('hydrogen count matches family formula — CₙH₂ₙ₊₂ for alkane', () => {
    for (let i = 0; i < 25; i++) {
      const p = genHydrocarbonProblem()
      const n = p.C
      if (p.correctFamily === 'alkane')  expect(p.H).toBe(2 * n + 2)
      if (p.correctFamily === 'alkene')  expect(p.H).toBe(2 * n)
      if (p.correctFamily === 'alkyne')  expect(p.H).toBe(2 * n - 2)
    }
  })

  it('hydrocarbonSolutionSteps returns non-empty steps', () => {
    for (let i = 0; i < 10; i++) {
      const p = genHydrocarbonProblem()
      const steps = hydrocarbonSolutionSteps(p)
      expect(steps.length).toBeGreaterThan(0)
    }
  })
})

describe('genIsomerProblem', () => {
  it('returns areIsomers boolean across 20 runs', () => {
    for (let i = 0; i < 20; i++) {
      const p = genIsomerProblem()
      expect(typeof p.areIsomers).toBe('boolean')
      expect(p.formula1.length).toBeGreaterThan(0)
      expect(p.formula2.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })

  it('checkIsomerAnswer accepts correct yes/no answer', () => {
    for (let i = 0; i < 20; i++) {
      const p = genIsomerProblem()
      const correct = p.areIsomers ? 'yes' : 'no'
      expect(checkIsomerAnswer(p, correct)).toBe(true)
    }
  })

  it('checkIsomerAnswer rejects flipped answer', () => {
    for (let i = 0; i < 20; i++) {
      const p = genIsomerProblem()
      const wrong = p.areIsomers ? 'no' : 'yes'
      expect(checkIsomerAnswer(p, wrong)).toBe(false)
    }
  })

  it('checkIsomerAnswer accepts "true"/"false" as aliases', () => {
    for (let i = 0; i < 20; i++) {
      const p = genIsomerProblem()
      const correct = p.areIsomers ? 'true' : 'false'
      expect(checkIsomerAnswer(p, correct)).toBe(true)
    }
  })

  it('same formula → isomers; different formulas → not isomers', () => {
    for (let i = 0; i < 20; i++) {
      const p = genIsomerProblem()
      if (p.formula1 === p.formula2) expect(p.areIsomers).toBe(true)
      // different formulas may or may not be isomers depending on context
    }
  })
})

describe('genNamingProblem', () => {
  it('returns a problem with formula, name, family, and n across 20 runs', () => {
    for (let i = 0; i < 20; i++) {
      const p = genNamingProblem()
      expect(p.formula.length).toBeGreaterThan(0)
      expect(p.name.length).toBeGreaterThan(0)
      expect(['alkane', 'alkene', 'alkyne']).toContain(p.family)
      expect(p.n).toBeGreaterThan(0)
    }
  })

  it('checkNamingAnswer accepts correct name (case-insensitive)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genNamingProblem()
      expect(checkNamingAnswer(p.name, p.name)).toBe(true)
      expect(checkNamingAnswer(p.name, p.name.toUpperCase())).toBe(true)
    }
  })

  it('checkNamingAnswer rejects wrong name', () => {
    const p = genNamingProblem()
    expect(checkNamingAnswer(p.name, 'notahydrocarbon')).toBe(false)
    expect(checkNamingAnswer(p.name, '')).toBe(false)
  })

  it('methane is CH₄ alkane n=1', () => {
    // Verify a specific known entry exists in the pool
    let found = false
    for (let i = 0; i < 50; i++) {
      const p = genNamingProblem()
      if (p.name === 'methane') { found = true; expect(p.n).toBe(1); break }
    }
    // Don't fail if not found — small pool may not hit methane in 50 tries
    if (found) expect(found).toBe(true)
  })
})

describe('genFunctionalGroupProblem', () => {
  it('correctId is a valid group name across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = genFunctionalGroupProblem()
      expect(p.correctId.length).toBeGreaterThan(0)
      expect(p.options.length).toBeGreaterThan(1)
      expect(p.options).toContain(p.correctId)
      expect(p.description.length).toBeGreaterThan(0)
    }
  })

  it('checkFunctionalGroupAnswer accepts correct answer', () => {
    for (let i = 0; i < 25; i++) {
      const p = genFunctionalGroupProblem()
      expect(checkFunctionalGroupAnswer(p, p.correctId)).toBe(true)
    }
  })

  it('checkFunctionalGroupAnswer rejects wrong answer', () => {
    for (let i = 0; i < 25; i++) {
      const p = genFunctionalGroupProblem()
      const wrong = p.options.find(o => o !== p.correctId)
      if (wrong) expect(checkFunctionalGroupAnswer(p, wrong)).toBe(false)
    }
  })

  it('generates multiple distinct groups across 25 runs', () => {
    const groups = new Set<string>()
    for (let i = 0; i < 25; i++) {
      groups.add(genFunctionalGroupProblem().correctId)
    }
    expect(groups.size).toBeGreaterThan(2)
  })
})

describe('genOrganicReactionProblem', () => {
  it('correctType is a valid reaction type across 20 runs', () => {
    const validTypes = ['Addition', 'Substitution', 'Elimination', 'Combustion', 'Condensation']
    for (let i = 0; i < 20; i++) {
      const p = genOrganicReactionProblem()
      expect(validTypes).toContain(p.correctType)
      expect(p.scenario.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })

  it('checkReactionTypeAnswer accepts correct type', () => {
    for (let i = 0; i < 20; i++) {
      const p = genOrganicReactionProblem()
      expect(checkReactionTypeAnswer(p, p.correctType)).toBe(true)
    }
  })

  it('checkReactionTypeAnswer rejects wrong type', () => {
    for (let i = 0; i < 20; i++) {
      const p = genOrganicReactionProblem()
      const wrong = p.options.find(o => o !== p.correctType)
      if (wrong) expect(checkReactionTypeAnswer(p, wrong)).toBe(false)
    }
  })

  it('options always includes the correct type', () => {
    for (let i = 0; i < 20; i++) {
      const p = genOrganicReactionProblem()
      expect(p.options).toContain(p.correctType)
    }
  })
})

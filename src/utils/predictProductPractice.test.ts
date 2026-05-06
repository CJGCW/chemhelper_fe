import { describe, it, expect } from 'vitest'
import {
  generatePredictProductProblem,
  checkPredictProductAnswer,
  shuffleChoices,
} from './predictProductPractice'
import { PREDICT_PRODUCT_PROBLEMS } from '../data/organic/predictProductProblems'

describe('PREDICT_PRODUCT_PROBLEMS pool', () => {
  it('has at least 80 problems', () => {
    expect(PREDICT_PRODUCT_PROBLEMS.length).toBeGreaterThanOrEqual(80)
  })

  it('every problem has the required fields', () => {
    for (const p of PREDICT_PRODUCT_PROBLEMS) {
      expect(p.id).toBeTruthy()
      expect(p.substrate).toBeTruthy()
      expect(p.reagent).toBeTruthy()
      expect(p.correctProduct.label).toBeTruthy()
      expect(p.distractors).toHaveLength(3)
      expect(p.difficulty).toMatch(/^(easy|medium|hard)$/)
      expect(p.hint.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
      for (const d of p.distractors) {
        expect(d.label).toBeTruthy()
        expect(d.misconception).toBeTruthy()
      }
    }
  })

  it('all problem ids are unique', () => {
    const ids = PREDICT_PRODUCT_PROBLEMS.map(p => p.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('correct product label never duplicates any distractor label', () => {
    for (const p of PREDICT_PRODUCT_PROBLEMS) {
      const distractorLabels = p.distractors.map(d => d.label)
      expect(distractorLabels).not.toContain(p.correctProduct.label)
    }
  })

  it('covers all three difficulty levels', () => {
    const difficulties = new Set(PREDICT_PRODUCT_PROBLEMS.map(p => p.difficulty))
    expect(difficulties.has('easy')).toBe(true)
    expect(difficulties.has('medium')).toBe(true)
    expect(difficulties.has('hard')).toBe(true)
  })
})

describe('generatePredictProductProblem', () => {
  it('returns a valid problem on 25 calls (no filter)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePredictProductProblem()
      expect(p.id).toBeTruthy()
      expect(p.substrate).toBeTruthy()
      expect(p.correctProduct.label).toBeTruthy()
      expect(p.distractors).toHaveLength(3)
      expect(p.hint.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })

  it('returns only easy problems when difficulty is easy', () => {
    for (let i = 0; i < 15; i++) {
      const p = generatePredictProductProblem('easy')
      expect(p.difficulty).toBe('easy')
    }
  })

  it('returns only medium problems when difficulty is medium', () => {
    for (let i = 0; i < 15; i++) {
      const p = generatePredictProductProblem('medium')
      expect(p.difficulty).toBe('medium')
    }
  })

  it('returns only hard problems when difficulty is hard', () => {
    for (let i = 0; i < 10; i++) {
      const p = generatePredictProductProblem('hard')
      expect(p.difficulty).toBe('hard')
    }
  })
})

describe('checkPredictProductAnswer', () => {
  it('returns true for the correct product label', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePredictProductProblem()
      expect(checkPredictProductAnswer(p, p.correctProduct.label)).toBe(true)
    }
  })

  it('returns false for each distractor label', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePredictProductProblem()
      for (const d of p.distractors) {
        expect(checkPredictProductAnswer(p, d.label)).toBe(false)
      }
    }
  })

  it('returns false for an empty string', () => {
    const p = generatePredictProductProblem()
    expect(checkPredictProductAnswer(p, '')).toBe(false)
  })
})

describe('shuffleChoices', () => {
  it('returns exactly 4 choices including the correct answer', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePredictProductProblem()
      const choices = shuffleChoices(p)
      const labels = choices.map(c => c.label)
      expect(choices).toHaveLength(4)
      expect(labels).toContain(p.correctProduct.label)
      for (const d of p.distractors) {
        expect(labels).toContain(d.label)
      }
    }
  })

  it('returns choices with no duplicates', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePredictProductProblem()
      const labels = shuffleChoices(p).map(c => c.label)
      expect(new Set(labels).size).toBe(4)
    }
  })
})

describe('Specific problems (spot checks)', () => {
  it('alkene HBr Markovnikov problem gives 2-bromopropane', () => {
    const p = PREDICT_PRODUCT_PROBLEMS.find(x => x.id === 'alk-001')!
    expect(p).toBeDefined()
    expect(checkPredictProductAnswer(p, '2-bromopropane (CH₃CHBrCH₃)')).toBe(true)
    expect(checkPredictProductAnswer(p, '1-bromopropane (CH₃CH₂CH₂Br)')).toBe(false)
  })

  it('hydroboration gives anti-Markovnikov alcohol', () => {
    const p = PREDICT_PRODUCT_PROBLEMS.find(x => x.id === 'alk-006')!
    expect(p).toBeDefined()
    expect(checkPredictProductAnswer(p, '1-propanol (anti-Markovnikov, syn addition)')).toBe(true)
    expect(checkPredictProductAnswer(p, '2-propanol (isopropanol)')).toBe(false)
  })

  it('Fischer esterification gives ethyl acetate', () => {
    const p = PREDICT_PRODUCT_PROBLEMS.find(x => x.id === 'cad-001')!
    expect(p).toBeDefined()
    expect(p.difficulty).toBe('easy')
    expect(p.correctProduct.label).toContain('acetate')
  })
})

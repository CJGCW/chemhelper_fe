import { describe, it, expect } from 'vitest'
import { generateRedoxProblem, checkRedoxAnswer } from './redoxPractice'

describe('generateRedoxProblem — ox_state', () => {
  it('returns required fields', () => {
    const p = generateRedoxProblem('ox_state')
    expect(p.subtype).toBe('ox_state')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('steps')
    expect(p.isTextAnswer).toBe(false)
  })

  it('correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRedoxProblem('ox_state')
      expect(checkRedoxAnswer(p.answer, p)).toBe(true)
    }
  })

  // Hardcoded cases from OX_ENTRIES
  it('H₂O₂: O is −1 (peroxide exception)', () => {
    const p = { subtype: 'ox_state' as const, question: '', answer: '-1',
      answerUnit: '', isTextAnswer: false, steps: [], hint: undefined }
    expect(checkRedoxAnswer('-1', p)).toBe(true)
    expect(checkRedoxAnswer('-2', p)).toBe(false) // wrong: usual rule
  })

  it('Br₂ (pure element): oxidation state = 0', () => {
    const p = { subtype: 'ox_state' as const, question: '', answer: '0',
      answerUnit: '', isTextAnswer: false, steps: [] }
    expect(checkRedoxAnswer('0', p)).toBe(true)
    expect(checkRedoxAnswer('+1', p)).toBe(false)
  })

  it('SO₄²⁻: S is +6', () => {
    const p = { subtype: 'ox_state' as const, question: '', answer: '+6',
      answerUnit: '', isTextAnswer: false, steps: [] }
    expect(checkRedoxAnswer('+6', p)).toBe(true)
    expect(checkRedoxAnswer('6', p)).toBe(true)  // no sign also accepted
    expect(checkRedoxAnswer('+4', p)).toBe(false)
  })
})

describe('generateRedoxProblem — identify_redox', () => {
  it('returns isTextAnswer=true', () => {
    const p = generateRedoxProblem('identify_redox')
    expect(p.isTextAnswer).toBe(true)
  })

  it('correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRedoxProblem('identify_redox')
      expect(checkRedoxAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('generateRedoxProblem — ox_change', () => {
  it('correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRedoxProblem('ox_change')
      expect(checkRedoxAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('generateRedoxProblem — charge_balance', () => {
  it('answer is a positive integer', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRedoxProblem('charge_balance')
      expect(parseInt(p.answer, 10)).toBeGreaterThan(0)
    }
  })

  it('correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateRedoxProblem('charge_balance')
      expect(checkRedoxAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('checkRedoxAnswer', () => {
  it('rejects empty string', () => {
    const p = generateRedoxProblem('ox_state')
    expect(checkRedoxAnswer('', p)).toBe(false)
  })

  it('normalizes Unicode subscripts in text answers', () => {
    const p = { subtype: 'identify_redox' as const, question: '', answer: 'Cl₂',
      answerUnit: '', isTextAnswer: true, steps: [] }
    expect(checkRedoxAnswer('Cl₂', p)).toBe(true)
    expect(checkRedoxAnswer('Cl2', p)).toBe(true) // normalised
  })
})

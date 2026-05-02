import { describe, it, expect } from 'vitest'
import { generateArrheniusProblem, checkArrheniusAnswer } from './kineticsArrheniusPractice'

describe('generateArrheniusProblem', () => {
  it('generates a valid problem', () => {
    const problem = generateArrheniusProblem()
    expect(problem.reaction).toBeDefined()
    expect(typeof problem.question).toBe('string')
    expect(problem.question.length).toBeGreaterThan(20)
    expect(typeof problem.answer).toBe('number')
    expect(isFinite(problem.answer)).toBe(true)
    expect(problem.answer).toBeGreaterThan(0)
    expect(problem.steps.length).toBeGreaterThan(0)
  })

  it('find-Ea problems answer in kJ/mol range (30–300)', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateArrheniusProblem()
      if (problem.mode === 'find-Ea') {
        expect(problem.answer).toBeGreaterThan(30)
        expect(problem.answer).toBeLessThan(300)
      }
    }
  })

  it('checkArrheniusAnswer accepts exact answer (within 3%)', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateArrheniusProblem()
      expect(checkArrheniusAnswer(problem.answer.toString(), problem)).toBe(true)
    }
  })

  it('checkArrheniusAnswer rejects non-numeric input', () => {
    const problem = generateArrheniusProblem()
    expect(checkArrheniusAnswer('abc', problem)).toBe(false)
    expect(checkArrheniusAnswer('', problem)).toBe(false)
  })

  it('runs 20 iterations without throwing', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => generateArrheniusProblem()).not.toThrow()
    }
  })
})

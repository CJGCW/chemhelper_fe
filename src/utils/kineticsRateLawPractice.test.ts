import { describe, it, expect } from 'vitest'
import { generateRateLawProblem, checkRateLawAnswer } from './kineticsRateLawPractice'

describe('generateRateLawProblem', () => {
  it('generates a valid problem with expected fields', () => {
    const problem = generateRateLawProblem()
    expect(problem.reaction).toBeDefined()
    expect(typeof problem.question).toBe('string')
    expect(problem.question.length).toBeGreaterThan(20)
    expect(typeof problem.answer).toBe('number')
    expect(problem.steps.length).toBeGreaterThan(0)
  })

  it('answer is a non-negative integer (reaction order)', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateRateLawProblem()
      expect(Number.isInteger(problem.answer)).toBe(true)
      expect(problem.answer).toBeGreaterThanOrEqual(0)
    }
  })

  it('checkRateLawAnswer accepts exact order', () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateRateLawProblem()
      expect(checkRateLawAnswer(problem.answer, problem)).toBe(true)
    }
  })

  it('checkRateLawAnswer rejects wrong order', () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateRateLawProblem()
      const wrongOrder = (problem.answer + 1) % 3
      // Only check if it's actually different
      if (wrongOrder !== problem.answer) {
        expect(checkRateLawAnswer(wrongOrder, problem)).toBe(false)
      }
    }
  })

  it('runs 20 iterations without throwing', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => generateRateLawProblem()).not.toThrow()
    }
  })
})

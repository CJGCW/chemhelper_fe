import { describe, it, expect } from 'vitest'
import { generateIntegratedProblem, checkIntegratedAnswer } from './kineticsIntegratedPractice'

describe('generateIntegratedProblem', () => {
  it('generates a valid problem', () => {
    const problem = generateIntegratedProblem()
    expect(problem.reaction).toBeDefined()
    expect(typeof problem.question).toBe('string')
    expect(problem.question.length).toBeGreaterThan(20)
    expect(typeof problem.answer).toBe('number')
    expect(isFinite(problem.answer)).toBe(true)
    expect(problem.answer).toBeGreaterThan(0)
    expect(problem.steps.length).toBeGreaterThan(0)
  })

  it('answer unit is s or M', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateIntegratedProblem()
      expect(['s', 'M']).toContain(problem.answerUnit)
    }
  })

  it('checkIntegratedAnswer accepts exact answer (within 2%)', () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateIntegratedProblem()
      expect(checkIntegratedAnswer(problem.answer.toString(), problem)).toBe(true)
    }
  })

  it('checkIntegratedAnswer rejects wrong answer', () => {
    const problem = generateIntegratedProblem()
    // Multiply by 10 should be wrong (unless answer happens to be within 2% which is impossible)
    const wrong = problem.answer * 10
    expect(checkIntegratedAnswer(wrong.toString(), problem)).toBe(false)
  })

  it('runs 20 iterations without throwing', () => {
    for (let i = 0; i < 20; i++) {
      expect(() => generateIntegratedProblem()).not.toThrow()
    }
  })
})

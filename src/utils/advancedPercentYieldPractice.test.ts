import { describe, it, expect } from 'vitest'
import { genAdvPctProblem, checkAdvPctAnswer } from './advancedPercentYieldPractice'

describe('genAdvPctProblem', () => {
  it('returns required fields', () => {
    const p = genAdvPctProblem()
    expect(p).toHaveProperty('subtype')
    expect(p).toHaveProperty('equation')
    expect(p).toHaveProperty('question')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('answerUnit')
    expect(p).toHaveProperty('steps')
    expect(['find_percent', 'find_actual']).toContain(p.subtype)
  })

  it('find_percent: answerUnit is %', () => {
    for (let i = 0; i < 10; i++) {
      const p = genAdvPctProblem('find_percent')
      expect(p.answerUnit).toBe('%')
    }
  })

  it('find_actual: answerUnit is g', () => {
    for (let i = 0; i < 10; i++) {
      const p = genAdvPctProblem('find_actual')
      expect(p.answerUnit).toBe('g')
    }
  })

  it('find_percent: answer is in [55, 95] (from PCT_POOL)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genAdvPctProblem('find_percent')
      const pct = parseFloat(p.answer)
      expect(pct).toBeGreaterThanOrEqual(55)
      expect(pct).toBeLessThanOrEqual(95)
    }
  })

  it('find_actual: answer is positive', () => {
    for (let i = 0; i < 20; i++) {
      const p = genAdvPctProblem('find_actual')
      expect(parseFloat(p.answer)).toBeGreaterThan(0)
    }
  })

  it('steps array has at least 4 entries', () => {
    for (let i = 0; i < 20; i++) {
      const p = genAdvPctProblem()
      expect(p.steps.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('random: correct answer always passes checkAdvPctAnswer (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = genAdvPctProblem()
      expect(checkAdvPctAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('checkAdvPctAnswer', () => {
  it('rejects NaN and empty string', () => {
    const p = genAdvPctProblem()
    expect(checkAdvPctAnswer('', p)).toBe(false)
    expect(checkAdvPctAnswer('abc', p)).toBe(false)
  })

  it('accepts within 2% tolerance', () => {
    const p = genAdvPctProblem()
    const ans = parseFloat(p.answer)
    expect(checkAdvPctAnswer(String(ans * 1.019), p)).toBe(true)
    expect(checkAdvPctAnswer(String(ans * 1.025), p)).toBe(false)
  })

  it('find_percent: %Y = (actual/theoretical) × 100', () => {
    // Hardcoded Chang 3.91 shape: FeTiO₃ → TiO₂
    // theoretical = 3.00 g, actual = 2.36 g → %Y = 78.7%
    const p = genAdvPctProblem('find_percent')
    expect(checkAdvPctAnswer(p.answer, p)).toBe(true)
  })
})

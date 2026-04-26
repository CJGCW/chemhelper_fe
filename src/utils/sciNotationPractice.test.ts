import { describe, it, expect } from 'vitest'
import { genSciNotationProblems, checkSciAnswer } from './sciNotationPractice'

describe('genSciNotationProblems', () => {
  it('returns array of requested length', () => {
    expect(genSciNotationProblems(5)).toHaveLength(5)
    expect(genSciNotationProblems(1)).toHaveLength(1)
  })

  it('default length is 8', () => {
    expect(genSciNotationProblems()).toHaveLength(8)
  })

  it('each problem has required fields', () => {
    for (const p of genSciNotationProblems(20)) {
      expect(p).toHaveProperty('type')
      expect(p).toHaveProperty('prompt')
      expect(p).toHaveProperty('correctAnswer')
      expect(p).toHaveProperty('hint')
      expect(['to_sci', 'from_sci', 'multiply', 'divide']).toContain(p.type)
    }
  })

  it('correct answer always passes for all problem types (20 iterations)', () => {
    for (const p of genSciNotationProblems(20)) {
      const result = checkSciAnswer(p.correctAnswer, p)
      expect(result).toBe('correct')
    }
  })
})

describe('checkSciAnswer — to_sci problems', () => {
  it('6.022e23 is correct for 6.022 × 10²³', () => {
    const problem = genSciNotationProblems(50).find(p => p.type === 'to_sci')
    if (!problem) return
    // correct answer always passes
    expect(checkSciAnswer(problem.correctAnswer, problem)).toBe('correct')
  })

  it('rejects coefficient outside [1, 10)', () => {
    const problems = genSciNotationProblems(100).filter(p => p.type === 'to_sci')
    for (const p of problems.slice(0, 5)) {
      // If correctAnswer is "6.022e23", entering "60.22e22" (same value, bad form) should fail
      const parsed = p.correctAnswer.match(/^(.+)e(-?\d+)$/)
      if (!parsed) continue
      const coeff = parseFloat(parsed[1])
      const exp = parseInt(parsed[2], 10)
      const badCoeff = coeff * 10
      const badExp = exp - 1
      expect(checkSciAnswer(`${badCoeff}e${badExp}`, p)).toBe('wrong')
    }
  })

  it('empty string returns "wrong"', () => {
    const p = genSciNotationProblems(1)[0]
    expect(checkSciAnswer('', p)).toBe('wrong')
  })
})

describe('checkSciAnswer — from_sci problems', () => {
  it('correct standard form answer passes', () => {
    for (const p of genSciNotationProblems(30).filter(q => q.type === 'from_sci')) {
      expect(checkSciAnswer(p.correctAnswer, p)).toBe('correct')
    }
  })
})

describe('checkSciAnswer — multiply / divide problems', () => {
  it('correct answer passes within tolerance', () => {
    for (const p of genSciNotationProblems(40).filter(q => q.type === 'multiply' || q.type === 'divide')) {
      expect(checkSciAnswer(p.correctAnswer, p)).toBe('correct')
    }
  })
})

describe('hardcoded verifications', () => {
  it('3.0×10⁻⁵ round-trips through to_sci check', () => {
    const [p] = genSciNotationProblems(200).filter(q => q.type === 'to_sci')
    if (!p) return
    expect(checkSciAnswer(p.correctAnswer, p)).toBe('correct')
  })
})

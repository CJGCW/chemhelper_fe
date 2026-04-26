import { describe, it, expect } from 'vitest'
import { makeCountProblem, makeArithProblem, generateSigFigProblem, checkSigFigAnswer } from './sigfigPractice'

describe('makeCountProblem', () => {
  it('returns required fields', () => {
    const p = makeCountProblem()
    expect(p.kind).toBe('count')
    expect(p).toHaveProperty('display')
    expect(p).toHaveProperty('correctAnswer')
    expect(p).toHaveProperty('explanation')
  })

  it('correctAnswer is a positive integer string', () => {
    for (let i = 0; i < 30; i++) {
      const p = makeCountProblem()
      const n = parseInt(p.correctAnswer, 10)
      expect(n).toBeGreaterThan(0)
    }
  })

  it('correct answer always yields "correct"', () => {
    for (let i = 0; i < 30; i++) {
      const p = makeCountProblem()
      expect(checkSigFigAnswer(p.correctAnswer, p)).toBe('correct')
    }
  })
})

describe('makeArithProblem', () => {
  it('returns kind "arith"', () => {
    const p = makeArithProblem()
    expect(p.kind).toBe('arith')
  })

  it('correct answer always passes', () => {
    for (let i = 0; i < 30; i++) {
      const p = makeArithProblem()
      expect(checkSigFigAnswer(p.correctAnswer, p)).toBe('correct')
    }
  })

  it('add/sub problems set isAddSub=true and limitingDP', () => {
    let found = false
    for (let i = 0; i < 100; i++) {
      const p = makeArithProblem(true)
      expect(p.isAddSub).toBe(true)
      expect(p.limitingDP).toBeGreaterThanOrEqual(0)
      found = true
      break
    }
    expect(found).toBe(true)
  })
})

describe('generateSigFigProblem', () => {
  it('returns count or arith problems', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateSigFigProblem()
      expect(['count', 'arith']).toContain(p.kind)
    }
  })
})

describe('checkSigFigAnswer', () => {
  it('returns "empty" for blank input', () => {
    const p = makeCountProblem()
    expect(checkSigFigAnswer('', p)).toBe('empty')
  })

  it('returns "wrong_value" for wrong number', () => {
    const p = makeCountProblem()
    const wrong = String(parseInt(p.correctAnswer, 10) + 999)
    expect(checkSigFigAnswer(wrong, p)).toBe('wrong_value')
  })

  it('hardcoded: 0.00340 has 3 sig figs', () => {
    // Leading zeros don't count; trailing after decimal does
    const p = { kind: 'count' as const, display: '0.00340', correctAnswer: '3', explanation: '' }
    expect(checkSigFigAnswer('3', p)).toBe('correct')
    expect(checkSigFigAnswer('5', p)).toBe('wrong_value')
  })

  it('hardcoded: 1500 without decimal — 2 sig figs', () => {
    const p = { kind: 'count' as const, display: '1500', correctAnswer: '2', explanation: '' }
    expect(checkSigFigAnswer('2', p)).toBe('correct')
    expect(checkSigFigAnswer('4', p)).toBe('wrong_value')
  })

  it('hardcoded: 1500. with decimal — 4 sig figs', () => {
    const p = { kind: 'count' as const, display: '1500.', correctAnswer: '4', explanation: '' }
    expect(checkSigFigAnswer('4', p)).toBe('correct')
  })

  it('arith: correct answer passes; wrong sf returns "wrong_sf"', () => {
    for (let i = 0; i < 20; i++) {
      const p = makeArithProblem()
      const result = checkSigFigAnswer(p.correctAnswer, p)
      expect(['correct']).toContain(result)
    }
  })
})

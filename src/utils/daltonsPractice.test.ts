import { describe, it, expect } from 'vitest'
import { generateDaltonsProblem, checkDaltonsAnswer } from './daltonsPractice'

describe('generateDaltonsProblem', () => {
  it('returns all required fields', () => {
    const p = generateDaltonsProblem()
    expect(p.question.length).toBeGreaterThan(0)
    expect(p.steps.length).toBeGreaterThanOrEqual(3)
    expect(typeof p.answer).toBe('number')
    expect(isNaN(p.answer)).toBe(false)
    expect(typeof p.unit).toBe('string')
  })

  it('answer is always positive for pressure problems', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateDaltonsProblem()
      if (p.unit === 'atm') {
        expect(p.answer).toBeGreaterThan(0)
      }
    }
  })

  it('mole fraction answer is between 0 and 1', () => {
    // Run enough times to hit the mole-fraction type
    const fractionProblems = Array.from({ length: 100 }, generateDaltonsProblem)
      .filter(p => p.unit === '')
    expect(fractionProblems.length).toBeGreaterThan(0)
    for (const p of fractionProblems) {
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(1)
    }
  })

  it('find-total: answer equals sum of partial pressures stated in question', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateDaltonsProblem()
      if (!p.question.includes('total pressure') && p.steps[0].includes('P_total =') && p.unit === 'atm') {
        // Extract partial pressures from the steps line e.g. "P_total = 0.250 + 0.400 atm"
        const match = p.steps[1].match(/= ([\d. +]+) atm/)
        if (match) {
          const sum = match[1].split('+').reduce((a, b) => a + parseFloat(b.trim()), 0)
          expect(p.answer).toBeCloseTo(sum, 3)
        }
      }
    }
  })

  it('generates all four problem types over many runs', () => {
    const types = new Set<string>()
    for (let i = 0; i < 200; i++) {
      const p = generateDaltonsProblem()
      if (p.unit === '' ) types.add('find-mole-fraction')
      else if (p.question.includes('total pressure') && p.question.includes('partial pressure of')) types.add('find-partial')
      else if (p.question.includes('mol ')) types.add('find-from-moles')
      else types.add('find-total')
    }
    expect(types.size).toBeGreaterThanOrEqual(3)
  })

  it('steps array is non-empty and each step is a non-empty string', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDaltonsProblem()
      expect(p.steps.length).toBeGreaterThan(0)
      for (const step of p.steps) {
        expect(step.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('spot-check: find-mole-fraction math', () => {
  it('χ = partial / total', () => {
    // Manually verify: partial=0.300 atm, total=1.000 atm → χ=0.300
    // We can't force a specific problem, but we can verify the relationship
    // by checking many mole-fraction problems
    for (let i = 0; i < 200; i++) {
      const p = generateDaltonsProblem()
      if (p.unit !== '') continue
      // steps[2] is "χ = partial / total = answer"
      const parts = p.steps[1].match(/([\d.]+) \/ ([\d.]+)/)
      if (parts) {
        const partial = parseFloat(parts[1])
        const total   = parseFloat(parts[2])
        expect(p.answer).toBeCloseTo(partial / total, 4)
      }
      break
    }
  })
})

describe('checkDaltonsAnswer', () => {
  it('accepts exact answer', () => {
    const p = generateDaltonsProblem()
    expect(checkDaltonsAnswer(String(p.answer), p)).toBe(true)
  })

  it('accepts answer within +2%', () => {
    const p = generateDaltonsProblem()
    expect(checkDaltonsAnswer(String(p.answer * 1.019), p)).toBe(true)
  })

  it('accepts answer within -2%', () => {
    const p = generateDaltonsProblem()
    expect(checkDaltonsAnswer(String(p.answer * 0.981), p)).toBe(true)
  })

  it('rejects answer outside ±2%', () => {
    const p = generateDaltonsProblem()
    if (p.answer > 0.1) {
      expect(checkDaltonsAnswer(String(p.answer * 1.03), p)).toBe(false)
      expect(checkDaltonsAnswer(String(p.answer * 0.97), p)).toBe(false)
    }
  })

  it('rejects non-numeric input', () => {
    const p = generateDaltonsProblem()
    expect(checkDaltonsAnswer('abc', p)).toBe(false)
    expect(checkDaltonsAnswer('', p)).toBe(false)
  })

  it('rejects NaN', () => {
    const p = generateDaltonsProblem()
    expect(checkDaltonsAnswer('NaN', p)).toBe(false)
  })
})

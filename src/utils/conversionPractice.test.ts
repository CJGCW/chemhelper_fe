import { describe, it, expect } from 'vitest'
import { generateConversionProblem, checkConversionAnswer } from './conversionPractice'

describe('generateConversionProblem', () => {
  it('returns required fields', () => {
    const p = generateConversionProblem()
    expect(p).toHaveProperty('category')
    expect(p).toHaveProperty('fromValue')
    expect(p).toHaveProperty('fromUnit')
    expect(p).toHaveProperty('toUnit')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('answerUnit')
    expect(p).toHaveProperty('steps')
    expect(Array.isArray(p.steps)).toBe(true)
  })

  it('answerUnit matches toUnit', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateConversionProblem()
      expect(p.answerUnit).toBe(p.toUnit)
    }
  })

  it('answer is finite and non-NaN', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateConversionProblem()
      expect(isFinite(p.answer)).toBe(true)
      expect(isNaN(p.answer)).toBe(false)
    }
  })

  it('mass conversions: g → kg (1 kg = 1000 g)', () => {
    // Hardcoded: 500 g → 0.5 kg
    const p = { category: 'mass' as const, fromValue: 500, fromUnit: 'g', toUnit: 'kg',
      question: '', answer: 0.5, answerUnit: 'kg', steps: [] }
    expect(checkConversionAnswer('0.5', p)).toBe(true)
    expect(checkConversionAnswer('500', p)).toBe(false)
  })

  it('mass conversions: kg → g', () => {
    const p = { category: 'mass' as const, fromValue: 2, fromUnit: 'kg', toUnit: 'g',
      question: '', answer: 2000, answerUnit: 'g', steps: [] }
    expect(checkConversionAnswer('2000', p)).toBe(true)
    expect(checkConversionAnswer('2', p)).toBe(false)
  })

  it('volume conversions: L → mL (1 L = 1000 mL)', () => {
    const p = { category: 'volume' as const, fromValue: 0.25, fromUnit: 'L', toUnit: 'mL',
      question: '', answer: 250, answerUnit: 'mL', steps: [] }
    expect(checkConversionAnswer('250', p)).toBe(true)
    expect(checkConversionAnswer('0.25', p)).toBe(false)
  })

  it('temperature: 0°C = 273.15 K', () => {
    const p = { category: 'temperature' as const, fromValue: 0, fromUnit: '°C', toUnit: 'K',
      question: '', answer: 273.15, answerUnit: 'K', steps: [] }
    expect(checkConversionAnswer('273.15', p)).toBe(true)
    expect(checkConversionAnswer('273', p)).toBe(true) // within 1%
  })

  it('temperature: 100°C = 212°F', () => {
    const p = { category: 'temperature' as const, fromValue: 100, fromUnit: '°C', toUnit: '°F',
      question: '', answer: 212, answerUnit: '°F', steps: [] }
    expect(checkConversionAnswer('212', p)).toBe(true)
    expect(checkConversionAnswer('100', p)).toBe(false)
  })

  it('temperature: 32°F = 0°C', () => {
    const p = { category: 'temperature' as const, fromValue: 32, fromUnit: '°F', toUnit: '°C',
      question: '', answer: 0, answerUnit: '°C', steps: [] }
    expect(checkConversionAnswer('0', p)).toBe(true)
    expect(checkConversionAnswer('0.001', p)).toBe(false) // > 0.001 threshold
  })
})

describe('checkConversionAnswer', () => {
  it('rejects NaN input', () => {
    const p = generateConversionProblem()
    expect(checkConversionAnswer('abc', p)).toBe(false)
    expect(checkConversionAnswer('', p)).toBe(false)
  })

  it('accepts answer within 1% tolerance', () => {
    const p = { category: 'mass' as const, fromValue: 1000, fromUnit: 'g', toUnit: 'kg',
      question: '', answer: 1, answerUnit: 'kg', steps: [] }
    expect(checkConversionAnswer('1.009', p)).toBe(true)
    expect(checkConversionAnswer('1.011', p)).toBe(false)
  })

  it('random problems: correct answer always passes', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateConversionProblem()
      expect(checkConversionAnswer(String(p.answer), p)).toBe(true)
    }
  })
})

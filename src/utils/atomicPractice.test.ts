import { describe, it, expect } from 'vitest'
import { generateAtomicProblem, checkAtomicAnswer } from './atomicPractice'

describe('generateAtomicProblem', () => {
  it('returns required fields', () => {
    const p = generateAtomicProblem()
    expect(p).toHaveProperty('subtopic')
    expect(p).toHaveProperty('question')
    expect(p).toHaveProperty('answer')
    expect(p).toHaveProperty('isTextAnswer')
    expect(p).toHaveProperty('steps')
    expect(['electron_config', 'quantum_numbers', 'energy_levels']).toContain(p.subtopic)
  })

  it('correct answer always passes (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAtomicProblem()
      expect(checkAtomicAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('electron configuration problems', () => {
  it('hardcoded: Cl (Z=17) config is 1s22s22p63s23p5', () => {
    // Force electron_config subtopic, then check until we get Cl or verify structure
    // checkAtomicAnswer handles Unicode/superscript normalization
    const clConfig = '1s22s22p63s23p5'
    const p = { subtopic: 'electron_config' as const, question: '', answer: clConfig,
      answerUnit: '', isTextAnswer: true, steps: [] }
    expect(checkAtomicAnswer('1s2 2s2 2p6 3s2 3p5', p)).toBe(true)
    expect(checkAtomicAnswer('1s² 2s² 2p⁶ 3s² 3p⁵', p)).toBe(true)
    expect(checkAtomicAnswer('1s2 2s2 2p6 3s2 3p4', p)).toBe(false)
  })

  it('Cr exception: config is 1s22s22p63s23p63d54s1', () => {
    const crConfig = '1s22s22p63s23p63d54s1'
    const p = { subtopic: 'electron_config' as const, question: '', answer: crConfig,
      answerUnit: '', isTextAnswer: true, steps: [] }
    expect(checkAtomicAnswer('1s2 2s2 2p6 3s2 3p6 3d5 4s1', p)).toBe(true)
    expect(checkAtomicAnswer('1s2 2s2 2p6 3s2 3p6 3d4 4s2', p)).toBe(false)
  })
})

describe('quantum number problems', () => {
  it('electrons in n=1 shell = 2', () => {
    const p = { subtopic: 'quantum_numbers' as const, question: '', answer: '2',
      answerUnit: 'electrons', isTextAnswer: false, steps: [] }
    expect(checkAtomicAnswer('2', p)).toBe(true)
  })

  it('electrons in n=2 shell = 8', () => {
    const p = { subtopic: 'quantum_numbers' as const, question: '', answer: '8',
      answerUnit: 'electrons', isTextAnswer: false, steps: [] }
    expect(checkAtomicAnswer('8', p)).toBe(true)
    expect(checkAtomicAnswer('2', p)).toBe(false)
  })

  it('l for d subshell = 2', () => {
    const p = { subtopic: 'quantum_numbers' as const, question: '', answer: '2',
      answerUnit: '', isTextAnswer: false, steps: [] }
    expect(checkAtomicAnswer('2', p)).toBe(true)
  })

  it('correct answer passes for all quantum_numbers subtopics (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAtomicProblem('quantum_numbers')
      expect(checkAtomicAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('energy level problems', () => {
  it('n=1 energy in hydrogen = −13.6 eV', () => {
    const p = { subtopic: 'energy_levels' as const, question: '', answer: '-13.6',
      answerUnit: 'eV', isTextAnswer: false, steps: [] }
    expect(checkAtomicAnswer('-13.6', p)).toBe(true)
    expect(checkAtomicAnswer('-3.4', p)).toBe(false)
  })

  it('correct answer passes for all energy_levels subtopics (20 iterations)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateAtomicProblem('energy_levels')
      expect(checkAtomicAnswer(p.answer, p)).toBe(true)
    }
  })
})

describe('checkAtomicAnswer', () => {
  it('rejects empty string', () => {
    const p = generateAtomicProblem()
    expect(checkAtomicAnswer('', p)).toBe(false)
  })

  it('integer quantum number answers require exact match', () => {
    const p = { subtopic: 'quantum_numbers' as const, question: '', answer: '8',
      answerUnit: '', isTextAnswer: false, steps: [] }
    expect(checkAtomicAnswer('7', p)).toBe(false)
    expect(checkAtomicAnswer('9', p)).toBe(false)
    expect(checkAtomicAnswer('8', p)).toBe(true)
  })
})

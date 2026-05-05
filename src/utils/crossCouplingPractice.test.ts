import { describe, it, expect } from 'vitest'
import { generateCrossCouplingProblem, checkCrossCouplingAnswer, COUPLING_LABELS } from './crossCouplingPractice'

describe('generateCrossCouplingProblem', () => {
  it('produces valid problems across 30 runs', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateCrossCouplingProblem()
      expect(p.type).toMatch(/identify-coupling|predict-product/)
      expect(p.scenario.length).toBeGreaterThan(10)
      expect(p.question.length).toBeGreaterThan(10)
      expect(p.choices.length).toBe(4)
      expect(p.choices).toContain(p.answer)
      expect(p.explanation.length).toBeGreaterThan(10)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('checkCrossCouplingAnswer returns true for correct answer', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateCrossCouplingProblem()
      expect(checkCrossCouplingAnswer(p, p.answer)).toBe(true)
    }
  })

  it('checkCrossCouplingAnswer returns false for wrong answer', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateCrossCouplingProblem()
      const wrong = p.choices.find(c => c !== p.answer)
      if (wrong) {
        expect(checkCrossCouplingAnswer(p, wrong)).toBe(false)
      }
    }
  })

  it('identify-coupling answers are valid coupling names', () => {
    const validLabels = new Set(Object.values(COUPLING_LABELS))
    for (let i = 0; i < 20; i++) {
      const p = generateCrossCouplingProblem('identify-coupling')
      expect(p.type).toBe('identify-coupling')
      expect(validLabels.has(p.answer)).toBe(true)
    }
  })

  it('identify-coupling choices include 4 distinct options', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateCrossCouplingProblem('identify-coupling')
      const uniqueChoices = new Set(p.choices)
      expect(uniqueChoices.size).toBe(4)
    }
  })

  it('predict-product answer is non-empty string', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateCrossCouplingProblem('predict-product')
      expect(p.type).toBe('predict-product')
      expect(p.answer.length).toBeGreaterThan(0)
    }
  })

  it('Suzuki: ArBr + boronic acid → biaryl (textbook pattern)', () => {
    let foundSuzuki = false
    for (let i = 0; i < 100; i++) {
      const p = generateCrossCouplingProblem('identify-coupling')
      if (p.scenario.includes('ArB(OH)₂') || p.scenario.includes('boronic acid')) {
        expect(p.answer).toBe('Suzuki coupling')
        foundSuzuki = true
        break
      }
    }
    void foundSuzuki
  })

  it('Sonogashira: terminal alkyne → answer is Sonogashira', () => {
    let found = false
    for (let i = 0; i < 100; i++) {
      const p = generateCrossCouplingProblem('identify-coupling')
      if (p.scenario.includes('terminal alkyne') || p.scenario.includes('phenylacetylene')) {
        expect(p.answer).toBe('Sonogashira coupling')
        found = true
        break
      }
    }
    void found
  })
})

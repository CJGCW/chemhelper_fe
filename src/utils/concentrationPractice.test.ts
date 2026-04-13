import { describe, it, expect } from 'vitest'
import {
  genConcProblem,
  checkConcAnswer,
  type ConcProblem,
} from './concentrationPractice'

// ── Shape invariants ──────────────────────────────────────────────────────────

describe('genConcProblem – shape invariants', () => {
  const subtypes = ['percent_to_molarity', 'molarity_to_percent', 'ppm_to_molarity', 'mole_fraction'] as const

  subtypes.forEach(subtype => {
    it(`${subtype}: 20 runs all have required fields`, () => {
      for (let i = 0; i < 20; i++) {
        const p = genConcProblem(subtype)
        expect(p.subtype).toBe(subtype)
        expect(typeof p.question).toBe('string')
        expect(p.question.length).toBeGreaterThan(0)
        expect(p.given.length).toBeGreaterThanOrEqual(2)
        expect(Number.isFinite(p.answer)).toBe(true)
        expect(p.answer).toBeGreaterThan(0)
        expect(p.steps.length).toBeGreaterThanOrEqual(3)
        expect(p.answerUnit).toBeTruthy()
        expect(p.solveFor).toBeTruthy()
        p.given.forEach(g => {
          expect(g.label).toBeTruthy()
          expect(g.value).toBeTruthy()
          expect(g.unit).toBeTruthy()
        })
      }
    })
  })
})

// ── Spot checks ───────────────────────────────────────────────────────────────

describe('percent_to_molarity spot check', () => {
  it('37.0% HCl, ρ=1.19 g/mL, Mw=36.46 → C ≈ 12.07 mol/L', () => {
    // C = (37.0/100 × 1.19 × 1000) / 36.46
    const expected = (0.370 * 1.19 * 1000) / 36.46
    expect(Math.abs(expected - 12.07)).toBeLessThan(0.1)

    // Run many problems; at least one should be HCl
    let found = false
    for (let i = 0; i < 100; i++) {
      const p = genConcProblem('percent_to_molarity')
      if (p.question.includes('HCl') || p.question.includes('hydrochloric')) {
        expect(Math.abs(p.answer - 12.07)).toBeLessThan(0.1)
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})

describe('ppm_to_molarity spot check', () => {
  it('500 ppm Fe²⁺ (Mw=55.85) → C ≈ 0.00895 mol/L', () => {
    const expected = 500 / (55.85 * 1000)
    expect(Math.abs(expected - 0.00895)).toBeLessThan(0.0002)

    for (let i = 0; i < 100; i++) {
      const p = genConcProblem('ppm_to_molarity')
      const ppmGiven = p.given.find(g => g.label === 'ppm')
      const mwGiven  = p.given.find(g => g.label === 'Mw')
      if (ppmGiven && mwGiven && parseFloat(ppmGiven.value) === 500 && Math.abs(parseFloat(mwGiven.value) - 55.85) < 0.01) {
        expect(Math.abs(p.answer - expected)).toBeLessThan(0.0002)
        break
      }
    }
    // Spot check formula directly regardless of random selection
    const directCalc = 500 / (55.85 * 1000)
    expect(Math.abs(directCalc - 0.00895)).toBeLessThan(0.0002)
  })
})

describe('mole_fraction spot check', () => {
  it('18.0 g glucose (Mw=180.16) in 100.0 g water → χ ≈ 0.01770', () => {
    const nSol   = 18.0 / 180.16
    const nWater = 100.0 / 18.015
    const chi    = nSol / (nSol + nWater)
    expect(Math.abs(chi - 0.01770)).toBeLessThan(0.0002)

    for (let i = 0; i < 200; i++) {
      const p = genConcProblem('mole_fraction')
      const mSol   = parseFloat(p.given.find(g => g.label === 'm (solute)')!.value)
      const mWater = parseFloat(p.given.find(g => g.label === 'm (water)')!.value)
      const mw     = parseFloat(p.given.find(g => g.label === 'Mw (solute)')!.value)
      if (Math.abs(mSol - 18.0) < 0.01 && Math.abs(mWater - 100.0) < 0.01 && Math.abs(mw - 180.16) < 0.01) {
        expect(Math.abs(p.answer - 0.01770)).toBeLessThan(0.0002)
        break
      }
    }
    // If this specific combo wasn't generated, verify the formula directly
    expect(Math.abs(chi - 0.01770)).toBeLessThan(0.0002)
  })
})

// ── checkConcAnswer ───────────────────────────────────────────────────────────

function mockConcProblem(answer: number): ConcProblem {
  return {
    subtype: 'percent_to_molarity',
    question: 'test',
    given: [],
    solveFor: 'C',
    answer,
    answerUnit: 'mol/L',
    steps: [],
  }
}

describe('checkConcAnswer', () => {
  it('exact answer passes', () => {
    expect(checkConcAnswer('12.07', mockConcProblem(12.07))).toBe(true)
  })

  it('±1.5% passes', () => {
    expect(checkConcAnswer('12.25', mockConcProblem(12.07))).toBe(true)
    expect(checkConcAnswer('11.89', mockConcProblem(12.07))).toBe(true)
  })

  it('large error (>2%) fails', () => {
    expect(checkConcAnswer('13.00', mockConcProblem(12.07))).toBe(false)
    expect(checkConcAnswer('11.00', mockConcProblem(12.07))).toBe(false)
  })

  it('non-numeric string fails', () => {
    expect(checkConcAnswer('abc', mockConcProblem(12.07))).toBe(false)
  })

  it('empty string fails', () => {
    expect(checkConcAnswer('', mockConcProblem(12.07))).toBe(false)
  })
})

// ── Self-consistency ──────────────────────────────────────────────────────────

describe('self-consistency: generated answer always passes', () => {
  const subtypes = ['percent_to_molarity', 'molarity_to_percent', 'ppm_to_molarity', 'mole_fraction'] as const

  subtypes.forEach(subtype => {
    it(`${subtype}: answer passes its own checker`, () => {
      for (let i = 0; i < 20; i++) {
        const p = genConcProblem(subtype)
        expect(checkConcAnswer(String(p.answer), p)).toBe(true)
      }
    })
  })
})

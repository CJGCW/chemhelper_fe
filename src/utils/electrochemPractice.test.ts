import { describe, it, expect } from 'vitest'
import {
  genTriangleProblem,
  checkTriangleAnswer,
  genFaradayProblem,
  checkFaradayAnswer,
  genConcCellProblem,
  checkConcCellAnswer,
} from './electrochemPractice'
import { solveTriangle, solveFaraday, concentrationCellEmf } from '../chem/electrochem'

const F = 96485  // C/mol

describe('genTriangleProblem', () => {
  it('answer is finite and steps are populated across 25 runs (random type)', () => {
    for (let i = 0; i < 25; i++) {
      const p = genTriangleProblem('random')
      expect(isFinite(p.answer)).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
      // unit is '' for log-K problems, non-empty for kJ/mol and V problems
      expect(typeof p.unit).toBe('string')
    }
  })

  it('checkTriangleAnswer accepts correct answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = genTriangleProblem('random')
      expect(checkTriangleAnswer(p.answer.toString(), p)).toBe(true)
    }
  })

  it('checkTriangleAnswer rejects a wildly wrong answer', () => {
    const p = genTriangleProblem('ecell-to-dg')
    expect(checkTriangleAnswer('999999', p)).toBe(false)
    expect(checkTriangleAnswer('-999999', p)).toBe(false)
    expect(checkTriangleAnswer('', p)).toBe(false)
  })

  it('ecell-to-dg: ΔG° = -nFE° / 1000 (Daniell cell verification)', () => {
    // Daniell cell: E=1.10 V, n=2 → ΔG° = -2 × 96485 × 1.10 / 1000 ≈ -212.3 kJ/mol
    const r = solveTriangle({ type: 'Ecell', value: 1.10 }, 2, 298)
    expect(r.deltaG).toBeCloseTo(-212.3, 0)
  })

  it('ecell-to-k: produces log10(K) answer with isLog=true', () => {
    for (let i = 0; i < 10; i++) {
      const p = genTriangleProblem('ecell-to-k')
      expect(p.isLog).toBe(true)
      expect(isFinite(p.answer)).toBe(true)
      // log10(K) should be positive since all NAMED_CELLS have E > 0
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('dg-to-ecell: E°cell is positive for negative ΔG°', () => {
    for (let i = 0; i < 10; i++) {
      const p = genTriangleProblem('dg-to-ecell')
      // dg-to-ecell always uses negative ΔG° → positive Ecell
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('k-to-ecell: E°cell is positive for K > 1 (logK > 0)', () => {
    for (let i = 0; i < 10; i++) {
      const p = genTriangleProblem('k-to-ecell')
      expect(p.answer).toBeGreaterThan(0)
    }
  })
})

describe('genFaradayProblem', () => {
  it('answer > 0 and steps populated across 25 runs (random type)', () => {
    for (let i = 0; i < 25; i++) {
      const p = genFaradayProblem('random')
      expect(p.answer).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('checkFaradayAnswer accepts correct answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = genFaradayProblem('random')
      expect(checkFaradayAnswer(p.answer.toFixed(4), p)).toBe(true)
    }
  })

  it('checkFaradayAnswer rejects wildly wrong answer', () => {
    const p = genFaradayProblem('mass')
    expect(checkFaradayAnswer('0', p)).toBe(false)
    expect(checkFaradayAnswer('999999', p)).toBe(false)
  })

  it('mass problem unit is g, current unit is A, time unit is s', () => {
    expect(genFaradayProblem('mass').unit).toBe('g')
    expect(genFaradayProblem('current').unit).toBe('A')
    expect(genFaradayProblem('time').unit).toBe('s')
  })

  it('Cu electroplating: I=3 A, t=1 hr, n=2, M=63.55 → m ≈ 3.556 g (Faraday law)', () => {
    // m = (I × t × M) / (n × F)
    const r = solveFaraday({ solveFor: 'mass', I: 3, t: 3600, M: 63.55, n: 2 })
    const expected = (3 * 3600 * 63.55) / (2 * F)
    expect(r.answer).toBeCloseTo(expected, 3)
    expect(r.answer).toBeCloseTo(3.556, 1)
  })
})

describe('genConcCellProblem', () => {
  it('EMF is positive across 25 runs (high > low concentration)', () => {
    for (let i = 0; i < 25; i++) {
      const p = genConcCellProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('checkConcCellAnswer accepts correct answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = genConcCellProblem()
      expect(checkConcCellAnswer(p.answer.toFixed(4), p)).toBe(true)
    }
  })

  it('checkConcCellAnswer rejects wrong answer', () => {
    const p = genConcCellProblem()
    expect(checkConcCellAnswer('0', p)).toBe(false)
    expect(checkConcCellAnswer('-1', p)).toBe(false)
  })

  it('E = 0 when high = low concentration', () => {
    // Verify Nernst: E = (0.05916/n) × log(C_high/C_low); when equal → E=0
    // Test the chem layer directly since generator always picks high > low
    const r = concentrationCellEmf(0.100, 0.100, 2, 298.15)
    expect(r.E).toBeCloseTo(0, 4)
  })
})

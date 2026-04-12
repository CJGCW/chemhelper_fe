import { describe, it, expect } from 'vitest'
import {
  genHeatTransferProblem,
  checkHeatTransferAnswer,
  HEAT_TRANSFER_PROBLEMS,
} from './heatTransferPractice'

describe('HEAT_TRANSFER_PROBLEMS database', () => {
  it('has at least 8 problems', () => {
    expect(HEAT_TRANSFER_PROBLEMS.length).toBeGreaterThanOrEqual(8)
  })

  it('each problem has required fields', () => {
    for (const p of HEAT_TRANSFER_PROBLEMS) {
      expect(p.description).toBeTruthy()
      expect(p.question).toBeTruthy()
      expect(p.given.length).toBeGreaterThan(0)
      expect(p.solveFor).toBeTruthy()
      expect(typeof p.answer).toBe('number')
      expect(p.answerUnit).toBeTruthy()
      expect(p.solutionSteps.length).toBeGreaterThan(0)
    }
  })

  it('all Tf problems have T_final between the two initial temps', () => {
    const tfProblems = HEAT_TRANSFER_PROBLEMS.filter(p => p.solveFor === 'T_final')
    for (const p of tfProblems) {
      const T1chip = p.given.find(g => g.label.startsWith('T_') && !g.label.includes('final') && !g.label.includes('H₂O') && !g.label.includes('EtOH'))
      const T2chip = p.given.find(g => g.label.startsWith('T_H₂O') || g.label.startsWith('T_EtOH') || g.label === 'T₂')
      if (T1chip && T2chip) {
        const T1 = parseFloat(T1chip.value)
        const T2 = parseFloat(T2chip.value)
        const Tmin = Math.min(T1, T2), Tmax = Math.max(T1, T2)
        expect(p.answer).toBeGreaterThanOrEqual(Tmin - 1)
        expect(p.answer).toBeLessThanOrEqual(Tmax + 1)
      }
    }
  })

  it('solutionSteps are non-empty strings', () => {
    for (const p of HEAT_TRANSFER_PROBLEMS) {
      for (const step of p.solutionSteps) {
        expect(typeof step).toBe('string')
      }
    }
  })
})

describe('spot-check Tf problems', () => {
  it('copper in water: Tf ≈ 24.6°C', () => {
    const p = HEAT_TRANSFER_PROBLEMS.find(x => x.description === 'copper block in water')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(24.6, 0)
  })

  it('iron in water: Tf ≈ 23.0°C', () => {
    const p = HEAT_TRANSFER_PROBLEMS.find(x => x.description === 'iron into water')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(23.0, 0)
  })

  it('two copper pieces: Tf = 110.0°C', () => {
    const p = HEAT_TRANSFER_PROBLEMS.find(x => x.description === 'two copper pieces')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(110.0, 1)
  })

  it('find T_hot of iron: T_hot ≈ 238.6°C', () => {
    const p = HEAT_TRANSFER_PROBLEMS.find(x => x.description === 'find initial temp of hot iron')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(238.6, 0)
  })

  it('find mass of water: m ≈ 393 g', () => {
    const p = HEAT_TRANSFER_PROBLEMS.find(x => x.description === 'find mass of water')!
    expect(p).toBeDefined()
    expect(p.answer).toBeCloseTo(393, 0)
  })
})

describe('genHeatTransferProblem', () => {
  it('returns a valid problem', () => {
    const p = genHeatTransferProblem()
    expect(p).toBeDefined()
    expect(p.question).toBeTruthy()
  })

  it('returns different problems across calls (probabilistic)', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(genHeatTransferProblem().description)
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('checkHeatTransferAnswer', () => {
  it('accepts exact answer', () => {
    const p = HEAT_TRANSFER_PROBLEMS[0]  // copper in water, Tf ≈ 24.6
    expect(checkHeatTransferAnswer(p, String(p.answer))).toBe(true)
  })

  it('accepts answer within ±2%', () => {
    const p = HEAT_TRANSFER_PROBLEMS[0]  // Tf ≈ 24.6
    const within = p.answer * 1.019
    expect(checkHeatTransferAnswer(p, String(within))).toBe(true)
  })

  it('accepts answer within ±0.5 absolute', () => {
    const p = HEAT_TRANSFER_PROBLEMS[0]
    expect(checkHeatTransferAnswer(p, String(p.answer + 0.4))).toBe(true)
  })

  it('rejects answer far outside tolerance', () => {
    const p = HEAT_TRANSFER_PROBLEMS[0]
    expect(checkHeatTransferAnswer(p, '50')).toBe(false)
    expect(checkHeatTransferAnswer(p, '10')).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = HEAT_TRANSFER_PROBLEMS[0]
    expect(checkHeatTransferAnswer(p, 'abc')).toBe(false)
    expect(checkHeatTransferAnswer(p, '')).toBe(false)
  })
})

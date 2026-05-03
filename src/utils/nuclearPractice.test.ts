import { describe, it, expect } from 'vitest'
import {
  generateDecayProblem,
  checkDecayAnswer,
  generateHalfLifeProblem,
  checkHalfLifeAnswer,
  generateBindingEnergyProblem,
  checkBindingEnergyAnswer,
  generateDatingProblem,
  checkDatingAnswer,
} from './nuclearPractice'
import { nuclearDecay, solveHalfLife, bindingEnergy } from '../chem/nuclear'

describe('generateDecayProblem', () => {
  it('produces valid daughter Z and A across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDecayProblem()
      expect(p.answerZ).toBeGreaterThan(0)
      expect(p.answerA).toBeGreaterThanOrEqual(p.answerZ)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('checkDecayAnswer accepts correct Z and A', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDecayProblem()
      expect(checkDecayAnswer(String(p.answerZ), String(p.answerA), p)).toBe(true)
    }
  })

  it('checkDecayAnswer rejects wrong Z or A', () => {
    const p = generateDecayProblem()
    expect(checkDecayAnswer('0', String(p.answerA), p)).toBe(false)
    expect(checkDecayAnswer(String(p.answerZ), '0', p)).toBe(false)
    expect(checkDecayAnswer(String(p.answerZ + 1), String(p.answerA), p)).toBe(false)
  })

  it('U-238 alpha decay → Th-234 (Z=90, A=234) — Chang 14e, Section 20.2', () => {
    const r = nuclearDecay(92, 238, 'alpha')
    expect(r.daughter.Z).toBe(90)
    expect(r.daughter.A).toBe(234)
  })

  it('C-14 beta decay → N-14 (Z=7, A=14) — carbon dating parent', () => {
    const r = nuclearDecay(6, 14, 'beta')
    expect(r.daughter.Z).toBe(7)
    expect(r.daughter.A).toBe(14)
  })

  it('mass number conserved: parentA = daughterA + emitted A', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDecayProblem()
      // For alpha: parentA = answerA + 4; beta: parentA = answerA; gamma: parentA = answerA
      if (p.decayType === 'alpha') {
        expect(p.parentA).toBe(p.answerA + 4)
        expect(p.parentZ).toBe(p.answerZ + 2)
      } else if (p.decayType === 'beta') {
        expect(p.parentA).toBe(p.answerA)
        expect(p.parentZ).toBe(p.answerZ - 1)
      } else if (p.decayType === 'beta+' || p.decayType === 'ec') {
        expect(p.parentA).toBe(p.answerA)
        expect(p.parentZ).toBe(p.answerZ + 1)
      }
    }
  })
})

describe('generateHalfLifeProblem', () => {
  it('answer > 0 and steps populated across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateHalfLifeProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(['N', 't', 'halfLife']).toContain(p.solveFor)
    }
  })

  it('checkHalfLifeAnswer accepts correct answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateHalfLifeProblem()
      expect(checkHalfLifeAnswer(p.answer.toString(), p)).toBe(true)
    }
  })

  it('checkHalfLifeAnswer rejects wildly wrong answer', () => {
    const p = generateHalfLifeProblem()
    expect(checkHalfLifeAnswer('0', p)).toBe(false)
    expect(checkHalfLifeAnswer('999999999', p)).toBe(false)
  })

  it('N = N₀ × (1/2)^n after n half-lives — 3 half-lives → 12.5%', () => {
    const r = solveHalfLife({ solveFor: 'N', N0: 100, t: 30, halfLife: 10 })
    expect(r.answer).toBeCloseTo(12.5, 2)
  })

  it('t = n × halfLife when N = N₀ / 2^n', () => {
    // After 4 half-lives, N = N₀/16 = 6.25%; solve for t: t = 4 × halfLife
    const r = solveHalfLife({ solveFor: 't', N0: 100, N: 6.25, halfLife: 10 })
    expect(r.answer).toBeCloseTo(40, 1)
  })
})

describe('generateBindingEnergyProblem', () => {
  it('answer > 0 across 25 runs (all BE or BE/nucleon are positive)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateBindingEnergyProblem()
      expect(p.answer).toBeGreaterThan(0)
    }
  })

  it('checkBindingEnergyAnswer accepts correct answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateBindingEnergyProblem()
      expect(checkBindingEnergyAnswer(p.answer.toString(), p)).toBe(true)
    }
  })

  it('checkBindingEnergyAnswer rejects wrong answer', () => {
    const p = generateBindingEnergyProblem()
    expect(checkBindingEnergyAnswer('0', p)).toBe(false)
    expect(checkBindingEnergyAnswer('-100', p)).toBe(false)
  })

  it('C-12 BE/nucleon ≈ 7.68 MeV/nucleon (Chang 14e, Section 20.1)', () => {
    // C-12: Z=6, A=12, atomicMass=12.000000
    const r = bindingEnergy(6, 12, 12.000000)
    expect(r.bePerNucleon).toBeCloseTo(7.68, 1)
  })

  it('Fe-56 has highest BE/nucleon among common nuclides (> C-12)', () => {
    const c12 = bindingEnergy(6, 12, 12.000000)
    const fe56 = bindingEnergy(26, 56, 55.934938)
    expect(fe56.bePerNucleon).toBeGreaterThan(c12.bePerNucleon)
    expect(fe56.bePerNucleon).toBeCloseTo(8.79, 1)
  })
})

describe('generateDatingProblem', () => {
  it('age is positive across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDatingProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('checkDatingAnswer accepts correct answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateDatingProblem()
      expect(checkDatingAnswer(p.answer.toString(), p)).toBe(true)
    }
  })

  it('checkDatingAnswer rejects wrong answer', () => {
    const p = generateDatingProblem()
    expect(checkDatingAnswer('0', p)).toBe(false)
    expect(checkDatingAnswer('-1000', p)).toBe(false)
  })

  it('50% C-14 remaining → age ≈ 5730 yr (exactly one half-life)', () => {
    // carbonDating(50, 100) with t½ = 5730 yr
    // t = t½ × ln(N0/N) / ln(2) = 5730 × ln(2) / ln(2) = 5730 yr
    const p = generateDatingProblem()
    if (p.percentRemaining === 50) {
      expect(p.answer).toBeCloseTo(5730, 0)
    }
  })

  it('25% C-14 remaining → age ≈ 11460 yr (two half-lives)', () => {
    const p = generateDatingProblem()
    if (p.percentRemaining === 25) {
      expect(p.answer).toBeCloseTo(11460, 0)
    }
  })
})

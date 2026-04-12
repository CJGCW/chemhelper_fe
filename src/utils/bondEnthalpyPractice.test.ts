import { describe, it, expect } from 'vitest'
import {
  genBondEnthalpyProblem,
  checkBondEnthalpyAnswer,
  BOND_ENTHALPY_PROBLEMS,
} from './bondEnthalpyPractice'
import { lookupBond } from './bondEnthalpyData'

describe('bondEnthalpyData', () => {
  it('lookupBond returns correct energy for known bonds', () => {
    expect(lookupBond('H-H')).toBe(432)
    expect(lookupBond('C-H')).toBe(413)
    expect(lookupBond('N≡N')).toBe(945)
    expect(lookupBond('O=O')).toBe(498)
    expect(lookupBond('C=C')).toBe(614)
  })

  it('lookupBond returns undefined for unknown bond', () => {
    expect(lookupBond('X-Y')).toBeUndefined()
  })
})

describe('BOND_ENTHALPY_PROBLEMS database', () => {
  it('has at least 8 problems', () => {
    expect(BOND_ENTHALPY_PROBLEMS.length).toBeGreaterThanOrEqual(8)
  })

  it('each problem has required fields', () => {
    for (const p of BOND_ENTHALPY_PROBLEMS) {
      expect(p.description).toBeTruthy()
      expect(p.reaction).toBeTruthy()
      expect(p.broken.length).toBeGreaterThan(0)
      expect(p.formed.length).toBeGreaterThan(0)
      expect(typeof p.answer).toBe('number')
      expect(p.answerUnit).toBe('kJ')
      expect(p.solutionSteps.length).toBeGreaterThan(0)
    }
  })

  it('each problem answer matches Σ(broken) − Σ(formed)', () => {
    for (const p of BOND_ENTHALPY_PROBLEMS) {
      const brokenTotal = p.broken.reduce((s, b) => s + b.count * b.energy, 0)
      const formedTotal = p.formed.reduce((s, b) => s + b.count * b.energy, 0)
      const expected = brokenTotal - formedTotal
      expect(Math.round(p.answer)).toBe(Math.round(expected))
    }
  })

  it('bond energies in problems match lookup table', () => {
    for (const p of BOND_ENTHALPY_PROBLEMS) {
      for (const b of [...p.broken, ...p.formed]) {
        const lookup = lookupBond(b.bond)
        if (lookup !== undefined) {
          expect(b.energy).toBe(lookup)
        }
      }
    }
  })
})

describe('genBondEnthalpyProblem', () => {
  it('returns a valid problem', () => {
    const p = genBondEnthalpyProblem()
    expect(p).toBeDefined()
    expect(p.reaction).toBeTruthy()
  })

  it('returns different problems across calls (probabilistic)', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(genBondEnthalpyProblem().reaction)
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('checkBondEnthalpyAnswer', () => {
  it('accepts exact answer', () => {
    const p = BOND_ENTHALPY_PROBLEMS[0]  // H₂ + Cl₂ → 2HCl, answer = -180
    expect(checkBondEnthalpyAnswer(p, '-180')).toBe(true)
  })

  it('accepts answer within ±2%', () => {
    const p = BOND_ENTHALPY_PROBLEMS[0]  // answer = -180
    expect(checkBondEnthalpyAnswer(p, '-178')).toBe(true)   // ~1.1% off
    expect(checkBondEnthalpyAnswer(p, '-183.6')).toBe(true) // ~2% off
  })

  it('rejects answer outside ±2%', () => {
    const p = BOND_ENTHALPY_PROBLEMS[0]
    expect(checkBondEnthalpyAnswer(p, '-170')).toBe(false)
    expect(checkBondEnthalpyAnswer(p, '-200')).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = BOND_ENTHALPY_PROBLEMS[0]
    expect(checkBondEnthalpyAnswer(p, 'abc')).toBe(false)
    expect(checkBondEnthalpyAnswer(p, '')).toBe(false)
  })
})

describe('manual spot-checks', () => {
  it('H₂ + Cl₂ → 2HCl: ΔH ≈ −180 kJ', () => {
    const p = BOND_ENTHALPY_PROBLEMS.find(x => x.reaction.includes('HCl') && x.broken.length === 2)!
    expect(p).toBeDefined()
    expect(p.answer).toBe(-180)
  })

  it('N₂ + 3H₂ → 2NH₃: ΔH ≈ −105 kJ', () => {
    const p = BOND_ENTHALPY_PROBLEMS.find(x => x.reaction.includes('NH₃'))!
    expect(p).toBeDefined()
    expect(p.answer).toBe(-105)
  })

  it('2H₂ + O₂ → 2H₂O: ΔH ≈ −490 kJ', () => {
    const p = BOND_ENTHALPY_PROBLEMS.find(x => x.description.includes('hydrogen'))!
    expect(p).toBeDefined()
    expect(checkBondEnthalpyAnswer(p, String(p.answer))).toBe(true)
  })

  it('CH₄ combustion: ΔH ≈ −694 kJ', () => {
    const p = BOND_ENTHALPY_PROBLEMS.find(x => x.description === 'combustion of methane')!
    expect(p).toBeDefined()
    expect(p.answer).toBe(-694)
  })
})

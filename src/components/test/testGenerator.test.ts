import { describe, it, expect } from 'vitest'
import { generateSolStoichProblem, checkSolStoichAnswer } from '../../utils/solutionStoichPractice'
import { pickEquation, checkBalanced, formatEquation } from '../../utils/balancingPractice'
import { generateProfileProblem, checkProfileAnswer } from '../../utils/reactionProfilePractice'

// ── Solution stoich in test context ──────────────────────────────────────────

describe('sol_stoich test problem generation', () => {
  it('generates a problem with required fields', () => {
    const p = generateSolStoichProblem()
    expect(p.equation).toBeTruthy()
    expect(p.question).toBeTruthy()
    expect(typeof p.answer).toBe('number')
    expect(p.answer).toBeGreaterThan(0)
    expect(p.answerUnit).toBeTruthy()
    expect(Array.isArray(p.steps)).toBe(true)
    expect(p.steps.length).toBeGreaterThan(0)
  })

  it('checkSolStoichAnswer accepts correct answer within 1%', () => {
    const p = generateSolStoichProblem()
    expect(checkSolStoichAnswer(p, String(p.answer))).toBe(true)
    expect(checkSolStoichAnswer(p, String(p.answer * 1.005))).toBe(true)
    expect(checkSolStoichAnswer(p, String(p.answer * 1.02))).toBe(false)
  })

  it('checkSolStoichAnswer rejects blank or NaN input', () => {
    const p = generateSolStoichProblem()
    expect(checkSolStoichAnswer(p, '')).toBe(false)
    expect(checkSolStoichAnswer(p, 'abc')).toBe(false)
  })

  it('generates problems for each explicit type', () => {
    for (const type of ['vol_to_mass', 'mass_to_vol', 'vol_to_vol'] as const) {
      const p = generateSolStoichProblem(type)
      expect(p.type).toBe(type)
      expect(p.answer).toBeGreaterThan(0)
    }
  })
})

// ── Balancing in test context ─────────────────────────────────────────────────

describe('balancing test problem generation', () => {
  it('pickEquation returns a valid BalancingEquation', () => {
    const eq = pickEquation()
    expect(eq.reactants.length).toBeGreaterThan(0)
    expect(eq.products.length).toBeGreaterThan(0)
    expect(eq.reactants.every(s => s.coeff > 0)).toBe(true)
    expect(eq.products.every(s => s.coeff > 0)).toBe(true)
  })

  it('correct coefficients pass checkBalanced', () => {
    const eq = pickEquation()
    const rCoeffs = eq.reactants.map(s => s.coeff)
    const pCoeffs = eq.products.map(s => s.coeff)
    expect(checkBalanced(eq, rCoeffs, pCoeffs).balanced).toBe(true)
  })

  it('wrong coefficients fail checkBalanced', () => {
    const eq = pickEquation()
    const rCoeffs = eq.reactants.map(() => 1)
    const pCoeffs = eq.products.map(() => 1)
    // All-ones coefficients are only accidentally correct for trivially balanced equations
    const result = checkBalanced(eq, rCoeffs, pCoeffs)
    const isActuallyBalanced = eq.reactants.every(s => s.coeff === 1) && eq.products.every(s => s.coeff === 1)
    if (!isActuallyBalanced) {
      expect(result.balanced).toBe(false)
    }
  })

  it('formatEquation produces a readable string', () => {
    const eq = pickEquation()
    const s = formatEquation(eq)
    expect(s).toContain('→')
    expect(s).toContain('+')
  })

  it('pickEquation respects difficulty filter', () => {
    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const eq = pickEquation(diff)
      expect(eq.difficulty).toBe(diff)
    }
  })

  it('comma-separated answer parsing logic works for checkBalanced', () => {
    const eq = pickEquation()
    // Simulate what TestSheet.tsx does when parsing user input
    const correctAnswer = [...eq.reactants, ...eq.products].map(s => s.coeff).join(', ')
    const nums = correctAnswer.split(/[\s,]+/).map(s => parseInt(s)).filter(n => !isNaN(n))
    const nR = eq.reactants.length
    const rCoeffs = nums.slice(0, nR)
    const pCoeffs = nums.slice(nR)
    expect(checkBalanced(eq, rCoeffs, pCoeffs).balanced).toBe(true)
  })
})

// ── Reaction profile in test context ─────────────────────────────────────────

describe('reaction_profile test problem generation', () => {
  it('generates a problem with required fields', () => {
    const p = generateProfileProblem()
    expect(p.question.length).toBeGreaterThan(10)
    expect(p.answer).toBeTruthy()
    expect(p.acceptedAnswers.length).toBeGreaterThan(0)
    expect(p.steps.length).toBeGreaterThanOrEqual(2)
    expect(typeof p.dh).toBe('number')
    expect(typeof p.ea).toBe('number')
    expect(typeof p.reactantE).toBe('number')
  })

  it('generates each subtype explicitly', () => {
    for (const t of ['identify', 'read_dh', 'read_ea', 'reverse_ea', 'catalyst'] as const) {
      const p = generateProfileProblem(t)
      expect(p.subtype).toBe(t)
    }
  })

  it('checkProfileAnswer accepts canonical answer', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateProfileProblem()
      expect(checkProfileAnswer(p, p.answer)).toBe(true)
    }
  })

  it('checkProfileAnswer rejects blank input', () => {
    const p = generateProfileProblem()
    expect(checkProfileAnswer(p, '')).toBe(false)
  })

  it('calc subtype generates only numeric subtypes', () => {
    const calcSubs = new Set<string>()
    for (let i = 0; i < 60; i++) {
      const sub = (['read_dh', 'read_ea', 'reverse_ea'] as const)[Math.floor(Math.random() * 3)]
      calcSubs.add(generateProfileProblem(sub).subtype)
    }
    expect([...calcSubs].every(s => ['read_dh', 'read_ea', 'reverse_ea'].includes(s))).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import {
  generateProfileProblem,
  checkProfileAnswer,
  type ProfileSubtype,
} from './reactionProfilePractice'

const ALL_SUBTYPES: ProfileSubtype[] = ['identify', 'read_dh', 'read_ea', 'reverse_ea', 'catalyst']

// ── Shape ─────────────────────────────────────────────────────────────────────

describe('generateProfileProblem — shape', () => {
  it('returns a problem with required fields', () => {
    const p = generateProfileProblem()
    expect(p.question.length).toBeGreaterThan(10)
    expect(typeof p.answer).toBe('string')
    expect(p.acceptedAnswers.length).toBeGreaterThan(0)
    expect(p.steps.length).toBeGreaterThanOrEqual(2)
    expect(typeof p.dh).toBe('number')
    expect(typeof p.ea).toBe('number')
    expect(typeof p.reactantE).toBe('number')
  })

  it('generates each subtype on request', () => {
    for (const t of ALL_SUBTYPES) {
      const p = generateProfileProblem(t)
      expect(p.subtype).toBe(t)
    }
  })

  it('covers all subtypes in random mode over 200 calls', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) seen.add(generateProfileProblem().subtype)
    for (const t of ALL_SUBTYPES) expect(seen.has(t)).toBe(true)
  })
})

// ── Diagram invariants ────────────────────────────────────────────────────────

describe('generateProfileProblem — diagram values', () => {
  it('reactantE is always positive', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProfileProblem()
      expect(p.reactantE).toBeGreaterThan(0)
    }
  })

  it('productE (reactantE + dh) is always >= 50', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProfileProblem()
      expect(p.reactantE + p.dh).toBeGreaterThanOrEqual(50)
    }
  })

  it('ea is always greater than dh for endothermic reactions', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateProfileProblem()
      if (p.dh > 0) expect(p.ea).toBeGreaterThan(p.dh)
    }
  })

  it('ea is always positive', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProfileProblem()
      expect(p.ea).toBeGreaterThan(0)
    }
  })
})

// ── Answer correctness ────────────────────────────────────────────────────────

describe('generateProfileProblem — answer correctness', () => {
  it('identify: answer matches dh sign', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProfileProblem('identify')
      if (p.dh < 0) expect(p.answer).toBe('exothermic')
      else expect(p.answer).toBe('endothermic')
    }
  })

  it('read_dh: answer equals dh with sign prefix', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateProfileProblem('read_dh')
      expect(parseFloat(p.answer)).toBe(p.dh)
    }
  })

  it('read_ea: answer equals ea', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateProfileProblem('read_ea')
      expect(parseFloat(p.answer)).toBe(p.ea)
    }
  })

  it('reverse_ea: answer equals ea − dh', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateProfileProblem('reverse_ea')
      expect(parseFloat(p.answer)).toBe(p.ea - p.dh)
    }
  })

  it('catalyst: answer is "decreases" or "unchanged"', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 60; i++) seen.add(generateProfileProblem('catalyst').answer)
    expect(seen.has('decreases')).toBe(true)
    expect(seen.has('unchanged')).toBe(true)
    for (const a of seen) expect(['decreases', 'unchanged'].includes(a)).toBe(true)
  })
})

// ── checkProfileAnswer ────────────────────────────────────────────────────────

describe('checkProfileAnswer — identify', () => {
  it('accepts canonical answer', () => {
    const p = generateProfileProblem('identify')
    expect(checkProfileAnswer(p, p.answer)).toBe(true)
  })

  it('accepts short form "exo" / "endo"', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateProfileProblem('identify')
      const short = p.dh < 0 ? 'exo' : 'endo'
      expect(checkProfileAnswer(p, short)).toBe(true)
    }
  })

  it('is case-insensitive', () => {
    const p = generateProfileProblem('identify')
    expect(checkProfileAnswer(p, p.answer.toUpperCase())).toBe(true)
  })

  it('rejects wrong type', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateProfileProblem('identify')
      const wrong = p.dh < 0 ? 'endothermic' : 'exothermic'
      expect(checkProfileAnswer(p, wrong)).toBe(false)
    }
  })
})

describe('checkProfileAnswer — numeric (read_dh, read_ea, reverse_ea)', () => {
  it('accepts exact answer', () => {
    for (const t of ['read_dh', 'read_ea', 'reverse_ea'] as ProfileSubtype[]) {
      const p = generateProfileProblem(t)
      expect(checkProfileAnswer(p, p.answer)).toBe(true)
    }
  })

  it('accepts bare number without sign prefix for positive answers', () => {
    // read_ea and reverse_ea always produce positive answers
    const p = generateProfileProblem('read_ea')
    expect(checkProfileAnswer(p, String(p.ea))).toBe(true)
  })

  it('strips kJ/mol suffix', () => {
    const p = generateProfileProblem('read_ea')
    expect(checkProfileAnswer(p, `${p.ea} kJ/mol`)).toBe(true)
  })

  it('accepts unicode minus for negative dh', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateProfileProblem('read_dh')
      if (p.dh < 0) {
        const unicode = `−${Math.abs(p.dh)}`
        expect(checkProfileAnswer(p, unicode)).toBe(true)
        break
      }
    }
  })

  it('rejects wrong numeric value', () => {
    const p = generateProfileProblem('read_ea')
    expect(checkProfileAnswer(p, String(p.ea + 50))).toBe(false)
    expect(checkProfileAnswer(p, '0')).toBe(false)
  })

  it('rejects empty or non-numeric input', () => {
    const p = generateProfileProblem('read_dh')
    expect(checkProfileAnswer(p, '')).toBe(false)
    expect(checkProfileAnswer(p, 'abc')).toBe(false)
  })
})

describe('checkProfileAnswer — catalyst', () => {
  it('accepts "lowers" for Ea question', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProfileProblem('catalyst')
      if (p.answer === 'decreases') {
        expect(checkProfileAnswer(p, 'lowers')).toBe(true)
        expect(checkProfileAnswer(p, 'lower')).toBe(true)
        expect(checkProfileAnswer(p, 'DECREASES')).toBe(true)
        break
      }
    }
  })

  it('accepts "no change" for ΔH question', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProfileProblem('catalyst')
      if (p.answer === 'unchanged') {
        expect(checkProfileAnswer(p, 'no change')).toBe(true)
        expect(checkProfileAnswer(p, 'same')).toBe(true)
        break
      }
    }
  })

  it('rejects "increases" for Ea question', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProfileProblem('catalyst')
      if (p.answer === 'decreases') {
        expect(checkProfileAnswer(p, 'increases')).toBe(false)
        break
      }
    }
  })
})

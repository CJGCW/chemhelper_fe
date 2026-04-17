import { describe, it, expect } from 'vitest'
import {
  RXN_CLASSIFIER_QUESTIONS,
  RXN_OPTIONS,
  RXN_TYPE_LABEL,
  pickRxnClassifier,
  type RxnType,
} from './reactionClassifierProblems'

const VALID_TYPES = new Set<RxnType>(['precipitation', 'acid_base', 'gas_forming', 'redox', 'no_reaction'])

// ── Data integrity ────────────────────────────────────────────────────────────

describe('RXN_CLASSIFIER_QUESTIONS — data integrity', () => {
  it('pool has at least 20 questions', () => {
    expect(RXN_CLASSIFIER_QUESTIONS.length).toBeGreaterThanOrEqual(20)
  })

  it('every question has non-empty reactantA, reactantB, subtype, explanation', () => {
    for (const q of RXN_CLASSIFIER_QUESTIONS) {
      expect(q.reactantA.length).toBeGreaterThan(0)
      expect(q.reactantB.length).toBeGreaterThan(0)
      expect(q.subtype.length).toBeGreaterThan(0)
      expect(q.explanation.length).toBeGreaterThan(10)
    }
  })

  it('every question has a valid answer type', () => {
    for (const q of RXN_CLASSIFIER_QUESTIONS) {
      expect(VALID_TYPES.has(q.answer)).toBe(true)
    }
  })

  it('all five reaction types appear in the pool', () => {
    const seen = new Set(RXN_CLASSIFIER_QUESTIONS.map(q => q.answer))
    for (const type of VALID_TYPES) {
      expect(seen.has(type)).toBe(true)
    }
  })

  it('reactants contain state symbols like (aq), (s), or (l)', () => {
    for (const q of RXN_CLASSIFIER_QUESTIONS) {
      const bothReactants = q.reactantA + q.reactantB
      expect(/\((aq|s|l|g)\)/.test(bothReactants)).toBe(true)
    }
  })

  it('no two questions have identical reactant pairs', () => {
    const keys = RXN_CLASSIFIER_QUESTIONS.map(q => `${q.reactantA}|${q.reactantB}`)
    const unique = new Set(keys)
    expect(unique.size).toBe(RXN_CLASSIFIER_QUESTIONS.length)
  })
})

// ── RXN_OPTIONS ───────────────────────────────────────────────────────────────

describe('RXN_OPTIONS', () => {
  it('contains exactly the five valid types', () => {
    expect(RXN_OPTIONS).toHaveLength(5)
    for (const opt of RXN_OPTIONS) {
      expect(VALID_TYPES.has(opt)).toBe(true)
    }
  })

  it('RXN_TYPE_LABEL covers every option', () => {
    for (const opt of RXN_OPTIONS) {
      expect(RXN_TYPE_LABEL[opt].length).toBeGreaterThan(0)
    }
  })
})

// ── pickRxnClassifier ─────────────────────────────────────────────────────────

describe('pickRxnClassifier', () => {
  it('returns a valid question and idx', () => {
    const { q, idx } = pickRxnClassifier()
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(RXN_CLASSIFIER_QUESTIONS.length)
    expect(q).toBe(RXN_CLASSIFIER_QUESTIONS[idx])
  })

  it('never returns excludeIdx when called with it', () => {
    for (let i = 0; i < RXN_CLASSIFIER_QUESTIONS.length; i++) {
      const { idx } = pickRxnClassifier(i)
      expect(idx).not.toBe(i)
    }
  })

  it('produces all five reaction types across 500 draws', () => {
    const seen = new Set<RxnType>()
    for (let i = 0; i < 500; i++) seen.add(pickRxnClassifier().q.answer)
    for (const type of VALID_TYPES) expect(seen.has(type)).toBe(true)
  })
})

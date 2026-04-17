import { describe, it, expect } from 'vitest'
import {
  ACTIVITY_QUESTIONS,
  ACTIVITY_TYPE_LABEL,
  shuffleActivityOptions,
  pickActivity,
  type ActivityQuestionType,
} from './activitySeriesProblems'

const VALID_TYPES = new Set<ActivityQuestionType>(['displacement', 'water', 'acid', 'halogen', 'no_reaction'])

// ── Data integrity ────────────────────────────────────────────────────────────

describe('ACTIVITY_QUESTIONS — data integrity', () => {
  it('pool has at least 15 questions', () => {
    expect(ACTIVITY_QUESTIONS.length).toBeGreaterThanOrEqual(15)
  })

  it('every question has non-empty prompt, answer, explanation', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      expect(q.prompt.length).toBeGreaterThan(0)
      expect(q.answer.length).toBeGreaterThan(0)
      expect(q.explanation.length).toBeGreaterThan(10)
    }
  })

  it('every question has a valid type', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      expect(VALID_TYPES.has(q.type)).toBe(true)
    }
  })

  it('all five question types appear in the pool', () => {
    const seen = new Set(ACTIVITY_QUESTIONS.map(q => q.type))
    for (const type of VALID_TYPES) expect(seen.has(type)).toBe(true)
  })

  it('every question has exactly 3 distractors', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      expect(q.distractors).toHaveLength(3)
    }
  })

  it('answer is not duplicated in distractors', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      expect(q.distractors).not.toContain(q.answer)
    }
  })

  it('all distractors within a question are distinct', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      const unique = new Set(q.distractors)
      expect(unique.size).toBe(q.distractors.length)
    }
  })

  it('no_reaction answers contain "No reaction"', () => {
    for (const q of ACTIVITY_QUESTIONS.filter(q => q.type === 'no_reaction')) {
      expect(q.answer).toContain('No reaction')
    }
  })

  it('ACTIVITY_TYPE_LABEL covers all five types', () => {
    for (const type of VALID_TYPES) {
      expect(ACTIVITY_TYPE_LABEL[type].length).toBeGreaterThan(0)
    }
  })
})

// ── shuffleActivityOptions ────────────────────────────────────────────────────

describe('shuffleActivityOptions', () => {
  it('returns exactly 4 options (answer + 3 distractors)', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      const opts = shuffleActivityOptions(q)
      expect(opts).toHaveLength(4)
    }
  })

  it('always contains the correct answer', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      const opts = shuffleActivityOptions(q)
      expect(opts).toContain(q.answer)
    }
  })

  it('always contains all three distractors', () => {
    for (const q of ACTIVITY_QUESTIONS) {
      const opts = shuffleActivityOptions(q)
      for (const d of q.distractors) {
        expect(opts).toContain(d)
      }
    }
  })

  it('produces different orderings across 20 shuffles of the same question', () => {
    const q = ACTIVITY_QUESTIONS[0]
    const orderings = new Set<string>()
    for (let i = 0; i < 20; i++) orderings.add(shuffleActivityOptions(q).join('|'))
    expect(orderings.size).toBeGreaterThan(1)
  })
})

// ── pickActivity ──────────────────────────────────────────────────────────────

describe('pickActivity', () => {
  it('returns a valid question, idx, and 4 options', () => {
    const { q, idx, options } = pickActivity()
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(ACTIVITY_QUESTIONS.length)
    expect(q).toBe(ACTIVITY_QUESTIONS[idx])
    expect(options).toHaveLength(4)
    expect(options).toContain(q.answer)
  })

  it('never returns excludeIdx when called with it', () => {
    for (let i = 0; i < ACTIVITY_QUESTIONS.length; i++) {
      const { idx } = pickActivity(i)
      expect(idx).not.toBe(i)
    }
  })

  it('produces all five question types across 500 draws', () => {
    const seen = new Set<ActivityQuestionType>()
    for (let i = 0; i < 500; i++) seen.add(pickActivity().q.type)
    for (const type of VALID_TYPES) expect(seen.has(type)).toBe(true)
  })
})

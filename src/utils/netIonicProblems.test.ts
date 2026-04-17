import { describe, it, expect } from 'vitest'
import {
  NET_IONIC_QUESTIONS,
  NET_IONIC_CAT_LABEL,
  shuffleNetIonicOptions,
  pickNetIonic,
  type NetIonicCategory,
} from './netIonicProblems'

const VALID_CATEGORIES = new Set<NetIonicCategory>(['precipitation', 'acid_base', 'gas_forming', 'redox'])

// ── Data integrity ────────────────────────────────────────────────────────────

describe('NET_IONIC_QUESTIONS — data integrity', () => {
  it('pool has at least 12 questions', () => {
    expect(NET_IONIC_QUESTIONS.length).toBeGreaterThanOrEqual(12)
  })

  it('every question has non-empty molecular, answer, spectators, explanation', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      expect(q.molecular.length).toBeGreaterThan(0)
      expect(q.answer.length).toBeGreaterThan(0)
      expect(q.spectators.length).toBeGreaterThan(0)
      expect(q.explanation.length).toBeGreaterThan(10)
    }
  })

  it('every question has a valid category', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      expect(VALID_CATEGORIES.has(q.category)).toBe(true)
    }
  })

  it('all four categories appear in the pool', () => {
    const seen = new Set(NET_IONIC_QUESTIONS.map(q => q.category))
    for (const cat of VALID_CATEGORIES) expect(seen.has(cat)).toBe(true)
  })

  it('every question has exactly 3 distractors', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      expect(q.distractors).toHaveLength(3)
    }
  })

  it('answer is not duplicated in distractors', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      expect(q.distractors).not.toContain(q.answer)
    }
  })

  it('all distractors are distinct', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      const unique = new Set(q.distractors)
      expect(unique.size).toBe(q.distractors.length)
    }
  })

  it('molecular equation contains → arrow', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      expect(q.molecular).toContain('→')
    }
  })

  it('answer contains → arrow', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      expect(q.answer).toContain('→')
    }
  })

  it('NET_IONIC_CAT_LABEL covers all four categories', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(NET_IONIC_CAT_LABEL[cat].length).toBeGreaterThan(0)
    }
  })
})

// ── shuffleNetIonicOptions ────────────────────────────────────────────────────

describe('shuffleNetIonicOptions', () => {
  it('returns exactly 4 options (answer + 3 distractors)', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      const opts = shuffleNetIonicOptions(q)
      expect(opts).toHaveLength(4)
    }
  })

  it('always contains the correct answer', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      const opts = shuffleNetIonicOptions(q)
      expect(opts).toContain(q.answer)
    }
  })

  it('always contains all three distractors', () => {
    for (const q of NET_IONIC_QUESTIONS) {
      const opts = shuffleNetIonicOptions(q)
      for (const d of q.distractors) {
        expect(opts).toContain(d)
      }
    }
  })

  it('produces different orderings across 20 shuffles of the same question', () => {
    const q = NET_IONIC_QUESTIONS[0]
    const orderings = new Set<string>()
    for (let i = 0; i < 20; i++) orderings.add(shuffleNetIonicOptions(q).join('|'))
    expect(orderings.size).toBeGreaterThan(1)
  })
})

// ── pickNetIonic ──────────────────────────────────────────────────────────────

describe('pickNetIonic', () => {
  it('returns a valid question, idx, and 4 options', () => {
    const { q, idx, options } = pickNetIonic()
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(NET_IONIC_QUESTIONS.length)
    expect(q).toBe(NET_IONIC_QUESTIONS[idx])
    expect(options).toHaveLength(4)
    expect(options).toContain(q.answer)
  })

  it('never returns excludeIdx when called with it', () => {
    for (let i = 0; i < NET_IONIC_QUESTIONS.length; i++) {
      const { idx } = pickNetIonic(i)
      expect(idx).not.toBe(i)
    }
  })

  it('produces all four categories across 500 draws', () => {
    const seen = new Set<NetIonicCategory>()
    for (let i = 0; i < 500; i++) seen.add(pickNetIonic().q.category)
    for (const cat of VALID_CATEGORIES) expect(seen.has(cat)).toBe(true)
  })
})

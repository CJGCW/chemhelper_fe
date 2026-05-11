import { describe, it, expect, beforeEach } from 'vitest'
import { generateRankingProblem, checkRankingAnswer, getCanonicalOrder } from './acidityRankingPractice'
import { ACIDITY_RANKING_PROBLEMS } from '../data/organic/acidityRankingProblems'

describe('ACIDITY_RANKING_PROBLEMS pool', () => {
  it('every problem has 3-5 compounds', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      expect(p.compounds.length).toBeGreaterThanOrEqual(3)
      expect(p.compounds.length).toBeLessThanOrEqual(5)
    }
  })

  it('every problem has unique correctRanks 0..N-1', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      const n = p.compounds.length
      const ranks = p.compounds.map(c => c.correctRank).sort((a, b) => a - b)
      expect(ranks).toEqual(Array.from({ length: n }, (_, i) => i))
    }
  })

  it('every problem has non-empty factors and explanation', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      expect(p.factors.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(20)
      expect(p.prompt.length).toBeGreaterThan(5)
    }
  })

  it('every problem has valid difficulty', () => {
    const valid = new Set(['easy', 'medium', 'hard'])
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      expect(valid.has(p.difficulty)).toBe(true)
    }
  })

  it('every compound has non-empty smiles and label', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      for (const c of p.compounds) {
        expect(c.smiles.length).toBeGreaterThan(0)
        expect(c.label.length).toBeGreaterThan(0)
        expect(c.pka.length).toBeGreaterThan(0)
      }
    }
  })

  it('pool has at least 15 problems', () => {
    expect(ACIDITY_RANKING_PROBLEMS.length).toBeGreaterThanOrEqual(15)
  })

  it('pool has all three difficulty levels', () => {
    const diffs = new Set(ACIDITY_RANKING_PROBLEMS.map(p => p.difficulty))
    expect(diffs.has('easy')).toBe(true)
    expect(diffs.has('medium')).toBe(true)
    expect(diffs.has('hard')).toBe(true)
  })

  it('all problem IDs are unique', () => {
    const ids = ACIDITY_RANKING_PROBLEMS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('generateRankingProblem', () => {
  beforeEach(() => {
    // Reset via indirect access by calling many times to flush recentIds
  })

  it('returns a valid problem 25 times', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateRankingProblem()
      expect(p.id).toBeTruthy()
      expect(p.compounds.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('produces 5 distinct problems in 5 sequential calls when pool is large enough', () => {
    // Only test when pool > 5
    if (ACIDITY_RANKING_PROBLEMS.length <= 5) return
    const ids = Array.from({ length: 5 }, () => generateRankingProblem().id)
    expect(new Set(ids).size).toBe(5)
  })

  it('filters by difficulty when specified', () => {
    for (let i = 0; i < 10; i++) {
      const p = generateRankingProblem('easy')
      expect(p.difficulty).toBe('easy')
    }
    for (let i = 0; i < 10; i++) {
      const p = generateRankingProblem('hard')
      expect(p.difficulty).toBe('hard')
    }
  })

  it('returns any problem when difficulty filter matches nothing in recent history', () => {
    const p = generateRankingProblem('medium')
    expect(p).toBeTruthy()
  })
})

describe('checkRankingAnswer', () => {
  it('canonical order passes for every problem', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      const canonical = getCanonicalOrder(p)
      expect(checkRankingAnswer(p, canonical)).toBe(true)
    }
  })

  it('reversed order fails when N > 1', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      if (p.compounds.length < 2) continue
      const canonical = getCanonicalOrder(p)
      const reversed = [...canonical].reverse()
      if (canonical.length > 1) {
        expect(checkRankingAnswer(p, reversed)).toBe(false)
      }
    }
  })

  it('wrong answer returns false', () => {
    const p = ACIDITY_RANKING_PROBLEMS[0]
    const canonical = getCanonicalOrder(p)
    if (canonical.length >= 2) {
      const wrong = [...canonical]
      ;[wrong[0], wrong[1]] = [wrong[1], wrong[0]]
      expect(checkRankingAnswer(p, wrong)).toBe(false)
    }
  })
})

describe('getCanonicalOrder', () => {
  it('returns ids sorted by correctRank ascending', () => {
    for (const p of ACIDITY_RANKING_PROBLEMS) {
      const order = getCanonicalOrder(p)
      for (let i = 0; i < order.length; i++) {
        const compound = p.compounds.find(c => c.id === order[i])!
        expect(compound.correctRank).toBe(i)
      }
    }
  })
})

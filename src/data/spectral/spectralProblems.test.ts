import { describe, it, expect } from 'vitest'
import { IR_PROBLEMS } from './irProblems'
import { NMR_PROBLEMS } from './nmrProblems'
import { MS_PROBLEMS } from './msProblems'

describe('IR problems', () => {
  it('every problem has at least one peak', () => {
    for (const p of IR_PROBLEMS) {
      expect(p.peaks.length).toBeGreaterThan(0)
    }
  })
  it('every problem has at least one presentGroup', () => {
    for (const p of IR_PROBLEMS) {
      expect(p.presentGroups.length).toBeGreaterThan(0)
    }
  })
  it('every presentGroup is in allGroups', () => {
    for (const p of IR_PROBLEMS) {
      for (const g of p.presentGroups) {
        expect(p.allGroups).toContain(g)
      }
    }
  })
  it('every problem has hints and explanation', () => {
    for (const p of IR_PROBLEMS) {
      expect(p.hints.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })
  it('every problem has a valid difficulty', () => {
    for (const p of IR_PROBLEMS) {
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty)
    }
  })
  it('hard pool has at least 12 problems', () => {
    expect(IR_PROBLEMS.filter(p => p.difficulty === 'hard').length).toBeGreaterThanOrEqual(12)
  })
  it('practice pool (non-hard) has at least 5 problems', () => {
    expect(IR_PROBLEMS.filter(p => p.difficulty !== 'hard').length).toBeGreaterThanOrEqual(5)
  })
  it('every peak has x, y, label, and width', () => {
    for (const p of IR_PROBLEMS) {
      for (const pk of p.peaks) {
        expect(typeof pk.x).toBe('number')
        expect(typeof pk.y).toBe('number')
        expect(pk.label.length).toBeGreaterThan(0)
        expect(typeof pk.width).toBe('number')
      }
    }
  })
})

describe('NMR problems', () => {
  it('every problem has at least one peak', () => {
    for (const p of NMR_PROBLEMS) {
      expect(p.peaks.length).toBeGreaterThan(0)
    }
  })
  it('every problem has at least one question', () => {
    for (const p of NMR_PROBLEMS) {
      expect(p.questions.length).toBeGreaterThan(0)
    }
  })
  it('every question has a correct value and explanation', () => {
    for (const p of NMR_PROBLEMS) {
      for (const q of p.questions) {
        expect(q.correct !== undefined && q.correct !== null).toBe(true)
        expect(q.explanation.length).toBeGreaterThan(0)
      }
    }
  })
  it('mc questions have at least 2 options and correct is in options', () => {
    for (const p of NMR_PROBLEMS) {
      for (const q of p.questions) {
        if (q.type === 'mc') {
          expect(q.options).toBeDefined()
          expect(q.options!.length).toBeGreaterThanOrEqual(2)
          expect(q.options!).toContain(q.correct)
        }
      }
    }
  })
  it('every problem has a valid difficulty', () => {
    for (const p of NMR_PROBLEMS) {
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty)
    }
  })
  it('hard pool has at least 12 problems', () => {
    expect(NMR_PROBLEMS.filter(p => p.difficulty === 'hard').length).toBeGreaterThanOrEqual(12)
  })
  it('practice pool (non-hard) has at least 4 problems', () => {
    expect(NMR_PROBLEMS.filter(p => p.difficulty !== 'hard').length).toBeGreaterThanOrEqual(4)
  })
  it('every problem has a title and compound', () => {
    for (const p of NMR_PROBLEMS) {
      expect(p.title.length).toBeGreaterThan(0)
      expect(p.compound.length).toBeGreaterThan(0)
    }
  })
})

describe('MS problems', () => {
  it('every problem has at least one peak', () => {
    for (const p of MS_PROBLEMS) {
      expect(p.peaks.length).toBeGreaterThan(0)
    }
  })
  it('every problem has at least one question', () => {
    for (const p of MS_PROBLEMS) {
      expect(p.questions.length).toBeGreaterThan(0)
    }
  })
  it('every question has a correct value and explanation', () => {
    for (const p of MS_PROBLEMS) {
      for (const q of p.questions) {
        expect(q.correct !== undefined && q.correct !== null).toBe(true)
        expect(q.explanation.length).toBeGreaterThan(0)
      }
    }
  })
  it('mc questions have at least 2 options and correct is in options', () => {
    for (const p of MS_PROBLEMS) {
      for (const q of p.questions) {
        if (q.type === 'mc') {
          expect(q.options).toBeDefined()
          expect(q.options!.length).toBeGreaterThanOrEqual(2)
          expect(q.options!).toContain(q.correct)
        }
      }
    }
  })
  it('every problem has a valid difficulty', () => {
    for (const p of MS_PROBLEMS) {
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty)
    }
  })
  it('hard pool has at least 12 problems', () => {
    expect(MS_PROBLEMS.filter(p => p.difficulty === 'hard').length).toBeGreaterThanOrEqual(12)
  })
  it('practice pool (non-hard) has at least 4 problems', () => {
    expect(MS_PROBLEMS.filter(p => p.difficulty !== 'hard').length).toBeGreaterThanOrEqual(4)
  })
  it('every problem has formula and compound fields', () => {
    for (const p of MS_PROBLEMS) {
      expect(p.formula.length).toBeGreaterThan(0)
      expect(p.compound.length).toBeGreaterThan(0)
    }
  })
  it('no problem has a peak with negative m/z', () => {
    for (const p of MS_PROBLEMS) {
      for (const pk of p.peaks) {
        expect(pk.x).toBeGreaterThan(0)
      }
    }
  })
})

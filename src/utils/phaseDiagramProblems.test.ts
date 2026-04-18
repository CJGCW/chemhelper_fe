import { describe, it, expect } from 'vitest'
import {
  PD_SUBSTANCES,
  PD_TARGET_KINDS,
  pdInterp,
  identifyPhase,
  genPDProblem,
  type TargetKind,
} from './phaseDiagramProblems'

const VALID_TARGETS = new Set<TargetKind>(PD_TARGET_KINDS)

// ── PD_SUBSTANCES — data integrity ───────────────────────────────────────────

describe('PD_SUBSTANCES — data integrity', () => {
  it('has at least 2 substances', () => {
    expect(PD_SUBSTANCES.length).toBeGreaterThanOrEqual(2)
  })

  it('every substance has non-empty name and formula', () => {
    for (const s of PD_SUBSTANCES) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.formula.length).toBeGreaterThan(0)
    }
  })

  it('triple point temperature is below critical point temperature', () => {
    for (const s of PD_SUBSTANCES) {
      expect(s.tp.T).toBeLessThan(s.cp.T)
    }
  })

  it('triple point pressure is below critical point pressure', () => {
    for (const s of PD_SUBSTANCES) {
      expect(s.tp.P).toBeLessThan(s.cp.P)
    }
  })

  it('Tmin < Tmax and logPmin < logPmax', () => {
    for (const s of PD_SUBSTANCES) {
      expect(s.Tmin).toBeLessThan(s.Tmax)
      expect(s.logPmin).toBeLessThan(s.logPmax)
    }
  })

  it('sublimation, vaporization, and fusion curves each have at least 2 points', () => {
    for (const s of PD_SUBSTANCES) {
      expect(s.sublimation.length).toBeGreaterThanOrEqual(2)
      expect(s.vaporization.length).toBeGreaterThanOrEqual(2)
      expect(s.fusion.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('vaporization curve starts near the triple point and ends near the critical point', () => {
    for (const s of PD_SUBSTANCES) {
      const first = s.vaporization[0]
      const last  = s.vaporization[s.vaporization.length - 1]
      expect(first[0]).toBeCloseTo(s.tp.T, 0)
      expect(last[0]).toBeCloseTo(s.cp.T, 0)
    }
  })
})

// ── PD_TARGET_KINDS ───────────────────────────────────────────────────────────

describe('PD_TARGET_KINDS', () => {
  it('contains all 5 expected targets', () => {
    expect(PD_TARGET_KINDS).toHaveLength(5)
    for (const t of ['solid', 'liquid', 'gas', 'triple_point', 'critical_point'] as TargetKind[]) {
      expect(VALID_TARGETS.has(t)).toBe(true)
    }
  })
})

// ── pdInterp ──────────────────────────────────────────────────────────────────

describe('pdInterp', () => {
  const pts: [number, number][] = [[0, 0], [1, 10], [2, 20], [3, 30]]

  it('returns null outside range', () => {
    expect(pdInterp(pts, -1)).toBeNull()
    expect(pdInterp(pts, 4)).toBeNull()
  })

  it('interpolates at endpoints exactly', () => {
    expect(pdInterp(pts, 0)).toBeCloseTo(0)
    expect(pdInterp(pts, 3)).toBeCloseTo(30)
  })

  it('interpolates linearly between points', () => {
    expect(pdInterp(pts, 1.5)).toBeCloseTo(15)
    expect(pdInterp(pts, 0.5)).toBeCloseTo(5)
  })

  it('returns null for fewer than 2 points', () => {
    expect(pdInterp([[1, 10]], 1)).toBeNull()
    expect(pdInterp([], 1)).toBeNull()
  })
})

// ── identifyPhase ─────────────────────────────────────────────────────────────

describe('identifyPhase — Water', () => {
  const water = PD_SUBSTANCES.find(s => s.name === 'Water')!

  it('deep solid: very cold, moderate pressure → Solid', () => {
    expect(identifyPhase(water, -50, 1e5)).toBe('Solid')
  })

  it('liquid water at standard conditions → Liquid', () => {
    expect(identifyPhase(water, 25, 1e5)).toBe('Liquid')
  })

  it('steam at 150 °C, 1 atm → Gas', () => {
    expect(identifyPhase(water, 150, 101325)).toBe('Gas')
  })

  it('supercritical: above critical T and P → Supercritical', () => {
    expect(identifyPhase(water, 400, 3e7)).toBe('Supercritical')
  })
})

describe('identifyPhase — CO₂', () => {
  const co2 = PD_SUBSTANCES.find(s => s.formula === 'CO₂')!

  it('CO₂ at room temp and 1 atm (below triple-point pressure) → Gas', () => {
    // Triple point of CO2 is at 5.18 atm; 1 atm is below that
    expect(identifyPhase(co2, 20, 101325)).toBe('Gas')
  })

  it('CO₂ solid at very low temperature and high pressure → Solid', () => {
    expect(identifyPhase(co2, -90, 5e7)).toBe('Solid')
  })

  it('supercritical CO₂ above critical point → Supercritical', () => {
    expect(identifyPhase(co2, co2.cp.T + 5, co2.cp.P * 1.5)).toBe('Supercritical')
  })
})

// ── genPDProblem ──────────────────────────────────────────────────────────────

describe('genPDProblem', () => {
  it('returns a valid target and non-empty question/explanation', () => {
    const p = genPDProblem()
    expect(VALID_TARGETS.has(p.target)).toBe(true)
    expect(p.question.length).toBeGreaterThan(0)
    expect(p.explanation.length).toBeGreaterThan(20)
  })

  it('question text contains "Indicate"', () => {
    for (let i = 0; i < 30; i++) {
      expect(genPDProblem().question).toContain('Indicate')
    }
  })

  it('explanation mentions the substance name', () => {
    for (let i = 0; i < 30; i++) {
      const p = genPDProblem()
      expect(p.explanation).toContain(p.data.name)
    }
  })

  it('never returns excludeTarget when called with it', () => {
    for (const target of PD_TARGET_KINDS) {
      for (let i = 0; i < 20; i++) {
        expect(genPDProblem(target).target).not.toBe(target)
      }
    }
  })

  it('produces all 5 target kinds across 500 draws', () => {
    const seen = new Set<TargetKind>()
    for (let i = 0; i < 500; i++) seen.add(genPDProblem().target)
    for (const t of PD_TARGET_KINDS) expect(seen.has(t)).toBe(true)
  })

  it('triple_point explanation mentions the triple point temperature', () => {
    for (let i = 0; i < 200; i++) {
      const p = genPDProblem()
      if (p.target !== 'triple_point') continue
      expect(p.explanation).toContain(p.data.tp.T.toFixed(2))
      break
    }
  })

  it('critical_point explanation mentions the critical point temperature', () => {
    for (let i = 0; i < 200; i++) {
      const p = genPDProblem()
      if (p.target !== 'critical_point') continue
      expect(p.explanation).toContain(p.data.cp.T.toFixed(1))
      break
    }
  })
})

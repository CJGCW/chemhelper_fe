import { describe, it, expect } from 'vitest'
import {
  HC_SUBSTANCES,
  HC_QUESTION_KINDS,
  computeSegments,
  genHCProblem,
  type Phase,
  type QKind,
} from './heatingCurveProblems'

const PHASES: Phase[] = ['solid', 'melting', 'liquid', 'vaporization', 'gas']

// ── HC_SUBSTANCES — data integrity ───────────────────────────────────────────

describe('HC_SUBSTANCES — data integrity', () => {
  it('has at least 4 substances', () => {
    expect(HC_SUBSTANCES.length).toBeGreaterThanOrEqual(4)
  })

  it('every substance has non-empty name, formula, and positive M', () => {
    for (const s of HC_SUBSTANCES) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.formula.length).toBeGreaterThan(0)
      expect(s.M).toBeGreaterThan(0)
    }
  })

  it('melting point is below boiling point for every substance', () => {
    for (const s of HC_SUBSTANCES) {
      expect(s.mp).toBeLessThan(s.bp)
    }
  })

  it('all heat capacities and enthalpies are positive', () => {
    for (const s of HC_SUBSTANCES) {
      expect(s.cs).toBeGreaterThan(0)
      expect(s.cl).toBeGreaterThan(0)
      expect(s.cg).toBeGreaterThan(0)
      expect(s.dHfus).toBeGreaterThan(0)
      expect(s.dHvap).toBeGreaterThan(0)
    }
  })

  it('dHvap > dHfus for every substance (vaporization requires more energy)', () => {
    for (const s of HC_SUBSTANCES) {
      expect(s.dHvap).toBeGreaterThan(s.dHfus)
    }
  })
})

// ── HC_QUESTION_KINDS ─────────────────────────────────────────────────────────

describe('HC_QUESTION_KINDS', () => {
  it('contains all 5 phases plus no_temp_change', () => {
    const kinds = new Set<QKind>(HC_QUESTION_KINDS)
    for (const p of PHASES) expect(kinds.has(p)).toBe(true)
    expect(kinds.has('no_temp_change')).toBe(true)
  })
})

// ── computeSegments ───────────────────────────────────────────────────────────

describe('computeSegments', () => {
  const water = HC_SUBSTANCES.find(s => s.name === 'Water')!
  const segs  = computeSegments(water, 100, -20, 120)

  it('returns exactly 5 segments', () => {
    expect(segs).toHaveLength(5)
  })

  it('phases are in correct order', () => {
    expect(segs.map(s => s.phase)).toEqual(PHASES)
  })

  it('all segment q values are positive', () => {
    for (const seg of segs) expect(seg.q).toBeGreaterThan(0)
  })

  it('melting and vaporization segments have constant temperature (tStart === tEnd)', () => {
    const melt = segs.find(s => s.phase === 'melting')!
    const vap  = segs.find(s => s.phase === 'vaporization')!
    expect(melt.tStart).toBe(melt.tEnd)
    expect(vap.tStart).toBe(vap.tEnd)
  })

  it('vaporization q is greater than melting q (dHvap > dHfus)', () => {
    const melt = segs.find(s => s.phase === 'melting')!
    const vap  = segs.find(s => s.phase === 'vaporization')!
    expect(vap.q).toBeGreaterThan(melt.q)
  })

  it('solid segment starts at t0, gas segment ends at t1', () => {
    expect(segs[0].tStart).toBe(-20)
    expect(segs[4].tEnd).toBe(120)
  })

  it('scales linearly with mass — doubling mass doubles all q values', () => {
    const s1 = computeSegments(water, 100, -20, 120)
    const s2 = computeSegments(water, 200, -20, 120)
    for (let i = 0; i < 5; i++) {
      expect(s2[i].q).toBeCloseTo(s1[i].q * 2, 6)
    }
  })
})

// ── genHCProblem ──────────────────────────────────────────────────────────────

describe('genHCProblem', () => {
  it('returns a problem with 5 segments, pts, and positive maxQ', () => {
    const p = genHCProblem()
    expect(p.segments).toHaveLength(5)
    expect(p.pts).toHaveLength(6)       // 5 segments → 6 boundary points
    expect(p.maxQ).toBeGreaterThan(0)
  })

  it('pts are monotonically increasing in x', () => {
    const p = genHCProblem()
    for (let i = 1; i < p.pts.length; i++) {
      expect(p.pts[i].x).toBeGreaterThan(p.pts[i - 1].x)
    }
  })

  it('pts[last].x === maxQ', () => {
    const p = genHCProblem()
    expect(p.pts[p.pts.length - 1].x).toBeCloseTo(p.maxQ, 6)
  })

  it('validIdxs are valid segment indices', () => {
    const p = genHCProblem()
    for (const idx of p.validIdxs) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(p.segments.length)
    }
  })

  it('validIdxs has 1 entry for phase questions and 2 for no_temp_change', () => {
    // Run enough times to hit both
    const counts = new Set<number>()
    for (let i = 0; i < 200; i++) counts.add(genHCProblem().validIdxs.length)
    expect(counts.has(1)).toBe(true)
    expect(counts.has(2)).toBe(true)
  })

  it('no_temp_change problems have exactly melting + vaporization in validIdxs', () => {
    for (let i = 0; i < 200; i++) {
      const p = genHCProblem()
      if (p.kind !== 'no_temp_change') continue
      expect(p.validIdxs).toHaveLength(2)
      const phases = p.validIdxs.map(idx => p.segments[idx].phase)
      expect(phases).toContain('melting')
      expect(phases).toContain('vaporization')
    }
  })

  it('single-phase questions: validIdx matches the expected phase', () => {
    const phaseKinds: Phase[] = ['solid', 'melting', 'liquid', 'vaporization', 'gas']
    for (let i = 0; i < 300; i++) {
      const p = genHCProblem()
      if (!phaseKinds.includes(p.kind as Phase)) continue
      expect(p.validIdxs).toHaveLength(1)
      expect(p.segments[p.validIdxs[0]].phase).toBe(p.kind)
    }
  })

  it('question text contains "Indicate"', () => {
    for (let i = 0; i < 30; i++) {
      expect(genHCProblem().question).toContain('Indicate')
    }
  })

  it('explanation is non-empty', () => {
    for (let i = 0; i < 30; i++) {
      expect(genHCProblem().explanation.length).toBeGreaterThan(20)
    }
  })

  it('phase-specific explanations mention the substance name', () => {
    for (let i = 0; i < 200; i++) {
      const p = genHCProblem()
      if (p.kind === 'no_temp_change') continue   // shared explanation, no sub name
      expect(p.explanation).toContain(p.sub.name)
    }
  })

  it('produces all 6 question kinds across 500 draws', () => {
    const seen = new Set<QKind>()
    for (let i = 0; i < 500; i++) seen.add(genHCProblem().kind)
    for (const k of HC_QUESTION_KINDS) expect(seen.has(k)).toBe(true)
  })

  it('mass is always between 50 and 200 g (in steps of 10)', () => {
    for (let i = 0; i < 50; i++) {
      const p = genHCProblem()
      expect(p.mass).toBeGreaterThanOrEqual(50)
      expect(p.mass).toBeLessThanOrEqual(200)
      expect(p.mass % 10).toBe(0)
    }
  })
})

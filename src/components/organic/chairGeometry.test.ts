import { describe, it, expect } from 'vitest'
import { CARBONS, axialDir, equatorialDir, RING_CX, RING_CY } from './chairGeometry'

// Helper: 2D cross product of vectors AB and CD (= 0 means parallel)
function cross2D(ax: number, ay: number, bx: number, by: number) {
  return ax * by - ay * bx
}

describe('chair geometry — verified textbook shape', () => {
  // ── Structural shape ──────────────────────────────────────────────────────

  it('has 6 carbons with finite x/y coordinates', () => {
    expect(CARBONS).toHaveLength(6)
    for (const c of CARBONS) {
      expect(Number.isFinite(c.x)).toBe(true)
      expect(Number.isFinite(c.y)).toBe(true)
    }
  })

  it('C1 and C3 are at the same y (top corners equal height)', () => {
    expect(CARBONS[0].y).toBe(CARBONS[2].y)
  })

  it('C4 and C6 are at the same y (bottom tips equal height)', () => {
    expect(CARBONS[3].y).toBe(CARBONS[5].y)
  })

  it('C2 is the top valley — lower than both top corners C1 and C3', () => {
    expect(CARBONS[1].y).toBeGreaterThan(CARBONS[0].y)
    expect(CARBONS[1].y).toBeGreaterThan(CARBONS[2].y)
  })

  it('C5 is the bottom peak — higher than both bottom tips C4 and C6', () => {
    expect(CARBONS[4].y).toBeLessThan(CARBONS[3].y)
    expect(CARBONS[4].y).toBeLessThan(CARBONS[5].y)
  })

  it('three pairs of parallel bonds (cross product = 0)', () => {
    const v = (a: number, b: number) => ({ dx: CARBONS[b].x - CARBONS[a].x, dy: CARBONS[b].y - CARBONS[a].y })
    const c12 = v(0, 1), c45 = v(3, 4)
    const c23 = v(1, 2), c56 = v(4, 5)
    const c34 = v(2, 3), c61 = v(5, 0)
    expect(cross2D(c12.dx, c12.dy, c45.dx, c45.dy)).toBe(0) // C1-C2 ∥ C4-C5
    expect(cross2D(c23.dx, c23.dy, c56.dx, c56.dy)).toBe(0) // C2-C3 ∥ C5-C6
    expect(cross2D(c34.dx, c34.dy, c61.dx, c61.dy)).toBe(0) // C3-C4 ∥ C6-C1
  })

  // ── Axial directions ──────────────────────────────────────────────────────

  it('even-index carbons C1,C3,C5 (indices 0,2,4) have axial UP when unflipped', () => {
    for (const i of [0, 2, 4]) {
      expect(axialDir(i, false).dy).toBeLessThan(0)
    }
  })

  it('odd-index carbons C2,C4,C6 (indices 1,3,5) have axial DOWN when unflipped', () => {
    for (const i of [1, 3, 5]) {
      expect(axialDir(i, false).dy).toBeGreaterThan(0)
    }
  })

  it('ring flip toggles axial direction (up ↔ down) at every carbon', () => {
    for (let i = 0; i < 6; i++) {
      const normal  = axialDir(i, false)
      const flipped = axialDir(i, true)
      expect(Math.sign(normal.dy)).not.toBe(Math.sign(flipped.dy))
    }
  })

  it('axial direction is always purely vertical (dx = 0)', () => {
    for (let i = 0; i < 6; i++) {
      expect(axialDir(i, false).dx).toBe(0)
      expect(axialDir(i, true).dx).toBe(0)
    }
  })

  // ── Equatorial directions ─────────────────────────────────────────────────

  it('equatorial direction points outward from ring center at all carbons', () => {
    for (let i = 0; i < 6; i++) {
      const eq = equatorialDir(i, false)
      const c  = CARBONS[i]
      const dot = eq.dx * (c.x - RING_CX) + eq.dy * (c.y - RING_CY)
      expect(dot).toBeGreaterThan(0)
    }
  })

  it('equatorial directions are unit vectors', () => {
    for (let i = 0; i < 6; i++) {
      const eq  = equatorialDir(i, false)
      const len = Math.hypot(eq.dx, eq.dy)
      expect(len).toBeCloseTo(1, 3)
    }
  })

  it('equatorial directions have a significant horizontal component at all carbons', () => {
    for (let i = 0; i < 6; i++) {
      const eq = equatorialDir(i, false)
      expect(Math.abs(eq.dx)).toBeGreaterThan(0.1)
    }
  })

  it('equatorial and axial directions are never parallel (distinct bond directions)', () => {
    for (let i = 0; i < 6; i++) {
      const ax = axialDir(i, false)     // always (0, ±1)
      const eq = equatorialDir(i, false)
      // If parallel, |cross| = 0 and dot = ±1. Cross = ax.dx*eq.dy - ax.dy*eq.dx = ±eq.dx
      // Since eq.dx ≠ 0 (guaranteed by previous test), they are never parallel.
      const crossProduct = ax.dx * eq.dy - ax.dy * eq.dx
      expect(Math.abs(crossProduct)).toBeGreaterThan(0)
    }
  })
})

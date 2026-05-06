import { describe, it, expect } from 'vitest'
import { CARBONS, axialDir, equatorialDir, RING_CX, RING_CY } from './chairGeometry'

describe('chair geometry — bowtie/X-crossing pattern', () => {
  // ── Structural shape ──────────────────────────────────────────────────────

  it('has 6 carbons with finite x/y coordinates', () => {
    expect(CARBONS).toHaveLength(6)
    for (const c of CARBONS) {
      expect(Number.isFinite(c.x)).toBe(true)
      expect(Number.isFinite(c.y)).toBe(true)
    }
  })

  it('C1 and C4 are at the same y-coordinate (tips at midline)', () => {
    expect(CARBONS[0].y).toBe(CARBONS[3].y)
  })

  it('C1 and C4 are at the ring midline y', () => {
    expect(CARBONS[0].y).toBe(RING_CY)
    expect(CARBONS[3].y).toBe(RING_CY)
  })

  it('C2 and C5 are at the same y (upper peaks)', () => {
    expect(CARBONS[1].y).toBe(CARBONS[4].y)
  })

  it('C3 and C6 are at the same y (lower peaks)', () => {
    expect(CARBONS[2].y).toBe(CARBONS[5].y)
  })

  it('C2 and C5 are above the midline (upper peaks)', () => {
    expect(CARBONS[1].y).toBeLessThan(RING_CY)
    expect(CARBONS[4].y).toBeLessThan(RING_CY)
  })

  it('C3 and C6 are below the midline (lower peaks)', () => {
    expect(CARBONS[2].y).toBeGreaterThan(RING_CY)
    expect(CARBONS[5].y).toBeGreaterThan(RING_CY)
  })

  it('C2 is to the left of C5 (creates the X-crossing with C5-C6)', () => {
    expect(CARBONS[1].x).toBeLessThan(CARBONS[4].x)
  })

  it('C3 is to the right of C6 (creates the X-crossing with C2-C3)', () => {
    expect(CARBONS[2].x).toBeGreaterThan(CARBONS[5].x)
  })

  it('C2-C3 crossing diagonal is longer than C1-C2 tip bond', () => {
    const diag = Math.hypot(CARBONS[2].x - CARBONS[1].x, CARBONS[2].y - CARBONS[1].y)
    const tip  = Math.hypot(CARBONS[1].x - CARBONS[0].x, CARBONS[1].y - CARBONS[0].y)
    expect(diag).toBeGreaterThan(tip)
  })

  // ── Axial directions ──────────────────────────────────────────────────────

  it('axial direction at C1, C2, C5 (indices 0,1,4) points up (dy < 0) when unflipped', () => {
    for (const i of [0, 1, 4]) {
      expect(axialDir(i, false).dy).toBeLessThan(0)
    }
  })

  it('axial direction at C3, C4, C6 (indices 2,3,5) points down (dy > 0) when unflipped', () => {
    for (const i of [2, 3, 5]) {
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

  it('equatorial directions at non-tip carbons (1,2,4,5) have a significant horizontal component', () => {
    for (const i of [1, 2, 4, 5]) {
      const eq = equatorialDir(i, false)
      expect(Math.abs(eq.dx)).toBeGreaterThan(0.1)
    }
  })

  it('equatorial direction at C1 (left tip) points to the left', () => {
    expect(equatorialDir(0, false).dx).toBeLessThan(0)
    expect(equatorialDir(0, true).dx).toBeLessThan(0)
  })

  it('equatorial direction at C4 (right tip) points to the right', () => {
    expect(equatorialDir(3, false).dx).toBeGreaterThan(0)
    expect(equatorialDir(3, true).dx).toBeGreaterThan(0)
  })
})

// Shared chair conformation geometry — verified correct textbook chair shape.
// Top zigzag: C3 (high) — C2 (valley, dips down) — C1 (high).
// Bottom zigzag: C4 (low tip) — C5 (peak, rises up) — C6 (low tip).
// Three pairs of parallel bonds: C1-C2∥C4-C5, C2-C3∥C5-C6, C3-C4∥C6-C1.

export const SVG_W = 320
export const SVG_H = 260

export const CARBONS = [
  { x: 260, y:  95 }, // C1 — top-right corner (raised)
  { x: 180, y: 120 }, // C2 — top-middle valley (dips down between C1 and C3)
  { x: 100, y:  95 }, // C3 — top-left corner (raised)
  { x:  60, y: 180 }, // C4 — bottom-left tip, extreme leftmost (lowered)
  { x: 140, y: 155 }, // C5 — bottom-middle peak (rises up between C4 and C6)
  { x: 220, y: 180 }, // C6 — bottom-right tip, extreme rightmost (lowered)
]

export const RING_CX = 160
export const RING_CY = 138

// Back bonds (top edge + right leg) drawn slightly fainter for depth cue.
// Front bonds: C3-C4, C4-C5, C5-C6 (the bottom edge) at full opacity.
export const BACK_BOND_INDICES = new Set([0, 1, 5]) // C1-C2, C2-C3, C6-C1

export const BOND_LEN = 28
export const AX_LEN   = 30

/**
 * Axial direction at carbon i.
 * Even-index carbons C1 (0), C3 (2), C5 (4): axial UP.
 * Odd-index carbons C2 (1), C4 (3), C6 (5): axial DOWN.
 * Ring flip inverts all directions.
 */
export function axialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  const up = (i % 2 === 0) !== flipped
  return { dx: 0, dy: up ? -1 : 1 }
}

/**
 * Equatorial direction at carbon i: parallel to chord C[i-1]→C[i+1], directed outward
 * from ring center. The chord rule gives correct tetrahedral geometry for all carbons
 * in this chair shape.
 */
export function equatorialDir(i: number, _flipped: boolean): { dx: number; dy: number } {
  const a = CARBONS[(i + 5) % 6]
  const b = CARBONS[(i + 1) % 6]
  let dx = b.x - a.x
  let dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  dx /= len
  dy /= len
  const c = CARBONS[i]
  if (dx * (c.x - RING_CX) + dy * (c.y - RING_CY) < 0) { dx = -dx; dy = -dy }
  return { dx, dy }
}

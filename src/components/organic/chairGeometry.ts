// Shared chair conformation geometry — verified correct textbook chair shape.
// Top zigzag: C3 (high) — C2 (valley, dips down) — C1 (high).
// Bottom zigzag: C4 (low tip) — C5 (peak, rises up) — C6 (low tip).
// Three pairs of parallel bonds: C1-C2∥C4-C5, C2-C3∥C5-C6, C3-C4∥C6-C1.

export const SVG_W = 320
export const SVG_H = 260

export const CARBONS = [
  { x: 260, y:  95 }, // slot 0 — top-right corner (raised)
  { x: 180, y: 120 }, // slot 1 — top-middle valley (dips down between 0 and 2)
  { x: 100, y:  95 }, // slot 2 — top-left corner (raised)
  { x:  60, y: 180 }, // slot 3 — bottom-left tip, extreme leftmost (lowered)
  { x: 140, y: 155 }, // slot 4 — bottom-middle peak (rises up between 3 and 5)
  { x: 220, y: 180 }, // slot 5 — bottom-right tip, extreme rightmost (lowered)
]

// Vertical reflection of CARBONS through y = (95 + 180) / 2 = 137.5.
// y_new = 275 - y_old. Top corners become bottom tips, bottom peak becomes top valley.
export const CARBONS_FLIPPED = [
  { x: 260, y: 180 }, // slot 0 — bottom-right tip
  { x: 180, y: 155 }, // slot 1 — bottom-middle peak
  { x: 100, y: 180 }, // slot 2 — bottom-left tip
  { x:  60, y:  95 }, // slot 3 — top-left corner
  { x: 140, y: 120 }, // slot 4 — top-middle valley
  { x: 220, y:  95 }, // slot 5 — top-right corner
]

export const RING_CX = 160
export const RING_CY = 138

// Back bonds drawn fainter for depth cue (the bonds "behind" the viewer).
// Unflipped: top edge + right leg are back.
// Flipped: bottom edge + left leg are back (depth inverts with geometry).
export const BACK_BOND_INDICES         = new Set([0, 1, 5]) // C1-C2, C2-C3, C6-C1
export const BACK_BOND_INDICES_FLIPPED = new Set([2, 3, 4]) // C3-C4, C4-C5, C5-C6

export const BOND_LEN = 28
export const AX_LEN   = 30

/**
 * Axial direction at slot i.
 * Even slots (0, 2, 4): axial UP when unflipped, DOWN when flipped.
 * Odd slots (1, 3, 5): axial DOWN when unflipped, UP when flipped.
 */
export function axialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  const up = (i % 2 === 0) !== flipped
  return { dx: 0, dy: up ? -1 : 1 }
}

/**
 * Equatorial direction at slot i: parallel to chord prev→next in the active geometry,
 * directed outward from ring center. Uses CARBONS or CARBONS_FLIPPED based on flipped.
 */
export function equatorialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  const carbons = flipped ? CARBONS_FLIPPED : CARBONS
  const a = carbons[(i + 5) % 6]
  const b = carbons[(i + 1) % 6]
  let dx = b.x - a.x
  let dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  dx /= len
  dy /= len
  const c = carbons[i]
  if (dx * (c.x - RING_CX) + dy * (c.y - RING_CY) < 0) { dx = -dx; dy = -dy }
  return { dx, dy }
}

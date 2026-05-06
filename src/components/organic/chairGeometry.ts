// Shared chair conformation geometry — bowtie/X-crossing pattern (canonical textbook chair).
// Two long diagonals cross in the center: C2-C3 (upper-left → lower-right) and
// C5-C6 (upper-right → lower-left). Tips C1 and C4 sit at the horizontal midline.
// Outer silhouette is a bowtie: two upper peaks (C2, C5) and two lower peaks (C3, C6).

export const SVG_W = 320
export const SVG_H = 260

export const CARBONS = [
  { x:  40, y: 130 }, // C1 — left tip (midline)
  { x: 110, y:  90 }, // C2 — upper-left
  { x: 210, y: 170 }, // C3 — lower-right (diagonal from C2 → X-crossing bond)
  { x: 280, y: 130 }, // C4 — right tip (midline, same y as C1)
  { x: 210, y:  90 }, // C5 — upper-right
  { x: 110, y: 170 }, // C6 — lower-left (diagonal from C5 → X-crossing bond)
]

export const RING_CX = 160
export const RING_CY = 130

// Back bonds (tip + edge bonds) drawn slightly fainter for depth.
// Front bonds: indices 1 (C2-C3) and 4 (C5-C6) — the crossing diagonals — at full opacity.
export const BACK_BOND_INDICES = new Set([0, 2, 3, 5]) // C1-C2, C3-C4, C4-C5, C6-C1

export const BOND_LEN = 28
export const AX_LEN   = 30

/**
 * Axial direction at carbon i in the bowtie chair.
 * Above-midline (C2, C5) and left tip (C1): axial UP.
 * Below-midline (C3, C6) and right tip (C4): axial DOWN.
 * Ring flip inverts all axial directions.
 */
export function axialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  const c = CARBONS[i]
  const atMidline = Math.abs(c.y - RING_CY) < 5
  if (atMidline) {
    // C1 (i=0) axial up; C4 (i=3) axial down
    const up = (i === 0) !== flipped
    return { dx: 0, dy: up ? -1 : 1 }
  }
  const above = c.y < RING_CY
  const up = above !== flipped
  return { dx: 0, dy: up ? -1 : 1 }
}

/**
 * Equatorial direction at carbon i: parallel to chord C[i-1]→C[i+1], directed outward from center.
 * Tip carbons C1 (i=0) and C4 (i=3) use a fixed angled direction because their neighbors are
 * vertically symmetric, making the chord degenerate (same direction as axial).
 */
export function equatorialDir(i: number, flipped: boolean): { dx: number; dy: number } {
  if (i === 0) {
    // C1 left tip: lower-left when axial up (unflipped), upper-left when axial down (flipped)
    return { dx: -0.866, dy: flipped ? -0.5 : 0.5 }
  }
  if (i === 3) {
    // C4 right tip: upper-right when axial down (unflipped), lower-right when axial up (flipped)
    return { dx: 0.866, dy: flipped ? 0.5 : -0.5 }
  }
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

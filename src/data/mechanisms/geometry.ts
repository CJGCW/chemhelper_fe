// Pure geometric utilities for mechanism scene layout — no chemistry knowledge.

export interface Point { x: number; y: number }

// Polar placement: anchor + angle (0° = right/+x, 90° = down/+y per SVG) + distance
export function polar(anchor: Point, angleDeg: number, distance: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.round(anchor.x + Math.cos(rad) * distance),
    y: Math.round(anchor.y + Math.sin(rad) * distance),
  }
}

// Midpoint between two points
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// Perpendicular offset from the midpoint of from→to, side: +1 or -1
export function perpOffset(from: Point, to: Point, distance: number, side: 1 | -1): Point {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return midpoint(from, to)
  const nx = -dy / len, ny = dx / len
  const mid = midpoint(from, to)
  return { x: mid.x + nx * distance * side, y: mid.y + ny * distance * side }
}

// Curved-arrow control point — bowed above/below the from→to line
// side: -1 = above (default), +1 = below; bow: 0.4 = 40% of segment length
export function arcControl(from: Point, to: Point, side: 1 | -1 = -1, bow = 0.4): Point {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const mid = midpoint(from, to)
  if (len === 0) return mid
  const nx = -dy / len, ny = dx / len
  const offset = len * bow
  return { x: mid.x + nx * offset * side, y: mid.y + ny * offset * side }
}

// Shrink a from→to segment by offsetFrom px at the start and offsetTo px at the end
export function shortenSegment(
  from: Point, to: Point, offsetFrom: number, offsetTo: number,
): { from: Point; to: Point } {
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { from, to }
  const ux = dx / len, uy = dy / len
  return {
    from: { x: from.x + ux * offsetFrom, y: from.y + uy * offsetFrom },
    to:   { x: to.x   - ux * offsetTo,   y: to.y   - uy * offsetTo   },
  }
}

// Standard constants
export const BOND_LENGTH          = 100   // standard sp3/sp2 bond length in px
export const SHORT_BOND           = 70    // when scene is tight
export const SCENE_WIDTH          = 700
export const SCENE_HEIGHT_DEFAULT = 320
export const ATOM_RADIUS          = 14    // matches MechanismPlayer circle radius
export const ARROW_OFFSET         = 20    // offset from atom edge for arrow start/end

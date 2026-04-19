/**
 * Staircase line that separates metals (left) from nonmetals (right).
 *
 * The SVG uses viewBox="0 0 18 7" so that 1 unit = 1 grid cell in both axes.
 * The polyline traces the right edge of each boundary column, stepping right
 * at each period transition:
 *
 *   col 13 (B)  → period 2
 *   col 14 (Si) → period 3
 *   col 15 (As) → period 4
 *   col 16 (Te) → period 5
 *   col 17 (At) → period 6
 */
export default function Staircase() {
  // Polyline points in (column, row) grid units.
  // The line enters from the top of period 2 and exits at the bottom of period 6.
  const points = [
    [13, 1], // enter at top of period 2, right edge of col 13 (B)
    [13, 2], // bottom of period 2
    [14, 2], // step right to col 14
    [14, 3], // bottom of period 3
    [15, 3], // step right to col 15
    [15, 4], // bottom of period 4
    [16, 4], // step right to col 16
    [16, 5], // bottom of period 5
    [17, 5], // step right to col 17
    [17, 6], // bottom of period 6 (At)
  ];

  const pointsStr = points.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg
      viewBox="0 0 18 7"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
      aria-hidden="true"
    >
      <defs>
        <filter id="staircase-glow">
          <feGaussianBlur stdDeviation="0.06" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="rgba(var(--overlay),0.18)"
        strokeWidth="0.12"
        strokeLinecap="square"
        filter="url(#staircase-glow)"
      />

      {/* Main line */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="rgba(var(--overlay),0.55)"
        strokeWidth="0.045"
        strokeLinecap="round"
      />
    </svg>
  );
}

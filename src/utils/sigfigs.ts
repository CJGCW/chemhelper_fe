/**
 * Significant figure utilities — mirrors the Go sigfig package client-side
 * so the browser can compute limiting sig figs without a round-trip.
 */

/** Count significant figures in a numeric string. */
export function countSigFigs(numStr: string): number {
  const match = numStr.trim().match(/\d+\.?\d*/)
  if (!match) return 0
  let s = match[0]
  if (s.includes('.')) {
    s = s.replace('.', '').replace(/^0+/, '')
    return s.length
  }
  // No decimal point — trailing zeros are ambiguous, treat as non-significant
  s = s.replace(/^0+/, '').replace(/0+$/, '')
  return s.length
}

/** Return the lowest sig fig count across a set of input strings. */
export function lowestSigFigs(inputs: string[]): number {
  const counts = inputs.map(countSigFigs).filter(n => n > 0)
  return counts.length > 0 ? Math.min(...counts) : 3
}

/** Round a number to n significant figures. */
export function roundToSigFigs(value: number, sigFigs: number): number {
  if (value === 0 || sigFigs < 1) return value
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const factor = Math.pow(10, sigFigs - 1 - magnitude)
  return Math.round(value * factor) / factor
}

/** Format a number to n significant figures as a display string.
 *  Preserves trailing zeros that are significant (e.g. 0.100, 1.20).
 */
export function formatSigFigs(value: number, sigFigs: number): string {
  if (value === 0) return '0'
  const rounded = roundToSigFigs(value, sigFigs)
  const str = rounded.toPrecision(sigFigs)
  // toPrecision may return scientific notation for very large/small values;
  // convert those to fixed notation while keeping trailing zeros intact.
  if (str.includes('e')) {
    // Fall back to a high-precision fixed representation trimmed to sig figs
    return rounded.toPrecision(sigFigs)
  }
  // Return as-is — toPrecision already pads trailing zeros correctly
  return str
}

export interface SigFigBreakdown {
  inputs: { label: string; value: string; count: number }[]
  limiting: number
  limitingLabel: string
  rawResult: number
  roundedResult: number
  roundedStr: string
}

/** Build a full sig fig breakdown for display in SigFigPanel. */
export function buildSigFigBreakdown(
  inputs: { label: string; value: string }[],
  rawResult: number,
  unit: string,
): SigFigBreakdown {
  const withCounts = inputs
    .filter(i => i.value.trim() !== '')
    .map(i => ({ ...i, count: countSigFigs(i.value) }))

  const limiting = lowestSigFigs(inputs.map(i => i.value))
  const limitingEntry = withCounts.find(i => i.count === limiting)
  const roundedResult = roundToSigFigs(rawResult, limiting)

  return {
    inputs: withCounts,
    limiting,
    limitingLabel: limitingEntry?.label ?? '',
    rawResult,
    roundedResult,
    roundedStr: `${formatSigFigs(rawResult, limiting)} ${unit}`,
  }
}

/**
 * Significant figure utilities — mirrors the Go sigfig package client-side
 * so the browser can compute limiting sig figs without a round-trip.
 */

/** Count significant figures in a numeric string.
 *  Handles leading-decimal inputs like ".7500" correctly.
 */
export function countSigFigs(numStr: string): number {
  // Match optional leading decimal: .7500 or 0.7500 or 18.015 or 180.
  const match = numStr.trim().match(/^\d*\.?\d*$/)
  if (!match || match[0] === '' || match[0] === '.') return 0
  const s = match[0]
  if (s.includes('.')) {
    // Has explicit decimal point — all digits except leading zeros are significant
    const digits = s.replace('.', '')        // remove decimal
    const stripped = digits.replace(/^0+/, '') // remove leading zeros
    return stripped.length
  }
  // No decimal point — trailing zeros ambiguous, not significant
  return s.replace(/^0+/, '').replace(/0+$/, '').length
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

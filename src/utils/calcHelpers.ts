import type { UnitOption } from '../components/calculations/UnitSelect'

/** Strip non-numeric characters, allow one decimal point. Pass allowNegative=true for fields that accept negative values. */
export function sanitize(raw: string, allowNegative = false): string {
  let result = ''
  let hasDot = false
  let hasMinus = false
  for (const ch of raw) {
    if (allowNegative && ch === '-' && !hasMinus && result.length === 0) { hasMinus = true; result += ch }
    else if (ch === '.' && !hasDot) { hasDot = true; result += ch }
    else if (ch >= '0' && ch <= '9') { result += ch }
  }
  return result
}

/** True if string represents a valid positive number */
export function hasValue(v: string): boolean {
  const n = parseFloat(v.trim())
  return v.trim() !== '' && !isNaN(n) && n > 0
}

/** Delay before restarting a playing animation (ms) */
export const ANIMATION_RESTART_DELAY_MS = 80

/** Convert a value+unit to grams (or litres for volume units) */
export function toStandard(value: string, unit: UnitOption): number {
  return parseFloat(value) * unit.toGrams
}

/** Verify state type shared across all calc pages */
export type VerifyState = 'correct' | 'sig_fig_warning' | 'incorrect' | null

/**
 * Returns a human-readable conversion step string only when the unit
 * is not already the standard unit (grams for mass, litres for volume).
 * Returns null when no conversion is needed.
 */
export function conversionStep(
  value: string,
  unit: UnitOption,
  standardLabel: string,   // "g" or "L"
  standardValue: number,
): string | null {
  if (unit.label === standardLabel) return null
  return `Convert: ${value} ${unit.label} = ${standardValue} ${standardLabel}`
}

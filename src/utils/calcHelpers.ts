import type { UnitOption } from '../components/calculations/UnitSelect'

/** Strip non-numeric characters, allow one decimal point */
export function sanitize(raw: string): string {
  let result = ''
  let hasDot = false
  for (const ch of raw) {
    if (ch === '.' && !hasDot) { hasDot = true; result += ch }
    else if (ch >= '0' && ch <= '9') { result += ch }
  }
  return result
}

/** True if string represents a valid positive number */
export function hasValue(v: string): boolean {
  return v.trim() !== '' && !isNaN(parseFloat(v)) && parseFloat(v) > 0
}

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

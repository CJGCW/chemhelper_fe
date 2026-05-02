// Pure organic chemistry domain logic.
// No React, no utils imports, no components.

import { IUPAC_PREFIXES } from '../data/functionalGroups'

// ── Degree of Unsaturation ────────────────────────────────────────────────────

/**
 * Degree of Unsaturation (Index of Hydrogen Deficiency).
 * Formula: DoU = (2C + 2 + N - H - X) / 2
 * C = carbons, H = hydrogens, N = nitrogens (optional), X = halogens (optional).
 * Oxygen and sulfur do not affect DoU.
 */
export function degreeOfUnsaturation(
  C: number,
  H: number,
  N: number = 0,
  X: number = 0,
): { DoU: number; interpretation: string; steps: string[] } {
  const numerator = 2 * C + 2 + N - H - X
  const DoU = numerator / 2

  const steps: string[] = [
    `DoU = (2C + 2 + N − H − X) / 2`,
    `DoU = (2×${C} + 2 + ${N} − ${H} − ${X}) / 2`,
    `DoU = (${2 * C} + 2 + ${N} − ${H} − ${X}) / 2`,
    `DoU = ${numerator} / 2`,
    `DoU = ${DoU}`,
  ]

  let interpretation: string
  if (DoU === 0) {
    interpretation = 'DoU = 0: saturated compound (alkane or cycloalkane equivalent — no degrees of unsaturation)'
  } else if (DoU === 1) {
    interpretation = 'DoU = 1: one degree of unsaturation (one double bond OR one ring)'
  } else if (DoU === 2) {
    interpretation = 'DoU = 2: two degrees of unsaturation (e.g., one triple bond, two double bonds, or two rings)'
  } else if (DoU === 3) {
    interpretation = 'DoU = 3: three degrees of unsaturation'
  } else if (DoU === 4) {
    interpretation = 'DoU = 4: four degrees of unsaturation — consistent with a benzene ring (3 double bonds + 1 ring)'
  } else if (DoU > 4) {
    interpretation = `DoU = ${DoU}: highly unsaturated; likely contains aromatic rings or multiple multiple bonds`
  } else {
    interpretation = `DoU = ${DoU}`
  }

  return { DoU, interpretation, steps }
}

// ── Hydrocarbon Classification ────────────────────────────────────────────────

/**
 * Classify a hydrocarbon from its C and H counts.
 * CₙH₂ₙ₊₂ → alkane (DoU=0)
 * CₙH₂ₙ   → alkene or cycloalkane (DoU=1) — both give same formula
 * CₙH₂ₙ₋₂ → alkyne (DoU=2)
 * C₆H₆    → treated as aromatic (benzene formula, DoU=4)
 */
export function classifyHydrocarbon(
  C: number,
  H: number,
): { family: 'alkane' | 'alkene' | 'alkyne' | 'aromatic' | 'unknown'; DoU: number; reasoning: string } {
  const { DoU } = degreeOfUnsaturation(C, H)

  const alkaneH = 2 * C + 2
  const alkeneH = 2 * C
  const alkyneH = 2 * C - 2

  // Special case: benzene-formula check (DoU=4 for C₆H₆ family — C₆H₆, C₇H₈, etc.)
  if (DoU === 4) {
    return {
      family: 'aromatic',
      DoU,
      reasoning: `DoU = 4 and H = ${H} = 2×${C}−6, consistent with a benzene ring (3 double bonds + 1 ring).`,
    }
  }

  if (H === alkaneH) {
    return {
      family: 'alkane',
      DoU,
      reasoning: `H = ${H} = 2×${C}+2 matches the alkane formula CₙH₂ₙ₊₂. DoU = 0 (saturated).`,
    }
  }

  if (H === alkeneH) {
    return {
      family: 'alkene',
      DoU,
      reasoning: `H = ${H} = 2×${C} matches the alkene formula CₙH₂ₙ. DoU = 1 (one double bond or one ring).`,
    }
  }

  if (H === alkyneH && C >= 2) {
    return {
      family: 'alkyne',
      DoU,
      reasoning: `H = ${H} = 2×${C}−2 matches the alkyne formula CₙH₂ₙ₋₂. DoU = 2 (one triple bond or two double bonds/rings).`,
    }
  }

  return {
    family: 'unknown',
    DoU,
    reasoning: `H = ${H} does not match a simple straight-chain hydrocarbon formula for C = ${C}. DoU = ${DoU}.`,
  }
}

// ── Isomer Check ──────────────────────────────────────────────────────────────

/**
 * Parse a molecular formula string like "C4H10", "C₄H₁₀", "C6H6", "C₂H₂".
 * Returns { C, H } or null if unparseable.
 */
function parseFormula(formula: string): { C: number; H: number } | null {
  // Normalize subscript digits to ASCII
  const normalized = formula
    .replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2').replace(/₃/g, '3')
    .replace(/₄/g, '4').replace(/₅/g, '5').replace(/₆/g, '6').replace(/₇/g, '7')
    .replace(/₈/g, '8').replace(/₉/g, '9')

  const cMatch = normalized.match(/C(\d+)/)
  const hMatch = normalized.match(/H(\d+)/)

  if (!cMatch || !hMatch) {
    // Try C1 case (just "C" with no number)
    const cSingle = normalized.match(/^C(?!\d)/) || normalized.match(/(?:^|[^A-Z])C(?!\d)/)
    const hSingle = normalized.match(/H(?!\d)/)
    const C = cMatch ? parseInt(cMatch[1]) : (cSingle ? 1 : null)
    const H = hMatch ? parseInt(hMatch[1]) : (hSingle ? 1 : null)
    if (C === null || H === null) return null
    return { C, H }
  }

  return { C: parseInt(cMatch[1]), H: parseInt(hMatch[1]) }
}

/**
 * Determine if two molecular formulas are structural isomers (same C and H count).
 * Parses formula strings like "C4H10", "C₄H₁₀".
 */
export function areIsomers(formula1: string, formula2: string): boolean {
  const f1 = parseFormula(formula1)
  const f2 = parseFormula(formula2)
  if (!f1 || !f2) return false
  return f1.C === f2.C && f1.H === f2.H
}

// ── IUPAC Naming ──────────────────────────────────────────────────────────────

/**
 * Returns the IUPAC name for a straight-chain alkane with n carbons (1–10).
 * Returns empty string for out-of-range n.
 */
export function straightChainAlkaneName(n: number): string {
  const prefix = IUPAC_PREFIXES[n]
  if (!prefix) return ''
  // Special case: methane (1C) doesn't use '-ane' suffix in the usual sense, but it does
  return `${prefix}ane`
}

/**
 * Returns the IUPAC name for a straight-chain alkene with n carbons (n ≥ 2).
 * Assumes the double bond is at position 1 (1-alkene).
 */
export function straightChainAlkeneName(n: number): string {
  if (n < 2) return ''
  const prefix = IUPAC_PREFIXES[n]
  if (!prefix) return ''
  if (n === 2) return 'ethene'
  if (n === 3) return 'propene'
  return `1-${prefix}ene`
}

/**
 * Returns the IUPAC name for a straight-chain alkyne with n carbons (n ≥ 2).
 * Assumes the triple bond is at position 1.
 */
export function straightChainAlkyneName(n: number): string {
  if (n < 2) return ''
  const prefix = IUPAC_PREFIXES[n]
  if (!prefix) return ''
  if (n === 2) return 'ethyne'
  if (n === 3) return 'propyne'
  return `1-${prefix}yne`
}

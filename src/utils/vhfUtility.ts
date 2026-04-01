/**
 * Estimate the van't Hoff factor (i) from a molecular formula.
 * Returns a number and a confidence level.
 *
 * Strategy:
 *   1. Direct lookup table for common compounds.
 *   2. Heuristic for simple ionic formulas (one metal + one nonmetal).
 *   3. Default to 1 (non-electrolyte) if nothing matches.
 */

interface VhfResult {
  i: number
  confidence: 'exact' | 'default'
  note: string
}

// Common compounds with known dissociation
const LOOKUP: Record<string, { i: number; note: string }> = {
  // Monovalent salts (i = 2)
  'NaCl':   { i: 2, note: 'NaCl → Na⁺ + Cl⁻' },
  'KCl':    { i: 2, note: 'KCl → K⁺ + Cl⁻' },
  'KBr':    { i: 2, note: 'KBr → K⁺ + Br⁻' },
  'KI':     { i: 2, note: 'KI → K⁺ + I⁻' },
  'LiCl':   { i: 2, note: 'LiCl → Li⁺ + Cl⁻' },
  'NaBr':   { i: 2, note: 'NaBr → Na⁺ + Br⁻' },
  'NaI':    { i: 2, note: 'NaI → Na⁺ + I⁻' },
  'NaF':    { i: 2, note: 'NaF → Na⁺ + F⁻' },
  'KF':     { i: 2, note: 'KF → K⁺ + F⁻' },
  'AgNO3':  { i: 2, note: 'AgNO₃ → Ag⁺ + NO₃⁻' },
  'KNO3':   { i: 2, note: 'KNO₃ → K⁺ + NO₃⁻' },
  'NaNO3':  { i: 2, note: 'NaNO₃ → Na⁺ + NO₃⁻' },
  'NaOH':   { i: 2, note: 'NaOH → Na⁺ + OH⁻' },
  'KOH':    { i: 2, note: 'KOH → K⁺ + OH⁻' },
  'HCl':    { i: 2, note: 'HCl → H⁺ + Cl⁻ (strong acid)' },
  'HBr':    { i: 2, note: 'HBr → H⁺ + Br⁻ (strong acid)' },
  'HI':     { i: 2, note: 'HI → H⁺ + I⁻ (strong acid)' },
  'HNO3':   { i: 2, note: 'HNO₃ → H⁺ + NO₃⁻ (strong acid)' },

  // Divalent → i = 3
  'CaCl2':  { i: 3, note: 'CaCl₂ → Ca²⁺ + 2 Cl⁻' },
  'MgCl2':  { i: 3, note: 'MgCl₂ → Mg²⁺ + 2 Cl⁻' },
  'BaCl2':  { i: 3, note: 'BaCl₂ → Ba²⁺ + 2 Cl⁻' },
  'SrCl2':  { i: 3, note: 'SrCl₂ → Sr²⁺ + 2 Cl⁻' },
  'Na2SO4': { i: 3, note: 'Na₂SO₄ → 2 Na⁺ + SO₄²⁻' },
  'K2SO4':  { i: 3, note: 'K₂SO₄ → 2 K⁺ + SO₄²⁻' },
  'Na2CO3': { i: 3, note: 'Na₂CO₃ → 2 Na⁺ + CO₃²⁻' },
  'K2CO3':  { i: 3, note: 'K₂CO₃ → 2 K⁺ + CO₃²⁻' },
  'MgSO4':  { i: 2, note: 'MgSO₄ → Mg²⁺ + SO₄²⁻' },
  'CaSO4':  { i: 2, note: 'CaSO₄ → Ca²⁺ + SO₄²⁻ (sparingly soluble)' },
  'H2SO4':  { i: 3, note: 'H₂SO₄ → 2 H⁺ + SO₄²⁻ (strong acid)' },
  'CaCO3':  { i: 2, note: 'CaCO₃ → Ca²⁺ + CO₃²⁻' },

  // i = 4
  'AlCl3':  { i: 4, note: 'AlCl₃ → Al³⁺ + 3 Cl⁻' },
  'FeCl3':  { i: 4, note: 'FeCl₃ → Fe³⁺ + 3 Cl⁻' },
  'CrCl3':  { i: 4, note: 'CrCl₃ → Cr³⁺ + 3 Cl⁻' },
  'Al2(SO4)3': { i: 5, note: 'Al₂(SO₄)₃ → 2 Al³⁺ + 3 SO₄²⁻' },

  // Non-electrolytes (i = 1)
  'C6H12O6': { i: 1, note: 'Glucose — non-electrolyte' },
  'C12H22O11': { i: 1, note: 'Sucrose — non-electrolyte' },
  'CH4N2O':  { i: 1, note: 'Urea — non-electrolyte' },
  'C2H5OH':  { i: 1, note: 'Ethanol — non-electrolyte' },
  'CH3OH':   { i: 1, note: 'Methanol — non-electrolyte' },
  'C6H8O7':  { i: 1, note: 'Citric acid — weak acid, treat as non-electrolyte' },
}

export function estimateVhf(formula: string): VhfResult {
  // Exact lookup first
  const exact = LOOKUP[formula]
  if (exact) {
    return { i: exact.i, confidence: 'exact', note: exact.note }
  }

  // Default: assume non-electrolyte
  return {
    i: 1,
    confidence: 'default',
    note: 'Unknown compound — assuming non-electrolyte (i = 1). Override if needed.',
  }
}

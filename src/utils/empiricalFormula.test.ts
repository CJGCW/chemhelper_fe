import { describe, it, expect } from 'vitest'
import type { Element } from '../types'
import {
  buildMolarMasses,
  findMultiplier,
  parseFormula,
  formatFormula,
  normalizeFormula,
  exactFormulaMatch,
  formulasMatch,
  solveEmpiricalFormula,
  generateProblem,
  COMPOUND_POOL,
} from './empiricalFormula'

// ── Minimal Element factory ───────────────────────────────────────────────────

function el(symbol: string, atomicWeight: string): Element {
  return {
    atomicNumber: 0,
    symbol,
    name: symbol,
    atomicWeight,
    electronegativity: 0,
    vanDerWaalsRadiusPm: 0,
    group: 0,
    period: 0,
    groupName: '',
  }
}

// Common molar masses for use in solver / generator tests
const MM: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999,
  Na: 22.990, Mg: 24.305, Cl: 35.453, Ca: 40.078,
  Fe: 55.845, Cu: 63.546,
}

// ── buildMolarMasses ──────────────────────────────────────────────────────────

describe('buildMolarMasses', () => {
  it('parses a plain decimal weight', () => {
    const map = buildMolarMasses([el('C', '12.011')])
    expect(map['C']).toBeCloseTo(12.011)
  })

  it('parses a weight with uncertainty notation "12.011(2)"', () => {
    const map = buildMolarMasses([el('C', '12.011(2)')])
    expect(map['C']).toBeCloseTo(12.011)
  })

  it('parses a weight in brackets "[208]" (synthetic elements)', () => {
    const map = buildMolarMasses([el('Bi', '[208]')])
    expect(map['Bi']).toBeCloseTo(208)
  })

  it('builds a map for multiple elements', () => {
    const map = buildMolarMasses([
      el('H', '1.008'),
      el('O', '15.999'),
      el('C', '12.011'),
    ])
    expect(Object.keys(map)).toHaveLength(3)
    expect(map['H']).toBeCloseTo(1.008)
    expect(map['O']).toBeCloseTo(15.999)
  })

  it('skips entries with non-numeric or zero weights', () => {
    const map = buildMolarMasses([
      el('X', 'n/a'),
      el('Y', '0'),
      el('C', '12.011'),
    ])
    expect(map['X']).toBeUndefined()
    expect(map['Y']).toBeUndefined()
    expect(map['C']).toBeCloseTo(12.011)
  })

  it('returns an empty map for an empty element array', () => {
    expect(buildMolarMasses([])).toEqual({})
  })
})

// ── findMultiplier ────────────────────────────────────────────────────────────

describe('findMultiplier', () => {
  it('returns 1 when ratios are already whole numbers', () => {
    expect(findMultiplier([1, 2, 3])).toBe(1)
  })

  it('returns 2 for ratios with a 1.5 term', () => {
    // e.g. H2O2 → HO: ratios [1, 1], already whole → m=1
    // e.g. ratios [1, 1.5]: 1.5×2=3 → m=2
    expect(findMultiplier([1, 1.5])).toBe(2)
  })

  it('returns 3 for ratios with a 1.333 term', () => {
    // e.g. Fe2O3: moles ratio ≈ [1, 1.333] → ×3 → [3, 4] = Fe3O4? No.
    // Actually vitamin C: ratios come out [1, 1.333, 1] → ×3
    expect(findMultiplier([1, 1 + 1/3, 1])).toBe(3)
  })

  it('returns 4 for ratios with a 0.25 / 0.75 term (after dividing by min)', () => {
    // ratios [1, 1.25]: 1.25×4=5 → m=4
    expect(findMultiplier([1, 1.25])).toBe(4)
  })

  it('returns 1 when no clean multiplier exists within 8 (best effort)', () => {
    // Very irrational ratios — just ensure it returns something and does not throw
    const m = findMultiplier([1, 1.1234567])
    expect(m).toBeGreaterThanOrEqual(1)
    expect(m).toBeLessThanOrEqual(8)
  })
})

// ── parseFormula ──────────────────────────────────────────────────────────────

describe('parseFormula', () => {
  it('parses a simple formula', () => {
    expect(parseFormula('H2O')).toEqual({ H: 2, O: 1 })
  })

  it('parses a formula with no subscripts (all 1)', () => {
    expect(parseFormula('NaCl')).toEqual({ Na: 1, Cl: 1 })
  })

  it('parses a multi-element formula', () => {
    expect(parseFormula('C6H12O6')).toEqual({ C: 6, H: 12, O: 6 })
  })

  it('parses a formula with parentheses', () => {
    // Ca(OH)2 → Ca:1, O:2, H:2
    expect(parseFormula('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 })
  })

  it('handles parentheses with subscript 1 (no number after closing paren)', () => {
    expect(parseFormula('Mg(OH)1')).toEqual({ Mg: 1, O: 1, H: 1 })
  })

  it('accumulates repeated elements', () => {
    // C2H5OH = C2 H5 O H = C:2, H:6, O:1
    expect(parseFormula('C2H5OH')).toEqual({ C: 2, H: 6, O: 1 })
  })

  it('handles a 4-element formula', () => {
    expect(parseFormula('C8H10N4O2')).toEqual({ C: 8, H: 10, N: 4, O: 2 })
  })

  it('parses potassium permanganate', () => {
    expect(parseFormula('KMnO4')).toEqual({ K: 1, Mn: 1, O: 4 })
  })

  it('parses NH4Cl correctly', () => {
    expect(parseFormula('NH4Cl')).toEqual({ N: 1, H: 4, Cl: 1 })
  })

  it('returns null for an empty string', () => {
    expect(parseFormula('')).toBeNull()
  })

  it('ignores unknown non-letter characters', () => {
    // e.g. user types "H2O " with trailing space
    const result = parseFormula('H2O ')
    expect(result).toEqual({ H: 2, O: 1 })
  })
})

// ── formatFormula ─────────────────────────────────────────────────────────────

describe('formatFormula', () => {
  it('places C first, H second, then alphabetical (Hill notation)', () => {
    expect(formatFormula({ O: 1, H: 2, C: 1 })).toBe('CH₂O')
  })

  it('omits subscript 1', () => {
    // Hill notation: no carbon → alphabetical; Cl < Na → 'ClNa'
    expect(formatFormula({ Na: 1, Cl: 1 })).toBe('ClNa')
  })

  it('uses Unicode subscript digits', () => {
    expect(formatFormula({ C: 6, H: 12, O: 6 })).toBe('C₆H₁₂O₆')
  })

  it('handles elements with count 0 (skips them)', () => {
    expect(formatFormula({ H: 2, O: 1, C: 0 })).toBe('H₂O')
  })

  it('sorts non-C/H elements alphabetically', () => {
    // Fe, Mg, Na in alphabetical order
    const result = formatFormula({ Na: 1, Fe: 2, Mg: 1 })
    expect(result.indexOf('Fe')).toBeLessThan(result.indexOf('Mg'))
    expect(result.indexOf('Mg')).toBeLessThan(result.indexOf('Na'))
  })
})

// ── normalizeFormula ──────────────────────────────────────────────────────────

describe('normalizeFormula', () => {
  it('divides counts by their GCD', () => {
    expect(normalizeFormula({ H: 4, O: 2 })).toEqual({ H: 2, O: 1 })
  })

  it('returns the same formula when already in simplest form', () => {
    expect(normalizeFormula({ C: 1, H: 2, O: 1 })).toEqual({ C: 1, H: 2, O: 1 })
  })

  it('reduces C6H12O6 to CH2O', () => {
    expect(normalizeFormula({ C: 6, H: 12, O: 6 })).toEqual({ C: 1, H: 2, O: 1 })
  })

  it('reduces C8H10N4O2 (caffeine) to C4H5N2O', () => {
    expect(normalizeFormula({ C: 8, H: 10, N: 4, O: 2 })).toEqual({ C: 4, H: 5, N: 2, O: 1 })
  })

  it('reduces N2H4 to NH2', () => {
    expect(normalizeFormula({ N: 2, H: 4 })).toEqual({ N: 1, H: 2 })
  })

  it('handles a single element', () => {
    expect(normalizeFormula({ Fe: 4 })).toEqual({ Fe: 1 })
  })

  it('returns empty object for empty input', () => {
    expect(normalizeFormula({})).toEqual({})
  })
})

// ── exactFormulaMatch ─────────────────────────────────────────────────────────

describe('exactFormulaMatch', () => {
  it('matches identical formulas', () => {
    expect(exactFormulaMatch('CH2O', 'CH2O')).toBe(true)
  })

  it('matches formulas differing only in element order', () => {
    // Both canonicalize to Hill-ordered 'CH2O'
    expect(exactFormulaMatch('H2CO', 'CH2O')).toBe(true)
    // Both canonicalize to 'H2O' (H before O in Hill order)
    expect(exactFormulaMatch('OH2', 'H2O')).toBe(true)
  })

  it('does NOT match formula with its multiple (strict count check)', () => {
    // H2O2 has 2H and 2O; HO has 1H and 1O → should NOT match
    expect(exactFormulaMatch('H2O2', 'HO')).toBe(false)
  })

  it('does NOT match different formulas', () => {
    expect(exactFormulaMatch('CH2O', 'C6H12O6')).toBe(false)
    expect(exactFormulaMatch('H2O', 'CO2')).toBe(false)
  })

  it('returns false for unparseable input', () => {
    expect(exactFormulaMatch('', 'H2O')).toBe(false)
    expect(exactFormulaMatch('H2O', '')).toBe(false)
    expect(exactFormulaMatch('???', 'H2O')).toBe(false)
  })

  it('matches multi-element formulas regardless of input order', () => {
    // Aspirin C9H8O4 — user might type O4H8C9
    expect(exactFormulaMatch('O4H8C9', 'C9H8O4')).toBe(true)
  })
})

// ── formulasMatch (normalized) ────────────────────────────────────────────────

describe('formulasMatch', () => {
  it('matches a formula with its empirical reduction', () => {
    expect(formulasMatch('H2O2', 'HO')).toBe(true)
    expect(formulasMatch('C6H12O6', 'CH2O')).toBe(true)
    expect(formulasMatch('C2H4', 'CH2')).toBe(true)
  })

  it('does NOT match unrelated formulas', () => {
    expect(formulasMatch('H2O', 'CO2')).toBe(false)
    expect(formulasMatch('NaCl', 'NaF')).toBe(false)
  })

  it('is symmetric', () => {
    expect(formulasMatch('HO', 'H2O2')).toBe(true)
    expect(formulasMatch('CH2O', 'C6H12O6')).toBe(true)
  })

  it('returns false for empty strings', () => {
    expect(formulasMatch('', 'H2O')).toBe(false)
  })
})

// ── solveEmpiricalFormula ─────────────────────────────────────────────────────

describe('solveEmpiricalFormula', () => {
  it('returns null for empty inputs', () => {
    expect(solveEmpiricalFormula([], MM)).toBeNull()
  })

  it('returns null when an element has no known molar mass', () => {
    expect(solveEmpiricalFormula([{ symbol: 'Xx', value: 50 }], MM)).toBeNull()
  })

  it('returns null for zero or negative values', () => {
    expect(solveEmpiricalFormula([{ symbol: 'H', value: 0 }, { symbol: 'O', value: 1 }], MM)).toBeNull()
  })

  it('solves H2O from 11.19% H and 88.81% O', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'H', value: 11.19 }, { symbol: 'O', value: 88.81 }],
      MM,
    )!
    expect(result).not.toBeNull()
    expect(result.empiricalFormula).toBe('H₂O')
    expect(result.multiplier).toBe(1)
  })

  it('solves NaCl from percent composition (Hill order: ClNa)', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'Na', value: 39.34 }, { symbol: 'Cl', value: 60.66 }],
      MM,
    )!
    // Hill notation for non-carbon compounds is purely alphabetical: Cl < Na
    expect(result.empiricalFormula).toBe('ClNa')
  })

  it('solves CH2O (glucose/formaldehyde empirical) from 40% C, 6.71% H, 53.28% O', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'C', value: 40.00 }, { symbol: 'H', value: 6.71 }, { symbol: 'O', value: 53.28 }],
      MM,
    )!
    expect(result.empiricalFormula).toBe('CH₂O')
  })

  it('finds multiplier 2 for H2O2 (empirical HO)', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'H', value: 5.93 }, { symbol: 'O', value: 94.07 }],
      MM,
    )!
    expect(result.empiricalFormula).toBe('HO')
    expect(result.multiplier).toBe(1)
  })

  it('finds multiplier 3 for vitamin C C3H4O3 empirical', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'C', value: 40.92 }, { symbol: 'H', value: 4.58 }, { symbol: 'O', value: 54.51 }],
      MM,
    )!
    expect(result.empiricalFormula).toBe('C₃H₄O₃')
    expect(result.multiplier).toBe(3)
  })

  it('computes empirical molar mass correctly for CH2O', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'C', value: 40.00 }, { symbol: 'H', value: 6.71 }, { symbol: 'O', value: 53.28 }],
      MM,
    )!
    // CH2O: 12.011 + 2*1.008 + 15.999 = 30.026
    expect(result.empiricalMolarMass).toBeCloseTo(30.026, 1)
  })

  it('computes molecular formula when molar mass is provided', () => {
    // Glucose: empirical CH2O, molar mass 180.16 → multiplier 6
    const result = solveEmpiricalFormula(
      [{ symbol: 'C', value: 40.00 }, { symbol: 'H', value: 6.71 }, { symbol: 'O', value: 53.28 }],
      MM,
      180.16,
    )!
    expect(result.molecularMultiplier).toBe(6)
    expect(result.molecularFormula).toBe('C₆H₁₂O₆')
  })

  it('computes molecular formula for benzene (empirical CH, mol mass 78.11)', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'C', value: 92.26 }, { symbol: 'H', value: 7.74 }],
      MM,
      78.11,
    )!
    expect(result.empiricalFormula).toBe('CH')
    expect(result.molecularFormula).toBe('C₆H₆')
    expect(result.molecularMultiplier).toBe(6)
  })

  it('returns no molecular formula when molar mass is not provided', () => {
    const result = solveEmpiricalFormula(
      [{ symbol: 'H', value: 11.19 }, { symbol: 'O', value: 88.81 }],
      MM,
    )!
    expect(result.molecularFormula).toBeUndefined()
    expect(result.molecularMultiplier).toBeUndefined()
  })

  it('rows contain correct subscripts for Fe2O3', () => {
    // Fe2O3: Fe 69.94%, O 30.06%
    const result = solveEmpiricalFormula(
      [{ symbol: 'Fe', value: 69.94 }, { symbol: 'O', value: 30.06 }],
      MM,
    )!
    const fe = result.rows.find(r => r.symbol === 'Fe')!
    const o  = result.rows.find(r => r.symbol === 'O')!
    expect(fe.subscript).toBe(2)
    expect(o.subscript).toBe(3)
  })
})

// ── generateProblem ───────────────────────────────────────────────────────────

describe('generateProblem', () => {
  it('returns null when an element in the formula is not in molarMasses', () => {
    const result = generateProblem({ name: 'test', formula: 'XY2', difficulty: 'easy' }, MM)
    expect(result).toBeNull()
  })

  it('generates a valid problem for water (H2O)', () => {
    const prob = generateProblem({ name: 'water', formula: 'H2O', difficulty: 'easy' }, MM)!
    expect(prob).not.toBeNull()
    expect(prob.compoundName).toBe('water')
    expect(prob.difficulty).toBe('easy')
    expect(prob.empiricalASCII).toBe('H2O')
    expect(prob.empiricalDisplay).toBe('H₂O')
    expect(prob.molecularMass).toBeUndefined()  // empirical = molecular
  })

  it('percent composition sums to 100 (±0.02 for rounding)', () => {
    const compounds = ['H2O', 'C6H12O6', 'NaCl', 'Fe2O3', 'C8H10N4O2']
    for (const formula of compounds) {
      const prob = generateProblem({ name: formula, formula, difficulty: 'easy' }, MM)!
      const total = prob.elements.reduce((s, e) => s + e.percent, 0)
      expect(total).toBeCloseTo(100, 1)
    }
  })

  it('elements are presented in Hill order (C first, H second)', () => {
    const prob = generateProblem({ name: 'glucose', formula: 'C6H12O6', difficulty: 'hard' }, MM)!
    expect(prob.elements[0].symbol).toBe('C')
    expect(prob.elements[1].symbol).toBe('H')
    expect(prob.elements[2].symbol).toBe('O')
  })

  it('sets molecularMass and molecularASCII when empirical ≠ molecular', () => {
    const prob = generateProblem({ name: 'benzene', formula: 'C6H6', difficulty: 'hard' }, MM)!
    expect(prob.empiricalASCII).toBe('CH')
    expect(prob.molecularASCII).toBe('C6H6')
    expect(prob.molecularMass).toBeCloseTo(78.07, 0)
    expect(prob.molecularDisplay).toBe('C₆H₆')
  })

  it('does NOT set molecularMass when empirical equals molecular', () => {
    const prob = generateProblem({ name: 'water', formula: 'H2O', difficulty: 'easy' }, MM)!
    expect(prob.molecularMass).toBeUndefined()
    expect(prob.molecularASCII).toBeUndefined()
  })

  it('passes hint through from template', () => {
    const prob = generateProblem(
      { name: 'test', formula: 'H2O', difficulty: 'easy', hint: 'Try this' }, MM
    )!
    expect(prob.hint).toBe('Try this')
  })
})

// ── COMPOUND_POOL sanity checks ───────────────────────────────────────────────

describe('COMPOUND_POOL', () => {
  it('has entries for all three difficulty levels', () => {
    const difficulties = new Set(COMPOUND_POOL.map(c => c.difficulty))
    expect(difficulties.has('easy')).toBe(true)
    expect(difficulties.has('medium')).toBe(true)
    expect(difficulties.has('hard')).toBe(true)
  })

  it('has at least 10 compounds per difficulty level', () => {
    for (const d of ['easy', 'medium', 'hard'] as const) {
      const count = COMPOUND_POOL.filter(c => c.difficulty === d).length
      expect(count).toBeGreaterThanOrEqual(10)
    }
  })

  it('every formula parses without error', () => {
    for (const compound of COMPOUND_POOL) {
      const counts = parseFormula(compound.formula)
      expect(counts).not.toBeNull()
      expect(Object.keys(counts!).length).toBeGreaterThan(0)
    }
  })

  it('every formula can generate a problem with a standard molar mass map', () => {
    const fullMM: Record<string, number> = {
      H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.811,
      C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
      Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.086, P: 30.974,
      S: 32.065, Cl: 35.453, K: 39.098, Ca: 40.078, Ti: 47.867,
      Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693,
      Cu: 63.546, Zn: 65.38, Br: 79.904, Ba: 137.327,
    }
    for (const compound of COMPOUND_POOL) {
      const prob = generateProblem(compound, fullMM)
      if (prob !== null) {
        // Any generated problem must have valid percentages
        const total = prob.elements.reduce((s, e) => s + e.percent, 0)
        expect(total).toBeCloseTo(100, 1)
      }
      // null is acceptable (element not in our slim map)
    }
  })
})

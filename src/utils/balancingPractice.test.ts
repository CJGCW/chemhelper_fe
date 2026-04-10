import { describe, it, expect } from 'vitest'
import {
  EQUATIONS,
  parseAtoms,
  checkBalanced,
  pickEquation,
  formatEquation,
  balanceReaction,
  type BalancingEquation,
} from './balancingPractice'

// ── balanceReaction ───────────────────────────────────────────────────────────

describe('balanceReaction', () => {
  it('balances H₂ + O₂ → H₂O as [2, 1, 2]', () => {
    expect(balanceReaction(['H2', 'O2'], ['H2O'])).toEqual([2, 1, 2])
  })

  it('balances Fe + O₂ → Fe₂O₃ as [4, 3, 2]', () => {
    expect(balanceReaction(['Fe', 'O2'], ['Fe2O3'])).toEqual([4, 3, 2])
  })

  it('balances CH₄ + O₂ → CO₂ + H₂O as [1, 2, 1, 2]', () => {
    expect(balanceReaction(['CH4', 'O2'], ['CO2', 'H2O'])).toEqual([1, 2, 1, 2])
  })

  it('balances N₂ + H₂ → NH₃ as [1, 3, 2]', () => {
    expect(balanceReaction(['N2', 'H2'], ['NH3'])).toEqual([1, 3, 2])
  })

  it('balances C₃H₈ + O₂ → CO₂ + H₂O as [1, 5, 3, 4]', () => {
    expect(balanceReaction(['C3H8', 'O2'], ['CO2', 'H2O'])).toEqual([1, 5, 3, 4])
  })

  it('balances C₄H₁₀ + O₂ → CO₂ + H₂O as [2, 13, 8, 10]', () => {
    expect(balanceReaction(['C4H10', 'O2'], ['CO2', 'H2O'])).toEqual([2, 13, 8, 10])
  })

  it('balances C₆H₁₂O₆ + O₂ → CO₂ + H₂O as [1, 6, 6, 6]', () => {
    expect(balanceReaction(['C6H12O6', 'O2'], ['CO2', 'H2O'])).toEqual([1, 6, 6, 6])
  })

  it('balances 3-reactant case: NO₂ + H₂O + O₂ → HNO₃ as [4, 2, 1, 4]', () => {
    expect(balanceReaction(['NO2', 'H2O', 'O2'], ['HNO3'])).toEqual([4, 2, 1, 4])
  })

  it('balances simple decomposition: KClO₃ → KCl + O₂ as [2, 2, 3]', () => {
    expect(balanceReaction(['KClO3'], ['KCl', 'O2'])).toEqual([2, 2, 3])
  })

  it('balances Fe₂O₃ + CO → Fe + CO₂ as [1, 3, 2, 3]', () => {
    expect(balanceReaction(['Fe2O3', 'CO'], ['Fe', 'CO2'])).toEqual([1, 3, 2, 3])
  })

  it('returns null for an underdetermined system (two free variables)', () => {
    // H + O → H2O + O2: two unknowns with only one element equation each isn't uniquely solvable
    // Use a genuinely underdetermined case
    expect(balanceReaction(['H2', 'O2'], ['H2O', 'H2O2'])).toBeNull()
  })
})

// ── parseAtoms ────────────────────────────────────────────────────────────────

describe('parseAtoms', () => {
  it('parses single-element formula', () => {
    expect(parseAtoms('O2')).toEqual({ O: 2 })
  })

  it('parses two-letter element symbols', () => {
    expect(parseAtoms('Fe')).toEqual({ Fe: 1 })
    expect(parseAtoms('Mg')).toEqual({ Mg: 1 })
    expect(parseAtoms('Na')).toEqual({ Na: 1 })
  })

  it('parses multi-element formula', () => {
    expect(parseAtoms('Fe2O3')).toEqual({ Fe: 2, O: 3 })
    expect(parseAtoms('AlCl3')).toEqual({ Al: 1, Cl: 3 })
    expect(parseAtoms('H2SO4')).toEqual({ H: 2, S: 1, O: 4 })
  })

  it('counts elements without explicit subscript as 1', () => {
    expect(parseAtoms('NaCl')).toEqual({ Na: 1, Cl: 1 })
    expect(parseAtoms('NaOH')).toEqual({ Na: 1, O: 1, H: 1 })
    expect(parseAtoms('CO')).toEqual({ C: 1, O: 1 })
  })

  it('handles formulas with OH group (C2H5OH → C:2 H:6 O:1)', () => {
    expect(parseAtoms('C2H5OH')).toEqual({ C: 2, H: 6, O: 1 })
  })

  it('handles glucose C6H12O6', () => {
    expect(parseAtoms('C6H12O6')).toEqual({ C: 6, H: 12, O: 6 })
  })

  it('handles propane C3H8', () => {
    expect(parseAtoms('C3H8')).toEqual({ C: 3, H: 8 })
  })

  it('handles KClO3', () => {
    expect(parseAtoms('KClO3')).toEqual({ K: 1, Cl: 1, O: 3 })
  })
})

// ── checkBalanced ─────────────────────────────────────────────────────────────

function makeEq(
  reactants: { coeff: number; formula: string; display: string }[],
  products:  { coeff: number; formula: string; display: string }[],
): BalancingEquation {
  return { name: 'test', difficulty: 'easy', reactants, products }
}

describe('checkBalanced – synthesis of water (2H₂ + O₂ → 2H₂O)', () => {
  const eq = makeEq(
    [{ coeff: 2, formula: 'H2', display: 'H₂' }, { coeff: 1, formula: 'O2', display: 'O₂' }],
    [{ coeff: 2, formula: 'H2O', display: 'H₂O' }],
  )

  it('accepts the correct coefficients', () => {
    expect(checkBalanced(eq, [2, 1], [2]).balanced).toBe(true)
  })

  it('accepts a valid multiple (4, 2, 4)', () => {
    expect(checkBalanced(eq, [4, 2], [4]).balanced).toBe(true)
  })

  it('rejects wrong coefficients', () => {
    expect(checkBalanced(eq, [1, 1], [2]).balanced).toBe(false)
  })

  it('rejects all-zero coefficients', () => {
    expect(checkBalanced(eq, [0, 0], [0]).balanced).toBe(false)
  })

  it('returns correct element rows', () => {
    const { elements } = checkBalanced(eq, [2, 1], [2])
    const h = elements.find(e => e.element === 'H')!
    const o = elements.find(e => e.element === 'O')!
    expect(h.left).toBe(4)
    expect(h.right).toBe(4)
    expect(o.left).toBe(2)
    expect(o.right).toBe(2)
  })

  it('reports imbalance correctly', () => {
    const { elements } = checkBalanced(eq, [1, 1], [2])
    const h = elements.find(e => e.element === 'H')!
    expect(h.left).toBe(2)
    expect(h.right).toBe(4)
  })
})

describe('checkBalanced – iron rusting (4Fe + 3O₂ → 2Fe₂O₃)', () => {
  const eq = makeEq(
    [{ coeff: 4, formula: 'Fe', display: 'Fe' }, { coeff: 3, formula: 'O2', display: 'O₂' }],
    [{ coeff: 2, formula: 'Fe2O3', display: 'Fe₂O₃' }],
  )

  it('accepts (4, 3, 2)', () => {
    expect(checkBalanced(eq, [4, 3], [2]).balanced).toBe(true)
  })

  it('rejects (4, 3, 1) — classic student error', () => {
    expect(checkBalanced(eq, [4, 3], [1]).balanced).toBe(false)
  })

  it('rejects (1, 1, 1)', () => {
    expect(checkBalanced(eq, [1, 1], [1]).balanced).toBe(false)
  })
})

describe('checkBalanced – combustion of methane (CH₄ + 2O₂ → CO₂ + 2H₂O)', () => {
  const eq = makeEq(
    [{ coeff: 1, formula: 'CH4', display: 'CH₄' }, { coeff: 2, formula: 'O2', display: 'O₂' }],
    [{ coeff: 1, formula: 'CO2', display: 'CO₂' }, { coeff: 2, formula: 'H2O', display: 'H₂O' }],
  )

  it('accepts (1, 2, 1, 2)', () => {
    expect(checkBalanced(eq, [1, 2], [1, 2]).balanced).toBe(true)
  })

  it('rejects (1, 1, 1, 1)', () => {
    expect(checkBalanced(eq, [1, 1], [1, 1]).balanced).toBe(false)
  })
})

describe('checkBalanced – synthesis of ammonia (N₂ + 3H₂ → 2NH₃)', () => {
  const eq = makeEq(
    [{ coeff: 1, formula: 'N2', display: 'N₂' }, { coeff: 3, formula: 'H2', display: 'H₂' }],
    [{ coeff: 2, formula: 'NH3', display: 'NH₃' }],
  )

  it('accepts (1, 3, 2)', () => {
    expect(checkBalanced(eq, [1, 3], [2]).balanced).toBe(true)
  })
})

// ── EQUATIONS data integrity ──────────────────────────────────────────────────

describe('EQUATIONS', () => {
  it('has at least 15 equations', () => {
    expect(EQUATIONS.length).toBeGreaterThanOrEqual(15)
  })

  it('every equation has easy/medium/hard difficulty', () => {
    EQUATIONS.forEach(eq => {
      expect(['easy', 'medium', 'hard']).toContain(eq.difficulty)
    })
  })

  it('every equation has a non-empty name', () => {
    EQUATIONS.forEach(eq => {
      expect(eq.name.length).toBeGreaterThan(0)
    })
  })

  it('every equation has at least one reactant and one product', () => {
    EQUATIONS.forEach(eq => {
      expect(eq.reactants.length).toBeGreaterThanOrEqual(1)
      expect(eq.products.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('every canonical answer is itself balanced', () => {
    EQUATIONS.forEach(eq => {
      const rCoeffs = eq.reactants.map(s => s.coeff)
      const pCoeffs = eq.products.map(s => s.coeff)
      const { balanced } = checkBalanced(eq, rCoeffs, pCoeffs)
      expect(balanced, `${eq.name} should be balanced`).toBe(true)
    })
  })

  it('all difficulties are represented', () => {
    const diffs = new Set(EQUATIONS.map(e => e.difficulty))
    expect(diffs).toContain('easy')
    expect(diffs).toContain('medium')
    expect(diffs).toContain('hard')
  })
})

// ── pickEquation ──────────────────────────────────────────────────────────────

describe('pickEquation', () => {
  it('returns an equation without a difficulty argument', () => {
    const eq = pickEquation()
    expect(eq).toBeDefined()
    expect(eq.reactants.length).toBeGreaterThan(0)
  })

  it('returns only easy equations when requested', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickEquation('easy').difficulty).toBe('easy')
    }
  })

  it('returns only medium equations when requested', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickEquation('medium').difficulty).toBe('medium')
    }
  })

  it('returns only hard equations when requested', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickEquation('hard').difficulty).toBe('hard')
    }
  })
})

// ── formatEquation ────────────────────────────────────────────────────────────

describe('formatEquation', () => {
  it('formats a simple equation', () => {
    const eq: BalancingEquation = {
      name: 'test', difficulty: 'easy',
      reactants: [
        { coeff: 2, formula: 'H2', display: 'H₂' },
        { coeff: 1, formula: 'O2', display: 'O₂' },
      ],
      products: [
        { coeff: 2, formula: 'H2O', display: 'H₂O' },
      ],
    }
    expect(formatEquation(eq)).toBe('2 H₂ + O₂ → 2 H₂O')
  })

  it('omits coefficient 1', () => {
    const eq: BalancingEquation = {
      name: 'test', difficulty: 'easy',
      reactants: [{ coeff: 1, formula: 'CH4', display: 'CH₄' }],
      products:  [{ coeff: 1, formula: 'CO2', display: 'CO₂' }],
    }
    expect(formatEquation(eq)).toBe('CH₄ → CO₂')
  })
})

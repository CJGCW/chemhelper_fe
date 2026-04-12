import { describe, it, expect } from 'vitest'
import {
  genEnthalpyProblem,
  checkEnthalpyAnswer,
  computeDHrxn,
  type EnthalpyProblem,
} from './enthalpyPractice'

// ── computeDHrxn ──────────────────────────────────────────────────────────────

describe('computeDHrxn', () => {
  it('combustion of methane: CH4 + 2O2 → CO2 + 2H2O(l)', () => {
    const reactants = [{ coeff: 1, dhf: -74.8 }, { coeff: 2, dhf: 0 }]
    const products  = [{ coeff: 1, dhf: -393.5 }, { coeff: 2, dhf: -285.8 }]
    expect(computeDHrxn(reactants, products)).toBeCloseTo(-890.3, 0)
  })

  it('formation of ammonia: N2 + 3H2 → 2NH3', () => {
    const reactants = [{ coeff: 1, dhf: 0 }, { coeff: 3, dhf: 0 }]
    const products  = [{ coeff: 2, dhf: -46.1 }]
    expect(computeDHrxn(reactants, products)).toBeCloseTo(-92.2, 1)
  })

  it('formation of nitric oxide: N2 + O2 → 2NO (endothermic)', () => {
    const reactants = [{ coeff: 1, dhf: 0 }, { coeff: 1, dhf: 0 }]
    const products  = [{ coeff: 2, dhf: 90.3 }]
    expect(computeDHrxn(reactants, products)).toBeCloseTo(180.6, 1)
  })

  it('decomposition of CaCO3: CaCO3 → CaO + CO2 (endothermic)', () => {
    const reactants = [{ coeff: 1, dhf: -1207.6 }]
    const products  = [{ coeff: 1, dhf: -635.1 }, { coeff: 1, dhf: -393.5 }]
    expect(computeDHrxn(reactants, products)).toBeCloseTo(179.0, 0)
  })

  it('returns 0 when products and reactants have equal enthalpy sum', () => {
    const reactants = [{ coeff: 1, dhf: -100 }]
    const products  = [{ coeff: 1, dhf: -100 }]
    expect(computeDHrxn(reactants, products)).toBe(0)
  })

  it('handles fractional coefficients correctly', () => {
    // H2 + 1/2 O2 → H2O(l)  — use 0.5 coeff
    const reactants = [{ coeff: 1, dhf: 0 }, { coeff: 0.5, dhf: 0 }]
    const products  = [{ coeff: 1, dhf: -285.8 }]
    expect(computeDHrxn(reactants, products)).toBeCloseTo(-285.8, 1)
  })
})

// ── genEnthalpyProblem ────────────────────────────────────────────────────────

describe('genEnthalpyProblem', () => {
  it('returns a problem with all required fields', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEnthalpyProblem()
      expect(p.description.length).toBeGreaterThan(3)
      expect(p.equation).toContain('→')
      expect(p.reactants.length).toBeGreaterThanOrEqual(1)
      expect(p.products.length).toBeGreaterThanOrEqual(1)
      expect(typeof p.answer).toBe('number')
      expect(isNaN(p.answer)).toBe(false)
      expect(p.answerUnit).toBe('kJ')
      expect(Array.isArray(p.steps)).toBe(true)
      expect(p.steps.length).toBe(4)
    }
  })

  it('equation contains the formula of at least one reactant and one product', () => {
    for (let i = 0; i < 10; i++) {
      const p = genEnthalpyProblem()
      const [lhs] = p.equation.split('→')
      expect(lhs).toBeDefined()
      expect(p.reactants.some(r => lhs.includes(r.formula))).toBe(true)
    }
  })

  it('steps start with the Hess formula', () => {
    for (let i = 0; i < 10; i++) {
      const p = genEnthalpyProblem()
      expect(p.steps[0]).toContain('ΔHrxn')
      expect(p.steps[0]).toContain('products')
      expect(p.steps[0]).toContain('reactants')
    }
  })

  it('last step contains the numeric answer', () => {
    for (let i = 0; i < 10; i++) {
      const p = genEnthalpyProblem()
      expect(p.steps[p.steps.length - 1]).toContain('kJ')
      expect(p.steps[p.steps.length - 1]).toContain(String(p.answer))
    }
  })

  it('answer is consistent with computeDHrxn', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEnthalpyProblem()
      const recalc = computeDHrxn(p.reactants, p.products)
      expect(p.answer).toBeCloseTo(recalc, 0)
    }
  })

  it('all coefficients are positive integers', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEnthalpyProblem()
      ;[...p.reactants, ...p.products].forEach(s => {
        expect(s.coeff).toBeGreaterThan(0)
        expect(Number.isInteger(s.coeff)).toBe(true)
      })
    }
  })

  it('all species have a formula and state', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEnthalpyProblem()
      ;[...p.reactants, ...p.products].forEach(s => {
        expect(s.formula.length).toBeGreaterThan(0)
        expect(['g', 'l', 's', 'aq']).toContain(s.state)
      })
    }
  })
})

// ── checkEnthalpyAnswer ───────────────────────────────────────────────────────

describe('checkEnthalpyAnswer', () => {
  const makeProblem = (answer: number): EnthalpyProblem => ({
    description: 'test',
    equation: 'A → B',
    reactants: [{ coeff: 1, formula: 'A', state: 'g', dhf: 0 }],
    products:  [{ coeff: 1, formula: 'B', state: 'g', dhf: answer }],
    answer,
    answerUnit: 'kJ',
    steps: [],
  })

  it('accepts exact answer', () => {
    const p = makeProblem(-890.3)
    expect(checkEnthalpyAnswer(p, '-890.3')).toBe(true)
  })

  it('accepts answer within +2% tolerance', () => {
    const p = makeProblem(-890.3)
    expect(checkEnthalpyAnswer(p, String(-890.3 * 0.985))).toBe(true)
  })

  it('accepts answer within -2% tolerance', () => {
    const p = makeProblem(-890.3)
    expect(checkEnthalpyAnswer(p, String(-890.3 * 1.015))).toBe(true)
  })

  it('rejects answer more than 2% off', () => {
    const p = makeProblem(-890.3)
    expect(checkEnthalpyAnswer(p, String(-890.3 * 0.97))).toBe(false)
    expect(checkEnthalpyAnswer(p, String(-890.3 * 1.03))).toBe(false)
  })

  it('rejects non-numeric input', () => {
    const p = makeProblem(-890.3)
    expect(checkEnthalpyAnswer(p, '')).toBe(false)
    expect(checkEnthalpyAnswer(p, 'abc')).toBe(false)
    expect(checkEnthalpyAnswer(p, 'NaN')).toBe(false)
  })

  it('accepts 0 answer when problem answer is 0', () => {
    const p = makeProblem(0)
    expect(checkEnthalpyAnswer(p, '0')).toBe(true)
    expect(checkEnthalpyAnswer(p, '0.4')).toBe(true)   // within 0.5 threshold
    expect(checkEnthalpyAnswer(p, '1')).toBe(false)
  })

  it('generated problems pass their own checker', () => {
    for (let i = 0; i < 20; i++) {
      const p = genEnthalpyProblem()
      expect(checkEnthalpyAnswer(p, String(p.answer))).toBe(true)
    }
  })
})

// ── Manual spot-checks ────────────────────────────────────────────────────────

describe('manual spot-checks', () => {
  it('combustion of propane: C3H8 + 5O2 → 3CO2 + 4H2O  ≈ −2219.9 kJ', () => {
    const r = [{ coeff: 1, dhf: -103.8 }, { coeff: 5, dhf: 0 }]
    const p = [{ coeff: 3, dhf: -393.5 }, { coeff: 4, dhf: -285.8 }]
    expect(computeDHrxn(r, p)).toBeCloseTo(-2219.9, 0)
  })

  it('thermite: 2Al + Fe2O3 → Al2O3 + 2Fe  ≈ −851.5 kJ', () => {
    const r = [{ coeff: 2, dhf: 0 }, { coeff: 1, dhf: -824.2 }]
    const p = [{ coeff: 1, dhf: -1675.7 }, { coeff: 2, dhf: 0 }]
    expect(computeDHrxn(r, p)).toBeCloseTo(-851.5, 0)
  })

  it('water-gas shift: CO + H2O(g) → CO2 + H2  ≈ −41.2 kJ', () => {
    const r = [{ coeff: 1, dhf: -110.5 }, { coeff: 1, dhf: -241.8 }]
    const p = [{ coeff: 1, dhf: -393.5 }, { coeff: 1, dhf: 0 }]
    expect(computeDHrxn(r, p)).toBeCloseTo(-41.2, 0)
  })

  it('SO2 oxidation: 2SO2 + O2 → 2SO3  ≈ −197.8 kJ', () => {
    const r = [{ coeff: 2, dhf: -296.8 }, { coeff: 1, dhf: 0 }]
    const p = [{ coeff: 2, dhf: -395.7 }]
    expect(computeDHrxn(r, p)).toBeCloseTo(-197.8, 0)
  })
})

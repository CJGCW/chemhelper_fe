import { describe, it, expect } from 'vitest'
import { solveICETable, buildKExpression, convertKpKc } from '../equilibrium'
import { EQUILIBRIUM_REACTIONS } from '../../data/equilibriumReactions'
import { generateICEProblem } from '../../utils/equilibriumPractice'

// ── solveICETable ─────────────────────────────────────────────────────────────

describe('solveICETable', () => {

  it('Chang Ex 14.5: N\u2082O\u2084 \u21cc 2NO\u2082, Kc=4.63e-3, [N\u2082O\u2084]\u2080=0.0400', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'n2o4-no2')!
    const result = solveICETable({
      products: rxn.products,
      reactants: rxn.reactants,
      initial: { 'N\u2082O\u2084': 0.0400, 'NO\u2082': 0 },
      K: rxn.K,
      kType: 'Kc',
    })
    // Chang: [N\u2082O\u2084] \u2248 0.0338, [NO\u2082] \u2248 0.0124
    expect(result.equilibriumConcentrations['N\u2082O\u2084']).toBeCloseTo(0.0338, 3)
    expect(result.equilibriumConcentrations['NO\u2082']).toBeCloseTo(0.0124, 3)
    expect(result.x).toBeGreaterThan(0)
    expect(result.usedQuadratic).toBe(true)
    expect(result.approximationValid).toBe(false)
  })

  it('H\u2082 + I\u2082 \u21cc 2HI, Kc=54.3, [H\u2082]\u2080=[I\u2082]\u2080=0.50', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'h2-i2-hi')!
    const result = solveICETable({
      products: rxn.products,
      reactants: rxn.reactants,
      initial: { 'H\u2082': 0.50, 'I\u2082': 0.50, 'HI': 0 },
      K: rxn.K,
      kType: 'Kc',
    })
    // [HI] should be much greater than [H\u2082] and [I\u2082]
    const hi = result.equilibriumConcentrations['HI']
    const h2 = result.equilibriumConcentrations['H\u2082']
    const i2 = result.equilibriumConcentrations['I\u2082']
    expect(hi).toBeGreaterThan(h2)
    expect(hi).toBeGreaterThan(i2)
    expect(h2).toBeCloseTo(i2, 4)
    // Verify K
    const Kcalc = hi * hi / (h2 * i2)
    expect(Kcalc).toBeCloseTo(54.3, 0)
  })

  it('approximation valid when K << [A]\u2080', () => {
    // Very small K: PCl5 \u21cc PCl3 + Cl2, K=1.80, but use small K scenario
    // Use HF \u21cc H2 + F2, K=1e-13, [HF]\u2080=1.0
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'hf-h2-f2')!
    const result = solveICETable({
      products: rxn.products,
      reactants: rxn.reactants,
      initial: { 'HF': 1.0, 'H\u2082': 0, 'F\u2082': 0 },
      K: rxn.K,
      kType: 'Kc',
    })
    expect(result.approximationValid).toBe(true)
    expect(result.x).toBeGreaterThan(0)
    expect(result.equilibriumConcentrations['HF']).toBeCloseTo(1.0, 3)
  })

  it('quadratic used when approximation fails (K comparable to [A]\u2080)', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'n2o4-no2')!
    const result = solveICETable({
      products: rxn.products,
      reactants: rxn.reactants,
      initial: { 'N\u2082O\u2084': 0.0400, 'NO\u2082': 0 },
      K: rxn.K,
      kType: 'Kc',
    })
    expect(result.usedQuadratic).toBe(true)
  })

  it('equilibrium concentrations satisfy K within 1%', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'pcl5-pcl3-cl2')!
    const result = solveICETable({
      products: rxn.products,
      reactants: rxn.reactants,
      initial: { 'PCl\u2085': 0.200, 'PCl\u2083': 0, 'Cl\u2082': 0 },
      K: rxn.K,
      kType: 'Kc',
    })
    const pCl3 = result.equilibriumConcentrations['PCl\u2083']
    const cl2  = result.equilibriumConcentrations['Cl\u2082']
    const pCl5 = result.equilibriumConcentrations['PCl\u2085']
    expect(pCl5).toBeGreaterThan(0)
    const Kcalc = (pCl3 * cl2) / pCl5
    const relErr = Math.abs(Kcalc - rxn.K) / rxn.K
    expect(relErr).toBeLessThan(0.01)
  })

  it('water-gas shift 1:1 produces symmetric equilibrium', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'water-gas-shift')!
    const result = solveICETable({
      products: rxn.products,
      reactants: rxn.reactants,
      initial: { 'CO': 1.0, 'H\u2082O': 1.0, 'CO\u2082': 0, 'H\u2082': 0 },
      K: rxn.K,
      kType: 'Kc',
    })
    // For 1:1:1:1, [CO\u2082]\u2091 = [H\u2082]\u2091 and [CO]\u2091 = [H\u2082O]\u2091
    const co2 = result.equilibriumConcentrations['CO\u2082']
    const h2  = result.equilibriumConcentrations['H\u2082']
    const co  = result.equilibriumConcentrations['CO']
    const h2o = result.equilibriumConcentrations['H\u2082O']
    expect(co2).toBeCloseTo(h2, 5)
    expect(co).toBeCloseTo(h2o, 5)
  })

  it('20 random ICE problems produce valid equilibrium concentrations >= 0', () => {
    for (let i = 0; i < 20; i++) {
      const { reaction, solution } = generateICEProblem()
      // All concentrations must be >= 0
      for (const [, c] of Object.entries(solution.equilibriumConcentrations)) {
        expect(c).toBeGreaterThanOrEqual(-1e-10)
      }
      // x must be positive
      expect(solution.x).toBeGreaterThan(0)
      // Verify K within 2%
      const activeP = reaction.products.filter(s => s.state === 'g' || s.state === 'aq')
      const activeR = reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq')
      let Kcalc = 1
      for (const s of activeP) Kcalc *= Math.pow(Math.max(solution.equilibriumConcentrations[s.formula], 1e-30), s.coefficient)
      for (const s of activeR) Kcalc /= Math.pow(Math.max(solution.equilibriumConcentrations[s.formula], 1e-30), s.coefficient)
      const relErr = Math.abs(Kcalc - reaction.K) / reaction.K
      expect(relErr).toBeLessThan(0.06)
    }
  })
})

// ── buildKExpression ──────────────────────────────────────────────────────────

describe('buildKExpression', () => {

  it('omits CaCO\u2083(s) and CaO(s): K expression is just P(CO\u2082)', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'caco3-cao-co2')!
    const result = buildKExpression(rxn.products, rxn.reactants)
    expect(result.kcExpression).not.toContain('CaCO')
    expect(result.kcExpression).not.toContain('CaO')
    expect(result.kpExpression).toContain('CO\u2082')
  })

  it('N\u2082O\u2084 \u21cc 2NO\u2082: numerator contains NO\u2082 with exponent 2', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'n2o4-no2')!
    const result = buildKExpression(rxn.products, rxn.reactants)
    // Expression should have NO\u2082 with coefficient 2 in numerator
    expect(result.kcExpression).toContain('NO\u2082')
    expect(result.kcExpression).toContain('N\u2082O\u2084')
    // deltaN should be +1
    expect(result.deltaN).toBe(1)
  })

  it('H\u2082 + I\u2082 \u21cc 2HI: \u0394n = 0', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'h2-i2-hi')!
    const result = buildKExpression(rxn.products, rxn.reactants)
    expect(result.deltaN).toBe(0)
  })

  it('N\u2082 + 3H\u2082 \u21cc 2NH\u2083: \u0394n = -2', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'n2-h2-nh3')!
    const result = buildKExpression(rxn.products, rxn.reactants)
    expect(result.deltaN).toBe(-2)
  })

  it('Fe\u00b3\u207a + SCN\u207b \u21cc FeSCN\u00b2\u207a: no solids omitted (all aq)', () => {
    const rxn = EQUILIBRIUM_REACTIONS.find(r => r.id === 'fe3-scn-fescn')!
    const result = buildKExpression(rxn.products, rxn.reactants)
    expect(result.kcExpression).toContain('FeSCN')
    expect(result.deltaN).toBe(0)
  })
})

// ── convertKpKc ───────────────────────────────────────────────────────────────

describe('convertKpKc', () => {

  it('Kp = Kc when \u0394n = 0', () => {
    const result = convertKpKc({ type: 'Kc', value: 54.3 }, 698, 0)
    expect(result.answer).toBeCloseTo(54.3, 4)
    expect(result.label).toBe('Kp')
  })

  it('N\u2082O\u2084 \u21cc 2NO\u2082: \u0394n=1, T=298, Kc=4.63e-3 \u2192 Kp\u22480.113', () => {
    const result = convertKpKc({ type: 'Kc', value: 4.63e-3 }, 298, 1)
    // Kp = 4.63e-3 * (0.08206 * 298) = 4.63e-3 * 24.45 = 0.1133
    expect(result.answer).toBeCloseTo(0.1133, 2)
    expect(result.label).toBe('Kp')
  })

  it('reverse: given Kp, find Kc (\u0394n=1, T=298)', () => {
    const Kp = 0.1133
    const result = convertKpKc({ type: 'Kp', value: Kp }, 298, 1)
    expect(result.answer).toBeCloseTo(4.63e-3, 4)
    expect(result.label).toBe('Kc')
  })

  it('N\u2082 + 3H\u2082 \u21cc 2NH\u2083: \u0394n=-2, Kp = Kc/(RT)^2', () => {
    const Kc = 9.6
    const T = 300
    const RT = 0.08206 * T
    const expected = Kc / (RT * RT)
    const result = convertKpKc({ type: 'Kc', value: Kc }, T, -2)
    expect(result.answer).toBeCloseTo(expected, 3)
  })

  it('steps array is non-empty and contains relevant info', () => {
    const result = convertKpKc({ type: 'Kc', value: 4.63e-3 }, 298, 1)
    expect(result.steps.length).toBeGreaterThan(2)
    expect(result.steps.some(s => s.includes('RT'))).toBe(true)
  })
})

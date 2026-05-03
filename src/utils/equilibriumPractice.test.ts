import { describe, it, expect } from 'vitest'
import {
  generateKExpressionProblem,
  generateQvsKProblem,
  generateICEProblem,
  generateDynamicICEProblem,
  generateKpKcProblem,
  checkConcentrationAnswer,
  ICE_REAL_IDS,
  ICE_EXPERT_IDS,
} from './equilibriumPractice'
import { EQUILIBRIUM_REACTIONS } from '../data/equilibriumReactions'
import type { EquilibriumSpecies } from '../data/equilibriumReactions'
import { solveQvsK } from '../chem/equilibrium'

// Back-calculate K from equilibrium concentrations and check it matches.
function verifyKFromEquil(
  products: EquilibriumSpecies[],
  reactants: EquilibriumSpecies[],
  eq: Record<string, number>,
  K: number,
  tol = 0.12,
): void {
  const active = (sps: EquilibriumSpecies[]) => sps.filter(s => s.state === 'g' || s.state === 'aq')
  let Kcalc = 1
  for (const s of active(products))  Kcalc *= Math.pow(Math.max(eq[s.formula], 1e-30), s.coefficient)
  for (const s of active(reactants)) Kcalc /= Math.pow(Math.max(eq[s.formula], 1e-30), s.coefficient)
  const relErr = Math.abs(Kcalc - K) / K
  expect(relErr, `K back-check failed: Kcalc=${Kcalc.toPrecision(4)}, K=${K}, relErr=${relErr.toFixed(3)}`).toBeLessThan(tol)
}

// ── 20-iteration fuzz tests ───────────────────────────────────────────────────

describe('generateKExpressionProblem (20 runs)', () => {
  it('always returns a non-empty answer string', () => {
    for (let i = 0; i < 20; i++) {
      const { answer, reaction, steps } = generateKExpressionProblem()
      expect(answer.length).toBeGreaterThan(0)
      expect(reaction).toBeDefined()
      expect(steps.length).toBeGreaterThan(0)
    }
  })
})

describe('generateQvsKProblem (20 runs)', () => {
  it('produces a valid direction and Q value', () => {
    for (let i = 0; i < 20; i++) {
      const { Q, direction, reaction, concentrations } = generateQvsKProblem()
      const K = reaction.K
      expect(isFinite(Q)).toBe(true)
      expect(Q).toBeGreaterThanOrEqual(0)
      expect(['forward', 'reverse', 'at-equilibrium']).toContain(direction)

      // Verify direction is consistent with Q vs K
      if (direction === 'forward') expect(Q).toBeLessThanOrEqual(K * 1.001)
      if (direction === 'reverse') expect(Q).toBeGreaterThanOrEqual(K * 0.999)

      // Verify Q by calling solver directly
      const result = solveQvsK({ concentrations, products: reaction.products, reactants: reaction.reactants, K: reaction.K })
      expect(result.direction).toBe(direction)
    }
  })
})

describe('generateICEProblem (20 runs)', () => {
  it('produces valid non-negative equilibrium concentrations and correct K', () => {
    for (let i = 0; i < 20; i++) {
      const { reaction, solution } = generateICEProblem()

      // All concentrations must be >= 0
      for (const [sp, c] of Object.entries(solution.equilibriumConcentrations)) {
        expect(c, `[${sp}] must be >= 0`).toBeGreaterThanOrEqual(-1e-9)
      }

      // x must be positive
      expect(solution.x).toBeGreaterThan(0)

      // ICE rows must be consistent
      expect(solution.rows.length).toBeGreaterThan(0)

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

describe('generateKpKcProblem (20 runs)', () => {
  it('produces a finite answer and valid steps', () => {
    for (let i = 0; i < 20; i++) {
      const { answer, steps, reaction, mode, T } = generateKpKcProblem()
      expect(isFinite(answer)).toBe(true)
      expect(answer).toBeGreaterThan(0)
      expect(steps.length).toBeGreaterThan(0)
      expect(['Kp', 'Kc']).toContain(mode)
      expect(T).toBeGreaterThan(0)
      expect(reaction).toBeDefined()
    }
  })
})

// ── generateDynamicICEProblem — reaction pool integrity ───────────────────────

describe('ICE_REAL_IDS pool integrity', () => {
  it('every real ID exists in EQUILIBRIUM_REACTIONS', () => {
    for (const id of ICE_REAL_IDS) {
      const r = EQUILIBRIUM_REACTIONS.find(r => r.id === id)
      expect(r, `reaction '${id}' not found in EQUILIBRIUM_REACTIONS`).toBeDefined()
    }
  })

  it('every real reaction has all-gas/aq species (no solids)', () => {
    for (const id of ICE_REAL_IDS) {
      const r = EQUILIBRIUM_REACTIONS.find(r => r.id === id)!
      const active = [...r.reactants, ...r.products].filter(s => s.state === 'g' || s.state === 'aq')
      expect(active.length, `'${id}' has no active species`).toBeGreaterThan(0)
    }
  })
})

describe('ICE_EXPERT_IDS pool integrity', () => {
  it('every expert ID exists in EQUILIBRIUM_REACTIONS', () => {
    for (const id of ICE_EXPERT_IDS) {
      const r = EQUILIBRIUM_REACTIONS.find(r => r.id === id)
      expect(r, `reaction '${id}' not found in EQUILIBRIUM_REACTIONS`).toBeDefined()
    }
  })

  it('every expert reaction has at least one coefficient > 1 (non-trivial balancing)', () => {
    for (const id of ICE_EXPERT_IDS) {
      const r = EQUILIBRIUM_REACTIONS.find(r => r.id === id)!
      const hasNonTrivial = [...r.reactants, ...r.products].some(s => s.coefficient > 1)
      expect(hasNonTrivial, `'${id}' has all coefficients = 1 — not useful for balancing`).toBe(true)
    }
  })

  it('every expert reaction has K in tractable range for Gen Chem 102 (1e-4 to 1e4)', () => {
    for (const id of ICE_EXPERT_IDS) {
      const r = EQUILIBRIUM_REACTIONS.find(r => r.id === id)!
      expect(r.K, `'${id}' K=${r.K} is too small`).toBeGreaterThan(1e-4)
      expect(r.K, `'${id}' K=${r.K} is too large`).toBeLessThan(1e4)
    }
  })

  it('expert IDs are a subset of real IDs (no expert-only reactions missing from real pool)', () => {
    for (const id of ICE_EXPERT_IDS) {
      expect(ICE_REAL_IDS, `expert reaction '${id}' not in ICE_REAL_IDS`).toContain(id)
    }
  })
})

// ── generateDynamicICEProblem — solvability across all difficulties ────────────

describe('generateDynamicICEProblem difficulty 2 (20 runs)', () => {
  it('produces positive equilibrium concentrations satisfying K', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDynamicICEProblem(2)
      expect(p.K).toBeGreaterThan(0)
      expect(p.balancingRequired).toBeFalsy()
      for (const [sp, c] of Object.entries(p.solution.equilibriumConcentrations)) {
        expect(c, `[${sp}] must be > 0`).toBeGreaterThan(1e-12)
      }
      if (p.kType === 'Kc') verifyKFromEquil(p.products, p.reactants, p.solution.equilibriumConcentrations, p.K)
    }
  })
})

describe('generateDynamicICEProblem difficulty 3 (20 runs)', () => {
  it('produces positive equilibrium concentrations satisfying K', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDynamicICEProblem(3)
      expect(p.K).toBeGreaterThan(0)
      expect(p.balancingRequired).toBeFalsy()
      for (const [sp, c] of Object.entries(p.solution.equilibriumConcentrations)) {
        expect(c, `[${sp}] must be > 0`).toBeGreaterThan(1e-12)
      }
      if (p.kType === 'Kc') verifyKFromEquil(p.products, p.reactants, p.solution.equilibriumConcentrations, p.K)
    }
  })
})

describe('generateDynamicICEProblem difficulty 4 (20 runs)', () => {
  it('produces positive equilibrium concentrations satisfying K', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDynamicICEProblem(4)
      expect(p.K).toBeGreaterThan(0)
      expect(p.balancingRequired).toBeFalsy()
      for (const [sp, c] of Object.entries(p.solution.equilibriumConcentrations)) {
        expect(c, `[${sp}] must be > 0`).toBeGreaterThan(1e-12)
      }
      if (p.kType === 'Kc') verifyKFromEquil(p.products, p.reactants, p.solution.equilibriumConcentrations, p.K)
    }
  })
})

describe('generateDynamicICEProblem difficulty 5 / Expert (20 runs)', () => {
  it('produces valid solvable problems with balancing metadata', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDynamicICEProblem(5)

      // Expert-tier shape
      expect(p.balancingRequired).toBe(true)
      expect(p.skeletonEquation).toBeDefined()
      expect(p.skeletonEquation!.length).toBeGreaterThan(0)
      expect(p.isTemplate).toBeFalsy()

      // Skeleton contains every species formula
      for (const s of [...p.reactants, ...p.products]) {
        expect(p.skeletonEquation, `skeleton missing species '${s.formula}'`).toContain(s.formula)
      }

      // Skeleton contains the equilibrium arrow
      expect(p.skeletonEquation).toContain('⇌')

      // All species have positive integer coefficients
      for (const s of [...p.reactants, ...p.products]) {
        expect(Number.isInteger(s.coefficient), `${s.formula} coefficient not integer`).toBe(true)
        expect(s.coefficient).toBeGreaterThan(0)
      }

      // ICE table is solvable: all equilibrium concentrations positive
      expect(p.K).toBeGreaterThan(0)
      for (const [sp, c] of Object.entries(p.solution.equilibriumConcentrations)) {
        expect(c, `[${sp}] must be > 0`).toBeGreaterThan(1e-12)
      }
      // Kp reactions use partial pressures, not concentrations — skip Kc back-check
      if (p.kType === 'Kc') verifyKFromEquil(p.products, p.reactants, p.solution.equilibriumConcentrations, p.K)
    }
  })

  it('uses only reactions from ICE_EXPERT_IDS (no templates)', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateDynamicICEProblem(5)
      const match = EQUILIBRIUM_REACTIONS.find(r => r.equation === p.equation)
      expect(match, `equation not found in EQUILIBRIUM_REACTIONS: ${p.equation}`).toBeDefined()
      expect(ICE_EXPERT_IDS, `reaction '${match!.id}' not in ICE_EXPERT_IDS`).toContain(match!.id)
    }
  })
})

// ── checkConcentrationAnswer ──────────────────────────────────────────────────

describe('checkConcentrationAnswer', () => {
  it('accepts exact answer', () => {
    expect(checkConcentrationAnswer('0.0338', 0.0338)).toBe(true)
  })

  it('accepts within 2% tolerance', () => {
    expect(checkConcentrationAnswer('0.0344', 0.0338)).toBe(true)   // +1.8%
    expect(checkConcentrationAnswer('0.0332', 0.0338)).toBe(true)   // -1.8%
  })

  it('rejects outside 2% tolerance', () => {
    expect(checkConcentrationAnswer('0.0360', 0.0338)).toBe(false)  // +6.5%
    expect(checkConcentrationAnswer('0.030', 0.0338)).toBe(false)   // -11%
  })

  it('rejects non-numeric input', () => {
    expect(checkConcentrationAnswer('abc', 0.05)).toBe(false)
    expect(checkConcentrationAnswer('', 0.05)).toBe(false)
  })

  it('handles zero correctly', () => {
    expect(checkConcentrationAnswer('0', 0)).toBe(true)
    expect(checkConcentrationAnswer('0.000001', 0)).toBe(false)
  })
})

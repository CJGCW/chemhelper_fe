// Equilibrium practice problem generators.
// Pure TypeScript — no React, no component imports.

import { EQUILIBRIUM_REACTIONS, type EquilibriumReaction } from '../data/equilibriumReactions'
import {
  buildKExpression, solveQvsK, solveICETable, convertKpKc,
  type ICESolution,
} from '../chem/equilibrium'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number, dp: number): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(dp))
}

function fmt(n: number, sig = 3): string {
  if (!isFinite(n)) return 'undefined'
  const p = parseFloat(n.toPrecision(sig))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) {
    return p.toExponential(sig - 1)
  }
  return String(p)
}

// Active (non-solid/liquid) species
function active(reaction: EquilibriumReaction) {
  return {
    products:  reaction.products.filter(s => s.state === 'g' || s.state === 'aq'),
    reactants: reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq'),
  }
}

// Reactions suitable for ICE table (simple: one active reactant, products initially zero)
const ICE_SUITABLE_IDS = [
  'n2o4-no2',
  'h2-i2-hi',
  'pcl5-pcl3-cl2',
  'water-gas-shift',
]

// ── K Expression ──────────────────────────────────────────────────────────────

export function generateKExpressionProblem(): { reaction: EquilibriumReaction; answer: string; steps: string[] } {
  const reaction = pick(EQUILIBRIUM_REACTIONS)
  const { kcExpression, steps } = buildKExpression(reaction.products, reaction.reactants)
  return { reaction, answer: kcExpression, steps }
}

// ── Q vs K ────────────────────────────────────────────────────────────────────

export function generateQvsKProblem(): {
  reaction: EquilibriumReaction
  concentrations: Record<string, number>
  Q: number
  direction: string
  steps: string[]
} {
  // Pick a reaction with all gas/aq species for Q calculation
  const candidates = EQUILIBRIUM_REACTIONS.filter(r => {
    const { products, reactants } = active(r)
    return products.length > 0 && reactants.length > 0
  })
  const reaction = pick(candidates)
  const { products, reactants } = active(reaction)

  // Generate concentrations that put system out of equilibrium
  const concentrations: Record<string, number> = {}
  for (const s of [...reactants, ...products]) {
    concentrations[s.formula] = rand(0.01, 1.5, 2)
  }

  const result = solveQvsK({ concentrations, products: reaction.products, reactants: reaction.reactants, K: reaction.K })

  return {
    reaction,
    concentrations,
    Q: result.Q,
    direction: result.direction,
    steps: result.steps,
  }
}

// ── ICE Table ─────────────────────────────────────────────────────────────────

export function generateICEProblem(): {
  reaction: EquilibriumReaction
  initial: Record<string, number>
  solution: ICESolution
} {
  const id = pick(ICE_SUITABLE_IDS)
  const reaction = EQUILIBRIUM_REACTIONS.find(r => r.id === id) ?? EQUILIBRIUM_REACTIONS[0]
  const { reactants } = active(reaction)

  const initial: Record<string, number> = {}
  for (const s of reaction.products) initial[s.formula] = 0
  for (const s of reactants) {
    initial[s.formula] = rand(0.10, 1.00, 2)
  }

  const solution = solveICETable({
    products: reaction.products,
    reactants: reaction.reactants,
    initial,
    K: reaction.K,
    kType: reaction.kType,
  })

  return { reaction, initial, solution }
}

// ── Dynamic ICE Table ─────────────────────────────────────────────────────────

// Reaction templates: stoichiometry + equation string builder
const DYNAMIC_TEMPLATES = [
  {
    // A(g) ⇌ B(g)   Kc = [B]/[A]
    build(A: string, B: string, K: number) {
      return {
        equation: `${A}(g) ⇌ ${B}(g)`,
        products:  [{ formula: B, coefficient: 1, state: 'g' as const }],
        reactants: [{ formula: A, coefficient: 1, state: 'g' as const }],
        K,
        kType: 'Kc' as const,
      }
    },
    species: 2,
  },
  {
    // A(g) ⇌ 2 B(g)   Kc = [B]²/[A]
    build(A: string, B: string, K: number) {
      return {
        equation: `${A}(g) ⇌ 2 ${B}(g)`,
        products:  [{ formula: B, coefficient: 2, state: 'g' as const }],
        reactants: [{ formula: A, coefficient: 1, state: 'g' as const }],
        K,
        kType: 'Kc' as const,
      }
    },
    species: 2,
  },
  {
    // 2 A(g) ⇌ B(g)   Kc = [B]/[A]²
    build(A: string, B: string, K: number) {
      return {
        equation: `2 ${A}(g) ⇌ ${B}(g)`,
        products:  [{ formula: B, coefficient: 1, state: 'g' as const }],
        reactants: [{ formula: A, coefficient: 2, state: 'g' as const }],
        K,
        kType: 'Kc' as const,
      }
    },
    species: 2,
  },
  {
    // A(g) + B(g) ⇌ C(g)   Kc = [C]/([A][B])
    build(A: string, B: string, K: number, C?: string) {
      const c = C ?? 'C'
      return {
        equation: `${A}(g) + ${B}(g) ⇌ ${c}(g)`,
        products:  [{ formula: c, coefficient: 1, state: 'g' as const }],
        reactants: [
          { formula: A, coefficient: 1, state: 'g' as const },
          { formula: B, coefficient: 1, state: 'g' as const },
        ],
        K,
        kType: 'Kc' as const,
      }
    },
    species: 3,
  },
  {
    // A(g) + B(g) ⇌ 2 C(g)   Kc = [C]²/([A][B])
    build(A: string, B: string, K: number, C?: string) {
      const c = C ?? 'C'
      return {
        equation: `${A}(g) + ${B}(g) ⇌ 2 ${c}(g)`,
        products:  [{ formula: c, coefficient: 2, state: 'g' as const }],
        reactants: [
          { formula: A, coefficient: 1, state: 'g' as const },
          { formula: B, coefficient: 1, state: 'g' as const },
        ],
        K,
        kType: 'Kc' as const,
      }
    },
    species: 3,
  },
]

// Plausible-looking single-letter species labels
const SPECIES_POOL = ['A', 'B', 'C', 'D', 'X', 'Y', 'Z', 'W', 'P', 'Q']

// K magnitudes to cover a range: small (approx valid), medium, large
function randomK(): number {
  const magnitude = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4] as const)
  const mantissa = 1 + Math.random() * 8
  return parseFloat((mantissa * Math.pow(10, magnitude)).toPrecision(3))
}

export interface DynamicICEProblem {
  equation: string
  products:  { formula: string; coefficient: number; state: 'g' | 'aq' | 'l' | 's' }[]
  reactants: { formula: string; coefficient: number; state: 'g' | 'aq' | 'l' | 's' }[]
  K: number
  kType: 'Kc' | 'Kp'
  initial: Record<string, number>
  solution: ICESolution
  dynamic: true
}

export function generateDynamicICEProblem(): DynamicICEProblem {
  // Try up to 20 times to get a valid solution
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const template = pick(DYNAMIC_TEMPLATES)
      const shuffled = [...SPECIES_POOL].sort(() => Math.random() - 0.5)
      const [A, B, C] = shuffled

      const K = randomK()
      const rxn = template.build(A, B, K, C)

      // Initial: reactants get random concentrations, products start at 0
      const initial: Record<string, number> = {}
      for (const s of rxn.products)  initial[s.formula] = 0
      for (const s of rxn.reactants) initial[s.formula] = rand(0.10, 1.50, 2)

      const solution = solveICETable({
        products:  rxn.products,
        reactants: rxn.reactants,
        initial,
        K: rxn.K,
        kType: rxn.kType,
      })

      // Validate: all equilibrium concentrations must be positive
      const allPositive = Object.values(solution.equilibriumConcentrations).every(c => c > 1e-12)
      if (!allPositive) continue

      return { ...rxn, initial, solution, dynamic: true }
    } catch {
      // Solver failed (e.g. negative root) — try again
    }
  }

  // Guaranteed fallback: K=1, A ⇌ B, [A]₀ = 1.00 M
  const fallback = DYNAMIC_TEMPLATES[0].build('A', 'B', 1.0)
  const initial = { A: 1.0, B: 0 }
  const solution = solveICETable({ ...fallback, initial, kType: 'Kc' })
  return { ...fallback, initial, solution, dynamic: true }
}

// ── Kp \u2194 Kc ──────────────────────────────────────────────────────────────

export function generateKpKcProblem(): {
  reaction: EquilibriumReaction
  mode: 'Kp' | 'Kc'
  T: number
  answer: number
  steps: string[]
} {
  // Only use reactions with nonzero deltaN
  const candidates = EQUILIBRIUM_REACTIONS.filter(r => {
    const { products: ap, reactants: ar } = active(r)
    const deltaN =
      ap.filter(s => s.state === 'g').reduce((a, s) => a + s.coefficient, 0) -
      ar.filter(s => s.state === 'g').reduce((a, s) => a + s.coefficient, 0)
    return deltaN !== 0
  })
  const reaction = pick(candidates)

  // Compute deltaN
  const { products: ap, reactants: ar } = active(reaction)
  const deltaN =
    ap.filter(s => s.state === 'g').reduce((a, s) => a + s.coefficient, 0) -
    ar.filter(s => s.state === 'g').reduce((a, s) => a + s.coefficient, 0)

  const T = reaction.T
  const mode: 'Kp' | 'Kc' = Math.random() < 0.5 ? 'Kc' : 'Kp'

  // If mode is 'Kc', known is Kc, we compute Kp (and vice versa)
  const { answer, steps } = convertKpKc({ type: mode, value: reaction.K }, T, deltaN)

  return { reaction, mode, T, answer, steps }
}

// ── Answer checker ────────────────────────────────────────────────────────────

/** Check a student's numeric string answer against the correct value within 2% tolerance. */
export function checkConcentrationAnswer(input: string, correct: number): boolean {
  const parsed = parseFloat(input.trim())
  if (!isFinite(parsed)) return false
  if (correct === 0) return Math.abs(parsed) < 1e-6
  return Math.abs((parsed - correct) / correct) <= 0.02
}

// ── Exports for tests ────────────────────────────────────────────────────────

export type { ICESolution }
export { fmt }

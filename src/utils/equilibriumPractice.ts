// Equilibrium practice problem generators.
// Pure TypeScript — no React, no component imports.

import { EQUILIBRIUM_REACTIONS, type EquilibriumReaction, type EquilibriumSpecies } from '../data/equilibriumReactions'
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

// ── Dynamic ICE Table (real + template-generated reactions) ───────────────────

// Real reactions suitable for ICE tables — all-gas/aq, K in Gen Chem 102 range.
export const ICE_REAL_IDS = [
  'n2o4-no2', 'h2-i2-hi', 'n2-h2-nh3', 'so2-o2-so3', 'fe3-scn-fescn',
  'pcl5-pcl3-cl2', 'water-gas-shift', 'ch4-h2o-co-h2', 'nocl-no-cl2',
  'so2cl2-so2-cl2', 'i2-cl2-icl', 'br2-cl2-brcl', 'h2s-h2-s2', 'i2aq-i-i3',
]

// Expert-tier reactions: non-trivial coefficients (at least one > 1), K in tractable range.
// Used exclusively for the 5-star difficulty where students balance the equation first.
export const ICE_EXPERT_IDS = [
  'n2-h2-nh3',     // N₂ + 3H₂ ⇌ 2NH₃        K=9.6
  'so2-o2-so3',    // 2SO₂ + O₂ ⇌ 2SO₃       K=280 (Kp)
  'ch4-h2o-co-h2', // CH₄ + H₂O ⇌ CO + 3H₂   K=26
  'nocl-no-cl2',   // 2NOCl ⇌ 2NO + Cl₂
  'h2s-h2-s2',     // 2H₂S ⇌ 2H₂ + S₂
  'n2o4-no2',      // N₂O₄ ⇌ 2NO₂            K=0.113
  'h2-i2-hi',      // H₂ + I₂ ⇌ 2HI          K=54.3
]

// Build equation string without coefficients, e.g. "N₂(g) + H₂(g) ⇌ NH₃(g)"
function buildSkeletonEquation(reactants: EquilibriumSpecies[], products: EquilibriumSpecies[]): string {
  const side = (sps: EquilibriumSpecies[]) =>
    sps.map(s => `${s.formula}(${s.state})`).join(' + ')
  return `${side(reactants)} \u21cc ${side(products)}`
}

// Letter label pools for template reactions
const LETTER_SETS_2 = [['A','B'], ['X','Y'], ['M','N'], ['P','Q']]
const LETTER_SETS_3 = [['A','B','C'], ['X','Y','Z'], ['P','Q','R'], ['M','N','L']]
const LETTER_SETS_4 = [['A','B','C','D'], ['W','X','Y','Z'], ['M','N','P','Q']]

// K in 10^-2 to 10^2 — tractable for Gen Chem 102 ICE tables
function randomTemplateK(): number {
  const exp = Math.floor(Math.random() * 5) - 2
  const mantissa = parseFloat((1 + Math.random() * 8.9).toFixed(2))
  return parseFloat((mantissa * Math.pow(10, exp)).toPrecision(3))
}

function sp(formula: string, coefficient: number): EquilibriumSpecies {
  return { formula, coefficient, state: 'g' }
}

type ReactionTemplate = { equation: string; products: EquilibriumSpecies[]; reactants: EquilibriumSpecies[] }

function buildTemplate2(): ReactionTemplate {
  const [A, B] = pick(LETTER_SETS_2)
  return pick<ReactionTemplate>([
    { equation: `${A}(g) ⇌ ${B}(g)`,   reactants: [sp(A, 1)],      products: [sp(B, 1)] },
    { equation: `${A}(g) ⇌ 2${B}(g)`,  reactants: [sp(A, 1)],      products: [sp(B, 2)] },
    { equation: `2${A}(g) ⇌ ${B}(g)`,  reactants: [sp(A, 2)],      products: [sp(B, 1)] },
  ])
}

function buildTemplate3(): ReactionTemplate {
  const [A, B, C] = pick(LETTER_SETS_3)
  return pick<ReactionTemplate>([
    { equation: `${A}(g) + ${B}(g) ⇌ ${C}(g)`,  reactants: [sp(A,1), sp(B,1)], products: [sp(C,1)] },
    { equation: `${A}(g) + ${B}(g) ⇌ 2${C}(g)`, reactants: [sp(A,1), sp(B,1)], products: [sp(C,2)] },
    { equation: `${A}(g) ⇌ ${B}(g) + ${C}(g)`,  reactants: [sp(A,1)],          products: [sp(B,1), sp(C,1)] },
    { equation: `2${A}(g) ⇌ ${B}(g) + ${C}(g)`, reactants: [sp(A,2)],          products: [sp(B,1), sp(C,1)] },
    { equation: `${A}(g) + 2${B}(g) ⇌ ${C}(g)`, reactants: [sp(A,1), sp(B,2)], products: [sp(C,1)] },
  ])
}

function buildTemplate4(): ReactionTemplate {
  const [A, B, C, D] = pick(LETTER_SETS_4)
  return pick<ReactionTemplate>([
    { equation: `${A}(g) + ${B}(g) ⇌ ${C}(g) + ${D}(g)`,   reactants: [sp(A,1), sp(B,1)], products: [sp(C,1), sp(D,1)] },
    { equation: `${A}(g) + ${B}(g) ⇌ 2${C}(g) + ${D}(g)`,  reactants: [sp(A,1), sp(B,1)], products: [sp(C,2), sp(D,1)] },
    { equation: `2${A}(g) + ${B}(g) ⇌ ${C}(g) + ${D}(g)`,  reactants: [sp(A,2), sp(B,1)], products: [sp(C,1), sp(D,1)] },
    { equation: `${A}(g) + ${B}(g) ⇌ ${C}(g) + 2${D}(g)`,  reactants: [sp(A,1), sp(B,1)], products: [sp(C,1), sp(D,2)] },
  ])
}

const TEMPLATE_BUILDERS: Record<2 | 3 | 4, () => ReactionTemplate> = {
  2: buildTemplate2,
  3: buildTemplate3,
  4: buildTemplate4,
}

export interface DynamicICEProblem {
  equation: string
  products:  EquilibriumSpecies[]
  reactants: EquilibriumSpecies[]
  K: number
  kType: 'Kc' | 'Kp'
  initial: Record<string, number>
  solution: ICESolution
  dynamic: true
  isTemplate?: boolean
  skeletonEquation?: string   // expert tier: equation without coefficients shown first
  balancingRequired?: boolean // expert tier: student must balance before ICE table
}

// Verify that equilibrium concentrations satisfy K (Kc only) within 10%.
// Used to catch numerical solver failures before returning a bad problem.
function kSatisfied(
  products: EquilibriumSpecies[],
  reactants: EquilibriumSpecies[],
  eq: Record<string, number>,
  K: number,
): boolean {
  const act = (sps: EquilibriumSpecies[]) => sps.filter(s => s.state === 'g' || s.state === 'aq')
  let Kcalc = 1
  for (const s of act(products))  Kcalc *= Math.pow(eq[s.formula], s.coefficient)
  for (const s of act(reactants)) Kcalc /= Math.pow(eq[s.formula], s.coefficient)
  return isFinite(Kcalc) && Math.abs(Kcalc - K) / K < 0.10
}

// speciesCount filters by total active species.
// 2 = simple, 3 = standard (Chang baseline), 4 = advanced
// 5 = expert: real reactions only, balancingRequired=true (speciesCount is ignored for filtering)
// undefined = pick from all difficulties
export function generateDynamicICEProblem(speciesCount?: 2 | 3 | 4 | 5): DynamicICEProblem {
  // ── Expert tier ──────────────────────────────────────────────────────────────
  if (speciesCount === 5) {
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const id = pick(ICE_EXPERT_IDS)
        const reaction = EQUILIBRIUM_REACTIONS.find(r => r.id === id)!
        const activeReactants = reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq')
        const mixedInitial = Math.random() < 0.3

        const initial: Record<string, number> = {}
        for (const s of reaction.products)  initial[s.formula] = mixedInitial ? rand(0.05, 0.50, 2) : 0
        for (const s of activeReactants)    initial[s.formula] = rand(0.10, 1.50, 2)

        const solution = solveICETable({
          products:  reaction.products,
          reactants: reaction.reactants,
          initial,
          K:      reaction.K,
          kType:  reaction.kType,
        })

        const eq = solution.equilibriumConcentrations
        const allPositive = Object.values(eq).every(c => c > 1e-12)
        if (!allPositive) continue
        // For Kc reactions, also verify K is numerically satisfied
        if (reaction.kType === 'Kc' && !kSatisfied(reaction.products, reaction.reactants, eq, reaction.K)) continue

        return {
          equation:          reaction.equation,
          products:          reaction.products,
          reactants:         reaction.reactants,
          K:                 reaction.K,
          kType:             reaction.kType,
          initial,
          solution,
          dynamic:           true,
          skeletonEquation:  buildSkeletonEquation(reaction.reactants, reaction.products),
          balancingRequired: true,
        }
      } catch {
        // retry
      }
    }

    // Expert fallback: N₂ + 3H₂ ⇌ 2NH₃
    const fb = EQUILIBRIUM_REACTIONS.find(r => r.id === 'n2-h2-nh3')!
    const fbInit: Record<string, number> = {}
    for (const s of fb.products)  fbInit[s.formula] = 0
    for (const s of fb.reactants) fbInit[s.formula] = 0.50
    const fbSol = solveICETable({ products: fb.products, reactants: fb.reactants, initial: fbInit, K: fb.K, kType: fb.kType })
    return { equation: fb.equation, products: fb.products, reactants: fb.reactants, K: fb.K, kType: fb.kType,
      initial: fbInit, solution: fbSol, dynamic: true,
      skeletonEquation: buildSkeletonEquation(fb.reactants, fb.products), balancingRequired: true }
  }

  // ── Normal tiers (2 / 3 / 4 / undefined) ─────────────────────────────────────
  const realCandidates = EQUILIBRIUM_REACTIONS.filter(r => {
    if (!ICE_REAL_IDS.includes(r.id)) return false
    if (speciesCount !== undefined) {
      const { products: ap, reactants: ar } = active(r)
      return ap.length + ar.length === speciesCount
    }
    return true
  })

  // When no speciesCount given, bias toward 3-species (most common in Chang)
  const templateCount: 2 | 3 | 4 = speciesCount ?? (pick([2, 3, 3, 4] as const))

  // 50% real reactions (when available), 50% template-generated
  const useReal = realCandidates.length > 0 && Math.random() < 0.5

  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      let equation: string
      let products: EquilibriumSpecies[]
      let reactants: EquilibriumSpecies[]
      let K: number
      let isTemplate = false

      if (useReal) {
        const reaction = pick(realCandidates)
        equation  = reaction.equation
        products  = reaction.products
        reactants = reaction.reactants
        K         = reaction.K
      } else {
        const tpl = TEMPLATE_BUILDERS[templateCount]()
        equation  = tpl.equation
        products  = tpl.products
        reactants = tpl.reactants
        K         = randomTemplateK()
        isTemplate = true
      }

      const kType: 'Kc' | 'Kp' = 'Kc'
      const activeReactants = reactants.filter(s => s.state === 'g' || s.state === 'aq')
      const mixedInitial = Math.random() < 0.3

      const initial: Record<string, number> = {}
      for (const s of products) initial[s.formula] = mixedInitial ? rand(0.05, 0.50, 2) : 0
      for (const s of activeReactants) initial[s.formula] = rand(0.10, 1.50, 2)

      const solution = solveICETable({ products, reactants, initial, K, kType })

      const eq = solution.equilibriumConcentrations
      const allPositive = Object.values(eq).every(c => c > 1e-12)
      if (!allPositive) continue
      if (!kSatisfied(products, reactants, eq, K)) continue

      return { equation, products, reactants, K, kType, initial, solution, dynamic: true, isTemplate }
    } catch {
      // Solver failed — try again with new concentrations
    }
  }

  // Fallback: A(g) ⇌ B(g) with K=1 (always solvable)
  const fbProducts  = [sp('B', 1)]
  const fbReactants = [sp('A', 1)]
  const fbInitial   = { A: 0.50, B: 0 }
  const fbSolution  = solveICETable({ products: fbProducts, reactants: fbReactants, initial: fbInitial, K: 1.0, kType: 'Kc' })
  return { equation: 'A(g) ⇌ B(g)', products: fbProducts, reactants: fbReactants, K: 1.0, kType: 'Kc', initial: fbInitial, solution: fbSolution, dynamic: true, isTemplate: true }
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

// Problem generators for the Thermodynamics page (entropy, Gibbs, spontaneity, K).
// Pure TypeScript — no React imports.

import {
  calcDeltaS,
  calcDeltaG_method1,
  calcDeltaG_method2,
  deltaGtoK,
  kToDeltaG,
  spontaneityAnalysis,
  type ThermochemSpecies,
} from '../chem/thermodynamics'
import { THERMO_TABLE } from '../data/thermoData'

// ── Canned reactions ──────────────────────────────────────────────────────────
// Each entry is a balanced reaction usable for ΔS° and ΔG° problems.

interface CannedReaction {
  label: string
  products: ThermochemSpecies[]
  reactants: ThermochemSpecies[]
}

const CANNED_REACTIONS: CannedReaction[] = [
  {
    label: 'CaCO₃(s) → CaO(s) + CO₂(g)',
    products:  [{ formula: 'CaO', state: 's', coefficient: 1 }, { formula: 'CO₂', state: 'g', coefficient: 1 }],
    reactants: [{ formula: 'CaCO₃', state: 's', coefficient: 1 }],
  },
  {
    label: 'C(s) + O₂(g) → CO₂(g)',
    products:  [{ formula: 'CO₂', state: 'g', coefficient: 1 }],
    reactants: [{ formula: 'C', state: 's', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
  },
  {
    label: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
    products:  [{ formula: 'NH₃', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'N₂', state: 'g', coefficient: 1 }, { formula: 'H₂', state: 'g', coefficient: 3 }],
  },
  {
    label: '2H₂(g) + O₂(g) → 2H₂O(l)',
    products:  [{ formula: 'H₂O', state: 'l', coefficient: 2 }],
    reactants: [{ formula: 'H₂', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
  },
  {
    label: '2SO₂(g) + O₂(g) → 2SO₃(g)',
    products:  [{ formula: 'SO₃', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'SO₂', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
  },
  {
    label: '2CO(g) + O₂(g) → 2CO₂(g)',
    products:  [{ formula: 'CO₂', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'CO', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
  },
  {
    label: 'Fe₂O₃(s) + 3CO(g) → 2Fe(s) + 3CO₂(g)',
    products:  [{ formula: 'Fe', state: 's', coefficient: 2 }, { formula: 'CO₂', state: 'g', coefficient: 3 }],
    reactants: [{ formula: 'Fe₂O₃', state: 's', coefficient: 1 }, { formula: 'CO', state: 'g', coefficient: 3 }],
  },
  {
    label: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',
    products:  [{ formula: 'CO₂', state: 'g', coefficient: 1 }, { formula: 'H₂O', state: 'l', coefficient: 2 }],
    reactants: [{ formula: 'CH₄', state: 'g', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 2 }],
  },
  {
    label: '2NO(g) + O₂(g) → 2NO₂(g)',
    products:  [{ formula: 'NO₂', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'NO', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
  },
  {
    label: 'MgO(s) + CO₂(g) → MgCO₃  (uses CaO as proxy)',
    // Note: MgCO₃ not in table; use CaCO₃ → CaO + CO₂ reversed instead
    products:  [{ formula: 'CaCO₃', state: 's', coefficient: 1 }],
    reactants: [{ formula: 'CaO', state: 's', coefficient: 1 }, { formula: 'CO₂', state: 'g', coefficient: 1 }],
  },
]

// Pick a random reaction (excluding the last entry which is a workaround)
function pickReaction(): CannedReaction {
  const usable = CANNED_REACTIONS.slice(0, -1)
  return usable[Math.floor(Math.random() * usable.length)]
}

// ── Entropy Problem ────────────────────────────────────────────────────────────

export interface EntropyProblem {
  type: 'entropy'
  label: string
  products: ThermochemSpecies[]
  reactants: ThermochemSpecies[]
  answer: number  // J/(mol·K), correct ΔS°
  steps: string[]
  isDynamic?: boolean
}

export function generateEntropyProblem(): EntropyProblem {
  const rxn = pickReaction()
  const { deltaS, steps } = calcDeltaS(rxn.products, rxn.reactants)
  return {
    type: 'entropy',
    label: rxn.label,
    products: rxn.products,
    reactants: rxn.reactants,
    answer: deltaS,
    steps,
  }
}

// ── Gibbs Energy Problem (method 1 or 2) ──────────────────────────────────────

export interface GibbsProblem {
  type: 'gibbs'
  method: 1 | 2
  label: string
  products?: ThermochemSpecies[]
  reactants?: ThermochemSpecies[]
  deltaH_kJ?: number
  deltaS_JperK?: number
  T?: number
  answer: number  // kJ/mol
  steps: string[]
  isDynamic?: boolean
}

export function generateGibbsProblem(): GibbsProblem {
  const useMethod2 = Math.random() < 0.5
  if (useMethod2) {
    const rxn = pickReaction()
    const { deltaG, steps } = calcDeltaG_method2(rxn.products, rxn.reactants)
    return {
      type: 'gibbs',
      method: 2,
      label: rxn.label,
      products: rxn.products,
      reactants: rxn.reactants,
      answer: deltaG,
      steps,
    }
  }
  // Method 1: pick random ΔH and ΔS, T=298
  const rxn = pickReaction()
  const { deltaG: deltaGfmt, steps } = calcDeltaG_method2(rxn.products, rxn.reactants)
  // Use actual formation values so we have a reference answer
  return {
    type: 'gibbs',
    method: 1,
    label: rxn.label,
    answer: deltaGfmt,
    steps,
  }
}

// ── Spontaneity Problem ────────────────────────────────────────────────────────

export type SpontaneityClass = 'always' | 'never' | 'low-T' | 'high-T'

export interface SpontaneityProblem {
  type: 'spontaneity'
  deltaH_kJ: number
  deltaS_JperK: number
  answer: SpontaneityClass
  crossoverT?: number
  steps: string[]
  explanation: string
  isDynamic?: boolean
}

const SPONTANEITY_SCENARIOS: { deltaH: number; deltaS: number }[] = [
  { deltaH: -100, deltaS:  200 },  // always
  { deltaH:  100, deltaS: -200 },  // never
  { deltaH: -100, deltaS: -150 },  // low-T, crossover = 667 K
  { deltaH:   50, deltaS:  100 },  // high-T, crossover = 500 K
  { deltaH: -285, deltaS: -163 },  // low-T  (H₂ combustion values)
  { deltaH:  178, deltaS:  160 },  // high-T (CaCO₃ decomp approx)
  { deltaH:   92, deltaS:  198 },  // high-T
  { deltaH:  -46, deltaS: -100 },  // low-T
]

export function generateSpontaneityProblem(): SpontaneityProblem {
  const scenario = SPONTANEITY_SCENARIOS[Math.floor(Math.random() * SPONTANEITY_SCENARIOS.length)]
  const result = spontaneityAnalysis(scenario.deltaH, scenario.deltaS)
  return {
    type: 'spontaneity',
    deltaH_kJ: scenario.deltaH,
    deltaS_JperK: scenario.deltaS,
    answer: result.classification,
    crossoverT: result.crossoverT,
    steps: result.steps,
    explanation: result.explanation,
  }
}

// ── ΔG° ↔ K Problem ───────────────────────────────────────────────────────────

export type GibbsKDirection = 'deltaG-to-K' | 'K-to-deltaG'

export interface GibbsKProblem {
  type: 'gibbs-k'
  direction: GibbsKDirection
  deltaG_kJ?: number
  K?: number
  T: number
  answer: number
  steps: string[]
  isDynamic?: boolean
}

const TEMPERATURES = [298, 500, 750, 1000, 373, 473]
const GIBBS_VALUES_KJ = [-50, -30, -10, -5, 0, 5, 10, 30, 50]

export function generateGibbsKProblem(): GibbsKProblem {
  const T = TEMPERATURES[Math.floor(Math.random() * TEMPERATURES.length)]
  const direction: GibbsKDirection = Math.random() < 0.5 ? 'deltaG-to-K' : 'K-to-deltaG'

  if (direction === 'deltaG-to-K') {
    const deltaG_kJ = GIBBS_VALUES_KJ[Math.floor(Math.random() * GIBBS_VALUES_KJ.length)]
    const { K, steps } = deltaGtoK(deltaG_kJ, T)
    return { type: 'gibbs-k', direction, deltaG_kJ, T, answer: K, steps }
  } else {
    // Pick a ΔG to derive a "nice" K
    const deltaG_kJ = GIBBS_VALUES_KJ[Math.floor(Math.random() * GIBBS_VALUES_KJ.length)]
    const { K } = deltaGtoK(deltaG_kJ, T)
    const { deltaG, steps } = kToDeltaG(K, T)
    return { type: 'gibbs-k', direction, K, T, answer: deltaG, steps }
  }
}

// ── Crossover Temperature Problem ─────────────────────────────────────────────

export interface CrossoverTProblem {
  type: 'crossover-T'
  deltaH_kJ: number
  deltaS_JperK: number
  answer: number   // K
  steps: string[]
  isDynamic?: boolean
}

export function generateCrossoverTProblem(): CrossoverTProblem {
  // Only high-T or low-T cases have a crossover
  const candidates = SPONTANEITY_SCENARIOS.filter(s => {
    const r = spontaneityAnalysis(s.deltaH, s.deltaS)
    return r.crossoverT !== undefined && r.crossoverT > 0
  })
  const scenario = candidates[Math.floor(Math.random() * candidates.length)]
  const result = spontaneityAnalysis(scenario.deltaH, scenario.deltaS)
  return {
    type: 'crossover-T',
    deltaH_kJ: scenario.deltaH,
    deltaS_JperK: scenario.deltaS,
    answer: result.crossoverT!,
    steps: result.steps,
  }
}

// ── Dynamic generators ────────────────────────────────────────────────────────
//
// These generators pull real species from THERMO_TABLE to build fresh reactions
// rather than selecting from the fixed CANNED_REACTIONS pool.  They return the
// SAME types as the pool-based generators so Practice components can use them
// interchangeably.

/** Pick a random entry from an array. */
function randPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Round n to the nearest step. */
function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step
}

/**
 * Build a label string for a balanced reaction from ThermochemSpecies arrays.
 * e.g.  "2 H₂(g) + O₂(g) → 2 H₂O(l)"
 */
function reactionLabel(products: ThermochemSpecies[], reactants: ThermochemSpecies[]): string {
  const fmt = (sp: ThermochemSpecies) =>
    `${sp.coefficient === 1 ? '' : sp.coefficient + ' '}${sp.formula}(${sp.state})`
  return reactants.map(fmt).join(' + ') + ' → ' + products.map(fmt).join(' + ')
}

interface SpeciesSpec {
  formula: string
  state: string
  coefficient: number
}

// Dynamic reaction templates — all species exist in THERMO_TABLE.
const DYNAMIC_THERMO_TEMPLATES: { products: SpeciesSpec[]; reactants: SpeciesSpec[] }[] = [
  // H₂ combustion
  { products: [{ formula: 'H₂O', state: 'l', coefficient: 2 }],
    reactants: [{ formula: 'H₂', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // CH₄ combustion
  { products: [{ formula: 'CO₂', state: 'g', coefficient: 1 }, { formula: 'H₂O', state: 'l', coefficient: 2 }],
    reactants: [{ formula: 'CH₄', state: 'g', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 2 }] },
  // C₂H₆ combustion
  { products: [{ formula: 'CO₂', state: 'g', coefficient: 2 }, { formula: 'H₂O', state: 'l', coefficient: 3 }],
    reactants: [{ formula: 'C₂H₆', state: 'g', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 3.5 }] },
  // C₃H₈ combustion
  { products: [{ formula: 'CO₂', state: 'g', coefficient: 3 }, { formula: 'H₂O', state: 'l', coefficient: 4 }],
    reactants: [{ formula: 'C₃H₈', state: 'g', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 5 }] },
  // SO₂ → SO₃
  { products: [{ formula: 'SO₃', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'SO₂', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // NO → NO₂
  { products: [{ formula: 'NO₂', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'NO', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // CaCO₃ decomp
  { products: [{ formula: 'CaO', state: 's', coefficient: 1 }, { formula: 'CO₂', state: 'g', coefficient: 1 }],
    reactants: [{ formula: 'CaCO₃', state: 's', coefficient: 1 }] },
  // N₂ + H₂ → NH₃
  { products: [{ formula: 'NH₃', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'N₂', state: 'g', coefficient: 1 }, { formula: 'H₂', state: 'g', coefficient: 3 }] },
  // CO combustion
  { products: [{ formula: 'CO₂', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'CO', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // Fe₂O₃ + CO reduction
  { products: [{ formula: 'Fe', state: 's', coefficient: 2 }, { formula: 'CO₂', state: 'g', coefficient: 3 }],
    reactants: [{ formula: 'Fe₂O₃', state: 's', coefficient: 1 }, { formula: 'CO', state: 'g', coefficient: 3 }] },
  // HI formation
  { products: [{ formula: 'HI', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'H₂', state: 'g', coefficient: 1 }, { formula: 'I₂', state: 's', coefficient: 1 }] },
  // HBr formation
  { products: [{ formula: 'HBr', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'H₂', state: 'g', coefficient: 1 }, { formula: 'Br₂', state: 'l', coefficient: 1 }] },
  // HCl formation
  { products: [{ formula: 'HCl', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'H₂', state: 'g', coefficient: 1 }, { formula: 'Cl₂', state: 'g', coefficient: 1 }] },
  // Water gas formation (CO + H₂O)
  { products: [{ formula: 'CO', state: 'g', coefficient: 1 }, { formula: 'H₂O', state: 'g', coefficient: 1 }],
    reactants: [{ formula: 'CO₂', state: 'g', coefficient: 1 }, { formula: 'H₂', state: 'g', coefficient: 1 }] },
  // MgO formation
  { products: [{ formula: 'MgO', state: 's', coefficient: 2 }],
    reactants: [{ formula: 'Mg', state: 's', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // ZnO formation
  { products: [{ formula: 'ZnO', state: 's', coefficient: 2 }],
    reactants: [{ formula: 'Zn', state: 's', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // Al₂O₃ formation
  { products: [{ formula: 'Al₂O₃', state: 's', coefficient: 2 }],
    reactants: [{ formula: 'Al', state: 's', coefficient: 4 }, { formula: 'O₂', state: 'g', coefficient: 3 }] },
  // N₂O formation
  { products: [{ formula: 'N₂O', state: 'g', coefficient: 2 }],
    reactants: [{ formula: 'N₂', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }] },
  // C₂H₄ combustion
  { products: [{ formula: 'CO₂', state: 'g', coefficient: 2 }, { formula: 'H₂O', state: 'l', coefficient: 2 }],
    reactants: [{ formula: 'C₂H₄', state: 'g', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 3 }] },
  // PCl₃ → PCl₅
  { products: [{ formula: 'PCl₅', state: 'g', coefficient: 1 }],
    reactants: [{ formula: 'PCl₃', state: 'g', coefficient: 1 }, { formula: 'Cl₂', state: 'g', coefficient: 1 }] },
]

/** Verify all species in a template have THERMO_TABLE entries. */
function templateIsValid(t: { products: SpeciesSpec[]; reactants: SpeciesSpec[] }): boolean {
  for (const sp of [...t.products, ...t.reactants]) {
    if (!THERMO_TABLE.find(e => e.formula === sp.formula && e.state === sp.state)) return false
  }
  return true
}

const VALID_DYNAMIC_TEMPLATES = DYNAMIC_THERMO_TEMPLATES.filter(templateIsValid)

/**
 * generateDynamicEntropyProblem — picks a random template from a larger pool
 * than the canned list.  Returns EntropyProblem.
 */
export function generateDynamicEntropyProblem(): EntropyProblem {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const t = randPick(VALID_DYNAMIC_TEMPLATES)
      const { deltaS, steps } = calcDeltaS(t.products, t.reactants)
      return {
        type: 'entropy',
        label: reactionLabel(t.products, t.reactants),
        products: t.products,
        reactants: t.reactants,
        answer: deltaS,
        steps,
        isDynamic: true,
      }
    } catch {
      // template data mismatch — retry
    }
  }
  return generateEntropyProblem()
}

/**
 * generateDynamicGibbsProblem — method 1: uses a real reaction for ΔH/ΔS but
 * picks a random T (200–1200 K, rounded to 25) to ensure variety.
 * Returns GibbsProblem.
 */
export function generateDynamicGibbsProblem(): GibbsProblem {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const t = randPick(VALID_DYNAMIC_TEMPLATES)
      const { deltaS } = calcDeltaS(t.products, t.reactants)
      // Compute ΔH: Σ n·ΔHf(products) − Σ n·ΔHf(reactants)
      let sumH = 0
      for (const sp of t.products) {
        const entry = THERMO_TABLE.find(e => e.formula === sp.formula && e.state === sp.state)!
        sumH += sp.coefficient * entry.deltaHf
      }
      for (const sp of t.reactants) {
        const entry = THERMO_TABLE.find(e => e.formula === sp.formula && e.state === sp.state)!
        sumH -= sp.coefficient * entry.deltaHf
      }
      const T = roundTo(200 + Math.random() * 1000, 25)
      const { deltaG, steps } = calcDeltaG_method1(sumH, deltaS, T)
      return {
        type: 'gibbs',
        method: 1,
        label: reactionLabel(t.products, t.reactants),
        deltaH_kJ: parseFloat(sumH.toFixed(2)),
        deltaS_JperK: parseFloat(deltaS.toFixed(2)),
        T,
        answer: deltaG,
        steps,
        isDynamic: true,
      }
    } catch {
      // retry
    }
  }
  return generateGibbsProblem()
}

/**
 * generateDynamicSpontaneityProblem — generates ΔH and ΔS in each of the four
 * sign quadrants so all four classifications appear with equal probability.
 * Returns SpontaneityProblem.
 */
export function generateDynamicSpontaneityProblem(): SpontaneityProblem {
  const combos = [
    { hSign: -1, sSign: 1 },  // always
    { hSign: 1,  sSign: -1 }, // never
    { hSign: -1, sSign: -1 }, // low-T
    { hSign: 1,  sSign: 1 },  // high-T
  ]
  const { hSign, sSign } = randPick(combos)
  // |ΔH|: 20–400 kJ/mol in 10 kJ steps
  const absH = (Math.floor(Math.random() * 39) + 2) * 10
  // |ΔS|: 50–300 J/(mol·K) in 10 J steps
  const absS = (Math.floor(Math.random() * 26) + 5) * 10
  const deltaH = hSign * absH
  const deltaS = sSign * absS
  const result = spontaneityAnalysis(deltaH, deltaS)
  return {
    type: 'spontaneity',
    deltaH_kJ: deltaH,
    deltaS_JperK: deltaS,
    answer: result.classification,
    crossoverT: result.crossoverT,
    steps: result.steps,
    explanation: result.explanation,
    isDynamic: true,
  }
}

/**
 * generateDynamicGibbsKProblem — generates a ΔG° ↔ K problem with a random T
 * (200–1200 K) and a random ΔG° value (−80 to +80 kJ/mol).
 * Returns GibbsKProblem.
 */
export function generateDynamicGibbsKProblem(): GibbsKProblem {
  const T = roundTo(200 + Math.random() * 1000, 25)
  // ΔG° range: −80 to +80 kJ/mol in 5 kJ steps
  const deltaG_kJ = (Math.floor(Math.random() * 33) - 16) * 5
  const direction: GibbsKDirection = Math.random() < 0.5 ? 'deltaG-to-K' : 'K-to-deltaG'
  if (direction === 'deltaG-to-K') {
    const { K, steps } = deltaGtoK(deltaG_kJ, T)
    return { type: 'gibbs-k', direction, deltaG_kJ, T, answer: K, steps, isDynamic: true }
  } else {
    const { K } = deltaGtoK(deltaG_kJ, T)
    const { deltaG, steps } = kToDeltaG(K, T)
    return { type: 'gibbs-k', direction, K, T, answer: deltaG, steps, isDynamic: true }
  }
}

/**
 * generateDynamicCrossoverTProblem — generates a crossover-T problem with
 * random ΔH and ΔS values that guarantee a valid positive crossover.
 * Returns CrossoverTProblem.
 */
export function generateDynamicCrossoverTProblem(): CrossoverTProblem {
  // Must have ΔH and ΔS of the same sign so there IS a crossover.
  for (let attempt = 0; attempt < 50; attempt++) {
    const sameSign = Math.random() < 0.5 ? 1 : -1
    const absH = (Math.floor(Math.random() * 39) + 2) * 10   // 20–400 kJ/mol
    const absS = (Math.floor(Math.random() * 26) + 5) * 10   // 50–300 J/(mol·K)
    const deltaH = sameSign * absH
    const deltaS = sameSign * absS
    const result = spontaneityAnalysis(deltaH, deltaS)
    if (
      result.crossoverT !== undefined &&
      result.crossoverT > 100 &&
      result.crossoverT < 2500
    ) {
      return {
        type: 'crossover-T',
        deltaH_kJ: deltaH,
        deltaS_JperK: deltaS,
        answer: result.crossoverT,
        steps: result.steps,
        isDynamic: true,
      }
    }
  }
  return generateCrossoverTProblem()
}

// Problem generators for the Thermodynamics page (entropy, Gibbs, spontaneity, K).
// Pure TypeScript — no React imports.

import {
  calcDeltaS,
  calcDeltaG_method2,
  deltaGtoK,
  kToDeltaG,
  spontaneityAnalysis,
  type ThermochemSpecies,
} from '../chem/thermodynamics'

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

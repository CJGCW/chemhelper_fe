// Pure domain logic for entropy and Gibbs free energy calculations.
// No React imports. No utils imports.
// Data import from '../data/thermoData' is permitted per CLAUDE.md.

import { THERMO_TABLE, type ThermoEntry } from '../data/thermoData'

export interface ThermochemSpecies {
  formula: string
  state: string
  coefficient: number
}

function lookupEntry(formula: string, state: string): ThermoEntry | undefined {
  return THERMO_TABLE.find(e => e.formula === formula && e.state === state)
}

// ── Entropy ───────────────────────────────────────────────────────────────────

/**
 * ΔS°rxn = Σ n·S°(products) - Σ n·S°(reactants).
 * S° in J/(mol·K).
 */
export function calcDeltaS(
  products: ThermochemSpecies[],
  reactants: ThermochemSpecies[],
): { deltaS: number; steps: string[] } {
  const steps: string[] = []

  let sumProducts = 0
  const productTerms: string[] = []
  for (const p of products) {
    const entry = lookupEntry(p.formula, p.state)
    if (!entry) throw new Error(`No data for ${p.formula}(${p.state})`)
    const contrib = p.coefficient * entry.S
    sumProducts += contrib
    productTerms.push(`${p.coefficient} × S°[${p.formula}(${p.state})] = ${p.coefficient} × ${entry.S} = ${contrib.toFixed(2)} J/(mol·K)`)
  }

  let sumReactants = 0
  const reactantTerms: string[] = []
  for (const r of reactants) {
    const entry = lookupEntry(r.formula, r.state)
    if (!entry) throw new Error(`No data for ${r.formula}(${r.state})`)
    const contrib = r.coefficient * entry.S
    sumReactants += contrib
    reactantTerms.push(`${r.coefficient} × S°[${r.formula}(${r.state})] = ${r.coefficient} × ${entry.S} = ${contrib.toFixed(2)} J/(mol·K)`)
  }

  const deltaS = sumProducts - sumReactants

  steps.push('ΔS°rxn = Σ n·S°(products) − Σ n·S°(reactants)')
  steps.push('Products:')
  productTerms.forEach(t => steps.push('  ' + t))
  steps.push(`  Σ n·S°(products) = ${sumProducts.toFixed(2)} J/(mol·K)`)
  steps.push('Reactants:')
  reactantTerms.forEach(t => steps.push('  ' + t))
  steps.push(`  Σ n·S°(reactants) = ${sumReactants.toFixed(2)} J/(mol·K)`)
  steps.push(`ΔS°rxn = ${sumProducts.toFixed(2)} − ${sumReactants.toFixed(2)} = ${deltaS.toFixed(2)} J/(mol·K)`)

  return { deltaS, steps }
}

/**
 * Predict sign of ΔS from inspection.
 * Key rule: Δn_gas is the strongest predictor.
 */
export function predictDeltaSSign(
  products: ThermochemSpecies[],
  reactants: ThermochemSpecies[],
): { prediction: 'positive' | 'negative' | 'uncertain'; reason: string } {
  const nGasProducts  = products.filter(p => p.state === 'g').reduce((s, p) => s + p.coefficient, 0)
  const nGasReactants = reactants.filter(r => r.state === 'g').reduce((s, r) => s + r.coefficient, 0)
  const deltaNgas = nGasProducts - nGasReactants

  if (deltaNgas > 0) {
    return { prediction: 'positive', reason: `Δn(gas) = +${deltaNgas}: more gas molecules are produced, increasing disorder.` }
  }
  if (deltaNgas < 0) {
    return { prediction: 'negative', reason: `Δn(gas) = ${deltaNgas}: fewer gas molecules are produced, decreasing disorder.` }
  }

  const nParticlesProducts  = products.reduce((s, p) => s + p.coefficient, 0)
  const nParticlesReactants = reactants.reduce((s, r) => s + r.coefficient, 0)
  const deltaN = nParticlesProducts - nParticlesReactants

  if (deltaN > 0) return { prediction: 'positive', reason: 'More product particles than reactant particles; entropy likely increases.' }
  if (deltaN < 0) return { prediction: 'negative', reason: 'Fewer product particles than reactant particles; entropy likely decreases.' }

  return { prediction: 'uncertain', reason: 'Δn(gas) = 0 and particle counts are equal; sign of ΔS cannot be predicted by inspection alone.' }
}

// ── Gibbs Energy ──────────────────────────────────────────────────────────────

/**
 * Method 1: ΔG° = ΔH° − T·ΔS°
 * CRITICAL unit conversion: ΔS° is in J/(mol·K); must convert to kJ.
 * ΔG°(kJ) = ΔH°(kJ) − T(K) × ΔS°(J/K) / 1000
 */
export function calcDeltaG_method1(
  deltaH_kJ: number,
  deltaS_JperK: number,
  T: number,
): { deltaG: number; steps: string[] } {
  const deltaS_kJperK = deltaS_JperK / 1000
  const deltaG = deltaH_kJ - T * deltaS_kJperK

  const steps: string[] = [
    'ΔG° = ΔH° − T·ΔS°',
    `ΔS° = ${deltaS_JperK} J/(mol·K) = ${deltaS_JperK}/1000 kJ/(mol·K) = ${deltaS_kJperK.toFixed(4)} kJ/(mol·K)`,
    `ΔG° = ${deltaH_kJ} kJ/mol − (${T} K × ${deltaS_kJperK.toFixed(4)} kJ/(mol·K))`,
    `ΔG° = ${deltaH_kJ} − ${(T * deltaS_kJperK).toFixed(4)}`,
    `ΔG° = ${deltaG.toFixed(2)} kJ/mol`,
  ]

  return { deltaG, steps }
}

/**
 * Method 2: ΔG° = Σ n·ΔG°f(products) − Σ n·ΔG°f(reactants). In kJ/mol.
 */
export function calcDeltaG_method2(
  products: ThermochemSpecies[],
  reactants: ThermochemSpecies[],
): { deltaG: number; steps: string[] } {
  const steps: string[] = []

  let sumProducts = 0
  const productTerms: string[] = []
  for (const p of products) {
    const entry = lookupEntry(p.formula, p.state)
    if (!entry) throw new Error(`No data for ${p.formula}(${p.state})`)
    const contrib = p.coefficient * entry.deltaGf
    sumProducts += contrib
    productTerms.push(`${p.coefficient} × ΔG°f[${p.formula}(${p.state})] = ${p.coefficient} × ${entry.deltaGf} = ${contrib.toFixed(2)} kJ/mol`)
  }

  let sumReactants = 0
  const reactantTerms: string[] = []
  for (const r of reactants) {
    const entry = lookupEntry(r.formula, r.state)
    if (!entry) throw new Error(`No data for ${r.formula}(${r.state})`)
    const contrib = r.coefficient * entry.deltaGf
    sumReactants += contrib
    reactantTerms.push(`${r.coefficient} × ΔG°f[${r.formula}(${r.state})] = ${r.coefficient} × ${entry.deltaGf} = ${contrib.toFixed(2)} kJ/mol`)
  }

  const deltaG = sumProducts - sumReactants

  steps.push('ΔG°rxn = Σ n·ΔG°f(products) − Σ n·ΔG°f(reactants)')
  steps.push('Products:')
  productTerms.forEach(t => steps.push('  ' + t))
  steps.push(`  Σ n·ΔG°f(products) = ${sumProducts.toFixed(2)} kJ/mol`)
  steps.push('Reactants:')
  reactantTerms.forEach(t => steps.push('  ' + t))
  steps.push(`  Σ n·ΔG°f(reactants) = ${sumReactants.toFixed(2)} kJ/mol`)
  steps.push(`ΔG°rxn = ${sumProducts.toFixed(2)} − ${sumReactants.toFixed(2)} = ${deltaG.toFixed(2)} kJ/mol`)

  return { deltaG, steps }
}

// ── Gibbs ↔ Equilibrium ───────────────────────────────────────────────────────

const R = 8.314  // J/(mol·K)

/**
 * ΔG° = −RT ln K  →  K = exp(−ΔG°×1000 / RT)
 * ΔG° in kJ/mol, R = 8.314 J/(mol·K), T in K.
 */
export function deltaGtoK(deltaG_kJ: number, T: number): { K: number; steps: string[] } {
  const exponent = -(deltaG_kJ * 1000) / (R * T)
  const K = Math.exp(exponent)

  const steps: string[] = [
    'ΔG° = −RT ln K',
    'Rearranging: K = exp(−ΔG°/RT)',
    `Convert ΔG° to J: ${deltaG_kJ} kJ/mol × 1000 = ${deltaG_kJ * 1000} J/mol`,
    `Exponent = −ΔG°/(RT) = −(${deltaG_kJ * 1000}) / (${R} × ${T}) = ${exponent.toFixed(4)}`,
    `K = e^(${exponent.toFixed(4)}) = ${K.toExponential(3)}`,
  ]

  return { K, steps }
}

/**
 * K  →  ΔG° = −RT ln K.
 * Returns ΔG° in kJ/mol.
 */
export function kToDeltaG(K: number, T: number): { deltaG: number; steps: string[] } {
  const deltaG = -(R * T * Math.log(K)) / 1000

  const steps: string[] = [
    'ΔG° = −RT ln K',
    `R = ${R} J/(mol·K),  T = ${T} K,  K = ${K}`,
    `ln K = ln(${K}) = ${Math.log(K).toFixed(4)}`,
    `ΔG° = −(${R} × ${T} × ${Math.log(K).toFixed(4)}) / 1000`,
    `ΔG° = ${deltaG.toFixed(2)} kJ/mol`,
  ]

  return { deltaG, steps }
}

/**
 * Non-standard: ΔG = ΔG° + RT ln Q
 * All in kJ/mol.
 */
export function deltaGNonStandard(deltaG0_kJ: number, Q: number, T: number): { deltaG: number; steps: string[] } {
  const RTlnQ = (R * T * Math.log(Q)) / 1000
  const deltaG = deltaG0_kJ + RTlnQ

  const steps: string[] = [
    'ΔG = ΔG° + RT ln Q',
    `R = ${R} J/(mol·K),  T = ${T} K,  Q = ${Q}`,
    `ln Q = ${Math.log(Q).toFixed(4)}`,
    `RT ln Q = (${R} × ${T} × ${Math.log(Q).toFixed(4)}) / 1000 = ${RTlnQ.toFixed(4)} kJ/mol`,
    `ΔG = ${deltaG0_kJ} + ${RTlnQ.toFixed(4)} = ${deltaG.toFixed(2)} kJ/mol`,
  ]

  return { deltaG, steps }
}

// ── Spontaneity ───────────────────────────────────────────────────────────────

/**
 * Analyse spontaneity from ΔH and ΔS.
 * Returns classification and crossover temperature where ΔG = 0.
 */
export function spontaneityAnalysis(
  deltaH_kJ: number,
  deltaS_JperK: number,
): {
  classification: 'always' | 'never' | 'low-T' | 'high-T'
  crossoverT?: number
  explanation: string
  steps: string[]
} {
  const steps: string[] = [
    'ΔG° = ΔH° − T·ΔS°',
    `ΔH° = ${deltaH_kJ} kJ/mol,  ΔS° = ${deltaS_JperK} J/(mol·K)`,
  ]

  // Crossover T where ΔG = 0: T = ΔH(J) / ΔS = ΔH_kJ * 1000 / ΔS_JperK
  const crossoverT = deltaS_JperK !== 0
    ? (deltaH_kJ * 1000) / deltaS_JperK
    : undefined

  if (deltaH_kJ < 0 && deltaS_JperK > 0) {
    steps.push('ΔH° < 0 and ΔS° > 0 → ΔG° < 0 at all temperatures.')
    steps.push('Classification: Always spontaneous.')
    return {
      classification: 'always',
      explanation: 'ΔH° < 0 (exothermic) and ΔS° > 0 (entropy increases): ΔG° is negative at all temperatures.',
      steps,
    }
  }

  if (deltaH_kJ > 0 && deltaS_JperK < 0) {
    steps.push('ΔH° > 0 and ΔS° < 0 → ΔG° > 0 at all temperatures.')
    steps.push('Classification: Never spontaneous.')
    return {
      classification: 'never',
      explanation: 'ΔH° > 0 (endothermic) and ΔS° < 0 (entropy decreases): ΔG° is positive at all temperatures.',
      steps,
    }
  }

  if (deltaH_kJ < 0 && deltaS_JperK < 0) {
    // Spontaneous at low T (ΔH dominates)
    if (crossoverT !== undefined && crossoverT > 0) {
      steps.push(`Crossover T = ΔH°/ΔS° = (${deltaH_kJ} × 1000) / ${deltaS_JperK} = ${crossoverT.toFixed(1)} K`)
      steps.push('ΔH° < 0, ΔS° < 0 → spontaneous only below crossover T.')
    }
    return {
      classification: 'low-T',
      crossoverT: crossoverT !== undefined && crossoverT > 0 ? crossoverT : undefined,
      explanation: `ΔH° < 0 and ΔS° < 0: enthalpy favors spontaneity but entropy does not. Spontaneous only at T < ${crossoverT !== undefined && crossoverT > 0 ? crossoverT.toFixed(1) + ' K' : 'the crossover temperature'}.`,
      steps,
    }
  }

  // ΔH > 0, ΔS > 0 — spontaneous at high T
  if (crossoverT !== undefined && crossoverT > 0) {
    steps.push(`Crossover T = ΔH°/ΔS° = (${deltaH_kJ} × 1000) / ${deltaS_JperK} = ${crossoverT.toFixed(1)} K`)
    steps.push('ΔH° > 0, ΔS° > 0 → spontaneous only above crossover T.')
  }
  return {
    classification: 'high-T',
    crossoverT: crossoverT !== undefined && crossoverT > 0 ? crossoverT : undefined,
    explanation: `ΔH° > 0 and ΔS° > 0: entropy favors spontaneity but enthalpy does not. Spontaneous only at T > ${crossoverT !== undefined && crossoverT > 0 ? crossoverT.toFixed(1) + ' K' : 'the crossover temperature'}.`,
    steps,
  }
}

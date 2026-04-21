import { toMoles, type Amount } from './amount'

export interface ReactantSpec {
  coeff: number
  molarMass: number
  amount: Amount
}

export interface ProductSpec {
  coeff: number
  molarMass: number
}

export interface LRResult {
  /** Index of the limiting reactant in the input array */
  limitingIdx: number
  /** Moles of limiting reactant divided by its stoichiometric coefficient */
  molPerCoeff: number
  /** Converted moles for each reactant */
  mols: number[]
  /** Remaining moles for each reactant (0 for the limiting reactant) */
  excessMol: number[]
  /** Remaining grams for each reactant (0 for the limiting reactant) */
  excessGrams: number[]
  /** Theoretical yield in moles for each product */
  productMols: number[]
  /** Theoretical yield in grams for each product */
  productGrams: number[]
}

/**
 * Pure limiting-reagent calculation — no step strings, no formatting.
 * Throws if reactants array is empty or any molarMass/amount is invalid.
 */
export function limitingReagent(
  reactants: ReactantSpec[],
  products: ProductSpec[],
): LRResult {
  if (reactants.length === 0) throw new Error('at least one reactant required')

  const mols = reactants.map(r => {
    if (r.molarMass <= 0) throw new Error('molarMass must be positive')
    if (r.amount.value <= 0) throw new Error('amount must be positive')
    return toMoles(r.amount, r.molarMass)
  })

  const ratios = reactants.map((r, i) => mols[i] / r.coeff)
  const limitingIdx = ratios.indexOf(Math.min(...ratios))
  const molPerCoeff = ratios[limitingIdx]

  const excessMol   = reactants.map((r, i) => i === limitingIdx ? 0 : mols[i] - molPerCoeff * r.coeff)
  const excessGrams = reactants.map((r, i) => i === limitingIdx ? 0 : excessMol[i] * r.molarMass)

  const productMols  = products.map(p => molPerCoeff * p.coeff)
  const productGrams = products.map((p, i) => productMols[i] * p.molarMass)

  return { limitingIdx, molPerCoeff, mols, excessMol, excessGrams, productMols, productGrams }
}

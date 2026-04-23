import { toMoles, type Amount, type Unit } from './amount'

// ── Shared domain types ───────────────────────────────────────────────────────

/** Minimal species shape needed for stoich calculations. Structurally compatible
 *  with Species from stoichiometryPractice — no explicit import required. */
export interface ChemSpecies {
  formula:   string
  coeff:     number
  molarMass: number
  display:   string
  name?:     string
}

export interface ChemReaction {
  equation:  string
  reactants: ChemSpecies[]
  products:  ChemSpecies[]
}

// ── Primitive (no strings, no formatting) ─────────────────────────────────────

export interface ReactantSpec {
  coeff: number
  molarMass: number
  amount: Amount
}

export interface ProductSpec {
  coeff: number
  molarMass: number
}

export interface LRNumbers {
  limitingIdx:  number
  molPerCoeff:  number
  mols:         number[]
  excessMol:    number[]
  excessGrams:  number[]
  productMols:  number[]
  productGrams: number[]
}

export function limitingReagent(
  reactants: ReactantSpec[],
  products: ProductSpec[],
): LRNumbers {
  if (reactants.length === 0) throw new Error('at least one reactant required')

  const mols = reactants.map(r => {
    if (r.molarMass <= 0) throw new Error('molarMass must be positive')
    if (r.amount.value <= 0) throw new Error('amount must be positive')
    return toMoles(r.amount, r.molarMass)
  })

  const ratios     = reactants.map((r, i) => mols[i] / r.coeff)
  const limitingIdx = ratios.indexOf(Math.min(...ratios))
  const molPerCoeff = ratios[limitingIdx]

  const excessMol   = reactants.map((r, i) => i === limitingIdx ? 0 : mols[i] - molPerCoeff * r.coeff)
  const excessGrams = reactants.map((r, i) => i === limitingIdx ? 0 : excessMol[i] * r.molarMass)

  const productMols  = products.map(p => molPerCoeff * p.coeff)
  const productGrams = products.map((p, i) => productMols[i] * p.molarMass)

  return { limitingIdx, molPerCoeff, mols, excessMol, excessGrams, productMols, productGrams }
}

// ── High-level solver (returns structured result + worked steps) ──────────────

export interface LRExcess {
  species:      ChemSpecies
  remainingMol: number
  remainingG:   number
}

export interface LRProduct {
  species: ChemSpecies
  mol:     number
  grams:   number
}

export interface LRSolution {
  steps:           string[]
  limitingSpecies: ChemSpecies | null
  excess:          LRExcess[]
  products:        LRProduct[]
  rawFirstG:       number
}

const s4 = (n: number) => parseFloat(n.toPrecision(4)).toString()
const r4 = (n: number) => parseFloat(n.toPrecision(4))

export function calcLimitingReagent(
  rxn: ChemReaction,
  inputs: { val: number; unit: Unit }[],
  fmt: (n: number) => string = s4,
  rnd: (n: number) => number = r4,
): LRSolution {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const nums = limitingReagent(
    rxn.reactants.map((sp, i) => ({
      coeff:     sp.coeff,
      molarMass: sp.molarMass,
      amount:    { value: inputs[i]?.val ?? 0, unit: inputs[i]?.unit ?? 'g' },
    })),
    rxn.products.map(p => ({ coeff: p.coeff, molarMass: p.molarMass })),
  )

  const { limitingIdx, molPerCoeff, mols } = nums

  rxn.reactants.forEach((sp, i) => {
    const { val, unit } = inputs[i] ?? { val: 0, unit: 'g' as Unit }
    const label = unit === 'g' ? `${val} g ÷ ${sp.molarMass} g/mol` : `${val} mol`
    steps.push(`mol ${sp.display} = ${label} = ${fmt(mols[i])} mol`)
  })

  if (rxn.reactants.length === 1) {
    steps.push(`→ Single reactant: ${rxn.reactants[0].display}`)
  } else if (rxn.reactants.length === 2) {
    const [rA, rB] = rxn.reactants
    const needed = mols[0] * (rB.coeff / rA.coeff)
    steps.push(
      `${rB.display} needed to consume all ${rA.display}: ` +
      `${fmt(mols[0])} × (${rB.coeff}/${rA.coeff}) = ${fmt(needed)} mol`,
    )
    const limiting    = rxn.reactants[limitingIdx]
    const excessNames = rxn.reactants.filter((_, i) => i !== limitingIdx).map(s => s.display).join(', ')
    steps.push(`→ ${limiting.display} is the limiting reagent (${excessNames} in excess)`)
  } else {
    steps.push(
      `mol/coeff ratios: ` +
      rxn.reactants.map((sp, i) => `${sp.display}: ${fmt(mols[i] / sp.coeff)}`).join(' | '),
    )
    const limiting    = rxn.reactants[limitingIdx]
    const excessNames = rxn.reactants.filter((_, i) => i !== limitingIdx).map(s => s.display).join(', ')
    steps.push(`→ ${limiting.display} is the limiting reagent (${excessNames} in excess)`)
  }

  const limitingSpecies = rxn.reactants[limitingIdx]
  const limitingMol     = mols[limitingIdx]

  let rawFirstG = 0
  const excess: LRExcess[] = []
  rxn.reactants.forEach((sp, i) => {
    if (rxn.reactants.length === 1 || i === limitingIdx) return
    const consumed   = molPerCoeff * sp.coeff
    const remaining  = nums.excessMol[i]
    const gRemaining = nums.excessGrams[i]
    if (rawFirstG === 0) rawFirstG = gRemaining
    steps.push(
      `${sp.display} consumed: ${fmt(consumed)} mol; ` +
      `remaining: ${fmt(remaining)} mol (${fmt(gRemaining)} g)`,
    )
    excess.push({ species: sp, remainingMol: rnd(remaining), remainingG: rnd(gRemaining) })
  })

  const products: LRProduct[] = rxn.products.map((prod, pi) => {
    const mol   = nums.productMols[pi]
    const grams = nums.productGrams[pi]
    if (pi === 0) rawFirstG = grams
    steps.push(
      `Theoretical yield ${prod.display}: ` +
      `${fmt(limitingMol)} × (${prod.coeff}/${limitingSpecies.coeff}) × ${prod.molarMass} g/mol = ${fmt(grams)} g`,
    )
    return { species: prod, mol: rnd(mol), grams: rnd(grams) }
  })

  return {
    steps,
    limitingSpecies: rxn.reactants.length > 1 ? limitingSpecies : null,
    excess,
    products,
    rawFirstG,
  }
}

// ── Mass / mole stoichiometry ─────────────────────────────────────────────────

export interface StoichSolution {
  steps:      string[]
  answer:     number
  answerUnit: Unit
  rawAnswer:  number
}

export function calcStoich(
  rxn:      ChemReaction,
  from:     ChemSpecies, fromVal: number, fromUnit: Unit,
  to:       ChemSpecies, toUnit:  Unit,
): StoichSolution {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molFrom = fromUnit === 'mol' ? fromVal : fromVal / from.molarMass
  if (fromUnit === 'g') {
    steps.push(`Convert to moles: ${fromVal} g ÷ ${from.molarMass} g/mol = ${s4(molFrom)} mol ${from.display}`)
  } else {
    steps.push(`Given: ${fromVal} mol ${from.display}`)
  }

  const molTo = molFrom * (to.coeff / from.coeff)
  steps.push(`Mole ratio: ${s4(molFrom)} mol ${from.display} × (${to.coeff}/${from.coeff}) = ${s4(molTo)} mol ${to.display}`)

  if (toUnit === 'mol') {
    const answer = parseFloat(s4(molTo))
    return { steps, answer, answerUnit: 'mol', rawAnswer: molTo }
  }

  const massTo = molTo * to.molarMass
  steps.push(`Convert to grams: ${s4(molTo)} mol × ${to.molarMass} g/mol = ${s4(massTo)} g ${to.display}`)
  return { steps, answer: parseFloat(s4(massTo)), answerUnit: 'g', rawAnswer: massTo }
}

// ── Theoretical yield ─────────────────────────────────────────────────────────

export interface TYSolution {
  steps:        string[]
  molProduct:   number
  gramsProduct: number
  rawGrams:     number
}

export function calcTheoreticalYield(
  rxn:     ChemReaction,
  lr:      ChemSpecies, lrVal: number, lrUnit: Unit,
  product: ChemSpecies,
): TYSolution {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molLR = lrUnit === 'mol' ? lrVal : lrVal / lr.molarMass
  if (lrUnit === 'g') {
    steps.push(`Convert limiting reagent to moles: ${lrVal} g ÷ ${lr.molarMass} g/mol = ${s4(molLR)} mol ${lr.display}`)
  } else {
    steps.push(`Given: ${lrVal} mol ${lr.display} (limiting reagent)`)
  }

  const molProduct = molLR * (product.coeff / lr.coeff)
  steps.push(
    `Apply mole ratio: ${s4(molLR)} mol ${lr.display} × ` +
    `(${product.coeff} mol ${product.display} / ${lr.coeff} mol ${lr.display}) = ${s4(molProduct)} mol ${product.display}`,
  )

  const gramsProduct = molProduct * product.molarMass
  steps.push(`Theoretical yield: ${s4(molProduct)} mol × ${product.molarMass} g/mol = ${s4(gramsProduct)} g ${product.display}`)

  return {
    steps,
    molProduct:   parseFloat(s4(molProduct)),
    gramsProduct: parseFloat(s4(gramsProduct)),
    rawGrams:     gramsProduct,
  }
}

// ── Percent yield ─────────────────────────────────────────────────────────────

export interface PYSolution {
  steps:        string[]
  percentYield: number
  rawPct:       number
}

export function calcPercentYield(actual: number, theoretical: number): PYSolution {
  const pct   = (actual / theoretical) * 100
  const steps = [
    `% yield = (actual yield / theoretical yield) × 100`,
    `% yield = (${s4(actual)} g / ${s4(theoretical)} g) × 100`,
    `% yield = ${s4(pct)}%`,
  ]
  return { steps, percentYield: parseFloat(s4(pct)), rawPct: pct }
}

// ── Advanced percent yield (chains TY → percent or actual yield) ──────────────

export type SolveFor = 'percent' | 'actual'

export interface AdvPYSolution {
  steps:          string[]
  theoreticalG:   number
  answer:         number
  answerUnit:     string   // '%' | 'g'
  rawTheoretical: number
}

export function calcAdvancedPercentYield(
  rxn:      ChemReaction,
  lr:       ChemSpecies, lrVal: number, lrUnit: Unit,
  product:  ChemSpecies,
  solveFor: SolveFor,
  knownVal: number,
): AdvPYSolution {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molLR = lrUnit === 'mol' ? lrVal : lrVal / lr.molarMass
  if (lrUnit === 'g') {
    steps.push(`mol ${lr.display} = ${lrVal} g ÷ ${lr.molarMass} g/mol = ${s4(molLR)} mol`)
  } else {
    steps.push(`Given: ${lrVal} mol ${lr.display}`)
  }

  const molProd = molLR * (product.coeff / lr.coeff)
  steps.push(`mol ${product.display} = ${s4(molLR)} × (${product.coeff}/${lr.coeff}) = ${s4(molProd)} mol`)

  const tyRaw = molProd * product.molarMass
  const ty    = parseFloat(s4(tyRaw))
  steps.push(`Theoretical yield = ${s4(molProd)} mol × ${product.molarMass} g/mol = ${ty} g`)

  if (solveFor === 'percent') {
    const pct = (knownVal / ty) * 100
    steps.push(`% yield = (actual / theoretical) × 100`)
    steps.push(`% yield = (${s4(knownVal)} g / ${ty} g) × 100 = ${s4(pct)}%`)
    return { steps, theoreticalG: ty, answer: parseFloat(s4(pct)), answerUnit: '%', rawTheoretical: tyRaw }
  }

  const actual = ty * (knownVal / 100)
  steps.push(`Actual yield = theoretical × (% yield / 100)`)
  steps.push(`Actual yield = ${ty} g × (${s4(knownVal)} / 100) = ${s4(actual)} g`)
  return { steps, theoreticalG: ty, answer: parseFloat(s4(actual)), answerUnit: 'g', rawTheoretical: tyRaw }
}

// Chained percent-yield solver — builds a 4-step scaffolded problem:
//   mass of reactant → moles of reactant → moles of product → theoretical mass → percent yield

import type { ChainedStep } from '../components/shared/ChainedProblem'  // type-only: erases at compile time

// ── Types ─────────────────────────────────────────────────────────────────────

export interface YieldSpecies {
  formula:   string
  display:   string
  coeff:     number
  molarMass: number   // g/mol
}

export interface YieldReaction {
  name:      string
  equation:  string
  reactants: YieldSpecies[]
  products:  YieldSpecies[]
}

export interface ChainedYieldInput {
  reaction:          YieldReaction
  reactantFormula:   string    // must match a species in reaction.reactants
  productFormula:    string    // must match a species in reaction.products
  massReactant:      number    // in `unit`
  massProductActual: number    // in `unit`
  unit:              'kg' | 'g'
}

export interface ChainedYieldProblem {
  scenario: string
  steps:    ChainedStep[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sig(n: number, sf = 4): string {
  if (n === 0) return '0'
  return parseFloat(n.toPrecision(sf)).toString()
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildChainedYieldProblem(input: ChainedYieldInput): ChainedYieldProblem {
  const { reaction, reactantFormula, productFormula, massReactant, massProductActual, unit } = input

  const reactant = reaction.reactants.find(s => s.formula === reactantFormula)
  const product  = reaction.products.find(s  => s.formula === productFormula)
  if (!reactant) throw new Error(`Reactant '${reactantFormula}' not found in reaction`)
  if (!product)  throw new Error(`Product '${productFormula}' not found in reaction`)

  // Convert to grams for mole calculations
  const toGrams = unit === 'kg' ? 1000 : 1
  const massReactantG = massReactant * toGrams

  // Step 1: moles of reactant
  const molesReactant   = massReactantG / reactant.molarMass

  // Step 2: moles of product via mole ratio
  const molesProduct    = molesReactant * (product.coeff / reactant.coeff)

  // Step 3: theoretical mass of product (same unit as input)
  const theoreticalMassG = molesProduct * product.molarMass
  const theoreticalMass  = theoreticalMassG / toGrams

  // Step 4: percent yield
  const percentYield = (massProductActual / theoreticalMass) * 100

  const unitLabel = unit === 'kg' ? 'kg' : 'g'

  const scenario =
    `${reaction.equation}\n` +
    `${sig(massReactant)} ${unitLabel} of ${reactant.display} is used. ` +
    `The actual yield of ${product.display} is ${sig(massProductActual)} ${unitLabel}. ` +
    `Find the percent yield step by step.`

  const steps: ChainedStep[] = [
    {
      id: 'moles-reactant',
      prompt:
        `Convert the mass of ${reactant.display} to moles. ` +
        `(Molar mass of ${reactant.display} = ${sig(reactant.molarMass)} g/mol)`,
      expectedAnswer: molesReactant,
      answerUnit:     'mol',
      hint:           `Divide the mass in grams by the molar mass.`,
      explanation:
        `Dividing mass by molar mass converts grams to moles — this is a unit conversion, ` +
        `not a physical change. n = ${sig(massReactantG)} g ÷ ${sig(reactant.molarMass)} g/mol = ${sig(molesReactant)} mol`,
    },
    {
      id: 'moles-product',
      prompt:
        `Use the balanced equation to find moles of ${product.display}. ` +
        `(Mole ratio: ${product.coeff} mol ${product.display} per ${reactant.coeff} mol ${reactant.display})`,
      expectedAnswer: molesProduct,
      answerUnit:     'mol',
      hint:           `Multiply moles of reactant by the mole ratio from the balanced equation.`,
      explanation:
        `The balanced equation gives the stoichiometric ratio between reactant and product. ` +
        `n(${product.display}) = ${sig(molesReactant)} mol × (${product.coeff}/${reactant.coeff}) = ${sig(molesProduct)} mol`,
    },
    {
      id: 'theoretical-mass',
      prompt:
        `Calculate the theoretical (maximum possible) mass of ${product.display}. ` +
        `(Molar mass of ${product.display} = ${sig(product.molarMass)} g/mol)`,
      expectedAnswer: theoreticalMass,
      answerUnit:     unitLabel,
      hint:           `Multiply moles by molar mass; then convert to ${unitLabel} if needed.`,
      explanation:
        `Theoretical yield = moles of product × molar mass. ` +
        `m = ${sig(molesProduct)} mol × ${sig(product.molarMass)} g/mol${unit === 'kg' ? ' ÷ 1000' : ''} = ${sig(theoreticalMass)} ${unitLabel}. ` +
        `This is the most that could form if no product were lost.`,
    },
    {
      id: 'percent-yield',
      prompt:
        `Calculate the percent yield. ` +
        `(Actual yield = ${sig(massProductActual)} ${unitLabel}, theoretical yield = ${sig(theoreticalMass)} ${unitLabel})`,
      expectedAnswer: percentYield,
      answerUnit:     '%',
      hint:           `%Y = (actual / theoretical) × 100`,
      explanation:
        `Percent yield = (actual yield / theoretical yield) × 100 = ` +
        `(${sig(massProductActual)} / ${sig(theoreticalMass)}) × 100 = ${sig(percentYield)}%. ` +
        `Values below 100% are normal — real reactions lose product to side reactions, ` +
        `handling losses, and incomplete reaction.`,
    },
  ]

  return { scenario, steps }
}

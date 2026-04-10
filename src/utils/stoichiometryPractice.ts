// ── Types ─────────────────────────────────────────────────────────────────────

export type StoichProblemType =
  | 'mole_ratio'
  | 'mass_to_mass'
  | 'limiting_reagent'
  | 'theoretical_yield'
  | 'percent_yield'

export interface StoichProblem {
  type:         StoichProblemType
  equation:     string
  question:     string
  answer:       string   // stringified number OR formula text
  answerUnit:   string
  isTextAnswer: boolean
  steps:        string[]
  choices?:     { label: string; value: string }[]  // for multiple-choice problems
}

// ── Reaction data ─────────────────────────────────────────────────────────────

export interface Species {
  coeff:     number
  formula:   string   // plain, e.g. "CH4"
  display:   string   // Unicode subscripts, e.g. "CH₄"
  name:      string
  molarMass: number   // g/mol
}

export interface Reaction {
  name:      string
  reactants: Species[]
  products:  Species[]
  equation:  string
}

function side(arr: Species[]): string {
  return arr.map(s => (s.coeff > 1 ? s.coeff + ' ' : '') + s.display).join(' + ')
}
function makeEq(r: Omit<Reaction, 'equation'>): string {
  return `${side(r.reactants)} → ${side(r.products)}`
}

const RAW_REACTIONS: Omit<Reaction, 'equation'>[] = [
  {
    name: 'Combustion of methane',
    reactants: [
      { coeff: 1, formula: 'CH4',  display: 'CH₄',  name: 'methane',          molarMass: 16.043 },
      { coeff: 2, formula: 'O2',   display: 'O₂',   name: 'oxygen',           molarMass: 31.998 },
    ],
    products: [
      { coeff: 1, formula: 'CO2',  display: 'CO₂',  name: 'carbon dioxide',   molarMass: 44.009 },
      { coeff: 2, formula: 'H2O',  display: 'H₂O',  name: 'water',            molarMass: 18.015 },
    ],
  },
  {
    name: 'Synthesis of ammonia (Haber process)',
    reactants: [
      { coeff: 1, formula: 'N2',   display: 'N₂',   name: 'nitrogen',         molarMass: 28.014 },
      { coeff: 3, formula: 'H2',   display: 'H₂',   name: 'hydrogen',         molarMass:  2.016 },
    ],
    products: [
      { coeff: 2, formula: 'NH3',  display: 'NH₃',  name: 'ammonia',          molarMass: 17.031 },
    ],
  },
  {
    name: 'Decomposition of hydrogen peroxide',
    reactants: [
      { coeff: 2, formula: 'H2O2', display: 'H₂O₂', name: 'hydrogen peroxide', molarMass: 34.014 },
    ],
    products: [
      { coeff: 2, formula: 'H2O',  display: 'H₂O',  name: 'water',            molarMass: 18.015 },
      { coeff: 1, formula: 'O2',   display: 'O₂',   name: 'oxygen',           molarMass: 31.998 },
    ],
  },
  {
    name: 'Formation of aluminum chloride',
    reactants: [
      { coeff: 2, formula: 'Al',   display: 'Al',   name: 'aluminum',         molarMass: 26.982 },
      { coeff: 3, formula: 'Cl2',  display: 'Cl₂',  name: 'chlorine',         molarMass: 70.900 },
    ],
    products: [
      { coeff: 2, formula: 'AlCl3', display: 'AlCl₃', name: 'aluminum chloride', molarMass: 133.332 },
    ],
  },
  {
    name: 'Combustion of magnesium',
    reactants: [
      { coeff: 2, formula: 'Mg',   display: 'Mg',   name: 'magnesium',        molarMass: 24.305 },
      { coeff: 1, formula: 'O2',   display: 'O₂',   name: 'oxygen',           molarMass: 31.998 },
    ],
    products: [
      { coeff: 2, formula: 'MgO',  display: 'MgO',  name: 'magnesium oxide',  molarMass: 40.304 },
    ],
  },
  {
    name: 'Iron rusting (oxidation)',
    reactants: [
      { coeff: 4, formula: 'Fe',    display: 'Fe',    name: 'iron',            molarMass:  55.845 },
      { coeff: 3, formula: 'O2',    display: 'O₂',    name: 'oxygen',          molarMass:  31.998 },
    ],
    products: [
      { coeff: 2, formula: 'Fe2O3', display: 'Fe₂O₃', name: 'iron(III) oxide', molarMass: 159.687 },
    ],
  },
  {
    name: 'Neutralisation of hydrochloric acid',
    reactants: [
      { coeff: 1, formula: 'HCl',  display: 'HCl',  name: 'hydrochloric acid', molarMass: 36.458 },
      { coeff: 1, formula: 'NaOH', display: 'NaOH', name: 'sodium hydroxide',  molarMass: 39.997 },
    ],
    products: [
      { coeff: 1, formula: 'NaCl', display: 'NaCl', name: 'sodium chloride',   molarMass: 58.440 },
      { coeff: 1, formula: 'H2O',  display: 'H₂O',  name: 'water',             molarMass: 18.015 },
    ],
  },
  {
    name: 'Synthesis of water',
    reactants: [
      { coeff: 2, formula: 'H2',  display: 'H₂',  name: 'hydrogen', molarMass:  2.016 },
      { coeff: 1, formula: 'O2',  display: 'O₂',  name: 'oxygen',   molarMass: 31.998 },
    ],
    products: [
      { coeff: 2, formula: 'H2O', display: 'H₂O', name: 'water',    molarMass: 18.015 },
    ],
  },
  {
    name: 'Zinc reacting with sulfuric acid',
    reactants: [
      { coeff: 1, formula: 'Zn',   display: 'Zn',   name: 'zinc',             molarMass:  65.38 },
      { coeff: 1, formula: 'H2SO4', display: 'H₂SO₄', name: 'sulfuric acid',  molarMass:  98.072 },
    ],
    products: [
      { coeff: 1, formula: 'ZnSO4', display: 'ZnSO₄', name: 'zinc sulfate',   molarMass: 161.436 },
      { coeff: 1, formula: 'H2',    display: 'H₂',     name: 'hydrogen gas',  molarMass:   2.016 },
    ],
  },
  {
    name: 'Decomposition of calcium carbonate',
    reactants: [
      { coeff: 1, formula: 'CaCO3', display: 'CaCO₃', name: 'calcium carbonate', molarMass: 100.086 },
    ],
    products: [
      { coeff: 1, formula: 'CaO',  display: 'CaO',  name: 'calcium oxide',    molarMass: 56.077 },
      { coeff: 1, formula: 'CO2',  display: 'CO₂',  name: 'carbon dioxide',   molarMass: 44.009 },
    ],
  },
]

export const REACTIONS: Reaction[] = RAW_REACTIONS.map(r => ({ ...r, equation: makeEq(r) }))

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rnd(lo: number, hi: number) { return Math.floor(Math.random() * (hi - lo + 1)) + lo }
function sig(n: number, sf = 3): string { return parseFloat(n.toPrecision(sf)).toString() }

const MASS_POOLS = [2, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100]
const MOLE_POOLS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

function pickMass() { return pick(MASS_POOLS) }
function pickMoles() { return pick(MOLE_POOLS) }

// ── Normalise answer formula for checking ─────────────────────────────────────

function normalizeFormula(s: string): string {
  return s
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)])
    .replace(/\s+/g, '')
    .toLowerCase()
}

// ── Problem generators ────────────────────────────────────────────────────────

function allSpecies(r: Reaction): Species[] { return [...r.reactants, ...r.products] }

function pickTwo(arr: Species[]): [Species, Species] {
  const a = pick(arr)
  const rest = arr.filter(s => s !== a)
  return [a, pick(rest)]
}

// 1. Mole ratio ────────────────────────────────────────────────────────────────
function genMoleRatio(): StoichProblem {
  const rxn = pick(REACTIONS)
  const [from, to] = pickTwo(allSpecies(rxn))
  const givenMol = pickMoles()
  const answerMol = parseFloat(sig(givenMol * (to.coeff / from.coeff)))
  const toAction   = rxn.products.includes(to)   ? 'produced' : 'consumed'
  const fromAction = rxn.products.includes(from) ? 'is produced' : 'reacts'

  return {
    type: 'mole_ratio', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `How many moles of ${to.display} are ${toAction} when ${givenMol} mol of ${from.display} ${fromAction}?`,
    answer: String(answerMol), answerUnit: 'mol', isTextAnswer: false,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `Mole ratio: ${from.coeff} mol ${from.display} : ${to.coeff} mol ${to.display}`,
      `mol ${to.display} = ${givenMol} mol ${from.display} × (${to.coeff} / ${from.coeff})`,
      `= ${answerMol} mol ${to.display}`,
    ],
  }
}

// 2. Mass-to-mass ─────────────────────────────────────────────────────────────
function genMassToMass(): StoichProblem {
  const rxn = pick(REACTIONS)
  // from = a reactant, to = a product (most educational direction)
  const from = pick(rxn.reactants)
  const to   = pick(rxn.products)
  const givenMass = pickMass()

  const molFrom  = givenMass / from.molarMass
  const molTo    = molFrom * (to.coeff / from.coeff)
  const massTo   = molTo * to.molarMass
  const answerMass = parseFloat(sig(massTo))

  return {
    type: 'mass_to_mass', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `Calculate the mass of ${to.display} produced when ${givenMass} g of ${from.display} reacts completely (excess of other reagents).`,
    answer: String(answerMass), answerUnit: 'g', isTextAnswer: false,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `Step 1 — g ${from.display} → mol ${from.display}:  ${givenMass} g ÷ ${from.molarMass} g/mol = ${sig(molFrom)} mol`,
      `Step 2 — mol ${from.display} → mol ${to.display}:  ${sig(molFrom)} mol × (${to.coeff}/${from.coeff}) = ${sig(molTo)} mol`,
      `Step 3 — mol ${to.display} → g ${to.display}:  ${sig(molTo)} mol × ${to.molarMass} g/mol = ${answerMass} g`,
    ],
  }
}

// 3. Limiting reagent ─────────────────────────────────────────────────────────
function genLimitingReagent(): StoichProblem {
  // Only reactions with exactly 2 reactants
  const rxn = pick(REACTIONS.filter(r => r.reactants.length === 2))
  const [rA, rB] = rxn.reactants

  // Pick mass of A, derive mass of B that makes B limiting (then scale to nice numbers)
  const massA = pickMass()
  const molA  = massA / rA.molarMass
  // Stoichiometric amount of B for this A
  const stoichMolB = molA * (rB.coeff / rA.coeff)
  // Make B slightly less than stoichiometric (50–85%) so B is limiting
  const actualMolB = stoichMolB * (rnd(50, 85) / 100)
  const massB = parseFloat(sig(actualMolB * rB.molarMass))

  // Confirm limiting reagent
  const reqBForA = (massA / rA.molarMass) * (rB.coeff / rA.coeff) * rB.molarMass
  const isBlimiting = massB < reqBForA

  const limiting = isBlimiting ? rB : rA
  const excess   = isBlimiting ? rA : rB

  return {
    type: 'limiting_reagent', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `${massA} g of ${rA.display} is mixed with ${massB} g of ${rB.display}.\n` +
      `Which is the limiting reagent?`,
    answer: limiting.formula, answerUnit: '', isTextAnswer: true,
    choices: [
      { label: rA.display, value: rA.formula },
      { label: rB.display, value: rB.formula },
    ],
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `mol ${rA.display} = ${massA} g ÷ ${rA.molarMass} g/mol = ${sig(massA / rA.molarMass)} mol`,
      `mol ${rB.display} = ${massB} g ÷ ${rB.molarMass} g/mol = ${sig(massB / rB.molarMass)} mol`,
      `${rB.coeff} mol ${rB.display} needed per ${rA.coeff} mol ${rA.display}`,
      `${rA.display} would need ${sig(molA * (rB.coeff / rA.coeff))} mol ${rB.display}; only ${sig(massB / rB.molarMass)} mol available`,
      `→ ${limiting.display} is the limiting reagent (${excess.display} is in excess)`,
    ],
  }
}

// 4. Theoretical yield ────────────────────────────────────────────────────────
function genTheoreticalYield(): StoichProblem {
  const rxn = pick(REACTIONS.filter(r => r.reactants.length === 2))
  const [rA, rB] = rxn.reactants
  const product = pick(rxn.products)

  const massA = pickMass()
  const massB = parseFloat(sig(
    (massA / rA.molarMass) * (rB.coeff / rA.coeff) * rB.molarMass * (rnd(50, 85) / 100)
  ))

  const molA  = massA / rA.molarMass
  const molB  = massB / rB.molarMass
  // Find limiting reagent
  const limitedByA = molA * (product.coeff / rA.coeff) * product.molarMass
  const limitedByB = molB * (product.coeff / rB.coeff) * product.molarMass
  const isAlimiting = limitedByA <= limitedByB
  const limiting = isAlimiting ? rA : rB
  const limitingMass = isAlimiting ? massA : massB
  const limitingMol = limitingMass / limiting.molarMass
  const yieldMol  = limitingMol * (product.coeff / limiting.coeff)
  const yieldMass = parseFloat(sig(yieldMol * product.molarMass))

  return {
    type: 'theoretical_yield', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `${massA} g of ${rA.display} reacts with ${massB} g of ${rB.display}.\n` +
      `What is the theoretical yield of ${product.display} in grams?`,
    answer: String(yieldMass), answerUnit: 'g', isTextAnswer: false,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `mol ${rA.display} = ${massA} g ÷ ${rA.molarMass} g/mol = ${sig(molA)} mol`,
      `mol ${rB.display} = ${massB} g ÷ ${rB.molarMass} g/mol = ${sig(molB)} mol`,
      `Limiting reagent: ${limiting.display}`,
      `mol ${product.display} = ${sig(limitingMol)} mol ${limiting.display} × (${product.coeff}/${limiting.coeff}) = ${sig(yieldMol)} mol`,
      `Theoretical yield = ${sig(yieldMol)} mol × ${product.molarMass} g/mol = ${yieldMass} g`,
    ],
  }
}

// 5. Percent yield ─────────────────────────────────────────────────────────────
function genPercentYield(): StoichProblem {
  const rxn = pick(REACTIONS)
  const from = pick(rxn.reactants)
  const to   = pick(rxn.products)
  const givenMass = pickMass()

  const theoretical = parseFloat(sig(
    (givenMass / from.molarMass) * (to.coeff / from.coeff) * to.molarMass
  ))
  const pct    = rnd(58, 95)
  const actual = parseFloat(sig(theoretical * pct / 100))

  return {
    type: 'percent_yield', equation: rxn.equation,
    question: `Reaction: ${rxn.equation}\n` +
      `Starting from ${givenMass} g of ${from.display}, the theoretical yield of ${to.display} is ${theoretical} g.\n` +
      `If ${actual} g of ${to.display} was actually collected, what is the percent yield?`,
    answer: sig(pct, 3), answerUnit: '%', isTextAnswer: false,
    steps: [
      `Percent yield = (actual yield / theoretical yield) × 100`,
      `= (${actual} g / ${theoretical} g) × 100`,
      `= ${sig(actual / theoretical * 100, 3)} %`,
    ],
  }
}

// ── Public entry ──────────────────────────────────────────────────────────────

const TYPE_POOL: StoichProblemType[] = [
  'mole_ratio', 'mole_ratio',
  'mass_to_mass', 'mass_to_mass',
  'limiting_reagent',
  'theoretical_yield',
  'percent_yield',
]

export function generateStoichProblem(type?: StoichProblemType): StoichProblem {
  const t = type ?? pick(TYPE_POOL)
  if (t === 'mole_ratio')       return genMoleRatio()
  if (t === 'mass_to_mass')     return genMassToMass()
  if (t === 'limiting_reagent') return genLimitingReagent()
  if (t === 'theoretical_yield') return genTheoreticalYield()
  return genPercentYield()
}

export function checkStoichAnswer(input: string, problem: StoichProblem): boolean {
  if (!input.trim()) return false
  if (problem.isTextAnswer) {
    return normalizeFormula(input.trim()) === normalizeFormula(problem.answer)
  }
  const val = parseFloat(input)
  const ans = parseFloat(problem.answer)
  if (isNaN(val) || isNaN(ans)) return false
  if (ans === 0) return Math.abs(val) < 0.001
  return Math.abs((val - ans) / ans) <= 0.01
}

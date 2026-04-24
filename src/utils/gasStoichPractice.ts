// ── Types ─────────────────────────────────────────────────────────────────────

export type GasStandard = 'STP' | 'SATP' | 'custom'

export interface GasStoichProblem {
  equation:    string
  question:    string
  standard:    GasStandard
  Vm:          number | null  // null when standard === 'custom'
  T:           number         // K (273.15 for STP, 298.15 for SATP, random for custom)
  P:           number         // atm (1.0 for STP, 0.987 for SATP, random for custom)
  answer:      number
  answerUnit:  'g' | 'mol' | 'L'
  steps:       string[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const R_GAS = 0.082057  // L·atm/(mol·K)

// ── Molar volumes ─────────────────────────────────────────────────────────────

export const MOLAR_VOLUMES: Record<'STP' | 'SATP', { Vm: number; desc: string; T: number; P: number }> = {
  STP:  { Vm: 22.414, desc: '0 °C, 1 atm',    T: 273.15, P: 1.0   },
  SATP: { Vm: 24.789, desc: '25 °C, 100 kPa', T: 298.15, P: 0.987 },
}

// ── Reaction library ──────────────────────────────────────────────────────────

interface GasSpecies {
  formula:   string
  display:   string
  name:      string
  coeff:     number
  molarMass: number
  isGas:     boolean
}

interface GasReaction {
  name:      string
  equation:  string
  reactants: GasSpecies[]
  products:  GasSpecies[]
}

const GAS_REACTIONS: GasReaction[] = [
  {
    name: 'Combustion of methane',
    equation: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O',
    reactants: [
      { formula: 'CH4', display: 'CH₄', name: 'methane',        coeff: 1, molarMass: 16.043, isGas: true  },
      { formula: 'O2',  display: 'O₂',  name: 'oxygen',         coeff: 2, molarMass: 31.998, isGas: true  },
    ],
    products: [
      { formula: 'CO2', display: 'CO₂', name: 'carbon dioxide',  coeff: 1, molarMass: 44.009, isGas: true  },
      { formula: 'H2O', display: 'H₂O', name: 'water',           coeff: 2, molarMass: 18.015, isGas: false },
    ],
  },
  {
    name: 'Formation of water',
    equation: '2 H₂ + O₂ → 2 H₂O',
    reactants: [
      { formula: 'H2', display: 'H₂', name: 'hydrogen', coeff: 2, molarMass: 2.016,  isGas: true  },
      { formula: 'O2', display: 'O₂', name: 'oxygen',   coeff: 1, molarMass: 31.998, isGas: true  },
    ],
    products: [
      { formula: 'H2O', display: 'H₂O', name: 'water',  coeff: 2, molarMass: 18.015, isGas: false },
    ],
  },
  {
    name: 'Haber process (ammonia synthesis)',
    equation: 'N₂ + 3 H₂ → 2 NH₃',
    reactants: [
      { formula: 'N2', display: 'N₂', name: 'nitrogen', coeff: 1, molarMass: 28.014, isGas: true },
      { formula: 'H2', display: 'H₂', name: 'hydrogen', coeff: 3, molarMass: 2.016,  isGas: true },
    ],
    products: [
      { formula: 'NH3', display: 'NH₃', name: 'ammonia', coeff: 2, molarMass: 17.031, isGas: true },
    ],
  },
  {
    name: 'Combustion of carbon monoxide',
    equation: '2 CO + O₂ → 2 CO₂',
    reactants: [
      { formula: 'CO', display: 'CO', name: 'carbon monoxide', coeff: 2, molarMass: 28.010, isGas: true },
      { formula: 'O2', display: 'O₂', name: 'oxygen',         coeff: 1, molarMass: 31.998, isGas: true },
    ],
    products: [
      { formula: 'CO2', display: 'CO₂', name: 'carbon dioxide', coeff: 2, molarMass: 44.009, isGas: true },
    ],
  },
  {
    name: 'Combustion of propane',
    equation: 'C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O',
    reactants: [
      { formula: 'C3H8', display: 'C₃H₈', name: 'propane', coeff: 1, molarMass: 44.097, isGas: true  },
      { formula: 'O2',   display: 'O₂',   name: 'oxygen',  coeff: 5, molarMass: 31.998, isGas: true  },
    ],
    products: [
      { formula: 'CO2', display: 'CO₂', name: 'carbon dioxide', coeff: 3, molarMass: 44.009, isGas: true  },
      { formula: 'H2O', display: 'H₂O', name: 'water',          coeff: 4, molarMass: 18.015, isGas: false },
    ],
  },
  {
    name: 'Contact process (SO₃ formation)',
    equation: '2 SO₂ + O₂ → 2 SO₃',
    reactants: [
      { formula: 'SO2', display: 'SO₂', name: 'sulfur dioxide', coeff: 2, molarMass: 64.065, isGas: true },
      { formula: 'O2',  display: 'O₂',  name: 'oxygen',         coeff: 1, molarMass: 31.998, isGas: true },
    ],
    products: [
      { formula: 'SO3', display: 'SO₃', name: 'sulfur trioxide', coeff: 2, molarMass: 80.064, isGas: true },
    ],
  },
]

// Reactions with solid/liquid reactants that produce gas — used for custom T/P problems
const SOLID_GAS_REACTIONS: GasReaction[] = [
  {
    name: 'Sodium azide decomposition (airbag)',
    equation: '2 NaN₃(s) → 2 Na(s) + 3 N₂(g)',
    reactants: [
      { formula: 'NaN3', display: 'NaN₃', name: 'sodium azide', coeff: 2, molarMass: 65.010, isGas: false },
    ],
    products: [
      { formula: 'Na', display: 'Na', name: 'sodium',   coeff: 2, molarMass: 22.990, isGas: false },
      { formula: 'N2', display: 'N₂', name: 'nitrogen', coeff: 3, molarMass: 28.014, isGas: true  },
    ],
  },
  {
    name: 'Calcium carbonate decomposition',
    equation: 'CaCO₃(s) → CaO(s) + CO₂(g)',
    reactants: [
      { formula: 'CaCO3', display: 'CaCO₃', name: 'calcium carbonate', coeff: 1, molarMass: 100.087, isGas: false },
    ],
    products: [
      { formula: 'CaO', display: 'CaO', name: 'calcium oxide',  coeff: 1, molarMass: 56.077, isGas: false },
      { formula: 'CO2', display: 'CO₂', name: 'carbon dioxide', coeff: 1, molarMass: 44.009, isGas: true  },
    ],
  },
  {
    name: 'Potassium chlorate decomposition',
    equation: '2 KClO₃(s) → 2 KCl(s) + 3 O₂(g)',
    reactants: [
      { formula: 'KClO3', display: 'KClO₃', name: 'potassium chlorate', coeff: 2, molarMass: 122.548, isGas: false },
    ],
    products: [
      { formula: 'KCl', display: 'KCl', name: 'potassium chloride', coeff: 2, molarMass: 74.551, isGas: false },
      { formula: 'O2',  display: 'O₂',  name: 'oxygen',             coeff: 3, molarMass: 31.998, isGas: true  },
    ],
  },
  {
    name: 'Zinc with hydrochloric acid',
    equation: 'Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)',
    reactants: [
      { formula: 'Zn', display: 'Zn', name: 'zinc', coeff: 1, molarMass: 65.38, isGas: false },
    ],
    products: [
      { formula: 'H2', display: 'H₂', name: 'hydrogen', coeff: 1, molarMass: 2.016, isGas: true },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sig(x: number, n = 4): string {
  if (x === 0) return '0'
  return parseFloat(x.toPrecision(n)).toString()
}

// Nice mole amounts → compute corresponding volumes per standard in the generator
const NICE_MOLES = [0.250, 0.500, 0.750, 1.00, 1.50, 2.00, 2.50]

const CUSTOM_T_VALUES = [300, 325, 350, 375, 400, 450, 500]  // K
const CUSTOM_P_VALUES = [0.500, 0.750, 1.000, 1.250, 1.500, 2.000]  // atm

// ── Generator ─────────────────────────────────────────────────────────────────

function generateCustomProblem(): GasStoichProblem {
  const rxn = pick(SOLID_GAS_REACTIONS)
  const T   = pick(CUSTOM_T_VALUES)
  const P   = pick(CUSTOM_P_VALUES)

  const solidReactants = rxn.reactants.filter(s => !s.isGas)
  const givenSp = pick(solidReactants)
  const niceMol = pick(NICE_MOLES)
  const givenMass = parseFloat((niceMol * givenSp.molarMass).toPrecision(4))
  const givenMol  = givenMass / givenSp.molarMass

  const gasProducts = rxn.products.filter(s => s.isGas)
  const targetSp = pick(gasProducts)

  const targetMol = givenMol * (targetSp.coeff / givenSp.coeff)
  const answer    = parseFloat((targetMol * R_GAS * T / P).toPrecision(4))

  const TdegC = parseFloat((T - 273.15).toPrecision(4))
  const desc  = `${TdegC} °C, ${P} atm`

  const question =
    `${givenMass} g of ${givenSp.name} (${givenSp.display}) decomposes completely. ` +
    `Using the reaction ${rxn.equation}, what volume (in L) of ${targetSp.name} (${targetSp.display}) ` +
    `is produced at ${desc}?`

  const steps: string[] = [
    `Balanced equation: ${rxn.equation}`,
    `Convert mass to moles: n = m/M = ${givenMass} g ÷ ${givenSp.molarMass} g/mol = ${sig(givenMol, 4)} mol ${givenSp.display}`,
    `Mole ratio (${targetSp.display} : ${givenSp.display}) = ${targetSp.coeff} : ${givenSp.coeff}`,
    `n(${targetSp.display}) = ${sig(givenMol, 4)} mol × (${targetSp.coeff}/${givenSp.coeff}) = ${sig(targetMol, 4)} mol`,
    `V = nRT/P = ${sig(targetMol, 4)} mol × ${R_GAS} L·atm/(mol·K) × ${T} K ÷ ${P} atm = ${sig(answer, 4)} L`,
  ]

  return { equation: rxn.equation, question, standard: 'custom', Vm: null, T, P, answer, answerUnit: 'L', steps }
}

export function generateGasStoichProblem(standardFilter?: GasStandard): GasStoichProblem {
  if (standardFilter === 'custom') return generateCustomProblem()

  const rxn      = pick(GAS_REACTIONS)
  const standard = standardFilter ?? pick<'STP' | 'SATP'>(['STP', 'SATP'])
  const { Vm, desc, T, P } = MOLAR_VOLUMES[standard]

  const allSpecies = [...rxn.reactants, ...rxn.products]
  const gasSpecies = allSpecies.filter(s => s.isGas)

  // Pick a gas species as the "given" (volume in L)
  const givenSp  = pick(gasSpecies)
  const niceMol  = pick(NICE_MOLES)
  const givenVol = parseFloat((niceMol * Vm).toPrecision(4))
  const givenMol = givenVol / Vm   // = niceMol, but computed from vol for accuracy

  // Pick a different species as the target
  const otherSpecies = allSpecies.filter(s => s.formula !== givenSp.formula)
  const targetSp  = pick(otherSpecies)
  const answerUnit = pick<'g' | 'mol'>(['g', 'mol'])

  const targetMol = givenMol * (targetSp.coeff / givenSp.coeff)
  const answer    = answerUnit === 'mol' ? targetMol : targetMol * targetSp.molarMass

  const question = answerUnit === 'mol'
    ? `${givenVol} L of ${givenSp.name} (${givenSp.display}) is measured at ${standard} (${desc}). ` +
      `Using the reaction ${rxn.equation}, how many moles of ${targetSp.name} (${targetSp.display}) are produced or consumed?`
    : `${givenVol} L of ${givenSp.name} (${givenSp.display}) is measured at ${standard} (${desc}). ` +
      `Using the reaction ${rxn.equation}, how many grams of ${targetSp.name} (${targetSp.display}) are produced or consumed?`

  const steps: string[] = [
    `Balanced equation: ${rxn.equation}`,
    `Convert volume to moles: n = V / Vm = ${givenVol} L ÷ ${Vm} L/mol = ${sig(givenMol, 4)} mol ${givenSp.display}`,
    `Mole ratio (${targetSp.display} : ${givenSp.display}) = ${targetSp.coeff} : ${givenSp.coeff}`,
    `n(${targetSp.display}) = ${sig(givenMol, 4)} mol × (${targetSp.coeff}/${givenSp.coeff}) = ${sig(targetMol, 4)} mol`,
  ]

  if (answerUnit === 'g') {
    steps.push(
      `m(${targetSp.display}) = ${sig(targetMol, 4)} mol × ${targetSp.molarMass} g/mol = ${sig(answer, 4)} g`
    )
  }

  return { equation: rxn.equation, question, standard, Vm, T, P, answer, answerUnit, steps }
}

export function checkGasStoichAnswer(problem: GasStoichProblem, userInput: string): boolean {
  const val = parseFloat(userInput)
  if (isNaN(val)) return false
  const ans = problem.answer
  if (ans === 0) return Math.abs(val) < 0.001
  return Math.abs((val - ans) / ans) <= 0.01   // ±1% relative tolerance
}

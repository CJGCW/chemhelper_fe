// ── Types ─────────────────────────────────────────────────────────────────────

export type GasStandard = 'STP' | 'SATP'

export interface GasStoichProblem {
  equation:    string
  question:    string
  standard:    GasStandard
  Vm:          number     // molar volume used (22.414 or 24.789 L/mol)
  answer:      number
  answerUnit:  'g' | 'mol' | 'L'
  steps:       string[]
}

// ── Molar volumes ─────────────────────────────────────────────────────────────

export const MOLAR_VOLUMES: Record<GasStandard, { Vm: number; desc: string }> = {
  STP:  { Vm: 22.414, desc: '0 °C, 1 atm'    },
  SATP: { Vm: 24.789, desc: '25 °C, 100 kPa' },
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

// ── Generator ─────────────────────────────────────────────────────────────────

export function generateGasStoichProblem(standardFilter?: GasStandard): GasStoichProblem {
  const rxn      = pick(GAS_REACTIONS)
  const standard = standardFilter ?? pick<GasStandard>(['STP', 'SATP'])
  const { Vm, desc } = MOLAR_VOLUMES[standard]

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

  return { equation: rxn.equation, question, standard, Vm, answer, answerUnit, steps }
}

export function checkGasStoichAnswer(problem: GasStoichProblem, userInput: string): boolean {
  const val = parseFloat(userInput)
  if (isNaN(val)) return false
  const ans = problem.answer
  if (ans === 0) return Math.abs(val) < 0.001
  return Math.abs((val - ans) / ans) <= 0.01   // ±1% relative tolerance
}

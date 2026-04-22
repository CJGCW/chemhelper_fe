// ── Types ─────────────────────────────────────────────────────────────────────

export interface EnthalpySpecies {
  coeff:   number
  formula: string
  state:   string
  dhf:     number    // kJ/mol
}

export interface EnthalpyProblem {
  description: string    // short reaction description, e.g. "combustion of methane"
  equation:    string    // formatted balanced equation for display
  reactants:   EnthalpySpecies[]
  products:    EnthalpySpecies[]
  answer:      number    // kJ
  answerUnit:  'kJ'
  steps:       string[]
}

// ── Reaction database ─────────────────────────────────────────────────────────

function sp(coeff: number, formula: string, state: string, dhf: number): EnthalpySpecies {
  return { coeff, formula, state, dhf }
}

function fmtSide(species: EnthalpySpecies[]): string {
  return species.map(s => {
    const c = s.coeff === 1 ? '' : `${s.coeff} `
    return `${c}${s.formula}(${s.state})`
  }).join(' + ')
}

import { calcEnthalpyOfReaction } from '../chem/thermo'

function calcDH(reactants: EnthalpySpecies[], products: EnthalpySpecies[]): number {
  return calcEnthalpyOfReaction(reactants, products)
}

function buildSteps(reactants: EnthalpySpecies[], products: EnthalpySpecies[], answer: number): string[] {
  const sumParts = (arr: EnthalpySpecies[]) =>
    arr.map(s => `${s.coeff === 1 ? '' : s.coeff + '×'}(${s.dhf})`).join(' + ')
  const sumVal = (arr: EnthalpySpecies[]) =>
    arr.reduce((t, s) => t + s.coeff * s.dhf, 0)

  const pStr  = sumParts(products)
  const rStr  = sumParts(reactants)
  const pSum  = parseFloat(sumVal(products).toFixed(1))
  const rSum  = parseFloat(sumVal(reactants).toFixed(1))

  return [
    'ΔHrxn = ΣΔHf°(products) − ΣΔHf°(reactants)',
    `ΔHrxn = [${pStr}] − [${rStr}]`,
    `ΔHrxn = (${pSum}) − (${rSum})`,
    `ΔHrxn = ${answer} kJ`,
  ]
}

function make(
  description: string,
  reactants: EnthalpySpecies[],
  products: EnthalpySpecies[]
): EnthalpyProblem {
  const answer = calcDH(reactants, products)
  return {
    description,
    equation: `${fmtSide(reactants)} → ${fmtSide(products)}`,
    reactants,
    products,
    answer,
    answerUnit: 'kJ',
    steps: buildSteps(reactants, products, answer),
  }
}

const REACTIONS: EnthalpyProblem[] = [
  // Combustion reactions
  make('combustion of methane',
    [sp(1, 'CH4',    'g',  -74.8), sp(2, 'O2', 'g', 0)],
    [sp(1, 'CO2',    'g', -393.5), sp(2, 'H2O', 'l', -285.8)]
  ),
  make('combustion of propane',
    [sp(1, 'C3H8',   'g', -103.8), sp(5, 'O2', 'g', 0)],
    [sp(3, 'CO2',    'g', -393.5), sp(4, 'H2O', 'l', -285.8)]
  ),
  make('combustion of ethanol',
    [sp(1, 'C2H5OH', 'l', -277.7), sp(3, 'O2', 'g', 0)],
    [sp(2, 'CO2',    'g', -393.5), sp(3, 'H2O', 'l', -285.8)]
  ),
  make('combustion of methanol',
    [sp(2, 'CH3OH',  'l', -238.7), sp(3, 'O2', 'g', 0)],
    [sp(2, 'CO2',    'g', -393.5), sp(4, 'H2O', 'l', -285.8)]
  ),
  make('combustion of acetylene',
    [sp(2, 'C2H2',   'g',  226.7), sp(5, 'O2', 'g', 0)],
    [sp(4, 'CO2',    'g', -393.5), sp(2, 'H2O', 'l', -285.8)]
  ),
  make('combustion of carbon monoxide',
    [sp(2, 'CO',     'g', -110.5), sp(1, 'O2', 'g', 0)],
    [sp(2, 'CO2',    'g', -393.5)]
  ),
  make('combustion of glucose',
    [sp(1, 'C6H12O6', 's', -1274.5), sp(6, 'O2', 'g', 0)],
    [sp(6, 'CO2',    'g', -393.5), sp(6, 'H2O', 'l', -285.8)]
  ),
  // Formation reactions
  make('formation of water',
    [sp(2, 'H2',     'g',   0), sp(1, 'O2', 'g', 0)],
    [sp(2, 'H2O',    'l', -285.8)]
  ),
  make('formation of ammonia (Haber process)',
    [sp(1, 'N2',     'g',   0), sp(3, 'H2', 'g', 0)],
    [sp(2, 'NH3',    'g',  -46.1)]
  ),
  make('formation of sulfur trioxide',
    [sp(2, 'SO2',    'g', -296.8), sp(1, 'O2', 'g', 0)],
    [sp(2, 'SO3',    'g', -395.7)]
  ),
  make('formation of nitric oxide',
    [sp(1, 'N2',     'g',   0), sp(1, 'O2', 'g', 0)],
    [sp(2, 'NO',     'g',  90.3)]
  ),
  make('formation of nitrogen dioxide from NO',
    [sp(2, 'NO',     'g',  90.3), sp(1, 'O2', 'g', 0)],
    [sp(2, 'NO2',    'g',  33.2)]
  ),
  // Decomposition
  make('decomposition of calcium carbonate',
    [sp(1, 'CaCO3',  's', -1207.6)],
    [sp(1, 'CaO',    's',  -635.1), sp(1, 'CO2', 'g', -393.5)]
  ),
  make('decomposition of water',
    [sp(2, 'H2O',    'l', -285.8)],
    [sp(2, 'H2',     'g',   0), sp(1, 'O2', 'g', 0)]
  ),
  // Redox / metallurgical
  make('thermite reaction',
    [sp(2, 'Al',     's',   0), sp(1, 'Fe2O3', 's', -824.2)],
    [sp(1, 'Al2O3',  's', -1675.7), sp(2, 'Fe', 's', 0)]
  ),
  make('oxidation of iron to Fe2O3',
    [sp(4, 'Fe',     's',   0), sp(3, 'O2', 'g', 0)],
    [sp(2, 'Fe2O3',  's',  -824.2)]
  ),
  make('oxidation of copper',
    [sp(2, 'Cu',     's',   0), sp(1, 'O2', 'g', 0)],
    [sp(2, 'CuO',    's',  -157.3)]
  ),
  // Gas-phase
  make('water-gas shift reaction',
    [sp(1, 'CO',     'g', -110.5), sp(1, 'H2O', 'g', -241.8)],
    [sp(1, 'CO2',    'g', -393.5), sp(1, 'H2', 'g', 0)]
  ),
  make('slaking of lime',
    [sp(1, 'CaO',    's',  -635.1), sp(1, 'H2O', 'l', -285.8)],
    [sp(1, 'Ca(OH)2', 's', -986.1)]
  ),
  make('formation of hydrogen chloride',
    [sp(1, 'H2',     'g',   0), sp(1, 'Cl2', 'g', 0)],
    [sp(2, 'HCl',    'g',  -92.3)]
  ),
]

// ── Public API ────────────────────────────────────────────────────────────────

export function genEnthalpyProblem(): EnthalpyProblem {
  return REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
}

export function checkEnthalpyAnswer(problem: EnthalpyProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 0.5
  return Math.abs((val - problem.answer) / problem.answer) <= 0.02
}

// ── Utility used by calculator ────────────────────────────────────────────────

export function computeDHrxn(
  reactants: { coeff: number; dhf: number }[],
  products:  { coeff: number; dhf: number }[]
): number {
  return calcEnthalpyOfReaction(reactants, products)
}

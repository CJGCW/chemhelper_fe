// ── Types ─────────────────────────────────────────────────────────────────────

export type PercCompType = 'percent_of_element' | 'mass_from_percent'

export interface PercCompProblem {
  type:       PercCompType
  question:   string
  answer:     number
  answerUnit: string
  steps:      string[]
}

// ── Compound library ──────────────────────────────────────────────────────────

interface ElementEntry {
  symbol:      string
  name:        string
  count:       number
  atomicWeight: number
  percent:     number   // mass percent, precomputed
}

interface PercCompound {
  formula:   string   // ASCII, e.g. "H2O"
  display:   string   // Unicode, e.g. "H₂O"
  name:      string
  molarMass: number
  elements:  ElementEntry[]
}

// Atomic weights (IUPAC 2021 standard)
const AW: Record<string, number> = {
  H: 1.008, C: 12.011, N: 14.007, O: 15.999,
  Na: 22.990, Mg: 24.305, S: 32.06, Cl: 35.453,
  K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546,
}

function buildElements(entries: [string, number][]): ElementEntry[] {
  let total = 0
  const rows = entries.map(([symbol, count]) => {
    const aw = AW[symbol]
    const contribution = aw * count
    total += contribution
    return { symbol, name: ELEMENT_NAMES[symbol] ?? symbol, count, atomicWeight: aw, contribution }
  })
  return rows.map(r => ({ ...r, percent: (r.contribution / total) * 100 }))
}

const ELEMENT_NAMES: Record<string, string> = {
  H: 'hydrogen', C: 'carbon', N: 'nitrogen', O: 'oxygen',
  Na: 'sodium', Mg: 'magnesium', S: 'sulfur', Cl: 'chlorine',
  K: 'potassium', Ca: 'calcium', Fe: 'iron', Cu: 'copper',
}

function molarMass(entries: [string, number][]): number {
  return entries.reduce((sum, [sym, cnt]) => sum + AW[sym] * cnt, 0)
}

const COMPOUND_NAMES: Record<string, string> = {
  H2O:       'water',
  NaCl:      'sodium chloride',
  CO2:       'carbon dioxide',
  NH3:       'ammonia',
  CaCO3:     'calcium carbonate',
  H2SO4:     'sulfuric acid',
  NaOH:      'sodium hydroxide',
  CH4:       'methane',
  C6H12O6:   'glucose',
  Fe2O3:     'iron(III) oxide',
  MgO:       'magnesium oxide',
  CuSO4:     'copper(II) sulfate',
  KNO3:      'potassium nitrate',
  HCl:       'hydrochloric acid',
  C12H22O11: 'sucrose',
  MgCl2:     'magnesium chloride',
}

const RAW: [string, string, [string, number][]][] = [
  ['H2O',      'H₂O',          [['H', 2], ['O', 1]]],
  ['NaCl',     'NaCl',         [['Na', 1], ['Cl', 1]]],
  ['CO2',      'CO₂',          [['C', 1], ['O', 2]]],
  ['NH3',      'NH₃',          [['N', 1], ['H', 3]]],
  ['CaCO3',    'CaCO₃',        [['Ca', 1], ['C', 1], ['O', 3]]],
  ['H2SO4',    'H₂SO₄',        [['H', 2], ['S', 1], ['O', 4]]],
  ['NaOH',     'NaOH',         [['Na', 1], ['O', 1], ['H', 1]]],
  ['CH4',      'CH₄',          [['C', 1], ['H', 4]]],
  ['C6H12O6',  'C₆H₁₂O₆',     [['C', 6], ['H', 12], ['O', 6]]],
  ['Fe2O3',    'Fe₂O₃',        [['Fe', 2], ['O', 3]]],
  ['MgO',      'MgO',          [['Mg', 1], ['O', 1]]],
  ['CuSO4',    'CuSO₄',        [['Cu', 1], ['S', 1], ['O', 4]]],
  ['KNO3',     'KNO₃',         [['K', 1], ['N', 1], ['O', 3]]],
  ['HCl',      'HCl',          [['H', 1], ['Cl', 1]]],
  ['C12H22O11','C₁₂H₂₂O₁₁',  [['C', 12], ['H', 22], ['O', 11]]],
  ['MgCl2',    'MgCl₂',        [['Mg', 1], ['Cl', 2]]],
]

export const COMPOUNDS: PercCompound[] = RAW.map(([formula, display, entries]) => ({
  formula,
  display,
  name: COMPOUND_NAMES[formula] ?? formula,
  molarMass: molarMass(entries),
  elements: buildElements(entries),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sig(x: number, n = 4): string {
  if (x === 0) return '0'
  return parseFloat(x.toPrecision(n)).toString()
}

const NICE_MASSES_G = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 500]

// ── Generators ────────────────────────────────────────────────────────────────

function genPercentOfElement(): PercCompProblem {
  const compound = pick(COMPOUNDS)
  const el       = pick(compound.elements)

  const question = `What is the mass percent of ${el.name} (${el.symbol}) in ${compound.name} (${compound.display})?`

  const steps = [
    `Molar mass of ${compound.display}: ${sig(compound.molarMass, 5)} g/mol`,
    `Mass of ${el.symbol} per mole: ${el.count} × ${el.atomicWeight.toFixed(3)} g/mol = ${sig(el.count * el.atomicWeight, 4)} g/mol`,
    `Mass percent = (${sig(el.count * el.atomicWeight, 4)} / ${sig(compound.molarMass, 5)}) × 100 = ${sig(el.percent, 4)}%`,
  ]

  return {
    type: 'percent_of_element',
    question,
    answer: el.percent,
    answerUnit: '%',
    steps,
  }
}

function genMassFromPercent(): PercCompProblem {
  const compound = pick(COMPOUNDS)
  const el       = pick(compound.elements)
  const sampleG  = pick(NICE_MASSES_G)
  const massEl   = sampleG * (el.percent / 100)

  const question =
    `A sample of ${compound.name} (${compound.display}) has a mass of ${sampleG} g. ` +
    `How many grams of ${el.name} (${el.symbol}) does it contain?`

  const steps = [
    `Mass percent of ${el.symbol} in ${compound.display}: ${sig(el.percent, 4)}%`,
    `Mass of ${el.symbol} = ${sampleG} g × (${sig(el.percent, 4)} / 100)`,
    `= ${sig(massEl, 4)} g`,
  ]

  return {
    type: 'mass_from_percent',
    question,
    answer: massEl,
    answerUnit: 'g',
    steps,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generatePercCompProblem(type?: PercCompType): PercCompProblem {
  const t = type ?? pick<PercCompType>(['percent_of_element', 'mass_from_percent'])
  return t === 'percent_of_element' ? genPercentOfElement() : genMassFromPercent()
}

export function checkPercCompAnswer(problem: PercCompProblem, userInput: string): boolean {
  const val = parseFloat(userInput)
  if (isNaN(val)) return false
  const ans = problem.answer
  if (ans === 0) return Math.abs(val) < 0.001
  return Math.abs((val - ans) / ans) <= 0.01   // ±1% relative tolerance
}

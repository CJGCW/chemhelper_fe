import { generateReaction, type Reaction } from './stoichiometryPractice'

export type AdvPctSubtype = 'find_percent' | 'find_actual'

export interface AdvPctProblem {
  subtype:     AdvPctSubtype
  equation:    string
  question:    string
  answer:      string
  answerUnit:  string
  steps:       string[]
}

function sig(n: number, sf = 3): string { return n.toPrecision(sf) }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
const MASSES  = [5, 8, 10, 12, 15, 20, 25, 30, 40, 50]
const PCT_POOL = [55, 60, 65, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95]

function rxnWithProducts(): Reaction {
  let r: Reaction
  do { r = generateReaction() } while (r.products.length === 0)
  return r
}

function genProblem(subtype: AdvPctSubtype): AdvPctProblem {
  const rxn  = rxnWithProducts()
  const lr   = pick(rxn.reactants)
  const prod = pick(rxn.products)
  const massLR = pick(MASSES)

  const molLR   = massLR / lr.molarMass
  const molProd = molLR * (prod.coeff / lr.coeff)
  const ty      = parseFloat(sig(molProd * prod.molarMass))

  const tySteps = [
    `Balanced equation: ${rxn.equation}`,
    `mol ${lr.display} = ${massLR} g ÷ ${lr.molarMass} g/mol = ${sig(molLR)} mol`,
    `mol ${prod.display} = ${sig(molLR)} mol × (${prod.coeff}/${lr.coeff}) = ${sig(molProd)} mol`,
    `Theoretical yield = ${sig(molProd)} mol × ${prod.molarMass} g/mol = ${ty} g`,
  ]

  const pct    = pick(PCT_POOL)
  const actual = parseFloat(sig(ty * pct / 100))

  if (subtype === 'find_percent') {
    return {
      subtype,
      equation: rxn.equation,
      question:
        `${massLR} g of ${lr.display} reacts completely.\n` +
        `${actual} g of ${prod.display} was actually collected.\n` +
        `What is the percent yield?`,
      answer:     sig(pct, 3),
      answerUnit: '%',
      steps: [
        ...tySteps,
        `% yield = (actual / theoretical) × 100`,
        `% yield = (${actual} g / ${ty} g) × 100 = ${sig(pct, 3)}%`,
      ],
    }
  }

  return {
    subtype,
    equation: rxn.equation,
    question:
      `${massLR} g of ${lr.display} reacts completely.\n` +
      `The percent yield is ${pct}%.\n` +
      `What mass of ${prod.display} was actually collected?`,
    answer:     sig(actual),
    answerUnit: 'g',
    steps: [
      ...tySteps,
      `Actual yield = theoretical × (% yield / 100)`,
      `Actual yield = ${ty} g × (${pct} / 100) = ${sig(actual)} g`,
    ],
  }
}

export function genAdvPctProblem(subtype?: AdvPctSubtype): AdvPctProblem {
  const t = subtype ?? (Math.random() < 0.5 ? 'find_percent' : 'find_actual')
  return genProblem(t)
}

export function checkAdvPctAnswer(raw: string, problem: AdvPctProblem): boolean {
  const val = parseFloat(raw)
  const ans = parseFloat(problem.answer)
  if (isNaN(val) || isNaN(ans) || ans === 0) return false
  return Math.abs((val - ans) / ans) <= 0.02
}

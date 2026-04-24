import { ACID_BASE_PAIRS } from '../data/acidBasePairs'
import { REDOX_PAIRS } from '../data/redoxTitrationPairs'
import { solveAcidBaseTitration, solveRedoxTitration } from '../chem/solutions'

const NICE_VOLUMES    = [10.0, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0]
const NICE_MOLARITIES = [0.100, 0.150, 0.200, 0.250, 0.300, 0.500]
const NICE_MOL_LOW    = [0.0200, 0.0300, 0.0400, 0.0500, 0.100, 0.150]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface TitrationProblem {
  mode:       'acid-base' | 'redox'
  scenario:   string
  answer:     number
  answerUnit: 'mL' | 'M'
  steps:      string[]
  tolerance:  number
}

export function generateAcidBasePracticeProblem(): TitrationProblem {
  const pair      = pick(ACID_BASE_PAIRS)
  const givenSide = pick(['acid', 'base'] as const)
  const solveFor  = pick(['volume', 'molarity'] as const)
  const givenVol  = pick(NICE_VOLUMES)
  const givenMol  = pick(NICE_MOLARITIES)
  const otherKnown = pick(solveFor === 'volume' ? NICE_MOLARITIES : NICE_VOLUMES)

  const acidPerBase = pair.base.equivalents / pair.acid.equivalents
  const solvingSide = givenSide === 'acid' ? 'base' : 'acid'
  const givenDisplay   = givenSide === 'acid' ? pair.acid.formula : pair.base.formula
  const solvingDisplay = givenSide === 'acid' ? pair.base.formula : pair.acid.formula

  const result = solveAcidBaseTitration(
    acidPerBase, pair.equation, pair.acid.formula, pair.base.formula,
    { side: givenSide, volumeML: givenVol, molarity: givenMol },
    { side: solvingSide, unknown: solveFor, known: otherKnown },
  )

  let scenario: string
  if (solveFor === 'volume') {
    scenario =
      `What volume of ${otherKnown.toFixed(3)} M ${solvingDisplay} is needed to completely neutralize ` +
      `${givenVol.toFixed(1)} mL of ${givenMol.toFixed(3)} M ${givenDisplay}?`
  } else {
    scenario =
      `A ${givenVol.toFixed(1)} mL sample of ${givenDisplay} (${givenMol.toFixed(3)} M) is titrated to ` +
      `the equivalence point using ${otherKnown.toFixed(1)} mL of ${solvingDisplay} solution. ` +
      `What is the molarity of ${solvingDisplay}?`
  }

  return { mode: 'acid-base', scenario, answer: result.answer, answerUnit: result.answerUnit, steps: result.steps, tolerance: 0.01 }
}

export function generateRedoxPracticeProblem(): TitrationProblem {
  const pair      = pick(REDOX_PAIRS)
  const givenSide = pick(['oxidizer', 'reducer'] as const)
  const solveFor  = pick(['volume', 'molarity'] as const)
  const givenVol  = pick(NICE_VOLUMES)
  const givenMol  = pick(NICE_MOL_LOW)
  const otherKnown = pick(solveFor === 'volume' ? NICE_MOL_LOW : NICE_VOLUMES)

  const solvingSide  = givenSide === 'oxidizer' ? 'reducer' : 'oxidizer'
  const givenDisplay   = givenSide === 'oxidizer' ? pair.oxidizer.formula : pair.reducer.formula
  const solvingDisplay = givenSide === 'oxidizer' ? pair.reducer.formula  : pair.oxidizer.formula

  const result = solveRedoxTitration(
    pair.oxidizer.electronsPerMole, pair.reducer.electronsPerMole,
    pair.equation, pair.oxidizer.formula, pair.reducer.formula,
    { side: givenSide, volumeML: givenVol, molarity: givenMol },
    { side: solvingSide, unknown: solveFor, known: otherKnown },
  )

  let scenario: string
  if (solveFor === 'volume') {
    scenario =
      `How many mL of ${otherKnown.toFixed(4)} M ${solvingDisplay} are needed to react completely with ` +
      `${givenVol.toFixed(2)} mL of ${givenMol.toFixed(4)} M ${givenDisplay} in ${pair.conditions} solution? ` +
      `(${pair.equation})`
  } else {
    scenario =
      `${givenVol.toFixed(2)} mL of ${givenDisplay} (${givenMol.toFixed(4)} M) reacts with ` +
      `${otherKnown.toFixed(2)} mL of ${solvingDisplay} in ${pair.conditions} solution. ` +
      `Find the molarity of ${solvingDisplay}. (${pair.equation})`
  }

  return { mode: 'redox', scenario, answer: result.answer, answerUnit: result.answerUnit, steps: result.steps, tolerance: 0.01 }
}

import { TWO_ISOTOPE_ELEMENTS } from '../data/twoIsotopeElements'
import { weightedAverageMass, reverseIsotopeAbundance } from '../chem/isotope'

export interface IsotopeProblem {
  type:       'forward' | 'reverse'
  question:   string
  answer:     number
  answerUnit: string
  steps:      string[]
  tolerance:  number
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sup(n: number): string {
  return String(n).replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
}

function generateForwardProblem(elIdx?: number) {
  const el = elIdx !== undefined ? TWO_ISOTOPE_ELEMENTS[elIdx] : pick(TWO_ISOTOPE_ELEMENTS)
  const sol = weightedAverageMass([
    { mass: el.iso1.mass, abundance: el.iso1.abundance },
    { mass: el.iso2.mass, abundance: el.iso2.abundance },
  ])

  return {
    type: 'forward' as const,
    question:
      `${el.name} (${el.symbol}) has two stable isotopes:\n` +
      `${sup(el.iso1.A)}${el.symbol}: mass = ${el.iso1.mass} amu, abundance = ${el.iso1.abundance}%\n` +
      `${sup(el.iso2.A)}${el.symbol}: mass = ${el.iso2.mass} amu, abundance = ${el.iso2.abundance}%\n` +
      `Calculate the average atomic mass of ${el.symbol}.`,
    answer: sol.average,
    answerUnit: 'amu',
    steps: sol.steps,
    tolerance: 0.01,
  }
}

function generateReverseProblem(elIdx?: number) {
  const el = elIdx !== undefined ? TWO_ISOTOPE_ELEMENTS[elIdx] : pick(TWO_ISOTOPE_ELEMENTS)
  const sol = reverseIsotopeAbundance({
    averageMass: el.avgMass,
    isotopeMasses: [el.iso1.mass, el.iso2.mass],
  })

  return {
    type: 'reverse' as const,
    question:
      `${el.name} (${el.symbol}) has an average atomic mass of ${el.avgMass} amu.\n` +
      `It has two stable isotopes with exact masses:\n` +
      `${sup(el.iso1.A)}${el.symbol} = ${el.iso1.mass} amu\n` +
      `${sup(el.iso2.A)}${el.symbol} = ${el.iso2.mass} amu\n` +
      `What is the percent natural abundance of ${sup(el.iso1.A)}${el.symbol}?`,
    answer: sol.abundance1 * 100,
    answerUnit: '%',
    steps: sol.steps,
    tolerance: 0.01,
  }
}

export function generateIsotopeProblem(): IsotopeProblem {
  const type = pick(['forward', 'reverse'] as const)
  return type === 'forward' ? generateForwardProblem() : generateReverseProblem()
}

export function generateIsotopeProblemOfType(
  type: 'forward' | 'reverse',
  elIdx?: number,
): IsotopeProblem {
  return type === 'forward'
    ? generateForwardProblem(elIdx)
    : generateReverseProblem(elIdx)
}

export function checkIsotopeAnswer(input: string, problem: IsotopeProblem): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 0.001
  return Math.abs((val - problem.answer) / problem.answer) <= problem.tolerance
}

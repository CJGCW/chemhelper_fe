import { TWO_ISOTOPE_ELEMENTS } from '../data/twoIsotopeElements'
import { weightedAverageMass, reverseIsotopeAbundance } from '../chem/isotope'

export interface IsotopeProblem {
  type:       'forward' | 'reverse'
  question:   string
  answer:     number
  answerUnit: string
  steps:      string[]
  tolerance:  number
  isDynamic?: boolean
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

// ── Dynamic generator ─────────────────────────────────────────────────────────
//
// Applies small random perturbations (±0.05%) to isotope masses and
// correspondingly adjusts the abundances so they still sum to 100%.
// This produces fresh numbers while staying chemically plausible and within
// the tolerance the checker already accepts (1%).

function perturbMass(mass: number): number {
  // ±0.05% perturbation, rounded to 6 decimal places
  const delta = mass * 0.0005 * (2 * Math.random() - 1)
  return parseFloat((mass + delta).toFixed(6))
}

function perturbAbundance(ab1: number): number {
  // Shift ab1 by up to ±3 percentage points (staying in valid range)
  const shift = (2 * Math.random() - 1) * 3
  const newAb1 = Math.max(1, Math.min(99, ab1 + shift))
  return parseFloat(newAb1.toFixed(2))
}

export function generateDynamicIsotopeProblem(): IsotopeProblem {
  const el = pick(TWO_ISOTOPE_ELEMENTS)
  const type = pick(['forward', 'reverse'] as const)

  const mass1 = perturbMass(el.iso1.mass)
  const mass2 = perturbMass(el.iso2.mass)
  const ab1   = perturbAbundance(el.iso1.abundance)
  const ab2   = parseFloat((100 - ab1).toFixed(2))

  if (type === 'forward') {
    const sol = weightedAverageMass([
      { mass: mass1, abundance: ab1 },
      { mass: mass2, abundance: ab2 },
    ])
    return {
      type: 'forward',
      question:
        `${el.name} (${el.symbol}) has two stable isotopes:\n` +
        `${sup(el.iso1.A)}${el.symbol}: mass = ${mass1} amu, abundance = ${ab1}%\n` +
        `${sup(el.iso2.A)}${el.symbol}: mass = ${mass2} amu, abundance = ${ab2}%\n` +
        `Calculate the average atomic mass of ${el.symbol}.`,
      answer: sol.average,
      answerUnit: 'amu',
      steps: sol.steps,
      tolerance: 0.01,
      isDynamic: true,
    }
  } else {
    // reverse: give masses + average, find ab1
    const trueAvg = (mass1 * ab1 + mass2 * ab2) / 100
    const avgMass = parseFloat(trueAvg.toFixed(4))
    const sol = reverseIsotopeAbundance({
      averageMass: avgMass,
      isotopeMasses: [mass1, mass2],
    })
    return {
      type: 'reverse',
      question:
        `${el.name} (${el.symbol}) has an average atomic mass of ${avgMass} amu.\n` +
        `It has two stable isotopes with exact masses:\n` +
        `${sup(el.iso1.A)}${el.symbol} = ${mass1} amu\n` +
        `${sup(el.iso2.A)}${el.symbol} = ${mass2} amu\n` +
        `What is the percent natural abundance of ${sup(el.iso1.A)}${el.symbol}?`,
      answer: sol.abundance1 * 100,
      answerUnit: '%',
      steps: sol.steps,
      tolerance: 0.01,
      isDynamic: true,
    }
  }
}

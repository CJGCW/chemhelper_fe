import { R, sf, sf3, toAtm, fromAtm, P_UNITS } from './idealGas'
import type { PUnit, GasVar } from './idealGas'

export interface GasProblem {
  solveFor:   GasVar
  pUnit:      PUnit
  givenP?:    number   // in pUnit
  givenV?:    number   // L
  givenN?:    number   // mol
  givenT?:    number   // K
  answer:     number
  answerUnit: string
  question:   string
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function genGasProblem(): GasProblem {
  const solveFor = pick<GasVar>(['P', 'V', 'n', 'T'])
  const pUnit    = pick(P_UNITS)

  const n = sf3(0.2  + Math.random() * 4.8)
  const T = sf3(250  + Math.random() * 350)
  const V = sf3(2.0  + Math.random() * 28.0)
  const P = sf3(fromAtm((n * R * T) / V, pUnit))

  switch (solveFor) {
    case 'P': return {
      solveFor, pUnit, givenV: V, givenN: n, givenT: T,
      answer: sf3(fromAtm((n * R * T) / V, pUnit)), answerUnit: pUnit,
      question: `A gas sample contains ${sf(n, 3)} mol and occupies ${sf(V, 3)} L at ${sf(T, 3)} K. Find the pressure in ${pUnit}.`,
    }
    case 'V': return {
      solveFor, pUnit, givenP: P, givenN: n, givenT: T,
      answer: sf3((n * R * T) / toAtm(P, pUnit)), answerUnit: 'L',
      question: `A gas contains ${sf(n, 3)} mol at ${sf(P, 3)} ${pUnit} and ${sf(T, 3)} K. Find the volume in L.`,
    }
    case 'n': return {
      solveFor, pUnit, givenP: P, givenV: V, givenT: T,
      answer: sf3((toAtm(P, pUnit) * V) / (R * T)), answerUnit: 'mol',
      question: `A ${sf(V, 3)} L container holds a gas at ${sf(P, 3)} ${pUnit} and ${sf(T, 3)} K. How many moles are present?`,
    }
    case 'T': return {
      solveFor, pUnit, givenP: P, givenV: V, givenN: n,
      answer: sf3((toAtm(P, pUnit) * V) / (n * R)), answerUnit: 'K',
      question: `A gas exerts ${sf(P, 3)} ${pUnit} in a ${sf(V, 3)} L container with ${sf(n, 3)} mol. Find the temperature in K.`,
    }
  }
}

export function checkGasAnswer(problem: GasProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val) || val <= 0) return false
  return Math.abs((val - problem.answer) / problem.answer) <= 0.02
}

export function gasSolutionSteps(problem: GasProblem): string[] {
  const { solveFor, pUnit } = problem
  const Patm = problem.givenP !== undefined ? toAtm(problem.givenP, pUnit) : undefined
  const conv = pUnit !== 'atm' && Patm !== undefined
    ? [`Convert P: ${sf(problem.givenP!, 3)} ${pUnit} = ${sf(Patm)} atm`] : []

  switch (solveFor) {
    case 'P': return [
      'P = nRT / V',
      `P = (${sf(problem.givenN!, 3)} mol × ${R} × ${sf(problem.givenT!, 3)} K) / ${sf(problem.givenV!, 3)} L`,
      `P = ${sf(problem.answer, 3)} ${pUnit}`,
    ]
    case 'V': return [
      'V = nRT / P', ...conv,
      `V = (${sf(problem.givenN!, 3)} mol × ${R} × ${sf(problem.givenT!, 3)} K) / ${sf(Patm!)} atm`,
      `V = ${sf(problem.answer, 3)} L`,
    ]
    case 'n': return [
      'n = PV / RT', ...conv,
      `n = (${sf(Patm!)} atm × ${sf(problem.givenV!, 3)} L) / (${R} × ${sf(problem.givenT!, 3)} K)`,
      `n = ${sf(problem.answer, 3)} mol`,
    ]
    case 'T': return [
      'T = PV / nR', ...conv,
      `T = (${sf(Patm!)} atm × ${sf(problem.givenV!, 3)} L) / (${sf(problem.givenN!, 3)} mol × ${R})`,
      `T = ${sf(problem.answer, 3)} K`,
    ]
  }
}

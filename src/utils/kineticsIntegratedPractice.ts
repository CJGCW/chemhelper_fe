// Integrated Rate Law practice problem generator
import { INTEGRATED_RATE_REACTIONS, type IntegratedRateReaction } from '../data/kineticsReactions'
import { solveIntegratedRate } from '../chem/kinetics'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

export interface IntegratedProblem {
  reaction: IntegratedRateReaction
  solveFor: 'At' | 't' | 'halfLife'
  given: { k: number; A0: number; t?: number; At?: number }
  answer: number
  answerUnit: string
  steps: string[]
  question: string
}

function buildQuestion(
  reaction: IntegratedRateReaction,
  solveFor: 'At' | 't' | 'halfLife',
  given: { k: number; A0: number; t?: number; At?: number },
): string {
  const orderStr = reaction.order === 0 ? 'zero' : reaction.order === 1 ? 'first' : 'second'
  if (solveFor === 'halfLife') {
    return `For the ${orderStr}-order reaction ${reaction.equation}, with k = ${sig(given.k)} ${reaction.kUnit} and [A]₀ = ${sig(given.A0)} M, calculate the half-life.`
  }
  if (solveFor === 'At') {
    return `For the ${orderStr}-order reaction ${reaction.equation}, with k = ${sig(given.k)} ${reaction.kUnit}, [A]₀ = ${sig(given.A0)} M, what is [A] after t = ${sig(given.t ?? 0)} s?`
  }
  // solveFor === 't'
  return `For the ${orderStr}-order reaction ${reaction.equation}, with k = ${sig(given.k)} ${reaction.kUnit}, [A]₀ = ${sig(given.A0)} M, how long does it take for [A] to reach ${sig(given.At ?? 0)} M?`
}

export function generateIntegratedProblem(): IntegratedProblem {
  const reaction = pick(INTEGRATED_RATE_REACTIONS)
  const solveOptions: Array<'At' | 't' | 'halfLife'> = ['At', 't', 'halfLife']
  const solveFor = pick(solveOptions)

  const k   = reaction.k
  const A0  = reaction.A0

  let given: { k: number; A0: number; t?: number; At?: number }
  let input: Parameters<typeof solveIntegratedRate>[0]

  if (solveFor === 'halfLife') {
    given = { k, A0 }
    input = { order: reaction.order, k, A0, solveFor: 'halfLife' }
  } else if (solveFor === 'At') {
    // pick t = 1-3 half-lives
    const t12 = reaction.halfLife
    const tFactor = 0.5 + Math.random() * 2.5  // 0.5 to 3 half-lives
    const t = Math.round(t12 * tFactor)
    given = { k, A0, t }
    input = { order: reaction.order, k, A0, solveFor: 'At', t }
  } else {
    // solveFor === 't'
    const fraction = 0.1 + Math.random() * 0.8  // fraction remaining: 0.1 to 0.9
    const At = A0 * fraction
    given = { k, A0, At }
    input = { order: reaction.order, k, A0, solveFor: 't', At }
  }

  const sol = solveIntegratedRate(input)
  const question = buildQuestion(reaction, solveFor, given)

  return {
    reaction,
    solveFor,
    given,
    answer: sol.answer,
    answerUnit: sol.answerUnit,
    steps: sol.steps,
    question,
  }
}

export function checkIntegratedAnswer(input: string, problem: IntegratedProblem): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  const tol = Math.abs(problem.answer) * 0.02
  return Math.abs(val - problem.answer) <= Math.max(tol, 1e-12)
}

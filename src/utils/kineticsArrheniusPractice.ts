// Arrhenius practice problem generator
import { ARRHENIUS_REACTIONS, type ArrheniusData } from '../data/kineticsReactions'
import { solveArrhenius } from '../chem/kinetics'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

export interface ArrheniusProblem {
  reaction: ArrheniusData
  mode: 'find-Ea' | 'find-k'
  answer: number
  answerUnit: string
  steps: string[]
  T1: number
  k1: number
  T2?: number
  k2?: number
  question: string
}

export function generateArrheniusProblem(): ArrheniusProblem {
  const reaction = pick(ARRHENIUS_REACTIONS)

  // Pick two different temperature/rate pairs
  const shuffled = [...reaction.pairs].sort(() => Math.random() - 0.5)
  const pair1 = shuffled[0]
  const pair2 = shuffled[1] ?? shuffled[0]

  // Ensure T1 < T2 for consistent presentation
  const [low, high] = pair1.T <= pair2.T ? [pair1, pair2] : [pair2, pair1]

  const mode: 'find-Ea' | 'find-k' = Math.random() < 0.5 ? 'find-Ea' : 'find-k'

  let question: string
  let sol: ReturnType<typeof solveArrhenius>
  let T2: number | undefined
  let k2: number | undefined

  if (mode === 'find-Ea') {
    question =
      `For the reaction: ${reaction.equation}\n` +
      `k = ${sig(low.k)} at T = ${low.T} K\n` +
      `k = ${sig(high.k)} at T = ${high.T} K\n\n` +
      `Calculate the activation energy Ea (in kJ/mol).`

    sol = solveArrhenius({ mode: 'find-Ea', T1: low.T, k1: low.k, T2: high.T, k2: high.k })
    T2 = high.T
    k2 = high.k
  } else {
    // find-k: give Ea and one (T,k) pair, ask for k at new T
    question =
      `For the reaction: ${reaction.equation}\n` +
      `Ea = ${sig(reaction.Ea)} kJ/mol\n` +
      `k = ${sig(low.k)} at T₁ = ${low.T} K\n\n` +
      `Calculate k at T₂ = ${high.T} K.`

    sol = solveArrhenius({ mode: 'find-k', T1: low.T, k1: low.k, T2: high.T, Ea: reaction.Ea })
    T2 = high.T
  }

  return {
    reaction,
    mode,
    answer: sol.answer,
    answerUnit: sol.answerUnit,
    steps: sol.steps,
    T1: low.T,
    k1: low.k,
    T2,
    k2,
    question,
  }
}

export function checkArrheniusAnswer(input: string, problem: ArrheniusProblem): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  const tol = Math.abs(problem.answer) * 0.03  // 3% tolerance
  return Math.abs(val - problem.answer) <= Math.max(tol, 1e-12)
}

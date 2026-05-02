// Rate Law practice problem generator
import { RATE_LAW_REACTIONS, type RateLawReaction } from '../data/kineticsReactions'
import { solveRateLaw } from '../chem/kinetics'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface RateLawProblem {
  reaction: RateLawReaction
  question: string
  speciesOrder: string  // which species order to ask about first
  answer: number        // the order for that species
  answerK: number
  answerKUnit: string
  steps: string[]
}

export function generateRateLawProblem(): RateLawProblem {
  // Skip reactions with fractional orders (like 0.5) for practice problems
  const integerOrderReactions = RATE_LAW_REACTIONS.filter(r =>
    Object.values(r.orders).every(o => Number.isInteger(o))
  )
  const pool = integerOrderReactions.length > 0 ? integerOrderReactions : RATE_LAW_REACTIONS
  const reaction = pick(pool)
  const sp = pick(reaction.species)
  const answer = reaction.orders[sp]

  const trialsFormatted = reaction.trials
    .map((tr, i) => {
      const concStr = reaction.species
        .map(s => `[${s}] = ${tr.concentrations[s].toExponential(2)} M`)
        .join(', ')
      return `Trial ${i + 1}: ${concStr}; rate = ${tr.initialRate.toExponential(2)} mol/(L·s)`
    })
    .join('\n')

  const question =
    `Given the following initial rate data for: ${reaction.equation}\n\n` +
    `${trialsFormatted}\n\n` +
    `What is the reaction order with respect to ${sp}? Also determine the rate constant k.`

  const sol = solveRateLaw({
    species: reaction.species,
    trials: reaction.trials.map(tr => ({ concentrations: tr.concentrations, rate: tr.initialRate })),
  })

  return {
    reaction,
    question,
    speciesOrder: sp,
    answer,
    answerK: sol.rateConstant,
    answerKUnit: sol.rateConstantUnit,
    steps: sol.steps,
  }
}

export function checkRateLawAnswer(userOrder: number, problem: RateLawProblem): boolean {
  return Math.round(userOrder) === problem.answer
}

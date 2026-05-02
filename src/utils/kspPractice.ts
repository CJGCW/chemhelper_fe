// Ksp, common ion, and precipitation practice problem generators.
// Pure TypeScript — no React, no component imports.

import { kspToSolubility, solubilityToKsp, willPrecipitate } from '../chem/solubility'
import { KSP_TABLE, type KspEntry } from '../data/kspValues'

export type KspProblemType = 'ksp-to-solubility' | 'solubility-to-ksp' | 'common-ion' | 'precipitation'

export interface KspProblem {
  type: KspProblemType
  prompt: string
  entry: KspEntry
  given: Record<string, number>
  answer: number
  answerLabel: string
  tolerance: number  // relative tolerance (0.01 = 1%)
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Filter to entries with a simple formula (avoid complex polyprotic anions)
const SIMPLE_ENTRIES: KspEntry[] = KSP_TABLE.filter(e =>
  e.cation.count + e.anion.count <= 3
)

export function generateKspToSolubilityProblem(): KspProblem {
  const entry = randomChoice(SIMPLE_ENTRIES)
  const result = kspToSolubility(entry.Ksp, entry.cation.count, entry.anion.count)
  const answer = result.solubility

  const prompt =
    `Calculate the molar solubility of ${entry.name} (${entry.formula}) in pure water. ` +
    `Ksp = ${entry.Ksp.toExponential(2)}`

  return {
    type: 'ksp-to-solubility',
    prompt,
    entry,
    given: { Ksp: entry.Ksp },
    answer,
    answerLabel: 'Molar solubility (M)',
    tolerance: 0.02,
  }
}

export function generateSolubilityToKspProblem(): KspProblem {
  const entry = randomChoice(SIMPLE_ENTRIES)
  const trueSolubility = kspToSolubility(entry.Ksp, entry.cation.count, entry.anion.count).solubility

  const result = solubilityToKsp(trueSolubility, entry.cation.count, entry.anion.count)
  const answer = result.Ksp

  const prompt =
    `The molar solubility of ${entry.name} (${entry.formula}) in pure water is ` +
    `${trueSolubility.toExponential(3)} M. Calculate Ksp.`

  return {
    type: 'solubility-to-ksp',
    prompt,
    entry,
    given: { solubility: trueSolubility },
    answer,
    answerLabel: 'Ksp',
    tolerance: 0.02,
  }
}

export function generatePrecipitationProblem(): KspProblem {
  const entry = randomChoice(SIMPLE_ENTRIES)
  const Ksp = entry.Ksp

  // Generate ion concentrations that are sometimes above and sometimes below Ksp
  const saturatedConc = kspToSolubility(Ksp, entry.cation.count, entry.anion.count).solubility
  const multiplier = randomChoice([0.01, 0.1, 10, 100, 1000])
  const cationConc = saturatedConc * entry.cation.count * multiplier
  const anionConc  = saturatedConc * entry.anion.count * (1 / multiplier + 0.1)

  const r = willPrecipitate(
    { cation: cationConc, anion: anionConc },
    entry.cation.count, entry.anion.count,
    Ksp,
  )

  // Answer: 1 if precipitates, 0 if not (user answers true/false; we store Q)
  const answer = r.Q

  const prompt =
    `A solution is prepared with [${entry.cation.formula}] = ${cationConc.toExponential(2)} M ` +
    `and [${entry.anion.formula}] = ${anionConc.toExponential(2)} M. ` +
    `Will ${entry.formula} precipitate? (Ksp = ${Ksp.toExponential(2)}). ` +
    `Calculate Q = [${entry.cation.formula}]^${entry.cation.count} × [${entry.anion.formula}]^${entry.anion.count}.`

  return {
    type: 'precipitation',
    prompt,
    entry,
    given: { cation: cationConc, anion: anionConc, Ksp },
    answer,
    answerLabel: 'Q (ion product)',
    tolerance: 0.02,
  }
}

export function generateRandomKspProblem(): KspProblem {
  const generators = [
    generateKspToSolubilityProblem,
    generateSolubilityToKspProblem,
    generatePrecipitationProblem,
  ]
  return randomChoice(generators)()
}

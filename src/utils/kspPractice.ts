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
  isDynamic?: boolean
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

// ── Dynamic generators ────────────────────────────────────────────────────────
// Pull from the full KSP_TABLE (filtered to simple 1:1, 1:2, 2:1 stoichiometries)
// with randomly computed concentrations. Return the same KspProblem type with
// isDynamic: true so the UI can show a "generated" badge.

// All entries with total ion count ≤ 3 (same pool as SIMPLE_ENTRIES but recomputed
// here so the dynamic generators share the same filtered set)
const DYNAMIC_ENTRIES: KspEntry[] = KSP_TABLE.filter(e =>
  e.cation.count + e.anion.count <= 3
)

/** Dynamic Ksp→solubility problem: random entry from full KSP_TABLE simple subset. */
export function generateDynamicKspToSolubilityProblem(): KspProblem {
  const entry = randomChoice(DYNAMIC_ENTRIES)
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
    isDynamic: true,
  }
}

/** Dynamic solubility→Ksp problem: random entry, solubility derived from Ksp then back. */
export function generateDynamicSolubilityToKspProblem(): KspProblem {
  const entry = randomChoice(DYNAMIC_ENTRIES)
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
    isDynamic: true,
  }
}

/** Dynamic precipitation problem: random entry with randomly generated ion concentrations. */
export function generateDynamicPrecipitationProblem(): KspProblem {
  const entry = randomChoice(DYNAMIC_ENTRIES)
  const Ksp = entry.Ksp

  const saturatedConc = kspToSolubility(Ksp, entry.cation.count, entry.anion.count).solubility
  // Use a wider multiplier range than the pool generator for more variety
  const multiplier = randomChoice([0.01, 0.05, 0.1, 0.5, 2, 5, 10, 50, 100, 500, 1000])
  const cationConc = saturatedConc * entry.cation.count * multiplier
  const anionConc  = saturatedConc * entry.anion.count * (1 / multiplier + 0.1)

  const r = willPrecipitate(
    { cation: cationConc, anion: anionConc },
    entry.cation.count, entry.anion.count,
    Ksp,
  )

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
    isDynamic: true,
  }
}

/** Dynamic random Ksp problem: 60% dynamic, falls back to full DYNAMIC_ENTRIES pool. */
export function generateDynamicRandomKspProblem(): KspProblem {
  const generators = [
    generateDynamicKspToSolubilityProblem,
    generateDynamicSolubilityToKspProblem,
    generateDynamicPrecipitationProblem,
  ]
  return randomChoice(generators)()
}

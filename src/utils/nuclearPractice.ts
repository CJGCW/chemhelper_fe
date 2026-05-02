// Nuclear practice problem generators.
// Pure TypeScript — no React.

import { COMMON_NUCLIDES } from '../data/nuclearData'
import { nuclearDecay, solveHalfLife, bindingEnergy, carbonDating } from '../chem/nuclear'
import type { DecayType } from '../chem/nuclear'

// ── Helpers ──────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fmtNum(n: number): string {
  if (Math.abs(n) >= 1e4 || (Math.abs(n) < 1e-2 && n !== 0)) {
    return n.toExponential(3)
  }
  return parseFloat(n.toPrecision(4)).toString()
}

// ── Decay Problems ────────────────────────────────────────────────────────────

export interface NuclearDecayProblem {
  question: string
  parentSymbol: string
  parentZ: number
  parentA: number
  decayType: DecayType
  answerZ: number
  answerA: number
  answerSymbol: string
  steps: string[]
}

const DECAY_TYPE_LABELS: Record<DecayType, string> = {
  alpha: 'alpha (α) decay',
  beta:  'beta-minus (β⁻) decay',
  'beta+': 'beta-plus (β⁺) decay',
  gamma: 'gamma (γ) decay',
  ec:    'electron capture (EC)',
}

export function generateDecayProblem(): NuclearDecayProblem {
  const radioactiveNuclides = COMMON_NUCLIDES.filter(n =>
    n.decayMode && n.decayMode !== 'stable' && n.decayMode !== 'gamma'
  )
  const nuclide = randFrom(radioactiveNuclides)
  const decayType = nuclide.decayMode as DecayType

  const result = nuclearDecay(nuclide.Z, nuclide.A, decayType)

  return {
    question: `${nuclide.name} (${nuclide.symbol}) undergoes ${DECAY_TYPE_LABELS[decayType]}. What is the daughter nuclide? Give the atomic number Z and mass number A.`,
    parentSymbol: nuclide.symbol,
    parentZ: nuclide.Z,
    parentA: nuclide.A,
    decayType,
    answerZ: result.daughter.Z,
    answerA: result.daughter.A,
    answerSymbol: result.daughter.symbol,
    steps: [result.equation, ...result.steps],
  }
}

export function checkDecayAnswer(
  userZ: string,
  userA: string,
  problem: NuclearDecayProblem,
): boolean {
  const z = parseInt(userZ, 10)
  const a = parseInt(userA, 10)
  return z === problem.answerZ && a === problem.answerA
}

// ── Half-Life Problems ────────────────────────────────────────────────────────

export interface HalfLifeProblem {
  question: string
  solveFor: 'N' | 't' | 'halfLife'
  answer: number
  unit: string
  steps: string[]
  nuclide: string
}

export function generateHalfLifeProblem(): HalfLifeProblem {
  const radioactive = COMMON_NUCLIDES.filter(n => n.halfLife !== undefined && n.halfLifeUnit)
  const nuclide = randFrom(radioactive)

  // Convert half-life to display units for the problem
  const t12 = nuclide.halfLife!
  const unit = nuclide.halfLifeUnit!

  // Work in the nuclide's natural time unit for clarity
  let t12Display: number
  let tMultiplier: number

  switch (unit) {
    case 'yr':   tMultiplier = 365.25 * 24 * 3600; t12Display = t12 / tMultiplier; break
    case 'days': tMultiplier = 24 * 3600;           t12Display = t12 / tMultiplier; break
    case 'hr':   tMultiplier = 3600;                t12Display = t12 / tMultiplier; break
    default:     tMultiplier = 1;                   t12Display = t12; break
  }

  const problemType = randFrom(['N', 't', 'halfLife'] as const)

  if (problemType === 'N') {
    // Given N0, t, halfLife → find N
    const numHL = randInt(1, 4)
    const t     = numHL * t12Display
    const N0    = randFrom([100, 200, 500, 1000, 2000])
    const result = solveHalfLife({ solveFor: 'N', N0, t, halfLife: t12Display })

    return {
      question: `A sample of ${nuclide.name} (${nuclide.symbol}) has an initial activity of ${N0} counts/min. ` +
        `The half-life of ${nuclide.symbol} is ${fmtNum(t12Display)} ${unit}. ` +
        `What is the activity after ${fmtNum(t)} ${unit}?`,
      solveFor: 'N',
      answer: result.answer,
      unit: 'counts/min',
      steps: result.steps,
      nuclide: nuclide.symbol,
    }
  }

  if (problemType === 't') {
    // Given N0, N (as percentage), halfLife → find t
    const pct  = randFrom([75, 50, 25, 12.5, 6.25])
    const N0   = 100
    const N    = N0 * (pct / 100)
    const result = solveHalfLife({ solveFor: 't', N0, N, halfLife: t12Display })

    return {
      question: `${nuclide.name} (${nuclide.symbol}) has a half-life of ${fmtNum(t12Display)} ${unit}. ` +
        `How long does it take for a sample to decay to ${pct}% of its original activity?`,
      solveFor: 't',
      answer: result.answer,
      unit: unit,
      steps: result.steps,
      nuclide: nuclide.symbol,
    }
  }

  // problemType === 'halfLife'
  const numHL = randInt(2, 5)
  const N0    = 100
  const N     = N0 / Math.pow(2, numHL)
  const t     = numHL * t12Display
  const result = solveHalfLife({ solveFor: 'halfLife', N0, N, t })

  return {
    question: `A radioactive sample decays from ${N0}% to ${fmtNum(N)}% of its original activity ` +
      `in ${fmtNum(t)} ${unit}. What is the half-life?`,
    solveFor: 'halfLife',
    answer: result.answer,
    unit: unit,
    steps: result.steps,
    nuclide: nuclide.symbol,
  }
}

export function checkHalfLifeAnswer(userAnswer: string, problem: HalfLifeProblem): boolean {
  const val = parseFloat(userAnswer)
  if (isNaN(val)) return false
  return Math.abs(val - problem.answer) / problem.answer <= 0.01
}

// ── Binding Energy Problems ───────────────────────────────────────────────────

export interface BindingEnergyProblem {
  question: string
  nuclide: string
  Z: number
  A: number
  atomicMass: number
  answer: number
  unit: string
  steps: string[]
}

export function generateBindingEnergyProblem(): BindingEnergyProblem {
  const stableNuclides = COMMON_NUCLIDES.filter(n => n.decayMode === 'stable' && n.A >= 4)
  const nuclide = randFrom(stableNuclides)

  const result = bindingEnergy(nuclide.Z, nuclide.A, nuclide.atomicMass)

  const askPerNucleon = Math.random() > 0.5

  return {
    question: askPerNucleon
      ? `Calculate the binding energy per nucleon of ${nuclide.name} (${nuclide.symbol}). ` +
        `Atomic mass = ${nuclide.atomicMass} amu. (Use: m_H = 1.007825 amu, m_n = 1.008665 amu, 1 amu = 931.5 MeV)`
      : `Calculate the total nuclear binding energy of ${nuclide.name} (${nuclide.symbol}). ` +
        `Atomic mass = ${nuclide.atomicMass} amu. (Use: m_H = 1.007825 amu, m_n = 1.008665 amu, 1 amu = 931.5 MeV)`,
    nuclide: nuclide.symbol,
    Z: nuclide.Z,
    A: nuclide.A,
    atomicMass: nuclide.atomicMass,
    answer: askPerNucleon ? result.bePerNucleon : result.totalBE,
    unit: askPerNucleon ? 'MeV/nucleon' : 'MeV',
    steps: result.steps,
  }
}

export function checkBindingEnergyAnswer(userAnswer: string, problem: BindingEnergyProblem): boolean {
  const val = parseFloat(userAnswer)
  if (isNaN(val)) return false
  return Math.abs(val - problem.answer) / problem.answer <= 0.01
}

// ── Carbon-14 Dating Problems ─────────────────────────────────────────────────

export interface DatingProblem {
  question: string
  percentRemaining: number
  answer: number   // years
  steps: string[]
}

export function generateDatingProblem(): DatingProblem {
  const percentages = [75, 50, 40, 30, 25, 20, 15, 12.5, 10]
  const pct = randFrom(percentages)
  const result = carbonDating(pct, 100)

  return {
    question: `An ancient artifact shows that its carbon-14 content is ${pct}% of what would be expected ` +
      `in a living organism. Using the half-life of ¹⁴C = 5730 years, calculate the age of the artifact.`,
    percentRemaining: pct,
    answer: result.age,
    steps: result.steps,
  }
}

export function checkDatingAnswer(userAnswer: string, problem: DatingProblem): boolean {
  const val = parseFloat(userAnswer)
  if (isNaN(val)) return false
  return Math.abs(val - problem.answer) / problem.answer <= 0.01
}

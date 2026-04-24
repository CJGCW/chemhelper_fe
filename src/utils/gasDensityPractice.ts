// Gas Density practice problem generator
// ρ = MP / RT  →  rearranges to solve for M, T, or P

import {
  calcGasDensity, calcGasDensityMolarMass, calcGasDensityTemp, calcGasDensityPressure,
  R_GAS as R,
} from '../chem/gas'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number, dp: number): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(dp))
}

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

const GASES = [
  { name: 'H₂',  M: 2.016  },
  { name: 'He',  M: 4.003  },
  { name: 'CH₄', M: 16.04  },
  { name: 'NH₃', M: 17.03  },
  { name: 'N₂',  M: 28.01  },
  { name: 'O₂',  M: 32.00  },
  { name: 'Ar',  M: 39.95  },
  { name: 'CO₂', M: 44.01  },
  { name: 'SO₂', M: 64.06  },
  { name: 'Cl₂', M: 70.90  },
] as const

export type GasDensityMode = 'density-from-M' | 'M-from-density'

export interface GasDensityProblem {
  mode: GasDensityMode
  question: string
  answer: number
  unit: string
  steps: string[]
}

type ProblemType = 'find-density' | 'find-molar-mass' | 'find-temperature' | 'find-pressure'

export function generateGasDensityProblem(options?: { mode?: GasDensityMode }): GasDensityProblem {
  const modeFilter = options?.mode
  let type: ProblemType
  if (modeFilter === 'M-from-density') {
    type = 'find-molar-mass'
  } else if (modeFilter === 'density-from-M') {
    type = pick<ProblemType>(['find-density', 'find-temperature', 'find-pressure'])
  } else {
    type = pick<ProblemType>(['find-density', 'find-molar-mass', 'find-temperature', 'find-pressure'])
  }
  const resolvedMode: GasDensityMode = type === 'find-molar-mass' ? 'M-from-density' : 'density-from-M'
  const gas = pick(GASES)

  const T = rand(250, 450, 1)  // K
  const P = rand(0.50, 3.00, 3) // atm
  const rho = parseFloat((gas.M * P / (R * T)).toPrecision(4))

  if (type === 'find-density') {
    const answer = calcGasDensity(gas.M, P, T)
    const question = `What is the density of ${gas.name} (M = ${gas.M} g/mol) at ${T} K and ${P} atm?`
    const steps = [
      `ρ = MP / RT`,
      `ρ = (${gas.M} × ${P}) / (0.08206 × ${T})`,
      `ρ = ${sig(gas.M * P)} / ${sig(R * T)}`,
      `ρ = ${sig(answer)} g/L`,
    ]
    return { mode: resolvedMode, question, answer, unit: 'g/L', steps }
  }

  if (type === 'find-molar-mass') {
    const answer = calcGasDensityMolarMass(rho, P, T)
    const question = `An unknown gas has a density of ${rho} g/L at ${T} K and ${P} atm. What is its molar mass?`
    const steps = [
      `M = ρRT / P`,
      `M = (${rho} × 0.08206 × ${T}) / ${P}`,
      `M = ${sig(rho * R * T)} / ${P}`,
      `M = ${sig(answer)} g/mol`,
    ]
    return { mode: resolvedMode, question, answer, unit: 'g/mol', steps }
  }

  if (type === 'find-temperature') {
    const answer = calcGasDensityTemp(gas.M, P, rho)
    const question = `${gas.name} (M = ${gas.M} g/mol) has a density of ${rho} g/L at ${P} atm. What is the temperature?`
    const steps = [
      `T = MP / (ρR)`,
      `T = (${gas.M} × ${P}) / (${rho} × 0.08206)`,
      `T = ${sig(gas.M * P)} / ${sig(rho * R)}`,
      `T = ${sig(answer)} K`,
    ]
    return { mode: resolvedMode, question, answer, unit: 'K', steps }
  }

  // find-pressure
  const answer = calcGasDensityPressure(rho, T, gas.M)
  const question = `${gas.name} (M = ${gas.M} g/mol) has a density of ${rho} g/L at ${T} K. What is the pressure?`
  const steps = [
    `P = ρRT / M`,
    `P = (${rho} × 0.08206 × ${T}) / ${gas.M}`,
    `P = ${sig(rho * R * T)} / ${gas.M}`,
    `P = ${sig(answer)} atm`,
  ]
  return { mode: resolvedMode, question, answer, unit: 'atm', steps }
}

export function checkGasDensityAnswer(raw: string, problem: GasDensityProblem): boolean {
  const val = parseFloat(raw)
  if (isNaN(val)) return false
  const tol = Math.max(Math.abs(problem.answer) * 0.02, 0.001)
  return Math.abs(val - problem.answer) <= tol
}

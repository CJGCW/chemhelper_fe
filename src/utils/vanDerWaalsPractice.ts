// Van der Waals (real gas) practice problems.
// Solves for pressure only: P = nRT / (V − nb) − a(n/V)²
// Constants from Atkins' Physical Chemistry (a in L²·atm/mol², b in L/mol).

import { calcVanDerWaals, R_GAS as R } from '../chem/gas'

// ── Gas database ──────────────────────────────────────────────────────────────

export interface VdWGas {
  name:    string
  formula: string
  a:       number   // L²·atm/mol²
  b:       number   // L/mol
}

export const VDW_GASES: VdWGas[] = [
  { name: 'Helium',          formula: 'He',   a: 0.0341, b: 0.02370 },
  { name: 'Hydrogen',        formula: 'H₂',   a: 0.2444, b: 0.02661 },
  { name: 'Nitrogen',        formula: 'N₂',   a: 1.390,  b: 0.03913 },
  { name: 'Oxygen',          formula: 'O₂',   a: 1.360,  b: 0.03183 },
  { name: 'Carbon dioxide',  formula: 'CO₂',  a: 3.640,  b: 0.04267 },
  { name: 'Methane',         formula: 'CH₄',  a: 2.253,  b: 0.04278 },
  { name: 'Ammonia',         formula: 'NH₃',  a: 4.169,  b: 0.03707 },
  { name: 'Water vapour',    formula: 'H₂O',  a: 5.536,  b: 0.03049 },
  { name: 'Chlorine',        formula: 'Cl₂',  a: 6.579,  b: 0.05622 },
  { name: 'Sulfur dioxide',  formula: 'SO₂',  a: 6.803,  b: 0.05636 },
]

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VdWProblem {
  gas:         VdWGas
  givenN:      number   // mol
  givenV:      number   // L
  givenT:      number   // K
  idealP:      number   // atm — from PV = nRT
  realP:       number   // atm — from van der Waals
  deviationPct: number  // (realP - idealP) / idealP * 100
  answerUnit:  'atm'
  question:    string
  steps:       string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function sig(x: number, n: number): string { return parseFloat(x.toPrecision(n)).toString() }

function calcPressures(gas: VdWGas, n: number, V: number, T: number) {
  return calcVanDerWaals(n, V, T, gas.a, gas.b)
}

// ── Generator ─────────────────────────────────────────────────────────────────

export function generateVdWProblem(): VdWProblem {
  const gas = pick(VDW_GASES)

  // Pick conditions where non-ideal behaviour is noticeable but the
  // van der Waals equation remains physically meaningful (V > nb).
  const MOLES   = [0.50, 1.00, 1.50, 2.00, 2.50, 3.00]
  const VOLUMES  = [2.0,  3.0,  5.0,  8.0, 10.0, 15.0, 20.0]
  const TEMPS    = [250, 273, 300, 350, 400, 450, 500]

  let n: number, V: number, T: number, idealP: number, realP: number
  let iters = 0
  do {
    n = pick(MOLES)
    V = pick(VOLUMES)
    T = pick(TEMPS)
    // Ensure V > nb (physically required) with margin
    if (V <= n * gas.b * 1.5) continue
    ;({ idealP, realP } = calcPressures(gas, n, V, T))
    iters++
    if (iters > 500) break
  } while (realP! <= 0)

  const deviationPct = ((realP! - idealP!) / idealP!) * 100

  const volumeCorr  = V - n * gas.b
  const pressCorr   = gas.a * (n / V) ** 2
  const idealTerm   = (n * R * T) / volumeCorr

  const steps: string[] = [
    `van der Waals equation: P = nRT / (V − nb) − a(n/V)²`,
    `For ${gas.name} (${gas.formula}): a = ${gas.a} L²·atm/mol²,  b = ${gas.b} L/mol`,
    `Volume correction: V − nb = ${sig(V, 4)} − (${sig(n, 3)} × ${gas.b}) = ${sig(volumeCorr, 4)} L`,
    `Ideal-gas term: nRT / (V − nb) = (${sig(n,3)} × ${R} × ${T}) / ${sig(volumeCorr,4)} = ${sig(idealTerm,4)} atm`,
    `Pressure correction: a(n/V)² = ${gas.a} × (${sig(n,3)}/${sig(V,3)})² = ${sig(pressCorr,4)} atm`,
    `P(real) = ${sig(idealTerm,4)} − ${sig(pressCorr,4)} = ${sig(realP!,4)} atm`,
    `P(ideal) = nRT/V = ${sig(idealP!,4)} atm   (deviation: ${deviationPct >= 0 ? '+' : ''}${sig(deviationPct,3)}%)`,
  ]

  return {
    gas,
    givenN: n,
    givenV: V,
    givenT: T,
    idealP: idealP!,
    realP:  realP!,
    deviationPct,
    answerUnit: 'atm',
    question: `Calculate the pressure of ${sig(n, 3)} mol of ${gas.name} (${gas.formula}) in a ${sig(V, 3)} L container at ${T} K using the van der Waals equation. Give your answer in atm.`,
    steps,
  }
}

// ── Answer checker ────────────────────────────────────────────────────────────

export function checkVdWAnswer(raw: string, problem: VdWProblem): boolean {
  const val = parseFloat(raw.trim())
  if (isNaN(val) || val <= 0) return false
  return Math.abs(val - problem.realP) / problem.realP <= 0.02  // ±2%
}

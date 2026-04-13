// Practice problems for electrochemistry: E°cell, spontaneity, Nernst, ΔG°.

import { HALF_REACTIONS } from '../data/reductionPotentials'
import type { HalfReaction } from '../data/reductionPotentials'

// ── Types ─────────────────────────────────────────────────────────────────────

export type EcellSubtype = 'calc_e0cell' | 'spontaneity' | 'nernst' | 'delta_g'

export interface EcellProblem {
  subtype:    EcellSubtype
  question:   string
  context:    string      // half-reaction equations shown to student
  answer:     string      // canonical answer (number string or 'yes'/'no')
  answerUnit: string
  tolerance:  number      // absolute ± for numeric answers (0 for exact-string)
  steps:      string[]
  hint?:      string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function fmt(v: number, dec = 3): string {
  return (v >= 0 ? '+' : '') + v.toFixed(dec)
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b) }

/** Pick two distinct half-reactions; first has higher E° (cathode), second lower (anode) */
function pickCathodeAnode(): [HalfReaction, HalfReaction] {
  let c: HalfReaction, a: HalfReaction
  do {
    c = pick(HALF_REACTIONS)
    a = pick(HALF_REACTIONS)
  } while (c.id === a.id || c.e0 <= a.e0)
  return [c, a]
}

function nEff(c: HalfReaction, a: HalfReaction): number {
  return lcm(c.n, a.n)
}

// ── 1. calc_e0cell ────────────────────────────────────────────────────────────

function genCalcE0cell(): EcellProblem {
  const [cathode, anode] = pickCathodeAnode()
  const e0 = cathode.e0 - anode.e0

  const context =
    `Cathode (reduction): ${cathode.cathode}\n` +
    `  E°red = ${fmt(cathode.e0)} V\n` +
    `Anode (oxidation):   ${anode.cathode}  [reversed]\n` +
    `  E°red = ${fmt(anode.e0)} V`

  const steps = [
    `E°cell = E°cathode − E°anode`,
    `E°cell = ${fmt(cathode.e0)} − (${fmt(anode.e0)})`,
    `E°cell = ${fmt(e0)} V`,
    e0 > 0 ? `Positive E°cell → spontaneous under standard conditions.` : `Negative E°cell → non-spontaneous under standard conditions.`,
  ]

  return {
    subtype: 'calc_e0cell',
    question: `Calculate E°cell for the galvanic cell shown. Give your answer in volts to 3 decimal places.`,
    context,
    answer: fmt(e0),
    answerUnit: 'V',
    tolerance: 0.002,
    steps,
    hint: 'E°cell = E°cathode − E°anode. Do not reverse the sign of the anode E° — just subtract it.',
  }
}

// ── 2. spontaneity ────────────────────────────────────────────────────────────

function genSpontaneity(): EcellProblem {
  const [cathode, anode] = pickCathodeAnode()
  // Introduce ~40% chance of a non-spontaneous cell by swapping
  const flip = Math.random() < 0.4
  const displayCathode = flip ? anode   : cathode
  const displayAnode   = flip ? cathode : anode
  const cellE0 = displayCathode.e0 - displayAnode.e0
  const spont  = cellE0 > 0

  const context =
    `Cathode: ${displayCathode.cathode}  (E° = ${fmt(displayCathode.e0)} V)\n` +
    `Anode:   ${displayAnode.cathode}   [reversed]  (E° = ${fmt(displayAnode.e0)} V)`

  const steps = [
    `E°cell = E°cathode − E°anode = ${fmt(displayCathode.e0)} − (${fmt(displayAnode.e0)}) = ${fmt(cellE0)} V`,
    spont
      ? `E°cell > 0  →  ΔG° = −nFE° < 0  →  spontaneous.`
      : `E°cell < 0  →  ΔG° = −nFE° > 0  →  non-spontaneous.`,
  ]

  return {
    subtype: 'spontaneity',
    question: `Is the electrochemical cell below spontaneous under standard conditions? (yes / no)`,
    context,
    answer: spont ? 'yes' : 'no',
    answerUnit: '',
    tolerance: 0,
    steps,
    hint: 'A cell is spontaneous when E°cell > 0.',
  }
}

// ── 3. nernst ─────────────────────────────────────────────────────────────────

// Nice Q values that give round log values
const Q_VALUES = [1e-4, 1e-3, 1e-2, 1e-1, 1e1, 1e2, 1e3, 1e4]
const Q_LABELS: Record<number, string> = {
  1e-4:'1×10⁻⁴', 1e-3:'1×10⁻³', 1e-2:'1×10⁻²', 1e-1:'0.10',
  1e1:'10', 1e2:'100', 1e3:'1×10³', 1e4:'1×10⁴',
}

function genNernst(): EcellProblem {
  const [cathode, anode] = pickCathodeAnode()
  const e0 = cathode.e0 - anode.e0
  const n  = nEff(cathode, anode)
  const Q  = pick(Q_VALUES)
  const logQ = Math.log10(Q)   // integer ±1…±4
  const E  = e0 - (0.05916 / n) * logQ

  const context =
    `Cathode: ${cathode.cathode}  (E° = ${fmt(cathode.e0)} V)\n` +
    `Anode:   ${anode.cathode}  [reversed]  (E° = ${fmt(anode.e0)} V)\n` +
    `E°cell = ${fmt(e0)} V  |  n = ${n}  |  Q = ${Q_LABELS[Q]}`

  const steps = [
    `Nernst equation: E = E° − (0.05916 / n) · log₁₀Q  (at 298 K)`,
    `E = ${fmt(e0)} − (0.05916 / ${n}) · log₁₀(${Q_LABELS[Q]})`,
    `log₁₀(${Q_LABELS[Q]}) = ${logQ}`,
    `E = ${fmt(e0)} − (${(0.05916 / n).toFixed(5)}) · (${logQ})`,
    `E = ${fmt(e0)} − (${((0.05916 / n) * logQ).toFixed(4)})`,
    `E = ${fmt(E)} V`,
  ]

  return {
    subtype: 'nernst',
    question: `Calculate the non-standard cell potential E using the Nernst equation at 298 K. Give your answer in volts to 3 decimal places.`,
    context,
    answer: fmt(E),
    answerUnit: 'V',
    tolerance: 0.002,
    steps,
    hint: 'E = E° − (0.05916 / n) · log₁₀Q at 298 K.',
  }
}

// ── 4. delta_g ────────────────────────────────────────────────────────────────

const F = 96485   // C/mol

function genDeltaG(): EcellProblem {
  const [cathode, anode] = pickCathodeAnode()
  const e0  = cathode.e0 - anode.e0
  const n   = nEff(cathode, anode)
  const dgJ = -n * F * e0
  const dgKJ = dgJ / 1000
  // Round to 1 decimal
  const answerVal = Math.round(dgKJ * 10) / 10

  const context =
    `Cathode: ${cathode.cathode}  (E° = ${fmt(cathode.e0)} V)\n` +
    `Anode:   ${anode.cathode}  [reversed]  (E° = ${fmt(anode.e0)} V)\n` +
    `E°cell = ${fmt(e0)} V  |  n = ${n}`

  const steps = [
    `ΔG° = −nFE°cell`,
    `ΔG° = −(${n})(96 485 C/mol)(${fmt(e0)} V)`,
    `ΔG° = ${(dgJ / 1000).toFixed(1)} kJ/mol`,
    dgKJ < 0 ? `ΔG° < 0  →  spontaneous (as expected for a positive E°cell).` : `ΔG° > 0  →  non-spontaneous.`,
  ]

  return {
    subtype: 'delta_g',
    question: `Calculate ΔG° (in kJ/mol) for the cell reaction under standard conditions. Give your answer to 1 decimal place.`,
    context,
    answer: answerVal.toFixed(1),
    answerUnit: 'kJ/mol',
    tolerance: 2,
    steps,
    hint: 'ΔG° = −nFE°cell, where F = 96 485 C/mol. Convert J → kJ by ÷ 1000.',
  }
}

// ── Generator ─────────────────────────────────────────────────────────────────

export function genEcellProblem(subtype: EcellSubtype): EcellProblem {
  switch (subtype) {
    case 'calc_e0cell':  return genCalcE0cell()
    case 'spontaneity':  return genSpontaneity()
    case 'nernst':       return genNernst()
    case 'delta_g':      return genDeltaG()
  }
}

// ── Answer checker ────────────────────────────────────────────────────────────

export function checkEcellAnswer(raw: string, problem: EcellProblem): boolean {
  const input = raw.trim().toLowerCase()

  if (problem.subtype === 'spontaneity') {
    return input === problem.answer
  }

  // Numeric answer
  const parsed = parseFloat(input.replace(/[^0-9.+\-eE]/g, ''))
  if (isNaN(parsed)) return false
  const expected = parseFloat(problem.answer)
  return Math.abs(parsed - expected) <= problem.tolerance
}

// Practice problem generators for: ΔG°-E°-K Triangle, Faraday's Law, Concentration Cells
// All generators return pure data — no React imports.

import { solveTriangle, solveFaraday, concentrationCellEmf } from '../chem/electrochem'
import { ELECTROLYSIS_REACTIONS } from '../data/reductionPotentials'

// ── Helpers ───────────────────────────────────────────────────────────────────

function rand(min: number, max: number, dec = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Triangle Problems ─────────────────────────────────────────────────────────

export type TriangleProblemType = 'random' | 'ecell-to-dg' | 'ecell-to-k' | 'dg-to-ecell' | 'k-to-ecell'

export interface TriangleProblem {
  type: TriangleProblemType
  context: string
  question: string
  placeholder: string
  unit: string
  answer: number        // numeric answer (for tolerance check)
  answerDisplay: string // formatted string for student display
  steps: string[]
  /** true if answer is log10(K) instead of K itself */
  isLog?: boolean
}

const NAMED_CELLS: { name: string; Ecell: number; n: number }[] = [
  { name: 'Zn/Cu (Daniell) cell',   Ecell: 1.10,  n: 2 },
  { name: 'Zn/Ag cell',             Ecell: 1.562, n: 2 },
  { name: 'Fe/Cu cell',             Ecell: 0.782, n: 2 },
  { name: 'Ni/Ag cell',             Ecell: 1.057, n: 2 },
  { name: 'Zn/Cl₂ cell',           Ecell: 2.122, n: 2 },
  { name: 'Fe/Ag cell',             Ecell: 1.24,  n: 1 },
]

export function genTriangleProblem(type: TriangleProblemType): TriangleProblem {
  const effectiveType: Exclude<TriangleProblemType, 'random'> =
    type === 'random'
      ? pick(['ecell-to-dg', 'ecell-to-k', 'dg-to-ecell', 'k-to-ecell'])
      : type

  const T = 298
  const cell = pick(NAMED_CELLS)
  const { Ecell, n, name } = cell

  if (effectiveType === 'ecell-to-dg') {
    const r = solveTriangle({ type: 'Ecell', value: Ecell }, n, T)
    return {
      type,
      context: `Cell: ${name}\nE°cell = +${Ecell.toFixed(3)} V, n = ${n}`,
      question: `Calculate ΔG° (kJ/mol) for this cell reaction at 25°C.`,
      placeholder: 'e.g. -212.3',
      unit: 'kJ/mol',
      answer: r.deltaG,
      answerDisplay: `${r.deltaG.toFixed(1)} kJ/mol`,
      steps: r.steps,
    }
  }

  if (effectiveType === 'ecell-to-k') {
    const r = solveTriangle({ type: 'Ecell', value: Ecell }, n, T)
    const log10K = Math.log10(r.K)
    return {
      type,
      context: `Cell: ${name}\nE°cell = +${Ecell.toFixed(3)} V, n = ${n}, T = 298 K`,
      question: `Calculate log₁₀(K) for this reaction at 25°C. (Enter the log₁₀ value, not K itself)`,
      placeholder: 'e.g. 37.2',
      unit: '',
      answer: log10K,
      answerDisplay: `log₁₀ K = ${log10K.toFixed(2)}  (K = ${r.K.toExponential(2)})`,
      steps: r.steps,
      isLog: true,
    }
  }

  if (effectiveType === 'dg-to-ecell') {
    const deltaG = rand(-250, -50, 1) // kJ/mol, always spontaneous
    const nVal = pick([1, 2, 3])
    const r = solveTriangle({ type: 'deltaG', value: deltaG }, nVal, T)
    return {
      type,
      context: `ΔG° = ${deltaG.toFixed(1)} kJ/mol for a reaction with n = ${nVal} electrons transferred.`,
      question: `Calculate E°cell (V) at 25°C.`,
      placeholder: 'e.g. +1.10',
      unit: 'V',
      answer: r.Ecell,
      answerDisplay: `${r.Ecell >= 0 ? '+' : ''}${r.Ecell.toFixed(4)} V`,
      steps: r.steps,
    }
  }

  // k-to-ecell
  const logK = rand(10, 40, 1)
  const K = Math.pow(10, logK)
  const nVal = pick([1, 2, 3])
  const r = solveTriangle({ type: 'K', value: K }, nVal, T)
  return {
    type,
    context: `Equilibrium constant K = 10^${logK.toFixed(1)},  n = ${nVal} electrons transferred.`,
    question: `Calculate E°cell (V) at 25°C. (K = 10^${logK.toFixed(1)})`,
    placeholder: 'e.g. +0.50',
    unit: 'V',
    answer: r.Ecell,
    answerDisplay: `${r.Ecell >= 0 ? '+' : ''}${r.Ecell.toFixed(4)} V`,
    steps: r.steps,
  }
}

export function checkTriangleAnswer(raw: string, problem: TriangleProblem): boolean {
  const userVal = parseFloat(raw.replace(/,/g, ''))
  if (isNaN(userVal)) return false
  const tol = problem.isLog ? 0.5 : Math.max(Math.abs(problem.answer) * 0.01, 0.001)
  return Math.abs(userVal - problem.answer) <= tol
}

// ── Faraday Problems ──────────────────────────────────────────────────────────

export type FaradayProblemType = 'random' | 'mass' | 'current' | 'time'

export interface FaradayProblem {
  type: FaradayProblemType
  context: string
  question: string
  placeholder: string
  unit: string
  answer: number
  answerDisplay: string
  steps: string[]
}

export function genFaradayProblem(type: FaradayProblemType): FaradayProblem {
  const effectiveType: Exclude<FaradayProblemType, 'random'> =
    type === 'random'
      ? pick(['mass', 'current', 'time'])
      : type

  const rxn = pick(ELECTROLYSIS_REACTIONS.filter(r => r.cathodeMetal !== 'H'))
  const { name, cathodeReaction, molarMass: M, n } = rxn

  if (effectiveType === 'mass') {
    const I = rand(0.5, 5.0, 2)
    const tMin = rand(15, 120, 0)
    const t = tMin * 60
    const r = solveFaraday({ solveFor: 'mass', I, t, M, n })
    return {
      type,
      context: `${name}\nCathode: ${cathodeReaction}\nM = ${M} g/mol, n = ${n} e⁻/ion`,
      question: `A current of ${I.toFixed(2)} A is passed for ${tMin} minutes. What mass (g) of ${rxn.cathodeMetal} is deposited?`,
      placeholder: 'e.g. 3.56',
      unit: 'g',
      answer: r.answer,
      answerDisplay: `${r.answer.toFixed(3)} g`,
      steps: r.steps,
    }
  }

  if (effectiveType === 'current') {
    const mass = rand(0.5, 5.0, 2)
    const tMin = rand(20, 120, 0)
    const t = tMin * 60
    const r = solveFaraday({ solveFor: 'current', mass, t, M, n })
    return {
      type,
      context: `${name}\nCathode: ${cathodeReaction}\nM = ${M} g/mol, n = ${n} e⁻/ion`,
      question: `What current (A) is required to deposit ${mass.toFixed(2)} g of ${rxn.cathodeMetal} in ${tMin} minutes?`,
      placeholder: 'e.g. 2.50',
      unit: 'A',
      answer: r.answer,
      answerDisplay: `${r.answer.toFixed(3)} A`,
      steps: r.steps,
    }
  }

  // time
  const mass = rand(0.5, 4.0, 2)
  const I    = rand(0.5, 5.0, 2)
  const r    = solveFaraday({ solveFor: 'time', mass, I, M, n })
  return {
    type,
    context: `${name}\nCathode: ${cathodeReaction}\nM = ${M} g/mol, n = ${n} e⁻/ion`,
    question: `How long (seconds) must a ${I.toFixed(2)} A current flow to deposit ${mass.toFixed(2)} g of ${rxn.cathodeMetal}?`,
    placeholder: 'e.g. 3600',
    unit: 's',
    answer: r.answer,
    answerDisplay: `${r.answer.toFixed(0)} s  (= ${(r.answer / 60).toFixed(1)} min)`,
    steps: r.steps,
  }
}

export function checkFaradayAnswer(raw: string, problem: FaradayProblem): boolean {
  const userVal = parseFloat(raw.replace(/,/g, ''))
  if (isNaN(userVal)) return false
  const tol = Math.abs(problem.answer) * 0.02  // 2%
  return Math.abs(userVal - problem.answer) <= tol
}

// ── Concentration Cell Problems ───────────────────────────────────────────────

export interface ConcCellProblem {
  context: string
  question: string
  placeholder: string
  answer: number
  answerDisplay: string
  steps: string[]
}

const CONC_METALS: { symbol: string; ion: string; n: number }[] = [
  { symbol: 'Cu', ion: 'Cu²⁺', n: 2 },
  { symbol: 'Zn', ion: 'Zn²⁺', n: 2 },
  { symbol: 'Fe', ion: 'Fe²⁺', n: 2 },
  { symbol: 'Ag', ion: 'Ag⁺',  n: 1 },
  { symbol: 'Ni', ion: 'Ni²⁺', n: 2 },
]

const CONC_RATIOS: [number, number][] = [
  [1.0, 0.01],
  [0.1, 0.001],
  [1.0, 0.1],
  [0.5, 0.005],
  [2.0, 0.02],
  [1.0, 0.0001],
  [0.1, 0.01],
]

export function genConcCellProblem(): ConcCellProblem {
  const metal = pick(CONC_METALS)
  const [high, low] = pick(CONC_RATIOS)
  const { symbol, ion, n } = metal
  const r = concentrationCellEmf(high, low, n, 298.15)
  return {
    context: [
      `Concentration cell:  ${symbol} | ${ion}(${low} M) || ${ion}(${high} M) | ${symbol}`,
      `Both electrodes are ${symbol} metal.  n = ${n}`,
      `T = 25°C`,
    ].join('\n'),
    question: `Calculate the EMF (V) of this concentration cell.`,
    placeholder: 'e.g. 0.0592',
    answer: r.E,
    answerDisplay: `${r.E.toFixed(4)} V`,
    steps: r.steps,
  }
}

export function checkConcCellAnswer(raw: string, problem: ConcCellProblem): boolean {
  const userVal = parseFloat(raw.replace(/,/g, ''))
  if (isNaN(userVal)) return false
  return Math.abs(userVal - problem.answer) <= 0.001
}

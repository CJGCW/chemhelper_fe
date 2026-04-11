// ── Constants ─────────────────────────────────────────────────────────────────

export const R = 0.08206   // L·atm/(mol·K)

export const P_UNITS = ['atm', 'kPa', 'mmHg', 'torr'] as const
export type PUnit = typeof P_UNITS[number]
export type TUnit = 'K' | 'C'
export type GasVar = 'P' | 'V' | 'n' | 'T'

export const TO_ATM: Record<PUnit, number> = {
  atm: 1, kPa: 1 / 101.325, mmHg: 1 / 760, torr: 1 / 760,
}

export const R_TABLE = [
  { val: '0.08206', units: 'L·atm/(mol·K)',  use: 'atm'  },
  { val: '8.314',   units: 'L·kPa/(mol·K)',  use: 'kPa'  },
  { val: '62.36',   units: 'L·mmHg/(mol·K)', use: 'mmHg' },
  { val: '62.36',   units: 'L·torr/(mol·K)', use: 'torr' },
] as const

export const EXAMPLES = [
  { q: '2.00 mol at 300 K and 1.50 atm — find V.',
    eq: 'V = nRT / P',
    steps: ['V = (2.00 × 0.08206 × 300) / 1.50', 'V = 49.24 / 1.50'],
    ans: 'V = 32.8 L' },
  { q: '0.500 mol in 10.0 L at 298 K — find P.',
    eq: 'P = nRT / V',
    steps: ['P = (0.500 × 0.08206 × 298) / 10.0', 'P = 12.23 / 10.0'],
    ans: 'P = 1.22 atm' },
  { q: '1.50 atm, 5.00 L, 1.00 mol — find T.',
    eq: 'T = PV / nR',
    steps: ['T = (1.50 × 5.00) / (1.00 × 0.08206)', 'T = 7.50 / 0.08206'],
    ans: 'T = 91.4 K' },
  { q: '3.00 L at 1.50 atm and 350 K — find n.',
    eq: 'n = PV / RT',
    steps: ['n = (1.50 × 3.00) / (0.08206 × 350)', 'n = 4.50 / 28.72'],
    ans: 'n = 0.157 mol' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export const sf   = (v: number, n = 4) => parseFloat(v.toPrecision(n)).toString()
export const sf3  = (v: number) => parseFloat(v.toPrecision(3))
export const toK  = (v: number, u: TUnit) => u === 'C' ? v + 273.15 : v
export const fromK = (v: number, u: TUnit) => u === 'C' ? v - 273.15 : v
export const toAtm  = (v: number, u: PUnit) => v * TO_ATM[u]
export const fromAtm = (v: number, u: PUnit) => v / TO_ATM[u]

// ── Practice problem types + generator ───────────────────────────────────────

export interface GasProblem {
  solveFor: GasVar
  pUnit: PUnit
  givenP?: number   // in pUnit
  givenV?: number   // L
  givenN?: number   // mol
  givenT?: number   // K
  answer: number
  answerUnit: string
  question: string
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function genGasProblem(): GasProblem {
  const solveFor = pick<GasVar>(['P', 'V', 'n', 'T'])
  const pUnit    = pick(P_UNITS)

  const n = sf3(0.2  + Math.random() * 4.8)
  const T = sf3(250  + Math.random() * 350)
  const V = sf3(2.0  + Math.random() * 28.0)
  const P = sf3(fromAtm((n * R * T) / V, pUnit))

  switch (solveFor) {
    case 'P': return {
      solveFor, pUnit, givenV: V, givenN: n, givenT: T,
      answer: sf3(fromAtm((n * R * T) / V, pUnit)), answerUnit: pUnit,
      question: `A gas sample contains ${n} mol and occupies ${V} L at ${T} K. Find the pressure in ${pUnit}.`,
    }
    case 'V': return {
      solveFor, pUnit, givenP: P, givenN: n, givenT: T,
      answer: sf3((n * R * T) / toAtm(P, pUnit)), answerUnit: 'L',
      question: `A gas contains ${n} mol at ${P} ${pUnit} and ${T} K. Find the volume in L.`,
    }
    case 'n': return {
      solveFor, pUnit, givenP: P, givenV: V, givenT: T,
      answer: sf3((toAtm(P, pUnit) * V) / (R * T)), answerUnit: 'mol',
      question: `A ${V} L container holds a gas at ${P} ${pUnit} and ${T} K. How many moles are present?`,
    }
    case 'T': return {
      solveFor, pUnit, givenP: P, givenV: V, givenN: n,
      answer: sf3((toAtm(P, pUnit) * V) / (n * R)), answerUnit: 'K',
      question: `A gas exerts ${P} ${pUnit} in a ${V} L container with ${n} mol. Find the temperature in K.`,
    }
  }
}

export function checkGasAnswer(problem: GasProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val) || val <= 0) return false
  return Math.abs((val - problem.answer) / problem.answer) <= 0.02
}

export function gasSolutionSteps(problem: GasProblem): string[] {
  const { solveFor, pUnit } = problem
  const Patm = problem.givenP !== undefined ? toAtm(problem.givenP, pUnit) : undefined
  const conv = pUnit !== 'atm' && Patm !== undefined
    ? [`Convert P: ${problem.givenP} ${pUnit} = ${sf(Patm)} atm`] : []

  switch (solveFor) {
    case 'P': return [
      'P = nRT / V',
      `P = (${problem.givenN} mol × ${R} × ${problem.givenT} K) / ${problem.givenV} L`,
      `P = ${sf(problem.answer)} ${pUnit}`,
    ]
    case 'V': return [
      'V = nRT / P', ...conv,
      `V = (${problem.givenN} mol × ${R} × ${problem.givenT} K) / ${sf(Patm!)} atm`,
      `V = ${sf(problem.answer)} L`,
    ]
    case 'n': return [
      'n = PV / RT', ...conv,
      `n = (${sf(Patm!)} atm × ${problem.givenV} L) / (${R} × ${problem.givenT} K)`,
      `n = ${sf(problem.answer)} mol`,
    ]
    case 'T': return [
      'T = PV / nR', ...conv,
      `T = (${sf(Patm!)} atm × ${problem.givenV} L) / (${problem.givenN} mol × ${R})`,
      `T = ${sf(problem.answer)} K`,
    ]
  }
}

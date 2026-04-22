import {
  calcVolToMass as _calcVolToMass,
  calcMassToVol as _calcMassToVol,
  calcVolToVol as _calcVolToVol,
  type AcidSolidRxn as _AcidSolidRxn,
  type AcidBaseRxn as _AcidBaseRxn,
} from '../chem/solutions'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SolStoichType = 'vol_to_mass' | 'mass_to_vol' | 'vol_to_vol'

export interface SolStoichProblem {
  type:       SolStoichType
  equation:   string
  question:   string
  answer:     number
  answerUnit: string
  steps:      string[]
}

// ── Reaction data ─────────────────────────────────────────────────────────────

export type AcidSolidRxn = _AcidSolidRxn
export type AcidBaseRxn  = _AcidBaseRxn

export const ACID_SOLID_RXNS: AcidSolidRxn[] = [
  {
    name: 'Calcium carbonate in HCl',
    equation: 'CaCO₃(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)',
    solidDisplay: 'CaCO₃', solidName: 'calcium carbonate',
    solidCoeff: 1, solidMolarMass: 100.087,
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 2,
  },
  {
    name: 'Magnesium in HCl',
    equation: 'Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g)',
    solidDisplay: 'Mg', solidName: 'magnesium',
    solidCoeff: 1, solidMolarMass: 24.305,
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 2,
  },
  {
    name: 'Zinc in sulfuric acid',
    equation: 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)',
    solidDisplay: 'Zn', solidName: 'zinc',
    solidCoeff: 1, solidMolarMass: 65.38,
    acidDisplay: 'H₂SO₄', acidName: 'sulfuric acid', acidCoeff: 1,
  },
  {
    name: 'Sodium carbonate in HCl',
    equation: 'Na₂CO₃(s) + 2 HCl(aq) → 2 NaCl(aq) + H₂O(l) + CO₂(g)',
    solidDisplay: 'Na₂CO₃', solidName: 'sodium carbonate',
    solidCoeff: 1, solidMolarMass: 105.988,
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 2,
  },
  {
    name: 'Iron in HCl',
    equation: 'Fe(s) + 2 HCl(aq) → FeCl₂(aq) + H₂(g)',
    solidDisplay: 'Fe', solidName: 'iron',
    solidCoeff: 1, solidMolarMass: 55.845,
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 2,
  },
]

export const ACID_BASE_RXNS: AcidBaseRxn[] = [
  {
    name: 'HCl + NaOH',
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 1,
    baseDisplay: 'NaOH', baseName: 'sodium hydroxide', baseCoeff: 1,
  },
  {
    name: 'H₂SO₄ + NaOH',
    equation: 'H₂SO₄(aq) + 2 NaOH(aq) → Na₂SO₄(aq) + 2 H₂O(l)',
    acidDisplay: 'H₂SO₄', acidName: 'sulfuric acid', acidCoeff: 1,
    baseDisplay: 'NaOH', baseName: 'sodium hydroxide', baseCoeff: 2,
  },
  {
    name: 'HCl + Ca(OH)₂',
    equation: '2 HCl(aq) + Ca(OH)₂(aq) → CaCl₂(aq) + 2 H₂O(l)',
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 2,
    baseDisplay: 'Ca(OH)₂', baseName: 'calcium hydroxide', baseCoeff: 1,
  },
  {
    name: 'HCl + NH₃',
    equation: 'HCl(aq) + NH₃(aq) → NH₄Cl(aq)',
    acidDisplay: 'HCl', acidName: 'hydrochloric acid', acidCoeff: 1,
    baseDisplay: 'NH₃', baseName: 'ammonia', baseCoeff: 1,
  },
]

// ── Calculation functions (also used by solver UI) ────────────────────────────

export const calcVolToMass = _calcVolToMass
export const calcMassToVol = _calcMassToVol
export const calcVolToVol  = _calcVolToVol

// ── Helpers ───────────────────────────────────────────────────────────────────

function sig(x: number, n = 4): string {
  return parseFloat(x.toPrecision(n)).toString()
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const NICE_VOLS_ML  = [10.0, 15.0, 20.0, 25.0, 30.0, 40.0, 50.0]
const NICE_CONCS    = [0.100, 0.250, 0.500, 1.00, 1.50, 2.00]
const NICE_MASSES_G = [2.50, 5.00, 10.0, 15.0, 20.0, 25.0]

// ── Generators ────────────────────────────────────────────────────────────────

function genVolToMass(): SolStoichProblem {
  const rxn   = pick(ACID_SOLID_RXNS)
  const volML = pick(NICE_VOLS_ML)
  const conc  = pick(NICE_CONCS)
  const { steps, answer } = calcVolToMass(rxn, volML, conc)
  const question =
    `What mass of ${rxn.solidName} (${rxn.solidDisplay}) reacts completely with ` +
    `${volML.toFixed(1)} mL of ${sig(conc, 3)} M ${rxn.acidName} (${rxn.acidDisplay})?`
  return { type: 'vol_to_mass', equation: rxn.equation, question, answer, answerUnit: 'g', steps }
}

function genMassToVol(): SolStoichProblem {
  const rxn  = pick(ACID_SOLID_RXNS)
  const mass = pick(NICE_MASSES_G)
  const conc = pick(NICE_CONCS)
  const { steps, answer } = calcMassToVol(rxn, mass, conc)
  const question =
    `How many mL of ${sig(conc, 3)} M ${rxn.acidName} (${rxn.acidDisplay}) are needed to ` +
    `react completely with ${mass.toFixed(2)} g of ${rxn.solidName} (${rxn.solidDisplay})?`
  return { type: 'mass_to_vol', equation: rxn.equation, question, answer, answerUnit: 'mL', steps }
}

function genVolToVol(): SolStoichProblem {
  const rxn   = pick(ACID_BASE_RXNS)
  const volML = pick(NICE_VOLS_ML)
  const concA = pick(NICE_CONCS)
  const concB = pick(NICE_CONCS)
  const { steps, answer } = calcVolToVol(rxn, volML, concA, concB)
  const question =
    `How many mL of ${sig(concB, 3)} M ${rxn.baseName} (${rxn.baseDisplay}) are needed to ` +
    `neutralize ${volML.toFixed(1)} mL of ${sig(concA, 3)} M ${rxn.acidName} (${rxn.acidDisplay})?`
  return { type: 'vol_to_vol', equation: rxn.equation, question, answer, answerUnit: 'mL', steps }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateSolStoichProblem(type?: SolStoichType): SolStoichProblem {
  const t = type ?? pick<SolStoichType>(['vol_to_mass', 'mass_to_vol', 'vol_to_vol'])
  if (t === 'vol_to_mass') return genVolToMass()
  if (t === 'mass_to_vol') return genMassToVol()
  return genVolToVol()
}

export function checkSolStoichAnswer(problem: SolStoichProblem, userInput: string): boolean {
  const val = parseFloat(userInput)
  if (isNaN(val)) return false
  const ans = problem.answer
  if (ans === 0) return Math.abs(val) < 0.01
  return Math.abs((val - ans) / ans) <= 0.01
}

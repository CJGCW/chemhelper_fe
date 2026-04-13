export type ConcSubtype = 'percent_to_molarity' | 'molarity_to_percent' | 'ppm_to_molarity' | 'mole_fraction'

export interface ConcProblem {
  subtype: ConcSubtype
  question: string
  given: { label: string; value: string; unit: string }[]
  solveFor: string
  answer: number
  answerUnit: string
  steps: string[]
  hint?: string
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function f(x: number, dp = 4): string {
  return x.toFixed(dp)
}

function sig(x: number, n = 4): number {
  if (x === 0) return 0
  const d = Math.ceil(Math.log10(Math.abs(x)))
  const pow = 10 ** (n - d)
  return Math.round(x * pow) / pow
}

interface ConcentratedReagent {
  name: string
  formula: string
  massPercent: number
  density: number   // g/mL
  molarMass: number // g/mol
}

const CONCENTRATED_REAGENTS: ConcentratedReagent[] = [
  { name: 'hydrochloric acid',  formula: 'HCl',   massPercent: 37.0, density: 1.19, molarMass:  36.46 },
  { name: 'sulfuric acid',      formula: 'H₂SO₄', massPercent: 98.0, density: 1.84, molarMass:  98.08 },
  { name: 'nitric acid',        formula: 'HNO₃',  massPercent: 70.0, density: 1.42, molarMass:  63.01 },
  { name: 'sodium hydroxide',   formula: 'NaOH',  massPercent: 50.0, density: 1.53, molarMass:  40.00 },
]

interface PpmIon {
  name: string
  symbol: string
  molarMass: number
}

const PPM_IONS: PpmIon[] = [
  { name: 'iron(II)',   symbol: 'Fe²⁺',  molarMass: 55.85  },
  { name: 'lead(II)',   symbol: 'Pb²⁺',  molarMass: 207.2  },
  { name: 'calcium',    symbol: 'Ca²⁺',  molarMass: 40.08  },
  { name: 'copper(II)', symbol: 'Cu²⁺',  molarMass: 63.55  },
]

const PPM_VALUES = [50, 100, 200, 500, 1000, 2000, 5000]

interface MoleFractionSolute {
  name: string
  formula: string
  molarMass: number
}

const MOLE_FRACTION_SOLUTES: MoleFractionSolute[] = [
  { name: 'glucose',  formula: 'C₆H₁₂O₆',    molarMass: 180.16 },
  { name: 'sucrose',  formula: 'C₁₂H₂₂O₁₁',  molarMass: 342.30 },
  { name: 'ethanol',  formula: 'C₂H₅OH',      molarMass:  46.07 },
  { name: 'NaCl',     formula: 'NaCl',         molarMass:  58.44 },
]

const SOLUTE_MASSES_G  = [5.0, 9.0, 10.0, 18.0, 25.0, 36.0, 45.0, 50.0, 90.0]
const WATER_MASSES_G   = [50.0, 75.0, 100.0, 150.0, 200.0, 250.0, 500.0]

function genPercentToMolarity(): ConcProblem {
  const reagent = pick(CONCENTRATED_REAGENTS)
  const w = reagent.massPercent
  const rho = reagent.density
  const Mw = reagent.molarMass
  const C = sig((w / 100 * rho * 1000) / Mw, 4)

  return {
    subtype: 'percent_to_molarity',
    question: `Concentrated ${reagent.name} (${reagent.formula}) is ${f(w, 1)}% (w/w) with a density of ${f(rho, 2)} g/mL. Its molar mass is ${f(Mw, 2)} g/mol. Calculate the molarity.`,
    given: [
      { label: 'w%',  value: f(w, 1),   unit: '% (w/w)' },
      { label: 'ρ',   value: f(rho, 2), unit: 'g/mL'    },
      { label: 'Mw',  value: f(Mw, 2),  unit: 'g/mol'   },
    ],
    solveFor: 'C',
    answer: C,
    answerUnit: 'mol/L',
    steps: [
      'C = (w/100 × ρ × 1000) / Mw',
      `C = (${f(w, 1)}/100 × ${f(rho, 2)} g/mL × 1000 mL/L) / ${f(Mw, 2)} g/mol`,
      `Numerator: ${f(w / 100, 4)} × ${f(rho, 2)} × 1000 = ${f(w / 100 * rho * 1000, 3)} g/L`,
      `C = ${f(w / 100 * rho * 1000, 3)} / ${f(Mw, 2)}`,
      `C = ${f(C, 4)} mol/L`,
    ],
    hint: 'The factor of 1000 converts g/mL to g/L.',
  }
}

function genMolarityToPercent(): ConcProblem {
  const reagent = pick(CONCENTRATED_REAGENTS)
  const rho = reagent.density
  const Mw = reagent.molarMass
  const C = sig(reagent.massPercent / 100 * rho * 1000 / Mw, 4)
  const wPct = sig((C * Mw) / (rho * 10), 4)

  return {
    subtype: 'molarity_to_percent',
    question: `A solution of ${reagent.name} (${reagent.formula}) has a concentration of ${f(C, 3)} mol/L, density ${f(rho, 2)} g/mL, and molar mass ${f(Mw, 2)} g/mol. Find the mass percent (w/w).`,
    given: [
      { label: 'C',  value: f(C, 3),   unit: 'mol/L' },
      { label: 'ρ',  value: f(rho, 2), unit: 'g/mL'  },
      { label: 'Mw', value: f(Mw, 2),  unit: 'g/mol' },
    ],
    solveFor: 'w%',
    answer: wPct,
    answerUnit: '%',
    steps: [
      'w% = (C × Mw) / (ρ × 10)',
      `w% = (${f(C, 3)} mol/L × ${f(Mw, 2)} g/mol) / (${f(rho, 2)} g/mL × 10)`,
      `Numerator: ${f(C * Mw, 3)} g/L`,
      `Denominator: ${f(rho * 10, 3)} (g/mL × 10)`,
      `w% = ${f(C * Mw / (rho * 10), 4)}%`,
    ],
    hint: 'The denominator ρ × 10 converts g/mL density to g/100 mL basis.',
  }
}

function genPpmToMolarity(): ConcProblem {
  const ion = pick(PPM_IONS)
  const ppm = pick(PPM_VALUES)
  const Mw = ion.molarMass
  const C = sig(ppm / (Mw * 1000), 4)

  return {
    subtype: 'ppm_to_molarity',
    question: `A water sample contains ${ppm} ppm of ${ion.name} ions (${ion.symbol}, Mw = ${f(Mw, 2)} g/mol). Convert to molarity (mol/L). Assume 1 ppm = 1 mg/L.`,
    given: [
      { label: 'ppm', value: String(ppm), unit: 'mg/L'   },
      { label: 'Mw',  value: f(Mw, 2),   unit: 'g/mol'  },
    ],
    solveFor: 'C',
    answer: C,
    answerUnit: 'mol/L',
    steps: [
      'C = ppm / (Mw × 1000)  [since 1 ppm = 1 mg/L = 0.001 g/L]',
      `C = ${ppm} mg/L ÷ (${f(Mw, 2)} g/mol × 1000 mg/g)`,
      `C = ${ppm} / ${f(Mw * 1000, 1)}`,
      `C = ${f(C, 6)} mol/L`,
    ],
    hint: '1 ppm = 1 mg/L for dilute aqueous solutions (density ≈ 1 g/mL).',
  }
}

function genMoleFraction(): ConcProblem {
  const solute = pick(MOLE_FRACTION_SOLUTES)
  const mSol = pick(SOLUTE_MASSES_G)
  const mWater = pick(WATER_MASSES_G)
  const Mw = solute.molarMass
  const nSol = mSol / Mw
  const nWater = mWater / 18.015
  const chi = sig(nSol / (nSol + nWater), 4)

  return {
    subtype: 'mole_fraction',
    question: `${f(mSol, 1)} g of ${solute.name} (${solute.formula}, Mw = ${f(Mw, 2)} g/mol) is dissolved in ${f(mWater, 1)} g of water. Calculate the mole fraction of the solute.`,
    given: [
      { label: 'm (solute)', value: f(mSol, 1),   unit: 'g'     },
      { label: 'm (water)',  value: f(mWater, 1),  unit: 'g'     },
      { label: 'Mw (solute)',value: f(Mw, 2),      unit: 'g/mol' },
    ],
    solveFor: 'χ (solute)',
    answer: chi,
    answerUnit: '(dimensionless)',
    steps: [
      'χ = n_sol / (n_sol + n_water)',
      `n_sol = ${f(mSol, 1)} g / ${f(Mw, 2)} g/mol = ${f(nSol, 6)} mol`,
      `n_water = ${f(mWater, 1)} g / 18.015 g/mol = ${f(nWater, 6)} mol`,
      `χ = ${f(nSol, 6)} / (${f(nSol, 6)} + ${f(nWater, 6)})`,
      `χ = ${f(nSol, 6)} / ${f(nSol + nWater, 6)}`,
      `χ = ${f(chi, 6)}`,
    ],
    hint: 'Molar mass of water = 18.015 g/mol.',
  }
}

export function genConcProblem(subtype: ConcSubtype): ConcProblem {
  switch (subtype) {
    case 'percent_to_molarity': return genPercentToMolarity()
    case 'molarity_to_percent': return genMolarityToPercent()
    case 'ppm_to_molarity':     return genPpmToMolarity()
    case 'mole_fraction':       return genMoleFraction()
  }
}

export function checkConcAnswer(userInput: string, problem: ConcProblem): boolean {
  const val = parseFloat(userInput.trim())
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 1e-9
  return Math.abs(val - problem.answer) / Math.abs(problem.answer) <= 0.02
}

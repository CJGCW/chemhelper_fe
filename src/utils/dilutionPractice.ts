export type DilutionSubtype = 'find_c2' | 'find_v2' | 'find_v1'

export interface DilutionProblem {
  subtype: DilutionSubtype
  question: string
  given: { label: string; value: string; unit: string }[]
  solveFor: string
  answer: number
  answerUnit: string
  steps: string[]
  hint?: string
}

const COMPOUNDS = ['NaOH', 'HCl', 'H₂SO₄', 'NaCl', 'glucose', 'KMnO₄', 'CuSO₄', 'acetic acid']

const NICE_CONC = [0.100, 0.200, 0.250, 0.500, 1.00, 1.50, 2.00, 3.00, 4.00, 6.00]
const NICE_VOL_ML = [10, 20, 25, 50, 75, 100, 150, 200, 250, 500]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function f(x: number, dp = 3): string {
  return x.toFixed(dp)
}

function sig(x: number, n = 4): number {
  if (x === 0) return 0
  const d = Math.ceil(Math.log10(Math.abs(x)))
  const pow = 10 ** (n - d)
  return Math.round(x * pow) / pow
}

export function genDilutionProblem(subtype: DilutionSubtype): DilutionProblem {
  const compound = pick(COMPOUNDS)

  if (subtype === 'find_c2') {
    const c1 = pick(NICE_CONC)
    const v1_mL = pick(NICE_VOL_ML)
    let v2_mL = pick(NICE_VOL_ML.filter(v => v > v1_mL))
    if (!v2_mL) v2_mL = v1_mL * 2
    const v1_L = v1_mL / 1000
    const v2_L = v2_mL / 1000
    const c2 = sig(c1 * v1_L / v2_L, 4)

    return {
      subtype,
      question: `${f(v1_mL, 1)} mL of ${f(c1, 3)} M ${compound} is diluted to a final volume of ${f(v2_mL, 1)} mL. What is the final concentration C₂?`,
      given: [
        { label: 'C₁', value: f(c1, 3), unit: 'mol/L' },
        { label: 'V₁', value: f(v1_mL, 1), unit: 'mL' },
        { label: 'V₂', value: f(v2_mL, 1), unit: 'mL' },
      ],
      solveFor: 'C₂',
      answer: c2,
      answerUnit: 'mol/L',
      steps: [
        'C₁V₁ = C₂V₂  →  C₂ = C₁V₁ / V₂',
        `Convert volumes: V₁ = ${v1_mL} mL = ${f(v1_L, 4)} L, V₂ = ${v2_mL} mL = ${f(v2_L, 4)} L`,
        `C₂ = (${f(c1, 3)} mol/L × ${f(v1_L, 4)} L) / ${f(v2_L, 4)} L`,
        `C₂ = ${f(c1 * v1_L, 5)} / ${f(v2_L, 4)}`,
        `C₂ = ${f(c2, 4)} mol/L`,
      ],
      hint: 'Dilution always decreases concentration since V₂ > V₁.',
    }
  }

  if (subtype === 'find_v2') {
    const c1 = pick(NICE_CONC)
    const v1_mL = pick(NICE_VOL_ML)
    const c2Options = NICE_CONC.filter(c => c < c1)
    const c2 = c2Options.length > 0 ? pick(c2Options) : sig(c1 / 2, 4)
    const v1_L = v1_mL / 1000
    const v2_L = sig(c1 * v1_L / c2, 4)
    const v2_mL = sig(v2_L * 1000, 4)

    return {
      subtype,
      question: `You have ${f(v1_mL, 1)} mL of ${f(c1, 3)} M ${compound}. How many mL of solution do you need to prepare to dilute it to ${f(c2, 3)} M?`,
      given: [
        { label: 'C₁', value: f(c1, 3), unit: 'mol/L' },
        { label: 'V₁', value: f(v1_mL, 1), unit: 'mL' },
        { label: 'C₂', value: f(c2, 3), unit: 'mol/L' },
      ],
      solveFor: 'V₂',
      answer: v2_mL,
      answerUnit: 'mL',
      steps: [
        'C₁V₁ = C₂V₂  →  V₂ = C₁V₁ / C₂',
        `Convert: V₁ = ${v1_mL} mL = ${f(v1_L, 4)} L`,
        `V₂ = (${f(c1, 3)} mol/L × ${f(v1_L, 4)} L) / ${f(c2, 3)} mol/L`,
        `V₂ = ${f(v2_L, 4)} L`,
        `V₂ = ${f(v2_mL, 2)} mL`,
      ],
      hint: 'V₂ is the final total volume, not the volume of solvent added.',
    }
  }

  // find_v1: given C₁, C₂, V₂ → find V₁ (volume of stock to take)
  const c2 = pick(NICE_CONC)
  const c1Options = NICE_CONC.filter(c => c > c2)
  const c1 = c1Options.length > 0 ? pick(c1Options) : sig(c2 * 4, 4)
  const v2_mL = pick(NICE_VOL_ML)
  const v2_L = v2_mL / 1000
  const v1_L = sig(c2 * v2_L / c1, 4)
  const v1_mL = sig(v1_L * 1000, 4)

  return {
    subtype,
    question: `What volume of ${f(c1, 3)} M ${compound} stock solution must be taken to prepare ${f(v2_mL, 1)} mL of ${f(c2, 3)} M solution?`,
    given: [
      { label: 'C₁', value: f(c1, 3), unit: 'mol/L' },
      { label: 'C₂', value: f(c2, 3), unit: 'mol/L' },
      { label: 'V₂', value: f(v2_mL, 1), unit: 'mL' },
    ],
    solveFor: 'V₁',
    answer: v1_mL,
    answerUnit: 'mL',
    steps: [
      'C₁V₁ = C₂V₂  →  V₁ = C₂V₂ / C₁',
      `Convert: V₂ = ${v2_mL} mL = ${f(v2_L, 4)} L`,
      `V₁ = (${f(c2, 3)} mol/L × ${f(v2_L, 4)} L) / ${f(c1, 3)} mol/L`,
      `V₁ = ${f(v1_L, 4)} L`,
      `V₁ = ${f(v1_mL, 2)} mL`,
    ],
    hint: 'V₁ < V₂ since you are diluting a concentrated stock.',
  }
}

export function checkDilutionAnswer(userInput: string, problem: DilutionProblem): boolean {
  const val = parseFloat(userInput.trim())
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 1e-9
  return Math.abs(val - problem.answer) / Math.abs(problem.answer) <= 0.02
}

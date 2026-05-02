import {
  generateProblem, solveEmpiricalFormula, formulasMatch,
  COMPOUND_POOL, type GeneratedProblem,
} from './empiricalFormula'

// ── Hardcoded molar masses for practice generation ────────────────────────────
// (covers every element that appears in COMPOUND_POOL)

export const PRACTICE_MOLAR_MASSES: Record<string, number> = {
  H:  1.008,  C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Na: 22.990, Mg: 24.305, Al: 26.982,
  Si: 28.085, P: 30.974,  S: 32.06,  Cl: 35.45,
  K: 39.098, Ca: 40.078, Ti: 47.867, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Cu: 63.546, Zn: 65.38,
  Br: 79.904, I: 126.904, Ba: 137.327,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmpiricalProblem {
  compoundName:    string
  elements:        { symbol: string; percent: number }[]
  empiricalDisplay: string    // Unicode: CH₂O
  empiricalASCII:   string    // plain:   CH2O
  hint?:           string
  steps:           string[]
  isDynamic?:      boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, dp = 4): string {
  return parseFloat(n.toPrecision(dp)).toString()
}

function buildSteps(p: GeneratedProblem): string[] {
  const mm = PRACTICE_MOLAR_MASSES
  const result = solveEmpiricalFormula(
    p.elements.map(e => ({ symbol: e.symbol, value: e.percent })),
    mm,
  )
  if (!result) return []

  const steps: string[] = []

  // Step 1
  const step1Parts = p.elements.map(e => `${e.symbol} = ${e.percent} g`).join(', ')
  steps.push(`Assume 100 g sample: ${step1Parts}`)

  // Step 2
  const step2Parts = result.rows
    .map(r => `${r.symbol}: ${fmt(r.inputValue, 5)} ÷ ${fmt(r.molarMass, 5)} = ${fmt(r.moles, 4)} mol`)
    .join(';  ')
  steps.push(`Divide by molar mass: ${step2Parts}`)

  // Step 3
  const minMoles = Math.min(...result.rows.map(r => r.moles))
  const step3Parts = result.rows
    .map(r => `${r.symbol}: ${fmt(r.moles, 4)} ÷ ${fmt(minMoles, 4)} = ${fmt(r.ratio, 4)}`)
    .join(';  ')
  steps.push(`Divide by smallest (${fmt(minMoles, 4)} mol): ${step3Parts}`)

  // Step 4 — multiplier
  if (result.multiplier > 1) {
    const step4Parts = result.rows
      .map(r => `${r.symbol}: ${fmt(r.ratio, 4)} × ${result.multiplier} ≈ ${r.subscript}`)
      .join(';  ')
    steps.push(`Multiply ratios by ${result.multiplier} for whole numbers: ${step4Parts}`)
  }

  steps.push(`Empirical formula: ${p.empiricalDisplay}`)
  return steps
}

// ── Generator ─────────────────────────────────────────────────────────────────

export function generateEmpiricalProblem(): EmpiricalProblem {
  // Try random compounds until one succeeds (some formulas may have unknown elements)
  for (let attempt = 0; attempt < 50; attempt++) {
    const template = COMPOUND_POOL[Math.floor(Math.random() * COMPOUND_POOL.length)]
    const p = generateProblem(template, PRACTICE_MOLAR_MASSES)
    if (!p) continue
    return {
      compoundName:     p.compoundName,
      elements:         p.elements,
      empiricalDisplay: p.empiricalDisplay,
      empiricalASCII:   p.empiricalASCII,
      hint:             p.hint,
      steps:            buildSteps(p),
    }
  }
  // Fallback to water
  return {
    compoundName: 'water',
    elements: [{ symbol: 'H', percent: 11.19 }, { symbol: 'O', percent: 88.81 }],
    empiricalDisplay: 'H₂O',
    empiricalASCII: 'H2O',
    steps: ['Assume 100 g: H = 11.19 g, O = 88.81 g', 'Moles: H = 11.10 mol, O = 5.55 mol', 'Ratio: H = 2.00, O = 1.00', 'Empirical formula: H₂O'],
  }
}

// ── Answer checker ────────────────────────────────────────────────────────────

export function checkEmpiricalAnswer(input: string, problem: EmpiricalProblem): boolean {
  return formulasMatch(input.trim(), problem.empiricalASCII)
}

// ── Dynamic generator ─────────────────────────────────────────────────────────
//
// Picks a random compound from COMPOUND_POOL, then applies a random total sample
// mass (5–50 g with one decimal place) rather than always assuming a 100 g sample.
// The percent composition is derived from the molecular formula so the numbers
// are always self-consistent; the student is given actual masses of each element
// and must work out the empirical formula.
//
// Because the problem is framed differently (masses instead of percentages) the
// EmpiricalProblem shape is preserved but `elements[].percent` holds the actual
// gram value for that element in the sample.

export function generateDynamicEmpiricalProblem(): EmpiricalProblem {
  const mm = PRACTICE_MOLAR_MASSES

  for (let attempt = 0; attempt < 100; attempt++) {
    const template = COMPOUND_POOL[Math.floor(Math.random() * COMPOUND_POOL.length)]
    const p = generateProblem(template, mm)
    if (!p) continue

    // Random total sample mass: 5.0–50.0 g, one decimal
    const totalMass = parseFloat((5 + Math.random() * 45).toFixed(1))

    // Convert each percent to actual grams in this sample
    const sampledElements = p.elements.map(e => ({
      symbol: e.symbol,
      percent: parseFloat(((e.percent / 100) * totalMass).toFixed(2)),
    }))

    // Verify all elements have known molar masses
    if (!sampledElements.every(e => mm[e.symbol])) continue

    // Build steps treating the values as actual masses (not assuming 100 g)
    const result = solveEmpiricalFormula(
      sampledElements.map(e => ({ symbol: e.symbol, value: e.percent })),
      mm,
    )
    if (!result) continue

    const steps: string[] = []
    const step1Parts = sampledElements.map(e => `${e.symbol} = ${e.percent} g`).join(', ')
    steps.push(`Given sample masses: ${step1Parts} (total ≈ ${totalMass} g)`)

    const minMoles = Math.min(...result.rows.map(r => r.moles))
    const step2Parts = result.rows
      .map(r => `${r.symbol}: ${r.inputValue.toFixed(3)} ÷ ${r.molarMass.toFixed(3)} = ${r.moles.toFixed(4)} mol`)
      .join(';  ')
    steps.push(`Divide by molar mass: ${step2Parts}`)

    const step3Parts = result.rows
      .map(r => `${r.symbol}: ${r.moles.toFixed(4)} ÷ ${minMoles.toFixed(4)} = ${r.ratio.toFixed(4)}`)
      .join(';  ')
    steps.push(`Divide by smallest (${minMoles.toFixed(4)} mol): ${step3Parts}`)

    if (result.multiplier > 1) {
      const step4Parts = result.rows
        .map(r => `${r.symbol}: ${r.ratio.toFixed(4)} × ${result.multiplier} ≈ ${r.subscript}`)
        .join(';  ')
      steps.push(`Multiply ratios by ${result.multiplier} for whole numbers: ${step4Parts}`)
    }
    steps.push(`Empirical formula: ${p.empiricalDisplay}`)

    return {
      compoundName: p.compoundName,
      elements: sampledElements,
      empiricalDisplay: p.empiricalDisplay,
      empiricalASCII: p.empiricalASCII,
      hint: p.hint
        ? `${p.hint} (total sample mass: ${totalMass} g)`
        : `Total sample mass: ${totalMass} g`,
      steps,
      isDynamic: true,
    }
  }

  // Fallback to the pool generator
  return generateEmpiricalProblem()
}

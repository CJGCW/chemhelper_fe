import type { Element } from '../types'

// ── Molar mass map from backend data ─────────────────────────────────────────

// atomicWeight strings can be "12.011", "12.011(2)", "[208]", etc.
function parseAtomicWeight(w: string): number | null {
  const cleaned = w.replace(/[[\]]/g, '').split('(')[0].trim()
  const n = parseFloat(cleaned)
  return isFinite(n) && n > 0 ? n : null
}

export function buildMolarMasses(elements: Element[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const el of elements) {
    const m = parseAtomicWeight(el.atomicWeight)
    if (m !== null) map[el.symbol] = m
  }
  return map
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  a = Math.round(a); b = Math.round(b)
  while (b) { [a, b] = [b, a % b] }
  return a
}

function isNearInt(x: number, tol = 0.085): boolean {
  return Math.abs(x - Math.round(x)) < tol
}

export function findMultiplier(ratios: number[]): number {
  for (let m = 1; m <= 8; m++) {
    if (ratios.every(r => isNearInt(r * m))) return m
  }
  return 1
}

// ── Formula parser (handles parentheses like Ca(OH)2) ────────────────────────

export function parseFormula(s: string): Record<string, number> | null {
  const stack: Record<string, number>[] = [{}]
  let i = 0
  while (i < s.length) {
    if (s[i] === '(') {
      stack.push({})
      i++
    } else if (s[i] === ')') {
      i++
      let numStr = ''
      while (i < s.length && /\d/.test(s[i])) numStr += s[i++]
      const n = parseInt(numStr || '1')
      const top = stack.pop()!
      const prev = stack[stack.length - 1]
      for (const [el, cnt] of Object.entries(top)) {
        prev[el] = (prev[el] ?? 0) + cnt * n
      }
    } else if (/[A-Z]/.test(s[i])) {
      let sym = s[i++]
      while (i < s.length && /[a-z]/.test(s[i])) sym += s[i++]
      let numStr = ''
      while (i < s.length && /\d/.test(s[i])) numStr += s[i++]
      const n = parseInt(numStr || '1')
      const top = stack[stack.length - 1]
      top[sym] = (top[sym] ?? 0) + n
    } else {
      i++ // skip unknown characters
    }
  }
  const result = stack[0]
  return Object.keys(result).length > 0 ? result : null
}

// ── Formula formatting ────────────────────────────────────────────────────────

const SUB: Record<string, string> = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' }

export function toSubscript(n: number): string {
  return n === 1 ? '' : String(n).split('').map(c => SUB[c] ?? c).join('')
}

// Hill notation: C first, H second, then alphabetical
function hillKey(el: string): string {
  if (el === 'C') return '\x00'
  if (el === 'H') return '\x01'
  return el
}

// Unicode subscript version (for display)
export function formatFormula(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => { const ka = hillKey(a[0]); const kb = hillKey(b[0]); return ka < kb ? -1 : ka > kb ? 1 : 0 })
    .map(([el, n]) => n === 1 ? el : `${el}${toSubscript(n)}`)
    .join('')
}

// ASCII version (for comparison with user-typed formulas)
function formatASCIIFormula(counts: Record<string, number>): string {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => { const ka = hillKey(a[0]); const kb = hillKey(b[0]); return ka < kb ? -1 : ka > kb ? 1 : 0 })
    .map(([el, n]) => n === 1 ? el : `${el}${n}`)
    .join('')
}

// Normalize to smallest whole-number ratio
export function normalizeFormula(f: Record<string, number>): Record<string, number> {
  const vals = Object.values(f).filter(v => v > 0)
  if (vals.length === 0) return {}
  const g = vals.reduce(gcd)
  return Object.fromEntries(
    Object.entries(f).filter(([, v]) => v > 0).map(([el, n]) => [el, n / g])
  )
}

// Canonicalize a user-typed formula string to Hill-ordered ASCII (e.g. "OH" → "HO")
function canonicalize(s: string): string | null {
  const f = parseFormula(s)
  if (!f) return null
  return formatASCIIFormula(f)
}

// Exact match: user must supply the same element counts (order-independent, Hill normalized)
// "CH2O" and "H2CO" match; "H2O2" and "HO" do NOT match
export function exactFormulaMatch(a: string, b: string): boolean {
  const ca = canonicalize(a)
  const cb = canonicalize(b)
  return ca !== null && cb !== null && ca === cb
}

// Normalized match (for general use): H2O2 and HO both reduce to HO
export function formulasMatch(a: string, b: string): boolean {
  const fa = parseFormula(a)
  const fb = parseFormula(b)
  if (!fa || !fb) return false
  const na = normalizeFormula(fa)
  const nb = normalizeFormula(fb)
  return formatASCIIFormula(na) === formatASCIIFormula(nb)
}

// ── Empirical formula solver ──────────────────────────────────────────────────

export interface SolverInput {
  symbol: string
  value: number   // grams (treating % directly as g in 100g sample)
}

export interface SolverRow {
  symbol: string
  molarMass: number
  inputValue: number
  moles: number
  ratio: number
  subscript: number
}

export interface SolverResult {
  rows: SolverRow[]
  multiplier: number
  empiricalFormula: string
  empiricalMolarMass: number
  molecularMultiplier?: number
  molecularFormula?: string
  molecularMassWarning?: string
}

export function solveEmpiricalFormula(
  inputs: SolverInput[],
  molarMasses: Record<string, number>,
  molecularMass?: number,
): SolverResult | null {
  if (inputs.length < 1) return null

  const rows: SolverRow[] = []
  for (const { symbol, value } of inputs) {
    const M = molarMasses[symbol]
    if (!M || isNaN(value) || value <= 0) return null
    rows.push({ symbol, molarMass: M, inputValue: value, moles: value / M, ratio: 0, subscript: 0 })
  }

  const minMoles = Math.min(...rows.map(r => r.moles))
  if (minMoles <= 0) return null

  for (const r of rows) r.ratio = r.moles / minMoles

  const multiplier = findMultiplier(rows.map(r => r.ratio))
  for (const r of rows) r.subscript = Math.round(r.ratio * multiplier)

  const empiricalFormula = formatFormula(Object.fromEntries(rows.map(r => [r.symbol, r.subscript])))
  const empiricalMolarMass = rows.reduce((sum, r) => sum + r.subscript * r.molarMass, 0)

  let molecularMultiplier: number | undefined
  let molecularFormula: string | undefined
  let molecularMassWarning: string | undefined
  if (molecularMass && isFinite(molecularMass) && molecularMass > 0) {
    const rawRatio = molecularMass / empiricalMolarMass
    const rounded  = Math.round(rawRatio)
    const relErr   = Math.abs(rawRatio - rounded) / Math.max(rounded, 1)
    if (rounded >= 1 && relErr < 0.05) {
      molecularMultiplier = rounded
      molecularFormula = formatFormula(
        Object.fromEntries(rows.map(r => [r.symbol, r.subscript * rounded]))
      )
    } else {
      molecularMassWarning = rounded < 1
        ? 'Molecular mass is smaller than empirical mass — check your input.'
        : `Molecular mass doesn't fit a whole-number multiple of the empirical mass (ratio ≈ ${rawRatio.toFixed(2)}).`
    }
  }

  return { rows, multiplier, empiricalFormula, empiricalMolarMass, molecularMultiplier, molecularFormula, molecularMassWarning }
}

// ── Compound pool ─────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface CompoundTemplate {
  name: string
  formula: string   // molecular formula string, e.g. "C6H12O6"
  difficulty: Difficulty
  hint?: string
}

export const COMPOUND_POOL: CompoundTemplate[] = [
  // ── Easy — 2 elements, small subscripts ──────────────────────────────────
  { name: 'water',                         formula: 'H2O',        difficulty: 'easy' },
  { name: 'sodium chloride',               formula: 'NaCl',       difficulty: 'easy' },
  { name: 'magnesium oxide',               formula: 'MgO',        difficulty: 'easy' },
  { name: 'ammonia',                       formula: 'NH3',        difficulty: 'easy' },
  { name: 'methane',                       formula: 'CH4',        difficulty: 'easy' },
  { name: 'hydrogen chloride',             formula: 'HCl',        difficulty: 'easy' },
  { name: 'hydrogen sulfide',              formula: 'H2S',        difficulty: 'easy' },
  { name: 'sulfur dioxide',                formula: 'SO2',        difficulty: 'easy' },
  { name: 'carbon dioxide',                formula: 'CO2',        difficulty: 'easy' },
  { name: 'calcium oxide',                 formula: 'CaO',        difficulty: 'easy' },
  { name: 'iron(II) oxide',                formula: 'FeO',        difficulty: 'easy' },
  { name: 'copper(II) oxide',              formula: 'CuO',        difficulty: 'easy' },
  { name: 'zinc oxide',                    formula: 'ZnO',        difficulty: 'easy' },
  { name: 'potassium chloride',            formula: 'KCl',        difficulty: 'easy' },
  { name: 'sodium fluoride',               formula: 'NaF',        difficulty: 'easy' },
  { name: 'sodium bromide',                formula: 'NaBr',       difficulty: 'easy' },
  { name: 'potassium iodide',              formula: 'KI',         difficulty: 'easy' },
  { name: 'magnesium chloride',            formula: 'MgCl2',      difficulty: 'easy' },
  { name: 'calcium chloride',              formula: 'CaCl2',      difficulty: 'easy' },
  { name: 'silicon dioxide',               formula: 'SiO2',       difficulty: 'easy' },
  { name: 'titanium(IV) oxide',            formula: 'TiO2',       difficulty: 'easy' },
  { name: 'manganese(IV) oxide',           formula: 'MnO2',       difficulty: 'easy' },
  { name: 'sulfur trioxide',               formula: 'SO3',        difficulty: 'easy' },
  { name: 'nitric oxide',                  formula: 'NO',         difficulty: 'easy' },
  { name: 'nitrogen dioxide',              formula: 'NO2',        difficulty: 'easy' },
  // ── Medium — 2–3 elements, subscripts may share common factor ────────────
  { name: 'iron(III) oxide (rust)',        formula: 'Fe2O3',      difficulty: 'medium' },
  { name: 'aluminum oxide (corundum)',     formula: 'Al2O3',      difficulty: 'medium' },
  { name: 'calcium carbonate (limestone)',formula: 'CaCO3',       difficulty: 'medium' },
  { name: 'sodium hydroxide',             formula: 'NaOH',        difficulty: 'medium' },
  { name: 'nitric acid',                  formula: 'HNO3',        difficulty: 'medium' },
  { name: 'sulfuric acid',                formula: 'H2SO4',       difficulty: 'medium' },
  { name: 'phosphoric acid',              formula: 'H3PO4',       difficulty: 'medium' },
  { name: 'methanol',                     formula: 'CH4O',        difficulty: 'medium' },
  { name: 'ethanol',                      formula: 'C2H6O',       difficulty: 'medium' },
  { name: 'propane',                      formula: 'C3H8',        difficulty: 'medium' },
  { name: 'ethane',                       formula: 'C2H6',        difficulty: 'medium', hint: 'Both subscripts share a common factor.' },
  { name: 'dinitrogen tetroxide',         formula: 'N2O4',        difficulty: 'medium', hint: 'Divide both subscripts by 2.' },
  { name: 'hydrogen peroxide',            formula: 'H2O2',        difficulty: 'medium', hint: 'Equal mole ratio gives 1:1.' },
  { name: 'copper(I) oxide',              formula: 'Cu2O',        difficulty: 'medium' },
  { name: 'iron(III) chloride',           formula: 'FeCl3',       difficulty: 'medium' },
  { name: 'barium chloride',              formula: 'BaCl2',       difficulty: 'medium' },
  { name: 'chromium(III) oxide',          formula: 'Cr2O3',       difficulty: 'medium' },
  { name: 'magnetite',                    formula: 'Fe3O4',       difficulty: 'medium' },
  { name: 'hydrazine',                    formula: 'N2H4',        difficulty: 'medium', hint: 'Divide both subscripts by 2.' },
  { name: 'acetaldehyde',                 formula: 'C2H4O',       difficulty: 'medium' },
  { name: 'acetone',                      formula: 'C3H6O',       difficulty: 'medium' },
  { name: 'butane',                       formula: 'C4H10',       difficulty: 'medium', hint: 'Both subscripts share a common factor.' },
  { name: 'hexane',                       formula: 'C6H14',       difficulty: 'medium', hint: 'Both subscripts share a common factor.' },
  { name: 'phosphorus pentoxide',         formula: 'P4O10',       difficulty: 'medium' },
  { name: 'sodium carbonate',             formula: 'CNa2O3',      difficulty: 'medium' },
  { name: 'sodium bicarbonate',           formula: 'CHNaO3',      difficulty: 'medium' },
  { name: 'potassium permanganate',       formula: 'KMnO4',       difficulty: 'medium' },
  { name: 'calcium hydroxide',            formula: 'CaH2O2',      difficulty: 'medium' },
  { name: 'ammonium chloride',            formula: 'ClH4N',       difficulty: 'medium' },
  { name: 'urea',                         formula: 'CH4N2O',      difficulty: 'medium' },
  // ── Hard — complex ratios, 4+ elements, or molecular ≠ empirical ─────────
  { name: 'benzene',                      formula: 'C6H6',        difficulty: 'hard', hint: 'Empirical formula has a 1:1 ratio.' },
  { name: 'glucose',                      formula: 'C6H12O6',     difficulty: 'hard' },
  { name: 'fructose',                     formula: 'C6H12O6',     difficulty: 'hard' },
  { name: 'sucrose',                      formula: 'C12H22O11',   difficulty: 'hard' },
  { name: 'vitamin C (ascorbic acid)',    formula: 'C6H8O6',      difficulty: 'hard', hint: 'Try multiplying ratios by 3.' },
  { name: 'aspirin',                      formula: 'C9H8O4',      difficulty: 'hard' },
  { name: 'caffeine',                     formula: 'C8H10N4O2',   difficulty: 'hard', hint: 'All subscripts share a common factor.' },
  { name: 'ethylene (ethene)',            formula: 'C2H4',        difficulty: 'hard', hint: 'Both subscripts share factor 2.' },
  { name: 'acetylene (ethyne)',           formula: 'C2H2',        difficulty: 'hard', hint: 'Both subscripts share factor 2.' },
  { name: 'lactic acid',                 formula: 'C3H6O3',      difficulty: 'hard', hint: 'All subscripts share a common factor.' },
  { name: 'acetic acid (vinegar)',        formula: 'C2H4O2',      difficulty: 'hard', hint: 'All subscripts share a common factor.' },
  { name: 'oxalic acid',                 formula: 'C2H2O4',      difficulty: 'hard', hint: 'All subscripts share a common factor.' },
  { name: 'palmitic acid',               formula: 'C16H32O2',    difficulty: 'hard' },
  { name: 'ribose',                      formula: 'C5H10O5',     difficulty: 'hard' },
  { name: 'limonene',                    formula: 'C10H16',      difficulty: 'hard', hint: 'Both subscripts share a common factor.' },
  { name: 'naphthalene',                 formula: 'C10H8',       difficulty: 'hard', hint: 'Both subscripts share a common factor.' },
  { name: 'adrenaline (epinephrine)',    formula: 'C9H13NO3',    difficulty: 'hard' },
  { name: 'glycine (amino acid)',        formula: 'C2H5NO2',     difficulty: 'hard' },
  { name: 'octane',                      formula: 'C8H18',       difficulty: 'hard', hint: 'Both subscripts share a common factor.' },
  { name: 'butene',                      formula: 'C4H8',        difficulty: 'hard', hint: 'Both subscripts share a common factor.' },
  { name: 'styrene',                     formula: 'C8H8',        difficulty: 'hard', hint: 'Both subscripts share a common factor.' },
  { name: 'TNT (trinitrotoluene)',       formula: 'C7H5N3O6',    difficulty: 'hard' },
  { name: 'nicotine',                    formula: 'C10H14N2',    difficulty: 'hard', hint: 'All subscripts share a common factor.' },
  { name: 'ibuprofen',                   formula: 'C13H18O2',    difficulty: 'hard' },
  { name: 'tartaric acid',              formula: 'C4H6O6',      difficulty: 'hard', hint: 'All subscripts share a common factor.' },
]

// ── Problem generation ────────────────────────────────────────────────────────

export interface GeneratedProblem {
  compoundName: string
  difficulty: Difficulty
  elements: { symbol: string; percent: number }[]   // Hill order, sums to ~100
  empiricalDisplay: string     // Unicode subscripts for display: "CH₂O"
  empiricalASCII: string       // plain ASCII for comparison: "CH2O"
  molecularDisplay?: string    // Unicode: "C₆H₁₂O₆"
  molecularASCII?: string      // ASCII: "C6H12O6"
  molecularMass?: number       // given to student only when empirical ≠ molecular
  hint?: string
}

export function generateProblem(
  template: CompoundTemplate,
  molarMasses: Record<string, number>,
): GeneratedProblem | null {
  const molCounts = parseFormula(template.formula)
  if (!molCounts) return null

  // All elements must have known molar masses
  if (!Object.keys(molCounts).every(el => el in molarMasses)) return null

  const totalMass = Object.entries(molCounts)
    .reduce((s, [el, n]) => s + n * molarMasses[el], 0)

  const empCounts = normalizeFormula(molCounts)
  const firstEl = Object.keys(molCounts)[0]
  const molMultiplier = molCounts[firstEl] / empCounts[firstEl]
  const hasMolecular = Math.round(molMultiplier) > 1

  // Compute % composition in Hill order, adjust last element for rounding
  const hillEntries = Object.entries(molCounts)
    .sort((a, b) => { const ka = hillKey(a[0]); const kb = hillKey(b[0]); return ka < kb ? -1 : ka > kb ? 1 : 0 })
  let runningTotal = 0
  const elements = hillEntries.map(([el, n], i) => {
    if (i === hillEntries.length - 1) {
      return { symbol: el, percent: parseFloat((100 - runningTotal).toFixed(2)) }
    }
    const pct = parseFloat(((n * molarMasses[el] / totalMass) * 100).toFixed(2))
    runningTotal += pct
    return { symbol: el, percent: pct }
  })

  return {
    compoundName: template.name,
    difficulty: template.difficulty,
    elements,
    empiricalDisplay: formatFormula(empCounts),
    empiricalASCII: formatASCIIFormula(empCounts),
    molecularDisplay: hasMolecular ? formatFormula(molCounts) : undefined,
    molecularASCII: hasMolecular ? formatASCIIFormula(molCounts) : undefined,
    molecularMass: hasMolecular ? parseFloat(totalMass.toFixed(2)) : undefined,
    hint: template.hint,
  }
}

import type { Reaction, Species } from './stoichiometryPractice'

export interface CustomField { coeff: string; formula: string }
export const BLANK_FIELD: CustomField = { coeff: '1', formula: '' }

export const ATOMIC_MASSES: Record<string, number> = {
  H:1.008,  He:4.003, Li:6.941,  Be:9.012,  B:10.811,  C:12.011,  N:14.007,
  O:15.999, F:18.998, Ne:20.180, Na:22.990,  Mg:24.305, Al:26.982, Si:28.086,
  P:30.974, S:32.060, Cl:35.453, Ar:39.948,  K:39.098,  Ca:40.078, Sc:44.956,
  Ti:47.867,V:50.942, Cr:51.996, Mn:54.938,  Fe:55.845, Co:58.933, Ni:58.693,
  Cu:63.546,Zn:65.380,Ga:69.723, Ge:72.630,  As:74.922, Se:78.971, Br:79.904,
  Kr:83.798,Rb:85.468,Sr:87.620, Ag:107.87,  Sn:118.71, I:126.90,  Cs:132.91,
  Ba:137.33,La:138.91,Ce:140.12, Hg:200.59,  Pb:207.2,  Bi:208.98,
}

export function parseFormula(raw: string): Record<string, number> | null {
  const s = raw.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)])
  let pos = 0
  function group(): Record<string, number> {
    const counts: Record<string, number> = {}
    while (pos < s.length && s[pos] !== ')') {
      if (s[pos] === '(') {
        pos++
        const sub = group()
        if (s[pos] !== ')') throw new Error('unmatched (')
        pos++
        let n = ''
        while (pos < s.length && /\d/.test(s[pos])) n += s[pos++]
        const mult = n ? parseInt(n) : 1
        for (const [e, c] of Object.entries(sub)) counts[e] = (counts[e] ?? 0) + c * mult
      } else if (/[A-Z]/.test(s[pos])) {
        let elem = s[pos++]
        while (pos < s.length && /[a-z]/.test(s[pos])) elem += s[pos++]
        let n = ''
        while (pos < s.length && /\d/.test(s[pos])) n += s[pos++]
        counts[elem] = (counts[elem] ?? 0) + (n ? parseInt(n) : 1)
      } else {
        throw new Error(`unexpected: ${s[pos]}`)
      }
    }
    return counts
  }
  try {
    const counts = group()
    return pos === s.length ? counts : null
  } catch { return null }
}

export function calcMolarMass(formula: string): number | null {
  const counts = parseFormula(formula)
  if (!counts) return null
  let mass = 0
  for (const [elem, cnt] of Object.entries(counts)) {
    const m = ATOMIC_MASSES[elem]
    if (m === undefined) return null
    mass += m * cnt
  }
  return parseFloat(mass.toPrecision(6))
}

export interface ValidationResult {
  status: 'balanced' | 'unbalanced' | 'impossible' | 'error'
  message: string
  atomCounts?: { elem: string; left: number; right: number }[]
}

export function validateCustomReaction(reactants: CustomField[], products: CustomField[]): ValidationResult {
  const filledReactants = reactants.filter(r => r.formula.trim())
  if (filledReactants.length === 0)
    return { status: 'error', message: 'Enter at least one reactant formula' }

  const leftAtoms: Record<string, number> = {}
  const rightAtoms: Record<string, number> = {}

  for (const r of filledReactants) {
    const counts = parseFormula(r.formula.trim())
    if (!counts) return { status: 'error', message: `Cannot parse: ${r.formula}` }
    for (const elem of Object.keys(counts))
      if (!ATOMIC_MASSES[elem]) return { status: 'error', message: `Unknown element: ${elem}` }
    const coeff = parseInt(r.coeff) || 1
    for (const [e, c] of Object.entries(counts)) leftAtoms[e] = (leftAtoms[e] ?? 0) + c * coeff
  }

  for (const p of products) {
    if (!p.formula.trim()) continue
    const counts = parseFormula(p.formula.trim())
    if (!counts) return { status: 'error', message: `Cannot parse: ${p.formula}` }
    for (const elem of Object.keys(counts))
      if (!ATOMIC_MASSES[elem]) return { status: 'error', message: `Unknown element: ${elem}` }
    const coeff = parseInt(p.coeff) || 1
    for (const [e, c] of Object.entries(counts)) rightAtoms[e] = (rightAtoms[e] ?? 0) + c * coeff
  }

  for (const elem of Object.keys(rightAtoms))
    if (!leftAtoms[elem])
      return { status: 'impossible', message: `${elem} appears in products but not in reactants — reaction is impossible` }

  const allElems = [...new Set([...Object.keys(leftAtoms), ...Object.keys(rightAtoms)])]
  const atomCounts = allElems.map(e => ({ elem: e, left: leftAtoms[e] ?? 0, right: rightAtoms[e] ?? 0 }))
  const balanced = atomCounts.every(a => a.left === a.right)

  return balanced
    ? { status: 'balanced', message: 'Equation is balanced', atomCounts }
    : { status: 'unbalanced', message: 'Equation is not balanced', atomCounts }
}

export function buildCustomReaction(reactants: CustomField[], products: CustomField[]): Reaction | null {
  const rSpecies: Species[] = []
  for (const f of reactants) {
    if (!f.formula.trim()) return null
    const mass = calcMolarMass(f.formula.trim())
    if (mass === null) return null
    const coeff = parseInt(f.coeff) || 1
    rSpecies.push({ coeff, formula: f.formula.trim(), display: f.formula.trim(), name: f.formula.trim(), molarMass: mass })
  }
  if (rSpecies.length === 0) return null

  const pSpecies: Species[] = []
  for (const f of products) {
    if (!f.formula.trim()) continue
    const mass = calcMolarMass(f.formula.trim())
    if (mass === null) continue
    const coeff = parseInt(f.coeff) || 1
    pSpecies.push({ coeff, formula: f.formula.trim(), display: f.formula.trim(), name: f.formula.trim(), molarMass: mass })
  }

  const reactantSide = rSpecies.map(s => (s.coeff > 1 ? s.coeff + ' ' : '') + s.display).join(' + ')
  const productSide  = pSpecies.length
    ? pSpecies.map(s => (s.coeff > 1 ? s.coeff + ' ' : '') + s.display).join(' + ')
    : '?'
  return { name: 'Custom', reactants: rSpecies, products: pSpecies, equation: `${reactantSide} → ${productSide}` }
}

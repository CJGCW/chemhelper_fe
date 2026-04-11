// ── Types ─────────────────────────────────────────────────────────────────────

export type RedoxSubtype = 'ox_state' | 'identify_redox' | 'ox_change' | 'charge_balance'

export interface RedoxProblem {
  subtype:      RedoxSubtype
  question:     string
  answer:       string        // signed-int string for numeric; formula string for text
  answerUnit:   string
  isTextAnswer: boolean
  steps:        string[]
  hint?:        string
  reactionEq?:  string        // shown as a context block in the question
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

/** Parse "+6", "-2", "0", "6" → signed integer */
function parseSignedInt(s: string): number { return parseInt(s.trim(), 10) }

/** Normalise Unicode subscripts/superscripts + whitespace for formula comparison */
function normaliseFormula(s: string): string {
  return s
    .replace(/₀/g,'0').replace(/₁/g,'1').replace(/₂/g,'2').replace(/₃/g,'3')
    .replace(/₄/g,'4').replace(/₅/g,'5').replace(/₆/g,'6').replace(/₇/g,'7')
    .replace(/₈/g,'8').replace(/₉/g,'9')
    .replace(/⁺/g,'+').replace(/⁻/g,'-')
    .replace(/[²³⁴⁵⁶⁷]/g, c => ({ '²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7' }[c] ?? c))
    .replace(/\s+/g,'')
    .toLowerCase()
}

// ── 1. Oxidation-state assignment ─────────────────────────────────────────────

interface OxEntry {
  formula:  string     // display (Unicode subscripts)
  name:     string
  context?: string     // e.g. 'ion (charge 2−)' for polyatomic ions
  target:   string     // element symbol asked about
  answer:   number     // oxidation state
  steps:    string[]
  hint?:    string
}

const OX_ENTRIES: OxEntry[] = [
  // Pure elements / monoatomic ions
  {
    formula: 'Na⁺',  name: 'sodium ion',     target: 'Na', answer:  1,
    steps: ['Monoatomic ion: oxidation state = ionic charge.', 'Na⁺ → +1'],
  },
  {
    formula: 'Fe²⁺', name: 'iron(II) ion',   target: 'Fe', answer:  2,
    steps: ['Monoatomic ion: oxidation state = ionic charge.', 'Fe²⁺ → +2'],
  },
  {
    formula: 'Fe³⁺', name: 'iron(III) ion',  target: 'Fe', answer:  3,
    steps: ['Monoatomic ion: oxidation state = ionic charge.', 'Fe³⁺ → +3'],
  },
  {
    formula: 'Cl⁻',  name: 'chloride ion',   target: 'Cl', answer: -1,
    steps: ['Monoatomic ion: oxidation state = ionic charge.', 'Cl⁻ → −1'],
  },
  {
    formula: 'Br₂',  name: 'bromine (element)', target: 'Br', answer: 0,
    steps: ['Pure uncombined element: oxidation state = 0.', 'Br₂ → 0'],
  },
  {
    formula: 'Mn²⁺', name: 'manganese(II) ion', target: 'Mn', answer: 2,
    steps: ['Monoatomic ion: oxidation state = ionic charge.', 'Mn²⁺ → +2'],
  },
  // Simple compounds
  {
    formula: 'H₂O', name: 'water', target: 'H', answer: 1,
    steps: ['O is −2 (rule 3).', 'H₂O is neutral: 2(+x) + (−2) = 0', '2x = +2 → x = +1'],
  },
  {
    formula: 'H₂O', name: 'water', target: 'O', answer: -2,
    steps: ['Rule 3: O is −2 in most compounds (not peroxides).', 'H₂O → O = −2'],
  },
  {
    formula: 'HCl', name: 'hydrochloric acid', target: 'Cl', answer: -1,
    steps: ['H is +1 (rule 4).', 'HCl is neutral: +1 + x = 0', 'x = −1'],
  },
  {
    formula: 'NH₃', name: 'ammonia', target: 'N', answer: -3,
    steps: ['H is +1.', 'NH₃ is neutral: x + 3(+1) = 0', 'x = −3'],
  },
  {
    formula: 'CO₂', name: 'carbon dioxide', target: 'C', answer: 4,
    steps: ['O is −2.', 'CO₂ is neutral: x + 2(−2) = 0', 'x + (−4) = 0 → x = +4'],
  },
  {
    formula: 'CO',  name: 'carbon monoxide', target: 'C', answer: 2,
    steps: ['O is −2.', 'CO is neutral: x + (−2) = 0', 'x = +2'],
  },
  {
    formula: 'CH₄', name: 'methane', target: 'C', answer: -4,
    steps: ['H is +1.', 'CH₄ is neutral: x + 4(+1) = 0', 'x = −4'],
  },
  {
    formula: 'SO₂', name: 'sulfur dioxide', target: 'S', answer: 4,
    steps: ['O is −2.', 'SO₂ is neutral: x + 2(−2) = 0', 'x = +4'],
  },
  {
    formula: 'SO₃', name: 'sulfur trioxide', target: 'S', answer: 6,
    steps: ['O is −2.', 'SO₃ is neutral: x + 3(−2) = 0', 'x = +6'],
  },
  {
    formula: 'H₂S', name: 'hydrogen sulfide', target: 'S', answer: -2,
    steps: ['H is +1.', 'H₂S is neutral: 2(+1) + x = 0', 'x = −2'],
  },
  {
    formula: 'PCl₃', name: 'phosphorus trichloride', target: 'P', answer: 3,
    steps: ['Cl is −1.', 'PCl₃ is neutral: x + 3(−1) = 0', 'x = +3'],
  },
  {
    formula: 'PCl₅', name: 'phosphorus pentachloride', target: 'P', answer: 5,
    steps: ['Cl is −1.', 'PCl₅ is neutral: x + 5(−1) = 0', 'x = +5'],
  },
  {
    formula: 'Fe₂O₃', name: 'iron(III) oxide', target: 'Fe', answer: 3,
    steps: ['O is −2.', 'Fe₂O₃ neutral: 2x + 3(−2) = 0', '2x = +6 → x = +3'],
  },
  {
    formula: 'FeO', name: 'iron(II) oxide', target: 'Fe', answer: 2,
    steps: ['O is −2.', 'FeO neutral: x + (−2) = 0', 'x = +2'],
  },
  {
    formula: 'Cu₂O', name: 'copper(I) oxide', target: 'Cu', answer: 1,
    steps: ['O is −2.', 'Cu₂O neutral: 2x + (−2) = 0', '2x = +2 → x = +1'],
  },
  {
    formula: 'FeCl₃', name: 'iron(III) chloride', target: 'Fe', answer: 3,
    steps: ['Cl is −1.', 'FeCl₃ neutral: x + 3(−1) = 0', 'x = +3'],
  },
  // Acids
  {
    formula: 'H₂SO₄', name: 'sulfuric acid', target: 'S', answer: 6,
    steps: ['H is +1, O is −2.', 'H₂SO₄ neutral: 2(+1) + x + 4(−2) = 0', '+2 + x − 8 = 0 → x = +6'],
  },
  {
    formula: 'HNO₃', name: 'nitric acid', target: 'N', answer: 5,
    steps: ['H is +1, O is −2.', 'HNO₃ neutral: +1 + x + 3(−2) = 0', '1 + x − 6 = 0 → x = +5'],
  },
  // Polyatomic ions
  {
    formula: 'SO₄²⁻', name: 'sulfate ion', context: 'ion (charge 2−)',
    target: 'S', answer: 6,
    steps: ['O is −2; ion charge is 2−.', 'x + 4(−2) = −2', 'x − 8 = −2 → x = +6'],
  },
  {
    formula: 'NO₃⁻', name: 'nitrate ion', context: 'ion (charge 1−)',
    target: 'N', answer: 5,
    steps: ['O is −2; ion charge is 1−.', 'x + 3(−2) = −1', 'x − 6 = −1 → x = +5'],
  },
  {
    formula: 'NO₂⁻', name: 'nitrite ion', context: 'ion (charge 1−)',
    target: 'N', answer: 3,
    steps: ['O is −2; ion charge is 1−.', 'x + 2(−2) = −1', 'x − 4 = −1 → x = +3'],
  },
  {
    formula: 'MnO₄⁻', name: 'permanganate ion', context: 'ion (charge 1−)',
    target: 'Mn', answer: 7,
    steps: ['O is −2; ion charge is 1−.', 'x + 4(−2) = −1', 'x − 8 = −1 → x = +7'],
  },
  {
    formula: 'Cr₂O₇²⁻', name: 'dichromate ion', context: 'ion (charge 2−)',
    target: 'Cr', answer: 6,
    steps: ['O is −2; ion charge is 2−.', '2x + 7(−2) = −2', '2x − 14 = −2 → 2x = +12 → x = +6'],
  },
  {
    formula: 'CrO₄²⁻', name: 'chromate ion', context: 'ion (charge 2−)',
    target: 'Cr', answer: 6,
    steps: ['O is −2; ion charge is 2−.', 'x + 4(−2) = −2', 'x − 8 = −2 → x = +6'],
  },
  {
    formula: 'PO₄³⁻', name: 'phosphate ion', context: 'ion (charge 3−)',
    target: 'P', answer: 5,
    steps: ['O is −2; ion charge is 3−.', 'x + 4(−2) = −3', 'x − 8 = −3 → x = +5'],
  },
  {
    formula: 'ClO₃⁻', name: 'chlorate ion', context: 'ion (charge 1−)',
    target: 'Cl', answer: 5,
    steps: ['O is −2; ion charge is 1−.', 'x + 3(−2) = −1', 'x − 6 = −1 → x = +5'],
  },
  // Complex/interesting compounds
  {
    formula: 'KMnO₄', name: 'potassium permanganate', target: 'Mn', answer: 7,
    steps: ['K is +1, O is −2.', '+1 + x + 4(−2) = 0', '1 + x − 8 = 0 → x = +7'],
  },
  {
    formula: 'K₂Cr₂O₇', name: 'potassium dichromate', target: 'Cr', answer: 6,
    steps: ['K is +1, O is −2.', '2(+1) + 2x + 7(−2) = 0', '2 + 2x − 14 = 0 → 2x = 12 → x = +6'],
  },
  {
    formula: 'Na₂SO₄', name: 'sodium sulfate', target: 'S', answer: 6,
    steps: ['Na is +1, O is −2.', '2(+1) + x + 4(−2) = 0', '2 + x − 8 = 0 → x = +6'],
  },
  {
    formula: 'MnO₂', name: 'manganese dioxide', target: 'Mn', answer: 4,
    steps: ['O is −2.', 'MnO₂ neutral: x + 2(−2) = 0', 'x = +4'],
  },
  // Special cases
  {
    formula: 'H₂O₂', name: 'hydrogen peroxide', target: 'O', answer: -1,
    steps: ['H is +1.', 'H₂O₂ neutral: 2(+1) + 2x = 0', '2 + 2x = 0 → x = −1', 'Note: O is −1 in peroxides (exception to the usual −2 rule).'],
    hint: 'This is a peroxide — the usual O = −2 rule does not apply.',
  },
  {
    formula: 'OF₂', name: 'oxygen difluoride', target: 'O', answer: 2,
    steps: ['F is always −1.', 'OF₂ neutral: x + 2(−1) = 0', 'x = +2', 'Note: O has a positive oxidation state because F is more electronegative.'],
    hint: 'F is more electronegative than O — F is always −1.',
  },
  {
    formula: 'NaH', name: 'sodium hydride', target: 'H', answer: -1,
    steps: ['Na is +1 (group 1 metal).', 'NaH neutral: +1 + x = 0 → x = −1', 'Note: H is −1 in metal hydrides (exception to the usual +1 rule).'],
    hint: 'Metal hydride — hydrogen bonded to a metal takes a −1 oxidation state.',
  },
  {
    formula: 'N₂O₄', name: 'dinitrogen tetroxide', target: 'N', answer: 4,
    steps: ['O is −2.', 'N₂O₄ neutral: 2x + 4(−2) = 0', '2x = +8 → x = +4'],
  },
  {
    formula: 'P₄O₁₀', name: 'tetraphosphorus decaoxide', target: 'P', answer: 5,
    steps: ['O is −2.', 'P₄O₁₀ neutral: 4x + 10(−2) = 0', '4x = +20 → x = +5'],
  },
]

function genOxState(): RedoxProblem {
  const e = pick(OX_ENTRIES)
  const context = e.context ? ` (${e.context})` : ''
  const sign = e.answer > 0 ? `+${e.answer}` : String(e.answer)
  return {
    subtype: 'ox_state',
    question: `What is the oxidation state of ${e.target} in ${e.formula}${context}?`,
    answer: sign,
    answerUnit: '',
    isTextAnswer: false,
    steps: [...e.steps, `Oxidation state of ${e.target} = ${sign}`],
    hint: e.hint,
  }
}

// ── 2 & 3. Reactions for identify_redox / ox_change ───────────────────────────

interface RedoxRxn {
  eq:              string   // display equation
  oxidisedFormula: string   // species that is oxidised (losing e⁻)
  reducedFormula:  string   // species that is reduced (gaining e⁻)
  oxAgent:         string   // oxidising agent (compound containing the reduced element)
  redAgent:        string   // reducing agent (compound containing the oxidised element)
  oxElement:       string   // element that is oxidised
  redElement:      string   // element that is reduced
  oxBefore:        number   // ox state of oxElement in reactant
  oxAfter:         number   // ox state of oxElement in product
  redBefore:       number   // ox state of redElement in reactant
  redAfter:        number   // ox state of redElement in product
  note?:           string
}

// ── Reaction builders ──────────────────────────────────────────────────────────

function gcdInt(a: number, b: number): number { return b === 0 ? a : gcdInt(b, a % b) }

/** Unicode subscript suffix — omits '₁' */
function sub(n: number): string {
  if (n <= 1) return ''
  return String(n).split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('')
}

/** Coefficient prefix — omits '1' */
function cl(n: number): string { return n === 1 ? '' : String(n) }

function nitrateFormula(sym: string, charge: number): string {
  if (charge === 1) return `${sym}NO₃`
  if (charge === 2) return `${sym}(NO₃)₂`
  return `${sym}(NO₃)₃`
}

function chlorideFormula(sym: string, charge: number): string {
  return `${sym}Cl${sub(charge)}`
}

function sulfateFormula(sym: string, charge: number): string {
  if (charge === 1) return `${sym}₂SO₄`
  if (charge === 2) return `${sym}SO₄`
  return `${sym}₂(SO₄)₃`
}

function hydroxideFormula(sym: string, charge: number): string {
  if (charge === 1) return `${sym}OH`
  if (charge === 2) return `${sym}(OH)₂`
  return `${sym}(OH)₃`
}

interface PoolMetal {
  sym:    string
  charge: number   // ionic charge when oxidised (+1, +2, or +3)
  rank:   number   // activity rank — lower = more active
}

const POOL_METALS: PoolMetal[] = [
  { sym: 'Li', charge: 1, rank:  1 },
  { sym: 'K',  charge: 1, rank:  2 },
  { sym: 'Ba', charge: 2, rank:  3 },
  { sym: 'Ca', charge: 2, rank:  4 },
  { sym: 'Na', charge: 1, rank:  5 },
  { sym: 'Mg', charge: 2, rank:  6 },
  { sym: 'Al', charge: 3, rank:  7 },
  { sym: 'Zn', charge: 2, rank:  8 },
  { sym: 'Fe', charge: 2, rank:  9 },
  { sym: 'Ni', charge: 2, rank: 10 },
  { sym: 'Sn', charge: 2, rank: 11 },
  { sym: 'Pb', charge: 2, rank: 12 },
  { sym: 'Cu', charge: 2, rank: 14 },
  { sym: 'Ag', charge: 1, rank: 15 },
]

// Metals above H₂ in the activity series — react with dilute acids
const ACID_METALS  = POOL_METALS.filter(m => m.rank <= 12)
// Metals with notable water reactivity
const WATER_METALS = POOL_METALS.filter(m => ['Li','K','Ba','Ca','Na'].includes(m.sym))
// Common metals used in dilute H₂SO₄ problems (avoids group-1 drama)
const H2SO4_METALS = POOL_METALS.filter(m => ['Mg','Al','Zn','Fe','Ni','Sn','Pb'].includes(m.sym))

/** M(s) + n HCl(aq) → MCl_n(aq) + H₂(g)  — balanced coefficients */
function makeMetalHCl(m: PoolMetal): RedoxRxn {
  const n = m.charge
  let cM: number, cHCl: number, cSalt: number, cH2: number
  if      (n === 1) { cM = 2; cHCl = 2; cSalt = 2; cH2 = 1 }
  else if (n === 2) { cM = 1; cHCl = 2; cSalt = 1; cH2 = 1 }
  else              { cM = 2; cHCl = 6; cSalt = 2; cH2 = 3 }
  const salt = chlorideFormula(m.sym, n)
  return {
    eq: `${cl(cM)}${m.sym}(s) + ${cl(cHCl)}HCl(aq) → ${cl(cSalt)}${salt}(aq) + ${cl(cH2)}H₂(g)`,
    oxidisedFormula: m.sym, reducedFormula: 'HCl',
    oxAgent: 'HCl', redAgent: m.sym,
    oxElement: m.sym, redElement: 'H',
    oxBefore: 0, oxAfter: n, redBefore: 1, redAfter: 0,
  }
}

/** M(s) + H₂SO₄(aq) → sulfate(aq) + H₂(g)  — balanced */
function makeMetalH2SO4(m: PoolMetal): RedoxRxn {
  const n = m.charge
  let cM: number, cAcid: number, cH2: number
  if      (n === 1) { cM = 2; cAcid = 1; cH2 = 1 }
  else if (n === 2) { cM = 1; cAcid = 1; cH2 = 1 }
  else              { cM = 2; cAcid = 3; cH2 = 3 }
  const salt = sulfateFormula(m.sym, n)
  return {
    eq: `${cl(cM)}${m.sym}(s) + ${cl(cAcid)}H₂SO₄(aq) → ${salt}(aq) + ${cl(cH2)}H₂(g)`,
    oxidisedFormula: m.sym, reducedFormula: 'H₂SO₄',
    oxAgent: 'H₂SO₄', redAgent: m.sym,
    oxElement: m.sym, redElement: 'H',
    oxBefore: 0, oxAfter: n, redBefore: 1, redAfter: 0,
  }
}

/** Active metal displaces displaced metal from its nitrate salt — balanced via GCD */
function makeDisplacement(active: PoolMetal, displaced: PoolMetal): RedoxRxn {
  const mA = active.charge, mB = displaced.charge
  const g = gcdInt(mA, mB)
  const cA = mB / g, cB = mA / g
  const saltA = nitrateFormula(active.sym, mA)
  const saltB = nitrateFormula(displaced.sym, mB)
  return {
    eq: `${cl(cA)}${active.sym}(s) + ${cl(cB)}${saltB}(aq) → ${cl(cA)}${saltA}(aq) + ${cl(cB)}${displaced.sym}(s)`,
    oxidisedFormula: active.sym, reducedFormula: saltB,
    oxAgent: saltB, redAgent: active.sym,
    oxElement: active.sym, redElement: displaced.sym,
    oxBefore: 0, oxAfter: mA, redBefore: mB, redAfter: 0,
  }
}

/** Reactive metal + water → hydroxide + H₂ */
function makeMetalWater(m: PoolMetal): RedoxRxn {
  const n = m.charge
  const cM  = n === 1 ? 2 : 1
  const cOH = n === 1 ? 2 : 1
  const ohForm = hydroxideFormula(m.sym, n)
  return {
    eq: `${cl(cM)}${m.sym}(s) + 2H₂O(l) → ${cl(cOH)}${ohForm}(aq) + H₂(g)`,
    oxidisedFormula: m.sym, reducedFormula: 'H₂O',
    oxAgent: 'H₂O', redAgent: m.sym,
    oxElement: m.sym, redElement: 'H',
    oxBefore: 0, oxAfter: n, redBefore: 1, redAfter: 0,
  }
}

// Halogen displacement reactions (hardcoded — consistent 1:2 stoichiometry)
const HALOGEN_RXNS: RedoxRxn[] = [
  {
    eq: 'Cl₂(g) + 2KBr(aq) → 2KCl(aq) + Br₂(l)',
    oxidisedFormula: 'Br⁻', reducedFormula: 'Cl₂',
    oxAgent: 'Cl₂', redAgent: 'KBr',
    oxElement: 'Br', redElement: 'Cl',
    oxBefore: -1, oxAfter: 0, redBefore: 0, redAfter: -1,
  },
  {
    eq: 'Cl₂(g) + 2KI(aq) → 2KCl(aq) + I₂(s)',
    oxidisedFormula: 'I⁻', reducedFormula: 'Cl₂',
    oxAgent: 'Cl₂', redAgent: 'KI',
    oxElement: 'I', redElement: 'Cl',
    oxBefore: -1, oxAfter: 0, redBefore: 0, redAfter: -1,
  },
  {
    eq: 'Br₂(l) + 2KI(aq) → 2KBr(aq) + I₂(s)',
    oxidisedFormula: 'I⁻', reducedFormula: 'Br₂',
    oxAgent: 'Br₂', redAgent: 'KI',
    oxElement: 'I', redElement: 'Br',
    oxBefore: -1, oxAfter: 0, redBefore: 0, redAfter: -1,
  },
  {
    eq: 'F₂(g) + 2NaCl(aq) → 2NaF(aq) + Cl₂(g)',
    oxidisedFormula: 'Cl⁻', reducedFormula: 'F₂',
    oxAgent: 'F₂', redAgent: 'NaCl',
    oxElement: 'Cl', redElement: 'F',
    oxBefore: -1, oxAfter: 0, redBefore: 0, redAfter: -1,
  },
  {
    eq: '2Na(s) + Cl₂(g) → 2NaCl(s)',
    oxidisedFormula: 'Na', reducedFormula: 'Cl₂',
    oxAgent: 'Cl₂', redAgent: 'Na',
    oxElement: 'Na', redElement: 'Cl',
    oxBefore: 0, oxAfter: 1, redBefore: 0, redAfter: -1,
  },
]

// Titration / advanced redox reactions (hardcoded)
const COMPLEX_RXNS: RedoxRxn[] = [
  {
    eq: '2H₂(g) + O₂(g) → 2H₂O(l)',
    oxidisedFormula: 'H₂', reducedFormula: 'O₂',
    oxAgent: 'O₂', redAgent: 'H₂',
    oxElement: 'H', redElement: 'O',
    oxBefore: 0, oxAfter: 1, redBefore: 0, redAfter: -2,
  },
  {
    eq: '2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(s)',
    oxidisedFormula: 'Al', reducedFormula: 'Fe₂O₃',
    oxAgent: 'Fe₂O₃', redAgent: 'Al',
    oxElement: 'Al', redElement: 'Fe',
    oxBefore: 0, oxAfter: 3, redBefore: 3, redAfter: 0,
    note: 'Thermite reaction — extremely exothermic.',
  },
  {
    eq: 'Sn(s) + 2Fe³⁺(aq) → Sn²⁺(aq) + 2Fe²⁺(aq)',
    oxidisedFormula: 'Sn', reducedFormula: 'Fe³⁺',
    oxAgent: 'Fe³⁺', redAgent: 'Sn',
    oxElement: 'Sn', redElement: 'Fe',
    oxBefore: 0, oxAfter: 2, redBefore: 3, redAfter: 2,
    note: 'Fe³⁺ is only partially reduced to Fe²⁺ (not all the way to Fe⁰).',
  },
  {
    eq: 'Cr₂O₇²⁻(aq) + 6Fe²⁺(aq) + 14H⁺(aq) → 2Cr³⁺(aq) + 6Fe³⁺(aq) + 7H₂O(l)',
    oxidisedFormula: 'Fe²⁺', reducedFormula: 'Cr₂O₇²⁻',
    oxAgent: 'Cr₂O₇²⁻', redAgent: 'Fe²⁺',
    oxElement: 'Fe', redElement: 'Cr',
    oxBefore: 2, oxAfter: 3, redBefore: 6, redAfter: 3,
    note: 'Acidified dichromate is a common oxidising agent in titrations.',
  },
  {
    eq: 'MnO₄⁻(aq) + 5Fe²⁺(aq) + 8H⁺(aq) → Mn²⁺(aq) + 5Fe³⁺(aq) + 4H₂O(l)',
    oxidisedFormula: 'Fe²⁺', reducedFormula: 'MnO₄⁻',
    oxAgent: 'MnO₄⁻', redAgent: 'Fe²⁺',
    oxElement: 'Fe', redElement: 'Mn',
    oxBefore: 2, oxAfter: 3, redBefore: 7, redAfter: 2,
    note: 'Acidified permanganate is one of the most powerful oxidising agents.',
  },
]

/** Pick a random RedoxRxn from the full generated + hardcoded pool */
function randomRxn(): RedoxRxn {
  const type = pick(['hcl','h2so4','displacement','water','halogen','complex'] as const)
  if (type === 'hcl')     return makeMetalHCl(pick(ACID_METALS))
  if (type === 'h2so4')   return makeMetalH2SO4(pick(H2SO4_METALS))
  if (type === 'water')   return makeMetalWater(pick(WATER_METALS))
  if (type === 'halogen') return pick(HALOGEN_RXNS)
  if (type === 'complex') return pick(COMPLEX_RXNS)
  // displacement: active from rank ≤ 12, displaced from higher rank
  const active     = pick(ACID_METALS)
  const candidates = POOL_METALS.filter(m => m.rank > active.rank)
  return makeDisplacement(active, candidates.length > 0 ? pick(candidates) : POOL_METALS[POOL_METALS.length - 1])
}

// ── 2. Identify oxidised / reduced / agent ────────────────────────────────────

type IdentifyQuestion = 'oxidised' | 'reduced' | 'ox_agent' | 'red_agent'

const IDENTIFY_QUESTIONS: IdentifyQuestion[] = ['oxidised', 'reduced', 'ox_agent', 'red_agent']

function identifyQText(q: IdentifyQuestion): string {
  if (q === 'oxidised')  return 'Which species is oxidised?'
  if (q === 'reduced')   return 'Which species is reduced?'
  if (q === 'ox_agent')  return 'What is the oxidising agent?'
  return 'What is the reducing agent?'
}

function identifyAnswer(rxn: RedoxRxn, q: IdentifyQuestion): string {
  if (q === 'oxidised')  return rxn.oxidisedFormula
  if (q === 'reduced')   return rxn.reducedFormula
  if (q === 'ox_agent')  return rxn.oxAgent
  return rxn.redAgent
}

function identifySteps(rxn: RedoxRxn, q: IdentifyQuestion): string[] {
  const oxChange  = rxn.oxAfter  - rxn.oxBefore
  const redChange = rxn.redAfter - rxn.redBefore
  const oxSign    = oxChange  > 0 ? `+${oxChange}`  : String(oxChange)
  const redSign   = redChange > 0 ? `+${redChange}` : String(redChange)

  const base = [
    `Equation: ${rxn.eq}`,
    `${rxn.oxElement} in ${rxn.oxidisedFormula}: ${rxn.oxBefore > 0 ? '+' : ''}${rxn.oxBefore} → ${rxn.oxAfter > 0 ? '+' : ''}${rxn.oxAfter}  (change ${oxSign}) → oxidation (loss of e⁻)`,
    `${rxn.redElement} in ${rxn.reducedFormula}: ${rxn.redBefore > 0 ? '+' : ''}${rxn.redBefore} → ${rxn.redAfter > 0 ? '+' : ''}${rxn.redAfter}  (change ${redSign}) → reduction (gain of e⁻)`,
  ]
  if (q === 'oxidised')  return [...base, `Oxidised species: ${rxn.oxidisedFormula} (ox. state increases)`]
  if (q === 'reduced')   return [...base, `Reduced species: ${rxn.reducedFormula} (ox. state decreases)`]
  if (q === 'ox_agent')  return [...base, `Oxidising agent = the substance containing the element being reduced = ${rxn.oxAgent}`]
  return                        [...base, `Reducing agent = the substance containing the element being oxidised = ${rxn.redAgent}`]
}

function genIdentifyRedox(): RedoxProblem {
  const rxn = randomRxn()
  const q   = pick(IDENTIFY_QUESTIONS)
  const ans = identifyAnswer(rxn, q)
  return {
    subtype: 'identify_redox',
    question: identifyQText(q),
    reactionEq: rxn.eq,
    answer: ans,
    answerUnit: '',
    isTextAnswer: true,
    steps: identifySteps(rxn, q),
    hint: rxn.note,
  }
}

// ── 3. Oxidation-state change ─────────────────────────────────────────────────

function genOxChange(): RedoxProblem {
  const rxn    = randomRxn()
  const side   = pick(['ox', 'red'] as const)
  const el     = side === 'ox' ? rxn.oxElement  : rxn.redElement
  const before = side === 'ox' ? rxn.oxBefore   : rxn.redBefore
  const after  = side === 'ox' ? rxn.oxAfter    : rxn.redAfter
  const source = side === 'ox' ? rxn.oxidisedFormula : rxn.reducedFormula

  const change = after - before
  const sign   = change > 0 ? `+${change}` : String(change)
  const bSign  = before > 0 ? `+${before}` : String(before)
  const aSign  = after  > 0 ? `+${after}`  : String(after)

  return {
    subtype: 'ox_change',
    question: `What is the change in oxidation state of ${el} in ${source}?`,
    reactionEq: rxn.eq,
    answer: sign,
    answerUnit: '',
    isTextAnswer: false,
    steps: [
      `Equation: ${rxn.eq}`,
      `Find the oxidation state of ${el} in ${source} (reactant side): ${bSign}`,
      `Find the oxidation state of ${el} in its product form: ${aSign}`,
      `Change = ${aSign} − (${bSign}) = ${sign}`,
      change > 0
        ? `${el} increases in oxidation state → it is oxidised (loses electrons).`
        : `${el} decreases in oxidation state → it is reduced (gains electrons).`,
    ],
    hint: rxn.note,
  }
}

// ── 4. Charge balancing ───────────────────────────────────────────────────────

interface Anion {
  sym:     string   // display symbol with Unicode superscript, e.g. 'NO₃⁻'
  name:    string   // e.g. 'nitrate'
  charge:  number   // magnitude, positive (e.g. 1 for NO₃⁻, 2 for SO₄²⁻)
}

const ANION_POOL: Anion[] = [
  { sym: 'NO₃⁻',  name: 'nitrate',    charge: 1 },
  { sym: 'Cl⁻',   name: 'chloride',   charge: 1 },
  { sym: 'OH⁻',   name: 'hydroxide',  charge: 1 },
  { sym: 'I⁻',    name: 'iodide',     charge: 1 },
  { sym: 'Br⁻',   name: 'bromide',    charge: 1 },
  { sym: 'SO₄²⁻', name: 'sulfate',    charge: 2 },
  { sym: 'CO₃²⁻', name: 'carbonate',  charge: 2 },
  { sym: 'O²⁻',   name: 'oxide',      charge: 2 },
  { sym: 'PO₄³⁻', name: 'phosphate',  charge: 3 },
]

/** Superscript helper for ion display */
function ionSup(n: number): string {
  if (n === 1) return '⁺'
  if (n === 2) return '²⁺'
  if (n === 3) return '³⁺'
  return `${n}⁺`
}

function genChargeBalance(): RedoxProblem {
  const metal = pick(POOL_METALS)
  const anion = pick(ANION_POOL)
  const g = gcdInt(metal.charge, anion.charge)
  const numAnions  = metal.charge / g
  const numCations = anion.charge / g

  const cationDisplay = `${metal.sym}${ionSup(metal.charge)}`
  const question = numCations === 1
    ? `How many ${anion.sym} ions are needed to form a neutral ionic compound with one ${cationDisplay}?`
    : `How many ${anion.sym} ions are needed to form a neutral ionic compound with ${numCations} ${cationDisplay}?`

  const steps: string[] = [
    `${cationDisplay} carries a charge of +${metal.charge}.`,
    `${anion.sym} carries a charge of −${anion.charge}.`,
    numCations > 1
      ? `Total positive charge from ${numCations} × ${cationDisplay} = +${numCations * metal.charge}.`
      : `Need the total negative charge to equal +${metal.charge}.`,
    `Number of ${anion.sym} needed = ${numCations * metal.charge} ÷ ${anion.charge} = ${numAnions}.`,
    `${numCations > 1 ? `${numCations}(${cationDisplay})` : cationDisplay}(${numAnions > 1 ? `${numAnions}` : ''}${anion.sym}) is neutral. ✓`,
  ]

  return {
    subtype:      'charge_balance',
    question,
    answer:       String(numAnions),
    answerUnit:   '',
    isTextAnswer: false,
    steps,
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateRedoxProblem(subtype: RedoxSubtype): RedoxProblem {
  if (subtype === 'ox_state')       return genOxState()
  if (subtype === 'identify_redox') return genIdentifyRedox()
  if (subtype === 'charge_balance') return genChargeBalance()
  return genOxChange()
}

export function checkRedoxAnswer(input: string, p: RedoxProblem): boolean {
  const s = input.trim()
  if (s === '') return false

  if (p.isTextAnswer) {
    return normaliseFormula(s) === normaliseFormula(p.answer)
  }

  // Numeric: signed integer (ox state or change)
  const userVal = parseSignedInt(s)
  const corrVal = parseSignedInt(p.answer)
  if (isNaN(userVal) || isNaN(corrVal)) return false
  return userVal === corrVal
}

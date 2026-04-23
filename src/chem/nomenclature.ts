import {
  POLYATOMIC_ANIONS,
  POLYATOMIC_CATIONS,
  MAIN_GROUP_CATIONS,
  MAIN_GROUP_ANIONS,
  TRANSITION_METAL_CATIONS,
  GREEK_PREFIXES,
  SUBSCRIPT_DIGITS,
  SUPERSCRIPT_CHARS,
  type PolyatomicIon,
  type TransitionMetalCation,
  type MainGroupCation,
  type MainGroupAnion,
} from '../data/nomenclature'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProblemMode  = 'formula-to-name' | 'name-to-formula'
export type CompoundType = 'ionic-simple' | 'ionic-polyatomic' | 'ionic-transition' | 'covalent-binary'
export type VerifyResult = 'correct' | 'incorrect'

export interface Problem {
  mode:     ProblemMode
  type:     CompoundType
  prompt:   string
  answer:   string
  aliases:  string[]
  compound: {
    cation?: PolyatomicIon | MainGroupCation | TransitionMetalCation
    anion?:  PolyatomicIon | MainGroupAnion
    parts?:  { symbol: string; name: string; count: number }[]
  }
}

// ── Unicode helpers ───────────────────────────────────────────────────────────

const SUB: Record<string, string> = Object.fromEntries(
  Object.entries(SUBSCRIPT_DIGITS).map(([u, a]) => [a, u])
)
function toSub(n: number): string { return n === 1 ? '' : String(n).split('').map(d => SUB[d] ?? d).join('') }

// ── Charge balance ────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b) }

function chargeBalance(catCharge: number, anCharge: number): { catN: number; anN: number } {
  const l = lcm(catCharge, Math.abs(anCharge))
  const catN = l / catCharge
  const anN  = l / Math.abs(anCharge)
  const g    = gcd(catN, anN)
  return { catN: catN / g, anN: anN / g }
}

// ── Formula builders ──────────────────────────────────────────────────────────


// cleaner version used by all generators
function ionicFormula(
  catSymbol: string, catCharge: number, catPoly: boolean,
  anSymbol: string,  anCharge: number,  anPoly: boolean,
): string {
  const { catN, anN } = chargeBalance(catCharge, Math.abs(anCharge))
  const cat = catPoly && catN > 1 ? `(${catSymbol})${toSub(catN)}` : `${catSymbol}${toSub(catN)}`
  const an  = anPoly  && anN  > 1 ? `(${anSymbol})${toSub(anN)}`  : `${anSymbol}${toSub(anN)}`
  return `${cat}${an}`
}

// Strip charge superscripts from a display formula to get the bare symbol
function bareSymbol(formula: string): string {
  return formula.replace(/[⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+$/, '')
}

// ── Covalent binary helpers ───────────────────────────────────────────────────

// Low-to-high EN ordering for nonmetals used in covalent naming
const COVALENT_EN_ORDER = ['Si', 'C', 'P', 'N', 'H', 'S', 'I', 'Br', 'Cl', 'O', 'F']

const COVALENT_NAMES: Record<string, string> = {
  Si: 'silicon', C: 'carbon', P: 'phosphorus', N: 'nitrogen',
  H: 'hydrogen', S: 'sulfur', I: 'iodine', Br: 'bromine',
  Cl: 'chlorine', O: 'oxygen', F: 'fluorine',
}

// Pairs that make sensible covalent compounds at 101 level (avoid nonsense combos)
const COVALENT_PAIRS: [string, string, [number,number][]][] = [
  ['C',  'O',  [[1,1],[1,2]]],
  ['C',  'S',  [[1,2]]],
  ['N',  'O',  [[1,1],[1,2],[2,1],[2,3],[2,4],[2,5]]],
  ['S',  'O',  [[1,2],[1,3]]],
  ['S',  'F',  [[1,6]]],
  ['S',  'Cl', [[1,2]]],
  ['P',  'O',  [[4,10],[4,6]]],
  ['P',  'Cl', [[1,3],[1,5]]],
  ['P',  'F',  [[1,3],[1,5]]],
  ['Cl', 'O',  [[1,1],[1,2],[2,7]]],
  ['N',  'F',  [[1,3]]],
  ['N',  'Cl', [[1,3]]],
  ['Si', 'O',  [[1,2]]],
  ['Si', 'F',  [[1,4]]],
  ['Si', 'Cl', [[1,4]]],
]

function prefixFor(n: number, isFirst: boolean): string {
  const p = GREEK_PREFIXES[n] ?? `${n}`
  return isFirst && n === 1 ? '' : p
}

function elideVowel(prefix: string, elementName: string): string {
  if (!prefix) return elementName
  if ((prefix.endsWith('a') || prefix.endsWith('o')) && /^[aeiou]/i.test(elementName)) {
    return prefix.slice(0, -1) + elementName
  }
  return prefix + elementName
}

function covalentName(sym1: string, n1: number, sym2: string, n2: number): string {
  const p1   = prefixFor(n1, true)
  const p2   = prefixFor(n2, false)
  const name1 = COVALENT_NAMES[sym1] ?? sym1.toLowerCase()
  const name2 = (COVALENT_NAMES[sym2] ?? sym2.toLowerCase()).replace(/ine$/, 'ide').replace(/en$/, 'ide').replace(/ur$/, 'ide').replace(/on$/, 'ide').replace(/ogen$/, 'ide')

  // Manual -ide endings for each element
  const stem2: Record<string, string> = {
    O: 'oxide', F: 'fluoride', Cl: 'chloride', Br: 'bromide', I: 'iodide',
    S: 'sulfide', N: 'nitride', P: 'phosphide', H: 'hydride',
    Si: 'silicide', C: 'carbide',
  }
  const end2 = stem2[sym2] ?? `${name2.replace(/e$/, '')}ide`
  const part1 = p1 ? elideVowel(p1, name1) : name1
  const part2 = elideVowel(p2, end2)
  return `${part1} ${part2}`
}

function covalentFormula(sym1: string, n1: number, sym2: string, n2: number): string {
  return `${sym1}${toSub(n1)}${sym2}${toSub(n2)}`
}

// ── RNG ───────────────────────────────────────────────────────────────────────

function rng(seed?: number): () => number {
  if (seed === undefined) return Math.random
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

// ── Problem generators ────────────────────────────────────────────────────────

function makeIonicSimple(mode: ProblemMode, rand: () => number): Problem {
  const cation = pick(MAIN_GROUP_CATIONS, rand)
  const anion  = pick(MAIN_GROUP_ANIONS, rand)
  const { catN, anN } = chargeBalance(cation.charge, Math.abs(anion.charge))

  const formula = `${cation.symbol}${toSub(catN)}${anion.symbol}${toSub(anN)}`
  const name    = `${cation.name} ${anion.name}`

  return {
    mode, type: 'ionic-simple',
    prompt:  mode === 'formula-to-name' ? formula : name,
    answer:  mode === 'formula-to-name' ? name    : formula,
    aliases: [],
    compound: { cation, anion },
  }
}

function makeIonicPolyatomic(mode: ProblemMode, rand: () => number): Problem {
  // pick one of: main-group cat + poly anion, poly cation + main-group anion
  const usePolyCat = rand() < 0.25 && POLYATOMIC_CATIONS.length > 0
  const polyCat    = usePolyCat ? pick(POLYATOMIC_CATIONS, rand) : null
  const mainCat    = usePolyCat ? null : pick(MAIN_GROUP_CATIONS, rand)
  const polyAn     = pick(POLYATOMIC_ANIONS, rand)

  const catCharge = polyCat ? polyCat.charge : mainCat!.charge
  const anCharge  = polyAn.charge
  const { catN, anN } = chargeBalance(catCharge, Math.abs(anCharge))

  const catSymbol  = polyCat ? bareSymbol(polyCat.formula) : mainCat!.symbol
  const catName    = polyCat ? polyCat.name                : mainCat!.name
  const anSymbol   = bareSymbol(polyAn.formula)

  const formula = ionicFormula(catSymbol, catCharge, !!polyCat, anSymbol, anCharge, true)
  const name    = `${catName} ${polyAn.name}`

  void catN; void anN

  const aliases: string[] = []
  if (polyAn.aliases) aliases.push(...polyAn.aliases.map(a => `${catName} ${a}`))

  return {
    mode, type: 'ionic-polyatomic',
    prompt:  mode === 'formula-to-name' ? formula : name,
    answer:  mode === 'formula-to-name' ? name    : formula,
    aliases,
    compound: { cation: polyCat ?? mainCat!, anion: polyAn },
  }
}

function makeIonicTransition(mode: ProblemMode, rand: () => number): Problem {
  const cation = pick(TRANSITION_METAL_CATIONS, rand)
  const usePolyAn = rand() < 0.4
  const anion: PolyatomicIon | MainGroupAnion = usePolyAn
    ? pick(POLYATOMIC_ANIONS, rand)
    : pick(MAIN_GROUP_ANIONS, rand)

  const anSymbol  = bareSymbol(anion.formula)
  const anCharge  = anion.charge
  const isPoly    = usePolyAn

  const formula = ionicFormula(cation.symbol, cation.charge, false, anSymbol, anCharge, isPoly)
  const name    = `${cation.iupac} ${anion.name}`

  const aliases: string[] = []
  if (cation.classical) aliases.push(`${cation.classical} ${anion.name}`)
  if ((anion as PolyatomicIon).aliases) {
    for (const a of (anion as PolyatomicIon).aliases!) {
      aliases.push(`${cation.iupac} ${a}`)
      if (cation.classical) aliases.push(`${cation.classical} ${a}`)
    }
  }

  return {
    mode, type: 'ionic-transition',
    prompt:  mode === 'formula-to-name' ? formula : name,
    answer:  mode === 'formula-to-name' ? name    : formula,
    aliases,
    compound: { cation, anion },
  }
}

function makeCovalentBinary(mode: ProblemMode, rand: () => number): Problem {
  const [sym1, sym2, counts] = pick(COVALENT_PAIRS, rand)
  const [n1, n2] = pick(counts, rand)

  const formula = covalentFormula(sym1, n1, sym2, n2)
  const name    = covalentName(sym1, n1, sym2, n2)

  void COVALENT_EN_ORDER

  return {
    mode, type: 'covalent-binary',
    prompt:  mode === 'formula-to-name' ? formula : name,
    answer:  mode === 'formula-to-name' ? name    : formula,
    aliases: [],
    compound: { parts: [{ symbol: sym1, name: COVALENT_NAMES[sym1], count: n1 }, { symbol: sym2, name: COVALENT_NAMES[sym2], count: n2 }] },
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateProblem(mode: ProblemMode, type: CompoundType, seed?: number): Problem {
  const rand = rng(seed)
  switch (type) {
    case 'ionic-simple':      return makeIonicSimple(mode, rand)
    case 'ionic-polyatomic':  return makeIonicPolyatomic(mode, rand)
    case 'ionic-transition':  return makeIonicTransition(mode, rand)
    case 'covalent-binary':   return makeCovalentBinary(mode, rand)
  }
}

export function normalizeAnswer(s: string): string {
  let r = s.trim()
  // unicode subscripts/superscripts → ASCII
  for (const [u, a] of Object.entries(SUBSCRIPT_DIGITS))  r = r.split(u).join(a)
  for (const [u, a] of Object.entries(SUPERSCRIPT_CHARS)) r = r.split(u).join(a)
  // lowercase (handles names; element symbol case checked separately where needed)
  r = r.toLowerCase()
  // strip spaces before ( and inside parens, but preserve space after )
  r = r.replace(/\s+\(/g, '(').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
  // collapse remaining whitespace
  r = r.replace(/\s+/g, ' ').trim()
  // strip trailing phase labels
  r = r.replace(/\s*\(aq\)|\s*\(s\)|\s*\(l\)|\s*\(g\)$/i, '')
  return r
}

export function verifyAnswer(problem: Problem, userInput: string): VerifyResult {
  const norm = normalizeAnswer(userInput)
  if (!norm) return 'incorrect'
  const canonical = normalizeAnswer(problem.answer)
  if (norm === canonical) return 'correct'
  for (const alias of problem.aliases) {
    if (norm === normalizeAnswer(alias)) return 'correct'
  }
  return 'incorrect'
}

// Practice problems for double-displacement reactions and solubility rules.

import { CATIONS, ANIONS, solLookup, buildFormula, SOL_LABEL } from './solubilityData'
import type { Sol } from './solubilityData'

// ── Types ─────────────────────────────────────────────────────────────────────

export type RxnSubtype = 'predict_occurs' | 'name_precipitate' | 'identify_solubility'

export interface RxnPracticeProblem {
  subtype:    RxnSubtype
  question:   string
  context?:   string      // displayed in a mono block (e.g. reaction equation)
  answer:     string      // canonical lower-cased answer
  answerHint: string      // placeholder for the input
  steps:      string[]
  hint?:      string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

/** Normalise formula subscripts + case for loose formula matching */
function normFormula(s: string): string {
  return s
    .replace(/₀/g,'0').replace(/₁/g,'1').replace(/₂/g,'2').replace(/₃/g,'3')
    .replace(/₄/g,'4').replace(/₅/g,'5').replace(/₆/g,'6')
    .replace(/⁺/g,'+').replace(/⁻/g,'-')
    .replace(/\s+/g,'').toLowerCase()
}

function normSol(s: string): Sol | null {
  const t = s.trim().toLowerCase()
  if (t === 's' || t === 'soluble')             return 'S'
  if (t === 'i' || t === 'insoluble')           return 'I'
  if (t === 'ss' || t === 'slightly soluble' || t === 'slightly')   return 'SS'
  return null
}

// ── Compound pool ─────────────────────────────────────────────────────────────

interface SC { catIdx: number; aniIdx: number; formula: string }

// All soluble (S or SS) compounds
const SOLUBLE: SC[] = []
for (let ci = 0; ci < CATIONS.length; ci++) {
  for (let ai = 0; ai < ANIONS.length; ai++) {
    const { sol } = solLookup(CATIONS[ci].id, ANIONS[ai].id)
    if (sol === 'S' || sol === 'SS') {
      SOLUBLE.push({ catIdx: ci, aniIdx: ai, formula: buildFormula(CATIONS[ci], ANIONS[ai]) })
    }
  }
}

/** Pick a random pair of soluble compounds with different cation AND different anion */
function pickPair(): [SC, SC] {
  let a: SC, b: SC
  do {
    a = pick(SOLUBLE)
    b = pick(SOLUBLE)
  } while (a.catIdx === b.catIdx || a.aniIdx === b.aniIdx)
  return [a, b]
}

// ── 1. predict_occurs ─────────────────────────────────────────────────────────

function genPredictOccurs(): RxnPracticeProblem {
  const [a, b] = pickPair()
  const catA = CATIONS[a.catIdx], aniA = ANIONS[a.aniIdx]
  const catB = CATIONS[b.catIdx], aniB = ANIONS[b.aniIdx]

  const p1 = solLookup(catA.id, aniB.id)
  const p2 = solLookup(catB.id, aniA.id)
  const hasRxn = p1.sol === 'I' || p2.sol === 'I'

  const prod1Formula = buildFormula(catA, aniB)
  const prod2Formula = buildFormula(catB, aniA)

  const steps: string[] = [
    `Double-displacement: swap anions between the two compounds.`,
    `Products: ${prod1Formula} (${SOL_LABEL[p1.sol]}) and ${prod2Formula} (${SOL_LABEL[p2.sol]})`,
    hasRxn
      ? `At least one product is insoluble → reaction occurs and a precipitate forms.`
      : `Both products are soluble → all ions remain in solution → no net reaction (NR).`,
  ]

  return {
    subtype: 'predict_occurs',
    question: `When aqueous solutions of ${catA.name} ${aniA.name} and ${catB.name} ${aniB.name} are mixed, does a reaction occur?`,
    context: `${a.formula}(aq) + ${b.formula}(aq) → ?`,
    answer: hasRxn ? 'yes' : 'no',
    answerHint: 'yes or no',
    steps,
  }
}

// ── 2. name_precipitate ───────────────────────────────────────────────────────

function genNamePrecipitate(): RxnPracticeProblem {
  // Keep trying until we get a pair with exactly one insoluble product
  let a: SC, b: SC, p1Sol: Sol, p2Sol: Sol
  let iters = 0
  do {
    ;[a, b] = pickPair()
    p1Sol = solLookup(CATIONS[a.catIdx].id, ANIONS[b.aniIdx].id).sol
    p2Sol = solLookup(CATIONS[b.catIdx].id, ANIONS[a.aniIdx].id).sol
    iters++
    if (iters > 500) break
  } while (p1Sol !== 'I' && p2Sol !== 'I')

  const catA = CATIONS[a.catIdx], aniA = ANIONS[a.aniIdx]
  const catB = CATIONS[b.catIdx], aniB = ANIONS[b.aniIdx]

  const prod1 = buildFormula(catA, aniB)
  const prod2 = buildFormula(catB, aniA)
  const r1 = solLookup(catA.id, aniB.id)
  const r2 = solLookup(catB.id, aniA.id)

  const precipitates = [
    ...(r1.sol === 'I' ? [{ formula: prod1, name: `${catA.name} ${aniB.name}`, rule: r1.rule }] : []),
    ...(r2.sol === 'I' ? [{ formula: prod2, name: `${catB.name} ${aniA.name}`, rule: r2.rule }] : []),
  ]

  const precipAnswer = precipitates.map(p => normFormula(p.formula)).join(' and ')
  const displayAnswer = precipitates.map(p => p.formula).join(' and ')

  const steps: string[] = [
    `Double-displacement: swap anions.`,
    `Products formed: ${prod1} and ${prod2}`,
    ...precipitates.map(p => `${p.formula}: ${p.rule}`),
    `Precipitate(s): ${displayAnswer} ↓`,
  ]

  return {
    subtype: 'name_precipitate',
    question: `What precipitate(s) form when ${a.formula}(aq) and ${b.formula}(aq) are mixed?${precipitates.length > 1 ? ' (Give both formulas, separated by "and")' : ''}`,
    context: `${a.formula}(aq) + ${b.formula}(aq) → ?`,
    answer: precipAnswer,
    answerHint: precipitates.length > 1 ? 'formula and formula' : 'formula, e.g. AgCl',
    steps,
    hint: 'Apply solubility rules after swapping anions between the two compounds.',
  }
}

// ── 3. identify_solubility ────────────────────────────────────────────────────

function genIdentifySolubility(): RxnPracticeProblem {
  const cat = pick(CATIONS)
  const ani = pick(ANIONS)
  const formula = buildFormula(cat, ani)
  const { sol, rule } = solLookup(cat.id, ani.id)

  const solLabel: Record<Sol, string> = {
    S:  'Soluble (S)',
    I:  'Insoluble (I)',
    SS: 'Slightly Soluble (SS)',
  }

  const steps: string[] = [
    `Compound: ${formula} — ${cat.name} ${ani.name}`,
    `Cation: ${cat.formula}  |  Anion: ${ani.formula}`,
    `Apply solubility rules: ${rule}`,
    `Classification: ${solLabel[sol]}`,
  ]

  return {
    subtype: 'identify_solubility',
    question: `Classify ${formula} as Soluble (S), Slightly Soluble (SS), or Insoluble (I).`,
    answer: sol.toLowerCase(),
    answerHint: 'S, SS, or I',
    steps,
  }
}

// ── Generator ─────────────────────────────────────────────────────────────────

export function genRxnPracticeProblem(subtype: RxnSubtype): RxnPracticeProblem {
  switch (subtype) {
    case 'predict_occurs':       return genPredictOccurs()
    case 'name_precipitate':     return genNamePrecipitate()
    case 'identify_solubility':  return genIdentifySolubility()
  }
}

// ── Answer checker ────────────────────────────────────────────────────────────

export function checkRxnPracticeAnswer(raw: string, problem: RxnPracticeProblem): boolean {
  const input = raw.trim().toLowerCase()

  if (problem.subtype === 'predict_occurs') {
    return input === problem.answer
  }

  if (problem.subtype === 'identify_solubility') {
    const norm = normSol(input)
    if (!norm) return false
    return norm.toLowerCase() === problem.answer
  }

  // name_precipitate — compare normalised formulas
  // answer may be "formula1 and formula2", handle both orderings
  const inputParts  = input.split(/\s+and\s+/).map(normFormula)
  const answerParts = problem.answer.split(/\s+and\s+/).map(normFormula)

  if (inputParts.length === 1 && answerParts.length === 1) {
    return inputParts[0] === answerParts[0]
  }
  // Both orderings accepted for two-precipitate answers
  const inputSet  = new Set(inputParts)
  const answerSet = new Set(answerParts)
  return [...answerSet].every(a => inputSet.has(a)) && inputSet.size === answerSet.size
}

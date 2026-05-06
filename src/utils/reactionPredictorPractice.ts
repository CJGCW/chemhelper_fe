// Practice problems for double-displacement reactions and solubility rules.

import { CATIONS, ANIONS, solLookup, buildFormula, SOL_LABEL } from './solubilityData'
import type { Sol } from './solubilityData'

// ── Types ─────────────────────────────────────────────────────────────────────

export type RxnSubtype = 'predict_occurs' | 'name_precipitate' | 'identify_solubility'

export interface RxnPracticeProblem {
  subtype:    RxnSubtype
  question:   string
  context?:   string      // displayed in a mono block (e.g. reaction equation)
  answer:     string      // canonical answer matching one entry in choices
  choices:    string[]    // shuffled option buttons
  steps:      string[]
  hint?:      string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Normalise formula subscripts + case for loose formula matching */
function normFormula(s: string): string {
  return s
    .replace(/₀/g,'0').replace(/₁/g,'1').replace(/₂/g,'2').replace(/₃/g,'3')
    .replace(/₄/g,'4').replace(/₅/g,'5').replace(/₆/g,'6')
    .replace(/⁺/g,'+').replace(/⁻/g,'-')
    .replace(/\s+/g,'').toLowerCase()
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

// Pool of common insoluble compounds for name_precipitate distractors
const INSOLUBLE_FORMULAS: string[] = []
for (let ci = 0; ci < CATIONS.length; ci++) {
  for (let ai = 0; ai < ANIONS.length; ai++) {
    const { sol } = solLookup(CATIONS[ci].id, ANIONS[ai].id)
    if (sol === 'I') {
      INSOLUBLE_FORMULAS.push(buildFormula(CATIONS[ci], ANIONS[ai]))
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

  const answer = hasRxn ? 'Yes' : 'No'

  return {
    subtype: 'predict_occurs',
    question: `When aqueous solutions of ${catA.name} ${aniA.name} and ${catB.name} ${aniB.name} are mixed, does a reaction occur?`,
    context: `${a.formula}(aq) + ${b.formula}(aq) → ?`,
    answer,
    choices: shuffle(['Yes', 'No']),
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

  const precipAnswer = precipitates.map(p => p.formula).join(' and ')

  const steps: string[] = [
    `Double-displacement: swap anions.`,
    `Products formed: ${prod1} and ${prod2}`,
    ...precipitates.map(p => `${p.formula}: ${p.rule}`),
    `Precipitate(s): ${precipAnswer} ↓`,
  ]

  // Build choices: correct answer + other product + 1-2 insoluble distractors
  const correct = precipAnswer
  const otherProduct = precipitates[0]?.formula === prod1 ? prod2 : prod1
  const distractors = INSOLUBLE_FORMULAS
    .filter(f => normFormula(f) !== normFormula(correct) && normFormula(f) !== normFormula(otherProduct))
  const distractor = distractors.length > 0 ? pick(distractors) : null

  const choiceSet = new Set([correct, otherProduct])
  if (distractor) choiceSet.add(distractor)
  // Fill to 4 choices if we can
  while (choiceSet.size < 4 && distractors.length > choiceSet.size) {
    choiceSet.add(pick(distractors))
  }
  const choices = shuffle([...choiceSet])

  return {
    subtype: 'name_precipitate',
    question: `What precipitate(s) form when ${a.formula}(aq) and ${b.formula}(aq) are mixed?`,
    context: `${a.formula}(aq) + ${b.formula}(aq) → ?`,
    answer: correct,
    choices,
    steps,
    hint: 'Apply solubility rules after swapping anions between the two compounds.',
  }
}

// ── 3. identify_solubility ────────────────────────────────────────────────────

const SOL_CHOICES = ['Soluble (S)', 'Slightly Soluble (SS)', 'Insoluble (I)']

const SOL_ANSWER: Record<Sol, string> = {
  S:  'Soluble (S)',
  I:  'Insoluble (I)',
  SS: 'Slightly Soluble (SS)',
}

function genIdentifySolubility(): RxnPracticeProblem {
  const cat = pick(CATIONS)
  const ani = pick(ANIONS)
  const formula = buildFormula(cat, ani)
  const { sol, rule } = solLookup(cat.id, ani.id)

  const steps: string[] = [
    `Compound: ${formula} — ${cat.name} ${ani.name}`,
    `Cation: ${cat.formula}  |  Anion: ${ani.formula}`,
    `Apply solubility rules: ${rule}`,
    `Classification: ${SOL_ANSWER[sol]}`,
  ]

  return {
    subtype: 'identify_solubility',
    question: `Classify ${formula} as Soluble (S), Slightly Soluble (SS), or Insoluble (I).`,
    answer: SOL_ANSWER[sol],
    choices: shuffle([...SOL_CHOICES]),
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
  // With choice buttons, answer matches exactly
  if (raw.trim() === problem.answer) return true

  const input = raw.trim().toLowerCase()
  const answer = problem.answer.toLowerCase()

  if (problem.subtype === 'predict_occurs') {
    return input === answer || input === answer[0]
  }

  if (problem.subtype === 'identify_solubility') {
    // Accept abbreviation "(S)"/"s", full word "soluble", or full label
    const abbrevMatch = answer.match(/\((\w+)\)/)
    const abbrev = abbrevMatch ? abbrevMatch[1] : ''
    const mainWord = answer.replace(/\s*\(\w+\)/, '').trim()
    return input === abbrev || input === mainWord || input === answer
  }

  // name_precipitate — compare normalised formulas; handle multi-precipitate answers
  const inputParts  = input.split(/\s+and\s+/).map(normFormula)
  const answerParts = answer.split(/\s+and\s+/).map(normFormula)

  if (inputParts.length === 1 && answerParts.length === 1) {
    return inputParts[0] === answerParts[0]
  }
  const inputSet  = new Set(inputParts)
  const answerSet = new Set(answerParts)
  return [...answerSet].every(a => inputSet.has(a)) && inputSet.size === answerSet.size
}

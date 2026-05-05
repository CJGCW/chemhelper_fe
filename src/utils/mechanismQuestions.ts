// Question generators for mechanism practice/problems modes.
// All questions are derived from ALL_REACTIONS — no hardcoded pool.

import { ALL_REACTIONS } from '../data/mechanisms/index'
import type { ReactionDef, MechanismCategory } from '../data/mechanisms/types'

export type QuestionType = 'predict-product' | 'identify-mechanism' | 'predict-regio' | 'predict-stereo' | 'identify-reagent'

export interface MechQuestion {
  type: QuestionType
  reactionId: string
  scenario: string
  question: string
  choices: string[]
  answer: string
  explanation: string
  steps: string[]
  category: MechanismCategory
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function distractors<T>(correct: T, pool: T[], n = 3): T[] {
  const wrong = pool.filter(x => x !== correct)
  return shuffle(wrong).slice(0, Math.min(n, wrong.length))
}

function makeChoices<T>(correct: T, pool: T[]): T[] {
  return shuffle([correct, ...distractors(correct, pool)])
}

// ── Question builders ─────────────────────────────────────────────────────────

function buildPredictProduct(r: ReactionDef, pool: ReactionDef[]): MechQuestion {
  const correctProduct = r.products
  const wrongProducts  = pool.filter(p => p.id !== r.id && p.products !== correctProduct).map(p => p.products)
  const choices = makeChoices(correctProduct, wrongProducts)
  return {
    type: 'predict-product',
    reactionId: r.id,
    category: r.category,
    scenario: `Reactants: ${r.reactants}\nConditions: ${r.conditions}`,
    question: 'What is the major product of this reaction?',
    choices,
    answer: correctProduct,
    explanation: `This is ${r.name}. ${r.summary}`,
    steps: [
      `Reaction: ${r.name}`,
      `Reactants: ${r.reactants}`,
      `Conditions: ${r.conditions}`,
      `Product: ${r.products}`,
      ...r.importantInfo.slice(0, 2),
    ],
  }
}

const REACTION_TYPE_LABELS: Record<string, string> = {
  addition:      'Addition',
  elimination:   'Elimination',
  substitution:  'Substitution',
  eas:           'Electrophilic Aromatic Substitution (EAS)',
  radical:       'Radical',
  reduction:     'Reduction',
  oxidation:     'Oxidation',
  condensation:  'Condensation',
  pericyclic:    'Pericyclic',
  rearrangement: 'Rearrangement',
}

function buildIdentifyMechanism(r: ReactionDef): MechQuestion {
  const correct = REACTION_TYPE_LABELS[r.reactionType] ?? r.reactionType
  const allTypes = Object.values(REACTION_TYPE_LABELS)
  const choices  = makeChoices(correct, allTypes)
  return {
    type: 'identify-mechanism',
    reactionId: r.id,
    category: r.category,
    scenario: `Reaction: ${r.name}\nReactants: ${r.reactants} → ${r.products}\nConditions: ${r.conditions}`,
    question: 'What type of mechanism is this?',
    choices,
    answer: correct,
    explanation: `${r.name} is ${correct.toLowerCase()}. ${r.summary}`,
    steps: [
      `Answer: ${r.name} — ${correct}`,
      r.intermediate ? `Key intermediate: ${r.intermediate}` : 'Concerted — no intermediate',
      ...r.importantInfo.slice(0, 2),
    ],
  }
}

const REGIO_LABELS: Record<string, string> = {
  'markovnikov':      'Markovnikov (H adds to less substituted carbon)',
  'anti-markovnikov': 'Anti-Markovnikov (H adds to more substituted carbon)',
}

const REGIO_ALL = Object.values(REGIO_LABELS)
const REGIO_NONE = 'No regiochemistry (not applicable for this reaction)'

function buildPredictRegio(r: ReactionDef): MechQuestion | null {
  if (!r.regiochemistry) return null
  const correct = REGIO_LABELS[r.regiochemistry] ?? r.regiochemistry
  const wrong   = REGIO_ALL.filter(x => x !== correct)
  const choices = shuffle([correct, ...wrong, REGIO_NONE]).slice(0, 4)
  if (!choices.includes(correct)) choices[0] = correct
  return {
    type: 'predict-regio',
    reactionId: r.id,
    category: r.category,
    scenario: `Reaction: ${r.name}\nReactants: ${r.reactants}\nConditions: ${r.conditions}`,
    question: 'What regiochemistry is expected for this reaction?',
    choices: shuffle(choices),
    answer: correct,
    explanation: `${r.name} follows ${correct}. ${r.summary}`,
    steps: [
      `Answer: ${r.regiochemistry}`,
      `Rationale: ${r.importantInfo[0] ?? r.summary}`,
    ],
  }
}

const STEREO_LABELS: Record<string, string> = {
  syn:          'Syn addition (both groups add to same face)',
  anti:         'Anti addition (groups add to opposite faces)',
  inversion:    'Inversion of configuration (SN2 Walden inversion)',
  retention:    'Retention of configuration',
  racemization: 'Racemization (equal mixture of enantiomers)',
}

const STEREO_ALL  = Object.values(STEREO_LABELS)
const STEREO_NONE = 'No specific stereochemistry (achiral product)'

function buildPredictStereo(r: ReactionDef): MechQuestion | null {
  if (!r.stereochemistry) return null
  const correct = STEREO_LABELS[r.stereochemistry] ?? r.stereochemistry
  const wrong   = STEREO_ALL.filter(x => x !== correct)
  const choices = shuffle([correct, ...wrong.slice(0, 2), STEREO_NONE])
  if (!choices.includes(correct)) choices[0] = correct
  return {
    type: 'predict-stereo',
    reactionId: r.id,
    category: r.category,
    scenario: `Reaction: ${r.name}\nReactants: ${r.reactants}\nConditions: ${r.conditions}`,
    question: 'What stereochemical outcome is expected?',
    choices: shuffle(choices),
    answer: correct,
    explanation: `${r.name} gives ${correct.toLowerCase()}. ${r.summary}`,
    steps: [
      `Answer: ${r.stereochemistry}`,
      r.intermediate ? `Intermediate: ${r.intermediate}` : 'Concerted mechanism determines stereo',
      `Rationale: ${r.importantInfo[0] ?? r.summary}`,
    ],
  }
}

function buildIdentifyReagent(r: ReactionDef, pool: ReactionDef[]): MechQuestion {
  const correct = r.conditions
  const wrong   = pool.filter(p => p.id !== r.id && p.conditions !== correct).map(p => p.conditions)
  const choices = makeChoices(correct, wrong)
  return {
    type: 'identify-reagent',
    reactionId: r.id,
    category: r.category,
    scenario: `Transformation: ${r.reactants} → ${r.products}`,
    question: 'Which reagent(s) / conditions are needed for this transformation?',
    choices,
    answer: correct,
    explanation: `This transformation requires ${correct} (${r.name}). ${r.summary}`,
    steps: [
      `Conditions: ${r.conditions}`,
      `Reaction: ${r.name}`,
      ...r.importantInfo.slice(0, 2),
    ],
  }
}

// ── Public generators ─────────────────────────────────────────────────────────

export function generateQuestion(
  type: QuestionType,
  category: MechanismCategory | 'all' = 'all',
): MechQuestion | null {
  const pool = category === 'all' ? ALL_REACTIONS : ALL_REACTIONS.filter(r => r.category === category)
  if (pool.length === 0) return null

  if (type === 'predict-product') {
    const r = pick(pool)
    return buildPredictProduct(r, pool)
  }

  if (type === 'identify-mechanism') {
    const r = pick(pool)
    return buildIdentifyMechanism(r)
  }

  if (type === 'predict-regio') {
    const eligible = pool.filter(r => r.regiochemistry != null)
    if (eligible.length === 0) return null
    return buildPredictRegio(pick(eligible))
  }

  if (type === 'predict-stereo') {
    const eligible = pool.filter(r => r.stereochemistry != null)
    if (eligible.length === 0) return null
    return buildPredictStereo(pick(eligible))
  }

  if (type === 'identify-reagent') {
    const r = pick(pool)
    return buildIdentifyReagent(r, pool)
  }

  return null
}

export function generateMixedQuestion(category: MechanismCategory | 'all' = 'all'): MechQuestion {
  const types: QuestionType[] = ['predict-product', 'identify-mechanism', 'predict-regio', 'predict-stereo', 'identify-reagent']
  for (let attempt = 0; attempt < 20; attempt++) {
    const type = pick(types)
    const q = generateQuestion(type, category)
    if (q) return q
  }
  // Fallback: predict-product always works
  return generateQuestion('predict-product', 'all')!
}

export function checkMechAnswer(q: MechQuestion, selected: string): boolean {
  return selected.trim() === q.answer.trim()
}

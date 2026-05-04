import { ALL_REACTIONS, REACTIONS_BY_ID } from '../data/mechanismData'
import type { ReactionDef } from '../data/mechanismData'

export type MechanismQuestionType = 'classify-mechanism' | 'predict-stereo'

export interface MechanismProblem {
  type: MechanismQuestionType
  reactionId: string
  scenario: string
  question: string
  choices: string[]
  answer: string
  steps: string[]
  explanation: string
}

export function checkMechanismAnswer(problem: MechanismProblem, selected: string): boolean {
  return selected.trim() === problem.answer.trim()
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function makeChoices(correct: string, pool: string[], n = 3): string[] {
  const wrong = pool.filter(x => x !== correct)
  const chosen = shuffle(wrong).slice(0, Math.min(n, wrong.length))
  return shuffle([correct, ...chosen])
}

// Reactions that have a unique abbreviated name (exclude the competition entry)
const CLASSIFIABLE = ALL_REACTIONS.filter(r => r.abbr && r.abbr !== 'Competition')
const ALL_ABBRS = [...new Set(CLASSIFIABLE.map(r => r.abbr!))]

// Canonical stereo outcome strings — answer choices for predict-stereo problems
const STEREO_MAP: Record<string, string> = {
  'sn2':               'Complete inversion of configuration',
  'sn1':               'Racemization (mixture of both enantiomers)',
  'e2':                'Anti-periplanar elimination; predominantly trans (E) alkene',
  'e1':                'Non-stereospecific; mixture of cis/trans alkenes',
  'hx-addition':       'Racemization at the new stereocenter',
  'acid-hydration':    'Racemization at the new stereocenter',
  'alkene-halogenation': 'Anti addition — two halogens on opposite faces',
  'hydroboration':     'Syn addition — H and OH delivered to the same face',
  'epoxidation':       'Syn addition — O inserts from one face; alkene geometry preserved',
}

const ALL_STEREO_OUTCOMES = [...new Set(Object.values(STEREO_MAP))]
const STEREO_REACTIONS = CLASSIFIABLE.filter(r => r.id in STEREO_MAP)

function buildClassifyQuestion(r: ReactionDef): MechanismProblem {
  return {
    type: 'classify-mechanism',
    reactionId: r.id,
    scenario: [
      `Substrate / Reactant: ${r.reactants}`,
      `Conditions: ${r.conditions}`,
      `Observed product: ${r.product}`,
    ].join('\n'),
    question: 'Which mechanism best describes this transformation?',
    choices: makeChoices(r.abbr!, ALL_ABBRS),
    answer: r.abbr!,
    explanation: `${r.name}: ${r.mechanismType}${r.intermediate ? '. Intermediate: ' + r.intermediate : ' (concerted)'}.`,
    steps: [
      `Answer: ${r.name} (${r.abbr})`,
      `Mechanism type: ${r.mechanismType}`,
      r.intermediate
        ? `Intermediate: ${r.intermediate}`
        : 'No intermediate — concerted mechanism (single transition state)',
      `Diagnostic conditions: ${r.conditions}`,
      ...r.keyRules.slice(0, 3),
      `Reference: ${r.brownRef}`,
    ],
  }
}

function buildStereoQuestion(r: ReactionDef): MechanismProblem {
  const answer = STEREO_MAP[r.id]!
  return {
    type: 'predict-stereo',
    reactionId: r.id,
    scenario: [
      `Reaction: ${r.name}`,
      `Reactants: ${r.reactants}`,
      `Conditions: ${r.conditions}`,
    ].join('\n'),
    question: 'What stereochemical outcome is expected at the reaction site?',
    choices: makeChoices(answer, ALL_STEREO_OUTCOMES),
    answer,
    explanation: r.stereochemistry ?? answer,
    steps: [
      `This is ${r.name} (${r.abbr}).`,
      `Stereochemical outcome: ${r.stereochemistry ?? answer}`,
      r.intermediate
        ? `Key: the ${r.intermediate} is flat — nucleophile/base can attack from either face.`
        : 'Key: concerted mechanism locks in the geometry of attack.',
      ...r.keyRules.slice(0, 2),
    ],
  }
}

export function generateMechanismProblem(): MechanismProblem {
  const useStereo = STEREO_REACTIONS.length > 0 && Math.random() < 0.4

  for (let attempt = 0; attempt < 30; attempt++) {
    if (useStereo) {
      const r = pick(STEREO_REACTIONS)
      if (STEREO_MAP[r.id]) return buildStereoQuestion(r)
    } else {
      const r = pick(CLASSIFIABLE)
      return buildClassifyQuestion(r)
    }
  }

  return buildClassifyQuestion(REACTIONS_BY_ID['sn2'] as ReactionDef)
}

// Pure utility functions for organic chemistry practice problem generation.
// No React imports.

import { FUNCTIONAL_GROUPS, NAMING_PROBLEMS } from '../data/functionalGroups'
import { classifyHydrocarbon } from '../chem/organic'

// ── Hydrocarbon Classification Problems ───────────────────────────────────────

export interface HydrocarbonProblem {
  formula: string
  C: number
  H: number
  correctFamily: 'alkane' | 'alkene' | 'alkyne' | 'aromatic'
  options: string[]
}

/** Generate a random hydrocarbon classification problem (C2–C8). */
export function genHydrocarbonProblem(): HydrocarbonProblem {
  const families = ['alkane', 'alkene', 'alkyne'] as const
  const family = families[Math.floor(Math.random() * families.length)]
  const n = Math.floor(Math.random() * 7) + 2 // 2–8

  let C = n, H: number
  let formula: string

  if (family === 'alkane') {
    H = 2 * n + 2
    formula = `C${n}H${H}`
  } else if (family === 'alkene') {
    H = 2 * n
    formula = `C${n}H${H}`
  } else {
    H = 2 * n - 2
    formula = `C${n}H${H}`
  }

  const options = ['alkane', 'alkene', 'alkyne']
  return { formula, C, H, correctFamily: family, options }
}

/** Verify a hydrocarbon classification answer. */
export function checkHydrocarbonAnswer(problem: HydrocarbonProblem, answer: string): boolean {
  return answer.toLowerCase().trim() === problem.correctFamily
}

/** Get explanation steps for a hydrocarbon problem. */
export function hydrocarbonSolutionSteps(problem: HydrocarbonProblem): string[] {
  const result = classifyHydrocarbon(problem.C, problem.H)
  return [
    `Formula: ${problem.formula}`,
    `C = ${problem.C}, H = ${problem.H}`,
    result.reasoning,
    `Family: ${result.family}`,
  ]
}

// ── Isomer Problems ───────────────────────────────────────────────────────────

export interface IsomerProblem {
  formula1: string
  formula2: string
  areIsomers: boolean
  explanation: string
}

const ISOMER_PAIRS: { formula1: string; formula2: string; areIsomers: boolean; explanation: string }[] = [
  { formula1: 'C4H10', formula2: 'C4H10', areIsomers: true,  explanation: 'Both C₄H₁₀ — butane and isobutane are structural isomers (same molecular formula, different connectivity).' },
  { formula1: 'C4H10', formula2: 'C4H8',  areIsomers: false, explanation: 'C₄H₁₀ vs C₄H₈ — different molecular formulas (alkane vs alkene), not isomers.' },
  { formula1: 'C3H8',  formula2: 'C3H8',  areIsomers: true,  explanation: 'Both C₃H₈ — propane has only one structural isomer (itself) among straight-chain alkanes.' },
  { formula1: 'C5H12', formula2: 'C5H12', areIsomers: true,  explanation: 'Both C₅H₁₂ — pentane has three structural isomers (pentane, isopentane, neopentane).' },
  { formula1: 'C2H6',  formula2: 'C3H8',  areIsomers: false, explanation: 'C₂H₆ vs C₃H₈ — ethane and propane have different molecular formulas.' },
  { formula1: 'C4H8',  formula2: 'C4H8',  areIsomers: true,  explanation: 'Both C₄H₈ — 1-butene and 2-butene are structural isomers (alkenes); cis- and trans-2-butene are geometric isomers.' },
  { formula1: 'C6H14', formula2: 'C6H14', areIsomers: true,  explanation: 'Both C₆H₁₄ — hexane has five structural isomers.' },
  { formula1: 'C2H6',  formula2: 'C2H4',  areIsomers: false, explanation: 'C₂H₆ (ethane) vs C₂H₄ (ethene) — different molecular formulas.' },
  { formula1: 'C3H6',  formula2: 'C3H6',  areIsomers: true,  explanation: 'Both C₃H₆ — propene and cyclopropane are constitutional isomers (one double bond vs one ring, DoU=1).' },
  { formula1: 'C4H10', formula2: 'C3H8',  areIsomers: false, explanation: 'C₄H₁₀ vs C₃H₈ — butane and propane have different molecular formulas.' },
]

/** Generate a random isomer problem. */
export function genIsomerProblem(): IsomerProblem {
  return ISOMER_PAIRS[Math.floor(Math.random() * ISOMER_PAIRS.length)]
}

/** Check an isomer answer (yes/no or true/false). */
export function checkIsomerAnswer(problem: IsomerProblem, answer: string): boolean {
  const a = answer.toLowerCase().trim()
  const isYes = a === 'yes' || a === 'true'
  const isNo  = a === 'no'  || a === 'false'
  return problem.areIsomers ? isYes : isNo
}

// ── Naming Problems ───────────────────────────────────────────────────────────

export { NAMING_PROBLEMS } from '../data/functionalGroups'

/** Generate a random naming problem from NAMING_PROBLEMS. */
export function genNamingProblem() {
  return NAMING_PROBLEMS[Math.floor(Math.random() * NAMING_PROBLEMS.length)]
}

/** Check a naming answer (case-insensitive, trimmed). */
export function checkNamingAnswer(correctName: string, answer: string): boolean {
  return answer.toLowerCase().trim() === correctName.toLowerCase().trim()
}

// ── Functional Group Problems ─────────────────────────────────────────────────

export interface FunctionalGroupProblem {
  description: string
  correctId: string
  options: string[]  // group names
}

/** Generate a random functional group identification problem. */
export function genFunctionalGroupProblem(): FunctionalGroupProblem {
  const group = FUNCTIONAL_GROUPS[Math.floor(Math.random() * FUNCTIONAL_GROUPS.length)]

  // Build description using a random example
  const ex = group.examples[Math.floor(Math.random() * group.examples.length)]
  const descriptions = [
    `A compound with the bond pattern "${group.bondPattern}" and general formula ${group.generalFormula}. An example is ${ex.name} (${ex.formula}).`,
    `This functional group has the general formula ${group.generalFormula} and uses the suffix "${group.suffix}". Example: ${ex.name}.`,
    `Identify the class: ${ex.formula} (${ex.name}) belongs to this group. Key property: ${group.properties.split(';')[0]}.`,
  ]
  const description = descriptions[Math.floor(Math.random() * descriptions.length)]

  // Build 4-option multiple choice (correct + 3 distractors)
  const others = FUNCTIONAL_GROUPS.filter(g => g.id !== group.id)
  const distractors: string[] = []
  const shuffled = [...others].sort(() => Math.random() - 0.5)
  for (const d of shuffled) {
    if (distractors.length < 3) distractors.push(d.name)
  }
  const options = [group.name, ...distractors].sort(() => Math.random() - 0.5)

  return { description, correctId: group.name, options }
}

/** Check a functional group answer. */
export function checkFunctionalGroupAnswer(problem: FunctionalGroupProblem, answer: string): boolean {
  return answer === problem.correctId
}

// ── Organic Reactions Problems ────────────────────────────────────────────────

export interface OrganicReactionProblem {
  scenario: string
  correctType: string
  options: string[]
  explanation: string
}

const REACTION_TYPE_OPTIONS = ['Addition', 'Substitution', 'Elimination', 'Combustion', 'Condensation']

const REACTION_PROBLEMS: OrganicReactionProblem[] = [
  {
    scenario: 'CH₂=CH₂ + H₂ → CH₃-CH₃ (ethene reacts with hydrogen gas to give ethane)',
    correctType: 'Addition',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'The double bond breaks and two atoms add across it — this is an addition reaction (hydrogenation).',
  },
  {
    scenario: 'CH₄ + Cl₂ → CH₃Cl + HCl (methane reacts with chlorine in UV light)',
    correctType: 'Substitution',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'A Cl replaces an H on methane. Alkane + halogen → haloalkane + HX is a halogenation substitution.',
  },
  {
    scenario: 'CH₃CH₂OH → CH₂=CH₂ + H₂O (ethanol heated with acid catalyst)',
    correctType: 'Elimination',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'H and OH are removed from adjacent carbons, forming a double bond — this is elimination (dehydration).',
  },
  {
    scenario: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O',
    correctType: 'Combustion',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'Hydrocarbon + O₂ → CO₂ + H₂O is always a combustion reaction.',
  },
  {
    scenario: 'CH₃COOH + CH₃OH → CH₃COOCH₃ + H₂O (acetic acid + methanol)',
    correctType: 'Condensation',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'An ester and water are formed from a carboxylic acid and alcohol — this is a condensation (esterification) reaction.',
  },
  {
    scenario: 'CH₂=CH₂ + Br₂ → CH₂Br-CH₂Br (ethene reacts with bromine)',
    correctType: 'Addition',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'Br₂ adds across the double bond — classic addition reaction (halogenation of an alkene).',
  },
  {
    scenario: 'CH₃CH₂Cl + KOH(alc) → CH₂=CH₂ + KCl + H₂O',
    correctType: 'Elimination',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'H and Cl are removed from adjacent carbons, forming a double bond — elimination (dehydrohalogenation).',
  },
  {
    scenario: 'C₂H₅OH + HCOOH → HCOOC₂H₅ + H₂O (ethanol + formic acid)',
    correctType: 'Condensation',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'Ethyl formate (ester) + water form from the reaction of an alcohol and carboxylic acid — condensation.',
  },
  {
    scenario: 'C₆H₁₄ + 19/2 O₂ → 6CO₂ + 7H₂O',
    correctType: 'Combustion',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'Complete combustion of hexane — a hydrocarbon burning in excess oxygen produces CO₂ and H₂O.',
  },
  {
    scenario: 'C₂H₄ + H₂O → C₂H₅OH (ethene + water with acid catalyst)',
    correctType: 'Addition',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'Water adds across the double bond of ethene to give ethanol — this is hydration (addition reaction).',
  },
  {
    scenario: 'CH₃Br + OH⁻ → CH₃OH + Br⁻',
    correctType: 'Substitution',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'OH⁻ replaces Br⁻ on the carbon — nucleophilic substitution (SN2 mechanism).',
  },
  {
    scenario: 'CH₃CH₂Br + KOH(aq) → CH₃CH₂OH + KBr',
    correctType: 'Substitution',
    options: REACTION_TYPE_OPTIONS,
    explanation: 'Aqueous KOH causes OH to substitute for Br — a nucleophilic substitution reaction.',
  },
]

/** Generate a random organic reaction classification problem. */
export function genOrganicReactionProblem(): OrganicReactionProblem {
  return REACTION_PROBLEMS[Math.floor(Math.random() * REACTION_PROBLEMS.length)]
}

/** Check a reaction type answer. */
export function checkReactionTypeAnswer(problem: OrganicReactionProblem, answer: string): boolean {
  return answer === problem.correctType
}

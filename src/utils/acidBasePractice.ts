// Problem generators for Acids & Bases practice.
// Pure TypeScript — no React imports.

import {
  WEAK_ACIDS, WEAK_BASES, POLYPROTIC_ACIDS, STRONG_ACIDS, STRONG_BASES,
} from '../data/acidBaseConstants'
import {
  strongAcidPh, strongBasePh, weakAcidPh, weakBasePh,
  polyproticPh, kaToKb, kbToKa, saltPh,
} from '../chem/acidBase'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randBetween(lo: number, hi: number, decimals = 2): number {
  const val = lo + Math.random() * (hi - lo)
  return parseFloat(val.toFixed(decimals))
}

function fmtConc(c: number): string {
  return c < 0.01 ? c.toExponential(2) : c.toFixed(3).replace(/\.?0+$/, '')
}

// ── pH Calculator problems ─────────────────────────────────────────────────────

export interface PhProblem {
  question: string
  correctPh: number
  steps: string[]
  isDynamic?: boolean
}

export function generatePhProblem(): PhProblem {
  const type = pick(['strong-acid', 'strong-base', 'weak-acid', 'weak-base'] as const)
  const C = randBetween(0.01, 0.50)

  if (type === 'strong-acid') {
    const acid = pick(['HCl', 'HBr', 'HNO₃', 'HClO₄'])
    const res = strongAcidPh(C, 1)
    return {
      question: `Calculate the pH of ${fmtConc(C)} M ${acid} solution.`,
      correctPh: res.pH,
      steps: res.steps,
    }
  }

  if (type === 'strong-base') {
    const base = pick(['NaOH', 'KOH', 'LiOH'])
    const res = strongBasePh(C, 1)
    return {
      question: `Calculate the pH of ${fmtConc(C)} M ${base} solution.`,
      correctPh: res.pH,
      steps: res.steps,
    }
  }

  if (type === 'weak-acid') {
    const acid = pick(WEAK_ACIDS.slice(0, 6))  // common ones
    const res = weakAcidPh(C, acid.Ka)
    return {
      question: `Calculate the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula}) solution. Ka = ${acid.Ka.toExponential(1)}.`,
      correctPh: res.pH,
      steps: res.steps,
    }
  }

  // weak-base
  const base = pick(WEAK_BASES.slice(0, 4))
  const res = weakBasePh(C, base.Kb)
  return {
    question: `Calculate the pH of ${fmtConc(C)} M ${base.name} (${base.formula}) solution. Kb = ${base.Kb.toExponential(1)}.`,
    correctPh: res.pH,
    steps: res.steps,
  }
}

// ── Ka / Kb conversion problems ──────────────────────────────────────────────

export interface KaKbProblem {
  question: string
  correctValue: number
  answerLabel: string
  isPkValue: boolean
}

export function generateKaKbProblem(): KaKbProblem {
  const convType = pick(['ka-to-kb', 'kb-to-ka', 'pka-to-ka', 'ka-to-pka', 'pka-to-pkb'] as const)

  if (convType === 'ka-to-kb') {
    const acid = pick(WEAK_ACIDS.slice(0, 8))
    const Kb = kaToKb(acid.Ka)
    return {
      question: `${acid.name} (${acid.formula}) has Ka = ${acid.Ka.toExponential(1)}. What is Kb for its conjugate base, ${acid.conjugateBase}?`,
      correctValue: Kb,
      answerLabel: 'Kb',
      isPkValue: false,
    }
  }

  if (convType === 'kb-to-ka') {
    const base = pick(WEAK_BASES.slice(0, 6))
    const Ka = kbToKa(base.Kb)
    return {
      question: `${base.name} (${base.formula}) has Kb = ${base.Kb.toExponential(1)}. What is Ka for its conjugate acid, ${base.conjugateAcid}?`,
      correctValue: Ka,
      answerLabel: 'Ka',
      isPkValue: false,
    }
  }

  if (convType === 'pka-to-ka') {
    const acid = pick(WEAK_ACIDS.slice(0, 8))
    return {
      question: `${acid.name} has pKa = ${acid.pKa.toFixed(2)}. What is Ka?`,
      correctValue: acid.Ka,
      answerLabel: 'Ka',
      isPkValue: false,
    }
  }

  if (convType === 'ka-to-pka') {
    const acid = pick(WEAK_ACIDS.slice(0, 8))
    return {
      question: `${acid.name} (${acid.formula}) has Ka = ${acid.Ka.toExponential(1)}. What is pKa?`,
      correctValue: acid.pKa,
      answerLabel: 'pKa',
      isPkValue: true,
    }
  }

  // pka-to-pkb
  const acid = pick(WEAK_ACIDS.slice(0, 8))
  const pKb = 14 - acid.pKa
  return {
    question: `${acid.name} has pKa = ${acid.pKa.toFixed(2)}. What is pKb for its conjugate base?`,
    correctValue: pKb,
    answerLabel: 'pKb',
    isPkValue: true,
  }
}

// ── Weak acid pH problems ─────────────────────────────────────────────────────

export interface WeakAcidProblem {
  question: string
  correctPh: number
  steps: string[]
  isDynamic?: boolean
}

export function generateWeakAcidProblem(): WeakAcidProblem {
  const acid = pick(WEAK_ACIDS.slice(0, 8))
  const C = randBetween(0.01, 0.50)
  const res = weakAcidPh(C, acid.Ka)
  return {
    question: `What is the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula})? Ka = ${acid.Ka.toExponential(1)}.`,
    correctPh: res.pH,
    steps: res.steps,
  }
}

// ── Weak base pH problems ─────────────────────────────────────────────────────

export interface WeakBaseProblem {
  question: string
  correctPh: number
  steps: string[]
  isDynamic?: boolean
}

export function generateWeakBaseProblem(): WeakBaseProblem {
  const base = pick(WEAK_BASES)
  const C = randBetween(0.01, 0.50)
  const res = weakBasePh(C, base.Kb)
  return {
    question: `What is the pH of ${fmtConc(C)} M ${base.name} (${base.formula})? Kb = ${base.Kb.toExponential(1)}.`,
    correctPh: res.pH,
    steps: res.steps,
  }
}

// ── Salt pH problems ──────────────────────────────────────────────────────────

interface SaltScenario {
  label: string
  question: string
  acidType: 'strong' | 'weak'
  baseType: 'strong' | 'weak'
  Ka?: number
  Kb?: number
}

const SALT_SCENARIOS: SaltScenario[] = [
  { label: 'NaCl',       question: 'NaCl',                 acidType: 'strong', baseType: 'strong' },
  { label: 'KNO₃',      question: 'KNO₃',                 acidType: 'strong', baseType: 'strong' },
  { label: 'NaCH₃COO', question: 'sodium acetate (NaCH₃COO)', acidType: 'weak', baseType: 'strong', Ka: 1.8e-5 },
  { label: 'NaF',       question: 'NaF',                   acidType: 'weak',   baseType: 'strong', Ka: 6.8e-4 },
  { label: 'NaCN',      question: 'NaCN',                  acidType: 'weak',   baseType: 'strong', Ka: 6.2e-10 },
  { label: 'NH₄Cl',    question: 'ammonium chloride (NH₄Cl)', acidType: 'strong', baseType: 'weak', Kb: 1.8e-5 },
  { label: 'NH₄NO₃',  question: 'ammonium nitrate (NH₄NO₃)', acidType: 'strong', baseType: 'weak', Kb: 1.8e-5 },
]

export interface SaltPhProblem {
  question: string
  correctPh: number
  classification: 'acidic' | 'basic' | 'neutral'
  steps: string[]
  isDynamic?: boolean
}

export function generateSaltPhProblem(): SaltPhProblem {
  const scenario = pick(SALT_SCENARIOS)
  const C = randBetween(0.05, 0.50)
  const res = saltPh(C, { type: scenario.acidType, Ka: scenario.Ka }, { type: scenario.baseType, Kb: scenario.Kb })
  return {
    question: `A ${fmtConc(C)} M solution of ${scenario.question} is prepared. Classify the solution (acidic/basic/neutral) and calculate the pH.${scenario.Ka ? ` Ka(parent acid) = ${scenario.Ka.toExponential(1)}.` : ''}${scenario.Kb ? ` Kb(parent base) = ${scenario.Kb.toExponential(1)}.` : ''}`,
    correctPh: res.pH,
    classification: res.classification,
    steps: res.steps,
  }
}

// ── Polyprotic pH problems ────────────────────────────────────────────────────

export interface PolyproticProblem {
  question: string
  correctPh: number
  steps: string[]
  isDynamic?: boolean
}

export function generatePolyproticProblem(): PolyproticProblem {
  const acid = pick(POLYPROTIC_ACIDS)
  const C = randBetween(0.05, 0.50)
  const res = polyproticPh(C, acid.Ka, acid.Ka2!, acid.Ka3)
  return {
    question: `What is the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula})? Ka1 = ${acid.Ka.toExponential(1)}, Ka2 = ${acid.Ka2!.toExponential(1)}${acid.Ka3 ? `, Ka3 = ${acid.Ka3.toExponential(1)}` : ''}.`,
    correctPh: res.pH,
    steps: res.steps,
  }
}

// ── Dynamic generators ────────────────────────────────────────────────────────
// These generators pick randomly from the full data tables and compute answers
// via the same chem/ solvers. They return the same types as the pool generators
// and are marked isDynamic: true so the UI can show a "generated" badge.

/** Dynamic version of generatePhProblem — full range of all four acid/base types. */
export function generateDynamicPhProblem(): PhProblem {
  const type = pick(['strong-acid', 'strong-base', 'weak-acid', 'weak-base'] as const)
  const C = randBetween(0.010, 1.00, 3)

  if (type === 'strong-acid') {
    // Exclude H₂SO₄ — its second proton (Ka2 = 1.2e-2) is not strong; keep monoprotic strong acids
    const acid = pick(STRONG_ACIDS.filter(a => a.Ka === Infinity && !a.Ka2))
    const res = strongAcidPh(C, 1)
    return {
      question: `Calculate the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula}) solution.`,
      correctPh: res.pH,
      steps: res.steps,
      isDynamic: true,
    }
  }

  if (type === 'strong-base') {
    const base = pick([...STRONG_BASES])
    const res = strongBasePh(C, 1)
    return {
      question: `Calculate the pH of ${fmtConc(C)} M ${base} solution.`,
      correctPh: res.pH,
      steps: res.steps,
      isDynamic: true,
    }
  }

  if (type === 'weak-acid') {
    const acid = pick(WEAK_ACIDS)
    const res = weakAcidPh(C, acid.Ka)
    return {
      question: `Calculate the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula}) solution. Ka = ${acid.Ka.toExponential(2)}.`,
      correctPh: res.pH,
      steps: res.steps,
      isDynamic: true,
    }
  }

  // weak-base
  const base = pick(WEAK_BASES)
  const res = weakBasePh(C, base.Kb)
  return {
    question: `Calculate the pH of ${fmtConc(C)} M ${base.name} (${base.formula}) solution. Kb = ${base.Kb.toExponential(2)}.`,
    correctPh: res.pH,
    steps: res.steps,
    isDynamic: true,
  }
}

/** Dynamic version of generateWeakAcidProblem — uses the full WEAK_ACIDS table. */
export function generateDynamicWeakAcidProblem(): WeakAcidProblem {
  const acid = pick(WEAK_ACIDS)
  const C = randBetween(0.010, 1.00, 3)
  const res = weakAcidPh(C, acid.Ka)
  return {
    question: `What is the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula})? Ka = ${acid.Ka.toExponential(2)}.`,
    correctPh: res.pH,
    steps: res.steps,
    isDynamic: true,
  }
}

/** Dynamic version of generateWeakBaseProblem — uses the full WEAK_BASES table. */
export function generateDynamicWeakBaseProblem(): WeakBaseProblem {
  const base = pick(WEAK_BASES)
  const C = randBetween(0.010, 1.00, 3)
  const res = weakBasePh(C, base.Kb)
  return {
    question: `What is the pH of ${fmtConc(C)} M ${base.name} (${base.formula})? Kb = ${base.Kb.toExponential(2)}.`,
    correctPh: res.pH,
    steps: res.steps,
    isDynamic: true,
  }
}

/** Dynamic version of generatePolyproticProblem — uses the full POLYPROTIC_ACIDS table. */
export function generateDynamicPolyproticProblem(): PolyproticProblem {
  const acid = pick(POLYPROTIC_ACIDS)
  const C = randBetween(0.010, 1.00, 3)
  const res = polyproticPh(C, acid.Ka, acid.Ka2!, acid.Ka3)
  return {
    question: `What is the pH of ${fmtConc(C)} M ${acid.name} (${acid.formula})? Ka1 = ${acid.Ka.toExponential(2)}, Ka2 = ${acid.Ka2!.toExponential(2)}${acid.Ka3 ? `, Ka3 = ${acid.Ka3.toExponential(2)}` : ''}.`,
    correctPh: res.pH,
    steps: res.steps,
    isDynamic: true,
  }
}


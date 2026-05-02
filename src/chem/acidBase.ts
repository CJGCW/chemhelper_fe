// Pure TypeScript acid/base solvers. No React, no utils imports.
// Reference: Chang's Chemistry 14e, Chapters 15-16.

import { Kw } from '../data/acidBaseConstants'
import { solveICETable } from './equilibrium'

// ── Basic conversions ─────────────────────────────────────────────────────────

export function phFromH(H: number): number {
  return -Math.log10(H)
}

export function hFromPh(pH: number): number {
  return Math.pow(10, -pH)
}

export function pohFromOH(OH: number): number {
  return -Math.log10(OH)
}

export function ohFromPoh(pOH: number): number {
  return Math.pow(10, -pOH)
}

export function phFromPoh(pOH: number): number {
  return 14 - pOH
}

export function kaToKb(Ka: number): number {
  return Kw / Ka
}

export function kbToKa(Kb: number): number {
  return Kw / Kb
}

// ── Formatting helper (internal) ──────────────────────────────────────────────

function fmt(n: number, sig = 3): string {
  if (!isFinite(n)) return 'undefined'
  const p = parseFloat(n.toPrecision(sig))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) {
    return p.toExponential(sig - 1)
  }
  return String(p)
}

// ── Strong acid/base ──────────────────────────────────────────────────────────

export function strongAcidPh(
  concentration: number,
  protonsPerMolecule = 1,
): { pH: number; pOH: number; H: number; steps: string[] } {
  const H = concentration * protonsPerMolecule
  const pH = phFromH(H)
  const pOH = 14 - pH
  const steps: string[] = [
    `Strong acid dissociates completely.`,
    `[H⁺] = ${fmt(concentration)} M × ${protonsPerMolecule} = ${fmt(H)} M`,
    `pH = −log[H⁺] = −log(${fmt(H)}) = ${pH.toFixed(2)}`,
    `pOH = 14 − pH = 14 − ${pH.toFixed(2)} = ${pOH.toFixed(2)}`,
  ]
  return { pH, pOH, H, steps }
}

export function strongBasePh(
  concentration: number,
  hydroxidesPerMolecule = 1,
): { pH: number; pOH: number; OH: number; steps: string[] } {
  const OH = concentration * hydroxidesPerMolecule
  const pOH = pohFromOH(OH)
  const pH = 14 - pOH
  const steps: string[] = [
    `Strong base dissociates completely.`,
    `[OH⁻] = ${fmt(concentration)} M × ${hydroxidesPerMolecule} = ${fmt(OH)} M`,
    `pOH = −log[OH⁻] = −log(${fmt(OH)}) = ${pOH.toFixed(2)}`,
    `pH = 14 − pOH = 14 − ${pOH.toFixed(2)} = ${pH.toFixed(2)}`,
  ]
  return { pH, pOH, OH, steps }
}

// ── Weak acid: HA ⇌ H⁺ + A⁻ ──────────────────────────────────────────────────

export function weakAcidPh(
  concentration: number,
  Ka: number,
): { pH: number; H: number; percentDissociation: number; approximationValid: boolean; steps: string[] } {
  const result = solveICETable({
    reactants: [{ formula: 'HA', coefficient: 1, state: 'aq' }],
    products:  [{ formula: 'H⁺', coefficient: 1, state: 'aq' }, { formula: 'A⁻', coefficient: 1, state: 'aq' }],
    initial:   { 'HA': concentration, 'H⁺': 0, 'A⁻': 0 },
    K: Ka,
    kType: 'Kc',
  })

  const H = result.equilibriumConcentrations['H⁺']
  const pH = phFromH(H)
  const percentDissociation = (H / concentration) * 100

  const steps: string[] = [
    `Weak acid equilibrium: HA ⇌ H⁺ + A⁻`,
    `Ka = ${fmt(Ka, 2)}`,
    `C₀(HA) = ${fmt(concentration)} M`,
    ...result.steps,
    `[H⁺] = x = ${fmt(H)} M`,
    `Percent dissociation = ${percentDissociation.toFixed(1)}%`,
    `pH = −log(${fmt(H)}) = ${pH.toFixed(2)}`,
  ]

  return { pH, H, percentDissociation, approximationValid: result.approximationValid, steps }
}

// ── Weak base: B + H₂O ⇌ BH⁺ + OH⁻ ─────────────────────────────────────────

export function weakBasePh(
  concentration: number,
  Kb: number,
): { pH: number; OH: number; percentDissociation: number; approximationValid: boolean; steps: string[] } {
  const result = solveICETable({
    reactants: [{ formula: 'B', coefficient: 1, state: 'aq' }],
    products:  [{ formula: 'BH⁺', coefficient: 1, state: 'aq' }, { formula: 'OH⁻', coefficient: 1, state: 'aq' }],
    initial:   { 'B': concentration, 'BH⁺': 0, 'OH⁻': 0 },
    K: Kb,
    kType: 'Kc',
  })

  const OH = result.equilibriumConcentrations['OH⁻']
  const pOH = pohFromOH(OH)
  const pH = 14 - pOH
  const percentDissociation = (OH / concentration) * 100

  const steps: string[] = [
    `Weak base equilibrium: B + H₂O ⇌ BH⁺ + OH⁻`,
    `Kb = ${fmt(Kb, 2)}`,
    `C₀(B) = ${fmt(concentration)} M`,
    ...result.steps,
    `[OH⁻] = x = ${fmt(OH)} M`,
    `Percent dissociation = ${percentDissociation.toFixed(1)}%`,
    `pOH = −log(${fmt(OH)}) = ${pOH.toFixed(2)}`,
    `pH = 14 − ${pOH.toFixed(2)} = ${pH.toFixed(2)}`,
  ]

  return { pH, OH, percentDissociation, approximationValid: result.approximationValid, steps }
}

// ── Salt pH ───────────────────────────────────────────────────────────────────

export function saltPh(
  saltConcentration: number,
  acidOrigin: { type: 'strong' | 'weak'; Ka?: number },
  baseOrigin: { type: 'strong' | 'weak'; Kb?: number },
): { pH: number; classification: 'acidic' | 'basic' | 'neutral'; steps: string[] } {

  // Strong acid + strong base → neutral
  if (acidOrigin.type === 'strong' && baseOrigin.type === 'strong') {
    return {
      pH: 7,
      classification: 'neutral',
      steps: [
        'Salt of strong acid + strong base → neither ion hydrolyzes.',
        'pH = 7.00 at 25°C.',
      ],
    }
  }

  // Weak acid + strong base → basic (A⁻ hydrolyzes)
  if (acidOrigin.type === 'weak' && baseOrigin.type === 'strong') {
    const Ka = acidOrigin.Ka!
    const Kb_conj = kaToKb(Ka)
    const result = weakBasePh(saltConcentration, Kb_conj)
    return {
      pH: result.pH,
      classification: 'basic',
      steps: [
        'Salt of weak acid + strong base: conjugate base A⁻ hydrolyzes.',
        `A⁻ + H₂O ⇌ HA + OH⁻`,
        `Ka(HA) = ${fmt(Ka, 2)}`,
        `Kb(A⁻) = Kw / Ka = ${fmt(Kw)} / ${fmt(Ka, 2)} = ${fmt(Kb_conj, 2)}`,
        ...result.steps,
      ],
    }
  }

  // Strong acid + weak base → acidic (BH⁺ ionizes)
  if (acidOrigin.type === 'strong' && baseOrigin.type === 'weak') {
    const Kb = baseOrigin.Kb!
    const Ka_conj = kbToKa(Kb)
    const result = weakAcidPh(saltConcentration, Ka_conj)
    return {
      pH: result.pH,
      classification: 'acidic',
      steps: [
        'Salt of strong acid + weak base: conjugate acid BH⁺ ionizes.',
        `BH⁺ ⇌ B + H⁺`,
        `Kb(B) = ${fmt(Kb, 2)}`,
        `Ka(BH⁺) = Kw / Kb = ${fmt(Kw)} / ${fmt(Kb, 2)} = ${fmt(Ka_conj, 2)}`,
        ...result.steps,
      ],
    }
  }

  // Weak acid + weak base → compare Ka and Kb
  const Ka = acidOrigin.Ka!
  const Kb = baseOrigin.Kb!
  if (Ka > Kb) {
    // More acidic character
    const Ka_conj = kbToKa(Kb)
    const result = weakAcidPh(saltConcentration, Ka_conj)
    return {
      pH: result.pH,
      classification: 'acidic',
      steps: [
        'Salt of weak acid + weak base. Ka > Kb, so acidic character dominates.',
        `Ka(HA) = ${fmt(Ka, 2)}, Kb(B) = ${fmt(Kb, 2)}`,
        `Ka(BH⁺) = Kw / Kb = ${fmt(Ka_conj, 2)}`,
        ...result.steps,
      ],
    }
  } else if (Kb > Ka) {
    const Kb_conj = kaToKb(Ka)
    const result = weakBasePh(saltConcentration, Kb_conj)
    return {
      pH: result.pH,
      classification: 'basic',
      steps: [
        'Salt of weak acid + weak base. Kb > Ka, so basic character dominates.',
        `Ka(HA) = ${fmt(Ka, 2)}, Kb(B) = ${fmt(Kb, 2)}`,
        `Kb(A⁻) = Kw / Ka = ${fmt(Kb_conj, 2)}`,
        ...result.steps,
      ],
    }
  } else {
    return {
      pH: 7,
      classification: 'neutral',
      steps: [
        'Salt of weak acid + weak base. Ka ≈ Kb → approximately neutral.',
        `Ka = ${fmt(Ka, 2)}, Kb = ${fmt(Kb, 2)}`,
        'pH ≈ 7.00',
      ],
    }
  }
}

// ── Polyprotic acid ───────────────────────────────────────────────────────────

export function polyproticPh(
  concentration: number,
  Ka1: number,
  Ka2: number,
  Ka3?: number,
): { pH: number; species: Record<string, number>; steps: string[] } {
  // Use Ka1 only for pH (Ka2 << Ka1; negligible contribution)
  const result = weakAcidPh(concentration, Ka1)
  const H = result.H
  const pH = result.pH

  // Estimate species concentrations from Ka2 (second step)
  // [H₂A] ≈ C - [H⁺], [HA⁻] ≈ [H⁺] (from first step)
  const H2A = concentration - H
  const HA_minus = H
  // [A²⁻] = Ka2 × [HA⁻] / [H⁺] ≈ Ka2
  const A2minus = Ka2

  const species: Record<string, number> = {
    'H₂A': H2A,
    'HA⁻': HA_minus,
    'A²⁻': A2minus,
    'H⁺':  H,
  }

  if (Ka3 !== undefined) {
    // [A³⁻] = Ka3 × [A²⁻] / [H⁺] ≈ Ka3 × Ka2 / H (extremely small)
    species['A³⁻'] = Ka3 * Ka2 / H
  }

  const steps: string[] = [
    `Polyprotic acid: use Ka1 for pH (Ka2 << Ka1, negligible).`,
    `Ka1 = ${fmt(Ka1, 2)}, Ka2 = ${fmt(Ka2, 2)}${Ka3 !== undefined ? `, Ka3 = ${fmt(Ka3, 2)}` : ''}`,
    ...result.steps,
    `[HA⁻] ≈ [H⁺] = ${fmt(HA_minus)} M`,
    `[A²⁻] ≈ Ka2 = ${fmt(A2minus)} M  (negligible for pH)`,
    `pH = ${pH.toFixed(2)}`,
  ]

  return { pH, species, steps }
}

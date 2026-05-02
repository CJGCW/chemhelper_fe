// Pure TypeScript titration curve solver. No React, no utils imports.
// Reference: Chang's Chemistry 14e, Chapter 16.

import { weakAcidPh, weakBasePh, phFromH, phFromPoh, pohFromOH } from './acidBase'

const Kw = 1.0e-14

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TitrationPoint { volumeAdded: number; pH: number }

export interface TitrationCurveInput {
  analyte: {
    type: 'strong-acid' | 'weak-acid' | 'strong-base' | 'weak-base'
    concentration: number  // M
    volume: number         // mL
    Ka?: number
    Kb?: number
  }
  titrant: {
    type: 'strong-acid' | 'strong-base'
    concentration: number  // M
  }
  resolution?: number  // number of curve points, default 100
}

export interface TitrationCurveSolution {
  points: TitrationPoint[]
  equivalenceVolume: number   // mL
  equivalencePH: number
  halfEquivalenceVolume: number
  halfEquivalencePH: number
  initialPH: number
  bufferRegion: { startVol: number; endVol: number }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function clampPh(pH: number): number {
  return Math.max(0, Math.min(14, pH))
}

// ── Strong acid + Strong base titration ───────────────────────────────────────

function strongAcidStrongBase(
  Ca: number, Va: number, Cb: number, resolution: number,
): TitrationCurveSolution {
  const equivVol = (Ca * Va) / Cb  // mL

  const totalPoints = resolution + 1
  const maxVol = equivVol * 2.2
  const points: TitrationPoint[] = []

  for (let i = 0; i <= totalPoints; i++) {
    const Vb = (i / totalPoints) * maxVol
    let pH: number

    const molAcid = Ca * Va / 1000
    const molBase = Cb * Vb / 1000
    const totalVol = (Va + Vb) / 1000  // L

    if (molBase < molAcid - 1e-15) {
      // Before equivalence: excess H+
      const excessH = (molAcid - molBase) / totalVol
      pH = clampPh(-Math.log10(excessH))
    } else if (Math.abs(molBase - molAcid) < 1e-15) {
      // At equivalence: neutral
      pH = 7.0
    } else {
      // After equivalence: excess OH-
      const excessOH = (molBase - molAcid) / totalVol
      const pOH = -Math.log10(excessOH)
      pH = clampPh(14 - pOH)
    }
    points.push({ volumeAdded: Vb, pH })
  }

  const initialPH = clampPh(-Math.log10(Ca))

  return {
    points,
    equivalenceVolume: equivVol,
    equivalencePH: 7.0,
    halfEquivalenceVolume: equivVol / 2,
    halfEquivalencePH: 7.0,  // not meaningful for SA+SB, set to 7
    initialPH,
    bufferRegion: { startVol: 0, endVol: 0 },  // no buffer region for SA+SB
  }
}

// ── Strong base + Strong acid titration ───────────────────────────────────────

function strongBaseStrongAcid(
  Cb: number, Vb: number, Ca: number, resolution: number,
): TitrationCurveSolution {
  const equivVol = (Cb * Vb) / Ca  // mL of acid to add

  const totalPoints = resolution + 1
  const maxVol = equivVol * 2.2
  const points: TitrationPoint[] = []

  for (let i = 0; i <= totalPoints; i++) {
    const Va = (i / totalPoints) * maxVol
    let pH: number

    const molBase = Cb * Vb / 1000
    const molAcid = Ca * Va / 1000
    const totalVol = (Vb + Va) / 1000

    if (molAcid < molBase - 1e-15) {
      // Excess OH-
      const excessOH = (molBase - molAcid) / totalVol
      const pOH = -Math.log10(excessOH)
      pH = clampPh(14 - pOH)
    } else if (Math.abs(molAcid - molBase) < 1e-15) {
      pH = 7.0
    } else {
      // Excess H+
      const excessH = (molAcid - molBase) / totalVol
      pH = clampPh(-Math.log10(excessH))
    }
    points.push({ volumeAdded: Va, pH })
  }

  const initialOH = Cb
  const initialPOH = -Math.log10(initialOH)
  const initialPH = 14 - initialPOH

  return {
    points,
    equivalenceVolume: equivVol,
    equivalencePH: 7.0,
    halfEquivalenceVolume: equivVol / 2,
    halfEquivalencePH: 7.0,
    initialPH: clampPh(initialPH),
    bufferRegion: { startVol: 0, endVol: 0 },
  }
}

// ── Weak acid + Strong base titration ─────────────────────────────────────────

function weakAcidStrongBase(
  Ca: number, Va: number, Ka: number, Cb: number, resolution: number,
): TitrationCurveSolution {
  const equivVol = (Ca * Va) / Cb  // mL
  const molHA0   = Ca * Va / 1000  // initial moles of HA

  const totalPoints = resolution + 1
  const maxVol = equivVol * 2.2
  const points: TitrationPoint[] = []

  // Initial pH: weak acid alone
  const initialResult = weakAcidPh(Ca, Ka)
  const initialPH = clampPh(initialResult.pH)

  for (let i = 0; i <= totalPoints; i++) {
    const Vb = (i / totalPoints) * maxVol
    let pH: number

    const molBase = Cb * Vb / 1000
    const totalVol = (Va + Vb) / 1000

    if (Vb < 1e-12) {
      // Initial point
      pH = initialPH
    } else if (molBase < molHA0 - 1e-15) {
      // Buffer region: HA + OH- → A- + H2O
      const molA  = molBase           // moles of A- formed
      const molHA = molHA0 - molBase  // remaining HA
      // Henderson-Hasselbalch (mole ratio, volume cancels)
      const pKa = -Math.log10(Ka)
      pH = clampPh(pKa + Math.log10(molA / molHA))
    } else if (Math.abs(molBase - molHA0) < 1e-15) {
      // Equivalence: all HA → A-, conjugate base hydrolyzes
      const concA = molHA0 / totalVol
      const Kb_conj = Kw / Ka
      const r = weakBasePh(concA, Kb_conj)
      pH = clampPh(r.pH)
    } else {
      // After equivalence: excess OH-
      const excessOH = (molBase - molHA0) / totalVol
      const pOH = pohFromOH(excessOH)
      pH = clampPh(phFromPoh(pOH))
    }
    points.push({ volumeAdded: Vb, pH })
  }

  // Equivalence pH
  const concAEquiv = molHA0 / ((Va + equivVol) / 1000)
  const Kb_conj = Kw / Ka
  const equivResult = weakBasePh(concAEquiv, Kb_conj)
  const equivalencePH = clampPh(equivResult.pH)

  // Half-equivalence pH ≈ pKa
  const halfEquivPH = clampPh(-Math.log10(Ka))

  return {
    points,
    equivalenceVolume: equivVol,
    equivalencePH,
    halfEquivalenceVolume: equivVol / 2,
    halfEquivalencePH: halfEquivPH,
    initialPH,
    bufferRegion: { startVol: 0, endVol: equivVol },
  }
}

// ── Weak base + Strong acid titration ─────────────────────────────────────────

function weakBaseStrongAcid(
  Cb: number, Vb: number, Kb: number, Ca: number, resolution: number,
): TitrationCurveSolution {
  const equivVol = (Cb * Vb) / Ca  // mL of acid to add
  const molB0    = Cb * Vb / 1000

  const totalPoints = resolution + 1
  const maxVol = equivVol * 2.2
  const points: TitrationPoint[] = []

  // Initial pH: weak base alone
  const initialResult = weakBasePh(Cb, Kb)
  const initialPH = clampPh(initialResult.pH)

  for (let i = 0; i <= totalPoints; i++) {
    const Va = (i / totalPoints) * maxVol
    let pH: number

    const molAcid = Ca * Va / 1000
    const totalVol = (Vb + Va) / 1000

    if (Va < 1e-12) {
      pH = initialPH
    } else if (molAcid < molB0 - 1e-15) {
      // Buffer region: B + H+ → BH+
      const molBH = molAcid        // moles of BH+ formed
      const molB  = molB0 - molAcid
      const Ka_conj = Kw / Kb
      const pKa_conj = -Math.log10(Ka_conj)
      // Henderson-Hasselbalch for conjugate acid: pH = pKa + log([B]/[BH+])
      pH = clampPh(pKa_conj + Math.log10(molB / molBH))
    } else if (Math.abs(molAcid - molB0) < 1e-15) {
      // Equivalence: all B → BH+, conjugate acid ionizes
      const Ka_conj = Kw / Kb
      const concBH = molB0 / totalVol
      const r = weakAcidPh(concBH, Ka_conj)
      pH = clampPh(r.pH)
    } else {
      // After equivalence: excess H+
      const excessH = (molAcid - molB0) / totalVol
      pH = clampPh(phFromH(excessH))
    }
    points.push({ volumeAdded: Va, pH })
  }

  // Equivalence pH
  const Ka_conj = Kw / Kb
  const concBHEquiv = molB0 / ((Vb + equivVol) / 1000)
  const equivResult = weakAcidPh(concBHEquiv, Ka_conj)
  const equivalencePH = clampPh(equivResult.pH)

  // Half-equivalence pH ≈ pKa of conjugate acid = 14 - pKb
  const pKb = -Math.log10(Kb)
  const halfEquivPH = clampPh(14 - pKb)

  return {
    points,
    equivalenceVolume: equivVol,
    equivalencePH,
    halfEquivalenceVolume: equivVol / 2,
    halfEquivalencePH: halfEquivPH,
    initialPH,
    bufferRegion: { startVol: 0, endVol: equivVol },
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function computeTitrationCurve(input: TitrationCurveInput): TitrationCurveSolution {
  const { analyte, titrant, resolution = 100 } = input
  const { type: aType, concentration: Ca, volume: Va, Ka, Kb } = analyte
  const { type: tType, concentration: Cb } = titrant

  if (aType === 'strong-acid' && tType === 'strong-base') {
    return strongAcidStrongBase(Ca, Va, Cb, resolution)
  }
  if (aType === 'strong-base' && tType === 'strong-acid') {
    return strongBaseStrongAcid(Ca, Va, Cb, resolution)
  }
  if (aType === 'weak-acid' && tType === 'strong-base') {
    if (!Ka) throw new Error('Ka required for weak acid titration')
    return weakAcidStrongBase(Ca, Va, Ka, Cb, resolution)
  }
  if (aType === 'weak-base' && tType === 'strong-acid') {
    if (!Kb) throw new Error('Kb required for weak base titration')
    return weakBaseStrongAcid(Ca, Va, Kb, Cb, resolution)
  }

  throw new Error(`Unsupported titration combination: ${aType} + ${tType}`)
}

// Pure TypeScript buffer solvers. No React, no utils imports.
// Reference: Chang's Chemistry 14e, Chapter 16.

// ── Internal formatting helper ────────────────────────────────────────────────

function fmt(n: number, sig = 3): string {
  if (!isFinite(n)) return 'undefined'
  const p = parseFloat(n.toPrecision(sig))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) {
    return p.toExponential(sig - 1)
  }
  return String(p)
}

// ── Henderson-Hasselbalch ─────────────────────────────────────────────────────

/**
 * Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA])
 * Reference: Chang 14e, Section 16.2
 */
export function bufferPh(
  pKa: number,
  concAcid: number,
  concBase: number,
): { pH: number; steps: string[] } {
  if (concAcid <= 0 || concBase <= 0) {
    throw new Error('Concentrations must be positive')
  }
  const ratio = concBase / concAcid
  const pH = pKa + Math.log10(ratio)

  const steps: string[] = [
    `Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA])`,
    `pKa = ${fmt(pKa)}`,
    `[HA] = ${fmt(concAcid)} M,  [A⁻] = ${fmt(concBase)} M`,
    `[A⁻]/[HA] = ${fmt(concBase)}/${fmt(concAcid)} = ${fmt(ratio)}`,
    `log(${fmt(ratio)}) = ${Math.log10(ratio).toFixed(4)}`,
    `pH = ${fmt(pKa)} + (${Math.log10(ratio).toFixed(4)}) = ${pH.toFixed(2)}`,
  ]

  return { pH, steps }
}

// ── Buffer capacity ───────────────────────────────────────────────────────────

/**
 * Buffer capacity: moles of strong acid or base that can be added before the
 * pH changes by 1 unit from the current buffer pH.
 *
 * For strong acid addition: pH drops by 1 when all [A⁻] converts to [HA] until ratio = 0.1:1.
 * For strong base addition: pH rises by 1 when ratio = 10:1.
 *
 * Simplified practical capacity = moles that shift pH by 1:
 *   acid capacity  = moles A⁻ × (1 - 10^-1 / (10^-1 + ratio)) ...
 *
 * Simpler approach per Chang: capacity ≈ moles of the weaker component.
 * More precisely, capacity = mol_A- × mol_HA / (mol_A- + mol_HA) * ln(10)
 * But for introductory chem, we report the stoichiometric capacity:
 *   acid capacity  = moles of A⁻ (can neutralize at most this much strong acid before buffer fails)
 *   base capacity  = moles of HA (can neutralize at most this much strong base before buffer fails)
 */
export function bufferCapacity(
  concAcid: number,
  concBase: number,
  volumeL: number,
  pKa: number,
): { acidCapacityMol: number; baseCapacityMol: number; steps: string[] } {
  const molHA  = concAcid * volumeL
  const molA   = concBase * volumeL
  const currentPh = pKa + Math.log10(concBase / concAcid)

  // Moles needed to change pH by 1 unit (in each direction)
  // At pH = pKa + 1: [A⁻]/[HA] = 10  → after adding x mol base: (molA + x)/(molHA - x) = 10
  //   → molA + x = 10(molHA - x) → x = (10·molHA - molA) / 11
  const rawBaseCapacity = (10 * molHA - molA) / 11

  // At pH = pKa - 1: [A⁻]/[HA] = 0.1 → after adding x mol acid: (molA - x)/(molHA + x) = 0.1
  //   → molA - x = 0.1(molHA + x) → x = (molA - 0.1·molHA) / 1.1
  const rawAcidCapacity = (molA - 0.1 * molHA) / 1.1

  // Clamp to available moles (can't go negative)
  const acidCapacityMol = Math.max(0, Math.min(rawAcidCapacity, molA))
  const baseCapacityMol = Math.max(0, Math.min(rawBaseCapacity, molHA))

  const steps: string[] = [
    `Moles of HA = ${fmt(concAcid)} M × ${fmt(volumeL)} L = ${fmt(molHA)} mol`,
    `Moles of A⁻ = ${fmt(concBase)} M × ${fmt(volumeL)} L = ${fmt(molA)} mol`,
    `Current buffer pH = pKa + log([A⁻]/[HA]) = ${currentPh.toFixed(2)}`,
    ``,
    `Acid capacity (strong acid to lower pH by 1 unit):`,
    `  At pH = ${(currentPh - 1).toFixed(2)}: [A⁻]/[HA] = 10^(−1) = 0.1`,
    `  Moles of HCl that can be absorbed = ${fmt(acidCapacityMol)} mol`,
    ``,
    `Base capacity (strong base to raise pH by 1 unit):`,
    `  At pH = ${(currentPh + 1).toFixed(2)}: [A⁻]/[HA] = 10^(+1) = 10`,
    `  Moles of NaOH that can be absorbed = ${fmt(baseCapacityMol)} mol`,
  ]

  return { acidCapacityMol, baseCapacityMol, steps }
}

// ── Buffer after addition of strong acid/base ─────────────────────────────────

/**
 * After adding strong acid or base to a buffer: new pH via Henderson-Hasselbalch.
 * Strong acid converts A⁻ → HA (mole for mole).
 * Strong base converts HA → A⁻ (mole for mole).
 * Reference: Chang 14e, Section 16.2, worked example 16.3.
 */
export function bufferAfterAddition(
  concAcid: number,
  concBase: number,
  volumeL: number,
  pKa: number,
  addition: { type: 'acid' | 'base'; moles: number },
): { newPh: number; newConcAcid: number; newConcBase: number; steps: string[] } {
  const molHA = concAcid * volumeL
  const molA  = concBase * volumeL
  const { type, moles } = addition

  let newMolHA: number
  let newMolA: number

  if (type === 'acid') {
    // Strong acid reacts with conjugate base: H⁺ + A⁻ → HA
    newMolA  = molA  - moles
    newMolHA = molHA + moles
  } else {
    // Strong base reacts with weak acid: OH⁻ + HA → A⁻ + H₂O
    newMolA  = molA  + moles
    newMolHA = molHA - moles
  }

  if (newMolA <= 0 || newMolHA <= 0) {
    throw new Error('Addition exceeds buffer capacity — buffer is destroyed')
  }

  // Volume unchanged for this approximation (moles ratio is used)
  const newConcAcid = newMolHA / volumeL
  const newConcBase = newMolA  / volumeL
  const newPh       = pKa + Math.log10(newMolA / newMolHA)

  const ionLabel = type === 'acid' ? 'H⁺ + A⁻ → HA' : 'OH⁻ + HA → A⁻ + H₂O'

  const steps: string[] = [
    `Initial moles: HA = ${fmt(molHA)} mol,  A⁻ = ${fmt(molA)} mol`,
    `Adding ${fmt(moles)} mol ${type === 'acid' ? 'strong acid (HCl)' : 'strong base (NaOH)'}`,
    `Neutralization: ${ionLabel}`,
    `New moles: HA = ${fmt(newMolHA)} mol,  A⁻ = ${fmt(newMolA)} mol`,
    `Henderson-Hasselbalch: pH = pKa + log(mol A⁻ / mol HA)`,
    `pH = ${fmt(pKa)} + log(${fmt(newMolA)}/${fmt(newMolHA)}) = ${fmt(pKa)} + (${Math.log10(newMolA / newMolHA).toFixed(4)})`,
    `New pH = ${newPh.toFixed(2)}`,
  ]

  return { newPh, newConcAcid, newConcBase, steps }
}

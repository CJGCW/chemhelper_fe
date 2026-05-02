const F = 96485 // C/mol (Faraday's constant)
const R = 8.314  // J/(mol·K)

// ── Standard cell potential ───────────────────────────────────────────────────

export function calcEcell(e_cathode: number, e_anode: number): number {
  return e_cathode - e_anode
}

// ── Nernst equation at 298 K: E = E° − (0.05916/n)·log₁₀Q ──────────────────

export function calcNernstE(e0: number, n: number, Q: number): number {
  return e0 - (0.05916 / n) * Math.log10(Q)
}

// ── Gibbs free energy from cell potential: ΔG° = −nFE° ───────────────────────

export function calcDeltaGFromEcell(n: number, e0: number): number {
  return (-n * F * e0) / 1000  // kJ/mol
}

// ── ΔG°-E°-K Triangle ─────────────────────────────────────────────────────────

/** ΔG° = -nFE°  (returns kJ/mol) */
export function ecellToDeltaG(Ecell: number, n: number): { deltaG: number; steps: string[] } {
  const deltaG = (-n * F * Ecell) / 1000
  const steps = [
    `ΔG° = −nFE°`,
    `ΔG° = −(${n})(96,485 C/mol)(${Ecell.toFixed(4)} V)`,
    `ΔG° = ${(-n * F * Ecell).toFixed(0)} J/mol`,
    `ΔG° = ${deltaG.toFixed(2)} kJ/mol`,
  ]
  return { deltaG, steps }
}

/** K from Nernst at equilibrium: ln K = nFE°/RT → K = exp(nFE°/RT) */
export function ecellToK(Ecell: number, n: number, T: number): { K: number; steps: string[] } {
  const lnK = (n * F * Ecell) / (R * T)
  const K = Math.exp(lnK)
  const steps = [
    `At equilibrium (E = 0): ln K = nFE° / RT`,
    `ln K = (${n})(96,485)(${Ecell.toFixed(4)}) / (8.314)(${T})`,
    `ln K = ${lnK.toFixed(4)}`,
    `K = e^${lnK.toFixed(4)} = ${K.toExponential(3)}`,
  ]
  return { K, steps }
}

/** Given any one of {ΔG° in kJ, E°cell, K}, compute the other two.
 *  n = electrons transferred, T in Kelvin. */
export function solveTriangle(
  known: { type: 'deltaG' | 'Ecell' | 'K'; value: number },
  n: number,
  T: number,
): { deltaG: number; Ecell: number; K: number; steps: string[] } {
  let deltaG: number
  let Ecell: number
  let K: number
  const steps: string[] = []

  if (known.type === 'Ecell') {
    Ecell = known.value
    deltaG = (-n * F * Ecell) / 1000
    const lnK = (n * F * Ecell) / (R * T)
    K = Math.exp(lnK)
    steps.push(
      `Known: E°cell = ${Ecell.toFixed(4)} V, n = ${n}, T = ${T} K`,
      `ΔG° = −nFE° = −(${n})(96,485)(${Ecell.toFixed(4)}) / 1000 = ${deltaG.toFixed(2)} kJ/mol`,
      `ln K = nFE°/RT = (${n})(96,485)(${Ecell.toFixed(4)}) / (8.314 × ${T}) = ${lnK.toFixed(4)}`,
      `K = e^${lnK.toFixed(4)} = ${K.toExponential(3)}`,
    )
  } else if (known.type === 'deltaG') {
    deltaG = known.value   // kJ/mol
    Ecell = -(deltaG * 1000) / (n * F)
    const lnK = -(deltaG * 1000) / (R * T)
    K = Math.exp(lnK)
    steps.push(
      `Known: ΔG° = ${deltaG.toFixed(2)} kJ/mol, n = ${n}, T = ${T} K`,
      `E°cell = −ΔG° / (nF) = −(${deltaG.toFixed(2)} × 1000) / (${n} × 96,485) = ${Ecell.toFixed(4)} V`,
      `ln K = −ΔG° / RT = −(${deltaG.toFixed(2)} × 1000) / (8.314 × ${T}) = ${lnK.toFixed(4)}`,
      `K = e^${lnK.toFixed(4)} = ${K.toExponential(3)}`,
    )
  } else {
    // known.type === 'K'
    K = known.value
    const lnK = Math.log(K)
    deltaG = -R * T * lnK / 1000
    Ecell = -(deltaG * 1000) / (n * F)
    steps.push(
      `Known: K = ${K.toExponential(3)}, n = ${n}, T = ${T} K`,
      `ΔG° = −RT ln K = −(8.314)(${T})(${lnK.toFixed(4)}) / 1000 = ${deltaG.toFixed(2)} kJ/mol`,
      `E°cell = −ΔG° / (nF) = −(${deltaG.toFixed(2)} × 1000) / (${n} × 96,485) = ${Ecell.toFixed(4)} V`,
    )
  }

  return { deltaG, Ecell, K, steps }
}

// ── Faraday's Law (Electrolysis) ──────────────────────────────────────────────

/** m = (I × t × M) / (n × F)
 *  I = current (A), t = time (s), M = molar mass (g/mol), n = electrons per ion */
export interface FaradayInput {
  solveFor: 'mass' | 'current' | 'time'
  I?: number     // A
  t?: number     // s
  M: number      // g/mol
  n: number      // electrons per ion
  mass?: number  // g
}

export function solveFaraday(input: FaradayInput): { answer: number; unit: string; steps: string[] } {
  const { solveFor, M, n } = input
  const steps: string[] = []
  steps.push(`Faraday's Law: m = (I × t × M) / (n × F)`)
  steps.push(`F = 96,485 C/mol,  M = ${M} g/mol,  n = ${n} e⁻/ion`)

  if (solveFor === 'mass') {
    const I = input.I!
    const t = input.t!
    const answer = (I * t * M) / (n * F)
    steps.push(`Charge = I × t = ${I} A × ${t} s = ${(I * t).toFixed(2)} C`)
    steps.push(`Moles of e⁻ = ${(I * t).toFixed(2)} / 96,485 = ${((I * t) / F).toFixed(5)} mol`)
    steps.push(`Moles of metal = ${((I * t) / F).toFixed(5)} / ${n} = ${((I * t) / (n * F)).toFixed(5)} mol`)
    steps.push(`Mass = ${((I * t) / (n * F)).toFixed(5)} × ${M} = ${answer.toFixed(3)} g`)
    return { answer, unit: 'g', steps }
  } else if (solveFor === 'current') {
    const mass = input.mass!
    const t = input.t!
    const answer = (mass * n * F) / (t * M)
    steps.push(`Rearranged: I = (mass × n × F) / (t × M)`)
    steps.push(`I = (${mass} × ${n} × 96,485) / (${t} × ${M})`)
    steps.push(`I = ${answer.toFixed(3)} A`)
    return { answer, unit: 'A', steps }
  } else {
    // solveFor === 'time'
    const mass = input.mass!
    const I = input.I!
    const answer = (mass * n * F) / (I * M)
    steps.push(`Rearranged: t = (mass × n × F) / (I × M)`)
    steps.push(`t = (${mass} × ${n} × 96,485) / (${I} × ${M})`)
    steps.push(`t = ${answer.toFixed(1)} s  (= ${(answer / 60).toFixed(2)} min)`)
    return { answer, unit: 's', steps }
  }
}

// ── Concentration Cells ───────────────────────────────────────────────────────

/** E = (RT/nF) ln([conc_high]/[conc_low])
 *  At 25°C: E = (0.05916/n) × log10([conc_high]/[conc_low]) */
export function concentrationCellEmf(
  concHigh: number,
  concLow: number,
  n: number,
  T: number = 298.15,
): { E: number; steps: string[] } {
  const ratio = concHigh / concLow
  const E = (R * T / (n * F)) * Math.log(ratio)
  const steps: string[] = [
    `Concentration cell EMF: E = (RT/nF) × ln([high]/[low])`,
    `E = (8.314 × ${T}) / (${n} × 96,485) × ln(${concHigh} / ${concLow})`,
    `E = ${(R * T / (n * F)).toFixed(5)} × ln(${ratio.toFixed(4)})`,
    `E = ${(R * T / (n * F)).toFixed(5)} × ${Math.log(ratio).toFixed(4)}`,
    `E = ${E.toFixed(5)} V`,
  ]
  if (Math.abs(T - 298.15) < 0.1) {
    const E25 = (0.05916 / n) * Math.log10(ratio)
    steps.splice(3, 0, `At 25°C shortcut: E = (0.05916/${n}) × log₁₀(${ratio.toFixed(4)}) = ${E25.toFixed(5)} V`)
  }
  return { E, steps }
}

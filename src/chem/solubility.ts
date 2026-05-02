// Pure TypeScript solubility solvers. No React, no utils imports.
// Reference: Chang's Chemistry 14e, Chapter 17.

import { solveICETable } from './equilibrium'

// ── Internal formatting helper ────────────────────────────────────────────────

function fmt(n: number, sig = 3): string {
  if (!isFinite(n)) return 'undefined'
  const p = parseFloat(n.toPrecision(sig))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) {
    return p.toExponential(sig - 1)
  }
  return String(p)
}

// ── Ksp → Molar Solubility ────────────────────────────────────────────────────

/**
 * MₘAₙ(s) ⇌ m M^+ + n A^-
 * Ksp = (ms)^m × (ns)^n  →  solve for s = molar solubility.
 *
 * General formula: Ksp = m^m × n^n × s^(m+n)
 *   s = (Ksp / (m^m × n^n))^(1/(m+n))
 *
 * Reference: Chang 14e, Section 17.4
 */
export function kspToSolubility(
  Ksp: number,
  cationCount: number,
  anionCount: number,
): { solubility: number; steps: string[] } {
  const m = cationCount
  const n = anionCount
  const power = m + n
  const coeff = Math.pow(m, m) * Math.pow(n, n)
  const solubility = Math.pow(Ksp / coeff, 1 / power)

  const steps: string[] = [
    `Dissolution: MₘAₙ(s) ⇌ ${m} M^{${m}+} + ${n} A^{${n}-}`,
    `ICE table: let s = molar solubility`,
    `[M^+] = ${m}s,   [A^-] = ${n}s`,
    `Ksp = (${m}s)^${m} × (${n}s)^${n} = ${m}^${m} × ${n}^${n} × s^${power}`,
    `Ksp = ${fmt(coeff)} × s^${power}`,
    `s^${power} = ${fmt(Ksp)} / ${fmt(coeff)} = ${fmt(Ksp / coeff)}`,
    `s = (${fmt(Ksp / coeff)})^(1/${power}) = ${fmt(solubility)} M`,
  ]

  return { solubility, steps }
}

// ── Molar Solubility → Ksp ────────────────────────────────────────────────────

/**
 * Given molar solubility s, calculate Ksp.
 * Ksp = (m×s)^m × (n×s)^n
 */
export function solubilityToKsp(
  solubility: number,
  cationCount: number,
  anionCount: number,
): { Ksp: number; steps: string[] } {
  const m = cationCount
  const n = anionCount
  const cationConc = m * solubility
  const anionConc  = n * solubility
  const Ksp = Math.pow(cationConc, m) * Math.pow(anionConc, n)

  const steps: string[] = [
    `Molar solubility s = ${fmt(solubility)} M`,
    `[M^+] = ${m} × s = ${m} × ${fmt(solubility)} = ${fmt(cationConc)} M`,
    `[A^-] = ${n} × s = ${n} × ${fmt(solubility)} = ${fmt(anionConc)} M`,
    `Ksp = [M^+]^${m} × [A^-]^${n}`,
    `Ksp = (${fmt(cationConc)})^${m} × (${fmt(anionConc)})^${n}`,
    `Ksp = ${fmt(Math.pow(cationConc, m))} × ${fmt(Math.pow(anionConc, n))}`,
    `Ksp = ${fmt(Ksp)}`,
  ]

  return { Ksp, steps }
}

// ── Solubility with Common Ion ────────────────────────────────────────────────

/**
 * Solubility in a solution containing a common ion.
 * Uses ICE table with nonzero initial concentration for the shared ion.
 *
 * Example: AgCl in 0.10 M NaCl
 *   AgCl(s) ⇌ Ag⁺ + Cl⁻
 *   Initial: [Ag⁺] = 0, [Cl⁻] = 0.10 M
 *   ICE: x = solubility
 *   Ksp = x × (0.10 + x) ≈ 0.10x  →  x ≈ Ksp/0.10
 */
export function solubilityWithCommonIon(
  Ksp: number,
  cationCount: number,
  anionCount: number,
  commonIon: { concentration: number; isCation: boolean },
): { solubility: number; steps: string[] } {
  const m = cationCount
  const n = anionCount
  const C0 = commonIon.concentration

  // Set up ICE table using solveICETable
  // MₘAₙ → m cation + n anion
  const cationFormula = 'M'
  const anionFormula  = 'A'

  const initialCation = commonIon.isCation ? C0 : 0
  const initialAnion  = commonIon.isCation ? 0   : C0

  // Build a simplified approach: for common ion problems at intro level,
  // use the approximation x << C0 when C0 >> Ksp^(1/power)
  // General: Ksp = (m·x + m·C0_cat)^m × (n·x + n·C0_an)^n  -- no, actually:
  // Ksp = (m·x + C0_cat)^m × (n·x + C0_an)^n  when cation starts at C0_cat

  // Use solveICETable from equilibrium module
  const result = solveICETable({
    reactants: [],  // solid — omit
    products: [
      { formula: cationFormula, coefficient: m, state: 'aq' },
      { formula: anionFormula,  coefficient: n, state: 'aq' },
    ],
    initial: {
      [cationFormula]: initialCation,
      [anionFormula]:  initialAnion,
    },
    K: Ksp,
    kType: 'Kc',
  })

  const solubility = result.x  // x is the solubility (moles dissolved per liter)

  const withoutCommonIon = Math.pow(Ksp / (Math.pow(m, m) * Math.pow(n, n)), 1 / (m + n))

  const ionLabel = commonIon.isCation ? 'cation' : 'anion'
  const ionFormula = commonIon.isCation ? `M^+` : `A^-`

  const steps: string[] = [
    `Dissolution equilibrium: MₘAₙ(s) ⇌ ${m} M^+ + ${n} A^-   Ksp = ${fmt(Ksp)}`,
    `Common ion: [${ionFormula}]₀ = ${fmt(C0)} M (${ionLabel} shared with added salt)`,
    `ICE table:`,
    `  [M^+]₀ = ${fmt(initialCation)} M,   change = +${m}x`,
    `  [A^-]₀ = ${fmt(initialAnion)} M,   change = +${n}x`,
    ...result.steps,
    `Molar solubility with common ion = x = ${fmt(solubility)} M`,
    `(vs. ${fmt(withoutCommonIon)} M in pure water — common ion decreases solubility)`,
  ]

  return { solubility, steps }
}

// ── Will Precipitate? (Q vs Ksp) ─────────────────────────────────────────────

/**
 * Compares the ion product Q to Ksp to predict whether a precipitate forms.
 * Q = [cation]^m × [anion]^n
 * If Q > Ksp → precipitate forms; if Q < Ksp → no precipitate.
 *
 * Reference: Chang 14e, Section 17.4
 */
export function willPrecipitate(
  ionConcentrations: { cation: number; anion: number },
  cationCount: number,
  anionCount: number,
  Ksp: number,
): { Q: number; precipitates: boolean; steps: string[] } {
  const m = cationCount
  const n = anionCount
  const Q = Math.pow(ionConcentrations.cation, m) * Math.pow(ionConcentrations.anion, n)
  const precipitates = Q > Ksp

  const steps: string[] = [
    `Ion product Q = [M^+]^${m} × [A^-]^${n}`,
    `Q = (${fmt(ionConcentrations.cation)})^${m} × (${fmt(ionConcentrations.anion)})^${n}`,
    `Q = ${fmt(Math.pow(ionConcentrations.cation, m))} × ${fmt(Math.pow(ionConcentrations.anion, n))}`,
    `Q = ${fmt(Q)}`,
    `Ksp = ${fmt(Ksp)}`,
    precipitates
      ? `Q (${fmt(Q)}) > Ksp (${fmt(Ksp)}) → solution is supersaturated → precipitate FORMS`
      : `Q (${fmt(Q)}) ≤ Ksp (${fmt(Ksp)}) → solution is unsaturated → no precipitate`,
  ]

  return { Q, precipitates, steps }
}

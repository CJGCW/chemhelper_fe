// Pure TypeScript equilibrium solvers. No React, no utils imports.
// Reference: Chang's Chemistry 14e, Chapter 14-15.

import type { EquilibriumSpecies } from '../data/equilibriumReactions'

const R_GAS = 0.08206 // L·atm/(mol·K)

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, sig = 4): string {
  if (!isFinite(n)) return 'undefined'
  const p = parseFloat(n.toPrecision(sig))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) {
    return p.toExponential(sig - 1)
  }
  return String(p)
}

// Filter species that contribute to the expression (omit s and l)
function activeSpecies(species: EquilibriumSpecies[]): EquilibriumSpecies[] {
  return species.filter(s => s.state === 'g' || s.state === 'aq')
}

// ── K Expression ──────────────────────────────────────────────────────────────

export function buildKExpression(
  products: EquilibriumSpecies[],
  reactants: EquilibriumSpecies[],
): { kcExpression: string; kpExpression: string; deltaN: number; steps: string[] } {
  const activeP = activeSpecies(products)
  const activeR = activeSpecies(reactants)

  function termKc(s: EquilibriumSpecies): string {
    const coeff = s.coefficient === 1 ? '' : String(s.coefficient)
    return `[${s.formula}]${coeff ? `\u00b2`.replace('²', coeff === '2' ? '\u00b2' : coeff === '3' ? '\u00b3' : `^${coeff}`) : ''}`
  }

  function termKp(s: EquilibriumSpecies): string {
    const coeff = s.coefficient === 1 ? '' : String(s.coefficient)
    const base = `P(${s.formula})`
    if (!coeff) return base
    const supMap: Record<string, string> = { '2': '\u00b2', '3': '\u00b3' }
    return `${base}${supMap[coeff] ?? `^${coeff}`}`
  }

  function buildExpr(termFn: (s: EquilibriumSpecies) => string, p: EquilibriumSpecies[], r: EquilibriumSpecies[]): string {
    const num = p.length === 0 ? '1' : p.map(termFn).join('\u00b7')
    const den = r.length === 0 ? '1' : r.map(termFn).join('\u00b7')
    return den === '1' ? num : `${num}/${den}`
  }

  const kcExpression = buildExpr(termKc, activeP, activeR)
  const kpExpression = activeP.every(s => s.state === 'aq') && activeR.every(s => s.state === 'aq')
    ? kcExpression  // all aqueous: Kp same as Kc
    : buildExpr(termKp, activeP.filter(s => s.state === 'g'), activeR.filter(s => s.state === 'g'))

  const deltaN =
    activeP.filter(s => s.state === 'g').reduce((acc, s) => acc + s.coefficient, 0) -
    activeR.filter(s => s.state === 'g').reduce((acc, s) => acc + s.coefficient, 0)

  const omitted = [...products, ...reactants].filter(s => s.state === 's' || s.state === 'l')

  const steps: string[] = [
    'Write Kc = (product concentrations)^coeff / (reactant concentrations)^coeff',
    ...(omitted.length > 0
      ? [`Omit pure solids/liquids: ${omitted.map(s => `${s.formula}(${s.state})`).join(', ')}`]
      : []),
    `Kc = ${kcExpression}`,
    ...(deltaN !== 0 ? [`\u0394n(gas) = ${deltaN}`, `Kp = ${kpExpression}`] : [`\u0394n(gas) = 0, so Kp = Kc`]),
  ]

  return { kcExpression, kpExpression, deltaN, steps }
}

// ── Kp \u2194 Kc ──────────────────────────────────────────────────────────────

export function convertKpKc(
  known: { type: 'Kp' | 'Kc'; value: number },
  T: number,
  deltaN: number,
): { answer: number; label: string; steps: string[] } {
  // Kp = Kc(RT)^deltaN
  const RT = R_GAS * T
  const RTdeltaN = Math.pow(RT, deltaN)

  let answer: number
  let label: string

  if (known.type === 'Kc') {
    answer = known.value * RTdeltaN
    label = 'Kp'
  } else {
    answer = known.value / RTdeltaN
    label = 'Kc'
  }

  const steps: string[] = [
    'Kp = Kc \u00d7 (RT)^{\u0394n}    R = 0.08206 L\u00b7atm/(mol\u00b7K)',
    `T = ${T} K,  \u0394n = ${deltaN}`,
    `RT = ${fmt(RT)}`,
    `(RT)^{\u0394n} = (${fmt(RT)})^{${deltaN}} = ${fmt(RTdeltaN)}`,
    known.type === 'Kc'
      ? `Kp = Kc \u00d7 (RT)^{\u0394n} = ${fmt(known.value)} \u00d7 ${fmt(RTdeltaN)} = ${fmt(answer)}`
      : `Kc = Kp / (RT)^{\u0394n} = ${fmt(known.value)} / ${fmt(RTdeltaN)} = ${fmt(answer)}`,
  ]

  return { answer, label, steps }
}

// ── Q vs K ────────────────────────────────────────────────────────────────────

export interface QvsKInput {
  concentrations: Record<string, number>
  products: EquilibriumSpecies[]
  reactants: EquilibriumSpecies[]
  K: number
}

export function solveQvsK(input: QvsKInput): {
  Q: number
  K: number
  direction: 'forward' | 'reverse' | 'at-equilibrium'
  explanation: string
  steps: string[]
} {
  const { concentrations, products, reactants, K } = input
  const activeP = activeSpecies(products)
  const activeR = activeSpecies(reactants)

  let Q = 1
  const numTerms: string[] = []
  const denTerms: string[] = []

  for (const s of activeP) {
    const c = concentrations[s.formula] ?? 0
    Q *= Math.pow(c, s.coefficient)
    numTerms.push(`[${s.formula}]^${s.coefficient} = (${fmt(c)})^${s.coefficient} = ${fmt(Math.pow(c, s.coefficient))}`)
  }
  for (const s of activeR) {
    const c = concentrations[s.formula] ?? 0
    Q /= Math.pow(c, s.coefficient)
    denTerms.push(`[${s.formula}]^${s.coefficient} = (${fmt(c)})^${s.coefficient} = ${fmt(Math.pow(c, s.coefficient))}`)
  }

  const tol = 1e-8
  let direction: 'forward' | 'reverse' | 'at-equilibrium'
  let explanation: string

  if (Math.abs(Q - K) / Math.max(K, tol) < 0.001) {
    direction = 'at-equilibrium'
    explanation = 'Q \u2248 K: the reaction is at equilibrium. No net shift occurs.'
  } else if (Q < K) {
    direction = 'forward'
    explanation = `Q (${fmt(Q)}) < K (${fmt(K)}): the reaction will shift forward (toward products) to reach equilibrium.`
  } else {
    direction = 'reverse'
    explanation = `Q (${fmt(Q)}) > K (${fmt(K)}): the reaction will shift in reverse (toward reactants) to reach equilibrium.`
  }

  const steps: string[] = [
    'Calculate Q using current concentrations (same expression as K)',
    `Numerator: ${numTerms.join(', ')}`,
    `Denominator: ${denTerms.join(', ')}`,
    `Q = ${fmt(Q)}`,
    `K = ${fmt(K)}`,
    explanation,
  ]

  return { Q, K, direction, explanation, steps }
}

// ── ICE Table ─────────────────────────────────────────────────────────────────

export interface ICEInput {
  products: EquilibriumSpecies[]
  reactants: EquilibriumSpecies[]
  initial: Record<string, number>
  K: number
  kType: 'Kc' | 'Kp'
}

export interface ICERow {
  species: string
  coefficient: number
  side: 'reactant' | 'product'
  initial: number
  change: string
  changeCoeff: number  // negative for reactants, positive for products
  equilibrium: string
}

export interface ICESolution {
  x: number
  rows: ICERow[]
  equilibriumConcentrations: Record<string, number>
  approximationValid: boolean
  usedQuadratic: boolean
  steps: string[]
}

export function solveICETable(input: ICEInput): ICESolution {
  const { products, reactants, initial, K } = input

  const activeR = activeSpecies(reactants)
  const activeP = activeSpecies(products)

  // Build rows
  const rows: ICERow[] = [
    ...activeR.map(s => ({
      species: s.formula,
      coefficient: s.coefficient,
      side: 'reactant' as const,
      initial: initial[s.formula] ?? 0,
      change: s.coefficient === 1 ? '-x' : `-${s.coefficient}x`,
      changeCoeff: -s.coefficient,
      equilibrium: '',
    })),
    ...activeP.map(s => ({
      species: s.formula,
      coefficient: s.coefficient,
      side: 'product' as const,
      initial: initial[s.formula] ?? 0,
      change: s.coefficient === 1 ? '+x' : `+${s.coefficient}x`,
      changeCoeff: s.coefficient,
      equilibrium: '',
    })),
  ]

  const steps: string[] = []
  steps.push('Set up ICE table: I = initial, C = change (-coeff\u00b7x for reactants, +coeff\u00b7x for products)')

  // Check for large K case: if K > 1e6, do reverse ICE
  // (assume reaction goes to near-completion then back off)
  const useReverseICE = K > 1e6 && activeR.every(s => (initial[s.formula] ?? 0) > 0) && activeP.every(s => (initial[s.formula] ?? 0) === 0)

  let x: number
  let usedQuadratic = false
  let approximationValid = false

  if (useReverseICE) {
    steps.push(`K = ${fmt(K)} >> 1 \u2192 Use reverse ICE: assume near-complete forward reaction`)
    // Find limiting reactant amount (scaled by stoichiometry)
    // Move as much reactant to products as possible, then solve backwards
    // Simple case: find x_max such that no reactant goes negative
    let xMax = Infinity
    for (const s of activeR) {
      const c0 = initial[s.formula] ?? 0
      xMax = Math.min(xMax, c0 / s.coefficient)
    }

    // Set up reverse: let y = deviation from completion (small)
    // Concentrations after going to completion: reactants \u2248 0, products = initial_products + coeff*xMax
    const afterCompletion: Record<string, number> = {}
    for (const s of activeR) afterCompletion[s.formula] = (initial[s.formula] ?? 0) - s.coefficient * xMax
    for (const s of activeP) afterCompletion[s.formula] = (initial[s.formula] ?? 0) + s.coefficient * xMax

    // Now solve for y going reverse (K_reverse = 1/K_forward << 1)
    // [products decrease by coeff*y, reactants increase by coeff*y]
    // Krev = product of reactants^coeff / product of products^coeff
    const Krev = 1 / K

    // Approximate: each reactant concentration \u2248 coeff*y, each product \u2248 (afterCompletion[formula])
    const reactantPow = activeR.reduce((acc, s) => acc + s.coefficient, 0)
    // Simplified for 1 reactant or symmetric cases: Krev \u2248 prod(coeff_r*y)^coeff_r / prod(C_p)^coeff_p
    // Try approximate: y^reactantPow = Krev * prod(C_p^coeff_p) / prod(coeff_r^coeff_r)
    let prodCp = 1
    for (const s of activeP) prodCp *= Math.pow(afterCompletion[s.formula], s.coefficient)

    let prodCoeffR = 1
    for (const s of activeR) prodCoeffR *= Math.pow(s.coefficient, s.coefficient)

    const yApprox = Math.pow(Krev * prodCp / prodCoeffR, 1 / reactantPow)

    // x (original direction) = xMax - y
    x = xMax - yApprox
    approximationValid = true
    usedQuadratic = false
    steps.push(`y (reverse deviation) \u2248 ${fmt(yApprox, 3)} \u2192 x \u2248 ${fmt(x, 3)}`)
  } else {
    // Normal ICE: reactants are consumed, products form
    // Build K expression: K = prod([P_i + coeff_p*x]^coeff_p) / prod([R_i - coeff_r*x]^coeff_r)

    // Try 5% approximation first
    // Assume x << min(nonzero initial reactant concentrations)
    // So [R] \u2248 initial[R], simplifying the denominator
    const nonzeroReactantInitials = activeR.filter(s => (initial[s.formula] ?? 0) > 0).map(s => initial[s.formula] ?? 0)
    const minInitial = nonzeroReactantInitials.length > 0 ? Math.min(...nonzeroReactantInitials) : 1

    // Solve approximate K equation:
    // K \u2248 prod([P_i + coeff_p*x]^coeff_p) / prod([R_i]^coeff_r)
    const denApprox = activeR.reduce((acc, s) => acc * Math.pow(initial[s.formula] ?? 0, s.coefficient), 1)

    // For product side: assume initial products = 0 (common case), so numerator = prod(coeff_p * x)^coeff_p
    const allProductsZero = activeP.every(s => (initial[s.formula] ?? 0) === 0)

    let xApprox: number

    if (allProductsZero && denApprox > 0) {
      // Numerator = prod((coeff_p * x)^coeff_p) = x^totalProductPow * prod(coeff_p^coeff_p)
      const totalProductPow = activeP.reduce((acc, s) => acc + s.coefficient, 0)
      const prodCoeffP = activeP.reduce((acc, s) => acc * Math.pow(s.coefficient, s.coefficient), 1)

      xApprox = Math.pow(K * denApprox / prodCoeffP, 1 / totalProductPow)
    } else {
      // Mixed initial conditions: use numerical approach
      xApprox = solveNumerically(K, activeR, activeP, initial, 0, minInitial)
    }

    steps.push(`5% approximation: assume x << ${fmt(minInitial)}`)
    steps.push(`x\u2090\u2099\u2097\u2092\u2093 \u2248 ${fmt(xApprox, 3)}`)

    // Check 5% rule
    const pctError = minInitial > 0 ? (xApprox / minInitial) * 100 : 100
    approximationValid = pctError <= 5

    if (approximationValid) {
      x = xApprox
      steps.push(`Check: x / [A]\u2080 = ${fmt(xApprox, 3)} / ${fmt(minInitial)} = ${pctError.toFixed(1)}% \u2264 5% \u2713 Approximation valid`)
    } else {
      steps.push(`Check: ${pctError.toFixed(1)}% > 5% \u2192 Approximation invalid, solving quadratic exactly`)
      usedQuadratic = true
      x = solveNumerically(K, activeR, activeP, initial, 0, minInitial)
      steps.push(`Exact solution: x = ${fmt(x, 4)}`)
    }
  }

  // Build equilibrium concentrations
  const equilibriumConcentrations: Record<string, number> = {}
  for (const row of rows) {
    const eq = row.initial + row.changeCoeff * x
    equilibriumConcentrations[row.species] = Math.max(0, eq)
  }

  // Build equilibrium strings for rows
  for (const row of rows) {
    const c0 = row.initial
    const chCoeff = row.changeCoeff
    if (chCoeff < 0) {
      const abs = Math.abs(chCoeff)
      row.equilibrium = abs === 1
        ? `${fmt(c0)} - x = ${fmt(equilibriumConcentrations[row.species])}`
        : `${fmt(c0)} - ${abs}x = ${fmt(equilibriumConcentrations[row.species])}`
    } else {
      row.equilibrium = chCoeff === 1
        ? `${fmt(c0)} + x = ${fmt(equilibriumConcentrations[row.species])}`
        : `${fmt(c0)} + ${chCoeff}x = ${fmt(equilibriumConcentrations[row.species])}`
    }
  }

  steps.push('Equilibrium concentrations:')
  for (const [sp, conc] of Object.entries(equilibriumConcentrations)) {
    steps.push(`  [${sp}] = ${fmt(conc)} M`)
  }

  // Verify by back-calculating K
  let Kcalc = 1
  for (const s of activeP) Kcalc *= Math.pow(equilibriumConcentrations[s.formula], s.coefficient)
  for (const s of activeR) Kcalc /= Math.pow(equilibriumConcentrations[s.formula], s.coefficient)
  steps.push(`Verification: K\u2099\u2090\u2097\u2091 = ${fmt(Kcalc, 4)} (given K = ${fmt(K)})`)

  return { x, rows, equilibriumConcentrations, approximationValid, usedQuadratic, steps }
}

// ── Numerical solver for ICE ──────────────────────────────────────────────────
// Uses bisection to find x such that K_expr(x) = K.
// xLow = 0, xHigh = max feasible x (limited by reactant depletion).

function solveNumerically(
  K: number,
  reactants: EquilibriumSpecies[],
  products: EquilibriumSpecies[],
  initial: Record<string, number>,
  xLow: number,
  xHigh: number,
): number {
  // Find maximum possible x before any reactant hits 0
  let xMax = xHigh
  for (const s of reactants) {
    const c0 = initial[s.formula] ?? 0
    if (c0 > 0) xMax = Math.min(xMax, c0 / s.coefficient)
  }
  // For products with initial > 0, also check if reverse ICE is needed
  // but we skip that here (handled above)

  function kExpr(x: number): number {
    let numerator = 1
    let denominator = 1
    for (const s of products) {
      const c = (initial[s.formula] ?? 0) + s.coefficient * x
      numerator *= Math.pow(Math.max(c, 1e-30), s.coefficient)
    }
    for (const s of reactants) {
      const c = (initial[s.formula] ?? 0) - s.coefficient * x
      denominator *= Math.pow(Math.max(c, 1e-30), s.coefficient)
    }
    return numerator / denominator
  }

  // Bisection
  let lo = xLow
  let hi = xMax * 0.9999  // slightly less than max to avoid division by zero
  const target = K

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const kMid = kExpr(mid)
    if (Math.abs(kMid - target) / Math.max(target, 1e-30) < 1e-8) return mid
    if (kMid < target) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return (lo + hi) / 2
}

// Chemical Kinetics domain math.
// Pure TypeScript — no React, no utils/, no components/ imports.
// Data imports from ../data/ are allowed per CLAUDE.md chem/ purity rule.

const R_J = 8.314  // J/(mol·K)

// ── Rate Law Solver ───────────────────────────────────────────────────────────

export interface RateLawInput {
  species: string[]
  trials: { concentrations: Record<string, number>; rate: number }[]
}

export interface RateLawSolution {
  orders: Record<string, number>
  rateConstant: number
  rateConstantUnit: string
  rateLawExpression: string
  steps: string[]
}

/**
 * Determines reaction orders by the method of initial rates.
 * For each species, finds two trials where only that species' concentration
 * changes (all others held constant within 1% tolerance), then computes
 * order = ln(r2/r1) / ln(c2/c1), rounded to nearest integer.
 */
export function solveRateLaw(input: RateLawInput): RateLawSolution {
  const { species, trials } = input
  const steps: string[] = []
  const orders: Record<string, number> = {}

  steps.push('Method of Initial Rates: compare trials where only one concentration changes.')

  for (const sp of species) {
    // Find two trials where sp differs and all others are ~constant (within 2%)
    let foundOrder: number | null = null
    outer: for (let i = 0; i < trials.length; i++) {
      for (let j = i + 1; j < trials.length; j++) {
        const ci = trials[i].concentrations[sp]
        const cj = trials[j].concentrations[sp]
        if (ci == null || cj == null || Math.abs(ci - cj) < 1e-12) continue

        // Check all other species are constant (within 2%)
        let othersConstant = true
        for (const other of species) {
          if (other === sp) continue
          const oi = trials[i].concentrations[other] ?? 0
          const oj = trials[j].concentrations[other] ?? 0
          const avg = (oi + oj) / 2
          if (avg > 1e-12 && Math.abs(oi - oj) / avg > 0.02) {
            othersConstant = false
            break
          }
        }
        if (!othersConstant) continue

        const ri = trials[i].rate
        const rj = trials[j].rate
        const rawOrder = Math.log(rj / ri) / Math.log(cj / ci)
        const rounded = Math.round(rawOrder)

        steps.push(
          `[${sp}]: use trials ${i + 1} and ${j + 1}: ` +
          `rate ratio = ${sig(rj)}/${sig(ri)} = ${sig(rj/ri)}, ` +
          `conc ratio = ${sig(cj)}/${sig(ci)} = ${sig(cj/ci)}, ` +
          `order = ln(${sig(rj/ri)})/ln(${sig(cj/ci)}) = ${rawOrder.toFixed(2)} ≈ ${rounded}`
        )
        foundOrder = rounded
        break outer
      }
    }

    if (foundOrder === null) {
      // Fallback: use first two trials even if others aren't constant
      const ci = trials[0]?.concentrations[sp] ?? 1
      const cj = trials[1]?.concentrations[sp] ?? 1
      const ri = trials[0]?.rate ?? 1
      const rj = trials[1]?.rate ?? 1
      const rawOrder = (Math.abs(ci - cj) < 1e-12) ? 0 : Math.log(rj / ri) / Math.log(cj / ci)
      foundOrder = Math.round(rawOrder)
      steps.push(`[${sp}]: estimated order = ${foundOrder} (from first two trials)`)
    }
    orders[sp] = foundOrder
  }

  // Compute k from first trial
  const trial0 = trials[0]
  // k = rate / product([A]^n * [B]^m * ...)
  let denomProduct = 1
  for (const sp of species) {
    const c = trial0.concentrations[sp] ?? 1
    denomProduct *= Math.pow(c, orders[sp])
  }
  const k = trial0.rate / denomProduct

  // Build rate law expression
  const termStr = species
    .filter(sp => orders[sp] !== 0)
    .map(sp => {
      const n = orders[sp]
      return n === 1 ? `[${sp}]` : `[${sp}]^${n}`
    })
    .join('')
  const rateLawExpression = `rate = k${termStr}`

  // Determine unit of k
  const totalOrder = species.reduce((sum, sp) => sum + orders[sp], 0)
  const kUnit = kUnitFromOrder(totalOrder, species.length)

  steps.push(`Rate law: ${rateLawExpression}`)
  steps.push(
    `Calculate k from trial 1: k = ${sig(trial0.rate)} / (${
      species.map(sp => `${sig(trial0.concentrations[sp])}^${orders[sp]}`).join(' × ')
    }) = ${sig(k)} ${kUnit}`
  )

  return { orders, rateConstant: k, rateConstantUnit: kUnit, rateLawExpression, steps }
}

// ── Integrated Rate Law Solver ────────────────────────────────────────────────

export interface IntegratedRateInput {
  order: 0 | 1 | 2
  k: number
  A0: number
  solveFor: 'At' | 't' | 'halfLife'
  t?: number
  At?: number
}

export interface IntegratedRateSolution {
  answer: number
  answerUnit: string
  steps: string[]
}

/**
 * Solves integrated rate law equations for 0th, 1st, and 2nd order reactions.
 * 0th: [A] = [A]₀ − kt,  t½ = [A]₀/(2k)
 * 1st: [A] = [A]₀·e^(−kt),  t½ = ln(2)/k
 * 2nd: 1/[A] = 1/[A]₀ + kt,  t½ = 1/(k[A]₀)
 */
export function solveIntegratedRate(input: IntegratedRateInput): IntegratedRateSolution {
  const { order, k, A0, solveFor, t, At } = input
  const steps: string[] = []

  if (order === 0) {
    steps.push('Zero-order integrated rate law: [A] = [A]₀ − kt')
    if (solveFor === 'halfLife') {
      const t12 = A0 / (2 * k)
      steps.push(`t½ = [A]₀ / (2k) = ${sig(A0)} / (2 × ${sig(k)}) = ${sig(t12)} s`)
      return { answer: t12, answerUnit: 's', steps }
    }
    if (solveFor === 'At') {
      const tVal = t ?? 0
      const atVal = A0 - k * tVal
      steps.push(`[A] = ${sig(A0)} − ${sig(k)} × ${sig(tVal)} = ${sig(atVal)} M`)
      return { answer: atVal, answerUnit: 'M', steps }
    }
    // solveFor === 't'
    const atVal = At ?? 0
    const tVal = (A0 - atVal) / k
    steps.push(`t = ([A]₀ − [A]) / k = (${sig(A0)} − ${sig(atVal)}) / ${sig(k)} = ${sig(tVal)} s`)
    return { answer: tVal, answerUnit: 's', steps }
  }

  if (order === 1) {
    steps.push('First-order integrated rate law: ln[A] = ln[A]₀ − kt')
    if (solveFor === 'halfLife') {
      const t12 = Math.LN2 / k
      steps.push(`t½ = ln(2) / k = 0.6931 / ${sig(k)} = ${sig(t12)} s`)
      return { answer: t12, answerUnit: 's', steps }
    }
    if (solveFor === 'At') {
      const tVal = t ?? 0
      const atVal = A0 * Math.exp(-k * tVal)
      steps.push(`[A] = [A]₀ × e^(−kt) = ${sig(A0)} × e^(−${sig(k)} × ${sig(tVal)}) = ${sig(atVal)} M`)
      return { answer: atVal, answerUnit: 'M', steps }
    }
    // solveFor === 't'
    const atVal = At ?? A0 / 2
    const tVal = Math.log(A0 / atVal) / k
    steps.push(`t = ln([A]₀/[A]) / k = ln(${sig(A0)}/${sig(atVal)}) / ${sig(k)} = ${sig(tVal)} s`)
    return { answer: tVal, answerUnit: 's', steps }
  }

  // order === 2
  steps.push('Second-order integrated rate law: 1/[A] = 1/[A]₀ + kt')
  if (solveFor === 'halfLife') {
    const t12 = 1 / (k * A0)
    steps.push(`t½ = 1 / (k[A]₀) = 1 / (${sig(k)} × ${sig(A0)}) = ${sig(t12)} s`)
    return { answer: t12, answerUnit: 's', steps }
  }
  if (solveFor === 'At') {
    const tVal = t ?? 0
    const inv = 1 / A0 + k * tVal
    const atVal = 1 / inv
    steps.push(`1/[A] = 1/${sig(A0)} + ${sig(k)} × ${sig(tVal)} = ${sig(inv)}`)
    steps.push(`[A] = 1/${sig(inv)} = ${sig(atVal)} M`)
    return { answer: atVal, answerUnit: 'M', steps }
  }
  // solveFor === 't'
  const atVal = At ?? A0 / 2
  const tVal = (1 / atVal - 1 / A0) / k
  steps.push(`t = (1/[A] − 1/[A]₀) / k = (1/${sig(atVal)} − 1/${sig(A0)}) / ${sig(k)} = ${sig(tVal)} s`)
  return { answer: tVal, answerUnit: 's', steps }
}

// ── Arrhenius Solver ──────────────────────────────────────────────────────────

export interface ArrheniusInput {
  mode: 'find-Ea' | 'find-k' | 'find-T'
  T1: number
  k1: number
  T2?: number
  k2?: number
  Ea?: number  // kJ/mol
}

export interface ArrheniusSolution {
  answer: number
  answerLabel: string
  answerUnit: string
  steps: string[]
}

/**
 * Solves Arrhenius two-point problems using:
 * ln(k₂/k₁) = -(Ea/R)(1/T₂ - 1/T₁)
 * where R = 8.314 J/(mol·K) and Ea is given/returned in kJ/mol.
 */
export function solveArrhenius(input: ArrheniusInput): ArrheniusSolution {
  const { mode, T1, k1, T2, k2, Ea } = input
  const steps: string[] = []

  steps.push('Arrhenius two-point form: ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁)')
  steps.push(`R = 8.314 J/(mol·K)`)

  if (mode === 'find-Ea') {
    const T2v = T2 ?? 0
    const k2v = k2 ?? 0
    const lnRatio = Math.log(k2v / k1)
    const invDiff = 1 / T2v - 1 / T1
    const EaJ = -lnRatio / invDiff * R_J  // J/mol
    const EaKJ = EaJ / 1000
    steps.push(`ln(k₂/k₁) = ln(${sig(k2v)}/${sig(k1)}) = ${lnRatio.toFixed(4)}`)
    steps.push(`1/T₂ − 1/T₁ = 1/${sig(T2v)} − 1/${sig(T1)} = ${invDiff.toFixed(6)} K⁻¹`)
    steps.push(`Ea = −R × ln(k₂/k₁) / (1/T₂ − 1/T₁)`)
    steps.push(`Ea = −8.314 × ${lnRatio.toFixed(4)} / ${invDiff.toFixed(6)} = ${sig(EaJ)} J/mol`)
    steps.push(`Ea = ${sig(EaKJ)} kJ/mol`)
    return { answer: EaKJ, answerLabel: 'Ea', answerUnit: 'kJ/mol', steps }
  }

  if (mode === 'find-k') {
    const T2v = T2 ?? 0
    const EaJ = (Ea ?? 0) * 1000  // convert kJ/mol to J/mol
    const lnRatio = -(EaJ / R_J) * (1 / T2v - 1 / T1)
    const k2v = k1 * Math.exp(lnRatio)
    steps.push(`Ea = ${sig(Ea ?? 0)} kJ/mol = ${sig(EaJ)} J/mol`)
    steps.push(`1/T₂ − 1/T₁ = 1/${sig(T2v)} − 1/${sig(T1)} = ${(1/T2v - 1/T1).toFixed(6)} K⁻¹`)
    steps.push(`ln(k₂/k₁) = −(${sig(EaJ)}/8.314) × ${(1/T2v - 1/T1).toFixed(6)} = ${lnRatio.toFixed(4)}`)
    steps.push(`k₂ = k₁ × e^${lnRatio.toFixed(4)} = ${sig(k1)} × ${sig(Math.exp(lnRatio))} = ${sig(k2v)}`)
    return { answer: k2v, answerLabel: 'k₂', answerUnit: 'same as k₁', steps }
  }

  // find-T
  const k2v = k2 ?? 0
  const EaJ = (Ea ?? 0) * 1000
  const lnRatio = Math.log(k2v / k1)
  // 1/T2 = 1/T1 + ln(k2/k1) × (-R/Ea)
  const inv_T2 = 1 / T1 + lnRatio * (-R_J / EaJ)
  const T2v = 1 / inv_T2
  steps.push(`ln(k₂/k₁) = ln(${sig(k2v)}/${sig(k1)}) = ${lnRatio.toFixed(4)}`)
  steps.push(`1/T₂ = 1/T₁ − (R × ln(k₂/k₁) / Ea)`)
  steps.push(`1/T₂ = 1/${sig(T1)} − (8.314 × ${lnRatio.toFixed(4)} / ${sig(EaJ)}) = ${inv_T2.toFixed(6)} K⁻¹`)
  steps.push(`T₂ = 1/${inv_T2.toFixed(6)} = ${sig(T2v)} K`)
  return { answer: T2v, answerLabel: 'T₂', answerUnit: 'K', steps }
}

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the unit of rate constant k for a given overall reaction order.
 * zero: M/s, first: s⁻¹, second: L/(mol·s), third: L²/(mol²·s)
 */
export function kUnitFromOrder(order: number, _nSpecies?: number): string {
  if (order === 0) return 'M/s'
  if (order === 1) return 's⁻¹'
  if (order === 2) return 'L/(mol·s)'
  if (order === 3) return 'L²/(mol²·s)'
  // General: M^(1-n)/s
  const exp = 1 - order
  if (exp === 0) return 's⁻¹'
  return `M^${exp}/s`
}

// ── Internal formatting helper ────────────────────────────────────────────────

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

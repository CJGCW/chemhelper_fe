// ── q = mcΔT ──────────────────────────────────────────────────────────────────

export function calcHeatMcdt(m: number, c: number, dt: number): number {
  return m * c * dt
}

export function calcMassMcdt(q: number, c: number, dt: number): number {
  return q / (c * dt)
}

export function calcSHCMcdt(q: number, m: number, dt: number): number {
  return q / (m * dt)
}

export function calcDeltaTMcdt(q: number, m: number, c: number): number {
  return q / (m * c)
}

// ── q = CΔT ───────────────────────────────────────────────────────────────────

export function calcHeatCdt(C: number, dt: number): number {
  return C * dt
}

export function calcHeatCapCdt(q: number, dt: number): number {
  return q / dt
}

export function calcDeltaTCdt(q: number, C: number): number {
  return q / C
}

// ── Coffee-cup calorimetry: q_rxn = −m·c·(Tf − Ti) ───────────────────────────

export function calcCoffeeCupQrxn(m: number, c: number, ti: number, tf: number): number {
  return -(m * c * (tf - ti))
}

// ── Bomb calorimetry: q_rxn = −C_cal·ΔT ──────────────────────────────────────

export function calcBombQrxn(Ccal: number, dt: number): number {
  return -(Ccal * dt)
}

// ── Heat transfer: final temperature of two-component mixture ─────────────────

export function calcMixtureFinalTemp(
  m1: number, c1: number, T1: number,
  m2: number, c2: number, T2: number,
): number {
  return (m1 * c1 * T1 + m2 * c2 * T2) / (m1 * c1 + m2 * c2)
}

// ── Standard enthalpy of reaction from ΔHf° ──────────────────────────────────

export function calcEnthalpyOfReaction(
  reactants: { coeff: number; dhf: number }[],
  products:  { coeff: number; dhf: number }[],
): number {
  const sumP = products.reduce((s, x)  => s + x.coeff * x.dhf, 0)
  const sumR = reactants.reduce((s, x) => s + x.coeff * x.dhf, 0)
  return parseFloat((sumP - sumR).toFixed(2))
}

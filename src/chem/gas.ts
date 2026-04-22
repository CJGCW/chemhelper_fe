export const R_GAS = 0.082057 // L·atm / (mol·K)

// ── Graham's Law: r₁/r₂ = √(M₂/M₁) ─────────────────────────────────────────

export function calcGrahamsRatio(M1: number, M2: number): number {
  return Math.sqrt(M2 / M1)
}

export function calcGrahamsRate2(r1: number, M1: number, M2: number): number {
  return r1 * Math.sqrt(M1 / M2)
}

export function calcGrahamsM1(r1: number, r2: number, M2: number): number {
  return M2 * (r2 / r1) ** 2
}

export function calcGrahamsM2(r1: number, r2: number, M1: number): number {
  return M1 * (r1 / r2) ** 2
}

export function calcGrahamsTime2(t1: number, M1: number, M2: number): number {
  return t1 * Math.sqrt(M2 / M1)
}

// ── Dalton's Law of Partial Pressures ─────────────────────────────────────────

export function calcDaltonsTotal(partials: number[]): number {
  return partials.reduce((a, b) => a + b, 0)
}

export function calcDaltonsPartial(total: number, others: number[]): number {
  return total - others.reduce((a, b) => a + b, 0)
}

export function calcDaltonsFromMoleFraction(chi: number, total: number): number {
  return chi * total
}

export function calcDaltonsMoleFractionFromMoles(n: number, nTotal: number): number {
  return n / nTotal
}

export function calcDaltonsMoleFraction(partial: number, total: number): number {
  return partial / total
}

// ── Van der Waals: P = nRT/(V−nb) − a(n/V)² ─────────────────────────────────

export function calcVanDerWaals(
  n: number, V: number, T: number, a: number, b: number,
): { idealP: number; realP: number } {
  const idealP = (n * R_GAS * T) / V
  const realP  = (n * R_GAS * T) / (V - n * b) - a * (n / V) ** 2
  return { idealP, realP }
}

// ── Gas Density: ρ = MP/RT  (P in atm, T in K, ρ in g/L) ────────────────────

export function calcGasDensity(M: number, P: number, T: number): number {
  return (M * P) / (R_GAS * T)
}

export function calcGasDensityMolarMass(rho: number, P: number, T: number): number {
  return (rho * R_GAS * T) / P
}

export function calcGasDensityTemp(M: number, P: number, rho: number): number {
  return (M * P) / (rho * R_GAS)
}

export function calcGasDensityPressure(rho: number, T: number, M: number): number {
  return (rho * R_GAS * T) / M
}

const F = 96485 // C/mol (Faraday's constant)

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

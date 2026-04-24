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

// ── Heat of solution: ΔH_soln per mole of solute ─────────────────────────────
// Returns kJ/mol (positive = endothermic, negative = exothermic).

export function heatOfSolution(
  massSolute:     number,   // g
  molarMassSolute: number,  // g/mol
  massWater:      number,   // g (assume dilute; c_soln ≈ c_water = 4.184 J/g·°C)
  deltaT:         number,   // T_final − T_initial (°C or K)
): number {
  const q_water = massWater * 4.184 * deltaT   // J absorbed by water
  const q_rxn   = -q_water                     // J released by reaction
  const n       = massSolute / molarMassSolute  // mol
  return q_rxn / n / 1000                       // kJ/mol
}

// ── Heat of neutralization: ΔH_neut per mole of water formed ─────────────────
// Returns kJ/mol (negative for exothermic neutralization).

export function heatOfNeutralization(
  volumeAcidML:        number,   // mL
  molarityAcid:        number,   // M
  volumeBaseML:        number,   // mL
  molarityBase:        number,   // M  (pass molarityBase × n_OH for polyprotic bases)
  moleRatioAcidToWater: number,  // 1 for HCl, 0.5 for H₂SO₄ (1 mol H₂SO₄ → 2 mol H₂O)
  deltaT:              number,   // T_final − T_initial (°C or K)
): number {
  const massSolution = volumeAcidML + volumeBaseML   // g (1 g/mL)
  const q_soln = massSolution * 4.184 * deltaT       // J
  const q_rxn  = -q_soln
  const n_water = Math.min(
    (volumeAcidML / 1000) * molarityAcid / moleRatioAcidToWater,
    (volumeBaseML / 1000) * molarityBase,
  )
  return q_rxn / n_water / 1000   // kJ/mol
}

// ── ΔH = ΔU + Δn·RT (gas-phase correction) ───────────────────────────────────
// deltaU in kJ, T in K; returns ΔH in kJ.

export function deltaUtoDeltaH(
  deltaU: number,   // kJ
  deltaN: number,   // change in moles of gas (products − reactants)
  T:      number,   // K
): number {
  const R = 0.008314   // kJ/(mol·K)
  return deltaU + deltaN * R * T
}

// ── Expansion work w = −PΔV (constant pressure) ──────────────────────────────
// Inputs: pressure in atm, volumes in L. Returns w in J.
// Negative w → system expands (does work on surroundings).

export function expansionWork(
  pressureAtm: number,   // atm
  vInitialL:   number,   // L
  vFinalL:     number,   // L
): number {
  const P_Pa   = pressureAtm * 101325
  const dV_m3  = (vFinalL - vInitialL) / 1000
  return -P_Pa * dV_m3   // J
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

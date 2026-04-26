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

// ── Partial melting: ice in warm liquid (Chang 6.126 shape) ──────────────────

export interface PartialMeltingInput {
  iceMass:           number    // g
  iceStartTemp:      number    // °C (≤ meltingPoint)
  warmMass:          number    // g
  warmStartTemp:     number    // °C (> meltingPoint)
  warmSpecificHeat?: number    // J/(g·°C), default 4.184 (water/beverage)
  heatOfFusion?:     number    // J/g,      default 334
  meltingPoint?:     number    // °C,       default 0
  iceSpecificHeat?:  number    // J/(g·°C), default 2.09
}

export interface PartialMeltingSolution {
  finalTemp:         number    // °C
  massIceMelted:     number    // g
  massIceRemaining:  number    // g
  allIceMelts:       boolean
  qWarmReleased:     number    // J — heat released by warm substance cooling to mp
  qIceWarmup:        number    // J — heat to bring ice to mp (0 if ice already at mp)
  qAvailableForMelt: number    // J — qWarmReleased − qIceWarmup
  qToMeltAllIce:     number    // J — iceMass × ΔH_fus
  steps:             string[]
}

/** Three-regime solver: no melting / partial melting / all ice melts. */
export function solvePartialMelting(input: PartialMeltingInput): PartialMeltingSolution {
  const c_w   = input.warmSpecificHeat ?? 4.184
  const dhFus = input.heatOfFusion     ?? 334
  const mp    = input.meltingPoint     ?? 0
  const c_ice = input.iceSpecificHeat  ?? 2.09
  const { iceMass, iceStartTemp, warmMass, warmStartTemp } = input

  if (warmStartTemp <= mp)
    throw new Error(`Warm temperature (${warmStartTemp}°C) must exceed melting point (${mp}°C)`)
  if (iceMass <= 0 || warmMass <= 0)
    throw new Error('Masses must be positive')

  const sf = (n: number) => parseFloat(n.toPrecision(4)).toString()
  const steps: string[] = []

  steps.push(`Energy balance: q_warm_lost + q_ice_gained = 0  (heat lost = heat gained)`)

  const qWarmReleased = warmMass * c_w * (warmStartTemp - mp)
  steps.push(`q_warm = ${warmMass} g × ${c_w} J/(g·°C) × (${warmStartTemp} − ${mp})°C = ${sf(qWarmReleased)} J`)

  const qIceWarmup = iceStartTemp < mp
    ? iceMass * c_ice * (mp - iceStartTemp)
    : 0
  if (iceStartTemp < mp)
    steps.push(`q_warmup = ${iceMass} g × ${c_ice} J/(g·°C) × (${mp} − (${iceStartTemp}))°C = ${sf(qIceWarmup)} J`)

  const qAvailableForMelt = qWarmReleased - qIceWarmup
  const qToMeltAllIce     = iceMass * dhFus
  const base = { qWarmReleased, qIceWarmup, qAvailableForMelt, qToMeltAllIce }

  // Regime 1: drink can't even warm ice to mp
  if (qAvailableForMelt <= 0) {
    steps.push(`Regime: q_warm (${sf(qWarmReleased)} J) ≤ q_warmup (${sf(qIceWarmup)} J). No melting occurs.`)
    const T_f = (warmMass * c_w * warmStartTemp + iceMass * c_ice * iceStartTemp)
              / (warmMass * c_w + iceMass * c_ice)
    steps.push(`T_f = (${warmMass}×${c_w}×${warmStartTemp} + ${iceMass}×${c_ice}×${iceStartTemp}) / (${warmMass}×${c_w} + ${iceMass}×${c_ice}) = ${sf(T_f)}°C`)
    return {
      ...base, allIceMelts: false, massIceMelted: 0, massIceRemaining: iceMass,
      finalTemp: parseFloat(T_f.toFixed(2)), steps,
    }
  }

  steps.push(`q_available for melting = ${sf(qWarmReleased)} − ${sf(qIceWarmup)} = ${sf(qAvailableForMelt)} J`)
  steps.push(`q_melt_all = ${iceMass} g × ${dhFus} J/g = ${sf(qToMeltAllIce)} J`)

  // Regime 2: partial melting
  if (qAvailableForMelt < qToMeltAllIce) {
    steps.push(`Regime: ${sf(qAvailableForMelt)} J < ${sf(qToMeltAllIce)} J → partial melting; T_f = ${mp}°C.`)
    const massIceMelted = qAvailableForMelt / dhFus
    steps.push(`m_melted = ${sf(qAvailableForMelt)} J ÷ ${dhFus} J/g = ${sf(massIceMelted)} g`)
    steps.push(`m_remaining = ${iceMass} − ${sf(massIceMelted)} = ${sf(iceMass - massIceMelted)} g`)
    return {
      ...base, allIceMelts: false, finalTemp: mp,
      massIceMelted:    parseFloat(massIceMelted.toFixed(2)),
      massIceRemaining: parseFloat((iceMass - massIceMelted).toFixed(2)),
      steps,
    }
  }

  // Regime 3: all ice melts, system rises above mp
  steps.push(`Regime: ${sf(qAvailableForMelt)} J ≥ ${sf(qToMeltAllIce)} J → all ice melts.`)
  const qExcess = qAvailableForMelt - qToMeltAllIce
  const mTotal  = warmMass + iceMass
  const T_f     = mp + qExcess / (mTotal * c_w)
  steps.push(`q_excess = ${sf(qAvailableForMelt)} − ${sf(qToMeltAllIce)} = ${sf(qExcess)} J`)
  steps.push(`T_f = ${mp} + ${sf(qExcess)} / (${mTotal} g × ${c_w} J/(g·°C)) = ${sf(T_f)}°C`)
  return {
    ...base, allIceMelts: true, massIceMelted: iceMass, massIceRemaining: 0,
    finalTemp: parseFloat(T_f.toFixed(2)), steps,
  }
}

// ── Evaporative cooling (Chang 6.141 shape) ───────────────────────────────────

export interface EvaporativeCoolingInput {
  heatInputJ:          number   // J total to be dissipated
  bodyMass:            number   // g  (for context only, not used in math)
  bodyTemp:            number   // °C (for context only)
  heatOfVaporization?: number   // J/g, default 2260 (water at 100°C per Chang Table 6.1)
}

export interface EvaporativeCoolingSolution {
  massEvaporated: number   // g
  steps:          string[]
}

export function solveEvaporativeCooling(input: EvaporativeCoolingInput): EvaporativeCoolingSolution {
  const dhVap = input.heatOfVaporization ?? 2260
  const sf    = (n: number) => parseFloat(n.toPrecision(4)).toString()
  const massEvaporated = input.heatInputJ / dhVap
  return {
    massEvaporated: parseFloat(massEvaporated.toFixed(2)),
    steps: [
      `Total heat to dissipate: q = ${sf(input.heatInputJ)} J`,
      `Each gram of water evaporated absorbs ΔH_vap = ${dhVap} J/g`,
      `m_evap = q / ΔH_vap = ${sf(input.heatInputJ)} J ÷ ${dhVap} J/g = ${sf(massEvaporated)} g`,
    ],
  }
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

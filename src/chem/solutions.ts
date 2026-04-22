// ── Concentration conversions ─────────────────────────────────────────────────

/** C (mol/L) from mass percent, density (g/mL), and molar mass (g/mol) */
export function calcMolarityFromPercent(w_pct: number, density: number, molarMass: number): number {
  return (w_pct / 100 * density * 1000) / molarMass
}

/** w% from molarity (mol/L), density (g/mL), and molar mass (g/mol) */
export function calcPercentFromMolarity(C: number, density: number, molarMass: number): number {
  return (C * molarMass) / (density * 10)
}

/** C (mol/L) from ppm (mg/L) and molar mass (g/mol) — assumes 1 ppm = 1 mg/L */
export function calcMolarityFromPpm(ppm: number, molarMass: number): number {
  return ppm / (molarMass * 1000)
}

/** Mole fraction of solute from masses and molar masses */
export function calcMoleFraction(
  m_sol: number, M_sol: number,
  m_solvent: number, M_solvent: number,
): number {
  const n_sol     = m_sol / M_sol
  const n_solvent = m_solvent / M_solvent
  return n_sol / (n_sol + n_solvent)
}

// ── Dilution: C₁V₁ = C₂V₂ ───────────────────────────────────────────────────

export function calcDilutionC2(c1: number, v1: number, v2: number): number {
  return (c1 * v1) / v2
}

export function calcDilutionV2(c1: number, v1: number, c2: number): number {
  return (c1 * v1) / c2
}

export function calcDilutionV1(c2: number, v2: number, c1: number): number {
  return (c2 * v2) / c1
}

// ── Solution stoichiometry ────────────────────────────────────────────────────

export interface AcidSolidRxn {
  name:           string
  equation:       string
  solidDisplay:   string
  solidName:      string
  solidCoeff:     number
  solidMolarMass: number
  acidDisplay:    string
  acidName:       string
  acidCoeff:      number
}

export interface AcidBaseRxn {
  name:        string
  equation:    string
  acidDisplay: string
  acidName:    string
  acidCoeff:   number
  baseDisplay: string
  baseName:    string
  baseCoeff:   number
}

function sig(x: number, n = 4): string {
  return parseFloat(x.toPrecision(n)).toString()
}

export function calcVolToMass(
  rxn: AcidSolidRxn, volML: number, conc: number,
): { steps: string[]; answer: number } {
  const nAcid  = conc * (volML / 1000)
  const nSolid = nAcid * (rxn.solidCoeff / rxn.acidCoeff)
  const mass   = nSolid * rxn.solidMolarMass
  const steps  = [
    `Balanced equation: ${rxn.equation}`,
    `n(${rxn.acidDisplay}) = ${sig(conc, 3)} mol/L × ${sig(volML / 1000, 3)} L = ${sig(nAcid, 4)} mol`,
    `Mole ratio: n(${rxn.solidDisplay}) = ${sig(nAcid, 4)} × (${rxn.solidCoeff}/${rxn.acidCoeff}) = ${sig(nSolid, 4)} mol`,
    `m(${rxn.solidDisplay}) = ${sig(nSolid, 4)} mol × ${rxn.solidMolarMass} g/mol = ${sig(mass, 4)} g`,
  ]
  return { steps, answer: mass }
}

export function calcMassToVol(
  rxn: AcidSolidRxn, mass: number, conc: number,
): { steps: string[]; answer: number } {
  const nSolid = mass / rxn.solidMolarMass
  const nAcid  = nSolid * (rxn.acidCoeff / rxn.solidCoeff)
  const volL   = nAcid / conc
  const volML  = volL * 1000
  const steps  = [
    `Balanced equation: ${rxn.equation}`,
    `n(${rxn.solidDisplay}) = ${sig(mass, 4)} g ÷ ${rxn.solidMolarMass} g/mol = ${sig(nSolid, 4)} mol`,
    `Mole ratio: n(${rxn.acidDisplay}) = ${sig(nSolid, 4)} × (${rxn.acidCoeff}/${rxn.solidCoeff}) = ${sig(nAcid, 4)} mol`,
    `V(${rxn.acidDisplay}) = ${sig(nAcid, 4)} mol ÷ ${sig(conc, 3)} mol/L = ${sig(volL, 4)} L = ${sig(volML, 4)} mL`,
  ]
  return { steps, answer: volML }
}

export function calcVolToVol(
  rxn: AcidBaseRxn, volAML: number, concA: number, concB: number,
): { steps: string[]; answer: number } {
  const nAcid  = concA * (volAML / 1000)
  const nBase  = nAcid * (rxn.baseCoeff / rxn.acidCoeff)
  const volBL  = nBase / concB
  const volBML = volBL * 1000
  const steps  = [
    `Balanced equation: ${rxn.equation}`,
    `n(${rxn.acidDisplay}) = ${sig(concA, 3)} mol/L × ${sig(volAML / 1000, 3)} L = ${sig(nAcid, 4)} mol`,
    `Mole ratio: n(${rxn.baseDisplay}) = ${sig(nAcid, 4)} × (${rxn.baseCoeff}/${rxn.acidCoeff}) = ${sig(nBase, 4)} mol`,
    `V(${rxn.baseDisplay}) = ${sig(nBase, 4)} mol ÷ ${sig(concB, 3)} mol/L = ${sig(volBL, 4)} L = ${sig(volBML, 4)} mL`,
  ]
  return { steps, answer: volBML }
}

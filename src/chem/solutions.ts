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

// ── Titration arithmetic ──────────────────────────────────────────────────────

export interface TitrationSolution {
  answer:     number
  answerUnit: 'mL' | 'M'
  steps:      string[]
}

/**
 * Solve acid-base titration for unknown volume or molarity.
 * acidPerBase = moles acid / moles base from balanced equation
 *             = base.equivalents / acid.equivalents
 * (e.g. HCl+NaOH → 1, H₂SO₄+2NaOH → 0.5, 2HCl+Ba(OH)₂ → 2)
 */
export function solveAcidBaseTitration(
  acidPerBase:  number,
  equation:     string,
  acidLabel:    string,
  baseLabel:    string,
  given:        { side: 'acid' | 'base'; volumeML: number; molarity: number },
  solvingFor:   { side: 'acid' | 'base'; unknown: 'volume' | 'molarity'; known: number },
): TitrationSolution {
  const steps: string[] = []
  steps.push(`Balanced: ${equation}`)

  const nGiven     = given.molarity * (given.volumeML / 1000)
  const givenLabel = given.side === 'acid' ? acidLabel : baseLabel
  steps.push(`n(${givenLabel}) = ${sig(given.molarity, 3)} M × ${sig(given.volumeML / 1000, 4)} L = ${sig(nGiven, 4)} mol`)

  const solvingLabel = solvingFor.side === 'acid' ? acidLabel : baseLabel
  let nSolving: number
  if (given.side === 'acid' && solvingFor.side === 'base') {
    nSolving = nGiven / acidPerBase
    steps.push(`Mole ratio: n(${solvingLabel}) = ${sig(nGiven, 4)} mol ÷ ${sig(acidPerBase, 4)} = ${sig(nSolving, 4)} mol`)
  } else if (given.side === 'base' && solvingFor.side === 'acid') {
    nSolving = nGiven * acidPerBase
    steps.push(`Mole ratio: n(${solvingLabel}) = ${sig(nGiven, 4)} mol × ${sig(acidPerBase, 4)} = ${sig(nSolving, 4)} mol`)
  } else {
    nSolving = nGiven
  }

  let answer: number
  const answerUnit: 'mL' | 'M' = solvingFor.unknown === 'volume' ? 'mL' : 'M'
  if (solvingFor.unknown === 'volume') {
    const vL = nSolving / solvingFor.known
    answer = vL * 1000
    steps.push(`V(${solvingLabel}) = ${sig(nSolving, 4)} mol ÷ ${sig(solvingFor.known, 3)} M = ${sig(vL, 4)} L = ${sig(answer, 4)} mL`)
  } else {
    const vL = solvingFor.known / 1000
    answer = nSolving / vL
    steps.push(`[${solvingLabel}] = ${sig(nSolving, 4)} mol ÷ ${sig(vL, 4)} L = ${sig(answer, 4)} M`)
  }

  return { answer, answerUnit, steps }
}

/**
 * Solve redox titration using electron balance.
 * n_ox × oxidizerElectrons = n_red × reducerElectrons
 */
export function solveRedoxTitration(
  oxidizerElectrons: number,
  reducerElectrons:  number,
  equation:          string,
  oxidizerLabel:     string,
  reducerLabel:      string,
  given:      { side: 'oxidizer' | 'reducer'; volumeML: number; molarity: number },
  solvingFor: { side: 'oxidizer' | 'reducer'; unknown: 'volume' | 'molarity'; known: number },
): TitrationSolution {
  const steps: string[] = []
  steps.push(`Balanced: ${equation}`)

  const nGiven     = given.molarity * (given.volumeML / 1000)
  const givenLabel = given.side === 'oxidizer' ? oxidizerLabel : reducerLabel
  steps.push(`n(${givenLabel}) = ${sig(given.molarity, 3)} M × ${sig(given.volumeML / 1000, 4)} L = ${sig(nGiven, 4)} mol`)

  const eGiven      = given.side    === 'oxidizer' ? oxidizerElectrons : reducerElectrons
  const eSolving    = solvingFor.side === 'oxidizer' ? oxidizerElectrons : reducerElectrons
  const solvingLabel = solvingFor.side === 'oxidizer' ? oxidizerLabel : reducerLabel
  steps.push(`Electron balance: ${eGiven} e⁻/mol ${givenLabel}, ${eSolving} e⁻/mol ${solvingLabel}`)

  const nSolving = nGiven * (eGiven / eSolving)
  steps.push(`n(${solvingLabel}) = ${sig(nGiven, 4)} mol × (${eGiven}/${eSolving}) = ${sig(nSolving, 4)} mol`)

  let answer: number
  const answerUnit: 'mL' | 'M' = solvingFor.unknown === 'volume' ? 'mL' : 'M'
  if (solvingFor.unknown === 'volume') {
    const vL = nSolving / solvingFor.known
    answer = vL * 1000
    steps.push(`V(${solvingLabel}) = ${sig(nSolving, 4)} mol ÷ ${sig(solvingFor.known, 3)} M = ${sig(vL, 4)} L = ${sig(answer, 4)} mL`)
  } else {
    const vL = solvingFor.known / 1000
    answer = nSolving / vL
    steps.push(`[${solvingLabel}] = ${sig(nSolving, 4)} mol ÷ ${sig(vL, 4)} L = ${sig(answer, 4)} M`)
  }

  return { answer, answerUnit, steps }
}

// Hydrate stoichiometry solver
// Determines the hydration number x in salt · xH₂O

export interface HydrateFromMassLoss {
  mode: 'mass-loss'
  anhydrousFormula: string
  anhydrousMolarMass: number   // g/mol
  massBefore: number           // g (hydrate)
  massAfter:  number           // g (anhydrous)
}

export interface HydrateFromPercent {
  mode: 'percent-composition'
  anhydrousFormula: string
  anhydrousMolarMass: number   // g/mol
  element: string              // e.g. "Al"
  elementCount: number         // atoms per anhydrous formula unit
  elementMolarMass: number     // g/mol of element
  percentByMass: number        // e.g. 8.10
}

export type HydrateInput = HydrateFromMassLoss | HydrateFromPercent

export interface HydrateSolution {
  x:               number   // hydration number — rounded to nearest integer
  xRaw:            number   // pre-rounding value (shown for transparency)
  hydrateMolarMass: number  // g/mol of full hydrate
  steps:           string[]
}

const M_WATER = 18.015  // g/mol H₂O

function sig(n: number, sf = 4): string {
  if (n === 0) return '0'
  return parseFloat(n.toPrecision(sf)).toString()
}

export function solveHydrate(input: HydrateInput): HydrateSolution {
  let xRaw: number
  let steps: string[]

  if (input.mode === 'mass-loss') {
    const { anhydrousFormula, anhydrousMolarMass, massBefore, massAfter } = input
    if (massBefore <= massAfter) throw new Error('Mass after heating must be less than mass before.')

    const massWater  = massBefore - massAfter
    const molAnhy    = massAfter  / anhydrousMolarMass
    const molWater   = massWater  / M_WATER
    xRaw = molWater / molAnhy

    steps = [
      `Mass of water lost = ${sig(massBefore)} − ${sig(massAfter)} = ${sig(massWater)} g`,
      `mol(anhydrous) = ${sig(massAfter)} g ÷ ${sig(anhydrousMolarMass)} g/mol = ${sig(molAnhy)} mol`,
      `mol(H₂O) = ${sig(massWater)} g ÷ ${M_WATER} g/mol = ${sig(molWater)} mol`,
      `x = mol(H₂O) / mol(${anhydrousFormula}) = ${sig(molWater)} ÷ ${sig(molAnhy)} = ${sig(xRaw)}`,
      `x ≈ ${Math.round(xRaw)}  (nearest integer)`,
    ]
  } else {
    const { anhydrousFormula, anhydrousMolarMass, element, elementCount, elementMolarMass, percentByMass } = input
    const elementMassInFormula = elementCount * elementMolarMass
    const hydrateM = (elementMassInFormula * 100) / percentByMass
    const waterContrib = hydrateM - anhydrousMolarMass
    xRaw = waterContrib / M_WATER

    steps = [
      `Let M = molar mass of ${anhydrousFormula}·xH₂O`,
      `Mass of ${element} per formula unit = ${elementCount} × ${sig(elementMolarMass)} = ${sig(elementMassInFormula)} g/mol`,
      `Percent relation: ${sig(percentByMass)}% = (${sig(elementMassInFormula)} / M) × 100`,
      `M = (${sig(elementMassInFormula)} × 100) / ${sig(percentByMass)} = ${sig(hydrateM)} g/mol`,
      `Water contribution = ${sig(hydrateM)} − ${sig(anhydrousMolarMass)} = ${sig(waterContrib)} g/mol`,
      `x = ${sig(waterContrib)} ÷ ${M_WATER} g/mol = ${sig(xRaw)}`,
      `x ≈ ${Math.round(xRaw)}  (nearest integer)`,
    ]
  }

  const x = Math.round(xRaw)
  if (x < 1) throw new Error('Calculated x < 1 — check your inputs.')

  const deviation = x > 0 ? Math.abs(xRaw - x) / x : Math.abs(xRaw)
  if (deviation > 0.10) {
    throw new Error(
      `x = ${sig(xRaw)} doesn't round cleanly to a whole number. ` +
      'Hydrate numbers that don\'t fit a whole-number ratio — check your inputs.'
    )
  }

  const hydrateMolarMass = input.anhydrousMolarMass + x * M_WATER

  return { x, xRaw, hydrateMolarMass, steps }
}

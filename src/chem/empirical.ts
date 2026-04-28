// ── Constants (Chang 14e values) ─────────────────────────────────────────────

const MC   = 12.01
const MH   = 1.008
const MO   = 16.00
const MCO2 = 44.01   // = 12.01 + 2 × 16.00
const MH2O = 18.02   // = 2 × 1.008 + 16.00  (Chang rounds to 4 sig figs)

// ── Private helpers ───────────────────────────────────────────────────────────

const SUB: Record<string, string> = {
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
}

function toSub(n: number): string {
  return n === 1 ? '' : String(n).split('').map(c => SUB[c] ?? c).join('')
}

function hillKey(el: string): string {
  return el === 'C' ? '\x00' : el === 'H' ? '\x01' : el
}

function formatFormula(elements: { symbol: string; count: number }[]): string {
  return [...elements]
    .filter(e => e.count > 0)
    .sort((a, b) => (hillKey(a.symbol) < hillKey(b.symbol) ? -1 : 1))
    .map(e => `${e.symbol}${toSub(e.count)}`)
    .join('')
}

function isNearInt(x: number, tol = 0.085): boolean {
  return Math.abs(x - Math.round(x)) < tol
}

function findMultiplier(ratios: number[]): number {
  for (let m = 1; m <= 8; m++) {
    if (ratios.every(r => isNearInt(r * m))) return m
  }
  return 1
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CombustionInput {
  massSample: number     // g — total mass of organic compound burned
  massCO2: number        // g — mass of CO₂ produced
  massH2O: number        // g — mass of H₂O produced
  molarMass?: number     // g/mol — optional, for molecular formula
}

export interface CombustionSolution {
  massC: number          // g of carbon in sample
  massH: number          // g of hydrogen in sample
  massO: number          // g of oxygen in sample (by difference; 0 for hydrocarbons)
  molesC: number
  molesH: number
  molesO: number
  empiricalFormula: string   // Unicode subscripts, e.g. "C₂H₆O"
  molecularFormula?: string  // if molarMass was provided
  steps: string[]
}

// ── Solver ────────────────────────────────────────────────────────────────────

export function combustionAnalysis(input: CombustionInput): CombustionSolution {
  const { massSample, massCO2, massH2O, molarMass } = input

  // Step 1: back-calculate masses from combustion products
  const massC = massCO2 * (MC / MCO2)
  const massH = massH2O * (2 * MH / MH2O)

  // Step 2: oxygen by difference (may be zero for hydrocarbons)
  const massORaw = massSample - massC - massH
  if (massORaw < -(massSample * 0.005)) {
    throw new Error(
      'The masses of C and H exceed the sample mass — check your CO₂ and H₂O values.'
    )
  }
  const massO = Math.max(0, massORaw)

  // Step 3: moles
  const molesC = massC / MC
  const molesH = massH / MH
  const molesO = massO > 0 ? massO / MO : 0

  // Step 4: mole ratios → integer subscripts
  const molesList = molesO > 0 ? [molesC, molesH, molesO] : [molesC, molesH]
  const minMoles  = Math.min(...molesList)

  const ratioC = molesC / minMoles
  const ratioH = molesH / minMoles
  const ratioO = molesO > 0 ? molesO / minMoles : 0

  const ratioList  = molesO > 0 ? [ratioC, ratioH, ratioO] : [ratioC, ratioH]
  const multiplier = findMultiplier(ratioList)

  const subC = Math.round(ratioC * multiplier)
  const subH = Math.round(ratioH * multiplier)
  const subO = molesO > 0 ? Math.round(ratioO * multiplier) : 0

  const empiricalFormula = formatFormula([
    { symbol: 'C', count: subC },
    { symbol: 'H', count: subH },
    ...(subO > 0 ? [{ symbol: 'O', count: subO }] : []),
  ])

  // Build step-by-step strings
  const f2 = (n: number) => n.toFixed(2)
  const f3 = (n: number) => n.toFixed(3)
  const f4 = (n: number) => n.toFixed(4)

  const steps: string[] = [
    `mass C = ${f2(massCO2)} g CO₂ × (12.01 g C / 44.01 g CO₂) = ${f3(massC)} g C`,
    `mass H = ${f2(massH2O)} g H₂O × (2 × 1.008 g H / 18.02 g H₂O) = ${f3(massH)} g H`,
    `mass O = ${f2(massSample)} − ${f3(massC)} − ${f3(massH)} = ${f3(massO)} g O  (by difference)`,
    `mol C = ${f3(massC)} ÷ 12.01 = ${f4(molesC)} mol`,
    `mol H = ${f3(massH)} ÷ 1.008 = ${f4(molesH)} mol`,
    molesO > 0
      ? `mol O = ${f3(massO)} ÷ 16.00 = ${f4(molesO)} mol`
      : `(no oxygen — pure hydrocarbon)`,
    `divide by smallest (${f4(minMoles)} mol): C = ${f3(ratioC)},  H = ${f3(ratioH)}${molesO > 0 ? `,  O = ${f3(ratioO)}` : ''}`,
    ...(multiplier > 1
      ? [`multiply by ${multiplier}: C = ${subC},  H = ${subH}${subO > 0 ? `,  O = ${subO}` : ''}`]
      : []),
    `empirical formula = ${empiricalFormula}`,
  ]

  // Molecular formula (optional)
  let molecularFormula: string | undefined
  if (molarMass && isFinite(molarMass) && molarMass > 0) {
    const empMass = subC * MC + subH * MH + subO * MO
    const rawN = molarMass / empMass
    const n = Math.round(rawN)
    if (n >= 1 && Math.abs(rawN - n) / Math.max(n, 1) < 0.05) {
      molecularFormula = formatFormula([
        { symbol: 'C', count: subC * n },
        { symbol: 'H', count: subH * n },
        ...(subO > 0 ? [{ symbol: 'O', count: subO * n }] : []),
      ])
      steps.push(
        `empirical M = ${f2(empMass)} g/mol,  n = ${f2(molarMass)} ÷ ${f2(empMass)} ≈ ${n}`,
        `molecular formula = ${molecularFormula}`,
      )
    }
  }

  return { massC, massH, massO, molesC, molesH, molesO, empiricalFormula, molecularFormula, steps }
}

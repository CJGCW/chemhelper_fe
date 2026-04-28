import { combustionAnalysis, type CombustionSolution } from '../chem/empirical'
import { parseFormula } from './empiricalFormula'

// ── Compound list ─────────────────────────────────────────────────────────────

interface CompoundSpec {
  name: string
  formula: string   // e.g. "C2H6O"
  M: number         // g/mol — molecular mass
}

const COMPOUNDS: CompoundSpec[] = [
  { name: 'ethanol',       formula: 'C2H6O',    M: 46.07  },  // Chang Ex 3.9
  { name: 'methane',       formula: 'CH4',       M: 16.04  },
  { name: 'ethane',        formula: 'C2H6',      M: 30.07  },
  { name: 'propane',       formula: 'C3H8',      M: 44.10  },
  { name: 'benzene',       formula: 'C6H6',      M: 78.11  },
  { name: 'glucose',       formula: 'C6H12O6',   M: 180.16 },
  { name: 'acetic acid',   formula: 'C2H4O2',    M: 60.05  },
  { name: 'acetone',       formula: 'C3H6O',     M: 58.08  },
  { name: 'isopropanol',   formula: 'C3H8O',     M: 60.10  },
  { name: 'formaldehyde',  formula: 'CH2O',      M: 30.03  },
  { name: 'octane',        formula: 'C8H18',     M: 114.23 },
  { name: 'sucrose',       formula: 'C12H22O11', M: 342.30 },
]

const MCO2 = 44.01
const MH2O = 18.02

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CombustionProblem {
  name: string
  massSample: number
  massCO2: number
  massH2O: number
  molarMass?: number
  answerEmpirical: string    // Unicode subscripts
  answerMolecular?: string
  steps: string[]
  scenario: string
}

// ── Generator ─────────────────────────────────────────────────────────────────

function round3(n: number): number {
  return parseFloat(n.toPrecision(3))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function toEmpiricalASCII(formula: string): string | null {
  const counts = parseFormula(formula)
  if (!counts) return null
  const min = Math.min(...Object.values(counts))
  const normalized: Record<string, number> = {}
  for (const [el, n] of Object.entries(counts)) normalized[el] = Math.round(n / min)
  // Hill order
  const hillKey = (s: string) => s === 'C' ? '\x00' : s === 'H' ? '\x01' : s
  return Object.entries(normalized)
    .sort((a, b) => (hillKey(a[0]) < hillKey(b[0]) ? -1 : 1))
    .map(([el, n]) => (n === 1 ? el : `${el}${n}`))
    .join('')
}

export function generateCombustionProblem(): CombustionProblem {
  // Try up to 20 times to get a problem that round-trips correctly
  for (let attempt = 0; attempt < 20; attempt++) {
    const compound = pickRandom(COMPOUNDS)
    const counts = parseFormula(compound.formula)
    if (!counts) continue

    const nC = counts['C'] ?? 0
    const nH = counts['H'] ?? 0
    if (nC === 0 || nH === 0) continue

    // Pick sample mass (nice round values between 5 and 25 g)
    const SAMPLE_MASSES = [5.00, 7.50, 8.00, 10.0, 12.0, 12.5, 15.0, 20.0, 22.5, 25.0]
    const massSample = pickRandom(SAMPLE_MASSES)

    // Compute exact CO₂ and H₂O masses from stoichiometry
    const molesSample = massSample / compound.M
    const massCO2Exact = molesSample * nC * MCO2
    const massH2OExact = molesSample * (nH / 2) * MH2O

    // Round to 3 sig figs
    const massCO2 = round3(massCO2Exact)
    const massH2O = round3(massH2OExact)

    // Determine if we give molar mass (50% of problems)
    const giveMolarMass = Math.random() < 0.5

    // Verify round-tripped answer
    try {
      const sol: CombustionSolution = combustionAnalysis({
        massSample,
        massCO2,
        massH2O,
        molarMass: giveMolarMass ? compound.M : undefined,
      })

      // Compute expected empirical formula
      const empASCII = toEmpiricalASCII(compound.formula)
      if (!empASCII) continue

      // Check that the solver gives the correct empirical formula
      const empCounts = parseFormula(empASCII)
      const solCounts = parseFormula(
        sol.empiricalFormula.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)])
      )
      if (!empCounts || !solCounts) continue

      // Check element by element
      const empElements = Object.keys(empCounts).sort()
      const solElements = Object.keys(solCounts).sort()
      if (JSON.stringify(empElements) !== JSON.stringify(solElements)) continue
      if (!empElements.every(el => empCounts[el] === solCounts[el])) continue

      // Compute molecular formula if applicable
      let answerMolecular: string | undefined
      if (giveMolarMass && sol.molecularFormula) {
        answerMolecular = sol.molecularFormula
      }

      // Build scenario text
      const molarMassStr = giveMolarMass ? ` (molar mass = ${compound.M} g/mol)` : ''
      const scenario =
        `The combustion of ${massSample} g of ${compound.name}${molarMassStr} produced ` +
        `${massCO2} g of CO₂ and ${massH2O} g of H₂O. ` +
        `Determine the ${giveMolarMass ? 'molecular' : 'empirical'} formula.`

      return {
        name: compound.name,
        massSample,
        massCO2,
        massH2O,
        molarMass: giveMolarMass ? compound.M : undefined,
        answerEmpirical: sol.empiricalFormula,
        answerMolecular,
        steps: sol.steps,
        scenario,
      }
    } catch {
      continue
    }
  }

  // Fallback: Chang Example 3.9 (always works)
  const sol = combustionAnalysis({ massSample: 11.5, massCO2: 22.0, massH2O: 13.5, molarMass: 46.07 })
  return {
    name: 'ethanol',
    massSample: 11.5,
    massCO2: 22.0,
    massH2O: 13.5,
    molarMass: 46.07,
    answerEmpirical: sol.empiricalFormula,
    answerMolecular: sol.molecularFormula,
    steps: sol.steps,
    scenario:
      'The combustion of 11.5 g of ethanol (molar mass = 46.07 g/mol) produced 22.0 g of CO₂ and 13.5 g of H₂O. Determine the molecular formula.',
  }
}

// Produces a worked-example object for the StepsTrigger "Show me an example" button
export function generateCombustionExample(): { scenario: string; steps: string[]; result: string } {
  const p = generateCombustionProblem()
  const last = p.steps.length - 1
  return {
    scenario: p.scenario,
    steps: p.steps.slice(0, last),
    result: p.steps[last],
  }
}

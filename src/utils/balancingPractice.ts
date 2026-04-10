// ── Types ─────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface BalSpecies {
  coeff:   number
  formula: string   // plain ASCII, e.g. "Fe2O3"
  display: string   // Unicode subscripts, e.g. "Fe₂O₃"
}

export interface BalancingEquation {
  name:       string
  difficulty: Difficulty
  reactants:  BalSpecies[]
  products:   BalSpecies[]
}

// ── Equation data ─────────────────────────────────────────────────────────────

export const EQUATIONS: BalancingEquation[] = [
  // ── Easy ────────────────────────────────────────────────────────────────────
  {
    name: 'Synthesis of water',
    difficulty: 'easy',
    reactants: [
      { coeff: 2, formula: 'H2',  display: 'H₂'  },
      { coeff: 1, formula: 'O2',  display: 'O₂'  },
    ],
    products: [
      { coeff: 2, formula: 'H2O', display: 'H₂O' },
    ],
  },
  {
    name: 'Combustion of magnesium',
    difficulty: 'easy',
    reactants: [
      { coeff: 2, formula: 'Mg',  display: 'Mg'  },
      { coeff: 1, formula: 'O2',  display: 'O₂'  },
    ],
    products: [
      { coeff: 2, formula: 'MgO', display: 'MgO' },
    ],
  },
  {
    name: 'Synthesis of ammonia',
    difficulty: 'easy',
    reactants: [
      { coeff: 1, formula: 'N2',  display: 'N₂'  },
      { coeff: 3, formula: 'H2',  display: 'H₂'  },
    ],
    products: [
      { coeff: 2, formula: 'NH3', display: 'NH₃' },
    ],
  },
  {
    name: 'Formation of hydrogen chloride',
    difficulty: 'easy',
    reactants: [
      { coeff: 1, formula: 'H2',  display: 'H₂'  },
      { coeff: 1, formula: 'Cl2', display: 'Cl₂' },
    ],
    products: [
      { coeff: 2, formula: 'HCl', display: 'HCl' },
    ],
  },
  {
    name: 'Formation of sodium chloride',
    difficulty: 'easy',
    reactants: [
      { coeff: 2, formula: 'Na',  display: 'Na'  },
      { coeff: 1, formula: 'Cl2', display: 'Cl₂' },
    ],
    products: [
      { coeff: 2, formula: 'NaCl', display: 'NaCl' },
    ],
  },
  {
    name: 'Decomposition of hydrogen peroxide',
    difficulty: 'easy',
    reactants: [
      { coeff: 2, formula: 'H2O2', display: 'H₂O₂' },
    ],
    products: [
      { coeff: 2, formula: 'H2O', display: 'H₂O' },
      { coeff: 1, formula: 'O2',  display: 'O₂'  },
    ],
  },
  {
    name: 'Decomposition of potassium chlorate',
    difficulty: 'easy',
    reactants: [
      { coeff: 2, formula: 'KClO3', display: 'KClO₃' },
    ],
    products: [
      { coeff: 2, formula: 'KCl', display: 'KCl' },
      { coeff: 3, formula: 'O2',  display: 'O₂'  },
    ],
  },
  // ── Medium ───────────────────────────────────────────────────────────────────
  {
    name: 'Iron rusting (oxidation)',
    difficulty: 'medium',
    reactants: [
      { coeff: 4, formula: 'Fe',    display: 'Fe'    },
      { coeff: 3, formula: 'O2',    display: 'O₂'    },
    ],
    products: [
      { coeff: 2, formula: 'Fe2O3', display: 'Fe₂O₃' },
    ],
  },
  {
    name: 'Formation of aluminum chloride',
    difficulty: 'medium',
    reactants: [
      { coeff: 2, formula: 'Al',    display: 'Al'    },
      { coeff: 3, formula: 'Cl2',   display: 'Cl₂'   },
    ],
    products: [
      { coeff: 2, formula: 'AlCl3', display: 'AlCl₃' },
    ],
  },
  {
    name: 'Combustion of methane',
    difficulty: 'medium',
    reactants: [
      { coeff: 1, formula: 'CH4', display: 'CH₄' },
      { coeff: 2, formula: 'O2',  display: 'O₂'  },
    ],
    products: [
      { coeff: 1, formula: 'CO2', display: 'CO₂' },
      { coeff: 2, formula: 'H2O', display: 'H₂O' },
    ],
  },
  {
    name: 'Zinc reacting with hydrochloric acid',
    difficulty: 'medium',
    reactants: [
      { coeff: 1, formula: 'Zn',  display: 'Zn'  },
      { coeff: 2, formula: 'HCl', display: 'HCl' },
    ],
    products: [
      { coeff: 1, formula: 'ZnCl2', display: 'ZnCl₂' },
      { coeff: 1, formula: 'H2',    display: 'H₂'     },
    ],
  },
  {
    name: 'Sodium reacting with water',
    difficulty: 'medium',
    reactants: [
      { coeff: 2, formula: 'Na',  display: 'Na'  },
      { coeff: 2, formula: 'H2O', display: 'H₂O' },
    ],
    products: [
      { coeff: 2, formula: 'NaOH', display: 'NaOH' },
      { coeff: 1, formula: 'H2',   display: 'H₂'   },
    ],
  },
  {
    name: 'Iron smelting (reduction of iron oxide)',
    difficulty: 'medium',
    reactants: [
      { coeff: 1, formula: 'Fe2O3', display: 'Fe₂O₃' },
      { coeff: 3, formula: 'CO',    display: 'CO'     },
    ],
    products: [
      { coeff: 2, formula: 'Fe',  display: 'Fe'  },
      { coeff: 3, formula: 'CO2', display: 'CO₂' },
    ],
  },
  // ── Hard ─────────────────────────────────────────────────────────────────────
  {
    name: 'Combustion of propane',
    difficulty: 'hard',
    reactants: [
      { coeff: 1, formula: 'C3H8', display: 'C₃H₈' },
      { coeff: 5, formula: 'O2',   display: 'O₂'   },
    ],
    products: [
      { coeff: 3, formula: 'CO2', display: 'CO₂' },
      { coeff: 4, formula: 'H2O', display: 'H₂O' },
    ],
  },
  {
    name: 'Combustion of ethanol',
    difficulty: 'hard',
    reactants: [
      { coeff: 1, formula: 'C2H5OH', display: 'C₂H₅OH' },
      { coeff: 3, formula: 'O2',     display: 'O₂'      },
    ],
    products: [
      { coeff: 2, formula: 'CO2', display: 'CO₂' },
      { coeff: 3, formula: 'H2O', display: 'H₂O' },
    ],
  },
  {
    name: 'Cellular respiration (glucose combustion)',
    difficulty: 'hard',
    reactants: [
      { coeff: 1, formula: 'C6H12O6', display: 'C₆H₁₂O₆' },
      { coeff: 6, formula: 'O2',      display: 'O₂'        },
    ],
    products: [
      { coeff: 6, formula: 'CO2', display: 'CO₂' },
      { coeff: 6, formula: 'H2O', display: 'H₂O' },
    ],
  },
]

// ── Atom parser ───────────────────────────────────────────────────────────────
// Handles formulas like Fe2O3, AlCl3, C6H12O6, C2H5OH (no parentheses needed)

export function parseAtoms(formula: string): Record<string, number> {
  const result: Record<string, number> = {}
  const re = /([A-Z][a-z]?)(\d*)/g
  let match
  while ((match = re.exec(formula)) !== null) {
    if (!match[1]) continue
    const elem  = match[1]
    const count = match[2] ? parseInt(match[2]) : 1
    result[elem] = (result[elem] ?? 0) + count
  }
  return result
}

function countSide(species: BalSpecies[], userCoeffs: number[]): Record<string, number> {
  const totals: Record<string, number> = {}
  species.forEach((sp, i) => {
    const coeff = userCoeffs[i] ?? 0
    const atoms = parseAtoms(sp.formula)
    Object.entries(atoms).forEach(([el, n]) => {
      totals[el] = (totals[el] ?? 0) + n * coeff
    })
  })
  return totals
}

// ── Check result ──────────────────────────────────────────────────────────────

export interface ElementBalance {
  element: string
  left:    number
  right:   number
}

export interface CheckResult {
  balanced:    boolean
  elements:    ElementBalance[]
}

export function checkBalanced(
  eq: BalancingEquation,
  userReactantCoeffs: number[],
  userProductCoeffs: number[],
): CheckResult {
  const leftTotals  = countSide(eq.reactants, userReactantCoeffs)
  const rightTotals = countSide(eq.products,  userProductCoeffs)

  const allElements = Array.from(
    new Set([...Object.keys(leftTotals), ...Object.keys(rightTotals)])
  ).sort()

  const elements: ElementBalance[] = allElements.map(el => ({
    element: el,
    left:    leftTotals[el]  ?? 0,
    right:   rightTotals[el] ?? 0,
  }))

  const balanced = elements.every(e => e.left === e.right && e.left > 0)
  return { balanced, elements }
}

// ── Formatted display string ──────────────────────────────────────────────────

export function formatEquation(eq: BalancingEquation): string {
  const side = (species: BalSpecies[]) =>
    species.map(s => (s.coeff > 1 ? `${s.coeff} ` : '') + s.display).join(' + ')
  return `${side(eq.reactants)} → ${side(eq.products)}`
}

// ── Random picker ─────────────────────────────────────────────────────────────

export function pickEquation(difficulty?: Difficulty): BalancingEquation {
  const pool = difficulty
    ? EQUATIONS.filter(e => e.difficulty === difficulty)
    : EQUATIONS
  return pool[Math.floor(Math.random() * pool.length)]
}

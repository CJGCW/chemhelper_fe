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

// ── Atom parser ───────────────────────────────────────────────────────────────

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

// ── Rational arithmetic for exact Gaussian elimination ───────────────────────

type Frac = [number, number] // [numerator, denominator], always reduced, d > 0

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a || 1
}

function lcm(a: number, b: number): number {
  return Math.abs(a) / gcd(a, b) * Math.abs(b)
}

function frac(n: number, d = 1): Frac {
  if (n === 0) return [0, 1]
  const g = gcd(Math.abs(n), Math.abs(d))
  const s = d < 0 ? -1 : 1
  return [s * n / g, Math.abs(d) / g]
}

function fadd([n1, d1]: Frac, [n2, d2]: Frac): Frac { return frac(n1 * d2 + n2 * d1, d1 * d2) }
function fmul([n1, d1]: Frac, [n2, d2]: Frac): Frac { return frac(n1 * n2, d1 * d2) }
function fdiv([n1, d1]: Frac, [n2, d2]: Frac): Frac { return frac(n1 * d2, d1 * n2) }
function fneg([n, d]: Frac): Frac { return [-n, d] }
function fzero([n]: Frac): boolean { return n === 0 }

// ── Gaussian elimination (RREF) ───────────────────────────────────────────────

function gaussRref(matrix: Frac[][]): { mat: Frac[][], pivotCols: number[] } {
  const rows = matrix.length
  const cols = rows > 0 ? matrix[0].length : 0
  const mat  = matrix.map(row => [...row])
  const pivotCols: number[] = []
  let pr = 0

  for (let col = 0; col < cols && pr < rows; col++) {
    const offset = mat.slice(pr).findIndex(row => !fzero(row[col]))
    if (offset === -1) continue

    const r = pr + offset
    ;[mat[pr], mat[r]] = [mat[r], mat[pr]]

    const piv = mat[pr][col]
    for (let j = 0; j < cols; j++) mat[pr][j] = fdiv(mat[pr][j], piv)

    for (let row = 0; row < rows; row++) {
      if (row === pr || fzero(mat[row][col])) continue
      const f = mat[row][col]
      for (let j = 0; j < cols; j++) {
        mat[row][j] = fadd(mat[row][j], fneg(fmul(f, mat[pr][j])))
      }
    }

    pivotCols.push(col)
    pr++
  }

  return { mat, pivotCols }
}

// ── Reaction balancer ─────────────────────────────────────────────────────────
// Returns integer coefficients [reactant..., product...] in lowest terms,
// or null if the system is over/under-determined.

export function balanceReaction(reactants: string[], products: string[]): number[] | null {
  const all   = [...reactants, ...products]
  const nSpec = all.length
  const nR    = reactants.length

  const elemSet = new Set<string>()
  for (const f of all) Object.keys(parseAtoms(f)).forEach(e => elemSet.add(e))
  const elems = Array.from(elemSet)

  // M[element][species]: positive for reactants, negative for products
  const M: Frac[][] = elems.map(el =>
    all.map((f, i) => frac((i < nR ? 1 : -1) * (parseAtoms(f)[el] ?? 0)))
  )

  const { mat, pivotCols } = gaussRref(M)

  // Identify the single free variable
  const freeCols: number[] = []
  for (let j = 0; j < nSpec; j++) {
    if (!pivotCols.includes(j)) freeCols.push(j)
  }
  if (freeCols.length !== 1) return null

  const fv = freeCols[0]
  const sol: Frac[] = all.map((_, j) => (j === fv ? frac(1) : frac(0)))

  // For each pivot row i: sol[pivotCols[i]] = -RREF[i][fv]
  for (let i = 0; i < pivotCols.length; i++) {
    sol[pivotCols[i]] = fneg(mat[i][fv])
  }

  // All coefficients must be positive; if they're all negative, flip
  if (sol.some(f => f[0] < 0)) {
    for (let j = 0; j < nSpec; j++) sol[j] = fneg(sol[j])
  }
  if (sol.some(f => f[0] <= 0)) return null

  // Scale to smallest positive integers via LCM of denominators
  const denLcm = sol.reduce((acc, [, d]) => lcm(acc, d), 1)
  const ints   = sol.map(([n, d]) => Math.round(n * denLcm / d))
  if (ints.some(v => v <= 0)) return null

  const g = ints.reduce((a, v) => gcd(a, v), ints[0])
  return ints.map(v => v / g)
}

// ── Unicode display map ───────────────────────────────────────────────────────

const DISPLAY: Record<string, string> = {
  H2: 'H₂', O2: 'O₂', H2O: 'H₂O', N2: 'N₂', NH3: 'NH₃',
  Cl2: 'Cl₂', HCl: 'HCl', Na: 'Na', NaCl: 'NaCl',
  Mg: 'Mg', MgO: 'MgO', MgCl2: 'MgCl₂',
  Fe: 'Fe', Fe2O3: 'Fe₂O₃', Fe3O4: 'Fe₃O₄', FeO: 'FeO',
  Al: 'Al', AlCl3: 'AlCl₃', Al2O3: 'Al₂O₃',
  CH4: 'CH₄', CO2: 'CO₂', CO: 'CO', C: 'C',
  C2H4: 'C₂H₄', C3H8: 'C₃H₈', C4H10: 'C₄H₁₀',
  C2H5OH: 'C₂H₅OH', C6H12O6: 'C₆H₁₂O₆',
  KClO3: 'KClO₃', KCl: 'KCl', K: 'K', K2O: 'K₂O',
  H2O2: 'H₂O₂',
  Zn: 'Zn', ZnCl2: 'ZnCl₂', ZnO: 'ZnO',
  Cu: 'Cu', CuO: 'CuO', Cu2O: 'Cu₂O', CuCl2: 'CuCl₂',
  Ca: 'Ca', CaO: 'CaO', CaCO3: 'CaCO₃', CaCl2: 'CaCl₂',
  NaOH: 'NaOH', Na2O: 'Na₂O',
  H2SO4: 'H₂SO₄', SO2: 'SO₂', SO3: 'SO₃', S: 'S',
  P4: 'P₄', P4O10: 'P₄O₁₀', H3PO4: 'H₃PO₄',
  NO: 'NO', NO2: 'NO₂', HNO3: 'HNO₃',
  Li: 'Li', Li2O: 'Li₂O', LiCl: 'LiCl',
  Br2: 'Br₂', HBr: 'HBr', F2: 'F₂', HF: 'HF', I2: 'I₂', HI: 'HI',
}

// ── Reaction templates (formulas only; coefficients are computed) ─────────────

interface ReactionTemplate {
  name:       string
  difficulty: Difficulty
  reactants:  string[]
  products:   string[]
}

const TEMPLATES: ReactionTemplate[] = [
  // ── Easy ────────────────────────────────────────────────────────────────────
  { name: 'Synthesis of water',                        difficulty: 'easy',   reactants: ['H2', 'O2'],          products: ['H2O']         },
  { name: 'Combustion of magnesium',                   difficulty: 'easy',   reactants: ['Mg', 'O2'],          products: ['MgO']         },
  { name: 'Synthesis of ammonia',                      difficulty: 'easy',   reactants: ['N2', 'H2'],          products: ['NH3']         },
  { name: 'Formation of hydrogen chloride',            difficulty: 'easy',   reactants: ['H2', 'Cl2'],         products: ['HCl']         },
  { name: 'Formation of sodium chloride',              difficulty: 'easy',   reactants: ['Na', 'Cl2'],         products: ['NaCl']        },
  { name: 'Decomposition of hydrogen peroxide',        difficulty: 'easy',   reactants: ['H2O2'],              products: ['H2O', 'O2']   },
  { name: 'Decomposition of potassium chlorate',       difficulty: 'easy',   reactants: ['KClO3'],             products: ['KCl', 'O2']   },
  { name: 'Formation of lithium oxide',                difficulty: 'easy',   reactants: ['Li', 'O2'],          products: ['Li2O']        },
  { name: 'Formation of hydrogen bromide',             difficulty: 'easy',   reactants: ['H2', 'Br2'],         products: ['HBr']         },
  { name: 'Formation of hydrogen fluoride',            difficulty: 'easy',   reactants: ['H2', 'F2'],          products: ['HF']          },
  { name: 'Formation of magnesium chloride',           difficulty: 'easy',   reactants: ['Mg', 'Cl2'],         products: ['MgCl2']       },
  { name: 'Formation of calcium oxide',                difficulty: 'easy',   reactants: ['Ca', 'O2'],          products: ['CaO']         },
  { name: 'Formation of copper(I) oxide',              difficulty: 'easy',   reactants: ['Cu', 'O2'],          products: ['Cu2O']        },
  { name: 'Formation of hydrogen iodide',              difficulty: 'easy',   reactants: ['H2', 'I2'],          products: ['HI']          },
  // ── Medium ───────────────────────────────────────────────────────────────────
  { name: 'Iron rusting (oxidation)',                  difficulty: 'medium', reactants: ['Fe', 'O2'],          products: ['Fe2O3']       },
  { name: 'Formation of aluminum chloride',            difficulty: 'medium', reactants: ['Al', 'Cl2'],         products: ['AlCl3']       },
  { name: 'Combustion of methane',                     difficulty: 'medium', reactants: ['CH4', 'O2'],         products: ['CO2', 'H2O']  },
  { name: 'Zinc reacting with hydrochloric acid',      difficulty: 'medium', reactants: ['Zn', 'HCl'],         products: ['ZnCl2', 'H2'] },
  { name: 'Sodium reacting with water',                difficulty: 'medium', reactants: ['Na', 'H2O'],         products: ['NaOH', 'H2']  },
  { name: 'Iron smelting (reduction of iron oxide)',   difficulty: 'medium', reactants: ['Fe2O3', 'CO'],       products: ['Fe', 'CO2']   },
  { name: 'Formation of aluminum oxide',               difficulty: 'medium', reactants: ['Al', 'O2'],          products: ['Al2O3']       },
  { name: 'Formation of magnetite',                    difficulty: 'medium', reactants: ['Fe', 'O2'],          products: ['Fe3O4']       },
  { name: 'Copper reacting with chlorine',             difficulty: 'medium', reactants: ['Cu', 'Cl2'],         products: ['CuCl2']       },
  { name: 'Carbon monoxide combustion',                difficulty: 'medium', reactants: ['CO', 'O2'],          products: ['CO2']         },
  { name: 'Zinc oxide reduction with carbon',          difficulty: 'medium', reactants: ['ZnO', 'C'],          products: ['Zn', 'CO2']   },
  { name: 'Calcium carbonate decomposition',           difficulty: 'medium', reactants: ['CaCO3'],             products: ['CaO', 'CO2']  },
  { name: 'Magnesium reacting with hydrochloric acid', difficulty: 'medium', reactants: ['Mg', 'HCl'],         products: ['MgCl2', 'H2'] },
  { name: 'Sulfur dioxide oxidation',                  difficulty: 'medium', reactants: ['SO2', 'O2'],         products: ['SO3']         },
  { name: 'Reduction of iron oxide by hydrogen',       difficulty: 'medium', reactants: ['Fe2O3', 'H2'],       products: ['Fe', 'H2O']   },
  // ── Hard ─────────────────────────────────────────────────────────────────────
  { name: 'Combustion of propane',                     difficulty: 'hard',   reactants: ['C3H8', 'O2'],        products: ['CO2', 'H2O']  },
  { name: 'Combustion of ethanol',                     difficulty: 'hard',   reactants: ['C2H5OH', 'O2'],      products: ['CO2', 'H2O']  },
  { name: 'Cellular respiration (glucose combustion)', difficulty: 'hard',   reactants: ['C6H12O6', 'O2'],     products: ['CO2', 'H2O']  },
  { name: 'Combustion of butane',                      difficulty: 'hard',   reactants: ['C4H10', 'O2'],       products: ['CO2', 'H2O']  },
  { name: 'Combustion of ethylene',                    difficulty: 'hard',   reactants: ['C2H4', 'O2'],        products: ['CO2', 'H2O']  },
  { name: 'Phosphorus combustion',                     difficulty: 'hard',   reactants: ['P4', 'O2'],          products: ['P4O10']       },
  { name: 'Formation of phosphoric acid',              difficulty: 'hard',   reactants: ['P4O10', 'H2O'],      products: ['H3PO4']       },
  { name: 'Nitric acid synthesis',                     difficulty: 'hard',   reactants: ['NO2', 'H2O', 'O2'], products: ['HNO3']        },
]

// ── Build EQUATIONS from templates at module load ────────────────────────────

function fromTemplate(t: ReactionTemplate): BalancingEquation | null {
  const coeffs = balanceReaction(t.reactants, t.products)
  if (!coeffs) return null
  const nR = t.reactants.length
  return {
    name:       t.name,
    difficulty: t.difficulty,
    reactants:  t.reactants.map((f, i) => ({ coeff: coeffs[i],      formula: f, display: DISPLAY[f] ?? f })),
    products:   t.products.map( (f, i) => ({ coeff: coeffs[nR + i], formula: f, display: DISPLAY[f] ?? f })),
  }
}

export const EQUATIONS: BalancingEquation[] =
  TEMPLATES.flatMap(t => { const eq = fromTemplate(t); return eq ? [eq] : [] })

// ── Check result ──────────────────────────────────────────────────────────────

export interface ElementBalance {
  element: string
  left:    number
  right:   number
}

export interface CheckResult {
  balanced: boolean
  elements: ElementBalance[]
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

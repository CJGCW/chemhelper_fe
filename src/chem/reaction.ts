/**
 * Exact rational-arithmetic Gaussian elimination (RREF) for balancing chemical equations.
 * Ported from src/utils/balancingPractice.ts so UI utilities can import from here instead.
 */

import { parseFormula } from './species'

// ── Rational arithmetic ───────────────────────────────────────────────────────

type Frac = [number, number] // [numerator, denominator], denominator > 0

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

// ── RREF ──────────────────────────────────────────────────────────────────────

function gaussRref(matrix: Frac[][]): { mat: Frac[][]; pivotCols: number[] } {
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

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns integer coefficients [reactants..., products...] in lowest terms,
 * or null if the system has no unique balanced solution.
 */
export function balanceReaction(reactants: string[], products: string[]): number[] | null {
  const all   = [...reactants, ...products]
  const nSpec = all.length
  const nR    = reactants.length

  // Parse all formulas — use simple atom parser (no parentheses needed for balancing templates)
  let atomMaps: Record<string, number>[]
  try {
    atomMaps = all.map(f => parseFormula(f))
  } catch {
    return null
  }

  const elemSet = new Set<string>()
  for (const m of atomMaps) Object.keys(m).forEach(e => elemSet.add(e))
  const elems = Array.from(elemSet)

  // M[element][species]: positive for reactants, negative for products
  const M: Frac[][] = elems.map(el =>
    atomMaps.map((m, i) => frac((i < nR ? 1 : -1) * (m[el] ?? 0)))
  )

  const { mat, pivotCols } = gaussRref(M)

  const freeCols: number[] = []
  for (let j = 0; j < nSpec; j++) {
    if (!pivotCols.includes(j)) freeCols.push(j)
  }
  if (freeCols.length !== 1) return null

  const fv = freeCols[0]
  const sol: Frac[] = all.map((_, j) => (j === fv ? frac(1) : frac(0)))

  for (let i = 0; i < pivotCols.length; i++) {
    sol[pivotCols[i]] = fneg(mat[i][fv])
  }

  if (sol.some(f => f[0] < 0)) {
    for (let j = 0; j < nSpec; j++) sol[j] = fneg(sol[j])
  }
  if (sol.some(f => f[0] <= 0)) return null

  const denLcm = sol.reduce((acc, [, d]) => lcm(acc, d), 1)
  const ints   = sol.map(([n, d]) => Math.round(n * denLcm / d))
  if (ints.some(v => v <= 0)) return null

  const g = ints.reduce((a, v) => gcd(a, v), ints[0])
  return ints.map(v => v / g)
}

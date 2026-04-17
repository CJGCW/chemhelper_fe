import type { LewisStructure } from '../pages/LewisPage'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SigmaPiProblem {
  name:        string          // display label e.g. "carbon dioxide (CO₂)"
  sigma:       number
  pi:          number
  explanation: string
  structure:   LewisStructure
}

// ── Bond counting ──────────────────────────────────────────────────────────────

export function countSigmaPi(structure: LewisStructure): { sigma: number; pi: number } {
  const sigma = structure.bonds.length
  const pi    = structure.bonds.reduce((sum, b) => sum + Math.max(0, b.order - 1), 0)
  return { sigma, pi }
}

// ── Explanation builder ────────────────────────────────────────────────────────

function bondSymbol(order: number): string {
  return order === 1 ? '–' : order === 2 ? '=' : '≡'
}
function bondName(order: number): string {
  return order === 1 ? 'single' : order === 2 ? 'double' : 'triple'
}

export function buildExplanation(structure: LewisStructure, sigma: number, pi: number): string {
  const atomEl: Record<string, string> = {}
  structure.atoms.forEach(a => { atomEl[a.id] = a.element })

  // Bucket bonds by (sorted element pair, order) preserving insertion order
  const buckets = new Map<string, { count: number; order: number; a: string; b: string }>()
  for (const bond of structure.bonds) {
    const elA = atomEl[bond.from] ?? '?'
    const elB = atomEl[bond.to]   ?? '?'
    const [a, b] = [elA, elB].sort()
    const key = `${a}${bond.order}${b}`
    const existing = buckets.get(key)
    if (existing) existing.count++
    else buckets.set(key, { count: 1, order: bond.order, a, b })
  }

  const parts: string[] = []
  for (const { count, order, a, b } of buckets.values()) {
    const sym  = bondSymbol(order)
    const name = bondName(order)
    const piPer = order - 1
    const contrib = piPer === 0
      ? `${count}σ`
      : `${count}σ + ${count * piPer}π`
    parts.push(`${count} ${a}${sym}${b} ${name} bond${count > 1 ? 's' : ''} (${contrib})`)
  }

  return parts.join(' + ') + ` → ${sigma}σ, ${pi}π`
}

// ── API fetch (mirrors lewisPractice.ts) ───────────────────────────────────────

const COMPOUND_POOL = [
  { formula: 'CO2',   charge:  0, label: 'carbon dioxide (CO₂)'          },
  { formula: 'HCN',   charge:  0, label: 'hydrogen cyanide (HCN)'        },
  { formula: 'SO2',   charge:  0, label: 'sulfur dioxide (SO₂)'          },
  { formula: 'CH2O',  charge:  0, label: 'formaldehyde (CH₂O)'           },
  { formula: 'BF3',   charge:  0, label: 'boron trifluoride (BF₃)'       },
  { formula: 'NO3',   charge: -1, label: 'nitrate (NO₃⁻)'                },
  { formula: 'SO3',   charge:  0, label: 'sulfur trioxide (SO₃)'         },
  { formula: 'CH4',   charge:  0, label: 'methane (CH₄)'                 },
  { formula: 'NH3',   charge:  0, label: 'ammonia (NH₃)'                 },
  { formula: 'H2O',   charge:  0, label: 'water (H₂O)'                   },
  { formula: 'PCl5',  charge:  0, label: 'phosphorus pentachloride (PCl₅)'},
  { formula: 'SF6',   charge:  0, label: 'sulfur hexafluoride (SF₆)'     },
  { formula: 'XeF4',  charge:  0, label: 'xenon tetrafluoride (XeF₄)'   },
  { formula: 'SO4',   charge: -2, label: 'sulfate (SO₄²⁻)'               },
  { formula: 'NH4',   charge:  1, label: 'ammonium (NH₄⁺)'               },
  { formula: 'CO3',   charge: -2, label: 'carbonate (CO₃²⁻)'             },
  { formula: 'PO4',   charge: -3, label: 'phosphate (PO₄³⁻)'             },
  { formula: 'ClF3',  charge:  0, label: 'chlorine trifluoride (ClF₃)'   },
  { formula: 'XeF2',  charge:  0, label: 'xenon difluoride (XeF₂)'       },
  { formula: 'O3',    charge:  0, label: 'ozone (O₃)'                    },
]

function pickFromPool(): typeof COMPOUND_POOL[0] {
  return COMPOUND_POOL[Math.floor(Math.random() * COMPOUND_POOL.length)]
}

async function fetchStructure(formula: string, charge: number): Promise<LewisStructure | null> {
  try {
    const body: Record<string, unknown> = { input: formula }
    if (charge !== 0) body.charge = charge
    const resp = await fetch('/api/structure/lewis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

async function fetchRandomStructure(): Promise<LewisStructure | null> {
  try {
    const resp = await fetch('/api/structure/random')
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

// ── Generator ──────────────────────────────────────────────────────────────────

export async function generateSigmaPiProblem(): Promise<SigmaPiProblem | null> {
  let structure: LewisStructure | null
  let label: string

  if (Math.random() < 0.4) {
    const c = pickFromPool()
    structure = await fetchStructure(c.formula, c.charge)
    label = c.label
  } else {
    structure = await fetchRandomStructure()
    label = structure?.name ?? ''
  }

  if (!structure) return null

  const { sigma, pi } = countSigmaPi(structure)
  return {
    name:        label,
    sigma,
    pi,
    explanation: buildExplanation(structure, sigma, pi),
    structure,
  }
}

// ── Checkers ───────────────────────────────────────────────────────────────────

export type SigmaPiResult = 'correct' | 'wrong-sigma' | 'wrong-pi' | 'wrong-both'

/** Check separate σ and π string inputs. */
export function checkSigmaPiAnswer(
  sigmaRaw: string,
  piRaw:    string,
  problem:  SigmaPiProblem,
): SigmaPiResult {
  const s = parseInt(sigmaRaw, 10)
  const p = parseInt(piRaw,    10)
  if (isNaN(s) || isNaN(p)) return 'wrong-both'
  const sigmaOk = s === problem.sigma
  const piOk    = p === problem.pi
  if (sigmaOk && piOk) return 'correct'
  if (!sigmaOk && !piOk) return 'wrong-both'
  if (!sigmaOk) return 'wrong-sigma'
  return 'wrong-pi'
}

/** Check combined "sigma,pi" string (used by TestSheet). */
export function checkSigmaPiCombined(raw: string, problem: SigmaPiProblem): boolean {
  const parts = raw.trim().split(/[\s,]+/).map(s => parseInt(s))
  if (parts.length !== 2 || parts.some(isNaN)) return false
  return parts[0] === problem.sigma && parts[1] === problem.pi
}

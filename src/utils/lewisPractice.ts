import type { LewisStructure } from '../pages/LewisPage'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LewisProblem {
  compound:     string   // display label e.g. "water (H₂O)"
  question:     string
  answer:       string   // canonical answer (text or stringified number)
  answerUnit:   string
  isTextAnswer: boolean
  steps:        string[]
}

export interface VseprProblem {
  compound:     string
  question:     string
  answer:       string
  answerUnit:   string
  isTextAnswer: boolean
  steps:        string[]
}

export interface LewisDrawProblem {
  compound:  string
  question:  string
  structure: LewisStructure
}

export interface VseprDrawProblem {
  compound:   string          // display label e.g. "water (H₂O)"
  question:   string
  // answer key fields
  geometry:   string          // e.g. "Bent"
  keyDetails: string[]        // e.g. ["sp³", "≈104.5°", "2 bonding pairs, 2 lone pairs"]
  structure:  LewisStructure  // full structure for diagram rendering
}

// ── Compound pool ─────────────────────────────────────────────────────────────

const COMPOUND_POOL = [
  // ── Linear ────────────────────────────────────────────────────────────────────
  { formula: 'CO2',   charge:  0, label: 'carbon dioxide (CO₂)'              },
  { formula: 'CS2',   charge:  0, label: 'carbon disulfide (CS₂)'            },
  { formula: 'HCN',   charge:  0, label: 'hydrogen cyanide (HCN)'            },
  { formula: 'BeCl2', charge:  0, label: 'beryllium chloride (BeCl₂)'        },
  { formula: 'XeF2',  charge:  0, label: 'xenon difluoride (XeF₂)'           },
  // ── Trigonal planar ───────────────────────────────────────────────────────────
  { formula: 'BF3',   charge:  0, label: 'boron trifluoride (BF₃)'           },
  { formula: 'BCl3',  charge:  0, label: 'boron trichloride (BCl₃)'          },
  { formula: 'SO3',   charge:  0, label: 'sulfur trioxide (SO₃)'             },
  { formula: 'NO3',   charge: -1, label: 'nitrate (NO₃⁻)'                    },
  { formula: 'CO3',   charge: -2, label: 'carbonate (CO₃²⁻)'                 },
  { formula: 'CH2O',  charge:  0, label: 'formaldehyde (CH₂O)'               },
  // ── Bent (sp²) ────────────────────────────────────────────────────────────────
  { formula: 'SO2',   charge:  0, label: 'sulfur dioxide (SO₂)'              },
  { formula: 'O3',    charge:  0, label: 'ozone (O₃)'                        },
  { formula: 'NO2',   charge: -1, label: 'nitrite (NO₂⁻)'                    },
  // ── Tetrahedral ───────────────────────────────────────────────────────────────
  { formula: 'CH4',   charge:  0, label: 'methane (CH₄)'                     },
  { formula: 'CCl4',  charge:  0, label: 'carbon tetrachloride (CCl₄)'       },
  { formula: 'CF4',   charge:  0, label: 'carbon tetrafluoride (CF₄)'        },
  { formula: 'SiH4',  charge:  0, label: 'silane (SiH₄)'                     },
  { formula: 'SiCl4', charge:  0, label: 'silicon tetrachloride (SiCl₄)'     },
  { formula: 'NH4',   charge:  1, label: 'ammonium (NH₄⁺)'                   },
  { formula: 'SO4',   charge: -2, label: 'sulfate (SO₄²⁻)'                   },
  { formula: 'PO4',   charge: -3, label: 'phosphate (PO₄³⁻)'                 },
  { formula: 'ClO4',  charge: -1, label: 'perchlorate (ClO₄⁻)'               },
  // ── Trigonal pyramidal ────────────────────────────────────────────────────────
  { formula: 'NH3',   charge:  0, label: 'ammonia (NH₃)'                     },
  { formula: 'PH3',   charge:  0, label: 'phosphine (PH₃)'                   },
  { formula: 'PCl3',  charge:  0, label: 'phosphorus trichloride (PCl₃)'     },
  { formula: 'NF3',   charge:  0, label: 'nitrogen trifluoride (NF₃)'        },
  { formula: 'PF3',   charge:  0, label: 'phosphorus trifluoride (PF₃)'      },
  { formula: 'SO3',   charge: -2, label: 'sulfite (SO₃²⁻)'                   },
  { formula: 'ClO3',  charge: -1, label: 'chlorate (ClO₃⁻)'                  },
  // ── Bent (sp³) ────────────────────────────────────────────────────────────────
  { formula: 'H2O',   charge:  0, label: 'water (H₂O)'                       },
  { formula: 'H2S',   charge:  0, label: 'hydrogen sulfide (H₂S)'            },
  { formula: 'OF2',   charge:  0, label: 'oxygen difluoride (OF₂)'           },
  { formula: 'SCl2',  charge:  0, label: 'sulfur dichloride (SCl₂)'          },
  { formula: 'ClO2',  charge: -1, label: 'chlorite (ClO₂⁻)'                  },
  // ── Trigonal bipyramidal ──────────────────────────────────────────────────────
  { formula: 'PCl5',  charge:  0, label: 'phosphorus pentachloride (PCl₅)'   },
  { formula: 'PF5',   charge:  0, label: 'phosphorus pentafluoride (PF₅)'    },
  { formula: 'AsF5',  charge:  0, label: 'arsenic pentafluoride (AsF₅)'      },
  // ── See-saw ───────────────────────────────────────────────────────────────────
  { formula: 'SF4',   charge:  0, label: 'sulfur tetrafluoride (SF₄)'        },
  { formula: 'TeCl4', charge:  0, label: 'tellurium tetrachloride (TeCl₄)'   },
  // ── T-shaped ──────────────────────────────────────────────────────────────────
  { formula: 'ClF3',  charge:  0, label: 'chlorine trifluoride (ClF₃)'       },
  { formula: 'BrF3',  charge:  0, label: 'bromine trifluoride (BrF₃)'        },
  { formula: 'IF3',   charge:  0, label: 'iodine trifluoride (IF₃)'          },
  // ── Square planar ─────────────────────────────────────────────────────────────
  { formula: 'XeF4',  charge:  0, label: 'xenon tetrafluoride (XeF₄)'        },
  { formula: 'ICl4',  charge: -1, label: 'tetrachloroiodate (ICl₄⁻)'         },
  // ── Square pyramidal ──────────────────────────────────────────────────────────
  { formula: 'BrF5',  charge:  0, label: 'bromine pentafluoride (BrF₅)'      },
  { formula: 'IF5',   charge:  0, label: 'iodine pentafluoride (IF₅)'        },
  { formula: 'ClF5',  charge:  0, label: 'chlorine pentafluoride (ClF₅)'     },
  // ── Octahedral ────────────────────────────────────────────────────────────────
  { formula: 'SF6',   charge:  0, label: 'sulfur hexafluoride (SF₆)'         },
  { formula: 'SeF6',  charge:  0, label: 'selenium hexafluoride (SeF₆)'      },
  { formula: 'IF6',   charge:  1, label: 'hexafluoroiodine cation (IF₆⁺)'    },
]

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// ── API fetch ─────────────────────────────────────────────────────────────────

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

// ── VSEPR derivation ──────────────────────────────────────────────────────────

const ELECTRON_GEOMETRY: Record<number, string> = {
  1: 'Linear', 2: 'Linear', 3: 'Trigonal Planar',
  4: 'Tetrahedral', 5: 'Trigonal Bipyramidal', 6: 'Octahedral',
}

const HYBRIDIZATION: Record<number, string> = {
  1: 's', 2: 'sp', 3: 'sp²', 4: 'sp³', 5: 'sp³d', 6: 'sp³d²',
}

const GEOMETRY_LABEL: Record<string, string> = {
  linear: 'Linear', diatomic: 'Linear', bent: 'Bent',
  trigonal_planar: 'Trigonal Planar', trigonal_pyramidal: 'Trigonal Pyramidal',
  tetrahedral: 'Tetrahedral', t_shaped: 'T-Shaped', see_saw: 'See-Saw', seesaw: 'See-Saw',
  square_planar: 'Square Planar', square_pyramidal: 'Square Pyramidal',
  trigonal_bipyramidal: 'Trigonal Bipyramidal', octahedral: 'Octahedral',
}

function deriveVsepr(structure: LewisStructure) {
  const adj: Record<string, string[]> = {}
  structure.atoms.forEach(a => { adj[a.id] = [] })
  structure.bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from) })

  const center = structure.atoms.reduce((best, a) => {
    const bc = adj[a.id].length, bb = adj[best.id].length
    if (bc > bb) return a
    if (bc === bb && best.element === 'H' && a.element !== 'H') return a
    return best
  })

  const bondingPairs = adj[center.id].length
  const lonePairs    = center.lone_pairs
  const electronPairs = bondingPairs + lonePairs
  const geoKey = structure.geometry.toLowerCase().replace(/-/g, '_')

  return {
    center: center.element,
    bondingPairs, lonePairs, electronPairs,
    electronGeometry:  ELECTRON_GEOMETRY[electronPairs] ?? structure.geometry,
    hybridization:     HYBRIDIZATION[electronPairs] ?? '—',
    molecularGeometry: GEOMETRY_LABEL[geoKey] ?? structure.geometry,
  }
}

// ── Lewis question builder ────────────────────────────────────────────────────

type LewisKind = 'valence_electrons' | 'geometry' | 'bond_count' | 'lone_pairs_center'

function makeLewisProblem(structure: LewisStructure, label: string): LewisProblem {
  const adj: Record<string, string[]> = {}
  structure.atoms.forEach(a => { adj[a.id] = [] })
  structure.bonds.forEach(b => { adj[b.from].push(b.to); adj[b.to].push(b.from) })
  const center = structure.atoms.reduce((best, a) => {
    const bc = adj[a.id].length, bb = adj[best.id].length
    if (bc > bb) return a
    if (bc === bb && best.element === 'H' && a.element !== 'H') return a
    return best
  })

  const geoKey   = structure.geometry.toLowerCase().replace(/-/g, '_')
  const geoLabel = GEOMETRY_LABEL[geoKey] ?? structure.geometry

  const kinds: LewisKind[] = ['valence_electrons', 'geometry', 'bond_count']
  if (center.lone_pairs > 0) kinds.push('lone_pairs_center')
  const kind = pick(kinds)

  if (kind === 'valence_electrons') {
    return {
      compound: label,
      question: `How many total valence electrons are in ${label}?`,
      answer: String(structure.total_valence_electrons),
      answerUnit: 'e⁻', isTextAnswer: false,
      steps: [
        `Count valence electrons for each atom in ${structure.formula}`,
        ...(structure.charge !== 0 ? [
          `Adjust for ionic charge (${structure.charge > 0 ? '+' : ''}${structure.charge}): ${structure.charge > 0 ? 'subtract' : 'add'} ${Math.abs(structure.charge)} electron(s)`,
        ] : []),
        `Total valence electrons: ${structure.total_valence_electrons} e⁻`,
      ],
    }
  }

  if (kind === 'geometry') {
    return {
      compound: label,
      question: `What is the molecular geometry of ${label}?`,
      answer: geoLabel, answerUnit: '', isTextAnswer: true,
      steps: [
        `Draw the Lewis structure for ${structure.formula}`,
        `Central atom: ${center.element} — bonding pairs: ${adj[center.id].length}, lone pairs: ${center.lone_pairs}`,
        `Molecular geometry: ${geoLabel}`,
      ],
    }
  }

  if (kind === 'bond_count') {
    const n = adj[center.id].length
    return {
      compound: label,
      question: `How many atoms are bonded to the central atom (${center.element}) in ${label}?`,
      answer: String(n), answerUnit: 'bonded atoms', isTextAnswer: false,
      steps: [
        `Central atom: ${center.element}`,
        `Bonded atoms (bonding pairs): ${n}`,
        `Molecular geometry: ${geoLabel}`,
      ],
    }
  }

  // lone_pairs_center
  return {
    compound: label,
    question: `How many lone pairs does the central atom (${center.element}) have in ${label}?`,
    answer: String(center.lone_pairs), answerUnit: 'lone pairs', isTextAnswer: false,
    steps: [
      `Central atom: ${center.element}`,
      `Lone pairs on ${center.element}: ${center.lone_pairs}`,
      `Molecular geometry: ${geoLabel}`,
    ],
  }
}

// ── VSEPR question builder ────────────────────────────────────────────────────

type VseprKind = 'molecular_geometry' | 'electron_geometry' | 'hybridization' | 'bonding_pairs' | 'lone_pairs'

function makeVseprProblem(structure: LewisStructure, label: string): VseprProblem {
  const v = deriveVsepr(structure)

  const kinds: VseprKind[] = [
    'molecular_geometry', 'molecular_geometry', // weighted 2×
    'electron_geometry', 'hybridization', 'bonding_pairs',
    ...(v.lonePairs > 0 ? ['lone_pairs' as VseprKind] : []),
  ]
  const kind = pick(kinds)

  const baseSteps = [
    `Central atom: ${v.center}`,
    `Bonding pairs: ${v.bondingPairs}, lone pairs on center: ${v.lonePairs}`,
    `Total electron pairs: ${v.electronPairs}`,
    `Electron geometry: ${v.electronGeometry}`,
    `Molecular geometry: ${v.molecularGeometry}`,
    `Hybridization: ${v.hybridization}`,
  ]

  if (kind === 'molecular_geometry') return {
    compound: label,
    question: `What is the molecular geometry of ${label}?`,
    answer: v.molecularGeometry, answerUnit: '', isTextAnswer: true, steps: baseSteps,
  }
  if (kind === 'electron_geometry') return {
    compound: label,
    question: `What is the electron geometry of ${label}?`,
    answer: v.electronGeometry, answerUnit: '', isTextAnswer: true, steps: baseSteps,
  }
  if (kind === 'hybridization') return {
    compound: label,
    question: `What is the hybridization of the central atom in ${label}?`,
    answer: v.hybridization, answerUnit: '', isTextAnswer: true, steps: baseSteps,
  }
  if (kind === 'bonding_pairs') return {
    compound: label,
    question: `How many bonding pairs does the central atom have in ${label}?`,
    answer: String(v.bondingPairs), answerUnit: 'bonding pairs', isTextAnswer: false, steps: baseSteps,
  }
  // lone_pairs
  return {
    compound: label,
    question: `How many lone pairs does the central atom have in ${label}?`,
    answer: String(v.lonePairs), answerUnit: 'lone pairs', isTextAnswer: false, steps: baseSteps,
  }
}

// ── VSEPR draw problem builder ────────────────────────────────────────────────

const BOND_ANGLES: Record<string, string> = {
  linear: '180°', diatomic: '180°',
  trigonal_planar: '≈120°', bent: '< 120° or < 109.5°',
  tetrahedral: '≈109.5°', trigonal_pyramidal: '≈107°',
  see_saw: '≈120° / 90°', seesaw: '≈120° / 90°',
  t_shaped: '≈90°', square_planar: '90°',
  square_pyramidal: '≈90°', trigonal_bipyramidal: '90° / 120°',
  octahedral: '90°',
}

function makeVseprDrawProblem(structure: LewisStructure, label: string): VseprDrawProblem {
  const v = deriveVsepr(structure)
  const geoKey = structure.geometry.toLowerCase().replace(/-/g, '_')
  const angle  = BOND_ANGLES[geoKey] ?? '—'

  return {
    compound: label,
    question: `Draw the 3D molecular structure of ${label} using wedge (▶) and dash (– –) bonds to show its geometry.`,
    geometry: v.molecularGeometry,
    keyDetails: [
      `Hybridization: ${v.hybridization}`,
      `Bond angles: ${angle}`,
      `${v.bondingPairs} bonding pair${v.bondingPairs !== 1 ? 's' : ''}, ${v.lonePairs} lone pair${v.lonePairs !== 1 ? 's' : ''} on central atom`,
    ],
    structure,
  }
}

// ── Random structure fetch (backend-generated) ────────────────────────────────

async function fetchRandomStructure(): Promise<LewisStructure | null> {
  try {
    const resp = await fetch('/api/structure/random')
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}

// Pick either from the curated static pool (which includes ions and multi-element
// compounds the generator can't produce) or from the backend random generator.
async function pickStructure(): Promise<{ structure: LewisStructure; label: string } | null> {
  // ~40% of the time use the curated pool, otherwise ask the backend to generate one
  if (Math.random() < 0.4) {
    const c = pick(COMPOUND_POOL)
    const s = await fetchStructure(c.formula, c.charge)
    return s ? { structure: s, label: c.label } : null
  }
  const s = await fetchRandomStructure()
  return s ? { structure: s, label: s.name } : null
}

// ── Public generators ─────────────────────────────────────────────────────────

export async function generateLewisProblem(): Promise<LewisProblem | null> {
  const picked = await pickStructure()
  return picked ? makeLewisProblem(picked.structure, picked.label) : null
}

export async function generateVseprProblem(): Promise<VseprProblem | null> {
  const picked = await pickStructure()
  return picked ? makeVseprProblem(picked.structure, picked.label) : null
}

export async function generateLewisDrawProblem(): Promise<LewisDrawProblem | null> {
  const picked = await pickStructure()
  if (!picked) return null
  return {
    compound:  picked.label,
    question:  `Draw the Lewis structure of ${picked.label}, showing all bonds and lone pairs.`,
    structure: picked.structure,
  }
}

export async function generateVseprDrawProblem(): Promise<VseprDrawProblem | null> {
  const picked = await pickStructure()
  return picked ? makeVseprDrawProblem(picked.structure, picked.label) : null
}

// ── Answer checking ───────────────────────────────────────────────────────────

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '').replace(/_/g, '')
    .replace(/³/g, '3').replace(/²/g, '2').replace(/\^/g, '')
    .replace(/[⁻⁺°≈]/g, '')
    .replace(/−/g, '-')
}

const ALIASES: Record<string, string> = {
  vshape: 'bent', vshaped: 'bent', angular: 'bent',
  diatomic: 'linear',
  seesaw: 'seesaw', 'see-saw': 'seesaw',
}

function resolve(s: string): string { return ALIASES[s] ?? s }

function checkTextOrNumeric(input: string, problem: { answer: string; isTextAnswer: boolean }): boolean {
  if (!input.trim()) return false
  if (!problem.isTextAnswer) {
    const val = parseFloat(input)
    if (isNaN(val)) return false
    const ans = parseFloat(problem.answer)
    if (ans === 0) return Math.abs(val) < 0.001
    return Math.abs((val - ans) / ans) <= 0.01
  }
  return resolve(normalizeText(input)) === resolve(normalizeText(problem.answer))
}

export function checkLewisProblem(input: string, problem: LewisProblem): boolean {
  return checkTextOrNumeric(input, problem)
}

export function checkVseprProblem(input: string, problem: VseprProblem): boolean {
  return checkTextOrNumeric(input, problem)
}

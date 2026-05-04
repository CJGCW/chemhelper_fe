// Core type system for the reaction mechanism page.
// Pure TypeScript — no React imports.

export type MechanismCategory =
  | 'sn_e'
  | 'alkene'
  | 'alkyne'
  | 'aromatic'
  | 'radical'
  | 'alcohol'
  | 'ether_epoxide'
  | 'organometallic'
  | 'carbonyl'
  | 'enolate'
  | 'carboxylic'
  | 'amine'
  | 'oxidation_reduction'
  | 'pericyclic'

export const CATEGORY_LABELS: Record<MechanismCategory, string> = {
  sn_e:                'SN / E Reactions',
  alkene:              'Alkene Reactions',
  alkyne:              'Alkyne Reactions',
  aromatic:            'Aromatic Reactions',
  radical:             'Radical Reactions',
  alcohol:             'Alcohol Reactions',
  ether_epoxide:       'Ethers & Epoxides',
  organometallic:      'Organometallic Reactions',
  carbonyl:            'Carbonyl Reactions',
  enolate:             'Enolate Chemistry',
  carboxylic:          'Carboxylic Acid Derivatives',
  amine:               'Amine Reactions',
  oxidation_reduction: 'Oxidation / Reduction',
  pericyclic:          'Pericyclic Reactions',
}

export const CATEGORY_ORDER: MechanismCategory[] = [
  'sn_e',
  'alkene',
  'alkyne',
  'aromatic',
  'alcohol',
  'ether_epoxide',
  'carbonyl',
  'enolate',
  'carboxylic',
  'organometallic',
  'radical',
  'amine',
  'oxidation_reduction',
  'pericyclic',
]

export type Regiochemistry = 'markovnikov' | 'anti-markovnikov' | null
export type Stereochemistry = 'syn' | 'anti' | 'inversion' | 'retention' | 'racemization' | null
export type ReactionType =
  | 'addition'
  | 'elimination'
  | 'substitution'
  | 'rearrangement'
  | 'oxidation'
  | 'reduction'
  | 'condensation'
  | 'pericyclic'
  | 'eas'
  | 'radical'

// ── Animation primitives ───────────────────────────────────────────────────────

export type AnimPrimitiveType =
  | 'curved_arrow'       // electron pair movement — core of arrow-pushing
  | 'single_arrow'       // single-electron movement for radicals
  | 'bond_break'
  | 'bond_form'
  | 'bond_order_change'  // downgrade/upgrade bond order without breaking it (targetId=bondId, text=new order as string)
  | 'atom_translate'
  | 'charge_appear'
  | 'charge_disappear'
  | 'intermediate_glow'
  | 'fragment_separate'
  | 'step_label'
  | 'highlight_region'
  | 'fade_in'
  | 'fade_out'
  | 'atom_relabel'        // change atom symbol in committed state (e.g. H₂O → OH after bonding)
  | 'bond_style_change'   // change a bond's style (targetId=bondId, text=new style)
  | 'invert_stereocenter' // SN2 Walden inversion: flip all wedge↔dash-wedge on bonds of targetId atom

export interface AnimPrimitive {
  type: AnimPrimitiveType
  from?: { x: number; y: number }
  to?: { x: number; y: number }
  control?: { x: number; y: number }
  targetId?: string
  text?: string
  duration?: number
  delay?: number
  color?: string
}

export interface MechanismStep {
  step: number
  label: string
  description: string
  animations: AnimPrimitive[]
}

// ── Molecule scene (SVG layout) ────────────────────────────────────────────────

export type AtomRole =
  | 'nucleophile' | 'electrophile' | 'leaving_group' | 'base' | 'acid'
  | 'alpha_carbon' | 'beta_carbon' | 'carbonyl_carbon' | 'carbonyl_oxygen'
  | 'more_substituted' | 'less_substituted'
  | 'ipso' | 'ortho' | 'meta' | 'para'
  | 'pro_r' | 'pro_s'
  | 'r_group' | 'h_substituent'

export interface AtomPosition {
  id: string
  symbol: string
  x: number
  y: number
  charge?: string
  label?: string
  role?: AtomRole
  stereochem?: 'R' | 'S' | null
  glow?: boolean
}

export interface BondPosition {
  id: string
  from: string
  to: string
  order: 1 | 2 | 3
  style?: 'solid' | 'dashed' | 'wedge' | 'dash-wedge'
}

export interface MoleculeScene {
  atoms: AtomPosition[]
  bonds: BondPosition[]
  width: number
  height: number
}

export interface EnergyPoint {
  label: string
  energy: number
  isTransitionState?: boolean
}

// ── Frame-based mechanism model ────────────────────────────────────────────────

export type ArrowAnchor =
  | { kind: 'atom'; id: string }
  | { kind: 'bond'; id: string }
  | { kind: 'lonePair'; atomId: string; angleDeg: number }

export interface CurvedArrowOverlay {
  from: ArrowAnchor
  to: ArrowAnchor
  style?: 'curved' | 'fishhook'
  color?: string
  bow?: number
}

export interface MechanismFrame {
  atoms: AtomPosition[]
  bonds: BondPosition[]
  arrows: CurvedArrowOverlay[]
  caption?: string
  description: string
  shortLabel: string
}

// ── Main reaction definition ───────────────────────────────────────────────────

export interface ReactionDef {
  id: string
  category: MechanismCategory
  name: string
  summary: string
  reactants: string
  products: string
  conditions: string
  reactionType: ReactionType
  regiochemistry: Regiochemistry
  stereochemistry: Stereochemistry
  intermediate: string | null
  importantInfo: string[]
  brownRef: string
  relatedReactions: string[]
  tags: string[]
  // Frame-based model (new)
  frames?: MechanismFrame[]
  // Legacy animation model (snE.ts still uses these)
  scene?: MoleculeScene
  steps?: MechanismStep[]
  energyDiagram: EnergyPoint[]
  positionDirector?: 'ortho_para' | 'meta' | null
  activatingEffect?: 'strong_activator' | 'weak_activator' | 'weak_deactivator' | 'strong_deactivator' | null
  rearrangementPossible?: boolean
  reversible?: boolean
}

// Lightweight summary without heavy scene/steps/energyDiagram payloads
export type ReactionSummary = Omit<ReactionDef, 'scene' | 'steps' | 'energyDiagram' | 'frames'>

// ── Filter state ───────────────────────────────────────────────────────────────

export interface MechanismFilter {
  category: MechanismCategory | 'all'
  search: string
  reactionType: ReactionType | 'all'
  regiochemistry: Regiochemistry | 'all'
  stereochemistry: Stereochemistry | 'all'
}

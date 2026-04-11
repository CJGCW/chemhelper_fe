import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Compound data ─────────────────────────────────────────────────────────────

type CompoundRole = 'strong_acid' | 'weak_acid' | 'strong_base' | 'weak_base'
  | 'carbonate' | 'bicarbonate' | 'sulfide' | 'sulfite' | 'ammonium_salt'
  | 'ionic' | 'metal' | 'metal_oxide' | 'nonmetal_oxide' | 'peroxide'

interface Compound {
  id: string
  formula: string
  name: string
  role: CompoundRole
  charge?: number       // for ionic: net charge context
  cation?: string
  anion?: string
  soluble?: boolean
}

const COMPOUNDS: Compound[] = [
  // Strong acids
  { id: 'HCl',   formula: 'HCl',   name: 'Hydrochloric acid',  role: 'strong_acid' },
  { id: 'HBr',   formula: 'HBr',   name: 'Hydrobromic acid',   role: 'strong_acid' },
  { id: 'HI',    formula: 'HI',    name: 'Hydroiodic acid',    role: 'strong_acid' },
  { id: 'HNO3',  formula: 'HNO₃',  name: 'Nitric acid',        role: 'strong_acid' },
  { id: 'H2SO4', formula: 'H₂SO₄', name: 'Sulfuric acid',      role: 'strong_acid' },
  { id: 'HClO4', formula: 'HClO₄', name: 'Perchloric acid',    role: 'strong_acid' },
  // Weak acids
  { id: 'HF',    formula: 'HF',    name: 'Hydrofluoric acid',  role: 'weak_acid' },
  { id: 'CH3COOH', formula: 'CH₃COOH', name: 'Acetic acid',   role: 'weak_acid' },
  { id: 'H2CO3', formula: 'H₂CO₃', name: 'Carbonic acid',     role: 'weak_acid' },
  { id: 'H3PO4', formula: 'H₃PO₄', name: 'Phosphoric acid',   role: 'weak_acid' },
  { id: 'HCN',   formula: 'HCN',   name: 'Hydrocyanic acid',  role: 'weak_acid' },
  // Strong bases
  { id: 'NaOH',  formula: 'NaOH',  name: 'Sodium hydroxide',  role: 'strong_base', cation: 'Na', anion: 'OH' },
  { id: 'KOH',   formula: 'KOH',   name: 'Potassium hydroxide', role: 'strong_base', cation: 'K', anion: 'OH' },
  { id: 'Ca(OH)2', formula: 'Ca(OH)₂', name: 'Calcium hydroxide', role: 'strong_base', cation: 'Ca', anion: 'OH' },
  { id: 'Ba(OH)2', formula: 'Ba(OH)₂', name: 'Barium hydroxide',  role: 'strong_base', cation: 'Ba', anion: 'OH' },
  // Weak bases
  { id: 'NH3',   formula: 'NH₃',   name: 'Ammonia',            role: 'weak_base' },
  { id: 'NH4OH', formula: 'NH₄OH', name: 'Ammonium hydroxide', role: 'weak_base' },
  // Carbonates
  { id: 'Na2CO3',  formula: 'Na₂CO₃',  name: 'Sodium carbonate',    role: 'carbonate', cation: 'Na', anion: 'CO3', soluble: true },
  { id: 'K2CO3',   formula: 'K₂CO₃',   name: 'Potassium carbonate', role: 'carbonate', cation: 'K',  anion: 'CO3', soluble: true },
  { id: 'CaCO3',   formula: 'CaCO₃',   name: 'Calcium carbonate',   role: 'carbonate', cation: 'Ca', anion: 'CO3', soluble: false },
  { id: 'BaCO3',   formula: 'BaCO₃',   name: 'Barium carbonate',    role: 'carbonate', cation: 'Ba', anion: 'CO3', soluble: false },
  // Bicarbonates
  { id: 'NaHCO3',  formula: 'NaHCO₃',  name: 'Sodium bicarbonate',  role: 'bicarbonate', cation: 'Na', anion: 'HCO3', soluble: true },
  { id: 'KHCO3',   formula: 'KHCO₃',   name: 'Potassium bicarbonate', role: 'bicarbonate', cation: 'K', anion: 'HCO3', soluble: true },
  // Sulfides
  { id: 'Na2S',    formula: 'Na₂S',    name: 'Sodium sulfide',    role: 'sulfide', cation: 'Na', soluble: true },
  { id: 'FeS',     formula: 'FeS',     name: 'Iron(II) sulfide',  role: 'sulfide', cation: 'Fe', soluble: false },
  // Sulfites
  { id: 'Na2SO3',  formula: 'Na₂SO₃',  name: 'Sodium sulfite',   role: 'sulfite', cation: 'Na', soluble: true },
  { id: 'K2SO3',   formula: 'K₂SO₃',   name: 'Potassium sulfite',role: 'sulfite', cation: 'K',  soluble: true },
  // Ammonium salts
  { id: 'NH4Cl',   formula: 'NH₄Cl',   name: 'Ammonium chloride',  role: 'ammonium_salt', anion: 'Cl' },
  { id: 'NH4NO3',  formula: 'NH₄NO₃',  name: 'Ammonium nitrate',   role: 'ammonium_salt', anion: 'NO3' },
  { id: 'NH4OAc',  formula: 'NH₄OAc',  name: 'Ammonium acetate',   role: 'ammonium_salt', anion: 'OAc' },
  // Soluble ionic (produce precipitates with other ions)
  { id: 'AgNO3',   formula: 'AgNO₃',   name: 'Silver nitrate',     role: 'ionic', cation: 'Ag',  anion: 'NO3',  soluble: true },
  { id: 'Pb(NO3)2',formula: 'Pb(NO₃)₂',name: 'Lead(II) nitrate',  role: 'ionic', cation: 'Pb',  anion: 'NO3',  soluble: true },
  { id: 'BaCl2',   formula: 'BaCl₂',   name: 'Barium chloride',    role: 'ionic', cation: 'Ba',  anion: 'Cl',   soluble: true },
  { id: 'CaCl2',   formula: 'CaCl₂',   name: 'Calcium chloride',   role: 'ionic', cation: 'Ca',  anion: 'Cl',   soluble: true },
  { id: 'FeCl3',   formula: 'FeCl₃',   name: 'Iron(III) chloride', role: 'ionic', cation: 'Fe3', anion: 'Cl',   soluble: true },
  { id: 'CuSO4',   formula: 'CuSO₄',   name: 'Copper(II) sulfate', role: 'ionic', cation: 'Cu',  anion: 'SO4',  soluble: true },
  { id: 'Na2SO4',  formula: 'Na₂SO₄',  name: 'Sodium sulfate',     role: 'ionic', cation: 'Na',  anion: 'SO4',  soluble: true },
  { id: 'NaCl',    formula: 'NaCl',    name: 'Sodium chloride',    role: 'ionic', cation: 'Na',  anion: 'Cl',   soluble: true },
  { id: 'KNO3',    formula: 'KNO₃',    name: 'Potassium nitrate',  role: 'ionic', cation: 'K',   anion: 'NO3',  soluble: true },
  { id: 'Na3PO4',  formula: 'Na₃PO₄',  name: 'Sodium phosphate',   role: 'ionic', cation: 'Na',  anion: 'PO4',  soluble: true },
  // Metals
  { id: 'Na_m',  formula: 'Na',  name: 'Sodium (metal)',  role: 'metal' },
  { id: 'K_m',   formula: 'K',   name: 'Potassium (metal)', role: 'metal' },
  { id: 'Ca_m',  formula: 'Ca',  name: 'Calcium (metal)', role: 'metal' },
  { id: 'Mg_m',  formula: 'Mg',  name: 'Magnesium (metal)', role: 'metal' },
  { id: 'Zn_m',  formula: 'Zn',  name: 'Zinc (metal)',   role: 'metal' },
  { id: 'Fe_m',  formula: 'Fe',  name: 'Iron (metal)',   role: 'metal' },
  { id: 'Cu_m',  formula: 'Cu',  name: 'Copper (metal)', role: 'metal' },
  // Special
  { id: 'H2O',   formula: 'H₂O', name: 'Water',          role: 'weak_base' },
  { id: 'H2O2',  formula: 'H₂O₂', name: 'Hydrogen peroxide', role: 'peroxide' },
]

// ── Groups for the picker ─────────────────────────────────────────────────────

const GROUPS: { label: string; roles: CompoundRole[] }[] = [
  { label: 'Strong Acids',   roles: ['strong_acid'] },
  { label: 'Weak Acids',     roles: ['weak_acid'] },
  { label: 'Strong Bases',   roles: ['strong_base'] },
  { label: 'Weak Bases',     roles: ['weak_base'] },
  { label: 'Carbonates',     roles: ['carbonate', 'bicarbonate'] },
  { label: 'Sulfides/Sulfites', roles: ['sulfide', 'sulfite'] },
  { label: 'Ammonium Salts', roles: ['ammonium_salt'] },
  { label: 'Ionic Salts',    roles: ['ionic'] },
  { label: 'Metals',         roles: ['metal'] },
]

// ── Precipitation lookup (simplified solubility rules) ────────────────────────

// Returns true if cation + anion combination is insoluble
const INSOLUBLE: Record<string, string[]> = {
  Ag:  ['Cl', 'Br', 'I', 'SO4', 'CO3', 'PO4', 'S'],
  Pb:  ['Cl', 'Br', 'I', 'SO4', 'CO3', 'PO4', 'S'],
  Ba:  ['SO4', 'CO3', 'PO4'],
  Ca:  ['SO4', 'CO3', 'PO4'],
  Fe:  ['OH', 'CO3', 'S', 'PO4'],
  Fe3: ['OH', 'PO4'],
  Cu:  ['OH', 'S', 'CO3'],
  Zn:  ['OH', 'S', 'CO3'],
  Mn:  ['OH', 'S', 'CO3'],
  Ni:  ['OH', 'S'],
}

function willPrecipitate(cat: string, ani: string): boolean {
  return !!(INSOLUBLE[cat]?.includes(ani))
}

// ── Classification logic ──────────────────────────────────────────────────────

type ReactionType = 'precipitation' | 'acid_base' | 'gas_forming' | 'redox' | 'no_reaction' | 'unknown'

interface ReactionResult {
  type: ReactionType
  subtype?: string
  products: { formula: string; state: string; label?: string }[]
  explanation: string
  equation?: string
}

const isAcid = (r: CompoundRole) => r === 'strong_acid' || r === 'weak_acid'
const isBase = (r: CompoundRole) => r === 'strong_base' || r === 'weak_base'

function classify(a: Compound, b: Compound): ReactionResult {
  const roles = [a.role, b.role]

  // Gas-forming: acid + carbonate → CO₂
  if (isAcid(a.role) && (b.role === 'carbonate' || b.role === 'bicarbonate') ||
      isAcid(b.role) && (a.role === 'carbonate' || a.role === 'bicarbonate')) {
    const acid = isAcid(a.role) ? a : b
    const salt = isAcid(a.role) ? b : a
    const gas = salt.role === 'bicarbonate' ? 'CO₂' : 'CO₂'
    return {
      type: 'gas_forming',
      subtype: 'Acid + Carbonate → CO₂',
      products: [
        { formula: 'CO₂', state: 'g', label: 'carbon dioxide' },
        { formula: 'H₂O', state: 'l' },
        { formula: salt.cation ? `${salt.cation}⁺ salt` : 'salt', state: 'aq' },
      ],
      explanation: `${acid.formula} donates H⁺ to the carbonate ion. The carbonic acid (H₂CO₃) formed immediately decomposes: H₂CO₃ → H₂O(l) + CO₂(g). Bubbling/effervescence is observed.`,
      equation: `${acid.formula} + ${salt.formula} → CO₂(g) + H₂O(l) + salt(aq)`,
    }
  }

  // Gas-forming: acid + sulfide → H₂S
  if (isAcid(a.role) && b.role === 'sulfide' || isAcid(b.role) && a.role === 'sulfide') {
    const acid = isAcid(a.role) ? a : b
    const salt = isAcid(a.role) ? b : a
    return {
      type: 'gas_forming',
      subtype: 'Acid + Sulfide → H₂S',
      products: [
        { formula: 'H₂S', state: 'g', label: 'hydrogen sulfide' },
        { formula: salt.cation ? `${salt.cation} salt` : 'salt', state: 'aq' },
      ],
      explanation: `${acid.formula} reacts with the sulfide ion (S²⁻) to produce hydrogen sulfide gas, which has a characteristic "rotten egg" smell.`,
      equation: `${acid.formula} + ${salt.formula} → H₂S(g) + salt(aq)`,
    }
  }

  // Gas-forming: acid + sulfite → SO₂
  if (isAcid(a.role) && b.role === 'sulfite' || isAcid(b.role) && a.role === 'sulfite') {
    const acid = isAcid(a.role) ? a : b
    const salt = isAcid(a.role) ? b : a
    return {
      type: 'gas_forming',
      subtype: 'Acid + Sulfite → SO₂',
      products: [
        { formula: 'SO₂', state: 'g', label: 'sulfur dioxide' },
        { formula: 'H₂O', state: 'l' },
        { formula: salt.cation ? `${salt.cation} salt` : 'salt', state: 'aq' },
      ],
      explanation: `${acid.formula} reacts with the sulfite ion (SO₃²⁻). Sulfurous acid (H₂SO₃) forms and immediately decomposes to SO₂(g) + H₂O(l). A pungent odor is observed.`,
      equation: `${acid.formula} + ${salt.formula} → SO₂(g) + H₂O(l) + salt(aq)`,
    }
  }

  // Gas-forming: strong base + ammonium salt → NH₃
  if ((isBase(a.role) && b.role === 'ammonium_salt') ||
      (isBase(b.role) && a.role === 'ammonium_salt')) {
    const base = isBase(a.role) ? a : b
    const salt = isBase(a.role) ? b : a
    return {
      type: 'gas_forming',
      subtype: 'Base + Ammonium Salt → NH₃',
      products: [
        { formula: 'NH₃', state: 'g', label: 'ammonia' },
        { formula: 'H₂O', state: 'l' },
        { formula: base.cation ? `${base.cation} salt` : 'salt', state: 'aq' },
      ],
      explanation: `The hydroxide ion from ${base.formula} deprotonates ammonium (NH₄⁺): OH⁻ + NH₄⁺ → NH₃(g) + H₂O(l). Ammonia gas is released (pungent smell, turns moist red litmus blue).`,
      equation: `${base.formula} + ${salt.formula} → NH₃(g) + H₂O(l) + salt(aq)`,
    }
  }

  // Acid-base neutralization
  if ((isAcid(a.role) && isBase(b.role)) || (isBase(a.role) && isAcid(b.role))) {
    const acid = isAcid(a.role) ? a : b
    const base = isAcid(a.role) ? b : a
    const acidStrength = acid.role === 'strong_acid' ? 'strong' : 'weak'
    const baseStrength = base.role === 'strong_base' ? 'strong' : 'weak'
    const subtype = `${acidStrength.charAt(0).toUpperCase() + acidStrength.slice(1)} acid + ${baseStrength} base`
    const saltFormula = base.cation ? `${base.cation} salt` : 'salt'
    return {
      type: 'acid_base',
      subtype,
      products: [
        { formula: 'H₂O', state: 'l' },
        { formula: saltFormula, state: 'aq' },
      ],
      explanation: `H⁺ from ${acid.formula} combines with OH⁻ from ${base.formula} to form water. ${
        acidStrength === 'strong' && baseStrength === 'strong'
          ? 'Both completely dissociate — the net ionic equation is simply H⁺(aq) + OH⁻(aq) → H₂O(l). The resulting solution is neutral (pH ≈ 7).'
          : acidStrength === 'weak' && baseStrength === 'strong'
          ? 'The strong base fully dissociates; the weak acid only partially. The resulting solution is basic (pH > 7) due to the conjugate base.'
          : acidStrength === 'strong' && baseStrength === 'weak'
          ? 'The strong acid fully dissociates; the weak base only partially. The resulting solution is acidic (pH < 7) due to the conjugate acid.'
          : 'Both are weak — equilibrium lies toward reactants. The resulting pH depends on the relative Ka/Kb values.'
      }`,
      equation: `${acid.formula} + ${base.formula} → H₂O(l) + ${saltFormula}(aq)`,
    }
  }

  // Redox: metal + acid → hydrogen gas
  if ((a.role === 'metal' && isAcid(b.role)) || (b.role === 'metal' && isAcid(a.role))) {
    const metal = a.role === 'metal' ? a : b
    const acid  = a.role === 'metal' ? b : a
    return {
      type: 'redox',
      subtype: 'Metal + Acid → H₂',
      products: [
        { formula: 'H₂', state: 'g', label: 'hydrogen gas' },
        { formula: `${metal.formula} salt`, state: 'aq' },
      ],
      explanation: `${metal.formula} is oxidized (loses e⁻, oxidation state increases) while H⁺ from ${acid.formula} is reduced (gains e⁻, 2H⁺ + 2e⁻ → H₂). Only metals above hydrogen on the activity series react. Bubbling is observed.`,
      equation: `${metal.formula}(s) + ${acid.formula}(aq) → ${metal.formula}-salt(aq) + H₂(g)`,
    }
  }

  // Redox: metal + water
  if ((a.role === 'metal' && b.id === 'H2O') || (b.role === 'metal' && a.id === 'H2O')) {
    const metal = a.role === 'metal' ? a : b
    const activeMetals = ['Na_m', 'K_m', 'Ca_m']
    if (activeMetals.includes(metal.id)) {
      return {
        type: 'redox',
        subtype: 'Active Metal + Water',
        products: [
          { formula: `${metal.formula}OH`, state: 'aq', label: 'metal hydroxide' },
          { formula: 'H₂', state: 'g' },
        ],
        explanation: `${metal.formula} is a very active metal that reacts vigorously with water. The metal is oxidized (0 → +1/+2) and water is reduced (H⁺ → H₂). The reaction produces a strongly basic solution.`,
        equation: `2${metal.formula}(s) + 2H₂O(l) → 2${metal.formula}OH(aq) + H₂(g)`,
      }
    }
    return {
      type: 'no_reaction',
      products: [],
      explanation: `${metal.formula} does not react with water under normal conditions. Only very active metals (Na, K, Ca, etc.) react with water at room temperature.`,
    }
  }

  // Precipitation: two ionic solutions
  const ionicRoles: CompoundRole[] = ['ionic', 'strong_base', 'carbonate', 'bicarbonate', 'ammonium_salt']
  if (ionicRoles.includes(a.role) && ionicRoles.includes(b.role)) {
    const catA = a.cation, anA = a.anion
    const catB = b.cation, anB = b.anion
    const pairs: { cat: string; ani: string; from: string }[] = []
    if (catA && anB) pairs.push({ cat: catA, ani: anB, from: `${a.name} cation + ${b.name} anion` })
    if (catB && anA) pairs.push({ cat: catB, ani: anA, from: `${b.name} cation + ${a.name} anion` })

    const precipPairs = pairs.filter(p => willPrecipitate(p.cat, p.ani))

    if (precipPairs.length > 0) {
      const pp = precipPairs[0]
      return {
        type: 'precipitation',
        subtype: 'Double Displacement',
        products: [
          { formula: `${pp.cat}–${pp.ani} compound`, state: 's', label: 'precipitate' },
          { formula: 'spectator ions', state: 'aq' },
        ],
        explanation: `When ${a.formula} and ${b.formula} are mixed, ${pp.from} forms an insoluble compound that precipitates out of solution. The driving force is the removal of ions from solution as an insoluble solid.`,
        equation: `${a.formula}(aq) + ${b.formula}(aq) → ${pp.cat}${pp.ani} precipitate(s) + soluble salt(aq)`,
      }
    }

    if (catA && anB && catB && anA) {
      return {
        type: 'no_reaction',
        products: [],
        explanation: `Mixing ${a.formula} and ${b.formula} produces no precipitate — all possible ion combinations (${catA}+${anB} and ${catB}+${anA}) remain soluble. No driving force exists for a reaction.`,
      }
    }
  }

  return {
    type: 'unknown',
    products: [],
    explanation: 'This combination does not match a common reaction pattern in this classifier. Check compound types or consider redox activity series.',
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<ReactionType, string> = {
  precipitation: '#60a5fa',   // blue
  acid_base:     '#4ade80',   // green
  gas_forming:   '#fbbf24',   // amber
  redox:         '#f472b6',   // pink
  no_reaction:   '#6b7280',   // gray
  unknown:       '#9ca3af',
}

const TYPE_LABEL: Record<ReactionType, string> = {
  precipitation: 'Precipitation',
  acid_base:     'Acid-Base Neutralization',
  gas_forming:   'Gas-Forming',
  redox:         'Redox (Oxidation-Reduction)',
  no_reaction:   'No Reaction',
  unknown:       'Unknown / Not Classified',
}

const STATE_LABEL: Record<string, string> = { s: 'solid', l: 'liquid', g: 'gas', aq: 'aqueous' }

// ── Compound picker ───────────────────────────────────────────────────────────

function CompoundPicker({ label, selected, other, onSelect }: {
  label: string
  selected: Compound | null
  other: Compound | null
  onSelect: (c: Compound) => void
}) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
      {GROUPS.map(group => {
        const items = COMPOUNDS.filter(c => group.roles.includes(c.role))
        return (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-dim">{group.label}</span>
            <div className="flex flex-wrap gap-1">
              {items.map(c => {
                const isSelected = selected?.id === c.id
                const unclassified = other && classify(c, other).type === 'unknown'
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c)}
                    title={c.name}
                    className="px-2 py-1 rounded-sm font-mono text-xs transition-colors"
                    style={isSelected ? {
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    } : unclassified ? {
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.18)',
                    } : {
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {c.formula}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReactionClassifier() {
  const [reactantA, setReactantA] = useState<Compound | null>(null)
  const [reactantB, setReactantB] = useState<Compound | null>(null)
  const [result, setResult] = useState<ReactionResult | null>(null)

  function handleClassify() {
    if (!reactantA || !reactantB) return
    setResult(classify(reactantA, reactantB))
  }

  function handleReset() {
    setReactantA(null)
    setReactantB(null)
    setResult(null)
  }

  const color = result ? TYPE_COLOR[result.type] : 'var(--c-halogen)'

  return (
    <div className="flex flex-col gap-8 max-w-4xl">

      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-semibold text-bright text-xl">Reaction Type Classifier</h2>
        <p className="font-sans text-sm text-secondary">
          Select two reactants to predict the reaction type and likely products.
        </p>
      </div>

      {/* Pickers */}
      <div className="flex flex-col lg:flex-row gap-6">
        <CompoundPicker label="Reactant A" selected={reactantA} other={reactantB} onSelect={c => { setReactantA(c); setResult(null) }} />

        {/* VS divider */}
        <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0">
          <div className="hidden lg:block w-px h-full bg-border" />
          <span className="font-mono text-xs text-dim px-2">+</span>
          <div className="hidden lg:block w-px h-full bg-border" />
        </div>

        <CompoundPicker label="Reactant B" selected={reactantB} other={reactantA} onSelect={c => { setReactantB(c); setResult(null) }} />
      </div>

      {/* Selected summary + classify button */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-sm border border-border bg-surface">
        <span className="font-mono text-sm" style={{ color: reactantA ? 'var(--c-halogen)' : 'rgba(255,255,255,0.25)' }}>
          {reactantA ? reactantA.formula : '—'}
        </span>
        <span className="font-mono text-sm text-dim">+</span>
        <span className="font-mono text-sm" style={{ color: reactantB ? 'var(--c-halogen)' : 'rgba(255,255,255,0.25)' }}>
          {reactantB ? reactantB.formula : '—'}
        </span>
        <span className="font-mono text-sm text-dim">→</span>
        <span className="font-mono text-sm text-dim">?</span>

        <div className="flex gap-2 ml-auto">
          {(reactantA || reactantB) && (
            <button onClick={handleReset}
              className="px-3 py-1.5 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
              Clear
            </button>
          )}
          <button
            onClick={handleClassify}
            disabled={!reactantA || !reactantB}
            className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >
            Classify →
          </button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={`${reactantA?.id}-${reactantB?.id}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 rounded-sm border bg-surface p-5"
            style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
          >
            {/* Type badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-sm font-mono text-sm font-semibold"
                style={{
                  background: `color-mix(in srgb, ${color} 15%, #141620)`,
                  border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                  color,
                }}>
                {TYPE_LABEL[result.type]}
              </span>
              {result.subtype && (
                <span className="font-mono text-xs text-dim">{result.subtype}</span>
              )}
            </div>

            {/* Equation */}
            {result.equation && (
              <div className="font-mono text-sm rounded-sm border border-border bg-raised px-4 py-3"
                style={{ color: 'rgba(255,255,255,0.75)' }}>
                {result.equation}
              </div>
            )}

            {/* Products */}
            {result.products.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Products</span>
                <div className="flex flex-wrap gap-2">
                  {result.products.map((p, i) => (
                    <div key={i} className="flex items-baseline gap-1 px-3 py-1.5 rounded-sm border border-border bg-raised">
                      <span className="font-mono text-sm text-bright">{p.formula}</span>
                      <span className="font-mono text-[10px] text-dim">({p.state})</span>
                      {p.label && <span className="font-sans text-xs text-secondary ml-1">— {p.label}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Explanation</span>
              <p className="font-sans text-sm text-primary leading-relaxed">{result.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-[10px] text-dim">
        Simplified classifier based on common reaction patterns. Activity series and full solubility rules apply.
      </p>
    </div>
  )
}

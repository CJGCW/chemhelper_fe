import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type ElectrolyteCategory =
  | 'strong_acid' | 'weak_acid'
  | 'strong_base' | 'weak_base'
  | 'soluble_ionic' | 'sparingly_soluble' | 'insoluble'
  | 'nonelectrolyte'

type ElectrolyteStrength = 'strong' | 'weak' | 'non'

interface Ion {
  formula: string   // display with Unicode superscripts
  name: string
  coeff: number     // stoichiometric coefficient per formula unit
}

interface ElectrolyteCompound {
  id: string
  formula: string
  name: string
  category: ElectrolyteCategory
  ions: Ion[]
  equation: string          // dissociation/ionization equation
  ionizationPct: number     // 0–100 for bar display
  ionizationLabel: string   // e.g. "~100 %", "< 5 %", "~0 %"
  Ka?: string
  Kb?: string
  note?: string
}

// ── Compound data ─────────────────────────────────────────────────────────────

const COMPOUNDS: ElectrolyteCompound[] = [

  // ── Strong acids ────────────────────────────────────────────────────────────
  {
    id: 'HCl', formula: 'HCl', name: 'Hydrochloric acid', category: 'strong_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 1 }],
    equation: 'HCl(aq) → H⁺(aq) + Cl⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'HBr', formula: 'HBr', name: 'Hydrobromic acid', category: 'strong_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'Br⁻', name: 'bromide', coeff: 1 }],
    equation: 'HBr(aq) → H⁺(aq) + Br⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'HI', formula: 'HI', name: 'Hydroiodic acid', category: 'strong_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'I⁻', name: 'iodide', coeff: 1 }],
    equation: 'HI(aq) → H⁺(aq) + I⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'HNO3', formula: 'HNO₃', name: 'Nitric acid', category: 'strong_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'NO₃⁻', name: 'nitrate', coeff: 1 }],
    equation: 'HNO₃(aq) → H⁺(aq) + NO₃⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'H2SO4', formula: 'H₂SO₄', name: 'Sulfuric acid', category: 'strong_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 2 }, { formula: 'SO₄²⁻', name: 'sulfate', coeff: 1 }],
    equation: 'H₂SO₄(aq) → 2H⁺(aq) + SO₄²⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 % (1st step)',
    note: 'Diprotic. First dissociation is complete; second step (HSO₄⁻ ⇌ H⁺ + SO₄²⁻) is strong but not complete (Ka₂ ≈ 0.012).',
  },
  {
    id: 'HClO4', formula: 'HClO₄', name: 'Perchloric acid', category: 'strong_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'ClO₄⁻', name: 'perchlorate', coeff: 1 }],
    equation: 'HClO₄(aq) → H⁺(aq) + ClO₄⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
    note: 'One of the strongest known acids.',
  },

  // ── Weak acids ──────────────────────────────────────────────────────────────
  {
    id: 'HF', formula: 'HF', name: 'Hydrofluoric acid', category: 'weak_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'F⁻', name: 'fluoride', coeff: 1 }],
    equation: 'HF(aq) ⇌ H⁺(aq) + F⁻(aq)',
    ionizationPct: 8, ionizationLabel: '< 10 % (0.1 M)',
    Ka: '6.8 × 10⁻⁴',
  },
  {
    id: 'CH3COOH', formula: 'CH₃COOH', name: 'Acetic acid', category: 'weak_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'CH₃COO⁻', name: 'acetate', coeff: 1 }],
    equation: 'CH₃COOH(aq) ⇌ H⁺(aq) + CH₃COO⁻(aq)',
    ionizationPct: 1, ionizationLabel: '~1.3 % (0.1 M)',
    Ka: '1.8 × 10⁻⁵',
  },
  {
    id: 'HNO2', formula: 'HNO₂', name: 'Nitrous acid', category: 'weak_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'NO₂⁻', name: 'nitrite', coeff: 1 }],
    equation: 'HNO₂(aq) ⇌ H⁺(aq) + NO₂⁻(aq)',
    ionizationPct: 4, ionizationLabel: '~4 % (0.1 M)',
    Ka: '4.5 × 10⁻⁴',
  },
  {
    id: 'H3PO4', formula: 'H₃PO₄', name: 'Phosphoric acid', category: 'weak_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'H₂PO₄⁻', name: 'dihydrogen phosphate', coeff: 1 }],
    equation: 'H₃PO₄(aq) ⇌ H⁺(aq) + H₂PO₄⁻(aq)',
    ionizationPct: 3, ionizationLabel: '~3 % (0.1 M, 1st step)',
    Ka: 'Ka₁ = 7.5 × 10⁻³',
    note: 'Triprotic. Only the first ionization is significant at typical concentrations.',
  },
  {
    id: 'HCN', formula: 'HCN', name: 'Hydrocyanic acid', category: 'weak_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'CN⁻', name: 'cyanide', coeff: 1 }],
    equation: 'HCN(aq) ⇌ H⁺(aq) + CN⁻(aq)',
    ionizationPct: 0.5, ionizationLabel: '< 1 % (0.1 M)',
    Ka: '6.2 × 10⁻¹⁰',
  },
  {
    id: 'H2CO3', formula: 'H₂CO₃', name: 'Carbonic acid', category: 'weak_acid',
    ions: [{ formula: 'H⁺', name: 'hydrogen ion', coeff: 1 }, { formula: 'HCO₃⁻', name: 'bicarbonate', coeff: 1 }],
    equation: 'H₂CO₃(aq) ⇌ H⁺(aq) + HCO₃⁻(aq)',
    ionizationPct: 0.2, ionizationLabel: '< 1 % (0.1 M, 1st step)',
    Ka: 'Ka₁ = 4.3 × 10⁻⁷',
    note: 'Formed when CO₂ dissolves in water. Diprotic; second ionization (Ka₂ = 4.7 × 10⁻¹¹) is negligible.',
  },

  // ── Strong bases ────────────────────────────────────────────────────────────
  {
    id: 'NaOH', formula: 'NaOH', name: 'Sodium hydroxide', category: 'strong_base',
    ions: [{ formula: 'Na⁺', name: 'sodium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 1 }],
    equation: 'NaOH(aq) → Na⁺(aq) + OH⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'KOH', formula: 'KOH', name: 'Potassium hydroxide', category: 'strong_base',
    ions: [{ formula: 'K⁺', name: 'potassium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 1 }],
    equation: 'KOH(aq) → K⁺(aq) + OH⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'Ca(OH)2', formula: 'Ca(OH)₂', name: 'Calcium hydroxide', category: 'strong_base',
    ions: [{ formula: 'Ca²⁺', name: 'calcium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 2 }],
    equation: 'Ca(OH)₂(aq) → Ca²⁺(aq) + 2OH⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
    note: 'Sparingly soluble (Ksp = 4.7 × 10⁻⁶), but what does dissolve fully dissociates.',
  },
  {
    id: 'Ba(OH)2', formula: 'Ba(OH)₂', name: 'Barium hydroxide', category: 'strong_base',
    ions: [{ formula: 'Ba²⁺', name: 'barium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 2 }],
    equation: 'Ba(OH)₂(aq) → Ba²⁺(aq) + 2OH⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'LiOH', formula: 'LiOH', name: 'Lithium hydroxide', category: 'strong_base',
    ions: [{ formula: 'Li⁺', name: 'lithium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 1 }],
    equation: 'LiOH(aq) → Li⁺(aq) + OH⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },

  // ── Weak bases ──────────────────────────────────────────────────────────────
  {
    id: 'NH3', formula: 'NH₃', name: 'Ammonia', category: 'weak_base',
    ions: [{ formula: 'NH₄⁺', name: 'ammonium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 1 }],
    equation: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
    ionizationPct: 1, ionizationLabel: '~1.3 % (0.1 M)',
    Kb: '1.8 × 10⁻⁵',
    note: 'Reacts with water as a Brønsted-Lowry base; does not fully dissociate.',
  },
  {
    id: 'C5H5N', formula: 'C₅H₅N', name: 'Pyridine', category: 'weak_base',
    ions: [{ formula: 'C₅H₅NH⁺', name: 'pyridinium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 1 }],
    equation: 'C₅H₅N(aq) + H₂O(l) ⇌ C₅H₅NH⁺(aq) + OH⁻(aq)',
    ionizationPct: 0.1, ionizationLabel: '< 0.5 % (0.1 M)',
    Kb: '1.7 × 10⁻⁹',
  },
  {
    id: 'C6H5NH2', formula: 'C₆H₅NH₂', name: 'Aniline', category: 'weak_base',
    ions: [{ formula: 'C₆H₅NH₃⁺', name: 'anilinium', coeff: 1 }, { formula: 'OH⁻', name: 'hydroxide', coeff: 1 }],
    equation: 'C₆H₅NH₂(aq) + H₂O(l) ⇌ C₆H₅NH₃⁺(aq) + OH⁻(aq)',
    ionizationPct: 0.07, ionizationLabel: '< 0.1 % (0.1 M)',
    Kb: '4.2 × 10⁻¹⁰',
  },

  // ── Soluble ionic ────────────────────────────────────────────────────────────
  {
    id: 'NaCl', formula: 'NaCl', name: 'Sodium chloride', category: 'soluble_ionic',
    ions: [{ formula: 'Na⁺', name: 'sodium', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 1 }],
    equation: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'KNO3', formula: 'KNO₃', name: 'Potassium nitrate', category: 'soluble_ionic',
    ions: [{ formula: 'K⁺', name: 'potassium', coeff: 1 }, { formula: 'NO₃⁻', name: 'nitrate', coeff: 1 }],
    equation: 'KNO₃(s) → K⁺(aq) + NO₃⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'CaCl2', formula: 'CaCl₂', name: 'Calcium chloride', category: 'soluble_ionic',
    ions: [{ formula: 'Ca²⁺', name: 'calcium', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 2 }],
    equation: 'CaCl₂(s) → Ca²⁺(aq) + 2Cl⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'MgCl2', formula: 'MgCl₂', name: 'Magnesium chloride', category: 'soluble_ionic',
    ions: [{ formula: 'Mg²⁺', name: 'magnesium', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 2 }],
    equation: 'MgCl₂(s) → Mg²⁺(aq) + 2Cl⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'AlCl3', formula: 'AlCl₃', name: 'Aluminum chloride', category: 'soluble_ionic',
    ions: [{ formula: 'Al³⁺', name: 'aluminum', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 3 }],
    equation: 'AlCl₃(s) → Al³⁺(aq) + 3Cl⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
    note: 'Al³⁺ undergoes hydrolysis in water, making the solution acidic.',
  },
  {
    id: 'Na2SO4', formula: 'Na₂SO₄', name: 'Sodium sulfate', category: 'soluble_ionic',
    ions: [{ formula: 'Na⁺', name: 'sodium', coeff: 2 }, { formula: 'SO₄²⁻', name: 'sulfate', coeff: 1 }],
    equation: 'Na₂SO₄(s) → 2Na⁺(aq) + SO₄²⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'Na3PO4', formula: 'Na₃PO₄', name: 'Sodium phosphate', category: 'soluble_ionic',
    ions: [{ formula: 'Na⁺', name: 'sodium', coeff: 3 }, { formula: 'PO₄³⁻', name: 'phosphate', coeff: 1 }],
    equation: 'Na₃PO₄(s) → 3Na⁺(aq) + PO₄³⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'Fe2(SO4)3', formula: 'Fe₂(SO₄)₃', name: 'Iron(III) sulfate', category: 'soluble_ionic',
    ions: [{ formula: 'Fe³⁺', name: 'iron(III)', coeff: 2 }, { formula: 'SO₄²⁻', name: 'sulfate', coeff: 3 }],
    equation: 'Fe₂(SO₄)₃(s) → 2Fe³⁺(aq) + 3SO₄²⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
  },
  {
    id: 'NH4Cl', formula: 'NH₄Cl', name: 'Ammonium chloride', category: 'soluble_ionic',
    ions: [{ formula: 'NH₄⁺', name: 'ammonium', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 1 }],
    equation: 'NH₄Cl(s) → NH₄⁺(aq) + Cl⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
    note: 'NH₄⁺ is a weak acid (Ka = 5.6 × 10⁻¹⁰); the solution is slightly acidic.',
  },
  {
    id: 'CH3COONa', formula: 'CH₃COONa', name: 'Sodium acetate', category: 'soluble_ionic',
    ions: [{ formula: 'Na⁺', name: 'sodium', coeff: 1 }, { formula: 'CH₃COO⁻', name: 'acetate', coeff: 1 }],
    equation: 'CH₃COONa(s) → Na⁺(aq) + CH₃COO⁻(aq)',
    ionizationPct: 100, ionizationLabel: '~100 %',
    note: 'CH₃COO⁻ is the conjugate base of acetic acid; it hydrolyzes slightly, making the solution basic.',
  },

  // ── Sparingly soluble ────────────────────────────────────────────────────────
  {
    id: 'CaSO4', formula: 'CaSO₄', name: 'Calcium sulfate', category: 'sparingly_soluble',
    ions: [{ formula: 'Ca²⁺', name: 'calcium', coeff: 1 }, { formula: 'SO₄²⁻', name: 'sulfate', coeff: 1 }],
    equation: 'CaSO₄(s) ⇌ Ca²⁺(aq) + SO₄²⁻(aq)',
    ionizationPct: 2, ionizationLabel: 'low — Ksp = 4.9 × 10⁻⁵',
    note: 'Dissolves minimally; what does dissolve dissociates fully.',
  },
  {
    id: 'MgCO3', formula: 'MgCO₃', name: 'Magnesium carbonate', category: 'sparingly_soluble',
    ions: [{ formula: 'Mg²⁺', name: 'magnesium', coeff: 1 }, { formula: 'CO₃²⁻', name: 'carbonate', coeff: 1 }],
    equation: 'MgCO₃(s) ⇌ Mg²⁺(aq) + CO₃²⁻(aq)',
    ionizationPct: 2, ionizationLabel: 'low — Ksp = 6.8 × 10⁻⁶',
  },
  {
    id: 'PbCl2', formula: 'PbCl₂', name: 'Lead(II) chloride', category: 'sparingly_soluble',
    ions: [{ formula: 'Pb²⁺', name: 'lead(II)', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 2 }],
    equation: 'PbCl₂(s) ⇌ Pb²⁺(aq) + 2Cl⁻(aq)',
    ionizationPct: 2, ionizationLabel: 'low — Ksp = 1.7 × 10⁻⁵',
  },

  // ── Insoluble (weak electrolyte / essentially non-electrolyte) ───────────────
  {
    id: 'BaSO4', formula: 'BaSO₄', name: 'Barium sulfate', category: 'insoluble',
    ions: [{ formula: 'Ba²⁺', name: 'barium', coeff: 1 }, { formula: 'SO₄²⁻', name: 'sulfate', coeff: 1 }],
    equation: 'BaSO₄(s) ⇌ Ba²⁺(aq) + SO₄²⁻(aq)',
    ionizationPct: 0, ionizationLabel: 'negligible — Ksp = 1.1 × 10⁻¹⁰',
    note: 'Essentially insoluble; negligible ion concentration in solution.',
  },
  {
    id: 'CaCO3', formula: 'CaCO₃', name: 'Calcium carbonate', category: 'insoluble',
    ions: [{ formula: 'Ca²⁺', name: 'calcium', coeff: 1 }, { formula: 'CO₃²⁻', name: 'carbonate', coeff: 1 }],
    equation: 'CaCO₃(s) ⇌ Ca²⁺(aq) + CO₃²⁻(aq)',
    ionizationPct: 0, ionizationLabel: 'negligible — Ksp = 3.3 × 10⁻⁹',
    note: 'Reacts with acids; solubility increases in acidic solution.',
  },
  {
    id: 'AgCl', formula: 'AgCl', name: 'Silver chloride', category: 'insoluble',
    ions: [{ formula: 'Ag⁺', name: 'silver', coeff: 1 }, { formula: 'Cl⁻', name: 'chloride', coeff: 1 }],
    equation: 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)',
    ionizationPct: 0, ionizationLabel: 'negligible — Ksp = 1.8 × 10⁻¹⁰',
  },

  // ── Non-electrolytes ─────────────────────────────────────────────────────────
  {
    id: 'C6H12O6', formula: 'C₆H₁₂O₆', name: 'Glucose', category: 'nonelectrolyte',
    ions: [],
    equation: 'C₆H₁₂O₆(s) → C₆H₁₂O₆(aq)  (no ions)',
    ionizationPct: 0, ionizationLabel: '0 %',
    note: 'Molecular compound; dissolves intact without producing ions.',
  },
  {
    id: 'C12H22O11', formula: 'C₁₂H₂₂O₁₁', name: 'Sucrose', category: 'nonelectrolyte',
    ions: [],
    equation: 'C₁₂H₂₂O₁₁(s) → C₁₂H₂₂O₁₁(aq)  (no ions)',
    ionizationPct: 0, ionizationLabel: '0 %',
  },
  {
    id: 'C2H5OH', formula: 'C₂H₅OH', name: 'Ethanol', category: 'nonelectrolyte',
    ions: [],
    equation: 'C₂H₅OH(l) → C₂H₅OH(aq)  (no ions)',
    ionizationPct: 0, ionizationLabel: '0 %',
  },
]

// ── Derived helpers ───────────────────────────────────────────────────────────

function strengthOf(cat: ElectrolyteCategory): ElectrolyteStrength {
  if (cat === 'strong_acid' || cat === 'strong_base' || cat === 'soluble_ionic') return 'strong'
  if (cat === 'nonelectrolyte' || cat === 'insoluble') return 'non'
  return 'weak'
}

const STRENGTH_LABEL: Record<ElectrolyteStrength, string> = {
  strong: 'Strong Electrolyte',
  weak:   'Weak Electrolyte',
  non:    'Non-Electrolyte',
}

const STRENGTH_COLOR: Record<ElectrolyteStrength, string> = {
  strong: '#4ade80',   // green
  weak:   '#fbbf24',   // amber
  non:    '#6b7280',   // gray
}

const CATEGORY_LABEL: Record<ElectrolyteCategory, string> = {
  strong_acid:        'Strong Acid',
  weak_acid:          'Weak Acid',
  strong_base:        'Strong Base',
  weak_base:          'Weak Base',
  soluble_ionic:      'Soluble Ionic Compound',
  sparingly_soluble:  'Sparingly Soluble Salt',
  insoluble:          'Insoluble Salt',
  nonelectrolyte:     'Molecular Compound',
}

const GROUPS: { label: string; cats: ElectrolyteCategory[] }[] = [
  { label: 'Strong Acids',    cats: ['strong_acid'] },
  { label: 'Weak Acids',      cats: ['weak_acid'] },
  { label: 'Strong Bases',    cats: ['strong_base'] },
  { label: 'Weak Bases',      cats: ['weak_base'] },
  { label: 'Soluble Salts',   cats: ['soluble_ionic'] },
  { label: 'Sparingly Soluble', cats: ['sparingly_soluble'] },
  { label: 'Insoluble Salts', cats: ['insoluble'] },
  { label: 'Non-Electrolytes',cats: ['nonelectrolyte'] },
]

// ── Ionization bar ────────────────────────────────────────────────────────────

function IonizationBar({ pct, color }: { pct: number; color: string }) {
  const display = Math.max(pct, pct > 0 ? 2 : 0)   // minimum visible sliver if non-zero
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-raised overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${display}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
      <span className="font-mono text-xs shrink-0" style={{ color, minWidth: '5rem', textAlign: 'right' }}>
        {pct >= 99 ? '≈ 100 %' : pct <= 0 ? '≈ 0 %' : `≈ ${pct} %`}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ElectrolyteClassifier() {
  const [selected, setSelected] = useState<ElectrolyteCompound | null>(null)

  const strength = selected ? strengthOf(selected.category) : null
  const color    = strength ? STRENGTH_COLOR[strength] : 'var(--c-halogen)'

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-semibold text-bright text-xl">Electrolyte Classifier</h2>
        <p className="font-sans text-sm text-secondary">
          Select a compound to see its electrolyte strength and expected ions in solution.
        </p>
      </div>

      {/* Picker */}
      <div className="flex flex-col gap-4">
        {GROUPS.map(group => {
          const items = COMPOUNDS.filter(c => group.cats.includes(c.category))
          return (
            <div key={group.label} className="flex flex-col gap-1.5">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</span>
              <div className="flex flex-wrap gap-1.5">
                {items.map(c => {
                  const isSelected = selected?.id === c.id
                  const str = strengthOf(c.category)
                  const btnColor = STRENGTH_COLOR[str]
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      title={c.name}
                      className="px-2.5 py-1 rounded-sm font-mono text-sm transition-colors"
                      style={isSelected ? {
                        background: `color-mix(in srgb, ${btnColor} 18%, rgb(var(--color-raised)))`,
                        border: `1px solid color-mix(in srgb, ${btnColor} 45%, transparent)`,
                        color: btnColor,
                      } : {
                        border: '1px solid rgba(var(--overlay),0.12)',
                        color: 'rgba(var(--overlay),0.45)',
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

      {/* Result */}
      <AnimatePresence mode="wait">
        {selected && strength && (
          <motion.div key={selected.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-5 rounded-sm border bg-surface p-5"
            style={{ borderColor: `color-mix(in srgb, ${color} 28%, transparent)` }}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-base font-semibold" style={{ color }}>
                {selected.formula}
              </span>
              <span className="font-sans text-base text-secondary">{selected.name}</span>
              <div className="flex flex-wrap gap-2 ml-auto">
                <span className="px-2.5 py-0.5 rounded-sm font-mono text-sm font-semibold"
                  style={{
                    background: `color-mix(in srgb, ${color} 15%, rgb(var(--color-raised)))`,
                    border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                    color,
                  }}>
                  {STRENGTH_LABEL[strength]}
                </span>
                <span className="px-2.5 py-0.5 rounded-sm font-mono text-sm border border-border text-secondary">
                  {CATEGORY_LABEL[selected.category]}
                </span>
              </div>
            </div>

            {/* Dissociation equation */}
            <div className="font-mono text-base rounded-sm border border-border bg-raised px-4 py-3"
              style={{ color: 'rgba(var(--overlay),0.75)' }}>
              {selected.equation}
            </div>

            {/* Ionization bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                  Degree of Ionization
                </span>
                <span className="font-mono text-sm text-secondary">{selected.ionizationLabel}</span>
              </div>
              <IonizationBar pct={selected.ionizationPct} color={color} />
            </div>

            {/* Ions in solution */}
            {selected.ions.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                  Ions in Solution
                  {strength === 'weak' && (
                    <span className="normal-case font-normal ml-2">(partial — majority remains un-ionized)</span>
                  )}
                  {(selected.category === 'sparingly_soluble' || selected.category === 'insoluble') && (
                    <span className="normal-case font-normal ml-2">(trace — limited by solubility)</span>
                  )}
                </span>
                <div className="flex flex-wrap gap-2">
                  {selected.ions.map((ion, i) => (
                    <div key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border bg-raised">
                      {ion.coeff > 1 && (
                        <span className="font-mono text-base text-secondary">{ion.coeff}×</span>
                      )}
                      <span className="font-mono text-base font-semibold" style={{ color }}>
                        {ion.formula}
                      </span>
                      <span className="font-sans text-sm text-secondary">{ion.name}</span>
                      <span className="font-mono text-xs text-secondary">(aq)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-sm border border-border bg-raised">
                <span className="font-mono text-base text-secondary">No ions produced — dissolves as neutral molecules.</span>
              </div>
            )}

            {/* Ka / Kb */}
            {(selected.Ka || selected.Kb) && (
              <div className="flex flex-wrap gap-4">
                {selected.Ka && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm text-secondary">Ka</span>
                    <span className="font-mono text-base text-bright">{selected.Ka}</span>
                  </div>
                )}
                {selected.Kb && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm text-secondary">Kb</span>
                    <span className="font-mono text-base text-bright">{selected.Kb}</span>
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            {selected.note && (
              <p className="font-sans text-base text-secondary leading-relaxed border-t border-border pt-4">
                {selected.note}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        Ionization percentages are approximate at ~0.1 M. Strong electrolytes conduct electricity well; weak electrolytes conduct partially; non-electrolytes do not conduct.
      </p>
    </div>
  )
}

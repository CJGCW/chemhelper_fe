// ── Types ─────────────────────────────────────────────────────────────────────

export type ElectrolyteStrength = 'strong' | 'weak' | 'non'

export interface ElectrolyteQuestion {
  formula:     string
  name:        string
  answer:      ElectrolyteStrength
  category:    string
  equation:    string
  explanation: string
}

// ── Display maps ──────────────────────────────────────────────────────────────

export const ELECTROLYTE_COLOR: Record<ElectrolyteStrength, string> = {
  strong: '#60a5fa',
  weak:   '#fbbf24',
  non:    '#6b7280',
}

export const ELECTROLYTE_LABEL: Record<ElectrolyteStrength, string> = {
  strong: 'Strong Electrolyte',
  weak:   'Weak Electrolyte',
  non:    'Non-Electrolyte',
}

export const ELECTROLYTE_OPTIONS: ElectrolyteStrength[] = ['strong', 'weak', 'non']

// ── Question pool ─────────────────────────────────────────────────────────────

export const ELECTROLYTE_QUESTIONS: ElectrolyteQuestion[] = [
  // Strong acids
  { formula: 'HCl', name: 'Hydrochloric acid',
    answer: 'strong', category: 'Strong acid',
    equation: 'HCl(aq) → H⁺(aq) + Cl⁻(aq)',
    explanation: 'HCl is one of the seven strong acids — it dissociates completely (~100%) in water. Every molecule separates into H⁺ and Cl⁻.' },
  { formula: 'HNO₃', name: 'Nitric acid',
    answer: 'strong', category: 'Strong acid',
    equation: 'HNO₃(aq) → H⁺(aq) + NO₃⁻(aq)',
    explanation: 'HNO₃ is a strong acid. Complete dissociation produces H⁺ and NO₃⁻. No HNO₃ molecules remain in dilute solution.' },
  { formula: 'H₂SO₄', name: 'Sulfuric acid',
    answer: 'strong', category: 'Strong acid (diprotic)',
    equation: 'H₂SO₄(aq) → 2H⁺(aq) + SO₄²⁻(aq)',
    explanation: 'H₂SO₄ is a strong acid. The first dissociation is essentially complete. It produces a high concentration of ions, making it a strong electrolyte.' },
  { formula: 'HClO₄', name: 'Perchloric acid',
    answer: 'strong', category: 'Strong acid',
    equation: 'HClO₄(aq) → H⁺(aq) + ClO₄⁻(aq)',
    explanation: 'HClO₄ is one of the strongest known acids — 100% dissociation. Strong electrolyte.' },
  { formula: 'HBr', name: 'Hydrobromic acid',
    answer: 'strong', category: 'Strong acid',
    equation: 'HBr(aq) → H⁺(aq) + Br⁻(aq)',
    explanation: 'HBr fully dissociates in water, like all strong acids. Strong electrolyte.' },
  { formula: 'HI', name: 'Hydroiodic acid',
    answer: 'strong', category: 'Strong acid',
    equation: 'HI(aq) → H⁺(aq) + I⁻(aq)',
    explanation: 'HI is a strong acid — complete dissociation. Strong electrolyte.' },
  // Strong bases
  { formula: 'NaOH', name: 'Sodium hydroxide',
    answer: 'strong', category: 'Strong base',
    equation: 'NaOH(aq) → Na⁺(aq) + OH⁻(aq)',
    explanation: 'NaOH is a strong base — completely dissociates. Produces Na⁺ and OH⁻ with 100% dissociation.' },
  { formula: 'KOH', name: 'Potassium hydroxide',
    answer: 'strong', category: 'Strong base',
    equation: 'KOH(aq) → K⁺(aq) + OH⁻(aq)',
    explanation: 'KOH is a strong base with complete dissociation. Strong electrolyte.' },
  { formula: 'Ca(OH)₂', name: 'Calcium hydroxide',
    answer: 'strong', category: 'Strong base (slightly soluble)',
    equation: 'Ca(OH)₂(aq) → Ca²⁺(aq) + 2OH⁻(aq)',
    explanation: 'Ca(OH)₂ is a strong base. The amount that dissolves dissociates completely. Note: it has limited solubility, but what does dissolve is fully ionized.' },
  { formula: 'Ba(OH)₂', name: 'Barium hydroxide',
    answer: 'strong', category: 'Strong base',
    equation: 'Ba(OH)₂(aq) → Ba²⁺(aq) + 2OH⁻(aq)',
    explanation: 'Ba(OH)₂ fully dissociates in solution. Strong electrolyte.' },
  // Soluble ionic salts
  { formula: 'NaCl', name: 'Sodium chloride',
    answer: 'strong', category: 'Soluble ionic salt',
    equation: 'NaCl(aq) → Na⁺(aq) + Cl⁻(aq)',
    explanation: 'Ionic compounds that dissolve in water dissociate completely. NaCl separates into Na⁺ and Cl⁻ — all ions, no molecules.' },
  { formula: 'KNO₃', name: 'Potassium nitrate',
    answer: 'strong', category: 'Soluble ionic salt',
    equation: 'KNO₃(aq) → K⁺(aq) + NO₃⁻(aq)',
    explanation: 'KNO₃ is a soluble ionic salt — complete dissociation into K⁺ and NO₃⁻. Strong electrolyte.' },
  { formula: 'CaCl₂', name: 'Calcium chloride',
    answer: 'strong', category: 'Soluble ionic salt',
    equation: 'CaCl₂(aq) → Ca²⁺(aq) + 2Cl⁻(aq)',
    explanation: 'CaCl₂ is a soluble ionic salt. It dissociates completely into Ca²⁺ and 2 Cl⁻ ions. Strong electrolyte.' },
  { formula: 'MgSO₄', name: 'Magnesium sulfate',
    answer: 'strong', category: 'Soluble ionic salt',
    equation: 'MgSO₄(aq) → Mg²⁺(aq) + SO₄²⁻(aq)',
    explanation: 'MgSO₄ (Epsom salt) fully dissociates in water. Strong electrolyte.' },
  // Weak acids
  { formula: 'CH₃COOH', name: 'Acetic acid',
    answer: 'weak', category: 'Weak acid',
    equation: 'CH₃COOH(aq) ⇌ H⁺(aq) + CH₃COO⁻(aq)',
    explanation: 'Acetic acid (vinegar) is a weak acid — only ~1% ionizes at typical concentrations. Most molecules stay intact. Ka ≈ 1.8 × 10⁻⁵.' },
  { formula: 'HF', name: 'Hydrofluoric acid',
    answer: 'weak', category: 'Weak acid',
    equation: 'HF(aq) ⇌ H⁺(aq) + F⁻(aq)',
    explanation: 'Despite the name "hydrofluoric acid," HF is a weak acid — partial ionization only. The strong H–F bond makes it much weaker than HCl.' },
  { formula: 'HNO₂', name: 'Nitrous acid',
    answer: 'weak', category: 'Weak acid',
    equation: 'HNO₂(aq) ⇌ H⁺(aq) + NO₂⁻(aq)',
    explanation: 'HNO₂ (nitrous acid, not to be confused with HNO₃) is a weak acid. Partial ionization — weak electrolyte. Ka ≈ 4.5 × 10⁻⁴.' },
  { formula: 'H₂CO₃', name: 'Carbonic acid',
    answer: 'weak', category: 'Weak acid',
    equation: 'H₂CO₃(aq) ⇌ H⁺(aq) + HCO₃⁻(aq)',
    explanation: 'H₂CO₃ (dissolved CO₂ in water) is a weak acid. Very little ionization — Ka₁ ≈ 4.3 × 10⁻⁷. Weak electrolyte.' },
  { formula: 'H₃PO₄', name: 'Phosphoric acid',
    answer: 'weak', category: 'Weak acid (polyprotic)',
    equation: 'H₃PO₄(aq) ⇌ H⁺(aq) + H₂PO₄⁻(aq)',
    explanation: 'H₃PO₄ is a weak acid. Despite having three ionizable protons, the first Ka is only ~7.5 × 10⁻³. Weak electrolyte.' },
  { formula: 'HCN', name: 'Hydrocyanic acid',
    answer: 'weak', category: 'Weak acid',
    equation: 'HCN(aq) ⇌ H⁺(aq) + CN⁻(aq)',
    explanation: 'HCN is an extremely weak acid (Ka ≈ 6 × 10⁻¹⁰). Nearly all molecules remain un-ionized. Weak electrolyte.' },
  // Weak bases
  { formula: 'NH₃', name: 'Ammonia',
    answer: 'weak', category: 'Weak base',
    equation: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
    explanation: 'NH₃ is a weak base — it partially accepts a proton from water. Only a small fraction reacts. Kb ≈ 1.8 × 10⁻⁵.' },
  // Non-electrolytes
  { formula: 'C₆H₁₂O₆', name: 'Glucose',
    answer: 'non', category: 'Non-electrolyte (molecular sugar)',
    equation: 'C₆H₁₂O₆(aq) → C₆H₁₂O₆(aq)  [no dissociation]',
    explanation: 'Glucose is a molecular compound — it dissolves in water but does not form ions. No ions means no electrical conductivity. Non-electrolyte.' },
  { formula: 'C₂H₅OH', name: 'Ethanol',
    answer: 'non', category: 'Non-electrolyte (molecular)',
    equation: 'C₂H₅OH(aq) → C₂H₅OH(aq)  [no dissociation]',
    explanation: 'Ethanol (drinking alcohol) is a covalent molecule — it dissolves in water without ionizing. Non-electrolyte.' },
  { formula: 'C₁₂H₂₂O₁₁', name: 'Sucrose',
    answer: 'non', category: 'Non-electrolyte (molecular sugar)',
    equation: 'C₁₂H₂₂O₁₁(aq) → C₁₂H₂₂O₁₁(aq)  [no dissociation]',
    explanation: 'Table sugar dissolves easily in water but produces no ions. Non-electrolyte.' },
  { formula: 'CH₃OH', name: 'Methanol',
    answer: 'non', category: 'Non-electrolyte (molecular)',
    equation: 'CH₃OH(aq) → CH₃OH(aq)  [no dissociation]',
    explanation: 'Methanol is a covalent molecule. It dissolves in water but does not ionize. Non-electrolyte.' },
  { formula: '(CH₃)₂CO', name: 'Acetone',
    answer: 'non', category: 'Non-electrolyte (molecular)',
    equation: '(CH₃)₂CO(aq) → (CH₃)₂CO(aq)  [no dissociation]',
    explanation: 'Acetone is a covalent organic compound. Dissolves in water without producing ions — non-electrolyte.' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export interface ElectrolytePickResult { q: ElectrolyteQuestion; idx: number }

export function pickElectrolyte(excludeIdx?: number): ElectrolytePickResult {
  let idx = Math.floor(Math.random() * ELECTROLYTE_QUESTIONS.length)
  if (idx === excludeIdx && ELECTROLYTE_QUESTIONS.length > 1)
    idx = (idx + 1) % ELECTROLYTE_QUESTIONS.length
  return { q: ELECTROLYTE_QUESTIONS[idx], idx }
}

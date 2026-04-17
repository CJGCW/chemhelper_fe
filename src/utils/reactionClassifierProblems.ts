// ── Types ─────────────────────────────────────────────────────────────────────

export type RxnType = 'precipitation' | 'acid_base' | 'gas_forming' | 'redox' | 'no_reaction'

export interface RxnClassifierQuestion {
  reactantA:   string
  reactantB:   string
  answer:      RxnType
  subtype:     string
  explanation: string
}

// ── Display maps ──────────────────────────────────────────────────────────────

export const RXN_TYPE_COLOR: Record<RxnType, string> = {
  precipitation: '#60a5fa',
  acid_base:     '#4ade80',
  gas_forming:   '#fbbf24',
  redox:         '#f472b6',
  no_reaction:   '#6b7280',
}

export const RXN_TYPE_LABEL: Record<RxnType, string> = {
  precipitation: 'Precipitation',
  acid_base:     'Acid-Base',
  gas_forming:   'Gas-Forming',
  redox:         'Redox',
  no_reaction:   'No Reaction',
}

export const RXN_OPTIONS: RxnType[] = ['precipitation', 'acid_base', 'gas_forming', 'redox', 'no_reaction']

// ── Question pool ─────────────────────────────────────────────────────────────

export const RXN_CLASSIFIER_QUESTIONS: RxnClassifierQuestion[] = [
  // Precipitation
  { reactantA: 'AgNO₃(aq)', reactantB: 'NaCl(aq)',
    answer: 'precipitation', subtype: 'Ag⁺ + Cl⁻ → AgCl(s)',
    explanation: 'Ag⁺ and Cl⁻ form insoluble AgCl (white precipitate). Na⁺ and NO₃⁻ are spectator ions.' },
  { reactantA: 'Pb(NO₃)₂(aq)', reactantB: 'KI(aq)',
    answer: 'precipitation', subtype: 'Pb²⁺ + 2I⁻ → PbI₂(s)',
    explanation: 'PbI₂ is insoluble — a bright yellow precipitate forms. K⁺ and NO₃⁻ are spectators.' },
  { reactantA: 'BaCl₂(aq)', reactantB: 'Na₂SO₄(aq)',
    answer: 'precipitation', subtype: 'Ba²⁺ + SO₄²⁻ → BaSO₄(s)',
    explanation: 'BaSO₄ is insoluble (white precipitate). Used to confirm the presence of sulfate or barium ions.' },
  { reactantA: 'FeCl₃(aq)', reactantB: 'NaOH(aq)',
    answer: 'precipitation', subtype: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃(s)',
    explanation: 'Fe(OH)₃ is insoluble — rust-orange/brown precipitate. Na⁺ and Cl⁻ are spectators.' },
  { reactantA: 'CuSO₄(aq)', reactantB: 'NaOH(aq)',
    answer: 'precipitation', subtype: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂(s)',
    explanation: 'Cu(OH)₂ is insoluble — pale blue gelatinous precipitate. Na⁺ and SO₄²⁻ are spectators.' },
  { reactantA: 'Na₂CO₃(aq)', reactantB: 'CaCl₂(aq)',
    answer: 'precipitation', subtype: 'Ca²⁺ + CO₃²⁻ → CaCO₃(s)',
    explanation: 'CaCO₃ is insoluble (white precipitate). Na⁺ and Cl⁻ are spectator ions.' },
  // Acid-Base
  { reactantA: 'HCl(aq)', reactantB: 'NaOH(aq)',
    answer: 'acid_base', subtype: 'Strong acid + strong base',
    explanation: 'Both fully dissociate. Net ionic: H⁺(aq) + OH⁻(aq) → H₂O(l). Na⁺ and Cl⁻ are spectators. Solution is neutral.' },
  { reactantA: 'H₂SO₄(aq)', reactantB: 'KOH(aq)',
    answer: 'acid_base', subtype: 'Strong acid + strong base',
    explanation: 'H₂SO₄ fully dissociates; KOH fully dissociates. Net ionic is still H⁺ + OH⁻ → H₂O. Products: K₂SO₄(aq) + H₂O(l).' },
  { reactantA: 'CH₃COOH(aq)', reactantB: 'NaOH(aq)',
    answer: 'acid_base', subtype: 'Weak acid + strong base',
    explanation: 'Acetic acid is weak (stays molecular in ionic equation). Net ionic: CH₃COOH(aq) + OH⁻(aq) → CH₃COO⁻(aq) + H₂O(l). Solution is basic.' },
  { reactantA: 'HCl(aq)', reactantB: 'NH₃(aq)',
    answer: 'acid_base', subtype: 'Strong acid + weak base',
    explanation: 'HCl fully dissociates; NH₃ stays molecular. Net ionic: H⁺(aq) + NH₃(aq) → NH₄⁺(aq). Solution is acidic.' },
  { reactantA: 'HNO₃(aq)', reactantB: 'Ca(OH)₂(aq)',
    answer: 'acid_base', subtype: 'Strong acid + strong base',
    explanation: 'Both fully dissociate. Net ionic: H⁺(aq) + OH⁻(aq) → H₂O(l). Products: Ca(NO₃)₂(aq) + 2H₂O(l).' },
  // Gas-Forming
  { reactantA: 'HCl(aq)', reactantB: 'Na₂CO₃(aq)',
    answer: 'gas_forming', subtype: 'Acid + carbonate → CO₂(g)',
    explanation: 'H⁺ reacts with CO₃²⁻ to form H₂CO₃, which immediately decomposes: H₂CO₃ → H₂O(l) + CO₂(g). Bubbling is observed.' },
  { reactantA: 'H₂SO₄(aq)', reactantB: 'NaHCO₃(aq)',
    answer: 'gas_forming', subtype: 'Acid + bicarbonate → CO₂(g)',
    explanation: 'H⁺ reacts with HCO₃⁻ to form CO₂(g) + H₂O(l). The same effervescence as with carbonate.' },
  { reactantA: 'HCl(aq)', reactantB: 'Na₂S(aq)',
    answer: 'gas_forming', subtype: 'Acid + sulfide → H₂S(g)',
    explanation: 'H⁺ reacts with S²⁻ to produce H₂S gas — characteristic "rotten egg" smell.' },
  { reactantA: 'HCl(aq)', reactantB: 'Na₂SO₃(aq)',
    answer: 'gas_forming', subtype: 'Acid + sulfite → SO₂(g)',
    explanation: 'H⁺ reacts with SO₃²⁻. H₂SO₃ forms and decomposes immediately: H₂SO₃ → SO₂(g) + H₂O(l). Pungent odor.' },
  { reactantA: 'NaOH(aq)', reactantB: 'NH₄Cl(aq)',
    answer: 'gas_forming', subtype: 'Base + ammonium salt → NH₃(g)',
    explanation: 'OH⁻ + NH₄⁺ → NH₃(g) + H₂O(l). Ammonia gas released — pungent smell, turns moist red litmus blue.' },
  { reactantA: 'HNO₃(aq)', reactantB: 'K₂CO₃(aq)',
    answer: 'gas_forming', subtype: 'Acid + carbonate → CO₂(g)',
    explanation: 'H⁺ from HNO₃ reacts with CO₃²⁻ to produce CO₂(g) + H₂O(l). K⁺ and NO₃⁻ are spectators.' },
  // Redox
  { reactantA: 'Zn(s)', reactantB: 'HCl(aq)',
    answer: 'redox', subtype: 'Metal + acid → H₂(g)',
    explanation: 'Zn is oxidized (0 → +2); 2H⁺ is reduced (→ H₂). Zn is above H₂ on the activity series. Equation: Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g).' },
  { reactantA: 'Fe(s)', reactantB: 'HCl(aq)',
    answer: 'redox', subtype: 'Metal + acid → H₂(g)',
    explanation: 'Fe is oxidized (0 → +2); H⁺ is reduced to H₂. Fe is above H₂ on the activity series.' },
  { reactantA: 'Na(s)', reactantB: 'H₂O(l)',
    answer: 'redox', subtype: 'Active metal + water',
    explanation: 'Na is oxidized (0 → +1); H in water is reduced (→ H₂). 2Na + 2H₂O → 2NaOH(aq) + H₂(g). Vigorous/violent reaction.' },
  { reactantA: 'Mg(s)', reactantB: 'H₂SO₄(aq)',
    answer: 'redox', subtype: 'Metal + acid → H₂(g)',
    explanation: 'Mg is oxidized (0 → +2); H⁺ is reduced to H₂. Mg + H₂SO₄ → MgSO₄(aq) + H₂(g).' },
  { reactantA: 'Zn(s)', reactantB: 'CuSO₄(aq)',
    answer: 'redox', subtype: 'Single displacement',
    explanation: 'Zn is more active than Cu. Zn displaces Cu²⁺: Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s). Copper deposits on the zinc.' },
  // No Reaction
  { reactantA: 'HCl(aq)', reactantB: 'KNO₃(aq)',
    answer: 'no_reaction', subtype: 'No precipitate, no gas, no redox',
    explanation: 'All possible ion combinations (K⁺+Cl⁻ = KCl soluble; H⁺+NO₃⁻ = HNO₃ soluble) remain in solution. No driving force.' },
  { reactantA: 'NaCl(aq)', reactantB: 'KNO₃(aq)',
    answer: 'no_reaction', subtype: 'All ions soluble',
    explanation: 'NaNO₃ and KCl are both soluble. All four ions remain in solution — there is no net reaction.' },
  { reactantA: 'Cu(s)', reactantB: 'HCl(aq)',
    answer: 'no_reaction', subtype: 'Cu is below H₂ on activity series',
    explanation: 'Cu does not react with dilute HCl because Cu is below H₂ on the activity series. Only metals above H₂ displace it from acids.' },
  { reactantA: 'Cu(s)', reactantB: 'FeSO₄(aq)',
    answer: 'no_reaction', subtype: 'Cu cannot displace Fe (Fe is more active)',
    explanation: 'Fe is above Cu on the activity series. Cu cannot displace Fe²⁺ from solution. A more active metal is needed.' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export interface RxnClassifierPickResult { q: RxnClassifierQuestion; idx: number }

export function pickRxnClassifier(excludeIdx?: number): RxnClassifierPickResult {
  let idx = Math.floor(Math.random() * RXN_CLASSIFIER_QUESTIONS.length)
  if (idx === excludeIdx && RXN_CLASSIFIER_QUESTIONS.length > 1)
    idx = (idx + 1) % RXN_CLASSIFIER_QUESTIONS.length
  return { q: RXN_CLASSIFIER_QUESTIONS[idx], idx }
}

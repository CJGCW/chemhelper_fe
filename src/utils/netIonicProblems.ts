// ── Types ─────────────────────────────────────────────────────────────────────

export type NetIonicCategory = 'precipitation' | 'acid_base' | 'gas_forming' | 'redox'

export interface NetIonicQuestion {
  molecular:    string
  category:     NetIonicCategory
  answer:       string
  distractors:  string[]
  spectators:   string
  explanation:  string
}

// ── Display maps ──────────────────────────────────────────────────────────────

export const NET_IONIC_CAT_COLOR: Record<NetIonicCategory, string> = {
  precipitation: '#60a5fa',
  acid_base:     '#4ade80',
  gas_forming:   '#fbbf24',
  redox:         '#f472b6',
}

export const NET_IONIC_CAT_LABEL: Record<NetIonicCategory, string> = {
  precipitation: 'Precipitation',
  acid_base:     'Acid-Base',
  gas_forming:   'Gas-Forming',
  redox:         'Redox',
}

// ── Question pool ─────────────────────────────────────────────────────────────

export const NET_IONIC_QUESTIONS: NetIonicQuestion[] = [
  // Precipitation
  {
    molecular:   'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)',
    category:    'precipitation',
    answer:      'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',
    distractors: [
      'Na⁺(aq) + NO₃⁻(aq) → NaNO₃(aq)',
      'Ag⁺(aq) + NO₃⁻(aq) → AgNO₃(s)',
      'Ag⁺(aq) + Cl⁻(aq) + Na⁺(aq) + NO₃⁻(aq) → AgCl(s) + NaNO₃(aq)',
    ],
    spectators:  'Na⁺(aq) and NO₃⁻(aq)',
    explanation: 'AgCl is insoluble. Na⁺ and NO₃⁻ remain in solution as spectator ions and are removed from the net ionic equation.',
  },
  {
    molecular:   'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2KNO₃(aq)',
    category:    'precipitation',
    answer:      'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)',
    distractors: [
      'Pb²⁺(aq) + I⁻(aq) → PbI(s)',
      '2K⁺(aq) + 2NO₃⁻(aq) → 2KNO₃(aq)',
      'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2K⁺(aq) + 2NO₃⁻(aq)',
    ],
    spectators:  'K⁺(aq) and NO₃⁻(aq)',
    explanation: 'PbI₂ is the bright yellow precipitate. K⁺ and NO₃⁻ are spectators. Note the correct 1:2 ratio for Pb²⁺ : I⁻.',
  },
  {
    molecular:   'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2NaCl(aq)',
    category:    'precipitation',
    answer:      'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)',
    distractors: [
      'Ba²⁺(aq) + 2Cl⁻(aq) → BaCl₂(s)',
      'Na⁺(aq) + SO₄²⁻(aq) → NaSO₄(s)',
      'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2NaCl(aq)',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'BaSO₄ is insoluble (white precipitate). Na⁺ and Cl⁻ remain in solution.',
  },
  {
    molecular:   'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s) + 3NaCl(aq)',
    category:    'precipitation',
    answer:      'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)',
    distractors: [
      'Fe²⁺(aq) + 2OH⁻(aq) → Fe(OH)₂(s)',
      'Na⁺(aq) + Cl⁻(aq) → NaCl(s)',
      'FeCl₃(aq) + NaOH(aq) → Fe(OH)₃(s) + NaCl(aq)',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'Fe(OH)₃ is insoluble (rust-orange precipitate). Na⁺ and Cl⁻ are spectators. Note Fe is +3 here, requiring 3 OH⁻.',
  },
  {
    molecular:   'CaCl₂(aq) + Na₂CO₃(aq) → CaCO₃(s) + 2NaCl(aq)',
    category:    'precipitation',
    answer:      'Ca²⁺(aq) + CO₃²⁻(aq) → CaCO₃(s)',
    distractors: [
      'Ca²⁺(aq) + 2Cl⁻(aq) → CaCl₂(s)',
      '2Na⁺(aq) + CO₃²⁻(aq) → Na₂CO₃(aq)',
      'CaCl₂(aq) + CO₃²⁻(aq) → CaCO₃(s) + 2Cl⁻(aq)',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'CaCO₃ is insoluble (limestone / white precipitate). Na⁺ and Cl⁻ are spectators.',
  },
  // Acid-Base
  {
    molecular:   'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    category:    'acid_base',
    answer:      'H⁺(aq) + OH⁻(aq) → H₂O(l)',
    distractors: [
      'HCl(aq) + OH⁻(aq) → Cl⁻(aq) + H₂O(l)',
      'Na⁺(aq) + Cl⁻(aq) → NaCl(aq)',
      'HCl(aq) + NaOH(aq) → Na⁺(aq) + Cl⁻(aq) + H₂O(l)',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'Both HCl and NaOH fully dissociate. Only H⁺ and OH⁻ react to form water. Na⁺ and Cl⁻ are spectators.',
  },
  {
    molecular:   'H₂SO₄(aq) + 2KOH(aq) → K₂SO₄(aq) + 2H₂O(l)',
    category:    'acid_base',
    answer:      'H⁺(aq) + OH⁻(aq) → H₂O(l)',
    distractors: [
      '2H⁺(aq) + SO₄²⁻(aq) + 2OH⁻(aq) → SO₄²⁻(aq) + 2H₂O(l)',
      'H₂SO₄(aq) + 2KOH(aq) → K₂SO₄(aq) + 2H₂O(l)',
      'SO₄²⁻(aq) + 2K⁺(aq) → K₂SO₄(aq)',
    ],
    spectators:  'K⁺(aq) and SO₄²⁻(aq)',
    explanation: 'Strong acid + strong base always simplifies to H⁺ + OH⁻ → H₂O(l). K⁺ and SO₄²⁻ are spectators.',
  },
  {
    molecular:   'CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l)',
    category:    'acid_base',
    answer:      'CH₃COOH(aq) + OH⁻(aq) → CH₃COO⁻(aq) + H₂O(l)',
    distractors: [
      'H⁺(aq) + OH⁻(aq) → H₂O(l)',
      'CH₃COOH(aq) + Na⁺(aq) → CH₃COONa(aq)',
      'CH₃COO⁻(aq) + H⁺(aq) + Na⁺(aq) + OH⁻(aq) → CH₃COO⁻(aq) + Na⁺(aq) + H₂O(l)',
    ],
    spectators:  'Na⁺(aq)',
    explanation: 'Weak acids stay molecular in ionic equations — CH₃COOH is not split into ions. Only Na⁺ is a spectator here.',
  },
  {
    molecular:   'HCl(aq) + NH₃(aq) → NH₄Cl(aq)',
    category:    'acid_base',
    answer:      'H⁺(aq) + NH₃(aq) → NH₄⁺(aq)',
    distractors: [
      'HCl(aq) + NH₃(aq) → NH₄Cl(s)',
      'H⁺(aq) + Cl⁻(aq) + NH₃(aq) → NH₄⁺(aq) + Cl⁻(aq)',
      'Cl⁻(aq) + NH₄⁺(aq) → NH₄Cl(aq)',
    ],
    spectators:  'Cl⁻(aq)',
    explanation: 'HCl fully dissociates (strong acid); NH₃ stays molecular (weak base). Only Cl⁻ is a spectator.',
  },
  // Gas-Forming
  {
    molecular:   '2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)',
    category:    'gas_forming',
    answer:      '2H⁺(aq) + CO₃²⁻(aq) → H₂O(l) + CO₂(g)',
    distractors: [
      'HCl(aq) + Na₂CO₃(aq) → NaCl(aq) + H₂CO₃(aq)',
      '2Na⁺(aq) + 2Cl⁻(aq) → 2NaCl(aq)',
      '2H⁺(aq) + CO₃²⁻(aq) → H₂CO₃(aq)',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'H⁺ reacts with CO₃²⁻. The unstable H₂CO₃ forms first, then decomposes to H₂O + CO₂(g). Na⁺ and Cl⁻ are spectators.',
  },
  {
    molecular:   'H₂SO₄(aq) + 2NaHCO₃(aq) → Na₂SO₄(aq) + 2H₂O(l) + 2CO₂(g)',
    category:    'gas_forming',
    answer:      'H⁺(aq) + HCO₃⁻(aq) → H₂O(l) + CO₂(g)',
    distractors: [
      '2H⁺(aq) + CO₃²⁻(aq) → H₂O(l) + CO₂(g)',
      'H₂SO₄(aq) + HCO₃⁻(aq) → HSO₄⁻(aq) + H₂CO₃(aq)',
      '2Na⁺(aq) + SO₄²⁻(aq) → Na₂SO₄(aq)',
    ],
    spectators:  'Na⁺(aq) and SO₄²⁻(aq)',
    explanation: 'With bicarbonate (HCO₃⁻), one H⁺ reacts directly. HCO₃⁻ (not CO₃²⁻) stays molecular since it is a weak acid itself.',
  },
  {
    molecular:   '2HCl(aq) + Na₂S(aq) → 2NaCl(aq) + H₂S(g)',
    category:    'gas_forming',
    answer:      '2H⁺(aq) + S²⁻(aq) → H₂S(g)',
    distractors: [
      'H⁺(aq) + S²⁻(aq) → HS⁻(aq)',
      '2HCl(aq) + S²⁻(aq) → 2Cl⁻(aq) + H₂S(g)',
      'Na⁺(aq) + Cl⁻(aq) → NaCl(aq)',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'H⁺ combines with S²⁻ to produce the foul-smelling H₂S gas. Na⁺ and Cl⁻ are spectators.',
  },
  {
    molecular:   'NaOH(aq) + NH₄Cl(aq) → NaCl(aq) + NH₃(g) + H₂O(l)',
    category:    'gas_forming',
    answer:      'OH⁻(aq) + NH₄⁺(aq) → NH₃(g) + H₂O(l)',
    distractors: [
      'Na⁺(aq) + Cl⁻(aq) → NaCl(aq)',
      'NaOH(aq) + NH₄⁺(aq) → Na⁺(aq) + NH₃(g) + H₂O(l)',
      'OH⁻(aq) + NH₃(aq) → NH₄⁺(aq) + H₂O(l) — reverse',
    ],
    spectators:  'Na⁺(aq) and Cl⁻(aq)',
    explanation: 'A base drives NH₄⁺ to release NH₃ gas. The pungent ammonia can be detected by its smell or by turning moist red litmus blue.',
  },
  // Redox
  {
    molecular:   'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)',
    category:    'redox',
    answer:      'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)',
    distractors: [
      'Zn(s) + HCl(aq) → ZnCl(aq) + H(g)',
      'Zn(s) + 2Cl⁻(aq) → ZnCl₂(s)',
      'Zn²⁺(aq) + 2H⁺(aq) → Zn(s) + H₂(g) — reverse',
    ],
    spectators:  'Cl⁻(aq)',
    explanation: 'Zn is oxidized (0 → +2) and H⁺ is reduced to H₂. Cl⁻ is the only spectator. Note: Zn is above H₂ on the activity series.',
  },
  {
    molecular:   'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)',
    category:    'redox',
    answer:      'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
    distractors: [
      'Zn(s) + SO₄²⁻(aq) → ZnSO₄(aq)',
      'Cu²⁺(aq) + SO₄²⁻(aq) → CuSO₄(aq)',
      'Zn²⁺(aq) + Cu(s) → Zn(s) + Cu²⁺(aq) — reverse',
    ],
    spectators:  'SO₄²⁻(aq)',
    explanation: 'Single displacement: Zn is more active than Cu and displaces it. SO₄²⁻ is the spectator. Copper metal deposits on the zinc.',
  },
  {
    molecular:   'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
    category:    'redox',
    answer:      'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)',
    distractors: [
      'Fe(s) + SO₄²⁻(aq) → FeSO₄(s)',
      'Fe³⁺(aq) + Cu(s) → Fe(s) + Cu²⁺(aq)',
      'Fe(s) + Cu²⁺(aq) → Fe³⁺(aq) + Cu(s)',
    ],
    spectators:  'SO₄²⁻(aq)',
    explanation: 'Fe is more active than Cu. Fe is oxidized to Fe²⁺; Cu²⁺ is reduced to Cu(s). SO₄²⁻ is the spectator.',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function shuffleNetIonicOptions(q: NetIonicQuestion): string[] {
  const opts = [q.answer, ...q.distractors]
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
}

export interface NetIonicPickResult { q: NetIonicQuestion; idx: number; options: string[] }

export function pickNetIonic(excludeIdx?: number): NetIonicPickResult {
  let idx = Math.floor(Math.random() * NET_IONIC_QUESTIONS.length)
  if (idx === excludeIdx && NET_IONIC_QUESTIONS.length > 1)
    idx = (idx + 1) % NET_IONIC_QUESTIONS.length
  const q = NET_IONIC_QUESTIONS[idx]
  return { q, idx, options: shuffleNetIonicOptions(q) }
}

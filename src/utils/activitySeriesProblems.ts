// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivityQuestionType = 'displacement' | 'water' | 'acid' | 'halogen' | 'no_reaction'

export interface ActivityQuestion {
  prompt:      string
  type:        ActivityQuestionType
  answer:      string
  distractors: string[]
  explanation: string
}

// ── Display maps ──────────────────────────────────────────────────────────────

export const ACTIVITY_TYPE_COLOR: Record<ActivityQuestionType, string> = {
  displacement: '#60a5fa',
  water:        '#4ade80',
  acid:         '#fbbf24',
  halogen:      '#c084fc',
  no_reaction:  '#6b7280',
}

export const ACTIVITY_TYPE_LABEL: Record<ActivityQuestionType, string> = {
  displacement: 'Displacement',
  water:        'Water Reaction',
  acid:         'Acid Reaction',
  halogen:      'Halogen Activity',
  no_reaction:  'No Reaction',
}

// ── Question pool ─────────────────────────────────────────────────────────────

export const ACTIVITY_QUESTIONS: ActivityQuestion[] = [
  // Displacement (metal + salt solution)
  {
    prompt:      'Zn(s) is added to CuSO₄(aq). What happens?',
    type:        'displacement',
    answer:      'Zn displaces Cu: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
    distractors: [
      'No reaction — Cu is more active than Zn',
      'Cu displaces Zn: Cu(s) + Zn²⁺(aq) → Cu²⁺(aq) + Zn(s)',
      'Both metals dissolve to form ZnCu(aq)',
    ],
    explanation: 'Zn is above Cu on the activity series (rank 10 vs 16). A more active metal displaces a less active metal from its salt solution. Copper deposits on the zinc surface.',
  },
  {
    prompt:      'Cu(s) is added to FeSO₄(aq). What happens?',
    type:        'no_reaction',
    answer:      'No reaction — Fe is more active than Cu',
    distractors: [
      'Cu displaces Fe: Cu(s) + Fe²⁺(aq) → Cu²⁺(aq) + Fe(s)',
      'Fe displaces Cu: Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)',
      'Both metals dissolve and exchange ions',
    ],
    explanation: 'Cu is below Fe on the activity series. A less active metal cannot displace a more active metal from solution. No reaction occurs.',
  },
  {
    prompt:      'Fe(s) is added to CuSO₄(aq). What happens?',
    type:        'displacement',
    answer:      'Fe displaces Cu: Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)',
    distractors: [
      'No reaction — Cu is more active than Fe',
      'Cu displaces Fe: Cu(s) + Fe²⁺(aq) → Cu²⁺(aq) + Fe(s)',
      'Fe displaces Cu: Fe(s) + Cu²⁺(aq) → Fe³⁺(aq) + Cu(s)',
    ],
    explanation: 'Fe is above Cu on the activity series. Fe is oxidized to Fe²⁺; Cu²⁺ is reduced to Cu metal. Copper deposits on the iron surface.',
  },
  {
    prompt:      'Al(s) is added to Fe₂(SO₄)₃(aq). What happens?',
    type:        'displacement',
    answer:      'Al displaces Fe: 2Al(s) + 3Fe²⁺(aq) → 2Al³⁺(aq) + 3Fe(s)',
    distractors: [
      'No reaction — Fe is more active than Al',
      'Fe displaces Al: Fe(s) + Al³⁺(aq) → Fe³⁺(aq) + Al(s)',
      'Al dissolves without producing Fe',
    ],
    explanation: 'Al (rank 7) is much more active than Fe (rank 11). Al is oxidized to Al³⁺ and Fe ions are reduced to Fe metal.',
  },
  {
    prompt:      'Ag(s) is added to ZnSO₄(aq). What happens?',
    type:        'no_reaction',
    answer:      'No reaction — Zn is more active than Ag',
    distractors: [
      'Ag displaces Zn: 2Ag(s) + Zn²⁺(aq) → 2Ag⁺(aq) + Zn(s)',
      'Zn displaces Ag: Zn(s) + 2Ag⁺(aq) → Zn²⁺(aq) + 2Ag(s)',
      'Both dissolve to form a silver-zinc alloy',
    ],
    explanation: 'Ag (rank 18) is far less active than Zn (rank 10). Ag cannot displace Zn²⁺ from solution.',
  },
  // Water reactions
  {
    prompt:      'Na(s) is added to cold water. What happens?',
    type:        'water',
    answer:      '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)  — vigorous/violent',
    distractors: [
      'No reaction — Na does not react with water',
      'Na + H₂O → NaH(aq) + OH⁻(aq)',
      'Na reacts only with hot steam, not cold water',
    ],
    explanation: 'Na is a very active metal (rank 5). It reacts vigorously with cold water, producing NaOH and H₂ gas. The reaction can ignite the hydrogen.',
  },
  {
    prompt:      'Mg(s) is added to cold water. What happens?',
    type:        'water',
    answer:      'Very slow/no visible reaction with cold water; reacts readily with hot water or steam',
    distractors: [
      'Mg reacts vigorously with cold water like Na',
      '2Mg(s) + 2H₂O(l) → 2MgOH(aq) + H₂(g)  — immediate',
      'Mg does not react with water under any conditions',
    ],
    explanation: 'Mg (rank 6) reacts very slowly with cold water but reacts readily with hot water or steam: Mg + 2H₂O → Mg(OH)₂ + H₂(g). Unlike Na or K, Mg does not react violently.',
  },
  {
    prompt:      'Cu(s) is added to water (any temperature). What happens?',
    type:        'no_reaction',
    answer:      'No reaction — Cu is below H₂ on the activity series',
    distractors: [
      'Cu + H₂O → CuO(s) + H₂(g)',
      'Cu reacts slowly with cold water to produce Cu(OH)₂',
      'Cu reacts with steam only',
    ],
    explanation: 'Cu is ranked 16 — below H₂ (rank 15.5). Metals below hydrogen do not react with water or steam under normal conditions.',
  },
  // Acid reactions
  {
    prompt:      'Zn(s) is added to dilute HCl(aq). What happens?',
    type:        'acid',
    answer:      'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)',
    distractors: [
      'No reaction — Zn is below H₂ on the activity series',
      'Zn + HCl → ZnCl(aq) + H(g)  [incorrect formula]',
      'Zn displaces Cl from HCl: Zn + 2HCl → ZnH₂ + Cl₂',
    ],
    explanation: 'Zn is above H₂ on the activity series, so it displaces H⁺ from dilute acids. Net ionic: Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g).',
  },
  {
    prompt:      'Cu(s) is added to dilute HCl(aq). What happens?',
    type:        'no_reaction',
    answer:      'No reaction — Cu is below H₂ on the activity series',
    distractors: [
      'Cu + 2HCl → CuCl₂(aq) + H₂(g)',
      'Cu reacts slowly to produce CuH(aq)',
      'Cu + HCl → Cu⁺ + Cl⁻ + H',
    ],
    explanation: 'Cu (rank 16) is below H₂ (rank 15.5). Only metals above H₂ react with dilute acids to produce hydrogen gas. Cu does not react with dilute HCl.',
  },
  {
    prompt:      'Mg(s) is added to dilute H₂SO₄(aq). What happens?',
    type:        'acid',
    answer:      'Mg(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂(g)',
    distractors: [
      'No reaction — Mg does not react with sulfuric acid',
      'Mg + H₂SO₄ → Mg(SO₄)₂ + 2H₂(g)',
      'Mg is oxidized to Mg³⁺ by H₂SO₄',
    ],
    explanation: 'Mg is very active (rank 6) — well above H₂. It reacts readily with dilute H₂SO₄. Net ionic: Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g).',
  },
  {
    prompt:      'Ag(s) is added to dilute HCl(aq). What happens?',
    type:        'no_reaction',
    answer:      'No reaction — Ag is below H₂ on the activity series',
    distractors: [
      'Ag + HCl → AgCl(s) + H⁺(aq)',
      '2Ag + 2HCl → 2AgCl(aq) + H₂(g)',
      'Ag dissolves slowly in dilute HCl',
    ],
    explanation: 'Ag (rank 18) is below H₂. It does not react with dilute acids to produce H₂. Note: Ag does dissolve in concentrated HNO₃ (oxidizing acid), but not dilute HCl.',
  },
  // Halogen displacement
  {
    prompt:      'Cl₂(aq) is added to KBr(aq). What happens?',
    type:        'halogen',
    answer:      'Cl₂ displaces Br⁻: Cl₂(aq) + 2KBr(aq) → 2KCl(aq) + Br₂(aq)',
    distractors: [
      'No reaction — Br₂ is more active than Cl₂',
      'Br⁻ displaces Cl₂: 2Br⁻ + Cl₂ → Br₂ + 2Cl⁻ — reverse',
      'Cl₂ and Br⁻ exchange to form ClBr(aq)',
    ],
    explanation: 'Cl₂ is more active than Br₂ (higher rank in the halogen series). A more active halogen displaces a less active one from its salt solution. The solution turns orange-brown as Br₂ forms.',
  },
  {
    prompt:      'Br₂(aq) is added to KI(aq). What happens?',
    type:        'halogen',
    answer:      'Br₂ displaces I⁻: Br₂(aq) + 2KI(aq) → 2KBr(aq) + I₂(aq)',
    distractors: [
      'No reaction — I₂ is more active than Br₂',
      'I₂ displaces Br⁻ from solution',
      'Br₂ and I⁻ react to form IBr(aq)',
    ],
    explanation: 'Br₂ (rank 2) is more active than I₂ (rank 3) in the halogen activity series. Br₂ oxidizes I⁻ to I₂, and the solution turns brown-black as I₂ forms.',
  },
  {
    prompt:      'I₂(aq) is added to KCl(aq). What happens?',
    type:        'no_reaction',
    answer:      'No reaction — Cl₂ is more active than I₂',
    distractors: [
      'I₂ displaces Cl⁻: I₂ + 2KCl → 2KI + Cl₂',
      'Cl⁻ displaces I₂: 2Cl⁻ + I₂ → Cl₂ + 2I⁻',
      'I₂ and Cl⁻ form ICl in solution',
    ],
    explanation: 'I₂ is the least active of the common halogens (rank 3 vs Cl₂ rank 1). A less active halogen cannot displace a more active halide ion. I₂ cannot displace Cl⁻.',
  },
  {
    prompt:      'Cl₂(aq) is added to KI(aq). What happens?',
    type:        'halogen',
    answer:      'Cl₂ displaces I⁻: Cl₂(aq) + 2KI(aq) → 2KCl(aq) + I₂(aq)',
    distractors: [
      'No reaction — I₂ is more active than Cl₂',
      'I₂ displaces Cl⁻ from solution',
      'Cl₂ + KI → KCl + ICl',
    ],
    explanation: 'Cl₂ (rank 1) is the most active common halogen and easily displaces I⁻. The solution turns dark brown/black as I₂ forms. This reaction is used to test for iodide ions.',
  },
  // Activity series ranking
  {
    prompt:      'Which metal is most active: Cu, Ag, Fe, or Zn?',
    type:        'displacement',
    answer:      'Zn — highest on the activity series among these four',
    distractors: [
      'Cu — reacts with both acids and water',
      'Fe — more active than Zn',
      'Ag — the most reactive noble metal',
    ],
    explanation: 'Activity order (most → least active): Zn (rank 10) > Fe (rank 11) > Cu (rank 16) > Ag (rank 18). Zn is most active and can displace all three others from their salt solutions.',
  },
  {
    prompt:      'A student places Mg, Cu, and Fe in separate solutions of AgNO₃(aq). Which metals will displace Ag?',
    type:        'displacement',
    answer:      'All three — Mg, Fe, and Cu are all above Ag on the activity series',
    distractors: [
      'Only Mg — it is the most active',
      'Only Mg and Fe — Cu is below Ag',
      'None — Ag⁺ is too stable to be displaced',
    ],
    explanation: 'Ag is near the bottom of the activity series (rank 18). Mg (rank 6), Fe (rank 11), and Cu (rank 16) are all above Ag, so all three will displace Ag⁺ from AgNO₃ solution.',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function shuffleActivityOptions(q: ActivityQuestion): string[] {
  const opts = [q.answer, ...q.distractors]
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
}

export interface ActivityPickResult { q: ActivityQuestion; idx: number; options: string[] }

export function pickActivity(excludeIdx?: number): ActivityPickResult {
  let idx = Math.floor(Math.random() * ACTIVITY_QUESTIONS.length)
  if (idx === excludeIdx && ACTIVITY_QUESTIONS.length > 1)
    idx = (idx + 1) % ACTIVITY_QUESTIONS.length
  const q = ACTIVITY_QUESTIONS[idx]
  return { q, idx, options: shuffleActivityOptions(q) }
}

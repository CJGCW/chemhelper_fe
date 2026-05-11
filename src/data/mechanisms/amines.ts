import type { ReactionDef, AtomPosition, BondPosition } from './types'

function mk(
  id: string, symbol: string, x: number, y: number,
  extras: Partial<Pick<AtomPosition, 'charge' | 'label' | 'role' | 'glow'>> = {}
): AtomPosition {
  return { id, symbol, x, y, ...extras }
}

function bd(
  id: string, from: string, to: string,
  order: 1 | 2 | 3 = 1, style: BondPosition['style'] = 'solid'
): BondPosition {
  return { id, from, to, order, style }
}

export const AMINE_REACTIONS: ReactionDef[] = [

  // ── 1. Gabriel Synthesis ──────────────────────────────────────────────────────
  {
    id: 'gabriel-synthesis',
    category: 'amine',
    name: 'Gabriel Synthesis',
    summary: 'Phthalimide + KOH → potassium phthalimide (nucleophile) → SN2 with 1° alkyl halide → N-alkylphthalimide → hydrolysis (NH₂NH₂ or H₃O⁺/Δ) → 1° amine + phthalic acid. Only gives 1° amines — no over-alkylation.',
    reactants: 'Phthalimide + KOH + R-X (1° or methyl halide)',
    products: 'R-NH₂ (1° amine) + phthalic acid',
    conditions: '(1) Phthalimide + KOH → phthalimide anion; (2) SN2 with RX; (3) NH₂NH₂ (Ing-Manske) or H₃O⁺/Δ',
    reactantSpecies: {
      text: 'Phthalimide + KOH + R-X (1° or methyl halide)',
      species: [
        { smiles: 'O=C1NC(=O)c2ccccc21', label: 'Phthalimide' },
        { smiles: '[R]Br', label: 'R–X (1° alkyl halide)' },
      ],
    },
    productSpecies: {
      text: 'R-NH₂ (1° amine) + phthalic acid',
      species: [
        { smiles: '[R]N', label: '1° Amine (R-NH₂)', showLonePairs: true },
        { smiles: 'OC(=O)c1ccccc1C(=O)O', label: 'Phthalic acid' },
      ],
    },
    conditionSpecies: {
      text: '(1) Phthalimide + KOH → phthalimide anion; (2) SN2 with RX; (3) NH₂NH₂ (Ing-Manske) or H₃O⁺/Δ',
      species: [
        { smiles: '[OH-].[K+]', label: 'KOH' },
        { smiles: 'NN', label: 'N₂H₄ (Ing-Manske)' },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'N-alkylphthalimide',
    reversible: false,
    importantInfo: [
      'Only makes 1° amines — no over-alkylation because N is part of an imide (pKa ≈ 8.3, weak N-nucleophile after alkylation).',
      'Phthalimide NH is acidic (pKa ≈ 8.3): KOH deprotonates → resonance-stabilized anion is a good nucleophile.',
      'Only works with 1° and methyl halides (SN2): 2° is too hindered, 3° does not react.',
      'Deprotection: NH₂NH₂ (hydrazinolysis, Ing-Manske modification) is milder than H₃O⁺/Δ hydrolysis.',
      'The phthalic acid byproduct is easily separated from the amine product.',
    ],
    brownRef: 'Ch 23.4',
    relatedReactions: ['amine-alkylation', 'reductive-amination'],
    tags: ['Gabriel synthesis', 'phthalimide', '1° amine', 'SN2', 'hydrazinolysis', 'no over-alkylation', 'amine'],
    frames: [
      {
        // Phthalimide anion attacking RX
        atoms: [
          mk('pt',  'Phth-N⁻', 195, 165, { charge: '−', role: 'nucleophile', label: 'phthalimide K⁺ salt' }),
          mk('c',   'C',        390, 165, { role: 'alpha_carbon' }),
          mk('x',   'X',        530, 165, { role: 'leaving_group', label: 'Cl, Br, I' }),
          mk('r',   'R',        390,  65, { role: 'r_group' }),
          mk('h1',  'H',        390, 265),
          mk('h2',  'H',        490, 225),
        ],
        bonds: [bd('c-x','c','x'), bd('c-r','c','r'), bd('c-h1','c','h1'), bd('c-h2','c','h2')],
        arrows: [{ from: { kind: 'atom', id: 'pt' }, to: { kind: 'atom', id: 'c' }, color: 'var(--c-alkali)' }],
        description: 'Potassium phthalimide (the N-anion): resonance-stabilized between two C=O groups → pKa ≈ 8.3 → deprotonated by KOH. The N⁻ is a good nucleophile but a poor base — ideal for SN2 without E2 side reactions. Works only on 1° alkyl halides.',
        shortLabel: 'Phthalimide-N⁻ + RX',
      },
      {
        // N-alkylphthalimide formed; then hydrolysis
        atoms: [
          mk('pt',  'Phth-N',  195, 165, { label: 'phthalimide ring' }),
          mk('c',   'C',       355, 165, { role: 'alpha_carbon' }),
          mk('r',   'R',       355,  65, { role: 'r_group' }),
          mk('h1',  'H',       355, 265),
          mk('h2',  'H',       455, 225),
          mk('nh2', 'NH₂', 565, 165, { label: 'after hydrolysis', glow: true }),
        ],
        bonds: [bd('pt-c','pt','c'), bd('c-r','c','r'), bd('c-h1','c','h1'), bd('c-h2','c','h2')],
        arrows: [],
        description: 'N-Alkylphthalimide intermediate. Hydrolysis (NH₂NH₂ in EtOH, or H₂O/H⁺ + reflux) cleaves both C=O bonds of the phthalimide ring → releases R-NH₂ (1° amine) + phthalic acid (or phthalhydrazide with NH₂NH₂). Product is exclusively 1° amine — no secondary or tertiary amine contamination.',
        shortLabel: 'N-alkyl phthalimide → R-NH₂',
      },
    ],
    energyDiagram: [
      { label: 'Phthalimide-N⁻ + RX', energy: 30 },
      { label: 'TS (SN2)', energy: 50, isTransitionState: true },
      { label: 'N-alkyl phthalimide', energy: 18 },
      { label: 'R-NH₂ + phthalate', energy: 8 },
    ],
  },

  // ── 2. Hofmann Rearrangement ──────────────────────────────────────────────────
  {
    id: 'hofmann-rearrangement',
    category: 'amine',
    name: 'Hofmann Rearrangement',
    summary: '1° amide + Br₂ + NaOH → 1° amine with ONE FEWER carbon. R migrates from C to N with loss of CO₂. RCONH₂ → RNH₂. Migrating group retains configuration. Useful synthesis of 1° amines from amides.',
    reactants: 'R-CONH₂ (1° amide) + Br₂ + NaOH',
    products: 'R-NH₂ (1° amine, −1C) + CO₂ + NaBr',
    conditions: 'Br₂/NaOH (aqueous); or N-halosuccinimide/base; mild conditions',
    reactantSpecies: {
      text: 'R-CONH₂ (1° amide) + Br₂ + NaOH',
      species: [
        { smiles: '[R]C(=O)N', label: '1° Amide (RCONH₂)' },
        { smiles: 'BrBr', label: 'Br₂' },
      ],
    },
    productSpecies: {
      text: 'R-NH₂ (1° amine, −1C) + CO₂ + NaBr',
      species: [
        { smiles: '[R]N', label: '1° Amine (−1 carbon)', showLonePairs: true },
        { smiles: 'O=C=O', label: 'CO₂' },
      ],
    },
    conditionSpecies: {
      text: 'Br₂/NaOH (aqueous); or N-halosuccinimide/base; mild conditions',
      species: [
        { smiles: 'BrBr', label: 'Br₂' },
        { smiles: '[OH-].[Na+]', label: 'NaOH' },
      ],
    },
    reactionType: 'rearrangement',
    regiochemistry: null,
    stereochemistry: 'retention',
    intermediate: 'Isocyanate (R-N=C=O)',
    reversible: false,
    importantInfo: [
      'R-CO-NH₂ + Br₂ + 2 NaOH → R-NH₂ + NaBr + Na₂CO₃ + H₂O. Net: lose C=O as CO₂.',
      'Mechanism: N-bromo amide → NaOH deprotonates → nitrene-like intermediate → R migrates from C to N → isocyanate → hydrolyzes to carbamic acid → CO₂ + RNH₂.',
      'Migration is intramolecular, front-side (retention): chiral R migrates with retention of config at the migrating C.',
      'Useful for ring contraction: cyclic amide (lactam) → ring-contracted amine.',
      'The isocyanate can be trapped directly by ROH → urethane, or by NH₃ → urea.',
    ],
    brownRef: 'Ch 18.11',
    relatedReactions: ['gabriel-synthesis', 'amine-alkylation'],
    tags: ['Hofmann rearrangement', 'amide', 'Br₂', 'NaOH', 'isocyanate', '−1C', 'amine', 'rearrangement', 'retention'],
    frames: [
      {
        atoms: [
          mk('r',   'R',    200, 165, { role: 'r_group' }),
          mk('c',   'C',    350, 165, { role: 'carbonyl_carbon' }),
          mk('o',   'O',    350,  55, { role: 'carbonyl_oxygen' }),
          mk('n',   'NH₂',  500, 165, { role: 'nucleophile' }),
          mk('br2', 'Br₂',  560, 275, { label: 'NaOH' }),
        ],
        bonds: [bd('r-c','r','c'), bd('c-o','c','o',2), bd('c-n','c','n')],
        arrows: [{ from: { kind: 'atom', id: 'br2' }, to: { kind: 'atom', id: 'n' }, color: 'var(--c-halogen)' }],
        description: 'Br₂/NaOH brominates the N–H of the amide → N-bromo amide. NaOH then deprotonates the remaining N–H → nitrogen anion → lone pair on N expels Br⁻ forming a nitrene (or concerted migration occurs: R migrates from C to N as Br leaves).',
        shortLabel: 'Amide + Br₂/NaOH',
      },
      {
        // Isocyanate intermediate: R-N=C=O
        atoms: [
          mk('r',   'R',    190, 165, { role: 'r_group' }),
          mk('n',   'N',    340, 165, { glow: true }),
          mk('c',   'C',    490, 165, { role: 'carbonyl_carbon' }),
          mk('o',   'O',    630, 165, { role: 'carbonyl_oxygen' }),
        ],
        bonds: [bd('r-n','r','n'), bd('n-c','n','c',2), bd('c-o','c','o',2)],
        arrows: [],
        description: 'Isocyanate intermediate (R-N=C=O): R has migrated from C to N with retention of configuration. The isocyanate is electrophilic at C. H₂O hydrolyzes the isocyanate: R-N=C=O + H₂O → R-NH-COOH (carbamic acid) → RNH₂ + CO₂ (spontaneous decarboxylation).',
        shortLabel: 'Isocyanate R-N=C=O',
      },
      {
        // Product: RNH₂ + CO₂
        atoms: [
          mk('r',   'R',    215, 165, { role: 'r_group' }),
          mk('n',   'NH₂',  365, 165, { glow: true }),
          mk('co2', 'CO₂',  545, 165, { label: 'lost (−1C)' }),
        ],
        bonds: [bd('r-n','r','n')],
        arrows: [],
        description: 'Products: 1° amine R-NH₂ (one fewer carbon than the amide) + CO₂. The migrating R group retains its original configuration. This is the classic way to convert an amide to a shorter amine — useful when the amide is more available than the amine.',
        shortLabel: 'R-NH₂ + CO₂',
      },
    ],
    energyDiagram: [
      { label: 'RCONH₂ + Br₂/NaOH', energy: 35 },
      { label: 'N-bromo amide', energy: 42 },
      { label: 'Isocyanate', energy: 20 },
      { label: 'RNH₂ + CO₂', energy: 8 },
    ],
  },

  // ── 3. Exhaustive Methylation + Hofmann Elimination ──────────────────────────
  {
    id: 'exhaustive-methylation',
    category: 'amine',
    name: 'Exhaustive Methylation (Hofmann Elimination)',
    summary: 'Amine + excess CH₃I → quaternary ammonium salt → Ag₂O → hydroxide → heat → LEAST substituted alkene + trimethylamine. Anti-Zaitsev (Hofmann elimination): the bulky NMe₃⁺ makes the most accessible H the one removed.',
    reactants: 'Amine (any class) + excess CH₃I',
    products: 'Least substituted alkene + N(CH₃)₃',
    conditions: '(1) Excess CH₃I → R-N⁺(CH₃)₃ I⁻; (2) Ag₂O/H₂O → R-N⁺(CH₃)₃ OH⁻; (3) heat → E2',
    reactantSpecies: {
      text: 'Amine + excess CH₃I',
      species: [
        { smiles: '[R]N([R])[R]', label: 'Amine', showLonePairs: true },
        { smiles: 'CI', label: 'CH₃I (excess)' },
      ],
    },
    productSpecies: {
      text: 'Alkene (Hofmann product, less substituted) + N(CH₃)₃',
      species: [
        { smiles: '[R]C=C[R]', label: 'Alkene (Hofmann)' },
        { smiles: 'CN(C)C', label: 'Trimethylamine' },
      ],
    },
    conditionSpecies: {
      text: '(1) Excess CH₃I → R-N⁺(CH₃)₃ I⁻; (2) Ag₂O/H₂O → R-N⁺(CH₃)₃ OH⁻; (3) heat → E2',
      species: [
        { smiles: 'CI', label: 'CH₃I (excess)' },
        { smiles: '[Ag]O[Ag]', label: 'Ag₂O', catalyst: true },
      ],
    },
    reactionType: 'elimination',
    regiochemistry: null,
    stereochemistry: 'anti',
    intermediate: 'Quaternary ammonium hydroxide',
    reversible: false,
    importantInfo: [
      'Methylation: amine + excess CH₃I → quaternary ammonium salt (all N lone pair electrons exhausted).',
      'Ag₂O converts the iodide to hydroxide: R₄N⁺I⁻ + AgOH → R₄N⁺OH⁻ + AgI (precipitation drives equilibrium).',
      'E2 with OH⁻ at N: the bulky NMe₃ group means the LEAST accessible β-H is NOT removed — Hofmann (anti-Zaitsev) regioselectivity → LESS substituted alkene.',
      'Provides structural information: the amine can be reconstructed from the alkene fragments.',
      'Used historically to determine amine structure (now NMR is used instead).',
    ],
    brownRef: 'Ch 23.8',
    relatedReactions: ['e2', 'cope-elimination', 'gabriel-synthesis'],
    tags: ['exhaustive methylation', 'Hofmann elimination', 'quaternary ammonium', 'CH₃I', 'anti-Zaitsev', 'least substituted alkene', 'amine'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',    170, 165, { role: 'r_group' }),
          mk('n',  'N',    320, 165, { glow: true }),
          mk('r2', "R′",   320,  65),
          mk('r3', "R′′",  320, 265),
          mk('mei','CH₃I', 520, 165, { label: 'excess, 3× or 2×' }),
        ],
        bonds: [bd('r1-n','r1','n'), bd('n-r2','n','r2'), bd('n-r3','n','r3')],
        arrows: [{ from: { kind: 'atom', id: 'n' }, to: { kind: 'atom', id: 'mei' }, color: 'var(--c-alkali)' }],
        description: 'Exhaustive methylation: excess CH₃I alkylates the amine until all lone pair reactivity is consumed → quaternary ammonium iodide. N now has 4 C groups and a permanent positive charge. Ag₂O then exchanges I⁻ for OH⁻ to give the quaternary ammonium hydroxide.',
        shortLabel: 'Amine + excess CH₃I → Q-salt',
      },
      {
        atoms: [
          mk('b',   'OH⁻',  155, 165, { charge: '−', role: 'base' }),
          mk('beta','C',    295, 165, { role: 'beta_carbon' }),
          mk('h',   'H',    295,  65, { role: 'h_substituent', label: 'least hindered β-H' }),
          mk('al',  'C',    440, 165, { role: 'alpha_carbon' }),
          mk('nme', 'N⁺Me₃',580, 165, { charge: '+', role: 'leaving_group' }),
        ],
        bonds: [bd('beta-h','beta','h'), bd('beta-al','beta','al'), bd('al-nme','al','nme')],
        arrows: [
          { from: { kind: 'atom', id: 'b' }, to: { kind: 'atom', id: 'h' }, color: 'var(--c-halogen)' },
          { from: { kind: 'bond', id: 'beta-h' }, to: { kind: 'atom', id: 'nme' }, color: 'var(--c-alkali)' },
        ],
        description: 'E2 elimination: OH⁻ removes the least hindered β-H (anti-periplanar to N⁺Me₃). The bulky NMe₃ group is large → the least substituted β-carbon is most accessible → Hofmann product (less substituted alkene). N⁺Me₃ is an excellent leaving group.',
        shortLabel: 'Hofmann E2 elimination',
      },
      {
        atoms: [
          mk('c1', 'C',    280, 165),
          mk('c2', 'C',    420, 165),
          mk('r1', 'R',    160, 225),
          mk('r2', "R′",   520, 225),
          mk('nme','NMe₃', 540,  85, { label: 'trimethylamine' }),
        ],
        bonds: [bd('c1-c2','c1','c2',2), bd('c1-r1','c1','r1'), bd('c2-r2','c2','r2')],
        arrows: [],
        description: 'Products: less substituted alkene (Hofmann product) + trimethylamine (N(CH₃)₃) + H₂O. This contrasts with normal E2 (Zaitsev) which gives the MORE substituted alkene. Hofmann selectivity arises because NMe₃ is so large that the β-H must come from the least crowded position.',
        shortLabel: 'Less-substituted alkene + NMe₃',
      },
    ],
    energyDiagram: [
      { label: 'Q-ammonium hydroxide', energy: 35 },
      { label: 'TS (Hofmann E2)', energy: 55, isTransitionState: true },
      { label: 'Alkene + NMe₃', energy: 12 },
    ],
  },

  // ── 4. Direct Alkylation of Amines ───────────────────────────────────────────
  {
    id: 'amine-alkylation',
    category: 'amine',
    name: 'Direct Alkylation of Amines',
    summary: 'Amine + alkyl halide → SN2 alkylation. PROBLEM: the product amine is ALSO nucleophilic → continues reacting → mixture of 1°, 2°, 3° amines + quaternary salt. Gabriel synthesis and reductive amination give cleaner results.',
    reactants: 'RNH₂ + R′X (or R₂NH + R′X)',
    products: 'Mixture of 1°, 2°, 3° amines + R₄N⁺X⁻',
    conditions: 'No catalyst needed; polar aprotic solvent preferred; difficult to stop at one alkylation',
    reactantSpecies: {
      text: 'RNH₂ + R′X (or R₂NH + R′X)',
      species: [
        { smiles: '[R]N', label: 'Amine (RNH₂)', showLonePairs: true },
        { smiles: "[R]Br", label: "R'X (alkyl halide)" },
      ],
    },
    productSpecies: {
      text: 'Mixture of 1°, 2°, 3° amines + R₄N⁺X⁻',
      species: [
        { smiles: '[R]N([R])[R]', label: '3° Amine' },
        { smiles: '[R][N+]([R])([R])[R]', label: 'Quaternary salt (R₄N⁺)' },
      ],
    },
    conditionSpecies: {
      text: 'No catalyst needed; polar aprotic solvent preferred; difficult to stop at one alkylation',
      species: [
        { smiles: 'C1CCCCC1', label: 'Polar aprotic solvent', catalyst: true },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    reversible: false,
    importantInfo: [
      'The fundamental problem: each alkylation product is MORE nucleophilic than the starting material (more electron density on N).',
      'NH₃ → 1°RNH₂ → 2°R₂NH → 3°R₃N → 4° salt. All four are present if excess R-X is used.',
      'Can force to quaternary salt by using large excess of R-X. Can get mostly 1° amine with very large excess of NH₃ (statistical control, not practical).',
      'Better methods: Gabriel synthesis (clean 1° amine), reductive amination (clean 1° or 2° amine from C=O).',
      'Works cleanly for: making quaternary ammonium salts (just use excess alkylating agent).',
    ],
    brownRef: 'Ch 23.3',
    relatedReactions: ['gabriel-synthesis', 'reductive-amination', 'exhaustive-methylation'],
    tags: ['amine alkylation', 'SN2', 'over-alkylation', 'mixture', 'amines', 'quaternary salt', 'limitation'],
    frames: [
      {
        atoms: [
          mk('n',   'NH₃',  200, 165, { role: 'nucleophile', label: 'or R-NH₂' }),
          mk('c',   'C',    390, 165, { role: 'alpha_carbon' }),
          mk('x',   'X',    530, 165, { role: 'leaving_group' }),
          mk('r',   'R',    390,  65, { role: 'r_group' }),
        ],
        bonds: [bd('c-x','c','x'), bd('c-r','c','r')],
        arrows: [{ from: { kind: 'atom', id: 'n' }, to: { kind: 'atom', id: 'c' }, color: 'var(--c-alkali)' }],
        description: 'Amine attacks R–X (SN2). But the product is also an amine — still has a lone pair. R′–NH₂ product is often more nucleophilic than the original NH₃ (alkyl groups are electron-donating → more electron density on N). The reaction does not stop at monoalkylation.',
        shortLabel: 'Amine + R-X (SN2)',
      },
      {
        atoms: [
          mk('rnh2', 'RNH₂', 130, 120, { label: '1° (small amount)' }),
          mk('r2nh', 'R₂NH',  350, 120, { label: '2° (some)' }),
          mk('r3n',  'R₃N',   570, 120, { label: '3° (some)' }),
          mk('r4n',  'R₄N⁺',  350, 250, { label: '4° salt (if excess RX)', charge: '+', glow: true }),
        ],
        bonds: [],
        arrows: [],
        description: 'Product mixture: 1°, 2°, 3° amines + quaternary salt (if excess RX). The ratio depends on relative amounts and reaction conditions. This is why direct alkylation is NOT the preferred method for making 1° or 2° amines — use Gabriel or reductive amination instead.',
        shortLabel: 'Mixed amines (problem!)',
      },
    ],
    energyDiagram: [
      { label: 'Amine + R-X', energy: 30 },
      { label: 'TS (SN2)', energy: 48, isTransitionState: true },
      { label: 'Alkylated amine + HX', energy: 12 },
    ],
  },

  // ── 5. Cope Elimination ───────────────────────────────────────────────────────
  {
    id: 'cope-elimination',
    category: 'amine',
    name: 'Cope Elimination',
    summary: 'Amine oxide (from amine + H₂O₂ or mCPBA) → heated → alkene + hydroxylamine. Syn elimination via 5-membered cyclic transition state. Mild, selective. Complementary to Hofmann elimination.',
    reactants: 'Tertiary amine oxide (R₃N→O)',
    products: 'Alkene + hydroxylamine (R₂NOH)',
    conditions: 'Step 1: amine + H₂O₂ or mCPBA → amine oxide; Step 2: heat (100–150 °C) → syn elimination',
    reactantSpecies: {
      text: '3° Amine + H₂O₂ → amine oxide; then heat',
      species: [
        { smiles: '[R]N([R])[R]', label: '3° Amine', showLonePairs: true },
        { smiles: 'OO', label: 'H₂O₂' },
      ],
    },
    productSpecies: {
      text: 'Alkene + hydroxylamine (Hofmann product)',
      species: [
        { smiles: '[R]C=C[R]', label: 'Alkene (Cope product)' },
        { smiles: '[R]NO', label: 'Hydroxylamine fragment' },
      ],
    },
    conditionSpecies: {
      text: 'Step 1: amine + H₂O₂ or mCPBA → amine oxide; Step 2: heat (100–150 °C) → syn elimination',
      species: [
        { smiles: 'OO', label: 'H₂O₂' },
      ],
    },
    reactionType: 'elimination',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: 'Cyclic 5-membered TS',
    reversible: false,
    importantInfo: [
      'Syn elimination (not anti like E2): the O abstracts the syn-periplanar β-H via a 5-membered cyclic TS.',
      'Syn selectivity: the reacting β-H must be SYN to the N-oxide oxygen — determines which alkene forms.',
      'Mild conditions compared to Hofmann elimination (no strong base, lower temperature).',
      'Regioselectivity: follows syn geometry → not simply Hofmann or Zaitsev but depends on available syn β-H.',
      'Used in synthesis to introduce alkenes with mild, base-free conditions.',
    ],
    brownRef: 'Ch 23.8',
    relatedReactions: ['exhaustive-methylation', 'e2', 'baeyer-villiger'],
    tags: ['Cope elimination', 'amine oxide', 'syn elimination', '5-membered TS', 'hydroxylamine', 'mCPBA', 'H₂O₂'],
    frames: [
      {
        // Amine oxide: R₃N⁺-O⁻
        atoms: [
          mk('r1',  "R′",   165, 165, { role: 'r_group' }),
          mk('n',   'N',    310, 165, { charge: '+', glow: true }),
          mk('o',   'O',    310,  55, { charge: '−', role: 'nucleophile', label: 'mCPBA or H₂O₂' }),
          mk('r2',  "R′′",  430, 165, { role: 'r_group' }),
          mk('beta','CH₂',  560, 165, { role: 'beta_carbon' }),
        ],
        bonds: [bd('r1-n','r1','n'), bd('n-o','n','o'), bd('n-r2','n','r2'), bd('n-beta','n','beta')],
        arrows: [],
        description: 'Amine oxide (made by oxidizing the amine with H₂O₂ or mCPBA): N has a formal + charge, O has a − charge. On heating, the O acts as a base to abstract a β-H via a 5-membered cyclic transition state (not intermolecular).',
        shortLabel: 'Amine oxide (R₃N⁺O⁻)',
      },
      {
        // 5-membered cyclic TS: O abstracts β-H, N leaves from α-C
        atoms: [
          mk('o',    'O',    350,  85, { role: 'base' }),
          mk('h',    'H',    485,  85, { role: 'h_substituent' }),
          mk('beta', 'C',    520, 200, { role: 'beta_carbon' }),
          mk('alpha','C',    350, 290, { role: 'alpha_carbon' }),
          mk('nr2',  'NR₂',  200, 200, { role: 'leaving_group' }),
        ],
        bonds: [
          bd('o-n','o','nr2'), bd('nr2-alpha','nr2','alpha'),
          bd('alpha-beta','alpha','beta'), bd('beta-h','beta','h'),
        ],
        arrows: [
          { from: { kind: 'atom', id: 'o' }, to: { kind: 'atom', id: 'h' }, color: 'var(--c-alkali)' },
          { from: { kind: 'bond', id: 'beta-h' }, to: { kind: 'atom', id: 'nr2' }, color: 'var(--c-halogen)' },
        ],
        description: '5-Membered cyclic transition state: O abstracts the syn-β-H simultaneously as C–N bond breaks. This is SYN elimination (the β-H and NR₂ must be on the SAME face). Compare to E2 (anti-periplanar H and LG required). Cope TS is concerted and intramolecular.',
        shortLabel: '5-membered cyclic TS',
      },
      {
        // Products: alkene + hydroxylamine
        atoms: [
          mk('c1', 'C',    260, 165),
          mk('c2', 'C',    420, 165),
          mk('r',  'R',    150, 235),
          mk('nr2','HO-NR₂',555, 165, { label: 'hydroxylamine byproduct' }),
        ],
        bonds: [bd('c1-c2','c1','c2',2), bd('c1-r','c1','r')],
        arrows: [],
        description: 'Products: alkene (syn elimination product) + hydroxylamine (HO-NR₂). The alkene geometry is determined by which β-H is syn to the N-oxide. Cope elimination is useful because it requires no strong base, proceeds under mild conditions, and can be done on sensitive substrates.',
        shortLabel: 'Alkene + HONR₂',
      },
    ],
    energyDiagram: [
      { label: 'Amine oxide', energy: 32 },
      { label: 'Cyclic 5-membered TS', energy: 52, isTransitionState: true },
      { label: 'Alkene + hydroxylamine', energy: 15 },
    ],
  },
]

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

export const OX_RED_REACTIONS: ReactionDef[] = [

  // ── 1. Ozonolysis (Reductive Workup) ──────────────────────────────────────────
  {
    id: 'ozonolysis-alkene-reductive',
    category: 'oxidation_reduction',
    name: 'Ozonolysis of Alkenes (Reductive Workup)',
    summary: 'Alkene + O₃ → ozonide → reductive workup (DMS or Zn/AcOH) → 2 carbonyl fragments. The C=C is COMPLETELY CLEAVED. Reductive workup preserves aldehydes (no over-oxidation). Use to determine alkene structure from the fragments.',
    reactants: 'Alkene + O₃',
    products: '2 carbonyl compounds (aldehyde + ketone, or 2 aldehydes)',
    conditions: 'O₃/CH₂Cl₂ at −78 °C; then DMS (dimethyl sulfide) or Zn/AcOH for reductive workup',
    reactantSpecies: {
      text: 'Alkene + O₃',
      species: [
        { smiles: '[R]C=C[R]', label: 'Alkene' },
        { smiles: '[O-][O+]=O', label: 'O₃ (ozone)' },
      ],
    },
    productSpecies: {
      text: '2 carbonyl compounds (aldehyde + ketone, or 2 aldehydes)',
      species: [
        { smiles: '[R]C=O', label: 'Carbonyl fragment 1' },
        { smiles: '[R]C=O', label: 'Carbonyl fragment 2' },
      ],
    },
    conditionSpecies: {
      text: 'O₃/CH₂Cl₂ at −78 °C; then DMS (dimethyl sulfide) or Zn/AcOH for reductive workup',
      species: [
        { smiles: '[O-][O+]=O', label: 'O₃' },
        { smiles: 'CSC', label: 'DMS (reductive workup)' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Molozonide → ozonide',
    reversible: false,
    importantInfo: [
      'C=C is completely cleaved: =CH₂ → CH₂O (formaldehyde), =CHR → RCHO (aldehyde), =CR₂ → R₂CO (ketone).',
      'Reductive workup (DMS or Zn/AcOH): preserves aldehydes — does NOT over-oxidize to RCOOH.',
      'Oxidative workup (H₂O₂): aldehydes further oxidized to RCOOH; =CR₂ still → R₂CO.',
      'Diagnostic tool: work backward from the carbonyl fragments to determine the original alkene structure.',
      'At −78 °C: prevents runaway oxidation; ozonide is unstable at higher temperatures (explosive).',
    ],
    brownRef: 'Ch 6.10',
    relatedReactions: ['ozonolysis-alkene-oxidative', 'ozonolysis-alkyne', 'hydroxylation-alkene'],
    tags: ['ozonolysis', 'alkene', 'O₃', 'DMS', 'reductive workup', 'aldehyde', 'ketone', 'cleavage'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',   200, 165, { role: 'r_group' }),
          mk('c1', 'C',   310, 165, { role: 'more_substituted' }),
          mk('c2', 'C',   450, 165, { role: 'less_substituted' }),
          mk('r2', "R′",  560, 165, { role: 'r_group' }),
          mk('h',  'H',   450,  65),
          mk('o3', 'O₃',  375, 280, { label: '−78 °C' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2',2), bd('c2-r2','c2','r2'), bd('c2-h','c2','h')],
        arrows: [{ from: { kind: 'atom', id: 'o3' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-halogen)' }],
        description: 'O₃ adds to the C=C (electrophilic attack on the π bond) → molozonide (1,2,3-trioxolane) → rearranges to ozonide (1,2,4-trioxolane). The ozonide is the stable intermediate that is worked up reductively.',
        shortLabel: 'Alkene + O₃',
      },
      {
        atoms: [
          mk('r1', 'R',   165, 165),
          mk('c1', 'C',   295, 165, { role: 'carbonyl_carbon' }),
          mk('o1', 'O',   295,  55, { role: 'carbonyl_oxygen' }),
          mk('c2', 'C',   495, 165, { role: 'carbonyl_carbon' }),
          mk('o2', 'O',   495,  55, { role: 'carbonyl_oxygen' }),
          mk('r2', "R′",  615, 165),
          mk('h',  'H',   495, 265),
          mk('sme','DMS', 375, 285, { label: 'reductive workup' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-o1','c1','o1',2), bd('c2-o2','c2','o2',2), bd('c2-r2','c2','r2'), bd('c2-h','c2','h')],
        arrows: [],
        description: 'Reductive workup (DMS): C=C completely cleaved into two carbonyl fragments. R₂C=CHR′ → R₂CO (ketone) + R′CHO (aldehyde). DMS reduces the ozonide without over-oxidizing the aldehyde. Compare: if using oxidative workup (H₂O₂), the CHO would become COOH.',
        shortLabel: 'R₂CO + R′CHO',
      },
    ],
    energyDiagram: [
      { label: 'Alkene + O₃', energy: 40 },
      { label: 'Ozonide', energy: 25 },
      { label: 'Fragments', energy: 15 },
    ],
  },

  // ── 2. Ozonolysis (Oxidative Workup) ─────────────────────────────────────────
  {
    id: 'ozonolysis-alkene-oxidative',
    category: 'oxidation_reduction',
    name: 'Ozonolysis of Alkenes (Oxidative Workup)',
    summary: 'Same O₃ step as reductive ozonolysis, but oxidative workup (H₂O₂) further oxidizes aldehydes to carboxylic acids. Ketones are NOT affected. Use when you want RCOOH fragments instead of RCHO.',
    reactants: 'Alkene + O₃',
    products: 'Carboxylic acid (from =CHR) + ketone (from =CR₂)',
    conditions: 'O₃/CH₂Cl₂ at −78 °C; then H₂O₂ (oxidative workup)',
    reactantSpecies: {
      text: 'Alkene + O₃',
      species: [
        { smiles: '[R]C=C[R]', label: 'Alkene' },
        { smiles: '[O-][O+]=O', label: 'O₃ (ozone)' },
      ],
    },
    productSpecies: {
      text: 'Carboxylic acid (from =CHR) + ketone (from =CR₂)',
      species: [
        { smiles: '[R]C(=O)O', label: 'Carboxylic acid (from =CHR)' },
        { smiles: '[R]C(=O)[R]', label: 'Ketone (from =CR₂)' },
      ],
    },
    conditionSpecies: {
      text: 'O₃/CH₂Cl₂ at −78 °C; then H₂O₂ (oxidative workup)',
      species: [
        { smiles: '[O-][O+]=O', label: 'O₃' },
        { smiles: 'OO', label: 'H₂O₂ (oxidative workup)' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Ozonide → aldehyde → carboxylic acid',
    reversible: false,
    importantInfo: [
      'Oxidative workup (H₂O₂): =CHR → RCOOH (carboxylic acid), NOT RCHO. =CR₂ → R₂CO (ketone, unchanged).',
      'Reductive workup (DMS): =CHR → RCHO (aldehyde). Choose based on desired product.',
      'Terminal alkene (=CH₂): reductive → CH₂O (formaldehyde), oxidative → CO₂ + H₂O (CO₂ is volatile, lost).',
      'Diagnostic: if fragment is an acid, the original carbon bore 1 R + H. If ketone, 2 R groups.',
    ],
    brownRef: 'Ch 6.10',
    relatedReactions: ['ozonolysis-alkene-reductive', 'ozonolysis-alkyne'],
    tags: ['ozonolysis', 'alkene', 'O₃', 'H₂O₂', 'oxidative workup', 'carboxylic acid', 'cleavage'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',   200, 165, { role: 'r_group' }),
          mk('c1', 'C',   310, 165),
          mk('c2', 'C',   450, 165),
          mk('r2', "R′",  560, 165, { role: 'r_group' }),
          mk('h',  'H',   450,  65),
          mk('o3', 'O₃',  375, 280, { label: 'then H₂O₂' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2',2), bd('c2-r2','c2','r2'), bd('c2-h','c2','h')],
        arrows: [{ from: { kind: 'atom', id: 'o3' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-halogen)' }],
        description: 'Same O₃ step: C=C → ozonide. Then oxidative workup with H₂O₂. The ozonide fragments become an aldehyde, which H₂O₂ immediately oxidizes to a carboxylic acid. Ketone fragments are stable to H₂O₂ and survive unchanged.',
        shortLabel: 'Alkene + O₃, then H₂O₂',
      },
      {
        atoms: [
          mk('r1', 'R',    165, 165),
          mk('c1', 'C',    295, 165, { role: 'carbonyl_carbon' }),
          mk('o1', 'O',    295,  55, { role: 'carbonyl_oxygen' }),
          mk('oh', 'OH',   430, 165),
          mk('c2', 'C',    540, 165, { role: 'carbonyl_carbon' }),
          mk('o2', 'O',    540,  55, { role: 'carbonyl_oxygen' }),
          mk('r2', "R′",   650, 165),
          mk('h',  'H',    540, 265),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-o1','c1','o1',2), bd('c1-oh','c1','oh'), bd('c2-o2','c2','o2',2), bd('c2-r2','c2','r2'), bd('c2-h','c2','h')],
        arrows: [],
        description: 'Products: RCOOH (carboxylic acid) from the CHR fragment + R′CHO (or R′₂CO if no H on that carbon). Oxidative workup converts CHO → COOH in situ. Choose reductive if you want the aldehyde; oxidative if you want the acid.',
        shortLabel: 'RCOOH + R′CHO',
      },
    ],
    energyDiagram: [
      { label: 'Alkene + O₃', energy: 40 },
      { label: 'Ozonide + H₂O₂', energy: 25 },
      { label: 'RCOOH', energy: 10 },
    ],
  },

  // ── 3. Ozonolysis of Alkynes ──────────────────────────────────────────────────
  {
    id: 'ozonolysis-alkyne',
    category: 'oxidation_reduction',
    name: 'Ozonolysis of Alkynes',
    summary: 'Alkyne + O₃ + H₂O → 2 carboxylic acids regardless of workup conditions. Alkynes always give carboxylic acids (not aldehydes). Terminal alkynes give CO₂ + RCOOH.',
    reactants: 'R-C≡C-R′ + O₃',
    products: 'RCOOH + R′COOH (2 carboxylic acids)',
    conditions: 'O₃; then H₂O workup; terminal alkyne: one product is CO₂',
    reactantSpecies: {
      text: 'R-C≡C-R′ + O₃',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
        { smiles: '[O-][O+]=O', label: 'O₃ (ozone)' },
      ],
    },
    productSpecies: {
      text: 'RCOOH + R′COOH (2 carboxylic acids)',
      species: [
        { smiles: '[R]C(=O)O', label: 'RCOOH' },
        { smiles: '[R]C(=O)O', label: "R'COOH" },
      ],
    },
    conditionSpecies: {
      text: 'O₃; then H₂O workup; terminal alkyne: one product is CO₂',
      species: [
        { smiles: '[O-][O+]=O', label: 'O₃' },
        { smiles: 'O', label: 'H₂O (workup)' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    reversible: false,
    importantInfo: [
      'Alkynes ALWAYS give carboxylic acids under all ozonolysis conditions (no aldehyde intermediate survives).',
      'Internal alkyne R-C≡C-R′ → RCOOH + R′COOH.',
      'Terminal alkyne R-C≡CH → RCOOH + CO₂ (terminal carbon = CO₂, which is lost as gas).',
      'Useful for structural determination: identify two acid fragments → reconstruct the alkyne.',
      'Less commonly used than alkene ozonolysis because alkynes are often easier to cleave by KMnO₄.',
    ],
    brownRef: 'Ch 7.9',
    relatedReactions: ['ozonolysis-alkene-reductive', 'oxidative-cleavage-alkyne'],
    tags: ['ozonolysis', 'alkyne', 'O₃', 'carboxylic acid', 'cleavage', 'terminal alkyne', 'CO₂'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',   195, 165, { role: 'r_group' }),
          mk('c1', 'C',   310, 165),
          mk('c2', 'C',   450, 165),
          mk('r2', "R′",  565, 165, { role: 'r_group' }),
          mk('o3', 'O₃',  380, 285, { label: 'then H₂O' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2',3), bd('c2-r2','c2','r2')],
        arrows: [{ from: { kind: 'atom', id: 'o3' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-halogen)' }],
        description: 'Internal alkyne R-C≡C-R′: both carbons have R groups → both become carboxylic acids (no H on C → no possibility of stopping at aldehyde level). The triple bond requires more oxidation than a double bond.',
        shortLabel: 'Alkyne + O₃',
      },
      {
        atoms: [
          mk('r1',  'R',   165, 165),
          mk('c1',  'C',   295, 165, { role: 'carbonyl_carbon' }),
          mk('o11', 'O',   295,  55, { role: 'carbonyl_oxygen' }),
          mk('oh1', 'OH',  430, 165),
          mk('c2',  'C',   540, 165, { role: 'carbonyl_carbon' }),
          mk('o21', 'O',   540,  55, { role: 'carbonyl_oxygen' }),
          mk('oh2', 'OH',  665, 165),
          mk('r2',  "R′",  540, 265),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-o11','c1','o11',2), bd('c1-oh1','c1','oh1'), bd('c2-o21','c2','o21',2), bd('c2-oh2','c2','oh2'), bd('c2-r2','c2','r2')],
        arrows: [],
        description: 'Two carboxylic acids RCOOH and R′COOH. No aldehydes — the alkyne carbons are more oxidized than alkene carbons. For terminal alkyne R-C≡CH: the terminal C gives CO₂ (gas) because it has no R substituent. Fragments identify the original alkyne.',
        shortLabel: 'RCOOH + R′COOH',
      },
    ],
    energyDiagram: [
      { label: 'Alkyne + O₃', energy: 42 },
      { label: 'Intermediate', energy: 28 },
      { label: '2 RCOOH', energy: 10 },
    ],
  },

  // ── 4. Hydroxylation of Alkenes ───────────────────────────────────────────────
  {
    id: 'hydroxylation-alkene',
    category: 'oxidation_reduction',
    name: 'Hydroxylation of Alkenes (syn-Dihydroxylation)',
    summary: 'OsO₄ (cat., with NMO) or cold KMnO₄ → vicinal diol (1,2-diol). SYN addition — both OH groups added to the same face of the alkene. Hot/conc. KMnO₄ cleaves the alkene instead.',
    reactants: 'Alkene + OsO₄/NMO (or cold, dil. KMnO₄)',
    products: 'Vicinal diol (1,2-diol, syn)',
    conditions: 'OsO₄ (cat.)/NMO (N-methylmorpholine N-oxide); or cold, dilute KMnO₄; aqueous/acetone',
    reactantSpecies: {
      text: 'Alkene + OsO₄/NMO (or cold, dil. KMnO₄)',
      species: [
        { smiles: '[R]C=C[R]', label: 'Alkene' },
        { smiles: 'O=[Os](=O)(=O)=O', label: 'OsO₄' },
      ],
    },
    productSpecies: {
      text: 'Vicinal diol (1,2-diol, syn)',
      species: [
        { smiles: '[R][C@@H](O)[C@H](O)[R]', label: 'cis-1,2-Diol (syn)' },
      ],
    },
    conditionSpecies: {
      text: 'OsO₄ (cat.)/NMO (N-methylmorpholine N-oxide); or cold, dilute KMnO₄; aqueous/acetone',
      species: [
        { smiles: 'O=[Os](=O)(=O)=O', label: 'OsO₄', catalyst: true },
        { smiles: 'CN1CC[N+](=O)CC1=O', label: 'NMO (reoxidant)' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: 'Osmate ester (cyclic OsO₄ adduct)',
    reversible: false,
    importantInfo: [
      'SYN addition — both OH groups come from the SAME face of the alkene (concerted [3+2] cycloaddition).',
      'OsO₄ is better: catalytic (uses NMO to regenerate), more selective, controlled. But toxic — handle with care.',
      'Cold, dilute KMnO₄ (purple → colorless = positive test for alkene): also syn, less selective.',
      'Hot, concentrated KMnO₄ → CLEAVES the alkene (same outcome as ozonolysis with oxidative workup).',
      'Anti-dihydroxylation: epoxidize first (mCPBA) → acid-catalyzed ring opening with H₂O → trans (anti) diol.',
    ],
    brownRef: 'Ch 6.8',
    relatedReactions: ['ozonolysis-alkene-reductive', 'oxidative-cleavage-diol'],
    tags: ['dihydroxylation', 'OsO₄', 'KMnO₄', 'vicinal diol', 'syn', 'alkene', 'oxidation', 'NMO'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',   200, 165, { role: 'r_group' }),
          mk('c1', 'C',   310, 165, { role: 'more_substituted' }),
          mk('c2', 'C',   450, 165, { role: 'less_substituted' }),
          mk('r2', "R′",  560, 165, { role: 'r_group' }),
          mk('h1', 'H',   310,  65),
          mk('h2', 'H',   450,  65),
          mk('os', 'OsO₄',380, 290, { label: 'cat./NMO' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2',2), bd('c2-r2','c2','r2'), bd('c1-h1','c1','h1'), bd('c2-h2','c2','h2')],
        arrows: [{ from: { kind: 'atom', id: 'os' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-halogen)' }],
        description: 'OsO₄ reacts with the alkene in a concerted [3+2] cycloaddition: both Os–O bonds form simultaneously on the SAME face of the alkene. The osmate ester intermediate (5-membered ring with Os) is hydrolyzed by NMO to give the diol.',
        shortLabel: 'Alkene + OsO₄/NMO',
      },
      {
        atoms: [
          mk('r1', 'R',   190, 165),
          mk('c1', 'C',   300, 165),
          mk('oh1','OH',  300,  55, { glow: true }),
          mk('c2', 'C',   455, 165),
          mk('oh2','OH',  455,  55, { glow: true }),
          mk('r2', "R′",  565, 165),
          mk('h1', 'H',   300, 265),
          mk('h2', 'H',   455, 265),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-oh1','c1','oh1',1,'wedge'), bd('c1-c2','c1','c2'), bd('c2-oh2','c2','oh2',1,'wedge'), bd('c2-r2','c2','r2'), bd('c1-h1','c1','h1',1,'dash-wedge'), bd('c2-h2','c2','h2',1,'dash-wedge')],
        arrows: [],
        description: 'syn-Diol product: both OH groups on the SAME face (both wedge bonds — same side delivery). This is a meso compound if the two R groups are the same. Anti-dihydroxylation (trans diol): use mCPBA epoxidation → acid-catalyzed ring opening gives anti addition (Walden inversion at one C).',
        shortLabel: 'syn-1,2-Diol',
      },
    ],
    energyDiagram: [
      { label: 'Alkene + OsO₄', energy: 35 },
      { label: 'Osmate ester (TS-like)', energy: 45, isTransitionState: true },
      { label: 'syn-Diol', energy: 10 },
    ],
  },

  // ── 5. Oxidative Cleavage of 1,2-Diols ───────────────────────────────────────
  {
    id: 'oxidative-cleavage-diol',
    category: 'oxidation_reduction',
    name: 'Oxidative Cleavage of 1,2-Diols (HIO₄)',
    summary: 'Vicinal 1,2-diol + HIO₄ (periodic acid) → cleaves the C–C bond between the two OH groups → 2 carbonyl compounds. Used in sequence with OsO₄ dihydroxylation as an alternative to ozonolysis.',
    reactants: '1,2-Diol + HIO₄ (or NaIO₄)',
    products: '2 carbonyl compounds (aldehydes or ketones)',
    conditions: 'HIO₄ or NaIO₄; aqueous; room temperature; 1,2-diol required (vicinal diols only)',
    reactantSpecies: {
      text: 'Vicinal diol + HIO₄',
      species: [
        { smiles: '[R]C(O)C(O)[R]', label: 'Vicinal diol (1,2-diol)' },
        { smiles: 'OI(=O)(=O)=O', label: 'HIO₄ (periodic acid)' },
      ],
    },
    productSpecies: {
      text: '2 carbonyl compounds',
      species: [
        { smiles: '[R]C=O', label: 'Carbonyl fragment 1' },
        { smiles: '[R]C=O', label: 'Carbonyl fragment 2' },
      ],
    },
    conditionSpecies: {
      text: 'HIO₄ or NaIO₄; aqueous; room temperature; 1,2-diol required (vicinal diols only)',
      species: [
        { smiles: 'OI(=O)(=O)=O', label: 'HIO₄' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Cyclic iodate ester',
    reversible: false,
    importantInfo: [
      'HIO₄ ONLY cleaves VICINAL (1,2) diols — the two OH groups must be on adjacent carbons.',
      'Products: CHOH → CHO (aldehyde); C(OH)(R) → CO+R (ketone); 1,2-diol from a trisubstituted diol gives a ketone + aldehyde.',
      'Mechanism: cyclic 5-membered iodate ester intermediate → concerted fragmentation.',
      'Used in series with OsO₄: alkene → syn-diol → cleavage. Same net result as ozonolysis but potentially different selectivity.',
      '1,3-Diols do NOT react with HIO₄ — the distance is too long for the cyclic ester.',
    ],
    brownRef: 'Ch 6.8',
    relatedReactions: ['hydroxylation-alkene', 'ozonolysis-alkene-reductive'],
    tags: ['periodic acid', 'HIO₄', '1,2-diol', 'cleavage', 'oxidation', 'vicinal diol', 'aldehyde', 'ketone'],
    frames: [
      {
        atoms: [
          mk('r1',  'R',   170, 165, { role: 'r_group' }),
          mk('c1',  'C',   290, 165),
          mk('oh1', 'OH',  290,  55),
          mk('c2',  'C',   440, 165),
          mk('oh2', 'OH',  440,  55),
          mk('r2',  "R′",  550, 165, { role: 'r_group' }),
          mk('h1',  'H',   290, 265),
          mk('h2',  'H',   440, 265),
          mk('io4', 'HIO₄',380, 300, { label: 'periodate' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-oh1','c1','oh1'), bd('c1-c2','c1','c2'), bd('c2-oh2','c2','oh2'), bd('c2-r2','c2','r2'), bd('c1-h1','c1','h1'), bd('c2-h2','c2','h2')],
        arrows: [{ from: { kind: 'atom', id: 'io4' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-halogen)' }],
        description: 'Vicinal diol: the two OH groups form a cyclic 5-membered iodate ester with HIO₄. The ring then undergoes concerted fragmentation, breaking the C–C bond. Both OH groups must be on adjacent carbons (1,2-diol); 1,3-diols do not react.',
        shortLabel: '1,2-Diol + HIO₄',
      },
      {
        atoms: [
          mk('r1', 'R',    165, 165),
          mk('c1', 'C',    295, 165, { role: 'carbonyl_carbon' }),
          mk('o1', 'O',    295,  55, { role: 'carbonyl_oxygen' }),
          mk('h1', 'H',    295, 265),
          mk('c2', 'C',    495, 165, { role: 'carbonyl_carbon' }),
          mk('o2', 'O',    495,  55, { role: 'carbonyl_oxygen' }),
          mk('r2', "R′",   605, 165),
          mk('h2', 'H',    495, 265),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-o1','c1','o1',2), bd('c1-h1','c1','h1'), bd('c2-o2','c2','o2',2), bd('c2-r2','c2','r2'), bd('c2-h2','c2','h2')],
        arrows: [],
        description: 'Two carbonyl fragments after C–C cleavage. CHOH → CHO (aldehyde); C(OH)(R)(R′) → R′R′′C=O (ketone). Sequence: OsO₄ dihydroxylation → HIO₄ cleavage = net equivalent of ozonolysis with reductive workup.',
        shortLabel: '2 Carbonyl fragments',
      },
    ],
    energyDiagram: [
      { label: '1,2-Diol + HIO₄', energy: 35 },
      { label: 'Cyclic iodate ester', energy: 40, isTransitionState: true },
      { label: '2 Carbonyls + HIO₃', energy: 12 },
    ],
  },

  // ── 6. Oxidative Cleavage of Alkynes ─────────────────────────────────────────
  {
    id: 'oxidative-cleavage-alkyne',
    category: 'oxidation_reduction',
    name: 'Oxidative Cleavage of Alkynes (KMnO₄)',
    summary: 'Internal alkyne + KMnO₄ or O₃ → 2 carboxylic acids. Terminal alkyne → carboxylic acid + CO₂. Determines alkyne structure from the acid fragments.',
    reactants: 'R-C≡C-R′ + KMnO₄ (hot, conc.)',
    products: 'RCOOH + R′COOH',
    conditions: 'Hot, conc. KMnO₄/H₂O; or O₃/H₂O; strong oxidizing conditions',
    reactantSpecies: {
      text: 'R-C≡C-R′ + KMnO₄ (hot, conc.)',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
        { smiles: '[O-][Mn](=O)(=O)=O.[K+]', label: 'KMnO₄' },
      ],
    },
    productSpecies: {
      text: 'RCOOH + R′COOH',
      species: [
        { smiles: '[R]C(=O)O', label: 'RCOOH' },
        { smiles: "[R]C(=O)O", label: "R'COOH" },
      ],
    },
    conditionSpecies: {
      text: 'Hot, conc. KMnO₄/H₂O; or O₃/H₂O; strong oxidizing conditions',
      species: [
        { smiles: '[O-][Mn](=O)(=O)=O.[K+]', label: 'KMnO₄ (hot, conc.)' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    reversible: false,
    importantInfo: [
      'Internal alkyne R-C≡C-R′ → RCOOH + R′COOH (2 carboxylic acids).',
      'Terminal alkyne R-C≡CH → RCOOH + CO₂ (terminal CH = CO₂, no carboxylic acid from that end).',
      'Structural determination: identify the two carboxylic acid fragments → determine original alkyne connectivity.',
      'Compare to ozonolysis of alkynes (same outcome — both give RCOOH).',
      'Hot KMnO₄ also cleaves alkenes → same types of fragments (aldehydes oxidized to acids, ketones stable).',
    ],
    brownRef: 'Ch 7.9',
    relatedReactions: ['ozonolysis-alkyne', 'oxidative-cleavage-diol'],
    tags: ['alkyne cleavage', 'KMnO₄', 'oxidation', 'carboxylic acid', 'structural determination', 'terminal alkyne'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',   195, 165, { role: 'r_group' }),
          mk('c1', 'C',   310, 165),
          mk('c2', 'C',   450, 165),
          mk('r2', "R′",  565, 165, { role: 'r_group' }),
          mk('km', 'KMnO₄',380, 285, { label: 'hot, conc.' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2',3), bd('c2-r2','c2','r2')],
        arrows: [{ from: { kind: 'atom', id: 'km' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-halogen)' }],
        description: 'Hot, concentrated KMnO₄ oxidatively cleaves the C≡C triple bond. Both carbons are oxidized to carboxylic acids (no stopping point at aldehyde level with alkynes). Terminal alkynes: the ≡CH gives CO₂.',
        shortLabel: 'Alkyne + KMnO₄',
      },
      {
        atoms: [
          mk('r1',  'R',    165, 165),
          mk('c1',  'C',    295, 165),
          mk('o11', 'O',    295,  55),
          mk('oh1', 'OH',   430, 165),
          mk('c2',  'C',    540, 165),
          mk('o21', 'O',    540,  55),
          mk('oh2', 'OH',   665, 165),
          mk('r2',  "R′",   540, 265),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-o11','c1','o11',2), bd('c1-oh1','c1','oh1'), bd('c2-o21','c2','o21',2), bd('c2-oh2','c2','oh2'), bd('c2-r2','c2','r2')],
        arrows: [],
        description: '2 Carboxylic acids. Structural determination: work backward — if you have CH₃COOH + C₅H₁₁COOH as cleavage products, the original alkyne was CH₃-C≡C-C₅H₁₁ (hept-2-yne). Terminal alkyne gives RCOOH + CO₂ (CO₂ escapes as gas).',
        shortLabel: 'RCOOH + R′COOH',
      },
    ],
    energyDiagram: [
      { label: 'Alkyne + KMnO₄', energy: 42 },
      { label: 'Intermediates', energy: 28 },
      { label: '2 RCOOH', energy: 8 },
    ],
  },

  // ── 7. Hydride Reduction Selectivity ─────────────────────────────────────────
  {
    id: 'hydride-reduction-selectivity',
    category: 'oxidation_reduction',
    name: 'Hydride Reduction Selectivity (LiAlH₄, NaBH₄, DIBAL-H)',
    summary: 'Selectivity chart for hydride reagents. LiAlH₄: reduces everything (aldehyde, ketone, ester, acid, amide, epoxide). NaBH₄: only aldehydes + ketones. DIBAL-H at −78 °C: reduces esters → aldehydes (stops there).',
    reactants: 'Aldehyde, ketone, ester, acid, amide, epoxide + hydride reagent',
    products: 'Alcohol (or amine from amide) depending on substrate and reagent',
    conditions: 'LiAlH₄: Et₂O, then H₃O⁺; NaBH₄: MeOH or EtOH; DIBAL-H: −78 °C, toluene, then H₃O⁺',
    reactantSpecies: {
      text: 'Aldehyde, ketone, ester, acid, amide, epoxide + hydride reagent',
      species: [
        { smiles: '[R]C(=O)[R]', label: 'Carbonyl substrate' },
        { smiles: '[AlH4-].[Li+]', label: 'LiAlH₄' },
      ],
    },
    productSpecies: {
      text: 'Alcohol (or amine from amide) depending on substrate and reagent',
      species: [
        { smiles: '[R]C(O)[R]', label: 'Alcohol' },
      ],
    },
    conditionSpecies: {
      text: 'LiAlH₄: Et₂O, then H₃O⁺; NaBH₄: MeOH or EtOH; DIBAL-H: −78 °C, toluene, then H₃O⁺',
      species: [
        { smiles: '[AlH4-].[Li+]', label: 'LiAlH₄ (strong)' },
        { smiles: '[BH4-].[Na+]', label: 'NaBH₄ (mild)' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Metal alkoxide',
    reversible: false,
    importantInfo: [
      'LiAlH₄ (strong): reduces aldehydes, ketones, esters, carboxylic acids, amides, epoxides, acyl halides. Does NOT reduce isolated C=C or C≡C.',
      'NaBH₄ (mild): ONLY reduces aldehydes and ketones (not esters, acids, or amides — not reactive enough).',
      'DIBAL-H at −78 °C: reduces esters → aldehydes (stops at aldehyde — kinetic control). At rt: goes to alcohol. Also reduces amides → aldehydes.',
      'LiAl(OtBu)₃H (Meerwein–Ponndorf): reduces acyl halides → aldehydes (stops there).',
      'Alkenes and alkynes are NOT reduced by any of these hydride reagents — use H₂/Pd for those.',
    ],
    brownRef: 'Ch 15.3',
    relatedReactions: ['hydrogenation-selectivity', 'grignard-aldehyde', 'reductive-amination'],
    tags: ['LiAlH4', 'NaBH4', 'DIBAL-H', 'hydride reduction', 'selectivity', 'aldehyde', 'ketone', 'ester', 'reduction'],
    frames: [
      {
        // Selectivity chart: different substrates on left, reagents as labels
        atoms: [
          mk('ald',  'RCHO',  150, 100, { label: 'Aldehyde'  }),
          mk('ket',  'RCOR′', 150, 160, { label: 'Ketone'    }),
          mk('est',  'RCOOR′',150, 220, { label: 'Ester'     }),
          mk('acid', 'RCOOH', 150, 280, { label: 'Acid'      }),
          mk('la',   'LiAlH₄',400,  70, { label: '→ alcohol, amine' }),
          mk('nb',   'NaBH₄', 540,  70, { label: '→ alcohol only (ald/ket)' }),
          mk('di',   'DIBAL', 540, 160, { label: '→ aldehyde (from ester, −78°C)' }),
        ],
        bonds: [],
        arrows: [
          { from: { kind: 'atom', id: 'ald'  }, to: { kind: 'atom', id: 'la' }, color: 'var(--c-alkali)' },
          { from: { kind: 'atom', id: 'ket'  }, to: { kind: 'atom', id: 'la' }, color: 'var(--c-alkali)' },
          { from: { kind: 'atom', id: 'est'  }, to: { kind: 'atom', id: 'la' }, color: 'var(--c-alkali)' },
          { from: { kind: 'atom', id: 'acid' }, to: { kind: 'atom', id: 'la' }, color: 'var(--c-alkali)' },
          { from: { kind: 'atom', id: 'ald'  }, to: { kind: 'atom', id: 'nb' }, color: 'var(--c-tm)' },
          { from: { kind: 'atom', id: 'ket'  }, to: { kind: 'atom', id: 'nb' }, color: 'var(--c-tm)' },
          { from: { kind: 'atom', id: 'est'  }, to: { kind: 'atom', id: 'di' }, color: 'var(--c-halogen)' },
        ],
        description: 'Selectivity overview. LiAlH₄ reduces ALL carbonyl-containing functional groups. NaBH₄ is mild — only aldehydes and ketones (esters/acids/amides are too unreactive). DIBAL-H at −78 °C stops ester reduction at the aldehyde stage (kinetic control by low temperature). None reduce isolated C=C or C≡C.',
        shortLabel: 'Selectivity chart',
      },
      {
        // Mechanism: DIBAL ester → aldehyde at −78°C
        atoms: [
          mk('r',    'R',    190, 165, { role: 'r_group' }),
          mk('c',    'C',    340, 165, { role: 'carbonyl_carbon' }),
          mk('o1',   'O',    340,  55, { role: 'carbonyl_oxygen' }),
          mk('or',   "OR′",  490, 165, { role: 'leaving_group' }),
          mk('h',    'H',    340, 265, { role: 'h_substituent', label: 'DIBAL H⁻, −78°C' }),
        ],
        bonds: [bd('r-c','r','c'), bd('c-o1','c','o1',2), bd('c-or','c','or')],
        arrows: [{ from: { kind: 'atom', id: 'h' }, to: { kind: 'atom', id: 'c' }, color: 'var(--c-alkali)' }],
        description: 'DIBAL-H at −78 °C: H⁻ delivered from Al to ester C=O → tetrahedral intermediate → OR′ leaves → aldehyde. At −78 °C: the aldehyde is immediately complexed by the Lewis acidic Al residue, preventing a second H⁻ delivery. Warm up → workup → free aldehyde.',
        shortLabel: 'DIBAL: ester → aldehyde',
      },
    ],
    energyDiagram: [
      { label: 'Ester + DIBAL-H', energy: 35 },
      { label: 'TS', energy: 52, isTransitionState: true },
      { label: 'Aldehyde (−78 °C, complexed)', energy: 20 },
    ],
  },

  // ── 8. Catalytic Hydrogenation Selectivity ────────────────────────────────────
  {
    id: 'hydrogenation-selectivity',
    category: 'oxidation_reduction',
    name: 'Catalytic Hydrogenation Selectivity',
    summary: 'H₂/Pd(C), Pt, or Ni reduces alkenes and alkynes but NOT esters, acids, or amides. Reactivity hierarchy: acyl halide > alkyne > aldehyde > alkene > ketone > nitrile. Lindlar\'s: alkyne → cis-alkene. Na/NH₃: alkyne → trans-alkene.',
    reactants: 'Unsaturated compound + H₂ + metal catalyst',
    products: 'Reduced product (alkane from alkene/alkyne; alcohol from aldehyde/ketone)',
    conditions: 'H₂/Pd-C (most common); H₂/Pt (stronger); H₂/Ni (industrial); Lindlar\'s for alkyne → cis-alkene',
    reactantSpecies: {
      text: 'Unsaturated compound + H₂ + metal catalyst',
      species: [
        { smiles: '[R]C=C[R]', label: 'Alkene' },
        { smiles: '[H][H]', label: 'H₂' },
      ],
    },
    productSpecies: {
      text: 'Reduced product (alkane from alkene/alkyne; alcohol from aldehyde/ketone)',
      species: [
        { smiles: '[R]CC[R]', label: 'Alkane' },
      ],
    },
    conditionSpecies: {
      text: 'H₂/Pd-C (most common); H₂/Pt (stronger); H₂/Ni (industrial); Lindlar\'s for alkyne → cis-alkene',
      species: [
        { smiles: '[Pd]', label: 'Pd/C', catalyst: true },
        { smiles: '[H][H]', label: 'H₂' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: null,
    reversible: false,
    importantInfo: [
      'Reactivity order: acyl halide > alkyne > aldehyde > alkene > ketone > nitrile > ester ≈ acid ≈ amide (not reducible by H₂).',
      'Esters, carboxylic acids, and amides CANNOT be reduced by catalytic hydrogenation.',
      'SYN addition: H₂ delivered to the same face of alkene/alkyne (from catalyst surface).',
      'Lindlar\'s catalyst (Pd-BaSO₄-quinoline): reduces internal alkyne → cis-alkene (stops at alkene).',
      'Na/NH₃ (dissolving metal): reduces internal alkyne → trans-alkene (different regiochemistry to Lindlar\'s).',
    ],
    brownRef: 'Ch 15.3',
    relatedReactions: ['hydride-reduction-selectivity'],
    tags: ['hydrogenation', 'H₂', 'Pd', 'Pt', 'Lindlar', 'syn', 'alkene', 'alkyne', 'selectivity', 'reduction'],
    frames: [
      {
        atoms: [
          mk('r1', 'R',   200, 165, { role: 'r_group' }),
          mk('c1', 'C',   310, 165, { role: 'more_substituted' }),
          mk('c2', 'C',   450, 165, { role: 'less_substituted' }),
          mk('r2', "R′",  560, 165, { role: 'r_group' }),
          mk('h2', 'H₂',  380, 285, { label: 'Pd/C or Pt' }),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2',2), bd('c2-r2','c2','r2')],
        arrows: [{ from: { kind: 'atom', id: 'h2' }, to: { kind: 'bond', id: 'c1-c2' }, color: 'var(--c-tm)' }],
        description: 'H₂ is adsorbed onto the metal surface (Pd, Pt, or Ni). The alkene coordinates to the surface, and both H atoms are delivered to the SAME face (SYN addition). The alkene is reduced to an alkane. More substituted alkenes are SLOWER to hydrogenate (steric hindrance on catalyst surface).',
        shortLabel: 'Alkene + H₂/Pd',
      },
      {
        atoms: [
          mk('r1', 'R',   200, 165),
          mk('c1', 'C',   340, 165),
          mk('h1', 'H',   340,  65, { glow: true }),
          mk('c2', 'C',   480, 165),
          mk('h2', 'H',   480,  65, { glow: true }),
          mk('r2', "R′",  610, 165),
          mk('h3', 'H',   340, 265),
          mk('h4', 'H',   480, 265),
        ],
        bonds: [bd('r1-c1','r1','c1'), bd('c1-c2','c1','c2'), bd('c2-r2','c2','r2'), bd('c1-h1','c1','h1',1,'wedge'), bd('c1-h3','c1','h3',1,'dash-wedge'), bd('c2-h2','c2','h2',1,'wedge'), bd('c2-h4','c2','h4',1,'dash-wedge')],
        arrows: [],
        description: 'Alkane product: both H atoms added syn (same face). For chiral centers: syn delivery from Pd surface may give a specific diastereomer. Lindlar\'s catalyst for alkyne → cis-alkene: Pd poisoned by quinoline stops reduction at the alkene. Na/NH₃ (radical mechanism) → trans-alkene.',
        shortLabel: 'Alkane (syn H₂)',
      },
    ],
    energyDiagram: [
      { label: 'Alkene + H₂', energy: 32 },
      { label: 'Surface complex (TS)', energy: 38, isTransitionState: true },
      { label: 'Alkane', energy: 5 },
    ],
  },

  // ── 9. Free Radical Halogenation ─────────────────────────────────────────────
  {
    id: 'radical-halogenation',
    category: 'oxidation_reduction',
    name: 'Free Radical Halogenation',
    summary: 'The ONLY reaction that works with unactivated alkanes. Br₂ is selective: 3° > 2° > 1° > methyl. Cl₂ is non-selective (statistical distribution). 3-step chain: initiation (Br₂ + hν → 2 Br•), propagation (2 steps), termination.',
    reactants: 'Alkane + Br₂ (or Cl₂)',
    products: 'Alkyl halide + HBr (or HCl)',
    conditions: 'Br₂ or Cl₂; hν (light) or Δ; no solvent or CCl₄; free radical chain mechanism',
    reactantSpecies: {
      text: 'Alkane + Br₂ (or Cl₂)',
      species: [
        { smiles: '[R]C([H])([H])[R]', label: 'Alkane' },
        { smiles: 'BrBr', label: 'Br₂' },
      ],
    },
    productSpecies: {
      text: 'Alkyl halide + HBr (or HCl)',
      species: [
        { smiles: '[R]C([Br])([H])[R]', label: 'Alkyl bromide' },
        { smiles: '[H]Br', label: 'HBr' },
      ],
    },
    conditionSpecies: {
      text: 'Br₂ or Cl₂; hν (light) or Δ; no solvent or CCl₄; free radical chain mechanism',
      species: [
        { smiles: 'BrBr', label: 'Br₂' },
        { smiles: 'ClC(Cl)(Cl)Cl', label: 'CCl₄ (solvent)', catalyst: true },
      ],
    },
    reactionType: 'radical',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Alkyl radical',
    reversible: false,
    importantInfo: [
      'ONLY reaction that functionalizes unactivated (sp³ C–H) alkanes.',
      'Br₂ selective: 3° (99%) > 2° > 1° (very little). Cl₂: all positions approximately statistical (thermodynamic ratios).',
      'Chain mechanism — initiation: Br₂ + hν → 2 Br•; propagation: Br• + R–H → HBr + R•, then R• + Br₂ → R–Br + Br•; termination: radical combination.',
      'Br• is selective because H-abstraction is endothermic for Br (late transition state → early structure closely resembles radical intermediate — more sensitive to stability differences).',
      'Cl• is non-selective because H-abstraction is exothermic for Cl (early transition state → less sensitive to radical stability).',
    ],
    brownRef: 'Ch 10.4',
    relatedReactions: ['alpha-halogenation', 'acyl-chloride-reactions'],
    tags: ['radical halogenation', 'Br₂', 'Cl₂', 'free radical', 'chain mechanism', 'selectivity', 'alkane', 'hν'],
    frames: [
      {
        atoms: [
          mk('br2', 'Br₂',  320, 130, { label: 'hν' }),
          mk('br1', 'Br•',  195, 250, { charge: '•', glow: true }),
          mk('br2m','Br•',  445, 250, { charge: '•' }),
        ],
        bonds: [],
        arrows: [],
        description: 'Initiation: Br₂ absorbs UV light (hν) → homolytic cleavage → 2 Br• radicals (one electron each). This step is slow (requires light or heat) but generates the chain-carrying radicals. Only a tiny amount of initiation is needed — the chain propagates thousands of times.',
        shortLabel: 'Initiation: Br₂ + hν → 2 Br•',
      },
      {
        atoms: [
          mk('br',  'Br•',  155, 165, { charge: '•', role: 'electrophile' }),
          mk('r',   'R',    285, 165, { role: 'r_group' }),
          mk('c',   'C',    420, 165, { role: 'alpha_carbon' }),
          mk('h',   'H',    420,  65, { role: 'h_substituent' }),
          mk('hbr', 'HBr',  560, 100, { label: 'byproduct' }),
          mk('cr',  'C•',   420, 265, { charge: '•', glow: true, label: 'alkyl radical' }),
        ],
        bonds: [bd('r-c','r','c'), bd('c-h','c','h')],
        arrows: [
          { from: { kind: 'atom', id: 'br' }, to: { kind: 'atom', id: 'h' }, color: 'var(--c-halogen)' },
        ],
        description: 'Propagation Step 1: Br• abstracts an H atom (one electron from H, one from Br) → HBr + alkyl radical R•. Selectivity: Br• preferentially abstracts from 3° C–H (weakest, most stable radical) over 2° or 1°. This is the product-determining step.',
        shortLabel: 'Br• + R-H → HBr + R•',
      },
      {
        atoms: [
          mk('cr',  'R•',   155, 165, { charge: '•', role: 'r_group', glow: true }),
          mk('br2', 'Br₂',  340, 165, { label: 'chain carried' }),
          mk('rbr', 'R-Br', 510, 165, { glow: true }),
          mk('br',  'Br•',  610, 265, { charge: '•', label: 'regenerated' }),
        ],
        bonds: [],
        arrows: [{ from: { kind: 'atom', id: 'cr' }, to: { kind: 'atom', id: 'br2' }, color: 'var(--c-alkali)' }],
        description: 'Propagation Step 2: R• + Br₂ → R–Br + Br•. The Br• is regenerated → attacks another C–H → chain continues thousands of cycles per initiation event. Termination: Br• + Br• → Br₂, or R• + Br• → R–Br (terminates the chain, but rare).',
        shortLabel: 'R• + Br₂ → R-Br + Br•',
      },
    ],
    energyDiagram: [
      { label: 'RH + Br₂', energy: 35 },
      { label: 'TS (H abstraction)', energy: 52, isTransitionState: true },
      { label: 'R• + HBr', energy: 40 },
      { label: 'TS (Br₂ attack)', energy: 45, isTransitionState: true },
      { label: 'R-Br + Br•', energy: 15 },
    ],
  },
]

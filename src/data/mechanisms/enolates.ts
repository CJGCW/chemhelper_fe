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

const MALONIC_RELATED = ['malonic-ester-synthesis', 'acetoacetic-ester-synthesis', 'decarboxylation']

export const ENOLATE_REACTIONS: ReactionDef[] = [

  // ── 1. Aldol Addition ─────────────────────────────────────────────────────────
  {
    id: 'aldol-addition',
    category: 'enolate',
    name: 'Aldol Addition',
    summary: 'Base forms enolate from one carbonyl, which attacks C=O of a second carbonyl → β-hydroxy carbonyl (aldol product). Aldehydes react faster than ketones. Reversible (retro-aldol).',
    reactants: '2 R-CHO (or ketone with α-H)',
    products: 'β-Hydroxy carbonyl (aldol)',
    conditions: 'NaOH, NaOEt, or LDA; aq. or anhydrous; 0 °C to rt',
    reactantSpecies: {
      text: '2 R-CHO (or ketone with α-H)',
      species: [
        { smiles: '[R]CC=O', label: 'Aldehyde (2 eq)' },
      ],
    },
    productSpecies: {
      text: 'β-Hydroxy carbonyl (aldol)',
      species: [
        { smiles: '[R]C(O)CC=O', label: 'β-Hydroxy aldehyde (aldol)' },
      ],
    },
    conditionSpecies: {
      text: 'NaOH, NaOEt, or LDA; aq. or anhydrous; 0 °C to rt',
      species: [
        { smiles: '[OH-].[Na+]', label: 'NaOH' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Enolate',
    reversible: true,
    importantInfo: [
      'Enolate of one C=O attacks C=O of another → β-hydroxy carbonyl (aldol). Aldehydes faster than ketones.',
      'Crossed aldol: use compound with no α-H\'s as electrophile + add the α-H compound slowly to basic solution.',
      'Reversible — retro-aldol can occur. Thermodynamic vs. kinetic control matters.',
      'Product is a β-hydroxy carbonyl: can be dehydrated (heat) → α,β-unsaturated carbonyl (aldol condensation).',
    ],
    brownRef: 'Ch 19.2',
    relatedReactions: ['aldol-condensation', 'michael-reaction', 'keto-enol-tautomerism'],
    tags: ['aldol', 'enolate', 'beta-hydroxy carbonyl', 'addition', 'condensation', 'C-C bond', 'NaOH'],
    frames: [
      {
        atoms: [
          mk('r1',   'R',    150, 165, { role: 'r_group' }),
          mk('c_al', 'CH₂',  295, 165, { role: 'alpha_carbon', charge: '−', glow: true }),
          mk('c1',   'C',    440, 165, { role: 'carbonyl_carbon' }),
          mk('o1',   'O',    440,  55, { role: 'carbonyl_oxygen' }),
          mk('c2',   'C',    560, 165, { role: 'carbonyl_carbon', label: 'electrophile' }),
          mk('o2',   'O',    560,  55, { role: 'carbonyl_oxygen' }),
          mk('r2',   "R′",   680, 165, { role: 'r_group' }),
          mk('h_e',  'H',    560, 265),
        ],
        bonds: [
          bd('r1-cal','r1','c_al'), bd('cal-c1','c_al','c1'),
          bd('c1-o1','c1','o1',2),
          bd('c2-o2','c2','o2',2), bd('c2-r2','c2','r2'), bd('c2-he','c2','h_e'),
        ],
        arrows: [{ from: { kind: 'atom', id: 'c_al' }, to: { kind: 'atom', id: 'c2' }, color: 'var(--c-alkali)' }],
        description: 'Enolate (α-C⁻) from deprotonation of the donor carbonyl attacks the electrophilic C=O of the acceptor carbonyl. Base (NaOH or LDA) removes the α-H. Both donor and acceptor are often the same compound (self-aldol).',
        shortLabel: 'Enolate + C=O',
      },
      {
        atoms: [
          mk('r1',   'R',    130, 165, { role: 'r_group' }),
          mk('c_al', 'C',    260, 165, { role: 'alpha_carbon' }),
          mk('c1',   'C',    390, 165, { role: 'carbonyl_carbon' }),
          mk('o1',   'O',    390,  55, { role: 'carbonyl_oxygen' }),
          mk('c2',   'C',    530, 165),
          mk('oh',   'OH',   530,  55, { glow: true }),
          mk('r2',   "R′",   650, 165),
          mk('h_c2', 'H',    530, 265),
        ],
        bonds: [
          bd('r1-cal','r1','c_al'), bd('cal-c1','c_al','c1'),
          bd('c1-o1','c1','o1',2), bd('cal-c2','c_al','c2'),
          bd('c2-oh','c2','oh'), bd('c2-r2','c2','r2'), bd('c2-h','c2','h_c2'),
        ],
        arrows: [],
        description: 'β-Hydroxy carbonyl (aldol product). New C–C bond at α-position. The β-carbon bears an OH group (at the former electrophilic carbonyl C). This is the classic aldol: aldehyde + aldehyde → β-hydroxyaldehyde. Heating drives dehydration → aldol condensation.',
        shortLabel: 'β-Hydroxy carbonyl',
      },
    ],
    energyDiagram: [
      { label: '2 R-CHO', energy: 35 },
      { label: 'Enolate', energy: 28 },
      { label: 'TS', energy: 42, isTransitionState: true },
      { label: 'Aldol product', energy: 20 },
    ],
  },

  // ── 2. Aldol Condensation ─────────────────────────────────────────────────────
  {
    id: 'aldol-condensation',
    category: 'enolate',
    name: 'Aldol Condensation',
    summary: 'Aldol product loses H₂O (dehydration) → α,β-unsaturated carbonyl (conjugated enone). E1cb: base removes α-H → enolate → β-elimination of OH. Thermodynamically favorable (conjugation stabilizes product).',
    reactants: 'β-Hydroxy carbonyl (from aldol addition)',
    products: 'α,β-Unsaturated carbonyl (enone/enal) + H₂O',
    conditions: 'Heat (drives aldol equilibrium forward) + base or acid; concentrated NaOH and heat',
    reactantSpecies: {
      text: '2 R-CHO (or ketone with α-H)',
      species: [
        { smiles: '[R]CC=O', label: 'Aldehyde (2 eq)' },
      ],
    },
    productSpecies: {
      text: 'α,β-Unsaturated carbonyl (condensation product)',
      species: [
        { smiles: '[R]/C=C/C=O', label: 'α,β-Unsaturated aldehyde' },
        { smiles: 'O', label: 'H₂O' },
      ],
    },
    conditionSpecies: {
      text: 'Heat (drives aldol equilibrium forward) + base or acid; concentrated NaOH and heat',
      species: [
        { smiles: '[OH-].[Na+]', label: 'NaOH' },
      ],
    },
    reactionType: 'condensation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Enolate (E1cb)',
    reversible: false,
    importantInfo: [
      'Aldol product loses H₂O → α,β-unsaturated carbonyl. Heat during aldol drives condensation.',
      'E1cb mechanism: base removes α-H first → enolate → β-elimination of OH⁻.',
      'Conjugated product is thermodynamically favored: C=C conjugated with C=O lowers energy.',
      'Product (enone) is a Michael acceptor — set up for Robinson annulation.',
    ],
    brownRef: 'Ch 19.2',
    relatedReactions: ['aldol-addition', 'michael-reaction', 'robinson-annulation'],
    tags: ['aldol condensation', 'enone', 'alpha-beta unsaturated', 'dehydration', 'E1cb', 'conjugation', 'enolate'],
    frames: [
      {
        atoms: [
          mk('r',    'R',    130, 165),
          mk('c_al', 'C',    260, 165, { role: 'alpha_carbon' }),
          mk('c_c',  'C',    390, 165, { role: 'carbonyl_carbon' }),
          mk('o_c',  'O',    390,  55, { role: 'carbonyl_oxygen' }),
          mk('c_b',  'C',    530, 165),
          mk('oh',   'OH',   530,  55),
          mk('h_al', 'H',    260,  65),
          mk('r2',   "R′",   650, 215),
        ],
        bonds: [
          bd('r-cal','r','c_al'), bd('cal-cc','c_al','c_c'), bd('cc-oc','c_c','o_c',2),
          bd('cc-cb','c_c','c_b'), bd('cb-oh','c_b','oh'), bd('cal-h','c_al','h_al'), bd('cb-r2','c_b','r2'),
        ],
        arrows: [{ from: { kind: 'lonePair', atomId: 'oh', angleDeg: 180 }, to: { kind: 'atom', id: 'h_al' }, color: 'var(--c-halogen)' }],
        description: 'β-Hydroxy carbonyl (aldol product). Base removes the α-H (E1cb step 1). The α-H is acidic because of the adjacent C=O. The resulting enolate undergoes β-elimination of OH⁻ in the next step.',
        shortLabel: 'Aldol → dehydration',
      },
      {
        atoms: [
          mk('r',    'R',    130, 165),
          mk('c_al', 'C',    270, 165, { role: 'alpha_carbon' }),
          mk('c_c',  'C',    410, 165, { role: 'carbonyl_carbon' }),
          mk('o_c',  'O',    410,  55, { role: 'carbonyl_oxygen' }),
          mk('c_b',  'C',    560, 165),
          mk('r2',   "R′",   670, 215),
          mk('h2o',  'H₂O',  560, 285, { label: 'byproduct' }),
        ],
        bonds: [
          bd('r-cal','r','c_al'), bd('cal-cc','c_al','c_c'), bd('cc-oc','c_c','o_c',2),
          bd('cc-cb','c_c','c_b',2), bd('cb-r2','c_b','r2'),
        ],
        arrows: [],
        description: 'α,β-Unsaturated carbonyl (enone/enal). C=C conjugated with C=O. H₂O eliminated. The extended π-system stabilizes the product thermodynamically. This enone is an excellent Michael acceptor (1,4-addition by nucleophiles).',
        shortLabel: 'α,β-Unsaturated carbonyl',
      },
    ],
    energyDiagram: [
      { label: 'β-Hydroxy carbonyl', energy: 25 },
      { label: 'Enolate (E1cb)', energy: 30 },
      { label: 'TS (β-elimination)', energy: 38, isTransitionState: true },
      { label: 'Enone + H₂O', energy: 12 },
    ],
  },

  // ── 3. Claisen Condensation ───────────────────────────────────────────────────
  {
    id: 'claisen-condensation',
    category: 'enolate',
    name: 'Claisen Condensation',
    summary: 'Ester enolate attacks C=O of a 2nd ester → tetrahedral intermediate → OR′ leaves → β-keto ester. Requires stoichiometric base (product is deprotonated → equilibrium pulled forward). Dieckmann: intramolecular version.',
    reactants: '2 R-CH₂-COOR′ (ester with α-H)',
    products: 'β-Keto ester (R-CH₂-CO-CHR-COOR′) + R′OH',
    conditions: 'NaOEt (stoichiometric); anhydrous EtOH; ester must have ≥2 α-H\'s; then acidify',
    reactantSpecies: {
      text: '2 R-CH₂-CO₂Et (ester with α-H)',
      species: [
        { smiles: '[R]CC(=O)OCC', label: 'Ethyl ester (2 eq)' },
      ],
    },
    productSpecies: {
      text: 'β-Keto ester',
      species: [
        { smiles: '[R]CC(=O)CC(=O)OCC', label: 'β-Keto ester' },
      ],
    },
    conditionSpecies: {
      text: 'NaOEt (stoichiometric); anhydrous EtOH; ester must have ≥2 α-H\'s; then acidify',
      species: [
        { smiles: 'CC[O-].[Na+]', label: 'NaOEt' },
      ],
    },
    reactionType: 'condensation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Tetrahedral intermediate',
    reversible: false,
    importantInfo: [
      'Analogous to aldol but with esters. Ester enolate attacks C=O of 2nd ester → β-keto ester.',
      'REQUIREMENTS: ester must have ≥2 α-H\'s AND stoichiometric (not catalytic) base.',
      'Equilibrium driven forward by deprotonation of the acidic β-keto ester product (pKa ≈ 11).',
      'Dieckmann condensation: intramolecular Claisen on 1,6- or 1,7-diesters → cyclic β-keto ester (5- or 6-membered ring).',
    ],
    brownRef: 'Ch 19.3',
    relatedReactions: ['aldol-addition', 'malonic-ester-synthesis', 'michael-reaction'],
    tags: ['Claisen condensation', 'ester enolate', 'beta-keto ester', 'Dieckmann', 'C-C bond', 'enolate'],
    frames: [
      {
        atoms: [
          mk('r1',    'R',     130, 165, { role: 'r_group' }),
          mk('c_al',  'CH₂',   275, 165, { role: 'alpha_carbon', charge: '−' }),
          mk('c1',    'C',     415, 165, { role: 'carbonyl_carbon' }),
          mk('o1',    'O',     415,  55, { role: 'carbonyl_oxygen' }),
          mk('or1',   "OR′",   540, 165, { role: 'leaving_group' }),
          mk('c2',    'C',     590, 165, { role: 'carbonyl_carbon', label: 'electrophile' }),
          mk('o2',    'O',     590,  55),
          mk('or2',   "OR′",   700, 165, { role: 'leaving_group' }),
        ],
        bonds: [
          bd('r1-cal','r1','c_al'), bd('cal-c1','c_al','c1'),
          bd('c1-o1','c1','o1',2), bd('c1-or1','c1','or1'),
          bd('c2-o2','c2','o2',2), bd('c2-or2','c2','or2'),
        ],
        arrows: [{ from: { kind: 'atom', id: 'c_al' }, to: { kind: 'atom', id: 'c2' }, color: 'var(--c-alkali)' }],
        description: 'NaOEt deprotonates α-C of one ester → enolate. Enolate attacks C=O of the second ester. Tetrahedral intermediate forms: C now bonded to OR′ (leaving group) and the enolate chain.',
        shortLabel: 'Ester enolate + ester',
      },
      {
        atoms: [
          mk('r1',   'R',    120, 165),
          mk('c_al', 'C',    260, 165, { role: 'alpha_carbon', glow: true }),
          mk('c1',   'C',    390, 165, { role: 'carbonyl_carbon' }),
          mk('o1',   'O',    390,  55),
          mk('c2',   'C',    520, 165, { role: 'carbonyl_carbon' }),
          mk('o2',   'O',    520,  55, { role: 'carbonyl_oxygen' }),
          mk('or2',  "OR′",  645, 165, { role: 'leaving_group' }),
          mk('orp',  "OR′",  560, 285, { label: 'byproduct' }),
        ],
        bonds: [
          bd('r1-cal','r1','c_al'), bd('cal-c1','c_al','c1'),
          bd('c1-o1','c1','o1',2), bd('cal-c2','c_al','c2'),
          bd('c2-o2','c2','o2',2), bd('c2-or2','c2','or2'),
        ],
        arrows: [],
        description: 'β-Keto ester product. OR′ left as alkoxide → takes a proton (becomes alcohol byproduct). The β-keto ester has pKa ≈ 11 (between two carbonyls) → stoichiometric base deprotonates it, pulling equilibrium forward. Acidify workup to get neutral product.',
        shortLabel: 'β-Keto ester',
      },
    ],
    energyDiagram: [
      { label: '2 Esters + NaOEt', energy: 35 },
      { label: 'Ester enolate', energy: 28 },
      { label: 'Tetrahedral intermediate', energy: 38, isTransitionState: true },
      { label: 'β-Keto ester', energy: 18 },
    ],
  },

  // ── 4. Michael Reaction (1,4-Conjugate Addition) ──────────────────────────────
  {
    id: 'michael-reaction',
    category: 'enolate',
    name: 'Michael Reaction (1,4-Addition)',
    summary: '1,4-Conjugate addition: enolate (Michael donor) adds to the β-carbon of an α,β-unsaturated carbonyl (Michael acceptor). NOT 1,2-addition to C=O. Product is 1,5-dicarbonyl — set up for Robinson annulation.',
    reactants: 'Michael donor (enolate) + Michael acceptor (enone)',
    products: '1,5-Dicarbonyl compound',
    conditions: 'Base (NaOEt, K₂CO₃, DBU); or under acidic conditions with stable enolates; mild conditions work with soft enolates',
    reactantSpecies: {
      text: 'Enolate (Michael donor) + α,β-unsaturated carbonyl (Michael acceptor)',
      species: [
        { smiles: '[R]CC(=O)[R]', label: 'Michael donor' },
        { smiles: '[R]/C=C/C(=O)[R]', label: 'Michael acceptor' },
      ],
    },
    productSpecies: {
      text: '1,4-Addition product (1,5-dicarbonyl)',
      species: [
        { smiles: '[R]CC(=O)CCC(=O)[R]', label: '1,5-Dicarbonyl' },
      ],
    },
    conditionSpecies: {
      text: 'Base (NaOEt, K₂CO₃, DBU); or under acidic conditions with stable enolates; mild conditions work with soft enolates',
      species: [
        { smiles: 'CC[O-].[Na+]', label: 'NaOEt' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Enolate',
    reversible: false,
    importantInfo: [
      '1,4-conjugate addition of enolate (donor) to α,β-unsaturated carbonyl (acceptor). NOT 1,2-addition to C=O.',
      'Best donors: enolates of β-diketones, β-diesters, β-keto esters, β-keto nitriles (stabilized, soft nucleophiles).',
      'Product is 1,5-dicarbonyl — positions the carbonyls for intramolecular aldol (Robinson annulation).',
      'Hard nucleophiles (RLi, RMgX) give 1,2-addition; soft nucleophiles (enolates, cuprates) give 1,4-addition.',
    ],
    brownRef: 'Ch 19.9',
    relatedReactions: ['aldol-addition', 'robinson-annulation', 'aldol-condensation'],
    tags: ['Michael', '1,4-addition', 'conjugate addition', 'enone', 'enolate', '1,5-dicarbonyl', 'soft nucleophile'],
    frames: [
      {
        // Michael acceptor on right: C_alpha=C_beta-C=O
        // Michael donor on left: enolate
        atoms: [
          mk('don',  'Enolate', 120, 165, { charge: '−', role: 'nucleophile', label: 'donor' }),
          mk('c_b',  'C',       320, 165, { role: 'beta_carbon' }),
          mk('c_al', 'C',       455, 165, { role: 'alpha_carbon' }),
          mk('c_c',  'C',       590, 165, { role: 'carbonyl_carbon' }),
          mk('o',    'O',       590,  55, { role: 'carbonyl_oxygen' }),
          mk('r',    'R',       700, 215),
        ],
        bonds: [
          bd('cb-cal','c_b','c_al',2), bd('cal-cc','c_al','c_c'),
          bd('cc-o','c_c','o',2), bd('cc-r','c_c','r'),
        ],
        arrows: [{ from: { kind: 'atom', id: 'don' }, to: { kind: 'atom', id: 'c_b' }, color: 'var(--c-alkali)' }],
        description: 'Michael donor (enolate/soft nucleophile) attacks the β-carbon (C-4 from O) of the Michael acceptor (α,β-unsaturated carbonyl). This is 1,4-addition, NOT 1,2-addition to C=O. The π system delocalizes the negative charge to oxygen after C–C bond forms.',
        shortLabel: 'Enolate + enone (1,4)',
      },
      {
        // 1,5-dicarbonyl: donor-C_b-C_al-C_c(=O)
        atoms: [
          mk('c_don','C',    150, 165, { role: 'carbonyl_carbon', label: 'donor C=O' }),
          mk('o_don','O',    150,  55),
          mk('c_b',  'C',    290, 165, { role: 'beta_carbon', glow: true }),
          mk('c_al', 'C',    430, 165, { role: 'alpha_carbon' }),
          mk('c_c',  'C',    570, 165, { role: 'carbonyl_carbon' }),
          mk('o',    'O',    570,  55, { role: 'carbonyl_oxygen' }),
          mk('r',    'R',    675, 215),
        ],
        bonds: [
          bd('od-cd','o_don','c_don',2), bd('cd-cb','c_don','c_b'),
          bd('cb-cal','c_b','c_al'), bd('cal-cc','c_al','c_c'),
          bd('cc-o','c_c','o',2), bd('cc-r','c_c','r'),
        ],
        arrows: [],
        description: '1,5-Dicarbonyl product. The two C=O groups are separated by 3 carbons (1,5-relationship). This spacing is ideal for an intramolecular aldol condensation → Robinson annulation. The Michael reaction is the first step of Robinson annulation.',
        shortLabel: '1,5-Dicarbonyl',
      },
    ],
    energyDiagram: [
      { label: 'Enolate + enone', energy: 28 },
      { label: 'TS', energy: 40, isTransitionState: true },
      { label: '1,5-Dicarbonyl', energy: 15 },
    ],
  },

  // ── 5. Robinson Annulation ────────────────────────────────────────────────────
  {
    id: 'robinson-annulation',
    category: 'enolate',
    name: 'Robinson Annulation',
    summary: 'Michael addition → 1,5-diketone → intramolecular aldol condensation → cyclohexenone. Builds 6-membered rings found in steroids, terpenes, and natural products. Two reactions: Michael then aldol.',
    reactants: 'β-Keto compound + methyl vinyl ketone (MVK) or enone',
    products: '2-Cyclohexenone (α,β-unsaturated cyclic ketone)',
    conditions: 'Base (NaOEt or KOH); EtOH; heat for condensation step',
    reactantSpecies: {
      text: 'Michael addition + intramolecular aldol',
      species: [
        { smiles: 'CCCC(=O)C', label: 'Michael donor + acceptor' },
        { smiles: '[R]/C=C/C(=O)[R]', label: 'Michael acceptor (enone)' },
      ],
    },
    productSpecies: {
      text: 'Cyclohexenone (6-membered ring enone)',
      species: [
        { smiles: 'O=C1CCCC=C1', label: '2-Cyclohexen-1-one' },
      ],
    },
    conditionSpecies: {
      text: 'Base (NaOEt or KOH); EtOH; heat for condensation step',
      species: [
        { smiles: 'CC[O-].[Na+]', label: 'NaOEt' },
      ],
    },
    reactionType: 'condensation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: '1,5-Diketone',
    reversible: false,
    importantInfo: [
      'Two reactions in sequence: (1) Michael addition → 1,5-diketone, (2) intramolecular aldol condensation → cyclohexenone.',
      'Builds 6-membered rings — essential for steroid and terpene synthesis.',
      'MVK (methyl vinyl ketone, CH₂=CHCOCH₃) is the most common Michael acceptor used.',
      'Stork enamine method: use enamine instead of enolate for better regioselectivity in Robinson annulation.',
    ],
    brownRef: 'Ch 19.10',
    relatedReactions: ['michael-reaction', 'aldol-condensation', 'aldol-addition'],
    tags: ['Robinson annulation', 'ring formation', 'cyclohexenone', 'Michael', 'aldol', 'steroid synthesis', 'enolate'],
    frames: [
      {
        // Michael step: beta-keto compound + MVK
        atoms: [
          mk('c_d1', 'C',    130, 165, { role: 'carbonyl_carbon' }),
          mk('o_d1', 'O',    130,  55),
          mk('c_al', 'C',    260, 165, { role: 'alpha_carbon', charge: '−', glow: true }),
          mk('c_d2', 'C',    390, 165, { role: 'carbonyl_carbon' }),
          mk('o_d2', 'O',    390,  55),
          mk('c_b',  'C',    530, 165, { role: 'beta_carbon' }),
          mk('c_a2', 'C',    660, 165, { role: 'alpha_carbon' }),
          mk('c_c2', 'C',    660,  55, { role: 'carbonyl_carbon' }),
          mk('o_c2', 'O',    660, -35),
        ],
        bonds: [
          bd('od1-cd1','o_d1','c_d1',2), bd('cd1-cal','c_d1','c_al'),
          bd('cal-cd2','c_al','c_d2'), bd('cd2-od2','c_d2','o_d2',2),
          bd('cb-ca2','c_b','c_a2',2), bd('ca2-cc2','c_a2','c_c2'), bd('cc2-oc2','c_c2','o_c2',2),
        ],
        arrows: [{ from: { kind: 'atom', id: 'c_al' }, to: { kind: 'atom', id: 'c_b' }, color: 'var(--c-alkali)' }],
        description: 'Step 1 (Michael): enolate from the β-keto compound attacks the β-carbon of MVK (1,4-addition). Forms a 1,5-diketone — the two ketones are now separated by 3 carbons, perfectly positioned for intramolecular aldol.',
        shortLabel: 'Michael addition',
      },
      {
        // Intramolecular aldol → cyclohexenone ring
        // Show a 6-membered ring: 6 carbons + the cyclic enone
        atoms: [
          mk('c1', 'C',  350,  80),
          mk('c2', 'C',  460, 140),
          mk('c3', 'C',  460, 240),
          mk('c4', 'C',  350, 300),
          mk('c5', 'C',  240, 240),
          mk('c6', 'C',  240, 140),
          mk('o',  'O',  350, -30, { glow: true }),
        ],
        bonds: [
          bd('c1-c2','c1','c2'), bd('c2-c3','c2','c3'), bd('c3-c4','c3','c4'),
          bd('c4-c5','c4','c5'), bd('c5-c6','c5','c6'), bd('c6-c1','c6','c1',2),
          bd('c1-o','c1','o',2),
        ],
        arrows: [],
        description: 'Step 2 (intramolecular aldol condensation): enolate of one ketone attacks the other ketone C=O → 6-membered ring → dehydration → cyclohexenone. Product is 2-cyclohexen-1-one (conjugated cyclic enone). This is the key step in building the steroid ring system.',
        shortLabel: '2-Cyclohexenone',
      },
    ],
    energyDiagram: [
      { label: 'Donor + enone', energy: 35 },
      { label: '1,5-Diketone', energy: 22 },
      { label: 'Aldol TS', energy: 32, isTransitionState: true },
      { label: 'Cyclohexenone', energy: 8 },
    ],
  },

  // ── 6. Malonic Ester Synthesis ────────────────────────────────────────────────
  {
    id: 'malonic-ester-synthesis',
    category: 'enolate',
    name: 'Malonic Ester Synthesis',
    summary: 'Diethyl malonate → deprotonate (NaOEt, pKa ≈ 13) → alkylate (SN2 with RX) → hydrolyze both esters → decarboxylate → monocarboxylic acid. Product has 2 more carbons than R-X.',
    reactants: 'Diethyl malonate + RX (1° or 2° alkyl halide)',
    products: 'R-CH₂-COOH (monocarboxylic acid)',
    conditions: '(1) NaOEt/EtOH; (2) RX (SN2); (3) H₃O⁺/H₂O/Δ (hydrolysis + decarboxylation)',
    reactantSpecies: {
      text: 'Diethyl malonate + RX (1° or 2° alkyl halide)',
      species: [
        { smiles: 'CCOC(=O)CC(=O)OCC', label: 'Diethyl malonate' },
        { smiles: '[R]Br', label: 'R–X (alkyl halide)' },
      ],
    },
    productSpecies: {
      text: 'R-CH₂-COOH (monocarboxylic acid)',
      species: [
        { smiles: '[R]CC(=O)O', label: 'Substituted carboxylic acid' },
      ],
    },
    conditionSpecies: {
      text: '(1) NaOEt/EtOH; (2) RX (SN2); (3) H₃O⁺/H₂O/Δ (hydrolysis + decarboxylation)',
      species: [
        { smiles: 'CC[O-].[Na+]', label: 'NaOEt' },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Alkylated malonate ester',
    reversible: false,
    importantInfo: [
      'Diethyl malonate pKa ≈ 13 (between two C=O groups) — easily deprotonated by NaOEt.',
      'Steps: (1) NaOEt deprotonates, (2) SN2 alkylation with RX, (3) H₃O⁺/Δ hydrolyzes both esters → diacid, (4) decarboxylation (one COOH lost as CO₂) → monocarboxylic acid.',
      'Product has 2 more carbons than starting RX (the malonyl unit contributes 2 C, but one leaves as CO₂ → net +1C from malonate, but product is R-CH₂-COOH).',
      'Double alkylation possible: deprotonate again, add 2nd RX → dialkylated product → diacid → decarboxylation (only ONE COOH lost — need β-keto acid for decarboxylation).',
    ],
    brownRef: 'Ch 19.11',
    relatedReactions: MALONIC_RELATED.filter(id => id !== 'malonic-ester-synthesis'),
    tags: ['malonic ester', 'diethyl malonate', 'synthesis', 'enolate', 'alkylation', 'decarboxylation', 'carboxylic acid'],
    frames: [
      {
        atoms: [
          mk('oe1',  'OEt',  150, 165, { role: 'leaving_group' }),
          mk('c1',   'C',    280, 165, { role: 'carbonyl_carbon' }),
          mk('o1',   'O',    280,  55, { role: 'carbonyl_oxygen' }),
          mk('c_al', 'C',    410, 165, { role: 'alpha_carbon', charge: '−', glow: true }),
          mk('c2',   'C',    540, 165, { role: 'carbonyl_carbon' }),
          mk('o2',   'O',    540,  55, { role: 'carbonyl_oxygen' }),
          mk('oe2',  'OEt',  670, 165, { role: 'leaving_group' }),
          mk('rx',   'RX',   410, 290, { role: 'electrophile' }),
        ],
        bonds: [
          bd('oe1-c1','oe1','c1'), bd('c1-o1','c1','o1',2), bd('c1-cal','c1','c_al'),
          bd('cal-c2','c_al','c2'), bd('c2-o2','c2','o2',2), bd('c2-oe2','c2','oe2'),
        ],
        arrows: [{ from: { kind: 'atom', id: 'c_al' }, to: { kind: 'atom', id: 'rx' }, color: 'var(--c-alkali)' }],
        description: 'Diethyl malonate: α-H between two ester groups (pKa ≈ 13). NaOEt deprotonates → stabilized enolate. SN2 alkylation with R-X adds R to the α-carbon. This is the key C–C bond forming step.',
        shortLabel: 'Malonate enolate + RX',
      },
      {
        atoms: [
          mk('oe1',  'OEt', 135, 165, { role: 'leaving_group' }),
          mk('c1',   'C',   265, 165, { role: 'carbonyl_carbon' }),
          mk('o1',   'O',   265,  55, { role: 'carbonyl_oxygen' }),
          mk('c_al', 'C',   400, 165, { role: 'alpha_carbon' }),
          mk('r',    'R',   400, 265, { glow: true }),
          mk('c2',   'C',   535, 165, { role: 'carbonyl_carbon' }),
          mk('o2',   'O',   535,  55, { role: 'carbonyl_oxygen' }),
          mk('oe2',  'OEt', 660, 165, { role: 'leaving_group' }),
        ],
        bonds: [
          bd('oe1-c1','oe1','c1'), bd('c1-o1','c1','o1',2), bd('c1-cal','c1','c_al'),
          bd('cal-r','c_al','r'), bd('cal-c2','c_al','c2'),
          bd('c2-o2','c2','o2',2), bd('c2-oe2','c2','oe2'),
        ],
        arrows: [],
        description: 'Alkylated malonate ester. H₃O⁺/H₂O/Δ: hydrolyzes both esters → diacid (malonic acid derivative). Heating β-diacids causes decarboxylation via a 6-membered cyclic transition state: one COOH leaves as CO₂ → monocarboxylic acid R-CH₂-COOH.',
        shortLabel: 'Alkylated → RCOOH',
      },
    ],
    energyDiagram: [
      { label: 'Malonate + RX', energy: 30 },
      { label: 'Malonate enolate', energy: 22 },
      { label: 'TS (SN2)', energy: 40, isTransitionState: true },
      { label: 'RCOOH (after decarboxylation)', energy: 10 },
    ],
  },

  // ── 7. Acetoacetic Ester Synthesis ────────────────────────────────────────────
  {
    id: 'acetoacetic-ester-synthesis',
    category: 'enolate',
    name: 'Acetoacetic Ester Synthesis',
    summary: 'Ethyl acetoacetate → deprotonate → alkylate (SN2) → hydrolyze → decarboxylate → methyl ketone. Always gives a methyl ketone (CH₃CO-CHR). Complementary to malonic ester: malonic → carboxylic acid, acetoacetic → methyl ketone.',
    reactants: 'Ethyl acetoacetate (ethyl 3-oxobutanoate) + RX',
    products: 'R-CH₂-CO-CH₃ (methyl ketone, 3 carbons from acetoacetate)',
    conditions: '(1) NaOEt/EtOH; (2) RX (SN2); (3) H₃O⁺/H₂O/Δ (hydrolysis + decarboxylation)',
    reactantSpecies: {
      text: 'Ethyl acetoacetate (ethyl 3-oxobutanoate) + RX',
      species: [
        { smiles: 'CCOC(=O)CC(=O)C', label: 'Ethyl acetoacetate' },
        { smiles: '[R]Br', label: 'R–X (alkyl halide)' },
      ],
    },
    productSpecies: {
      text: 'R-CH₂-CO-CH₃ (methyl ketone, 3 carbons from acetoacetate)',
      species: [
        { smiles: '[R]CC(=O)C', label: 'Methyl ketone' },
      ],
    },
    conditionSpecies: {
      text: '(1) NaOEt/EtOH; (2) RX (SN2); (3) H₃O⁺/H₂O/Δ (hydrolysis + decarboxylation)',
      species: [
        { smiles: 'CC[O-].[Na+]', label: 'NaOEt' },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Alkylated acetoacetate ester',
    reversible: false,
    importantInfo: [
      'Same strategy as malonic ester but using ethyl acetoacetate (β-keto ester, pKa ≈ 11).',
      'Steps: (1) NaOEt deprotonates, (2) SN2 with RX, (3) acid hydrolysis of ester, (4) decarboxylation → methyl ketone.',
      'Product is ALWAYS a methyl ketone (CH₃CO-CHR) — the acetyl group (CH₃CO) is always present.',
      'Malonic ester → carboxylic acid; acetoacetic ester → methyl ketone. Choose based on desired product.',
    ],
    brownRef: 'Ch 19.11',
    relatedReactions: MALONIC_RELATED.filter(id => id !== 'acetoacetic-ester-synthesis'),
    tags: ['acetoacetic ester', 'beta-keto ester', 'methyl ketone', 'enolate', 'alkylation', 'decarboxylation', 'synthesis'],
    frames: [
      {
        atoms: [
          mk('c_me', 'CH₃',  140, 165),
          mk('c_k',  'C',    270, 165, { role: 'carbonyl_carbon' }),
          mk('o_k',  'O',    270,  55, { role: 'carbonyl_oxygen' }),
          mk('c_al', 'C',    400, 165, { role: 'alpha_carbon', charge: '−', glow: true }),
          mk('c_e',  'C',    530, 165, { role: 'carbonyl_carbon' }),
          mk('o_e',  'O',    530,  55, { role: 'carbonyl_oxygen' }),
          mk('oet',  'OEt',  655, 165, { role: 'leaving_group' }),
          mk('rx',   'RX',   400, 285, { role: 'electrophile' }),
        ],
        bonds: [
          bd('me-ck','c_me','c_k'), bd('ck-ok','c_k','o_k',2), bd('ck-cal','c_k','c_al'),
          bd('cal-ce','c_al','c_e'), bd('ce-oe','c_e','o_e',2), bd('ce-oet','c_e','oet'),
        ],
        arrows: [{ from: { kind: 'atom', id: 'c_al' }, to: { kind: 'atom', id: 'rx' }, color: 'var(--c-alkali)' }],
        description: 'Ethyl acetoacetate: α-H between ketone and ester (pKa ≈ 11, more acidic than malonate). NaOEt deprotonates at α-C. SN2 alkylation with RX. The CH₃CO group (acetyl) stays in the product after hydrolysis and decarboxylation.',
        shortLabel: 'Acetoacetate + RX',
      },
      {
        atoms: [
          mk('c_me', 'CH₃',  140, 165),
          mk('c_k',  'C',    270, 165, { role: 'carbonyl_carbon' }),
          mk('o_k',  'O',    270,  55, { role: 'carbonyl_oxygen' }),
          mk('c_al', 'C',    400, 165, { role: 'alpha_carbon', glow: true }),
          mk('r',    'R',    400, 265),
          mk('h',    'H',    510, 130),
        ],
        bonds: [
          bd('me-ck','c_me','c_k'), bd('ck-ok','c_k','o_k',2),
          bd('ck-cal','c_k','c_al'), bd('cal-r','c_al','r'), bd('cal-h','c_al','h'),
        ],
        arrows: [],
        description: 'Methyl ketone product CH₃-CO-CHR-H after hydrolysis and decarboxylation. The ester COOH group was lost as CO₂. Product has 3 more carbons than RX: 2 from the acetyl (CH₃CO) + 1 from the α-carbon. Always a methyl ketone — versatile for synthesis.',
        shortLabel: 'Methyl ketone product',
      },
    ],
    energyDiagram: [
      { label: 'Acetoacetate + RX', energy: 30 },
      { label: 'β-Keto ester enolate', energy: 20 },
      { label: 'TS (SN2)', energy: 38, isTransitionState: true },
      { label: 'Methyl ketone', energy: 8 },
    ],
  },

  // ── 8. Decarboxylation of β-Keto Acids ───────────────────────────────────────
  {
    id: 'decarboxylation',
    category: 'enolate',
    name: 'Decarboxylation of β-Keto Acids',
    summary: 'β-Keto acids (1,3-keto acids) lose CO₂ readily when heated via a cyclic 6-membered transition state. Enol forms first, then tautomerizes to ketone. Final step of malonic ester and acetoacetic ester syntheses.',
    reactants: 'β-Keto acid (R-CO-CH₂-COOH)',
    products: 'Ketone (R-CO-CH₃) + CO₂',
    conditions: 'Heat (Δ); acid conditions also helpful; piperidine (amine base) can catalyze via Schiff base',
    reactantSpecies: {
      text: 'β-Keto acid (R-CO-CH₂-COOH)',
      species: [
        { smiles: '[R]C(=O)CC(=O)O', label: 'β-Keto acid' },
      ],
    },
    productSpecies: {
      text: 'Ketone (R-CO-CH₃) + CO₂',
      species: [
        { smiles: '[R]C(=O)C', label: 'Ketone' },
        { smiles: 'O=C=O', label: 'CO₂' },
      ],
    },
    conditionSpecies: {
      text: 'Heat (Δ); acid conditions also helpful; piperidine (amine base) can catalyze via Schiff base',
      species: [
        { smiles: 'C1CCNCC1', label: 'Piperidine (cat.)', catalyst: true },
      ],
    },
    reactionType: 'elimination',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Enol (cyclic TS)',
    reversible: false,
    importantInfo: [
      'β-Keto acids lose CO₂ readily on heating. One carbonyl MUST be a carboxylic acid AND the other must be β (1,3-relationship).',
      'Mechanism: 6-membered cyclic transition state → enol → tautomerizes to ketone. CO₂ leaves.',
      'Simple carboxylic acids do NOT decarboxylate easily (no β-carbonyl to stabilize the TS).',
      'This is the final step in both malonic ester synthesis and acetoacetic ester synthesis.',
    ],
    brownRef: 'Ch 19.11',
    relatedReactions: MALONIC_RELATED.filter(id => id !== 'decarboxylation'),
    tags: ['decarboxylation', 'beta-keto acid', 'CO₂', 'enol', 'cyclic TS', 'malonic ester', 'acetoacetic ester'],
    frames: [
      {
        // β-Keto acid: R-CO-CH₂-COOH in a 6-membered cyclic TS
        atoms: [
          mk('r',    'R',    140, 165, { role: 'r_group' }),
          mk('c_k',  'C',    270, 165, { role: 'carbonyl_carbon' }),
          mk('o_k',  'O',    270,  55, { role: 'carbonyl_oxygen' }),
          mk('c_al', 'C',    400, 165, { role: 'alpha_carbon' }),
          mk('c_a',  'C',    530, 165, { role: 'carbonyl_carbon' }),
          mk('o_a1', 'O',    530,  55, { role: 'carbonyl_oxygen' }),
          mk('oh',   'OH',   660, 165),
          mk('h_al', 'H',    400, 265),
        ],
        bonds: [
          bd('r-ck','r','c_k'), bd('ck-ok','c_k','o_k',2),
          bd('ck-cal','c_k','c_al'), bd('cal-ca','c_al','c_a'),
          bd('ca-oa1','c_a','o_a1',2), bd('ca-oh','c_a','oh'),
          bd('cal-hal','c_al','h_al'),
        ],
        arrows: [
          { from: { kind: 'lonePair', atomId: 'o_k', angleDeg: 270 }, to: { kind: 'atom', id: 'h_al' }, color: 'var(--c-halogen)' },
          { from: { kind: 'atom', id: 'c_al' }, to: { kind: 'atom', id: 'c_a' }, color: 'var(--c-alkali)' },
        ],
        description: 'β-Keto acid. On heating, a 6-membered cyclic transition state forms: the carboxylic OH hydrogen migrates to the β-ketone oxygen while C–C bond breaks simultaneously, expelling CO₂. The proton transfer and bond breaking are concerted.',
        shortLabel: 'β-Keto acid (heated)',
      },
      {
        atoms: [
          mk('r',    'R',    150, 165),
          mk('c_k',  'C',    280, 165, { role: 'carbonyl_carbon' }),
          mk('oh',   'OH',   280,  55, { glow: true }),
          mk('c_al', 'C',    410, 165, { role: 'alpha_carbon' }),
          mk('h',    'H',    410, 265),
          mk('co2',  'CO₂',  600, 200, { label: 'byproduct' }),
        ],
        bonds: [
          bd('r-ck','r','c_k'), bd('ck-oh','c_k','oh'),
          bd('ck-cal','c_k','c_al',2), bd('cal-h','c_al','h'),
        ],
        arrows: [],
        description: 'Enol intermediate + CO₂. The enol tautomerizes to the ketone (C=O, C–H) → final ketone product. CO₂ is the byproduct. This decarboxylation is the reason that malonic and acetoacetic ester synthesis products have one fewer COOH than expected from simple ester hydrolysis.',
        shortLabel: 'Enol → Ketone + CO₂',
      },
    ],
    energyDiagram: [
      { label: 'β-Keto acid', energy: 35 },
      { label: 'Cyclic TS', energy: 52, isTransitionState: true },
      { label: 'Enol + CO₂', energy: 20 },
      { label: 'Ketone', energy: 12 },
    ],
  },
]

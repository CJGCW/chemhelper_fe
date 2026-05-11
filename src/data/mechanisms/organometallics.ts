import type { ReactionDef, AtomPosition, BondPosition } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Grignard layout constants ─────────────────────────────────────────────────
// Carbonyl:  left(210,165) — C(350,165) — O(350,55) [double]
//            right(490,165) [optional, for ketone/formaldehyde]
// Grignard:  R-MgBr at (560,270) approaching C
// Alkoxide:  O(350,55) — MgBr(480,55); R_new at right (490,165)
//            bottom(350,270) for 3rd substituent on carbinol C

const GRIGNARD_RELATED = [
  'grignard-formaldehyde', 'grignard-aldehyde', 'grignard-ketone',
  'grignard-co2', 'grignard-ester', 'grignard-epoxide',
]

const GRIGNARD_INFO = [
  'ANHYDROUS conditions required — Grignard reacts violently with H₂O, ROH, or any protic source',
  'H⁺ workup (NH₄Cl/H₂O or dilute HCl) protonates the magnesium alkoxide → alcohol',
  'The R group in RMgX acts as R⁻ (carbanion equivalent) — a very strong nucleophile and base',
]

// ── Reactions ─────────────────────────────────────────────────────────────────

export const ORGANOMETALLIC_REACTIONS: ReactionDef[] = [

  // ── 1. Grignard + Formaldehyde ───────────────────────────────────────────────
  {
    id: 'grignard-formaldehyde',
    category: 'organometallic',
    name: 'Grignard + Formaldehyde → 1° Alcohol',
    summary: 'RMgX adds to H₂C=O to give a primary alcohol (one more carbon than the Grignard). Formaldehyde is unique: the only aldehyde with no R group → product has only 1 R on the carbinol carbon.',
    reactants: 'RMgX + H₂C=O (formaldehyde)',
    products: 'RCH₂OH (1° alcohol)',
    conditions: 'Anhydrous ether or THF; −78 °C to rt; then H₃O⁺ workup',
    reactantSpecies: {
      text: 'RMgX + H₂C=O (formaldehyde)',
      species: [
        { smiles: '[R][Mg]Br', label: 'Grignard (RMgX)' },
        { smiles: 'C=O', label: 'Formaldehyde' },
      ],
    },
    productSpecies: {
      text: 'RCH₂OH (1° alcohol)',
      species: [
        { smiles: '[R]CO', label: '1° Alcohol (RCH₂OH)' },
      ],
    },
    conditionSpecies: {
      text: 'Anhydrous ether or THF; −78 °C to rt; then H₃O⁺ workup',
      species: [
        { smiles: 'CCOCC', label: 'Et₂O (anhydrous)', catalyst: true },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Magnesium alkoxide',
    importantInfo: [
      'Formaldehyde (H₂C=O): no R group → product is always a PRIMARY alcohol (2 H on carbinol C)',
      ...GRIGNARD_INFO,
      'Formaldehyde is the most reactive aldehyde toward nucleophilic addition (least hindered)',
    ],
    brownRef: 'Ch 15.1',
    relatedReactions: GRIGNARD_RELATED.filter(id => id !== 'grignard-formaldehyde'),
    tags: ['Grignard', 'formaldehyde', '1° alcohol', 'organometallic', 'addition', 'anhydrous'],
    frames: [
      {
        atoms: [
          mk('h1',  'H',       210, 165),
          mk('c',   'C',       350, 165, { role: 'carbonyl_carbon' }),
          mk('o',   'O',       350,  55, { role: 'carbonyl_oxygen' }),
          mk('h2',  'H',       490, 165),
          mk('nu',  'R-MgX',   560, 270, { role: 'nucleophile' }),
        ],
        bonds: [bd('h1-c','h1','c'), bd('c-o','c','o',2), bd('c-h2','c','h2')],
        arrows: [{ from: { kind:'atom', id:'nu' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: 'Formaldehyde (H₂C=O): no R groups, least hindered carbonyl. R⁻ (from R-MgX) attacks the electrophilic carbonyl carbon. This is a nucleophilic addition.',
        shortLabel: 'H₂C=O + R-MgX',
      },
      {
        atoms: [
          mk('h1',   'H',   210, 165),
          mk('c',    'C',   350, 165),
          mk('o',    'O',   350,  55),
          mk('mgx',  'MgX', 480,  55),
          mk('r',    'R',   490, 165, { glow: true }),
          mk('h2',   'H',   350, 265),
        ],
        bonds: [
          bd('h1-c','h1','c'), bd('c-o','c','o'), bd('o-mgx','o','mgx'),
          bd('c-r','c','r'), bd('c-h2','c','h2'),
        ],
        arrows: [],
        description: 'Magnesium alkoxide intermediate. The carbinol C is now sp³ with H, H, R, O-MgX. Stable in anhydrous conditions. Protonation with NH₄Cl/H₂O gives the alcohol.',
        shortLabel: 'Mg alkoxide',
      },
      {
        atoms: [
          mk('h1', 'H',  210, 165),
          mk('c',  'C',  350, 165),
          mk('oh', 'OH', 350,  55),
          mk('r',  'R',  490, 165),
          mk('h2', 'H',  350, 265),
        ],
        bonds: [
          bd('h1-c','h1','c'), bd('c-oh','c','oh'),
          bd('c-r','c','r'), bd('c-h2','c','h2'),
        ],
        arrows: [],
        description: '1° alcohol product (R-CH₂-OH). The carbinol carbon has 2 H and 1 R → primary alcohol. Chain extended by 1 carbon relative to the Grignard reagent.',
        shortLabel: '1° Alcohol',
      },
    ],
    energyDiagram: [
      { label: 'R-MgX + H₂C=O', energy: 35 },
      { label: 'TS',              energy: 62, isTransitionState: true },
      { label: 'Alkoxide',        energy: 20 },
      { label: '1° Alcohol',      energy: 15 },
    ],
  },

  // ── 2. Grignard + Aldehyde ───────────────────────────────────────────────────
  {
    id: 'grignard-aldehyde',
    category: 'organometallic',
    name: 'Grignard + Aldehyde → 2° Alcohol',
    summary: 'RMgX adds to R′CHO to give a secondary alcohol. One R comes from the Grignard, one R′ was already on the aldehyde.',
    reactants: 'RMgX + R′CHO',
    products: 'R′CH(OH)R (2° alcohol)',
    conditions: 'Anhydrous ether or THF; rt; then H₃O⁺ workup',
    reactantSpecies: {
      text: 'RMgX + R′CHO',
      species: [
        { smiles: '[R][Mg]Br', label: 'Grignard (RMgX)' },
        { smiles: "[R]C=O", label: "Aldehyde (R'CHO)" },
      ],
    },
    productSpecies: {
      text: 'R′CH(OH)R (2° alcohol)',
      species: [
        { smiles: "[R]C(O)[R]", label: '2° Alcohol' },
      ],
    },
    conditionSpecies: {
      text: 'Anhydrous ether or THF; rt; then H₃O⁺ workup',
      species: [
        { smiles: 'CCOCC', label: 'Et₂O (anhydrous)', catalyst: true },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Magnesium alkoxide',
    importantInfo: [
      'Aldehyde has 1 R group → product carbinol C has 2 R groups → secondary alcohol',
      ...GRIGNARD_INFO,
      'Aldehyde more reactive than ketone (less steric hindrance) but less reactive than formaldehyde',
    ],
    brownRef: 'Ch 15.1',
    relatedReactions: GRIGNARD_RELATED.filter(id => id !== 'grignard-aldehyde'),
    tags: ['Grignard', 'aldehyde', '2° alcohol', 'organometallic', 'addition', 'anhydrous'],
    frames: [
      {
        atoms: [
          mk('r_prime', "R′",    210, 165, { role: 'r_group' }),
          mk('c',       'C',     350, 165, { role: 'carbonyl_carbon' }),
          mk('o',       'O',     350,  55, { role: 'carbonyl_oxygen' }),
          mk('h_ald',   'H',     490, 165),
          mk('nu',      'R-MgX', 560, 270, { role: 'nucleophile' }),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-o','c','o',2), bd('c-h','c','h_ald'),
        ],
        arrows: [{ from: { kind:'atom', id:'nu' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: 'Aldehyde R′CHO: carbonyl C has R′ and H. R⁻ from Grignard attacks electrophilic C=O.',
        shortLabel: "R′CHO + R-MgX",
      },
      {
        atoms: [
          mk('r_prime', "R′",  210, 165, { role: 'r_group' }),
          mk('c',       'C',   350, 165),
          mk('o',       'O',   350,  55),
          mk('mgx',     'MgX', 480,  55),
          mk('r_new',   'R',   490, 165, { glow: true }),
          mk('h_ald',   'H',   350, 265),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-o','c','o'), bd('o-mgx','o','mgx'),
          bd('c-r','c','r_new'), bd('c-h','c','h_ald'),
        ],
        arrows: [],
        description: 'Magnesium alkoxide: sp³ carbinol C with R′, H, R, O-MgX. Protonation gives the 2° alcohol.',
        shortLabel: 'Mg alkoxide',
      },
      {
        atoms: [
          mk('r_prime', "R′", 210, 165),
          mk('c',       'C',  350, 165),
          mk('oh',      'OH', 350,  55),
          mk('r',       'R',  490, 165),
          mk('h',       'H',  350, 265),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-oh','c','oh'),
          bd('c-r','c','r'), bd('c-h','c','h'),
        ],
        arrows: [],
        description: '2° alcohol R′CH(OH)R. Two different R groups on the carbinol carbon — this creates a stereocenter if R ≠ R′ → racemic mixture (Grignard adds from both faces).',
        shortLabel: '2° Alcohol',
      },
    ],
    energyDiagram: [
      { label: "R-MgX + R′CHO", energy: 35 },
      { label: 'TS',             energy: 65, isTransitionState: true },
      { label: 'Alkoxide',       energy: 18 },
      { label: '2° Alcohol',     energy: 12 },
    ],
  },

  // ── 3. Grignard + Ketone ─────────────────────────────────────────────────────
  {
    id: 'grignard-ketone',
    category: 'organometallic',
    name: 'Grignard + Ketone → 3° Alcohol',
    summary: 'RMgX adds to R′COR′′ to give a tertiary alcohol. All three carbons on the carbinol come from the ketone (R′, R′′) and the Grignard (R).',
    reactants: 'RMgX + R′COR′′',
    products: 'R′R′′C(OH)R (3° alcohol)',
    conditions: 'Anhydrous ether or THF; rt (slower than with aldehydes); then H₃O⁺ workup',
    reactantSpecies: {
      text: 'RMgX + R′COR′′',
      species: [
        { smiles: '[R][Mg]Br', label: 'Grignard (RMgX)' },
        { smiles: "[R]C(=O)[R]", label: "Ketone (R'COR'')" },
      ],
    },
    productSpecies: {
      text: 'R′R′′C(OH)R (3° alcohol)',
      species: [
        { smiles: '[R]C(O)([R])[R]', label: '3° Alcohol' },
      ],
    },
    conditionSpecies: {
      text: 'Anhydrous ether or THF; rt (slower than with aldehydes); then H₃O⁺ workup',
      species: [
        { smiles: 'CCOCC', label: 'Et₂O (anhydrous)', catalyst: true },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Magnesium alkoxide',
    importantInfo: [
      'Ketone has 2 R groups → product has 3 R groups on carbinol C → tertiary alcohol',
      ...GRIGNARD_INFO,
      'Ketones are less reactive than aldehydes (more hindered C=O, more electron-rich) — sometimes need to heat or use a more reactive Grignard',
    ],
    brownRef: 'Ch 15.1',
    relatedReactions: GRIGNARD_RELATED.filter(id => id !== 'grignard-ketone'),
    tags: ['Grignard', 'ketone', '3° alcohol', 'organometallic', 'addition', 'anhydrous'],
    frames: [
      {
        atoms: [
          mk('r_prime',  "R′",   210, 165, { role: 'r_group' }),
          mk('c',        'C',    350, 165, { role: 'carbonyl_carbon' }),
          mk('o',        'O',    350,  55, { role: 'carbonyl_oxygen' }),
          mk('r_dbl',    "R′′",  490, 165, { role: 'r_group' }),
          mk('nu',       'R-MgX',560, 270, { role: 'nucleophile' }),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-o','c','o',2), bd('c-rd','c','r_dbl'),
        ],
        arrows: [{ from: { kind:'atom', id:'nu' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: "Ketone R′COR′′: carbonyl C has R′ and R′′ (more hindered than aldehyde). R⁻ attacks C=O from the less hindered face.",
        shortLabel: "R′COR′′ + R-MgX",
      },
      {
        atoms: [
          mk('r_prime', "R′",  210, 165),
          mk('c',       'C',   350, 165),
          mk('o',       'O',   350,  55),
          mk('mgx',     'MgX', 480,  55),
          mk('r_new',   'R',   490, 165, { glow: true }),
          mk('r_dbl',   "R′′", 350, 265),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-o','c','o'), bd('o-mgx','o','mgx'),
          bd('c-r','c','r_new'), bd('c-rd','c','r_dbl'),
        ],
        arrows: [],
        description: 'Magnesium alkoxide: quaternary carbinol C (no H!) with R′, R′′, R, O-MgX. Protonation gives 3° alcohol.',
        shortLabel: 'Mg alkoxide',
      },
      {
        atoms: [
          mk('r_prime', "R′", 210, 165),
          mk('c',       'C',  350, 165),
          mk('oh',      'OH', 350,  55),
          mk('r',       'R',  490, 165),
          mk('r_dbl',   "R′′",350, 265),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-oh','c','oh'),
          bd('c-r','c','r'), bd('c-rd','c','r_dbl'),
        ],
        arrows: [],
        description: '3° alcohol R′R′′C(OH)R. No H on the carbinol carbon — cannot be oxidized by PCC or Jones reagent. Racemic (Grignard adds from both faces of prochiral ketone).',
        shortLabel: '3° Alcohol',
      },
    ],
    energyDiagram: [
      { label: "R-MgX + ketone", energy: 38 },
      { label: 'TS',              energy: 70, isTransitionState: true },
      { label: 'Alkoxide',        energy: 22 },
      { label: '3° Alcohol',      energy: 15 },
    ],
  },

  // ── 4. Grignard + CO₂ ───────────────────────────────────────────────────────
  {
    id: 'grignard-co2',
    category: 'organometallic',
    name: 'Grignard + CO₂ → Carboxylic Acid',
    summary: 'RMgX adds to CO₂ to give a carboxylate salt; H⁺ workup gives a carboxylic acid with one more carbon than the starting Grignard reagent.',
    reactants: 'RMgX + CO₂ (dry ice)',
    products: 'RCOOH (carboxylic acid, +1C)',
    conditions: 'Pour Grignard solution over dry ice (solid CO₂); then H₃O⁺ workup; anhydrous',
    reactantSpecies: {
      text: 'RMgX + CO₂ (dry ice)',
      species: [
        { smiles: '[R][Mg]Br', label: 'Grignard (RMgX)' },
        { smiles: 'O=C=O', label: 'CO₂ (dry ice)' },
      ],
    },
    productSpecies: {
      text: 'RCOOH (carboxylic acid, +1C)',
      species: [
        { smiles: '[R]C(=O)O', label: 'Carboxylic acid (RCOOH)' },
      ],
    },
    conditionSpecies: {
      text: 'Pour Grignard solution over dry ice (solid CO₂); then H₃O⁺ workup; anhydrous',
      species: [
        { smiles: 'O=C=O', label: 'CO₂ (dry ice)' },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Magnesium carboxylate',
    importantInfo: [
      'Product is a carboxylic acid with exactly 1 more carbon than the Grignard R group',
      ...GRIGNARD_INFO,
      'Practical method: pour the anhydrous Grignard solution over crushed dry ice (solid CO₂)',
      'This is one of the simplest ways to add a carboxylate group to an organic molecule',
    ],
    brownRef: 'Ch 15.1',
    relatedReactions: GRIGNARD_RELATED.filter(id => id !== 'grignard-co2'),
    tags: ['Grignard', 'CO₂', 'carboxylic acid', 'organometallic', 'addition', 'chain extension'],
    frames: [
      {
        atoms: [
          mk('o1',  'O',     205, 165),
          mk('c',   'C',     350, 165, { role: 'carbonyl_carbon' }),
          mk('o2',  'O',     495, 165),
          mk('nu',  'R-MgX', 350, 290, { role: 'nucleophile' }),
        ],
        bonds: [bd('o1-c','o1','c',2), bd('c-o2','c','o2',2)],
        arrows: [{ from: { kind:'atom', id:'nu' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: 'CO₂ is electrophilic at carbon (both oxygens withdraw electron density). R⁻ from Grignard attacks CO₂ carbon. Practical: pour Grignard solution over dry ice.',
        shortLabel: 'R-MgX + CO₂',
      },
      {
        atoms: [
          mk('r',   'R',    205, 165, { role: 'r_group' }),
          mk('c',   'C',    350, 165, { role: 'carbonyl_carbon' }),
          mk('o1',  'O',    350,  55, { role: 'carbonyl_oxygen' }),
          mk('o2',  'O',    495, 165),
          mk('mgx', 'MgX',  625, 165),
        ],
        bonds: [bd('r-c','r','c'), bd('c-o1','c','o1',2), bd('c-o2','c','o2'), bd('o2-mgx','o2','mgx')],
        arrows: [],
        description: 'Magnesium carboxylate salt (R-COO-MgX). The C now has R bonded and retains a C=O. Protonation converts O-MgX to OH → carboxylic acid.',
        shortLabel: 'Mg carboxylate',
      },
      {
        atoms: [
          mk('r',  'R',   205, 165, { role: 'r_group' }),
          mk('c',  'C',   350, 165, { role: 'carbonyl_carbon' }),
          mk('o1', 'O',   350,  55, { role: 'carbonyl_oxygen' }),
          mk('oh', 'OH',  495, 165),
        ],
        bonds: [bd('r-c','r','c'), bd('c-o1','c','o1',2), bd('c-oh','c','oh')],
        arrows: [],
        description: 'Carboxylic acid (RCOOH). One new carbon added. The R-MgX was a 1C-longer carboxylic acid precursor. Simple way to convert R-X → R-COOH in 2 steps (R-X + Mg → R-MgX; R-MgX + CO₂ → RCOOH).',
        shortLabel: 'RCOOH',
      },
    ],
    energyDiagram: [
      { label: 'R-MgX + CO₂', energy: 38 },
      { label: 'TS',           energy: 68, isTransitionState: true },
      { label: 'Carboxylate',  energy: 20 },
      { label: 'RCOOH',        energy: 12 },
    ],
  },

  // ── 5. Grignard + Ester ──────────────────────────────────────────────────────
  {
    id: 'grignard-ester',
    category: 'organometallic',
    name: 'Grignard + Ester → 3° Alcohol',
    summary: 'Two equivalents of RMgX add to an ester: the first converts it to a ketone (which cannot be isolated), and the second adds to the ketone. Net: TWO R groups added → 3° alcohol.',
    reactants: '2 RMgX + R′COOR′′',
    products: 'R′R₂COH (3° alcohol, 2 identical R groups)',
    conditions: 'Excess RMgX (≥ 2 eq), anhydrous ether or THF; then H₃O⁺ workup',
    reactantSpecies: {
      text: '2 RMgX + R′COOR′′',
      species: [
        { smiles: '[R][Mg]Br', label: 'Grignard (RMgX, 2 eq)' },
        { smiles: "[R]C(=O)OC", label: "Ester (R'COOR'')" },
      ],
    },
    productSpecies: {
      text: 'R′R₂COH (3° alcohol, 2 identical R groups)',
      species: [
        { smiles: '[R]C(O)([R])[R]', label: '3° Alcohol (2× R from Grignard)' },
      ],
    },
    conditionSpecies: {
      text: 'Excess RMgX (≥ 2 eq), anhydrous ether or THF; then H₃O⁺ workup',
      species: [
        { smiles: 'CCOCC', label: 'Et₂O (anhydrous)', catalyst: true },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Ketone (cannot be isolated)',
    importantInfo: [
      'Two equivalents of Grignard add: 1st gives ketone → 2nd adds immediately → 3° alcohol',
      'CANNOT stop at the ketone stage — use Gilman reagent (R₂CuLi) if you need to stop at ketone',
      'Both R groups in the product are identical (both come from R-MgX)',
      ...GRIGNARD_INFO,
    ],
    brownRef: 'Ch 15.1',
    relatedReactions: GRIGNARD_RELATED.filter(id => id !== 'grignard-ester'),
    tags: ['Grignard', 'ester', '3° alcohol', '2 equivalents', 'organometallic', 'addition'],
    frames: [
      {
        atoms: [
          mk('r_prime', "R′",    205, 165, { role: 'r_group' }),
          mk('c',       'C',     350, 165, { role: 'carbonyl_carbon' }),
          mk('o1',      'O',     350,  55, { role: 'carbonyl_oxygen' }),
          mk('or2',     "OR′′",  495, 165, { role: 'leaving_group' }),
          mk('nu',      'R-MgX', 560, 270, { role: 'nucleophile' }),
        ],
        bonds: [bd('rp-c','r_prime','c'), bd('c-o1','c','o1',2), bd('c-or2','c','or2')],
        arrows: [{ from: { kind:'atom', id:'nu' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: 'Ester R′COOR′′: 1st equivalent of R-MgX attacks carbonyl C. Tetrahedral intermediate forms, then OR′′ leaves → ketone R′COR. (Ketone forms in situ — cannot be isolated.)',
        shortLabel: "Ester + R-MgX (1st eq)",
      },
      {
        atoms: [
          mk('r_prime', "R′",   205, 165, { role: 'r_group' }),
          mk('c',       'C',    350, 165, { role: 'carbonyl_carbon' }),
          mk('o',       'O',    350,  55, { role: 'carbonyl_oxygen' }),
          mk('r_first', 'R',    495, 165),
          mk('nu2',     'R-MgX',560, 270, { role: 'nucleophile' }),
        ],
        bonds: [bd('rp-c','r_prime','c'), bd('c-o','c','o',2), bd('c-rf','c','r_first')],
        arrows: [{ from: { kind:'atom', id:'nu2' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: 'Ketone intermediate R′COR reacts immediately with 2nd equivalent of R-MgX. The ketone is more reactive than the ester → cannot stop here.',
        shortLabel: 'Ketone + R-MgX (2nd eq)',
      },
      {
        atoms: [
          mk('r_prime', "R′", 205, 165),
          mk('c',       'C',  350, 165),
          mk('oh',      'OH', 350,  55),
          mk('r1',      'R',  495, 165),
          mk('r2',      'R',  350, 265),
        ],
        bonds: [
          bd('rp-c','r_prime','c'), bd('c-oh','c','oh'),
          bd('c-r1','c','r1'), bd('c-r2','c','r2'),
        ],
        arrows: [],
        description: '3° alcohol R′R₂C-OH. Two identical R groups added. Product is symmetric in R. To stop at the ketone stage, use Gilman reagent (R₂CuLi) instead of Grignard.',
        shortLabel: '3° Alcohol (2R added)',
      },
    ],
    energyDiagram: [
      { label: 'Ester + 2 R-MgX', energy: 40 },
      { label: 'Ketone intermediate', energy: 25 },
      { label: 'Alkoxide',           energy: 15 },
      { label: '3° Alcohol',          energy: 10 },
    ],
  },

  // ── 6. Grignard + Epoxide ────────────────────────────────────────────────────
  {
    id: 'grignard-epoxide',
    category: 'organometallic',
    name: 'Grignard + Epoxide → Alcohol (2C Extension)',
    summary: 'RMgX opens an epoxide via SN2 at the less substituted carbon (anti-Markovnikov, inversion). The chain is extended by the 2 carbons of the epoxide. Product is an alcohol.',
    reactants: 'RMgX + epoxide',
    products: 'Alcohol (chain extended by 2C with OH at β-position)',
    conditions: 'Anhydrous ether or THF; rt; then H₃O⁺ workup; BF₃ catalyst possible for 2,3-epoxides',
    reactantSpecies: {
      text: 'RMgX + epoxide',
      species: [
        { smiles: '[R][Mg]Br', label: 'Grignard (RMgX)' },
        { smiles: 'C1CO1', label: 'Epoxide' },
      ],
    },
    productSpecies: {
      text: 'Alcohol (chain extended by 2C with OH at β-position)',
      species: [
        { smiles: '[R]CCO', label: 'β-Hydroxy product' },
      ],
    },
    conditionSpecies: {
      text: 'Anhydrous ether or THF; rt; then H₃O⁺ workup; BF₃ catalyst possible for 2,3-epoxides',
      species: [
        { smiles: 'CCOCC', label: 'Et₂O (anhydrous)', catalyst: true },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: 'anti-markovnikov',
    stereochemistry: 'inversion',
    intermediate: 'Magnesium alkoxide',
    importantInfo: [
      'Grignard opens epoxides at the LESS substituted carbon (SN2 mechanism, back-side attack)',
      'Inversion at attacked carbon (Walden inversion — SN2)',
      'Chain is extended by 2 carbons: Grignard C + both epoxide carbons → product has 2 more C than the original Grignard',
      ...GRIGNARD_INFO,
    ],
    brownRef: 'Ch 15.4',
    relatedReactions: GRIGNARD_RELATED.filter(id => id !== 'grignard-epoxide'),
    tags: ['Grignard', 'epoxide', 'ring opening', 'SN2', 'inversion', 'anti-Markovnikov', 'chain extension'],
    frames: [
      {
        // Epoxide ring: c1(less sub, left), c2(more sub, right), o_ep(above)
        atoms: [
          mk('c1',   'C',     290, 195, { role: 'less_substituted' }),
          mk('c2',   'C',     410, 195, { role: 'more_substituted' }),
          mk('o_ep', 'O',     350,  95),
          mk('h1',   'H',     220, 155),
          mk('h2',   'H',     220, 235),
          mk('r_ep', "R′",    500, 230, { role: 'r_group' }),
          mk('nu',   'R-MgX', 140, 195, { role: 'nucleophile' }),
        ],
        bonds: [
          bd('c1-c2','c1','c2'), bd('c1-o','c1','o_ep'), bd('c2-o','c2','o_ep'),
          bd('c1-h1','c1','h1'), bd('c1-h2','c1','h2'), bd('c2-rep','c2','r_ep'),
        ],
        arrows: [{
          from: { kind:'atom', id:'nu' },
          to:   { kind:'atom', id:'c1' },
          color: 'var(--c-alkali)',
        }],
        description: 'Grignard attacks the less substituted carbon (c1) of the epoxide via SN2 (back-side attack). Ring strain drives ring opening. Inverted configuration at c1.',
        shortLabel: 'R-MgX + epoxide',
      },
      {
        // Ring opened: R bonded to c1 (inverted), O-MgX on c2
        atoms: [
          mk('r',    'R',    145, 185, { glow: true }),
          mk('c1',   'C',    285, 185, { role: 'alpha_carbon' }),
          mk('c2',   'C',    435, 185),
          mk('o',    'O',    435,  55),
          mk('mgx',  'MgX',  565,  55),
          mk('r_ep', "R′",   565, 185, { role: 'r_group' }),
          mk('h',    'H',    285, 285),
        ],
        bonds: [
          bd('r-c1','r','c1'), bd('c1-c2','c1','c2'), bd('c2-o','c2','o'),
          bd('o-mgx','o','mgx'), bd('c2-rep','c2','r_ep'), bd('c1-h','c1','h'),
        ],
        arrows: [],
        description: 'Alkoxide: ring opened. R bonded to c1 (inverted config). O-MgX on c2. Chain is R-c1-c2(R′)(O-MgX) — 2 new carbons added. H⁺ workup gives alcohol.',
        shortLabel: 'Mg alkoxide',
      },
      {
        atoms: [
          mk('r',    'R',    145, 185),
          mk('c1',   'C',    285, 185),
          mk('c2',   'C',    435, 185),
          mk('oh',   'OH',   435,  55),
          mk('r_ep', "R′",   565, 185),
          mk('h',    'H',    285, 285),
        ],
        bonds: [
          bd('r-c1','r','c1'), bd('c1-c2','c1','c2'), bd('c2-oh','c2','oh'),
          bd('c2-rep','c2','r_ep'), bd('c1-h','c1','h'),
        ],
        arrows: [],
        description: 'Alcohol product: R extended by 2 carbons (c1 and c2), with OH on c2. Net: Grignard of RX → RMgX → opens epoxide → R-CH₂-CH(R′)-OH. Excellent for chain extension.',
        shortLabel: 'Alcohol (+2C)',
      },
    ],
    energyDiagram: [
      { label: 'R-MgX + epoxide', energy: 30 },
      { label: 'TS (SN2)',         energy: 58, isTransitionState: true },
      { label: 'Alkoxide',         energy: 15 },
      { label: 'Alcohol',          energy: 10 },
    ],
  },

  // ── 7. Gilman Reagent ────────────────────────────────────────────────────────
  {
    id: 'gilman-reaction',
    category: 'organometallic',
    name: 'Gilman Reagent (R₂CuLi) Coupling',
    summary: 'Dilithium dialkylcuprate (R₂CuLi, a Gilman reagent) undergoes SN2-like coupling with alkyl, vinyl, or aryl halides to form C–C bonds. Unlike Grignard, it does NOT add to C=O.',
    reactants: 'R₂CuLi + R′-X',
    products: 'R-R′ (coupled product) + RCu + LiX',
    conditions: 'Anhydrous ether or THF, −78 °C to 0 °C; X = Cl, Br, I; does not work with F',
    reactantSpecies: {
      text: 'R₂CuLi + R′-X',
      species: [
        { smiles: '[Cu]([R])[R].[Li+]', label: 'Gilman reagent (R₂CuLi)' },
        { smiles: "[R]Br", label: "R'–X (alkyl/vinyl/aryl halide)" },
      ],
    },
    productSpecies: {
      text: 'R-R′ (coupled product) + RCu + LiX',
      species: [
        { smiles: '[R][R]', label: "R-R' (coupled product)" },
      ],
    },
    conditionSpecies: {
      text: 'Anhydrous ether or THF, −78 °C to 0 °C; X = Cl, Br, I; does not work with F',
      species: [
        { smiles: 'CCOCC', label: 'Et₂O (anhydrous)', catalyst: true },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'R₂CuLi + R′-X → R-R′ + RCu + LiX: only ONE R group of the two is transferred',
      'Works with 1° and 2° alkyl halides, vinyl halides (unlike Grignard SN2), aryl halides',
      '3° halides: mostly fail (steric). X ≠ F (F too strong, bond too hard to break)',
      'Will NOT add to isolated C=O (unlike Grignard) — selective for C-X bonds',
      'Preparation: RX + 2Li → RLi; RLi + CuI (½ eq) → R₂CuLi',
    ],
    brownRef: 'Ch 15.2',
    relatedReactions: ['grignard-aldehyde', 'grignard-ester'],
    tags: ['Gilman', 'cuprate', 'R₂CuLi', 'coupling', 'C-C bond', 'organometallic', 'SN2'],
    frames: [
      {
        atoms: [
          mk('culi',    'R₂CuLi', 185, 165, { role: 'nucleophile' }),
          mk('r_prime', "R′",     385, 165),
          mk('x',       'X',      530, 165, { role: 'leaving_group' }),
        ],
        bonds: [bd('rp-x',"r_prime",'x')],
        arrows: [{ from: { kind:'atom', id:'culi' }, to: { kind:'atom', id:'r_prime' }, color:'var(--c-alkali)' }],
        description: 'R₂CuLi: both R groups are on Cu, only one transfers. SN2-like attack on R′-X. Works with 1°, 2°, vinyl, and aryl halides. Does NOT react with C=O.',
        shortLabel: 'R₂CuLi + R′-X',
      },
      {
        atoms: [
          mk('r',       'R',   250, 165, { glow: true }),
          mk('r_prime', "R′",  450, 165),
          mk('byp',     'RCu + LiX', 350, 265, { label: 'byproducts' }),
        ],
        bonds: [bd('r-rp','r','r_prime')],
        arrows: [],
        description: 'Coupled product R-R′. RCu and LiX leave as byproducts. New C–C bond formed. Stereospecific with vinyl/aryl halides: geometry is retained at sp² carbons.',
        shortLabel: 'R-R′',
      },
    ],
    energyDiagram: [
      { label: 'R₂CuLi + R′X', energy: 35 },
      { label: 'TS',            energy: 60, isTransitionState: true },
      { label: 'R-R′',          energy: 10 },
    ],
  },

  // ── 8. Acetylide Addition ────────────────────────────────────────────────────
  {
    id: 'acetylide-addition',
    category: 'organometallic',
    name: 'Acetylide + Aldehyde/Ketone → Propargylic Alcohol',
    summary: 'Terminal alkynes are deprotonated by NaNH₂ (or n-BuLi) to give acetylide anions (RC≡C⁻), which add to aldehydes or ketones to give propargylic alcohols.',
    reactants: 'RC≡CH + NaNH₂ → RC≡C⁻; then R′CHO',
    products: 'RC≡C-C(OH)(H)R′ (propargylic alcohol)',
    conditions: 'NaNH₂ (or n-BuLi), anhydrous THF; −78 °C to rt; then H₃O⁺ workup',
    reactantSpecies: {
      text: 'RC≡CH + NaNH₂ → RC≡C⁻; then R′CHO',
      species: [
        { smiles: '[R]C#C[H]', label: 'Terminal alkyne' },
        { smiles: "[R]C=O", label: "Aldehyde (R'CHO)" },
      ],
    },
    productSpecies: {
      text: 'RC≡C-C(OH)(H)R′ (propargylic alcohol)',
      species: [
        { smiles: '[R]C#CC(O)[R]', label: 'Propargylic alcohol' },
      ],
    },
    conditionSpecies: {
      text: 'NaNH₂ (or n-BuLi), anhydrous THF; −78 °C to rt; then H₃O⁺ workup',
      species: [
        { smiles: '[NH2-].[Na+]', label: 'NaNH₂' },
        { smiles: '[H+]', label: 'H₃O⁺ (workup)' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Acetylide anion',
    importantInfo: [
      'Terminal alkyne pKa ≈ 25 — deprotonated by NaNH₂ (pKa NH₃ ≈ 38) or n-BuLi',
      'Acetylide anion RC≡C⁻ is a good nucleophile AND carbon nucleophile (useful for adding C≡C units)',
      'Product propargylic alcohol has a C≡C group adjacent to the alcohol carbon',
      'The C≡C can later be reduced: Lindlar\'s (cis) or dissolving metal (trans) → alkene; or H₂/Pd → alkane',
      'Internal alkynes cannot be deprotonated (no terminal H) — must use terminal alkynes',
    ],
    brownRef: 'Ch 7.4',
    relatedReactions: ['grignard-aldehyde', 'alkyne-hx-addition'],
    tags: ['acetylide', 'terminal alkyne', 'propargylic alcohol', 'organometallic', 'addition', 'NaNH₂'],
    frames: [
      {
        atoms: [
          mk('rc',      'RC≡C⁻', 175, 165, { charge: '−', role: 'nucleophile' }),
          mk('c_car',   'C',     380, 165, { role: 'carbonyl_carbon' }),
          mk('o_car',   'O',     380,  55, { role: 'carbonyl_oxygen' }),
          mk('r_prime', "R′",    520, 165, { role: 'r_group' }),
          mk('h_ald',   'H',     240, 165),
        ],
        bonds: [bd('h-c','h_ald','c_car'), bd('c-o','c_car','o_car',2), bd('c-rp','c_car','r_prime')],
        arrows: [{ from: { kind:'atom', id:'rc' }, to: { kind:'atom', id:'c_car' }, color:'var(--c-alkali)' }],
        description: 'RC≡C⁻ (from NaNH₂ + RC≡CH) attacks aldehyde C=O. Terminal alkyne pKa ≈ 25 — strong enough base (NaNH₂) deprotonates it to form the acetylide nucleophile.',
        shortLabel: 'RC≡C⁻ + R′CHO',
      },
      {
        // Propargylic alcohol product
        atoms: [
          mk('r',       'R',    90, 165, { role: 'r_group' }),
          mk('c_alk1',  'C',   205, 165),
          mk('c_alk2',  'C',   325, 165),
          mk('c_car',   'C',   450, 165),
          mk('oh',      'OH',  450,  55),
          mk('r_prime', "R′",  580, 165),
          mk('h',       'H',   450, 265),
        ],
        bonds: [
          bd('r-c1','r','c_alk1'), bd('c1-c2','c_alk1','c_alk2',3),
          bd('c2-ccar','c_alk2','c_car'), bd('ccar-oh','c_car','oh'),
          bd('ccar-rp','c_car','r_prime'), bd('ccar-h','c_car','h'),
        ],
        arrows: [],
        description: 'Propargylic alcohol: RC≡C-CH(OH)R′. Triple bond adjacent to carbinol C. The C≡C can be: reduced to cis-alkene (Lindlar\'s H₂/Pd-BaSO₄-quinoline) or trans-alkene (Na/NH₃), or fully to alkane (H₂/Pd-C).',
        shortLabel: 'Propargylic alcohol',
      },
    ],
    energyDiagram: [
      { label: 'RC≡C⁻ + RCHO', energy: 30 },
      { label: 'TS',            energy: 58, isTransitionState: true },
      { label: 'Alkoxide',      energy: 15 },
      { label: 'Propargylic alc.', energy: 10 },
    ],
  },

  // ── 9. Cyanohydrin Formation ─────────────────────────────────────────────────
  {
    id: 'cyanohydrin-formation',
    category: 'organometallic',
    name: 'Cyanohydrin Formation (HCN + Carbonyl)',
    summary: 'CN⁻ (nucleophile) adds to an aldehyde or ketone to give a cyanohydrin — a compound with both OH and CN on the same carbon. Adds exactly 1 carbon. CN can be hydrolyzed to COOH or reduced to CH₂NH₂.',
    reactants: 'Aldehyde or ketone + HCN (or NaCN/H⁺)',
    products: 'Cyanohydrin (R₂C(OH)CN)',
    conditions: 'NaCN (or KCN) + catalytic H⁺; or HCN (toxic); pH ≈ 8–11 optimal; reversible',
    reactantSpecies: {
      text: 'Aldehyde or ketone + HCN (or NaCN/H⁺)',
      species: [
        { smiles: '[R]C(=O)[R]', label: 'Aldehyde/Ketone' },
        { smiles: 'N#C[H]', label: 'HCN', showLonePairs: true },
      ],
    },
    productSpecies: {
      text: 'Cyanohydrin (R₂C(OH)CN)',
      species: [
        { smiles: '[R]C(O)(C#N)[R]', label: 'Cyanohydrin' },
      ],
    },
    conditionSpecies: {
      text: 'NaCN (or KCN) + catalytic H⁺; or HCN (toxic); pH ≈ 8–11 optimal; reversible',
      species: [
        { smiles: '[Na+].[C-]#N', label: 'NaCN' },
        { smiles: '[H+]', label: 'H⁺ (cat.)', catalyst: true },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'CN⁻ is the actual nucleophile (HCN itself is too weak) — use NaCN + mild acid or buffered HCN',
      'Adds exactly 1 carbon to the molecule: the CN carbon',
      'CN group can be hydrolyzed: CN + H₂O/H⁺ → COOH (carboxylic acid); or reduced CN + LiAlH₄ → CH₂NH₂',
      'Reversible: retro-cyanohydrin occurs in base. This is how mandelic acid synthesis works.',
      'Aldehydes react faster and more completely than ketones (equilibrium constant larger)',
    ],
    brownRef: 'Ch 16.6',
    relatedReactions: ['grignard-aldehyde', 'acetylide-addition'],
    tags: ['cyanohydrin', 'HCN', 'NaCN', 'organometallic', 'addition', 'nitrile', '+1C'],
    frames: [
      {
        atoms: [
          mk('r1',  'R',   210, 165, { role: 'r_group' }),
          mk('c',   'C',   350, 165, { role: 'carbonyl_carbon' }),
          mk('o',   'O',   350,  55, { role: 'carbonyl_oxygen' }),
          mk('r2',  "R′",  490, 165, { role: 'r_group' }),
          mk('cn',  'CN⁻', 560, 270, { charge: '−', role: 'nucleophile' }),
        ],
        bonds: [bd('r1-c','r1','c'), bd('c-o','c','o',2), bd('c-r2','c','r2')],
        arrows: [{ from: { kind:'atom', id:'cn' }, to: { kind:'atom', id:'c' }, color:'var(--c-alkali)' }],
        description: 'CN⁻ (from NaCN + H⁺) attacks the electrophilic carbonyl carbon. Cyanide is a good nucleophile (small, C-nucleophile). HCN is NOT added directly — it is in equilibrium with CN⁻.',
        shortLabel: 'Carbonyl + CN⁻',
      },
      {
        atoms: [
          mk('r1', 'R',   210, 165),
          mk('c',  'C',   350, 165),
          mk('oh', 'OH',  350,  55),
          mk('r2', "R′",  490, 165),
          mk('cn', 'CN',  350, 270, { glow: true }),
        ],
        bonds: [
          bd('r1-c','r1','c'), bd('c-oh','c','oh'),
          bd('c-r2','c','r2'), bd('c-cn','c','cn'),
        ],
        arrows: [],
        description: 'Cyanohydrin R₂C(OH)CN. The C now has OH and CN on the same carbon. CN → COOH (hydrolysis, H₂O/H⁺) or CN → CH₂NH₂ (reduction, LiAlH₄). Reversible in base (retro-cyanohydrin).',
        shortLabel: 'Cyanohydrin',
      },
    ],
    energyDiagram: [
      { label: 'C=O + CN⁻', energy: 38 },
      { label: 'TS',         energy: 62, isTransitionState: true },
      { label: 'Cyanohydrin', energy: 30 },
    ],
  },
]

import type { ReactionDef, MechanismFrame } from './types'
import {
  alkyneReactantFrame,
  carbocationFrame,
  synAdditionProductFrame,
  antiAdditionProductFrame,
  type SubInfo,
} from './frameTemplates'

// Terminal alkyne (propyne-like): c1 = terminal ≡CH, c2 = internal ≡C-CH₃
const h_sub: SubInfo = { id: 'h_sub', symbol: 'H',   role: 'h_substituent' }
const me:    SubInfo = { id: 'me',    symbol: 'CH₃', role: 'r_group' }
// Internal alkyne (2-butyne-like): both C have CH₃
const me1: SubInfo = { id: 'me1', symbol: 'CH₃', role: 'r_group' }
const me2: SubInfo = { id: 'me2', symbol: 'CH₃', role: 'r_group' }

// Vinyl halide product frame (anti addition to alkyne → trans vinyl halide)
// c1-c2 is now double bond; X on c2 is dash-wedge (anti to H on c1 which is wedge)
function transVinylHalide(xId: string, xSymbol: string, desc: string): MechanismFrame {
  return {
    atoms: [
      { id: 'c1', symbol: 'C', x: 265, y: 175 },
      { id: 'c2', symbol: 'C', x: 435, y: 175 },
      { id: 'h_sub', symbol: 'H',    x: 215,  y: 88 },
      { id: 'me',    symbol: 'CH₃', x: 485,  y: 88 },
      { id: xId,     symbol: xSymbol, x: 485, y: 262 },
    ],
    bonds: [
      { id: 'c1-c2',       from: 'c1', to: 'c2',    order: 2 },
      { id: `c1-h_sub`,    from: 'c1', to: 'h_sub', order: 1, style: 'wedge' },
      { id: `c1-me`,       from: 'c1', to: 'me',    order: 1 },
      { id: `c2-${xId}`,   from: 'c2', to: xId,     order: 1, style: 'dash-wedge' },
    ],
    arrows: [],
    description: desc,
    shortLabel: 'Product',
  }
}

// Enol intermediate / vinyl alcohol frame (used in hydration reactions)
// C=C double bond, OH on c2, H on c1
function enolFrame(c1Sub: SubInfo | null, c2Sub: SubInfo | null, desc: string, label = 'Enol'): MechanismFrame {
  const atoms = [
    { id: 'c1', symbol: 'C', x: 265, y: 175 },
    { id: 'c2', symbol: 'C', x: 435, y: 175 },
    { id: 'oh', symbol: 'OH', x: 435, y: 80 },
  ]
  const bonds = [
    { id: 'c1-c2', from: 'c1', to: 'c2', order: 2 as const },
    { id: 'c2-oh', from: 'c2', to: 'oh', order: 1 as const },
  ]
  if (c1Sub) {
    atoms.push({ id: c1Sub.id, symbol: c1Sub.symbol, x: 215, y: 88 })
    bonds.push({ id: `c1-${c1Sub.id}`, from: 'c1', to: c1Sub.id, order: 1 as const })
  }
  if (c2Sub) {
    atoms.push({ id: c2Sub.id, symbol: c2Sub.symbol, x: 485, y: 262 })
    bonds.push({ id: `c2-${c2Sub.id}`, from: 'c2', to: c2Sub.id, order: 1 as const })
  }
  return { atoms, bonds, arrows: [], description: desc, shortLabel: label }
}

// Ketone product frame
function ketoneFrame(leftSub: SubInfo, rightSub: SubInfo, desc: string): MechanismFrame {
  return {
    atoms: [
      { id: 'c1', symbol: 'C', x: 265, y: 175 },
      { id: 'c2', symbol: 'C', x: 435, y: 175 },
      { id: 'o',  symbol: 'O', x: 435, y: 80 },
      { id: leftSub.id,  symbol: leftSub.symbol,  x: 215, y: 88 },
      { id: rightSub.id, symbol: rightSub.symbol, x: 485, y: 262 },
    ],
    bonds: [
      { id: 'c1-c2',              from: 'c1', to: 'c2',          order: 1 as const },
      { id: 'c2-o',               from: 'c2', to: 'o',           order: 2 as const },
      { id: `c1-${leftSub.id}`,   from: 'c1', to: leftSub.id,   order: 1 as const },
      { id: `c2-${rightSub.id}`,  from: 'c2', to: rightSub.id,  order: 1 as const },
    ],
    arrows: [],
    description: desc,
    shortLabel: 'Ketone',
  }
}

export const ALKYNE_REACTIONS: ReactionDef[] = [

  // ── 1. Hydrohalogenation ─────────────────────────────────────────────────────
  {
    id: 'hydrohalogenation-alkyne',
    category: 'alkyne',
    name: 'Hydrohalogenation of Alkynes',
    summary: 'HX adds across the alkyne in the Markovnikov sense via a vinylic carbocation. Anti addition gives the trans vinyl halide.',
    reactants: 'Alkyne + HX',
    products: 'Vinyl halide (Markovnikov, trans)',
    conditions: 'HBr or HCl; neat or polar solvent; 1 eq for vinyl halide, 2 eq for geminal dihalide',
    reactantSpecies: {
      text: 'Alkyne + HX',
      species: [
        { smiles: '[R]C#C[R]', label: 'Alkyne' },
        { smiles: '[H]Br', label: 'HBr' },
      ],
    },
    productSpecies: {
      text: 'Vinyl halide (Markovnikov, trans)',
      species: [
        { smiles: '[R]/C([Br])=C(/[H])[R]', label: 'trans-Vinyl bromide' },
      ],
    },
    conditionSpecies: {
      text: 'HBr or HCl; neat or polar solvent; 1 eq for vinyl halide, 2 eq for geminal dihalide',
      species: [
        { smiles: '[H]Br', label: 'HBr' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: 'markovnikov',
    stereochemistry: 'anti',
    intermediate: 'Vinylic carbocation',
    importantInfo: [
      '1 eq HX → vinyl halide (Markovnikov, anti preferred → trans/E product)',
      '2 eq HX → geminal dihalide (both X on same carbon)',
      'Vinylic carbocations are much less stable than alkyl carbocations — higher activation energy',
      'Anti addition: X⁻ attacks the vinylic cation from the face opposite to H',
      'HBr reacts faster than HCl; HF does not add readily',
    ],
    brownRef: 'Ch 7.5',
    relatedReactions: ['halogenation-alkyne', 'hydrohalogenation-alkene'],
    tags: ['addition', 'Markovnikov', 'anti', 'vinylic cation', 'vinyl halide', 'HBr'],
    frames: [
      alkyneReactantFrame({
        c1Top: h_sub, c2Top: me,
        reagents: [{ id: 'hbr', symbol: 'HBr', x: 265, y: 75, role: 'electrophile' }],
        arrows: [{ from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'hbr' } }],
        description: 'π electrons of the alkyne attack H⁺. Markovnikov: H adds to the terminal C1 (less substituted), placing the vinylic cation on internal C2. The triple bond becomes a double bond.',
        shortLabel: 'Reactant',
      }),
      carbocationFrame({
        cationOn: 2,
        c1Top: h_sub,
        reagents: [{ id: 'br', symbol: 'Br⁻', x: 435, y: 270, charge: '−', role: 'nucleophile' }],
        arrows: [{ from: { kind: 'lonePair', atomId: 'br', angleDeg: 315 }, to: { kind: 'atom', id: 'c2' }, bow: 1 }],
        description: 'Vinylic carbocation at C2 (internal, more stable than terminal). Br⁻ attacks from the face opposite to the newly added H — anti addition.',
        shortLabel: 'Vinyl Cation',
      }),
      transVinylHalide('br', 'Br',
        'Trans (E) vinyl bromide: H on C1 (wedge) and Br on C2 (dash-wedge) are on opposite faces — anti addition. This is the Markovnikov vinyl halide.',
      ),
    ],
    energyDiagram: [
      { label: 'Reactants',    energy: 45 },
      { label: 'TS₁',          energy: 105, isTransitionState: true },
      { label: 'Vinyl cation', energy: 82 },
      { label: 'TS₂',          energy: 89,  isTransitionState: true },
      { label: 'Products',     energy: 32 },
    ],
  },

  // ── 2. Halogenation ──────────────────────────────────────────────────────────
  {
    id: 'halogenation-alkyne',
    category: 'alkyne',
    name: 'Halogenation of Alkynes',
    summary: 'Br₂ adds across the alkyne with anti selectivity, giving the trans-1,2-dibromoalkene with 1 equivalent.',
    reactants: 'Alkyne + Br₂',
    products: 'Trans-1,2-dibromoalkene (or tetrahalide with 2 eq)',
    conditions: 'Br₂ in CH₂Cl₂; 1 eq for vinyl dihalide, 2 eq for tetrahalide',
    reactantSpecies: {
      text: 'Alkyne + Br₂',
      species: [
        { smiles: '[R]C#C[R]', label: 'Alkyne' },
        { smiles: 'BrBr', label: 'Br₂' },
      ],
    },
    productSpecies: {
      text: 'Trans-1,2-dibromoalkene (or tetrahalide with 2 eq)',
      species: [
        { smiles: '[R]/C([Br])=C(\\[Br])[R]', label: 'trans-1,2-Dibromoalkene' },
      ],
    },
    conditionSpecies: {
      text: 'Br₂ in CH₂Cl₂; 1 eq for vinyl dihalide, 2 eq for tetrahalide',
      species: [
        { smiles: 'BrBr', label: 'Br₂' },
        { smiles: 'ClCCl', label: 'CH₂Cl₂', catalyst: true },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: 'anti',
    intermediate: null,
    importantInfo: [
      '1 eq Br₂ → trans-dihaloalkene (always anti, trans product)',
      '2 eq Br₂ → tetrahalide (all four positions halogenated)',
      'Less reactive than alkene halogenation due to less electron-rich triple bond',
      'Bridged vinyl cation intermediate (similar to halonium) enforces anti geometry',
      'Cl₂ also works; I₂ is too unreactive unless activated',
    ],
    brownRef: 'Ch 7.5',
    relatedReactions: ['hydrohalogenation-alkyne', 'halogenation-alkene'],
    tags: ['addition', 'anti', 'trans', 'halogenation', 'dihalide', 'Br₂'],
    frames: [
      alkyneReactantFrame({
        c1Top: me1, c2Top: me2,
        reagents: [{ id: 'br2', symbol: 'Br₂', x: 350, y: 75, role: 'electrophile' }],
        arrows: [{ from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'br2' } }],
        description: 'π electrons attack Br₂. A bridged vinyl–bromonium intermediate forms (like in alkene halogenation). The other Br departs as Br⁻. Anti addition is enforced by the cyclic intermediate.',
        shortLabel: 'Reactant',
      }),
      antiAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'br1', symbol: 'Br' },
        c2Orig: me2,
        c2New: { id: 'br2', symbol: 'Br' },
        description: 'Trans-1,2-dibromoalkene: the two Br atoms are on opposite faces (anti addition, wedge and dash-wedge). With 2 equivalents of Br₂, further addition across the new C=C gives the tetrahalide.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',          energy: 50 },
      { label: 'TS',                 energy: 75, isTransitionState: true },
      { label: 'Trans-dibromoalkene', energy: 30 },
    ],
  },

  // ── 3. Acid-Catalyzed Hydration (terminal → methyl ketone) ───────────────────
  {
    id: 'hydration-alkyne-markovnikov',
    category: 'alkyne',
    name: 'Acid-Catalyzed Hydration (Terminal Alkyne)',
    summary: 'H₂O adds to a terminal alkyne (Markovnikov) via enol tautomerization to give a methyl ketone.',
    reactants: 'Terminal alkyne + H₂O (H₂SO₄ / HgSO₄ cat.)',
    products: 'Methyl ketone (Markovnikov)',
    conditions: 'Dilute H₂SO₄ with HgSO₄ catalyst; aqueous; 60–80 °C',
    reactantSpecies: {
      text: 'Terminal alkyne + H₂O (H₂SO₄ / HgSO₄ cat.)',
      species: [
        { smiles: '[R]C#C[H]', label: 'Terminal alkyne' },
        { smiles: 'O', label: 'H₂O', showLonePairs: true },
      ],
    },
    productSpecies: {
      text: 'Methyl ketone (Markovnikov)',
      species: [
        { smiles: 'CC(=O)[R]', label: 'Methyl ketone' },
      ],
    },
    conditionSpecies: {
      text: 'Dilute H₂SO₄ with HgSO₄ catalyst; aqueous; 60–80 °C',
      species: [
        { smiles: 'OS(=O)(=O)O', label: 'H₂SO₄', catalyst: true },
        { smiles: '[Hg+2]', label: 'HgSO₄', catalyst: true },
      ],
    },
    reactionType: 'addition',
    regiochemistry: 'markovnikov',
    stereochemistry: null,
    intermediate: 'Vinyl alcohol (enol)',
    importantInfo: [
      'Markovnikov: OH adds to the MORE substituted (internal) carbon',
      'Enol → ketone tautomerism is fast and thermodynamically favored',
      'HgSO₄ is required to activate the triple bond (mercury acts as π acid)',
      'Terminal alkynes give methyl ketones; internal alkynes give mixtures without symmetry',
      'Contrast with hydroboration (anti-Markovnikov, gives aldehyde from terminal alkyne)',
    ],
    brownRef: 'Ch 7.7',
    relatedReactions: ['hydration-alkyne-antimark', 'hydroboration-alkyne-terminal'],
    tags: ['addition', 'Markovnikov', 'enol', 'tautomerism', 'ketone', 'hydration', 'mercury'],
    frames: [
      alkyneReactantFrame({
        c1Top: h_sub, c2Top: me,
        reagents: [
          { id: 'h_w', symbol: 'H⁺',  x: 265, y: 75, role: 'electrophile' },
          { id: 'oh_w', symbol: 'H₂O', x: 435, y: 75, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'oh_w' } },
        ],
        description: 'H₂SO₄/HgSO₄ activates the alkyne as a π acid. H₂O attacks C2 (internal, more substituted = Markovnikov). H⁺ adds to the terminal C1. The enol intermediate forms.',
        shortLabel: 'Reactant',
      }),
      enolFrame(
        { id: 'h_sub', symbol: 'H' },
        { id: 'me',    symbol: 'CH₃' },
        'Vinyl alcohol (enol): C=C double bond with OH on C2. This is the kinetic product — rapidly tautomerizes to the more stable ketone.',
        'Enol',
      ),
      ketoneFrame(
        { id: 'h_sub', symbol: 'H' },
        { id: 'me',    symbol: 'CH₃' },
        'Methyl ketone (Markovnikov): keto form after enol tautomerism. The C=O is at C2 (internal carbon). This is the thermodynamically stable product.',
      ),
    ],
    energyDiagram: [
      { label: 'Reactants', energy: 50 },
      { label: 'TS',        energy: 75, isTransitionState: true },
      { label: 'Enol',      energy: 42 },
      { label: 'Ketone',    energy: 28 },
    ],
  },

  // ── 4. Acid-Catalyzed Hydration (internal → ketone) ─────────────────────────
  {
    id: 'hydration-alkyne-internal',
    category: 'alkyne',
    name: 'Acid-Catalyzed Hydration (Internal Alkyne)',
    summary: 'H₂O adds to an internal alkyne via enol tautomerization to give a single ketone when the alkyne is symmetric.',
    reactants: 'Internal alkyne + H₂O (H₂SO₄ / HgSO₄ cat.)',
    products: 'Ketone',
    conditions: 'Dilute H₂SO₄ with HgSO₄ catalyst; aqueous; 60–80 °C',
    reactantSpecies: {
      text: 'Internal alkyne + H₂O (H₂SO₄ / HgSO₄ cat.)',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
        { smiles: 'O', label: 'H₂O', showLonePairs: true },
      ],
    },
    productSpecies: {
      text: 'Ketone',
      species: [
        { smiles: '[R]C(=O)[R]', label: 'Ketone' },
      ],
    },
    conditionSpecies: {
      text: 'Dilute H₂SO₄ with HgSO₄ catalyst; aqueous; 60–80 °C',
      species: [
        { smiles: 'OS(=O)(=O)O', label: 'H₂SO₄', catalyst: true },
        { smiles: '[Hg+2]', label: 'HgSO₄', catalyst: true },
      ],
    },
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Vinyl alcohol (enol)',
    importantInfo: [
      'Symmetric internal alkynes give one ketone product; asymmetric give mixtures',
      'Enol tautomerizes to the keto form (ketone is the stable product)',
      'HgSO₄ activates the triple bond; without it, reaction is very slow',
      'Reactivity order: terminal alkynes > internal (terminal are more accessible)',
      'Complement to hydroboration (anti-Markovnikov) for regioselective hydration',
    ],
    brownRef: 'Ch 7.7',
    relatedReactions: ['hydration-alkyne-markovnikov', 'hydroboration-alkyne-internal'],
    tags: ['addition', 'enol', 'tautomerism', 'ketone', 'hydration', 'internal', 'mercury'],
    frames: [
      alkyneReactantFrame({
        c1Top: me1, c2Top: me2,
        reagents: [{ id: 'h2o', symbol: 'H₂O', x: 350, y: 75, role: 'nucleophile' }],
        arrows: [{ from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'h2o' } }],
        description: 'HgSO₄ activates the symmetric internal alkyne. H₂O adds to either carbon (equivalent by symmetry). An enol intermediate forms, which tautomerizes to a single ketone.',
        shortLabel: 'Reactant',
      }),
      enolFrame(
        { id: 'me1', symbol: 'CH₃' },
        { id: 'me2', symbol: 'CH₃' },
        'Enol intermediate: vinyl alcohol with C=C and OH. For a symmetric alkyne, only one ketone is possible. Rapid tautomerism converts the enol to the ketone.',
        'Enol',
      ),
      ketoneFrame(
        { id: 'me1', symbol: 'CH₃' },
        { id: 'me2', symbol: 'CH₃' },
        'Ketone product: the C=O at C2 (keto form). Symmetric internal alkynes give one pure ketone; asymmetric internal alkynes give mixtures.',
      ),
    ],
    energyDiagram: [
      { label: 'Reactants', energy: 50 },
      { label: 'TS',        energy: 72, isTransitionState: true },
      { label: 'Enol',      energy: 40 },
      { label: 'Ketone',    energy: 26 },
    ],
  },

  // ── 5. Hydroboration of Internal Alkyne ──────────────────────────────────────
  {
    id: 'hydroboration-alkyne-internal',
    category: 'alkyne',
    name: 'Hydroboration of Internal Alkynes',
    summary: 'BH₃ adds syn to an internal alkyne, then oxidation gives a cis-enol that tautomerizes to a ketone.',
    reactants: 'Internal alkyne + BH₃·THF; then H₂O₂/NaOH',
    products: 'Ketone (via enol, syn addition)',
    conditions: 'BH₃·THF; then H₂O₂, NaOH, H₂O',
    reactantSpecies: {
      text: 'Internal alkyne + BH₃·THF; then H₂O₂/NaOH',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
        { smiles: 'B([H])([H])[H]', label: 'BH₃' },
      ],
    },
    productSpecies: {
      text: 'Ketone (via enol, syn addition)',
      species: [
        { smiles: '[R]C(=O)[R]', label: 'Ketone' },
      ],
    },
    conditionSpecies: {
      text: 'BH₃·THF; then H₂O₂, NaOH, H₂O',
      species: [
        { smiles: 'B([H])([H])[H]', label: 'BH₃·THF', catalyst: true },
        { smiles: 'OO', label: 'H₂O₂' },
        { smiles: '[OH-]', label: 'NaOH' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: 'anti-markovnikov',
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'B adds to less hindered C (concerted syn), giving a cis-alkenylborane',
      'Oxidation (H₂O₂/NaOH) converts C–B to C–OH with retention → cis-enol',
      'Enol rapidly tautomerizes to ketone under aqueous conditions',
      'For symmetric internal alkynes, only one ketone product forms',
      'Contrast with acid-hydration (Markovnikov, same ketone from symmetric alkynes)',
    ],
    brownRef: 'Ch 7.8',
    relatedReactions: ['hydroboration-alkyne-terminal', 'hydration-alkyne-internal'],
    tags: ['addition', 'anti-Markovnikov', 'syn', 'hydroboration', 'ketone', 'internal'],
    frames: [
      alkyneReactantFrame({
        c1Top: me1, c2Top: me2,
        reagents: [{ id: 'bh3', symbol: 'BH₃', x: 350, y: 80, role: 'electrophile' }],
        arrows: [{ from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'bh3' } }],
        description: 'BH₃ approaches from one face. In a concerted 4-center TS, B adds to C2 while H adds to C1 — both on the same face (syn). No ionic intermediate. Gives the cis-alkenylborane.',
        shortLabel: 'Reactant',
      }),
      synAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'h_syn', symbol: 'H' },
        c2Orig: me2,
        c2New: { id: 'oh', symbol: 'OH' },
        description: 'Ketone (via cis-enol): H₂O₂/NaOH replaces C–B with C–OH (retention), giving the cis-enol, which tautomerizes to the ketone. Syn addition noted by wedge bonds.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',      energy: 45 },
      { label: 'TS (concerted)', energy: 62, isTransitionState: true },
      { label: 'Ketone',         energy: 22 },
    ],
  },

  // ── 6. Hydroboration of Terminal Alkyne (→ Aldehyde) ────────────────────────
  {
    id: 'hydroboration-alkyne-terminal',
    category: 'alkyne',
    name: 'Hydroboration of Terminal Alkynes',
    summary: 'Bulky Sia₂BH adds anti-Markovnikov to a terminal alkyne; oxidation gives an aldehyde.',
    reactants: 'Terminal alkyne + Sia₂BH; then H₂O₂/NaOH',
    products: 'Aldehyde (anti-Markovnikov)',
    conditions: 'Sia₂BH (disiamylborane) in THF; then H₂O₂, NaOH, H₂O',
    reactantSpecies: {
      text: 'Terminal alkyne + Sia₂BH; then H₂O₂/NaOH',
      species: [
        { smiles: '[R]C#C[H]', label: 'Terminal alkyne' },
        { smiles: 'B([H])([H])[H]', label: 'Sia₂BH' },
      ],
    },
    productSpecies: {
      text: 'Aldehyde (anti-Markovnikov)',
      species: [
        { smiles: '[R]CC=O', label: 'Aldehyde' },
      ],
    },
    conditionSpecies: {
      text: 'Sia₂BH (disiamylborane) in THF; then H₂O₂, NaOH, H₂O',
      species: [
        { smiles: 'B([H])([H])[H]', label: 'Sia₂BH', catalyst: true },
        { smiles: 'OO', label: 'H₂O₂' },
        { smiles: '[OH-]', label: 'NaOH' },
      ],
    },
    reactionType: 'addition',
    regiochemistry: 'anti-markovnikov',
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'Bulky boranes (Sia₂BH) prevent double addition to give the vinyl borane',
      'B adds to the terminal carbon (anti-Markovnikov) → after oxidation, the terminal C gets OH',
      'Terminal aldehyde forms after enol tautomerism of the terminal vinyl alcohol',
      'Complementary to Markovnikov hydration (gives methyl ketone instead)',
      'Key retrosynthesis: aldehyde from terminal alkyne via hydroboration',
    ],
    brownRef: 'Ch 7.8',
    relatedReactions: ['hydroboration-alkyne-internal', 'hydration-alkyne-markovnikov'],
    tags: ['addition', 'anti-Markovnikov', 'syn', 'hydroboration', 'aldehyde', 'terminal'],
    frames: [
      alkyneReactantFrame({
        c1Top: h_sub, c2Top: me,
        reagents: [{ id: 'b', symbol: 'Sia₂BH', x: 265, y: 75, role: 'electrophile' }],
        arrows: [{ from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'b' } }],
        description: 'Bulky Sia₂BH adds concertedly (syn). B bonds to the terminal C1 (anti-Markovnikov); H adds to C2. Oxidation (H₂O₂/NaOH) replaces C–B with C–OH → vinyl alcohol → aldehyde.',
        shortLabel: 'Reactant',
      }),
      {
        atoms: [
          { id: 'c1', symbol: 'C', x: 265, y: 175 },
          { id: 'c2', symbol: 'C', x: 435, y: 175 },
          { id: 'o',  symbol: 'O', x: 265, y: 80 },
          { id: 'h',  symbol: 'H', x: 215, y: 262 },
          { id: 'me', symbol: 'CH₃', x: 485, y: 88 },
          { id: 'h2', symbol: 'H', x: 485, y: 262 },
        ],
        bonds: [
          { id: 'c1-c2', from: 'c1', to: 'c2', order: 1 as const },
          { id: 'c1-o',  from: 'c1', to: 'o',  order: 2 as const },
          { id: 'c1-h',  from: 'c1', to: 'h',  order: 1 as const },
          { id: 'c2-me', from: 'c2', to: 'me', order: 1 as const },
          { id: 'c2-h2', from: 'c2', to: 'h2', order: 1 as const },
        ],
        arrows: [],
        description: 'Aldehyde (anti-Markovnikov): C=O on the terminal C1. The terminal vinyl alcohol tautomerizes to the aldehyde. This is the opposite regioselectivity from acid-catalyzed hydration (which gives a methyl ketone).',
        shortLabel: 'Aldehyde',
      },
    ],
    energyDiagram: [
      { label: 'Reactants',      energy: 45 },
      { label: 'TS (concerted)', energy: 60, isTransitionState: true },
      { label: 'Aldehyde',       energy: 20 },
    ],
  },

  // ── 7. Lindlar Reduction (syn → cis alkene) ──────────────────────────────────
  {
    id: 'lindlar-reduction-alkyne',
    category: 'alkyne',
    name: 'Lindlar Reduction',
    summary: 'H₂ with Lindlar catalyst (Pd/BaSO₄/quinoline) adds syn to an internal alkyne, giving the cis (Z) alkene.',
    reactants: 'Internal alkyne + H₂ (Lindlar catalyst)',
    products: 'Cis (Z) alkene',
    conditions: 'H₂ gas; Pd/BaSO₄ poisoned with quinoline (Lindlar catalyst); EtOAc',
    reactantSpecies: {
      text: 'Internal alkyne + H₂ (Lindlar catalyst)',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
        { smiles: '[H][H]', label: 'H₂' },
      ],
    },
    productSpecies: {
      text: 'Cis (Z) alkene',
      species: [
        { smiles: '[R]/C=C\\[R]', label: 'cis-Alkene (Z)' },
      ],
    },
    conditionSpecies: {
      text: 'H₂ gas; Pd/BaSO₄ poisoned with quinoline (Lindlar catalyst); EtOAc',
      species: [
        { smiles: '[Pd]', label: 'Lindlar Pd', catalyst: true },
        { smiles: '[H][H]', label: 'H₂' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'Lindlar catalyst is a "poisoned" Pd — stops reduction at the alkene stage',
      'Syn addition: both H atoms deliver from the same face → cis (Z) alkene',
      'Cannot use Pd/C (over-reduces to alkane)',
      'For trans (E) alkene from alkyne: use Na/NH₃ (dissolving metal, anti addition)',
      'Key in synthesis: alkyne → cis alkene cleanly with one reagent change',
    ],
    brownRef: 'Ch 7.4',
    relatedReactions: ['dissolving-metal-alkyne', 'hydrogenation-alkene'],
    tags: ['reduction', 'syn', 'cis', 'Z', 'Lindlar', 'Pd', 'alkene', 'selective'],
    frames: [
      alkyneReactantFrame({
        c1Top: me1, c2Top: me2,
        reagents: [
          { id: 'h2', symbol: 'H₂',  x: 350, y: 80 },
          { id: 'pd', symbol: 'Pd*', x: 350, y: 265 },
        ],
        arrows: [{ from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'h2' } }],
        description: 'H₂ adsorbs on the Lindlar Pd surface. Both H atoms are delivered from the same face (syn). The poisoned catalyst stops at the alkene — it cannot reduce the C=C further.',
        shortLabel: 'Reactant',
      }),
      synAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'h_a', symbol: 'H' },
        c2Orig: me2,
        c2New: { id: 'h_b', symbol: 'H' },
        description: 'Cis (Z) alkene: both H atoms on the same face (syn addition, wedge bonds). The double bond is preserved — Lindlar Pd stops at the alkene stage. Compare to Pd/C which gives the alkane.',
        shortLabel: 'cis-Alkene',
      }),
    ],
    energyDiagram: [
      { label: 'Alkyne + H₂',  energy: 60 },
      { label: 'TS (surface)', energy: 72, isTransitionState: true },
      { label: 'Cis-alkene',   energy: 30 },
    ],
  },

  // ── 8. Dissolving Metal Reduction (anti → trans alkene) ──────────────────────
  {
    id: 'dissolving-metal-alkyne',
    category: 'alkyne',
    name: 'Dissolving Metal Reduction',
    summary: 'Na/NH₃ reduces an internal alkyne via two sequential single-electron transfers, giving the trans (E) alkene.',
    reactants: 'Internal alkyne + Na (or Li) / liq. NH₃',
    products: 'Trans (E) alkene',
    conditions: 'Na metal in liquid NH₃ (−33 °C); add NH₄Cl to quench',
    reactantSpecies: {
      text: 'Internal alkyne + Na (or Li) / liq. NH₃',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
        { smiles: '[Na]', label: 'Na' },
      ],
    },
    productSpecies: {
      text: 'Trans (E) alkene',
      species: [
        { smiles: '[R]/C=C/[R]', label: 'trans-Alkene (E)' },
      ],
    },
    conditionSpecies: {
      text: 'Na metal in liquid NH₃ (−33 °C); add NH₄Cl to quench',
      species: [
        { smiles: '[Na]', label: 'Na' },
        { smiles: 'N', label: 'liq. NH₃' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: 'anti',
    intermediate: 'Vinyl radical anion',
    importantInfo: [
      'Anti reduction: two H atoms add from opposite faces → trans (E) alkene',
      'Mechanism: e⁻ from Na → radical anion → protonation → vinyl radical → e⁻ → carbanion → protonation',
      'NH₃ is the proton source (pKₐ ≈ 38, just acidic enough to protonate vinyl carbanion)',
      'Trans geometry arises because the vinyl radical prefers the trans conformation',
      'Complementary to Lindlar (syn, gives cis alkene)',
    ],
    brownRef: 'Ch 7.4',
    relatedReactions: ['lindlar-reduction-alkyne'],
    tags: ['reduction', 'anti', 'trans', 'E', 'Na/NH₃', 'dissolving metal', 'radical anion'],
    frames: [
      alkyneReactantFrame({
        c1Top: me1, c2Top: me2,
        reagents: [
          { id: 'na', symbol: 'Na•', x: 145, y: 175 },
        ],
        arrows: [
          { from: { kind: 'atom', id: 'na' }, to: { kind: 'bond', id: 'c1-c2' }, style: 'fishhook' },
        ],
        description: 'Na donates an electron to the alkyne π* orbital (single-electron transfer). A radical anion forms, then NH₃ protonates it to give a vinyl radical. A second electron transfer and protonation completes the trans reduction.',
        shortLabel: 'Reactant',
      }),
      antiAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'h_a', symbol: 'H' },
        c2Orig: me2,
        c2New: { id: 'h_b', symbol: 'H' },
        description: 'Trans (E) alkene: the two H atoms on opposite faces (anti addition — wedge and dash-wedge). The vinyl radical intermediate prefers the trans geometry, and trans-alkenes are thermodynamically more stable.',
        shortLabel: 'trans-Alkene',
      }),
    ],
    energyDiagram: [
      { label: 'Alkyne + Na',  energy: 58 },
      { label: 'Radical anion', energy: 50 },
      { label: 'Trans-alkene', energy: 22 },
    ],
  },

  // ── 9. Acetylide Alkylation ───────────────────────────────────────────────────
  {
    id: 'acetylide-alkylation',
    category: 'alkyne',
    name: 'Acetylide Alkylation',
    summary: 'NaNH₂ deprotonates a terminal alkyne to give an acetylide anion; SN2 reaction with R–X installs a new C–C bond.',
    reactants: 'Terminal alkyne + NaNH₂; then R–X (primary)',
    products: 'Internal alkyne (extended carbon chain)',
    conditions: 'NaNH₂ in liq. NH₃ or THF; then primary R–X; 0 °C to RT',
    reactantSpecies: {
      text: 'Terminal alkyne + NaNH₂; then R–X (primary)',
      species: [
        { smiles: '[R]C#C[H]', label: 'Terminal alkyne' },
        { smiles: '[R]Br', label: 'R–X (primary)' },
      ],
    },
    productSpecies: {
      text: 'Internal alkyne (extended carbon chain)',
      species: [
        { smiles: '[R]C#C[R]', label: 'Internal alkyne' },
      ],
    },
    conditionSpecies: {
      text: 'NaNH₂ in liq. NH₃ or THF; then primary R–X; 0 °C to RT',
      species: [
        { smiles: '[NH2-].[Na+]', label: 'NaNH₂', catalyst: true },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Acetylide anion (RC≡C⁻)',
    importantInfo: [
      'Terminal alkynes are unusually acidic (pKₐ ≈ 25) due to sp hybridization',
      'NaNH₂ (pKₐ of NH₃ ≈ 38) is strong enough to deprotonate the ≡C–H',
      'Acetylide is a powerful nucleophile AND carbon base',
      'ONLY primary R–X works (SN2) — secondary/tertiary R–X give elimination',
      'Net reaction: adds 2 carbons per cycle (C–C bond forming via SN2)',
    ],
    brownRef: 'Ch 7.9',
    relatedReactions: ['hydrohalogenation-alkyne', 'sn2'],
    tags: ['substitution', 'SN2', 'acetylide', 'C-C bond formation', 'carbanion', 'alkylation'],
    frames: [
      alkyneReactantFrame({
        c1Top: h_sub, c2Top: me,
        reagents: [{ id: 'base', symbol: 'NaNH₂', x: 145, y: 175, role: 'base' }],
        arrows: [
          { from: { kind: 'atom', id: 'base' }, to: { kind: 'atom', id: 'h_sub' } },
        ],
        description: 'NaNH₂ (strong base, pKₐ of NH₃ ≈ 38) deprotonates the terminal ≡C–H (pKₐ ≈ 25). The sp-hybridized anion (acetylide) is a strong carbon nucleophile.',
        shortLabel: 'Reactant',
      }),
      // Acetylide anion frame
      {
        atoms: [
          { id: 'c1', symbol: 'C', x: 265, y: 175, charge: '−', glow: true },
          { id: 'c2', symbol: 'C', x: 435, y: 175 },
          { id: 'me', symbol: 'CH₃', x: 485, y: 88 },
          { id: 'rx', symbol: 'R–X', x: 130, y: 175, role: 'electrophile' },
        ],
        bonds: [
          { id: 'c1-c2', from: 'c1', to: 'c2', order: 3 as const },
          { id: 'c2-me', from: 'c2', to: 'me', order: 1 as const },
        ],
        arrows: [
          { from: { kind: 'lonePair', atomId: 'c1', angleDeg: 180 }, to: { kind: 'atom', id: 'rx' } },
        ],
        description: 'Acetylide anion (RC≡C⁻): the negative charge on the sp-hybridized C1 makes it a strong nucleophile. It attacks the primary R–X in an SN2 reaction (backside attack, inversion at R).',
        shortLabel: 'Acetylide',
      },
      // Product frame: internal alkyne with new C-C bond
      {
        atoms: [
          { id: 'r_new', symbol: 'R', x: 140, y: 175 },
          { id: 'c1', symbol: 'C', x: 265, y: 175 },
          { id: 'c2', symbol: 'C', x: 435, y: 175 },
          { id: 'me', symbol: 'CH₃', x: 485, y: 88 },
        ],
        bonds: [
          { id: 'r-c1', from: 'r_new', to: 'c1', order: 1 as const },
          { id: 'c1-c2', from: 'c1', to: 'c2', order: 3 as const },
          { id: 'c2-me', from: 'c2', to: 'me', order: 1 as const },
        ],
        arrows: [],
        description: 'Internal alkyne: the new C–C bond joins R to the former terminal carbon (C1). This is a key strategy for extending carbon chains by 2 per alkyne unit.',
        shortLabel: 'Product',
      },
    ],
    energyDiagram: [
      { label: 'Terminal alkyne', energy: 55 },
      { label: 'Acetylide anion', energy: 45 },
      { label: 'TS (SN2)',        energy: 60, isTransitionState: true },
      { label: 'Internal alkyne', energy: 18 },
    ],
  },

]

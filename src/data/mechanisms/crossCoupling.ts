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

// ── Shared energy diagram (generic 3-step catalytic cycle) ────────────────────
const CATALYTIC_CYCLE_ENERGY = [
  { label: 'Pd(0) + ArX', energy: 0 },
  { label: 'TS₁ (OA)', energy: 18, isTransitionState: true },
  { label: 'Ar-Pd-X', energy: -5 },
  { label: 'TS₂ (TM)', energy: 12, isTransitionState: true },
  { label: 'Ar-Pd-R', energy: -8 },
  { label: 'TS₃ (RE)', energy: 5, isTransitionState: true },
  { label: 'Ar-R + Pd(0)', energy: -15 },
]

// ── Layout constants ──────────────────────────────────────────────────────────
// Three-frame layout: each frame shows the Pd complex at one stage of the cycle.
// Canvas: 700×320. Pd square-planar complex centered at (350, 160).
//   - Ar  at (210, 160) — left ligand (aryl from substrate ArX)
//   - X   at (490, 160) — right ligand (halide, frame 1 only)
//   - R   at (490, 160) — right ligand (coupling partner, frame 2 only)
//   - L1  at (350,  55) — phosphine ligand (top)
//   - L2  at (350, 265) — phosphine ligand (bottom)
// Frame 3 shows the product + regenerated Pd(0).

function oxAddFrame(arLabel: string, xLabel: string, desc: string) {
  return {
    atoms: [
      mk('pd',  'Pd(II)', 350, 160),
      mk('ar',  arLabel,   210, 160),
      mk('x',   xLabel,    490, 160),
      mk('l1',  'L',       350,  55),
      mk('l2',  'L',       350, 265),
    ],
    bonds: [
      bd('pd-ar', 'pd', 'ar'),
      bd('pd-x',  'pd', 'x'),
      bd('pd-l1', 'pd', 'l1'),
      bd('pd-l2', 'pd', 'l2'),
    ],
    arrows: [],
    shortLabel: 'Oxidative Addition',
    description: desc,
  }
}

function transmetalFrame(arLabel: string, rLabel: string, byproduct: string, desc: string) {
  return {
    atoms: [
      mk('pd',  'Pd(II)', 350, 160),
      mk('ar',  arLabel,   210, 160),
      mk('r',   rLabel,    490, 160, { glow: true }),
      mk('l1',  'L',       350,  55),
      mk('l2',  'L',       350, 265),
      mk('mx',  byproduct, 595,  85),
    ],
    bonds: [
      bd('pd-ar', 'pd', 'ar'),
      bd('pd-r',  'pd', 'r'),
      bd('pd-l1', 'pd', 'l1'),
      bd('pd-l2', 'pd', 'l2'),
    ],
    arrows: [],
    shortLabel: 'Transmetalation',
    description: desc,
  }
}

function redElimFrame(arLabel: string, rLabel: string, productLabel: string, desc: string) {
  return {
    atoms: [
      mk('pd0', 'Pd(0)', 530, 160),
      mk('l1',  'L',     530,  75),
      mk('l2',  'L',     530, 245),
      mk('ar',  arLabel,  140, 150, { glow: true }),
      mk('r',   rLabel,   265, 150, { glow: true }),
      mk('lbl', productLabel, 200, 245, { label: productLabel }),
    ],
    bonds: [
      bd('pd-l1', 'pd0', 'l1'),
      bd('pd-l2', 'pd0', 'l2'),
      bd('ar-r',  'ar',  'r'),
    ],
    arrows: [],
    shortLabel: 'Reductive Elimination',
    description: desc,
  }
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export const CROSS_COUPLING_REACTIONS: ReactionDef[] = [

  // 1. Suzuki Coupling
  {
    id: 'suzuki-coupling',
    category: 'organometallic',
    name: 'Suzuki Coupling',
    summary: 'Aryl/vinyl halide + arylboronic acid + Pd(0) + base → biaryl (or aryl-vinyl). The most widely used cross-coupling in industry. Boronic acids are stable, non-toxic, and easy to handle. Earned Suzuki the 2010 Nobel Prize.',
    reactants: 'Ar-X + Ar\'B(OH)₂ + base',
    products: 'Ar-Ar\' (biaryl)',
    conditions: 'Pd(PPh₃)₄ or Pd(OAc)₂/PPh₃; K₂CO₃ or Na₂CO₃; water/THF or EtOH; 60–80 °C',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Ar-Pd(II)-X (oxidative addition), then Ar-Pd(II)-Ar\' (transmetalation)',
    importantInfo: [
      'Base activates the boronic acid: Ar-B(OH)₂ + OH⁻ → Ar-B(OH)₃⁻, which transmetalates to Pd more readily',
      'Aryl iodides react fastest (Ar-I > Ar-Br ≫ Ar-Cl) in oxidative addition — stronger C-X bonds react slower',
      'Tolerates many functional groups: esters, nitriles, ketones, amides — compatible with aqueous conditions',
      'Forms aryl-aryl, aryl-vinyl, vinyl-vinyl, and aryl-alkyl bonds — extremely versatile',
      'Nobel Prize 2010: Heck, Negishi, and Suzuki shared the prize for Pd-catalyzed cross-couplings',
    ],
    brownRef: 'Ch 24.2',
    relatedReactions: ['heck-reaction', 'stille-coupling', 'negishi-coupling', 'sonogashira-coupling'],
    tags: ['Suzuki', 'cross-coupling', 'Pd', 'boronic acid', 'biaryl', 'Nobel', 'organometallic', 'C-C bond formation'],
    energyDiagram: CATALYTIC_CYCLE_ENERGY,
    frames: [
      oxAddFrame(
        'Ar',
        'X (Br/I)',
        'Oxidative Addition: Pd(0)L₂ inserts into the Ar–X bond. Pd is oxidized from Pd(0) to Pd(II). The square-planar Pd(II) complex (Ar-Pd-X) is the first intermediate. Aryl iodides react faster than bromides — weaker C–I bond is easier to insert into.',
      ),
      transmetalFrame(
        'Ar',
        'Ar\'',
        'B(OH)₃⁻',
        'Transmetalation (Suzuki): Base (K₂CO₃) deprotonates the boronic acid to give Ar\'B(OH)₃⁻, which transfers Ar\' to Pd while X is lost as BX(OH)₂. The Pd(II) complex now has two aryl ligands (Ar and Ar\') — ready for C–C bond formation.',
      ),
      redElimFrame(
        'Ar',
        'Ar\'',
        'Ar-Ar\'',
        'Reductive Elimination: The two aryl ligands couple, forming the biaryl Ar-Ar\' product. Pd is reduced back to Pd(0)L₂, regenerating the catalyst. This step is concerted — both C groups must be cis on Pd. The new C-C bond drives the reaction thermodynamically.',
      ),
    ],
  },

  // 2. Heck Reaction
  {
    id: 'heck-reaction',
    category: 'organometallic',
    name: 'Heck Reaction',
    summary: 'Aryl/vinyl halide + alkene + Pd(0) + base → substituted alkene. The H on one alkene carbon is replaced by the aryl group. Mechanism differs slightly: insertion then β-hydride elimination rather than transmetalation. Earned Heck the 2010 Nobel Prize.',
    reactants: 'Ar-X + H₂C=CHR + base',
    products: 'ArCH=CHR (new alkene)',
    conditions: 'Pd(OAc)₂/PPh₃ or Pd(PPh₃)₄; triethylamine or K₂CO₃; DMF or toluene; 80–120 °C',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: 'Ar-Pd-X (OA), then syn-carbopalladation product (Pd–C σ-complex)',
    importantInfo: [
      'Key mechanistic difference from Suzuki/Stille: instead of transmetalation, the alkene inserts into Ar-Pd-X ("carbopalladation"), then β-hydride elimination gives the product',
      'Net reaction: Ar-X + H₂C=CH-R → Ar-CH=CH-R + HX (base neutralizes HX)',
      'Regioselectivity: aryl group usually ends up at the less hindered end of the alkene (anti-Markovnikov-like)',
      'Stereoselective: produces mainly E-alkene (trans) from syn carbopalladation then rotation before syn elimination',
      'No organometallic reagent is needed — the alkene itself is the coupling partner',
    ],
    brownRef: 'Ch 24.4',
    relatedReactions: ['suzuki-coupling', 'stille-coupling', 'negishi-coupling', 'sonogashira-coupling'],
    tags: ['Heck', 'cross-coupling', 'Pd', 'alkene', 'vinyl', 'Nobel', 'organometallic', 'C-C bond'],
    energyDiagram: CATALYTIC_CYCLE_ENERGY,
    frames: [
      oxAddFrame(
        'Ar',
        'X (Br)',
        'Oxidative Addition: Pd(0)L₂ inserts into the Ar–X bond → Ar-Pd(II)-X. Same first step as all Pd cross-couplings. Then one L dissociates to give a 3-coordinate Pd complex, which coordinates the alkene.',
      ),
      {
        atoms: [
          mk('pd',  'Pd(II)',     350, 160),
          mk('ar',  'Ar',         210, 160),
          mk('x',   'X (Br)',     490, 160),
          mk('c1',  'CH₂',        350,  55),
          mk('c2',  'CH-R',       490,  55, { glow: true }),
        ],
        bonds: [
          bd('pd-ar', 'pd', 'ar'),
          bd('pd-x',  'pd', 'x'),
          bd('pd-c1', 'pd', 'c1'),
          bd('c1-c2', 'c1', 'c2', 2),
        ],
        arrows: [],
        shortLabel: 'Syn Carbopalladation',
        description: 'Alkene Insertion (syn carbopalladation): The alkene coordinates to Pd and inserts into the Ar-Pd bond (syn addition — Ar and Pd add to the same face). A new Pd-C σ-bond forms. This step is unique to the Heck reaction; it replaces transmetalation.',
      },
      {
        atoms: [
          mk('pd0', 'Pd(0)',    530, 160),
          mk('l1',  'L',        530,  75),
          mk('l2',  'L',        530, 245),
          mk('ar',  'Ar',       130, 155, { glow: true }),
          mk('c1',  'CH',       255, 155),
          mk('c2',  'CH-R',     380, 155, { glow: true }),
        ],
        bonds: [
          bd('pd-l1', 'pd0', 'l1'),
          bd('pd-l2', 'pd0', 'l2'),
          bd('ar-c1', 'ar', 'c1', 2),
          bd('c1-c2', 'c1', 'c2'),
        ],
        arrows: [],
        shortLabel: 'β-Hydride Elimination',
        description: 'β-Hydride Elimination: Pd removes a β-H from the adjacent carbon (syn elimination), regenerating the C=C double bond in the product Ar-CH=CH-R and giving Pd(II)-H-X. Base (Et₃N) neutralizes HX, regenerating Pd(0). The new alkene is predominantly E (trans).',
      },
    ],
  },

  // 3. Stille Coupling
  {
    id: 'stille-coupling',
    category: 'organometallic',
    name: 'Stille Coupling',
    summary: 'Aryl/vinyl halide + organostannane (R-SnR\'₃) + Pd(0) → coupled product. Tolerates many functional groups. DOWNSIDE: organotin reagents are TOXIC (tin is hazardous waste). Largely replaced by Suzuki in industry for non-specialty applications.',
    reactants: 'Ar-X + R-Sn(Bu)₃',
    products: 'Ar-R',
    conditions: 'Pd(PPh₃)₄ or Pd₂(dba)₃; DMF or THF; 60–100 °C; anhydrous',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Ar-Pd(II)-X (OA), then Ar-Pd(II)-R (TM via tin)',
    importantInfo: [
      'Transmetalation: R transfers from Sn to Pd with X going to Sn → XSn(Bu)₃ byproduct (tin waste — toxic)',
      'Can couple aryl, vinyl, allyl, and alkyl groups — versatile R group scope',
      'Functional group tolerance is excellent: works with esters, aldehydes, nitriles, ketones',
      'Does NOT require base (unlike Suzuki) — useful for base-sensitive substrates',
      'Organotin reagents are stable, easy to make, but the tin byproduct is toxic → Suzuki preferred when possible',
    ],
    brownRef: 'Ch 24.3',
    relatedReactions: ['suzuki-coupling', 'heck-reaction', 'negishi-coupling', 'sonogashira-coupling'],
    tags: ['Stille', 'cross-coupling', 'Pd', 'organotin', 'stannane', 'C-C bond', 'organometallic'],
    energyDiagram: CATALYTIC_CYCLE_ENERGY,
    frames: [
      oxAddFrame(
        'Ar',
        'X (Br/I)',
        'Oxidative Addition: Same first step — Pd(0)L₂ inserts into Ar–X. Stille coupling is fastest with Ar-I (weaker C–I bond). Aryl chlorides are rarely used without special ligands.',
      ),
      transmetalFrame(
        'Ar',
        'R',
        'XSn(Bu)₃',
        'Transmetalation (Stille): R group migrates from Sn to Pd. X is transferred to Sn, forming XSn(Bu)₃ (tin halide — the toxic byproduct). Unlike Suzuki, no base is needed for transmetalation. The Pd complex now bears both Ar and R, ready for C-C coupling.',
      ),
      redElimFrame(
        'Ar',
        'R',
        'Ar-R',
        'Reductive Elimination: Ar and R couple, releasing Ar-R and regenerating Pd(0)L₂. The mechanism is identical to other Pd cross-couplings at this step. The tin waste XSn(Bu)₃ must be handled and disposed of as hazardous material.',
      ),
    ],
  },

  // 4. Negishi Coupling
  {
    id: 'negishi-coupling',
    category: 'organometallic',
    name: 'Negishi Coupling',
    summary: 'Aryl halide + organozinc reagent (R-ZnX) + Pd(0) → coupled product. Organozincs are highly reactive and tolerate many functional groups. Requires strictly anhydrous conditions. Earned Negishi the 2010 Nobel Prize.',
    reactants: 'Ar-X + R-ZnX\'',
    products: 'Ar-R',
    conditions: 'Pd(PPh₃)₄ or Pd-PEPPSI; THF or DMF; 0 °C to rt; strictly anhydrous',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Ar-Pd(II)-X (OA), then Ar-Pd(II)-R (TM via zinc)',
    importantInfo: [
      'Organozinc reagents (RZnX) are made from organolithiums or Grignard reagents + ZnX₂ (transmetalation to zinc)',
      'Zinc is less electropositive than Mg or Li → organozincs are less basic, tolerate more functional groups than Grignard',
      'Tolerates: esters, nitriles, halides, but NOT protic solvents — must be rigorously anhydrous',
      'Excellent alkyl group transfer (primary alkyl) with minimal β-hydride elimination — advantage over Heck',
      'Nobel Prize 2010: shared with Heck and Suzuki',
    ],
    brownRef: 'Ch 24.3',
    relatedReactions: ['suzuki-coupling', 'heck-reaction', 'stille-coupling', 'sonogashira-coupling'],
    tags: ['Negishi', 'cross-coupling', 'Pd', 'organozinc', 'Nobel', 'C-C bond', 'organometallic'],
    energyDiagram: CATALYTIC_CYCLE_ENERGY,
    frames: [
      oxAddFrame(
        'Ar',
        'X (Br/I)',
        'Oxidative Addition: Pd(0)L₂ inserts into Ar–X → Ar-Pd(II)-X. Strict exclusion of moisture is critical from this step onward — organozinc reagents react immediately with water.',
      ),
      transmetalFrame(
        'Ar',
        'R',
        'ZnX₂',
        'Transmetalation (Negishi): R migrates from zinc to Pd; X transfers to Zn → ZnX₂ byproduct (non-toxic, unlike tin). Organozincs are less reactive than Grignard reagents but sufficiently reactive for Pd-mediated coupling. The resulting Ar-Pd-R is ready for reductive elimination.',
      ),
      redElimFrame(
        'Ar',
        'R',
        'Ar-R',
        'Reductive Elimination: Identical to other Pd couplings — Ar and R couple, Pd(0) regenerated. ZnX₂ byproduct is non-toxic (distinguishing advantage over Stille). Anhydrous workup preserves the organozinc if unused.',
      ),
    ],
  },

  // 5. Sonogashira Coupling
  {
    id: 'sonogashira-coupling',
    category: 'organometallic',
    name: 'Sonogashira Coupling',
    summary: 'Aryl/vinyl halide + terminal alkyne (RC≡CH) + Pd(0) + Cu(I) + amine base → aryl-alkyne. Cu(I) activates the alkyne by forming a copper acetylide that transmetalates to Pd. Used to make conjugated alkynes for materials science.',
    reactants: 'Ar-X + RC≡CH + base',
    products: 'Ar-C≡C-R (aryl alkyne)',
    conditions: 'Pd(PPh₃)₂Cl₂ / CuI; amine base (Et₃N, piperidine); DMF, THF, or degassed solvent; rt to 60 °C',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Cu-acetylide (RC≡C-Cu) is the transmetalating agent; Ar-Pd-X (OA)',
    importantInfo: [
      'Dual catalysis: Pd(0) performs OA + RE; Cu(I) activates the terminal alkyne (cocatalyst)',
      'Cu cycle: RC≡CH + Cu(I) → RC≡C-Cu (copper acetylide) — the terminal C-H is acidic enough (pKa ~25) for deprotonation by the amine base',
      'Copper acetylide then transmetalates with Ar-Pd(II)-X to give Ar-Pd(II)-C≡CR → reductive elimination',
      'Must use TERMINAL alkynes (RC≡CH); internal alkynes do not work — requires the C-H for Cu activation',
      'Applications: synthesis of arylalkynes, conjugated polymers for OLEDs, molecular wires, natural product synthesis',
    ],
    brownRef: 'Ch 24.5',
    relatedReactions: ['suzuki-coupling', 'heck-reaction', 'stille-coupling', 'negishi-coupling'],
    tags: ['Sonogashira', 'cross-coupling', 'Pd', 'Cu', 'alkyne', 'terminal alkyne', 'C-C bond', 'organometallic'],
    energyDiagram: CATALYTIC_CYCLE_ENERGY,
    frames: [
      {
        atoms: [
          mk('pd',  'Pd(II)',  350, 160),
          mk('ar',  'Ar',      210, 160),
          mk('x',   'X',       490, 160),
          mk('l1',  'L',       350,  55),
          mk('l2',  'L',       350, 265),
          mk('cu',  'Cu(I)',   590,  80),
          mk('c1',  'RC≡C-',  540, 130, { glow: true }),
        ],
        bonds: [
          bd('pd-ar', 'pd', 'ar'),
          bd('pd-x',  'pd', 'x'),
          bd('pd-l1', 'pd', 'l1'),
          bd('pd-l2', 'pd', 'l2'),
          bd('cu-c1', 'cu', 'c1'),
        ],
        arrows: [],
        shortLabel: 'OA + Cu Activation',
        description: 'Step 1 — Dual activation: Pd(0)L₂ undergoes oxidative addition with Ar-X → Ar-Pd(II)-X. Simultaneously, Cu(I) deprotonates the terminal alkyne (aided by amine base) → copper acetylide RC≡C-Cu. The amine base also neutralizes the HX generated.',
      },
      transmetalFrame(
        'Ar',
        'C≡C-R',
        'Cu-X',
        'Transmetalation (Sonogashira): The copper acetylide RC≡C-Cu transmetalates with Ar-Pd(II)-X. X goes to Cu (forming CuX, which is re-reduced by base to Cu(I) to close the Cu cycle), and the alkynyl group transfers to Pd. Ar-Pd(II)-C≡CR is formed — same geometry as other cross-couplings at this stage.',
      ),
      redElimFrame(
        'Ar',
        'C≡C-R',
        'Ar-C≡C-R',
        'Reductive Elimination: Ar and C≡C-R couple → arylalkyne Ar-C≡C-R, with Pd(0) regenerated. The sp carbon of the alkyne is an excellent coupling partner because sp-hybridized C is more electronegative and the alkynyl group bonds strongly to Pd. The product is a rigid, conjugated arylalkyne used in OLEDs and molecular electronics.',
      ),
    ],
  },
]

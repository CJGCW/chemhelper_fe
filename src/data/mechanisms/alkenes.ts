import type { ReactionDef } from './types'
import {
  alkeneReactantFrame,
  bromoniumLikeFrame,
  carbocationFrame,
  additionProductFrame,
  synAdditionProductFrame,
  antiAdditionProductFrame,
  type SubInfo,
} from './frameTemplates'

// 2-methylpropene substrate: c1 (more substituted) has two CH₃ groups; c2 (less substituted) is =CH₂
const me1: SubInfo = { id: 'me1', symbol: 'CH₃', role: 'r_group' }
const me2: SubInfo = { id: 'me2', symbol: 'CH₃', role: 'r_group' }

export const ALKENE_REACTIONS: ReactionDef[] = [

  // ── 1. Acid-Catalyzed Hydration ───────────────────────────────────────────────
  {
    id: 'hydration-alkene',
    category: 'alkene',
    name: 'Acid-Catalyzed Hydration',
    summary: 'H₂O adds across the alkene in the Markovnikov sense via a carbocation intermediate.',
    reactants: 'Alkene + H₂O (H₃O⁺ cat.)',
    products: 'Markovnikov alcohol',
    conditions: 'Dilute H₂SO₄ or H₃PO₄; aqueous solution; room temperature',
    reactionType: 'addition',
    regiochemistry: 'markovnikov',
    stereochemistry: null,
    intermediate: 'Carbocation',
    importantInfo: [
      'Markovnikov: OH adds to the MORE substituted carbon',
      'Via tertiary carbocation — rearrangements (hydride/alkyl shifts) are possible',
      'Reverse of acid-catalyzed dehydration; equilibrium favors alcohol at low T',
      'Rate = k[alkene][H⁺]; acid is a catalyst (regenerated in step 3)',
      'Complementary to hydroboration-oxidation (anti-Markovnikov, no rearrangement)',
    ],
    brownRef: 'Ch 6.4, pp. 227–232',
    relatedReactions: ['hydroboration-alkene', 'oxymercuration', 'alcohol-addition-alkene', 'sn1'],
    tags: ['addition', 'Markovnikov', 'carbocation', 'rearrangement', 'reversible', 'hydration', 'alcohol'],
    rearrangementPossible: true,
    reversible: true,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'h_acid', symbol: 'H⁺', x: 435, y: 75, role: 'electrophile' },
          { id: 'nu', symbol: 'H₂O', x: 265, y: 275, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'h_acid' } },
        ],
        description: 'π electrons attack H⁺ (acid catalyst). By Markovnikov\'s rule, H bonds to C2 (less substituted), so the positive charge lands on the more stable tertiary C1.',
        shortLabel: 'Reactant',
      }),
      carbocationFrame({
        cationOn: 1,
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'nu', symbol: 'H₂O', x: 265, y: 275, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'lonePair', atomId: 'nu', angleDeg: 315 }, to: { kind: 'atom', id: 'c1' }, bow: 1 },
        ],
        description: 'Tertiary carbocation at C1 — stabilized by three alkyl groups. Water attacks C1 with a lone pair (nucleophilic addition). Rearrangements (hydride/alkyl shifts) are possible here.',
        shortLabel: 'Carbocation',
      }),
      additionProductFrame({
        c1Top: me1,
        c1Bottom: { id: 'oh', symbol: 'OH' },
        description: 'Markovnikov alcohol: OH on the more substituted C1 (tert-butanol). Deprotonation of the oxonium oxygen regenerates H⁺ (the catalyst).',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 40 },
      { label: 'TS₁',         energy: 92, isTransitionState: true },
      { label: 'Carbocation', energy: 70 },
      { label: 'TS₂',         energy: 78, isTransitionState: true },
      { label: 'Products',    energy: 28 },
    ],
  },

  // ── 2. Acid-Catalyzed Alcohol Addition ────────────────────────────────────────
  {
    id: 'alcohol-addition-alkene',
    category: 'alkene',
    name: 'Acid-Catalyzed Alcohol Addition',
    summary: 'ROH adds across the alkene via a carbocation to give a Markovnikov ether.',
    reactants: 'Alkene + ROH (H⁺ cat.)',
    products: 'Markovnikov ether',
    conditions: 'Dilute H₂SO₄ or TsOH; alcohol as solvent; excess ROH drives equilibrium',
    reactionType: 'addition',
    regiochemistry: 'markovnikov',
    stereochemistry: null,
    intermediate: 'Carbocation',
    importantInfo: [
      'Same mechanism as acid-catalyzed hydration — replace H₂O with ROH',
      'Markovnikov: OR adds to the MORE substituted carbon',
      'Rearrangements possible via the carbocation intermediate',
      'Equilibrium: excess alcohol and low temperature favor ether product',
      'Contrast with Williamson synthesis (SN2, no carbocation, no rearrangement)',
    ],
    brownRef: 'Ch 6.4, pp. 232–235',
    relatedReactions: ['hydration-alkene', 'williamson-ether', 'sn1'],
    tags: ['addition', 'Markovnikov', 'carbocation', 'ether', 'rearrangement', 'reversible'],
    rearrangementPossible: true,
    reversible: true,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'h_acid', symbol: 'H⁺', x: 435, y: 75, role: 'electrophile' },
          { id: 'nu', symbol: 'ROH', x: 265, y: 275, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'h_acid' } },
        ],
        description: 'π electrons attack H⁺. H bonds to C2, placing the tertiary carbocation on C1 (Markovnikov). ROH stands by as the nucleophile.',
        shortLabel: 'Reactant',
      }),
      carbocationFrame({
        cationOn: 1,
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'nu', symbol: 'ROH', x: 265, y: 275, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'lonePair', atomId: 'nu', angleDeg: 315 }, to: { kind: 'atom', id: 'c1' }, bow: 1 },
        ],
        description: 'Tertiary carbocation at C1. ROH attacks with an oxygen lone pair, forming an oxonium ion. Rearrangements (hydride/alkyl shifts) are possible here.',
        shortLabel: 'Carbocation',
      }),
      additionProductFrame({
        c1Top: me1,
        c1Bottom: { id: 'or', symbol: 'OR' },
        description: 'Markovnikov ether: OR on the more substituted C1. Deprotonation of the oxonium oxygen by solvent gives the neutral ether and regenerates H⁺.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 42 },
      { label: 'TS₁',         energy: 90, isTransitionState: true },
      { label: 'Carbocation', energy: 68 },
      { label: 'TS₂',         energy: 76, isTransitionState: true },
      { label: 'Products',    energy: 30 },
    ],
  },

  // ── 3. Hydrohalogenation ──────────────────────────────────────────────────────
  {
    id: 'hydrohalogenation-alkene',
    category: 'alkene',
    name: 'Hydrohalogenation',
    summary: 'HX adds across the alkene; H to less substituted C, X to more substituted C (Markovnikov).',
    reactants: 'Alkene + HBr (or HCl, HI)',
    products: 'Markovnikov alkyl halide',
    conditions: 'Anhydrous HX gas or HX in acetic acid; no peroxides (for Markovnikov)',
    reactionType: 'addition',
    regiochemistry: 'markovnikov',
    stereochemistry: null,
    intermediate: 'Carbocation',
    importantInfo: [
      'Markovnikov: X goes to the MORE substituted carbon',
      'Via carbocation — rearrangements possible',
      'Reactivity of HX: HI > HBr > HCl (matches carbocation stability)',
      'With peroxides + HBr ONLY → anti-Markovnikov radical mechanism',
      'HCl and HI do NOT undergo radical addition (radical intermediates too unstable or reactive)',
    ],
    brownRef: 'Ch 6.3, pp. 222–227',
    relatedReactions: ['hydration-alkene', 'anti-mark-hbr', 'sn1'],
    tags: ['addition', 'Markovnikov', 'carbocation', 'alkyl halide', 'hydrohalogenation', 'HBr'],
    rearrangementPossible: true,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'hbr', symbol: 'HBr', x: 350, y: 75, role: 'electrophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'hbr' } },
        ],
        description: 'π electrons attack the H of HBr. H bonds to C2 (less substituted), placing the tertiary carbocation on C1. Br⁻ departs as the nucleophile for the next step.',
        shortLabel: 'Reactant',
      }),
      carbocationFrame({
        cationOn: 1,
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'br', symbol: 'Br⁻', x: 265, y: 275, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'lonePair', atomId: 'br', angleDeg: 315 }, to: { kind: 'atom', id: 'c1' }, bow: 1 },
        ],
        description: 'Tertiary carbocation at C1. Br⁻ (just dissociated from HBr) attacks C1 from below with a lone pair. Rearrangements are possible here.',
        shortLabel: 'Carbocation',
      }),
      additionProductFrame({
        c1Top: me1,
        c1Bottom: { id: 'br', symbol: 'Br' },
        description: 'Markovnikov alkyl bromide: Br on the more substituted C1. H is on C2 (the less substituted carbon). Product is 2-bromo-2-methylpropane.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 42 },
      { label: 'TS₁',         energy: 90, isTransitionState: true },
      { label: 'Carbocation', energy: 68 },
      { label: 'TS₂',         energy: 76, isTransitionState: true },
      { label: 'Products',    energy: 22 },
    ],
  },

  // ── 4. Halogenation ───────────────────────────────────────────────────────────
  {
    id: 'halogenation-alkene',
    category: 'alkene',
    name: 'Halogenation of Alkenes',
    summary: 'X₂ adds across the alkene via a cyclic halonium ion; gives anti (trans) addition.',
    reactants: 'Alkene + Br₂ (or Cl₂)',
    products: 'Anti-dihalide',
    conditions: 'Br₂ or Cl₂ in CH₂Cl₂; no light or heat; CCl₄ or inert solvent preferred',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: 'anti',
    intermediate: 'Halonium ion',
    importantInfo: [
      'Anti addition via cyclic halonium ion — both faces blocked by bridging halogen',
      'Solvent determines the 2nd nucleophile: CH₂Cl₂ → dihalide; H₂O → halohydrin; ROH → haloether',
      'Br₂ decolorization (reddish-brown → clear) is a classic test for alkene unsaturation',
      'Cl₂ reacts similarly; F₂ too reactive; I₂ too slow (reversible) for most alkenes',
      'No rearrangements — no free carbocation is ever formed',
    ],
    brownRef: 'Ch 6.7, pp. 243–250',
    relatedReactions: ['oxymercuration', 'hydration-alkene', 'acid-epoxide-opening'],
    tags: ['addition', 'anti', 'halonium', 'halogenation', 'bromine', 'trans', 'cyclic intermediate'],
    rearrangementPossible: false,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'br2', symbol: 'Br₂', x: 350, y: 70, role: 'electrophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'br2' } },
        ],
        description: 'π electrons attack one Br of Br₂. The Br–Br bond breaks homolytically: one Br forms a cyclic bromonium ion bridging both carbons, while the other departs as Br⁻.',
        shortLabel: 'Reactant',
      }),
      bromoniumLikeFrame({
        bridgeId: 'br1', bridgeSymbol: 'Br', bridgeCharge: '+',
        c1Top: me1, c1Bottom: me2,
        attacker: { id: 'br2', symbol: 'Br⁻', x: 512, y: 290, charge: '−', role: 'nucleophile' },
        arrows: [
          { from: { kind: 'lonePair', atomId: 'br2', angleDeg: 225 }, to: { kind: 'atom', id: 'c2' }, bow: 1 },
        ],
        description: 'Cyclic bromonium ion completely blocks the top face. Br⁻ can only attack from the bottom face (backside, SN2-like), at the less hindered C2.',
        shortLabel: 'Bromonium⁺',
      }),
      antiAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'br1', symbol: 'Br' },
        c2New: { id: 'br2', symbol: 'Br' },
        description: 'Anti-dihalide: the two Br atoms are on opposite faces (anti addition). Wedge = Br above the plane on C1; dash-wedge = Br below on C2.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Alkene + Br₂', energy: 45 },
      { label: 'Bromonium⁺',   energy: 60 },
      { label: 'Anti-Product', energy: 25 },
    ],
  },

  // ── 5. Oxymercuration-Demercuration ──────────────────────────────────────────
  {
    id: 'oxymercuration',
    category: 'alkene',
    name: 'Oxymercuration-Demercuration',
    summary: 'Hg(OAc)₂ then NaBH₄ gives Markovnikov alcohol without carbocation rearrangement.',
    reactants: 'Alkene + Hg(OAc)₂ / H₂O; then NaBH₄',
    products: 'Markovnikov alcohol (anti addition)',
    conditions: 'Step 1: Hg(OAc)₂ in THF/H₂O; Step 2: NaBH₄ in NaOH',
    reactionType: 'addition',
    regiochemistry: 'markovnikov',
    stereochemistry: null,
    intermediate: 'Cyclic mercurinium ion',
    importantInfo: [
      'Markovnikov WITHOUT rearrangement — no free carbocation is formed',
      'Preferred over acid hydration when skeletal rearrangement must be prevented',
      'Mercurinium ion (like halonium) blocks one face → mostly anti addition',
      'NaBH₄ step (demercuration): replaces Hg with H, retaining the Markovnikov OH',
      'Overall: H₂O adds Markovnikov; net same result as acid hydration but rearrangement-free',
    ],
    brownRef: 'Ch 6.5, pp. 232–236',
    relatedReactions: ['hydration-alkene', 'hydroboration-alkene', 'halogenation-alkene'],
    tags: ['addition', 'Markovnikov', 'mercurinium', 'no rearrangement', 'oxymercuration', 'alcohol'],
    rearrangementPossible: false,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'hg', symbol: 'Hg²⁺', x: 350, y: 70, role: 'electrophile' },
          { id: 'nu', symbol: 'H₂O', x: 512, y: 290, role: 'nucleophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'hg' } },
        ],
        description: 'π electrons attack Hg²⁺ of Hg(OAc)₂. A cyclic mercurinium ion bridges both carbons; OAc⁻ departs. No free carbocation → no rearrangements.',
        shortLabel: 'Reactant',
      }),
      bromoniumLikeFrame({
        bridgeId: 'hg', bridgeSymbol: 'Hg', bridgeCharge: '+',
        c1Top: me1, c1Bottom: me2,
        attacker: { id: 'nu', symbol: 'H₂O', x: 512, y: 290, role: 'nucleophile' },
        arrows: [
          { from: { kind: 'lonePair', atomId: 'nu', angleDeg: 225 }, to: { kind: 'atom', id: 'c2' }, bow: 1 },
        ],
        description: 'Cyclic mercurinium ion. H₂O attacks the more electrophilic C — typically the more substituted carbon — from the anti face (Markovnikov, no rearrangement).',
        shortLabel: 'Mercurinium⁺',
      }),
      additionProductFrame({
        c1Top: me1,
        c1Bottom: { id: 'oh', symbol: 'OH' },
        description: 'Markovnikov alcohol after NaBH₄ demercuration (Hg → H). OH is on the more substituted C1, same regiochemistry as acid hydration but without rearrangement risk.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',    energy: 42 },
      { label: 'TS₁',          energy: 65, isTransitionState: true },
      { label: 'Mercurinium⁺', energy: 55 },
      { label: 'TS₂',          energy: 68, isTransitionState: true },
      { label: 'Products',     energy: 20 },
    ],
  },

  // ── 6. Hydroboration-Oxidation ────────────────────────────────────────────────
  {
    id: 'hydroboration-alkene',
    category: 'alkene',
    name: 'Hydroboration-Oxidation',
    summary: 'BH₃ adds syn across the alkene (anti-Markovnikov, no rearrangement); H₂O₂/NaOH then replaces B with OH.',
    reactants: 'Alkene + BH₃ (in THF); then H₂O₂ / NaOH',
    products: 'Anti-Markovnikov alcohol (syn addition)',
    conditions: 'Step 1: BH₃·THF at 0 °C; Step 2: H₂O₂, NaOH, H₂O',
    reactionType: 'addition',
    regiochemistry: 'anti-markovnikov',
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'Anti-Markovnikov: OH ends up on the LESS substituted carbon',
      'Syn addition: B and H add to the same face (cis) in a concerted 4-center TS',
      'No rearrangement — no ionic intermediates',
      'Complementary to acid hydration / oxymercuration (which both give Markovnikov)',
      'H₂O₂/NaOH oxidation (step 2) replaces C–B with C–OH with retention of configuration',
    ],
    brownRef: 'Ch 6.6, pp. 236–243',
    relatedReactions: ['hydration-alkene', 'oxymercuration', 'hydrogenation-alkene'],
    tags: ['addition', 'anti-Markovnikov', 'syn', 'concerted', 'hydroboration', 'alcohol', 'no rearrangement'],
    rearrangementPossible: false,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'bh3', symbol: 'BH₃', x: 350, y: 80, role: 'electrophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'bh3' } },
        ],
        description: 'BH₃ approaches from above. In a concerted 4-center transition state, B bonds to C2 (less substituted) while H simultaneously delivers to C1 — both from the SAME face (syn). No ionic intermediate.',
        shortLabel: 'Reactant',
      }),
      synAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'h_a', symbol: 'H' },
        c2New: { id: 'oh', symbol: 'OH' },
        description: 'Anti-Markovnikov alcohol (syn): H and OH on the same face. After concerted hydroboration, H₂O₂/NaOH replaces C–B with C–OH with retention of configuration. OH is on C2 (the less substituted C).',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',     energy: 40 },
      { label: 'TS (concerted)', energy: 65, isTransitionState: true },
      { label: 'Products',      energy: 22 },
    ],
  },

  // ── 7. Epoxidation ────────────────────────────────────────────────────────────
  {
    id: 'epoxidation-alkene',
    category: 'alkene',
    name: 'Epoxidation',
    summary: 'mCPBA delivers an oxygen atom to the alkene in a concerted syn addition, forming a 3-membered epoxide ring.',
    reactants: 'Alkene + mCPBA (or RCO₃H)',
    products: 'Epoxide (oxirane)',
    conditions: 'mCPBA in CH₂Cl₂; 0 °C to RT; or m-chloroperoxybenzoic acid',
    reactionType: 'addition',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'Concerted "butterfly" transition state — single step, both C–O bonds form simultaneously',
      'Syn addition: the O atom adds to the same face as the peracid approach',
      'More substituted (more electron-rich) alkenes react faster with peracids',
      '3-membered oxirane ring has ~114 kJ/mol ring strain — makes epoxides excellent electrophiles',
      'Product is a versatile synthon: opened by nucleophiles under acid or base conditions',
    ],
    brownRef: 'Ch 6.9, pp. 254–258',
    relatedReactions: ['acid-epoxide-opening', 'base-epoxide-opening', 'halogenation-alkene'],
    tags: ['addition', 'syn', 'epoxide', 'mCPBA', 'peracid', 'concerted', 'oxirane'],
    rearrangementPossible: false,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'mcpba', symbol: 'mCPBA', x: 350, y: 70, role: 'electrophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'mcpba' } },
        ],
        description: 'mCPBA delivers its electrophilic O in a concerted "butterfly" transition state. Both C–O bonds form simultaneously as the O–O bond breaks. Syn face delivery creates the epoxide.',
        shortLabel: 'Reactant',
      }),
      // Epoxide product: O bridges both C1 and C2 (syn, wedge bonds to both)
      {
        atoms: [
          { id: 'c1', symbol: 'C', x: 265, y: 175 },
          { id: 'c2', symbol: 'C', x: 435, y: 175 },
          { id: 'o_bridge', symbol: 'O', x: 350, y: 110, glow: false },
          { id: 'me1', symbol: 'CH₃', x: 215, y: 262 },
          { id: 'me2', symbol: 'CH₃', x: 215, y: 88 },
        ],
        bonds: [
          { id: 'c1-c2', from: 'c1', to: 'c2', order: 1 },
          { id: 'c1-o', from: 'c1', to: 'o_bridge', order: 1, style: 'wedge' as const },
          { id: 'c2-o', from: 'c2', to: 'o_bridge', order: 1, style: 'wedge' as const },
          { id: 'c1-me1', from: 'c1', to: 'me1', order: 1 },
          { id: 'c1-me2', from: 'c1', to: 'me2', order: 1 },
        ],
        arrows: [],
        description: 'Epoxide (oxirane): the O bridges both carbons from the same face (syn). The strained 3-membered ring is a highly reactive electrophile, opened readily by nucleophiles.',
        shortLabel: 'Epoxide',
      },
    ],
    energyDiagram: [
      { label: 'Reactants',      energy: 42 },
      { label: 'TS (concerted)', energy: 58, isTransitionState: true },
      { label: 'Epoxide',        energy: 30 },
    ],
  },

  // ── 8. Catalytic Hydrogenation ────────────────────────────────────────────────
  {
    id: 'hydrogenation-alkene',
    category: 'alkene',
    name: 'Catalytic Hydrogenation',
    summary: 'H₂ adds syn across the alkene on a Pd/Pt/Ni surface, converting the alkene to an alkane.',
    reactants: 'Alkene + H₂ (Pt/Pd/Ni catalyst)',
    products: 'Alkane (syn addition product)',
    conditions: 'H₂ gas at 1–4 atm; Pd/C, PtO₂, or Raney Ni; EtOH or EtOAc solvent',
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'Syn addition: both H atoms deliver to the same face of the alkene',
      'Reaction occurs on the metal surface (heterogeneous catalysis)',
      'H₂ dissociates into 2 H atoms chemisorbed on the surface; alkene adsorbs nearby',
      'Heats of hydrogenation (ΔH°hydr) measure relative alkene stability — more sub. = lower |ΔH°|',
      'Cannot reduce isolated C=C selectively in presence of C≡C without Lindlar catalyst',
    ],
    brownRef: 'Ch 6.1, pp. 213–218',
    relatedReactions: ['hydroboration-alkene', 'epoxidation-alkene'],
    tags: ['reduction', 'syn', 'hydrogenation', 'surface catalysis', 'Pd', 'Pt', 'Ni', 'alkane'],
    rearrangementPossible: false,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'h2', symbol: 'H₂', x: 350, y: 80 },
          { id: 'cat', symbol: 'Pd', x: 350, y: 265 },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'h2' } },
        ],
        description: 'H₂ adsorbs on the Pd/Pt surface and dissociates into two chemisorbed H atoms. The alkene also adsorbs, positioning both H atoms on the same face for concerted delivery.',
        shortLabel: 'Reactant',
      }),
      synAdditionProductFrame({
        c1Orig: me1,
        c1New: { id: 'h_a', symbol: 'H' },
        c2New: { id: 'h_b', symbol: 'H' },
        description: 'Alkane product (syn): both H atoms added to the same face. 2-Methylpropane (isobutane) forms. The metal surface delivers H atoms simultaneously from one face.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Alkene + H₂',  energy: 55 },
      { label: 'TS (surface)', energy: 70, isTransitionState: true },
      { label: 'Alkane',       energy: 18 },
    ],
  },

  // ── 9. Anti-Markovnikov HBr (Radical) ────────────────────────────────────────
  {
    id: 'anti-mark-hbr',
    category: 'alkene',
    name: 'Anti-Markovnikov HBr (Radical)',
    summary: 'Peroxide-initiated radical chain: Br• adds to the less substituted carbon, giving anti-Markovnikov product.',
    reactants: 'Alkene + HBr + peroxide (ROOR)',
    products: 'Anti-Markovnikov alkyl bromide',
    conditions: 'HBr with ROOR (peroxide) initiator or hν; no acid catalyst',
    reactionType: 'radical',
    regiochemistry: 'anti-markovnikov',
    stereochemistry: null,
    intermediate: 'Carbon radical',
    importantInfo: [
      'ONLY HBr undergoes radical addition — not HCl or HI (radical stability/reactivity reasons)',
      'Three-step radical chain: initiation → propagation × 2 → termination',
      'Br• adds to the LESS substituted carbon → more stable radical at the more substituted C',
      'Net: Br on less sub. C, H on more sub. C — opposite of ionic Markovnikov addition',
      'Peroxide (ROOR) is required; without it, the ionic Markovnikov pathway occurs instead',
    ],
    brownRef: 'Ch 10.6, pp. 420–426',
    relatedReactions: ['hydrohalogenation-alkene', 'hydroboration-alkene'],
    tags: ['radical', 'anti-Markovnikov', 'HBr', 'peroxide', 'chain mechanism', 'Br radical'],
    rearrangementPossible: false,
    reversible: false,
    frames: [
      alkeneReactantFrame({
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'br_rad', symbol: 'Br•', x: 435, y: 75, role: 'electrophile' },
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'br_rad' }, style: 'fishhook' },
        ],
        description: 'Peroxide generates Br• (initiation). Br• adds to C2 (less substituted, propagation step 1). A fishhook arrow shows single-electron movement. The more stable tertiary radical forms at C1.',
        shortLabel: 'Reactant',
      }),
      carbocationFrame({
        cationOn: 1,   // used for geometry; charge shown below is manually given
        c1Top: me1, c1Bottom: me2,
        reagents: [
          { id: 'hbr', symbol: 'HBr', x: 265, y: 275 },
        ],
        arrows: [
          { from: { kind: 'lonePair', atomId: 'hbr', angleDeg: 315 }, to: { kind: 'atom', id: 'c1' }, style: 'fishhook', bow: 1 },
        ],
        description: 'Tertiary carbon radical at C1 (more stable than secondary — stabilized by 3 alkyl groups). H• from a new HBr molecule adds to C1 (propagation step 2), regenerating Br• to continue the chain.',
        shortLabel: 'Radical',
        caption: 'C1 radical (•)',
      }),
      additionProductFrame({
        c1Top: me1,
        c1Bottom: { id: 'h_new', symbol: 'H' },
        c2Top: { id: 'br', symbol: 'Br' },
        description: 'Anti-Markovnikov product: Br on the LESS substituted C2, H on the more substituted C1. This is the opposite of the ionic Markovnikov result.',
        shortLabel: 'Product',
      }),
    ],
    energyDiagram: [
      { label: 'Reactants',       energy: 40 },
      { label: 'TS₁',             energy: 35, isTransitionState: true },
      { label: 'C• intermediate', energy: 30 },
      { label: 'TS₂',             energy: 38, isTransitionState: true },
      { label: 'Products',        energy: 15 },
    ],
  },

]

import type { ReactionDef } from './types'
import { SceneBuilder, ArrowBuilder } from './sceneBuilder'
import { polar, midpoint } from './geometry'

// ── SN2 ───────────────────────────────────────────────────────────────────────

const sn2Scene = (() => {
  const sb = new SceneBuilder(700, 300)
  // Nucleophile starts far left; approaches from backside (left of C)
  sb.atom('nu', 'HO',  100, 150, { charge: '−', label: 'nucleophile', role: 'nucleophile' })
  sb.atom('c',  'C',   350, 150, { role: 'alpha_carbon', stereochem: 'S' })
  // Three sp3 substituents: H1 top (solid), H2 lower-right (wedge/toward viewer), H3 lower-left (dash-wedge/away)
  sb.atomFrom('h1', 'H',  'c', 270,  90)
  sb.atomFrom('h2', 'H',  'c',  44,  90, { role: 'h_substituent' })
  sb.atomFrom('h3', 'H',  'c', 136,  90, { role: 'h_substituent' })
  // Leaving group 200px to the right
  sb.atomFrom('br', 'Br', 'c', 0, 110, { charge: 'δ−', label: 'leaving group', role: 'leaving_group' })
  sb.bond('c-h1', 'c', 'h1', 1)
  sb.bond('c-h2', 'c', 'h2', 1, 'wedge')
  sb.bond('c-h3', 'c', 'h3', 1, 'dash-wedge')
  sb.bond('c-br', 'c', 'br', 1, 'dashed')
  return sb.build()
})()

const sn2Ab = new ArrowBuilder(sn2Scene)

// ── SN1 ───────────────────────────────────────────────────────────────────────

const sn1Scene = (() => {
  const sb = new SceneBuilder(700, 320)
  sb.atom('c_t',   'C',   310, 195, { role: 'alpha_carbon' })
  // Proper tetrahedral geometry: me1 lower-left (200°), me2 upper-right wedge (320°), me3 lower dash-wedge (80°)
  sb.atomFrom('me1', 'CH₃', 'c_t', 200, 100, { role: 'r_group' })
  sb.atomFrom('me2', 'CH₃', 'c_t', 320, 100, { role: 'r_group' })
  sb.atomFrom('me3', 'CH₃', 'c_t',  80, 100, { role: 'r_group' })
  sb.atomFrom('br',  'Br',  'c_t',   0, 110, { charge: 'δ−', label: 'leaving group', role: 'leaving_group' })
  sb.atom('water', 'H₂O', 310,  50, { label: 'nucleophile', role: 'nucleophile' })
  sb.bond('c-me1', 'c_t', 'me1', 1)
  sb.bond('c-me2', 'c_t', 'me2', 1, 'wedge')
  sb.bond('c-me3', 'c_t', 'me3', 1, 'dash-wedge')
  sb.bond('c-br',  'c_t', 'br',  1, 'dashed')
  return sb.build()
})()

const sn1Ab = new ArrowBuilder(sn1Scene)

// ── E2 ────────────────────────────────────────────────────────────────────────

const e2Scene = (() => {
  const sb = new SceneBuilder(720, 360)
  sb.atom('base',    'tBuO', 130,  72, { charge: '−', label: 'base', role: 'base' })
  sb.atom('c_beta',  'C',    295, 205, { role: 'beta_carbon' })
  sb.atom('c_alpha', 'C',    425, 205, { role: 'alpha_carbon' })
  // H_beta on wedge (toward viewer) from c_beta — anti-periplanar to LG
  sb.atomFrom('h_beta', 'H', 'c_beta', 225, 85, { role: 'h_substituent' })
  // Br on dash-wedge (away from viewer) from c_alpha — anti-periplanar to H
  sb.atomFrom('br',  'Br',  'c_alpha',  45, 100, { label: 'leaving group', role: 'leaving_group' })
  sb.atomFrom('r1',  'CH₃', 'c_beta',   90,  85, { role: 'r_group' })
  sb.atomFrom('r2',  'CH₃', 'c_alpha', 300,  90, { role: 'r_group' })
  sb.bond('hb-cb',  'h_beta',  'c_beta',  1, 'wedge')
  sb.bond('cb-ca',  'c_beta',  'c_alpha', 1)
  sb.bond('ca-br',  'c_alpha', 'br',      1, 'dash-wedge')
  sb.bond('cb-r1',  'c_beta',  'r1',      1)
  sb.bond('ca-r2',  'c_alpha', 'r2',      1)
  return sb.build()
})()

const e2Ab = new ArrowBuilder(e2Scene)

// ── E1 ────────────────────────────────────────────────────────────────────────

const e1Scene = (() => {
  const sb = new SceneBuilder(700, 320)
  sb.atom('base',    'H₂O', 195,  62, { label: 'weak base', role: 'base' })
  sb.atom('c_beta',  'C',   285, 205, { role: 'beta_carbon' })
  sb.atom('c_alpha', 'C',   425, 205, { role: 'alpha_carbon' })
  sb.atomFrom('h_beta', 'H',   'c_beta',  225, 80)
  sb.atom('br',   'Br',  545, 205, { label: 'leaving group', role: 'leaving_group' })
  sb.atomFrom('me1', 'CH₃', 'c_beta',   90, 90, { role: 'r_group' })
  sb.atomFrom('me2', 'CH₃', 'c_alpha', 270, 80, { role: 'r_group' })
  sb.atomFrom('me3', 'CH₃', 'c_alpha',   0, 80, { role: 'r_group' })
  sb.bond('hb-cb',  'h_beta',  'c_beta',  1)
  sb.bond('cb-ca',  'c_beta',  'c_alpha', 1)
  sb.bond('ca-br',  'c_alpha', 'br',      1, 'dashed')
  sb.bond('cb-me1', 'c_beta',  'me1',     1)
  sb.bond('ca-me2', 'c_alpha', 'me2',     1)
  sb.bond('ca-me3', 'c_alpha', 'me3',     1)
  return sb.build()
})()

const e1Ab = new ArrowBuilder(e1Scene)

// ── Williamson Ether ──────────────────────────────────────────────────────────

const williamsonScene = (() => {
  const sb = new SceneBuilder(700, 275)
  sb.atom('alk', 'RO',  100, 138, { charge: '−', label: 'alkoxide', role: 'nucleophile' })
  sb.atom('c',   'CH₂', 350, 138, { role: 'alpha_carbon' })
  sb.atomFrom('h1', 'H',  'c', 270, 80)
  sb.atomFrom('h2', 'H',  'c', 136, 80)
  sb.atomFrom('r',  'R′', 'c',  44, 80, { role: 'r_group' })
  sb.atomFrom('br', 'Br', 'c',   0, 110, { label: 'leaving group', role: 'leaving_group' })
  sb.bond('c-h1', 'c', 'h1', 1)
  sb.bond('c-h2', 'c', 'h2', 1, 'dash-wedge')
  sb.bond('c-r',  'c', 'r',  1, 'wedge')
  sb.bond('c-br', 'c', 'br', 1, 'dashed')
  return sb.build()
})()

const williamsonAb = new ArrowBuilder(williamsonScene)

// ── Acid Epoxide Opening ──────────────────────────────────────────────────────

const acidEpoxideScene = (() => {
  const sb = new SceneBuilder(700, 320)
  // Epoxide ring: c1 (more sub.) left, c2 (less sub.) right, O at top of triangle
  const c1 = { x: 298, y: 200 }
  const c2 = { x: 402, y: 200 }
  const oPos = polar(midpoint(c1, c2), 270, 70)  // (350, 130)
  sb.atom('h_plus', 'H⁺',  350,  50, { label: 'acid catalyst', role: 'acid' })
  sb.atom('o_ep',   'O',   oPos.x, oPos.y)
  sb.atom('c1',     'C',   c1.x, c1.y, { label: 'more sub.', role: 'more_substituted' })
  sb.atom('c2',     'C',   c2.x, c2.y, { label: 'less sub.',  role: 'less_substituted' })
  sb.atomFrom('me',  'CH₃', 'c1', 180, 103, { role: 'r_group' })
  sb.atomFrom('h2a', 'H',   'c2',  30,  80)
  sb.atomFrom('h2b', 'H',   'c2',  90,  80)
  sb.atom('nu', 'Nu', 148, 290, { label: 'nucleophile', role: 'nucleophile' })
  sb.bond('o-c1',   'o_ep', 'c1', 1)
  sb.bond('o-c2',   'o_ep', 'c2', 1)
  sb.bond('c1-c2',  'c1',   'c2', 1)
  sb.bond('c1-me',  'c1',   'me', 1)
  sb.bond('c2-h2a', 'c2',   'h2a', 1, 'wedge')
  sb.bond('c2-h2b', 'c2',   'h2b', 1)
  return sb.build()
})()

const acidEpoxideAb = new ArrowBuilder(acidEpoxideScene)

// ── Base Epoxide Opening ──────────────────────────────────────────────────────

const baseEpoxideScene = (() => {
  const sb = new SceneBuilder(700, 300)
  const c1 = { x: 298, y: 190 }
  const c2 = { x: 402, y: 190 }
  const oPos = polar(midpoint(c1, c2), 270, 78)  // (350, 112)
  sb.atom('nu',   'HO',  575, 152, { charge: '−', label: 'nucleophile', role: 'nucleophile' })
  sb.atom('o_ep', 'O',   oPos.x, oPos.y)
  sb.atom('c1',   'C',   c1.x, c1.y, { label: 'more sub.', role: 'more_substituted' })
  sb.atom('c2',   'C',   c2.x, c2.y, { label: 'less sub.',  role: 'less_substituted' })
  sb.atomFrom('me',  'CH₃', 'c1', 180, 106, { role: 'r_group' })
  sb.atomFrom('h2a', 'H',   'c2',  30,  80)
  sb.atomFrom('h2b', 'H',   'c2',  90,  80)
  sb.bond('o-c1',   'o_ep', 'c1', 1)
  sb.bond('o-c2',   'o_ep', 'c2', 1)
  sb.bond('c1-c2',  'c1',   'c2', 1)
  sb.bond('c1-me',  'c1',   'me', 1)
  sb.bond('c2-h2a', 'c2',   'h2a', 1, 'wedge')
  sb.bond('c2-h2b', 'c2',   'h2b', 1)
  return sb.build()
})()

const baseEpoxideAb = new ArrowBuilder(baseEpoxideScene)

// ── Reactions ─────────────────────────────────────────────────────────────────

export const SN_E_REACTIONS: ReactionDef[] = [

  {
    id: 'sn2',
    category: 'sn_e',
    name: 'SN2 Reaction',
    summary: 'Concerted bimolecular nucleophilic substitution with backside attack and Walden inversion.',
    reactants: 'R-LG + Nu⁻',
    products: 'R-Nu + LG⁻',
    conditions: 'Polar aprotic solvent (DMF, DMSO, acetone); strong polarizable nucleophile; methyl or 1° alkyl halide',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: 'inversion',
    intermediate: null,
    importantInfo: [
      'Rate = k[substrate][Nu⁻] — second-order kinetics',
      'One-step concerted mechanism — no intermediate forms',
      'Backside attack causes Walden inversion (configuration at carbon inverts)',
      'Reactivity order: methyl > 1° > 2° ≫ 3° (steric effects at carbon)',
      '3° substrates do NOT undergo SN2 — steric hindrance blocks backside approach',
      'Strong, polarizable nucleophile + polar aprotic solvent strongly favors SN2',
    ],
    brownRef: 'Ch 6.5–6.7, pp. 230–245',
    relatedReactions: ['sn1', 'e2', 'williamson-ether'],
    tags: ['substitution', 'backside attack', 'inversion', 'concerted', 'methyl', 'primary', 'Walden', 'bimolecular'],
    rearrangementPossible: false,
    reversible: false,
    scene: sn2Scene,
    steps: [
      {
        step: 1,
        label: 'Nucleophilic attack (backside, concerted)',
        description: 'HO⁻ attacks the back face of the C–Br σ* orbital. As the new C–O bond forms, the C–Br bond breaks simultaneously. The wedge and dash-wedge bonds flip (Walden inversion) — the three substituents evert like an umbrella in the wind.',
        animations: [
          sn2Ab.fromLonePairToAtom('nu', 'c', 0, { color: 'var(--c-alkali)', duration: 0.6 }),
          sn2Ab.translateAtom('nu', 250, 150, { duration: 0.8 }),
          { type: 'charge_disappear', text: '−',   targetId: 'nu', delay: 0.2 },
          { type: 'bond_form',        targetId: 'nu-c', delay: 0.2 },
          sn2Ab.fromAtomToAtom('c', 'br', { color: 'var(--c-halogen)', delay: 0.2, duration: 0.6 }),
          { type: 'bond_break',       targetId: 'c-br',  delay: 0.3 },
          sn2Ab.translateAtom('br', 650, 150, { duration: 0.8, delay: 0.3 }),
          { type: 'charge_disappear', text: 'δ−',  targetId: 'br', delay: 0.3 },
          { type: 'charge_appear',    text: '−',   targetId: 'br', delay: 0.55 },
          { type: 'invert_stereocenter', targetId: 'c', delay: 0.6, duration: 0.5 },
          { type: 'step_label',       text: 'Walden inversion — wedge and dash-wedge bonds flip', delay: 0.75 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'Reactants',    energy: 40 },
      { label: '[HO⋯C⋯Br]⁻', energy: 80, isTransitionState: true },
      { label: 'Products',     energy: 20 },
    ],
  },

  {
    id: 'sn1',
    category: 'sn_e',
    name: 'SN1 Reaction',
    summary: 'Two-step unimolecular substitution through a planar carbocation intermediate, giving racemization.',
    reactants: 'R₃C-LG + Nu (3° substrate)',
    products: 'R₃C-Nu (racemic mixture)',
    conditions: 'Polar protic solvent (H₂O, ROH, AcOH); weak nucleophile or solvent; 3° or stabilized (allylic, benzylic) substrate',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: 'racemization',
    intermediate: 'Carbocation',
    importantInfo: [
      'Rate = k[substrate] — nucleophile is NOT in the rate law (unimolecular)',
      'Two steps: (1) slow ionization to carbocation (RDS), (2) fast nucleophilic attack',
      'Carbocation is planar sp² → attack from either face → racemization',
      'Reactivity: 3° > 2° (allylic/benzylic) ≫ 1° (methyl does not undergo SN1)',
      'Carbocation rearrangements (hydride/alkyl shifts) possible if more stable cation accessible',
      'Polar protic solvents stabilize the ion pair through hydrogen bonding and solvation',
    ],
    brownRef: 'Ch 7.4–7.6, pp. 280–298',
    relatedReactions: ['sn2', 'e1', 'hydration-alkene'],
    tags: ['substitution', 'carbocation', 'racemization', 'unimolecular', 'tertiary', 'rearrangement'],
    rearrangementPossible: true,
    reversible: false,
    scene: sn1Scene,
    steps: [
      {
        step: 1,
        label: 'Ionization (rate-determining step)',
        description: 'The C–Br bond breaks heterolytically — both electrons go to Br. A tertiary carbocation forms. It is planar and sp² hybridized. This is the slow, rate-determining step and is why the nucleophile does not appear in the rate law.',
        animations: [
          sn1Ab.fromAtomToAtom('c_t', 'br', { color: 'var(--c-halogen)', duration: 0.6 }),
          { type: 'bond_break',        targetId: 'c-br',   delay: 0.2 },
          sn1Ab.translateAtom('br', 625, 195, { duration: 1.0, delay: 0.2 }),
          { type: 'charge_disappear',  text: 'δ−', targetId: 'br',  delay: 0.2 },
          { type: 'charge_appear',     text: '+',  targetId: 'c_t', delay: 0.4 },
          { type: 'charge_appear',     text: '−',  targetId: 'br',  delay: 0.5 },
          { type: 'intermediate_glow', targetId: 'c_t', delay: 0.5, duration: 0.9 },
          { type: 'bond_style_change', targetId: 'c-me3', text: 'solid', delay: 0.5, duration: 0.5 },
          { type: 'step_label',        text: 'Carbocation formed — planar, sp² hybridized', delay: 0.7 },
        ],
      },
      {
        step: 2,
        label: 'Nucleophilic attack (fast)',
        description: 'Water (or another nucleophile) attacks the planar carbocation. The carbocation is sp² — both the top and bottom faces are equally accessible. Two curved arrows show attack from either face, producing a 1:1 racemic mixture of enantiomers.',
        animations: [
          sn1Ab.fromAtomToAtom('water', 'c_t', { side: 1, color: 'var(--c-alkali)', duration: 0.6 }),
          sn1Ab.translateAtom('water', 310, 115, { duration: 0.7 }),
          { type: 'bond_form',        targetId: 'water-c_t', delay: 0.2 },
          { type: 'charge_disappear', text: '+',   targetId: 'c_t',   delay: 0.3 },
          { type: 'atom_relabel',     text: 'OH',  targetId: 'water', delay: 0.5 },
          { type: 'step_label',       text: 'Attack from either face → racemic mixture', delay: 0.5 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'Reactants', energy: 40 },
      { label: 'TS₁',       energy: 90, isTransitionState: true },
      { label: 'R₃C⁺',     energy: 65 },
      { label: 'TS₂',       energy: 72, isTransitionState: true },
      { label: 'Products',  energy: 25 },
    ],
  },

  {
    id: 'e2',
    category: 'sn_e',
    name: 'E2 Elimination',
    summary: 'Concerted bimolecular elimination requiring anti-periplanar H and LG; gives Zaitsev alkene.',
    reactants: 'R-CHR′-CHR″-LG + strong base (KOtBu, NaOEt)',
    products: 'Alkene + HB + LG⁻',
    conditions: 'Strong bulky base (NaOEt, KOtBu); polar aprotic or alcoholic solvent; elevated temperature',
    reactionType: 'elimination',
    regiochemistry: null,
    stereochemistry: 'anti',
    intermediate: null,
    importantInfo: [
      'Rate = k[substrate][base] — second-order kinetics',
      'Concerted — proton removal and leaving group departure happen simultaneously',
      'ANTI-PERIPLANAR geometry required: H and LG must be 180° apart (dihedral)',
      'Wedge bond (H) and dash-wedge bond (LG) show the opposite faces — anti geometry',
      'Zaitsev rule: more substituted (more stable) alkene is the major product',
      'Strong base + elevated temperature favors E2 over SN2 at the same substrate',
    ],
    brownRef: 'Ch 8.3–8.6, pp. 322–340',
    relatedReactions: ['e1', 'sn2', 'dehydration-alcohol'],
    tags: ['elimination', 'anti-periplanar', 'Zaitsev', 'Hofmann', 'alkene', 'bimolecular', 'concerted'],
    rearrangementPossible: false,
    reversible: false,
    scene: e2Scene,
    steps: [
      {
        step: 1,
        label: 'Concerted elimination (anti-periplanar)',
        description: 'All three events happen simultaneously: the base abstracts the β-H (wedge — toward viewer), the C–C π bond forms, and the leaving group departs (dash-wedge — away from viewer). The 180° anti-periplanar geometry between H and LG is required for σ-orbital overlap.',
        animations: [
          e2Ab.fromAtomToAtom('base', 'h_beta', { color: 'var(--c-alkali)', duration: 0.5 }),
          e2Ab.translateAtom('h_beta', 185, 92, { duration: 0.7 }),
          { type: 'bond_break',       targetId: 'hb-cb', delay: 0.2 },
          e2Ab.fromAtomToAtom('c_beta', 'c_alpha', { color: 'var(--c-alkali)', delay: 0.2, duration: 0.5 }),
          { type: 'bond_form',        targetId: 'cb-ca', delay: 0.25 },
          e2Ab.fromAtomToAtom('c_alpha', 'br', { color: 'var(--c-halogen)', delay: 0.3, duration: 0.5 }),
          { type: 'bond_break',       targetId: 'ca-br', delay: 0.3 },
          e2Ab.translateAtom('br', 610, 340, { duration: 0.7, delay: 0.35 }),
          { type: 'charge_appear',    text: '−',      targetId: 'br',   delay: 0.55 },
          { type: 'charge_disappear', text: '−',      targetId: 'base', delay: 0.2 },
          { type: 'atom_relabel',     text: 'tBuOH',  targetId: 'base', delay: 0.5 },
          { type: 'step_label',       text: 'Anti-periplanar geometry required — H (wedge) and LG (dash-wedge) 180° apart', delay: 0.75 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'Reactants', energy: 45 },
      { label: 'TS',        energy: 85, isTransitionState: true },
      { label: 'Alkene',    energy: 20 },
    ],
  },

  {
    id: 'e1',
    category: 'sn_e',
    name: 'E1 Elimination',
    summary: 'Two-step unimolecular elimination through a carbocation; competes with SN1 at the same substrates.',
    reactants: 'R₃C-CHR-LG + weak base (or solvent)',
    products: 'R₂C=CHR (Zaitsev alkene)',
    conditions: 'Polar protic solvent; weak base (H₂O, ROH); 3° substrate; elevated temperature favors E1 over SN1',
    reactionType: 'elimination',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Carbocation',
    importantInfo: [
      'Rate = k[substrate] — only substrate in the rate law (unimolecular)',
      'Step 1 (rate-determining): identical to SN1 ionization — carbocation forms',
      'Step 2: any base (even solvent) abstracts a β-hydrogen to form the alkene',
      'Often competes with SN1 — higher temperature favors E1 (entropy increase)',
      'Zaitsev rule applies: more substituted alkene is major product',
      'Carbocation rearrangements (hydride/alkyl shifts) can occur before elimination',
    ],
    brownRef: 'Ch 8.7–8.9, pp. 341–355',
    relatedReactions: ['e2', 'sn1', 'dehydration-alcohol'],
    tags: ['elimination', 'carbocation', 'Zaitsev', 'unimolecular', 'tertiary', 'E1'],
    rearrangementPossible: true,
    reversible: false,
    scene: e1Scene,
    steps: [
      {
        step: 1,
        label: 'Ionization (rate-determining step)',
        description: 'The leaving group departs with both bonding electrons, forming a tertiary carbocation. This step is identical to SN1 ionization and determines the overall reaction rate.',
        animations: [
          e1Ab.fromAtomToAtom('c_alpha', 'br', { color: 'var(--c-halogen)', duration: 0.6 }),
          { type: 'bond_break',        targetId: 'ca-br',     delay: 0.2 },
          e1Ab.translateAtom('br', 655, 205, { duration: 1.0, delay: 0.2 }),
          { type: 'charge_appear',     text: '+', targetId: 'c_alpha', delay: 0.4 },
          { type: 'charge_appear',     text: '−', targetId: 'br',      delay: 0.4 },
          { type: 'intermediate_glow', targetId: 'c_alpha', delay: 0.5, duration: 0.9 },
          { type: 'step_label',        text: 'Carbocation formed — identical to SN1 step 1', delay: 0.7 },
        ],
      },
      {
        step: 2,
        label: 'Proton abstraction (fast)',
        description: 'Any base — even the solvent (H₂O) — removes a β-hydrogen. The C–H bonding electrons shift to form the new C=C π bond and the carbocation charge disappears. Zaitsev: the more substituted alkene forms preferentially.',
        animations: [
          e1Ab.fromAtomToAtom('base', 'h_beta', { color: 'var(--c-alkali)', duration: 0.5 }),
          e1Ab.translateAtom('h_beta', 170, 15, { duration: 0.7 }),
          { type: 'bond_break',       targetId: 'hb-cb',     delay: 0.2 },
          e1Ab.fromAtomToAtom('c_beta', 'c_alpha', { color: 'var(--c-alkali)', delay: 0.2, duration: 0.5 }),
          { type: 'bond_form',        targetId: 'cb-ca',     delay: 0.25 },
          { type: 'charge_disappear', text: '+',   targetId: 'c_alpha', delay: 0.3 },
          { type: 'atom_relabel',     text: 'H₃O', targetId: 'base',    delay: 0.45 },
          { type: 'charge_appear',    text: '+',   targetId: 'base',    delay: 0.45 },
          { type: 'step_label',       text: 'Zaitsev product — more substituted alkene favored', delay: 0.65 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'Reactants', energy: 40 },
      { label: 'TS₁',       energy: 88, isTransitionState: true },
      { label: 'R₃C⁺',     energy: 62 },
      { label: 'TS₂',       energy: 68, isTransitionState: true },
      { label: 'Alkene',    energy: 22 },
    ],
  },

  {
    id: 'williamson-ether',
    category: 'sn_e',
    name: 'Williamson Ether Synthesis',
    summary: 'SN2 reaction of an alkoxide with a primary alkyl halide to form an ether — must use 1° or methyl halide.',
    reactants: 'RO⁻ (alkoxide) + R′CH₂-X (methyl or 1° alkyl halide)',
    products: 'R-O-CH₂R′ (ether) + X⁻',
    conditions: 'Alkoxide salt (NaOR) in polar aprotic solvent; alkyl halide must be methyl or 1°',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: 'inversion',
    intermediate: null,
    importantInfo: [
      'SN2 mechanism — alkoxide is both a strong nucleophile and a strong base',
      'Alkyl halide must be methyl or 1° — 2° or 3° halides give E2 elimination instead',
      'Choose the less hindered partner as the alkyl halide, not the alkoxide',
      'Both symmetric and asymmetric ethers can be made',
      'Cannot synthesize 3°–3° or 2°–3° ethers this way',
    ],
    brownRef: 'Ch 11.4, pp. 463–466',
    relatedReactions: ['sn2', 'acid-epoxide-opening', 'base-epoxide-opening'],
    tags: ['substitution', 'ether', 'alkoxide', 'Williamson', 'SN2', 'backside attack'],
    rearrangementPossible: false,
    reversible: false,
    scene: williamsonScene,
    steps: [
      {
        step: 1,
        label: 'SN2 backside attack by alkoxide',
        description: 'The alkoxide oxygen (RO⁻) attacks the back face of the C–Br σ* orbital, displacing bromide. The mechanism is identical to a simple SN2. Stereochemistry inverts at the carbon center (Walden inversion).',
        animations: [
          williamsonAb.fromLonePairToAtom('alk', 'c', 0, { color: 'var(--c-alkali)', duration: 0.6 }),
          williamsonAb.translateAtom('alk', 248, 138, { duration: 0.8 }),
          { type: 'charge_disappear', text: '−', targetId: 'alk', delay: 0.2 },
          { type: 'bond_form',        targetId: 'alk-c', delay: 0.2 },
          williamsonAb.fromAtomToAtom('c', 'br', { color: 'var(--c-halogen)', delay: 0.2, duration: 0.6 }),
          { type: 'bond_break',       targetId: 'c-br',  delay: 0.3 },
          williamsonAb.translateAtom('br', 650, 138, { duration: 0.8, delay: 0.3 }),
          { type: 'charge_appear',       text: '−', targetId: 'br', delay: 0.52 },
          { type: 'invert_stereocenter', targetId: 'c', delay: 0.6, duration: 0.5 },
          { type: 'step_label',          text: 'Identical to SN2 — 1° halide required', delay: 0.72 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'RO⁻ + R′X',    energy: 42 },
      { label: '[RO⋯C⋯Br]⁻',  energy: 78, isTransitionState: true },
      { label: 'R-O-R′ + Br⁻', energy: 18 },
    ],
  },

  {
    id: 'acid-epoxide-opening',
    category: 'ether_epoxide',
    name: 'Acid-Catalyzed Epoxide Opening',
    summary: 'Nucleophile attacks the MORE substituted epoxide carbon after protonation; product is anti (trans).',
    reactants: 'Epoxide + Nu (H₂O, ROH) + H⁺ (cat.)',
    products: 'Trans-diol or trans-ether (anti addition)',
    conditions: 'Aqueous acid (H₃O⁺) or BF₃; nucleophilic solvent',
    reactionType: 'substitution',
    regiochemistry: 'markovnikov',
    stereochemistry: 'anti',
    intermediate: null,
    importantInfo: [
      'H⁺ protonates epoxide oxygen, greatly increasing ring electrophilicity',
      'Nucleophile attacks the MORE substituted carbon (partial carbocation character)',
      'Product has ANTI (trans) stereochemistry — nucleophile enters from the back face',
      'Water as nucleophile gives the trans-diol product',
      'Opposite regiochemistry from base-catalyzed opening (which gives anti-Markovnikov)',
    ],
    brownRef: 'Ch 11.8, pp. 475–480',
    relatedReactions: ['base-epoxide-opening', 'williamson-ether'],
    tags: ['epoxide', 'acid-catalyzed', 'Markovnikov', 'anti', 'trans-diol', 'ring-opening'],
    rearrangementPossible: false,
    reversible: false,
    scene: acidEpoxideScene,
    steps: [
      {
        step: 1,
        label: 'Protonation of epoxide oxygen',
        description: 'Acid protonates the epoxide oxygen. The protonated epoxide is highly electrophilic. C1 (the more substituted carbon) develops partial carbocation character because it can better stabilize positive charge.',
        animations: [
          acidEpoxideAb.fromAtomToAtom('h_plus', 'o_ep', { color: 'var(--c-halogen)', duration: 0.5 }),
          acidEpoxideAb.translateAtom('h_plus', 350, 100, { duration: 0.6 }),
          { type: 'bond_form',     targetId: 'h_plus-o_ep', delay: 0.35 },
          { type: 'atom_relabel',  text: 'H', targetId: 'h_plus', delay: 0.35 },
          { type: 'charge_appear', text: '+', targetId: 'o_ep',   delay: 0.35 },
          { type: 'step_label',    text: 'Protonated epoxide — C1 has partial cation character', delay: 0.6 },
        ],
      },
      {
        step: 2,
        label: 'Nucleophilic attack at more substituted carbon',
        description: 'The nucleophile attacks C1 (more substituted, more electrophilic) from the back face in an SN2-like fashion. The C1–O bond breaks. Anti (trans) product results from backside attack.',
        animations: [
          acidEpoxideAb.fromAtomToAtom('nu', 'c1', { color: 'var(--c-alkali)', duration: 0.6 }),
          acidEpoxideAb.translateAtom('nu', 208, 252, { duration: 0.8 }),
          { type: 'bond_form',        targetId: 'nu-c1',   delay: 0.2 },
          acidEpoxideAb.fromAtomToAtom('c1', 'o_ep', { color: 'var(--c-halogen)', delay: 0.22, duration: 0.5 }),
          { type: 'bond_break',       targetId: 'o-c1',   delay: 0.3 },
          { type: 'charge_disappear', text: '+', targetId: 'o_ep', delay: 0.3 },
          { type: 'step_label',       text: 'Attack at more sub. C — Markovnikov + anti stereochemistry', delay: 0.72 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'Epoxide + H⁺',  energy: 48 },
      { label: 'TS₁',           energy: 72, isTransitionState: true },
      { label: 'H-Epoxide⁺',    energy: 55 },
      { label: 'TS₂',           energy: 80, isTransitionState: true },
      { label: 'Product',        energy: 22 },
    ],
  },

  {
    id: 'base-epoxide-opening',
    category: 'ether_epoxide',
    name: 'Base-Catalyzed Epoxide Opening',
    summary: 'Nucleophile attacks the LESS substituted epoxide carbon by SN2; anti (inverted) product.',
    reactants: 'Epoxide + Nu⁻ (HO⁻, RO⁻, or RMgX)',
    products: 'Anti (trans)-alcohol product at less hindered carbon',
    conditions: 'Basic conditions (NaOH, NaOR); Grignard in Et₂O; no acid present',
    reactionType: 'substitution',
    regiochemistry: 'anti-markovnikov',
    stereochemistry: 'inversion',
    intermediate: null,
    importantInfo: [
      'Pure SN2 — nucleophile attacks the LESS hindered (less substituted) carbon',
      'Inverted stereochemistry at the attacked carbon (backside attack)',
      'Opposite regiochemistry from acid-catalyzed opening',
      'Grignard reagents (RMgX) open epoxides this way — key for C–C bond formation',
      'Epoxide ring strain (~114 kJ/mol) drives the reaction despite forming an alkoxide',
    ],
    brownRef: 'Ch 11.9, pp. 480–484',
    relatedReactions: ['acid-epoxide-opening', 'sn2', 'grignard-epoxide'],
    tags: ['epoxide', 'base-catalyzed', 'anti-Markovnikov', 'inversion', 'SN2', 'ring-opening', 'Grignard'],
    rearrangementPossible: false,
    reversible: false,
    scene: baseEpoxideScene,
    steps: [
      {
        step: 1,
        label: 'SN2 attack at less substituted carbon',
        description: 'The nucleophile (HO⁻, RO⁻, or RMgX) attacks C2 (less hindered) from the back face — pure SN2 mechanism. The C2–O epoxide bond breaks as the new bond forms. Stereochemistry at C2 inverts. The alkoxide product is protonated during workup.',
        animations: [
          baseEpoxideAb.fromLonePairToAtom('nu', 'c2', 180, { color: 'var(--c-alkali)', duration: 0.6 }),
          baseEpoxideAb.translateAtom('nu', 502, 165, { duration: 0.8 }),
          { type: 'charge_disappear', text: '−', targetId: 'nu',   delay: 0.2 },
          { type: 'bond_form',        targetId: 'nu-c2',            delay: 0.2 },
          baseEpoxideAb.fromAtomToAtom('c2', 'o_ep', { color: 'var(--c-halogen)', delay: 0.25, duration: 0.5 }),
          { type: 'bond_break',       targetId: 'o-c2',             delay: 0.3 },
          { type: 'charge_appear',       text: '−', targetId: 'o_ep', delay: 0.52 },
          { type: 'invert_stereocenter', targetId: 'c2', delay: 0.6, duration: 0.5 },
          { type: 'step_label',          text: 'SN2 at less substituted C — anti-Markovnikov + inversion', delay: 0.72 },
        ],
      },
    ],
    energyDiagram: [
      { label: 'Epoxide + Nu⁻', energy: 45 },
      { label: 'TS',            energy: 78, isTransitionState: true },
      { label: 'Alkoxide',      energy: 28 },
    ],
  },
]

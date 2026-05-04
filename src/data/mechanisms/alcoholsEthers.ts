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

// ── sp³ carbon geometry (BOND_LENGTH=100, slots from sceneTemplates) ───────────
// Slot angles (SVG: 0°=right, 90°=down, 270°=up):
//   right(0°)=(cx+100,cy), bottom(90°)=(cx,cy+100), left(180°)=(cx-100,cy),
//   top(270°)=(cx,cy-100), wedge(44°)=(cx+72,cy+70), dash(136°)=(cx-72,cy+70)
//
// Standard center for this file: cx=350, cy=165
// → right=(450,165), top=(350,65), left=(250,165), bottom=(350,265)
//   wedge=(422,235), dash=(278,235)

// ── Reactions ─────────────────────────────────────────────────────────────────

export const ALCOHOL_ETHER_REACTIONS: ReactionDef[] = [

  // ── 1. Dehydration ──────────────────────────────────────────────────────────
  {
    id: 'dehydration-alcohol',
    category: 'alcohol',
    name: 'Dehydration of Alcohols',
    summary: 'Acid-catalyzed elimination of water from an alcohol gives an alkene. Follows Zaitsev\'s rule. E1 for 2°/3°; E2 with POCl₃/pyridine avoids rearrangements.',
    reactants: 'Alcohol',
    products: 'Alkene + H₂O (Zaitsev product)',
    conditions: 'Conc. H₂SO₄ or H₃PO₄, heat (E1); or POCl₃/pyridine (E2, 2° only)',
    reactionType: 'elimination',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Carbocation',
    importantInfo: [
      'Acid-catalyzed (E1): reversible, rearrangements possible, 3° > 2° > 1°. Both Zaitsev.',
      'POCl₃/pyridine (E2): not reversible, no rearrangement, works on 2° alcohols (1° possible with strong base)',
      'Reverse of acid-catalyzed hydration — equilibrium favors alkene at high T (Le Chatelier)',
      'Zaitsev product (more substituted alkene) is the thermodynamic product',
      '1° alcohols cannot easily form 1° carbocations — need strong reagents (POCl₃, PBr₃, or E2 conditions)',
    ],
    brownRef: 'Ch 10.5',
    relatedReactions: ['e1', 'e2', 'hydration-alkene'],
    tags: ['elimination', 'dehydration', 'Zaitsev', 'carbocation', 'E1', 'E2', 'POCl₃'],
    rearrangementPossible: true,
    reversible: true,
    frames: [
      {
        // 2° alcohol: center C with OH(bottom), H(top), CH₃(left), CH₃(right)
        atoms: [
          mk('center', 'C',   350, 165),
          mk('oh',     'OH',  350, 265, { role: 'leaving_group' }),
          mk('h',      'H',   350,  65, { role: 'h_substituent' }),
          mk('r1',     'CH₃', 250, 165, { role: 'r_group' }),
          mk('r2',     'CH₃', 450, 165, { role: 'r_group' }),
          mk('acid',   'H⁺',  480, 290, { label: 'H₂SO₄', role: 'acid' }),
        ],
        bonds: [
          bd('center-oh', 'center', 'oh', 1),
          bd('center-h',  'center', 'h',  1),
          bd('center-r1', 'center', 'r1', 1),
          bd('center-r2', 'center', 'r2', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'acid' },
          to:   { kind: 'atom', id: 'oh' },
          color: 'var(--c-alkali)',
        }],
        description: '2° alcohol. H₂SO₄ protonates the OH group → OH₂⁺ (much better leaving group). Step 1 is fast and reversible.',
        shortLabel: '2° Alcohol',
      },
      {
        // Carbocation intermediate: OH gone, + on center, H still there
        atoms: [
          mk('center', 'C',   350, 165, { charge: '+', glow: true }),
          mk('h',      'H',   350,  65, { role: 'h_substituent' }),
          mk('r1',     'CH₃', 250, 165, { role: 'r_group' }),
          mk('r2',     'CH₃', 450, 165, { role: 'r_group' }),
          mk('oh2',    'H₂O', 350, 295, { label: 'leaving' }),
        ],
        bonds: [
          bd('center-h',  'center', 'h',  1),
          bd('center-r1', 'center', 'r1', 1),
          bd('center-r2', 'center', 'r2', 1),
        ],
        arrows: [{
          from: { kind: 'bond', id: 'center-h' },
          to:   { kind: 'atom', id: 'r1' },
          color: 'var(--c-halogen)',
        }],
        description: 'H₂O leaves → 2° carbocation. + charge on center C. Rearrangement (hydride/alkyl shift) can occur if a more stable cation is accessible. A base (HSO₄⁻) will remove a β-H.',
        shortLabel: 'Carbocation',
      },
      {
        // Alkene product: C=C with two R groups
        atoms: [
          mk('c1', 'C',   280, 165),
          mk('c2', 'C',   420, 165),
          mk('r1', 'CH₃', 140, 165, { role: 'r_group' }),
          mk('r2', 'CH₃', 560, 165, { role: 'r_group' }),
        ],
        bonds: [
          bd('c1-c2', 'c1', 'c2', 2),
          bd('c1-r1', 'c1', 'r1', 1),
          bd('c2-r2', 'c2', 'r2', 1),
        ],
        arrows: [],
        description: 'β-H removed by base (HSO₄⁻). C–H electrons form the C=C π bond. Zaitsev alkene (more substituted) is the major product. H₂SO₄ regenerated. Reaction is reversible — equilibrium favors alkene at high temperature.',
        shortLabel: 'Alkene',
      },
    ],
    energyDiagram: [
      { label: 'Alcohol',       energy: 40 },
      { label: 'TS₁',           energy: 78, isTransitionState: true },
      { label: 'Carbocation',   energy: 58 },
      { label: 'TS₂',           energy: 65, isTransitionState: true },
      { label: 'Alkene + H₂O', energy: 45 },
    ],
  },

  // ── 2. Oxidation of Alcohols ─────────────────────────────────────────────────
  {
    id: 'alcohol-oxidation',
    category: 'alcohol',
    name: 'Oxidation of Alcohols',
    summary: 'PCC oxidizes 1° alcohols to aldehydes (stops there). H₂CrO₄/Jones oxidizes 1° alcohols all the way to carboxylic acids. Both reagents oxidize 2° → ketone. 3° alcohols: no reaction.',
    reactants: '1° or 2° Alcohol',
    products: 'Aldehyde (PCC from 1°), Carboxylic acid (Jones from 1°), Ketone (from 2°)',
    conditions: 'PCC (mild, CH₂Cl₂, rt); H₂CrO₄ (Jones, strong, acetone); MnO₂ (allylic/benzylic)',
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'PCC = pyridinium chlorochromate (Corey\'s reagent): mild, stops at aldehyde for 1° alcohols',
      'H₂CrO₄ (Jones reagent) or Na₂Cr₂O₇/H₂SO₄: STRONG, oxidizes 1° all the way to RCOOH',
      'Both 1° → ketone for 2° alcohols (same result, different reagents fine)',
      '3° alcohol = NO REACTION (no α-H for oxidation, no β-C=O possible)',
      'Swern (DMSO/(COCl)₂/Et₃N) is gentlest: 1° → aldehyde, low temperature, no chromium',
    ],
    brownRef: 'Ch 10.6',
    relatedReactions: ['swern-oxidation', 'sidechain-oxidation'],
    tags: ['oxidation', 'PCC', 'Jones', 'aldehyde', 'ketone', 'carboxylic acid', 'chromium'],
    frames: [
      {
        // 1° alcohol: R-CH₂-OH; h1 top, h2 wedge, OH right, R left
        atoms: [
          mk('center', 'C',   350, 165, { role: 'alpha_carbon' }),
          mk('oh',     'OH',  450, 165, { role: 'leaving_group' }),
          mk('h1',     'H',   350,  65, { role: 'h_substituent' }),
          mk('h2',     'H',   422, 235, { role: 'h_substituent' }),
          mk('r',      'R',   250, 165, { role: 'r_group' }),
          mk('pcc',    'PCC', 570, 100, { label: 'oxidant', role: 'electrophile' }),
        ],
        bonds: [
          bd('center-oh', 'center', 'oh', 1),
          bd('center-h1', 'center', 'h1', 1),
          bd('center-h2', 'center', 'h2', 1, 'wedge'),
          bd('center-r',  'center', 'r',  1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'pcc' },
          to:   { kind: 'bond', id: 'center-h1' },
          color: 'var(--c-halogen)',
        }],
        description: '1° alcohol: R-CH₂OH. PCC removes the α-H through a chromate ester mechanism. PCC cannot oxidize the aldehyde further (no water present in CH₂Cl₂ solvent).',
        shortLabel: '1° Alcohol + PCC',
      },
      {
        // Aldehyde: R-CHO; R left, C center, O top (double bond)
        atoms: [
          mk('r', 'R',  200, 165, { role: 'r_group' }),
          mk('c', 'C',  340, 165, { role: 'carbonyl_carbon' }),
          mk('o', 'O',  340,  55, { role: 'carbonyl_oxygen' }),
          mk('h', 'H',  480, 165),
        ],
        bonds: [
          bd('r-c', 'r', 'c', 1),
          bd('c-o', 'c', 'o', 2),
          bd('c-h', 'c', 'h', 1),
        ],
        arrows: [],
        description: 'Aldehyde product (R-CHO). PCC stops here — no over-oxidation. For full oxidation to carboxylic acid (RCOOH), use Jones reagent (H₂CrO₄) instead. 2° alcohols give ketones with both PCC and Jones.',
        shortLabel: 'Aldehyde',
      },
    ],
    energyDiagram: [
      { label: 'Alcohol',  energy: 45 },
      { label: 'TS',       energy: 72, isTransitionState: true },
      { label: 'Aldehyde', energy: 22 },
    ],
  },

  // ── 3. Alcohol to Halide ─────────────────────────────────────────────────────
  {
    id: 'alcohol-to-halide',
    category: 'alcohol',
    name: 'Conversion of Alcohol to Halide',
    summary: 'OH is converted to a halide (Cl, Br, I) by HX, SOCl₂, or PBr₃. The mechanism (SN1 vs SN2) depends on alcohol class. SOCl₂ and PBr₃ give SN2 with inversion — better control than HX.',
    reactants: 'Alcohol + HX (or SOCl₂ or PBr₃)',
    products: 'Alkyl halide (R-X)',
    conditions: 'HX (3° SN1, rearrange; 1° SN2); SOCl₂/pyridine → RCl (SN2, inversion); PBr₃ → RBr (SN2)',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: 'inversion',
    intermediate: 'Carbocation',
    importantInfo: [
      'HX + 3°/2° alcohol: SN1 (carbocation, racemization, rearrangements possible)',
      'HX + 1° alcohol: SN2 (inversion, no rearrangement)',
      'SOCl₂ + alcohol → chlorosulfite ester → SN2 by Cl⁻ → RCl with inversion (clean, better than HCl)',
      'PBr₃ + alcohol → phosphite ester → SN2 by Br⁻ → RBr with inversion',
      'More substituted alcohols react faster with HX: 3° > 2° > 1° (consistent with SN1 rates)',
    ],
    brownRef: 'Ch 10.7',
    relatedReactions: ['sn1', 'sn2', 'tosylate-formation'],
    tags: ['substitution', 'alcohol', 'halide', 'HBr', 'SOCl₂', 'PBr₃', 'SN1', 'SN2', 'inversion'],
    rearrangementPossible: true,
    frames: [
      {
        // 1° alcohol: R-CH₂-OH + HBr approaching
        atoms: [
          mk('center', 'C',   350, 165, { role: 'alpha_carbon' }),
          mk('oh',     'OH',  450, 165, { role: 'leaving_group' }),
          mk('h1',     'H',   350,  65, { role: 'h_substituent' }),
          mk('h2',     'H',   278, 235, { role: 'h_substituent' }),
          mk('r',      'R',   250, 165, { role: 'r_group' }),
          mk('hbr',    'HBr', 565, 100, { role: 'acid' }),
        ],
        bonds: [
          bd('center-oh', 'center', 'oh', 1),
          bd('center-h1', 'center', 'h1', 1),
          bd('center-h2', 'center', 'h2', 1, 'dash-wedge'),
          bd('center-r',  'center', 'r',  1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'hbr' },
          to:   { kind: 'atom', id: 'oh' },
          color: 'var(--c-alkali)',
        }],
        description: 'HBr protonates the OH group → OH₂⁺ (a much better leaving group than OH⁻). Br⁻ is now free to act as the nucleophile.',
        shortLabel: 'Alcohol + HBr',
      },
      {
        // Protonated (OH₂⁺) intermediate
        atoms: [
          mk('center', 'C',    350, 165, { role: 'alpha_carbon' }),
          mk('oh2',    'OH₂⁺', 450, 165, { charge: '+', role: 'leaving_group', glow: true }),
          mk('h1',     'H',    350,  65, { role: 'h_substituent' }),
          mk('h2',     'H',    278, 235, { role: 'h_substituent' }),
          mk('r',      'R',    250, 165, { role: 'r_group' }),
          mk('br',     'Br⁻',  570, 165, { charge: '−', role: 'nucleophile' }),
        ],
        bonds: [
          bd('center-oh2', 'center', 'oh2', 1),
          bd('center-h1',  'center', 'h1',  1),
          bd('center-h2',  'center', 'h2',  1, 'dash-wedge'),
          bd('center-r',   'center', 'r',   1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'br' },
          to:   { kind: 'atom', id: 'center' },
          color: 'var(--c-alkali)',
        }],
        description: 'OH₂⁺ is an excellent leaving group. For a 1° alcohol: Br⁻ attacks the back face (SN2) → inversion. For 3°: H₂O leaves first → carbocation → Br⁻ from either face (SN1, racemization).',
        shortLabel: 'OH₂⁺ (activated)',
      },
      {
        // Alkyl bromide product (inverted config from SN2)
        atoms: [
          mk('center', 'C',  350, 165, { role: 'alpha_carbon' }),
          mk('br',     'Br', 450, 165),
          mk('h1',     'H',  350,  65, { role: 'h_substituent' }),
          mk('h2',     'H',  422, 235, { role: 'h_substituent' }),
          mk('r',      'R',  250, 165, { role: 'r_group' }),
        ],
        bonds: [
          bd('center-br', 'center', 'br', 1),
          bd('center-h1', 'center', 'h1', 1),
          bd('center-h2', 'center', 'h2', 1, 'wedge'),
          bd('center-r',  'center', 'r',  1),
        ],
        arrows: [],
        description: 'Alkyl bromide product. SN2 (1° substrate): inverted configuration (Walden inversion). SN1 (3° substrate): racemic mixture. SOCl₂/PBr₃ give clean SN2 inversion regardless of substrate class.',
        shortLabel: 'Alkyl bromide',
      },
    ],
    energyDiagram: [
      { label: 'Alcohol + HBr', energy: 42 },
      { label: 'TS',             energy: 78, isTransitionState: true },
      { label: 'R-Br + H₂O',    energy: 22 },
    ],
  },

  // ── 4. Swern Oxidation ───────────────────────────────────────────────────────
  {
    id: 'swern-oxidation',
    category: 'alcohol',
    name: 'Swern Oxidation',
    summary: 'DMSO activated by oxalyl chloride oxidizes 1° alcohols to aldehydes at −78 °C. Very mild — no over-oxidation, no metal waste, compatible with sensitive functional groups.',
    reactants: '1° Alcohol',
    products: 'Aldehyde',
    conditions: '(COCl)₂ then DMSO; then alcohol; then Et₃N; CH₂Cl₂, −78 °C',
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      '−78 °C: prevents side reactions (Pummerer rearrangement, over-oxidation)',
      'DMSO/(COCl)₂ forms chlorosulfonium ion — the activated DMSO that reacts with the alcohol',
      '1° → aldehyde only: conditions are too mild to oxidize the aldehyde further',
      'No chromium waste: cleaner than PCC/Jones; preferred in industry and pharma for sensitivity',
      'Et₃N (base) deprotonates in the last step, triggering [2,3]-sigmatropic elimination → aldehyde',
    ],
    brownRef: 'Ch 16.4',
    relatedReactions: ['alcohol-oxidation'],
    tags: ['oxidation', 'Swern', 'DMSO', 'aldehyde', 'mild', 'chromium-free', '−78 °C'],
    frames: [
      {
        // 1° alcohol: R-CH₂OH, simple layout
        atoms: [
          mk('r',    'R',    200, 165, { role: 'r_group' }),
          mk('c',    'C',    340, 165, { role: 'alpha_carbon' }),
          mk('oh',   'OH',   480, 165, { role: 'leaving_group' }),
          mk('h1',   'H',    340,  65, { role: 'h_substituent' }),
          mk('h2',   'H',    340, 265, { role: 'h_substituent' }),
          mk('dmso', 'DMSO', 490, 275, { label: '(COCl)₂/DMSO, −78 °C', role: 'electrophile' }),
        ],
        bonds: [
          bd('r-c',  'r', 'c',  1),
          bd('c-oh', 'c', 'oh', 1),
          bd('c-h1', 'c', 'h1', 1),
          bd('c-h2', 'c', 'h2', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'dmso' },
          to:   { kind: 'atom', id: 'oh' },
          color: 'var(--c-tm)',
        }],
        description: '(COCl)₂ activates DMSO at −78 °C → chlorosulfonium ion (Me₂S⁺Cl). The alcohol oxygen attacks sulfur → alkoxy sulfonium intermediate.',
        shortLabel: '1° Alcohol',
      },
      {
        // Alkoxy sulfonium intermediate: O bonded to DMSO, + on DMSO
        atoms: [
          mk('r',    'R',      200, 165, { role: 'r_group' }),
          mk('c',    'C',      340, 165, { role: 'alpha_carbon' }),
          mk('o',    'O',      480, 165),
          mk('dmso', 'SMe₂',  610, 165, { charge: '+', glow: true }),
          mk('h1',   'H',      340,  65, { role: 'h_substituent' }),
          mk('h2',   'H',      340, 265, { role: 'h_substituent' }),
        ],
        bonds: [
          bd('r-c',    'r',  'c',    1),
          bd('c-o',    'c',  'o',    1),
          bd('o-dmso', 'o',  'dmso', 1),
          bd('c-h1',   'c',  'h1',   1),
          bd('c-h2',   'c',  'h2',   1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'h1' },
          to:   { kind: 'atom', id: 'o' },
          color: 'var(--c-halogen)',
        }],
        description: 'Alkoxy sulfonium intermediate. Et₃N (Hünig\'s base equivalent) will now remove the α-H. The C–H electrons form the C=O bond and Me₂S departs as a neutral leaving group.',
        shortLabel: 'Alkoxy sulfonium',
      },
      {
        // Aldehyde product
        atoms: [
          mk('r', 'R',  200, 165, { role: 'r_group' }),
          mk('c', 'C',  340, 165, { role: 'carbonyl_carbon' }),
          mk('o', 'O',  340,  55, { role: 'carbonyl_oxygen' }),
          mk('h', 'H',  480, 165),
        ],
        bonds: [
          bd('r-c', 'r', 'c', 1),
          bd('c-o', 'c', 'o', 2),
          bd('c-h', 'c', 'h', 1),
        ],
        arrows: [],
        description: 'Aldehyde product (R-CHO). Me₂S departs as a stable neutral byproduct. No over-oxidation because conditions are too mild. The reaction is done at −78 °C then warmed up — classic "Swern" profile.',
        shortLabel: 'Aldehyde',
      },
    ],
    energyDiagram: [
      { label: 'Alcohol',       energy: 45 },
      { label: 'Intermediate',  energy: 55 },
      { label: 'TS',            energy: 68, isTransitionState: true },
      { label: 'Aldehyde',      energy: 20 },
    ],
  },

  // ── 5. Tosylate Formation ─────────────────────────────────────────────────────
  {
    id: 'tosylate-formation',
    category: 'alcohol',
    name: 'Tosylate / Mesylate Formation',
    summary: 'TsCl or MsCl converts the OH of an alcohol to a tosylate (OTs) or mesylate (OMs) — excellent leaving groups. The C–O bond is NOT broken, so stereochemistry is RETAINED at carbon.',
    reactants: 'Alcohol + TsCl (or MsCl)',
    products: 'Tosylate ester (R-OTs)',
    conditions: 'TsCl or MsCl, pyridine (or Et₃N); CH₂Cl₂; 0 °C to rt; 3° alcohols fail (steric)',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: 'retention',
    intermediate: null,
    importantInfo: [
      'The C–O bond is NOT broken during tosylation — only the O–H bond breaks → RETENTION at carbon',
      'Key concept: tosylation retains; subsequent SN2 inverts → net inversion of the original alcohol',
      'OTs and OMs are among the best leaving groups (pKa of TsOH ≈ −1)',
      '3° alcohols cannot be tosylated (too hindered for TsCl approach)',
      'TfCl (triflate) is even better leaving group (pKa of TfOH ≈ −14)',
    ],
    brownRef: 'Ch 10.7, pp. 444-446',
    relatedReactions: ['sn2', 'alcohol-to-halide'],
    tags: ['substitution', 'tosylate', 'mesylate', 'leaving group', 'retention', 'TsCl', 'OTs'],
    frames: [
      {
        // Alcohol: center C with OH(right), H(wedge), R1(top), R2(left)
        atoms: [
          mk('center', 'C',    350, 165, { role: 'alpha_carbon' }),
          mk('oh',     'OH',   450, 165, { role: 'nucleophile' }),
          mk('h',      'H',    422, 235, { role: 'h_substituent' }),
          mk('r1',     'R',    350,  65, { role: 'r_group' }),
          mk('r2',     'R′',   250, 165, { role: 'r_group' }),
          mk('tscl',  'TsCl', 565, 100, { label: 'TsCl/pyridine', role: 'electrophile' }),
        ],
        bonds: [
          bd('center-oh', 'center', 'oh', 1),
          bd('center-h',  'center', 'h',  1, 'wedge'),
          bd('center-r1', 'center', 'r1', 1),
          bd('center-r2', 'center', 'r2', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'oh' },
          to:   { kind: 'atom', id: 'tscl' },
          color: 'var(--c-alkali)',
        }],
        description: 'Alcohol oxygen attacks the sulfur of TsCl (SN2 at S). Pyridine removes the O–H proton. Only the O–H bond is broken — the C–O bond is NOT touched. Configuration at carbon is RETAINED.',
        shortLabel: 'Alcohol + TsCl',
      },
      {
        // Tosylate ester: same C but OTs instead of OH
        atoms: [
          mk('center', 'C',   350, 165, { role: 'alpha_carbon' }),
          mk('ots',    'OTs', 450, 165),
          mk('h',      'H',   422, 235, { role: 'h_substituent' }),
          mk('r1',     'R',   350,  65, { role: 'r_group' }),
          mk('r2',     'R′',  250, 165, { role: 'r_group' }),
        ],
        bonds: [
          bd('center-ots', 'center', 'ots', 1),
          bd('center-h',   'center', 'h',   1, 'wedge'),
          bd('center-r1',  'center', 'r1',  1),
          bd('center-r2',  'center', 'r2',  1),
        ],
        arrows: [],
        description: 'Tosylate ester (R-OTs). Config at C retained (wedge unchanged). OTs is an outstanding leaving group. Subsequent SN2 with Nu⁻ inverts → net inversion from the original alcohol. MsCl (mesylate) follows the same logic.',
        shortLabel: 'Tosylate ester',
      },
    ],
    energyDiagram: [
      { label: 'Alcohol + TsCl', energy: 42 },
      { label: 'TS',              energy: 68, isTransitionState: true },
      { label: 'Tosylate ester',  energy: 22 },
    ],
  },

  // ── 6. Ether Cleavage ─────────────────────────────────────────────────────────
  {
    id: 'ether-cleavage',
    category: 'ether_epoxide',
    name: 'Ether Cleavage with HX',
    summary: 'Excess HX cleaves ethers at high temperature. Simple ethers (1°/2°) undergo SN2 at the less hindered carbon. 3°/benzylic/allylic ethers go SN1. HI is most reactive; HCl and HF are too weak.',
    reactants: 'Ether + excess HX (Δ)',
    products: '2 Alkyl halides (or alcohol + halide with 1 eq HX)',
    conditions: 'Excess HX (HI > HBr >> HCl); heat; HI or HBr required (HCl/HF too weak)',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Step 1: H⁺ protonates the ether O (O becomes a better leaving group as OH)',
      '1°/2° ethers: SN2 on the LESS hindered alkyl group (X⁻ attacks smaller R)',
      '3°/benzylic/allylic: SN1 (carbocation more stable)',
      'HI > HBr >> HCl: I⁻ and Br⁻ are good nucleophiles; Cl⁻ is too weak; HF does not work',
      'With 1 eq HX: one alcohol + one halide; with excess HX: both sides become halides',
    ],
    brownRef: 'Ch 11.5, pp. 466-470',
    relatedReactions: ['sn1', 'sn2', 'alcohol-to-halide'],
    tags: ['substitution', 'ether', 'cleavage', 'HI', 'HBr', 'SN1', 'SN2'],
    frames: [
      {
        // R-O-R′ ether + HX
        atoms: [
          mk('r1', 'R',   160, 145, { role: 'r_group' }),
          mk('o',  'O',   305, 145, { role: 'leaving_group' }),
          mk('r2', "R′",  450, 145, { role: 'r_group' }),
          mk('hx', 'HX',  310,  45, { label: 'excess HX', role: 'electrophile' }),
        ],
        bonds: [
          bd('r1-o', 'r1', 'o',  1),
          bd('o-r2', 'o',  'r2', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'hx' },
          to:   { kind: 'atom', id: 'o' },
          color: 'var(--c-alkali)',
        }],
        description: 'H⁺ protonates the ether oxygen → oxonium ion (O now a leaving group). This is the same first step as alcohol protonation. HI and HBr are required — HCl is too weak (Cl⁻ is a poor nucleophile for this reaction).',
        shortLabel: 'Ether + HX',
      },
      {
        // Oxonium ion: O protonated (charged), H bonded to O from above
        atoms: [
          mk('r1', 'R',  160, 145, { role: 'r_group' }),
          mk('o',  'O',  305, 145, { charge: '+', glow: true, role: 'leaving_group' }),
          mk('r2', "R′", 450, 145, { role: 'r_group' }),
          mk('h',  'H',  305,  50),
          mk('x',  'X⁻', 575, 145, { charge: '−', role: 'nucleophile' }),
        ],
        bonds: [
          bd('r1-o', 'r1', 'o', 1),
          bd('o-r2', 'o',  'r2',1),
          bd('o-h',  'o',  'h', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'x' },
          to:   { kind: 'atom', id: 'r2' },
          color: 'var(--c-halogen)',
        }],
        description: 'Oxonium ion: O now has + charge, making C–O bonds much weaker. X⁻ attacks the less hindered carbon by SN2 (or the tertiary carbon by SN1 if R′ is 3°).',
        shortLabel: 'Oxonium ion',
      },
      {
        // Products: R-X + R′-OH
        atoms: [
          mk('r1', 'R',   175, 145, { role: 'r_group' }),
          mk('x',  'X',   320, 145),
          mk('r2', "R′",  440, 145, { role: 'r_group' }),
          mk('oh', 'OH',  585, 145),
        ],
        bonds: [
          bd('r1-x',  'r1', 'x',  1),
          bd('r2-oh', 'r2', 'oh', 1),
        ],
        arrows: [],
        description: 'Products: alkyl halide (R–X) + alcohol (R′–OH). With excess HX, the alcohol is also converted to halide. SN2 at the less hindered C gives inversion; SN1 (3°, benzylic) gives racemization. HI is most reactive.',
        shortLabel: 'R-X + R′-OH',
      },
    ],
    energyDiagram: [
      { label: 'Ether + HX', energy: 42 },
      { label: 'Oxonium',    energy: 50 },
      { label: 'TS',         energy: 72, isTransitionState: true },
      { label: 'R-X + ROH', energy: 20 },
    ],
  },

  // ── 7. TMS Protection ─────────────────────────────────────────────────────────
  {
    id: 'tms-protection',
    category: 'alcohol',
    name: 'TMS Protection of Alcohols',
    summary: 'TMSCl (trimethylsilylchloride) reacts with an alcohol to form a TMS ether (R-O-TMS), protecting the OH group. Deprotection is easy: F⁻ (TBAF) or mild acid selectively cleaves the Si–O bond.',
    reactants: 'Alcohol + TMSCl',
    products: 'TMS ether (R-OTMS)',
    conditions: 'TMSCl, Et₃N (or imidazole), CH₂Cl₂; rt; deprotect with TBAF (Bu₄NF) or 1% HF/MeOH',
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: 'retention',
    intermediate: null,
    importantInfo: [
      'Protects alcohol as TMS ether: OH → OTMS; stable to most bases, mild acids, and organometallics',
      'Removed by F⁻ (TBAF): Si–F bond is very strong (→ fluoride attacks Si, not C)',
      'Complementary to acetal protection (protects C=O). Together cover both common protecting groups',
      'More hindered TBS (tBuMe₂Si) or TES (Et₃Si) protect better; require stronger conditions to remove',
      'Silyl ethers also removed by mild aqueous acid (pH ≈ 2, H₂O/THF) — milder than carbon ethers',
    ],
    brownRef: 'Ch 16.7',
    relatedReactions: ['tosylate-formation', 'alcohol-to-halide'],
    tags: ['protection', 'TMS', 'silyl ether', 'OTMS', 'TMSCl', 'TBAF', 'F⁻', 'deprotection'],
    frames: [
      {
        // Alcohol: center C with OH(right), H(top), R1(left), R2(wedge)
        atoms: [
          mk('center', 'C',     350, 165, { role: 'alpha_carbon' }),
          mk('oh',     'OH',    450, 165, { role: 'nucleophile' }),
          mk('h',      'H',     350,  65, { role: 'h_substituent' }),
          mk('r1',     'R',     250, 165, { role: 'r_group' }),
          mk('r2',     "R′",    422, 235, { role: 'r_group' }),
          mk('tmscl', 'TMSCl', 565, 100, { label: 'TMSCl/Et₃N', role: 'electrophile' }),
        ],
        bonds: [
          bd('center-oh', 'center', 'oh', 1),
          bd('center-h',  'center', 'h',  1),
          bd('center-r1', 'center', 'r1', 1),
          bd('center-r2', 'center', 'r2', 1, 'wedge'),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'oh' },
          to:   { kind: 'atom', id: 'tmscl' },
          color: 'var(--c-alkali)',
        }],
        description: 'Alcohol oxygen attacks Si of TMSCl (SN2 at silicon). Cl⁻ leaves. Et₃N deprotonates the oxonium. Only the O–H bond is broken — C–O bond intact → retention at carbon.',
        shortLabel: 'Alcohol + TMSCl',
      },
      {
        // TMS ether product: OTMS replaces OH, same config
        atoms: [
          mk('center', 'C',    350, 165, { role: 'alpha_carbon' }),
          mk('otms',   'OTMS', 450, 165),
          mk('h',      'H',    350,  65, { role: 'h_substituent' }),
          mk('r1',     'R',    250, 165, { role: 'r_group' }),
          mk('r2',     "R′",   422, 235, { role: 'r_group' }),
        ],
        bonds: [
          bd('center-otms', 'center', 'otms', 1),
          bd('center-h',    'center', 'h',    1),
          bd('center-r1',   'center', 'r1',   1),
          bd('center-r2',   'center', 'r2',   1, 'wedge'),
        ],
        arrows: [],
        description: 'TMS ether (R-OTMS). Configuration retained (wedge unchanged). Stable to most bases and organometallic reagents. Deprotection: TBAF (F⁻) attacks Si → very strong Si–F bond drives cleavage → alcohol regenerated with retention.',
        shortLabel: 'TMS ether',
      },
    ],
    energyDiagram: [
      { label: 'Alcohol + TMSCl', energy: 42 },
      { label: 'TS',               energy: 65, isTransitionState: true },
      { label: 'TMS ether',        energy: 18 },
    ],
  },
]

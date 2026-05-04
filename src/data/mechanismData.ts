// Mechanism reference data for organic chemistry.
// Each ReactionDef covers one named reaction/mechanism type.
// Reference: Brown/Iverson/Anslyn, Organic Chemistry 9e (2023).

export type Category =
  | 'sn_e'           // SN1, SN2, E1, E2 — alkyl halide reactions
  | 'alkene'         // Alkene addition reactions
  | 'alkyne'         // Alkyne reactions
  | 'aromatic'       // EAS + SNAr + benzyne
  | 'alcohol'        // Alcohol synthesis and reactions
  | 'ether_epoxide'  // Ethers, Williamson, epoxide opening
  | 'carbonyl'       // Aldehydes, ketones, nucleophilic addition
  | 'enolate'        // Enolate chemistry, aldol, Claisen
  | 'organometallic' // Grignard, organolithium, Gilman
  | 'radical'        // Radical halogenation, NBS
  | 'amine'          // Amine synthesis, diazonium
  | 'carboxylic'     // Carboxylic acids and derivatives

export const CATEGORY_LABELS: Record<Category, string> = {
  sn_e:           'SN/E',
  alkene:         'Alkenes',
  alkyne:         'Alkynes',
  aromatic:       'Aromatic',
  alcohol:        'Alcohols',
  ether_epoxide:  'Ethers / Epoxides',
  carbonyl:       'Carbonyls',
  enolate:        'Enolates',
  organometallic: 'Organometallic',
  radical:        'Radical',
  amine:          'Amines',
  carboxylic:     'Carboxylic',
}

export interface MechanismStep {
  label: string          // "Step 1: Ionization" or "Step 1 (only step): Backside Attack"
  description: string    // Full explanation of what happens
  note?: string          // Optional key note, tip, or textbook connection
}

export interface ReactionDef {
  id: string
  category: Category
  name: string
  abbr?: string               // Short label: "SN2", "E2", etc.
  reactants: string           // Human-readable: "1°R-X + Nu:⁻"
  conditions: string          // "Polar aprotic solvent; strong nucleophile"
  product: string             // "Nu-R + X⁻ (inverted config)"
  mechanismType: string       // "Bimolecular, concerted" | "Stepwise, carbocation intermediate" etc.
  intermediate: string | null // "Carbocation (sp², planar)" | null
  regiochemistry: string | null
  stereochemistry: string | null
  steps: MechanismStep[]
  keyRules: string[]
  brownRef: string            // "Brown 9e, Ch 9.3, p. 347"
  relatedIds: string[]        // Other reaction IDs to link
}

// ── SN/E Reactions ────────────────────────────────────────────────────────────

const SN2: ReactionDef = {
  id: 'sn2',
  category: 'sn_e',
  name: 'Nucleophilic Substitution (SN2)',
  abbr: 'SN2',
  reactants: '1°R-X (or CH₃X) + Nu:⁻',
  conditions: 'Polar aprotic solvent (DMF, DMSO, acetone); strong nucleophile',
  product: 'Nu-R + X⁻ — inverted configuration',
  mechanismType: 'Bimolecular, concerted — one transition state, no intermediate',
  intermediate: null,
  regiochemistry: null,
  stereochemistry: 'Inversion of configuration (Walden inversion)',
  steps: [
    {
      label: 'Step 1 (only step): Backside Attack',
      description:
        'Nu:⁻ approaches the electrophilic carbon from directly behind the C–LG bond (180° anti to the leaving group). ' +
        'As the Nu–C bond forms, the C–LG bond breaks simultaneously. ' +
        'The transition state is trigonal bipyramidal with Nu and LG both partially bonded: [Nu···C···LG]‡. ' +
        'The carbon center undergoes an "umbrella flip" — substituents invert like a flipped umbrella.',
      note:
        'Because attack and departure are simultaneous, there is no carbocation intermediate and no possibility of racemization. ' +
        'The product has strictly inverted configuration at the reaction center.',
    },
  ],
  keyRules: [
    'Substrate reactivity: CH₃X > 1° >> 2° (SN2 essentially impossible at 3° — too much steric hindrance)',
    'Polar aprotic solvents (DMF, DMSO, acetone, CH₃CN) do not solvate nucleophiles, keeping them "naked" and reactive',
    'Strong nucleophiles required: I⁻, Br⁻, CN⁻, N₃⁻, RS⁻, RO⁻, HO⁻, R₂NH',
    'Rate = k[substrate][nucleophile] — second-order kinetics (bimolecular)',
    'Good leaving groups: I⁻ > Br⁻ > Cl⁻ >> F⁻ (weaker C–X bond, better stabilized LG⁻)',
    'Inversion is 100% stereospecific — never gives retention or racemization',
  ],
  brownRef: 'Brown 9e, Ch 9.3, pp. 347–353',
  relatedIds: ['sn1', 'e2', 'e1'],
}

const SN1: ReactionDef = {
  id: 'sn1',
  category: 'sn_e',
  name: 'Nucleophilic Substitution (SN1)',
  abbr: 'SN1',
  reactants: '3°R-X (or 2°R-X, allylic, benzylic) + weak nucleophile or solvent',
  conditions: 'Polar protic solvent (H₂O, ROH, AcOH); weak nucleophile; ionizing conditions',
  product: 'Nu-R + X⁻ — racemic mixture (or partial racemization)',
  mechanismType: 'Unimolecular, stepwise — carbocation intermediate',
  intermediate: 'Carbocation (sp², planar, empty p orbital)',
  regiochemistry: 'Carbocation rearrangements possible (hydride or methyl shift → more stable cation)',
  stereochemistry: 'Racemization — nucleophile attacks planar carbocation from either face with ~equal probability; slight excess inversion from ion pair',
  steps: [
    {
      label: 'Step 1 (RDS): Ionization → Carbocation Formation',
      description:
        'C–LG bond ionizes: LG⁻ departs with both bonding electrons → tertiary carbocation R₃C⁺ forms. ' +
        'This is the rate-determining step (slowest). ' +
        'The carbocation is sp² hybridized — flat, trigonal planar, with an empty p orbital perpendicular to the three substituents. ' +
        'Polar protic solvents stabilize both the developing cation (by solvating it) and the departing LG⁻.',
      note:
        'Only this step appears in the rate law: Rate = k[R-X]. The nucleophile concentration does not appear because it reacts after the RDS.',
    },
    {
      label: 'Step 2 (optional): Carbocation Rearrangement',
      description:
        'If a more stable carbocation can form by a 1,2-hydride shift or 1,2-methyl shift, rearrangement occurs. ' +
        'Example: a 2° carbocation adjacent to a more hindered carbon rearranges to a 3° carbocation. ' +
        'This is NOT a step in every SN1 — it occurs only when rearrangement leads to greater cation stability.',
      note: 'Rearrangements are the diagnostic feature distinguishing SN1 from SN2 (which cannot rearrange).',
    },
    {
      label: 'Step 3: Nucleophilic Attack',
      description:
        'The nucleophile (or solvent molecule) attacks the planar, sp² carbocation from either face with approximately equal probability. ' +
        'Top-face attack → one enantiomer; bottom-face attack → the other. ' +
        'Result: ≈ racemic mixture (some excess inversion due to ion-pair shielding of the front face by departing LG⁻).',
      note:
        'If the carbocation is stabilized by resonance (allylic, benzylic), attack can occur at multiple positions, giving a mixture of constitutional isomers.',
    },
  ],
  keyRules: [
    'Substrate reactivity: 3° >> 2° >> 1° (carbocation stability drives the reaction)',
    'Allylic and benzylic substrates react via SN1 even at 1° and 2° (resonance-stabilized carbocations)',
    'Polar protic solvents (H₂O, MeOH, EtOH, AcOH) stabilize the ionic intermediates',
    'Weak nucleophiles: H₂O, ROH, or anions that don\'t strongly favor backside attack',
    'Rate = k[substrate] — first-order kinetics (only substrate in RDS)',
    'Products: racemic (or partially racemized) — never 100% inverted',
    'Carbocation rearrangements are possible (unlike SN2)',
  ],
  brownRef: 'Brown 9e, Ch 9.4, pp. 355–364',
  relatedIds: ['sn2', 'e1', 'e2'],
}

const E2: ReactionDef = {
  id: 'e2',
  category: 'sn_e',
  name: 'Elimination (E2)',
  abbr: 'E2',
  reactants: '2° or 3° alkyl halide + strong base',
  conditions: 'Strong base (NaOH, KOH, NaOEt, LDA, KOtBu); usually high temperature; polar aprotic or protic solvent',
  product: 'Alkene + B-H + X⁻',
  mechanismType: 'Bimolecular, concerted — one transition state, no intermediate',
  intermediate: null,
  regiochemistry: 'Zaitsev\'s rule: major product = more substituted (more stable) alkene. Bulky base (KOtBu) → Hofmann product (less substituted)',
  stereochemistry: 'Anti-periplanar requirement: β-H and LG must be 180° apart (both axial in cyclohexane). Gives predominantly trans (E) alkene when applicable',
  steps: [
    {
      label: 'Step 1 (only step): Concerted Anti-Elimination',
      description:
        'Base (B:) approaches a β-hydrogen — the H on the carbon adjacent to the carbon bearing the leaving group (Cβ). ' +
        'The β-H and LG must be anti-periplanar (180° dihedral angle) — this is a strict geometric requirement. ' +
        'In one concerted step: (1) B abstracts the β-H, forming B-H; (2) the C–H electrons flow into the forming π bond between Cα and Cβ; (3) the C–LG bond breaks and LG⁻ departs. ' +
        'Zaitsev\'s rule: the base preferentially abstracts the β-H that produces the more substituted (thermodynamically more stable) alkene.',
      note:
        'In a cyclohexane ring: elimination requires both the H (on Cβ) and LG (on Cα) to be in axial positions. ' +
        'Equatorial H cannot eliminate with axial LG under E2 conditions (wrong dihedral angle).',
    },
  ],
  keyRules: [
    'Anti-periplanar geometry required: β-H and LG must be 180° apart (strictly stereospecific)',
    'Zaitsev\'s rule: major product is the more substituted alkene (more hyperconjugation/stability)',
    'Bulky base (KOtBu) gives Hofmann (less hindered) product instead of Zaitsev',
    'Rate = k[substrate][base] — second-order kinetics',
    'Competes with SN2 for 2° substrates; dominates for 3° with strong base',
    'Temperature: higher temperature favors elimination over substitution (ΔS > 0 for elimination)',
    'LDA and other strong non-nucleophilic bases favor E2 exclusively',
  ],
  brownRef: 'Brown 9e, Ch 9.7, pp. 374–381',
  relatedIds: ['e1', 'sn2', 'sn1', 'sn-e-competition'],
}

const E1: ReactionDef = {
  id: 'e1',
  category: 'sn_e',
  name: 'Elimination (E1)',
  abbr: 'E1',
  reactants: '3° alkyl halide + weak base (or just heat/solvent)',
  conditions: 'Polar protic solvent; moderate-to-high temperature; weak base or solvent as base',
  product: 'Alkene (Zaitsev major) + X⁻ + B-H',
  mechanismType: 'Unimolecular, stepwise — carbocation intermediate (shared with SN1)',
  intermediate: 'Carbocation (sp², planar) — same as SN1 Step 1',
  regiochemistry: 'Zaitsev\'s rule: more substituted alkene is major product',
  stereochemistry: 'Less stereospecific than E2; can give both cis and trans alkenes (geometric isomers), though trans is usually preferred',
  steps: [
    {
      label: 'Step 1 (RDS): Ionization → Carbocation Formation',
      description:
        'C–LG bond ionizes: LG⁻ departs with both bonding electrons → tertiary carbocation forms (rate-determining step). ' +
        'This step is identical to SN1 Step 1. Both SN1 and E1 proceed through the same carbocation — the selectivity for substitution vs. elimination is determined afterward.',
      note: 'Rate = k[substrate] — first-order, only substrate in RDS.',
    },
    {
      label: 'Step 2: Proton Transfer to Base',
      description:
        'A weak base (solvent, weak base, H₂O, ROH) abstracts a β-hydrogen from the carbocation. ' +
        'The electrons from the C–H bond flow into the empty p orbital of the carbocation, forming the π bond. ' +
        'Zaitsev\'s rule: the β-H removed is the one that gives the more substituted, more stable alkene.',
      note:
        'Unlike E2, there is NO anti-periplanar requirement. The carbocation is sp² and the p orbital is available from either face, so geometric isomer ratios depend on product stability, not reactant geometry.',
    },
  ],
  keyRules: [
    'Competes with SN1 (both go through the same carbocation intermediate)',
    'Higher temperature favors E1 over SN1 (elimination has more positive ΔS)',
    'Polar protic solvents; weak base (H₂O, ROH) can act as the base',
    'Zaitsev\'s rule applies — major product is the more substituted alkene',
    'No stereospecificity requirement (carbocation is sp², base can abstract any β-H)',
    'Rate = k[substrate] — first-order kinetics',
    'Carbocation rearrangements possible (as in SN1)',
  ],
  brownRef: 'Brown 9e, Ch 9.6, pp. 370–374',
  relatedIds: ['sn1', 'e2', 'sn-e-competition'],
}

const SN_E_COMPETITION: ReactionDef = {
  id: 'sn-e-competition',
  category: 'sn_e',
  name: 'SN1 / SN2 / E1 / E2 Competition',
  abbr: 'Competition',
  reactants: 'Alkyl halide R-X + nucleophile/base',
  conditions: 'Depends on substrate, nucleophile/base strength, solvent, and temperature',
  product: 'SN product (substitution) or alkene (elimination) — depends on conditions',
  mechanismType: 'Multiple competing pathways',
  intermediate: 'Carbocation for SN1/E1 | None for SN2/E2',
  regiochemistry: 'If elimination occurs: Zaitsev rule (more substituted alkene)',
  stereochemistry: 'SN2/E2: stereospecific | SN1/E1: stereochemistry mixed',
  steps: [
    {
      label: 'Decision 1: Substrate structure',
      description:
        'CH₃X, 1°: → SN2 only (too little stabilization for cation; too unhindered for E2 with base)\n' +
        '2°: → SN2 (strong Nu, polar aprotic) or E2 (strong base) or SN1/E1 (polar protic, weak Nu)\n' +
        '3°: → SN1/E1 (polar protic) or E2 (strong base — SN2 impossible, too hindered)\n' +
        'Allylic/benzylic: → SN1 or E1 (resonance-stabilized carbocation)',
    },
    {
      label: 'Decision 2: Nucleophile/Base strength',
      description:
        'Strong nucleophile + weak base (e.g., I⁻, CN⁻, RS⁻): → SN2\n' +
        'Strong base (e.g., NaOEt, KOtBu, LDA): → E2\n' +
        'Weak nucleophile + weak base (e.g., H₂O, ROH): → SN1/E1 (especially 3° substrates)',
    },
    {
      label: 'Decision 3: Solvent',
      description:
        'Polar aprotic (DMF, DMSO, acetone, CH₃CN): → favors SN2 and E2\n' +
        'Polar protic (H₂O, MeOH, EtOH): → favors SN1 and E1\n' +
        '(Polar protic solvents solvate Nu:, reducing its reactivity; they also stabilize ionic intermediates)',
    },
    {
      label: 'Decision 4: Temperature',
      description:
        'Higher temperature → more elimination (SN1→E1; SN2→E2)\n' +
        'Elimination has larger +ΔS (2 → 3 molecules), so high T shifts equilibrium toward E products.\n' +
        'Low temperature generally favors substitution.',
    },
  ],
  keyRules: [
    'CH₃X: SN2 only (no competition)',
    '1°R-X + strong Nu, polar aprotic: SN2',
    '2°R-X + strong Nu, polar aprotic: SN2 (with some E2)',
    '2°R-X + strong base: E2 > SN2',
    '3°R-X + strong base: E2 only (SN2 impossible)',
    '3°R-X + weak Nu, polar protic, warm: SN1 + E1 mixture',
    'High temperature: shifts SN1→E1 and SN2→E2',
    'Bulky base (KOtBu): E2 with Hofmann product',
  ],
  brownRef: 'Brown 9e, Ch 9.8–9.9, pp. 381–395',
  relatedIds: ['sn1', 'sn2', 'e1', 'e2'],
}

// ── Alkene Reactions ──────────────────────────────────────────────────────────

const HX_ADDITION: ReactionDef = {
  id: 'hx-addition',
  category: 'alkene',
  name: 'Hydrohalogenation of Alkenes (Markovnikov)',
  abbr: 'HX addition',
  reactants: 'Alkene + HX (HCl, HBr, HI)',
  conditions: 'No solvent needed (neat), or polar solvent; no peroxides',
  product: 'Alkyl halide — Markovnikov addition (X on more substituted carbon)',
  mechanismType: 'Electrophilic addition — stepwise through carbocation intermediate',
  intermediate: 'Carbocation — more stable (more substituted) regioisomer',
  regiochemistry: 'Markovnikov\'s rule: H adds to the less substituted carbon (more H\'s); X adds to the more substituted carbon (more stable carbocation)',
  stereochemistry: 'Racemization at the new stereocenter (carbocation is sp², attacked from either face)',
  steps: [
    {
      label: 'Step 1 (RDS): Protonation of the Alkene → Carbocation',
      description:
        'H⁺ (from HX) attacks the π bond of the alkene. ' +
        'The π electrons act as the nucleophile and attack H⁺. ' +
        'The proton adds to the less substituted carbon (Markovnikov), forming the more substituted (more stable) carbocation. ' +
        'This is the rate-determining step.',
      note: 'Markovnikov\'s rule follows from carbocation stability: 3° > 2° > 1° > CH₃⁺. The H adds where it generates the most stable cation.',
    },
    {
      label: 'Step 2: Halide Captures Carbocation',
      description:
        'X⁻ (halide counterion) attacks the planar carbocation from either face. ' +
        'Attack from top or bottom face with equal probability → racemization at new stereocenter. ' +
        'Product is the Markovnikov alkyl halide.',
      note: 'If the carbocation can rearrange to a more stable cation (hydride/methyl shift), it will — giving a rearranged product.',
    },
  ],
  keyRules: [
    'Markovnikov\'s rule: X goes to the more substituted carbon (where the + charge was most stable)',
    'H goes to the carbon with more hydrogens (Markovnikov mnemonic: "rich get richer")',
    'Carbocation intermediate → racemization; rearrangements possible',
    'HI > HBr > HCl in reactivity (HI gives most reactive carbocation; HF too weak)',
    'Anti-Markovnikov addition possible with HBr + peroxides (radical mechanism)',
    'Rate depends on alkene substitution: trisubstituted > disubstituted > monosubstituted',
  ],
  brownRef: 'Brown 9e, Ch 6.3, pp. 224–231',
  relatedIds: ['acid-hydration', 'alkene-halogenation', 'hydroboration', 'anti-mark-hbr'],
}

const ACID_HYDRATION: ReactionDef = {
  id: 'acid-hydration',
  category: 'alkene',
  name: 'Acid-Catalyzed Hydration of Alkenes',
  abbr: 'H₂O addition',
  reactants: 'Alkene + H₂O',
  conditions: 'H₂SO₄ or H₃PO₄ catalyst; heat; aqueous conditions',
  product: 'Alcohol — Markovnikov addition (OH on more substituted carbon)',
  mechanismType: 'Electrophilic addition via carbocation — stepwise',
  intermediate: 'Carbocation (same as HX addition)',
  regiochemistry: 'Markovnikov: OH adds to more substituted carbon; H to less substituted',
  stereochemistry: 'Racemization at new stereocenter (carbocation attacked from either face)',
  steps: [
    {
      label: 'Step 1 (RDS): Protonation of Alkene by H⁺',
      description:
        'H⁺ (from strong acid catalyst) protonates the π bond, adding to the less substituted carbon. ' +
        'Forms the more stable (more substituted) carbocation — rate-determining step. ' +
        'Identical to HX addition Step 1.',
    },
    {
      label: 'Step 2: Water Captures Carbocation (Oxonium Ion Intermediate)',
      description:
        'A water molecule (lone pair) attacks the carbocation → forms protonated alcohol (oxonium ion, R-OH₂⁺). ' +
        'Water is a weak nucleophile but is present in large excess.',
    },
    {
      label: 'Step 3: Deprotonation',
      description:
        'Another water molecule (or base) abstracts a proton from R-OH₂⁺ → regenerates H⁺ (catalyst) and gives the neutral alcohol product.',
      note: 'The acid catalyst is regenerated in Step 3 — this is a true catalytic cycle. Acid-catalyzed hydration is the reverse of acid-catalyzed dehydration (Le Chatelier\'s principle).',
    },
  ],
  keyRules: [
    'Markovnikov: OH goes to more substituted carbon',
    'Acid catalyst required (H₂SO₄ or H₃PO₄) — not base',
    'Carbocation intermediate → possible rearrangements',
    'Reaction is reversible: excess H₂O drives hydration; high temp drives dehydration',
    'Oxymercuration-demercuration (Hg(OAc)₂ then NaBH₄) gives same Markovnikov product WITHOUT rearrangement',
  ],
  brownRef: 'Brown 9e, Ch 6.4, pp. 231–235',
  relatedIds: ['hx-addition', 'oxymercuration', 'hydroboration'],
}

const ALKENE_HALOGENATION: ReactionDef = {
  id: 'alkene-halogenation',
  category: 'alkene',
  name: 'Halogenation of Alkenes (X₂ Addition)',
  abbr: 'X₂ addition',
  reactants: 'Alkene + Br₂ or Cl₂',
  conditions: 'CH₂Cl₂ or CCl₄ solvent; no light (avoids radical reaction); room temperature',
  product: 'Vicinal dihalide (1,2-dihalide) — anti addition',
  mechanismType: 'Electrophilic addition via halonium ion intermediate',
  intermediate: 'Cyclic halonium ion (bridged three-membered ring with X⁺)',
  regiochemistry: 'Symmetric addition — no regiochemistry issue for Br₂/Cl₂ to alkene',
  stereochemistry: 'Anti addition — two X atoms add to opposite faces of the π bond (trans product for cyclic systems)',
  steps: [
    {
      label: 'Step 1: Halonium Ion Formation',
      description:
        'The electron-rich π bond attacks the Br–Br bond, polarizing it (Brδ+–Brδ⁻). ' +
        'The closer bromine acts as electrophile; the alkene pushes electrons onto it. ' +
        'Both carbons simultaneously form partial bonds to Br, creating a cyclic bromonium ion (three-membered ring: C–Br–C). ' +
        'The second Br departs as Br⁻.',
      note: 'The cyclic bromonium ion locks the geometry — attack must come from the face opposite to Br (anti). This is what forces anti addition.',
    },
    {
      label: 'Step 2: Anti Backside Attack by Br⁻',
      description:
        'Br⁻ (nucleophile) attacks one of the carbons of the bromonium ion from the back face (SN2-like). ' +
        'This forces trans (anti) addition: the two Br atoms end up on opposite faces. ' +
        'In a cyclic system (e.g., cyclohexene), this gives the trans-diaxial dihalide product.',
      note: 'Bromine decolorization is the classic lab test for C=C: orange Br₂ in CCl₄ → colorless. Iodine can be used similarly. Fluorine reacts explosively; iodine is reversible.',
    },
  ],
  keyRules: [
    'Anti addition: the two halogen atoms add to opposite faces (trans product)',
    'Bromonium ion intermediate explains anti stereochemistry (not an open carbocation)',
    'Br₂ in CCl₄: decolorization of orange-brown color is a positive test for unsaturation',
    'Can be used to open unsymmetrical: if done in water (Br₂/H₂O), nucleophile can be H₂O → bromohydrin (anti; Markovnikov OH)',
    'Cl₂ reacts similarly but more vigorously; F₂ explodes; I₂ is reversible',
  ],
  brownRef: 'Brown 9e, Ch 6.7, pp. 248–255',
  relatedIds: ['hx-addition', 'bromohydrin', 'epoxidation'],
}

const HYDROBORATION: ReactionDef = {
  id: 'hydroboration',
  category: 'alkene',
  name: 'Hydroboration-Oxidation',
  abbr: 'BH₃ / H₂O₂',
  reactants: 'Alkene + BH₃ (or 9-BBN); then H₂O₂/NaOH',
  conditions: 'Step 1: BH₃·THF or 9-BBN in THF; Step 2: H₂O₂, NaOH, H₂O',
  product: 'Alcohol — anti-Markovnikov addition (OH on less substituted carbon); syn addition',
  mechanismType: 'Syn addition via concerted 4-membered cyclic transition state (hydroboration); oxidation replaces B with OH',
  intermediate: 'Organoborane (R-B) — isolable but reacts with H₂O₂',
  regiochemistry: 'Anti-Markovnikov: B (and ultimately OH) goes to less substituted carbon; H to more substituted',
  stereochemistry: 'Syn addition — H and B add to the same face of the double bond; OH has same configuration as B',
  steps: [
    {
      label: 'Step 1: Hydroboration (concerted, syn)',
      description:
        'BH₃ reacts with the alkene in a single concerted step via a 4-membered cyclic transition state. ' +
        'B and H add simultaneously to the same face of the π bond (syn addition). ' +
        'B adds to the less hindered (less substituted) carbon — this is the regiochemistry. ' +
        'Reaction is repeated 3 times (each BH₃ hydroborates 3 equivalents of alkene) → trialkylborane R₃B.',
      note: 'Unlike Markovnikov reactions, there is NO carbocation intermediate, so no rearrangements occur.',
    },
    {
      label: 'Step 2: Oxidation (H₂O₂, NaOH)',
      description:
        'H₂O₂ (basic conditions) converts each C–B bond to a C–O bond with RETENTION of configuration. ' +
        'Mechanism: HO₂⁻ attacks B, then a 1,2-migration occurs (R migrates from B to O with retention), followed by hydrolysis.',
      note: 'Overall: net addition of H and OH (water) across the double bond. But anti-Markovnikov and syn — complementary to acid-catalyzed hydration (Markovnikov, racemization).',
    },
  ],
  keyRules: [
    'Anti-Markovnikov: OH ends up on the LESS substituted carbon (opposite to H₂SO₄/H₂O)',
    'Syn addition: H and OH are delivered to the same face',
    'No rearrangements (no carbocation intermediate)',
    'BH₃ is air-sensitive; use as BH₃·THF complex. 9-BBN is bulkier and more selective',
    'Oxidation with H₂O₂/NaOH completes the overall net reaction: alkene + H₂O → alcohol (anti-Markovnikov)',
    'Contrast with oxymercuration: same net result but Markovnikov (OH to more substituted C)',
  ],
  brownRef: 'Brown 9e, Ch 6.6, pp. 242–248',
  relatedIds: ['acid-hydration', 'hx-addition', 'alkene-halogenation'],
}

const EPOXIDATION: ReactionDef = {
  id: 'epoxidation',
  category: 'alkene',
  name: 'Epoxidation of Alkenes',
  abbr: 'mCPBA / RCO₃H',
  reactants: 'Alkene + peracid (mCPBA, RCO₃H, or H₂O₂/cat)',
  conditions: 'mCPBA in CH₂Cl₂; room temperature',
  product: 'Epoxide (3-membered ring ether) — syn addition of O',
  mechanismType: 'Concerted oxygen transfer — peracid delivers O atom to both carbons simultaneously',
  intermediate: null,
  regiochemistry: 'More substituted alkenes react faster (more electron-rich π bond)',
  stereochemistry: 'Syn addition: O adds to the same face; stereochemistry of the alkene is preserved in the epoxide (cis alkene → cis epoxide substituents)',
  steps: [
    {
      label: 'Step 1 (only step): Concerted Oxygen Transfer',
      description:
        'The peracid (mCPBA) delivers an electrophilic oxygen atom to the π bond through a butterfly-shaped, concerted transition state. ' +
        'Both C–O bonds form simultaneously. ' +
        'Oxygen inserts into the π bond from one face only, creating the 3-membered epoxide ring. ' +
        'No carbocation intermediate — no rearrangement.',
      note: 'The weak O–O bond of the peracid is the site of oxygen delivery. After oxygen transfer, the carboxylic acid byproduct is released.',
    },
  ],
  keyRules: [
    'Syn addition: O inserts from one face; alkene geometry is preserved in epoxide',
    'cis-alkene → cis-epoxide; trans-alkene → trans-epoxide (substituents retain relationship)',
    'Electron-rich alkenes react faster (more substituted = faster)',
    'mCPBA (meta-chloroperoxybenzoic acid) is the most common peracid reagent',
    'Epoxides are highly reactive toward nucleophiles (opened by acid or base)',
    'Sharpless asymmetric epoxidation (Ti catalyst + tartrate ester) gives enantioselective product from allylic alcohols',
  ],
  brownRef: 'Brown 9e, Ch 6.10, pp. 263–268',
  relatedIds: ['alkene-halogenation', 'hx-addition'],
}

// ── Master list ───────────────────────────────────────────────────────────────

export const ALL_REACTIONS: ReactionDef[] = [
  SN2,
  SN1,
  E2,
  E1,
  SN_E_COMPETITION,
  HX_ADDITION,
  ACID_HYDRATION,
  ALKENE_HALOGENATION,
  HYDROBORATION,
  EPOXIDATION,
]

export const REACTIONS_BY_ID = Object.fromEntries(ALL_REACTIONS.map(r => [r.id, r]))

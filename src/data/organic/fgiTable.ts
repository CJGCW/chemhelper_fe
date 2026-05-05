// Functional Group Interconversion table.
// Each entry: a reagent string that converts one functional group to another.
// Used by FunctionalGroupInterconversion.tsx, TransformDrill.tsx, and TestBuilder.

export type FunctionalGroup =
  | 'alkane' | 'alkene' | 'alkyne' | 'alkyl_halide' | 'alcohol'
  | 'ether' | 'epoxide' | 'aldehyde' | 'ketone' | 'carboxylic_acid'
  | 'ester' | 'amide' | 'amine' | 'nitrile' | 'aromatic'

export interface FGITransformation {
  from: FunctionalGroup
  to: FunctionalGroup
  reagents: string
  conditions?: string
  notes?: string
  reactionId?: string
  oneWay?: boolean
}

export const FGI_TABLE: FGITransformation[] = [

  // ── From alcohol ────────────────────────────────────────────────────────────
  { from: 'alcohol', to: 'alkene',          reagents: 'H₂SO₄, Δ',                    notes: 'E1; rearrangements possible for 2°/3°',          reactionId: 'dehydration-alcohol' },
  { from: 'alcohol', to: 'alkene',          reagents: 'POCl₃, pyridine',              notes: 'E2; no rearrangement; milder' },
  { from: 'alcohol', to: 'alkyl_halide',    reagents: 'HX (X = Cl, Br, I)',           notes: 'SN1 for 3°/2°, SN2 for 1°' },
  { from: 'alcohol', to: 'alkyl_halide',    reagents: 'SOCl₂',                        notes: '→ RCl; SN2 with inversion',                      reactionId: 'alcohol-to-halide' },
  { from: 'alcohol', to: 'alkyl_halide',    reagents: 'PBr₃',                         notes: '→ RBr; SN2 with inversion' },
  { from: 'alcohol', to: 'aldehyde',        reagents: 'PCC or Swern',                 notes: '1° alcohol only; stops at aldehyde',             reactionId: 'alcohol-oxidation' },
  { from: 'alcohol', to: 'ketone',          reagents: 'PCC, CrO₃/Jones, or Swern',    notes: '2° alcohol → ketone' },
  { from: 'alcohol', to: 'carboxylic_acid', reagents: 'CrO₃/H₂SO₄ (Jones)',          notes: '1° alcohol → acid; strong oxidation' },
  { from: 'alcohol', to: 'ether',           reagents: '(1) NaH, (2) R\'X',           notes: 'Williamson ether synthesis; SN2' },
  { from: 'alcohol', to: 'ester',           reagents: 'RCOOH, H⁺, Δ',               notes: 'Fischer esterification (reversible)' },
  { from: 'alcohol', to: 'ester',           reagents: 'RCOCl or (RCO)₂O',            notes: 'Acyl chloride/anhydride; faster, irreversible' },

  // ── From alkene ─────────────────────────────────────────────────────────────
  { from: 'alkene', to: 'alcohol',          reagents: '(1) Hg(OAc)₂/H₂O, (2) NaBH₄', notes: 'Markovnikov; no rearrangement',                 reactionId: 'oxymercuration' },
  { from: 'alkene', to: 'alcohol',          reagents: '(1) BH₃·THF, (2) H₂O₂/NaOH',  notes: 'Anti-Markovnikov; syn',                         reactionId: 'hydroboration-alkene' },
  { from: 'alkene', to: 'alkyl_halide',     reagents: 'HBr or HCl',                    notes: 'Markovnikov addition; rearrangements possible' },
  { from: 'alkene', to: 'alkyl_halide',     reagents: 'HBr, ROOR (peroxide)',           notes: 'Anti-Markovnikov (radical); HBr only',          reactionId: 'anti-mark-hbr' },
  { from: 'alkene', to: 'alkyl_halide',     reagents: 'X₂ (Cl₂ or Br₂), CH₂Cl₂',     notes: '1,2-dihalide; anti addition',                   reactionId: 'halogenation-alkene' },
  { from: 'alkene', to: 'epoxide',          reagents: 'mCPBA',                          notes: 'Concerted syn O-delivery',                      reactionId: 'epoxidation-alkene' },
  { from: 'alkene', to: 'alkane',           reagents: 'H₂, Pt or Pd/C',                notes: 'Catalytic hydrogenation; syn' },
  { from: 'alkene', to: 'aldehyde',         reagents: '(1) O₃, (2) Me₂S or Zn/AcOH', notes: 'Ozonolysis reductive workup; cleaves C=C' },
  { from: 'alkene', to: 'ketone',           reagents: '(1) O₃, (2) Me₂S',              notes: 'Ozonolysis when alkene C is disubstituted' },
  { from: 'alkene', to: 'carboxylic_acid',  reagents: '(1) O₃, (2) H₂O₂',             notes: 'Ozonolysis oxidative workup' },
  { from: 'alkene', to: 'alcohol',          reagents: 'OsO₄, then NaHSO₃',            notes: 'Syn dihydroxylation → 1,2-diol; cis' },

  // ── From alkyne ─────────────────────────────────────────────────────────────
  { from: 'alkyne', to: 'alkene',           reagents: 'H₂, Lindlar (Pd/CaCO₃, quinoline)', notes: 'Lindlar; cis (Z) alkene',               reactionId: 'lindlar-reduction' },
  { from: 'alkyne', to: 'alkene',           reagents: 'Na or Li, NH₃ (l)',              notes: 'Dissolving metal; trans (E) alkene' },
  { from: 'alkyne', to: 'alkene',           reagents: 'H₂, Pd/C (1 equiv)',             notes: 'Over-reduction risk; Lindlar preferred for cis' },
  { from: 'alkyne', to: 'ketone',           reagents: 'H₂O, H₂SO₄, HgSO₄, Δ',         notes: 'Markovnikov hydration via enol; internal alkyne' },
  { from: 'alkyne', to: 'aldehyde',         reagents: '(1) Sia₂BH, (2) H₂O₂/NaOH',    notes: 'Hydroboration of terminal alkyne; anti-Markovnikov' },
  { from: 'alkyne', to: 'carboxylic_acid',  reagents: '(1) O₃, (2) H₂O',              notes: 'Ozonolysis; terminal alkyne → CO₂ + RCOOH' },
  { from: 'alkyne', to: 'alkyl_halide',     reagents: 'HX (2 equiv)',                   notes: '→ gem-dihalide (Markovnikov twice)' },

  // ── From alkyl halide ───────────────────────────────────────────────────────
  { from: 'alkyl_halide', to: 'alcohol',    reagents: 'NaOH (aq)',                     notes: 'SN2 for 1°; SN1 for 3°' },
  { from: 'alkyl_halide', to: 'alcohol',    reagents: 'H₂O, AgNO₃',                   notes: 'SN1; ionization facilitated by Ag⁺' },
  { from: 'alkyl_halide', to: 'alkene',     reagents: 'KOtBu (strong, bulky base)',    notes: 'E2; Hofmann product (less substituted)' },
  { from: 'alkyl_halide', to: 'alkene',     reagents: 'NaOEt or KOH',                 notes: 'E2; Zaitsev product (more substituted)' },
  { from: 'alkyl_halide', to: 'ether',      reagents: 'NaOR\'',                        notes: 'Williamson ether; SN2 → only 1° or methyl RX' },
  { from: 'alkyl_halide', to: 'amine',      reagents: 'NaN₃, then LiAlH₄',            notes: 'Azide substitution then reduction → 1° amine' },
  { from: 'alkyl_halide', to: 'amine',      reagents: '(1) Phthalimide/K₂CO₃, (2) NH₂NH₂', notes: 'Gabriel synthesis → 1° amine only' },
  { from: 'alkyl_halide', to: 'nitrile',    reagents: 'NaCN, DMSO',                   notes: 'SN2; +1 carbon; → nitrile (RCN)' },
  { from: 'alkyl_halide', to: 'alkyl_halide', reagents: 'NaI, acetone (Finkelstein)',  notes: 'Halide exchange; I⁻ drives equilibrium' },
  { from: 'alkyl_halide', to: 'alkyne',     reagents: 'NaNH₂ (2 equiv)',              notes: 'Double dehydrohalogenation of gem/vicinal dihalide' },

  // ── From aldehyde ───────────────────────────────────────────────────────────
  { from: 'aldehyde', to: 'alcohol',        reagents: 'NaBH₄, MeOH',                  notes: '→ 1° alcohol (mild reduction)' },
  { from: 'aldehyde', to: 'alcohol',        reagents: 'LiAlH₄, then H₂O',             notes: '→ 1° alcohol (strong reduction)' },
  { from: 'aldehyde', to: 'alcohol',        reagents: 'RMgBr or RLi, then H₃O⁺',      notes: 'Grignard/RLi addition → 2° alcohol' },
  { from: 'aldehyde', to: 'carboxylic_acid', reagents: 'KMnO₄ or CrO₃/H₂SO₄',        notes: 'Strong oxidation' },
  { from: 'aldehyde', to: 'carboxylic_acid', reagents: 'Ag₂O (Tollens)',               notes: 'Mild silver mirror test for aldehydes' },
  { from: 'aldehyde', to: 'amine',          reagents: '(1) RNH₂, (2) NaBH(OAc)₃',    notes: 'Reductive amination' },
  { from: 'aldehyde', to: 'alkene',         reagents: 'Ph₃P=CHR (Wittig)',             notes: 'Wittig; controls C=C position' },
  { from: 'aldehyde', to: 'nitrile',        reagents: 'HCN',                           notes: 'Cyanohydrin formation; nucleophilic addition' },

  // ── From ketone ─────────────────────────────────────────────────────────────
  { from: 'ketone', to: 'alcohol',          reagents: 'NaBH₄, MeOH',                  notes: '→ 2° alcohol (mild reduction)' },
  { from: 'ketone', to: 'alcohol',          reagents: 'RMgBr or RLi, then H₃O⁺',      notes: 'Grignard/RLi addition → 3° alcohol' },
  { from: 'ketone', to: 'alkene',           reagents: 'Ph₃P=CHR (Wittig)',             notes: 'Wittig reaction; no carboxylic acid formed' },
  { from: 'ketone', to: 'amine',            reagents: '(1) RNH₂, (2) NaBH(OAc)₃',    notes: 'Reductive amination' },
  { from: 'ketone', to: 'alkene',           reagents: 'Zn, HCl (Clemmensen)',          notes: 'Clemmensen: C=O → CH₂ (acid conditions)' },
  { from: 'ketone', to: 'alkene',           reagents: 'NH₂NH₂, KOH, Δ (Wolff–Kishner)', notes: 'Wolff-Kishner: C=O → CH₂ (basic conditions)' },
  { from: 'ketone', to: 'nitrile',          reagents: 'HCN',                           notes: 'Cyanohydrin formation' },

  // ── From carboxylic acid ────────────────────────────────────────────────────
  { from: 'carboxylic_acid', to: 'ester',    reagents: 'ROH, H⁺, Δ',                  notes: 'Fischer esterification; reversible' },
  { from: 'carboxylic_acid', to: 'amide',    reagents: '(1) SOCl₂, (2) R₂NH',          notes: 'Via acyl chloride; anhydrous conditions' },
  { from: 'carboxylic_acid', to: 'alcohol',  reagents: 'LiAlH₄, then H₂O',             notes: 'Strong reduction → 1° alcohol' },
  { from: 'carboxylic_acid', to: 'alkyl_halide', reagents: '(1) SOCl₂ or PCl₃',        notes: '→ acyl chloride' },
  { from: 'carboxylic_acid', to: 'aldehyde', reagents: 'DIBAL-H, −78°C',              notes: 'Stop at aldehyde at −78°C; normally goes to alcohol' },
  { from: 'carboxylic_acid', to: 'alkane',   reagents: 'Kolbe electrolysis',            notes: 'Oxidative decarboxylation; specialized' },
  { from: 'carboxylic_acid', to: 'nitrile',  reagents: '(1) NH₃, (2) P₂O₅, Δ',        notes: 'Dehydration of ammonium salt → nitrile; −1 carbon net' },

  // ── From ester ──────────────────────────────────────────────────────────────
  { from: 'ester', to: 'alcohol',            reagents: 'LiAlH₄, then H₂O',             notes: '→ 1° alcohol (from carbonyl C) + alcohol byproduct' },
  { from: 'ester', to: 'aldehyde',           reagents: 'DIBAL-H, −78°C',               notes: 'Stops at aldehyde stage' },
  { from: 'ester', to: 'carboxylic_acid',    reagents: 'NaOH (aq), then H⁺ (saponification)', notes: 'Hydrolysis; irreversible under basic conditions' },
  { from: 'ester', to: 'amide',              reagents: 'R₂NH (aminolysis)',              notes: 'Direct aminolysis; milder than from acid' },
  { from: 'ester', to: 'alcohol',            reagents: 'NaBH₄, EtOH',                  notes: 'Esters often require LiAlH₄; NaBH₄ is slower' },

  // ── From amide ──────────────────────────────────────────────────────────────
  { from: 'amide', to: 'amine',              reagents: 'LiAlH₄, then H₂O',             notes: 'Reduction → amine (N retained)' },
  { from: 'amide', to: 'nitrile',            reagents: 'P₂O₅, Δ or SOCl₂',             notes: 'Dehydration of primary amide' },
  { from: 'amide', to: 'amine',              reagents: 'Br₂, NaOH (Hofmann rearrangement)', notes: '→ 1° amine; loses one carbon (−CONH₂ → −NH₂)' },
  { from: 'amide', to: 'carboxylic_acid',    reagents: 'HCl (aq) or NaOH (aq), Δ',     notes: 'Hydrolysis; acidic or basic' },

  // ── From nitrile ────────────────────────────────────────────────────────────
  { from: 'nitrile', to: 'amine',            reagents: 'H₂, Ni or LiAlH₄',             notes: 'Reduction → 1° amine; +1 carbon relative to starting RX' },
  { from: 'nitrile', to: 'carboxylic_acid',  reagents: 'H₃O⁺ or NaOH (aq), Δ',        notes: 'Hydrolysis; goes via amide → acid' },
  { from: 'nitrile', to: 'aldehyde',         reagents: 'DIBAL-H, −78°C, then H₂O',     notes: 'Stops at imine intermediate → aldehyde on workup' },
  { from: 'nitrile', to: 'ketone',           reagents: 'RMgBr, then H₃O⁺',             notes: 'Grignard addition to nitrile → imine → ketone' },
  { from: 'nitrile', to: 'amide',            reagents: 'H₂O₂, NaOH (mild)',             notes: 'Partial hydrolysis; stops at amide' },

  // ── From amine ──────────────────────────────────────────────────────────────
  { from: 'amine', to: 'amide',              reagents: 'RCOCl or (RCO)₂O',             notes: 'N-acylation' },
  { from: 'amine', to: 'aromatic',           reagents: 'HNO₂ (NaNO₂/HCl), then ArH',  notes: 'Diazonium coupling; aromatic amine only' },
  { from: 'amine', to: 'alkyl_halide',       reagents: 'CH₃I (excess)',                 notes: 'Exhaustive methylation (Hofmann or Menshutkin)' },
  { from: 'amine', to: 'alkene',             reagents: '(1) CH₃I excess, (2) Ag₂O, Δ (Hofmann)', notes: 'Hofmann elimination; less substituted alkene' },

  // ── From epoxide ────────────────────────────────────────────────────────────
  { from: 'epoxide', to: 'alcohol',          reagents: 'H₃O⁺',                          notes: 'Acid-catalyzed opening; anti; attack at more substituted C' },
  { from: 'epoxide', to: 'alcohol',          reagents: 'NaOH or RO⁻',                   notes: 'Base-catalyzed opening; anti; attack at less substituted C (SN2)' },
  { from: 'epoxide', to: 'alcohol',          reagents: 'LiAlH₄',                        notes: 'Opens at less hindered C; anti' },
  { from: 'epoxide', to: 'alcohol',          reagents: 'RMgBr or RLi',                  notes: 'Grignard opens epoxide → β-substituted alcohol' },

  // ── From ether ──────────────────────────────────────────────────────────────
  { from: 'ether', to: 'alcohol',            reagents: 'HI or HBr, Δ',                  notes: 'Acidic cleavage; SN2 for 1° ethers, SN1 for 3°' },
  { from: 'ether', to: 'alkyl_halide',       reagents: 'HI (excess)',                    notes: 'Excess HI cleaves ether → 2 alkyl iodides' },

  // ── From aromatic ───────────────────────────────────────────────────────────
  { from: 'aromatic', to: 'aromatic',        reagents: 'Br₂, FeBr₃',                    notes: 'EAS bromination; o/p directors activate, meta deactivate', reactionId: 'eas-halogenation' },
  { from: 'aromatic', to: 'aromatic',        reagents: 'Cl₂, FeCl₃',                    notes: 'EAS chlorination' },
  { from: 'aromatic', to: 'aromatic',        reagents: 'HNO₃, H₂SO₄',                   notes: 'EAS nitration; meta director installs NO₂',              reactionId: 'eas-nitration' },
  { from: 'aromatic', to: 'aromatic',        reagents: 'RCl, AlCl₃ (Friedel-Crafts)',   notes: 'FC alkylation; rearrangements possible; stops EAS reactivity' },
  { from: 'aromatic', to: 'ketone',          reagents: 'RCOCl, AlCl₃ (Friedel-Crafts)', notes: 'FC acylation; no rearrangement; meta deactivates ring' },
  { from: 'aromatic', to: 'amine',           reagents: '(1) HNO₃/H₂SO₄, (2) H₂/Pd',    notes: 'Nitration then catalytic reduction' },
  { from: 'aromatic', to: 'carboxylic_acid', reagents: 'KMnO₄, H⁺, Δ',                 notes: 'Side-chain oxidation; requires benzylic H' },
  { from: 'aromatic', to: 'alkyl_halide',    reagents: 'Br₂, hν (NBS for allylic/benzylic)', notes: 'Radical benzylic bromination' },
]

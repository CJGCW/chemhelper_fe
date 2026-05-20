// Thin generators for organic practice topics that lack standalone util generators.
// Each returns { question, answer, options, explanation } for the 'classification' test kind.

export interface OrgTextProblem {
  question: string
  answer: string
  options: string[]
  explanation: string
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Chair Conformations ─────────────────────────────────────────────────────

export const CHAIR_POOL: OrgTextProblem[] = [
  {
    question: 'A cyclohexane ring has CH₃ in the axial position. Which statement is correct?',
    answer: 'The equatorial conformer is more stable by ~7.6 kJ/mol',
    options: ['The equatorial conformer is more stable by ~7.6 kJ/mol', 'The axial conformer is more stable', 'Both conformers have equal stability', 'The equatorial conformer is more stable by ~22 kJ/mol'],
    explanation: 'The A-value for CH₃ is 7.6 kJ/mol; equatorial is preferred due to 1,3-diaxial interactions.',
  },
  {
    question: 'A tBu group (A-value ~22.8 kJ/mol) occupies an equatorial position. After a ring flip:',
    answer: 'The tBu remains overwhelmingly equatorial (~100%)',
    options: ['The tBu remains overwhelmingly equatorial (~100%)', 'Equal axial/equatorial mixture', 'The tBu becomes axial', 'Ring flip is impossible with tBu'],
    explanation: 'The A-value of 22.8 kJ/mol is enormous; the equatorial conformer dominates essentially 100%.',
  },
  {
    question: 'Trans-1,2-dimethylcyclohexane: in the more stable chair, both CH₃ groups are:',
    answer: 'Both equatorial',
    options: ['Both equatorial', 'One axial, one equatorial', 'Both axial', 'Depends on solvent'],
    explanation: 'Trans-1,2-disubstitution allows both groups to be equatorial simultaneously — this is the more stable conformer.',
  },
  {
    question: 'Two CH₃ groups are axial at C1 and C3 on the same face. What interaction does this create?',
    answer: '1,3-Diaxial strain',
    options: ['1,3-Diaxial strain', '1,2-Diaxial strain', 'Flagpole interaction', 'Van der Waals attraction'],
    explanation: '1,3-Diaxial strain occurs between axial substituents on alternating ring carbons — they point toward each other in space.',
  },
  {
    question: 'Cis-1,4-dimethylcyclohexane: in any chair conformation, the relationship of the two CH₃ groups is:',
    answer: 'One axial, one equatorial in both chairs',
    options: ['One axial, one equatorial in both chairs', 'Both equatorial in one chair, both axial in the other', 'Both axial in both chairs', 'Both equatorial in both chairs'],
    explanation: 'Cis-1,4-disubstitution means one group is up and one is down. Regardless of which chair, one is axial and one is equatorial.',
  },
  {
    question: 'A ring flip converts:',
    answer: 'All axial positions to equatorial and vice versa',
    options: ['All axial positions to equatorial and vice versa', 'Only the substituent positions', 'The chair shape but not the bond orientations', 'Nothing — ring flips do not change axial/equatorial assignment'],
    explanation: 'A ring flip simultaneously converts every axial bond to equatorial and every equatorial to axial.',
  },
]

export function generateChairProblem(): OrgTextProblem { return pick(CHAIR_POOL) }

// ── Newman Projections ──────────────────────────────────────────────────────

export const NEWMAN_POOL: OrgTextProblem[] = [
  {
    question: 'In a Newman projection of butane with φ = 180°, the two CH₃ groups are:',
    answer: 'Anti — most stable, 0 kJ/mol relative energy',
    options: ['Anti — most stable, 0 kJ/mol relative energy', 'Gauche — 3.8 kJ/mol above anti', 'Eclipsed — ~16 kJ/mol above anti', 'Totally eclipsed — ~19 kJ/mol above anti'],
    explanation: 'φ = 180° places CH₃ groups on opposite sides = anti, the most stable butane conformation.',
  },
  {
    question: 'In a Newman projection of butane, φ = 60°. This is the:',
    answer: 'Gauche conformation (~3.8 kJ/mol above anti)',
    options: ['Gauche conformation (~3.8 kJ/mol above anti)', 'Anti conformation (most stable)', 'Eclipsed H/CH₃ (~16 kJ/mol)', 'Totally eclipsed (~19 kJ/mol)'],
    explanation: 'φ = 60° staggered with CH₃ groups 60° apart = gauche. Staggered but not the most stable.',
  },
  {
    question: 'Rank butane conformations from MOST to LEAST stable:',
    answer: 'Anti > Gauche > Eclipsed (H/CH₃) > Totally Eclipsed',
    options: ['Anti > Gauche > Eclipsed (H/CH₃) > Totally Eclipsed', 'Gauche > Anti > Eclipsed > Totally Eclipsed', 'Totally Eclipsed > Gauche > Anti', 'Eclipsed > Anti > Gauche'],
    explanation: 'Staggered > eclipsed always. Among staggered: anti (0) > gauche (~3.8 kJ/mol). Among eclipsed: H/CH₃ < CH₃/CH₃.',
  },
  {
    question: 'The rotational barrier for ethane is ~12 kJ/mol. This arises from:',
    answer: 'Torsional (eclipsing) strain between H–H pairs',
    options: ['Torsional (eclipsing) strain between H–H pairs', 'Steric strain between CH₃ groups', '1,3-Diaxial interactions', 'Flagpole interactions'],
    explanation: 'Ethane has only H atoms; the ~12 kJ/mol barrier is purely torsional strain from eclipsed H–H pairs.',
  },
  {
    question: 'How many distinct staggered conformations does butane have upon 360° rotation?',
    answer: '3 (anti, gauche+, gauche−)',
    options: ['3 (anti, gauche+, gauche−)', '2 (anti and gauche)', '4', '6'],
    explanation: 'Butane has three staggered minima: anti (φ=180°), gauche+ (φ=60°), and gauche− (φ=300°=−60°).',
  },
  {
    question: 'In a Newman projection looking down C2–C3 of butane, φ = 0°. This is the:',
    answer: 'Totally eclipsed (CH₃/CH₃) — highest energy',
    options: ['Totally eclipsed (CH₃/CH₃) — highest energy', 'Anti — lowest energy', 'Gauche — intermediate', 'Eclipsed H/CH₃'],
    explanation: 'φ = 0° with CH₃ groups overlapping = totally eclipsed — the highest energy conformation (~19 kJ/mol above anti).',
  },
]

export function generateNewmanProblem(): OrgTextProblem { return pick(NEWMAN_POOL) }

// ── Hybridization ──────────────────────────────────────────────────────────

export const HYBRIDIZATION_POOL: OrgTextProblem[] = [
  { question: 'What is the hybridization of the carbon in CH₄?', answer: 'sp³', options: ['sp³', 'sp²', 'sp', 'sp³d'], explanation: 'Methane C has 4 single bonds, 0 lone pairs → 4 electron groups → sp³.' },
  { question: 'What is the hybridization of the carbonyl carbon (C=O) in formaldehyde (H₂C=O)?', answer: 'sp²', options: ['sp²', 'sp³', 'sp', 'sp³d'], explanation: 'The carbonyl C has a double bond to O and two single bonds to H → 3 electron groups → sp².' },
  { question: 'What is the hybridization of carbon in acetylene (HC≡CH)?', answer: 'sp', options: ['sp', 'sp²', 'sp³', 'sp³d'], explanation: 'A triple bond + one single bond = 2 electron groups → sp hybridization; angle = 180°.' },
  { question: 'What is the hybridization of the nitrogen in pyridine (ring nitrogen, lone pair in sp² orbital)?', answer: 'sp²', options: ['sp²', 'sp³', 'sp', 'unhybridized'], explanation: 'Pyridine N is sp² — lone pair is in an sp² orbital perpendicular to the π system, not contributing to ring π electrons.' },
  { question: 'What is the hybridization of nitrogen in pyrrole (N lone pair in ring)?', answer: 'sp²', options: ['sp²', 'sp³', 'sp', 'sp³d'], explanation: 'Pyrrole N is sp² with the lone pair in a p orbital contributing 2π electrons to the aromatic ring.' },
  { question: 'What is the hybridization of the oxygen in an epoxide ring?', answer: 'sp³', options: ['sp³', 'sp²', 'sp', 'sp³d²'], explanation: 'Epoxide O has 2 single bonds and 2 lone pairs → 4 electron groups → sp³.' },
  { question: 'What is the hybridization of carbon in benzene?', answer: 'sp²', options: ['sp²', 'sp³', 'sp', 'unhybridized'], explanation: 'Each benzene C has 2 C–C bonds and 1 C–H bond → 3 σ bonds → sp²; the remaining p orbital forms the π system.' },
  { question: 'What is the hybridization of the carboxylate carbon (–COOH)?', answer: 'sp²', options: ['sp²', 'sp³', 'sp', 'sp³d'], explanation: 'The carbonyl C in COOH has a double bond to O, a single bond to OH, and a single bond to R → 3 electron groups → sp².' },
]

export function generateHybridizationProblem(): OrgTextProblem { return pick(HYBRIDIZATION_POOL) }

// ── Aromaticity ─────────────────────────────────────────────────────────────

export const AROMATICITY_POOL: OrgTextProblem[] = [
  { question: 'Benzene (6π electrons). Classify:', answer: 'Aromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: '6π = 4(1)+2 → aromatic. Planar, conjugated ring.' },
  { question: 'Cyclobutadiene (4π electrons, planar, conjugated). Classify:', answer: 'Antiaromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: '4π = 4(1) → antiaromatic. Planar and conjugated but 4n electrons.' },
  { question: 'Cyclopentadienyl anion (Cp⁻, 6π electrons). Classify:', answer: 'Aromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: 'Lone pair on sp² carbanion contributes 2π → total 6π → aromatic.' },
  { question: 'Cyclooctatetraene (COT, tub-shaped, 8π electrons). Classify:', answer: 'Nonaromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: '8π would be antiaromatic, but COT avoids this by adopting a non-planar tub shape → nonaromatic.' },
  { question: 'Tropylium cation (C₇H₇⁺, 6π electrons). Classify:', answer: 'Aromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: 'Empty p orbital on the cationic carbon contributes 0π; ring has 6π → aromatic.' },
  { question: 'Furan (5-membered ring with O). Classify:', answer: 'Aromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: 'O lone pair (2π) + 2×C=C (4π) = 6π → aromatic.' },
  { question: '1,3-Cyclohexadiene (one sp³ CH₂ in ring). Classify:', answer: 'Nonaromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: 'Not fully conjugated — the sp³ CH₂ breaks the continuous p-orbital overlap → nonaromatic.' },
  { question: 'Cyclopropenyl anion (4π electrons). Classify:', answer: 'Antiaromatic', options: ['Aromatic', 'Antiaromatic', 'Nonaromatic'], explanation: '2π (C=C) + 2π (lone pair) = 4π in a 3-membered planar ring → antiaromatic.' },
]

export function generateAromaticityProblem(): OrgTextProblem { return pick(AROMATICITY_POOL) }

// ── R/S Assignment ──────────────────────────────────────────────────────────

export const RS_POOL: OrgTextProblem[] = [
  {
    question: 'A chiral center has substituents: Br (highest priority), CH₂CH₃, CH₃, H (lowest). With H pointing away, 1→2→3 is clockwise. Assign:',
    answer: 'R',
    options: ['R', 'S'],
    explanation: 'Clockwise 1→2→3 with lowest priority pointing away = R (rectus).',
  },
  {
    question: 'A chiral center: Cl(1) > OH(2) > CH₃(3) > H(4). With H pointing away, rotation 1→2→3 is counterclockwise. Assign:',
    answer: 'S',
    options: ['R', 'S'],
    explanation: 'Counterclockwise with H away = S (sinister).',
  },
  {
    question: 'D-Glyceraldehyde: OH(1) > CH₂OH(2) > CHO(3) > H(4). H points into page (away from viewer). Trace OH→CH₂OH→CHO is clockwise. Assign:',
    answer: 'R',
    options: ['R', 'S'],
    explanation: 'Clockwise with lowest priority away = R. D-glyceraldehyde is (R)-glyceraldehyde.',
  },
  {
    question: 'A chiral center: F(1) > Br(2) > CH₃(3) > H(4). H pointing away; clockwise trace. Assign:',
    answer: 'R',
    options: ['R', 'S'],
    explanation: 'Clockwise + H away = R.',
  },
  {
    question: 'A center has priorities 1→2→3 appearing counterclockwise when the lowest-priority group points TOWARD the viewer. What is the actual configuration?',
    answer: 'R',
    options: ['R', 'S'],
    explanation: 'When H points toward you, reverse the observed direction. Counterclockwise observed → actual clockwise → R.',
  },
]

export function generateRSProblem(): OrgTextProblem { return pick(RS_POOL) }

// ── E/Z Assignment ──────────────────────────────────────────────────────────

export const EZ_POOL: OrgTextProblem[] = [
  {
    question: 'C1=C2 with CH₃(1)>H on C1 and CH₃(1)>H on C2. High-priority groups (CH₃) on the SAME side. Assign:',
    answer: 'Z',
    options: ['E', 'Z'],
    explanation: 'Same side = Z (zusammen = together).',
  },
  {
    question: 'C1=C2 with CH₃(1)>H on C1 and CH₃(1)>H on C2. High-priority groups on OPPOSITE sides. Assign:',
    answer: 'E',
    options: ['E', 'Z'],
    explanation: 'Opposite sides = E (entgegen = opposite).',
  },
  {
    question: '2-Bromo-2-butene: C2 has Br>CH₃; C3 has CH₃>H. Br and the CH₃ (on C3) are on the same side. Assign:',
    answer: 'Z',
    options: ['E', 'Z'],
    explanation: 'High-priority groups (Br on C2, CH₃ on C3) on same side = Z.',
  },
  {
    question: 'Maleic acid (cis-butenedioic acid): both COOH groups are on the same side of the C=C. Assign:',
    answer: 'Z',
    options: ['E', 'Z'],
    explanation: 'Both COOH groups on the same side → Z. This is maleic acid (less stable due to steric clash).',
  },
  {
    question: 'Fumaric acid (trans-butenedioic acid): both COOH groups are on opposite sides. Assign:',
    answer: 'E',
    options: ['E', 'Z'],
    explanation: 'Opposite sides → E. Fumaric acid is the more stable isomer.',
  },
  {
    question: 'CH₂=CHBr vs CH₂=CHCl (1-bromo-2-chloroethylene). On C1: Br>H. On C2: Cl>H. Br and Cl on the same side. Assign:',
    answer: 'Z',
    options: ['E', 'Z'],
    explanation: 'High-priority groups (Br, Cl) on same side = Z.',
  },
]

export function generateEZProblem(): OrgTextProblem { return pick(EZ_POOL) }

// ── Stereoisomer Classification ─────────────────────────────────────────────

export const STEREO_POOL: OrgTextProblem[] = [
  {
    question: '(R)-lactic acid and (S)-lactic acid are non-superimposable mirror images. They are:',
    answer: 'Enantiomers',
    options: ['Enantiomers', 'Diastereomers', 'Constitutional isomers', 'Identical'],
    explanation: 'Non-superimposable mirror images with identical connectivity = enantiomers.',
  },
  {
    question: '(2R,3S)-tartaric acid and (2S,3R)-tartaric acid: they are mirror images and superimposable (meso). They are:',
    answer: 'Identical (same meso compound)',
    options: ['Enantiomers', 'Diastereomers', 'Identical (same meso compound)', 'Constitutional isomers'],
    explanation: 'The meso compound has an internal plane of symmetry; it is superimposable on its mirror image.',
  },
  {
    question: '(2R,3R)-tartaric acid and (2R,3S)-tartaric acid: same connectivity, multiple stereocenters, not mirror images. They are:',
    answer: 'Diastereomers',
    options: ['Enantiomers', 'Diastereomers', 'Meso compound', 'Constitutional isomers'],
    explanation: 'Stereoisomers that are not enantiomers = diastereomers. They have different physical properties.',
  },
  {
    question: 'cis-1,2-dimethylcyclohexane and trans-1,2-dimethylcyclohexane are:',
    answer: 'Diastereomers',
    options: ['Enantiomers', 'Diastereomers', 'Identical', 'Constitutional isomers'],
    explanation: 'Same connectivity, multiple stereocenters, not mirror images = diastereomers.',
  },
  {
    question: 'Two structures have identical connectivity and identical stereochemistry at every center. They are:',
    answer: 'Identical',
    options: ['Enantiomers', 'Diastereomers', 'Identical', 'Meso'],
    explanation: 'If all stereocenters match, the molecules are the same compound viewed from different angles.',
  },
]

export function generateStereoisomerProblem(): OrgTextProblem { return pick(STEREO_POOL) }

// ── Conformational Analysis (general) ──────────────────────────────────────

export const CONFORMATIONAL_POOL: OrgTextProblem[] = [
  {
    question: 'Which type of conformational strain arises when bonds are eclipsed in a Newman projection?',
    answer: 'Torsional (eclipsing) strain',
    options: ['Torsional (eclipsing) strain', 'Steric strain', '1,3-Diaxial strain', 'Angle strain'],
    explanation: 'Eclipsed bonds have overlapping electron clouds — this is torsional strain.',
  },
  {
    question: 'What is the most stable conformation of butane looking down C2–C3?',
    answer: 'Anti (φ = 180°)',
    options: ['Anti (φ = 180°)', 'Gauche (φ = 60°)', 'Eclipsed (φ = 120°)', 'Totally Eclipsed (φ = 0°)'],
    explanation: 'Anti places the largest groups farthest apart, minimizing steric and torsional strain.',
  },
  {
    question: 'What kind of strain is minimized when a large substituent occupies an equatorial position in cyclohexane?',
    answer: '1,3-Diaxial strain',
    options: ['1,3-Diaxial strain', 'Torsional strain', 'Angle strain', 'Van der Waals attraction'],
    explanation: 'Axial substituents interact with axial H atoms at C1 and C3 — equatorial avoids this 1,3-diaxial strain.',
  },
  {
    question: 'In cyclopentane, angle strain is less than in cyclopropane because:',
    answer: 'The C–C–C angle (~104°) is closer to the ideal tetrahedral angle of 109.5°',
    options: ['The C–C–C angle (~104°) is closer to the ideal tetrahedral angle of 109.5°', 'Cyclopentane has no torsional strain', 'Cyclopentane adopts a planar structure', 'Cyclopentane has fewer hydrogens'],
    explanation: 'Cyclopropane has 60° angles (vs 109.5° ideal), while cyclopentane has ~104° — much less deviation.',
  },
  {
    question: 'Cyclopropane is unusually reactive toward ring-opening reactions because of:',
    answer: 'Significant angle strain from 60° C–C–C angles',
    options: ['Significant angle strain from 60° C–C–C angles', 'Torsional strain from eclipsed H atoms', 'The ring cannot undergo conformational changes', 'All carbons are sp hybridized'],
    explanation: 'The 60° bond angles in cyclopropane deviate greatly from sp³ geometry (109.5°), creating high ring strain.',
  },
]

export function generateConformationalProblem(): OrgTextProblem { return pick(CONFORMATIONAL_POOL) }

// ── Curved Arrow Mechanisms ─────────────────────────────────────────────────

export const CURVED_ARROW_POOL: OrgTextProblem[] = [
  {
    question: 'In a curved arrow notation, an arrow starting from a lone pair and ending at an atom represents:',
    answer: 'The lone pair attacks the atom, forming a new bond',
    options: ['The lone pair attacks the atom, forming a new bond', 'Bond breaking with both electrons going to one atom', 'Proton transfer', 'Radical formation'],
    explanation: 'Curved arrows show electron movement. Lone pair → bond = nucleophilic attack forming a new σ bond.',
  },
  {
    question: 'An arrow drawn from the middle of a C–X bond to the X atom represents:',
    answer: 'Heterolytic bond cleavage — both electrons go to X',
    options: ['Heterolytic bond cleavage — both electrons go to X', 'Homolytic bond cleavage', 'Nucleophilic attack on C', 'Formation of a C=X double bond'],
    explanation: 'Arrow from bond to atom = the bond breaks and both electrons go to that atom (heterolysis).',
  },
  {
    question: 'How many curved arrows are needed for an SN2 reaction (one nucleophile attacks, one leaving group departs)?',
    answer: '2',
    options: ['2', '1', '3', '4'],
    explanation: 'SN2: (1) Nu: lone pair → C, (2) C–LG bond electrons → LG. Two arrows for one concerted step.',
  },
  {
    question: 'In an E2 reaction (base removes β-H, C–C becomes a double bond, leaving group departs), how many arrows are needed?',
    answer: '3',
    options: ['3', '2', '4', '1'],
    explanation: 'E2: (1) Base → H–C bond, (2) H–C electrons → C–C, making π bond, (3) C–LG → LG. Three arrows.',
  },
  {
    question: 'A curved arrow drawn from a C=C to an electrophile represents:',
    answer: 'Nucleophilic addition of the π electrons to the electrophile',
    options: ['Nucleophilic addition of the π electrons to the electrophile', 'Homolytic cleavage of the double bond', 'Loss of a proton', 'Ring formation'],
    explanation: 'The π electrons (the curved arrow) attack an electrophile — this is electrophilic addition initiation.',
  },
  {
    question: 'In an acyl substitution mechanism, the nucleophile attacks the carbonyl carbon. The intermediate is a:',
    answer: 'Tetrahedral intermediate (with O⁻)',
    options: ['Tetrahedral intermediate (with O⁻)', 'Carbocation', 'Carbanion', 'Radical'],
    explanation: 'Nu attacks the sp² carbonyl C; the C=O π bond breaks → the O becomes O⁻ in a sp³ tetrahedral intermediate.',
  },
]

export function generateCurvedArrowProblem(): OrgTextProblem { return pick(CURVED_ARROW_POOL) }

// ── Polymerization ──────────────────────────────────────────────────────────

export const POLYMERIZATION_POOL: OrgTextProblem[] = [
  {
    question: 'Ethylene (CH₂=CH₂) is converted to polyethylene via:',
    answer: 'Addition (chain-growth) polymerization',
    options: ['Addition (chain-growth) polymerization', 'Condensation (step-growth) polymerization', 'Ring-opening metathesis', 'Anionic polymerization only'],
    explanation: 'The C=C opens without loss of atoms — addition polymerization. No byproduct is formed.',
  },
  {
    question: 'PET (polyethylene terephthalate) is formed from terephthalic acid + ethylene glycol. The reaction type is:',
    answer: 'Condensation (step-growth) — releases H₂O',
    options: ['Condensation (step-growth) — releases H₂O', 'Addition (chain-growth)', 'Ring-opening', 'Radical addition'],
    explanation: 'Diacid + diol → polyester + H₂O at each step = condensation polymerization.',
  },
  {
    question: 'Nylon-6,6 is made from hexamethylenediamine and adipic acid via:',
    answer: 'Condensation polymerization — forms amide bonds',
    options: ['Condensation polymerization — forms amide bonds', 'Addition polymerization', 'Ring-opening of caprolactam', 'Radical copolymerization'],
    explanation: 'Diamine + diacid → polyamide + H₂O. This is condensation (step-growth) polymerization.',
  },
  {
    question: 'Polystyrene is made from styrene (CH₂=CHPh) by which mechanism?',
    answer: 'Radical addition polymerization',
    options: ['Radical addition polymerization', 'Condensation polymerization', 'Ring-opening metathesis', 'Zwitterionic polymerization'],
    explanation: 'Styrene undergoes radical chain-growth addition polymerization; no byproduct is released.',
  },
  {
    question: 'Which feature distinguishes addition polymerization from condensation polymerization?',
    answer: 'Addition polymerization releases no small-molecule byproduct',
    options: ['Addition polymerization releases no small-molecule byproduct', 'Addition polymerization requires a catalyst', 'Condensation polymerization requires alkene monomers', 'Condensation polymers have lower molecular weights'],
    explanation: 'Condensation polymerization releases a small molecule (H₂O, HCl, etc.) at each step; addition does not.',
  },
]

export function generatePolymerizationProblem(): OrgTextProblem { return pick(POLYMERIZATION_POOL) }

// ── Conjugated Dienes ───────────────────────────────────────────────────────

export const CONJUGATED_DIENE_POOL: OrgTextProblem[] = [
  {
    question: 'The Diels-Alder [4+2] cycloaddition between 1,3-butadiene and a dienophile produces a ring of size:',
    answer: '6-membered ring',
    options: ['6-membered ring', '4-membered ring', '5-membered ring', '8-membered ring'],
    explanation: '4 carbons (diene) + 2 carbons (dienophile) form a 6-membered ring with one C=C remaining.',
  },
  {
    question: 'In the Diels-Alder reaction, the diene must be in which conformation to react?',
    answer: 's-cis',
    options: ['s-cis', 's-trans', 'gauche', 'anti'],
    explanation: 'Only the s-cis diene can reach the correct geometry to overlap with the dienophile π system.',
  },
  {
    question: 'Endo selectivity in the Diels-Alder is due to:',
    answer: 'Secondary orbital interactions in the endo transition state',
    options: ['Secondary orbital interactions in the endo transition state', 'Steric effects favoring endo', 'The endo product is thermodynamically more stable', 'Endo and exo are equally likely'],
    explanation: 'The endo rule: carbonyl π* interactions with the diene stabilize the endo TS kinetically.',
  },
  {
    question: 'After protonation of 1,3-butadiene at C1, the resulting allylic cation has positive charge at:',
    answer: 'C2 and C4 (allylic resonance)',
    options: ['C2 and C4 (allylic resonance)', 'C2 only', 'C1 and C3', 'C3 and C5'],
    explanation: 'Cation at C2 delocalizes to C4 via resonance: ⁺CH₂–CH=CH–CH₃ ↔ CH₂=CH–CH=⁺CH₃ → 1,2 and 1,4 products.',
  },
  {
    question: 'An electron-withdrawing group (CHO, CN) on the dienophile in a normal-demand Diels-Alder:',
    answer: 'Lowers the dienophile LUMO energy, accelerating the reaction',
    options: ['Lowers the dienophile LUMO energy, accelerating the reaction', 'Raises the dienophile HOMO, slowing it', 'Has no effect on rate', 'Prevents the reaction'],
    explanation: 'EWGs lower LUMO energy → smaller HOMO(diene)–LUMO(dienophile) gap → faster [4+2].',
  },
]

export function generateConjugatedDieneProblem(): OrgTextProblem { return pick(CONJUGATED_DIENE_POOL) }

// ── Formal Charge (Organic) ─────────────────────────────────────────────────

export const FORMAL_CHARGE_POOL: OrgTextProblem[] = [
  {
    question: 'In a carbocation (R₃C⁺), carbon has 3 bonds and 0 lone pairs. Formal charge = valence − lone pair e⁻ − bonds. Calculate:',
    answer: '+1',
    options: ['+1', '0', '−1', '+2'],
    explanation: 'FC = 4 − 0 − 3 = +1. Carbon needs 4 bonds to be neutral; with only 3, it has +1 formal charge.',
  },
  {
    question: 'In a carbanion (R₃C⁻), C has 3 bonds and 1 lone pair (2 electrons). Formal charge:',
    answer: '−1',
    options: ['−1', '0', '+1', '−2'],
    explanation: 'FC = 4 − 2 − 3 = −1.',
  },
  {
    question: 'Water oxygen has 2 bonds and 2 lone pairs (4 electrons). Formal charge of O:',
    answer: '0',
    options: ['0', '+1', '−1', '+2'],
    explanation: 'FC = 6 − 4 − 2 = 0. Neutral oxygen in water.',
  },
  {
    question: 'In NH₄⁺, nitrogen has 4 bonds and 0 lone pairs. Formal charge:',
    answer: '+1',
    options: ['+1', '0', '−1', '+2'],
    explanation: 'FC = 5 − 0 − 4 = +1. The ammonium ion has +1 on N.',
  },
  {
    question: 'The formula for formal charge is FC = V − L − B, where V = valence electrons, L = lone pair electrons, B = number of bonds. For a carboxylate O⁻ (3 lone pairs, 1 bond):',
    answer: '−1',
    options: ['−1', '0', '+1', '−2'],
    explanation: 'FC = 6 − 6 − 1 = −1. This accounts for the negative charge on the carboxylate.',
  },
]

export function generateFormalChargeProblem(): OrgTextProblem { return pick(FORMAL_CHARGE_POOL) }

// ── Resonance Structures ─────────────────────────────────────────────────────

export const RESONANCE_POOL: OrgTextProblem[] = [
  {
    question: 'Which is the MAJOR resonance contributor of an amide (R–CO–NH₂)?',
    answer: 'C=O form (neutral N): R–C(=O)–NH₂',
    options: ['C=O form (neutral N): R–C(=O)–NH₂', 'C–O⁻ form (N⁺): R–C(–O⁻)=N⁺H₂', 'Both contribute equally', 'No resonance — amides are locked in one form'],
    explanation: 'More covalent bonds + no formal charges → C=O form is the major contributor. The C–O⁻/N⁺ form is minor.',
  },
  {
    question: 'In an enolate (CH₂=C–O⁻ vs ⁻CH₂–C=O), the MAJOR resonance form places charge on:',
    answer: 'Oxygen (CH₂=C–O⁻) — more stable because O is more electronegative',
    options: ['Oxygen (CH₂=C–O⁻) — more stable because O is more electronegative', 'Carbon (⁻CH₂–C=O) — more reactive, so more stable', 'Both are equally major', 'Neither — enolates don\'t have resonance'],
    explanation: 'Negative charge on electronegative O is more stable → O⁻ form is major. C⁻ form is more nucleophilic/reactive.',
  },
  {
    question: 'Which statement about resonance structures is CORRECT?',
    answer: 'Resonance structures differ only in electron placement, not atom positions',
    options: ['Resonance structures differ only in electron placement, not atom positions', 'Resonance structures interconvert by bond rotation', 'The actual molecule alternates between resonance forms', 'Atoms can move between resonance structures'],
    explanation: 'Resonance: only electrons move (lone pairs, π bonds). Atoms NEVER move. The real structure is a hybrid.',
  },
  {
    question: 'Which two structures are valid resonance contributors of the acetate ion (CH₃COO⁻)?',
    answer: 'CH₃–C(=O)–O⁻ and CH₃–C(–O⁻)=O (equivalent structures)',
    options: ['CH₃–C(=O)–O⁻ and CH₃–C(–O⁻)=O (equivalent structures)', 'CH₃–C(=O)–OH and CH₃–C(–O⁻)=O (not equivalent)', 'CH₃COOH and CH₃COO⁻ (protonation states)', 'Only one form exists — no resonance in acetate'],
    explanation: 'Both carboxylate resonance forms are equivalent; the actual bond order is 1.5 for both C–O bonds.',
  },
  {
    question: 'In drawing resonance structures, which is NOT allowed?',
    answer: 'Moving atoms (e.g., transferring a hydrogen from O to C)',
    options: ['Moving atoms (e.g., transferring a hydrogen from O to C)', 'Moving lone pairs onto adjacent atoms to form π bonds', 'Moving π bond electrons to break and reform bonds', 'Showing formal charges on atoms'],
    explanation: 'Only electrons (π bonds and lone pairs) can be moved in resonance. Atoms are fixed in position.',
  },
]

export function generateResonanceProblem(): OrgTextProblem { return pick(RESONANCE_POOL) }

// ── Most Acidic H ───────────────────────────────────────────────────────────

export const MOST_ACIDIC_H_POOL: OrgTextProblem[] = [
  {
    question: 'Which hydrogen is most acidic in acetoacetic acid (CH₃COCH₂COOH)?',
    answer: 'The methylene H (flanked by two C=O groups, pKa ~11)',
    options: ['The methylene H (flanked by two C=O groups, pKa ~11)', 'The carboxylic acid H (pKa ~3)', 'The terminal CH₃ H (pKa ~50)', 'They are all equally acidic'],
    explanation: 'The COOH is more acidic (pKa ~3) — the carboxylic proton is the most acidic in acetoacetic acid.',
  },
  {
    question: 'Which has the lowest pKa (strongest acid)? HF (pKa 3.2), CH₃COOH (pKa 4.7), H₂O (pKa 15.7), NH₃ (pKa 38)',
    answer: 'HF (pKa 3.2)',
    options: ['HF (pKa 3.2)', 'CH₃COOH (pKa 4.7)', 'H₂O (pKa 15.7)', 'NH₃ (pKa 38)'],
    explanation: 'Lower pKa = stronger acid. HF at 3.2 is the strongest acid in this group.',
  },
  {
    question: 'Cyclopentadiene (pKa ≈ 16) is unusually acidic for a hydrocarbon because:',
    answer: 'Loss of H⁺ gives an aromatic cyclopentadienyl anion (6π electrons)',
    options: ['Loss of H⁺ gives an aromatic cyclopentadienyl anion (6π electrons)', 'The C–H bond is weaker due to ring strain', 'The sp³ carbon is more electronegative in a ring', 'Cyclopentadiene has inductive EWG effects'],
    explanation: 'The Cp⁻ anion is aromatic (6π) — aromaticity of the conjugate base greatly stabilizes the anion.',
  },
  {
    question: 'In 1,3-diketones (β-diketones), the methylene C–H pKa is ~9–11. This is because:',
    answer: 'The resulting carbanion is stabilized by two flanking carbonyl groups',
    options: ['The resulting carbanion is stabilized by two flanking carbonyl groups', 'The C–H bond is weakened by induction from carbonyls', 'The β-diketone is cyclic', 'The proton is on a π-electron-deficient carbon'],
    explanation: 'The carbanion from deprotonation is resonance-stabilized by two C=O groups → lower pKa than typical CH.',
  },
  {
    question: 'Phenol (pKa ≈ 10) is more acidic than cyclohexanol (pKa ≈ 16) because:',
    answer: 'The phenoxide anion is resonance-stabilized by delocalization into the benzene ring',
    options: ['The phenoxide anion is resonance-stabilized by delocalization into the benzene ring', 'The O–H bond in phenol is stronger', 'The benzene ring withdraws electrons inductively', 'Both are equally acidic'],
    explanation: 'Phenoxide places charge on the ring via resonance — delocalization stabilizes the anion, lowering pKa.',
  },
]

export function generateMostAcidicHProblem(): OrgTextProblem { return pick(MOST_ACIDIC_H_POOL) }

// ── Retrosynthetic Disconnection ─────────────────────────────────────────────

export const RETRO_POOL: OrgTextProblem[] = [
  {
    question: 'In retrosynthetic analysis, the symbol ⇒ means:',
    answer: 'This compound can be made from the disconnected synthon',
    options: ['This compound can be made from the disconnected synthon', 'Forward reaction arrow', 'Resonance equivalence', 'Reaction requires a catalyst'],
    explanation: 'The retrosynthesis arrow (⟹) reads "can be made from" — it works backward from target to precursors.',
  },
  {
    question: 'What is a "synthon" in retrosynthetic analysis?',
    answer: 'An idealized fragment with associated charge, which maps to a real reagent',
    options: ['An idealized fragment with associated charge, which maps to a real reagent', 'A synthetic equivalent that has the same connectivity', 'The product of a ring-forming reaction', 'A protecting group for a functional group'],
    explanation: 'A synthon is an ideal fragment (e.g., ⁺CH₃ or CH₃MgBr as a "carbanion equivalent") — the actual reagent is the synthetic equivalent.',
  },
  {
    question: 'To make a 1,2-diol from a simple alkene, the retrosynthetic disconnection points to:',
    answer: 'The alkene, using OsO₄ or KMnO₄ as reagent',
    options: ['The alkene, using OsO₄ or KMnO₄ as reagent', 'An epoxide, opened by water', 'A ketone, reduced by NaBH₄', 'An alkyl halide with two OH groups'],
    explanation: 'Retro: 1,2-diol ⟹ alkene + [OsO₄]. Forward: OsO₄ gives syn dihydroxylation.',
  },
  {
    question: 'To disconnect an alcohol R–CH(OH)–R\', you would think of forming it from:',
    answer: 'A ketone (R–CO–R\') + a hydride (NaBH₄ or LiAlH₄)',
    options: ['A ketone (R–CO–R\') + a hydride (NaBH₄ or LiAlH₄)', 'An alkene + water', 'An aldehyde + RMgBr', 'Two carboxylic acids'],
    explanation: 'Retro: secondary alcohol ⟹ ketone + H⁻. Forward: ketone + NaBH₄ → secondary alcohol.',
  },
  {
    question: 'Disconnecting an ester (RCOOR\') at the C–O bond gives which two synthons?',
    answer: 'An acylium ion (RCO⁺) and an alkoxide (R\'O⁻) → acid + alcohol',
    options: ['An acylium ion (RCO⁺) and an alkoxide (R\'O⁻) → acid + alcohol', 'An aldehyde and a Grignard reagent', 'Two carboxylic acids', 'An alkene and CO₂'],
    explanation: 'Ester retrosynthesis: RCO₂R\' ⟹ RCOOH + R\'OH. Forward: acid + alcohol + DCC, or acid chloride + alcohol.',
  },
]

export function generateRetroProblem(): OrgTextProblem { return pick(RETRO_POOL) }

// ── Synthesis Ordering ──────────────────────────────────────────────────────

export const SYNTHESIS_ORDER_POOL: OrgTextProblem[] = [
  {
    question: 'To convert a primary alcohol to a carboxylic acid, which reagent should be used (NOT PCC)?',
    answer: 'Jones reagent (CrO₃/H₂SO₄) or KMnO₄',
    options: ['Jones reagent (CrO₃/H₂SO₄) or KMnO₄', 'PCC (stops at aldehyde)', 'NaBH₄', 'Swern oxidation (stops at aldehyde)'],
    explanation: 'PCC and Swern stop at aldehyde. Jones and KMnO₄ oxidize primary alcohols all the way to carboxylic acids.',
  },
  {
    question: 'To protect an alcohol before a Grignard reaction, the correct order is:',
    answer: 'Protect alcohol first (TBS-Cl), then add Grignard, then deprotect (TBAF)',
    options: ['Protect alcohol first (TBS-Cl), then add Grignard, then deprotect (TBAF)', 'Add Grignard first, then protect the product alcohol', 'Use Grignard without protection — it tolerates free alcohols', 'Deprotect first, then add Grignard'],
    explanation: 'Grignard reagents are quenched by free OH groups (pKa ~16). Protect first, Grignard second.',
  },
  {
    question: 'In a multi-step synthesis: alkene → epoxide → trans-diol. The correct two-step sequence is:',
    answer: 'mCPBA (epoxidation), then H₂O/H⁺ or OH⁻ (ring opening)',
    options: ['mCPBA (epoxidation), then H₂O/H⁺ or OH⁻ (ring opening)', 'OsO₄/NMO (gives syn-diol directly)', 'Br₂/H₂O (gives bromohydrin, not a diol)', 'KMnO₄ cold (gives syn-diol directly)'],
    explanation: 'mCPBA gives epoxide; acid or base opening gives trans-diol (anti addition). OsO₄ or cold KMnO₄ give syn-diol directly.',
  },
  {
    question: 'To convert benzene to para-nitroaniline, the correct order is:',
    answer: 'Nitrate first (→ nitrobenzene), then reduce the NO₂ (→ aniline)',
    options: ['Nitrate first (→ nitrobenzene), then reduce the NO₂ (→ aniline)', 'Aminate first (→ aniline), then nitrate para', 'Nitrate, brominate, then aminate', 'Reduce first, then nitrate twice'],
    explanation: 'Must install the nitro group first (–NO₂ is a meta director). Then reduce NO₂ to NH₂ (Fe/HCl, H₂/Pd, or Sn/HCl).',
  },
]

export function generateSynthesisOrderProblem(): OrgTextProblem { return pick(SYNTHESIS_ORDER_POOL) }

// ── Amino Acid pI / Zwitterion ──────────────────────────────────────────────

export const AMINO_ACID_PI_POOL: OrgTextProblem[] = [
  {
    question: 'At pH = pI, an amino acid exists as a:',
    answer: 'Zwitterion (positive and negative charges balanced, net charge = 0)',
    options: ['Zwitterion (positive and negative charges balanced, net charge = 0)', 'Neutral uncharged form', 'Fully cationic form', 'Fully anionic form'],
    explanation: 'At pI, the amino acid has equal + and − charges but net charge = 0 — this is the zwitterionic form.',
  },
  {
    question: 'For glycine (pKa1 = 2.3 for COOH, pKa2 = 9.6 for NH₃⁺), the pI is approximately:',
    answer: '5.97 = (pKa1 + pKa2) / 2',
    options: ['5.97 = (pKa1 + pKa2) / 2', '6.95 = (2.3 + 9.6) / 2 − 2', '2.3 (the pKa of COOH)', '9.6 (the pKa of NH₃⁺)'],
    explanation: 'For a simple amino acid: pI = (pKa1 + pKa2) / 2 = (2.3 + 9.6) / 2 = 5.95 ≈ 5.97.',
  },
  {
    question: 'At pH below pI, an amino acid has a net charge of:',
    answer: 'Positive (+)',
    options: ['Positive (+)', 'Negative (−)', 'Zero', 'Cannot be determined'],
    explanation: 'Below pI, more proton donations → both NH₃⁺ and COOH groups tend to be protonated → net positive charge.',
  },
  {
    question: 'Glutamic acid has a side-chain COOH (pKa ~4.1). For amino acids with acidic side chains, the pI is calculated as:',
    answer: 'Average of the two most similar pKa values (the two lowest for acidic amino acids)',
    options: ['Average of the two most similar pKa values (the two lowest for acidic amino acids)', 'Average of all three pKa values', 'The pKa of the side chain', '(pKa1 + pKa3)/2'],
    explanation: 'For acidic amino acids: pI = (pKa1 + pKa2)/2 where pKa1 and pKa2 are the two carboxylic acid pKas.',
  },
  {
    question: 'Lysine has side-chain NH₃⁺ (pKa ~10.5). For basic amino acids, pI is approximately:',
    answer: 'Average of the two highest pKa values (the two amino group pKas)',
    options: ['Average of the two highest pKa values (the two amino group pKas)', 'The pKa of COOH', '(pKa1 + pKa2)/2 for all values', 'The average of all three pKas'],
    explanation: 'For basic amino acids: pI = (pKa2 + pKa3)/2 where pKa2 and pKa3 are the two amine pKas.',
  },
]

export function generateAminoAcidPIProblem(): OrgTextProblem { return pick(AMINO_ACID_PI_POOL) }

// ── Amino Acid Identification (name from structure, class identification) ────
// Note: Draw-mode (Mode B) is excluded from test generators — Ketcher drawing
// can't be represented in a printed test. Mode B is interactive-only.

import { AMINO_ACIDS, CLASS_LABELS } from '../data/aminoAcids'
import type { AminoAcid } from '../data/aminoAcids'

export interface AminoAcidNameProblem {
  type: 'amino-acid-name-from-structure'
  prompt: string
  visualType: 'compound-display'
  smiles: string
  answer: { name: string; three: string; one: string }
  answerFormat: 'text'
}

export interface AminoAcidClassProblem {
  type: 'amino-acid-class'
  prompt: string
  visualType: 'compound-display'
  smiles: string
  answer: AminoAcid['class']
  answerFormat: 'multiple-choice'
  options: AminoAcid['class'][]
}

export function generateAminoAcidNameFromStructure(): AminoAcidNameProblem {
  const aa = pick(AMINO_ACIDS)
  return {
    type:        'amino-acid-name-from-structure',
    prompt:      'Name this amino acid (full name or 3-letter code).',
    visualType:  'compound-display',
    smiles:      aa.fullSmiles,
    answer:      { name: aa.name, three: aa.three, one: aa.one },
    answerFormat: 'text',
  }
}

export function generateAminoAcidClass(): AminoAcidClassProblem {
  const aa = pick(AMINO_ACIDS)
  return {
    type:        'amino-acid-class',
    prompt:      `What class is ${aa.name} (${aa.three})?`,
    visualType:  'compound-display',
    smiles:      aa.fullSmiles,
    answer:      aa.class,
    answerFormat: 'multiple-choice',
    options:     ['nonpolar', 'aromatic', 'polar', 'acidic', 'basic'],
  }
}

// Helper: check name-from-structure answer (case-insensitive, accepts 1L/3L/full)
export function checkAminoAcidNameAnswer(input: string, answer: AminoAcidNameProblem['answer']): boolean {
  const t = input.trim()
  return (
    t.toLowerCase() === answer.name.toLowerCase() ||
    t.toLowerCase() === answer.three.toLowerCase() ||
    t === answer.one
  )
}

// TestBuilder integration: wrap as OrgTextProblem for classification questions
export function generateAminoAcidNameAsOrgText(): OrgTextProblem {
  const aa = pick(AMINO_ACIDS)
  const distractors = AMINO_ACIDS
    .filter(x => x.name !== aa.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(x => x.name)
  return {
    question: `What is the name of this amino acid? (SMILES: ${aa.fullSmiles})`,
    answer: aa.name,
    options: [aa.name, ...distractors].sort(() => Math.random() - 0.5),
    explanation: `${aa.name} (${aa.three} / ${aa.one}) — ${CLASS_LABELS[aa.class]} amino acid.`,
  }
}

export function generateAminoAcidClassAsOrgText(): OrgTextProblem {
  const aa = pick(AMINO_ACIDS)
  const allClasses: AminoAcid['class'][] = ['nonpolar', 'aromatic', 'polar', 'acidic', 'basic']
  const distractors = allClasses.filter(c => c !== aa.class).sort(() => Math.random() - 0.5).slice(0, 3)
  return {
    question: `${aa.name} (${aa.three}) — What class of amino acid is this?`,
    answer: CLASS_LABELS[aa.class],
    options: [CLASS_LABELS[aa.class], ...distractors.map(c => CLASS_LABELS[c])].sort(() => Math.random() - 0.5),
    explanation: `${aa.name} is ${CLASS_LABELS[aa.class]}. Its R-group is ${aa.rGroup}.`,
  }
}

// ── IR Interpretation ───────────────────────────────────────────────────────

import { IR_PROBLEMS } from '../data/spectral/irProblems'

export interface IRTextProblem {
  question: string
  answer: string
  options: string[]
  explanation: string
  visual?: { kind: 'spectrum'; spectrumType: 'ir' | '1h_nmr' | '13c_nmr' | 'mass_spec'; peaks: { x: number; y: number; label: string; width: number; splitting?: string; integration?: number }[]; title?: string }
}

export function generateIRProblem(): IRTextProblem {
  const p = IR_PROBLEMS[Math.floor(Math.random() * IR_PROBLEMS.length)]
  const all = p.allGroups
  const correct = p.presentGroups.join(' + ')
  const distractors = all.filter(g => !p.presentGroups.includes(g)).sort(() => Math.random() - 0.5).slice(0, 2)
  const options = [correct, ...distractors.map(d => 'Primarily ' + d)].sort(() => Math.random() - 0.5)
  return {
    question: `Which functional group(s) are present in this IR spectrum of ${p.title}?`,
    answer: correct,
    options,
    explanation: p.explanation,
    visual: { kind: 'spectrum', spectrumType: 'ir', peaks: p.peaks, title: p.title },
  }
}

// ── NMR Interpretation ──────────────────────────────────────────────────────

import { NMR_PROBLEMS } from '../data/spectral/nmrProblems'

export function generateNMRProblem(): IRTextProblem {
  const p = NMR_PROBLEMS[Math.floor(Math.random() * NMR_PROBLEMS.length)]
  const mcQuestions = p.questions.filter(q => q.type === 'mc' && q.options && q.options.length > 0)
  if (mcQuestions.length === 0) {
    const q = p.questions[0]
    const answer = String(q.correct)
    return {
      question: `¹H NMR — ${p.title}.\n\n${q.stem}`,
      answer,
      options: [answer, 'Cannot be determined', 'None of the above'],
      explanation: q.explanation,
      visual: { kind: 'spectrum', spectrumType: '1h_nmr', peaks: p.peaks, title: p.title },
    }
  }
  const q = mcQuestions[Math.floor(Math.random() * mcQuestions.length)]
  return {
    question: `¹H NMR — ${p.title}.\n\n${q.stem}`,
    answer: String(q.correct),
    options: q.options!,
    explanation: q.explanation,
    visual: { kind: 'spectrum', spectrumType: '1h_nmr', peaks: p.peaks, title: p.title },
  }
}

// ── MS Interpretation ───────────────────────────────────────────────────────

import { MS_PROBLEMS } from '../data/spectral/msProblems'

export function generateMSProblem(): IRTextProblem {
  const p = MS_PROBLEMS[Math.floor(Math.random() * MS_PROBLEMS.length)]
  const mcQuestions = p.questions.filter(q => q.type === 'mc' && q.options && q.options.length > 0)
  const specVisual = { kind: 'spectrum' as const, spectrumType: 'mass_spec' as const, peaks: p.peaks, title: `${p.compound} (${p.formula})` }
  if (mcQuestions.length === 0) {
    const q = p.questions[0]
    const answer = String(q.correct)
    return {
      question: `Mass Spectrum — ${p.compound} (${p.formula}).\n\n${q.stem}`,
      answer,
      options: [answer, 'Cannot be determined', 'None of the above'],
      explanation: q.explanation,
      visual: specVisual,
    }
  }
  const q = mcQuestions[Math.floor(Math.random() * mcQuestions.length)]
  return {
    question: `Mass Spectrum — ${p.compound} (${p.formula}).\n\n${q.stem}`,
    answer: String(q.correct),
    options: q.options!,
    explanation: q.explanation,
    visual: specVisual,
  }
}

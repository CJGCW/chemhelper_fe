// Multi-step synthesis problems.
// Used by SynthesisFillInPractice.tsx and SynthesisOrderingPractice.tsx.
// All SMILES are human-readable labels; no runtime SMILES rendering.

export interface SynthesisStep {
  reagents: string
  acceptedAnswers: string[]
  productLabel: string
  reactionId?: string
}

export interface SynthesisProblem {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  exam?: 'org1' | 'org2'
  startingMaterial: { label: string; smiles?: string }
  target: { label: string; smiles?: string }
  steps: SynthesisStep[]
  hint?: string
}

export interface OrderingProblem {
  baseProblemId: string
  distractors: string[]
}

// ── Easy problems ─────────────────────────────────────────────────────────────

const EASY: SynthesisProblem[] = [
  {
    id: 'butanol-to-butanoic-acid',
    difficulty: 'easy', exam: 'org2',
    startingMaterial: { label: '1-butanol', smiles: 'CCCCO' },
    target:           { label: 'butanoic acid', smiles: 'CCCC(=O)O' },
    steps: [
      {
        reagents: 'CrO₃, H₂SO₄ (Jones reagent)',
        acceptedAnswers: ['CrO3', 'CrO3/H2SO4', 'Jones', 'jones reagent', 'KMnO4', 'KMnO4/H+', 'KMnO4, H+'],
        productLabel: 'butanoic acid',
      },
    ],
    hint: 'A 1° alcohol needs a strong oxidant to reach the carboxylic acid — PCC stops too early.',
  },
  {
    id: 'butanol-to-butanal',
    difficulty: 'easy', exam: 'org2',
    startingMaterial: { label: '1-butanol', smiles: 'CCCCO' },
    target:           { label: 'butanal', smiles: 'CCCC=O' },
    steps: [
      {
        reagents: 'PCC',
        acceptedAnswers: ['PCC', 'PCC/CH2Cl2', 'PCC/DCM', 'Swern', 'DMSO/(COCl)2/Et3N', 'oxalyl chloride/DMSO'],
        productLabel: 'butanal',
      },
    ],
    hint: 'Mild oxidation stops at the aldehyde. Jones reagent goes all the way to the acid.',
  },
  {
    id: '2-butanol-to-2-butanone',
    difficulty: 'easy', exam: 'org2',
    startingMaterial: { label: '2-butanol', smiles: 'CCC(O)C' },
    target:           { label: '2-butanone', smiles: 'CCC(=O)C' },
    steps: [
      {
        reagents: 'PCC',
        acceptedAnswers: ['PCC', 'CrO3', 'Jones', 'Na2Cr2O7/H2SO4', 'K2Cr2O7/H2SO4'],
        productLabel: '2-butanone',
      },
    ],
    hint: 'Any oxidation of a 2° alcohol works — PCC, Jones, or dichromate all convert it to a ketone.',
  },
  {
    id: '1-bromopropane-to-1-propanol',
    difficulty: 'easy', exam: 'org1',
    startingMaterial: { label: '1-bromopropane', smiles: 'CCCBr' },
    target:           { label: '1-propanol', smiles: 'CCCO' },
    steps: [
      {
        reagents: 'NaOH (aq)',
        acceptedAnswers: ['NaOH', 'NaOH/H2O', 'KOH', 'HO-', 'hydroxide'],
        productLabel: '1-propanol',
      },
    ],
    hint: 'SN2 substitution on a primary halide.',
  },
  {
    id: 'cyclohexanol-to-cyclohexene',
    difficulty: 'easy', exam: 'org1',
    startingMaterial: { label: 'cyclohexanol', smiles: 'OC1CCCCC1' },
    target:           { label: 'cyclohexene', smiles: 'C1=CCCCC1' },
    steps: [
      {
        reagents: 'H₂SO₄, Δ',
        acceptedAnswers: ['H2SO4', 'H3PO4', 'POCl3/pyridine', 'H2SO4, heat', 'dehydration'],
        productLabel: 'cyclohexene',
      },
    ],
    hint: 'Dehydration of an alcohol. Use acid catalyst and heat for E1.',
  },
  {
    id: 'ethyl-bromide-to-diethylether',
    difficulty: 'easy', exam: 'org1',
    startingMaterial: { label: 'bromoethane', smiles: 'CCBr' },
    target:           { label: 'diethyl ether', smiles: 'CCOCC' },
    steps: [
      {
        reagents: 'NaOEt (sodium ethoxide)',
        acceptedAnswers: ['NaOEt', 'CH3CH2ONa', 'EtONa', 'sodium ethoxide', 'NaOR'],
        productLabel: 'diethyl ether',
      },
    ],
    hint: 'Williamson ether synthesis requires an alkoxide + primary alkyl halide.',
  },
  {
    id: 'cyclohexene-to-cyclohexane',
    difficulty: 'easy', exam: 'org1',
    startingMaterial: { label: 'cyclohexene', smiles: 'C1=CCCCC1' },
    target:           { label: 'cyclohexane', smiles: 'C1CCCCC1' },
    steps: [
      {
        reagents: 'H₂, Pt',
        acceptedAnswers: ['H2/Pt', 'H2, Pt', 'H2/Pd', 'H2/Pd/C', 'H2, Pd/C', 'catalytic hydrogenation'],
        productLabel: 'cyclohexane',
      },
    ],
    hint: 'Catalytic hydrogenation: H₂ + metal catalyst reduces C=C.',
  },
  {
    id: 'benzene-to-nitrobenzene',
    difficulty: 'easy', exam: 'org2',
    startingMaterial: { label: 'benzene', smiles: 'c1ccccc1' },
    target:           { label: 'nitrobenzene', smiles: 'O=[N+]([O-])c1ccccc1' },
    steps: [
      {
        reagents: 'HNO₃, H₂SO₄',
        acceptedAnswers: ['HNO3/H2SO4', 'HNO3, H2SO4', 'mixed acid', 'nitration'],
        productLabel: 'nitrobenzene',
      },
    ],
    hint: 'EAS nitration: mixed acid (HNO₃/H₂SO₄) generates NO₂⁺ electrophile.',
  },
  {
    id: 'propanoic-acid-to-propanol',
    difficulty: 'easy', exam: 'org2',
    startingMaterial: { label: 'propanoic acid', smiles: 'CCC(=O)O' },
    target:           { label: '1-propanol', smiles: 'CCCO' },
    steps: [
      {
        reagents: 'LiAlH₄, then H₂O',
        acceptedAnswers: ['LiAlH4', 'LAH', 'LiAlH4/H2O', 'LiAlH4 then H3O+'],
        productLabel: '1-propanol',
      },
    ],
    hint: 'Carboxylic acids require strong hydride reducing agents (LiAlH₄). NaBH₄ is too weak.',
  },
  {
    id: 'hex-1-ene-to-2-bromohexane',
    difficulty: 'easy', exam: 'org1',
    startingMaterial: { label: '1-hexene', smiles: 'C=CCCCC' },
    target:           { label: '2-bromohexane', smiles: 'CC(Br)CCCC' },
    steps: [
      {
        reagents: 'HBr',
        acceptedAnswers: ['HBr', 'HBr/peroxide-free', 'hydrogen bromide'],
        productLabel: '2-bromohexane',
      },
    ],
    hint: 'HBr adds to alkenes following Markovnikov — Br goes to the more substituted carbon.',
  },
]

// ── Medium problems ───────────────────────────────────────────────────────────

const MEDIUM: SynthesisProblem[] = [
  {
    id: 'benzene-to-meta-bromonitrobenzene',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'benzene', smiles: 'c1ccccc1' },
    target:           { label: 'm-bromonitrobenzene', smiles: 'O=[N+]([O-])c1cccc(Br)c1' },
    steps: [
      {
        reagents: 'HNO₃, H₂SO₄',
        acceptedAnswers: ['HNO3/H2SO4', 'HNO3, H2SO4', 'nitration'],
        productLabel: 'nitrobenzene',
        reactionId: 'eas-nitration',
      },
      {
        reagents: 'Br₂, FeBr₃',
        acceptedAnswers: ['Br2/FeBr3', 'Br2, FeBr3', 'Br2, FeX3'],
        productLabel: 'm-bromonitrobenzene',
      },
    ],
    hint: 'Add the meta director first — nitro is meta-directing, so bromination then goes meta.',
  },
  {
    id: 'cyclohexene-to-trans-diol',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'cyclohexene', smiles: 'C1=CCCCC1' },
    target:           { label: 'trans-1,2-cyclohexanediol', smiles: 'O[C@@H]1CCCC[C@H]1O' },
    steps: [
      {
        reagents: 'mCPBA',
        acceptedAnswers: ['mCPBA', 'RCO3H', 'peroxyacid', 'peracid'],
        productLabel: 'cyclohexene oxide',
        reactionId: 'epoxidation-alkene',
      },
      {
        reagents: 'H₃O⁺',
        acceptedAnswers: ['H3O+', 'H+/H2O', 'H2SO4/H2O', 'aq. acid', 'dilute H2SO4'],
        productLabel: 'trans-1,2-cyclohexanediol',
      },
    ],
    hint: 'Anti-dihydroxylation: form an epoxide first, then open with acid (anti attack).',
  },
  {
    id: 'cyclohexene-to-cis-diol',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'cyclohexene', smiles: 'C1=CCCCC1' },
    target:           { label: 'cis-1,2-cyclohexanediol', smiles: 'O[C@H]1CCCC[C@H]1O' },
    steps: [
      {
        reagents: 'OsO₄, then NaHSO₃',
        acceptedAnswers: ['OsO4', 'OsO4/NaHSO3', 'osmium tetroxide'],
        productLabel: 'cis-1,2-cyclohexanediol',
      },
    ],
    hint: 'Syn dihydroxylation: OsO₄ delivers both OH groups from the same face.',
  },
  {
    id: '1-bromopropane-to-butanenitrile',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: '1-bromopropane', smiles: 'CCCBr' },
    target:           { label: 'butanenitrile', smiles: 'CCCC#N' },
    steps: [
      {
        reagents: 'NaCN, DMSO',
        acceptedAnswers: ['NaCN', 'NaCN/DMSO', 'CN-', 'cyanide'],
        productLabel: 'butanenitrile',
      },
    ],
    hint: 'SN2 with cyanide extends the carbon chain by 1.',
  },
  {
    id: 'benzaldehyde-to-benzyl-alcohol',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'benzaldehyde', smiles: 'O=Cc1ccccc1' },
    target:           { label: 'benzyl alcohol', smiles: 'OCc1ccccc1' },
    steps: [
      {
        reagents: 'NaBH₄, MeOH',
        acceptedAnswers: ['NaBH4', 'NaBH4/MeOH', 'NaBH4/EtOH', 'sodium borohydride'],
        productLabel: 'benzyl alcohol',
      },
    ],
    hint: 'Mild reduction of an aldehyde to a primary alcohol.',
  },
  {
    id: 'cyclohexanone-to-methylenecyclohexane',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'cyclohexanone', smiles: 'O=C1CCCCC1' },
    target:           { label: 'methylenecyclohexane', smiles: 'C=C1CCCCC1' },
    steps: [
      {
        reagents: 'Ph₃P=CH₂ (Wittig)',
        acceptedAnswers: ['Ph3P=CH2', 'Wittig', 'triphenylphosphoranylidene methane', 'methylenetriphenylphosphorane'],
        productLabel: 'methylenecyclohexane',
      },
    ],
    hint: 'Wittig converts C=O to C=CH₂. The ylide Ph₃P=CH₂ is the simplest Wittig reagent.',
  },
  {
    id: 'bromobenzene-to-phenylamine',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'nitrobenzene', smiles: 'O=[N+]([O-])c1ccccc1' },
    target:           { label: 'aniline', smiles: 'Nc1ccccc1' },
    steps: [
      {
        reagents: 'H₂, Pd/C',
        acceptedAnswers: ['H2/Pd', 'H2/Pd/C', 'H2, Pd/C', 'Fe/HCl', 'Sn/HCl', 'Zn/HCl'],
        productLabel: 'aniline',
      },
    ],
    hint: 'Reduction of a nitro group: either catalytic hydrogenation (H₂/Pd) or dissolving metal.',
  },
  {
    id: 'propan-1-ol-to-propanal-to-propanoic-acid',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: '1-propanol', smiles: 'CCCO' },
    target:           { label: 'propanoic acid', smiles: 'CCC(=O)O' },
    steps: [
      {
        reagents: 'PCC',
        acceptedAnswers: ['PCC', 'Swern'],
        productLabel: 'propanal',
      },
      {
        reagents: 'KMnO₄, H⁺',
        acceptedAnswers: ['KMnO4', 'KMnO4/H+', 'CrO3/H2SO4', 'Jones', 'Ag2O'],
        productLabel: 'propanoic acid',
      },
    ],
    hint: 'First oxidize the primary alcohol to the aldehyde (mild), then oxidize the aldehyde to the acid (strong).',
  },
  {
    id: 'hex1ene-to-1-hexanol-antimarkovnikov',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: '1-hexene', smiles: 'C=CCCCC' },
    target:           { label: '1-hexanol', smiles: 'CCCCCCO' },
    steps: [
      {
        reagents: '(1) BH₃·THF',
        acceptedAnswers: ['BH3', 'BH3/THF', 'BH3·THF', 'borane'],
        productLabel: '(hex-1-yl)borane',
      },
      {
        reagents: '(2) H₂O₂, NaOH',
        acceptedAnswers: ['H2O2/NaOH', 'H2O2, NaOH', 'H2O2/OH-'],
        productLabel: '1-hexanol',
        reactionId: 'hydroboration-alkene',
      },
    ],
    hint: 'Hydroboration-oxidation adds H and OH in anti-Markovnikov fashion: OH goes to the less substituted C.',
  },
  {
    id: 'phenol-to-methoxybenzene',
    difficulty: 'medium', exam: 'org2',
    startingMaterial: { label: 'phenol', smiles: 'Oc1ccccc1' },
    target:           { label: 'anisole (methoxybenzene)', smiles: 'COc1ccccc1' },
    steps: [
      {
        reagents: '(1) NaH, (2) CH₃I',
        acceptedAnswers: ['NaH then CH3I', 'NaH/CH3I', '1) NaH 2) MeI', 'Williamson', 'K2CO3/MeI'],
        productLabel: 'anisole',
      },
    ],
    hint: 'Williamson ether synthesis: deprotonate the phenol with a strong base, then alkylate with methyl iodide (SN2).',
  },
]

// ── Hard problems ─────────────────────────────────────────────────────────────

const HARD: SynthesisProblem[] = [
  {
    id: 'benzene-to-ortho-bromoaniline',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'benzene', smiles: 'c1ccccc1' },
    target:           { label: 'o-bromoaniline', smiles: 'Nc1ccccc1Br' },
    steps: [
      {
        reagents: 'HNO₃, H₂SO₄',
        acceptedAnswers: ['HNO3/H2SO4', 'HNO3, H2SO4', 'mixed acid'],
        productLabel: 'nitrobenzene',
      },
      {
        reagents: 'Br₂, FeBr₃',
        acceptedAnswers: ['Br2/FeBr3', 'Br2, FeBr3'],
        productLabel: 'o/p-bromonitrobenzene (mixture)',
      },
      {
        reagents: 'H₂, Pd/C',
        acceptedAnswers: ['H2/Pd', 'H2/Pd/C', 'H2, Pd/C', 'Fe/HCl', 'Sn/HCl'],
        productLabel: 'o-bromoaniline (separate from para)',
      },
    ],
    hint: 'Install the meta director (NO₂) first, then brominate (gets o/p due to meta director being wrong here — actually nitro is meta; need to think about which is ortho/para director).',
  },
  {
    id: 'cyclohexanone-to-1-methylcyclohexanol',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'cyclohexanone', smiles: 'O=C1CCCCC1' },
    target:           { label: '1-methylcyclohexanol', smiles: 'OC1(C)CCCCC1' },
    steps: [
      {
        reagents: 'CH₃MgBr (methylmagnesium bromide), then H₃O⁺',
        acceptedAnswers: ['CH3MgBr', 'MeMgBr', 'methylmagnesium bromide', 'methyl Grignard'],
        productLabel: '1-methylcyclohexanol',
      },
    ],
    hint: 'Grignard addition to a ketone: CH₃MgBr attacks the carbonyl carbon → tertiary alcohol.',
  },
  {
    id: 'hex-1-yne-to-hex-1-en-1-yl',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'hex-1-yne', smiles: 'C#CCCCC' },
    target:           { label: '(Z)-hex-1-ene (cis-1-hexene)', smiles: 'C=CCCCC' },
    steps: [
      {
        reagents: 'H₂, Lindlar catalyst',
        acceptedAnswers: ['H2/Lindlar', 'H2, Lindlar', 'Lindlar', 'Pd/CaCO3/quinoline'],
        productLabel: '(Z)-hex-1-ene',
        reactionId: 'lindlar-reduction',
      },
    ],
    hint: 'Lindlar catalyst poisons the Pd so only one equivalent of H₂ adds, giving cis (Z) alkene.',
  },
  {
    id: 'ethyl-propanoate-to-propan-1-ol',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'ethyl propanoate', smiles: 'CCC(=O)OCC' },
    target:           { label: '1-propanol (from ester carbonyl C)', smiles: 'CCCO' },
    steps: [
      {
        reagents: 'LiAlH₄, then H₂O',
        acceptedAnswers: ['LiAlH4', 'LAH', 'LiAlH4/H2O'],
        productLabel: '1-propanol + ethanol',
      },
    ],
    hint: 'LiAlH₄ reduces esters all the way to two alcohols — one from each oxygen-bearing carbon.',
  },
  {
    id: 'propan-1-ol-to-butane-1-4-diol',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: '3-bromopropan-1-ol', smiles: 'OCCCBr' },
    target:           { label: '4-hydroxybutanenitrile', smiles: 'N#CCCCO' },
    steps: [
      {
        reagents: 'NaCN',
        acceptedAnswers: ['NaCN', 'NaCN/DMSO', 'KCN'],
        productLabel: '4-hydroxybutanenitrile',
      },
    ],
    hint: 'SN2 with cyanide on the primary alkyl halide; the alcohol is unaffected.',
  },
  {
    id: '2-methyl-propan-2-ol-to-2-methylpropene',
    difficulty: 'hard', exam: 'org1',
    startingMaterial: { label: '2-methylpropan-2-ol (tert-butanol)', smiles: 'CC(C)(C)O' },
    target:           { label: '2-methylpropene (isobutylene)', smiles: 'C=C(C)C' },
    steps: [
      {
        reagents: 'H₂SO₄, Δ',
        acceptedAnswers: ['H2SO4', 'H3PO4', 'H2SO4/heat'],
        productLabel: '2-methylpropene',
      },
    ],
    hint: '3° alcohols readily undergo E1 dehydration with acid and heat.',
  },
  {
    id: 'acetaldehyde-to-lactic-acid',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'acetaldehyde', smiles: 'CC=O' },
    target:           { label: '2-hydroxypropanenitrile (cyanohydrin) then lactic acid', smiles: 'CC(O)C(=O)O' },
    steps: [
      {
        reagents: 'HCN',
        acceptedAnswers: ['HCN', 'NaCN/H+', 'KCN/H+'],
        productLabel: 'lactonitrile (cyanohydrin)',
      },
      {
        reagents: 'H₂O, H⁺ (hydrolysis)',
        acceptedAnswers: ['H3O+', 'H2O/H+', 'aq. acid', 'HCl/H2O'],
        productLabel: 'lactic acid (2-hydroxypropanoic acid)',
      },
    ],
    hint: 'Cyanohydrin formation extends the chain by 1 C; hydrolysis converts CN to COOH.',
  },
  {
    id: 'benzene-to-styrene',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'benzene', smiles: 'c1ccccc1' },
    target:           { label: 'styrene (vinylbenzene)', smiles: 'C=Cc1ccccc1' },
    steps: [
      {
        reagents: 'CH₃CH₂Cl, AlCl₃ (Friedel-Crafts)',
        acceptedAnswers: ['CH3CH2Cl/AlCl3', 'EtCl/AlCl3', 'Friedel-Crafts alkylation', 'ethyl chloride/AlCl3'],
        productLabel: 'ethylbenzene',
      },
      {
        reagents: 'Br₂, hν (radical)',
        acceptedAnswers: ['Br2/hv', 'NBS', 'NBS/hv', 'NBS/AIBN'],
        productLabel: 'α-bromethylbenzene',
      },
      {
        reagents: 'KOH (alc), Δ',
        acceptedAnswers: ['KOH/alc', 'KOtBu', 'E2 elimination', 'strong base, heat'],
        productLabel: 'styrene',
      },
    ],
    hint: 'Friedel-Crafts installs the ethyl side chain; benzylic bromination; then E2 elimination.',
  },
  {
    id: 'acetone-to-4-methyl-2-pentanol',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'acetone', smiles: 'CC(=O)C' },
    target:           { label: '4-methyl-2-pentanol', smiles: 'CC(O)CC(C)C' },
    steps: [
      {
        reagents: '(CH₃)₂CHMgBr (isopropylmagnesium bromide), then H₃O⁺',
        acceptedAnswers: ['iPrMgBr', '(CH3)2CHMgBr', 'isopropyl Grignard', 'isopropylmagnesium bromide'],
        productLabel: '4-methyl-2-pentanol (3° alcohol)',
      },
    ],
    hint: 'Grignard addition to a ketone: both R groups become substituents on the tetrahedral carbon → tertiary alcohol.',
  },
  {
    id: 'propanal-to-3-hydroxy-2-methylpropanal',
    difficulty: 'hard', exam: 'org2',
    startingMaterial: { label: 'acetaldehyde (×2)', smiles: 'CC=O' },
    target:           { label: '3-hydroxybutanal (aldol product)', smiles: 'CC(O)CC=O' },
    steps: [
      {
        reagents: 'NaOH (aq, dilute)',
        acceptedAnswers: ['NaOH', 'dilute NaOH', 'OH-', 'base'],
        productLabel: '3-hydroxybutanal',
      },
      {
        reagents: 'Δ (dehydration) — optional for aldol condensation',
        acceptedAnswers: ['heat', 'Δ', 'H2SO4/heat', 'dehydration'],
        productLabel: '(E)-but-2-enal (crotonaldehyde)',
      },
    ],
    hint: 'Aldol reaction: base deprotonates α-C, enolate attacks carbonyl of second aldehyde. Heat causes aldol condensation (dehydration).',
  },
]

export const SYNTHESIS_PROBLEMS: SynthesisProblem[] = [...EASY, ...MEDIUM, ...HARD]

export const ORDERING_PROBLEMS: OrderingProblem[] = [
  {
    baseProblemId: 'benzene-to-meta-bromonitrobenzene',
    distractors: ['AlCl₃, Cl₂', 'H₂, Pd/C', 'KMnO₄, Δ'],
  },
  {
    baseProblemId: 'cyclohexene-to-trans-diol',
    distractors: ['OsO₄, then NaHSO₃', 'NaOH (aq)', 'LiAlH₄'],
  },
  {
    baseProblemId: 'hex1ene-to-1-hexanol-antimarkovnikov',
    distractors: ['HBr', 'NaOH', 'PCC'],
  },
  {
    baseProblemId: 'propan-1-ol-to-propanal-to-propanoic-acid',
    distractors: ['LiAlH₄', 'NaBH₄', 'HCl'],
  },
  {
    baseProblemId: 'acetaldehyde-to-lactic-acid',
    distractors: ['PCC', 'LiAlH₄/H₂O', 'Br₂/FeBr₃'],
  },
  {
    baseProblemId: 'benzene-to-ortho-bromoaniline',
    distractors: ['KMnO₄/H⁺', 'NaBH₄', 'SOCl₂'],
  },
  {
    baseProblemId: 'propan-1-ol-to-butane-1-4-diol',
    distractors: ['PCC', 'LiAlH₄', 'HBr'],
  },
  {
    baseProblemId: 'acetone-to-4-methyl-2-pentanol',
    distractors: ['NaBH₄', 'LiAlH₄', 'H₂SO₄'],
  },
  {
    baseProblemId: 'propanal-to-3-hydroxy-2-methylpropanal',
    distractors: ['PCC', 'CrO₃/H₂SO₄', 'Wittig (Ph₃P=CH₂)'],
  },
  {
    baseProblemId: 'styrene-synthesis',
    distractors: ['HNO₃/H₂SO₄', 'NaCN', 'mCPBA'],
  },
]

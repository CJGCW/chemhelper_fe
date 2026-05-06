// Retrosynthesis disconnection problems.
// Used by RetroDisconnectionPractice.tsx.

export interface RetroBond {
  id: string
  description: string
}

export interface RetroProblem {
  id: string
  target: { label: string; smiles?: string }
  bonds: RetroBond[]
  correctBondId: string
  synthons: { nucleophile: string; electrophile: string }
  forwardReaction: string
  forwardReactionId?: string
  whyOthersFail: Record<string, string>
  hint?: string
}

export const RETRO_PROBLEMS: RetroProblem[] = [
  {
    id: 'methyl-isopropyl-ether',
    target: { label: 'methyl isopropyl ether (methoxypropane)', smiles: 'COC(C)C' },
    bonds: [
      { id: 'methyl-O',    description: 'CH₃ — O bond (methyl side)' },
      { id: 'O-isopropyl', description: 'O — CH(CH₃)₂ bond (isopropyl side)' },
    ],
    correctBondId: 'methyl-O',
    synthons: { nucleophile: '⁻O-CH(CH₃)₂ (isopropoxide)', electrophile: 'CH₃X (methyl halide)' },
    forwardReaction: 'Williamson ether synthesis (SN2)',
    forwardReactionId: 'williamson-ether',
    whyOthersFail: {
      'O-isopropyl': 'Disconnecting here would need a 2° alkyl halide as the electrophile. SN2 on a 2° halide is slow and gives competing E2 with a strong alkoxide. Always use the 1° alkyl halide as the electrophile in Williamson.',
    },
    hint: 'In Williamson ether synthesis, one fragment must be a 1° alkyl halide (SN2-friendly). Disconnect the bond to the smaller / less hindered carbon.',
  },
  {
    id: 'mesityl-oxide',
    target: { label: '4-methylpent-3-en-2-one (mesityl oxide)', smiles: 'CC(=O)C=C(C)C' },
    bonds: [
      { id: 'alpha-beta-CC', description: 'C=C between α and β carbons (the enone double bond)' },
      { id: 'methyl-CO',     description: 'CH₃ — C(=O) bond (terminal methyl on carbonyl)' },
    ],
    correctBondId: 'alpha-beta-CC',
    synthons: { nucleophile: 'acetone enolate (α-C)', electrophile: 'acetone carbonyl C' },
    forwardReaction: 'Aldol condensation (self-aldol of acetone)',
    forwardReactionId: 'aldol-condensation',
    whyOthersFail: {
      'methyl-CO': 'This bond doesn\'t match a common functional group formation. The α,β-unsaturated carbonyl is the hallmark of aldol condensation (dehydration of the aldol product).',
    },
    hint: 'An α,β-unsaturated carbonyl traces back to an aldol condensation. Disconnect the C=C to identify the two carbonyl fragments.',
  },
  {
    id: '1-methylcyclohexanol',
    target: { label: '1-methylcyclohexanol', smiles: 'OC1(C)CCCCC1' },
    bonds: [
      { id: 'C-CH3',    description: 'C — CH₃ bond (methyl to ring C)' },
      { id: 'C-OH',     description: 'C — OH bond (hydroxy group)' },
      { id: 'ring-C',   description: 'Any ring C — C bond' },
    ],
    correctBondId: 'C-CH3',
    synthons: { nucleophile: 'CH₃MgBr (methylmagnesium bromide)', electrophile: 'cyclohexanone (C=O)' },
    forwardReaction: 'Grignard addition to a ketone',
    whyOthersFail: {
      'C-OH': 'Disconnecting C–OH points to reduction of the ketone, but that gives a secondary alcohol — not tertiary. The methyl substituent must come from a nucleophilic addition.',
      'ring-C': 'Ring C–C disconnection requires ring-forming reactions; simpler Grignard strategy is better for this target.',
    },
    hint: 'A tertiary alcohol is the product of Grignard (or RLi) addition to a ketone. Identify the ketone precursor and the organometallic.',
  },
  {
    id: 'trans-2-bromocyclohexanol',
    target: { label: 'trans-2-bromocyclohexanol', smiles: 'O[C@@H]1CCCC[C@H]1Br' },
    bonds: [
      { id: 'C-Br',  description: 'C — Br bond (at C2)' },
      { id: 'C-OH',  description: 'C — OH bond (at C1)' },
    ],
    correctBondId: 'C-Br',
    synthons: { nucleophile: 'Br⁻ (water or bromide)', electrophile: 'cyclohexene oxide (epoxide)' },
    forwardReaction: 'Halohydrin formation or acid-catalyzed epoxide opening with Br⁻',
    whyOthersFail: {
      'C-OH': 'Disconnecting C–OH points to hydration of cyclohexene, which gives only the alcohol — not the vicinal halohydrin.',
    },
    hint: 'trans-vicinal halohydrins come from anti addition. Epoxide + HBr or halohydrin formation from Br₂/H₂O.',
  },
  {
    id: 'ethyl-hexanoate',
    target: { label: 'ethyl hexanoate', smiles: 'CCCCCC(=O)OCC' },
    bonds: [
      { id: 'ester-O-Et',  description: 'O — CH₂CH₃ bond (ethoxy side)' },
      { id: 'ester-CO',    description: 'C(=O) — O bond (carbonyl–oxygen)' },
    ],
    correctBondId: 'ester-CO',
    synthons: { nucleophile: 'EtOH (ethanol)', electrophile: 'hexanoyl chloride or hexanoic acid' },
    forwardReaction: 'Fischer esterification or acylation',
    whyOthersFail: {
      'ester-O-Et': 'Disconnecting the alkyl C–O gives an alkoxide + acyl fragment; that\'s Williamson-style and requires an acyl halide as electrophile — uncommon for esters from acyl chlorides.',
    },
    hint: 'Esters disconnect at the C(=O)–O bond into a carboxylic acid (or acyl derivative) + alcohol.',
  },
  {
    id: 'n-butylamine',
    target: { label: 'n-butylamine (butan-1-amine)', smiles: 'CCCCN' },
    bonds: [
      { id: 'C-N',        description: 'C — NH₂ bond' },
      { id: 'N-H-first',  description: 'N — H bond (deprotonation)' },
    ],
    correctBondId: 'C-N',
    synthons: { nucleophile: 'NH₃ or phthalimide anion', electrophile: 'n-BuX (1° alkyl halide)' },
    forwardReaction: 'Gabriel synthesis (or azide SN2 + reduction)',
    whyOthersFail: {
      'N-H-first': 'N–H disconnection gives an anion — not a useful retrosynthetic move; it doesn\'t point to a forward reaction.',
    },
    hint: 'Primary amines come from Gabriel synthesis (phthalimide/SN2), or azide substitution + LiAlH₄ reduction.',
  },
  {
    id: 'phenyl-2-hydroxyethyl-ketone',
    target: { label: '1-phenyl-2-hydroxyethan-1-one (2-hydroxy acetophenone)', smiles: 'OCC(=O)c1ccccc1' },
    bonds: [
      { id: 'C-CO-Ph',   description: 'Ph — C(=O) bond' },
      { id: 'alpha-C-OH', description: 'α-C — OH bond' },
    ],
    correctBondId: 'alpha-C-OH',
    synthons: { nucleophile: 'HCN', electrophile: 'benzaldehyde (C=O)' },
    forwardReaction: 'Cyanohydrin formation, then partial hydrolysis',
    whyOthersFail: {
      'C-CO-Ph': 'Disconnecting at Ph–CO gives benzene + acyl fragment → Friedel-Crafts acylation. That gives acetophenone, not the α-hydroxy compound.',
    },
    hint: 'α-hydroxy carbonyls can come from cyanohydrin formation (aldehyde + HCN), then oxidation or hydrolysis.',
  },
  {
    id: 'diethylether',
    target: { label: 'diethyl ether', smiles: 'CCOCC' },
    bonds: [
      { id: 'C1-O',  description: 'First C — O bond' },
      { id: 'O-C2',  description: 'Second C — O bond' },
    ],
    correctBondId: 'C1-O',
    synthons: { nucleophile: 'EtO⁻ (ethoxide)', electrophile: 'EtX (ethyl halide)' },
    forwardReaction: 'Williamson ether synthesis (SN2)',
    whyOthersFail: {
      'O-C2': 'Both bonds are identical for diethyl ether — either disconnection gives the same synthons (ethoxide + ethyl halide). For asymmetric ethers, always break the bond to the less hindered (1°) alkyl group.',
    },
    hint: 'For symmetric ethers, either bond gives the same reactants. For asymmetric ethers, disconnect at the less hindered carbon.',
  },
  {
    id: 'benzyl-methyl-ether',
    target: { label: 'benzyl methyl ether', smiles: 'COCc1ccccc1' },
    bonds: [
      { id: 'BnCH2-O',  description: 'PhCH₂ — O bond (benzyl side)' },
      { id: 'O-CH3',    description: 'O — CH₃ bond (methyl side)' },
    ],
    correctBondId: 'O-CH3',
    synthons: { nucleophile: 'PhCH₂O⁻ (benzyl alkoxide)', electrophile: 'CH₃X (methyl halide)' },
    forwardReaction: 'Williamson ether synthesis using benzyl alcohol + NaH, then CH₃I',
    whyOthersFail: {
      'BnCH2-O': 'Disconnecting here puts the benzyl group as the electrophile (benzyl halide), which could work by SN2 (benzylic position activates it), but the safer Williamson route avoids making a benzyl halide if possible.',
    },
    hint: 'In Williamson: use the less-hindered fragment as the electrophile (alkyl halide) and the more-complex alcohol as the nucleophile (alkoxide).',
  },
  {
    id: 'sec-butyl-phenyl-ketone',
    target: { label: 'pentan-2-one (sec-butyl methyl ketone)', smiles: 'CCCC(=O)C' },
    bonds: [
      { id: 'CO-CH3',   description: 'C(=O) — CH₃ bond (methyl side)' },
      { id: 'CO-sBu',   description: 'C(=O) — CH₂CH₂CH₃ bond (propyl side)' },
    ],
    correctBondId: 'CO-sBu',
    synthons: { nucleophile: 'CH₃⁻ (methyl nucleophile, e.g. CH₃MgBr) + oxidation', electrophile: 'butyraldehyde (C=O)' },
    forwardReaction: 'Grignard addition to aldehyde → secondary alcohol, then oxidation; or Friedel-Crafts acylation for aryl ketones',
    whyOthersFail: {
      'CO-CH3': 'Disconnecting the methyl–C(=O) bond gives an acyl fragment + CH₃⁻. Methyl Grignard on an ester would give a ketone but tends to over-react. FC acylation with CH₃COCl is better for aryl ketones.',
    },
    hint: 'Ketones come from Grignard + aldehyde + oxidation, from FC acylation, or from secondary alcohol oxidation. Choose the cleanest disconnection based on substitution pattern.',
  },
  {
    id: 'propyl-cyanide',
    target: { label: 'butanenitrile (propyl cyanide)', smiles: 'CCCC#N' },
    bonds: [
      { id: 'C-CN',  description: 'C — CN bond' },
      { id: 'CN-N',  description: 'C ≡ N (internal nitrile bond)' },
    ],
    correctBondId: 'C-CN',
    synthons: { nucleophile: 'CN⁻ (cyanide)', electrophile: '1-bromopropane (or 1-chloropropane)' },
    forwardReaction: 'SN2 alkylation with sodium cyanide; extends chain by 1 carbon',
    whyOthersFail: {
      'CN-N': 'Disconnecting inside the triple bond isn\'t a retrosynthetic move — the C≡N bond doesn\'t disconnect in useful ways synthetically.',
    },
    hint: 'Nitrile C–C bonds disconnect to give alkyl halide + cyanide (SN2). The key feature is +1 carbon extension.',
  },
  {
    id: 'hexan-1-ol-from-alkene',
    target: { label: 'hexan-1-ol (anti-Markovnikov)', smiles: 'CCCCCCO' },
    bonds: [
      { id: 'C1-OH',  description: 'C1 — OH bond (terminal OH)' },
      { id: 'C2-OH',  description: 'C2 — OH bond (internal OH)' },
    ],
    correctBondId: 'C1-OH',
    synthons: { nucleophile: 'BH₃ + H₂O₂/NaOH', electrophile: 'hex-1-ene' },
    forwardReaction: 'Hydroboration-oxidation (anti-Markovnikov, syn)',
    whyOthersFail: {
      'C2-OH': 'OH at C2 would come from Markovnikov hydration (Hg(OAc)₂/NaBH₄ or H₃O⁺ with rearrangement). Not anti-Markovnikov.',
    },
    hint: 'Terminal alcohols from terminal alkenes require anti-Markovnikov addition: hydroboration-oxidation (BH₃ then H₂O₂/NaOH).',
  },
  {
    id: 'N-ethylacetamide',
    target: { label: 'N-ethylacetamide', smiles: 'CCNC(=O)C' },
    bonds: [
      { id: 'C=O-N',   description: 'C(=O) — N bond' },
      { id: 'N-Et',    description: 'N — CH₂CH₃ bond' },
    ],
    correctBondId: 'C=O-N',
    synthons: { nucleophile: 'ethylamine (EtNH₂)', electrophile: 'acetyl chloride (CH₃COCl) or acetic anhydride' },
    forwardReaction: 'Amide bond formation: amine + acyl chloride or anhydride',
    whyOthersFail: {
      'N-Et': 'N–alkyl disconnection gives an amide anion + alkyl halide. That would require N-alkylation of an existing amide — possible but less direct.',
    },
    hint: 'Amides form most cleanly by disconnecting the C(=O)–N bond: amine + acyl derivative (chloride, anhydride, or ester).',
  },
  {
    id: 'hex-2-yne-retro',
    target: { label: 'hex-2-yne (internal alkyne)', smiles: 'CC#CCCC' },
    bonds: [
      { id: 'C1-C2-triple',  description: 'C1 — C2 bond adjacent to C≡C (ethyl side)' },
      { id: 'C2-C3-triple',  description: 'C3 — C4 bond adjacent to C≡C (1-propynyl side)' },
    ],
    correctBondId: 'C1-C2-triple',
    synthons: { nucleophile: 'prop-1-yne anion (CH≡C⁻ + alkylation)', electrophile: 'ethyl bromide' },
    forwardReaction: 'Terminal alkyne deprotonation + SN2 alkylation',
    whyOthersFail: {
      'C2-C3-triple': 'Either side of an internal alkyne gives a valid disconnection; choose the shorter alkyl group as the electrophile to minimize steric problems in SN2.',
    },
    hint: 'Internal alkynes disconnect to terminal alkyne anion + alkyl halide. The alkyne anion (formed with NaNH₂) does SN2 on the alkyl halide.',
  },
  {
    id: 'grignard-alcohol-3',
    target: { label: '2-methylpentan-2-ol', smiles: 'CC(C)(O)CCC' },
    bonds: [
      { id: 'C-CH3-quat',   description: 'C(OH) — CH₃ bond (methyl substituent)' },
      { id: 'C-nPr-quat',   description: 'C(OH) — nPr bond (propyl substituent)' },
      { id: 'C-Et-quat',    description: 'C(OH) — Et bond (methyl from ketone precursor)' },
    ],
    correctBondId: 'C-nPr-quat',
    synthons: { nucleophile: 'n-PrMgBr (propylmagnesium bromide)', electrophile: 'acetone (propan-2-one)' },
    forwardReaction: 'Grignard addition to acetone',
    whyOthersFail: {
      'C-CH3-quat': 'MeMgBr + 2-pentanone also works but requires a less-available ketone starting material.',
      'C-Et-quat': 'EtMgBr + methylpropanoate could work (2 additions) but Grignard on esters over-reacts; acetone is cleaner.',
    },
    hint: 'For tertiary alcohols, identify the ketone/aldehyde and two Grignard pathways — pick the simplest starting materials.',
  },
  {
    id: 'retro-gabriel',
    target: { label: 'pentylamine (pentan-1-amine)', smiles: 'CCCCCN' },
    bonds: [
      { id: 'C5-NH2',  description: 'C5 — NH₂ bond' },
    ],
    correctBondId: 'C5-NH2',
    synthons: { nucleophile: 'phthalimide anion (or N₃⁻)', electrophile: '1-bromopentane' },
    forwardReaction: 'Gabriel synthesis (phthalimide → SN2 → hydrazinolysis) or azide route (NaN₃ then LiAlH₄)',
    whyOthersFail: {},
    hint: 'Primary amines from primary alkyl halides: Gabriel synthesis avoids over-alkylation.',
  },
  {
    id: 'aldol-product',
    target: { label: '3-hydroxybutanal (aldol product from acetaldehyde)', smiles: 'CC(O)CC=O' },
    bonds: [
      { id: 'C2-C3-OH',   description: 'α-C — β-C bond (between the two acetaldehyde units)' },
      { id: 'C-OH-only',  description: 'C3 — OH bond' },
    ],
    correctBondId: 'C2-C3-OH',
    synthons: { nucleophile: 'acetaldehyde enolate (α-C)', electrophile: 'acetaldehyde carbonyl C' },
    forwardReaction: 'Aldol reaction (base-catalyzed self-condensation of acetaldehyde)',
    whyOthersFail: {
      'C-OH-only': 'Disconnecting C–OH alone gives a ketone + H⁻ — that points to reduction, not aldol.',
    },
    hint: 'β-hydroxy carbonyl compounds are the aldol products. Disconnect at the Cα–Cβ bond to find two carbonyl fragments.',
  },
  {
    id: 'methyl-butanoate',
    target: { label: 'methyl butanoate', smiles: 'CCCC(=O)OC' },
    bonds: [
      { id: 'ester-CO-O',  description: 'C(=O) — O bond' },
      { id: 'O-CH3',       description: 'O — CH₃ bond' },
    ],
    correctBondId: 'ester-CO-O',
    synthons: { nucleophile: 'methanol', electrophile: 'butanoic acid (or butanoyl chloride)' },
    forwardReaction: 'Fischer esterification (H⁺, Δ) or acylation with butanoyl chloride + MeOH',
    whyOthersFail: {
      'O-CH3': 'Disconnecting O–Me gives methyl cation + carboxylate — that\'s an SN2 retrosynthesis (carboxylate + MeX). Also valid but less atom-efficient than Fischer.',
    },
    hint: 'Esters disconnect at C(=O)–O: the acid (or acyl chloride) + alcohol.',
  },
  {
    id: 'williamson-2',
    target: { label: 'tert-butyl methyl ether', smiles: 'CC(C)(C)OC' },
    bonds: [
      { id: 'C-tBu-O',   description: 'tBu — O bond' },
      { id: 'O-Me',      description: 'O — CH₃ bond' },
    ],
    correctBondId: 'O-Me',
    synthons: { nucleophile: 'tert-butoxide (tBuO⁻)', electrophile: 'methyl iodide (CH₃I)' },
    forwardReaction: 'Williamson ether synthesis: NaOtBu + CH₃I',
    whyOthersFail: {
      'C-tBu-O': 'Disconnecting here would need tert-butyl halide as the electrophile. SN2 on a 3° carbon is essentially impossible — the major product would be the E2 alkene.',
    },
    hint: 'Critical: in Williamson synthesis with a tert group, the 3° carbon must be the alkoxide (nucleophile), and the methyl/primary group must be the alkyl halide (electrophile).',
  },
  {
    id: 'wittig-product',
    target: { label: '(Z)-stilbene (cis-1,2-diphenylethylene)', smiles: 'c1ccc(/C=C\\c2ccccc2)cc1' },
    bonds: [
      { id: 'C=C-bond',    description: 'C=C double bond between the two phenyl-bearing carbons' },
    ],
    correctBondId: 'C=C-bond',
    synthons: { nucleophile: 'Ph-CH=PPh₃ (benzylidenetriphenylphosphorane)', electrophile: 'benzaldehyde (PhCHO)' },
    forwardReaction: 'Wittig reaction (non-stabilized ylide → cis alkene)',
    whyOthersFail: {},
    hint: 'Alkenes (especially internal ones with defined geometry) disconnect at the C=C bond → Wittig. Identify aldehyde and phosphorus ylide.',
  },
]

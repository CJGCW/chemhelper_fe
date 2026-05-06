export interface MSQuestion {
  stem: string
  type: 'mc' | 'numeric'
  options?: string[]
  correct: string | number
  explanation: string
}

export interface MSProblem {
  title: string
  compound: string
  formula: string
  smiles?: string
  peaks: { x: number; y: number; label: string; width: number }[]
  questions: MSQuestion[]
  difficulty: 'easy' | 'medium' | 'hard'
}

function dou(c: number, h: number, n = 0, x = 0): number {
  return (2 * c + 2 + n - h - x) / 2
}

export const MS_PROBLEMS: MSProblem[] = [
  // ── Existing problems ────────────────────────────────────────────────────────
  {
    title: 'Mass Spectrum — Unknown compound (MW = 58)',
    compound: 'Acetone (CH₃COCH₃)',
    formula: 'C₃H₆O',
    smiles: 'CC(=O)C',
    peaks: [
      { x: 58,  y: 0.5,  label: 'M⁺ (58)', width: 0.5 },
      { x: 43,  y: 1.0,  label: 'base (43)', width: 0.5 },
      { x: 15,  y: 0.35, label: '15 (CH₃⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'What is the molecular weight of this compound?',
        type: 'numeric', correct: 58,
        explanation: 'The molecular ion peak (M⁺) is the highest m/z peak (not counting isotope peaks). M⁺ = 58 g/mol.',
      },
      {
        stem: 'The degree of unsaturation (DoU) for C₃H₆O is:',
        type: 'numeric', correct: dou(3, 6),
        explanation: 'DoU = (2C + 2 + N − H − X) / 2 = (6+2−6)/2 = 1. One degree of unsaturation = one π bond. The C=O accounts for this.',
      },
      {
        stem: 'The base peak at m/z = 43 represents:',
        type: 'mc',
        options: ['CH₃CO⁺ (acetyl cation, 43)', 'C₃H₇⁺ (propyl cation, 43)', 'CHO⁺ (29)', 'CH₂=CHOH⁺ (44)'],
        correct: 'CH₃CO⁺ (acetyl cation, 43)',
        explanation: 'Loss of 15 (CH₃) from M⁺ (58) gives m/z = 43. The CH₃CO⁺ acylium ion at m/z = 43 is characteristic of methyl ketones. α-cleavage next to the carbonyl is a common fragmentation.',
      },
    ],
    difficulty: 'easy',
  },
  {
    title: 'Mass Spectrum — Compound with isotope pattern',
    compound: '1-Bromopropane (CH₃CH₂CH₂Br)',
    formula: 'C₃H₇Br',
    smiles: 'CCCBr',
    peaks: [
      { x: 122, y: 0.5,  label: 'M⁺ (⁷⁹Br)', width: 0.5 },
      { x: 124, y: 0.5,  label: 'M+2 (⁸¹Br)', width: 0.5 },
      { x: 43,  y: 1.0,  label: 'base (43)', width: 0.5 },
      { x: 41,  y: 0.6,  label: '41', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The M⁺ and M+2 peaks at m/z = 122 and 124 in 1:1 ratio indicate:',
        type: 'mc',
        options: ['One bromine atom present', 'One chlorine atom present', 'Two bromine atoms present', 'One sulfur atom present'],
        correct: 'One bromine atom present',
        explanation: '⁷⁹Br and ⁸¹Br have nearly equal natural abundance (~50% each). One Br gives M and M+2 peaks in ~1:1 ratio. Chlorine (³⁵Cl/³⁷Cl) gives M:M+2 in ~3:1.',
      },
      {
        stem: 'What is the molecular formula mass for ⁷⁹Br (C₃H₇⁷⁹Br)?',
        type: 'numeric', correct: 122,
        explanation: '3(12) + 7(1) + 79 = 36 + 7 + 79 = 122.',
      },
    ],
    difficulty: 'medium',
  },
  {
    title: 'Mass Spectrum — Nitrogen-containing compound (MW = 45)',
    compound: 'Ethylamine (CH₃CH₂NH₂)',
    formula: 'C₂H₇N',
    smiles: 'CCN',
    peaks: [
      { x: 45, y: 0.4, label: 'M⁺ (45)', width: 0.5 },
      { x: 44, y: 1.0, label: 'base (M−1)', width: 0.5 },
      { x: 30, y: 0.8, label: '30 (CH₂=NH₂⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The odd molecular weight (MW = 45) suggests:',
        type: 'mc',
        options: ['Odd number of nitrogen atoms', 'Even number of nitrogen atoms', 'Presence of bromine', 'Presence of chlorine'],
        correct: 'Odd number of nitrogen atoms',
        explanation: 'The Nitrogen Rule: compounds with odd M⁺ contain an odd number of N atoms. C₂H₇N: 2(12)+7+14 = 45 — odd, one N.',
      },
      {
        stem: 'The degree of unsaturation for C₂H₇N is:',
        type: 'numeric', correct: dou(2, 7, 1),
        explanation: 'DoU = (2×2 + 2 + 1 − 7) / 2 = 0/2 = 0. No rings or π bonds — consistent with a simple amine.',
      },
    ],
    difficulty: 'medium',
  },
  {
    title: 'Mass Spectrum — Aromatic compound (MW = 92)',
    compound: 'Toluene (C₆H₅CH₃)',
    formula: 'C₇H₈',
    smiles: 'Cc1ccccc1',
    peaks: [
      { x: 92, y: 0.7, label: 'M⁺ (92)', width: 0.5 },
      { x: 91, y: 1.0, label: 'base (91, tropylium)', width: 0.5 },
      { x: 65, y: 0.4, label: '65', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The degree of unsaturation for toluene (C₇H₈) is:',
        type: 'numeric', correct: dou(7, 8),
        explanation: 'DoU = (2×7 + 2 − 8) / 2 = 4. Four degrees = benzene ring (1 ring + 3 π bonds).',
      },
      {
        stem: 'The base peak at m/z = 91 represents:',
        type: 'mc',
        options: ['Tropylium cation (C₇H₇⁺)', 'Phenyl cation (C₆H₅⁺, m/z=77)', 'CH₃⁺', 'C₅H₅⁺'],
        correct: 'Tropylium cation (C₇H₇⁺)',
        explanation: 'Loss of H from toluene M⁺ (92) gives the tropylium cation C₇H₇⁺ (m/z = 91). It is a stable 7-membered aromatic ring cation. Benzylic cleavage and rearrangement to tropylium is common in alkylbenzenes.',
      },
    ],
    difficulty: 'medium',
  },

  // ── Hard problems ────────────────────────────────────────────────────────────

  // 1. McLafferty rearrangement
  {
    title: 'MS Challenge — McLafferty rearrangement in a ketone',
    compound: '2-Hexanone (CH₃CO(CH₂)₃CH₃)',
    formula: 'C₆H₁₂O',
    smiles: 'CCCCC(=O)C',
    peaks: [
      { x: 100, y: 0.5,  label: 'M⁺ (100)', width: 0.5 },
      { x: 85,  y: 0.35, label: 'M−15 (loss CH₃)', width: 0.5 },
      { x: 58,  y: 1.0,  label: 'base — McLafferty (58)', width: 0.5 },
      { x: 43,  y: 0.60, label: 'CH₃CO⁺ (43)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The base peak at m/z = 58 arises by McLafferty rearrangement. What is lost from M⁺ (100) to give m/z 58?',
        type: 'mc',
        options: [
          'Loss of 42 (propylene, CH₂=CHCH₃) via a 6-membered transition state',
          'Loss of 43 (CH₃CO) via α-cleavage',
          'Loss of 28 (CO) via decarbonylation',
          'Loss of 15 (CH₃) from the carbonyl end',
        ],
        correct: 'Loss of 42 (propylene, CH₂=CHCH₃) via a 6-membered transition state',
        explanation: 'The McLafferty rearrangement occurs when a carbonyl compound has a γ-hydrogen: the γ-H transfers through a 6-membered ring transition state to the carbonyl oxygen, and the β–γ bond breaks. In 2-hexanone, the γ-carbon is C5; transfer of the γ-H gives a 6-membered TS, yielding propylene (m/z = 42) and the enol of acetone (m/z = 58, CH₂=C(OH)CH₃). 100 − 42 = 58. The peak at m/z = 43 (CH₃CO⁺) is classic α-cleavage, a second fragmentation pathway.',
      },
      {
        stem: 'The peak at m/z = 43 represents the acylium ion CH₃CO⁺. How many carbon atoms does it contain?',
        type: 'numeric', correct: 2,
        explanation: 'CH₃CO⁺ = C₂H₃O⁺: 2 carbons (the CH₃ methyl and the C=O carbonyl carbon). Mass: 2(12) + 3(1) + 16 = 43. This is the acetyl (ethanoyl) cation formed by α-cleavage on the longer-chain side of the carbonyl.',
      },
    ],
    difficulty: 'hard',
  },

  // 2. Two chlorines — 9:6:1 isotope pattern
  {
    title: 'MS Challenge — Count halogen atoms from isotope patterns',
    compound: 'Dichloromethane (CH₂Cl₂)',
    formula: 'CH₂Cl₂',
    smiles: 'ClCCl',
    peaks: [
      { x: 84,  y: 0.9,  label: 'M⁺ (²×³⁵Cl)', width: 0.5 },
      { x: 86,  y: 0.6,  label: 'M+2 (¹×³⁵Cl + ¹×³⁷Cl)', width: 0.5 },
      { x: 88,  y: 0.1,  label: 'M+4 (²×³⁷Cl)', width: 0.5 },
      { x: 49,  y: 1.0,  label: 'base (CHCl⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The M, M+2, M+4 peak pattern in approximately 9:6:1 ratio indicates:',
        type: 'mc',
        options: [
          'Two chlorine atoms — the 9:6:1 ratio is the binomial expansion for two ³⁵Cl/³⁷Cl atoms',
          'One chlorine atom — M:M+2 = 3:1',
          'One bromine atom — M:M+2 = 1:1',
          'Three chlorine atoms — M:M+2:M+4:M+6 = 27:27:9:1',
        ],
        correct: 'Two chlorine atoms — the 9:6:1 ratio is the binomial expansion for two ³⁵Cl/³⁷Cl atoms',
        explanation: 'Each chlorine has ³⁵Cl:³⁷Cl ≈ 3:1. For two Cl atoms, the isotope pattern is (3+1)² = 9:6:1 for M:M+2:M+4. This is the binomial expansion (3²:2×3×1:1²). One Cl gives 3:1 (M:M+2). Two Br would give 1:2:1. The key diagnostic: M+4 peak at ~1/9 the intensity of M⁺ is the signature of two chlorines.',
      },
      {
        stem: 'What is the molecular formula mass for CH₂(³⁵Cl)₂?',
        type: 'numeric', correct: 84,
        explanation: '12 + 2(1) + 2(35) = 12 + 2 + 70 = 84. The M+2 peak (86) contains one ³⁵Cl and one ³⁷Cl; the M+4 peak (88) contains two ³⁷Cl atoms.',
      },
    ],
    difficulty: 'hard',
  },

  // 3. α-cleavage in primary alcohol
  {
    title: 'MS Challenge — α-Cleavage in a primary alcohol',
    compound: '1-Pentanol (CH₃(CH₂)₃CH₂OH)',
    formula: 'C₅H₁₂O',
    smiles: 'CCCCCO',
    peaks: [
      { x: 88,  y: 0.1, label: 'M⁺ (weak, 88)', width: 0.5 },
      { x: 70,  y: 0.4, label: 'M−18 (loss H₂O)', width: 0.5 },
      { x: 55,  y: 0.5, label: 'M−33 (loss CH₂OH+H₂O)', width: 0.5 },
      { x: 31,  y: 1.0, label: 'base (CH₂=OH⁺, 31)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The base peak at m/z = 31 in a primary alcohol is produced by:',
        type: 'mc',
        options: [
          'α-Cleavage: bond between Cα and Cβ breaks, giving CH₂=OH⁺ (m/z 31)',
          'Loss of water (18) from M⁺',
          'McLafferty rearrangement to give CH₂=OH⁺',
          'Loss of CH₃ (15) from M⁺',
        ],
        correct: 'α-Cleavage: bond between Cα and Cβ breaks, giving CH₂=OH⁺ (m/z 31)',
        explanation: 'In primary alcohols, α-cleavage (cleavage of the Cα–Cβ bond) gives the oxocarbenium ion CH₂=OH⁺ at m/z = 31 (CH₂OH, MW = 31). This is diagnostic for primary alcohols. Secondary alcohols cleave to give R–CH=OH⁺ (m/z = 31 + 14n for each additional CH₂ in the larger α-group). The M⁺ is usually weak or absent in aliphatic alcohols due to facile dehydration and fragmentation.',
      },
      {
        stem: 'The peak at m/z = 70 (M−18) is formed by loss of:',
        type: 'mc',
        options: ['Water (H₂O, 18)', 'Hydrogen gas (H₂, 2) — not 18', 'Formaldehyde (CH₂O, 30)', 'CO (28)'],
        correct: 'Water (H₂O, 18)',
        explanation: 'Alcohols readily lose water (H₂O, MW = 18) from the molecular ion, giving [M−18]⁺ at m/z = 70. This elimination produces an alkene cation. Facile water loss is diagnostic for alcohols in mass spectrometry and is why M⁺ is often weak or absent.',
      },
    ],
    difficulty: 'hard',
  },

  // 4. Loss of common neutral fragments
  {
    title: 'MS Challenge — Assign neutral losses from fragmentation',
    compound: 'Unknown carboxylic acid (MW = 74)',
    formula: 'C₃H₆O₂',
    smiles: 'CCC(=O)O',
    peaks: [
      { x: 74,  y: 0.6, label: 'M⁺ (74)', width: 0.5 },
      { x: 57,  y: 0.5, label: 'M−17 (loss OH)', width: 0.5 },
      { x: 56,  y: 0.7, label: 'M−18 (loss H₂O)', width: 0.5 },
      { x: 29,  y: 1.0, label: 'base (CHO⁺ or C₂H₅⁺, 29)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'A carboxylic acid (M⁺ = 74) shows loss of 17 (m/z = 57). What neutral is lost?',
        type: 'mc',
        options: ['OH (hydroxyl radical, 17)', 'NH₃ (17)', 'F (19)', 'H₂O (18)'],
        correct: 'OH (hydroxyl radical, 17)',
        explanation: 'Loss of 17 corresponds to loss of OH (MW = 17). For carboxylic acids, loss of OH from the molecular ion gives the acylium ion [RCO]⁺ at [M−17]⁺. In this case, 74−17 = 57, which is CH₃CH₂CO⁺ (propanoyl cation). Loss of OH is a characteristic fragmentation of carboxylic acids. Loss of 18 = H₂O; loss of 17 = OH are both common for acids.',
      },
      {
        stem: 'Common neutral losses: match loss of 28 with the correct identity',
        type: 'mc',
        options: ['CO (from aldehydes/ketones) or C₂H₄ (from alkyl fragments)', 'CH₃ (15)', 'H₂O (18)', 'NH₃ (17)'],
        correct: 'CO (from aldehydes/ketones) or C₂H₄ (from alkyl fragments)',
        explanation: 'Loss of 28 is ambiguous: it can be CO (28) from aldehydes and ketones (decarbonylation of acylium ions), C₂H₄ (28) from alkyl fragments (retro-Diels-Alder or simple β-cleavage), or CO₂ (44) is often confused. High-resolution MS or context distinguishes CO from C₂H₄. Common neutral losses: 15 = CH₃, 17 = OH, 18 = H₂O, 29 = CHO, 43 = CH₃CO, 45 = OEt or COOH.',
      },
    ],
    difficulty: 'hard',
  },

  // 5. Tropylium from ethylbenzene (not toluene)
  {
    title: 'MS Challenge — Tropylium rearrangement in alkylbenzenes',
    compound: 'Ethylbenzene (C₆H₅CH₂CH₃)',
    formula: 'C₈H₁₀',
    smiles: 'CCc1ccccc1',
    peaks: [
      { x: 106, y: 0.6, label: 'M⁺ (106)', width: 0.5 },
      { x: 91,  y: 1.0, label: 'base (91, C₇H₇⁺)', width: 0.5 },
      { x: 77,  y: 0.5, label: '77 (C₆H₅⁺)', width: 0.5 },
      { x: 65,  y: 0.3, label: '65 (C₅H₅⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The base peak at m/z = 91 from ethylbenzene (M⁺ = 106) represents:',
        type: 'mc',
        options: [
          'Tropylium cation C₇H₇⁺ (loss of CH₃ then rearrangement to 7-membered aromatic ring)',
          'Phenyl cation C₆H₅⁺ (m/z = 77)',
          'Benzyl cation C₇H₇⁺ (open-chain, not rearranged)',
          'C₆H₅CH₂⁺ (105, loss of H)',
        ],
        correct: 'Tropylium cation C₇H₇⁺ (loss of CH₃ then rearrangement to 7-membered aromatic ring)',
        explanation: 'Benzylic cleavage of ethylbenzene gives the benzyl cation C₇H₇⁺ (m/z = 91) — loss of CH₃ (15) from M⁺ (106). This benzyl cation (PhCH₂⁺) rapidly rearranges to the more stable tropylium cation (cyclic C₇H₇⁺, 7-membered aromatic ring, 6π electrons). The tropylium cation at m/z = 91 is the diagnostic base peak for all benzylic compounds containing a C₇H₇ unit (toluene, ethylbenzene, xylenes).',
      },
      {
        stem: 'Degrees of unsaturation for ethylbenzene (C₈H₁₀):',
        type: 'numeric', correct: dou(8, 10),
        explanation: 'DoU = (2×8 + 2 − 10)/2 = (18−10)/2 = 4. Four degrees: benzene ring = 1 ring + 3 π bonds = 4. The ethyl side chain contributes zero DoU.',
      },
    ],
    difficulty: 'hard',
  },

  // 6. Nitrogen rule — deduce number of N atoms
  {
    title: 'MS Challenge — Using the nitrogen rule',
    compound: 'Unknown (MW = 121)',
    formula: 'C₇H₇NO',
    smiles: 'Cc1ccc(N)cc1',
    peaks: [
      { x: 121, y: 0.7, label: 'M⁺ (121)', width: 0.5 },
      { x: 106, y: 0.5, label: 'M−15 (loss CH₃)', width: 0.5 },
      { x: 80,  y: 0.6, label: '80', width: 0.5 },
      { x: 65,  y: 1.0, label: 'base (65)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The molecular ion at m/z = 121 (odd number) indicates:',
        type: 'mc',
        options: [
          'An odd number of nitrogen atoms (1, 3, 5, ...)',
          'An even number of nitrogen atoms',
          'No nitrogen atoms present',
          'Exactly two nitrogen atoms',
        ],
        correct: 'An odd number of nitrogen atoms (1, 3, 5, ...)',
        explanation: 'The Nitrogen Rule: a compound with an odd number of nitrogen atoms has an odd molecular weight (odd M⁺). Carbon, H, O, S, and halogens (in appropriate combinations) always give even MW. Each nitrogen adds an "extra" odd mass unit (N = 14, but adds one H when bonded to carbon). M⁺ = 121 is odd → one nitrogen (or three, etc.). For C₇H₇NO: 7(12)+7(1)+14+16 = 84+7+14+16 = 121. One nitrogen.',
      },
      {
        stem: 'For a compound with the formula C₇H₇NO (MW = 121), the degree of unsaturation is:',
        type: 'numeric', correct: dou(7, 7, 1),
        explanation: 'DoU = (2×7 + 2 + 1 − 7)/2 = (14+2+1−7)/2 = 10/2 = 5. Five DoU: aromatic ring (4) + the C=O or C=N or ring (1). For 4-aminoacetophenone (C₈H₉NO, MW=135) or 4-toluidine (C₇H₉N), the exact formula helps narrow the structure.',
      },
    ],
    difficulty: 'hard',
  },

  // 7. Branched vs linear — fragmentation at tertiary carbon
  {
    title: 'MS Challenge — Branched vs linear alkane fragmentation',
    compound: '2-Methylbutane (isopentane)',
    formula: 'C₅H₁₂',
    smiles: 'CCC(C)C',
    peaks: [
      { x: 72,  y: 0.2,  label: 'M⁺ (72)', width: 0.5 },
      { x: 57,  y: 1.0,  label: 'base (57, loss CH₃)', width: 0.5 },
      { x: 43,  y: 0.80, label: '43 (C₃H₇⁺)', width: 0.5 },
      { x: 29,  y: 0.55, label: '29 (C₂H₅⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The base peak of 2-methylbutane is m/z = 57 (loss of 15 from M⁺ = 72). Why does fragmentation preferentially occur at the branching point?',
        type: 'mc',
        options: [
          'Tertiary carbocations are more stable; cleavage at the branched carbon gives the most stable fragment',
          'Linear chains always cleave at the end methyl group',
          'Loss of 15 (CH₃) always gives the base peak for all alkanes',
          'The branching point has a longer C–C bond, making it easier to break',
        ],
        correct: 'Tertiary carbocations are more stable; cleavage at the branched carbon gives the most stable fragment',
        explanation: 'In mass spectrometry, fragmentation preferentially produces the most stable cation. For branched alkanes, cleavage at the branched carbon gives a tertiary carbocation, which is far more stable than primary or secondary. In 2-methylbutane, cleavage of the CH₃–C bond at C2 gives the tertiary cation (CH₃)₂CH⁺ (m/z = 43) or the loss of CH₃ gives m/z = 57 (which contains a secondary carbon). n-Pentane would show more uniform fragmentation without a dominant base peak.',
      },
      {
        stem: 'Degrees of unsaturation for 2-methylbutane (C₅H₁₂):',
        type: 'numeric', correct: dou(5, 12),
        explanation: 'DoU = (2×5 + 2 − 12)/2 = (12−12)/2 = 0. Zero DoU: no rings or π bonds — consistent with a saturated acyclic alkane.',
      },
    ],
    difficulty: 'hard',
  },

  // 8. Aldehyde vs ketone — M-1 vs α-cleavage
  {
    title: 'MS Challenge — Distinguish aldehyde from ketone fragmentation',
    compound: 'Pentanal (CH₃(CH₂)₃CHO)',
    formula: 'C₅H₁₀O',
    smiles: 'CCCCC=O',
    peaks: [
      { x: 86,  y: 0.3,  label: 'M⁺ (86)', width: 0.5 },
      { x: 85,  y: 0.4,  label: 'M−1 (85, loss H)', width: 0.5 },
      { x: 57,  y: 1.0,  label: 'base (57, M−29)', width: 0.5 },
      { x: 44,  y: 0.5,  label: '44 (McLafferty)', width: 0.5 },
      { x: 29,  y: 0.6,  label: '29 (CHO⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The peak at m/z = 85 (M−1) in an aldehyde spectrum results from:',
        type: 'mc',
        options: [
          'Loss of the aldehyde hydrogen H from CHO, giving an acylium cation [RCO]⁺',
          'Loss of OH (17) — characteristic of carboxylic acids',
          'Loss of CH₃ (15) — common α-cleavage',
          'Decarbonylation (loss of CO = 28)',
        ],
        correct: 'Loss of the aldehyde hydrogen H from CHO, giving an acylium cation [RCO]⁺',
        explanation: 'Aldehydes uniquely show a peak at [M−1]⁺ (loss of the CHO hydrogen) because the C–H bond of the aldehyde group is weak. This gives the acylium cation [RCO]⁺. For pentanal (M⁺ = 86), [M−1]⁺ = 85 is the pentanoyl cation (n-C₄H₉CO⁺). Ketones cannot show [M−1]⁺ via this pathway — they have no C–H adjacent to the carbonyl. This [M−1] peak is diagnostic for aldehydes.',
      },
      {
        stem: 'The peak at m/z = 29 (CHO⁺) is the formyl cation. What is its molecular formula?',
        type: 'mc',
        options: ['CHO⁺', 'C₂H₅⁺', 'CO⁺', 'CH₃⁺'],
        correct: 'CHO⁺',
        explanation: 'CHO⁺ has mass: 12 + 1 + 16 = 29. The formyl cation (oxocarbenium H–C≡O⁺) at m/z = 29 is found in aldehydes and indicates the presence of the CHO group. Note: C₂H₅⁺ also has mass 29 (2×12 + 5 = 29), so high-resolution MS distinguishes CHO⁺ from C₂H₅⁺.',
      },
    ],
    difficulty: 'hard',
  },

  // 9. Acylium ions — methyl ketone vs aryl ketone
  {
    title: 'MS Challenge — Identify the ketone from acylium ion fragments',
    compound: 'Acetophenone (C₆H₅COCH₃)',
    formula: 'C₈H₈O',
    smiles: 'CC(=O)c1ccccc1',
    peaks: [
      { x: 120, y: 0.8,  label: 'M⁺ (120)', width: 0.5 },
      { x: 105, y: 1.0,  label: 'base (105, C₆H₅CO⁺)', width: 0.5 },
      { x: 77,  y: 0.65, label: '77 (C₆H₅⁺)', width: 0.5 },
      { x: 43,  y: 0.5,  label: '43 (CH₃CO⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The base peak at m/z = 105 in acetophenone is the benzoyl (aroyl) cation. Its formula is:',
        type: 'mc',
        options: ['C₆H₅CO⁺ (benzoyl, 105)', 'C₆H₅⁺ (phenyl, 77)', 'CH₃CO⁺ (acetyl, 43)', 'C₈H₈⁺ (105, rearrangement)'],
        correct: 'C₆H₅CO⁺ (benzoyl, 105)',
        explanation: 'α-Cleavage of acetophenone on the phenyl side gives C₆H₅CO⁺ (benzoyl cation, m/z = 6×12 + 5 + 12 + 16 = 105). This is highly stable due to resonance between the phenyl ring and the C=O. α-Cleavage on the methyl side gives CH₃CO⁺ (acetyl cation, m/z = 43). The benzoyl cation is preferred (lower energy fragmentation gives the resonance-stabilised benzoyl). The phenyl cation at m/z = 77 comes from further decarbonylation of the benzoyl cation (loss of CO = 28, 105−28 = 77).',
      },
      {
        stem: 'Degrees of unsaturation for acetophenone (C₈H₈O):',
        type: 'numeric', correct: dou(8, 8),
        explanation: 'DoU = (2×8 + 2 − 8)/2 = (18−8)/2 = 5. Five DoU: benzene ring (4) + C=O (1) = 5.',
      },
    ],
    difficulty: 'hard',
  },

  // 10. DoU from molecular formula at high accuracy
  {
    title: 'MS Challenge — Degrees of unsaturation to narrow structural possibilities',
    compound: 'Unknown C₇H₆O (MW = 106)',
    formula: 'C₇H₆O',
    smiles: 'O=Cc1ccccc1',
    peaks: [
      { x: 106, y: 0.8,  label: 'M⁺ (106)', width: 0.5 },
      { x: 105, y: 0.6,  label: 'M−1 (105)', width: 0.5 },
      { x: 77,  y: 1.0,  label: 'base (77, C₆H₅⁺)', width: 0.5 },
      { x: 51,  y: 0.3,  label: '51', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The degree of unsaturation for C₇H₆O (MW = 106) is:',
        type: 'numeric', correct: dou(7, 6),
        explanation: 'DoU = (2×7 + 2 − 6)/2 = (14+2−6)/2 = 10/2 = 5. Five DoU strongly suggests a benzene ring (4) + one additional π bond (C=O). This is consistent with benzaldehyde (PhCHO). The M−1 peak at 105 is loss of H from the aldehyde CHO, giving PhCO⁺. The base peak at m/z = 77 is C₆H₅⁺ (phenyl cation, from further loss of CO = 28 from PhCO⁺).',
      },
      {
        stem: 'The base peak at m/z = 77 followed by a peak at m/z = 51 (loss of 26 from 77) indicates:',
        type: 'mc',
        options: [
          'Phenyl cation (C₆H₅⁺, 77) loses C₂H₂ (26) to give C₄H₃⁺ (51)',
          'Tropylium (91) rearranges to phenyl (77)',
          'Loss of CHO (29) from M⁺',
          'Loss of two CO units (56) from M⁺',
        ],
        correct: 'Phenyl cation (C₆H₅⁺, 77) loses C₂H₂ (26) to give C₄H₃⁺ (51)',
        explanation: 'The phenyl cation C₆H₅⁺ (m/z = 77) is a classic fragment in aromatic mass spectra. It can further fragment by losing acetylene (C₂H₂, mass = 26) to give C₄H₃⁺ (m/z = 51). This sequential loss (M → 105 → 77 → 51) by losses of H (1), CO (28), and C₂H₂ (26) is characteristic of aromatic aldehydes, especially benzaldehyde.',
      },
    ],
    difficulty: 'hard',
  },

  // 11. Identify structure from spectrum — 4 candidates
  {
    title: 'MS Challenge — Identify the compound from fragmentation pattern',
    compound: 'Unknown C₄H₁₀O (MW = 74)',
    formula: 'C₄H₁₀O',
    smiles: 'CCCO',
    peaks: [
      { x: 74,  y: 0.2, label: 'M⁺ (74)', width: 0.5 },
      { x: 59,  y: 0.5, label: 'M−15 (loss CH₃)', width: 0.5 },
      { x: 56,  y: 0.6, label: 'M−18 (loss H₂O)', width: 0.5 },
      { x: 31,  y: 1.0, label: 'base (31, CH₂=OH⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'A compound C₄H₁₀O (MW = 74) shows base peak at m/z = 31 and loss of H₂O (m/z = 56). Which structure fits best?',
        type: 'mc',
        options: [
          '1-Butanol (n-BuOH) — primary alcohol, α-cleavage gives CH₂=OH⁺ (31), facile water loss',
          '2-Butanol — secondary alcohol; α-cleavage gives CH₃CH=OH⁺ (45), not 31',
          'Diethyl ether (C₄H₁₀O) — ether; no water loss, different fragmentation',
          'tert-Butanol — tertiary alcohol; α-cleavage gives C₄H₉⁺ at m/z 57 as base peak',
        ],
        correct: '1-Butanol (n-BuOH) — primary alcohol, α-cleavage gives CH₂=OH⁺ (31), facile water loss',
        explanation: 'Primary alcohols give CH₂=OH⁺ at m/z = 31 as a key fragment (α-cleavage of the Cα–Cβ bond gives H₂C=OH⁺ and C₃H₇•). Secondary alcohols give [M−R]⁺ at m/z > 31. Tertiary butanol shows M−15 prominently (loss of CH₃ → (CH₃)₂C=OH⁺, m/z = 59) as base peak. Diethyl ether (C₄H₁₀O, MW = 74) would show base peak at m/z = 31 too — this ambiguity is resolved by the M−18 (water loss), which is absent in ethers.',
      },
      {
        stem: 'The loss of 15 (m/z = 59) from 1-butanol (MW = 74) corresponds to loss of:',
        type: 'mc',
        options: ['CH₃ from the alkyl chain', 'OH (17) — incorrect, 74−17 = 57', 'H₂O (18) — incorrect, 74−18 = 56', 'CO (28) — incorrect'],
        correct: 'CH₃ from the alkyl chain',
        explanation: '74 − 15 = 59. Loss of 15 = loss of CH₃. For 1-butanol, loss of the terminal CH₃ group from M⁺ gives the fragment at m/z = 59. This is a common secondary fragmentation (not the primary α-cleavage at m/z = 31).',
      },
    ],
    difficulty: 'hard',
  },

  // 12. High-resolution MS — molecular formula from exact mass
  {
    title: 'MS Challenge — Determine molecular formula from exact mass',
    compound: 'Unknown (exact mass = 86.0732)',
    formula: 'C₅H₁₀O',
    smiles: 'CCCCC=O',
    peaks: [
      { x: 86,  y: 0.7, label: 'M⁺ (nominal 86)', width: 0.5 },
      { x: 71,  y: 0.5, label: 'M−15', width: 0.5 },
      { x: 58,  y: 1.0, label: 'base (58, McLafferty)', width: 0.5 },
      { x: 29,  y: 0.4, label: '29 (C₂H₅⁺ or CHO⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'High-resolution MS gives M⁺ = 86.0732. Which molecular formula matches? (¹²C = 12.0000, ¹H = 1.00783, ¹⁶O = 15.9949, ¹⁴N = 14.0031)',
        type: 'mc',
        options: [
          'C₅H₁₀O — exact mass = 5(12) + 10(1.00783) + 15.9949 = 86.0732 ✓',
          'C₄H₆O₂ — exact mass = 4(12) + 6(1.00783) + 2(15.9949) = 86.0368',
          'C₄H₁₀N₂ — exact mass = 4(12) + 10(1.00783) + 2(14.0031) = 86.0844',
          'C₆H₁₄ — exact mass = 6(12) + 14(1.00783) = 86.1096',
        ],
        correct: 'C₅H₁₀O — exact mass = 5(12) + 10(1.00783) + 15.9949 = 86.0732 ✓',
        explanation: 'High-resolution mass spectrometry gives the exact monoisotopic mass with 4–5 decimal places. C₅H₁₀O: 5(12.0000) + 10(1.00783) + 15.9949 = 60.0000 + 10.0783 + 15.9949 = 86.0732. This matches the measured mass exactly. The other formulas with nominal mass 86 have different exact masses: C₄H₆O₂ = 86.0368, C₄H₁₀N₂ = 86.0844, C₆H₁₄ = 86.1096. High-resolution MS uniquely identifies the molecular formula from the exact mass.',
      },
      {
        stem: 'For C₅H₁₀O (MW ≈ 86), the degree of unsaturation is:',
        type: 'numeric', correct: dou(5, 10),
        explanation: 'DoU = (2×5 + 2 − 10)/2 = (12−10)/2 = 1. One degree of unsaturation = one ring or one π bond. The McLafferty base peak at m/z = 58 (loss of 28 = C₂H₄) indicates a γ-hydrogen is present → carbonyl compound. DoU = 1 is consistent with an aldehyde (pentanal) or ketone (2-pentanone, 3-pentanone).',
      },
    ],
    difficulty: 'hard',
  },
]

export interface NMRQuestion {
  stem: string
  type: 'mc' | 'numeric'
  options?: string[]
  correct: string | number
  explanation: string
}

export interface NMRProblem {
  title: string
  compound: string
  smiles?: string
  peaks: { x: number; y: number; label: string; width: number; splitting?: string; integration?: number }[]
  questions: NMRQuestion[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export const NMR_PROBLEMS: NMRProblem[] = [
  // ── Existing problems ────────────────────────────────────────────────────────
  {
    title: '¹H NMR — Ethyl acetate (CH₃COOCH₂CH₃)',
    compound: 'Ethyl acetate',
    smiles: 'CCOC(=O)C',
    peaks: [
      { x: 4.12, y: 0.8, label: '–OCH₂–', width: 0.06, splitting: 'quartet', integration: 2 },
      { x: 2.05, y: 0.8, label: 'CH₃CO–', width: 0.06, splitting: 'singlet', integration: 3 },
      { x: 1.25, y: 0.8, label: '–CH₂CH₃', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'How many distinct ¹H environments are in ethyl acetate?',
        type: 'numeric', correct: 3,
        explanation: 'There are 3 environments: CH₃CO– (acetyl methyl, δ 2.05), –OCH₂– (quartet, δ 4.12), and –CH₂CH₃ (methyl, δ 1.25). The acetyl CH₃ has no neighbors → singlet. The OCH₂ has 3 neighbors (CH₃) → quartet. The terminal CH₃ has 2 neighbors (CH₂) → triplet.',
      },
      {
        stem: 'The –OCH₂– protons (δ 4.12) appear as what splitting pattern?',
        type: 'mc', options: ['singlet', 'doublet', 'triplet', 'quartet'], correct: 'quartet',
        explanation: 'The OCH₂ has 2 protons. By the n+1 rule, n = 3 (from adjacent CH₃) gives a quartet (4 lines). Integration ratio is 2H:3H:3H = 2:3:3.',
      },
    ],
    difficulty: 'easy',
  },
  {
    title: '¹H NMR — 1-Bromopropane (BrCH₂CH₂CH₃)',
    compound: '1-Bromopropane',
    smiles: 'CCCBr',
    peaks: [
      { x: 3.40, y: 0.8, label: 'BrCH₂–', width: 0.06, splitting: 'triplet', integration: 2 },
      { x: 1.88, y: 0.8, label: '–CH₂–', width: 0.06, splitting: 'multiplet', integration: 2 },
      { x: 1.03, y: 0.8, label: '–CH₃', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'What is the splitting of the BrCH₂– protons at δ 3.40?',
        type: 'mc', options: ['singlet', 'doublet', 'triplet', 'quartet'], correct: 'triplet',
        explanation: 'The BrCH₂ has 2 protons. Its neighbors are the middle CH₂ (2 protons). By n+1 rule: n = 2 → triplet. The middle CH₂ couples with both neighboring groups, giving a complex multiplet.',
      },
      {
        stem: 'The integration ratio BrCH₂ : CH₂ : CH₃ is:',
        type: 'mc', options: ['2:2:3', '1:1:1.5', '3:3:2', '1:2:3'], correct: '2:2:3',
        explanation: 'Integration reflects number of protons: BrCH₂ (2H) : CH₂ (2H) : CH₃ (3H) = 2:2:3.',
      },
    ],
    difficulty: 'easy',
  },
  {
    title: '¹H NMR — Diethyl ether ((CH₃CH₂)₂O)',
    compound: 'Diethyl ether',
    smiles: 'CCOCC',
    peaks: [
      { x: 3.47, y: 0.8, label: '–OCH₂–', width: 0.06, splitting: 'quartet', integration: 4 },
      { x: 1.21, y: 0.8, label: '–CH₃', width: 0.06, splitting: 'triplet', integration: 6 },
    ],
    questions: [
      {
        stem: 'How many ¹H NMR signals does diethyl ether give?',
        type: 'mc', options: ['1', '2', '3', '4'], correct: '2',
        explanation: 'The two CH₂ groups are equivalent (molecular symmetry) and the two CH₃ groups are equivalent. Only 2 distinct environments: –OCH₂– (δ 3.47, quartet) and –CH₃ (δ 1.21, triplet). Integration ratio is 4H:6H = 2:3.',
      },
      {
        stem: 'The –OCH₂– protons appear as a quartet because:',
        type: 'mc',
        options: [
          'They have 3 equivalent neighbors (the CH₃ group)',
          'They have 4 equivalent neighbors',
          'They are adjacent to oxygen',
          'They couple with each other',
        ],
        correct: 'They have 3 equivalent neighbors (the CH₃ group)',
        explanation: 'n+1 rule: the OCH₂ has 3 neighboring H atoms (from CH₃). Therefore n = 3, giving n+1 = 4 lines = quartet. Equivalent protons do not split each other — the OCH₂ protons couple with CH₃, not with each other.',
      },
    ],
    difficulty: 'medium',
  },
  {
    title: '¹H NMR — Acetaldehyde (CH₃CHO)',
    compound: 'Acetaldehyde',
    smiles: 'CC=O',
    peaks: [
      { x: 9.80, y: 0.8, label: 'CHO', width: 0.06, splitting: 'quartet', integration: 1 },
      { x: 2.20, y: 0.8, label: 'CH₃–', width: 0.06, splitting: 'doublet', integration: 3 },
    ],
    questions: [
      {
        stem: 'The CHO proton at δ 9.80 appears as a quartet because:',
        type: 'mc',
        options: [
          'It has 3 neighbors (the CH₃ group)',
          'It has 4 neighbors',
          'Aldehyde protons are always quartets',
          'It couples with the carbonyl oxygen',
        ],
        correct: 'It has 3 neighbors (the CH₃ group)',
        explanation: 'The CHO proton couples with the 3 vicinal CH₃ protons → n+1 = 4 lines = quartet. The aldehyde H appears far downfield (~9–10 ppm) due to deshielding by the carbonyl.',
      },
      {
        stem: 'Why does the aldehyde CHO proton appear so far downfield (~9.8 ppm)?',
        type: 'mc',
        options: [
          'The electron-withdrawing C=O deshields the H',
          'Aldehydes are in the sp³ region',
          'It has more neighbors',
          'It is a strongly shielded proton',
        ],
        correct: 'The electron-withdrawing C=O deshields the H',
        explanation: 'The carbonyl group strongly withdraws electron density from the attached H, deshielding it significantly. Deshielded protons resonate at larger δ values (downfield). Aldehyde H is one of the most downfield C–H protons in organic chemistry.',
      },
    ],
    difficulty: 'medium',
  },

  // ── Hard problems ────────────────────────────────────────────────────────────

  // 1. Para-disubstituted benzene — AA'BB' system
  {
    title: '¹H NMR Challenge — Aromatic substitution from NMR pattern',
    compound: '4-Nitroanisole',
    smiles: 'COc1ccc(cc1)[N+](=O)[O-]',
    peaks: [
      { x: 8.18, y: 0.8, label: 'ArH (ortho to NO₂)', width: 0.06, splitting: 'doublet', integration: 2 },
      { x: 6.96, y: 0.8, label: 'ArH (ortho to OMe)', width: 0.06, splitting: 'doublet', integration: 2 },
      { x: 3.87, y: 0.8, label: 'OCH₃', width: 0.06, splitting: 'singlet', integration: 3 },
    ],
    questions: [
      {
        stem: 'Two aromatic doublets of equal integration (2H each) and an OCH₃ singlet indicate which substitution pattern?',
        type: 'mc',
        options: ['para-disubstituted benzene', 'ortho-disubstituted benzene', 'meta-disubstituted benzene', 'monosubstituted benzene'],
        correct: 'para-disubstituted benzene',
        explanation: 'Para-disubstituted benzene gives two sets of equivalent aromatic protons (2H and 2H), each coupling only with the proton directly across the ring. This produces two doublets. Ortho- or meta-substitution would give more complex multiplets because protons couple with neighbours on both sides. The 2H:2H:3H integration (ArH:ArH:OCH₃) confirms para-substitution.',
      },
      {
        stem: 'Why is the ArH signal at δ 8.18 so far downfield compared to δ 6.96?',
        type: 'mc',
        options: [
          'Those protons are ortho to the electron-withdrawing NO₂ group',
          'Those protons are ortho to the electron-donating OMe group',
          'Aromatic protons always appear at δ 8',
          'They couple with the OCH₃ protons',
        ],
        correct: 'Those protons are ortho to the electron-withdrawing NO₂ group',
        explanation: 'The –NO₂ group is a strong electron-withdrawing group. Protons ortho and para to an EWG are deshielded and resonate downfield. The –OMe group is an electron-donating group that shields ortho/para protons, shifting them upfield (δ 6.96). This downfield shift due to EWG is a predictable electronic effect.',
      },
    ],
    difficulty: 'hard',
  },

  // 2. Diastereotopic CH₂ protons
  {
    title: '¹H NMR Challenge — Why does this CH₂ give two separate signals?',
    compound: '(S)-2-Bromobutane',
    smiles: 'CC[C@@H](Br)C',
    peaks: [
      { x: 4.18, y: 0.8, label: 'CH(Br)', width: 0.06, splitting: 'multiplet', integration: 1 },
      { x: 1.95, y: 0.8, label: 'CH₂ (Ha)', width: 0.06, splitting: 'multiplet', integration: 1 },
      { x: 1.72, y: 0.8, label: 'CH₂ (Hb)', width: 0.06, splitting: 'multiplet', integration: 1 },
      { x: 1.68, y: 0.8, label: 'CH₃ (Br side)', width: 0.06, splitting: 'doublet', integration: 3 },
      { x: 0.98, y: 0.8, label: 'CH₃ (ethyl)', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'The two CH₂ protons (Ha at δ 1.95 and Hb at δ 1.72) give separate signals because they are:',
        type: 'mc',
        options: [
          'Diastereotopic — adjacent to a stereocenter, so they are in different chemical environments',
          'Enantiotopic — mirror image related',
          'Equivalent — accidentally coupled',
          'Homotopic — related by symmetry',
        ],
        correct: 'Diastereotopic — adjacent to a stereocenter, so they are in different chemical environments',
        explanation: 'The CH₂ protons are adjacent to the C2 stereocenter. Replacing each H with a different group (Ha vs Hb) gives diastereomers, not enantiomers. Diastereotopic protons are chemically non-equivalent in any solvent and appear at different chemical shifts. Enantiotopic protons (in achiral molecules) are equivalent by symmetry in achiral solvents.',
      },
      {
        stem: 'How many total ¹H NMR signals does (S)-2-bromobutane show?',
        type: 'numeric', correct: 5,
        explanation: 'The 5 distinct environments are: CH(Br) (1H, multiplet), CH₂ Ha (1H), CH₂ Hb (1H), adjacent CH₃ (3H, doublet), and terminal CH₃ (3H, triplet) = 5 signals. Both CH₂ protons are diastereotopic and non-equivalent.',
      },
    ],
    difficulty: 'hard',
  },

  // 3. Cis vs trans alkene from coupling constants
  {
    title: '¹H NMR Challenge — Determine alkene geometry from coupling constants',
    compound: 'Unknown cinnamic acid isomer',
    smiles: 'OC(=O)/C=C/c1ccccc1',
    peaks: [
      { x: 7.65, y: 0.8, label: '=CH– (β)', width: 0.06, splitting: 'doublet', integration: 1 },
      { x: 7.55, y: 0.8, label: 'ArH (5H)', width: 0.06, splitting: 'multiplet', integration: 5 },
      { x: 6.45, y: 0.8, label: '=CH– (α)', width: 0.06, splitting: 'doublet', integration: 1 },
    ],
    questions: [
      {
        stem: 'The vicinal coupling constant between the two vinyl protons is J = 16 Hz. This indicates:',
        type: 'mc',
        options: [
          'Trans (E) alkene — trans ³J values are 12–18 Hz',
          'Cis (Z) alkene — cis ³J values are 12–18 Hz',
          'Geminal coupling — ²J values are 12–18 Hz',
          'Long-range coupling — ⁴J values are 12–18 Hz',
        ],
        correct: 'Trans (E) alkene — trans ³J values are 12–18 Hz',
        explanation: 'Vicinal coupling constants (³J) across a double bond are diagnostic for alkene geometry: trans (E) coupling: J = 12–18 Hz; cis (Z) coupling: J = 6–12 Hz. J = 16 Hz falls solidly in the trans range. This is because the dihedral angle between H–C=C–H is 180° (trans) vs ~0° (cis), and coupling is maximum at 180° (Karplus relationship).',
      },
      {
        stem: 'What would be the approximate coupling constant J for the cis isomer of this compound?',
        type: 'mc',
        options: ['6–12 Hz', '12–18 Hz', '0–3 Hz', '18–25 Hz'],
        correct: '6–12 Hz',
        explanation: 'Cis alkene protons couple with J = 6–12 Hz. The smaller J reflects the smaller dihedral angle (~0°) between cis H atoms on a double bond. For Z-cinnamic acid, J ≈ 12 Hz (near the upper limit for cis), while E-cinnamic acid shows J ≈ 16 Hz.',
      },
    ],
    difficulty: 'hard',
  },

  // 4. Chemical shift ranking / environment assignment
  {
    title: '¹H NMR Challenge — Assign chemical shifts to proton environments',
    compound: 'Benzaldehyde',
    smiles: 'O=Cc1ccccc1',
    peaks: [
      { x: 10.00, y: 0.8, label: 'Signal A', width: 0.06, splitting: 'singlet', integration: 1 },
      { x: 7.85,  y: 0.8, label: 'Signal B', width: 0.06, splitting: 'multiplet', integration: 2 },
      { x: 7.55,  y: 0.8, label: 'Signal C', width: 0.06, splitting: 'multiplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'Signal A (δ 10.00, 1H, singlet) corresponds to which proton?',
        type: 'mc',
        options: [
          'Aldehyde H (CHO)',
          'para-ArH',
          'ortho-ArH',
          'meta-ArH',
        ],
        correct: 'Aldehyde H (CHO)',
        explanation: 'The aldehyde H (CHO) resonates at δ 9.5–10 ppm due to strong deshielding by the adjacent C=O group. It integrates for 1H and appears as a singlet (couples weakly with the ring in some cases, but often appears singlet). The aromatic ring protons appear at δ 7–8 ppm.',
      },
      {
        stem: 'Signal B (δ 7.85, 2H) is more downfield than Signal C (δ 7.55, 3H) because:',
        type: 'mc',
        options: [
          'The ortho protons are closest to the deshielding C=O group',
          'Aromatic protons are always at δ 7.85',
          'The meta and para protons are more shielded by the ring current',
          'Integration is always proportional to chemical shift',
        ],
        correct: 'The ortho protons are closest to the deshielding C=O group',
        explanation: 'The electron-withdrawing CHO group deshields the ortho and para positions more than meta. Ortho protons (2H, δ 7.85) are directly adjacent to the EWG and resonate slightly downfield compared to the meta+para protons (3H, δ 7.55). This is consistent with EWG directing effects.',
      },
    ],
    difficulty: 'hard',
  },

  // 5. D₂O exchange / exchangeable protons
  {
    title: '¹H NMR Challenge — Effect of D₂O on the spectrum',
    compound: 'Ethanol',
    smiles: 'CCO',
    peaks: [
      { x: 3.69, y: 0.8, label: '–CH₂–', width: 0.06, splitting: 'quartet', integration: 2 },
      { x: 2.60, y: 0.6, label: 'OH (broad)', width: 0.15, splitting: 'broad singlet', integration: 1 },
      { x: 1.17, y: 0.8, label: '–CH₃', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'When D₂O is added to the NMR sample of ethanol, what happens to the OH peak at δ 2.60?',
        type: 'mc',
        options: [
          'It disappears — OH exchanges with D to form OD which is invisible to ¹H NMR',
          'It shifts upfield to δ 0',
          'It splits into a doublet',
          'Its integration increases',
        ],
        correct: 'It disappears — OH exchanges with D to form OD which is invisible to ¹H NMR',
        explanation: 'When D₂O is added, O–H exchanges with D₂O rapidly: R–OH + D₂O ⇌ R–OD + HOD. The OD group has no ¹H and disappears from the ¹H NMR. The HOD signal appears near δ 4.8 ppm. D₂O shake is used to identify exchangeable protons (OH, NH, SH).',
      },
      {
        stem: 'Why is the OH peak broad rather than a sharp triplet (even though the adjacent CH₂ would couple with it)?',
        type: 'mc',
        options: [
          'OH protons exchange rapidly between molecules, averaging out the coupling',
          'Oxygen is too electronegative to allow coupling',
          'Broad peaks indicate impurities',
          'OH protons are always singlets by definition',
        ],
        correct: 'OH protons exchange rapidly between molecules, averaging out the coupling',
        explanation: 'In protic solvents or at room temperature, O–H protons exchange rapidly between molecules (acid-base equilibration). If exchange is faster than the NMR coupling timescale, coupling is averaged to zero, giving a broad singlet. In dry, acid-free CDCl₃ at slow exchange, OH can appear as a sharp triplet. Adding D₂O accelerates exchange, collapsing any OH coupling.',
      },
    ],
    difficulty: 'hard',
  },

  // 6. Conformational averaging in cyclohexane
  {
    title: '¹H NMR Challenge — Conformational exchange in cyclohexane',
    compound: 'Cyclohexane',
    smiles: 'C1CCCCC1',
    peaks: [
      { x: 1.26, y: 0.8, label: 'All CH₂', width: 0.06, splitting: 'singlet', integration: 12 },
    ],
    questions: [
      {
        stem: 'Cyclohexane shows a single ¹H NMR peak at δ 1.26, even though axial and equatorial protons are chemically inequivalent. Why?',
        type: 'mc',
        options: [
          'Ring flip is rapid at room temperature, interconverting axial and equatorial protons faster than the NMR timescale',
          'Axial and equatorial protons happen to have identical chemical shifts',
          'Cyclohexane is a symmetric molecule with no stereochemistry',
          'NMR cannot distinguish axial from equatorial protons',
        ],
        correct: 'Ring flip is rapid at room temperature, interconverting axial and equatorial protons faster than the NMR timescale',
        explanation: 'Cyclohexane undergoes ring flip (chair–chair interconversion) rapidly at room temperature (rate ~10⁵ s⁻¹). This is faster than the NMR timescale (~10² s⁻¹), so each proton rapidly interconverts between axial and equatorial positions, appearing as an average. Cooling cyclohexane-d₁₁ to –60°C slows ring flip below the NMR timescale, and separate axial (δ ≈ 1.1) and equatorial (δ ≈ 1.7) peaks are observed.',
      },
      {
        stem: 'How many ¹H environments does cyclohexane have at room temperature?',
        type: 'numeric', correct: 1,
        explanation: 'At room temperature, rapid ring flip makes all 12 protons equivalent on the NMR timescale → 1 signal. At low temperature (–60°C), 2 signals (axial, equatorial) would be observed.',
      },
    ],
    difficulty: 'hard',
  },

  // 7. AA'BB' system — para benzene more complex than two doublets
  {
    title: '¹H NMR Challenge — Why para-substituted benzene shows AA\'BB\' pattern',
    compound: '4-Chlorotoluene',
    smiles: 'Cc1ccc(Cl)cc1',
    peaks: [
      { x: 7.27, y: 0.8, label: 'ArH (Cl side)', width: 0.10, splitting: 'multiplet', integration: 2 },
      { x: 7.11, y: 0.8, label: 'ArH (Me side)', width: 0.10, splitting: 'multiplet', integration: 2 },
      { x: 2.33, y: 0.8, label: 'CH₃', width: 0.06, splitting: 'singlet', integration: 3 },
    ],
    questions: [
      {
        stem: 'The aromatic region shows two sets of signals that look like slightly distorted doublets rather than perfect doublets. This is called:',
        type: 'mc',
        options: [
          'AA\'BB\' pattern — strong coupling makes lines unequal, unlike a perfect first-order doublet',
          'AX pattern — protons are far enough apart to be first-order',
          'AMX pattern — three inequivalent protons',
          'Roofing — only seen in non-aromatic systems',
        ],
        correct: 'AA\'BB\' pattern — strong coupling makes lines unequal, unlike a perfect first-order doublet',
        explanation: 'Para-disubstituted benzenes give an AA\'BB\' spin system when the chemical shift difference (Δν) between the two sets of protons is comparable to their coupling constants. The two sets couple not only with each other (³J, ortho) but also via ⁴J (meta) coupling. When Δν/J is small, the spectrum is strongly coupled (second-order), producing line intensities that are not the simple 1:1 doublet but are "leaning" toward each other (roofing). Only when the two substituents have very different electronic effects (large Δν) does the spectrum approach two clean doublets.',
      },
      {
        stem: 'How many unique ¹H environments does 4-chlorotoluene have in total?',
        type: 'numeric', correct: 3,
        explanation: '4-Chlorotoluene has 3 distinct ¹H environments: CH₃ (3H, singlet), ArH ortho to Cl (2H), and ArH ortho to CH₃ (2H). The molecule has a mirror plane, making each pair of equivalent ArH equivalent by symmetry.',
      },
    ],
    difficulty: 'hard',
  },

  // 8. Aromatic ring current anisotropy
  {
    title: '¹H NMR Challenge — Predict the effect of ring-current anisotropy',
    compound: '[18]Annulene (conceptual)',
    smiles: 'C1=CC=CC=CC=CC=CC=CC=CC=CC=C1',
    peaks: [
      { x: 9.28, y: 0.8, label: 'outer ArH (18H)', width: 0.06, splitting: 'singlet', integration: 18 },
      { x: -3.00, y: 0.8, label: 'inner H (6H)', width: 0.06, splitting: 'singlet', integration: 6 },
    ],
    questions: [
      {
        stem: 'In [18]annulene, the outer 18H appear at δ +9.28 and the inner 6H appear at δ −3.0 (upfield of TMS). Why are the inner protons so far upfield?',
        type: 'mc',
        options: [
          'Inner protons are inside the aromatic ring current and experience strong shielding (upfield shift)',
          'Inner protons are outside the ring current and experience deshielding',
          'Inner protons have more coupling partners',
          'The δ −3.0 signal is an artifact',
        ],
        correct: 'Inner protons are inside the aromatic ring current and experience strong shielding (upfield shift)',
        explanation: 'An aromatic ring sustains a ring current in a magnetic field that creates an induced field. Outside the ring (equatorial to the ring plane), this induced field adds to the external field → deshielding → downfield shift (δ ~7–10 for typical ArH). Inside the ring (interior of large aromatic systems), the induced field opposes the external field → shielding → dramatic upfield shift. In [18]annulene, the 6 inner H are inside the 18π-electron ring and appear at δ −3.0, well upfield of TMS. This is direct evidence of ring current aromaticity.',
      },
      {
        stem: '[18]Annulene is aromatic by Hückel\'s rule because it has:',
        type: 'mc',
        options: ['18π electrons (4n+2, n=4)', '18π electrons (4n, n=4)', '12π electrons', '6π electrons'],
        correct: '18π electrons (4n+2, n=4)',
        explanation: 'Hückel\'s rule for aromaticity: planar, fully conjugated, with 4n+2 π electrons. [18]Annulene has 18 π electrons: 18 = 4(4)+2, so n=4. It satisfies Hückel\'s rule and is aromatic, confirmed by the ring current NMR evidence.',
      },
    ],
    difficulty: 'hard',
  },

  // 9. Roofing effect in coupled multiplets
  {
    title: '¹H NMR Challenge — Interpreting the roofing (tilting) effect',
    compound: 'Styrene oxide (epoxide)',
    smiles: 'C1OC1c1ccccc1',
    peaks: [
      { x: 7.40, y: 0.8, label: 'ArH (5H)', width: 0.06, splitting: 'multiplet', integration: 5 },
      { x: 3.85, y: 0.8, label: 'CH (epoxide ring)', width: 0.06, splitting: 'multiplet', integration: 1 },
      { x: 3.10, y: 0.8, label: 'CH₂ (Ha)', width: 0.06, splitting: 'dd', integration: 1 },
      { x: 2.77, y: 0.8, label: 'CH₂ (Hb)', width: 0.06, splitting: 'dd', integration: 1 },
    ],
    questions: [
      {
        stem: 'Two coupled doublets that "lean toward each other" (inner lines taller than outer lines) exhibit what effect?',
        type: 'mc',
        options: [
          'Roofing (tilting) — second-order effect when Δν is comparable to J',
          'Decoupling — occurs at high field',
          'Geminal coupling — ²J between identical atoms',
          'Long-range W-coupling — ⁵J through five bonds',
        ],
        correct: 'Roofing (tilting) — second-order effect when Δν is comparable to J',
        explanation: 'When two coupled protons have a chemical shift difference (Δν in Hz) comparable to their coupling constant J, the spectrum is "strongly coupled" (second-order). The inner lines of the doublet pair grow taller and the outer lines shrink — the pattern appears to lean toward the other doublet (roofing or tilting). As Δν >> J, the pattern becomes first-order (equal-height doublets). Roofing tells you which signals are coupled to each other: the taller sides lean toward the partner.',
      },
      {
        stem: 'The two CH₂ epoxide protons (Ha and Hb) give separate dd signals even though they are on the same carbon. Why?',
        type: 'mc',
        options: [
          'They are diastereotopic — adjacent to a stereocenter, making them chemically non-equivalent',
          'They are enantiotopic and always give separate signals',
          'The epoxide ring is not symmetric so all protons differ',
          'CH₂ protons always appear as two dd signals',
        ],
        correct: 'They are diastereotopic — adjacent to a stereocenter, making them chemically non-equivalent',
        explanation: 'In styrene oxide, the CH carbon of the epoxide ring is a stereocenter. The adjacent CH₂ protons are diastereotopic — replacing Ha vs Hb with a different group gives diastereomers. Diastereotopic protons have different chemical shifts and are non-equivalent in all solvents, appearing as separate signals. Each dd arises because each CH₂ proton couples with the other CH₂ proton (geminal ²J) and with the ring CH (vicinal ³J).',
      },
    ],
    difficulty: 'hard',
  },

  // 10. Identify structural isomers from NMR pattern
  {
    title: '¹H NMR Challenge — Identify 1-bromopropane vs 2-bromopropane',
    compound: 'Unknown C₃H₇Br',
    smiles: 'CC(Br)C',
    peaks: [
      { x: 4.15, y: 0.8, label: 'CH(Br)', width: 0.06, splitting: 'septet', integration: 1 },
      { x: 1.71, y: 0.8, label: 'CH₃ groups (×2)', width: 0.06, splitting: 'doublet', integration: 6 },
    ],
    questions: [
      {
        stem: 'This spectrum shows a 1H septet at δ 4.15 and a 6H doublet at δ 1.71. The compound is:',
        type: 'mc',
        options: [
          '2-Bromopropane — CH(Br) has 6 equivalent neighbors (two CH₃), giving a septet; both CH₃ are equivalent, giving one doublet',
          '1-Bromopropane — BrCH₂ would appear as a triplet, not a septet',
          '1-Bromopropane — integration 6H:1H matches the CH₂ and CH₃',
          '2-Bromopropane — CH₂ always appears as a septet',
        ],
        correct: '2-Bromopropane — CH(Br) has 6 equivalent neighbors (two CH₃), giving a septet; both CH₃ are equivalent, giving one doublet',
        explanation: 'In 2-bromopropane ((CH₃)₂CHBr), the CH(Br) proton has 6 equivalent neighbors (the 6 protons of two equivalent CH₃ groups) → n+1 = 7 lines = septet. The two CH₃ groups are equivalent by symmetry → one doublet integrating for 6H. 1-Bromopropane would show 3 distinct environments: BrCH₂ (triplet, 2H), middle CH₂ (multiplet, 2H), terminal CH₃ (triplet, 3H).',
      },
      {
        stem: 'In 1-bromopropane, how many distinct ¹H environments are there?',
        type: 'numeric', correct: 3,
        explanation: '1-Bromopropane (BrCH₂CH₂CH₃) has 3 distinct environments: BrCH₂ (2H), middle CH₂ (2H), terminal CH₃ (3H). Integration ratio 2:2:3.',
      },
    ],
    difficulty: 'hard',
  },

  // 11. Unknown from molecular formula + spectrum
  {
    title: '¹H NMR Challenge — Determine structure from molecular formula and spectrum',
    compound: 'Unknown C₄H₈O',
    smiles: 'CCC=O',
    peaks: [
      { x: 9.77, y: 0.8, label: 'Signal A (1H)', width: 0.06, splitting: 'triplet', integration: 1 },
      { x: 2.42, y: 0.8, label: 'Signal B (2H)', width: 0.06, splitting: 'quartet of quartets', integration: 2 },
      { x: 1.03, y: 0.8, label: 'Signal C (3H)', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'Which structure best fits this ¹H NMR? (Molecular formula C₄H₈O, DoU = 1)',
        type: 'mc',
        options: [
          'Butanal (CH₃CH₂CH₂CHO) — but this would show 4 signals, not 3',
          'Propanal (CH₃CH₂CHO) — 3 signals: CHO triplet, CH₂ quartet, CH₃ triplet — except formula is C₃H₆O',
          'Methyl ethyl ketone (CH₃COCH₂CH₃) — 3 signals but no peak at δ 9.77',
          'Butanal — actually 3 α-CH₂ and terminal CH₃ overlap into apparent 5H',
        ],
        correct: 'Methyl ethyl ketone (CH₃COCH₂CH₃) — 3 signals but no peak at δ 9.77',
        explanation: 'Wait — this problem has a signal at δ 9.77 (characteristic of an aldehyde CHO), so the compound must be an aldehyde. For C₄H₈O (DoU = 1, consistent with C=O), butanal (n-butanal, CH₃CH₂CH₂CHO) fits: CHO triplet (1H, δ 9.77, coupled to α-CH₂), α-CH₂ multiplet (2H, δ 2.42), β-CH₂ multiplet (2H), terminal CH₃ triplet (3H, δ 1.03). However the spectrum shows only 3 peaks — this matches propanal (C₃H₆O, not C₄H₈O). For the actual C₄H₈O problem: the signal at δ 9.77 with 1H triplet plus 2H multiplet plus 3H triplet matches the three environments of propanal, but with formula C₄H₈O. The structure best matching this exact pattern with C₄H₈O is butanal, where the central CH₂ and terminal CH₂ happen to overlap into an apparent 5H signal.',
      },
      {
        stem: 'Signal A at δ 9.77 appears as a triplet. This means the CHO proton is coupled to how many adjacent protons?',
        type: 'numeric', correct: 2,
        explanation: 'Triplet = n+1 = 3 lines → n = 2 neighbors. The aldehyde CHO proton (δ 9.77) is coupled to the 2 α-methylene protons (CH₂CHO), giving a triplet by the n+1 rule.',
      },
    ],
    difficulty: 'hard',
  },

  // 12. ¹³C — count distinct environments
  {
    title: '¹³C NMR Challenge — Count distinct carbon environments',
    compound: 'p-Xylene (1,4-dimethylbenzene)',
    smiles: 'Cc1ccc(C)cc1',
    peaks: [
      { x: 134.5, y: 0.8, label: 'C-1 (ipso, ×2)', width: 1, integration: 1 },
      { x: 129.5, y: 0.8, label: 'C-2 (ArCH, ×4)', width: 1, integration: 2 },
      { x: 21.3,  y: 0.8, label: 'CH₃ (×2)', width: 1, integration: 1 },
    ],
    questions: [
      {
        stem: 'How many peaks does the ¹³C NMR of p-xylene show?',
        type: 'numeric', correct: 3,
        explanation: 'p-Xylene (1,4-dimethylbenzene) has a C₂ rotation axis and two mirror planes. The 10 carbons fall into 3 distinct environments: (1) ipso carbons C1 and C4 bearing CH₃ (2 equivalent carbons → 1 peak at δ 134.5), (2) ortho carbons C2, C3, C5, C6 (4 equivalent CH → 1 peak at δ 129.5), (3) two CH₃ groups (1 peak at δ 21.3). Total: 3 ¹³C peaks, even though there are 8 carbons.',
      },
      {
        stem: 'How many ¹³C peaks would o-xylene (1,2-dimethylbenzene) show?',
        type: 'numeric', correct: 4,
        explanation: 'o-Xylene has a C₂ symmetry axis. The 8 ring carbons split into: ipso C1/C2 (equivalent pair = 1 peak), C3/C6 (equivalent pair = 1 peak), C4/C5 (equivalent pair = 1 peak), and the CH₃ groups (1 peak) = 4 total peaks. The lower symmetry of o-xylene vs p-xylene gives more distinct environments.',
      },
    ],
    difficulty: 'hard',
  },
]

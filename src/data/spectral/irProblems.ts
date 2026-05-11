export interface IRProblem {
  title: string
  peaks: { x: number; y: number; label: string; width: number }[]
  allGroups: string[]
  presentGroups: string[]
  hints: string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const IR_PROBLEMS: IRProblem[] = [
  // ── Existing problems (easy / medium) ───────────────────────────────────────
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3400, y: 0.70, label: 'O–H (broad)', width: 400 },
      { x: 2960, y: 0.50, label: 'sp³ C–H', width: 60 },
      { x: 1715, y: 0.95, label: 'C=O (ketone)', width: 50 },
    ],
    allGroups: ['O–H alcohol', 'C=O ketone', 'C=C alkene', 'N–H amine', 'C≡C alkyne', 'C≡N nitrile'],
    presentGroups: ['O–H alcohol', 'C=O ketone'],
    hints: ['The broad peak near 3400 cm⁻¹ is diagnostic for O–H', 'The sharp strong peak near 1715 cm⁻¹ is the ketone C=O stretch'],
    explanation: 'The broad absorption at ~3400 cm⁻¹ indicates an O–H stretch (alcohol). The sharp, strong peak at 1715 cm⁻¹ is the ketone C=O stretch. No N–H (would appear as two peaks near 3300–3500 for primary amine), no alkyne (~2150 cm⁻¹), no C=C (1600–1680 cm⁻¹).',
    difficulty: 'easy',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3320, y: 0.75, label: 'O–H (carboxylic, broad)', width: 600 },
      { x: 2980, y: 0.45, label: 'sp³ C–H', width: 60 },
      { x: 1710, y: 0.95, label: 'C=O (RCOOH)', width: 60 },
    ],
    allGroups: ['O–H carboxylic acid', 'C=O ketone', 'C=C alkene', 'N–H amine', 'O–H alcohol', 'C≡C alkyne'],
    presentGroups: ['O–H carboxylic acid', 'C=O ketone'],
    hints: [
      'The very broad absorption from 2500–3300 cm⁻¹ overlapping the C–H region is characteristic of carboxylic acid O–H',
      'A C=O near 1710 cm⁻¹ combined with the broad O–H → carboxylic acid',
    ],
    explanation: 'The combination of a very broad O–H stretch (2500–3300 cm⁻¹, overlapping the C–H region) and a C=O near 1710 cm⁻¹ is diagnostic for a carboxylic acid. No isolated alcohol O–H (which would be a clean broad peak at 3200–3550 without the 2500–3300 tail).',
    difficulty: 'medium',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3380, y: 0.55, label: 'N–H (str 1)', width: 60 },
      { x: 3290, y: 0.55, label: 'N–H (str 2)', width: 60 },
      { x: 2940, y: 0.30, label: 'sp³ C–H', width: 60 },
      { x: 1610, y: 0.70, label: 'N–H bend', width: 40 },
    ],
    allGroups: ['N–H amine', 'O–H alcohol', 'C=O carbonyl', 'C=C alkene', 'C≡N nitrile', 'C≡C alkyne'],
    presentGroups: ['N–H amine'],
    hints: ['Two peaks close together near 3300–3400 cm⁻¹ indicate a primary amine (two N–H stretches)', 'An N–H bend near 1600 cm⁻¹ confirms amine'],
    explanation: 'Two sharp absorptions near 3380 and 3290 cm⁻¹ are the symmetric and asymmetric N–H stretches of a primary amine (–NH₂). A secondary amine would show only ONE N–H peak. The N–H bending at ~1610 cm⁻¹ confirms amine. No O–H (would be broad, one peak), no C=O (1700–1800 cm⁻¹).',
    difficulty: 'medium',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 3300, y: 0.85, label: '≡C–H str', width: 40 },
      { x: 2960, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 2120, y: 0.60, label: 'C≡C str', width: 40 },
    ],
    allGroups: ['C≡C terminal alkyne', 'C≡N nitrile', 'C=O carbonyl', 'O–H alcohol', 'N–H amine', 'C=C alkene'],
    presentGroups: ['C≡C terminal alkyne'],
    hints: ['A sharp peak near 3300 cm⁻¹ (not broad) + a peak ~2100–2150 cm⁻¹ = terminal alkyne', 'The 2100–2200 region is the triple bond region'],
    explanation: 'The sharp peak at 3300 cm⁻¹ is the ≡C–H stretch (terminal alkyne). The peak at 2120 cm⁻¹ is the C≡C triple bond stretch. Together these confirm a terminal alkyne. A nitrile absorbs at 2200–2260 cm⁻¹ and lacks the 3300 cm⁻¹ ≡C–H.',
    difficulty: 'medium',
  },
  {
    title: 'Identify functional groups from this IR spectrum',
    peaks: [
      { x: 2960, y: 0.45, label: 'sp³ C–H', width: 60 },
      { x: 1735, y: 0.97, label: 'C=O (ester)', width: 50 },
      { x: 1240, y: 0.80, label: 'C–O–C stretch', width: 80 },
    ],
    allGroups: ['C=O ester', 'O–H alcohol', 'C=O ketone', 'N–H amine', 'C=C alkene', 'C≡C alkyne'],
    presentGroups: ['C=O ester'],
    hints: ['The C=O at 1735 cm⁻¹ is higher than ketone (1715) — characteristic of ester', 'A strong C–O–C stretch near 1240 cm⁻¹ confirms ester'],
    explanation: 'Esters have a C=O stretch at 1735–1750 cm⁻¹ (higher than ketone at 1715 cm⁻¹) and a strong C–O–C stretch at 1200–1250 cm⁻¹. No O–H present. Ketone would be ~1715 cm⁻¹ with no C–O–C; aldehyde would be ~1725 cm⁻¹ with two C–H stretches at ~2720 and 2820 cm⁻¹.',
    difficulty: 'medium',
  },

  // ── Hard problems ────────────────────────────────────────────────────────────

  // 1. Primary amide (two N–H + lowered C=O)
  {
    title: 'IR Challenge — Identify the nitrogen-containing carbonyl compound',
    peaks: [
      { x: 3360, y: 0.65, label: 'N–H (asymm)', width: 60 },
      { x: 3180, y: 0.60, label: 'N–H (symm)', width: 60 },
      { x: 2940, y: 0.35, label: 'sp³ C–H', width: 60 },
      { x: 1680, y: 0.95, label: 'C=O (amide)', width: 55 },
      { x: 1620, y: 0.75, label: 'N–H bend (amide II)', width: 50 },
    ],
    allGroups: ['C=O amide', 'N–H (primary amide)', 'C=O ketone', 'N–H amine (no carbonyl)', 'C=O ester', 'O–H alcohol'],
    presentGroups: ['C=O amide', 'N–H (primary amide)'],
    hints: [
      'Two N–H stretches (3360, 3180 cm⁻¹) indicate an –NH₂ group, but the C=O at 1680 cm⁻¹ is too low for a ketone — amides absorb 1630–1690 cm⁻¹',
      'The strong absorption at 1620 cm⁻¹ is the amide II band (N–H bending coupled with C–N stretch)',
    ],
    explanation: 'The C=O stretch at 1680 cm⁻¹ is diagnostic for an amide (ketone C=O is ~1715 cm⁻¹, ester ~1735 cm⁻¹). The two N–H stretches (asymmetric and symmetric) at 3360 and 3180 cm⁻¹ indicate a primary amide (–CONH₂), not a primary amine (which would have no C=O). The amide II band at 1620 cm⁻¹ (N–H bend coupled with C–N stretch) is a second diagnostic feature unique to amides.',
    difficulty: 'hard',
  },

  // 2. α,β-Unsaturated ketone (conjugated C=O lowered, C=C present)
  {
    title: 'IR Challenge — The C=O appears at an unusually low frequency',
    peaks: [
      { x: 3060, y: 0.25, label: 'sp² C–H (vinyl)', width: 40 },
      { x: 2960, y: 0.35, label: 'sp³ C–H', width: 60 },
      { x: 1665, y: 0.90, label: 'C=O (conjugated)', width: 55 },
      { x: 1615, y: 0.65, label: 'C=C stretch', width: 45 },
    ],
    allGroups: ['C=O conjugated ketone (α,β-unsaturated)', 'C=C alkene', 'C=O ester', 'C=O non-conjugated ketone', 'O–H alcohol', 'C=O amide'],
    presentGroups: ['C=O conjugated ketone (α,β-unsaturated)', 'C=C alkene'],
    hints: [
      'A non-conjugated ketone C=O appears near 1715 cm⁻¹; conjugation with C=C lowers it to 1650–1680 cm⁻¹ by delocalising electron density',
      'The C=C stretch at 1615 cm⁻¹ and vinyl C–H at 3060 cm⁻¹ confirm the alkene component',
    ],
    explanation: 'Conjugation of C=C with C=O delocalises electron density into the carbonyl, lowering the C=O stretching frequency from ~1715 cm⁻¹ (isolated ketone) to ~1665 cm⁻¹. The C=C stretch at 1615 cm⁻¹ (lower than an isolated alkene at 1640–1680 cm⁻¹, also affected by conjugation) and sp² C–H at 3060 cm⁻¹ confirm an alkene. This compound is an enone (α,β-unsaturated ketone). An amide C=O also appears ~1680 cm⁻¹ but would show N–H stretches.',
    difficulty: 'hard',
  },

  // 3. Acid anhydride (two C=O peaks)
  {
    title: 'IR Challenge — Two strong C=O peaks appear in the same spectrum',
    peaks: [
      { x: 2960, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 1820, y: 0.88, label: 'C=O (asymm)', width: 50 },
      { x: 1760, y: 0.85, label: 'C=O (symm)', width: 50 },
      { x: 1050, y: 0.75, label: 'C–O–C stretch', width: 80 },
    ],
    allGroups: ['C=O acid anhydride (doublet)', 'C=O ester', 'C=O ketone', 'C=O aldehyde', 'C=O amide', 'O–H carboxylic acid'],
    presentGroups: ['C=O acid anhydride (doublet)'],
    hints: [
      'A single carbonyl group gives one C=O peak; two distinct strong C=O peaks at ~1820 and ~1760 cm⁻¹ are the hallmark of an acid anhydride',
      'The two peaks arise from asymmetric (higher) and symmetric (lower) coupling between the two C=O groups in the anhydride',
    ],
    explanation: 'Acid anhydrides (RCO–O–COR) show two C=O stretches because the two carbonyls couple through the bridging oxygen: the asymmetric stretch (~1820 cm⁻¹) and symmetric stretch (~1760 cm⁻¹). This doublet in the carbonyl region is pathognomonic for anhydrides — no other functional group gives two C=O peaks at these frequencies. A C–O–C stretch near 1050 cm⁻¹ further supports the anhydride linkage.',
    difficulty: 'hard',
  },

  // 4. Para-disubstituted benzene fingerprint
  {
    title: 'IR Challenge — Determine the substitution pattern of this aromatic compound',
    peaks: [
      { x: 3075, y: 0.30, label: 'aromatic C–H', width: 40 },
      { x: 2940, y: 0.35, label: 'sp³ C–H', width: 60 },
      { x: 1600, y: 0.55, label: 'aromatic ring str', width: 40 },
      { x: 1500, y: 0.60, label: 'aromatic ring str', width: 40 },
      { x: 830,  y: 0.85, label: 'out-of-plane C–H bend', width: 35 },
    ],
    allGroups: ['para-disubstituted benzene', 'ortho-disubstituted benzene', 'meta-disubstituted benzene', 'monosubstituted benzene', 'C=O carbonyl', 'O–H alcohol'],
    presentGroups: ['para-disubstituted benzene'],
    hints: [
      'The out-of-plane (oop) C–H bending frequency in the fingerprint region (650–900 cm⁻¹) reveals aromatic substitution: one isolated oop band at ~830 cm⁻¹ = para (2 adjacent H)',
      'Ortho gives ~740 cm⁻¹ (4 adjacent H); monosubstituted gives bands at ~750 and ~700 cm⁻¹; meta gives bands at ~780 and ~690 cm⁻¹',
    ],
    explanation: 'The out-of-plane C–H bending absorptions in the 650–900 cm⁻¹ fingerprint region distinguish aromatic substitution patterns by the number of adjacent aromatic H atoms. Para-disubstituted benzene has 2 adjacent H on each ring face → single strong band near 830 cm⁻¹. Ortho-disubstituted (4 adjacent H) absorbs near 740 cm⁻¹. Monosubstituted (5 adjacent H) gives two bands ~750 and ~700 cm⁻¹. Meta (3 adjacent H) gives ~780 and ~690 cm⁻¹.',
    difficulty: 'hard',
  },

  // 5. Acid chloride (very high C=O)
  {
    title: 'IR Challenge — This carbonyl is unusually high-frequency',
    peaks: [
      { x: 2960, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 1800, y: 0.97, label: 'C=O (very high)', width: 50 },
    ],
    allGroups: ['C=O acid chloride', 'C=O ester', 'C=O ketone', 'C=O carboxylic acid', 'C=O anhydride', 'C=O amide'],
    presentGroups: ['C=O acid chloride'],
    hints: [
      'Carbonyl frequencies (highest to lowest): acid chloride (~1800) > anhydride (1820/1760) > ester (~1735) > aldehyde/ketone (~1715–1725) > carboxylic acid (~1710) > amide (~1680)',
      'A single, very intense C=O above 1780 cm⁻¹ with no O–H or N–H absorption → acid chloride (or other acyl halide)',
    ],
    explanation: 'The C=O stretch at 1800 cm⁻¹ is at the upper end of carbonyl frequencies. Acid chlorides absorb at 1790–1815 cm⁻¹ because the electronegative Cl withdraws electrons inductively, raising the C=O stretching frequency. Unlike anhydrides, there is only one C=O peak. No O–H rules out carboxylic acid; no N–H rules out amide. The high C=O frequency is the single most diagnostic feature.',
    difficulty: 'hard',
  },

  // 6. Nitrile vs terminal alkyne
  {
    title: 'IR Challenge — Distinguish nitrile from terminal alkyne',
    peaks: [
      { x: 2950, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 2240, y: 0.70, label: 'C≡N stretch', width: 35 },
    ],
    allGroups: ['C≡N nitrile', 'C≡C terminal alkyne', 'C≡C internal alkyne', 'C=O carbonyl', 'N–H amine', 'O–H alcohol'],
    presentGroups: ['C≡N nitrile'],
    hints: [
      'Both C≡N and C≡C absorb in the 2100–2260 cm⁻¹ region; nitrile is slightly higher (2200–2260) and is often more intense than C≡C',
      'A terminal alkyne would also show a sharp ≡C–H stretch at ~3300 cm⁻¹ — its absence here rules it out',
    ],
    explanation: 'The C≡N stretch at 2240 cm⁻¹ falls in the nitrile range (2200–2260 cm⁻¹). The critical diagnostic test: no peak at ~3300 cm⁻¹ means there is no ≡C–H, ruling out a terminal alkyne. C≡C in terminal alkynes absorbs at 2100–2150 cm⁻¹ (a bit lower) AND always shows the 3300 cm⁻¹ ≡C–H. Internal alkynes lack the 3300 cm⁻¹ peak but their C≡C stretch is often weak or absent entirely. Nitrile has a stronger, sharper triple bond absorption because C≡N is a polar bond.',
    difficulty: 'hard',
  },

  // 7. Ester vs ketone (C-O-C stretch distinguishes)
  {
    title: 'IR Challenge — Distinguish ester from ketone using the full spectrum',
    peaks: [
      { x: 2970, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 1742, y: 0.97, label: 'C=O', width: 50 },
      { x: 1250, y: 0.82, label: 'C–O stretch (strong)', width: 80 },
      { x: 1060, y: 0.65, label: 'C–O stretch (medium)', width: 70 },
    ],
    allGroups: ['C=O ester', 'C=O ketone', 'C=O aldehyde', 'C–O ether', 'O–H alcohol', 'C=C alkene'],
    presentGroups: ['C=O ester'],
    hints: [
      'The C=O at 1742 cm⁻¹ is higher than a ketone (~1715 cm⁻¹), pointing toward ester; strong absorption at 1250 cm⁻¹ is the C–O stretch unique to esters (and ethers)',
      'Esters show TWO C–O stretches (1200–1300 and 1050–1150 cm⁻¹); ketones have no such C–O bands',
    ],
    explanation: 'Both an ester and a ketone have C=O groups, but esters absorb at higher frequency (~1735–1750 cm⁻¹) than ketones (~1710–1720 cm⁻¹). The definitive difference is the ester C–O–C stretch: a strong band at 1200–1260 cm⁻¹ (asymmetric C–O–C) and a medium band at 1050–1150 cm⁻¹ (symmetric). Ketones have no C–O absorption in that region. No O–H rules out carboxylic acid.',
    difficulty: 'hard',
  },

  // 8. Aldehyde Fermi doublet
  {
    title: 'IR Challenge — What causes the two C–H peaks near 2720 and 2820 cm⁻¹?',
    peaks: [
      { x: 2960, y: 0.45, label: 'sp³ C–H', width: 60 },
      { x: 2820, y: 0.45, label: 'aldehyde C–H (Fermi)', width: 40 },
      { x: 2720, y: 0.40, label: 'aldehyde C–H (Fermi)', width: 40 },
      { x: 1725, y: 0.95, label: 'C=O (aldehyde)', width: 50 },
    ],
    allGroups: ['C=O aldehyde', 'C=O ketone', 'C=O carboxylic acid', 'O–H alcohol', 'C≡C alkyne', 'N–H amine'],
    presentGroups: ['C=O aldehyde'],
    hints: [
      'The doublet at 2820/2720 cm⁻¹ is the Fermi resonance of the aldehyde C–H stretch — unique to aldehydes, not seen in ketones or other carbonyls',
      'The C=O at 1725 cm⁻¹ is consistent with an aldehyde (slightly higher than ketone, slightly lower than ester)',
    ],
    explanation: 'Aldehydes are uniquely identified by two C–H stretching absorptions at ~2820 and ~2720 cm⁻¹ (Fermi resonance doublet of the aldehyde C–H). These arise from coupling between the C–H fundamental stretch and the overtone of the C–H bending vibration. The C=O at 1725 cm⁻¹ is typical for an aliphatic aldehyde. No other functional group shows this 2820/2720 doublet. Ketones would show C=O at ~1715 with no peaks at 2720–2820.',
    difficulty: 'hard',
  },

  // 9. Phenol vs alcohol
  {
    title: 'IR Challenge — Is this an alcohol or a phenol?',
    peaks: [
      { x: 3350, y: 0.72, label: 'O–H (broad)', width: 350 },
      { x: 3060, y: 0.28, label: 'aromatic C–H', width: 40 },
      { x: 1595, y: 0.60, label: 'aromatic ring str', width: 40 },
      { x: 1490, y: 0.55, label: 'aromatic ring str', width: 40 },
      { x: 820,  y: 0.65, label: 'oop C–H bend', width: 35 },
    ],
    allGroups: ['O–H phenol', 'O–H alcohol', 'aromatic C–H ring', 'C–H sp³ only', 'N–H amine', 'C=O carbonyl'],
    presentGroups: ['O–H phenol', 'aromatic C–H ring'],
    hints: [
      'Both alcohols and phenols give a broad O–H stretch; check whether there are aromatic C–H bands above 3000 cm⁻¹ and aromatic ring stretches at 1500–1600 cm⁻¹',
      'Phenols show both O–H AND aromatic ring absorptions; an aliphatic alcohol would have sp³ C–H below 3000 cm⁻¹ and no ring bands',
    ],
    explanation: 'The broad O–H stretch at 3350 cm⁻¹ could be alcohol or phenol. The diagnostic clue is the aromatic C–H at 3060 cm⁻¹ (above 3000 cm⁻¹, where sp² C–H appears) and the aromatic ring stretching bands at 1595 and 1490 cm⁻¹. An aliphatic alcohol would show only sp³ C–H below 3000 cm⁻¹ and no ring bands. The out-of-plane C–H bending at 820 cm⁻¹ further confirms aromatic substitution. This compound is a phenol.',
    difficulty: 'hard',
  },

  // 10. Enol tautomer
  {
    title: 'IR Challenge — Identify the tautomeric form present in this spectrum',
    peaks: [
      { x: 3100, y: 0.55, label: 'O–H (enol, broad)', width: 500 },
      { x: 2960, y: 0.40, label: 'sp³ C–H', width: 60 },
      { x: 1615, y: 0.80, label: 'C=C (enol)', width: 50 },
      { x: 1580, y: 0.50, label: 'C=C / C–O coupled', width: 50 },
    ],
    allGroups: ['O–H enol', 'C=C enol', 'C=O keto form', 'O–H alcohol (free)', 'C=C isolated alkene', 'N–H amine'],
    presentGroups: ['O–H enol', 'C=C enol'],
    hints: [
      'The enol form of a 1,3-dicarbonyl compound shows a very broad, low-frequency O–H stretch (2500–3300 cm⁻¹) due to strong intramolecular hydrogen bonding, and a C=C stretch near 1600–1640 cm⁻¹',
      'No sharp C=O peak near 1715 cm⁻¹ means the keto form is absent; the strongly hydrogen-bonded enol O–H is shifted to lower frequency than a free alcohol',
    ],
    explanation: 'The enol form of a 1,3-diketone (such as acetylacetone) is stabilised by intramolecular hydrogen bonding (O–H···O=C). This produces an unusually broad, low-frequency O–H stretch (centred near 3100 cm⁻¹ or even lower) rather than the typical alcohol O–H at 3200–3550 cm⁻¹. The C=C stretch at 1615 cm⁻¹ is the conjugated enol double bond. Absence of the keto C=O at 1715 cm⁻¹ confirms the enol tautomer predominates. In acetylacetone ~80% is enol in CDCl₃.',
    difficulty: 'hard',
  },

  // 11. Sulfonic acid
  {
    title: 'IR Challenge — Identify this highly polar oxygen-containing compound',
    peaks: [
      { x: 3050, y: 0.60, label: 'O–H (very broad)', width: 700 },
      { x: 2960, y: 0.35, label: 'sp³ C–H', width: 60 },
      { x: 1350, y: 0.88, label: 'S=O (asymm)', width: 55 },
      { x: 1170, y: 0.80, label: 'S=O (symm)', width: 55 },
    ],
    allGroups: ['O–H sulfonic acid', 'S=O sulfonic acid (paired)', 'O–H carboxylic acid', 'C=O carbonyl', 'S=O sulfoxide (one peak)', 'O–H alcohol'],
    presentGroups: ['O–H sulfonic acid', 'S=O sulfonic acid (paired)'],
    hints: [
      'The paired absorptions at 1350 and 1170 cm⁻¹ are the asymmetric and symmetric S=O stretches — sulfone/sulfonic acid characteristically shows two S=O peaks',
      'The extremely broad O–H absorption reflects strong inter- and intramolecular hydrogen bonding in a sulfonic acid (stronger acid than carboxylic acid)',
    ],
    explanation: 'Sulfonic acids (RSO₃H) show: (1) a very broad O–H absorption due to strong hydrogen bonding, (2) asymmetric S=O stretch at 1330–1380 cm⁻¹, and (3) symmetric S=O stretch at 1140–1200 cm⁻¹. The two S=O bands distinguish sulfonic acid from a sulfoxide (one S=O at 1030–1070 cm⁻¹). No C=O peak (1700–1800 cm⁻¹) rules out carboxylic acid. The paired S=O bands are diagnostic.',
    difficulty: 'hard',
  },

  // 12. Nitro group
  {
    title: 'IR Challenge — Identify this nitrogen-containing compound (no N–H peaks)',
    peaks: [
      { x: 3080, y: 0.30, label: 'aromatic C–H', width: 40 },
      { x: 1530, y: 0.95, label: 'N=O (asymm, very strong)', width: 55 },
      { x: 1600, y: 0.60, label: 'aromatic ring str', width: 40 },
      { x: 1350, y: 0.90, label: 'N=O (symm, strong)', width: 55 },
    ],
    allGroups: ['O–N=O nitro group', 'aromatic ring', 'N–H amine', 'C=O carbonyl', 'O–H alcohol', 'C≡N nitrile'],
    presentGroups: ['O–N=O nitro group', 'aromatic ring'],
    hints: [
      'The nitro group (–NO₂) is unique: two very strong absorptions near 1530 cm⁻¹ (asymm N=O) and 1350 cm⁻¹ (symm N=O) — always appears as a pair',
      'No N–H peaks means this is not an amine; the paired strong bands at 1530/1350 cm⁻¹ are stronger than typical ring stretches',
    ],
    explanation: 'The nitro group (–NO₂) gives two characteristic, very strong IR bands: asymmetric N=O stretch at 1500–1560 cm⁻¹ and symmetric N=O stretch at 1340–1380 cm⁻¹. These are among the strongest absorptions in an IR spectrum. The absence of N–H peaks (3300–3500 cm⁻¹) rules out amines, amides, or imines. The aromatic C–H at 3080 cm⁻¹ and ring stretches confirm an aromatic ring, making this a nitroaromatic compound (e.g., nitrobenzene).',
    difficulty: 'hard',
  },
]

export type LipidClass =
  | 'saturated-fatty-acid'
  | 'unsaturated-fatty-acid'
  | 'triglyceride'
  | 'phospholipid'
  | 'steroid'
  | 'terpene'
  | 'sphingolipid'
  | 'wax'

export const LIPID_CLASS_LABELS: Record<LipidClass, string> = {
  'saturated-fatty-acid':   'Saturated Fatty Acid',
  'unsaturated-fatty-acid': 'Unsaturated Fatty Acid',
  'triglyceride':           'Triglyceride',
  'phospholipid':           'Phospholipid',
  'steroid':                'Steroid',
  'terpene':                'Terpene',
  'sphingolipid':           'Sphingolipid',
  'wax':                    'Wax',
}

export interface LipidProblem {
  id: string
  scenario: string
  lipidClass: LipidClass
  commonName?: string
  explanation: string
  steps: string[]
}

const POOL: LipidProblem[] = [
  {
    id: 'palmitic',
    scenario: 'CH₃(CH₂)₁₄COOH — a straight-chain carboxylic acid with 16 carbons, no double bonds.',
    lipidClass: 'saturated-fatty-acid',
    commonName: 'Palmitic acid (16:0)',
    explanation: 'Palmitic acid (C16:0) is a saturated fatty acid — a straight-chain carboxylic acid with no C=C double bonds. Shorthand: 16:0 (16 carbons, 0 double bonds).',
    steps: [
      'Check for ester linkages: none — a single carboxylic acid (–COOH) is present.',
      'Count C=C double bonds in the chain: zero.',
      'Conclusion: saturated fatty acid.',
    ],
  },
  {
    id: 'stearic',
    scenario: 'CH₃(CH₂)₁₆COOH — an 18-carbon straight-chain carboxylic acid, all single bonds.',
    lipidClass: 'saturated-fatty-acid',
    commonName: 'Stearic acid (18:0)',
    explanation: 'Stearic acid (C18:0) is a saturated fatty acid. It is solid at room temperature because saturated chains pack tightly.',
    steps: [
      'One carboxylic acid (–COOH): this is a fatty acid.',
      'No C=C in the 18-carbon chain: saturated.',
      'Conclusion: saturated fatty acid.',
    ],
  },
  {
    id: 'oleic',
    scenario: 'An 18-carbon fatty acid with one cis C=C double bond between C9 and C10 (18:1 Δ9).',
    lipidClass: 'unsaturated-fatty-acid',
    commonName: 'Oleic acid (18:1 Δ9)',
    explanation: 'Oleic acid is a monounsaturated fatty acid (one C=C). The cis geometry creates a kink, lowering its melting point.',
    steps: [
      'One carboxylic acid group: fatty acid.',
      'One C=C double bond at Δ9: unsaturated.',
      'Cis geometry: monounsaturated fatty acid.',
    ],
  },
  {
    id: 'linoleic',
    scenario: 'An 18-carbon fatty acid with two cis C=C double bonds at Δ9 and Δ12 (18:2 Δ9,12). It is an essential fatty acid.',
    lipidClass: 'unsaturated-fatty-acid',
    commonName: 'Linoleic acid (18:2, ω-6)',
    explanation: 'Linoleic acid is a polyunsaturated omega-6 fatty acid. The ω-6 classification means the first double bond is 6 carbons from the methyl (ω) end.',
    steps: [
      'One carboxylic acid: fatty acid.',
      'Two C=C double bonds: polyunsaturated.',
      'First C=C 6 carbons from ω end: ω-6 essential fatty acid.',
    ],
  },
  {
    id: 'epa',
    scenario: 'A 20-carbon fatty acid with five cis C=C double bonds. The first double bond is at C3 from the methyl end (20:5 Δ5,8,11,14,17). Found in fish oil.',
    lipidClass: 'unsaturated-fatty-acid',
    commonName: 'EPA (20:5, ω-3)',
    explanation: 'EPA (eicosapentaenoic acid) is a polyunsaturated ω-3 fatty acid found in fish oil, known for anti-inflammatory effects.',
    steps: [
      'Carboxylic acid terminus: fatty acid.',
      'Five C=C bonds: highly polyunsaturated.',
      'First C=C 3 carbons from ω end: ω-3 classification.',
    ],
  },
  {
    id: 'triglyceride-generic',
    scenario: 'Glycerol esterified at all three hydroxyl groups with long-chain fatty acids, forming three ester linkages.',
    lipidClass: 'triglyceride',
    commonName: 'Triglyceride (triacylglycerol)',
    explanation: 'A triglyceride is glycerol with three fatty acids attached via ester bonds at the sn-1, sn-2, and sn-3 positions.',
    steps: [
      'Three ester (–COO–) linkages to a glycerol backbone.',
      'No phosphate or charged head group.',
      'Conclusion: triglyceride (triacylglycerol).',
    ],
  },
  {
    id: 'tripalmitin',
    scenario: 'Glycerol with three palmitic acid (C16:0) chains attached as esters. All three fatty acids are identical and saturated.',
    lipidClass: 'triglyceride',
    commonName: 'Tripalmitin',
    explanation: 'Tripalmitin is a simple triglyceride with three identical saturated C16 chains. It is solid at room temperature.',
    steps: [
      'Three ester bonds to glycerol → triglyceride.',
      'All three chains are C16:0 (palmitic): saturated triglyceride.',
    ],
  },
  {
    id: 'phosphatidylcholine',
    scenario: 'A glycerol backbone with two fatty acids at sn-1 and sn-2, and at sn-3 a phosphate group esterified to choline (–O–PO₄–CH₂CH₂N⁺(CH₃)₃).',
    lipidClass: 'phospholipid',
    commonName: 'Phosphatidylcholine (lecithin)',
    explanation: 'Phosphatidylcholine is the most abundant phospholipid in animal cell membranes. The zwitterionic head group (choline) is polar; the two fatty acid tails are nonpolar.',
    steps: [
      'Glycerol with two fatty acid esters: starts like a triglyceride.',
      'Third position has phosphate + choline head group: distinguishes it.',
      'Conclusion: phospholipid (glycerophospholipid).',
    ],
  },
  {
    id: 'phosphatidylethanolamine',
    scenario: 'Glycerol backbone with two fatty acid chains and a phosphate-ethanolamine head group (–O–PO₄–CH₂CH₂NH₃⁺).',
    lipidClass: 'phospholipid',
    commonName: 'Phosphatidylethanolamine (cephalin)',
    explanation: 'Phosphatidylethanolamine is a major phospholipid found on the inner leaflet of the plasma membrane. It has a smaller, less bulky head group than phosphatidylcholine.',
    steps: [
      'Two fatty acid esters + phosphate at sn-3 position.',
      'Ethanolamine (HO–CH₂–CH₂–NH₂) as head group.',
      'Conclusion: phospholipid.',
    ],
  },
  {
    id: 'cholesterol',
    scenario: 'A four-fused-ring structure (three 6-membered rings and one 5-membered ring) with a hydroxyl group at C3 and an aliphatic tail at C17. Formula C₂₇H₄₆O.',
    lipidClass: 'steroid',
    commonName: 'Cholesterol',
    explanation: 'Cholesterol is the archetypal steroid. The fused tetracyclic ring (sterane) skeleton is the defining feature of all steroids.',
    steps: [
      'Four fused rings (A, B, C, D): steroid skeleton.',
      'C3-OH: characteristic of sterols.',
      'Conclusion: steroid.',
    ],
  },
  {
    id: 'testosterone',
    scenario: 'A tetracyclic steroid with a ketone at C3 in the A ring and a hydroxyl at C17, formula C₁₉H₂₈O₂.',
    lipidClass: 'steroid',
    commonName: 'Testosterone',
    explanation: 'Testosterone is a male sex hormone (androgen). Like all steroids it has the characteristic four-ring skeleton derived from cholesterol.',
    steps: [
      'Four fused rings: steroid nucleus.',
      'Ketone (C=O) and hydroxyl groups: androgenic modifications.',
      'Conclusion: steroid.',
    ],
  },
  {
    id: 'isoprene',
    scenario: 'A 10-carbon hydrocarbon (C₁₀H₁₆) made of two isoprene units (2-methylbuta-1,3-diene). It is found in essential oils such as limonene.',
    lipidClass: 'terpene',
    commonName: 'Monoterpene (e.g., limonene)',
    explanation: 'Terpenes are built from isoprene (C₅) units. 2 isoprene units = monoterpene (C₁₀), 3 = sesquiterpene (C₁₅), 4 = diterpene (C₂₀), 8 = tetraterpene (C₄₀).',
    steps: [
      'Count carbons: 10 = 2 × C₅ isoprene units.',
      'No ester/phosphate, not a steroid ring: terpene.',
      'C₁₀: monoterpene.',
    ],
  },
  {
    id: 'geraniol',
    scenario: 'A C₁₀ acyclic alcohol with two isoprene units, found in rose and geranium oils. Formula: (E)-3,7-dimethylocta-2,6-dien-1-ol.',
    lipidClass: 'terpene',
    commonName: 'Geraniol (monoterpene)',
    explanation: 'Geraniol is a monoterpene alcohol (C₁₀), built from two isoprene units. Its characteristic rose scent makes it a common fragrance ingredient.',
    steps: [
      'C₁₀ skeleton with two isoprene units: terpene.',
      'Allylic alcohol functional group.',
      'Conclusion: monoterpene (terpene class).',
    ],
  },
  {
    id: 'beta-carotene',
    scenario: 'A bright orange C₄₀ polyene with eight isoprene units and two β-ionone rings at each terminus. It is the precursor to vitamin A.',
    lipidClass: 'terpene',
    commonName: 'β-Carotene (tetraterpene)',
    explanation: 'β-Carotene is a tetraterpene (C₄₀ = 8 isoprene units). Enzymatic cleavage of its central double bond produces two vitamin A (retinol) molecules.',
    steps: [
      'Count C₅ units: 8 → tetraterpene.',
      'Highly conjugated polyene: accounts for orange color.',
      'Conclusion: terpene (tetraterpene / carotenoid).',
    ],
  },
  {
    id: 'sphingomyelin',
    scenario: 'A lipid with a sphingosine backbone (long-chain amino alcohol), one fatty acid in amide linkage, and a phosphocholine head group.',
    lipidClass: 'sphingolipid',
    commonName: 'Sphingomyelin',
    explanation: 'Sphingomyelin is a sphingolipid — it uses sphingosine (not glycerol) as its backbone and has an amide bond (not an ester) to the fatty acid.',
    steps: [
      'Sphingosine backbone (C18 amino alcohol): key distinction from glycerophospholipids.',
      'Amide-linked fatty acid at the amino group.',
      'Phosphocholine head: phospholipid-like but classified as sphingolipid.',
      'Conclusion: sphingolipid.',
    ],
  },
  {
    id: 'cerebroside',
    scenario: 'Sphingosine backbone with a fatty acid in amide linkage and a monosaccharide (glucose or galactose) head group — no phosphate.',
    lipidClass: 'sphingolipid',
    commonName: 'Cerebroside (glycosphingolipid)',
    explanation: 'Cerebrosides are glycosphingolipids with a single sugar head group and no phosphate. They are abundant in the myelin sheath of neurons.',
    steps: [
      'Sphingosine backbone: sphingolipid family.',
      'Amide-linked fatty acid.',
      'Sugar head group (no phosphate): glycosphingolipid.',
      'Conclusion: sphingolipid.',
    ],
  },
  {
    id: 'beeswax',
    scenario: 'A long-chain alcohol (C26) esterified to a long-chain fatty acid (C16), forming a single ester bond. No glycerol backbone.',
    lipidClass: 'wax',
    commonName: 'Beeswax component',
    explanation: 'Waxes are esters of a long-chain alcohol and a long-chain fatty acid. Unlike triglycerides, they have no glycerol backbone and only one ester linkage.',
    steps: [
      'Single ester bond (–COO–): not a triglyceride (which has three).',
      'Long-chain alcohol (C16–C36) + long-chain fatty acid.',
      'No glycerol backbone.',
      'Conclusion: wax ester.',
    ],
  },
  {
    id: 'carnauba-wax',
    scenario: 'Esters of C24–C28 alcohols with C16–C18 fatty acids. Very high melting point (82–86 °C). Used in car polish and cosmetics.',
    lipidClass: 'wax',
    commonName: 'Carnauba wax',
    explanation: 'Carnauba wax is a plant-derived wax with very long chain lengths. The tight packing of long saturated chains gives it an exceptionally high melting point.',
    steps: [
      'Ester of very long-chain alcohol with fatty acid: wax ester.',
      'No glycerol backbone.',
      'Conclusion: wax.',
    ],
  },
  {
    id: 'dha',
    scenario: 'A 22-carbon fatty acid with six cis C=C double bonds (22:6 Δ4,7,10,13,16,19). Abundant in brain phospholipids.',
    lipidClass: 'unsaturated-fatty-acid',
    commonName: 'DHA (22:6, ω-3)',
    explanation: 'DHA (docosahexaenoic acid) is the most polyunsaturated fatty acid found in the brain. It is an ω-3 essential fatty acid.',
    steps: [
      'Carboxylic acid terminus: fatty acid.',
      'Six C=C double bonds: highly polyunsaturated.',
      'First C=C 3 carbons from ω end: ω-3 fatty acid.',
    ],
  },
  {
    id: 'phosphatidylinositol',
    scenario: 'Glycerol backbone with two fatty acids and a phosphate-inositol head group. Inositol is a cyclic hexitol (C₆ sugar alcohol).',
    lipidClass: 'phospholipid',
    commonName: 'Phosphatidylinositol (PI)',
    explanation: 'PI and its phosphorylated forms (PIPs) are key signaling phospholipids. The inositol head can be phosphorylated at multiple positions to generate second messengers.',
    steps: [
      'Two fatty acid esters + phosphate at sn-3.',
      'Inositol head group (cyclic hexitol).',
      'Conclusion: glycerophospholipid.',
    ],
  },
  {
    id: 'cortisol',
    scenario: 'A C₂₁ steroid with an 11β-hydroxyl, 17α-hydroxyl, and 21-hydroxyl groups plus a ketone at C3 and C20. The primary glucocorticoid in humans.',
    lipidClass: 'steroid',
    commonName: 'Cortisol (hydrocortisone)',
    explanation: 'Cortisol is a glucocorticoid released by the adrenal cortex. Like all steroids it has the four-fused-ring (sterane) skeleton.',
    steps: [
      'Four fused rings: steroid nucleus.',
      'Multiple hydroxyl and ketone groups are typical of corticosteroids.',
      'Conclusion: steroid.',
    ],
  },
  {
    id: 'myristic',
    scenario: 'CH₃(CH₂)₁₂COOH — a 14-carbon saturated fatty acid found in nutmeg and dairy fats. Often used for N-myristoylation of proteins.',
    lipidClass: 'saturated-fatty-acid',
    commonName: 'Myristic acid (14:0)',
    explanation: 'Myristic acid (C14:0) is a saturated fatty acid commonly found in coconut oil, palm kernel oil, and dairy fat.',
    steps: [
      'One –COOH terminus: fatty acid.',
      'No C=C double bonds in the 14-carbon chain: saturated.',
      'Conclusion: saturated fatty acid.',
    ],
  },
  {
    id: 'arachidonic',
    scenario: 'A 20-carbon fatty acid with four cis C=C double bonds at Δ5, Δ8, Δ11, and Δ14 (20:4 Δ5,8,11,14). Precursor to prostaglandins and leukotrienes.',
    lipidClass: 'unsaturated-fatty-acid',
    commonName: 'Arachidonic acid (20:4, ω-6)',
    explanation: 'Arachidonic acid is a polyunsaturated ω-6 fatty acid and the direct precursor of eicosanoids (prostaglandins, thromboxanes, leukotrienes).',
    steps: [
      'Carboxylic acid terminus: fatty acid.',
      'Four C=C bonds: polyunsaturated.',
      'First C=C 6 carbons from ω end: ω-6.',
    ],
  },
  {
    id: 'ergosterol',
    scenario: 'A C₂₈ sterol with the four-ring steroid skeleton, an additional methyl at C24, and two extra double bonds in the B ring and the side chain. Found in fungal membranes.',
    lipidClass: 'steroid',
    commonName: 'Ergosterol',
    explanation: 'Ergosterol is the primary sterol in fungal cell membranes, analogous to cholesterol in animal cells. It is the target of antifungal drugs like amphotericin B.',
    steps: [
      'Four fused rings (steroid skeleton).',
      'Hydroxyl at C3 (sterol classification).',
      'Conclusion: steroid (specifically a sterol).',
    ],
  },
  {
    id: 'menthol',
    scenario: 'A C₁₀ cyclic monoterpene alcohol from peppermint. Two isoprene units arranged in a cyclohexane ring with a hydroxyl and isopropyl substituent.',
    lipidClass: 'terpene',
    commonName: 'Menthol (monoterpene)',
    explanation: 'Menthol is a cyclic monoterpene (C₁₀, 2 isoprene units) responsible for the cooling sensation of mint. Its hydroxyl group activates TRPM8 receptors.',
    steps: [
      'C₁₀ carbon skeleton built from 2 isoprene units.',
      'Cyclic monoterpene (cyclohexane ring).',
      'Conclusion: terpene.',
    ],
  },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const ALL_CLASSES = Object.keys(LIPID_CLASS_LABELS) as LipidClass[]

export function makeDistractors(correct: LipidClass, n = 3): LipidClass[] {
  const wrong = ALL_CLASSES.filter(c => c !== correct)
  return shuffle(wrong).slice(0, Math.min(n, wrong.length))
}

let recentIds: string[] = []

export function generateLipidProblem(): LipidProblem {
  const eligible = POOL.filter(p => !recentIds.includes(p.id))
  const pool = eligible.length > 0 ? eligible : POOL
  const picked = pick(pool)
  recentIds = [...recentIds.slice(-5), picked.id]
  return picked
}

export function checkLipidAnswer(problem: LipidProblem, selected: LipidClass): boolean {
  return selected === problem.lipidClass
}

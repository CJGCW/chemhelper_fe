// Data for organic chemistry: functional groups, hydrocarbon families, IUPAC naming.

export interface FunctionalGroup {
  id: string
  name: string
  generalFormula: string
  suffix: string
  bondPattern: string
  examples: { name: string; formula: string; smiles?: string }[]
  properties: string
}

export const FUNCTIONAL_GROUPS: FunctionalGroup[] = [
  {
    id: 'alcohol',
    name: 'Alcohol',
    generalFormula: 'R-OH',
    suffix: '-ol',
    bondPattern: 'C-OH (hydroxyl)',
    examples: [
      { name: 'methanol',   formula: 'CH₃OH',    smiles: 'CO'   },
      { name: 'ethanol',    formula: 'C₂H₅OH',   smiles: 'CCO'  },
      { name: '1-propanol', formula: 'C₃H₇OH',   smiles: 'CCCO' },
    ],
    properties: 'Polar; strong hydrogen bonding raises boiling point significantly above analogous alkanes.',
  },
  {
    id: 'aldehyde',
    name: 'Aldehyde',
    generalFormula: 'R-CHO',
    suffix: '-al',
    bondPattern: 'C=O terminal (carbonyl at chain end)',
    examples: [
      { name: 'formaldehyde',  formula: 'HCHO',        smiles: 'C=O'    },
      { name: 'acetaldehyde',  formula: 'CH₃CHO',      smiles: 'CC=O'   },
      { name: 'propanal',      formula: 'CH₃CH₂CHO',   smiles: 'CCC=O'  },
    ],
    properties: 'Polar carbonyl; cannot self-hydrogen-bond but accepts H-bonds from water. Lower BP than alcohols.',
  },
  {
    id: 'ketone',
    name: 'Ketone',
    generalFormula: 'R-CO-R\'',
    suffix: '-one',
    bondPattern: 'C=O internal (carbonyl flanked by two carbons)',
    examples: [
      { name: 'acetone (propanone)', formula: 'CH₃COCH₃',       smiles: 'CC(C)=O'    },
      { name: 'butanone',            formula: 'CH₃COCH₂CH₃',    smiles: 'CCC(C)=O'   },
      { name: '2-pentanone',         formula: 'CH₃COC₃H₇',      smiles: 'CCCC(C)=O'  },
    ],
    properties: 'Polar; excellent solvent for organic compounds; cannot be oxidized further under mild conditions.',
  },
  {
    id: 'carboxylic-acid',
    name: 'Carboxylic Acid',
    generalFormula: 'R-COOH',
    suffix: '-oic acid',
    bondPattern: 'C(=O)OH (carboxyl group)',
    examples: [
      { name: 'formic acid',  formula: 'HCOOH',       smiles: 'OC=O'             },
      { name: 'acetic acid',  formula: 'CH₃COOH',     smiles: 'CC(=O)O'          },
      { name: 'benzoic acid', formula: 'C₆H₅COOH',   smiles: 'OC(=O)c1ccccc1'   },
    ],
    properties: 'Weak acid; very high boiling point due to dimerization via hydrogen bonding; pKa typically 4–5.',
  },
  {
    id: 'ester',
    name: 'Ester',
    generalFormula: 'R-COO-R\'',
    suffix: '-oate (alkyl prefix + parent acid stem + -oate)',
    bondPattern: 'C(=O)O-C (ester linkage)',
    examples: [
      { name: 'methyl acetate', formula: 'CH₃COOCH₃',   smiles: 'COC(C)=O'   },
      { name: 'ethyl formate',  formula: 'HCOOC₂H₅',    smiles: 'CCOC=O'     },
      { name: 'ethyl acetate',  formula: 'CH₃COOC₂H₅',  smiles: 'CCOC(C)=O'  },
    ],
    properties: 'Often fruity or pleasant odors; formed by condensation of carboxylic acid + alcohol; lower BP than parent acids.',
  },
  {
    id: 'amine',
    name: 'Amine',
    generalFormula: 'R-NH₂',
    suffix: '-amine',
    bondPattern: 'C-N (amino group; nitrogen with lone pair)',
    examples: [
      { name: 'methylamine',    formula: 'CH₃NH₂',     smiles: 'CN'      },
      { name: 'dimethylamine',  formula: '(CH₃)₂NH',   smiles: 'CNC'     },
      { name: 'trimethylamine', formula: '(CH₃)₃N',    smiles: 'CN(C)C'  },
    ],
    properties: 'Basic (lone pair on N accepts protons); characteristic fishy odor; primary amines can hydrogen-bond.',
  },
  {
    id: 'amide',
    name: 'Amide',
    generalFormula: 'R-CONH₂',
    suffix: '-amide',
    bondPattern: 'C(=O)NH₂ (carbonyl bonded to nitrogen)',
    examples: [
      { name: 'formamide',  formula: 'HCONH₂',       smiles: 'NC=O'             },
      { name: 'acetamide',  formula: 'CH₃CONH₂',     smiles: 'CC(N)=O'          },
      { name: 'benzamide',  formula: 'C₆H₅CONH₂',   smiles: 'NC(=O)c1ccccc1'   },
    ],
    properties: 'Very high boiling point; the peptide bond in proteins is an amide linkage; resonance makes C–N bond partial double-bond character.',
  },
  {
    id: 'ether',
    name: 'Ether',
    generalFormula: 'R-O-R\'',
    suffix: 'ether (or alkoxy- prefix)',
    bondPattern: 'C-O-C (oxygen bridge between two carbons)',
    examples: [
      { name: 'diethyl ether',        formula: 'C₂H₅OC₂H₅',      smiles: 'CCOCC'   },
      { name: 'dimethyl ether',       formula: 'CH₃OCH₃',         smiles: 'COC'     },
      { name: 'tetrahydrofuran (THF)', formula: 'C₄H₈O (cyclic)', smiles: 'C1CCCO1' },
    ],
    properties: 'Weakly polar; good solvent; lower BP than alcohols of similar MW; cannot donate H-bonds but can accept them.',
  },
  {
    id: 'haloalkane',
    name: 'Haloalkane (Alkyl Halide)',
    generalFormula: 'R-X  (X = F, Cl, Br, I)',
    suffix: 'fluoro-/chloro-/bromo-/iodo- prefix',
    bondPattern: 'C-X (carbon–halogen bond)',
    examples: [
      { name: 'chloromethane',   formula: 'CH₃Cl',        smiles: 'CCl'    },
      { name: 'dichloromethane', formula: 'CH₂Cl₂',       smiles: 'ClCCl'  },
      { name: 'bromoethane',     formula: 'CH₃CH₂Br',     smiles: 'CCBr'   },
    ],
    properties: 'Polar C–X bond; no self-hydrogen-bonding; common electrophiles in substitution and elimination reactions.',
  },
  {
    id: 'thiol',
    name: 'Thiol',
    generalFormula: 'R-SH',
    suffix: '-thiol',
    bondPattern: 'C-SH (sulfhydryl group)',
    examples: [
      { name: 'methanethiol',   formula: 'CH₃SH',    smiles: 'CS'   },
      { name: 'ethanethiol',    formula: 'C₂H₅SH',   smiles: 'CCS'  },
      { name: '1-propanethiol', formula: 'C₃H₇SH',   smiles: 'CCCS' },
    ],
    properties: 'Foul, skunk-like odor detectable at ppb levels; lower BP than analogous alcohols (weaker H-bonding); oxidizes to disulfides.',
  },
]

// ── Hydrocarbon Families ──────────────────────────────────────────────────────

export interface HydrocarbonFamily {
  id: string
  name: string
  generalFormula: string
  bondType: string
  hybridization: string
  examples: { name: string; formula: string; n: number }[]
}

export const HYDROCARBON_FAMILIES: HydrocarbonFamily[] = [
  {
    id: 'alkane',
    name: 'Alkane',
    generalFormula: 'CₙH₂ₙ₊₂',
    bondType: 'All single bonds (C–C and C–H)',
    hybridization: 'sp³ at every carbon',
    examples: [
      { name: 'methane',  formula: 'CH₄',       n: 1  },
      { name: 'ethane',   formula: 'C₂H₆',      n: 2  },
      { name: 'propane',  formula: 'C₃H₈',      n: 3  },
      { name: 'butane',   formula: 'C₄H₁₀',     n: 4  },
      { name: 'pentane',  formula: 'C₅H₁₂',     n: 5  },
      { name: 'hexane',   formula: 'C₆H₁₄',     n: 6  },
      { name: 'heptane',  formula: 'C₇H₁₆',     n: 7  },
      { name: 'octane',   formula: 'C₈H₁₈',     n: 8  },
      { name: 'nonane',   formula: 'C₉H₂₀',     n: 9  },
      { name: 'decane',   formula: 'C₁₀H₂₂',    n: 10 },
    ],
  },
  {
    id: 'alkene',
    name: 'Alkene',
    generalFormula: 'CₙH₂ₙ',
    bondType: 'One C=C double bond (π + σ)',
    hybridization: 'sp² at doubly-bonded carbons',
    examples: [
      { name: 'ethene (ethylene)',  formula: 'C₂H₄',  n: 2 },
      { name: 'propene (propylene)', formula: 'C₃H₆', n: 3 },
      { name: '1-butene',           formula: 'C₄H₈',  n: 4 },
      { name: '1-pentene',          formula: 'C₅H₁₀', n: 5 },
    ],
  },
  {
    id: 'alkyne',
    name: 'Alkyne',
    generalFormula: 'CₙH₂ₙ₋₂',
    bondType: 'One C≡C triple bond (σ + 2π)',
    hybridization: 'sp at triply-bonded carbons',
    examples: [
      { name: 'ethyne (acetylene)', formula: 'C₂H₂', n: 2 },
      { name: 'propyne',            formula: 'C₃H₄', n: 3 },
      { name: '1-butyne',           formula: 'C₄H₆', n: 4 },
    ],
  },
]

// ── IUPAC Prefixes ────────────────────────────────────────────────────────────

export const IUPAC_PREFIXES: Record<number, string> = {
  1: 'meth',
  2: 'eth',
  3: 'prop',
  4: 'but',
  5: 'pent',
  6: 'hex',
  7: 'hept',
  8: 'oct',
  9: 'non',
  10: 'dec',
}

// ── Naming Problems ───────────────────────────────────────────────────────────

export interface OrganicNamingProblem {
  formula: string
  name: string
  family: 'alkane' | 'alkene' | 'alkyne'
  n: number
  smiles?: string
}

export const NAMING_PROBLEMS: OrganicNamingProblem[] = [
  // Alkanes
  { formula: 'CH₄',     name: 'methane',   family: 'alkane', n: 1,  smiles: 'C'         },
  { formula: 'C₂H₆',    name: 'ethane',    family: 'alkane', n: 2,  smiles: 'CC'        },
  { formula: 'C₃H₈',    name: 'propane',   family: 'alkane', n: 3,  smiles: 'CCC'       },
  { formula: 'C₄H₁₀',   name: 'butane',    family: 'alkane', n: 4,  smiles: 'CCCC'      },
  { formula: 'C₅H₁₂',   name: 'pentane',   family: 'alkane', n: 5,  smiles: 'CCCCC'     },
  { formula: 'C₆H₁₄',   name: 'hexane',    family: 'alkane', n: 6,  smiles: 'CCCCCC'    },
  { formula: 'C₇H₁₆',   name: 'heptane',   family: 'alkane', n: 7,  smiles: 'CCCCCCC'   },
  { formula: 'C₈H₁₈',   name: 'octane',    family: 'alkane', n: 8,  smiles: 'CCCCCCCC'  },
  { formula: 'C₉H₂₀',   name: 'nonane',    family: 'alkane', n: 9,  smiles: 'CCCCCCCCC' },
  { formula: 'C₁₀H₂₂',  name: 'decane',    family: 'alkane', n: 10, smiles: 'CCCCCCCCCC'},
  // Alkenes
  { formula: 'C₂H₄',    name: 'ethene',    family: 'alkene', n: 2,  smiles: 'C=C'       },
  { formula: 'C₃H₆',    name: 'propene',   family: 'alkene', n: 3,  smiles: 'CC=C'      },
  { formula: 'C₄H₈',    name: '1-butene',  family: 'alkene', n: 4,  smiles: 'CCC=C'     },
  { formula: 'C₅H₁₀',   name: '1-pentene', family: 'alkene', n: 5,  smiles: 'CCCC=C'    },
  { formula: 'C₆H₁₂',   name: '1-hexene',  family: 'alkene', n: 6,  smiles: 'CCCCC=C'   },
  // Alkynes
  { formula: 'C₂H₂',    name: 'ethyne',    family: 'alkyne', n: 2,  smiles: 'C#C'       },
  { formula: 'C₃H₄',    name: 'propyne',   family: 'alkyne', n: 3,  smiles: 'CC#C'      },
  { formula: 'C₄H₆',    name: '1-butyne',  family: 'alkyne', n: 4,  smiles: 'CCC#C'     },
  { formula: 'C₅H₈',    name: '1-pentyne', family: 'alkyne', n: 5,  smiles: 'CCCC#C'    },
  { formula: 'C₆H₁₀',   name: '1-hexyne',  family: 'alkyne', n: 6,  smiles: 'CCCCC#C'   },
  // Extra alkanes for variety
  { formula: 'C₃H₈',    name: 'propane',   family: 'alkane', n: 3,  smiles: 'CCC'       },
  { formula: 'C₅H₁₂',   name: 'pentane',   family: 'alkane', n: 5,  smiles: 'CCCCC'     },
]

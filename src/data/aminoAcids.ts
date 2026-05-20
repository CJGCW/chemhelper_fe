export interface AminoAcid {
  name: string
  three: string
  one: string
  rGroup: string
  /** SMILES for the R group fragment. Uses [R] as the Cα attachment point. */
  rGroupSmiles?: string
  /** Full structure SMILES for cyclic amino acids (e.g. Proline) where a discrete R group doesn't exist. */
  rGroupFullStructure?: string
  /** Canonical SMILES for the complete amino acid molecule. */
  fullSmiles: string
  class: 'nonpolar' | 'aromatic' | 'polar' | 'acidic' | 'basic'
  pKa1: number   // α-COOH
  pKa2: number   // α-NH₃⁺
  pKaR?: number  // side chain
  pI: number
  notes?: string
}

export const AMINO_ACIDS: AminoAcid[] = [
  // Nonpolar / aliphatic
  { name: 'Glycine',       three: 'Gly', one: 'G', rGroup: 'H',                   rGroupSmiles: '[H]',              fullSmiles: 'NCC(=O)O',                   class: 'nonpolar', pKa1: 2.34, pKa2: 9.60,                pI: 5.97 },
  { name: 'Alanine',       three: 'Ala', one: 'A', rGroup: 'CH₃',                 rGroupSmiles: '[R]C',             fullSmiles: 'CC(N)C(=O)O',                class: 'nonpolar', pKa1: 2.34, pKa2: 9.69,                pI: 6.00 },
  { name: 'Valine',        three: 'Val', one: 'V', rGroup: 'CH(CH₃)₂',            rGroupSmiles: '[R]C(C)C',         fullSmiles: 'CC(C)C(N)C(=O)O',            class: 'nonpolar', pKa1: 2.32, pKa2: 9.62,                pI: 5.96 },
  { name: 'Leucine',       three: 'Leu', one: 'L', rGroup: 'CH₂CH(CH₃)₂',        rGroupSmiles: '[R]CC(C)C',        fullSmiles: 'CC(C)CC(N)C(=O)O',           class: 'nonpolar', pKa1: 2.36, pKa2: 9.60,                pI: 5.98 },
  { name: 'Isoleucine',    three: 'Ile', one: 'I', rGroup: 'CH(CH₃)CH₂CH₃',      rGroupSmiles: '[R]C(C)CC',        fullSmiles: 'CCC(C)C(N)C(=O)O',           class: 'nonpolar', pKa1: 2.36, pKa2: 9.60,                pI: 6.02 },
  { name: 'Proline',       three: 'Pro', one: 'P', rGroup: '(pyrrolidine ring)',   rGroupFullStructure: 'OC(=O)[C@@H]1CCCN1', fullSmiles: 'OC(=O)C1CCCN1',   class: 'nonpolar', pKa1: 1.99, pKa2: 10.60,               pI: 6.30, notes: 'Secondary amine — disrupts α-helices and β-sheets' },
  { name: 'Methionine',    three: 'Met', one: 'M', rGroup: 'CH₂CH₂SCH₃',         rGroupSmiles: '[R]CCSC',          fullSmiles: 'CSCCC(N)C(=O)O',             class: 'nonpolar', pKa1: 2.28, pKa2: 9.21,                pI: 5.74 },
  // Aromatic
  { name: 'Phenylalanine', three: 'Phe', one: 'F', rGroup: 'CH₂C₆H₅',            rGroupSmiles: '[R]Cc1ccccc1',     fullSmiles: 'NC(Cc1ccccc1)C(=O)O',        class: 'aromatic', pKa1: 1.83, pKa2: 9.13,                pI: 5.48 },
  { name: 'Tyrosine',      three: 'Tyr', one: 'Y', rGroup: 'CH₂C₆H₄OH',          rGroupSmiles: '[R]Cc1ccc(O)cc1', fullSmiles: 'NC(Cc1ccc(O)cc1)C(=O)O',     class: 'aromatic', pKa1: 2.20, pKa2: 9.11, pKaR: 10.07,  pI: 5.66 },
  { name: 'Tryptophan',    three: 'Trp', one: 'W', rGroup: 'CH₂-indole',          rGroupSmiles: '[R]Cc1c[nH]c2ccccc12', fullSmiles: 'NC(Cc1c[nH]c2ccccc12)C(=O)O', class: 'aromatic', pKa1: 2.38, pKa2: 9.39,           pI: 5.89 },
  // Polar uncharged
  { name: 'Serine',        three: 'Ser', one: 'S', rGroup: 'CH₂OH',               rGroupSmiles: '[R]CO',            fullSmiles: 'OCC(N)C(=O)O',               class: 'polar',    pKa1: 2.21, pKa2: 9.15,                pI: 5.68 },
  { name: 'Threonine',     three: 'Thr', one: 'T', rGroup: 'CH(OH)CH₃',           rGroupSmiles: '[R]C(O)C',         fullSmiles: 'CC(O)C(N)C(=O)O',            class: 'polar',    pKa1: 2.11, pKa2: 9.62,                pI: 5.87 },
  { name: 'Cysteine',      three: 'Cys', one: 'C', rGroup: 'CH₂SH',               rGroupSmiles: '[R]CS',            fullSmiles: 'SCC(N)C(=O)O',               class: 'polar',    pKa1: 1.96, pKa2: 8.18,  pKaR: 8.30,  pI: 5.07, notes: 'Forms disulfide bonds (Cys-S-S-Cys) critical for protein structure' },
  { name: 'Asparagine',    three: 'Asn', one: 'N', rGroup: 'CH₂CONH₂',            rGroupSmiles: '[R]CC(=O)N',       fullSmiles: 'NC(=O)CC(N)C(=O)O',          class: 'polar',    pKa1: 2.02, pKa2: 8.80,                pI: 5.41 },
  { name: 'Glutamine',     three: 'Gln', one: 'Q', rGroup: 'CH₂CH₂CONH₂',        rGroupSmiles: '[R]CCC(=O)N',      fullSmiles: 'NC(=O)CCC(N)C(=O)O',         class: 'polar',    pKa1: 2.17, pKa2: 9.13,                pI: 5.65 },
  // Acidic
  { name: 'Aspartate',     three: 'Asp', one: 'D', rGroup: 'CH₂COOH',             rGroupSmiles: '[R]CC(=O)O',       fullSmiles: 'OC(=O)CC(N)C(=O)O',          class: 'acidic',   pKa1: 1.88, pKa2: 9.60,  pKaR: 3.65,  pI: 2.77 },
  { name: 'Glutamate',     three: 'Glu', one: 'E', rGroup: 'CH₂CH₂COOH',         rGroupSmiles: '[R]CCC(=O)O',      fullSmiles: 'OC(=O)CCC(N)C(=O)O',         class: 'acidic',   pKa1: 2.19, pKa2: 9.67,  pKaR: 4.25,  pI: 3.22 },
  // Basic
  { name: 'Lysine',        three: 'Lys', one: 'K', rGroup: '(CH₂)₄NH₂',           rGroupSmiles: '[R]CCCCN',         fullSmiles: 'NCCCCC(N)C(=O)O',            class: 'basic',    pKa1: 2.18, pKa2: 8.95,  pKaR: 10.50, pI: 9.74 },
  { name: 'Arginine',      three: 'Arg', one: 'R', rGroup: '(CH₂)₃NHC(=NH)NH₂', rGroupSmiles: '[R]CCCNC(N)=N',   fullSmiles: 'N=C(N)NCCCC(N)C(=O)O',       class: 'basic',    pKa1: 2.17, pKa2: 9.04,  pKaR: 12.50, pI: 10.76, notes: 'Guanidinium group — pKa > 12, always protonated at physiological pH' },
  { name: 'Histidine',     three: 'His', one: 'H', rGroup: 'CH₂-imidazole',       rGroupSmiles: '[R]Cc1c[nH]cn1', fullSmiles: 'NC(Cc1c[nH]cn1)C(=O)O',      class: 'basic',    pKa1: 1.82, pKa2: 9.17,  pKaR: 6.00,  pI: 7.59,  notes: 'pKa ~6 → partially protonated at pH 7.4. Key catalytic residue in enzymes.' },
]

export const CLASS_LABELS: Record<AminoAcid['class'], string> = {
  nonpolar: 'Nonpolar / Aliphatic',
  aromatic: 'Aromatic',
  polar:    'Polar Uncharged',
  acidic:   'Acidic',
  basic:    'Basic',
}

export const CLASS_COLORS: Record<AminoAcid['class'], string> = {
  nonpolar: 'var(--c-alkane)',
  aromatic: 'var(--c-aromatic)',
  polar:    'var(--c-alcohol)',
  acidic:   'var(--c-acid)',
  basic:    'var(--c-amine)',
}

export type FilterClass = AminoAcid['class'] | 'all'

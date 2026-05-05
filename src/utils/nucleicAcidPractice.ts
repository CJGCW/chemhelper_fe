export type NucleicAcidProblemType = 'complement' | 'base-id' | 'dna-vs-rna'

export interface NucleicAcidProblem {
  type: NucleicAcidProblemType
  scenario: string
  question: string
  choices: string[]
  answer: string
  explanation: string
  steps: string[]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const DNA_BASES = ['A', 'T', 'G', 'C'] as const
const RNA_BASES = ['A', 'U', 'G', 'C'] as const

function dnaComplement(base: string): string {
  return base === 'A' ? 'T' : base === 'T' ? 'A' : base === 'G' ? 'C' : 'G'
}


function generateDnaComplementProblem(): NucleicAcidProblem {
  const len = 4 + Math.floor(Math.random() * 5)  // 4–8 bases
  const seq = Array.from({ length: len }, () => DNA_BASES[Math.floor(Math.random() * 4)])
  const seqStr = `5'-${seq.join('')}-3'`
  const comp = seq.map(dnaComplement).reverse().join('')
  const compStr = `5'-${comp}-3'`

  // Generate 3 wrong answers
  const wrongs: string[] = []
  while (wrongs.length < 3) {
    const candidate = seq.map(dnaComplement).map(b => (Math.random() < 0.25 ? DNA_BASES[Math.floor(Math.random() * 4)] : b)).reverse().join('')
    const candidateStr = `5'-${candidate}-3'`
    if (candidateStr !== compStr && !wrongs.includes(candidateStr)) {
      wrongs.push(candidateStr)
    }
  }

  return {
    type: 'complement',
    scenario: `DNA template strand: ${seqStr}`,
    question: 'Which of the following is the complementary DNA strand written 5′→3′?',
    choices: shuffle([compStr, ...wrongs]),
    answer: compStr,
    explanation: `The complementary strand is antiparallel: read the template 3′→5′ (right to left), apply A↔T and G↔C pairing, then write the result 5′→3′. Result: ${compStr}.`,
    steps: seq.map((b, i) => `Position ${i + 1}: ${b} pairs with ${dnaComplement(b)}`).concat([
      'Reverse the complement sequence for antiparallel orientation.',
      `Complementary strand (5′→3′): ${comp}`,
    ]),
  }
}

function generateRnaComplementProblem(): NucleicAcidProblem {
  const len = 4 + Math.floor(Math.random() * 4)  // 4–7 bases
  const seq = Array.from({ length: len }, () => DNA_BASES[Math.floor(Math.random() * 4)])
  const seqStr = `5'-${seq.join('')}-3'`
  const transcript = seq.map(b => b === 'A' ? 'U' : b === 'T' ? 'A' : b === 'G' ? 'C' : 'G').reverse().join('')
  const answer = `5'-${transcript}-3'`

  const wrongs: string[] = []
  while (wrongs.length < 3) {
    const candidate = seq.map(b => b === 'A' ? 'U' : b === 'T' ? 'A' : b === 'G' ? 'C' : 'G')
      .map(b => (Math.random() < 0.3 ? RNA_BASES[Math.floor(Math.random() * 4)] : b))
      .reverse().join('')
    const candidateStr = `5'-${candidate}-3'`
    if (candidateStr !== answer && !wrongs.includes(candidateStr)) {
      wrongs.push(candidateStr)
    }
  }

  return {
    type: 'complement',
    scenario: `DNA template strand (read 3′→5′ by RNA polymerase): ${seqStr}`,
    question: 'What is the mRNA transcript of this template strand (5′→3′)? Note: RNA uses U instead of T.',
    choices: shuffle([answer, ...wrongs]),
    answer,
    explanation: `RNA polymerase reads the template 3′→5′ and synthesizes mRNA 5′→3′. A→U, T→A, G→C, C→G. Result: ${answer}.`,
    steps: seq.map(b => {
      const r = b === 'A' ? 'U' : b === 'T' ? 'A' : b === 'G' ? 'C' : 'G'
      return `Template ${b} → mRNA ${r}`
    }).concat([
      'Reverse for antiparallel synthesis.',
      `mRNA (5′→3′): ${transcript}`,
    ]),
  }
}

interface BaseIdEntry {
  name: string
  hint: string
  category: 'purine' | 'pyrimidine'
  foundIn: string
  pairsWith: string
}

const BASE_ID_POOL: BaseIdEntry[] = [
  { name: 'Adenine (A)',  hint: 'A double-ring base (purine) that pairs with thymine in DNA and uracil in RNA. Found in both DNA and RNA.',                           category: 'purine',     foundIn: 'DNA and RNA', pairsWith: 'T (in DNA) or U (in RNA)' },
  { name: 'Guanine (G)',  hint: 'A double-ring base (purine) with a carbonyl at C6. Forms 3 hydrogen bonds with cytosine. Found in DNA and RNA.',                    category: 'purine',     foundIn: 'DNA and RNA', pairsWith: 'C' },
  { name: 'Cytosine (C)', hint: 'A single-ring base (pyrimidine) that pairs with guanine via 3 hydrogen bonds. Found in both DNA and RNA.',                          category: 'pyrimidine', foundIn: 'DNA and RNA', pairsWith: 'G' },
  { name: 'Thymine (T)',  hint: 'A single-ring base (pyrimidine) with a methyl group at C5. Pairs with adenine. Found ONLY in DNA.',                                 category: 'pyrimidine', foundIn: 'DNA only',     pairsWith: 'A' },
  { name: 'Uracil (U)',   hint: 'A single-ring base (pyrimidine) lacking the methyl group of thymine. Found ONLY in RNA. Pairs with adenine.',                       category: 'pyrimidine', foundIn: 'RNA only',     pairsWith: 'A' },
]

function generateBaseIdProblem(): NucleicAcidProblem {
  const entry = BASE_ID_POOL[Math.floor(Math.random() * BASE_ID_POOL.length)]
  const isCategory = Math.random() < 0.5
  const question = isCategory
    ? `Is this base a purine (double ring) or a pyrimidine (single ring)?`
    : `Which nucleic acid(s) is this base found in?`
  const answer = isCategory ? (entry.category === 'purine' ? 'Purine (double ring)' : 'Pyrimidine (single ring)') : entry.foundIn
  const choices = isCategory
    ? shuffle(['Purine (double ring)', 'Pyrimidine (single ring)', 'Both', 'Neither'])
    : shuffle(['DNA only', 'RNA only', 'DNA and RNA', 'Neither DNA nor RNA'])

  return {
    type: 'base-id',
    scenario: `Nucleobase: ${entry.name}\n\n${entry.hint}`,
    question,
    choices,
    answer,
    explanation: isCategory
      ? `${entry.name} is a ${entry.category}. Purines (A, G) have fused double rings; pyrimidines (C, T, U) have a single ring.`
      : `${entry.name} is found in ${entry.foundIn}. It pairs with ${entry.pairsWith}.`,
    steps: isCategory
      ? ['Purines = Adenine, Guanine (double ring, larger).', 'Pyrimidines = Cytosine, Thymine, Uracil (single ring, smaller).', `${entry.name} → ${entry.category}.`]
      : [`Thymine (T) is found only in DNA; Uracil (U) is found only in RNA.`, `A, G, and C are found in both.`, `${entry.name} → ${entry.foundIn}.`],
  }
}

interface DnaRnaEntry {
  feature: string
  molecule: 'DNA' | 'RNA'
  explanation: string
  steps: string[]
}

const DNA_RNA_POOL: DnaRnaEntry[] = [
  { feature: 'Contains deoxyribose sugar (no 2′-OH)', molecule: 'DNA', explanation: 'DNA uses 2′-deoxyribose. The absence of the 2′-OH makes the chain less susceptible to hydrolysis.', steps: ['Deoxyribose (no 2′-OH) = DNA.', 'Ribose (has 2′-OH) = RNA.'] },
  { feature: 'Contains ribose sugar (has a 2′-OH group)', molecule: 'RNA', explanation: 'RNA uses ribose, which carries a 2′-OH group. This extra hydroxyl makes RNA more reactive and prone to alkaline hydrolysis.', steps: ['Ribose (2′-OH present) → RNA.'] },
  { feature: 'Uses thymine (T) as one of its pyrimidine bases', molecule: 'DNA', explanation: 'Thymine (5-methyluracil) is found only in DNA. RNA uses uracil (U) in its place.', steps: ['Thymine (T) → DNA only.', 'Uracil (U) → RNA only.'] },
  { feature: 'Uses uracil (U) instead of thymine as a base', molecule: 'RNA', explanation: 'Uracil (U) is the RNA equivalent of thymine. It lacks the methyl group at C5 and pairs with adenine.', steps: ['Uracil (U) → RNA.', 'Thymine (T) → DNA.'] },
  { feature: 'Typically double-stranded with a right-handed helical structure (B-form)', molecule: 'DNA', explanation: 'Genomic DNA is B-form double helix. Both strands are antiparallel and complementary.', steps: ['Double helix, B-form → DNA.', 'RNA is typically single-stranded (forms local duplexes/hairpins).'] },
  { feature: 'Usually single-stranded; can form hairpin loops and complex secondary structures', molecule: 'RNA', explanation: 'RNA is usually single-stranded and folds on itself to form hairpin loops, bulges, and other 3D structures important for function (e.g., tRNA L-shape, ribozymes).', steps: ['Single-stranded with secondary structures → RNA.'] },
  { feature: 'Is the major carrier of genetic information in the nucleus', molecule: 'DNA', explanation: 'DNA stores the genome. It is replicated during cell division and transcribed into RNA.', steps: ['Genome storage = DNA.', 'Gene expression intermediary = RNA.'] },
  { feature: 'Carries genetic information from nucleus to ribosomes for protein synthesis', molecule: 'RNA', explanation: 'mRNA (messenger RNA) carries the genetic message from DNA to the ribosome where it is translated into protein.', steps: ['mRNA, tRNA, rRNA → RNA.', 'Information flow: DNA → RNA → Protein (central dogma).'] },
  { feature: 'Contains the base sequence ACGT with no U', molecule: 'DNA', explanation: 'The bases A, C, G, T (no U) are characteristic of DNA. RNA contains A, C, G, U (no T).', steps: ['A, C, G, T only → DNA.', 'A, C, G, U only → RNA.'] },
  { feature: 'Contains the base sequence ACGU with no T', molecule: 'RNA', explanation: 'The presence of U (and absence of T) identifies a strand as RNA.', steps: ['U present, T absent → RNA.'] },
]

function generateDnaRnaProblem(): NucleicAcidProblem {
  const entry = DNA_RNA_POOL[Math.floor(Math.random() * DNA_RNA_POOL.length)]
  return {
    type: 'dna-vs-rna',
    scenario: `Feature observed: "${entry.feature}"`,
    question: 'Does this feature describe DNA or RNA?',
    choices: shuffle(['DNA', 'RNA', 'Both DNA and RNA', 'Neither DNA nor RNA']),
    answer: entry.molecule,
    explanation: entry.explanation,
    steps: entry.steps,
  }
}

export function generateNucleicAcidProblem(forceType?: NucleicAcidProblemType): NucleicAcidProblem {
  const type = forceType ?? (['complement', 'base-id', 'dna-vs-rna'] as NucleicAcidProblemType[])[Math.floor(Math.random() * 3)]
  if (type === 'complement') {
    return Math.random() < 0.6 ? generateDnaComplementProblem() : generateRnaComplementProblem()
  }
  if (type === 'base-id') return generateBaseIdProblem()
  return generateDnaRnaProblem()
}

export function checkNucleicAcidAnswer(problem: NucleicAcidProblem, selected: string): boolean {
  return selected.trim() === problem.answer.trim()
}

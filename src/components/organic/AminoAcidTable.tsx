import { useState } from 'react'
import CompoundDisplay from '../shared/CompoundDisplay'

interface AminoAcid {
  name: string
  three: string
  one: string
  rGroup: string
  /** SMILES for the R group fragment. Uses [R] as the Cα attachment point. */
  rGroupSmiles?: string
  class: 'nonpolar' | 'aromatic' | 'polar' | 'acidic' | 'basic'
  pKa1: number   // α-COOH
  pKa2: number   // α-NH₃⁺
  pKaR?: number  // side chain
  pI: number
  notes?: string
}

const AMINO_ACIDS: AminoAcid[] = [
  // Nonpolar / aliphatic
  { name: 'Glycine',       three: 'Gly', one: 'G', rGroup: 'H',                   rGroupSmiles: '[H]',              class: 'nonpolar', pKa1: 2.34, pKa2: 9.60,                pI: 5.97 },
  { name: 'Alanine',       three: 'Ala', one: 'A', rGroup: 'CH₃',                 rGroupSmiles: '[R]C',             class: 'nonpolar', pKa1: 2.34, pKa2: 9.69,                pI: 6.00 },
  { name: 'Valine',        three: 'Val', one: 'V', rGroup: 'CH(CH₃)₂',            rGroupSmiles: '[R]C(C)C',         class: 'nonpolar', pKa1: 2.32, pKa2: 9.62,                pI: 5.96 },
  { name: 'Leucine',       three: 'Leu', one: 'L', rGroup: 'CH₂CH(CH₃)₂',        rGroupSmiles: '[R]CC(C)C',        class: 'nonpolar', pKa1: 2.36, pKa2: 9.60,                pI: 5.98 },
  { name: 'Isoleucine',    three: 'Ile', one: 'I', rGroup: 'CH(CH₃)CH₂CH₃',      rGroupSmiles: '[R]C(C)CC',        class: 'nonpolar', pKa1: 2.36, pKa2: 9.60,                pI: 6.02 },
  { name: 'Proline',       three: 'Pro', one: 'P', rGroup: '(pyrrolidine ring)',                                     class: 'nonpolar', pKa1: 1.99, pKa2: 10.60,               pI: 6.30, notes: 'Secondary amine — disrupts α-helices and β-sheets' },
  { name: 'Methionine',    three: 'Met', one: 'M', rGroup: 'CH₂CH₂SCH₃',         rGroupSmiles: '[R]CCSC',          class: 'nonpolar', pKa1: 2.28, pKa2: 9.21,                pI: 5.74 },
  // Aromatic
  { name: 'Phenylalanine', three: 'Phe', one: 'F', rGroup: 'CH₂C₆H₅',                                              class: 'aromatic', pKa1: 1.83, pKa2: 9.13,                pI: 5.48 },
  { name: 'Tyrosine',      three: 'Tyr', one: 'Y', rGroup: 'CH₂C₆H₄OH',                                            class: 'aromatic', pKa1: 2.20, pKa2: 9.11, pKaR: 10.07,  pI: 5.66 },
  { name: 'Tryptophan',    three: 'Trp', one: 'W', rGroup: 'CH₂-indole',                                            class: 'aromatic', pKa1: 2.38, pKa2: 9.39,                pI: 5.89 },
  // Polar uncharged
  { name: 'Serine',        three: 'Ser', one: 'S', rGroup: 'CH₂OH',               rGroupSmiles: '[R]CO',            class: 'polar',    pKa1: 2.21, pKa2: 9.15,                pI: 5.68 },
  { name: 'Threonine',     three: 'Thr', one: 'T', rGroup: 'CH(OH)CH₃',           rGroupSmiles: '[R]C(O)C',         class: 'polar',    pKa1: 2.11, pKa2: 9.62,                pI: 5.87 },
  { name: 'Cysteine',      three: 'Cys', one: 'C', rGroup: 'CH₂SH',               rGroupSmiles: '[R]CS',            class: 'polar',    pKa1: 1.96, pKa2: 8.18,  pKaR: 8.30,  pI: 5.07, notes: 'Forms disulfide bonds (Cys-S-S-Cys) critical for protein structure' },
  { name: 'Asparagine',    three: 'Asn', one: 'N', rGroup: 'CH₂CONH₂',            rGroupSmiles: '[R]CC(=O)N',       class: 'polar',    pKa1: 2.02, pKa2: 8.80,                pI: 5.41 },
  { name: 'Glutamine',     three: 'Gln', one: 'Q', rGroup: 'CH₂CH₂CONH₂',        rGroupSmiles: '[R]CCC(=O)N',      class: 'polar',    pKa1: 2.17, pKa2: 9.13,                pI: 5.65 },
  // Acidic
  { name: 'Aspartate',     three: 'Asp', one: 'D', rGroup: 'CH₂COOH',             rGroupSmiles: '[R]CC(=O)O',       class: 'acidic',   pKa1: 1.88, pKa2: 9.60,  pKaR: 3.65,  pI: 2.77 },
  { name: 'Glutamate',     three: 'Glu', one: 'E', rGroup: 'CH₂CH₂COOH',         rGroupSmiles: '[R]CCC(=O)O',      class: 'acidic',   pKa1: 2.19, pKa2: 9.67,  pKaR: 4.25,  pI: 3.22 },
  // Basic
  { name: 'Lysine',        three: 'Lys', one: 'K', rGroup: '(CH₂)₄NH₂',           rGroupSmiles: '[R]CCCCN',         class: 'basic',    pKa1: 2.18, pKa2: 8.95,  pKaR: 10.50, pI: 9.74 },
  { name: 'Arginine',      three: 'Arg', one: 'R', rGroup: '(CH₂)₃NHC(=NH)NH₂',                                    class: 'basic',    pKa1: 2.17, pKa2: 9.04,  pKaR: 12.50, pI: 10.76, notes: 'Guanidinium group — pKa > 12, always protonated at physiological pH' },
  { name: 'Histidine',     three: 'His', one: 'H', rGroup: 'CH₂-imidazole',                                         class: 'basic',    pKa1: 1.82, pKa2: 9.17,  pKaR: 6.00,  pI: 7.59,  notes: 'pKa ~6 → partially protonated at pH 7.4. Key catalytic residue in enzymes.' },
]

const CLASS_LABELS: Record<AminoAcid['class'], string> = {
  nonpolar: 'Nonpolar / Aliphatic',
  aromatic: 'Aromatic',
  polar:    'Polar Uncharged',
  acidic:   'Acidic',
  basic:    'Basic',
}

const CLASS_COLORS: Record<AminoAcid['class'], string> = {
  nonpolar: 'var(--c-alkane)',
  aromatic: 'var(--c-aromatic)',
  polar:    'var(--c-alcohol)',
  acidic:   'var(--c-acid)',
  basic:    'var(--c-amine)',
}

type FilterClass = AminoAcid['class'] | 'all'

export default function AminoAcidTable() {
  const [filter, setFilter] = useState<FilterClass>('all')
  const [search, setSearch] = useState('')

  const filtered = AMINO_ACIDS.filter(aa => {
    if (filter !== 'all' && aa.class !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return aa.name.toLowerCase().includes(q) || aa.three.toLowerCase().includes(q) || aa.one.toLowerCase() === q
    }
    return true
  })

  const pills: { id: FilterClass; label: string }[] = [
    { id: 'all',      label: 'All (20)' },
    { id: 'nonpolar', label: 'Nonpolar (7)' },
    { id: 'aromatic', label: 'Aromatic (3)' },
    { id: 'polar',    label: 'Polar (5)' },
    { id: 'acidic',   label: 'Acidic (2)' },
    { id: 'basic',    label: 'Basic (3)' },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">The 20 Standard Amino Acids</h3>
        <p className="font-sans text-xs text-secondary">pKa values from Brown Ch. 27. pI = isoelectric point (pH of net zero charge).</p>
      </div>

      {/* pI calculation box */}
      <div className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-semibold text-primary mb-1">Calculating pI</p>
        <p className="text-secondary"><span className="font-semibold">Neutral side chain:</span> pI = (pKa₁ + pKa₂) / 2 ≈ 6</p>
        <p className="text-secondary"><span className="font-semibold">Acidic side chain (Asp, Glu):</span> pI = (pKa₁ + pKa<sub>R</sub>) / 2 ≈ 3</p>
        <p className="text-secondary"><span className="font-semibold">Basic side chain (Lys, Arg, His):</span> pI = (pKa₂ + pKa<sub>R</sub>) / 2 ≈ 10</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {pills.map(p => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            className="px-3 py-1 rounded-full text-xs font-sans border transition-colors"
            style={filter === p.id ? {
              background: `color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))`,
              borderColor: `color-mix(in srgb, var(--c-halogen) 40%, transparent)`,
              color: 'var(--c-halogen)',
            } : {
              background: 'transparent',
              borderColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-secondary))',
            }}
          >
            {p.label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search name, 3-letter, or 1-letter…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-1 rounded-full text-xs border border-border bg-transparent text-primary placeholder:text-secondary outline-none focus:ring-1 focus:ring-border"
          style={{ minWidth: 220 }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 text-secondary font-semibold">Name</th>
              <th className="text-left py-2 pr-3 text-secondary font-semibold">3L / 1L</th>
              <th className="text-left py-2 pr-3 text-secondary font-semibold">R Group</th>
              <th className="text-left py-2 pr-3 text-secondary font-semibold">Class</th>
              <th className="text-right py-2 pr-3 text-secondary font-semibold">pKa(COOH)</th>
              <th className="text-right py-2 pr-3 text-secondary font-semibold">pKa(NH₃⁺)</th>
              <th className="text-right py-2 pr-3 text-secondary font-semibold">pKa(R)</th>
              <th className="text-right py-2 text-secondary font-semibold">pI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(aa => (
              <tr key={aa.name} className="border-b border-border/50 hover:bg-raised/50 transition-colors">
                <td className="py-2 pr-3 text-primary font-semibold">
                  {aa.name}
                  {aa.notes && (
                    <span className="block font-normal text-secondary" style={{ fontSize: 10 }}>{aa.notes}</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-primary">{aa.three} / {aa.one}</td>
                <td className="py-2 pr-3">
                  {aa.rGroupSmiles ? (
                    <div className="flex items-center gap-2">
                      <CompoundDisplay smiles={aa.rGroupSmiles} label={aa.rGroup} width={80} height={64} />
                      <span className="font-mono text-secondary" style={{ fontSize: 10 }}>{aa.rGroup}</span>
                    </div>
                  ) : (
                    <span className="font-mono text-secondary">{aa.rGroup}</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-white"
                    style={{ background: CLASS_COLORS[aa.class], fontSize: 10 }}
                  >
                    {CLASS_LABELS[aa.class]}
                  </span>
                </td>
                <td className="py-2 pr-3 text-right font-mono text-secondary">{aa.pKa1.toFixed(2)}</td>
                <td className="py-2 pr-3 text-right font-mono text-secondary">{aa.pKa2.toFixed(2)}</td>
                <td className="py-2 pr-3 text-right font-mono text-secondary">{aa.pKaR != null ? aa.pKaR.toFixed(2) : '—'}</td>
                <td className="py-2 text-right font-mono font-semibold text-primary">{aa.pI.toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-4 text-center text-secondary">No amino acids match the current filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

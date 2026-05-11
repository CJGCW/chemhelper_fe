import CompoundDisplay from '../shared/CompoundDisplay'

const BASE_SMILES: { name: string; smiles: string }[] = [
  { name: 'Adenine (A)',  smiles: 'Nc1ncnc2[nH]cnc12' },
  { name: 'Guanine (G)',  smiles: 'Nc1nc2[nH]cnc2c(=O)[nH]1' },
  { name: 'Cytosine (C)', smiles: 'Nc1cc[nH]c(=O)n1' },
  { name: 'Thymine (T)',  smiles: 'Cc1c[nH]c(=O)[nH]c1=O' },
  { name: 'Uracil (U)',   smiles: 'O=c1cc[nH]c(=O)[nH]1' },
]

export default function NucleotidesReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Nucleosides & Nucleotides</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Nucleotides are the monomeric building blocks of DNA and RNA.
          Each is a base + sugar + phosphate. Brown Ch. 28.
        </p>
      </div>

      {/* Nucleoside vs nucleotide */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Nucleoside vs Nucleotide</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">Nucleoside</p>
            <p className="text-secondary">Base + sugar only. No phosphate.</p>
            <p className="font-mono text-secondary mt-2">Base–N-glycosidic bond–Sugar</p>
            <p className="text-secondary mt-1">Examples: adenosine (A + ribose), thymidine (T + deoxyribose)</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">Nucleotide (NMP)</p>
            <p className="text-secondary">Base + sugar + 1 phosphate group (monophosphate).</p>
            <p className="font-mono text-secondary mt-2">5′-phosphate ester</p>
            <p className="text-secondary mt-1">AMP, GMP, CMP, TMP/UMP — the building blocks used in biosynthesis after phosphorylation to NTP.</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">NDP / NTP</p>
            <p className="text-secondary">Nucleoside di- or tri-phosphate.</p>
            <p className="font-mono text-secondary mt-2">ADP / ATP (energy currency)</p>
            <p className="text-secondary mt-1">NTPs are the substrates for RNA/DNA polymerases — they add NMPs to the growing chain with release of pyrophosphate (PPᵢ).</p>
          </div>
        </div>
      </section>

      {/* Sugars */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">The Two Sugars</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-2">D-Ribose (RNA)</p>
            <p className="font-mono text-secondary mb-2">C5H10O5 — 5-carbon sugar (furanose ring in nucleosides)</p>
            <p className="text-secondary">Has an OH at C2′ (the 2′-hydroxyl). The C2′-OH makes RNA susceptible to alkaline hydrolysis — RNA is less stable than DNA. This is why RNA is used as a transient messenger.</p>
          </div>
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-2">2′-Deoxyribose (DNA)</p>
            <p className="font-mono text-secondary mb-2">C5H10O4 — missing the OH at C2′</p>
            <p className="text-secondary">The absence of the 2′-OH makes DNA much more stable to hydrolysis. Perfect for long-term genetic information storage. DNA is also double-stranded, adding further stability.</p>
          </div>
        </div>
        <div className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-semibold text-primary mb-1">Sugar numbering convention</p>
          <p className="text-secondary">Atoms on the sugar are numbered with a prime (′): C1′, C2′, C3′, C4′, C5′. The base attaches at <strong>C1′</strong>. The phosphate attaches at <strong>C5′</strong>. The chain grows 3′→5′ direction during polymerization; the new nucleotide is added to the free 3′-OH. Chains are synthesized 5′→3′.</p>
        </div>
      </section>

      {/* N-glycosidic bond */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">N-Glycosidic Bond</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">The base is attached to C1′ of the sugar via an N-glycosidic bond (N–C1′).</p>
          <p className="text-secondary mb-1">• <strong className="text-primary">Purines (A, G):</strong> attached through N9 (imidazole nitrogen)</p>
          <p className="text-secondary mb-1">• <strong className="text-primary">Pyrimidines (C, T, U):</strong> attached through N1</p>
          <p className="text-secondary mb-2">Configuration is always β (base and C4′–C5′ on the same face of the sugar ring).</p>
          <p className="text-secondary">The N-glycosidic bond can be hydrolyzed by strong acid (releases free base + sugar). This is how DNA is depurinated (purines released faster than pyrimidines). Spontaneous depurination at physiological temperature is a significant source of DNA damage.</p>
        </div>
      </section>

      {/* Nucleobase structures */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Nucleobase Structures</h4>
        <div className="flex flex-wrap gap-3">
          {BASE_SMILES.map(b => (
            <CompoundDisplay key={b.name} smiles={b.smiles} label={b.name} width={150} height={120} />
          ))}
        </div>
        <p className="font-sans text-xs text-dim">Purines (A, G) have fused bicyclic rings. Pyrimidines (C, T, U) have a single ring. All nucleobases are planar and aromatic.</p>
      </section>

      {/* Naming table */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Naming Examples</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Base', 'Nucleoside (+ ribose)', 'Nucleoside (+ deoxyribose)', 'Nucleotide (5′-mono)'].map(h => (
                  <th key={h} className="text-left py-2 pr-3 text-secondary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { base: 'Adenine (A)', ns: 'Adenosine', dns: '2′-Deoxyadenosine', nt: 'AMP / dAMP' },
                { base: 'Guanine (G)',  ns: 'Guanosine',  dns: '2′-Deoxyguanosine',  nt: 'GMP / dGMP' },
                { base: 'Cytosine (C)', ns: 'Cytidine',   dns: '2′-Deoxycytidine',   nt: 'CMP / dCMP' },
                { base: 'Thymine (T)',  ns: '(Ribothymidine, rare)', dns: 'Thymidine (dT)', nt: 'dTMP' },
                { base: 'Uracil (U)',   ns: 'Uridine',    dns: '2′-Deoxyuridine (rare)', nt: 'UMP' },
              ].map(r => (
                <tr key={r.base} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-semibold text-primary">{r.base}</td>
                  <td className="py-2 pr-3 font-mono text-secondary">{r.ns}</td>
                  <td className="py-2 pr-3 font-mono text-secondary">{r.dns}</td>
                  <td className="py-2 font-mono text-secondary">{r.nt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

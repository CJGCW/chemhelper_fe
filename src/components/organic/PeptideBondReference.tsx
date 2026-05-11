export default function PeptideBondReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Peptide Bonds & Primary Structure</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Peptide bonds link amino acids into chains. The sequence of amino acids is the primary structure of a protein. Brown Ch. 27.
        </p>
      </div>

      {/* Formation */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Peptide Bond Formation</h4>
        <div className="rounded-sm border border-border p-4 font-mono text-xs text-secondary" style={{ background: 'rgb(var(--color-raised))' }}>
          <p>H₂N—CHR₁—COOH + H₂N—CHR₂—COOH →</p>
          <p className="mt-1 text-primary font-semibold">H₂N—CHR₁—C(=O)—NH—CHR₂—COOH + H₂O</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">Bond type</p>
            <p className="text-secondary">Amide bond (C–N). Called a "peptide bond" in biochemistry, but it is simply an amide linkage — the same bond formed in amide synthesis from acid + amine.</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">Thermodynamics</p>
            <p className="text-secondary">Condensation reaction (H₂O released). Slightly endergonic in isolation — biological peptide bond formation is coupled to ATP hydrolysis at the ribosome to drive the reaction forward.</p>
          </div>
        </div>
      </section>

      {/* Naming */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Naming Peptides</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">Convention: write N-terminus on the left, C-terminus on the right.</p>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-baseline">
              <code className="font-mono text-primary">Gly-Ala-Phe</code>
              <span className="text-secondary">= glycylalanylalanylphenylalanine (full name) — but 3-letter code is standard</span>
            </div>
            <div className="flex gap-3 items-baseline">
              <code className="font-mono text-primary">N-terminus</code>
              <span className="text-secondary">Free NH₂ group (or NH₃⁺ at physiological pH) — always on the first amino acid written</span>
            </div>
            <div className="flex gap-3 items-baseline">
              <code className="font-mono text-primary">C-terminus</code>
              <span className="text-secondary">Free COOH group (or COO⁻ at physiological pH) — last amino acid written</span>
            </div>
          </div>
          <p className="text-secondary mt-3">A <strong className="text-primary">dipeptide</strong> has 1 peptide bond. A <strong className="text-primary">tripeptide</strong> has 2. An <em>n</em>-residue peptide has <em>n</em>−1 peptide bonds.</p>
        </div>
      </section>

      {/* Properties of the peptide bond */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Properties of the Peptide Bond</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: 'Planar (rigid)',
              body: 'Resonance gives the C–N bond partial double-bond character (~40%). This locks the six atoms of the peptide unit (Cα, C, O, N, H, Cα) in the same plane. Rotation about the C–N bond is restricted.',
            },
            {
              title: 'Trans configuration',
              body: 'The bulky Cα groups prefer the trans arrangement across the C–N bond (~99.9% trans). cis peptide bonds are rare but do occur before proline residues (~5% cis before Pro).',
            },
            {
              title: 'Not hydrolyzed by base',
              body: 'Unlike regular esters, peptide bonds are resistant to hydrolysis under mild basic conditions due to the partial double bond character reducing electrophilicity of the carbonyl carbon.',
            },
            {
              title: 'Hydrolysis by strong acid or enzyme',
              body: '6M HCl / 110°C / 24h hydrolyzes all peptide bonds to free amino acids (used analytically). Proteases (trypsin, chymotrypsin, pepsin) cleave specific peptide bonds selectively.',
            },
          ].map(item => (
            <div key={item.title} className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-sans text-xs font-semibold text-primary mb-1">{item.title}</p>
              <p className="font-sans text-xs text-secondary leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Higher-order structure (very brief) */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Levels of Protein Structure (Overview)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-secondary font-semibold">Level</th>
                <th className="text-left py-2 pr-4 text-secondary font-semibold">Description</th>
                <th className="text-left py-2 text-secondary font-semibold">Stabilized by</th>
              </tr>
            </thead>
            <tbody>
              {[
                { level: '1° Primary', desc: 'Sequence of amino acids (peptide bonds)', stab: 'Covalent peptide bonds' },
                { level: '2° Secondary', desc: 'Local folding: α-helix, β-sheet, turns', stab: 'H-bonds between backbone C=O and N–H' },
                { level: '3° Tertiary', desc: 'Overall 3D fold of one polypeptide chain', stab: 'Hydrophobic effect, H-bonds, ionic, disulfide (Cys-Cys)' },
                { level: '4° Quaternary', desc: 'Assembly of multiple polypeptide subunits', stab: 'Same as tertiary, but between chains' },
              ].map(row => (
                <tr key={row.level} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-semibold text-primary">{row.level}</td>
                  <td className="py-2 pr-4 text-secondary">{row.desc}</td>
                  <td className="py-2 text-secondary">{row.stab}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

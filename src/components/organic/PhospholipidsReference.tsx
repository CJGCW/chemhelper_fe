export default function PhospholipidsReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Phospholipids & Membranes</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Phospholipids are the primary structural lipids of cell membranes.
          They are amphipathic: a polar (hydrophilic) head + two nonpolar (hydrophobic) tails. Brown Ch. 26.
        </p>
      </div>

      {/* Structure */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">General Structure (Glycerophospholipids)</h4>
        <div className="rounded-sm border border-border p-4 font-mono text-xs text-secondary" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-primary font-semibold mb-2">Glycerol + 2 fatty acids + phosphate + polar head group</p>
          <p>sn-1: CH₂–O–CO–R₁   (usually saturated FA)</p>
          <p>sn-2:  |  –O–CO–R₂   (usually unsaturated FA)</p>
          <p>sn-3: CH₂–O–PO₄–X   (phosphate ester to head group X)</p>
          <p className="mt-2 text-secondary">X = head group: choline (PC), ethanolamine (PE), serine (PS), inositol (PI), or H (phosphatidic acid)</p>
        </div>
      </section>

      {/* Common phospholipids */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Common Glycerophospholipids</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Name (abbrev.)', 'Head group X', 'Charge at pH 7', 'Notes'].map(h => (
                  <th key={h} className="text-left py-2 pr-3 text-secondary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Phosphatidylcholine (PC)', head: 'Choline (–OCH₂CH₂N⁺(CH₃)₃)', charge: 'Zwitterion (0)', notes: 'Most abundant membrane PL; "lecithin" in egg yolk; major component of myelin' },
                { name: 'Phosphatidylethanolamine (PE)', head: 'Ethanolamine (–OCH₂CH₂NH₂)', charge: 'Zwitterion (0)', notes: 'Inner leaflet of plasma membrane; involved in apoptosis signaling' },
                { name: 'Phosphatidylserine (PS)', head: 'Serine (–OCH₂CH(NH₂)COOH)', charge: 'Negative (−1)', notes: 'Inner leaflet; flipped to outer leaflet during apoptosis (eat-me signal)' },
                { name: 'Phosphatidylinositol (PI)', head: 'Inositol (6-OH cyclohexane)', charge: 'Negative (−1)', notes: 'Precursor to IP₃ and DAG second messengers; inner leaflet' },
                { name: 'Phosphatidic acid (PA)', head: 'H (no organic group)', charge: 'Negative (−2)', notes: 'Simplest glycerophospholipid; biosynthetic precursor to other PLs' },
              ].map(row => (
                <tr key={row.name} className="border-b border-border/50">
                  <td className="py-2 pr-3 text-primary font-semibold">{row.name}</td>
                  <td className="py-2 pr-3 font-mono text-secondary">{row.head}</td>
                  <td className="py-2 pr-3 text-secondary">{row.charge}</td>
                  <td className="py-2 text-secondary">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Membrane bilayer */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Membrane Bilayer Formation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">Amphipathic self-assembly</p>
            <p className="text-secondary">In aqueous solution, phospholipids spontaneously form bilayers: hydrophobic tails face inward (away from water), hydrophilic heads face outward (toward water). Driven by the hydrophobic effect — not strong covalent bonds, but collectively stable.</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">Fluidity</p>
            <p className="text-secondary">Membranes are fluid — lipids and proteins diffuse laterally. Fluidity depends on FA composition: <strong className="text-primary">more unsaturated FAs → more fluid</strong> (kinks prevent packing). Cholesterol moderates fluidity (orders loosely packed bilayers, disorders tightly packed ones).</p>
          </div>
        </div>
      </section>

      {/* Sphingolipids */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Sphingolipids</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">Based on sphingosine (an 18-carbon amino alcohol with one trans C=C) instead of glycerol. Backbone: sphingosine + one fatty acid amide-linked = ceramide.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div>
              <p className="font-semibold text-primary mb-1">Sphingomyelin</p>
              <p className="text-secondary">Ceramide + phosphocholine head. Major lipid in myelin sheaths of nerves and in plasma membranes. Abundant in brain.</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Glycosphingolipids</p>
              <p className="text-secondary">Ceramide + sugar(s) head (no phosphate). Cerebrosides (one sugar), gangliosides (complex oligosaccharide). Important in cell recognition and blood type antigens.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

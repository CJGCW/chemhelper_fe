export default function FattyAcidsReference() {
  const commonFAs = [
    { name: 'Palmitic acid',    abbrev: '16:0',          class: 'Saturated',       formula: 'C₁₆H₃₂O₂', mp: '63 °C',  occurrence: 'Palm oil, animal fat; most common saturated FA in mammals' },
    { name: 'Stearic acid',     abbrev: '18:0',          class: 'Saturated',       formula: 'C₁₈H₃₆O₂', mp: '70 °C',  occurrence: 'Animal fat, cocoa butter' },
    { name: 'Oleic acid',       abbrev: '18:1 Δ9 cis',   class: 'Monounsaturated', formula: 'C₁₈H₃₄O₂', mp: '16 °C',  occurrence: 'Olive oil (~70%); most abundant monounsaturated FA' },
    { name: 'Linoleic acid',    abbrev: '18:2 Δ9,12',    class: 'Polyunsaturated', formula: 'C₁₈H₃₂O₂', mp: '−5 °C',  occurrence: 'Corn, soybean oil; ω-6 essential fatty acid' },
    { name: 'α-Linolenic acid', abbrev: '18:3 Δ9,12,15', class: 'Polyunsaturated', formula: 'C₁₈H₃₀O₂', mp: '−11 °C', occurrence: 'Flaxseed, chia; ω-3 essential fatty acid' },
    { name: 'Arachidonic acid', abbrev: '20:4 Δ5,8,11,14', class: 'Polyunsaturated', formula: 'C₂₀H₃₂O₂', mp: '−49 °C', occurrence: 'Animal tissues; precursor to eicosanoids (prostaglandins, leukotrienes)' },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Fatty Acids</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Fatty acids are long-chain carboxylic acids (typically C12–C24, even-numbered) derived biosynthetically
          from acetyl-CoA (C2 units). Brown Ch. 26.
        </p>
      </div>

      {/* Notation */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Shorthand Notation</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">Fatty acids are written as <span className="font-mono font-semibold text-primary">C:D Δx,y…</span> where:</p>
          <p className="text-secondary">• <strong className="text-primary">C</strong> = total carbon count (including COOH carbon)</p>
          <p className="text-secondary">• <strong className="text-primary">D</strong> = number of double bonds</p>
          <p className="text-secondary">• <strong className="text-primary">Δx,y</strong> = positions of double bonds (Δ = counted from the COOH end, C1)</p>
          <p className="text-secondary mt-2">Example: <span className="font-mono text-primary">18:2 Δ9,12</span> = 18 carbons, 2 double bonds at C9 and C12 (linoleic acid, both cis)</p>
        </div>
      </section>

      {/* Saturated vs Unsaturated */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Saturated vs Unsaturated</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: 'Saturated',
              icon: '═',
              body: 'No C=C double bonds. All single bonds. Straight, extended chain — can pack tightly in a solid lattice. High melting point. Solid at room temperature. Common in animal fats.',
              color: 'var(--c-alkane)',
            },
            {
              title: 'Monounsaturated',
              icon: '⊃',
              body: 'One cis C=C double bond. The cis geometry introduces a "kink." Less tight packing → lower melting point. Liquid at room T. Olive oil is ~70% oleic acid (18:1).',
              color: 'var(--c-alkene)',
            },
            {
              title: 'Polyunsaturated',
              icon: '≋',
              body: 'Two or more cis C=C bonds. Multiple kinks → very low melting point. Liquid even when cold. Essential fatty acids (body cannot synthesize Δ12 and Δ15 bonds).',
              color: 'var(--c-alcohol)',
            },
          ].map(item => (
            <div key={item.title} className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-sans text-sm font-semibold text-primary mb-2">{item.title}</p>
              <p className="font-sans text-xs text-secondary leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* cis vs trans */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">cis vs trans Fatty Acids</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">cis (natural)</p>
            <p className="text-secondary">Both H atoms on the same side of the double bond. Creates a 30° kink in the chain. Most unsaturated FAs in nature are cis. Responsible for the liquid state of unsaturated oils.</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">trans (industrial)</p>
            <p className="text-secondary">H atoms on opposite sides. More linear chain — packs like a saturated FA. Higher melting point. Formed by partial hydrogenation of vegetable oils. Associated with elevated cardiovascular disease risk. Heavily regulated in food.</p>
          </div>
        </div>
      </section>

      {/* ω-nomenclature */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">ω (omega) Nomenclature</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">ω counts from the methyl end (ω carbon = last C). Position of the first double bond from the ω end determines the series.</p>
          <p className="text-secondary"><span className="font-semibold text-primary">ω-3 (n-3):</span> First double bond 3 carbons from methyl end. E.g., α-linolenic (18:3 Δ9,12,15 = ω-3). Anti-inflammatory; found in fatty fish, flaxseed.</p>
          <p className="text-secondary mt-1"><span className="font-semibold text-primary">ω-6 (n-6):</span> First double bond 6 carbons from methyl end. E.g., linoleic (18:2 Δ9,12 = ω-6). Pro-inflammatory at excess. Corn, soybean oil.</p>
          <p className="text-secondary mt-1"><span className="font-semibold text-primary">ω-9 (n-9):</span> First double bond 9 carbons from methyl end. E.g., oleic (18:1 Δ9 = ω-9). Not essential — body can synthesize from saturated FAs.</p>
        </div>
      </section>

      {/* Common fatty acids table */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Common Fatty Acids</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Notation', 'Class', 'Formula', 'Mp', 'Occurrence / Significance'].map(h => (
                  <th key={h} className="text-left py-2 pr-3 text-secondary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commonFAs.map(fa => (
                <tr key={fa.name} className="border-b border-border/50">
                  <td className="py-2 pr-3 text-primary font-semibold">{fa.name}</td>
                  <td className="py-2 pr-3 font-mono text-secondary">{fa.abbrev}</td>
                  <td className="py-2 pr-3 text-secondary">{fa.class}</td>
                  <td className="py-2 pr-3 font-mono text-secondary">{fa.formula}</td>
                  <td className="py-2 pr-3 font-mono text-secondary whitespace-nowrap">{fa.mp}</td>
                  <td className="py-2 text-secondary">{fa.occurrence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

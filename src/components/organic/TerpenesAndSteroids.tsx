export default function TerpenesAndSteroids() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Terpenes & Steroids</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Terpenes and steroids are isoprenoid lipids — built from C5 isoprene units — that serve diverse roles
          as fragrances, vitamins, hormones, and membrane components. Brown Ch. 26.
        </p>
      </div>

      {/* Isoprene rule */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">The Isoprene Rule</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">Terpenes are built from <strong className="text-primary">isoprene (C5H₈, 2-methyl-1,3-butadiene)</strong> units joined head-to-tail.</p>
          <p className="font-mono text-primary mb-2">CH₂=C(CH₃)–CH=CH₂ (isoprene)</p>
          <p className="text-secondary">Biological precursors: IPP (isopentenyl pyrophosphate) and DMAPP (dimethylallyl pyrophosphate) — the &quot;active isoprene&quot; units assembled by enzymes.</p>
        </div>
      </section>

      {/* Classification */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Terpene Classification</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['Class', 'C₅ units', 'Carbons', 'Examples'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-secondary font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { cls: 'Hemiterpene',   units: '1',  carbons: '5',   examples: 'Isoprene itself' },
                { cls: 'Monoterpene',   units: '2',  carbons: '10',  examples: 'Geraniol (rose scent), limonene (citrus), menthol (peppermint), α-pinene (turpentine), camphor' },
                { cls: 'Sesquiterpene', units: '3',  carbons: '15',  examples: 'Farnesol, caryophyllene (black pepper), artemisinin (antimalarial)' },
                { cls: 'Diterpene',     units: '4',  carbons: '20',  examples: 'Vitamin A (retinol), gibberellin (plant hormone), taxol (anticancer)' },
                { cls: 'Sesterterpene', units: '5',  carbons: '25',  examples: 'Marine sponge metabolites (rare)' },
                { cls: 'Triterpene',    units: '6',  carbons: '30',  examples: 'Squalene (precursor to steroids), lanosterol, oleanolic acid' },
                { cls: 'Tetraterpene',  units: '8',  carbons: '40',  examples: 'β-carotene (provitamin A), lycopene (tomato red), xanthophylls' },
                { cls: 'Polyterpene',   units: '>8', carbons: '>40', examples: 'Natural rubber (poly-cis-isoprene), gutta-percha (poly-trans)' },
              ].map(row => (
                <tr key={row.cls} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary font-semibold">{row.cls}</td>
                  <td className="py-2 pr-4 font-mono text-secondary">{row.units}</td>
                  <td className="py-2 pr-4 font-mono text-secondary">{row.carbons}</td>
                  <td className="py-2 text-secondary">{row.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Steroid core */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Steroid Core Structure</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">All steroids share the same tetracyclic skeleton: three cyclohexane rings (A, B, C) fused to one cyclopentane ring (D).</p>
          <p className="font-mono text-primary mb-2">Perhydrocyclopentanoperhydrophenanthrene (or &quot;steroid nucleus&quot;)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-center">
            <div className="rounded-sm border border-border p-2">
              <p className="font-semibold text-primary">Ring A</p>
              <p className="text-secondary">Cyclohexane</p>
            </div>
            <div className="rounded-sm border border-border p-2">
              <p className="font-semibold text-primary">Ring B</p>
              <p className="text-secondary">Cyclohexane</p>
            </div>
            <div className="rounded-sm border border-border p-2">
              <p className="font-semibold text-primary">Ring C</p>
              <p className="text-secondary">Cyclohexane</p>
            </div>
            <div className="rounded-sm border border-border p-2">
              <p className="font-semibold text-primary">Ring D</p>
              <p className="text-secondary">Cyclopentane</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key steroids */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Key Steroids</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          {[
            {
              name: 'Cholesterol',
              formula: 'C₂₇H₄₆O',
              role: 'Membrane component (modulates bilayer fluidity). Precursor to ALL steroid hormones, bile acids, and vitamin D. Biosynthesis: acetyl-CoA → squalene (C30) → lanosterol → cholesterol.',
            },
            {
              name: 'Testosterone',
              formula: 'C₁₉H₂₈O₂',
              role: 'Primary androgen (male sex hormone). Promotes muscle growth, bone density, secondary sex characteristics. Anabolic steroids are synthetic testosterone analogs.',
            },
            {
              name: 'Estradiol',
              formula: 'C₁₈H₂₄O₂',
              role: 'Primary estrogen. Ring A is aromatic (unique among steroids). Controls female reproductive cycle, bone density. Aromatase converts testosterone → estradiol.',
            },
            {
              name: 'Progesterone',
              formula: 'C₂₁H₃₀O₂',
              role: 'Progestogen. Prepares uterus for implantation, maintains pregnancy. Precursor to other steroid hormones in biosynthetic pathway.',
            },
            {
              name: 'Cortisol',
              formula: 'C₂₁H₃₀O₅',
              role: 'Glucocorticoid from adrenal cortex. Regulates glucose metabolism (increases blood glucose), suppresses immune response. Released in stress response.',
            },
            {
              name: 'Bile acids (cholic acid)',
              formula: 'C₂₄H₄₀O₅',
              role: 'Synthesized from cholesterol in liver. Amphipathic — emulsify dietary fats in the small intestine, increasing surface area for lipase digestion.',
            },
          ].map(s => (
            <div key={s.name} className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="font-semibold text-primary">{s.name}</p>
                <span className="font-mono text-secondary" style={{ fontSize: 10 }}>{s.formula}</span>
              </div>
              <p className="text-secondary leading-relaxed">{s.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Biosynthesis outline */}
      <section className="flex flex-col gap-2">
        <h4 className="font-sans font-semibold text-sm text-primary">Steroid Biosynthesis (Outline)</h4>
        <div className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-secondary">Acetyl-CoA → acetoacetyl-CoA → HMG-CoA → mevalonate → IPP/DMAPP → GPP → FPP → squalene (C30) → lanosterol → cholesterol → steroid hormones / bile acids / vitamin D₃</p>
          <p className="text-secondary mt-2">HMG-CoA reductase (converts HMG-CoA → mevalonate) is the rate-limiting enzyme. <strong className="text-primary">Statins</strong> (atorvastatin, simvastatin) inhibit HMG-CoA reductase — this is how they lower blood cholesterol.</p>
        </div>
      </section>
    </div>
  )
}

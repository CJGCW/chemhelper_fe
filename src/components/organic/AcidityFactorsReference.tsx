export default function AcidityFactorsReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">What Makes an Acid Stronger?</h3>
        <p className="font-sans text-xs text-secondary">
          Five structural factors determine acid strength. The more stable the conjugate base, the stronger the acid.
        </p>
      </div>

      {/* Factor 1 */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }}>1</span>
          Inductive Effects (Electronegativity of Nearby Groups)
        </h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Electron-withdrawing groups (EWGs) near the acidic proton stabilize the conjugate base by dispersing negative charge.
          The closer and more electronegative the substituent, the stronger the acid.
        </p>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-1.5 text-left font-semibold text-secondary">Compound</th>
                <th className="px-3 py-1.5 text-left font-semibold text-secondary">pKₐ</th>
                <th className="px-3 py-1.5 text-left font-semibold text-secondary">Relative Acidity</th>
              </tr>
            </thead>
            <tbody>
              {[
                { c: 'CH₃COOH (acetic acid)',         pka: '4.8', rel: 'Reference' },
                { c: 'ClCH₂COOH (chloroacetic)',      pka: '2.9', rel: '100× stronger' },
                { c: 'Cl₂CHCOOH (dichloroacetic)',    pka: '1.3', rel: '32 000× stronger' },
                { c: 'Cl₃CCOOH (trichloroacetic)',    pka: '0.6', rel: '160 000× stronger' },
              ].map(r => (
                <tr key={r.c} className="border-b border-border/50">
                  <td className="px-3 py-1.5 font-mono text-primary">{r.c}</td>
                  <td className="px-3 py-1.5 font-mono text-primary">{r.pka}</td>
                  <td className="px-3 py-1.5 text-secondary">{r.rel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-[11px] text-dim">Each Cl pulls electron density away from the carboxylate, stabilizing the negative charge.</p>
      </section>

      {/* Factor 2 */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }}>2</span>
          Resonance Stabilization
        </h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          If the conjugate base can delocalize the negative charge over multiple atoms (especially electronegative ones), the acid is stronger.
        </p>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-1.5 text-left font-semibold text-secondary">Compound</th>
                <th className="px-3 py-1.5 text-left font-semibold text-secondary">pKₐ</th>
                <th className="px-3 py-1.5 text-left font-semibold text-secondary">Conjugate Base</th>
              </tr>
            </thead>
            <tbody>
              {[
                { c: 'ROH (alcohol)',        pka: '16–18', cb: 'RO⁻ — charge localized on O' },
                { c: 'PhOH (phenol)',        pka: '~10',   cb: 'PhO⁻ — charge delocalized into ring (4 resonance forms)' },
                { c: 'RCOOH (carboxylic)',   pka: '4–5',   cb: 'RCOO⁻ — charge delocalized over 2 oxygens' },
              ].map(r => (
                <tr key={r.c} className="border-b border-border/50">
                  <td className="px-3 py-1.5 font-mono text-primary">{r.c}</td>
                  <td className="px-3 py-1.5 font-mono text-primary">{r.pka}</td>
                  <td className="px-3 py-1.5 text-secondary">{r.cb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Factor 3 */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }}>3</span>
          Hybridization (s-Character)
        </h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Higher s-character means the bonding electrons are held closer to the nucleus. The resulting anion is more stable because the charge is in a smaller, tighter orbital.
          sp (50% s) &gt; sp² (33% s) &gt; sp³ (25% s).
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs font-sans">
          {[
            { type: 'sp³ (alkane)', example: 'CH₄', pka: '~50', s: '25% s-character', color: 'text-dim' },
            { type: 'sp² (alkene)', example: 'CH₂=CH₂', pka: '~44', s: '33% s-character', color: 'text-secondary' },
            { type: 'sp (alkyne)', example: 'RC≡CH', pka: '~25', s: '50% s-character', color: 'text-primary' },
          ].map(h => (
            <div key={h.type} className="rounded-sm border border-border p-3 flex flex-col gap-1"
              style={{ background: 'rgb(var(--color-raised))' }}>
              <span className={`font-semibold ${h.color}`}>{h.type}</span>
              <span className="font-mono text-primary">{h.example}</span>
              <span className="text-dim">pKₐ {h.pka}</span>
              <span className="text-dim">{h.s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Factor 4 */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }}>4</span>
          Atomic Electronegativity (Same Row — Across Period)
        </h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Across a period, electronegativity increases. More electronegative atoms hold the negative charge better, so their conjugate bases are more stable.
        </p>
        <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-sm text-primary">HF &gt; H₂O &gt; NH₃ &gt; CH₄</p>
          <p className="font-sans text-xs text-secondary mt-1">pKₐ: 3.2 &lt; 15.7 &lt; 36 &lt; 50</p>
          <p className="font-sans text-xs text-dim mt-1">F (most electronegative) stabilizes F⁻ best → HF is the strongest acid in this series.</p>
        </div>
      </section>

      {/* Factor 5 */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }}>5</span>
          Atomic Size (Same Group — Down Column)
        </h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Down a group, atomic size increases. Larger atoms diffuse the negative charge over a greater volume, stabilizing the anion.
          <strong className="text-primary"> Size beats electronegativity down a group.</strong>
        </p>
        <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-sm text-primary">HI &gt; HBr &gt; HCl &gt; HF</p>
          <p className="font-sans text-xs text-secondary mt-1">pKₐ: −10 &lt; −9 &lt; −7 &lt; 3.2</p>
          <p className="font-sans text-xs text-dim mt-1">
            I⁻ is huge — the −1 charge is diffuse over a large volume, very stable.
            F⁻ is tiny — concentrates the charge, less stable despite higher electronegativity.
          </p>
        </div>
      </section>

      {/* Summary box */}
      <div className="rounded-sm border p-4 flex flex-col gap-2"
        style={{ background: 'color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-raised)))', borderColor: 'color-mix(in srgb, var(--c-halogen) 25%, transparent)' }}>
        <p className="font-sans font-semibold text-sm text-primary">Quick Decision Rule</p>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          1. Different elements as the acidic atom? Use <strong className="text-primary">electronegativity (across)</strong> or <strong className="text-primary">size (down)</strong>.<br />
          2. Same atom, different substituents? Look for <strong className="text-primary">resonance</strong> or <strong className="text-primary">inductive effects</strong>.<br />
          3. C–H acids? Use <strong className="text-primary">hybridization</strong> (sp &gt; sp² &gt; sp³).
        </p>
      </div>
    </div>
  )
}

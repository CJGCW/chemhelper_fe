export default function FischerReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Fischer Projection Rules</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A Fischer projection is a 2D representation of a 3D molecule. The carbon chain runs vertically
          with the most oxidized group at the top. Each horizontal bond comes <em>toward</em> the viewer
          (wedge); each vertical bond goes <em>away</em> from the viewer (dash).
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { rule: 'Horizontal = wedge (toward viewer)', note: 'The two substituents on each horizontal line point out of the plane toward you.' },
            { rule: 'Vertical = dash (away from viewer)', note: 'The backbone and vertical substituents go back into the plane.' },
            { rule: '180° rotation = same compound', note: 'Rotating the whole Fischer projection 180° keeps all bonds in the same orientation — the compound is unchanged.' },
            { rule: '90° rotation = inversion', note: 'Rotating a Fischer projection 90° (or 270°) inverts all stereocenters — you get the enantiomer.' },
            { rule: 'Swap two groups = inversion', note: 'Swapping any two groups in a Fischer projection inverts the configuration at that center.' },
            { rule: 'Keep one group fixed, rotate other three = same compound', note: 'Rotating three groups in a cyclic permutation (1→2→3, 2→3→1, etc.) preserves configuration.' },
          ].map(({ rule, note }) => (
            <div key={rule} className="p-3 rounded-sm border border-border bg-surface">
              <p className="font-mono text-xs font-semibold text-primary mb-1">{rule}</p>
              <p className="font-sans text-sm text-secondary">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">D/L Nomenclature</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The D/L system is used for sugars and amino acids and is based on glyceraldehyde as the reference.
          It does NOT directly correspond to R/S (though D-glyceraldehyde happens to be R).
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold" style={{ color: 'var(--c-halogen)' }}>D-configuration</p>
            <p className="font-sans text-sm text-secondary">
              In the Fischer projection (chain vertical, most oxidized group at top),
              the OH (for sugars) or NH₂ (for amino acids) at the <em>bottom reference carbon</em>
              points to the <strong className="text-primary">right</strong>.
            </p>
            <p className="font-mono text-xs text-dim">D-glyceraldehyde → OH on right → (R) configuration</p>
          </div>
          <div className="p-3 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold" style={{ color: 'var(--c-halogen)' }}>L-configuration</p>
            <p className="font-sans text-sm text-secondary">
              The reference group points to the <strong className="text-primary">left</strong> in the Fischer projection.
              Most natural amino acids are L; most natural sugars are D.
            </p>
            <p className="font-mono text-xs text-dim">L-glyceraldehyde → OH on left → (S) configuration</p>
          </div>
        </div>

        <div className="p-3 rounded-sm border border-border bg-surface">
          <p className="font-mono text-xs text-dim uppercase tracking-wider mb-2">Common Examples</p>
          <div className="overflow-x-auto">
            <table className="font-mono text-xs border-collapse w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 pr-4 text-dim font-normal">Compound</th>
                  <th className="text-center py-1.5 pr-4 text-dim font-normal">D/L</th>
                  <th className="text-center py-1.5 pr-4 text-dim font-normal">R/S</th>
                  <th className="text-left py-1.5 text-dim font-normal">Notes</th>
                </tr>
              </thead>
              <tbody className="text-secondary">
                {[
                  ['D-Glyceraldehyde', 'D', 'R', 'Reference compound'],
                  ['L-Glyceraldehyde', 'L', 'S', 'Mirror image'],
                  ['D-Glucose', 'D', 'various', 'C5–OH on right in Fischer'],
                  ['L-Alanine', 'L', 'S', 'Most natural amino acids are L'],
                  ['D-Alanine', 'D', 'R', 'Bacterial cell walls (unusual)'],
                  ['L-Lactic acid', 'L', 'S', 'Muscle lactic acid'],
                ].map(([name, dl, rs, note]) => (
                  <tr key={name} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-primary">{name}</td>
                    <td className="py-1.5 pr-4 text-center" style={{ color: 'var(--c-halogen)' }}>{dl}</td>
                    <td className="py-1.5 pr-4 text-center text-dim">{rs}</td>
                    <td className="py-1.5 text-dim text-[11px]">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Converting Fischer ↔ Wedge-Dash</h3>
        <ol className="font-sans text-sm text-secondary flex flex-col gap-2 list-decimal list-inside leading-relaxed">
          <li>Identify the vertical backbone carbons — they are the stereocenters.</li>
          <li>Each horizontal substituent becomes a wedge (toward viewer).</li>
          <li>Each vertical substituent (top/bottom neighbors in chain) becomes a dash (away from viewer).</li>
          <li>Draw the tetrahedral center with correct spatial arrangement.</li>
          <li>To convert back: place the highest-priority vertical group at top, redraw as Fischer.</li>
        </ol>
      </section>

    </div>
  )
}

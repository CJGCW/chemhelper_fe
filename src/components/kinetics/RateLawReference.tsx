export default function RateLawReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Rate Law Definition</h3>
        <div className="p-4 rounded-sm font-mono text-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p style={{ color: 'var(--c-halogen)' }}>rate = k[A]<sup>m</sup>[B]<sup>n</sup></p>
        </div>
        <div className="flex flex-col gap-2 font-sans text-sm text-secondary">
          <p><span className="font-mono text-primary">k</span> — rate constant (depends on temperature, not concentration)</p>
          <p><span className="font-mono text-primary">m, n</span> — reaction orders with respect to A and B (determined experimentally)</p>
          <p><span className="font-mono text-primary">overall order</span> = m + n + ...</p>
        </div>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Reaction orders are <strong className="text-primary">not</strong> the same as stoichiometric coefficients
          unless the reaction is an elementary step. They must be determined from experimental data.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Units of k</h3>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--color-border))' }}>
                <th className="text-left py-2 pr-6 font-semibold text-secondary">Overall Order</th>
                <th className="text-left py-2 pr-6 font-semibold text-secondary">Units of k</th>
                <th className="text-left py-2 font-semibold text-secondary">Example</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              {[
                { order: '0', unit: 'M·s⁻¹ (or mol/L·s)', ex: '[A]₀ const — surface reactions' },
                { order: '1', unit: 's⁻¹',                 ex: 'Radioactive decay, first-order' },
                { order: '2', unit: 'M⁻¹·s⁻¹ (L/mol·s)',  ex: '2NO₂ → 2NO + O₂' },
                { order: '3', unit: 'M⁻²·s⁻¹ (L²/mol²·s)', ex: '2NO + O₂ → 2NO₂' },
              ].map(row => (
                <tr key={row.order} style={{ borderBottom: '1px solid rgba(var(--overlay),0.06)' }}>
                  <td className="py-2 pr-6">{row.order}</td>
                  <td className="py-2 pr-6" style={{ color: 'var(--c-halogen)' }}>{row.unit}</td>
                  <td className="py-2 text-dim text-xs">{row.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Method of Initial Rates</h3>
        <ol className="font-sans text-sm text-secondary flex flex-col gap-2 pl-4 list-decimal">
          <li>Run reaction multiple times with different <em>initial</em> concentrations.</li>
          <li>Measure the initial rate in each trial.</li>
          <li>Compare trials where only <em>one</em> concentration changes to isolate each order.</li>
          <li>
            Compute order: <span className="font-mono text-primary">m = log(r₂/r₁) / log([A]₂/[A]₁)</span>
          </li>
          <li>Compute k from any trial once all orders are known.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">
          Worked Example — Chang 14e, Example 13.3
        </h3>
        <p className="font-sans text-sm text-secondary">
          Reaction: <span className="font-mono text-primary">2NO(g) + O₂(g) → 2NO₂(g)</span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--color-border))' }}>
                <th className="text-left py-2 pr-4 font-semibold text-secondary">Trial</th>
                <th className="text-left py-2 pr-4 font-semibold text-secondary">[NO] (M)</th>
                <th className="text-left py-2 pr-4 font-semibold text-secondary">[O₂] (M)</th>
                <th className="text-left py-2 font-semibold text-secondary">Rate (mol/L·s)</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              {[
                ['1', '0.0050', '0.0050', '3.0 × 10⁻⁵'],
                ['2', '0.010',  '0.0050', '1.2 × 10⁻⁴'],
                ['3', '0.0050', '0.010',  '6.0 × 10⁻⁵'],
              ].map(row => (
                <tr key={row[0]} style={{ borderBottom: '1px solid rgba(var(--overlay),0.06)' }}>
                  {row.map((cell, i) => (
                    <td key={i} className="py-2 pr-4" style={i === 3 ? { color: 'var(--c-halogen)' } : {}}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 font-mono text-sm text-secondary p-4 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-sans text-sm text-primary font-semibold">Step 1: Find order in NO (trials 1 & 2)</p>
          <p>r₂/r₁ = 1.2×10⁻⁴ / 3.0×10⁻⁵ = 4.0</p>
          <p>[NO]₂/[NO]₁ = 0.010/0.0050 = 2.0</p>
          <p>m = log(4.0)/log(2.0) = <span style={{ color: 'var(--c-halogen)' }}>2</span></p>

          <p className="font-sans text-sm text-primary font-semibold mt-2">Step 2: Find order in O₂ (trials 1 & 3)</p>
          <p>r₃/r₁ = 6.0×10⁻⁵ / 3.0×10⁻⁵ = 2.0</p>
          <p>[O₂]₃/[O₂]₁ = 0.010/0.0050 = 2.0</p>
          <p>n = log(2.0)/log(2.0) = <span style={{ color: 'var(--c-halogen)' }}>1</span></p>

          <p className="font-sans text-sm text-primary font-semibold mt-2">Step 3: Compute k (trial 1)</p>
          <p>rate = k[NO]²[O₂]</p>
          <p>k = 3.0×10⁻⁵ / (0.0050)² × (0.0050)</p>
          <p>k = <span style={{ color: 'var(--c-halogen)' }}>240 L²/(mol²·s)</span></p>
        </div>
      </section>

    </div>
  )
}

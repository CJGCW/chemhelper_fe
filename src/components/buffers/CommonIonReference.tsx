export default function CommonIonReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">The Common Ion Effect</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The common ion effect states that the solubility of a sparingly soluble salt is decreased
          when a soluble salt sharing a common ion is added to the solution. This is a consequence
          of Le Chatelier's Principle — adding a product shifts the equilibrium toward the solid.
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
          <p className="font-mono text-sm text-primary">AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)</p>
          <p className="font-sans text-sm text-secondary">
            Adding NaCl increases [Cl⁻]. By Le Chatelier's Principle, the equilibrium shifts left,
            so less AgCl dissolves — the solubility decreases.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">ICE Table with Common Ion</h3>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['', 'AgCl(s)', '⇌', 'Ag⁺', 'Cl⁻'].map((h, i) => (
                  <th key={i} className="py-2 px-3 text-left font-normal text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Initial',   '—', '', '0',     '0.10 M (from NaCl)'],
                ['Change',    '—', '', '+s',    '+s'],
                ['Equilib.', '—', '', 's',      '0.10 + s'],
              ].map(([row, ...cells]) => (
                <tr key={row as string} className="border-b border-border/50">
                  <td className="py-1.5 px-3 text-secondary text-xs">{row}</td>
                  {cells.map((c, i) => (
                    <td key={i} className="py-1.5 px-3" style={{ color: c === '' ? undefined : 'var(--c-halogen)' }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 rounded-sm border border-border bg-raised">
          <p className="font-mono text-sm text-primary">Ksp = [Ag⁺][Cl⁻] = s × (0.10 + s) ≈ 0.10s</p>
          <p className="font-mono text-sm mt-1" style={{ color: 'var(--c-halogen)' }}>
            s ≈ Ksp / 0.10 = 1.8×10⁻¹⁰ / 0.10 = 1.8×10⁻⁹ M
          </p>
          <p className="font-sans text-xs text-secondary mt-2">
            In pure water: s = √(1.8×10⁻¹⁰) ≈ 1.3×10⁻⁵ M — the common ion reduced solubility ~7000×.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Connection to Buffers</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The common ion effect also explains buffer action. In a buffer of acetic acid + sodium acetate,
          the acetate ion (CH₃COO⁻) is the "common ion" shared with the equilibrium:
        </p>
        <div className="p-3 rounded-sm border border-border bg-raised font-mono text-sm text-primary">
          CH₃COOH ⇌ H⁺ + CH₃COO⁻
        </div>
        <p className="font-sans text-sm text-secondary">
          The high [CH₃COO⁻] suppresses ionization of CH₃COOH, keeping [H⁺] low and the pH near pKa.
        </p>
      </section>
    </div>
  )
}

export default function PrecipitationReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Predicting Precipitation: Q vs Ksp</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The ion product Q (also called the reaction quotient for solubility) is calculated the same way as Ksp,
          but using the actual concentrations in the mixed solution — not the equilibrium concentrations.
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
          <p className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
            Q = [M⁺]ᵐ[A⁻]ⁿ  (using actual concentrations)
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Decision Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              condition: 'Q < Ksp',
              verdict: 'No precipitate',
              color: '#4ade80',
              explanation: 'Solution is unsaturated. More salt can dissolve.',
            },
            {
              condition: 'Q = Ksp',
              verdict: 'Saturated',
              color: '#facc15',
              explanation: 'Solution is exactly saturated. No net change.',
            },
            {
              condition: 'Q > Ksp',
              verdict: 'Precipitate forms',
              color: '#f87171',
              explanation: 'Solution is supersaturated. Salt precipitates until Q = Ksp.',
            },
          ].map(row => (
            <div
              key={row.condition}
              className="p-4 rounded-sm border flex flex-col gap-2"
              style={{
                borderColor: `color-mix(in srgb, ${row.color} 40%, rgb(var(--color-border)))`,
                background: `color-mix(in srgb, ${row.color} 6%, rgb(var(--color-surface)))`,
              }}
            >
              <p className="font-mono text-base font-semibold" style={{ color: row.color }}>{row.condition}</p>
              <p className="font-sans text-sm font-medium text-primary">{row.verdict}</p>
              <p className="font-sans text-xs text-secondary">{row.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Worked Example</h3>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-3">
          <p className="font-sans text-sm text-primary">
            Will BaSO₄ precipitate when 10.0 mL of 2.0×10⁻⁴ M BaCl₂ is mixed with 10.0 mL of
            2.0×10⁻⁴ M Na₂SO₄? (Ksp = 1.1×10⁻¹⁰)
          </p>
          <div className="flex flex-col gap-1.5 pl-3 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)' }}>
            {[
              'After mixing, total volume = 20.0 mL',
              '[Ba²⁺] = 2.0×10⁻⁴ × (10.0/20.0) = 1.0×10⁻⁴ M',
              '[SO₄²⁻] = 2.0×10⁻⁴ × (10.0/20.0) = 1.0×10⁻⁴ M',
              'Q = [Ba²⁺][SO₄²⁻] = (1.0×10⁻⁴)² = 1.0×10⁻⁸',
              'Q = 1.0×10⁻⁸ > Ksp = 1.1×10⁻¹⁰',
            ].map((step, i) => (
              <p key={i} className="font-mono text-sm text-primary">{step}</p>
            ))}
          </div>
          <p className="font-mono text-sm font-semibold" style={{ color: '#f87171' }}>
            {'∴ Q > Ksp → BaSO₄ precipitates'}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Selective Precipitation</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          By carefully controlling ion concentrations, it is possible to selectively precipitate one ion
          from a mixture while leaving another in solution. This technique is used in qualitative analysis
          to separate metal ions. The ion with the smaller Ksp precipitates first.
        </p>
      </section>
    </div>
  )
}

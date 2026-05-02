export default function HalfLifeReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Half-Life (t½)</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The half-life is the time required for the concentration of a reactant to decrease
          to half its initial value.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Half-Life Formulas by Order</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              order: '0th order',
              formula: 't½ = [A]₀ / (2k)',
              note: 'Half-life depends on initial concentration — decreases as reaction proceeds.',
            },
            {
              order: '1st order',
              formula: 't½ = ln(2) / k = 0.693 / k',
              note: 'Half-life is CONSTANT — independent of [A]₀. This is the hallmark of first-order kinetics.',
            },
            {
              order: '2nd order',
              formula: 't½ = 1 / (k[A]₀)',
              note: 'Half-life depends on initial concentration — increases as reaction proceeds.',
            },
          ].map(row => (
            <div key={row.order} className="p-4 rounded-sm flex flex-col gap-2"
              style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-sans text-sm font-semibold text-primary">{row.order}</p>
              <p className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{row.formula}</p>
              <p className="font-sans text-xs text-secondary">{row.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">First-Order: Constant Half-Life</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For first-order reactions, every half-life reduces the concentration by exactly 50%,
          regardless of the starting amount. After n half-lives:
        </p>
        <div className="p-4 rounded-sm font-mono text-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p style={{ color: 'var(--c-halogen)' }}>[A] = [A]₀ × (1/2)<sup>n</sup></p>
        </div>
        <p className="font-sans text-sm text-secondary">
          This is why radioactive decay (always 1st order) is described solely by its half-life —
          the half-life is constant and characteristic of each isotope.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Worked Example</h3>
        <p className="font-sans text-sm text-secondary">
          N₂O₅ decomposes (1st order) with k = 5.1 × 10⁻⁴ s⁻¹. Find t½ and [N₂O₅] after 3 half-lives.
        </p>
        <div className="flex flex-col gap-2 font-mono text-sm text-secondary p-4 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          <p>t½ = ln(2) / k = 0.6931 / 5.1×10⁻⁴ = <span style={{ color: 'var(--c-halogen)' }}>1360 s</span></p>
          <p className="mt-2">After 3 half-lives:</p>
          <p>[A] = [A]₀ × (1/2)³ = [A]₀ / 8</p>
          <p>If [A]₀ = 0.0200 M, [A] = 0.0200/8 = <span style={{ color: 'var(--c-halogen)' }}>0.0025 M</span></p>
        </div>
      </section>

    </div>
  )
}

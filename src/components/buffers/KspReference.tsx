import { KSP_TABLE } from '../../data/kspValues'

function fmt(n: number): string {
  return n.toExponential(2)
}

export default function KspReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Solubility Product (Ksp)</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For a sparingly soluble ionic compound MₘAₙ dissolving in water:
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised">
          <p className="font-mono text-base text-center" style={{ color: 'var(--c-halogen)' }}>
            MₘAₙ(s) ⇌ m M⁺(aq) + n A⁻(aq)
          </p>
          <p className="font-mono text-base text-center mt-2" style={{ color: 'var(--c-halogen)' }}>
            Ksp = [M⁺]ᵐ [A⁻]ⁿ
          </p>
        </div>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Ksp depends only on temperature, not on the amount of undissolved solid. A larger Ksp means greater solubility.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Molar Solubility Derivation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: '1:1 salt (e.g., AgCl)',
              eq: 'Ksp = s²',
              sol: 's = √Ksp',
            },
            {
              label: '1:2 or 2:1 salt (e.g., CaF₂)',
              eq: 'Ksp = (s)(2s)² = 4s³',
              sol: 's = (Ksp/4)^(1/3)',
            },
            {
              label: '1:3 or 3:1 salt (e.g., Fe(OH)₃)',
              eq: 'Ksp = (s)(3s)³ = 27s⁴',
              sol: 's = (Ksp/27)^(1/4)',
            },
          ].map(row => (
            <div key={row.label} className="p-3 rounded-sm border border-border bg-raised flex flex-col gap-1">
              <p className="font-sans text-xs text-secondary">{row.label}</p>
              <p className="font-mono text-xs text-primary">{row.eq}</p>
              <p className="font-mono text-xs font-semibold" style={{ color: 'var(--c-halogen)' }}>{row.sol}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Ksp Table (Chang 14e, Appendix)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 font-mono text-xs text-secondary font-normal">Salt</th>
                <th className="text-left py-2 pr-3 font-mono text-xs text-secondary font-normal">Name</th>
                <th className="text-left py-2 pr-3 font-mono text-xs text-secondary font-normal">Ksp (25°C)</th>
                <th className="text-left py-2 font-mono text-xs text-secondary font-normal">Dissociation</th>
              </tr>
            </thead>
            <tbody>
              {KSP_TABLE.map(entry => {
                const m = entry.cation.count
                const n = entry.anion.count
                const diss = `${m > 1 ? m : ''}${entry.cation.formula} + ${n > 1 ? n : ''}${entry.anion.formula}`
                return (
                  <tr key={entry.formula} className="border-b border-border/50">
                    <td className="py-1.5 pr-3 font-mono text-xs text-primary">{entry.formula}</td>
                    <td className="py-1.5 pr-3 font-sans text-xs text-secondary">{entry.name}</td>
                    <td className="py-1.5 pr-3 font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{fmt(entry.Ksp)}</td>
                    <td className="py-1.5 font-mono text-xs text-dim">{diss}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-xs text-dim">Values from Chang's Chemistry 14e, Appendix 4.</p>
      </section>
    </div>
  )
}

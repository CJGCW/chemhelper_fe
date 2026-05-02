import { HYDROCARBON_FAMILIES, IUPAC_PREFIXES } from '../../data/functionalGroups'

export default function HydrocarbonReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Hydrocarbon Families</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Hydrocarbons contain only carbon and hydrogen. The three main families differ by degree of saturation
          (number of multiple bonds). The general formula determines how many hydrogens correspond to a given number of carbons.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary uppercase tracking-wider">Family</th>
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary uppercase tracking-wider">General Formula</th>
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary uppercase tracking-wider">Bond Type</th>
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary uppercase tracking-wider">Hybridization</th>
                <th className="text-left py-2 font-mono text-xs text-secondary uppercase tracking-wider">DoU</th>
              </tr>
            </thead>
            <tbody>
              {HYDROCARBON_FAMILIES.map(f => (
                <tr key={f.id} className="border-b border-border/40">
                  <td className="py-2.5 pr-4 text-primary font-medium capitalize">{f.name}</td>
                  <td className="py-2.5 pr-4 font-mono text-bright">{f.generalFormula}</td>
                  <td className="py-2.5 pr-4 text-secondary">{f.bondType}</td>
                  <td className="py-2.5 pr-4 font-mono text-secondary">{f.hybridization}</td>
                  <td className="py-2.5 font-mono text-secondary">
                    {f.id === 'alkane' ? '0' : f.id === 'alkene' ? '1' : '2'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {HYDROCARBON_FAMILIES.map(family => (
        <section key={family.id} className="flex flex-col gap-3">
          <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">{family.name} — {family.generalFormula}</h3>
          <div className="flex flex-col gap-1 p-4 rounded-sm border border-border bg-surface">
            <p className="font-sans text-sm text-secondary mb-2"><strong className="text-primary">Bond type:</strong> {family.bondType}</p>
            <p className="font-sans text-sm text-secondary mb-3"><strong className="text-primary">Hybridization:</strong> {family.hybridization}</p>
            <div className="overflow-x-auto">
              <table className="font-sans text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 pr-6 font-mono text-xs text-secondary uppercase">n</th>
                    <th className="text-left py-1.5 pr-6 font-mono text-xs text-secondary uppercase">Name</th>
                    <th className="text-left py-1.5 font-mono text-xs text-secondary uppercase">Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {family.examples.map(ex => (
                    <tr key={ex.name} className="border-b border-border/30">
                      <td className="py-1.5 pr-6 font-mono text-dim text-xs">{ex.n}</td>
                      <td className="py-1.5 pr-6 text-primary">{ex.name}</td>
                      <td className="py-1.5 font-mono text-bright">{ex.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">IUPAC Prefix Table (1–10 Carbons)</h3>
        <div className="overflow-x-auto">
          <table className="font-sans text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">n (carbons)</th>
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">Prefix</th>
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">Alkane name</th>
                <th className="text-left py-2 font-mono text-xs text-secondary uppercase">Memory hook</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(IUPAC_PREFIXES).map(([n, prefix]) => {
                const hooks: Record<string, string> = {
                  meth: 'methane gas (natural gas)',
                  eth: 'ethanol (drinking alcohol)',
                  prop: 'propane (BBQ gas)',
                  but: 'butter (butyric acid)',
                  pent: 'pentagon (5 sides)',
                  hex: 'hexagon (6 sides)',
                  hept: 'September (sept = 7 in Latin)',
                  oct: 'octopus (8 arms)',
                  non: 'nine lives (cat)',
                  dec: 'decade (10 years)',
                }
                return (
                  <tr key={n} className="border-b border-border/30">
                    <td className="py-1.5 pr-6 font-mono text-bright">{n}</td>
                    <td className="py-1.5 pr-6 font-mono text-primary font-medium">{prefix}-</td>
                    <td className="py-1.5 pr-6 text-secondary">{prefix}ane</td>
                    <td className="py-1.5 font-sans text-xs text-dim italic">{hooks[prefix]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Formula Rules</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Alkane (CₙH₂ₙ₊₂)', ex: 'n=4: C₄H₂(4)+₂ = C₄H₁₀ (butane)', color: 'emerald' },
            { label: 'Alkene (CₙH₂ₙ)',    ex: 'n=4: C₄H₂(4) = C₄H₈ (1-butene)',  color: 'sky'     },
            { label: 'Alkyne (CₙH₂ₙ₋₂)',  ex: 'n=4: C₄H₂(4)-₂ = C₄H₆ (1-butyne)', color: 'violet' },
          ].map(row => (
            <div key={row.label} className="flex flex-col gap-1 p-3 rounded-sm border border-border bg-surface">
              <span className="font-mono text-sm font-semibold text-primary">{row.label}</span>
              <span className="font-sans text-xs text-secondary">Example: {row.ex}</span>
            </div>
          ))}
        </div>
        <p className="font-sans text-xs text-dim leading-relaxed">
          Each step from alkane to alkene to alkyne removes 2 hydrogens (one degree of unsaturation per step).
          Degree of Unsaturation (DoU) = (2C + 2 − H) / 2 for pure hydrocarbons.
        </p>
      </section>

    </div>
  )
}

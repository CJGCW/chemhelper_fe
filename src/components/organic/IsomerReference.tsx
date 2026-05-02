export default function IsomerReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">What Are Isomers?</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Isomers are compounds with the <strong className="text-primary">same molecular formula</strong> but{' '}
          <strong className="text-primary">different structures or spatial arrangements</strong>. Because they have different
          connectivity or geometry, they are distinct compounds with different physical and chemical properties.
        </p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The molecular formula alone does not uniquely identify a compound — C₄H₁₀ could be butane or isobutane,
          and both are real, different substances.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Types of Isomers</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              title: 'Constitutional (Structural) Isomers',
              subtitle: 'Same formula, different connectivity',
              description: 'Atoms are bonded in a different order. This includes differences in carbon chain branching, position of a double bond, or position of a functional group.',
              examples: [
                { name: 'butane', formula: 'CH₃CH₂CH₂CH₃', note: 'straight chain' },
                { name: 'isobutane (2-methylpropane)', formula: '(CH₃)₃CH', note: 'branched' },
              ],
              formula: 'Both: C₄H₁₀',
            },
            {
              title: 'Geometric (cis/trans) Isomers',
              subtitle: 'Same formula, same connectivity, different spatial arrangement around a double bond',
              description: 'Occur when rotation around a C=C bond is restricted. Groups on the same side of the double bond are cis; groups on opposite sides are trans.',
              examples: [
                { name: 'cis-2-butene', formula: 'CH₃ groups on same side', note: 'bp = 3.7 °C' },
                { name: 'trans-2-butene', formula: 'CH₃ groups on opposite sides', note: 'bp = 0.9 °C' },
              ],
              formula: 'Both: C₄H₈',
            },
            {
              title: 'Chain Isomers',
              subtitle: 'Variation in the carbon skeleton (straight vs branched)',
              description: 'A specific type of structural isomer where the carbon chain arrangement differs — pentane, isopentane, and neopentane all have formula C₅H₁₂.',
              examples: [
                { name: 'pentane', formula: 'CH₃(CH₂)₃CH₃', note: 'bp = 36.1 °C' },
                { name: 'isopentane (2-methylbutane)', formula: '(CH₃)₂CHCH₂CH₃', note: 'bp = 27.7 °C' },
                { name: 'neopentane (2,2-dimethylpropane)', formula: 'C(CH₃)₄', note: 'bp = 9.5 °C' },
              ],
              formula: 'All: C₅H₁₂',
            },
          ].map(section => (
            <div key={section.title} className="flex flex-col gap-3 p-4 rounded-sm border border-border bg-surface">
              <div>
                <h4 className="font-sans text-sm font-semibold text-primary">{section.title}</h4>
                <p className="font-mono text-xs text-secondary mt-0.5">{section.subtitle}</p>
              </div>
              <p className="font-sans text-sm text-secondary leading-relaxed">{section.description}</p>
              <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
                <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">{section.formula}</p>
                {section.examples.map(ex => (
                  <div key={ex.name} className="flex gap-3 items-baseline">
                    <span className="font-sans text-sm text-primary shrink-0">{ex.name}:</span>
                    <span className="font-mono text-xs text-secondary">{ex.formula}</span>
                    <span className="font-sans text-xs text-dim italic">({ex.note})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Counting Structural Isomers (Alkanes)</h3>
        <div className="overflow-x-auto">
          <table className="font-sans text-sm border-collapse w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">Formula</th>
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">n</th>
                <th className="text-left py-2 font-mono text-xs text-secondary uppercase">Number of structural isomers</th>
              </tr>
            </thead>
            <tbody>
              {[
                { formula: 'CH₄',   n: 1, count: 1 },
                { formula: 'C₂H₆',  n: 2, count: 1 },
                { formula: 'C₃H₈',  n: 3, count: 1 },
                { formula: 'C₄H₁₀', n: 4, count: 2 },
                { formula: 'C₅H₁₂', n: 5, count: 3 },
                { formula: 'C₆H₁₄', n: 6, count: 5 },
                { formula: 'C₇H₁₆', n: 7, count: 9 },
              ].map(row => (
                <tr key={row.formula} className="border-b border-border/30">
                  <td className="py-2 pr-6 font-mono text-bright">{row.formula}</td>
                  <td className="py-2 pr-6 font-mono text-secondary">{row.n}</td>
                  <td className="py-2 text-primary font-medium">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim leading-relaxed">
          The number of structural isomers grows rapidly with chain length. C₈H₁₈ has 18 isomers; C₁₀H₂₂ has 75.
        </p>
      </section>

    </div>
  )
}

export default function ReactionProfileReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction Energy Profiles</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A reaction energy profile (energy diagram) plots potential energy vs. reaction progress.
          It shows how energy changes from reactants through a transition state to products, and
          makes activation energy and enthalpy change easy to read.
        </p>
      </div>

      {/* Key quantities */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Quantities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              symbol: 'Eₐ (forward)',
              def: 'Energy gap from reactants to transition state.',
              note: 'Always positive. Determines reaction rate.',
              color: '#f87171',
            },
            {
              symbol: 'Eₐ (reverse)',
              def: 'Energy gap from products to transition state.',
              note: 'Eₐ(rev) = Eₐ(fwd) − ΔH',
              color: '#fb923c',
            },
            {
              symbol: 'ΔH (reaction)',
              def: 'Energy of products minus energy of reactants.',
              note: 'Exothermic: ΔH < 0 (products lower). Endothermic: ΔH > 0.',
              color: '#4ade80',
            },
            {
              symbol: 'Transition state',
              def: 'Peak of the energy profile — highest energy point.',
              note: 'Unstable species; not an intermediate.',
              color: 'var(--c-halogen)',
            },
          ].map(q => (
            <div key={q.symbol} className="flex flex-col gap-2 p-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}>
              <span className="font-mono text-sm font-bold" style={{ color: q.color }}>{q.symbol}</span>
              <p className="font-sans text-xs text-secondary leading-relaxed">{q.def}</p>
              <p className="font-sans text-xs text-dim italic">{q.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship table */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Relationships</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-sm text-primary">Eₐ(rev) = Eₐ(fwd) − ΔH</p>
          <p className="font-mono text-xs text-secondary mt-1">For an exothermic reaction (ΔH &lt; 0): Eₐ(rev) &gt; Eₐ(fwd)</p>
          <p className="font-mono text-xs text-secondary">For an endothermic reaction (ΔH &gt; 0): Eₐ(rev) &lt; Eₐ(fwd)</p>
        </div>
      </div>

      {/* Catalyst effect */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Catalysts</p>
        <div className="flex flex-col gap-2 p-3 rounded-sm border border-border"
          style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-sans text-sm text-primary">A catalyst lowers the activation energy for <em>both</em> the forward and reverse reactions.</p>
          <div className="flex flex-col gap-1 mt-1">
            <p className="font-sans text-xs text-secondary">✓ Increases rate of reaction</p>
            <p className="font-sans text-xs text-secondary">✓ Not consumed overall</p>
            <p className="font-sans text-xs text-secondary">✗ Does NOT change ΔH or the equilibrium constant</p>
            <p className="font-sans text-xs text-secondary">✗ Does NOT change the energies of reactants or products</p>
          </div>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-primary">
            A reaction has Eₐ(fwd) = 45 kJ/mol and ΔH = −28 kJ/mol. Find Eₐ(rev).
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">Eₐ(rev) = Eₐ(fwd) − ΔH</p>
            <p className="font-mono text-xs text-secondary">Eₐ(rev) = 45 − (−28) = 45 + 28</p>
            <p className="font-mono text-xs text-primary font-semibold">Eₐ(rev) = 73 kJ/mol</p>
          </div>
          <p className="font-sans text-xs text-dim mt-1">
            The reverse reaction has a larger activation energy because products are lower in energy than reactants (exothermic).
          </p>
        </div>
      </div>

    </div>
  )
}

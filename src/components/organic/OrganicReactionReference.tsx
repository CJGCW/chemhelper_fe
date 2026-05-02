export default function OrganicReactionReference() {
  const reactions = [
    {
      name: 'Combustion',
      equation: 'CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → n CO₂ + (n+1) H₂O',
      example: 'C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O',
      exampleLabel: 'Propane combustion',
      condition: 'Excess O₂, heat',
      notes: 'All hydrocarbons combust to give CO₂ and H₂O (complete combustion). Incomplete combustion yields CO or C (soot).',
    },
    {
      name: 'Halogenation (Substitution)',
      equation: 'R–H + X₂ → R–X + HX',
      example: 'CH₄ + Cl₂ → CH₃Cl + HCl',
      exampleLabel: 'Chlorination of methane',
      condition: 'UV light or heat; alkanes',
      notes: 'A halogen atom replaces a hydrogen. Mechanism is radical chain (initiation → propagation → termination). Alkane halogenation is substitution.',
    },
    {
      name: 'Halogenation (Addition)',
      equation: 'C=C + X₂ → X–C–C–X',
      example: 'CH₂=CH₂ + Br₂ → CH₂Br–CH₂Br',
      exampleLabel: 'Bromination of ethene',
      condition: 'Room temperature, non-polar solvent; alkenes',
      notes: 'Halogens add across the double bond. Alkene halogenation is addition. Bromine decolorization is a test for C=C.',
    },
    {
      name: 'Hydrogenation',
      equation: 'C=C + H₂ → C–C (alkane)',
      example: 'CH₂=CH₂ + H₂ → CH₃–CH₃',
      exampleLabel: 'Ethene → ethane',
      condition: 'Pt, Pd, or Ni catalyst; heat',
      notes: 'Adds H₂ across a double or triple bond. Industrial use: hardening vegetable oils (converting unsaturated to saturated fats).',
    },
    {
      name: 'Hydration',
      equation: 'C=C + H₂O → C–OH (alcohol)',
      example: 'CH₂=CH₂ + H₂O → CH₃CH₂OH',
      exampleLabel: 'Ethene → ethanol',
      condition: 'H⁺ (acid) catalyst, heat',
      notes: 'Water adds across the double bond following Markovnikov\'s rule: OH attaches to the more substituted carbon. Reverse of dehydration.',
    },
    {
      name: 'Esterification (Condensation)',
      equation: 'RCOOH + R\'OH ⇌ RCOOR\' + H₂O',
      example: 'CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O',
      exampleLabel: 'Acetic acid + ethanol → ethyl acetate',
      condition: 'H⁺ catalyst, heat; reversible (Fischer esterification)',
      notes: 'A carboxylic acid reacts with an alcohol to form an ester and water. Esters often have fruity aromas. Reaction is driven forward by removing H₂O.',
    },
    {
      name: 'Elimination (Dehydration)',
      equation: 'R–CH₂–CHOH–R\' → R–CH=CH–R\' + H₂O',
      example: 'CH₃CH₂OH → CH₂=CH₂ + H₂O',
      exampleLabel: 'Ethanol → ethene (dehydration)',
      condition: 'Conc. H₂SO₄, high temperature (170°C)',
      notes: 'H and OH are removed from adjacent carbons to form a double bond. Reverse of hydration. Lower temperature (140°C) favors ether formation instead.',
    },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Common Organic Reaction Types</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Organic reactions are classified by the type of bond change that occurs. The four main categories
          encountered in Gen Chem are: <strong>addition</strong>, <strong>substitution</strong>,
          <strong>elimination</strong>, and <strong>condensation</strong>. Combustion is a special case of oxidation.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {reactions.map((rxn, i) => (
          <div key={rxn.name} className="flex flex-col gap-0 rounded-sm border border-border overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ background: 'rgb(var(--color-raised))' }}>
              <span className="font-sans font-semibold text-primary">{rxn.name}</span>
              <span className="font-mono text-xs text-secondary px-2 py-0.5 rounded"
                style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
                {rxn.condition}
              </span>
            </div>

            <div className="px-4 py-3 border-t border-border"
              style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
              <p className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{rxn.equation}</p>
            </div>

            <div className="px-4 py-3 border-t border-border flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary">{rxn.exampleLabel}</span>
              <p className="font-mono text-sm text-primary">{rxn.example}</p>
            </div>

            <div className="px-4 py-3 border-t border-border bg-surface">
              <p className="font-sans text-sm text-secondary leading-relaxed">{rxn.notes}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Quick Reference</h3>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-raised))' }}>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Reaction Type</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">What happens</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Typical substrate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Addition', what: 'Atoms join across a double/triple bond', sub: 'Alkenes, alkynes' },
                { type: 'Substitution', what: 'One atom replaces another', sub: 'Alkanes (radical), haloalkanes (nucleophilic)' },
                { type: 'Elimination', what: 'Atoms removed → π bond formed', sub: 'Alcohols, haloalkanes' },
                { type: 'Condensation', what: 'Two molecules join, small molecule leaves', sub: 'Carboxylic acids + alcohols → esters' },
                { type: 'Combustion', what: 'Oxidation by O₂ → CO₂ + H₂O', sub: 'Any hydrocarbon' },
              ].map((row, i) => (
                <tr key={row.type} style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
                  <td className="px-4 py-2 font-sans font-semibold text-primary">{row.type}</td>
                  <td className="px-4 py-2 font-sans text-secondary text-sm">{row.what}</td>
                  <td className="px-4 py-2 font-mono text-xs text-dim">{row.sub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-mono text-xs text-secondary">
        Reaction types from Chang's Chemistry, 14e, Chapter 24.
      </p>
    </div>
  )
}

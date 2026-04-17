export default function EmpiricalReference() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Key formulas */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] text-dim tracking-widest uppercase">Formulas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Empirical Formula',  formula: 'EF = simplest whole-number ratio',   note: 'Divide all subscripts by their GCF' },
            { label: 'Molecular Formula',  formula: 'MF = n × EF',                         note: 'n = M_molecular / M_empirical' },
            { label: 'Moles from mass',    formula: 'n = m / M',                           note: 'm in g, M in g/mol' },
            { label: 'Percent to mass',    formula: 'Assume 100 g  →  % = g',              note: 'Starting point for % comp. problems' },
          ].map(({ label, formula, note }) => (
            <div key={label} className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <p className="font-sans text-xs font-semibold text-secondary uppercase tracking-wide">{label}</p>
              <p className="font-mono text-sm text-bright">{formula}</p>
              <p className="font-sans text-xs text-dim">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-step method */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] text-dim tracking-widest uppercase">Method — % Composition → Empirical Formula</p>
        <div className="flex flex-col gap-2">
          {[
            { n: '1', title: 'Convert % to grams',   body: 'Assume a 100 g sample. Each element\'s % becomes its mass in grams directly.' },
            { n: '2', title: 'Convert mass to moles', body: 'Divide each element\'s mass by its molar mass (from the periodic table).' },
            { n: '3', title: 'Find the mole ratio',   body: 'Divide all mole values by the smallest mole value to get a ratio.' },
            { n: '4', title: 'Round to integers',     body: 'If the ratio is within ±0.1 of an integer, round. Otherwise multiply all by 2, 3, etc. until all are integers (common multipliers: ×2 for .5, ×3 for .33, ×4 for .25).' },
            { n: '5', title: 'Write the formula',     body: 'Use the whole-number ratios as subscripts in the empirical formula.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex gap-3 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <span className="font-mono text-sm font-bold shrink-0 mt-0.5" style={{ color: 'var(--c-halogen)' }}>{n}</span>
              <div className="flex flex-col gap-0.5">
                <p className="font-sans text-sm font-medium text-primary">{title}</p>
                <p className="font-sans text-xs text-secondary leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] text-dim tracking-widest uppercase">Example</p>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <p className="font-sans text-sm text-secondary">A compound is 40.0% C, 6.7% H, 53.3% O. Find the empirical formula.</p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-primary">Assume 100 g → 40.0 g C, 6.7 g H, 53.3 g O</p>
            <p className="font-mono text-xs text-primary">n(C) = 40.0 / 12.01 = 3.33 mol</p>
            <p className="font-mono text-xs text-primary">n(H) = 6.7 / 1.008 = 6.65 mol</p>
            <p className="font-mono text-xs text-primary">n(O) = 53.3 / 16.00 = 3.33 mol</p>
            <p className="font-mono text-xs text-primary">Divide by smallest (3.33):  C:1  H:2  O:1</p>
            <p className="font-mono text-sm font-semibold mt-1" style={{ color: 'var(--c-halogen)' }}>Empirical formula: CH₂O</p>
          </div>
        </div>
      </div>

      {/* Molecular formula note */}
      <div className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <p className="font-sans text-xs font-semibold text-secondary uppercase tracking-wide">Finding the Molecular Formula</p>
        <p className="font-sans text-sm text-primary leading-relaxed">
          If the molar mass of the compound is known, divide it by the empirical formula mass to get n, then multiply each subscript by n.
        </p>
        <p className="font-mono text-xs text-secondary mt-1">
          CH₂O has M = 30.03 g/mol. If M_compound = 180.2 g/mol → n = 180.2 / 30.03 = 6 → <span style={{ color: 'var(--c-halogen)' }}>C₆H₁₂O₆</span>
        </p>
      </div>

    </div>
  )
}

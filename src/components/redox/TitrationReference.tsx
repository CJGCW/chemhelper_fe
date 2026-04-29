export default function TitrationReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Titration</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A titration is a volumetric technique where a solution of known concentration (titrant) is
          added to an unknown solution until the reaction is complete. The equivalence point is reached
          when stoichiometric amounts of reactants have been combined — moles of titrant exactly equal
          (or are stoichiometrically equivalent to) moles of analyte.
        </p>
      </div>

      {/* Core relationships */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Relationships</p>
        <div className="flex flex-col gap-3">
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">moles = M × V(L)</p>
            <p className="font-mono text-xs text-secondary mt-1">
              Molarity × volume in liters gives moles. Convert mL → L by dividing by 1000.
            </p>
          </div>
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">At equivalence: mol H⁺ = mol OH⁻  (1:1 acid-base)</p>
            <p className="font-mono text-xs text-secondary mt-1">
              M₁V₁ = M₂V₂ only when the stoichiometric ratio is 1:1. For H₂SO₄ + NaOH (1:2 ratio), use
              mol H⁺ = 2 × mol H₂SO₄ and set equal to mol OH⁻.
            </p>
          </div>
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">Redox: mol e⁻ transferred (oxidizer) = mol e⁻ transferred (reducer)</p>
            <p className="font-mono text-xs text-secondary mt-1">
              Balance using half-reactions. E.g. MnO₄⁻ gains 5e⁻ per Mn; Fe²⁺ loses 1e⁻. So 1 mol MnO₄⁻ ≡ 5 mol Fe²⁺.
            </p>
          </div>
        </div>
      </div>

      {/* Stoichiometric correction */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Stoichiometric Correction Factor</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'HCl + NaOH', ratio: '1:1', note: 'M₁V₁ = M₂V₂ directly' },
            { label: 'H₂SO₄ + 2 NaOH', ratio: '1:2', note: 'M(acid) × V(acid) × 2 = M(base) × V(base)' },
            { label: 'H₃PO₄ + 3 NaOH', ratio: '1:3', note: 'M(acid) × V(acid) × 3 = M(base) × V(base)' },
            { label: 'MnO₄⁻ + Fe²⁺', ratio: '1:5 (e⁻)', note: '5 × mol MnO₄⁻ = mol Fe²⁺' },
          ].map(r => (
            <div key={r.label} className="flex flex-col gap-1 p-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}>
              <p className="font-mono text-xs font-semibold text-primary">{r.label}</p>
              <p className="font-mono text-xs text-secondary">Ratio: {r.ratio}</p>
              <p className="font-mono text-xs text-dim mt-1">{r.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Indicator Selection</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                {['Indicator', 'pH range', 'Color change', 'Best for'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Methyl orange',   range: '3.1–4.4', colors: 'Red → orange', use: 'Strong acid + strong/weak base' },
                { name: 'Methyl red',      range: '4.4–6.2', colors: 'Red → yellow', use: 'Weak acid + strong base' },
                { name: 'Litmus',          range: '6.0–7.5', colors: 'Red → blue',   use: 'Approximate; rarely used' },
                { name: 'Phenolphthalein', range: '8.3–10.0', colors: 'Colorless → pink', use: 'Strong or weak acid + strong base (most common)' },
              ].map(r => (
                <tr key={r.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-primary font-semibold">{r.name}</td>
                  <td className="px-4 py-2 text-secondary">{r.range}</td>
                  <td className="px-4 py-2 text-secondary">{r.colors}</td>
                  <td className="px-4 py-2 text-dim">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim">Choose an indicator whose color-change range brackets the equivalence point pH.</p>
      </div>

      {/* Worked example — HCl + NaOH */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — HCl + NaOH</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            25.00 mL of HCl(aq) is titrated with 0.1050 M NaOH. The equivalence point is reached after
            31.25 mL of NaOH is added. Find the molarity of HCl.
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">Reaction: HCl + NaOH → NaCl + H₂O  (1:1)</p>
            <p className="font-mono text-xs text-secondary">mol NaOH = 0.1050 mol/L × 0.03125 L = 3.281 × 10⁻³ mol</p>
            <p className="font-mono text-xs text-secondary">mol HCl = mol NaOH = 3.281 × 10⁻³ mol</p>
            <p className="font-mono text-xs text-secondary">M(HCl) = 3.281 × 10⁻³ mol ÷ 0.02500 L</p>
            <p className="font-mono text-xs text-primary font-semibold">M(HCl) = 0.1313 M</p>
          </div>
        </div>
      </div>

      {/* Worked example — H₂SO₄ + NaOH */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — H₂SO₄ + NaOH (Diprotic)</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            How many mL of 0.500 M NaOH are needed to neutralize 20.0 mL of 0.200 M H₂SO₄?
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">Reaction: H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O</p>
            <p className="font-mono text-xs text-secondary">mol H₂SO₄ = 0.200 M × 0.0200 L = 4.00 × 10⁻³ mol</p>
            <p className="font-mono text-xs text-secondary">mol NaOH = 2 × 4.00 × 10⁻³ = 8.00 × 10⁻³ mol</p>
            <p className="font-mono text-xs text-secondary">V(NaOH) = 8.00 × 10⁻³ mol ÷ 0.500 mol/L</p>
            <p className="font-mono text-xs text-primary font-semibold">V(NaOH) = 0.0160 L = 16.0 mL</p>
          </div>
        </div>
      </div>

    </div>
  )
}

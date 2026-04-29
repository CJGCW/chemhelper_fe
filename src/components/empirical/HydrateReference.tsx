const COMMON_HYDRATES = [
  { formula: 'CuSO₄·5H₂O',  name: 'Copper(II) sulfate pentahydrate', color: 'Blue; anhydrous form is white' },
  { formula: 'Na₂SO₄·10H₂O', name: 'Sodium sulfate decahydrate (Glauber\'s salt)', color: 'Colorless' },
  { formula: 'MgSO₄·7H₂O',  name: 'Magnesium sulfate heptahydrate (Epsom salt)', color: 'Colorless' },
  { formula: 'CaCl₂·2H₂O',  name: 'Calcium chloride dihydrate',     color: 'White' },
  { formula: 'CaCO₃·6H₂O',  name: 'Calcium carbonate hexahydrate',  color: 'Colorless' },
  { formula: 'Na₂CO₃·10H₂O', name: 'Washing soda (soda ash)',       color: 'Colorless' },
  { formula: 'FeSO₄·7H₂O',  name: 'Iron(II) sulfate heptahydrate', color: 'Blue-green' },
  { formula: 'CaSO₄·2H₂O',  name: 'Gypsum',                        color: 'Colorless' },
]

export default function HydrateReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Hydrates</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A hydrate is an ionic compound that contains a definite number of water molecules in its crystal lattice.
          The water molecules are held by intermolecular forces and are released when the compound is heated.
          Notation: formula · nH₂O, where n is the number of water molecules per formula unit.
        </p>
      </div>

      {/* Two methods */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Determining the Formula</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <p className="font-sans text-xs font-semibold text-primary">Method 1: Mass-Loss</p>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs text-secondary">1. Weigh hydrate (m₁)</p>
              <p className="font-mono text-xs text-secondary">2. Heat until constant mass (m₂)</p>
              <p className="font-mono text-xs text-secondary">3. m(H₂O) = m₁ − m₂</p>
              <p className="font-mono text-xs text-secondary">4. mol(salt) = m₂ ÷ M(salt)</p>
              <p className="font-mono text-xs text-secondary">5. mol(H₂O) = m(H₂O) ÷ 18.02</p>
              <p className="font-mono text-xs text-secondary">6. n = mol(H₂O) ÷ mol(salt)</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <p className="font-sans text-xs font-semibold text-primary">Method 2: % Composition</p>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs text-secondary">1. Given % H₂O in hydrate</p>
              <p className="font-mono text-xs text-secondary">2. Assume 100 g sample</p>
              <p className="font-mono text-xs text-secondary">3. mol(H₂O) = (%H₂O) ÷ 18.02</p>
              <p className="font-mono text-xs text-secondary">4. mol(salt) = (100 − %H₂O) ÷ M(salt)</p>
              <p className="font-mono text-xs text-secondary">5. n = mol(H₂O) ÷ mol(salt)</p>
              <p className="font-mono text-xs text-secondary">6. Round n to nearest integer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example (Mass-Loss)</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-primary">
            A 5.00 g sample of CuSO₄·nH₂O loses 1.80 g when heated. Find n.
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">m(CuSO₄) = 5.00 − 1.80 = 3.20 g</p>
            <p className="font-mono text-xs text-secondary">mol(CuSO₄) = 3.20 ÷ 159.62 = 0.02005 mol</p>
            <p className="font-mono text-xs text-secondary">mol(H₂O)  = 1.80 ÷ 18.02 = 0.09989 mol</p>
            <p className="font-mono text-xs text-secondary">n = 0.09989 ÷ 0.02005 ≈ 4.98 ≈ 5</p>
            <p className="font-mono text-xs text-primary font-semibold">Formula: CuSO₄·5H₂O</p>
          </div>
        </div>
      </div>

      {/* Common hydrates */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Common Hydrates</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                {['Formula', 'Name', 'Notes'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMMON_HYDRATES.map(r => (
                <tr key={r.formula} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-semibold" style={{ color: 'var(--c-halogen)' }}>{r.formula}</td>
                  <td className="px-4 py-2 text-primary">{r.name}</td>
                  <td className="px-4 py-2 text-secondary">{r.color}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

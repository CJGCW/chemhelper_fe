export default function GibbsEquilibriumReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      {/* Triangle diagram */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">The ΔG° − K − E°cell Triangle</h3>
        <div className="flex justify-center py-4">
          <svg viewBox="0 0 320 260" className="w-full max-w-sm" aria-label="ΔG° K E°cell conversion triangle">
            {/* Triangle */}
            <polygon
              points="160,20 30,230 290,230"
              fill="color-mix(in srgb, var(--c-halogen) 6%, transparent)"
              stroke="color-mix(in srgb, var(--c-halogen) 30%, transparent)"
              strokeWidth="2"
            />
            {/* Vertices labels */}
            {/* Top: ΔG° */}
            <text x="160" y="14" textAnchor="middle" fontFamily="monospace" fontSize="15" fill="var(--c-halogen)" fontWeight="bold">ΔG°</text>
            {/* Bottom-left: K */}
            <text x="30" y="252" textAnchor="middle" fontFamily="monospace" fontSize="15" fill="var(--c-halogen)" fontWeight="bold">K</text>
            {/* Bottom-right: E°cell */}
            <text x="290" y="252" textAnchor="middle" fontFamily="monospace" fontSize="15" fill="var(--c-halogen)" fontWeight="bold">E°cell</text>

            {/* Left edge label: ΔG° = -RT ln K */}
            <text x="78" y="132" textAnchor="middle" fontFamily="monospace" fontSize="10"
              fill="rgb(var(--color-secondary))"
              transform="rotate(-58, 78, 132)">
              ΔG° = −RT ln K
            </text>

            {/* Right edge label: ΔG° = -nFE° */}
            <text x="238" y="130" textAnchor="middle" fontFamily="monospace" fontSize="10"
              fill="rgb(var(--color-secondary))"
              transform="rotate(58, 238, 130)">
              ΔG° = −nFE°
            </text>

            {/* Bottom edge label: ln K = nFE°/RT */}
            <text x="160" y="248" textAnchor="middle" fontFamily="monospace" fontSize="10"
              fill="rgb(var(--color-secondary))">
              ln K = nFE° / RT
            </text>
          </svg>
        </div>
        <p className="font-sans text-xs text-secondary text-center">
          Any two quantities determine the third. R = 8.314 J/(mol·K); F = 96 485 C/mol.
        </p>
      </section>

      {/* Conversion formulas */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Conversion Formulas</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              heading: 'ΔG° ↔ K',
              formula: 'ΔG° = −RT ln K    ↔    K = e^(−ΔG°/RT)',
              note: 'R = 8.314 J/(mol·K). ΔG° in J/mol for this formula (multiply kJ × 1000).',
            },
            {
              heading: 'ΔG° ↔ E°cell',
              formula: 'ΔG° = −nFE°cell    ↔    E°cell = −ΔG° / (nF)',
              note: 'n = moles of electrons transferred; F = 96 485 C/mol; ΔG° in J/mol.',
            },
            {
              heading: 'K ↔ E°cell',
              formula: 'ln K = nFE° / RT    ↔    E° = RT ln K / (nF)',
              note: 'Derived by equating the two expressions for ΔG°.',
            },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
              <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{item.heading}</p>
              <p className="font-mono text-sm text-primary">{item.formula}</p>
              <p className="font-sans text-xs text-secondary">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Qualitative Summary */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Qualitative Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-secondary font-normal">ΔG°</th>
                <th className="text-left py-2 pr-4 text-secondary font-normal">K</th>
                <th className="text-left py-2 pr-4 text-secondary font-normal">E°cell</th>
                <th className="text-left py-2 text-secondary font-normal">Reaction favors…</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dg: '< 0', k: '> 1', e: '> 0', favor: 'Products', color: 'text-emerald-400' },
                { dg: '= 0', k: '= 1', e: '= 0', favor: 'Equilibrium', color: 'text-secondary' },
                { dg: '> 0', k: '< 1', e: '< 0', favor: 'Reactants', color: 'text-red-400' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary">{row.dg}</td>
                  <td className="py-2 pr-4 text-primary">{row.k}</td>
                  <td className="py-2 pr-4 text-primary">{row.e}</td>
                  <td className={`py-2 ${row.color}`}>{row.favor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

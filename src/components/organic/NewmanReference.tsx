import NewmanProjectionViewer from './NewmanProjectionViewer'

export default function NewmanReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Newman Projections</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A Newman projection looks down a C–C bond. The front carbon is the center dot; the back carbon
          is the circle. The dihedral angle φ measures rotation between front and back substituents.
          Drag the slider to rotate the back carbon.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-dim uppercase tracking-wider">Butane (C2–C3)</p>
            <NewmanProjectionViewer mode="butane" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-dim uppercase tracking-wider">Ethane</p>
            <NewmanProjectionViewer mode="ethane" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-sans">
          {[
            { φ: '0°',   name: 'Totally Eclipsed', E: '~19 kJ/mol', note: 'Highest strain — large groups eclipsed' },
            { φ: '60°',  name: 'Gauche',           E: '~3.8 kJ/mol', note: '1,3-diaxial-like interaction' },
            { φ: '120°', name: 'Eclipsed',          E: '~16 kJ/mol', note: 'H eclipsing CH₃' },
            { φ: '180°', name: 'Anti',              E: '0 kJ/mol',   note: 'Most stable — large groups opposite' },
          ].map(row => (
            <div key={row.φ} className="flex flex-col gap-1 p-3 rounded-sm border border-border bg-surface">
              <span className="font-mono text-xs text-dim">φ = {row.φ}</span>
              <span className="font-medium text-bright">{row.name}</span>
              <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{row.E}</span>
              <span className="text-xs text-secondary">{row.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Conformer Energies</h3>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface font-sans text-sm text-secondary leading-relaxed">
          <p><strong className="text-primary">Staggered &gt; Eclipsed</strong> — Staggered conformations are always more stable due to reduced torsional strain.</p>
          <p><strong className="text-primary">Ethane barrier</strong> — ~12 kJ/mol between staggered and eclipsed. Each H–H eclipsing interaction costs ~4 kJ/mol.</p>
          <p><strong className="text-primary">Butane barriers</strong> — Anti (0) → gauche (3.8) → eclipsed H/CH₃ (16) → totally eclipsed CH₃/CH₃ (19 kJ/mol).</p>
          <p><strong className="text-primary">Reading dihedral angle</strong> — measure from a front substituent to the nearest back substituent, going clockwise.</p>
        </div>
      </section>

    </div>
  )
}

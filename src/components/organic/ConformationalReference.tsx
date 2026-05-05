import NewmanProjectionViewer from './NewmanProjectionViewer'
import ChairConformationViewer from './ChairConformationViewer'

export default function ConformationalReference() {
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
            { φ: '0°', name: 'Totally Eclipsed', E: '~19 kJ/mol', note: 'Highest strain — large groups eclipsed' },
            { φ: '60°', name: 'Gauche', E: '~3.8 kJ/mol', note: '1,3-diaxial-like interaction' },
            { φ: '120°', name: 'Eclipsed', E: '~16 kJ/mol', note: 'H eclipsing CH₃' },
            { φ: '180°', name: 'Anti', E: '0 kJ/mol', note: 'Most stable — large groups opposite' },
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
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Cyclohexane Chair Conformations</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Cyclohexane adopts a chair conformation to minimize angle and torsional strain. Each carbon
          has one axial bond (vertical) and one equatorial bond (angled). The ring flip interconverts
          the two chair forms, exchanging axial and equatorial positions.
        </p>

        <ChairConformationViewer showLabels={true} />

        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-widest uppercase text-dim">A-Values (equatorial preference, kJ/mol)</p>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 pr-4 text-dim font-normal">Group</th>
                  <th className="text-right py-1.5 pr-4 text-dim font-normal">A-value</th>
                  <th className="text-left py-1.5 text-dim font-normal">Note</th>
                </tr>
              </thead>
              <tbody className="text-secondary">
                {[
                  ['CH₃',  '7.6',  'Significant preference'],
                  ['Et',   '7.5',  'Similar to methyl'],
                  ['iPr',  '9.4',  'Larger steric demand'],
                  ['tBu',  '22.8', 'ALWAYS equatorial'],
                  ['OH',   '2.1',  'Moderate preference'],
                  ['Cl/Br','2.0–2.2', 'Moderate preference'],
                  ['Ph',   '12.4', 'Large preference'],
                ].map(([g, a, n]) => (
                  <tr key={g} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-primary">{g}</td>
                    <td className="py-1.5 pr-4 text-right" style={{ color: 'var(--c-halogen)' }}>{a}</td>
                    <td className="py-1.5 text-dim">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 rounded-sm border border-border bg-surface">
          <p className="font-mono text-xs text-dim uppercase tracking-wider mb-2">Key Rules</p>
          <ul className="font-sans text-sm text-secondary flex flex-col gap-1 list-disc list-inside">
            <li>Large groups strongly prefer equatorial — lower 1,3-diaxial strain</li>
            <li>tBu group is SO large it essentially locks the ring (ring flip cost ≫ kT)</li>
            <li>For disubstituted rings: conformation with both groups equatorial is preferred when possible</li>
            <li>cis substituents on adjacent carbons: one must be axial</li>
            <li>trans substituents on adjacent carbons: both can be equatorial (diequatorial = preferred)</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

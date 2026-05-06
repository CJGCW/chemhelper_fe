import ChairConformationViewer from './ChairConformationViewer'
import BoatConformationViewer from './BoatConformationViewer'
import { ConformerComparisonStrip, ConformerEnergyDiagram } from './ConformerComparison'

export default function ChairReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Cyclohexane Chair Conformations</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Cyclohexane adopts a chair conformation to minimize angle and torsional strain. Each carbon
          has one axial bond (vertical) and one equatorial bond (angled). The ring flip interconverts
          the two chair forms, exchanging axial and equatorial positions.
        </p>

        <ChairConformationViewer showLabels={true} />

        <ConformerComparisonStrip />

        <ConformerEnergyDiagram />

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
                  ['CH₃',   '7.6',     'Significant preference'],
                  ['Et',    '7.5',     'Similar to methyl'],
                  ['iPr',   '9.4',     'Larger steric demand'],
                  ['tBu',   '22.8',    'ALWAYS equatorial'],
                  ['OH',    '2.1',     'Moderate preference'],
                  ['Cl/Br', '2.0–2.2', 'Moderate preference'],
                  ['Ph',    '12.4',    'Large preference'],
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

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Boat &amp; Twist-Boat Conformations</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The boat conformation is significantly higher in energy than chair due to two factors:
          flagpole hydrogen interaction at C1 and C4, plus eclipsing along C2–C3 and C5–C6.
          The twist-boat (or "twist") relieves some flagpole strain via a small rotation; it sits
          about 5 kJ/mol above chair and is a real local minimum. Boat itself is a transition state
          between two twist-boat conformers.
        </p>

        <BoatConformationViewer showLabels={true} />

        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-widest uppercase text-dim">Energy Comparison</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans text-sm">
            {[
              { name: 'Chair',      energy: '0 kJ/mol',   note: 'global minimum, all bonds staggered' },
              { name: 'Twist-Boat', energy: '~5 kJ/mol',  note: 'local minimum, partial relief of flagpole' },
              { name: 'Boat',       energy: '~29 kJ/mol', note: 'transition state, flagpole + eclipsing' },
            ].map(row => (
              <div key={row.name} className="flex flex-col gap-1 p-3 rounded-sm border border-border bg-surface">
                <span className="font-mono text-xs text-dim">{row.name}</span>
                <span className="font-medium" style={{ color: 'var(--c-halogen)' }}>{row.energy}</span>
                <span className="text-xs text-secondary">{row.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

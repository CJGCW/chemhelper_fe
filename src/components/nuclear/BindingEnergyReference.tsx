import { COMMON_NUCLIDES, PROTON_MASS, NEUTRON_MASS, AMU_TO_MEV } from '../../data/nuclearData'
import { bindingEnergy } from '../../chem/nuclear'

export default function BindingEnergyReference() {
  const stableNuclides = COMMON_NUCLIDES.filter(n => n.decayMode === 'stable' && n.A >= 1)

  const beData = stableNuclides.map(n => {
    try {
      const res = bindingEnergy(n.Z, n.A, n.atomicMass)
      return { ...n, ...res }
    } catch {
      return null
    }
  }).filter(Boolean) as Array<typeof stableNuclides[0] & { massDefect: number; totalBE: number; bePerNucleon: number }>

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Formulas */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Nuclear Binding Energy</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Mass defect', formula: 'Δm = Z·m_H + N·m_n − m_atom', note: 'All masses in amu (atomic mass units)' },
            { label: 'Total binding energy', formula: 'BE = Δm × 931.5 MeV/amu', note: '1 amu = 931.5 MeV (Einstein E=mc²)' },
            { label: 'BE per nucleon', formula: 'BE/A = BE (MeV) / A', note: 'Measure of nuclear stability' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-1 p-4 rounded-sm border border-border bg-surface">
              <span className="font-mono text-xs text-secondary uppercase tracking-wider">{item.label}</span>
              <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{item.formula}</span>
              <span className="font-sans text-xs text-dim">{item.note}</span>
            </div>
          ))}
          <div className="flex flex-col gap-1 p-4 rounded-sm border border-border bg-surface">
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">Constants used</span>
            <span className="font-mono text-sm text-primary">m_H = {PROTON_MASS} amu (¹H atom)</span>
            <span className="font-mono text-sm text-primary">m_n = {NEUTRON_MASS} amu</span>
            <span className="font-mono text-sm text-primary">1 amu = {AMU_TO_MEV} MeV</span>
          </div>
        </div>
      </div>

      {/* Concept explanation */}
      <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
        <h4 className="font-sans text-sm font-semibold text-primary">Nuclear Stability and the BE/A Curve</h4>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The binding energy per nucleon (BE/A) is the most important measure of nuclear stability.
          It peaks near <strong>iron-56 (~8.79 MeV/nucleon)</strong>, which is the most stable nuclide.
          Nuclei lighter than Fe-56 can release energy by <em>fusion</em> (combining smaller nuclei);
          nuclei heavier than Fe-56 can release energy by <em>fission</em> (splitting). Both processes
          move toward Fe-56 on the BE/A curve.
        </p>
        <ul className="font-sans text-sm text-secondary list-disc list-inside flex flex-col gap-1 mt-1">
          <li>Low-A region (H, He, Li): BE/A rises steeply — fusion releases energy</li>
          <li>Peak (~A = 56–62): most stable — Fe, Ni, Co</li>
          <li>High-A region (U, Th): BE/A decreases — fission releases energy</li>
        </ul>
      </div>

      {/* BE/A table for stable nuclides in the dataset */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Calculated Binding Energies (Stable Nuclides)</h3>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-raised))' }}>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Nuclide</th>
                <th className="text-right px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Δm (amu)</th>
                <th className="text-right px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Total BE (MeV)</th>
                <th className="text-right px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">BE/A (MeV)</th>
              </tr>
            </thead>
            <tbody>
              {beData.map((n, i) => (
                <tr key={n.symbol} style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
                  <td className="px-4 py-2 font-mono" style={{ color: 'var(--c-halogen)' }}>{n.symbol}</td>
                  <td className="px-4 py-2 font-mono text-right text-primary text-xs">{n.massDefect.toFixed(6)}</td>
                  <td className="px-4 py-2 font-mono text-right text-primary">{n.totalBE.toFixed(2)}</td>
                  <td className="px-4 py-2 font-mono text-right font-semibold"
                    style={{ color: n.bePerNucleon > 8 ? '#4ade80' : n.bePerNucleon > 6 ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.6)' }}>
                    {n.bePerNucleon.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-xs text-dim">Green highlight indicates high stability (BE/A &gt; 8 MeV).</p>
      </div>

      <p className="font-mono text-xs text-secondary">
        Atomic masses from NIST AME2020. Calculated using m_H = {PROTON_MASS} amu, m_n = {NEUTRON_MASS} amu, 1 amu = {AMU_TO_MEV} MeV.
      </p>
    </div>
  )
}

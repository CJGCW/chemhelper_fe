export default function NuclearDecayReference() {
  const decayTypes = [
    {
      type: 'Alpha (α)',
      particle: '⁴₂He',
      deltaZ: '−2',
      deltaA: '−4',
      description: 'Nucleus emits a helium-4 nucleus (2 protons + 2 neutrons). Common in heavy nuclei (A > 200).',
      example: '²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He',
    },
    {
      type: 'Beta-minus (β⁻)',
      particle: '⁰₋₁e (electron)',
      deltaZ: '+1',
      deltaA: '0',
      description: 'A neutron converts to a proton, emitting an electron and antineutrino. Occurs in neutron-rich nuclei.',
      example: '¹⁴₆C → ¹⁴₇N + ⁰₋₁e',
    },
    {
      type: 'Beta-plus (β⁺)',
      particle: '⁰₊₁e (positron)',
      deltaZ: '−1',
      deltaA: '0',
      description: 'A proton converts to a neutron, emitting a positron and neutrino. Occurs in proton-rich nuclei.',
      example: '²²₁₁Na → ²²₁₀Ne + ⁰₊₁e',
    },
    {
      type: 'Gamma (γ)',
      particle: '⁰₀γ (photon)',
      deltaZ: '0',
      deltaA: '0',
      description: 'Excited nucleus releases energy as a high-energy photon. Z and A do not change.',
      example: '⁹⁹ᵐ₄₃Tc → ⁹⁹₄₃Tc + γ',
    },
    {
      type: 'Electron Capture (EC)',
      particle: 'Inner e⁻ absorbed',
      deltaZ: '−1',
      deltaA: '0',
      description: 'Nucleus captures an inner-shell electron; proton converts to neutron. Competes with β⁺ decay.',
      example: '⁴⁰₁₉K + e⁻ → ⁴⁰₁₈Ar',
    },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-semibold text-bright text-lg">Conservation Laws in Nuclear Reactions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { law: 'Mass number (A)', rule: 'Sum of A is equal on both sides' },
            { law: 'Atomic number (Z)', rule: 'Sum of Z is equal on both sides' },
            { law: 'Charge', rule: 'Total charge is conserved' },
            { law: 'Energy-mass', rule: 'Mass defect converts to energy (E = mc²)' },
          ].map(item => (
            <div key={item.law} className="flex flex-col gap-1 p-3 rounded-sm border border-border bg-surface">
              <span className="font-mono text-xs text-secondary uppercase tracking-wider">{item.law}</span>
              <span className="font-sans text-sm text-primary">{item.rule}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Types of Radioactive Decay</h3>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-raised))' }}>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Type</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Particle</th>
                <th className="text-center px-3 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">ΔZ</th>
                <th className="text-center px-3 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">ΔA</th>
              </tr>
            </thead>
            <tbody>
              {decayTypes.map((d, i) => (
                <tr key={d.type} style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
                  <td className="px-4 py-3 font-sans text-primary font-medium">{d.type}</td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{d.particle}</td>
                  <td className="px-3 py-3 text-center font-mono text-sm text-primary">{d.deltaZ}</td>
                  <td className="px-3 py-3 text-center font-mono text-sm text-primary">{d.deltaA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Decay Equations & Examples</h3>
        {decayTypes.map(d => (
          <div key={d.type} className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-sans text-sm font-semibold text-primary">{d.type}</span>
              <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{d.example}</span>
            </div>
            <p className="font-sans text-sm text-secondary">{d.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
        <h4 className="font-sans text-sm font-semibold text-primary">Balancing Nuclear Equations</h4>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          To balance: (1) write down all known particles, (2) sum up A and Z on each side,
          (3) the unknown particle has A = (reactant A) − (product A) and Z = (reactant Z) − (product Z).
          Use Z to identify the element; use A to specify the isotope.
        </p>
        <div className="font-mono text-xs text-dim mt-1">
          Example: ²³⁸U → ²³⁴Th + ?  ⟹  A = 238 − 234 = 4, Z = 92 − 90 = 2  ⟹  ⁴₂He (alpha)
        </div>
      </div>

      <p className="font-mono text-xs text-secondary">
        Data from Chang's Chemistry, 14e, Chapter 19 (Nuclear Chemistry).
      </p>
    </div>
  )
}

const REDUCTION_POTENTIALS = [
  { half_reaction: 'F₂ + 2e⁻ → 2F⁻',             E: '+2.87' },
  { half_reaction: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O', E: '+1.51' },
  { half_reaction: 'Cl₂ + 2e⁻ → 2Cl⁻',           E: '+1.36' },
  { half_reaction: 'Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O', E: '+1.33' },
  { half_reaction: 'O₂ + 4H⁺ + 4e⁻ → 2H₂O',     E: '+1.23' },
  { half_reaction: 'Br₂ + 2e⁻ → 2Br⁻',           E: '+1.07' },
  { half_reaction: 'Ag⁺ + e⁻ → Ag',              E: '+0.80' },
  { half_reaction: 'Fe³⁺ + e⁻ → Fe²⁺',           E: '+0.77' },
  { half_reaction: 'Cu²⁺ + 2e⁻ → Cu',            E: '+0.34' },
  { half_reaction: '2H⁺ + 2e⁻ → H₂',            E: '0.00 (reference)' },
  { half_reaction: 'Ni²⁺ + 2e⁻ → Ni',            E: '−0.25' },
  { half_reaction: 'Fe²⁺ + 2e⁻ → Fe',            E: '−0.44' },
  { half_reaction: 'Zn²⁺ + 2e⁻ → Zn',            E: '−0.76' },
  { half_reaction: 'Al³⁺ + 3e⁻ → Al',            E: '−1.66' },
  { half_reaction: 'Li⁺ + e⁻ → Li',              E: '−3.05' },
]

export default function EcellReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Cell Potential (E°cell)</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The standard cell potential is the voltage produced by a galvanic (electrochemical) cell when all species
          are at standard conditions (1 M concentrations, 1 atm pressure, 25 °C). It measures the thermodynamic
          driving force for the overall redox reaction.
        </p>
      </div>

      {/* Key formula */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Formulas</p>
        <div className="flex flex-col gap-3">
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">E°cell = E°cathode − E°anode</p>
            <p className="font-mono text-xs text-secondary mt-1">
              Cathode = reduction (where gain of electrons occurs). Anode = oxidation (loss of electrons).
              E° values are always written as reduction potentials — never change the sign when reversing.
            </p>
          </div>
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">Nernst: E = E° − (0.05916 / n) log Q  (at 25 °C)</p>
            <p className="font-mono text-xs text-secondary mt-1">
              n = moles of electrons transferred; Q = reaction quotient. At equilibrium: E = 0, Q = K.
            </p>
          </div>
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">ΔG° = −nFE°cell</p>
            <p className="font-mono text-xs text-secondary mt-1">
              F = 96,485 C/mol (Faraday constant). E° &gt; 0 → ΔG° &lt; 0 → spontaneous reaction.
            </p>
          </div>
        </div>
      </div>

      {/* Standard reduction potentials */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Standard Reduction Potentials (25 °C)</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Half-reaction</th>
                <th className="px-4 py-2 text-right text-xs tracking-widest text-secondary uppercase border-b border-border whitespace-nowrap">E° (V)</th>
              </tr>
            </thead>
            <tbody>
              {REDUCTION_POTENTIALS.map(r => (
                <tr key={r.half_reaction} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-secondary">{r.half_reaction}</td>
                  <td className="px-4 py-2 text-right font-semibold"
                    style={{ color: parseFloat(r.E) > 0 ? '#4ade80' : parseFloat(r.E) < 0 ? '#f87171' : 'var(--c-halogen)' }}>
                    {r.E}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim">Selected values from Chang 14e Table 18.1. Higher E° = stronger oxidizing agent.</p>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — Zn/Cu Galvanic Cell</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            Cell: Zn | Zn²⁺ ‖ Cu²⁺ | Cu<br />
            Anode (oxidation): Zn → Zn²⁺ + 2e⁻  (E°red = −0.76 V)<br />
            Cathode (reduction): Cu²⁺ + 2e⁻ → Cu  (E°red = +0.34 V)
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">E°cell = E°cathode − E°anode</p>
            <p className="font-mono text-xs text-secondary">E°cell = +0.34 − (−0.76)</p>
            <p className="font-mono text-xs text-primary font-semibold">E°cell = +1.10 V  (spontaneous; positive E°)</p>
          </div>
        </div>
      </div>

    </div>
  )
}

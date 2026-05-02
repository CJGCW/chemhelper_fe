import { THERMO_TABLE } from '../../data/thermoData'

// Show a representative subset of 10 substances
const REPRESENTATIVE = [
  'H₂', 'O₂', 'N₂', 'H₂O', 'CO₂', 'NH₃', 'NaCl', 'Fe₂O₃', 'CH₄', 'CaCO₃',
]

export default function EntropyReference() {
  const displayed = THERMO_TABLE.filter(e =>
    REPRESENTATIVE.includes(e.formula) &&
    (e.state === 'g' || e.state === 'l' || (e.state === 's' && e.formula !== 'C'))
  ).slice(0, 10)

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      {/* Definition */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Standard Molar Entropy (S°)</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The <strong className="text-primary">standard molar entropy</strong> S° is the absolute entropy of one mole of a substance
          at 298 K and 1 bar. Unlike enthalpy, entropy has an absolute zero (Third Law), so S° values are always positive.
          Units: <span className="font-mono">J/(mol·K)</span>.
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised font-mono text-sm text-primary">
          ΔS°<sub>rxn</sub> = Σ n·S°(products) − Σ n·S°(reactants)
        </div>
      </section>

      {/* Second Law */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Second Law of Thermodynamics</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For a spontaneous process: <span className="font-mono text-primary">ΔS<sub>universe</sub> = ΔS<sub>system</sub> + ΔS<sub>surroundings</sub> &gt; 0</span>.
          The entropy of the universe never decreases. At equilibrium, ΔS<sub>universe</sub> = 0.
        </p>
      </section>

      {/* Qualitative Rules */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Predicting the Sign of ΔS°</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { sign: '+', rule: 'Δn(gas) > 0 (more gas molecules produced)' },
            { sign: '+', rule: 'Solid or liquid dissolves in solution' },
            { sign: '+', rule: 'Larger, more complex molecules formed' },
            { sign: '+', rule: 'Temperature increases in a phase' },
            { sign: '−', rule: 'Δn(gas) < 0 (fewer gas molecules produced)' },
            { sign: '−', rule: 'Gas condenses to liquid or liquid freezes' },
            { sign: '−', rule: 'Molecules combine into fewer particles' },
            { sign: '?', rule: 'Δn(gas) = 0; check S° values directly' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-sm border border-border bg-raised">
              <span
                className="font-mono text-lg font-bold shrink-0 w-5 text-center"
                style={{ color: item.sign === '+' ? 'var(--c-halogen)' : item.sign === '−' ? '#f87171' : 'rgb(var(--color-secondary))' }}
              >
                {item.sign}
              </span>
              <span className="font-sans text-sm text-secondary">{item.rule}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Data Table */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Selected S° Values (Chang Appendix 2)</h3>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-secondary font-normal">Formula</th>
                <th className="text-left py-2 pr-4 text-secondary font-normal">Name</th>
                <th className="text-left py-2 pr-4 text-secondary font-normal">State</th>
                <th className="text-right py-2 text-secondary font-normal">S° J/(mol·K)</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary">{e.formula}</td>
                  <td className="py-2 pr-4 text-secondary">{e.name}</td>
                  <td className="py-2 pr-4 text-dim">({e.state})</td>
                  <td className="py-2 text-right" style={{ color: 'var(--c-halogen)' }}>{e.S}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Worked Example */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Worked Example (Chang Ex 17.4)</h3>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-3">
          <p className="font-sans text-sm text-primary font-medium">CaCO₃(s) → CaO(s) + CO₂(g)</p>
          <div className="flex flex-col gap-1.5 pl-3 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)' }}>
            {[
              'ΔS°rxn = Σ n·S°(products) − Σ n·S°(reactants)',
              'Products: 1 × S°[CaO(s)] + 1 × S°[CO₂(g)] = 39.8 + 213.6 = 253.4 J/(mol·K)',
              'Reactants: 1 × S°[CaCO₃(s)] = 92.9 J/(mol·K)',
              'ΔS°rxn = 253.4 − 92.9 = +160.5 J/(mol·K)',
            ].map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-mono text-xs text-secondary shrink-0 mt-0.5">{i + 1}.</span>
                <span className="font-mono text-xs text-secondary">{step}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
              ΔS°rxn = +160.5 J/(mol·K) — positive because one mole of gas is produced.
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

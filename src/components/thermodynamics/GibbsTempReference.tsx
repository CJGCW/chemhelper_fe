export default function GibbsTempReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      {/* Concept */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">ΔG vs Temperature</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Since <span className="font-mono text-primary">ΔG° = ΔH° − T·ΔS°</span>, Gibbs free energy varies linearly with temperature.
          The slope of ΔG vs T is <span className="font-mono text-primary">−ΔS°</span>
          and the intercept is <span className="font-mono text-primary">ΔH°</span>.
          The temperature at which ΔG° = 0 is the crossover point — below this T the
          enthalpy term dominates; above it the entropy term dominates.
        </p>
      </section>

      {/* Crossover temperature */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Crossover Temperature Formula</h3>
        <div className="p-4 rounded-sm border border-border bg-raised font-mono text-sm flex flex-col gap-2">
          <p className="text-primary">At ΔG° = 0:   0 = ΔH° − T<sub>c</sub>·ΔS°</p>
          <p className="text-primary">T<sub>c</sub> = ΔH°(kJ) × 1000 / ΔS°(J/K)   [result in K]</p>
          <p className="text-secondary text-xs">Both ΔH° and ΔS° must have the same sign; otherwise T<sub>c</sub> &lt; 0 K (no real crossover).</p>
        </div>
      </section>

      {/* Visual description */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">ΔG vs T Plot (schematic)</h3>
        <div className="p-4 rounded-sm border border-border bg-raised text-xs font-mono text-secondary flex flex-col gap-1">
          <p>ΔG (kJ) ↑</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│\</p>
          <p>&nbsp;&nbsp;ΔH° &gt; 0 │ \  (ΔH &gt; 0, ΔS &gt; 0)</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  \</p>
          <p>──────────┼────\──────────── T →</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;\ Tc &nbsp;&nbsp;spontaneous here</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</p>
          <p className="mt-2">Slope = −ΔS°; y-intercept = ΔH°</p>
        </div>
      </section>

      {/* Examples */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Examples</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              rxn: 'CaCO₃(s) → CaO(s) + CO₂(g)',
              dH: '+178', dS: '+160',
              tc: 'Tc = 178000/160 = 1113 K (840°C)',
              note: 'Endothermic but entropy-driven at high T.',
            },
            {
              rxn: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
              dH: '−92', dS: '−199',
              tc: 'Tc = 92000/199 = 462 K (189°C)',
              note: 'Exothermic but disfavored at high T due to entropy decrease.',
            },
          ].map((ex, i) => (
            <div key={i} className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-1">
              <p className="font-mono text-sm text-primary font-medium">{ex.rxn}</p>
              <p className="font-mono text-xs text-secondary">ΔH° = {ex.dH} kJ/mol &nbsp; ΔS° = {ex.dS} J/(mol·K)</p>
              <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{ex.tc}</p>
              <p className="font-sans text-xs text-secondary italic">{ex.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

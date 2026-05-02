export default function ArrheniusReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Arrhenius Equation</h3>
        <div className="p-4 rounded-sm font-mono text-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p style={{ color: 'var(--c-halogen)' }}>k = A · e<sup>−Ea/RT</sup></p>
        </div>
        <div className="flex flex-col gap-2 font-sans text-sm text-secondary">
          <p><span className="font-mono text-primary">k</span> — rate constant</p>
          <p><span className="font-mono text-primary">A</span> — pre-exponential (frequency) factor; same units as k</p>
          <p><span className="font-mono text-primary">Ea</span> — activation energy (J/mol); the minimum energy needed for reaction</p>
          <p><span className="font-mono text-primary">R</span> — gas constant = 8.314 J/(mol·K)</p>
          <p><span className="font-mono text-primary">T</span> — absolute temperature (K)</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Two-Point Arrhenius Form</h3>
        <p className="font-sans text-sm text-secondary">
          When two (T, k) pairs are known, Ea and A cancel out, giving the more useful form:
        </p>
        <div className="p-4 rounded-sm font-mono text-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p style={{ color: 'var(--c-halogen)' }}>
            ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁)
          </p>
        </div>
        <p className="font-sans text-sm text-secondary">
          Rearranged to find Ea:
        </p>
        <div className="p-4 rounded-sm font-mono text-sm"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p style={{ color: 'var(--c-halogen)' }}>
            Ea = −R · ln(k₂/k₁) / (1/T₂ − 1/T₁)
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Activation Energy Concept</h3>
        <ul className="font-sans text-sm text-secondary flex flex-col gap-2 pl-4 list-disc">
          <li>Ea is the energy barrier that reactants must overcome to become products.</li>
          <li>Higher Ea → slower reaction; rate constant k is more sensitive to temperature.</li>
          <li>A catalyst lowers Ea, increasing the rate without changing ΔH of the reaction.</li>
          <li>A plot of ln k vs 1/T gives a straight line with slope = −Ea/R.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Worked Example</h3>
        <p className="font-sans text-sm text-secondary">
          N₂O₅ decomposition: k = 1.35 × 10⁻⁵ s⁻¹ at 298 K; k = 5.10 × 10⁻⁴ s⁻¹ at 338 K.
          Find Ea.
        </p>
        <div className="flex flex-col gap-2 font-mono text-sm text-secondary p-4 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          <p>ln(k₂/k₁) = ln(5.10×10⁻⁴ / 1.35×10⁻⁵) = ln(37.8) = 3.632</p>
          <p>1/T₂ − 1/T₁ = 1/338 − 1/298 = −3.97×10⁻⁴ K⁻¹</p>
          <p>Ea = −8.314 × 3.632 / (−3.97×10⁻⁴)</p>
          <p>Ea = <span style={{ color: 'var(--c-halogen)' }}>88 kJ/mol</span></p>
        </div>
      </section>

    </div>
  )
}

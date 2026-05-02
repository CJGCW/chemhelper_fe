export default function MechanismReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Elementary Steps</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A reaction mechanism is a sequence of elementary steps (molecular-level events).
          Unlike the overall rate law, the rate law for an elementary step CAN be written
          directly from its stoichiometry.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--color-border))' }}>
                <th className="text-left py-2 pr-6 font-semibold text-secondary">Step Type</th>
                <th className="text-left py-2 pr-6 font-semibold text-secondary">Example</th>
                <th className="text-left py-2 font-semibold text-secondary">Rate Law</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              <tr style={{ borderBottom: '1px solid rgba(var(--overlay),0.06)' }}>
                <td className="py-2 pr-6 text-primary">Unimolecular</td>
                <td className="py-2 pr-6">A → products</td>
                <td className="py-2" style={{ color: 'var(--c-halogen)' }}>rate = k[A]</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(var(--overlay),0.06)' }}>
                <td className="py-2 pr-6 text-primary">Bimolecular</td>
                <td className="py-2 pr-6">A + B → products</td>
                <td className="py-2" style={{ color: 'var(--c-halogen)' }}>rate = k[A][B]</td>
              </tr>
              <tr>
                <td className="py-2 pr-6 text-primary">Bimolecular</td>
                <td className="py-2 pr-6">2A → products</td>
                <td className="py-2" style={{ color: 'var(--c-halogen)' }}>rate = k[A]²</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Rate-Determining Step</h3>
        <ul className="font-sans text-sm text-secondary flex flex-col gap-2 pl-4 list-disc">
          <li>The <strong className="text-primary">slowest step</strong> in a mechanism controls the overall rate.</li>
          <li>The overall rate law is the rate law of the rate-determining step.</li>
          <li>If the slow step involves an intermediate, substitute using the fast equilibrium step above it.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Intermediates vs Catalysts</h3>
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-sm"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            <p className="font-sans text-sm font-semibold text-primary mb-1">Intermediate</p>
            <p className="font-sans text-sm text-secondary">
              Produced in one step and consumed in a later step. Does NOT appear in the overall equation.
            </p>
          </div>
          <div className="p-3 rounded-sm"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            <p className="font-sans text-sm font-semibold text-primary mb-1">Catalyst</p>
            <p className="font-sans text-sm text-secondary">
              Consumed early and regenerated later. Appears in the overall equation as a reactant
              that is also a product (net zero), but lowers Ea.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Worked Example</h3>
        <p className="font-sans text-sm text-secondary">
          Overall: <span className="font-mono text-primary">2NO + O₂ → 2NO₂</span>
        </p>
        <p className="font-sans text-sm text-secondary">Proposed mechanism:</p>
        <div className="flex flex-col gap-2 font-mono text-sm text-secondary p-4 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          <p>Step 1 (fast, reversible):  2NO ⇌ N₂O₂</p>
          <p>Step 2 (slow):              N₂O₂ + O₂ → 2NO₂</p>
        </div>
        <ul className="font-sans text-sm text-secondary flex flex-col gap-1 pl-4 list-disc">
          <li>Intermediate: <span className="font-mono text-primary">N₂O₂</span></li>
          <li>Rate-determining step: Step 2</li>
          <li>Rate from slow step: rate = k₂[N₂O₂][O₂]</li>
          <li>
            Substituting equilibrium from Step 1: [N₂O₂] = K₁[NO]²
          </li>
          <li>
            Overall rate law: <span className="font-mono" style={{ color: 'var(--c-halogen)' }}>rate = k[NO]²[O₂]</span>
          </li>
        </ul>
      </section>

    </div>
  )
}

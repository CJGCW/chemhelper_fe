import { POLYPROTIC_ACIDS } from '../../data/acidBaseConstants'
import { polyproticPh } from '../../chem/acidBase'

export default function PolyproticReference() {
  const phosphoricExample = polyproticPh(0.10, 7.5e-3, 6.2e-8, 4.8e-13)

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Principle */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">The Ka1 ≫ Ka2 Principle</h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-sans text-sm text-primary mb-2">
            For polyprotic acids, Ka1 is typically 10³–10⁶ times larger than Ka2.
            The first dissociation step dominates [H⁺], so pH calculations use Ka1 alone.
          </p>
          <p className="font-sans text-sm text-secondary">
            The second (and third) ionization steps contribute negligible additional [H⁺].
            Only for very dilute solutions or very small Ka1/Ka2 ratios is the second step significant.
          </p>
        </div>
      </section>

      {/* Dissociation steps */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Successive Ionization Steps (H₃PO₄)</h3>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <div className="font-mono text-sm">
            <p className="text-primary">H₃PO₄ ⇌ H⁺ + H₂PO₄⁻  &nbsp;&nbsp; Ka1 = 7.5 × 10⁻³</p>
            <p className="text-secondary mt-1">H₂PO₄⁻ ⇌ H⁺ + HPO₄²⁻  &nbsp; Ka2 = 6.2 × 10⁻⁸</p>
            <p className="text-secondary mt-1">HPO₄²⁻ ⇌ H⁺ + PO₄³⁻  &nbsp;&nbsp; Ka3 = 4.8 × 10⁻¹³</p>
          </div>
          <p className="font-sans text-xs text-secondary mt-2">
            Ka1/Ka2 ≈ 1.2 × 10⁵ → second step is negligible for [H⁺].
          </p>
        </div>
      </section>

      {/* Worked example */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">
          Worked Example: 0.10 M H₃PO₄
        </h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          {phosphoricExample.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary leading-relaxed">{s}</p>
          ))}
          <p className="font-mono text-sm font-semibold text-primary mt-3">
            pH = {phosphoricExample.pH.toFixed(2)}
          </p>
        </div>
      </section>

      {/* Species distribution table */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Polyprotic Acids Reference</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-surface))' }}>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Acid</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka1</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">pKa1</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka2</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka3</th>
              </tr>
            </thead>
            <tbody>
              {POLYPROTIC_ACIDS.map(a => (
                <tr key={a.formula}>
                  <td className="border border-border px-3 py-1 text-primary font-medium">{a.name}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka.toExponential(1)}</td>
                  <td className="border border-border px-3 py-1 text-right text-secondary">{a.pKa.toFixed(2)}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka2 ? a.Ka2.toExponential(1) : '—'}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka3 ? a.Ka3.toExponential(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-xs text-dim mt-2">Values from Chang 14e Appendix.</p>
      </section>

    </div>
  )
}

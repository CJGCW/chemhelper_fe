export default function IntegratedRateReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Integrated Rate Laws</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Integrated rate laws relate concentration to time. Each order has a linear form
          useful for graphical analysis and for solving "how long" or "how much remains" problems.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '2px solid rgb(var(--color-border))' }}>
                <th className="text-left py-2 pr-4 font-semibold text-secondary">Order</th>
                <th className="text-left py-2 pr-4 font-semibold text-secondary">Integrated Form</th>
                <th className="text-left py-2 pr-4 font-semibold text-secondary">Linear Form</th>
                <th className="text-left py-2 font-semibold text-secondary">t½</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              <tr style={{ borderBottom: '1px solid rgba(var(--overlay),0.08)' }}>
                <td className="py-3 pr-4 font-semibold text-primary">0</td>
                <td className="py-3 pr-4" style={{ color: 'var(--c-halogen)' }}>[A] = [A]₀ − kt</td>
                <td className="py-3 pr-4">[A] vs t (slope = −k)</td>
                <td className="py-3">[A]₀ / 2k</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(var(--overlay),0.08)' }}>
                <td className="py-3 pr-4 font-semibold text-primary">1</td>
                <td className="py-3 pr-4" style={{ color: 'var(--c-halogen)' }}>[A] = [A]₀ e^(−kt)</td>
                <td className="py-3 pr-4">ln[A] vs t (slope = −k)</td>
                <td className="py-3">ln(2) / k</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-semibold text-primary">2</td>
                <td className="py-3 pr-4" style={{ color: 'var(--c-halogen)' }}>1/[A] = 1/[A]₀ + kt</td>
                <td className="py-3 pr-4">1/[A] vs t (slope = k)</td>
                <td className="py-3">1 / (k[A]₀)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Graphical Method</h3>
        <ul className="font-sans text-sm text-secondary flex flex-col gap-2 pl-4 list-disc">
          <li>Plot <span className="font-mono text-primary">[A] vs t</span> — straight line → 0th order</li>
          <li>Plot <span className="font-mono text-primary">ln[A] vs t</span> — straight line → 1st order</li>
          <li>Plot <span className="font-mono text-primary">1/[A] vs t</span> — straight line → 2nd order</li>
        </ul>
        <p className="font-sans text-sm text-secondary">
          The slope of the linear plot gives ±k (check sign for the order).
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-base">Worked Example — First Order</h3>
        <p className="font-sans text-sm text-secondary">
          N₂O₅ decomposes with k = 5.1 × 10⁻⁴ s⁻¹ and [N₂O₅]₀ = 0.0200 M.
          Find [N₂O₅] after 500 s.
        </p>
        <div className="flex flex-col gap-2 font-mono text-sm text-secondary p-4 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          <p>ln[A] = ln[A]₀ − kt</p>
          <p>ln[A] = ln(0.0200) − (5.1×10⁻⁴)(500)</p>
          <p>ln[A] = −3.912 − 0.255 = −4.167</p>
          <p>[A] = e^(−4.167) = <span style={{ color: 'var(--c-halogen)' }}>0.0154 M</span></p>
        </div>
      </section>

    </div>
  )
}

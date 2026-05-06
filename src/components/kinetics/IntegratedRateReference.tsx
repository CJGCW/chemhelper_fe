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

        {/* Mini linear-form plots — each order has exactly one straight-line transform */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Zero order',   yLabel: '[A] vs t',   slope: 'slope = −k', pts: [[0, 1.0], [10, 0.0]], xMax: 10, yMin: 0,    yMax: 1   },
            { label: 'First order',  yLabel: 'ln[A] vs t', slope: 'slope = −k', pts: [[0, 0.0], [5, -2.5]], xMax: 5,  yMin: -2.5, yMax: 0   },
            { label: 'Second order', yLabel: '1/[A] vs t', slope: 'slope = +k', pts: [[0, 1.0], [5, 3.5]],  xMax: 5,  yMin: 1,    yMax: 3.5 },
          ].map(({ label, yLabel, slope, pts, xMax, yMin, yMax }) => {
            const W = 192, H = 132, ML = 38, MR = 10, MT = 14, MB = 24
            const PW = W - ML - MR, PH = H - MT - MB
            const toX = (x: number) => ML + (x / xMax) * PW
            const toY = (y: number) => MT + PH - ((y - yMin) / (yMax - yMin)) * PH
            const a = pts[0], b = pts[1]
            return (
              <div key={label} className="flex flex-col gap-1">
                <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{label}</p>
                <svg width={W} height={H} className="block border border-border rounded-sm"
                  style={{ background: 'rgb(var(--color-surface))' }}>
                  {[0, 0.5, 1].map(frac => {
                    const ys = MT + frac * PH
                    const yv = (yMax - frac * (yMax - yMin)).toFixed(1)
                    return (
                      <g key={frac}>
                        <line x1={ML} y1={ys} x2={ML + PW} y2={ys} stroke="rgba(var(--overlay),0.07)" strokeWidth={1} />
                        <text x={ML - 3} y={ys + 3} textAnchor="end" fontSize={8} fontFamily="monospace" fill="rgba(var(--overlay),0.35)">{yv}</text>
                      </g>
                    )
                  })}
                  <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="rgba(var(--overlay),0.25)" strokeWidth={1} />
                  <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="rgba(var(--overlay),0.25)" strokeWidth={1} />
                  {[0, xMax / 2, xMax].map(x => (
                    <text key={x} x={toX(x)} y={MT + PH + 13} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="rgba(var(--overlay),0.35)">{x}</text>
                  ))}
                  <text x={ML + PW / 2} y={H - 1} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="rgba(var(--overlay),0.4)">t (s)</text>
                  <text x={10} y={MT + PH / 2} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="rgba(var(--overlay),0.4)"
                    transform={`rotate(-90, 10, ${MT + PH / 2})`}>{yLabel}</text>
                  <line x1={toX(a[0])} y1={toY(a[1])} x2={toX(b[0])} y2={toY(b[1])} stroke="var(--c-halogen)" strokeWidth={2} strokeLinecap="round" />
                  <text x={ML + 4} y={MT + 11} fontSize={9} fontFamily="sans-serif" fill="rgba(var(--overlay),0.65)">{yLabel}</text>
                  <text x={ML + PW * 0.55} y={MT + PH * 0.25} fontSize={8} fontFamily="monospace" fill="rgba(var(--overlay),0.5)">{slope}</text>
                </svg>
              </div>
            )
          })}
        </div>
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

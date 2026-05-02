export default function KpKcReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">K<sub>p</sub> and K<sub>c</sub></h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For gas-phase reactions, equilibrium can be expressed using either molar concentrations (K<sub>c</sub>)
          or partial pressures (K<sub>p</sub>). They are related by:
        </p>
        <div className="rounded-sm p-4 font-mono text-base text-center text-primary"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          K<sub>p</sub> = K<sub>c</sub> (RT)<sup>\u0394n</sup>
        </div>
        <div className="grid grid-cols-2 gap-3 font-mono text-sm">
          {[
            { sym: 'R', val: '0.08206 L\u00b7atm/(mol\u00b7K)' },
            { sym: 'T', val: 'Temperature in Kelvin' },
            { sym: '\u0394n', val: 'moles gas products \u2212 moles gas reactants' },
          ].map(({ sym, val }) => (
            <div key={sym} className="flex gap-2 items-start col-span-1">
              <span className="text-primary w-6 shrink-0">{sym}</span>
              <span className="text-secondary">{val}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Computing \u0394n</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          \u0394n counts only <strong className="text-primary">gaseous</strong> species. Solids, liquids, and aqueous species are not counted.
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              eq: 'N\u2082O\u2084(g) \u21cc 2NO\u2082(g)',
              calc: '\u0394n = 2 \u2212 1 = +1',
              result: 'K\u209a = K\u2099(RT)\u00b9 = K\u2099(RT)',
            },
            {
              eq: 'H\u2082(g) + I\u2082(g) \u21cc 2HI(g)',
              calc: '\u0394n = 2 \u2212 (1+1) = 0',
              result: 'K\u209a = K\u2099(RT)\u2070 = K\u2099',
            },
            {
              eq: 'N\u2082(g) + 3H\u2082(g) \u21cc 2NH\u2083(g)',
              calc: '\u0394n = 2 \u2212 4 = \u22122',
              result: 'K\u209a = K\u2099(RT)\u207b\u00b2 = K\u2099/(RT)\u00b2',
            },
          ].map(({ eq, calc, result }) => (
            <div key={eq} className="rounded-sm p-3"
              style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-sm text-primary">{eq}</p>
              <p className="font-mono text-xs text-secondary mt-1">{calc} &nbsp;\u2192&nbsp; {result}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">When K<sub>p</sub> = K<sub>c</sub></h3>
        <div className="rounded-sm p-4"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-sans text-sm text-secondary leading-relaxed">
            When <span className="font-mono text-primary">Δn = 0</span>, the number of moles of gas is the same
            on both sides of the equation. Then (RT)⁰ = 1, so{' '}
            <span className="font-mono text-primary">K<sub>p</sub> = K<sub>c</sub></span>.
          </p>
          <p className="font-sans text-sm text-secondary mt-2 leading-relaxed">
            Example: H₂(g) + I₂(g) ⇌ 2HI(g) &nbsp;&mdash;&nbsp; Δn = 0, so K<sub>p</sub> = K<sub>c</sub> = 54.3 at 698 K.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Worked Example</h3>
        <p className="font-sans text-sm text-secondary">
          For N₂O₄(g) ⇌ 2NO₂(g) at 25°C: K<sub>c</sub> = 4.63 × 10<sup>-3</sup>.
          Find K<sub>p</sub>.
        </p>
        <div className="rounded-sm p-4 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-secondary">T = 298 K, R = 0.08206, Δn = +1</p>
          <p className="font-mono text-sm text-primary">K<sub>p</sub> = K<sub>c</sub> × (RT)¹ = 4.63×10⁻³ × (0.08206 × 298)</p>
          <p className="font-mono text-sm text-primary">K<sub>p</sub> = 4.63×10⁻³ × 24.45 = 0.113</p>
        </div>
      </section>

    </div>
  )
}

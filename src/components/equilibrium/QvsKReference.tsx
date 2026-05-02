export default function QvsKReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">The Reaction Quotient Q</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Q has the <em>same form</em> as K, but uses <em>current</em> (non-equilibrium) concentrations or pressures.
          Comparing Q to K tells us which direction the reaction must shift to reach equilibrium.
        </p>
        <div className="rounded-sm p-4 font-mono text-base text-center text-primary"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          Q<sub>c</sub> = [C]<sub>current</sub><sup>c</sup> [D]<sub>current</sub><sup>d</sup> / [A]<sub>current</sub><sup>a</sup> [B]<sub>current</sub><sup>b</sup>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Q vs K: Three Cases</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              condition: 'Q < K',
              shift: 'Forward (left \u2192 right)',
              reason: 'Too few products relative to equilibrium. The reaction produces more products until Q rises to equal K.',
              color: 'rgb(34 197 94)',
              bg: 'rgba(34,197,94,0.05)',
            },
            {
              condition: 'Q = K',
              shift: 'At equilibrium',
              reason: 'The system is at equilibrium. No net change occurs.',
              color: 'var(--c-halogen)',
              bg: 'rgba(139,92,246,0.05)',
            },
            {
              condition: 'Q > K',
              shift: 'Reverse (right \u2192 left)',
              reason: 'Too many products relative to equilibrium. The reaction consumes products until Q falls back to K.',
              color: 'rgb(239 68 68)',
              bg: 'rgba(239,68,68,0.05)',
            },
          ].map(({ condition, shift, reason, color, bg }) => (
            <div key={condition} className="rounded-sm p-4 flex flex-col gap-1.5"
              style={{ background: bg, border: `1px solid ${color}30` }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold" style={{ color }}>{condition}</span>
                <span className="font-sans text-sm text-primary font-medium">\u2192 Shift {shift}</span>
              </div>
              <p className="font-sans text-sm text-secondary leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Worked Example</h3>
        <p className="font-sans text-sm text-secondary">
          For <span className="font-mono text-primary">N\u2082O\u2084(g) \u21cc 2NO\u2082(g)</span>, K<sub>c</sub> = 4.63 \u00d7 10<sup>-3</sup>.
          At some moment, [N\u2082O\u2084] = 0.100 M and [NO\u2082] = 0.0200 M.
        </p>
        <div className="rounded-sm p-4 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-primary">Q = [NO\u2082]\u00b2 / [N\u2082O\u2084] = (0.0200)\u00b2 / 0.100 = 4.00 \u00d7 10\u207b\u00b3</p>
          <p className="font-mono text-sm text-secondary">Q = 4.00 \u00d7 10\u207b\u00b3 &lt; K = 4.63 \u00d7 10\u207b\u00b3</p>
          <p className="font-sans text-sm text-primary mt-1">Since Q &lt; K, the reaction shifts <strong>forward</strong> (more NO\u2082 forms).</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Key Points</h3>
        <ul className="flex flex-col gap-2 font-sans text-sm text-secondary leading-relaxed list-none">
          <li className="flex gap-2"><span className="text-primary">&#x2022;</span> Q and K have the same mathematical form — Q is K evaluated at any moment, not just equilibrium.</li>
          <li className="flex gap-2"><span className="text-primary">&#x2022;</span> Omit solids and liquids in Q, just as in K.</li>
          <li className="flex gap-2"><span className="text-primary">&#x2022;</span> Q can be calculated at any time; K is constant at a given temperature.</li>
          <li className="flex gap-2"><span className="text-primary">&#x2022;</span> The direction of shift tells you which side of the equation is being favored.</li>
        </ul>
      </section>

    </div>
  )
}

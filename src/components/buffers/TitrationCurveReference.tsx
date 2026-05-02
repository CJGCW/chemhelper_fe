export default function TitrationCurveReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">What is a Titration Curve?</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A titration curve plots pH vs. volume of titrant added. The shape reveals whether the analyte is a
          strong or weak acid/base, the equivalence point pH, and the buffer region. They are essential for
          selecting the correct indicator and understanding the chemistry of neutralization.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">The Four Curve Types</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: 'Strong Acid + Strong Base',
              example: 'HCl + NaOH',
              equivPH: 'pH = 7.0',
              features: 'Steep S-curve, sharp equivalence, no buffer region.',
            },
            {
              title: 'Weak Acid + Strong Base',
              example: 'CH₃COOH + NaOH',
              equivPH: 'pH > 7',
              features: 'Shallow initial curve, buffer region, gentler equivalence point.',
            },
            {
              title: 'Strong Base + Strong Acid',
              example: 'NaOH + HCl',
              equivPH: 'pH = 7.0',
              features: 'Mirror image of SA+SB curve (starts basic, falls to neutral).',
            },
            {
              title: 'Weak Base + Strong Acid',
              example: 'NH₃ + HCl',
              equivPH: 'pH < 7',
              features: 'Starts basic, buffer region, equivalence pH acidic.',
            },
          ].map(t => (
            <div key={t.title} className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
              <p className="font-sans text-sm font-medium text-primary">{t.title}</p>
              <p className="font-mono text-xs text-secondary">e.g. {t.example}</p>
              <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>Equiv. point: {t.equivPH}</p>
              <p className="font-sans text-xs text-secondary">{t.features}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Key Features</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary font-normal">Feature</th>
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary font-normal">Strong Acid</th>
                <th className="text-left py-2 font-mono text-xs text-secondary font-normal">Weak Acid</th>
              </tr>
            </thead>
            <tbody className="font-sans text-sm">
              {[
                ['Equivalence pH',      '= 7.0',              '> 7 (conjugate base hydrolyzes)'],
                ['Half-equivalence',    'not applicable',      'pH = pKa'],
                ['Buffer region',       'none',                 'pKa ± 1 before equiv. point'],
                ['Initial pH',         'low (strong acid)',    'higher (weak acid, partial dissoc.)'],
                ['After equivalence',  'excess OH⁻ → pH rises steeply', 'same as SA+SB'],
              ].map(([feat, sa, wa]) => (
                <tr key={feat as string} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 font-medium text-primary">{feat}</td>
                  <td className="py-1.5 pr-4 text-secondary">{sa}</td>
                  <td className="py-1.5 text-secondary">{wa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Half-Equivalence Point</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          At the half-equivalence point (V = V<sub>equiv</sub>/2), exactly half the weak acid has been converted
          to its conjugate base, so [HA] = [A⁻]. By Henderson-Hasselbalch:
        </p>
        <div className="p-3 rounded-sm border border-border bg-raised">
          <p className="font-mono text-sm text-center" style={{ color: 'var(--c-halogen)' }}>
            pH = pKa + log(1) = pKa
          </p>
        </div>
        <p className="font-sans text-sm text-secondary">
          This is the most reliable way to determine pKa experimentally from a titration curve.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Indicator Selection</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Choose an indicator whose color-change range (pKa ± 1) brackets the equivalence point pH.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary font-normal">Indicator</th>
                <th className="text-left py-2 pr-4 font-mono text-xs text-secondary font-normal">pH Range</th>
                <th className="text-left py-2 font-mono text-xs text-secondary font-normal">Best For</th>
              </tr>
            </thead>
            <tbody className="font-sans text-sm">
              {[
                ['Methyl orange',   '3.1 – 4.4', 'SA + SB (acid side)'],
                ['Methyl red',      '4.4 – 6.2', 'SA + SB'],
                ['Bromothymol blue','6.0 – 7.6', 'SA + SB (near neutral)'],
                ['Phenolphthalein', '8.2 – 10.0','WA + SB (basic equiv. point)'],
                ['Alizarin yellow', '10.1 – 12.0','SB + SA (highly basic)'],
              ].map(([name, range, use]) => (
                <tr key={name as string} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-primary">{name}</td>
                  <td className="py-1.5 pr-4 font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{range}</td>
                  <td className="py-1.5 text-secondary text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

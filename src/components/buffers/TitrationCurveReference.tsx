type CurveType = 'SA_SB' | 'WA_SB' | 'SB_SA' | 'WB_SA'

const EPS = 1e-9

// pH at volume V mL of 0.1 M titrant added to 25 mL of 0.1 M analyte
function titrationPH(type: CurveType, V: number): number {
  const Va = 25, Veq = 25

  if (type === 'SA_SB') {
    if (V >= Veq) {
      const excess = V - Veq
      if (excess < 0.01) return 7
      return 14 + Math.log10(Math.max(0.1 * excess / (Va + V), EPS))
    }
    return -Math.log10(Math.max(0.1 * (Veq - V) / (Va + V), EPS))
  }

  if (type === 'WA_SB') {
    const pKa = 4.74
    if (V <= 0) return 0.5 * (pKa + 1)        // initial weak-acid pH
    if (V < Veq) return pKa + Math.log10(V / (Veq - V))   // Henderson-Hasselbalch
    const excess = V - Veq
    if (excess < 0.01) return 7 + 0.5 * pKa + 0.5 * Math.log10(0.05)  // ≈ 8.72
    return 14 + Math.log10(Math.max(0.1 * excess / (Va + V), EPS))
  }

  if (type === 'SB_SA') {
    if (V >= Veq) {
      const excess = V - Veq
      if (excess < 0.01) return 7
      return -Math.log10(Math.max(0.1 * excess / (Va + V), EPS))
    }
    return 14 + Math.log10(Math.max(0.1 * (Veq - V) / (Va + V), EPS))
  }

  // WB_SA — NH3 + HCl
  const pKb = 4.74
  if (V <= 0) return 14 - 0.5 * (pKb + 1)    // initial weak-base pH ≈ 11.13
  if (V < Veq) return 14 - pKb - Math.log10(V / (Veq - V))
  const excess = V - Veq
  if (excess < 0.01) return 7 - 0.5 * pKb + 0.5 * Math.log10(0.05)  // ≈ 3.98
  return -Math.log10(Math.max(0.1 * excess / (Va + V), EPS))
}

function MiniTitrationCurve({ type, title, equivPH }: {
  type: CurveType; title: string; equivPH: string
}) {
  const W = 232, H = 150, ML = 30, MR = 8, MT = 14, MB = 22
  const PW = W - ML - MR, PH = H - MT - MB
  const Veq = 25

  const toX = (v: number) => ML + (v / 50) * PW
  const toY = (ph: number) => MT + PH - (ph / 14) * PH

  const N = 120
  const pts = Array.from({ length: N }, (_, i) => {
    const V = (i / (N - 1)) * 50
    const ph = Math.max(0, Math.min(14, titrationPH(type, V)))
    return { x: toX(V), y: toY(ph) }
  })

  // Break path at the equivalence-point inflection (sharp jump > 18 px)
  const segs: string[] = []
  let cur = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i].y - pts[i - 1].y) > 18) {
      segs.push(cur)
      cur = `M ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`
    } else {
      cur += ` L ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`
    }
  }
  segs.push(cur)

  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{title}</p>
      <svg width={W} height={H} className="block border border-border rounded-sm"
        style={{ background: 'rgb(var(--color-surface))' }}>
        {/* Horizontal grid at pH 0, 7, 14 */}
        {[0, 7, 14].map(ph => (
          <g key={ph}>
            <line x1={ML} y1={toY(ph)} x2={ML + PW} y2={toY(ph)}
              stroke={ph === 7 ? 'rgba(var(--overlay),0.12)' : 'rgba(var(--overlay),0.06)'}
              strokeWidth={1} />
            <text x={ML - 3} y={toY(ph) + 3} textAnchor="end" fontSize={8} fontFamily="monospace"
              fill="rgba(var(--overlay),0.35)">{ph}</text>
          </g>
        ))}
        {/* Axes */}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="rgba(var(--overlay),0.25)" strokeWidth={1} />
        <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="rgba(var(--overlay),0.25)" strokeWidth={1} />
        {/* x tick labels */}
        {[0, 25, 50].map(v => (
          <text key={v} x={toX(v)} y={MT + PH + 13} textAnchor="middle" fontSize={8}
            fontFamily="monospace" fill="rgba(var(--overlay),0.35)">{v}</text>
        ))}
        {/* Axis labels */}
        <text x={ML + PW / 2} y={H - 1} textAnchor="middle" fontSize={8} fontFamily="monospace"
          fill="rgba(var(--overlay),0.4)">mL titrant</text>
        <text x={9} y={MT + PH / 2} textAnchor="middle" fontSize={8} fontFamily="monospace"
          fill="rgba(var(--overlay),0.4)" transform={`rotate(-90, 9, ${MT + PH / 2})`}>pH</text>
        {/* Equivalence point dashed line */}
        <line x1={toX(Veq)} y1={MT} x2={toX(Veq)} y2={MT + PH}
          stroke="rgba(var(--overlay),0.2)" strokeWidth={1} strokeDasharray="3 2" />
        <text x={toX(Veq) + 3} y={MT + 9} fontSize={7} fontFamily="monospace"
          fill="rgba(var(--overlay),0.4)">{equivPH}</text>
        {/* Titration curve — may be two segments split at equiv point */}
        {segs.map((d, i) => (
          <path key={i} d={d} stroke="var(--c-halogen)" strokeWidth={2} fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </div>
  )
}

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
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Curve Shapes</h3>
        <p className="font-sans text-sm text-secondary">
          Each titration type produces a distinctive pH-vs-volume curve. The dashed line marks the
          equivalence point (25 mL of 0.1 M titrant into 25 mL of 0.1 M analyte).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MiniTitrationCurve type="SA_SB" title="Strong Acid + Strong Base" equivPH="pH 7" />
          <MiniTitrationCurve type="WA_SB" title="Weak Acid + Strong Base"   equivPH="pH > 7" />
          <MiniTitrationCurve type="SB_SA" title="Strong Base + Strong Acid" equivPH="pH 7" />
          <MiniTitrationCurve type="WB_SA" title="Weak Base + Strong Acid"   equivPH="pH < 7" />
        </div>
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

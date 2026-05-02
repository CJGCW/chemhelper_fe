import PhScale from '../shared/PhScale'

export default function PhCalculatorReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* pH Scale visualization */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">pH Scale (0–14)</h3>
        <div className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <PhScale pH={null} />
          <div className="flex flex-col gap-2 mt-4">
            {[
              { pH: 1.0,  label: '1.0 M HCl (strong acid)',         },
              { pH: 2.87, label: '0.1 M CH₃COOH (weak acid)',        },
              { pH: 4.0,  label: 'Beer / tomato juice',               },
              { pH: 7.0,  label: 'Pure water at 25°C',                },
              { pH: 9.25, label: '0.1 M NH₃ (weak base)',             },
              { pH: 13.0, label: '0.1 M NaOH (strong base)',          },
            ].map(({ pH, label }) => (
              <div key={pH} className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <PhScale pH={pH} />
                </div>
                <span className="font-mono text-xs text-secondary">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core formulas */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Key Formulas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { formula: 'pH = −log[H⁺]',    desc: 'pH from hydrogen ion concentration' },
            { formula: 'pOH = −log[OH⁻]',  desc: 'pOH from hydroxide concentration' },
            { formula: 'pH + pOH = 14',     desc: 'Relationship at 25°C (Kw = 10⁻¹⁴)' },
            { formula: '[H⁺][OH⁻] = 10⁻¹⁴', desc: 'Ion product of water (Kw)' },
            { formula: '[H⁺] = 10⁻ᵖᴴ',     desc: 'H⁺ concentration from pH' },
            { formula: '[OH⁻] = 10⁻ᵖᴼᴴ',   desc: 'OH⁻ concentration from pOH' },
          ].map(({ formula, desc }) => (
            <div key={formula} className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-sm font-semibold text-primary">{formula}</p>
              <p className="font-sans text-xs text-secondary mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Strong vs weak */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Strong vs Weak</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-sm w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-surface))' }}>
                <th className="border border-border px-3 py-2 text-left text-secondary font-normal text-xs">Property</th>
                <th className="border border-border px-3 py-2 text-left text-xs" style={{ color: 'var(--c-halogen)' }}>Strong Acid</th>
                <th className="border border-border px-3 py-2 text-left text-xs text-blue-400">Weak Acid</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Dissociation', 'Complete (100%)', 'Partial (often < 5%)'],
                ['Example', 'HCl, HNO₃, HClO₄', 'CH₃COOH, HF, HCN'],
                ['pH formula', 'pH = −log(C)', 'Requires ICE table'],
                ['Conductivity', 'High', 'Low'],
              ].map(([prop, strong, weak]) => (
                <tr key={prop}>
                  <td className="border border-border px-3 py-1.5 text-secondary text-xs">{prop}</td>
                  <td className="border border-border px-3 py-1.5 text-primary text-xs">{strong}</td>
                  <td className="border border-border px-3 py-1.5 text-primary text-xs">{weak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Common strong acids/bases */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Common Strong Acids & Bases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-xs text-secondary mb-2">Strong Acids (memorize all 6+1)</p>
            <div className="flex flex-col gap-1">
              {['HCl', 'HBr', 'HI', 'HNO₃', 'HClO₄', 'HClO₃', 'H₂SO₄ (first H only)'].map(a => (
                <span key={a} className="font-mono text-sm text-primary px-2 py-0.5 rounded-sm"
                  style={{ background: 'rgb(var(--color-surface))' }}>{a}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary mb-2">Strong Bases (Group 1 & 2 hydroxides)</p>
            <div className="flex flex-col gap-1">
              {['LiOH, NaOH, KOH, RbOH, CsOH', 'Ca(OH)₂, Sr(OH)₂, Ba(OH)₂'].map(b => (
                <span key={b} className="font-mono text-sm text-primary px-2 py-0.5 rounded-sm"
                  style={{ background: 'rgb(var(--color-surface))' }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

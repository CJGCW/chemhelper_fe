import { WEAK_ACIDS, WEAK_BASES, POLYPROTIC_ACIDS, Kw } from '../../data/acidBaseConstants'

export default function KaKbReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Formulas */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Ka / Kb Relationships</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { formula: 'Ka × Kb = Kw = 1.0 × 10⁻¹⁴', desc: 'Conjugate pair relationship at 25°C' },
            { formula: 'pKa = −log Ka',                  desc: 'pKa from Ka' },
            { formula: 'pKb = −log Kb',                  desc: 'pKb from Kb' },
            { formula: 'pKa + pKb = 14',                 desc: 'For conjugate pair' },
            { formula: 'Kb = Kw / Ka',                   desc: 'Find Kb from Ka of conjugate acid' },
            { formula: 'Ka = Kw / Kb',                   desc: 'Find Ka from Kb of conjugate base' },
          ].map(({ formula, desc }) => (
            <div key={formula} className="p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-mono text-sm font-semibold text-primary">{formula}</p>
              <p className="font-sans text-xs text-secondary mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-dim mt-2">
          Kw = {Kw.toExponential(1)} (ion product of water at 25°C)
        </p>
      </section>

      {/* Weak acids table */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Weak Acids — Ka Values (Chang Appendix)</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-surface))' }}>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Acid</th>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Name</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">pKa</th>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Conjugate Base</th>
              </tr>
            </thead>
            <tbody>
              {WEAK_ACIDS.map(a => (
                <tr key={a.formula}>
                  <td className="border border-border px-3 py-1 text-primary font-medium">{a.formula}</td>
                  <td className="border border-border px-3 py-1 text-secondary">{a.name}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka.toExponential(1)}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.pKa.toFixed(2)}</td>
                  <td className="border border-border px-3 py-1 text-secondary">{a.conjugateBase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Weak bases table */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Weak Bases — Kb Values (Chang Appendix)</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-surface))' }}>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Base</th>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Name</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Kb</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">pKb</th>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Conjugate Acid</th>
              </tr>
            </thead>
            <tbody>
              {WEAK_BASES.map(b => (
                <tr key={b.formula}>
                  <td className="border border-border px-3 py-1 text-primary font-medium">{b.formula}</td>
                  <td className="border border-border px-3 py-1 text-secondary">{b.name}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{b.Kb.toExponential(1)}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{b.pKb.toFixed(2)}</td>
                  <td className="border border-border px-3 py-1 text-secondary">{b.conjugateAcid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Polyprotic */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Polyprotic Acids</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-surface))' }}>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Acid</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka1</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka2</th>
                <th className="border border-border px-3 py-1.5 text-right text-secondary font-normal">Ka3</th>
              </tr>
            </thead>
            <tbody>
              {POLYPROTIC_ACIDS.map(a => (
                <tr key={a.formula}>
                  <td className="border border-border px-3 py-1 text-primary font-medium">{a.name} ({a.formula})</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka.toExponential(1)}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka2 ? a.Ka2.toExponential(1) : '—'}</td>
                  <td className="border border-border px-3 py-1 text-right text-primary">{a.Ka3 ? a.Ka3.toExponential(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

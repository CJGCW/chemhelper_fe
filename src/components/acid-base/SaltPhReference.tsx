export default function SaltPhReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Classification rules */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Salt pH Classification</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              salt: 'Strong Acid + Strong Base',
              example: 'NaCl, KNO₃',
              pH: 'Neutral (pH = 7)',
              color: '#22c55e',
              reason: 'Neither Na⁺ nor Cl⁻ hydrolyzes — no change to [H⁺].',
            },
            {
              salt: 'Weak Acid + Strong Base',
              example: 'NaCH₃COO, NaF, NaCN',
              pH: 'Basic (pH > 7)',
              color: '#6366f1',
              reason: 'Conjugate base A⁻ hydrolyzes: A⁻ + H₂O ⇌ HA + OH⁻. Kb = Kw/Ka.',
            },
            {
              salt: 'Strong Acid + Weak Base',
              example: 'NH₄Cl, CH₃NH₃Cl',
              pH: 'Acidic (pH < 7)',
              color: '#ef4444',
              reason: 'Conjugate acid BH⁺ ionizes: BH⁺ ⇌ B + H⁺. Ka = Kw/Kb.',
            },
            {
              salt: 'Weak Acid + Weak Base',
              example: 'NH₄CH₃COO',
              pH: 'Compare Ka vs Kb',
              color: '#f97316',
              reason: 'Ka > Kb → acidic; Ka < Kb → basic; Ka ≈ Kb → ≈neutral.',
            },
          ].map(({ salt, example, pH, color, reason }) => (
            <div key={salt} className="p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-mono text-sm font-semibold text-primary">{salt}</p>
                  <p className="font-mono text-xs text-secondary mt-0.5">e.g. {example}</p>
                </div>
                <span className="font-mono text-sm font-bold whitespace-nowrap" style={{ color }}>
                  {pH}
                </span>
              </div>
              <p className="font-sans text-xs text-secondary mt-2">{reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decision tree */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Decision Tree</h3>
        <div className="p-4 rounded-sm border border-border font-mono text-xs" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="text-primary">1. Identify the parent acid and base of the salt.</p>
          <p className="text-secondary mt-2">   Strong acid + Strong base? → pH = 7</p>
          <p className="text-secondary mt-1">   Weak acid + Strong base? → A⁻ hydrolyzes → basic</p>
          <p className="text-secondary mt-1">      Kb(A⁻) = Kw / Ka(HA)</p>
          <p className="text-secondary mt-1">      Use weakBasePh(C, Kb_conj)</p>
          <p className="text-secondary mt-2">   Strong acid + Weak base? → BH⁺ ionizes → acidic</p>
          <p className="text-secondary mt-1">      Ka(BH⁺) = Kw / Kb(B)</p>
          <p className="text-secondary mt-1">      Use weakAcidPh(C, Ka_conj)</p>
        </div>
      </section>

      {/* Example table */}
      <section>
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary mb-3">Common Salts</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs w-full border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-surface))' }}>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Salt</th>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Parent Acid</th>
                <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal">Parent Base</th>
                <th className="border border-border px-3 py-1.5 text-center text-secondary font-normal">pH</th>
              </tr>
            </thead>
            <tbody>
              {[
                { salt: 'NaCl',         acid: 'HCl (strong)',         base: 'NaOH (strong)',  ph: 'Neutral' },
                { salt: 'KNO₃',        acid: 'HNO₃ (strong)',        base: 'KOH (strong)',   ph: 'Neutral' },
                { salt: 'NaCH₃COO',   acid: 'CH₃COOH (Ka=1.8e-5)',  base: 'NaOH (strong)',  ph: 'Basic'   },
                { salt: 'NaF',         acid: 'HF (Ka=6.8e-4)',       base: 'NaOH (strong)',  ph: 'Basic'   },
                { salt: 'NaCN',        acid: 'HCN (Ka=6.2e-10)',     base: 'NaOH (strong)',  ph: 'Basic'   },
                { salt: 'NH₄Cl',      acid: 'HCl (strong)',         base: 'NH₃ (Kb=1.8e-5)', ph: 'Acidic'  },
                { salt: 'NH₄CH₃COO', acid: 'CH₃COOH (Ka=1.8e-5)',  base: 'NH₃ (Kb=1.8e-5)', ph: '≈Neutral'},
              ].map(({ salt, acid, base, ph }) => {
                const phColor = ph === 'Basic' ? '#6366f1' : ph === 'Acidic' ? '#ef4444' : '#22c55e'
                return (
                  <tr key={salt}>
                    <td className="border border-border px-3 py-1 text-primary font-semibold">{salt}</td>
                    <td className="border border-border px-3 py-1 text-secondary">{acid}</td>
                    <td className="border border-border px-3 py-1 text-secondary">{base}</td>
                    <td className="border border-border px-3 py-1 text-center font-semibold" style={{ color: phColor }}>{ph}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

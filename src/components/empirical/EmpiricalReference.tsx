import React from 'react'
// ── Step row ──────────────────────────────────────────────────────────────────

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="font-mono text-sm font-bold shrink-0 mt-0.5" style={{ color: 'var(--c-halogen)' }}>{n}</span>
      <div className="font-sans text-xs text-secondary leading-relaxed">{children}</div>
    </div>
  )
}

// ── Worked example card ───────────────────────────────────────────────────────

function ExampleCard({ title, question, steps, answer }: {
  title: string
  question: string
  steps: string[]
  answer: string
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
      <p className="font-mono text-xs text-secondary tracking-widest uppercase">{title}</p>
      <p className="font-sans text-sm text-secondary">{question}</p>
      <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
        {steps.map((s, i) => (
          <p key={i} className="font-mono text-xs text-primary">{s}</p>
        ))}
        <p className="font-mono text-sm font-semibold mt-1" style={{ color: 'var(--c-halogen)' }}>{answer}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EmpiricalReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Key formulas */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Formulas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Empirical Formula',  formula: 'EF = simplest whole-number ratio',   note: 'Divide all subscripts by their GCF' },
            { label: 'Molecular Formula',  formula: 'MF = n × EF',                         note: 'n = M_molecular / M_empirical' },
            { label: 'Moles from mass',    formula: 'n = m / M',                           note: 'm in g, M in g/mol' },
            { label: 'Percent to mass',    formula: 'Assume 100 g  →  % = g',              note: 'Starting point for % comp. problems' },
          ].map(({ label, formula, note }) => (
            <div key={label} className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
              <p className="font-sans text-xs font-semibold text-secondary uppercase tracking-wide">{label}</p>
              <p className="font-mono text-sm text-bright">{formula}</p>
              <p className="font-sans text-xs text-secondary">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Method */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Method — % Composition → Empirical Formula</p>
        <div className="flex flex-col gap-2">
          <Step n={1}><strong className="text-primary">Convert % to grams.</strong> Assume a 100 g sample — each element's % becomes its mass in grams directly.</Step>
          <Step n={2}><strong className="text-primary">Convert mass to moles.</strong> Divide each element's mass by its molar mass (from the periodic table).</Step>
          <Step n={3}><strong className="text-primary">Find the mole ratio.</strong> Divide all mole values by the smallest mole value.</Step>
          <Step n={4}><strong className="text-primary">Round to integers.</strong> If a ratio is within ±0.1 of an integer, round. Otherwise multiply all by 2, 3, etc. (×2 for .5, ×3 for .33, ×4 for .25).</Step>
          <Step n={5}><strong className="text-primary">Write the formula.</strong> Use the whole-number ratios as subscripts.</Step>
        </div>
      </div>

      {/* Examples */}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Examples</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <ExampleCard
            title="% Composition → Empirical Formula"
            question="A compound is 40.0% C, 6.7% H, 53.3% O. Find the empirical formula."
            steps={[
              'Assume 100 g → 40.0 g C, 6.7 g H, 53.3 g O',
              'n(C) = 40.0 / 12.01 = 3.33 mol',
              'n(H) =  6.7 / 1.008 = 6.65 mol',
              'n(O) = 53.3 / 16.00 = 3.33 mol',
              'Divide by smallest (3.33):  C:1.00  H:2.00  O:1.00',
            ]}
            answer="Empirical formula: CH₂O"
          />

          <ExampleCard
            title="Mass Data → Empirical Formula"
            question="A sample contains 2.04 g Na, 0.089 g H, and 2.84 g O. Find the empirical formula."
            steps={[
              'n(Na) = 2.04 / 22.99 = 0.0887 mol',
              'n(H)  = 0.089 / 1.008 = 0.0883 mol',
              'n(O)  = 2.84 / 16.00 = 0.1775 mol',
              'Divide by smallest (0.0883):  Na:1.00  H:1.00  O:2.01',
              'Round ratios: Na:1  H:1  O:2',
            ]}
            answer="Empirical formula: NaHO₂"
          />

          <ExampleCard
            title="Empirical → Molecular Formula"
            question="The empirical formula is CH₂O and the molar mass of the compound is 180.2 g/mol."
            steps={[
              'M(empirical) = 12.01 + 2(1.008) + 16.00 = 30.03 g/mol',
              'n = M_molecular / M_empirical',
              'n = 180.2 / 30.03 = 6.00',
              'Multiply subscripts by n = 6:  C₆H₁₂O₆',
            ]}
            answer="Molecular formula: C₆H₁₂O₆  (glucose)"
          />

          <ExampleCard
            title="% Composition → Empirical → Molecular"
            question="A compound is 85.6% C, 14.4% H, with molar mass 56.1 g/mol."
            steps={[
              'Assume 100 g → 85.6 g C, 14.4 g H',
              'n(C) = 85.6 / 12.01 = 7.13 mol',
              'n(H) = 14.4 / 1.008 = 14.3 mol',
              'Divide by smallest (7.13):  C:1.00  H:2.01 → CH₂',
              'M(EF) = 12.01 + 2(1.008) = 14.03 g/mol',
              'n = 56.1 / 14.03 = 4.00',
            ]}
            answer="Molecular formula: C₄H₈  (butylene)"
          />

        </div>
      </div>

      {/* Multiplier reference */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Common Ratio Multipliers</p>
        <div className="rounded-sm border border-border overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2 bg-raised border-b border-border">
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Decimal remainder</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Multiply by</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Example ratio</span>
          </div>
          {[
            { rem: '≈ 0.5  (½)',   mult: '× 2', ex: '1.5 → 3' },
            { rem: '≈ 0.33 (⅓)',  mult: '× 3', ex: '1.33 → 4' },
            { rem: '≈ 0.67 (⅔)',  mult: '× 3', ex: '1.67 → 5' },
            { rem: '≈ 0.25 (¼)',  mult: '× 4', ex: '1.25 → 5' },
            { rem: '≈ 0.75 (¾)',  mult: '× 4', ex: '1.75 → 7' },
          ].map(row => (
            <div key={row.rem} className="grid grid-cols-3 px-4 py-2.5 border-b border-border last:border-b-0 bg-surface">
              <span className="font-mono text-sm text-primary">{row.rem}</span>
              <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{row.mult}</span>
              <span className="font-mono text-sm text-secondary">{row.ex}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

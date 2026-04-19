export default function HessReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Main law box */}
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <p className="font-mono text-2xl font-bold text-bright">Hess's Law</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The total enthalpy change for a reaction is the same regardless of whether the reaction
          occurs in one step or multiple steps. ΔH is a state function — it depends only on the
          initial and final states, not the path.
        </p>
        <div className="pt-3 border-t border-border">
          <p className="font-mono text-sm text-primary">
            ΔH<sub>target</sub> = Σ (n<sub>i</sub> × ΔH<sub>i</sub>)
          </p>
          <p className="font-mono text-xs text-dim mt-1">
            where each ΔH<sub>i</sub> may be multiplied by n<sub>i</sub> and/or negated (if reversed)
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Rules for Manipulating Reactions</h3>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            {
              rule: 'Reversing a reaction',
              effect: 'negates ΔH',
              example: 'A → B  (ΔH = −100 kJ)  ⟶  B → A  (ΔH = +100 kJ)',
            },
            {
              rule: 'Multiplying by a factor n',
              effect: 'multiplies ΔH by n',
              example: 'A → B  (ΔH = −100 kJ)  ×2  ⟶  2A → 2B  (ΔH = −200 kJ)',
            },
            {
              rule: 'Adding reactions',
              effect: 'adds their ΔH values',
              example: 'ΔH₁ + ΔH₂ + … = ΔH_target',
            },
            {
              rule: 'Species that appear on both sides',
              effect: 'cancel out',
              example: 'Like algebraic terms — subtract them from both sides of the net equation.',
            },
          ].map(r => (
            <div key={r.rule} className="px-4 py-3 border-b border-border last:border-b-0">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-sans text-sm font-semibold text-bright">{r.rule}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>→ {r.effect}</span>
              </div>
              <p className="font-mono text-xs text-secondary">{r.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Solving Strategy</h3>
          <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2">
            {[
              'Write the target reaction',
              'Identify species that appear only in the target — these anchor which reactions to use',
              'Arrange given reactions so desired species appear on the correct side',
              'Reverse reactions as needed (negate ΔH)',
              'Scale reactions by integers or fractions (multiply ΔH)',
              'Add all reactions; cancel species that appear on both sides',
              'Verify the net equation matches the target',
              'Sum all ΔH contributions',
            ].map((s, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="font-mono text-xs text-secondary shrink-0 w-4 pt-0.5">{i + 1}.</span>
                <span className="font-sans text-xs text-secondary">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worked example */}
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example</h3>
          <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2.5">
            <p className="font-sans text-xs text-secondary">
              Find ΔH for: <span className="font-mono text-bright">2C + O₂ → 2CO</span>
            </p>
            <div className="flex flex-col gap-1 border-t border-border pt-2">
              <p className="font-mono text-xs text-dim">Given:</p>
              <p className="font-mono text-xs text-primary">(1) C + O₂ → CO₂   ΔH = −393.5 kJ</p>
              <p className="font-mono text-xs text-primary">(2) 2CO + O₂ → 2CO₂   ΔH = −566.0 kJ</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-border pt-2">
              <p className="font-mono text-xs text-dim">Steps:</p>
              <p className="font-mono text-xs text-secondary">
                Use (1)×2:  2C + 2O₂ → 2CO₂  ΔH = −787.0 kJ
              </p>
              <p className="font-mono text-xs text-secondary">
                Flip (2):   2CO₂ → 2CO + O₂   ΔH = +566.0 kJ
              </p>
              <div className="h-px bg-border my-0.5" />
              <p className="font-mono text-xs font-semibold text-emerald-400">
                Net: 2C + O₂ → 2CO   ΔH = −221.0 kJ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key points */}
      <div className="flex flex-col gap-2">
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Key Points</h3>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { point: 'State function', detail: 'ΔH depends only on initial and final states — the pathway does not matter.' },
            { point: 'Works for any path', detail: 'You can construct any sequence of reactions as long as the net equation is correct.' },
            { point: 'Related to ΔHf°', detail: 'The Hess\'s Law equation ΔHrxn = ΣΔHf°(products) − ΣΔHf°(reactants) is itself an application of Hess\'s Law.' },
            { point: 'Fractional multipliers', detail: 'Coefficients of ½, ⅓, etc. are valid when needed to balance the target equation.' },
          ].map(r => (
            <div key={r.point} className="px-4 py-2.5 border-b border-border last:border-b-0 flex gap-3">
              <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: 'var(--c-halogen)' }}>·</span>
              <div>
                <span className="font-sans text-sm font-semibold text-bright">{r.point}: </span>
                <span className="font-sans text-sm text-secondary">{r.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

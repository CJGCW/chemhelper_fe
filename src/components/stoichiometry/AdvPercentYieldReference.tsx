export default function AdvPercentYieldReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Advanced Percent Yield</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Advanced percent yield problems start from a given mass of reactant (not the theoretical yield directly)
          and require a full chain of reasoning: mass → moles → stoichiometric ratio → theoretical yield in grams → percent yield.
        </p>
      </div>

      {/* Formula */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Formula Chain</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm text-primary">
            <span>mass of reactant</span>
            <span className="text-secondary">÷ M(reactant)</span>
            <span>→ mol reactant</span>
            <span className="text-secondary">× (mol product / mol reactant)</span>
            <span>→ mol product</span>
            <span className="text-secondary">× M(product)</span>
            <span>→ theoretical yield</span>
          </div>
          <div className="mt-2 border-t border-border pt-2">
            <p className="font-mono text-sm text-primary">% yield = (actual yield / theoretical yield) × 100</p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Simple vs Advanced Percent Yield</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 p-3 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <p className="font-sans text-xs font-semibold text-primary">Simple %Y</p>
            <p className="font-sans text-xs text-secondary">Given: actual yield and theoretical yield directly.</p>
            <p className="font-mono text-xs text-secondary mt-1">%Y = (actual / theoretical) × 100</p>
          </div>
          <div className="flex flex-col gap-2 p-3 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <p className="font-sans text-xs font-semibold text-primary">Advanced %Y</p>
            <p className="font-sans text-xs text-secondary">Given: mass of reactant and actual product mass. Must compute theoretical from stoichiometry first.</p>
            <p className="font-mono text-xs text-secondary mt-1">Step 1: stoichiometry → theoretical<br />Step 2: %Y = (actual / theoretical) × 100</p>
          </div>
        </div>
      </div>

      {/* Worked example — Chang 3.91 */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">
          Worked Example — Chang 14e Example 3.13 (FeTiO₃ → TiO₂)
        </p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            Reaction: 2 FeTiO₃ + 4 Cl₂ + 3 C → 2 TiCl₄ + 3 CO₂ + 2 FeO<br />
            Then: TiCl₄ + 2 H₂O → TiO₂ + 4 HCl<br />
            Given: 8.00 g FeTiO₃. Actual TiO₂ obtained = 1.28 g. Find % yield.
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">mol FeTiO₃ = 8.00 ÷ 151.73 = 0.05272 mol</p>
            <p className="font-mono text-xs text-secondary">mol TiO₂ (theoretical) = 0.05272 × (1/1) = 0.05272 mol</p>
            <p className="font-mono text-xs text-secondary">m(TiO₂) theoretical = 0.05272 × 79.87 = 4.21 g</p>
            <p className="font-mono text-xs text-secondary">% yield = (1.28 / 4.21) × 100</p>
            <p className="font-mono text-xs text-primary font-semibold">% yield = 30.4%</p>
          </div>
        </div>
      </div>

    </div>
  )
}

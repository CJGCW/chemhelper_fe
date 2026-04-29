export default function ChainedYieldReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Multi-Step (Chained) Yield</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Industrial and synthetic reactions rarely happen in a single step. Each step has its own percent yield,
          and the yields compound: imperfect yield at step 1 reduces the input to step 2, which then suffers its
          own imperfect yield, and so on.
        </p>
      </div>

      {/* Overall yield formula */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Overall Yield Formula</p>
        <div className="rounded-sm border border-border px-4 py-3"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-base text-primary">
            Overall %Y = %Y₁ × %Y₂ × %Y₃ × … (all as decimals)
          </p>
          <p className="font-mono text-xs text-secondary mt-2">
            E.g. 80% × 75% × 90% = 0.80 × 0.75 × 0.90 = 0.54 → 54% overall
          </p>
        </div>
      </div>

      {/* Why yields compound */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Why Yields Multiply</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          If step 1 yields only 80% of the theoretical product, then step 2 starts with only 80% of what
          it could have had. If step 2 is also 80% efficient, the overall yield is 80% of 80% = 64%, not 80% + 80%.
          Multi-step syntheses with individually good yields can still produce very little overall product.
        </p>
      </div>

      {/* Worked example — Ostwald process */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — Ostwald Process (HNO₃)</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-3"
          style={{ background: 'rgb(var(--color-base))' }}>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-secondary">Step 1: 4 NH₃ + 5 O₂ → 4 NO + 6 H₂O  (%Y = 96%)</p>
            <p className="font-mono text-xs text-secondary">Step 2: 2 NO + O₂ → 2 NO₂               (%Y = 94%)</p>
            <p className="font-mono text-xs text-secondary">Step 3: 3 NO₂ + H₂O → 2 HNO₃ + NO      (%Y = 83%)</p>
          </div>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
            <p className="font-mono text-xs text-secondary">Overall %Y = 0.96 × 0.94 × 0.83</p>
            <p className="font-mono text-xs text-primary font-semibold">Overall %Y = 74.9%</p>
          </div>
          <p className="font-sans text-xs text-dim">
            Starting from a given mass of NH₃: first find theoretical HNO₃ assuming 100% yield, then multiply by 0.749.
          </p>
        </div>
      </div>

      {/* Finding required starting material */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Finding Required Starting Mass</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">To produce X g of final product at an overall yield of Y%:</p>
          <p className="font-mono text-sm text-primary mt-1">Required starting mass = X / (overall %Y as decimal)</p>
          <p className="font-mono text-xs text-secondary mt-1">
            E.g. Need 500 g HNO₃, overall yield = 74.9%: required NH₃ = 500 / 0.749 = 668 g (before stoichiometry)
          </p>
        </div>
      </div>

    </div>
  )
}

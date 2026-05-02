export default function ConcentrationCellReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Concentration Cells</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A concentration cell is a galvanic cell in which both electrodes are made of the same metal,
          but the two half-cells contain different concentrations of the same ion. The E° for the
          overall cell is zero — all the voltage comes from the concentration gradient, described by
          the Nernst equation.
        </p>
      </div>

      {/* Formula */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">EMF Formula</p>
        <div className="flex flex-col gap-3">
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">E = (RT / nF) × ln([C_high] / [C_low])</p>
            <p className="font-mono text-xs text-secondary mt-1">
              General form valid at any temperature T (Kelvin).
            </p>
          </div>
          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">E = (0.05916 / n) × log₁₀([C_high] / [C_low])  (at 25°C)</p>
            <p className="font-mono text-xs text-secondary mt-1">
              At 25°C only. Derived from RT/F = 0.02569 V; multiplied by ln(10) = 2.3026 → 0.05916 V.
            </p>
          </div>
        </div>
      </div>

      {/* Variable table */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Variable Definitions</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Symbol</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Meaning</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Unit</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['E',       'Cell EMF',                     'V'],
                ['R',       'Gas constant',                 '8.314 J/(mol·K)'],
                ['T',       'Temperature',                  'K'],
                ['n',       'Electrons transferred',        'mol e⁻/mol rxn'],
                ['F',       'Faraday constant',             '96,485 C/mol'],
                ['C_high',  'Higher concentration',         'mol/L'],
                ['C_low',   'Lower concentration',          'mol/L'],
              ].map(([sym, desc, unit]) => (
                <tr key={sym} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-primary font-semibold">{sym}</td>
                  <td className="px-4 py-2 text-secondary">{desc}</td>
                  <td className="px-4 py-2 text-dim">{unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conceptual explanation */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Concepts</p>
        <div className="flex flex-col gap-2">
          {[
            { icon: '→', text: 'Electrons flow from the low-concentration electrode (anode, oxidation) to the high-concentration electrode (cathode, reduction).' },
            { icon: '=', text: 'E° = 0 because both half-reactions are identical — the standard potentials cancel exactly.' },
            { icon: '↘', text: 'EMF decreases as concentrations equalize. At equilibrium, E = 0 and both concentrations are equal.' },
            { icon: '⚡', text: 'The driving force is purely thermodynamic: the system minimizes ΔG by mixing concentrations via electron flow.' },
          ].map(r => (
            <div key={r.icon} className="flex items-start gap-3 rounded-sm border border-border px-4 py-3"
              style={{ background: 'rgb(var(--color-base))' }}>
              <span className="font-mono text-sm text-secondary shrink-0 w-4">{r.icon}</span>
              <p className="font-sans text-sm text-secondary">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            Cu electrode in 1.0 M CuSO₄ vs. Cu electrode in 0.010 M CuSO₄. n = 2.
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">E° = 0 (same half-reaction both sides)</p>
            <p className="font-mono text-xs text-secondary">E = (0.05916/2) × log₁₀(1.0/0.010)</p>
            <p className="font-mono text-xs text-secondary">E = 0.02958 × log₁₀(100)</p>
            <p className="font-mono text-xs text-secondary">E = 0.02958 × 2</p>
            <p className="font-mono text-xs text-primary font-semibold">E = +0.0592 V</p>
            <p className="font-mono text-xs text-dim mt-1">
              Anode (low conc.): Cu → Cu²⁺(0.010 M) + 2e⁻<br/>
              Cathode (high conc.): Cu²⁺(1.0 M) + 2e⁻ → Cu
            </p>
          </div>
        </div>
      </div>

      {/* EMF vs concentration ratio */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">EMF vs Concentration Ratio (n=1, 25°C)</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">[C_high]/[C_low]</th>
                <th className="px-4 py-2 text-right text-xs tracking-widest text-secondary uppercase border-b border-border">log₁₀(ratio)</th>
                <th className="px-4 py-2 text-right text-xs tracking-widest text-secondary uppercase border-b border-border">E (V, n=1)</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 0, 0],
                [10, 1, 0.05916],
                [100, 2, 0.11832],
                [1000, 3, 0.17748],
                [1e6, 6, 0.35496],
              ].map(([ratio, logR, E]) => (
                <tr key={String(ratio)} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-secondary">{Number(ratio).toExponential(0)}</td>
                  <td className="px-4 py-2 text-secondary text-right">{logR}</td>
                  <td className="px-4 py-2 text-primary font-semibold text-right">{Number(E).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-sans text-xs text-dim">
        Chang 14e Section 18.3. E = (0.05916/n) log([high]/[low]) at 25°C.
      </p>
    </div>
  )
}

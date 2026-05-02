export default function GibbsReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      {/* Definition */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Gibbs Free Energy</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          <strong className="text-primary">Gibbs free energy</strong> (G) combines enthalpy and entropy into a single state function that
          predicts spontaneity at constant T and P. A reaction is spontaneous when ΔG° &lt; 0,
          at equilibrium when ΔG° = 0, and non-spontaneous when ΔG° &gt; 0.
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised font-mono text-sm flex flex-col gap-2">
          <p className="text-primary">ΔG° = ΔH° − T·ΔS°</p>
          <p className="text-secondary text-xs">T in Kelvin; ΔS° must be converted: J/(mol·K) → kJ/(mol·K) by dividing by 1000</p>
        </div>
      </section>

      {/* Three Methods */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Three Methods to Calculate ΔG°</h3>

        <div className="flex flex-col gap-4">
          {/* Method 1 */}
          <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
            <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>Method 1: ΔG° = ΔH° − T·ΔS°</p>
            <p className="font-sans text-sm text-secondary">
              Use when ΔH° and ΔS° are given (or calculated from formation values / Hess's Law).
              Best for studying temperature dependence.
            </p>
            <p className="font-mono text-xs text-secondary">
              Example: ΔH° = −110 kJ/mol, ΔS° = −90 J/(mol·K), T = 298 K<br />
              ΔG° = −110 − 298 × (−90/1000) = −110 + 26.8 = −83.2 kJ/mol
            </p>
          </div>

          {/* Method 2 */}
          <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
            <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>Method 2: ΔG°rxn = Σ n·ΔG°f(products) − Σ n·ΔG°f(reactants)</p>
            <p className="font-sans text-sm text-secondary">
              Use when tabulated ΔG°f values are available (Appendix 2 / Reference tab).
              Analogous to Hess's Law for ΔH°. Valid at 298 K only (unless temperature-specific data given).
            </p>
            <p className="font-mono text-xs text-secondary">
              N₂(g) + 3H₂(g) → 2NH₃(g)<br />
              ΔG° = 2×(−16.4) − [0 + 0] = −32.8 kJ/mol
            </p>
          </div>

          {/* Method 3 */}
          <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
            <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>Method 3: ΔG° = −nFE°cell</p>
            <p className="font-sans text-sm text-secondary">
              Use when the standard cell potential E°cell is known (electrochemistry). n = moles of electrons transferred,
              F = 96 485 C/mol (Faraday constant).
            </p>
            <p className="font-mono text-xs text-secondary">
              E°cell = +1.10 V, n = 2<br />
              ΔG° = −(2)(96 485)(1.10) / 1000 = −212.3 kJ/mol
            </p>
          </div>
        </div>
      </section>

      {/* Spontaneity Summary */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Relationship to K and E°</h3>
        <div className="p-4 rounded-sm border border-border bg-raised font-mono text-sm flex flex-col gap-2">
          <p className="text-primary">ΔG° = −RT ln K = −nFE°cell</p>
          <p className="text-secondary text-xs">R = 8.314 J/(mol·K); T in K; n = electrons transferred; F = 96 485 C/mol</p>
          <div className="flex flex-col gap-1 mt-2 text-xs">
            <p className="text-secondary">ΔG° &lt; 0 → K &gt; 1, E° &gt; 0 → products favored</p>
            <p className="text-secondary">ΔG° = 0 → K = 1, E° = 0 → equilibrium</p>
            <p className="text-secondary">ΔG° &gt; 0 → K &lt; 1, E° &lt; 0 → reactants favored</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function TriangleReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">ΔG°-E°-K Triangle</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Three fundamental quantities in electrochemistry — standard Gibbs free energy (ΔG°), standard
          cell potential (E°cell), and the equilibrium constant (K) — are all interrelated. Knowing any one
          of them and the number of electrons transferred (n) lets you calculate the other two.
        </p>
      </div>

      {/* SVG Triangle Diagram */}
      <div className="flex justify-center">
        <svg width="280" height="240" viewBox="0 0 280 240" className="overflow-visible">
          {/* Triangle */}
          <polygon
            points="140,20 30,210 250,210"
            fill="none"
            stroke="rgba(var(--overlay),0.2)"
            strokeWidth="2"
          />

          {/* Vertex labels */}
          {/* Top: ΔG° */}
          <text x="140" y="10" textAnchor="middle" className="font-mono" fill="var(--c-halogen)" fontSize="15" fontWeight="bold">ΔG°</text>

          {/* Bottom-left: K */}
          <text x="18" y="226" textAnchor="middle" className="font-mono" fill="#60a5fa" fontSize="15" fontWeight="bold">K</text>

          {/* Bottom-right: E°cell */}
          <text x="262" y="226" textAnchor="middle" className="font-mono" fill="#4ade80" fontSize="15" fontWeight="bold">E°cell</text>

          {/* Edge labels */}
          {/* Left edge: ΔG° = -RT ln K */}
          <text x="62" y="122" textAnchor="middle" fill="rgba(var(--overlay),0.55)" fontSize="11"
            transform="rotate(-60, 62, 122)">ΔG° = −RT ln K</text>

          {/* Right edge: ΔG° = -nFE° */}
          <text x="218" y="122" textAnchor="middle" fill="rgba(var(--overlay),0.55)" fontSize="11"
            transform="rotate(60, 218, 122)">ΔG° = −nFE°</text>

          {/* Bottom edge: ln K = nFE°/RT */}
          <text x="140" y="225" textAnchor="middle" fill="rgba(var(--overlay),0.55)" fontSize="11">
            ln K = nFE°/RT
          </text>

          {/* Arrow indicators showing direction of derivation */}
          <circle cx="140" cy="20" r="4" fill="var(--c-halogen)" opacity="0.4" />
          <circle cx="30" cy="210" r="4" fill="#60a5fa" opacity="0.4" />
          <circle cx="250" cy="210" r="4" fill="#4ade80" opacity="0.4" />
        </svg>
      </div>

      {/* Formulas */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Formulas</p>
        <div className="flex flex-col gap-3">

          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">ΔG° = −nFE°cell</p>
            <p className="font-mono text-xs text-secondary mt-1">
              n = electrons transferred, F = 96,485 C/mol. Units: ΔG° in J/mol; divide by 1000 for kJ/mol.
              Positive E°cell → negative ΔG° → spontaneous.
            </p>
          </div>

          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">ΔG° = −RT ln K</p>
            <p className="font-mono text-xs text-secondary mt-1">
              R = 8.314 J/(mol·K), T in Kelvin. Large positive K → large negative ΔG° → strongly spontaneous.
            </p>
          </div>

          <div className="rounded-sm border border-border px-4 py-3"
            style={{ background: 'rgb(var(--color-base))' }}>
            <p className="font-mono text-base text-primary">ln K = nFE°cell / RT</p>
            <p className="font-mono text-xs text-secondary mt-1">
              At 25°C: log₁₀ K = nE° / 0.05916. This is the Nernst equation evaluated at equilibrium (E = 0, Q = K).
            </p>
          </div>
        </div>
      </div>

      {/* Conversion table */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Conversion Summary</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Known</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Formula to get E°</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Formula to get K</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-2 text-primary">ΔG° (kJ/mol)</td>
                <td className="px-4 py-2 text-secondary">E° = −ΔG°/(nF)</td>
                <td className="px-4 py-2 text-secondary">K = exp(−ΔG°/RT)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2 text-primary">E°cell (V)</td>
                <td className="px-4 py-2 text-secondary">—</td>
                <td className="px-4 py-2 text-secondary">K = exp(nFE°/RT)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-primary">K</td>
                <td className="px-4 py-2 text-secondary">E° = RT ln K / (nF)</td>
                <td className="px-4 py-2 text-secondary">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — Zn/Cu Cell</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s) &nbsp; E°cell = +1.10 V, n = 2
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">ΔG° = −nFE° = −(2)(96,485)(1.10) / 1000</p>
            <p className="font-mono text-xs text-primary font-semibold">ΔG° = −212.3 kJ/mol  (spontaneous)</p>
            <p className="font-mono text-xs text-secondary mt-1">ln K = nFE°/RT = (2)(96,485)(1.10) / (8.314 × 298)</p>
            <p className="font-mono text-xs text-secondary">log₁₀ K = (2)(1.10) / 0.05916 ≈ 37.2</p>
            <p className="font-mono text-xs text-primary font-semibold">K ≈ 1.6 × 10³⁷  (reaction goes essentially to completion)</p>
          </div>
        </div>
      </div>

      <p className="font-sans text-xs text-dim">
        Values from Chang 14e Table 18.1. F = 96,485 C/mol, R = 8.314 J/(mol·K).
      </p>
    </div>
  )
}

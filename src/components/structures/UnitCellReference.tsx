const CELLS = [
  {
    name: 'Simple Cubic (SC)',
    atoms: 1,
    coordination: 6,
    packing: '52.4%',
    edgeRadius: 'a = 2r',
    example: 'Polonium (Po)',
  },
  {
    name: 'Body-Centered Cubic (BCC)',
    atoms: 2,
    coordination: 8,
    packing: '68.0%',
    edgeRadius: 'a = 4r / √3',
    example: 'Iron (α-Fe), Na, K',
  },
  {
    name: 'Face-Centered Cubic (FCC)',
    atoms: 4,
    coordination: 12,
    packing: '74.0%',
    edgeRadius: 'a = 4r / √2',
    example: 'Cu, Al, Au, Ag, Ni',
  },
]

export default function UnitCellReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Unit Cells</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A unit cell is the smallest repeating unit in a crystal lattice. The three cubic unit cell types
          differ in where atoms are located (corners only vs. corners + body center vs. corners + face centers).
        </p>
      </div>

      {/* Comparison table */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Cubic Unit Cell Comparison</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono min-w-max">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                {['Type', 'Atoms/cell', 'CN', 'Packing eff.', 'Edge–radius', 'Examples'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CELLS.map(c => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-semibold text-primary">{c.name}</td>
                  <td className="px-3 py-2 text-primary">{c.atoms}</td>
                  <td className="px-3 py-2 text-primary">{c.coordination}</td>
                  <td className="px-3 py-2" style={{ color: '#4ade80' }}>{c.packing}</td>
                  <td className="px-3 py-2 text-secondary">{c.edgeRadius}</td>
                  <td className="px-3 py-2 text-secondary">{c.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim">CN = coordination number (atoms touching each atom).</p>
      </div>

      {/* Atom count logic */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Atoms per Cell — How to Count</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { position: 'Corner atom', fraction: '1/8', reason: 'Shared by 8 unit cells' },
            { position: 'Face atom', fraction: '1/2', reason: 'Shared by 2 unit cells' },
            { position: 'Body atom', fraction: '1', reason: 'Entirely inside one cell' },
          ].map(r => (
            <div key={r.position} className="flex flex-col gap-2 p-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}>
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-medium text-primary">{r.position}</span>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--c-halogen)' }}>{r.fraction}</span>
              </div>
              <p className="font-sans text-xs text-secondary">{r.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Density formula */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Density Formula</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-sm text-primary">ρ = (n × M) / (a³ × Nₐ)</p>
          <div className="flex flex-col gap-1 mt-1">
            <p className="font-mono text-xs text-secondary">n = atoms per unit cell (SC=1, BCC=2, FCC=4)</p>
            <p className="font-mono text-xs text-secondary">M = molar mass (g/mol)</p>
            <p className="font-mono text-xs text-secondary">a = edge length (cm)</p>
            <p className="font-mono text-xs text-secondary">Nₐ = 6.022 × 10²³ mol⁻¹</p>
          </div>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — Copper (FCC, a = 361.5 pm)</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
            <p className="font-mono text-xs text-secondary">n = 4 (FCC); M = 63.55 g/mol; a = 361.5 pm = 3.615 × 10⁻⁸ cm</p>
            <p className="font-mono text-xs text-secondary">a³ = (3.615 × 10⁻⁸)³ = 4.729 × 10⁻²³ cm³</p>
            <p className="font-mono text-xs text-secondary">ρ = (4 × 63.55) / (4.729 × 10⁻²³ × 6.022 × 10²³)</p>
            <p className="font-mono text-xs text-primary font-semibold">ρ = 254.2 / 28.48 = 8.93 g/cm³  (lit. 8.96 g/cm³)</p>
          </div>
        </div>
      </div>

    </div>
  )
}

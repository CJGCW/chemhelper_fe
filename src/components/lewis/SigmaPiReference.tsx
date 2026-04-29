export default function SigmaPiReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Overview */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Bond Types</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Covalent bonds form by orbital overlap between two atoms. The geometry of overlap determines whether
          the bond is a sigma (σ) bond or a pi (π) bond. Every single bond is one σ bond;
          every double bond is 1σ + 1π; every triple bond is 1σ + 2π.
        </p>
      </div>

      {/* Sigma vs Pi */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Sigma (σ) vs Pi (π)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              type: 'σ bond',
              description: 'Head-on orbital overlap along the internuclear axis. Electron density is concentrated between the two nuclei.',
              strength: 'Stronger — free rotation around the axis is possible.',
              color: '#4ade80',
            },
            {
              type: 'π bond',
              description: 'Side-on (lateral) overlap of parallel p orbitals. Electron density lies above and below the internuclear axis.',
              strength: 'Weaker — rotation is restricted; π bonds hold double/triple bonds rigid.',
              color: '#818cf8',
            },
          ].map(b => (
            <div key={b.type} className="flex flex-col gap-3 p-4 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}>
              <span className="font-mono text-xl font-bold" style={{ color: b.color }}>{b.type}</span>
              <p className="font-sans text-xs text-secondary leading-relaxed">{b.description}</p>
              <p className="font-sans text-xs text-dim leading-relaxed italic">{b.strength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bond counting */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Counting σ and π Bonds</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                {['Bond order', 'σ bonds', 'π bonds', 'Example'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { order: 'Single (—)', sigma: 1, pi: 0, ex: 'H₃C—CH₃  (ethane)' },
                { order: 'Double (=)', sigma: 1, pi: 1, ex: 'H₂C=CH₂  (ethylene)' },
                { order: 'Triple (≡)', sigma: 1, pi: 2, ex: 'HC≡CH     (acetylene)' },
              ].map(r => (
                <tr key={r.order} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-semibold text-primary">{r.order}</td>
                  <td className="px-4 py-2" style={{ color: '#4ade80' }}>{r.sigma}</td>
                  <td className="px-4 py-2" style={{ color: '#818cf8' }}>{r.pi}</td>
                  <td className="px-4 py-2 text-secondary">{r.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim">
          Rule: number of σ bonds = number of bonds (single + double + triple).
          Number of π bonds = total bond order − number of bonds.
        </p>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — propene (CH₂=CH–CH₃)</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-primary">Count all σ and π bonds in propene: CH₂=CH–CH₃</p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">C=C  double bond → 1σ + 1π</p>
            <p className="font-mono text-xs text-secondary">C–C  single bond  → 1σ</p>
            <p className="font-mono text-xs text-secondary">5 C–H single bonds → 5σ</p>
            <p className="font-mono text-xs text-primary font-semibold mt-1">Total: 7σ + 1π</p>
          </div>
        </div>
      </div>

    </div>
  )
}

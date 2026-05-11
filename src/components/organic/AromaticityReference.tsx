export default function AromaticityReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Hückel's Rule</h3>
        <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-3">
          <p className="font-sans text-sm text-secondary leading-relaxed">
            A cyclic, planar, fully conjugated system is aromatic if it has <strong className="text-primary">4n + 2 π electrons</strong> (n = 0, 1, 2, …).
          </p>
          <div className="grid grid-cols-3 gap-3 font-mono text-sm">
            {[
              { n: 0, count: 2,  color: 'emerald' },
              { n: 1, count: 6,  color: 'emerald' },
              { n: 2, count: 10, color: 'emerald' },
              { n: 3, count: 14, color: 'emerald' },
              { n: 4, count: 18, color: 'emerald' },
            ].map(row => (
              <div key={row.n} className="flex items-center gap-2 px-3 py-2 rounded-sm border" style={{ borderColor: 'rgb(var(--color-success-border) / 0.4)', background: 'rgb(var(--color-success-bg) / 0.15)' }}>
                <span className="text-dim">n={row.n}:</span>
                <span className="text-success font-bold">{row.count}π</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-sm text-secondary">
            Antiaromatic systems have <strong className="text-primary">4n π electrons</strong> (n ≥ 1): 4, 8, 12, …
            These are highly destabilized.
          </p>
        </div>
        <div className="p-3 rounded-sm border border-border bg-surface">
          <p className="font-mono text-xs text-dim uppercase tracking-wider mb-2">Three Requirements for Aromaticity</p>
          <ol className="font-sans text-sm text-secondary flex flex-col gap-1 list-decimal list-inside">
            <li><strong className="text-primary">Cyclic</strong> — must be a ring (or fused ring system)</li>
            <li><strong className="text-primary">Planar</strong> — all atoms in the ring must be sp² or sp hybridized</li>
            <li><strong className="text-primary">Fully conjugated</strong> — continuous p-orbital overlap around the ring</li>
          </ol>
          <p className="font-sans text-xs text-dim mt-2">If ALL three requirements are met: 4n+2 = aromatic; 4n = antiaromatic. If any requirement is missing: nonaromatic.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Aromatic Systems</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs border-collapse w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-dim font-normal">System</th>
                <th className="text-center py-2 pr-4 text-dim font-normal">π electrons</th>
                <th className="text-center py-2 pr-4 text-dim font-normal">n</th>
                <th className="text-left py-2 text-dim font-normal">Notes</th>
              </tr>
            </thead>
            <tbody className="text-secondary text-sm">
              {[
                ['Benzene', '6', '1', 'Classic aromatic — delocalized over 6 carbons'],
                ['Naphthalene', '10', '2', 'Two fused benzene rings — aromatic'],
                ['Pyridine', '6', '1', 'N lone pair NOT in ring — only the ring π bonds count'],
                ['Pyrrole', '6', '1', 'N lone pair IS in ring (sp² N, lone pair in p orbital)'],
                ['Furan', '6', '1', 'O lone pair in ring — aromatic, though less so than benzene'],
                ['Thiophene', '6', '1', 'S lone pair in ring'],
                ['Cyclopentadienyl anion (Cp⁻)', '6', '1', 'Carbanion; lone pair adds to ring → 6π → aromatic'],
                ['Cycloheptatrienyl cation (tropylium)', '6', '1', 'Carbocation; cationic C is sp², p orbital empty — 6π'],
                ['[14]Annulene', '14', '3', 'Aromatic — though geometry causes some distortion'],
                ['[18]Annulene', '18', '4', 'Aromatic — all H inside/outside ring'],
              ].map(([sys, pi, n, note]) => (
                <tr key={sys} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-primary">{sys}</td>
                  <td className="py-1.5 pr-4 text-center text-success">{pi}</td>
                  <td className="py-1.5 pr-4 text-center text-dim">{n}</td>
                  <td className="py-1.5 text-dim text-xs">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Antiaromatic Systems</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs border-collapse w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-dim font-normal">System</th>
                <th className="text-center py-2 pr-4 text-dim font-normal">π electrons</th>
                <th className="text-left py-2 text-dim font-normal">Notes</th>
              </tr>
            </thead>
            <tbody className="text-secondary text-sm">
              {[
                ['Cyclobutadiene', '4', 'Extremely unstable — rapidly dimerizes; antiaromatic'],
                ['Cyclopentadienyl cation', '4', 'Cationic carbon; lone pair absent → 4π → antiaromatic'],
                ['Cyclopropenyl anion', '4', 'Carbanion adds lone pair to ring → 4π → antiaromatic'],
                ['[8]Annulene (COT, tub-shaped)', '8', 'Non-planar! Tub shape avoids antiaromaticity → nonaromatic'],
              ].map(([sys, pi, note]) => (
                <tr key={sys} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-primary">{sys}</td>
                  <td className="py-1.5 pr-4 text-center text-error">{pi}</td>
                  <td className="py-1.5 text-dim text-xs">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 rounded-sm border border-border bg-surface">
          <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Key Trap: COT (cyclooctatetraene)</p>
          <p className="font-sans text-sm text-secondary">
            COT has 8 π electrons (4n, n=2) which would make it antiaromatic — but it avoids this by
            adopting a non-planar tub shape, breaking the requirement for planarity. It is nonaromatic,
            not antiaromatic.
          </p>
        </div>
      </section>

    </div>
  )
}

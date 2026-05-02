import { FUNCTIONAL_GROUPS } from '../../data/functionalGroups'

export default function FunctionalGroupReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Functional Groups in Organic Chemistry</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A functional group is an atom or group of atoms that determines the chemical properties of a compound.
          The general formula uses R to represent any carbon chain (alkyl group). The suffix shown is the IUPAC
          ending added to the parent alkane name.
        </p>
      </div>

      {/* Main table */}
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-sm font-sans border-collapse">
          <thead>
            <tr style={{ background: 'rgb(var(--color-raised))' }}>
              <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Group</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Formula</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Bond Pattern</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">IUPAC Suffix</th>
              <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Example</th>
            </tr>
          </thead>
          <tbody>
            {FUNCTIONAL_GROUPS.map((g, i) => (
              <tr key={g.id} style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
                <td className="px-4 py-2.5 font-sans font-semibold text-primary">{g.name}</td>
                <td className="px-4 py-2.5 font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{g.generalFormula}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-secondary">{g.bondPattern}</td>
                <td className="px-4 py-2.5 font-mono text-sm text-primary">{g.suffix}</td>
                <td className="px-4 py-2.5 font-sans text-sm text-secondary">
                  {g.examples[0]?.name} ({g.examples[0]?.formula})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail cards */}
      <div className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-bright text-lg">Group Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUNCTIONAL_GROUPS.map(g => (
            <div key={g.id} className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
              <div className="flex items-baseline gap-2">
                <span className="font-sans font-semibold text-primary">{g.name}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{g.generalFormula}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-secondary">Bond pattern: {g.bondPattern}</span>
                <span className="font-mono text-xs text-secondary">Suffix: {g.suffix}</span>
              </div>
              <p className="font-sans text-xs text-dim leading-relaxed">{g.properties}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {g.examples.map(ex => (
                  <span key={ex.name} className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)' }}>
                    {ex.formula}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-mono text-xs text-secondary">
        Functional groups from Chang's Chemistry, 14e, Chapter 24.
      </p>
    </div>
  )
}

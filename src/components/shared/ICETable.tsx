import type { ICERow } from '../../chem/equilibrium'

export interface ICETableProps {
  rows: ICERow[]
  interactive?: boolean
}

export default function ICETable({ rows }: ICETableProps) {
  if (rows.length === 0) return null

  const reactantRows = rows.filter(r => r.side === 'reactant')
  const productRows  = rows.filter(r => r.side === 'product')
  const allRows      = [...reactantRows, ...productRows]

  return (
    <div className="overflow-x-auto">
      <table className="font-mono text-sm border-collapse w-full min-w-[24rem]">
        <thead>
          <tr>
            <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal text-xs uppercase tracking-wider w-8"></th>
            {allRows.map(row => (
              <th key={row.species} className="border border-border px-3 py-1.5 text-center text-primary font-medium">
                {row.species}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Initial */}
          <tr>
            <td className="border border-border px-3 py-1.5 text-secondary text-xs font-bold">I</td>
            {allRows.map(row => (
              <td key={row.species} className="border border-border px-3 py-1.5 text-center text-primary">
                {row.initial}
              </td>
            ))}
          </tr>
          {/* Change */}
          <tr style={{ background: 'rgb(var(--color-surface))' }}>
            <td className="border border-border px-3 py-1.5 text-secondary text-xs font-bold">C</td>
            {allRows.map(row => (
              <td
                key={row.species}
                className="border border-border px-3 py-1.5 text-center font-medium"
                style={{
                  color: row.changeCoeff < 0
                    ? 'rgb(239 68 68)'   // red-500
                    : 'rgb(34 197 94)',  // green-500
                }}
              >
                {row.change}
              </td>
            ))}
          </tr>
          {/* Equilibrium */}
          <tr>
            <td className="border border-border px-3 py-1.5 text-secondary text-xs font-bold">E</td>
            {allRows.map(row => (
              <td key={row.species} className="border border-border px-3 py-1.5 text-center text-primary">
                {row.equilibrium || '\u2014'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

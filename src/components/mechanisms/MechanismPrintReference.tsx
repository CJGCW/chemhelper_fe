import { getReactionsByCategory } from '../../data/mechanisms/index'
import type { MechanismCategory } from '../../data/mechanisms/types'

interface Props {
  category: MechanismCategory
}

function regioBadge(r: string | null) {
  if (!r) return null
  const color = r === 'markovnikov' ? '#60a0f0' : '#a0c060'
  return (
    <span className="font-mono text-[9px] px-1 rounded"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {r === 'markovnikov' ? 'Mk' : r === 'anti-markovnikov' ? 'anti-Mk' : r}
    </span>
  )
}

function stereoBadge(s: string | null) {
  if (!s) return null
  const colors: Record<string, string> = {
    inversion: '#f06060', retention: '#60f090', racemization: '#c0c060',
    syn: '#60c0f0', anti: '#f09060',
  }
  const c = colors[s] ?? '#aaaaaa'
  return (
    <span className="font-mono text-[9px] px-1 rounded"
      style={{ background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
      {s}
    </span>
  )
}

export default function MechanismPrintReference({ category }: Props) {
  const reactions = getReactionsByCategory(category)

  if (reactions.length === 0) {
    return (
      <p className="font-mono text-xs text-dim">No reactions found for this category.</p>
    )
  }

  return (
    <div className="flex flex-col gap-2 max-w-4xl print:max-w-none">
      <table className="w-full text-xs font-sans border-collapse">
        <thead>
          <tr style={{ background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' }}>
            {['Name', 'Reactants → Products', 'Conditions', 'Regio', 'Stereo', 'Intermediate', 'Key Notes'].map(h => (
              <th key={h} className="text-left px-2 py-1.5 font-mono text-[10px] text-secondary tracking-wider uppercase border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reactions.map((rxn, i) => {
            const notes = rxn.importantInfo.slice(0, 2).join(' ')
            const truncated = notes.length > 120 ? notes.slice(0, 117) + '…' : notes
            return (
              <tr key={rxn.id}
                style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-raised))' }}
                className="border-b border-border/50 align-top">
                <td className="px-2 py-1.5">
                  <div className="font-semibold text-primary text-[11px]">{rxn.name}</div>
                  {rxn.brownRef && (
                    <div className="font-mono text-[9px] text-dim">{rxn.brownRef}</div>
                  )}
                </td>
                <td className="px-2 py-1.5 font-mono text-[10px] text-secondary">
                  {rxn.reactants} → {rxn.products}
                </td>
                <td className="px-2 py-1.5 text-dim text-[10px]">{rxn.conditions}</td>
                <td className="px-2 py-1.5">{regioBadge(rxn.regiochemistry)}</td>
                <td className="px-2 py-1.5">{stereoBadge(rxn.stereochemistry)}</td>
                <td className="px-2 py-1.5 text-dim text-[10px]">{rxn.intermediate ?? '—'}</td>
                <td className="px-2 py-1.5 text-dim text-[10px]">{truncated}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

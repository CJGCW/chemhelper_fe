import { useState } from 'react'
import CompoundDisplay from '../shared/CompoundDisplay'
import HoverPreview from '../shared/HoverPreview'
import { AMINO_ACIDS, CLASS_COLORS, CLASS_LABELS, type AminoAcid, type FilterClass } from '../../data/aminoAcids'

export default function AminoAcidTable() {
  const [filter, setFilter] = useState<FilterClass>('all')
  const [search, setSearch] = useState('')

  const filtered = AMINO_ACIDS.filter(aa => {
    if (filter !== 'all' && aa.class !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return aa.name.toLowerCase().includes(q) || aa.three.toLowerCase().includes(q) || aa.one.toLowerCase() === q
    }
    return true
  })

  const pills: { id: FilterClass; label: string }[] = [
    { id: 'all',      label: 'All (20)' },
    { id: 'nonpolar', label: 'Nonpolar (7)' },
    { id: 'aromatic', label: 'Aromatic (3)' },
    { id: 'polar',    label: 'Polar (5)' },
    { id: 'acidic',   label: 'Acidic (2)' },
    { id: 'basic',    label: 'Basic (3)' },
  ]

  function classPill(aa: AminoAcid) {
    const c = CLASS_COLORS[aa.class]
    return (
      <span
        className="px-2 py-0.5 rounded-full whitespace-nowrap inline-block"
        style={{
          background: `color-mix(in srgb, ${c} 25%, transparent)`,
          color: c,
          border: `1px solid color-mix(in srgb, ${c} 50%, transparent)`,
          fontSize: 10,
        }}
      >
        {CLASS_LABELS[aa.class]}
      </span>
    )
  }

  function rGroupCell(aa: AminoAcid) {
    if (aa.rGroupSmiles) {
      return <CompoundDisplay smiles={aa.rGroupSmiles} label={aa.rGroup} width={80} height={64} />
    }
    if (aa.rGroupFullStructure) {
      return (
        <div className="flex flex-col gap-1">
          <CompoundDisplay smiles={aa.rGroupFullStructure} width={100} height={80} />
          <span className="font-mono text-secondary" style={{ fontSize: 10 }}>side chain forms ring</span>
        </div>
      )
    }
    return <span className="font-mono text-secondary">{aa.rGroup}</span>
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">The 20 Standard Amino Acids</h3>
        <p className="font-sans text-xs text-secondary">pKa values from Brown Ch. 27. pI = isoelectric point (pH of net zero charge).</p>
      </div>

      <p className="text-xs text-secondary">
        See the{' '}
        <a href="?tab=ref-zwitterion-pi" className="underline hover:text-primary transition-colors">
          Zwitterions &amp; pI reference
        </a>{' '}
        for how pI is calculated from pKa values.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {pills.map(p => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            className="px-3 py-1 rounded-full text-xs font-sans border transition-colors"
            style={filter === p.id ? {
              background: `color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))`,
              borderColor: `color-mix(in srgb, var(--c-halogen) 40%, transparent)`,
              color: 'var(--c-halogen)',
            } : {
              background: 'transparent',
              borderColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-secondary))',
            }}
          >
            {p.label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search name, 3-letter, or 1-letter…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-1 rounded-full text-xs border border-border bg-transparent text-primary placeholder:text-secondary outline-none focus:ring-1 focus:ring-border"
          style={{ minWidth: 220 }}
        />
      </div>

      {/* Desktop table (md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th rowSpan={2} className="text-left py-2 pr-3 text-secondary font-semibold align-bottom" style={{ width: '8rem' }}>Name</th>
              <th rowSpan={2} className="text-left py-2 pr-3 text-secondary font-semibold align-bottom">3L / 1L</th>
              <th rowSpan={2} className="text-left py-2 pr-3 text-secondary font-semibold align-bottom">R Group</th>
              <th rowSpan={2} className="text-left py-2 pr-3 text-secondary font-semibold align-bottom">Class</th>
              <th colSpan={3} className="text-center py-2 px-3 text-secondary font-semibold border-b border-border border-l border-r border-border/30">pKa values</th>
              <th rowSpan={2} className="text-right py-2 text-secondary font-semibold align-bottom">pI</th>
            </tr>
            <tr className="border-b border-border">
              <th className="text-right py-1 pr-3 font-semibold border-l border-border/30" style={{ fontSize: 10, color: 'var(--c-acid)' }}>α-COOH</th>
              <th className="text-right py-1 pr-3 font-semibold" style={{ fontSize: 10, color: 'var(--c-amine)' }}>α-NH₃⁺</th>
              <th className="text-right py-1 pr-3 font-semibold italic border-r border-border/30" style={{ fontSize: 10, color: 'rgb(var(--color-secondary))' }}>R</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(aa => (
              <tr key={aa.name} className="border-b border-border/50 hover:bg-raised/50 transition-colors">
                <td className="py-2 pr-3 text-primary font-semibold" style={{ width: '8rem' }}>
                  <HoverPreview smiles={aa.fullSmiles} label={`${aa.name} (${aa.three})`} width={220} height={160}>
                    <span className="cursor-help underline decoration-dotted decoration-secondary/40 underline-offset-2 print:no-underline">
                      {aa.name}
                    </span>
                  </HoverPreview>
                  {aa.notes && (
                    <span className="block font-normal text-secondary" style={{ fontSize: 10 }}>{aa.notes}</span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-primary">{aa.three} / {aa.one}</td>
                <td className="py-2 pr-3">{rGroupCell(aa)}</td>
                <td className="py-2 pr-3">{classPill(aa)}</td>
                <td className="py-2 pr-3 text-right font-mono text-secondary border-l border-border/30">{aa.pKa1.toFixed(2)}</td>
                <td className="py-2 pr-3 text-right font-mono text-secondary">{aa.pKa2.toFixed(2)}</td>
                <td className="py-2 pr-3 text-right font-mono text-secondary border-r border-border/30">{aa.pKaR != null ? aa.pKaR.toFixed(2) : '—'}</td>
                <td className="py-2 text-right font-mono font-semibold text-primary">{aa.pI.toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-4 text-center text-secondary">No amino acids match the current filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout (below md) */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map(aa => (
          <div
            key={aa.name}
            className="rounded-sm border border-border p-3"
            style={{ background: 'rgb(var(--color-raised))' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <HoverPreview smiles={aa.fullSmiles} label={`${aa.name} (${aa.three})`} width={220} height={160}>
                <span className="font-semibold text-primary text-sm cursor-help underline decoration-dotted decoration-secondary/40 underline-offset-2 print:no-underline">
                  {aa.name}
                </span>
              </HoverPreview>
                <div className="mt-1">{classPill(aa)}</div>
              </div>
              <span className="font-mono text-secondary text-xs shrink-0">{aa.three} / {aa.one}</span>
            </div>

            {/* R-group structure */}
            <div className="flex justify-center mb-3">
              {rGroupCell(aa)}
            </div>

            {/* pKa row */}
            <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold" style={{ fontSize: 10, color: 'var(--c-acid)' }}>α-COOH</span>
                <span className="font-mono text-secondary">{aa.pKa1.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold" style={{ fontSize: 10, color: 'var(--c-amine)' }}>α-NH₃⁺</span>
                <span className="font-mono text-secondary">{aa.pKa2.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="italic text-secondary" style={{ fontSize: 10 }}>pKa(R)</span>
                <span className="font-mono text-secondary">{aa.pKaR != null ? aa.pKaR.toFixed(2) : '—'}</span>
              </div>
            </div>

            {/* pI */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xs text-secondary">pI</span>
              <span className="font-mono font-semibold text-primary text-sm">{aa.pI.toFixed(2)}</span>
            </div>

            {/* Notes */}
            {aa.notes && (
              <p className="text-secondary italic" style={{ fontSize: 10 }}>{aa.notes}</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-secondary text-xs">No amino acids match the current filter.</p>
        )}
      </div>
    </div>
  )
}

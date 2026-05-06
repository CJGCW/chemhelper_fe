import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FGI_TABLE, type FunctionalGroup, type FGITransformation } from '../../data/organic/fgiTable'

const FG_LABELS: Record<FunctionalGroup, string> = {
  alkane:          'Alkane',
  alkene:          'Alkene',
  alkyne:          'Alkyne',
  alkyl_halide:    'Alkyl Halide',
  alcohol:         'Alcohol',
  ether:           'Ether',
  epoxide:         'Epoxide',
  aldehyde:        'Aldehyde',
  ketone:          'Ketone',
  carboxylic_acid: 'Carboxylic Acid',
  ester:           'Ester',
  amide:           'Amide',
  amine:           'Amine',
  nitrile:         'Nitrile',
  aromatic:        'Aromatic',
}

type FilterCategory = 'all' | 'alkene' | 'carbonyl' | 'aromatic' | 'oxidation' | 'nitrogen'

const FILTERS: { id: FilterCategory; label: string }[] = [
  { id: 'all',       label: 'All'         },
  { id: 'alkene',    label: 'Alkene rxns' },
  { id: 'carbonyl',  label: 'Carbonyl'    },
  { id: 'aromatic',  label: 'Aromatic'    },
  { id: 'oxidation', label: 'Oxidation'   },
  { id: 'nitrogen',  label: 'Nitrogen'    },
]

const FILTER_GROUPS: Record<FilterCategory, FunctionalGroup[]> = {
  all:       [],
  alkene:    ['alkene', 'alkyne', 'alkane', 'epoxide'],
  carbonyl:  ['aldehyde', 'ketone', 'carboxylic_acid', 'ester', 'amide'],
  aromatic:  ['aromatic'],
  oxidation: ['alcohol', 'aldehyde', 'ketone', 'carboxylic_acid'],
  nitrogen:  ['amine', 'amide', 'nitrile'],
}

function filterRows(filter: FilterCategory): FGITransformation[] {
  if (filter === 'all') return FGI_TABLE
  const groups = FILTER_GROUPS[filter]
  return FGI_TABLE.filter(t => groups.includes(t.from) || groups.includes(t.to))
}

interface DetailModalProps {
  entry: FGITransformation
  onClose: () => void
}

function DetailModal({ entry, onClose }: DetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="rounded-sm border border-border max-w-md w-full p-5 flex flex-col gap-3"
        style={{ background: 'rgb(var(--color-surface))' }}>

        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest">
              {FG_LABELS[entry.from]} → {FG_LABELS[entry.to]}
            </span>
            <p className="font-mono text-sm font-semibold text-bright mt-0.5">{entry.reagents}</p>
          </div>
          <button onClick={onClose} className="text-dim hover:text-primary font-mono text-base leading-none mt-0.5">✕</button>
        </div>

        {entry.conditions && (
          <div className="rounded-sm border border-border px-3 py-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Conditions</span>
            <p className="font-sans text-xs text-primary">{entry.conditions}</p>
          </div>
        )}

        {entry.notes && (
          <div className="rounded-sm border border-border px-3 py-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Notes</span>
            <p className="font-sans text-xs text-primary">{entry.notes}</p>
          </div>
        )}

        {entry.reactionId && (
          <p className="font-sans text-xs text-secondary">
            See mechanism: <span className="font-mono">{entry.reactionId}</span>
          </p>
        )}
      </motion.div>
    </div>
  )
}

export default function FunctionalGroupInterconversion() {
  const [filter, setFilter] = useState<FilterCategory>('all')
  const [modal, setModal] = useState<FGITransformation | null>(null)
  const [fromFilter, setFromFilter] = useState<FunctionalGroup | 'all'>('all')

  const rows = filterRows(filter)
  const visible = fromFilter === 'all' ? rows : rows.filter(t => t.from === fromFilter)

  // Get unique "from" groups for the secondary filter
  const availableFromGroups = Array.from(new Set(rows.map(t => t.from))).sort()

  return (
    <div className="flex flex-col gap-6 max-w-4xl print:max-w-none">
      <div className="flex flex-col gap-4 print:hidden">

        {/* Category filter */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Filter by category</span>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => {
              const active = filter === f.id
              return (
                <button key={f.id} onClick={() => { setFilter(f.id); setFromFilter('all') }}
                  className="px-3 py-1 rounded-full text-xs font-sans font-medium border transition-colors"
                  style={active ? {
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                    borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                    color: 'var(--c-halogen)',
                  } : {
                    background: 'transparent',
                    borderColor: 'rgba(var(--overlay),0.15)',
                    color: 'rgb(var(--overlay)/0.5)',
                  }}>
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* From-group filter */}
        {filter !== 'all' && availableFromGroups.length > 1 && (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Starting material</span>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setFromFilter('all')}
                className="px-3 py-1 rounded-full text-xs font-sans border transition-colors"
                style={fromFilter === 'all' ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                } : { background: 'transparent', borderColor: 'rgba(var(--overlay),0.15)', color: 'rgb(var(--overlay)/0.5)' }}>
                All
              </button>
              {availableFromGroups.map(fg => (
                <button key={fg} onClick={() => setFromFilter(fg)}
                  className="px-3 py-1 rounded-full text-xs font-sans border transition-colors"
                  style={fromFilter === fg ? {
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                    borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                    color: 'var(--c-halogen)',
                  } : { background: 'transparent', borderColor: 'rgba(var(--overlay),0.15)', color: 'rgb(var(--overlay)/0.5)' }}>
                  {FG_LABELS[fg]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 font-mono text-[10px] text-dim uppercase tracking-widest w-32">From</th>
              <th className="text-left px-3 py-2 font-mono text-[10px] text-dim uppercase tracking-widest w-32">To</th>
              <th className="text-left px-3 py-2 font-mono text-[10px] text-dim uppercase tracking-widest">Reagents</th>
              <th className="text-left px-3 py-2 font-mono text-[10px] text-dim uppercase tracking-widest hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((entry, i) => (
              <tr key={i}
                onClick={() => setModal(entry)}
                className="border-b border-border cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--c-halogen)_5%,rgb(var(--color-raised)))]"
                style={{ borderColor: 'rgba(var(--overlay),0.08)' }}>
                <td className="px-3 py-2 font-sans text-xs text-secondary">{FG_LABELS[entry.from]}</td>
                <td className="px-3 py-2 font-sans text-xs text-primary font-medium">{FG_LABELS[entry.to]}</td>
                <td className="px-3 py-2 font-mono text-xs text-primary">{entry.reagents}</td>
                <td className="px-3 py-2 font-sans text-xs text-dim hidden md:table-cell max-w-xs truncate">{entry.notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="py-8 text-center font-mono text-xs text-dim">No transformations match this filter.</div>
        )}
      </div>

      <p className="font-sans text-xs text-dim print:hidden">Click any row to see full details and conditions.</p>
      <p className="font-sans text-xs text-dim">{visible.length} transformation{visible.length === 1 ? '' : 's'} shown.</p>

      <AnimatePresence>
        {modal && <DetailModal entry={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  )
}

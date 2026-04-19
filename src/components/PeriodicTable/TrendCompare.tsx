import { motion } from 'framer-motion'
import type { Element } from '../../types'
import { IE1, EA, IONIC_RADIUS } from '../../data/periodicTrends'
import { getColorCategory, GROUP_COLORS } from './groupColors'

interface Props {
  elementA: Element | null
  elementB: Element | null
  onClear:  () => void
}

// ── Table rows ────────────────────────────────────────────────────────────────

interface Row {
  label:   string
  unit:    string
  get:     (el: Element) => number | string
  compare: 'higher' | 'lower' | null   // which value is "better" / larger
}

const ROWS: Row[] = [
  { label: 'Atomic Number',      unit: '',         get: el => el.atomicNumber,                                compare: null    },
  { label: 'Period',              unit: '',         get: el => el.period,                                      compare: null    },
  { label: 'Group',               unit: '',         get: el => el.group,                                       compare: null    },
  { label: 'Atomic Weight',       unit: 'u',        get: el => parseFloat(el.atomicWeight).toFixed(3),         compare: null    },
  { label: 'Electronegativity',   unit: 'Pauling',  get: el => el.electronegativity > 0 ? el.electronegativity.toFixed(2) : '—', compare: 'higher' },
  { label: 'Atomic Radius',       unit: 'pm',       get: el => el.vanDerWaalsRadiusPm > 0 ? el.vanDerWaalsRadiusPm : '—',        compare: 'higher' },
  { label: 'IE₁',                 unit: 'kJ/mol',   get: el => IE1[el.atomicNumber] ?? '—',                    compare: 'higher' },
  { label: 'Electron Affinity',   unit: 'kJ/mol',   get: el => EA[el.atomicNumber]  ?? '—',                    compare: 'higher' },
  { label: 'Ionic Radius',        unit: 'pm',       get: el => { const v = IONIC_RADIUS[el.atomicNumber]; return v && v > 0 ? v : '—' }, compare: 'higher' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function Slot({
  element, label, color,
}: { element: Element | null; label: 'A' | 'B'; color: string }) {
  if (!element) {
    return (
      <div className="flex flex-col items-center gap-1 py-3 px-4">
        <span
          className="font-mono text-lg font-bold leading-none"
          style={{ color }}
        >{label}</span>
        <span className="font-mono text-[11px] text-dim">click an element</span>
      </div>
    )
  }
  const cat  = getColorCategory(element)
  const elColor = GROUP_COLORS[cat]
  return (
    <div className="flex flex-col items-center gap-0.5 py-3 px-4">
      <span className="font-mono text-lg font-bold leading-none" style={{ color }}>{label}</span>
      <span className="font-mono text-xl font-semibold leading-none" style={{ color: elColor }}>
        {element.symbol}
      </span>
      <span className="font-mono text-[11px] text-secondary">{element.name}</span>
      <span className="font-mono text-xs text-secondary">Z = {element.atomicNumber}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const A_COLOR = '#60a5fa'
const B_COLOR = '#f472b6'

export default function TrendCompare({ elementA, elementB, onClear }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="rounded-sm border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">
            Compare Elements
          </span>
          {(!elementA || !elementB) && (
            <span className="font-mono text-xs text-secondary">
              — click {!elementA ? 'two elements' : 'one more element'} on the table
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="font-mono text-[10px] text-dim hover:text-red-400 transition-colors"
        >
          clear
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs border-collapse">
          {/* Column headers — the two element slots */}
          <thead>
            <tr>
              <th className="text-left px-4 py-0 font-normal border-b border-border w-40" />
              <th className="font-normal border-b border-border border-l"
                style={{ borderColor: `color-mix(in srgb, ${A_COLOR} 30%, rgba(var(--overlay),0.06))` }}>
                <Slot element={elementA} label="A" color={A_COLOR} />
              </th>
              <th className="font-normal border-b border-border border-l"
                style={{ borderColor: `color-mix(in srgb, ${B_COLOR} 30%, rgba(var(--overlay),0.06))` }}>
                <Slot element={elementB} label="B" color={B_COLOR} />
              </th>
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {ROWS.map(row => {
              const rawA = elementA ? row.get(elementA) : null
              const rawB = elementB ? row.get(elementB) : null
              const numA = rawA !== null ? parseFloat(String(rawA)) : NaN
              const numB = rawB !== null ? parseFloat(String(rawB)) : NaN
              const canCmp = row.compare !== null && !isNaN(numA) && !isNaN(numB)
              const aWins  = canCmp && (row.compare === 'higher' ? numA > numB : numA < numB)
              const bWins  = canCmp && (row.compare === 'higher' ? numB > numA : numB < numA)

              return (
                <tr key={row.label} className="border-t border-border">
                  <td className="px-4 py-2 text-dim text-[11px] whitespace-nowrap">
                    {row.label}
                    {row.unit && <span className="text-[10px] ml-1 opacity-60">({row.unit})</span>}
                  </td>
                  <td
                    className="px-4 py-2 text-center border-l"
                    style={{
                      borderColor: `color-mix(in srgb, ${A_COLOR} 20%, rgba(var(--overlay),0.06))`,
                      color: aWins ? A_COLOR : rawA !== null ? 'rgba(var(--overlay),0.75)' : 'rgba(var(--overlay),0.2)',
                      fontWeight: aWins ? 600 : 400,
                    }}
                  >
                    {rawA !== null ? String(rawA) : '—'}
                  </td>
                  <td
                    className="px-4 py-2 text-center border-l"
                    style={{
                      borderColor: `color-mix(in srgb, ${B_COLOR} 20%, rgba(var(--overlay),0.06))`,
                      color: bWins ? B_COLOR : rawB !== null ? 'rgba(var(--overlay),0.75)' : 'rgba(var(--overlay),0.2)',
                      fontWeight: bWins ? 600 : 400,
                    }}
                  >
                    {rawB !== null ? String(rawB) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {elementA && elementB && (
        <p className="font-mono text-xs text-secondary px-4 py-2 border-t border-border">
          Highlighted value = higher for properties where a larger value is notable (EN, IE₁, EA, radii).
        </p>
      )}
    </motion.div>
  )
}

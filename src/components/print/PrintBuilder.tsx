import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Topic definitions ─────────────────────────────────────────────────────────

export type PrintGroup =
  | 'reference' | 'atomic' | 'structures' | 'molar'
  | 'stoichiometry' | 'gases' | 'redox' | 'thermochemistry'

const GROUP_LABELS: Record<PrintGroup, string> = {
  reference:      'General Reference',
  atomic:         'Atomic Structure',
  structures:     'Structures',
  molar:          'Molar & Solutions',
  stoichiometry:  'Stoichiometry',
  gases:          'Gas Laws',
  redox:          'Redox',
  thermochemistry:'Thermochemistry',
}

const GROUP_ORDER: PrintGroup[] = [
  'reference', 'atomic', 'structures', 'molar',
  'stoichiometry', 'gases', 'redox', 'thermochemistry',
]

export interface PrintTopicDef {
  id:      string
  group:   PrintGroup
  label:   string
  formula: string
}

export const ALL_PRINT_TOPICS: PrintTopicDef[] = [
  { id: 'naming',             group: 'reference',       label: 'Naming & Formulae',     formula: 'Nm'       },
  { id: 'solubility',         group: 'reference',       label: 'Solubility Rules',       formula: 'S/I'      },
  { id: 'energy-levels',      group: 'atomic',          label: 'Energy Levels',          formula: 'Eₙ'       },
  { id: 'quantum-numbers',    group: 'atomic',          label: 'Quantum Numbers',        formula: 'QN'       },
  { id: 'lewis',              group: 'structures',      label: 'Lewis Structures',       formula: '⌬'        },
  { id: 'vsepr',              group: 'structures',      label: 'VSEPR',                  formula: '⬡'        },
  { id: 'solid-types',        group: 'structures',      label: 'Solid Types',            formula: '◻'        },
  { id: 'molar',              group: 'molar',           label: 'Molar Calculations',     formula: 'n=m/M'    },
  { id: 'empirical',          group: 'stoichiometry',   label: 'Empirical Formula',      formula: '% → EF'   },
  { id: 'stoich',             group: 'stoichiometry',   label: 'Stoichiometry',          formula: 'g↔mol'    },
  { id: 'ideal-gas',          group: 'gases',           label: 'Ideal Gas Law',          formula: 'PV=nRT'   },
  { id: 'daltons',            group: 'gases',           label: "Dalton's Law",           formula: 'Ptot'     },
  { id: 'grahams',            group: 'gases',           label: "Graham's Law",           formula: '√M'       },
  { id: 'gas-density',        group: 'gases',           label: 'Gas Density',            formula: 'ρ=PM/RT'  },
  { id: 'vdw',                group: 'gases',           label: 'Van der Waals',          formula: 'vdW'      },
  { id: 'maxwell',            group: 'gases',           label: 'Maxwell-Boltzmann',      formula: 'f(v)'     },
  { id: 'redox',              group: 'redox',           label: 'Redox',                  formula: 'e⁻'       },
  { id: 'calorimetry',        group: 'thermochemistry', label: 'Calorimetry',            formula: 'q=mcΔT'   },
  { id: 'heat-transfer',      group: 'thermochemistry', label: 'Heat Transfer',          formula: 'q₁=−q₂'   },
  { id: 'enthalpy',           group: 'thermochemistry', label: 'Enthalpy of Formation',  formula: 'ΔHf°'     },
  { id: 'hess',               group: 'thermochemistry', label: "Hess's Law",             formula: 'ΣΔH'      },
  { id: 'bond-enthalpy',      group: 'thermochemistry', label: 'Bond Enthalpy',          formula: 'BE'       },
  { id: 'clausius-clapeyron', group: 'thermochemistry', label: 'Clausius-Clapeyron',     formula: 'ln P'     },
  { id: 'heating-curve',      group: 'thermochemistry', label: 'Heating Curve',          formula: 'q/T'      },
  { id: 'phase-diagram',      group: 'thermochemistry', label: 'Phase Diagram',          formula: 'P-T'      },
]

// ── Checkbox button ───────────────────────────────────────────────────────────

function CheckBtn({
  checked, indeterminate, onClick, size = 'sm',
}: {
  checked: boolean; indeterminate?: boolean; onClick: () => void; size?: 'sm' | 'xs'
}) {
  const dim = size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const style = checked || indeterminate
    ? { background: 'color-mix(in srgb, var(--c-halogen) 20%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 50%, transparent)' }
    : { border: '1px solid rgba(var(--overlay),0.15)', background: 'transparent' }
  return (
    <button onClick={onClick} className={`${dim} rounded-sm border flex items-center justify-center transition-colors shrink-0`} style={style}>
      {checked      && <span className="font-mono text-[8px] leading-none" style={{ color: 'var(--c-halogen)' }}>✓</span>}
      {indeterminate && !checked && <span className="font-mono text-[9px] leading-none" style={{ color: 'var(--c-halogen)' }}>−</span>}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onPrint: (topics: PrintTopicDef[], title: string) => void
}

export default function PrintBuilder({ onPrint }: Props) {
  const [title, setTitle]   = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleGroup(group: PrintGroup) {
    const groupIds = ALL_PRINT_TOPICS.filter(t => t.group === group).map(t => t.id)
    const allOn = groupIds.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allOn) groupIds.forEach(id => next.delete(id))
      else       groupIds.forEach(id => next.add(id))
      return next
    })
  }

  function toggleAll() {
    const allOn = ALL_PRINT_TOPICS.every(t => selected.has(t.id))
    setSelected(allOn ? new Set() : new Set(ALL_PRINT_TOPICS.map(t => t.id)))
  }

  const count    = selected.size
  const allOn    = ALL_PRINT_TOPICS.every(t => selected.has(t.id))
  const someOn   = selected.size > 0

  function handlePrint() {
    if (count === 0) return
    const ordered = ALL_PRINT_TOPICS.filter(t => selected.has(t.id))
    onPrint(ordered, title.trim())
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Sheet Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Unit 4 Reference Sheet"
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-base text-bright placeholder-dim
                     focus:outline-none focus:border-muted"
        />
      </div>

      {/* Topic selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs text-secondary tracking-widest uppercase">Topics</label>
          <span className="font-mono text-xs text-dim">
            {count} topic{count !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="rounded-sm border border-border overflow-hidden">

          {/* Header row */}
          <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center
                          px-4 py-2 bg-raised border-b border-border">
            <CheckBtn
              checked={allOn}
              indeterminate={!allOn && someOn}
              onClick={toggleAll}
            />
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Topic</span>
          </div>

          {/* Grouped rows */}
          {GROUP_ORDER.map(group => {
            const groupTopics = ALL_PRINT_TOPICS.filter(t => t.group === group)
            const allGroupOn  = groupTopics.every(t => selected.has(t.id))
            const someGroupOn = groupTopics.some(t => selected.has(t.id))

            return (
              <div key={group}>
                {/* Group header */}
                <div
                  className="grid grid-cols-[auto_1fr] gap-x-4 items-center
                             px-4 py-1.5 border-b border-border"
                  style={{ background: 'color-mix(in srgb, rgb(var(--color-border)) 60%, rgb(var(--color-surface)))' }}
                >
                  <CheckBtn
                    checked={allGroupOn}
                    indeterminate={!allGroupOn && someGroupOn}
                    onClick={() => toggleGroup(group)}
                    size="xs"
                  />
                  <span className="font-mono text-xs tracking-widest uppercase"
                    style={{ color: 'color-mix(in srgb, var(--c-halogen) 70%, rgba(var(--overlay),0.4))' }}>
                    {GROUP_LABELS[group]}
                  </span>
                </div>

                {/* Topic rows — collapse when group is fully unchecked */}
                <AnimatePresence initial={false}>
                  {someGroupOn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      {groupTopics.map(topic => {
                        const on = selected.has(topic.id)
                        return (
                          <div
                            key={topic.id}
                            className={`grid grid-cols-[auto_1fr] gap-x-4 items-center
                                        px-4 py-3 border-b border-border transition-opacity bg-surface
                                        ${on ? '' : 'opacity-40'}`}
                          >
                            <CheckBtn checked={on} onClick={() => toggle(topic.id)} />
                            <div
                              className="flex flex-col gap-0.5 min-w-0 pl-1 cursor-pointer"
                              onClick={() => toggle(topic.id)}
                            >
                              <span className="font-sans text-sm text-primary">{topic.label}</span>
                              <span className="font-mono text-xs text-secondary">{topic.formula}</span>
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Print button */}
      <motion.button
        onClick={handlePrint}
        disabled={count === 0}
        whileTap={{ scale: 0.98 }}
        className="self-start px-6 py-2.5 rounded-sm font-sans text-sm font-semibold
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}
      >
        ⎙ Print {count > 0 ? `${count} topic${count !== 1 ? 's' : ''}` : ''}
      </motion.button>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePreferencesStore } from '../../stores/preferencesStore'

// ── Topic definitions ─────────────────────────────────────────────────────────

export type PrintGroup =
  | 'reference' | 'atomic' | 'structures' | 'molar'
  | 'stoichiometry' | 'gases' | 'redox' | 'thermochemistry'
  | 'kinetics' | 'equilibrium' | 'acid_base' | 'buffers_ksp' | 'thermo_dynamics' | 'nuclear' | 'organic'

const GROUP_LABELS: Record<PrintGroup, string> = {
  reference:      'General Reference',
  atomic:         'Atomic Structure',
  structures:     'Structures',
  molar:          'Molar & Solutions',
  stoichiometry:  'Stoichiometry',
  gases:          'Gas Laws',
  redox:          'Redox',
  thermochemistry:'Thermochemistry',
  kinetics:       'Kinetics',
  equilibrium:    'Chemical Equilibrium',
  acid_base:      'Acid-Base Chemistry',
  buffers_ksp:    'Buffers & Ksp',
  thermo_dynamics:'Thermodynamics',
  nuclear:        'Nuclear Chemistry',
  organic:        'Organic Chemistry',
}

const GROUP_ORDER: PrintGroup[] = [
  'reference', 'atomic', 'structures', 'molar',
  'stoichiometry', 'gases', 'redox', 'thermochemistry',
  'kinetics', 'equilibrium', 'acid_base', 'buffers_ksp', 'thermo_dynamics', 'nuclear', 'organic',
]

export interface PrintTopicDef {
  id:          string
  group:       PrintGroup
  label:       string
  formula:     string
  registryId?: string  // topic ID in topicRegistry.ts for visibility filtering
}

export const ALL_PRINT_TOPICS: PrintTopicDef[] = [
  { id: 'naming',             group: 'reference',       label: 'Naming & Formulae',     formula: 'Nm'       },
  { id: 'solubility',         group: 'reference',       label: 'Solubility Rules',       formula: 'S/I'      },
  { id: 'energy-levels',      group: 'atomic',          label: 'Energy Levels',          formula: 'Eₙ'       },
  { id: 'quantum-numbers',    group: 'atomic',          label: 'Quantum Numbers',        formula: 'QN'       },
  { id: 'isotope-abundance',  group: 'atomic',          label: 'Isotope Abundance',      formula: 'avg M',     registryId: 'isotope-abundance' },
  { id: 'periodic-trends',    group: 'atomic',          label: 'Periodic Trends',        formula: 'IE/EA',     registryId: 'periodic-trends'   },
  { id: 'lewis',              group: 'structures',      label: 'Lewis Structures',       formula: '⌬'        },
  { id: 'vsepr',              group: 'structures',      label: 'VSEPR',                  formula: '⬡'        },
  { id: 'solid-types',        group: 'structures',      label: 'Solid Types',            formula: '◻'        },
  { id: 'sigma-pi',           group: 'structures',      label: 'σ / π Bonds',            formula: 'σ/π',       registryId: 'sigma-pi'          },
  { id: 'unit-cell',          group: 'structures',      label: 'Unit Cell',              formula: '⬡⬡',       registryId: 'unit-cell'         },
  { id: 'molar',              group: 'molar',           label: 'Molar Calculations',     formula: 'n=m/M'    },
  { id: 'empirical',          group: 'stoichiometry',   label: 'Empirical Formula',      formula: '% → EF'   },
  { id: 'stoich',             group: 'stoichiometry',   label: 'Stoichiometry',          formula: 'g↔mol'    },
  { id: 'hydrate',            group: 'stoichiometry',   label: 'Hydrates',               formula: '·nH₂O',    registryId: 'hydrate'           },
  { id: 'adv-percent-yield',  group: 'stoichiometry',   label: 'Adv. % Yield',           formula: '%Y adv',    registryId: 'advanced-percent'  },
  { id: 'chained-yield',      group: 'stoichiometry',   label: 'Chained Yield',          formula: 'chain',     registryId: 'chained-yield'     },
  { id: 'ideal-gas',          group: 'gases',           label: 'Ideal Gas Law',          formula: 'PV=nRT'   },
  { id: 'daltons',            group: 'gases',           label: "Dalton's Law",           formula: 'Ptot'     },
  { id: 'grahams',            group: 'gases',           label: "Graham's Law",           formula: '√M'       },
  { id: 'gas-density',        group: 'gases',           label: 'Gas Density',            formula: 'ρ=PM/RT'  },
  { id: 'vdw',                group: 'gases',           label: 'Van der Waals',          formula: 'vdW'      },
  { id: 'maxwell',            group: 'gases',           label: 'Maxwell-Boltzmann',      formula: 'f(v)'     },
  { id: 'redox',              group: 'redox',           label: 'Redox',                  formula: 'e⁻'       },
  { id: 'ecell',              group: 'redox',           label: 'E°cell / Nernst',        formula: 'E°cell',    registryId: 'ecell-nernst'      },
  { id: 'titration',          group: 'redox',           label: 'Titration',              formula: 'eq pt',     registryId: 'titration'         },
  { id: 'calorimetry',        group: 'thermochemistry', label: 'Calorimetry',            formula: 'q=mcΔT'   },
  { id: 'heat-transfer',      group: 'thermochemistry', label: 'Heat Transfer',          formula: 'q₁=−q₂'   },
  { id: 'enthalpy',           group: 'thermochemistry', label: 'Enthalpy of Formation',  formula: 'ΔHf°'     },
  { id: 'hess',               group: 'thermochemistry', label: "Hess's Law",             formula: 'ΣΔH'      },
  { id: 'bond-enthalpy',      group: 'thermochemistry', label: 'Bond Enthalpy',          formula: 'BE'       },
  { id: 'clausius-clapeyron', group: 'thermochemistry', label: 'Clausius-Clapeyron',     formula: 'ln P'     },
  { id: 'heating-curve',      group: 'thermochemistry', label: 'Heating Curve',          formula: 'q/T'      },
  { id: 'phase-diagram',      group: 'thermochemistry', label: 'Phase Diagram',          formula: 'P-T'      },
  { id: 'reaction-profile',   group: 'thermochemistry', label: 'Reaction Profile',       formula: 'Ea',        registryId: 'reaction-profiles' },
  { id: 'expansion-work',     group: 'thermochemistry', label: 'Expansion Work',         formula: 'w=-PΔV',    registryId: 'expansion-work'    },
  { id: 'vapor-pressure',     group: 'thermochemistry', label: 'Vapor Pressure',         formula: 'P(T)',      registryId: 'vapor-pressure'    },

  // ── Kinetics ────────────────────────────────────────────────────────────────
  { id: 'rate-law',        group: 'kinetics', label: 'Rate Law',           formula: 'rate=k[A]ⁿ',    registryId: 'rate-law'        },
  { id: 'arrhenius',       group: 'kinetics', label: 'Arrhenius Equation', formula: 'k=Ae^(-Ea/RT)', registryId: 'arrhenius'       },
  { id: 'integrated-rate', group: 'kinetics', label: 'Integrated Rate Law', formula: '[A]t / t½',    registryId: 'integrated-rate' },
  { id: 'half-life-k',     group: 'kinetics', label: 'Kinetics Half-Life', formula: 't½',            registryId: 'half-life'       },
  { id: 'mechanisms',      group: 'kinetics', label: 'Reaction Mechanisms', formula: 'rate-det.',    registryId: 'mechanisms'      },

  // ── Chemical Equilibrium ────────────────────────────────────────────────────
  { id: 'keq-expression', group: 'equilibrium', label: 'Keq Expression',  formula: 'Kc expr',    registryId: 'keq-expression' },
  { id: 'q-vs-k',         group: 'equilibrium', label: 'Q vs K',          formula: 'Q⋛K',        registryId: 'q-vs-k'         },
  { id: 'ice-table',       group: 'equilibrium', label: 'ICE Table',       formula: '[x]eq',      registryId: 'ice-table'      },
  { id: 'kp-kc',          group: 'equilibrium', label: 'Kp ↔ Kc',         formula: 'Kp=KcRTΔn', registryId: 'kp-kc'          },
  { id: 'le-chatelier',   group: 'equilibrium', label: "Le Chatelier's",    formula: 'stress',    registryId: 'le-chatelier'   },

  // ── Acid-Base Chemistry ─────────────────────────────────────────────────────
  { id: 'ph-calculator',  group: 'acid_base', label: 'pH Calculator',    formula: 'pH',          registryId: 'ph-calculator' },
  { id: 'ka-kb',          group: 'acid_base', label: 'Ka / Kb',          formula: 'Ka↔Kb',       registryId: 'ka-kb'         },
  { id: 'weak-acid-ref',  group: 'acid_base', label: 'Weak Acid pH',     formula: 'pH<7',        registryId: 'weak-acid'     },
  { id: 'weak-base-ref',  group: 'acid_base', label: 'Weak Base pH',     formula: 'pH>7',        registryId: 'weak-base'     },
  { id: 'salt-ph',        group: 'acid_base', label: 'Salt pH',          formula: 'acidic/basic', registryId: 'salt-ph'      },
  { id: 'polyprotic',     group: 'acid_base', label: 'Polyprotic Acids', formula: 'Ka1,Ka2',     registryId: 'polyprotic'    },

  // ── Buffers & Ksp ───────────────────────────────────────────────────────────
  { id: 'buffer-ph',      group: 'buffers_ksp', label: 'Buffer pH',         formula: 'H-H eq.',  registryId: 'buffer-ph'    },
  { id: 'ksp',            group: 'buffers_ksp', label: 'Ksp & Solubility',  formula: 'Ksp↔s',    registryId: 'ksp'          },
  { id: 'precipitation',    group: 'buffers_ksp', label: 'Precipitation',      formula: 'Q>Ksp?',   registryId: 'precipitation'   },
  { id: 'buffer-capacity',  group: 'buffers_ksp', label: 'Buffer Capacity',    formula: 'β',        registryId: 'buffer-capacity' },
  { id: 'common-ion',       group: 'buffers_ksp', label: 'Common Ion Effect',  formula: 'Ksp↓',     registryId: 'common-ion'      },
  { id: 'titration-curve',  group: 'buffers_ksp', label: 'Titration Curve',    formula: 'pH/V',     registryId: 'titration-curve' },

  // ── Thermodynamics ──────────────────────────────────────────────────────────
  { id: 'entropy',            group: 'thermo_dynamics', label: 'Entropy (ΔS°)',      formula: 'ΔS°',       registryId: 'entropy-calc'       },
  { id: 'spontaneity',        group: 'thermo_dynamics', label: 'Spontaneity',        formula: 'ΔH/ΔS',     registryId: 'spontaneity'        },
  { id: 'gibbs',              group: 'thermo_dynamics', label: 'Gibbs Free Energy',  formula: 'ΔG=ΔH-TΔS', registryId: 'gibbs-calc'         },
  { id: 'gibbs-equilibrium',  group: 'thermo_dynamics', label: 'ΔG° ↔ K',           formula: 'ΔG=-RTlnK', registryId: 'gibbs-equilibrium'  },
  { id: 'gibbs-temperature',  group: 'thermo_dynamics', label: 'Crossover Temperature', formula: 'T=ΔH/ΔS', registryId: 'gibbs-temperature' },
  { id: 'delta-g-ecell-k',   group: 'thermo_dynamics', label: 'ΔG°/E°cell/K',       formula: 'ΔG↔E↔K',    registryId: 'delta-g-ecell-k'    },
  { id: 'electrolysis',       group: 'thermo_dynamics', label: 'Electrolysis',        formula: 'm=ItM/nF',   registryId: 'electrolysis'       },
  { id: 'concentration-cell', group: 'thermo_dynamics', label: 'Concentration Cell', formula: 'Nernst',     registryId: 'concentration-cell' },

  // ── Nuclear Chemistry ───────────────────────────────────────────────────────
  { id: 'nuclear-decay',    group: 'nuclear', label: 'Nuclear Decay',    formula: 'α/β/γ',   registryId: 'nuclear-decay'   },
  { id: 'nuclear-half-life', group: 'nuclear', label: 'Nuclear Half-Life', formula: 'N=N₀/2ⁿ', registryId: 'nuclear-half-life' },
  { id: 'binding-energy',   group: 'nuclear', label: 'Binding Energy',   formula: 'BE/A',    registryId: 'binding-energy'  },
  { id: 'nuclear-dating',   group: 'nuclear', label: 'Radiocarbon Dating', formula: 't age', registryId: 'nuclear-dating'  },

  // ── Organic Chemistry ───────────────────────────────────────────────────────
  { id: 'hydrocarbons',       group: 'organic', label: 'Hydrocarbons',         formula: 'CₙH…',    registryId: 'alkanes-alkenes'     },
  { id: 'isomers',            group: 'organic', label: 'Isomers',              formula: 'same formula?', registryId: 'isomers'       },
  { id: 'organic-naming',     group: 'organic', label: 'Organic Naming',       formula: 'IUPAC',   registryId: 'organic-naming'      },
  { id: 'functional-groups',  group: 'organic', label: 'Functional Groups',    formula: '-OH, C=O', registryId: 'functional-group-id' },
  { id: 'organic-reactions',  group: 'organic', label: 'Organic Reactions',    formula: 'rxn type', registryId: 'organic-reactions'  },
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
  const { isTopicVisible } = usePreferencesStore()

  const visibleTopics = ALL_PRINT_TOPICS.filter(t => !t.registryId || isTopicVisible(t.registryId))

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleGroup(group: PrintGroup) {
    const groupIds = visibleTopics.filter(t => t.group === group).map(t => t.id)
    const allOn = groupIds.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allOn) groupIds.forEach(id => next.delete(id))
      else       groupIds.forEach(id => next.add(id))
      return next
    })
  }

  function toggleAll() {
    const allOn = visibleTopics.every(t => selected.has(t.id))
    setSelected(allOn ? new Set() : new Set(visibleTopics.map(t => t.id)))
  }

  const count    = selected.size
  const allOn    = visibleTopics.every(t => selected.has(t.id))
  const someOn   = selected.size > 0

  function handlePrint() {
    if (count === 0) return
    const ordered = visibleTopics.filter(t => selected.has(t.id))
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
            const groupTopics = visibleTopics.filter(t => t.group === group)
            if (groupTopics.length === 0) return null
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

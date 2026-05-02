import { useState, useMemo, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { TOPIC_SEARCH_ITEMS, TOOL_SEARCH_ITEMS, type SearchItem } from "../../config/searchIndex";

function useSearchItems(query: string): SearchItem[] {
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)
  return useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    const visibleTopicItems = TOPIC_SEARCH_ITEMS.filter(
      item => !item.topicTabId || isTabVisible(item.topicTabId)
    )
    return [...visibleTopicItems, ...TOOL_SEARCH_ITEMS].filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.formula.toLowerCase().includes(q) ||
      (item.keywords ?? '').toLowerCase().includes(q)
    )
  }, [query, isTabVisible])
}

interface Props {
  open: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

function NavGroup({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 pt-5 pb-1.5 group"
    >
      <span className="font-mono text-xs tracking-[0.12em] text-secondary uppercase">
        {label}
      </span>
      <motion.span
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.15 }}
        className="font-mono text-[9px] text-dim group-hover:text-secondary transition-colors mr-1"
      >
        ▶
      </motion.span>
    </button>
  );
}

// ── Shared sub-item button ────────────────────────────────────────────────────

function SubItem({ formula, label, isActive, onClick }: {
  formula: string; label: string; isActive: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 pl-12 pr-3 py-1.5 mx-2 rounded-sm font-sans text-sm lg:text-[13.5px]
                  transition-all duration-150 text-left
                  ${isActive
                    ? "bg-raised text-bright border border-border"
                    : "text-secondary hover:text-primary hover:bg-surface border border-transparent"
                  }`}
      style={{ width: "calc(100% - 16px)" }}
    >
      <span className="nav-sub-formula font-mono text-[9px] shrink-0">{formula}</span>
      <span className="truncate text-[14px]">{label}</span>
    </button>
  )
}

// ── Generic path-based sub-item ───────────────────────────────────────────────

function PathSubItem({ path, formula, label, onNavigate }: {
  path: string; formula: string; label: string; onNavigate: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [itemPath, itemQuery] = path.split('?')
  const itemParams = itemQuery ? new URLSearchParams(itemQuery) : null
  const currentParams = new URLSearchParams(location.search)
  const isActive = itemParams
    ? location.pathname === itemPath && [...itemParams.entries()].every(([k, v]) => currentParams.get(k) === v)
    : location.pathname === path

  return (
    <SubItem formula={formula} label={label} isActive={isActive}
      onClick={() => { navigate(path); onNavigate() }} />
  )
}

// ── Periodic Table sub-items ──────────────────────────────────────────────────

const TABLE_GROUPS: { label: string; items: { path: string; label: string; formula: string; topicTabId?: string }[] }[] = [
  {
    label: 'Elements',
    items: [
      { path: '/table', label: 'Periodic Table', formula: '⬡' }, // no topicTabId = always shown
    ],
  },
  {
    label: 'Electron Config',
    items: [
      { path: '/electron-config?topic=electron_config', label: 'Electron Config',  formula: 'e⁻',  topicTabId: 'electron_config' },
      { path: '/electron-config?topic=quantum_numbers', label: 'Quantum Numbers',  formula: 'QN',  topicTabId: 'quantum_numbers' },
      { path: '/electron-config?topic=energy_levels',   label: 'Energy Levels',    formula: 'Eₙ',  topicTabId: 'energy_levels'   },
      { path: '/electron-config?topic=multi_electron',  label: 'Multi-Electron',   formula: 'Zeff', topicTabId: 'multi_electron'  },
    ],
  },
  {
    label: 'Properties',
    items: [
      { path: '/electron-config?topic=periodic_trends', label: 'Periodic Trends',   formula: '↗',  topicTabId: 'periodic_trends' },
      { path: '/electron-config?topic=isoelectronic',   label: 'Isoelectronic',     formula: '≡',  topicTabId: 'isoelectronic'   },
      { path: '/electron-config?topic=em_spectrum',     label: 'EM Spectrum',       formula: 'λf', topicTabId: 'em_spectrum'     },
      { path: '/electron-config?topic=isotopes',        label: 'Isotope Abundance', formula: 'Ā',  topicTabId: 'isotopes'        },
    ],
  },
  {
    label: 'Nomenclature',
    items: [
      { path: '/electron-config?topic=naming', label: 'Naming Rules', formula: 'Nm', topicTabId: 'naming' },
    ],
  },
]

function TableGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTopic = new URLSearchParams(location.search).get('topic') ?? 'electron_config'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = TABLE_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => !i.topicTabId || isTabVisible(i.topicTabId)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = TABLE_GROUPS.find(g => g.items.some(i => {
      const [p, q] = i.path.split('?')
      const t = q ? new URLSearchParams(q).get('topic') : null
      return t ? location.pathname === p && currentTopic === t : location.pathname === p
    }))
    return new Set(active ? [active.label] : ['Elements'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => {
          const [p, q] = i.path.split('?')
          const t = q ? new URLSearchParams(q).get('topic') : null
          return t
            ? location.pathname === p && currentTopic === t
            : location.pathname === p
        })
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => {
                    const [p, q] = item.path.split('?')
                    const t = q ? new URLSearchParams(q).get('topic') : null
                    const isActive = t
                      ? location.pathname === p && currentTopic === t
                      : location.pathname === p
                    return (
                      <SubItem key={item.path} formula={item.formula} label={item.label} isActive={isActive}
                        onClick={() => { navigate(item.path); onNavigate() }} />
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Base Calculations sub-items ───────────────────────────────────────────────

const BASE_CALC_ITEMS: { tab?: string; label: string; formula: string }[] = [
  { tab: "sig-figs",      label: "Sig Figs",        formula: "sf"    },
  { tab: "sci-notation",  label: "Sci Notation",     formula: "×10ⁿ"  },
  { tab: "conversions",   label: "Unit Conversions", formula: "↔"     },
  { tab: "percent-error", label: "Percent Error",    formula: "%err"  },
]

function BaseCalcSubItem({ item, onNavigate }: { item: typeof BASE_CALC_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "sig-figs"
  const isActive = location.pathname === "/base-calculations" && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/base-calculations?tab=${item.tab}`); onNavigate() }} />
  )
}

// ── Empirical sub-items ───────────────────────────────────────────────────────

// ── Molar Calculations sub-items ─────────────────────────────────────────────

type CalcItem = { tab: string; label: string; formula: string }

const CALC_GROUPS: { label: string; items: CalcItem[] }[] = [
  {
    label: 'Basic',
    items: [
      { tab: "ref-moles",    label: "Moles",    formula: "n = m/M" },
      { tab: "ref-molarity", label: "Molarity", formula: "C = n/V" },
      { tab: "ref-molality", label: "Molality", formula: "b = n/m" },
    ],
  },
  {
    label: 'Solutions',
    items: [
      { tab: "ref-molar-volume", label: "Molar Volume", formula: "Vm"    },
      { tab: "ref-dilution",     label: "Dilution",     formula: "C₁V₁" },
      { tab: "ref-other",        label: "More",         formula: "…"     },
    ],
  },
  {
    label: 'Colligative',
    items: [
      { tab: "ref-colligative-bpe", label: "BP Elevation",  formula: "ΔTb" },
      { tab: "ref-colligative-fpd", label: "FP Depression", formula: "ΔTf" },
    ],
  },
]

function CalcSubItem({ item, onNavigate }: { item: CalcItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "ref-moles"
  const isActive = location.pathname === "/calculations" && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/calculations?tab=${item.tab}`); onNavigate() }} />
  )
}

function CalcGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "ref-moles"
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = CALC_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = CALC_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Basic'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === "/calculations"
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <CalcSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Ideal Gas sub-items ───────────────────────────────────────────────────────

type IdealGasItem = { tab: string; label: string; formula: string }

const IDEAL_GAS_GROUPS: { label: string; items: IdealGasItem[] }[] = [
  {
    label: 'Gas Laws',
    items: [
      { tab: 'ref-combined', label: 'Combined Gas Law', formula: 'P₁V₁/T₁' },
      { tab: 'ref-daltons',  label: "Dalton's Law",     formula: 'Ptot'     },
      { tab: 'ref-grahams',  label: "Graham's Law",     formula: '√M'       },
      { tab: 'ref-density',  label: 'Gas Density',      formula: 'ρ=MP/RT'  },
    ],
  },
  {
    label: 'Real Gas & Distributions',
    items: [
      { tab: 'ref-vdw',     label: 'Van der Waals',     formula: 'vdW'  },
      { tab: 'ref-maxwell', label: 'Maxwell-Boltzmann', formula: 'f(v)' },
    ],
  },
]

function IdealGasSubItem({ item, onNavigate }: { item: IdealGasItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-combined'
  const isActive = location.pathname === '/ideal-gas' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/ideal-gas?tab=${item.tab}`); onNavigate() }} />
  )
}

function IdealGasGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-combined'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = IDEAL_GAS_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = IDEAL_GAS_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Ideal Gas'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/ideal-gas'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <IdealGasSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Stoichiometry sub-items ───────────────────────────────────────────────────

type StoichItem = { tab: string; label: string; formula: string }

const STOICH_GROUPS: { label: string; items: StoichItem[] }[] = [
  {
    label: 'Basic',
    items: [
      { tab: 'percent',         label: 'Percent Yield', formula: '%Y'  },
      { tab: 'balance-practice', label: 'Balance',      formula: '_□_' },
    ],
  },
  {
    label: 'Stoichiometry',
    items: [
      { tab: 'stoich',      label: 'Stoichiometry',      formula: 'g↔mol' },
      { tab: 'limiting',    label: 'Limiting Reagent',   formula: 'LR'    },
      { tab: 'theoretical', label: 'Theoretical Yield',  formula: 'T.Y.'  },
      { tab: 'mol-diagram', label: 'Molecular Diagrams', formula: '●○'    },
    ],
  },
  {
    label: 'Advanced',
    items: [
      { tab: 'adv-percent',         label: 'Percent Yield',   formula: 'TY→%' },
      { tab: 'chained-yield',       label: 'Chained Yield',   formula: 'm→%Y' },
      { tab: 'solution',            label: 'Solution Stoich', formula: 'M·V'  },
      { tab: 'gas-stoich-practice', label: 'Gas Stoich',      formula: 'PV'   },
    ],
  },
]

function StoichSubItem({ item, onNavigate }: { item: StoichItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'stoich'
  const isActive = location.pathname === '/stoichiometry' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/stoichiometry?tab=${item.tab}`); onNavigate() }} />
  )
}

function StoichGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'stoich'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = STOICH_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = STOICH_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Basic'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/stoichiometry'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <StoichSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Redox sub-items ───────────────────────────────────────────────────────────

type RedoxItem = { tab: string; label: string; formula: string }

const REDOX_GROUPS: { label: string; items: RedoxItem[] }[] = [
  {
    label: 'Reactions',
    items: [
      { tab: 'classifier',    label: 'Rxn Classifier', formula: '⇄' },
      { tab: 'net-ionic',     label: 'Net Ionic',       formula: '⇌' },
      { tab: 'predictor',     label: 'Rxn Predictor',   formula: '→' },
      { tab: 'activity',      label: 'Activity Series', formula: '↕' },
    ],
  },
  {
    label: 'Electrochemistry',
    items: [
      { tab: 'electrolyte',    label: 'Electrolyte',       formula: '⚡'      },
      { tab: 'redox-practice', label: 'Redox',             formula: 'e⁻'     },
      { tab: 'ecell',          label: 'E°cell / Nernst',   formula: 'E°'      },
      { tab: 'ref-dg-e-k',    label: 'ΔG°-E°-K Triangle', formula: '-nFE°'   },
      { tab: 'ref-electrolysis', label: 'Electrolysis',    formula: 'Faraday' },
      { tab: 'ref-conc-cell',  label: 'Conc. Cell',        formula: 'ΔC'      },
    ],
  },
  {
    label: 'Titrations',
    items: [
      { tab: 'titration',          label: 'Titration',          formula: 'MₐVₐ=MᵦVᵦ' },
      { tab: 'titration-problems', label: 'Titration Problems',  formula: '✎' },
    ],
  },
]

function RedoxSubItem({ item, onNavigate }: { item: RedoxItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'classifier'
  const isActive = location.pathname === '/redox' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/redox?tab=${item.tab}`); onNavigate() }} />
  )
}

function RedoxGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'classifier'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = REDOX_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = REDOX_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Reactions'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/redox'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <RedoxSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Structures sub-items ──────────────────────────────────────────────────────

const STRUCTURE_ITEMS = [
  { path: "/structures?tab=lewis",         tab: "lewis",         label: "Lewis Structures", formula: "⌬"         },
  { path: "/structures?tab=vsepr",         tab: "vsepr",         label: "VSEPR",            formula: "⬡"         },
  { path: "/structures?tab=formal-charge", tab: "formal-charge", label: "Formal Charge",    formula: "FC"        },
  { path: "/structures?tab=solid-types",   tab: "solid-types",   label: "Solid Types",      formula: "4 types"   },
  { path: "/structures?tab=unit-cell",     tab: "unit-cell",     label: "Unit Cell",        formula: "SC/BCC/FCC"},
]

// ── Kinetics sub-items ───────────────────────────────────────────────────────

type KineticsItem = { tab: string; label: string; formula: string }

const KINETICS_GROUPS: { label: string; items: KineticsItem[] }[] = [
  {
    label: 'Rate Laws',
    items: [
      { tab: 'ref-rate-law',  label: 'Rate Law',  formula: 'k[A]ⁿ'      },
      { tab: 'ref-arrhenius', label: 'Arrhenius', formula: 'k=Ae⁻ᴱᵃ/ᴿᵀ' },
    ],
  },
  {
    label: 'Integrated Rates',
    items: [
      { tab: 'ref-integrated', label: 'Integrated Rate', formula: 'ln[A]' },
      { tab: 'ref-half-life',  label: 'Half-Life',       formula: 't½'    },
      { tab: 'ref-mechanisms', label: 'Mechanisms',      formula: 'mech'  },
    ],
  },
]

function KineticsSubItem({ item, onNavigate }: { item: KineticsItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-rate-law'
  const isActive = location.pathname === '/kinetics' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/kinetics?tab=${item.tab}`); onNavigate() }} />
  )
}

function KineticsGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-rate-law'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = KINETICS_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = KINETICS_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Rate Laws'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/kinetics'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <KineticsSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Thermochemistry sub-items ─────────────────────────────────────────────────

const THERMO_GROUPS: { label: string; items: { tab: string; label: string; formula: string }[] }[] = [
  {
    label: 'Thermochemistry',
    items: [
      { tab: 'calorimetry-reference', label: 'Calorimetry',    formula: 'q'    },
      { tab: 'enthalpy-reference',    label: 'Enthalpy ΔHrxn', formula: 'ΔH'   },
      { tab: 'hess-reference',        label: "Hess's Law",     formula: 'ΣΔH'  },
      { tab: 'bond-reference',        label: 'Bond Enthalpy',  formula: 'BE'   },
    ],
  },
  {
    label: 'Heat & Phase Changes',
    items: [
      { tab: 'profile',                   label: 'Reaction Profiles', formula: '⇀'    },
      { tab: 'heattransfer-reference',    label: 'Heat Transfer',     formula: 'q₁=−q₂' },
      { tab: 'heating-curve-reference',   label: 'Heating Curves',    formula: 'q/T'  },
      { tab: 'energy-balance',            label: 'Energy Balance',    formula: 'q+q=0' },
    ],
  },
  {
    label: 'Phase Behavior',
    items: [
      { tab: 'phase-diagram-reference', label: 'Phase Diagrams',    formula: 'P-T'  },
      { tab: 'liquid-props',            label: 'Liquid Props',      formula: 'γ/η'  },
      { tab: 'cc-reference',            label: 'Clausius-Clap.',    formula: 'ln P' },
    ],
  },
]

function ThermoGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'calorimetry'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = THERMO_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = THERMO_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Thermochemistry'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/thermochemistry'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => {
                    const isActive = location.pathname === '/thermochemistry' && currentTab === item.tab
                    return (
                      <SubItem key={item.tab} formula={item.formula} label={item.label} isActive={isActive}
                        onClick={() => { navigate(`/thermochemistry?tab=${item.tab}`); onNavigate() }} />
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Equilibrium sub-items ────────────────────────────────────────────────────

type EquilibriumItem = { tab: string; label: string; formula: string }

const EQUILIBRIUM_GROUPS: { label: string; items: EquilibriumItem[] }[] = [
  {
    label: 'Concepts',
    items: [
      { tab: 'ref-keq',          label: 'K Expression',   formula: 'Kc'   },
      { tab: 'ref-q-vs-k',       label: 'Q vs K',          formula: 'Q/K'  },
      { tab: 'ref-le-chatelier', label: "Le Chatelier's",  formula: 'shift'},
    ],
  },
  {
    label: 'Calculations',
    items: [
      { tab: 'ref-ice-table', label: 'ICE Table',    formula: 'ICE'      },
      { tab: 'ref-kp-kc',    label: 'Kp \u2194 Kc', formula: 'RT\u0394n' },
    ],
  },
]

function EquilibriumSubItem({ item, onNavigate }: { item: EquilibriumItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-keq'
  const isActive = location.pathname === '/equilibrium' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/equilibrium?tab=${item.tab}`); onNavigate() }} />
  )
}

function EquilibriumGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-keq'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = EQUILIBRIUM_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = EQUILIBRIUM_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Concepts'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/equilibrium'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <EquilibriumSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Buffers & Solubility sub-items ───────────────────────────────────────────

type BuffersItem = { tab: string; label: string; formula: string }

const BUFFERS_GROUPS: { label: string; items: BuffersItem[] }[] = [
  {
    label: 'Buffers',
    items: [
      { tab: 'ref-buffer',     label: 'Buffer pH',      formula: 'H-H'     },
      { tab: 'ref-buffer-cap', label: 'Buffer Capacity', formula: 'capacity' },
    ],
  },
  {
    label: 'Titration Curves',
    items: [
      { tab: 'ref-titration-curve', label: 'Titration Curves', formula: 'pH vs V' },
    ],
  },
  {
    label: 'Solubility',
    items: [
      { tab: 'ref-ksp',           label: 'Ksp',           formula: 'Ksp'     },
      { tab: 'ref-common-ion',    label: 'Common Ion',    formula: 'common'  },
      { tab: 'ref-precipitation', label: 'Precipitation', formula: 'Q vs Ksp' },
    ],
  },
]

function BuffersSubItem({ item, onNavigate }: { item: BuffersItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-buffer'
  const isActive = location.pathname === '/buffers' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/buffers?tab=${item.tab}`); onNavigate() }} />
  )
}

function BuffersGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-buffer'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = BUFFERS_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = BUFFERS_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Buffers'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/buffers'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <BuffersSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Acids & Bases sub-items ──────────────────────────────────────────────────

type AcidBaseItem = { tab: string; label: string; formula: string }

const ACID_BASE_GROUPS: { label: string; items: AcidBaseItem[] }[] = [
  {
    label: 'pH Fundamentals',
    items: [
      { tab: 'ref-ph',     label: 'pH Calculator', formula: 'pH'    },
      { tab: 'ref-ka-kb',  label: 'Ka / Kb',       formula: 'Ka×Kb' },
    ],
  },
  {
    label: 'Weak Acid / Base',
    items: [
      { tab: 'ref-weak-acid', label: 'Weak Acid pH', formula: 'Ka=x²/C' },
      { tab: 'ref-weak-base', label: 'Weak Base pH', formula: 'Kb=x²/C' },
    ],
  },
  {
    label: 'Salts & Polyprotic',
    items: [
      { tab: 'ref-salt-ph',    label: 'Salt pH',         formula: 'A⁻+H₂O' },
      { tab: 'ref-polyprotic', label: 'Polyprotic Acids', formula: 'Ka1≫Ka2' },
    ],
  },
]

function AcidBaseSubItem({ item, onNavigate }: { item: AcidBaseItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-ph'
  const isActive = location.pathname === '/acid-base' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/acid-base?tab=${item.tab}`); onNavigate() }} />
  )
}

function AcidBaseGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-ph'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = ACID_BASE_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = ACID_BASE_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['pH Fundamentals'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/acid-base'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <AcidBaseSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Thermodynamics sub-items ──────────────────────────────────────────────────

type ThermodynamicsItem = { tab: string; label: string; formula: string }

const THERMODYNAMICS_GROUPS: { label: string; items: ThermodynamicsItem[] }[] = [
  {
    label: 'Entropy',
    items: [
      { tab: 'ref-entropy',     label: 'ΔS° Calculation', formula: 'ΣnS°' },
      { tab: 'ref-spontaneity', label: 'Spontaneity',      formula: 'ΔG<0' },
    ],
  },
  {
    label: 'Gibbs Energy',
    items: [
      { tab: 'ref-gibbs',      label: 'ΔG° Calculation',   formula: 'ΔH-TΔS'  },
      { tab: 'ref-gibbs-k',    label: 'ΔG° ↔ K',          formula: '-RTlnK' },
      { tab: 'ref-gibbs-temp', label: 'ΔG vs Temperature', formula: 'T=ΔH/ΔS' },
    ],
  },
]

function ThermodynamicsSubItem({ item, onNavigate }: { item: ThermodynamicsItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-entropy'
  const isActive = location.pathname === '/thermodynamics' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/thermodynamics?tab=${item.tab}`); onNavigate() }} />
  )
}

function ThermodynamicsGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-entropy'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = THERMODYNAMICS_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = THERMODYNAMICS_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Entropy'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/thermodynamics'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <ThermodynamicsSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Nuclear Chemistry sub-items ──────────────────────────────────────────────

type NuclearItem = { tab: string; label: string; formula: string }

const NUCLEAR_GROUPS: { label: string; items: NuclearItem[] }[] = [
  {
    label: 'Nuclear Reactions',
    items: [
      { tab: 'ref-decay',      label: 'Nuclear Decay', formula: 'α,β,γ' },
      { tab: 'ref-nuclear-hl', label: 'Half-Life',      formula: 't½'    },
    ],
  },
  {
    label: 'Applications',
    items: [
      { tab: 'ref-binding', label: 'Binding Energy',    formula: 'Δm·c²' },
      { tab: 'ref-dating',  label: 'Radiometric Dating', formula: '¹⁴C'  },
    ],
  },
]

function NuclearSubItem({ item, onNavigate }: { item: NuclearItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-decay'
  const isActive = location.pathname === '/nuclear' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/nuclear?tab=${item.tab}`); onNavigate() }} />
  )
}

function NuclearGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-decay'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = NUCLEAR_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = NUCLEAR_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Nuclear Reactions'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/nuclear'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <NuclearSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Organic Chemistry sub-items ───────────────────────────────────────────────

type OrganicItem = { tab: string; label: string; formula: string }

const ORGANIC_GROUPS: { label: string; items: OrganicItem[] }[] = [
  {
    label: 'Hydrocarbons',
    items: [
      { tab: 'ref-hydrocarbons',   label: 'Hydrocarbons', formula: 'CₙH'   },
      { tab: 'ref-isomers',        label: 'Isomers',       formula: 'C₄H₁₀' },
      { tab: 'ref-organic-naming', label: 'IUPAC Naming',  formula: 'IUPAC' },
    ],
  },
  {
    label: 'Functional Groups',
    items: [
      { tab: 'ref-func-groups', label: 'Functional Groups', formula: 'R-OH' },
      { tab: 'ref-organic-rxn', label: 'Common Reactions',  formula: 'rxn'  },
    ],
  },
]

function OrganicSubItem({ item, onNavigate }: { item: OrganicItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-hydrocarbons'
  const isActive = location.pathname === '/organic' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/organic?tab=${item.tab}`); onNavigate() }} />
  )
}

function OrganicGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-hydrocarbons'
  const isTabVisible = usePreferencesStore(s => s.isTabVisible)

  const visibleGroups = ORGANIC_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => isTabVisible(i.tab)) }))
    .filter(g => g.items.length > 0)

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = ORGANIC_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Hydrocarbons'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) { next.delete(label) } else { next.add(label) }
      return next
    })
  }

  return (
    <>
      {visibleGroups.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/organic'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
                {group.label}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[7px] text-dim group-hover:text-secondary transition-colors"
              >
                ▶
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => (
                    <OrganicSubItem key={item.tab} item={item} onNavigate={onNavigate} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </>
  )
}

// ── Practice / top-level nav items ────────────────────────────────────────────

function PracticeNavItem({ path, icon, label, onNavigate }: {
  path: string; icon: string; label: string; onNavigate: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [itemPath, itemQuery] = path.split('?')
  const itemParams = itemQuery ? new URLSearchParams(itemQuery) : null
  const currentParams = new URLSearchParams(location.search)
  const isActive = itemParams
    ? location.pathname === itemPath && [...itemParams.entries()].every(([k, v]) => currentParams.get(k) === v)
    : location.pathname === path

  return (
    <button
      onClick={() => { navigate(path); onNavigate() }}
      className={`w-full flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm lg:text-[13.5px]
                  transition-all duration-150 text-left
                  ${isActive ? "text-bright" : "text-secondary hover:text-primary"}`}
      style={{ width: "calc(100% - 16px)" }}
    >
      <span
        className={`font-mono leading-none shrink-0 w-4 text-center ${icon.length > 2 ? 'text-[9px]' : 'text-base'}`}
        style={{ color: isActive ? "var(--c-halogen)" : "rgb(var(--color-secondary))" }}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

function TestNavItem({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === "/test"

  return (
    <button
      onClick={() => { navigate("/test"); onNavigate() }}
      className={`w-full flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm lg:text-[13.5px]
                  transition-all duration-150 text-left
                  ${isActive ? "text-bright" : "text-secondary hover:text-primary"}`}
      style={{ width: "calc(100% - 16px)" }}
    >
      <span className="font-mono text-base leading-none shrink-0 w-4 text-center"
        style={{ color: isActive ? "var(--c-halogen)" : "rgb(var(--color-secondary))" }}>
        ✎
      </span>
      <span className="flex-1">Test Generator</span>
    </button>
  )
}

// ── Expandable section ────────────────────────────────────────────────────────

function ExpandableSection({ icon, label, isActive, expanded, onToggle, children }: {
  icon: string; label: string; isActive: boolean; expanded: boolean; onToggle: () => void; children: ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm lg:text-[13.5px]
                    transition-all duration-150 text-left
                    ${isActive ? "text-bright" : "text-secondary hover:text-primary"}`}
        style={{ width: "calc(100% - 16px)" }}
      >
        <span
          className={`font-mono leading-none shrink-0 w-4 text-center ${icon.length > 2 ? 'text-[9px]' : 'text-base'}`}
          style={{ color: isActive ? "var(--c-halogen)" : "rgb(var(--color-secondary))" }}
        >
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="font-mono text-[10px] text-dim">
          ▶
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-0.5 py-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function NavSidebar({ open, onClose, theme, onToggleTheme }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const currentPath    = location.pathname
  const isTabVisible   = usePreferencesStore(s => s.isTabVisible)
  const searchResults  = useSearchItems(query)

  // Compute whether each expandable section has at least one visible item
  const showBaseCalc  = [...BASE_CALC_ITEMS.map(i => i.tab).filter((t): t is string => t != null), 'empirical'].some(t => isTabVisible(t))
  const showIdealGas  = IDEAL_GAS_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showMolar     = CALC_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  // Periodic Table section always visible (the /table route has no topicTabId)
  const showTable     = true
  const showStoich    = STOICH_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showRedox     = REDOX_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showStructures = STRUCTURE_ITEMS.some(i => isTabVisible(i.tab))
  const showThermo    = THERMO_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showKinetics  = KINETICS_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showEquilibrium = EQUILIBRIUM_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showAcidBase = ACID_BASE_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showBuffers = BUFFERS_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showThermodynamics = THERMODYNAMICS_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showNuclear = NUCLEAR_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))
  const showOrganic = ORGANIC_GROUPS.flatMap(g => g.items.map(i => i.tab)).some(t => isTabVisible(t))

  const [refCalcOpen,        setRefCalcOpen]        = useState(true)
  const [pracSectionOpen,    setPracSectionOpen]    = useState(true)
  const [toolsSectionOpen,   setToolsSectionOpen]   = useState(currentPath === '/tools' || currentPath === '/compound' || currentPath === '/reference' || currentPath === '/settings')
  const [kineticsNavExpanded, setKineticsNavExpanded] = useState(currentPath === '/kinetics')
  const [equilibriumNavExpanded, setEquilibriumNavExpanded] = useState(currentPath === '/equilibrium')
  const [acidBaseNavExpanded, setAcidBaseNavExpanded] = useState(currentPath === '/acid-base')
  const [buffersNavExpanded, setBuffersNavExpanded] = useState(currentPath === '/buffers')
  const [thermodynamicsNavExpanded, setThermodynamicsNavExpanded] = useState(currentPath === '/thermodynamics')
  const [nuclearNavExpanded, setNuclearNavExpanded] = useState(currentPath === '/nuclear')
  const [organicNavExpanded, setOrganicNavExpanded] = useState(currentPath === '/organic')

  // ── Reference / Calculations expandables ────────────────────────────────────
  const [tableExpanded,       setTableExpanded]       = useState(currentPath === "/table" || currentPath === "/electron-config")
  const [baseCalcExpanded,    setBaseCalcExpanded]    = useState(currentPath === "/base-calculations" || currentPath === "/empirical")
  const [calcExpanded,        setCalcExpanded]        = useState(currentPath === "/calculations")
  const [stoichExpanded,      setStoichExpanded]      = useState(currentPath === "/stoichiometry")
  const [redoxExpanded,       setRedoxExpanded]       = useState(currentPath === "/redox")
  const [structExpanded,      setStructExpanded]      = useState(currentPath === "/structures")
  const [thermoExpanded,      setThermoExpanded]      = useState(currentPath === "/thermochemistry")
  const [idealGasNavExpanded, setIdealGasNavExpanded] = useState(currentPath === '/ideal-gas')

  const isTableActive      = currentPath === "/table" || currentPath === "/electron-config"
  const isBaseCalcActive   = currentPath === "/base-calculations" || currentPath === "/empirical"
  const isMolarCalcActive  = currentPath === "/calculations"
  const isStoichActive     = currentPath === "/stoichiometry"
  const isRedoxActive      = currentPath === "/redox"
  const isStructActive     = currentPath === "/structures"
  const isThermoActive     = currentPath === "/thermochemistry"
  const isIdealGasNavActive = currentPath === '/ideal-gas'
  const isKineticsNavActive = currentPath === '/kinetics'
  const isEquilibriumNavActive = currentPath === '/equilibrium'
  const isAcidBaseNavActive = currentPath === '/acid-base'
  const isBuffersNavActive = currentPath === '/buffers'
  const isThermodynamicsNavActive = currentPath === '/thermodynamics'
  const isNuclearNavActive = currentPath === '/nuclear'
  const isOrganicNavActive = currentPath === '/organic'

  const inner = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg lg:text-xl font-semibold" style={{ color: "var(--c-halogen)" }}>⚛</span>
          <span className="font-sans font-semibold text-bright tracking-tight lg:text-lg">
            Chem<span style={{ color: "var(--c-halogen)" }}>Helper</span>
          </span>
        </div>
        <p className="font-mono text-[9px] lg:text-[10px] text-dim mt-0.5 tracking-wider">CHEMISTRY TOOLKIT</p>
        {/* Search */}
        <div className="relative mt-3">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-dim pointer-events-none">⌕</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search topics…"
            className="w-full font-mono text-xs pl-6 pr-7 py-1.5 rounded-sm border border-border bg-raised text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-dim hover:text-secondary transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">

        {/* Search results */}
        {query.trim() && (() => {
          return (
            <div className="flex flex-col gap-0.5 py-2">
              {searchResults.length === 0 ? (
                <p className="font-mono text-xs text-dim px-5 py-3">No results for "{query}"</p>
              ) : searchResults.map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setQuery(''); onClose() }}
                  className="w-full flex items-center gap-2 pl-4 pr-3 py-1.5 mx-2 rounded-sm font-sans text-sm text-left text-secondary hover:text-primary hover:bg-surface transition-all"
                  style={{ width: 'calc(100% - 16px)' }}
                >
                  <span className="nav-sub-formula font-mono text-[9px] shrink-0 w-8 text-right">{item.formula}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-[13px]">{item.label}</span>
                    <span className="font-mono text-[9px] text-dim">{item.section}</span>
                  </div>
                </button>
              ))}
            </div>
          )
        })()}

        {/* Normal nav — hidden during search */}
        {!query.trim() && (<>
          {/* Reference / Calculations */}
          <NavGroup label="Topics" expanded={refCalcOpen} onToggle={() => setRefCalcOpen(e => !e)} />
          <AnimatePresence initial={false}>
            {refCalcOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                {showBaseCalc && (
                  <ExpandableSection
                    icon="±" label="Base Calculations"
                    isActive={isBaseCalcActive} expanded={baseCalcExpanded}
                    onToggle={() => setBaseCalcExpanded(e => !e)}
                  >
                    {BASE_CALC_ITEMS.filter(i => i.tab != null && isTabVisible(i.tab)).map((item, idx) => (
                      <BaseCalcSubItem key={idx} item={item} onNavigate={onClose} />
                    ))}
                    {isTabVisible('empirical') && (
                      <PathSubItem path="/empirical" formula="⌬" label="Empirical Formula" onNavigate={onClose} />
                    )}
                  </ExpandableSection>
                )}

                {showIdealGas && (
                  <ExpandableSection
                    icon="PV" label="Ideal Gas Law"
                    isActive={isIdealGasNavActive} expanded={idealGasNavExpanded}
                    onToggle={() => setIdealGasNavExpanded(e => !e)}
                  >
                    <IdealGasGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showMolar && (
                  <ExpandableSection
                    icon="⚗" label="Molar Calculations"
                    isActive={isMolarCalcActive} expanded={calcExpanded}
                    onToggle={() => setCalcExpanded(e => !e)}
                  >
                    <CalcGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showTable && (
                  <ExpandableSection
                    icon="⬡" label="Periodic Table"
                    isActive={isTableActive} expanded={tableExpanded}
                    onToggle={() => setTableExpanded(e => !e)}
                  >
                    <TableGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showRedox && (
                  <ExpandableSection
                    icon="⇌" label="Reactions / Redox"
                    isActive={isRedoxActive} expanded={redoxExpanded}
                    onToggle={() => setRedoxExpanded(e => !e)}
                  >
                    <RedoxGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                <PracticeNavItem path="/reference?tab=solubility" icon="S/I" label="Solubility" onNavigate={onClose} />

                {showStoich && (
                  <ExpandableSection
                    icon="⚖" label="Stoichiometry"
                    isActive={isStoichActive} expanded={stoichExpanded}
                    onToggle={() => setStoichExpanded(e => !e)}
                  >
                    <StoichGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showStructures && (
                  <ExpandableSection
                    icon="⬡" label="Structures"
                    isActive={isStructActive} expanded={structExpanded}
                    onToggle={() => setStructExpanded(e => !e)}
                  >
                    {STRUCTURE_ITEMS.filter(i => isTabVisible(i.tab)).map((item, idx) => (
                      <PathSubItem key={idx} path={item.path} formula={item.formula} label={item.label} onNavigate={onClose} />
                    ))}
                  </ExpandableSection>
                )}

                {showThermo && (
                  <ExpandableSection
                    icon="ΔH" label="Thermochemistry"
                    isActive={isThermoActive} expanded={thermoExpanded}
                    onToggle={() => setThermoExpanded(e => !e)}
                  >
                    <ThermoGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showKinetics && (
                  <ExpandableSection
                    icon="k" label="Chemical Kinetics"
                    isActive={isKineticsNavActive} expanded={kineticsNavExpanded}
                    onToggle={() => setKineticsNavExpanded(e => !e)}
                  >
                    <KineticsGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showEquilibrium && (
                  <ExpandableSection
                    icon="\u21cc" label="Chemical Equilibrium"
                    isActive={isEquilibriumNavActive} expanded={equilibriumNavExpanded}
                    onToggle={() => setEquilibriumNavExpanded(e => !e)}
                  >
                    <EquilibriumGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showAcidBase && (
                  <ExpandableSection
                    icon="pH" label="Acids &amp; Bases"
                    isActive={isAcidBaseNavActive} expanded={acidBaseNavExpanded}
                    onToggle={() => setAcidBaseNavExpanded(e => !e)}
                  >
                    <AcidBaseGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showBuffers && (
                  <ExpandableSection
                    icon="β" label="Buffers &amp; Solubility"
                    isActive={isBuffersNavActive} expanded={buffersNavExpanded}
                    onToggle={() => setBuffersNavExpanded(e => !e)}
                  >
                    <BuffersGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showThermodynamics && (
                  <ExpandableSection
                    icon="ΔG" label="Thermodynamics"
                    isActive={isThermodynamicsNavActive} expanded={thermodynamicsNavExpanded}
                    onToggle={() => setThermodynamicsNavExpanded(e => !e)}
                  >
                    <ThermodynamicsGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showNuclear && (
                  <ExpandableSection
                    icon="⚛" label="Nuclear Chemistry"
                    isActive={isNuclearNavActive} expanded={nuclearNavExpanded}
                    onToggle={() => setNuclearNavExpanded(e => !e)}
                  >
                    <NuclearGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

                {showOrganic && (
                  <ExpandableSection
                    icon="C" label="Organic Chemistry"
                    isActive={isOrganicNavActive} expanded={organicNavExpanded}
                    onToggle={() => setOrganicNavExpanded(e => !e)}
                  >
                    <OrganicGroupedItems onNavigate={onClose} />
                  </ExpandableSection>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Practice */}
          <NavGroup label="Practice" expanded={pracSectionOpen} onToggle={() => setPracSectionOpen(e => !e)} />
          <AnimatePresence initial={false}>
            {pracSectionOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <TestNavItem onNavigate={onClose} />
                <PracticeNavItem path="/print" icon="⎙" label="Print Reference" onNavigate={onClose} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tools */}
          <NavGroup label="Tools/Reference" expanded={toolsSectionOpen} onToggle={() => setToolsSectionOpen(e => !e)} />
          <AnimatePresence initial={false}>
            {toolsSectionOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <PracticeNavItem path="/tools?tool=ketcher" icon="✎" label="Ketcher Editor" onNavigate={onClose} />
                <PracticeNavItem path="/compound" icon="◈" label="Compound" onNavigate={onClose} />
                <PracticeNavItem path="/glossary" icon="Az" label="Glossary" onNavigate={onClose} />
                <PracticeNavItem path="/settings" icon="⚙" label="Settings" onNavigate={onClose} />
                <button
                  onClick={onToggleTheme}
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="w-full flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm lg:text-[13.5px] transition-all duration-150 text-left text-secondary hover:text-primary"
                  style={{ width: 'calc(100% - 16px)' }}
                >
                  <span className="font-mono text-base leading-none shrink-0 w-4 text-center" style={{ color: 'rgb(var(--color-secondary))' }}>
                    {theme === 'dark' ? '☀' : '☾'}
                  </span>
                  <span className="flex-1">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>)}

      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <p className="font-mono text-[9px] text-dim text-center tracking-widest">v0.1.0</p>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex flex-col w-60 lg:w-72 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
        {inner}
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="nav-backdrop"
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              key="nav-drawer"
              className="fixed top-0 left-0 h-full w-60 bg-surface border-r border-border z-50 md:hidden"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
            >
              {inner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

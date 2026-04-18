import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
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
      <span className="font-mono text-[9px] opacity-50 shrink-0">{formula}</span>
      <span className="truncate text-xs">{label}</span>
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

const TABLE_ITEMS = [
  { path: "/table",                                  label: "Periodic Table",  formula: "⬡"  },
  { path: "/electron-config?topic=electron_config",  label: "Electron Config", formula: "e⁻" },
  { path: "/electron-config?topic=quantum_numbers",  label: "Quantum Numbers", formula: "QN" },
  { path: "/electron-config?topic=energy_levels",    label: "Energy Levels",   formula: "Eₙ" },
  { path: "/electron-config?topic=isoelectronic",    label: "Isoelectronic",   formula: "≡"  },
]

function TableSubItem({ item, onNavigate }: { item: typeof TABLE_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [itemPath, itemQuery] = item.path.split('?')
  const currentTopic = new URLSearchParams(location.search).get('topic') ?? 'electron_config'
  const itemTopic    = itemQuery ? new URLSearchParams(itemQuery).get('topic') : null
  const isActive = itemTopic
    ? location.pathname === itemPath && currentTopic === itemTopic
    : location.pathname === item.path

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(item.path); onNavigate() }} />
  )
}

// ── Base Calculations sub-items ───────────────────────────────────────────────

const BASE_CALC_ITEMS: { tab?: string; label: string; formula: string }[] = [
  { tab: "sig-figs",     label: "Sig Figs",        formula: "sf"   },
  { tab: "sci-notation", label: "Sci Notation",     formula: "×10ⁿ" },
  { tab: "conversions",  label: "Unit Conversions", formula: "↔"    },
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
      { tab: "ref-colligative", label: "Colligative", formula: "ΔT" },
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

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = CALC_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Basic'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  return (
    <>
      {CALC_GROUPS.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === "/calculations"
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
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
    label: 'Ideal Gas',
    items: [
      { tab: 'ref-pvnrt',    label: 'PV = nRT',        formula: 'PV=nRT'   },
      { tab: 'ref-combined', label: 'Combined Gas Law', formula: 'P₁V₁/T₁' },
    ],
  },
  {
    label: 'Gas Laws',
    items: [
      { tab: 'ref-daltons', label: "Dalton's Law", formula: 'Ptot'    },
      { tab: 'ref-grahams', label: "Graham's Law", formula: '√M'      },
      { tab: 'ref-density', label: 'Gas Density',  formula: 'ρ=MP/RT' },
    ],
  },
  {
    label: 'Real Gas & Distributions',
    items: [
      { tab: 'ref-vdw',    label: 'Van der Waals',      formula: 'vdW'  },
      { tab: 'ref-maxwell', label: 'Maxwell-Boltzmann', formula: 'f(v)' },
    ],
  },
]

function IdealGasSubItem({ item, onNavigate }: { item: IdealGasItem; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-pvnrt'
  const isActive = location.pathname === '/ideal-gas' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/ideal-gas?tab=${item.tab}`); onNavigate() }} />
  )
}

function IdealGasGroupedItems({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'ref-pvnrt'

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = IDEAL_GAS_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Ideal Gas'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  return (
    <>
      {IDEAL_GAS_GROUPS.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/ideal-gas'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
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

const STOICH_ITEMS: { tab: string; label: string; formula: string }[] = [
  { tab: 'visual',    label: 'Visual Guide',  formula: '◈' },
  { tab: 'reference', label: 'Guide',         formula: '≡' },
]

function StoichSubItem({ item, onNavigate }: { item: typeof STOICH_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'stoich'
  const isActive = location.pathname === '/stoichiometry' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/stoichiometry?tab=${item.tab}`); onNavigate() }} />
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
      { tab: 'electrolyte',   label: 'Electrolyte',   formula: '⚡' },
      { tab: 'redox-practice', label: 'Redox',        formula: 'e⁻' },
      { tab: 'ecell',          label: 'E°cell / Nernst', formula: 'E°' },
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

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = REDOX_GROUPS.find(g => g.items.some(i => i.tab === currentTab))
    return new Set(active ? [active.label] : ['Reactions'])
  })

  function toggleGroup(label: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  return (
    <>
      {REDOX_GROUPS.map(group => {
        const isOpen = openGroups.has(group.label)
        const groupActive = group.items.some(i => i.tab === currentTab) && location.pathname === '/redox'
        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between pl-12 pr-4 py-1 group"
            >
              <span className={`font-mono text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors ${groupActive ? 'text-primary' : 'text-dim group-hover:text-secondary'}`}>
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
  { path: "/structures?tab=lewis",       label: "Lewis Structures", formula: "⌬"      },
  { path: "/structures?tab=vsepr",       label: "VSEPR",            formula: "⬡"      },
  { path: "/structures?tab=solid-types", label: "Solid Types",      formula: "4 types" },
  { path: "/structures?tab=unit-cell",   label: "Unit Cell",        formula: "SC/BCC/FCC" },
]

// ── Thermochemistry sub-items ─────────────────────────────────────────────────

const THERMO_ITEMS = [
  { path: "/thermochemistry?tab=calorimetry-reference", label: "Calorimetry",    formula: "q"       },
  { path: "/thermochemistry?tab=enthalpy-reference",    label: "Enthalpy ΔHrxn", formula: "ΔH"      },
  { path: "/thermochemistry?tab=hess-reference",        label: "Hess's Law",     formula: "ΣΔH"     },
  { path: "/thermochemistry?tab=bond-reference",        label: "Bond Enthalpy",  formula: "BE"      },
  { path: "/thermochemistry?tab=heattransfer-reference", label: "Heat Transfer",  formula: "q₁=−q₂" },
  { path: "/thermochemistry?tab=heating-curve",         label: "Heating Curves", formula: "q/T"     },
  { path: "/thermochemistry?tab=phase-diagram",         label: "Phase Diagram",  formula: "P-T"     },
  { path: "/thermochemistry?tab=liquid-props",          label: "Liquid Props",   formula: "γ/η"     },
  { path: "/thermochemistry?tab=cc-reference",          label: "Clausius-Clap.", formula: "ln P"    },
  { path: "/thermochemistry?tab=vapor-pressure",        label: "Vapor Pressure", formula: "P₂"      },
]

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
        style={{ color: isActive ? "var(--c-halogen)" : "#7b82a0" }}
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
        style={{ color: isActive ? "var(--c-halogen)" : "#7b82a0" }}>
        ✎
      </span>
      <span className="flex-1">Test Generator</span>
    </button>
  )
}

// ── Expandable section ────────────────────────────────────────────────────────

function ExpandableSection({ icon, label, isActive, expanded, onToggle, children }: {
  icon: string; label: string; isActive: boolean; expanded: boolean; onToggle: () => void; children: React.ReactNode
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
          style={{ color: isActive ? "var(--c-halogen)" : "#7b82a0" }}
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

export default function NavSidebar({ open, onClose }: Props) {
  const location = useLocation()

  const currentPath   = location.pathname

  const [refCalcOpen,        setRefCalcOpen]        = useState(true)
  const [pracSectionOpen,    setPracSectionOpen]    = useState(true)
  const [toolsSectionOpen,   setToolsSectionOpen]   = useState(currentPath === '/tools' || currentPath === '/compound' || currentPath === '/reference')

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
      </div>

      <nav className="flex-1 overflow-y-auto py-2">

        {/* Reference / Calculations */}
        <NavGroup label="Topics" expanded={refCalcOpen} onToggle={() => setRefCalcOpen(e => !e)} />
        <AnimatePresence initial={false}>
          {refCalcOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              <ExpandableSection
                icon="±" label="Base Calculations"
                isActive={isBaseCalcActive} expanded={baseCalcExpanded}
                onToggle={() => setBaseCalcExpanded(e => !e)}
              >
                {BASE_CALC_ITEMS.map((item, i) => <BaseCalcSubItem key={i} item={item} onNavigate={onClose} />)}
                <PathSubItem path="/empirical" formula="⌬" label="Empirical Formula" onNavigate={onClose} />
              </ExpandableSection>


              <ExpandableSection
                icon="PV" label="Ideal Gas Law"
                isActive={isIdealGasNavActive} expanded={idealGasNavExpanded}
                onToggle={() => setIdealGasNavExpanded(e => !e)}
              >
                <IdealGasGroupedItems onNavigate={onClose} />
              </ExpandableSection>

              <ExpandableSection
                icon="⚗" label="Molar Calculations"
                isActive={isMolarCalcActive} expanded={calcExpanded}
                onToggle={() => setCalcExpanded(e => !e)}
              >
                <CalcGroupedItems onNavigate={onClose} />
              </ExpandableSection>


              <ExpandableSection
                icon="⬡" label="Periodic Table"
                isActive={isTableActive} expanded={tableExpanded}
                onToggle={() => setTableExpanded(e => !e)}
              >
                {TABLE_ITEMS.map((item, i) => <TableSubItem key={i} item={item} onNavigate={onClose} />)}
              </ExpandableSection>

              <ExpandableSection
                icon="⇌" label="Reactions / Redox"
                isActive={isRedoxActive} expanded={redoxExpanded}
                onToggle={() => setRedoxExpanded(e => !e)}
              >
                <RedoxGroupedItems onNavigate={onClose} />
              </ExpandableSection>

              <PracticeNavItem path="/reference?tab=solubility" icon="S/I" label="Solubility" onNavigate={onClose} />

              <ExpandableSection
                icon="⚖" label="Stoichiometry"
                isActive={isStoichActive} expanded={stoichExpanded}
                onToggle={() => setStoichExpanded(e => !e)}
              >
                {STOICH_ITEMS.map((item, i) => <StoichSubItem key={i} item={item} onNavigate={onClose} />)}
              </ExpandableSection>

              <ExpandableSection
                icon="⬡" label="Structures"
                isActive={isStructActive} expanded={structExpanded}
                onToggle={() => setStructExpanded(e => !e)}
              >
                {STRUCTURE_ITEMS.map((item, i) => (
                  <PathSubItem key={i} path={item.path} formula={item.formula} label={item.label} onNavigate={onClose} />
                ))}
              </ExpandableSection>

              <ExpandableSection
                icon="ΔH" label="Thermochemistry"
                isActive={isThermoActive} expanded={thermoExpanded}
                onToggle={() => setThermoExpanded(e => !e)}
              >
                {THERMO_ITEMS.map((item, i) => (
                  <PathSubItem key={i} path={item.path} formula={item.formula} label={item.label} onNavigate={onClose} />
                ))}
              </ExpandableSection>

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
              <PracticeNavItem path="/reference?tab=naming" icon="Nm" label="Naming" onNavigate={onClose} />
            </motion.div>
          )}
        </AnimatePresence>

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

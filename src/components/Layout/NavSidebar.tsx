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

const EMPIRICAL_ITEMS = [
  { path: '/empirical',               label: 'Solver', formula: '⌬' },
  { path: '/reference?tab=empirical', label: 'Visual', formula: '◈' },
]

// ── Molar Calculations sub-items ─────────────────────────────────────────────

const CALC_ITEMS: { tab?: string; path?: string; label: string; formula: string; mode?: string }[] = [
  { tab:  "moles",       label: "Moles",                    formula: "n = m/M" },
  { tab:  "molarity",    label: "Molarity",                  formula: "C = n/V" },
  { tab:  "molality",    label: "Molality",                  formula: "b = n/m" },
  { tab:  "colligative", label: "Boiling Point Elevation",   formula: "ΔTb", mode: "bpe" },
  { tab:  "colligative",  label: "Freezing Point Depression", formula: "ΔTf", mode: "fpd" },
  { tab:  "percent-comp",   label: "% Composition",          formula: "% m"  },
  { tab:  "dilution",       label: "Dilution",               formula: "C₁V₁" },
  { tab:  "conc-converter", label: "Conc. Units",            formula: "↔"    },
  { path: "/reference?tab=molar",      label: "Reference",   formula: "≡" },
]

function CalcSubItem({ item, onNavigate }: { item: typeof CALC_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const currentTab  = params.get("tab")  ?? "moles"
  const currentMode = params.get("mode") ?? "bpe"

  let isActive: boolean
  if (item.path) {
    const [itemPath, itemQuery] = item.path.split('?')
    const itemParams = itemQuery ? new URLSearchParams(itemQuery) : null
    isActive = itemParams
      ? location.pathname === itemPath && [...itemParams.entries()].every(([k, v]) => params.get(k) === v)
      : location.pathname === item.path
  } else {
    isActive =
      location.pathname === "/calculations" &&
      currentTab === item.tab &&
      (!item.mode || currentMode === item.mode)
  }

  function handleClick() {
    if (item.path) navigate(item.path)
    else {
      const p = new URLSearchParams({ tab: item.tab!, ...(item.mode ? { mode: item.mode } : {}) })
      navigate(`/calculations?${p.toString()}`)
    }
    onNavigate()
  }

  return <SubItem formula={item.formula} label={item.label} isActive={isActive} onClick={handleClick} />
}

// ── Ideal Gas pill row ────────────────────────────────────────────────────────

const IDEAL_GAS_PILLS = [
  { path: '/ideal-gas',              label: 'Calculator', formula: 'PV' },
  { path: '/ideal-gas?tab=practice', label: 'Practice',   formula: '✎'  },
]

function IdealGasPills({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentParams = new URLSearchParams(location.search)

  return (
    <div className="flex items-center gap-1 px-4 py-2 flex-wrap">
      {IDEAL_GAS_PILLS.map((pill) => {
        const [pillPath, pillQuery] = pill.path.split('?')
        const pillParams = pillQuery ? new URLSearchParams(pillQuery) : null
        const isActive = pillParams
          ? location.pathname === pillPath && [...pillParams.entries()].every(([k, v]) => currentParams.get(k) === v)
          : location.pathname === pillPath && !currentParams.get('tab')
        return (
          <button
            key={pill.path}
            onClick={() => { navigate(pill.path); onNavigate() }}
            className="relative flex items-center gap-1 px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
            style={{
              color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
              background: isActive ? 'color-mix(in srgb, var(--c-halogen) 10%, #141620)' : '#0e1016',
              border: isActive
                ? '1px solid color-mix(in srgb, var(--c-halogen) 28%, transparent)'
                : '1px solid #1c1f2e',
            }}
          >
            <span className="font-mono text-[9px] opacity-60">{pill.formula}</span>
            <span>{pill.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Stoichiometry sub-items ───────────────────────────────────────────────────

const STOICH_ITEMS: { tab: string; label: string; formula: string }[] = [
  { tab: 'stoich',      label: 'Stoichiometry',     formula: 'g↔mol' },
  { tab: 'limiting',    label: 'Limiting Reagent',  formula: 'LR'    },
  { tab: 'theoretical', label: 'Theoretical Yield', formula: 'T.Y.'  },
  { tab: 'percent',     label: 'Percent Yield',     formula: '%Y'    },
  { tab: 'solution',    label: 'Solution Stoich',   formula: 'M·V'   },
  { tab: 'reference',   label: 'Reference',         formula: '≡'     },
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

const REDOX_ITEMS: { tab: string; label: string; formula: string }[] = [
  { tab: 'classifier',    label: 'Reaction Classifier',  formula: '⇄'  },
  { tab: 'electrolyte',   label: 'Electrolyte',          formula: '⚡' },
  { tab: 'net-ionic',     label: 'Net Ionic',            formula: '⇌'  },
  { tab: 'activity',      label: 'Activity Series',      formula: '↕'  },
  { tab: 'predictor',     label: 'Rxn Predictor',        formula: '⇄'  },
  { tab: 'ecell',         label: 'E°cell / Nernst',      formula: 'E°' },
]

function RedoxSubItem({ item, onNavigate }: { item: typeof REDOX_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get('tab') ?? 'classifier'
  const isActive = location.pathname === '/redox' && currentTab === item.tab

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive}
      onClick={() => { navigate(`/redox?tab=${item.tab}`); onNavigate() }} />
  )
}

// ── Structures sub-items ──────────────────────────────────────────────────────

const STRUCTURE_ITEMS = [
  { path: "/structures?tab=lewis", label: "Lewis Structures", formula: "⌬" },
  { path: "/structures?tab=vsepr", label: "VSEPR",            formula: "⬡" },
]

// ── Thermochemistry sub-items ─────────────────────────────────────────────────

const THERMO_ITEMS = [
  { path: "/thermochemistry?tab=calorimetry", label: "Calorimetry",    formula: "q"   },
  { path: "/thermochemistry?tab=enthalpy",    label: "Enthalpy ΔHrxn", formula: "ΔH"  },
  { path: "/thermochemistry?tab=hess",        label: "Hess's Law",     formula: "ΣΔH" },
  { path: "/thermochemistry?tab=bond",        label: "Bond Enthalpy",  formula: "BE"  },
  { path: "/thermochemistry?tab=profile",      label: "Rxn Profiles",   formula: "⚡"  },
  { path: "/thermochemistry?tab=heattransfer", label: "Heat Transfer",   formula: "q₁=−q₂" },
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
        style={{ color: isActive ? "var(--c-halogen)" : undefined }}
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
        style={{ color: isActive ? "var(--c-halogen)" : undefined }}>
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
          style={{ color: isActive ? "var(--c-halogen)" : undefined }}
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

  const searchParams  = new URLSearchParams(location.search)
  const currentPath   = location.pathname
  const currentTab    = searchParams.get('tab') ?? ''

  const [refCalcOpen,        setRefCalcOpen]        = useState(true)
  const [pracSectionOpen,    setPracSectionOpen]    = useState(true)
  const [toolsSectionOpen,   setToolsSectionOpen]   = useState(currentPath === '/tools')

  // ── Reference / Calculations expandables ────────────────────────────────────
  const [tableExpanded,       setTableExpanded]       = useState(currentPath === "/table" || currentPath === "/electron-config")
  const [baseCalcExpanded,    setBaseCalcExpanded]    = useState(currentPath === "/base-calculations")
  const [calcExpanded,        setCalcExpanded]        = useState(currentPath === "/calculations")
  const [stoichExpanded,      setStoichExpanded]      = useState(currentPath === "/stoichiometry")
  const [redoxExpanded,       setRedoxExpanded]       = useState(currentPath === "/redox")
  const [structExpanded,      setStructExpanded]      = useState(currentPath === "/structures")
  const [thermoExpanded,      setThermoExpanded]      = useState(currentPath === "/thermochemistry")
  const [empiricalExpanded,   setEmpiricalExpanded]   = useState(
    currentPath === '/empirical' || (currentPath === '/reference' && currentTab === 'empirical')
  )
  const [idealGasNavExpanded, setIdealGasNavExpanded] = useState(currentPath === '/ideal-gas')

  const isTableActive      = currentPath === "/table" || currentPath === "/electron-config"
  const isBaseCalcActive   = currentPath === "/base-calculations"
  const isMolarCalcActive  = currentPath === "/calculations"
  const isStoichActive     = currentPath === "/stoichiometry"
  const isRedoxActive      = currentPath === "/redox"
  const isStructActive     = currentPath === "/structures"
  const isThermoActive     = currentPath === "/thermochemistry"
  const isEmpiricalActive  = currentPath === '/empirical' || (currentPath === '/reference' && currentTab === 'empirical')
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
              </ExpandableSection>

              <PracticeNavItem path="/compound" icon="◈" label="Compound" onNavigate={onClose} />

              <ExpandableSection
                icon="⌬" label="Empirical Formula"
                isActive={isEmpiricalActive} expanded={empiricalExpanded}
                onToggle={() => setEmpiricalExpanded(e => !e)}
              >
                {EMPIRICAL_ITEMS.map((item, i) => (
                  <PathSubItem key={i} path={item.path} formula={item.formula} label={item.label} onNavigate={onClose} />
                ))}
              </ExpandableSection>

              <ExpandableSection
                icon="PV" label="Ideal Gas Law"
                isActive={isIdealGasNavActive} expanded={idealGasNavExpanded}
                onToggle={() => setIdealGasNavExpanded(e => !e)}
              >
                <IdealGasPills onNavigate={onClose} />
              </ExpandableSection>

              <ExpandableSection
                icon="⚗" label="Molar Calculations"
                isActive={isMolarCalcActive} expanded={calcExpanded}
                onToggle={() => setCalcExpanded(e => !e)}
              >
                {CALC_ITEMS.map((item, i) => <CalcSubItem key={i} item={item} onNavigate={onClose} />)}
              </ExpandableSection>

              <PracticeNavItem path="/reference?tab=naming" icon="Nm" label="Naming" onNavigate={onClose} />

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
                {REDOX_ITEMS.map((item, i) => <RedoxSubItem key={i} item={item} onNavigate={onClose} />)}
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
        <NavGroup label="Tools" expanded={toolsSectionOpen} onToggle={() => setToolsSectionOpen(e => !e)} />
        <AnimatePresence initial={false}>
          {toolsSectionOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
            >
              <PathSubItem
                path="/tools?tool=ketcher"
                formula="✎"
                label="Ketcher Editor"
                onNavigate={onClose}
              />
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

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

function NavGroup({ label }: { label: string }) {
  return (
    <div className="px-4 pt-5 pb-1.5">
      <span className="font-mono text-[9px] tracking-[0.15em] text-dim uppercase">
        {label}
      </span>
    </div>
  );
}

// ── Shared sub-item button ────────────────────────────────────────────────────

function SubItem({
  formula,
  label,
  isActive,
  onClick,
}: {
  formula: string
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 mx-2 rounded-sm font-sans text-sm lg:text-[13.5px]
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

// ── Periodic Table sub-items ──────────────────────────────────────────────────

const TABLE_ITEMS = [
  { path: "/table",          label: "Periodic Table",  formula: "⬡"  },
  { path: "/electron-config", label: "Electron Config", formula: "e⁻" },
]

function TableSubItem({ item, onNavigate }: { item: typeof TABLE_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <SubItem
      formula={item.formula}
      label={item.label}
      isActive={location.pathname === item.path}
      onClick={() => { navigate(item.path); onNavigate() }}
    />
  )
}

// ── Base Calculations sub-items (tabs + paths) ────────────────────────────────

const BASE_CALC_ITEMS: { tab?: string; path?: string; label: string; formula: string }[] = [
  { tab:  "sig-figs",     label: "Sig Figs",          formula: "sf"   },
  { tab:  "sci-notation", label: "Sci Notation",       formula: "×10ⁿ" },
  { tab:  "conversions",  label: "Unit Conversions",   formula: "↔"    },
  { path: "/empirical",   label: "Empirical Formula",  formula: "⌬"    },
  { path: "/compound",    label: "Compound",           formula: "◈"    },
]

function BaseCalcSubItem({ item, onNavigate }: { item: typeof BASE_CALC_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "sig-figs"

  const isActive = item.path
    ? location.pathname === item.path
    : location.pathname === "/base-calculations" && currentTab === item.tab

  function handleClick() {
    if (item.path) navigate(item.path)
    else navigate(`/base-calculations?tab=${item.tab}`)
    onNavigate()
  }

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive} onClick={handleClick} />
  )
}

// ── Molar Calculations sub-items ──────────────────────────────────────────────

const CALC_ITEMS: { tab: string; label: string; formula: string; mode?: string }[] = [
  { tab: "moles",       label: "Moles",                  formula: "n = m/M" },
  { tab: "molarity",    label: "Molarity",                formula: "C = n/V" },
  { tab: "molality",    label: "Molality",                formula: "b = n/m" },
  { tab: "colligative", label: "Boiling Point Elevation", formula: "ΔTb", mode: "bpe" },
  { tab: "colligative", label: "Freezing Point Depression", formula: "ΔTf", mode: "fpd" },
  { tab: "practice",    label: "Practice",                formula: "✎" },
]

function CalcSubItem({ item, onNavigate }: { item: typeof CALC_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const currentTab  = params.get("tab")  ?? "moles"
  const currentMode = params.get("mode") ?? "bpe"

  const isActive =
    location.pathname === "/calculations" &&
    currentTab === item.tab &&
    (!item.mode || currentMode === item.mode)

  function handleClick() {
    const p = new URLSearchParams({ tab: item.tab, ...(item.mode ? { mode: item.mode } : {}) })
    navigate(`/calculations?${p.toString()}`)
    onNavigate()
  }

  return (
    <SubItem formula={item.formula} label={item.label} isActive={isActive} onClick={handleClick} />
  )
}

// ── Structures sub-items ──────────────────────────────────────────────────────

const STRUCTURE_ITEMS = [
  { tab: "lewis", label: "Lewis Structure", formula: "⌬" },
  { tab: "vsepr", label: "VSEPR",           formula: "⬡" },
]

// ── Test Generator (standalone nav item) ─────────────────────────────────────

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
      <span
        className="font-mono text-base leading-none shrink-0 w-4 text-center"
        style={{ color: isActive ? "var(--c-halogen)" : undefined }}
      >
        ✎
      </span>
      <span className="flex-1">Test Generator</span>
    </button>
  )
}

function StructureSubItem({ item, onNavigate }: { item: typeof STRUCTURE_ITEMS[0]; onNavigate: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "lewis"
  const isActive = location.pathname === "/structures" && currentTab === item.tab

  return (
    <SubItem
      formula={item.formula}
      label={item.label}
      isActive={isActive}
      onClick={() => { navigate(`/structures?tab=${item.tab}`); onNavigate() }}
    />
  )
}

// ── Expandable section ────────────────────────────────────────────────────────

function ExpandableSection({
  icon,
  label,
  isActive,
  expanded,
  onToggle,
  children,
}: {
  icon: string
  label: string
  isActive: boolean
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
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
          className="font-mono text-base leading-none shrink-0 w-4 text-center"
          style={{ color: isActive ? "var(--c-halogen)" : undefined }}
        >
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-[10px] text-dim"
        >
          ▶
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-0.5 py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function NavSidebar({ open, onClose }: Props) {
  const location = useLocation()

  const [tableExpanded,    setTableExpanded]    = useState(
    location.pathname === "/table" || location.pathname === "/electron-config"
  )
  const [baseCalcExpanded, setBaseCalcExpanded] = useState(
    location.pathname === "/base-calculations" ||
    location.pathname === "/empirical" ||
    location.pathname === "/compound"
  )
  const [calcExpanded,     setCalcExpanded]     = useState(location.pathname === "/calculations")
  const [structExpanded,   setStructExpanded]   = useState(location.pathname === "/structures")

  const isTableActive    = location.pathname === "/table" || location.pathname === "/electron-config"
  const isBaseCalcActive = location.pathname === "/base-calculations" ||
                           location.pathname === "/empirical" ||
                           location.pathname === "/compound"
  const isCalcActive     = location.pathname === "/calculations"
  const isStructActive   = location.pathname === "/structures"

  const inner = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-lg lg:text-xl font-semibold"
            style={{ color: "var(--c-halogen)" }}
          >
            ⚛
          </span>
          <span className="font-sans font-semibold text-bright tracking-tight lg:text-lg">
            Chem<span style={{ color: "var(--c-halogen)" }}>Helper</span>
          </span>
        </div>
        <p className="font-mono text-[9px] lg:text-[10px] text-dim mt-0.5 tracking-wider">
          CHEMISTRY TOOLKIT
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* Reference */}
        <NavGroup label="Reference" />
        <ExpandableSection
          icon="⬡" label="Periodic Table"
          isActive={isTableActive} expanded={tableExpanded}
          onToggle={() => setTableExpanded(e => !e)}
        >
          {TABLE_ITEMS.map((item, i) => (
            <TableSubItem key={i} item={item} onNavigate={onClose} />
          ))}
        </ExpandableSection>

        {/* Calculations */}
        <NavGroup label="Calculations" />
        <ExpandableSection
          icon="±" label="Base Calculations"
          isActive={isBaseCalcActive} expanded={baseCalcExpanded}
          onToggle={() => setBaseCalcExpanded(e => !e)}
        >
          {BASE_CALC_ITEMS.map((item, i) => (
            <BaseCalcSubItem key={i} item={item} onNavigate={onClose} />
          ))}
        </ExpandableSection>

        <ExpandableSection
          icon="⚗" label="Molar Calculations"
          isActive={isCalcActive} expanded={calcExpanded}
          onToggle={() => setCalcExpanded(e => !e)}
        >
          {CALC_ITEMS.map((item, i) => (
            <CalcSubItem key={i} item={item} onNavigate={onClose} />
          ))}
        </ExpandableSection>

        {/* Tools */}
        <NavGroup label="Tools" />
        <ExpandableSection
          icon="⬡" label="Structures"
          isActive={isStructActive} expanded={structExpanded}
          onToggle={() => setStructExpanded(e => !e)}
        >
          {STRUCTURE_ITEMS.map((item, i) => (
            <StructureSubItem key={i} item={item} onNavigate={onClose} />
          ))}
        </ExpandableSection>
        <TestNavItem onNavigate={onClose} />
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <p className="font-mono text-[9px] text-dim text-center tracking-widest">
          v0.1.0
        </p>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex flex-col w-52 lg:w-60 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
        {inner}
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="nav-backdrop"
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              key="nav-drawer"
              className="fixed top-0 left-0 h-full w-52 bg-surface border-r border-border z-50 md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
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

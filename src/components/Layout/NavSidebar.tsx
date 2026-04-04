import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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

const BASE_CALC_ITEMS: { tab: string; label: string; formula: string }[] = [
  { tab: "sig-figs",      label: "Sig Figs",         formula: "sf"   },
  { tab: "sci-notation",  label: "Sci Notation",      formula: "×10ⁿ" },
  { tab: "conversions",   label: "Unit Conversions",  formula: "↔"    },
]

function BaseCalcSubItem({
  item,
  onNavigate,
}: {
  item: (typeof BASE_CALC_ITEMS)[0];
  onNavigate: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = new URLSearchParams(location.search).get("tab") ?? "sig-figs";
  const isActive = location.pathname === "/base-calculations" && currentTab === item.tab;

  return (
    <button
      onClick={() => { navigate(`/base-calculations?tab=${item.tab}`); onNavigate(); }}
      className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 mx-2 rounded-sm font-sans text-sm
                  transition-all duration-150 text-left
                  ${isActive
                    ? "bg-raised text-bright border border-border"
                    : "text-secondary hover:text-primary hover:bg-surface border border-transparent"
                  }`}
      style={{ width: "calc(100% - 16px)" }}
    >
      <span className="font-mono text-[9px] opacity-50 shrink-0">{item.formula}</span>
      <span className="truncate text-xs">{item.label}</span>
    </button>
  );
}

const CALC_ITEMS: {
  tab: string;
  label: string;
  formula: string;
  mode?: string;
}[] = [
  { tab: "moles", label: "Moles", formula: "n = m/M" },
  { tab: "molarity", label: "Molarity", formula: "C = n/V" },
  { tab: "molality", label: "Molality", formula: "b = n/m" },
  {
    tab: "colligative",
    label: "Boiling Point Elevation",
    formula: "ΔTb",
    mode: "bpe",
  },
  {
    tab: "colligative",
    label: "Freezing Point Depression",
    formula: "ΔTf",
    mode: "fpd",
  },
];

function CalcSubItem({
  item,
  onNavigate,
}: {
  item: (typeof CALC_ITEMS)[0];
  onNavigate: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const currentTab = params.get("tab") ?? "moles";
  const currentMode = params.get("mode") ?? "bpe";

  const isActive =
    location.pathname === "/calculations" &&
    currentTab === item.tab &&
    (!item.mode || currentMode === item.mode);

  function handleClick() {
    const p = new URLSearchParams({
      tab: item.tab,
      ...(item.mode ? { mode: item.mode } : {}),
    });
    navigate(`/calculations?${p.toString()}`);
    onNavigate();
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 mx-2 rounded-sm font-sans text-sm
                  transition-all duration-150 text-left
                  ${
                    isActive
                      ? "bg-raised text-bright border border-border"
                      : "text-secondary hover:text-primary hover:bg-surface border border-transparent"
                  }`}
      style={{ width: "calc(100% - 16px)" }}
    >
      <span className="font-mono text-[9px] opacity-50 shrink-0">
        {item.formula}
      </span>
      <span className="truncate text-xs">{item.label}</span>
    </button>
  );
}

export default function NavSidebar({ open, onClose }: Props) {
  const location = useLocation();
  const [calcExpanded, setCalcExpanded] = useState(
    location.pathname === "/calculations",
  );
  const [baseCalcExpanded, setBaseCalcExpanded] = useState(
    location.pathname === "/base-calculations",
  );

  const isCalcActive = location.pathname === "/calculations";
  const isBaseCalcActive = location.pathname === "/base-calculations";

  const inner = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-lg font-semibold"
            style={{ color: "var(--c-halogen)" }}
          >
            ⚛
          </span>
          <span className="font-sans font-semibold text-bright tracking-tight">
            Chem<span style={{ color: "var(--c-halogen)" }}>Helper</span>
          </span>
        </div>
        <p className="font-mono text-[9px] text-dim mt-0.5 tracking-wider">
          CHEMISTRY TOOLKIT
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {/* Reference */}
        <NavGroup label="Reference" />
        <NavLink
          to="/table"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm transition-all duration-150
             ${isActive ? "bg-raised text-bright border border-border" : "text-secondary hover:text-primary hover:bg-surface border border-transparent"}`
          }
          onClick={onClose}
        >
          {({ isActive }) => (
            <>
              <span
                className="font-mono text-base leading-none shrink-0 w-4 text-center"
                style={{ color: isActive ? "var(--c-halogen)" : undefined }}
              >
                ⬡
              </span>
              <span>Periodic Table</span>
            </>
          )}
        </NavLink>

        {/* Calculations */}
        <NavGroup label="Calculations" />

        {/* Base Calculations — expandable */}
        <div>
          <button
            onClick={() => setBaseCalcExpanded((e) => !e)}
            className={`w-full flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm
                        transition-all duration-150 text-left
                        ${isBaseCalcActive ? "text-bright" : "text-secondary hover:text-primary"}`}
            style={{ width: "calc(100% - 16px)" }}
          >
            <span
              className="font-mono text-base leading-none shrink-0 w-4 text-center"
              style={{ color: isBaseCalcActive ? "var(--c-halogen)" : undefined }}
            >
              ±
            </span>
            <span className="flex-1">Base Calculations</span>
            <motion.span
              animate={{ rotate: baseCalcExpanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="font-mono text-[10px] text-dim"
            >
              ▶
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {baseCalcExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden" }}
              >
                <div className="flex flex-col gap-0.5 py-1">
                  {BASE_CALC_ITEMS.map((item, i) => (
                    <BaseCalcSubItem key={i} item={item} onNavigate={onClose} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          {/* Molar Calculations — expandable */}
          <button
            onClick={() => setCalcExpanded((e) => !e)}
            className={`w-full flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm
                        transition-all duration-150 text-left
                        ${isCalcActive ? "text-bright" : "text-secondary hover:text-primary"}`}
            style={{ width: "calc(100% - 16px)" }}
          >
            <span
              className="font-mono text-base leading-none shrink-0 w-4 text-center"
              style={{ color: isCalcActive ? "var(--c-halogen)" : undefined }}
            >
              ⚗
            </span>
            <span className="flex-1">Molar Calculations</span>
            <motion.span
              animate={{ rotate: calcExpanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="font-mono text-[10px] text-dim"
            >
              ▶
            </motion.span>
          </button>

          {/* Sub-items */}
          <AnimatePresence initial={false}>
            {calcExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden" }}
              >
                <div className="flex flex-col gap-0.5 py-1">
                  {CALC_ITEMS.map((item, i) => (
                    <CalcSubItem key={i} item={item} onNavigate={onClose} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tools */}
        <NavGroup label="Tools" />
        <NavLink
          to="/compound"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm transition-all duration-150
             ${isActive ? "bg-raised text-bright border border-border" : "text-secondary hover:text-primary hover:bg-surface border border-transparent"}`
          }
          onClick={onClose}
        >
          {({ isActive }) => (
            <>
              <span
                className="font-mono text-base leading-none shrink-0 w-4 text-center"
                style={{ color: isActive ? "var(--c-halogen)" : undefined }}
              >
                ◈
              </span>
              <span>Compound</span>
            </>
          )}
        </NavLink>
        <NavLink
          to="/structures"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm transition-all duration-150
             ${isActive ? "bg-raised text-bright border border-border" : "text-secondary hover:text-primary hover:bg-surface border border-transparent"}`
          }
          onClick={onClose}
        >
          {({ isActive }) => (
            <>
              <span
                className="font-mono text-base leading-none shrink-0 w-4 text-center"
                style={{ color: isActive ? "var(--c-halogen)" : undefined }}
              >
                ⬡
              </span>
              <span>Structures</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <p className="font-mono text-[9px] text-dim text-center tracking-widest">
          v0.1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-52 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
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
  );
}

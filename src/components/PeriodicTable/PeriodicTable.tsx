import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useElementStore } from "../../stores/elementStore";
import type { TrendMode } from "../../stores/elementStore";
import ElementCell from "./ElementCell";
import GroupHeader from "./GroupHeader";
import Staircase from "./Staircase";
import TrendExplainer from "./TrendExplainer";
import TrendCompare from "./TrendCompare";
import { GROUP_COLORS, GROUP_LABELS, matchesSearch } from "./groupColors";
import type { ColorCategory, Element } from "../../types";

const LANTHANIDE_RANGE = { start: 57, end: 71 };
const ACTINIDE_RANGE = { start: 89, end: 103 };

function isFootnote(n: number) {
  return (
    (n >= LANTHANIDE_RANGE.start && n <= LANTHANIDE_RANGE.end) ||
    (n >= ACTINIDE_RANGE.start && n <= ACTINIDE_RANGE.end)
  );
}
function lanthanideCol(el: Element) {
  return el.atomicNumber - LANTHANIDE_RANGE.start + 1;
}
function actinideCol(el: Element) {
  return el.atomicNumber - ACTINIDE_RANGE.start + 1;
}

const ALL_CATEGORIES: ColorCategory[] = [
  "hydrogen",
  "alkali",
  "alkaline",
  "transition",
  "post-transition",
  "metalloid",
  "carbon",
  "pnictogen",
  "chalcogen",
  "halogen",
  "noble",
  "lanthanide",
  "actinide",
];
const GROUP_NUMBERS = Array.from({ length: 18 }, (_, i) => i + 1);

// PlaceholderCell — clickable, dims on search/hover, shows collapse chevron
interface PlaceholderCellProps {
  label: string;
  sublabel: string;
  color: string;
  anyMatch: boolean; // true if any element in this f-block matches the search
}
function PlaceholderCell({
  label,
  sublabel,
  color,
  anyMatch,
}: PlaceholderCellProps) {
  const {
    hoveredColumnGroup,
    hoveredGroup,
    searchQuery,
    footnoteVisible,
    toggleFootnote,
  } = useElementStore();

  const isHoverDimmed =
    (hoveredColumnGroup !== null && hoveredColumnGroup !== 3) ||
    (hoveredGroup !== null &&
      hoveredGroup !== "lanthanide" &&
      hoveredGroup !== "actinide");
  const isSearchDimmed = searchQuery !== "" && !anyMatch;
  const isDimmed = isHoverDimmed || isSearchDimmed;

  return (
    <motion.button
      onClick={toggleFootnote}
      animate={{ opacity: isDimmed ? 0.12 : 1 }}
      transition={{ duration: 0.15 }}
      className="w-full aspect-[4/5] flex flex-col items-center justify-center
                 rounded-sm border border-dashed relative group cursor-pointer
                 focus:outline-none overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${color} 50%, transparent)` }}
      title={footnoteVisible ? "Hide f-block" : "Show f-block"}
    >
      <span
        className="font-mono leading-none text-center px-[1px] w-full truncate text-center"
        style={{ color, fontSize: "clamp(5px, 1.5vw, 20px)" }}
      >
        {label}
      </span>
      <span
        className="font-sans mt-0.5 leading-none text-center w-full truncate px-[1px]"
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "clamp(4px, 1.0vw, 13px)",
        }}
      >
        {sublabel}
      </span>
      {/* Chevron — points down when visible, right when hidden */}
      <motion.span
        className="absolute bottom-[2px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color, fontSize: "clamp(5px,0.6vw,8px)" }}
        animate={{ rotate: footnoteVisible ? 0 : -90 }}
        transition={{ duration: 0.2 }}
      >
        ▾
      </motion.span>
    </motion.button>
  );
}

interface TrendButtonProps {
  mode: TrendMode;
  active: boolean;
  color: string;
  label: string;
  sublabel: string;
  onClick: () => void;
}
function TrendButton({
  active,
  color,
  label,
  sublabel,
  onClick,
}: TrendButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all duration-150"
      style={{
        borderColor: active ? color : "rgba(255,255,255,0.1)",
        background: active
          ? `color-mix(in srgb, ${color} 12%, #0e1016)`
          : "#0e1016",
        color: active ? color : "rgba(255,255,255,0.4)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: active ? color : "rgba(255,255,255,0.2)" }}
      />
      <span className="font-mono text-[11px]">{label}</span>
      <span className="font-sans text-[10px] opacity-60">{sublabel}</span>
    </button>
  );
}

export default function PeriodicTable() {
  const {
    elements,
    loading,
    error,
    loadElements,
    hoveredColumnGroup,
    searchQuery,
    setHoveredGroup,
    setSearchQuery,
    trendMode,
    setTrendMode,
    footnoteVisible,
    compareMode,
    compareElements,
    setCompareMode,
    clearCompare,
  } = useElementStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadElements();
  }, [loadElements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-dim text-sm tracking-widest animate-pulse">
          LOADING ELEMENTS...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="font-mono text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  const mainElements = elements.filter((e) => !isFootnote(e.atomicNumber));
  const lanthanides = elements.filter(
    (e) =>
      e.atomicNumber >= LANTHANIDE_RANGE.start &&
      e.atomicNumber <= LANTHANIDE_RANGE.end,
  );
  const actinides = elements.filter(
    (e) =>
      e.atomicNumber >= ACTINIDE_RANGE.start &&
      e.atomicNumber <= ACTINIDE_RANGE.end,
  );

  // Does any element in each f-block series match the current search?
  const anyLanthanideMatch =
    searchQuery === "" ||
    lanthanides.some((e) => matchesSearch(e, searchQuery));
  const anyActinideMatch =
    searchQuery === "" || actinides.some((e) => matchesSearch(e, searchQuery));

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
    gap: "2px",
  };
  const footnoteGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
    gap: "2px",
    overflow: "visible",
  };

  const staircaseDimmed = hoveredColumnGroup !== null || searchQuery !== "";

  let animIdx = 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Symbol, name, or number…"
            className="w-full bg-surface border border-border rounded-sm pl-8 pr-3 py-1.5
                       font-mono text-xs text-primary placeholder-dim
                       focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="font-mono text-xs text-dim hover:text-primary transition-colors"
          >
            clear
          </button>
        )}
        <div className="h-5 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-dim tracking-wider hidden sm:block">
            TRENDS
          </span>
          <TrendButton
            mode="electronegativity"
            active={trendMode === "electronegativity"}
            color="#f97316"
            label="Electronegativity"
            sublabel="Pauling"
            onClick={() =>
              setTrendMode(
                trendMode === "electronegativity"
                  ? "none"
                  : "electronegativity",
              )
            }
          />
          <TrendButton
            mode="radius"
            active={trendMode === "radius"}
            color="#38bdf8"
            label="Atomic Radius"
            sublabel="pm"
            onClick={() =>
              setTrendMode(trendMode === "radius" ? "none" : "radius")
            }
          />
          <TrendButton
            mode="ie1"
            active={trendMode === "ie1"}
            color="#4ade80"
            label="IE₁"
            sublabel="kJ/mol"
            onClick={() =>
              setTrendMode(trendMode === "ie1" ? "none" : "ie1")
            }
          />
          <TrendButton
            mode="ea"
            active={trendMode === "ea"}
            color="#a78bfa"
            label="Elec. Affinity"
            sublabel="kJ/mol"
            onClick={() =>
              setTrendMode(trendMode === "ea" ? "none" : "ea")
            }
          />
          <TrendButton
            mode="ionicRadius"
            active={trendMode === "ionicRadius"}
            color="#fb923c"
            label="Ionic Radius"
            sublabel="pm"
            onClick={() =>
              setTrendMode(trendMode === "ionicRadius" ? "none" : "ionicRadius")
            }
          />
        </div>
        <div className="h-5 w-px bg-border hidden sm:block" />
        <button
          onClick={() => setCompareMode(!compareMode)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all duration-150"
          style={{
            borderColor: compareMode ? '#60a5fa' : 'rgba(255,255,255,0.1)',
            background: compareMode ? 'color-mix(in srgb, #60a5fa 12%, #0e1016)' : '#0e1016',
            color: compareMode ? '#60a5fa' : 'rgba(255,255,255,0.4)',
          }}
        >
          <div className="w-2 h-2 rounded-full shrink-0"
            style={{ background: compareMode ? '#60a5fa' : 'rgba(255,255,255,0.2)' }} />
          <span className="font-mono text-[11px]">Compare</span>
          <span className="font-sans text-[10px] opacity-60">A vs B</span>
        </button>
      </div>

      {/* Scrollable table wrapper */}
      <div ref={scrollRef} className="overflow-x-auto pb-8" style={{ paddingRight: '4px' }}>
        <div style={{ minWidth: "580px", overflow: "visible", paddingRight: "4px" }}>
          {/* Group number header row */}
          <div style={{ ...gridStyle, marginBottom: "3px" }}>
            {GROUP_NUMBERS.map((n) => (
              <div key={n} style={{ gridColumn: n, gridRow: 1 }}>
                <GroupHeader groupNumber={n} />
              </div>
            ))}
          </div>

          {/* Main table grid */}
          <div style={{ position: "relative", overflow: "visible" }}>
            <div style={gridStyle}>
              <div style={{ gridColumn: 3, gridRow: 6 }}>
                <PlaceholderCell
                  label="57-71"
                  sublabel="Lanthanides"
                  color={GROUP_COLORS["lanthanide"]}
                  anyMatch={anyLanthanideMatch}
                />
              </div>
              <div style={{ gridColumn: 3, gridRow: 7 }}>
                <PlaceholderCell
                  label="89-103"
                  sublabel="Actinides"
                  color={GROUP_COLORS["actinide"]}
                  anyMatch={anyActinideMatch}
                />
              </div>
              {mainElements.map((el) => (
                <div
                  key={el.atomicNumber}
                  style={{ gridColumn: el.group, gridRow: el.period }}
                >
                  <ElementCell element={el} animationIndex={animIdx++} />
                </div>
              ))}
            </div>

            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: staircaseDimmed ? 0.12 : 1 }}
              transition={{ duration: 0.15 }}
            >
              <Staircase />
            </motion.div>
          </div>

          {/* Footnote section — toggle visibility */}
          <AnimatePresence initial={false}>
            {footnoteVisible && (
              <motion.div
                key="footnote"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="mt-3 ml-[calc((2/18)*100%+2px)] flex flex-col gap-0.5"
                  style={{ overflow: "visible" }}
                >
                  {/* Label row */}
                  <div className="flex items-center gap-1.5 mb-1 pl-0.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: GROUP_COLORS["lanthanide"] }}
                    />
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: GROUP_COLORS["lanthanide"] }}
                    >
                      Lanthanides
                    </span>
                    <div
                      className="w-6 border-t border-dashed ml-2"
                      style={{ borderColor: GROUP_COLORS["lanthanide"] + "60" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full ml-4"
                      style={{ background: GROUP_COLORS["actinide"] }}
                    />
                    <span
                      className="font-mono text-[9px]"
                      style={{ color: GROUP_COLORS["actinide"] }}
                    >
                      Actinides
                    </span>
                  </div>

                  {/* Lanthanide row */}
                  <div style={footnoteGridStyle}>
                    {lanthanides.map((el) => (
                      <div
                        key={el.atomicNumber}
                        style={{ gridColumn: lanthanideCol(el) }}
                      >
                        <ElementCell element={el} animationIndex={animIdx++} />
                      </div>
                    ))}
                  </div>

                  {/* Actinide row */}
                  <div style={footnoteGridStyle}>
                    {actinides.map((el) => (
                      <div
                        key={el.atomicNumber}
                        style={{ gridColumn: actinideCol(el) }}
                      >
                        <ElementCell element={el} animationIndex={animIdx++} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-border">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onMouseEnter={() => setHoveredGroup(cat)}
            onMouseLeave={() => setHoveredGroup(null)}
            className="flex items-center gap-1.5"
          >
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: GROUP_COLORS[cat] }}
            />
            <span
              className="font-sans text-[11px] transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {GROUP_LABELS[cat]}
            </span>
          </button>
        ))}
      </div>

      {/* Trend explainer — visible when any trend overlay is active */}
      <AnimatePresence>
        {trendMode !== 'none' && (
          <motion.div
            key={trendMode}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <TrendExplainer trendMode={trendMode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison panel — visible when compare mode has at least one element */}
      <AnimatePresence>
        {compareMode && (
          <TrendCompare
            elementA={compareElements[0]}
            elementB={compareElements[1]}
            onClear={clearCompare}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

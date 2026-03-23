import { useEffect, useRef } from "react";
import { useElementStore } from "../../stores/elementStore";
import ElementCell from "./ElementCell";
import Staircase from "./Staircase";
import { getColorCategory, GROUP_COLORS, GROUP_LABELS } from "./groupColors";
import type { ColorCategory, Element } from "../../types";

// f-block ranges that go in the footnote section
const LANTHANIDE_RANGE = { start: 57, end: 71 }; // La–Lu
const ACTINIDE_RANGE = { start: 89, end: 103 }; // Ac–Lr

function isFootnote(n: number) {
  return (
    (n >= LANTHANIDE_RANGE.start && n <= LANTHANIDE_RANGE.end) ||
    (n >= ACTINIDE_RANGE.start && n <= ACTINIDE_RANGE.end)
  );
}

// Footnote column: La(57) → col 1, Ce(58) → col 2, ..., Lu(71) → col 15
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

interface PlaceholderCellProps {
  label: string;
  sublabel: string;
  color: string;
}
function PlaceholderCell({ label, sublabel, color }: PlaceholderCellProps) {
  return (
    <div
      className="w-full aspect-[4/5] flex flex-col items-center justify-center
                 rounded-sm border border-dashed"
      style={{ borderColor: `color-mix(in srgb, ${color} 50%, transparent)` }}
    >
      <span
        className="font-mono leading-none"
        style={{ color, fontSize: "clamp(7px,0.9vw,11px)" }}
      >
        {label}
      </span>
      <span
        className="font-sans mt-0.5 leading-none text-center"
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "clamp(5px,0.55vw,8px)",
        }}
      >
        {sublabel}
      </span>
    </div>
  );
}

export default function PeriodicTable() {
  const {
    elements,
    loading,
    error,
    loadElements,
    setHoveredGroup,
    searchQuery,
    setSearchQuery,
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

  // Shared grid styles (18-column)
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
    gap: "2px",
  };
  // Footnote grid (15-column, matching cols 1–15 of main)
  const footnoteGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
    gap: "2px",
  };

  let animIdx = 0;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
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
            className="w-full bg-surface border border-border rounded-sm
                       pl-8 pr-3 py-1.5 font-mono text-xs text-primary
                       placeholder-dim focus:outline-none focus:border-accent/40
                       transition-colors"
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
      </div>

      {/* Scrollable table wrapper */}
      <div ref={scrollRef} className="overflow-x-auto scroll-hint pb-2">
        <div style={{ minWidth: "580px" }}>
          {/* Main table grid — relative so the Staircase SVG can overlay it */}
          <div style={{ position: "relative" }}>
            <div style={gridStyle}>
              {/* Lanthanide placeholder at period 6, group 3 */}
              <div style={{ gridColumn: 3, gridRow: 6 }}>
                <PlaceholderCell
                  label="57–71"
                  sublabel="La–Lu"
                  color={GROUP_COLORS["lanthanide"]}
                />
              </div>

              {/* Actinide placeholder at period 7, group 3 */}
              <div style={{ gridColumn: 3, gridRow: 7 }}>
                <PlaceholderCell
                  label="89–103"
                  sublabel="Ac–Lr"
                  color={GROUP_COLORS["actinide"]}
                />
              </div>

              {/* All non-f-block elements */}
              {mainElements.map((el) => (
                <div
                  key={el.atomicNumber}
                  style={{ gridColumn: el.group, gridRow: el.period }}
                >
                  <ElementCell element={el} animationIndex={animIdx++} />
                </div>
              ))}
            </div>

            {/* Metal / nonmetal staircase dividing line */}
            <Staircase />
          </div>

          {/* Footnote section */}
          <div className="mt-3 ml-[calc((2/18)*100%+2px)] flex flex-col gap-0.5">
            {/* Connector dots */}
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
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-border">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onMouseEnter={() => setHoveredGroup(cat)}
            onMouseLeave={() => setHoveredGroup(null)}
            className="flex items-center gap-1.5 group"
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
    </div>
  );
}

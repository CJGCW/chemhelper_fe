import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavSidebar from "./NavSidebar";
import { useElementStore } from "../../stores/elementStore";
import ElementModal from "../ElementDetail/ElementModal";

const PAGE_TITLES: Record<string, string> = {
  "/table": "Periodic Table",
  "/calculations": "Calculations",
  "/calculations/bpe": "Boiling Point Elevation",
  "/calculations/fpd": "Freezing Point Depression",
  "/compound": "Compound Resolver",
  "/structures": "Structures",
};

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const selectElement = useElementStore((s) => s.selectElement);

  // Clear any selected element when navigating away from the table
  useEffect(() => {
    selectElement(null);
  }, [location.pathname, selectElement]);
  const title = PAGE_TITLES[location.pathname] ?? "ChemHelper";

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Left nav */}
      <NavSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Element detail sidebar — slides over content from the left on desktop */}
      <ElementModal />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0 bg-surface">
          {/* Mobile hamburger */}
          <button
            onClick={() => setNavOpen(true)}
            className="md:hidden flex flex-col gap-1 w-6 shrink-0"
            aria-label="Open navigation"
          >
            <span className="block h-px w-full bg-secondary" />
            <span className="block h-px w-4 bg-secondary" />
            <span className="block h-px w-full bg-secondary" />
          </button>

          <h1 className="font-sans font-medium text-primary text-sm tracking-wide">
            {title}
          </h1>

          {/* Subtle divider line that spans to right */}
          <div className="flex-1 h-px bg-border ml-2" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

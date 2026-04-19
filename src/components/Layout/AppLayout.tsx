import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavSidebar from "./NavSidebar";
import { useElementStore } from "../../stores/elementStore";
import ElementModal from "../ElementDetail/ElementModal";
import { useTheme } from "../../hooks/useTheme";

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const selectElement = useElementStore((s) => s.selectElement);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    selectElement(null);
  }, [location.pathname, selectElement]);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-base print:h-auto print:overflow-visible print:block">
      {/* Left nav — hidden when printing */}
      <div className="print:hidden contents">
        <NavSidebar open={navOpen} onClose={() => setNavOpen(false)} theme={theme} onToggleTheme={toggle} />
      </div>

      {/* Element detail sidebar */}
      <ElementModal />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden print:overflow-visible print:block">
        {/* Mobile-only top bar for hamburger */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-surface print:hidden">
          <button
            onClick={() => setNavOpen(true)}
            className="flex flex-col gap-1 w-6 shrink-0"
            aria-label="Open navigation"
          >
            <span className="block h-px w-full bg-secondary" />
            <span className="block h-px w-4 bg-secondary" />
            <span className="block h-px w-full bg-secondary" />
          </button>
        </header>

        {/* Page content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

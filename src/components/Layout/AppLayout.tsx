import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import NavSidebar from './NavSidebar'
import ElementSidebar from '../ElementDetail/ElementSidebar'

const PAGE_TITLES: Record<string, string> = {
  '/table':                 'Periodic Table',
  '/calculations/molarity': 'Molarity',
  '/calculations/molality': 'Molality',
  '/calculations/bpe':      'Boiling Point Elevation',
  '/calculations/fpd':      'Freezing Point Depression',
  '/compound':              'Compound Resolver',
}

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'ChemHelper'

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Left nav */}
      <NavSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Element detail sidebar — slides over content from the left on desktop */}
      <ElementSidebar />

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

        {/* Page content with route transitions */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="h-full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  )
}

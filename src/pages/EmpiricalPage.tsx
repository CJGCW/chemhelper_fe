import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../stores/elementStore'
import EmpiricalSolver from '../components/empirical/EmpiricalSolver'
import EmpiricalPractice from '../components/empirical/EmpiricalPractice'
import EmpiricalVisual from '../components/empirical/EmpiricalVisual'

type Tab = 'solver' | 'practice' | 'visual'

export default function EmpiricalPage() {
  const [tab, setTab] = useState<Tab>('solver')
  const loadElements = useElementStore(s => s.loadElements)
  const loading = useElementStore(s => s.loading)
  const error = useElementStore(s => s.error)

  useEffect(() => { loadElements() }, [loadElements])

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Empirical &amp; Molecular Formula</h2>
        <p className="font-sans text-sm text-secondary">
          Determine the simplest whole-number ratio of elements from percent composition or mass data.
        </p>

        <div className="flex items-center gap-1 p-1 rounded-sm self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['solver', 'practice', 'visual'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
              style={{ color: tab === t ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
              {tab === t && (
                <motion.div layoutId="emp-tab-bg" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="font-mono text-xs text-dim animate-pulse">Loading element data…</p>
      )}
      {error && (
        <p className="font-sans text-xs" style={{ color: '#f87171' }}>Failed to load elements: {error}</p>
      )}

      {!loading && !error && (
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            {tab === 'solver' ? <EmpiricalSolver /> : tab === 'practice' ? <EmpiricalPractice /> : <EmpiricalVisual />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

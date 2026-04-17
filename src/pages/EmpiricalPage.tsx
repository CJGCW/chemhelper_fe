import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../stores/elementStore'
import EmpiricalReference from '../components/empirical/EmpiricalReference'
import EmpiricalSolver from '../components/empirical/EmpiricalSolver'
import EmpiricalPractice from '../components/empirical/EmpiricalPractice'

type Mode = 'reference' | 'practice' | 'problems'

export default function EmpiricalPage() {
  const loadElements = useElementStore(s => s.loadElements)
  const loading = useElementStore(s => s.loading)
  const error = useElementStore(s => s.error)

  const [searchParams, setSearchParams] = useSearchParams()
  const mode: Mode = (searchParams.get('mode') as Mode) ?? 'reference'

  useEffect(() => { loadElements() }, [loadElements])

  function setMode(m: Mode) {
    if (m === mode) return
    setSearchParams(m === 'reference' ? {} : { mode: m }, { replace: true })
  }

  const needsElements = mode === 'practice' || mode === 'problems'

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Empirical &amp; Molecular Formula</h2>

        {/* Mode toggle switch */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = mode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="empirical-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            )
          })}
        </div>
      </div>

      {needsElements && loading && <p className="font-mono text-xs text-dim animate-pulse">Loading element data…</p>}
      {needsElements && error   && <p className="font-sans text-xs" style={{ color: '#f87171' }}>Failed to load elements: {error}</p>}

      <AnimatePresence mode="wait">
        {mode === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EmpiricalReference />
          </motion.div>
        )}
        {mode === 'practice' && !loading && !error && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EmpiricalSolver />
          </motion.div>
        )}
        {mode === 'problems' && !loading && !error && (
          <motion.div key="problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EmpiricalPractice />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StoichiometrySolver from '../components/stoichiometry/StoichiometrySolver'
import StoichiometryPractice from '../components/stoichiometry/StoichiometryPractice'
import BalancingPractice from '../components/stoichiometry/BalancingPractice'

type Tab = 'solver' | 'practice' | 'balance'

const TABS: { id: Tab; label: string; subtitle: string }[] = [
  { id: 'solver',   label: 'Solver',   subtitle: 'step-by-step calculator' },
  { id: 'practice', label: 'Practice', subtitle: 'generated problems'      },
  { id: 'balance',  label: 'Balance',  subtitle: 'fill in coefficients'    },
]

export default function StoichiometryPage() {
  const [tab, setTab] = useState<Tab>('solver')

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header + tabs */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Stoichiometry</h2>

        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex flex-col items-start px-4 py-2 rounded-sm font-sans text-sm
                           font-medium transition-colors text-left"
                style={isActive ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                } : {
                  background: '#0e1016',
                  border: '1px solid #1c1f2e',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                <span>{t.label}</span>
                <span className="font-mono text-[9px] mt-0.5 opacity-60">{t.subtitle}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'solver'   && <StoichiometrySolver />}
          {tab === 'practice' && <StoichiometryPractice />}
          {tab === 'balance'  && <BalancingPractice />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import IdealGasCalc from '../components/idealgas/IdealGasCalc'
import IdealGasPractice from '../components/idealgas/IdealGasPractice'
import GasStoichPractice from '../components/stoichiometry/GasStoichPractice'
import VanDerWaalsPractice from '../components/idealgas/VanDerWaalsPractice'

type Tab = 'reference' | 'practice' | 'gas-stoich' | 'vdw-practice'
type Mode = 'reference' | 'practice'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'reference', label: 'Ideal Gas', formula: 'PV=nRT' },
]

const PRACTICE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'practice',     label: 'PV=nRT',       formula: 'P,V,n,T' },
  { id: 'gas-stoich',   label: 'Gas Stoich',    formula: 'L→mol→g' },
  { id: 'vdw-practice', label: 'Real Gas',      formula: 'vdW'     },
]

const PRACTICE_TAB_IDS = new Set<Tab>(['practice', 'gas-stoich', 'vdw-practice'])

export default function IdealGasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'reference'
  const activeMode: Mode = PRACTICE_TAB_IDS.has(activeTab) ? 'practice' : 'reference'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    setTab(mode === 'practice' ? 'practice' : 'reference')
  }

  const visibleTabs = activeMode === 'reference' ? REFERENCE_TABS : PRACTICE_TABS

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Ideal Gas Law</h2>

        {/* Mode toggle switch */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="idealgas-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Sub-tab pills */}
        {visibleTabs.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {visibleTabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setTab(tab.id)}
                  className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                  {isActive && (
                    <motion.div layoutId="idealgas-tab-pill" className="absolute inset-0 rounded-sm"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{tab.formula}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IdealGasCalc />
          </motion.div>
        )}
        {activeTab === 'practice' && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IdealGasPractice />
          </motion.div>
        )}
        {activeTab === 'gas-stoich' && (
          <motion.div key="gas-stoich"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasStoichPractice />
          </motion.div>
        )}
        {activeTab === 'vdw-practice' && (
          <motion.div key="vdw-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VanDerWaalsPractice />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import MolarReference from '../components/calculations/MolarReference'
import StoichReference from '../components/stoichiometry/StoichReference'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import EnergyLevelsReference from '../components/atomic/EnergyLevelsReference'
import SolubilityReference from '../components/reference/SolubilityReference'

type Tab = 'stoich' | 'molar' | 'solubility' | 'quantum' | 'energy'

const TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'stoich',     label: 'Stoichiometry',    formula: '⚖'  },
  { id: 'molar',      label: 'Molar & Solutions', formula: '⚗'  },
  { id: 'solubility', label: 'Solubility Rules',  formula: 'S/I' },
  { id: 'quantum',    label: 'Quantum Numbers',   formula: 'QN' },
  { id: 'energy',     label: 'Energy Levels',     formula: 'Eₙ' },
]

export default function ReferencePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'stoich'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3 print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Reference</h2>

        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                {isActive && (
                  <motion.div layoutId="reference-pill" className="absolute inset-0 rounded-sm"
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
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'stoich' && (
          <motion.div key="stoich"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichReference />
          </motion.div>
        )}
        {activeTab === 'molar' && (
          <motion.div key="molar"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MolarReference />
          </motion.div>
        )}
        {activeTab === 'solubility' && (
          <motion.div key="solubility"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolubilityReference />
          </motion.div>
        )}
        {activeTab === 'quantum' && (
          <motion.div key="quantum"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <QuantumNumbersReference />
          </motion.div>
        )}
        {activeTab === 'energy' && (
          <motion.div key="energy"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EnergyLevelsReference />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

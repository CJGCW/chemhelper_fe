import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import StoichiometrySolver from '../components/stoichiometry/StoichiometrySolver'
import LimitingReagentSolver from '../components/stoichiometry/LimitingReagentSolver'
import TheoreticalYieldSolver from '../components/stoichiometry/TheoreticalYieldSolver'
import PercentYieldSolver from '../components/stoichiometry/PercentYieldSolver'
import StoichiometryPractice from '../components/stoichiometry/StoichiometryPractice'
import BalancingPractice from '../components/stoichiometry/BalancingPractice'
import StoichReference from '../components/stoichiometry/StoichReference'
import StoichExamples from '../components/stoichiometry/StoichExamples'

type Tab = 'stoich' | 'limiting' | 'theoretical' | 'percent' | 'practice' | 'balance' | 'reference' | 'examples'

const SOLVER_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'stoich',      label: 'Stoichiometry',    formula: 'g ↔ mol' },
  { id: 'balance',     label: 'Balance',          formula: '_□_'     },
  { id: 'limiting',    label: 'Limiting Reagent', formula: 'LR'      },
  { id: 'theoretical', label: 'Theoretical Yield',formula: 'T.Y.'    },
  { id: 'percent',     label: 'Percent Yield',    formula: '%Y'      },
]

const RESOURCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'reference',   label: 'Reference',        formula: '≡'       },
  { id: 'examples',    label: 'Examples',         formula: '▶'       },
  { id: 'practice',    label: 'Practice',         formula: '✎'       },
]

export default function StoichiometryPage() {
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
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Stoichiometry</h2>

        {/* Solver tabs */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {SOLVER_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                {isActive && (
                  <motion.div layoutId="stoich-solver-pill" className="absolute inset-0 rounded-sm"
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

        {/* Resource tabs */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {RESOURCE_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                {isActive && (
                  <motion.div layoutId="stoich-resource-pill" className="absolute inset-0 rounded-sm"
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
            <StoichiometrySolver />
          </motion.div>
        )}
        {activeTab === 'limiting' && (
          <motion.div key="limiting"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LimitingReagentSolver />
          </motion.div>
        )}
        {activeTab === 'theoretical' && (
          <motion.div key="theoretical"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <TheoreticalYieldSolver />
          </motion.div>
        )}
        {activeTab === 'percent' && (
          <motion.div key="percent"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PercentYieldSolver />
          </motion.div>
        )}
        {activeTab === 'practice' && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichiometryPractice />
          </motion.div>
        )}
        {activeTab === 'balance' && (
          <motion.div key="balance"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <BalancingPractice />
          </motion.div>
        )}
        {activeTab === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichReference />
          </motion.div>
        )}
        {activeTab === 'examples' && (
          <motion.div key="examples"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichExamples />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

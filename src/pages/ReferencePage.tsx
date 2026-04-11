import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import MolarReference from '../components/calculations/MolarReference'
import StoichReference from '../components/stoichiometry/StoichReference'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import EnergyLevelsReference from '../components/atomic/EnergyLevelsReference'
import SolubilityReference from '../components/reference/SolubilityReference'
import NamingReference from '../components/reference/NamingReference'
import ReactionClassifier from '../components/tools/ReactionClassifier'
import ElectrolyteClassifier from '../components/tools/ElectrolyteClassifier'
import NetIonicTool from '../components/tools/NetIonicTool'
import ActivitySeries from '../components/tools/ActivitySeries'
import IdealGasReference from '../components/idealgas/IdealGasReference'
import EmpiricalVisual from '../components/empirical/EmpiricalVisual'
import LewisReference from '../components/lewis/LewisReference'
import VsepReference from '../components/vsepr/VsepReference'
import LewisPage from './LewisPage'
import VsepPage from './VsepPage'

type Tab =
  | 'stoich' | 'molar' | 'solubility' | 'quantum' | 'energy' | 'naming'
  | 'classifier' | 'electrolyte' | 'net-ionic' | 'activity' | 'ideal-gas' | 'empirical'
  | 'lewis' | 'vsepr'

const TABS: { id: Tab; label: string }[] = [
  { id: 'stoich',      label: 'Stoichiometry'       },
  { id: 'molar',       label: 'Molar & Solutions'   },
  { id: 'solubility',  label: 'Solubility Rules'    },
  { id: 'quantum',     label: 'Quantum Numbers'     },
  { id: 'energy',      label: 'Energy Levels'       },
  { id: 'naming',      label: 'Naming'              },
  { id: 'lewis',       label: 'Lewis Structures'    },
  { id: 'vsepr',       label: 'VSEPR'               },
  { id: 'classifier',  label: 'Reaction Classifier' },
  { id: 'electrolyte', label: 'Electrolyte'         },
  { id: 'net-ionic',   label: 'Net Ionic Equations' },
  { id: 'activity',    label: 'Activity Series'     },
  { id: 'ideal-gas',   label: 'Ideal Gas Law'       },
  { id: 'empirical',   label: 'Empirical Formula'   },
]

export default function ReferencePage() {
  const [searchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'stoich'

  const pageLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Reference'

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
          {pageLabel}
        </h2>
        {(['stoich','molar','solubility','quantum','energy'] as Tab[]).includes(activeTab) && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span>⎙</span>
            <span>Print</span>
          </button>
        )}
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
        {activeTab === 'naming' && (
          <motion.div key="naming"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NamingReference />
          </motion.div>
        )}
        {activeTab === 'lewis' && (
          <motion.div key="lewis"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="flex flex-col gap-8">
            <LewisPage embedded />
            <div className="border-t border-border pt-6">
              <LewisReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'vsepr' && (
          <motion.div key="vsepr"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="flex flex-col gap-8">
            <VsepPage />
            <div className="border-t border-border pt-6">
              <VsepReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'classifier' && (
          <motion.div key="classifier"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionClassifier />
          </motion.div>
        )}
        {activeTab === 'electrolyte' && (
          <motion.div key="electrolyte"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ElectrolyteClassifier />
          </motion.div>
        )}
        {activeTab === 'net-ionic' && (
          <motion.div key="net-ionic"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NetIonicTool />
          </motion.div>
        )}
        {activeTab === 'activity' && (
          <motion.div key="activity"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ActivitySeries />
          </motion.div>
        )}
        {activeTab === 'ideal-gas' && (
          <motion.div key="ideal-gas"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IdealGasReference />
          </motion.div>
        )}
        {activeTab === 'empirical' && (
          <motion.div key="empirical"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EmpiricalVisual />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

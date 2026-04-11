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

type Tab =
  | 'stoich' | 'molar' | 'solubility' | 'quantum' | 'energy' | 'naming'
  | 'classifier' | 'electrolyte' | 'net-ionic' | 'activity'

const TABS: { id: Tab; label: string }[] = [
  { id: 'stoich',      label: 'Stoichiometry'       },
  { id: 'molar',       label: 'Molar & Solutions'   },
  { id: 'solubility',  label: 'Solubility Rules'    },
  { id: 'quantum',     label: 'Quantum Numbers'     },
  { id: 'energy',      label: 'Energy Levels'       },
  { id: 'naming',      label: 'Naming'              },
  { id: 'classifier',  label: 'Reaction Classifier' },
  { id: 'electrolyte', label: 'Electrolyte'         },
  { id: 'net-ionic',   label: 'Net Ionic Equations' },
  { id: 'activity',    label: 'Activity Series'     },
]

export default function ReferencePage() {
  const [searchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'stoich'

  const pageLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Reference'

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header — title only, navigation is in the sidebar */}
      <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl print:hidden">
        {pageLabel}
      </h2>

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
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import RedoxPractice from '../components/redox/RedoxPractice'
import RedoxReference from '../components/redox/RedoxReference'
import ReactionClassifier from '../components/tools/ReactionClassifier'
import ElectrolyteClassifier from '../components/tools/ElectrolyteClassifier'
import NetIonicTool from '../components/tools/NetIonicTool'
import ActivitySeries from '../components/tools/ActivitySeries'
import ReactionPredictor from '../components/tools/ReactionPredictor'
import EcellCalc from '../components/tools/EcellCalc'
import ReactionPredictorPractice from '../components/tools/ReactionPredictorPractice'
import EcellPractice from '../components/tools/EcellPractice'

type Tab = 'practice' | 'rxn-practice' | 'ecell-practice' | 'classifier' | 'electrolyte' | 'net-ionic' | 'activity' | 'predictor' | 'ecell' | 'reference'
type Mode = 'reference' | 'practice' | 'problems'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'reference', label: 'Guide', formula: '⎙' },
]

const PRACTICE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'classifier',  label: 'Reaction Classifier', formula: '⇄'  },
  { id: 'electrolyte', label: 'Electrolyte',         formula: '⚡' },
  { id: 'net-ionic',   label: 'Net Ionic',           formula: '⇌'  },
  { id: 'activity',    label: 'Activity Series',     formula: '↕'  },
  { id: 'predictor',   label: 'Rxn Predictor',       formula: '⇄'  },
  { id: 'ecell',       label: 'E°cell / Nernst',     formula: 'E°' },
]

const PROBLEMS_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'practice',       label: 'Redox',         formula: '✎'  },
  { id: 'rxn-practice',   label: 'Rxn Predictor', formula: '⇄'  },
  { id: 'ecell-practice', label: 'E°cell',        formula: 'E°' },
]

const PRACTICE_TAB_IDS = new Set<Tab>(PRACTICE_TABS.map(t => t.id))
const PROBLEMS_TAB_IDS = new Set<Tab>(PROBLEMS_TABS.map(t => t.id))

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'predictor':      'rxn-predictor',
  'rxn-practice':   'rxn-predictor',
  'ecell':          'ecell',
  'ecell-practice': 'ecell',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'rxn-predictor': { practice: 'predictor', problems: 'rxn-practice'   },
  'ecell':         { practice: 'ecell',     problems: 'ecell-practice' },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'reference',
  practice:  'classifier',
  problems:  'practice',
}

export default function RedoxPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'classifier'

  const activeMode: Mode = PROBLEMS_TAB_IDS.has(activeTab) ? 'problems'
    : PRACTICE_TAB_IDS.has(activeTab) ? 'practice'
    : 'reference'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    const topic = TAB_TO_TOPIC[activeTab]
    const next = (topic ? TOPIC_MODE_TAB[topic]?.[mode] : undefined) ?? MODE_DEFAULT[mode]
    setTab(next)
  }

  const visibleTabs = activeMode === 'problems' ? PROBLEMS_TABS
    : activeMode === 'practice' ? PRACTICE_TABS
    : REFERENCE_TABS

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Redox</h2>
          {activeTab === 'reference' && (
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
        <h2 className="hidden print:block font-sans font-semibold text-black text-xl">Redox Reference</h2>

        {/* Mode toggle switch */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(mode => {
            const isActive = activeMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="redox-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{mode}</span>
              </button>
            )
          })}
        </div>

        {/* Tab pills for active mode */}
        {visibleTabs.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {visibleTabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setTab(tab.id)}
                  className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                  {isActive && (
                    <motion.div layoutId="redox-tab-pill" className="absolute inset-0 rounded-sm"
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

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'practice' && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RedoxPractice />
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
        {activeTab === 'predictor' && (
          <motion.div key="predictor"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionPredictor />
          </motion.div>
        )}
        {activeTab === 'ecell' && (
          <motion.div key="ecell"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EcellCalc />
          </motion.div>
        )}
        {activeTab === 'rxn-practice' && (
          <motion.div key="rxn-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionPredictorPractice />
          </motion.div>
        )}
        {activeTab === 'ecell-practice' && (
          <motion.div key="ecell-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EcellPractice />
          </motion.div>
        )}
        {activeTab === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RedoxReference />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

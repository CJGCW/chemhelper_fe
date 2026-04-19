import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import RedoxPractice from '../components/redox/RedoxPractice'
import RedoxReference, { type RefTopic } from '../components/redox/RedoxReference'
import ReactionClassifier from '../components/tools/ReactionClassifier'
import ElectrolyteClassifier from '../components/tools/ElectrolyteClassifier'
import NetIonicTool from '../components/tools/NetIonicTool'
import ActivitySeries from '../components/tools/ActivitySeries'
import ReactionPredictor from '../components/tools/ReactionPredictor'
import EcellCalc from '../components/tools/EcellCalc'
import ReactionPredictorPractice from '../components/tools/ReactionPredictorPractice'
import EcellPractice from '../components/tools/EcellPractice'
import ReactionClassifierProblems from '../components/tools/ReactionClassifierProblems'
import ElectrolyteProblems from '../components/tools/ElectrolyteProblems'
import NetIonicProblems from '../components/tools/NetIonicProblems'
import ActivitySeriesProblems from '../components/tools/ActivitySeriesProblems'

type Tab = 'practice' | 'rxn-practice' | 'ecell-practice' | 'classifier' | 'electrolyte' | 'net-ionic' | 'activity' | 'predictor' | 'ecell' | 'reference' | 'redox-practice' | 'classifier-problems' | 'electrolyte-problems' | 'net-ionic-problems' | 'activity-problems'
  | 'ref-oxidation' | 'ref-reaction-types' | 'ref-activity' | 'ref-acids-bases' | 'ref-redox-concepts'
type Mode = 'reference' | 'practice' | 'problems'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'ref-oxidation',     label: 'Oxidation States', formula: 'ox'  },
  { id: 'ref-reaction-types', label: 'Rxn Types',       formula: '⇄'  },
  { id: 'ref-activity',      label: 'Activity Series',  formula: '↕'  },
  { id: 'ref-acids-bases',   label: 'Acids & Bases',    formula: 'pH' },
  { id: 'ref-redox-concepts', label: 'Redox',           formula: 'e⁻' },
]

const REF_TOPIC_MAP: Partial<Record<Tab, RefTopic>> = {
  'ref-oxidation':      'oxidation',
  'ref-reaction-types': 'reaction-types',
  'ref-activity':       'activity',
  'ref-acids-bases':    'acids-bases',
  'ref-redox-concepts': 'redox-concepts',
}

const REFERENCE_TAB_IDS = new Set<Tab>(REFERENCE_TABS.map(t => t.id))

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'reactions',
    label: 'Reactions',
    pills: [
      { id: 'classifier', label: 'Rxn Classifier', formula: '⇄' },
      { id: 'net-ionic',  label: 'Net Ionic',       formula: '⇌' },
      { id: 'predictor',  label: 'Rxn Predictor',   formula: '→' },
      { id: 'activity',   label: 'Activity Series', formula: '↕' },
    ],
  },
  {
    id: 'electrochemistry',
    label: 'Electrochemistry',
    pills: [
      { id: 'electrolyte',    label: 'Electrolyte',   formula: '⚡' },
      { id: 'redox-practice', label: 'Redox',         formula: 'e⁻' },
      { id: 'ecell',          label: 'E°cell / Nernst', formula: 'E°' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'reactions',
    label: 'Reactions',
    pills: [
      { id: 'classifier-problems', label: 'Rxn Type',     formula: '⇄' },
      { id: 'net-ionic-problems',  label: 'Net Ionic',    formula: '⇌' },
      { id: 'rxn-practice',        label: 'Rxn Predictor', formula: '→' },
      { id: 'activity-problems',   label: 'Activity',     formula: '↕' },
    ],
  },
  {
    id: 'electrochemistry',
    label: 'Electrochemistry',
    pills: [
      { id: 'electrolyte-problems', label: 'Electrolyte', formula: '⚡' },
      { id: 'practice',             label: 'Redox',       formula: 'e⁻' },
      { id: 'ecell-practice',       label: 'E°cell',      formula: 'E°' },
    ],
  },
]

const PRACTICE_TAB_IDS = new Set<Tab>(PRACTICE_GROUPS.flatMap(g => g.pills.map(p => p.id)))
const PROBLEMS_TAB_IDS = new Set<Tab>(PROBLEMS_GROUPS.flatMap(g => g.pills.map(p => p.id)))

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'predictor':             'rxn-predictor',
  'rxn-practice':          'rxn-predictor',
  'ecell':                 'ecell',
  'ecell-practice':        'ecell',
  'practice':              'redox',
  'redox-practice':        'redox',
  'classifier':            'classifier',
  'classifier-problems':   'classifier',
  'electrolyte':           'electrolyte',
  'electrolyte-problems':  'electrolyte',
  'net-ionic':             'net-ionic',
  'net-ionic-problems':    'net-ionic',
  'activity':              'activity',
  'activity-problems':     'activity',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'rxn-predictor': { practice: 'predictor',     problems: 'rxn-practice'          },
  'ecell':         { practice: 'ecell',          problems: 'ecell-practice'        },
  'redox':         { practice: 'redox-practice', problems: 'practice'              },
  'classifier':    { practice: 'classifier',     problems: 'classifier-problems'   },
  'electrolyte':   { practice: 'electrolyte',    problems: 'electrolyte-problems'  },
  'net-ionic':     { practice: 'net-ionic',       problems: 'net-ionic-problems'    },
  'activity':      { practice: 'activity',        problems: 'activity-problems'     },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-oxidation',
  practice:  'classifier',
  problems:  'practice',
}

export default function RedoxPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [openGroups, setOpenGroups] = useState(() => new Set<string>())
  const [printingAll, setPrintingAll] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'classifier'

  const activeMode: Mode = PROBLEMS_TAB_IDS.has(activeTab) ? 'problems'
    : PRACTICE_TAB_IDS.has(activeTab) ? 'practice'
    : REFERENCE_TAB_IDS.has(activeTab) ? 'reference'
    : activeTab === 'reference' ? 'reference'
    : 'practice'

  const activeGroups = activeMode === 'problems' ? PROBLEMS_GROUPS : PRACTICE_GROUPS

  useEffect(() => {
    const group = activeGroups.find(g => g.pills.some(p => p.id === activeTab))
    if (group) {
      setOpenGroups(prev => {
        if (prev.has(group.id)) return prev
        const next = new Set(prev)
        next.add(group.id)
        return next
      })
    }
  }, [activeTab, activeMode])

  useEffect(() => {
    if (!printingAll) return
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
    const handler = () => setPrintingAll(false)
    window.addEventListener('afterprint', handler, { once: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('afterprint', handler)
    }
  }, [printingAll])

  function toggleGroup(id: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

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

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Redox</h2>
          {activeMode === 'reference' && REF_TOPIC_MAP[activeTab] && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          {activeMode === 'reference' && (
            <button
              onClick={() => setPrintingAll(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print All</span>
            </button>
          )}
        </div>
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

        {/* Reference sub-topic pills */}
        {activeMode === 'reference' && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {REFERENCE_TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setTab(tab.id)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                  {isActive && (
                    <motion.div layoutId="redox-ref-pill" className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{tab.formula}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Tab pills for active mode */}
        {activeMode !== 'reference' && (
          <div className="flex flex-col gap-1.5 print:hidden">
            {activeGroups.map(group => {
              const isOpen = openGroups.has(group.id)
              const groupActive = group.pills.some(p => p.id === activeTab)
              return (
                <div key={group.id} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="relative flex items-center self-start px-3 py-1.5 rounded-sm font-sans text-xs font-semibold transition-colors"
                    style={{ color: groupActive ? 'var(--c-halogen)' : isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
                  >
                    {groupActive ? (
                      <motion.div
                        layoutId={`redox-group-bg-${group.id}`}
                        className="absolute inset-0 rounded-sm"
                        style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    ) : (
                      <div className="absolute inset-0 rounded-sm" style={{ background: '#0e1016', border: '1px solid #1c1f2e' }} />
                    )}
                    <span className="relative z-10">{group.label}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-1 flex-wrap pb-0.5">
                          {group.pills.map(pill => {
                            const isActive = activeTab === pill.id
                            return (
                              <button
                                key={pill.id}
                                onClick={() => setTab(pill.id)}
                                className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="redox-pill-bg"
                                    className="absolute inset-0 rounded-sm"
                                    style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                  />
                                )}
                                <span className="relative z-10">{pill.label}</span>
                                <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{pill.formula}</span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Content */}
      {printingAll && <RedoxReference />}
      <AnimatePresence mode="wait">
        {(activeTab === 'practice' || activeTab === 'redox-practice') && !printingAll && (
          <motion.div key={activeTab}
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
        {REF_TOPIC_MAP[activeTab] && !printingAll && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RedoxReference topic={REF_TOPIC_MAP[activeTab]} />
          </motion.div>
        )}
        {activeTab === 'classifier-problems' && (
          <motion.div key="classifier-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionClassifierProblems />
          </motion.div>
        )}
        {activeTab === 'electrolyte-problems' && (
          <motion.div key="electrolyte-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ElectrolyteProblems />
          </motion.div>
        )}
        {activeTab === 'net-ionic-problems' && (
          <motion.div key="net-ionic-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NetIonicProblems />
          </motion.div>
        )}
        {activeTab === 'activity-problems' && (
          <motion.div key="activity-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ActivitySeriesProblems />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import MechanismReference from '../components/mechanisms/MechanismReference'
import MechanismPractice from '../components/mechanisms/MechanismPractice'
import PageShell from '../components/Layout/PageShell'

type Tab =
  | 'ref-mech-sn-e' | 'ref-mech-alkene'
  | 'mech-identify'
  | 'mech-identify-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'rg1',
    label: 'Substitution & Elimination',
    pills: [
      { id: 'ref-mech-sn-e', label: 'SN1 / SN2 / E1 / E2', formula: 'SN/E' },
    ],
  },
  {
    id: 'rg2',
    label: 'Alkene Reactions',
    pills: [
      { id: 'ref-mech-alkene', label: 'Alkene Additions', formula: 'C=C' },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Mechanism Identification',
    pills: [
      { id: 'mech-identify', label: 'Identify Mechanism', formula: 'SN/E/Add' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'pr1',
    label: 'Mechanism Identification',
    pills: [
      { id: 'mech-identify-problems', label: 'Identify Mechanism', formula: 'SN/E/Add' },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-mech-sn-e':           'mech-sn-e',
  'ref-mech-alkene':          'mech-alkene',
  'mech-identify':            'mech-sn-e',
  'mech-identify-problems':   'mech-sn-e',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'mech-sn-e':   { reference: 'ref-mech-sn-e',  practice: 'mech-identify', problems: 'mech-identify-problems' },
  'mech-alkene': { reference: 'ref-mech-alkene', practice: 'mech-identify', problems: 'mech-identify-problems' },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-mech-sn-e',
  practice:  'mech-identify',
  problems:  'mech-identify-problems',
}

const PAGE_EXPLANATION: ExplanationContent = {
  title: 'Organic Reaction Mechanisms',
  formula: 'SN1 · SN2 · E1 · E2 · Markovnikov',
  formulaVars: [
    { symbol: 'SN2', meaning: 'Backside attack, concerted, inversion',     unit: '1° substrate' },
    { symbol: 'SN1', meaning: 'Carbocation intermediate, racemization',     unit: '3° substrate' },
    { symbol: 'E2',  meaning: 'Anti-periplanar concerted elimination',       unit: 'strong base'  },
    { symbol: 'E1',  meaning: 'Carbocation then proton loss, Zaitsev rule', unit: 'weak base'    },
  ],
  description:
    'Reaction mechanisms explain how and why organic transformations occur at the molecular level — ' +
    'which bonds break, which form, and in what order. ' +
    'Understanding SN1/SN2/E1/E2 and electrophilic additions is the foundation of Organic Chemistry 1. ' +
    'Use the Reference cards to study each mechanism step-by-step, then practice identifying mechanisms from conditions.',
}

export default function MechanismPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-mech-sn-e'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  const { isTabVisible } = useTopicFilter()

  const visibleReferenceGroups = REFERENCE_GROUPS
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)
  const visiblePracticeGroups = PRACTICE_GROUPS
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)
  const visibleProblemsGroups = PROBLEMS_GROUPS
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)

  const visiblePracticeTabIds = new Set<Tab>(visiblePracticeGroups.flatMap(g => g.pills.map(p => p.id)))
  const visibleProblemsTabIds = new Set<Tab>(visibleProblemsGroups.flatMap(g => g.pills.map(p => p.id)))

  const allVisibleTabIds = [
    ...visibleReferenceGroups.flatMap(g => g.pills.map(p => p.id)),
    ...visiblePracticeTabIds,
    ...visibleProblemsTabIds,
  ]
  const firstVisibleTab = allVisibleTabIds[0] as Tab | undefined
  const tabIsVisible = isTabVisible(activeTab)

  useEffect(() => {
    if (!tabIsVisible && firstVisibleTab !== undefined) setTab(firstVisibleTab)
  }, [tabIsVisible, firstVisibleTab])

  const activeMode: Mode = visibleProblemsTabIds.has(activeTab) ? 'problems'
    : visiblePracticeTabIds.has(activeTab) ? 'practice'
    : 'reference'

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    const topic = TAB_TO_TOPIC[activeTab]
    const next = (topic ? TOPIC_MODE_TAB[topic]?.[mode] : undefined) ?? MODE_DEFAULT[mode]
    setTab(next)
  }

  const activeGroups = activeMode === 'problems' ? visibleProblemsGroups
    : activeMode === 'practice' ? visiblePracticeGroups
    : visibleReferenceGroups

  return (
    <PageShell>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Organic Mechanisms</h2>
          {activeMode === 'reference' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                       font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono">?</span>
            <span>What is this</span>
          </button>
        </div>

        {/* Mode toggle */}
        <div
          className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}
        >
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="mech-mode-switch"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            )
          })}
        </div>

        {/* Sub-tab groups */}
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-3 print:hidden">
          {activeGroups.map(group => (
            <div
              key={group.id}
              className="flex flex-col gap-2 px-3 py-2 rounded-sm"
              style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}
            >
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {group.pills.map(pill => {
                  const isActive = activeTab === pill.id
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setTab(pill.id)}
                      className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mech-tab-pill"
                          className="absolute inset-0 rounded-sm"
                          style={{
                            background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                            border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{pill.label}</span>
                      <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{pill.formula}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {allVisibleTabIds.length === 0 && (
        <p className="font-sans text-sm text-dim py-8 text-center">
          No topics enabled —{' '}
          <Link to="/settings" className="text-secondary underline">visit Settings to configure</Link>.
        </p>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'ref-mech-sn-e' && (
          <motion.div key="ref-mech-sn-e"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MechanismReference initialCategory="sn_e" />
          </motion.div>
        )}
        {activeTab === 'ref-mech-alkene' && (
          <motion.div key="ref-mech-alkene"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MechanismReference initialCategory="alkene" />
          </motion.div>
        )}
        {activeTab === 'mech-identify' && (
          <motion.div key="mech-identify"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MechanismPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'mech-identify-problems' && (
          <motion.div key="mech-identify-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MechanismPractice allowCustom={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <ExplanationModal
        content={PAGE_EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </PageShell>
  )
}

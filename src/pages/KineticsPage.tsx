import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal from '../components/calculations/ExplanationModal'
import PageShell from '../components/Layout/PageShell'

// Reference components
import RateLawReference from '../components/kinetics/RateLawReference'
import ArrheniusReference from '../components/kinetics/ArrheniusReference'
import IntegratedRateReference from '../components/kinetics/IntegratedRateReference'
import HalfLifeReference from '../components/kinetics/HalfLifeReference'
import MechanismReference from '../components/kinetics/MechanismReference'

// Practice (tool) components
import RateLawTool from '../components/kinetics/RateLawTool'
import ArrheniusTool from '../components/kinetics/ArrheniusTool'
import IntegratedRateTool from '../components/kinetics/IntegratedRateTool'
import HalfLifeTool from '../components/kinetics/HalfLifeTool'
import MechanismPractice from '../components/kinetics/MechanismPractice'

// Problem components
import RateLawPractice from '../components/kinetics/RateLawPractice'
import ArrheniusPractice from '../components/kinetics/ArrheniusPractice'
import IntegratedRatePractice from '../components/kinetics/IntegratedRatePractice'
import HalfLifePractice from '../components/kinetics/HalfLifePractice'

type Tab =
  // reference
  | 'ref-rate-law' | 'ref-arrhenius' | 'ref-integrated' | 'ref-half-life' | 'ref-mechanisms'
  // practice
  | 'rate-law' | 'arrhenius' | 'integrated' | 'half-life' | 'mechanisms'
  // problems
  | 'rate-law-problems' | 'arrhenius-problems' | 'integrated-problems' | 'half-life-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'ref-ratelaws',
    label: 'Rate Laws',
    pills: [
      { id: 'ref-rate-law',   label: 'Rate Law',   formula: 'k[A]ⁿ'      },
      { id: 'ref-arrhenius',  label: 'Arrhenius',  formula: 'k=Ae⁻ᴱᵃ/ᴿᵀ' },
    ],
  },
  {
    id: 'ref-integrated',
    label: 'Integrated Rates',
    pills: [
      { id: 'ref-integrated', label: 'Integrated Rate', formula: 'ln[A]' },
      { id: 'ref-half-life',  label: 'Half-Life',       formula: 't½'    },
      { id: 'ref-mechanisms', label: 'Mechanisms',      formula: 'mech'  },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'practice-ratelaws',
    label: 'Rate Laws',
    pills: [
      { id: 'rate-law',  label: 'Rate Law',  formula: 'k[A]ⁿ'   },
      { id: 'arrhenius', label: 'Arrhenius', formula: 'k=Ae⁻ᴱᵀ' },
    ],
  },
  {
    id: 'practice-integrated',
    label: 'Integrated Rates',
    pills: [
      { id: 'integrated', label: 'Integrated Rate', formula: 'ln[A]' },
      { id: 'half-life',  label: 'Half-Life',       formula: 't½'    },
      { id: 'mechanisms', label: 'Mechanisms',       formula: 'mech'  },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'problems-ratelaws',
    label: 'Rate Laws',
    pills: [
      { id: 'rate-law-problems',  label: 'Rate Law',  formula: 'k[A]ⁿ' },
      { id: 'arrhenius-problems', label: 'Arrhenius', formula: 'Ea'     },
    ],
  },
  {
    id: 'problems-integrated',
    label: 'Integrated Rates',
    pills: [
      { id: 'integrated-problems', label: 'Integrated Rate', formula: 'ln[A]' },
      { id: 'half-life-problems',  label: 'Half-Life',       formula: 't½'    },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-rate-law':   'rate-law',   'rate-law':   'rate-law',   'rate-law-problems':   'rate-law',
  'ref-arrhenius':  'arrhenius',  'arrhenius':  'arrhenius',  'arrhenius-problems':  'arrhenius',
  'ref-integrated': 'integrated', 'integrated': 'integrated', 'integrated-problems': 'integrated',
  'ref-half-life':  'half-life',  'half-life':  'half-life',  'half-life-problems':  'half-life',
  'ref-mechanisms': 'mechanisms', 'mechanisms': 'mechanisms',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'rate-law':   { reference: 'ref-rate-law',   practice: 'rate-law',   problems: 'rate-law-problems'   },
  'arrhenius':  { reference: 'ref-arrhenius',  practice: 'arrhenius',  problems: 'arrhenius-problems'  },
  'integrated': { reference: 'ref-integrated', practice: 'integrated', problems: 'integrated-problems' },
  'half-life':  { reference: 'ref-half-life',  practice: 'half-life',  problems: 'half-life-problems'  },
  'mechanisms': { reference: 'ref-mechanisms', practice: 'mechanisms'                                  },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-rate-law',
  practice:  'rate-law',
  problems:  'rate-law-problems',
}

const PAGE_EXPLANATION = {
  title: 'Chemical Kinetics',
  description:
    'Chemical Kinetics studies how fast chemical reactions occur and what factors affect reaction rates. ' +
    'Students encounter this topic early in Chem 102, typically before equilibrium. ' +
    'See the Reference tab for rate law expressions, integrated rate laws, and the Arrhenius equation.',
}

export default function KineticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-rate-law'

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
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Chemical Kinetics</h2>
          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                       font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono">?</span>
            <span>What is this</span>
          </button>
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
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {isActive && (
                  <motion.div layoutId="kinetics-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            )
          })}
        </div>

        {/* Sub-tab groups */}
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-3 print:hidden">
          {activeGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
              style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
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
                          layoutId="kinetics-tab-pill"
                          className="absolute inset-0 rounded-sm"
                          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
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
        {/* Reference */}
        {activeTab === 'ref-rate-law' && (
          <motion.div key="ref-rate-law"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RateLawReference />
          </motion.div>
        )}
        {activeTab === 'ref-arrhenius' && (
          <motion.div key="ref-arrhenius"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ArrheniusReference />
          </motion.div>
        )}
        {activeTab === 'ref-integrated' && (
          <motion.div key="ref-integrated"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IntegratedRateReference />
          </motion.div>
        )}
        {activeTab === 'ref-half-life' && (
          <motion.div key="ref-half-life"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HalfLifeReference />
          </motion.div>
        )}
        {activeTab === 'ref-mechanisms' && (
          <motion.div key="ref-mechanisms"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MechanismReference />
          </motion.div>
        )}
        {/* Practice */}
        {activeTab === 'rate-law' && (
          <motion.div key="rate-law"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RateLawTool />
          </motion.div>
        )}
        {activeTab === 'arrhenius' && (
          <motion.div key="arrhenius"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ArrheniusTool />
          </motion.div>
        )}
        {activeTab === 'integrated' && (
          <motion.div key="integrated"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IntegratedRateTool />
          </motion.div>
        )}
        {activeTab === 'half-life' && (
          <motion.div key="half-life"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HalfLifeTool />
          </motion.div>
        )}
        {activeTab === 'mechanisms' && (
          <motion.div key="mechanisms"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MechanismPractice allowCustom={true} />
          </motion.div>
        )}
        {/* Problems */}
        {activeTab === 'rate-law-problems' && (
          <motion.div key="rate-law-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RateLawPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'arrhenius-problems' && (
          <motion.div key="arrhenius-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ArrheniusPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'integrated-problems' && (
          <motion.div key="integrated-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IntegratedRatePractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'half-life-problems' && (
          <motion.div key="half-life-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HalfLifePractice allowCustom={false} />
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

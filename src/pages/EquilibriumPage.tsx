import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import PageShell from '../components/Layout/PageShell'

import KExpressionReference from '../components/equilibrium/KExpressionReference'
import QvsKReference from '../components/equilibrium/QvsKReference'
import LeChatelierReference from '../components/equilibrium/LeChatelierReference'
import ICETableReference from '../components/equilibrium/ICETableReference'
import KpKcReference from '../components/equilibrium/KpKcReference'

import KExpressionTool from '../components/equilibrium/KExpressionTool'
import QvsKTool from '../components/equilibrium/QvsKTool'
import ICETableTool from '../components/equilibrium/ICETableTool'
import KpKcTool from '../components/equilibrium/KpKcTool'

import KExpressionPractice from '../components/equilibrium/KExpressionPractice'
import QvsKPractice from '../components/equilibrium/QvsKPractice'
import LeChatelierPractice from '../components/equilibrium/LeChatelierPractice'
import ICETablePractice from '../components/equilibrium/ICETablePractice'
import KpKcPractice from '../components/equilibrium/KpKcPractice'

type Tab =
  // Reference
  | 'ref-keq' | 'ref-q-vs-k' | 'ref-le-chatelier' | 'ref-ice-table' | 'ref-kp-kc'
  // Practice
  | 'keq-expression' | 'q-vs-k' | 'le-chatelier' | 'ice-table' | 'kp-kc'
  // Problems
  | 'keq-problems' | 'q-vs-k-problems' | 'ice-table-problems' | 'kp-kc-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'ref-concepts',
    label: 'Concepts',
    pills: [
      { id: 'ref-keq',          label: 'K Expression',    formula: 'Kc'   },
      { id: 'ref-q-vs-k',       label: 'Q vs K',          formula: 'Q/K'  },
      { id: 'ref-le-chatelier', label: "Le Chatelier's",  formula: 'shift'},
    ],
  },
  {
    id: 'ref-calculations',
    label: 'Calculations',
    pills: [
      { id: 'ref-ice-table', label: 'ICE Table', formula: 'ICE'  },
      { id: 'ref-kp-kc',    label: 'Kp \u2194 Kc', formula: 'RT\u0394n' },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'practice-concepts',
    label: 'Concepts',
    pills: [
      { id: 'keq-expression', label: 'K Expression',   formula: 'Kc'   },
      { id: 'q-vs-k',         label: 'Q vs K',          formula: 'Q/K'  },
      { id: 'le-chatelier',   label: "Le Chatelier's",  formula: 'shift'},
    ],
  },
  {
    id: 'practice-calculations',
    label: 'Calculations',
    pills: [
      { id: 'ice-table', label: 'ICE Table',    formula: 'ICE'      },
      { id: 'kp-kc',     label: 'Kp \u2194 Kc', formula: 'RT\u0394n' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'problems-concepts',
    label: 'Concepts',
    pills: [
      { id: 'keq-problems',   label: 'K Expression', formula: 'Kc'  },
      { id: 'q-vs-k-problems', label: 'Q vs K',       formula: 'Q/K' },
    ],
  },
  {
    id: 'problems-calculations',
    label: 'Calculations',
    pills: [
      { id: 'ice-table-problems', label: 'ICE Table',    formula: 'ICE'      },
      { id: 'kp-kc-problems',     label: 'Kp \u2194 Kc', formula: 'RT\u0394n' },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-keq': 'keq', 'keq-expression': 'keq', 'keq-problems': 'keq',
  'ref-q-vs-k': 'qvsk', 'q-vs-k': 'qvsk', 'q-vs-k-problems': 'qvsk',
  'ref-le-chatelier': 'lechat', 'le-chatelier': 'lechat',
  'ref-ice-table': 'ice', 'ice-table': 'ice', 'ice-table-problems': 'ice',
  'ref-kp-kc': 'kpkc', 'kp-kc': 'kpkc', 'kp-kc-problems': 'kpkc',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  keq:    { reference: 'ref-keq',          practice: 'keq-expression', problems: 'keq-problems'       },
  qvsk:   { reference: 'ref-q-vs-k',       practice: 'q-vs-k',         problems: 'q-vs-k-problems'    },
  lechat: { reference: 'ref-le-chatelier', practice: 'le-chatelier'                                    },
  ice:    { reference: 'ref-ice-table',    practice: 'ice-table',       problems: 'ice-table-problems' },
  kpkc:   { reference: 'ref-kp-kc',       practice: 'kp-kc',           problems: 'kp-kc-problems'     },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-keq',
  practice:  'keq-expression',
  problems:  'keq-problems',
}

export default function EquilibriumPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-keq'

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
    if (next) setTab(next)
  }

  const activeGroups = activeMode === 'problems' ? visibleProblemsGroups
    : activeMode === 'practice' ? visiblePracticeGroups
    : visibleReferenceGroups

  return (
    <PageShell>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Chemical Equilibrium</h2>
          {activeMode === 'reference' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>\u2399</span>
              <span>Print</span>
            </button>
          )}
          <button
            onClick={() => setShowExplanation(s => !s)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                       font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono">?</span>
            <span>What is this</span>
          </button>
        </div>

        {showExplanation && (
          <div className="rounded-sm p-4 font-sans text-sm text-secondary leading-relaxed max-w-2xl print:hidden"
            style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
            <p>
              Chemical equilibrium describes reactions that proceed in both directions until the forward and reverse
              rates are equal. Equilibrium concepts underlie acid-base chemistry, buffer systems, and thermodynamics.
              See the Reference tab for the equilibrium constant expression and ICE table method.
            </p>
          </div>
        )}

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
                  <motion.div layoutId="equilibrium-mode-switch" className="absolute inset-0 rounded-full"
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
                          layoutId="equilibrium-tab-pill"
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
          No topics enabled &mdash;{' '}
          <Link to="/settings" className="text-secondary underline">visit Settings to configure</Link>.
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* Reference tabs */}
        {activeTab === 'ref-keq' && (
          <motion.div key="ref-keq" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KExpressionReference />
          </motion.div>
        )}
        {activeTab === 'ref-q-vs-k' && (
          <motion.div key="ref-q-vs-k" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <QvsKReference />
          </motion.div>
        )}
        {activeTab === 'ref-le-chatelier' && (
          <motion.div key="ref-le-chatelier" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LeChatelierReference />
          </motion.div>
        )}
        {activeTab === 'ref-ice-table' && (
          <motion.div key="ref-ice-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ICETableReference />
          </motion.div>
        )}
        {activeTab === 'ref-kp-kc' && (
          <motion.div key="ref-kp-kc" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KpKcReference />
          </motion.div>
        )}

        {/* Practice tabs */}
        {activeTab === 'keq-expression' && (
          <motion.div key="keq-expression" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KExpressionTool />
          </motion.div>
        )}
        {activeTab === 'q-vs-k' && (
          <motion.div key="q-vs-k" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <QvsKTool />
          </motion.div>
        )}
        {activeTab === 'le-chatelier' && (
          <motion.div key="le-chatelier" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LeChatelierPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'ice-table' && (
          <motion.div key="ice-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ICETableTool />
          </motion.div>
        )}
        {activeTab === 'kp-kc' && (
          <motion.div key="kp-kc" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KpKcTool />
          </motion.div>
        )}

        {/* Problems tabs */}
        {activeTab === 'keq-problems' && (
          <motion.div key="keq-problems" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KExpressionPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'q-vs-k-problems' && (
          <motion.div key="q-vs-k-problems" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <QvsKPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'ice-table-problems' && (
          <motion.div key="ice-table-problems" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ICETablePractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'kp-kc-problems' && (
          <motion.div key="kp-kc-problems" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KpKcPractice allowCustom={false} />
          </motion.div>
        )}
      </AnimatePresence>

    </PageShell>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import PageShell from '../components/Layout/PageShell'

// Reference components
import PhCalculatorReference from '../components/acid-base/PhCalculatorReference'
import KaKbReference from '../components/acid-base/KaKbReference'
import WeakAcidReference from '../components/acid-base/WeakAcidReference'
import WeakBaseReference from '../components/acid-base/WeakBaseReference'
import SaltPhReference from '../components/acid-base/SaltPhReference'
import PolyproticReference from '../components/acid-base/PolyproticReference'

// Practice components (tools)
import PhCalculatorTool from '../components/acid-base/PhCalculatorTool'
import KaKbTool from '../components/acid-base/KaKbTool'
import WeakAcidTool from '../components/acid-base/WeakAcidTool'
import WeakBaseTool from '../components/acid-base/WeakBaseTool'
import SaltPhTool from '../components/acid-base/SaltPhTool'

// Problems (auto-generated)
import PhCalculatorPractice from '../components/acid-base/PhCalculatorPractice'
import KaKbPractice from '../components/acid-base/KaKbPractice'
import WeakAcidPractice from '../components/acid-base/WeakAcidPractice'
import WeakBasePractice from '../components/acid-base/WeakBasePractice'
import SaltPhPractice from '../components/acid-base/SaltPhPractice'
import PolyproticPractice from '../components/acid-base/PolyproticPractice'

type Tab =
  // reference
  | 'ref-ph' | 'ref-ka-kb' | 'ref-weak-acid' | 'ref-weak-base' | 'ref-salt-ph' | 'ref-polyprotic'
  // practice
  | 'ph-calc' | 'ka-kb' | 'weak-acid' | 'weak-base' | 'salt-ph' | 'polyprotic'
  // problems
  | 'ph-problems' | 'ka-kb-problems' | 'weak-acid-problems' | 'weak-base-problems' | 'salt-ph-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'ref-ph-fund',
    label: 'pH Fundamentals',
    pills: [
      { id: 'ref-ph',     label: 'pH Calculator',  formula: 'pH=-log[H⁺]' },
      { id: 'ref-ka-kb',  label: 'Ka / Kb',        formula: 'Ka×Kb=Kw'    },
    ],
  },
  {
    id: 'ref-weak',
    label: 'Weak Acid / Base',
    pills: [
      { id: 'ref-weak-acid', label: 'Weak Acid pH', formula: 'Ka=x²/C' },
      { id: 'ref-weak-base', label: 'Weak Base pH', formula: 'Kb=x²/C' },
    ],
  },
  {
    id: 'ref-salts',
    label: 'Salts & Polyprotic',
    pills: [
      { id: 'ref-salt-ph',    label: 'Salt pH',          formula: 'hydrolysis' },
      { id: 'ref-polyprotic', label: 'Polyprotic Acids',  formula: 'Ka1≫Ka2'   },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'practice-ph-fund',
    label: 'pH Fundamentals',
    pills: [
      { id: 'ph-calc', label: 'pH Calculator', formula: 'pH'       },
      { id: 'ka-kb',   label: 'Ka / Kb',       formula: 'Ka↔Kb'   },
    ],
  },
  {
    id: 'practice-weak',
    label: 'Weak Acid / Base',
    pills: [
      { id: 'weak-acid', label: 'Weak Acid pH', formula: 'ICE'  },
      { id: 'weak-base', label: 'Weak Base pH', formula: 'ICE'  },
    ],
  },
  {
    id: 'practice-salts',
    label: 'Salts & Polyprotic',
    pills: [
      { id: 'salt-ph',    label: 'Salt pH',          formula: 'A⁻+H₂O' },
      { id: 'polyprotic', label: 'Polyprotic Acids',  formula: 'Ka1'     },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'problems-ph-fund',
    label: 'pH Fundamentals',
    pills: [
      { id: 'ph-problems',     label: 'pH Problems',  formula: 'pH'    },
      { id: 'ka-kb-problems',  label: 'Ka / Kb',      formula: 'Ka↔Kb' },
    ],
  },
  {
    id: 'problems-weak',
    label: 'Weak Acid / Base',
    pills: [
      { id: 'weak-acid-problems', label: 'Weak Acid', formula: 'ICE' },
      { id: 'weak-base-problems', label: 'Weak Base', formula: 'ICE' },
    ],
  },
  {
    id: 'problems-salts',
    label: 'Salts & Polyprotic',
    pills: [
      { id: 'salt-ph-problems', label: 'Salt pH', formula: 'hydrolysis' },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-ph':     'ph',  'ph-calc':   'ph',  'ph-problems':   'ph',
  'ref-ka-kb':  'kakb', 'ka-kb':    'kakb', 'ka-kb-problems': 'kakb',
  'ref-weak-acid': 'weakacid', 'weak-acid': 'weakacid', 'weak-acid-problems': 'weakacid',
  'ref-weak-base': 'weakbase', 'weak-base': 'weakbase', 'weak-base-problems': 'weakbase',
  'ref-salt-ph': 'saltph', 'salt-ph': 'saltph', 'salt-ph-problems': 'saltph',
  'ref-polyprotic': 'poly', 'polyprotic': 'poly',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  ph:       { reference: 'ref-ph',         practice: 'ph-calc',   problems: 'ph-problems'        },
  kakb:     { reference: 'ref-ka-kb',       practice: 'ka-kb',     problems: 'ka-kb-problems'     },
  weakacid: { reference: 'ref-weak-acid',   practice: 'weak-acid', problems: 'weak-acid-problems' },
  weakbase: { reference: 'ref-weak-base',   practice: 'weak-base', problems: 'weak-base-problems' },
  saltph:   { reference: 'ref-salt-ph',     practice: 'salt-ph',   problems: 'salt-ph-problems'   },
  poly:     { reference: 'ref-polyprotic',  practice: 'polyprotic' },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-ph',
  practice:  'ph-calc',
  problems:  'ph-problems',
}

export default function AcidBasePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-ph'

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
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Acids &amp; Bases</h2>
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
                  <motion.div layoutId="acid-base-mode-switch" className="absolute inset-0 rounded-full"
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
                          layoutId="acid-base-tab-pill"
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
        {/* Reference tabs */}
        {activeTab === 'ref-ph' && (
          <motion.div key="ref-ph"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PhCalculatorReference />
          </motion.div>
        )}
        {activeTab === 'ref-ka-kb' && (
          <motion.div key="ref-ka-kb"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KaKbReference />
          </motion.div>
        )}
        {activeTab === 'ref-weak-acid' && (
          <motion.div key="ref-weak-acid"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <WeakAcidReference />
          </motion.div>
        )}
        {activeTab === 'ref-weak-base' && (
          <motion.div key="ref-weak-base"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <WeakBaseReference />
          </motion.div>
        )}
        {activeTab === 'ref-salt-ph' && (
          <motion.div key="ref-salt-ph"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SaltPhReference />
          </motion.div>
        )}
        {activeTab === 'ref-polyprotic' && (
          <motion.div key="ref-polyprotic"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PolyproticReference />
          </motion.div>
        )}

        {/* Practice tabs */}
        {activeTab === 'ph-calc' && (
          <motion.div key="ph-calc"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PhCalculatorTool />
          </motion.div>
        )}
        {activeTab === 'ka-kb' && (
          <motion.div key="ka-kb"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KaKbTool />
          </motion.div>
        )}
        {activeTab === 'weak-acid' && (
          <motion.div key="weak-acid"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <WeakAcidTool />
          </motion.div>
        )}
        {activeTab === 'weak-base' && (
          <motion.div key="weak-base"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <WeakBaseTool />
          </motion.div>
        )}
        {activeTab === 'salt-ph' && (
          <motion.div key="salt-ph"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SaltPhTool />
          </motion.div>
        )}
        {activeTab === 'polyprotic' && (
          <motion.div key="polyprotic"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PolyproticPractice allowCustom={true} />
          </motion.div>
        )}

        {/* Problems tabs */}
        {activeTab === 'ph-problems' && (
          <motion.div key="ph-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PhCalculatorPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'ka-kb-problems' && (
          <motion.div key="ka-kb-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KaKbPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'weak-acid-problems' && (
          <motion.div key="weak-acid-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <WeakAcidPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'weak-base-problems' && (
          <motion.div key="weak-base-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <WeakBasePractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'salt-ph-problems' && (
          <motion.div key="salt-ph-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SaltPhPractice allowCustom={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation modal */}
      {showExplanation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowExplanation(false)}
        >
          <div
            className="max-w-lg w-full p-6 rounded-sm border border-border flex flex-col gap-3"
            style={{ background: 'rgb(var(--color-raised))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-semibold text-bright">Acids &amp; Bases</h3>
              <button onClick={() => setShowExplanation(false)} className="font-mono text-secondary hover:text-primary text-lg">✕</button>
            </div>
            <p className="font-sans text-sm text-primary leading-relaxed">
              Acids and bases are among the most-tested topics in Chem 102. This page covers pH
              calculations for strong and weak acids/bases, Ka/Kb relationships, and salt hydrolysis.
              The weak acid and weak base tools use the ICE table method internally. See the Reference
              tab for formulas and worked examples.
            </p>
          </div>
        </div>
      )}
    </PageShell>
  )
}

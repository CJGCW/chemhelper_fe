import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import NuclearDecayReference from '../components/nuclear/NuclearDecayReference'
import NuclearDecayTool from '../components/nuclear/NuclearDecayTool'
import NuclearDecayPractice from '../components/nuclear/NuclearDecayPractice'
import HalfLifeReference from '../components/nuclear/HalfLifeReference'
import HalfLifeTool from '../components/nuclear/HalfLifeTool'
import HalfLifePractice from '../components/nuclear/HalfLifePractice'
import BindingEnergyReference from '../components/nuclear/BindingEnergyReference'
import BindingEnergyTool from '../components/nuclear/BindingEnergyTool'
import BindingEnergyPractice from '../components/nuclear/BindingEnergyPractice'
import DatingReference from '../components/nuclear/DatingReference'
import DatingTool from '../components/nuclear/DatingTool'
import DatingPractice from '../components/nuclear/DatingPractice'
import PageShell from '../components/Layout/PageShell'

type Tab =
  // reference
  | 'ref-decay' | 'ref-nuclear-hl' | 'ref-binding' | 'ref-dating'
  // practice
  | 'decay' | 'nuclear-half-life' | 'binding' | 'dating'
  // problems
  | 'decay-problems' | 'nuclear-hl-problems' | 'binding-problems' | 'dating-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'rg1',
    label: 'Nuclear Reactions',
    pills: [
      { id: 'ref-decay',      label: 'Nuclear Decay', formula: 'α,β,γ' },
      { id: 'ref-nuclear-hl', label: 'Half-Life',      formula: 't½'    },
    ],
  },
  {
    id: 'rg2',
    label: 'Applications',
    pills: [
      { id: 'ref-binding', label: 'Binding Energy',    formula: 'Δm×c²' },
      { id: 'ref-dating',  label: 'Radiometric Dating', formula: '¹⁴C'  },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Nuclear Reactions',
    pills: [
      { id: 'decay',            label: 'Decay Equations', formula: 'α,β,γ' },
      { id: 'nuclear-half-life', label: 'Half-Life',       formula: 't½'    },
    ],
  },
  {
    id: 'pg2',
    label: 'Applications',
    pills: [
      { id: 'binding', label: 'Binding Energy',    formula: 'MeV'  },
      { id: 'dating',  label: 'Radiometric Dating', formula: '¹⁴C' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Nuclear Reactions',
    pills: [
      { id: 'decay-problems',      label: 'Decay Equations', formula: 'α,β,γ' },
      { id: 'nuclear-hl-problems', label: 'Half-Life',        formula: 't½'    },
    ],
  },
  {
    id: 'pg2',
    label: 'Applications',
    pills: [
      { id: 'binding-problems', label: 'Binding Energy',    formula: 'MeV'  },
      { id: 'dating-problems',  label: 'Radiometric Dating', formula: '¹⁴C' },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-decay':        'nuclear-decay',     'decay':            'nuclear-decay',     'decay-problems':      'nuclear-decay',
  'ref-nuclear-hl':   'nuclear-half-life', 'nuclear-half-life': 'nuclear-half-life', 'nuclear-hl-problems': 'nuclear-half-life',
  'ref-binding':      'binding-energy',   'binding':          'binding-energy',    'binding-problems':    'binding-energy',
  'ref-dating':       'nuclear-dating',   'dating':           'nuclear-dating',    'dating-problems':     'nuclear-dating',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'nuclear-decay':     { reference: 'ref-decay',       practice: 'decay',            problems: 'decay-problems'      },
  'nuclear-half-life': { reference: 'ref-nuclear-hl',  practice: 'nuclear-half-life', problems: 'nuclear-hl-problems' },
  'binding-energy':    { reference: 'ref-binding',     practice: 'binding',           problems: 'binding-problems'    },
  'nuclear-dating':    { reference: 'ref-dating',      practice: 'dating',            problems: 'dating-problems'     },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-decay',
  practice:  'decay',
  problems:  'decay-problems',
}

const PAGE_EXPLANATION: ExplanationContent = {
  title: 'Nuclear Chemistry',
  formula: 'α, β, γ · t½ · BE/A · ¹⁴C',
  formulaVars: [
    { symbol: 'α', meaning: 'Alpha decay',           unit: '⁴₂He emitted'    },
    { symbol: 'β', meaning: 'Beta decay',            unit: 'e⁻ or e⁺ emitted' },
    { symbol: 't½', meaning: 'Half-life',            unit: 'N = N₀ (1/2)^(t/t½)' },
    { symbol: 'BE/A', meaning: 'Binding energy per nucleon', unit: 'MeV/nucleon' },
  ],
  description:
    'Nuclear Chemistry covers radioactive decay, half-life calculations, nuclear binding energy, and radiometric dating. ' +
    'These topics appear in the final chapter of most Gen Chem 102 courses. ' +
    'Start with the Reference tab to review decay types and formulas.',
}

export default function NuclearPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-decay'

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
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Nuclear Chemistry</h2>
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
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {isActive && (
                  <motion.div layoutId="nuclear-mode-switch" className="absolute inset-0 rounded-full"
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
                          layoutId="nuclear-tab-pill"
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
        {activeTab === 'ref-decay' && (
          <motion.div key="ref-decay"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NuclearDecayReference />
          </motion.div>
        )}
        {activeTab === 'ref-nuclear-hl' && (
          <motion.div key="ref-nuclear-hl"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HalfLifeReference />
          </motion.div>
        )}
        {activeTab === 'ref-binding' && (
          <motion.div key="ref-binding"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <BindingEnergyReference />
          </motion.div>
        )}
        {activeTab === 'ref-dating' && (
          <motion.div key="ref-dating"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DatingReference />
          </motion.div>
        )}
        {activeTab === 'decay' && (
          <motion.div key="decay"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NuclearDecayTool />
          </motion.div>
        )}
        {activeTab === 'nuclear-half-life' && (
          <motion.div key="nuclear-half-life"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HalfLifeTool />
          </motion.div>
        )}
        {activeTab === 'binding' && (
          <motion.div key="binding"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <BindingEnergyTool />
          </motion.div>
        )}
        {activeTab === 'dating' && (
          <motion.div key="dating"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DatingTool />
          </motion.div>
        )}
        {activeTab === 'decay-problems' && (
          <motion.div key="decay-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NuclearDecayPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'nuclear-hl-problems' && (
          <motion.div key="nuclear-hl-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HalfLifePractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'binding-problems' && (
          <motion.div key="binding-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <BindingEnergyPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'dating-problems' && (
          <motion.div key="dating-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DatingPractice allowCustom={false} />
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

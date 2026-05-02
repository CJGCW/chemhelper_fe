import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import HydrocarbonReference from '../components/organic/HydrocarbonReference'
import HydrocarbonPractice from '../components/organic/HydrocarbonPractice'
import IsomerReference from '../components/organic/IsomerReference'
import IsomerPractice from '../components/organic/IsomerPractice'
import OrganicNamingReference from '../components/organic/OrganicNamingReference'
import OrganicNamingTool from '../components/organic/OrganicNamingTool'
import OrganicNamingPractice from '../components/organic/OrganicNamingPractice'
import FunctionalGroupReference from '../components/organic/FunctionalGroupReference'
import FunctionalGroupPractice from '../components/organic/FunctionalGroupPractice'
import OrganicReactionReference from '../components/organic/OrganicReactionReference'
import OrganicReactionPractice from '../components/organic/OrganicReactionPractice'
import PageShell from '../components/Layout/PageShell'

type Tab =
  // reference
  | 'ref-hydrocarbons' | 'ref-isomers' | 'ref-organic-naming' | 'ref-func-groups' | 'ref-organic-rxn'
  // practice
  | 'hydrocarbons' | 'isomers' | 'organic-naming' | 'func-groups' | 'organic-rxn'
  // problems
  | 'hydrocarbons-problems' | 'isomers-problems' | 'naming-problems' | 'func-groups-problems' | 'organic-rxn-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'rg1',
    label: 'Hydrocarbons',
    pills: [
      { id: 'ref-hydrocarbons',  label: 'Hydrocarbons', formula: 'CₙH'  },
      { id: 'ref-isomers',       label: 'Isomers',       formula: 'C₄H₁₀' },
      { id: 'ref-organic-naming', label: 'IUPAC Naming', formula: 'IUPAC' },
    ],
  },
  {
    id: 'rg2',
    label: 'Functional Groups',
    pills: [
      { id: 'ref-func-groups', label: 'Functional Groups', formula: 'R-OH' },
      { id: 'ref-organic-rxn', label: 'Common Reactions',  formula: 'rxn'  },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Hydrocarbons',
    pills: [
      { id: 'hydrocarbons',   label: 'Classify Hydrocarbons', formula: 'CₙH'  },
      { id: 'isomers',        label: 'Isomers',                formula: '≡'    },
      { id: 'organic-naming', label: 'IUPAC Naming',           formula: 'IUPAC'},
    ],
  },
  {
    id: 'pg2',
    label: 'Functional Groups',
    pills: [
      { id: 'func-groups', label: 'Functional Groups', formula: 'R-OH' },
      { id: 'organic-rxn', label: 'Reactions',          formula: 'rxn'  },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Hydrocarbons',
    pills: [
      { id: 'hydrocarbons-problems', label: 'Classify Hydrocarbons', formula: 'CₙH'  },
      { id: 'isomers-problems',      label: 'Isomers',                formula: '≡'    },
      { id: 'naming-problems',       label: 'IUPAC Naming',           formula: 'IUPAC'},
    ],
  },
  {
    id: 'pg2',
    label: 'Functional Groups',
    pills: [
      { id: 'func-groups-problems', label: 'Functional Groups', formula: 'R-OH' },
      { id: 'organic-rxn-problems', label: 'Reactions',          formula: 'rxn'  },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-hydrocarbons':   'alkanes-alkenes', 'hydrocarbons':   'alkanes-alkenes', 'hydrocarbons-problems': 'alkanes-alkenes',
  'ref-isomers':        'isomers',         'isomers':        'isomers',         'isomers-problems':      'isomers',
  'ref-organic-naming': 'organic-naming',  'organic-naming': 'organic-naming',  'naming-problems':       'organic-naming',
  'ref-func-groups':    'functional-group-id', 'func-groups': 'functional-group-id', 'func-groups-problems': 'functional-group-id',
  'ref-organic-rxn':    'organic-reactions',   'organic-rxn': 'organic-reactions',   'organic-rxn-problems': 'organic-reactions',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'alkanes-alkenes':     { reference: 'ref-hydrocarbons',   practice: 'hydrocarbons',   problems: 'hydrocarbons-problems' },
  'isomers':             { reference: 'ref-isomers',        practice: 'isomers',        problems: 'isomers-problems'      },
  'organic-naming':      { reference: 'ref-organic-naming', practice: 'organic-naming', problems: 'naming-problems'       },
  'functional-group-id': { reference: 'ref-func-groups',    practice: 'func-groups',    problems: 'func-groups-problems'  },
  'organic-reactions':   { reference: 'ref-organic-rxn',    practice: 'organic-rxn',    problems: 'organic-rxn-problems'  },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-hydrocarbons',
  practice:  'hydrocarbons',
  problems:  'hydrocarbons-problems',
}

const PAGE_EXPLANATION: ExplanationContent = {
  title: 'Organic Chemistry',
  formula: 'CₙH · IUPAC · R-OH · rxn',
  formulaVars: [
    { symbol: 'alkane', meaning: 'CₙH₂ₙ₊₂, all single bonds', unit: 'sp³' },
    { symbol: 'alkene', meaning: 'CₙH₂ₙ, one C=C double bond', unit: 'sp²' },
    { symbol: 'alkyne', meaning: 'CₙH₂ₙ₋₂, one C≡C triple bond', unit: 'sp' },
    { symbol: 'R-OH', meaning: 'Alcohol functional group', unit: '-ol suffix' },
  ],
  description:
    'Organic Chemistry introduces hydrocarbons, functional groups, and IUPAC naming. ' +
    'These topics appear in the final chapter of most Gen Chem courses. ' +
    'Start with the Reference tab to review the hydrocarbon families and functional group patterns.',
}

export default function OrganicPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-hydrocarbons'

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
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Organic Chemistry</h2>
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
                  <motion.div layoutId="organic-mode-switch" className="absolute inset-0 rounded-full"
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
                          layoutId="organic-tab-pill"
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
        {activeTab === 'ref-hydrocarbons' && (
          <motion.div key="ref-hydrocarbons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrocarbonReference />
          </motion.div>
        )}
        {activeTab === 'ref-isomers' && (
          <motion.div key="ref-isomers"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IsomerReference />
          </motion.div>
        )}
        {activeTab === 'ref-organic-naming' && (
          <motion.div key="ref-organic-naming"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicNamingReference />
          </motion.div>
        )}
        {activeTab === 'ref-func-groups' && (
          <motion.div key="ref-func-groups"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupReference />
          </motion.div>
        )}
        {activeTab === 'ref-organic-rxn' && (
          <motion.div key="ref-organic-rxn"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicReactionReference />
          </motion.div>
        )}
        {activeTab === 'hydrocarbons' && (
          <motion.div key="hydrocarbons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrocarbonPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'isomers' && (
          <motion.div key="isomers"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IsomerPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'organic-naming' && (
          <motion.div key="organic-naming"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicNamingTool />
          </motion.div>
        )}
        {activeTab === 'func-groups' && (
          <motion.div key="func-groups"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'organic-rxn' && (
          <motion.div key="organic-rxn"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicReactionPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'hydrocarbons-problems' && (
          <motion.div key="hydrocarbons-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrocarbonPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'isomers-problems' && (
          <motion.div key="isomers-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IsomerPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'naming-problems' && (
          <motion.div key="naming-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicNamingPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'func-groups-problems' && (
          <motion.div key="func-groups-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'organic-rxn-problems' && (
          <motion.div key="organic-rxn-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicReactionPractice allowCustom={false} />
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

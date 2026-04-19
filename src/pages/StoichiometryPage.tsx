import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import StoichiometrySolver from '../components/stoichiometry/StoichiometrySolver'
import LimitingReagentSolver from '../components/stoichiometry/LimitingReagentSolver'
import TheoreticalYieldSolver from '../components/stoichiometry/TheoreticalYieldSolver'
import PercentYieldSolver from '../components/stoichiometry/PercentYieldSolver'
import StoichiometryPractice from '../components/stoichiometry/StoichiometryPractice'
import GasStoichPractice from '../components/stoichiometry/GasStoichPractice'
import BalancingPractice from '../components/stoichiometry/BalancingPractice'
import StoichReference, { type RefTopic } from '../components/stoichiometry/StoichReference'
import SolutionStoichSolver from '../components/stoichiometry/SolutionStoichSolver'
import SolutionStoichPractice from '../components/stoichiometry/SolutionStoichPractice'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'

type Tab =
  | 'stoich' | 'limiting' | 'theoretical' | 'percent'
  | 'practice' | 'balance' | 'reference' | 'visual'
  | 'gas-stoich' | 'solution'
  | 'solution-practice' | 'balance-practice' | 'gas-stoich-practice'
  | 'limiting-problems' | 'theoretical-problems' | 'percent-problems'
  | 'ref-stoich' | 'ref-limiting' | 'ref-theoretical' | 'ref-percent'
  | 'ref-balance' | 'ref-solution' | 'ref-gas-stoich'

type Mode = 'reference' | 'practice' | 'problems'
type RefView = 'guide' | 'visual'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'stoich-ref',
    label: 'Stoichiometry',
    pills: [
      { id: 'ref-stoich',      label: 'Stoichiometry',     formula: 'g↔mol' },
      { id: 'ref-limiting',    label: 'Limiting Reagent',  formula: 'LR'    },
      { id: 'ref-theoretical', label: 'Theoretical Yield', formula: 'T.Y.'  },
      { id: 'ref-percent',     label: 'Percent Yield',     formula: '%Y'    },
    ],
  },
  {
    id: 'advanced-ref',
    label: 'Advanced',
    pills: [
      { id: 'ref-balance',    label: 'Balancing',         formula: '_□_' },
      { id: 'ref-solution',   label: 'Solution Stoich',   formula: 'M·V' },
      { id: 'ref-gas-stoich', label: 'Gas Stoichiometry', formula: 'PV'  },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'stoich',
    label: 'Stoichiometry',
    pills: [
      { id: 'stoich',      label: 'Stoichiometry',     formula: 'g ↔ mol' },
      { id: 'limiting',    label: 'Limiting Reagent',  formula: 'LR'      },
      { id: 'theoretical', label: 'Theoretical Yield', formula: 'T.Y.'    },
      { id: 'percent',     label: 'Percent Yield',     formula: '%Y'      },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    pills: [
      { id: 'solution',            label: 'Solution Stoich', formula: 'M·V' },
      { id: 'gas-stoich-practice', label: 'Gas Stoich',      formula: 'PV'  },
      { id: 'balance-practice',    label: 'Balance',         formula: '_□_' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'stoich',
    label: 'Stoichiometry',
    pills: [
      { id: 'practice',             label: 'Stoichiometry',     formula: '✎'    },
      { id: 'limiting-problems',    label: 'Limiting Reagent',  formula: 'LR'   },
      { id: 'theoretical-problems', label: 'Theoretical Yield', formula: 'T.Y.' },
      { id: 'percent-problems',     label: 'Percent Yield',     formula: '%Y'   },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    pills: [
      { id: 'solution-practice', label: 'Solution Stoich', formula: 'M·V' },
      { id: 'gas-stoich',        label: 'Gas Stoich',      formula: 'PV'  },
      { id: 'balance',           label: 'Balance',         formula: '_□_' },
    ],
  },
]

const REFERENCE_TAB_IDS = new Set<Tab>(REFERENCE_GROUPS.flatMap(g => g.pills.map(p => p.id)))
const PRACTICE_TAB_IDS  = new Set<Tab>(PRACTICE_GROUPS.flatMap(g => g.pills.map(p => p.id)))
const PROBLEMS_TAB_IDS  = new Set<Tab>(PROBLEMS_GROUPS.flatMap(g => g.pills.map(p => p.id)))

const REF_TOPIC_MAP: Partial<Record<Tab, RefTopic>> = {
  'ref-stoich':      'stoich',
  'ref-limiting':    'limiting',
  'ref-theoretical': 'theoretical',
  'ref-percent':     'percent',
  'ref-balance':     'balance',
  'ref-solution':    'solution',
  'ref-gas-stoich':  'gas-stoich',
}

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'stoich':               'stoich',
  'practice':             'stoich',
  'ref-stoich':           'stoich',
  'solution':             'solution',
  'solution-practice':    'solution',
  'ref-solution':         'solution',
  'limiting':             'limiting',
  'limiting-problems':    'limiting',
  'ref-limiting':         'limiting',
  'theoretical':          'theoretical',
  'theoretical-problems': 'theoretical',
  'ref-theoretical':      'theoretical',
  'percent':              'percent',
  'percent-problems':     'percent',
  'ref-percent':          'percent',
  'balance':              'balance',
  'balance-practice':     'balance',
  'ref-balance':          'balance',
  'gas-stoich':           'gas-stoich',
  'gas-stoich-practice':  'gas-stoich',
  'ref-gas-stoich':       'gas-stoich',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'stoich':      { reference: 'ref-stoich',      practice: 'stoich',              problems: 'practice'             },
  'solution':    { reference: 'ref-solution',    practice: 'solution',             problems: 'solution-practice'    },
  'limiting':    { reference: 'ref-limiting',    practice: 'limiting',             problems: 'limiting-problems'    },
  'theoretical': { reference: 'ref-theoretical', practice: 'theoretical',          problems: 'theoretical-problems' },
  'percent':     { reference: 'ref-percent',     practice: 'percent',              problems: 'percent-problems'     },
  'balance':     { reference: 'ref-balance',     practice: 'balance-practice',     problems: 'balance'              },
  'gas-stoich':  { reference: 'ref-gas-stoich',  practice: 'gas-stoich-practice',  problems: 'gas-stoich'           },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-stoich',
  practice:  'stoich',
  problems:  'practice',
}

const EXPLANATIONS: Partial<Record<Tab, ExplanationContent>> = {
  stoich: {
    title: 'Stoichiometric Conversion',
    formula: 'g → mol → mol → g',
    formulaVars: [
      { symbol: 'M',     meaning: 'Molar mass',                              unit: 'g/mol'          },
      { symbol: 'n',     meaning: 'Moles',                                   unit: 'mol'            },
      { symbol: 'ratio', meaning: 'Mole ratio from balanced equation',        unit: 'mol A / mol B'  },
    ],
    description:
      'Stoichiometry uses the mole ratios from a balanced equation to convert between reactant and product amounts. ' +
      'The pathway is: convert grams to moles (÷ molar mass), apply the mole ratio, then convert back to grams (× molar mass).',
    example: {
      scenario: 'How many grams of H₂O form from 4.00 g of H₂?  (2H₂ + O₂ → 2H₂O)',
      steps: [
        'n(H₂) = 4.00 g ÷ 2.016 g/mol = 1.98 mol',
        'Mole ratio H₂O : H₂ = 2 : 2 = 1 : 1',
        'n(H₂O) = 1.98 mol',
        'm(H₂O) = 1.98 mol × 18.015 g/mol = 35.7 g',
      ],
      result: '35.7 g H₂O',
    },
  },
  limiting: {
    title: 'Limiting Reagent',
    formula: 'LR = reactant producing least product',
    formulaVars: [
      { symbol: 'n_A, n_B', meaning: 'Moles of each reactant',                        unit: 'mol' },
      { symbol: 'coeff',    meaning: 'Stoichiometric coefficient (balanced equation)', unit: '—'   },
    ],
    description:
      'The limiting reagent is the reactant that runs out first and caps the amount of product. ' +
      'Divide the moles of each reactant by its coefficient; the smallest quotient identifies the limiting reagent.',
    example: {
      scenario: '4.00 g H₂ and 32.0 g O₂ react: 2H₂ + O₂ → 2H₂O. Which is limiting?',
      steps: [
        'n(H₂) = 4.00 / 2.016 = 1.98 mol  →  1.98 / 2 = 0.992',
        'n(O₂) = 32.0 / 32.00 = 1.00 mol  →  1.00 / 1 = 1.00',
        'H₂ gives the smaller quotient (0.992)',
      ],
      result: 'H₂ is the limiting reagent',
    },
  },
  theoretical: {
    title: 'Theoretical Yield',
    formula: 'T.Y. = mol(LR) × ratio × M(product)',
    formulaVars: [
      { symbol: 'mol(LR)', meaning: 'Moles of limiting reagent',              unit: 'mol'   },
      { symbol: 'ratio',   meaning: 'Mole ratio: product / limiting reagent', unit: '—'     },
      { symbol: 'M',       meaning: 'Molar mass of product',                  unit: 'g/mol' },
    ],
    description:
      'The theoretical yield is the maximum mass of product obtainable from the limiting reagent, ' +
      'assuming complete reaction with no losses. It is always the ideal upper bound — actual yields are lower.',
    example: {
      scenario: '1.98 mol H₂ is limiting in 2H₂ + O₂ → 2H₂O  (M(H₂O) = 18.015 g/mol).',
      steps: [
        'Mole ratio H₂O : H₂ = 2 : 2 = 1',
        'n(H₂O) = 1.98 mol × 1 = 1.98 mol',
        'T.Y. = 1.98 mol × 18.015 g/mol',
      ],
      result: 'T.Y. = 35.7 g H₂O',
    },
  },
  percent: {
    title: 'Percent Yield',
    formula: '%Y = (actual / theoretical) × 100',
    formulaVars: [
      { symbol: 'actual',      meaning: 'Mass of product actually obtained', unit: 'g' },
      { symbol: 'theoretical', meaning: 'Maximum possible mass of product',  unit: 'g' },
    ],
    description:
      'Percent yield measures reaction efficiency. Values below 100% are normal — losses come from incomplete reactions, side reactions, or product lost during isolation. ' +
      'A value above 100% signals experimental error such as impurities in the collected product.',
    example: {
      scenario: 'Theoretical yield is 35.7 g H₂O. The experiment collects 29.3 g.',
      steps: [
        '%Y = (actual / theoretical) × 100',
        '%Y = (29.3 / 35.7) × 100',
      ],
      result: '%Y = 82.1%',
    },
  },
}

export default function StoichiometryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const [openGroups, setOpenGroups]       = useState(() => new Set<string>())
  const [refOpenGroups, setRefOpenGroups] = useState(() => new Set<string>(['stoich-ref']))
  const [refView, setRefView]             = useState<RefView>('guide')
  const [printingAll, setPrintingAll]     = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-stoich'

  const activeMode: Mode =
    REFERENCE_TAB_IDS.has(activeTab) || activeTab === 'visual' || activeTab === 'reference' ? 'reference'
    : PROBLEMS_TAB_IDS.has(activeTab) ? 'problems'
    : PRACTICE_TAB_IDS.has(activeTab) ? 'practice'
    : 'reference'

  const activeGroups = activeMode === 'problems' ? PROBLEMS_GROUPS : PRACTICE_GROUPS

  useEffect(() => {
    if (activeMode === 'reference') {
      const group = REFERENCE_GROUPS.find(g => g.pills.some(p => p.id === activeTab))
      if (group) {
        setRefOpenGroups(prev => {
          if (prev.has(group.id)) return prev
          const next = new Set(prev)
          next.add(group.id)
          return next
        })
      }
    } else {
      const group = activeGroups.find(g => g.pills.some(p => p.id === activeTab))
      if (group) {
        setOpenGroups(prev => {
          if (prev.has(group.id)) return prev
          const next = new Set(prev)
          next.add(group.id)
          return next
        })
      }
    }
  }, [activeTab, activeMode])

  useEffect(() => {
    if (!printingAll) return
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => { window.print() })
    )
    const handler = () => setPrintingAll(false)
    window.addEventListener('afterprint', handler)
    return () => {
      window.removeEventListener('afterprint', handler)
      cancelAnimationFrame(id)
    }
  }, [printingAll])

  function toggleGroup(id: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleRefGroup(id: string) {
    setRefOpenGroups(prev => {
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

  function renderGroups(groups: TabGroup[], openSet: Set<string>, toggle: (id: string) => void, layoutPrefix: string) {
    return (
      <div className="flex flex-col gap-1.5">
        {groups.map(group => {
          const isOpen = openSet.has(group.id)
          const groupActive = group.pills.some(p => p.id === activeTab)
          return (
            <div key={group.id} className="flex flex-col gap-1">
              <button
                onClick={() => toggle(group.id)}
                className="relative flex items-center self-start px-3 py-1.5 rounded-sm font-sans text-xs font-semibold transition-colors"
                style={{ color: groupActive ? 'var(--c-halogen)' : isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
              >
                {groupActive ? (
                  <motion.div
                    layoutId={`${layoutPrefix}-group-bg-${group.id}`}
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
                                layoutId={`${layoutPrefix}-pill-bg`}
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
    )
  }

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Print All: render outside AnimatePresence so print fires after mount */}
      {printingAll && (
        <div className="hidden print:block">
          <StoichReference section="guide" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Stoichiometry</h2>
          {activeMode === 'reference' && REFERENCE_TAB_IDS.has(activeTab) && (
            <>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                           text-secondary hover:text-primary hover:border-muted transition-colors"
              >
                <span>⎙</span>
                <span>Print</span>
              </button>
              <button
                onClick={() => setPrintingAll(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                           text-secondary hover:text-primary hover:border-muted transition-colors"
              >
                <span>⎙</span>
                <span>Print All</span>
              </button>
            </>
          )}
          {EXPLANATIONS[activeTab] && (
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                         font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span className="font-mono">?</span>
              <span>What is this</span>
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
                  <motion.div layoutId="stoich-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Tab pills / groups for active mode */}
        {activeMode === 'reference' ? (
          <div className="flex flex-col gap-3 print:hidden">
            {renderGroups(REFERENCE_GROUPS, refOpenGroups, toggleRefGroup, 'ref')}

            {/* Visual | Guide secondary toggle */}
            <div className="flex items-center gap-1 p-1 rounded-sm self-start"
              style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
              {(['guide', 'visual'] as RefView[]).map(v => {
                const isActive = refView === v
                return (
                  <button key={v} onClick={() => setRefView(v)}
                    className="relative px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
                    style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                    {isActive && (
                      <motion.div layoutId="stoich-refview-pill" className="absolute inset-0 rounded-sm"
                        style={{
                          background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                          border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                    )}
                    <span className="relative z-10">{v}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="print:hidden">
            {renderGroups(activeGroups, openGroups, toggleGroup, 'stoich')}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeMode === 'reference' && REFERENCE_TAB_IDS.has(activeTab) && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichReference section={refView} topic={REF_TOPIC_MAP[activeTab]} />
          </motion.div>
        )}
        {activeTab === 'stoich' && (
          <motion.div key="stoich"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichiometrySolver />
          </motion.div>
        )}
        {activeTab === 'limiting' && (
          <motion.div key="limiting"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LimitingReagentSolver />
          </motion.div>
        )}
        {activeTab === 'theoretical' && (
          <motion.div key="theoretical"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <TheoreticalYieldSolver />
          </motion.div>
        )}
        {activeTab === 'percent' && (
          <motion.div key="percent"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PercentYieldSolver />
          </motion.div>
        )}
        {activeTab === 'practice' && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichiometryPractice />
          </motion.div>
        )}
        {activeTab === 'solution' && (
          <motion.div key="solution"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolutionStoichSolver />
          </motion.div>
        )}
        {(activeTab === 'balance' || activeTab === 'balance-practice') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <BalancingPractice />
          </motion.div>
        )}
        {(activeTab === 'gas-stoich' || activeTab === 'gas-stoich-practice') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasStoichPractice />
          </motion.div>
        )}
        {activeTab === 'limiting-problems' && (
          <motion.div key="limiting-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LimitingReagentSolver />
          </motion.div>
        )}
        {activeTab === 'theoretical-problems' && (
          <motion.div key="theoretical-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <TheoreticalYieldSolver />
          </motion.div>
        )}
        {activeTab === 'percent-problems' && (
          <motion.div key="percent-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PercentYieldSolver />
          </motion.div>
        )}
        {activeTab === 'solution-practice' && (
          <motion.div key="solution-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolutionStoichPractice />
          </motion.div>
        )}
      </AnimatePresence>

      {EXPLANATIONS[activeTab] && (
        <ExplanationModal
          content={EXPLANATIONS[activeTab]!}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

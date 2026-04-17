import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import StoichiometrySolver from '../components/stoichiometry/StoichiometrySolver'
import LimitingReagentSolver from '../components/stoichiometry/LimitingReagentSolver'
import TheoreticalYieldSolver from '../components/stoichiometry/TheoreticalYieldSolver'
import PercentYieldSolver from '../components/stoichiometry/PercentYieldSolver'
import StoichiometryPractice from '../components/stoichiometry/StoichiometryPractice'
import GasStoichPractice from '../components/stoichiometry/GasStoichPractice'
import BalancingPractice from '../components/stoichiometry/BalancingPractice'
import StoichReference from '../components/stoichiometry/StoichReference'
import SolutionStoichSolver from '../components/stoichiometry/SolutionStoichSolver'
import SolutionStoichPractice from '../components/stoichiometry/SolutionStoichPractice'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'

type Tab = 'stoich' | 'limiting' | 'theoretical' | 'percent' | 'practice' | 'balance' | 'reference' | 'visual' | 'gas-stoich' | 'solution' | 'solution-practice'
type Mode = 'reference' | 'practice' | 'problems'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'visual',    label: 'Visual', formula: '◈' },
  { id: 'reference', label: 'Guide',  formula: '≡' },
]

const PRACTICE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'stoich',      label: 'Stoichiometry',     formula: 'g ↔ mol' },
  { id: 'limiting',    label: 'Limiting Reagent',  formula: 'LR'      },
  { id: 'theoretical', label: 'Theoretical Yield', formula: 'T.Y.'    },
  { id: 'percent',     label: 'Percent Yield',     formula: '%Y'      },
  { id: 'solution',    label: 'Solution Stoich',   formula: 'M·V'     },
]

const PROBLEMS_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'practice',          label: 'Stoichiometry',   formula: '✎'  },
  { id: 'balance',           label: 'Balance',         formula: '_□_' },
  { id: 'solution-practice', label: 'Solution Stoich', formula: 'M·V' },
  { id: 'gas-stoich',        label: 'Gas Stoich',      formula: 'PV' },
]

const PRACTICE_TAB_IDS  = new Set<Tab>(PRACTICE_TABS.map(t => t.id))
const PROBLEMS_TAB_IDS  = new Set<Tab>(PROBLEMS_TABS.map(t => t.id))

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
  const activeTab = (searchParams.get('tab') as Tab) ?? 'stoich'

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
    if (mode === 'practice') setTab('stoich')
    else if (mode === 'problems') setTab('practice')
    else setTab('visual')
  }

  const visibleTabs = activeMode === 'problems' ? PROBLEMS_TABS
    : activeMode === 'practice' ? PRACTICE_TABS
    : REFERENCE_TABS

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Stoichiometry</h2>
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

        <h2 className="hidden print:block font-sans font-semibold text-black text-xl">Stoichiometry — Reference</h2>

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

        {/* Tab pills for active mode */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {visibleTabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                {isActive && (
                  <motion.div layoutId="stoich-tab-pill" className="absolute inset-0 rounded-sm"
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
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
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
        {activeTab === 'visual' && (
          <motion.div key="visual"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichReference section="visual" />
          </motion.div>
        )}
        {activeTab === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StoichReference section="guide" />
          </motion.div>
        )}
        {activeTab === 'gas-stoich' && (
          <motion.div key="gas-stoich"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasStoichPractice />
          </motion.div>
        )}
        {activeTab === 'solution' && (
          <motion.div key="solution"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolutionStoichSolver />
          </motion.div>
        )}
        {activeTab === 'balance' && (
          <motion.div key="balance"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <BalancingPractice />
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

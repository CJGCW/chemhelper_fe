import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import MechanismCard from '../components/mechanisms/MechanismCard'
import PredictProductPractice from '../components/mechanisms/PredictProductPractice'
import IdentifyMechanismPractice from '../components/mechanisms/IdentifyMechanismPractice'
import PredictRegioStereoPractice from '../components/mechanisms/PredictRegioStereoPractice'
import IdentifyReagentPractice from '../components/mechanisms/IdentifyReagentPractice'
import MechanismStepwise from '../components/mechanisms/MechanismStepwise'
import QuickQuiz from '../components/mechanisms/QuickQuiz'
import ExamSimulation from '../components/mechanisms/ExamSimulation'
import PageShell from '../components/Layout/PageShell'
import {
  ALL_REACTIONS,
  filterReactions,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getCategoryCounts,
  TOTAL_REACTION_COUNT,
} from '../data/mechanisms/index'
import type { MechanismCategory } from '../data/mechanisms/types'

type Mode = 'reference' | 'practice' | 'problems'

type PracticeTab = 'predict-product' | 'identify-mechanism' | 'regio-stereo' | 'identify-reagent' | 'stepwise'
type ProblemsTab = 'quick-quiz' | 'exam-sim' | 'custom-test'

const PAGE_EXPLANATION: ExplanationContent = {
  title: 'Reaction Mechanisms',
  formula: 'SN1 · SN2 · E1 · E2 · EAS · Diels-Alder',
  formulaVars: [
    { symbol: 'arrow pushing', meaning: 'Curved arrows show electron pair movement', unit: 'core skill' },
    { symbol: 'SN/E',   meaning: 'Substitution & elimination at sp³ carbon',   unit: 'Org Chem 1' },
    { symbol: 'EAS',    meaning: 'Electrophilic aromatic substitution',         unit: 'Org Chem 2' },
    { symbol: 'carbonyl', meaning: 'Nucleophilic addition/acyl substitution',  unit: 'Org Chem 2' },
  ],
  description:
    'Reaction mechanisms describe the step-by-step bond-breaking and bond-forming events of a chemical reaction. ' +
    'Mastering arrow-pushing is the central skill of organic chemistry — every mechanism is a sequence of curved arrows. ' +
    'Use the Reference cards to study each mechanism, then use Practice to test your recognition skills.',
}

const PRACTICE_TABS: { id: PracticeTab; label: string }[] = [
  { id: 'predict-product',    label: 'Predict Product'    },
  { id: 'identify-mechanism', label: 'Identify Mechanism' },
  { id: 'regio-stereo',       label: 'Regio / Stereo'     },
  { id: 'identify-reagent',   label: 'Identify Reagent'   },
  { id: 'stepwise',           label: 'Stepwise Order'     },
]

const PROBLEMS_TABS: { id: ProblemsTab; label: string }[] = [
  { id: 'quick-quiz', label: 'Quick Quiz (10 Q)' },
  { id: 'exam-sim',   label: 'Exam Simulation'   },
  { id: 'custom-test', label: 'Custom Test'      },
]

export default function MechanismsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [practiceTab, setPracticeTab] = useState<PracticeTab>('predict-product')
  const [problemsTab, setProblemsTab] = useState<ProblemsTab>('quick-quiz')

  const mode = (searchParams.get('mode') ?? 'reference') as Mode
  const activeCategory = (searchParams.get('cat') ?? 'all') as MechanismCategory | 'all'

  function setMode(m: Mode) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('mode', m)
      return next
    })
  }

  function setCategory(cat: MechanismCategory | 'all') {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (cat === 'all') next.delete('cat')
      else next.set('cat', cat)
      return next
    })
  }

  const categoryCounts = useMemo(() => getCategoryCounts(), [])

  const filteredReactions = useMemo(
    () => filterReactions({
      category: activeCategory,
      search,
      reactionType: 'all',
      regiochemistry: 'all',
      stereochemistry: 'all',
    }),
    [activeCategory, search],
  )

  const visibleCategories = CATEGORY_ORDER.filter(cat => (categoryCounts[cat] ?? 0) > 0)

  const activeTint = 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))'
  const activeBorder = 'color-mix(in srgb, var(--c-halogen) 40%, transparent)'

  return (
    <PageShell>

      {/* Heading row */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Reaction Mechanisms</h2>

        <button
          onClick={() => setShowExplanation(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                     font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          <span className="font-mono">?</span>
          <span>What is this</span>
        </button>

        {mode === 'reference' && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span>⎙</span>
            <span>Print</span>
          </button>
        )}

        <span className="font-mono text-xs text-dim ml-auto">
          {filteredReactions.length === TOTAL_REACTION_COUNT
            ? `${TOTAL_REACTION_COUNT} reactions`
            : `${filteredReactions.length} / ${TOTAL_REACTION_COUNT} reactions`}
        </span>
      </div>

      {/* Mode switcher */}
      <div
        className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}
      >
        {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
          const isActive = mode === m
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="mech-page-mode"
                  className="absolute inset-0 rounded-full"
                  style={{ background: activeTint, border: `1px solid ${activeBorder}` }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{m}</span>
            </button>
          )
        })}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 flex-wrap print:hidden">
        {/* All tab */}
        {(['all', ...visibleCategories] as const).map(cat => {
          const isAll = cat === 'all'
          const isActive = activeCategory === cat
          const count = isAll ? ALL_REACTIONS.length : (categoryCounts[cat as MechanismCategory] ?? 0)
          const label = isAll ? `All (${count})` : `${CATEGORY_LABELS[cat as MechanismCategory]} (${count})`
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat as MechanismCategory | 'all')}
              className="relative px-3 py-1 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="mech-cat-pill"
                  className="absolute inset-0 rounded-sm"
                  style={{ background: activeTint, border: `1px solid ${activeBorder}` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search reactions... (e.g. Markovnikov, epoxide, Grignard)"
        className="w-full max-w-md bg-raised border border-border rounded-sm px-3 py-2 font-sans text-sm text-bright placeholder-dim focus:outline-none focus:border-muted"
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        {mode === 'reference' && (
          <motion.div
            key="reference"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredReactions.map(reaction => (
                <motion.div
                  key={reaction.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MechanismCard reaction={reaction} />
                </motion.div>
              ))}
              {filteredReactions.length === 0 && (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-sans text-sm text-dim py-12 text-center"
                >
                  {ALL_REACTIONS.length === 0
                    ? 'Reaction data coming soon — check back after the next update.'
                    : 'No reactions match your search.'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {mode === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-5"
          >
            {/* Practice sub-tabs */}
            <div className="flex items-center gap-1 flex-wrap print:hidden">
              {PRACTICE_TABS.map(t => {
                const isActive = practiceTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setPracticeTab(t.id)}
                    className="relative px-3 py-1 rounded-sm font-sans text-sm transition-colors"
                    style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mech-practice-tab"
                        className="absolute inset-0 rounded-sm"
                        style={{ background: activeTint, border: `1px solid ${activeBorder}` }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={practiceTab}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {practiceTab === 'predict-product'    && <PredictProductPractice    category={activeCategory === 'all' ? 'all' : activeCategory} />}
                {practiceTab === 'identify-mechanism' && <IdentifyMechanismPractice category={activeCategory === 'all' ? 'all' : activeCategory} />}
                {practiceTab === 'regio-stereo'       && <PredictRegioStereoPractice category={activeCategory === 'all' ? 'all' : activeCategory} />}
                {practiceTab === 'identify-reagent'   && <IdentifyReagentPractice   category={activeCategory === 'all' ? 'all' : activeCategory} />}
                {practiceTab === 'stepwise'           && <MechanismStepwise          category={activeCategory === 'all' ? 'all' : activeCategory} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {mode === 'problems' && (
          <motion.div
            key="problems"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-5"
          >
            {/* Problems sub-tabs */}
            <div className="flex items-center gap-1 flex-wrap print:hidden">
              {PROBLEMS_TABS.map(t => {
                const isActive = problemsTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setProblemsTab(t.id)}
                    className="relative px-3 py-1 rounded-sm font-sans text-sm transition-colors"
                    style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mech-problems-tab"
                        className="absolute inset-0 rounded-sm"
                        style={{ background: activeTint, border: `1px solid ${activeBorder}` }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={problemsTab}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {problemsTab === 'quick-quiz' && <QuickQuiz category={activeCategory === 'all' ? 'all' : activeCategory} />}
                {problemsTab === 'exam-sim'   && <ExamSimulation />}
                {problemsTab === 'custom-test' && (
                  <div className="flex flex-col gap-4 max-w-lg">
                    <p className="font-sans text-sm text-secondary leading-relaxed">
                      Build a custom test with your choice of topics, question count, and format.
                    </p>
                    <Link
                      to="/test"
                      className="self-start flex items-center gap-2 px-4 py-2 rounded-sm font-sans text-sm border transition-colors"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}
                    >
                      Open Test Builder →
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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

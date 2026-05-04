import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import MechanismCard from '../components/mechanisms/MechanismCard'
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

export default function MechanismsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)

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

  const activeTint = 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))'
  const activeBorder = 'color-mix(in srgb, var(--c-halogen) 30%, transparent)'

  return (
    <PageShell>

      {/* Heading row */}
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <h2 className="font-sans font-bold text-bright text-xl lg:text-2xl">Reaction Mechanisms</h2>

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
            className="flex flex-col items-center gap-3 py-16"
          >
            <span className="text-4xl">⚗</span>
            <p className="font-sans text-sm text-dim">Practice mode — coming next</p>
          </motion.div>
        )}

        {mode === 'problems' && (
          <motion.div
            key="problems"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center gap-3 py-16"
          >
            <span className="text-4xl">📝</span>
            <p className="font-sans text-sm text-dim">Problems mode — coming next</p>
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

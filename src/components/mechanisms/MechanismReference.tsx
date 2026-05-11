import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_REACTIONS, CATEGORY_LABELS } from '../../data/mechanismData'
import type { ReactionDef, Category } from '../../data/mechanismData'

interface Props {
  initialCategory?: Category | null
}

const POPULATED_CATEGORIES: Category[] = [
  ...new Set(ALL_REACTIONS.map(r => r.category)),
]

function LegacyCard({ rxn }: { rxn: ReactionDef }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-sm border border-border overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 px-4 py-3 text-left w-full hover:bg-surface transition-colors"
      >
        {rxn.abbr && (
          <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 16%, rgb(var(--color-base)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 32%, transparent)', color: 'var(--c-halogen)' }}>
            {rxn.abbr}
          </span>
        )}
        <span className="font-sans font-semibold text-primary flex-1 text-sm">{rxn.name}</span>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }} className="font-mono text-[10px] text-dim shrink-0">▶</motion.span>
      </button>

      <div className="px-4 py-2.5 border-t border-border flex flex-col gap-1.5" style={{ background: 'rgb(var(--color-surface))' }}>
        <div className="grid gap-x-3 items-start" style={{ gridTemplateColumns: 'max-content 1fr' }}>
          <span className="font-mono text-xs text-dim pt-px">Reactants</span>
          <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{rxn.reactants}</span>
          <span className="font-mono text-xs text-dim pt-px">Conditions</span>
          <span className="font-mono text-xs text-secondary">{rxn.conditions}</span>
          <span className="font-mono text-xs text-dim pt-px">Product</span>
          <span className="font-mono text-xs text-primary">{rxn.product}</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div className="px-4 py-3 border-t border-border flex flex-col gap-1">
              <span className="font-mono text-xs text-dim uppercase tracking-wider">Mechanism</span>
              <span className="font-sans text-sm text-secondary">{rxn.mechanismType}</span>
            </div>
            {rxn.intermediate && (
              <div className="px-4 py-3 border-t border-border flex flex-col gap-1">
                <span className="font-mono text-xs text-dim uppercase tracking-wider">Intermediate</span>
                <span className="font-sans text-sm text-secondary">{rxn.intermediate}</span>
              </div>
            )}
            <div className="px-4 py-3 border-t border-border flex flex-col gap-4">
              <span className="font-mono text-xs text-dim uppercase tracking-wider">Mechanism Steps</span>
              {rxn.steps.map((step, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="font-sans text-sm font-semibold text-primary">{step.label}</span>
                  <p className="font-sans text-sm text-secondary leading-relaxed whitespace-pre-line">{step.description}</p>
                  {step.note && (
                    <p className="font-sans text-xs text-dim italic leading-relaxed pl-3 border-l-2 mt-0.5"
                      style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
                      {step.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border flex flex-col gap-2">
              <span className="font-mono text-xs text-dim uppercase tracking-wider">Key Rules</span>
              <ul className="flex flex-col gap-1">
                {rxn.keyRules.map((rule, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="font-mono text-[10px] text-dim mt-0.5 shrink-0">•</span>
                    <span className="font-sans text-sm text-secondary leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 py-2 border-t border-border flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-dim">{rxn.brownRef}</span>
              {rxn.relatedIds.length > 0 && (
                <span className="font-mono text-[10px] text-dim">Related: {rxn.relatedIds.join(' · ')}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MechanismReference({ initialCategory = null }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(initialCategory)
  const [search, setSearch] = useState('')

  const filtered = ALL_REACTIONS.filter(r => {
    if (activeCategory && r.category !== activeCategory) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.name.toLowerCase().includes(q) ||
        (r.abbr?.toLowerCase().includes(q) ?? false) ||
        r.conditions.toLowerCase().includes(q) ||
        r.keyRules.some(rule => rule.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6 max-w-3xl print:max-w-none">
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-semibold text-primary text-sm">Organic Reaction Mechanisms</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Step-by-step mechanisms, stereochemical outcomes, and key rules for named reactions.
          Click any card to expand the full mechanism. Reference: Brown, Iverson &amp; Anslyn, <em>Organic Chemistry</em> 9e.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search by name, abbr, condition, or rule…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-sm font-sans text-sm text-primary border border-border focus:outline-none"
        style={{ background: 'rgb(var(--color-surface))' }}
      />

      <div className="flex gap-2 flex-wrap print:hidden">
        <button
          onClick={() => setActiveCategory(null)}
          className="px-3 py-1 rounded-full font-sans text-xs font-medium border transition-colors"
          style={activeCategory === null ? {
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          } : { background: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-secondary))' }}
        >
          All ({ALL_REACTIONS.length})
        </button>
        {POPULATED_CATEGORIES.map(cat => {
          const count = ALL_REACTIONS.filter(r => r.category === cat).length
          const isActive = activeCategory === cat
          return (
            <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="px-3 py-1 rounded-full font-sans text-xs font-medium border transition-colors"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              } : { background: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-secondary))' }}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="font-sans text-sm text-dim py-6 text-center">
          {search ? `No mechanisms match "${search}".` : 'No mechanisms in this category yet — more coming soon.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(rxn => <LegacyCard key={rxn.id} rxn={rxn} />)}
        </div>
      )}

      <p className="font-mono text-xs text-dim">
        Data: Brown, Iverson &amp; Anslyn, <em>Organic Chemistry</em> 9e (2023). More mechanisms added each sprint.
      </p>
    </div>
  )
}

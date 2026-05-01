import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageShell from '../components/Layout/PageShell'
import { usePreferencesStore } from '../stores/preferencesStore'
import { UNITS, SECTIONS, getSectionsForUnit, getTopicsForSection } from '../config/topicRegistry'
import type { UnitId, SectionId } from '../config/topicRegistry'

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 shrink-0"
    >
      <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
        style={{
          background: checked
            ? 'color-mix(in srgb, var(--c-halogen) 80%, transparent)'
            : 'rgba(var(--overlay), 0.12)',
        }}>
        <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }} />
      </span>
      {label && <span className="font-sans text-sm text-secondary">{label}</span>}
    </button>
  )
}

// ── Tri-state checkbox (visible / partial / hidden) ───────────────────────────

type TriState = 'visible' | 'partial' | 'hidden'

function TriCheckbox({ state, onChange }: { state: TriState; onChange: () => void }) {
  const isChecked  = state === 'visible'
  const isPartial  = state === 'partial'
  return (
    <button
      role="checkbox"
      aria-checked={isPartial ? 'mixed' : isChecked}
      onClick={onChange}
      className="shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors"
      style={{
        background: isChecked
          ? 'color-mix(in srgb, var(--c-halogen) 80%, transparent)'
          : isPartial
            ? 'color-mix(in srgb, var(--c-halogen) 30%, rgb(var(--color-raised)))'
            : 'rgb(var(--color-raised))',
        borderColor: (isChecked || isPartial)
          ? 'color-mix(in srgb, var(--c-halogen) 60%, transparent)'
          : 'rgb(var(--color-border))',
      }}
    >
      {isChecked && <span className="text-white text-[9px] font-bold leading-none">✓</span>}
      {isPartial && <span style={{ color: 'var(--c-halogen)', fontSize: 10, lineHeight: 1, fontWeight: 700 }}>–</span>}
    </button>
  )
}

// ── Section row (within a unit) ───────────────────────────────────────────────

function SectionRow({ sectionId }: { sectionId: SectionId }) {
  const section = SECTIONS.find(s => s.id === sectionId)!
  const topics  = getTopicsForSection(sectionId)

  const hiddenTopics    = usePreferencesStore(s => s.hiddenTopics)
  const isTopicVisible  = usePreferencesStore(s => s.isTopicVisible)
  const isSectionFullyVisible = usePreferencesStore(s => s.isSectionFullyVisible)
  const isSectionVisible = usePreferencesStore(s => s.isSectionVisible)
  const toggleSection   = usePreferencesStore(s => s.toggleSection)
  const toggleTopic     = usePreferencesStore(s => s.toggleTopic)

  const [open, setOpen] = useState(false)

  const hiddenCount = topics.filter(t => hiddenTopics.has(t.id)).length
  const sectionState: TriState =
    !isSectionVisible(sectionId)      ? 'hidden'  :
    isSectionFullyVisible(sectionId)  ? 'visible' :
    hiddenCount === topics.length     ? 'hidden'  :
    hiddenCount > 0                   ? 'partial'  : 'visible'

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 py-1.5 pl-4">
        <TriCheckbox state={sectionState} onChange={() => toggleSection(sectionId)} />
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1.5 flex-1 text-left"
        >
          <span className="font-sans text-sm text-secondary">{section.label}</span>
          <span className="font-mono text-[10px] text-dim ml-1">({topics.length})</span>
          <span className="font-mono text-[10px] text-dim ml-auto mr-2"
            style={{ opacity: 0.5 }}>
            {open ? '▲' : '▼'}
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col pl-10 pb-1">
              {topics.map(topic => (
                <div key={topic.id} className="flex items-center gap-2 py-1">
                  <TriCheckbox
                    state={isTopicVisible(topic.id) ? 'visible' : 'hidden'}
                    onChange={() => toggleTopic(topic.id)}
                  />
                  <span className="font-sans text-sm text-dim">{topic.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Unit card ─────────────────────────────────────────────────────────────────

function UnitCard({ unitId }: { unitId: UnitId }) {
  const unit     = UNITS.find(u => u.id === unitId)!
  const sections = getSectionsForUnit(unitId)

  const isUnitVisible = usePreferencesStore(s => s.isUnitVisible)
  const isUnitFullyVisible = usePreferencesStore(s => s.isUnitFullyVisible)
  const toggleUnit    = usePreferencesStore(s => s.toggleUnit)

  const [open, setOpen] = useState(true)

  const unitState: TriState =
    !isUnitVisible(unitId)        ? 'hidden'  :
    isUnitFullyVisible(unitId)    ? 'visible' : 'partial'

  return (
    <div className="rounded-sm border border-border overflow-hidden"
      style={{ background: 'rgb(var(--color-surface))' }}>

      {/* Unit header */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(var(--overlay), 0.02)' }}>
        <TriCheckbox state={unitState} onChange={() => toggleUnit(unitId)} />
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span className="font-sans text-sm font-semibold text-bright">{unit.label}</span>
          <span className="font-mono text-[10px] text-dim">{sections.length} sections</span>
          <span className="font-mono text-xs text-dim ml-auto">{open ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Sections */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-border divide-y divide-border"
              style={{ borderColor: 'rgba(var(--overlay), 0.06)' }}>
              {sections.map(s => (
                <SectionRow key={s.id} sectionId={s.id} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const showAnswers    = usePreferencesStore(s => s.showAnswers)
  const setShowAnswers = usePreferencesStore(s => s.setShowAnswers)
  const showAll        = usePreferencesStore(s => s.showAll)
  const hideAll        = usePreferencesStore(s => s.hideAll)
  const resetToDefaults = usePreferencesStore(s => s.resetToDefaults)

  const hiddenTopics   = usePreferencesStore(s => s.hiddenTopics)
  const hiddenCount    = hiddenTopics.size

  const initialSnapshot = useRef<string>(JSON.stringify([...hiddenTopics].sort()))
  const currentSnapshot = JSON.stringify([...hiddenTopics].sort())
  const hasPendingChanges = currentSnapshot !== initialSnapshot.current

  return (
    <PageShell>
      <div className="flex flex-col gap-8 max-w-2xl">

        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl lg:text-2xl font-bold text-bright">Settings</h2>
            <p className="font-sans text-sm text-secondary">
              Control which topics appear in navigation and practice. Changes are saved automatically.
            </p>
          </div>
          <AnimatePresence>
            {hasPendingChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={() => window.location.reload()}
                className="shrink-0 px-4 py-2 rounded-sm font-sans text-sm font-semibold transition-colors"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                Apply Changes
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Global toggles */}
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase">Display</p>

          <div className="rounded-sm border border-border px-4 py-3 flex items-center justify-between"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-sm font-medium text-primary">Show Answers</span>
              <span className="font-sans text-xs text-dim">
                Display correct answers in practice tools after checking.
              </span>
            </div>
            <Toggle checked={showAnswers} onChange={setShowAnswers} />
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-secondary tracking-widest uppercase">Topic Visibility</p>
            {hiddenCount > 0 && (
              <span className="font-mono text-xs text-dim">
                <span style={{ color: 'rgb(248 113 113)' }}>{hiddenCount}</span> topic{hiddenCount !== 1 ? 's' : ''} hidden
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={showAll}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium border border-border text-secondary hover:text-bright transition-colors"
              style={{ background: 'rgb(var(--color-surface))' }}
            >
              Show All
            </button>
            <button
              onClick={hideAll}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium border border-border text-secondary hover:text-bright transition-colors"
              style={{ background: 'rgb(var(--color-surface))' }}
            >
              Hide All
            </button>
            <button
              onClick={resetToDefaults}
              className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Unit tree */}
        <div className="flex flex-col gap-3">
          {UNITS.map(u => <UnitCard key={u.id} unitId={u.id} />)}
        </div>

      </div>
    </PageShell>
  )
}

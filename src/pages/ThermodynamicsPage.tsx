import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal from '../components/calculations/ExplanationModal'
import PageShell from '../components/Layout/PageShell'

// Reference components
import EntropyReference          from '../components/thermodynamics/EntropyReference'
import SpontaneityReference      from '../components/thermodynamics/SpontaneityReference'
import GibbsReference            from '../components/thermodynamics/GibbsReference'
import GibbsEquilibriumReference from '../components/thermodynamics/GibbsEquilibriumReference'
import GibbsTempReference        from '../components/thermodynamics/GibbsTempReference'

// Practice (tool) components
import EntropyTool               from '../components/thermodynamics/EntropyTool'
import SpontaneityTool           from '../components/thermodynamics/SpontaneityTool'
import GibbsTool                 from '../components/thermodynamics/GibbsTool'
import GibbsEquilibriumTool      from '../components/thermodynamics/GibbsEquilibriumTool'
import GibbsTempTool             from '../components/thermodynamics/GibbsTempTool'

// Problems components
import EntropyPractice           from '../components/thermodynamics/EntropyPractice'
import GibbsPractice             from '../components/thermodynamics/GibbsPractice'
import GibbsEquilibriumPractice  from '../components/thermodynamics/GibbsEquilibriumPractice'

// ── Tab / Mode types ──────────────────────────────────────────────────────────

type Tab =
  // reference
  | 'ref-entropy' | 'ref-spontaneity' | 'ref-gibbs' | 'ref-gibbs-k' | 'ref-gibbs-temp'
  // practice
  | 'entropy' | 'spontaneity' | 'gibbs' | 'gibbs-k' | 'gibbs-temp'
  // problems
  | 'entropy-problems' | 'gibbs-problems' | 'gibbs-k-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

// ── Tab Groups ────────────────────────────────────────────────────────────────

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'ref-entropy-g',
    label: 'Entropy',
    pills: [
      { id: 'ref-entropy',     label: 'ΔS° Calculation', formula: 'ΣnS°' },
      { id: 'ref-spontaneity', label: 'Spontaneity',      formula: 'ΔG<0' },
    ],
  },
  {
    id: 'ref-gibbs-g',
    label: 'Gibbs Energy',
    pills: [
      { id: 'ref-gibbs',      label: 'ΔG° Calculation',   formula: 'ΔH-TΔS'  },
      { id: 'ref-gibbs-k',    label: 'ΔG° ↔ K',          formula: '-RTlnK' },
      { id: 'ref-gibbs-temp', label: 'ΔG vs Temperature', formula: 'T=ΔH/ΔS' },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'prac-entropy-g',
    label: 'Entropy',
    pills: [
      { id: 'entropy',     label: 'ΔS° Calculation', formula: 'ΣnS°' },
      { id: 'spontaneity', label: 'Spontaneity',      formula: 'ΔG<0' },
    ],
  },
  {
    id: 'prac-gibbs-g',
    label: 'Gibbs Energy',
    pills: [
      { id: 'gibbs',      label: 'ΔG° Calculation',   formula: 'ΔH-TΔS'  },
      { id: 'gibbs-k',    label: 'ΔG° ↔ K',          formula: '-RTlnK' },
      { id: 'gibbs-temp', label: 'ΔG vs T',           formula: 'T=ΔH/ΔS' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'prob-entropy-g',
    label: 'Entropy',
    pills: [
      { id: 'entropy-problems', label: 'ΔS° Calculation', formula: 'ΣnS°' },
    ],
  },
  {
    id: 'prob-gibbs-g',
    label: 'Gibbs Energy',
    pills: [
      { id: 'gibbs-problems',   label: 'ΔG° Calculation', formula: 'ΔH-TΔS'  },
      { id: 'gibbs-k-problems', label: 'ΔG° ↔ K',        formula: '-RTlnK' },
    ],
  },
]

// ── Tab ↔ Mode mapping ────────────────────────────────────────────────────────

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-entropy': 'entropy', 'entropy': 'entropy', 'entropy-problems': 'entropy',
  'ref-spontaneity': 'spontaneity', 'spontaneity': 'spontaneity',
  'ref-gibbs': 'gibbs', 'gibbs': 'gibbs', 'gibbs-problems': 'gibbs',
  'ref-gibbs-k': 'gibbs-k', 'gibbs-k': 'gibbs-k', 'gibbs-k-problems': 'gibbs-k',
  'ref-gibbs-temp': 'gibbs-temp', 'gibbs-temp': 'gibbs-temp',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'entropy':     { reference: 'ref-entropy',     practice: 'entropy',     problems: 'entropy-problems' },
  'spontaneity': { reference: 'ref-spontaneity', practice: 'spontaneity' },
  'gibbs':       { reference: 'ref-gibbs',       practice: 'gibbs',       problems: 'gibbs-problems'   },
  'gibbs-k':     { reference: 'ref-gibbs-k',     practice: 'gibbs-k',     problems: 'gibbs-k-problems' },
  'gibbs-temp':  { reference: 'ref-gibbs-temp',  practice: 'gibbs-temp' },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-entropy',
  practice:  'entropy',
  problems:  'entropy-problems',
}

// ── Tab → Mode detection ──────────────────────────────────────────────────────

function modeForTab(tab: Tab): Mode {
  if ((REFERENCE_GROUPS.flatMap(g => g.pills.map(p => p.id)) as string[]).includes(tab)) return 'reference'
  if ((PROBLEMS_GROUPS.flatMap(g => g.pills.map(p => p.id)) as string[]).includes(tab)) return 'problems'
  return 'practice'
}

// ── Explanation content ───────────────────────────────────────────────────────

const PAGE_EXPLANATION = {
  title: 'Entropy & Gibbs Free Energy',
  description:
    'Thermodynamics connects energy, entropy, and equilibrium through Gibbs free energy. ' +
    'This page covers ΔS° calculations from standard molar entropies, the four spontaneity cases, ' +
    'and the crucial ΔG° = −RT ln K relationship that links thermodynamics to equilibrium. ' +
    'These concepts appear in Chang Chapter 17 and build on Chemical Equilibrium (Phase 2).',
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ThermodynamicsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const { isTabVisible } = useTopicFilter()

  const rawTab = searchParams.get('tab') as Tab | null
  const activeTab: Tab = rawTab ?? 'ref-entropy'
  const mode: Mode = modeForTab(activeTab)

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  function switchMode(newMode: Mode) {
    const topic = TAB_TO_TOPIC[activeTab]
    const target = topic && TOPIC_MODE_TAB[topic]?.[newMode]
      ? TOPIC_MODE_TAB[topic][newMode]!
      : MODE_DEFAULT[newMode]
    setTab(target)
  }

  const refGroups  = REFERENCE_GROUPS.map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) })).filter(g => g.pills.length > 0)
  const pracGroups = PRACTICE_GROUPS.map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) })).filter(g => g.pills.length > 0)
  const probGroups = PROBLEMS_GROUPS.map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) })).filter(g => g.pills.length > 0)

  // Pill UI helpers
  const PILL_ACTIVE_STYLE = {
    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
    borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
    color: 'var(--c-halogen)',
  }
  const PILL_INACTIVE_CLASS = 'border-border text-secondary hover:text-primary'

  function ModePill({ m, label }: { m: Mode; label: string }) {
    return (
      <button
        onClick={() => switchMode(m)}
        className={`relative px-4 py-1.5 rounded-full font-sans text-sm border transition-all ${mode === m ? '' : PILL_INACTIVE_CLASS}`}
        style={mode === m ? PILL_ACTIVE_STYLE : undefined}
      >
        {mode === m && (
          <motion.span
            layoutId="thermo-mode-bg"
            className="absolute inset-0 rounded-full"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span className="relative">{label}</span>
      </button>
    )
  }

  function TabPillButton({ pill }: { pill: TabPill }) {
    const isActive = activeTab === pill.id
    return (
      <button
        onClick={() => setTab(pill.id)}
        className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-sm border transition-all ${isActive ? '' : PILL_INACTIVE_CLASS}`}
        style={isActive ? PILL_ACTIVE_STYLE : undefined}
      >
        {isActive && (
          <motion.span
            layoutId={`thermo-pill-${pill.id}`}
            className="absolute inset-0 rounded-full"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <span className="relative font-mono text-[10px] opacity-60">{pill.formula}</span>
        <span className="relative">{pill.label}</span>
      </button>
    )
  }

  const currentGroups = mode === 'reference' ? refGroups : mode === 'practice' ? pracGroups : probGroups

  return (
    <PageShell>
      {/* Heading row */}
      <div className="flex items-center gap-3 print:hidden">
        <h2 className="text-xl lg:text-2xl font-bold text-bright">Thermodynamics</h2>
        <button
          onClick={() => setShowExplanation(true)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border font-mono text-[10px] text-secondary hover:text-primary transition-colors"
        >
          ? What is this?
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
      </div>

      <ExplanationModal
        content={PAGE_EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />

      {/* Mode switcher */}
      <div className="flex items-center gap-2 print:hidden">
        <ModePill m="reference" label="Reference" />
        <ModePill m="practice"  label="Practice"  />
        <ModePill m="problems"  label="Problems"  />
      </div>

      {/* Tab groups */}
      <div className="flex flex-col gap-2 print:hidden">
        {currentGroups.map(group => (
          <div key={group.id}>
            <p className="font-mono text-[10px] text-dim tracking-widest uppercase mb-1.5">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.pills.map(pill => (
                <TabPillButton key={pill.id} pill={pill} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'ref-entropy'     && <EntropyReference />}
          {activeTab === 'ref-spontaneity' && <SpontaneityReference />}
          {activeTab === 'ref-gibbs'       && <GibbsReference />}
          {activeTab === 'ref-gibbs-k'     && <GibbsEquilibriumReference />}
          {activeTab === 'ref-gibbs-temp'  && <GibbsTempReference />}

          {activeTab === 'entropy'     && <EntropyTool />}
          {activeTab === 'spontaneity' && <SpontaneityTool />}
          {activeTab === 'gibbs'       && <GibbsTool />}
          {activeTab === 'gibbs-k'     && <GibbsEquilibriumTool />}
          {activeTab === 'gibbs-temp'  && <GibbsTempTool />}

          {activeTab === 'entropy-problems'  && <EntropyPractice allowCustom={false} />}
          {activeTab === 'gibbs-problems'    && <GibbsPractice allowCustom={false} />}
          {activeTab === 'gibbs-k-problems'  && <GibbsEquilibriumPractice allowCustom={false} />}
        </motion.div>
      </AnimatePresence>
    </PageShell>
  )
}

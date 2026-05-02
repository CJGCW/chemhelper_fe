import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import PageShell from '../components/Layout/PageShell'

// Reference
import BufferReference          from '../components/buffers/BufferReference'
import BufferCapacityReference  from '../components/buffers/BufferCapacityReference'
import TitrationCurveReference  from '../components/buffers/TitrationCurveReference'
import KspReference             from '../components/buffers/KspReference'
import CommonIonReference       from '../components/buffers/CommonIonReference'
import PrecipitationReference   from '../components/buffers/PrecipitationReference'

// Practice
import BufferTool               from '../components/buffers/BufferTool'
import BufferPractice           from '../components/buffers/BufferPractice'
import BufferCapacityTool       from '../components/buffers/BufferCapacityTool'
import TitrationCurveTool       from '../components/buffers/TitrationCurveTool'
import TitrationCurvePractice   from '../components/buffers/TitrationCurvePractice'
import KspTool                  from '../components/buffers/KspTool'
import KspPractice              from '../components/buffers/KspPractice'
import CommonIonTool            from '../components/buffers/CommonIonTool'
import CommonIonPractice        from '../components/buffers/CommonIonPractice'
import PrecipitationTool        from '../components/buffers/PrecipitationTool'
import PrecipitationPractice    from '../components/buffers/PrecipitationPractice'

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab =
  // reference
  | 'ref-buffer' | 'ref-buffer-cap' | 'ref-titration-curve' | 'ref-ksp' | 'ref-common-ion' | 'ref-precipitation'
  // practice
  | 'buffer' | 'buffer-capacity' | 'titration-curve' | 'ksp' | 'common-ion' | 'precipitation'
  // problems
  | 'buffer-practice' | 'buffer-problems' | 'buffer-cap-practice' | 'titration-curve-practice'
  | 'ksp-practice' | 'ksp-problems' | 'common-ion-practice' | 'precipitation-practice' | 'precipitation-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

// ── Groups ────────────────────────────────────────────────────────────────────

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'ref-buffers',
    label: 'Buffers',
    pills: [
      { id: 'ref-buffer',     label: 'Buffer pH',      formula: 'H-H'     },
      { id: 'ref-buffer-cap', label: 'Capacity',        formula: 'capacity' },
    ],
  },
  {
    id: 'ref-titrations',
    label: 'Titrations',
    pills: [
      { id: 'ref-titration-curve', label: 'Titration Curves', formula: 'pH vs V' },
    ],
  },
  {
    id: 'ref-solubility',
    label: 'Solubility (Ksp)',
    pills: [
      { id: 'ref-ksp',           label: 'Ksp',           formula: 'Ksp'    },
      { id: 'ref-common-ion',    label: 'Common Ion',     formula: 'common' },
      { id: 'ref-precipitation', label: 'Precipitation',  formula: 'Q vs Ksp' },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'prac-buffers',
    label: 'Buffers',
    pills: [
      { id: 'buffer',          label: 'Buffer pH',       formula: 'H-H'     },
      { id: 'buffer-capacity', label: 'Buffer Capacity', formula: 'capacity' },
    ],
  },
  {
    id: 'prac-titrations',
    label: 'Titrations',
    pills: [
      { id: 'titration-curve', label: 'Titration Curves', formula: 'pH vs V' },
    ],
  },
  {
    id: 'prac-solubility',
    label: 'Solubility (Ksp)',
    pills: [
      { id: 'ksp',           label: 'Ksp ↔ Solubility', formula: 'Ksp'     },
      { id: 'common-ion',    label: 'Common Ion',         formula: 'common'  },
      { id: 'precipitation', label: 'Precipitation',      formula: 'Q vs Ksp' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'prob-buffers',
    label: 'Buffers',
    pills: [
      { id: 'buffer-problems',     label: 'Buffer pH',       formula: 'H-H'     },
      { id: 'buffer-cap-practice', label: 'Buffer Capacity', formula: 'capacity' },
    ],
  },
  {
    id: 'prob-titrations',
    label: 'Titrations',
    pills: [
      { id: 'titration-curve-practice', label: 'Titration Curves', formula: 'pH vs V' },
    ],
  },
  {
    id: 'prob-solubility',
    label: 'Solubility (Ksp)',
    pills: [
      { id: 'ksp-problems',             label: 'Ksp',           formula: 'Ksp'     },
      { id: 'common-ion-practice',      label: 'Common Ion',    formula: 'common'  },
      { id: 'precipitation-problems',   label: 'Precipitation', formula: 'Q vs Ksp' },
    ],
  },
]

// ── Topic routing maps ────────────────────────────────────────────────────────

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-buffer': 'buffer',        'buffer': 'buffer',           'buffer-practice': 'buffer',  'buffer-problems': 'buffer',
  'ref-buffer-cap': 'buffer-cap', 'buffer-capacity': 'buffer-cap', 'buffer-cap-practice': 'buffer-cap',
  'ref-titration-curve': 'titration', 'titration-curve': 'titration', 'titration-curve-practice': 'titration',
  'ref-ksp': 'ksp',              'ksp': 'ksp',                 'ksp-practice': 'ksp',        'ksp-problems': 'ksp',
  'ref-common-ion': 'common-ion', 'common-ion': 'common-ion',  'common-ion-practice': 'common-ion',
  'ref-precipitation': 'precip', 'precipitation': 'precip',    'precipitation-practice': 'precip', 'precipitation-problems': 'precip',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'buffer':     { reference: 'ref-buffer',          practice: 'buffer',          problems: 'buffer-problems'          },
  'buffer-cap': { reference: 'ref-buffer-cap',       practice: 'buffer-capacity', problems: 'buffer-cap-practice'      },
  'titration':  { reference: 'ref-titration-curve',  practice: 'titration-curve', problems: 'titration-curve-practice' },
  'ksp':        { reference: 'ref-ksp',              practice: 'ksp',             problems: 'ksp-problems'             },
  'common-ion': { reference: 'ref-common-ion',        practice: 'common-ion',      problems: 'common-ion-practice'      },
  'precip':     { reference: 'ref-precipitation',    practice: 'precipitation',   problems: 'precipitation-problems'   },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-buffer',
  practice:  'buffer',
  problems:  'buffer-problems',
}

// ── Explanation ───────────────────────────────────────────────────────────────

const EXPLANATION: ExplanationContent = {
  title: 'Buffers & Solubility',
  formula: 'pH = pKa + log([A⁻]/[HA])    Ksp = [M⁺]ᵐ[A⁻]ⁿ',
  description:
    'Buffers resist pH changes and are critical in biology and medicine. This page covers ' +
    'Henderson-Hasselbalch buffer calculations, titration curves, and solubility equilibria (Ksp). ' +
    'These topics build directly on the acid-base chemistry from the Acids & Bases page. ' +
    'Use the Reference tab for equations and worked examples, Practice for interactive calculators, ' +
    'and Problems for scored practice.',
}

// ── Pill component ────────────────────────────────────────────────────────────

function Pill({ pill, active, onClick }: { pill: TabPill; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-sm transition-colors whitespace-nowrap"
      style={active ? {
        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
        color: 'var(--c-halogen)',
      } : {
        background: 'transparent',
        border: '1px solid transparent',
        color: 'rgb(var(--color-secondary))',
      }}
    >
      {active && (
        <motion.span
          layoutId="buffers-pill-bg"
          className="absolute inset-0 rounded-full"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative font-mono text-[9px] opacity-60">{pill.formula}</span>
      <span className="relative">{pill.label}</span>
    </button>
  )
}

// ── Mode switch ───────────────────────────────────────────────────────────────

function ModePill({ label, active, onClick }: { mode?: Mode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-1.5 rounded-full font-sans text-sm transition-colors"
      style={active ? {
        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
        color: 'var(--c-halogen)',
      } : {
        border: '1px solid rgb(var(--color-border))',
        color: 'rgb(var(--color-secondary))',
      }}
    >
      {active && (
        <motion.span
          layoutId="buffers-mode-bg"
          className="absolute inset-0 rounded-full"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BuffersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const { isTabVisible } = useTopicFilter()

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-buffer'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  // Determine current mode from active tab
  const allRefTabs  = REFERENCE_GROUPS.flatMap(g => g.pills.map(p => p.id))
  const allPracTabs = PRACTICE_GROUPS.flatMap(g => g.pills.map(p => p.id))
  const currentMode: Mode = allRefTabs.includes(activeTab as Tab)
    ? 'reference'
    : allPracTabs.includes(activeTab as Tab)
    ? 'practice'
    : 'problems'

  function switchMode(mode: Mode) {
    const topic = TAB_TO_TOPIC[activeTab]
    const dest = topic && TOPIC_MODE_TAB[topic]?.[mode]
      ? TOPIC_MODE_TAB[topic][mode]!
      : MODE_DEFAULT[mode]
    setTab(dest)
  }

  const activeGroups =
    currentMode === 'reference' ? REFERENCE_GROUPS :
    currentMode === 'practice'  ? PRACTICE_GROUPS  :
    PROBLEMS_GROUPS

  return (
    <PageShell>
      {/* Heading row */}
      <div className="flex items-center gap-3 print:hidden">
        <h2 className="text-xl lg:text-2xl font-bold text-bright">Buffers &amp; Solubility</h2>
        <button
          onClick={() => setShowExplanation(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-xs border border-border text-secondary hover:text-primary transition-colors"
        >
          <span>?</span>
          <span>What is this?</span>
        </button>
        {currentMode === 'reference' && (
          <button
            onClick={() => window.print()}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-sm border border-border font-sans text-xs text-secondary hover:text-primary transition-colors"
          >
            ⎙ Print
          </button>
        )}
      </div>

      <ExplanationModal
        content={EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />

      {/* Mode switcher */}
      <div className="flex gap-2 print:hidden">
        {(['reference', 'practice', 'problems'] as const).map(m => (
          <ModePill
            key={m}
            mode={m}
            label={m.charAt(0).toUpperCase() + m.slice(1)}
            active={currentMode === m}
            onClick={() => switchMode(m)}
          />
        ))}
      </div>

      {/* Tab groups */}
      {activeGroups.map(group => {
        const visiblePills = group.pills.filter(p => isTabVisible(p.id))
        if (visiblePills.length === 0) return null
        return (
          <div key={group.id} className="flex flex-col gap-2 print:hidden">
            <p className="font-mono text-[10px] tracking-widest text-dim uppercase">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {visiblePills.map(pill => (
                <Pill
                  key={pill.id}
                  pill={pill}
                  active={activeTab === pill.id}
                  onClick={() => setTab(pill.id)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Reference */}
          {activeTab === 'ref-buffer'          && <BufferReference />}
          {activeTab === 'ref-buffer-cap'      && <BufferCapacityReference />}
          {activeTab === 'ref-titration-curve' && <TitrationCurveReference />}
          {activeTab === 'ref-ksp'             && <KspReference />}
          {activeTab === 'ref-common-ion'      && <CommonIonReference />}
          {activeTab === 'ref-precipitation'   && <PrecipitationReference />}

          {/* Practice */}
          {activeTab === 'buffer'          && <BufferTool />}
          {activeTab === 'buffer-capacity' && <BufferCapacityTool />}
          {activeTab === 'titration-curve' && <TitrationCurveTool />}
          {activeTab === 'ksp'             && <KspTool />}
          {activeTab === 'common-ion'      && <CommonIonTool />}
          {activeTab === 'precipitation'   && <PrecipitationTool />}

          {/* Problems */}
          {activeTab === 'buffer-practice'          && <BufferPractice allowCustom={false} />}
          {activeTab === 'buffer-problems'          && <BufferPractice allowCustom={false} />}
          {activeTab === 'buffer-cap-practice'      && <BufferCapacityTool />}
          {activeTab === 'titration-curve-practice' && <TitrationCurvePractice allowCustom={false} />}
          {activeTab === 'ksp-practice'             && <KspPractice allowCustom={false} />}
          {activeTab === 'ksp-problems'             && <KspPractice allowCustom={false} />}
          {activeTab === 'common-ion-practice'      && <CommonIonPractice allowCustom={false} />}
          {activeTab === 'precipitation-practice'   && <PrecipitationPractice allowCustom={false} />}
          {activeTab === 'precipitation-problems'   && <PrecipitationPractice allowCustom={false} />}
        </motion.div>
      </AnimatePresence>
    </PageShell>
  )
}

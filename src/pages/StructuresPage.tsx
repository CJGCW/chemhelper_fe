import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import LewisPage from './LewisPage'
import VsepPage from './VsepPage'
import LewisReference from '../components/lewis/LewisReference'
import VsepReference from '../components/vsepr/VsepReference'
import LewisStructurePractice from '../components/lewis/LewisStructurePractice'
import SigmaPiPractice from '../components/lewis/SigmaPiPractice'
import LewisDrawChallenge from '../components/lewis/LewisDrawChallenge'
import VseprPractice from '../components/vsepr/VseprPractice'
import SolidTypesReference from '../components/structures/SolidTypesReference'
import UnitCellCalc from '../components/structures/UnitCellCalc'

const VseprDrawChallenge = lazy(() => import('../components/vsepr/VseprDrawChallenge'))

type Tab  = 'lewis' | 'vsepr' | 'solid-types' | 'unit-cell' | 'lewis-practice' | 'lewis-draw' | 'vsepr-practice' | 'vsepr-draw' | 'sigma-pi'
type Mode = 'reference' | 'practice' | 'problems'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis',       label: 'Lewis Structures', formula: '⌬'        },
  { id: 'vsepr',       label: 'VSEPR',            formula: '⬡'        },
  { id: 'solid-types', label: 'Solid Types',      formula: '4t'       },
  { id: 'unit-cell',   label: 'Unit Cell',        formula: 'SC/BCC/FCC' },
]

const PRACTICE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis-practice', label: 'Lewis',       formula: '⌬'  },
  { id: 'vsepr-practice', label: 'VSEPR',       formula: '⬡'  },
  { id: 'sigma-pi',       label: 'σ / π Bonds', formula: 'σπ' },
]

const PROBLEMS_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis-draw', label: 'Lewis',  formula: '⌬' },
  { id: 'vsepr-draw', label: 'VSEPR', formula: '⬡' },
]

const PRACTICE_TAB_IDS = new Set<Tab>(['lewis-practice', 'vsepr-practice', 'sigma-pi'])
const PROBLEMS_TAB_IDS = new Set<Tab>(['lewis-draw', 'vsepr-draw'])

export default function StructuresPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'lewis'
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
    if (mode === 'practice') setTab('lewis-practice')
    else if (mode === 'problems') setTab('lewis-draw')
    else setTab('lewis')
  }

  const visibleTabs = activeMode === 'problems' ? PROBLEMS_TABS
    : activeMode === 'practice' ? PRACTICE_TABS
    : REFERENCE_TABS

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Structures</h2>
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
        </div>
        <h2 className="hidden print:block font-sans font-semibold text-black text-xl">
          {activeTab === 'vsepr' ? 'VSEPR — Reference' : 'Lewis Structures — Reference'}
        </h2>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(mode => {
            const isActive = activeMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="structures-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {visibleTabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                {isActive && (
                  <motion.div layoutId="structures-tab-pill" className="absolute inset-0 rounded-sm"
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
        {activeTab === 'lewis' && (
          <motion.div key="lewis"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="flex flex-col gap-8">
            <LewisPage embedded />
            <div className="border-t border-border pt-6">
              <LewisReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'vsepr' && (
          <motion.div key="vsepr"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="flex flex-col gap-8">
            <VsepPage />
            <div className="border-t border-border pt-6">
              <VsepReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'lewis-practice' && (
          <motion.div key="lewis-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LewisStructurePractice />
          </motion.div>
        )}
        {activeTab === 'lewis-draw' && (
          <motion.div key="lewis-draw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LewisDrawChallenge />
          </motion.div>
        )}
        {activeTab === 'vsepr-practice' && (
          <motion.div key="vsepr-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VseprPractice />
          </motion.div>
        )}
        {activeTab === 'vsepr-draw' && (
          <motion.div key="vsepr-draw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <Suspense fallback={<span className="font-mono text-xs text-dim animate-pulse">Loading editor…</span>}>
              <VseprDrawChallenge />
            </Suspense>
          </motion.div>
        )}
        {activeTab === 'solid-types' && (
          <motion.div key="solid-types"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolidTypesReference />
          </motion.div>
        )}
        {activeTab === 'sigma-pi' && (
          <motion.div key="sigma-pi"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SigmaPiPractice />
          </motion.div>
        )}
        {activeTab === 'unit-cell' && (
          <motion.div key="unit-cell"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <UnitCellCalc />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

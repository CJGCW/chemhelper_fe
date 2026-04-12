import { lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import LewisPage from './LewisPage'
import VsepPage from './VsepPage'
import LewisReference from '../components/lewis/LewisReference'
import VsepReference from '../components/vsepr/VsepReference'
import LewisStructurePractice from '../components/lewis/LewisStructurePractice'
import LewisDrawChallenge from '../components/lewis/LewisDrawChallenge'
import VseprPractice from '../components/vsepr/VseprPractice'

const VseprDrawChallenge = lazy(() => import('../components/vsepr/VseprDrawChallenge'))

type Tab  = 'lewis' | 'vsepr' | 'lewis-practice' | 'lewis-draw' | 'vsepr-practice' | 'vsepr-draw'
type Mode = 'reference' | 'practice'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis', label: 'Lewis Structures', formula: '⌬' },
  { id: 'vsepr', label: 'VSEPR',            formula: '⬡' },
]

const PRACTICE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis-practice', label: 'Lewis',            formula: '⌬' },
  { id: 'lewis-draw',     label: 'Lewis Problems',   formula: '✎' },
  { id: 'vsepr-practice', label: 'VSEPR',            formula: '⬡' },
  { id: 'vsepr-draw',     label: 'VSEPR Problems',   formula: '⬡' },
]

const PRACTICE_TAB_IDS = new Set<Tab>(['lewis-practice', 'lewis-draw', 'vsepr-practice', 'vsepr-draw'])

export default function StructuresPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'lewis'
  const activeMode: Mode = PRACTICE_TAB_IDS.has(activeTab) ? 'practice' : 'reference'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    setTab(mode === 'practice' ? 'lewis-practice' : 'lewis')
  }

  const visibleTabs = activeMode === 'reference' ? REFERENCE_TABS : PRACTICE_TABS

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Structures</h2>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice'] as Mode[]).map(mode => {
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
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
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
      </AnimatePresence>
    </div>
  )
}

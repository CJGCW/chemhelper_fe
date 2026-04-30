import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../stores/elementStore'
import EmpiricalReference from '../components/empirical/EmpiricalReference'
import EmpiricalTool from '../components/empirical/EmpiricalTool'
import EmpiricalPractice from '../components/empirical/EmpiricalPractice'
import HydrateTool from '../components/empirical/HydrateTool'
import HydrateReference from '../components/empirical/HydrateReference'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import PageShell from '../components/Layout/PageShell'

const EXPLANATION: ExplanationContent = {
  title: 'Empirical & Molecular Formula',
  formula: 'MF = n × EF   ·   n = M_molecular / M_empirical',
  formulaVars: [
    { symbol: 'EF',  meaning: 'Empirical formula — simplest whole-number ratio of atoms', unit: '—' },
    { symbol: 'MF',  meaning: 'Molecular formula — actual number of atoms per molecule',  unit: '—' },
    { symbol: 'n',   meaning: 'Whole-number multiplier relating EF to MF',                unit: 'integer' },
    { symbol: 'M',   meaning: 'Molar mass',                                               unit: 'g/mol' },
    { symbol: 'GCF', meaning: 'Greatest common factor — used to simplify subscripts',     unit: '—' },
  ],
  description:
    'The empirical formula gives the simplest whole-number ratio of elements in a compound. ' +
    'To find it from percent composition, assume a 100 g sample (so % = g), convert each mass to moles, ' +
    'then divide all mole values by the smallest to get the ratio. ' +
    'The molecular formula is a whole-number multiple of the empirical formula — find the multiplier n ' +
    'by dividing the compound\'s molar mass by the empirical formula mass.',
  example: {
    scenario: 'A compound is 40.0% C, 6.7% H, 53.3% O, with molar mass 60.1 g/mol.',
    steps: [
      'Assume 100 g → 40.0 g C, 6.7 g H, 53.3 g O',
      'n(C) = 40.0/12.01 = 3.33 mol,  n(H) = 6.7/1.008 = 6.65 mol,  n(O) = 53.3/16.00 = 3.33 mol',
      'Divide by smallest (3.33): C:1  H:2  O:1 → empirical formula CH₂O',
      'M(CH₂O) = 30.03 g/mol;  n = 60.1 / 30.03 ≈ 2',
    ],
    result: 'Molecular formula: C₂H₄O₂  (acetic acid)',
  },
}

type Mode = 'reference' | 'practice' | 'problems'
type Tab  = 'empirical' | 'hydrate'

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: 'empirical', label: 'Empirical / Molecular', sub: 'EF · MF' },
  { id: 'hydrate',   label: 'Hydrates',              sub: 'salt·xH₂O' },
]

export default function EmpiricalPage() {
  const loadElements = useElementStore(s => s.loadElements)
  const loading = useElementStore(s => s.loading)
  const error = useElementStore(s => s.error)

  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const tab:  Tab  = (searchParams.get('tab')  as Tab)  ?? 'empirical'
  const mode: Mode = (searchParams.get('mode') as Mode) ?? 'reference'

  useEffect(() => { loadElements() }, [loadElements])

  function setTab(t: Tab) {
    if (t === tab) return
    setSearchParams(t === 'empirical' ? {} : { tab: t }, { replace: true })
  }

  function setMode(m: Mode) {
    if (m === mode) return
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (m === 'reference') next.delete('mode')
      else next.set('mode', m)
      return next
    }, { replace: true })
  }

  const needsElements = tab === 'empirical' && (mode === 'practice' || mode === 'problems')

  return (
    <PageShell>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
            {tab === 'hydrate' ? 'Hydrates' : 'Empirical \u0026 Molecular Formula'}
          </h2>
          {(tab === 'empirical' || tab === 'hydrate') && mode === 'reference' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          {tab === 'empirical' && (
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

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 print:hidden">
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                style={isActive ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                } : {
                  background: 'rgb(var(--color-surface))',
                  border: '1px solid rgb(var(--color-border))',
                  color: 'rgba(var(--overlay),0.45)',
                }}>
                <span>{t.label}</span>
                <span className="font-mono text-[10px] opacity-60">{t.sub}</span>
              </button>
            )
          })}
        </div>

        {/* Mode toggle switch */}
        {(tab === 'empirical' || tab === 'hydrate') && (
          <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
              const isActive = mode === m
              return (
                <button key={m} onClick={() => setMode(m)}
                  className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                  {isActive && (
                    <motion.div layoutId="empirical-mode-switch" className="absolute inset-0 rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative z-10">{m}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {needsElements && loading && <p className="font-mono text-xs text-dim animate-pulse">Loading element data…</p>}
      {needsElements && error   && <p className="font-sans text-xs" style={{ color: '#f87171' }}>Failed to load elements: {error}</p>}

      <AnimatePresence mode="wait">
        {tab === 'hydrate' && mode === 'reference' && (
          <motion.div key="hydrate-reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrateReference />
          </motion.div>
        )}
        {tab === 'hydrate' && mode !== 'reference' && (
          <motion.div key="hydrate"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="print:hidden">
            <HydrateTool />
          </motion.div>
        )}
        {tab === 'empirical' && mode === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EmpiricalReference />
          </motion.div>
        )}
        {tab === 'empirical' && mode === 'practice' && !loading && !error && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="print:hidden">
            <EmpiricalTool />
          </motion.div>
        )}
        {tab === 'empirical' && mode === 'problems' && !loading && !error && (
          <motion.div key="problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="print:hidden">
            <EmpiricalPractice allowCustom={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <ExplanationModal
        content={EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </PageShell>
  )
}

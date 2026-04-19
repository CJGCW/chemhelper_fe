import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../stores/elementStore'
import EmpiricalReference from '../components/empirical/EmpiricalReference'
import EmpiricalSolver from '../components/empirical/EmpiricalSolver'
import EmpiricalPractice from '../components/empirical/EmpiricalPractice'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'

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

export default function EmpiricalPage() {
  const loadElements = useElementStore(s => s.loadElements)
  const loading = useElementStore(s => s.loading)
  const error = useElementStore(s => s.error)

  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const mode: Mode = (searchParams.get('mode') as Mode) ?? 'reference'

  useEffect(() => { loadElements() }, [loadElements])

  function setMode(m: Mode) {
    if (m === mode) return
    setSearchParams(m === 'reference' ? {} : { mode: m }, { replace: true })
  }

  const needsElements = mode === 'practice' || mode === 'problems'

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Empirical &amp; Molecular Formula</h2>
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
          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                       font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono">?</span>
            <span>What is this</span>
          </button>
        </div>

        {/* Mode toggle switch */}
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
      </div>

      {needsElements && loading && <p className="font-mono text-xs text-dim animate-pulse">Loading element data…</p>}
      {needsElements && error   && <p className="font-sans text-xs" style={{ color: '#f87171' }}>Failed to load elements: {error}</p>}

      <AnimatePresence mode="wait">
        {mode === 'reference' && (
          <motion.div key="reference"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EmpiricalReference />
          </motion.div>
        )}
        {mode === 'practice' && !loading && !error && (
          <motion.div key="practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="print:hidden">
            <EmpiricalSolver />
          </motion.div>
        )}
        {mode === 'problems' && !loading && !error && (
          <motion.div key="problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="print:hidden">
            <EmpiricalPractice />
          </motion.div>
        )}
      </AnimatePresence>

      <ExplanationModal
        content={EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </div>
  )
}

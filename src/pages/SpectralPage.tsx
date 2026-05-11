import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageShell from '../components/Layout/PageShell'
import ExplanationModal from '../components/calculations/ExplanationModal'
import IRCorrelationTable from '../components/spectral/IRCorrelationTable'
import NMRShiftTable from '../components/spectral/NMRShiftTable'
import FragmentationTable from '../components/spectral/FragmentationTable'
import SpectralUpload from '../components/spectral/SpectralUpload'
import IRInterpretationPractice from '../components/spectral/IRInterpretationPractice'
import NMRInterpretationPractice from '../components/spectral/NMRInterpretationPractice'
import MSInterpretationPractice from '../components/spectral/MSInterpretationPractice'
import CombinedSpectralPractice from '../components/spectral/CombinedSpectralPractice'
import SpectrumEstimator from '../components/spectral/SpectrumEstimator'

type SpectroscopyTab = 'ir-spectroscopy' | 'nmr-spectroscopy' | 'ms-spectroscopy'
type PageTab = SpectroscopyTab | 'spectral-analysis-tools'
type Mode = 'reference' | 'practice' | 'problems'
type AnalysisTab = 'upload' | 'combined' | 'estimator'

const SPECTROSCOPY_TABS: SpectroscopyTab[] = ['ir-spectroscopy', 'nmr-spectroscopy', 'ms-spectroscopy']

function isSpectroscopyTab(t: string): t is SpectroscopyTab {
  return (SPECTROSCOPY_TABS as string[]).includes(t)
}

function methodFromTab(t: string): 'ir' | 'nmr' | 'ms' {
  if (t === 'nmr-spectroscopy') return 'nmr'
  if (t === 'ms-spectroscopy')  return 'ms'
  return 'ir'
}

// Legacy ?tab= values → new tab + mode
const LEGACY_TAB_MAP: Record<string, { tab: PageTab; mode?: Mode; analysisTab?: AnalysisTab }> = {
  'spectroscopy-tool': { tab: 'ir-spectroscopy' },
  'ref-ir':            { tab: 'ir-spectroscopy',  mode: 'reference' },
  'ir-practice':       { tab: 'ir-spectroscopy',  mode: 'practice'  },
  'ref-hnmr':          { tab: 'nmr-spectroscopy', mode: 'reference' },
  'ref-cnmr':          { tab: 'nmr-spectroscopy', mode: 'reference' },
  'nmr-practice':      { tab: 'nmr-spectroscopy', mode: 'practice'  },
  'ref-ms':            { tab: 'ms-spectroscopy',  mode: 'reference' },
  'ms-practice':       { tab: 'ms-spectroscopy',  mode: 'practice'  },
  'spectral-analysis': { tab: 'spectral-analysis-tools', analysisTab: 'upload'    },
  'combined-practice': { tab: 'spectral-analysis-tools', analysisTab: 'combined'  },
  'estimator':         { tab: 'spectral-analysis-tools', analysisTab: 'estimator' },
}

const SPECTROSCOPY_EXPLANATION = {
  title: 'Spectroscopy',
  description:
    'Spectroscopy uses the interaction of light and matter to determine molecular structure. ' +
    'IR identifies functional groups from bond stretching frequencies, NMR maps the carbon-hydrogen framework from chemical shifts and coupling patterns, and MS provides molecular weight and fragmentation clues. ' +
    'Students encounter these methods throughout Organic Chemistry. ' +
    'Use the Reference tab for correlation tables and shift charts, and Practice to work through spectrum interpretation problems.',
}

const SPECTRAL_ANALYSIS_EXPLANATION = {
  title: 'Spectral Analysis Tools',
  description:
    'These tools let you work with real spectral data rather than reference tables. ' +
    'Upload a JCAMP-DX or CSV file to get an interactive spectrum with automated peak picking, use Combined Practice to identify an unknown from IR + NMR + MS data together, or draw a structure and estimate its expected spectrum. ' +
    'The estimator is useful for checking assignments and understanding how structural changes shift peaks.',
}

const PILL_ACTIVE: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
  color: 'var(--c-halogen)',
}

const PILL_INACTIVE: React.CSSProperties = {
  color: 'rgb(var(--color-secondary))',
}

export default function SpectralPage() {
  const [params, setParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  // Redirect legacy ?tab= values
  useEffect(() => {
    const raw = params.get('tab') ?? ''
    if (!raw || isSpectroscopyTab(raw) || raw === 'spectral-analysis-tools') return
    const mapping = LEGACY_TAB_MAP[raw]
    if (!mapping) return
    const next = new URLSearchParams()
    next.set('tab', mapping.tab)
    if (mapping.mode)        next.set('mode', mapping.mode)
    if (mapping.analysisTab) next.set('analysisTab', mapping.analysisTab)
    setParams(next, { replace: true })
  }, [])

  const rawTab      = params.get('tab') ?? 'ir-spectroscopy'
  const tab         = (isSpectroscopyTab(rawTab) || rawTab === 'spectral-analysis-tools'
    ? rawTab : 'ir-spectroscopy') as PageTab
  const mode        = (params.get('mode')        ?? 'reference') as Mode
  const analysisTab = (params.get('analysisTab') ?? 'upload') as AnalysisTab

  const isSpectroscopy = isSpectroscopyTab(tab)
  const method         = methodFromTab(tab)
  const title          = isSpectroscopy ? 'Spectroscopy' : 'Spectral Analysis'

  function setTab(t: PageTab) {
    const next = new URLSearchParams()
    next.set('tab', t)
    if (isSpectroscopyTab(t)) next.set('mode', mode)
    else                      next.set('analysisTab', analysisTab)
    setParams(next, { replace: true })
  }

  function setMode(m: Mode) {
    const next = new URLSearchParams(params)
    next.set('mode', m)
    setParams(next, { replace: true })
  }

  function setAnalysisTabValue(t: AnalysisTab) {
    const next = new URLSearchParams(params)
    next.set('analysisTab', t)
    setParams(next, { replace: true })
  }

  const METHODS: { id: SpectroscopyTab; label: string }[] = [
    { id: 'ir-spectroscopy',  label: 'IR'  },
    { id: 'nmr-spectroscopy', label: 'NMR' },
    { id: 'ms-spectroscopy',  label: 'MS'  },
  ]

  const MODES: { id: Mode; label: string }[] = [
    { id: 'reference', label: 'Reference' },
    { id: 'practice',  label: 'Practice'  },
    { id: 'problems',  label: 'Problems'  },
  ]

  const ANALYSIS_TABS: { id: AnalysisTab; label: string }[] = [
    { id: 'upload',    label: 'Upload & Analyze'        },
    { id: 'combined',  label: 'Combined Practice'       },
    { id: 'estimator', label: 'Estimate from Structure' },
  ]

  return (
    <PageShell>
      <div className="flex flex-col gap-6">

        {/* Tool switcher + heading */}
        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-1 p-1 rounded-full w-fit print:hidden"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}
          >
            <motion.button
              onClick={() => setTab(tab === 'spectral-analysis-tools' ? 'ir-spectroscopy' : tab as SpectroscopyTab)}
              className="px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors"
              style={isSpectroscopy ? PILL_ACTIVE : PILL_INACTIVE}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            >
              Spectroscopy
            </motion.button>
            <motion.button
              onClick={() => setTab('spectral-analysis-tools')}
              className="px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors"
              style={!isSpectroscopy ? PILL_ACTIVE : PILL_INACTIVE}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            >
              Spectral Analysis
            </motion.button>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">{title}</h2>
            <button
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors print:hidden"
            >
              <span className="font-mono">?</span>
              <span>What is this</span>
            </button>
            {isSpectroscopy && mode === 'reference' && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors print:hidden"
              >
                <span>⎙</span>
                <span>Print</span>
              </button>
            )}
          </div>
        </div>

        {isSpectroscopy ? (
          <div className="flex flex-col gap-4">
            {/* Reference / Practice / Problems mode toggle — top */}
            <div
              className="flex items-center gap-1 p-1 rounded-full w-fit print:hidden"
              style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}
            >
              {MODES.map(m => (
                <motion.button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-colors"
                  style={mode === m.id ? PILL_ACTIVE : PILL_INACTIVE}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                >
                  {m.label}
                </motion.button>
              ))}
            </div>

            {/* IR / NMR / MS method tabs — below mode */}
            <div
              className="flex items-center gap-1 p-1 rounded-sm border border-border w-fit print:hidden"
              style={{ background: 'rgb(var(--color-surface))' }}
            >
              {METHODS.map(m => (
                <motion.button
                  key={m.id}
                  onClick={() => setTab(m.id)}
                  className="px-3 py-1 rounded-sm font-mono text-xs font-medium transition-colors"
                  style={tab === m.id ? PILL_ACTIVE : PILL_INACTIVE}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                >
                  {m.label}
                </motion.button>
              ))}
            </div>

            {/* Active content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-${mode}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {method === 'ir'  && mode === 'reference' && <IRCorrelationTable />}
                {method === 'ir'  && (mode === 'practice' || mode === 'problems') && <IRInterpretationPractice key={mode} mode={mode} />}
                {method === 'nmr' && mode === 'reference' && <NMRShiftTable />}
                {method === 'nmr' && (mode === 'practice' || mode === 'problems') && <NMRInterpretationPractice key={mode} mode={mode} />}
                {method === 'ms'  && mode === 'reference' && <FragmentationTable />}
                {method === 'ms'  && (mode === 'practice' || mode === 'problems') && <MSInterpretationPractice key={mode} mode={mode} />}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Analysis sub-tabs */}
            <div
              className="flex items-center gap-1 p-1 rounded-sm border border-border w-fit print:hidden"
              style={{ background: 'rgb(var(--color-surface))' }}
            >
              {ANALYSIS_TABS.map(t => (
                <motion.button
                  key={t.id}
                  onClick={() => setAnalysisTabValue(t.id)}
                  className="px-3 py-1 rounded-sm text-xs font-sans font-medium transition-colors"
                  style={analysisTab === t.id ? PILL_ACTIVE : PILL_INACTIVE}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={analysisTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {analysisTab === 'upload'    && <SpectralUpload />}
                {analysisTab === 'combined'  && <CombinedSpectralPractice />}
                {analysisTab === 'estimator' && <SpectrumEstimator />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

      </div>

      <ExplanationModal
        content={isSpectroscopy ? SPECTROSCOPY_EXPLANATION : SPECTRAL_ANALYSIS_EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </PageShell>
  )
}

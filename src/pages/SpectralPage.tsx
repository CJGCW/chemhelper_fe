import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageShell from '../components/Layout/PageShell'
import IRCorrelationTable from '../components/spectral/IRCorrelationTable'
import NMRShiftTable from '../components/spectral/NMRShiftTable'
import FragmentationTable from '../components/spectral/FragmentationTable'
import SpectralUpload from '../components/spectral/SpectralUpload'
import IRInterpretationPractice from '../components/spectral/IRInterpretationPractice'
import NMRInterpretationPractice from '../components/spectral/NMRInterpretationPractice'
import MSInterpretationPractice from '../components/spectral/MSInterpretationPractice'
import CombinedSpectralPractice from '../components/spectral/CombinedSpectralPractice'
import SpectrumEstimator from '../components/spectral/SpectrumEstimator'

type Tab =
  | 'ref-ir' | 'ir-practice'
  | 'ref-hnmr' | 'ref-cnmr' | 'nmr-practice'
  | 'ref-ms' | 'ms-practice'
  | 'spectral-analysis' | 'combined-practice'
  | 'estimator'

const DEFAULT_TAB: Tab = 'ref-ir'

interface TabGroup {
  label: string
  tabs: { id: Tab; label: string; formula: string }[]
}

const TAB_GROUPS: TabGroup[] = [
  {
    label: 'IR Spectroscopy',
    tabs: [
      { id: 'ref-ir',      label: 'IR Reference',  formula: 'cm⁻¹' },
      { id: 'ir-practice', label: 'IR Practice',   formula: '…'    },
    ],
  },
  {
    label: 'NMR',
    tabs: [
      { id: 'ref-hnmr',    label: '¹H NMR',       formula: 'δ ppm' },
      { id: 'ref-cnmr',    label: '¹³C NMR',      formula: '13C'   },
      { id: 'nmr-practice', label: 'NMR Practice', formula: '…'    },
    ],
  },
  {
    label: 'Mass Spectrometry',
    tabs: [
      { id: 'ref-ms',      label: 'MS Reference', formula: 'm/z'  },
      { id: 'ms-practice', label: 'MS Practice',  formula: '…'    },
    ],
  },
  {
    label: 'Spectral Analysis',
    tabs: [
      { id: 'spectral-analysis',  label: 'Upload & Analyze',      formula: '↑'          },
      { id: 'combined-practice',  label: 'Combined Practice',      formula: 'IR+NMR+MS'  },
      { id: 'estimator',          label: 'Estimate from Structure', formula: 'draw→spec'  },
    ],
  },
]

const ALL_TABS = TAB_GROUPS.flatMap(g => g.tabs)

function tabLabel(id: Tab) {
  return ALL_TABS.find(t => t.id === id)?.label ?? id
}


export default function SpectralPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') ?? DEFAULT_TAB) as Tab

  function setTab(t: Tab) {
    setParams({ tab: t }, { replace: true })
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6">

        {/* Heading */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-bright">Spectroscopy</h2>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-col gap-3 print:hidden">
          {TAB_GROUPS.map(group => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-dim uppercase tracking-widest pl-1">{group.label}</span>
              <div className="flex flex-wrap gap-1.5">
                {group.tabs.map(t => {
                  const active = tab === t.id
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-medium border transition-colors"
                      style={active ? {
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                        borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                        color: 'var(--c-halogen)',
                      } : {
                        background: 'transparent',
                        borderColor: 'rgba(var(--overlay),0.15)',
                        color: 'rgb(var(--overlay)/0.5)',
                      }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}>
                      <span className="font-mono text-[9px]">{t.formula}</span>
                      {t.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}>

            {/* Heading */}
            <h3 className="font-sans font-semibold text-base text-primary mb-4">{tabLabel(tab)}</h3>

            {tab === 'ref-ir'           && <IRCorrelationTable />}
            {tab === 'ref-hnmr'         && <NMRShiftTable />}
            {tab === 'ref-cnmr'         && <NMRShiftTable />}
            {tab === 'ref-ms'           && <FragmentationTable />}
            {tab === 'spectral-analysis' && <SpectralUpload />}
            {tab === 'ir-practice'       && <IRInterpretationPractice />}
            {tab === 'nmr-practice'      && <NMRInterpretationPractice />}
            {tab === 'ms-practice'       && <MSInterpretationPractice />}
            {tab === 'combined-practice' && <CombinedSpectralPractice />}
            {tab === 'estimator'         && <SpectrumEstimator />}

          </motion.div>
        </AnimatePresence>
      </div>
    </PageShell>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { } from 'react'
import IdealGasReference from '../components/idealgas/IdealGasReference'
import IdealGasSolver from '../components/idealgas/IdealGasSolver'
import IdealGasPractice from '../components/idealgas/IdealGasPractice'
import GasStoichPractice from '../components/stoichiometry/GasStoichPractice'
import DaltonsLawCalc from '../components/idealgas/DaltonsLawCalc'
import GrahamsLawCalc from '../components/idealgas/GrahamsLawCalc'
import GasDensityCalc from '../components/idealgas/GasDensityCalc'
import DaltonsLawReference from '../components/idealgas/DaltonsLawReference'
import GrahamsLawReference from '../components/idealgas/GrahamsLawReference'
import GasDensityReference from '../components/idealgas/GasDensityReference'
import VanDerWaalsCalc from '../components/idealgas/VanDerWaalsCalc'
import VanDerWaalsReference from '../components/idealgas/VanDerWaalsReference'
import VanDerWaalsPractice from '../components/idealgas/VanDerWaalsPractice'
import DaltonsPractice from '../components/idealgas/DaltonsPractice'
import GrahamsPractice from '../components/idealgas/GrahamsPractice'
import GasDensityPractice from '../components/idealgas/GasDensityPractice'
import MaxwellBoltzmann from '../components/idealgas/MaxwellBoltzmann'

type Tab =
  // reference
  | 'ref-combined' | 'ref-daltons' | 'ref-grahams' | 'ref-density' | 'ref-vdw' | 'ref-maxwell'
  // practice
  | 'solver' | 'daltons' | 'grahams' | 'gas-density' | 'vdw'
  // problems
  | 'pvnrt-problems' | 'gas-stoich' | 'daltons-problems' | 'grahams-problems' | 'density-problems' | 'vdw-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'ref-laws',
    label: 'Gas Laws',
    pills: [
      { id: 'ref-combined', label: 'Combined Gas Law', formula: 'P₁V₁/T₁' },
      { id: 'ref-daltons',  label: "Dalton's Law",     formula: 'Ptot'     },
      { id: 'ref-grahams',  label: "Graham's Law",     formula: '√M'       },
      { id: 'ref-density',  label: 'Gas Density',      formula: 'ρ=PM/RT'  },
    ],
  },
  {
    id: 'ref-advanced',
    label: 'Real Gas & Distributions',
    pills: [
      { id: 'ref-vdw',     label: 'Van der Waals',     formula: 'vdW'  },
      { id: 'ref-maxwell', label: 'Maxwell-Boltzmann', formula: 'f(v)' },
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'practice-laws',
    label: 'Gas Laws',
    pills: [
      { id: 'solver',      label: 'PV = nRT',     formula: 'P,V,n,T' },
      { id: 'daltons',     label: "Dalton's Law", formula: 'Ptot'    },
      { id: 'grahams',     label: "Graham's Law", formula: '√M'      },
      { id: 'gas-density', label: 'Gas Density',  formula: 'ρ=PM/RT' },
    ],
  },
  {
    id: 'practice-advanced',
    label: 'Real Gas',
    pills: [
      { id: 'vdw', label: 'Van der Waals', formula: 'vdW' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'problems-laws',
    label: 'Gas Laws',
    pills: [
      { id: 'pvnrt-problems',   label: 'PV=nRT',       formula: 'P,V,n,T'  },
      { id: 'gas-stoich',       label: 'Gas Stoich',   formula: 'L→mol→g'  },
      { id: 'daltons-problems', label: "Dalton's Law", formula: 'Ptot'     },
      { id: 'grahams-problems', label: "Graham's Law", formula: '√M'       },
      { id: 'density-problems', label: 'Gas Density',  formula: 'ρ=PM/RT'  },
    ],
  },
  {
    id: 'problems-advanced',
    label: 'Real Gas',
    pills: [
      { id: 'vdw-problems', label: 'Van der Waals', formula: 'vdW' },
    ],
  },
]

const PRACTICE_TAB_IDS = new Set<Tab>(PRACTICE_GROUPS.flatMap(g => g.pills.map(p => p.id)))
const PROBLEMS_TAB_IDS = new Set<Tab>(PROBLEMS_GROUPS.flatMap(g => g.pills.map(p => p.id)))

export default function IdealGasPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-combined'

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
    if (mode === 'practice') setTab('solver')
    else if (mode === 'problems') setTab('pvnrt-problems')
    else setTab('ref-combined')
  }

  const activeGroups = activeMode === 'problems' ? PROBLEMS_GROUPS
    : activeMode === 'practice' ? PRACTICE_GROUPS
    : REFERENCE_GROUPS

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Ideal Gas Law</h2>
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
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="idealgas-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            )
          })}
        </div>

        {/* Sub-tab groups */}
        <div className="flex flex-col gap-3 print:hidden">
          {activeGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-2">
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {group.pills.map(pill => {
                  const isActive = activeTab === pill.id
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setTab(pill.id)}
                      className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="idealgas-tab-pill"
                          className="absolute inset-0 rounded-sm"
                          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{pill.label}</span>
                      <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{pill.formula}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ref-combined' && (
          <motion.div key="ref-combined"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IdealGasReference />
          </motion.div>
        )}
        {activeTab === 'ref-daltons' && (
          <motion.div key="ref-daltons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DaltonsLawReference />
          </motion.div>
        )}
        {activeTab === 'ref-grahams' && (
          <motion.div key="ref-grahams"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GrahamsLawReference />
          </motion.div>
        )}
        {activeTab === 'ref-density' && (
          <motion.div key="ref-density"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasDensityReference />
          </motion.div>
        )}
        {activeTab === 'ref-vdw' && (
          <motion.div key="ref-vdw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VanDerWaalsReference />
          </motion.div>
        )}
        {activeTab === 'ref-maxwell' && (
          <motion.div key="ref-maxwell"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MaxwellBoltzmann />
          </motion.div>
        )}
        {activeTab === 'solver' && (
          <motion.div key="solver"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IdealGasSolver />
          </motion.div>
        )}
        {activeTab === 'daltons' && (
          <motion.div key="daltons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DaltonsLawCalc />
          </motion.div>
        )}
        {activeTab === 'grahams' && (
          <motion.div key="grahams"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GrahamsLawCalc />
          </motion.div>
        )}
        {activeTab === 'gas-density' && (
          <motion.div key="gas-density"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasDensityCalc />
          </motion.div>
        )}
        {activeTab === 'vdw' && (
          <motion.div key="vdw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VanDerWaalsCalc />
          </motion.div>
        )}
        {activeTab === 'pvnrt-problems' && (
          <motion.div key="pvnrt-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IdealGasPractice />
          </motion.div>
        )}
        {activeTab === 'gas-stoich' && (
          <motion.div key="gas-stoich"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasStoichPractice />
          </motion.div>
        )}
        {activeTab === 'daltons-problems' && (
          <motion.div key="daltons-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DaltonsPractice />
          </motion.div>
        )}
        {activeTab === 'grahams-problems' && (
          <motion.div key="grahams-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GrahamsPractice />
          </motion.div>
        )}
        {activeTab === 'density-problems' && (
          <motion.div key="density-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <GasDensityPractice />
          </motion.div>
        )}
        {activeTab === 'vdw-problems' && (
          <motion.div key="vdw-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VanDerWaalsPractice />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

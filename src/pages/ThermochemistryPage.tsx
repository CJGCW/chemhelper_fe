import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CalorimetryCalc from '../components/thermo/CalorimetryCalc'
import CalorimetryPractice from '../components/thermo/CalorimetryPractice'
import CalorimetryReference from '../components/thermo/CalorimetryReference'
import EnthalpyCalc from '../components/thermo/EnthalpyCalc'
import EnthalpyPractice from '../components/thermo/EnthalpyPractice'
import EnthalpyReference from '../components/thermo/EnthalpyReference'
import HessCalc from '../components/thermo/HessCalc'
import HessPractice from '../components/thermo/HessPractice'
import HessReference from '../components/thermo/HessReference'
import BondEnthalpyCalc from '../components/thermo/BondEnthalpyCalc'
import BondEnthalpyPractice from '../components/thermo/BondEnthalpyPractice'
import BondEnthalpyReference from '../components/thermo/BondEnthalpyReference'
import EnergyDiagram from '../components/thermo/EnergyDiagram'
import HeatTransferCalc from '../components/thermo/HeatTransferCalc'
import HeatTransferPractice from '../components/thermo/HeatTransferPractice'
import HeatTransferReference from '../components/thermo/HeatTransferReference'
import HeatingCurveCalc from '../components/thermo/HeatingCurveCalc'
import PhaseDiagram from '../components/thermo/PhaseDiagram'

type Tab =
  | 'calorimetry'
  | 'calorimetry-practice'
  | 'calorimetry-reference'
  | 'enthalpy'
  | 'enthalpy-practice'
  | 'enthalpy-reference'
  | 'hess'
  | 'hess-practice'
  | 'hess-reference'
  | 'bond'
  | 'heating-curve'
  | 'phase-diagram'
  | 'bond-practice'
  | 'bond-reference'
  | 'profile'
  | 'heattransfer'
  | 'heattransfer-practice'
  | 'heattransfer-reference'

const SECTIONS = [
  {
    heading: 'Calorimetry',
    tabs: [
      { id: 'calorimetry'           as Tab, label: 'Calculator' },
      { id: 'calorimetry-practice'  as Tab, label: 'Practice'   },
      { id: 'calorimetry-reference' as Tab, label: 'Reference'  },
    ],
  },
  {
    heading: 'Enthalpy of Reaction',
    tabs: [
      { id: 'enthalpy'           as Tab, label: 'Calculator' },
      { id: 'enthalpy-practice'  as Tab, label: 'Practice'   },
      { id: 'enthalpy-reference' as Tab, label: 'Reference'  },
    ],
  },
  {
    heading: "Hess's Law",
    tabs: [
      { id: 'hess'           as Tab, label: 'Solver'    },
      { id: 'hess-practice'  as Tab, label: 'Practice'  },
      { id: 'hess-reference' as Tab, label: 'Reference' },
    ],
  },
  {
    heading: 'Bond Enthalpy',
    tabs: [
      { id: 'bond'           as Tab, label: 'Calculator' },
      { id: 'bond-practice'  as Tab, label: 'Practice'   },
      { id: 'bond-reference' as Tab, label: 'Reference'  },
    ],
  },
  {
    heading: 'Reaction Profiles',
    tabs: [
      { id: 'profile' as Tab, label: 'Visualizer' },
    ],
  },
  {
    heading: 'Heat Transfer',
    tabs: [
      { id: 'heattransfer'           as Tab, label: 'Calculator' },
      { id: 'heattransfer-practice'  as Tab, label: 'Practice'   },
      { id: 'heattransfer-reference' as Tab, label: 'Reference'  },
    ],
  },
  {
    heading: 'Heating Curves',
    tabs: [
      { id: 'heating-curve' as Tab, label: 'Calculator' },
    ],
  },
  {
    heading: 'Phase Diagrams',
    tabs: [
      { id: 'phase-diagram' as Tab, label: 'Interactive' },
    ],
  },
]

const DEFAULT_TAB: Tab = 'calorimetry'

export default function ThermochemistryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = (searchParams.get('tab') as Tab) ?? DEFAULT_TAB

  function setTab(t: Tab) {
    setSearchParams({ tab: t }, { replace: true })
  }

  const currentSection = SECTIONS.find(s => s.tabs.some(t => t.id === tab))

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Thermochemistry</h2>
          {tab.endsWith('-reference') && (
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
          {currentSection ? `${currentSection.heading} — Reference` : 'Thermochemistry Reference'}
        </h2>

        <div className="flex flex-col gap-2 print:hidden">
          {/* Section pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {SECTIONS.map(s => {
              const sectionActive = s.tabs.some(t => t.id === tab)
              return (
                <button key={s.heading}
                  onClick={() => setTab(s.tabs[0].id)}
                  className="relative px-4 py-1 rounded-full font-mono text-xs font-medium transition-colors"
                  style={{ color: sectionActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                  {sectionActive && (
                    <motion.div layoutId="thermo-section-switch" className="absolute inset-0 rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 10%, #0e1016)',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                  <span className="relative z-10">{s.heading}</span>
                </button>
              )
            })}
          </div>

          {/* Mode tabs */}
          {currentSection && currentSection.tabs.length > 1 && (
            <div className="flex items-center gap-1 p-1 rounded-full self-start"
              style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
              {currentSection.tabs.map(t => {
                const active = tab === t.id
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
                    style={{ color: active ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                    {active && (
                      <motion.div layoutId="thermo-mode-switch" className="absolute inset-0 rounded-full"
                        style={{
                          background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                          border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {tab === 'calorimetry'           && <CalorimetryCalc />}
          {tab === 'calorimetry-practice'  && <CalorimetryPractice />}
          {tab === 'calorimetry-reference' && <CalorimetryReference />}
          {tab === 'enthalpy'              && <EnthalpyCalc />}
          {tab === 'enthalpy-practice'     && <EnthalpyPractice />}
          {tab === 'enthalpy-reference'    && <EnthalpyReference />}
          {tab === 'hess'                  && <HessCalc />}
          {tab === 'hess-practice'         && <HessPractice />}
          {tab === 'hess-reference'        && <HessReference />}
          {tab === 'bond'                  && <BondEnthalpyCalc />}
          {tab === 'bond-practice'         && <BondEnthalpyPractice />}
          {tab === 'bond-reference'        && <BondEnthalpyReference />}
          {tab === 'profile'               && <EnergyDiagram />}
          {tab === 'heattransfer'           && <HeatTransferCalc />}
          {tab === 'heattransfer-practice'  && <HeatTransferPractice />}
          {tab === 'heattransfer-reference' && <HeatTransferReference />}
          {tab === 'heating-curve'          && <HeatingCurveCalc />}
          {tab === 'phase-diagram'          && <PhaseDiagram />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

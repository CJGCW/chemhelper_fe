import { useState, useEffect } from 'react'
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
import HeatingCurveProblems from '../components/thermo/HeatingCurveProblems'
import HeatingCurveReference from '../components/thermo/HeatingCurveReference'
import PhaseDiagram from '../components/thermo/PhaseDiagram'
import PhaseDiagramProblems from '../components/thermo/PhaseDiagramProblems'
import PhaseDiagramReference from '../components/thermo/PhaseDiagramReference'
import LiquidProperties from '../components/thermo/LiquidProperties'
import ClausiusClapeyronCalc from '../components/thermo/ClausiusClapeyronCalc'
import ClausiusClapeyronPractice from '../components/thermo/ClausiusClapeyronPractice'
import ClausiusClapeyronReference from '../components/thermo/ClausiusClapeyronReference'
import VaporPressureCalc from '../components/thermo/VaporPressureCalc'

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
  | 'heating-curve-problems'
  | 'heating-curve-reference'
  | 'phase-diagram'
  | 'phase-diagram-problems'
  | 'phase-diagram-reference'
  | 'liquid-props'
  | 'cc'
  | 'cc-practice'
  | 'cc-reference'
  | 'vapor-pressure'
  | 'bond-practice'
  | 'bond-reference'
  | 'profile'
  | 'heattransfer'
  | 'heattransfer-practice'
  | 'heattransfer-reference'

type Section = { heading: string; tabs: { id: Tab; label: string }[] }
type Group   = { id: string; label: string; sections: Section[] }

const GROUPS: Group[] = [
  {
    id: 'thermo',
    label: 'Thermochemistry',
    sections: [
      {
        heading: 'Calorimetry',
        tabs: [
          { id: 'calorimetry'           as Tab, label: 'Practice'  },
          { id: 'calorimetry-practice'  as Tab, label: 'Problems'  },
          { id: 'calorimetry-reference' as Tab, label: 'Reference' },
        ],
      },
      {
        heading: 'Enthalpy of Reaction',
        tabs: [
          { id: 'enthalpy'           as Tab, label: 'Practice'  },
          { id: 'enthalpy-practice'  as Tab, label: 'Problems'  },
          { id: 'enthalpy-reference' as Tab, label: 'Reference' },
        ],
      },
      {
        heading: "Hess's Law",
        tabs: [
          { id: 'hess'           as Tab, label: 'Practice'  },
          { id: 'hess-practice'  as Tab, label: 'Problems'  },
          { id: 'hess-reference' as Tab, label: 'Reference' },
        ],
      },
      {
        heading: 'Bond Enthalpy',
        tabs: [
          { id: 'bond'           as Tab, label: 'Practice'  },
          { id: 'bond-practice'  as Tab, label: 'Problems'  },
          { id: 'bond-reference' as Tab, label: 'Reference' },
        ],
      },
    ],
  },
  {
    id: 'heat-phase',
    label: 'Heat & Phase Changes',
    sections: [
      {
        heading: 'Reaction Profiles',
        tabs: [
          { id: 'profile' as Tab, label: 'Visualizer' },
        ],
      },
      {
        heading: 'Heat Transfer',
        tabs: [
          { id: 'heattransfer'           as Tab, label: 'Practice'  },
          { id: 'heattransfer-practice'  as Tab, label: 'Problems'  },
          { id: 'heattransfer-reference' as Tab, label: 'Reference' },
        ],
      },
      {
        heading: 'Heating Curves',
        tabs: [
          { id: 'heating-curve'           as Tab, label: 'Practice'  },
          { id: 'heating-curve-problems'  as Tab, label: 'Problems'  },
          { id: 'heating-curve-reference' as Tab, label: 'Reference' },
        ],
      },
    ],
  },
  {
    id: 'phase-behavior',
    label: 'Phase Behavior',
    sections: [
      {
        heading: 'Phase Diagrams',
        tabs: [
          { id: 'phase-diagram-reference' as Tab, label: 'Reference'   },
          { id: 'phase-diagram'           as Tab, label: 'Interactive' },
          { id: 'phase-diagram-problems'  as Tab, label: 'Problems'    },
        ],
      },
      {
        heading: 'Liquid Properties',
        tabs: [
          { id: 'liquid-props' as Tab, label: 'Reference' },
        ],
      },
      {
        heading: 'Clausius-Clapeyron',
        tabs: [
          { id: 'cc'             as Tab, label: 'Practice'       },
          { id: 'vapor-pressure' as Tab, label: 'Vapor Pressure' },
          { id: 'cc-practice'    as Tab, label: 'Problems'       },
          { id: 'cc-reference'   as Tab, label: 'Reference'      },
        ],
      },
    ],
  },
]

const ALL_SECTIONS = GROUPS.flatMap(g => g.sections)
const DEFAULT_TAB: Tab = 'calorimetry'

export default function ThermochemistryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = (searchParams.get('tab') as Tab) ?? DEFAULT_TAB

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = GROUPS.find(g => g.sections.some(s => s.tabs.some(t => t.id === tab)))
    return new Set(active ? [active.id] : ['thermo'])
  })

  useEffect(() => {
    const active = GROUPS.find(g => g.sections.some(s => s.tabs.some(t => t.id === tab)))
    if (active) {
      setOpenGroups(prev => {
        if (prev.has(active.id)) return prev
        const next = new Set(prev)
        next.add(active.id)
        return next
      })
    }
  }, [tab])

  function toggleGroup(id: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function setTab(t: Tab) {
    setSearchParams({ tab: t }, { replace: true })
  }

  const currentSection = ALL_SECTIONS.find(s => s.tabs.some(t => t.id === tab))

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

        <div className="flex flex-col gap-1.5 print:hidden">
          {GROUPS.map(group => {
            const isOpen = openGroups.has(group.id)
            const groupActive = group.sections.some(s => s.tabs.some(t => t.id === tab))
            return (
              <div key={group.id} className="flex flex-col gap-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="relative flex items-center self-start px-3 py-1.5 rounded-sm font-sans text-xs font-semibold transition-colors"
                  style={{ color: groupActive ? 'var(--c-halogen)' : isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
                >
                  {groupActive ? (
                    <motion.div
                      layoutId={`thermo-group-bg-${group.id}`}
                      className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-sm" style={{ background: '#0e1016', border: '1px solid #1c1f2e' }} />
                  )}
                  <span className="relative z-10">{group.label}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-1 flex-wrap pb-0.5">
                        {group.sections.map(s => {
                          const sectionActive = s.tabs.some(t => t.id === tab)
                          return (
                            <button key={s.heading}
                              onClick={() => setTab(s.tabs[0].id)}
                              className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                              style={{ color: sectionActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                              {sectionActive && (
                                <motion.div layoutId="thermo-section-pill" className="absolute inset-0 rounded-sm"
                                  style={{
                                    background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                                  }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                              )}
                              <span className="relative z-10">{s.heading}</span>
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}

          {/* Mode tabs for active section */}
          {currentSection && currentSection.tabs.length > 1 && (
            <div className="flex items-center gap-1 p-1 rounded-full self-start mt-1"
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
          {tab === 'heating-curve'           && <HeatingCurveCalc />}
          {tab === 'heating-curve-problems'  && <HeatingCurveProblems />}
          {tab === 'heating-curve-reference' && <HeatingCurveReference />}
          {tab === 'phase-diagram'           && <PhaseDiagram />}
          {tab === 'phase-diagram-problems'  && <PhaseDiagramProblems />}
          {tab === 'phase-diagram-reference' && <PhaseDiagramReference />}
          {tab === 'liquid-props'           && <LiquidProperties />}
          {tab === 'cc'                     && <ClausiusClapeyronCalc />}
          {tab === 'vapor-pressure'         && <VaporPressureCalc />}
          {tab === 'cc-practice'            && <ClausiusClapeyronPractice />}
          {tab === 'cc-reference'           && <ClausiusClapeyronReference />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
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
          { id: 'calorimetry-reference' as Tab, label: 'Reference' },
          { id: 'calorimetry'           as Tab, label: 'Practice'  },
          { id: 'calorimetry-practice'  as Tab, label: 'Problems'  },
        ],
      },
      {
        heading: 'Enthalpy of Reaction',
        tabs: [
          { id: 'enthalpy-reference' as Tab, label: 'Reference' },
          { id: 'enthalpy'           as Tab, label: 'Practice'  },
          { id: 'enthalpy-practice'  as Tab, label: 'Problems'  },
        ],
      },
      {
        heading: "Hess's Law",
        tabs: [
          { id: 'hess-reference' as Tab, label: 'Reference' },
          { id: 'hess'           as Tab, label: 'Practice'  },
          { id: 'hess-practice'  as Tab, label: 'Problems'  },
        ],
      },
      {
        heading: 'Bond Enthalpy',
        tabs: [
          { id: 'bond-reference' as Tab, label: 'Reference' },
          { id: 'bond'           as Tab, label: 'Practice'  },
          { id: 'bond-practice'  as Tab, label: 'Problems'  },
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
          { id: 'heattransfer-reference' as Tab, label: 'Reference' },
          { id: 'heattransfer'           as Tab, label: 'Practice'  },
          { id: 'heattransfer-practice'  as Tab, label: 'Problems'  },
        ],
      },
      {
        heading: 'Heating Curves',
        tabs: [
          { id: 'heating-curve-reference' as Tab, label: 'Reference' },
          { id: 'heating-curve'           as Tab, label: 'Practice'  },
          { id: 'heating-curve-problems'  as Tab, label: 'Problems'  },
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
        heading: 'Vapor Pressure',
        tabs: [
          { id: 'vapor-pressure' as Tab, label: 'Calculator' },
        ],
      },
      {
        heading: 'Clausius-Clapeyron',
        tabs: [
          { id: 'cc-reference' as Tab, label: 'Reference' },
          { id: 'cc'           as Tab, label: 'Practice'  },
          { id: 'cc-practice'  as Tab, label: 'Problems'  },
        ],
      },
    ],
  },
]

const ALL_SECTIONS = GROUPS.flatMap(g => g.sections)
const DEFAULT_TAB: Tab = 'calorimetry-reference'

const _EXP: Record<string, ExplanationContent> = {
  calorimetry: {
    title: 'Calorimetry',
    formula: 'q = mcΔT',
    formulaVars: [
      { symbol: 'q',  meaning: 'Heat transferred',       unit: 'J or kJ'    },
      { symbol: 'm',  meaning: 'Mass of substance',      unit: 'g'          },
      { symbol: 'c',  meaning: 'Specific heat capacity', unit: 'J/(g·°C)'   },
      { symbol: 'ΔT', meaning: 'Temperature change',     unit: '°C or K'    },
    ],
    description:
      'Calorimetry measures heat flow using the substance\'s mass, specific heat, and temperature change. ' +
      'q > 0 means heat is absorbed (endothermic); q < 0 means heat is released (exothermic). ' +
      'Water has c = 4.184 J/(g·°C) — its high value makes it an excellent heat reservoir.',
    example: {
      scenario: '50.0 g of water warms from 20.0°C to 45.0°C. How much heat was absorbed?',
      steps: ['ΔT = 45.0 − 20.0 = 25.0°C', 'q = mcΔT = 50.0 × 4.184 × 25.0', 'q = 5230 J'],
      result: 'q = 5230 J = 5.23 kJ',
    },
  },
  enthalpy: {
    title: 'Standard Enthalpy of Reaction',
    formula: 'ΔH°rxn = Σ ΔH°f(products) − Σ ΔH°f(reactants)',
    formulaVars: [
      { symbol: 'ΔH°rxn', meaning: 'Standard enthalpy of reaction',   unit: 'kJ'     },
      { symbol: 'ΔH°f',   meaning: 'Standard enthalpy of formation',  unit: 'kJ/mol' },
      { symbol: 'n',       meaning: 'Stoichiometric coefficient',       unit: '—'      },
    ],
    description:
      'The standard enthalpy of reaction equals the sum of formation enthalpies of products minus reactants, ' +
      'each multiplied by their stoichiometric coefficients. ' +
      'ΔH°f of any element in its standard state = 0 kJ/mol. Negative ΔH°rxn means exothermic.',
    example: {
      scenario: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g). ΔH°f: CH₄=−74.8, CO₂=−393.5, H₂O=−241.8 kJ/mol.',
      steps: [
        'ΔH°rxn = [ΔH°f(CO₂) + 2·ΔH°f(H₂O)] − [ΔH°f(CH₄) + 2·ΔH°f(O₂)]',
        'ΔH°rxn = [−393.5 + 2(−241.8)] − [−74.8 + 0]',
        'ΔH°rxn = −877.1 − (−74.8)',
      ],
      result: 'ΔH°rxn = −802.3 kJ',
    },
  },
  hess: {
    title: "Hess's Law",
    formula: 'ΔH°rxn = Σ ΔH°(steps)',
    formulaVars: [
      { symbol: 'ΔH°rxn', meaning: 'Target reaction enthalpy', unit: 'kJ'     },
      { symbol: 'ΔH°step', meaning: 'Enthalpy of each step',   unit: 'kJ/mol' },
    ],
    description:
      'Enthalpy is a state function — the total ΔH is independent of pathway. ' +
      'Combine known reactions by reversing (flip sign), scaling (multiply ΔH by coefficient), and adding ' +
      'to obtain the target reaction. Cancel species that appear on both sides.',
    example: {
      scenario: 'Find ΔH for C(s) + O₂(g) → CO₂(g) from: (1) C + ½O₂ → CO, ΔH=−110.5 kJ; (2) CO + ½O₂ → CO₂, ΔH=−283.0 kJ.',
      steps: ['Keep (1) as-is and (2) as-is', 'Add: C + O₂ → CO₂', 'ΔH = −110.5 + (−283.0)'],
      result: 'ΔH = −393.5 kJ',
    },
  },
  bond: {
    title: 'Bond Enthalpy',
    formula: 'ΔH°rxn ≈ Σ D(bonds broken) − Σ D(bonds formed)',
    formulaVars: [
      { symbol: 'D',    meaning: 'Bond dissociation energy', unit: 'kJ/mol' },
      { symbol: 'broken', meaning: 'Bonds in reactants',    unit: '—'       },
      { symbol: 'formed', meaning: 'Bonds in products',     unit: '—'       },
    ],
    description:
      'Estimate ΔH using average bond energies. Breaking bonds requires energy (+); forming bonds releases energy (−). ' +
      'This method uses average values and is less accurate than the ΔH°f method — use when formation data is unavailable.',
    example: {
      scenario: 'H₂(g) + Cl₂(g) → 2HCl(g). D(H−H)=432, D(Cl−Cl)=243, D(H−Cl)=432 kJ/mol.',
      steps: ['Broken: D(H−H) + D(Cl−Cl) = 432 + 243 = 675 kJ', 'Formed: 2×D(H−Cl) = 2×432 = 864 kJ', 'ΔH = 675 − 864'],
      result: 'ΔH ≈ −189 kJ',
    },
  },
  heattransfer: {
    title: 'Heat Transfer',
    formula: 'q_lost + q_gained = 0',
    formulaVars: [
      { symbol: 'q',  meaning: 'Heat (q = mcΔT for each object)', unit: 'J'        },
      { symbol: 'm',  meaning: 'Mass',                             unit: 'g'        },
      { symbol: 'c',  meaning: 'Specific heat',                    unit: 'J/(g·°C)' },
      { symbol: 'Tf', meaning: 'Final equilibrium temperature',    unit: '°C'       },
    ],
    description:
      'When two objects reach thermal equilibrium, energy is conserved: heat lost by the hotter object equals heat gained by the cooler one. ' +
      'Set up m₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0 and solve for Tf.',
    example: {
      scenario: '50.0 g iron (c = 0.449 J/g·°C) at 150°C placed into 100 g water (c = 4.184) at 20.0°C. Find Tf.',
      steps: [
        '50.0(0.449)(Tf − 150) + 100(4.184)(Tf − 20.0) = 0',
        '22.45Tf − 3367.5 + 418.4Tf − 8368 = 0',
        '440.85Tf = 11735.5',
      ],
      result: 'Tf = 26.6°C',
    },
  },
  'heating-curve': {
    title: 'Heating Curve',
    formula: 'qtotal = Σ mcΔT + Σ m·ΔHphase',
    formulaVars: [
      { symbol: 'mcΔT',    meaning: 'Heat for temperature change (sloped segments)', unit: 'J'     },
      { symbol: 'm·ΔHfus', meaning: 'Heat for melting (flat segment)',               unit: 'J'     },
      { symbol: 'm·ΔHvap', meaning: 'Heat for vaporisation (flat segment)',          unit: 'J'     },
    ],
    description:
      'A heating curve has alternating sloped segments (temperature rising, q = mcΔT) and flat segments ' +
      '(phase changes at constant temperature, q = m·ΔHfus or m·ΔHvap). ' +
      'Calculate each segment separately then add.',
    example: {
      scenario: 'Heat 10.0 g of ice from −10°C to steam at 110°C (water constants: c_ice=2.09, ΔHfus=334, c_liq=4.18, ΔHvap=2260, c_steam=2.01 J/g).',
      steps: [
        'q₁ = 10.0×2.09×10 = 209 J (ice warming)',
        'q₂ = 10.0×334 = 3340 J (melting)',
        'q₃ = 10.0×4.18×100 = 4180 J (water warming)',
        'q₄ = 10.0×2260 = 22600 J (vaporising)',
        'q₅ = 10.0×2.01×10 = 201 J (steam warming)',
      ],
      result: 'qtotal = 30530 J ≈ 30.5 kJ',
    },
  },
  cc: {
    title: 'Clausius-Clapeyron Equation',
    formula: 'ln(P₂/P₁) = −ΔHvap/R × (1/T₂ − 1/T₁)',
    formulaVars: [
      { symbol: 'P',       meaning: 'Vapour pressure (any consistent unit)', unit: 'atm or mmHg' },
      { symbol: 'T',       meaning: 'Temperature',                           unit: 'K'           },
      { symbol: 'ΔHvap',   meaning: 'Enthalpy of vaporisation',              unit: 'J/mol'       },
      { symbol: 'R',       meaning: 'Gas constant',                          unit: '8.314 J/mol·K' },
    ],
    description:
      'Relates vapour pressure to temperature through the enthalpy of vaporisation. ' +
      'Given two (P,T) points, solve for ΔHvap. Given one (P,T) point and ΔHvap, find P at a new temperature.',
    example: {
      scenario: 'Water: P₁ = 1.00 atm at T₁ = 373 K, ΔHvap = 40700 J/mol. Find P₂ at T₂ = 363 K.',
      steps: [
        'ln(P₂/1.00) = −(40700/8.314) × (1/363 − 1/373)',
        'ln(P₂) = −4894 × (7.38×10⁻⁵) = −0.361',
        'P₂ = e^(−0.361)',
      ],
      result: 'P₂ = 0.697 atm',
    },
  },
}

const EXPLANATIONS: Partial<Record<Tab, ExplanationContent>> = {
  'calorimetry':           _EXP.calorimetry,
  'calorimetry-reference': _EXP.calorimetry,
  'calorimetry-practice':  _EXP.calorimetry,
  'enthalpy':              _EXP.enthalpy,
  'enthalpy-reference':    _EXP.enthalpy,
  'enthalpy-practice':     _EXP.enthalpy,
  'hess':                  _EXP.hess,
  'hess-reference':        _EXP.hess,
  'hess-practice':         _EXP.hess,
  'bond':                  _EXP.bond,
  'bond-reference':        _EXP.bond,
  'bond-practice':         _EXP.bond,
  'heattransfer':          _EXP.heattransfer,
  'heattransfer-reference':_EXP.heattransfer,
  'heattransfer-practice': _EXP.heattransfer,
  'heating-curve':          _EXP['heating-curve'],
  'heating-curve-reference':_EXP['heating-curve'],
  'heating-curve-problems': _EXP['heating-curve'],
  'cc':                    _EXP.cc,
  'cc-reference':          _EXP.cc,
  'cc-practice':           _EXP.cc,
  'vapor-pressure':        _EXP.cc,
}

export default function ThermochemistryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const tab: Tab = (searchParams.get('tab') as Tab) ?? DEFAULT_TAB

  function setTab(t: Tab) {
    setSearchParams({ tab: t }, { replace: true })
  }

  const currentSection = ALL_SECTIONS.find(s => s.tabs.some(t => t.id === tab))
  const currentModeIdx = currentSection ? Math.max(0, currentSection.tabs.findIndex(t => t.id === tab)) : 0

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
          {EXPLANATIONS[tab] && (
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

        {/* Mode tabs for active section */}
        {currentSection && currentSection.tabs.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {currentSection.tabs.map(t => {
              const active = tab === t.id
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
                  style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                  {active && (
                    <motion.div layoutId="thermo-mode-switch" className="absolute inset-0 rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
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

        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-3 print:hidden">
          {GROUPS.map(group => (
            <div key={group.id} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
              style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {group.sections.map(s => {
                  const sectionActive = s.tabs.some(t => t.id === tab)
                  return (
                    <button key={s.heading}
                      onClick={() => setTab((s.tabs[currentModeIdx] ?? s.tabs[0]).id)}
                      className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{ color: sectionActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
                      {sectionActive && (
                        <motion.div layoutId={`thermo-pill-${group.id}`} className="absolute inset-0 rounded-sm"
                          style={{
                            background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                            border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                      )}
                      <span className="relative z-10">{s.heading}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
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

      {EXPLANATIONS[tab] && (
        <ExplanationModal
          content={EXPLANATIONS[tab]!}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

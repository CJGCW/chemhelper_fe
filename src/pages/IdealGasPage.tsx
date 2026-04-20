import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
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

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-combined': 'pvnrt', 'solver':          'pvnrt', 'pvnrt-problems':   'pvnrt',
  'ref-daltons':  'daltons', 'daltons':        'daltons', 'daltons-problems': 'daltons',
  'ref-grahams':  'grahams', 'grahams':        'grahams', 'grahams-problems': 'grahams',
  'ref-density':  'density', 'gas-density':    'density', 'density-problems': 'density',
  'ref-vdw':      'vdw',     'vdw':            'vdw',     'vdw-problems':     'vdw',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  pvnrt:   { reference: 'ref-combined', practice: 'solver',      problems: 'pvnrt-problems'   },
  daltons: { reference: 'ref-daltons',  practice: 'daltons',     problems: 'daltons-problems' },
  grahams: { reference: 'ref-grahams',  practice: 'grahams',     problems: 'grahams-problems' },
  density: { reference: 'ref-density',  practice: 'gas-density', problems: 'density-problems' },
  vdw:     { reference: 'ref-vdw',      practice: 'vdw',         problems: 'vdw-problems'     },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-combined',
  practice:  'solver',
  problems:  'pvnrt-problems',
}

const EXPLANATIONS: Partial<Record<Tab, ExplanationContent>> = {
  'ref-combined': {
    title: 'Ideal Gas Law',
    formula: 'PV = nRT',
    formulaVars: [
      { symbol: 'P', meaning: 'Pressure',         unit: 'atm (or kPa)'     },
      { symbol: 'V', meaning: 'Volume',            unit: 'L'                },
      { symbol: 'n', meaning: 'Amount of gas',     unit: 'mol'              },
      { symbol: 'R', meaning: 'Gas constant',      unit: '0.08206 L·atm/mol·K' },
      { symbol: 'T', meaning: 'Temperature',       unit: 'K'                },
    ],
    description:
      'The ideal gas law relates the four state variables of an ideal gas. Solve for any one variable by rearranging: ' +
      'P = nRT/V, V = nRT/P, n = PV/RT, T = PV/nR. Always convert temperature to Kelvin and use consistent units for R.',
    example: {
      scenario: '2.00 mol O₂ at 25.0°C in a 10.0 L container — find the pressure.',
      steps: ['T = 25.0 + 273 = 298 K', 'P = nRT / V = (2.00 × 0.08206 × 298) / 10.0', 'P = 48.91 / 10.0'],
      result: 'P = 4.89 atm',
    },
  },
  'ref-daltons': {
    title: "Dalton's Law of Partial Pressures",
    formula: 'Ptot = ΣPi    Pi = χi × Ptot',
    formulaVars: [
      { symbol: 'Ptot', meaning: 'Total pressure',  unit: 'atm'  },
      { symbol: 'Pi',   meaning: 'Partial pressure of gas i', unit: 'atm' },
      { symbol: 'χi',   meaning: 'Mole fraction of gas i',   unit: '—'   },
      { symbol: 'ni',   meaning: 'Moles of gas i',           unit: 'mol' },
    ],
    description:
      'In a gas mixture, each gas contributes a partial pressure as if it alone occupied the container. ' +
      'The total pressure is the sum of partial pressures. Mole fraction χi = ni / ntot, so Pi = χi × Ptot.',
    example: {
      scenario: '0.50 mol N₂, 0.30 mol O₂, and 0.20 mol Ar at a total pressure of 3.00 atm. Find P(N₂).',
      steps: ['ntot = 0.50 + 0.30 + 0.20 = 1.00 mol', 'χ(N₂) = 0.50 / 1.00 = 0.50', 'P(N₂) = 0.50 × 3.00'],
      result: 'P(N₂) = 1.50 atm',
    },
  },
  'ref-grahams': {
    title: "Graham's Law of Effusion",
    formula: 'r₁/r₂ = √(M₂/M₁)',
    formulaVars: [
      { symbol: 'r',  meaning: 'Effusion rate', unit: 'mol/s or relative' },
      { symbol: 'M',  meaning: 'Molar mass',    unit: 'g/mol'             },
    ],
    description:
      'Lighter gases effuse (escape through a tiny opening) faster than heavier ones. ' +
      'The ratio of effusion rates is inversely proportional to the square root of molar mass. ' +
      'Also used to compare diffusion rates or find an unknown molar mass.',
    example: {
      scenario: 'Compare the effusion rates of H₂ (M = 2.016 g/mol) and O₂ (M = 32.00 g/mol).',
      steps: ['r(H₂)/r(O₂) = √(M(O₂)/M(H₂))', 'r(H₂)/r(O₂) = √(32.00/2.016) = √15.87', 'r(H₂)/r(O₂) = 3.98'],
      result: 'H₂ effuses 3.98× faster than O₂',
    },
  },
  'ref-density': {
    title: 'Gas Density',
    formula: 'ρ = PM / RT',
    formulaVars: [
      { symbol: 'ρ', meaning: 'Density',        unit: 'g/L'              },
      { symbol: 'P', meaning: 'Pressure',       unit: 'atm'              },
      { symbol: 'M', meaning: 'Molar mass',     unit: 'g/mol'            },
      { symbol: 'R', meaning: 'Gas constant',   unit: '0.08206 L·atm/mol·K' },
      { symbol: 'T', meaning: 'Temperature',    unit: 'K'                },
    ],
    description:
      'Derived from PV = nRT and n = m/M: density ρ = PM/RT. ' +
      'Gas density increases with pressure and molar mass, and decreases with temperature. ' +
      'Rearranged: M = ρRT/P — useful for identifying an unknown gas from a measured density.',
    example: {
      scenario: 'Find the density of CO₂ (M = 44.01 g/mol) at STP (1.000 atm, 273.15 K).',
      steps: ['ρ = PM/RT = (1.000 × 44.01) / (0.08206 × 273.15)', 'ρ = 44.01 / 22.41'],
      result: 'ρ = 1.964 g/L',
    },
  },
  'ref-vdw': {
    title: 'Van der Waals Equation',
    formula: '(P + an²/V²)(V − nb) = nRT',
    formulaVars: [
      { symbol: 'a', meaning: 'Intermolecular attraction constant', unit: 'L²·atm/mol²' },
      { symbol: 'b', meaning: 'Excluded volume constant',           unit: 'L/mol'        },
      { symbol: 'n', meaning: 'Moles of gas',                       unit: 'mol'          },
      { symbol: 'P, V, T', meaning: 'Pressure, volume, temperature', unit: 'atm, L, K'  },
    ],
    description:
      'Corrects the ideal gas law for real gas behaviour. The an²/V² term accounts for ' +
      'intermolecular attractions (which reduce pressure); nb subtracts the volume excluded by gas molecules. ' +
      'Real gases deviate most at high pressure and low temperature.',
    example: {
      scenario: '2.00 mol CO₂ (a=3.640, b=0.04267) at 300 K in 5.00 L — find P.',
      steps: [
        'P = nRT/(V−nb) − an²/V²',
        'P = (2.00×0.08206×300)/(5.00−0.0853) − (3.640×4.00)/25.00',
        'P = 9.891 − 0.582',
      ],
      result: 'P = 9.31 atm  (ideal: 9.85 atm)',
    },
  },
  'ref-maxwell': {
    title: 'Maxwell-Boltzmann Distribution',
    formula: 'v_mp = √(2RT/M)   v_avg = √(8RT/πM)   v_rms = √(3RT/M)',
    formulaVars: [
      { symbol: 'v_mp',  meaning: 'Most probable speed',  unit: 'm/s' },
      { symbol: 'v_avg', meaning: 'Average speed',         unit: 'm/s' },
      { symbol: 'v_rms', meaning: 'Root-mean-square speed', unit: 'm/s' },
      { symbol: 'R',     meaning: 'Gas constant',          unit: '8.314 J/mol·K' },
      { symbol: 'T',     meaning: 'Temperature',           unit: 'K'   },
      { symbol: 'M',     meaning: 'Molar mass',            unit: 'kg/mol' },
    ],
    description:
      'Describes the distribution of molecular speeds in an ideal gas. Higher temperature or lower molar mass ' +
      'shifts the distribution to higher speeds and broadens it. ' +
      'The three characteristic speeds satisfy v_mp < v_avg < v_rms. Use M in kg/mol with R = 8.314 J/mol·K.',
    example: {
      scenario: 'Find v_rms for N₂ (M = 28.02 g/mol) at 25°C.',
      steps: ['T = 298 K,  M = 0.02802 kg/mol', 'v_rms = √(3RT/M) = √(3 × 8.314 × 298 / 0.02802)', 'v_rms = √(265 200)'],
      result: 'v_rms = 515 m/s',
    },
  },
  solver: {
    title: 'Ideal Gas Law',
    formula: 'PV = nRT',
    formulaVars: [
      { symbol: 'P', meaning: 'Pressure',         unit: 'atm (or kPa)'     },
      { symbol: 'V', meaning: 'Volume',            unit: 'L'                },
      { symbol: 'n', meaning: 'Amount of gas',     unit: 'mol'              },
      { symbol: 'R', meaning: 'Gas constant',      unit: '0.08206 L·atm/mol·K' },
      { symbol: 'T', meaning: 'Temperature',       unit: 'K'                },
    ],
    description:
      'The ideal gas law relates the four state variables of an ideal gas. Solve for any one variable by rearranging: ' +
      'P = nRT/V, V = nRT/P, n = PV/RT, T = PV/nR. Always convert temperature to Kelvin and use consistent units for R.',
    example: {
      scenario: '2.00 mol O₂ at 25.0°C in a 10.0 L container — find the pressure.',
      steps: ['T = 25.0 + 273 = 298 K', 'P = nRT / V = (2.00 × 0.08206 × 298) / 10.0', 'P = 48.91 / 10.0'],
      result: 'P = 4.89 atm',
    },
  },
  daltons: {
    title: "Dalton's Law of Partial Pressures",
    formula: 'Ptot = ΣPi    Pi = χi × Ptot',
    formulaVars: [
      { symbol: 'Ptot', meaning: 'Total pressure',  unit: 'atm'  },
      { symbol: 'Pi',   meaning: 'Partial pressure of gas i', unit: 'atm' },
      { symbol: 'χi',   meaning: 'Mole fraction of gas i',   unit: '—'   },
      { symbol: 'ni',   meaning: 'Moles of gas i',           unit: 'mol' },
    ],
    description:
      'In a gas mixture, each gas contributes a partial pressure as if it alone occupied the container. ' +
      'The total pressure is the sum of partial pressures. Mole fraction χi = ni / ntot, so Pi = χi × Ptot.',
    example: {
      scenario: '0.50 mol N₂, 0.30 mol O₂, and 0.20 mol Ar at a total pressure of 3.00 atm. Find P(N₂).',
      steps: ['ntot = 0.50 + 0.30 + 0.20 = 1.00 mol', 'χ(N₂) = 0.50 / 1.00 = 0.50', 'P(N₂) = 0.50 × 3.00'],
      result: 'P(N₂) = 1.50 atm',
    },
  },
  grahams: {
    title: "Graham's Law of Effusion",
    formula: 'r₁/r₂ = √(M₂/M₁)',
    formulaVars: [
      { symbol: 'r',  meaning: 'Effusion rate', unit: 'mol/s or relative' },
      { symbol: 'M',  meaning: 'Molar mass',    unit: 'g/mol'             },
    ],
    description:
      'Lighter gases effuse (escape through a tiny opening) faster than heavier ones. ' +
      'The ratio of effusion rates is inversely proportional to the square root of molar mass. ' +
      'Also used to compare diffusion rates or find an unknown molar mass.',
    example: {
      scenario: 'Compare the effusion rates of H₂ (M = 2.016 g/mol) and O₂ (M = 32.00 g/mol).',
      steps: ['r(H₂)/r(O₂) = √(M(O₂)/M(H₂))', 'r(H₂)/r(O₂) = √(32.00/2.016) = √15.87', 'r(H₂)/r(O₂) = 3.98'],
      result: 'H₂ effuses 3.98× faster than O₂',
    },
  },
  'gas-density': {
    title: 'Gas Density',
    formula: 'ρ = PM / RT',
    formulaVars: [
      { symbol: 'ρ', meaning: 'Density',        unit: 'g/L'              },
      { symbol: 'P', meaning: 'Pressure',       unit: 'atm'              },
      { symbol: 'M', meaning: 'Molar mass',     unit: 'g/mol'            },
      { symbol: 'R', meaning: 'Gas constant',   unit: '0.08206 L·atm/mol·K' },
      { symbol: 'T', meaning: 'Temperature',    unit: 'K'                },
    ],
    description:
      'Derived from PV = nRT and n = m/M: density ρ = PM/RT. ' +
      'Gas density increases with pressure and molar mass, and decreases with temperature. ' +
      'Rearranged: M = ρRT/P — useful for identifying an unknown gas from a measured density.',
    example: {
      scenario: 'Find the density of CO₂ (M = 44.01 g/mol) at STP (1.000 atm, 273.15 K).',
      steps: ['ρ = PM/RT = (1.000 × 44.01) / (0.08206 × 273.15)', 'ρ = 44.01 / 22.41'],
      result: 'ρ = 1.964 g/L',
    },
  },
  vdw: {
    title: 'Van der Waals Equation',
    formula: '(P + an²/V²)(V − nb) = nRT',
    formulaVars: [
      { symbol: 'a', meaning: 'Intermolecular attraction constant', unit: 'L²·atm/mol²' },
      { symbol: 'b', meaning: 'Excluded volume constant',           unit: 'L/mol'        },
      { symbol: 'n', meaning: 'Moles of gas',                       unit: 'mol'          },
      { symbol: 'P, V, T', meaning: 'Pressure, volume, temperature', unit: 'atm, L, K'  },
    ],
    description:
      'Corrects the ideal gas law for real gas behaviour. The an²/V² term accounts for ' +
      'intermolecular attractions (which reduce pressure); nb subtracts the volume excluded by gas molecules. ' +
      'Real gases deviate most at high pressure and low temperature.',
    example: {
      scenario: '2.00 mol CO₂ (a=3.640, b=0.04267) at 300 K in 5.00 L — find P.',
      steps: [
        'P = nRT/(V−nb) − an²/V²',
        'P = (2.00×0.08206×300)/(5.00−0.0853) − (3.640×4.00)/25.00',
        'P = 9.891 − 0.582',
      ],
      result: 'P = 9.31 atm  (ideal: 9.85 atm)',
    },
  },
}

export default function IdealGasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

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
    const topic = TAB_TO_TOPIC[activeTab]
    const next = (topic ? TOPIC_MODE_TAB[topic]?.[mode] : undefined) ?? MODE_DEFAULT[mode]
    setTab(next)
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
          {EXPLANATIONS[activeTab] && (
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
        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {isActive && (
                  <motion.div layoutId="idealgas-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Sub-tab groups */}
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-3 print:hidden">
          {activeGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
              style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {group.pills.map(pill => {
                  const isActive = activeTab === pill.id
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setTab(pill.id)}
                      className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="idealgas-tab-pill"
                          className="absolute inset-0 rounded-sm"
                          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
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

      {EXPLANATIONS[activeTab] && (
        <ExplanationModal
          content={EXPLANATIONS[activeTab]!}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

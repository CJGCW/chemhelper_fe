import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import RedoxPractice from '../components/redox/RedoxPractice'
import RedoxReference, { type RefTopic } from '../components/redox/RedoxReference'
import ReactionClassifier from '../components/tools/ReactionClassifier'
import ElectrolyteClassifier from '../components/tools/ElectrolyteClassifier'
import NetIonicTool from '../components/tools/NetIonicTool'
import ActivitySeries from '../components/tools/ActivitySeries'
import ReactionPredictor from '../components/tools/ReactionPredictor'
import EcellCalc from '../components/tools/EcellCalc'
import ReactionPredictorPractice from '../components/tools/ReactionPredictorPractice'
import EcellPractice from '../components/tools/EcellPractice'
import ReactionClassifierProblems from '../components/tools/ReactionClassifierProblems'
import ElectrolyteProblems from '../components/tools/ElectrolyteProblems'
import NetIonicProblems from '../components/tools/NetIonicProblems'
import ActivitySeriesProblems from '../components/tools/ActivitySeriesProblems'

type Tab = 'practice' | 'rxn-practice' | 'ecell-practice' | 'classifier' | 'electrolyte' | 'net-ionic' | 'activity' | 'predictor' | 'ecell' | 'reference' | 'redox-practice' | 'classifier-problems' | 'electrolyte-problems' | 'net-ionic-problems' | 'activity-problems'
  | 'ref-oxidation' | 'ref-reaction-types' | 'ref-activity' | 'ref-acids-bases' | 'ref-redox-concepts'
type Mode = 'reference' | 'practice' | 'problems'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'ref-oxidation',     label: 'Oxidation States', formula: 'ox'  },
  { id: 'ref-reaction-types', label: 'Rxn Types',       formula: '⇄'  },
  { id: 'ref-activity',      label: 'Activity Series',  formula: '↕'  },
  { id: 'ref-acids-bases',   label: 'Acids & Bases',    formula: 'pH' },
  { id: 'ref-redox-concepts', label: 'Redox',           formula: 'e⁻' },
]

const REF_TOPIC_MAP: Partial<Record<Tab, RefTopic>> = {
  'ref-oxidation':      'oxidation',
  'ref-reaction-types': 'reaction-types',
  'ref-activity':       'activity',
  'ref-acids-bases':    'acids-bases',
  'ref-redox-concepts': 'redox-concepts',
}

const REFERENCE_TAB_IDS = new Set<Tab>(REFERENCE_TABS.map(t => t.id))

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'reactions',
    label: 'Reactions',
    pills: [
      { id: 'classifier', label: 'Rxn Classifier', formula: '⇄' },
      { id: 'net-ionic',  label: 'Net Ionic',       formula: '⇌' },
      { id: 'predictor',  label: 'Rxn Predictor',   formula: '→' },
      { id: 'activity',   label: 'Activity Series', formula: '↕' },
    ],
  },
  {
    id: 'electrochemistry',
    label: 'Electrochemistry',
    pills: [
      { id: 'electrolyte',    label: 'Electrolyte',   formula: '⚡' },
      { id: 'redox-practice', label: 'Redox',         formula: 'e⁻' },
      { id: 'ecell',          label: 'E°cell / Nernst', formula: 'E°' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'reactions',
    label: 'Reactions',
    pills: [
      { id: 'classifier-problems', label: 'Rxn Type',     formula: '⇄' },
      { id: 'net-ionic-problems',  label: 'Net Ionic',    formula: '⇌' },
      { id: 'rxn-practice',        label: 'Rxn Predictor', formula: '→' },
      { id: 'activity-problems',   label: 'Activity',     formula: '↕' },
    ],
  },
  {
    id: 'electrochemistry',
    label: 'Electrochemistry',
    pills: [
      { id: 'electrolyte-problems', label: 'Electrolyte', formula: '⚡' },
      { id: 'practice',             label: 'Redox',       formula: 'e⁻' },
      { id: 'ecell-practice',       label: 'E°cell',      formula: 'E°' },
    ],
  },
]

const PRACTICE_TAB_IDS = new Set<Tab>(PRACTICE_GROUPS.flatMap(g => g.pills.map(p => p.id)))
const PROBLEMS_TAB_IDS = new Set<Tab>(PROBLEMS_GROUPS.flatMap(g => g.pills.map(p => p.id)))

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'predictor':             'rxn-predictor',
  'rxn-practice':          'rxn-predictor',
  'ecell':                 'ecell',
  'ecell-practice':        'ecell',
  'practice':              'redox',
  'redox-practice':        'redox',
  'classifier':            'classifier',
  'classifier-problems':   'classifier',
  'electrolyte':           'electrolyte',
  'electrolyte-problems':  'electrolyte',
  'net-ionic':             'net-ionic',
  'net-ionic-problems':    'net-ionic',
  'activity':              'activity',
  'activity-problems':     'activity',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'rxn-predictor': { practice: 'predictor',     problems: 'rxn-practice'          },
  'ecell':         { practice: 'ecell',          problems: 'ecell-practice'        },
  'redox':         { practice: 'redox-practice', problems: 'practice'              },
  'classifier':    { practice: 'classifier',     problems: 'classifier-problems'   },
  'electrolyte':   { practice: 'electrolyte',    problems: 'electrolyte-problems'  },
  'net-ionic':     { practice: 'net-ionic',       problems: 'net-ionic-problems'    },
  'activity':      { practice: 'activity',        problems: 'activity-problems'     },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-oxidation',
  practice:  'classifier',
  problems:  'practice',
}

const EXPLANATIONS: Partial<Record<Tab, ExplanationContent>> = {
  classifier: {
    title: 'Reaction Classification',
    formula: 'synthesis · decomposition · single-disp · double-disp · combustion',
    formulaVars: [
      { symbol: 'Synthesis',    meaning: 'A + B → AB  (two or more reactants → one product)',        unit: '≥2 → 1'       },
      { symbol: 'Decomp.',      meaning: 'AB → A + B  (one compound breaks into simpler products)',   unit: '1 → ≥2'       },
      { symbol: 'Single disp.', meaning: 'A + BC → AC + B  (element replaces element in compound)',  unit: 'check activity' },
      { symbol: 'Double disp.', meaning: 'AB + CD → AD + CB  (ions swap between two compounds)',     unit: 'ppt / gas / H₂O' },
      { symbol: 'Combustion',   meaning: 'fuel + O₂ → CO₂ + H₂O  (complete combustion)',            unit: 'exothermic'    },
    ],
    description:
      'Identify the reaction type by its structural pattern. Single displacement requires an element displacing an ion — check the activity series for feasibility. ' +
      'Double displacement (metathesis) usually forms a precipitate, gas, or water. Combustion burns a fuel with O₂ to produce CO₂ and H₂O.',
    example: {
      scenario: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)',
      steps: ['An element (Zn) displaces a metal ion (Cu²⁺) from solution', 'Zn is above Cu on the activity series'],
      result: 'Single displacement',
    },
  },
  'net-ionic': {
    title: 'Net Ionic Equations',
    formula: 'full → complete ionic → net ionic',
    formulaVars: [
      { symbol: 'aq', meaning: 'Dissolved ions — write dissociated', unit: 'ionic form'  },
      { symbol: 's, l, g', meaning: 'Keep as molecular formula',    unit: 'molecular'   },
      { symbol: 'spectator', meaning: 'Ions unchanged — cancel out', unit: 'cancel'      },
    ],
    description:
      'Write the full molecular equation, then split all soluble ionic compounds into their ions (complete ionic equation). ' +
      'Cancel spectator ions that appear identically on both sides. What remains is the net ionic equation, which shows only the actual chemical change.',
    example: {
      scenario: 'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)',
      steps: ['Complete ionic: Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s) + Na⁺ + NO₃⁻', 'Cancel Na⁺ and NO₃⁻ (spectators)'],
      result: 'Net ionic: Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',
    },
  },
  predictor: {
    title: 'Reaction Predictor',
    formula: 'reactants → products (precipitation, acid-base, redox)',
    formulaVars: [
      { symbol: 'solubility', meaning: 'Determines if a precipitate forms',    unit: 'solubility rules' },
      { symbol: 'activity',   meaning: 'Determines single-displacement outcome', unit: 'activity series' },
    ],
    description:
      'Predict products by identifying the reaction type: for ionic solutions, apply solubility rules to find precipitates. ' +
      'For single displacement, use the activity series. For combustion, produce CO₂ and H₂O. Balance the resulting equation.',
    example: {
      scenario: 'Mix Pb(NO₃)₂(aq) + KI(aq)',
      steps: ['Possible products: PbI₂ and KNO₃', 'Solubility: PbI₂ is insoluble (precipitates); KNO₃ is soluble'],
      result: 'Pb(NO₃)₂ + 2KI → PbI₂(s) + 2KNO₃',
    },
  },
  activity: {
    title: 'Activity Series',
    formula: 'more active metal displaces less active metal ion',
    formulaVars: [
      { symbol: 'activity ↑', meaning: 'Higher on series = more easily oxidised', unit: '— more reactive' },
      { symbol: 'M + M\'X', meaning: 'Reaction occurs if M is above M\' in series', unit: 'yes/no' },
    ],
    description:
      'The activity series ranks metals by their tendency to lose electrons (be oxidised). ' +
      'A metal higher on the list will displace a lower metal from its ionic solution. ' +
      'Metals above H₂ react with acids; only the most active react with water.',
    example: {
      scenario: 'Will Fe react with CuSO₄(aq)?',
      steps: ['Fe is above Cu in the activity series', 'Fe is more easily oxidised than Cu', 'Fe → Fe²⁺ + 2e⁻; Cu²⁺ + 2e⁻ → Cu'],
      result: 'Yes: Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
    },
  },
  electrolyte: {
    title: 'Electrolyte Classification',
    formula: 'strong → weak → non-electrolyte',
    formulaVars: [
      { symbol: 'strong',  meaning: 'Fully dissociates in water', unit: 'strong acids, strong bases, soluble salts' },
      { symbol: 'weak',    meaning: 'Partially dissociates',      unit: 'weak acids/bases'                         },
      { symbol: 'non',     meaning: 'Does not dissociate',        unit: 'molecular compounds (sugar, alcohols)'    },
    ],
    description:
      'Electrolytes conduct electricity in solution by producing ions. Strong electrolytes dissociate completely (100%). ' +
      'Weak electrolytes (weak acids/bases) exist mostly as molecules with a small fraction as ions. ' +
      'Non-electrolytes dissolve but produce no ions.',
    example: {
      scenario: 'Classify: HCl, CH₃COOH, glucose (C₆H₁₂O₆) in water.',
      steps: ['HCl → H⁺ + Cl⁻ completely: strong electrolyte', 'CH₃COOH ⇌ H⁺ + CH₃COO⁻ partially: weak electrolyte', 'Glucose dissolves intact: non-electrolyte'],
      result: 'HCl: strong · CH₃COOH: weak · glucose: non-electrolyte',
    },
  },
  'redox-practice': {
    title: 'Redox Reactions',
    formula: 'OA gains e⁻ (reduced) · RA loses e⁻ (oxidised)',
    formulaVars: [
      { symbol: 'OA', meaning: 'Oxidising agent — gains electrons, is reduced', unit: 'oxidation state ↓' },
      { symbol: 'RA', meaning: 'Reducing agent — loses electrons, is oxidised', unit: 'oxidation state ↑' },
    ],
    description:
      'Assign oxidation states to identify what is oxidised (ox. state increases) and what is reduced (ox. state decreases). ' +
      'Balance redox equations using the half-reaction method: split into oxidation and reduction half-reactions, balance atoms and charge, then combine.',
    example: {
      scenario: 'MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺ in acid — what is oxidised?',
      steps: ['Mn: +7 → +2 (decrease, reduced — MnO₄⁻ is the oxidising agent)', 'Fe: +2 → +3 (increase, oxidised — Fe²⁺ is the reducing agent)'],
      result: 'Fe²⁺ is oxidised; MnO₄⁻ is reduced',
    },
  },
  ecell: {
    title: 'E°cell and Nernst Equation',
    formula: 'E°cell = E°cathode − E°anode    E = E° − (0.05916/n) log Q',
    formulaVars: [
      { symbol: 'E°',  meaning: 'Standard cell potential', unit: 'V'            },
      { symbol: 'n',   meaning: 'Moles of electrons transferred', unit: 'mol'  },
      { symbol: 'Q',   meaning: 'Reaction quotient',        unit: '—'           },
      { symbol: 'R, F', meaning: 'Gas constant, Faraday constant', unit: 'J/mol·K, C/mol' },
    ],
    description:
      'E°cell = E°cathode − E°anode gives the cell potential under standard conditions (1 M, 1 atm, 25°C). ' +
      'The Nernst equation corrects for non-standard concentrations: at 25°C, E = E° − (0.05916/n)·log Q. ' +
      'Positive E°cell means spontaneous under standard conditions.',
    example: {
      scenario: 'Zn | Zn²⁺(0.10 M) || Cu²⁺(1.0 M) | Cu.  E°(Zn²⁺/Zn)=−0.763 V, E°(Cu²⁺/Cu)=+0.337 V.  n=2.',
      steps: [
        'E°cell = 0.337 − (−0.763) = 1.100 V',
        'Q = [Zn²⁺]/[Cu²⁺] = 0.10/1.0 = 0.10',
        'E = 1.100 − (0.05916/2)·log(0.10) = 1.100 + 0.0296',
      ],
      result: 'E = 1.130 V',
    },
  },
}

export default function RedoxPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [printingAll, setPrintingAll] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'classifier'

  const activeMode: Mode = PROBLEMS_TAB_IDS.has(activeTab) ? 'problems'
    : PRACTICE_TAB_IDS.has(activeTab) ? 'practice'
    : REFERENCE_TAB_IDS.has(activeTab) ? 'reference'
    : activeTab === 'reference' ? 'reference'
    : 'practice'

  const activeGroups = activeMode === 'problems' ? PROBLEMS_GROUPS : PRACTICE_GROUPS

  useEffect(() => {
    if (!printingAll) return
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
    const handler = () => setPrintingAll(false)
    window.addEventListener('afterprint', handler, { once: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('afterprint', handler)
    }
  }, [printingAll])

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

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Redox</h2>
          {activeMode === 'reference' && REF_TOPIC_MAP[activeTab] && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          {activeMode === 'reference' && (
            <button
              onClick={() => setPrintingAll(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print All</span>
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
        {/* Mode toggle switch */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(mode => {
            const isActive = activeMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="redox-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Reference sub-topic pills */}
        {activeMode === 'reference' && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {REFERENCE_TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setTab(tab.id)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                  {isActive && (
                    <motion.div layoutId="redox-ref-pill" className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{tab.formula}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Tab pills for active mode */}
        {activeMode !== 'reference' && (
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-3 print:hidden">
            {activeGroups.map(group => (
              <div key={group.id} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
                style={{ background: '#0a0c12', border: '1px solid #1c1f2e' }}>
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
                            layoutId="redox-pill-bg"
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
        )}
      </div>

      {/* Content */}
      {printingAll && <RedoxReference />}
      <AnimatePresence mode="wait">
        {(activeTab === 'practice' || activeTab === 'redox-practice') && !printingAll && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RedoxPractice />
          </motion.div>
        )}
        {activeTab === 'classifier' && (
          <motion.div key="classifier"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionClassifier />
          </motion.div>
        )}
        {activeTab === 'electrolyte' && (
          <motion.div key="electrolyte"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ElectrolyteClassifier />
          </motion.div>
        )}
        {activeTab === 'net-ionic' && (
          <motion.div key="net-ionic"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NetIonicTool />
          </motion.div>
        )}
        {activeTab === 'activity' && (
          <motion.div key="activity"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ActivitySeries />
          </motion.div>
        )}
        {activeTab === 'predictor' && (
          <motion.div key="predictor"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionPredictor />
          </motion.div>
        )}
        {activeTab === 'ecell' && (
          <motion.div key="ecell"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EcellCalc />
          </motion.div>
        )}
        {activeTab === 'rxn-practice' && (
          <motion.div key="rxn-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionPredictorPractice />
          </motion.div>
        )}
        {activeTab === 'ecell-practice' && (
          <motion.div key="ecell-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EcellPractice />
          </motion.div>
        )}
        {REF_TOPIC_MAP[activeTab] && !printingAll && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RedoxReference topic={REF_TOPIC_MAP[activeTab]} />
          </motion.div>
        )}
        {activeTab === 'classifier-problems' && (
          <motion.div key="classifier-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ReactionClassifierProblems />
          </motion.div>
        )}
        {activeTab === 'electrolyte-problems' && (
          <motion.div key="electrolyte-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ElectrolyteProblems />
          </motion.div>
        )}
        {activeTab === 'net-ionic-problems' && (
          <motion.div key="net-ionic-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NetIonicProblems />
          </motion.div>
        )}
        {activeTab === 'activity-problems' && (
          <motion.div key="activity-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ActivitySeriesProblems />
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

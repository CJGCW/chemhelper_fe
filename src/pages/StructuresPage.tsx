import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import LewisPage from './LewisPage'
import VseprPage from './VseprPage'
import LewisReference from '../components/lewis/LewisReference'
import VsepReference from '../components/vsepr/VsepReference'
import LewisStructurePractice from '../components/lewis/LewisStructurePractice'
import SigmaPiPractice from '../components/lewis/SigmaPiPractice'
import SigmaPiProblems from '../components/lewis/SigmaPiProblems'
import LewisDrawChallenge from '../components/lewis/LewisDrawChallenge'
import VseprPractice from '../components/vsepr/VseprPractice'
import SolidTypesReference from '../components/structures/SolidTypesReference'
import SolidTypesPractice from '../components/structures/SolidTypesPractice'
import UnitCellReference from '../components/structures/UnitCellReference'
import UnitCellPractice from '../components/structures/UnitCellPractice'
import SigmaPiReference from '../components/lewis/SigmaPiReference'
import FormalChargeTool from '../components/lewis/FormalChargeTool'
import PageShell from '../components/Layout/PageShell'


type Tab  = 'lewis' | 'vsepr' | 'solid-types' | 'unit-cell' | 'sigma-pi-ref' | 'lewis-practice' | 'lewis-draw' | 'vsepr-practice' | 'vsepr-draw' | 'sigma-pi' | 'sigma-pi-problems' | 'solid-types-practice' | 'solid-types-problems' | 'unit-cell-practice' | 'unit-cell-problems' | 'formal-charge' | 'formal-charge-problems'
type Mode = 'reference' | 'practice' | 'problems'

const REFERENCE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis',       label: 'Lewis Structures', formula: '⌬'          },
  { id: 'vsepr',       label: 'VSEPR',            formula: '⬡'          },
  { id: 'sigma-pi-ref', label: 'σ / π Bonds',    formula: 'σπ'          },
  { id: 'solid-types', label: 'Solid Types',      formula: '4t'          },
  { id: 'unit-cell',   label: 'Unit Cell',        formula: 'SC/BCC/FCC'  },
]

const PRACTICE_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis-practice',       label: 'Lewis',         formula: '⌬'        },
  { id: 'vsepr-practice',       label: 'VSEPR',         formula: '⬡'        },
  { id: 'sigma-pi',             label: 'σ / π Bonds',   formula: 'σπ'       },
  { id: 'formal-charge',        label: 'Formal Charge', formula: 'FC'       },
  { id: 'solid-types-practice', label: 'Solid Types',   formula: '4t'       },
  { id: 'unit-cell-practice',   label: 'Unit Cell',     formula: 'SC/BCC/FCC' },
]

const PROBLEMS_TABS: { id: Tab; label: string; formula: string }[] = [
  { id: 'lewis-draw',              label: 'Lewis',         formula: '⌬'        },
  { id: 'vsepr-draw',              label: 'VSEPR',         formula: '⬡'        },
  { id: 'sigma-pi-problems',       label: 'σ / π Bonds',   formula: 'σπ'       },
  { id: 'formal-charge-problems',  label: 'Formal Charge', formula: 'FC'       },
  { id: 'solid-types-problems',    label: 'Solid Types',   formula: '4t'       },
  { id: 'unit-cell-problems',      label: 'Unit Cell',     formula: 'SC/BCC/FCC' },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'lewis':                    'lewis',
  'lewis-practice':           'lewis',
  'lewis-draw':               'lewis',
  'vsepr':                    'vsepr',
  'vsepr-practice':           'vsepr',
  'vsepr-draw':               'vsepr',
  'sigma-pi-ref':             'sigma-pi',
  'sigma-pi':                 'sigma-pi',
  'sigma-pi-problems':        'sigma-pi',
  'formal-charge':            'formal-charge',
  'formal-charge-problems':   'formal-charge',
  'solid-types':              'solid-types',
  'solid-types-practice':     'solid-types',
  'solid-types-problems':     'solid-types',
  'unit-cell':                'unit-cell',
  'unit-cell-practice':       'unit-cell',
  'unit-cell-problems':       'unit-cell',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'lewis':         { reference: 'lewis',       practice: 'lewis-practice',       problems: 'lewis-draw'              },
  'vsepr':         { reference: 'vsepr',       practice: 'vsepr-practice',       problems: 'vsepr-draw'              },
  'sigma-pi':      { reference: 'sigma-pi-ref', practice: 'sigma-pi',             problems: 'sigma-pi-problems'       },
  'formal-charge': { reference: 'lewis',       practice: 'formal-charge',        problems: 'formal-charge-problems'  },
  'solid-types':   { reference: 'solid-types', practice: 'solid-types-practice', problems: 'solid-types-problems'    },
  'unit-cell':     { reference: 'unit-cell',   practice: 'unit-cell-practice',   problems: 'unit-cell-problems'      },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'lewis',
  practice:  'lewis-practice',
  problems:  'lewis-draw',
}

const EXPLANATIONS: Record<string, ExplanationContent> = {
  lewis: {
    title: 'Lewis Structures',
    formula: 'total valence e⁻ → bonds → lone pairs → formal charges',
    formulaVars: [
      { symbol: 'V',  meaning: 'Total valence electrons = sum of all atoms\' valence e⁻ (−1 per + charge, +1 per − charge)', unit: 'e⁻' },
      { symbol: 'FC', meaning: 'Formal charge = valence e⁻ − lone pair e⁻ − ½ bonding e⁻',                                   unit: 'integer' },
      { symbol: 'octet', meaning: 'Most atoms want 8 electrons around them; H and He need only 2',                            unit: '8 e⁻'    },
      { symbol: 'expanded', meaning: 'Period 3+ atoms can exceed an octet using d orbitals',                                  unit: '>8 e⁻'  },
    ],
    description:
      'Count all valence electrons. Connect atoms with single bonds using 2 e⁻ each. ' +
      'Complete octets on all terminal atoms first using lone pairs, then place remaining electrons on the central atom. ' +
      'If the central atom is short, convert lone pairs on adjacent atoms to double or triple bonds. ' +
      'Check formal charges — minimise them by preferring the structure where atoms have charges closest to zero.',
    example: {
      scenario: 'Draw the Lewis structure of CO₂.',
      steps: [
        'Valence e⁻: C(4) + 2×O(6) = 16 e⁻',
        'Two C–O single bonds use 4 e⁻; fill O octets with 6 e⁻ each (12 e⁻ total) — 0 e⁻ left for C',
        'C only has 4 e⁻ — convert 1 lone pair on each O to a C=O double bond',
        'C now has 8 e⁻; each O has 8 e⁻; formal charges all zero',
      ],
      result: 'O=C=O (2 double bonds, 2 lone pairs on each O)',
    },
  },
  vsepr: {
    title: 'VSEPR Theory',
    formula: 'steric number = bonding pairs + lone pairs → geometry',
    formulaVars: [
      { symbol: 'SN 2', meaning: '2 bonding + 0 lone → linear (180°)',                          unit: 'e.g. CO₂'  },
      { symbol: 'SN 3', meaning: '3+0 → trigonal planar · 2+1 → bent (~120°)',                  unit: 'BF₃ · SO₂' },
      { symbol: 'SN 4', meaning: '4+0 → tetrahedral · 3+1 → trig. pyramidal · 2+2 → bent',     unit: 'CH₄ · NH₃ · H₂O' },
      { symbol: 'SN 5', meaning: '5+0 → trig. bipyramidal · lone pairs fill equatorial sites',  unit: 'PCl₅ family' },
      { symbol: 'SN 6', meaning: '6+0 → octahedral · 5+1 → square pyramidal · 4+2 → square planar', unit: 'SF₆ family' },
    ],
    description:
      'Electron pairs — both bonding and lone — repel each other and adopt the arrangement that maximises angles between them. ' +
      'Determine the steric number (SN) = bonding pairs + lone pairs on the central atom. ' +
      'The electron geometry follows from SN; the molecular geometry is the same but ignores lone pairs. ' +
      'Lone pairs repel more strongly than bonding pairs, compressing bond angles by ~2° each.',
    example: {
      scenario: 'Predict the shape and bond angle of water (H₂O).',
      steps: [
        'O: 6 valence e⁻, forms 2 bonds → 2 bonding pairs + 2 lone pairs; SN = 4',
        'Electron geometry: tetrahedral (SN 4)',
        'Molecular geometry: bent (2 lone pairs not counted in shape)',
        '2 lone pairs compress angle: ideal 109.5° → actual ~104.5°',
      ],
      result: 'Bent molecular geometry, bond angle ≈ 104.5°',
    },
  },
  'sigma-pi': {
    title: 'Sigma & Pi Bonds',
    formula: 'single = 1σ  ·  double = 1σ+1π  ·  triple = 1σ+2π',
    formulaVars: [
      { symbol: 'σ',   meaning: 'End-to-end orbital overlap; present in every bond; allows free rotation', unit: 'per bond'    },
      { symbol: 'π',   meaning: 'Side-by-side p orbital overlap; restricts rotation; locks geometry',      unit: 'double/triple' },
      { symbol: 'sp³', meaning: '4 σ bonds, 0 π; tetrahedral; all single bonds',                           unit: '109.5°'     },
      { symbol: 'sp²', meaning: '3 σ bonds, 1 π; trigonal planar; one double bond',                        unit: '120°'       },
      { symbol: 'sp',  meaning: '2 σ bonds, 2 π; linear; one triple bond (or two double bonds)',           unit: '180°'       },
    ],
    description:
      'Every covalent bond contains exactly one σ bond formed by direct head-on orbital overlap. ' +
      'Additional bonds in a multiple bond are π bonds formed by parallel p orbital overlap. ' +
      'σ bonds allow rotation; π bonds create rigidity. ' +
      'Total σ bonds = number of bonds in the molecule. Total π bonds = (double bonds × 1) + (triple bonds × 2).',
    example: {
      scenario: 'Count σ and π bonds in acetylene, C₂H₂ (H–C≡C–H).',
      steps: [
        '2 C–H single bonds = 2σ',
        '1 C≡C triple bond = 1σ + 2π',
        'Total: 3σ + 2π',
        'Each C is sp hybridised (2 σ bonds each)',
      ],
      result: '3σ bonds, 2π bonds; both C atoms are sp hybridised',
    },
  },
  'solid-types': {
    title: 'Types of Solids',
    formula: 'ionic · metallic · molecular · network covalent',
    formulaVars: [
      { symbol: 'ionic',    meaning: 'Cation/anion lattice; electrostatic forces; high MP; brittle; conducts when molten', unit: 'NaCl, MgO'      },
      { symbol: 'metallic', meaning: 'Metal nuclei + delocalised e⁻ sea; conducts; malleable; variable MP',               unit: 'Fe, Cu, Al'     },
      { symbol: 'molecular', meaning: 'Discrete molecules held by IMFs (dispersion, dipole, H-bond); low MP; soft',       unit: 'ice, I₂, CO₂'  },
      { symbol: 'network',  meaning: 'Extended covalent lattice; extremely high MP; very hard; usually non-conductive',   unit: 'diamond, SiO₂' },
    ],
    description:
      'The properties of a solid—melting point, hardness, conductivity, solubility—are determined by what particles are in the lattice and how strongly they interact. ' +
      'Ionic and network covalent solids have the highest melting points. ' +
      'Metallic solids conduct electricity in all phases. ' +
      'Molecular solids have the lowest melting points and are held together only by intermolecular forces.',
    example: {
      scenario: 'Classify: NaCl, Fe, dry ice (CO₂), and diamond.',
      steps: [
        'NaCl: Na⁺ and Cl⁻ lattice → ionic solid',
        'Fe: metal atoms + delocalised electrons → metallic solid',
        'CO₂: discrete molecules, weak dispersion forces → molecular solid',
        'Diamond: C atoms in infinite covalent network → network covalent solid',
      ],
      result: 'NaCl ionic · Fe metallic · CO₂ molecular · diamond network covalent',
    },
  },
  'formal-charge': {
    title: 'Formal Charge',
    formula: 'FC = V − LP − bonds',
    formulaVars: [
      { symbol: 'V',    meaning: 'Valence electrons of the free atom',                           unit: 'e⁻'     },
      { symbol: 'LP',   meaning: 'Lone pair electrons on the atom in the structure (not pairs)', unit: 'e⁻'     },
      { symbol: 'bonds', meaning: 'Number of bonds to the atom (1 per bond, regardless of order)', unit: 'integer' },
    ],
    description:
      'Formal charge is a bookkeeping tool that shows how electron distribution in a Lewis structure compares to a free atom. ' +
      'It appears in Gen Chem when comparing resonance structures — the preferred structure minimises formal charges and places negative charges on the more electronegative atom. ' +
      'See the Lewis Structures reference tab for how formal charge fits into the full Lewis-drawing procedure.',
    example: {
      scenario: 'Find the formal charge on nitrogen in NH₄⁺.',
      steps: [
        'N valence electrons: 5',
        'Lone pairs on N in NH₄⁺: 0 (all lone pairs used in bonds)',
        'Bonds to N: 4 (four N–H bonds)',
        'FC = 5 − 0 − 4 = +1',
      ],
      result: 'FC on N = +1, consistent with the +1 overall charge of NH₄⁺',
    },
  },
  'unit-cell': {
    title: 'Unit Cells',
    formula: 'SC: 1 atom  ·  BCC: 2 atoms  ·  FCC: 4 atoms',
    formulaVars: [
      { symbol: 'SC',  meaning: '8 corners × 1/8 = 1 atom/cell; coord. no. = 6; APF = 52%',                   unit: 'simple cubic'  },
      { symbol: 'BCC', meaning: '8 corners × 1/8 + 1 body = 2 atoms/cell; coord. no. = 8; APF = 68%',         unit: 'body-centred'  },
      { symbol: 'FCC', meaning: '8 corners × 1/8 + 6 faces × 1/2 = 4 atoms/cell; coord. no. = 12; APF = 74%', unit: 'face-centred'  },
      { symbol: 'APF', meaning: 'Atomic packing fraction = (n × V_atom) / V_cell',                             unit: 'dimensionless' },
    ],
    description:
      'The unit cell is the smallest repeating unit of a crystal lattice. ' +
      'Corner atoms are shared among 8 adjacent cells (contributing 1/8 each), face atoms between 2 cells (1/2 each), and body-centre atoms belong to one cell. ' +
      'APF measures how efficiently space is filled; FCC and HCP are the most efficient common packings at 74%.',
    example: {
      scenario: 'Copper crystallises in FCC. How many atoms per unit cell? What is the coordination number?',
      steps: [
        '8 corner atoms × 1/8 = 1',
        '6 face atoms × 1/2 = 3',
        'Total = 4 atoms per unit cell',
        'Each Cu atom touches 4 face atoms in its own layer, 4 in the layer above, 4 below → 12 nearest neighbours',
      ],
      result: '4 atoms/unit cell; coordination number = 12; APF = 74%',
    },
  },
}

export default function StructuresPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const activeTab = (searchParams.get('tab') as Tab) ?? 'lewis'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  const { isTabVisible } = useTopicFilter()

  const visibleReferenceTabs = REFERENCE_TABS.filter(t => isTabVisible(t.id))
  const visiblePracticeTabs  = PRACTICE_TABS.filter(t => isTabVisible(t.id))
  const visibleProblemsTabs  = PROBLEMS_TABS.filter(t => isTabVisible(t.id))

  const visiblePracticeTabIds = new Set<Tab>(visiblePracticeTabs.map(t => t.id))
  const visibleProblemsTabIds = new Set<Tab>(visibleProblemsTabs.map(t => t.id))

  const allVisibleTabIds = [
    ...visibleReferenceTabs.map(t => t.id),
    ...visiblePracticeTabIds,
    ...visibleProblemsTabIds,
  ]
  const firstVisibleTab = allVisibleTabIds[0] as Tab | undefined
  const tabIsVisible = isTabVisible(activeTab)

  useEffect(() => {
    if (!tabIsVisible && firstVisibleTab !== undefined) setTab(firstVisibleTab)
  }, [tabIsVisible, firstVisibleTab])

  const activeMode: Mode = visibleProblemsTabIds.has(activeTab) ? 'problems'
    : visiblePracticeTabIds.has(activeTab) ? 'practice'
    : 'reference'

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    const topic = TAB_TO_TOPIC[activeTab]
    const next = (topic ? TOPIC_MODE_TAB[topic]?.[mode] : undefined) ?? MODE_DEFAULT[mode]
    setTab(next)
  }

  const visibleTabs = activeMode === 'problems' ? visibleProblemsTabs
    : activeMode === 'practice' ? visiblePracticeTabs
    : visibleReferenceTabs

  const activeTopic = TAB_TO_TOPIC[activeTab]
  const activeExplanation = activeTopic ? EXPLANATIONS[activeTopic] : undefined

  return (
    <PageShell>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Structures</h2>
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
          {activeExplanation && (
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
          {(['reference', 'practice', 'problems'] as Mode[]).map(mode => {
            const isActive = activeMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {isActive && (
                  <motion.div layoutId="structures-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{mode}</span>
              </button>
            )
          })}
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {visibleTabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
                {isActive && (
                  <motion.div layoutId="structures-tab-pill" className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{tab.formula}</span>
              </button>
            )
          })}
        </div>
      </div>

      {allVisibleTabIds.length === 0 && (
        <p className="font-sans text-sm text-dim py-8 text-center">
          No topics enabled —{' '}
          <Link to="/settings" className="text-secondary underline">visit Settings to configure</Link>.
        </p>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'lewis' && (
          <motion.div key="lewis"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="flex flex-col gap-8">
            <LewisPage embedded />
            <div className="border-t border-border pt-6">
              <LewisReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'vsepr' && (
          <motion.div key="vsepr"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="flex flex-col gap-8">
            <VseprPage />
            <div className="border-t border-border pt-6">
              <VsepReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'lewis-practice' && (
          <motion.div key="lewis-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LewisStructurePractice />
          </motion.div>
        )}
        {activeTab === 'lewis-draw' && (
          <motion.div key="lewis-draw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LewisDrawChallenge />
          </motion.div>
        )}
        {activeTab === 'vsepr-practice' && (
          <motion.div key="vsepr-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VseprPractice />
          </motion.div>
        )}
        {activeTab === 'vsepr-draw' && (
          <motion.div key="vsepr-draw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <VseprPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'solid-types' && (
          <motion.div key="solid-types"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolidTypesReference />
          </motion.div>
        )}
        {activeTab === 'sigma-pi-ref' && (
          <motion.div key="sigma-pi-ref"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SigmaPiReference />
          </motion.div>
        )}
        {activeTab === 'sigma-pi' && (
          <motion.div key="sigma-pi"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SigmaPiPractice />
          </motion.div>
        )}
        {activeTab === 'sigma-pi-problems' && (
          <motion.div key="sigma-pi-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SigmaPiProblems />
          </motion.div>
        )}
        {activeTab === 'formal-charge' && (
          <motion.div key="formal-charge"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FormalChargeTool allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'formal-charge-problems' && (
          <motion.div key="formal-charge-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FormalChargeTool allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'unit-cell' && (
          <motion.div key="unit-cell"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <UnitCellReference />
          </motion.div>
        )}
        {(activeTab === 'solid-types-practice' || activeTab === 'solid-types-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolidTypesPractice allowCustom={activeTab === 'solid-types-practice'} />
          </motion.div>
        )}
        {(activeTab === 'unit-cell-practice' || activeTab === 'unit-cell-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <UnitCellPractice allowCustom={activeTab === 'unit-cell-practice'} />
          </motion.div>
        )}
      </AnimatePresence>

      {activeExplanation && (
        <ExplanationModal
          content={activeExplanation}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </PageShell>
  )
}

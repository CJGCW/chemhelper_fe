import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import ExplanationModal from '../../components/calculations/ExplanationModal'
import type { ExplanationContent } from '../../components/calculations/ExplanationModal'
import MolesCalc from '../../components/calculations/MolesCalc'
import MolarityCalc from '../../components/calculations/MolarityCalc'
import MolalityCalc from '../../components/calculations/MolalityCalc'
import ColligativeCalc from '../../components/calculations/ColligativeCalc'
import MolarPractice from '../../components/calculations/MolarPractice'
import MolarReference, { type RefTopic } from '../../components/calculations/MolarReference'
import MolarVolumeCalc from '../../components/calculations/MolarVolumeCalc'
import PercentCompositionCalc from '../../components/calculations/PercentCompositionCalc'
import PercentCompositionPractice from '../../components/calculations/PercentCompositionPractice'
import SigFigPractice from '../../components/calculations/SigFigPractice'
import DilutionCalc from '../../components/calculations/DilutionCalc'
import ConcentrationConverter from '../../components/calculations/ConcentrationConverter'
import DilutionConcPractice from '../../components/calculations/DilutionConcPractice'
import { useState } from 'react'
import { HideExamplesContext } from '../../components/calculations/ExampleBoxContext'

type CalcType = 'moles' | 'molarity' | 'molality' | 'colligative' | 'colligative-bpe' | 'colligative-fpd' | 'molar-volume' | 'percent-comp' | 'dilution' | 'conc-converter' | 'practice' | 'perc-comp-practice' | 'sig-figs' | 'conc-practice' | 'reference' | 'visual' | 'ref-moles' | 'ref-molarity' | 'ref-molality' | 'ref-colligative' | 'ref-colligative-bpe' | 'ref-colligative-fpd' | 'ref-molar-volume' | 'ref-dilution' | 'ref-other'
type ColligativeMode = 'bpe' | 'fpd'
type Mode = 'reference' | 'practice' | 'problems'

type ReferencePill = { value: CalcType; label: string; formula: string }
type ReferenceGroup = { id: string; label: string; pills: ReferencePill[] }

const REFERENCE_GROUPS: ReferenceGroup[] = [
  {
    id: 'basic',
    label: 'Basic',
    pills: [
      { value: 'ref-moles',    label: 'Moles',    formula: 'n = m/M' },
      { value: 'ref-molarity', label: 'Molarity', formula: 'C = n/V' },
      { value: 'ref-molality', label: 'Molality', formula: 'b = n/m' },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    pills: [
      { value: 'ref-molar-volume', label: 'Molar Volume', formula: 'Vm'    },
      { value: 'ref-dilution',     label: 'Dilution',     formula: 'C₁V₁' },
      { value: 'ref-other',        label: 'More',         formula: '…'     },
    ],
  },
  {
    id: 'colligative',
    label: 'Colligative',
    pills: [
      { value: 'ref-colligative-bpe', label: 'BP Elevation',  formula: 'ΔTb' },
      { value: 'ref-colligative-fpd', label: 'FP Depression', formula: 'ΔTf' },
    ],
  },
]

// Topics that have animated visual counterparts
const VISUAL_TAB_IDS = new Set<CalcType>(['ref-moles', 'ref-molarity', 'ref-molality', 'ref-dilution', 'ref-colligative-bpe', 'ref-colligative-fpd'])

type PracticePill = { value: CalcType; label: string; formula: string }
type PracticeGroup = { id: string; label: string; pills: PracticePill[] }

const PRACTICE_GROUPS: PracticeGroup[] = [
  {
    id: 'basic',
    label: 'Basic',
    pills: [
      { value: 'moles',    label: 'Moles',    formula: 'n = m/M' },
      { value: 'molarity', label: 'Molarity', formula: 'C = n/V' },
      { value: 'molality', label: 'Molality', formula: 'b = n/m' },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    pills: [
      { value: 'molar-volume',   label: 'Molar Volume',  formula: 'V = nVm' },
      { value: 'percent-comp',   label: '% Composition', formula: '% m'     },
      { value: 'dilution',       label: 'Dilution',      formula: 'C₁V₁'   },
      { value: 'conc-converter', label: 'Conc. Units',   formula: '↔'      },
    ],
  },
  {
    id: 'colligative',
    label: 'Colligative',
    pills: [
      { value: 'colligative-bpe', label: 'BP Elevation',  formula: 'ΔTb' },
      { value: 'colligative-fpd', label: 'FP Depression', formula: 'ΔTf' },
    ],
  },
]

const PROBLEMS_PILLS: { value: CalcType; label: string; formula: string }[] = [
  { value: 'practice',          label: 'Molar',           formula: 'n/V/b'   },
  { value: 'perc-comp-practice',label: '% Composition',   formula: '% m'     },
  { value: 'conc-practice',     label: 'Dilution & Conc', formula: 'C₁V₁/w%' },
  { value: 'sig-figs',          label: 'Sig Figs',        formula: 'sf'      },
]

const PRACTICE_TAB_IDS = new Set<CalcType>([
  ...PRACTICE_GROUPS.flatMap(g => g.pills.map(p => p.value)),
  'colligative', // backwards compat
])
const PROBLEMS_TAB_IDS = new Set<CalcType>(PROBLEMS_PILLS.map(p => p.value))

const TAB_TO_TOPIC: Partial<Record<CalcType, string>> = {
  'ref-moles':          'moles',        'moles':          'moles',
  'ref-molarity':       'molarity',     'molarity':       'molarity',
  'ref-molality':       'molality',     'molality':       'molality',
  'ref-molar-volume':   'molar-volume', 'molar-volume':   'molar-volume',
  'ref-dilution':       'dilution',     'dilution':       'dilution',     'conc-practice': 'dilution',
  'ref-other':          'conc-cvt',     'conc-converter': 'conc-cvt',
  'ref-colligative-bpe':'collig-bpe',   'colligative-bpe':'collig-bpe',
  'ref-colligative-fpd':'collig-fpd',   'colligative-fpd':'collig-fpd',
  'percent-comp':       'pct-comp',     'perc-comp-practice': 'pct-comp',
  'practice':           'moles',        // problems default maps back to moles
  'sig-figs':           'sig-figs',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, CalcType>>> = {
  'moles':       { reference: 'ref-moles',          practice: 'moles',          problems: 'practice'          },
  'molarity':    { reference: 'ref-molarity',        practice: 'molarity',       problems: 'practice'          },
  'molality':    { reference: 'ref-molality',        practice: 'molality',       problems: 'practice'          },
  'molar-volume':{ reference: 'ref-molar-volume',    practice: 'molar-volume',   problems: 'practice'          },
  'dilution':    { reference: 'ref-dilution',        practice: 'dilution',       problems: 'conc-practice'     },
  'conc-cvt':    { reference: 'ref-other',           practice: 'conc-converter', problems: 'conc-practice'     },
  'pct-comp':    { reference: 'ref-other',           practice: 'percent-comp',   problems: 'perc-comp-practice'},
  'collig-bpe':  { reference: 'ref-colligative-bpe', practice: 'colligative-bpe',problems: 'practice'          },
  'collig-fpd':  { reference: 'ref-colligative-fpd', practice: 'colligative-fpd',problems: 'practice'          },
  'sig-figs':    { problems: 'sig-figs' },
}

const MODE_DEFAULT: Record<Mode, CalcType> = {
  reference: 'ref-moles',
  practice:  'moles',
  problems:  'practice',
}

// Shared content objects — reused across reference, practice, and problems tabs
const _EXP: Record<string, ExplanationContent> = {
  moles: {
    title: 'Mole Calculations',
    formula: 'n = m / M',
    formulaVars: [
      { symbol: 'n', meaning: 'Amount of substance', unit: 'mol'   },
      { symbol: 'm', meaning: 'Mass of substance',   unit: 'g'     },
      { symbol: 'M', meaning: 'Molar mass',          unit: 'g/mol' },
    ],
    description:
      'The mole (mol) is the SI unit for amount of substance — 6.022×10²³ particles. ' +
      'Divide the mass by the molar mass to get moles; multiply moles by molar mass to get grams. ' +
      'Molar mass equals the atomic/formula mass in g/mol.',
    example: {
      scenario: 'How many moles are in 45.0 g of water (M = 18.02 g/mol)?',
      steps: ['n = m / M = 45.0 g ÷ 18.02 g/mol', 'n = 2.498 mol'],
      result: 'n = 2.50 mol (3 sf)',
    },
  },
  molarity: {
    title: 'Molarity',
    formula: 'C = n / V',
    formulaVars: [
      { symbol: 'C', meaning: 'Molar concentration', unit: 'mol/L' },
      { symbol: 'n', meaning: 'Moles of solute',     unit: 'mol'   },
      { symbol: 'V', meaning: 'Volume of solution',  unit: 'L'     },
    ],
    description:
      'Molarity (C) expresses moles of solute per litre of solution — not per litre of solvent. ' +
      'Rearrange to find n = C·V or V = n/C. Always convert volumes to litres before calculating.',
    example: {
      scenario: '5.85 g NaCl (M = 58.44 g/mol) dissolved to make 250.0 mL of solution. Find C.',
      steps: ['n = 5.85 / 58.44 = 0.1001 mol', 'C = n / V = 0.1001 / 0.2500'],
      result: 'C = 0.4003 mol/L',
    },
  },
  molality: {
    title: 'Molality',
    formula: 'b = n / m_solvent',
    formulaVars: [
      { symbol: 'b', meaning: 'Molality',            unit: 'mol/kg' },
      { symbol: 'n', meaning: 'Moles of solute',     unit: 'mol'    },
      { symbol: 'm', meaning: 'Mass of solvent',     unit: 'kg'     },
    ],
    description:
      'Molality (b) uses mass of solvent rather than volume of solution, making it temperature-independent. ' +
      'Used in colligative property calculations (ΔTb, ΔTf). ' +
      'Convert solvent mass to kg: divide grams by 1000.',
    example: {
      scenario: '10.0 g glucose (M = 180.2 g/mol) dissolved in 200.0 g of water. Find b.',
      steps: ['n = 10.0 / 180.2 = 0.05549 mol', 'b = n / m = 0.05549 mol / 0.2000 kg'],
      result: 'b = 0.277 mol/kg',
    },
  },
  'molar-volume': {
    title: 'Molar Volume',
    formula: 'V = n × Vm',
    formulaVars: [
      { symbol: 'V',  meaning: 'Volume of gas',  unit: 'L'     },
      { symbol: 'n',  meaning: 'Moles of gas',   unit: 'mol'   },
      { symbol: 'Vm', meaning: 'Molar volume',   unit: 'L/mol' },
    ],
    description:
      'At standard conditions, one mole of any ideal gas occupies the molar volume. ' +
      'STP (0°C, 1 atm): Vm = 22.414 L/mol. SATP (25°C, 100 kPa): Vm = 24.789 L/mol. ' +
      'Rearrange to find n = V / Vm.',
    example: {
      scenario: 'What volume does 3.00 mol of O₂ occupy at STP?',
      steps: ['V = n × Vm = 3.00 mol × 22.414 L/mol'],
      result: 'V = 67.2 L',
    },
  },
  'percent-comp': {
    title: 'Percent Composition',
    formula: '% element = (mass of element / molar mass) × 100',
    formulaVars: [
      { symbol: '%',  meaning: 'Mass percent of element',     unit: '%'     },
      { symbol: 'M_element', meaning: 'Mass of element in 1 mol formula', unit: 'g/mol' },
      { symbol: 'M_formula', meaning: 'Molar mass of compound', unit: 'g/mol' },
    ],
    description:
      'Percent composition gives the mass fraction of each element in a compound. ' +
      'Multiply element\'s atomic mass by its subscript, divide by the formula\'s molar mass, multiply by 100. ' +
      'All element percentages in a compound must sum to 100%.',
    example: {
      scenario: 'Find the % composition of H₂O (M = 18.02 g/mol).',
      steps: ['%H = (2 × 1.008 / 18.02) × 100 = 11.19%', '%O = (16.00 / 18.02) × 100 = 88.81%'],
      result: '%H = 11.19%, %O = 88.81%',
    },
  },
  dilution: {
    title: 'Dilution',
    formula: 'C₁V₁ = C₂V₂',
    formulaVars: [
      { symbol: 'C₁', meaning: 'Initial concentration', unit: 'mol/L'    },
      { symbol: 'V₁', meaning: 'Initial volume',         unit: 'L or mL' },
      { symbol: 'C₂', meaning: 'Final concentration',   unit: 'mol/L'    },
      { symbol: 'V₂', meaning: 'Final volume',           unit: 'L or mL' },
    ],
    description:
      'Dilution adds solvent to reduce concentration while keeping moles of solute constant (n = C·V). ' +
      'C₁V₁ = C₂V₂ — rearrange to find any unknown. Units of volume can be mL as long as they match on both sides.',
    example: {
      scenario: 'Dilute 25.0 mL of 6.00 M HCl to a final volume of 150.0 mL. Find C₂.',
      steps: ['C₂ = C₁V₁ / V₂ = (6.00 × 25.0) / 150.0'],
      result: 'C₂ = 1.00 mol/L',
    },
  },
  'conc-converter': {
    title: 'Concentration Unit Interconversions',
    formula: 'C ↔ w% ↔ b ↔ χ ↔ ppm',
    formulaVars: [
      { symbol: 'C',   meaning: 'Molarity',                        unit: 'mol/L'  },
      { symbol: 'w%',  meaning: 'Mass percent',                    unit: '% w/w'  },
      { symbol: 'b',   meaning: 'Molality',                        unit: 'mol/kg' },
      { symbol: 'χ',   meaning: 'Mole fraction',                   unit: '—'      },
      { symbol: 'ppm', meaning: 'Parts per million (dilute aq.)',  unit: 'mg/L'   },
    ],
    description:
      'All concentration units express amount of solute per amount of solution or solvent, but use different bases. ' +
      'Key interconversions require density (ρ, g/mL) and molar mass (M, g/mol). ' +
      'C = (w% × ρ × 10) / M   ·   b = (C × 1000) / (ρ × 1000 − C × M).',
    example: {
      scenario: 'Conc. HCl: 37.0% (w/w), ρ = 1.19 g/mL, M = 36.46 g/mol. Find C.',
      steps: ['C = (37.0 × 1.19 × 10) / 36.46 = 440.3 / 36.46'],
      result: 'C ≈ 12.1 mol/L',
    },
  },
  'colligative-bpe': {
    title: 'Boiling Point Elevation',
    formula: 'ΔTb = i · Kb · b',
    formulaVars: [
      { symbol: 'ΔTb', meaning: 'Boiling point elevation',  unit: '°C'        },
      { symbol: 'i',   meaning: "Van't Hoff factor",         unit: '—'         },
      { symbol: 'Kb',  meaning: 'Ebullioscopic constant',   unit: '°C·kg/mol' },
      { symbol: 'b',   meaning: 'Molality',                  unit: 'mol/kg'    },
    ],
    description:
      'Dissolved solute particles reduce the vapour pressure of the solvent, requiring a higher temperature to boil. ' +
      'i accounts for dissociation: NaCl → 2 ions (i≈2), glucose stays molecular (i=1). ' +
      'New boiling point = normal b.p. + ΔTb.',
    example: {
      scenario: '1.00 mol/kg NaCl (i=2) in water (Kb = 0.512 °C·kg/mol). Find ΔTb.',
      steps: ['ΔTb = i × Kb × b = 2 × 0.512 × 1.00', 'New b.p. = 100.0 + 1.024'],
      result: 'ΔTb = 1.024 °C → b.p. = 101.024°C',
    },
  },
  'colligative-fpd': {
    title: 'Freezing Point Depression',
    formula: 'ΔTf = i · Kf · b',
    formulaVars: [
      { symbol: 'ΔTf', meaning: 'Freezing point depression', unit: '°C'        },
      { symbol: 'i',   meaning: "Van't Hoff factor",          unit: '—'         },
      { symbol: 'Kf',  meaning: 'Cryoscopic constant',        unit: '°C·kg/mol' },
      { symbol: 'b',   meaning: 'Molality',                   unit: 'mol/kg'    },
    ],
    description:
      'Solute particles disrupt the crystal lattice that forms when the solvent freezes, lowering the freezing point. ' +
      'i accounts for dissociation. ' +
      'New freezing point = normal f.p. − ΔTf.',
    example: {
      scenario: '0.50 mol/kg glucose (i=1) in water (Kf = 1.86 °C·kg/mol). Find ΔTf.',
      steps: ['ΔTf = 1 × 1.86 × 0.50 = 0.93°C', 'New f.p. = 0.0 − 0.93'],
      result: 'ΔTf = 0.93°C → f.p. = −0.93°C',
    },
  },
  'sig-figs': {
    title: 'Significant Figures',
    formula: 'result sf = fewest sf in inputs',
    formulaVars: [
      { symbol: '×÷', meaning: 'Multiply/divide → match fewest sf in inputs', unit: 'count sf' },
      { symbol: '±',  meaning: 'Add/subtract → match fewest decimal places',  unit: 'decimal places' },
    ],
    description:
      'Sig figs reflect measurement precision. Non-zero digits always count; zeros between non-zeros count; ' +
      'trailing zeros after a decimal count; leading zeros never count. ' +
      'For × and ÷, round the result to the fewest sig figs of any input. For + and −, round to the fewest decimal places.',
    example: {
      scenario: '12.5 × 1.23 = ?',
      steps: ['12.5 has 3 sf; 1.23 has 3 sf', 'Result: 15.375 → round to 3 sf'],
      result: '15.4',
    },
  },
}

const EXPLANATIONS: Partial<Record<CalcType, ExplanationContent>> = {
  // Practice tabs
  'moles':           _EXP.moles,
  'molarity':        _EXP.molarity,
  'molality':        _EXP.molality,
  'molar-volume':    _EXP['molar-volume'],
  'percent-comp':    _EXP['percent-comp'],
  'dilution':        _EXP.dilution,
  'conc-converter':  _EXP['conc-converter'],
  'colligative-bpe': _EXP['colligative-bpe'],
  'colligative-fpd': _EXP['colligative-fpd'],
  'colligative':     _EXP['colligative-bpe'],  // backwards compat
  // Reference tabs — same content
  'ref-moles':           _EXP.moles,
  'ref-molarity':        _EXP.molarity,
  'ref-molality':        _EXP.molality,
  'ref-molar-volume':    _EXP['molar-volume'],
  'ref-dilution':        _EXP.dilution,
  'ref-other':           _EXP['conc-converter'],
  'ref-colligative-bpe': _EXP['colligative-bpe'],
  'ref-colligative-fpd': _EXP['colligative-fpd'],
  // Problems tabs
  'practice':           _EXP.moles,
  'perc-comp-practice': _EXP['percent-comp'],
  'conc-practice':      _EXP.dilution,
  'sig-figs':           _EXP['sig-figs'],
}

// Map ref-* tab values to RefTopic
const REF_TOPIC_MAP: Partial<Record<CalcType, RefTopic>> = {
  'ref-moles':        'moles',
  'ref-molarity':     'molarity',
  'ref-molality':     'molality',
  'ref-colligative':     'colligative',
  'ref-colligative-bpe': 'colligative-bpe',
  'ref-colligative-fpd': 'colligative-fpd',
  'ref-molar-volume': 'molar-volume',
  'ref-dilution':     'dilution',
  'ref-other':        'other',
}

export default function MolarCalculationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)
  const [printingAll, setPrintingAll] = useState(false)

  const activeTab = (searchParams.get('tab') as CalcType) ?? 'moles'
  const colligativeMode = (searchParams.get('mode') as ColligativeMode) ?? 'bpe'
  const refView = (searchParams.get('view') as 'reference' | 'visual') ?? 'reference'

  const activeMode: Mode = PROBLEMS_TAB_IDS.has(activeTab) ? 'problems'
    : PRACTICE_TAB_IDS.has(activeTab) ? 'practice'
    : 'reference'

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

  function setTab(tab: CalcType) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      if (tab !== 'colligative') next.delete('mode')
      if (!VISUAL_TAB_IDS.has(tab)) next.delete('view')
      return next
    })
  }

  function setView(v: 'reference' | 'visual') {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (v === 'reference') next.delete('view')
      else next.set('view', v)
      return next
    })
  }

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    const topic = TAB_TO_TOPIC[activeTab]
    const next = (topic ? TOPIC_MODE_TAB[topic]?.[mode] : undefined) ?? MODE_DEFAULT[mode]
    setTab(next as CalcType)
  }

  const showExplanationButton = !!EXPLANATIONS[activeTab]

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Molar Calculations</h2>
          {REF_TOPIC_MAP[activeTab] && refView === 'reference' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors print:hidden"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          {activeMode === 'reference' && (
            <button
              onClick={() => setPrintingAll(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors print:hidden"
            >
              <span>⎙</span>
              <span>Print All</span>
            </button>
          )}
          {showExplanationButton && (
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
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(mode => {
            const isActive = activeMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {isActive && (
                  <motion.div layoutId="calc-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Topic pills for active mode */}
        {activeMode === 'problems' ? (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {PROBLEMS_PILLS.map(pill => {
              const isActive = activeTab === pill.value
              return (
                <button
                  key={pill.value}
                  onClick={() => setTab(pill.value)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="calc-pill-bg"
                      className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{pill.label}</span>
                  <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">
                    {pill.formula}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-8 md:gap-y-3 print:hidden">
            {(activeMode === 'reference' ? REFERENCE_GROUPS : PRACTICE_GROUPS).map(group => (
              <div key={group.id} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
                style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
                <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {group.pills.map(pill => {
                    const isActive = activeTab === pill.value
                    return (
                      <button
                        key={pill.value}
                        onClick={() => setTab(pill.value)}
                        className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                        style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="calc-pill-bg"
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
        )}

        {/* Secondary Visual | Reference pills — only for topics with animations */}
        {activeMode === 'reference' && VISUAL_TAB_IDS.has(activeTab) && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start print:hidden"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {(['reference', 'visual'] as const).map(v => {
              const isActive = refView === v
              return (
                <button key={v} onClick={() => setView(v)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
                  {isActive && (
                    <motion.div layoutId="calc-view-pill" className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative z-10">{v}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Active calculator */}
      <HideExamplesContext.Provider value={activeMode === 'practice'}>
      {printingAll ? (
        <MolarReference section="guide" />
      ) : (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab === 'colligative' ? `colligative-${colligativeMode}` : `${activeTab}-${refView}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'moles'               && <MolesCalc />}
          {activeTab === 'molarity'            && <MolarityCalc />}
          {activeTab === 'molality'            && <MolalityCalc />}
          {activeTab === 'colligative'         && <ColligativeCalc initialMode={colligativeMode} />}
          {activeTab === 'colligative-bpe'     && <ColligativeCalc initialMode="bpe" />}
          {activeTab === 'colligative-fpd'     && <ColligativeCalc initialMode="fpd" />}
          {activeTab === 'molar-volume'        && <MolarVolumeCalc />}
          {activeTab === 'percent-comp'        && <PercentCompositionCalc />}
          {activeTab === 'dilution'            && <DilutionCalc />}
          {activeTab === 'conc-converter'      && <ConcentrationConverter />}
          {activeTab === 'practice'            && <MolarPractice />}
          {activeTab === 'perc-comp-practice'  && <PercentCompositionPractice />}
          {activeTab === 'conc-practice'       && <DilutionConcPractice />}
          {activeTab === 'sig-figs'            && <SigFigPractice />}
          {activeTab === 'reference'           && <MolarReference section="guide" />}
          {REF_TOPIC_MAP[activeTab] && (
            <MolarReference section="guide" topic={REF_TOPIC_MAP[activeTab]} view={refView} />
          )}
        </motion.div>
      </AnimatePresence>
      )}
      </HideExamplesContext.Provider>

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

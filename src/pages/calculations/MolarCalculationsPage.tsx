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
const VISUAL_TAB_IDS = new Set<CalcType>(['ref-moles', 'ref-molarity', 'ref-molality', 'ref-dilution'])

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

const EXPLANATIONS: Partial<Record<CalcType, ExplanationContent>> = {
  colligative: {
    title: 'Colligative Properties',
    formula: 'ΔT = i · K · b',
    formulaVars: [
      { symbol: 'ΔT', meaning: 'Change in boiling/freezing point', unit: '°C' },
      { symbol: 'i',  meaning: "van't Hoff factor", unit: '—' },
      { symbol: 'K',  meaning: 'Ebullioscopic (Kb) or cryoscopic (Kf) constant', unit: '°C·kg/mol' },
      { symbol: 'b',  meaning: 'Molality of solution', unit: 'mol/kg' },
    ],
    description:
      'Colligative properties depend only on the number of dissolved particles, not their identity. ' +
      'Boiling point elevation (ΔTb = i·Kb·b) raises the boiling point; freezing point depression ' +
      '(ΔTf = i·Kf·b) lowers the freezing point.',
    example: {
      scenario: '1.00 mol/kg NaCl (i=2) in water — find boiling point elevation.',
      steps: ['ΔTb = i · Kb · b = 2 × 0.512 × 1.00', 'ΔTb = 1.024 °C'],
      result: 'ΔTb = 1.024 °C',
    },
  },
  moles: {
    title: 'Mole Calculations',
    formula: 'n = m / M',
    formulaVars: [
      { symbol: 'n', meaning: 'Amount of substance', unit: 'mol' },
      { symbol: 'm', meaning: 'Mass of substance', unit: 'g' },
      { symbol: 'M', meaning: 'Molar mass', unit: 'g/mol' },
    ],
    description: 'The mole is the SI unit for amount of substance.',
    example: {
      scenario: 'How many moles are in 18.02 g of water (M = 18.02 g/mol)?',
      steps: ['n = m / M = 18.02 ÷ 18.02', 'n = 1.000 mol'],
      result: 'n = 1.000 mol',
    },
  },
  molarity: {
    title: 'Molarity',
    formula: 'C = n / V',
    formulaVars: [
      { symbol: 'C', meaning: 'Molar concentration', unit: 'mol/L' },
      { symbol: 'n', meaning: 'Moles of solute', unit: 'mol' },
      { symbol: 'V', meaning: 'Volume of solution', unit: 'L' },
    ],
    description: 'Molarity expresses moles of solute per litre of solution.',
    example: {
      scenario: '5.85 g NaCl in 250.0 mL. Find molarity.',
      steps: ['n = 5.85/58.44 = 0.1001 mol', 'C = 0.1001/0.2500 = 0.4003 mol/L'],
      result: 'C = 0.4003 mol/L',
    },
  },
  dilution: {
    title: 'Dilution',
    formula: 'C₁V₁ = C₂V₂',
    formulaVars: [
      { symbol: 'C₁', meaning: 'Initial concentration', unit: 'mol/L' },
      { symbol: 'V₁', meaning: 'Initial volume', unit: 'L or mL' },
      { symbol: 'C₂', meaning: 'Final concentration', unit: 'mol/L' },
      { symbol: 'V₂', meaning: 'Final volume', unit: 'L or mL' },
    ],
    description:
      'Dilution is the process of adding solvent to reduce the concentration of a solution. ' +
      'Moles of solute are conserved: n = C·V, so C₁V₁ = C₂V₂. ' +
      'Solve for any unknown by rearranging: C₂ = C₁V₁/V₂, V₂ = C₁V₁/C₂, V₁ = C₂V₂/C₁.',
    example: {
      scenario: 'Dilute 25.0 mL of 6.00 M HCl to 150.0 mL. Find C₂.',
      steps: [
        'C₂ = C₁V₁ / V₂ = (6.00 mol/L × 25.0 mL) / 150.0 mL',
        'C₂ = 150.0 / 150.0 = 1.00 mol/L',
      ],
      result: 'C₂ = 1.00 mol/L',
    },
  },
  'conc-converter': {
    title: 'Concentration Units',
    formula: 'C ↔ w% ↔ ppm ↔ χ',
    formulaVars: [
      { symbol: 'C',   meaning: 'Molarity',     unit: 'mol/L'  },
      { symbol: 'w%',  meaning: 'Mass percent',  unit: '% w/w'  },
      { symbol: 'ppm', meaning: 'Parts per million (dilute aq.)', unit: 'mg/L' },
      { symbol: 'χ',   meaning: 'Mole fraction', unit: '—'      },
      { symbol: 'b',   meaning: 'Molality',       unit: 'mol/kg' },
    ],
    description:
      'Key interconversion formulas (ρ = solution density in g/mL, Mw = molar mass in g/mol): ' +
      'C = (w/100 × ρ × 1000) / Mw · · · ' +
      'w% = (C × Mw) / (ρ × 10) · · · ' +
      'C = ppm / (Mw × 1000) [for dilute aq.] · · · ' +
      'b = (C × 1000) / (ρ × 1000 − C × Mw)',
    example: {
      scenario: 'Concentrated HCl: 37.0% (w/w), ρ = 1.19 g/mL, Mw = 36.46 g/mol. Find molarity.',
      steps: [
        'C = (37.0/100 × 1.19 × 1000) / 36.46',
        'C = 440.3 / 36.46',
        'C = 12.07 mol/L',
      ],
      result: 'C ≈ 12.1 mol/L',
    },
  },
  molality: {
    title: 'Molality',
    formula: 'b = n / m',
    formulaVars: [
      { symbol: 'b', meaning: 'Molality', unit: 'mol/kg' },
      { symbol: 'n', meaning: 'Moles of solute', unit: 'mol' },
      { symbol: 'm', meaning: 'Mass of solvent', unit: 'kg' },
    ],
    description: 'Molality is temperature-independent, used in colligative property calculations.',
    example: {
      scenario: '10.0 g glucose (M=180.2) in 200.0 g water.',
      steps: ['n = 10.0/180.2 = 0.05549 mol', 'b = 0.05549/0.2000 = 0.2775 mol/kg'],
      result: 'b = 0.2775 mol/kg',
    },
  },
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
    if (mode === 'practice') setTab('moles')
    else if (mode === 'problems') setTab('practice')
    else setTab('ref-moles')
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
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(mode => {
            const isActive = activeMode === mode
            return (
              <button key={mode} onClick={() => setMode(mode)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {isActive && (
                  <motion.div layoutId="calc-mode-switch" className="absolute inset-0 rounded-full"
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

        {/* Topic pills for active mode */}
        {activeMode === 'problems' ? (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap print:hidden"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {PROBLEMS_PILLS.map(pill => {
              const isActive = activeTab === pill.value
              return (
                <button
                  key={pill.value}
                  onClick={() => setTab(pill.value)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="calc-pill-bg"
                      className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
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
          <div className="flex flex-col gap-3 print:hidden">
            {(activeMode === 'reference' ? REFERENCE_GROUPS : PRACTICE_GROUPS).map(group => (
              <div key={group.id} className="flex flex-col gap-2">
                <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {group.pills.map(pill => {
                    const isActive = activeTab === pill.value
                    return (
                      <button
                        key={pill.value}
                        onClick={() => setTab(pill.value)}
                        className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                        style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="calc-pill-bg"
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

        {/* Secondary Visual | Reference pills — only for topics with animations */}
        {activeMode === 'reference' && VISUAL_TAB_IDS.has(activeTab) && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start print:hidden"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {(['reference', 'visual'] as const).map(v => {
              const isActive = refView === v
              return (
                <button key={v} onClick={() => setView(v)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                  {isActive && (
                    <motion.div layoutId="calc-view-pill" className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
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

      {activeTab !== 'practice' && EXPLANATIONS[activeTab] && (
        <ExplanationModal
          content={EXPLANATIONS[activeTab]!}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

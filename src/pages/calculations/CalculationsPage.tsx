import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import ExplanationModal from '../../components/calculations/ExplanationModal'
import type { ExplanationContent } from '../../components/calculations/ExplanationModal'
import MolesCalc from '../../components/calculations/MolesCalc'
import MolarityCalc from '../../components/calculations/MolarityCalc'
import MolalityCalc from '../../components/calculations/MolalityCalc'
import ColligativeCalc from '../../components/calculations/ColligativeCalc'
import MolarPractice from '../../components/calculations/MolarPractice'
import { useState } from 'react'

type CalcType = 'moles' | 'molarity' | 'molality' | 'colligative' | 'practice'
type ColligativeMode = 'bpe' | 'fpd'

const PILLS: { value: CalcType; label: string; formula: string }[] = [
  { value: 'moles',       label: 'Moles',       formula: 'n = m / M'  },
  { value: 'molarity',    label: 'Molarity',    formula: 'C = n / V'  },
  { value: 'molality',    label: 'Molality',    formula: 'b = n / m'  },
  { value: 'colligative', label: 'Colligative', formula: 'ΔT = i·K·b' },
  { value: 'practice',    label: 'Practice',    formula: '✎'          },
]

const EXPLANATIONS: Record<CalcType, ExplanationContent> = {
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

export default function CalculationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as CalcType) ?? 'moles'
  const colligativeMode = (searchParams.get('mode') as ColligativeMode) ?? 'bpe'

  function setTab(tab: CalcType) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      if (tab !== 'colligative') next.delete('mode')
      return next
    })
  }

  const showExplanationButton = activeTab !== 'practice'

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Calculations</h2>
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

        {/* Pills */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {PILLS.map(pill => {
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
      </div>

      {/* Active calculator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab === 'colligative' ? `colligative-${colligativeMode}` : activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'moles'       && <MolesCalc />}
          {activeTab === 'molarity'    && <MolarityCalc />}
          {activeTab === 'molality'    && <MolalityCalc />}
          {activeTab === 'colligative' && <ColligativeCalc initialMode={colligativeMode} />}
          {activeTab === 'practice'    && <MolarPractice />}
        </motion.div>
      </AnimatePresence>

      {activeTab !== 'practice' && (
        <ExplanationModal
          content={EXPLANATIONS[activeTab]}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

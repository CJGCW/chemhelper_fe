import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MolarCalcType, ProblemStyle } from '../../utils/molarPractice'
import { generateMolarProblem } from '../../utils/molarPractice'
import { generateSigFigProblem } from '../../utils/sigfigPractice'
import { generateEmpiricalProblem } from '../../utils/empiricalPractice'
import { generateConversionProblem } from '../../utils/conversionPractice'
import { generateAtomicProblem } from '../../utils/atomicPractice'
import { generateLewisProblem, generateLewisDrawProblem, generateVseprProblem, generateVseprDrawProblem } from '../../utils/lewisPractice'
import type { StoichProblemType } from '../../utils/stoichiometryPractice'
import { generateStoichProblem } from '../../utils/stoichiometryPractice'
import type { RedoxSubtype } from '../../utils/redoxPractice'
import { generateRedoxProblem } from '../../utils/redoxPractice'
import type { PercCompType } from '../../utils/percentCompositionPractice'
import { generatePercCompProblem } from '../../utils/percentCompositionPractice'
import type { GasStandard } from '../../utils/gasStoichPractice'
import { generateGasStoichProblem } from '../../utils/gasStoichPractice'
import type { SolStoichType } from '../../utils/solutionStoichPractice'
import { generateSolStoichProblem } from '../../utils/solutionStoichPractice'
import type { Difficulty } from '../../utils/balancingPractice'
import { pickEquation } from '../../utils/balancingPractice'
import { genCalorimetryProblem } from '../../utils/calorimetryPractice'
import { genEnthalpyProblem } from '../../utils/enthalpyPractice'
import { genHessProblem } from '../../utils/hessLawPractice'
import { genBondEnthalpyProblem } from '../../utils/bondEnthalpyPractice'
import { genHeatTransferProblem } from '../../utils/heatTransferPractice'
import type { GeneratedTest, TestQuestion } from './testTypes'

// ── Topic definitions ─────────────────────────────────────────────────────────

type TopicKind  = 'molar' | 'sigfig' | 'empirical' | 'conversion' | 'atomic' | 'lewis' | 'lewis_draw' | 'vsepr' | 'vsepr_draw' | 'stoich' | 'redox' | 'perc_comp' | 'gas_stoich' | 'sol_stoich' | 'balancing' | 'calorimetry' | 'enthalpy' | 'hess' | 'bond_enthalpy' | 'heat_transfer'
type TopicGroup = 'core' | 'atomic_molecular' | 'structures' | 'molar_solutions' | 'stoichiometry' | 'redox' | 'thermochemistry'

const GROUP_LABELS: Record<TopicGroup, string> = {
  core:             'Core Skills',
  atomic_molecular: 'Atomic Structure',
  structures:       'Structures',
  molar_solutions:  'Molar & Solutions',
  stoichiometry:    'Stoichiometry',
  redox:            'Redox',
  thermochemistry:  'Thermochemistry',
}
const GROUP_ORDER: TopicGroup[] = ['core', 'atomic_molecular', 'structures', 'molar_solutions', 'stoichiometry', 'redox', 'thermochemistry']

interface TopicDef {
  id:           string
  kind:         TopicKind
  group:        TopicGroup
  label:        string
  formula:      string
  molarType?:   MolarCalcType
  stoichType?:  StoichProblemType
  redoxType?:   RedoxSubtype
  percCompType?:  PercCompType
  gasStandard?:   GasStandard
  solStoichType?: SolStoichType
  balDifficulty?: Difficulty
}

const ALL_TOPICS: TopicDef[] = [
  { id: 'sigfig',     kind: 'sigfig',     group: 'core',             label: 'Significant Figures',    formula: 'sf'                    },
  { id: 'conversion', kind: 'conversion', group: 'core',             label: 'Unit Conversions',        formula: 'g↔kg, L↔mL, °C↔K'    },
  { id: 'empirical',  kind: 'empirical',  group: 'core',             label: 'Empirical Formula',       formula: '% → EF'               },
  { id: 'atomic',     kind: 'atomic',     group: 'atomic_molecular', label: 'Atomic Structure',        formula: 'e⁻ config, QN, Bohr'  },
  { id: 'lewis',      kind: 'lewis',      group: 'structures',       label: 'Lewis Structure',         formula: 'valence e⁻, geometry'  },
  { id: 'lewis-draw', kind: 'lewis_draw', group: 'structures',      label: 'Lewis Draw',              formula: 'draw bonds & lone pairs' },
  { id: 'vsepr',      kind: 'vsepr',      group: 'structures',       label: 'VSEPR',                   formula: 'geometry, hybrid.'     },
  { id: 'vsepr-draw', kind: 'vsepr_draw', group: 'structures',       label: 'VSEPR Draw',              formula: '3D structure drawing'  },
  { id: 'moles',      kind: 'molar',      group: 'molar_solutions',  label: 'Moles',                   formula: 'n = m/M',              molarType: 'moles'    },
  { id: 'molarity',   kind: 'molar',      group: 'molar_solutions',  label: 'Molarity',                formula: 'C = n/V',              molarType: 'molarity' },
  { id: 'molality',   kind: 'molar',      group: 'molar_solutions',  label: 'Molality',                formula: 'b = n/m',              molarType: 'molality' },
  { id: 'bpe',        kind: 'molar',      group: 'molar_solutions',  label: 'Boiling Pt Elevation',    formula: 'ΔTb = i·Kb·b',         molarType: 'bpe'      },
  { id: 'fpd',        kind: 'molar',      group: 'molar_solutions',  label: 'Freezing Pt Depression',  formula: 'ΔTf = i·Kf·b',         molarType: 'fpd'      },
  { id: 'perc-comp',  kind: 'perc_comp',  group: 'molar_solutions',  label: '% Composition',           formula: '% mass'                                       },
  { id: 'stoich-mr',  kind: 'stoich',     group: 'stoichiometry',    label: 'Mole Ratios',             formula: 'n₁/n₂',                stoichType: 'mole_ratio'        },
  { id: 'stoich-mm',  kind: 'stoich',     group: 'stoichiometry',    label: 'Mass-to-Mass',            formula: 'g → mol → g',           stoichType: 'mass_to_mass'      },
  { id: 'stoich-lr',  kind: 'stoich',     group: 'stoichiometry',    label: 'Limiting Reagent',        formula: 'LR',                    stoichType: 'limiting_reagent'  },
  { id: 'stoich-ty',  kind: 'stoich',     group: 'stoichiometry',    label: 'Theoretical Yield',       formula: 'TY (g)',                stoichType: 'theoretical_yield' },
  { id: 'stoich-py',  kind: 'stoich',     group: 'stoichiometry',    label: 'Percent Yield',           formula: '% yield',               stoichType: 'percent_yield'     },
  { id: 'gas-stp',      kind: 'gas_stoich', group: 'stoichiometry',    label: 'Gas Stoich (STP)',        formula: 'L → mol @ STP',         gasStandard: 'STP'                          },
  { id: 'gas-satp',    kind: 'gas_stoich', group: 'stoichiometry',    label: 'Gas Stoich (SATP)',       formula: 'L → mol @ SATP',        gasStandard: 'SATP'                         },
  { id: 'sol-stoich',  kind: 'sol_stoich', group: 'stoichiometry',    label: 'Solution Stoich',         formula: 'M·V → mol → g'                                                      },
  { id: 'bal-easy',    kind: 'balancing',  group: 'stoichiometry',    label: 'Balancing (Easy)',        formula: '_□ + _□ → _□',          balDifficulty: 'easy'                       },
  { id: 'bal-medium',  kind: 'balancing',  group: 'stoichiometry',    label: 'Balancing (Medium)',      formula: '_□ + _□ → _□',          balDifficulty: 'medium'                     },
  { id: 'bal-hard',    kind: 'balancing',  group: 'stoichiometry',    label: 'Balancing (Hard)',        formula: '_□ + _□ → _□',          balDifficulty: 'hard'                       },
  { id: 'redox-ox',   kind: 'redox',      group: 'redox',            label: 'Oxidation Numbers',        formula: 'ox. #',                 redoxType: 'ox_state'           },
  { id: 'redox-id',   kind: 'redox',      group: 'redox',            label: 'Identify Oxidised/Reduced', formula: 'OA / RA',              redoxType: 'identify_redox'     },
  { id: 'redox-chg',  kind: 'redox',      group: 'redox',            label: 'Oxidation State Change',   formula: 'Δox',                   redoxType: 'ox_change'          },
  { id: 'calorimetry',   kind: 'calorimetry',   group: 'thermochemistry', label: 'Calorimetry',          formula: 'q=mcΔT' },
  { id: 'enthalpy',     kind: 'enthalpy',     group: 'thermochemistry', label: 'Enthalpy of Reaction',   formula: 'ΔHrxn'  },
  { id: 'hess',         kind: 'hess',         group: 'thermochemistry', label: "Hess's Law",             formula: 'ΣΔH'    },
  { id: 'bond-enthalpy',  kind: 'bond_enthalpy',  group: 'thermochemistry', label: 'Bond Enthalpy',   formula: 'BE'      },
  { id: 'heat-transfer',  kind: 'heat_transfer',  group: 'thermochemistry', label: 'Heat Transfer',   formula: 'q₁=−q₂' },
]

const STYLES: ProblemStyle[] = ['word', 'arithmetic']
function randomStyle(): ProblemStyle { return STYLES[Math.floor(Math.random() * 2)] }

// ── Checkbox button ───────────────────────────────────────────────────────────

function CheckBtn({
  checked, indeterminate, onClick, size = 'sm',
}: {
  checked: boolean; indeterminate?: boolean; onClick: () => void; size?: 'sm' | 'xs'
}) {
  const dim = size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const style = checked || indeterminate
    ? { background: 'color-mix(in srgb, var(--c-halogen) 20%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 50%, transparent)' }
    : { border: '1px solid rgba(255,255,255,0.15)', background: 'transparent' }
  return (
    <button onClick={onClick} className={`${dim} rounded-sm border flex items-center justify-center transition-colors shrink-0`} style={style}>
      {checked     && <span className="font-mono text-[8px] leading-none" style={{ color: 'var(--c-halogen)' }}>✓</span>}
      {indeterminate && !checked && <span className="font-mono text-[9px] leading-none" style={{ color: 'var(--c-halogen)' }}>−</span>}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TopicRow { def: TopicDef; enabled: boolean; count: number }

interface Props {
  onGenerate: (test: GeneratedTest) => void
}

export default function TestBuilder({ onGenerate }: Props) {
  const [title, setTitle]           = useState('Chemistry Practice Test')
  const [generating, setGenerating] = useState(false)
  const [rows, setRows]             = useState<TopicRow[]>(
    ALL_TOPICS.map(def => ({ def, enabled: true, count: 5 }))
  )

  // ── Selection helpers ──────────────────────────────────────────────────────

  function toggleRow(id: string) {
    setRows(prev => prev.map(r => r.def.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  function toggleAll() {
    const allOn = rows.every(r => r.enabled)
    setRows(prev => prev.map(r => ({ ...r, enabled: !allOn })))
  }

  function toggleGroup(group: TopicGroup) {
    const groupRows = rows.filter(r => r.def.group === group)
    const allOn = groupRows.every(r => r.enabled)
    setRows(prev => prev.map(r => r.def.group === group ? { ...r, enabled: !allOn } : r))
  }

  function setCount(id: string, val: number) {
    setRows(prev => prev.map(r =>
      r.def.id === id ? { ...r, count: Math.max(1, Math.min(20, val)) } : r
    ))
  }

  const enabledRows    = rows.filter(r => r.enabled)
  const totalQuestions = enabledRows.reduce((s, r) => s + r.count, 0)
  const allChecked     = rows.every(r => r.enabled)
  const someChecked    = rows.some(r => r.enabled)

  // ── Generation ────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (enabledRows.length === 0 || generating) return
    setGenerating(true)

    async function makeQuestion(row: TopicRow): Promise<Omit<TestQuestion, 'id'> | null> {
      const t = row.def
      if (t.kind === 'sigfig')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'sigfig',     data: generateSigFigProblem()     } }
      if (t.kind === 'empirical')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'empirical',  data: generateEmpiricalProblem()  } }
      if (t.kind === 'conversion')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'conversion', data: generateConversionProblem() } }
      if (t.kind === 'atomic')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'atomic',     data: generateAtomicProblem()     } }
      if (t.kind === 'lewis') {
        const data = await generateLewisProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'lewis', data } } : null
      }
      if (t.kind === 'vsepr') {
        const data = await generateVseprProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'vsepr', data } } : null
      }
      if (t.kind === 'lewis_draw') {
        const data = await generateLewisDrawProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'lewis-draw', data } } : null
      }
      if (t.kind === 'vsepr_draw') {
        const data = await generateVseprDrawProblem()
        return data ? { topic: t.label, topicFormula: t.formula, problem: { kind: 'vsepr-draw', data } } : null
      }
      if (t.kind === 'stoich')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'stoich', data: generateStoichProblem(t.stoichType!) } }
      if (t.kind === 'redox')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'redox', data: generateRedoxProblem(t.redoxType!) } }
      if (t.kind === 'perc_comp')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'perc_comp', data: generatePercCompProblem(t.percCompType) } }
      if (t.kind === 'gas_stoich')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'gas_stoich', data: generateGasStoichProblem(t.gasStandard) } }
      if (t.kind === 'sol_stoich')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'sol_stoich', data: generateSolStoichProblem(t.solStoichType) } }
      if (t.kind === 'balancing')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'balancing', data: pickEquation(t.balDifficulty) } }
      if (t.kind === 'calorimetry')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'calorimetry', data: genCalorimetryProblem() } }
      if (t.kind === 'enthalpy')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'enthalpy', data: genEnthalpyProblem() } }
      if (t.kind === 'hess')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'hess', data: genHessProblem() } }
      if (t.kind === 'bond_enthalpy')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'bond_enthalpy', data: genBondEnthalpyProblem() } }
      if (t.kind === 'heat_transfer')
        return { topic: t.label, topicFormula: t.formula, problem: { kind: 'heat_transfer', data: genHeatTransferProblem() } }
      return { topic: t.label, topicFormula: t.formula, problem: { kind: 'molar', data: generateMolarProblem(t.molarType!, randomStyle()) } }
    }

    try {
      const drafts = await Promise.all(
        enabledRows.flatMap(row => Array.from({ length: row.count }, () => makeQuestion(row)))
      )
      const questions = drafts
        .filter((q): q is NonNullable<typeof q> => q !== null)
        .map((q, i) => ({ ...q, id: i + 1 }))
      if (questions.length > 0) {
        onGenerate({ title: title.trim() || 'Chemistry Practice Test', questions, generatedAt: new Date() })
      }
    } finally {
      setGenerating(false)
    }
  }

  const hasApiTopics = enabledRows.some(r => r.def.kind === 'lewis' || r.def.kind === 'vsepr')

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Test Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-base text-bright placeholder-dim
                     focus:outline-none focus:border-muted"
          placeholder="e.g. Chemistry Unit 3 Test"
        />
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs text-secondary tracking-widest uppercase">Topics</label>
          <span className="font-mono text-xs text-dim">
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} total
          </span>
        </div>

        <div className="rounded-sm border border-border overflow-hidden">

          {/* Table header with select-all */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-center
                          px-4 py-2 bg-raised border-b border-border">
            <CheckBtn
              checked={allChecked}
              indeterminate={!allChecked && someChecked}
              onClick={toggleAll}
            />
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Topic</span>
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase w-20 text-right">Questions</span>
          </div>

          {/* Grouped rows */}
          {GROUP_ORDER.map(group => {
            const groupRows = rows.filter(r => r.def.group === group)
            const allOn  = groupRows.every(r => r.enabled)
            const someOn = groupRows.some(r => r.enabled)
            return (
              <div key={group}>
                {/* Group header */}
                <div
                  className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-center
                             px-4 py-1.5 border-b border-border"
                  style={{ background: 'color-mix(in srgb, #1c1f2e 60%, #0e1016)' }}
                >
                  <CheckBtn
                    checked={allOn}
                    indeterminate={!allOn && someOn}
                    onClick={() => toggleGroup(group)}
                    size="xs"
                  />
                  <span className="font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: 'color-mix(in srgb, var(--c-halogen) 70%, rgba(255,255,255,0.4))' }}>
                    {GROUP_LABELS[group]}
                  </span>
                  <span className="font-mono text-[10px] text-dim w-20 text-right">
                    {groupRows.filter(r => r.enabled).reduce((s, r) => s + r.count, 0)} / {groupRows.reduce((s, r) => s + r.count, 0)}
                  </span>
                </div>

                {/* Topic rows — collapse when group is fully unchecked */}
                <AnimatePresence initial={false}>
                  {someOn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      {groupRows.map((row) => (
                        <div
                          key={row.def.id}
                          className={`grid grid-cols-[auto_1fr_auto] gap-x-4 items-center
                                      px-4 py-3 border-b border-border transition-opacity bg-surface
                                      ${row.enabled ? '' : 'opacity-40'}`}
                        >
                          {/* Checkbox */}
                          <CheckBtn checked={row.enabled} onClick={() => toggleRow(row.def.id)} />

                          {/* Label */}
                          <div className="flex flex-col gap-0.5 min-w-0 pl-1">
                            <span className="font-sans text-sm text-primary">{row.def.label}</span>
                            <span className="font-mono text-[10px] text-dim">{row.def.formula}</span>
                          </div>

                          {/* Count stepper */}
                          <div className={`flex items-center gap-1 w-20 justify-end shrink-0 ${!row.enabled ? 'pointer-events-none' : ''}`}>
                            <button
                              onClick={() => setCount(row.def.id, row.count - 1)}
                              disabled={!row.enabled || row.count <= 1}
                              className="w-6 h-6 rounded-sm border border-border font-mono text-sm text-dim
                                         hover:text-primary hover:border-muted transition-colors
                                         disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >−</button>
                            <span className="font-mono text-sm text-primary w-5 text-center">{row.count}</span>
                            <button
                              onClick={() => setCount(row.def.id, row.count + 1)}
                              disabled={!row.enabled || row.count >= 20}
                              className="w-6 h-6 rounded-sm border border-border font-mono text-sm text-dim
                                         hover:text-primary hover:border-muted transition-colors
                                         disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            >+</button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <p className="font-mono text-[10px] text-dim">
          Word problems and arithmetic are mixed automatically.
          {hasApiTopics && ' Lewis / VSEPR questions are fetched from the server.'}
        </p>
      </div>

      {/* Generate */}
      <motion.button
        onClick={handleGenerate}
        disabled={enabledRows.length === 0 || generating}
        whileTap={{ scale: 0.98 }}
        className="self-start px-6 py-2.5 rounded-sm font-sans text-sm font-semibold
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}
      >
        {generating ? 'Generating…' : `Generate Test (${totalQuestions} questions)`}
      </motion.button>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pick, randBetween, roundTo } from '../calculations/WorkedExample'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../calculations/StepsPanel'
import { R, P_UNITS, type PUnit, type TUnit, type GasVar, toK, fromK, toAtm, fromAtm } from '../../utils/idealGas'
import ExplanationModal, { type ExplanationContent } from '../calculations/ExplanationModal'
import DaltonsLawCalc from './DaltonsLawCalc'
import GrahamsLawCalc from './GrahamsLawCalc'
import GasDensityCalc from './GasDensityCalc'
import VanDerWaalsCalc from './VanDerWaalsCalc'
import MaxwellBoltzmann from './MaxwellBoltzmann'

const sf = (v: number, n = 4) => parseFloat(v.toPrecision(n)).toString()

// ── Example generators ────────────────────────────────────────────────────────

const IDEAL_GAS_NAMES = ['N₂', 'O₂', 'CO₂', 'H₂', 'CH₄', 'Ar', 'He', 'NH₃', 'Cl₂']

function generateIdealGasExample() {
  const gas = pick(IDEAL_GAS_NAMES)
  const n   = roundTo(randBetween(0.5, 4.0), 2)
  const T   = roundTo(randBetween(250, 500), 0)
  const P   = roundTo(randBetween(0.5, 3.0), 2)
  const V   = (n * R * T) / P
  return {
    scenario: `${n} mol of ${gas} at ${P} atm and ${T} K. Find the volume.`,
    steps: [
      `V = nRT / P`,
      `V = (${n} mol × ${R} L·atm/(mol·K) × ${T} K) / ${P} atm`,
      `V = ${sf(V, 4)} L`,
    ],
    result: `V = ${sf(V, 4)} L`,
  }
}

function generateCombinedGasExample() {
  const P1 = roundTo(randBetween(1.0, 3.0), 2)
  const V1 = roundTo(randBetween(1.0, 5.0), 1)
  const T1 = roundTo(randBetween(250, 350), 0)
  const T2 = roundTo(randBetween(350, 500), 0)
  const P2 = roundTo(randBetween(0.5, 2.5), 2)
  const V2 = (P1 * V1 * T2) / (T1 * P2)
  return {
    scenario: `Gas at ${P1} atm, ${V1} L, ${T1} K is changed to ${P2} atm and ${T2} K. Find V₂.`,
    steps: [
      `V₂ = P₁V₁T₂ / (T₁P₂)`,
      `V₂ = (${P1} × ${V1} × ${T2}) / (${T1} × ${P2})`,
      `V₂ = ${sf(V2, 4)} L`,
    ],
    result: `V₂ = ${sf(V2, 4)} L`,
  }
}

function FieldBox({
  label, value, onChange, unit, unitNode, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  unit?: string; unitNode?: React.ReactNode; placeholder?: string
}) {
  const isEmpty = value.trim() === ''
  return (
    <div className={`flex flex-col gap-1.5 rounded-sm border p-3 transition-colors ${
      isEmpty ? 'border-border/40 bg-surface/50' : 'border-border bg-surface'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">{label}</span>
        {unitNode ?? (unit && <span className="font-mono text-xs text-dim">{unit}</span>)}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'leave blank to solve'}
        className="w-full bg-transparent font-mono text-base text-bright placeholder:text-dim/50
                   focus:outline-none [appearance:textfield]
                   [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  )
}

function UnitPill({
  options, active, onChange,
}: { options: readonly string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className="px-2 py-0.5 rounded-sm font-mono text-xs transition-colors"
          style={active === o ? {
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          } : {
            border: '1px solid rgba(var(--overlay),0.12)',
            color: 'rgba(var(--overlay),0.35)',
          }}
        >{o}</button>
      ))}
    </div>
  )
}

// ── Combined Gas Law calculator ───────────────────────────────────────────────

type CombinedVar = 'P1' | 'V1' | 'T1' | 'P2' | 'V2' | 'T2'

function CombinedGasCalc() {
  const [pUnit, setPUnit] = useState<PUnit>('atm')
  const [tUnit, setTUnit] = useState<TUnit>('K')
  const [fields, setFields] = useState<Record<CombinedVar, string>>({
    P1: '', V1: '', T1: '', P2: '', V2: '', T2: '',
  })
  const [result, setResult] = useState<{ variable: CombinedVar; value: string; unit: string; steps: string[] } | null>(null)
  const [error, setError] = useState('')
  const [noSteps]         = useState<string[]>([])
  const stepsState        = useStepsPanelState(noSteps, generateCombinedGasExample)

  function set(k: CombinedVar) { return (v: string) => { setFields(f => ({ ...f, [k]: v })); setResult(null) } }

  function handleCalc() {
    setError(''); setResult(null)
    const blanks = (Object.values(fields) as string[]).filter(v => v.trim() === '').length
    if (blanks !== 1) {
      setError(blanks === 0 ? 'Leave one field blank — that variable will be solved.' : 'Fill in exactly five fields.')
      return
    }
    const raw = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.trim() ? parseFloat(v) : null])
    ) as Record<CombinedVar, number | null>

    if (Object.values(raw).some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }

    // Convert to working units (atm + K)
    const P1atm = raw.P1 !== null ? toAtm(raw.P1, pUnit) : null
    const P2atm = raw.P2 !== null ? toAtm(raw.P2, pUnit) : null
    const T1k   = raw.T1 !== null ? toK(raw.T1, tUnit) : null
    const T2k   = raw.T2 !== null ? toK(raw.T2, tUnit) : null
    const V1    = raw.V1
    const V2    = raw.V2

    const steps: string[] = []
    const pConv = pUnit !== 'atm'

    function pushConv() {
      if (pConv) {
        if (raw.P1 !== null) steps.push(`Convert P₁: ${sf(raw.P1)} ${pUnit} = ${sf(P1atm!)} atm`)
        if (raw.P2 !== null) steps.push(`Convert P₂: ${sf(raw.P2)} ${pUnit} = ${sf(P2atm!)} atm`)
      }
      if (tUnit === 'C') {
        if (raw.T1 !== null) steps.push(`Convert T₁: ${sf(raw.T1)} °C = ${sf(T1k!)} K`)
        if (raw.T2 !== null) steps.push(`Convert T₂: ${sf(raw.T2)} °C = ${sf(T2k!)} K`)
      }
    }

    let ans: number, ansOut: string, ansUnit: string, blankVar: CombinedVar

    if (raw.P2 === null) {
      blankVar = 'P2'
      steps.push('P₂ = P₁V₁T₂ / (T₁V₂)')
      pushConv()
      ans = (P1atm! * V1! * T2k!) / (T1k! * V2!)
      ansOut = sf(fromAtm(ans, pUnit))
      ansUnit = pUnit
      steps.push(`P₂ = (${sf(P1atm!)} × ${sf(V1!)} × ${sf(T2k!)}) / (${sf(T1k!)} × ${sf(V2!)})`)
      steps.push(`P₂ = ${sf(ans)} atm` + (pUnit !== 'atm' ? `  =  ${ansOut} ${pUnit}` : ''))
    } else if (raw.V2 === null) {
      blankVar = 'V2'
      steps.push('V₂ = P₁V₁T₂ / (T₁P₂)')
      pushConv()
      ans = (P1atm! * V1! * T2k!) / (T1k! * P2atm!)
      ansOut = sf(ans); ansUnit = 'L'
      steps.push(`V₂ = (${sf(P1atm!)} × ${sf(V1!)} × ${sf(T2k!)}) / (${sf(T1k!)} × ${sf(P2atm!)})`)
      steps.push(`V₂ = ${ansOut} L`)
    } else if (raw.T2 === null) {
      blankVar = 'T2'
      steps.push('T₂ = P₂V₂T₁ / (P₁V₁)')
      pushConv()
      ans = (P2atm! * V2! * T1k!) / (P1atm! * V1!)
      const ansC = fromK(ans, tUnit)
      ansOut = sf(ansC); ansUnit = tUnit === 'C' ? '°C' : 'K'
      steps.push(`T₂ = (${sf(P2atm!)} × ${sf(V2!)} × ${sf(T1k!)}) / (${sf(P1atm!)} × ${sf(V1!)})`)
      steps.push(`T₂ = ${sf(ans)} K` + (tUnit === 'C' ? `  =  ${ansOut} °C` : ''))
    } else if (raw.P1 === null) {
      blankVar = 'P1'
      steps.push('P₁ = P₂V₂T₁ / (T₂V₁)')
      pushConv()
      ans = (P2atm! * V2! * T1k!) / (T2k! * V1!)
      ansOut = sf(fromAtm(ans, pUnit)); ansUnit = pUnit
      steps.push(`P₁ = (${sf(P2atm!)} × ${sf(V2!)} × ${sf(T1k!)}) / (${sf(T2k!)} × ${sf(V1!)})`)
      steps.push(`P₁ = ${sf(ans)} atm` + (pUnit !== 'atm' ? `  =  ${ansOut} ${pUnit}` : ''))
    } else if (raw.V1 === null) {
      blankVar = 'V1'
      steps.push('V₁ = P₂V₂T₁ / (P₁T₂)')
      pushConv()
      ans = (P2atm! * V2! * T1k!) / (P1atm! * T2k!)
      ansOut = sf(ans); ansUnit = 'L'
      steps.push(`V₁ = (${sf(P2atm!)} × ${sf(V2!)} × ${sf(T1k!)}) / (${sf(P1atm!)} × ${sf(T2k!)})`)
      steps.push(`V₁ = ${ansOut} L`)
    } else {
      blankVar = 'T1'
      steps.push('T₁ = P₁V₁T₂ / (P₂V₂)')
      pushConv()
      ans = (P1atm! * V1! * T2k!) / (P2atm! * V2!)
      const ansC = fromK(ans, tUnit)
      ansOut = sf(ansC); ansUnit = tUnit === 'C' ? '°C' : 'K'
      steps.push(`T₁ = (${sf(P1atm!)} × ${sf(V1!)} × ${sf(T2k!)}) / (${sf(P2atm!)} × ${sf(V2!)})`)
      steps.push(`T₁ = ${sf(ans)} K` + (tUnit === 'C' ? `  =  ${ansOut} °C` : ''))
    }

    setResult({ variable: blankVar, value: ansOut!, unit: ansUnit!, steps })
  }

  function handleClear() {
    setFields({ P1: '', V1: '', T1: '', P2: '', V2: '', T2: '' })
    setResult(null); setError('')
  }

  const hasAny = Object.values(fields).some(v => v.trim())

  const subLabel = (k: CombinedVar) => {
    const labels: Record<CombinedVar, string> = {
      P1: 'P₁ — Pressure (state 1)', V1: 'V₁ — Volume (state 1)', T1: 'T₁ — Temp (state 1)',
      P2: 'P₂ — Pressure (state 2)', V2: 'V₂ — Volume (state 2)', T2: 'T₂ — Temp (state 2)',
    }
    return labels[k]
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary">
        Fill in five fields and leave one blank — it will be solved. T must be in K (or °C — converted automatically).
      </p>

      {/* 2-col state grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {/* Column headers */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">State 1</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">State 2</span>
        </div>
        {/* P row */}
        <FieldBox label={subLabel('P1')} value={fields.P1} onChange={set('P1')}
          unitNode={<UnitPill options={P_UNITS} active={pUnit} onChange={v => setPUnit(v as PUnit)} />} />
        <FieldBox label={subLabel('P2')} value={fields.P2} onChange={set('P2')}
          unit={pUnit} />
        {/* V row */}
        <FieldBox label={subLabel('V1')} value={fields.V1} onChange={set('V1')} unit="L" />
        <FieldBox label={subLabel('V2')} value={fields.V2} onChange={set('V2')} unit="L" />
        {/* T row */}
        <FieldBox label={subLabel('T1')} value={fields.T1} onChange={set('T1')}
          unitNode={<UnitPill options={['K', 'C']} active={tUnit} onChange={v => setTUnit(v as TUnit)} />} />
        <FieldBox label={subLabel('T2')} value={fields.T2} onChange={set('T2')}
          unit={tUnit === 'C' ? '°C' : 'K'} />
      </div>

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>Calculate →</button>
        <StepsTrigger {...stepsState} />
        {(hasAny || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.variable}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 rounded-sm border bg-surface p-5"
            style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
          >
            <span className="font-mono text-2xl font-bold" style={{ color: 'var(--c-halogen)' }}>
              {result.variable.replace('1','₁').replace('2','₂')} = {result.value} {result.unit}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Steps</span>
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
                {result.steps.map((s, i) => (
                  <p key={i} className={`font-mono text-sm ${i === result.steps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'}`}>
                    {i === result.steps.length - 1 ? '∴ ' : ''}{s}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        P₁V₁/T₁ = P₂V₂/T₂ — n is constant (same gas, two different states).
      </p>
    </div>
  )
}

// ── Explanations ─────────────────────────────────────────────────────────────

const GAS_EXPLANATIONS: Record<'ideal' | 'combined' | 'daltons' | 'grahams' | 'density', ExplanationContent> = {
  ideal: {
    title: 'Ideal Gas Law',
    formula: 'PV = nRT',
    formulaVars: [
      { symbol: 'P', meaning: 'Pressure',           unit: 'atm (or kPa, mmHg, torr)' },
      { symbol: 'V', meaning: 'Volume',             unit: 'L'                        },
      { symbol: 'n', meaning: 'Amount of gas',      unit: 'mol'                      },
      { symbol: 'R', meaning: 'Gas constant',       unit: '0.08206 L·atm/(mol·K)'   },
      { symbol: 'T', meaning: 'Absolute temperature', unit: 'K'                      },
    ],
    description:
      "Combines Boyle's law (P ∝ 1/V), Charles' law (V ∝ T), and Avogadro's law (V ∝ n) into one equation. " +
      "Assumes gas particles have negligible volume and no intermolecular forces. " +
      "Real gases approach ideal behaviour at low pressure and high temperature.",
    example: {
      scenario: '2.00 mol N₂ at 1.50 atm and 298 K — find the volume.',
      steps: [
        'V = nRT / P',
        'V = (2.00 mol × 0.08206 L·atm/(mol·K) × 298 K) / 1.50 atm',
        'V = 48.9 / 1.50',
      ],
      result: 'V = 32.6 L',
    },
  },
  combined: {
    title: 'Combined Gas Law',
    formula: 'P₁V₁ / T₁ = P₂V₂ / T₂',
    formulaVars: [
      { symbol: 'P₁, P₂', meaning: 'Initial and final pressure',    unit: 'atm (units must match)' },
      { symbol: 'V₁, V₂', meaning: 'Initial and final volume',      unit: 'L'                      },
      { symbol: 'T₁, T₂', meaning: 'Initial and final temperature', unit: 'K'                      },
    ],
    description:
      'Derived from the ideal gas law with n held constant: PV/T = nR = constant. ' +
      'Use when a gas sample undergoes simultaneous changes in pressure, volume, and temperature. ' +
      "Boyle's (T constant), Charles' (P constant), and Gay-Lussac's (V constant) laws are all special cases.",
    example: {
      scenario: 'Gas at 3.00 atm, 2.00 L, 300 K is heated to 450 K while pressure drops to 1.50 atm. Find V₂.',
      steps: [
        'V₂ = P₁V₁T₂ / (T₁P₂)',
        'V₂ = (3.00 × 2.00 × 450) / (300 × 1.50)',
        'V₂ = 2700 / 450',
      ],
      result: 'V₂ = 6.00 L',
    },
  },
  grahams: {
    title: "Graham's Law of Effusion",
    formula: 'rate₁ / rate₂ = √(M₂ / M₁)',
    formulaVars: [
      { symbol: 'rate₁, rate₂', meaning: 'Effusion (or diffusion) rates of gases 1 and 2', unit: 'any consistent unit' },
      { symbol: 'M₁, M₂',       meaning: 'Molar masses of gases 1 and 2',                   unit: 'g/mol' },
    ],
    description:
      "Lighter gases effuse (escape through a small hole) faster than heavier ones. " +
      "The ratio of effusion rates is the inverse square root of the ratio of molar masses. " +
      "For effusion times: t₁/t₂ = √(M₁/M₂) — lighter gas takes less time.",
    example: {
      scenario: 'H₂ (M = 2.016 g/mol) vs O₂ (M = 32.00 g/mol). How much faster does H₂ effuse?',
      steps: [
        'rate(H₂) / rate(O₂) = √(M(O₂) / M(H₂))',
        'rate(H₂) / rate(O₂) = √(32.00 / 2.016)',
        'rate(H₂) / rate(O₂) = √15.87 = 3.984',
      ],
      result: 'H₂ effuses ~3.98× faster than O₂',
    },
  },
  density: {
    title: 'Molar Mass from Gas Density',
    formula: 'M = ρRT / P',
    formulaVars: [
      { symbol: 'M',  meaning: 'Molar mass',   unit: 'g/mol' },
      { symbol: 'ρ',  meaning: 'Gas density',  unit: 'g/L'   },
      { symbol: 'R',  meaning: 'Gas constant', unit: '0.08206 L·atm/(mol·K)' },
      { symbol: 'T',  meaning: 'Temperature',  unit: 'K'     },
      { symbol: 'P',  meaning: 'Pressure',     unit: 'atm'   },
    ],
    description:
      "Derived from PV = nRT by substituting n = m/M and ρ = m/V. " +
      "Allows experimental determination of molar mass by measuring gas density at known T and P. " +
      "Can also solve for ρ, T, or P when M is known.",
    example: {
      scenario: 'A gas has density 1.428 g/L at 25 °C (298 K) and 1.00 atm. Find the molar mass.',
      steps: [
        'M = ρRT / P',
        'M = (1.428 g/L × 0.08206 L·atm/(mol·K) × 298 K) / 1.00 atm',
        'M = 34.94 / 1.00',
      ],
      result: 'M = 34.9 g/mol (approximately H₂S or Cl₂)',
    },
  },
  daltons: {
    title: "Dalton's Law of Partial Pressures",
    formula: 'P_total = P₁ + P₂ + … + Pₙ',
    formulaVars: [
      { symbol: 'P_total', meaning: 'Total pressure of the gas mixture', unit: 'atm / kPa / mmHg' },
      { symbol: 'Pᵢ',      meaning: 'Partial pressure of gas i',         unit: 'same as P_total'  },
      { symbol: 'χᵢ',      meaning: 'Mole fraction of gas i (nᵢ / n_total)', unit: 'dimensionless' },
    ],
    description:
      "In a mixture of non-reacting gases, each gas exerts a pressure independently of the others. " +
      "The total pressure equals the sum of the partial pressures. " +
      "The partial pressure of gas i equals its mole fraction times the total pressure: Pᵢ = χᵢ × P_total.",
    example: {
      scenario: 'A flask contains N₂ (χ = 0.60) and O₂ (χ = 0.40) at P_total = 1.50 atm. Find each partial pressure.',
      steps: [
        'P(N₂) = χ(N₂) × P_total = 0.60 × 1.50 atm',
        'P(O₂) = χ(O₂) × P_total = 0.40 × 1.50 atm',
      ],
      result: 'P(N₂) = 0.90 atm · P(O₂) = 0.60 atm',
    },
  },
}

// ── Ideal Gas Law calculator (PV = nRT) ───────────────────────────────────────

export default function IdealGasCalc() {
  const [mode, setMode]   = useState<'ideal' | 'combined' | 'daltons' | 'grahams' | 'density' | 'vdw' | 'maxwell'>('ideal')
  const [P, setP]         = useState('')
  const [pUnit, setPUnit] = useState<PUnit>('atm')
  const [V, setV]         = useState('')
  const [N, setN]         = useState('')
  const [T, setT]         = useState('')
  const [tUnit, setTUnit] = useState<TUnit>('K')

  const [showExplanation, setShowExplanation] = useState(false)
  const [result, setResult] = useState<{ variable: GasVar; value: string; unit: string; steps: string[] } | null>(null)
  const [error, setError]   = useState('')
  const [noSteps]           = useState<string[]>([])
  const stepsState          = useStepsPanelState(noSteps, generateIdealGasExample)

  function handleCalc() {
    setError(''); setResult(null)
    const blanks = [P, V, N, T].filter(v => v.trim() === '').length
    if (blanks !== 1) {
      setError(blanks === 0 ? 'Leave one field blank — that variable will be solved.' : 'Fill in exactly three fields.')
      return
    }
    const Pv = P.trim() ? parseFloat(P) : null
    const Vv = V.trim() ? parseFloat(V) : null
    const Nv = N.trim() ? parseFloat(N) : null
    const Tv = T.trim() ? toK(parseFloat(T), tUnit) : null

    if ([Pv, Vv, Nv, Tv].some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }
    const Patm = Pv !== null ? toAtm(Pv, pUnit) : null
    const steps: string[] = []

    if (Pv === null) {
      const ans = (Nv! * R * Tv!) / Vv!
      const ansOut = fromAtm(ans, pUnit)
      steps.push('P = nRT / V')
      steps.push(`P = (${sf(Nv!)} mol × ${R} L·atm/(mol·K) × ${sf(Tv!)} K) / ${sf(Vv!)} L`)
      steps.push(`P = ${sf(ans)} atm` + (pUnit !== 'atm' ? `  =  ${sf(ansOut)} ${pUnit}` : ''))
      setResult({ variable: 'P', value: sf(ansOut), unit: pUnit, steps })

    } else if (Vv === null) {
      const ans = (Nv! * R * Tv!) / Patm!
      steps.push('V = nRT / P')
      if (pUnit !== 'atm') steps.push(`Convert P: ${sf(Pv)} ${pUnit} = ${sf(Patm!)} atm`)
      steps.push(`V = (${sf(Nv!)} mol × ${R} L·atm/(mol·K) × ${sf(Tv!)} K) / ${sf(Patm!)} atm`)
      steps.push(`V = ${sf(ans)} L`)
      setResult({ variable: 'V', value: sf(ans), unit: 'L', steps })

    } else if (Nv === null) {
      const ans = (Patm! * Vv!) / (R * Tv!)
      steps.push('n = PV / RT')
      if (pUnit !== 'atm') steps.push(`Convert P: ${sf(Pv)} ${pUnit} = ${sf(Patm!)} atm`)
      steps.push(`n = (${sf(Patm!)} atm × ${sf(Vv!)} L) / (${R} L·atm/(mol·K) × ${sf(Tv!)} K)`)
      steps.push(`n = ${sf(ans)} mol`)
      setResult({ variable: 'n', value: sf(ans), unit: 'mol', steps })

    } else {
      const ans    = (Patm! * Vv!) / (Nv! * R)
      const ansOut = fromK(ans, tUnit)
      steps.push('T = PV / nR')
      if (pUnit !== 'atm') steps.push(`Convert P: ${sf(Pv)} ${pUnit} = ${sf(Patm!)} atm`)
      steps.push(`T = (${sf(Patm!)} atm × ${sf(Vv!)} L) / (${sf(Nv!)} mol × ${R} L·atm/(mol·K))`)
      steps.push(`T = ${sf(ans)} K` + (tUnit === 'C' ? `  =  ${sf(ansOut)} °C` : ''))
      setResult({ variable: 'T', value: sf(ansOut), unit: tUnit === 'C' ? '°C' : 'K', steps })
    }
  }

  function handleClear() {
    setP(''); setV(''); setN(''); setT('')
    setResult(null); setError('')
  }

  const varColors: Record<GasVar, string> = {
    P: '#60a5fa', V: '#4ade80', n: '#fbbf24', T: '#f472b6'
  }
  const color = result ? varColors[result.variable] : 'var(--c-halogen)'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Mode toggle + explanation button */}
      <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-1 p-1 rounded-sm self-start flex-wrap"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {([
          { id: 'ideal',    label: 'PV = nRT'            },
          { id: 'combined', label: 'P₁V₁/T₁ = P₂V₂/T₂'  },
          { id: 'daltons',  label: "Dalton's Law"         },
          { id: 'grahams',  label: "Graham's Law"         },
          { id: 'density',  label: 'Gas Density'          },
          { id: 'vdw',      label: 'van der Waals'        },
          { id: 'maxwell',  label: 'Maxwell-Boltzmann'   },
        ] as const).map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{ color: mode === m.id ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
            {mode === m.id && (
              <motion.div layoutId="gas-calc-mode-pill" className="absolute inset-0 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setShowExplanation(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                   font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
      >
        <span className="font-mono">?</span>
        <span>What is this</span>
      </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'daltons' ? (
          <motion.div key="daltons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <DaltonsLawCalc />
          </motion.div>
        ) : mode === 'grahams' ? (
          <motion.div key="grahams"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <GrahamsLawCalc />
          </motion.div>
        ) : mode === 'density' ? (
          <motion.div key="density"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <GasDensityCalc />
          </motion.div>
        ) : mode === 'vdw' ? (
          <motion.div key="vdw"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <VanDerWaalsCalc />
          </motion.div>
        ) : mode === 'maxwell' ? (
          <motion.div key="maxwell"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <MaxwellBoltzmann />
          </motion.div>
        ) : mode === 'combined' ? (
          <motion.div key="combined"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <CombinedGasCalc />
          </motion.div>
        ) : (
          <motion.div key="ideal"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <div className="flex flex-col gap-6">
      <p className="font-sans text-sm text-secondary">
        Fill in any three fields and leave one blank — it will be solved automatically.
      </p>

      {/* Input grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldBox
          label="P — Pressure" value={P} onChange={setP}
          unitNode={<UnitPill options={P_UNITS} active={pUnit} onChange={v => setPUnit(v as PUnit)} />}
        />
        <FieldBox label="V — Volume"      value={V} onChange={setV} unit="L"   />
        <FieldBox label="n — Moles"       value={N} onChange={setN} unit="mol" />
        <FieldBox
          label="T — Temperature" value={T} onChange={setT}
          unitNode={<UnitPill options={['K', 'C']} active={tUnit} onChange={v => setTUnit(v as TUnit)} />}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-stretch gap-2">
        <button
          onClick={handleCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >Calculate →</button>
        <StepsTrigger {...stepsState} />
        {(P || V || N || T || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />

      {/* Error */}
      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.variable}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 rounded-sm border bg-surface p-5"
            style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold" style={{ color }}>
                {result.variable} = {result.value} {result.unit}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Steps</span>
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
                {result.steps.map((s, i) => (
                  <p key={i} className={`font-mono text-sm ${i === result.steps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'}`}>
                    {i === result.steps.length - 1 ? '∴ ' : ''}{s}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        Assumes ideal gas behaviour. Temperature must be above 0 K. R = {R} L·atm/(mol·K).
      </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode !== 'vdw' && mode !== 'maxwell' && (
        <ExplanationModal
          content={GAS_EXPLANATIONS[mode as keyof typeof GAS_EXPLANATIONS]}
          open={showExplanation}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberField from '../shared/NumberField'
import ChainedProblem, { type ChainedStep } from '../shared/ChainedProblem'
import { solvePartialMelting, solveEvaporativeCooling } from '../../chem/thermo'
import {
  generatePartialMeltingProblem,
  generateEvaporativeCoolingProblem,
} from '../../utils/energyBalancePractice'

type SubMode = 'melting' | 'evap'

interface Props {
  allowCustom?: boolean
}

// ── Step builders ─────────────────────────────────────────────────────────────

function buildMeltingSteps(sol: ReturnType<typeof solvePartialMelting>): ChainedStep[] {
  const steps: ChainedStep[] = [
    {
      id: 'q-warm',
      prompt: 'Calculate the heat released as the warm liquid cools to the melting point (0°C).',
      hint: 'q = m × c × (T_warm − T_mp)',
      expectedAnswer: parseFloat(sol.qWarmReleased.toPrecision(4)),
      answerUnit: 'J',
      tolerance: 0.02,
      explanation:
        `q_warm = m × c × ΔT = ${sol.qWarmReleased.toFixed(0)} J  ` +
        `(heat the warm liquid gives up cooling to 0°C)`,
    },
    {
      id: 'q-melt-all',
      prompt: 'What is the minimum heat required to melt all the ice?',
      hint: 'q = m_ice × ΔH_fus',
      expectedAnswer: parseFloat(sol.qToMeltAllIce.toPrecision(4)),
      answerUnit: 'J',
      tolerance: 0.02,
      explanation:
        `q_melt_all = m_ice × ΔH_fus = ${sol.qToMeltAllIce.toFixed(0)} J`,
    },
  ]

  if (!sol.allIceMelts) {
    steps.push({
      id: 'mass-melted',
      prompt: `Since q_warm (${sol.qWarmReleased.toFixed(0)} J) < q_melt_all (${sol.qToMeltAllIce.toFixed(0)} J), only some ice melts. How many grams of ice actually melt?`,
      hint: 'm = q_available / ΔH_fus',
      expectedAnswer: parseFloat(sol.massIceMelted.toPrecision(4)),
      answerUnit: 'g',
      tolerance: 0.02,
      explanation:
        `m_melted = q_warm / ΔH_fus = ${sol.massIceMelted.toFixed(1)} g  ` +
        `(final temperature = 0°C; solid ice and liquid water coexist)`,
    })
  } else {
    const qExcess = sol.qAvailableForMelt - sol.qToMeltAllIce
    steps.push({
      id: 'final-temp',
      prompt: `Since q_warm (${sol.qWarmReleased.toFixed(0)} J) ≥ q_melt_all (${sol.qToMeltAllIce.toFixed(0)} J), all ice melts and temperature rises above 0°C. What is the final temperature?`,
      hint: `T_f = 0°C + q_excess / (m_total × c_water).  q_excess = q_warm − q_melt_all`,
      expectedAnswer: parseFloat(sol.finalTemp.toPrecision(4)),
      answerUnit: '°C',
      tolerance: 0.02,
      explanation:
        `q_excess = ${qExcess.toFixed(0)} J; T_f = 0 + ${qExcess.toFixed(0)} / (m_total × 4.184) = ${sol.finalTemp.toFixed(2)}°C`,
    })
  }

  return steps
}

function buildEvapSteps(sol: ReturnType<typeof solveEvaporativeCooling>, heatKJ: number): ChainedStep[] {
  return [
    {
      id: 'mass-evap',
      prompt: `How many grams of water must evaporate to dissipate ${heatKJ.toLocaleString()} kJ of heat?`,
      hint: 'm = q / ΔH_vap  (remember to convert kJ → J first)',
      expectedAnswer: parseFloat(sol.massEvaporated.toPrecision(4)),
      answerUnit: 'g',
      tolerance: 0.02,
      explanation:
        `m = (${(heatKJ * 1000).toLocaleString()} J) ÷ ΔH_vap = ${sol.massEvaporated.toFixed(1)} g of sweat evaporated`,
    },
  ]
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EnergyBalanceTool({ allowCustom = true }: Props) {
  const [subMode, setSubMode] = useState<SubMode>('melting')

  // Partial melting inputs
  const [iceMass,       setIceMass]       = useState('')
  const [iceTemp,       setIceTemp]       = useState('0')
  const [warmMass,      setWarmMass]      = useState('')
  const [warmTemp,      setWarmTemp]      = useState('')

  // Evaporative cooling inputs
  const [heatKJ,        setHeatKJ]        = useState('')
  const [dhVap,         setDhVap]         = useState('2410')

  // Solved problem state
  const [steps,         setSteps]         = useState<ChainedStep[] | null>(null)
  const [scenario,      setScenario]      = useState<string | null>(null)
  const [problemKey,    setProblemKey]    = useState(0)
  const [error,         setError]         = useState<string | null>(null)

  // ── Problem generation (Problems mode) ───────────────────────────────────

  const generateNew = useCallback(() => {
    setSteps(null)
    setError(null)
    if (subMode === 'melting') {
      const p = generatePartialMeltingProblem()
      setIceMass(String(p.inputs.iceMass))
      setIceTemp(String(p.inputs.iceStartTemp))
      setWarmMass(String(p.inputs.warmMass))
      setWarmTemp(String(p.inputs.warmStartTemp))
      setScenario(p.scenario)
    } else {
      const p = generateEvaporativeCoolingProblem()
      setHeatKJ(String(p.inputs.heatInputKJ))
      setDhVap(String(p.inputs.heatOfVaporization))
      setScenario(p.scenario)
    }
    setProblemKey(k => k + 1)
  }, [subMode])

  // Auto-generate on mount for Problems mode
  const [initialized, setInitialized] = useState(false)
  if (!allowCustom && !initialized) {
    setInitialized(true)
    // defer to avoid setState-during-render
    setTimeout(generateNew, 0)
  }

  // ── Solve ─────────────────────────────────────────────────────────────────

  function handleSolve() {
    setError(null)
    setSteps(null)
    try {
      if (subMode === 'melting') {
        const im = parseFloat(iceMass)
        const it = parseFloat(iceTemp)
        const wm = parseFloat(warmMass)
        const wt = parseFloat(warmTemp)
        if ([im, it, wm, wt].some(isNaN)) { setError('Fill in all four fields.'); return }
        const sol = solvePartialMelting({
          iceMass: im, iceStartTemp: it, warmMass: wm, warmStartTemp: wt,
        })
        setSteps(buildMeltingSteps(sol))
      } else {
        const hj = parseFloat(heatKJ) * 1000
        const dv = parseFloat(dhVap)
        if (isNaN(hj) || isNaN(dv)) { setError('Fill in heat and ΔH_vap fields.'); return }
        const sol = solveEvaporativeCooling({ heatInputJ: hj, bodyMass: 0, bodyTemp: 37, heatOfVaporization: dv })
        setSteps(buildEvapSteps(sol, parseFloat(heatKJ)))
      }
      setProblemKey(k => k + 1)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid inputs.')
    }
  }

  // ── Input reset ───────────────────────────────────────────────────────────

  function resetInputs() {
    setSteps(null)
    setError(null)
    setScenario(null)
  }

  const meltingReady = !isNaN(parseFloat(iceMass)) && !isNaN(parseFloat(warmMass)) && !isNaN(parseFloat(warmTemp))
  const evapReady    = !isNaN(parseFloat(heatKJ))

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Sub-mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['melting', 'evap'] as SubMode[]).map(m => {
          const active = subMode === m
          const label  = m === 'melting' ? 'Partial Melting' : 'Evaporative Cooling'
          return (
            <button key={m} onClick={() => { setSubMode(m); resetInputs() }}
              className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
              {active && (
                <motion.div layoutId="eb-mode-switch" className="absolute inset-0 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Problems mode header */}
      {!allowCustom && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">
            {subMode === 'melting' ? 'Partial Melting' : 'Evaporative Cooling'}
          </span>
          <button onClick={generateNew}
            className="font-mono text-xs text-dim hover:text-secondary transition-colors">
            ↻ New problem
          </button>
        </div>
      )}

      {/* Scenario text (Problems mode) */}
      {scenario && (
        <div className="rounded-sm border border-border p-4"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))' }}>
          <p className="font-sans text-sm text-primary leading-relaxed">{scenario}</p>
        </div>
      )}

      {/* Input fields */}
      {allowCustom && (
        <div className="flex flex-col gap-4">
          {subMode === 'melting' ? (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Ice mass" value={iceMass}
                onChange={v => { setIceMass(v); resetInputs() }} unit="g" />
              <NumberField label="Ice initial temp" value={iceTemp}
                onChange={v => { setIceTemp(v); resetInputs() }} unit="°C" />
              <NumberField label="Warm liquid mass" value={warmMass}
                onChange={v => { setWarmMass(v); resetInputs() }} unit="g" />
              <NumberField label="Warm liquid temp" value={warmTemp}
                onChange={v => { setWarmTemp(v); resetInputs() }} unit="°C" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Heat to dissipate" value={heatKJ}
                onChange={v => { setHeatKJ(v); resetInputs() }} unit="kJ" />
              <NumberField label="ΔH_vap" value={dhVap}
                onChange={v => { setDhVap(v); resetInputs() }}
                unit={<span className="font-mono text-sm text-secondary px-2">J/g</span>}
                hint="2410 J/g at body temp (Chang Table 6.1); 2260 J/g at 100°C" />
            </div>
          )}

          {error && (
            <p className="font-mono text-xs" style={{ color: '#f87171' }}>{error}</p>
          )}

          <button
            onClick={handleSolve}
            disabled={subMode === 'melting' ? !meltingReady : !evapReady}
            className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all
                       disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Solve step by step
          </button>
        </div>
      )}

      {/* Problems mode: locked fields with values shown */}
      {!allowCustom && subMode === 'melting' && iceMass && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Ice mass"          value={iceMass}  onChange={() => {}} unit="g"   disabled />
          <NumberField label="Ice initial temp"  value={iceTemp}  onChange={() => {}} unit="°C"  disabled />
          <NumberField label="Warm liquid mass"  value={warmMass} onChange={() => {}} unit="g"   disabled />
          <NumberField label="Warm liquid temp"  value={warmTemp} onChange={() => {}} unit="°C"  disabled />
        </div>
      )}
      {!allowCustom && subMode === 'evap' && heatKJ && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Heat to dissipate" value={heatKJ} onChange={() => {}} unit="kJ"  disabled />
          <NumberField label="ΔH_vap"            value={dhVap}  onChange={() => {}} unit="J/g" disabled />
        </div>
      )}

      {/* Problems mode: Solve button */}
      {!allowCustom && (
        <button
          onClick={handleSolve}
          disabled={subMode === 'melting' ? !meltingReady : !evapReady}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Show me the steps
        </button>
      )}

      {/* Chained problem */}
      <AnimatePresence mode="wait">
        {steps && (
          <motion.div key={problemKey}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ChainedProblem
              scenario={scenario ?? (subMode === 'melting'
                ? `Ice mass: ${iceMass} g at ${iceTemp}°C · Warm liquid: ${warmMass} g at ${warmTemp}°C · c = 4.184 J/g·°C · ΔH_fus = 334 J/g`
                : `Heat to dissipate: ${heatKJ} kJ · ΔH_vap = ${dhVap} J/g`
              )}
              steps={steps}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

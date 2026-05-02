import { useState, useMemo } from 'react'
import { calcDeltaG_method1 } from '../../chem/thermodynamics'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

export default function GibbsTempTool() {
  const [dH, setDH] = useState('')
  const [dS, setDS] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [computed, setComputed] = useState(false)

  function handleCalculate() {
    const dHv = parseFloat(dH)
    const dSv = parseFloat(dS)
    if (isNaN(dHv) || isNaN(dSv)) return
    const s: string[] = [
      'ΔG°(T) = ΔH° − T·ΔS°',
      `ΔH° = ${dHv} kJ/mol,  ΔS° = ${dSv} J/(mol·K) = ${(dSv / 1000).toFixed(4)} kJ/(mol·K)`,
    ]
    if (dSv !== 0) {
      const Tc = (dHv * 1000) / dSv
      if (Tc > 0) {
        s.push(`Crossover T (ΔG°=0): Tc = ΔH°×1000/ΔS° = ${dHv * 1000}/${dSv} = ${Tc.toFixed(1)} K`)
      } else {
        s.push('No positive crossover temperature (ΔH° and ΔS° have opposite signs).')
      }
    }
    setSteps(s)
    setComputed(true)
  }

  const dHv = parseFloat(dH)
  const dSv = parseFloat(dS)

  // Build SVG data points: T from 0 to 1000 K in steps of 50
  const plotData = useMemo(() => {
    if (!computed || isNaN(dHv) || isNaN(dSv)) return null
    const points: { T: number; G: number }[] = []
    for (let T = 0; T <= 1000; T += 50) {
      const G = calcDeltaG_method1(dHv, dSv, T).deltaG
      points.push({ T, G })
    }
    return points
  }, [computed, dHv, dSv])

  // SVG dimensions
  const W = 300, H = 180, PAD = 40

  const svgPath = useMemo(() => {
    if (!plotData) return ''
    const gValues = plotData.map(p => p.G)
    const gMin = Math.min(...gValues)
    const gMax = Math.max(...gValues)
    const gRange = gMax - gMin || 1

    const toX = (T: number) => PAD + ((T / 1000) * (W - 2 * PAD))
    const toY = (G: number) => PAD + ((1 - (G - gMin) / gRange) * (H - 2 * PAD))

    return plotData.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.T).toFixed(1)},${toY(p.G).toFixed(1)}`).join(' ')
  }, [plotData])

  const crossoverT = !isNaN(dHv) && !isNaN(dSv) && dSv !== 0 ? (dHv * 1000) / dSv : null
  const hasCrossover = crossoverT !== null && crossoverT > 0 && crossoverT < 1000

  function generateExample() {
    const { steps: s } = calcDeltaG_method1(178, 160, 298)
    return {
      scenario: 'CaCO₃ decomposition: ΔH° = +178 kJ/mol, ΔS° = +160 J/(mol·K). Find crossover T.',
      steps: [...s, 'Tc = 178000/160 = 1113 K'],
      result: 'Crossover T ≈ 1113 K — spontaneous above this temperature.',
    }
  }

  const stepsState = useStepsPanelState(steps, generateExample)

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <p className="font-sans text-sm text-secondary">
        Enter ΔH° and ΔS° to find the crossover temperature and plot ΔG° vs T.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NumberField label="ΔH° (kJ/mol)" value={dH} onChange={v => { setDH(v); setComputed(false); setSteps([]) }} placeholder="178" unit={<span className="font-mono text-xs text-secondary ml-2">kJ/mol</span>} />
        <NumberField label="ΔS° (J/(mol·K))" value={dS} onChange={v => { setDS(v); setComputed(false); setSteps([]) }} placeholder="160" unit={<span className="font-mono text-xs text-secondary ml-2">J/(mol·K)</span>} />
      </div>

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}>
          Analyse
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {computed && (
        <>
          {hasCrossover && (
            <div className="p-3 rounded-sm border border-border bg-raised">
              <p className="font-mono text-xs text-secondary">Crossover Temperature</p>
              <p className="font-mono text-xl mt-1" style={{ color: 'var(--c-halogen)' }}>
                T<sub>c</sub> = {crossoverT!.toFixed(1)} K ({(crossoverT! - 273.15).toFixed(1)} °C)
              </p>
            </div>
          )}
          {!hasCrossover && crossoverT !== null && crossoverT <= 0 && (
            <p className="font-mono text-sm text-secondary">No crossover temperature at T &gt; 0 K (ΔH° and ΔS° have opposite signs).</p>
          )}

          {/* SVG Plot */}
          {plotData && (
            <div className="p-4 rounded-sm border border-border bg-raised">
              <p className="font-mono text-xs text-secondary mb-2">ΔG° vs Temperature (0–1000 K)</p>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="ΔG vs T plot">
                {/* Axes */}
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgb(var(--color-border))" strokeWidth="1" />
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgb(var(--color-border))" strokeWidth="1" />
                {/* Axis labels */}
                <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="9" fill="rgb(var(--color-secondary))" fontFamily="monospace">T (K)</text>
                <text x="8" y={H / 2} textAnchor="middle" fontSize="9" fill="rgb(var(--color-secondary))" fontFamily="monospace" transform={`rotate(-90, 8, ${H / 2})`}>ΔG° (kJ/mol)</text>
                {/* Zero line if ΔG crosses zero */}
                {(() => {
                  const gValues = plotData.map(p => p.G)
                  const gMin = Math.min(...gValues), gMax = Math.max(...gValues)
                  const gRange = gMax - gMin || 1
                  if (gMin < 0 && gMax > 0) {
                    const y0 = PAD + ((1 - (0 - gMin) / gRange) * (H - 2 * PAD))
                    return <line x1={PAD} y1={y0} x2={W - PAD} y2={y0} stroke="rgb(var(--color-border))" strokeWidth="1" strokeDasharray="4,4" />
                  }
                  return null
                })()}
                {/* Line */}
                <path d={svgPath} fill="none" stroke="var(--c-halogen)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="flex justify-between font-mono text-[10px] text-dim mt-1">
                <span>0 K</span>
                <span>1000 K</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { RATE_LAW_REACTIONS } from '../../data/kineticsReactions'
import { solveRateLaw } from '../../chem/kinetics'

function sig(n: number, sf = 4): string {
  if (!isFinite(n)) return String(n)
  return parseFloat(n.toPrecision(sf)).toString()
}

function buildWorkedExample() {
  const rxn = RATE_LAW_REACTIONS[0] // NO + O₂ → NO₂
  const sol = solveRateLaw({
    species: rxn.species,
    trials: rxn.trials.map(tr => ({ concentrations: tr.concentrations, rate: tr.initialRate })),
  })
  return {
    scenario: `Determine the rate law for: ${rxn.equation}`,
    steps: sol.steps,
    result: `Rate law: ${sol.rateLawExpression}  |  k = ${sig(sol.rateConstant)} ${sol.rateConstantUnit}`,
  }
}

interface RateLawResult {
  orders: Record<string, number>
  k: number
  kUnit: string
  expression: string
  steps: string[]
}

export default function RateLawTool() {
  const [selectedId, setSelectedId] = useState(RATE_LAW_REACTIONS[0].id)
  const [result, setResult] = useState<RateLawResult | null>(null)
  const [steps, setSteps] = useState<string[]>([])

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function handleSolve() {
    const rxn = RATE_LAW_REACTIONS.find(r => r.id === selectedId)!
    const sol = solveRateLaw({
      species: rxn.species,
      trials: rxn.trials.map(tr => ({ concentrations: tr.concentrations, rate: tr.initialRate })),
    })
    setResult({ orders: sol.orders, k: sol.rateConstant, kUnit: sol.rateConstantUnit, expression: sol.rateLawExpression, steps: sol.steps })
    setSteps(sol.steps)
  }

  const rxn = RATE_LAW_REACTIONS.find(r => r.id === selectedId)!

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Select a reaction to determine its rate law using the method of initial rates.
      </p>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs text-secondary uppercase tracking-widest">Reaction</label>
        <select
          value={selectedId}
          onChange={e => { setSelectedId(e.target.value); setResult(null); setSteps([]) }}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-sans text-sm text-primary focus:outline-none focus:border-muted"
        >
          {RATE_LAW_REACTIONS.map(r => (
            <option key={r.id} value={r.id}>{r.equation}</option>
          ))}
        </select>
      </div>

      {/* Data table */}
      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs text-secondary uppercase tracking-widest">Initial Rate Data</p>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--color-border))' }}>
                <th className="text-left py-2 pr-4 font-semibold text-secondary text-xs">Trial</th>
                {rxn.species.map(sp => (
                  <th key={sp} className="text-left py-2 pr-4 font-semibold text-secondary text-xs">[{sp}] (M)</th>
                ))}
                <th className="text-left py-2 font-semibold text-secondary text-xs">Rate (mol/L·s)</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              {rxn.trials.map((tr, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(var(--overlay),0.06)' }}>
                  <td className="py-2 pr-4">{i + 1}</td>
                  {rxn.species.map(sp => (
                    <td key={sp} className="py-2 pr-4">{tr.concentrations[sp]}</td>
                  ))}
                  <td className="py-2" style={{ color: 'var(--c-halogen)' }}>{tr.initialRate.toExponential(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-stretch gap-2">
        <button
          onClick={handleSolve}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Determine Rate Law
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <div className="p-4 rounded-sm flex flex-col gap-3"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-sans text-sm text-secondary">Rate Law:</p>
          <p className="font-mono text-base" style={{ color: 'var(--c-halogen)' }}>{result.expression}</p>
          <div className="flex flex-wrap gap-4 font-mono text-sm text-secondary">
            {rxn.species.map(sp => (
              <span key={sp}>Order in {sp}: <span className="text-primary">{result.orders[sp]}</span></span>
            ))}
          </div>
          <p className="font-mono text-sm text-secondary">
            k = <span className="text-primary">{sig(result.k)}</span> {result.kUnit}
          </p>
        </div>
      )}
    </div>
  )
}

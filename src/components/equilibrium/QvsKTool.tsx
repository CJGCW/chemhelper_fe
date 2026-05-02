import { useState } from 'react'
import { EQUILIBRIUM_REACTIONS } from '../../data/equilibriumReactions'
import { solveQvsK } from '../../chem/equilibrium'

function activeSpecies(reaction: typeof EQUILIBRIUM_REACTIONS[0]) {
  return [
    ...reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq'),
    ...reaction.products.filter(s => s.state === 'g' || s.state === 'aq'),
  ]
}

export default function QvsKTool() {
  const [selectedId, setSelectedId] = useState(EQUILIBRIUM_REACTIONS[0].id)
  const [concentrations, setConcentrations] = useState<Record<string, string>>({})

  const reaction = EQUILIBRIUM_REACTIONS.find(r => r.id === selectedId) ?? EQUILIBRIUM_REACTIONS[0]
  const species = activeSpecies(reaction)

  function handleReactionChange(id: string) {
    setSelectedId(id)
    setConcentrations({})
  }

  const allFilled = species.every(s => concentrations[s.formula]?.trim() !== '' && concentrations[s.formula] !== undefined)
  const concNums: Record<string, number> = {}
  for (const s of species) concNums[s.formula] = parseFloat(concentrations[s.formula] ?? '0') || 0

  const result = allFilled
    ? solveQvsK({ concentrations: concNums, products: reaction.products, reactants: reaction.reactants, K: reaction.K })
    : null

  const directionColor = result?.direction === 'forward'
    ? 'rgb(34 197 94)'
    : result?.direction === 'reverse'
    ? 'rgb(239 68 68)'
    : 'var(--c-halogen)'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Enter current concentrations to calculate Q, then compare to K.
      </p>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm text-secondary">Reaction</label>
        <select
          value={selectedId}
          onChange={e => handleReactionChange(e.target.value)}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:border-muted"
        >
          {EQUILIBRIUM_REACTIONS.filter(r => activeSpecies(r).length > 0).map(r => (
            <option key={r.id} value={r.id}>{r.equation}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-sans text-sm text-secondary">Current Concentrations (M)</p>
        <div className="grid grid-cols-2 gap-3">
          {species.map(s => (
            <div key={s.formula} className="flex flex-col gap-1">
              <label className="font-mono text-xs text-secondary">[{s.formula}]</label>
              <input
                type="text"
                inputMode="decimal"
                value={concentrations[s.formula] ?? ''}
                onChange={e => setConcentrations(prev => ({ ...prev, [s.formula]: e.target.value }))}
                placeholder="0.00"
                className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-primary focus:outline-none focus:border-muted"
              />
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="rounded-sm p-5 flex flex-col gap-4"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <div className="flex items-center gap-4 flex-wrap font-mono text-base">
            <span className="text-secondary">Q = <span className="text-primary font-bold">{parseFloat(result.Q.toPrecision(3))}</span></span>
            <span className="text-secondary">K = <span className="text-primary font-bold">{reaction.K.toPrecision(3)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-medium" style={{ color: directionColor }}>
              {result.direction === 'forward' ? '\u2192 Shifts Forward' : result.direction === 'reverse' ? '\u2190 Shifts Reverse' : '\u21cc At Equilibrium'}
            </span>
          </div>
          <p className="font-sans text-sm text-secondary leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-secondary uppercase tracking-wider">Steps</p>
          <ol className="flex flex-col gap-1.5">
            {result.steps.map((step, i) => (
              <li key={i} className="flex gap-2 font-sans text-sm text-secondary">
                <span className="font-mono text-primary shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

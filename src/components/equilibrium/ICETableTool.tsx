import { useState } from 'react'
import { EQUILIBRIUM_REACTIONS } from '../../data/equilibriumReactions'
import { solveICETable } from '../../chem/equilibrium'
import ICETable from '../shared/ICETable'

const ICE_SUITABLE = ['n2o4-no2', 'h2-i2-hi', 'pcl5-pcl3-cl2', 'water-gas-shift', 'co-cl2-cocl2', 'n2-h2-nh3', 'ch4-h2o-co-h2', 'hf-h2-f2']

function activeSpecies(reaction: typeof EQUILIBRIUM_REACTIONS[0]) {
  return [
    ...reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq'),
    ...reaction.products.filter(s => s.state === 'g' || s.state === 'aq'),
  ]
}

const SUITABLE_REACTIONS = EQUILIBRIUM_REACTIONS.filter(r => ICE_SUITABLE.includes(r.id))

export default function ICETableTool() {
  const [selectedId, setSelectedId] = useState(SUITABLE_REACTIONS[0].id)
  const [initConc, setInitConc] = useState<Record<string, string>>({})

  const reaction = SUITABLE_REACTIONS.find(r => r.id === selectedId) ?? SUITABLE_REACTIONS[0]
  const species = activeSpecies(reaction)

  function handleReactionChange(id: string) {
    setSelectedId(id)
    setInitConc({})
  }

  const allReactantsFilled = reaction.reactants
    .filter(s => s.state === 'g' || s.state === 'aq')
    .every(s => initConc[s.formula]?.trim())

  const initial: Record<string, number> = {}
  for (const s of species) {
    initial[s.formula] = parseFloat(initConc[s.formula] ?? '0') || 0
  }

  const result = allReactantsFilled
    ? (() => {
        try {
          return solveICETable({ products: reaction.products, reactants: reaction.reactants, initial, K: reaction.K, kType: reaction.kType })
        } catch {
          return null
        }
      })()
    : null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Enter initial reactant concentrations (products default to 0) to solve the ICE table.
      </p>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm text-secondary">Reaction</label>
        <select
          value={selectedId}
          onChange={e => handleReactionChange(e.target.value)}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:border-muted"
        >
          {SUITABLE_REACTIONS.map(r => (
            <option key={r.id} value={r.id}>{r.equation}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-sans text-sm text-secondary">Initial Concentrations (M)</p>
        <div className="grid grid-cols-2 gap-3">
          {reaction.reactants.filter(s => s.state === 'g' || s.state === 'aq').map(s => (
            <div key={s.formula} className="flex flex-col gap-1">
              <label className="font-mono text-xs text-secondary">[{s.formula}]₀ (reactant)</label>
              <input
                type="text"
                inputMode="decimal"
                value={initConc[s.formula] ?? ''}
                onChange={e => setInitConc(prev => ({ ...prev, [s.formula]: e.target.value }))}
                placeholder="e.g. 0.0400"
                className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-primary focus:outline-none focus:border-muted"
              />
            </div>
          ))}
          {reaction.products.filter(s => s.state === 'g' || s.state === 'aq').map(s => (
            <div key={s.formula} className="flex flex-col gap-1">
              <label className="font-mono text-xs text-dim">[{s.formula}]₀ (product, usually 0)</label>
              <input
                type="text"
                inputMode="decimal"
                value={initConc[s.formula] ?? ''}
                onChange={e => setInitConc(prev => ({ ...prev, [s.formula]: e.target.value }))}
                placeholder="0"
                className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-dim focus:outline-none focus:border-muted"
              />
            </div>
          ))}
        </div>
      </div>

      {result && (
        <>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">ICE Table</p>
            <ICETable rows={result.rows} />
          </div>

          <div className="rounded-sm p-4 flex flex-col gap-2"
            style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-sm text-secondary">x = <span className="text-primary font-bold">{parseFloat(result.x.toPrecision(4))}</span> M</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: result.approximationValid ? 'rgba(34,197,94,0.12)' : 'rgba(251,146,60,0.12)',
                  color: result.approximationValid ? 'rgb(34 197 94)' : 'rgb(251 146 60)',
                  border: `1px solid ${result.approximationValid ? 'rgba(34,197,94,0.3)' : 'rgba(251,146,60,0.3)'}`,
                }}>
                {result.approximationValid ? '5% approx valid' : result.usedQuadratic ? 'quadratic used' : 'exact'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {Object.entries(result.equilibriumConcentrations).map(([sp, c]) => (
                <div key={sp} className="font-mono text-sm">
                  <span className="text-secondary">[{sp}]<sub>eq</sub> = </span>
                  <span className="text-primary">{parseFloat(c.toPrecision(4))} M</span>
                </div>
              ))}
            </div>
          </div>

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
        </>
      )}
    </div>
  )
}

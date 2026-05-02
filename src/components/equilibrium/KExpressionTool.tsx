import { useState } from 'react'
import { EQUILIBRIUM_REACTIONS } from '../../data/equilibriumReactions'
import { buildKExpression } from '../../chem/equilibrium'

export default function KExpressionTool() {
  const [selectedId, setSelectedId] = useState(EQUILIBRIUM_REACTIONS[0].id)

  const reaction = EQUILIBRIUM_REACTIONS.find(r => r.id === selectedId) ?? EQUILIBRIUM_REACTIONS[0]
  const result = buildKExpression(reaction.products, reaction.reactants)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Select a reaction to see its equilibrium constant expression. Pure solids and liquids are automatically omitted.
      </p>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm text-secondary">Reaction</label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:border-muted"
        >
          {EQUILIBRIUM_REACTIONS.map(r => (
            <option key={r.id} value={r.id}>{r.equation}</option>
          ))}
        </select>
      </div>

      <div className="rounded-sm p-5 flex flex-col gap-4"
        style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs text-secondary uppercase tracking-wider">Reaction</p>
          <p className="font-mono text-base text-primary">{reaction.equation}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs text-secondary uppercase tracking-wider">K<sub>c</sub> Expression</p>
          <p className="font-mono text-lg text-primary" style={{ color: 'var(--c-halogen)' }}>
            K<sub>c</sub> = {result.kcExpression}
          </p>
        </div>

        {result.deltaN !== 0 && (
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">K<sub>p</sub> Expression</p>
            <p className="font-mono text-base text-primary">K<sub>p</sub> = {result.kpExpression}</p>
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap text-sm font-mono">
          <span className="text-secondary">\u0394n<sub>gas</sub> = <span className="text-primary">{result.deltaN}</span></span>
          <span className="text-secondary">K = <span className="text-primary">{reaction.K.toPrecision(3)}</span></span>
          <span className="text-secondary">at <span className="text-primary">{reaction.T} K</span></span>
          <span className="text-secondary">K type: <span className="text-primary">{reaction.kType}</span></span>
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

      {/* Note about omitted species */}
      {[...reaction.products, ...reaction.reactants].some(s => s.state === 's' || s.state === 'l') && (
        <div className="rounded-sm px-3 py-2 font-sans text-xs text-secondary"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          Pure solids/liquids omitted from K expression:{' '}
          {[...reaction.products, ...reaction.reactants]
            .filter(s => s.state === 's' || s.state === 'l')
            .map(s => `${s.formula}(${s.state})`)
            .join(', ')}
        </div>
      )}
    </div>
  )
}

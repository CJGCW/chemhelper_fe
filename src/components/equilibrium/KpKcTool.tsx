import { useState } from 'react'
import { EQUILIBRIUM_REACTIONS } from '../../data/equilibriumReactions'
import { buildKExpression, convertKpKc } from '../../chem/equilibrium'

export default function KpKcTool() {
  const [knownType, setKnownType] = useState<'Kp' | 'Kc'>('Kc')
  const [knownValue, setKnownValue] = useState('')
  const [T, setT] = useState('')
  const [deltaN, setDeltaN] = useState('')

  const [selectedId, setSelectedId] = useState('')
  const [useReaction, setUseReaction] = useState(true)

  const reaction = selectedId ? EQUILIBRIUM_REACTIONS.find(r => r.id === selectedId) : null

  let computedDeltaN: number | null = null
  if (reaction) {
    const { deltaN: dn } = buildKExpression(reaction.products, reaction.reactants)
    computedDeltaN = dn
  }

  const effectiveDeltaN = useReaction && computedDeltaN !== null ? computedDeltaN : parseInt(deltaN)
  const effectiveT = useReaction && reaction ? reaction.T : parseFloat(T)
  const effectiveValue = useReaction && reaction ? reaction.K : parseFloat(knownValue)

  const canSolve = isFinite(effectiveDeltaN) && isFinite(effectiveT) && isFinite(effectiveValue) && effectiveT > 0

  const result = canSolve
    ? (() => {
        try {
          return convertKpKc({ type: knownType, value: effectiveValue }, effectiveT, effectiveDeltaN)
        } catch {
          return null
        }
      })()
    : null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Convert between K<sub>p</sub> and K<sub>c</sub> using K<sub>p</sub> = K<sub>c</sub>(RT)<sup>\u0394n</sup>.
      </p>

      {/* Mode tabs */}
      <div className="flex items-center gap-2">
        <button onClick={() => setUseReaction(true)}
          className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: useReaction ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))',
            border: useReaction ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid rgb(var(--color-border))',
            color: useReaction ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))',
          }}>
          From reaction list
        </button>
        <button onClick={() => setUseReaction(false)}
          className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: !useReaction ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))',
            border: !useReaction ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid rgb(var(--color-border))',
            color: !useReaction ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))',
          }}>
          Manual entry
        </button>
      </div>

      {useReaction ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="font-sans text-sm text-secondary">Reaction</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:border-muted"
            >
              <option value="">-- Select a reaction --</option>
              {EQUILIBRIUM_REACTIONS.map(r => (
                <option key={r.id} value={r.id}>{r.equation}</option>
              ))}
            </select>
          </div>
          {reaction && (
            <div className="rounded-sm px-3 py-2 font-mono text-xs text-secondary"
              style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
              K = {reaction.K.toPrecision(3)} ({reaction.kType}) &nbsp; T = {reaction.T} K &nbsp; \u0394n = {computedDeltaN}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm text-secondary">Known K type</label>
            <div className="flex gap-2">
              {(['Kc', 'Kp'] as const).map(t => (
                <button key={t} onClick={() => setKnownType(t)}
                  className="px-4 py-1.5 rounded-sm font-mono text-sm transition-colors"
                  style={{
                    background: knownType === t ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))',
                    border: knownType === t ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid rgb(var(--color-border))',
                    color: knownType === t ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm text-secondary">Known type</label>
            <div className="flex gap-2">
              {(['Kc', 'Kp'] as const).map(t => (
                <button key={t} onClick={() => setKnownType(t)}
                  className="px-4 py-1.5 rounded-sm font-mono text-sm transition-colors"
                  style={{
                    background: knownType === t ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))',
                    border: knownType === t ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid rgb(var(--color-border))',
                    color: knownType === t ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm text-secondary">K value</label>
            <input type="text" inputMode="decimal" value={knownValue} onChange={e => setKnownValue(e.target.value)}
              placeholder="e.g. 4.63e-3"
              className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-primary focus:outline-none focus:border-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm text-secondary">Temperature (K)</label>
            <input type="text" inputMode="decimal" value={T} onChange={e => setT(e.target.value)}
              placeholder="e.g. 298"
              className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-primary focus:outline-none focus:border-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm text-secondary">\u0394n (gas)</label>
            <input type="text" inputMode="decimal" value={deltaN} onChange={e => setDeltaN(e.target.value)}
              placeholder="e.g. 1 or -2"
              className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-primary focus:outline-none focus:border-muted" />
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-sm p-5 flex flex-col gap-3"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <div className="font-mono text-lg" style={{ color: 'var(--c-halogen)' }}>
            {result.label} = {parseFloat(result.answer.toPrecision(4))}
          </div>
          <div className="flex flex-col gap-1.5">
            {result.steps.map((step, i) => (
              <p key={i} className="font-mono text-sm text-secondary">{step}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { COMMON_NUCLIDES } from '../../data/nuclearData'

function fmtHalfLife(n: Nuclide): string {
  if (!n.halfLife || !n.halfLifeUnit) return 'Stable'
  let val: number
  switch (n.halfLifeUnit) {
    case 'yr':   val = n.halfLife / (365.25 * 24 * 3600); break
    case 'days': val = n.halfLife / (24 * 3600); break
    case 'hr':   val = n.halfLife / 3600; break
    default:     val = n.halfLife; break
  }
  const formatted = val >= 1e6 ? val.toExponential(3)
    : val >= 1000 ? parseFloat(val.toPrecision(4)).toLocaleString()
    : parseFloat(val.toPrecision(4)).toString()
  return `${formatted} ${n.halfLifeUnit}`
}

import type { Nuclide } from '../../data/nuclearData'

export default function HalfLifeReference() {
  const radioactive = COMMON_NUCLIDES.filter(n => n.decayMode !== 'stable')
  const stable      = COMMON_NUCLIDES.filter(n => n.decayMode === 'stable')

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Formulas */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Half-Life Equations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Amount remaining', formula: 'N = N₀ × (1/2)^(t / t½)', note: 'N₀ = initial amount, t = elapsed time' },
            { label: 'Decay constant', formula: 'λ = ln 2 / t½ ≈ 0.693 / t½', note: 'λ in units of 1/time' },
            { label: 'Exponential form', formula: 'N = N₀ × e^(−λt)', note: 'Equivalent to the (1/2)^n form' },
            { label: 'Number of half-lives', formula: 'n = t / t½', note: 'Fraction remaining = (1/2)^n' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-1 p-4 rounded-sm border border-border bg-surface">
              <span className="font-mono text-xs text-secondary uppercase tracking-wider">{item.label}</span>
              <span className="font-mono text-base" style={{ color: 'var(--c-halogen)' }}>{item.formula}</span>
              <span className="font-sans text-xs text-dim">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection to kinetics */}
      <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
        <h4 className="font-sans text-sm font-semibold text-primary">Connection to First-Order Kinetics (Chapter 13)</h4>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Radioactive decay is a <strong>first-order process</strong>. The integrated rate law for first order is
          ln[A]_t = ln[A]₀ − kt. Replacing [A] with N and k with λ gives N = N₀ e^(−λt), which is equivalent to
          N = N₀ (1/2)^(t/t½). The half-life of a first-order reaction is constant: t½ = ln2 / k — it does not
          depend on how much material is present.
        </p>
      </div>

      {/* Decay table */}
      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-bright text-lg">Half-Lives of Common Nuclides</h3>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr style={{ background: 'rgb(var(--color-raised))' }}>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Nuclide</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Name</th>
                <th className="text-right px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Half-Life</th>
                <th className="text-left px-4 py-3 font-mono text-xs text-secondary uppercase tracking-wider border-b border-border">Decay</th>
              </tr>
            </thead>
            <tbody>
              {radioactive.map((n, i) => (
                <tr key={n.symbol} style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
                  <td className="px-4 py-2 font-mono" style={{ color: 'var(--c-halogen)' }}>{n.symbol}</td>
                  <td className="px-4 py-2 font-sans text-primary">{n.name}</td>
                  <td className="px-4 py-2 font-mono text-right text-primary">{fmtHalfLife(n)}</td>
                  <td className="px-4 py-2 font-mono text-sm text-secondary">{n.decayMode}</td>
                </tr>
              ))}
              {stable.map((n, i) => (
                <tr key={n.symbol} style={{ background: (i + radioactive.length) % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-base))' }}>
                  <td className="px-4 py-2 font-mono text-dim">{n.symbol}</td>
                  <td className="px-4 py-2 font-sans text-dim">{n.name}</td>
                  <td className="px-4 py-2 font-mono text-right text-dim">Stable</td>
                  <td className="px-4 py-2 font-mono text-sm text-dim">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-mono text-xs text-secondary">
        Half-life data from Chang's Chemistry, 14e, Table 19.1. Stable nuclides have no measurable half-life.
      </p>
    </div>
  )
}

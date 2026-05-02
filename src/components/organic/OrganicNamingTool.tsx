import { useState } from 'react'
import { IUPAC_PREFIXES } from '../../data/functionalGroups'
import { straightChainAlkaneName, straightChainAlkeneName, straightChainAlkyneName } from '../../chem/organic'

type Family = 'alkane' | 'alkene' | 'alkyne'

export default function OrganicNamingTool() {
  const [n, setN] = useState<number>(4)
  const [family, setFamily] = useState<Family>('alkane')

  function getFormula() {
    if (family === 'alkane') {
      const H = 2 * n + 2
      return `C${n}H${H}`
    } else if (family === 'alkene') {
      const H = 2 * n
      return `C${n}H${H}`
    } else {
      const H = 2 * n - 2
      return `C${n}H${H}`
    }
  }

  function getName() {
    if (family === 'alkane') return straightChainAlkaneName(n)
    if (family === 'alkene') return straightChainAlkeneName(n)
    return straightChainAlkyneName(n)
  }

  function getSuffix() {
    return family === 'alkane' ? '-ane' : family === 'alkene' ? '-ene' : '-yne'
  }

  const prefix = IUPAC_PREFIXES[n] ?? ''
  const name = getName()
  const formula = getFormula()
  const suffix = getSuffix()

  const minN = family === 'alkyne' ? 2 : family === 'alkene' ? 2 : 1
  const maxN = 10

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-4 p-5 rounded-sm border border-border bg-surface">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">IUPAC Name Generator</h3>

        <div className="flex flex-col gap-3">
          {/* Family select */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-secondary">Hydrocarbon family</label>
            <div className="flex gap-2">
              {(['alkane', 'alkene', 'alkyne'] as Family[]).map(f => (
                <button key={f}
                  onClick={() => {
                    setFamily(f)
                    if (f === 'alkene' && n < 2) setN(2)
                    if (f === 'alkyne' && n < 2) setN(2)
                  }}
                  className="px-4 py-1.5 rounded-sm font-sans text-sm capitalize transition-all relative"
                  style={family === f ? {
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    color: 'var(--c-halogen)',
                  } : {
                    background: 'rgb(var(--color-raised))',
                    border: '1px solid rgb(var(--color-border))',
                    color: 'rgba(var(--overlay),0.5)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* n slider */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-secondary">Number of carbons (n = {n})</label>
            <input
              type="range"
              min={minN}
              max={maxN}
              value={n}
              onChange={e => setN(parseInt(e.target.value))}
              className="w-full accent-[var(--c-halogen)]"
            />
            <div className="flex justify-between font-mono text-xs text-dim">
              <span>{minN}</span>
              <span>{maxN}</span>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col gap-3 p-4 rounded-sm border border-border bg-raised mt-2">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-dim uppercase tracking-wider">Molecular formula</span>
              <span className="font-mono text-2xl font-bold text-bright">{formula}</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="font-mono text-xs text-dim uppercase tracking-wider">IUPAC name</span>
              <span className="font-sans text-2xl font-bold text-primary">{name}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            <p className="font-sans text-sm text-secondary">
              <strong className="text-primary">Prefix:</strong>{' '}
              <span className="font-mono">{prefix}-</span>
              {' '}({n} carbon{n !== 1 ? 's' : ''})
            </p>
            <p className="font-sans text-sm text-secondary">
              <strong className="text-primary">Suffix:</strong>{' '}
              <span className="font-mono">{suffix}</span>
              {' '}({family})
            </p>
            <p className="font-sans text-sm text-secondary">
              <strong className="text-primary">Name breakdown:</strong>{' '}
              <span className="font-mono">{prefix}</span> + <span className="font-mono">{suffix.replace('-', '')}</span>
              {' '}= <strong className="text-bright">{name}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-sm border border-border bg-surface">
        <p className="font-mono text-xs text-secondary uppercase tracking-wider mb-3">General Formulas</p>
        <div className="flex flex-col gap-2 font-sans text-sm text-secondary">
          <p><strong className="font-mono text-primary">Alkane:</strong> CₙH₂ₙ₊₂ — n={n}: H = {2*n+2}</p>
          {n >= 2 && <p><strong className="font-mono text-primary">Alkene:</strong> CₙH₂ₙ — n={n}: H = {2*n}</p>}
          {n >= 2 && <p><strong className="font-mono text-primary">Alkyne:</strong> CₙH₂ₙ₋₂ — n={n}: H = {2*n-2}</p>}
        </div>
      </div>
    </div>
  )
}

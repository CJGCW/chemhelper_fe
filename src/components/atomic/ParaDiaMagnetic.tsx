import { useState } from 'react'
import { ELEMENTS, SYMBOL_TO_Z, computeConfig, EXCEPTIONS } from './electronConfigUtils'

// ── Common oxidation states by Z ─────────────────────────────────────────────
// Only non-zero charges listed; 0 (neutral) is always available.

const VALID_CHARGES: Partial<Record<number, number[]>> = {
  1:  [-1, 1],           // H
  3:  [1],               // Li
  4:  [2],               // Be
  5:  [3],               // B
  6:  [-4, 2, 4],        // C
  7:  [-3, 3, 5],        // N
  8:  [-2, -1],          // O
  9:  [-1],              // F
  11: [1],               // Na
  12: [2],               // Mg
  13: [3],               // Al
  14: [-4, 4],           // Si
  15: [-3, 3, 5],        // P
  16: [-2, 2, 4, 6],     // S
  17: [-1, 1, 3, 5, 7],  // Cl
  19: [1],               // K
  20: [2],               // Ca
  21: [3],               // Sc
  22: [2, 3, 4],         // Ti
  23: [2, 3, 4, 5],      // V
  24: [2, 3, 6],         // Cr
  25: [2, 3, 4, 6, 7],   // Mn
  26: [2, 3],            // Fe
  27: [2, 3],            // Co
  28: [2, 3],            // Ni
  29: [1, 2],            // Cu
  30: [2],               // Zn
  31: [1, 3],            // Ga
  32: [2, 4],            // Ge
  33: [-3, 3, 5],        // As
  34: [-2, 4, 6],        // Se
  35: [-1, 1, 3, 5],     // Br
  37: [1],               // Rb
  38: [2],               // Sr
  39: [3],               // Y
  40: [4],               // Zr
  42: [3, 4, 6],         // Mo
  44: [2, 3, 4, 6, 8],   // Ru
  45: [3],               // Rh
  46: [2, 4],            // Pd
  47: [1, 2],            // Ag
  48: [2],               // Cd
  49: [1, 3],            // In
  50: [2, 4],            // Sn
  51: [-3, 3, 5],        // Sb
  52: [-2, 4, 6],        // Te
  53: [-1, 1, 3, 5, 7],  // I
  55: [1],               // Cs
  56: [2],               // Ba
  57: [3],               // La
  58: [3, 4],            // Ce
  74: [4, 6],            // W
  76: [4, 6, 8],         // Os
  77: [3, 4],            // Ir
  78: [2, 4],            // Pt
  79: [1, 3],            // Au
  80: [1, 2],            // Hg
  81: [1, 3],            // Tl
  82: [2, 4],            // Pb
  83: [3, 5],            // Bi
}

function availableCharges(z: number): number[] {
  const extras = VALID_CHARGES[z] ?? []
  return [...extras.filter(c => c < 0).sort((a, b) => a - b),
          0,
          ...extras.filter(c => c > 0).sort((a, b) => a - b)]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function countUnpaired(z: number): number {
  const config = computeConfig(z)
  return config.reduce((sum, sub) => {
    const up   = Math.min(sub.electrons, sub.orbitals)
    const down = Math.max(0, sub.electrons - sub.orbitals)
    return sum + (up - down)
  }, 0)
}

// ── Element selector ──────────────────────────────────────────────────────────

function ElementSelector({ z, onChange }: { z: number; onChange: (z: number) => void }) {
  const [input, setInput] = useState('')

  function commit(raw: string) {
    const trimmed = raw.trim()
    const num = parseInt(trimmed, 10)
    if (!isNaN(num) && num >= 1 && num <= 118) { onChange(num); return }
    const bySymbol = SYMBOL_TO_Z[trimmed.toUpperCase()]
    if (bySymbol) { onChange(bySymbol); return }
  }

  const el = ELEMENTS[z]
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center">
        <button onClick={() => onChange(Math.max(1, z - 1))}
          className="w-7 h-8 rounded-l-sm border border-border font-mono text-sm text-dim hover:text-primary transition-colors flex items-center justify-center">
          −
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onBlur={e => { commit(e.target.value); setInput('') }}
          onKeyDown={e => { if (e.key === 'Enter') { commit(input); setInput('') } }}
          placeholder={`${z}`}
          className="w-16 h-8 border-y border-border bg-raised px-2 font-mono text-sm text-bright
                     text-center focus:outline-none focus:border-muted placeholder:text-secondary"
        />
        <button onClick={() => onChange(Math.min(118, z + 1))}
          className="w-7 h-8 rounded-r-sm border border-border font-mono text-sm text-dim hover:text-primary transition-colors flex items-center justify-center">
          +
        </button>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold text-bright">{el.symbol}</span>
        <span className="font-sans text-sm text-secondary">{el.name}</span>
        <span className="font-mono text-xs text-dim">Z = {z}</span>
      </div>
      {EXCEPTIONS[z] && (
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
          Aufbau exception
        </span>
      )}
    </div>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ label, unpaired, charge }: { label: string; unpaired: number; charge: number }) {
  const isPara = unpaired > 0
  return (
    <div className="flex flex-col gap-3 px-5 py-4 rounded-sm border"
      style={{
        borderColor: isPara
          ? 'color-mix(in srgb, #f59e0b 30%, transparent)'
          : 'color-mix(in srgb, #34d399 30%, transparent)',
        background: isPara
          ? 'color-mix(in srgb, #f59e0b 5%, transparent)'
          : 'color-mix(in srgb, #34d399 5%, transparent)',
      }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm text-bright">{label}</span>
        {charge !== 0 && (
          <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-raised border border-border text-secondary">
            {charge > 0 ? `+${charge}` : charge} ion
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-3xl font-bold"
          style={{ color: isPara ? '#f59e0b' : '#34d399' }}>
          {unpaired}
        </span>
        <div className="flex flex-col">
          <span className="font-sans text-sm font-semibold"
            style={{ color: isPara ? '#f59e0b' : '#34d399' }}>
            {isPara ? 'Paramagnetic' : 'Diamagnetic'}
          </span>
          <span className="font-sans text-xs text-secondary">
            {isPara
              ? `${unpaired} unpaired electron${unpaired !== 1 ? 's' : ''} — attracted to magnetic field`
              : 'All electrons paired — weakly repelled'}
          </span>
        </div>
      </div>
      {/* Unpaired electron visual */}
      {unpaired > 0 && (
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: unpaired }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-sm border flex items-center justify-center"
              style={{
                borderColor: 'rgba(245,158,11,0.4)',
                background: 'rgba(245,158,11,0.08)',
              }}>
              <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>↑</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const COMMON_IONS: { symbol: string; charges: number[] }[] = [
  { symbol: 'Fe', charges: [2, 3] },
  { symbol: 'Cu', charges: [1, 2] },
  { symbol: 'Mn', charges: [2, 4] },
  { symbol: 'Co', charges: [2, 3] },
  { symbol: 'Ni', charges: [2]    },
  { symbol: 'Cr', charges: [2, 3] },
  { symbol: 'Na', charges: [1]    },
  { symbol: 'Mg', charges: [2]    },
  { symbol: 'Al', charges: [3]    },
  { symbol: 'Cl', charges: [-1]   },
  { symbol: 'O',  charges: [-2]   },
  { symbol: 'N',  charges: [-3]   },
]

export default function ParaDiaMagnetic() {
  const [z, setZ] = useState(26)   // Fe — classic transition metal, interesting results
  const [charge, setCharge] = useState(0)

  const el = ELEMENTS[z]

  // Effective electron count for the ion
  const electronCount = z - charge
  const validIon = electronCount >= 1 && electronCount <= 118

  const neutralUnpaired = countUnpaired(z)
  const ionUnpaired     = validIon ? countUnpaired(electronCount) : null

  const config = computeConfig(z)

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Explanation card */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
        <p className="font-sans font-semibold text-bright">Magnetic Behaviour from Electron Configuration</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              term: 'Paramagnetic',
              rule: 'Has one or more unpaired electrons',
              detail: 'Weakly attracted to external magnetic field — unpaired spins align with the field.',
              color: '#f59e0b',
            },
            {
              term: 'Diamagnetic',
              rule: 'All electrons are paired',
              detail: 'Weakly repelled by external magnetic field — paired spins cancel out completely.',
              color: '#34d399',
            },
          ].map(item => (
            <div key={item.term} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-sans text-sm font-semibold" style={{ color: item.color }}>{item.term}</span>
              <span className="font-mono text-xs text-secondary">{item.rule}</span>
              <span className="font-sans text-xs text-dim leading-relaxed">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Element selector */}
      <div className="flex flex-col gap-4">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Select Element</span>
        <ElementSelector z={z} onChange={newZ => {
          setZ(newZ)
          const valid = availableCharges(newZ)
          if (!valid.includes(charge)) setCharge(0)
        }} />
      </div>

      {/* Ion charge selector */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Ion Charge (optional)</span>
        <div className="flex items-center gap-2 flex-wrap">
          {availableCharges(z).map(c => (
            <button
              key={c}
              onClick={() => setCharge(c)}
              className="w-10 h-8 rounded-sm border font-mono text-sm transition-colors"
              style={{
                borderColor: charge === c
                  ? 'color-mix(in srgb, var(--c-halogen) 60%, transparent)'
                  : '#1c1f2e',
                background: charge === c
                  ? 'color-mix(in srgb, var(--c-halogen) 12%, #141620)'
                  : '#0e1016',
                color: charge === c ? 'var(--c-halogen)' : 'rgba(255,255,255,0.45)',
              }}>
              {c === 0 ? '0' : c > 0 ? `+${c}` : c}
            </button>
          ))}
        </div>
      </div>

      {/* Electron configuration notation */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">
          Electron Configuration — {el.symbol}{charge !== 0 ? (charge > 0 ? `${charge}+` : `${Math.abs(charge)}−`) : ''}
        </span>
        <div className="px-4 py-3 rounded-sm bg-surface border border-border font-mono text-sm text-primary leading-relaxed">
          {charge === 0 ? (
            config.filter(s => s.electrons > 0)
              .map(s => `${s.label}${s.electrons}`)
              .join(' ')
          ) : validIon ? (
            computeConfig(electronCount)
              .filter(s => s.electrons > 0)
              .map(s => `${s.label}${s.electrons}`)
              .join(' ')
          ) : (
            <span className="text-dim">Invalid ion</span>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Result</span>
        <ResultCard
          label={charge === 0 ? `${el.name} (${el.symbol})` : `${el.name} ion (${el.symbol}${charge > 0 ? `${charge}+` : `${Math.abs(charge)}−`})`}
          unpaired={charge === 0 ? neutralUnpaired : (ionUnpaired ?? 0)}
          charge={charge}
        />
      </div>

      {/* Compare neutral vs ion when charge != 0 */}
      {charge !== 0 && validIon && (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Compare — Neutral Atom</span>
          <ResultCard label={`${el.name} (${el.symbol}) neutral`} unpaired={neutralUnpaired} charge={0} />
        </div>
      )}

      {/* Quick-reference table for common species */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Common Ions Quick Reference</span>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal">Ion</th>
                <th className="px-3 py-2 text-left text-dim font-normal">Config (abbrev.)</th>
                <th className="px-3 py-2 text-left text-dim font-normal">Unpaired e⁻</th>
                <th className="px-3 py-2 text-left text-dim font-normal">Type</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_IONS.flatMap(item => {
                const baseZ = SYMBOL_TO_Z[item.symbol.toUpperCase()]
                if (!baseZ) return []
                return item.charges.map(c => {
                  const eCount = baseZ - c
                  if (eCount < 1 || eCount > 118) return null
                  const u = countUnpaired(eCount)
                  const label = `${item.symbol}${c > 0 ? `${c}+` : `${Math.abs(c)}−`}`
                  const cfgShort = computeConfig(eCount).filter(s => s.electrons > 0).map(s => `${s.label}${s.electrons}`).join(' ')
                  const isActive = ELEMENTS[baseZ].symbol === el.symbol && charge === c
                  return (
                    <tr key={label}
                      className={`border-b border-border last:border-b-0 cursor-pointer hover:bg-raised transition-colors ${isActive ? 'bg-raised' : ''}`}
                      onClick={() => { setZ(baseZ); setCharge(c) }}>
                      <td className="px-3 py-2 text-primary font-semibold">{label}</td>
                      <td className="px-3 py-2 text-dim truncate max-w-[160px]">{cfgShort}</td>
                      <td className="px-3 py-2">
                        <span style={{ color: u > 0 ? '#f59e0b' : '#34d399' }}>{u}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span style={{ color: u > 0 ? '#f59e0b' : '#34d399' }}>
                          {u > 0 ? 'Para' : 'Dia'}
                        </span>
                      </td>
                    </tr>
                  )
                }).filter(Boolean)
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

import { useState } from 'react'
import { ELEMENTS, SYMBOL_TO_Z, computeConfig, EXCEPTIONS } from './electronConfigUtils'

// ── Slater's Rules ────────────────────────────────────────────────────────────
// Groups: [1s] [2s,2p] [3s,3p] [3d] [4s,4p] [4d] [4f] [5s,5p] [5d] ...

type SlaterGroup = { n: number; l: string[]; electrons: number }

function buildSlaterGroups(z: number): SlaterGroup[] {
  const config = computeConfig(z)
  // Group order per Slater: (1s)(2s,2p)(3s,3p)(3d)(4s,4p)(4d)(4f)(5s,5p)...
  const groups: SlaterGroup[] = []

  const push = (n: number, ls: string[]) => {
    const total = config
      .filter(s => s.n === n && ls.includes(s.label.split('')[1]))
      .reduce((a, s) => a + s.electrons, 0)
    if (total > 0) groups.push({ n, l: ls, electrons: total })
  }

  push(1, ['s'])
  push(2, ['s', 'p'])
  push(3, ['s', 'p'])
  push(3, ['d'])
  push(4, ['s', 'p'])
  push(4, ['d'])
  push(4, ['f'])
  push(5, ['s', 'p'])
  push(5, ['d'])
  push(5, ['f'])
  push(6, ['s', 'p'])
  push(6, ['d'])
  push(7, ['s', 'p'])

  return groups.filter(g => g.electrons > 0)
}

// σ for electron in group g from each other group
function slaterShielding(groups: SlaterGroup[], targetGroupIdx: number): number {
  const target = groups[targetGroupIdx]
  const n = target.n
  const isNS_NP = target.l.includes('s') && !target.l.includes('d') && !target.l.includes('f')
  const isND_NF = target.l.includes('d') || target.l.includes('f')

  let sigma = 0

  // Contribution from same group: 0.35 per electron (except 1s: 0.30)
  const sameGroupShield = (n === 1 && isNS_NP) ? 0.30 : 0.35
  sigma += (target.electrons - 1) * sameGroupShield

  if (isNS_NP) {
    // (n-1) shell: 0.85 each
    // (n-2) and below: 1.00 each
    for (let i = 0; i < groups.length; i++) {
      if (i === targetGroupIdx) continue
      const g = groups[i]
      if (g.n === n - 1) sigma += g.electrons * 0.85
      else if (g.n < n - 1) sigma += g.electrons * 1.00
    }
  } else if (isND_NF) {
    // All groups to the left: 1.00 each
    for (let i = 0; i < targetGroupIdx; i++) {
      sigma += groups[i].electrons * 1.00
    }
  }

  return sigma
}

function computeSlater(z: number) {
  const groups = buildSlaterGroups(z)
  const results = groups.map((g, i) => {
    const sigma = slaterShielding(groups, i)
    const zeff  = z - sigma
    return { ...g, sigma: +sigma.toFixed(2), zeff: +zeff.toFixed(2) }
  })
  // Return outermost group result for summary
  const outermost = results[results.length - 1]
  return { groups: results, outermost }
}

// ── Element Selector ──────────────────────────────────────────────────────────

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

// ── Trend comparison data ─────────────────────────────────────────────────────

// Zeff for outermost electrons across period 2 (Li → Ne) and period 3 (Na → Ar)
const PERIOD2 = [3, 4, 5, 6, 7, 8, 9, 10]
const PERIOD3 = [11, 12, 13, 14, 15, 16, 17, 18]

// ── Main component ────────────────────────────────────────────────────────────

export default function MultiElectronAtoms() {
  const [z, setZ] = useState(17) // Cl — interesting shielding

  const el = ELEMENTS[z]
  const { groups, outermost } = computeSlater(z)
  const config = computeConfig(z)

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Concept cards */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
        <p className="font-sans font-semibold text-bright">Multi-Electron Atoms — Key Concepts</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Effective Nuclear Charge (Z_eff)',
              rule: 'Z_eff = Z − σ',
              detail: 'The net positive charge felt by a valence electron after inner electrons partially cancel the nuclear charge.',
              color: 'var(--c-halogen)',
            },
            {
              name: 'Electron Shielding (σ)',
              rule: 'Inner electrons repel outer ones',
              detail: 'Core and same-shell electrons reduce the attractive pull of the nucleus. Calculated by Slater\'s rules.',
              color: '#f59e0b',
            },
            {
              name: 'Penetration',
              rule: 's > p > d > f',
              detail: 's-orbitals have significant electron density near the nucleus; they penetrate more and are less effectively shielded.',
              color: '#34d399',
            },
          ].map(r => (
            <div key={r.name} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-sans text-sm font-semibold" style={{ color: r.color }}>{r.name}</span>
              <span className="font-mono text-xs text-secondary">{r.rule}</span>
              <span className="font-sans text-xs text-dim leading-relaxed">{r.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Element selector */}
      <div className="flex flex-col gap-4">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Select Element</span>
        <ElementSelector z={z} onChange={setZ} />
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nuclear Charge Z',    val: `${z}`, color: 'var(--c-halogen)' },
          { label: 'Shielding σ (outer)', val: `${outermost.sigma}`, color: '#f59e0b' },
          { label: 'Z_eff (outer)',        val: `${outermost.zeff}`, color: '#34d399' },
          { label: 'Outer subshell',       val: config.filter(s => s.electrons > 0).slice(-1)[0]?.label ?? '—', color: 'rgba(255,255,255,0.6)' },
        ].map(item => (
          <div key={item.label} className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-surface border border-border">
            <span className="font-mono text-xs text-secondary">{item.label}</span>
            <span className="font-mono text-xl font-bold" style={{ color: item.color }}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Slater's rules breakdown */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Slater's Rules — per Subshell Group</span>
        </div>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-4 py-2 text-left text-dim font-normal">Group</th>
                <th className="px-4 py-2 text-left text-dim font-normal">Electrons</th>
                <th className="px-4 py-2 text-left text-dim font-normal">σ (shielding)</th>
                <th className="px-4 py-2 text-left text-dim font-normal">Z_eff</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => {
                const isOuter = i === groups.length - 1
                const label = `${g.n}${g.l.join('')}`
                return (
                  <tr key={label}
                    className={`border-b border-border last:border-b-0 ${isOuter ? 'bg-raised' : ''}`}>
                    <td className="px-4 py-2">
                      <span className={isOuter ? 'text-bright font-semibold' : 'text-primary'}>{label}</span>
                      {isOuter && (
                        <span className="ml-2 font-sans text-[9px] px-1.5 py-0.5 rounded-sm"
                          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
                          valence
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-secondary">{g.electrons}</td>
                    <td className="px-4 py-2" style={{ color: '#f59e0b' }}>{g.sigma}</td>
                    <td className="px-4 py-2 font-semibold" style={{ color: '#34d399' }}>{g.zeff}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim px-1">
          Slater's rules: same-group electrons shield at 0.35 (0.30 for 1s); (n−1) shell at 0.85; lower shells at 1.00; d/f electrons to left at 1.00.
        </p>
      </div>

      {/* Periodic trend: Z_eff across periods */}
      <div className="flex flex-col gap-4">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Z_eff Trend Across Periods</span>
        {[
          { label: 'Period 2 (Li → Ne)', zList: PERIOD2 },
          { label: 'Period 3 (Na → Ar)', zList: PERIOD3 },
        ].map(({ label, zList }) => {
          const data = zList.map(zi => {
            const { outermost: o } = computeSlater(zi)
            return { el: ELEMENTS[zi], zeff: o.zeff }
          })
          const maxZeff = Math.max(...data.map(d => d.zeff))
          return (
            <div key={label} className="flex flex-col gap-2">
              <span className="font-sans text-xs text-secondary">{label}</span>
              <div className="flex items-end gap-1 h-20">
                {data.map(({ el: e, zeff }) => {
                  const heightPct = (zeff / maxZeff) * 100
                  const isActive = e.symbol === el.symbol
                  return (
                    <div key={e.symbol}
                      className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer group"
                      onClick={() => setZ(SYMBOL_TO_Z[e.symbol.toUpperCase()] ?? z)}>
                      <span className="font-mono text-[8px] text-dim group-hover:text-primary transition-colors">
                        {zeff.toFixed(1)}
                      </span>
                      <div className="w-full rounded-t-sm transition-all"
                        style={{
                          height: `${heightPct * 0.6}%`,
                          minHeight: 4,
                          background: isActive
                            ? 'var(--c-halogen)'
                            : 'color-mix(in srgb, var(--c-halogen) 30%, #1c1f2e)',
                          opacity: isActive ? 1 : 0.6,
                        }} />
                      <span className="font-mono text-[9px]"
                        style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                        {e.symbol}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        <p className="font-sans text-xs text-dim px-1">
          Z_eff increases across a period because nuclear charge (Z) increases but shielding (σ) increases more slowly — valence electrons are pulled in tighter.
        </p>
      </div>

      {/* Hydrogen vs multi-electron comparison */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-3">
        <p className="font-sans font-semibold text-bright">Hydrogen vs Multi-Electron Atoms</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-sans text-sm font-semibold text-secondary">Hydrogen (Z = 1)</span>
            <ul className="flex flex-col gap-1">
              {[
                'Only one electron — no shielding',
                'Energy depends only on n (E ∝ −1/n²)',
                '2s and 2p are degenerate (same energy)',
                'Exact analytical solution exists',
              ].map(item => (
                <li key={item} className="font-sans text-xs text-dim flex gap-2">
                  <span className="text-secondary shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-sans text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
              Multi-Electron Atoms (Z ≥ 2)
            </span>
            <ul className="flex flex-col gap-1">
              {[
                'Electron–electron repulsion complicates energy',
                'Subshells split: 2s is lower energy than 2p',
                'Z_eff varies by subshell (penetration effect)',
                'Orbitals retain same shapes; energies shift',
              ].map(item => (
                <li key={item} className="font-sans text-xs text-dim flex gap-2">
                  <span style={{ color: 'var(--c-halogen)' }} className="shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Slater's rules quick reference */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Slater's Rules — Quick Reference</span>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal">Electron being shielded</th>
                <th className="px-3 py-2 text-left text-dim font-normal">Shielding electrons</th>
                <th className="px-3 py-2 text-left text-dim font-normal">σ contribution</th>
              </tr>
            </thead>
            <tbody>
              {[
                { from: 'ns or np', by: 'Same group',    sigma: '0.35 (0.30 for 1s)' },
                { from: 'ns or np', by: '(n−1) shell',   sigma: '0.85' },
                { from: 'ns or np', by: '(n−2) and below', sigma: '1.00' },
                { from: 'nd or nf', by: 'All groups to the left', sigma: '1.00' },
                { from: 'nd or nf', by: 'Same group',    sigma: '0.35' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-primary">{row.from}</td>
                  <td className="px-3 py-2 text-secondary">{row.by}</td>
                  <td className="px-3 py-2 text-bright font-semibold">{row.sigma}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

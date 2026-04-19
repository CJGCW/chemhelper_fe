import { useState } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

const SUBSHELL = ['s', 'p', 'd', 'f']

const QN_CARDS = [
  {
    symbol: 'n',
    name: 'Principal',
    color: '#7dd3fc',   // sky
    values: 'n = 1, 2, 3, 4 …',
    meaning: 'Shell (energy level) — larger n means higher energy and greater distance from nucleus.',
    example: 'n = 3 → third shell (M shell)',
  },
  {
    symbol: 'l',
    name: 'Angular Momentum',
    color: '#86efac',   // green
    values: 'l = 0 to n − 1',
    meaning: 'Subshell type — determines the shape of the orbital.',
    example: 'n = 3: l can be 0 (3s), 1 (3p), or 2 (3d)',
  },
  {
    symbol: 'mₗ',
    name: 'Magnetic',
    color: '#fde68a',   // amber
    values: 'mₗ = −l, …, 0, …, +l',
    meaning: 'Orbital orientation in space — there are 2l + 1 possible values.',
    example: 'l = 2 (d): mₗ = −2, −1, 0, +1, +2  (5 orbitals)',
  },
  {
    symbol: 'ms',
    name: 'Spin',
    color: '#d8b4fe',   // purple
    values: 'ms = +½ or −½',
    meaning: 'Intrinsic spin of the electron — only two values, enforced by Pauli exclusion.',
    example: '↑ = +½ (spin up),  ↓ = −½ (spin down)',
  },
]

// ── Formula block ─────────────────────────────────────────────────────────────

function FormulaRow({ label, formula, note }: { label: string; formula: string; note: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5 border-b border-border last:border-b-0">
      <span className="font-mono text-sm text-secondary w-52 shrink-0">{label}</span>
      <span className="font-mono text-sm text-bright flex-1">{formula}</span>
      <span className="font-mono text-xs text-dim text-right hidden sm:block">{note}</span>
    </div>
  )
}

// ── Shell explorer ────────────────────────────────────────────────────────────

function buildShellTable(n: number) {
  const rows = []
  for (let l = 0; l < n; l++) {
    const orbitals = 2 * l + 1
    const mls: number[] = []
    for (let m = -l; m <= l; m++) mls.push(m)
    rows.push({ l, subshell: `${n}${SUBSHELL[l]}`, orbitals, maxE: 2 * orbitals, mls })
  }
  return rows
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuantumNumbersReference() {
  const [selectedN, setSelectedN] = useState(2)
  const shellRows = buildShellTable(selectedN)
  const totalOrbitals = selectedN * selectedN
  const totalElectrons = 2 * selectedN * selectedN

  return (
    <div className="flex flex-col gap-8">


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* QN cards — row 1, col 1 */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">The Four Quantum Numbers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QN_CARDS.map(q => (
              <div
                key={q.symbol}
                className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2"
                style={{ borderLeftWidth: '3px', borderLeftColor: q.color }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold" style={{ color: q.color }}>{q.symbol}</span>
                  <span className="font-sans text-sm text-secondary">{q.name}</span>
                </div>
                <p className="font-mono text-xs text-dim"
                  style={{ color: q.color, opacity: 0.85 }}>{q.values}</p>
                <p className="font-sans text-sm text-primary leading-relaxed">{q.meaning}</p>
                <p className="font-mono text-[11px] text-dim italic">{q.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Counting formulas — row 1, col 2 */}
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Counting Formulas</h3>
          <div className="rounded-sm border border-border bg-surface px-4">
            <FormulaRow label="Orbitals in subshell l"   formula="2l + 1"          note="e.g. d (l=2): 5 orbitals"        />
            <FormulaRow label="Electrons in subshell l"  formula="2(2l + 1)"       note="e.g. p (l=1): 6 electrons"       />
            <FormulaRow label="Orbitals in shell n"      formula="n²"              note="e.g. n=3: 9 orbitals"            />
            <FormulaRow label="Max electrons in shell n" formula="2n²"             note="e.g. n=3: 18 electrons"          />
            <FormulaRow label="Subshells in shell n"     formula="n subshells"     note="l = 0, 1, … n−1"                 />
          </div>
        </div>

        {/* Validity Rules — row 2, col 1 */}
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Validity Rules</h3>
          <div className="rounded-sm border border-border bg-surface px-4 py-1">
            {[
              ['n ≥ 1',            'Principal quantum number must be a positive integer'],
              ['0 ≤ l ≤ n − 1',    'Angular momentum quantum number bounded by shell'],
              ['−l ≤ mₗ ≤ +l',    'Magnetic quantum number ranges from −l to +l'],
              ['ms = +½ or −½',    'Spin quantum number has exactly two allowed values'],
            ].map(([rule, desc]) => (
              <div key={rule} className="flex items-baseline gap-4 py-2.5 border-b border-border last:border-b-0">
                <span className="font-mono text-sm text-bright w-36 shrink-0">{rule}</span>
                <span className="font-sans text-sm text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shell explorer — row 2, col 2 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Shell Explorer</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setSelectedN(n)}
                  className="w-8 h-8 rounded-sm font-mono text-sm transition-colors"
                  style={selectedN === n ? {
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                    color: 'var(--c-halogen)',
                  } : {
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="font-mono text-xs text-dim ml-auto">
              {totalOrbitals} orbital{totalOrbitals !== 1 ? 's' : ''} · {totalElectrons} electrons max
            </span>
          </div>

          <div className="rounded-sm border border-border overflow-hidden">
            <div className="grid grid-cols-[2rem_5rem_1fr_4rem_4rem] gap-x-4 items-center
                            px-4 py-2 bg-raised border-b border-border">
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">l</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Subshell</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">mₗ values</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase text-right">Orbitals</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase text-right">Max e⁻</span>
            </div>

            {shellRows.map(row => (
              <div
                key={row.l}
                className="grid grid-cols-[2rem_5rem_1fr_4rem_4rem] gap-x-4 items-center
                           px-4 py-3 border-b border-border last:border-b-0 bg-surface"
              >
                <span className="font-mono text-sm text-bright">{row.l}</span>
                <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{row.subshell}</span>
                <span className="font-mono text-sm text-primary">
                  {row.mls.map(m => (m > 0 ? `+${m}` : String(m))).join(', ')}
                </span>
                <span className="font-mono text-sm text-secondary text-right">{row.orbitals}</span>
                <span className="font-mono text-sm text-secondary text-right">{row.maxE}</span>
              </div>
            ))}

            <div className="grid grid-cols-[2rem_5rem_1fr_4rem_4rem] gap-x-4 items-center
                            px-4 py-2 bg-raised">
              <span />
              <span className="font-mono text-[10px] text-dim uppercase tracking-widest col-span-2">
                Total (n = {selectedN})
              </span>
              <span className="font-mono text-sm font-semibold text-bright text-right">{totalOrbitals}</span>
              <span className="font-mono text-sm font-semibold text-bright text-right">{totalElectrons}</span>
            </div>
          </div>

          <p className="font-mono text-[10px] text-dim">
            Pauli exclusion principle: no two electrons in an atom can have the same set of all four quantum numbers.
          </p>
        </div>

      </div>

    </div>
  )
}

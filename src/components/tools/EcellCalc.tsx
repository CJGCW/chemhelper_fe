import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HALF_REACTIONS } from '../../data/reductionPotentials'
import type { HalfReaction } from '../../data/reductionPotentials'
import { genEcellProblem } from '../../utils/ecellPractice'
import StepsPanel from '../calculations/StepsPanel'

const ECELL_EMPTY: string[] = []

function generateExample() {
  const subtypes = ['calc_e0cell', 'spontaneity', 'nernst', 'delta_g'] as const
  const p = genEcellProblem(subtypes[Math.floor(Math.random() * subtypes.length)])
  const last = p.steps.length - 1
  return { scenario: p.question, steps: p.steps.slice(0, last), result: p.steps[last] }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number, dec = 3) {
  return (v >= 0 ? '+' : '') + v.toFixed(dec)
}

// Nernst: E = E° − (0.05916 / n) · log₁₀(Q)   at 298 K
function nernst(e0: number, n: number, Q: number): number {
  if (Q <= 0) return NaN
  return e0 - (0.05916 / n) * Math.log10(Q)
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function HalfRxnSelect({
  label,
  color,
  value,
  onChange,
}: {
  label: string
  color: string
  value: HalfReaction | null
  onChange: (hr: HalfReaction | null) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const matches = useMemo(() => {
    if (!query) return HALF_REACTIONS
    const q = query.toLowerCase()
    return HALF_REACTIONS.filter(hr =>
      hr.oxidized.toLowerCase().includes(q) ||
      hr.reduced.toLowerCase().includes(q) ||
      hr.cathode.toLowerCase().includes(q)
    )
  }, [query])

  function select(hr: HalfReaction) {
    onChange(hr)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <span className="font-mono text-xs tracking-widest uppercase" style={{ color }}>
        {label}
      </span>

      {/* Current selection */}
      {value && (
        <div
          className="rounded-sm border px-3 py-2 flex items-center justify-between gap-2"
          style={{ borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 8%, rgb(var(--color-surface)))` }}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-mono text-xs text-primary leading-snug truncate">{value.cathode}</span>
            <span className="font-mono text-xs" style={{ color }}>E° = {fmt(value.e0)} V</span>
          </div>
          <button
            onClick={() => { onChange(null); setOpen(true) }}
            className="font-mono text-[10px] text-dim hover:text-secondary shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search input */}
      {!value && (
        <div className="relative">
          <input
            type="text"
            value={query}
            placeholder="Search half-reaction…"
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 130)}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            className="w-full font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                       text-primary placeholder-dim focus:outline-none transition-colors"
          />
          {open && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-sm border border-border z-30 overflow-y-auto"
              style={{ background: 'rgb(var(--color-surface))', maxHeight: 240 }}
            >
              {matches.map(hr => (
                <button
                  key={hr.id}
                  onMouseDown={e => { e.preventDefault(); select(hr) }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-raised transition-colors"
                >
                  <span className="font-mono text-xs text-secondary leading-snug flex-1">{hr.cathode}</span>
                  <span className="font-mono text-xs shrink-0" style={{ color: hr.e0 >= 0 ? '#4ade80' : '#f87171' }}>
                    {fmt(hr.e0)} V
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Reference table ───────────────────────────────────────────────────────────

function ReferenceTable() {
  const [filter, setFilter] = useState('')
  const rows = useMemo(() => {
    if (!filter) return HALF_REACTIONS
    const q = filter.toLowerCase()
    return HALF_REACTIONS.filter(hr =>
      hr.cathode.toLowerCase().includes(q) ||
      hr.oxidized.toLowerCase().includes(q) ||
      hr.reduced.toLowerCase().includes(q)
    )
  }, [filter])

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter half-reactions…"
        className="w-full font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                   text-primary placeholder-dim focus:outline-none"
      />
      <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgb(var(--color-border))' }}>
              <th className="font-mono text-xs tracking-widest uppercase text-secondary px-3 py-2">Half-Reaction (reduction)</th>
              <th className="font-mono text-xs tracking-widest uppercase text-secondary px-3 py-2 text-right whitespace-nowrap">E° (V)</th>
              <th className="font-mono text-xs tracking-widest uppercase text-secondary px-3 py-2 text-right">n</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((hr, i) => {
              const color = hr.e0 > 0.3 ? '#4ade80' : hr.e0 < -0.3 ? '#f87171' : 'rgba(var(--overlay),0.55)'
              return (
                <tr key={hr.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgb(var(--color-border))' : undefined }}>
                  <td className="font-mono text-xs text-secondary px-3 py-1.5 leading-snug">{hr.cathode}</td>
                  <td className="font-mono text-xs px-3 py-1.5 text-right whitespace-nowrap" style={{ color }}>
                    {fmt(hr.e0)}
                  </td>
                  <td className="font-mono text-xs text-dim px-3 py-1.5 text-right">{hr.n}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type View = 'calc' | 'table'

export default function EcellCalc() {
  const [view, setView] = useState<View>('calc')
  const [cathode, setCathode] = useState<HalfReaction | null>(null)
  const [anode,   setAnode]   = useState<HalfReaction | null>(null)

  // Nernst inputs
  const [qRaw, setQRaw] = useState('')
  const [nOvr, setNOvr] = useState('')   // optional n override

  // E°cell
  const e0cell = useMemo(() => {
    if (!cathode || !anode) return null
    return cathode.e0 - anode.e0
  }, [cathode, anode])

  // electrons to use for Nernst (LCM of cathode.n and anode.n, or user override)
  const nEff = useMemo(() => {
    if (nOvr && /^\d+$/.test(nOvr)) return parseInt(nOvr, 10)
    if (!cathode || !anode) return null
    const a = cathode.n, b = anode.n
    const gcd = (x: number, y: number): number => y === 0 ? x : gcd(y, x % y)
    return (a * b) / gcd(a, b)
  }, [cathode, anode, nOvr])

  const Q = parseFloat(qRaw)
  const ecell = useMemo(() => {
    if (e0cell === null || nEff === null || !qRaw || isNaN(Q)) return null
    return nernst(e0cell, nEff, Q)
  }, [e0cell, nEff, qRaw, Q])

  const spontaneous = e0cell !== null ? e0cell > 0 : null

  // Quick examples
  const EXAMPLES: { label: string; catId: string; anoId: string }[] = [
    { label: 'Zn-Cu cell',      catId: 'Cu2a', anoId: 'Zn' },
    { label: 'Daniell cell',    catId: 'Cu2a', anoId: 'Zn' },
    { label: 'Ag-Fe cell',      catId: 'Ag',   anoId: 'Fe2' },
    { label: 'Cl₂/H₂ cell',    catId: 'Cl2',  anoId: 'SHE' },
  ]

  function loadExample(catId: string, anoId: string) {
    const c = HALF_REACTIONS.find(r => r.id === catId) ?? null
    const a = HALF_REACTIONS.find(r => r.id === anoId) ?? null
    setCathode(c); setAnode(a)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* View toggle */}
      <div className="flex items-center gap-1 p-1 rounded-sm self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['calc', 'table'] as View[]).map(v => {
          const active = view === v
          return (
            <button key={v} onClick={() => setView(v)}
              className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
              {active && (
                <motion.div layoutId="ecell-view-pill" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{v === 'calc' ? 'Calculator' : 'Reference Table'}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {view === 'calc' && (
          <motion.div key="calc"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            className="flex flex-col gap-5"
          >
            <StepsPanel steps={ECELL_EMPTY} generate={generateExample} />

            {/* Examples */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs text-secondary">Examples:</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => loadExample(ex.catId, ex.anoId)}
                  className="font-mono text-[11px] px-2 py-0.5 rounded-sm border border-border
                             text-secondary hover:text-primary hover:border-muted transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Half-reaction selectors */}
            <div className="flex flex-col sm:flex-row gap-4">
              <HalfRxnSelect label="Cathode (reduction)" color="#4ade80"  value={cathode} onChange={setCathode} />
              <HalfRxnSelect label="Anode (oxidation)"   color="#f87171"  value={anode}   onChange={setAnode}   />
            </div>

            {/* E°cell result */}
            <AnimatePresence>
              {e0cell !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {/* Standard cell potential */}
                  <div
                    className="rounded-sm border p-4 flex flex-col gap-3"
                    style={{
                      borderColor: e0cell > 0
                        ? 'color-mix(in srgb, #4ade80 35%, transparent)'
                        : 'color-mix(in srgb, #f87171 35%, transparent)',
                      background: e0cell > 0
                        ? 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-surface)))'
                        : 'color-mix(in srgb, #f87171 6%, rgb(var(--color-surface)))',
                    }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono text-xs tracking-widest uppercase text-secondary">
                        E°cell = E°cathode − E°anode
                      </span>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded-sm"
                        style={{
                          color: e0cell > 0 ? '#4ade80' : '#f87171',
                          background: e0cell > 0
                            ? 'color-mix(in srgb, #4ade80 14%, rgb(var(--color-raised)))'
                            : 'color-mix(in srgb, #f87171 14%, rgb(var(--color-raised)))',
                          border: `1px solid ${e0cell > 0 ? 'color-mix(in srgb, #4ade80 30%, transparent)' : 'color-mix(in srgb, #f87171 30%, transparent)'}`,
                        }}
                      >
                        {spontaneous ? 'Spontaneous ✓' : 'Non-spontaneous ✗'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-mono text-xs text-dim">
                        = {fmt(cathode!.e0)} − ({fmt(anode!.e0)})
                      </span>
                      <span
                        className="font-mono text-2xl font-semibold"
                        style={{ color: e0cell > 0 ? '#4ade80' : '#f87171' }}
                      >
                        {fmt(e0cell)} V
                      </span>
                    </div>

                    <div className="font-mono text-xs text-secondary leading-snug">
                      ΔG° = −nFE°cell
                      {nEff !== null && (
                        <> = −{nEff} × (96 485) × {fmt(e0cell)} = {fmt(-nEff * 96485 * e0cell / 1000, 1)} kJ/mol</>
                      )}
                    </div>
                  </div>

                  {/* Nernst equation */}
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-xs tracking-widest uppercase text-secondary">
                      Nernst Equation &nbsp;·&nbsp; E = E° − (0.05916/n) log Q &nbsp; (298 K)
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs text-secondary">Q (reaction quotient)</label>
                        <input
                          type="text"
                          value={qRaw}
                          onChange={e => setQRaw(e.target.value)}
                          placeholder="e.g. 0.001"
                          className="w-32 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                                     text-primary placeholder-dim focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs text-secondary">n override (optional)</label>
                        <input
                          type="text"
                          value={nOvr}
                          onChange={e => setNOvr(e.target.value)}
                          placeholder={nEff !== null ? String(nEff) : '—'}
                          className="w-20 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                                     text-primary placeholder-dim focus:outline-none"
                        />
                      </div>

                      {ecell !== null && !isNaN(ecell) && (
                        <div className="flex flex-col gap-1 self-end">
                          <span className="font-mono text-xs text-secondary">E (non-standard)</span>
                          <span
                            className="font-mono text-lg font-semibold"
                            style={{ color: ecell > 0 ? '#4ade80' : '#f87171' }}
                          >
                            {fmt(ecell)} V
                          </span>
                        </div>
                      )}
                    </div>

                    {qRaw && isNaN(Q) && (
                      <p className="font-mono text-xs text-red-400">Q must be a positive number.</p>
                    )}
                    {qRaw && !isNaN(Q) && Q <= 0 && (
                      <p className="font-mono text-xs text-red-400">Q must be greater than 0.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!cathode && !anode && (
              <p className="font-mono text-xs text-secondary">
                Select a cathode (reduction) half-reaction and an anode (oxidation) half-reaction
                to calculate E°cell. The Nernst equation panel unlocks once both are selected.
              </p>
            )}
          </motion.div>
        )}

        {view === 'table' && (
          <motion.div key="table"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
          >
            <ReferenceTable />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

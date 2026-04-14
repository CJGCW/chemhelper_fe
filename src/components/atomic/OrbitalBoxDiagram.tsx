import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ELEMENTS, SYMBOL_TO_Z, computeConfig, orbitalStates, EXCEPTIONS,
  getAbbrConfig, getNobleGasCore, activeSubshellAt, valenceElectrons,
} from './electronConfigUtils'
import type { SubshellFill } from './electronConfigUtils'

// ── Written notation ──────────────────────────────────────────────────────────

function WrittenNotation({
  coreLabel, subshells, activeLabel,
}: {
  coreLabel: string | null
  subshells: SubshellFill[]
  activeLabel?: string | null
}) {
  return (
    <p className="font-mono text-sm leading-loose flex flex-wrap gap-x-1 gap-y-0.5">
      {coreLabel && <span className="text-dim">{coreLabel} </span>}
      {subshells.map(s => (
        <span key={s.label + s.aufbauIdx}
          style={{ color: activeLabel === s.label ? 'var(--c-halogen)' : 'rgba(255,255,255,0.75)' }}>
          {s.label}<sup style={{ fontSize: '0.65em' }}>{s.electrons}</sup>
        </span>
      ))}
    </p>
  )
}

// ── Orbital box cell ──────────────────────────────────────────────────────────

function OrbBox({ up, down, unpaired }: { up: boolean; down: boolean; unpaired: boolean }) {
  return (
    <div
      className={`w-10 h-8 border rounded-sm flex flex-row items-center justify-center gap-0.5 select-none transition-colors
        ${unpaired
          ? 'border-amber-500/50 bg-amber-500/5'
          : up && down
            ? 'border-border bg-raised'
            : up || down
              ? 'border-border bg-surface'
              : 'border-border/40 bg-surface'
        }`}
    >
      {up && down ? (
        <>
          <span className="text-sm font-bold leading-none" style={{ color: 'var(--c-halogen)' }}>↑</span>
          <span className="text-sm font-bold leading-none" style={{ color: '#f472b6' }}>↓</span>
        </>
      ) : up ? (
        <span className="text-sm font-bold leading-none" style={{ color: 'var(--c-halogen)' }}>↑</span>
      ) : (
        <span className="text-dim/25 text-[10px]">—</span>
      )}
    </div>
  )
}

// ── Subshell row ──────────────────────────────────────────────────────────────

function SubshellRow({ sub }: { sub: SubshellFill }) {
  const states    = orbitalStates(sub.electrons, sub.orbitals)
  const halfFilled = sub.electrons > 0 && sub.electrons <= sub.orbitals
  const hundActive = sub.electrons > 0 && sub.electrons < sub.orbitals * 2

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 text-right shrink-0">
        <span className="font-mono text-sm text-primary">{sub.label}</span>
      </div>

      <div className="flex items-center gap-1">
        {states.map((s, i) => (
          <OrbBox key={i} up={s.up} down={s.down} unpaired={s.up && !s.down} />
        ))}
      </div>

      <span className="font-mono text-xs text-dim w-6 shrink-0">
        {sub.electrons > 0 ? `(${sub.electrons})` : ''}
      </span>

      {hundActive && (
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm shrink-0"
          style={{
            background: 'color-mix(in srgb, #fbbf24 10%, transparent)',
            border: '1px solid color-mix(in srgb, #fbbf24 30%, transparent)',
            color: '#fbbf24',
          }}>
          {halfFilled ? "Hund's — singly fill first" : "Hund's — pairing begins"}
        </span>
      )}
    </div>
  )
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
          className="w-24 h-8 border-y border-border bg-raised px-2 font-mono text-sm text-bright
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
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrbitalBoxDiagram() {
  const [z, setZ]             = useState(7)   // Nitrogen — shows Hund's rule clearly
  const [showFull, setShowFull] = useState(false)
  const [stepMode, setStepMode] = useState(false)
  const [step, setStep]         = useState(7)

  function handleElementChange(newZ: number) {
    setZ(newZ)
    setStep(newZ)
  }

  // Written notation data
  const fullSubshells = computeConfig(z)
  const { coreLabel, subshells: abbrSubshells } = getAbbrConfig(z)
  const stepConfig = computeConfig(step, true)
  const { coreLabel: stepCore, subshells: stepAbbr } = (() => {
    const core = getNobleGasCore(step)
    if (!core) return { coreLabel: null, subshells: stepConfig }
    const coreLabels = new Set(computeConfig(core.coreZ, true).map(s => s.label))
    return { coreLabel: `[${core.symbol}]`, subshells: stepConfig.filter(s => !coreLabels.has(s.label)) }
  })()

  const displaySubshells = stepMode ? (showFull ? stepConfig : stepAbbr) : (showFull ? fullSubshells : abbrSubshells)
  const displayCore      = stepMode ? (showFull ? null : stepCore) : (showFull ? null : coreLabel)
  const activeLabel      = stepMode ? activeSubshellAt(step) : null
  const valence          = valenceElectrons(showFull ? fullSubshells : abbrSubshells)

  // Orbital box diagram data (always shows full element, not step)
  const config = computeConfig(z)
  const subshellsByN = new Map<number, SubshellFill[]>()
  for (const sub of config) {
    const arr = subshellsByN.get(sub.n) ?? []
    arr.push(sub)
    subshellsByN.set(sub.n, arr)
  }
  const shells = Array.from(subshellsByN.entries()).sort(([a], [b]) => a - b)

  const totalUnpaired = config.reduce((sum, sub) => {
    const up   = Math.min(sub.electrons, sub.orbitals)
    const down = Math.max(0, sub.electrons - sub.orbitals)
    return sum + (up - down)
  }, 0)

  const exception = EXCEPTIONS[z]

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Rules panel */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
        <p className="font-sans font-semibold text-bright">Three Rules for Orbital Filling</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Aufbau Principle',
              rule: 'Fill lowest energy orbitals first',
              order: '1s → 2s → 2p → 3s → 3p → 4s → 3d → …',
            },
            {
              name: 'Pauli Exclusion',
              rule: 'Max 2 electrons per orbital — opposite spins',
              order: 'Each box holds at most ↑↓',
            },
            {
              name: "Hund's Rule",
              rule: 'Fill degenerate orbitals singly before pairing',
              order: 'p: [↑][↑][↑] before [↑↓][↑][  ]',
            },
          ].map(r => (
            <div key={r.name} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-sans text-sm font-semibold text-bright">{r.name}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{r.rule}</span>
              <span className="font-mono text-[10px] text-dim mt-0.5">{r.order}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Element selector */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Select Element</span>
        <div className="flex items-center gap-4 flex-wrap p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <ElementSelector z={z} onChange={handleElementChange} />
          <div className="flex items-baseline gap-2 ml-auto">
            <span className="font-mono text-2xl font-bold" style={{ color: 'var(--c-halogen)' }}>{valence}</span>
            <span className="font-sans text-sm text-secondary">valence electron{valence !== 1 ? 's' : ''}</span>
          </div>
          {exception && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: 'color-mix(in srgb, #f59e0b 12%, transparent)',
                color: '#f59e0b',
                border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)',
              }}>
              exception
            </span>
          )}
        </div>
      </div>

      {/* Written notation */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Electron Configuration</span>
          <div className="flex gap-2 ml-auto">
            {(['full', 'step'] as const).map(mode => {
              const on = mode === 'full' ? showFull : stepMode
              return (
                <button key={mode}
                  onClick={() => mode === 'full'
                    ? setShowFull(f => !f)
                    : (setStepMode(s => !s), setStep(z))
                  }
                  className="font-mono text-[10px] px-2 py-1 rounded-sm border transition-colors"
                  style={{
                    border: on ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(255,255,255,0.12)',
                    color: on ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
                    background: on ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                  }}>
                  {mode}
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence>
          {stepMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
              <div className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-dim">Filling electron {step} of {z}</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
                    Adding to: {activeSubshellAt(step) ?? '—'}
                  </span>
                </div>
                <input type="range" min={1} max={z} value={step}
                  onChange={e => setStep(Number(e.target.value))}
                  className="w-full accent-[var(--c-halogen)]" />
                <div className="flex justify-between font-mono text-[10px] text-dim">
                  <span>1</span><span>{z}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <WrittenNotation coreLabel={displayCore} subshells={displaySubshells} activeLabel={activeLabel} />
        </div>

        {exception && !stepMode && (
          <div className="flex flex-col gap-1 p-3 rounded-sm"
            style={{
              background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
              border: '1px solid color-mix(in srgb, #f59e0b 25%, transparent)',
            }}>
            <span className="font-mono text-[10px] tracking-wider" style={{ color: '#f59e0b' }}>AUFBAU EXCEPTION</span>
            <p className="font-sans text-xs" style={{ color: 'rgba(245,158,11,0.8)' }}>{exception.note}</p>
          </div>
        )}
      </div>

      {/* Orbital box diagram */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Orbital Box Diagram</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border border-amber-500/50 bg-amber-500/5" />
            <span className="font-mono text-[9px] text-amber-400/80">Hund's rule active</span>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {shells.map(([n, subs]) => (
            <div key={n} className="border-b border-border last:border-b-0">
              <div className="px-4 py-1 bg-raised border-b border-border/50">
                <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Shell n = {n}</span>
              </div>
              <div className="flex flex-col gap-2 px-4 py-3">
                {subs.map(sub => (
                  <SubshellRow key={sub.label} sub={sub} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="font-mono text-xs text-secondary">
            Unpaired electrons: <span className="text-bright font-semibold">{totalUnpaired}</span>
          </span>
          <span className="text-dim">·</span>
          <span className={`font-mono text-xs font-semibold ${totalUnpaired > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {totalUnpaired > 0 ? `Paramagnetic (${totalUnpaired} unpaired)` : 'Diamagnetic (all paired)'}
          </span>
        </div>
      </div>

      {/* Notation key */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Notation Key</span>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '↑',  desc: 'Spin-up electron (ms = +½)',      color: 'var(--c-halogen)' },
            { label: '↓',  desc: 'Spin-down electron (ms = −½)',    color: '#f472b6' },
            { label: '↑↓', desc: 'Paired electrons (full orbital)', color: '#94a3b8' },
            { label: '—',  desc: 'Empty orbital',                   color: undefined },
          ].map(k => (
            <div key={k.label} className="flex items-center gap-2 px-3 py-2 rounded-sm bg-surface border border-border">
              <span className="font-mono text-sm w-5 text-center" style={{ color: k.color }}>
                {k.label}
              </span>
              <span className="font-sans text-xs text-secondary">{k.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

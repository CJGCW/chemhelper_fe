import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AUFBAU, ELEMENTS, EXCEPTIONS, SYMBOL_TO_Z,
  computeConfig, getAbbrConfig, getNobleGasCore,
  orbitalStates, groupByShell, activeSubshellAt, valenceElectrons,
  type SubshellFill,
} from './electronConfigUtils'

// ── Sub-components ─────────────────────────────────────────────────────────

function OrbitalBox({ up, down, active }: { up: boolean; down: boolean; active?: boolean }) {
  return (
    <div
      className="w-7 h-8 rounded-sm flex items-center justify-center gap-px shrink-0"
      style={{
        border: active
          ? '1px solid color-mix(in srgb, var(--c-halogen) 70%, transparent)'
          : '1px solid rgba(255,255,255,0.15)',
        background: active
          ? 'color-mix(in srgb, var(--c-halogen) 14%, transparent)'
          : (up || down) ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      <span className="font-mono text-xs leading-none select-none"
        style={{ color: up ? 'var(--c-halogen)' : 'rgba(255,255,255,0.08)' }}>↑</span>
      <span className="font-mono text-xs leading-none select-none"
        style={{ color: down ? 'var(--c-halogen)' : 'rgba(255,255,255,0.08)' }}>↓</span>
    </div>
  )
}

function SubshellGroup({ sub, active }: { sub: SubshellFill; active?: boolean }) {
  const states = orbitalStates(sub.electrons, sub.orbitals)
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-mono text-[10px] tracking-wide"
        style={{ color: active ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
        {sub.label}
      </span>
      <div className="flex gap-0.5">
        {states.map((s, i) => <OrbitalBox key={i} up={s.up} down={s.down} active={active} />)}
      </div>
    </div>
  )
}

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

// ── Main component ─────────────────────────────────────────────────────────

export default function ElectronConfig() {
  const [inputText, setInputText] = useState('26')
  const [z, setZ] = useState(26)
  const [showFull, setShowFull] = useState(false)
  const [stepMode, setStepMode] = useState(false)
  const [step, setStep] = useState(26)

  const element = ELEMENTS[z]
  const exception = EXCEPTIONS[z]
  const { coreLabel, subshells: abbrSubshells } = getAbbrConfig(z)
  const fullSubshells = computeConfig(z)

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

  const shellRows = groupByShell(displaySubshells)
  const valence   = valenceElectrons(showFull ? fullSubshells : abbrSubshells)

  function commitInput(text: string) {
    const trimmed = text.trim()
    const asNum = parseInt(trimmed, 10)
    if (!isNaN(asNum) && asNum >= 1 && asNum <= 118) {
      setZ(asNum); setStep(asNum); setInputText(String(asNum)); return
    }
    const asZ = SYMBOL_TO_Z[trimmed.toUpperCase()]
    if (asZ) { setZ(asZ); setStep(asZ); setInputText(String(asZ)); return }
    setInputText(String(z))
  }

  function nudge(delta: number) {
    const next = Math.max(1, Math.min(118, z + delta))
    setZ(next); setStep(next); setInputText(String(next))
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Element selector ── */}
      <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col items-center w-16 shrink-0">
            <span className="font-mono text-5xl font-bold leading-none" style={{ color: 'var(--c-halogen)' }}>
              {element.symbol}
            </span>
            <span className="font-mono text-xs text-dim mt-1">{z}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-base font-semibold text-bright">{element.name}</span>
            <span className="font-mono text-xs text-dim">Z = {z}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text" value={inputText}
              onChange={e => setInputText(e.target.value)}
              onBlur={() => commitInput(inputText)}
              onKeyDown={e => { if (e.key === 'Enter') commitInput(inputText) }}
              placeholder="Z or symbol"
              className="w-24 font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5
                         text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors text-center"
            />
            <button onClick={() => nudge(-1)} disabled={z <= 1}
              className="w-8 h-8 rounded-sm border border-border font-mono text-sm text-secondary
                         hover:text-primary hover:bg-raised transition-colors disabled:opacity-30">←</button>
            <button onClick={() => nudge(1)} disabled={z >= 118}
              className="w-8 h-8 rounded-sm border border-border font-mono text-sm text-secondary
                         hover:text-primary hover:bg-raised transition-colors disabled:opacity-30">→</button>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1 border-t border-border">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold" style={{ color: 'var(--c-halogen)' }}>{valence}</span>
            <span className="font-sans text-sm text-secondary">valence electron{valence !== 1 ? 's' : ''}</span>
          </div>
          {exception && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm ml-auto"
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

      {/* ── Configuration display ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Electron Configuration</p>
          <div className="flex gap-2 ml-auto">
            {(['full', 'step'] as const).map(mode => {
              const on = mode === 'full' ? showFull : stepMode
              return (
                <button key={mode}
                  onClick={() => mode === 'full' ? setShowFull(f => !f) : (setStepMode(s => !s), setStep(z))}
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

      {/* ── Orbital box diagram ── */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Orbital Box Diagram</p>
        <div className="flex flex-col gap-1">
          {shellRows.map(([n, subs]) => (
            <div key={n} className="flex items-end gap-4 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <div className="w-8 shrink-0 flex items-center justify-center pb-0.5">
                <span className="font-mono text-[10px] text-dim">n={n}</span>
              </div>
              <div className="flex items-end gap-4 flex-wrap">
                {subs.map(sub => (
                  <SubshellGroup key={sub.label} sub={sub} active={activeLabel === sub.label} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase mb-2">Aufbau Filling Order</p>
          <div className="flex flex-wrap gap-1.5">
            {AUFBAU.map((s, i) => {
              const isFilled = fullSubshells.some(fs => fs.aufbauIdx === i)
              const isActive = activeLabel === s.label
              return (
                <span key={i} className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: isActive ? 'color-mix(in srgb, var(--c-halogen) 20%, transparent)' : isFilled ? 'rgba(255,255,255,0.07)' : 'transparent',
                    color: isActive ? 'var(--c-halogen)' : isFilled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
                    border: isActive ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {i + 1}. {s.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}

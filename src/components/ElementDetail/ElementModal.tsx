import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../../stores/elementStore'
import { getColorCategory, GROUP_COLORS, GROUP_LABELS } from '../PeriodicTable/groupColors'
import { IONS, ionFormula } from '../../data/elementIons'
import { ISOTOPES } from '../../data/elementIsotopes'
import {
  computeConfig, getAbbrConfig, orbitalStates, groupByShell,
  valenceElectrons, EXCEPTIONS,
  type SubshellFill,
} from '../atomic/electronConfigUtils'
import type { Element } from '../../types'

// ── Animation variants (hero only — tab content uses simple fade) ─────────────

const heroVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.18 } },
}
const heroRowVariants = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border">
      <span className="font-sans text-xs text-secondary">{label}</span>
      <span className="font-mono text-sm text-primary">
        {value}
        {unit && <span className="text-dim text-xs ml-1">{unit}</span>}
      </span>
    </div>
  )
}

// ── Properties tab ────────────────────────────────────────────────────────────

function PropertiesTab({ el, color }: { el: NonNullable<Element>; color: string }) {
  return (
    <div className="flex flex-col">
      <StatRow label="Atomic Weight"        value={el.atomicWeight}                                              unit="g/mol"   />
      <StatRow label="Period"               value={String(el.period)}                                                           />
      <StatRow label="Group"                value={String(el.group)}                                                            />
      <StatRow label="Electronegativity"    value={el.electronegativity > 0  ? el.electronegativity.toFixed(2)  : '—'}  unit={el.electronegativity > 0  ? 'Pauling' : undefined} />
      <StatRow label="Van der Waals Radius" value={el.vanDerWaalsRadiusPm > 0 ? String(el.vanDerWaalsRadiusPm) : '—'}  unit={el.vanDerWaalsRadiusPm > 0 ? 'pm'      : undefined} />

      {el.electronegativity > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="font-sans text-[12px] text-secondary">Electronegativity</span>
            <span className="font-mono text-[12px] text-dim">0 – 4 Pauling</span>
          </div>
          <div className="h-1 bg-raised rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(el.electronegativity / 4) * 100}%` }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
            />
          </div>
        </div>
      )}

      {el.vanDerWaalsRadiusPm > 0 && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-sans text-[12px] text-secondary">Van der Waals Radius</span>
            <span className="font-mono text-[12px] text-dim">0 – 400 pm</span>
          </div>
          <div className="h-1 bg-raised rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color, opacity: 0.7 }}
              initial={{ width: 0 }}
              animate={{ width: `${(el.vanDerWaalsRadiusPm / 400) * 100}%` }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Ions tab ──────────────────────────────────────────────────────────────────

const NOBLE_GAS_Z = new Set([2, 10, 18, 36, 54, 86, 118])

function IonsTab({ el, color }: { el: NonNullable<Element>; color: string }) {
  const ions = IONS[el.atomicNumber] ?? []
  const isNobleGas = NOBLE_GAS_Z.has(el.atomicNumber)

  if (isNobleGas || ions.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center gap-2">
        <span className="font-mono text-2xl" style={{ color: 'rgba(var(--overlay),0.15)' }}>—</span>
        <p className="font-sans text-xs text-dim text-center">
          {isNobleGas
            ? 'Noble gases have a full valence shell and do not form stable ions under ordinary conditions.'
            : 'No common ionic forms documented for this element.'}
        </p>
      </div>
    )
  }

  const cations = ions.filter(i => i.charge > 0)
  const anions  = ions.filter(i => i.charge < 0)

  return (
    <div className="flex flex-col gap-1">
      {cations.length > 0 && (
        <div className="mb-1">
          <p className="font-mono text-[10px] tracking-wider text-dim mb-2">CATIONS (positive)</p>
          <div className="flex flex-col gap-2">
            {cations.map(ion => (
              <IonRow key={ion.charge} symbol={el.symbol} ion={ion} color={color} valenceColor="#f97316" />
            ))}
          </div>
        </div>
      )}

      {anions.length > 0 && (
        <div className={cations.length > 0 ? 'mt-3' : ''}>
          <p className="font-mono text-[10px] tracking-wider text-dim mb-2">ANIONS (negative)</p>
          <div className="flex flex-col gap-2">
            {anions.map(ion => (
              <IonRow key={ion.charge} symbol={el.symbol} ion={ion} color={color} valenceColor="#38bdf8" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function IonRow({
  symbol, ion, color, valenceColor,
}: {
  symbol: string
  ion: { charge: number; note: string; common?: boolean }
  color: string
  valenceColor: string
}) {
  const formula = ionFormula(symbol, ion.charge)
  const absCharge = Math.abs(ion.charge)
  const sign = ion.charge > 0 ? '+' : '−'

  return (
    <div className="flex items-start gap-3 p-2.5 rounded-sm border"
      style={{
        borderColor: ion.common
          ? `color-mix(in srgb, ${color} 35%, transparent)`
          : 'rgba(var(--overlay),0.06)',
        background: ion.common
          ? `color-mix(in srgb, ${color} 7%, transparent)`
          : 'transparent',
      }}
    >
      {/* Ion badge */}
      <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-sm border"
        style={{
          borderColor: `color-mix(in srgb, ${valenceColor} 40%, transparent)`,
          background: `color-mix(in srgb, ${valenceColor} 12%, transparent)`,
        }}
      >
        <span className="font-mono font-bold text-base leading-none" style={{ color: valenceColor }}>
          {formula}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[11px]" style={{ color: valenceColor }}>
            {sign}{absCharge}
          </span>
          {ion.common && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: `color-mix(in srgb, ${color} 15%, transparent)`,
                color,
                border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
              }}>
              most common
            </span>
          )}
        </div>
        <p className="font-sans text-[11px] text-secondary leading-snug">{ion.note}</p>
      </div>
    </div>
  )
}

// ── Isotopes tab ──────────────────────────────────────────────────────────────

function fmtAbundance(n: number): string {
  if (n >= 10)   return n.toFixed(2) + '%'
  if (n >= 1)    return n.toFixed(2) + '%'
  if (n >= 0.1)  return n.toFixed(3) + '%'
  if (n >= 0.01) return n.toFixed(4) + '%'
  return n.toPrecision(2) + '%'
}

function IsotopesTab({ el, color }: { el: NonNullable<Element>; color: string }) {
  const isotopes = ISOTOPES[el.atomicNumber] ?? []

  if (isotopes.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center gap-2">
        <span className="font-mono text-2xl" style={{ color: 'rgba(var(--overlay),0.15)' }}>—</span>
        <p className="font-sans text-xs text-dim text-center">No isotope data available for this element.</p>
      </div>
    )
  }

  // Max natural abundance for relative bar scaling
  const maxAbundance = Math.max(...isotopes.map(i => i.abundance ?? 0), 1)

  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="flex items-center pb-1.5 mb-1 border-b border-border">
        <span className="font-mono text-xs text-secondary tracking-wider w-16">ISOTOPE</span>
        <span className="font-mono text-xs text-secondary tracking-wider flex-1 text-center">ABUNDANCE</span>
        <span className="font-mono text-xs text-secondary tracking-wider text-right w-20">NOTES</span>
      </div>

      {isotopes.map((iso) => {
        const hasAbundance = iso.abundance != null
        const barWidth = hasAbundance ? (iso.abundance! / maxAbundance) * 100 : 0

        return (
          <div key={iso.A}
            className="flex items-center gap-2 py-2 border-b border-border last:border-0">

            {/* Isotope label */}
            <div className="w-16 shrink-0 flex items-baseline gap-0.5">
              <span className="font-mono text-xs text-secondary leading-none" style={{ verticalAlign: 'super', fontSize: '8px' }}>
                {iso.A}
              </span>
              <span className="font-mono text-sm font-medium" style={{ color: iso.name ? color : 'rgba(var(--overlay),0.8)' }}>
                {el.symbol}
              </span>
              {iso.name && (
                <span className="font-sans text-xs text-secondary italic ml-0.5 hidden sm:inline truncate max-w-[52px]">
                  {iso.name}
                </span>
              )}
            </div>

            {/* Abundance bar + value */}
            <div className="flex-1 flex flex-col gap-0.5">
              {hasAbundance ? (
                <>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex-1 h-1 bg-raised rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: iso.radioactive ? '#f87171' : color, opacity: 0.75 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.2, ease: 'easeOut', delay: 0.05 }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-primary w-16 text-right shrink-0">
                      {fmtAbundance(iso.abundance!)}
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-mono text-[11px] text-dim">no natural occurrence</span>
              )}
            </div>

            {/* Radioactive / half-life */}
            <div className="w-20 shrink-0 text-right">
              {iso.radioactive ? (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[9px]" style={{ color: '#f87171' }}>☢ radioactive</span>
                  {iso.halfLife && (
                    <span className="font-mono text-xs text-secondary">t½ {iso.halfLife}</span>
                  )}
                </div>
              ) : (
                <span className="font-mono text-xs text-secondary">stable</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Electron config tab ───────────────────────────────────────────────────────

function ConfigBox({ up, down }: { up: boolean; down: boolean }) {
  return (
    <div className="w-6 h-7 rounded-sm flex items-center justify-center gap-px shrink-0"
      style={{ border: '1px solid rgba(var(--overlay),0.15)', background: (up || down) ? 'rgba(var(--overlay),0.03)' : 'transparent' }}>
      <span className="font-mono text-[10px] leading-none select-none"
        style={{ color: up ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.08)' }}>↑</span>
      <span className="font-mono text-[10px] leading-none select-none"
        style={{ color: down ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.08)' }}>↓</span>
    </div>
  )
}

function ConfigSubshell({ sub }: { sub: SubshellFill }) {
  const states = orbitalStates(sub.electrons, sub.orbitals)
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-mono text-[9px] tracking-wide" style={{ color: 'rgba(var(--overlay),0.35)' }}>
        {sub.label}
      </span>
      <div className="flex gap-0.5">
        {states.map((s, i) => <ConfigBox key={i} up={s.up} down={s.down} />)}
      </div>
    </div>
  )
}

function ElectronConfigTab({ el, color }: { el: Element; color: string }) {
  const [showFull, setShowFull] = useState(false)

  const Z = el.atomicNumber
  const exception = EXCEPTIONS[Z]
  const fullSubshells = computeConfig(Z)
  const { coreLabel, subshells: abbrSubshells } = getAbbrConfig(Z)

  const displaySubshells = showFull ? fullSubshells : abbrSubshells
  const displayCore      = showFull ? null : coreLabel
  const shellRows        = groupByShell(displaySubshells)
  const valence          = valenceElectrons(fullSubshells)

  return (
    <div className="flex flex-col gap-4">

      {/* Valence count + controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold" style={{ color }}>
            {valence}
          </span>
          <span className="font-sans text-xs text-secondary">
            valence electron{valence !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {exception && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: 'color-mix(in srgb, #f59e0b 12%, transparent)',
                color: '#f59e0b',
                border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)',
              }}>
              exception
            </span>
          )}
          <button
            onClick={() => setShowFull(f => !f)}
            className="font-mono text-[10px] px-2 py-1 rounded-sm border transition-colors"
            style={{
              borderColor: showFull ? `color-mix(in srgb, ${color} 40%, transparent)` : 'rgba(var(--overlay),0.12)',
              color: showFull ? color : 'rgba(var(--overlay),0.4)',
              background: showFull ? `color-mix(in srgb, ${color} 10%, transparent)` : 'transparent',
            }}
          >
            full
          </button>
        </div>
      </div>

      {/* Written notation */}
      <div className="p-3 rounded-sm border border-border flex flex-wrap gap-x-1 gap-y-0.5"
        style={{ background: 'rgb(var(--color-surface))' }}>
        {displayCore && (
          <span className="font-mono text-sm text-dim">{displayCore} </span>
        )}
        {displaySubshells.map(s => (
          <span key={s.label + s.aufbauIdx} className="font-mono text-sm"
            style={{ color: 'rgba(var(--overlay),0.75)' }}>
            {s.label}<sup style={{ fontSize: '0.65em' }}>{s.electrons}</sup>
          </span>
        ))}
      </div>

      {/* Exception note */}
      {exception && (
        <div className="p-3 rounded-sm"
          style={{
            background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
            border: '1px solid color-mix(in srgb, #f59e0b 25%, transparent)',
          }}>
          <p className="font-mono text-[9px] tracking-wider mb-1" style={{ color: '#f59e0b' }}>AUFBAU EXCEPTION</p>
          <p className="font-sans text-[11px]" style={{ color: 'rgba(245,158,11,0.8)' }}>{exception.note}</p>
        </div>
      )}

      {/* Orbital box diagram */}
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase mb-1">Orbital Box Diagram</p>
        {shellRows.map(([n, subs]) => (
          <div key={n} className="flex items-end gap-3 p-2.5 rounded-sm border border-border"
            style={{ background: 'rgb(var(--color-surface))' }}>
            <span className="font-mono text-xs text-secondary w-7 shrink-0 pb-0.5">n={n}</span>
            <div className="flex items-end gap-3 flex-wrap">
              {subs.map(sub => <ConfigSubshell key={sub.label} sub={sub} />)}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

type Tab = 'properties' | 'ions' | 'isotopes' | 'config'
const TABS: Tab[] = ['properties', 'ions', 'isotopes', 'config']

export default function ElementModal() {
  const { selectedElement, selectElement } = useElementStore()
  const el = selectedElement

  const category   = el ? getColorCategory(el) : null
  const color      = category ? GROUP_COLORS[category] : '#ffffff'
  const groupLabel = category ? GROUP_LABELS[category] : ''

  const [tab, setTab] = useState<Tab>('properties')
  useEffect(() => { setTab('properties') }, [el?.atomicNumber])

  return (
    <AnimatePresence>
      {el && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => selectElement(null)}
          />

          {/* Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative flex flex-col overflow-hidden pointer-events-auto"
              style={{
                width: 'min(440px, 92vw)',
                maxHeight: '88vh',
                borderRadius: '6px',
                border: `1px solid color-mix(in srgb, ${color} 30%, rgb(var(--color-border)))`,
                background: 'rgb(var(--color-surface))',
                boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px color-mix(in srgb, ${color} 15%, transparent)`,
              }}
            >
              {/* Close button */}
              <button
                onClick={() => selectElement(null)}
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center
                           rounded-sm border border-border text-dim hover:text-primary
                           hover:border-muted transition-colors font-mono text-xs"
                aria-label="Close"
              >
                ✕
              </button>

              {/* Hero */}
              <div
                className="relative flex flex-col items-start justify-end p-6 pb-5 shrink-0"
                style={{
                  background: `linear-gradient(135deg,
                    color-mix(in srgb, ${color} 18%, rgb(var(--color-surface))) 0%,
                    rgb(var(--color-surface)) 65%)`,
                  borderBottom: `1px solid color-mix(in srgb, ${color} 20%, rgb(var(--color-border)))`,
                }}
              >
                <motion.div
                  variants={heroVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-start"
                >
                  <motion.span variants={heroRowVariants} className="font-mono text-xs mb-1"
                    style={{ color: `color-mix(in srgb, ${color} 70%, white)` }}>
                    {el.atomicNumber}
                  </motion.span>

                  <motion.div variants={heroRowVariants} className="font-mono font-semibold leading-none"
                    style={{ color, fontSize: '4.5rem', lineHeight: 1 }}>
                    {el.symbol}
                  </motion.div>

                  <motion.div variants={heroRowVariants} className="mt-2 font-sans font-medium text-primary text-xl">
                    {el.name}
                  </motion.div>

                  <motion.div variants={heroRowVariants}
                    className="mt-2 px-2 py-0.5 rounded-sm font-mono text-[11px] tracking-wider"
                    style={{
                      background: `color-mix(in srgb, ${color} 18%, transparent)`,
                      color,
                      border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                    }}>
                    {groupLabel.toUpperCase()}
                  </motion.div>
                </motion.div>
              </div>

              {/* Tab bar */}
              <div className="flex shrink-0 border-b border-border relative" style={{ background: 'rgba(0,0,0,0.2)' }}>
                {TABS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2.5 font-mono text-[11px] tracking-widest uppercase transition-colors"
                    style={{ color: tab === t ? color : 'rgba(var(--overlay),0.3)' }}
                  >
                    {t === 'config' ? 'e⁻ config' : t}
                  </button>
                ))}
                {/* Single indicator that slides — no layoutId to avoid AnimatePresence exit conflicts */}
                <motion.div
                  className="absolute bottom-0 left-0 h-px pointer-events-none"
                  style={{ background: color, width: `${100 / TABS.length}%` }}
                  animate={{ x: `${TABS.indexOf(tab) * 100}%` }}
                  transition={{ type: 'tween', duration: 0.15, ease: 'easeInOut' }}
                />
              </div>

              {/* Tab content */}
              <div className="overflow-y-auto p-5 flex-1">
                {tab === 'properties' && <PropertiesTab el={el} color={color} />}
                {tab === 'ions'       && <IonsTab       el={el} color={color} />}
                {tab === 'isotopes'   && <IsotopesTab   el={el} color={color} />}
                {tab === 'config'     && <ElectronConfigTab el={el} color={color} />}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

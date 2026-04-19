import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LewisStructure } from './LewisPage'
import { looksLikeFormula, resolveToFormula } from '../utils/resolveFormula'
import VsepDiagram from '../components/vsepr/VsepDiagram'
import StepsPanel from '../components/calculations/StepsPanel'

// ── VSEPR derivation ──────────────────────────────────────────────────────────

const ELECTRON_GEOMETRY: Record<number, string> = {
  1: 'Linear',
  2: 'Linear',
  3: 'Trigonal Planar',
  4: 'Tetrahedral',
  5: 'Trigonal Bipyramidal',
  6: 'Octahedral',
}

const HYBRIDIZATION: Record<number, string> = {
  1: 's',
  2: 'sp',
  3: 'sp²',
  4: 'sp³',
  5: 'sp³d',
  6: 'sp³d²',
}

const BOND_ANGLES: Record<string, string> = {
  linear: '180°',
  diatomic: '180°',
  bent: '≈ 104.5°',
  trigonal_planar: '120°',
  trigonal_pyramidal: '≈ 107°',
  tetrahedral: '≈ 109.5°',
  t_shaped: '90°, 180°',
  see_saw: '≈ 90°, ≈ 120°, 180°',
  square_planar: '90°',
  square_pyramidal: '90°',
  trigonal_bipyramidal: '90°, 120°',
  octahedral: '90°',
}

const GEOMETRY_LABEL: Record<string, string> = {
  linear: 'Linear',
  diatomic: 'Linear',
  bent: 'Bent',
  trigonal_planar: 'Trigonal Planar',
  trigonal_pyramidal: 'Trigonal Pyramidal',
  tetrahedral: 'Tetrahedral',
  t_shaped: 'T-Shaped',
  see_saw: 'See-Saw',
  seesaw: 'See-Saw',
  square_planar: 'Square Planar',
  square_pyramidal: 'Square Pyramidal',
  trigonal_bipyramidal: 'Trigonal Bipyramidal',
  octahedral: 'Octahedral',
}

function deriveVseprInfo(structure: LewisStructure) {
  const adj: Record<string, string[]> = {}
  structure.atoms.forEach(a => { adj[a.id] = [] })
  structure.bonds.forEach(b => {
    adj[b.from].push(b.to)
    adj[b.to].push(b.from)
  })

  const center = structure.atoms.reduce((best, a) => {
    const bc = adj[a.id].length, bb = adj[best.id].length
    if (bc > bb) return a
    if (bc === bb && best.element === 'H' && a.element !== 'H') return a
    return best
  })

  const bondingPairs = adj[center.id].length
  const lonePairs = center.lone_pairs
  const electronPairs = bondingPairs + lonePairs

  const geoKey = structure.geometry.toLowerCase().replace(/-/g, '_')

  return {
    center: center.element,
    bondingPairs,
    lonePairs,
    electronPairs,
    electronGeometry: ELECTRON_GEOMETRY[electronPairs] ?? '—',
    hybridization: HYBRIDIZATION[electronPairs] ?? '—',
    molecularGeometry: GEOMETRY_LABEL[geoKey] ?? structure.geometry,
    bondAngles: BOND_ANGLES[geoKey] ?? '—',
  }
}

// ── Examples ──────────────────────────────────────────────────────────────────

const EXAMPLES: { label: string; input: string; charge?: number }[] = [
  { label: 'H₂O',   input: 'H2O'  },
  { label: 'CH₄',   input: 'CH4'  },
  { label: 'NH₃',   input: 'NH3'  },
  { label: 'CO₂',   input: 'CO2'  },
  { label: 'PCl₅',  input: 'PCl5' },
  { label: 'SF₆',   input: 'SF6'  },
  { label: 'XeF₄',  input: 'XeF4' },
  { label: 'SO₄²⁻', input: 'SO4', charge: -2 },
]

// ── Charge validation (mirrors LewisPage) ─────────────────────────────────────

const MAX_CHARGE = 8

function validateCharge(raw: string): string | null {
  if (raw === '' || raw === '-') return null
  const n = Number(raw)
  if (!Number.isInteger(n)) return 'Charge must be a whole number'
  if (Math.abs(n) > MAX_CHARGE) return `Charge must be between −${MAX_CHARGE} and +${MAX_CHARGE}`
  return null
}

function formatCharge(c: number): string {
  if (c === 1) return '⁺'
  if (c === -1) return '⁻'
  if (c > 1) return `${c}⁺`
  if (c < -1) return `${Math.abs(c)}⁻`
  return ''
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VsepPage() {
  const [input, setInput]         = useState('')
  const [chargeRaw, setChargeRaw] = useState('0')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<LewisStructure | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [resolved, setResolved]   = useState<{ from: string; to: string } | null>(null)

  const chargeError = validateCharge(chargeRaw)
  const chargeInt = chargeError === null && chargeRaw !== '' && chargeRaw !== '-'
    ? Number(chargeRaw)
    : null

  const canSubmit = input.trim().length > 0 && !chargeError && !loading

  async function analyze(formula: string, charge: number) {
    const trimmed = formula.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const body: Record<string, unknown> = { input: trimmed }
      if (charge !== 0) body.charge = charge
      const resp = await fetch('/api/structure/lewis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error ?? 'An error occurred.')
        return
      }
      setResult(data as LewisStructure)
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!canSubmit || chargeInt === null) return
    const trimmed = input.trim()
    setResolved(null)
    if (looksLikeFormula(trimmed)) {
      analyze(trimmed, chargeInt)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await resolveToFormula(trimmed)
      if (res.resolvedFrom) setResolved({ from: res.resolvedFrom, to: res.formula })
      analyze(res.formula, chargeInt)
    } catch (msg) {
      setError(typeof msg === 'string' ? msg : 'Failed to connect to the server.')
      setLoading(false)
    }
  }

  function handleExample(ex: typeof EXAMPLES[0]) {
    const c = ex.charge ?? 0
    setInput(ex.input)
    setChargeRaw(String(c))
    setResult(null)
    setError(null)
    analyze(ex.input, c)
  }

  function handleChargeChange(raw: string) {
    if (raw !== '' && raw !== '-' && !/^-?\d+$/.test(raw)) return
    setChargeRaw(raw)
  }

  const vsepr = result ? deriveVseprInfo(result) : null

  return (
    <div className="flex flex-col gap-6">

      {/* Input row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-stretch gap-2">
          {/* Formula */}
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Formula or name — e.g. H2O, water, CH4, methane"
            className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2.5
                       text-primary placeholder-dim focus:outline-none transition-colors"
          />

          {/* Charge */}
          <div className="flex items-stretch shrink-0 w-24">
            <input
              type="text" inputMode="numeric"
              value={chargeRaw}
              onChange={e => handleChargeChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              aria-label="Ionic charge"
              className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-l-sm
                         px-3 py-2.5 text-primary focus:outline-none transition-colors text-right"
              style={{ borderColor: chargeError ? '#f87171' : undefined }}
            />
            <span className="flex items-center px-2 font-mono text-xs text-dim bg-raised
                             border border-l-0 border-border rounded-r-sm shrink-0">
              {chargeInt !== null && chargeInt !== 0 ? formatCharge(chargeInt) : '0'}
            </span>
          </div>

          {/* Analyze */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40 self-start"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
            }}
          >
            {loading ? '…' : 'Analyze'}
          </button>
        </div>

        {chargeError && <p className="font-mono text-[10px] text-red-400">{chargeError}</p>}
        {resolved && (
          <p className="font-mono text-[10px]" style={{ color: 'var(--c-halogen)' }}>
            Resolved: {resolved.from} → {resolved.to}
          </p>
        )}

        {/* Examples */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs text-secondary">Try:</span>
          {EXAMPLES.map(ex => (
            <button
              key={`${ex.input}${ex.charge ?? 0}`}
              onClick={() => handleExample(ex)}
              className="font-mono text-[11px] px-2 py-0.5 rounded-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && vsepr && (
          <motion.div
            key={`${result.formula}-${result.charge}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Title */}
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans font-semibold text-bright text-2xl">{result.name}</h3>
              {result.charge !== 0 && (
                <span className="font-mono text-lg font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {formatCharge(result.charge)}
                </span>
              )}
            </div>

            {/* Diagram + info side by side on wider screens */}
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="sm:w-72 shrink-0">
                <VsepDiagram structure={result} />
              </div>

              {/* VSEPR info */}
              <div className="flex flex-col gap-3 flex-1">
                <InfoRow label="Molecular Geometry"  value={vsepr.molecularGeometry} highlight />
                <InfoRow label="Electron Geometry"   value={vsepr.electronGeometry} />
                <InfoRow label="Hybridization"       value={vsepr.hybridization} />
                <InfoRow label="Bond Angles"         value={vsepr.bondAngles} />
                <InfoRow label="Bonding Pairs"       value={String(vsepr.bondingPairs)} />
                {vsepr.lonePairs > 0 && (
                  <InfoRow label="Lone Pairs on Center" value={String(vsepr.lonePairs)} />
                )}
                <InfoRow label="Total Electron Pairs" value={String(vsepr.electronPairs)} />
                <InfoRow label="Valence Electrons"   value={`${result.total_valence_electrons} e⁻`} />
              </div>
            </div>

            {/* Steps */}
            <StepsPanel steps={result.steps} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-xs text-secondary tracking-widest uppercase shrink-0 w-44">{label}</span>
      <span
        className="font-sans text-sm"
        style={{ color: highlight ? 'var(--c-halogen)' : undefined }}
      >
        {value}
      </span>
    </div>
  )
}

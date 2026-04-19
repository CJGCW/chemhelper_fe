import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LewisStructureDiagram from '../components/lewis/LewisStructureDiagram'
import StepsPanel from '../components/calculations/StepsPanel'
import LewisEditor from '../components/lewis/LewisEditor'
import { looksLikeFormula, resolveToFormula } from '../utils/resolveFormula'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LewisAtom {
  id: string
  element: string
  lone_pairs: number
  formal_charge: number
}

export interface LewisBond {
  from: string
  to: string
  order: number
}

export interface LewisStructure {
  name: string
  formula: string
  charge: number
  total_valence_electrons: number
  geometry: string
  atoms: LewisAtom[]
  bonds: LewisBond[]
  steps: string[]
  notes: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Must match maxChargeMagnitude in the backend handler.
const MAX_CHARGE = 8

// ── Example quick-pick compounds ─────────────────────────────────────────────

const EXAMPLES: { label: string; input: string; charge?: number }[] = [
  { label: 'H₂O',  input: 'H2O'  },
  { label: 'CO₂',  input: 'CO2'  },
  { label: 'NH₃',  input: 'NH3'  },
  { label: 'CH₄',  input: 'CH4'  },
  { label: 'NO₃⁻', input: 'NO3', charge: -1 },
  { label: 'SO₄²⁻',input: 'SO4', charge: -2 },
  { label: 'NH₄⁺', input: 'NH4', charge:  1 },
  { label: 'PCl₅', input: 'PCl5' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatGeometry(geometry: string): string {
  return geometry.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatBondOrder(order: number): string {
  if (order === 1) return 'single'
  if (order === 2) return 'double'
  if (order === 3) return 'triple'
  return `order ${order}`
}

function formatCharge(c: number): string {
  if (c === 1) return '⁺'
  if (c === -1) return '⁻'
  if (c > 1) return `${c}⁺`
  if (c < -1) return `${Math.abs(c)}⁻`
  return ''
}

// Returns a validation error string, or null if the charge string is acceptable.
function validateChargeInput(raw: string): string | null {
  if (raw === '' || raw === '-') return null // still typing
  const n = Number(raw)
  if (!Number.isInteger(n)) return 'Charge must be a whole number'
  if (Math.abs(n) > MAX_CHARGE) return `Charge must be between −${MAX_CHARGE} and +${MAX_CHARGE}`
  return null
}

type Mode = 'generate' | 'practice'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LewisPage({ embedded = false }: { embedded?: boolean }) {
  const [mode, setMode]           = useState<Mode>('generate')
  const [input, setInput]         = useState('')
  const [chargeRaw, setChargeRaw] = useState('0')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState<LewisStructure | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [resolved, setResolved]   = useState<{ from: string; to: string } | null>(null)


  // Cache the last fetched structure so the editor can reuse it for checking
  const cachedStructure = useRef<LewisStructure | null>(null)
  cachedStructure.current = result

  // Called by the editor when it needs the correct structure for validation
  const requestStructure = useCallback(async (): Promise<LewisStructure | null> => {
    return cachedStructure.current
  }, [])

  const chargeError = validateChargeInput(chargeRaw)
  const chargeInt   = chargeError === null && chargeRaw !== '' && chargeRaw !== '-'
    ? Number(chargeRaw)
    : null

  // Detect if the formula field contains embedded charge notation.
  const formulaHasChargeSuffix = /[+-]/.test(input.trim())
  const formulaWarning = formulaHasChargeSuffix
    ? 'Looks like you embedded a charge in the formula — use the Charge field instead.'
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
    setInput(ex.input)
    const c = ex.charge ?? 0
    setChargeRaw(String(c))
    setResult(null)
    setError(null)
    analyze(ex.input, c)
  }

  function handleChargeChange(raw: string) {
    // Allow digits, a leading minus, and nothing else.
    if (raw !== '' && raw !== '-' && !/^-?\d+$/.test(raw)) return
    setChargeRaw(raw)
  }

  // Summarise formal charges for the info strip
  const chargedAtoms = result?.atoms.filter(a => a.formal_charge !== 0) ?? []

  const inner = (
    <>
      {/* Header + mode tabs — hidden when embedded inside StructuresPage */}
      <div className="flex flex-col gap-3">
        {!embedded && <h2 className="font-sans font-semibold text-bright text-xl">Lewis Structure</h2>}

        {/* Mode tabs — only shown when not embedded */}
        {!embedded && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {(['generate', 'practice'] as Mode[]).map(m => {
              const isActive = mode === m
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
                  style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="lewis-tab-bg"
                      className="absolute inset-0 rounded-sm"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{m === 'generate' ? 'Generate' : 'Practice'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {mode === 'practice' && !embedded && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs text-secondary">Molecule:</span>
            {EXAMPLES.map(ex => (
              <button
                key={`${ex.input}${ex.charge ?? 0}`}
                onClick={() => handleExample(ex)}
                className="font-mono text-[11px] px-2 py-0.5 rounded-sm border transition-colors"
                style={{
                  borderColor: input === ex.input && chargeRaw === String(ex.charge ?? 0)
                    ? 'color-mix(in srgb, var(--c-halogen) 50%, transparent)'
                    : '#1c1f2e',
                  color: input === ex.input && chargeRaw === String(ex.charge ?? 0)
                    ? 'var(--c-halogen)'
                    : 'rgba(255,255,255,0.45)',
                  background: input === ex.input && chargeRaw === String(ex.charge ?? 0)
                    ? 'color-mix(in srgb, var(--c-halogen) 10%, #0e1016)'
                    : 'transparent',
                }}
              >
                {ex.label}
              </button>
            ))}
            {loading && <span className="font-mono text-xs text-secondary">Loading…</span>}
            {error && <span className="font-mono text-[10px] text-red-400">{error}</span>}
          </div>
          <LewisEditor
            correctStructure={result}
            onRequestStructure={requestStructure}
          />
        </div>
      )}

      {(mode === 'generate' || embedded) && <div className="flex flex-col gap-6">

      {/* Input row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-stretch gap-2">
          {/* Formula */}
          <div className="flex flex-col gap-1 flex-1">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Formula or name — e.g. H2O, water, CO2, ammonia"
              className="w-full font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2.5
                         text-primary placeholder-dim focus:outline-none transition-colors"
              style={{ borderColor: formulaWarning ? '#f59e0b' : undefined }}
            />
            {formulaWarning && (
              <p className="font-mono text-[10px]" style={{ color: '#f59e0b' }}>{formulaWarning}</p>
            )}
          </div>

          {/* Charge */}
          <div className="flex flex-col gap-1 shrink-0 w-24">
            <div className="flex items-stretch">
              <input
                type="text"
                inputMode="numeric"
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
            {chargeError && (
              <p className="font-mono text-[10px] text-red-400">{chargeError}</p>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40 self-start"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
            }}
          >
            {loading ? '…' : 'Analyze'}
          </button>
        </div>

        {/* Resolved name indicator */}
        {resolved && (
          <p className="font-mono text-[10px]" style={{ color: 'var(--c-halogen)' }}>
            Resolved: {resolved.from} → {resolved.to}
          </p>
        )}

        {/* Quick examples */}
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
        {result && (
          <motion.div
            key={`${result.formula}-${result.charge}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Formula title */}
            <div className="flex items-baseline gap-2">
              <h3 className="font-sans font-semibold text-bright text-2xl">{result.name}</h3>
              {result.charge !== 0 && (
                <span
                  className="font-mono text-lg font-semibold"
                  style={{ color: 'var(--c-halogen)' }}
                >
                  {formatCharge(result.charge)}
                </span>
              )}
            </div>

            {/* Diagram */}
            <LewisStructureDiagram structure={result} />

            {/* Metadata strip */}
            {(() => {
              const sigmaBonds = result.bonds.length
              const piBonds    = result.bonds.reduce((s, b) => s + Math.max(0, b.order - 1), 0)
              return (
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  <Stat label="Geometry" value={formatGeometry(result.geometry)} />
                  <Stat label="Valence electrons" value={`${result.total_valence_electrons} e⁻`} />
                  <Stat
                    label="Bonds"
                    value={
                      result.bonds.length === 0
                        ? 'Ionic (no covalent bonds)'
                        : result.bonds
                            .map(b => `${b.from}–${b.to} (${formatBondOrder(b.order)})`)
                            .join(', ')
                    }
                  />
                  {result.bonds.length > 0 && (
                    <Stat label="σ bonds" value={`${sigmaBonds}`} />
                  )}
                  {piBonds > 0 && (
                    <Stat label="π bonds" value={`${piBonds}`} />
                  )}
                  {chargedAtoms.length > 0 && (
                    <Stat
                      label="Formal charges"
                      value={chargedAtoms
                        .map(a => `${a.id}: ${a.formal_charge > 0 ? '+' : ''}${a.formal_charge}`)
                        .join(', ')}
                    />
                  )}
                </div>
              )
            })()}

            {/* Notes (ionic compounds etc.) */}
            {result.notes && (
              <p
                className="font-mono text-xs text-secondary rounded-sm px-3 py-2.5 border border-border"
                style={{ background: '#0e1016' }}
              >
                {result.notes}
              </p>
            )}

            {/* Steps */}
            <StepsPanel steps={result.steps} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>}
    </>
  )

  if (embedded) return inner
  return <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-6">{inner}</div>
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</span>
      <span className="font-sans text-sm text-primary">{value}</span>
    </div>
  )
}

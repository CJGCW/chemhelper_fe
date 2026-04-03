import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompoundResult {
  cid: number
  molecular_formula: string
  molecular_weight: string
  iupac_name: string
  smiles: string
  inchi: string
  inchi_key: string
  input_type: string
}

// ── Input type detection (mirrors backend DetectInputType) ────────────────────

const INCHI_KEY_RE = /^[A-Z]{14}-[A-Z]{10}-[A-Z]$/

export function detectInputType(s: string): string {
  const t = s.trim()
  if (!t) return 'name'
  if (/^\d+$/.test(t)) return 'cid'
  if (t.toUpperCase().startsWith('INCHI=')) return 'inchi'
  if (INCHI_KEY_RE.test(t)) return 'inchikey'
  if (/[=#@\\/\[\]]/.test(t)) return 'smiles'
  if (t.includes('(') && /[cnosp]/.test(t)) return 'smiles'
  // Plain organic SMILES (e.g. "CCO", "CC", "Cl") — only organic-subset atom
  // letters, no digits. Formulas always have digits (H2O, CH4); names contain
  // non-SMILES letters (a, e, t, …).
  if (/^([BCFHINOPSbcnops]|[Cc]l|[Bb]r)+$/.test(t)) return 'smiles'
  // Aromatic ring SMILES with digits (e.g. "c1ccccc1") — digits + lowercase atoms.
  if (/^([BCFHINOPSbcnops]|[Cc]l|[Bb]r|\d)+$/.test(t) && /[bcnops]/.test(t)) return 'smiles'
  return 'name'
}

const TYPE_LABELS: Record<string, string> = {
  cid: 'PubChem CID',
  inchi: 'InChI',
  inchikey: 'InChIKey',
  smiles: 'SMILES',
  name: 'Name / Formula',
}

// ── Examples ──────────────────────────────────────────────────────────────────

const EXAMPLES = [
  { label: 'Water',     input: 'water' },
  { label: 'Caffeine',  input: 'caffeine' },
  { label: 'Aspirin',   input: 'CC(=O)Oc1ccccc1C(=O)O' },
  { label: 'Glucose',   input: 'C6H12O6' },
  { label: 'NaCl',      input: '5234' },
  { label: 'Ethanol',   input: 'CCO' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function CompoundPage() {
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<CompoundResult | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState<string | null>(null)

  const detectedType = detectInputType(input)
  const canSubmit = input.trim().length > 0 && !loading

  async function lookup(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const resp = await fetch('/api/compound/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error ?? 'An error occurred.')
        return
      }
      setResult(data as CompoundResult)
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit() {
    if (canSubmit) lookup(input)
  }

  function handleExample(ex: typeof EXAMPLES[0]) {
    setInput(ex.input)
    setResult(null)
    setError(null)
    lookup(ex.input)
  }

  async function copyToClipboard(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col gap-6">

      <h2 className="font-sans font-semibold text-bright text-xl">Compound Converter</h2>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Name, SMILES, InChI, InChIKey, formula, or CID…"
              className="w-full font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2.5
                         text-primary placeholder-dim focus:outline-none transition-colors pr-28"
            />
            {input.trim() && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                {TYPE_LABELS[detectedType]}
              </span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40 shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >
            {loading ? '…' : 'Look up'}
          </button>
        </div>

        {/* Quick examples */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-dim">Try:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.input}
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
            key={result.cid}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 rounded-sm border border-border overflow-hidden"
            style={{ background: '#0e1016' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-baseline gap-2 flex-wrap">
              <span className="font-sans font-semibold text-bright text-lg">
                {result.iupac_name || result.molecular_formula}
              </span>
              <span className="font-mono text-xs text-dim">PubChem CID {result.cid}</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y divide-border">
              <Row label="Molecular Formula" value={result.molecular_formula} id="formula" copied={copied} onCopy={copyToClipboard} mono />
              <Row label="Molar Mass" value={`${result.molecular_weight} g/mol`} id="weight" copied={copied} onCopy={copyToClipboard} />
              <Row label="IUPAC Name" value={result.iupac_name} id="iupac" copied={copied} onCopy={copyToClipboard} />
              <Row label="SMILES" value={result.smiles} id="smiles" copied={copied} onCopy={copyToClipboard} mono wrap />
              <Row label="InChI" value={result.inchi} id="inchi" copied={copied} onCopy={copyToClipboard} mono wrap />
              <Row label="InChIKey" value={result.inchi_key} id="inchikey" copied={copied} onCopy={copyToClipboard} mono />
              <Row
                label="PubChem CID"
                value={String(result.cid)}
                id="cid"
                copied={copied}
                onCopy={copyToClipboard}
                mono
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────

function Row({
  label, value, id, copied, onCopy, mono = false, wrap = false,
}: {
  label: string
  value: string
  id: string
  copied: string | null
  onCopy: (value: string, key: string) => void
  mono?: boolean
  wrap?: boolean
}) {
  if (!value) return null
  const isCopied = copied === id

  return (
    <div className="flex items-start gap-3 px-4 py-2.5 group">
      <span
        className="font-mono text-[10px] text-dim tracking-wider uppercase shrink-0 pt-0.5"
        style={{ minWidth: 140 }}
      >
        {label}
      </span>
      <span
        className={`flex-1 text-sm text-primary ${mono ? 'font-mono' : 'font-sans'} ${wrap ? 'break-all' : 'truncate'}`}
        title={value}
      >
        {value}
      </span>
      <button
        onClick={() => onCopy(value, id)}
        className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-sm border transition-colors opacity-0 group-hover:opacity-100"
        style={{
          borderColor: isCopied ? 'var(--c-halogen)' : 'rgba(255,255,255,0.15)',
          color: isCopied ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
          background: isCopied ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
        }}
      >
        {isCopied ? 'copied' : 'copy'}
      </button>
    </div>
  )
}

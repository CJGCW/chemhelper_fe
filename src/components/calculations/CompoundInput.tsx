import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveSmiles, resolveFormula } from '../../api/calculations'
import { useElementStore } from '../../stores/elementStore'

interface Props {
  onResolved: (molarMass: string, formula: string, name: string) => void
}

type Mode = 'formula' | 'smiles'

interface ElementRow {
  symbol: string
  name: string
  count: number
  atomicWeight: number
  contribution: number
}

interface Resolved {
  formula: string
  mw: string
  name: string
  breakdown: ElementRow[] | null
}

// Validation helpers
const FORMULA_RE = /^[A-Z][A-Za-z0-9()[\]]*$/
const FORMULA_CHARS = /^[A-Za-z0-9()[\]]*$/
const SMILES_CHARS  = /^[A-Za-z0-9()[\]@/\\=#+.\-:]+$/

function validateFormula(v: string): string | null {
  if (!v) return null
  if (!FORMULA_CHARS.test(v)) return 'Only letters, digits, and parentheses are allowed'
  if (!/[A-Z]/.test(v)) return 'Formula must contain at least one element symbol (capital letter)'
  if (!FORMULA_RE.test(v)) return 'Formula must start with a capital letter (element symbol)'
  return null
}

function validateSmiles(v: string): string | null {
  if (!v) return null
  if (!SMILES_CHARS.test(v)) return 'Invalid SMILES characters detected'
  return null
}

export default function CompoundInput({ onResolved }: Props) {
  const [open, setOpen]       = useState(false)
  const [mode, setMode]       = useState<Mode>('formula')
  const [input, setInput]     = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [resolved, setResolved] = useState<Resolved | null>(null)

  const { elements, loadElements } = useElementStore()
  useEffect(() => { loadElements() }, [loadElements])

  function handleInputChange(v: string) {
    setInput(v)
    setError(null)
    // Real-time validation
    const err = mode === 'formula' ? validateFormula(v) : validateSmiles(v)
    setInputError(err)
  }

  async function handleResolve() {
    const validationErr = mode === 'formula' ? validateFormula(input.trim()) : validateSmiles(input.trim())
    if (validationErr) { setInputError(validationErr); return }
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    setResolved(null)

    try {
      if (mode === 'formula') {
        const rows = await resolveFormula(input.trim())
        if (!rows.length) { setError('Could not parse formula — check your input.'); return }

        const breakdown: ElementRow[] = []
        let totalMW = 0
        for (const row of rows) {
          const el = elements.find(e => e.symbol === row.symbol)
          if (!el) { setError(`Unknown element symbol: ${row.symbol}`); return }
          const count  = parseFloat(row.moles)
          const weight = parseFloat(el.atomicWeight)
          const contribution = count * weight
          totalMW += contribution
          breakdown.push({ symbol: row.symbol, name: el.name, count, atomicWeight: weight, contribution })
        }

        const mwStr = totalMW.toFixed(4)
        const r: Resolved = { formula: input.trim(), mw: mwStr, name: '', breakdown }
        setResolved(r)
        onResolved(mwStr, input.trim(), '')
        setOpen(false)
      } else {
        const info = await resolveSmiles(input.trim())
        const r: Resolved = { formula: info.molecular_formula, mw: info.molecular_weight, name: info.iupac_name, breakdown: null }
        setResolved(r)
        onResolved(r.mw, r.formula, r.name)
        setOpen(false)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() { setInput(''); setResolved(null); setError(null); setInputError(null) }
  function handleModeChange(m: Mode) { setMode(m); setInput(''); setError(null); setInputError(null); setResolved(null) }

  const totalMW = resolved ? parseFloat(resolved.mw) : null

  return (
    <div>
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 font-sans text-sm font-medium transition-colors group"
        style={{ color: resolved ? 'var(--c-halogen)' : 'rgba(255,255,255,0.45)' }}
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="inline-block font-mono text-xs">▶</motion.span>
        {resolved ? `${resolved.formula} · ${totalMW!.toFixed(3)} g/mol` : 'Look up compound'}
        {resolved && (
          <span onClick={e => { e.stopPropagation(); handleClear() }}
            className="ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer">
            ✕
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-3 mt-2 ml-1 p-3 rounded-sm border"
              style={{
                borderColor: 'color-mix(in srgb, var(--c-halogen) 20%, #1c1f2e)',
                background: 'color-mix(in srgb, var(--c-halogen) 4%, #0e1016)',
              }}>

              {/* Mode tabs */}
              <div className="flex gap-0 rounded-sm overflow-hidden border border-border self-start">
                {(['formula', 'smiles'] as Mode[]).map(m => (
                  <button key={m} onClick={() => handleModeChange(m)}
                    className="px-3 py-1 font-mono text-[11px] transition-colors"
                    style={{
                      background: mode === m ? 'color-mix(in srgb, var(--c-halogen) 15%, #141620)' : '#141620',
                      color: mode === m ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
                      borderRight: m === 'formula' ? '1px solid #1c1f2e' : 'none',
                    }}>
                    {m === 'formula' ? 'Formula' : 'SMILES'}
                  </button>
                ))}
              </div>

              {/* Hint */}
              <p className="font-mono text-[10px] text-dim -mt-1">
                {mode === 'formula'
                  ? 'Molecular formula e.g. H2O, NaCl, C6H12O6, Ca(OH)2'
                  : 'SMILES string e.g. [Na+].[Cl-], O, CCO'}
              </p>

              {/* Input row */}
              <div className="flex gap-1.5">
                <div className="flex-1 flex flex-col gap-1">
                  <input type="text" value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !inputError && handleResolve()}
                    placeholder={mode === 'formula' ? 'e.g. H2O' : 'e.g. [Na+].[Cl-]'}
                    className="w-full font-mono text-sm bg-surface border rounded-sm px-3 py-2
                               text-primary placeholder-dim focus:outline-none transition-colors"
                    style={{ borderColor: inputError ? '#f87171' : '#1c1f2e' }}
                    autoFocus
                  />
                  {inputError && <p className="font-mono text-[10px] text-red-400">{inputError}</p>}
                </div>
                <button onClick={handleResolve} disabled={loading || !input.trim() || !!inputError}
                  className="px-4 font-sans text-sm font-medium rounded-sm border transition-colors disabled:opacity-40 shrink-0 self-start mt-0"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 14%, #0e1016)',
                    borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                    color: 'var(--c-halogen)',
                    paddingTop: '0.5rem', paddingBottom: '0.5rem',
                  }}>
                  {loading ? '…' : 'Look up'}
                </button>
              </div>

              {error && <p className="font-mono text-[10px] text-red-400">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakdown table — shown after formula lookup, even when collapsed */}
      <AnimatePresence>
        {resolved?.breakdown && !open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}
            className="mt-2">
            <div className="rounded-sm border overflow-hidden"
              style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 20%, #1c1f2e)' }}>
              <div className="grid grid-cols-4 px-3 py-1.5 font-mono text-[9px] text-dim tracking-wider"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #0e1016)' }}>
                <span>ELEMENT</span><span className="text-right">COUNT</span>
                <span className="text-right">At. Wt.</span><span className="text-right">CONTRIB.</span>
              </div>
              {resolved.breakdown.map((row, i) => (
                <motion.div key={row.symbol}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                  className="grid grid-cols-4 px-3 py-1.5 border-t font-mono text-xs"
                  style={{ borderColor: '#1c1f2e' }}>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--c-halogen)' }}>{row.symbol}</span>
                    <span className="text-dim text-[10px] hidden sm:inline">{row.name}</span>
                  </div>
                  <span className="text-right text-secondary">{row.count % 1 === 0 ? row.count : row.count.toFixed(3)}</span>
                  <span className="text-right text-secondary">{row.atomicWeight.toFixed(4)}</span>
                  <span className="text-right text-primary">{row.contribution.toFixed(4)}</span>
                </motion.div>
              ))}
              <div className="grid grid-cols-4 px-3 py-2 border-t font-mono text-xs"
                style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 25%, #1c1f2e)', background: 'color-mix(in srgb, var(--c-halogen) 6%, #0e1016)' }}>
                <span className="col-span-3 text-secondary font-medium">Molar Mass</span>
                <span className="text-right font-semibold" style={{ color: 'var(--c-halogen)' }}>{totalMW!.toFixed(4)}</span>
              </div>
              <div className="px-3 pb-1.5 font-mono text-[9px] text-right text-dim"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #0e1016)' }}>g / mol</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

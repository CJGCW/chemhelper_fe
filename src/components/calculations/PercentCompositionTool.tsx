import { useState, useEffect } from 'react'
import WorkedExample, { pick } from './WorkedExample'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveFormula, resolveSmiles } from '../../api/calculations'
import { useElementStore } from '../../stores/elementStore'

type Mode = 'formula' | 'smiles'

interface ElementRow {
  symbol: string
  name: string
  count: number
  atomicWeight: number
  contribution: number
  percent: number
}

const FORMULA_CHARS = /^[A-Za-z0-9()[\]]*$/
const FORMULA_RE    = /^[A-Z][A-Za-z0-9()[\]]*$/
const SMILES_CHARS  = /^[A-Za-z0-9()[\]@/\\=#+.\-:]+$/

function validateFormula(v: string): string | null {
  if (!v) return null
  if (!FORMULA_CHARS.test(v)) return 'Only letters, digits, and parentheses are allowed'
  if (!/[A-Z]/.test(v)) return 'Formula must contain at least one element symbol'
  if (!FORMULA_RE.test(v)) return 'Formula must start with a capital letter'
  return null
}

function validateSmiles(v: string): string | null {
  if (!v) return null
  if (!SMILES_CHARS.test(v)) return 'Invalid SMILES characters detected'
  return null
}

const PCT_EXAMPLES = [
  {
    name: 'H₂O', M: 18.015,
    scenario: 'Find the percent composition of water (H₂O, M = 18.015 g/mol).',
    steps: [
      '%H  = (2 × 1.008) / 18.015 × 100',
      '%H  = 2.016 / 18.015 × 100 = 11.19%',
      '%O  = 16.000 / 18.015 × 100',
      '%O  = 88.81%',
      'Check: 11.19 + 88.81 = 100% ✓',
    ],
    result: 'H: 11.19%   O: 88.81%',
  },
  {
    name: 'CO₂', M: 44.010,
    scenario: 'Find the percent composition of carbon dioxide (CO₂, M = 44.010 g/mol).',
    steps: [
      '%C  = 12.011 / 44.010 × 100',
      '%C  = 27.29%',
      '%O  = (2 × 15.999) / 44.010 × 100',
      '%O  = 31.998 / 44.010 × 100 = 72.71%',
      'Check: 27.29 + 72.71 = 100% ✓',
    ],
    result: 'C: 27.29%   O: 72.71%',
  },
  {
    name: 'NaCl', M: 58.443,
    scenario: 'Find the percent composition of sodium chloride (NaCl, M = 58.443 g/mol).',
    steps: [
      '%Na  = 22.990 / 58.443 × 100',
      '%Na  = 39.34%',
      '%Cl  = 35.453 / 58.443 × 100',
      '%Cl  = 60.66%',
    ],
    result: 'Na: 39.34%   Cl: 60.66%',
  },
  {
    name: 'H₂SO₄', M: 98.079,
    scenario: 'Find the percent composition of sulfuric acid (H₂SO₄, M = 98.079 g/mol).',
    steps: [
      '%H  = (2 × 1.008) / 98.079 × 100 = 2.06%',
      '%S  = 32.065 / 98.079 × 100 = 32.69%',
      '%O  = (4 × 15.999) / 98.079 × 100 = 65.25%',
      'Check: 2.06 + 32.69 + 65.25 = 100% ✓',
    ],
    result: 'H: 2.06%   S: 32.69%   O: 65.25%',
  },
  {
    name: 'CaCO₃', M: 100.089,
    scenario: 'Find the percent composition of calcium carbonate (CaCO₃, M = 100.089 g/mol).',
    steps: [
      '%Ca  = 40.078 / 100.089 × 100 = 40.04%',
      '%C   = 12.011 / 100.089 × 100 = 12.00%',
      '%O   = (3 × 15.999) / 100.089 × 100 = 47.96%',
      'Check: 40.04 + 12.00 + 47.96 = 100% ✓',
    ],
    result: 'Ca: 40.04%   C: 12.00%   O: 47.96%',
  },
  {
    name: 'Fe₂O₃', M: 159.688,
    scenario: 'Find the percent composition of iron(III) oxide (Fe₂O₃, M = 159.688 g/mol).',
    steps: [
      '%Fe  = (2 × 55.845) / 159.688 × 100',
      '%Fe  = 111.690 / 159.688 × 100 = 69.94%',
      '%O   = (3 × 15.999) / 159.688 × 100 = 30.06%',
    ],
    result: 'Fe: 69.94%   O: 30.06%',
  },
]

function generatePctExample() {
  return pick(PCT_EXAMPLES)
}

export default function PercentCompositionTool() {
  const [mode, setMode]       = useState<Mode>('formula')
  const [input, setInput]     = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [rows, setRows]       = useState<ElementRow[] | null>(null)
  const [totalMW, setTotalMW] = useState(0)
  const [displayFormula, setDisplayFormula] = useState('')

  const { elements, loadElements } = useElementStore()
  useEffect(() => { loadElements() }, [loadElements])

  function handleInputChange(v: string) {
    setInput(v)
    setError(null)
    setInputError(mode === 'formula' ? validateFormula(v) : validateSmiles(v))
  }

  function handleModeChange(m: Mode) {
    setMode(m); setInput(''); setError(null); setInputError(null); setRows(null)
  }

  async function buildRows(formula: string): Promise<ElementRow[] | null> {
    const apiRows = await resolveFormula(formula)
    if (!apiRows.length) { setError('Could not parse formula — check your input.'); return null }
    const result: ElementRow[] = []
    let mw = 0
    for (const row of apiRows) {
      const el = elements.find(e => e.symbol === row.symbol)
      if (!el) { setError(`Unknown element symbol: ${row.symbol}`); return null }
      const count = parseFloat(row.moles)
      const atomicWeight = parseFloat(el.atomicWeight)
      const contribution = count * atomicWeight
      mw += contribution
      result.push({ symbol: row.symbol, name: el.name, count, atomicWeight, contribution, percent: 0 })
    }
    // fill percents now that mw is known
    for (const row of result) row.percent = (row.contribution / mw) * 100
    setTotalMW(mw)
    return result
  }

  async function handleResolve() {
    const v = input.trim()
    const err = mode === 'formula' ? validateFormula(v) : validateSmiles(v)
    if (err) { setInputError(err); return }
    if (!v) return

    setLoading(true); setError(null); setRows(null)

    try {
      if (mode === 'formula') {
        setDisplayFormula(v)
        const r = await buildRows(v)
        if (r) setRows(r)
      } else {
        const info = await resolveSmiles(v)
        setDisplayFormula(info.molecular_formula)
        const r = await buildRows(info.molecular_formula)
        if (r) setRows(r)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Enter a compound formula to find the <span className="text-primary">mass percent</span> of each element.
        Mass percent = (element mass contribution / molar mass) × 100.
      </p>

      <WorkedExample generate={generatePctExample} />

      {/* Mode tabs */}
      <div className="flex gap-0 rounded-sm overflow-hidden border border-border self-start">
        {(['formula', 'smiles'] as Mode[]).map(m => (
          <button key={m} onClick={() => handleModeChange(m)}
            className="px-3 py-1.5 font-mono text-xs transition-colors"
            style={{
              background: mode === m ? 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))',
              color: mode === m ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
              borderRight: m === 'formula' ? '1px solid rgb(var(--color-border))' : 'none',
            }}>
            {m === 'formula' ? 'Formula' : 'SMILES'}
          </button>
        ))}
      </div>

      <p className="font-mono text-xs text-secondary -mt-4">
        {mode === 'formula'
          ? 'Molecular formula — e.g. H2O, NaCl, C6H12O6, Ca(OH)2'
          : 'SMILES string — e.g. [Na+].[Cl-], CCO'}
      </p>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <input type="text" value={input}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !inputError && handleResolve()}
            placeholder={mode === 'formula' ? 'e.g. H2O' : 'e.g. CCO'}
            className="w-full font-mono text-sm bg-raised border rounded-sm px-3 py-2
                       text-bright placeholder-dim focus:outline-none transition-colors"
            style={{ borderColor: inputError ? '#f87171' : 'rgb(var(--color-border))' }}
          />
          {inputError && <p className="font-mono text-[10px] text-red-400">{inputError}</p>}
        </div>
        <button onClick={handleResolve} disabled={loading || !input.trim() || !!inputError}
          className="shrink-0 px-5 font-sans text-sm font-medium rounded-sm border transition-colors
                     disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 14%, rgb(var(--color-surface)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
            paddingTop: '0.5rem', paddingBottom: '0.5rem',
          }}>
          {loading ? '…' : 'Calculate'}
        </button>
      </div>

      {error && <p className="font-mono text-[10px] text-red-400">{error}</p>}

      {/* Results */}
      <AnimatePresence>
        {rows && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold text-bright">{displayFormula}</span>
                <span className="font-mono text-xs text-dim">percent composition</span>
              </div>

              <div className="rounded-sm border border-border overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-5 px-3 py-2 font-mono text-xs text-secondary tracking-widest uppercase"
                  style={{ background: 'rgba(var(--overlay),0.03)' }}>
                  <span className="col-span-2">Element</span>
                  <span className="text-right">Count</span>
                  <span className="text-right">At. Wt.</span>
                  <span className="text-right">% Mass</span>
                </div>

                {rows.map((row, i) => (
                  <motion.div key={row.symbol}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 30 }}
                    className="grid grid-cols-5 px-3 py-2 border-t border-border font-mono text-xs">
                    <div className="col-span-2 flex items-center gap-2">
                      <span style={{ color: 'var(--c-halogen)' }}>{row.symbol}</span>
                      <span className="text-dim text-[10px] hidden sm:inline">{row.name}</span>
                    </div>
                    <span className="text-right text-secondary">
                      {row.count % 1 === 0 ? row.count : row.count.toFixed(3)}
                    </span>
                    <span className="text-right text-secondary">{row.atomicWeight.toFixed(4)}</span>
                    <span className="text-right font-semibold" style={{ color: 'var(--c-halogen)' }}>
                      {row.percent.toFixed(2)}%
                    </span>
                  </motion.div>
                ))}

                {/* Total */}
                <div className="grid grid-cols-5 px-3 py-2 border-t font-mono text-xs font-medium"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--c-halogen) 25%, rgb(var(--color-border)))',
                    background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))',
                  }}>
                  <span className="col-span-2 text-secondary">Molar Mass</span>
                  <span className="col-span-2 text-right text-secondary">{totalMW.toFixed(4)} g/mol</span>
                  <span className="text-right" style={{ color: 'var(--c-halogen)' }}>100.00%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="font-mono text-xs text-secondary">% = (element contribution / M) × 100 · all element percents sum to 100%</p>
    </div>
  )
}

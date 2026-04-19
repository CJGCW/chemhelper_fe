import { useState, useRef, useCallback } from 'react'
import ExampleBox from '../calculations/ExampleBox'
import { motion, AnimatePresence } from 'framer-motion'
import { searchCompounds, type CompoundEntry } from '../../utils/enthalpyData'
import { computeDHrxn } from '../../utils/enthalpyPractice'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Row {
  id:      string
  coeff:   string
  formula: string
  state:   string
  dhf:     string
}

let _id = 0
function newRow(): Row {
  return { id: String(++_id), coeff: '1', formula: '', state: 'g', dhf: '' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const STATES = ['g', 'l', 's', 'aq']

interface RowProps {
  row:        Row
  side:       'reactant' | 'product'
  canDelete:  boolean
  onChange:   (id: string, field: keyof Row, value: string) => void
  onDelete:   (id: string) => void
  onPickSuggestion: (id: string, entry: CompoundEntry) => void
}

function SpeciesRow({ row, canDelete, onChange, onDelete, onPickSuggestion }: RowProps) {
  const [showSugg, setShowSugg] = useState(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestions = showSugg ? searchCompounds(row.formula, 7) : []

  function handleFormulaFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setShowSugg(true)
  }
  function handleFormulaBlur() {
    blurTimer.current = setTimeout(() => setShowSugg(false), 150)
  }
  function handlePickSuggestion(entry: CompoundEntry) {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setShowSugg(false)
    onPickSuggestion(row.id, entry)
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Coefficient */}
      <input
        type="number"
        value={row.coeff}
        onChange={e => onChange(row.id, 'coeff', e.target.value)}
        className="w-14 bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-sm text-bright
                   text-center focus:outline-none focus:border-muted [appearance:textfield]
                   [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="1"
        placeholder="1"
      />

      {/* Formula input + suggestions */}
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          value={row.formula}
          onChange={e => onChange(row.id, 'formula', e.target.value)}
          onFocus={handleFormulaFocus}
          onBlur={handleFormulaBlur}
          placeholder="formula or name"
          className="w-full bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-bright
                     placeholder:text-dim/50 focus:outline-none focus:border-muted"
        />
        {showSugg && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-0.5 z-20 rounded-sm border border-border overflow-hidden"
            style={{ background: 'rgb(var(--color-surface))' }}
          >
            {suggestions.map((entry, i) => (
              <button
                key={i}
                onMouseDown={() => handlePickSuggestion(entry)}
                className="w-full flex items-baseline gap-3 px-3 py-1.5 text-left hover:bg-raised transition-colors"
              >
                <span className="font-mono text-xs font-semibold text-bright shrink-0">
                  {entry.formula}({entry.state})
                </span>
                <span className="font-mono text-[10px] text-secondary truncate">{entry.name}</span>
                <span className="font-mono text-[10px] ml-auto shrink-0" style={{ color: 'var(--c-halogen)' }}>
                  {entry.dhf === 0 ? '0' : entry.dhf} kJ/mol
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* State */}
      <select
        value={row.state}
        onChange={e => onChange(row.id, 'state', e.target.value)}
        className="w-16 bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-sm text-primary
                   focus:outline-none focus:border-muted cursor-pointer"
      >
        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* ΔHf° */}
      <div className="relative flex items-center">
        <input
          type="number"
          value={row.dhf}
          onChange={e => onChange(row.id, 'dhf', e.target.value)}
          placeholder="ΔHf°"
          className="w-28 bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-bright
                     placeholder:text-dim/50 focus:outline-none focus:border-muted [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-2 font-mono text-xs text-secondary pointer-events-none">kJ/mol</span>
      </div>

      {/* Delete */}
      {canDelete && (
        <button
          onClick={() => onDelete(row.id)}
          className="font-mono text-xs text-dim hover:text-red-400 transition-colors px-1 shrink-0"
        >
          ×
        </button>
      )}
    </div>
  )
}

// ── Result display ─────────────────────────────────────────────────────────────

interface Result {
  dhrxn: number
  steps: string[]
  sumP:  number
  sumR:  number
}

function ResultPanel({ result }: { result: Result }) {
  const [showSteps, setShowSteps] = useState(false)
  const sign = result.dhrxn < 0 ? 'exothermic' : result.dhrxn > 0 ? 'endothermic' : 'thermoneutral'
  const color = result.dhrxn < 0 ? '#34d399' : result.dhrxn > 0 ? '#f87171' : 'rgba(var(--overlay),0.6)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-sm border border-border bg-surface p-5"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xl font-bold" style={{ color }}>
          ΔHrxn = {result.dhrxn > 0 ? '+' : ''}{result.dhrxn} kJ
        </span>
        <span className="font-mono text-xs text-dim">{sign}</span>
      </div>

      <button
        onClick={() => setShowSteps(v => !v)}
        className="flex items-center gap-1.5 font-mono text-xs text-secondary hover:text-primary transition-colors self-start"
      >
        <motion.span animate={{ rotate: showSteps ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="text-[10px]">▶</motion.span>
        Solution steps
      </button>

      <AnimatePresence initial={false}>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
              {result.steps.map((s, i) => (
                <p key={i} className={`font-mono text-sm ${
                  i === result.steps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'
                }`}>
                  {i === result.steps.length - 1 ? '∴ ' : ''}{s}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EnthalpyCalc() {
  const [reactants, setReactants] = useState<Row[]>([newRow(), newRow()])
  const [products,  setProducts]  = useState<Row[]>([newRow(), newRow()])
  const [result,    setResult]    = useState<Result | null>(null)
  const [error,     setError]     = useState<string | null>(null)

  const updateRow = useCallback((
    setter: React.Dispatch<React.SetStateAction<Row[]>>,
    id: string, field: keyof Row, value: string
  ) => {
    setter(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    setResult(null)
    setError(null)
  }, [])

  const deleteRow = useCallback((
    setter: React.Dispatch<React.SetStateAction<Row[]>>,
    id: string
  ) => {
    setter(prev => prev.filter(r => r.id !== id))
    setResult(null)
  }, [])

  const pickSuggestion = useCallback((
    setter: React.Dispatch<React.SetStateAction<Row[]>>,
    id: string, entry: CompoundEntry
  ) => {
    setter(prev => prev.map(r =>
      r.id === id ? { ...r, formula: entry.formula, state: entry.state, dhf: String(entry.dhf) } : r
    ))
    setResult(null)
  }, [])

  function calculate() {
    setError(null)
    setResult(null)

    const parseRows = (rows: Row[]) => rows.map(r => {
      const c = parseFloat(r.coeff)
      const d = parseFloat(r.dhf)
      return { coeff: isNaN(c) ? 1 : c, formula: r.formula.trim(), dhf: d }
    }).filter(r => r.formula !== '')

    const rParsed = parseRows(reactants)
    const pParsed = parseRows(products)

    if (rParsed.length === 0 || pParsed.length === 0) {
      setError('Add at least one reactant and one product.')
      return
    }
    if (rParsed.some(r => isNaN(r.dhf)) || pParsed.some(r => isNaN(r.dhf))) {
      setError('Enter ΔHf° values for all species (use 0 for elements in standard state).')
      return
    }

    const dhrxn = computeDHrxn(rParsed, pParsed)
    const sumP = parseFloat(pParsed.reduce((s, x) => s + x.coeff * x.dhf, 0).toFixed(2))
    const sumR = parseFloat(rParsed.reduce((s, x) => s + x.coeff * x.dhf, 0).toFixed(2))

    const fmtTerm = (arr: typeof rParsed) =>
      arr.map(s => {
        const c = s.coeff === 1 ? '' : `${s.coeff}×`
        return `${c}(${s.dhf})`
      }).join(' + ')

    const steps = [
      'ΔHrxn = ΣΔHf°(products) − ΣΔHf°(reactants)',
      `ΔHrxn = [${fmtTerm(pParsed)}] − [${fmtTerm(rParsed)}]`,
      `ΔHrxn = (${sumP}) − (${sumR})`,
      `ΔHrxn = ${dhrxn > 0 ? '+' : ''}${dhrxn} kJ`,
    ]

    setResult({ dhrxn, steps, sumP, sumR })
  }

  function reset() {
    setReactants([newRow(), newRow()])
    setProducts([newRow(), newRow()])
    setResult(null)
    setError(null)
  }

  const labelStyle = "font-mono text-xs text-secondary tracking-widest uppercase"

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      <ExampleBox>{`CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)
  ΔHf°: CH₄ = −74.8,  O₂ = 0,  CO₂ = −393.5,  H₂O(l) = −285.8  kJ/mol
  ΔHrxn = [1(−393.5) + 2(−285.8)] − [1(−74.8) + 2(0)]
         = −965.1 − (−74.8) = −890.3 kJ  (exothermic)`}</ExampleBox>

      {/* Column headers */}
      <div className="hidden sm:grid grid-cols-[3.5rem_1fr_4rem_7rem_1.5rem] gap-2 px-0">
        <span className={labelStyle}>coeff</span>
        <span className={labelStyle}>formula / name</span>
        <span className={labelStyle}>state</span>
        <span className={labelStyle}>ΔHf° (kJ/mol)</span>
      </div>

      {/* Reactants */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary">Reactants</span>
        <div className="flex flex-col gap-2">
          {reactants.map(row => (
            <SpeciesRow
              key={row.id} row={row} side="reactant"
              canDelete={reactants.length > 1}
              onChange={(id, f, v) => updateRow(setReactants, id, f, v)}
              onDelete={id => deleteRow(setReactants, id)}
              onPickSuggestion={(id, e) => pickSuggestion(setReactants, id, e)}
            />
          ))}
        </div>
        <button
          onClick={() => { setReactants(p => [...p, newRow()]); setResult(null) }}
          className="self-start font-mono text-xs text-dim hover:text-primary transition-colors"
        >
          + add reactant
        </button>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-lg text-dim">→</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Products */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs text-secondary">Products</span>
        <div className="flex flex-col gap-2">
          {products.map(row => (
            <SpeciesRow
              key={row.id} row={row} side="product"
              canDelete={products.length > 1}
              onChange={(id, f, v) => updateRow(setProducts, id, f, v)}
              onDelete={id => deleteRow(setProducts, id)}
              onPickSuggestion={(id, e) => pickSuggestion(setProducts, id, e)}
            />
          ))}
        </div>
        <button
          onClick={() => { setProducts(p => [...p, newRow()]); setResult(null) }}
          className="self-start font-mono text-xs text-dim hover:text-primary transition-colors"
        >
          + add product
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="font-mono text-xs text-red-400">{error}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={calculate}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Calculate ΔHrxn
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-muted))', color: 'rgba(var(--overlay),0.45)' }}
        >
          Reset
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && <ResultPanel result={result} />}
      </AnimatePresence>

      {/* Hint */}
      <p className="font-mono text-xs text-secondary">
        Tip: type a formula or name in the compound field to look up ΔHf° values. Elements in standard state have ΔHf° = 0.
      </p>
    </div>
  )
}

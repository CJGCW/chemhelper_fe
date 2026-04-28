import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../../stores/elementStore'
import {
  buildMolarMasses,
  solveEmpiricalFormula,
  formulasMatch,
  type SolverResult,
} from '../../utils/empiricalFormula'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { generateEmpiricalExample } from './EmpiricalPractice'
import { combustionAnalysis, type CombustionSolution } from '../../chem/empirical'
import { generateCombustionExample } from '../../utils/combustionAnalysisPractice'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Row { id: number; symbol: string; value: string }

let _nextId = 0
function newRow(symbol = '', value = ''): Row {
  return { id: _nextId++, symbol, value }
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function fmt(n: number, dp = 4): string {
  return parseFloat(n.toPrecision(dp)).toString()
}

function pct(n: number): string {
  return (n * 100).toFixed(2) + '%'
}

function unicodeFormulaToASCII(f: string): string {
  return f.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)])
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepTable({ result, mode }: { result: SolverResult; mode: 'percent' | 'mass' }) {
  const colLabel = mode === 'percent' ? 'Input (g in 100 g)' : 'Mass (g)'
  return (
    <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
      <table className="w-full border-collapse text-xs font-mono min-w-max">
        <thead>
          <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
            {['Element', 'M (g/mol)', colLabel, 'Moles', '÷ min', result.multiplier > 1 ? `× ${result.multiplier}` : null, 'Subscript']
              .filter(Boolean)
              .map(h => (
                <th key={h} className="px-3 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border whitespace-nowrap">
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((r, i) => (
            <motion.tr key={r.symbol}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.15 }}
              className="border-b border-border last:border-0"
            >
              <td className="px-3 py-2 font-semibold" style={{ color: 'var(--c-halogen)' }}>{r.symbol}</td>
              <td className="px-3 py-2 text-secondary">{fmt(r.molarMass, 6)}</td>
              <td className="px-3 py-2 text-primary">{fmt(r.inputValue, 5)}</td>
              <td className="px-3 py-2 text-primary">{fmt(r.moles, 4)}</td>
              <td className="px-3 py-2 text-secondary">{fmt(r.ratio, 4)}</td>
              {result.multiplier > 1 && (
                <td className="px-3 py-2 text-secondary">{fmt(r.ratio * result.multiplier, 4)}</td>
              )}
              <td className="px-3 py-2 font-bold text-sm" style={{ color: '#4ade80' }}>{r.subscript}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FormulaDisplay({ label, formula, sub }: { label: string; formula: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-1 px-6 py-4 rounded-sm border"
      style={{ background: 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-base)))', borderColor: 'color-mix(in srgb, #4ade80 25%, transparent)' }}
    >
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</span>
      <span className="font-mono text-2xl font-bold" style={{ color: '#4ade80' }}>{formula}</span>
      {sub && <span className="font-sans text-[10px] text-secondary">{sub}</span>}
    </motion.div>
  )
}

// ── Percent remaining indicator ───────────────────────────────────────────────

function PctRemaining({ rows }: { rows: Row[] }) {
  const total = rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0)
  if (total === 0) return null
  const remaining = 100 - total
  const over = remaining < -0.5
  const balanced = Math.abs(remaining) <= 0.5
  const color = over ? '#f87171' : balanced ? '#4ade80' : '#fb923c'
  return (
    <span className="font-mono text-[10px]" style={{ color }}>
      {balanced ? '✓ 100%' : over ? `${fmt(total, 5)}% (over by ${fmt(-remaining, 3)}%)` : `${fmt(remaining, 3)}% remaining`}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EmpiricalTool() {
  const elements = useElementStore(s => s.elements)
  const molarMasses = useMemo(() => buildMolarMasses(elements), [elements])

  // Top-level mode: percent-composition vs combustion analysis
  const [toolMode, setToolMode] = useState<'percent-composition' | 'combustion'>('percent-composition')

  const [noSteps] = useState<string[]>([])
  const pctStepsState = useStepsPanelState(noSteps, generateEmpiricalExample)
  const combStepsState = useStepsPanelState(noSteps, generateCombustionExample)

  // Percent-composition state
  const [rows, setRows] = useState<Row[]>([newRow(), newRow(), newRow()])
  const [mode, setMode] = useState<'percent' | 'mass'>('percent')
  const [molecularMass, setMolecularMass] = useState('')
  const [answerFormula, setAnswerFormula] = useState('')

  // Combustion state
  const [massSampleStr, setMassSampleStr] = useState('')
  const [massCO2Str, setMassCO2Str] = useState('')
  const [massH2OStr, setMassH2OStr] = useState('')
  const [molarMassCombStr, setMolarMassCombStr] = useState('')
  const [answerCombFormula, setAnswerCombFormula] = useState('')

  // ── Percent-composition logic ─────────────────────────────────────────────

  function updateRow(id: number, field: 'symbol' | 'value', val: string) {
    setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: val } : r))
  }

  function addRow() { setRows(rs => [...rs, newRow()]) }

  function removeRow(id: number) {
    setRows(rs => rs.length > 2 ? rs.filter(r => r.id !== id) : rs)
  }

  const inputs = rows
    .filter(r => r.symbol.trim() && r.value.trim())
    .map(r => ({ symbol: r.symbol.trim(), value: parseFloat(r.value) }))

  const result = useMemo(() => {
    if (inputs.length < 2) return null
    return solveEmpiricalFormula(inputs, molarMasses, parseFloat(molecularMass) || undefined)
  }, [inputs, molarMasses, molecularMass])

  const formulaVerify = useMemo<'none' | 'correct' | 'incorrect'>(() => {
    if (!answerFormula.trim() || !result) return 'none'
    const empASCII = result.rows.map(r => r.subscript === 1 ? r.symbol : `${r.symbol}${r.subscript}`).join('')
    return formulasMatch(answerFormula.trim(), empASCII) ? 'correct' : 'incorrect'
  }, [answerFormula, result])

  const hasUnknown = inputs.some(i => !molarMasses[i.symbol])
  const unknownSymbols = inputs.filter(i => !molarMasses[i.symbol]).map(i => i.symbol)

  // ── Combustion logic ──────────────────────────────────────────────────────

  const [combSolution, combError] = useMemo<[CombustionSolution | null, string | null]>(() => {
    const ms = parseFloat(massSampleStr)
    const mco2 = parseFloat(massCO2Str)
    const mh2o = parseFloat(massH2OStr)
    const mm = parseFloat(molarMassCombStr)
    if (!isFinite(ms) || !isFinite(mco2) || !isFinite(mh2o)) return [null, null]
    if (ms <= 0 || mco2 <= 0 || mh2o <= 0) return [null, null]
    try {
      return [combustionAnalysis({
        massSample: ms,
        massCO2: mco2,
        massH2O: mh2o,
        molarMass: isFinite(mm) && mm > 0 ? mm : undefined,
      }), null]
    } catch (e) {
      return [null, (e as Error).message]
    }
  }, [massSampleStr, massCO2Str, massH2OStr, molarMassCombStr])

  const combFormulaVerify = useMemo<'none' | 'correct' | 'incorrect'>(() => {
    if (!answerCombFormula.trim() || !combSolution) return 'none'
    const empASCII = unicodeFormulaToASCII(combSolution.empiricalFormula)
    return formulasMatch(answerCombFormula.trim(), empASCII) ? 'correct' : 'incorrect'
  }, [answerCombFormula, combSolution])

  // ── Shared input style ────────────────────────────────────────────────────

  const inputCls = 'font-mono text-sm bg-raised border border-border rounded-sm px-3 py-1.5 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors'

  return (
    <div className="flex flex-col gap-5">

      {/* Tool mode toggle */}
      <div className="flex items-center gap-3">
        <span className="font-sans text-xs text-secondary">Mode</span>
        <div className="flex items-center gap-1 p-1 rounded-sm"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          {(['percent-composition', 'combustion'] as const).map(tm => (
            <button key={tm}
              onClick={() => setToolMode(tm)}
              className="relative px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
              style={{ color: toolMode === tm ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
            >
              {toolMode === tm && (
                <motion.div layoutId="tool-mode-bg" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{tm === 'percent-composition' ? '% / mass' : 'combustion'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Example button — mode-specific */}
      <div className="flex items-stretch gap-2">
        {toolMode === 'percent-composition'
          ? <StepsTrigger {...pctStepsState} />
          : <StepsTrigger {...combStepsState} />}
      </div>
      {toolMode === 'percent-composition'
        ? <StepsContent {...pctStepsState} />
        : <StepsContent {...combStepsState} />}

      <AnimatePresence mode="wait" initial={false}>
        {toolMode === 'percent-composition' ? (

          // ── Percent / mass mode ─────────────────────────────────────────
          <motion.div key="pct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="flex flex-col gap-5">

            {/* Input mode toggle */}
            <div className="flex items-center gap-3">
              <span className="font-sans text-xs text-secondary">Input as</span>
              <div className="flex items-center gap-1 p-1 rounded-sm"
                style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
                {(['percent', 'mass'] as const).map(m => (
                  <button key={m}
                    onClick={() => setMode(m)}
                    className="relative px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
                    style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
                  >
                    {mode === m && (
                      <motion.div layoutId="solver-mode-bg" className="absolute inset-0 rounded-sm"
                        style={{
                          background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                          border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                    )}
                    <span className="relative z-10">{m === 'percent' ? '% composition' : 'mass (g)'}</span>
                  </button>
                ))}
              </div>
              {mode === 'percent' && <PctRemaining rows={rows} />}
            </div>

            {/* Element rows */}
            <div className="flex flex-col gap-2">
              <div className="grid gap-1" style={{ gridTemplateColumns: '80px 1fr 28px' }}>
                <span className="font-mono text-xs text-secondary uppercase px-1">Symbol</span>
                <span className="font-mono text-xs text-secondary uppercase px-1">
                  {mode === 'percent' ? '% by mass' : 'Mass (g)'}
                </span>
                <span />
              </div>

              <AnimatePresence initial={false}>
                {rows.map(row => (
                  <motion.div key={row.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid gap-2 items-center"
                    style={{ gridTemplateColumns: '80px 1fr 28px' }}
                  >
                    <input
                      type="text"
                      value={row.symbol}
                      onChange={e => updateRow(row.id, 'symbol', e.target.value)}
                      placeholder="e.g. C"
                      className="font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.value}
                      onChange={e => updateRow(row.id, 'value', e.target.value)}
                      placeholder={mode === 'percent' ? 'e.g. 40.00' : 'e.g. 12.0'}
                      className="font-mono text-sm bg-raised border border-border rounded-sm px-2 py-1.5 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
                    />
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-dim hover:text-primary transition-colors text-lg leading-none"
                      title="Remove"
                    >×</button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={addRow}
                className="self-start font-mono text-[11px] px-3 py-1 rounded-sm border transition-colors mt-1"
                style={{ borderColor: 'rgba(var(--overlay),0.12)', color: 'rgba(var(--overlay),0.4)' }}
              >
                + add element
              </button>
            </div>

            {/* Molecular mass */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary uppercase">Molar mass (g/mol) — optional, for molecular formula</label>
                <input
                  type="text" inputMode="decimal"
                  value={molecularMass}
                  onChange={e => setMolecularMass(e.target.value)}
                  placeholder="e.g. 180.16"
                  className={`${inputCls} w-48`}
                />
              </div>
            </div>

            {/* Error */}
            {hasUnknown && unknownSymbols.length > 0 && (
              <p className="font-sans text-xs" style={{ color: '#f87171' }}>
                Unknown element{unknownSymbols.length > 1 ? 's' : ''}: {unknownSymbols.join(', ')}
              </p>
            )}

            {/* Steps + result */}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key={JSON.stringify(inputs) + molecularMass}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-sans text-xs text-dim">
                      <span className="text-secondary font-medium">Step 1 — </span>
                      {mode === 'percent'
                        ? 'Assume a 100 g sample, so percent = grams.'
                        : 'Use given masses directly.'}
                    </p>
                    <p className="font-sans text-xs text-dim">
                      <span className="text-secondary font-medium">Step 2 — </span>
                      Divide each mass by molar mass to get moles.
                    </p>
                    <p className="font-sans text-xs text-dim">
                      <span className="text-secondary font-medium">Step 3 — </span>
                      Divide all mole values by the smallest.
                      {result.multiplier > 1 && (
                        <> Ratios aren't whole numbers — multiply by <span className="font-mono text-primary">{result.multiplier}</span>.</>
                      )}
                    </p>
                  </div>

                  <StepTable result={result} mode={mode} />

                  <p className="font-sans text-xs text-secondary">
                    Empirical formula molar mass:{' '}
                    <span className="font-mono text-primary">{fmt(result.empiricalMolarMass, 5)} g/mol</span>
                    {' '}({result.rows.map(r => `${r.subscript > 1 ? r.subscript : ''}${r.symbol}(${fmt(r.subscript * r.molarMass, 4)})`).join(' + ')})
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <FormulaDisplay label="Empirical Formula" formula={result.empiricalFormula} />
                    {result.molecularFormula && result.molecularMultiplier && (
                      <FormulaDisplay
                        label="Molecular Formula"
                        formula={result.molecularFormula}
                        sub={`n = ${fmt(result.empiricalMolarMass, 5)} × ${result.molecularMultiplier} = ${fmt(result.empiricalMolarMass * result.molecularMultiplier, 5)} g/mol`}
                      />
                    )}
                  </div>
                  {result.molecularMassWarning && (
                    <p className="font-mono text-xs text-amber-400 border border-amber-700/40 bg-amber-950/20 rounded-sm px-3 py-2">
                      ⚠ {result.molecularMassWarning}
                    </p>
                  )}

                  <div className="flex flex-col gap-1 border-t border-border pt-3">
                    <p className="font-sans text-xs text-secondary uppercase tracking-widest">Percent Composition Check</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {result.rows.map(r => (
                        <span key={r.symbol} className="font-mono text-xs text-secondary">
                          {r.symbol}:{' '}
                          <span className="text-primary">{pct((r.subscript * r.molarMass) / result.empiricalMolarMass)}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                    <label className="font-mono text-xs text-secondary">Your empirical formula — optional, enter to check</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={answerFormula}
                        onChange={e => setAnswerFormula(e.target.value)}
                        placeholder="e.g. CH2O"
                        className={`${inputCls} w-32`}
                      />
                      {formulaVerify !== 'none' && (
                        <span className="font-mono text-sm font-medium"
                          style={{ color: formulaVerify === 'correct' ? '#4ade80' : '#f87171' }}>
                          {formulaVerify === 'correct' ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : inputs.length >= 2 && !hasUnknown ? (
                <motion.p key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-sans text-xs text-dim">
                  Enter valid values for all elements above.
                </motion.p>
              ) : inputs.length < 2 ? (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-sans text-xs text-dim">
                  Enter at least two elements with their{mode === 'percent' ? ' percent composition' : ' masses'} to solve.
                </motion.p>
              ) : null}
            </AnimatePresence>
            <p className="font-mono text-xs text-secondary">% → g (assume 100 g) → mol (÷ M) → divide by smallest → multiply to whole numbers</p>
          </motion.div>

        ) : (

          // ── Combustion analysis mode ────────────────────────────────────
          <motion.div key="comb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="flex flex-col gap-5">

            <p className="font-sans text-xs text-dim">
              Enter the masses from a combustion analysis experiment. Carbon comes from CO₂, hydrogen from H₂O, and oxygen (if present) by difference.
            </p>

            {/* Inputs */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary uppercase">Mass of sample (g)</label>
                <input
                  type="text" inputMode="decimal"
                  value={massSampleStr}
                  onChange={e => setMassSampleStr(e.target.value)}
                  placeholder="e.g. 11.5"
                  className={`${inputCls} w-48`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary uppercase">Mass of CO₂ produced (g)</label>
                <input
                  type="text" inputMode="decimal"
                  value={massCO2Str}
                  onChange={e => setMassCO2Str(e.target.value)}
                  placeholder="e.g. 22.0"
                  className={`${inputCls} w-48`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary uppercase">Mass of H₂O produced (g)</label>
                <input
                  type="text" inputMode="decimal"
                  value={massH2OStr}
                  onChange={e => setMassH2OStr(e.target.value)}
                  placeholder="e.g. 13.5"
                  className={`${inputCls} w-48`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary uppercase">Molar mass (g/mol) — optional, for molecular formula</label>
                <input
                  type="text" inputMode="decimal"
                  value={molarMassCombStr}
                  onChange={e => setMolarMassCombStr(e.target.value)}
                  placeholder="e.g. 46.07"
                  className={`${inputCls} w-48`}
                />
              </div>
            </div>

            {/* Error */}
            {combError && (
              <p className="font-mono text-xs border rounded-sm px-3 py-2"
                style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.05)' }}>
                ⚠ {combError}
              </p>
            )}

            {/* Result */}
            <AnimatePresence mode="wait">
              {combSolution ? (
                <motion.div key={massSampleStr + massCO2Str + massH2OStr + molarMassCombStr}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-5"
                >
                  {/* Step list */}
                  <div className="flex flex-col gap-1.5 rounded-sm border border-border px-4 py-3"
                    style={{ background: 'rgb(var(--color-base))' }}>
                    <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1">Steps</p>
                    {combSolution.steps.map((step, i) => (
                      <p key={i} className="font-mono text-xs text-primary leading-relaxed">{step}</p>
                    ))}
                  </div>

                  {/* Formula boxes */}
                  <div className="flex flex-wrap gap-4">
                    <FormulaDisplay label="Empirical Formula" formula={combSolution.empiricalFormula} />
                    {combSolution.molecularFormula && (
                      <FormulaDisplay label="Molecular Formula" formula={combSolution.molecularFormula} />
                    )}
                  </div>

                  {/* Verify */}
                  <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                    <label className="font-mono text-xs text-secondary">
                      Your {combSolution.molecularFormula ? 'molecular' : 'empirical'} formula — optional, enter to check
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={answerCombFormula}
                        onChange={e => setAnswerCombFormula(e.target.value)}
                        placeholder="e.g. C2H6O"
                        className={`${inputCls} w-32`}
                      />
                      {combFormulaVerify !== 'none' && (
                        <span className="font-mono text-sm font-medium"
                          style={{ color: combFormulaVerify === 'correct' ? '#4ade80' : '#f87171' }}>
                          {combFormulaVerify === 'correct' ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : !combError ? (
                <motion.p key="comb-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-sans text-xs text-dim">
                  Enter the sample mass and combustion product masses above to determine the formula.
                </motion.p>
              ) : null}
            </AnimatePresence>

            <p className="font-mono text-xs text-secondary">
              C from CO₂ × (12.01/44.01) · H from H₂O × (2.016/18.02) · O by difference → mol ratios → empirical formula
            </p>
          </motion.div>

        )}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { pick } from '../shared/WorkedExample'
import StepsPanel from '../shared/StepsPanel'
import ResultDisplay from '../shared/ResultDisplay'
import NumberField from '../shared/NumberField'
import { motion, AnimatePresence } from 'framer-motion'
import { hasValue } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepRow {
  id:         string
  equation:   string
  dh:         string
  multiplier: string
  flipped:    boolean
}

let _id = 0
function newRow(): StepRow {
  return { id: String(++_id), equation: '', dh: '', multiplier: '1', flipped: false }
}

// ── Example generator ─────────────────────────────────────────────────────────

const HESS_EXAMPLES = [
  {
    scenario: 'Find ΔH for C(s) + O₂(g) → CO₂(g) using two steps.',
    steps: [
      'Step 1: C(s) + ½O₂(g) → CO(g)   ΔH₁ = −110.5 kJ',
      'Step 2: CO(g) + ½O₂(g) → CO₂(g)  ΔH₂ = −283.0 kJ  (×1, not flipped)',
      'ΔHrxn = −110.5 + (−283.0)',
    ],
    result: 'ΔHrxn = −393.5 kJ',
  },
  {
    scenario: 'Find ΔH for N₂(g) + 2O₂(g) → 2NO₂(g) using two steps.',
    steps: [
      'Step 1: N₂(g) + O₂(g) → 2NO(g)   ΔH₁ = +180.5 kJ',
      'Step 2: 2NO(g) + O₂(g) → 2NO₂(g)  ΔH₂ = −113.0 kJ',
      'ΔHrxn = +180.5 + (−113.0)',
    ],
    result: 'ΔHrxn = +67.5 kJ (endothermic)',
  },
  {
    scenario: 'Find ΔH for 2C(s) + H₂(g) → C₂H₂(g) using three steps.',
    steps: [
      'Step 1: C₂H₂(g) + 5/2 O₂(g) → 2CO₂(g) + H₂O(l)  ΔH₁ = −1299.5 kJ  (flip → +1299.5)',
      'Step 2: C(s) + O₂(g) → CO₂(g)  ΔH₂ = −393.5 kJ  (×2 → −787.0)',
      'Step 3: H₂(g) + ½O₂(g) → H₂O(l)  ΔH₃ = −285.8 kJ',
      'ΔHrxn = +1299.5 + (−787.0) + (−285.8)',
    ],
    result: 'ΔHrxn = +226.7 kJ',
  },
]

const HESS_EMPTY: string[] = []

function generateHessExample() {
  return pick(HESS_EXAMPLES)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDH(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(1)
}

function parseRow(r: StepRow): { dh: number; mult: number; contribution: number } | null {
  const dh   = parseFloat(r.dh)
  const mult = parseFloat(r.multiplier)
  if (isNaN(dh) || isNaN(mult) || mult === 0) return null
  return { dh, mult, contribution: parseFloat((mult * (r.flipped ? -dh : dh)).toFixed(2)) }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HessTool() {
  const [rows, setRows] = useState<StepRow[]>([newRow(), newRow(), newRow()])
  const [target, setTarget] = useState('')
  const [answerVal, setAnswerVal] = useState('')

  function updateRow(id: string, field: keyof StepRow, value: string | boolean) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  function deleteRow(id: string) {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  // Live computation
  const parsed = rows.map(parseRow)
  const allValid = parsed.every(p => p !== null)
  const anyFilled = rows.some(r => r.dh.trim() !== '')
  const total = allValid && anyFilled
    ? parseFloat(parsed.reduce((s, p) => s + (p?.contribution ?? 0), 0).toFixed(2))
    : null

  const verified: VerifyState = total !== null && hasValue(answerVal)
    ? (Math.abs(total - parseFloat(answerVal)) / Math.abs(total) <= 0.01 ? 'correct' : 'incorrect')
    : null

  const labelCls = "font-mono text-xs text-secondary tracking-widest uppercase"

  return (
    <div className="flex flex-col gap-6 max-w-3xl">

      <StepsPanel steps={HESS_EMPTY} generate={generateHessExample} />

      {/* Target reaction (optional) */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Target reaction (optional — for reference)</span>
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="e.g. 2C(s) + O₂(g) → 2CO(g)"
          className="w-full bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-bright
                     placeholder:text-dim/50 focus:outline-none focus:border-muted"
        />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_1fr_6.5rem_5.5rem_1.5rem] gap-2 items-center">
        <span />
        <span className={labelCls}>equation</span>
        <span className={labelCls}>ΔH (kJ)</span>
        <span className={labelCls}>× mult.</span>
        <span />
      </div>

      {/* Step rows */}
      <div className="flex flex-col gap-3">
        {rows.map((row, idx) => {
          const p = parseRow(row)
          return (
            <div key={row.id} className="flex flex-col gap-1">
              <div className="grid grid-cols-[1.5rem_1fr_6.5rem_5.5rem_1.5rem] gap-2 items-center">

                {/* Flip toggle */}
                <button
                  onClick={() => updateRow(row.id, 'flipped', !row.flipped)}
                  className="w-6 h-6 rounded-sm border flex items-center justify-center transition-colors text-[10px] font-mono"
                  style={row.flipped
                    ? { background: 'color-mix(in srgb, var(--c-halogen) 20%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 50%, transparent)', color: 'var(--c-halogen)' }
                    : { border: '1px solid rgba(var(--overlay),0.15)', background: 'transparent', color: 'rgba(var(--overlay),0.3)' }
                  }
                  title="Flip (reverse) this reaction"
                >
                  ⇄
                </button>

                {/* Equation */}
                <input
                  type="text"
                  value={row.equation}
                  onChange={e => updateRow(row.id, 'equation', e.target.value)}
                  placeholder={`step ${idx + 1} equation`}
                  className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-bright
                             placeholder:text-dim/40 focus:outline-none focus:border-muted"
                />

                {/* ΔH */}
                <input
                  type="number"
                  value={row.dh}
                  onChange={e => updateRow(row.id, 'dh', e.target.value)}
                  placeholder="kJ"
                  className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-bright
                             placeholder:text-dim/40 focus:outline-none focus:border-muted [appearance:textfield]
                             [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                {/* Multiplier */}
                <input
                  type="number"
                  value={row.multiplier}
                  onChange={e => updateRow(row.id, 'multiplier', e.target.value)}
                  className="bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-bright
                             focus:outline-none focus:border-muted [appearance:textfield]
                             [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.5"
                />

                {/* Delete */}
                {rows.length > 1 && (
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="font-mono text-xs text-dim hover:text-red-400 transition-colors"
                  >×</button>
                )}
              </div>

              {/* Contribution preview */}
              {p !== null && row.dh.trim() !== '' && (
                <div className="ml-8 font-mono text-[11px] text-secondary">
                  {row.flipped ? `−` : `+`}{Math.abs(p.mult) !== 1 ? `${Math.abs(p.mult)}×` : ''}({row.dh}) = <span style={{ color: p.contribution < 0 ? '#34d399' : p.contribution > 0 ? '#f87171' : 'rgba(var(--overlay),0.5)' }}>{fmtDH(p.contribution)} kJ</span>
                  {row.flipped && <span className="text-dim ml-2">(reversed)</span>}
                </div>
              )}
            </div>
          )
        })}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRows(p => [...p, newRow()])}
            className="font-mono text-xs text-dim hover:text-primary transition-colors"
          >
            + add step
          </button>
          {(rows.some(r => r.equation || r.dh) || target) && (
            <button
              onClick={() => { setRows([newRow(), newRow(), newRow()]); setTarget('') }}
              className="font-mono text-xs text-dim hover:text-red-400 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Divider + total */}
      <AnimatePresence>
        {total !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="h-px bg-border" />

            {/* Summation breakdown */}
            <div className="flex flex-col gap-0.5 pl-1">
              {parsed.map((p, i) => p !== null && rows[i].dh.trim() !== '' && (
                <p key={rows[i].id} className="font-mono text-xs text-secondary">
                  {rows[i].flipped ? '−' : '+'}{Math.abs(p.mult) !== 1 ? `${Math.abs(p.mult)}×` : ''}({rows[i].dh}) = {fmtDH(p.contribution)} kJ
                </p>
              ))}
              <div className="h-px bg-border my-1" />
              <p className="font-mono text-sm">
                ΔH<sub>rxn</sub> = <span className="font-bold text-xl"
                  style={{ color: total < 0 ? '#34d399' : total > 0 ? '#f87171' : 'rgba(var(--overlay),0.6)' }}>
                  {fmtDH(total)} kJ
                </span>
                <span className="ml-3 text-xs text-dim">
                  {total < 0 ? 'exothermic' : total > 0 ? 'endothermic' : 'thermoneutral'}
                </span>
              </p>
              {target.trim() && (
                <p className="font-mono text-xs text-secondary mt-1">
                  Target: <span className="text-primary">{target}</span>
                </p>
              )}
            </div>

            <ResultDisplay label="ΔH_rxn" value={String(total)} unit="kJ" verified={verified} />
          </motion.div>
        )}
      </AnimatePresence>

      <NumberField
        label="Your ΔH_rxn (kJ) — optional, enter to check"
        value={answerVal}
        onChange={setAnswerVal}
        placeholder="optional"
        unit={<span className="font-mono text-sm text-secondary px-2">kJ</span>}
      />

      <p className="font-mono text-xs text-secondary">
        Enter each known reaction and its ΔH. Use the flip toggle to reverse a reaction (negates ΔH) and the multiplier to scale it. ΔHrxn updates live.
      </p>
    </div>
  )
}

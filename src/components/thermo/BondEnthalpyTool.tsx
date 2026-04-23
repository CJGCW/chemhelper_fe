import React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BOND_DATA, BOND_CATEGORIES, lookupBond } from '../../utils/bondEnthalpyData'
import { genBondEnthalpyProblem } from '../../utils/bondEnthalpyPractice'
import StepsPanel from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { hasValue } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'

const BOND_CALC_EMPTY: string[] = []

function generateExample() {
  const p = genBondEnthalpyProblem()
  const last = p.solutionSteps.length - 1
  return { scenario: `${p.description}: ${p.reaction}`, steps: p.solutionSteps.slice(0, last), result: p.solutionSteps[last] }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface BondRow {
  id:     string
  bond:   string   // selected bond type
  count:  string   // user input
  energy: string   // kJ/mol, auto-filled but editable
}

let _id = 0
function newRow(bond = 'C-H'): BondRow {
  return { id: String(++_id), bond, count: '1', energy: String(lookupBond(bond) ?? '') }
}

// ── Bond select ───────────────────────────────────────────────────────────────

function BondSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-sm text-bright
                 focus:outline-none focus:border-muted"
    >
      {BOND_CATEGORIES.map(cat => (
        <optgroup key={cat} label={cat}>
          {BOND_DATA.filter(b => b.category === cat).map(b => (
            <option key={b.bond} value={b.bond}>{b.bond} ({b.energy})</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

// ── Bond panel ────────────────────────────────────────────────────────────────

function BondPanel({
  label,
  rows,
  onAdd,
  onRemove,
  onUpdate,
}: {
  label:    string
  rows:     BondRow[]
  onAdd:    () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: keyof BondRow, value: string) => void
}) {
  const labelCls = "font-mono text-xs text-secondary tracking-widest uppercase"

  const total = rows.reduce((s, r) => {
    const c = parseFloat(r.count)
    const e = parseFloat(r.energy)
    return s + (isNaN(c) || isNaN(e) ? 0 : c * e)
  }, 0)

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <span className={labelCls}>{label}</span>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_3.5rem_5.5rem_1.5rem] gap-2 items-center">
        <span className={labelCls}>bond</span>
        <span className={labelCls}>count</span>
        <span className={labelCls}>BE (kJ/mol)</span>
        <span />
      </div>

      {rows.map(row => {
        const c = parseFloat(row.count)
        const e = parseFloat(row.energy)
        const contrib = !isNaN(c) && !isNaN(e) ? c * e : null
        return (
          <div key={row.id} className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_3.5rem_5.5rem_1.5rem] gap-2 items-center">
              <BondSelect value={row.bond} onChange={v => {
                onUpdate(row.id, 'bond', v)
                const be = lookupBond(v)
                if (be !== undefined) onUpdate(row.id, 'energy', String(be))
              }} />
              <input
                type="number"
                value={row.count}
                onChange={e => onUpdate(row.id, 'count', e.target.value)}
                min="1"
                className="bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-sm text-bright
                           focus:outline-none focus:border-muted [appearance:textfield]
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                value={row.energy}
                onChange={e => onUpdate(row.id, 'energy', e.target.value)}
                className="bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-sm text-bright
                           focus:outline-none focus:border-muted [appearance:textfield]
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {rows.length > 1 && (
                <button onClick={() => onRemove(row.id)}
                  className="font-mono text-xs text-dim hover:text-red-400 transition-colors">×</button>
              )}
            </div>
            {contrib !== null && row.count !== '' && (
              <p className="font-mono text-[11px] text-secondary pl-1">
                {row.count} × {row.energy} = +{contrib.toFixed(0)} kJ
              </p>
            )}
          </div>
        )
      })}

      <button onClick={onAdd} className="self-start font-mono text-xs text-dim hover:text-primary transition-colors">
        + add bond
      </button>

      {/* Section total */}
      <div className="h-px bg-border" />
      <p className="font-mono text-xs text-secondary">
        Σ = <span className="text-primary font-medium">+{total.toFixed(0)} kJ</span>
      </p>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BondEnthalpyTool() {
  const [brokenRows, setBrokenRows] = useState<BondRow[]>([newRow('H-H'), newRow('Cl-Cl')])
  const [formedRows, setFormedRows] = useState<BondRow[]>([newRow('H-Cl')])
  const [answerVal, setAnswerVal] = useState('')

  function updateRow(setter: React.Dispatch<React.SetStateAction<BondRow[]>>) {
    return (id: string, field: keyof BondRow, value: string) => {
      setter(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    }
  }

  function removeRow(setter: React.Dispatch<React.SetStateAction<BondRow[]>>) {
    return (id: string) => setter(prev => prev.filter(r => r.id !== id))
  }

  function rowTotal(rows: BondRow[]): number {
    return rows.reduce((s, r) => {
      const c = parseFloat(r.count)
      const e = parseFloat(r.energy)
      return s + (isNaN(c) || isNaN(e) ? 0 : c * e)
    }, 0)
  }

  const brokenTotal = rowTotal(brokenRows)
  const formedTotal = rowTotal(formedRows)
  const dh = parseFloat((brokenTotal - formedTotal).toFixed(1))

  const verified: VerifyState = (brokenTotal > 0 || formedTotal > 0) && hasValue(answerVal)
    ? (Math.abs(dh - parseFloat(answerVal)) / (Math.abs(dh) || 1) <= 0.01 ? 'correct' : 'incorrect')
    : null

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      <StepsPanel steps={BOND_CALC_EMPTY} generate={generateExample} />

      {/* Bond panels */}
      <div className="flex gap-8 flex-wrap">
        <BondPanel
          label="Bonds Broken (Reactants)"
          rows={brokenRows}
          onAdd={() => setBrokenRows(p => [...p, newRow()])}
          onRemove={removeRow(setBrokenRows)}
          onUpdate={updateRow(setBrokenRows)}
        />
        <BondPanel
          label="Bonds Formed (Products)"
          rows={formedRows}
          onAdd={() => setFormedRows(p => [...p, newRow()])}
          onRemove={removeRow(setFormedRows)}
          onUpdate={updateRow(setFormedRows)}
        />
      </div>

      {/* Reset */}
      {(brokenTotal > 0 || formedTotal > 0) && (
        <button
          onClick={() => {
            setBrokenRows([newRow('H-H'), newRow('Cl-Cl')])
            setFormedRows([newRow('H-Cl')])
          }}
          className="self-start font-mono text-xs text-dim hover:text-red-400 transition-colors"
        >
          Reset
        </button>
      )}

      {/* Result */}
      <AnimatePresence>
        {(brokenTotal > 0 || formedTotal > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 rounded-sm border border-border bg-surface p-4"
          >
            <div className="h-px bg-border mb-1" />
            <p className="font-mono text-xs text-secondary">
              Σ(broken) − Σ(formed) = {brokenTotal.toFixed(0)} − {formedTotal.toFixed(0)}
            </p>
            <p className="font-mono text-sm">
              ΔH ≈ <span className="font-bold text-xl"
                style={{ color: dh < 0 ? '#34d399' : dh > 0 ? '#f87171' : 'rgba(var(--overlay),0.6)' }}>
                {dh >= 0 ? '+' : ''}{dh.toFixed(0)} kJ
              </span>
              <span className="ml-3 text-xs text-dim">
                {dh < 0 ? 'exothermic' : dh > 0 ? 'endothermic' : 'thermoneutral'}
              </span>
            </p>
            <p className="font-mono text-xs text-secondary mt-1">
              Bond energies are average values — result is an approximation.
            </p>
            <ResultDisplay label="ΔH" value={`${dh >= 0 ? '+' : ''}${dh.toFixed(0)}`} unit="kJ" verified={verified} />
          </motion.div>
        )}
      </AnimatePresence>

      {(brokenTotal > 0 || formedTotal > 0) && (
        <NumberField
          label="Your ΔH — optional, enter to check"
          value={answerVal}
          onChange={setAnswerVal}
          placeholder="optional"
          unit={<span className="font-mono text-sm text-secondary px-2">kJ</span>}
        />
      )}

      <p className="font-mono text-xs text-secondary">
        Select bond types for reactants (broken) and products (formed). Counts and energies are editable.
        Energy values are pre-filled from average bond enthalpies.
      </p>
    </div>
  )
}

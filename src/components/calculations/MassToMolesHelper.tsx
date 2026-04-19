/**
 * Collapsible helper that computes moles from mass + molar mass.
 * Sits above the Moles input field in molarity/molality forms.
 * Fires onResolved(moles) so the parent can fill its moles field.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberField from './NumberField'
import UnitSelect, { MASS_UNITS } from './UnitSelect'
import type { UnitOption } from './UnitSelect'
import CompoundInput from './CompoundInput'
import { sanitize, hasValue, toStandard } from '../../utils/calcHelpers'
import { formatSigFigs, lowestSigFigs } from '../../utils/sigfigs'
import { estimateVhf } from '../../utils/vhfUtility'

interface Props {
  onResolved: (moles: string, steps: string[], suggestedI?: { i: number; note: string } | null) => void
  onClear: () => void
}

export default function MassToMolesHelper({ onResolved, onClear }: Props) {
  const [open, setOpen]                     = useState(false)
  const [massValue, setMassValue]           = useState('')
  const [massUnit, setMassUnit]             = useState<UnitOption>(MASS_UNITS[2])
  const [molarMassValue, setMolarMassValue] = useState('')
  const [error, setError]                   = useState<string | null>(null)
  const [resolved, setResolved]             = useState<string | null>(null) // moles string
  const [formula, setFormula]               = useState<string>('')

  function handleCompoundResolved(mw: string, fmt: string) {
    setMolarMassValue(mw)
    setFormula(fmt)
  }

  function compute() {
    setError(null)
    if (!hasValue(massValue) || !hasValue(molarMassValue)) {
      setError('Enter both mass and molar mass.')
      return
    }
    const m = toStandard(massValue, massUnit)
    const M = parseFloat(molarMassValue)
    if (M === 0) { setError('Molar mass cannot be zero.'); return }
    const n = m / M
    const sf = lowestSigFigs([massValue, molarMassValue])
    const nStr = formatSigFigs(n, sf)
    const steps = [
      `Convert mass: ${massValue} ${massUnit.label} = ${m} g`,
      `n = m / M = ${m} g ÷ ${M} g/mol = ${n} mol`,
      `Rounded to ${sf} sf: ${nStr} mol`,
    ]
    setResolved(nStr)
    const vhf = formula ? estimateVhf(formula) : null
    const suggestedI = vhf ? { i: vhf.i, note: vhf.note } : null
    onResolved(nStr, steps, suggestedI)
    setOpen(false)
  }

  function handleClear() {
    setMassValue('')
    setMolarMassValue('')
    setFormula('')
    setResolved(null)
    setError(null)
    onClear()
  }

  return (
    <div>
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 font-sans text-sm font-medium transition-colors group"
        style={{ color: resolved ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="inline-block font-mono text-xs"
        >
          ▶
        </motion.span>
        {resolved ? `From mass: ${resolved} mol` : 'Calculate moles from mass'}
        {resolved && (
          <span
            onClick={e => { e.stopPropagation(); handleClear() }}
            className="ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer"
          >
            ✕
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="flex flex-col gap-3 mt-2 p-3 rounded-sm border"
              style={{
                borderColor: 'color-mix(in srgb, var(--c-halogen) 20%, rgb(var(--color-border)))',
                background: 'color-mix(in srgb, var(--c-halogen) 4%, rgb(var(--color-surface)))',
              }}
            >
              <p className="font-mono text-xs text-secondary">n = m / M</p>

              {/* Mass */}
              <NumberField
                label="Mass (m)"
                value={massValue}
                onChange={v => setMassValue(sanitize(v))}
                placeholder="e.g. 5.850"
                unit={<UnitSelect options={MASS_UNITS} value={massUnit} onChange={setMassUnit} />}
              />

              {/* Molar Mass + lookup */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium text-primary">Molar Mass (M)</label>
                <CompoundInput onResolved={handleCompoundResolved} />
                <div className="flex items-stretch gap-1.5">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={molarMassValue}
                    onChange={e => setMolarMassValue(sanitize(e.target.value))}
                    placeholder="e.g. 58.44"
                    className="flex-1 font-mono text-sm bg-surface border border-border rounded-sm
                               px-3 py-2 text-primary placeholder-dim focus:outline-none
                               focus:border-accent/40 transition-colors"
                  />
                  <span className="font-mono text-sm text-secondary px-2 flex items-center">g/mol</span>
                </div>
              </div>

              {error && <p className="font-mono text-xs text-red-400">{error}</p>}

              <button
                onClick={compute}
                className="w-full py-2 rounded-sm font-sans font-medium text-sm transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 14%, rgb(var(--color-surface)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                }}
              >
                Compute Moles
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

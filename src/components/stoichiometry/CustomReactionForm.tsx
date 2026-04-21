import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type CustomField, type ValidationResult,
  BLANK_FIELD, validateCustomReaction, buildCustomReaction,
} from '../../utils/customReactionBuilder'
import type { Reaction } from '../../utils/stoichiometryPractice'

const inputBase = 'font-mono text-sm bg-raised border border-border rounded-sm px-1.5 py-1 text-primary focus:outline-none'

interface Props {
  onApply: (rxn: Reaction) => void
}

export default function CustomReactionForm({ onApply }: Props) {
  const [show,             setShow]             = useState(false)
  const [customReactants,  setCustomReactants]  = useState<CustomField[]>([{ ...BLANK_FIELD }, { ...BLANK_FIELD }])
  const [customProducts,   setCustomProducts]   = useState<CustomField[]>([{ ...BLANK_FIELD }])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  function setReactantField(i: number, f: CustomField) {
    setCustomReactants(prev => prev.map((p, j) => j === i ? f : p))
    setValidationResult(null)
  }
  function setProductField(i: number, f: CustomField) {
    setCustomProducts(prev => prev.map((p, j) => j === i ? f : p))
    setValidationResult(null)
  }

  function handleValidate() {
    setValidationResult(validateCustomReaction(customReactants, customProducts))
  }

  function handleUse() {
    const built = buildCustomReaction(
      customReactants.filter(r => r.formula.trim()),
      customProducts,
    )
    if (!built) return
    onApply(built)
    setShow(false)
    setValidationResult(null)
  }

  function handleClear() {
    setCustomReactants([{ ...BLANK_FIELD }, { ...BLANK_FIELD }])
    setCustomProducts([{ ...BLANK_FIELD }])
    setValidationResult(null)
  }

  return (
    <>
      <button
        onClick={() => setShow(v => !v)}
        className="font-mono text-xs px-3 py-1 rounded-sm border transition-colors"
        style={show ? {
          borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
          background: 'color-mix(in srgb, var(--c-halogen) 10%, transparent)',
        } : { borderColor: 'rgb(var(--color-border))', color: 'rgba(var(--overlay),0.4)' }}
      >
        Custom
      </button>

      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
            className="col-span-full"
          >
            <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs tracking-widest text-secondary uppercase">Custom Reaction</p>
                <button onClick={handleClear}
                  className="font-mono text-xs text-secondary hover:text-bright transition-colors px-1.5 py-0.5 rounded-sm border border-border">
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-[2.5rem_1fr] gap-2 pr-6">
                <span className="font-mono text-xs text-secondary">coeff</span>
                <span className="font-mono text-xs text-secondary">formula</span>
              </div>

              {/* Reactants */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-secondary uppercase tracking-widest">Reactants</span>
                  <button onClick={() => { setCustomReactants(r => [...r, { ...BLANK_FIELD }]); setValidationResult(null) }}
                    className="font-mono text-xs text-secondary hover:text-bright transition-colors px-1.5 py-0.5 rounded-sm border border-border">
                    + Add
                  </button>
                </div>
                {customReactants.map((field, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="grid grid-cols-[2.5rem_1fr] gap-2 flex-1">
                      <input type="text" inputMode="numeric" value={field.coeff}
                        onChange={e => setReactantField(i, { ...field, coeff: e.target.value })}
                        className={inputBase + ' text-center'} />
                      <input type="text" value={field.formula} placeholder="e.g. H2O"
                        onChange={e => setReactantField(i, { ...field, formula: e.target.value })}
                        className={inputBase + ' placeholder-dim'} />
                    </div>
                    {customReactants.length > 1 && (
                      <button onClick={() => { setCustomReactants(r => r.filter((_, j) => j !== i)); setValidationResult(null) }}
                        className="font-mono text-sm text-secondary hover:text-rose-400 transition-colors w-5 text-center shrink-0">
                        −
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Products */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-secondary uppercase tracking-widest">Products <span className="normal-case">(optional)</span></span>
                  <button onClick={() => { setCustomProducts(p => [...p, { ...BLANK_FIELD }]); setValidationResult(null) }}
                    className="font-mono text-xs text-secondary hover:text-bright transition-colors px-1.5 py-0.5 rounded-sm border border-border">
                    + Add
                  </button>
                </div>
                {customProducts.map((field, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="grid grid-cols-[2.5rem_1fr] gap-2 flex-1">
                      <input type="text" inputMode="numeric" value={field.coeff}
                        onChange={e => setProductField(i, { ...field, coeff: e.target.value })}
                        className={inputBase + ' text-center'} />
                      <input type="text" value={field.formula} placeholder="e.g. CO2"
                        onChange={e => setProductField(i, { ...field, formula: e.target.value })}
                        className={inputBase + ' placeholder-dim'} />
                    </div>
                    <button onClick={() => { setCustomProducts(p => p.filter((_, j) => j !== i)); setValidationResult(null) }}
                      className="font-mono text-sm text-secondary hover:text-rose-400 transition-colors w-5 text-center shrink-0">
                      −
                    </button>
                  </div>
                ))}
                {customProducts.length === 0 && (
                  <p className="font-mono text-xs text-secondary italic">No products — yields will not be calculated</p>
                )}
              </div>

              {/* Validate + Use */}
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <button onClick={handleValidate}
                    className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all border border-border text-secondary hover:text-bright hover:border-secondary">
                    Validate
                  </button>
                  <button onClick={handleUse}
                    disabled={validationResult?.status !== 'balanced'}
                    className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Use Reaction
                  </button>
                </div>

                {validationResult && (
                  <div className={`rounded-sm border px-3 py-2.5 flex flex-col gap-2 ${
                    validationResult.status === 'balanced'   ? 'border-emerald-700/50 bg-emerald-950/20'
                    : validationResult.status === 'impossible' ? 'border-rose-700/50 bg-rose-950/20'
                    : 'border-amber-700/50 bg-amber-950/20'
                  }`}>
                    <p className={`font-mono text-xs ${
                      validationResult.status === 'balanced'   ? 'text-emerald-400'
                      : validationResult.status === 'impossible' ? 'text-rose-400'
                      : 'text-amber-400'
                    }`}>
                      {validationResult.status === 'balanced' ? '✓ ' : '✗ '}{validationResult.message}
                    </p>
                    {validationResult.atomCounts && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {validationResult.atomCounts.map(({ elem, left, right }) => (
                          <span key={elem} className={`font-mono text-xs ${left === right ? 'text-secondary' : 'text-amber-400'}`}>
                            {elem}: {left} → {right}{left !== right ? ' ✗' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

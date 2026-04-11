import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Field component (matches IdealGasCalc style) ──────────────────────────────

function FieldBox({
  label, value, onChange, unit, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  unit?: string; placeholder?: string
}) {
  const isEmpty = value.trim() === ''
  return (
    <div className={`flex flex-col gap-1.5 rounded-sm border p-3 transition-colors ${
      isEmpty ? 'border-border/40 bg-surface/50' : 'border-border bg-surface'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">{label}</span>
        {unit && <span className="font-mono text-xs text-dim">{unit}</span>}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'leave blank to solve'}
        className="w-full bg-transparent font-mono text-base text-bright placeholder:text-dim/50
                   focus:outline-none [appearance:textfield]
                   [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type InputMode = 'rate' | 'time'
type SolveFor  = 'rate1' | 'rate2' | 'M1' | 'M2'

// ── Component ─────────────────────────────────────────────────────────────────

export default function GrahamsLawCalc() {
  const [inputMode, setInputMode] = useState<InputMode>('rate')

  const [gas1, setGas1]   = useState('')
  const [gas2, setGas2]   = useState('')
  const [M1, setM1]       = useState('')
  const [M2, setM2]       = useState('')
  const [val1, setVal1]   = useState('')  // rate₁ or time₁
  const [val2, setVal2]   = useState('')  // rate₂ or time₂

  const [result, setResult] = useState<{ solveFor: SolveFor; value: string; steps: string[] } | null>(null)
  const [error, setError]   = useState('')

  const label1 = gas1.trim() || 'Gas 1'
  const label2 = gas2.trim() || 'Gas 2'
  const rateLbl = inputMode === 'rate' ? 'Rate' : 'Time'

  function handleModeChange(m: InputMode) {
    setInputMode(m)
    setVal1(''); setVal2('')
    setResult(null); setError('')
  }

  function handleClear() {
    setM1(''); setM2(''); setVal1(''); setVal2('')
    setResult(null); setError('')
  }

  function handleCalc() {
    setError(''); setResult(null)

    const inputs = { M1, M2, val1, val2 }
    const blanks = Object.values(inputs).filter(v => v.trim() === '').length
    if (blanks !== 1) {
      setError(blanks === 0
        ? 'Leave one field blank — that variable will be solved.'
        : 'Fill in exactly three of the four fields.')
      return
    }

    const pM1   = M1.trim()   ? parseFloat(M1)   : null
    const pM2   = M2.trim()   ? parseFloat(M2)   : null
    const pVal1 = val1.trim() ? parseFloat(val1) : null
    const pVal2 = val2.trim() ? parseFloat(val2) : null

    if ([pM1, pM2, pVal1, pVal2].some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }

    const sf = (v: number) => parseFloat(v.toPrecision(4)).toString()
    const steps: string[] = []

    // rate mode:  r₁/r₂ = √(M₂/M₁)
    // time mode:  t₁/t₂ = √(M₁/M₂)   (inverse — lighter gas takes less time)
    // Unified: for rate, ratio = √(M₂/M₁);  for time, ratio = √(M₁/M₂)

    if (inputMode === 'rate') {
      // r₁/r₂ = √(M₂/M₁)
      if (pVal1 === null) {
        // rate₁ = rate₂ × √(M₂/M₁)
        const ans = pVal2! * Math.sqrt(pM2! / pM1!)
        steps.push(`rate₁ = rate₂ × √(M₂ / M₁)`)
        steps.push(`rate₁ = ${sf(pVal2!)} × √(${sf(pM2!)} / ${sf(pM1!)})`)
        steps.push(`rate₁ = ${sf(pVal2!)} × ${sf(Math.sqrt(pM2! / pM1!))}`)
        steps.push(`rate₁ = ${sf(ans)}`)
        setResult({ solveFor: 'rate1', value: sf(ans), steps })

      } else if (pVal2 === null) {
        const ans = pVal1! * Math.sqrt(pM1! / pM2!)
        steps.push(`rate₂ = rate₁ × √(M₁ / M₂)`)
        steps.push(`rate₂ = ${sf(pVal1!)} × √(${sf(pM1!)} / ${sf(pM2!)})`)
        steps.push(`rate₂ = ${sf(pVal1!)} × ${sf(Math.sqrt(pM1! / pM2!))}`)
        steps.push(`rate₂ = ${sf(ans)}`)
        setResult({ solveFor: 'rate2', value: sf(ans), steps })

      } else if (pM1 === null) {
        // M₁ = M₂ × (rate₂ / rate₁)²
        const ans = pM2! * Math.pow(pVal2! / pVal1!, 2)
        steps.push(`M₁ = M₂ × (rate₂ / rate₁)²`)
        steps.push(`M₁ = ${sf(pM2!)} × (${sf(pVal2!)} / ${sf(pVal1!)})²`)
        steps.push(`M₁ = ${sf(pM2!)} × ${sf(Math.pow(pVal2! / pVal1!, 2))}`)
        steps.push(`M₁ = ${sf(ans)} g/mol`)
        setResult({ solveFor: 'M1', value: sf(ans), steps })

      } else {
        // M₂ = M₁ × (rate₁ / rate₂)²
        const ans = pM1! * Math.pow(pVal1! / pVal2!, 2)
        steps.push(`M₂ = M₁ × (rate₁ / rate₂)²`)
        steps.push(`M₂ = ${sf(pM1!)} × (${sf(pVal1!)} / ${sf(pVal2!)})²`)
        steps.push(`M₂ = ${sf(pM1!)} × ${sf(Math.pow(pVal1! / pVal2!, 2))}`)
        steps.push(`M₂ = ${sf(ans)} g/mol`)
        setResult({ solveFor: 'M2', value: sf(ans), steps })
      }
    } else {
      // time mode:  t₁/t₂ = √(M₁/M₂)
      if (pVal1 === null) {
        const ans = pVal2! * Math.sqrt(pM1! / pM2!)
        steps.push(`t₁ = t₂ × √(M₁ / M₂)`)
        steps.push(`t₁ = ${sf(pVal2!)} × √(${sf(pM1!)} / ${sf(pM2!)})`)
        steps.push(`t₁ = ${sf(pVal2!)} × ${sf(Math.sqrt(pM1! / pM2!))}`)
        steps.push(`t₁ = ${sf(ans)}`)
        setResult({ solveFor: 'rate1', value: sf(ans), steps })

      } else if (pVal2 === null) {
        const ans = pVal1! * Math.sqrt(pM2! / pM1!)
        steps.push(`t₂ = t₁ × √(M₂ / M₁)`)
        steps.push(`t₂ = ${sf(pVal1!)} × √(${sf(pM2!)} / ${sf(pM1!)})`)
        steps.push(`t₂ = ${sf(pVal1!)} × ${sf(Math.sqrt(pM2! / pM1!))}`)
        steps.push(`t₂ = ${sf(ans)}`)
        setResult({ solveFor: 'rate2', value: sf(ans), steps })

      } else if (pM1 === null) {
        // t₁/t₂ = √(M₁/M₂)  →  M₁ = M₂ × (t₁/t₂)²
        const ans = pM2! * Math.pow(pVal1! / pVal2!, 2)
        steps.push(`M₁ = M₂ × (t₁ / t₂)²`)
        steps.push(`M₁ = ${sf(pM2!)} × (${sf(pVal1!)} / ${sf(pVal2!)})²`)
        steps.push(`M₁ = ${sf(pM2!)} × ${sf(Math.pow(pVal1! / pVal2!, 2))}`)
        steps.push(`M₁ = ${sf(ans)} g/mol`)
        setResult({ solveFor: 'M1', value: sf(ans), steps })

      } else {
        // M₂ = M₁ × (t₂/t₁)²
        const ans = pM1! * Math.pow(pVal2! / pVal1!, 2)
        steps.push(`M₂ = M₁ × (t₂ / t₁)²`)
        steps.push(`M₂ = ${sf(pM1!)} × (${sf(pVal2!)} / ${sf(pVal1!)})²`)
        steps.push(`M₂ = ${sf(pM1!)} × ${sf(Math.pow(pVal2! / pVal1!, 2))}`)
        steps.push(`M₂ = ${sf(ans)} g/mol`)
        setResult({ solveFor: 'M2', value: sf(ans), steps })
      }
    }
  }

  const resultLabel: Record<SolveFor, string> = {
    rate1: `${rateLbl} of ${label1}`,
    rate2: `${rateLbl} of ${label2}`,
    M1:    `Molar mass of ${label1}`,
    M2:    `Molar mass of ${label2}`,
  }
  const resultUnit: Record<SolveFor, string> = {
    rate1: inputMode === 'rate' ? '' : 's (or any consistent time unit)',
    rate2: inputMode === 'rate' ? '' : 's (or any consistent time unit)',
    M1:    'g/mol',
    M2:    'g/mol',
  }

  const hasAny = M1 || M2 || val1 || val2

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* Mode toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 p-1 rounded-sm self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {([
            { id: 'rate', label: 'Effusion Rates' },
            { id: 'time', label: 'Effusion Times'  },
          ] as const).map(m => (
            <button key={m.id} onClick={() => handleModeChange(m.id)}
              className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: inputMode === m.id ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
              {inputMode === m.id && (
                <motion.div layoutId="grahams-mode-pill" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-dim">
          {inputMode === 'rate'
            ? 'rate₁ / rate₂ = √(M₂ / M₁)'
            : 't₁ / t₂ = √(M₁ / M₂)'}
        </p>
      </div>

      <p className="font-sans text-sm text-secondary -mt-2">
        Fill in three fields and leave one blank — it will be solved.
      </p>

      {/* Gas labels */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-secondary">Gas 1 name (optional)</label>
          <input type="text" value={gas1} onChange={e => setGas1(e.target.value)}
            placeholder="e.g. H₂"
            className="font-sans text-sm bg-surface border border-border/50 rounded-sm px-3 py-1.5
                       text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-secondary">Gas 2 name (optional)</label>
          <input type="text" value={gas2} onChange={e => setGas2(e.target.value)}
            placeholder="e.g. O₂"
            className="font-sans text-sm bg-surface border border-border/50 rounded-sm px-3 py-1.5
                       text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
      </div>

      {/* Numeric inputs — 2×2 grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="col-span-2 grid grid-cols-2 gap-1">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label1}</span>
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">{label2}</span>
        </div>

        <FieldBox label={`M₁ — Molar mass of ${label1}`}
          value={M1} onChange={v => { setM1(v); setResult(null) }} unit="g/mol" />
        <FieldBox label={`M₂ — Molar mass of ${label2}`}
          value={M2} onChange={v => { setM2(v); setResult(null) }} unit="g/mol" />

        <FieldBox
          label={inputMode === 'rate' ? `rate₁ — Rate of ${label1}` : `t₁ — Time for ${label1}`}
          value={val1} onChange={v => { setVal1(v); setResult(null) }}
          unit={inputMode === 'rate' ? 'any unit' : 's / min / …'}
        />
        <FieldBox
          label={inputMode === 'rate' ? `rate₂ — Rate of ${label2}` : `t₂ — Time for ${label2}`}
          value={val2} onChange={v => { setVal2(v); setResult(null) }}
          unit={inputMode === 'rate' ? 'same unit' : 'same unit'}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button onClick={handleCalc}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>Calculate →</button>
        {(hasAny || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.value}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 rounded-sm border bg-surface p-5"
            style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
          >
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Result</span>
              <span className="font-mono text-2xl font-bold" style={{ color: 'var(--c-halogen)' }}>
                {result.value}
                {resultUnit[result.solveFor] && (
                  <span className="font-mono text-base font-normal text-secondary ml-2">
                    {resultUnit[result.solveFor]}
                  </span>
                )}
              </span>
              <span className="font-sans text-sm text-secondary">{resultLabel[result.solveFor]}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Steps</span>
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
                {result.steps.map((s, i) => (
                  <p key={i} className={`font-mono text-sm ${i === result.steps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'}`}>
                    {i === result.steps.length - 1 ? '∴ ' : ''}{s}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-[10px] text-dim">
        {inputMode === 'rate'
          ? 'Units for rate must be consistent (e.g. both in mol/s). Molar masses in g/mol.'
          : 'Units for time must be consistent (e.g. both in seconds). Molar masses in g/mol.'}
      </p>
    </div>
  )
}

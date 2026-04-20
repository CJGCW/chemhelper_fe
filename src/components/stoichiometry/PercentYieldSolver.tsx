import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkedExample } from './StoichiometrySolver'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

function NumInput({ value, onChange, placeholder = 'value' }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input type="number" inputMode="decimal" min="0" value={value}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-32 bg-raised border border-border rounded-sm px-3 py-1.5
                 font-mono text-sm text-bright placeholder-dim focus:outline-none focus:border-muted" />
  )
}

interface PYResult {
  percentYield: number
  steps: string[]
}

function calcPercentYield(actual: number, theoretical: number): PYResult {
  const pct = (actual / theoretical) * 100
  const steps = [
    `% yield = (actual yield / theoretical yield) × 100`,
    `% yield = (${sig(actual)} g / ${sig(theoretical)} g) × 100`,
    `% yield = ${sig(pct, 4)}%`,
  ]
  return { percentYield: parseFloat(sig(pct, 4)), steps }
}

export default function PercentYieldSolver() {
  const [actualVal,      setActualVal]      = useState('')
  const [theoreticalVal, setTheoreticalVal] = useState('')
  const [result,         setResult]         = useState<PYResult | null>(null)

  function handleCalc() {
    const actual      = parseFloat(actualVal)
    const theoretical = parseFloat(theoreticalVal)
    if (isNaN(actual) || isNaN(theoretical) || actual <= 0 || theoretical <= 0) return
    if (actual > theoretical) return
    setResult(calcPercentYield(actual, theoretical))
  }

  const canCalc = (() => {
    const a = parseFloat(actualVal)
    const t = parseFloat(theoreticalVal)
    return !isNaN(a) && !isNaN(t) && a > 0 && t > 0 && a <= t
  })()

  const errorMsg = (() => {
    const a = parseFloat(actualVal)
    const t = parseFloat(theoreticalVal)
    if (actualVal && theoreticalVal && !isNaN(a) && !isNaN(t) && a > t) {
      return 'Actual yield cannot exceed theoretical yield.'
    }
    return null
  })()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <div className="flex flex-col gap-2">
        <p className="font-mono text-sm text-secondary">
          % yield = (actual yield / theoretical yield) × 100
        </p>
      </div>

      {/* Actual yield */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Actual Yield (g)</label>
        <div className="flex items-center gap-2">
          <NumInput value={actualVal} onChange={v => { setActualVal(v); setResult(null) }}
            placeholder="e.g. 9.85" />
          <span className="font-mono text-xs text-secondary">g</span>
        </div>
        <p className="font-mono text-xs text-secondary">The mass of product actually obtained in the experiment.</p>
      </div>

      {/* Theoretical yield */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Theoretical Yield (g)</label>
        <div className="flex items-center gap-2">
          <NumInput value={theoreticalVal} onChange={v => { setTheoreticalVal(v); setResult(null) }}
            placeholder="e.g. 34.06" />
          <span className="font-mono text-xs text-secondary">g</span>
        </div>
        <p className="font-mono text-xs text-secondary">The maximum possible yield calculated from stoichiometry.</p>
      </div>

      {errorMsg && <p className="font-mono text-xs text-rose-400">{errorMsg}</p>}

      <button onClick={handleCalc} disabled={!canCalc}
        className="self-start px-5 py-2 rounded-sm font-sans text-sm font-semibold
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}>
        Calculate
      </button>

      <AnimatePresence>
        {result && (
          <motion.div key="py-result"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-3 pt-1">
              <div className="rounded-sm border px-4 py-3"
                style={{
                  borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))',
                }}>
                <span className="font-mono text-xs text-secondary tracking-widest uppercase block mb-1">
                  Percent Yield
                </span>
                <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {result.percentYield}%
                </span>
              </div>
              <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">Solution Steps</span>
                <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                  {result.steps.map((s, i) => (
                    <p key={i} className="font-mono text-sm text-primary">{s}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkedExample
        problem="In a lab synthesis of NH₃ (N₂ + 3H₂ → 2NH₃), the theoretical yield is 34.06 g. The student collected 9.85 g. What is the percent yield?"
        steps={[
          '% yield = (actual yield / theoretical yield) × 100',
          '% yield = (9.85 g / 34.06 g) × 100',
          '% yield = 28.92%',
        ]}
        answer="28.92%"
      />
      <p className="font-mono text-xs text-secondary">% yield = (actual / theoretical) × 100 · theoretical assumes limiting reagent fully consumed</p>
    </div>
  )
}

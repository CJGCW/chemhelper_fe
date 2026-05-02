import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { concentrationCellEmf } from '../../chem/electrochem'
import StepsPanel from '../shared/StepsPanel'

function buildExample() {
  const r = concentrationCellEmf(1.0, 0.01, 2)
  return {
    scenario: 'Cu electrode in 1.0 M CuSO₄ vs. Cu electrode in 0.010 M CuSO₄. n = 2, T = 25°C.',
    steps: r.steps.slice(0, -1),
    result: `E = ${r.E.toFixed(4)} V`,
  }
}

export default function ConcentrationCellTool() {
  const [highRaw, setHighRaw] = useState('')
  const [lowRaw, setLowRaw]   = useState('')
  const [nRaw, setNRaw]       = useState('')
  const [tRaw, setTRaw]       = useState('298.15')
  const [result, setResult]   = useState<ReturnType<typeof concentrationCellEmf> | null>(null)
  const [steps, setSteps]     = useState<string[]>([])
  const [error, setError]     = useState('')

  function reset() { setResult(null); setSteps([]); setError('') }

  function handleCalculate() {
    setError('')
    const high = parseFloat(highRaw)
    const low  = parseFloat(lowRaw)
    const n    = parseInt(nRaw, 10)
    const T    = parseFloat(tRaw || '298.15')

    if (isNaN(high) || high <= 0) { setError('High concentration must be a positive number.'); return }
    if (isNaN(low) || low <= 0)   { setError('Low concentration must be a positive number.'); return }
    if (high <= low) { setError('High concentration must be greater than low concentration.'); return }
    if (isNaN(n) || n < 1)        { setError('n must be a positive integer.'); return }
    if (isNaN(T) || T <= 0)       { setError('Temperature must be positive (Kelvin).'); return }

    const r = concentrationCellEmf(high, low, n, T)
    setResult(r)
    setSteps(r.steps)
  }

  const emptySteps: string[] = []

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      <StepsPanel steps={emptySteps} generate={buildExample} />

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">High concentration (mol/L)</label>
            <input
              type="text"
              inputMode="decimal"
              value={highRaw}
              onChange={e => { setHighRaw(e.target.value); reset() }}
              placeholder="e.g. 1.0"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-32"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">Low concentration (mol/L)</label>
            <input
              type="text"
              inputMode="decimal"
              value={lowRaw}
              onChange={e => { setLowRaw(e.target.value); reset() }}
              placeholder="e.g. 0.01"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-32"
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">n (electrons per ion)</label>
            <input
              type="text"
              inputMode="numeric"
              value={nRaw}
              onChange={e => { setNRaw(e.target.value); reset() }}
              placeholder="e.g. 2"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">T (K, default 298.15)</label>
            <input
              type="text"
              inputMode="decimal"
              value={tRaw}
              onChange={e => { setTRaw(e.target.value); reset() }}
              placeholder="298.15"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-28"
            />
          </div>
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button
          onClick={handleCalculate}
          disabled={!highRaw.trim() || !lowRaw.trim() || !nRaw.trim()}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Calculate
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-sm border border-border p-4 flex flex-col gap-3"
            style={{
              background: result.E > 0 ? 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-base)))' : 'rgb(var(--color-base))',
              borderColor: result.E > 0 ? 'color-mix(in srgb, #4ade80 30%, transparent)' : 'rgb(var(--color-border))',
            }}
          >
            <p className="font-mono text-xs tracking-widest uppercase text-secondary">Cell EMF</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold" style={{ color: result.E > 0 ? '#4ade80' : '#f87171' }}>
                {result.E >= 0 ? '+' : ''}{result.E.toFixed(5)} V
              </span>
            </div>
            <div className="flex flex-col gap-1 font-mono text-xs text-secondary">
              <p>Anode (low conc.):   oxidation → electrons flow out</p>
              <p>Cathode (high conc.): reduction → electrons flow in</p>
              <p className="text-dim mt-1">EMF decreases as concentrations equalize → E = 0 at equilibrium</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StepsPanel steps={steps} />

      <p className="font-mono text-xs text-secondary">
        E = (RT/nF) ln([high]/[low]) · At 25°C: E = (0.05916/n) log₁₀([high]/[low])
      </p>
    </div>
  )
}

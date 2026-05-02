import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { solveTriangle } from '../../chem/electrochem'
import StepsPanel from '../shared/StepsPanel'

type KnownType = 'Ecell' | 'deltaG' | 'K'

const MODES: { id: KnownType; label: string; placeholder: string; unit: string }[] = [
  { id: 'Ecell',  label: 'Know E°cell',  placeholder: 'e.g. 1.10',  unit: 'V'      },
  { id: 'deltaG', label: 'Know ΔG°',     placeholder: 'e.g. -212.3', unit: 'kJ/mol' },
  { id: 'K',      label: 'Know K',       placeholder: 'e.g. 1.6e37', unit: ''       },
]

function buildExample() {
  // Zn/Cu cell: E°=1.10V, n=2
  const result = solveTriangle({ type: 'Ecell', value: 1.10 }, 2, 298)
  return {
    scenario: 'Zn/Cu galvanic cell: E°cell = 1.10 V, n = 2, T = 298 K. Find ΔG° and K.',
    steps: result.steps.slice(0, -1),
    result: `ΔG° = ${result.deltaG.toFixed(1)} kJ/mol,  K = ${result.K.toExponential(2)}`,
  }
}

export default function TriangleTool() {
  const [mode, setMode]         = useState<KnownType>('Ecell')
  const [valueRaw, setValueRaw] = useState('')
  const [nRaw, setNRaw]         = useState('')
  const [tRaw, setTRaw]         = useState('298')
  const [result, setResult]     = useState<ReturnType<typeof solveTriangle> | null>(null)
  const [steps, setSteps]       = useState<string[]>([])
  const [error, setError]       = useState('')

  function reset() { setResult(null); setSteps([]); setError('') }

  function handleCalculate() {
    setError('')
    const value = parseFloat(valueRaw)
    const n     = parseInt(nRaw, 10)
    const T     = parseFloat(tRaw || '298')

    if (isNaN(value)) { setError('Enter a numeric value for the known quantity.'); return }
    if (isNaN(n) || n < 1 || n > 20) { setError('n must be a whole number between 1 and 20.'); return }
    if (isNaN(T) || T <= 0) { setError('Temperature must be positive (Kelvin).'); return }
    if (mode === 'K' && value <= 0) { setError('K must be positive.'); return }

    const r = solveTriangle({ type: mode, value }, n, T)
    setResult(r)
    setSteps(r.steps)
  }

  const emptySteps: string[] = []

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Mode selector */}
      <div className="flex flex-wrap gap-1.5">
        {MODES.map(m => {
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); reset(); setValueRaw('') }}
              className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgba(var(--overlay),0.45)',
              }}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Example button */}
      <StepsPanel steps={emptySteps} generate={buildExample} />

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        {MODES.filter(m => m.id === mode).map(m => (
          <div key={m.id} className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">
              {m.id === 'Ecell' ? 'E°cell (V)' : m.id === 'deltaG' ? 'ΔG° (kJ/mol)' : 'K (dimensionless)'}
            </label>
            <div className="flex items-stretch gap-0">
              <input
                type="text"
                inputMode="decimal"
                value={valueRaw}
                onChange={e => { setValueRaw(e.target.value); reset() }}
                placeholder={m.placeholder}
                className="bg-raised border border-border rounded-l-sm px-3 py-2 font-mono text-sm
                           text-primary placeholder-dim focus:outline-none w-48"
              />
              {m.unit && (
                <span className="flex items-center px-2.5 font-mono text-xs border border-l-0 border-border
                                 text-dim rounded-r-sm"
                  style={{ background: 'rgb(var(--color-base))' }}>
                  {m.unit}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">n (electrons transferred)</label>
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
            <label className="font-mono text-xs text-secondary">T (K, default 298)</label>
            <input
              type="text"
              inputMode="decimal"
              value={tRaw}
              onChange={e => { setTRaw(e.target.value); reset() }}
              placeholder="298"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-24"
            />
          </div>
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button
          onClick={handleCalculate}
          disabled={!valueRaw.trim() || !nRaw.trim()}
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

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="rounded-sm border border-border p-4 flex flex-col gap-3"
              style={{ background: 'rgb(var(--color-base))' }}>
              <p className="font-mono text-xs tracking-widest uppercase text-secondary">Results</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-secondary">ΔG°</span>
                  <span className="font-mono text-lg font-semibold"
                    style={{ color: result.deltaG < 0 ? '#4ade80' : '#f87171' }}>
                    {result.deltaG.toFixed(2)} kJ/mol
                  </span>
                  <span className="font-mono text-[10px] text-dim">
                    {result.deltaG < 0 ? 'spontaneous' : 'non-spontaneous'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-secondary">E°cell</span>
                  <span className="font-mono text-lg font-semibold"
                    style={{ color: result.Ecell > 0 ? '#4ade80' : '#f87171' }}>
                    {result.Ecell >= 0 ? '+' : ''}{result.Ecell.toFixed(4)} V
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-secondary">K</span>
                  <span className="font-mono text-lg font-semibold" style={{ color: 'var(--c-halogen)' }}>
                    {result.K.toExponential(3)}
                  </span>
                  <span className="font-mono text-[10px] text-dim">
                    log₁₀ K = {Math.log10(result.K).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps panel */}
      <StepsPanel steps={steps} />

      <p className="font-mono text-xs text-secondary">
        ΔG° = −nFE° · ΔG° = −RT ln K · F = 96,485 C/mol · R = 8.314 J/(mol·K)
      </p>
    </div>
  )
}

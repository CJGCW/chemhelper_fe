import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { solveFaraday } from '../../chem/electrochem'
import { ELECTROLYSIS_REACTIONS } from '../../data/reductionPotentials'
import type { ElectrolysisReaction } from '../../data/reductionPotentials'
import StepsPanel from '../shared/StepsPanel'

type SolveFor = 'mass' | 'current' | 'time'

const SOLVE_OPTS: { id: SolveFor; label: string; formula: string }[] = [
  { id: 'mass',    label: 'Mass deposited',  formula: 'm = ItM/nF' },
  { id: 'current', label: 'Current needed',  formula: 'I = mnF/tM' },
  { id: 'time',    label: 'Time required',   formula: 't = mnF/IM' },
]

function buildExample() {
  // Chang Ex 18.8: Cu plating, I=3.00A, t=3600s
  const r = solveFaraday({ solveFor: 'mass', I: 3.00, t: 3600, M: 63.55, n: 2 })
  return {
    scenario: 'Chang Ex 18.8: Pass 3.00 A through CuSO₄(aq) for 1 hour. How many grams of Cu deposit? (M = 63.55 g/mol, n = 2)',
    steps: r.steps.slice(0, -1),
    result: `Mass = ${r.answer.toFixed(2)} g Cu deposited`,
  }
}

export default function ElectrolysisTool() {
  const [solveFor, setSolveFor]   = useState<SolveFor>('mass')
  const [rxn, setRxn]             = useState<ElectrolysisReaction>(ELECTROLYSIS_REACTIONS[0])
  const [mRaw, setMRaw]           = useState('')
  const [iRaw, setIRaw]           = useState('')
  const [tRaw, setTRaw]           = useState('')
  const [molarMassRaw, setMolarMassRaw] = useState(String(ELECTROLYSIS_REACTIONS[0].molarMass))
  const [nRaw, setNRaw]           = useState(String(ELECTROLYSIS_REACTIONS[0].n))
  const [result, setResult]       = useState<ReturnType<typeof solveFaraday> | null>(null)
  const [steps, setSteps]         = useState<string[]>([])
  const [error, setError]         = useState('')

  function handleRxnChange(id: string) {
    const found = ELECTROLYSIS_REACTIONS.find(r => r.id === id)
    if (!found) return
    setRxn(found)
    setMolarMassRaw(String(found.molarMass))
    setNRaw(String(found.n))
    setResult(null); setSteps([]); setError('')
  }

  function reset() { setResult(null); setSteps([]); setError('') }

  function handleCalculate() {
    setError('')
    const M = parseFloat(molarMassRaw)
    const n = parseInt(nRaw, 10)
    if (isNaN(M) || M <= 0) { setError('Enter a valid molar mass (g/mol).'); return }
    if (isNaN(n) || n < 1) { setError('n must be a positive integer.'); return }

    try {
      let r: ReturnType<typeof solveFaraday>
      if (solveFor === 'mass') {
        const I = parseFloat(iRaw), t = parseFloat(tRaw)
        if (isNaN(I) || I <= 0 || isNaN(t) || t <= 0) { setError('Enter positive values for I and t.'); return }
        r = solveFaraday({ solveFor: 'mass', I, t, M, n })
      } else if (solveFor === 'current') {
        const mass = parseFloat(mRaw), t = parseFloat(tRaw)
        if (isNaN(mass) || mass <= 0 || isNaN(t) || t <= 0) { setError('Enter positive values for mass and t.'); return }
        r = solveFaraday({ solveFor: 'current', mass, t, M, n })
      } else {
        const mass = parseFloat(mRaw), I = parseFloat(iRaw)
        if (isNaN(mass) || mass <= 0 || isNaN(I) || I <= 0) { setError('Enter positive values for mass and I.'); return }
        r = solveFaraday({ solveFor: 'time', mass, I, M, n })
      }
      setResult(r)
      setSteps(r.steps)
    } catch (e) {
      setError('Calculation error. Check your inputs.')
    }
  }

  const emptySteps: string[] = []

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Solve-for selector */}
      <div className="flex flex-wrap gap-1.5">
        {SOLVE_OPTS.map(o => {
          const isActive = solveFor === o.id
          return (
            <button key={o.id} onClick={() => { setSolveFor(o.id); reset() }}
              className="flex flex-col items-start px-3 py-2 rounded-sm font-sans text-sm font-medium transition-colors text-left"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              } : {
                background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.45)',
              }}>
              <span className="text-sm">{o.label}</span>
              <span className="font-mono text-[9px] mt-0.5 opacity-60">{o.formula}</span>
            </button>
          )
        })}
      </div>

      {/* Example button */}
      <StepsPanel steps={emptySteps} generate={buildExample} />

      {/* Reaction selector */}
      <div className="flex flex-col gap-1">
        <label className="font-mono text-xs text-secondary">Electrolysis process</label>
        <select
          value={rxn.id}
          onChange={e => handleRxnChange(e.target.value)}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                     text-primary focus:outline-none"
        >
          {ELECTROLYSIS_REACTIONS.map(r => (
            <option key={r.id} value={r.id}>{r.name}  (M={r.molarMass}, n={r.n})</option>
          ))}
        </select>
        <p className="font-mono text-xs text-dim">
          Cathode: {rxn.cathodeReaction}
        </p>
      </div>

      {/* Molar mass & n (editable overrides) */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-secondary">M — molar mass (g/mol)</label>
          <input
            type="text"
            inputMode="decimal"
            value={molarMassRaw}
            onChange={e => { setMolarMassRaw(e.target.value); reset() }}
            className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                       text-primary placeholder-dim focus:outline-none w-28"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-secondary">n — electrons/ion</label>
          <input
            type="text"
            inputMode="numeric"
            value={nRaw}
            onChange={e => { setNRaw(e.target.value); reset() }}
            className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                       text-primary placeholder-dim focus:outline-none w-20"
          />
        </div>
      </div>

      {/* Known inputs */}
      <div className="flex flex-col gap-3">
        {solveFor !== 'mass' && (
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">Mass deposited (g)</label>
            <input type="text" inputMode="decimal" value={mRaw}
              onChange={e => { setMRaw(e.target.value); reset() }}
              placeholder="e.g. 3.56"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-36" />
          </div>
        )}
        {solveFor !== 'current' && (
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">Current I (A)</label>
            <input type="text" inputMode="decimal" value={iRaw}
              onChange={e => { setIRaw(e.target.value); reset() }}
              placeholder="e.g. 3.00"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-36" />
          </div>
        )}
        {solveFor !== 'time' && (
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">Time t (s)</label>
            <input type="text" inputMode="decimal" value={tRaw}
              onChange={e => { setTRaw(e.target.value); reset() }}
              placeholder="e.g. 3600"
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm
                         text-primary placeholder-dim focus:outline-none w-36" />
          </div>
        )}

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}

        <button
          onClick={handleCalculate}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
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
            className="rounded-sm border border-border p-4 flex flex-col gap-2"
            style={{ background: 'rgb(var(--color-base))' }}
          >
            <p className="font-mono text-xs tracking-widest uppercase text-secondary">Result</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                {result.answer.toFixed(3)}
              </span>
              <span className="font-mono text-base text-secondary">{result.unit}</span>
            </div>
            {result.unit === 's' && (
              <p className="font-mono text-xs text-dim">
                = {(result.answer / 60).toFixed(2)} min = {(result.answer / 3600).toFixed(4)} hr
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <StepsPanel steps={steps} />

      <p className="font-mono text-xs text-secondary">
        m = (I × t × M) / (n × F) · F = 96,485 C/mol · 1 A = 1 C/s
      </p>
    </div>
  )
}

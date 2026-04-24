import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { solveHydrate } from '../../chem/hydrate'
import { COMMON_HYDRATES } from '../../data/commonHydrates'
import type { VerifyState } from '../../utils/calcHelpers'

type ToolMode = 'mass-loss' | 'percent-composition'

// ── Example generators ────────────────────────────────────────────────────────

function generateMassLossExample() {
  const h = COMMON_HYDRATES[0]   // CuSO4·5H2O — always a clean example
  const molScale = 0.5
  const massBefore = parseFloat(((h.molarMass + h.realX * 18.015) * molScale).toPrecision(4))
  const massAfter  = parseFloat((h.molarMass * molScale).toPrecision(4))
  const r = solveHydrate({
    mode: 'mass-loss',
    anhydrousFormula: h.display,
    anhydrousMolarMass: h.molarMass,
    massBefore,
    massAfter,
  })
  return {
    scenario: `A ${massBefore} g sample of ${h.display}·${h.realX}H₂O is heated. ${massAfter} g of anhydrous salt remains. Find x.`,
    steps: r.steps.slice(0, r.steps.length - 1),
    result: `x = ${r.x}  →  ${h.display}·${r.x}H₂O`,
  }
}

function generatePercentExample() {
  // Al2(SO4)3 · 18H2O, 8.10% Al — the Chang 3.110 classic
  const h = COMMON_HYDRATES.find(c => c.formula === 'Al2(SO4)3')!
  const el = h.elements[0]  // Al
  const M_hyd = h.molarMass + h.realX * 18.015
  const pct = parseFloat(((el.count * el.molarMass * 100) / M_hyd).toPrecision(4))
  const r = solveHydrate({
    mode: 'percent-composition',
    anhydrousFormula: h.display,
    anhydrousMolarMass: h.molarMass,
    element: el.symbol,
    elementCount: el.count,
    elementMolarMass: el.molarMass,
    percentByMass: pct,
  })
  return {
    scenario: `${h.display}·xH₂O contains ${pct}% ${el.symbol} by mass. Find x.`,
    steps: r.steps.slice(0, r.steps.length - 1),
    result: `x = ${r.x}  →  ${h.display}·${r.x}H₂O`,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HydrateTool() {
  const [toolMode, setToolMode] = useState<ToolMode>('mass-loss')

  // Shared
  const [compoundIdx, setCompoundIdx] = useState(0)
  const compound = COMMON_HYDRATES[compoundIdx]

  // Mass-loss
  const [massBefore, setMassBefore] = useState('')
  const [massAfter,  setMassAfter]  = useState('')

  // Percent-composition
  const [elemIdx,  setElemIdx]  = useState(0)
  const [pctInput, setPctInput] = useState('')

  // Results
  const [steps,    setSteps]    = useState<string[]>([])
  const [result,   setResult]   = useState<string | null>(null)
  const [error,    setError]    = useState('')
  const [verified, setVerified] = useState<VerifyState>(null)

  const stepsState = useStepsPanelState(
    steps,
    () => toolMode === 'mass-loss' ? generateMassLossExample() : generatePercentExample(),
  )

  function reset() {
    setSteps([]); setResult(null); setError(''); setVerified(null)
  }

  function switchMode(m: ToolMode) {
    setToolMode(m)
    setMassBefore(''); setMassAfter(''); setPctInput('')
    reset()
  }

  function switchCompound(idx: number) {
    setCompoundIdx(idx)
    setElemIdx(0)
    reset()
  }

  function handleCalculate() {
    reset()
    try {
      if (toolMode === 'mass-loss') {
        const before = parseFloat(massBefore)
        const after  = parseFloat(massAfter)
        if (isNaN(before) || isNaN(after)) { setError('Enter both masses.'); return }
        if (before <= 0 || after <= 0)     { setError('Masses must be positive.'); return }

        const sol = solveHydrate({
          mode: 'mass-loss',
          anhydrousFormula: compound.display,
          anhydrousMolarMass: compound.molarMass,
          massBefore: before,
          massAfter:  after,
        })
        setSteps(sol.steps)
        setResult(`x = ${sol.x}  →  ${compound.display}·${sol.x}H₂O`)
      } else {
        const pct = parseFloat(pctInput)
        if (isNaN(pct) || pct <= 0 || pct >= 100) { setError('Enter a valid percent (0–100).'); return }
        const el = compound.elements[elemIdx]

        const sol = solveHydrate({
          mode: 'percent-composition',
          anhydrousFormula: compound.display,
          anhydrousMolarMass: compound.molarMass,
          element: el.symbol,
          elementCount: el.count,
          elementMolarMass: el.molarMass,
          percentByMass: pct,
        })
        setSteps(sol.steps)
        setResult(`x = ${sol.x}  →  ${compound.display}·${sol.x}H₂O`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error.')
    }
  }

  const canCalc = toolMode === 'mass-loss'
    ? massBefore.trim() !== '' && massAfter.trim() !== ''
    : pctInput.trim() !== ''

  const selectedEl = compound.elements[elemIdx]

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-full self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['mass-loss', 'percent-composition'] as ToolMode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
            style={{ color: toolMode === m ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
            {toolMode === m && (
              <motion.div layoutId="hydrate-tool-mode" className="absolute inset-0 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <span className="relative z-10">
              {m === 'mass-loss' ? 'Mass Loss' : '% Composition'}
            </span>
          </button>
        ))}
      </div>

      <p className="font-sans text-sm text-secondary leading-relaxed">
        {toolMode === 'mass-loss'
          ? <>Enter the mass of a hydrated salt before and after heating to find the hydration number x.</>
          : <>Enter the mass percent of one element in the hydrate to find x.</>
        }
      </p>

      {/* Compound selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Anhydrous compound</label>
        <select
          value={compoundIdx}
          onChange={e => switchCompound(Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary
                     focus:outline-none focus:border-muted transition-colors"
        >
          {COMMON_HYDRATES.map((h, i) => (
            <option key={h.formula} value={i}>{h.display} — M = {h.molarMass} g/mol</option>
          ))}
        </select>
      </div>

      {/* Mode-specific inputs */}
      {toolMode === 'mass-loss' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField
            label="Mass before heating"
            value={massBefore}
            onChange={v => { setMassBefore(v); reset() }}
            placeholder="g (hydrate)"
            unit={<span className="font-mono text-sm text-secondary px-2">g</span>}
          />
          <NumberField
            label="Mass after heating"
            value={massAfter}
            onChange={v => { setMassAfter(v); reset() }}
            placeholder="g (anhydrous)"
            unit={<span className="font-mono text-sm text-secondary px-2">g</span>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium text-primary">Element</label>
            <select
              value={elemIdx}
              onChange={e => { setElemIdx(Number(e.target.value)); reset() }}
              className="bg-raised border border-border rounded-sm px-3 py-2 font-mono text-sm text-primary
                         focus:outline-none focus:border-muted transition-colors self-start min-w-32"
            >
              {compound.elements.map((el, i) => (
                <option key={el.symbol} value={i}>
                  {el.symbol}  (×{el.count}, M = {el.molarMass})
                </option>
              ))}
            </select>
          </div>
          <NumberField
            label={`Mass percent of ${selectedEl?.symbol ?? 'element'}`}
            value={pctInput}
            onChange={v => { setPctInput(v); reset() }}
            placeholder="e.g. 8.10"
            unit={<span className="font-mono text-sm text-secondary px-2">%</span>}
          />
        </div>
      )}

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalculate} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate x
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <ResultDisplay label="Hydration number" value={result} unit="" verified={verified} />
      )}

      <p className="font-mono text-xs text-secondary">
        {toolMode === 'mass-loss'
          ? 'x = mol(H₂O lost) / mol(anhydrous) · M(H₂O) = 18.015 g/mol'
          : 'M_hydrate = (element mass × 100) / % · x = (M_hydrate − M_anhy) / 18.015'
        }
      </p>
    </div>
  )
}

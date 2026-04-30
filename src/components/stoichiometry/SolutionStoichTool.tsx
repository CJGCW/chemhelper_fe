import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ACID_SOLID_RXNS, ACID_BASE_RXNS,
} from '../../utils/solutionStoichPractice'
import { calcVolToMass, calcMassToVol, calcVolToVol } from '../../chem/solutions'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import ResultDisplay from '../shared/ResultDisplay'
import NumberField from '../shared/NumberField'
import { sanitize } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'

type Mode = 'vol_to_mass' | 'mass_to_vol' | 'vol_to_vol'

const MODES: { id: Mode; label: string; formula: string }[] = [
  { id: 'vol_to_mass', label: 'Vol → Mass', formula: 'V, C → g' },
  { id: 'mass_to_vol', label: 'Mass → Vol', formula: 'g → V, C' },
  { id: 'vol_to_vol',  label: 'Titration',  formula: 'V₁C₁ → V₂' },
]

function sig(x: number, n = 4): string {
  return parseFloat(x.toPrecision(n)).toString()
}

function NumInput({ value, onChange, placeholder = 'value', width = 'w-24' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; width?: string
}) {
  return (
    <input type="text" inputMode="decimal" value={value}
      onChange={e => onChange(sanitize(e.target.value))} placeholder={placeholder}
      className={`${width} bg-raised border border-border rounded-sm px-3 py-1.5
                 font-mono text-sm text-bright placeholder-dim focus:outline-none focus:border-muted`} />
  )
}

export default function SolutionStoichTool() {
  const [mode, setMode] = useState<Mode>('vol_to_mass')
  const [rxnIdx, setRxnIdx] = useState(0)

  // Vol → Mass inputs
  const [vmVol,  setVmVol]  = useState('')
  const [vmConc, setVmConc] = useState('')
  // Mass → Vol inputs
  const [mvMass, setMvMass] = useState('')
  const [mvConc, setMvConc] = useState('')
  // Titration inputs
  const [ttVol,   setTtVol]   = useState('')
  const [ttConcA, setTtConcA] = useState('')
  const [ttConcB, setTtConcB] = useState('')

  const [result,    setResult]    = useState<{ value: string; unit: string } | null>(null)
  const [steps,     setSteps]     = useState<string[]>([])
  const [answerVal, setAnswerVal] = useState('')
  const [verified,  setVerified]  = useState<VerifyState>(null)

  const stepsState = useStepsPanelState(steps, () => ({
    scenario: 'How many mL of 0.500 M HCl are needed to dissolve 5.00 g of CaCO₃? (CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂)',
    steps: [
      'n(CaCO₃) = 5.00 g ÷ 100.09 g/mol = 0.04996 mol',
      'Mole ratio: n(HCl) = 0.04996 × (2/1) = 0.09992 mol',
      'V(HCl) = 0.09992 mol ÷ 0.500 mol/L = 0.1998 L = 199.8 mL',
    ],
    result: '199.8 mL HCl',
  }))

  const solidRxn  = ACID_SOLID_RXNS[rxnIdx % ACID_SOLID_RXNS.length]
  const baseRxn   = ACID_BASE_RXNS[rxnIdx % ACID_BASE_RXNS.length]
  const currentEq = mode === 'vol_to_vol' ? baseRxn.equation : solidRxn.equation

  function switchMode(m: Mode) {
    setMode(m)
    setRxnIdx(0)
    setResult(null)
    setSteps([])
    setAnswerVal(''); setVerified(null)
  }

  function switchRxn(idx: number) {
    setRxnIdx(idx)
    setResult(null)
    setSteps([])
    setVerified(null)
  }

  function handleTool() {
    setVerified(null)
    if (mode === 'vol_to_mass') {
      const v = parseFloat(vmVol), c = parseFloat(vmConc)
      if (isNaN(v) || isNaN(c) || v <= 0 || c <= 0) return
      const { steps: newSteps, answer } = calcVolToMass(solidRxn, v, c)
      setResult({ value: sig(answer), unit: `g ${solidRxn.solidDisplay}` })
      setSteps(newSteps)
      if (answerVal) {
        const valueOk = Math.abs(answer - parseFloat(answerVal)) / answer <= 0.01
        setVerified(valueOk ? 'correct' : 'incorrect')
      }
    } else if (mode === 'mass_to_vol') {
      const m = parseFloat(mvMass), c = parseFloat(mvConc)
      if (isNaN(m) || isNaN(c) || m <= 0 || c <= 0) return
      const { steps: newSteps, answer } = calcMassToVol(solidRxn, m, c)
      setResult({ value: sig(answer), unit: `mL ${solidRxn.acidDisplay}` })
      setSteps(newSteps)
      if (answerVal) {
        const valueOk = Math.abs(answer - parseFloat(answerVal)) / answer <= 0.01
        setVerified(valueOk ? 'correct' : 'incorrect')
      }
    } else {
      const v = parseFloat(ttVol), ca = parseFloat(ttConcA), cb = parseFloat(ttConcB)
      if (isNaN(v) || isNaN(ca) || isNaN(cb) || v <= 0 || ca <= 0 || cb <= 0) return
      const { steps: newSteps, answer } = calcVolToVol(baseRxn, v, ca, cb)
      setResult({ value: sig(answer), unit: `mL ${baseRxn.baseDisplay}` })
      setSteps(newSteps)
      if (answerVal) {
        const valueOk = Math.abs(answer - parseFloat(answerVal)) / answer <= 0.01
        setVerified(valueOk ? 'correct' : 'incorrect')
      }
    }
  }

  const rxnPool     = mode === 'vol_to_vol' ? ACID_BASE_RXNS : ACID_SOLID_RXNS
  const canCalc     = mode === 'vol_to_mass' ? !!vmVol && !!vmConc
                    : mode === 'mass_to_vol' ? !!mvMass && !!mvConc
                    : !!ttVol && !!ttConcA && !!ttConcB

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 rounded-sm self-start print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {MODES.map(m => {
          const isActive = mode === m.id
          return (
            <button key={m.id} onClick={() => switchMode(m.id)}
              className="relative px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
              {isActive && (
                <motion.div layoutId="sol-solver-mode" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{m.label}</span>
              <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{m.formula}</span>
            </button>
          )
        })}
      </div>

      {/* Reaction selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction</label>
        <select value={rxnIdx} onChange={e => switchRxn(Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-sm text-bright focus:outline-none focus:border-muted">
          {rxnPool.map((r, i) => <option key={i} value={i}>{r.name}</option>)}
        </select>
        <p className="font-mono text-sm text-secondary">{currentEq}</p>
      </div>

      {/* Input fields */}
      <AnimatePresence mode="wait">
        <motion.div key={mode}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }}
          className="flex flex-col gap-4">

          {mode === 'vol_to_mass' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-secondary tracking-widest uppercase">Given</label>
                <div className="flex flex-wrap items-center gap-2">
                  <NumInput value={vmVol}  onChange={v => { setVmVol(v);  setResult(null); setSteps([]) }} placeholder="volume" />
                  <span className="font-mono text-xs text-dim">mL of</span>
                  <NumInput value={vmConc} onChange={v => { setVmConc(v); setResult(null); setSteps([]) }} placeholder="conc." />
                  <span className="font-mono text-xs text-dim">mol/L {solidRxn.acidDisplay}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-secondary tracking-widest uppercase">Find</label>
                <p className="font-mono text-sm text-primary">mass (g) of {solidRxn.solidDisplay}</p>
              </div>
            </>
          )}

          {mode === 'mass_to_vol' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-secondary tracking-widest uppercase">Given</label>
                <div className="flex flex-wrap items-center gap-2">
                  <NumInput value={mvMass} onChange={v => { setMvMass(v); setResult(null); setSteps([]) }} placeholder="mass" />
                  <span className="font-mono text-xs text-dim">g of {solidRxn.solidDisplay}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-secondary tracking-widest uppercase">Find</label>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-dim">volume (mL) of</span>
                  <NumInput value={mvConc} onChange={v => { setMvConc(v); setResult(null); setSteps([]) }} placeholder="conc." />
                  <span className="font-mono text-xs text-dim">mol/L {solidRxn.acidDisplay}</span>
                </div>
              </div>
            </>
          )}

          {mode === 'vol_to_vol' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-secondary tracking-widest uppercase">Given (acid)</label>
                <div className="flex flex-wrap items-center gap-2">
                  <NumInput value={ttVol}   onChange={v => { setTtVol(v);   setResult(null); setSteps([]) }} placeholder="volume" />
                  <span className="font-mono text-xs text-dim">mL of</span>
                  <NumInput value={ttConcA} onChange={v => { setTtConcA(v); setResult(null); setSteps([]) }} placeholder="conc." />
                  <span className="font-mono text-xs text-dim">mol/L {baseRxn.acidDisplay}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-secondary tracking-widest uppercase">Find (base)</label>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-dim">volume (mL) of</span>
                  <NumInput value={ttConcB} onChange={v => { setTtConcB(v); setResult(null); setSteps([]) }} placeholder="conc." />
                  <span className="font-mono text-xs text-dim">mol/L {baseRxn.baseDisplay}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <NumberField
        label="Your answer — optional, enter to check"
        value={answerVal}
        onChange={v => setAnswerVal(v)}
        placeholder="your answer"
        unit={<span className="font-mono text-sm text-secondary px-2">
          {mode === 'vol_to_mass' ? `g ${solidRxn.solidDisplay}` : mode === 'mass_to_vol' ? `mL ${solidRxn.acidDisplay}` : `mL ${baseRxn.baseDisplay}`}
        </span>}
      />

      <div className="flex items-stretch gap-2">
        <button onClick={handleTool} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-semibold
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && (
        <ResultDisplay label="Result" value={result.value} unit={result.unit} verified={verified} />
      )}

      <p className="font-mono text-xs text-secondary">n = C × V · use mole ratio from balanced equation · result as mass (× M) or volume (÷ C)</p>
    </div>
  )
}

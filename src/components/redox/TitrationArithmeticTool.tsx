import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberField from '../shared/NumberField'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import ResultDisplay from '../shared/ResultDisplay'
import { sanitize } from '../../utils/calcHelpers'
import type { VerifyState } from '../../utils/calcHelpers'
import { ACID_BASE_PAIRS } from '../../data/acidBasePairs'
import { REDOX_PAIRS } from '../../data/redoxTitrationPairs'
import { solveAcidBaseTitration, solveRedoxTitration } from '../../chem/solutions'
import { generateAcidBasePracticeProblem, generateRedoxPracticeProblem } from '../../utils/titrationPractice'

// ── Shared helpers ─────────────────────────────────────────────────────────────

type TMode = 'acid-base' | 'redox'

function fmt(n: number): string {
  return parseFloat(n.toPrecision(5)).toString().replace(/\.?0+$/, '')
}

function ModeToggle({ mode, setMode }: { mode: TMode; setMode: (m: TMode) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full self-start"
      style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
      {(['acid-base', 'redox'] as TMode[]).map(m => {
        const active = mode === m
        return (
          <button key={m} onClick={() => setMode(m)}
            className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
            style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
            {active && (
              <motion.div layoutId="titration-mode" className="absolute inset-0 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{m === 'acid-base' ? 'Acid-Base' : 'Redox'}</span>
          </button>
        )
      })}
    </div>
  )
}

function UnitBtn({ u, cur, set }: { u: string; cur: string; set: (v: string) => void }) {
  const active = cur === u
  return (
    <button onClick={() => set(u)}
      className="px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
      style={active ? {
        background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
        color: 'var(--c-halogen)',
      } : {
        background: 'rgb(var(--color-raised))',
        border: '1px solid rgb(var(--color-border))',
        color: 'rgba(var(--overlay),0.45)',
      }}>
      {u}
    </button>
  )
}

// ── Acid-Base Practice ─────────────────────────────────────────────────────────

function AcidBasePractice() {
  const [pairIdx,     setPairIdx]     = useState(0)
  const [givenSide,   setGivenSide]   = useState<'acid' | 'base'>('acid')
  const [givenVolVal, setGivenVolVal] = useState('')
  const [givenMolVal, setGivenMolVal] = useState('')
  const [solveFor,    setSolveFor]    = useState<'volume' | 'molarity'>('volume')
  const [knownVal,    setKnownVal]    = useState('')
  const [steps,       setSteps]       = useState<string[]>([])
  const [result,      setResult]      = useState<string | null>(null)
  const [resultUnit,  setResultUnit]  = useState('mL')
  const [error,       setError]       = useState('')

  const pair = ACID_BASE_PAIRS[pairIdx]
  const solvingSide = givenSide === 'acid' ? 'base' : 'acid'
  const givenLabel   = givenSide === 'acid' ? pair.acid.formula : pair.base.formula
  const solvingLabel = solvingSide === 'acid' ? pair.acid.formula : pair.base.formula
  const knownLabel   = solveFor === 'volume' ? `Molarity of ${solvingLabel} (M)` : `Volume of ${solvingLabel} (mL)`
  const acidPerBase  = pair.base.equivalents / pair.acid.equivalents

  function reset() { setSteps([]); setResult(null); setError('') }

  const generateExample = useCallback(() => {
    const p = generateAcidBasePracticeProblem()
    return { scenario: p.scenario, steps: p.steps, result: `${fmt(p.answer)} ${p.answerUnit}` }
  }, [])

  const stepsState = useStepsPanelState(steps, generateExample)

  function handleCalc() {
    reset()
    const gVol = parseFloat(givenVolVal)
    const gMol = parseFloat(givenMolVal)
    const kVal = parseFloat(knownVal)
    if (isNaN(gVol) || isNaN(gMol) || isNaN(kVal)) { setError('Enter all three values.'); return }
    if (gVol <= 0 || gMol <= 0 || kVal <= 0) { setError('All values must be positive.'); return }

    const sol = solveAcidBaseTitration(
      acidPerBase, pair.equation, pair.acid.formula, pair.base.formula,
      { side: givenSide,  volumeML: gVol, molarity: gMol },
      { side: solvingSide, unknown: solveFor, known: kVal },
    )
    setSteps(sol.steps)
    setResult(fmt(sol.answer))
    setResultUnit(sol.answerUnit)
  }

  const canCalc = givenVolVal.trim() !== '' && givenMolVal.trim() !== '' && knownVal.trim() !== ''

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Pair picker */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Reaction</label>
        <select value={pairIdx} onChange={e => { setPairIdx(Number(e.target.value)); reset() }}
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-accent/40">
          {ACID_BASE_PAIRS.map((p, i) => (
            <option key={i} value={i}>{p.acid.formula} + {p.base.formula}</option>
          ))}
        </select>
        <p className="font-mono text-xs text-secondary">{pair.equation}</p>
      </div>

      {/* Given side */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Known side</label>
        <div className="flex items-center gap-1">
          {(['acid', 'base'] as const).map(s => (
            <UnitBtn key={s} u={s === 'acid' ? `Acid (${pair.acid.formula})` : `Base (${pair.base.formula})`}
              cur={s === 'acid' ? `Acid (${pair.acid.formula})` : givenSide === 'base' ? `Base (${pair.base.formula})` : ''}
              set={() => { setGivenSide(s); reset() }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={`Volume of ${givenLabel} (mL)`} value={givenVolVal}
            onChange={v => { setGivenVolVal(sanitize(v)); reset() }} placeholder="e.g. 25.0"
            unit={<span className="font-mono text-sm text-secondary px-2">mL</span>} />
          <NumberField label={`Molarity of ${givenLabel} (M)`} value={givenMolVal}
            onChange={v => { setGivenMolVal(sanitize(v)); reset() }} placeholder="e.g. 0.500"
            unit={<span className="font-mono text-sm text-secondary px-2">M</span>} />
        </div>
      </div>

      {/* Solving for */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Solving for</label>
        <div className="flex items-center gap-1">
          <UnitBtn u={`Volume of ${solvingLabel}`} cur={solveFor === 'volume' ? `Volume of ${solvingLabel}` : ''}
            set={() => { setSolveFor('volume'); reset() }} />
          <UnitBtn u={`Molarity of ${solvingLabel}`} cur={solveFor === 'molarity' ? `Molarity of ${solvingLabel}` : ''}
            set={() => { setSolveFor('molarity'); reset() }} />
        </div>
        <NumberField label={knownLabel} value={knownVal}
          onChange={v => { setKnownVal(sanitize(v)); reset() }}
          placeholder={solveFor === 'volume' ? 'e.g. 0.300' : 'e.g. 35.0'}
          unit={<span className="font-mono text-sm text-secondary px-2">{solveFor === 'volume' ? 'M' : 'mL'}</span>} />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalc} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color:      'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && <ResultDisplay label={solveFor === 'volume' ? `Volume of ${solvingLabel}` : `Molarity of ${solvingLabel}`}
        value={result} unit={resultUnit} />}

      <p className="font-mono text-xs text-secondary">
        moles H⁺ = moles OH⁻ at equivalence · M·V·equiv = constant
      </p>
    </div>
  )
}

// ── Redox Practice ─────────────────────────────────────────────────────────────

function RedoxPracticeMode() {
  const [pairIdx,     setPairIdx]     = useState(0)
  const [givenSide,   setGivenSide]   = useState<'oxidizer' | 'reducer'>('reducer')
  const [givenVolVal, setGivenVolVal] = useState('')
  const [givenMolVal, setGivenMolVal] = useState('')
  const [solveFor,    setSolveFor]    = useState<'volume' | 'molarity'>('volume')
  const [knownVal,    setKnownVal]    = useState('')
  const [steps,       setSteps]       = useState<string[]>([])
  const [result,      setResult]      = useState<string | null>(null)
  const [resultUnit,  setResultUnit]  = useState('mL')
  const [error,       setError]       = useState('')

  const pair = REDOX_PAIRS[pairIdx]
  const solvingSide  = givenSide === 'oxidizer' ? 'reducer' : 'oxidizer'
  const givenLabel   = givenSide === 'oxidizer' ? pair.oxidizer.formula : pair.reducer.formula
  const solvingLabel = solvingSide === 'oxidizer' ? pair.oxidizer.formula : pair.reducer.formula
  const knownLabel   = solveFor === 'volume' ? `Molarity of ${solvingLabel} (M)` : `Volume of ${solvingLabel} (mL)`

  function reset() { setSteps([]); setResult(null); setError('') }

  const generateExample = useCallback(() => {
    const p = generateRedoxPracticeProblem()
    return { scenario: p.scenario, steps: p.steps, result: `${fmt(p.answer)} ${p.answerUnit}` }
  }, [])

  const stepsState = useStepsPanelState(steps, generateExample)

  function handleCalc() {
    reset()
    const gVol = parseFloat(givenVolVal)
    const gMol = parseFloat(givenMolVal)
    const kVal = parseFloat(knownVal)
    if (isNaN(gVol) || isNaN(gMol) || isNaN(kVal)) { setError('Enter all three values.'); return }
    if (gVol <= 0 || gMol <= 0 || kVal <= 0) { setError('All values must be positive.'); return }

    const sol = solveRedoxTitration(
      pair.oxidizer.electronsPerMole, pair.reducer.electronsPerMole,
      pair.equation, pair.oxidizer.formula, pair.reducer.formula,
      { side: givenSide,  volumeML: gVol, molarity: gMol },
      { side: solvingSide, unknown: solveFor, known: kVal },
    )
    setSteps(sol.steps)
    setResult(fmt(sol.answer))
    setResultUnit(sol.answerUnit)
  }

  const canCalc = givenVolVal.trim() !== '' && givenMolVal.trim() !== '' && knownVal.trim() !== ''

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Pair picker */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Redox system</label>
        <select value={pairIdx} onChange={e => { setPairIdx(Number(e.target.value)); reset() }}
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-accent/40">
          {REDOX_PAIRS.map((p, i) => (
            <option key={i} value={i}>{p.oxidizer.formula} / {p.reducer.formula} ({p.conditions})</option>
          ))}
        </select>
        <p className="font-mono text-xs text-secondary">{pair.equation}</p>
      </div>

      {/* Given side */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Known side</label>
        <div className="flex items-center gap-1">
          {(['oxidizer', 'reducer'] as const).map(s => {
            const lbl = s === 'oxidizer' ? `Oxidizer (${pair.oxidizer.formula})` : `Reducer (${pair.reducer.formula})`
            return (
              <UnitBtn key={s} u={lbl} cur={givenSide === s ? lbl : ''} set={() => { setGivenSide(s); reset() }} />
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label={`Volume of ${givenLabel} (mL)`} value={givenVolVal}
            onChange={v => { setGivenVolVal(sanitize(v)); reset() }} placeholder="e.g. 20.00"
            unit={<span className="font-mono text-sm text-secondary px-2">mL</span>} />
          <NumberField label={`Molarity of ${givenLabel} (M)`} value={givenMolVal}
            onChange={v => { setGivenMolVal(sanitize(v)); reset() }} placeholder="e.g. 0.100"
            unit={<span className="font-mono text-sm text-secondary px-2">M</span>} />
        </div>
      </div>

      {/* Solving for */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Solving for</label>
        <div className="flex items-center gap-1">
          <UnitBtn u={`Volume of ${solvingLabel}`} cur={solveFor === 'volume' ? `Volume of ${solvingLabel}` : ''}
            set={() => { setSolveFor('volume'); reset() }} />
          <UnitBtn u={`Molarity of ${solvingLabel}`} cur={solveFor === 'molarity' ? `Molarity of ${solvingLabel}` : ''}
            set={() => { setSolveFor('molarity'); reset() }} />
        </div>
        <NumberField label={knownLabel} value={knownVal}
          onChange={v => { setKnownVal(sanitize(v)); reset() }}
          placeholder={solveFor === 'volume' ? 'e.g. 0.0200' : 'e.g. 25.0'}
          unit={<span className="font-mono text-sm text-secondary px-2">{solveFor === 'volume' ? 'M' : 'mL'}</span>} />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button onClick={handleCalc} disabled={!canCalc}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color:      'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>

      <StepsContent {...stepsState} />

      {result && <ResultDisplay label={solveFor === 'volume' ? `Volume of ${solvingLabel}` : `Molarity of ${solvingLabel}`}
        value={result} unit={resultUnit} />}

      <p className="font-mono text-xs text-secondary">
        e⁻ balance: n_ox × e⁻/mol = n_red × e⁻/mol
      </p>
    </div>
  )
}

// ── Problems mode ──────────────────────────────────────────────────────────────

function ProblemsMode() {
  const [tMode,      setTMode]      = useState<TMode>('acid-base')
  const [problem,    setProblem]    = useState(() => generateAcidBasePracticeProblem())
  const [answerVal,  setAnswerVal]  = useState('')
  const [verify,     setVerify]     = useState<VerifyState>(null)
  const [steps,      setSteps]      = useState<string[]>([])

  const stepsState = useStepsPanelState(steps)

  function newProblem(mode: TMode) {
    const p = mode === 'acid-base' ? generateAcidBasePracticeProblem() : generateRedoxPracticeProblem()
    setProblem(p)
    setAnswerVal('')
    setVerify(null)
    setSteps([])
  }

  function handleModeChange(m: TMode) {
    setTMode(m)
    newProblem(m)
  }

  function handleCheck() {
    const student = parseFloat(answerVal)
    if (isNaN(student)) return
    const pctErr = Math.abs(student - problem.answer) / Math.abs(problem.answer)
    setVerify(pctErr <= 0.01 ? 'correct' : 'incorrect')
    setSteps(problem.steps)
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center gap-3 flex-wrap">
        <ModeToggle mode={tMode} setMode={handleModeChange} />
        <button onClick={() => newProblem(tMode)}
          className="px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'rgb(var(--color-raised))',
            border: '1px solid rgb(var(--color-border))',
            color: 'rgba(var(--overlay),0.6)',
          }}>
          New Problem
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={problem.scenario} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="p-4 rounded-sm font-sans text-sm text-primary leading-relaxed"
          style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
          {problem.scenario}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-2">
        <NumberField label={`Your answer (${problem.answerUnit})`} value={answerVal}
          onChange={v => { setAnswerVal(sanitize(v)); setVerify(null); setSteps([]) }}
          placeholder={`in ${problem.answerUnit}`}
          unit={<span className="font-mono text-sm text-secondary px-2">{problem.answerUnit}</span>} />
        <div className="flex items-stretch gap-2">
          <button onClick={handleCheck} disabled={answerVal.trim() === ''}
            className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
              color:      'var(--c-halogen)',
            }}>
            Check
          </button>
          <StepsTrigger {...stepsState} />
        </div>
      </div>

      <StepsContent {...stepsState} />

      {verify !== null && (
        <ResultDisplay
          label={problem.answerUnit === 'mL' ? 'Volume' : 'Molarity'}
          value={fmt(problem.answer)}
          unit={problem.answerUnit}
          verified={verify}
        />
      )}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────────────────

interface Props {
  allowCustom?: boolean
}

export default function TitrationArithmeticTool({ allowCustom = true }: Props) {
  const [tMode, setTMode] = useState<TMode>('acid-base')

  if (!allowCustom) return <ProblemsMode />

  return (
    <div className="flex flex-col gap-5">
      <ModeToggle mode={tMode} setMode={setTMode} />

      <AnimatePresence mode="wait">
        <motion.div key={tMode} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tMode === 'acid-base' ? <AcidBasePractice /> : <RedoxPracticeMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

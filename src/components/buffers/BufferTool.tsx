import { useState } from 'react'
import { bufferPh, bufferAfterAddition } from '../../chem/buffers'
import { WEAK_ACIDS } from '../../data/acidBaseConstants'
import NumberField from '../shared/NumberField'
import PhScale from '../shared/PhScale'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import ResultDisplay from '../shared/ResultDisplay'

const DEFAULT_ACID = WEAK_ACIDS.find(a => a.formula === 'CH₃COOH') ?? WEAK_ACIDS[0]

function buildWorkedExample() {
  const pKa = 4.74
  const concAcid = 0.10
  const concBase = 0.10
  const result = bufferPh(pKa, concAcid, concBase)
  return {
    scenario: `A buffer contains 0.10 M acetic acid (CH₃COOH, pKa = 4.74) and 0.10 M sodium acetate. Calculate the buffer pH.`,
    steps: result.steps,
    result: `pH = ${result.pH.toFixed(2)}`,
  }
}

function buildAdditionExample() {
  const pKa = 4.74
  const concAcid = 0.10
  const concBase = 0.10
  const result = bufferAfterAddition(concAcid, concBase, 1.0, pKa, { type: 'acid', moles: 0.010 })
  return {
    scenario: `After adding 0.010 mol of HCl to 1.00 L of the acetic acid / acetate buffer (both 0.10 M), what is the new pH?`,
    steps: result.steps,
    result: `New pH = ${result.newPh.toFixed(2)}`,
  }
}

export default function BufferTool() {
  const [selectedAcid, setSelectedAcid] = useState(DEFAULT_ACID)
  const [concAcid, setConcAcid]   = useState('0.10')
  const [concBase, setConcBase]   = useState('0.10')

  // Addition mode
  const [showAddition, setShowAddition] = useState(false)
  const [volumeL, setVolumeL]           = useState('1.000')
  const [addType, setAddType]           = useState<'acid' | 'base'>('acid')
  const [addMoles, setAddMoles]         = useState('0.010')

  const [steps,     setSteps]     = useState<string[]>([])
  const [result,    setResult]    = useState<number | null>(null)
  const [error,     setError]     = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, showAddition ? buildAdditionExample : buildWorkedExample)

  function reset() {
    setSteps([])
    setResult(null)
    setError(null)
  }

  function handleCalculate() {
    reset()
    const ca = parseFloat(concAcid)
    const cb = parseFloat(concBase)
    const pKa = selectedAcid.pKa

    if (!isFinite(ca) || ca <= 0 || !isFinite(cb) || cb <= 0) {
      setError('Enter positive concentrations for both components.')
      return
    }

    try {
      if (showAddition) {
        const vL = parseFloat(volumeL)
        const mol = parseFloat(addMoles)
        if (!isFinite(vL) || vL <= 0 || !isFinite(mol) || mol <= 0) {
          setError('Enter valid volume and moles.')
          return
        }
        const r = bufferAfterAddition(ca, cb, vL, pKa, { type: addType, moles: mol })
        setSteps(r.steps)
        setResult(r.newPh)
      } else {
        const r = bufferPh(pKa, ca, cb)
        setSteps(r.steps)
        setResult(r.pH)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Acid selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Weak Acid / Conjugate Base Pair</label>
        <select
          value={selectedAcid.formula}
          onChange={e => {
            const a = WEAK_ACIDS.find(x => x.formula === e.target.value)
            if (a) { setSelectedAcid(a); reset() }
          }}
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-accent/40"
        >
          {WEAK_ACIDS.map(a => (
            <option key={a.formula} value={a.formula}>
              {a.formula} / {a.conjugateBase}  (pKa = {a.pKa.toFixed(2)})
            </option>
          ))}
        </select>
        <p className="font-mono text-xs text-dim">pKa = {selectedAcid.pKa.toFixed(2)}</p>
      </div>

      {/* Concentrations */}
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={`[${selectedAcid.formula}]`}
          value={concAcid}
          onChange={v => { setConcAcid(v); reset() }}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.10"
        />
        <NumberField
          label={`[${selectedAcid.conjugateBase}]`}
          value={concBase}
          onChange={v => { setConcBase(v); reset() }}
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
          placeholder="0.10"
        />
      </div>

      {/* Addition mode toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setShowAddition(false); reset() }}
          className={`px-3 py-1.5 rounded-sm font-sans text-sm border transition-colors ${
            !showAddition
              ? 'border-transparent text-bright'
              : 'border-border text-secondary hover:text-primary'
          }`}
          style={!showAddition ? {
            background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
            color: 'var(--c-halogen)',
          } : {}}
        >
          Buffer pH
        </button>
        <button
          onClick={() => { setShowAddition(true); reset() }}
          className={`px-3 py-1.5 rounded-sm font-sans text-sm border transition-colors ${
            showAddition
              ? 'border-transparent text-bright'
              : 'border-border text-secondary hover:text-primary'
          }`}
          style={showAddition ? {
            background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
            borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
            color: 'var(--c-halogen)',
          } : {}}
        >
          After Addition
        </button>
      </div>

      {/* Addition inputs */}
      {showAddition && (
        <div className="flex flex-col gap-3 p-3 rounded-sm border border-border bg-raised">
          <p className="font-sans text-xs text-secondary">Add strong acid or base to the buffer:</p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Buffer Volume"
              value={volumeL}
              onChange={v => { setVolumeL(v); reset() }}
              unit={<span className="font-mono text-xs text-secondary px-2">L</span>}
              placeholder="1.000"
            />
            <NumberField
              label="Moles added"
              value={addMoles}
              onChange={v => { setAddMoles(v); reset() }}
              unit={<span className="font-mono text-xs text-secondary px-2">mol</span>}
              placeholder="0.010"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-sans text-sm text-secondary">Adding:</label>
            <select
              value={addType}
              onChange={e => { setAddType(e.target.value as 'acid' | 'base'); reset() }}
              className="font-mono text-sm bg-surface border border-border rounded-sm px-2 py-1 text-primary focus:outline-none"
            >
              <option value="acid">Strong acid (HCl)</option>
              <option value="base">Strong base (NaOH)</option>
            </select>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-stretch gap-2">
        <button
          onClick={handleCalculate}
          className="flex-1 py-2 px-4 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      {error && (
        <p className="font-sans text-sm text-red-400">{error}</p>
      )}

      {result !== null && !error && (
        <>
          <ResultDisplay
            label={showAddition ? 'New Buffer pH' : 'Buffer pH'}
            value={result.toFixed(2)}
            unit=""
          />
          <PhScale pH={result} label="Buffer" />
        </>
      )}
    </div>
  )
}

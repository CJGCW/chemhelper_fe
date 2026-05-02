import { useState } from 'react'
import { kspToSolubility, solubilityToKsp } from '../../chem/solubility'
import { KSP_TABLE } from '../../data/kspValues'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

type Mode = 'ksp-to-s' | 's-to-ksp'

function fmtSci(n: number): string {
  return n.toExponential(4)
}

function buildWorkedExample() {
  const r = kspToSolubility(1.8e-10, 1, 1)
  return {
    scenario: 'Calculate the molar solubility of AgCl in pure water. Ksp = 1.8 × 10⁻¹⁰',
    steps: r.steps,
    result: `s = ${r.solubility.toExponential(3)} M`,
  }
}

export default function KspTool() {
  const [mode,         setMode]         = useState<Mode>('ksp-to-s')
  const [fromTable,    setFromTable]     = useState(true)
  const [selectedSalt, setSelectedSalt]  = useState(KSP_TABLE[0])

  // Manual inputs
  const [kspStr,       setKspStr]        = useState('1.8e-10')
  const [solStr,       setSolStr]        = useState('')
  const [cationCount,  setCationCount]   = useState('1')
  const [anionCount,   setAnionCount]    = useState('1')

  const [steps,   setSteps]   = useState<string[]>([])
  const [result,  setResult]  = useState<number | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  const stepsState = useStepsPanelState(steps, buildWorkedExample)

  function reset() { setSteps([]); setResult(null); setError(null) }

  function handleCalculate() {
    reset()
    try {
      const m = fromTable ? selectedSalt.cation.count : parseInt(cationCount)
      const n = fromTable ? selectedSalt.anion.count  : parseInt(anionCount)

      if (!isFinite(m) || m < 1 || !isFinite(n) || n < 1) {
        setError('Ion counts must be positive integers.')
        return
      }

      if (mode === 'ksp-to-s') {
        const Ksp = fromTable ? selectedSalt.Ksp : parseFloat(kspStr)
        if (!isFinite(Ksp) || Ksp <= 0) { setError('Enter a valid Ksp.'); return }
        const r = kspToSolubility(Ksp, m, n)
        setSteps(r.steps)
        setResult(r.solubility)
      } else {
        const s = parseFloat(solStr)
        if (!isFinite(s) || s <= 0) { setError('Enter a valid molar solubility.'); return }
        const r = solubilityToKsp(s, m, n)
        setSteps(r.steps)
        setResult(r.Ksp)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error')
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {([['ksp-to-s', 'Ksp → Solubility'], ['s-to-ksp', 'Solubility → Ksp']] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset() }}
            className="px-3 py-1.5 rounded-sm font-sans text-sm border transition-colors"
            style={mode === m ? {
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            } : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-secondary))' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Source toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setFromTable(true); reset() }}
          className={`text-sm px-3 py-1 rounded-sm border transition-colors ${fromTable ? 'border-border text-primary' : 'border-border/50 text-dim hover:text-secondary'}`}
        >
          From table
        </button>
        <button
          onClick={() => { setFromTable(false); reset() }}
          className={`text-sm px-3 py-1 rounded-sm border transition-colors ${!fromTable ? 'border-border text-primary' : 'border-border/50 text-dim hover:text-secondary'}`}
        >
          Enter manually
        </button>
      </div>

      {fromTable ? (
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-primary">Select Salt</label>
          <select
            value={selectedSalt.formula}
            onChange={e => {
              const entry = KSP_TABLE.find(x => x.formula === e.target.value)
              if (entry) { setSelectedSalt(entry); reset() }
            }}
            className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary focus:outline-none"
          >
            {KSP_TABLE.map(e => (
              <option key={e.formula} value={e.formula}>
                {e.formula}  ({e.name})  Ksp = {e.Ksp.toExponential(2)}
              </option>
            ))}
          </select>
          <p className="font-mono text-xs text-dim">
            {selectedSalt.cation.count}{selectedSalt.cation.formula} + {selectedSalt.anion.count}{selectedSalt.anion.formula}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Cation count (m)"
              value={cationCount}
              onChange={v => { setCationCount(v); reset() }}
              placeholder="1"
            />
            <NumberField
              label="Anion count (n)"
              value={anionCount}
              onChange={v => { setAnionCount(v); reset() }}
              placeholder="1"
            />
          </div>
          {mode === 'ksp-to-s' && (
            <NumberField
              label="Ksp"
              value={kspStr}
              onChange={v => { setKspStr(v); reset() }}
              placeholder="1.8e-10"
              hint="Scientific notation: 1.8e-10"
            />
          )}
          {mode === 's-to-ksp' && (
            <NumberField
              label="Molar solubility (M)"
              value={solStr}
              onChange={v => { setSolStr(v); reset() }}
              placeholder="1.34e-5"
              unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
            />
          )}
        </div>
      )}

      {mode === 's-to-ksp' && fromTable && (
        <NumberField
          label="Molar solubility (M)"
          value={solStr}
          onChange={v => { setSolStr(v); reset() }}
          placeholder="1.34e-5"
          unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
        />
      )}

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

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      {result !== null && (
        <ResultDisplay
          label={mode === 'ksp-to-s' ? 'Molar Solubility' : 'Ksp'}
          value={fmtSci(result)}
          unit={mode === 'ksp-to-s' ? 'M' : ''}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import NumberField from '../shared/NumberField'
import { kaToKb, kbToKa } from '../../chem/acidBase'
import { Kw } from '../../data/acidBaseConstants'

type ConvertMode = 'ka-to-kb' | 'kb-to-ka' | 'pka-to-ka' | 'pka-to-pkb' | 'ka-to-pka'

export default function KaKbTool() {
  const [mode, setMode] = useState<ConvertMode>('ka-to-kb')
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ label: string; value: number; steps: string[] } | null>(null)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MODES: { id: ConvertMode; label: string; inputLabel: string; placeholder: string }[] = [
    { id: 'ka-to-kb',   label: 'Ka → Kb',   inputLabel: 'Ka',  placeholder: 'e.g. 1.8e-5' },
    { id: 'kb-to-ka',   label: 'Kb → Ka',   inputLabel: 'Kb',  placeholder: 'e.g. 1.8e-5' },
    { id: 'pka-to-ka',  label: 'pKa → Ka',  inputLabel: 'pKa', placeholder: 'e.g. 4.74'   },
    { id: 'ka-to-pka',  label: 'Ka → pKa',  inputLabel: 'Ka',  placeholder: 'e.g. 1.8e-5' },
    { id: 'pka-to-pkb', label: 'pKa → pKb', inputLabel: 'pKa', placeholder: 'e.g. 4.74'   },
  ]

  function handleCalculate() {
    setError(null)
    const val = parseFloat(input)
    if (!isFinite(val)) { setError('Enter a valid number.'); return }

    try {
      if (mode === 'ka-to-kb') {
        if (val <= 0) { setError('Ka must be positive.'); return }
        const Kb = kaToKb(val)
        const steps = [
          `Kw = Ka × Kb`,
          `Kb = Kw / Ka = ${Kw.toExponential(1)} / ${val.toExponential(2)} = ${Kb.toExponential(3)}`,
          `pKb = −log(${Kb.toExponential(3)}) = ${(-Math.log10(Kb)).toFixed(2)}`,
        ]
        setResult({ label: 'Kb', value: Kb, steps })
      } else if (mode === 'kb-to-ka') {
        if (val <= 0) { setError('Kb must be positive.'); return }
        const Ka = kbToKa(val)
        const steps = [
          `Kw = Ka × Kb`,
          `Ka = Kw / Kb = ${Kw.toExponential(1)} / ${val.toExponential(2)} = ${Ka.toExponential(3)}`,
          `pKa = −log(${Ka.toExponential(3)}) = ${(-Math.log10(Ka)).toFixed(2)}`,
        ]
        setResult({ label: 'Ka', value: Ka, steps })
      } else if (mode === 'pka-to-ka') {
        const Ka = Math.pow(10, -val)
        const steps = [
          `Ka = 10^(−pKa) = 10^(−${val}) = ${Ka.toExponential(3)}`,
        ]
        setResult({ label: 'Ka', value: Ka, steps })
      } else if (mode === 'ka-to-pka') {
        if (val <= 0) { setError('Ka must be positive.'); return }
        const pKa = -Math.log10(val)
        const steps = [
          `pKa = −log(Ka) = −log(${val.toExponential(2)}) = ${pKa.toFixed(2)}`,
        ]
        setResult({ label: 'pKa', value: pKa, steps })
      } else if (mode === 'pka-to-pkb') {
        const pKb = 14 - val
        const steps = [
          `pKa + pKb = 14   (at 25°C)`,
          `pKb = 14 − pKa = 14 − ${val} = ${pKb.toFixed(2)}`,
        ]
        setResult({ label: 'pKb', value: pKb, steps })
      }
    } catch {
      setError('Calculation error.')
    }
  }

  const currentMode = MODES.find(m => m.id === mode)!

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Mode selector */}
      <div className="flex gap-1 flex-wrap">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(null); setError(null) }}
            className="relative px-3 py-1.5 rounded-full font-mono text-xs font-medium transition-colors"
            style={{
              color: mode === m.id ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
              background: mode === m.id ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'transparent',
              border: mode === m.id ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid transparent',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <NumberField
        label={currentMode.inputLabel}
        value={input}
        onChange={v => { setInput(v); setResult(null); setError(null) }}
        placeholder={currentMode.placeholder}
      />

      <div className="flex items-stretch gap-2">
        <button
          onClick={handleCalculate}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          Convert
        </button>
        {result && (
          <button
            onClick={() => setStepsOpen(o => !o)}
            className="px-4 py-2 rounded-sm font-sans text-sm font-medium border border-border text-secondary hover:text-primary transition-colors"
          >
            {stepsOpen ? 'Hide Steps' : 'Show Steps'}
          </button>
        )}
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {stepsOpen && result && (
        <div className="flex flex-col gap-1 p-3 rounded-sm border border-border"
          style={{ background: 'rgb(var(--color-surface))' }}>
          {result.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary leading-relaxed">{s}</p>
          ))}
        </div>
      )}

      {result && (
        <div className="flex flex-col items-center gap-1 p-4 rounded-sm border border-border"
          style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-3xl font-bold" style={{ color: 'var(--c-halogen)' }}>
            {result.value < 1e-2 && result.value > 0
              ? result.value.toExponential(3)
              : result.value.toFixed(result.label.startsWith('p') ? 2 : 4)}
          </p>
          <p className="font-mono text-sm text-secondary">{result.label}</p>
        </div>
      )}
    </div>
  )
}

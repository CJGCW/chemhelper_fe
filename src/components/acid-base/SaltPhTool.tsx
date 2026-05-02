import { useState } from 'react'
import NumberField from '../shared/NumberField'
import PhScale from '../shared/PhScale'
import { saltPh } from '../../chem/acidBase'

interface SaltPreset {
  label: string
  acidType: 'strong' | 'weak'
  baseType: 'strong' | 'weak'
  Ka?: number
  Kb?: number
}

const SALT_PRESETS: SaltPreset[] = [
  { label: 'NaCl',        acidType: 'strong', baseType: 'strong'                           },
  { label: 'KNO₃',       acidType: 'strong', baseType: 'strong'                           },
  { label: 'NaCH₃COO',  acidType: 'weak',   baseType: 'strong', Ka: 1.8e-5               },
  { label: 'NaF',        acidType: 'weak',   baseType: 'strong', Ka: 6.8e-4               },
  { label: 'NaCN',       acidType: 'weak',   baseType: 'strong', Ka: 6.2e-10              },
  { label: 'NH₄Cl',     acidType: 'strong', baseType: 'weak',   Kb: 1.8e-5               },
  { label: 'NH₄F',      acidType: 'weak',   baseType: 'weak',   Ka: 6.8e-4, Kb: 1.8e-5  },
  { label: 'NH₄CH₃COO', acidType: 'weak',   baseType: 'weak',   Ka: 1.8e-5, Kb: 1.8e-5  },
  { label: 'Manual',     acidType: 'weak',   baseType: 'weak'                             },
]

export default function SaltPhTool() {
  const [selectedPreset, setSelectedPreset] = useState<string>('NaCl')
  const [concentration, setConcentration] = useState('')
  const [acidType, setAcidType] = useState<'strong' | 'weak'>('strong')
  const [baseType, setBaseType] = useState<'strong' | 'weak'>('strong')
  const [kaInput, setKaInput] = useState('')
  const [kbInput, setKbInput] = useState('')
  const [result, setResult] = useState<{
    pH: number; classification: 'acidic' | 'basic' | 'neutral'; steps: string[]
  } | null>(null)
  const [stepsOpen, setStepsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function applyPreset(label: string) {
    const preset = SALT_PRESETS.find(p => p.label === label)
    if (!preset) return
    setSelectedPreset(label)
    setAcidType(preset.acidType)
    setBaseType(preset.baseType)
    setKaInput(preset.Ka ? preset.Ka.toExponential(1) : '')
    setKbInput(preset.Kb ? preset.Kb.toExponential(1) : '')
    setResult(null)
    setError(null)
  }

  function handleCalculate() {
    setError(null)
    const C = parseFloat(concentration)
    if (!isFinite(C) || C <= 0) { setError('Enter a valid concentration.'); return }

    const Ka = acidType === 'weak' ? parseFloat(kaInput) : undefined
    const Kb = baseType === 'weak' ? parseFloat(kbInput) : undefined

    if (acidType === 'weak' && (!Ka || !isFinite(Ka) || Ka <= 0)) {
      setError('Enter a valid Ka for the parent acid.'); return
    }
    if (baseType === 'weak' && (!Kb || !isFinite(Kb) || Kb <= 0)) {
      setError('Enter a valid Kb for the parent base.'); return
    }

    try {
      const res = saltPh(C, { type: acidType, Ka }, { type: baseType, Kb })
      setResult(res)
    } catch {
      setError('Calculation error.')
    }
  }

  const classColor = result?.classification === 'basic' ? '#6366f1'
    : result?.classification === 'acidic' ? '#ef4444'
    : '#22c55e'

  const isManual = selectedPreset === 'Manual'

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Salt selector */}
      <div className="flex flex-col gap-1">
        <label className="font-mono text-xs text-secondary">Select a common salt</label>
        <div className="flex flex-wrap gap-1">
          {SALT_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.label)}
              className="px-3 py-1 rounded-full font-mono text-xs transition-colors"
              style={{
                color: selectedPreset === p.label ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
                background: selectedPreset === p.label ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))' : 'transparent',
                border: selectedPreset === p.label ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' : '1px solid rgb(var(--color-border))',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual acid/base type */}
      {isManual && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">Parent Acid</label>
            <select
              value={acidType}
              onChange={e => { setAcidType(e.target.value as 'strong' | 'weak'); setResult(null) }}
              className="font-mono text-sm px-3 py-1.5 rounded-sm border border-border bg-raised text-primary focus:outline-none"
            >
              <option value="strong">Strong</option>
              <option value="weak">Weak</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-secondary">Parent Base</label>
            <select
              value={baseType}
              onChange={e => { setBaseType(e.target.value as 'strong' | 'weak'); setResult(null) }}
              className="font-mono text-sm px-3 py-1.5 rounded-sm border border-border bg-raised text-primary focus:outline-none"
            >
              <option value="strong">Strong</option>
              <option value="weak">Weak</option>
            </select>
          </div>
        </div>
      )}

      <NumberField
        label="Salt Concentration (M)"
        value={concentration}
        onChange={v => { setConcentration(v); setResult(null) }}
        placeholder="e.g. 0.10"
        unit="M"
      />

      {(acidType === 'weak' || isManual) && acidType === 'weak' && (
        <NumberField
          label="Ka of parent acid"
          value={kaInput}
          onChange={v => { setKaInput(v); setResult(null) }}
          placeholder="e.g. 1.8e-5"
        />
      )}
      {(baseType === 'weak' || isManual) && baseType === 'weak' && (
        <NumberField
          label="Kb of parent base"
          value={kbInput}
          onChange={v => { setKbInput(v); setResult(null) }}
          placeholder="e.g. 1.8e-5"
        />
      )}

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
          Calculate pH
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
        <div className="flex flex-col gap-1 p-3 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          {result.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary leading-relaxed">{s}</p>
          ))}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-raised))' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-4xl font-bold" style={{ color: 'var(--c-halogen)' }}>
                {result.pH.toFixed(2)}
              </p>
              <p className="font-mono text-sm text-secondary mt-1">pH</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold capitalize" style={{ color: classColor }}>
                {result.classification}
              </p>
              <p className="font-mono text-xs text-secondary">solution type</p>
            </div>
          </div>
          <PhScale pH={result.pH} />
        </div>
      )}
    </div>
  )
}

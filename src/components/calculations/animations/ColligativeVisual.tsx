import { useState } from 'react'
import Beaker from './Beaker'
import Thermometer from './Thermometer'
import { ANIMATION_RESTART_DELAY_MS } from '../../../utils/calcHelpers'

const WATER = { bp: 100.0, fp: 0.0, kb: 0.512, kf: 1.86 }

const MOLALITY_PRESETS = [0.5, 1.0, 2.0, 3.0]

const I_PRESETS = [
  { label: 'i = 1', i: 1, note: 'glucose, urea' },
  { label: 'i = 2', i: 2, note: 'NaCl, KCl'    },
  { label: 'i = 3', i: 3, note: 'CaCl₂, Na₂SO₄'},
]

export function ColligativeVisual({ mode }: { mode: 'bpe' | 'fpd' }) {
  const [molality, setMolality] = useState(1.0)
  const [iVal, setIVal]         = useState(2)
  const [playing, setPlaying]   = useState(false)

  const K      = mode === 'bpe' ? WATER.kb : WATER.kf
  const baseT  = mode === 'bpe' ? WATER.bp : WATER.fp
  const dSym   = mode === 'bpe' ? 'ΔTb' : 'ΔTf'
  const deltaT = iVal * K * molality
  const newT   = mode === 'bpe' ? baseT + deltaT : baseT - deltaT

  function triggerPlay() {
    setPlaying(false)
    setTimeout(() => setPlaying(true), ANIMATION_RESTART_DELAY_MS)
  }

  function selectMolality(m: number) {
    setMolality(m)
    triggerPlay()
  }

  const pillBase = 'px-3 py-1.5 rounded-sm font-sans text-xs transition-colors border'

  function pillStyle(active: boolean) {
    return {
      background:   active ? 'color-mix(in srgb, var(--c-halogen) 14%, #141620)' : '#0e1016',
      borderColor:  active ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '#1c1f2e',
      color:        active ? 'var(--c-halogen)' : 'rgba(255,255,255,0.45)',
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs text-secondary">Molality (b)</p>
          <div className="flex gap-1.5 flex-wrap">
            {MOLALITY_PRESETS.map(m => (
              <button key={m} onClick={() => selectMolality(m)}
                className={pillBase} style={pillStyle(molality === m)}>
                {m} mol/kg
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs text-secondary">Van't Hoff factor</p>
          <div className="flex gap-1.5 flex-wrap">
            {I_PRESETS.map(p => (
              <button key={p.i} onClick={() => setIVal(p.i)}
                className={`${pillBase} flex flex-col items-start`} style={pillStyle(iVal === p.i)}>
                <span className="font-medium">{p.label}</span>
                <span className="font-mono text-[10px] opacity-60">{p.note}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="flex items-center gap-2 flex-wrap px-3 py-2 rounded-sm border border-border"
        style={{ background: '#0a0c12' }}>
        <span className="font-mono text-xs text-secondary">
          {dSym} = {iVal} × {K} × {molality} =
        </span>
        <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
          {deltaT.toFixed(3)} °C
        </span>
        <span className="font-mono text-xs text-secondary">
          → {mode === 'bpe' ? 'b.p.' : 'f.p.'} = {newT.toFixed(3)} °C
        </span>
      </div>

      {/* Beaker + Thermometer */}
      <div className="flex items-end justify-center gap-4">
        <div className="min-w-0 flex-1 max-w-[420px]">
          <Beaker
            liquidAmount={0.5}
            concentration={molality * iVal}
            concMax={9}
            concUnit="mol/kg"
            concDisplay={null}
            moles={molality * 0.5}
            playing={playing}
            onComplete={() => setPlaying(false)}
          />
        </div>
        <div className="w-[200px] shrink-0">
          <Thermometer temperature={newT} pureTemperature={baseT} mode={mode} />
        </div>
      </div>
    </div>
  )
}

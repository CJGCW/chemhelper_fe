import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import EnergyLevelsReference from '../components/atomic/EnergyLevelsReference'
import AtomicPractice from '../components/atomic/AtomicPractice'
import IsoelectronicSeries from '../components/atomic/IsoelectronicSeries'
import OrbitalBoxDiagram from '../components/atomic/OrbitalBoxDiagram'
import ElectronConfig from '../components/atomic/ElectronConfig'
import ElectronConfigPractice from '../components/atomic/ElectronConfigPractice'
import ElectromagneticSpectrum from '../components/atomic/ElectromagneticSpectrum'
import ParaDiaMagnetic from '../components/atomic/ParaDiaMagnetic'
import ParaDiaMagneticPractice from '../components/atomic/ParaDiaMagneticPractice'
import MultiElectronAtoms from '../components/atomic/MultiElectronAtoms'

type Topic = 'electron_config' | 'quantum_numbers' | 'energy_levels' | 'isoelectronic'
           | 'em_spectrum' | 'para_dia' | 'multi_electron'
type Mode  = 'reference' | 'practice' | 'problems'

// Modes available per topic — topics not listed here show no toggle
const TOPIC_MODES: Partial<Record<Topic, Mode[]>> = {
  electron_config: ['reference', 'practice', 'problems'],
  quantum_numbers: ['reference', 'problems'],
  energy_levels:   ['reference', 'problems'],
  para_dia:        ['reference', 'problems'],
}

const TOPIC_GROUPS: { label: string; topics: { id: Topic; label: string; subtitle: string }[] }[] = [
  {
    label: 'Electron Configuration',
    topics: [
      { id: 'electron_config', label: 'Electron Config', subtitle: 'Notation, orbital boxes, Hund\'s rule' },
      { id: 'quantum_numbers', label: 'Quantum Numbers', subtitle: 'n, l, mₗ, ms rules'                    },
      { id: 'energy_levels',   label: 'Energy Levels',   subtitle: 'Bohr model, transitions'               },
      { id: 'multi_electron',  label: 'Multi-Electron',  subtitle: 'Shielding, Zeff, Slater rules'         },
    ],
  },
  {
    label: 'Properties & Spectra',
    topics: [
      { id: 'isoelectronic', label: 'Isoelectronic',    subtitle: 'Ion size comparison'             },
      { id: 'para_dia',      label: 'Para/Diamagnetic', subtitle: 'Unpaired electrons, magnetism'   },
      { id: 'em_spectrum',   label: 'EM Spectrum',      subtitle: 'λ ↔ f ↔ E interconverter'       },
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ElectronConfigPage() {
  const [params, setParams] = useSearchParams()
  const topic = (params.get('topic') ?? 'electron_config') as Topic
  const mode  = (params.get('mode')  ?? 'reference') as Mode

  const topicModes = TOPIC_MODES[topic]

  function setTopic(t: Topic) {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('topic', t)
      next.delete('mode')
      return next
    }, { replace: true })
  }

  function setMode(m: Mode) {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (m === 'reference') next.delete('mode')
      else next.set('mode', m)
      return next
    }, { replace: true })
  }

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      <div className="flex flex-col gap-4 print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Atomic Structure</h2>

        {/* Grouped topic pills */}
        <div className="flex flex-col gap-4">
          {TOPIC_GROUPS.map(group => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.topics.map(t => {
                  const isActive = topic === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTopic(t.id)}
                      className="relative flex flex-col items-start px-4 py-2 rounded-sm font-sans text-sm
                                 font-medium transition-all text-left"
                      style={isActive ? {
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                        color: 'var(--c-halogen)',
                      } : {
                        background: '#0e1016',
                        border: '1px solid #1c1f2e',
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      <span>{t.label}</span>
                      <span className="font-mono text-[9px] mt-0.5 opacity-60">{t.subtitle}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Per-topic mode toggle — only shown for topics with multiple modes */}
        {topicModes && topicModes.length > 1 && (
          <div className="flex items-center gap-1 p-1 rounded-full self-start"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {topicModes.map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
                {mode === m && (
                  <motion.div layoutId="atomic-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topic content */}
      <AnimatePresence mode="wait">
        <motion.div key={`${topic}-${mode}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {topic === 'electron_config' && mode === 'reference' && <OrbitalBoxDiagram />}
          {topic === 'electron_config' && mode === 'practice'  && <ElectronConfig />}
          {topic === 'electron_config' && mode === 'problems'  && <ElectronConfigPractice />}
          {topic === 'quantum_numbers' && mode === 'reference' && <QuantumNumbersReference />}
          {topic === 'quantum_numbers' && mode === 'problems'  && <AtomicPractice subtopic="quantum_numbers" />}
          {topic === 'energy_levels'   && mode === 'reference' && <EnergyLevelsReference />}
          {topic === 'energy_levels'   && mode === 'problems'  && <AtomicPractice subtopic="energy_levels" />}
          {topic === 'isoelectronic'   && <IsoelectronicSeries />}
          {topic === 'em_spectrum'     && <ElectromagneticSpectrum />}
          {topic === 'para_dia' && mode === 'reference' && <ParaDiaMagnetic />}
          {topic === 'para_dia' && mode === 'problems'  && <ParaDiaMagneticPractice />}
          {topic === 'multi_electron'  && <MultiElectronAtoms />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

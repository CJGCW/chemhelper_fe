import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ElectronConfig from '../components/atomic/ElectronConfig'
import ElectronConfigPractice from '../components/atomic/ElectronConfigPractice'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import EnergyLevelsReference from '../components/atomic/EnergyLevelsReference'
import AtomicPractice from '../components/atomic/AtomicPractice'

// ── Types ─────────────────────────────────────────────────────────────────────

type Topic = 'electron_config' | 'quantum_numbers' | 'energy_levels'
type Mode  = 'reference' | 'practice'

const TOPICS: { id: Topic; label: string; subtitle: string }[] = [
  { id: 'electron_config',  label: 'Electron Config',  subtitle: 'Aufbau, orbital diagrams'  },
  { id: 'quantum_numbers',  label: 'Quantum Numbers',  subtitle: 'n, l, mₗ, ms rules'        },
  { id: 'energy_levels',    label: 'Energy Levels',    subtitle: 'Bohr model, transitions'   },
]

// ── Tab bar ───────────────────────────────────────────────────────────────────

function ModeTabBar({ mode, onChange, layoutId }: { mode: Mode; onChange: (m: Mode) => void; layoutId: string }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-sm self-start"
      style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
      {(['reference', 'practice'] as Mode[]).map(m => (
        <button key={m} onClick={() => onChange(m)}
          className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
          style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
          {mode === m && (
            <motion.div layoutId={layoutId} className="absolute inset-0 rounded-sm"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
          )}
          <span className="relative z-10">{m}</span>
        </button>
      ))}
    </div>
  )
}

// ── Per-topic section ─────────────────────────────────────────────────────────

function TopicSection({ topic }: { topic: Topic }) {
  const [mode, setMode] = useState<Mode>('reference')

  return (
    <div className="flex flex-col gap-5">
      <ModeTabBar mode={mode} onChange={setMode} layoutId={`mode-tab-${topic}`} />

      <AnimatePresence mode="wait">
        <motion.div key={`${topic}-${mode}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}>
          {topic === 'electron_config' && mode === 'reference' && <ElectronConfig />}
          {topic === 'electron_config' && mode === 'practice'  && <ElectronConfigPractice />}
          {topic === 'quantum_numbers' && mode === 'reference' && <QuantumNumbersReference />}
          {topic === 'quantum_numbers' && mode === 'practice'  && <AtomicPractice subtopic="quantum_numbers" />}
          {topic === 'energy_levels'   && mode === 'reference' && <EnergyLevelsReference />}
          {topic === 'energy_levels'   && mode === 'practice'  && <AtomicPractice subtopic="energy_levels" />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ElectronConfigPage() {
  const [params, setParams] = useSearchParams()
  const topic = (params.get('topic') ?? 'electron_config') as Topic

  function setTopic(t: Topic) {
    setParams({ topic: t }, { replace: true })
  }

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header + topic tabs */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Atomic Structure</h2>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map(t => {
            const isActive = topic === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className="relative flex flex-col items-start px-4 py-2 rounded-sm font-sans text-sm
                           font-medium transition-colors text-left"
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

      {/* Topic content */}
      <AnimatePresence mode="wait">
        <motion.div key={topic}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}>
          <TopicSection topic={topic} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

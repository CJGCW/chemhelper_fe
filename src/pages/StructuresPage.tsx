import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import LewisPage from './LewisPage'
import VsepPage from './VsepPage'

type StructureTab = 'lewis' | 'vsepr'

const TABS: { id: StructureTab; label: string }[] = [
  { id: 'lewis', label: 'Lewis Structure' },
  { id: 'vsepr', label: 'VSEPR' },
]

export default function StructuresPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') ?? 'lewis') as StructureTab

  function setTab(t: StructureTab) {
    setParams({ tab: t }, { replace: true })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header + tabs */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl">Structures</h2>

        <div
          className="flex items-center gap-1 p-1 rounded-sm self-start"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}
        >
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="structures-tab-bg"
                    className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'lewis' && <LewisPageContent />}
      {tab === 'vsepr' && <VsepPage />}
    </div>
  )
}

// LewisPage renders its own container div with padding/max-width — strip that
// by pulling out just the content. We re-render it inline here to share the
// same outer padding as VSEPR.
function LewisPageContent() {
  return <LewisPage embedded />
}

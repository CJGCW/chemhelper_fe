import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SolubilityReference from '../components/reference/SolubilityReference'
import NamingReference from '../components/reference/NamingReference'
import NomenclatureTool from '../components/reference/NomenclatureTool'
import PageShell from '../components/Layout/PageShell'

type Tab = 'solubility' | 'naming' | 'nomenclature-practice'

const TABS: { id: Tab; label: string }[] = [
  { id: 'solubility',            label: 'Solubility Rules'  },
  { id: 'naming',                label: 'Naming Reference'  },
  { id: 'nomenclature-practice', label: 'Practice'          },
]

const PRINT_TABS = new Set<Tab>(['solubility', 'naming'])

export default function ReferencePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'solubility'

  const pageLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Reference'

  function setTab(id: Tab) {
    setSearchParams({ tab: id }, { replace: true })
  }

  void navigate

  return (
    <PageShell>

      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
          {pageLabel}
        </h2>
        {PRINT_TABS.has(activeTab) && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                       text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span>⎙</span>
            <span>Print</span>
          </button>
        )}
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
            style={{ color: activeTab === t.id ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
            {activeTab === t.id && (
              <motion.div layoutId="ref-tab-pill" className="absolute inset-0 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'solubility' && (
          <motion.div key="solubility"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SolubilityReference />
          </motion.div>
        )}
        {activeTab === 'naming' && (
          <motion.div key="naming"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NamingReference />
          </motion.div>
        )}
        {activeTab === 'nomenclature-practice' && (
          <motion.div key="nomenclature-practice"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NomenclatureTool />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}

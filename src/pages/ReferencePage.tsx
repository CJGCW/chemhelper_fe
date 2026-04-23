import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import SolubilityReference from '../components/reference/SolubilityReference'
import NamingReference from '../components/reference/NamingReference'
import PageShell from '../components/Layout/PageShell'

type Tab = 'solubility' | 'naming'

const TABS: { id: Tab; label: string }[] = [
  { id: 'solubility', label: 'Solubility Rules' },
  { id: 'naming',     label: 'Naming'           },
]

export default function ReferencePage() {
  const [searchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'solubility'

  const pageLabel = TABS.find(t => t.id === activeTab)?.label ?? 'Reference'

  return (
    <PageShell>

      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
          {pageLabel}
        </h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          <span>⎙</span>
          <span>Print</span>
        </button>
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
      </AnimatePresence>
    </PageShell>
  )
}

import { motion, AnimatePresence } from 'framer-motion'

export interface ExplanationContent {
  title: string
  formula: string       // e.g. "n = m / M"
  formulaVars: { symbol: string; meaning: string; unit: string }[]
  description: string
  example: {
    scenario: string
    steps: string[]
    result: string
  }
}

interface Props {
  content: ExplanationContent
  open: boolean
  onClose: () => void
}

export default function ExplanationModal({ content, open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="exp-backdrop"
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="exp-panel"
            className="fixed top-0 right-0 h-full w-[min(480px,95vw)] z-50
                       bg-surface border-l border-border flex flex-col overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-sans font-semibold text-bright text-lg">{content.title}</h2>
                <p className="font-mono text-sm mt-0.5" style={{ color: 'var(--c-halogen)' }}>
                  {content.formula}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-sm border
                           border-border text-dim hover:text-primary transition-colors font-mono text-xs"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

              {/* Variables */}
              <div>
                <p className="font-mono text-[10px] text-dim tracking-wider mb-3">VARIABLES</p>
                <div className="flex flex-col divide-y divide-border">
                  {content.formulaVars.map(v => (
                    <div key={v.symbol} className="flex items-baseline gap-3 py-2">
                      <span
                        className="font-mono text-base w-6 shrink-0"
                        style={{ color: 'var(--c-halogen)' }}
                      >
                        {v.symbol}
                      </span>
                      <span className="font-sans text-sm text-primary flex-1">{v.meaning}</span>
                      <span className="font-mono text-xs text-dim">{v.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="font-mono text-[10px] text-dim tracking-wider mb-2">CONCEPT</p>
                <p className="font-sans text-sm text-secondary leading-relaxed">
                  {content.description}
                </p>
              </div>

              {/* Worked example */}
              <div>
                <p className="font-mono text-[10px] text-dim tracking-wider mb-3">WORKED EXAMPLE</p>
                <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-3">
                  <p className="font-sans text-sm text-primary">{content.example.scenario}</p>
                  <div className="flex flex-col gap-1.5 pl-3 border-l-2"
                    style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)' }}>
                    {content.example.steps.map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="font-mono text-[10px] text-dim shrink-0 mt-0.5">{i + 1}.</span>
                        <span className="font-sans text-xs text-secondary leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-2">
                    <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
                      {content.example.result}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

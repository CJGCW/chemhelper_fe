import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../../stores/elementStore'
import { getColorCategory, GROUP_COLORS, GROUP_LABELS } from '../PeriodicTable/groupColors'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
}

function StatRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <motion.div variants={item} className="flex items-baseline justify-between py-2 border-b border-border">
      <span className="font-sans text-xs text-secondary">{label}</span>
      <span className="font-mono text-sm text-primary">
        {value}
        {unit && <span className="text-dim text-xs ml-1">{unit}</span>}
      </span>
    </motion.div>
  )
}

export default function ElementSidebar() {
  const { selectedElement, selectElement } = useElementStore()

  const el = selectedElement
  const category = el ? getColorCategory(el) : null
  const color = category ? GROUP_COLORS[category] : '#ffffff'
  const groupLabel = category ? GROUP_LABELS[category] : ''

  return (
    <AnimatePresence>
      {el && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectElement(null)}
          />

          {/* Sidebar panel */}
          <motion.aside
            key="sidebar"
            className="fixed top-0 left-0 h-full w-[300px] md:w-[320px] z-40
                       bg-surface border-r border-border flex flex-col overflow-hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {/* Close button */}
            <button
              onClick={() => selectElement(null)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center
                         rounded-sm border border-border text-dim hover:text-primary
                         hover:border-muted transition-colors z-10 font-mono text-xs"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Hero */}
            <motion.div
              className="relative flex flex-col items-start justify-end p-6 pb-5 shrink-0"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${color} 14%, #0e1016) 0%, #0e1016 70%)`,
                borderBottom: `1px solid color-mix(in srgb, ${color} 25%, #1c1f2e)`,
              }}
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* Atomic number */}
              <motion.span
                variants={item}
                className="font-mono text-xs mb-1"
                style={{ color: `color-mix(in srgb, ${color} 70%, white)` }}
              >
                {el.atomicNumber}
              </motion.span>

              {/* Symbol */}
              <motion.div
                variants={item}
                className="font-mono font-semibold leading-none"
                style={{ color, fontSize: '4.5rem', lineHeight: 1 }}
              >
                {el.symbol}
              </motion.div>

              {/* Name */}
              <motion.div variants={item} className="mt-2 font-sans font-medium text-primary text-xl">
                {el.name}
              </motion.div>

              {/* Group label badge */}
              <motion.div
                variants={item}
                className="mt-2 px-2 py-0.5 rounded-sm font-mono text-[10px] tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${color} 18%, transparent)`,
                  color,
                  border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                }}
              >
                {groupLabel.toUpperCase()}
              </motion.div>
            </motion.div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto p-5">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex flex-col"
              >
                <motion.p variants={item} className="font-mono text-[10px] text-dim tracking-widest mb-3">
                  PROPERTIES
                </motion.p>

                <StatRow label="Atomic Weight"    value={el.atomicWeight}            unit="g/mol" />
                <StatRow label="Period"           value={String(el.period)}          />
                <StatRow label="Group"            value={String(el.group)}           />
                <StatRow
                  label="Electronegativity"
                  value={el.electronegativity > 0 ? el.electronegativity.toFixed(2) : '—'}
                  unit={el.electronegativity > 0 ? 'Pauling' : undefined}
                />
                <StatRow
                  label="Van der Waals Radius"
                  value={el.vanDerWaalsRadiusPm > 0 ? String(el.vanDerWaalsRadiusPm) : '—'}
                  unit={el.vanDerWaalsRadiusPm > 0 ? 'pm' : undefined}
                />

                {/* Electronegativity bar */}
                {el.electronegativity > 0 && (
                  <motion.div variants={item} className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[10px] text-secondary">Electronegativity</span>
                      <span className="font-mono text-[10px] text-dim">0 – 4 Pauling</span>
                    </div>
                    <div className="h-1 bg-raised rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(el.electronegativity / 4) * 100}%` }}
                        transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Van der Waals radius bar */}
                {el.vanDerWaalsRadiusPm > 0 && (
                  <motion.div variants={item} className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[10px] text-secondary">Van der Waals Radius</span>
                      <span className="font-mono text-[10px] text-dim">0 – 400 pm</span>
                    </div>
                    <div className="h-1 bg-raised rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color, opacity: 0.7 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(el.vanDerWaalsRadiusPm / 400) * 100}%` }}
                        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

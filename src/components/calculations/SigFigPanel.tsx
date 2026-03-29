import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SigFigBreakdown } from '../../utils/sigfigs'

interface Props {
  breakdown: SigFigBreakdown | null
}

export default function SigFigPanel({ breakdown }: Props) {
  const [open, setOpen] = useState(false)

  if (!breakdown) return null

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 font-sans text-sm font-medium transition-colors self-start"
        style={{ color: open ? '#f97316' : 'rgba(255,255,255,0.4)' }}
      >
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}
          className="font-mono text-xs">
          ▶
        </motion.span>
        Sig fig breakdown
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="flex flex-col gap-3 p-3 rounded-sm border border-border bg-raised">

              {/* Input sig fig counts */}
              <div>
                <p className="font-mono text-xs text-dim mb-2 tracking-wider">INPUT PRECISION</p>
                <div className="flex flex-col gap-1">
                  {breakdown.inputs.map((inp, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-sans text-sm text-secondary">{inp.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base text-primary">{inp.value}</span>
                        <span
                          className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                          style={{
                            background: inp.count === breakdown.limiting
                              ? 'color-mix(in srgb, #f97316 15%, transparent)'
                              : 'color-mix(in srgb, white 6%, transparent)',
                            color: inp.count === breakdown.limiting
                              ? '#f97316'
                              : 'rgba(255,255,255,0.4)',
                            border: inp.count === breakdown.limiting
                              ? '1px solid color-mix(in srgb, #f97316 35%, transparent)'
                              : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {inp.count} sf
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Limiting explanation */}
              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <p className="font-mono text-xs text-dim tracking-wider">ROUNDING</p>
                <p className="font-sans text-sm text-secondary leading-relaxed">
                  <span className="text-primary">{breakdown.limitingLabel}</span> has the fewest
                  significant figures ({breakdown.limiting} sf), so the result is rounded to{' '}
                  <span className="text-primary">{breakdown.limiting} significant figures</span>.
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-dim">Unrounded</span>
                    <span className="font-mono text-base text-primary">
                      {breakdown.rawResult.toPrecision(8).replace(/\.?0+$/, '')}
                    </span>
                  </div>
                  <span className="text-dim">→</span>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-dim">Rounded ({breakdown.limiting} sf)</span>
                    <span className="font-mono text-base" style={{ color: '#f97316' }}>
                      {breakdown.roundedStr}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

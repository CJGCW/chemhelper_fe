import React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHideExamples } from './ExampleBoxContext'

export default function ExampleBox({ children }: { children: React.ReactNode }) {
  const hide = useHideExamples()
  const [open, setOpen] = useState(false)
  if (hide) return null

  return (
    <div className="rounded-sm border border-border bg-raised overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface/50 transition-colors"
      >
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">
          Example Calculation
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-xs text-secondary"
        >
          ▶
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 border-t border-border">
              <pre className="font-mono text-xs text-secondary leading-relaxed whitespace-pre-wrap pt-2.5">
                {children}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

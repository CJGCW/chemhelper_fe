import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SolutionStoichTool from './SolutionStoichTool'
import SolutionStoichPractice from './SolutionStoichPractice'

type Mode = 'reference' | 'practice'

export default function SolutionStoichTab() {
  const [mode, setMode] = useState<Mode>('reference')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-1 p-1 rounded-sm self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['reference', 'practice'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
            style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
            {mode === m && (
              <motion.div layoutId="sol-stoich-mode" className="absolute inset-0 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{m}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {mode === 'reference' ? <SolutionStoichTool /> : <SolutionStoichPractice />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  steps: string[]
}

// Characters written per second in the "chalk drawing" animation
const CHARS_PER_STEP_DELAY_MS = 400

export default function StepsPanel({ steps }: Props) {
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(0)

  function handleOpen() {
    setOpen(true)
    setRevealed(0)
    steps.forEach((_, i) => {
      setTimeout(() => setRevealed(i + 1), i * CHARS_PER_STEP_DELAY_MS)
    })
  }

  function handleClose() {
    setOpen(false)
    setRevealed(0)
  }

  if (steps.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle button */}
      <button
        onClick={open ? handleClose : handleOpen}
        className="flex items-center gap-2 font-sans text-sm font-medium transition-colors self-start"
        style={{ color: open ? 'var(--c-halogen)' : 'rgba(255,255,255,0.55)' }}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="font-mono text-xs inline-block"
        >
          ▶
        </motion.span>
        Show calculation steps
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Chalkboard */}
            <div
              className="relative rounded-md overflow-hidden p-5"
              style={{
                background: 'linear-gradient(145deg, #1a3028 0%, #162820 40%, #1c3228 100%)',
                boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.25), 0 4px 24px rgba(0,0,0,0.4)',
                border: '6px solid #2a1f14',
                outline: '2px solid #3a2a1a',
              }}
            >
              {/* Board texture overlay — horizontal chalk dust lines */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    180deg,
                    transparent,
                    transparent 28px,
                    rgba(255,255,255,0.015) 28px,
                    rgba(255,255,255,0.015) 29px
                  )`,
                }}
              />

              {/* Chalk tray at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1.5"
                style={{ background: 'linear-gradient(90deg, #3a2a1a, #4a3520, #3a2a1a)' }}
              />

              {/* Steps written in chalk */}
              <div className="flex flex-col gap-4 relative z-10">
                {steps.slice(0, revealed).map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4 items-baseline"
                  >
                    {/* Step number — yellow chalk */}
                    <span
                      className="shrink-0 font-bold leading-none"
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.3rem',
                        color: 'rgba(255, 230, 140, 0.85)',
                        textShadow: '0 0 8px rgba(255,220,100,0.3), 1px 1px 0 rgba(0,0,0,0.4)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {i + 1}.
                    </span>

                    {/* Step text — white chalk with slight texture */}
                    <motion.span
                      initial={{ clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.25rem',
                        lineHeight: '1.5',
                        color: 'rgba(240, 237, 228, 0.92)',
                        textShadow: '0 0 6px rgba(255,255,255,0.15), 1px 1px 0 rgba(0,0,0,0.3)',
                        letterSpacing: '0.03em',
                        display: 'inline-block',
                      }}
                    >
                      {step}
                    </motion.span>
                  </motion.div>
                ))}

                {/* Blinking cursor on the last line while still revealing */}
                {revealed > 0 && revealed < steps.length && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: '1.25rem',
                      color: 'rgba(240, 237, 228, 0.7)',
                      marginLeft: '2.5rem',
                    }}
                  >
                    |
                  </motion.span>
                )}
              </div>

              {/* Corner chalk smudge decoration */}
              <div
                className="absolute top-2 right-3 font-bold opacity-10 pointer-events-none select-none"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '0.75rem',
                  color: 'white',
                  transform: 'rotate(-3deg)',
                }}
              >
                n = m / M
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

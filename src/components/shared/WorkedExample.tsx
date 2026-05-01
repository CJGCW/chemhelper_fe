import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShowAnswers } from '../../stores/preferencesStore'

export interface ExampleData {
  scenario: string
  steps: string[]
  result: string
}

export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
export function randBetween(min: number, max: number) { return Math.random() * (max - min) + min }
export function roundTo(x: number, dp: number) { return +x.toFixed(dp) }
export function sig(x: number, sf: number) { return +x.toPrecision(sf) }

export default function WorkedExample({ generate }: { generate: () => ExampleData }) {
  const showAnswers = useShowAnswers()
  const [data, setData] = useState<ExampleData | null>(null)
  const [revealed, setRevealed] = useState(0)

  const total = data ? data.steps.length + 1 : 0
  const done = data !== null && revealed >= total

  function start() {
    setData(generate())
    setRevealed(0)
  }

  useEffect(() => {
    if (!data || done) return
    const t = setTimeout(() => setRevealed(r => r + 1), 520)
    return () => clearTimeout(t)
  }, [data, revealed, done])

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={start}
        className="self-start flex items-center gap-2 px-3 py-1.5 rounded-sm font-sans text-sm transition-colors border"
        style={{
          color: 'var(--c-halogen)',
          borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          background: 'color-mix(in srgb, var(--c-halogen) 8%, transparent)',
        }}
      >
        <span className="font-mono text-xs">▶</span>
        <span>{data ? 'New example' : 'Show me an example'}</span>
      </button>

      <AnimatePresence>
        {data && (
          <motion.div
            key="example-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-sm border border-border bg-raised px-4 py-3 flex flex-col gap-3">
              <p className="font-sans text-sm text-secondary leading-relaxed">{data.scenario}</p>
              {showAnswers ? (
                <div className="flex flex-col gap-1 pl-3 border-l-2 border-border">
                  {data.steps.slice(0, revealed).map((step, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-sm text-primary"
                    >
                      {step}
                    </motion.p>
                  ))}
                  {revealed > data.steps.length && (
                    <motion.p
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-sm font-semibold text-emerald-400 mt-1"
                    >
                      ∴ {data.result}
                    </motion.p>
                  )}
                </div>
              ) : (
                <p className="font-sans text-sm text-dim italic">Step-by-step solution hidden.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

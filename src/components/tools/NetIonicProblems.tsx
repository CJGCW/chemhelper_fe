import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  NET_IONIC_CAT_COLOR,
  NET_IONIC_CAT_LABEL,
  pickNetIonic,
  type NetIonicPickResult,
} from '../../utils/netIonicProblems'

export default function NetIonicProblems() {
  const [state, setState] = useState<NetIonicPickResult>(() => pickNetIonic())
  const [selected, setSelected] = useState<string | null>(null)
  const [score,    setScore]    = useState(0)
  const [attempts, setAttempts] = useState(0)

  const { q, idx, options } = state
  const answered = selected !== null
  const correct  = selected === q.answer

  const next = useCallback(() => {
    setState(s => pickNetIonic(s.idx))
    setSelected(null)
  }, [])

  function choose(opt: string) {
    if (answered) return
    setSelected(opt)
    setAttempts(a => a + 1)
    if (opt === q.answer) setScore(s => s + 1)
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Net Ionic Equations</span>
          {attempts > 0 && (
            <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{score}/{attempts}</span>
          )}
        </div>
        <button onClick={next} className="font-mono text-xs text-dim hover:text-secondary transition-colors">↻ New</button>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border bg-surface overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center gap-2"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #141620)' }}>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Select the net ionic equation</span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: `color-mix(in srgb, ${NET_IONIC_CAT_COLOR[q.category]} 12%, transparent)`,
                color: NET_IONIC_CAT_COLOR[q.category],
              }}>
              {NET_IONIC_CAT_LABEL[q.category]}
            </span>
          </div>

          <div className="px-4 py-4">
            <p className="font-mono text-sm text-primary">{q.molecular}</p>
          </div>

          {/* Options */}
          <div className="px-4 pb-4 grid grid-cols-1 gap-2">
            {options.map((opt, i) => {
              const isSelected  = selected === opt
              const isAnswer    = opt === q.answer
              const showCorrect = answered && isAnswer
              const showWrong   = answered && isSelected && !isAnswer

              return (
                <button key={i} onClick={() => choose(opt)} disabled={answered}
                  className="px-3 py-2.5 rounded-sm border font-mono text-sm text-left transition-all"
                  style={{
                    color: showCorrect ? '#34d399' : showWrong ? '#f87171' : 'rgba(255,255,255,0.65)',
                    borderColor: showCorrect ? '#34d39960' : showWrong ? '#f8717160' : '#1c1f2e',
                    background: showCorrect ? 'color-mix(in srgb, #34d399 8%, #0e1016)'
                      : showWrong ? 'color-mix(in srgb, #f87171 8%, #0e1016)' : '#141620',
                  }}>
                  <span className="text-dim mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence initial={false}>
            {answered && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden border-t border-border">
                <div className="px-4 py-3 flex flex-col gap-2">
                  <span className="font-sans text-sm font-semibold"
                    style={{ color: correct ? '#34d399' : '#f87171' }}>
                    {correct ? 'Correct' : 'Incorrect'}
                  </span>
                  {!correct && (
                    <p className="font-mono text-xs" style={{ color: '#34d399' }}>{q.answer}</p>
                  )}
                  <p className="font-sans text-xs text-dim">
                    Spectator ions: <span className="text-secondary">{q.spectators}</span>
                  </p>
                  <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
                  <button onClick={next}
                    className="self-start mt-1 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Next →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

    </div>
  )
}

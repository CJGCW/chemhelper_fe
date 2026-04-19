import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type RxnType,
  RXN_TYPE_COLOR,
  RXN_TYPE_LABEL,
  RXN_OPTIONS,
  pickRxnClassifier,
} from '../../utils/reactionClassifierProblems'

export default function ReactionClassifierProblems() {
  const [{ q, idx }, setQState] = useState(() => pickRxnClassifier())
  const [selected, setSelected] = useState<RxnType | null>(null)
  const [score,    setScore]    = useState(0)
  const [attempts, setAttempts] = useState(0)

  const answered = selected !== null
  const correct  = selected === q.answer

  const next = useCallback(() => {
    setQState(s => pickRxnClassifier(s.idx))
    setSelected(null)
  }, [])

  function choose(type: RxnType) {
    if (answered) return
    setSelected(type)
    setAttempts(a => a + 1)
    if (type === q.answer) setScore(s => s + 1)
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction Classification</span>
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
          <div className="px-4 py-3 border-b border-border"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-raised)))' }}>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Classify the reaction</span>
          </div>
          <div className="px-4 py-4">
            <p className="font-mono text-base text-bright">{q.reactantA} + {q.reactantB} → ?</p>
          </div>

          {/* Options */}
          <div className="px-4 pb-4 grid grid-cols-1 gap-2">
            {RXN_OPTIONS.map(type => {
              const isSelected  = selected === type
              const isAnswer    = type === q.answer
              const showCorrect = answered && isAnswer
              const showWrong   = answered && isSelected && !isAnswer
              const color = RXN_TYPE_COLOR[type]

              return (
                <button key={type} onClick={() => choose(type)} disabled={answered}
                  className="px-3 py-2.5 rounded-sm border font-sans text-sm text-left transition-all"
                  style={{
                    color: showCorrect ? '#34d399' : showWrong ? '#f87171' : 'rgba(var(--overlay),0.65)',
                    borderColor: showCorrect ? '#34d39960' : showWrong ? '#f8717160' : 'rgb(var(--color-border))',
                    background: showCorrect ? 'color-mix(in srgb, #34d399 8%, rgb(var(--color-surface)))'
                      : showWrong ? 'color-mix(in srgb, #f87171 8%, rgb(var(--color-surface)))' : 'rgb(var(--color-raised))',
                  }}>
                  <span className="inline-block w-2 h-2 rounded-full mr-2.5 shrink-0"
                    style={{ background: color, opacity: answered ? (showCorrect || showWrong ? 1 : 0.3) : 1 }} />
                  {RXN_TYPE_LABEL[type]}
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
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm font-semibold"
                      style={{ color: correct ? '#34d399' : '#f87171' }}>
                      {correct ? 'Correct' : `Incorrect — ${RXN_TYPE_LABEL[q.answer]}`}
                    </span>
                    <span className="font-mono text-xs text-dim">{q.subtype}</span>
                  </div>
                  <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
                  <button onClick={next}
                    className="self-start mt-1 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
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

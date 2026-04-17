import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateSigmaPiProblem, checkSigmaPiAnswer } from '../../utils/sigmaPiPractice'
import type { SigmaPiProblem, SigmaPiResult } from '../../utils/sigmaPiPractice'
import LewisStructureDiagram from './LewisStructureDiagram'

export default function SigmaPiProblems() {
  const [problem,   setProblem]   = useState<SigmaPiProblem | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [cardKey,   setCardKey]   = useState(0)
  const [sigmaStr,  setSigmaStr]  = useState('')
  const [piStr,     setPiStr]     = useState('')
  const [result,    setResult]    = useState<SigmaPiResult | 'idle'>('idle')
  const [showSteps, setShowSteps] = useState(false)
  const [score,     setScore]     = useState(0)
  const [attempts,  setAttempts]  = useState(0)

  const answered = result !== 'idle'

  const loadNext = useCallback(async () => {
    setLoading(true)
    setSigmaStr('')
    setPiStr('')
    setResult('idle')
    setShowSteps(false)
    const p = await generateSigmaPiProblem()
    setProblem(p)
    setCardKey(k => k + 1)
    setLoading(false)
  }, [])

  useEffect(() => { loadNext() }, [loadNext])

  function check() {
    if (!problem || sigmaStr === '' || piStr === '') return
    const r = checkSigmaPiAnswer(sigmaStr, piStr, problem)
    setResult(r)
    setAttempts(a => a + 1)
    if (r === 'correct') setScore(s => s + 1)
  }

  const sigmaCorrect = result === 'correct' || result === 'wrong-pi'
  const piCorrect    = result === 'correct' || result === 'wrong-sigma'

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Score bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-dim tracking-widest uppercase">σ / π Bond Problems</span>
          {attempts > 0 && (
            <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
              {score}/{attempts}
            </span>
          )}
        </div>
        <button onClick={loadNext}
          className="font-mono text-xs text-dim hover:text-secondary transition-colors">
          ↻ New problem
        </button>
      </div>

      {/* Problem card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={loading ? 'loading' : cardKey}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border bg-surface overflow-hidden"
        >
          {loading || !problem ? (
            <div className="px-4 py-8 flex items-center justify-center">
              <span className="font-mono text-xs text-dim animate-pulse">Loading structure…</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-border"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #141620)' }}>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans text-base font-semibold text-primary">{problem.name}</span>
                </div>
              </div>

              {/* Lewis diagram */}
              <div className="px-4 pt-3 pb-1">
                <LewisStructureDiagram structure={problem.structure} />
              </div>

              {/* Inputs */}
              <div className="px-4 py-3 flex flex-col gap-3">
                <span className="font-mono text-[9px] text-dim tracking-widest uppercase">
                  Count the bonds
                </span>
                <div className="flex gap-4 flex-wrap">
                  {/* σ input */}
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-sm text-secondary w-16">σ bonds</label>
                    <input
                      type="number" min="0"
                      value={sigmaStr}
                      onChange={e => { setSigmaStr(e.target.value); setResult('idle') }}
                      onKeyDown={e => e.key === 'Enter' && !answered && check()}
                      disabled={answered}
                      className="w-20 px-3 py-1.5 rounded-sm border font-mono text-sm text-primary
                                 bg-raised focus:outline-none transition-colors"
                      style={{
                        borderColor: answered
                          ? (sigmaCorrect ? '#34d399' : '#f87171')
                          : undefined,
                      }}
                      placeholder="?"
                    />
                  </div>

                  {/* π input */}
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-sm text-secondary w-16">π bonds</label>
                    <input
                      type="number" min="0"
                      value={piStr}
                      onChange={e => { setPiStr(e.target.value); setResult('idle') }}
                      onKeyDown={e => e.key === 'Enter' && !answered && check()}
                      disabled={answered}
                      className="w-20 px-3 py-1.5 rounded-sm border font-mono text-sm text-primary
                                 bg-raised focus:outline-none transition-colors"
                      style={{
                        borderColor: answered
                          ? (piCorrect ? '#34d399' : '#f87171')
                          : undefined,
                      }}
                      placeholder="?"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!answered ? (
                    <button
                      onClick={check}
                      disabled={sigmaStr === '' || piStr === ''}
                      className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium
                                 transition-all disabled:opacity-40"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                        color: 'var(--c-halogen)',
                      }}>
                      Check
                    </button>
                  ) : (
                    <button onClick={loadNext}
                      className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                        color: 'var(--c-halogen)',
                      }}>
                      Next →
                    </button>
                  )}
                  {answered && (
                    <button onClick={() => setShowSteps(s => !s)}
                      className="font-mono text-xs text-dim hover:text-secondary transition-colors">
                      {showSteps ? '▲ hide' : '▼ explanation'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {answered && problem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-sm border overflow-hidden"
              style={{
                borderColor: result === 'correct' ? '#34d39950' : '#f8717150',
                background: result === 'correct'
                  ? 'color-mix(in srgb, #34d399 6%, #0e1016)'
                  : 'color-mix(in srgb, #f87171 6%, #0e1016)',
              }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: 'inherit' }}>
                {result === 'correct' && (
                  <span className="font-sans text-sm font-semibold" style={{ color: '#34d399' }}>
                    Correct — {problem.sigma}σ and {problem.pi}π
                  </span>
                )}
                {result === 'wrong-both' && (
                  <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                    Not quite — correct: {problem.sigma}σ and {problem.pi}π
                  </span>
                )}
                {result === 'wrong-sigma' && (
                  <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                    σ count wrong — correct: {problem.sigma}σ (π was right: {problem.pi}π)
                  </span>
                )}
                {result === 'wrong-pi' && (
                  <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                    π count wrong — correct: {problem.pi}π (σ was right: {problem.sigma}σ)
                  </span>
                )}
              </div>

              <AnimatePresence initial={false}>
                {showSteps && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3">
                      <p className="font-sans text-xs text-secondary leading-relaxed">
                        {problem.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

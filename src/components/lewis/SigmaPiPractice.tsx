import { useState, useCallback, useEffect } from 'react'
import { generateSigmaPiProblem, checkSigmaPiAnswer } from '../../utils/sigmaPiPractice'
import type { SigmaPiProblem, SigmaPiResult } from '../../utils/sigmaPiPractice'
import LewisStructureDiagram from './LewisStructureDiagram'

// ── Component ──────────────────────────────────────────────────────────────────

type Status = 'idle' | SigmaPiResult

export default function SigmaPiPractice() {
  const [problem,  setProblem]  = useState<SigmaPiProblem | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [sigmaStr, setSigmaStr] = useState('')
  const [piStr,    setPiStr]    = useState('')
  const [status,   setStatus]   = useState<Status>('idle')

  const loadNext = useCallback(async () => {
    setLoading(true)
    setSigmaStr('')
    setPiStr('')
    setStatus('idle')
    const p = await generateSigmaPiProblem()
    setProblem(p)
    setLoading(false)
  }, [])

  useEffect(() => { loadNext() }, [loadNext])

  function check() {
    if (!problem || sigmaStr === '' || piStr === '') return
    setStatus(checkSigmaPiAnswer(sigmaStr, piStr, problem))
  }

  const answered = status !== 'idle'

  if (loading || !problem) {
    return (
      <div className="flex flex-col gap-5 max-w-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">σ / π Bond Practice</span>
        </div>
        <div className="rounded-sm border border-border bg-surface px-4 py-8 flex items-center justify-center">
          <span className="font-mono text-xs text-dim animate-pulse">Loading structure…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">
          σ / π Bond Practice
        </span>
        <button onClick={loadNext}
          className="font-mono text-xs text-dim hover:text-secondary transition-colors">
          ↻ New problem
        </button>
      </div>

      {/* Problem card */}
      <div className="rounded-sm border border-border bg-surface overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-raised)))' }}>
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
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">
            Count the bonds
          </span>
          <div className="flex gap-4 flex-wrap">
            {/* σ input */}
            <div className="flex items-center gap-2">
              <label className="font-mono text-sm text-secondary w-16">σ bonds</label>
              <input
                type="number" min="0"
                value={sigmaStr}
                onChange={e => { setSigmaStr(e.target.value); setStatus('idle') }}
                onKeyDown={e => e.key === 'Enter' && !answered && check()}
                disabled={answered}
                className="w-20 px-3 py-1.5 rounded-sm border font-mono text-sm text-primary
                           bg-raised focus:outline-none transition-colors"
                style={{
                  borderColor: answered
                    ? (status === 'correct' || status === 'wrong-pi' ? '#34d399' : '#f87171')
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
                onChange={e => { setPiStr(e.target.value); setStatus('idle') }}
                onKeyDown={e => e.key === 'Enter' && !answered && check()}
                disabled={answered}
                className="w-20 px-3 py-1.5 rounded-sm border font-mono text-sm text-primary
                           bg-raised focus:outline-none transition-colors"
                style={{
                  borderColor: answered
                    ? (status === 'correct' || status === 'wrong-sigma' ? '#34d399' : '#f87171')
                    : undefined,
                }}
                placeholder="?"
              />
            </div>
          </div>

          {!answered ? (
            <button
              onClick={check}
              disabled={sigmaStr === '' || piStr === ''}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium
                         transition-all disabled:opacity-40"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check
            </button>
          ) : (
            <button onClick={loadNext}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Feedback */}
      {answered && (
        <div className="rounded-sm border overflow-hidden"
          style={{
            borderColor: status === 'correct' ? '#34d39950' : '#f8717150',
            background: status === 'correct'
              ? 'color-mix(in srgb, #34d399 6%, rgb(var(--color-surface)))'
              : 'color-mix(in srgb, #f87171 6%, rgb(var(--color-surface)))',
          }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'inherit' }}>
            {status === 'correct' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#34d399' }}>
                Correct — {problem.sigma}σ and {problem.pi}π
              </span>
            )}
            {status === 'wrong-both' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                Not quite — correct answer: {problem.sigma}σ and {problem.pi}π
              </span>
            )}
            {status === 'wrong-sigma' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                σ count wrong — correct: {problem.sigma}σ (π was right: {problem.pi}π)
              </span>
            )}
            {status === 'wrong-pi' && (
              <span className="font-sans text-sm font-semibold" style={{ color: '#f87171' }}>
                π count wrong — correct: {problem.pi}π (σ was right: {problem.sigma}σ)
              </span>
            )}
          </div>
          <div className="px-4 py-3">
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </div>
        </div>
      )}

      {/* Reference rule */}
      <div className="rounded-sm border border-border bg-raised px-4 py-3 flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Quick rule</span>
        <div className="flex flex-col gap-1 font-mono text-xs text-secondary">
          <span>Single bond  A–B  → <span className="text-primary">1σ, 0π</span></span>
          <span>Double bond  A=B  → <span className="text-primary">1σ, 1π</span></span>
          <span>Triple bond  A≡B  → <span className="text-primary">1σ, 2π</span></span>
        </div>
        <p className="font-sans text-xs text-secondary leading-relaxed mt-1">
          Every bond contains exactly one σ bond. π bonds are the additional bonds in double and triple bonds.
          Count the total number of bonds for σ, then add (order − 1) per bond for π.
        </p>
      </div>

    </div>
  )
}

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpectrumViewer from './SpectrumViewer'
import CompoundDisplay from '../shared/CompoundDisplay'
import { MS_PROBLEMS, type MSProblem } from '../../data/spectral/msProblems'

interface Props {
  mode?: 'practice' | 'problems'
}

function difficultyStyle(d: MSProblem['difficulty']): React.CSSProperties {
  if (d === 'easy')   return { color: 'rgb(var(--color-success))',  borderColor: 'rgb(var(--color-success-border))',  background: 'rgb(var(--color-success-bg) / 0.1)' }
  if (d === 'medium') return { color: 'rgb(var(--color-warning))',  borderColor: 'rgb(var(--color-warning))',         background: 'rgb(var(--color-warning) / 0.1)' }
  return               { color: 'rgb(var(--color-error))',   borderColor: 'rgb(var(--color-error-border))',   background: 'rgb(var(--color-error-bg) / 0.1)' }
}

export default function MSInterpretationPractice({ mode = 'practice' }: Props) {
  const pool = useMemo(
    () => MS_PROBLEMS.filter(p => mode === 'practice' ? p.difficulty !== 'hard' : p.difficulty === 'hard'),
    [mode],
  )

  const [problem, setProblem] = useState<MSProblem>(() => pool[Math.floor(Math.random() * pool.length)])
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const q = problem.questions[qIdx]
  const correct = q.type === 'numeric'
    ? parseFloat(answer) === q.correct
    : answer === q.correct

  function handleCheck() {
    if (!answer || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    if (qIdx < problem.questions.length - 1) {
      setQIdx(i => i + 1)
      setAnswer('')
      setChecked(false)
    } else {
      setProblem(pool[Math.floor(Math.random() * pool.length)])
      setQIdx(0)
      setAnswer('')
      setChecked(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'rgb(var(--color-success))' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Quick reference */}
      <div className="grid grid-cols-2 gap-2 text-xs font-sans">
        {[
          { label: 'DoU formula', val: '(2C+2+N−H−X)/2' },
          { label: 'Br isotope', val: 'M:M+2 ≈ 1:1' },
          { label: 'Cl isotope', val: 'M:M+2 ≈ 3:1' },
          { label: 'N rule', val: 'Odd MW → odd # N' },
        ].map(r => (
          <div key={r.label} className="rounded-sm border border-border px-3 py-1.5 flex gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="text-dim">{r.label}:</span>
            <span className="font-mono text-primary">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-sans text-sm font-semibold text-primary">{problem.title}</p>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border"
            style={difficultyStyle(problem.difficulty)}
          >
            {problem.difficulty}
          </span>
        </div>
        <p className="font-sans text-xs text-secondary">Formula: <span className="font-mono">{problem.formula}</span></p>
      </div>

      {problem.smiles && (
        <div className="flex justify-start">
          <CompoundDisplay smiles={problem.smiles} label={problem.compound} width={180} height={130} />
        </div>
      )}

      <SpectrumViewer type="mass_spec" peaks={problem.peaks} width={520} height={200} />

      {/* Question */}
      <div className="rounded-sm border border-border p-4 flex flex-col gap-3" style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Question {qIdx + 1} of {problem.questions.length}</span>
        <p className="font-sans text-sm text-primary font-medium">{q.stem}</p>

        {q.type === 'mc' && q.options && (
          <div className="flex flex-col gap-2">
            {q.options.map(opt => {
              const isSelected = answer === opt
              const isCorrect = opt === q.correct
              let borderColor = 'rgb(var(--color-border))'
              let bg = 'rgb(var(--color-surface))'
              if (checked) {
                if (isCorrect) { borderColor = 'rgb(var(--color-success))'; bg = 'rgb(var(--color-success-bg) / 0.15)' }
                else if (isSelected) { borderColor = 'rgb(var(--color-error))'; bg = 'rgb(var(--color-error-bg) / 0.15)' }
              } else if (isSelected) {
                borderColor = 'var(--c-halogen)'
                bg = 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-surface)))'
              }
              return (
                <button key={opt} onClick={() => !checked && setAnswer(opt)} disabled={checked}
                  className="px-3 py-2 rounded-sm border text-left font-sans text-xs transition-colors"
                  style={{ borderColor, background: bg, color: 'rgb(var(--overlay)/0.8)' }}>
                  {opt}
                </button>
              )
            })}
          </div>
        )}
        {q.type === 'numeric' && (
          <input type="text" inputMode="decimal" value={answer}
            onChange={e => !checked && setAnswer(e.target.value)}
            disabled={checked}
            placeholder="Enter number"
            className="w-28 px-3 py-1.5 rounded-sm border border-border font-mono text-sm text-primary bg-surface focus:outline-none" />
        )}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={!answer}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            {qIdx < problem.questions.length - 1 ? 'Next Question' : 'Next Problem'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-sm border px-4 py-3 flex flex-col gap-1.5"
            style={{
              borderColor: correct ? 'rgb(var(--color-success-border))' : 'rgb(var(--color-error-border))',
              background: correct ? 'rgb(var(--color-success-bg) / 0.15)' : 'rgb(var(--color-error-bg) / 0.15)',
            }}>
            <p className="font-sans text-sm font-semibold"
              style={{ color: correct ? 'rgb(var(--color-success))' : 'rgb(var(--color-error))' }}>
              {correct ? '✓ Correct!' : `✗ Answer: ${q.correct}`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

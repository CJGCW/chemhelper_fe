import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpectrumViewer from './SpectrumViewer'
import { IR_PROBLEMS, type IRProblem } from '../../data/spectral/irProblems'

interface Props {
  mode?: 'practice' | 'problems'
}

function difficultyStyle(d: IRProblem['difficulty']): React.CSSProperties {
  if (d === 'easy')   return { color: 'rgb(var(--color-success))',  borderColor: 'rgb(var(--color-success-border))',  background: 'rgb(var(--color-success-bg) / 0.1)' }
  if (d === 'medium') return { color: 'rgb(var(--color-warning))',  borderColor: 'rgb(var(--color-warning))',         background: 'rgb(var(--color-warning) / 0.1)' }
  return               { color: 'rgb(var(--color-error))',   borderColor: 'rgb(var(--color-error-border))',   background: 'rgb(var(--color-error-bg) / 0.1)' }
}

export default function IRInterpretationPractice({ mode = 'practice' }: Props) {
  const pool = useMemo(
    () => IR_PROBLEMS.filter(p => mode === 'practice' ? p.difficulty !== 'hard' : p.difficulty === 'hard'),
    [mode],
  )

  const [problem, setProblem] = useState<IRProblem>(() => pool[Math.floor(Math.random() * pool.length)])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function toggle(g: string) {
    if (checked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(g)) next.delete(g)
      else next.add(g)
      return next
    })
  }

  function handleCheck() {
    if (checked) return
    const presentSet = new Set(problem.presentGroups)
    const allCorrect = [...selected].every(s => presentSet.has(s)) && [...presentSet].every(s => selected.has(s))
    setChecked(true)
    setScore(s => ({ correct: s.correct + (allCorrect ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pool[Math.floor(Math.random() * pool.length)])
    setSelected(new Set())
    setChecked(false)
    setHintsOpen(false)
  }

  const presentSet = new Set(problem.presentGroups)

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

      {/* Key rules */}
      <div className="rounded-sm border border-border p-3 flex flex-col gap-1" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest">IR Interpretation Tip</p>
        <p className="font-sans text-xs text-secondary">Start with the C=O region (1700–1800 cm⁻¹) — it is the most diagnostic. Then check 3000+ cm⁻¹ for O–H, N–H, and triple bond stretches.</p>
      </div>

      {/* Spectrum */}
      <SpectrumViewer type="ir" peaks={problem.peaks} width={520} height={220} />

      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-sans text-sm text-primary font-medium">{problem.title} <span className="font-normal text-secondary">(select all that apply)</span></p>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border"
          style={difficultyStyle(problem.difficulty)}
        >
          {problem.difficulty}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {problem.allGroups.map(g => {
          const isSelected = selected.has(g)
          const isPresent = presentSet.has(g)
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          let textColor = 'rgb(var(--overlay)/0.6)'
          if (checked) {
            if (isPresent && isSelected)  { borderColor = 'rgb(var(--color-success))';        bg = 'rgb(var(--color-success-bg) / 0.15)';  textColor = 'rgb(var(--color-success))' }
            else if (isPresent && !isSelected) { borderColor = 'rgb(var(--color-warning))'; bg = 'rgb(var(--color-warning) / 0.1)';       textColor = 'rgb(var(--color-warning))' }
            else if (!isPresent && isSelected) { borderColor = 'rgb(var(--color-error))';   bg = 'rgb(var(--color-error-bg) / 0.15)';    textColor = 'rgb(var(--color-error))' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'; bg = 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))'; textColor = 'var(--c-halogen)'
          }
          return (
            <button key={g} onClick={() => toggle(g)} disabled={checked}
              className="px-3 py-1.5 rounded-full text-xs font-sans font-medium border transition-colors"
              style={{ borderColor, background: bg, color: textColor }}>
              {g}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <>
            <button onClick={handleCheck} disabled={selected.size === 0}
              className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
              style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                       color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
              Check
            </button>
            <button onClick={() => setHintsOpen(o => !o)}
              className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border border-border text-secondary hover:text-primary">
              {hintsOpen ? 'Hide Hints' : 'Hints'}
            </button>
          </>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Next Problem
          </button>
        )}
      </div>

      <AnimatePresence>
        {hintsOpen && !checked && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-sm border border-border p-3 flex flex-col gap-1.5" style={{ background: 'rgb(var(--color-raised))' }}>
            {problem.hints.map((h, i) => (
              <p key={i} className="font-sans text-xs text-secondary">• {h}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Explanation</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

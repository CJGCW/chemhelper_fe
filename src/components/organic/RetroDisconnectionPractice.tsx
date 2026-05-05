import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RETRO_PROBLEMS, type RetroProblem } from '../../data/organic/retroProblems'

function pickRandom(): RetroProblem {
  return RETRO_PROBLEMS[Math.floor(Math.random() * RETRO_PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function RetroDisconnectionPractice({ allowCustom: _allowCustom = true }: Props) {
  const [problem, setProblem] = useState<RetroProblem>(pickRandom)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showAll, setShowAll] = useState(false)

  const isCorrect = submitted && selected === problem.correctBondId

  function handleSubmit() {
    if (!selected || submitted) return
    const correct = selected === problem.correctBondId
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setSubmitted(true)
  }

  function handleNext() {
    setProblem(pickRandom())
    setSelected(null)
    setSubmitted(false)
    setShowAll(false)
  }

  const whyWrong = submitted && selected && selected !== problem.correctBondId
    ? problem.whyOthersFail[selected]
    : null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Score */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Target */}
      <div className="rounded-sm border border-border p-4 flex flex-col gap-2"
        style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Target molecule</span>
        <p className="font-sans text-sm font-medium text-primary">{problem.target.label}</p>
        <p className="font-sans text-xs text-secondary mt-1">Which bond should be disconnected in a retrosynthetic analysis?</p>
      </div>

      {/* Bond options */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Choose the disconnection:</span>
        {problem.bonds.map(bond => {
          const isSelected = selected === bond.id
          const isThisCorrect = bond.id === problem.correctBondId
          let borderColor = 'rgba(var(--overlay),0.15)'
          let bg = 'rgb(var(--color-raised))'
          if (submitted) {
            if (isThisCorrect) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.06)' }
            else if (isSelected) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.06)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'
            bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))'
          }
          return (
            <button key={bond.id}
              onClick={() => !submitted && setSelected(bond.id)}
              disabled={submitted}
              className="text-left px-4 py-3 rounded-sm border transition-colors"
              style={{ borderColor, background: bg }}>
              <span className="font-mono text-xs text-primary">{bond.description}</span>
              {submitted && isThisCorrect && (
                <span className="ml-2 text-emerald-500 font-mono text-xs">← correct</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Result explanation */}
      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-3">

            {/* Synthons */}
            <div className="rounded-sm border border-border p-4 flex flex-col gap-2"
              style={{ background: isCorrect ? 'rgb(34 197 94 / 0.04)' : 'rgb(var(--color-raised))' }}>
              <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Disconnection gives:</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-dim w-20">Nucleophile</span>
                  <span className="font-mono text-xs text-primary">{problem.synthons.nucleophile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-dim w-20">Electrophile</span>
                  <span className="font-mono text-xs text-primary">{problem.synthons.electrophile}</span>
                </div>
              </div>
              <p className="font-sans text-xs text-secondary mt-1">
                <span className="text-dim">Forward reaction: </span>
                {problem.forwardReaction}
              </p>
            </div>

            {/* Wrong choice explanation */}
            {whyWrong && (
              <div className="rounded-sm border border-red-500/20 px-4 py-3"
                style={{ background: 'rgb(239 68 68 / 0.04)' }}>
                <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Why that disconnection is less useful</span>
                <p className="font-sans text-xs text-primary leading-relaxed">{whyWrong}</p>
              </div>
            )}

            {/* Show all disconnections */}
            {!showAll && Object.keys(problem.whyOthersFail).length > 0 && (
              <button onClick={() => setShowAll(true)}
                className="text-left font-sans text-xs text-secondary underline underline-offset-2 hover:text-primary">
                Show all disconnection analyses →
              </button>
            )}
            {showAll && (
              <div className="flex flex-col gap-2">
                {problem.bonds.map(bond => (
                  <div key={bond.id} className="rounded-sm border border-border px-3 py-2"
                    style={{ background: 'rgb(var(--color-raised))' }}>
                    <span className="font-mono text-[10px] text-dim">{bond.description}</span>
                    {bond.id === problem.correctBondId ? (
                      <p className="font-sans text-xs text-emerald-500 mt-0.5">✓ Best disconnection → {problem.forwardReaction}</p>
                    ) : problem.whyOthersFail[bond.id] ? (
                      <p className="font-sans text-xs text-dim mt-0.5">{problem.whyOthersFail[bond.id]}</p>
                    ) : (
                      <p className="font-sans text-xs text-dim italic mt-0.5">Less useful — see notes above.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={!selected}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Next problem →
          </button>
        )}
      </div>
    </div>
  )
}

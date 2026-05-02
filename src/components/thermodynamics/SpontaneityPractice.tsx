import { useState, useCallback } from 'react'
import { generateSpontaneityProblem, type SpontaneityClass, type SpontaneityProblem } from '../../utils/thermodynamicsPractice'
import { useShowAnswers } from '../../stores/preferencesStore'

const CLASS_OPTIONS: { value: SpontaneityClass; label: string }[] = [
  { value: 'always',  label: 'Always spontaneous' },
  { value: 'never',   label: 'Never spontaneous'  },
  { value: 'low-T',   label: 'Spontaneous at low T' },
  { value: 'high-T',  label: 'Spontaneous at high T' },
]

interface Props {
  allowCustom?: boolean
}

export default function SpontaneityPractice(_props: Props) {
  const showAnswers = useShowAnswers()
  const [problem, setProblem] = useState<SpontaneityProblem>(() => generateSpontaneityProblem())
  const [selected, setSelected] = useState<SpontaneityClass | null>(null)
  const [tInput, setTInput]     = useState('')
  const [verify, setVerify]     = useState<'correct' | 'incorrect' | null>(null)
  const [score, setScore]       = useState({ correct: 0, total: 0 })
  const [showSteps, setShowSteps] = useState(false)

  const needsCrossover = problem.answer === 'low-T' || problem.answer === 'high-T'

  const nextProblem = useCallback(() => {
    setProblem(generateSpontaneityProblem())
    setSelected(null)
    setTInput('')
    setVerify(null)
    setShowSteps(false)
  }, [])

  function handleCheck() {
    if (!selected) return
    const classCorrect = selected === problem.answer
    let tCorrect = true
    if (needsCrossover && problem.crossoverT !== undefined) {
      const tVal = parseFloat(tInput)
      tCorrect = !isNaN(tVal) && Math.abs(tVal - problem.crossoverT) <= Math.abs(problem.crossoverT) * 0.02 + 1
    }
    const allCorrect = classCorrect && tCorrect
    setVerify(allCorrect ? 'correct' : 'incorrect')
    setScore(s => ({ correct: s.correct + (allCorrect ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">Score: {score.correct}/{score.total}</span>
        <button onClick={nextProblem} className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors">
          Next problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-secondary mb-3">Classify the spontaneity:</p>
        <div className="grid grid-cols-2 gap-3 font-mono text-sm">
          <div>
            <span className="text-secondary text-xs">ΔH°</span>
            <p className="text-primary font-semibold mt-0.5">{problem.deltaH_kJ} kJ/mol</p>
          </div>
          <div>
            <span className="text-secondary text-xs">ΔS°</span>
            <p className="text-primary font-semibold mt-0.5">{problem.deltaS_JperK} J/(mol·K)</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-primary">Classification</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CLASS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSelected(opt.value); setVerify(null) }}
              className={`px-4 py-2.5 rounded-sm font-sans text-sm text-left border transition-all ${
                selected === opt.value
                  ? 'border-[var(--c-halogen)] bg-[color-mix(in_srgb,var(--c-halogen)_12%,rgb(var(--color-raised)))] text-bright'
                  : 'border-border bg-raised text-secondary hover:text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {needsCrossover && (
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-medium text-primary">Crossover temperature (K)</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              inputMode="decimal"
              value={tInput}
              onChange={e => { setTInput(e.target.value); setVerify(null) }}
              placeholder="T in K"
              className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40"
            />
            <span className="font-mono text-xs text-secondary">K</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCheck}
          disabled={!selected}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, transparent)',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Check
        </button>
        <button onClick={() => setShowSteps(s => !s)} className="px-3 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
          {showSteps ? 'Hide steps' : 'Show steps'}
        </button>
      </div>

      {verify && (
        <div className="flex flex-col gap-1">
          <p className={`font-mono text-sm font-semibold ${verify === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
            {verify === 'correct' ? '✓ Correct!' : `✗ Incorrect. Answer: ${problem.answer}${problem.crossoverT ? ` — Crossover T = ${problem.crossoverT.toFixed(1)} K` : ''}`}
          </p>
        </div>
      )}

      {showSteps && showAnswers && (
        <div className="p-3 rounded-sm border border-border bg-raised flex flex-col gap-1">
          {problem.steps.map((s, i) => (
            <p key={i} className="font-mono text-xs text-secondary">{s}</p>
          ))}
          <p className="font-sans text-xs text-secondary mt-2 italic">{problem.explanation}</p>
        </div>
      )}
      {showSteps && !showAnswers && <p className="font-sans text-sm text-dim italic">Step-by-step solution hidden.</p>}
    </div>
  )
}

import { useState, useCallback } from 'react'
import { willPrecipitate, kspToSolubility } from '../../chem/solubility'
import { KSP_TABLE } from '../../data/kspValues'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import type { VerifyState } from '../../utils/calcHelpers'

interface PrecipProblem {
  entry: typeof KSP_TABLE[0]
  cationConc: number
  anionConc: number
  Q: number
  precipitates: boolean
  prompt: string
}

function generateProblem(): PrecipProblem {
  const entry = KSP_TABLE[Math.floor(Math.random() * KSP_TABLE.length)]
  const s = kspToSolubility(entry.Ksp, entry.cation.count, entry.anion.count).solubility

  // Randomize: sometimes above Ksp, sometimes below
  const aboveKsp = Math.random() < 0.5
  const factor = aboveKsp
    ? (10 + Math.random() * 90)   // 10x – 100x above sat
    : (0.001 + Math.random() * 0.09)  // 0.1% – 10% of sat

  const cationConc = s * entry.cation.count * factor
  const anionConc  = s * entry.anion.count  * (aboveKsp ? factor * (0.5 + Math.random()) : factor * (0.5 + Math.random()))

  const r = willPrecipitate({ cation: cationConc, anion: anionConc }, entry.cation.count, entry.anion.count, entry.Ksp)

  const prompt =
    `A solution contains ${cationConc.toExponential(2)} M ${entry.cation.formula} ` +
    `and ${anionConc.toExponential(2)} M ${entry.anion.formula}. ` +
    `Calculate Q for ${entry.formula} (Ksp = ${entry.Ksp.toExponential(2)}).`

  return { entry, cationConc, anionConc, Q: r.Q, precipitates: r.precipitates, prompt }
}

interface Props {
  allowCustom?: boolean
}

export default function PrecipitationPractice({ allowCustom = true }: Props) {
  const [problem,  setProblem]  = useState(() => generateProblem())
  const [userAns,  setUserAns]  = useState('')
  const [verified, setVerified] = useState<VerifyState>(null)
  const [score,    setScore]    = useState({ correct: 0, total: 0 })

  const newProblem = useCallback(() => {
    setProblem(generateProblem())
    setUserAns('')
    setVerified(null)
  }, [])

  function verify() {
    const val = parseFloat(userAns)
    if (!isFinite(val)) return
    const relErr = Math.abs(val - problem.Q) / problem.Q
    let v: VerifyState
    if (relErr <= 0.03) v = 'correct'
    else if (relErr <= 0.15) v = 'sig_fig_warning'
    else v = 'incorrect'
    setVerified(v)
    setScore(s => ({ correct: s.correct + (v === 'correct' ? 1 : 0), total: s.total + 1 }))
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-secondary">
          Score: {score.correct}/{score.total}
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </p>
        <button
          onClick={newProblem}
          className="font-sans text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          New Problem
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-primary leading-relaxed">{problem.prompt}</p>
      </div>

      <NumberField
        label="Ion product Q ="
        value={userAns}
        onChange={v => { setUserAns(v); setVerified(null) }}
        placeholder="e.g. 3.2e-8"
        hint="Scientific notation: 3.2e-8"
      />

      <button
        onClick={verify}
        disabled={!userAns}
        className="py-2 px-4 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40 self-start"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
          color: 'var(--c-halogen)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
        }}
      >
        Check Answer
      </button>

      {verified && (
        <>
          <ResultDisplay
            label="Q (ion product)"
            value={problem.Q.toExponential(3)}
            unit=""
            verified={verified}
          />
          <div className="p-3 rounded-sm border border-border bg-raised">
            <p className="font-sans text-sm text-secondary">
              {problem.precipitates
                ? `Q > Ksp (${problem.entry.Ksp.toExponential(2)}) → ${problem.entry.formula} precipitates.`
                : `Q ≤ Ksp (${problem.entry.Ksp.toExponential(2)}) → no precipitate forms.`}
            </p>
          </div>
        </>
      )}

      {allowCustom && <div />}
    </div>
  )
}

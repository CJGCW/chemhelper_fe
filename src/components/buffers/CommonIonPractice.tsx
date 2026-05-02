import { useState, useCallback } from 'react'
import { kspToSolubility, solubilityWithCommonIon } from '../../chem/solubility'
import { KSP_TABLE } from '../../data/kspValues'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import type { VerifyState } from '../../utils/calcHelpers'

interface CommonIonProblem {
  entry: typeof KSP_TABLE[0]
  commonIonConc: number
  isCation: boolean
  answer: number
  prompt: string
}

const CONCS = [0.010, 0.050, 0.10, 0.20, 0.50]

function generateProblem(): CommonIonProblem {
  const entry = KSP_TABLE[Math.floor(Math.random() * KSP_TABLE.length)]
  const commonIonConc = CONCS[Math.floor(Math.random() * CONCS.length)]
  const isCation = Math.random() < 0.5

  let answer: number
  try {
    const r = solubilityWithCommonIon(entry.Ksp, entry.cation.count, entry.anion.count, {
      concentration: commonIonConc,
      isCation,
    })
    answer = r.solubility
  } catch {
    // Fallback
    answer = kspToSolubility(entry.Ksp, entry.cation.count, entry.anion.count).solubility
  }

  const ionFormula = isCation ? entry.cation.formula : entry.anion.formula

  const prompt =
    `Calculate the molar solubility of ${entry.formula} (${entry.name}, Ksp = ${entry.Ksp.toExponential(2)}) ` +
    `in a solution that already contains ${commonIonConc.toFixed(3)} M ${ionFormula}.`

  return { entry, commonIonConc, isCation, answer, prompt }
}

interface Props {
  allowCustom?: boolean
}

export default function CommonIonPractice({ allowCustom = true }: Props) {
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
    if (!isFinite(val) || val <= 0) return
    const relErr = Math.abs(val - problem.answer) / problem.answer
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
        label="Molar solubility (M)"
        value={userAns}
        onChange={v => { setUserAns(v); setVerified(null) }}
        placeholder="e.g. 1.8e-9"
        hint="Scientific notation is fine: 1.8e-9"
        unit={<span className="font-mono text-xs text-secondary px-2">M</span>}
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
        <ResultDisplay
          label="Expected molar solubility"
          value={problem.answer.toExponential(3)}
          unit="M"
          verified={verified}
        />
      )}

      {allowCustom && <div />}
    </div>
  )
}

import { useState, useCallback } from 'react'
import type { VerifyState } from '../../utils/calcHelpers'

interface ConceptQuestion {
  prompt: string
  type: 'numeric' | 'comparison'
  answer: number | 'greater' | 'less' | 'equal'
  tolerance?: number
  explanation: string
}

const QUESTION_BANK: ConceptQuestion[] = [
  {
    prompt: 'A weak acid (pKa = 5.20) is titrated with strong base. What is the pH at the half-equivalence point?',
    type: 'numeric',
    answer: 5.20,
    tolerance: 0.05,
    explanation: 'At the half-equivalence point, [HA] = [A⁻], so pH = pKa = 5.20.',
  },
  {
    prompt: 'A weak acid (Ka = 6.8×10⁻⁴, pKa = 3.17) is titrated with NaOH. Is the equivalence point pH greater, less, or equal to 7?\n\nEnter: 1 = greater, 0 = equal, −1 = less',
    type: 'numeric',
    answer: 1,
    tolerance: 0.1,
    explanation: 'Weak acid + strong base: at equivalence, only A⁻ remains. A⁻ hydrolyzes to give OH⁻, making pH > 7.',
  },
  {
    prompt: 'For a strong acid + strong base titration (0.10 M HCl titrated with 0.10 M NaOH, 25.0 mL analyte), what is the equivalence volume in mL?',
    type: 'numeric',
    answer: 25.0,
    tolerance: 0.5,
    explanation: 'Equivalence volume = (Ca × Va) / Cb = (0.10 × 25.0) / 0.10 = 25.0 mL.',
  },
  {
    prompt: 'For a strong acid + strong base titration, what is the equivalence point pH?',
    type: 'numeric',
    answer: 7.0,
    tolerance: 0.1,
    explanation: 'Strong acid + strong base produces only water and a neutral salt. pH = 7.0 at 25°C.',
  },
  {
    prompt: 'Ammonia (Kb = 1.8×10⁻⁵) is titrated with HCl. Is the equivalence point pH greater, less, or equal to 7?\n\nEnter: 1 = greater, 0 = equal, −1 = less',
    type: 'numeric',
    answer: -1,
    tolerance: 0.1,
    explanation: 'Weak base + strong acid: at equivalence, NH₄⁺ is the conjugate acid, which ionizes to give H⁺. pH < 7.',
  },
  {
    prompt: 'Acetic acid (Ka = 1.8×10⁻⁵, pKa = 4.74) is titrated with NaOH. At the half-equivalence point, pH = ?',
    type: 'numeric',
    answer: 4.74,
    tolerance: 0.05,
    explanation: 'At half-equivalence, [CH₃COOH] = [CH₃COO⁻], so pH = pKa = 4.74.',
  },
  {
    prompt: 'The buffer region in a weak acid titration spans approximately ± 1 pH unit of pKa. For formic acid (pKa = 3.77), what is the upper pH of the buffer region?',
    type: 'numeric',
    answer: 4.77,
    tolerance: 0.05,
    explanation: 'Buffer region upper limit = pKa + 1 = 3.77 + 1 = 4.77.',
  },
]

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface Props {
  allowCustom?: boolean
}

export default function TitrationCurvePractice({ allowCustom = true }: Props) {
  const [questions] = useState(() => shuffle(QUESTION_BANK))
  const [qIdx,      setQIdx]    = useState(0)
  const [userAns,   setUserAns] = useState('')
  const [verified,  setVerified] = useState<VerifyState>(null)
  const [score,     setScore]   = useState({ correct: 0, total: 0 })

  const q = questions[qIdx % questions.length]

  const next = useCallback(() => {
    setQIdx(i => i + 1)
    setUserAns('')
    setVerified(null)
  }, [])

  function check() {
    const val = parseFloat(userAns)
    if (!isFinite(val)) return
    const expected = q.answer as number
    const diff = Math.abs(val - expected)
    const tol = q.tolerance ?? 0.05
    let v: VerifyState
    if (diff <= tol) {
      v = 'correct'
    } else if (diff <= tol * 3) {
      v = 'sig_fig_warning'
    } else {
      v = 'incorrect'
    }
    setVerified(v)
    setScore(s => ({
      correct: s.correct + (v === 'correct' ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const verifyColor = verified === 'correct' ? '#4ade80' : verified === 'sig_fig_warning' ? '#facc15' : '#f87171'

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-secondary">
          Score: {score.correct}/{score.total}
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </p>
        <button
          onClick={next}
          className="font-sans text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-primary transition-colors"
        >
          Next Question
        </button>
      </div>

      <div className="p-4 rounded-sm border border-border bg-raised">
        <p className="font-sans text-sm text-primary leading-relaxed whitespace-pre-line">{q.prompt}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">Your answer:</label>
        <input
          type="text"
          inputMode="decimal"
          value={userAns}
          onChange={e => { setUserAns(e.target.value); setVerified(null) }}
          placeholder="Enter a number"
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 max-w-[200px]"
        />
      </div>

      <div className="flex items-stretch gap-2">
        <button
          onClick={check}
          disabled={!userAns}
          className="py-2 px-4 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
            color: 'var(--c-halogen)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
          }}
        >
          Check Answer
        </button>
      </div>

      {verified && (
        <div
          className="p-4 rounded-sm border flex flex-col gap-2"
          style={{
            borderColor: `color-mix(in srgb, ${verifyColor} 40%, rgb(var(--color-border)))`,
            background: `color-mix(in srgb, ${verifyColor} 6%, rgb(var(--color-surface)))`,
          }}
        >
          <p className="font-sans text-sm font-medium" style={{ color: verifyColor }}>
            {verified === 'correct' ? '✓ Correct!' : verified === 'sig_fig_warning' ? '⚠ Close — check precision' : '✗ Not quite'}
          </p>
          <p className="font-sans text-sm text-secondary">{q.explanation}</p>
          <p className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
            Expected: {q.answer}
          </p>
        </div>
      )}

      {allowCustom && <div />}
    </div>
  )
}

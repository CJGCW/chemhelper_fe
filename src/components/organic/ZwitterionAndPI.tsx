import { useState } from 'react'

interface AAPractice {
  name: string
  three: string
  pI: number
  pKa1: number
  pKa2: number
  pKaR?: number
  sideChainClass: 'neutral' | 'acidic' | 'basic'
}

const PRACTICE_AAS: AAPractice[] = [
  { name: 'Glycine',    three: 'Gly', pI: 5.97, pKa1: 2.34, pKa2: 9.60, sideChainClass: 'neutral' },
  { name: 'Alanine',   three: 'Ala', pI: 6.00, pKa1: 2.34, pKa2: 9.69, sideChainClass: 'neutral' },
  { name: 'Leucine',   three: 'Leu', pI: 5.98, pKa1: 2.36, pKa2: 9.60, sideChainClass: 'neutral' },
  { name: 'Serine',    three: 'Ser', pI: 5.68, pKa1: 2.21, pKa2: 9.15, sideChainClass: 'neutral' },
  { name: 'Cysteine',  three: 'Cys', pI: 5.07, pKa1: 1.96, pKa2: 8.18, pKaR: 8.30, sideChainClass: 'neutral' },
  { name: 'Aspartate', three: 'Asp', pI: 2.77, pKa1: 1.88, pKa2: 9.60, pKaR: 3.65, sideChainClass: 'acidic' },
  { name: 'Glutamate', three: 'Glu', pI: 3.22, pKa1: 2.19, pKa2: 9.67, pKaR: 4.25, sideChainClass: 'acidic' },
  { name: 'Lysine',    three: 'Lys', pI: 9.74, pKa1: 2.18, pKa2: 8.95, pKaR: 10.50, sideChainClass: 'basic' },
  { name: 'Arginine',  three: 'Arg', pI: 10.76, pKa1: 2.17, pKa2: 9.04, pKaR: 12.50, sideChainClass: 'basic' },
  { name: 'Histidine', three: 'His', pI: 7.59, pKa1: 1.82, pKa2: 9.17, pKaR: 6.00, sideChainClass: 'basic' },
]

const NICE_PHS = [1.0, 2.0, 3.0, 4.5, 5.5, 6.0, 7.0, 7.4, 9.0, 10.0, 11.0, 12.0]

type ChargeAnswer = 'positive' | 'zero' | 'negative'

interface Problem {
  aa: AAPractice
  pH: number
  correctCharge: ChargeAnswer
  dominantForm: string
}

function getCharge(aa: AAPractice, pH: number): ChargeAnswer {
  const tol = 0.3
  if (Math.abs(pH - aa.pI) < tol) return 'zero'
  if (pH < aa.pI) return 'positive'
  return 'negative'
}

function getDominantForm(aa: AAPractice, pH: number): string {
  if (aa.sideChainClass === 'neutral') {
    if (pH < aa.pKa1) return 'H₃N⁺—CHR—COOH (fully protonated, +1)'
    if (pH < aa.pKa2) return 'H₃N⁺—CHR—COO⁻ (zwitterion, 0)'
    return 'H₂N—CHR—COO⁻ (fully deprotonated, −1)'
  }
  if (aa.sideChainClass === 'acidic' && aa.pKaR) {
    if (pH < aa.pKa1) return 'fully protonated (+1): COOH, NH₃⁺, R-COOH'
    if (pH < aa.pKaR) return 'H₃N⁺—CHR—COO⁻, R-COOH (net 0)'
    if (pH < aa.pKa2) return 'H₃N⁺—CHR—COO⁻, R-COO⁻ (net −1)'
    return 'fully deprotonated (−2): COO⁻, NH₂, R-COO⁻'
  }
  if (aa.sideChainClass === 'basic' && aa.pKaR) {
    if (pH < aa.pKa1) return 'fully protonated (+2): COOH, NH₃⁺, R-NH₃⁺'
    if (pH < aa.pKaR) return 'H₃N⁺—CHR—COO⁻, R-NH₃⁺ (net +1)'
    if (pH < aa.pKa2) return 'H₃N⁺—CHR—COO⁻, R-NH₂ (zwitterion, 0)'
    return 'H₂N—CHR—COO⁻, R-NH₂ (net −1)'
  }
  return ''
}

function generateProblem(allowCustom: boolean): Problem {
  const pool = allowCustom ? PRACTICE_AAS : PRACTICE_AAS
  const aa = pool[Math.floor(Math.random() * pool.length)]
  const pH = NICE_PHS[Math.floor(Math.random() * NICE_PHS.length)]
  return {
    aa,
    pH,
    correctCharge: getCharge(aa, pH),
    dominantForm: getDominantForm(aa, pH),
  }
}

export default function ZwitterionAndPI({ allowCustom = true }: { allowCustom?: boolean }) {
  const [problem, setProblem] = useState<Problem>(() => generateProblem(allowCustom))
  const [selected, setSelected] = useState<ChargeAnswer | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function nextProblem() {
    setProblem(generateProblem(allowCustom))
    setSelected(null)
  }

  function handleSelect(ans: ChargeAnswer) {
    if (selected !== null) return
    setSelected(ans)
    setScore(s => ({
      correct: s.correct + (ans === problem.correctCharge ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const isCorrect = selected === problem.correctCharge

  const CHOICES: { id: ChargeAnswer; label: string; symbol: string }[] = [
    { id: 'positive', label: 'Positive (net +)', symbol: '+' },
    { id: 'zero',     label: 'Zero (zwitterion)', symbol: '±0' },
    { id: 'negative', label: 'Negative (net −)', symbol: '−' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Zwitterions & Isoelectric Point (pI)</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          At pH &lt; pI → net positive. At pH = pI → zwitterion (net zero). At pH &gt; pI → net negative.
        </p>
      </div>

      {/* Score */}
      {score.total > 0 && (
        <div className="text-xs font-sans text-secondary">
          Score: {score.correct}/{score.total} ({Math.round(100 * score.correct / score.total)}%)
        </div>
      )}

      {/* Question card */}
      <div className="rounded-sm border border-border p-5 flex flex-col gap-4" style={{ background: 'rgb(var(--color-raised))' }}>
        <div>
          <p className="font-sans text-xs text-secondary mb-1">Predict the dominant charge state:</p>
          <p className="font-sans text-sm font-semibold text-primary">
            What is the net charge of <span className="font-mono">{problem.aa.name} ({problem.aa.three})</span> at pH {problem.pH.toFixed(1)}?
          </p>
          <p className="font-sans text-xs text-secondary mt-2">
            pI = {problem.aa.pI.toFixed(2)}
            {problem.aa.pKaR != null && ` | pKa(R) = ${problem.aa.pKaR.toFixed(2)}`}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {CHOICES.map(c => {
            const isSelected = selected === c.id
            const isAnswer = c.id === problem.correctCharge
            let bg = 'rgb(var(--color-surface))'
            let border = 'rgb(var(--color-border))'
            let textColor = 'rgb(var(--color-primary))'
            if (selected !== null) {
              if (isAnswer) { bg = 'rgb(var(--color-success-bg) / 0.2)'; border = 'rgb(var(--color-success))'; textColor = 'rgb(var(--color-success))' }
              else if (isSelected && !isAnswer) { bg = 'rgb(var(--color-error-bg) / 0.2)'; border = 'rgb(var(--color-error))'; textColor = 'rgb(var(--color-error))' }
            }

            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                disabled={selected !== null}
                className="flex items-center gap-3 px-4 py-3 rounded-sm border text-left transition-colors"
                style={{ background: bg, borderColor: border }}
              >
                <span className="font-mono text-sm w-8 shrink-0" style={{ color: border }}>{c.symbol}</span>
                <span className="font-sans text-sm" style={{ color: textColor }}>{c.label}</span>
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="rounded-sm p-3 text-xs font-sans" style={{ background: isCorrect ? 'rgb(var(--color-success-bg) / 0.2)' : 'rgb(var(--color-error-bg) / 0.2)', color: isCorrect ? 'rgb(var(--color-success))' : 'rgb(var(--color-error))' }}>
            <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : `Incorrect — answer: ${problem.correctCharge}`}</p>
            <p>pH {problem.pH.toFixed(1)} {problem.pH < problem.aa.pI ? '<' : problem.pH > problem.aa.pI ? '>' : '≈'} pI {problem.aa.pI.toFixed(2)}</p>
            <p className="mt-1">Dominant form: {problem.dominantForm}</p>
          </div>
        )}
      </div>

      {/* Reference box */}
      <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-semibold text-primary mb-2">Rule of thumb</p>
        <div className="flex flex-col gap-1 text-secondary">
          <p><span className="font-semibold text-primary">pH &lt; pI:</span> protonated (+ charge) — moves toward cathode (−) in electrophoresis</p>
          <p><span className="font-semibold text-primary">pH = pI:</span> zwitterion, net zero — doesn&apos;t migrate in electrophoresis</p>
          <p><span className="font-semibold text-primary">pH &gt; pI:</span> deprotonated (− charge) — moves toward anode (+) in electrophoresis</p>
        </div>
      </div>

      <button
        onClick={nextProblem}
        className="self-start px-4 py-2 rounded-sm text-sm font-sans border transition-colors"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
          borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}
      >
        Next Problem
      </button>
    </div>
  )
}

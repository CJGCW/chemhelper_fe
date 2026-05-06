import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FHProblem {
  question: string
  sugar: string
  givenType: 'Fischer' | 'Haworth'
  description: string
  options: { label: string; description: string }[]
  correctIndex: number
  explanation: string
}

const PROBLEMS: FHProblem[] = [
  {
    question: 'Given the Fischer projection of D-glucose, which Haworth representation is correct?',
    sugar: 'D-Glucose (D-glucopyranose)',
    givenType: 'Fischer',
    description: 'Fischer projection of D-glucose: C1=CHO (top). C2-OH on RIGHT. C3-OH on LEFT. C4-OH on RIGHT. C5-OH on RIGHT. C6=CH₂OH (bottom). The C5-OH attacks C1 to form the 6-membered ring.',
    options: [
      {
        label: 'Haworth A',
        description: 'Ring O between C1 and C5. C1-OH DOWN (α). C2-OH DOWN. C3-OH UP. C4-OH DOWN. C5-CH₂OH UP.',
      },
      {
        label: 'Haworth B',
        description: 'Ring O between C1 and C5. C1-OH UP (β). C2-OH DOWN. C3-OH UP. C4-OH DOWN. C5-CH₂OH UP.',
      },
      {
        label: 'Haworth C',
        description: 'Ring O between C1 and C5. C1-OH DOWN (α). C2-OH UP. C3-OH DOWN. C4-OH UP. C5-CH₂OH DOWN.',
      },
    ],
    correctIndex: 0,
    explanation: 'Fischer → Haworth conversion rules for D-glucose:\n• RIGHT in Fischer → DOWN in Haworth: C2-OH right→down, C4-OH right→down\n• LEFT in Fischer → UP in Haworth: C3-OH left→up\n• D-sugar: C6 (CH₂OH) is UP in Haworth\n• C1-OH DOWN = α-anomer (the most common starting representation)\nResult: C1-OH down (α), C2-OH down, C3-OH up, C4-OH down, C5-CH₂OH up.',
  },
  {
    question: 'What is the Haworth representation for α-D-galactose?',
    sugar: 'α-D-Galactopyranose',
    givenType: 'Fischer',
    description: 'Fischer projection of D-galactose: CHO at top. C2-OH: RIGHT. C3-OH: LEFT. C4-OH: LEFT (this differs from glucose — galactose is the C4 epimer of glucose). C5-OH: RIGHT. CH₂OH at bottom.',
    options: [
      {
        label: 'Haworth A (correct)',
        description: 'C1-OH DOWN (α). C2-OH DOWN. C3-OH UP. C4-OH UP. C5-CH₂OH UP.',
      },
      {
        label: 'Haworth B',
        description: 'C1-OH DOWN (α). C2-OH DOWN. C3-OH UP. C4-OH DOWN. C5-CH₂OH UP. (This is α-D-glucose, not galactose)',
      },
      {
        label: 'Haworth C',
        description: 'C1-OH UP (β). C2-OH DOWN. C3-OH UP. C4-OH UP. C5-CH₂OH UP. (This is β-D-galactose)',
      },
    ],
    correctIndex: 0,
    explanation: 'D-Galactose differs from D-glucose only at C4. In Fischer: C4-OH is on the LEFT for galactose (vs RIGHT for glucose). Fischer LEFT → Haworth UP. So C4-OH is UP in the Haworth of galactose (vs DOWN for glucose). All other positions are the same as glucose. The α anomer has C1-OH DOWN.',
  },
  {
    question: 'In the Haworth projection of β-D-fructofuranose, the anomeric OH is:',
    sugar: 'β-D-Fructofuranose',
    givenType: 'Haworth',
    description: 'Fructose is a ketohexose (ketone at C2). In the furanose form, C2-OH attacks C5 to form a 5-membered ring. The anomeric carbon is C2.',
    options: [
      { label: 'C2-OH pointing DOWN', description: 'α-D-fructofuranose (anomeric OH down)' },
      { label: 'C2-OH pointing UP', description: 'β-D-fructofuranose (anomeric OH up, β by convention)' },
      { label: 'No anomeric OH (C2 has no OH in the ring)', description: 'Incorrect — the C2 carbon still carries an OH in the ring form' },
    ],
    correctIndex: 1,
    explanation: 'In β-D-fructofuranose, the anomeric carbon is C2 (the ketone carbon). By convention, β = the anomeric OH is UP in the Haworth projection. This is the form found in sucrose, where fructose is linked via its β-C2 oxygen to glucose-α-C1 (an α,β-1,2-glycosidic bond).',
  },
  {
    question: 'When converting D-glucose from Fischer to Haworth, which statement about the CH₂OH group is correct?',
    sugar: 'D-Glucose CH₂OH',
    givenType: 'Fischer',
    description: 'General rule for drawing D-sugars in Haworth projection: the CH₂OH group at the bottom of the Fischer projection (C6 of hexoses).',
    options: [
      { label: 'CH₂OH is DOWN in Haworth for D-sugars', description: 'L-sugars have CH₂OH down; D-sugars have it up' },
      { label: 'CH₂OH is UP in Haworth for D-sugars', description: 'The CH₂OH (C6) of D-hexoses is drawn UP in the Haworth — above the ring plane' },
      { label: 'CH₂OH is horizontal (in the plane) for all sugars', description: 'CH₂OH is definitely not in the ring plane' },
    ],
    correctIndex: 1,
    explanation: 'For D-sugars in pyranose Haworth projection: the CH₂OH (C6) is UP. This is because in the Fischer projection, C5 of D-glucose has its OH on the RIGHT. RIGHT → DOWN applies to ring hydroxyls, but C6 (not in the ring) goes UP for D-sugars. For L-sugars, CH₂OH is DOWN.',
  },
]

function pickRandom(): FHProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export default function FischerHaworthConverter() {
  const [problem, setProblem] = useState<FHProblem>(pickRandom)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const correct = selected === problem.correctIndex

  function handleCheck() {
    if (selected === null || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setSelected(null)
    setChecked(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Rules box */}
      <div className="rounded-sm border border-border p-3 flex flex-col gap-1.5" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Fischer → Haworth Rules (D-sugars)</p>
        <div className="flex flex-col gap-1 text-xs font-sans">
          <p className="text-secondary"><strong className="text-primary">RIGHT</strong> in Fischer → <strong className="text-primary">DOWN</strong> in Haworth</p>
          <p className="text-secondary"><strong className="text-primary">LEFT</strong> in Fischer → <strong className="text-primary">UP</strong> in Haworth</p>
          <p className="text-secondary">CH₂OH (last carbon) → <strong className="text-primary">UP</strong> for D-sugars, DOWN for L-sugars</p>
          <p className="text-secondary"><strong className="text-primary">α</strong> = anomeric OH DOWN | <strong className="text-primary">β</strong> = anomeric OH UP</p>
        </div>
      </div>

      <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">{problem.sugar} ({problem.givenType} → Haworth)</span>
        <p className="font-sans text-sm text-primary font-medium">{problem.question}</p>
        <p className="font-sans text-xs text-secondary leading-relaxed mt-1">{problem.description}</p>
      </div>

      <div className="flex flex-col gap-2">
        {problem.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === problem.correctIndex
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          if (checked) {
            if (isCorrect) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.06)' }
            else if (isSelected) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.06)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'
            bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))'
          }
          return (
            <button key={i} onClick={() => !checked && setSelected(i)} disabled={checked}
              className="flex flex-col gap-1 p-3 rounded-sm border text-left transition-colors"
              style={{ borderColor, background: bg }}>
              <span className="font-sans text-sm font-semibold text-primary">{opt.label}</span>
              <span className="font-mono text-xs text-secondary">{opt.description}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={selected === null}
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
            Next
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-3 flex flex-col gap-1.5 ${correct ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
              {correct ? '✓ Correct!' : `✗ Incorrect — ${problem.options[problem.correctIndex].label} is correct.`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed whitespace-pre-line">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

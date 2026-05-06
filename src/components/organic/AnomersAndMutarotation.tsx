import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Reference ─────────────────────────────────────────────────────────────────

function AnomersReference() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Anomers &amp; Mutarotation</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          When a sugar cyclizes, a new stereocenter is created at C1 (the anomeric carbon). The two ring forms are called <strong className="text-primary">anomers</strong>.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Anomeric Carbon</h4>
        <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-sans text-xs text-secondary leading-relaxed">
            The <strong className="text-primary">anomeric carbon</strong> is the carbon that was the carbonyl carbon in the open-chain form.
            For aldoses, this is <strong className="text-primary">C1</strong>. For ketoses (like fructose), this is C2.
            Cyclization creates a new chiral center — the OH at C1 can be either α or β.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">α vs. β Anomers (Haworth Projection)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">α-Anomer</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">
              The OH at the anomeric carbon is <strong className="text-primary">DOWN</strong> (on the same side as the ring oxygen, BELOW the ring plane in the Haworth projection of a D-pyranose).
            </p>
            <p className="font-sans text-xs text-dim">In chair: axial position (less stable for D-glucose)</p>
          </div>
          <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary">β-Anomer</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">
              The OH at the anomeric carbon is <strong className="text-primary">UP</strong> (opposite side from the ring oxygen, ABOVE the ring plane in the Haworth projection of a D-pyranose).
            </p>
            <p className="font-sans text-xs text-dim">In chair: equatorial position (more stable for D-glucose)</p>
          </div>
        </div>
        <div className="rounded-sm border border-border p-3 font-mono text-xs" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="text-dim mb-1">Memory aid (Haworth, D-sugars):</p>
          <p className="text-primary">α  =  axial  =  <strong>down</strong>  (anomeric OH below ring)</p>
          <p className="text-primary">β  =  below opposite  =  <strong>up</strong>  (anomeric OH above ring)</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Mutarotation</h4>
        <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-sans text-xs text-secondary leading-relaxed">
            In solution, the α and β anomers interconvert through the open-chain form. This process is called <strong className="text-primary">mutarotation</strong>.
            The specific rotation of a freshly dissolved sugar slowly changes until equilibrium is reached.
          </p>
          <div className="flex flex-col gap-1 mt-1">
            <p className="font-mono text-xs text-primary">α-D-glucose ⇌ open-chain D-glucose ⇌ β-D-glucose</p>
            <p className="font-sans text-xs text-dim">Equilibrium at 25°C: 36% α + 64% β (β is more stable — equatorial OH)</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="text-xs font-sans border-collapse w-full">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left font-semibold text-secondary">Sugar</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">% α at equil.</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">% β at equil.</th>
                <th className="px-3 py-2 text-left font-semibold text-secondary">Note</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sugar: 'D-Glucose', a: '36', b: '64', note: 'β favored (equatorial OH at C1)' },
                { sugar: 'D-Galactose', a: '27', b: '73', note: 'β favored (more equatorial)' },
                { sugar: 'D-Mannose', a: '67', b: '33', note: 'α slightly favored (anomeric effect stronger at C2 axial)' },
                { sugar: 'D-Ribose', a: '~20 (furanose)', b: '~60 (furanose)', note: 'Ribose prefers furanose ring' },
              ].map(r => (
                <tr key={r.sugar} className="border-b border-border/50">
                  <td className="px-3 py-2 font-semibold text-primary">{r.sugar}</td>
                  <td className="px-3 py-2 font-mono text-secondary">{r.a}%</td>
                  <td className="px-3 py-2 font-mono text-secondary">{r.b}%</td>
                  <td className="px-3 py-2 text-dim">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Glycosides — Locking the Anomer</h4>
        <div className="rounded-sm border border-border p-3 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-sans text-xs text-secondary leading-relaxed">
            Treating a sugar with an alcohol + acid catalyst forms a <strong className="text-primary">glycoside</strong> — an acetal at the anomeric carbon (C–O–R instead of C–OH).
            Once formed, the anomeric C is locked: <strong className="text-primary">no more mutarotation</strong>.
            Glycosides are stable to base but hydrolyzed by aqueous acid back to the free sugar.
          </p>
        </div>
      </section>
    </div>
  )
}

// ── Practice ──────────────────────────────────────────────────────────────────

interface AnomerProblem {
  sugar: string
  description: string
  anomerCHPosition: string
  ohPosition: string
  correctAnomer: 'α' | 'β'
  explanation: string
}

const PROBLEMS: AnomerProblem[] = [
  {
    sugar: 'D-Glucose Haworth projection',
    description: 'In the pyranose (6-membered ring) form of D-glucose, the anomeric OH (at C1) points DOWN (below the ring plane in the Haworth projection).',
    anomerCHPosition: 'C1', ohPosition: 'DOWN (below ring plane)',
    correctAnomer: 'α',
    explanation: 'α-D-glucose: the anomeric OH at C1 is DOWN in the Haworth projection. "α = down" for D-sugars in pyranose form. In the chair, this corresponds to the axial position.',
  },
  {
    sugar: 'D-Glucose Haworth projection',
    description: 'In the pyranose (6-membered ring) form of D-glucose, the anomeric OH (at C1) points UP (above the ring plane in the Haworth projection).',
    anomerCHPosition: 'C1', ohPosition: 'UP (above ring plane)',
    correctAnomer: 'β',
    explanation: 'β-D-glucose: the anomeric OH at C1 is UP in the Haworth projection. "β = up" for D-sugars. In the chair, this is the equatorial position. β-D-glucose is more stable (64% at equilibrium).',
  },
  {
    sugar: 'D-Galactose Haworth projection',
    description: 'In the Haworth projection of D-galactopyranose, the anomeric OH at C1 is on the SAME side as the ring oxygen (pointing DOWN).',
    anomerCHPosition: 'C1', ohPosition: 'DOWN (same side as ring O)',
    correctAnomer: 'α',
    explanation: 'α-D-galactose: anomeric OH DOWN. Same rule as glucose — the α anomer always has the anomeric OH DOWN in the Haworth projection for D-pyranoses.',
  },
  {
    sugar: 'D-Galactose Haworth projection',
    description: 'In the Haworth projection of D-galactopyranose, the anomeric OH at C1 is OPPOSITE to the ring oxygen (pointing UP).',
    anomerCHPosition: 'C1', ohPosition: 'UP (opposite side from ring O)',
    correctAnomer: 'β',
    explanation: 'β-D-galactose: anomeric OH UP. Note that galactose and glucose differ at C4 (galactose has C4-OH UP in Haworth = axial in chair), but the α/β rule at C1 is the same for all D-pyranoses.',
  },
  {
    sugar: 'D-Fructose (furanose form)',
    description: 'In β-D-fructofuranose (5-membered ring), the anomeric carbon is C2. The OH at C2 is pointing UP in the Haworth projection.',
    anomerCHPosition: 'C2 (ketose)', ohPosition: 'UP',
    correctAnomer: 'β',
    explanation: 'For fructose (a ketose), the anomeric carbon is C2, not C1. In β-D-fructofuranose, the C2-OH is UP. This is the form found in sucrose (glucose-α(1→2)-fructose-β).',
  },
]

function pickRandom(): AnomerProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

function AnomerPractice() {
  const [problem, setProblem] = useState<AnomerProblem>(pickRandom)
  const [answer, setAnswer] = useState<'α' | 'β' | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const correct = answer === problem.correctAnomer

  function handleCheck() {
    if (!answer || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setAnswer(null)
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

      <div className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">{problem.sugar}</span>
        <p className="font-sans text-sm text-primary leading-relaxed">{problem.description}</p>
        <p className="font-sans text-sm text-primary font-medium mt-1">Is this the α or β anomer?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['α', 'β'] as const).map(opt => {
          const isSelected = answer === opt
          const isCorrect = opt === problem.correctAnomer
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
            <button key={opt} onClick={() => !checked && setAnswer(opt)} disabled={checked}
              className="py-5 rounded-sm border font-serif text-3xl font-bold transition-colors"
              style={{ borderColor, background: bg, color: isSelected ? 'var(--c-halogen)' : 'rgb(var(--overlay)/0.5)' }}>
              {opt}
            </button>
          )
        })}
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
            Next
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-3 flex flex-col gap-1.5 ${correct ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-400'}`}>
              {correct ? `✓ Correct! This is the ${problem.correctAnomer}-anomer.` : `✗ This is the ${problem.correctAnomer}-anomer.`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props { allowCustom?: boolean }

export default function AnomersAndMutarotation({ allowCustom = true }: Props) {
  return allowCustom
    ? <div className="flex flex-col gap-10"><AnomersReference /><div className="border-t border-border" /><AnomerPractice /></div>
    : <AnomerPractice />
}

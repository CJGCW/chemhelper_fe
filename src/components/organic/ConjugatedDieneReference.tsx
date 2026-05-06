import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PracticeProblem {
  diene: string
  reagent: string
  kinetic: string
  thermodynamic: string
  conditions: string
  explanation: string
}

const PROBLEMS: PracticeProblem[] = [
  {
    diene: '1,3-Butadiene',
    reagent: 'HBr (1 equiv)',
    kinetic: '3-bromo-1-butene (1,2-addition product)',
    thermodynamic: '1-bromo-2-butene (1,4-addition product)',
    conditions: 'Kinetic: low temperature (−78°C). Thermodynamic: high temperature or long reaction time.',
    explanation: '1,2-addition is faster (lower Ea) but gives the less stable product. 1,4-addition requires more energy but gives the more stable product (more substituted alkene at C2=C3 position).',
  },
  {
    diene: '1,3-Butadiene',
    reagent: 'Br₂ (1 equiv)',
    kinetic: '3,4-dibromobut-1-ene (1,2-addition)',
    thermodynamic: '1,4-dibromobut-2-ene (1,4-addition)',
    conditions: 'Kinetic: −15°C. Thermodynamic: 60°C or longer time.',
    explanation: 'At low temperature, the allylic cation/radical intermediate is captured at the nearest carbon (1,2). At high temperature, the more stable 1,4 product accumulates.',
  },
  {
    diene: '2-Methyl-1,3-butadiene (isoprene)',
    reagent: 'HCl (1 equiv)',
    kinetic: '1,2-addition at the terminal diene end',
    thermodynamic: '1,4-addition product (more substituted alkene)',
    conditions: 'Low T → kinetic; high T → thermodynamic.',
    explanation: 'Isoprene is an unsymmetrical diene. The allylic carbocation forms at the more substituted position; 1,4-closure gives the thermodynamically stable trisubstituted alkene.',
  },
]

function randomProblem(): PracticeProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function ConjugatedDieneReference({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<PracticeProblem>(randomProblem)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function handleSelect(opt: string) {
    if (selected !== null) return
    setSelected(opt)
    setScore(s => ({ correct: s.correct + (opt === '1,4-addition' ? 1 : 0), total: s.total + 1 }))
  }
  void handleSelect

  function nextProblem() {
    let next: PracticeProblem
    do { next = randomProblem() } while (next.diene === problem.diene && PROBLEMS.length > 1)
    setProblem(next)
    setSelected(null)
  }
  void score

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">1,2- vs 1,4-Addition to Conjugated Dienes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold" style={{ color: 'var(--c-halogen)' }}>1,2-Addition (Kinetic Product)</p>
            <ul className="font-sans text-sm text-secondary flex flex-col gap-1 list-disc list-inside">
              <li>Electrophile attacks C1; nucleophile adds to C2</li>
              <li>Formed faster — lower activation energy (Eₐ)</li>
              <li>Preferred at <strong className="text-primary">low temperatures</strong></li>
              <li>Less stable product (less substituted alkene)</li>
              <li>Kinetically controlled product</li>
            </ul>
          </div>
          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold" style={{ color: 'var(--c-halogen)' }}>1,4-Addition (Thermodynamic Product)</p>
            <ul className="font-sans text-sm text-secondary flex flex-col gap-1 list-disc list-inside">
              <li>Electrophile attacks C1; nucleophile adds to C4</li>
              <li>More stable product (more substituted alkene at C2=C3)</li>
              <li>Preferred at <strong className="text-primary">high temperatures</strong> or longer time</li>
              <li>Reaction is reversible under thermodynamic conditions</li>
              <li>Thermodynamically controlled product</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-sm border border-border bg-surface flex flex-col gap-2">
          <p className="font-mono text-xs text-dim uppercase tracking-wider">Mechanism</p>
          <p className="font-sans text-sm text-secondary leading-relaxed">
            An electrophile (H⁺ or X⁺) adds to C1 of the diene, generating a <strong className="text-primary">delocalized allylic cation</strong>
            spanning C2–C4 (resonance structures at C2 and C4). The nucleophile can then attack at
            C2 (1,2-product) or C4 (1,4-product).
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">s-cis and s-trans Conformations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold text-primary">s-cis</p>
            <p className="font-sans text-sm text-secondary">Both double bonds on the SAME side of the single bond (dihedral ≈ 0°). Required for Diels-Alder reaction — the diene must be in s-cis to achieve the required geometry for [4+2] cycloaddition.</p>
          </div>
          <div className="p-3 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-xs font-semibold text-primary">s-trans</p>
            <p className="font-sans text-sm text-secondary">Double bonds on OPPOSITE sides of the single bond (dihedral ≈ 180°). More stable for acyclic dienes due to lower steric strain, but cannot react in Diels-Alder.</p>
          </div>
        </div>
        <p className="font-sans text-xs text-dim">
          Cyclic dienes locked in s-cis conformation (e.g., cyclopentadiene, furan) are excellent Diels-Alder dienes.
          1,3-Cyclohexadiene is locked s-cis; acyclic 1,3-dienes equilibrate between s-cis and s-trans.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Practice: Predict the Product</h3>
        <p className="font-sans text-sm text-secondary">Given the reaction conditions, identify whether the kinetic (1,2) or thermodynamic (1,4) product is formed.</p>

        <AnimatePresence mode="wait">
          <motion.div key={problem.diene + problem.reagent}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4">
            <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
              <p className="font-mono text-xs text-dim">{problem.diene}</p>
              <p className="font-sans text-sm text-primary"><strong>Reagent:</strong> {problem.reagent}</p>
              <p className="font-sans text-sm text-primary"><strong>Conditions:</strong> {problem.conditions}</p>
              <p className="font-sans text-sm text-secondary">Which product is obtained under thermodynamic control?</p>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: '1,2-addition', text: problem.kinetic },
                { label: '1,4-addition', text: problem.thermodynamic },
              ].map(opt => {
                const isSelected = selected === opt.label
                const isCorrect = opt.label === '1,4-addition'
                let style = 'border-border text-secondary hover:border-muted hover:text-primary'
                if (selected !== null && isCorrect) style = 'border-emerald-700/70 bg-emerald-950/25 text-success'
                if (selected !== null && isSelected && !isCorrect) style = 'border-rose-700/70 bg-rose-950/25 text-error'
                return (
                  <button key={opt.label} disabled={selected !== null}
                    onClick={() => {
                      if (selected !== null) return
                      setSelected(opt.label)
                    }}
                    className={`text-left px-4 py-2.5 rounded-sm border font-sans text-sm transition-colors ${style}`}>
                    <span className="font-semibold">{opt.label}:</span> {opt.text}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-sm border text-sm font-sans ${selected === '1,4-addition' ? 'feedback-success text-success-strong' : 'feedback-error text-error-strong'}`}>
                <span className="font-semibold">{selected === '1,4-addition' ? 'Correct. ' : 'Incorrect — 1,4-addition is the thermodynamic product. '}</span>
                {problem.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {selected !== null && (
          <button onClick={nextProblem}
            className="self-start px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Next Problem →
          </button>
        )}
      </section>
    </div>
  )
}

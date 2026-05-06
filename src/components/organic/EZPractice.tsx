import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'

interface EZProblem {
  alkene: string
  smiles: string
  description: string
  config: 'E' | 'Z'
  explanation: string
}

const PROBLEMS: EZProblem[] = [
  {
    alkene: 'cis-2-butene',
    smiles: 'C/C=C\\C',
    description: 'C1: CH₃ (higher) and H (lower). C2: CH₃ (higher) and H (lower). The two CH₃ groups are on the SAME side of the double bond.',
    config: 'Z',
    explanation: 'Higher-priority groups (CH₃ > H on each carbon) on the SAME side = Z (zusammen = together).',
  },
  {
    alkene: 'trans-2-butene',
    smiles: 'C/C=C/C',
    description: 'C1: CH₃ (higher) and H (lower). C2: CH₃ (higher) and H (lower). The two CH₃ groups are on OPPOSITE sides of the double bond.',
    config: 'E',
    explanation: 'Higher-priority groups (CH₃) on OPPOSITE sides = E (entgegen = opposite).',
  },
  {
    alkene: 'Z-2-bromo-2-butene',
    smiles: 'C/C(Br)=C\\C',
    description: 'C2: Br (higher, Z=35) and CH₃ (lower). C3: CH₃ (higher) and H (lower). Br and CH₃(C3) are on the SAME side.',
    config: 'Z',
    explanation: 'C2: Br > CH₃. C3: CH₃ > H. The high-priority groups (Br on C2, CH₃ on C3) are on the same side → Z.',
  },
  {
    alkene: 'Z-1-bromo-2-chloroethene',
    smiles: 'Br/C=C\\Cl',
    description: 'C1: Br (Z=35) and H. C2: Cl (Z=17) and H. Br and Cl are on the SAME side.',
    config: 'Z',
    explanation: 'C1: Br(1) > H(2). C2: Cl(1) > H(2). Br and Cl on same side → same-side priorities → Z.',
  },
  {
    alkene: 'E-1-bromo-2-chloroethene',
    smiles: 'Br/C=C/Cl',
    description: 'C1: Br (Z=35) and H. C2: Cl (Z=17) and H. Br and Cl are on OPPOSITE sides.',
    config: 'E',
    explanation: 'Br on C1 (higher priority) and Cl on C2 (higher priority) are on opposite sides → E.',
  },
  {
    alkene: 'maleic acid (Z-butenedioic acid)',
    smiles: 'OC(=O)/C=C\\C(=O)O',
    description: 'C2: COOH and H. C3: COOH and H. Both COOH groups are on the SAME side. (This is maleic acid.)',
    config: 'Z',
    explanation: 'COOH > H on each carbon. Both COOH groups on the same side = Z (cis-butenedioic acid = maleic acid).',
  },
  {
    alkene: 'fumaric acid (E-butenedioic acid)',
    smiles: 'OC(=O)/C=C/C(=O)O',
    description: 'C2: COOH and H. C3: COOH and H. The two COOH groups are on OPPOSITE sides. (This is fumaric acid.)',
    config: 'E',
    explanation: 'COOH groups on opposite sides = E (trans-butenedioic acid = fumaric acid). Fumaric is more stable (fewer steric clashes).',
  },
  {
    alkene: '2-methyl-2-butenenitrile',
    smiles: 'CC(=CC)C#N',
    description: 'C2: CN (higher, N at first atom) and CH₃ (lower). C3: CH₃ (higher) and H (lower). CN and H are on the SAME side.',
    config: 'E',
    explanation: 'C2: CN(1, N then C) > CH₃(2). C3: CH₃(1) > H(2). The high-priority groups (CN on C2, CH₃ on C3) are on OPPOSITE sides (CN is with H, not with CH₃) → E.',
  },
]

function randomProblem(): EZProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function EZPractice({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<EZProblem>(randomProblem)
  const [answer, setAnswer] = useState<'E' | 'Z' | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function submit(cfg: 'E' | 'Z') {
    if (answer !== null) return
    setAnswer(cfg)
    setScore(s => ({ correct: s.correct + (cfg === problem.config ? 1 : 0), total: s.total + 1 }))
  }

  function nextProblem() {
    let next: EZProblem
    do { next = randomProblem() } while (next.description === problem.description && PROBLEMS.length > 1)
    setProblem(next)
    setAnswer(null)
  }

  const checked = answer !== null
  const correct = answer === problem.config

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="p-3 rounded-sm border border-border bg-surface text-sm font-sans text-secondary flex flex-col gap-1">
        <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">E/Z Rules</p>
        <p><span className="text-primary font-semibold">Z</span> (zusammen = together): higher-priority groups on the <span className="text-primary">SAME</span> side</p>
        <p><span className="text-primary font-semibold">E</span> (entgegen = opposite): higher-priority groups on <span className="text-primary">OPPOSITE</span> sides</p>
        <p className="text-dim text-xs mt-1">Priorities assigned by CIP rules: higher atomic number wins; use phantom atoms for double bonds.</p>
      </div>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span><span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.description}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-4">
          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <CompoundDisplay smiles={problem.smiles} label={problem.alkene} width={200} height={150} />
              <div className="flex flex-col gap-1 flex-1">
                <p className="font-mono text-xs text-dim">{problem.alkene}</p>
                <p className="font-sans text-sm text-primary leading-relaxed">{problem.description}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {(['E', 'Z'] as const).map(cfg => {
              let style = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && cfg === problem.config) style = 'feedback-success text-success'
              if (checked && answer === cfg && cfg !== problem.config) style = 'feedback-error text-error'
              return (
                <button key={cfg} disabled={checked} onClick={() => submit(cfg)}
                  className={`px-8 py-3 rounded-sm border font-mono text-lg font-bold transition-colors ${style}`}>
                  {cfg}
                </button>
              )
            })}
          </div>

          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-sm border text-sm font-sans ${correct ? 'feedback-success text-success-strong' : 'feedback-error text-error-strong'}`}>
              <span className="font-semibold">{correct ? 'Correct — ' : `Incorrect (${problem.config}) — `}</span>
              {problem.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {checked && (
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
    </div>
  )
}

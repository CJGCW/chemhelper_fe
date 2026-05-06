import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'

interface RSProblem {
  smiles: string
  description: string
  substituents: string[]
  priorities: number[]  // priority rank for each substituent (1=highest, 4=lowest)
  config: 'R' | 'S'
  explanation: string
}

const PROBLEMS: RSProblem[] = [
  {
    smiles: 'CC[C@H](Br)C',
    description: '(R)-2-Bromobutane: C2 bonded to Br (front), CH₂CH₃ (wedge), CH₃ (dash), H (back)',
    substituents: ['Br', 'CH₂CH₃', 'CH₃', 'H'],
    priorities: [1, 2, 3, 4],
    config: 'R',
    explanation: 'Priorities: Br(1) > CH₂CH₃(2) > CH₃(3) > H(4). With H pointing back, 1→2→3 traces clockwise → R.',
  },
  {
    smiles: 'OC[C@@H](Cl)C',
    description: '(S)-2-Chloro-1-propanol: C2 bonded to OH, Cl, CH₃, H (with H pointing away)',
    substituents: ['OH', 'Cl', 'CH₃', 'H'],
    priorities: [2, 1, 3, 4],
    config: 'S',
    explanation: 'Cl(1) > O of OH(2) > C of CH₃(3) > H(4). With H away, trace Cl→OH→CH₃: counterclockwise → S.',
  },
  {
    smiles: 'OC[C@@H](O)C=O',
    description: '(R)-Glyceraldehyde (D-): central C bonded to OH (right, equatorial), CHO (top), CH₂OH (bottom), H (left, into page)',
    substituents: ['CHO', 'OH', 'CH₂OH', 'H'],
    priorities: [3, 1, 2, 4],
    config: 'R',
    explanation: 'OH(1) > CH₂OH(2) > CHO(3) > H(4). With H pointing away (into page), trace OH→CH₂OH→CHO: clockwise → R. D-glyceraldehyde is (R).',
  },
  {
    smiles: 'C[C@@H](O)C(=O)O',
    description: '(S)-Lactic acid: the chiral center bonded to OH, COOH, CH₃, H (H points toward viewer)',
    substituents: ['OH', 'COOH', 'CH₃', 'H'],
    priorities: [2, 1, 3, 4],
    config: 'S',
    explanation: 'COOH(1) > OH(2) > CH₃(3) > H(4). H points toward viewer, so the observed rotation is reversed. Apparent trace COOH→OH→CH₃ is clockwise (R), but flip for H toward viewer → S.',
  },
  {
    smiles: 'C[C@H](F)Br',
    description: '(R)-1-Bromo-1-fluoroethane: C1 bonded to Br, F, CH₃, H (H points away)',
    substituents: ['Br', 'F', 'CH₃', 'H'],
    priorities: [2, 1, 3, 4],
    config: 'R',
    explanation: 'F(1) > Br(2) > C of CH₃(3) > H(4). With H away, trace F→Br→CH₃: clockwise → R.',
  },
  {
    smiles: 'CN(I)CBr',
    description: 'A chiral center bonded to I, NH₂, CH₂Br, CH₃ (H absent — this carbon has no H). Wedge is NH₂, dash is CH₃, front is I, back is CH₂Br.',
    substituents: ['I', 'NH₂', 'CH₂Br', 'CH₃'],
    priorities: [1, 3, 2, 4],
    config: 'S',
    explanation: 'I(1) > CH₂Br(2, Br outranks N at next atom) > NH₂(3, N) > CH₃(4). With CH₃ in back, trace I→CH₂Br→NH₂: counterclockwise → S.',
  },
]

function randomProblem(): RSProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function RSAssignmentPractice({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<RSProblem>(randomProblem)
  const [answer, setAnswer] = useState<'R' | 'S' | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function submit(config: 'R' | 'S') {
    if (answer !== null) return
    setAnswer(config)
    setScore(s => ({ correct: s.correct + (config === problem.config ? 1 : 0), total: s.total + 1 }))
  }

  function nextProblem() {
    let next: RSProblem
    do { next = randomProblem() } while (next.description === problem.description && PROBLEMS.length > 1)
    setProblem(next)
    setAnswer(null)
  }

  const checked = answer !== null
  const correct = answer === problem.config

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Assign R or S configuration to each chiral center using the CIP rules.
        Priority 1 = highest atomic number (or furthest along chain); priority 4 points away.
        Clockwise 1→2→3 = R; counterclockwise = S.
      </p>

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
              <CompoundDisplay smiles={problem.smiles} width={200} height={170} />
              <div className="flex flex-col gap-2 flex-1">
                <p className="font-sans text-sm text-primary leading-relaxed">{problem.description}</p>
                <div className="flex flex-wrap gap-2">
                  {problem.substituents.map((sub, i) => (
                    <span key={i} className="font-mono text-xs px-2 py-1 rounded-sm border border-border bg-raised text-secondary">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {checked && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs text-dim uppercase tracking-wider">CIP Priorities</p>
              <div className="flex flex-wrap gap-2">
                {problem.substituents.map((sub, i) => (
                  <div key={i} className="flex items-center gap-1 font-mono text-xs px-2 py-1 rounded-sm border border-border bg-raised">
                    <span className="text-dim">({problem.priorities[i]})</span>
                    <span className="text-primary">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {(['R', 'S'] as const).map(cfg => {
              let style = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && cfg === problem.config) style = 'border-emerald-700/70 bg-emerald-950/25 text-success'
              if (checked && answer === cfg && cfg !== problem.config) style = 'border-rose-700/70 bg-rose-950/25 text-error'
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
              <span className="font-semibold">{correct ? 'Correct — ' : 'Incorrect — '}</span>
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

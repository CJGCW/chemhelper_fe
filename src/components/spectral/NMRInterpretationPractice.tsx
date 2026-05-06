import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpectrumViewer, { type Peak } from './SpectrumViewer'
import CompoundDisplay from '../shared/CompoundDisplay'

interface NMRQuestion {
  stem: string
  type: 'mc' | 'numeric'
  options?: string[]
  correct: string | number
  explanation: string
}

interface NMRProblem {
  title: string
  compound: string
  smiles?: string
  peaks: Peak[]
  questions: NMRQuestion[]
}

const PROBLEMS: NMRProblem[] = [
  {
    title: '¹H NMR — Ethyl acetate (CH₃COOCH₂CH₃)',
    compound: 'Ethyl acetate',
    smiles: 'CCOC(=O)C',
    peaks: [
      { x: 4.12, y: 0.8, label: '–OCH₂–', width: 0.06, splitting: 'quartet', integration: 2 },
      { x: 2.05, y: 0.8, label: 'CH₃CO–', width: 0.06, splitting: 'singlet', integration: 3 },
      { x: 1.25, y: 0.8, label: '–CH₂CH₃', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'How many distinct ¹H environments are in ethyl acetate?',
        type: 'numeric', correct: 3,
        explanation: 'There are 3 environments: CH₃CO– (acetyl methyl, δ 2.05), –OCH₂– (quartet, δ 4.12), and –CH₂CH₃ (methyl, δ 1.25). The acetyl CH₃ has no neighbors → singlet. The OCH₂ has 3 neighbors (CH₃) → quartet. The terminal CH₃ has 2 neighbors (CH₂) → triplet.',
      },
      {
        stem: 'The –OCH₂– protons (δ 4.12) appear as what splitting pattern?',
        type: 'mc', options: ['singlet', 'doublet', 'triplet', 'quartet'], correct: 'quartet',
        explanation: 'The OCH₂ has 2 protons. By the n+1 rule, n = 3 (from adjacent CH₃) gives a quartet (4 lines). Integration ratio is 2H:3H:3H = 2:3:3.',
      },
    ],
  },
  {
    title: '¹H NMR — 1-Bromopropane (BrCH₂CH₂CH₃)',
    compound: '1-Bromopropane',
    smiles: 'CCCBr',
    peaks: [
      { x: 3.40, y: 0.8, label: 'BrCH₂–', width: 0.06, splitting: 'triplet', integration: 2 },
      { x: 1.88, y: 0.8, label: '–CH₂–', width: 0.06, splitting: 'multiplet', integration: 2 },
      { x: 1.03, y: 0.8, label: '–CH₃', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    questions: [
      {
        stem: 'What is the splitting of the BrCH₂– protons at δ 3.40?',
        type: 'mc', options: ['singlet', 'doublet', 'triplet', 'quartet'], correct: 'triplet',
        explanation: 'The BrCH₂ has 2 protons. Its neighbors are the middle CH₂ (2 protons). By n+1 rule: n = 2 → triplet. Note: the middle CH₂ couples with both neighboring groups, giving a complex multiplet.',
      },
      {
        stem: 'The integration ratio BrCH₂ : CH₂ : CH₃ is:',
        type: 'mc', options: ['2:2:3', '1:1:1.5', '3:3:2', '1:2:3'], correct: '2:2:3',
        explanation: 'Integration reflects number of protons: BrCH₂ (2H) : CH₂ (2H) : CH₃ (3H) = 2:2:3.',
      },
    ],
  },
  {
    title: '¹H NMR — Diethyl ether ((CH₃CH₂)₂O)',
    compound: 'Diethyl ether',
    smiles: 'CCOCC',
    peaks: [
      { x: 3.47, y: 0.8, label: '–OCH₂–', width: 0.06, splitting: 'quartet', integration: 4 },
      { x: 1.21, y: 0.8, label: '–CH₃', width: 0.06, splitting: 'triplet', integration: 6 },
    ],
    questions: [
      {
        stem: 'How many ¹H NMR signals does diethyl ether give?',
        type: 'mc', options: ['1', '2', '3', '4'], correct: '2',
        explanation: 'The two CH₂ groups are equivalent (symmetry of the molecule), and the two CH₃ groups are equivalent. So there are only 2 distinct environments: –OCH₂– (δ 3.47, quartet) and –CH₃ (δ 1.21, triplet). Integration ratio is 4H:6H = 2:3.',
      },
      {
        stem: 'The –OCH₂– protons appear as a quartet because:',
        type: 'mc',
        options: [
          'They have 3 equivalent neighbors (the CH₃ group)',
          'They have 4 equivalent neighbors',
          'They are adjacent to oxygen',
          'They couple with each other',
        ],
        correct: 'They have 3 equivalent neighbors (the CH₃ group)',
        explanation: 'n+1 rule: the OCH₂ has 3 neighboring H atoms (from CH₃). Therefore n = 3, giving n+1 = 4 lines = quartet. Equivalent protons do not split each other — the OCH₂ protons couple with CH₃, not with each other.',
      },
    ],
  },
  {
    title: '¹H NMR — Acetaldehyde (CH₃CHO)',
    compound: 'Acetaldehyde',
    smiles: 'CC=O',
    peaks: [
      { x: 9.80, y: 0.8, label: 'CHO', width: 0.06, splitting: 'quartet', integration: 1 },
      { x: 2.20, y: 0.8, label: 'CH₃–', width: 0.06, splitting: 'doublet', integration: 3 },
    ],
    questions: [
      {
        stem: 'The CHO proton at δ 9.80 appears as a quartet because:',
        type: 'mc',
        options: [
          'It has 3 neighbors (the CH₃ group)',
          'It has 4 neighbors',
          'Aldehyde protons are always quartets',
          'It couples with the carbonyl oxygen',
        ],
        correct: 'It has 3 neighbors (the CH₃ group)',
        explanation: 'The CHO proton has 3 vicinal neighbors (the CH₃, even though they are separated by 2 bonds in one direction — but for CHO, coupling through the C=O to CH₃ gives n+1 = 4, a quartet). The aldehyde H appears far downfield (~9–10 ppm) due to deshielding by the carbonyl.',
      },
      {
        stem: 'Why does the aldehyde CHO proton appear so far downfield (~9.8 ppm)?',
        type: 'mc',
        options: [
          'The electron-withdrawing C=O deshields the H',
          'Aldehydes are in the sp³ region',
          'It has more neighbors',
          'It is a strongly shielded proton',
        ],
        correct: 'The electron-withdrawing C=O deshields the H',
        explanation: 'The carbonyl group (C=O) strongly withdraws electron density from the attached H, deshielding it significantly. Deshielded protons resonate at larger δ values (downfield). Aldehyde H is one of the most downfield C–H protons in organic chemistry.',
      },
    ],
  },
]

function pickRandom(): NMRProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export default function NMRInterpretationPractice() {
  const [problem, setProblem] = useState<NMRProblem>(pickRandom)
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState<string>('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const q = problem.questions[qIdx]
  const correct = q.type === 'numeric'
    ? parseInt(answer, 10) === q.correct
    : answer === q.correct

  function handleCheck() {
    if (!answer || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    if (qIdx < problem.questions.length - 1) {
      setQIdx(i => i + 1)
      setAnswer('')
      setChecked(false)
    } else {
      setProblem(pickRandom())
      setQIdx(0)
      setAnswer('')
      setChecked(false)
    }
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

      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm font-semibold text-primary">{problem.title}</p>
        <div className="flex gap-2 text-[10px] font-mono text-dim">
          {problem.peaks.map(p => (
            <span key={p.x} className="px-1.5 py-0.5 rounded" style={{ background: 'rgb(var(--color-surface))' }}>
              δ {p.x} {p.splitting && `(${p.splitting}, ${p.integration}H)`}
            </span>
          ))}
        </div>
      </div>

      {problem.smiles && (
        <div className="flex justify-start">
          <CompoundDisplay smiles={problem.smiles} label={problem.compound} width={180} height={130} />
        </div>
      )}

      <SpectrumViewer type="1h_nmr" peaks={problem.peaks} width={520} height={200} />

      {/* Question */}
      <div className="rounded-sm border border-border p-4 flex flex-col gap-3" style={{ background: 'rgb(var(--color-raised))' }}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Question {qIdx + 1} of {problem.questions.length}</span>
        </div>
        <p className="font-sans text-sm text-primary font-medium">{q.stem}</p>

        {q.type === 'mc' && q.options && (
          <div className="flex flex-col gap-2">
            {q.options.map(opt => {
              const isSelected = answer === opt
              const isCorrect = opt === q.correct
              let borderColor = 'rgb(var(--color-border))'
              let bg = 'rgb(var(--color-surface))'
              if (checked) {
                if (isCorrect) { borderColor = 'rgb(34 197 94)'; bg = 'rgb(34 197 94 / 0.08)' }
                else if (isSelected) { borderColor = 'rgb(239 68 68)'; bg = 'rgb(239 68 68 / 0.08)' }
              } else if (isSelected) {
                borderColor = 'var(--c-halogen)'
                bg = 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-surface)))'
              }
              return (
                <button key={opt} onClick={() => !checked && setAnswer(opt)} disabled={checked}
                  className="px-3 py-2 rounded-sm border text-left font-sans text-xs transition-colors"
                  style={{ borderColor, background: bg, color: 'rgb(var(--overlay)/0.8)' }}>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {q.type === 'numeric' && (
          <input type="text" inputMode="numeric" value={answer}
            onChange={e => !checked && setAnswer(e.target.value)}
            disabled={checked}
            placeholder="Enter number"
            className="w-24 px-3 py-1.5 rounded-sm border border-border font-mono text-sm text-primary bg-surface focus:outline-none" />
        )}
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
            {qIdx < problem.questions.length - 1 ? 'Next Question' : 'Next Problem'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-3 flex flex-col gap-1.5 ${correct ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
              {correct ? '✓ Correct!' : `✗ Answer: ${q.correct}`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

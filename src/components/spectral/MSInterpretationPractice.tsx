import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpectrumViewer, { type Peak } from './SpectrumViewer'
import CompoundDisplay from '../shared/CompoundDisplay'

interface MSQuestion {
  stem: string
  type: 'mc' | 'numeric'
  options?: string[]
  correct: string | number
  explanation: string
}

interface MSProblem {
  title: string
  compound: string
  formula: string
  smiles?: string
  peaks: Peak[]
  questions: MSQuestion[]
}

function dou(c: number, h: number, n = 0, x = 0): number {
  return (2 * c + 2 + n - h - x) / 2
}

const PROBLEMS: MSProblem[] = [
  {
    title: 'Mass Spectrum — Unknown compound (MW = 58)',
    compound: 'Acetone (CH₃COCH₃)',
    formula: 'C₃H₆O',
    smiles: 'CC(=O)C',
    peaks: [
      { x: 58,  y: 0.5,  label: 'M⁺ (58)', width: 0.5 },
      { x: 43,  y: 1.0,  label: 'base (43)', width: 0.5 },
      { x: 15,  y: 0.35, label: '15 (CH₃⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'What is the molecular weight of this compound?',
        type: 'numeric', correct: 58,
        explanation: 'The molecular ion peak (M⁺) is the highest m/z peak (not counting isotope peaks). M⁺ = 58 g/mol. This is the molecular weight of the compound.',
      },
      {
        stem: 'The degree of unsaturation (DoU) for C₃H₆O is:',
        type: 'numeric', correct: dou(3, 6, 0, 0),
        explanation: `DoU = (2C + 2 + N − H − X) / 2 = (2×3 + 2 + 0 − 6 − 0) / 2 = (8−6)/2 = 1. One degree of unsaturation = one ring or one π bond. The C=O of the ketone accounts for this.`,
      },
      {
        stem: 'The base peak at m/z = 43 represents:',
        type: 'mc',
        options: ['CH₃CO⁺ (acetyl cation, 43)', 'C₃H₇⁺ (propyl cation, 43)', 'CHO⁺ (29)', 'CH₂=CHOH⁺ (44)'],
        correct: 'CH₃CO⁺ (acetyl cation, 43)',
        explanation: 'Loss of 15 (CH₃) from M⁺ (58) gives 43. The CH₃CO⁺ (acylium ion) at m/z = 43 is characteristic of methyl ketones. α-cleavage next to the carbonyl is a common fragmentation pathway.',
      },
    ],
  },
  {
    title: 'Mass Spectrum — Compound with isotope pattern',
    compound: '1-Bromopropane (CH₃CH₂CH₂Br)',
    formula: 'C₃H₇Br',
    smiles: 'CCCBr',
    peaks: [
      { x: 122, y: 0.5,  label: 'M⁺ (⁷⁹Br)', width: 0.5 },
      { x: 124, y: 0.5,  label: 'M+2 (⁸¹Br)', width: 0.5 },
      { x: 43,  y: 1.0,  label: 'base (43)', width: 0.5 },
      { x: 41,  y: 0.6,  label: '41', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The M⁺ and M+2 peaks at m/z = 122 and 124 in 1:1 ratio indicate:',
        type: 'mc',
        options: ['One bromine atom present', 'One chlorine atom present', 'Two bromine atoms present', 'One sulfur atom present'],
        correct: 'One bromine atom present',
        explanation: '⁷⁹Br and ⁸¹Br have nearly equal natural abundance (~50% each). One Br gives M and M+2 peaks in a ~1:1 ratio. Chlorine (³⁵Cl/³⁷Cl) gives M:M+2 in ~3:1. This 1:1 ratio is the classic "bromine signature."',
      },
      {
        stem: 'What is the molecular formula mass for ⁷⁹Br (C₃H₇⁷⁹Br)?',
        type: 'numeric', correct: 122,
        explanation: '3(12) + 7(1) + 79 = 36 + 7 + 79 = 122. The M+2 peak at 124 contains ⁸¹Br instead. The 2 mass unit difference is because ⁸¹Br is 2 amu heavier than ⁷⁹Br.',
      },
    ],
  },
  {
    title: 'Mass Spectrum — Nitrogen-containing compound (MW = 45)',
    compound: 'Ethylamine (CH₃CH₂NH₂)',
    formula: 'C₂H₇N',
    smiles: 'CCN',
    peaks: [
      { x: 45, y: 0.4, label: 'M⁺ (45)', width: 0.5 },
      { x: 44, y: 1.0, label: 'base (M−1)', width: 0.5 },
      { x: 30, y: 0.8, label: '30 (CH₂=NH₂⁺)', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The odd molecular weight (MW = 45) suggests:',
        type: 'mc',
        options: ['Odd number of nitrogen atoms', 'Even number of nitrogen atoms', 'Presence of bromine', 'Presence of chlorine'],
        correct: 'Odd number of nitrogen atoms',
        explanation: 'The Nitrogen Rule: compounds with an ODD molecular weight (M⁺ at odd m/z) contain an ODD number of nitrogen atoms (1, 3, 5...). Even MW = zero or even number of N. C₂H₇N has MW = 2(12)+7+14 = 45 — odd, one N, consistent with amine.',
      },
      {
        stem: 'The degree of unsaturation for C₂H₇N is:',
        type: 'numeric', correct: dou(2, 7, 1),
        explanation: `DoU = (2×2 + 2 + 1 − 7) / 2 = (4+2+1−7)/2 = 0/2 = 0. Zero degrees of unsaturation means no rings and no π bonds — consistent with a simple amine.`,
      },
    ],
  },
  {
    title: 'Mass Spectrum — Aromatic compound (MW = 92)',
    compound: 'Toluene (C₆H₅CH₃)',
    formula: 'C₇H₈',
    smiles: 'Cc1ccccc1',
    peaks: [
      { x: 92, y: 0.7, label: 'M⁺ (92)', width: 0.5 },
      { x: 91, y: 1.0, label: 'base (91, tropylium)', width: 0.5 },
      { x: 65, y: 0.4, label: '65', width: 0.5 },
    ],
    questions: [
      {
        stem: 'The degree of unsaturation for toluene (C₇H₈) is:',
        type: 'numeric', correct: dou(7, 8),
        explanation: 'DoU = (2×7 + 2 − 8) / 2 = (14+2−8)/2 = 8/2 = 4. DoU = 4 accounts for the benzene ring (1 ring + 3 π bonds = 4). This immediately suggests an aromatic ring.',
      },
      {
        stem: 'The base peak at m/z = 91 (loss of 1 from M⁺) represents:',
        type: 'mc',
        options: ['Tropylium cation (C₇H₇⁺)', 'Phenyl cation (C₆H₅⁺, m/z=77)', 'CH₃⁺', 'C₅H₅⁺'],
        correct: 'Tropylium cation (C₇H₇⁺)',
        explanation: 'Loss of H from toluene M⁺ (92) gives the tropylium cation C₇H₇⁺ (m/z = 91). The tropylium cation is a stable 7-membered aromatic ring cation. Benzylic cleavage and rearrangement to tropylium is extremely common in alkylbenzenes.',
      },
    ],
  },
]

function pickRandom(): MSProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export default function MSInterpretationPractice() {
  const [problem, setProblem] = useState<MSProblem>(pickRandom)
  const [qIdx, setQIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const q = problem.questions[qIdx]
  const correct = q.type === 'numeric'
    ? parseFloat(answer) === q.correct
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

      {/* Quick reference */}
      <div className="grid grid-cols-2 gap-2 text-xs font-sans">
        {[
          { label: 'DoU formula', val: '(2C+2+N−H−X)/2' },
          { label: 'Br isotope', val: 'M:M+2 ≈ 1:1' },
          { label: 'Cl isotope', val: 'M:M+2 ≈ 3:1' },
          { label: 'N rule', val: 'Odd MW → odd # N' },
        ].map(r => (
          <div key={r.label} className="rounded-sm border border-border px-3 py-1.5 flex gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <span className="text-dim">{r.label}:</span>
            <span className="font-mono text-primary">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm font-semibold text-primary">{problem.title}</p>
        <p className="font-sans text-xs text-secondary">Formula: <span className="font-mono">{problem.formula}</span></p>
      </div>

      {problem.smiles && (
        <div className="flex justify-start">
          <CompoundDisplay smiles={problem.smiles} label={problem.compound} width={180} height={130} />
        </div>
      )}

      <SpectrumViewer type="mass_spec" peaks={problem.peaks} width={520} height={200} />

      {/* Question */}
      <div className="rounded-sm border border-border p-4 flex flex-col gap-3" style={{ background: 'rgb(var(--color-raised))' }}>
        <span className="font-mono text-[10px] text-dim uppercase tracking-widest">Question {qIdx + 1} of {problem.questions.length}</span>
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
          <input type="text" inputMode="decimal" value={answer}
            onChange={e => !checked && setAnswer(e.target.value)}
            disabled={checked}
            placeholder="Enter number"
            className="w-28 px-3 py-1.5 rounded-sm border border-border font-mono text-sm text-primary bg-surface focus:outline-none" />
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
            <p className={`font-sans text-sm font-semibold ${correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-400'}`}>
              {correct ? '✓ Correct!' : `✗ Answer: ${q.correct}`}
            </p>
            <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

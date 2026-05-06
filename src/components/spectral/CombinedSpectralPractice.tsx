import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpectrumViewer, { type Peak } from './SpectrumViewer'
import CompoundDisplay from '../shared/CompoundDisplay'

interface CombinedProblem {
  title: string
  compound: string
  formula: string
  smiles?: string
  mw: number
  dou: number
  irPeaks: Peak[]
  nmrPeaks: Peak[]
  msPeaks: Peak[]
  irSummary: string
  nmrSummary: string
  msSummary: string
  candidates: string[]
  correct: string
  workflow: string[]
}

const PROBLEMS: CombinedProblem[] = [
  {
    title: 'Identify the compound from combined spectral data',
    compound: 'Ethanol (CH₃CH₂OH)',
    formula: 'C₂H₆O',
    smiles: 'CCO',
    mw: 46,
    dou: 0,
    irPeaks: [
      { x: 3350, y: 0.85, label: 'O–H broad', width: 350 },
      { x: 2960, y: 0.50, label: 'C–H sp³', width: 60 },
    ],
    nmrPeaks: [
      { x: 3.69, y: 0.7, label: 'OH', width: 0.1, splitting: 'singlet (broad)', integration: 1 },
      { x: 3.51, y: 0.8, label: 'CH₂', width: 0.06, splitting: 'quartet', integration: 2 },
      { x: 1.17, y: 0.8, label: 'CH₃', width: 0.06, splitting: 'triplet', integration: 3 },
    ],
    msPeaks: [
      { x: 46, y: 0.2, label: 'M⁺ (46)', width: 0.5 },
      { x: 45, y: 0.8, label: 'M−1 (45)', width: 0.5 },
      { x: 31, y: 1.0, label: 'base (31)', width: 0.5 },
    ],
    irSummary: 'Broad O–H stretch at ~3350 cm⁻¹ (alcohol). Sp³ C–H at 2960 cm⁻¹. No C=O.',
    nmrSummary: 'Three signals: OH (1H, singlet), CH₂ (2H, quartet), CH₃ (3H, triplet). Pattern: –CH₂CH₃ next to O.',
    msSummary: 'MW = 46. No halogen isotope pattern. Base peak 31 = CH₂OH⁺ (loss of CH₃ from M).',
    candidates: ['Methanol (CH₃OH, MW=32)', 'Ethanol (CH₃CH₂OH, MW=46)', 'Diethyl ether ((C₂H₅)₂O, MW=74)', 'Acetic acid (CH₃COOH, MW=60)'],
    correct: 'Ethanol (CH₃CH₂OH, MW=46)',
    workflow: [
      'Step 1 (MS): MW = 46. C₂H₆O has MW=46. DoU=(2×2+2−6)/2=0 → no rings or π bonds.',
      'Step 2 (IR): Broad O–H at ~3350 cm⁻¹ → alcohol. No C=O peak (1700–1800 absent).',
      'Step 3 (¹H NMR): 3 signals at δ 3.69 (1H, OH), 3.51 (2H, quartet), 1.17 (3H, triplet). Quartet+triplet = ethyl group. Integration 1:2:3 matches CH₃CH₂OH.',
      'Step 4: Assemble: MW=46, alcohol, ethyl group → ethanol. Consistent with all spectra.',
    ],
  },
  {
    title: 'Identify the compound from combined spectral data',
    compound: 'Acetone (CH₃COCH₃)',
    formula: 'C₃H₆O',
    smiles: 'CC(=O)C',
    mw: 58,
    dou: 1,
    irPeaks: [
      { x: 2960, y: 0.45, label: 'C–H sp³', width: 60 },
      { x: 1715, y: 0.97, label: 'C=O ketone', width: 50 },
    ],
    nmrPeaks: [
      { x: 2.17, y: 0.9, label: '(CH₃)₂CO', width: 0.06, splitting: 'singlet', integration: 6 },
    ],
    msPeaks: [
      { x: 58, y: 0.45, label: 'M⁺ (58)', width: 0.5 },
      { x: 43, y: 1.0,  label: 'base (43)', width: 0.5 },
      { x: 15, y: 0.35, label: '15 (CH₃⁺)', width: 0.5 },
    ],
    irSummary: 'Strong C=O at 1715 cm⁻¹ (ketone). sp³ C–H at 2960. No O–H.',
    nmrSummary: 'Only ONE signal at δ 2.17 (6H, singlet). Both methyls equivalent by symmetry.',
    msSummary: 'MW=58. Base peak 43 = CH₃CO⁺ (acetyl cation). Loss of CH₃ (15) from M.',
    candidates: ['Propanal (CH₃CH₂CHO, MW=58)', 'Acetone (CH₃COCH₃, MW=58)', 'Allyl alcohol (C₃H₆O, MW=58)', 'Methyl acetate (C₃H₆O₂, MW=74)'],
    correct: 'Acetone (CH₃COCH₃, MW=58)',
    workflow: [
      'Step 1 (MS): MW=58, formula C₃H₆O. DoU=(2×3+2−6)/2=1 → one π bond.',
      'Step 2 (IR): C=O at 1715 cm⁻¹ accounts for the DoU. No O–H → not alcohol or carboxylic acid. Ketone or aldehyde.',
      'Step 3 (¹H NMR): Only ONE signal at δ 2.17 (6H, singlet). A singlet means no neighboring H. 6H equivalent methyls with no neighbors → (CH₃)₂CO. Aldehyde would show CHO peak near δ 9–10 ppm.',
      'Step 4: MW=58, ketone C=O, 6H singlet → acetone. MS confirms: base peak 43 = CH₃CO⁺.',
    ],
  },
]

function pickRandom(): CombinedProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

type Step = 'ir' | 'nmr' | 'ms' | 'identify'

const STEPS: { id: Step; label: string }[] = [
  { id: 'ir',       label: '1. IR' },
  { id: 'nmr',      label: '2. NMR' },
  { id: 'ms',       label: '3. MS' },
  { id: 'identify', label: '4. Identify' },
]

export default function CombinedSpectralPractice() {
  const [problem, setProblem] = useState<CombinedProblem>(pickRandom)
  const [step, setStep] = useState<Step>('ir')
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [workflowOpen, setWorkflowOpen] = useState(false)

  const correct = answer === problem.correct

  function handleCheck() {
    if (!answer || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setStep('ir')
    setAnswer('')
    setChecked(false)
    setWorkflowOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'rgb(var(--color-success))' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm font-semibold text-primary">{problem.title}</p>
        <div className="flex gap-3 text-xs font-mono text-dim">
          <span>Formula: {problem.formula}</span>
          <span>MW: {problem.mw}</span>
          <span>DoU: {problem.dou}</span>
        </div>
      </div>

      {/* Workflow step tabs */}
      <div className="flex gap-1 p-1 rounded-sm self-start" style={{ background: 'rgb(var(--color-surface))' }}>
        {STEPS.map(s => {
          const isActive = step === s.id
          return (
            <button key={s.id} onClick={() => setStep(s.id)}
              className="px-3 py-1 rounded-sm text-xs font-sans font-medium transition-colors"
              style={isActive ? {
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                color: 'var(--c-halogen)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              } : { color: 'rgb(var(--overlay)/0.4)' }}>
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="flex flex-col gap-3">

          {step === 'ir' && (
            <>
              <SpectrumViewer type="ir" peaks={problem.irPeaks} width={520} height={200} />
              <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
                <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-1">IR Summary</p>
                <p className="font-sans text-xs text-secondary">{problem.irSummary}</p>
              </div>
            </>
          )}

          {step === 'nmr' && (
            <>
              <SpectrumViewer type="1h_nmr" peaks={problem.nmrPeaks} width={520} height={200} />
              <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
                <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-1">¹H NMR Summary</p>
                <p className="font-sans text-xs text-secondary">{problem.nmrSummary}</p>
              </div>
            </>
          )}

          {step === 'ms' && (
            <>
              <SpectrumViewer type="mass_spec" peaks={problem.msPeaks} width={520} height={200} />
              <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
                <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-1">MS Summary</p>
                <p className="font-sans text-xs text-secondary">{problem.msSummary}</p>
              </div>
            </>
          )}

          {step === 'identify' && (
            <div className="flex flex-col gap-4">
              <p className="font-sans text-sm text-primary font-medium">Based on all spectra, which compound is it?</p>
              <div className="flex flex-col gap-2">
                {problem.candidates.map(c => {
                  const isSelected = answer === c
                  const isCorrect = c === problem.correct
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
                    <button key={c} onClick={() => !checked && setAnswer(c)} disabled={checked}
                      className="px-3 py-2.5 rounded-sm border text-left font-sans text-sm transition-colors"
                      style={{ borderColor, background: bg, color: 'rgb(var(--overlay)/0.8)' }}>
                      {c}
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
                    Identify
                  </button>
                ) : (
                  <>
                    <button onClick={handleNext}
                      className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
                      style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                               color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
                      Next
                    </button>
                    <button onClick={() => setWorkflowOpen(o => !o)}
                      className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border border-border text-secondary hover:text-primary">
                      {workflowOpen ? 'Hide' : 'Show Workflow'}
                    </button>
                  </>
                )}
              </div>

              <AnimatePresence>
                {checked && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`rounded-sm border px-4 py-3 flex flex-col gap-3 font-sans text-sm font-semibold ${correct ? 'text-success feedback-success' : 'text-error feedback-error'}`}
                    style={{ background: correct ? 'rgb(34 197 94 / 0.06)' : 'rgb(239 68 68 / 0.06)' }}>
                    {correct ? '✓ Correct!' : `✗ The compound is ${problem.correct}`}
                    {problem.smiles && (
                      <div className="flex justify-start">
                        <CompoundDisplay smiles={problem.smiles} label={problem.compound} width={180} height={130} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {workflowOpen && checked && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
                    <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Systematic Workflow</p>
                    {problem.workflow.map((w, i) => (
                      <p key={i} className="font-sans text-xs text-secondary leading-relaxed">{w}</p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step !== 'identify' && (
        <button onClick={() => setStep('identify')}
          className="self-start px-4 py-1.5 rounded-sm text-xs font-sans font-medium border border-border text-secondary hover:text-primary">
          Skip to Identification →
        </button>
      )}
    </div>
  )
}
